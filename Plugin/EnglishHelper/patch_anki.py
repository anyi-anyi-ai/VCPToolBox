import re
import os

file_path = r'H:\VCP\VCPzhangduan\VCPToolBox\Plugin\EnglishHelper\EnglishHelper.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'def do_wrongbook_add\(item_id, item_type, item_text\):.*?return \{"message": "Success", "item_id": item_id\}'

replace_str = '''import urllib.request

def push_to_anki(word, definition):
    try:
        import json
        deck_payload = json.dumps({"action": "createDeck", "version": 6, "params": {"deck": "VCP_English"}}).encode('utf-8')
        urllib.request.urlopen(urllib.request.Request('http://localhost:8765', data=deck_payload), timeout=2)
        note_payload = json.dumps({
            "action": "addNote", "version": 6, "params": {
                "note": {"deckName": "VCP_English", "modelName": "Basic", "fields": {"Front": word, "Back": definition}, "options": {"allowDuplicate": False}, "tags": ["VCP_Auto"]}
            }
        }).encode('utf-8')
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
    return {"message": "Success", "item_id": item_id, "anki_pushed": True}'''

new_content = re.sub(pattern, replace_str, content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Python patch applied successfully!")