# 1PanelInfoProvider (1Panel 信息提供器)

## 📖 插件概览
**1PanelInfoProvider** 是一个后台静默运行的系统级数据集成插件（Type: `static`）。
它的主要作用是将您的 1Panel 服务器运维面板与 VCP AI 系统打通，允许主控 AI 能够实时感知当前的服务器状态（比如 CPU 占用率、内存使用量、甚至具体的操作日志等），就像给 AI 加装了服务器的“系统资源管理器”监控眼。

## 💡 核心机制与输出形式

与传统的主动调用工具不同，此插件**不提供可执行命令**。
它的工作方式是定时轮询：每隔 10 秒（通过 `refreshIntervalCron` 配置），插件会向您配置的 1Panel API 发起请求，抓取最新的核心指标数据。

抓取到数据后，它会主动注入到 VCP 的全局环境变量大池中，为您提供以下两个极其重要的**全局占位符（Placeholders）**：
- **`{{1PanelDashboard}}`**：渲染实时的 1Panel 面板基础运行状态总览。
- **`{{1PanelOsInfo}}`**：渲染底层操作系统的环境与硬件资源实时信息。

你可以在任何受支持的 Agent 的 `系统提示词 (System Prompt)` 预设里直接写入这两个变量。每次和该 Agent 对话时，AI 就会拿到这 10 秒内最新的服务器状态！

## 🔧 配置指南

由于需要对接第三方运维系统，您必须在插件根目录下创建或编辑 `config.env` 文件，以供给底层代码调用：
- **`PanelBaseUrl`** [必填]: 1Panel 服务器暴露的 API 基础地址（例：`http://localhost:12345`）。
- **`PanelApiKey`** [必填]: 生成的、具备调用权限的 API 鉴权密钥。
- **`Enabled`** [选填]: 控制插件开关，填 `true` 开启抓取，`false` 关闭。
- **`DebugMode`** [选填]: 开关调试日志输出通道，用于排查连接不通的问题。

> **小贴士**：
> 如果您看到日志报错“Uncaught error in main”，多半是因为该插件没拿到正确的 `PanelBaseUrl` 或 `PanelApiKey`，请及时核对您的前置设定。
