# ToolCallRecordQuery - 工具调用记录审计查询器

## 1. 插件概述

`ToolCallRecordQuery` 是 VCP 运行态可观测性与工具调用审计子系统的同步查询插件。

当系统开启工具记录跟踪后，所有流经 VCP 核心循环的工具调用（包括入参、执行返回值、执行耗时、执行状态、异常堆栈以及调用者署名）均会被持久化存储。`ToolCallRecordQuery` 为智能体和开发者提供了一套多维检索与审计接口，能够按时间窗口、特定 Agent（`maid` / `caller`）、工具名称、执行状态（`success` / `failure` / `running`）或全文关键词检索历史调用，并自动将记录净化排版为精炼的 Markdown 报告。

### 核心特性
- **多维组合过滤**：支持记录 ID 精确反查、时间区间范围查询、调用方角色过滤与全文模糊匹配。
- **多模态 Token 防暴涨保护**：自动检测出入参中的 Base64 编码图片（`data:image/...;base64`），将其自动迁移为轻量静态 HTTP 链接，彻底杜绝上下文膨胀。
- **AI 友好输出格式**：默认以结构化 Markdown 形式呈现审计报告，亦支持原始 JSON 格式导出。

---

## 2. 命令列表与参数说明

### 核心命令：`ToolCallRecordQuery`

| 参数名称 | 类型 | 必填/可选 | 默认值 | 详细说明 |
|---|---|---|---|---|
| `id` / `recordId` | string | 可选 | 无 | 目标调用记录的全局唯一 ID（精确查找） |
| `from` / `startTime` | string | 可选 | 无 | 起始时间（ISO 8601 字符串或时间戳） |
| `to` / `endTime` | string | 可选 | 无 | 结束时间（ISO 8601 字符串或时间戳） |
| `caller` / `maid` | string | 可选 | 无 | 调用者署名模糊匹配（如 `Nova`） |
| `toolName` / `tool` | string | 可选 | 无 | 目标工具名称（如 `DailyNoteSearcher`, `DigitalOracle`） |
| `status` | string | 可选 | 无 | 执行状态过滤：`running`、`success` 或 `failure` |
| `search` / `keyword` | string | 可选 | 无 | 在入参、出参及报错详情中进行全文检索 |
| `limit` | integer | 可选 | 20 | 单次查询返回的最大记录条数 |
| `offset` | integer | 可选 | 0 | 分页查询偏移量 |
| `order` | string | 可选 | `desc` | 排序规则：`desc`（时间倒序）或 `asc`（时间正序） |
| `detail` | boolean | 可选 | false | 是否输出单条记录的详细字段快照 |
| `format` | string | 可选 | `markdown` | 返回格式：`markdown` 或 `json` |
| `migrateMultimodal` | boolean | 可选 | true | 是否将 base64 图片转换为外部链接 |

---

## 3. VCP 标准界定符调用示例

### 3.1 检索指定 Agent 最近调用的工具记录
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ToolCallRecordQuery「末」,
command:「始」ToolCallRecordQuery「末」,
caller:「始」Nova「末」,
toolName:「始」DailyNoteSearcher「末」,
limit:「始」10「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 审计特定时间段内的失败工具调用
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ToolCallRecordQuery「末」,
command:「始」ToolCallRecordQuery「末」,
from:「始」2026-09-03T00:00:00+08:00「末」,
to:「始」2026-09-03T18:00:00+08:00「末」,
status:「始」failure「末」,
detail:「始」true「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 全文关键词检索工具执行日志
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ToolCallRecordQuery「末」,
command:「始」ToolCallRecordQuery「末」,
search:「始」ECONNREFUSED「末」,
limit:「始」5「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **运行环境**：Node.js 16+ stdio 协议运行，超时 30000ms。
- **系统依赖**：依赖宿主系统启用的 `tool_call_records` 日志库或 SQLite 日志表。
