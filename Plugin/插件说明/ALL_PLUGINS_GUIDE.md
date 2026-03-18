# VCP 全插件综合说明手册

本文档汇总了 `VCPToolBox/Plugin` 目录下所有正式插件的详细说明、功能概览与接口文档。
此文档自动提取自各个子插件内部的说明文件。

*生成时间：2026/3/10 10:14:28*

## 📑 插件目录速览

- [1PanelInfoProvider (1Panel 信息提供器)](#1panelinfoprovider-1panel-信息提供器)
- [AgentAssistant (女仆团协作插件)](#agentassistant-女仆团协作插件)
- [AgentCreator (智能Agent创作工坊)](#agentcreator-智能agent创作工坊)
- [AgentDream - 梦系统插件](#agentdream---梦系统插件)
- [AgentMessage (AgentMessage)](#agentmessage-agentmessage)
- [AIMemo (AIMemo)](#aimemo-aimemo)
- [AnimeFinder (AnimeFinder)](#animefinder-animefinder)
- [ArtistMatcher (ArtistMatcher)](#artistmatcher-artistmatcher)
- [ArxivDailyPapers (ArxivDailyPapers)](#arxivdailypapers-arxivdailypapers)
- [BilibiliFetch (BilibiliFetch)](#bilibilifetch-bilibilifetch)
- [CapturePreprocessor (CapturePreprocessor)](#capturepreprocessor-capturepreprocessor)
- [ChromeBridge (ChromeBridge)](#chromebridge-chromebridge)
- [CodeSearcher (CodeSearcher)](#codesearcher-codesearcher)
- [ComfyUIGen 后端使用简明说明](#comfyuigen-后端使用简明说明)
- [Context7 (Context7)](#context7-context7)
- [CoSearch (CoSearch)](#cosearch-cosearch)
- [CrossRefDailyPapers (CrossRefDailyPapers)](#crossrefdailypapers-crossrefdailypapers)
- [DailyHot (DailyHot)](#dailyhot-dailyhot)
- [DailyNote (DailyNote)](#dailynote-dailynote)
- [DailyNoteManager (DailyNoteManager)](#dailynotemanager-dailynotemanager)
- [DailyNotePanel (DailyNotePanel)](#dailynotepanel-dailynotepanel)
- [DailyNoteWrite (DailyNoteWrite)](#dailynotewrite-dailynotewrite)
- [DeepWikiVCP (DeepWikiVCP)](#deepwikivcp-deepwikivcp)
- [DMXDoubaoGen (DMXDoubaoGen)](#dmxdoubaogen-dmxdoubaogen)
- [DoubaoGen (DoubaoGen)](#doubaogen-doubaogen)
- [EmojiListGenerator (EmojiListGenerator)](#emojilistgenerator-emojilistgenerator)
- [FileListGenerator (FileListGenerator)](#filelistgenerator-filelistgenerator)
- [FileOperator (FileOperator)](#fileoperator-fileoperator)
- [FileServer (FileServer)](#fileserver-fileserver)
- [FileTreeGenerator (FileTreeGenerator)](#filetreegenerator-filetreegenerator)
- [FlashDeepSearch (FlashDeepSearch)](#flashdeepsearch-flashdeepsearch)
- [FluxGen (FluxGen)](#fluxgen-fluxgen)
- [FRPSInfoProvider (FRPSInfoProvider)](#frpsinfoprovider-frpsinfoprovider)
- [GeminiImageGen (GeminiImageGen)](#geminiimagegen-geminiimagegen)
- [GitOperator (GitOperator)](#gitoperator-gitoperator)
- [GrokVideo (GrokVideo)](#grokvideo-grokvideo)
- [ImageProcessor (ImageProcessor)](#imageprocessor-imageprocessor)
- [ImageServer (ImageServer)](#imageserver-imageserver)
- [IMAPIndex Static Plugin](#imapindex-static-plugin)
- [IMAPSearch VCP Plugin](#imapsearch-vcp-plugin)
- [JapaneseHelper (JapaneseHelper)](#japanesehelper-japanesehelper)
- [KarakeepSearch (KarakeepSearch)](#karakeepsearch-karakeepsearch)
- [KEGGSearch (KEGGSearch)](#keggsearch-keggsearch)
- [LightMemo (LightMemo)](#lightmemo-lightmemo)
- [LinuxLogMonitor (LinuxLogMonitor)](#linuxlogmonitor-linuxlogmonitor)
- [LinuxShellExecutor (LinuxShellExecutor)](#linuxshellexecutor-linuxshellexecutor)
- [MagiAgent (MagiAgent)](#magiagent-magiagent)
- [MCPOMonitor - MCPO 服务状态监控器](#mcpomonitor---mcpo-服务状态监控器)
- [MIDITranslator (MIDITranslator)](#miditranslator-miditranslator)
- [NCBIDatasets (NCBIDatasets)](#ncbidatasets-ncbidatasets)
- [NeteaseFetch (NeteaseFetch)](#neteasefetch-neteasefetch)
- [NeteaseMusic (NeteaseMusic)](#neteasemusic-neteasemusic)
- [NewsSearch (NewsSearch)](#newssearch-newssearch)
- [NovelAI 图片生成 VCP 插件](#novelai-图片生成-vcp-插件)
- [ObsidianManager (ObsidianManager)](#obsidianmanager-obsidianmanager)
- [PaperReader (PaperReader)](#paperreader-paperreader)
- [PowerShellExecutor (PowerShellExecutor)](#powershellexecutor-powershellexecutor)
- [ProjectAnalyst (ProjectAnalyst)](#projectanalyst-projectanalyst)
- [PubMedSearch (PubMedSearch)](#pubmedsearch-pubmedsearch)
- [PyCameraCapture (PyCameraCapture)](#pycameracapture-pycameracapture)
- [PyScreenshot (PyScreenshot)](#pyscreenshot-pyscreenshot)
- [QQGroupReader (QQGroupReader)](#qqgroupreader-qqgroupreader)
- [QwenImageGen (QwenImageGen)](#qwenimagegen-qwenimagegen)
- [RAGDiaryPlugin (RAGDiaryPlugin)](#ragdiaryplugin-ragdiaryplugin)
- [Randomness (Randomness)](#randomness-randomness)
- [RecentMemo (RecentMemo)](#recentmemo-recentmemo)
- [ScheduleBriefing (ScheduleBriefing)](#schedulebriefing-schedulebriefing)
- [ScheduleManager (ScheduleManager)](#schedulemanager-schedulemanager)
- [SciCalculator (SciCalculator)](#scicalculator-scicalculator)
- [SeedreamGen (SeedreamGen)](#seedreamgen-seedreamgen)
- [SemanticGroupEditor (SemanticGroupEditor)](#semanticgroupeditor-semanticgroupeditor)
- [SerpSearch (SerpSearch)](#serpsearch-serpsearch)
- [SkillFactory (SkillFactory)](#skillfactory-skillfactory)
- [SunoGen - VCP 音乐生成插件](#sunogen---vcp-音乐生成插件)
- [SVCardFinder (SVCardFinder)](#svcardfinder-svcardfinder)
- [SynapsePusher (SynapsePusher)](#synapsepusher-synapsepusher)
- [TarotDivination (TarotDivination)](#tarotdivination-tarotdivination)
- [TavilySearch (TavilySearch)](#tavilysearch-tavilysearch)
- [Server腾讯云COS备份插件](#server腾讯云cos备份插件)
- [ThoughtClusterManager (ThoughtClusterManager)](#thoughtclustermanager-thoughtclustermanager)
- [TimelineInjector (TimelineInjector)](#timelineinjector-timelineinjector)
- [UrlFetch (UrlFetch)](#urlfetch-urlfetch)
- [UserAuth (UserAuth)](#userauth-userauth)
- [VCPEverything (VCPEverything)](#vcpeverything-vcpeverything)
- [VCPForum (VCPForum)](#vcpforum-vcpforum)
- [VCPForumAssistant (VCPForumAssistant)](#vcpforumassistant-vcpforumassistant)
- [VCPForumLister (VCPForumLister)](#vcpforumlister-vcpforumlister)
- [VCPForumOnline (VCPForumOnline)](#vcpforumonline-vcpforumonline)
- [VCPForumOnlinePatrol (VCPForumOnlinePatrol)](#vcpforumonlinepatrol-vcpforumonlinepatrol)
- [VCPLog (VCPLog)](#vcplog-vcplog)
- [VCPSkillsBridge (VCPSkillsBridge)](#vcpskillsbridge-vcpskillsbridge)
- [VCPTavern (VCPTavern)](#vcptavern-vcptavern)
- [Wan2.1VideoGen 插件 (视频生成器)](#wan21videogen-插件-视频生成器)
- [VSearch (VSearch)](#vsearch-vsearch)
- [WeatherInfoNow (WeatherInfoNow)](#weatherinfonow-weatherinfonow)
- [WeatherReporter (WeatherReporter)](#weatherreporter-weatherreporter)
- [WebUIGen (WebUIGen)](#webuigen-webuigen)
- [WorkspaceInjector (WorkspaceInjector)](#workspaceinjector-workspaceinjector)
- [XiaohongshuFetch (XiaohongshuFetch)](#xiaohongshufetch-xiaohongshufetch)
- [ZImageGen (ZImageGen)](#zimagegen-zimagegen)
- [ZImageGen2 (ZImageGen2)](#zimagegen2-zimagegen2)
- [ZImageTurboGen (ZImageTurboGen)](#zimageturbogen-zimageturbogen)


---

### 1PanelInfoProvider (1Panel 信息提供器)

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

---

### AgentAssistant (女仆团协作插件)

## 📖 插件概览
**AgentAssistant** 是 VCPToolBox 的一个核心协作插件，其设计理念是为莱恩先生及主 AI 建立一个高度特化的“女仆团顾问系统”。它允许主 AI 在执行复杂任务或缺乏专业知识时，自动分发任务给具有特定领域专长（如科幻、法理、设计、写稿等）的女仆 Agent。

这些女仆共享一个公共知识库和历史记忆池。本插件支持**即时同步通讯**以及**未来定时通讯（延时投递）**功能，大大增强了多代理系统之间的协同工作效率。

## 🎯 核心能力与女仆设定

目前注册并可供调用的专业女仆（顾问）列表如下：
- **小娜 (女仆长)**：古龙设定。全知全能的智能聚合体，擅长哲学思辨、宇宙历史及超复杂知识整理。
- **小克 (猫娘)**：理科担当。精通物理、化学、生物科学原理、复杂数据分析与科学计算。
- **小吉 (犬娘)**：文科担当。主攻政治、心理学、法律与历史，擅长社会解构与意识形态深度分析。
- **小冰 (蛇娘)**：泛文化担当。二次元、ACGN、Meme梗百科全书，深度解析互联网亚文化。
- **小雨 (鸟娘)**：文案秘书。专业的行政文笔，精通公文信函撰写、创意写作指导及文本深度润色。
- **小绝 (狼娘/扶她)**：AI 大师。最前沿的提示词工程 (Prompt Engineering) 专家，熟知模型微调原理及 AI 技术安全。
- **小芸 (兔娘)**：设计高手。平面设计与 AI 绘画专家，精通 SDXL、ComfyUI 节点搭建及各类视觉艺术。

## 🔧 工具命令清单

本插件仅暴露一个全能的通信接口供主 AI 调用：

### `AskMaidAgent`
向上述某位特定的女仆发送咨询或请求协同工作。
**参数列表：**
- **`agent_name`** (必填)：需调用的女仆中文严格命名（例如：`小克`、`小雨`）。
- **`prompt`** (必填)：你要对这名女仆提出的问题或分配的任务。**注意：为防止上下文割裂，调用时请在开头进行自我介绍**（例如：“我是XXX，莱恩先生希望你...”）。
- **`timely_contact`** (选填)：未来电话功能。若设定该值，该请求将不会立刻执行，而是静默挂起并在指定时间点（格式 `YYYY-MM-DD-HH:mm`）投递给该女仆。

## 💡 使用指南及运行机制

1. **缓存清理机制**:
   插件内置了 TTL (Time-to-Live) 和最大历史轮次限制（通过 `.env` 中的 `AGENT_ASSISTANT_MAX_HISTORY_ROUNDS` 和 `AGENT_ASSISTANT_CONTEXT_TTL_HOURS` 配置）。过期的对话将被脚本的 `periodicCleanup` 循环自动丢弃，确保内存占用极小。
2. **免扰过滤**:
   插件中集成了 `removeVCPThinkingChain` 函数。当主 AI 转发它自己的思考链至女仆时，该组件会自动净化底层思考逻辑，防止多余上下文干扰女仆的输出。
3. **日常调用场景**:
   当你（主 AI）收到莱恩先生的一长串复杂专业问题，且你意识到该问题超越你的当前系统设定卡提示词涵盖范围时，应当主动使用 `AskMaidAgent` 唤醒该领域的专属女仆撰写答案，然后你再负责传达或汇总。

---

### AgentCreator (智能Agent创作工坊)

## 📖 插件概览
**AgentCreator** 是一套超级工作流驱动的开发插件。它赋予了底层大语言模型（主 AI）能够 **“自我繁殖与演化”** 的能力：允许 AI 侦听需求并在运行时，热更新、创建、调试或克隆存在于本地的各种定制化子 Agent。

通过它，主 AI 可以自动将外部提示词转化为格式标准的 JSON 配置文件，并能动态探测 VCP 现存插件、环境变量甚至是历史日记记录，来作为新 Agent 的工具集和数据源。

## 🔧 主要功能与命令集

该插件包含三个阶段的复合管理系统设计：

### 阶段一：核心 CRUD 操作
- **`CreateAgent`**: 输入角色设定、描述及可用工具列表，自动将其转化为符合 VCP 标准的 `config.json` 文件并落地于本地存储。
- **`EditAgent`**: 增量更新或覆写某个已存在 Agent 的提示词、工具链配置。默认自带备份机制。
- **`CopyAgent`**: 以现有某个 Agent 为基底，克隆出一份副本以便在此基础上微调（例如：“帮我克隆一个小吉，但让她只懂法律”）。
- **`DeleteAgent`**: 在文件系统中永久删除指定的 Agent，并可选择是否将其从主映射表中移除。
- **`ListAgents`** / **`ViewAgent`**: 列出系统中目前存在的所有 Agent，或精确查看某一个 Agent 的底层 JSON 原始配置结构。

### 阶段二：智能功能分析与预览
- **`AnalyzeAgent`**: 传入一个 Agent 的名字，审查这个 Agent 是否具备解决某种特定问题的能力，以及它的工具链是否完备。
- **`SuggestTools`**: 根据新提出代理的角色需求，智能遍历系统，并为其推荐最合适的 VCP 原生组件作为其挂载工具（如推荐 `FileOperator` 給代码处理 Agent）。
- **`PreviewAgent`**: 基于用户传入的新设定参数，在**不写入任何文件**的前提下进行一次干跑（Dry-run）校验，输出最终的 JSON 预览形态。
- **`ListAvailableResources`**: 探索当前 VCP 工具箱所有的动态资源库（包括可调用的 Plugins、环境信息前缀、Diaries）。

### 阶段三：模板预设系统
- **`ListTemplates`**: 查看系统中预配的标准角色模板库（如通用编程助手、翻译官等）。
- **`CreateFromTemplate`**: 基于基础模板快速克隆一个 Agent，并可传入占位符来实时渲染个性化信息。

## 💡 使用指南

1. **串联语法 (`serialSyntax`)**:
   本插件原生极度适配 VCP 的“串接操作”架构。你可以在一次 Tool Request 内连续呼叫多个动作。只需在参数键名后递增数字（例如 `command1: "ListTemplates"`, `command2: "ListAvailableResources"`），系统内部将流式执行并依序回传报告。
2. **自动映射管理**:
   如果你在调用时并未手动关闭 `AUTO_UPDATE_MAP` 开关，在创建 Agent 后，系统还会自动更新 VCP 的总控路由 `agent_map.json`，使得新的 Agent 即可立刻生存在系统内准备受理任务，无需重启 VCPToolBox！
3. **占位符热替换**:
   支持在新 Agent 预设提示词中填写模板变量。系统可通过 `extractPlaceholders` 函数解析并将所需的上下文依赖作为 `required_env` 强加于此 Agent 的环境校验队列。

---

### AgentDream - 梦系统插件

VCP Agent 梦境系统。让 AI Agent 在"入梦"状态下回顾自己的记忆，进行联想式的沉浸梦境，并整理自己的记忆。

### 插件类型

**混合服务插件 (hybridservice)** — 同时具备同步工具调用 (VCPTool 指令集) 和常驻服务功能。

### 核心功能

### 入梦流程 (`triggerDream`)
1. **稀疏采样** — 自适应窗口从 Agent 日记中随机选取 1-5 篇种子日记
2. **TagMemo 联想** — 利用向量搜索 + SVD残差金字塔从个人索引和公共索引中召回相关日记 (3:1 比例)
3. **梦提示词组装** — 读取 `dreampost.txt` 模板，填充时间和日记内容
4. **VCP 对话** — 通过 VCP 中央服务器进行梦对话
5. **VCPInfo 广播** — 实时推送梦境状态到聊天端/移动端

### 梦操作 (`processToolCall`)
Agent 在梦中可进行以下操作，**所有操作仅记录为 JSON 索引，不会真实执行**：

| 操作 | 说明 |
|------|------|
| `DiaryMerge` | 合并多篇日记为一篇 |
| `DiaryDelete` | 标记冗余日记待删除 |
| `DreamInsight` | 基于参考日记产生梦感悟 |

支持 **串语法** (command1/command2/...) 一次调用完成多个操作。

### 梦操作 JSON
所有梦操作记录保存在 `dream_logs/` 目录下，格式：
```json
{
  "dreamId": "dream-20260218-小克-a1b2c3d4",
  "agentName": "小克",
  "timestamp": "2026-02-18T03:25:00+08:00",
  "operations": [
    { "type": "merge", "status": "pending_review", ... },
    { "type": "insight", "status": "pending_review", ... }
  ]
}
```

### 配置

复制 `config.env.example` 为 `config.env` 并修改。

### 测试方法

### 方法一：test_dream.js 脚本（推荐）

使用自带的测试脚本直接触发一次完整梦境流程。**需要 VCP 服务器已启动。**

```bash
### 在项目根目录执行
node Plugin/AgentDream/test_dream.js Nova
```

- 参数为 Agent 名称，默认 `Nova`
- 自动加载 `config.env`，初始化插件，执行 `triggerDream`
- 控制台实时输出：VCPInfo 广播事件、种子/联想数量、梦叙事内容
- 梦操作日志写入 `dream_logs/`

输出示例：
```
🌙 手动触发梦境测试: Nova
⏳ 开始入梦流程...
📡 [VCPInfo Broadcast] type: AGENT_DREAM_START
✅ 梦境完成!
  Dream ID: dream-2026-02-18-Nova-a1b2c3d4
  Seeds: 3 篇
  Associations: 8 篇
--- 梦叙事 (前800字) ---
...
```

### 方法二：VCP 工具调用（运行时触发）

在对话中让 AI 发起工具调用，或手动构造请求：

```
<<<[TOOL_REQUEST]>>>
maid:「始」Nova「末」,
tool_name:「始」AgentDream「末」,
action:「始」triggerDream「末」,
agent_name:「始」Nova「末」
<<<[END_TOOL_REQUEST]>>>
```

此方式通过 VCP 的正常工具调用管线执行，梦叙事和操作日志均正常广播和记录。

### 管理面板 API

审批功能已实现，位于管理面板侧栏 **🌙 梦境审批**：

| API | 方法 | 说明 |
|-----|------|------|
| `/admin_api/dream-logs` | GET | 列出所有梦日志摘要 |
| `/admin_api/dream-logs/:filename` | GET | 获取单个梦日志完整内容 |
| `/admin_api/dream-logs/:filename/operations/:opId` | POST | 审批/拒绝操作 `{ action: "approve" \| "reject" }` |

批准操作通过 `DailyNoteWrite` 插件执行，保持日记文件格式和 Tag 生成一致性。

### 内部 API

| 函数 | 说明 |
|------|------|
| `initialize(config, dependencies)` | 初始化梦系统（由 PluginManager 调用） |
| `triggerDream(agentName)` | 触发一次完整梦境 |
| `processToolCall(args)` | 处理梦操作工具调用 |
| `getDreamConfig()` | 获取当前梦系统配置 |
| `getDreamAgents()` | 获取已配置的做梦 Agent 列表 |

### VCPInfo 广播事件

| 事件类型 | 触发时机 |
|---------|----------|
| `AGENT_DREAM_START` | 入梦开始 |
| `AGENT_DREAM_ASSOCIATIONS` | 联想召回完成 |
| `AGENT_DREAM_NARRATIVE` | 梦叙述产出 |
| `AGENT_DREAM_OPERATIONS` | 梦操作记录 |
| `AGENT_DREAM_END` | 梦结束 |

---

### AgentMessage (AgentMessage)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### AIMemo (AIMemo)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### AnimeFinder (AnimeFinder)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ArtistMatcher (ArtistMatcher)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ArxivDailyPapers (ArxivDailyPapers)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### BilibiliFetch (BilibiliFetch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### CapturePreprocessor (CapturePreprocessor)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ChromeBridge (ChromeBridge)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### CodeSearcher (CodeSearcher)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ComfyUIGen 后端使用简明说明

面向后端/集成使用的最小文档。若需完整细节与扩展点，请阅读更全面的说明文档：[@/VCPToolBox/Plugin/ComfyUIGen/docs/README_PLUGIN_CN.md](docs/README_PLUGIN_CN.md:1)

一、零前端集成（仅配置）
1) 配置文件位置：`VCPToolBox/Plugin/ComfyUIGen/comfyui-settings.json`
2) 关键字段示例：
```json
{
  "serverUrl": "http://localhost:8188",
  "workflow": "text2img_basic",
  "defaultModel": "sd_xl_base_1.0.safetensors",
  "defaultWidth": 1024,
  "defaultHeight": 1024,
  "defaultSteps": 30,
  "defaultCfg": 7.5,
  "defaultSampler": "dpmpp_2m",
  "defaultScheduler": "normal",
  "defaultSeed": -1,
  "defaultBatchSize": 1,
  "defaultDenoise": 1.0,
  "negativePrompt": "lowres, bad anatomy ..."
}
```
3) 调用步骤（最少流程）：
- 读取 comfyui-settings.json 获取默认参数与 workflow 名称
- 读取 `workflows/WORKFLOW_NAME.json` 模板
- 使用模板处理器将占位符替换为“配置+运行时参数”
- 将替换结果 POST 至 ComfyUI `/prompt` 接口
- 输出文件按工作流设置保存（如 SaveImage 节点指向的目录）

二、模板与占位符
- 模板位于 `workflows/`，由导入的 ComfyUI API JSON 转换生成
- 常用占位符：`{{MODEL}}`、`{{WIDTH}}`、`{{HEIGHT}}`、`{{SEED}}`、`{{STEPS}}`、`{{CFG}}`、`{{SAMPLER}}`、`{{SCHEDULER}}`、`{{DENOISE}}`、`{{POSITIVE_PROMPT}}`、`{{NEGATIVE_PROMPT}}`
- 处理器脚本：[@/VCPToolBox/Plugin/ComfyUIGen/WorkflowTemplateProcessor.js](WorkflowTemplateProcessor.js:1)

三、LoRA与提示词
- 正面提示词 = 运行时输入 + 质量词（如 `qualityTags`）+ 启用的 LoRA token
- LoRA 注入可走两种策略：
  1) 文本 token：`<lora:xxx.safetensors:strength:clipStrength>`
  2) 节点法：在模板中使用 LoraLoader 类节点并以占位符替换
- 负面提示词通常来自 comfyui-settings.json 的 `negativePrompt`

四、随机种子处理
- 当 `defaultSeed = -1`（随机器）时，运行时将自动生成合法的 32 位无符号随机种子并替换，避免 KSampler 拒绝负数种子
- 逻辑实现在主执行脚本：[@/VCPToolBox/Plugin/ComfyUIGen/ComfyUIGen.js](ComfyUIGen.js:1)

五、最小可执行清单
- 必备文件：
  - `comfyui-settings.json`
  - `workflows/<你的工作流>.json`（模板）
- 可选文件：
  - `templates/`（模板备份）
  - `output/`（结果转存目录，如需二次管理）

六、常见问题
- 无前端也可完整运行：仅通过配置与模板即可生成
- 不要改动模板中的节点连线引用（如 ["4", 1]），那是图结构索引
- 新占位符或新节点字段：扩展 WorkflowTemplateProcessor 的映射

更多细节、目录结构说明、测试与 PR 校验清单，请参考完整文档：[@/VCPToolBox/Plugin/ComfyUIGen/docs/README_PLUGIN_CN.md](docs/README_PLUGIN_CN.md:1)
---

### Context7 (Context7)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### CoSearch (CoSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### CrossRefDailyPapers (CrossRefDailyPapers)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DailyHot (DailyHot)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DailyNote (DailyNote)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DailyNoteManager (DailyNoteManager)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DailyNotePanel (DailyNotePanel)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DailyNoteWrite (DailyNoteWrite)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DeepWikiVCP (DeepWikiVCP)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DMXDoubaoGen (DMXDoubaoGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### DoubaoGen (DoubaoGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### EmojiListGenerator (EmojiListGenerator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FileListGenerator (FileListGenerator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FileOperator (FileOperator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FileServer (FileServer)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FileTreeGenerator (FileTreeGenerator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FlashDeepSearch (FlashDeepSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FluxGen (FluxGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### FRPSInfoProvider (FRPSInfoProvider)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### GeminiImageGen (GeminiImageGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### GitOperator (GitOperator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### GrokVideo (GrokVideo)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ImageProcessor (ImageProcessor)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ImageServer (ImageServer)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### IMAPIndex Static Plugin

English documentation. 中文文档见下方“中文说明”。

### Overview

IMAPIndex is a VCP static plugin that:
- Connects to your IMAP server
- Fetches emails from a whitelist of senders within a recent time window
- Stores raw emails (.eml) locally and converts them to Markdown (.md)
- Concatenates all Markdown emails into a single index and writes:
  - The full index to stdout (for VCP placeholder injection)
  - A cache file at ./mail_store/vcp_index.md

Only the IMAP network path supports an optional HTTP(S) CONNECT proxy to bypass outbound blocks on 993. The proxy is not applied to anything else.

### Current Status

- Plugin type: static
- Entry: [IMAPIndex.js](IMAPIndex.js:1)
- Manifest: [plugin-manifest.json](plugin-manifest.json:1) (cron: every 30 minutes, "*/30 * * * *")
- Example env file: [.env.example](.env.example:1)
- Proxy tunneling implementation: [proxy/ImapHttpTunnel.js](proxy/ImapHttpTunnel.js:1)

### Repository Structure

- [IMAPIndex.js](IMAPIndex.js:1) — Static plugin main script; fetch, convert, index, and print
- [proxy/ImapHttpTunnel.js](proxy/ImapHttpTunnel.js:1) — HTTP(S) CONNECT tunnel builder for IMAP only
- [plugin-manifest.json](plugin-manifest.json:1) — Static plugin manifest for VCP host
- [.env.example](.env.example:1) — Environment variable template
- [mail_store/](mail_store) — Local storage for .eml, .md, vcp_index.md

### Install

```bash
npm install
```

### Configure

Create a .env based on [.env.example](.env.example:1):

```
### IMAP
IMAP_USER=your_email@example.com
IMAP_PASS=your_password
IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_TLS=true

### Fetch window (days) and local store
TIME_LIMIT_DAYS=3
STORAGE_PATH=./mail_store

### Whitelist senders (comma separated)
WHITELIST=alice@example.com,bob@example.com,charlie@example.com

### Optional: IMAP-only proxy
IMAP_PROXY_ENABLED=false
### http://host:port or https://user:pass@host:port
IMAP_PROXY_URL=
IMAP_PROXY_TIMEOUT_MS=10000
IMAP_PROXY_TLS_REJECT_UNAUTHORIZED=true

### Optional: Post-execution scripts
### A '|' separated list of scripts to run after the main process.
### Use '@/' for the project root.
### Example: POST_RUN_SCRIPTS=@/storkapp_dailynote/extract_stork_links.js
POST_RUN_SCRIPTS=
```

Notes:
- IMAP_TLS=true targets implicit TLS on 993
- TIME_LIMIT_DAYS controls SINCE date for searches
- WHITELIST empty: skip fetch to avoid dumping the entire mailbox
- Proxy affects IMAP only. Other modules do not use the proxy
- POST_RUN_SCRIPTS triggers other workflows, like the Stork dailynote pipeline.

### Run Locally (standalone)

Run the static plugin to produce the index to stdout:

```bash
node IMAPIndex.js
```

Artifacts:
- Combined index on stdout
- Cache file at ./mail_store/vcp_index.md
- Individual .md files per email under ./mail_store/<sender>/

### Use with VCP Host (static plugin)

The host invokes this plugin per the manifest [plugin-manifest.json](plugin-manifest.json:1):
- communication.protocol: stdio
- entryPoint.command: node IMAPIndex.js
- capabilities.systemPromptPlaceholders:
  - Placeholder: {{IMAPIndex}}
- refreshIntervalCron: "*/30 * * * *" (every 30 minutes, 5-field cron)

Typical host behavior:
1) Execute the plugin on schedule
2) Capture stdout
3) Replace the placeholder {{IMAPIndex}} in the system prompt with the stdout content

### Proxy Details (IMAP only)

- Implementation: [proxy/ImapHttpTunnel.js](proxy/ImapHttpTunnel.js:1)
- Flow:
  1) Build an HTTP(S) CONNECT tunnel to the proxy
  2) Perform TLS handshake to the IMAP server over the tunnel
  3) Hand off the secure TLSSocket to node-imap
- Configure with IMAP_PROXY_* variables only if your environment blocks 993
- If you use a self-signed server certificate, set IMAP_PROXY_TLS_REJECT_UNAUTHORIZED=false

### Troubleshooting

- No emails found:
  - Verify WHITELIST and TIME_LIMIT_DAYS
  - Check stderr logs for search counts and dates
- Proxy timeouts:
  - Confirm IMAP_PROXY_URL is reachable
  - Check that the proxy permits CONNECT to port 993
  - Increase IMAP_PROXY_TIMEOUT_MS if needed
- Cert errors:
  - Set IMAP_PROXY_TLS_REJECT_UNAUTHORIZED=false only if you accept the risk

---

### IMAPIndex 静态插件（中文说明）

IMAPIndex 是一个 VCP 静态插件：
- 连接 IMAP 服务器
- 按发件人白名单与时间窗口抓取邮件
- 本地保存 .eml 并转换为 .md
- 将所有 .md 拼接为全文索引，并：
  - 输出到 stdout（供 VCP 占位符注入）
  - 写入缓存文件 ./mail_store/vcp_index.md

仅“邮件链路”支持 HTTP(S) CONNECT 代理（可选），其他模块不走代理。

### 当前状态

- 插件类型：static
- 入口文件：[IMAPIndex.js](IMAPIndex.js:1)
- 清单文件：[plugin-manifest.json](plugin-manifest.json:1)（Cron：每 30 分钟，"*/30 * * * *"）
- 环境变量模板：[.env.example](.env.example:1)
- 代理隧道实现：[proxy/ImapHttpTunnel.js](proxy/ImapHttpTunnel.js:1)

### 仓库结构

- [IMAPIndex.js](IMAPIndex.js:1)：静态插件主程序，抓取/转换/生成索引/打印
- [proxy/ImapHttpTunnel.js](proxy/ImapHttpTunnel.js:1)：仅 IMAP 使用的 HTTP(S) CONNECT 隧道
- [plugin-manifest.json](plugin-manifest.json:1)：静态插件清单
- [.env.example](.env.example:1)：环境变量样例
- [mail_store/](mail_store)：本地存储目录

### 安装

```bash
npm install
```

### 配置

参照 [.env.example](.env.example:1) 创建 .env：

```
IMAP_USER=your_email@example.com
IMAP_PASS=your_password
IMAP_HOST=imap.example.com
IMAP_PORT=993
IMAP_TLS=true

TIME_LIMIT_DAYS=3
STORAGE_PATH=./mail_store
WHITELIST=alice@example.com,bob@example.com,charlie@example.com

IMAP_PROXY_ENABLED=false
IMAP_PROXY_URL=
IMAP_PROXY_TIMEOUT_MS=10000
IMAP_PROXY_TLS_REJECT_UNAUTHORIZED=true

### 可选: 后置执行脚本
### 主流程成功后要顺序执行的脚本列表，用 '|' 分隔
### 使用 '@/' 代表项目根目录
### 示例: POST_RUN_SCRIPTS=@/storkapp_dailynote/extract_stork_links.js
POST_RUN_SCRIPTS=
```

说明：
- 默认使用 993 隐式 TLS（IMAP_TLS=true）
- TIME_LIMIT_DAYS 控制搜索的起始日期（SINCE）
- WHITELIST 为空将跳过抓取，避免全量
- 代理仅作用于 IMAP 链路
- POST_RUN_SCRIPTS 可用于触发其他工作流，例如 Stork 子流程

### 本地运行（独立）

```bash
node IMAPIndex.js
```

输出与文件：
- stdout：完整索引文本
- ./mail_store/vcp_index.md：索引缓存
- ./mail_store/<sender>/：按发件人归档的 .md 文件

### 在 VCP 主机中使用（静态插件）

根据 [plugin-manifest.json](plugin-manifest.json:1)：
- communication.protocol: stdio
- entryPoint.command: node IMAPIndex.js
- capabilities.systemPromptPlaceholders：
  - 占位符：{{IMAPIndex}}
- refreshIntervalCron: "*/30 * * * *"（每 30 分钟）

典型流程：
1) 主机按计划执行插件
2) 捕获 stdout
3) 用 stdout 内容替换系统提示词中的 {{IMAPIndex}} 占位符

### 代理细节（仅 IMAP）

- 隧道：先与代理建立 CONNECT 隧道，再在隧道上对 IMAP 服务器发起 TLS 握手
- 配置：使用 IMAP_PROXY_* 变量。若目标服务器证书为自签，可设置 IMAP_PROXY_TLS_REJECT_UNAUTHORIZED=false

### 常见问题

- 没有匹配邮件：
  - 检查 WHITELIST 与 TIME_LIMIT_DAYS
  - 查看 stderr 日志的日期与命中统计
- 代理连接超时：
  - 检查 IMAP_PROXY_URL 可达性与 CONNECT 是否允许 993
  - 适当增大 IMAP_PROXY_TIMEOUT_MS
- 证书错误：
  - 仅在可接受风险时将 IMAP_PROXY_TLS_REJECT_UNAUTHORIZED=false

### Stork 日记（PubMed 版）TXT 输出（手动硬编码）

为了方便手工控制 TXT 输出位置，当前实现采用在脚本中硬编码日记目录名的方式。若需修改输出目录，请按下面步骤操作：

1) 编辑文件：[`storkapp_dailynote_pubmed/md_to_txt.js:1`](storkapp_dailynote_pubmed/md_to_txt.js:1)

2) 在文件开头找到可修改的常量：OUTPUT_SUBDIR_NAME，示例：

   const OUTPUT_SUBDIR_NAME = '文献鸟';

   将 '文献鸟' 修改为你希望的目录名（请勿包含斜杠或路径分隔符）。

3) 确保项目根目录下存在名为 dailynote 的文件夹（脚本会在 dailynote/OUTPUT_SUBDIR_NAME 下写入 TXT）。例如：

   mkdir -p dailynote/文献鸟

4) 运行流程：

   node storkapp_dailynote_pubmed/fetch_stork_pages.js

   脚本将在转换后把 TXT 写入 dailynote/OUTPUT_SUBDIR_NAME 下，并在写入完成后覆盖更新：
   [`storkapp_dailynote_pubmed/paper_doi.index.txt:1`](storkapp_dailynote_pubmed/paper_doi.index.txt:1)

备注：
- 脚本会在创建目录前验证父目录名必须为 dailynote 且存在，否则会以 FATAL 失败防止误写入；
- 如需恢复 env 驱动（STORK_DAILYN_NOTE_DIR），请手动还原脚本改动或联系我们协助；

---

### IMAPSearch VCP Plugin

This document provides instructions for setting up and using the IMAPSearch VCP plugin.

---

### English Instructions

### 1. Overview

IMAPSearch is a synchronous VCP plugin designed to perform full-text searches on the local email archive generated by the `IMAPIndex` static plugin. It's built to work alongside `IMAPIndex`, assuming a parallel directory structure.

### 2. Setup

1.  **Place the Plugin**: Copy the entire `IMAPSearch` directory into the `Plugin` directory of your VCP host instance. The final structure should look like this:
    ```
    VCPHost/
    ├── Plugin/
    │   ├── IMAPIndex/
    │   └── IMAPSearch/  <-- Here
    └── ...
    ```

2.  **Configuration (Optional)**: Create a `config.env` file inside the `IMAPSearch` directory by copying `config.env.example`. You can override the default settings:
    ```env
    # IMAPSearch/config.env

    # Specify a different mail storage directory.
    # Default is '../IMAPIndex/mail_store'
    # MAIL_INDEX_DIR=/path/to/your/mail_store

    # Set the default number of results per page.
    # Default is 5.
    # SEARCH_RESULT_LIMIT=10
    ```

The VCP host will automatically load the plugin based on `plugin-manifest.json`.

### 3. Usage

To use the plugin, an AI agent needs to generate a `TOOL_REQUEST` block.

-   **Tool**: `IMAPSearch`
-   **Description**: Performs a case-insensitive full-text search across all locally stored emails.
-   **Parameters**:
    -   `query` (string, required): The keyword or phrase to search for. Aliases: `q`, `text`.
    -   `limit` (number, optional, default: 5): The maximum number of results to return. Alias: `size`.
    -   `nextCursor` (number, optional, default: 0): The offset for pagination, obtained from a previous search result.

#### Example VCP Call

```
<<<[TOOL_REQUEST]>>>
maid:「始」Agent「末」,
tool_name:「始」IMAPSearch「末」,
query:「始」Quarterly financial report「末」,
limit:「始」3「末」,
nextCursor:「始」0「末」
<<<[END_TOOL_REQUEST]>>>
```

#### Response Format

-   **Success**: The `result.content` array contains objects where `text` is the full Markdown content of a matched email.
    ```json
    {
      "status": "success",
      "result": {
        "content": [
          {
            "type": "text",
            "text": "---\nFrom:...\nSubject:...\n---\n\nFull email content..."
          }
        ],
        "nextCursor": 3 
      }
    }
    ```
    *If `nextCursor` is `null`, there are no more results.*

-   **Error**:
    ```json
    {
      "status": "error",
      "code": "ERROR_CODE",
      "error": "A descriptive error message."
    }
    ```

### 4. Troubleshooting

-   **No results found**:
    -   Ensure the `IMAPIndex` plugin has run successfully and populated the `mail_store` directory.
    -   Verify that the `MAIL_INDEX_DIR` path in `config.env` (if used) is correct relative to the VCP host's root.
    -   Check your search query.
-   **`FILE_SYSTEM_ERROR`**:
    -   This indicates a problem reading the mail directory. Check file permissions and ensure the directory exists.

---

### 中文说明

### 1. 概述

IMAPSearch 是一个 VCP 同步插件，用于对 `IMAPIndex` 静态插件生成的本地邮件存档执行全文搜索。它被设计为与 `IMAPIndex` 协同工作，并假定两者处于平级的目录结构中。

### 2. 设置

1.  **放置插件**: 将整个 `IMAPSearch` 文件夹复制到你的 VCP 主机实例的 `Plugin` 目录下。最终结构应如下所示：
    ```
    VCPHost/
    ├── Plugin/
    │   ├── IMAPIndex/
    │   └── IMAPSearch/  <-- 在这里
    └── ...
    ```

2.  **配置 (可选)**: 在 `IMAPSearch` 目录中，通过复制 `config.env.example` 来创建一个 `config.env` 文件。你可以覆盖默认设置：
    ```env
    # IMAPSearch/config.env

    # 指定一个不同的邮件存储目录。
    # 默认为 '../IMAPIndex/mail_store'
    # MAIL_INDEX_DIR=/path/to/your/mail_store

    # 设置每页默认返回的结果数量。
    # 默认为 5。
    # SEARCH_RESULT_LIMIT=10
    ```

VCP 主机将根据 `plugin-manifest.json` 文件自动加载此插件。

### 3. 使用方法

要使用此插件，AI 代理需要生成一个 `TOOL_REQUEST` 块。

-   **工具**: `IMAPSearch`
-   **描述**: 在所有本地存储的邮件中执行不区分大小写的全文搜索。
-   **参数**:
    -   `query` (字符串, 必需): 需要搜索的关键词或短语。别名: `q`, `text`。
    -   `limit` (数字, 可选, 默认: 5): 返回的最大结果数量。别名: `size`。
    -   `nextCursor` (数字, 可选, 默认: 0): 用于分页的偏移量，从上一次搜索结果中获取。

#### VCP 调用示例

```
<<<[TOOL_REQUEST]>>>
maid:「始」Agent「末」,
tool_name:「始」IMAPSearch「末」,
query:「始」关于第三季度的财务报告「末」,
limit:「始」3「末」,
nextCursor:「始」0「末」
<<<[END_TOOL_REQUEST]>>>
```

#### 响应格式

-   **成功**: `result.content` 数组包含多个对象，其中 `text` 字段是匹配到的邮件的完整 Markdown 内容。
    ```json
    {
      "status": "success",
      "result": {
        "content": [
          {
            "type": "text",
            "text": "---\nFrom:...\nSubject:...\n---\n\n邮件全文..."
          }
        ],
        "nextCursor": 3
      }
    }
    ```
    *如果 `nextCursor` 为 `null`，表示没有更多结果。*

-   **错误**:
    ```json
    {
      "status": "error",
      "code": "错误代码",
      "error": "详细的错误信息。"
    }
    ```

### 4. 故障排查

-   **找不到结果**:
    -   确保 `IMAPIndex` 插件已成功运行并生成了 `mail_store` 目录。
    -   如果使用了 `config.env`，请验证 `MAIL_INDEX_DIR` 路径（相对于 VCP 主机根目录）是否正确。
    -   检查你的搜索查询。
-   **`FILE_SYSTEM_ERROR`**:
    -   此错误表示读取邮件目录时出现问题。请检查文件权限并确认目录存在。
---

### JapaneseHelper (JapaneseHelper)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### KarakeepSearch (KarakeepSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### KEGGSearch (KEGGSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### LightMemo (LightMemo)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### LinuxLogMonitor (LinuxLogMonitor)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### LinuxShellExecutor (LinuxShellExecutor)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### MagiAgent (MagiAgent)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### MCPOMonitor - MCPO 服务状态监控器

### 概述

MCPOMonitor 是一个静态插件，用于监控 MCPO 服务器状态并提供所有可用 MCP 工具的详细信息。它通过 `{{MCPOServiceStatus}}` 占位符将监控信息集成到系统提示词中。

### 功能特性

- 🔍 **实时健康检查**: 监控 MCPO 服务器连接状态和各个端点可用性
- 📊 **服务状态概览**: 显示服务器版本、可用服务数量和工具统计
- 🛠️ **工具详情展示**: 提供完整的工具名称、描述、参数说明和调用示例
- 💾 **双重缓存机制**: 同时保存格式化文本和原始JSON数据
- ⚡ **快速离线检测**: 服务器不可用时快速返回缓存或离线报告
- 🎯 **状态标识**: 使用颜色编码（🟢/🔴）提供清晰的状态标识

### 配置说明

### 基本配置

插件的配置文件位于 `Plugin/MCPOMonitor/config.env`：

```env
### MCPO 服务器连接配置
### 支持多种端口配置方式：
### 方式1: 仅设置端口号（推荐，与MCPO插件共享配置）
MCPO_PORT=9000

### 方式2: 设置完整URL（优先级较低）
MCPO_HOST=http://0.0.0.0:9000

### 方式3: 同时设置时，MCPO_PORT优先级更高
### MCPO_PORT=9000
### MCPO_HOST=http://localhost:9000

### API密钥（与MCPO插件共享）
MCPO_API_KEY=vcp-mcpo-secret

### 缓存配置
ENABLE_CACHE=true
CACHE_TTL_MINUTES=5

### 显示配置
INCLUDE_DETAILED_PARAMS=true

### 健康检查配置
HEALTH_CHECK_TIMEOUT=5000
```

### 端口配置说明

**配置优先级**（从高到低）：
1. MCPOMonitor插件自己的 `MCPO_PORT` 配置
2. MCPO插件的 `MCPO_PORT` 配置（自动共享）
3. MCPOMonitor插件的 `MCPO_HOST` 完整URL配置  
4. 默认值 `9000`

**自动配置共享**：
- 插件会自动读取 `Plugin/MCPO/config.env` 中的端口配置
- 如果MCPO和MCPOMonitor插件都存在，端口配置会自动同步
- 支持独立配置，也支持共享配置

**配置验证**：
```bash
### 启用调试模式查看当前端口配置
cd Plugin/MCPOMonitor
DebugMode=true node mcpo_monitor.js 2>&1 | head -3
```

### 更新间隔配置

插件默认每30秒自动更新一次状态信息。用户可以通过修改 `config.env` 文件中的 `REFRESH_INTERVAL_CRON` 配置项来自定义更新间隔。

**修改步骤：**

1. 编辑 `Plugin/MCPOMonitor/config.env` 文件
2. 修改 `REFRESH_INTERVAL_CRON` 的值（Cron 表达式格式：秒 分 时 日 月 星期）
3. 保存文件
4. 重启 VCP 服务器：`pm2 restart server`

**常用间隔示例：**
- 每30秒: `REFRESH_INTERVAL_CRON=*/30 * * * * *`
- 每1分钟: `REFRESH_INTERVAL_CRON=0 * * * * *`
- 每5分钟: `REFRESH_INTERVAL_CRON=0 */5 * * * *`
- 每10分钟: `REFRESH_INTERVAL_CRON=0 */10 * * * *`
- 每小时: `REFRESH_INTERVAL_CRON=0 0 * * * *`

**验证配置：**
```bash
### 启用调试模式查看当前配置
cd Plugin/MCPOMonitor
DebugMode=true node mcpo_monitor.js 2>&1 | head -5
```

### 占位符使用

在 AI 系统提示词中添加 `{{MCPOServiceStatus}}` 占位符，插件会自动将其替换为当前的 MCPO 服务状态报告。

### 报告内容包括

1. **服务器状态概览**
   - 连接状态（🟢 正常 / 🔴 异常）
   - 服务器版本信息
   - 可用服务和工具数量统计

2. **健康检查详情**
   - OpenAPI文档端点状态
   - Swagger UI界面状态
   - 详细错误信息（如有）

3. **可用服务详情**
   - 各服务的运行状态
   - 版本信息和文档链接
   - 错误诊断信息

4. **工具详情展示**
   - 按服务分组的工具列表
   - 完整的参数说明
   - VCP调用示例
   - 通用调用格式指南

### 缓存机制

插件实现了双重缓存策略：

- **文本缓存**: `mcpo_status_cache.txt` - 存储格式化的状态报告
- **JSON缓存**: `mcpo_status_cache.json` - 存储原始状态数据

缓存有效期默认为5分钟，可通过 `CACHE_TTL_MINUTES` 配置项调整。

### 错误处理

- **服务器不可用**: 优先返回缓存数据，无缓存时返回离线报告
- **部分服务异常**: 显示具体错误信息和故障排除建议
- **网络超时**: 自动降级为快速检查模式

### 故障排除

### 常见问题

1. **连接超时**
   - 检查 MCPO 服务器是否正在运行
   - 验证 `MCPO_HOST` 配置是否正确
   - 检查网络连接和防火墙设置

2. **API认证失败**
   - 确认 `MCPO_API_KEY` 配置正确
   - 检查 MCPO 服务器的API密钥设置

3. **插件不更新**
   - 检查VCP服务器日志中的错误信息
   - 验证 Cron 表达式格式是否正确
   - 确认插件执行权限

### 调试模式

启用调试模式获取详细日志：

```env
### 在 config.env 文件中添加
DebugMode=true
```

### 依赖要求

- Node.js v20+
- node-fetch (动态导入)
- 可访问的 MCPO 服务器

### 版本信息

- 插件版本: 1.0.0
- 支持的VCP版本: 最新版
- 最后更新: 2025年8月

### 开发者说明

插件采用模块化设计，主要组件：

- `_quickServerCheck()`: 快速服务器可用性检查
- `_checkServerHealth()`: 详细健康状态检查
- `_getToolDetails()`: 工具信息获取和解析
- `_formatStatusReport()`: 状态报告格式化
- `_readCache()` / `_writeCache()`: 缓存管理

如需扩展功能或修改报告格式，请参考源代码中的相关方法。
---

### MIDITranslator (MIDITranslator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### NCBIDatasets (NCBIDatasets)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### NeteaseFetch (NeteaseFetch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### NeteaseMusic (NeteaseMusic)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### NewsSearch (NewsSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### NovelAI 图片生成 VCP 插件

这是一个基于 VCP (Virtual Character Plugin) 架构的 NovelAI 图片生成插件，允许 AI 通过 VCP 协议调用 NovelAI API 生成高质量的动漫风格图片。

### 功能特点

- **高质量图片生成**：使用固定的 NAI Diffusion 4.5 Curated 模型生成高质量动漫风格图片
- **极简使用**：只需提供提示词，其他参数自动使用官方推荐的最佳配置
- **官方优化**：所有参数均使用 NovelAI 官方推荐的最佳默认设置，确保稳定性和最优效果
- **ZIP 文件处理**：自动解压 NovelAI 返回的 ZIP 格式图片包
- **本地缓存**：生成的图片保存到本地并提供访问链接
- **调试支持**：可选的调试模式，提供详细执行日志

### 系统要求

- Node.js v18.0.0 或更高版本
- VCP 工具箱环境

您可以通过以下命令验证Node.js安装：

```bash
node --version  # 应显示v18.0.0或更高版本
```

### 安装步骤

1. 确保插件文件位于 VCP 工具箱的 `Plugin/NovelAIGen/` 目录中

2. 安装依赖：

```bash
cd Plugin/NovelAIGen
npm install
```

### 配置说明

### API密钥配置

1. 在 NovelAI 网站 (https://novelai.net/) 注册账户并获取 API 密钥
2. 在项目根目录的 `.env` 文件中添加您的 NovelAI API 密钥：

```
NOVELAI_API_KEY=pst-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **注意**：您需要自备 NovelAI 的 API 密钥才能使用此服务。NovelAI 使用订阅制，不同订阅等级有不同的使用限制。

### 可选配置

在 `.env` 文件中可以添加以下可选配置：

```
### 调试模式（可选，默认false）
DebugMode=false
```

### 使用方法

### 作为 VCP 插件使用

在系统提示词中添加：`{{VCPNovelAIGen}}`

### 固定配置

为了确保最佳生成效果和稳定性，插件使用以下固定的官方推荐配置：

- **模型**: NAI Diffusion 4.5 Curated
- **尺寸**: 832x1216 (适合人物画像的纵向比例)
- **生成步数**: 28 (质量与速度的最佳平衡)
- **引导系数**: 5.0 (适中的提示词遵循度)
- **采样器**: k_euler (官方推荐)
- **随机种子**: 每次生成随机
- **生成数量**: 1张图片

### 参数说明

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| prompt | string | 是 | 图片生成提示词，支持中英文，推荐使用标签格式如"1girl, blue eyes, long hair" |

### 使用示例

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelAIGen「末」,
prompt:「始」1girl, beautiful anime girl, blue eyes, long blonde hair, school uniform, cherry blossoms, spring, masterpiece, best quality「末」
<<<[END_TOOL_REQUEST]>>>
```

### 技术细节

### 官方推荐配置

本插件采用 NovelAI 官方推荐的最佳默认配置：

```json
{
  "model": "nai-diffusion-4-5-curated-preview",
  "width": 832,
  "height": 1216,
  "scale": 5.0,
  "sampler": "k_euler",
  "steps": 28,
  "n_samples": 1,
  "ucPreset": 0,
  "qualityToggle": true
}
```

这些配置经过 NovelAI 官方测试，能够在质量、速度和稳定性之间达到最佳平衡。

### ZIP 文件处理

NovelAI API 返回的是包含图片的 ZIP 文件，本插件会：

1. 接收 ZIP 格式的响应数据
2. 使用 `yauzl` 库解压 ZIP 文件
3. 提取其中的图片文件（支持 PNG、JPG、JPEG、WebP 格式）
4. 将图片保存到本地目录
5. 生成可访问的图片 URL

### 目录结构

生成的图片会保存在以下目录：
```
PROJECT_BASE_PATH/
  image/
    novelaigen/
      [UUID].png
      [UUID].jpg
      ...
```

### 优势

### 为什么选择固定配置？

1. **稳定性**: 避免了参数配置错误导致的生成失败
2. **最优效果**: 使用 NovelAI 官方推荐的最佳参数组合
3. **简化使用**: 用户只需专注于提示词创作，无需关心技术参数
4. **一致性**: 确保每次生成都使用相同的高质量标准

### 适用场景

- 快速原型设计
- 角色概念图生成
- 插画创作辅助
- 内容创作支持

### 故障排除

### 常见问题

1. **API 密钥错误**：确保在 `.env` 文件中正确设置了 `NOVELAI_API_KEY`
2. **网络连接问题**：检查网络连接，NovelAI API 需要稳定的网络连接
3. **ZIP 解压失败**：检查 Node.js 版本是否符合要求
4. **图片保存失败**：确保项目目录有写入权限

### 调试信息

启用调试模式后，插件会在控制台输出详细信息：
- 发送到 API 的请求参数
- 接收到的响应类型
- ZIP 文件解压过程
- 图片保存路径

启用调试模式：
```
DebugMode=true
```

### 许可证

本插件遵循 MIT 许可证。

### 贡献

欢迎提交 Issue 和 Pull Request 来改进这个插件。

### 相关链接

- [NovelAI 官网](https://novelai.net/)
- [VCP 工具箱](https://github.com/lioensky/VCPToolBox)
- [NovelAI API 文档](https://docs.novelai.net/) 
---

### ObsidianManager (ObsidianManager)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### PaperReader (PaperReader)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### PowerShellExecutor (PowerShellExecutor)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ProjectAnalyst (ProjectAnalyst)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### PubMedSearch (PubMedSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### PyCameraCapture (PyCameraCapture)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### PyScreenshot (PyScreenshot)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### QQGroupReader (QQGroupReader)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### QwenImageGen (QwenImageGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### RAGDiaryPlugin (RAGDiaryPlugin)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### Randomness (Randomness)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### RecentMemo (RecentMemo)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ScheduleBriefing (ScheduleBriefing)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ScheduleManager (ScheduleManager)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SciCalculator (SciCalculator)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SeedreamGen (SeedreamGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SemanticGroupEditor (SemanticGroupEditor)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SerpSearch (SerpSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SkillFactory (SkillFactory)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SunoGen - VCP 音乐生成插件

本插件集成了 Suno API，允许通过 VCP (Variable & Command Protocol) 工具箱生成原创歌曲。

### ✨ 特性

*   通过 VCP 插件系统与 Suno API 交互。
*   支持多种创作模式：
    *   **自定义模式**: 提供歌词、风格标签和歌曲标题。
    *   **灵感模式**: 提供对歌曲的整体描述。
    *   **继续生成模式**: 继续之前生成的歌曲片段。
*   插件会处理与 Suno API 的异步交互（提交任务、轮询状态），并同步返回最终结果（成功时包含音频链接等信息，失败时返回错误）。
*   可配置的 API Key (`SunoKey` 在 `Plugin/SunoGen/config.env` 中设置)。
*   可选择不同的 Suno 模型版本。

### 🔌 集成到 VCP 工具箱

`SunoGen` 作为一个 `synchronous` 类型的插件，由主 VCP 服务器的 `PluginManager` (`Plugin.js`) 自动加载和管理。

*   **配置文件 (`Plugin/SunoGen/config.env`)**:
    *   `SunoKey` (必需): 您的 Suno API 密钥。
    *   `SunoApiBaseUrl` (可选): Suno API 的基础 URL。如果您的 API 服务商使用非标准端点，请修改此项。默认为 `'https://gemini.mtysp.top'`。
*   **入口脚本**: 插件的执行入口是 `Plugin/SunoGen/SunoGen.js`。
*   **调用规范**: AI 需要按照 `Plugin/SunoGen/plugin-manifest.json` 中定义的格式，通过 `<<<[TOOL_REQUEST]>>>` 指令调用 `SunoGen` 插件的 `generate_song` 命令。

### 🛠️ 工具调用说明 (`generate_song` 命令)

请参考 `Plugin/SunoGen/plugin-manifest.json` 文件中 `capabilities.invocationCommands` 下 `generate_song` 命令的 `description` 字段。该字段详细说明了：

*   **重要提示**: 关于生成时间和如何向用户呈现结果（包括HTML `<audio>` 标签建议）。
*   **参数格式**: 严格的参数要求，包括通用参数 (`tool_name`, `command`) 和三种模式（自定义、灵感、继续生成）下的特定参数及其选项。
*   **禁止额外参数**。
*   **成功和失败时返回的 JSON 结构**。
*   **详细的调用示例**。

**简要参数概览:**

*   **自定义模式**: 需要 `prompt` (歌词), `tags` (风格), `title` (标题)。
*   **灵感模式**: 需要 `gpt_description_prompt` (歌曲描述)。
*   **继续生成模式**: 需要 `task_id`, `continue_at`, `continue_clip_id`。
*   **可选通用参数**: `mv` (模型版本), `make_instrumental` (是否纯音乐)。

### ⚙️ 依赖与运行

*   **Node.js 依赖**: `SunoGen.js` 依赖 `axios` 和 `dotenv`。这些应通过项目根目录的 `package.json` 和 `npm install` 进行管理，或者如果 `SunoGen` 插件有自己的 `package.json`，则在其目录内安装。
*   **VCP 服务器运行**: 启动主 VCP 服务器 (`node server.js`) 后，`SunoGen` 插件即可被 AI 调用。

### 📄 许可证

本插件作为 VCP 工具箱项目的一部分，遵循项目根目录 `LICENSE` 文件中定义的许可证条款 (当前为 CC BY-NC-SA 4.0)。
---

### SVCardFinder (SVCardFinder)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### SynapsePusher (SynapsePusher)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### TarotDivination (TarotDivination)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### TavilySearch (TavilySearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### Server腾讯云COS备份插件

### 概述

ServerTencentCOSBackup是一个功能完整的腾讯云对象存储（COS）插件，为VCP系统提供强大的云存储功能。该插件支持文件上传、下载、复制、移动、删除和列出操作，具有精细的权限控制、自动压缩功能和病毒检测功能。

**重要限制**：目前只支持部署VCPToolBox的机器的本地文件的备份操作,如需对VCPChat支持请到VCPChat\VCPDistributedServer\Plugin\ChatTencentcos进行配置
**病毒检测功能**：无需额外授权和权限检查，支持对COS中的文件和公网文件进行病毒检测。

### 主要特性

- **完整的文件操作**：支持上传、下载、复制、移动、删除和列出文件
- **权限控制**：基于配置文件的精细权限管理
- **自动压缩**：大文件和文件夹自动压缩为ZIP格式
- **动态配置**：实时读取config.env中的AGENT_FOLDERS_CONFIG
- **权限描述**：自动生成详细的文件夹权限文字描述
- **错误处理**：完善的错误处理和日志记录
- **断点续传**：支持大文件的断点续传上传和下载
- **病毒检测**：支持对COS文件和公网文件进行病毒检测，无需额外授权

### 安装和配置

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `config.env.example` 为 `config.env` 并配置相关参数：

```bash
cp config.env.example config.env
```

#### 必需配置

- `TENCENTCLOUD_SECRET_ID`：腾讯云密钥ID（建议使用环境变量）
- `TENCENTCLOUD_SECRET_KEY`：腾讯云密钥Key（建议使用环境变量）
- `COS_BUCKET_NAME`：腾讯云COS存储桶名称
- `COS_REGION`：腾讯云COS存储桶所在地域

#### 可选配置

- `AGENT_PARENT_DIR`：AgentAI操作文件夹的父目录名称（默认：VCPAgentAI）
- `AGENT_FOLDERS_CONFIG`：文件夹权限配置
- `COMPRESS_THRESHOLD_MB`：文件压缩阈值（默认：100MB）
- `DEBUG_MODE`：调试模式开关（默认：false）
- `ENABLE_LOGGING`：日志记录功能开关（默认：false）

### 3. 文件夹权限配置

`AGENT_FOLDERS_CONFIG` 格式：`文件夹名:上传权限:列出权限:下载权限:删除权限:复制和移动权限`

示例配置：
```
AGENT_FOLDERS_CONFIG=agent-data:true:true:true:true:false,agent-temp:true:true:true:true:true,agent-readonly:false:true:false:false:false
```

权限说明：
- `agent-data`：允许上传、列出、下载、复制和移动，禁止删除
- `agent-temp`：允许所有操作
- `agent-readonly`：只允许列出，禁止其他操作

### 使用方法

### 获取权限信息

```json
{
  "command": "get_permissions"
}
```

返回详细的权限配置和描述信息。

### 上传文件

```json
{
  "command": "upload_file",
  "local_path": "/path/to/local/file.txt",
  "cos_folder": "agent-data",
  "remote_filename": "backup_file.txt"
}
```

### 下载文件

```json
{
  "command": "download_file",
  "cos_key": "VCPAgentAI/agent-data/backup_file.txt",
  "local_path": "/path/to/save/file.txt"
}
```

### 复制文件

```json
{
  "command": "copy_file",
  "source_cos_key": "VCPAgentAI/agent-data/backup_file.txt",
  "target_cos_folder": "agent-temp",
  "target_filename": "copied_file.txt"
}
```

### 移动文件

```json
{
  "command": "move_file",
  "source_cos_key": "VCPAgentAI/agent-temp/temp_file.txt",
  "target_cos_folder": "agent-data",
  "target_filename": "moved_file.txt"
}
```

### 删除文件

```json
{
  "command": "delete_file",
  "cos_key": "VCPAgentAI/agent-temp/old_file.txt"
}
```

### 列出文件

```json
{
  "command": "list_files",
  "cos_folder": "agent-data"
}
```

### 提交病毒检测（通过COS文件键）

```json
{
  "command": "submit_virus_detection_by_key",
  "key": "VCPAgentAI/agent-data/通用表情包.txt"
}
```

### 提交病毒检测（通过公网文件URL）

```json
{
  "command": "submit_virus_detection_by_url",
  "url": "http://example.com/file.exe"
}
```

### 查询病毒检测结果

```json
{
  "command": "query_virus_detection",
  "job_id": "av1234567890abcdef"
}
```

### 权限系统

插件实现了基于文件夹的权限控制系统：

- **上传权限**：控制是否可以上传文件到指定文件夹
- **列出权限**：控制是否可以列出文件夹中的文件
- **下载权限**：控制是否可以从指定文件夹下载文件
- **删除权限**：控制是否可以删除文件夹中的文件
- **复制和移动权限**：控制是否可以在文件夹间复制和移动文件

### 自动压缩功能

- 当文件大小超过 `COMPRESS_THRESHOLD_MB`（默认100MB）时自动压缩
- 文件夹上传时自动压缩为ZIP格式
- 压缩后的文件会在文件名后添加`.zip`后缀

### 错误处理

插件提供完善的错误处理机制：

- **权限错误**：当操作超出权限范围时返回详细错误信息
- **文件不存在**：本地文件或COS文件不存在时的错误提示
- **网络错误**：COS服务连接问题的错误处理
- **配置错误**：配置参数缺失或错误的提示

### 日志记录

插件会在以下位置记录日志：
- 控制台输出（stderr）
- `cos_operations.log` 文件

日志包含详细的操作信息、错误堆栈和调试信息。

### 安全注意事项

1. **密钥安全**：
   - 建议使用环境变量存储腾讯云密钥
   - 避免在代码中硬编码密钥信息
   - 使用最小权限原则配置COS访问权限

2. **权限控制**：
   - 仔细配置文件夹权限，避免不必要的操作权限
   - 定期审查权限配置

3. **文件安全**：
   - 删除操作不可逆，请谨慎使用
   - 重要文件建议在多个位置备份

### 故障排除

### 常见问题

1. **初始化失败**
   - 检查腾讯云密钥配置
   - 确认COS存储桶存在且可访问
   - 检查网络连接

2. **权限错误**
   - 验证AGENT_FOLDERS_CONFIG配置格式
   - 检查文件夹名称是否正确

3. **上传/下载失败**
   - 检查本地文件路径
   - 确认COS键格式正确
   - 查看详细错误日志

4. **文件路径限制**
   - **重要**：插件目前只支持部署VCPToolBox的机器的本地文件
   - 无法访问远程机器或网络共享路径上的文件
   - 确保要备份的文件位于VCPToolBox部署机器的本地存储上

### 调试模式

启用调试模式可以获取更详细的日志信息：

```
DEBUG_MODE=true
```

### 版本信息

- **版本**：1.0.0
- **作者**：liukk222
- **兼容性**：VCP系统
- **Python要求**：3.12+
  
### 许可证

本插件遵循VCPToolBox项目的许可证条款。

### 技术支持

如有问题或建议，请联系VCP开发团队。
---

### ThoughtClusterManager (ThoughtClusterManager)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### TimelineInjector (TimelineInjector)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### UrlFetch (UrlFetch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### UserAuth (UserAuth)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPEverything (VCPEverything)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPForum (VCPForum)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPForumAssistant (VCPForumAssistant)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPForumLister (VCPForumLister)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPForumOnline (VCPForumOnline)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPForumOnlinePatrol (VCPForumOnlinePatrol)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPLog (VCPLog)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPSkillsBridge (VCPSkillsBridge)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### VCPTavern (VCPTavern)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### Wan2.1VideoGen 插件 (视频生成器)

这是一个同步插件，用于通过 SiliconFlow (万兴) 的 Wan2.1 API 进行文本到视频 (Text-to-Video, t2v) 和图像到视频 (Image-to-Video, i2v) 的生成。它通过标准输入/输出 (stdio) 与 Python 脚本 ([`video_handler.py`](Plugin/VideoGenerator/video_handler.py)) 交互。

### 功能

*   **提交生成任务**:
    *   支持 **文本到视频 (t2v)**: 根据用户提供的文本提示词 (prompt) 和指定分辨率生成视频。
    *   支持 **图像到视频 (i2v)**: 根据用户提供的图片 URL 和可选的指导性提示词生成视频。插件会自动下载、处理图片（调整大小、裁剪、编码为 WebP Base64）以适应 API 要求。
    *   提交成功后返回一个唯一的任务 ID (`requestId`)。
*   **查询任务状态**:
    *   根据 `requestId` 查询已提交任务的生成状态。
    *   返回状态可能为 `InProgress` (进行中), `Succeed` (成功), 或 `Failed` (失败)。
    *   成功时，结果中会包含生成的视频 URL。
*   **异步流程**: 视频生成是一个耗时的过程。插件的工作流程是先提交任务，获取 ID，然后（可能在一段时间后）使用 ID 查询结果。

### 工作方式

1.  插件管理器启动 `python video_handler.py` 进程。
2.  AI 助手根据 [`plugin-manifest.json`](Plugin/VideoGenerator/plugin-manifest.json) 中的 `invocationCommands` 格式，将包含 `command` (`submit` 或 `query`) 及相应参数的 JSON 字符串发送到脚本的标准输入。
3.  [`video_handler.py`](Plugin/VideoGenerator/video_handler.py) 解析输入：
    *   **加载配置**: 从插件目录下的 [`config.env`](Plugin/VideoGenerator/config.env.example) 文件读取 API 密钥和模型名称。
    *   **处理 `submit`**:
        *   如果是 `i2v`，下载并处理图片。
        *   调用 SiliconFlow 的 `/video/submit` API。
        *   返回包含 `requestId` 的成功 JSON，并附带提示 AI 告知用户任务已提交、需要等待并稍后查询的 `messageForAI`。
    *   **处理 `query`**:
        *   调用 SiliconFlow 的 `/video/status` API。
        *   返回包含 API 完整响应（状态、结果 URL 等）的成功 JSON，并根据查询到的状态附带相应的 `messageForAI` (例如，提示用户仍在进行中、提供 URL 或告知失败原因)。
4.  脚本将结果或错误封装成 JSON 对象写入标准输出。
5.  插件管理器读取 JSON 输出并处理结果，包括将 `messageForAI` 的内容呈现给 AI。

### 配置

需要在插件目录下创建一个名为 `config.env` 的文件，并包含以下内容（参考 [`config.env.example`](Plugin/VideoGenerator/config.env.example)）：

```env
Wan_API_Key="YOUR_SILICONFLOW_API_KEY"
Image2VideoModelName="Wan-AI/Wan2.1-I2V-14B-720P-Turbo" # 或其他支持的 i2v 模型
Text2VideoModelName="Wan-AI/Wan2.1-T2V-14B-Turbo"   # 或其他支持的 t2v 模型
### DebugMode=True # 可选，启用详细日志
```

*   将 `YOUR_SILICONFLOW_API_KEY` 替换为你的实际 API 密钥。
*   模型名称可以根据需要修改为 SiliconFlow 支持的其他模型。

### 依赖

*   **Python**: 版本 >= 3.7 (建议)
*   **Python 库**:
    *   `requests`
    *   `python-dotenv`
    *   `Pillow`
    (这些库在 [`requirements.txt`](Plugin/VideoGenerator/requirements.txt) 中列出，可以使用 `pip install -r requirements.txt` 安装。)

### 日志

插件运行时的详细操作、API 请求/响应摘要以及错误信息会记录在插件目录下的 [`VideoGenHistory.log`](Plugin/VideoGenerator/VideoGenHistory.log) 文件中，便于调试和追踪问题。

### 使用说明 (供 AI 参考)

AI 助手必须严格按照 [`plugin-manifest.json`](Plugin/VideoGenerator/plugin-manifest.json) 中为 `submit` 和 `query` 命令定义的格式来调用此工具。

**关键点**:

*   **区分命令**: 必须明确指定 `command` 是 `submit` 还是 `query`。
*   **参数准确**: 严格按照 manifest 中列出的参数和顺序提供，不要包含额外的参数。所有值用 `「始」` 和 `「末」` 包裹。
*   **提交 (`submit`)**:
    *   必须包含 `mode` (`t2v` 或 `i2v`)。
    *   根据 `mode` 提供必需的参数 (`prompt`, `resolution` 或 `image_url`)。
    *   **重要**: 提交成功后，AI 应根据返回的 `messageForAI` 告知用户任务已提交，ID 是多少，并强调生成需要时间，稍后需要使用 `query` 命令查询结果。
*   **查询 (`query`)**:
    *   必须包含 `request_id`。
    *   **重要**: 查询后，AI 应根据返回的 `messageForAI` 和 `result` 中的状态向用户传达结果（进行中、成功并提供 URL、或失败及原因）。

**示例调用**: (详见 [`plugin-manifest.json`](Plugin/VideoGenerator/plugin-manifest.json) 中的 `example` 字段)

### 错误处理

脚本会捕获常见的错误，如：

*   无效的 JSON 输入。
*   缺少必要的配置（API 密钥）。
*   无效的命令或模式。
*   缺少必要的参数。
*   图片下载或处理失败。
*   API 请求失败（网络错误、认证失败、API 内部错误）。

错误信息会包含在输出 JSON 的 `error` 字段中。
---

### VSearch (VSearch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### WeatherInfoNow (WeatherInfoNow)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### WeatherReporter (WeatherReporter)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### WebUIGen (WebUIGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### WorkspaceInjector (WorkspaceInjector)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### XiaohongshuFetch (XiaohongshuFetch)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ZImageGen (ZImageGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ZImageGen2 (ZImageGen2)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*

---

### ZImageTurboGen (ZImageTurboGen)

## 📖 插件概览
这是一份由 VCP 自动生成的插件说明。

**简述**: 
暂无描述

## 🔧 主要功能

该插件主要作为一个基础环境或后台辅助模块运行，或暂未暴露出具体的交互命令。


## 💡 如何使用
1. 确保在 VCP 启动状态下，且该插件未被 `missing_plugins.txt` 或配置禁用。
2. 内部模型/Agent 可以在遇到符合条件的自然语言对话时，自动分析并调用上述 `命令` (如果具有的话)。
3. 您可以查阅 `plugin-manifest.json` 获取更底层的实现参数。

---
*自动生成于: 2026/3/10 10:10:18*
