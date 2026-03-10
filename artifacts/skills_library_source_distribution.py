import json
import os
from collections import Counter, defaultdict

ROOT = r'H:\VCP\VCPzhangduan\VCPziliao\skills'
OUT = 'artifacts/skills_library_source_distribution.json'


def classify(path_text: str) -> str:
    normalized = path_text.replace('\\', '/')
    if '/web-app/public/skills/' in normalized:
        return 'mirror_webapp'
    if '/skills-original-backup/' in normalized:
        return 'backup'
    if '/docs/' in normalized and '/skills/' in normalized:
        return 'docs_variant'
    if '/skills/' in normalized:
        return 'primary_skills'
    return 'other'


def main():
    pattern_counter = Counter()
    examples = defaultdict(list)
    total_dirs = 0
    total_skill_md = 0

    for dirpath, _, filenames in os.walk(ROOT):
        total_dirs += 1
        for filename in filenames:
            if filename.lower() != 'skill.md':
                continue
            total_skill_md += 1
            full_path = os.path.join(dirpath, filename).replace('\\', '/')
            label = classify(full_path)
            pattern_counter[label] += 1
            if len(examples[label]) < 20:
                examples[label].append(full_path)

    payload = {
        'root': ROOT.replace('\\', '/'),
        'scanned_dirs': total_dirs,
        'skill_md_total': total_skill_md,
        'patterns': dict(pattern_counter),
        'examples': dict(examples),
    }

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
