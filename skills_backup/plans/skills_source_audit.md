# 技能来源审计清单

## 审计范围

本清单面向 [`artifacts/skills_governance/skill_manifests_draft.json`](../artifacts/skills_governance/skill_manifests_draft.json) 中会进入技能注册表候选集的记录，目标是为后续来源清理提供明确依据。

当前采用的候选过滤条件与 [`tools/build_skills_registry.py`](../tools/build_skills_registry.py) 一致：
- `priority == P0`
- `capability_type == 核心能力`
- `asset_status == 可执行技能`
- `status != needs_review`
- `issue_flags` 中不含“待确认”

---

## 已确认的裁决规则

### 规则 1：镜像来源只保留原始 `skills/`
当同一 `skill_id` 同时出现在多个来源时，只保留仓库原始 `skills/` 目录中的来源。

优先级顺序：
1. 原始 `skills/`
2. 其余全部视为次级来源或冗余来源

### 规则 2：多语言重复只保留中文主版本
当同一 `skill_id` 因多语言目录产生重复时：
- 保留中文主版本
- 非中文版本全部视为重复候选
- 当前阶段不做多语言并存
- 当前阶段不改造 `skill_id` 编码

### 规则 3：先审计，再删除
当前阶段先形成来源清单，不直接删除上游治理草案中的记录。

---

## 来源模式判定表

| 来源模式 | 分类 | 建议动作 | 说明 |
|---|---|---|---|
| `.../skills/.../SKILL.md` | 主来源 | 保留 | 原始技能目录 |
| `.../web-app/public/skills/.../SKILL.md` | 发布镜像 | 排除 | Web 前端发布副本 |
| `.../skills-original-backup/.../SKILL.md` | 历史备份 | 排除 | 备份目录，不应作为正式来源 |
| `.../docs/.../skills/.../SKILL.md` | 文档变体 | 复核 | 可能为文档镜像，也可能是唯一来源 |
| 同一 `skill_id` 的中文版本 | 语言主版本 | 保留 | 当前规则指定中文优先 |
| 同一 `skill_id` 的非中文版本 | 语言重复候选 | 排除并审计 | 不进入当前正式注册表 |
| `language_hint = unknown` 且路径位于 `skills/` | 未知语言主来源 | 暂保留并复核 | 路径可信，但语言待确认 |

---

## 审计输出结构

### A. 应保留来源
进入正式注册表的稳定来源应满足：
- 位于原始 `skills/`
- 若存在多语言重复，则为中文版本
- 不属于镜像、备份、发布副本

建议记录字段：
- `skill_id`
- `selected_source_path`
- `language_hint`
- `selection_reason`

### B. 应排除来源
满足以下任一条件的记录应列为排除：
- 位于 `web-app/public/skills/`
- 位于 `skills-original-backup/`
- 为同组中的非中文语言版本
- 与原始 `skills/` 重复的镜像来源

建议记录字段：
- `skill_id`
- `excluded_source_path`
- `exclude_reason`
- `canonical_source_path`

### C. 待人工复核来源
以下来源不建议自动删除，但需要人工确认：
- 位于 `docs/.../skills/...`
- 不在原始 `skills/`，但可能内容更完整
- `language_hint` 缺失或不可信
- 目录结构异常，无法自动分类为主来源或镜像来源

建议记录字段：
- `skill_id`
- `source_path`
- `language_hint`
- `review_reason`

---

## 当前高优先排除模式

### 1. 发布镜像来源
以下路径模式应优先列为排除：
- `*/web-app/public/skills/*`

原因：
- 与原始 `skills/` 重复概率高
- 语义上属于发布副本，不应作为治理主来源
- 已在重复样本中确认是高频冲突来源

### 2. 历史备份来源
以下路径模式应优先列为排除：
- `*/skills-original-backup/*`

原因：
- 明确属于历史备份
- 不应进入正式治理草案或技能注册表主来源

### 3. 非中文语言版本
在同一 `skill_id` 下，若存在中文版本，则以下记录应列为排除候选：
- `language_hint != zh*`

原因：
- 当前规则已明确中文主版本优先
- 非中文版本当前阶段只保留审计信息，不进入正式注册表

---

## 待重点复核模式

### 1. 文档目录变体
路径模式：
- `*/docs/*/skills/*`

处理建议：
- 不立即删除
- 单独列出
- 判断其是否存在对应原始 `skills/` 主来源

### 2. 语言未知但位于主目录
路径模式：
- `*/skills/*`
- `language_hint = unknown`

处理建议：
- 暂保留
- 人工确认语言与稳定性

### 3. 非标准结构来源
处理建议：
- 若既不属于原始 `skills/`，也不属于明显镜像或备份，则单独归入复核池

---

## 推荐后续动作

### 下一步 1：生成细化来源分组表
建议后续基于本清单，继续生成一份结构化审计结果，至少包含：
- 每个重复 `skill_id` 的所有来源路径
- 每条来源的分类（保留 / 排除 / 复核）
- 每组的最终推荐保留项

### 下一步 2：确认后再实施清理
在你确认审计结果后，可选两种清理方式：

1. 只强化 [`tools/build_skills_registry.py`](../tools/build_skills_registry.py) 的来源过滤规则
2. 直接清理 [`artifacts/skills_governance/skill_manifests_draft.json`](../artifacts/skills_governance/skill_manifests_draft.json) 中的冗余来源

### 下一步 3：保持注册表与治理草案一致
无论采用哪种清理方式，最终目标都应是：
- 上游治理草案减少镜像与备份冗余
- 下游注册表无需依赖过多冲突吸收逻辑
- `skill_id` 在语义上和产物上都保持稳定唯一

---

## 全量来源分组明细摘要

基于 [`artifacts/skills_source_audit_detail.py`](../artifacts/skills_source_audit_detail.py) 对 [`artifacts/skills_governance/skill_manifests_draft.json`](../artifacts/skills_governance/skill_manifests_draft.json) 的全量候选扫描，已生成结构化明细文件 [`artifacts/skills_source_audit_detail.json`](../artifacts/skills_source_audit_detail.json)。

### 统计结果
- 候选总数：`75`
- 重复 `skill_id` 组数：`23`
- 重复来源记录总数：`66`

### 标签分布
- `primary_skills`: `30`
- `mirror_webapp`: `8`
- `backup`: `7`
- `docs_variant`: `21`
- `non_zh_when_zh_exists`: `20`
- `language_unknown`: `26`

### 语言分布
- `zh`: `11`
- `en`: `29`
- `unknown`: `26`

### 当前发现
1. 镜像与备份来源并不是唯一问题，`docs_variant` 数量达到 `21`，说明文档目录技能副本也是重复主因之一。
2. 多语言冲突已经具备规模，`non_zh_when_zh_exists` 有 `20` 条，按当前规则都应进入排除候选。
3. `language_unknown` 有 `26` 条，说明后续真正清理前，仍需对“未知语言但路径可信”的来源做一次单独判定。
4. 结构化明细里已经为每个重复 `skill_id` 列出全部来源、语言、标签，可直接用于后续清理决策。

### 示例分组
- [`antigravity-awesome-skills-main::brainstorming`](../artifacts/skills_source_audit_detail.json)
  - 保留：原始 `skills/brainstorming/SKILL.md`
  - 排除：`web-app/public/skills/brainstorming/SKILL.md`
- [`chiclaude-skills-main::brainstorming`](../artifacts/skills_source_audit_detail.json)
  - 候选 1：中文主版本，位于 `skills/...`
  - 候选 2：英文版本，位于 `skills/...`
  - 候选 3：英文备份版本，位于 `skills-original-backup/...`
  - 按当前规则，应保留中文主版本，其余仅保留审计记录

## 当前审计结论

按照已确认规则，当前来源稳定性排序可总结为：

1. **原始 `skills/` 中文版本**：正式保留目标
2. **原始 `skills/` 语言未知版本**：暂保留并复核
3. **`docs/.../skills/...` 变体**：待人工复核
4. **`web-app/public/skills/` 发布镜像**：优先排除
5. **`skills-original-backup/` 历史备份**：优先排除
6. **同组中的非中文语言版本**：排除并审计

这份清单与 [`artifacts/skills_source_audit_detail.json`](../artifacts/skills_source_audit_detail.json) 可共同作为下一步执行来源细化清理的规则基线。
