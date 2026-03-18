import json
import os
from collections import Counter, defaultdict

ROOT = r'H:\VCP\VCPzhangduan\VCPziliao\skills'
OUT = 'artifacts/skills_library_repo_breakdown.json'


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


def repo_name_from_path(path_text: str) -> str:
    normalized = path_text.replace('\\', '/')
    relative = normalized.split('/skills/', 1)[-1]
    return relative.split('/', 1)[0] if '/' in relative else relative


def main():
    repos = {}
    overall = Counter()

    for dirpath, _, filenames in os.walk(ROOT):
        for filename in filenames:
            if filename.lower() != 'skill.md':
                continue
            full_path = os.path.join(dirpath, filename).replace('\\', '/')
            repo = repo_name_from_path(full_path)
            label = classify(full_path)

            if repo not in repos:
                repos[repo] = {
                    'counts': Counter(),
                    'examples': defaultdict(list),
                    'total': 0,
                }

            repos[repo]['counts'][label] += 1
            repos[repo]['total'] += 1
            overall[label] += 1
            if len(repos[repo]['examples'][label]) < 10:
                repos[repo]['examples'][label].append(full_path)

    output = {
        'root': ROOT.replace('\\', '/'),
        'repo_total': len(repos),
        'overall_counts': dict(overall),
        'repos': {},
    }

    for repo in sorted(repos):
        output['repos'][repo] = {
            'total': repos[repo]['total'],
            'counts': dict(repos[repo]['counts']),
            'examples': dict(repos[repo]['examples']),
        }

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(json.dumps({
        'output': OUT,
        'repo_total': output['repo_total'],
        'overall_counts': output['overall_counts'],
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
