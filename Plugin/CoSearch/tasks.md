# CoSearch v1.1 开发任务清单（单路线 OpenAI WebSearch）

> 版本基线：`CoSearch_PRD_v1.1.md`
> 日期：2026-02-26

## P0（已完成）
- [√] 产出 v1.1 PRD（档位策略 + Deep 编排 + 渐进披露）
- [√] 建立 Go 最小可运行骨架（stdio JSON）
- [√] 接入 OpenAI-compatible `/v1/responses` + `web_search`
- [√] 保持 VSearch 输入兼容：`SearchTopic/Keywords/ShowURL`
- [√] 新增 `Mode`：lite/standard/deep
- [√] 两阶段产物结构：`result`（L1）+ `report/layers`（L2-L4）
- [√] Round 审计文件输出：`workspace/YYYY-MM-DD/Round-k.md`
- [√] 基础测试：关键词解析/模式解析/响应解析/mock 集成

## P1（下一步）
- [√] 把 Stage1/Stage2 过滤器从启发式升级为结构化打分（F1/F2/F3）
- [ ] 让 Deep 模式支持显式 Gap 生成与补检问题链路
- [√] 为 `ShowURL=true` 增加 URL 有效性校验与失效标注
- [√] 实现 `COSEARCH_ALLOWED_DOMAINS` 请求侧透传过滤（best-effort，默认关闭，开关：`COSEARCH_WEB_SEARCH_ALLOWED_DOMAINS_FILTER`）
- [√] 实现 `COSEARCH_ALLOWED_DOMAINS` 结果侧白名单过滤（严格主域/子域匹配）
- [√] 文档化 `COSEARCH_ALLOWED_DOMAINS` 现状与行为边界（contract/config matrix）
- [√] 输出 `CoSearchReport.md` 与 `CoSearchReport.json` 到 workspace
- [√] 增加错误码文档与调用方集成说明（含 retryable 语义）
- [√] 产出 stdin/stdout JSON Schema（`request.v1.2` / `response.v1.2`）
- [√] 明确 stdout 与 `CoSearchReport.json` 字段边界（contract 文档）
- [√] 同步契约口径：约束依据为“调查清晰度 + 证据质量”，非“硬输入上限”
- [√] 增补调用方策略建议：输入组织、证据验收、重试分流与执行规模观测

## P2（质量与运维）
- [ ] 增加 E2E 回归集（固定主题+关键词）
- [ ] 增加可观测字段（request_id、round_latency、retry_count）
- [ ] 增加压测脚本与失败注入测试（429/5xx/timeout）
- [ ] 增加“渐进披露”CLI 视图开关（L1/L2/L3/L4）

## 验收闸门（阻断）
- [ ] Gate A：不得引入第二搜索源
- [ ] Gate B：每次任务必须产出 Round 审计
- [ ] Gate C：S1/S2 必须带有效 URL
- [ ] Gate D：评测未达标时不得推进版本
