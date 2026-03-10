# 维度(Dimension)系统深度研究笔记

## 1. 现有系统的主题分解/维度设计

### 1.1 FS-Researcher 的 Context Builder

**核心发现：FS-Researcher 没有显式的「维度」概念。**

- Context Builder 创建 `index.md` 文件，包含两部分：研究主题的「解构」和知识库的「层级结构」
- 关键设计：这不是线性流程。论文明确说 "the index.md and knowledge_base/ directory are dynamically updated as the agent browses" — 即分解和搜索是交织进行的
- 搜索策略通过 **todo-driven workflow** 驱动：agent 维护 `[PENDING]`/`[IN-PROGRESS]`/`[COMPLETE]` 状态的任务列表
- 每轮结束时，agent 用 checklist 自检知识库："是否有缺失的区域/细分信息？" "能否提出一个知识库无法回答的新问题？"
- 知识库结构：`index.md`（目录）+ `knowledge_base/`（树状笔记）+ `sources/`（原始网页存档）
- **隐式多样性**：后续轮次中 `search_web` 增长快于 `read_webpage`，说明额外预算更多用于「扩展搜索广度」而非「深读已有页面」

**工程启示**：FS-Researcher 的「维度」是涌现的，不是预设的。它通过 todo 自检 + 知识库缺口分析来实现覆盖多样性。

### 1.2 OpenAI Deep Research

**核心发现：OpenAI 也没有显式维度系统，但有 Prompt Enrichment 管线。**

ChatGPT 产品版本使用三阶段管线：
1. **Clarification**：中间模型（非 o3）帮助澄清用户意图
2. **Prompt Rewriting**：该模型将原始输入 + 澄清内容重写为更详细的 prompt
3. **Deep Research Execution**：enriched prompt 发送给 o3-deep-research

**重要**：API 版本没有内置 clarification/prompt rewriting。OpenAI 建议开发者用 `gpt-4.1` 自行实现。

Prompt Enrichment 的指导原则（来自官方文档）：
- Maximize specificity — 包含所有已知偏好，显式列出关键属性
- Handle gaps openly — 未指定的维度应标记为「开放式或默认无特定约束」
- Avoid assumptions — 声明缺乏规格的地方
- Request tables where comparisons are useful
- Specify source preferences（官方网站优于聚合器，原始论文优于摘要）

**Enrichment 输出是自由文本指令，没有结构化 JSON schema。**

搜索策略遵循 **ReAct 范式**（Plan -> Act -> Observe -> Repeat）：
- Agent 发起搜索 -> 读取结果 -> 基于所学决定下一个查询（不是预设列表）
- 回溯和转向是一等行为
- 单个查询可涉及数十次搜索（记录案例：21个来源，约28分钟）
- 停止条件：新颖性耗尽 + 矛盾解决 + 每子问题2+独立来源

### 1.3 Perplexity Deep Research

**核心发现：Perplexity 使用分层推理循环（layered reasoning loop）。**

- **Multi-pass reasoning**：3-5 次顺序搜索来精化查询和深化分析
- 与标准模式的关键区别：不是一次检索后总结，而是多轮搜索 -> 交叉验证 -> 结构化综合
- 自动进行 claims 的交叉验证
- 输出包含可验证来源、时间线和不确定性注释

### 1.4 Google Gemini Deep Research

**核心发现：Gemini 采用自主计划提案 + 用户审批模式。**

- Gemini 解释初始查询后生成**全面研究蓝图**（包含子任务和角度）
- 蓝图**呈现给用户审批**，用户可编辑、添加约束、移除不需要的子任务
- 用户批准后才开始执行
- Gemini 3 Pro 作为推理核心，迭代规划：制定查询 -> 阅读结果 -> 识别知识空白 -> 进行后续搜索
- DeepSearchQA 基准测试：900个手工任务，17个领域

### 1.5 Claude Advanced Research

**核心发现：Claude 使用多 Agent 编排，最接近「维度并行搜索」。**

- **Lead agent** 接收查询并创建整体研究策略
- 计划分解为子任务，每个委托给**专门的 sub-agent**
- 委托 payload 包含：精确的 prompt + 特定研究目标 + 约束（时间范围、来源限制）+ 工具配置
- Sub-agents 同时探索「问题空间的特定部分」
- **维度拆分**：编排器沿「一个区域、一个时间段、或问题的一个维度」拆分查询

### 1.6 各系统对比总结

| 系统 | 规划风格 | 维度/分解方式 | 执行模式 |
|------|---------|-------------|--------|
| FS-Researcher | Todo-driven 自检 | 涌现式（知识库缺口驱动） | 串行多轮 |
| OpenAI DR | 交互式澄清 + ReAct | 隐式（RL训练的推理链） | 串行迭代 |
| Perplexity | 分层推理循环 | 隐式（多轮精化） | 串行3-5轮 |
| Gemini | 自主计划 + 用户审批 | 半显式（蓝图子任务） | 串行执行 |
| Claude | Lead + Sub-agents | **最显式**（维度并行委托） | 并行 |

**关键洞察：没有任何主流系统使用预定义的固定维度分类法。所有系统都是动态生成分解的。** Claude 最接近显式维度概念，但仍是按查询动态生成的。

---

## 2. 固定维度 vs 动态维度的工程权衡

| 方案 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| **固定维度** | 可预测的搜索行为；可离线优化每维度的搜索策略；便于 TC 度量对齐；结果可缓存复用 | 对新领域/交叉领域适应差；维度间实际正交性因主题变化；维护成本高 | DailyIntel 式的固定领域监控；垂直搜索（如法律、医学） |
| **动态生成** | 适应任何主题；能捕获主题特有的维度；与 LLM 推理自然集成 | 生成质量依赖 LLM；难以保证正交性；不可预测的搜索行为；难以做质量度量 | 通用研究工具（OpenAI DR, Perplexity）；开放域查询 |
| **模板+动态** | 结合两者优势；模板保证基本覆盖；动态部分捕获主题特异性；可控的搜索预算分配 | 实现复杂度高；模板选择本身需要分类器；模板可能引入偏差 | **CoSearch v1.2 最适合的方案**；领域感知的深度研究工具 |

**工程判断**：CoSearch v1.2 应采用 **模板+动态** 混合方案。理由：
1. CoSearch 是通用研究工具（不是固定领域），需要动态适应
2. 但纯动态方案在 Go 实现中难以保证质量和正交性
3. 模板提供「搜索维度骨架」，LLM 填充具体查询

---

## 3. 正交性在搜索系统中的实际实现

### 3.1 学术界的正交性/多样性度量方法

**检索多样性度量**（来自 Wu et al. 2024 Survey）：
- **alpha-nDCG**：将文档与子主题的覆盖度结合到排序评估中
- **Intent-Aware metrics (IA-Precision, IA-Recall)**：假设查询有多个意图/facets，衡量结果对各意图的覆盖
- **Subtopic Recall**：给定 K 个结果能覆盖多少不同子主题
- **MMR (Maximal Marginal Relevance)**：贪心选择与已选结果最不相似的新结果

**查询多样性度量**（更相关的方向）：
- **Jaccard distance** 在关键词集合上：简单但有效，`1 - |A∩B|/|A∪B|`
- **Term overlap ratio**：两个查询共享词比例，<20% 可认为正交
- **Result set overlap**：两个查询返回结果的重叠度（需要实际执行搜索）
- **SemDiD (NeurIPS 2025)**：在 embedding 空间中使用正交方向向量引导生成多样性输出，但需要 embedding

### 3.2 Prompt 层面引导 LLM 生成正交维度

来自实际系统和社区实践的方法：

1. **显式正交性指令**：在 prompt 中要求「生成的维度之间信息重叠应 <20%」（DailyIntel 的做法）
2. **MECE 原则**：要求 LLM 生成 Mutually Exclusive, Collectively Exhaustive 的分解
3. **角色/视角分解**：要求从不同利益相关者视角分解（如：技术、商业、法律、用户体验）
4. **信息类型分解**：事实/数据 vs 观点/分析 vs 预测/趋势 vs 历史/背景
5. **7-Phase Deep Research Pattern**（Reddit 社区实践）：Phase 1 要求分解为 6-8 个子问题，每个标注：信息需求、权威来源、依赖关系、搜索难度、优先级
6. **Successive Prompting**（Dua et al. 2022）：迭代分解，每步处理一个子问题，分解与回答解耦

### 3.3 轻量级运行时正交性检查（不需要 embedding）

**可行的方法**：

1. **关键词 Jaccard 距离**：
   - 提取每个维度/查询的关键词集合（用 LLM 或简单 NLP）
   - 计算两两 Jaccard 距离
   - 阈值：distance > 0.8 认为正交
   - 复杂度：O(n^2) 其中 n 是维度数（通常 3-8，可忽略）

2. **搜索意图分类检查**：
   - 用 LLM 为每个维度标注「信息类型标签」（如：定义、比较、因果、趋势、案例）
   - 如果两个维度标签相同 + 主题词重叠 > 30%，标记为非正交

3. **LLM 自检 prompt**：
   
   这是最简单的方法，只需一次额外 LLM 调用。

4. **结果去重检测**（后验方法）：
   - 搜索后检查不同维度返回的 URL 重叠度
   - URL 重叠 > 40% 说明维度不够正交
   - 这是 FS-Researcher 隐式使用的策略（通过知识库缺口自检）

---

## 4. 最小基底的实践估计

### 4.1 经验法则

根据各系统的实际数据：

| 来源 | 维度/子问题数 | 备注 |
|------|-------------|------|
| 7-Phase Pattern (社区) | 6-8 | 手工分解最佳实践 |
| Perplexity DR | 3-5 轮搜索 | 每轮可能覆盖 1-2 维度 |
| OpenAI DR | ~10-30 次搜索 | 约映射到 5-10 个子主题 |
| Claude DR | 并行 sub-agents | 通常 3-5 个并行任务 |
| Haystack Query Decomposition | 2-5 子问题 | 结构化 RAG 场景 |

**经验法则**：
- **简单主题**（单一实体、事实查询）：2-3 维度
- **中等主题**（比较、分析）：4-6 维度
- **复杂主题**（多领域交叉、深度研究）：6-10 维度
- **超过 10 个维度通常有冗余**，应合并

### 4.2 FS-Researcher 消融实验的启示

FS-Researcher 的 Context Builder 轮次消融（GPT-5 backbone）：

| 轮次 | RACE 分数 | 边际增益 | 笔记数 | 来源数 | 成本 |
|------|----------|---------|-------|-------|------|
| 3 | 51.18 | baseline | 47 | 24 | $6.10 |
| 5 | 52.37 | +1.19 | 75 | 55 | $8.16 |
| 10 | 53.05 | +0.68 | 98 | 59 | $12.54 |

**关键洞察**：
1. **收益递减明显**：3->5 增益 (+1.19) 是 5->10 增益 (+0.68) 的 1.75x，但成本只多 34% vs 54%
2. **来源增长也递减**：3->5 增加 31 个来源，5->10 只增加 4 个
3. **Readability 在 5 轮达峰** (51.93)，10 轮反而下降 (51.66) — 过多冗余上下文引入噪声
4. **成本翻倍但质量仅提升 ~3.6%**（从 3 轮到 10 轮）

**这暗示什么？**
- 维度数量与搜索质量的关系是**对数的**（log-like），不是线性的
- 存在一个「甜蜜点」，大约在 **5 个有效维度/轮次** 附近
- 超过甜蜜点后，额外维度的边际信息增益被噪声/冗余抵消
- 这与信息论预期一致：信息空间的有效维度有限，过度采样导致冗余

### 4.3 信息论视角

如果将研究主题的信息空间建模为一个有限维向量空间：
- 前几个主成分（维度）解释大部分方差
- 类比 PCA：前 3-5 个主成分通常解释 80-90% 方差
- 这与 FS-Researcher 的实验数据一致：5 轮覆盖了主要信息，后续轮次只是边缘补充

---

## 5. CoSearch v1.2 的具体工程建议

### 5.1 Enrichment 输出结构建议



### 5.2 维度与 TC（拓扑覆盖度）度量集成

建议的集成方式：



其中：
- `dimension_coverage[i]` = 该维度下收集到的有效信息量 / 该维度预期信息量
- `dimension_weight[i]` = 基于 priority 的权重

具体实现：
1. **Enrichment 阶段**：生成 N 个维度，每个带 `quality_criteria`
2. **Context Builder 搜索后**：对每个维度评估 quality_criteria 的满足程度
3. **TC 计算**：
   - 每个 quality_criterion 满足=1，不满足=0
   - `dimension_coverage[i]` = 满足的 criteria 数 / 总 criteria 数
   - 加权汇总得到全局 TC
4. **正交性检查融入 TC**：如果两个维度的 URL 重叠 > 40%，降低重叠维度的权重

### 5.3 维度如何影响 Context Builder 的搜索策略

建议 Context Builder 采用 **维度轮转 + 缺口驱动** 策略：

1. **Round 1: 广度优先** — 每个维度执行 1-2 次搜索，建立基线覆盖
2. **Round 2-3: 缺口驱动** — 检查每个维度的 coverage，优先搜索 coverage 最低的维度
3. **Round 4+: 交叉验证** — 对关键 claims 进行跨维度验证搜索

搜索预算分配建议：
- 总搜索次数 = `维度数 * 3`（经验值）
- Round 1 占 40%，Round 2-3 占 40%，Round 4+ 占 20%
- 如果 5 个维度，约 15 次搜索，与 FS-Researcher 的甜蜜点一致

### 5.4 不增加 API 调用的正交性验证

**推荐方案：Keywords Jaccard + Enrichment 内联检查**

在 Enrichment prompt 中加入以下指令：



这样正交性检查完全在 Enrichment 的 LLM 调用内完成，**零额外 API 调用**。

代码侧可做简单后验验证：



### 5.5 完整 Enrichment Pipeline 建议



---

## 6. 核心结论

1. **行业共识是动态生成维度**：没有任何主流深度研究系统使用固定维度分类法。所有系统都是基于查询动态分解。

2. **CoSearch 应采用「模板+动态」混合方案**：用维度模板（InfoType 分类 + 角色视角提示）引导 LLM 生成正交维度，而非硬编码固定维度。

3. **5 个维度是甜蜜点**：FS-Researcher 的消融实验和各系统实践都指向 5 左右的最优维度数。质量随维度数对数增长，5 以后收益递减明显。

4. **正交性可以零成本检查**：通过 Enrichment prompt 内联约束 + 代码侧 Keywords Jaccard 后验，不需要 embedding 或额外 API 调用。

5. **DailyIntel 的固定维度设计仍然有价值**：它适合领域监控场景（每天固定扫描 AI/Bio/Macro），但不应直接移植到 CoSearch 的通用研究场景。两者的设计空间不同。

6. **TC 度量应按维度分层**：全局 TC = 加权维度覆盖度汇总，这样既可追踪搜索进度，也可识别信息盲点。

---

## 参考来源

- FS-Researcher paper (Zhu et al., Feb 2026): arxiv.org/abs/2602.01566
- OpenAI Deep Research API docs: developers.openai.com/api/docs/guides/deep-research/
- OpenAI Deep Research System Card (Feb 2025): cdn.openai.com/deep-research-system-card.pdf
- ByteByteGo analysis of OpenAI/Gemini/Claude DR: blog.bytebytego.com
- PromptLayer analysis of OpenAI DR: blog.promptlayer.com/how-deep-research-works/
- Perplexity Deep Research guide: toolkitbyai.com
- SemDiD (NeurIPS 2025): Semantic-guided Diverse Decoding
- Wu et al. (2024): Survey of Diversification Metrics and Approaches in Retrieval Systems
- Multi-Facet Blending (ACL 2025): Faceted Query-by-Example Retrieval
- Successive Prompting (Dua et al. 2022): Decomposing Complex Questions
- 7-Phase Deep Research Pattern: r/PromptEngineering community
- Haystack Query Decomposition: haystack.deepset.ai/blog/query-decomposition

---

# 补充：CoSearch v1.2 Go Struct 和代码建议

前面的分析中提到了几个代码建议但未展开，这里补充完整。

## 5.1 Enrichment 输出 Go Struct 建议

```go
// EnrichedQuery 是 Enrichment 阶段的结构化输出
type EnrichedQuery struct {
    OriginalQuery  string      `json:"original_query"`
    Intent         string      `json:"intent"`          // 用户研究意图的一句话总结
    Dimensions     []Dimension `json:"dimensions"`       // 正交搜索维度，通常 3-7 个
    Constraints    Constraints `json:"constraints"`      // 用户指定的约束
}

// Dimension 表示一个正交搜索维度
type Dimension struct {
    ID              string   `json:"id"`               // 如 "d1", "d2"...
    Name            string   `json:"name"`             // 维度名称，如 "技术架构"
    InfoType        string   `json:"info_type"`        // 信息类型：factual/analytical/comparative/temporal/causal
    SubQuestions    []string `json:"sub_questions"`     // 该维度下的具体子问题
    SearchQueries   []string `json:"search_queries"`    // 建议的搜索查询
    Keywords        []string `json:"keywords"`          // 核心关键词（用于正交性检查）
    PreferredSources []string `json:"preferred_sources"` // 偏好信息源类型
    QualityCriteria []string `json:"quality_criteria"`  // 该维度的质量验证标准
    Priority        int      `json:"priority"`          // 1=最高优先
}

type Constraints struct {
    TimeRange    string   `json:"time_range,omitempty"`    // 如 "2024-2026"
    Regions      []string `json:"regions,omitempty"`       // 地域限制
    Language     string   `json:"language,omitempty"`      // 输出语言
    Depth        string   `json:"depth"`                   // "surface" | "moderate" | "deep"
    MaxDimensions int     `json:"max_dimensions,omitempty"` // 维度上限，默认 5
}
```

## 5.4 轻量级正交性检查代码

### Enrichment Prompt 内联正交性约束

在 Enrichment 的 system prompt 中加入：

```
生成搜索维度时，必须遵循以下正交性约束：
1. 每个维度的 keywords 列表与其他维度的 keywords 重叠不超过 20%
2. 每个维度的 info_type 应尽量不同（允许最多 2 个维度共享同一 info_type）
3. 如果发现两个维度高度相似，合并为一个维度并扩展其 sub_questions
4. 维度应遵循 MECE 原则：互斥且穷尽
5. 在输出末尾附加 orthogonality_matrix，标注任意两个维度间的预估重叠百分比
```

### Go 侧后验检查

```go
// CheckOrthogonality 计算维度间的关键词 Jaccard 距离
// 返回不正交的维度对（Jaccard distance < threshold）
func CheckOrthogonality(dims []Dimension, threshold float64) []DimensionPair {
    var nonOrthogonal []DimensionPair
    for i := 0; i < len(dims); i++ {
        setA := toSet(dims[i].Keywords)
        for j := i + 1; j < len(dims); j++ {
            setB := toSet(dims[j].Keywords)
            distance := jaccardDistance(setA, setB)
            if distance < threshold { // threshold 建议 0.7
                nonOrthogonal = append(nonOrthogonal, DimensionPair{
                    DimA: dims[i].ID, DimB: dims[j].ID,
                    Distance: distance,
                })
            }
        }
    }
    return nonOrthogonal
}

type DimensionPair struct {
    DimA, DimB string
    Distance   float64
}

func toSet(items []string) map[string]bool {
    s := make(map[string]bool, len(items))
    for _, item := range items {
        s[strings.ToLower(item)] = true
    }
    return s
}

func jaccardDistance(a, b map[string]bool) float64 {
    intersection := 0
    for k := range a {
        if b[k] { intersection++ }
    }
    union := len(a) + len(b) - intersection
    if union == 0 { return 1.0 }
    return 1.0 - float64(intersection)/float64(union)
}
```

### URL 重叠后验检查

```go
// CheckURLOverlap 在搜索完成后，检查不同维度返回的 URL 重叠度
func CheckURLOverlap(dimResults map[string][]string) map[string]float64 {
    overlaps := make(map[string]float64)
    dims := make([]string, 0, len(dimResults))
    for k := range dimResults { dims = append(dims, k) }
    
    for i := 0; i < len(dims); i++ {
        setA := toSet(dimResults[dims[i]])
        for j := i + 1; j < len(dims); j++ {
            setB := toSet(dimResults[dims[j]])
            overlap := jaccardSimilarity(setA, setB) // 1 - distance
            key := dims[i] + "-" + dims[j]
            overlaps[key] = overlap
        }
    }
    return overlaps // overlap > 0.4 说明维度不够正交
}
```

## 5.2 TC（拓扑覆盖度）度量集成

```go
// TopologicalCoverage 计算基于维度的拓扑覆盖度
type TopologicalCoverage struct {
    GlobalTC          float64                `json:"global_tc"`
    DimensionCoverage map[string]DimCoverage `json:"dimension_coverage"`
    OrthogonalityScore float64               `json:"orthogonality_score"`
}

type DimCoverage struct {
    DimensionID       string   `json:"dimension_id"`
    CriteriaMet       int      `json:"criteria_met"`
    CriteriaTotal     int      `json:"criteria_total"`
    Coverage          float64  `json:"coverage"`       // criteria_met / criteria_total
    Weight            float64  `json:"weight"`         // 基于 priority
    URLCount          int      `json:"url_count"`
    UniqueURLCount    int      `json:"unique_url_count"` // 不与其他维度重叠的 URL 数
}

func ComputeTC(dims []Dimension, results map[string]*DimSearchResult) TopologicalCoverage {
    tc := TopologicalCoverage{
        DimensionCoverage: make(map[string]DimCoverage),
    }
    
    totalWeight := 0.0
    weightedSum := 0.0
    
    for _, dim := range dims {
        result := results[dim.ID]
        met := countCriteriaMet(dim.QualityCriteria, result)
        weight := 1.0 / float64(dim.Priority) // priority 1 -> weight 1.0
        
        cov := DimCoverage{
            DimensionID:   dim.ID,
            CriteriaMet:   met,
            CriteriaTotal: len(dim.QualityCriteria),
            Coverage:      float64(met) / float64(max(len(dim.QualityCriteria), 1)),
            Weight:        weight,
            URLCount:      len(result.URLs),
        }
        
        tc.DimensionCoverage[dim.ID] = cov
        totalWeight += weight
        weightedSum += cov.Coverage * weight
    }
    
    tc.GlobalTC = weightedSum / max(totalWeight, 1.0)
    
    // 正交性惩罚：URL 重叠高的维度降权
    urlOverlaps := CheckURLOverlap(extractURLsByDim(results))
    penalty := 0.0
    for _, overlap := range urlOverlaps {
        if overlap > 0.4 {
            penalty += (overlap - 0.4) * 0.5 // 超过40%的部分按50%惩罚
        }
    }
    tc.OrthogonalityScore = max(0, 1.0-penalty)
    tc.GlobalTC *= tc.OrthogonalityScore
    
    return tc
}
```

## 5.5 完整 Enrichment Pipeline 流程

```
User Query
    |
    v
[1. Enrichment LLM Call]
    - Input: query + system prompt with orthogonality constraints
    - Output: EnrichedQuery (JSON)
    - 模型: 快速模型 (如 gpt-4.1-mini)
    |
    v
[2. Go-side Validation]
    - CheckOrthogonality(dims, 0.7)
    - 如果有非正交对: 合并或要求 LLM 重新生成（最多重试 1 次）
    - 限制维度数: min(len(dims), constraints.MaxDimensions)
    |
    v
[3. Context Builder - Round 1: 广度优先]
    - 每个维度执行 searchQueries[0] (第一个搜索查询)
    - 并行执行所有维度的搜索
    - 收集结果，更新 DimSearchResult
    |
    v
[4. Mid-search TC Check]
    - ComputeTC() 计算当前覆盖度
    - 识别 coverage 最低的维度
    |
    v
[5. Context Builder - Round 2-3: 缺口驱动]
    - 优先搜索低覆盖维度的剩余 searchQueries
    - 或基于已有结果生成新的查询
    |
    v
[6. Final TC Computation]
    - 完整 TC 包含正交性分数
    - 如果 globalTC < 0.6，可选择增加搜索轮次
    |
    v
[7. Report Writer]
    - 按维度组织 context 传给 Report Writer
    - 每个维度的 coverage 作为权重指导报告详略
```

这些代码建议可以直接整合到 CoSearch v1.2 的 Go 代码库中。`EnrichedQuery` struct 是 Enrichment LLM 的 JSON 输出 schema，用 structured output / JSON mode 强制输出；`CheckOrthogonality` 和 `ComputeTC` 是纯 Go 计算，零 API 调用。