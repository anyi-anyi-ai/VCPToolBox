# VCP Skills 接入待办清单

## 1. 当前阶段定位

基于 [`tools/skills_classifier.py`](tools/skills_classifier.py) 与 [`tools/skills_governance.py`](tools/skills_governance.py) 的输出，当前已具备从“技能归类治理”进入“VCP 接入实施准备”的条件。

本清单用于把现有治理结果转成可执行 backlog，供后续按迭代推进。

---

## 2. P0 接入待办

### 2.1 工作流主链能力

| 优先级 | 技能 | 建议接入模块 | 目标 | 状态 |
|---|---|---|---|---|
| P0 | brainstorming | Agent Orchestrator | 建立复杂任务前置澄清流程 | 待实施 |
| P0 | writing-plans | WorkflowEngine | 建立设计到计划的桥接能力 | 待实施 |
| P0 | subagent-driven-development | Agent Orchestrator / WorkflowEngine | 建立复杂任务执行主链 | 待实施 |
| P0 | search-first | KnowledgeBase / SkillsRegistry | 建立先检索后执行机制 | 待实施 |
| P0 | iterative-retrieval | KnowledgeBase | 增强多轮上下文检索能力 | 待实施 |

### 2.2 质量与交付能力

| 优先级 | 技能 | 建议接入模块 | 目标 | 状态 |
|---|---|---|---|---|
| P0 | verification-before-completion | QualityGate | 建立完成前验证门禁 | 待实施 |
| P0 | verification-loop | QualityGate | 建立持续验证循环 | 待实施 |
| P0 | security-review | QualityGate / PluginReview | 建立技能与插件接入安全门禁 | 待实施 |
| P0 | systematic-debugging | DebugMode | 建立标准化调试流程 | 待实施 |
| P0 | tdd-workflow | WorkflowEngine / QualityGate | 建立测试优先开发工作流 | 待实施 |

### 2.3 技能治理能力

| 优先级 | 技能 | 建议接入模块 | 目标 | 状态 |
|---|---|---|---|---|
| P0 | skill-stocktake | SkillsRegistry | 建立技能盘点与审计机制 | 已完成治理输出，待接入 |
| P0 | writing-skills | SkillsRegistry / AdminPanel | 建立新技能编写规范模板 | 已完成治理输出，待接入 |
| P0 | continuous-learning-v2 | KnowledgeBase / MemorySystem | 建立技能持续沉淀与演化机制 | 待实施 |

---

## 3. 重复技能治理待办

### 3.1 已识别重复组

重复组清单见 [`artifacts/skills_governance/duplicate_groups.md`](artifacts/skills_governance/duplicate_groups.md)。

| 重复组 | 建议处理策略 |
|---|---|
| testing_tdd | 统一成一套 TDD 主流程 + 语言/框架子模板 |
| verification_loop | 区分完成前校验、持续验证、系统评测三层 |
| workflow_planning_execution | 拆分为规划、执行、协同三类能力 |
| security_debugging | 拆分为安全审查与调试诊断两套流 |
| research_retrieval | 拆分为研究检索与知识增强两类 |

### 3.2 重复治理动作

| 动作 | 说明 | 状态 |
|---|---|---|
| 输出重复组人工复核清单 | 已具备数据基础 | 待实施 |
| 为每个重复组指定主技能 | 形成保留/合并/归档决策 | 待实施 |
| 将重复组处理结果回写 manifest | 保持技能注册表一致 | 待实施 |

---

## 4. 待确认项治理待办

待确认技能清单见 [`artifacts/skills_governance/pending_review.md`](artifacts/skills_governance/pending_review.md)。

| 动作 | 目标 | 状态 |
|---|---|---|
| 抽样审查 `unknown` 语言技能 | 继续压缩待确认项 | 待实施 |
| 专项审查西语技能 | 校正西语技能分类 | 待实施 |
| 为高价值待确认项补充规则 | 提升自动化识别率 | 待实施 |
| 把确认后的结果回写 inventory | 保持数据一致性 | 待实施 |

---

## 5. VCP Skill Manifest 接入待办

### 5.1 当前成果

已生成：
- [`artifacts/skills_governance/skill_manifests_draft.json`](artifacts/skills_governance/skill_manifests_draft.json)
- [`artifacts/skills_governance/manifest_drafts`](artifacts/skills_governance/manifest_drafts)

### 5.2 下一步接入事项

| 动作 | 目标 | 状态 |
|---|---|---|
| 定义 VCP Skill Manifest 正式 schema | 从草案转正 | 待实施 |
| 建立 SkillsRegistry 读取能力 | 让 VCP 可直接读取 manifest | 待实施 |
| 设计 AdminPanel 技能管理页 | 让技能可视化管理 | 待实施 |
| 将 P0 manifest 先接入试点 | 建立最小可用技能池 | 待实施 |

---

## 6. 推荐实施顺序

| 顺序 | 动作 | 原因 |
|---|---|---|
| 1 | 固化 Skill Manifest schema | 所有接入的基础 |
| 2 | 接入 P0 工作流技能 | 最快形成价值闭环 |
| 3 | 接入质量门禁技能 | 提升可信度 |
| 4 | 建立重复治理流程 | 避免技能池失控 |
| 5 | 建立 AdminPanel 技能管理页 | 提高可运营性 |
| 6 | 推进持续学习能力 | 进入生态自演化阶段 |

---

## 7. 当前结论

当前已经不是“是否可以开始接入”的问题，而是“按什么顺序接入最稳妥”的问题。现有产物已经足够支撑：

1. P0 技能试点接入；
2. 重复技能治理；
3. VCP Skill Manifest 标准化；
4. 技能管理后台设计输入。

当前最建议立即推进的是：
- 先以 [`artifacts/skills_governance/p0_candidates.md`](artifacts/skills_governance/p0_candidates.md) 为基础建立首批接入名单；
- 再用 [`artifacts/skills_governance/skill_manifests_draft.json`](artifacts/skills_governance/skill_manifests_draft.json) 作为 VCP 技能注册表原型数据源。