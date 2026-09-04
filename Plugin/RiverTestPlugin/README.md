# RiverTestPlugin - River 上下文历史注入测试插件

## 1. 插件概述

`RiverTestPlugin` 是 VCP 协议栈中专门用于调试、验证与监控 `river` 协议上下文历史注入特性的测试工装插件。

在 VCP 交互循环（`vcpLoop`）中，当 Agent 在工具调用块中包含 `river:「始」text「末」` 或 `river:「始」full「末」` 协议标头时，VCP 消息处理器会自动拦截并提取当前对话的历史消息切片（包含用户与助手的上下文），组装为 `river_context` 注入到工具的输入参数中。`RiverTestPlugin` 负责捕获并校验这些上下文历史，将原始注入数据以时间戳命名持久化至 `river/context-<timestamp>.json`，同时输出结构化诊断报告。

### 核心特性
- **上下文回显与持久化**：完整捕获 `args.river_context`，记录消息条数并在本地持久化存储以备断言审计。
- **协议契约验证**：验证 `river: text`（仅纯文本流）与 `river: full`（完整多模态/富对象结构）的传输完整性。
- **自动化调试诊断**：若未收到注入上下文，自动输出入参键名列表以辅助诊断通信管道状态。

---

## 2. 命令列表与参数说明

### 核心命令：`ExecuteTest`

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 协议关键参数 (标注必填/可选) |
|---|---|---|
| `ExecuteTest` | 触发 River 注入测试并持久化上下文 | `river` (string, 协议必填): 注入模式，可选值为 `text`（文本历史）或 `full`（完整消息对象结构）<br>`remark` (string, 可选): 测试备注或测试轮次标识 |

---

## 3. VCP 标准界定符调用示例

### 3.1 测试纯文本上下文注入 (`river: text`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」RiverTestPlugin「末」,
command:「始」ExecuteTest「末」,
river:「始」text「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 测试全量多模态/对象上下文注入 (`river: full`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」RiverTestPlugin「末」,
command:「始」ExecuteTest「末」,
river:「始」full「末」,
remark:「始」CI自动化管道全量上下文测试「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 诊断输出与落盘说明

- **执行结果输出**：
  ```json
  {
    "status": "success",
    "result": "{\"content\":[{\"type\":\"text\",\"text\":\"RiverTestPlugin executed. Received river_context with 8 messages. Context persisted to context-2026-09-03T10-00-00-000Z.json.\"}],\"details\":{\"river_context_received\":true,\"message_count\":8}}"
  }
  ```
- **落盘目录**：`Plugin/RiverTestPlugin/river/`
- **通信超时**：30000ms（Node.js stdio）。
