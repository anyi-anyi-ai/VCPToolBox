#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VCP skills 第二轮主目录分析器。

输出：
- 中文 / 英文 / 未知语言清单
- 中文主版本候选与未知语言复核表
- 语义重复候选分组（基于规范化 skill 名）
- VCP skills 插件调用逻辑矩阵
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List


def normalize_path(path: Path) -> str:
    return str(path).replace("\\", "/")


def should_skip(path_str: str) -> bool:
    return (
        "/web-app/public/skills/" in path_str
        or "/skills-original-backup/" in path_str
        or ("/docs/" in path_str and "/skills/" in path_str)
    )


def detect_language(text: str) -> str:
    head = text[:3000]
    if re.search(r"[\u4e00-\u9fff]", head):
        return "zh"
    if re.search(r"[A-Za-z]{3,}", head):
        return "en"
    return "unknown"


def normalize_skill_name(name: str) -> str:
    value = name.lower().strip()
    value = value.replace("_", "-")
    value = re.sub(r"-(zh|cn|zh-cn|中文版|chinese)$", "", value)
    value = re.sub(r"-(v\d+|v\d+-\d+|copy|backup|pro|max|plus)$", "", value)
    value = re.sub(r"[^a-z0-9\-]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or name.lower()


def classify_taskflow(name: str, text: str) -> str:
    combined = f"{name}\n{text[:2000]}".lower()
    if any(k in combined for k in ["search", "retrieval", "research", "discover", "wiki"]):
        return "检索与发现"
    if any(k in combined for k in ["summary", "summar", "analy", "structure", "extract"]):
        return "理解与归纳"
    if any(k in combined for k in ["plan", "planning", "roadmap", "workflow design", "breakdown"]):
        return "规划与拆解"
    if any(k in combined for k in ["execute", "orches", "automation", "agent", "workflow"]):
        return "执行与编排"
    if any(k in combined for k in ["verify", "verification", "review", "security", "debug", "test"]):
        return "验证与审查"
    return "输出与交付"


def classify_modules(taskflow: str) -> List[str]:
    mapping = {
        "检索与发现": ["KnowledgeBase", "PluginBridge"],
        "理解与归纳": ["KnowledgeBase", "PluginBridge"],
        "规划与拆解": ["WorkflowEngine", "PluginBridge"],
        "执行与编排": ["WorkflowEngine", "PluginBridge"],
        "验证与审查": ["QualityGate", "PluginBridge"],
        "输出与交付": ["AdminPanel", "PluginBridge"],
    }
    return mapping.get(taskflow, ["PluginBridge"])


def bridgeability(taskflow: str) -> str:
    if taskflow in {"检索与发现", "规划与拆解", "执行与编排", "验证与审查", "理解与归纳"}:
        return "bridgeable"
    return "reference_or_bridgeable"


def main() -> None:
    workspace = Path(__file__).resolve().parent.parent.parent
    skills_root = workspace / "VCPziliao" / "skills"
    plans_dir = workspace / "VCPToolBox" / "plans"
    plans_dir.mkdir(parents=True, exist_ok=True)

    inventory: List[Dict] = []
    for skill_file in sorted(skills_root.rglob("SKILL.md")):
        path_str = normalize_path(skill_file)
        if should_skip(path_str):
            continue
        text = skill_file.read_text(encoding="utf-8", errors="ignore")
        skill_name = skill_file.parent.name
        language = detect_language(text)
        normalized_group = normalize_skill_name(skill_name)
        taskflow = classify_taskflow(skill_name, text)
        modules = classify_modules(taskflow)
        inventory.append(
            {
                "skill_name": skill_name,
                "normalized_group": normalized_group,
                "path": path_str,
                "language_hint": language,
                "taskflow_category": taskflow,
                "vcp_modules": modules,
                "bridgeability": bridgeability(taskflow),
            }
        )

    language_counter = Counter(item["language_hint"] for item in inventory)

    grouped = defaultdict(list)
    for item in inventory:
        grouped[item["normalized_group"]].append(item)

    zh_primary_review = []
    unknown_review = []
    semantic_duplicates = []
    call_logic_matrix = []

    for group_name, items in sorted(grouped.items()):
        langs = {item["language_hint"] for item in items}
        if "zh" in langs and len(items) > 1:
            zh_items = [i for i in items if i["language_hint"] == "zh"]
            primary = zh_items[0] if zh_items else items[0]
            zh_primary_review.append(
                {
                    "group": group_name,
                    "recommended_primary": primary["path"],
                    "candidates": items,
                    "reason": "中文主版本优先",
                }
            )
        if "unknown" in langs:
            for item in items:
                if item["language_hint"] == "unknown":
                    unknown_review.append(
                        {
                            "group": group_name,
                            "path": item["path"],
                            "reason": "语言未知，需人工复核",
                        }
                    )
        if len(items) > 1:
            semantic_duplicates.append(
                {
                    "group": group_name,
                    "count": len(items),
                    "candidates": items,
                    "recommended_primary": items[0]["path"],
                }
            )
        for item in items:
            call_logic_matrix.append(
                {
                    "skill_name": item["skill_name"],
                    "path": item["path"],
                    "language_hint": item["language_hint"],
                    "taskflow_category": item["taskflow_category"],
                    "vcp_modules": item["vcp_modules"],
                    "bridgeability": item["bridgeability"],
                }
            )

    outputs = {
        "inventory": plans_dir / "skills_round2_language_inventory.json",
        "zh_review": plans_dir / "skills_round2_language_review.json",
        "unknown_review": plans_dir / "skills_round2_unknown_language_review.json",
        "semantic_duplicates": plans_dir / "skills_round2_semantic_duplicates.json",
        "call_logic_matrix": plans_dir / "skills_vcp_call_logic_matrix.json",
    }

    outputs["inventory"].write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding="utf-8")
    outputs["zh_review"].write_text(json.dumps(zh_primary_review, ensure_ascii=False, indent=2), encoding="utf-8")
    outputs["unknown_review"].write_text(json.dumps(unknown_review, ensure_ascii=False, indent=2), encoding="utf-8")
    outputs["semantic_duplicates"].write_text(json.dumps(semantic_duplicates, ensure_ascii=False, indent=2), encoding="utf-8")
    outputs["call_logic_matrix"].write_text(json.dumps(call_logic_matrix, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({
        "total": len(inventory),
        "language_summary": dict(language_counter),
        "zh_review_groups": len(zh_primary_review),
        "unknown_review_count": len(unknown_review),
        "semantic_duplicate_groups": len(semantic_duplicates),
        "outputs": {k: normalize_path(v) for k, v in outputs.items()},
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
