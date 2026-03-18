# 插件分类版说明书

- 生成时间：2026-03-09
- 生成方式：基于 `plugin-manifest.json` / `.block`、README、目录命名和入口文件进行主功能分类
- 分类原则：每个插件只给一个“主分类”，便于浏览；少数跨域插件也可能适用于其他场景
- 配套文档：`PLUGIN_PLUGIN_GUIDE.md` 提供逐插件的完整说明，这份文档侧重“按功能分组看全貌”

## 分类总览

- Agent 协作与角色系统：5 个插件
- 搜索检索与信息抓取：20 个插件
- 学术科研与生物医学：6 个插件
- 日记、记忆与知识管理：13 个插件
- 文件、工作区与开发辅助：10 个插件
- 系统运维与环境信息：6 个插件
- 图像、视频、音频与多媒体生成：18 个插件
- 社区、论坛与互动平台：6 个插件
- 效率、日程与生活辅助：9 个插件
- 桥接接入与基础设施：11 个插件
- 其他/待进一步确认：0 个插件

## 分类索引

### Agent 协作与角色系统

这类插件围绕多 Agent 协作、角色人格、消息路由和 Agent 创建/管理展开，适合做“AI 调 AI”或角色化协作。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| AgentAssistant | 启用 | hybridservice | 允许莱恩先生或其主AI调用家中配置的七位专属女仆Agent，进行专业领域咨询与高效协作。 |
| AgentCreator | 启用 | hybridservice | AI驱动的Agent创作与管理工坊。 |
| AgentDream | 禁用 | hybridservice | Agent梦境系统。 |
| AgentMessage | 启用 | synchronous | 允许AI通过WebSocket向用户前端发送格式化消息。 |
| MagiAgent | 启用 | hybridservice | 一个模拟EVA三贤人系统的混合插件，可以召开Magi会议讨论复杂问题，并支持异步查询。 |

### 搜索检索与信息抓取

这类插件负责站内外检索、网页/平台抓取、新闻与资源发现，是外部信息获取主力。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| AnimeFinder | 启用 | synchronous | 一个通过图片URL或本地文件路径查找对应动漫信息的插件。 |
| ArtistMatcher | 启用 | synchronous | 根据用户输入的画师名，模糊匹配SDXL模型内部的画师Tag，并返回最佳匹配结果和拟合度建议。 |
| BilibiliFetch | 启用 | synchronous | Bilibili 视频内容获取插件。 |
| CoSearch | 启用 | synchronous | 基于 OpenAI-compatible Responses API + web_search 的语义级并发深度检索插件，支持 lite/standard/deep 三种模式。 |
| DailyHot | 启用 | static | 在后台周期性地获取所有主流平台的今日热榜信息，并通过占位符 {{VCPDailyHot}} 提供。 |
| FlashDeepSearch | 启用 | synchronous | 一个强大的深度研究插件，能够围绕一个主题进行多维度、跨领域的关键词扩展，并综合搜索结果生成研究报告。 |
| GoogleSearch | 启用 | synchronous | 一个使用Google Custom Search API进行搜索的同步插件。 |
| IMAPIndex | 禁用 | static | 静态插件：定期通过 IMAP 拉取白名单匹配邮件到本地（. |
| IMAPSearch | 禁用 | synchronous | 一个同步 VCP 插件，用于在 IMAPIndex 插件生成的本地邮件存储中执行全文搜索。 |
| KarakeepSearch | 启用 | synchronous | 在 Karakeep 中全文搜索书签。 |
| NeteaseFetch | 启用 | 未声明 | 网易云音乐歌曲详情歌词热评搜索歌单获取插件 |
| NeteaseMusic | 启用 | synchronous | 网易云音乐点歌插件，支持搜索歌曲、获取最高音质播放链接和获取歌词。 |
| NewsSearch | 启用 | synchronous | 日报工作流专用的多源新闻聚合插件。 |
| SerpSearch | 启用 | synchronous | 一个使用SerpApi提供多种搜索引擎（如Bing, DuckDuckGo, Google Scholar）的插件。 |
| SVCardFinder | 启用 | synchronous | 一个用于查询《影之诗：世界超越》卡牌信息的插件。 |
| TavilySearch | 启用 | synchronous | 使用 Tavily API 进行高级网络搜索。 |
| UrlFetch | 启用 | synchronous | 通用 URL 内容获取插件。 |
| VCPEverything | 启用 | synchronous | 通过调用 Everything 命令行工具 (es. |
| VSearch | 启用 | synchronous | 一个极简、高效的语义级并发搜索引擎。 |
| XiaohongshuFetch | 启用 | synchronous | 用于抓取小红书图文/视频笔记内容的专属爬虫。 |

### 学术科研与生物医学

这类插件聚焦论文、数据库、生物医学知识和科研资料检索/阅读。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| ArxivDailyPapers | 启用 | static | Fetches daily research papers from the Arxiv API and provides them as a placeholder. |
| CrossRefDailyPapers | 启用 | static | Fetches daily research papers from the CrossRef API and provides them as a placeholder. |
| KEGGSearch | 启用 | synchronous | 一个用于查询 KEGG 数据库的 VCP 插件，提供通路、基因、化合物等多维度的数据检索与分析功能。 |
| NCBIDatasets | 启用 | synchronous | 提供对 NCBI Datasets v2 API 的封装能力，用于检索基因组、基因与物种信息等。 |
| PaperReader | 启用 | synchronous | 统一自适应阅读引擎：将超长 PDF/文档转为目标驱动的多分辨率阅读流程。 |
| PubMedSearch | 启用 | synchronous | 提供基于 NCBI E-utilities 和 PMC 的 PubMed 文献检索、详情获取、引用/相似文献分析与标识符转换等能力。 |

### 日记、记忆与知识管理

这类插件与 DailyNote、RAG、Memo、语义分组、时间线注入等记忆系统直接相关。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| AIMemo | 启用 | hybridservice | 基于聊天历史JSON的关键词滑窗回忆工具。 |
| DailyNote | 启用 | synchronous | 一个多功能日记插件，提供创建(create)和更新(update)日记的功能。 |
| DailyNoteManager | 启用 | synchronous | 一个日记管理插件，用于接收AI输出的日记内容，进行智能分析、信息融合、内容精简，并将其保存为独立的txt文件。 |
| DailyNotePanel | 启用 | service | 通过 PluginManager 在主服务上注册 DailyNotePanel 的静态页面端点和 dailynote API 端点。 |
| DailyNoteWrite | 启用 | synchronous | 接收日记数据 (maidName, dateString, contentText) 作为标准输入，将其写入对应的日记文件，并通过标准输出返回结果。 |
| LightMemo | 启用 | hybridservice | 一个允许AI主动搜索其RAG知识库（日记、知识库）的插件，作为DeepMemo（上下文搜索）的补充。 |
| ObsidianManager | 启用 | synchronous | VCP 与 Obsidian 的同步多指令管理插件。 |
| RAGDiaryPlugin | 启用 | hybridservice | 通过向量检索动态地将日记内容注入到系统提示词中，以实现高效、低消耗的长期记忆。 |
| RecentMemo | 启用 | messagePreprocessor | Standalone Cross-Agent Sync (Pure %%RecentMemo::%% Mode). |
| SemanticGroupEditor | 启用 | synchronous | 一个用于查询和更新RAG知识库中语义词元组的插件。 |
| SynapsePusher | 启用 | service | 将 VCP 工具调用日志实时推送到指定的 Synapse (Matrix) 房间。 |
| ThoughtClusterManager | 启用 | synchronous | 一个用于创建和编辑AI自身思维链文件的插件，实现元自学习能力。 |
| TimelineInjector | 启用 | static | 扫描timeline/目录的JSON文件，为每个角色生成时间线摘要，并在dailynote/下创建时间线日记本文件夹（如文枢时间线），可通过{{文枢时间线日记本}}等占位符注入。 |

### 文件、工作区与开发辅助

这类插件面向代码库、文件树、Git、项目分析和工作区注入等开发辅助场景。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| CodeSearcher | 启用 | synchronous | 一个使用Rust编写的高性能代码搜索插件，可以在指定的工作区目录中进行快速、精准的代码内容搜索。 |
| Context7 | 启用 | synchronous | 集成Context7平台，为AI提供实时的、版本特定的代码库文档和示例，支持最新的库文档查询，避免AI依赖过时的训练数据。 |
| DeepWikiVCP | 启用 | synchronous | 一个同步插件，用于抓取 deepwiki. |
| FileListGenerator | 启用 | static | 生成 'file' 目录下的文件和文件夹列表，并提供给 {{VCPFileServer}} 占位符。 |
| FileOperator | 启用 | synchronous | VCP服务器专用的一个强大的文件系统操作插件，允许AI对受限目录进行读、写、列出、移动、复制、删除等多种文件和目录操作。 |
| FileTreeGenerator | 启用 | static | 扫描指定目录的文件夹结构，并通过占位符提供给AI。 |
| GitOperator | 启用 | synchronous | 基于配置档驱动的智能 Git 管理器。 |
| ProjectAnalyst | 启用 | synchronous | 分析指定的项目文件夹，生成详细的分析报告，并支持后续查询分析结果。 |
| SkillFactory | 启用 | synchronous | 用于根据用户目标生成新的 skill 草案，并完成查重与草案保存。 |
| WorkspaceInjector | 启用 | messagePreprocessor | 通过在系统提示词中使用 {{Workspace::alias}} 占位符，将预设的本地文件夹目录树动态注入到上下文中。 |

### 系统运维与环境信息

这类插件与服务器、日志、Shell/PowerShell 执行、FRP/面板信息等系统操作直接相关。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| 1PanelInfoProvider | 禁用 | static | 从1Panel服务器获取Dashboard基础信息和操作系统信息，并通过独立的系统提示词占位符提供这些数据。 |
| FRPSInfoProvider | 启用 | static | 定期从FRPS服务器获取所有类型的代理设备信息，并整合成一个文本文件供占位符使用。 |
| LinuxLogMonitor | 启用 | asynchronous | 事件驱动的 Linux 日志监控系统。 |
| LinuxShellExecutor | 启用 | synchronous | 六层安全防护的 Linux Shell 命令执行器。 |
| PowerShellExecutor | 启用 | synchronous | 一个允许AI执行PowerShell命令并返回其输出的插件。 |
| VCPLog | 启用 | service | 通过 WebSocket 推送 VCP 调用信息，并记录日志。 |

### 图像、视频、音频与多媒体生成

这类插件主要负责图片、视频、音乐、MIDI、UI 或多媒体内容生成与处理。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| ComfyUIGen | 启用 | synchronous | 通过 ComfyUI API 使用自定义工作流生成高质量图像。 |
| DMXDoubaoGen | 启用 | synchronous | 通过 DMXAPI 使用其提供的模型（如 doubao-seedream-4-0-250828）生成和编辑图片。 |
| DoubaoGen | 启用 | synchronous | 通过火山方舟 API 使用 Doubao Seedream 3. |
| FluxGen | 启用 | synchronous | 通过 SiliconFlow API 使用 FLUX. |
| GeminiImageGen | 启用 | synchronous | 使用 Google Gemini Flash Preview 模型进行高级的图像生成和编辑。 |
| GrokVideo | 启用 | synchronous | 使用 Grok API 进行视频生成（支持文生视频、图生视频、视频续写、视频拼接）。 |
| ImageProcessor | 启用 | messagePreprocessor | 处理用户消息中的多模态数据（图像、音频、视频），调用多模态模型提取信息，并将其替换或附加到消息文本中。 |
| MIDITranslator | 启用 | hybridservice | 一个高性能的MIDI文件解析与生成插件，可以从midi-input目录读取MIDI文件并解析为DSL格式，也可以从DSL生成MIDI文件到midi-output目录。 |
| NanoBananaGen2 | 禁用 | synchronous | 使用 Vercel 接口调用 Google Gemini 3 pro Image Preview 模型进行高级的图像生成和编辑。 |
| NanoBananaGenOR | 启用 | synchronous | 使用 OpenRouter 接口调用 Google Gemini 2. |
| NovelAIGen | 禁用 | synchronous | 通过 NovelAI API 使用 NovelAI Diffusion 模型生成高质量的动漫风格图片。 |
| QwenImageGen | 启用 | synchronous | 使用 SiliconFlow API 调用通义千问模型生成和编辑图片。 |
| SeedreamGen | 启用 | synchronous | 基于火山引擎Seedream 4. |
| SunoGen | 禁用 | synchronous | 使用 Suno API 生成原创歌曲。 |
| VideoGenerator | 禁用 | asynchronous | 使用 Wan2. |
| WebUIGen | 启用 | synchronous | 调用云算力API生成高质量图像，支持多种模型和自定义参数。 |
| ZImageGen | 启用 | synchronous | 通过 Hugging Face Spaces API 使用阿里巴巴通义实验室的 Z-Image-Turbo 模型生成高质量图片。 |
| ZImageGen2 | 启用 | synchronous | 通过 Hugging Face Spaces API 使用 Z-Image-Base 模型生成高质量图片。 |

### 社区、论坛与互动平台

这类插件面向论坛、群组、互动内容和角色社区场景。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| QQGroupReader | 启用 | synchronous | 从本地 NTQQ 加密数据库中读取群聊消息，支持按群号、时间范围查询，返回结构化文本供 AI 分析整理。 |
| VCPForum | 启用 | synchronous | 用于在VCP论坛中创建新帖子和回复现有帖子的同步插件。 |
| VCPForumAssistant | 启用 | static | 定时提醒家里的agent去逛VCP论坛。 |
| VCPForumLister | 启用 | static | 一个静态插件，定期扫描论坛目录并生成一个热门帖子列表（按最后修改时间排序）。 |
| VCPForumOnline | 启用 | synchronous | 用于在VCP在线论坛中浏览、发帖、回帖、点赞、编辑、删除、管理帖子、搜索和AI心语私信的同步插件。 |
| VCPTavern | 启用 | hybridservice | 一个强大的、可视化的上下文注入插件，类似于 SillyTavern 的高级上下文编辑功能。 |

### 效率、日程与生活辅助

这类插件提供天气、日程、随机性、语言助手、计算、塔罗等日常辅助能力。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| EmojiListGenerator | 启用 | static | 扫描项目 image/ 目录下的表情包文件夹，并在插件自己的 generated_lists/ 目录下生成对应的 . |
| JapaneseHelper | 启用 | synchronous | 日语学习增强插件。 |
| Randomness | 启用 | synchronous | 一个多功能后端插件，用于生成各种可信的随机事件。 |
| ScheduleBriefing | 启用 | static | 每小时自动清理过期日程，并提取下一个日程供AI参考。 |
| ScheduleManager | 启用 | synchronous | 用于维护用户的日程，允许AI查看、添加和删除用户日程。 |
| SciCalculator | 启用 | synchronous | 执行数学表达式计算。 |
| TarotDivination | 启用 | synchronous | 一个融合天文、环境与内在起源的塔罗牌占卜插件，支持多种牌阵与起源选择。 |
| WeatherInfoNow | 启用 | static | 从 WeatherReporter 的缓存中提取并提供简短的实时天气信息。 |
| WeatherReporter | 启用 | static | 提供实时的天气信息，并将其集成到系统提示词的 {{VCPWeatherInfo}} 占位符中。 |

### 桥接接入与基础设施

这类插件承担接入、桥接、认证、截图/摄像头采集、文件/图片服务等底层连接能力。

| 插件目录 | 状态 | 类型 | 核心用途 |
|---|---|---|---|
| CapturePreprocessor | 启用 | messagePreprocessor | 一个预处理插件，用于检测和替换消息中的截图和摄像头捕获占位符，如 {{VCPScreenShot}} 和 {{VCPCameraCapture}}。 |
| ChromeBridge | 启用 | hybridservice | 混合插件：既能让AI实时观察Chrome页面内容（Service模式），又能执行浏览器控制命令并等待页面刷新（Direct模式）。 |
| FileServer | 启用 | service | 提供受密码保护的静态文件服务。 |
| ImageServer | 启用 | service | 提供受密码保护的静态图片服务。 |
| MCPO | 禁用 | synchronous | 基于 mcpo 的 MCP 工具桥接插件，能够自动发现、缓存和调用 MCP 工具，支持多种 MCP 服务器类型。 |
| MCPOMonitor | 禁用 | static | 监控 MCPO 服务器状态并提供所有可用 MCP 工具的详细信息，通过 {{MCPOServiceStatus}} 占位符集成到系统提示词中。 |
| PyCameraCapture | 启用 | synchronous | 一个使用Python和OpenCV从摄像头捕获图像的同步插件。 |
| PyScreenshot | 启用 | synchronous | 一个使用Python和Pillow从桌面截取屏幕图像的同步插件。 |
| TencentCOSBackup | 禁用 | synchronous | 一个功能完整的腾讯云对象存储（COS）插件，支持文件上传、下载、复制、移动、删除和列出操作，具有权限控制和自动压缩功能。 |
| UserAuth | 启用 | static | 每小时生成一个6位数的认证码，用于用户权限验证。 |
| VCPSkillsBridge | 启用 | synchronous | 连接 VCP 技能注册表与插件生态，提供技能列表、详情、推荐与桥接执行说明。 |

### 其他/待进一步确认

这类目录存在于插件区，但暂时不适合仅凭 manifest 与名称进行精准归类。

- 当前无插件归入该类。

## 各分类详解

### Agent 协作与角色系统

这类插件围绕多 Agent 协作、角色人格、消息路由和 Agent 创建/管理展开，适合做“AI 调 AI”或角色化协作。

#### AgentAssistant

- 状态：启用
- 展示名：女仆团协作插件
- 插件定位：允许莱恩先生或其主AI调用家中配置的七位专属女仆Agent，进行专业领域咨询与高效协作。
- 类型/协议：hybridservice / direct
- 主要价值：放在“Agent 协作与角色系统”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：AgentAssistant.js
- 规模参考：递归文件数 7
- 代表命令：AskMaidAgent
- 参考说明：README.md

#### AgentCreator

- 状态：启用
- 展示名：智能Agent创作工坊
- 插件定位：AI驱动的Agent创作与管理工坊。
- 类型/协议：hybridservice / direct
- 主要价值：放在“Agent 协作与角色系统”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：AgentCreator.js
- 规模参考：递归文件数 11
- 参考说明：README.md

#### AgentDream

- 状态：禁用
- 展示名：梦系统插件
- 插件定位：Agent梦境系统。
- 类型/协议：hybridservice / direct
- 主要价值：放在“Agent 协作与角色系统”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：AgentDream.js
- 规模参考：递归文件数 6
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### AgentMessage

- 状态：启用
- 展示名：代理消息推送插件
- 插件定位：允许AI通过WebSocket向用户前端发送格式化消息。
- 类型/协议：synchronous / stdio
- 主要价值：放在“Agent 协作与角色系统”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node AgentMessage.js
- 规模参考：递归文件数 2
- 代表命令：AgentMessage

#### MagiAgent

- 状态：启用
- 展示名：Magi三贤者会议系统
- 插件定位：一个模拟EVA三贤人系统的混合插件，可以召开Magi会议讨论复杂问题，并支持异步查询。
- 类型/协议：hybridservice / direct
- 主要价值：放在“Agent 协作与角色系统”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：MagiAgent.js
- 规模参考：递归文件数 4
- 代表命令：start_meeting、query_meeting

### 搜索检索与信息抓取

这类插件负责站内外检索、网页/平台抓取、新闻与资源发现，是外部信息获取主力。

#### AnimeFinder

- 状态：启用
- 展示名：以图找番
- 插件定位：一个通过图片URL或本地文件路径查找对应动漫信息的插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node AnimeFinder.js
- 规模参考：递归文件数 2
- 代表命令：findAnimeByUrl

#### ArtistMatcher

- 状态：启用
- 展示名：画师匹配查询器
- 插件定位：根据用户输入的画师名，模糊匹配SDXL模型内部的画师Tag，并返回最佳匹配结果和拟合度建议。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python artist_matcher.py
- 规模参考：递归文件数 4
- 代表命令：FindArtist、GetRandomArtistString

#### BilibiliFetch

- 状态：启用
- 展示名：Bilibili 内容获取插件
- 插件定位：Bilibili 视频内容获取插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python BilibiliFetch.py
- 规模参考：递归文件数 3
- 代表命令：BilibiliFetch、BilibiliSearch、GetUpVideos
- 参考说明：README.md

#### CoSearch

- 状态：启用
- 展示名：CoSearch 深度研究插件
- 插件定位：基于 OpenAI-compatible Responses API + web_search 的语义级并发深度检索插件，支持 lite/standard/deep 三种模式。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：bash run_cosearch.sh
- 规模参考：递归文件数 62
- 代表命令：CoSearch
- 参考说明：README.md

#### DailyHot

- 状态：启用
- 展示名：每日热榜
- 插件定位：在后台周期性地获取所有主流平台的今日热榜信息，并通过占位符 {{VCPDailyHot}} 提供。
- 类型/协议：static / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node daily-hot.js
- 规模参考：递归文件数 71
- 代表占位符：{{VCPDailyHot}}

#### FlashDeepSearch

- 状态：启用
- 展示名：闪电深度研究插件
- 插件定位：一个强大的深度研究插件，能够围绕一个主题进行多维度、跨领域的关键词扩展，并综合搜索结果生成研究报告。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node FlashDeepSearch.js
- 规模参考：递归文件数 3
- 代表命令：StartResearch

#### GoogleSearch

- 状态：启用
- 展示名：谷歌搜索 (API版)
- 插件定位：一个使用Google Custom Search API进行搜索的同步插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node search.js
- 规模参考：递归文件数 3
- 代表命令：GoogleSearch

#### IMAPIndex

- 状态：禁用
- 展示名：IMAP 邮件本地索引插件
- 插件定位：静态插件：定期通过 IMAP 拉取白名单匹配邮件到本地（.
- 类型/协议：static / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node IMAPIndex.js
- 规模参考：递归文件数 15
- 代表占位符：{{IMAPIndex}}
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### IMAPSearch

- 状态：禁用
- 展示名：IMAP 邮件本地搜索
- 插件定位：一个同步 VCP 插件，用于在 IMAPIndex 插件生成的本地邮件存储中执行全文搜索。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node index.js
- 规模参考：递归文件数 4
- 代表命令：IMAPSearch
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### KarakeepSearch

- 状态：启用
- 展示名：Karakeep 搜索书签
- 插件定位：在 Karakeep 中全文搜索书签。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node index.js
- 规模参考：递归文件数 4
- 代表命令：SearchBookmarks
- 参考说明：README.md

#### NeteaseFetch

- 状态：启用
- 展示名：NeteaseFetch
- 插件定位：网易云音乐歌曲详情歌词热评搜索歌单获取插件
- 类型/协议：未声明 / 未声明
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：未在 manifest 中声明入口命令
- 规模参考：递归文件数 5
- 参考说明：README.md

#### NeteaseMusic

- 状态：启用
- 展示名：网易云音乐点歌
- 插件定位：网易云音乐点歌插件，支持搜索歌曲、获取最高音质播放链接和获取歌词。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node NeteaseMusic.mjs
- 规模参考：递归文件数 2800
- 代表命令：send_captcha、captcha_login、qr_login、search_song、get_song_url 等 6 项

#### NewsSearch

- 状态：启用
- 展示名：新闻聚合搜索器
- 插件定位：日报工作流专用的多源新闻聚合插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node NewsSearch.js
- 规模参考：递归文件数 4
- 代表命令：daily_scan、search、list_boards

#### SerpSearch

- 状态：启用
- 展示名：Serp API 搜索引擎
- 插件定位：一个使用SerpApi提供多种搜索引擎（如Bing, DuckDuckGo, Google Scholar）的插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node SerpSearch.js
- 规模参考：递归文件数 9

#### SVCardFinder

- 状态：启用
- 展示名：影之诗查卡器(WB)
- 插件定位：一个用于查询《影之诗：世界超越》卡牌信息的插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python card_finder.py
- 规模参考：递归文件数 2
- 代表命令：SearchCards

#### TavilySearch

- 状态：启用
- 展示名：Tavily 搜索插件
- 插件定位：使用 Tavily API 进行高级网络搜索。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node TavilySearch.js
- 规模参考：递归文件数 2
- 代表命令：TavilySearch

#### UrlFetch

- 状态：启用
- 展示名：URL 内容获取插件
- 插件定位：通用 URL 内容获取插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node UrlFetch.js
- 规模参考：递归文件数 6
- 代表命令：UrlFetch
- 参考说明：README.md

#### VCPEverything

- 状态：启用
- 展示名：本地文件秒搜 (Everything)
- 插件定位：通过调用 Everything 命令行工具 (es.
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node local-search-controller.js
- 规模参考：递归文件数 2

#### VSearch

- 状态：启用
- 展示名：VSearch 语义并发搜索器
- 插件定位：一个极简、高效的语义级并发搜索引擎。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node VSearch.js
- 规模参考：递归文件数 3
- 代表命令：VSearch

#### XiaohongshuFetch

- 状态：启用
- 展示名：小红书爬虫
- 插件定位：用于抓取小红书图文/视频笔记内容的专属爬虫。
- 类型/协议：synchronous / stdio
- 主要价值：放在“搜索检索与信息抓取”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python XiaohongshuFetch.py
- 规模参考：递归文件数 6
- 代表命令：fetch
- 参考说明：README.md

### 学术科研与生物医学

这类插件聚焦论文、数据库、生物医学知识和科研资料检索/阅读。

#### ArxivDailyPapers

- 状态：启用
- 展示名：ArxivDailyPapers
- 插件定位：Fetches daily research papers from the Arxiv API and provides them as a placeholder.
- 类型/协议：static / stdio
- 主要价值：放在“学术科研与生物医学”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ArxivDailyPapers.js
- 规模参考：递归文件数 5
- 代表占位符：{{ArxivDailyPapersData}}

#### CrossRefDailyPapers

- 状态：启用
- 展示名：CrossRef Daily Papers
- 插件定位：Fetches daily research papers from the CrossRef API and provides them as a placeholder.
- 类型/协议：static / stdio
- 主要价值：放在“学术科研与生物医学”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node CrossRefDailyPapers.js
- 规模参考：递归文件数 5
- 代表占位符：{{CrossRefDailyPapersData}}

#### KEGGSearch

- 状态：启用
- 展示名：KEGG 数据库查询
- 插件定位：一个用于查询 KEGG 数据库的 VCP 插件，提供通路、基因、化合物等多维度的数据检索与分析功能。
- 类型/协议：synchronous / stdio
- 主要价值：放在“学术科研与生物医学”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node KEGGSearch.mjs
- 规模参考：递归文件数 2
- 代表命令：get_database_info、search_pathways、get_pathway_info、get_pathway_genes、search_genes 等 32 项

#### NCBIDatasets

- 状态：启用
- 展示名：NCBI Datasets 查询插件
- 插件定位：提供对 NCBI Datasets v2 API 的封装能力，用于检索基因组、基因与物种信息等。
- 类型/协议：synchronous / stdio
- 主要价值：放在“学术科研与生物医学”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node NCBIDatasets.mjs
- 规模参考：递归文件数 3
- 代表命令：search_genomes、get_gene_info、get_genome_info、get_organism_info、get_assembly_info 等 22 项

#### PaperReader

- 状态：启用
- 展示名：超文本递归阅读器
- 插件定位：统一自适应阅读引擎：将超长 PDF/文档转为目标驱动的多分辨率阅读流程。
- 类型/协议：synchronous / stdio
- 主要价值：放在“学术科研与生物医学”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node PaperReader.js
- 规模参考：递归文件数 14
- 代表命令：IngestPDF、Read、ReadSkeleton、ReadDeep、Query
- 参考说明：README.md

#### PubMedSearch

- 状态：启用
- 展示名：PubMed 文献检索插件
- 插件定位：提供基于 NCBI E-utilities 和 PMC 的 PubMed 文献检索、详情获取、引用/相似文献分析与标识符转换等能力。
- 类型/协议：synchronous / stdio
- 主要价值：放在“学术科研与生物医学”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node PubMedSearch.mjs
- 规模参考：递归文件数 5
- 代表命令：search_articles、advanced_search、search_by_author、search_by_journal、search_by_mesh_terms 等 16 项

### 日记、记忆与知识管理

这类插件与 DailyNote、RAG、Memo、语义分组、时间线注入等记忆系统直接相关。

#### AIMemo

- 状态：启用
- 展示名：AIMemo 历史回忆检索
- 插件定位：基于聊天历史JSON的关键词滑窗回忆工具。
- 类型/协议：hybridservice / direct
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：index.js
- 规模参考：递归文件数 4
- 代表命令：SearchHistory

#### DailyNote

- 状态：启用
- 展示名：日记系统 (创建与更新)
- 插件定位：一个多功能日记插件，提供创建(create)和更新(update)日记的功能。
- 类型/协议：synchronous / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node dailynote.js
- 规模参考：递归文件数 3
- 代表命令：create、update

#### DailyNoteManager

- 状态：启用
- 展示名：日记整理器
- 插件定位：一个日记管理插件，用于接收AI输出的日记内容，进行智能分析、信息融合、内容精简，并将其保存为独立的txt文件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node daily-note-manager.js
- 规模参考：递归文件数 4
- 代表命令：DailyNoteManager
- 参考说明：README.md

#### DailyNotePanel

- 状态：启用
- 展示名：DailyNotePanel 路由胶水插件
- 插件定位：通过 PluginManager 在主服务上注册 DailyNotePanel 的静态页面端点和 dailynote API 端点。
- 类型/协议：service / direct
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：index.js
- 规模参考：递归文件数 8

#### DailyNoteWrite

- 状态：启用
- 展示名：日记写入器 (同步)
- 插件定位：接收日记数据 (maidName, dateString, contentText) 作为标准输入，将其写入对应的日记文件，并通过标准输出返回结果。
- 类型/协议：synchronous / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node daily-note-write.js
- 规模参考：递归文件数 5
- 参考说明：README.md

#### LightMemo

- 状态：启用
- 展示名：轻量回忆插件 (LightMemo)
- 插件定位：一个允许AI主动搜索其RAG知识库（日记、知识库）的插件，作为DeepMemo（上下文搜索）的补充。
- 类型/协议：hybridservice / direct
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：LightMemo.js
- 规模参考：递归文件数 4
- 代表命令：SearchRAG

#### ObsidianManager

- 状态：启用
- 展示名：Obsidian 混合中枢大管家
- 插件定位：VCP 与 Obsidian 的同步多指令管理插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ObsidianManager.js
- 规模参考：递归文件数 5
- 参考说明：README.md

#### RAGDiaryPlugin

- 状态：启用
- 展示名：RAG日记本检索器
- 插件定位：通过向量检索动态地将日记内容注入到系统提示词中，以实现高效、低消耗的长期记忆。
- 类型/协议：hybridservice / direct
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：RAGDiaryPlugin.js
- 规模参考：递归文件数 19
- 参考说明：README.md

#### RecentMemo

- 状态：启用
- 展示名：RecentMemo Cross-Agent Sync
- 插件定位：Standalone Cross-Agent Sync (Pure %%RecentMemo::%% Mode).
- 类型/协议：messagePreprocessor / direct
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：RecentMemo.js
- 规模参考：递归文件数 8
- 代表占位符：%%RecentMemo::AgentName::Rounds::Mode%%
- 参考说明：README.md

#### SemanticGroupEditor

- 状态：启用
- 展示名：语义组编辑器
- 插件定位：一个用于查询和更新RAG知识库中语义词元组的插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node SemanticGroupEditor.js
- 规模参考：递归文件数 2
- 代表命令：QueryGroups、UpdateGroups

#### SynapsePusher

- 状态：启用
- 展示名：VCP 日志 Synapse 推送器
- 插件定位：将 VCP 工具调用日志实时推送到指定的 Synapse (Matrix) 房间。
- 类型/协议：service / direct
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：SynapsePusher.js
- 规模参考：递归文件数 3

#### ThoughtClusterManager

- 状态：启用
- 展示名：思维簇管理器
- 插件定位：一个用于创建和编辑AI自身思维链文件的插件，实现元自学习能力。
- 类型/协议：synchronous / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ThoughtClusterManager.js
- 规模参考：递归文件数 2
- 代表命令：CreateClusterFile、EditClusterFile

#### TimelineInjector

- 状态：启用
- 展示名：时间线注入器
- 插件定位：扫描timeline/目录的JSON文件，为每个角色生成时间线摘要，并在dailynote/下创建时间线日记本文件夹（如文枢时间线），可通过{{文枢时间线日记本}}等占位符注入。
- 类型/协议：static / stdio
- 主要价值：放在“日记、记忆与知识管理”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node timeline-injector.js
- 规模参考：递归文件数 5
- 参考说明：README.md

### 文件、工作区与开发辅助

这类插件面向代码库、文件树、Git、项目分析和工作区注入等开发辅助场景。

#### CodeSearcher

- 状态：启用
- 展示名：代码搜索器 (Rust)
- 插件定位：一个使用Rust编写的高性能代码搜索插件，可以在指定的工作区目录中进行快速、精准的代码内容搜索。
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：CodeSearcher.exe
- 规模参考：递归文件数 5
- 代表命令：SearchCode

#### Context7

- 状态：启用
- 展示名：Context7文档查询器
- 插件定位：集成Context7平台，为AI提供实时的、版本特定的代码库文档和示例，支持最新的库文档查询，避免AI依赖过时的训练数据。
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node Context7.js
- 规模参考：递归文件数 7
- 代表命令：GetLibraryDocs、SearchLibraries
- 参考说明：README.md

#### DeepWikiVCP

- 状态：启用
- 展示名：DeepWiki 抓取器
- 插件定位：一个同步插件，用于抓取 deepwiki.
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node Plugin/DeepWikiVCP/deepwiki_vcp.js
- 规模参考：递归文件数 3493
- 代表命令：deepwiki_fetch

#### FileListGenerator

- 状态：启用
- 展示名：文件列表生成器
- 插件定位：生成 'file' 目录下的文件和文件夹列表，并提供给 {{VCPFileServer}} 占位符。
- 类型/协议：static / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node file-list-generator.js
- 规模参考：递归文件数 2
- 代表占位符：{{VCPFileServer}}

#### FileOperator

- 状态：启用
- 展示名：VCP服务器文件操作器
- 插件定位：VCP服务器专用的一个强大的文件系统操作插件，允许AI对受限目录进行读、写、列出、移动、复制、删除等多种文件和目录操作。
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node FileOperator.js
- 规模参考：递归文件数 4

#### FileTreeGenerator

- 状态：启用
- 展示名：文件树生成器
- 插件定位：扫描指定目录的文件夹结构，并通过占位符提供给AI。
- 类型/协议：static / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node FileTreeGenerator.js
- 规模参考：递归文件数 5
- 代表占位符：{{VCPFilestructureInfo}}
- 参考说明：README.md

#### GitOperator

- 状态：启用
- 展示名：Git 仓库管理器
- 插件定位：基于配置档驱动的智能 Git 管理器。
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node GitOperator.js
- 规模参考：递归文件数 9
- 参考说明：README.md

#### ProjectAnalyst

- 状态：启用
- 展示名：项目分析器
- 插件定位：分析指定的项目文件夹，生成详细的分析报告，并支持后续查询分析结果。
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ProjectAnalyst.js
- 规模参考：递归文件数 6
- 代表命令：AnalyzeProject、QueryAnalysis、QueryProgress

#### SkillFactory

- 状态：启用
- 展示名：Skill Factory
- 插件定位：用于根据用户目标生成新的 skill 草案，并完成查重与草案保存。
- 类型/协议：synchronous / stdio
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node SkillFactory.js
- 规模参考：递归文件数 2
- 代表命令：SkillFactory

#### WorkspaceInjector

- 状态：启用
- 展示名：工作区动态注入
- 插件定位：通过在系统提示词中使用 {{Workspace::alias}} 占位符，将预设的本地文件夹目录树动态注入到上下文中。
- 类型/协议：messagePreprocessor / direct
- 主要价值：放在“文件、工作区与开发辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：injector.js
- 规模参考：递归文件数 3
- 参考说明：README.md

### 系统运维与环境信息

这类插件与服务器、日志、Shell/PowerShell 执行、FRP/面板信息等系统操作直接相关。

#### 1PanelInfoProvider

- 状态：禁用
- 展示名：1Panel 信息提供器
- 插件定位：从1Panel服务器获取Dashboard基础信息和操作系统信息，并通过独立的系统提示词占位符提供这些数据。
- 类型/协议：static / stdio
- 主要价值：放在“系统运维与环境信息”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node 1PanelInfoProvider.js
- 规模参考：递归文件数 7
- 代表占位符：{{1PanelDashboard}}、{{1PanelOsInfo}}
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### FRPSInfoProvider

- 状态：启用
- 展示名：FRPS 设备信息提供器
- 插件定位：定期从FRPS服务器获取所有类型的代理设备信息，并整合成一个文本文件供占位符使用。
- 类型/协议：static / stdio
- 主要价值：放在“系统运维与环境信息”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node FRPSInfoProvider.js
- 规模参考：递归文件数 5
- 代表占位符：{{FRPSAllProxyInfo}}

#### LinuxLogMonitor

- 状态：启用
- 展示名：Linux 日志监控器
- 插件定位：事件驱动的 Linux 日志监控系统。
- 类型/协议：asynchronous / stdio
- 主要价值：放在“系统运维与环境信息”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node LinuxLogMonitor.js
- 规模参考：递归文件数 11
- 代表命令：start、stop、status、list_rules、add_rule 等 8 项
- 参考说明：README.md

#### LinuxShellExecutor

- 状态：启用
- 展示名：Linux Shell 安全执行器
- 插件定位：六层安全防护的 Linux Shell 命令执行器。
- 类型/协议：synchronous / stdio
- 主要价值：放在“系统运维与环境信息”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node LinuxShellExecutor.js
- 规模参考：递归文件数 12
- 代表命令：LinuxShellExecutor
- 参考说明：README.md

#### PowerShellExecutor

- 状态：启用
- 展示名：PowerShell命令执行器
- 插件定位：一个允许AI执行PowerShell命令并返回其输出的插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“系统运维与环境信息”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node PowerShellExecutor.js
- 规模参考：递归文件数 3
- 代表命令：PowerShellExecutor

#### VCPLog

- 状态：启用
- 展示名：VCP 日志推送插件
- 插件定位：通过 WebSocket 推送 VCP 调用信息，并记录日志。
- 类型/协议：service / direct
- 主要价值：放在“系统运维与环境信息”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：VCPLog.js
- 规模参考：递归文件数 6
- 参考说明：README.md

### 图像、视频、音频与多媒体生成

这类插件主要负责图片、视频、音乐、MIDI、UI 或多媒体内容生成与处理。

#### ComfyUIGen

- 状态：启用
- 展示名：ComfyUI 图像生成器
- 插件定位：通过 ComfyUI API 使用自定义工作流生成高质量图像。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ComfyUIGen.js
- 规模参考：递归文件数 18
- 代表命令：ComfyUIGenerateImage
- 参考说明：README.md

#### DMXDoubaoGen

- 状态：启用
- 展示名：Doubao 风格图片生成器
- 插件定位：通过 DMXAPI 使用其提供的模型（如 doubao-seedream-4-0-250828）生成和编辑图片。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node DoubaoGen.js
- 规模参考：递归文件数 4
- 代表命令：DoubaoGenerateImage、DoubaoEditImage、DoubaoComposeImage

#### DoubaoGen

- 状态：启用
- 展示名：Doubao 风格图片生成器
- 插件定位：通过火山方舟 API 使用 Doubao Seedream 3.
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node DoubaoGen.js
- 规模参考：递归文件数 7
- 代表命令：DoubaoGenerateImage
- 参考说明：README.md

#### FluxGen

- 状态：启用
- 展示名：Flux 风格图片生成器
- 插件定位：通过 SiliconFlow API 使用 FLUX.
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node FluxGen.mjs
- 规模参考：递归文件数 7
- 代表命令：FluxGenerateImage

#### GeminiImageGen

- 状态：启用
- 展示名：Gemini 图像生成与编辑
- 插件定位：使用 Google Gemini Flash Preview 模型进行高级的图像生成和编辑。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node GeminiImageGen.mjs
- 规模参考：递归文件数 4
- 代表命令：GeminiGenerateImage、GeminiEditImage

#### GrokVideo

- 状态：启用
- 展示名：Grok 视频生成器
- 插件定位：使用 Grok API 进行视频生成（支持文生视频、图生视频、视频续写、视频拼接）。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python video_handler.py
- 规模参考：递归文件数 5
- 参考说明：README.md

#### ImageProcessor

- 状态：启用
- 展示名：多模态数据提取器
- 插件定位：处理用户消息中的多模态数据（图像、音频、视频），调用多模态模型提取信息，并将其替换或附加到消息文本中。
- 类型/协议：messagePreprocessor / direct
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：image-processor.js
- 规模参考：递归文件数 7
- 参考说明：README.md

#### MIDITranslator

- 状态：启用
- 展示名：MIDI翻译器
- 插件定位：一个高性能的MIDI文件解析与生成插件，可以从midi-input目录读取MIDI文件并解析为DSL格式，也可以从DSL生成MIDI文件到midi-output目录。
- 类型/协议：hybridservice / direct
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：MIDITranslator.js
- 规模参考：递归文件数 7512
- 代表命令：list_midi_files、parse_midi、generate_midi、validate_dsl、validate_dsl_with_details 等 7 项

#### NanoBananaGen2

- 状态：禁用
- 展示名：Gemini 3 NanoBanana 图像生成 (官方)
- 插件定位：使用 Vercel 接口调用 Google Gemini 3 pro Image Preview 模型进行高级的图像生成和编辑。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node NanoBananaGen.mjs
- 规模参考：递归文件数 2
- 代表命令：NanoBananaGenerateImage、NanoBananaEditImage、NanoBananaComposeImage
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### NanoBananaGenOR

- 状态：启用
- 展示名：Gemini 2.5 NanoBanana 图像生成 (OpenRouter)
- 插件定位：使用 OpenRouter 接口调用 Google Gemini 2.
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node NanoBananaGenOR.mjs
- 规模参考：递归文件数 3
- 代表命令：NanoBananaGenerateImage、NanoBananaEditImage、NanoBananaComposeImage

#### NovelAIGen

- 状态：禁用
- 展示名：NovelAI 图片生成器
- 插件定位：通过 NovelAI API 使用 NovelAI Diffusion 模型生成高质量的动漫风格图片。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node NovelAIGen.js
- 规模参考：递归文件数 5
- 代表命令：NovelAIGenerateImage
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### QwenImageGen

- 状态：启用
- 展示名：通义千问图片生成
- 插件定位：使用 SiliconFlow API 调用通义千问模型生成和编辑图片。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node QwenImageGen.js
- 规模参考：递归文件数 2
- 代表命令：GenerateImage、EditImage

#### SeedreamGen

- 状态：启用
- 展示名：火山引擎Seedream 4.0图像生成器
- 插件定位：基于火山引擎Seedream 4.
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node SeedreamGen.mjs
- 规模参考：递归文件数 5
- 代表命令：SeedreamGenerateImage
- 参考说明：README.md

#### SunoGen

- 状态：禁用
- 展示名：Suno AI 音乐生成
- 插件定位：使用 Suno API 生成原创歌曲。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node SunoGen.mjs
- 规模参考：递归文件数 7
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### VideoGenerator

- 状态：禁用
- 展示名：视频生成器 (Wan2.1)
- 插件定位：使用 Wan2.
- 类型/协议：asynchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python video_handler.py
- 规模参考：递归文件数 5
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### WebUIGen

- 状态：启用
- 展示名：WebUI云算力生图
- 插件定位：调用云算力API生成高质量图像，支持多种模型和自定义参数。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node WebUIGen.mjs
- 规模参考：递归文件数 4
- 代表命令：WebUIGenerate

#### ZImageGen

- 状态：启用
- 展示名：Z-Image 文生图（阿里通义）
- 插件定位：通过 Hugging Face Spaces API 使用阿里巴巴通义实验室的 Z-Image-Turbo 模型生成高质量图片。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ZImageGen.mjs
- 规模参考：递归文件数 3
- 代表命令：ZImageGenerate

#### ZImageGen2

- 状态：启用
- 展示名：Z-Image Base 文生图
- 插件定位：通过 Hugging Face Spaces API 使用 Z-Image-Base 模型生成高质量图片。
- 类型/协议：synchronous / stdio
- 主要价值：放在“图像、视频、音频与多媒体生成”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ZImageGen.mjs
- 规模参考：递归文件数 3
- 代表命令：ZImageGenerate

### 社区、论坛与互动平台

这类插件面向论坛、群组、互动内容和角色社区场景。

#### QQGroupReader

- 状态：启用
- 展示名：QQ群聊消息读取器
- 插件定位：从本地 NTQQ 加密数据库中读取群聊消息，支持按群号、时间范围查询，返回结构化文本供 AI 分析整理。
- 类型/协议：synchronous / stdio
- 主要价值：放在“社区、论坛与互动平台”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node QQGroupReader.js
- 规模参考：递归文件数 4
- 代表命令：ReadGroupMessages、ListGroups、ReadWatchedMessages、GetNewMessages

#### VCPForum

- 状态：启用
- 展示名：VCP论坛插件
- 插件定位：用于在VCP论坛中创建新帖子和回复现有帖子的同步插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“社区、论坛与互动平台”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node VCPForum.js
- 规模参考：递归文件数 2
- 代表命令：CreatePost、ReplyPost、ReadPost、ListAllPosts

#### VCPForumAssistant

- 状态：启用
- 展示名：VCP论坛小助手
- 插件定位：定时提醒家里的agent去逛VCP论坛。
- 类型/协议：static / stdio
- 主要价值：放在“社区、论坛与互动平台”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node vcp-forum-assistant.js
- 规模参考：递归文件数 2

#### VCPForumLister

- 状态：启用
- 展示名：VCP论坛帖子列表生成器
- 插件定位：一个静态插件，定期扫描论坛目录并生成一个热门帖子列表（按最后修改时间排序）。
- 类型/协议：static / stdio
- 主要价值：放在“社区、论坛与互动平台”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node VCPForumLister.js
- 规模参考：递归文件数 2
- 代表占位符：{{VCPForumLister}}

#### VCPForumOnline

- 状态：启用
- 展示名：VCP在线论坛插件
- 插件定位：用于在VCP在线论坛中浏览、发帖、回帖、点赞、编辑、删除、管理帖子、搜索和AI心语私信的同步插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“社区、论坛与互动平台”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node VCPForumOnline.js
- 规模参考：递归文件数 5
- 代表命令：ListPosts、ReadPost、CreatePost、ReplyPost、LikePost 等 13 项
- 参考说明：README.md

#### VCPTavern

- 状态：启用
- 展示名：VCP 上下文注入器
- 插件定位：一个强大的、可视化的上下文注入插件，类似于 SillyTavern 的高级上下文编辑功能。
- 类型/协议：hybridservice / direct
- 主要价值：放在“社区、论坛与互动平台”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：VCPTavern.js
- 规模参考：递归文件数 6
- 参考说明：README.md

### 效率、日程与生活辅助

这类插件提供天气、日程、随机性、语言助手、计算、塔罗等日常辅助能力。

#### EmojiListGenerator

- 状态：启用
- 展示名：表情包列表文件生成器
- 插件定位：扫描项目 image/ 目录下的表情包文件夹，并在插件自己的 generated_lists/ 目录下生成对应的 .
- 类型/协议：static / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node emoji-list-generator.js
- 规模参考：递归文件数 14
- 参考说明：README.md

#### JapaneseHelper

- 状态：启用
- 展示名：日语学习助手
- 插件定位：日语学习增强插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python JapaneseHelper.py
- 规模参考：递归文件数 10
- 代表命令：JapaneseHelperCore、JapaneseHelperLookup、JapaneseHelperQuizBatch、JapaneseHelperStudySession、JapaneseHelperDataAndHealth
- 参考说明：README.md

#### Randomness

- 状态：启用
- 展示名：随机事件生成器
- 插件定位：一个多功能后端插件，用于生成各种可信的随机事件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python main.py
- 规模参考：递归文件数 13
- 代表命令：createDeck、createCustomDeck、drawFromDeck、resetDeck、destroyDeck 等 12 项
- 参考说明：README.md

#### ScheduleBriefing

- 状态：启用
- 展示名：用户日程简报
- 插件定位：每小时自动清理过期日程，并提取下一个日程供AI参考。
- 类型/协议：static / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ScheduleBriefing.js
- 规模参考：递归文件数 2
- 代表占位符：VCPNextSchedule

#### ScheduleManager

- 状态：启用
- 展示名：用户日程管理器
- 插件定位：用于维护用户的日程，允许AI查看、添加和删除用户日程。
- 类型/协议：synchronous / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node ScheduleManager.js
- 规模参考：递归文件数 2
- 代表命令：AddSchedule、DeleteSchedule、ListSchedules

#### SciCalculator

- 状态：启用
- 展示名：科学计算器
- 插件定位：执行数学表达式计算。
- 类型/协议：synchronous / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python calculator.py
- 规模参考：递归文件数 4
- 代表命令：SciCalculatorRequest
- 参考说明：README.md

#### TarotDivination

- 状态：启用
- 展示名：塔罗占卜
- 插件定位：一个融合天文、环境与内在起源的塔罗牌占卜插件，支持多种牌阵与起源选择。
- 类型/协议：synchronous / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node tarot_divination.js
- 规模参考：递归文件数 5
- 代表命令：draw_single_card、draw_three_card_spread、draw_celtic_cross、get_celestial_data

#### WeatherInfoNow

- 状态：启用
- 展示名：实时天气简报
- 插件定位：从 WeatherReporter 的缓存中提取并提供简短的实时天气信息。
- 类型/协议：static / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node weather-info-now.js
- 规模参考：递归文件数 2
- 代表占位符：{{VCPWeatherInfoNow}}

#### WeatherReporter

- 状态：启用
- 展示名：天气预报员
- 插件定位：提供实时的天气信息，并将其集成到系统提示词的 {{VCPWeatherInfo}} 占位符中。
- 类型/协议：static / stdio
- 主要价值：放在“效率、日程与生活辅助”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node weather-reporter.js
- 规模参考：递归文件数 7
- 代表占位符：{{VCPWeatherInfo}}
- 参考说明：README.md

### 桥接接入与基础设施

这类插件承担接入、桥接、认证、截图/摄像头采集、文件/图片服务等底层连接能力。

#### CapturePreprocessor

- 状态：启用
- 展示名：捕获预处理器
- 插件定位：一个预处理插件，用于检测和替换消息中的截图和摄像头捕获占位符，如 {{VCPScreenShot}} 和 {{VCPCameraCapture}}。
- 类型/协议：messagePreprocessor / direct
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：CapturePreprocessor.js
- 规模参考：递归文件数 4
- 参考说明：README.md

#### ChromeBridge

- 状态：启用
- 展示名：Chrome 浏览器桥接器
- 插件定位：混合插件：既能让AI实时观察Chrome页面内容（Service模式），又能执行浏览器控制命令并等待页面刷新（Direct模式）。
- 类型/协议：hybridservice / direct
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：ChromeBridge.js
- 规模参考：递归文件数 5
- 代表占位符：{{VCPChromePageInfo}}
- 参考说明：README.md

#### FileServer

- 状态：启用
- 展示名：文件服务
- 插件定位：提供受密码保护的静态文件服务。
- 类型/协议：service / direct
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：file-server.js
- 规模参考：递归文件数 2

#### ImageServer

- 状态：启用
- 展示名：图床服务
- 插件定位：提供受密码保护的静态图片服务。
- 类型/协议：service / direct
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：image-server.js
- 规模参考：递归文件数 3
- 参考说明：README.md

#### MCPO

- 状态：禁用
- 展示名：MCPO 工具桥接器
- 插件定位：基于 mcpo 的 MCP 工具桥接插件，能够自动发现、缓存和调用 MCP 工具，支持多种 MCP 服务器类型。
- 类型/协议：synchronous / stdio
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python mcpo_plugin.py
- 规模参考：递归文件数 6
- 代表命令：list_tools、call_tool、get_tool_info、manage_server、discover_tools 等 7 项
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### MCPOMonitor

- 状态：禁用
- 展示名：MCPO 服务状态监控器
- 插件定位：监控 MCPO 服务器状态并提供所有可用 MCP 工具的详细信息，通过 {{MCPOServiceStatus}} 占位符集成到系统提示词中。
- 类型/协议：static / stdio
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node mcpo_monitor.js
- 规模参考：递归文件数 4
- 代表占位符：{{MCPOServiceStatus}}
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### PyCameraCapture

- 状态：启用
- 展示名：Python摄像头插件
- 插件定位：一个使用Python和OpenCV从摄像头捕获图像的同步插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python capture.py
- 规模参考：递归文件数 4
- 代表命令：CaptureImage
- 参考说明：README.md

#### PyScreenshot

- 状态：启用
- 展示名：Python截图插件
- 插件定位：一个使用Python和Pillow从桌面截取屏幕图像的同步插件。
- 类型/协议：synchronous / stdio
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python screenshot.py
- 规模参考：递归文件数 4
- 代表命令：TakeScreenshot
- 参考说明：README.md

#### TencentCOSBackup

- 状态：禁用
- 展示名：腾讯云COS备份插件
- 插件定位：一个功能完整的腾讯云对象存储（COS）插件，支持文件上传、下载、复制、移动、删除和列出操作，具有权限控制和自动压缩功能。
- 类型/协议：synchronous / stdio
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：python cos_handler.py
- 规模参考：递归文件数 5
- 代表命令：get_permissions、upload_file、download_file、copy_file、move_file 等 10 项
- 参考说明：README.md
- 备注：该插件目前以 `.block` 形式保留，通常表示功能保留但默认不加载。

#### UserAuth

- 状态：启用
- 展示名：用户认证插件
- 插件定位：每小时生成一个6位数的认证码，用于用户权限验证。
- 类型/协议：static / 未声明
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node auth.js
- 规模参考：递归文件数 4
- 代表占位符：{{USER_AUTH_CODE}}

#### VCPSkillsBridge

- 状态：启用
- 展示名：VCP Skills Bridge
- 插件定位：连接 VCP 技能注册表与插件生态，提供技能列表、详情、推荐与桥接执行说明。
- 类型/协议：synchronous / stdio
- 主要价值：放在“桥接接入与基础设施”这一类下，说明它主要服务于这一功能域，而不是通用杂项。
- 入口信息：node VCPSkillsBridge.js
- 规模参考：递归文件数 3
- 代表命令：VCPSkillsBridge
- 参考说明：README.md

### 其他/待进一步确认

这类目录存在于插件区，但暂时不适合仅凭 manifest 与名称进行精准归类。

- 当前无插件归入该类。

## 推荐阅读路径

- 想找外部信息入口：先看“搜索检索与信息抓取”。
- 想找记忆、日记、RAG：先看“日记、记忆与知识管理”。
- 想找文生图/视频/音乐：先看“图像、视频、音频与多媒体生成”。
- 想找服务器执行、日志、面板：先看“系统运维与环境信息”。
- 想找代码、文件、工作区能力：先看“文件、工作区与开发辅助”。
- 想找论坛、群组、社交内容：先看“社区、论坛与互动平台”。
