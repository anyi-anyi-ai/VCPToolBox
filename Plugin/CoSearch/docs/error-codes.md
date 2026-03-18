# CoSearch 错误码与 retryable 语义

> 适用范围：`stdout.status = error` 响应，以及关键词检索内部自动重试策略。
> 最后更新：2026-02-27

---

## 1. 顶层错误码（stdout）

> 注：当前响应体未直接输出 `retryable` 字段；本文件给出调用方应采用的判定语义。

| error_code | 触发条件（代码路径） | retryable | 调用方建议 |
|---|---|---|---|
| `invalid_json` | stdin 非法 JSON / 空输入（`parseRequest` 失败） | `false` | 修正请求体后重试 |
| `invalid_argument` | `SearchTopic/Keywords/Mode` 不合法 | `false` | 修正参数后重试 |
| `config_error` | 缺少 API key 或客户端构建失败 | `false`（通常） | 先修复配置，再重试 |
| `upstream_error` | 所有关键词都失败（上游全失败） | `true` | 可按指数退避整单重试；必要时降级 mode/关键词数 |
| `internal_error` | Context Builder / Report Writer / 报告落盘失败 | `conditional` | 先看错误信息：网络类可重试；本地 I/O/权限类需先修复环境 |

### 1.1 关于“输入上限”误区

- 当前 `invalid_argument` 并非由“关键词数量超过固定阈值”直接触发。
- 该错误更常见于：
  - `SearchTopic` 为空；
  - `Keywords` 无法解析出有效条目（例如全空白）；
  - `Mode` 非 `lite|standard|deep`。
- 因此接入方应优先做**输入语义有效性校验**，而不是假设存在“固定硬上限”。

### 1.2 `conditional` 判定建议

- 命中网络/超时/5xx 语义：可重试。
- 命中本地文件系统语义（如权限不足、目录不可写）：先修复环境再重试。

---

## 2. 关键词级自动重试（内部）

每个关键词检索任务默认策略：

- 最大尝试次数：`3`
- 回退策略：`1s * 2^attempt`，上限 `8s`
- 抖动：`±25%`
- 触发范围：仅 `isRetryable(err) == true`

### 2.1 `isRetryable` 当前实现（大小写不敏感，子串匹配）

满足任一条件即重试：

- 错误文本包含 `http 429`
- 错误文本包含 `http 5`（覆盖 5xx）
- 错误文本包含 `timeout`
- 错误文本包含 `context deadline exceeded`

### 2.2 不会自动重试的典型错误

- 参数/协议错误（4xx 非 429）
- 解析错误（响应结构异常）
- 配置错误（缺 key 等）

---

## 3. 调用方推荐重试策略

1. 先看 `status`：
   - `success`：按业务消费。
   - `error`：进入错误码策略。
2. 按 `error_code` 做分流：
   - `invalid_*` / `config_error`：立即失败并提示修复。
   - `upstream_error`：允许自动重试（建议 2~3 次，指数退避）。
   - `internal_error`：依据 `error` 文本分类，网络类可重试，本地环境类先修复。
3. 保留 `request_id`（若传入）用于链路追踪。
4. 将“重试”与“质量验收”分离：
   - 重试只解决瞬时失败，不保证信号质量；
   - 结果验收应同时检查证据 URL 完整性（`ShowURL=true` + `sources` 非空）与分层结论可解释性（L2/L3/L4）。
