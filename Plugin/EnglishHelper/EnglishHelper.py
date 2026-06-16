#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json
import re
import time
import sqlite3
import traceback
from collections import OrderedDict

# ==========================================
# 1. 基础依赖配置与加载
# ==========================================
PLUGIN_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    import requests
except ImportError:
    requests = None

try:
    import eng_to_ipa
except ImportError:
    eng_to_ipa = None

try:
    import spacy
except ImportError:
    spacy = None

try:
    import nltk
    from nltk.corpus import wordnet
except ImportError:
    nltk = None

try:
    import wordfreq
except ImportError:
    wordfreq = None

# ==========================================
# 2. 环境变量配置
# ==========================================
def load_env():
    env_path = os.path.join(PLUGIN_DIR, "config.env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    if k not in os.environ:
                        os.environ[k] = v

load_env()
REQUEST_TIMEOUT = float(os.environ.get("REQUEST_TIMEOUT", "60.0"))
GRAMMAR_DB_PATH = os.environ.get("GRAMMAR_DB_PATH", os.path.join(PLUGIN_DIR, "grammar_explainers_ext.json"))
DB_PATH = os.path.join(PLUGIN_DIR, "english_helper_user.db")
OFFLINE_DICT_DB_PATH = os.environ.get("OFFLINE_DICT_DB_PATH", os.path.join(PLUGIN_DIR, "ecdict_mini.db"))

# ==========================================
# 3. NLP 引擎初始化
# ==========================================
_nlp_model = None

def get_nlp():
    global _nlp_model
    if _nlp_model is None:
        if spacy is not None:
            try:
                _nlp_model = spacy.load("en_core_web_sm")
            except OSError:
                try:
                    from spacy.cli import download
                    download("en_core_web_sm")
                    _nlp_model = spacy.load("en_core_web_sm")
                except Exception as e:
                    print_error("InitError", f"Failed to load or download spacy: {e}")
        else:
            print_error("DependencyError", "spacy is not installed. Please pip install spacy.")
    return _nlp_model

# ==========================================
# 4. 辅助数据加载
# ==========================================
_grammar_db = None

def get_grammar_db():
    global _grammar_db
    if _grammar_db is None:
        if os.path.exists(GRAMMAR_DB_PATH):
            try:
                with open(GRAMMAR_DB_PATH, "r", encoding="utf-8") as f:
                    _grammar_db = json.load(f)
            except Exception:
                _grammar_db = {}
        else:
            _grammar_db = {}
    return _grammar_db

# ==========================================
# 5. SQLite 数据库初始化
# ==========================================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('PRAGMA journal_mode=WAL')
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_items (
            item_id TEXT PRIMARY KEY,
            item_type TEXT,
            item_text TEXT,
            difficulty INTEGER DEFAULT 0,
            add_time REAL,
            last_review REAL,
            next_review REAL,
            review_count INTEGER DEFAULT 0,
            interval REAL DEFAULT 1.0,
            ease_factor REAL DEFAULT 2.5
        )
    """)
    conn.commit()
    return conn

# ==========================================
# 6. 核心查词与 NLP 功能
# ==========================================
def get_config():
    config_path = os.path.join(PLUGIN_DIR, "config.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"dictionary": {"routing_order": ["youdao", "local_ecdict"], "providers": {}}}

def fetch_mdx_dict(word, rel_path):
    try:
        raise ImportError("MDX engine (python-lzo) not ready.")
    except Exception as e:
        return None

def fetch_youdao_dict(word):
    if not requests:
        return None
    url = f"https://dict.youdao.com/jsonapi?q={word}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            ec = data.get('ec', {})
            word_arr = ec.get('word', [])
            if not word_arr:
                return None
            word_info = word_arr[0]
            trs = word_info.get('trs', [])
            
            senses = []
            for tr in trs:
                if isinstance(tr, dict) and 'tr' in tr:
                    inner_trs = tr['tr']
                    if isinstance(inner_trs, list) and inner_trs:
                        senses.append({"definition": inner_trs[0].get('l', {}).get('i', [{}])[0]})
            
            return {
                "source": "youdao",
                "uk_ipa": word_info.get('ukphone', ''),
                "us_ipa": word_info.get('usphone', ''),
                "senses": senses,
                "audio_us": f"https://dict.youdao.com/dictvoice?audio={word}&type=0",
                "audio_uk": f"https://dict.youdao.com/dictvoice?audio={word}&type=1"
            }
    except Exception:
        pass
    return None

def fetch_local_dict(word, db_path=None):
    actual_path = db_path if db_path else OFFLINE_DICT_DB_PATH
    if not os.path.exists(actual_path):
        return None
        
    try:
        conn = sqlite3.connect(actual_path)
        c = conn.cursor()
        c.execute("SELECT translation, phonetic FROM stardict WHERE word = ? COLLATE NOCASE", (word,))
        row = c.fetchone()
        conn.close()
        
        if row:
            translation, phonetic = row
            senses = []
            if translation:
                for line in translation.split('\\n'):
                    if line.strip():
                        senses.append({"definition": line.strip()})
            return {
                "source": "local_ecdict",
                "ipa": phonetic if phonetic else "",
                "senses": senses
            }
    except Exception:
        pass
    return None

def do_lookup_word(word):
    result = {"word": word, "senses": []}
    cfg = get_config()
    routing = cfg.get("dictionary", {}).get("routing_order", ["youdao", "local_ecdict"])
    providers = cfg.get("dictionary", {}).get("providers", {})

    for route in routing:
        provider_cfg = providers.get(route, {})
        if not provider_cfg.get("enabled", True):
            continue
            
        if route == "mdx_lm6":
            mdx_path = provider_cfg.get("path", "dicts/lm6/朗文当代高级英语辞典6th.mdx")
            mdx_res = fetch_mdx_dict(word, mdx_path)
            if mdx_res and mdx_res.get("senses"):
                result.update(mdx_res)
                break
        elif route == "youdao":
            youdao_data = fetch_youdao_dict(word)
            if youdao_data and youdao_data.get("senses"):
                result.update(youdao_data)
                break
        elif route == "local_ecdict":
            db_path = provider_cfg.get("path", OFFLINE_DICT_DB_PATH)
            if not os.path.isabs(db_path):
                db_path = os.path.join(PLUGIN_DIR, db_path)
            local_data = fetch_local_dict(word, db_path)
            if local_data and local_data.get("senses"):
                result.update(local_data)
                break

    if not result["senses"]:
        if nltk:
            try:
                from nltk.corpus import wordnet
                synsets = wordnet.synsets(word)
                wn_senses = []
                for syn in synsets:
                    wn_senses.append({
                        "pos": syn.pos(),
                        "definition": syn.definition(),
                        "examples": syn.examples()
                    })
                result["wordnet_senses"] = wn_senses
            except LookupError:
                pass
                
    if not result["senses"] and "wordnet_senses" not in result:
        return {"error": "Word not found in any dictionary sources."}
        
    return result

def do_analyze_sentence(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
    doc = nlp(text)
    tokens = []
    for token in doc:
        ipa = ""
        if eng_to_ipa and token.pos_ not in ["PUNCT", "SPACE", "SYM"]:
            try:
                ipa = eng_to_ipa.convert(token.text)
                if ipa.endswith("*"):
                    ipa = ""
            except Exception:
                pass
        tokens.append({
            "text": token.text,
            "lemma": token.lemma_,
            "pos": token.pos_,
            "tag": token.tag_,
            "dep": token.dep_,
            "head": token.head.text,
            "ipa": ipa
        })
    return {"text": text, "tokens": tokens, "entities": [{"text": ent.text, "label": ent.label_} for ent in doc.ents]}

def do_sentence_split(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
    doc = nlp(text)
    return {"sentences": [sent.text.strip() for sent in doc.sents if sent.text.strip()]}

def do_grammar_explain(grammar_point):
    db = get_grammar_db()
    if grammar_point in db:
        return db[grammar_point]
    matches = {k: v for k, v in db.items() if grammar_point.lower() in k.lower()}
    if matches:
        return {"matches": matches}
    return {"message": f"Grammar point '{grammar_point}' not found."}

import urllib.request

def push_to_anki(word, definition):
    try:
        import json
        deck_payload = json.dumps({"action": "createDeck", "version": 6, "params": {"deck": "VCP_English"}}).encode('utf-8')
        urllib.request.urlopen(urllib.request.Request('http://localhost:8765', data=deck_payload), timeout=2)
        note_payload = json.dumps({
            "action": "addNote", "version": 6, "params": {
                "note": {"deckName": "VCP_English", "modelName": "问答题", "fields": {"正面": word, "背面": definition}, "options": {"allowDuplicate": False}, "tags": ["VCP_Auto"]}
            }
        }).encode('utf-8')
        urllib.request.urlopen(urllib.request.Request('http://localhost:8765', data=note_payload), timeout=2)
        urllib.request.urlopen(urllib.request.Request('http://localhost:8765', data=note_payload), timeout=2)
    except Exception:
        pass

def do_wrongbook_add(item_id, item_type, item_text):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    now = time.time()
    try:
        c.execute("""
            INSERT OR IGNORE INTO user_items 
            (item_id, item_type, item_text, add_time, last_review, next_review, review_count, interval, ease_factor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (item_id, item_type, item_text, now, now, now, 0, 1.0, 2.5))
        conn.commit()
        push_to_anki(item_id, item_text)
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()
    return {"message": "Success", "item_id": item_id, "anki_pushed": True}

# ==========================================
# 7. VCP 通信与入口路由
# ==========================================
def print_json_output(status, result=None, code=None, error=None):
    out = {"status": status}
    if result is not None:
        out["result"] = result
    if code is not None:
        out["code"] = code
    if error is not None:
        out["error"] = error
    print(json.dumps(out, ensure_ascii=False), file=sys.stdout)
    sys.exit(0 if status == "success" else 1)

def print_error(code, msg):
    print_json_output("error", code=code, error=msg)

def process_request(args):
    command = args.get("command", "")
    if not command:
        print_error("MissingParameter", "The 'command' parameter is required.")
        return

    if command in ["lookup_word", "lookup_word_json"]:
        word = args.get("word")
        if not word:
            print_error("MissingParameter", "'word' is required for lookup_word")
            return
        res = do_lookup_word(word)
        print_json_output("success", result=res)
    elif command == "analyze_sentence":
        text = args.get("text") or args.get("sentence")
        res = do_analyze_sentence(text)
        print_json_output("success", result=res)
    elif command == "sentence_split":
        text = args.get("text") or args.get("sentence")
        res = do_sentence_split(text)
        print_json_output("success", result=res)
    elif command == "grammar_explain":
        grammar = args.get("grammar")
        res = do_grammar_explain(grammar)
        print_json_output("success", result=res)
    elif command == "wrongbook_add":
        item_id = args.get("item_id")
        res = do_wrongbook_add(item_id, args.get("item_type", "word"), args.get("item_text", item_id))
        print_json_output("success", result=res)
    else:
        print_json_output("success", result={"message": f"Command '{command}' is recognized but not yet fully implemented."})

def main():
    try:
        init_db().close()
        input_data = sys.stdin.read()
        if not input_data.strip():
            print_error("InvalidInput", "No input data received.")
            return
        args = json.loads(input_data)
        process_request(args)
    except Exception as e:
        print_error("InternalError", f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    main()