import json
import collections
import pathlib

ROOT = pathlib.Path('artifacts/skills_governance/skill_manifests_draft.json')
OUT = pathlib.Path('artifacts/skills_source_audit_detail.json')


def normalize_issue_flags(item):
    issue_flags = item.get('issue_flags', [])
    if isinstance(issue_flags, str):
        return [s.strip() for s in issue_flags.split(';') if s.strip()]
    return issue_flags


def is_candidate(item):
    return (
        item.get('priority') == 'P0'
        and item.get('capability_type') == '核心能力'
        and item.get('asset_status') == '可执行技能'
        and item.get('status') != 'needs_review'
        and not any('待确认' in flag for flag in normalize_issue_flags(item))
    )


def classify_source(source_path, language_hint, group_items):
    normalized = (source_path or '').replace('\\', '/')
    lang = (language_hint or 'unknown').lower()
    has_zh = any(str(item.get('language_hint') or 'unknown').lower().startswith('zh') for item in group_items)

    labels = []
    if '/skills/' in normalized and '/web-app/public/skills/' not in normalized and '/skills-original-backup/' not in normalized and '/docs/' not in normalized:
        labels.append('primary_skills')
    if '/web-app/public/skills/' in normalized:
        labels.append('mirror_webapp')
    if '/skills-original-backup/' in normalized:
        labels.append('backup')
    if '/docs/' in normalized and '/skills/' in normalized:
        labels.append('docs_variant')
    if has_zh and not lang.startswith('zh'):
        labels.append('non_zh_when_zh_exists')
    if lang in ('unknown', ''):
        labels.append('language_unknown')
    if not labels:
        labels.append('other')
    return labels


def main():
    raw = json.loads(ROOT.read_text(encoding='utf-8'))
    candidates = [item for item in raw if is_candidate(item)]
    groups = collections.defaultdict(list)
    for item in candidates:
        groups[item['skill_id']].append(item)

    duplicate_groups = {skill_id: items for skill_id, items in groups.items() if len(items) > 1}

    summary = {
        'candidate_total': len(candidates),
        'duplicate_group_total': len(duplicate_groups),
        'duplicate_row_total': sum(len(items) for items in duplicate_groups.values()),
        'by_label': collections.Counter(),
        'by_language': collections.Counter(),
    }

    detailed_groups = []
    for skill_id in sorted(duplicate_groups):
        items = duplicate_groups[skill_id]
        rows = []
        for item in items:
            source_path = (item.get('source_path') or '').replace('\\', '/')
            language_hint = item.get('language_hint') or 'unknown'
            labels = classify_source(source_path, language_hint, items)
            for label in labels:
                summary['by_label'][label] += 1
            summary['by_language'][language_hint] += 1
            rows.append({
                'language_hint': language_hint,
                'title': item.get('title', ''),
                'source_origin': item.get('source_origin', ''),
                'source_path': source_path,
                'labels': labels,
            })
        detailed_groups.append({
            'skill_id': skill_id,
            'count': len(rows),
            'rows': rows,
        })

    result = {
        'summary': {
            'candidate_total': summary['candidate_total'],
            'duplicate_group_total': summary['duplicate_group_total'],
            'duplicate_row_total': summary['duplicate_row_total'],
            'by_label': dict(summary['by_label']),
            'by_language': dict(summary['by_language']),
        },
        'duplicate_groups': detailed_groups,
    }

    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'output': str(OUT).replace('\\', '/'), **result['summary']}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
