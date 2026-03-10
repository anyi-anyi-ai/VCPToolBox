# CoSearch E2E 冒烟脚本

本文档对应脚本：`scripts/e2e_smoke.sh`。

## 1. 目标

该脚本用于快速验证 CoSearch 的端到端链路是否可用：

- 能正确读取环境变量中的 API Key；
- 能切换网关（`right.codes` / `openai` / 自定义）；
- 能发起一次最小查询并拿到 JSON 响应；
- 能校验报告落盘路径是否存在（`artifact_dir`、`report_md_file`、`report_json_file`）。

## 2. 前置条件

- 已安装 Go（可执行 `go run ./cmd/cosearch`）
- 在项目根目录执行脚本
- 至少设置一个 API Key 环境变量：
  - `COSEARCH_API_KEY`（通用，优先）
  - `OPENAI_API_KEY`
  - `RIGHT_CODES_API_KEY`

## 3. 快速开始

在项目根目录下执行：

```bash
./scripts/e2e_smoke.sh --gateway right
```

或：

```bash
./scripts/e2e_smoke.sh --gateway openai
```

## 4. 参数说明

```text
--gateway right|openai|custom   选择网关（默认 right）
--base-url URL                  覆盖网关 URL（custom 时必填或由 COSEARCH_BASE_URL 提供）
--model MODEL                   覆盖模型名（默认 gpt-5.2）
--mode lite|standard|deep       检索模式（默认 lite）
--topic TOPIC                   检索主题
--keywords CSV                  关键词（逗号分隔）
--out-dir DIR                   输出目录（默认 workspace/e2e-smoke）
```

## 5. 默认网关与 Key 读取规则

### 5.1 right 网关

- 默认 URL：`https://REDACTED_HOST/codex/v1/responses`
- Key 读取顺序：`COSEARCH_API_KEY` → `RIGHT_CODES_API_KEY` → `OPENAI_API_KEY`

### 5.2 openai 网关

- 默认 URL：`https://api.openai.com/v1/responses`
- Key 读取顺序：`COSEARCH_API_KEY` → `OPENAI_API_KEY` → `RIGHT_CODES_API_KEY`

### 5.3 custom 网关

- URL 来源：`--base-url` 或 `COSEARCH_BASE_URL`
- Key 读取顺序：`COSEARCH_API_KEY` → `OPENAI_API_KEY` → `RIGHT_CODES_API_KEY`

## 6. 输出与判定

脚本会在 `--out-dir` 目录写入：

- `*.request.json`：本次请求
- `*.response.json`：CoSearch 标准输出
- `*.stderr.log`：运行日志

脚本会自动把 `GOCACHE` 指向 `--out-dir/.gocache`（若未显式设置），避免受限环境下默认缓存目录无写权限导致 `go run` 失败。

并打印检查结果：

- `STATUS=success` 表示业务成功
- `ARTIFACT_DIR_CHECK=ok`
- `REPORT_MD_CHECK=ok`
- `REPORT_JSON_CHECK=ok`

以上全部满足时，脚本返回 0。

## 7. 常见失败与处理

### 7.1 Key 缺失

报错示例：

```text
未检测到 API Key。请至少设置 COSEARCH_API_KEY / OPENAI_API_KEY / RIGHT_CODES_API_KEY 之一。
```

处理：先导出 Key，再重试。

### 7.2 网络受限 / 网关不可达

常见现象：

- `status=error` 且 `error_code=upstream_error`
- 错误消息包含 timeout、connection refused、no such host 等

处理：

1. 确认机器能访问目标网关域名；
2. 如需代理，设置 `HTTP_PROXY`；
3. 保持相同命令在可联网环境重跑，保存 `*.response.json` 与 `*.stderr.log` 用于留档。
