#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VCP Skills Classifier

用于对外部 skills 目录做首轮盘点、归类、清洗建议输出，目标是为后续接入 VCP 生态提供结构化资产清单。

默认扫描目录：../VCPziliao/skills
输出目录：./artifacts/skills_inventory

功能：
1. 递归扫描技能仓库与技能目录
2. 自动识别 SKILL.md / README / 其他说明文件
3. 提取 frontmatter / 标题 / 简介 / 来源仓库 / 文件路径
4. 依据预设规则进行一级、二级、三级分类
5. 标注能力属性：核心能力 / 通用能力 / 支撑能力 / 扩展能力
6. 标注接入优先级：P0 / P1 / P2
7. 检测重复、模糊、非技能型内容、待确认项
8. 输出 JSON / CSV / Markdown 汇总文件

运行示例：
    python tools/skills_classifier.py
    python tools/skills_classifier.py --skills-root ../VCPziliao/skills
    python tools/skills_classifier.py --output-dir artifacts/skills_inventory
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from collections import defaultdict
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple


CATEGORY_RULES = [
    {
        "match": ["brainstorm", "plan", "subagent", "parallel-agents", "git-worktrees", "development-branch", "code-review", "executing-plans"],
        "category_l1": "A. Agent工作流与任务编排",
        "category_l2": "A2. 执行调度与协同开发",
        "category_l3": "A2-1. 任务执行与协作流",
    },
    {
        "match": ["brainstorming"],
        "category_l1": "A. Agent工作流与任务编排",
        "category_l2": "A1. 需求澄清与方案设计",
        "category_l3": "A1-1. 需求澄清与设计前置",
    },
    {
        "match": ["writing-plans"],
        "category_l1": "A. Agent工作流与任务编排",
        "category_l2": "A1. 需求澄清与方案设计",
        "category_l3": "A1-3. 实施规划",
    },
    {
        "match": ["tdd", "testing", "verification", "eval-harness", "e2e-testing"],
        "category_l1": "B. 工程实现与质量保障",
        "category_l2": "B2. 测试与验证",
        "category_l3": "B2-1. 测试验证闭环",
    },
    {
        "match": ["debug", "security", "scan"],
        "category_l1": "B. 工程实现与质量保障",
        "category_l2": "B3. 安全与稳定性",
        "category_l3": "B3-1. 安全审查与问题定位",
    },
    {
        "match": ["coding-standards"],
        "category_l1": "B. 工程实现与质量保障",
        "category_l2": "B1. 开发范式",
        "category_l3": "B1-2. 编码规范",
    },
    {
        "match": ["continuous-learning", "strategic-compact"],
        "category_l1": "C. 知识生产与持续学习",
        "category_l2": "C2. 会话学习与经验沉淀",
        "category_l3": "C2-1. 学习与压缩",
    },
    {
        "match": ["stocktake", "writing-skills", "guidelines"],
        "category_l1": "C. 知识生产与持续学习",
        "category_l2": "C1. 技能资产治理",
        "category_l3": "C1-1. 盘点、编写与治理",
    },
    {
        "match": ["search", "retrieval", "research", "regex-vs-llm"],
        "category_l1": "C. 知识生产与持续学习",
        "category_l2": "C3. 检索增强与研究",
        "category_l3": "C3-1. 研究与检索增强",
    },
    {
        "match": ["backend", "api", "database", "postgres", "jpa", "springboot", "django", "python", "golang", "java", "cpp", "clickhouse", "swift-actor", "swift-concurrency", "swift-protocol"],
        "category_l1": "D. 领域能力与专业模板",
        "category_l2": "D1. 通用软件架构与后端",
        "category_l3": "D1-1. 后端与语言专项模板",
    },
    {
        "match": ["frontend", "liquid-glass", "swiftui", "css", "slides"],
        "category_l1": "D. 领域能力与专业模板",
        "category_l2": "D2. 前端与体验设计",
        "category_l3": "D2-1. 前端界面与体验表达",
    },
    {
        "match": ["article", "content", "investor", "visa", "document", "foundation-models-on-device", "market-research"],
        "category_l1": "D. 领域能力与专业模板",
        "category_l2": "D3. 行业化/专项场景",
        "category_l3": "D3-1. 专项业务与内容场景",
    },
    {
        "match": ["docker", "deployment", "configure", "using-superpowers", "hash-cache", "package-manager", "hook"],
        "category_l1": "E. 平台配置与运行支撑",
        "category_l2": "E1. 平台配置与安装",
        "category_l3": "E1-1. 配置、部署与运行支撑",
    },
]


PRIORITY_RULES = {
    "P0": [
        "brainstorming",
        "writing-plans",
        "subagent-driven-development",
        "search-first",
        "iterative-retrieval",
        "skill-stocktake",
        "writing-skills",
        "verification-before-completion",
        "verification-loop",
        "security-review",
        "systematic-debugging",
        "tdd-workflow",
        "test-driven-development",
        "api-design",
        "backend-patterns",
        "frontend-patterns",
        "continuous-learning-v2",
    ],
    "P1": [
        "executing-plans",
        "dispatching-parallel-agents",
        "requesting-code-review",
        "receiving-code-review",
        "docker-patterns",
        "deployment-patterns",
        "continuous-learning",
        "strategic-compact",
        "eval-harness",
        "e2e-testing",
        "coding-standards",
        "python-patterns",
        "python-testing",
        "cost-aware-llm-pipeline",
    ],
}


CAPABILITY_RULES = {
    "核心能力": {
        "names": {
            "brainstorming", "writing-plans", "subagent-driven-development",
            "search-first", "iterative-retrieval", "skill-stocktake",
            "writing-skills", "verification-before-completion", "verification-loop",
            "security-review", "systematic-debugging", "tdd-workflow",
            "test-driven-development", "api-design", "backend-patterns",
            "frontend-patterns", "continuous-learning-v2"
        }
    },
    "通用能力": {
        "names": {
            "executing-plans", "dispatching-parallel-agents", "requesting-code-review",
            "receiving-code-review", "docker-patterns", "deployment-patterns",
            "continuous-learning", "strategic-compact", "eval-harness",
            "e2e-testing", "coding-standards", "python-patterns",
            "python-testing", "cost-aware-llm-pipeline"
        }
    },
    "支撑能力": {
        "names": {"using-superpowers", "configure-ecc", "project-guidelines-example", "content-hash-cache-pattern"}
    },
}


NON_SKILL_KEYWORDS = ["license", "contributing", "code-of-conduct", "release-notes", "third_party_notices"]

LANGUAGE_HINTS = {
    "es": ["arquitecto", "soluciones", "habilidades", "inteligencia", "dominio", "diagnostica", "despliega"],
    "en": ["expert", "workflow", "testing", "security", "agent", "design", "implementation"],
    "zh": ["技能", "工作流", "测试", "安全", "设计", "规划", "知识"],
}

SEMANTIC_KEYWORDS = [
    ("A. Agent工作流与任务编排", "A1. 需求澄清与方案设计", "A1-1. 需求澄清与设计前置", ["architect", "consultant", "roadmap", "spec", "requirements", "design"]),
    ("A. Agent工作流与任务编排", "A2. 执行调度与协同开发", "A2-1. 任务执行与协作流", ["agent orchestration", "orchestration", "multi-agent", "subagent", "workflow", "delegate"]),
    ("B. 工程实现与质量保障", "B2. 测试与验证", "B2-1. 测试验证闭环", ["test", "testing", "verification", "validate", "qa", "quality"]),
    ("B. 工程实现与质量保障", "B3. 安全与稳定性", "B3-1. 安全审查与问题定位", ["security", "secure", "audit", "debug", "fuzz", "vulnerability"]),
    ("C. 知识生产与持续学习", "C1. 技能资产治理", "C1-1. 盘点、编写与治理", ["skill", "skills", "guideline", "governance", "inventory", "stocktake"]),
    ("C. 知识生产与持续学习", "C2. 会话学习与经验沉淀", "C2-1. 学习与压缩", ["learning", "memory", "compact", "compression", "session"]),
    ("C. 知识生产与持续学习", "C3. 检索增强与研究", "C3-1. 研究与检索增强", ["search", "retrieval", "research", "rag", "mcp", "knowledge"]),
    ("D. 领域能力与专业模板", "D1. 通用软件架构与后端", "D1-1. 后端与语言专项模板", ["api", "backend", "python", "java", "golang", "cpp", "database", "server", "framework"]),
    ("D. 领域能力与专业模板", "D2. 前端与体验设计", "D2-1. 前端界面与体验表达", ["frontend", "ui", "ux", "web", "react", "angular", "vue", "css", "3d"]),
    ("D. 领域能力与专业模板", "D3. 行业化/专项场景", "D3-1. 专项业务与内容场景", ["content", "article", "document", "translation", "investor", "market"]),
    ("E. 平台配置与运行支撑", "E1. 平台配置与安装", "E1-1. 配置、部署与运行支撑", ["setup", "install", "configure", "docker", "deploy", "hook", "package manager"]),
]


@dataclass
class SkillRecord:
    repo: str
    skill_name: str
    display_title: str
    source_path: str
    file_type: str
    language_hint: str
    description: str
    category_l1: str
    category_l2: str
    category_l3: str
    capability_type: str
    priority: str
    integration_phase: str
    asset_status: str
    duplicate_group: str
    issue_flags: str
    recommended_action: str


FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
TITLE_RE = re.compile(r"^#\s+(.+)$", re.MULTILINE)
DESC_RE = re.compile(r"^description:\s*\"?(.*?)\"?$", re.MULTILINE)
NAME_RE = re.compile(r"^name:\s*([A-Za-z0-9_\-./]+)$", re.MULTILINE)


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8", errors="ignore")


def extract_frontmatter(content: str) -> Dict[str, str]:
    result: Dict[str, str] = {}
    match = FRONTMATTER_RE.match(content)
    if not match:
        return result
    for line in match.group(1).splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        result[key.strip()] = value.strip().strip('"')
    return result


def extract_title(content: str, fallback: str) -> str:
    match = TITLE_RE.search(content)
    if match:
        return match.group(1).strip()
    return fallback


def detect_file_type(path: Path) -> str:
    name = path.name.lower()
    if name == "skill.md":
        return "skill"
    if name == "readme.md":
        return "readme"
    return path.suffix.lower().lstrip(".") or "unknown"


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    return normalized.lower()


def detect_language_hint(text: str) -> str:
    haystack = normalize_text(text)
    scores = {}
    for lang, keywords in LANGUAGE_HINTS.items():
        scores[lang] = sum(1 for keyword in keywords if keyword in haystack)
    best_lang = max(scores, key=scores.get)
    return best_lang if scores[best_lang] > 0 else "unknown"


def infer_category(name: str, description: str, repo: str) -> Tuple[str, str, str]:
    haystack = normalize_text(f"{name} {description} {repo}")
    for rule in CATEGORY_RULES:
        if any(token in haystack for token in rule["match"]):
            return rule["category_l1"], rule["category_l2"], rule["category_l3"]

    for category_l1, category_l2, category_l3, keywords in SEMANTIC_KEYWORDS:
        score = sum(1 for keyword in keywords if keyword in haystack)
        if score >= 2:
            return category_l1, category_l2, category_l3

    return (
        "Z. 待确认",
        "Z1. 待补充分析",
        "Z1-1. 未识别技能",
    )


def infer_capability(name: str, category_l1: str) -> str:
    normalized = name.lower()
    for capability, config in CAPABILITY_RULES.items():
        if normalized in config["names"]:
            return capability
    if category_l1.startswith("D."):
        return "扩展能力"
    if category_l1.startswith("E."):
        return "支撑能力"
    return "通用能力"


def infer_priority(name: str, capability_type: str) -> Tuple[str, str]:
    normalized = name.lower()
    for priority, names in PRIORITY_RULES.items():
        if normalized in names:
            phase = "短期" if priority == "P0" else "中期"
            return priority, phase
    if capability_type == "扩展能力":
        return "P2", "长期"
    if capability_type == "支撑能力":
        return "P1", "中期"
    return "P1", "中期"


def infer_asset_status(file_type: str, path: Path, title: str) -> str:
    lower_path = str(path).lower()
    lower_title = title.lower()
    if any(k in lower_path or k in lower_title for k in NON_SKILL_KEYWORDS):
        return "参考资料"
    if file_type == "skill":
        return "可执行技能"
    if file_type == "readme":
        return "待确认技能说明"
    return "辅助材料"


def detect_duplicate_group(name: str) -> str:
    n = name.lower()
    if "tdd" in n or n == "test-driven-development":
        return "testing_tdd"
    if "verification" in n or "eval" in n:
        return "verification_loop"
    if "plan" in n or "brainstorm" in n or "subagent" in n:
        return "workflow_planning_execution"
    if "security" in n or "debug" in n:
        return "security_debugging"
    if "search" in n or "retrieval" in n or "research" in n:
        return "research_retrieval"
    return ""


def detect_issue_flags(name: str, status: str, category_l1: str, description: str) -> List[str]:
    flags: List[str] = []
    n = name.lower()
    d = description.lower()
    if status != "可执行技能":
        flags.append("非标准技能文件")
    if category_l1.startswith("Z."):
        flags.append("待确认分类")
    if not description.strip():
        flags.append("缺少描述")
    if n in {"continuous-learning", "continuous-learning-v2"}:
        flags.append("存在版本重叠")
    if "ecc" in d or "superpowers" in d:
        flags.append("平台原生语义待改造")
    return flags


def recommended_action(status: str, capability_type: str, issue_flags: List[str], duplicate_group: str) -> str:
    if status == "参考资料":
        return "转入参考资料库，不直接接入运行时技能体系"
    if "待确认分类" in issue_flags:
        return "补充读取内容后再分类"
    if "存在版本重叠" in issue_flags:
        return "保留较新版本，旧版本归档或并入"
    if duplicate_group:
        return "纳入重复组人工复核，必要时合并"
    if capability_type == "核心能力":
        return "优先标准化并纳入 VCP 首批接入范围"
    if capability_type == "扩展能力":
        return "列入后续扩展池，按需求接入"
    return "纳入标准化台账并继续评估"


def should_include_readme(path: Path) -> bool:
    lower_path = str(path.as_posix()).lower()
    if lower_path.count("/") <= 2:
        return True
    parts = [part.lower() for part in path.parts]
    return "skills" in parts or path.parent.name.lower() in {"template", "docs"}


def locate_skill_files(root: Path) -> List[Path]:
    candidates: List[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        lower = path.name.lower()
        if lower == "skill.md":
            candidates.append(path)
        elif lower == "readme.md" and should_include_readme(path):
            candidates.append(path)
    return sorted(candidates)


def build_record(path: Path, skills_root: Path) -> SkillRecord:
    content = read_text(path)
    frontmatter = extract_frontmatter(content)
    repo = path.relative_to(skills_root).parts[0]
    fallback_name = path.parent.name
    skill_name = frontmatter.get("name") or fallback_name
    description = frontmatter.get("description", "").strip()
    display_title = extract_title(content, fallback_name)
    file_type = detect_file_type(path)
    language_hint = detect_language_hint(f"{display_title} {description}")
    category_l1, category_l2, category_l3 = infer_category(skill_name, f"{display_title} {description}", repo)
    capability_type = infer_capability(skill_name, category_l1)
    priority, integration_phase = infer_priority(skill_name, capability_type)
    status = infer_asset_status(file_type, path, display_title)
    duplicate_group = detect_duplicate_group(skill_name)
    issue_flags_list = detect_issue_flags(skill_name, status, category_l1, description)
    if language_hint in {"es", "en"} and category_l1.startswith("Z."):
        issue_flags_list.append("多语言技能待增强分类")
    action = recommended_action(status, capability_type, issue_flags_list, duplicate_group)

    return SkillRecord(
        repo=repo,
        skill_name=skill_name,
        display_title=display_title,
        source_path=str(path.as_posix()),
        file_type=file_type,
        language_hint=language_hint,
        description=description,
        category_l1=category_l1,
        category_l2=category_l2,
        category_l3=category_l3,
        capability_type=capability_type,
        priority=priority,
        integration_phase=integration_phase,
        asset_status=status,
        duplicate_group=duplicate_group,
        issue_flags="; ".join(sorted(set(issue_flags_list))),
        recommended_action=action,
    )


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_json(records: List[SkillRecord], output_path: Path) -> None:
    data = [asdict(r) for r in records]
    output_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_csv(records: List[SkillRecord], output_path: Path) -> None:
    rows = [asdict(r) for r in records]
    if not rows:
        output_path.write_text("", encoding="utf-8")
        return
    with output_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def build_summary(records: List[SkillRecord]) -> Dict[str, Dict[str, int]]:
    summary = {
        "by_repo": {},
        "by_category_l1": {},
        "by_capability_type": {},
        "by_priority": {},
        "by_asset_status": {},
        "by_language_hint": {},
    }
    for record in records:
        for key, value in {
            "by_repo": record.repo,
            "by_category_l1": record.category_l1,
            "by_capability_type": record.capability_type,
            "by_priority": record.priority,
            "by_asset_status": record.asset_status,
            "by_language_hint": record.language_hint,
        }.items():
            summary[key][value] = summary[key].get(value, 0) + 1
    return summary


def write_markdown(records: List[SkillRecord], output_path: Path) -> None:
    summary = build_summary(records)
    lines: List[str] = []
    lines.append("# Skills 归类清洗报告")
    lines.append("")
    lines.append("## 1. 扫描摘要")
    lines.append("")
    lines.append(f"- 扫描总记录数：**{len(records)}**")
    lines.append("")

    for section, stats in summary.items():
        lines.append(f"### {section}")
        lines.append("")
        lines.append("| 项目 | 数量 |")
        lines.append("|---|---:|")
        for key, count in sorted(stats.items(), key=lambda x: (-x[1], x[0])):
            lines.append(f"| {key} | {count} |")
        lines.append("")

    duplicate_summary = defaultdict(int)
    for r in records:
        if r.duplicate_group:
            duplicate_summary[r.duplicate_group] += 1

    lines.append("## 2. 重复组摘要")
    lines.append("")
    lines.append("| 重复组 | 数量 |")
    lines.append("|---|---:|")
    for key, count in sorted(duplicate_summary.items(), key=lambda x: (-x[1], x[0])):
        lines.append(f"| {key} | {count} |")
    if not duplicate_summary:
        lines.append("| - | 0 |")
    lines.append("")

    lines.append("## 3. 技能清单")
    lines.append("")
    lines.append("| repo | skill_name | language | 分类 | 能力属性 | 优先级 | 状态 | 问题标记 | 建议动作 |")
    lines.append("|---|---|---|---|---|---|---|---|---|")
    for r in records:
        category = f"{r.category_l1} / {r.category_l2} / {r.category_l3}"
        flags = r.issue_flags or "-"
        lines.append(
            f"| {r.repo} | {r.skill_name} | {r.language_hint} | {category} | {r.capability_type} | {r.priority} | {r.asset_status} | {flags} | {r.recommended_action} |"
        )

    output_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="扫描并归类 skills 资产")
    parser.add_argument(
        "--skills-root",
        default="../VCPziliao/skills",
        help="skills 根目录，相对于当前工作区",
    )
    parser.add_argument(
        "--output-dir",
        default="artifacts/skills_inventory",
        help="输出目录，相对于当前工作区",
    )
    args = parser.parse_args()

    workspace_root = Path(__file__).resolve().parent.parent
    skills_root = (workspace_root / args.skills_root).resolve()
    output_dir = (workspace_root / args.output_dir).resolve()

    if not skills_root.exists():
        raise SystemExit(f"skills 根目录不存在: {skills_root}")

    ensure_dir(output_dir)
    files = locate_skill_files(skills_root)
    records = [build_record(path, skills_root) for path in files]

    write_json(records, output_dir / "skills_inventory.json")
    write_csv(records, output_dir / "skills_inventory.csv")
    write_markdown(records, output_dir / "skills_inventory.md")

    summary = build_summary(records)
    print("扫描完成")
    print(f"skills_root: {skills_root}")
    print(f"output_dir : {output_dir}")
    print(f"records    : {len(records)}")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
