# CoSearch PRD v1.1（2026最佳实践版｜单路线 OpenAI WebSearch）

- 版本：v1.1
- 日期：2026-02-26
- 状态：Draft-Ready
- 负责人：VCP
- 上一版：`CoSearch_PRD_v1.0.md`

---

## 0. 第一性原理与目标函数

### 0.1 核心问题
信息总量无限增长，但用户决策带宽有限。系统目标不是“抓更多”，而是“在固定预算内输出更高决策价值的信号”。

### 0.2 目标函数
在固定预算下最大化决策互信息：

- 输入预算：任务档位（Lite/Standard/Deep）、关键词规模、可接受等待时间
- 输出预算：阅读时间（默认 <=10 分钟）、可验证引用密度、复盘可追溯性
- 优化目标：`max I(输出报告;用户决策)`

### 0.3 不做的事情（原则）
1. 不做多搜索引擎兜底
2. 不做本地爬虫替代
3. 不做“以 token 为核心”的硬门控
4. 不为“看起来复杂”而强行上多Agent

---

## 1. 2026 最佳实践基线（用于 PRD 约束）

> 本节用于把“经验”固化成 PRD 的**必须项**。

### 1.1 复杂度渐进（先简后繁）
- 默认从单Agent流程起步
- 仅当复杂任务触发阈值时启用 Deep 编排
- 设计上支持从单Agent平滑升级到 Manager 编排

### 1.2 Eval-first（先评测后扩容）
- 每次能力升级必须有可复现评测集
- 引入流程级 trace grading 和结果级指标
- 没有评测改进证据，不允许架构升维

### 1.3 安全分层
- 输入清洗 + 结构化输出约束 + 审计日志
- 对外部信息保持“默认不可信”
- 高风险操作要有人审节点（本项目读操作为主，但仍保留可扩展位）

### 1.4 渐进披露（Progressive Disclosure）
- 默认先给“结论层”
- 按需展开“证据层”“方法层”“原始轨迹层”
- 把复杂性延后，而不是堆在首屏

---

## 2. 范围定义

### 2.1 In Scope（v1.1）
1. 输入：`SearchTopic`、`Keywords`、`ShowURL`、`Mode`
2. 仅调用 OpenAI-compatible Responses API 的 `web_search` 工具
3. 输出：
   - `CoSearchReport.md`
   - `CoSearchReport.json`
   - `Round-k.md`（证据账本）
4. 三档执行策略：Lite / Standard / Deep
5. Deep 模式支持编排与渐进披露

### 2.2 Out of Scope（v1.1）
1. 多搜索供应商切换
2. 本地网页抓取替代链路
3. 向量知识库写入与长期记忆
4. 自动发布社区内容

---

## 3. 接口与网关策略（支持你手填 curl）

### 3.1 API 兼容要求
CoSearch 必须支持 OpenAI-compatible 网关：
- 例如：`https://REDACTED_HOST/codex/v1/responses`
- 通过配置指定：
  - `COSEARCH_BASE_URL`
  - `COSEARCH_API_KEY`
  - `COSEARCH_MODEL`

### 3.2 标准调用契约
最小请求：
- `model`
- `input`
- `tools: [{ type: "web_search" }]`
- `stream`（可选）

### 3.3 调试优先原则
必须支持“curl 首先可验证”：
- 连通性调试（不带工具）
- 检索调试（带 `web_search`）
- 流式调试（`stream=true`）

---

## 4. 系统架构（单路线 + 档位编排）

## 4.1 总体流程
`输入 -> Query规范化 -> OpenAI WebSearch -> 聚合去重 -> 两阶段过滤 -> (可选迭代) -> 报告生成 -> 渐进披露输出`

### 4.2 核心模块
1. `InputAdapter`：参数校验、关键词拆分
2. `SearchExecutor`：请求发起、并发控制、重试
3. `Aggregator`：去重、归并、排序
4. `Distiller`：Stage1/Stage2 过滤
5. `Orchestrator`：按档位调度（Lite/Standard/Deep）
6. `Reporter`：MD/JSON 输出
7. `Auditor`：Round 账本

---

## 5. 档位策略（替代 token 数值门控）

> 核心：按任务复杂度分配时长与编排，不以精确 token 限制为中心。

### 5.1 Lite（快）
- 目标：快速给出可用信号
- 适用：问题明确、关键词少
- 策略：少轮次、低并发、低展开深度

### 5.2 Standard（默认）
- 目标：平衡速度与质量
- 适用：大多数日常研究任务
- 策略：中等轮次、中等并发、输出到证据层

### 5.3 Deep（深）
- 目标：复杂任务的完整研究闭环
- 适用：多面向、冲突证据、要求可审计
- 策略：分阶段编排 + 迭代 + 全量审计轨迹

---

## 6. Deep 模式编排设计（你关心的“复杂模式”）

### 6.1 编排原则
1. 先规划再检索
2. 先广覆盖再聚焦
3. 先公开信息阶段，再高敏阶段（若未来扩展私有数据）
4. 每阶段必须产出结构化中间工件

### 6.2 Deep 四阶段
1. **Plan 阶段**：拆问题、定义子问题与验证标准
2. **Explore 阶段**：多子查询并发检索
3. **Resolve 阶段**：冲突消解、缺口补检
4. **Compose 阶段**：报告组装与证据对齐

### 6.3 退出条件（必须）
- 达到档位最大轮次
- 新增高价值信号趋近于零
- 关键子问题已覆盖
- 用户中断并给出新指令

### 6.4 中断与继续
- Deep 任务支持中断后再继续
- 支持用户追加“新来源/新限制条件”后再执行下一轮

---

## 7. 渐进披露（Progressive Disclosure）输出协议

### 7.1 四层输出
- **L1 结论层（默认）**：3~7 条核心结论
- **L2 信号层**：S1/S2 条目卡片 + 核心证据
- **L3 证据层**：完整引用、反例、冲突说明
- **L4 轨迹层**：Round 日志、重试记录、停止原因

### 7.2 展开交互规则
- 默认只展示 L1
- 用户请求“展开证据”才显示 L2/L3
- 用户请求“查看过程”才显示 L4

### 7.3 ShowURL 语义
- `ShowURL=false`：L1/L2 简洁输出
- `ShowURL=true`：L2/L3 必含可点击引用

---

## 8. 过滤、分级与证据纪律

### 8.1 两阶段过滤
- Stage1：粗筛（去噪、去重）
- Stage2：精筛（三问过滤）

### 8.2 三问过滤器
- F1 行为改变测试
- F2 72小时存活测试
- F3 态射测试

### 8.3 分级标准
- S1：3项通过
- S2：2项通过
- S3：1项通过
- N：0项通过（噪声墓碑）

### 8.4 引用纪律
- S1/S2 必须有有效 URL
- 无 URL 不能升到 S1/S2
- 报告必须标注“结论对应证据”

---

## 9. 数据工件与审计

### 9.1 Round 账本
路径：`workspace/YYYY-MM-DD/Round-k.md`

最小字段：
- task_id / round / mode / timestamp
- 输入关键词与子问题
- 新增证据列表
- 过滤结果与理由
- Gap 与下一轮问题
- 停止原因

### 9.2 报告工件
1. `CoSearchReport.md`（人读）
2. `CoSearchReport.json`（机读）

### 9.3 审计要求
- 保留请求摘要、工具调用摘要、错误摘要
- 支持“为何得到此结论”的逆向追踪

---

## 10. 可靠性与安全

### 10.1 重试与超时
- 可重试：429/5xx/超时（指数退避 + jitter）
- 不重试：明确4xx参数错误
- 超时策略按档位差异化

### 10.2 安全控制
- 输入清洗（PII与注入风险）
- 阶段间使用结构化输出，减少注入链路
- 记录并审查关键工具调用

### 10.3 分阶段安全执行
对高敏数据扩展场景，采用“分阶段调用”：
1. 公网检索阶段
2. 私有数据阶段（关闭公网）

---

## 11. 评测体系（26年最佳实现对齐）

### 11.1 评测维度
1. 结果质量（是否回答任务）
2. 引用对齐（结论与证据一致性）
3. 可验证性（URL有效率）
4. 流程质量（trace 可解释性）

### 11.2 KPI（v1.1）
1. S1/S2 引用有效率 = 100%
2. 任务失败率 <= 10%
3. Standard 平均时长 <= 8 分钟
4. 决策信号精确率 >= 70%
5. Round 工件完整率 = 100%

### 11.3 验收闸门
- Gate A（阻断）：必须单路线（无第二搜索源）
- Gate B（阻断）：必须有 Round 账本
- Gate C（阻断）：S1/S2 无 URL 即失败
- Gate D（警告）：质量未达标进入校准期

---

## 12. 技术选型

### 12.1 当前决议
**v1.1 采用 Go 实现。**

### 12.2 原因
- 当前瓶颈是上游检索时延，不是本地 CPU
- Go 对并发编排、交付速度、运维稳定性更优
- OpenAI 官方 SDK 生态对 Go 更友好

### 12.3 Rust 进入条件（未来）
- 出现极限性能/内存压力
- 团队 Rust 工程能力成熟
- 需要高性能本地数据面

---

## 13. 里程碑

### v1.1（当前）
- 单路线 WebSearch 跑通
- 三档执行策略上线
- Deep 编排与渐进披露协议定版

### v1.2
- Deep 模式冲突消解能力增强
- 中断恢复体验优化
- 评测自动化增强

### v1.3
- 动态策略自适应（基于评测反馈）
- 更细粒度可解释性报告

---

## 14. 附录：建议配置

- `COSEARCH_BASE_URL`
- `COSEARCH_API_KEY`
- `COSEARCH_MODEL`
- `COSEARCH_MODE_DEFAULT` = `standard`
- `COSEARCH_CONCURRENCY`
- `COSEARCH_TIMEOUT_LITE`
- `COSEARCH_TIMEOUT_STANDARD`
- `COSEARCH_TIMEOUT_DEEP`
- `COSEARCH_ALLOWED_DOMAINS`（可选）

---

## 15. 参考依据（外部）

1. OpenAI《A practical guide to building agents》
2. OpenAI API《Deep research》
3. OpenAI API《Agent evals》
4. OpenAI API《Safety in building agents》
5. OpenAI《Introducing deep research》（含 2026-02-10 更新）
6. Anthropic《Building effective agents》
7. DeepResearch Bench（GitHub）
8. MMDeepResearch-Bench（arXiv 2601.12346）
9. FS-Researcher（arXiv 2602.01566）

