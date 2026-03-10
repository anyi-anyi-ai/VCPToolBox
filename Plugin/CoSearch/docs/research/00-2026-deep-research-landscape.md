# 2026 年 Deep Research 最佳实践全景

> 调研日期：2026-02-26
> 调研范围：Anthropic、OpenAI、FS-Researcher、DeepResearch Bench、Perplexity、Gemini

---

## 1. 三大标杆架构

### 1.1 FS-Researcher (开源 SOTA, RACE 53.94)

- **双代理分离**：Context Builder（图书管理员）+ Report Writer（作者）
- **文件系统做持久外部记忆**：index.md + knowledge_base/ + sources/
- **分节写作**：先大纲，逐节撰写，节级/报告级 checklist 审查
- **Test-time scaling**：通过增加 Context Builder 轮次（3/5/10）线性提升质量
- **消融实验关键数据**：
  - 合并为单代理：RACE -10.35（最大降幅）
  - 去掉分节写作：RACE -5.13
  - 去掉持久化工作区：RACE -4.07
- **轮次消融**（GPT-5 backbone）：
  - 3 轮：RACE 51.18, 24 来源, $6.10
  - 5 轮：RACE 52.37, 55 来源, $8.16（甜蜜点）
  - 10 轮：RACE 53.05, 59 来源, $12.54（Readability 反而下降）
- 参考：arxiv 2602.01566

### 1.2 Anthropic Multi-Agent Research System

- **Orchestrator-Worker 模式**：LeadResearcher (Opus 4) + 3-5 Subagents (Sonnet 4) + CitationAgent
- 子代理写入**外部文件系统**，避免「传话游戏」
- 多代理比单代理提升 **90.2%**
- Token 使用量解释 **80%** 性能方差
- **8 条 Prompt Engineering 原则**：
  1. Think like your agents（Console 模拟）
  2. Teach delegation（objective + format + tool guidance + boundaries）
  3. Scale effort to complexity（嵌入资源分配规则）
  4. Tool design is critical（40% 任务完成时间下降）
  5. Let agents improve themselves
  6. Start wide, then narrow（先广后窄）
  7. Guide thinking（extended thinking 做规划，interleaved thinking 做评估）
  8. Parallel tool calling（90% 时间缩减）
- **评测三策略**：small-sample evals from day one + LLM-as-judge + human evaluation
- **Outcome-based 而非 process-based**
- **Rainbow deployments**：渐进流量切换
- 参考：anthropic.com/engineering/multi-agent-research-system

### 1.3 OpenAI Deep Research API

- **三阶段流水线**：Clarification → Prompt Enrichment → Research Execution
- 模型：`o3-deep-research` / `o4-mini-deep-research`
- `max_tool_calls` 控制成本/延迟
- background 模式 + webhook
- MCP 集成（search + fetch）
- 安全：分阶段 API 调用隔离
- 2026-02 更新：MCP 连接、可信站点限制、实时进度追踪
- 参考：developers.openai.com/api/docs/guides/deep-research/

---

## 2. 评测体系

### DeepResearch Bench

- 100 个 PhD 级任务，22 个领域
- **RACE 四维**：Comprehensiveness / Depth / Instruction-Following / Readability
- **FACT 二维**：Effective Citations (E.Cit) / Citation Accuracy (C.Acc)

### 竞品排名

| 系统 | RACE | E.Cit | C.Acc |
|------|------|-------|-------|
| FS-Researcher (Sonnet 4.5) | 53.94 | — | — |
| Gemini-2.5-Pro DR | 48.88 | 111 | — |
| OpenAI Deep Research | 46.98 | — | — |
| Perplexity | — | — | 90.24% |

- 参考：arxiv 2506.11763 (ICLR 2026), arxiv 2601.08536

---

## 3. 竞品分解策略对比

| 系统 | 规划风格 | 维度/分解方式 | 执行模式 |
|------|---------|-------------|--------|
| FS-Researcher | Todo-driven 自检 | 涌现式（知识库缺口驱动） | 串行多轮 |
| OpenAI DR | 交互式澄清 + ReAct | 隐式（RL 训练推理链） | 串行迭代 |
| Perplexity | 分层推理循环 | 隐式（多轮精化） | 串行 3-5 轮 |
| Gemini DR | 自主计划 + 用户审批 | 半显式（蓝图子任务） | 串行执行 |
| Claude DR | Lead + Sub-agents | 最显式（维度并行委托） | 并行 |

**关键发现：没有任何主流系统使用预定义的固定维度分类法。**

---

## 4. 关键工程模式

| 模式 | 来源 | 核心思想 |
|------|------|----------|
| 双代理分离 | FS-Researcher | 信息采集与报告撰写解耦，消融证明 RACE +10.35 |
| 文件系统协调 | FS-Researcher, Anthropic | 避免上下文窗口溢出，持久化知识 |
| 先广后窄 | Anthropic 原则6 | 第一轮广覆盖，后续轮次聚焦 |
| Prompt Enrichment | OpenAI | 用户输入 → 结构化子问题拆解 |
| 分节写作 | FS-Researcher | 大纲 → 逐节撰写 → checklist，RACE +5.13 |
| 自适应停止 | 多系统 | 信号饱和 / 覆盖完成 / 预算耗尽 |
| 结果去重 | FS-Researcher | URL + 内容去重，避免冗余搜索 |

---

## 5. 与 CoSearch v1.1 的差距分析

| 维度 | CoSearch v1.1 | 2026 最佳实践 |
|------|-------------|---------------|
| 架构 | 单代理 + 关键词并发 | 双代理/多代理分离 |
| 记忆 | 内存 map，用完即弃 | 文件系统持久化 KB |
| 报告生成 | 一次性拼接 | 分节写作 + 大纲驱动 |
| 输入处理 | 直接使用原始输入 | 澄清 → 提示增强 → 执行 |
| Gap 检测 | shouldStopByLowGain（文本长度比较） | 结构化 checklist + 主动补检 |
| 评测 | 无自动评测 | 内在度量（IG/TC/SR） |
| 维度分解 | 无 | 动态正交维度 + MECE |
