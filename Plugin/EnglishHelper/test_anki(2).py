import urllib.request
import json
import traceback

def test_anki():
    try:
        print("1. Testing connection to AnkiConnect (localhost:8765)...")
        req = urllib.request.Request('http://localhost:8765', data=json.dumps({"action": "version", "version": 6}).encode('utf-8'))
        resp = urllib.request.urlopen(req, timeout=5)
        print("-> AnkiConnect Version Response:", resp.read().decode('utf-8'))
        
        print("\n2. Attempting to create deck 'VCP_English'...")
        deck_payload = json.dumps({"action": "createDeck", "version": 6, "params": {"deck": "VCP_English"}}).encode('utf-8')
        req2 = urllib.request.Request('http://localhost:8765', data=deck_payload)
        resp2 = urllib.request.urlopen(req2, timeout=5)
        print("-> Create Deck Response:", resp2.read().decode('utf-8'))
        
        print("\n3. Attempting to add a test note...")
        note_payload = json.dumps({
            "action": "addNote", "version": 6, "params": {
                "note": {"deckName": "VCP_English", "modelName": "Basic", "fields": {"Front": "test_word_from_Aemeath", "Back": "This is a test definition."}, "options": {"allowDuplicate": False}, "tags": ["VCP_Auto"]}
            }
        }).encode('utf-8')
        req3 = urllib.request.Request('http://localhost:8765', data=note_payload)
        resp3 = urllib.request.urlopen(req3, timeout=5)
        print("-> Add Note Response:", resp3.read().decode('utf-8'))
        
    except Exception as e:
        print("\n-> ERROR connecting to Anki:")
        traceback.print_exc()

if __name__ == '__main__':
    test_anki()