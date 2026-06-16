import sys
import json
import urllib.request
import urllib.error
import time

# Force UTF-8 output for VCP compatibility
sys.stdout.reconfigure(encoding='utf-8')

def request_anki(action, params=None, retries=3):
    payload = {
        'action': action,
        'version': 6,
        'params': params or {}
    }
    data = json.dumps(payload).encode('utf-8')
    
    last_error = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request('http://127.0.0.1:8765', data=data, method='POST')
            with urllib.request.urlopen(req, timeout=10) as response:
                return json.loads(response.read().decode('utf-8'))
        except urllib.error.URLError as e:
            last_error = f"连接失败: {e.reason}。请确保 Anki 已打开并安装了 AnkiConnect。"
            time.sleep(1)
        except Exception as e:
            last_error = str(e)
            time.sleep(1)
            
    return {'error': last_error}

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            return
        
        try:
            request = json.loads(input_data)
        except json.JSONDecodeError:
             return

        command = request.get('command')
        # Optimization: Fallback for flattened arguments
        args = request.get('args', {})
        if not args and request:
             args = {k: v for k, v in request.items() if k != 'command'}
             
        result = {}
        
        # Updated command names to be unique
        if command == 'anki_add_note':
            try:
                fields = json.loads(args.get('fields', '{}'))
                tags = args.get('tags', '').split()
                deck_name = args.get('deck', 'Default')
                
                note = {
                    "deckName": deck_name,
                    "modelName": args.get('model', 'Basic'),
                    "fields": fields,
                    "tags": tags,
                    "options": {"allowDuplicate": True}
                }
                resp = request_anki('addNote', {'note': note})
                
                if resp.get('error'):
                    if "deck" in resp['error'].lower():
                        request_anki('createDeck', {'deck': deck_name})
                        resp = request_anki('addNote', {'note': note})
                    
                    if resp.get('error'):
                        result = {"status": "error", "error": f"添加笔记失败: {resp['error']}"}
                    else:
                        result = {"status": "success", "result": resp['result'], "messageForAI": f"笔记添加成功，ID: {resp['result']}"}
                else:
                    result = {"status": "success", "result": resp['result'], "messageForAI": f"笔记添加成功，ID: {resp['result']}"}
            except Exception as e:
                result = {"status": "error", "error": f"输入数据无效: {str(e)}"}

        elif command == 'anki_update_note':
            try:
                note_id = int(args.get('note_id'))
                fields = json.loads(args.get('fields', '{}'))
                resp = request_anki('updateNoteFields', {'note': {"id": note_id, "fields": fields}})
                if resp.get('error'):
                    result = {"status": "error", "error": resp['error']}
                else:
                    result = {"status": "success", "result": "Updated", "messageForAI": "笔记字段更新成功。"}
            except Exception as e:
                result = {"status": "error", "error": str(e)}

        elif command == 'anki_suspend':
            try:
                card_ids = [int(x.strip()) for x in str(args.get('card_ids', '')).split(',') if x.strip()]
                suspend = str(args.get('suspend', 'true')).lower() == 'true'
                action = 'suspend' if suspend else 'unsuspend'
                resp = request_anki(action, {'cards': card_ids})
                if resp.get('error'):
                    result = {"status": "error", "error": resp['error']}
                else:
                    result = {"status": "success", "result": resp['result'], "messageForAI": f"卡片已成功{'挂起' if suspend else '取消挂起'}。"}
            except Exception as e:
                result = {"status": "error", "error": str(e)}

        elif command == 'anki_reschedule':
            try:
                card_ids = [int(x.strip()) for x in str(args.get('card_ids', '')).split(',') if x.strip()]
                days = int(args.get('days', 0))
                
                # Strategy 1: setDue
                resp = request_anki('setDue', {'cards': card_ids, 'days': days})
                
                # Strategy 2: rescheduleCards (If setDue fails)
                if resp.get('error'):
                     # Correctly capture the new response/error
                     resp = request_anki('rescheduleCards', {'cards': card_ids, 'minDays': days, 'maxDays': days})
                     
                     if resp.get('error'):
                         # Strategy 3: setDueDate
                         resp = request_anki('setDueDate', {'cards': card_ids, 'days': days})
                
                if resp.get('error'):
                    result = {"status": "error", "error": resp['error']}
                else:
                    result = {"status": "success", "result": True, "messageForAI": f"卡片已重新调度到 {days} 天后复习。"}
            except Exception as e:
                result = {"status": "error", "error": str(e)}
        
        else:
             result = {"status": "error", "error": f"未知指令: {command}"}

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"status": "error", "error": f"内部错误: {str(e)}"}, ensure_ascii=False))

if __name__ == '__main__':
    main()
