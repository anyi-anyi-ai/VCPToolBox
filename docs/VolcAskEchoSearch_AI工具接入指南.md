# 火山引擎 AskEcho Search Infinity 联网搜索 - AI 工具与 VCP 接入指南

本指南旨在指导开发者与用户如何为支持 **MCP (Model Context Protocol)** 协议的客户端（如 Cursor、Claude Desktop、Codex 等）、**VCP (Virtual Character Platform)** 交互框架以及 **Skill 机制** 快速集成火山引擎 **AskEcho Search Infinity** 联网搜索能力。

---

## 📌 1. 能力概述

火山引擎 **AskEcho Search Infinity** 提供高时效、高权威度的联网搜索与网页内容抽取能力。无论是基于 IDE 的 AI 辅助编程、独立桌面 Agent，还是 VCP 智能助手，均可通过以下 3 种方式之一灵活接入：

1. **VCP 插件方式 (`VolcAskEchoSearch`)**：针对 VCP 平台调取的同步原生插件，已内置在 `Plugin/VolcAskEchoSearch`。
2. **MCP Server 接入**：标准 MCP 协议，支持 Cursor、Claude Desktop、Codex、Windsurf 等 IDE/客户端（支持 stdio、SSE、StreamableHTTP 模式）。
3. **Skill 方式**：轻量化 Skill 技能接入，通过 `npx skills` 一键向本地 Agent 安装。

> 🔗 **官方参考文档**: [火山引擎 MCP 接入指南官方文档](https://docs.volcengine.com/docs/87772/2297384?lang=zh)

---

## 🔑 2. 鉴权方式

火山引擎联网搜索支持以下两种鉴权体系（二选一即可）：

| 鉴权方式 | 环境变量 | 说明 |
| :--- | :--- | :--- |
| **API Key 鉴权 (推荐)** | `ASK_ECHO_SEARCH_INFINITY_API_KEY` | 直接填入火山引擎生成的 AskEcho API Key，配置简单快捷。 |
| **AK/SK 体系鉴权** | `VOLCENGINE_ACCESS_KEY`<br>`VOLCENGINE_SECRET_KEY` | 火山引擎官方主/子账号 Access Key 与 Secret Key。 |

---

## 🔌 3. 接入方式一：VCP 插件接入 (VolcAskEchoSearch)

VCP 框架已内置 `VolcAskEchoSearch` 插件（路径 `Plugin/VolcAskEchoSearch`）。

### 3.1 配置步骤

1. 打开插件配置文件 `Plugin/VolcAskEchoSearch/config.env`（若不存在可参考 `config.env.example` 创建）。
2. 写入您的鉴权信息：
   ```env
   # 方式一：使用 API Key（推荐）
   ASK_ECHO_SEARCH_INFINITY_API_KEY=your_api_key_here

   # 方式二：使用 AKSK
   # VOLCENGINE_ACCESS_KEY=your_ak_here
   # VOLCENGINE_SECRET_KEY=your_sk_here
   ```
3. 启动或重启 VCP 服务（`start_server.bat`），系统会自动加载 `VolcAskEchoSearch` 插件。

### 3.2 VCP Agent 调取指令格式

在对话中，AI Agent 可通过标准工具请求触发联网搜索：

```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」VolcAskEchoSearch「末」,
query:「始」火山引擎 MCP 接入指南与最新功能「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 🤖 4. 接入方式二：MCP 协议客户端接入 (Cursor / Claude / Codex)

适配支持 MCP 协议的各类 AI 客户端（Cursor、Claude Desktop、Windsurf、Codex 等）。

### 4.1 前置准备：安装 Python 3.12+ 与 uv

MCP 服务依赖 `uv` 高性能 Python 包管理器。

* **Linux / macOS**:
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```
* **Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

---

### 4.2 一键部署（UVX 模式，推荐）

在 Cursor / Claude Desktop / Codex 的 MCP 配置文件（如 `claude_desktop_config.json` 或 Cursor 的 `.cursor/mcp.json`）中添加以下配置：

```json
{
  "mcpServers": {
    "mcp-server-askecho-search-infinity": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/volcengine/mcp-server#subdirectory=server/mcp_server_askecho_search_infinity",
        "mcp-server-askecho-search-infinity"
      ],
      "env": {
        "VOLCENGINE_ACCESS_KEY": "",
        "VOLCENGINE_SECRET_KEY": "",
        "ASK_ECHO_SEARCH_INFINITY_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

---

### 4.3 源码部署 MCP Server

如需离线调试、自行扩展或独立部署服务器：

1. **克隆代码仓库**:
   ```bash
   git clone git@github.com:volcengine/mcp-server.git
   cd mcp-server/server/mcp_server_askecho_search_infinity
   ```

2. **启动 MCP 服务器**:
   * **stdio 模式 (默认)**:
     ```bash
     uv run mcp-server-askecho-search-infinity
     ```
   * **SSE 模式**:
     ```bash
     uv run mcp-server-askecho-search-infinity -t sse
     ```
   * **StreamableHTTP 模式**:
     ```bash
     uv run mcp-server-askecho-search-infinity -t streamable-http
     ```

---

## 🛠️ 5. 接入方式三：Skill 方式安装接入 (byted-web-search)

对于支持 AgentKit / Skills 规范的 AI 工具，可以通过安装 `byted-web-search` Skill 快速获得联网搜索技能。

### 5.1 命令行一键安装

在终端执行：
```bash
npx skills add https://skills.volces.com/skills/bytedance/agentkit-samples -s byted-web-search
```

### 5.2 Agent 对话式直接安装

将以下文本复制并发送给你的 AI Agent：

> 帮我安装 byted-web-search skill，命令如下 `npx skills add https://skills.volces.com/skills/bytedance/agentkit-samples -s byted-web-search`  原始链接如下 `https://github.com/bytedance/agentkit-samples/tree/main/skills/byted-web-search`

---

## 🔍 6. 常见问题排查 (FAQ)

1. **调用报错：`uvx 执行程序未找到`**:
   * 请确认 PowerShell 安装 `uv` 后已开启新的终端窗口，或在环境变量 `PATH` 中包含 `uv` 安装路径（Windows 下通常在 `%USERPROFILE%\.cargo\bin` 或 `%LOCALAPPDATA%\bin`）。
2. **鉴权失败报错**:
   * 请核对 `ASK_ECHO_SEARCH_INFINITY_API_KEY` 或 `VOLCENGINE_ACCESS_KEY` / `VOLCENGINE_SECRET_KEY` 是否填写正确且有效。
3. **超时或网络问题**:
   * 确保访问 GitHub (`git+https://github.com/volcengine/mcp-server`) 和火山引擎 OpenAPI 端点的网络连通性。
