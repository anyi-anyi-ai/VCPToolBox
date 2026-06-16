import os

file_path = r'H:\VCP\VCPzhangduan\VCPToolBox\Plugin\EnglishHelper\EnglishHelper.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_idx = content.find('def do_quiz_generate(text):')
end_idx = content.find('def do_phrase_pattern(text):')

if start_idx != -1 and end_idx != -1:
    new_func = '''def do_quiz_generate(text):
    nlp = get_nlp()
    if not nlp:
        return {"error": "NLP engine not available"}
        
    doc = nlp(text)
    candidate_tokens = [t for t in doc if t.pos_ in ["VERB", "ADJ", "NOUN", "ADV"] and len(t.text) > 4]
    
    if not candidate_tokens:
        return {"error": "Sentence too simple to generate a quiz."}
        
    import random
    import sqlite3
    
    target = random.choice(candidate_tokens)
    target_word = target.text
    masked_sentence = text[:target.idx] + "_____" + text[target.idx + len(target_word):]
    
    distractors = []
    db_path = r"H:\\VCP\\VCPzhangduan\\VCPToolBox\\Plugin\\EnglishHelper\\dicts\\lm6\\ecdict-sqlite-28\\stardict.db"
        
    if os.path.exists(db_path):
        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            prefix = target_word[:2].lower() if len(target_word) > 2 else target_word[0].lower()
            length = len(target_word)
            c.execute("SELECT word FROM stardict WHERE word LIKE ? AND length(word) BETWEEN ? AND ? ORDER BY RANDOM() LIMIT 20", (prefix + '%', length - 2, length + 2))
            rows = c.fetchall()
            for row in rows:
                w = row[0]
                if w.lower() != target_word.lower() and w.isalpha():
                    distractors.append(w)
            conn.close()
        except Exception:
            pass
            
    if len(distractors) < 3:
        distractors += ["obfuscate", "manipulate", "comprehend", "evaluate", "synthesize"]
        
    random.shuffle(distractors)
    options = list(set(distractors))[:3] + [target_word]
    random.shuffle(options)
    
    return {
        "type": "fill_in_the_blank",
        "question": masked_sentence,
        "options": options,
        "answer": target_word,
        "explanation": f"The correct word is '{target_word}' (POS: {target.pos_})."
    }

'''
    new_content = content[:start_idx] + new_func + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Quiz generator patched successfully using string slicing!")
else:
    print("Could not find function boundaries.")