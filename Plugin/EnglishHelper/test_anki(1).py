import urllib.request
import json
import traceback

print('Testing AnkiConnect API...')
try:
    # 1. 测连接
    req = urllib.request.Request('http://localhost:8765')
    req.add_header('Content-Type', 'application/json')
    payload = json.dumps({'action': 'deckNames', 'version': 6}).encode('utf-8')
    response = urllib.request.urlopen(req, data=payload, timeout=3)
    print('Deck List Response:', response.read().decode('utf-8'))
    
    # 2. 模拟写入卡片
    word = "test_supersede"
    definition = "vt. 代替"
    note_payload = json.dumps({
        "action": "addNote", "version": 6, "params": {
            "note": {
                "deckName": "VCP_English", 
                "modelName": "Basic", 
                "fields": {"Front": word, "Back": definition}, 
                "options": {"allowDuplicate": False}, 
                "tags": ["VCP_Auto"]
            }
        }
    }).encode('utf-8')
    
    req2 = urllib.request.Request('http://localhost:8765')
    req2.add_header('Content-Type', 'application/json')
    resp2 = urllib.request.urlopen(req2, data=note_payload, timeout=3)
    print('Add Note Response:', resp2.read().decode('utf-8'))

except Exception as e:
    print('AnkiConnect Error:', str(e))
    traceback.print_exc()