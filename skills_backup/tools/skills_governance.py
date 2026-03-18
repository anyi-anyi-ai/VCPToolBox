#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VCP Skills Governance Builder

基于 [`artifacts/skills_inventory/skills_inventory.json`](artifacts/skills_inventory/skills_inventory.json)
生成后续治理与接入所需的派生文件：

1. P0 / 核心能力清单
2. 重复组汇总报告
3. 待确认项清单
4. VCP 原生 skill manifest 草案

运行示例：
    python tools/skills_governance.py
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
from typing import Dict, List


def load_inventory(path: Path) -> List[Dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def build_manifest(record: Dict) -> Dict:
    return {
        "skill_id": f"{record['repo']}::{record['skill_name']}",
        "name": record["skill_name"],
        "title": record["display_title"],
        "summary": record.get("description", ""),
        "category": {
            "l1": record["category_l1"],
            "l2": record["category_l2"],
            "l3": record["category_l3"],
        },
        "capability_type": record["capability_type"],
        "priority": record["priority"],
        "integration_phase": record["integration_phase"],
        "asset_status": record["asset_status"],
        "language_hint": record.get("language_hint", "unknown"),
        "source_origin": record["repo"],
        "source_path": record["source_path"],
        "duplicate_group": record.get("duplicate_group", ""),
        "issue_flags": [flag.strip() for flag in record.get("issue_flags", "").split(";") if flag.strip()],
        "recommended_action": record.get("recommended_action", ""),
        "vcp_mapping": infer_vcp_mapping(record),
        "status": infer_manifest_status(record),
        "version": "0.1.0-draft",
        "tags": infer_tags(record),
    }


def infer_vcp_mapping(record: Dict) -> List[str]:
    l1 = record["category_l1"]
    mappings: List[str] = []
    if l1.startswith("A."):
        mappings.extend(["AgentOrchestrator", "WorkflowEngine"])
    if l1.startswith("B."):
        mappings.extend(["QualityGate", "DebugMode"])
    if l1.startswith("C."):
        mappings.extend(["KnowledgeBase", "SkillsRegistry"])
    if l1.startswith("D."):
        mappings.extend(["PluginTemplates", "DomainSkills"])
    if l1.startswith("E."):
        mappings.extend(["PlatformConfig", "HookSystem"])
    return mappings


def infer_manifest_status(record: Dict) -> str:
    if record["priority"] == "P0" and record["asset_status"] == "可执行技能":
        return "candidate"
    if record["category_l1"].startswith("Z."):
        return "needs_review"
    if record["asset_status"] == "参考资料":
        return "reference"
    return "draft"


def infer_tags(record: Dict) -> List[str]:
    tags = [
        record["repo"],
        record["priority"],
        record["capability_type"],
        record["category_l1"],
        record["category_l2"],
    ]
    if record.get("language_hint"):
        tags.append(f"lang:{record['language_hint']}")
    if record.get("duplicate_group"):
        tags.append(f"dup:{record['duplicate_group']}")
    return tags


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_markdown(path: Path, title: str, headers: List[str], rows: List[List[str]]) -> None:
    lines = [f"# {title}", "", f"- 记录数：**{len(rows)}**", ""]
    lines.append("| " + " | ".join(headers) + " |")
    lines.append("|" + "|".join(["---"] * len(headers)) + "|")
    for row in rows:
        lines.append("| " + " | ".join(row) + " |")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    workspace = Path(__file__).resolve().parent.parent
    inventory_path = workspace / "artifacts/skills_inventory/skills_inventory.json"
    output_dir = workspace / "artifacts/skills_governance"
    manifest_dir = output_dir / "manifest_drafts"

    ensure_dir(output_dir)
    ensure_dir(manifest_dir)

    records = load_inventory(inventory_path)

    p0_records = [r for r in records if r["priority"] == "P0"]
    core_records = [r for r in records if r["capability_type"] == "核心能力"]
    pending_records = [r for r in records if r["category_l1"].startswith("Z.") or "待确认" in r.get("issue_flags", "")]

    duplicate_groups: Dict[str, List[Dict]] = defaultdict(list)
    for record in records:
        group = record.get("duplicate_group", "")
        if group:
            duplicate_groups[group].append(record)

    manifests = [build_manifest(r) for r in records]

    write_json(output_dir / "p0_candidates.json", p0_records)
    write_json(output_dir / "core_capabilities.json", core_records)
    write_json(output_dir / "pending_review.json", pending_records)
    write_json(output_dir / "duplicate_groups.json", duplicate_groups)
    write_json(output_dir / "skill_manifests_draft.json", manifests)

    write_markdown(
        output_dir / "p0_candidates.md",
        "P0 技能候选清单",
        ["repo", "skill_name", "分类", "能力属性", "建议动作"],
        [
            [r["repo"], r["skill_name"], r["category_l1"], r["capability_type"], r["recommended_action"]]
            for r in p0_records
        ],
    )

    duplicate_rows: List[List[str]] = []
    for group_name, items in sorted(duplicate_groups.items(), key=lambda x: (-len(x[1]), x[0])):
        sample = ", ".join(i["skill_name"] for i in items[:6])
        duplicate_rows.append([group_name, str(len(items)), sample])
    write_markdown(
        output_dir / "duplicate_groups.md",
        "重复技能组报告",
        ["duplicate_group", "count", "samples"],
        duplicate_rows,
    )

    write_markdown(
        output_dir / "pending_review.md",
        "待确认技能清单",
        ["repo", "skill_name", "language", "问题标记", "建议动作"],
        [
            [r["repo"], r["skill_name"], r.get("language_hint", "unknown"), r.get("issue_flags", "-"), r["recommended_action"]]
            for r in pending_records
        ],
    )

    for manifest in manifests[:200]:
        safe_name = manifest["skill_id"].replace("::", "__").replace("/", "_")
        write_json(manifest_dir / f"{safe_name}.json", manifest)

    summary = {
        "total_records": len(records),
        "p0_candidates": len(p0_records),
        "core_capabilities": len(core_records),
        "pending_review": len(pending_records),
        "duplicate_groups": len(duplicate_groups),
        "manifest_samples_written": min(len(manifests), 200),
    }
    write_json(output_dir / "governance_summary.json", summary)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
