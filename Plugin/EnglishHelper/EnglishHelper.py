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

# 尝试导入 NLP 库
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
# 离线词典数据库路径 (ECDICT SQLite)
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
                # 尝试加载较轻量的英文模型
                _nlp_model = spacy.load("en_core_web_sm")
            except OSError:
                # 如果没有下载，提示或尝试下载
                try:
                    from spacy.cli import download
                    download("en_core_web_sm")
                    _nlp_model = spacy.load("en_core_web_sm")
                except Exception as e:
                    print_error("InitError", f"Failed to load or download spacy en_core_web_sm: {e}")
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
# 5. SQLite 数据库初始化 (用户数据/错题本/复习)
# ==========================================
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('PRAGMA journal_mode=WAL')
    c = conn.cursor()
    # 词库/错题本表
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
# 6. 核心功能实现
# ==========================================
def do_analyze_sentence(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
    
    doc = nlp(text)
    tokens = []
    for token in doc:
        # 尝试获取单词的国际音标 (IPA)
        ipa = ""
        if eng_to_ipa and token.pos_ not in ["PUNCT", "SPACE", "SYM"]:
            try:
                ipa = eng_to_ipa.convert(token.text)
                if ipa.endswith("*"):  # eng_to_ipa 未找到的词会有星号
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
    
    return {
        "text": text,
        "tokens": tokens,
        "entities": [{"text": ent.text, "label": ent.label_} for ent in doc.ents]
    }

def do_sentence_split(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
    
    doc = nlp(text)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
    return {"sentences": sentences}

def do_reading_aid_v2(text, target_level="B1", oov_limit=10):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
        
    doc = nlp(text)
    tokens = []
    
    for token in doc:
        lemma = token.lemma_.lower()
        level = "A1"
        freq = 0.0
        
        if wordfreq and token.pos_ not in ["PUNCT", "SPACE", "SYM", "NUM"]:
            freq = wordfreq.zipf_frequency(lemma, 'en')
            # 根据 Zipf 频率粗略划分 CEFR 级别 (这只是一个启发式映射)
            if freq > 5.5:
                level = "A1"
            elif freq > 4.5:
                level = "A2"
            elif freq > 3.8:
                level = "B1"
            elif freq > 3.2:
                level = "B2"
            elif freq > 2.5:
                level = "C1"
            elif freq > 0:
                level = "C2"
                
        # 简单标记大于目标等级的单词为 OOV (Out of Vocabulary) 供高亮
        # 这里仅作字符串比较的粗略映射，实际需严格映射表 A1<A2<B1<B2<C1<C2
        # A 对应低级，B 中级，C 高级
        is_oov = False
        if token.pos_ not in ["PUNCT", "SPACE", "SYM", "NUM"]:
            is_oov = level > target_level
            
        tokens.append({
            "text": token.text,
            "lemma": lemma,
            "pos": token.pos_,
            "level": level,
            "zipf": round(freq, 2),
            "is_oov": is_oov
        })
        
    return {
        "text": text,
        "target_level": target_level,
        "tokens": tokens
    }

def fetch_youdao_dict(word):
    """Fallback dict lookup using Youdao's public translation API."""
    if not requests:
        return None
    url = f"https://dict.youdao.com/jsonapi?q={word}"
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            # 提取中英基本释义
            ec = data.get('ec', {})
            word_arr = ec.get('word', [])
            if not word_arr:
                return None
            word_info = word_arr[0]
            trs = word_info.get('trs', [])
            
            senses = []
            for tr in trs:
                # 提取有道API里的中文解释
                if isinstance(tr, dict) and 'tr' in tr:
                    inner_trs = tr['tr']
                    if isinstance(inner_trs, list) and inner_trs:
                        senses.append({"definition": inner_trs[0].get('l', {}).get('i', [{}])[0]})
            
            uk_phone = word_info.get('ukphone', '')
            us_phone = word_info.get('usphone', '')
            
            return {
                "source": "youdao",
                "uk_ipa": uk_phone,
                "us_ipa": us_phone,
                "senses": senses,
                "audio_us": f"https://dict.youdao.com/dictvoice?audio={word}&type=0",
                "audio_uk": f"https://dict.youdao.com/dictvoice?audio={word}&type=1"
            }
    except Exception:
        pass
    return None

def fetch_local_dict(word):
    """Fallback local dict lookup using ECDICT stardict sqlite format."""
    if not os.path.exists(OFFLINE_DICT_DB_PATH):
        return None
        
    try:
        conn = sqlite3.connect(OFFLINE_DICT_DB_PATH)
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
    
    # 首先尝试调用在线词典 (优先提供中英释义和发音)
    youdao_data = fetch_youdao_dict(word)
    if youdao_data:
        result.update(youdao_data)
        
    # 如果在线词典没查到或者异常，降级到本地离线词典 (ECDICT)
    if not result.get("senses"):
        local_data = fetch_local_dict(word)
        if local_data:
            result.update(local_data)
    
    # 如果没查到、或者想补充英文纯解析，再调用 NLTK/Wordnet
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

def do_grammar_explain(grammar_point):
    db = get_grammar_db()
    if grammar_point in db:
        return db[grammar_point]
    
    # 支持部分匹配
    matches = {k: v for k, v in db.items() if grammar_point.lower() in k.lower()}
    if matches:
        return {"matches": matches}
    
    return {"message": f"Grammar point '{grammar_point}' not found in local database."}

import random

def get_wordnet_distractors(word, pos):
    if not nltk:
        return []
    try:
        from nltk.corpus import wordnet
        # mapping spacy pos to wordnet pos
        wn_pos = wordnet.NOUN
        if pos == 'VERB':
            wn_pos = wordnet.VERB
        elif pos == 'ADJ':
            wn_pos = wordnet.ADJ
        elif pos == 'ADV':
            wn_pos = wordnet.ADV
            
        synsets = wordnet.synsets(word, pos=wn_pos)
        if not synsets:
            return []
            
        distractors = set()
        
        # 提取同义词集里的一些其他词（作为易混淆项）或者反义词
        for syn in synsets:
            for lemma in syn.lemmas():
                if lemma.name().lower() != word.lower():
                    distractors.add(lemma.name().replace('_', ' '))
                if lemma.antonyms():
                    for ant in lemma.antonyms():
                        distractors.add(ant.name().replace('_', ' '))
        
        return list(distractors)[:3]  # 最多取3个干扰项
    except Exception:
        return []

def do_quiz_generate(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
        
    doc = nlp(text)
    # 寻找可以挖空的词，优先 VERB, ADJ, NOUN
    candidate_tokens = [t for t in doc if t.pos_ in ["VERB", "ADJ", "NOUN"] and len(t.text) > 2]
    
    if not candidate_tokens:
        return {"error": "Sentence too simple to generate a quiz."}
        
    # 随机选一个作为答案
    target = random.choice(candidate_tokens)
    target_word = target.text
    masked_sentence = text[:target.idx] + "_____" + text[target.idx + len(target_word):]
    
    distractors = get_wordnet_distractors(target.lemma_, target.pos_)
    
    # 如果没找到智能混淆项，随便给点硬编码的默认混淆项（生产环境可以用高频词库随机）
    if not distractors:
        if target.pos_ == "VERB":
            distractors = ["do", "make", target_word + "s"]
        elif target.pos_ == "ADJ":
            distractors = ["good", "bad", target_word + "er"]
        else:
            distractors = ["thing", "people", target_word + "s"]
            
    # 保证选项不包含答案自己并且去重
    distractors = list(set([d for d in distractors if d.lower() != target_word.lower()]))[:3]
    
    options = distractors + [target_word]
    random.shuffle(options)
    
    return {
        "type": "fill_in_the_blank",
        "question": masked_sentence,
        "options": options,
        "answer": target_word,
        "explanation": f"The correct word is '{target_word}' (POS: {target.pos_})."
    }

def do_phrase_pattern(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
        
    doc = nlp(text)
    phrases = []
    
    for token in doc:
        # 提取 VERB + adp (介词) 组成的短语动词，比如 "depend on"
        if token.pos_ == "VERB":
            for child in token.children:
                if child.dep_ == "prep":
                    phrases.append(f"{token.lemma_} {child.lemma_}")
                    
        # 提取 VERB + dobj (动宾搭配)
                if child.dep_ == "dobj":
                    phrases.append(f"{token.lemma_} {child.lemma_}")
                    
        # 提取 ADJ + prep (形容词+介词搭配)，比如 "good at"
        if token.pos_ == "ADJ":
            for child in token.children:
                if child.dep_ == "prep":
                    phrases.append(f"{token.lemma_} {child.lemma_}")

    return {
        "text": text,
        "extracted_patterns": list(set(phrases))
    }

def do_rewrite_sentence(text, style="formal"):
    # 作为一个占位符功能，提示用户真正的重写可以用 LLM，但这里我们可以提供基础的同义词替换
    return {
        "message": "Sentence rewriting (paraphrasing) requires a seq2seq AI model which is not fully implemented in this local rule-based MVP. Please use VCP LLM tools for advanced rewriting.",
        "original_text": text,
        "requested_style": style
    }

# ==========================================
# 6.5 复习算法核心 (Ebbinghaus / SM2)
# ==========================================
def calculate_next_review_sm2(quality, current_interval, current_ease, review_count):
    """
    Simplified SM-2 algorithm.
    quality: 0-5. 0=Complete blackout, 5=Perfect response.
    Returns: (next_interval_days, new_ease_factor)
    """
    if quality < 3:
        # If the user failed, reset the interval
        return 1.0, current_ease
    
    if review_count == 0:
        next_interval = 1.0
    elif review_count == 1:
        next_interval = 6.0
    else:
        next_interval = current_interval * current_ease

    new_ease = current_ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ease = max(1.3, new_ease)
    
    return round(next_interval, 2), round(new_ease, 2)

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
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()
    return {"message": "Success", "item_id": item_id}

def do_review_submit(item_id, result_str, algo="sm2"):
    """
    result_str mapping to SM-2 quality (0-5):
    '忘记'/forget -> 1
    '模糊'/hard -> 3
    '记住'/remember -> 5
    """
    quality_map = {
        "忘记": 1, "forget": 1,
        "模糊": 3, "hard": 3,
        "记住": 5, "remember": 5
    }
    quality = quality_map.get(result_str.lower(), 3)
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT interval, ease_factor, review_count FROM user_items WHERE item_id = ?", (item_id,))
    row = c.fetchone()
    
    if not row:
        return {"error": f"Item {item_id} not found in user_items."}
        
    current_interval, current_ease, review_count = row
    
    next_interval, new_ease = calculate_next_review_sm2(quality, current_interval, current_ease, review_count)
    next_review_time = time.time() + next_interval * 86400
    
    c.execute("""
        UPDATE user_items
        SET last_review = ?, next_review = ?, review_count = ?, interval = ?, ease_factor = ?
        WHERE item_id = ?
    """, (time.time(), next_review_time, review_count + 1, next_interval, new_ease, item_id))
    
    conn.commit()
    conn.close()
    
    return {
        "item_id": item_id,
        "result": result_str,
        "new_interval_days": next_interval,
        "ease_factor": new_ease
    }

def do_review_due_list():
    now = time.time()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Fetch due items
    c.execute("SELECT item_id, item_type, item_text, next_review FROM user_items WHERE next_review <= ?", (now,))
    rows = c.fetchall()
    conn.close()
    
    due_items = [{"item_id": r[0], "type": r[1], "text": r[2]} for r in rows]
    return {"due_count": len(due_items), "items": due_items}

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

    # 根据命令进行分发
    if command == "analyze_sentence":
        text = args.get("text") or args.get("sentence")
        if not text:
            print_error("MissingParameter", "'text' is required for analyze_sentence")
            return
        res = do_analyze_sentence(text)
        print_json_output("success", result=res)
        
    elif command == "sentence_split":
        text = args.get("text") or args.get("sentence")
        if not text:
            print_error("MissingParameter", "'text' is required for sentence_split")
            return
        res = do_sentence_split(text)
        print_json_output("success", result=res)
        
    elif command == "reading_aid_v2":
        text = args.get("text") or args.get("sentence")
        target_level = args.get("target_level", "B1")
        oov_limit = args.get("oov_limit", 10)
        if not text:
            print_error("MissingParameter", "'text' is required for reading_aid_v2")
            return
        res = do_reading_aid_v2(text, target_level, oov_limit)
        print_json_output("success", result=res)
        
    elif command == "quiz_generate":
        text = args.get("text") or args.get("sentence")
        if not text:
            print_error("MissingParameter", "'text' is required for quiz_generate")
            return
        res = do_quiz_generate(text)
        print_json_output("success", result=res)
        
    elif command == "phrase_pattern":
        text = args.get("text") or args.get("sentence")
        if not text:
            print_error("MissingParameter", "'text' is required for phrase_pattern")
            return
        res = do_phrase_pattern(text)
        print_json_output("success", result=res)
        
    elif command == "rewrite_sentence":
        text = args.get("text") or args.get("sentence")
        style = args.get("style", "formal")
        if not text:
            print_error("MissingParameter", "'text' is required for rewrite_sentence")
            return
        res = do_rewrite_sentence(text, style)
        print_json_output("success", result=res)
        
    elif command in ["lookup_word", "lookup_word_json"]:
        word = args.get("word")
        if not word:
            print_error("MissingParameter", "'word' is required for lookup_word")
            return
        res = do_lookup_word(word)
        print_json_output("success", result=res)
        
    elif command in ["grammar_explain", "grammar_explain_deep"]:
        grammar = args.get("grammar")
        if not grammar:
            print_error("MissingParameter", "'grammar' is required for grammar_explain")
            return
        res = do_grammar_explain(grammar)
        print_json_output("success", result=res)
        
    elif command == "wrongbook_add":
        item_id = args.get("item_id")
        item_type = args.get("item_type", "word")
        item_text = args.get("item_text", item_id)
        if not item_id:
            print_error("MissingParameter", "'item_id' is required for wrongbook_add")
            return
        res = do_wrongbook_add(item_id, item_type, item_text)
        print_json_output("success", result=res)
        
    elif command == "review_submit":
        item_id = args.get("item_id")
        result_str = args.get("result", "记住")
        if not item_id:
            print_error("MissingParameter", "'item_id' is required for review_submit")
            return
        res = do_review_submit(item_id, result_str)
        if "error" in res:
            print_error("ReviewError", res["error"])
        else:
            print_json_output("success", result=res)
            
    elif command == "review_due_list":
        res = do_review_due_list()
        print_json_output("success", result=res)
        
    elif command.lower() == "health_check":
        status_info = {
            "spacy": spacy is not None,
            "nltk": nltk is not None,
            "db_path": DB_PATH,
            "grammar_db_loaded": _grammar_db is not None
        }
        print_json_output("success", result={"status": "ok", "info": status_info})
        
    else:
        # 处理尚未实现的命令
        print_json_output("success", result={"message": f"Command '{command}' is recognized but not yet fully implemented in this MVP layer."})

def main():
    try:
        conn = init_db()
        conn.close()
        input_data = sys.stdin.read()
        if not input_data.strip():
            print_error("InvalidInput", "No input data received.")
            return
        try:
            args = json.loads(input_data)
        except json.JSONDecodeError as e:
            print_error("InvalidJSON", f"Failed to parse JSON input: {e}")
            return
            
        process_request(args)
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        # 这里记录到日志，抛出简化错误给前端
        print_error("InternalError", f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    main()
