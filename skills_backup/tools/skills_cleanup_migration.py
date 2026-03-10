#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VCP skills 源库首批清理迁移脚本。

目标：
- 扫描 `VCPziliao/skills`
- 识别并导出首批可迁移来源：
  - `web-app/public/skills/` 镜像副本
  - `skills-original-backup/` 历史备份
  - `docs/.../skills/...` 文档变体
- 生成迁移清单 JSON / Markdown
- 在 `--apply` 模式下移动到 `VCPziliao/skills_backup`

默认仅预览，不会真正移动文件。
"""

from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List


@dataclass
class MigrationCandidate:
    category: str
    source_dir: str
    target_dir: str
    reason: str


RULES = (
    {
        "category": "mirror_webapp",
        "bucket": "mirror_webapp",
        "reason": "Web 发布镜像副本，不应作为 VCP 主技能源",
    },
    {
        "category": "backup_sources",
        "bucket": "backup_sources",
        "reason": "历史备份目录，不应作为当前 skills 主来源",
    },
    {
        "category": "docs_variants",
        "bucket": "docs_variants",
        "reason": "docs 下的技能文档变体，优先迁移出主技能源目录",
    },
)


def normalize(path: Path) -> str:
    return str(path).replace("\\", "/")


def classify_skill_dir(skill_dir: Path, skills_root: Path) -> tuple[str, str, str] | None:
    normalized = normalize(skill_dir)

    if "/web-app/public/skills/" in normalized:
        rule = RULES[0]
        return rule["category"], rule["bucket"], rule["reason"]

    if "/skills-original-backup/" in normalized:
        rule = RULES[1]
        return rule["category"], rule["bucket"], rule["reason"]

    if "/docs/" in normalized and "/skills/" in normalized:
        rule = RULES[2]
        return rule["category"], rule["bucket"], rule["reason"]

    return None


def collect_candidates(skills_root: Path, backup_root: Path) -> List[MigrationCandidate]:
    candidates: List[MigrationCandidate] = []
    seen_dirs = set()

    for skill_file in skills_root.rglob("SKILL.md"):
        skill_dir = skill_file.parent.resolve()
        if skill_dir in seen_dirs:
            continue
        seen_dirs.add(skill_dir)

        classified = classify_skill_dir(skill_dir, skills_root)
        if not classified:
            continue

        category, bucket, reason = classified
        relative_path = skill_dir.relative_to(skills_root)
        target_dir = backup_root / bucket / relative_path
        candidates.append(
            MigrationCandidate(
                category=category,
                source_dir=normalize(skill_dir),
                target_dir=normalize(target_dir),
                reason=reason,
            )
        )

    candidates.sort(key=lambda item: (item.category, item.source_dir))
    return candidates


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_markdown(path: Path, candidates: Iterable[MigrationCandidate]) -> None:
    items = list(candidates)
    counter = Counter(item.category for item in items)

    lines = [
        "# Skills 首批迁移清单",
        "",
        f"- 总候选数：**{len(items)}**",
        f"- `mirror_webapp`：**{counter.get('mirror_webapp', 0)}**",
        f"- `backup_sources`：**{counter.get('backup_sources', 0)}**",
        f"- `docs_variants`：**{counter.get('docs_variants', 0)}**",
        "",
        "| category | source_dir | target_dir | reason |",
        "|---|---|---|---|",
    ]

    for item in items:
        lines.append(
            f"| {item.category} | {item.source_dir} | {item.target_dir} | {item.reason} |"
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def apply_migration(candidates: Iterable[MigrationCandidate]) -> List[dict]:
    moved = []

    for item in candidates:
        source = Path(item.source_dir)
        target = Path(item.target_dir)

        if not source.exists():
            moved.append(
                {
                    "category": item.category,
                    "source_dir": item.source_dir,
                    "target_dir": item.target_dir,
                    "status": "missing_source",
                }
            )
            continue

        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(source), str(target))
        moved.append(
            {
                "category": item.category,
                "source_dir": item.source_dir,
                "target_dir": item.target_dir,
                "status": "moved",
            }
        )

    return moved


def main() -> None:
    parser = argparse.ArgumentParser(description="扫描并迁移 VCP skills 首批不可用来源")
    parser.add_argument("--apply", action="store_true", help="执行物理迁移")
    args = parser.parse_args()

    workspace = Path(__file__).resolve().parent.parent.parent
    skills_root = workspace / "VCPziliao" / "skills"
    backup_root = workspace / "VCPziliao" / "skills_backup"
    plans_dir = workspace / "VCPToolBox" / "plans"

    json_report = plans_dir / "skills_migration_candidates.json"
    md_report = plans_dir / "skills_migration_candidates.md"
    apply_report = plans_dir / "skills_migration_apply_report.json"

    candidates = collect_candidates(skills_root, backup_root)
    write_json(json_report, [asdict(item) for item in candidates])
    write_markdown(md_report, candidates)

    result = {
        "mode": "apply" if args.apply else "preview",
        "candidate_count": len(candidates),
        "reports": {
            "json": normalize(json_report),
            "markdown": normalize(md_report),
        },
        "summary": dict(Counter(item.category for item in candidates)),
    }

    if args.apply:
        moved = apply_migration(candidates)
        write_json(apply_report, moved)
        result["apply_report"] = normalize(apply_report)
        result["moved"] = dict(Counter(item["status"] for item in moved))

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
