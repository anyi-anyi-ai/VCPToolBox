# vcp-search-mcp

把 `H:\VCP\VCPzhangduan\VCPToolBox\Plugin` 下的搜索类插件（TavilySearch / SerpSearch / FathomSearch / AnySearch / ZhihuSearch / VSearch 等）逆向提取出的 **API 端点 + 鉴权方式 + 调用规范**，封装成**一个标准 MCP 服务器**，供 DeepSeek Web Coding（DS）等任意标准 MCP 客户端加载。

---

## 一、确认的实现方式（结论）

**采用标准 MCP 服务器，传输层主推 stdio；不采用 VCP 插件机制。**

理由：

1. **VCP 插件不能直接给 DS 用。** VCP 的 `Plugin/` 目录走的是 VCP 自研的 stdio JSON 契约（宿主写 JSON 到子进程 stdin、子进程写 `{status, result}` 到 stdout），**不是标准 MCP 协议**。DS 只认 MCP，不认识 VCP 的 `plugin-manifest.json` + `{status:"success"}` 这套私有协议，原样搬过去加载不了。
2. **MCP 是 DeepSeek 官方支持的扩展路径。** DS（Web 版 / App 版）对外的工具扩展方式是 MCP；目前没有公开的、形似 VCP Plugin manifest 的第三方插件加载规范。
3. **stdio 传输最稳、最省事、最安全。** 几乎所有 MCP 客户端（含 DeepSeek）都原生支持 stdio（本地子进程）：密钥只存本机环境变量、不需要公网端口、不产生网络暴露。它和 VCP 现有插件"stdio 子进程"的运行形态也最接近，迁移成本最低。
4. **同时保留 SSE / streamable-HTTP 双通道。** 通过 `MCP_TRANSPORT` 环境变量一键切换，覆盖"远程部署 / 多端共享"场景，避免被某一种传输绑定。

> 说明：本次会话未能直接抓到 DeepSeek 官方 MCP 文档页（搜索只返回官网/百科等泛化结果），因此不以"DS 只支持某一种传输"为前提下结论；以 **stdio 为主推 + SSE/streamable-HTTP 双实现兜底** 是最稳妥、最不会被 DS 传输差异卡住的交付。

---

## 二、环境变量映射（VCP 旧变量名 → 本服务器变量名）

本服务器不硬编码任何密钥，全部从环境变量读取。可复用你在 VCP `config.env` 里已有的值：

| VCP 插件里的变量名 | 本服务器变量名 | 说明 |
| --- | --- | --- |
| `TavilyKey`（VSearch / TavilySearch） | `TAVILY_API_KEY` | 逗号分隔多 key 随机轮询 |
| `SerpApi`（SerpSearch） | `SERP_API_KEY` | 单 key |
| `FATHOM_API_KEY` | `FATHOM_API_KEY` | 同名 |
| `ANYSEARCH_API_KEY` | `ANYSEARCH_API_KEY` | 逗号分隔多 key 随机轮询 |
| `ZHIHU_ACCESS_SECRET` | `ZHIHU_ACCESS_SECRET` | 同名 |
| `KimiSearchKey`（VSearch） | `KIMI_SEARCH_KEY` | — |
| `VSearchKey` / `VSearchUrl` / `VSearchModel` / `GrokModel` | `VSEARCH_KEY` / `VSEARCH_URL` / `VSEARCH_MODEL` / `GROK_MODEL` | grounding/grok 后端，可选 |

完整模板见 [`config.env.example`](./config.env.example)。

---

## 三、安装与运行

```bash
# 1. 安装依赖（仅需 mcp 包，其余全用标准库 urllib）
pip install "mcp>=1.2.0"

# 2. 设置环境变量（Windows PowerShell 示例，或直接写入 config.env 后手动 source）
$env:TAVILY_API_KEY="..."      # 你的真实 key，此处以环境变量名示意
$env:SERP_API_KEY="..."
$env:FATHOM_API_KEY="..."
$env:ANYSEARCH_API_KEY="..."
$env:ZHIHU_ACCESS_SECRET="..."

# 3. 运行（默认 stdio）
python H:\VCP\VCPzhangduan\VCPToolBox\vcp-search-mcp\server.py

# 远程 / SSE / HTTP 模式（按需切换）
$env:MCP_TRANSPORT="sse"            ; python server.py   # SSE，默认 127.0.0.1:8000
$env:MCP_TRANSPORT="streamable-http"; python server.py   # streamable HTTP
```

---

## 四、DS（DeepSeek Web Coding）接入

在 DeepSeek 的「添加 MCP 服务器 / 工具」入口，按 stdio 方式填：

```json
{
  "name": "vcp-search-mcp",
  "command": "python",
  "args": ["H:\\VCP\\VCPzhangduan\\VCPToolBox\\vcp-search-mcp\\server.py"],
  "env": {
    "TAVILY_API_KEY": "${TAVILY_API_KEY}",
    "SERP_API_KEY": "${SERP_API_KEY}",
    "FATHOM_API_KEY": "${FATHOM_API_KEY}",
    "ANYSEARCH_API_KEY": "${ANYSEARCH_API_KEY}",
    "ZHIHU_ACCESS_SECRET": "${ZHIHU_ACCESS_SECRET}",
    "KIMI_SEARCH_KEY": "${KIMI_SEARCH_KEY}"
  }
}
```

要点：

- `command` 写你机器上可用的解释器：`python`、`python3`、或 `uv run`（若用 uv 管理依赖）。
- `env` 里填的是**环境变量名引用**（`${...}` 为占位示意），不要把真实密钥直接写死在配置里；DS 侧通常允许在环境变量输入框里引用系统已有变量。
- 若 DS 的 MCP 入口要求「远程 MCP」，则改用 `MCP_TRANSPORT=streamable-http` 启动，再把 `http://127.0.0.1:8000/mcp` 之类的 URL 填给 DS。

---

## 五、暴露的工具清单（7 个）

| 工具名 | 后端 | 端点 / 鉴权 | 必填参数 |
| --- | --- | --- | --- |
| `tavily_search` | Tavily | POST `TAVILY_ENDPOINT`，`Authorization: Bearer` | `query`（支持 `\|` 并发） |
| `serpapi_search` | SerpApi | GET `SERP_ENDPOINT`，`api_key` 参数 | `query` |
| `fathom_search` | Fathom | GET `FATHOM_SEARCH_ENDPOINT`，`X-API-KEY` | `command` + `query`/`url` |
| `anysearch_search` | AnySearch | POST `/v1/search` 或 `/mcp`，`Authorization: Bearer` + `X-Anysearch-Client` | `command` + `query`/`domain`/`url` |
| `zhihu_search` | 知乎 OpenAPI | GET `/api/v1/content/zhihu_search` / `global_search`，`Authorization: Bearer` + `X-Request-Timestamp` | `query` |
| `kimi_search` | Kimi | POST `{KIMI_SEARCH_URL}/search`，`Authorization: Bearer` + `X-Msh-Tool-Call-Id` | `query` |
| `vsearch` | VSearch 四后端 | grounding/grok 走 `VSEARCH_URL`；tavily/kimisearch 复用上述 | `query` + `search_mode` |

所有工具：密钥缺失 → 返回带"请设置环境变量 `XXX`"的可操作错误，不会崩溃；HTTP 失败 → 返回状态码 + 截断后的响应片段（不含完整 Authorization 头，避免回显密钥）。

---

## 六、目录结构

```
vcp-search-mcp/
├── server.py            # MCP 服务器（单文件，7 个工具）
├── requirements.txt     # 依赖：mcp
├── config.env.example   # 环境变量模板（无真实密钥）
└── README.md            # 本说明
```
