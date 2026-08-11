# 火山引擎 AskEcho Search Infinity 联网搜索插件 (VolcAskEchoSearch)

基于火山引擎 **AskEcho Search Infinity** (MCP Server) 构建的 VCP 高级联网搜索插件。支持 AI 在对话中直接调用火山引擎的搜索增强能力，获取实时新闻、技术文档与网页权威信息。

---

## 🌟 功能特性

- **MCP 原生集成**：通过 MCP (Model Context Protocol) JSON-RPC 协议与火山引擎 `mcp-server-askecho-search-infinity` 无缝交互。
- **灵活鉴权支持**：
  - **API Key 鉴权**：只需填入 `ASK_ECHO_SEARCH_INFINITY_API_KEY`
  - **AK/SK 鉴权**：支持火山引擎官方 `VOLCENGINE_ACCESS_KEY` + `VOLCENGINE_SECRET_KEY`
- **自动环境识别**：依赖 Python `uv` / `uvx` 工具链，支持按需一键下载运行 MCP 服务，自动寻找可执行路径。
- **极佳输出格式**：将搜索结果转换为高可读性的 Markdown 格式，供 AI 大模型分析生成回答。

---

## ⚙️ 安装与配置

### 1. 前置依赖
插件运行需要系统中具备 Python 及 `uv` 工具链。
可通过以下方式确认是否已安装 `uv`：
```bash
uv --version
```
> 如果未安装，可运行以下命令快速安装：
> **Windows (PowerShell)**:
> ```powershell
> powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
> ```
> **Linux / macOS**:
> ```bash
> curl -LsSf https://astral.sh/uv/install.sh | sh
> ```

### 2. 配置鉴权信息
修改插件目录下的 `Plugin/VolcAskEchoSearch/config.env` 文件：

```env
# 方式一：使用 API Key（推荐）
ASK_ECHO_SEARCH_INFINITY_API_KEY=your_askecho_api_key_here

# 方式二：使用火山引擎 AK/SK 鉴权体系
# VOLCENGINE_ACCESS_KEY=your_volcengine_ak_here
# VOLCENGINE_SECRET_KEY=your_volcengine_sk_here
```

---

## 🚀 在 VCP 中使用

VCP 会自动加载该插件。AI 在需要联网搜索时，可按以下标准格式发起请求：

```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」VolcAskEchoSearch「末」,
query:「始」火山引擎 MCP 最新接入文档与功能「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 📚 AI 工具接入指南 (MCP / Skill / 自建 Server)

如需了解如何在 Cursor、Claude Desktop、Codex 等 AI 客户端直接挂载 MCP 服务，或通过 `byted-web-search` Skill 接入，请参阅完整文档：
👉 [VolcAskEchoSearch AI工具接入指南](file:///H:/VCP/VCPzhangduan/VCPToolBox/docs/VolcAskEchoSearch_AI%E5%B7%A5%E5%85%B7%E6%8E%A5%E5%85%A5%E6%8C%87%E5%8D%97.md)

---

## 🛠️ 官方参考资源

- [火山引擎 MCP 接入指南官方文档](https://docs.volcengine.com/docs/87772/2297384?lang=zh)
- [火山引擎 MCP Server 仓库](https://github.com/volcengine/mcp-server)
