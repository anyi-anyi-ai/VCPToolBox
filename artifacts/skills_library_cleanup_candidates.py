import json
from pathlib import Path

INPUT = Path('artifacts/skills_library_repo_breakdown.json')
OUTPUT = Path('artifacts/skills_library_cleanup_candidates.json')


def main():
    data = json.loads(INPUT.read_text(encoding='utf-8'))
    repos = data.get('repos', {})

    cleanup_plan = {
        'priority_order': [],
        'repos': {},
        'totals': {
            'mirror_webapp': 0,
            'backup': 0,
            'docs_variant': 0,
        }
    }

    ranked = []
    for repo_name, repo_data in repos.items():
        counts = repo_data.get('counts', {})
        mirror = counts.get('mirror_webapp', 0)
        backup = counts.get('backup', 0)
        docs = counts.get('docs_variant', 0)
        cleanup_load = mirror + backup + docs
        if cleanup_load <= 0:
            continue

        ranked.append((cleanup_load, mirror, backup, docs, repo_name))
        cleanup_plan['repos'][repo_name] = {
            'cleanup_load': cleanup_load,
            'counts': {
                'mirror_webapp': mirror,
                'backup': backup,
                'docs_variant': docs,
                'primary_skills': counts.get('primary_skills', 0),
            },
            'recommended_actions': [],
        }

        if mirror:
            cleanup_plan['repos'][repo_name]['recommended_actions'].append('remove mirror_webapp paths and keep original skills/')
        if backup:
            cleanup_plan['repos'][repo_name]['recommended_actions'].append('remove skills-original-backup paths')
        if docs:
            cleanup_plan['repos'][repo_name]['recommended_actions'].append('review docs_variant paths, keep only canonical source')

        cleanup_plan['totals']['mirror_webapp'] += mirror
        cleanup_plan['totals']['backup'] += backup
        cleanup_plan['totals']['docs_variant'] += docs

    ranked.sort(reverse=True)
    cleanup_plan['priority_order'] = [
        {
            'repo': repo_name,
            'cleanup_load': cleanup_load,
            'mirror_webapp': mirror,
            'backup': backup,
            'docs_variant': docs,
        }
        for cleanup_load, mirror, backup, docs, repo_name in ranked
    ]

    OUTPUT.write_text(json.dumps(cleanup_plan, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'output': str(OUTPUT).replace('\\', '/'), 'priority_order': cleanup_plan['priority_order'][:10], 'totals': cleanup_plan['totals']}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
