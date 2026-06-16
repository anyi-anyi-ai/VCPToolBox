import urllib.request
import json

def request_anki(action, **params):
    req = urllib.request.Request('http://localhost:8765', data=json.dumps({
        "action": action,
        "version": 6,
        "params": params
    }).encode('utf-8'))
    response = urllib.request.urlopen(req, timeout=5)
    return json.loads(response.read().decode('utf-8'))

try:
    print("--- Fetching Anki Models ---")
    models = request_anki("modelNames")["result"]
    print("Available Models:", models)
    print("\n--- Fetching Fields for each Model ---")
    for model in models:
        fields = request_anki("modelFieldNames", modelName=model)["result"]
        print(f"Model '{model}' fields: {fields}")
except Exception as e:
    print("Error:", e)