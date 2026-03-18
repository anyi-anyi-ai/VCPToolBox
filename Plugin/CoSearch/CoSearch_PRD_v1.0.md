# CoSearch PRD v1.0（单路线：OpenAI WebSearch）

- 版本：v1.0
- 日期：2026-02-26
- 状态：Draft-Ready
- 负责人：VCP

---

## 0. 第一性原理与立项目标

### 0.1 底层问题
信息生成速度持续高于人类处理带宽，用户需要的不是“更多结果”，而是“可追溯的高密度信号”。

### 0.2 产品目标函数
在固定预算内最大化决策价值：

- 输入预算：关键词数量、轮次、总 Token、总耗时
- 输出预算：阅读时长（<=10 分钟）、条目数量、引用密度
- 优化目标：最大化“结果对决策的互信息”

### 0.3 核心约束（强约束）
**仅使用 OpenAI WebSearch**，不引入第二搜索引擎、不做多路兜底。

---

## 1. 范围定义

### 1.1 In Scope（v0.1）
1. 输入：`SearchTopic`、`Keywords`、`ShowURL`
2. 检索：OpenAI Responses API + `tools: [{ type: "web_search" }]`
3. 处理：并发检索、去重、两阶段过滤、结构化报告
4. 输出：`CoSearchReport.md` + `CoSearchReport.json`
5. 审计：`Round-k.md` 证据账本（至少 Round-0）

### 1.2 Out of Scope（v0.1）
1. 多引擎融合（Tavily/Serp/SearXNG）
2. 本地网页抓取器
3. 向量库长期记忆
4. 自动发帖/自动发布

---

## 2. 用户场景

1. **任务研究场景**：围绕一个主题快速聚合可信证据，生成可读结论。
2. **决策前速读场景**：在 10 分钟内看完高密度信号。
3. **复盘审计场景**：追溯“为何纳入/为何剔除”，可复查。

---

## 3. 系统设计（单路线）

## 3.1 唯一流程

`Topic/Keywords -> Query 标准化 -> OpenAI WebSearch -> 结果归并 -> 去重 -> Stage1 粗筛 -> Stage2 精筛 -> Gap 分析 -> 迭代（可选） -> 报告输出`

### 3.2 关键模块
1. `InputAdapter`：参数校验与关键词拆分
2. `SearchExecutor`：OpenAI API 调用、并发调度、重试
3. `Aggregator`：结果归并与去重
4. `Distiller`：两阶段过滤
5. `Reporter`：Markdown/JSON 双输出
6. `Auditor`：Round 证据账本写入

### 3.3 与旧 VSearch 的继承与替换
- 继承：
  - 输入/输出协议（stdio JSON）
  - 关键词并发分批思想
  - 结构化提示词“主题+关键词+输出模板”
- 删除：
  - “模型自带联网能力”假设
  - `grounding_metadata` / Vertex redirect 逻辑
- 重写：
  - 引用体系、过滤引擎、证据账本

---

## 4. 检索与提示词协议

### 4.1 检索协议
- API：`POST /v1/responses`
- Tool：`web_search`
- 推荐参数：
  - `external_web_access: true`
  - `filters.allowed_domains`（按主题可选）
  - `search_context_size`（low/medium/high）

### 4.2 提示词职责（严格边界）
- **检索**由工具完成。
- **模型提示词只负责**：归纳、筛选、结构化写作。
- 禁止提示词要求“你自行联网”。

### 4.3 输出结构（每个关键词）
1. 核心发现
2. 关键事实/数据
3. 结论可信度（S1/S2/S3/N）
4. 引用（ShowURL=true 时必填）

---

## 5. 过滤器与分级

### 5.1 两阶段过滤
- Stage1（粗筛）：去噪、去重复、保留候选
- Stage2（精筛）：三问过滤（沿用现有构想）

### 5.2 三问过滤器
- F1 行为改变测试：是否影响行动/决策？
- F2 存活测试：是否具有短期持续价值（72h）？
- F3 态射测试：是否能映射到更高层规律？

### 5.3 分级规则
- S1：F1/F2/F3 全通过
- S2：通过 2 项
- S3：通过 1 项（观察区）
- N：不通过（噪声墓碑）

---

## 6. 证据账本与数据工件

### 6.1 Round 账本（必须）
路径：`workspace/YYYY-MM-DD/Round-k.md`

字段：
- task_id / round / time
- 输入关键词
- 新增证据（URL、标题、摘要）
- 过滤结果（S1/S2/S3/N）
- 缺口与下一轮问题
- 停止原因

### 6.2 报告工件
1. `CoSearchReport.md`（人读）
2. `CoSearchReport.json`（机读）

JSON 字段最小集：
- topic
- keywords[]
- items[]
  - title
  - url
  - snippet
  - grade
  - f1/f2/f3
  - why
- stats
  - total
  - s1/s2/s3/n
  - duration_ms
  - retries

---

## 7. 可靠性与错误处理

1. 可重试错误：429/5xx/超时（指数退避 + jitter，最多 2 次）
2. 不重试错误：4xx 参数错误
3. 失败可见：任何失败必须写入报告
4. 降级策略：保留“原始证据清单 + 失败说明”，不静默失败

---

## 8. 性能与预算

默认建议：
- `max_rounds = 2`
- 单任务关键词 `<= 20`
- 并发 `3~5`
- 任务总时长目标 `<= 8 分钟`

停止条件：
1. 达到轮次上限
2. 去重后新增信号不足
3. 信号饱和（高价值条目增量很低）
4. 预算触顶（时间/Token）

---

## 9. 技术选型决议（Go vs Rust）

### 9.1 决议
**v0.1 采用 Go 实现。**

### 9.2 决议理由
1. 当前瓶颈主要是上游网络与模型时延，不是本地 CPU。
2. Go 在并发编排、交付速度、运维成熟度上更优。
3. OpenAI 官方 SDK 对 Go 友好，降低接入与维护风险。

### 9.3 Rust 进入条件（未来）
仅当出现以下之一再评估：
- 明确的极限性能/内存约束
- 团队 Rust 生态成熟
- 需要高性能本地数据面能力

---

## 10. KPI 与验收闸门

### 10.1 KPI（v0.1）
1. 可溯源率（S1/S2 有效 URL）= 100%
2. 单任务失败率 <= 10%
3. 平均运行时长 <= 8 分钟
4. 决策信号精确率 >= 70%（人工抽样）

### 10.2 验收闸门
- Gate A（阻断）：架构必须单路线（不得出现第二搜索源）
- Gate B（阻断）：必须产出 Round 证据账本
- Gate C（阻断）：S1/S2 必须带有效 URL
- Gate D（警告）：精确率 < 70% 进入校准期，不进入 v0.2

---

## 11. 里程碑

### v0.1（MVP）
- 打通 OpenAI WebSearch 单路线
- 两阶段过滤可运行
- 产出 Round/Report 双工件
- 基础重试与可观测完成

### v0.2
- 强化 Gap 驱动迭代
- 加入误杀复盘与阈值校准
- 报告质量稳定性提升

### v0.3
- 质量评估自动化
- 运行策略自适应（并发、预算、过滤阈值）

---

## 12. 参考
- 现有资产：
  - `VSearch/VSearch.js`
  - `VSearch/VCP每日情报系统_PRD_v1.0.md`
  - `VSearch/VCP每日情报系统_开发计划.md`
- OpenAI 文档（实现依据）：
  - Responses API
  - Web Search Tool
  - Libraries（Go SDK）

