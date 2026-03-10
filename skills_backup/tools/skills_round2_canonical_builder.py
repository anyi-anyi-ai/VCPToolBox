#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
根据第二轮分析结果生成 canonical skill 决议文件。
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List


LANGUAGE_PRIORITY = {"zh": 3, "en": 2, "unknown": 1}
TASKFLOW_PRIORITY = {
    "检索与发现": 6,
    "理解与归纳": 5,
    "规划与拆解": 6,
    "执行与编排": 6,
    "验证与审查": 6,
    "输出与交付": 4,
}


def normalize(path: Path) -> str:
    return str(path).replace("\\", "/")


def rank(item: Dict):
    return (
        LANGUAGE_PRIORITY.get(item.get("language_hint", "unknown"), 0),
        TASKFLOW_PRIORITY.get(item.get("taskflow_category", "输出与交付"), 0),
        -len(item.get("skill_name", "")),
        item.get("path", ""),
    )


def main() -> None:
    workspace = Path(__file__).resolve().parent.parent.parent
    plans_dir = workspace / "VCPToolBox" / "plans"

    inventory_path = plans_dir / "skills_round2_language_inventory.json"
    duplicate_path = plans_dir / "skills_round2_semantic_duplicates.json"
    matrix_path = plans_dir / "skills_vcp_call_logic_matrix.json"

    inventory: List[Dict] = json.loads(inventory_path.read_text(encoding="utf-8"))
    duplicates: List[Dict] = json.loads(duplicate_path.read_text(encoding="utf-8"))
    matrix: List[Dict] = json.loads(matrix_path.read_text(encoding="utf-8"))

    matrix_by_path = {item["path"]: item for item in matrix}
    grouped = {item["group"]: item["candidates"] for item in duplicates}

    canonical = []
    for group_name, items in sorted(grouped.items()):
        enriched = []
        for item in items:
            merged = dict(item)
            merged.update(matrix_by_path.get(item["path"], {}))
            enriched.append(merged)
        enriched.sort(key=rank, reverse=True)
        primary = enriched[0]
        canonical.append(
            {
                "group": group_name,
                "canonical_skill": {
                    "skill_name": primary["skill_name"],
                    "path": primary["path"],
                    "language_hint": primary.get("language_hint", "unknown"),
                    "taskflow_category": primary.get("taskflow_category", "输出与交付"),
                    "vcp_modules": primary.get("vcp_modules", ["PluginBridge"]),
                    "bridgeability": primary.get("bridgeability", "reference_or_bridgeable"),
                },
                "alternatives": [
                    {
                        "skill_name": item["skill_name"],
                        "path": item["path"],
                        "language_hint": item.get("language_hint", "unknown"),
                    }
                    for item in enriched[1:]
                ],
                "selection_reason": "优先中文，其次高价值任务流分类，再保留更稳定的主 skill 路径",
            }
        )

    singleton_paths = {item["path"] for item in inventory}
    duplicate_paths = {candidate["path"] for group in duplicates for candidate in group["candidates"]}
    singletons = []
    for item in matrix:
        if item["path"] in singleton_paths and item["path"] not in duplicate_paths:
            singletons.append(
                {
                    "group": item["skill_name"],
                    "canonical_skill": {
                        "skill_name": item["skill_name"],
                        "path": item["path"],
                        "language_hint": item.get("language_hint", "unknown"),
                        "taskflow_category": item.get("taskflow_category", "输出与交付"),
                        "vcp_modules": item.get("vcp_modules", ["PluginBridge"]),
                        "bridgeability": item.get("bridgeability", "reference_or_bridgeable"),
                    },
                    "alternatives": [],
                    "selection_reason": "无重复候选，直接保留",
                }
            )

    all_canonical = canonical + singletons
    all_canonical.sort(key=lambda x: (x["canonical_skill"]["taskflow_category"], x["canonical_skill"]["skill_name"]))

    output = plans_dir / "skills_round2_canonical_skills.json"
    output.write_text(json.dumps(all_canonical, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({
        "duplicate_groups": len(canonical),
        "singleton_groups": len(singletons),
        "total_canonical_groups": len(all_canonical),
        "output": normalize(output),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
