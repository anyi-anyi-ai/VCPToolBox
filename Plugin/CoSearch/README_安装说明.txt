CoSearch（脱敏版）已转换为 VCP 同步插件。

安装步骤：
1) 将 CoSearch 目录复制到 VCP 服务的 Plugin 目录下（手册示例为 ../../Plugin/CoSearch）。
2) 在 CoSearch 目录创建 config.env（可由 config.env.example 复制）。
3) 填入 COSEARCH_API_KEY（或 OPENAI_API_KEY）。
4) 重启或热加载 VCP 插件服务。

已包含：
- plugin-manifest.json
- run_cosearch.sh（优先执行二进制，不存在则自动 go build）
- config.env.example
