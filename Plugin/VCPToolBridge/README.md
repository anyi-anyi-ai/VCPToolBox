# VCPToolBridge - VCP 工具外部桥接器

## 1. 插件概述

`VCPToolBridge` 是连接 VCP 原生插件生态与外部多智能体协作中心（如 AIO Hub）的双向远程桥接插件（`hybridservice`）。

该插件通过 Monkey Patch 劫持与拓展系统 WebSocket 通信层，自动将本地已注册的合规 VCP 工具元数据转换导出给外部客户端，并监听跨网络的远程工具调用请求。当外部系统触发工具执行时，`VCPToolBridge` 将请求派发至本地 `PluginManager.processToolCall` 执行，并实时反向转发流式执行日志（`vcp_log` / `vcp_info`）与最终结果。

### 核心特性
- **双向元数据与执行桥接**：将 VCP 原生工具无缝导出为 AIO 可视化工具；外部工具调用一键派发至本地执行。
- **进度与异步事件转发**：全面支持进度日志中继与异步回调（`plugin_async_callback`）转发。
- **黑名单与过滤机制**：支持通过工具名称黑名单（如 `VCPLog`, `VCPInfo`）或名称前缀过滤不宜导出的敏感工具。
- **轻量状态自检**：暴露 `GetStatus` 命令与 HTTP `/status` 端点，供 Agent 或运维查询当前桥接运行态。

---

## 2. 命令列表与参数说明

### 核心命令：`GetStatus`

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `GetStatus` | 获取当前工具桥接器运行状态、挂钩情况及配置 | 无参数 |

---

## 3. VCP 标准界定符调用示例

### 3.1 获取桥接器运行态与挂钩信息
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPToolBridge「末」,
command:「始」GetStatus「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 期望返回结果结构
```json
{
  "status": "running",
  "hooked": true,
  "config": {
    "Bridge_Enabled": true,
    "Excluded_Tools": "VCPLog,VCPInfo,VCPToolBridge",
    "Excluded_Display_Keywords": "[AIO]"
  }
}
```

---

## 4. 配置与环境要求

- **插件类型**：`hybridservice`，具备 `direct` 协议与 API 路由（`hasApiRoutes: true`）。
- **核心配置项 (`configSchema` / `config.env`)**：
  - `Bridge_Enabled` (boolean, 默认 `false`): 是否开启对外工具桥接功能。
  - `Excluded_Tools` (string, 默认 `"VCPLog,VCPInfo,VCPToolBridge"`): 逗号分隔的排除导出工具名单。
  - `Excluded_Display_Keywords` (string, 默认 `"[AIO]"`): 显示名称中包含即排除的关键词。
- **HTTP 监控端点**：`GET /vcp-tool-bridge/status`
