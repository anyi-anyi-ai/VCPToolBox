# FathomSearch — VCPToolBox 插件

## 工具名
`FathomSearch`

## 已实现接口
- `search` → `GET /search`
- `image_search` → `GET /image`
- `engine_search` → `GET /{engine}/search`
- `mega_search` → `GET /mega/search`
- `extract` → `GET /extract`
- `get_usage` → `GET /me`

## 配置
编辑同目录 `config.env`：

```env
FATHOM_API_KEY=ft-你的真实密钥
```

保存配置后，重启 VCPToolBox 后端，使其重新扫描并注册插件。

## 调用例子
```text
tool_name: FathomSearch
command: engine_search
engine: google
text: VCPToolBox plugin development
limit: 5
```

## MCP 说明
Fathom 官方提供 `/mcp` Streamable HTTP MCP 端点。VCPToolBox 当前插件机制本身通过 stdio 将本插件包装成宿主工具，因此本插件优先将 MCP 已暴露的搜索能力映射为直接 REST command，以获得参数透明、结果稳定和更容易调试的调用路径。若未来需要完整 MCP JSON-RPC 会话代理，应单独作为 `mcp_proxy` 模块实现。