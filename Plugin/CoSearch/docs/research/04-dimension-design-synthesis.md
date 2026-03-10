# 维度设计综合结论

> 综合三位专家（信息论、范畴论、工程实践）的深度分析，提炼 CoSearch v1.2 维度系统的核心设计原则。

---

## 一句话结论

**维度不是搜索关键词的分类标签，是从问题空间到信息源空间的正交函子，其价值由态射密度而非对象数量衡量。**

---

## 三方共识

| 议题 | 信息论 | 范畴论 | 工程实践 | 共识 |
|------|--------|--------|----------|------|
| 维度数量 | 有效秩 5-8 | MDL 最优 5-7 | 甜蜜点 ~5（FS-Researcher 消融） | **5 个左右** |
| 固定 vs 动态 | 半固定（骨架+触角） | 依主题而定 | 模板+动态混合 | **模板引导 + LLM 动态生成** |
| 正交性度量 | NMI < 0.2 | 函子独立性 | Jaccard distance > 0.8 | **Jaccard + MECE prompt** |
| 维度间关系 | 追求 Synergy 而非纯正交 | 对偶结构是信号 | 张力区域产生交叉验证 | **对偶 > 纯正交** |
| 第一性源 | 最大独有信息源 | 因果接近性 + 态射生成力 | 时间优先 + 原创度 | **去掉后信息损失最大的源** |

---

## 核心设计原则

### 原则 1：态射 > 对象

来自范畴论专家的核心洞察：

- 1000 条新闻（对象）不如 10 条分析（态射）
- F3 态射测试的数学正当性：测试信息是否增加了信息范畴的连通性
- 维度价值指标 = 态射密度 = |该维度贡献的新态射| / |该维度贡献的新对象|

### 原则 2：Synergy > 正交性

来自信息论专家的关键修正：

- 纯正交是必要条件但不是设计目标
- 用 PID 框架分解：I(Xi, Xj; Y) = Redundancy + Unique_i + Unique_j + Synergy
- **最小化 Redundancy，最大化 Unique + Synergy**
- D1(研究) vs D2(工程) 是对偶而非正交——它们之间的张力本身是最有价值的信号

### 原则 3：全息原理 → 有效秩远低于表面维数

来自信息论专家的形式化：

- H(Ω | ∂Ω) ≈ 0：给定第一性源集合（边界），信息空间的条件熵趋零
- 最小基底数 ≈ 5，覆盖 >95% 决策相关信息
- 质量随维度数**对数增长**，5 以后收益递减明显

### 原则 4：动态生成，模板引导

来自工程专家的行业调研：

- 没有任何主流 Deep Research 系统用固定维度
- 但 DailyIntel 的固定维度在领域监控场景有价值
- CoSearch 作为通用研究工具应采用：**信息类型模板 + LLM 动态生成 + MECE 约束**

### 原则 5：D5 是元维度

来自范畴论专家的结构性发现：

- D5（深度解读/态射）不是内容维度，是**元维度**
- 它捕获的是其他维度之间的跨域态射（专家 tacit knowledge 的外化）
- 这对应信息论中的 Synergy 项

---

## 对 PRD v1.2 的具体落地建议

### 1. Enrichment 输出结构

```
EnrichedQuery {
  Intent:        string       // 研究意图一句话
  Dimensions:    []Dimension  // 3-7 个正交维度
  Constraints:   Constraints  // 时间/地域/深度约束
}

Dimension {
  ID:              string    // "d1", "d2"...
  Name:            string    // 维度名称
  InfoType:        string    // factual/analytical/comparative/temporal/causal
  SubQuestions:    []string  // 该维度的子问题
  SearchQueries:   []string  // 搜索查询
  Keywords:        []string  // 核心关键词（正交性检查用）
  QualityCriteria: []string  // 质量验证标准
  Priority:        int       // 优先级
}
```

### 2. 正交性保证（零额外 API 调用）

- **Prompt 层**：MECE 约束 + 关键词重叠 <20% + 信息类型多样性
- **Go 层**：Keywords Jaccard distance 后验检查
- **运行时**：URL 重叠检测（>40% 标记非正交告警）

### 3. TC 度量按维度分层

```
GlobalTC = Σ(weight_i × coverage_i) × orthogonality_score

coverage_i = |满足的 quality_criteria| / |总 quality_criteria|
orthogonality_score = max(0, 1 - penalty_from_URL_overlap)
```

### 4. Context Builder 搜索策略

- Round 1（40%预算）：广度优先，每维度 1-2 次搜索
- Round 2-3（40%预算）：Gap 驱动，优先低覆盖维度
- Round 4+（20%预算）：交叉验证，对偶维度间的张力检查

### 5. F3 态射测试增强

- 区分「维度内态射」和「跨维度态射」，后者自动加分
- 评估态射新颖度（已知关系 vs 意外关系）
- 对偶维度交叉验证：D1 有信号 + D2 无对应 → 自动生成 Gap 查询

---

## 未来探索方向（v1.3+）

1. **自动维度发现**：embedding 聚类 + silhouette score 确定最优维度数
2. **正交性月度审计**：NMI 矩阵 + BERTopic 聚类对齐
3. **品味形式化**：P(新态射 | 锚定问题) 作为过滤器的核心参数
4. **态射熵监控**：检测范式收敛/危机期
5. **贪心互信息验证**：30 天数据后验证维度数是否最优

---

## 参考文档

- [01] 信息论分析：`01-dim-information-theory-holographic.md`
- [02] 范畴论分析：`02-dim-epistemology-category-theory.md`
- [03] 工程实践分析：`03-dim-engineering-practice.md`
- [00] 2026 全景调研：`00-2026-deep-research-landscape.md`
