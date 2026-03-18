# CoSearch 接口契约（stdio）v1.2

> 适用范围：`cmd/cosearch` 标准输入/输出接口
> 代码基线：`internal/cosearch/*.go`（以代码行为为准）
> 最后更新：2026-02-27

---

## 1. 协议总览

- 传输方式：`stdin` 输入 1 个 JSON 对象，`stdout` 输出 1 个 JSON 对象。
- 兼容目标：
  - 保留旧 VSearch 字段：`status/result/error`
  - 扩展 CoSearch 字段：`mode/meta/report/layers/error_code`
- 协议版本字段：响应 `meta.protocol_version` 当前值为 `cosearch-stdio/1.1`。

### 1.1 Schema 文件

- `docs/schema/request.v1.2.json`
- `docs/schema/response.v1.2.json`

> `v1.2` 为契约文档版本；运行时 `protocol_version` 仍是 `1.1`，调用方请以 `meta.protocol_version` 做实际协商。

---

## 2. stdin（请求）契约

### 2.1 必填字段

- `SearchTopic: string`
  - 去空白后不能为空。
- `Keywords: string | string[]`
  - 字符串模式支持逗号、中文逗号、换行分割；
  - 数组模式会去空白、去重；
  - 最终必须至少得到 1 个有效关键词。

### 2.2 可选字段

- `ShowURL: boolean | string`
  - `true/"true"/"1"/"yes"` 视为 `true`；其他值视为 `false`。
- `Mode: string`
  - 支持 `lite | standard | deep`（大小写不敏感）；缺省为 `standard`。
- `RequestID: string`
  - 原样透传到 stdout 的 `request_id`。

### 2.3 容错行为

- 额外未知字段：当前会被忽略（Go struct 反序列化默认行为）。
- 非法 JSON 或必填字段缺失：返回 `status=error` + 对应 `error_code`。

### 2.4 约束依据（重要）

CoSearch 的约束模型是“**调查清晰度 + 证据质量**优先”，不是“硬输入上限优先”：

1. **输入校验层（协议层）**
   - 当前不会因为“关键词数量多”直接触发上限错误。
   - `invalid_argument` 的触发重点是：必填项缺失、字段值不合法（例如非法 `Mode`）、关键词解析后为空。
2. **执行预算层（运行层）**
   - 预算约束用于控制检索效率与信号聚焦，例如：
     - Lite/Standard 在启用 Enrichment 且展开查询后，会按并发预算裁剪执行集合（`maxKW = concurrency * 2`）。
     - Deep 通过“子问题覆盖率（TC）/信息增益（IG）”决定是否提前停止，而非按输入长度直接拒绝。
   - 这类约束属于“执行路径优化”，并非“输入契约硬上限”。
3. **质量闸门层（证据层）**
   - F1/F2 结论依赖有效证据 URL；若证据不足会被降级（`证据闸门`）。
   - 因此调用方应优先提升问题定义清晰度与证据可验证性，而非单纯堆叠输入量。

---

## 3. stdout（响应）契约

### 3.1 成功响应（`status=success`）

关键字段：
- `result`：L1 结论层（默认展示层）
- `layers`：L2/L3/L4 渐进披露内容
- `report`：结构化报告（含 `items/stats/round_md_files`）
- `meta`：耗时、关键词统计、协议版本

### 3.2 失败响应（`status=error`）

关键字段：
- `error_code`：机器可判定错误码
- `error`：人类可读错误描述
- `meta`：仍会返回统计与时间戳

错误码语义详见：`docs/error-codes.md`

---

## 4. stdout 与 `CoSearchReport.json` 边界

`stdout.report` 与磁盘 `workspace/YYYY-MM-DD/CoSearchReport.json` **不是完全等价副本**：

1. `stdout` 是完整接口返回，包含：`status/result/error/error_code/mode/request_id/meta/report/layers`。
2. `CoSearchReport.json` 仅落盘 `Report` 结构（不含 `status/meta/layers/result/error*`）。
3. 字段时序差异：
   - 落盘时先写 JSON，再把 `report_md_file/report_json_file` 回填到内存对象；
   - 因此 `stdout.report` 里通常有 `report_md_file/report_json_file`，但 `CoSearchReport.json` 内通常没有这两个字段。

**调用建议**
- 需要在线编排/重试决策：以 `stdout` 为准。
- 需要离线审计/归档：使用 `CoSearchReport.json` + `Round-k.md` + `CoSearchReport.md`。

---

## 5. 配置矩阵（含 AllowedDomains 现状）

| 环境变量 | 默认值 | 必需 | 作用阶段 | 当前行为 |
|---|---|---:|---|---|
| `COSEARCH_BASE_URL` | `https://api.openai.com/v1/responses` | 否 | 启动/调用 | OpenAI-compatible 网关地址 |
| `COSEARCH_API_KEY` / `OPENAI_API_KEY` | 无 | 是 | 启动 | 缺失会 `config_error` |
| `COSEARCH_MODEL` | `gpt-5.2` | 否 | 调用 | 请求 model |
| `COSEARCH_API_FORMAT` | `responses` | 否 | 调用 | `responses` 或 `completions`（其他值回落 `responses`） |
| `HTTP_PROXY` | 空 | 否 | 调用 | 配置 HTTP transport 代理 |
| `COSEARCH_CONCURRENCY` | 0（按模式默认） | 否 | 调度 | 覆盖所有模式并发度 |
| `COSEARCH_TIMEOUT_LITE` | 0（90s） | 否 | 调度 | 覆盖 lite 超时（秒） |
| `COSEARCH_TIMEOUT_STANDARD` | 0（75s） | 否 | 调度 | 覆盖 standard 超时（秒） |
| `COSEARCH_TIMEOUT_DEEP` | 0（150s） | 否 | 调度 | 覆盖 deep 超时（秒） |
| `COSEARCH_WORKSPACE_DIR` | `workspace` | 否 | 落盘 | 控制 Round/Report 输出目录 |
| `COSEARCH_ALLOWED_DOMAINS` | 空 | 否 | 结果过滤 + 请求透传 | 结果侧证据 URL 白名单；请求侧在开关开启时透传 |
| `COSEARCH_WEB_SEARCH_ALLOWED_DOMAINS_FILTER` | `false` | 否 | 请求透传开关 | 开启后向 `web_search` tool payload 透传 `filters.allowed_domains` |

### 5.1 AllowedDomains 当前状态说明

- 代码现状：`LoadConfig()` 会读取并解析 `COSEARCH_ALLOWED_DOMAINS` 到 `Config.AllowedDomains`。
- 当前行为：结果侧（citation/source）会执行白名单过滤；不匹配域名将被剔除。
- 请求侧透传：当 `COSEARCH_WEB_SEARCH_ALLOWED_DOMAINS_FILTER=true` 且 `COSEARCH_ALLOWED_DOMAINS` 非空时，请求会向 `web_search` 工具附加 `filters.allowed_domains`（best-effort，默认关闭以保持兼容）。

---

## 6. 重试语义入口

- 关键词级自动重试：内置指数退避 + 抖动（最多 3 次），仅针对瞬时错误。
- 终态错误码重试建议：见 `docs/error-codes.md` 的 `retryable` 语义表。

---

## 7. 调用方策略建议（面向接入方）

1. **先保证问题清晰，再扩输入规模**
   - `SearchTopic` 建议写成“研究对象 + 决策目标 + 时间语境”。
   - `Keywords` 优先给高区分度词组，避免同义堆叠。
2. **用证据质量驱动验收**
   - 建议默认 `ShowURL=true`，并在消费层检查 `report.items[*].sources` 与 `layers.L3Evidence`。
   - 对无有效 URL 的结果，按低置信或观察项处理。
3. **用 `meta.keyword_count` 观察实际执行规模**
   - 如果业务要求覆盖更广主题，建议调用方做分批任务，而不是依赖单次超大输入。
4. **按 `error_code` 做自动化分流**
   - `invalid_*` / `config_error`：直接修复输入或配置。
   - `upstream_error`：指数退避重试（2~3 次）。
   - `internal_error`：先判别网络类还是本地 I/O 类，再决定重试或修复环境。
5. **域名白名单的当前边界**
   - `COSEARCH_ALLOWED_DOMAINS` 已在结果侧生效（证据 URL 白名单过滤）。
   - 目前尚未透传到上游请求参数；接入方应把它视为“结果可信域约束”，而非“上游抓取范围强约束”。
