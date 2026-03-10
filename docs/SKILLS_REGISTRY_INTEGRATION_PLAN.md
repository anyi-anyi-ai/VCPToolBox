# VCP Skills Registry 与技能插件桥接实施方案

## 1. 目标范围

本文档面向你确认的前两步实施：

1. **先做技能注册表**
2. **再做技能插件桥**

当前不直接改动 [`server.js`](server.js) 主对话链做深度内化，而是优先建立：
- 一个 VCP 可读取的技能注册资产层；
- 一个把“可工具化技能”接到 VCP 插件生态的桥接层。

这两步完成后，VCP 就会具备“知道有哪些技能”以及“能调用部分技能”的基础能力。

---

## 2. 推荐落位架构

### 2.1 技能注册表层

建议新增目录：
- `skills_registry/`
- `skills_registry/manifests/`
- `skills_registry/index.json`

用途：
- 存放从 [`artifacts/skills_governance/skill_manifests_draft.json`](../artifacts/skills_governance/skill_manifests_draft.json) 精炼后的正式注册资产；
- 作为后续 [`AdminPanel/`](../AdminPanel) 和后端技能 API 的统一数据源；
- 为插件桥、工作流内化提供查询基础。

### 2.2 技能插件桥层

建议新增插件目录：
- `Plugin/VCPSkillsBridge/`

插件职责：
- 读取 `skills_registry/index.json`
- 提供技能查询与候选推荐
- 提供对“可工具化技能”的统一调用入口
- 先桥接如下类型技能：
  - 检索型技能
  - 校验型技能
  - 审查型技能
  - 治理型技能

---

## 3. 第一步：技能注册表怎么做

### 3.1 注册表最小结构

建议定义 [`skills_registry/index.json`](../skills_registry/index.json) 结构如下：

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-03-06T00:00:00Z",
  "skills": [
    {
      "skill_id": "everything-claude-code-main::search-first",
      "name": "search-first",
      "title": "Research Before You Code",
      "summary": "Research-before-coding workflow",
      "category": {
        "l1": "C. 知识生产与持续学习",
        "l2": "C3. 检索增强与研究",
        "l3": "C3-1. 研究与检索增强"
      },
      "capability_type": "核心能力",
      "priority": "P0",
      "status": "candidate",
      "source_origin": "everything-claude-code-main",
      "source_path": "...",
      "vcp_mapping": ["KnowledgeBase", "SkillsRegistry"],
      "bridgeable": true,
      "trigger_mode": "manual_or_rule",
      "tags": ["P0", "核心能力", "lang:en"]
    }
  ]
}
```

### 3.2 注册表只放什么

建议只放：
- `P0`
- `核心能力`
- `可执行技能`
- `非待确认项`

不要一开始把 2938 条全量塞进去。

### 3.3 首批注册表候选来源

建议优先从以下文件筛选：
- [`artifacts/skills_governance/p0_candidates.json`](../artifacts/skills_governance/p0_candidates.json)
- [`artifacts/skills_governance/core_capabilities.json`](../artifacts/skills_governance/core_capabilities.json)

### 3.4 注册表在 VCP 中的作用

| 使用方 | 作用 |
|---|---|
| 插件桥 | 查询“某类技能有哪些” |
| 管理面板 | 展示技能目录、优先级、状态 |
| 后端 API | 返回技能列表、详情、候选推荐 |
| 后续工作流引擎 | 作为技能决策输入 |

---

## 4. 第二步：技能插件桥怎么做

### 4.1 为什么先做桥，而不是直接深植入

因为桥接方式：
- 对现有 VCP 架构更稳；
- 复用 [`Plugin.js`](../Plugin.js) 的插件生态；
- 便于先跑通技能查询、技能推荐、技能触发，而不需要立刻重构主对话链。

### 4.2 插件桥建议能力

`Plugin/VCPSkillsBridge/` 建议提供以下最小能力：

| 能力 | 说明 |
|---|---|
| `list_skills` | 按分类、优先级、标签列出技能 |
| `get_skill_detail` | 查看某个技能详情 |
| `recommend_skills` | 按任务类型推荐技能 |
| `list_bridgeable_skills` | 查看可桥接技能 |
| `run_skill_stub` | 先做占位调用，返回技能定义/建议动作，而不是立即深执行 |

### 4.3 为什么先做 `run_skill_stub`

因为原始 skill 多数是“工作流说明”，不是可直接运行的脚本。

所以第一阶段插件桥不应该假装“技能已经真的执行了”，而应该：
- 返回技能定义；
- 返回适用场景；
- 返回建议下一步；
- 返回该技能对应的 VCP 处理方式。

换句话说：

> 第一步插件桥更像“技能解释器 / 技能路由器”，而不是“技能执行引擎”。

### 4.4 首批桥接技能建议

| 技能 | 类型 | 桥接方式 |
|---|---|---|
| search-first | 检索研究类 | 返回研究步骤与推荐动作 |
| iterative-retrieval | 检索增强类 | 返回多轮检索策略 |
| verification-loop | 验证类 | 返回验证检查表 |
| security-review | 审查类 | 返回安全审查清单 |
| skill-stocktake | 治理类 | 返回盘点流程与治理动作 |

这些技能都适合先做“桥接型插件能力”。

---

## 5. 推荐的工程改造顺序

### 5.1 先做注册表生成器

可新增：
- `tools/build_skills_registry.py`

作用：
- 从 [`artifacts/skills_governance/skill_manifests_draft.json`](../artifacts/skills_governance/skill_manifests_draft.json) 提取正式注册表；
- 只保留 `P0 + 核心能力 + 可执行技能 + 非待确认`；
- 输出到 `skills_registry/index.json`。

### 5.2 再做插件桥目录

建议新增：
- `Plugin/VCPSkillsBridge/plugin-manifest.json`
- `Plugin/VCPSkillsBridge/VCPSkillsBridge.js`

插件类型建议：
- `synchronous`

因为第一阶段主要是：
- 查技能；
- 看技能；
- 推荐技能；
- 返回桥接说明。

### 5.3 再补管理端接口

建议在 [`routes/adminPanelRoutes.js`](../routes/adminPanelRoutes.js) 增加：
- `/admin_api/skills/registry`
- `/admin_api/skills/registry/:skillId`
- `/admin_api/skills/bridgeable`

作用：
- 给 [`AdminPanel/`](../AdminPanel) 看技能注册表；
- 为后续技能管理页做准备。

---

## 6. 与 VCP 现有结构的映射

| 新增内容 | 推荐落点 | 原因 |
|---|---|---|
| 注册表文件 | `skills_registry/` | 独立于原始 skills，保持清晰边界 |
| 注册表生成器 | `tools/` | 属于治理工具链 |
| 插件桥 | `Plugin/VCPSkillsBridge/` | 复用现有插件执行体系 |
| 管理端 API | [`routes/adminPanelRoutes.js`](../routes/adminPanelRoutes.js) | 便于面板展示 |
| 管理面板前端 | [`AdminPanel/`](../AdminPanel) | 后续再扩技能管理页 |

---

## 7. 当前最建议的实施方案

### 7.1 先做什么

先做这两个具体动作：

1. **把治理结果落成正式注册表**
   - 新增 `skills_registry/index.json`
   - 新增 `tools/build_skills_registry.py`

2. **做技能插件桥**
   - 新增 `Plugin/VCPSkillsBridge/`
   - 先实现查询/推荐/占位执行，不做深度工作流内化

### 7.2 这两步完成后会得到什么

完成后，VCP 将具备：
- 一个正式技能目录；
- 一个可被插件调用的技能查询桥；
- 一个后续可接入管理面板和工作流引擎的中间层。

也就是说，这时 VCP 会进入：

> **“技能已被平台识别，并可通过桥接方式被使用”**

而不是仍停留在纯文档整理阶段。

---

## 8. 最终建议

如果你同意继续落地，我建议下一步就直接实施：

### 第一批真实工程产物
- [`tools/build_skills_registry.py`](../tools/build_skills_registry.py)
- [`skills_registry/index.json`](../skills_registry/index.json)
- [`Plugin/VCPSkillsBridge/plugin-manifest.json`](../Plugin/VCPSkillsBridge/plugin-manifest.json)
- [`Plugin/VCPSkillsBridge/VCPSkillsBridge.js`](../Plugin/VCPSkillsBridge/VCPSkillsBridge.js)

这会把“步骤一和步骤二”从规划正式推进到 VCP 代码层落地。