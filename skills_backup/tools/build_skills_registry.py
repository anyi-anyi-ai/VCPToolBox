#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从治理结果生成 VCP 技能注册表与运行态配置。

输入：
- artifacts/skills_governance/skill_manifests_draft.json
- plans/skills_round2_canonical_skills.json（如果存在）

输出：
- skills_registry/index.json
- skills_registry/manifests/*.json
- skills_registry/runtime_config.json

当前策略：
- 保留全量技能资产，作为正式注册目录
- 优先消费第二轮 canonical skill 决议进行去重
- 为每个技能补全“使用方法 / 技能种类 / 方向”分类
- 生成独立运行态配置，控制启用、推荐、桥接与深执行开关
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple


PREFERRED_SOURCE_SEGMENTS: Tuple[str, ...] = (
    "/skills/",
    "\\skills\\",
)
EXCLUDED_SOURCE_SEGMENTS: Tuple[str, ...] = (
    "/web-app/public/skills/",
    "\\web-app\\public\\skills\\",
    "/skills-original-backup/",
    "\\skills-original-backup\\",
)
LANGUAGE_PRIORITY = {
    "zh": 3,
    "zh-cn": 3,
    "zh-hans": 3,
    "en": 2,
    "unknown": 1,
}
TASKFLOW_TO_VCP_MAPPING = {
    "检索与发现": ["KnowledgeBase", "PluginBridge"],
    "理解与归纳": ["KnowledgeBase", "PluginBridge"],
    "规划与拆解": ["WorkflowEngine", "PluginBridge"],
    "执行与编排": ["WorkflowEngine", "PluginBridge"],
    "验证与审查": ["QualityGate", "PluginBridge"],
    "输出与交付": ["AdminPanel", "PluginBridge"],
    "知识治理与持续学习": ["KnowledgeBase", "AdminPanel", "PluginBridge"],
    "多模态与界面操作": ["AdminPanel", "PluginBridge"],
    "专项领域技能": ["PluginBridge"],
}
USAGE_METHOD_RULES = [
    (
        "检索与发现",
        "研究检索类",
        "通用知识检索",
        ["search", "retrieval", "research", "rag", "mcp", "knowledge"],
    ),
    (
        "理解与归纳",
        "阅读分析类",
        "总结抽取与结构化",
        ["read", "summary", "summarize", "analysis", "extract", "review", "understand"],
    ),
    (
        "规划与拆解",
        "方案规划类",
        "需求澄清与设计前置",
        ["architect", "consultant", "roadmap", "spec", "requirements", "design", "plan", "brainstorm"],
    ),
    (
        "执行与编排",
        "执行编排类",
        "工作流与协同执行",
        ["workflow", "subagent", "orchestration", "delegate", "dispatch", "execute", "execution"],
    ),
    (
        "验证与审查",
        "测试审查类",
        "测试验证与安全质量",
        ["test", "testing", "verification", "validate", "qa", "quality", "security", "debug", "audit", "eval"],
    ),
    (
        "输出与交付",
        "产出交付类",
        "写作表达与最终交付",
        ["writing", "write", "document", "article", "delivery", "frontend", "ui", "ux", "content"],
    ),
    (
        "知识治理与持续学习",
        "知识治理类",
        "技能治理与持续学习",
        ["skill", "skills", "governance", "inventory", "stocktake", "learning", "memory", "compact", "compression"],
    ),
    (
        "多模态与界面操作",
        "界面交互类",
        "多模态与体验表达",
        ["react", "vue", "angular", "css", "web", "frontend", "ui", "ux", "3d", "image", "audio", "video"],
    ),
]
DEFAULT_USAGE_METHOD = ("专项领域技能", "专项场景类", "未归一专项方向")
ENABLED_BY_PRIORITY = {
    "P0": True,
    "P1": True,
    "P2": False,
    "P3": False,
}
RECOMMENDABLE_BY_PRIORITY = {
    "P0": True,
    "P1": True,
    "P2": True,
    "P3": False,
}
BRIDGE_BY_PRIORITY = {
    "P0": True,
    "P1": True,
    "P2": True,
    "P3": False,
}
DEEP_EXECUTE_BY_PRIORITY = {
    "P0": False,
    "P1": False,
    "P2": False,
    "P3": False,
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def summarize_text(value: str) -> str:
    return " ".join(str(value or "").split()).strip()


def normalize_path(value: str) -> str:
    return str(value or "").replace("\\", "/")


def is_active_candidate(item: Dict) -> bool:
    issue_flags = item.get("issue_flags", [])
    if isinstance(issue_flags, str):
        issue_flags = [s.strip() for s in issue_flags.split(";") if s.strip()]

    return (
        item.get("priority") == "P0"
        and item.get("capability_type") == "核心能力"
        and item.get("asset_status") == "可执行技能"
        and item.get("status") != "needs_review"
        and not any("待确认" in flag for flag in issue_flags)
    )


def is_registry_candidate(item: Dict) -> bool:
    return item.get("asset_status") in {"可执行技能", "待确认技能说明", "辅助材料", "参考资料"}


def infer_usage_category(item: Dict) -> Dict:
    category = item.get("category", {}) or {}
    text = " ".join([
        str(item.get("name", "")),
        str(item.get("title", "")),
        str(item.get("summary", "")),
        str(category.get("l1", "")),
        str(category.get("l2", "")),
        str(category.get("l3", "")),
        " ".join(item.get("tags", []) if isinstance(item.get("tags"), list) else []),
    ]).lower()

    for usage_method, family, domain, keywords in USAGE_METHOD_RULES:
        if any(keyword in text for keyword in keywords):
            return {
                "usage_method": usage_method,
                "family": family,
                "domain": domain,
            }

    category_l1 = str(category.get("l1", ""))
    if category_l1.startswith("A."):
        return {"usage_method": "规划与拆解", "family": "方案规划类", "domain": "Agent 方案设计"}
    if category_l1.startswith("B."):
        return {"usage_method": "验证与审查", "family": "测试审查类", "domain": "工程质量保障"}
    if category_l1.startswith("C."):
        return {"usage_method": "知识治理与持续学习", "family": "知识治理类", "domain": "知识沉淀与治理"}
    if category_l1.startswith("D1."):
        return {"usage_method": "理解与归纳", "family": "架构实现类", "domain": "后端与架构"}
    if category_l1.startswith("D2."):
        return {"usage_method": "多模态与界面操作", "family": "界面交互类", "domain": "前端与体验"}
    if category_l1.startswith("E."):
        return {"usage_method": "执行与编排", "family": "平台运行类", "domain": "配置部署与运行"}

    usage_method, family, domain = DEFAULT_USAGE_METHOD
    return {
        "usage_method": usage_method,
        "family": family,
        "domain": domain,
    }


def infer_vcp_mapping(item: Dict, usage_category: Dict) -> List[str]:
    original = item.get("vcp_mapping", [])
    if isinstance(original, list) and original:
        base = original
    else:
        base = TASKFLOW_TO_VCP_MAPPING.get(usage_category["usage_method"], ["PluginBridge"])
    return sorted(dict.fromkeys(base))


def is_bridgeable(item: Dict, usage_category: Dict) -> bool:
    category_l1 = str(item.get("category", {}).get("l1", ""))
    name = str(item.get("name", ""))
    if category_l1.startswith("C.") or category_l1.startswith("B."):
        return True
    if usage_category["usage_method"] in {"检索与发现", "规划与拆解", "执行与编排", "验证与审查"}:
        return True
    if name in {
        "search-first",
        "iterative-retrieval",
        "verification-loop",
        "verification-before-completion",
        "security-review",
        "skill-stocktake",
        "systematic-debugging",
    }:
        return True
    return False


def infer_executable_level(item: Dict, bridgeable: bool) -> str:
    asset_status = item.get("asset_status")
    if asset_status != "可执行技能":
        return "metadata_only"
    return "stub" if bridgeable else "catalog_only"


def slim_manifest(item: Dict) -> Dict:
    usage_category = infer_usage_category(item)
    vcp_mapping = infer_vcp_mapping(item, usage_category)
    bridgeable = is_bridgeable(item, usage_category)
    executable_level = infer_executable_level(item, bridgeable)
    issue_flags = item.get("issue_flags", [])
    if isinstance(issue_flags, str):
        issue_flags = [s.strip() for s in issue_flags.split(";") if s.strip()]

    return {
        "skill_id": item["skill_id"],
        "name": item["name"],
        "title": item["title"],
        "summary": item.get("summary", ""),
        "category": item["category"],
        "usage_category": usage_category,
        "capability_type": item["capability_type"],
        "priority": item["priority"],
        "integration_phase": item.get("integration_phase", ""),
        "asset_status": item.get("asset_status", ""),
        "status": "active_candidate" if is_active_candidate(item) else "registered",
        "review_status": "needs_review" if item.get("status") == "needs_review" or any("待确认" in flag for flag in issue_flags) else "ready",
        "source_origin": item["source_origin"],
        "source_path": item["source_path"],
        "language_hint": item.get("language_hint", "unknown"),
        "vcp_mapping": vcp_mapping,
        "trigger_mode": "manual_or_rule",
        "bridgeable": bridgeable,
        "executable_level": executable_level,
        "duplicate_group": item.get("duplicate_group", ""),
        "issue_flags": issue_flags,
        "recommended_action": item.get("recommended_action", ""),
        "tags": item.get("tags", []),
        "version": item.get("version", "0.1.0-draft"),
    }


def rank_manifest(item: Dict) -> Tuple[int, int, int, str]:
    source_path = str(item.get("source_path", ""))
    normalized_source_path = source_path.replace("\\", "/").lower()
    summary_length = len(summarize_text(item.get("summary", "")))
    language_hint = str(item.get("language_hint", "unknown")).strip().lower()

    source_score = 0
    if any(segment.lower() in normalized_source_path for segment in PREFERRED_SOURCE_SEGMENTS):
        source_score += 2
    if any(segment.lower() in normalized_source_path for segment in EXCLUDED_SOURCE_SEGMENTS):
        source_score -= 3

    language_score = LANGUAGE_PRIORITY.get(language_hint, 0)
    return (source_score, summary_length, language_score, source_path)


def load_canonical_map(path: Path) -> Dict[str, Dict]:
    if not path.exists():
        return {}
    canonical_items = load_json(path)
    canonical_map: Dict[str, Dict] = {}
    for item in canonical_items:
        canonical_skill = item.get("canonical_skill", {})
        canonical_path = normalize_path(canonical_skill.get("path", ""))
        if canonical_path:
            canonical_map[canonical_path] = item
    return canonical_map


def enrich_with_canonical(item: Dict, canonical_record: Dict | None) -> Dict:
    if not canonical_record:
        enriched = dict(item)
        enriched["canonical"] = True
        return enriched

    canonical_skill = canonical_record.get("canonical_skill", {})
    enriched = dict(item)
    taskflow_category = canonical_skill.get("taskflow_category")
    vcp_modules = canonical_skill.get("vcp_modules") or enriched.get("vcp_mapping", [])
    bridgeability = canonical_skill.get("bridgeability")

    enriched["taskflow_category"] = taskflow_category
    enriched["vcp_mapping"] = sorted(dict.fromkeys(vcp_modules or enriched.get("vcp_mapping", [])))
    enriched["bridgeable"] = bridgeability == "bridgeable" or enriched.get("bridgeable", False)
    enriched["executable_level"] = infer_executable_level(enriched, enriched["bridgeable"])
    enriched["canonical_group"] = canonical_record.get("group")
    enriched["canonical_selection_reason"] = canonical_record.get("selection_reason", "")
    enriched["canonical"] = True
    if taskflow_category:
        enriched.setdefault("tags", [])
        enriched["tags"] = sorted(set(enriched["tags"] + [f"taskflow:{taskflow_category}"]))
    return enriched


def deduplicate_manifests(items: List[Dict], canonical_map: Dict[str, Dict]) -> Tuple[List[Dict], Dict[str, Dict]]:
    grouped: Dict[str, List[Dict]] = defaultdict(list)
    for item in items:
        grouped[item["skill_id"]].append(item)

    deduplicated: List[Dict] = []
    duplicate_groups: Dict[str, Dict] = {}

    for skill_id, group in grouped.items():
        if len(group) == 1:
            item = group[0]
            canonical_record = canonical_map.get(normalize_path(item.get("source_path", "")))
            deduplicated.append(enrich_with_canonical(item, canonical_record))
            continue

        canonical_choice = None
        for candidate in group:
            canonical_record = canonical_map.get(normalize_path(candidate.get("source_path", "")))
            if canonical_record:
                canonical_choice = enrich_with_canonical(candidate, canonical_record)
                break

        sorted_group = sorted(group, key=rank_manifest, reverse=True)
        chosen = canonical_choice or sorted_group[0]
        chosen_path = normalize_path(chosen.get("source_path", ""))
        canonical_record = canonical_map.get(chosen_path)
        chosen = enrich_with_canonical(chosen, canonical_record)

        deduplicated.append(chosen)
        duplicate_groups[skill_id] = {
            "count": len(group),
            "selected_source_path": chosen["source_path"],
            "selection_reason": (
                chosen.get("canonical_selection_reason")
                or "fallback_rank_manifest"
            ),
            "candidates": [item["source_path"] for item in sorted_group],
            "canonical_group": chosen.get("canonical_group", ""),
        }

    return deduplicated, duplicate_groups


def build_runtime_entry(skill: Dict) -> Dict:
    priority = str(skill.get("priority", "P3")).upper()
    bridgeable = bool(skill.get("bridgeable"))
    review_status = skill.get("review_status", "ready")
    enabled = ENABLED_BY_PRIORITY.get(priority, False) and review_status == "ready"
    recommendable = RECOMMENDABLE_BY_PRIORITY.get(priority, False) and review_status == "ready"
    bridge_enabled = BRIDGE_BY_PRIORITY.get(priority, False) and bridgeable and review_status == "ready"
    deep_execute_enabled = DEEP_EXECUTE_BY_PRIORITY.get(priority, False) and bridge_enabled

    return {
        "enabled": enabled,
        "priority": priority,
        "recommendable": recommendable,
        "bridge_enabled": bridge_enabled,
        "deep_execute_enabled": deep_execute_enabled,
        "status": "active" if enabled else "disabled",
        "notes": skill.get("recommended_action", ""),
    }


def build_runtime_config(skills: List[Dict]) -> Dict:
    runtime_skills = {skill["skill_id"]: build_runtime_entry(skill) for skill in skills}
    active_total = sum(1 for item in runtime_skills.values() if item["enabled"])
    recommendable_total = sum(1 for item in runtime_skills.values() if item["recommendable"])
    bridge_enabled_total = sum(1 for item in runtime_skills.values() if item["bridge_enabled"])

    return {
        "version": "1.0.0",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "defaults": {
            "enabled": False,
            "recommendable": True,
            "bridge_enabled": True,
            "deep_execute_enabled": False,
        },
        "summary": {
            "total": len(runtime_skills),
            "activeTotal": active_total,
            "disabledTotal": len(runtime_skills) - active_total,
            "recommendableTotal": recommendable_total,
            "bridgeEnabledTotal": bridge_enabled_total,
        },
        "skills": runtime_skills,
    }


def build_category_summary(skills: List[Dict]) -> Dict[str, List[str]]:
    usage_methods = sorted({skill.get("usage_category", {}).get("usage_method", "") for skill in skills if skill.get("usage_category", {}).get("usage_method")})
    families = sorted({skill.get("usage_category", {}).get("family", "") for skill in skills if skill.get("usage_category", {}).get("family")})
    domains = sorted({skill.get("usage_category", {}).get("domain", "") for skill in skills if skill.get("usage_category", {}).get("domain")})
    priorities = sorted({str(skill.get("priority", "")) for skill in skills if skill.get("priority")})
    return {
        "usage_method": usage_methods,
        "family": families,
        "domain": domains,
        "priority": priorities,
    }


def build_registry(workspace: Path, selected: List[Dict], candidates: List[Dict], duplicate_groups: Dict[str, Dict], canonical_path: Path, runtime_config: Dict) -> Dict:
    priority_counter = Counter(str(skill.get("priority", "P3")) for skill in selected)
    asset_counter = Counter(str(skill.get("asset_status", "未知")) for skill in selected)
    review_counter = Counter(str(skill.get("review_status", "ready")) for skill in selected)

    return {
        "version": "2.0.0",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "inventoryTotal": len(load_json(workspace / "artifacts/skills_governance/skill_manifests_draft.json")),
        "registeredTotal": len(selected),
        "activeTotal": runtime_config["summary"]["activeTotal"],
        "disabledTotal": runtime_config["summary"]["disabledTotal"],
        "sourceCandidateTotal": len(candidates),
        "duplicateGroupCount": len(duplicate_groups),
        "canonicalDecisionSource": str(canonical_path.as_posix()) if canonical_path.exists() else "",
        "duplicateResolution": "Prefer round-2 canonical skill decisions when available; otherwise fall back to canonical skills/ paths, exclude mirrored/backup paths, then prefer longer summary, higher-priority language, and stable source_path ordering.",
        "categories": build_category_summary(selected),
        "prioritySummary": dict(priority_counter),
        "assetStatusSummary": dict(asset_counter),
        "reviewStatusSummary": dict(review_counter),
        "duplicateReport": duplicate_groups,
        "skills": selected,
    }


def main() -> None:
    workspace = Path(__file__).resolve().parent.parent
    source_path = workspace / "artifacts/skills_governance/skill_manifests_draft.json"
    canonical_path = workspace / "plans/skills_round2_canonical_skills.json"
    registry_dir = workspace / "skills_registry"
    manifest_dir = registry_dir / "manifests"
    runtime_path = registry_dir / "runtime_config.json"

    ensure_dir(registry_dir)
    ensure_dir(manifest_dir)

    manifests: List[Dict] = load_json(source_path)
    candidates = [slim_manifest(item) for item in manifests if is_registry_candidate(item)]
    canonical_map = load_canonical_map(canonical_path)
    selected, duplicate_groups = deduplicate_manifests(candidates, canonical_map)
    selected.sort(key=lambda x: (
        x.get("usage_category", {}).get("usage_method", ""),
        x.get("usage_category", {}).get("family", ""),
        x.get("priority", "P3"),
        x.get("name", ""),
        x.get("skill_id", ""),
    ))

    runtime_config = build_runtime_config(selected)
    registry = build_registry(workspace, selected, candidates, duplicate_groups, canonical_path, runtime_config)

    (registry_dir / "index.json").write_text(
        json.dumps(registry, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    runtime_path.write_text(
        json.dumps(runtime_config, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    for item in selected:
        safe_name = item["skill_id"].replace("::", "__").replace("/", "_")
        (manifest_dir / f"{safe_name}.json").write_text(
            json.dumps(item, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    print(json.dumps({
        "registry_path": str((registry_dir / "index.json").as_posix()),
        "runtime_config_path": str(runtime_path.as_posix()),
        "registered_total": len(selected),
        "active_total": runtime_config["summary"]["activeTotal"],
        "source_candidate_total": len(candidates),
        "duplicate_group_count": len(duplicate_groups),
        "canonical_map_count": len(canonical_map),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
