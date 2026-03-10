# CoSearch v1.2 研究文档索引

> 本目录包含 CoSearch v1.2 PRD 升级过程中的全部调研与深度讨论成果。
> PRD 位于：`.trellis/tasks/02-26-deep-arch-upgrade/prd.md`

---

## 文档清单

| # | 文件 | 来源 | 核心内容 |
|---|------|------|----------|
| 00 | [00-2026-deep-research-landscape.md](./00-2026-deep-research-landscape.md) | 主代理调研 | 2026 年 Deep Research 最佳实践全景（Anthropic/OpenAI/FS-Researcher/评测体系） |
| 01 | [01-dim-information-theory-holographic.md](./01-dim-information-theory-holographic.md) | info-theory-expert | 信息论与全息原理视角的维度设计：正交基底、互信息、最小充分基底、第一性源 |
| 02 | [02-dim-epistemology-category-theory.md](./02-dim-epistemology-category-theory.md) | epistemology-expert | 范畴论与知识论视角：态射>对象、函子=维度、自然变换=维度间翻译、品味形式化 |
| 03 | [03-dim-engineering-practice.md](./03-dim-engineering-practice.md) | eng-practice-expert | 工程实践：6大系统调研、固定/动态权衡、Go struct、正交性检查、TC 集成方案 |
| 04 | [04-dimension-design-synthesis.md](./04-dimension-design-synthesis.md) | 综合 | 三方观点综合：维度设计的核心结论与 PRD 落地建议 |

---

## 核心洞察速查

### 从信息论（01）
- 全息原理 → 信息空间有效秩远低于表面维数（5-8 维覆盖 >95%）
- 维度设计目标：**最小化 Redundancy，最大化 Unique + Synergy**
- 第一性源 = 去掉后造成最大不可弥补信息损失的源
- 最小基底估计：贪心互信息最大化（submodular 优化）

### 从范畴论（02）
- 维度 = 函子（从问题空间到信息源空间的映射）
- **态射（关系/因果/方法）比对象（新闻/事实）更有价值**
- D1(研究) vs D2(工程) 是**对偶**而非正交，张力本身是信号
- D5(深度解读) 是**元维度**——捕获其他维度间的跨域态射
- 品味 = P(新态射 | 锚定问题)

### 从工程实践（03）
- **行业共识：没有主流系统用固定维度**，全部动态生成
- **5 个维度是甜蜜点**（FS-Researcher 消融数据证实，对数增长曲线）
- 建议**模板+动态混合方案**
- 正交性可零成本检查（prompt 内联 MECE + Jaccard 后验）
- 完整 Go struct 和 Pipeline 已设计
