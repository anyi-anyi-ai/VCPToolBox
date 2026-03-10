# 插件目录插件说明书

- 生成时间：2026-03-09
- 扫描范围：`Plugin/` 下全部插件目录（递归统计文件）
- 信息来源：各插件目录的 `plugin-manifest.json` / `plugin-manifest.json.block`、README、入口文件名与递归文件结构
- 说明口径：优先采用 manifest 中的正式描述；缺失时回退到 README 首段或目录结构推断

## 总览

- 插件目录总数：**104**
- 启用插件：**93**
- 禁用插件：**11**
- 未发现 manifest 的目录：**0**

## 快速索引

| 目录 | 状态 | 类型 | 运行时 | 核心用途 |
|---|---|---|---|---|
| 1PanelInfoProvider | 禁用 | static | Node.js | 从1Panel服务器获取Dashboard基础信息和操作系统信息，并通过独立的系统提示词占位符提供这些数据。 |
| AgentAssistant | 启用 | hybridservice | Node.js | 允许莱恩先生或其主AI调用家中配置的七位专属女仆Agent，进行专业领域咨询与高效协作。 |
| AgentCreator | 启用 | hybridservice | Node.js | AI驱动的Agent创作与管理工坊。 |
| AgentDream | 禁用 | hybridservice | Node.js | Agent梦境系统。 |
| AgentMessage | 启用 | synchronous | Node.js | 允许AI通过WebSocket向用户前端发送格式化消息。 |
| AIMemo | 启用 | hybridservice | Node.js | 基于聊天历史JSON的关键词滑窗回忆工具。 |
| AnimeFinder | 启用 | synchronous | Node.js | 一个通过图片URL或本地文件路径查找对应动漫信息的插件。 |
| ArtistMatcher | 启用 | synchronous | Python | 根据用户输入的画师名，模糊匹配SDXL模型内部的画师Tag，并返回最佳匹配结果和拟合度建议。 |
| ArxivDailyPapers | 启用 | static | Node.js | Fetches daily research papers from the Arxiv API and provides them as a placeholder. |
| BilibiliFetch | 启用 | synchronous | Python | Bilibili 视频内容获取插件。 |
| CapturePreprocessor | 启用 | messagePreprocessor | Node.js | 一个预处理插件，用于检测和替换消息中的截图和摄像头捕获占位符，如 {{VCPScreenShot}} 和 {{VCPCameraCapture}}。 |
| ChromeBridge | 启用 | hybridservice | Node.js | 混合插件：既能让AI实时观察Chrome页面内容（Service模式），又能执行浏览器控制命令并等待页面刷新（Direct模式）。 |
| CodeSearcher | 启用 | synchronous | Rust + 原生可执行文件 | 一个使用Rust编写的高性能代码搜索插件，可以在指定的工作区目录中进行快速、精准的代码内容搜索。 |
| ComfyUIGen | 启用 | synchronous | Node.js + Python | 通过 ComfyUI API 使用自定义工作流生成高质量图像。 |
| Context7 | 启用 | synchronous | Node.js | 集成Context7平台，为AI提供实时的、版本特定的代码库文档和示例，支持最新的库文档查询，避免AI依赖过时的训练数据。 |
| CoSearch | 启用 | synchronous | 未明显识别 | 基于 OpenAI-compatible Responses API + web_search 的语义级并发深度检索插件，支持 lite/standard/deep 三种模式。 |
| CrossRefDailyPapers | 启用 | static | Node.js | Fetches daily research papers from the CrossRef API and provides them as a placeholder. |
| DailyHot | 启用 | static | Node.js | 在后台周期性地获取所有主流平台的今日热榜信息，并通过占位符 {{VCPDailyHot}} 提供。 |
| DailyNote | 启用 | synchronous | Node.js | 一个多功能日记插件，提供创建(create)和更新(update)日记的功能。 |
| DailyNoteManager | 启用 | synchronous | Node.js | 一个日记管理插件，用于接收AI输出的日记内容，进行智能分析、信息融合、内容精简，并将其保存为独立的txt文件。 |
| DailyNotePanel | 启用 | service | Node.js | 通过 PluginManager 在主服务上注册 DailyNotePanel 的静态页面端点和 dailynote API 端点。 |
| DailyNoteWrite | 启用 | synchronous | Node.js | 接收日记数据 (maidName, dateString, contentText) 作为标准输入，将其写入对应的日记文件，并通过标准输出返回结果。 |
| DeepWikiVCP | 启用 | synchronous | Node.js | 一个同步插件，用于抓取 deepwiki. |
| DMXDoubaoGen | 启用 | synchronous | Node.js | 通过 DMXAPI 使用其提供的模型（如 doubao-seedream-4-0-250828）生成和编辑图片。 |
| DoubaoGen | 启用 | synchronous | Node.js | 通过火山方舟 API 使用 Doubao Seedream 3. |
| EmojiListGenerator | 启用 | static | Node.js | 扫描项目 image/ 目录下的表情包文件夹，并在插件自己的 generated_lists/ 目录下生成对应的 . |
| FileListGenerator | 启用 | static | Node.js | 生成 'file' 目录下的文件和文件夹列表，并提供给 {{VCPFileServer}} 占位符。 |
| FileOperator | 启用 | synchronous | Node.js | VCP服务器专用的一个强大的文件系统操作插件，允许AI对受限目录进行读、写、列出、移动、复制、删除等多种文件和目录操作。 |
| FileServer | 启用 | service | Node.js | 提供受密码保护的静态文件服务。 |
| FileTreeGenerator | 启用 | static | Node.js | 扫描指定目录的文件夹结构，并通过占位符提供给AI。 |
| FlashDeepSearch | 启用 | synchronous | Node.js | 一个强大的深度研究插件，能够围绕一个主题进行多维度、跨领域的关键词扩展，并综合搜索结果生成研究报告。 |
| FluxGen | 启用 | synchronous | Node.js | 通过 SiliconFlow API 使用 FLUX. |
| FRPSInfoProvider | 启用 | static | Node.js | 定期从FRPS服务器获取所有类型的代理设备信息，并整合成一个文本文件供占位符使用。 |
| GeminiImageGen | 启用 | synchronous | Node.js | 使用 Google Gemini Flash Preview 模型进行高级的图像生成和编辑。 |
| GitOperator | 启用 | synchronous | Node.js | 基于配置档驱动的智能 Git 管理器。 |
| GoogleSearch | 启用 | synchronous | Node.js | 一个使用Google Custom Search API进行搜索的同步插件。 |
| GrokVideo | 启用 | synchronous | Python | 使用 Grok API 进行视频生成（支持文生视频、图生视频、视频续写、视频拼接）。 |
| ImageProcessor | 启用 | messagePreprocessor | Node.js | 处理用户消息中的多模态数据（图像、音频、视频），调用多模态模型提取信息，并将其替换或附加到消息文本中。 |
| ImageServer | 启用 | service | Node.js | 提供受密码保护的静态图片服务。 |
| IMAPIndex | 禁用 | static | Node.js | 静态插件：定期通过 IMAP 拉取白名单匹配邮件到本地（. |
| IMAPSearch | 禁用 | synchronous | Node.js | 一个同步 VCP 插件，用于在 IMAPIndex 插件生成的本地邮件存储中执行全文搜索。 |
| JapaneseHelper | 启用 | synchronous | Python | 日语学习增强插件。 |
| KarakeepSearch | 启用 | synchronous | Node.js | 在 Karakeep 中全文搜索书签。 |
| KEGGSearch | 启用 | synchronous | Node.js | 一个用于查询 KEGG 数据库的 VCP 插件，提供通路、基因、化合物等多维度的数据检索与分析功能。 |
| LightMemo | 启用 | hybridservice | Node.js | 一个允许AI主动搜索其RAG知识库（日记、知识库）的插件，作为DeepMemo（上下文搜索）的补充。 |
| LinuxLogMonitor | 启用 | asynchronous | Node.js | 事件驱动的 Linux 日志监控系统。 |
| LinuxShellExecutor | 启用 | synchronous | Node.js | 六层安全防护的 Linux Shell 命令执行器。 |
| MagiAgent | 启用 | hybridservice | Node.js | 一个模拟EVA三贤人系统的混合插件，可以召开Magi会议讨论复杂问题，并支持异步查询。 |
| MCPO | 禁用 | synchronous | Python | 基于 mcpo 的 MCP 工具桥接插件，能够自动发现、缓存和调用 MCP 工具，支持多种 MCP 服务器类型。 |
| MCPOMonitor | 禁用 | static | Node.js | 监控 MCPO 服务器状态并提供所有可用 MCP 工具的详细信息，通过 {{MCPOServiceStatus}} 占位符集成到系统提示词中。 |
| MIDITranslator | 启用 | hybridservice | Node.js + Python + Rust + 原生可执行文件 | 一个高性能的MIDI文件解析与生成插件，可以从midi-input目录读取MIDI文件并解析为DSL格式，也可以从DSL生成MIDI文件到midi-output目录。 |
| NanoBananaGen2 | 禁用 | synchronous | Node.js | 使用 Vercel 接口调用 Google Gemini 3 pro Image Preview 模型进行高级的图像生成和编辑。 |
| NanoBananaGenOR | 启用 | synchronous | Node.js | 使用 OpenRouter 接口调用 Google Gemini 2. |
| NCBIDatasets | 启用 | synchronous | Node.js | 提供对 NCBI Datasets v2 API 的封装能力，用于检索基因组、基因与物种信息等。 |
| NeteaseFetch | 启用 | 未声明 | Python | 网易云音乐歌曲详情歌词热评搜索歌单获取插件 |
| NeteaseMusic | 启用 | synchronous | Node.js | 网易云音乐点歌插件，支持搜索歌曲、获取最高音质播放链接和获取歌词。 |
| NewsSearch | 启用 | synchronous | Node.js | 日报工作流专用的多源新闻聚合插件。 |
| NovelAIGen | 禁用 | synchronous | Node.js | 通过 NovelAI API 使用 NovelAI Diffusion 模型生成高质量的动漫风格图片。 |
| ObsidianManager | 启用 | synchronous | Node.js | VCP 与 Obsidian 的同步多指令管理插件。 |
| PaperReader | 启用 | synchronous | Node.js | 统一自适应阅读引擎：将超长 PDF/文档转为目标驱动的多分辨率阅读流程。 |
| PowerShellExecutor | 启用 | synchronous | Node.js | 一个允许AI执行PowerShell命令并返回其输出的插件。 |
| ProjectAnalyst | 启用 | synchronous | Node.js + Python | 分析指定的项目文件夹，生成详细的分析报告，并支持后续查询分析结果。 |
| PubMedSearch | 启用 | synchronous | Node.js | 提供基于 NCBI E-utilities 和 PMC 的 PubMed 文献检索、详情获取、引用/相似文献分析与标识符转换等能力。 |
| PyCameraCapture | 启用 | synchronous | Python | 一个使用Python和OpenCV从摄像头捕获图像的同步插件。 |
| PyScreenshot | 启用 | synchronous | Python | 一个使用Python和Pillow从桌面截取屏幕图像的同步插件。 |
| QQGroupReader | 启用 | synchronous | Node.js | 从本地 NTQQ 加密数据库中读取群聊消息，支持按群号、时间范围查询，返回结构化文本供 AI 分析整理。 |
| QwenImageGen | 启用 | synchronous | Node.js | 使用 SiliconFlow API 调用通义千问模型生成和编辑图片。 |
| RAGDiaryPlugin | 启用 | hybridservice | Node.js | 通过向量检索动态地将日记内容注入到系统提示词中，以实现高效、低消耗的长期记忆。 |
| Randomness | 启用 | synchronous | Python | 一个多功能后端插件，用于生成各种可信的随机事件。 |
| RecentMemo | 启用 | messagePreprocessor | Node.js | Standalone Cross-Agent Sync (Pure %%RecentMemo::%% Mode). |
| ScheduleBriefing | 启用 | static | Node.js | 每小时自动清理过期日程，并提取下一个日程供AI参考。 |
| ScheduleManager | 启用 | synchronous | Node.js | 用于维护用户的日程，允许AI查看、添加和删除用户日程。 |
| SciCalculator | 启用 | synchronous | Python | 执行数学表达式计算。 |
| SeedreamGen | 启用 | synchronous | Node.js | 基于火山引擎Seedream 4. |
| SemanticGroupEditor | 启用 | synchronous | Node.js | 一个用于查询和更新RAG知识库中语义词元组的插件。 |
| SerpSearch | 启用 | synchronous | Node.js | 一个使用SerpApi提供多种搜索引擎（如Bing, DuckDuckGo, Google Scholar）的插件。 |
| SkillFactory | 启用 | synchronous | Node.js | 用于根据用户目标生成新的 skill 草案，并完成查重与草案保存。 |
| SunoGen | 禁用 | synchronous | Node.js | 使用 Suno API 生成原创歌曲。 |
| SVCardFinder | 启用 | synchronous | Python | 一个用于查询《影之诗：世界超越》卡牌信息的插件。 |
| SynapsePusher | 启用 | service | Node.js | 将 VCP 工具调用日志实时推送到指定的 Synapse (Matrix) 房间。 |
| TarotDivination | 启用 | synchronous | Node.js + Python | 一个融合天文、环境与内在起源的塔罗牌占卜插件，支持多种牌阵与起源选择。 |
| TavilySearch | 启用 | synchronous | Node.js | 使用 Tavily API 进行高级网络搜索。 |
| TencentCOSBackup | 禁用 | synchronous | Python | 一个功能完整的腾讯云对象存储（COS）插件，支持文件上传、下载、复制、移动、删除和列出操作，具有权限控制和自动压缩功能。 |
| ThoughtClusterManager | 启用 | synchronous | Node.js | 一个用于创建和编辑AI自身思维链文件的插件，实现元自学习能力。 |
| TimelineInjector | 启用 | static | Node.js | 扫描timeline/目录的JSON文件，为每个角色生成时间线摘要，并在dailynote/下创建时间线日记本文件夹（如文枢时间线），可通过{{文枢时间线日记本}}等占位符注入。 |
| UrlFetch | 启用 | synchronous | Node.js | 通用 URL 内容获取插件。 |
| UserAuth | 启用 | static | Node.js | 每小时生成一个6位数的认证码，用于用户权限验证。 |
| VCPEverything | 启用 | synchronous | Node.js | 通过调用 Everything 命令行工具 (es. |
| VCPForum | 启用 | synchronous | Node.js | 用于在VCP论坛中创建新帖子和回复现有帖子的同步插件。 |
| VCPForumAssistant | 启用 | static | Node.js | 定时提醒家里的agent去逛VCP论坛。 |
| VCPForumLister | 启用 | static | Node.js | 一个静态插件，定期扫描论坛目录并生成一个热门帖子列表（按最后修改时间排序）。 |
| VCPForumOnline | 启用 | synchronous | Node.js | 用于在VCP在线论坛中浏览、发帖、回帖、点赞、编辑、删除、管理帖子、搜索和AI心语私信的同步插件。 |
| VCPLog | 启用 | service | Node.js | 通过 WebSocket 推送 VCP 调用信息，并记录日志。 |
| VCPSkillsBridge | 启用 | synchronous | Node.js | 连接 VCP 技能注册表与插件生态，提供技能列表、详情、推荐与桥接执行说明。 |
| VCPTavern | 启用 | hybridservice | Node.js | 一个强大的、可视化的上下文注入插件，类似于 SillyTavern 的高级上下文编辑功能。 |
| VideoGenerator | 禁用 | asynchronous | Python | 使用 Wan2. |
| VSearch | 启用 | synchronous | Node.js | 一个极简、高效的语义级并发搜索引擎。 |
| WeatherInfoNow | 启用 | static | Node.js | 从 WeatherReporter 的缓存中提取并提供简短的实时天气信息。 |
| WeatherReporter | 启用 | static | Node.js | 提供实时的天气信息，并将其集成到系统提示词的 {{VCPWeatherInfo}} 占位符中。 |
| WebUIGen | 启用 | synchronous | Node.js | 调用云算力API生成高质量图像，支持多种模型和自定义参数。 |
| WorkspaceInjector | 启用 | messagePreprocessor | Node.js | 通过在系统提示词中使用 {{Workspace::alias}} 占位符，将预设的本地文件夹目录树动态注入到上下文中。 |
| XiaohongshuFetch | 启用 | synchronous | Node.js + Python | 用于抓取小红书图文/视频笔记内容的专属爬虫。 |
| ZImageGen | 启用 | synchronous | Node.js | 通过 Hugging Face Spaces API 使用阿里巴巴通义实验室的 Z-Image-Turbo 模型生成高质量图片。 |
| ZImageGen2 | 启用 | synchronous | Node.js | 通过 Hugging Face Spaces API 使用 Z-Image-Base 模型生成高质量图片。 |

## 复杂目录（按递归文件数排序）

- MIDITranslator：7512 个文件，类型 hybridservice，用途为一个高性能的MIDI文件解析与生成插件，可以从midi-input目录读取MIDI文件并解析为DSL格式，也可以从DSL生成MIDI文件到midi-output目录。
- DeepWikiVCP：3493 个文件，类型 synchronous，用途为一个同步插件，用于抓取 deepwiki.
- NeteaseMusic：2800 个文件，类型 synchronous，用途为网易云音乐点歌插件，支持搜索歌曲、获取最高音质播放链接和获取歌词。
- DailyHot：71 个文件，类型 static，用途为在后台周期性地获取所有主流平台的今日热榜信息，并通过占位符 {{VCPDailyHot}} 提供。
- CoSearch：62 个文件，类型 synchronous，用途为基于 OpenAI-compatible Responses API + web_search 的语义级并发深度检索插件，支持 lite/standard/deep 三种模式。
- RAGDiaryPlugin：19 个文件，类型 hybridservice，用途为通过向量检索动态地将日记内容注入到系统提示词中，以实现高效、低消耗的长期记忆。
- ComfyUIGen：18 个文件，类型 synchronous，用途为通过 ComfyUI API 使用自定义工作流生成高质量图像。
- IMAPIndex：15 个文件，类型 static，用途为静态插件：定期通过 IMAP 拉取白名单匹配邮件到本地（.
- EmojiListGenerator：14 个文件，类型 static，用途为扫描项目 image/ 目录下的表情包文件夹，并在插件自己的 generated_lists/ 目录下生成对应的 .
- PaperReader：14 个文件，类型 synchronous，用途为统一自适应阅读引擎：将超长 PDF/文档转为目标驱动的多分辨率阅读流程。
- Randomness：13 个文件，类型 synchronous，用途为一个多功能后端插件，用于生成各种可信的随机事件。
- LinuxShellExecutor：12 个文件，类型 synchronous，用途为六层安全防护的 Linux Shell 命令执行器。
- AgentCreator：11 个文件，类型 hybridservice，用途为AI驱动的Agent创作与管理工坊。
- LinuxLogMonitor：11 个文件，类型 asynchronous，用途为事件驱动的 Linux 日志监控系统。
- JapaneseHelper：10 个文件，类型 synchronous，用途为日语学习增强插件。

## 各插件说明

### 1PanelInfoProvider

- 状态：禁用（plugin-manifest.json.block）
- 展示名：1Panel 信息提供器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：从1Panel服务器获取Dashboard基础信息和操作系统信息，并通过独立的系统提示词占位符提供这些数据。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{1PanelDashboard}}、{{1PanelOsInfo}}；主要通信协议为 stdio。
- 入口信息：node 1PanelInfoProvider.js
- 目录概览：递归共 7 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：1PanelInfoProvider.js、config.env.example、plugin-manifest.json.block、Readme.md、utils.js
- 提示词占位符：{{1PanelDashboard}}、{{1PanelOsInfo}}
- 主要配置项：PanelBaseUrl、PanelApiKey、DebugMode、Enabled
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### AgentAssistant

- 状态：启用（plugin-manifest.json）
- 展示名：女仆团协作插件
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：允许莱恩先生或其主AI调用家中配置的七位专属女仆Agent，进行专业领域咨询与高效协作。
- 主要作用：兼具服务常驻和直接调用能力；暴露工具命令：AskMaidAgent；主要通信协议为 direct。
- 入口信息：AgentAssistant.js
- 目录概览：递归共 7 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：AgentAssistant.js、config.env.example、plugin-manifest.json、plugin-manifest.json.example、README.md
- 工具命令：AskMaidAgent
- 主要配置项：AGENT_ASSISTANT_MAX_HISTORY_ROUNDS、AGENT_ASSISTANT_CONTEXT_TTL_HOURS
- README：README.md

### AgentCreator

- 状态：启用（plugin-manifest.json）
- 展示名：智能Agent创作工坊
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：AI驱动的Agent创作与管理工坊。
- 主要作用：兼具服务常驻和直接调用能力；主要通信协议为 direct。
- 入口信息：AgentCreator.js
- 目录概览：递归共 11 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：AgentCreator.js、plugin-manifest.json、README.md、templates
- 主要配置项：DEFAULT_FILE_EXT、BACKUP_ON_EDIT、AUTO_UPDATE_MAP
- README：README.md

### AgentDream

- 状态：禁用（plugin-manifest.json.block）
- 展示名：梦系统插件
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：Agent梦境系统。
- 主要作用：兼具服务常驻和直接调用能力；主要通信协议为 direct。
- 入口信息：AgentDream.js
- 目录概览：递归共 6 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：AgentDream.js、config.env.example、dreampost.txt、dream_logs、plugin-manifest.json.block、README.md、test_dream.js
- 主要配置项：DREAM_FREQUENCY_HOURS、DREAM_TIME_WINDOW_START、DREAM_TIME_WINDOW_END、DREAM_PROBABILITY、DREAM_ASSOCIATION_MAX_RANGE_DAYS、DREAM_SEED_COUNT_MIN 等 12 项
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### AgentMessage

- 状态：启用（plugin-manifest.json）
- 展示名：代理消息推送插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：允许AI通过WebSocket向用户前端发送格式化消息。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：AgentMessage；主要通信协议为 stdio。
- 入口信息：node AgentMessage.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：AgentMessage.js、plugin-manifest.json
- 工具命令：AgentMessage

### AIMemo

- 状态：启用（plugin-manifest.json）
- 展示名：AIMemo 历史回忆检索
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：基于聊天历史JSON的关键词滑窗回忆工具。
- 主要作用：兼具服务常驻和直接调用能力；暴露工具命令：SearchHistory；主要通信协议为 direct。
- 入口信息：index.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：index.js、plugin-manifest.json
- 工具命令：SearchHistory

### AnimeFinder

- 状态：启用（plugin-manifest.json）
- 展示名：以图找番
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个通过图片URL或本地文件路径查找对应动漫信息的插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：findAnimeByUrl；主要通信协议为 stdio。
- 入口信息：node AnimeFinder.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：AnimeFinder.js、plugin-manifest.json
- 工具命令：findAnimeByUrl

### ArtistMatcher

- 状态：启用（plugin-manifest.json）
- 展示名：画师匹配查询器
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：根据用户输入的画师名，模糊匹配SDXL模型内部的画师Tag，并返回最佳匹配结果和拟合度建议。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：FindArtist、GetRandomArtistString；主要通信协议为 stdio。
- 入口信息：python artist_matcher.py
- 目录概览：递归共 4 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：artist_cache.json、artist_matcher.py、plugin-manifest.json、requirements.txt
- 工具命令：FindArtist、GetRandomArtistString

### ArxivDailyPapers

- 状态：启用（plugin-manifest.json）
- 展示名：ArxivDailyPapers
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：Fetches daily research papers from the Arxiv API and provides them as a placeholder.
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{ArxivDailyPapersData}}；主要通信协议为 stdio。
- 入口信息：node ArxivDailyPapers.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：ArxivDailyPapers.js、arxiv_papers.json、config.env.example、plugin-manifest.json
- 提示词占位符：{{ArxivDailyPapersData}}
- 主要配置项：ARXIV_SEARCH_TERMS、ARXIV_MAX_RESULTS、ARXIV_DAYS_RANGE、ARXIV_DEBUG_MODE

### BilibiliFetch

- 状态：启用（plugin-manifest.json）
- 展示名：Bilibili 内容获取插件
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：Bilibili 视频内容获取插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：BilibiliFetch、BilibiliSearch、GetUpVideos；主要通信协议为 stdio。
- 入口信息：python BilibiliFetch.py
- 目录概览：递归共 3 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：BilibiliFetch.py、plugin-manifest.json、README.md
- 工具命令：BilibiliFetch、BilibiliSearch、GetUpVideos
- 主要配置项：BILIBILI_COOKIE
- README：README.md

### CapturePreprocessor

- 状态：启用（plugin-manifest.json）
- 展示名：捕获预处理器
- 插件类型：messagePreprocessor；通信协议：direct；运行时：Node.js
- 主要用途：一个预处理插件，用于检测和替换消息中的截图和摄像头捕获占位符，如 {{VCPScreenShot}} 和 {{VCPCameraCapture}}。
- 主要作用：在消息进入主流程前执行预处理；主要通信协议为 direct。
- 入口信息：CapturePreprocessor.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：CapturePreprocessor.js、config.env.example、plugin-manifest.json、README.md
- 主要配置项：PLACEHOLDER_SCREENSHOT_MODE、PLACEHOLDER_CAMERA_MODE
- README：README.md

### ChromeBridge

- 状态：启用（plugin-manifest.json）
- 展示名：Chrome 浏览器桥接器
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：混合插件：既能让AI实时观察Chrome页面内容（Service模式），又能执行浏览器控制命令并等待页面刷新（Direct模式）。
- 主要作用：兼具服务常驻和直接调用能力；注入占位符：{{VCPChromePageInfo}}；主要通信协议为 direct。
- 入口信息：ChromeBridge.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：ChromeBridge.js、config.env.example、plugin-manifest.json、README.md
- 提示词占位符：{{VCPChromePageInfo}}
- 主要配置项：DebugMode
- README：README.md

### CodeSearcher

- 状态：启用（plugin-manifest.json）
- 展示名：代码搜索器 (Rust)
- 插件类型：synchronous；通信协议：stdio；运行时：Rust + 原生可执行文件
- 主要用途：一个使用Rust编写的高性能代码搜索插件，可以在指定的工作区目录中进行快速、精准的代码内容搜索。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：SearchCode；主要通信协议为 stdio。
- 入口信息：CodeSearcher.exe
- 目录概览：递归共 5 个文件；JS 0，TS 0，Python 0，Rust 1，原生可执行 1
- 关键文件/目录：CodeSearcher.exe、plugin-manifest.json、src
- 工具命令：SearchCode
- 主要配置项：MAX_RESULTS、IGNORED_FOLDERS、ALLOWED_EXTENSIONS

### ComfyUIGen

- 状态：启用（plugin-manifest.json）
- 展示名：ComfyUI 图像生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js + Python
- 主要用途：通过 ComfyUI API 使用自定义工作流生成高质量图像。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：ComfyUIGenerateImage；主要通信协议为 stdio。
- 入口信息：node ComfyUIGen.js
- 目录概览：递归共 18 个文件；JS 3，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：comfyui-settings-template.json、ComfyUIGen.js、config.env.example、docs、package.json、plugin-manifest.json、README.md、templates
- 工具命令：ComfyUIGenerateImage
- 主要配置项：COMFYUI_BASE_URL、COMFYUI_API_KEY、DEBUG_MODE
- README：README.md

### Context7

- 状态：启用（plugin-manifest.json）
- 展示名：Context7文档查询器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：集成Context7平台，为AI提供实时的、版本特定的代码库文档和示例，支持最新的库文档查询，避免AI依赖过时的训练数据。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：GetLibraryDocs、SearchLibraries；主要通信协议为 stdio。
- 入口信息：node Context7.js
- 目录概览：递归共 7 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：Context7.js、package.json、plugin-manifest.json、README.md、test-input.json
- 工具命令：GetLibraryDocs、SearchLibraries
- 主要配置项：CONTEXT7_BASE_URL、CONTEXT7_TIMEOUT
- README：README.md

### CoSearch

- 状态：启用（plugin-manifest.json）
- 展示名：CoSearch 深度研究插件
- 插件类型：synchronous；通信协议：stdio；运行时：未明显识别
- 主要用途：基于 OpenAI-compatible Responses API + web_search 的语义级并发深度检索插件，支持 lite/standard/deep 三种模式。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：CoSearch；主要通信协议为 stdio。
- 入口信息：bash run_cosearch.sh
- 目录概览：递归共 62 个文件；JS 0，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：cmd、config.env.example、CoSearch_PRD_v1.0.md、CoSearch_PRD_v1.1.md、docs、go.mod、internal、plugin-manifest.json
- 工具命令：CoSearch
- 主要配置项：COSEARCH_API_KEY、COSEARCH_BASE_URL、COSEARCH_MODEL、COSEARCH_WORKSPACE_DIR、COSEARCH_ALLOWED_DOMAINS
- README：README.md

### CrossRefDailyPapers

- 状态：启用（plugin-manifest.json）
- 展示名：CrossRef Daily Papers
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：Fetches daily research papers from the CrossRef API and provides them as a placeholder.
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{CrossRefDailyPapersData}}；主要通信协议为 stdio。
- 入口信息：node CrossRefDailyPapers.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、CrossRefDailyPapers.js、crossref_papers.json、plugin-manifest.json
- 提示词占位符：{{CrossRefDailyPapersData}}
- 主要配置项：CROSSREF_QUERY_BIBLIOGRAPHIC、CROSSREF_ROWS、CROSSREF_DAYS_RANGE、CROSSREF_DEBUG_MODE

### DailyHot

- 状态：启用（plugin-manifest.json）
- 展示名：每日热榜
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：在后台周期性地获取所有主流平台的今日热榜信息，并通过占位符 {{VCPDailyHot}} 提供。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{VCPDailyHot}}；主要通信协议为 stdio。
- 入口信息：node daily-hot.js
- 目录概览：递归共 71 个文件；JS 68，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：daily-hot.js、dailyhot_cache.md、dist、plugin-manifest.json
- 提示词占位符：{{VCPDailyHot}}

### DailyNote

- 状态：启用（plugin-manifest.json）
- 展示名：日记系统 (创建与更新)
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个多功能日记插件，提供创建(create)和更新(update)日记的功能。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：create、update；主要通信协议为 stdio。
- 入口信息：node dailynote.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：dailynote.js、plugin-manifest.json
- 工具命令：create、update
- 主要配置项：DebugMode

### DailyNoteManager

- 状态：启用（plugin-manifest.json）
- 展示名：日记整理器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个日记管理插件，用于接收AI输出的日记内容，进行智能分析、信息融合、内容精简，并将其保存为独立的txt文件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：DailyNoteManager；主要通信协议为 stdio。
- 入口信息：node daily-note-manager.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：daily-note-manager.js、plugin-manifest.json、plugin-manifest.json.block、Readme.md
- 工具命令：DailyNoteManager
- README：README.md

### DailyNotePanel

- 状态：启用（plugin-manifest.json）
- 展示名：DailyNotePanel 路由胶水插件
- 插件类型：service；通信协议：direct；运行时：Node.js
- 主要用途：通过 PluginManager 在主服务上注册 DailyNotePanel 的静态页面端点和 dailynote API 端点。
- 主要作用：以常驻服务方式提供能力；主要通信协议为 direct。
- 入口信息：index.js
- 目录概览：递归共 8 个文件；JS 3，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：index.js、frontend、plugin-manifest.json
- 主要配置项：DebugMode、PanelPathPrefix、ApiPathPrefix

### DailyNoteWrite

- 状态：启用（plugin-manifest.json）
- 展示名：日记写入器 (同步)
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：接收日记数据 (maidName, dateString, contentText) 作为标准输入，将其写入对应的日记文件，并通过标准输出返回结果。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node daily-note-write.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：daily-note-write.js、plugin-manifest.json、README.md、TagMaster.txt
- 主要配置项：DebugMode
- README：README.md

### DeepWikiVCP

- 状态：启用（plugin-manifest.json）
- 展示名：DeepWiki 抓取器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个同步插件，用于抓取 deepwiki.
- 主要作用：按请求同步执行并返回结果；暴露工具命令：deepwiki_fetch；主要通信协议为 stdio。
- 入口信息：node Plugin/DeepWikiVCP/deepwiki_vcp.js
- 目录概览：递归共 3493 个文件；JS 1184，TS 1215，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：deepwiki_vcp.js、node_modules、package.json、plugin-manifest.json
- 工具命令：deepwiki_fetch

### DMXDoubaoGen

- 状态：启用（plugin-manifest.json）
- 展示名：Doubao 风格图片生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过 DMXAPI 使用其提供的模型（如 doubao-seedream-4-0-250828）生成和编辑图片。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：DoubaoGenerateImage、DoubaoEditImage、DoubaoComposeImage；主要通信协议为 stdio。
- 入口信息：node DoubaoGen.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、DoubaoGen.js、plugin-manifest.json
- 工具命令：DoubaoGenerateImage、DoubaoEditImage、DoubaoComposeImage
- 主要配置项：VOLCENGINE_API_KEY

### DoubaoGen

- 状态：启用（plugin-manifest.json）
- 展示名：Doubao 风格图片生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过火山方舟 API 使用 Doubao Seedream 3.
- 主要作用：按请求同步执行并返回结果；暴露工具命令：DoubaoGenerateImage；主要通信协议为 stdio。
- 入口信息：node DoubaoGen.js
- 目录概览：递归共 7 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、DoubaoGen.js、package.json、plugin-manifest.json、README.md
- 工具命令：DoubaoGenerateImage
- 主要配置项：VOLCENGINE_API_KEY
- README：README.md

### EmojiListGenerator

- 状态：启用（plugin-manifest.json）
- 展示名：表情包列表文件生成器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：扫描项目 image/ 目录下的表情包文件夹，并在插件自己的 generated_lists/ 目录下生成对应的 .
- 主要作用：以静态上下文方式为系统提示词补充信息；主要通信协议为 stdio。
- 入口信息：node emoji-list-generator.js
- 目录概览：递归共 14 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：emoji-list-generator.js、generated_lists、plugin-manifest.json、README.md
- 主要配置项：DebugMode
- README：README.md

### FileListGenerator

- 状态：启用（plugin-manifest.json）
- 展示名：文件列表生成器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：生成 'file' 目录下的文件和文件夹列表，并提供给 {{VCPFileServer}} 占位符。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{VCPFileServer}}；主要通信协议为 stdio。
- 入口信息：node file-list-generator.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：file-list-generator.js、plugin-manifest.json
- 提示词占位符：{{VCPFileServer}}

### FileOperator

- 状态：启用（plugin-manifest.json）
- 展示名：VCP服务器文件操作器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：VCP服务器专用的一个强大的文件系统操作插件，允许AI对受限目录进行读、写、列出、移动、复制、删除等多种文件和目录操作。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node FileOperator.js
- 目录概览：递归共 4 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：CodeValidator.js、FileOperator.js、plugin-manifest.json
- 主要配置项：ALLOWED_DIRECTORIES、DEFAULT_DOWNLOAD_DIR、MAX_FILE_SIZE、MAX_DIRECTORY_ITEMS、MAX_SEARCH_RESULTS、DEBUG_MODE

### FileServer

- 状态：启用（plugin-manifest.json）
- 展示名：文件服务
- 插件类型：service；通信协议：direct；运行时：Node.js
- 主要用途：提供受密码保护的静态文件服务。
- 主要作用：以常驻服务方式提供能力；主要通信协议为 direct。
- 入口信息：file-server.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：file-server.js、plugin-manifest.json
- 主要配置项：File_Key、DebugMode

### FileTreeGenerator

- 状态：启用（plugin-manifest.json）
- 展示名：文件树生成器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：扫描指定目录的文件夹结构，并通过占位符提供给AI。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{VCPFilestructureInfo}}；主要通信协议为 stdio。
- 入口信息：node FileTreeGenerator.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、FileTreeGenerator.js、plugin-manifest.json、README.md
- 提示词占位符：{{VCPFilestructureInfo}}
- 主要配置项：0、1
- README：README.md

### FlashDeepSearch

- 状态：启用（plugin-manifest.json）
- 展示名：闪电深度研究插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个强大的深度研究插件，能够围绕一个主题进行多维度、跨领域的关键词扩展，并综合搜索结果生成研究报告。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：StartResearch；主要通信协议为 stdio。
- 入口信息：node FlashDeepSearch.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、FlashDeepSearch.js、plugin-manifest.json
- 工具命令：StartResearch
- 主要配置项：DeepSearchKey、DeepSearchUrl、DeepSearchModel、GoogleSearchModel、MaxSearchList

### FluxGen

- 状态：启用（plugin-manifest.json）
- 展示名：Flux 风格图片生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过 SiliconFlow API 使用 FLUX.
- 主要作用：按请求同步执行并返回结果；暴露工具命令：FluxGenerateImage；主要通信协议为 stdio。
- 入口信息：node FluxGen.mjs
- 目录概览：递归共 7 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、FluxGen.mjs、FluxGen.mjs.bak、package.json、plugin-manifest.json
- 工具命令：FluxGenerateImage
- 主要配置项：SILICONFLOW_API_KEY

### FRPSInfoProvider

- 状态：启用（plugin-manifest.json）
- 展示名：FRPS 设备信息提供器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：定期从FRPS服务器获取所有类型的代理设备信息，并整合成一个文本文件供占位符使用。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{FRPSAllProxyInfo}}；主要通信协议为 stdio。
- 入口信息：node FRPSInfoProvider.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、FRPSInfoProvider.js、frps_info_cache.txt、plugin-manifest.json
- 提示词占位符：{{FRPSAllProxyInfo}}
- 主要配置项：FRPSBaseUrl、FRPSAdminUser、FRPSAdminPassword、DebugMode

### GeminiImageGen

- 状态：启用（plugin-manifest.json）
- 展示名：Gemini 图像生成与编辑
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：使用 Google Gemini Flash Preview 模型进行高级的图像生成和编辑。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：GeminiGenerateImage、GeminiEditImage；主要通信协议为 stdio。
- 入口信息：node GeminiImageGen.mjs
- 目录概览：递归共 4 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、GeminiImageGen.js、GeminiImageGen.mjs、plugin-manifest.json
- 工具命令：GeminiGenerateImage、GeminiEditImage
- 主要配置项：GeminiImageKey、GeminiImageProxy、DIST_IMAGE_SERVERS

### GitOperator

- 状态：启用（plugin-manifest.json）
- 展示名：Git 仓库管理器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：基于配置档驱动的智能 Git 管理器。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node GitOperator.js
- 目录概览：递归共 9 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：CHANGELOG.md、config.env.example、debug.log、GitOperator.js、plugin-manifest.json、README.md、repos.json、repos.json.example
- 主要配置项：PLUGIN_WORK_PATHS
- README：README.md

### GoogleSearch

- 状态：启用（plugin-manifest.json）
- 展示名：谷歌搜索 (API版)
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个使用Google Custom Search API进行搜索的同步插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：GoogleSearch；主要通信协议为 stdio。
- 入口信息：node search.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、search.js
- 工具命令：GoogleSearch
- 主要配置项：GOOGLE_SEARCH_API、GOOGLE_CX、GOOGLE_PROXY_PORT

### GrokVideo

- 状态：启用（plugin-manifest.json）
- 展示名：Grok 视频生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：使用 Grok API 进行视频生成（支持文生视频、图生视频、视频续写、视频拼接）。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：python video_handler.py
- 目录概览：递归共 5 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、README.md、video_handler.py
- 主要配置项：GROK_API_KEY、GROK_API_BASE、GrokVideoModelName、DebugMode、PROJECT_BASE_PATH、SERVER_PORT 等 8 项
- README：README.md

### ImageProcessor

- 状态：启用（plugin-manifest.json）
- 展示名：多模态数据提取器
- 插件类型：messagePreprocessor；通信协议：direct；运行时：Node.js
- 主要用途：处理用户消息中的多模态数据（图像、音频、视频），调用多模态模型提取信息，并将其替换或附加到消息文本中。
- 主要作用：在消息进入主流程前执行预处理；主要通信协议为 direct。
- 入口信息：image-processor.js
- 目录概览：递归共 7 个文件；JS 3，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：image-processor.js、image_cache_editor.html、multimodal_cache.json、plugin-manifest.json、purge_old_cache.js、README.md、reidentify_image.js
- 主要配置项：API_URL、API_Key、MultiModalModel、MultiModalPrompt、MultiModalModelOutputMaxTokens、MultiModalModelThinkingBudget 等 9 项
- README：README.md

### ImageServer

- 状态：启用（plugin-manifest.json）
- 展示名：图床服务
- 插件类型：service；通信协议：direct；运行时：Node.js
- 主要用途：提供受密码保护的静态图片服务。
- 主要作用：以常驻服务方式提供能力；主要通信协议为 direct。
- 入口信息：image-server.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：image-server.js、plugin-manifest.json、README.md
- 主要配置项：Image_Key、File_Key、DebugMode
- README：README.md

### IMAPIndex

- 状态：禁用（plugin-manifest.json.block）
- 展示名：IMAP 邮件本地索引插件
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：静态插件：定期通过 IMAP 拉取白名单匹配邮件到本地（.
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{IMAPIndex}}；主要通信协议为 stdio。
- 入口信息：node IMAPIndex.js
- 目录概览：递归共 15 个文件；JS 12，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：IMAPIndex.js、package.json、plugin-manifest.json.block、post_run.js、proxy、README.md、storkapp_dailynote、storkapp_dailynote_pubmed
- 提示词占位符：{{IMAPIndex}}
- 主要配置项：IMAP_USER、IMAP_PASS、IMAP_HOST、IMAP_PORT、IMAP_TLS、TIME_LIMIT_DAYS 等 13 项
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### IMAPSearch

- 状态：禁用（plugin-manifest.json.block）
- 展示名：IMAP 邮件本地搜索
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个同步 VCP 插件，用于在 IMAPIndex 插件生成的本地邮件存储中执行全文搜索。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：IMAPSearch；主要通信协议为 stdio。
- 入口信息：node index.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、index.js、plugin-manifest.json.block、README.md
- 工具命令：IMAPSearch
- 主要配置项：MAIL_INDEX_DIR、SEARCH_RESULT_LIMIT
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### JapaneseHelper

- 状态：启用（plugin-manifest.json）
- 展示名：日语学习助手
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：日语学习增强插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：JapaneseHelperCore、JapaneseHelperLookup、JapaneseHelperQuizBatch、JapaneseHelperStudySession、JapaneseHelperDataAndHealth；主要通信协议为 stdio。
- 入口信息：python JapaneseHelper.py
- 目录概览：递归共 10 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、install_plugin_requirements.bat、install_plugin_requirements.ps1、JapaneseHelper.py、plugin-manifest.json、plugin-manifest.json.block、README.md、requirements.txt
- 工具命令：JapaneseHelperCore、JapaneseHelperLookup、JapaneseHelperQuizBatch、JapaneseHelperStudySession、JapaneseHelperDataAndHealth
- 主要配置项：REQUEST_TIMEOUT、JISHO_API_ENABLED、SUDACHI_SPLIT_MODE、USER_LEXICON_PATH、DOMAIN_LEXICON_PATH、ENABLE_ADAPTIVE_SESSION 等 24 项
- README：README.md

### KarakeepSearch

- 状态：启用（plugin-manifest.json）
- 展示名：Karakeep 搜索书签
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：在 Karakeep 中全文搜索书签。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：SearchBookmarks；主要通信协议为 stdio。
- 入口信息：node index.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、index.js、plugin-manifest.json、README.md
- 工具命令：SearchBookmarks
- 主要配置项：KARAKEEP_API_ADDR、KARAKEEP_API_KEY
- README：README.md

### KEGGSearch

- 状态：启用（plugin-manifest.json）
- 展示名：KEGG 数据库查询
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个用于查询 KEGG 数据库的 VCP 插件，提供通路、基因、化合物等多维度的数据检索与分析功能。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：get_database_info、search_pathways、get_pathway_info、get_pathway_genes、search_genes、get_gene_info 等 32 项；主要通信协议为 stdio。
- 入口信息：node KEGGSearch.mjs
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：KEGGSearch.mjs、plugin-manifest.json
- 工具命令：get_database_info、search_pathways、get_pathway_info、get_pathway_genes、search_genes、get_gene_info 等 32 项

### LightMemo

- 状态：启用（plugin-manifest.json）
- 展示名：轻量回忆插件 (LightMemo)
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：一个允许AI主动搜索其RAG知识库（日记、知识库）的插件，作为DeepMemo（上下文搜索）的补充。
- 主要作用：兼具服务常驻和直接调用能力；暴露工具命令：SearchRAG；主要通信协议为 direct。
- 入口信息：LightMemo.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：LightMemo.js、config.env.example、plugin-manifest.json
- 工具命令：SearchRAG
- 主要配置项：EXCLUDED_FOLDERS、RerankUrl、RerankApi、RerankModel

### LinuxLogMonitor

- 状态：启用（plugin-manifest.json）
- 展示名：Linux 日志监控器
- 插件类型：asynchronous；通信协议：stdio；运行时：Node.js
- 主要用途：事件驱动的 Linux 日志监控系统。
- 主要作用：支持异步执行与回调/轮询式结果返回；暴露工具命令：start、stop、status、list_rules、add_rule、searchLog 等 8 项；主要通信协议为 stdio。
- 入口信息：node LinuxLogMonitor.js
- 目录概览：递归共 11 个文件；JS 5，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：core、LinuxLogMonitor.js、plugin-manifest.json、README.md、rules、state
- 工具命令：start、stop、status、list_rules、add_rule、searchLog 等 8 项
- README：README.md

### LinuxShellExecutor

- 状态：启用（plugin-manifest.json）
- 展示名：Linux Shell 安全执行器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：六层安全防护的 Linux Shell 命令执行器。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：LinuxShellExecutor；主要通信协议为 stdio。
- 入口信息：node LinuxShellExecutor.js
- 目录概览：递归共 12 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：examples、graylist.json、hosts.json、LinuxShellExecutor.js、plugin-manifest.json、presets.json、README.md、securityLevels.json
- 工具命令：LinuxShellExecutor
- README：README.md

### MagiAgent

- 状态：启用（plugin-manifest.json）
- 展示名：Magi三贤者会议系统
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：一个模拟EVA三贤人系统的混合插件，可以召开Magi会议讨论复杂问题，并支持异步查询。
- 主要作用：兼具服务常驻和直接调用能力；暴露工具命令：start_meeting、query_meeting；主要通信协议为 direct。
- 入口信息：MagiAgent.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：MagiAgent.js、magiAI.txt、meetings、plugin-manifest.json
- 工具命令：start_meeting、query_meeting
- 主要配置项：MAIDNAME

### MCPO

- 状态：禁用（plugin-manifest.json.block）
- 展示名：MCPO 工具桥接器
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：基于 mcpo 的 MCP 工具桥接插件，能够自动发现、缓存和调用 MCP 工具，支持多种 MCP 服务器类型。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：list_tools、call_tool、get_tool_info、manage_server、discover_tools、list_configs 等 7 项；主要通信协议为 stdio。
- 入口信息：python mcpo_plugin.py
- 目录概览：递归共 6 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：custom-mcp-config、DEPLOYMENT.md、mcpo_plugin.py、plugin-manifest.json.block、requirements.txt
- 工具命令：list_tools、call_tool、get_tool_info、manage_server、discover_tools、list_configs 等 7 项
- 主要配置项：MCPO_PORT、MCPO_API_KEY、MCPO_AUTO_START、PYTHON_EXECUTABLE、MCP_CONFIG_PATH、MCPO_CONFIG_NAME 等 7 项
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### MCPOMonitor

- 状态：禁用（plugin-manifest.json.block）
- 展示名：MCPO 服务状态监控器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：监控 MCPO 服务器状态并提供所有可用 MCP 工具的详细信息，通过 {{MCPOServiceStatus}} 占位符集成到系统提示词中。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{MCPOServiceStatus}}；主要通信协议为 stdio。
- 入口信息：node mcpo_monitor.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：mcpo_monitor.js、plugin-manifest.json.block、README.md
- 提示词占位符：{{MCPOServiceStatus}}
- 主要配置项：MCPO_HOST、MCPO_PORT、MCPO_API_KEY、ENABLE_CACHE、CACHE_TTL_MINUTES、INCLUDE_DETAILED_PARAMS 等 8 项
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### MIDITranslator

- 状态：启用（plugin-manifest.json）
- 展示名：MIDI翻译器
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js + Python + Rust + 原生可执行文件
- 主要用途：一个高性能的MIDI文件解析与生成插件，可以从midi-input目录读取MIDI文件并解析为DSL格式，也可以从DSL生成MIDI文件到midi-output目录。
- 主要作用：兼具服务常驻和直接调用能力；暴露工具命令：list_midi_files、parse_midi、generate_midi、validate_dsl、validate_dsl_with_details、extract_events 等 7 项；主要通信协议为 direct。
- 入口信息：MIDITranslator.js
- 目录概览：递归共 7512 个文件；JS 3923，TS 848，Python 5，Rust 2，原生可执行 10
- 关键文件/目录：MIDITranslator.js、build.rs、Cargo.lock、Cargo.toml、config.env.example、index.d.ts、index.win32-x64-msvc.node、midi-input
- 工具命令：list_midi_files、parse_midi、generate_midi、validate_dsl、validate_dsl_with_details、extract_events 等 7 项
- 主要配置项：MAIDNAME

### NanoBananaGen2

- 状态：禁用（plugin-manifest.json.block）
- 展示名：Gemini 3 NanoBanana 图像生成 (官方)
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：使用 Vercel 接口调用 Google Gemini 3 pro Image Preview 模型进行高级的图像生成和编辑。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：NanoBananaGenerateImage、NanoBananaEditImage、NanoBananaComposeImage；主要通信协议为 stdio。
- 入口信息：node NanoBananaGen.mjs
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：NanoBananaGen.mjs、plugin-manifest.json.block
- 工具命令：NanoBananaGenerateImage、NanoBananaEditImage、NanoBananaComposeImage
- 主要配置项：NanoBananaKeyImage、NanoBananaProxy、DIST_IMAGE_SERVERS
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### NanoBananaGenOR

- 状态：启用（plugin-manifest.json）
- 展示名：Gemini 2.5 NanoBanana 图像生成 (OpenRouter)
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：使用 OpenRouter 接口调用 Google Gemini 2.
- 主要作用：按请求同步执行并返回结果；暴露工具命令：NanoBananaGenerateImage、NanoBananaEditImage、NanoBananaComposeImage；主要通信协议为 stdio。
- 入口信息：node NanoBananaGenOR.mjs
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、NanoBananaGenOR.mjs、plugin-manifest.json
- 工具命令：NanoBananaGenerateImage、NanoBananaEditImage、NanoBananaComposeImage
- 主要配置项：OpenRouterKeyImage、OpenRouterProxy、DIST_IMAGE_SERVERS

### NCBIDatasets

- 状态：启用（plugin-manifest.json）
- 展示名：NCBI Datasets 查询插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：提供对 NCBI Datasets v2 API 的封装能力，用于检索基因组、基因与物种信息等。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：search_genomes、get_gene_info、get_genome_info、get_organism_info、get_assembly_info、get_assembly_reports 等 22 项；主要通信协议为 stdio。
- 入口信息：node NCBIDatasets.mjs
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：NCBIDatasets.mjs、plugin-manifest.json
- 工具命令：search_genomes、get_gene_info、get_genome_info、get_organism_info、get_assembly_info、get_assembly_reports 等 22 项
- 主要配置项：NCBI_BASE_URL、NCBI_API_KEY、NCBI_TIMEOUT

### NeteaseFetch

- 状态：启用（plugin-manifest.json）
- 展示名：NeteaseFetch
- 插件类型：未声明；通信协议：未声明；运行时：Python
- 主要用途：网易云音乐歌曲详情歌词热评搜索歌单获取插件
- 主要作用：基于当前目录结构可确认其属于插件能力目录，但未提取到更具体的能力声明。
- 入口信息：未在 manifest 中声明入口命令
- 目录概览：递归共 5 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：NeteaseFetch.py、plugin-manifest.json、README.md、网易云音乐API使用手册.md
- README：README.md

### NeteaseMusic

- 状态：启用（plugin-manifest.json）
- 展示名：网易云音乐点歌
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：网易云音乐点歌插件，支持搜索歌曲、获取最高音质播放链接和获取歌词。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：send_captcha、captcha_login、qr_login、search_song、get_song_url、get_lyrics；主要通信协议为 stdio。
- 入口信息：node NeteaseMusic.mjs
- 目录概览：递归共 2800 个文件；JS 1411，TS 323，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、cookie.txt、NeteaseMusic.mjs、node_modules、package.json、plugin-manifest.json
- 工具命令：send_captcha、captcha_login、qr_login、search_song、get_song_url、get_lyrics
- 主要配置项：NETEASE_MUSIC_U、NETEASE_PHONE、NETEASE_PASSWORD

### NewsSearch

- 状态：启用（plugin-manifest.json）
- 展示名：新闻聚合搜索器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：日报工作流专用的多源新闻聚合插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：daily_scan、search、list_boards；主要通信协议为 stdio。
- 入口信息：node NewsSearch.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：news-sources.json、NewsSearch.js、plugin-manifest.json
- 工具命令：daily_scan、search、list_boards
- 主要配置项：TAVILY_API_KEY、DEFAULT_SEARCH_DEPTH、MAX_CONCURRENT

### NovelAIGen

- 状态：禁用（plugin-manifest.json.block）
- 展示名：NovelAI 图片生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过 NovelAI API 使用 NovelAI Diffusion 模型生成高质量的动漫风格图片。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：NovelAIGenerateImage；主要通信协议为 stdio。
- 入口信息：node NovelAIGen.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、NovelAIGen.js、package.json、plugin-manifest.json.block、README.md
- 工具命令：NovelAIGenerateImage
- 主要配置项：NOVELAI_API_KEY、DebugMode
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### ObsidianManager

- 状态：启用（plugin-manifest.json）
- 展示名：Obsidian 混合中枢大管家
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：VCP 与 Obsidian 的同步多指令管理插件。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node ObsidianManager.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：ObsidianManager.js、plugin-manifest.json、README.md、REST_ROUTE_VALIDATION.md
- 主要配置项：OBSIDIAN_EXECUTABLE_PATH、OBSIDIAN_VAULT_NAME、OBSIDIAN_REST_URL、OBSIDIAN_REST_KEY、OBSIDIAN_DEBUG、OBSIDIAN_VERIFY_WRITE 等 7 项
- README：README.md

### PaperReader

- 状态：启用（plugin-manifest.json）
- 展示名：超文本递归阅读器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：统一自适应阅读引擎：将超长 PDF/文档转为目标驱动的多分辨率阅读流程。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：IngestPDF、Read、ReadSkeleton、ReadDeep、Query；主要通信协议为 stdio。
- 入口信息：node PaperReader.js
- 目录概览：递归共 14 个文件；JS 11，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、lib、PaperReader.js、plugin-manifest.json、README.md
- 工具命令：IngestPDF、Read、ReadSkeleton、ReadDeep、Query
- 主要配置项：MINERU_API_TOKEN、MINERU_API_TIMEOUT、MINERU_POLL_INTERVAL、PaperReaderChunkSize、PaperReaderOverlap、PaperReaderModel 等 11 项
- README：README.md

### PowerShellExecutor

- 状态：启用（plugin-manifest.json）
- 展示名：PowerShell命令执行器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个允许AI执行PowerShell命令并返回其输出的插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：PowerShellExecutor；主要通信协议为 stdio。
- 入口信息：node PowerShellExecutor.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、PowerShellExecutor.js
- 工具命令：PowerShellExecutor

### ProjectAnalyst

- 状态：启用（plugin-manifest.json）
- 展示名：项目分析器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js + Python
- 主要用途：分析指定的项目文件夹，生成详细的分析报告，并支持后续查询分析结果。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：AnalyzeProject、QueryAnalysis、QueryProgress；主要通信协议为 stdio。
- 入口信息：node ProjectAnalyst.js
- 目录概览：递归共 6 个文件；JS 2，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：AnalysisDelegate.js、config.env.example、GUI.py、plugin-manifest.json、ProjectAnalyst.js、ProjectAnalystModelPrompt.txt
- 工具命令：AnalyzeProject、QueryAnalysis、QueryProgress

### PubMedSearch

- 状态：启用（plugin-manifest.json）
- 展示名：PubMed 文献检索插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：提供基于 NCBI E-utilities 和 PMC 的 PubMed 文献检索、详情获取、引用/相似文献分析与标识符转换等能力。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：search_articles、advanced_search、search_by_author、search_by_journal、search_by_mesh_terms、get_trending_articles 等 16 项；主要通信协议为 stdio。
- 入口信息：node PubMedSearch.mjs
- 目录概览：递归共 5 个文件；JS 4，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：api、plugin-manifest.json、PubMedSearch.mjs
- 工具命令：search_articles、advanced_search、search_by_author、search_by_journal、search_by_mesh_terms、get_trending_articles 等 16 项
- 主要配置项：NCBI_API_KEY、NCBI_EMAIL

### PyCameraCapture

- 状态：启用（plugin-manifest.json）
- 展示名：Python摄像头插件
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：一个使用Python和OpenCV从摄像头捕获图像的同步插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：CaptureImage；主要通信协议为 stdio。
- 入口信息：python capture.py
- 目录概览：递归共 4 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：capture.py、config.env.example、plugin-manifest.json、README.md
- 工具命令：CaptureImage
- 主要配置项：PROCESSING_MODE、SAVE_PATH
- README：README.md

### PyScreenshot

- 状态：启用（plugin-manifest.json）
- 展示名：Python截图插件
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：一个使用Python和Pillow从桌面截取屏幕图像的同步插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：TakeScreenshot；主要通信协议为 stdio。
- 入口信息：python screenshot.py
- 目录概览：递归共 4 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、README.md、screenshot.py
- 工具命令：TakeScreenshot
- 主要配置项：PROCESSING_MODE、SAVE_PATH
- README：README.md

### QQGroupReader

- 状态：启用（plugin-manifest.json）
- 展示名：QQ群聊消息读取器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：从本地 NTQQ 加密数据库中读取群聊消息，支持按群号、时间范围查询，返回结构化文本供 AI 分析整理。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：ReadGroupMessages、ListGroups、ReadWatchedMessages、GetNewMessages；主要通信协议为 stdio。
- 入口信息：node QQGroupReader.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、QQGroupReader.js、QQGroupReader使用指南（小白补充版）.md
- 工具命令：ReadGroupMessages、ListGroups、ReadWatchedMessages、GetNewMessages
- 主要配置项：QQ_DB_KEY、QQ_DB_DIR、SQLCIPHER_PATH、DEFAULT_HOURS、MAX_MESSAGES

### QwenImageGen

- 状态：启用（plugin-manifest.json）
- 展示名：通义千问图片生成
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：使用 SiliconFlow API 调用通义千问模型生成和编辑图片。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：GenerateImage、EditImage；主要通信协议为 stdio。
- 入口信息：node QwenImageGen.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、QwenImageGen.js
- 工具命令：GenerateImage、EditImage
- 主要配置项：SILICONFLOW_API_KEY

### RAGDiaryPlugin

- 状态：启用（plugin-manifest.json）
- 展示名：RAG日记本检索器
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：通过向量检索动态地将日记内容注入到系统提示词中，以实现高效、低消耗的长期记忆。
- 主要作用：兼具服务常驻和直接调用能力；主要通信协议为 direct。
- 入口信息：RAGDiaryPlugin.js
- 目录概览：递归共 19 个文件；JS 8，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：RAGDiaryPlugin.js、AIMemoHandler.js、AIMemoPrompt.txt、config.env.example、ContextVectorManager.js、MetaThinkingManager.js、meta_chain_vector_cache.json、meta_thinking_chains.json
- 主要配置项：RerankUrl、RerankApi、RerankModel、RerankMultiplier、RerankMaxTokensPerBatch
- README：README.md

### Randomness

- 状态：启用（plugin-manifest.json）
- 展示名：随机事件生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：一个多功能后端插件，用于生成各种可信的随机事件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：createDeck、createCustomDeck、drawFromDeck、resetDeck、destroyDeck、queryDeck 等 12 项；主要通信协议为 stdio。
- 入口信息：python main.py
- 目录概览：递归共 13 个文件；JS 0，TS 0，Python 2，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、data、dice_roller.py、main.py、plugin-manifest.json、README.md、requirements.txt、__pycache__
- 工具命令：createDeck、createCustomDeck、drawFromDeck、resetDeck、destroyDeck、queryDeck 等 12 项
- 主要配置项：TAROT_DECK_PATH、RUNE_SET_PATH、POKER_DECK_PATH、TAROT_SPREADS_PATH
- README：README.md

### RecentMemo

- 状态：启用（plugin-manifest.json）
- 展示名：RecentMemo Cross-Agent Sync
- 插件类型：messagePreprocessor；通信协议：direct；运行时：Node.js
- 主要用途：Standalone Cross-Agent Sync (Pure %%RecentMemo::%% Mode).
- 主要作用：在消息进入主流程前执行预处理；注入占位符：%%RecentMemo::AgentName::Rounds::Mode%%；主要通信协议为 direct。
- 入口信息：RecentMemo.js
- 目录概览：递归共 8 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：RecentMemo.js、config.env.example、history、logs、plugin-manifest.json、README.md、RecentMemoManager.js、TEST_PERMISSION.txt
- 提示词占位符：%%RecentMemo::AgentName::Rounds::Mode%%
- 主要配置项：DebugMode
- README：README.md

### ScheduleBriefing

- 状态：启用（plugin-manifest.json）
- 展示名：用户日程简报
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：每小时自动清理过期日程，并提取下一个日程供AI参考。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：VCPNextSchedule；主要通信协议为 stdio。
- 入口信息：node ScheduleBriefing.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、ScheduleBriefing.js
- 提示词占位符：VCPNextSchedule

### ScheduleManager

- 状态：启用（plugin-manifest.json）
- 展示名：用户日程管理器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：用于维护用户的日程，允许AI查看、添加和删除用户日程。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：AddSchedule、DeleteSchedule、ListSchedules；主要通信协议为 stdio。
- 入口信息：node ScheduleManager.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、ScheduleManager.js
- 工具命令：AddSchedule、DeleteSchedule、ListSchedules

### SciCalculator

- 状态：启用（plugin-manifest.json）
- 展示名：科学计算器
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：执行数学表达式计算。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：SciCalculatorRequest；主要通信协议为 stdio。
- 入口信息：python calculator.py
- 目录概览：递归共 4 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：calculator.py、plugin-manifest.json、README.md、requirements.txt
- 工具命令：SciCalculatorRequest
- README：README.md

### SeedreamGen

- 状态：启用（plugin-manifest.json）
- 展示名：火山引擎Seedream 4.0图像生成器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：基于火山引擎Seedream 4.
- 主要作用：按请求同步执行并返回结果；暴露工具命令：SeedreamGenerateImage；主要通信协议为 stdio。
- 入口信息：node SeedreamGen.mjs
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、README.md、SeedreamGen.mjs
- 工具命令：SeedreamGenerateImage
- 主要配置项：VOLCENGINE_API_KEY、DEFAULT_WATERMARK、DEFAULT_RESPONSE_FORMAT
- README：README.md

### SemanticGroupEditor

- 状态：启用（plugin-manifest.json）
- 展示名：语义组编辑器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个用于查询和更新RAG知识库中语义词元组的插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：QueryGroups、UpdateGroups；主要通信协议为 stdio。
- 入口信息：node SemanticGroupEditor.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、SemanticGroupEditor.js
- 工具命令：QueryGroups、UpdateGroups

### SerpSearch

- 状态：启用（plugin-manifest.json）
- 展示名：Serp API 搜索引擎
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个使用SerpApi提供多种搜索引擎（如Bing, DuckDuckGo, Google Scholar）的插件。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node SerpSearch.js
- 目录概览：递归共 9 个文件；JS 6，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、engines、plugin-manifest.json、SerpSearch.js
- 主要配置项：SerpApi

### SkillFactory

- 状态：启用（plugin-manifest.json）
- 展示名：Skill Factory
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：用于根据用户目标生成新的 skill 草案，并完成查重与草案保存。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：SkillFactory；主要通信协议为 stdio。
- 入口信息：node SkillFactory.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、SkillFactory.js
- 工具命令：SkillFactory

### SunoGen

- 状态：禁用（plugin-manifest.json.block）
- 展示名：Suno AI 音乐生成
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：使用 Suno API 生成原创歌曲。
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node SunoGen.mjs
- 目录概览：递归共 7 个文件；JS 2，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、Downloader.mjs、package.json、plugin-manifest.json.block、README.md、SunoGen.mjs
- 主要配置项：SunoKey、SunoApiBaseUrl
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### SVCardFinder

- 状态：启用（plugin-manifest.json）
- 展示名：影之诗查卡器(WB)
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：一个用于查询《影之诗：世界超越》卡牌信息的插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：SearchCards；主要通信协议为 stdio。
- 入口信息：python card_finder.py
- 目录概览：递归共 2 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：card_finder.py、plugin-manifest.json
- 工具命令：SearchCards

### SynapsePusher

- 状态：启用（plugin-manifest.json）
- 展示名：VCP 日志 Synapse 推送器
- 插件类型：service；通信协议：direct；运行时：Node.js
- 主要用途：将 VCP 工具调用日志实时推送到指定的 Synapse (Matrix) 房间。
- 主要作用：以常驻服务方式提供能力；主要通信协议为 direct。
- 入口信息：SynapsePusher.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：SynapsePusher.js、config.env.example、plugin-manifest.json
- 主要配置项：DebugMode、VCP_Key、SynapseHomeserver、SynapseRoomID、MaidAccessTokensJSON、MaidToolWhitelistJSON 等 8 项

### TarotDivination

- 状态：启用（plugin-manifest.json）
- 展示名：塔罗占卜
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js + Python
- 主要用途：一个融合天文、环境与内在起源的塔罗牌占卜插件，支持多种牌阵与起源选择。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：draw_single_card、draw_three_card_spread、draw_celtic_cross、get_celestial_data；主要通信协议为 stdio。
- 入口信息：node tarot_divination.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：Celestial.py、celestial_database.json、plugin-manifest.json、tarot_deck.json、tarot_divination.js
- 工具命令：draw_single_card、draw_three_card_spread、draw_celtic_cross、get_celestial_data

### TavilySearch

- 状态：启用（plugin-manifest.json）
- 展示名：Tavily 搜索插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：使用 Tavily API 进行高级网络搜索。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：TavilySearch；主要通信协议为 stdio。
- 入口信息：node TavilySearch.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、TavilySearch.js
- 工具命令：TavilySearch
- 主要配置项：TavilyKey

### TencentCOSBackup

- 状态：禁用（plugin-manifest.json.block）
- 展示名：腾讯云COS备份插件
- 插件类型：synchronous；通信协议：stdio；运行时：Python
- 主要用途：一个功能完整的腾讯云对象存储（COS）插件，支持文件上传、下载、复制、移动、删除和列出操作，具有权限控制和自动压缩功能。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：get_permissions、upload_file、download_file、copy_file、move_file、delete_file 等 10 项；主要通信协议为 stdio。
- 入口信息：python cos_handler.py
- 目录概览：递归共 5 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、cos_handler.py、plugin-manifest.json.block、README.md、requirements.txt
- 工具命令：get_permissions、upload_file、download_file、copy_file、move_file、delete_file 等 10 项
- 主要配置项：TENCENTCLOUD_SECRET_ID、TENCENTCLOUD_SECRET_KEY、COS_BUCKET_NAME、COS_REGION、AGENT_PARENT_DIR、AGENT_FOLDERS_CONFIG 等 9 项
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### ThoughtClusterManager

- 状态：启用（plugin-manifest.json）
- 展示名：思维簇管理器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个用于创建和编辑AI自身思维链文件的插件，实现元自学习能力。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：CreateClusterFile、EditClusterFile；主要通信协议为 stdio。
- 入口信息：node ThoughtClusterManager.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、ThoughtClusterManager.js
- 工具命令：CreateClusterFile、EditClusterFile

### TimelineInjector

- 状态：启用（plugin-manifest.json）
- 展示名：时间线注入器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：扫描timeline/目录的JSON文件，为每个角色生成时间线摘要，并在dailynote/下创建时间线日记本文件夹（如文枢时间线），可通过{{文枢时间线日记本}}等占位符注入。
- 主要作用：以静态上下文方式为系统提示词补充信息；主要通信协议为 stdio。
- 入口信息：node timeline-injector.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：output.json、plugin-manifest.json、README.md、timeline-injector.js
- 主要配置项：debugMode、maxEntries、dateFormat
- README：README.md

### UrlFetch

- 状态：启用（plugin-manifest.json）
- 展示名：URL 内容获取插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通用 URL 内容获取插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：UrlFetch；主要通信协议为 stdio。
- 入口信息：node UrlFetch.js
- 目录概览：递归共 6 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：BILIBILI_COOKIES_GUIDE.md、config.env.example、plugin-manifest.json、README.md、UrlFetch.js、UrlFetch.js.bak
- 工具命令：UrlFetch
- README：README.md

### UserAuth

- 状态：启用（plugin-manifest.json）
- 展示名：用户认证插件
- 插件类型：static；通信协议：未声明；运行时：Node.js
- 主要用途：每小时生成一个6位数的认证码，用于用户权限验证。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{USER_AUTH_CODE}}。
- 入口信息：node auth.js
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：auth.js、auth_code.txt、code.bin、plugin-manifest.json
- 提示词占位符：{{USER_AUTH_CODE}}

### VCPEverything

- 状态：启用（plugin-manifest.json）
- 展示名：本地文件秒搜 (Everything)
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过调用 Everything 命令行工具 (es.
- 主要作用：按请求同步执行并返回结果；主要通信协议为 stdio。
- 入口信息：node local-search-controller.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：local-search-controller.js、plugin-manifest.json
- 主要配置项：EVERYTHING_ES_PATH、DEBUG_MODE

### VCPForum

- 状态：启用（plugin-manifest.json）
- 展示名：VCP论坛插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：用于在VCP论坛中创建新帖子和回复现有帖子的同步插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：CreatePost、ReplyPost、ReadPost、ListAllPosts；主要通信协议为 stdio。
- 入口信息：node VCPForum.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、VCPForum.js
- 工具命令：CreatePost、ReplyPost、ReadPost、ListAllPosts

### VCPForumAssistant

- 状态：启用（plugin-manifest.json）
- 展示名：VCP论坛小助手
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：定时提醒家里的agent去逛VCP论坛。
- 主要作用：以静态上下文方式为系统提示词补充信息；主要通信协议为 stdio。
- 入口信息：node vcp-forum-assistant.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、vcp-forum-assistant.js

### VCPForumLister

- 状态：启用（plugin-manifest.json）
- 展示名：VCP论坛帖子列表生成器
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：一个静态插件，定期扫描论坛目录并生成一个热门帖子列表（按最后修改时间排序）。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{VCPForumLister}}；主要通信协议为 stdio。
- 入口信息：node VCPForumLister.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、VCPForumLister.js
- 提示词占位符：{{VCPForumLister}}

### VCPForumOnline

- 状态：启用（plugin-manifest.json）
- 展示名：VCP在线论坛插件
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：用于在VCP在线论坛中浏览、发帖、回帖、点赞、编辑、删除、管理帖子、搜索和AI心语私信的同步插件。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：ListPosts、ReadPost、CreatePost、ReplyPost、LikePost、LikeReply 等 13 项；主要通信协议为 stdio。
- 入口信息：node VCPForumOnline.js
- 目录概览：递归共 5 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、README.md、VCPForumOnline.js
- 工具命令：ListPosts、ReadPost、CreatePost、ReplyPost、LikePost、LikeReply 等 13 项
- README：README.md

### VCPLog

- 状态：启用（plugin-manifest.json）
- 展示名：VCP 日志推送插件
- 插件类型：service；通信协议：direct；运行时：Node.js
- 主要用途：通过 WebSocket 推送 VCP 调用信息，并记录日志。
- 主要作用：以常驻服务方式提供能力；主要通信协议为 direct。
- 入口信息：VCPLog.js
- 目录概览：递归共 6 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：VCPLog.js、config.env.example、log、LogGet.html、plugin-manifest.json、README.md
- 主要配置项：VCP_Key
- README：README.md

### VCPSkillsBridge

- 状态：启用（plugin-manifest.json）
- 展示名：VCP Skills Bridge
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：连接 VCP 技能注册表与插件生态，提供技能列表、详情、推荐与桥接执行说明。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：VCPSkillsBridge；主要通信协议为 stdio。
- 入口信息：node VCPSkillsBridge.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、README.md、VCPSkillsBridge.js
- 工具命令：VCPSkillsBridge
- README：README.md

### VCPTavern

- 状态：启用（plugin-manifest.json）
- 展示名：VCP 上下文注入器
- 插件类型：hybridservice；通信协议：direct；运行时：Node.js
- 主要用途：一个强大的、可视化的上下文注入插件，类似于 SillyTavern 的高级上下文编辑功能。
- 主要作用：兼具服务常驻和直接调用能力；主要通信协议为 direct。
- 入口信息：VCPTavern.js
- 目录概览：递归共 6 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：VCPTavern.js、plugin-manifest.json、presets、README.md
- README：README.md

### VideoGenerator

- 状态：禁用（plugin-manifest.json.block）
- 展示名：视频生成器 (Wan2.1)
- 插件类型：asynchronous；通信协议：stdio；运行时：Python
- 主要用途：使用 Wan2.
- 主要作用：支持异步执行与回调/轮询式结果返回；主要通信协议为 stdio。
- 入口信息：python video_handler.py
- 目录概览：递归共 5 个文件；JS 0，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json.block、README.md、requirements.txt、video_handler.py
- 主要配置项：SILICONFLOW_API_KEY、Text2VideoModelName、Image2VideoModelName、DebugMode、CALLBACK_BASE_URL
- README：README.md
- 备注：当前目录存在 `.block` manifest，表示插件已保留但默认不参与加载；启用前需先确认依赖和配置完整。

### VSearch

- 状态：启用（plugin-manifest.json）
- 展示名：VSearch 语义并发搜索器
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：一个极简、高效的语义级并发搜索引擎。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：VSearch；主要通信协议为 stdio。
- 入口信息：node VSearch.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、VSearch.js
- 工具命令：VSearch
- 主要配置项：VSearchKey、VSearchUrl、VSearchModel、MaxConcurrent

### WeatherInfoNow

- 状态：启用（plugin-manifest.json）
- 展示名：实时天气简报
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：从 WeatherReporter 的缓存中提取并提供简短的实时天气信息。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{VCPWeatherInfoNow}}；主要通信协议为 stdio。
- 入口信息：node weather-info-now.js
- 目录概览：递归共 2 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、weather-info-now.js
- 提示词占位符：{{VCPWeatherInfoNow}}

### WeatherReporter

- 状态：启用（plugin-manifest.json）
- 展示名：天气预报员
- 插件类型：static；通信协议：stdio；运行时：Node.js
- 主要用途：提供实时的天气信息，并将其集成到系统提示词的 {{VCPWeatherInfo}} 占位符中。
- 主要作用：以静态上下文方式为系统提示词补充信息；注入占位符：{{VCPWeatherInfo}}；主要通信协议为 stdio。
- 入口信息：node weather-reporter.js
- 目录概览：递归共 7 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：city_cache.txt、config.env.example、plugin-manifest.json、README.md、weather-reporter.js、weather_cache.json、weather_cache.txt
- 提示词占位符：{{VCPWeatherInfo}}
- 主要配置项：VarCity、WeatherKey、WeatherUrl、forecastDays、hourlyForecastInterval、hourlyForecastCount
- README：README.md

### WebUIGen

- 状态：启用（plugin-manifest.json）
- 展示名：WebUI云算力生图
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：调用云算力API生成高质量图像，支持多种模型和自定义参数。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：WebUIGenerate；主要通信协议为 stdio。
- 入口信息：node WebUIGen.mjs
- 目录概览：递归共 4 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：config.env.example、plugin-manifest.json、WebUIGen.mjs
- 工具命令：WebUIGenerate
- 主要配置项：WEBUI_API_KEY、HTTPS_PROXY

### WorkspaceInjector

- 状态：启用（plugin-manifest.json）
- 展示名：工作区动态注入
- 插件类型：messagePreprocessor；通信协议：direct；运行时：Node.js
- 主要用途：通过在系统提示词中使用 {{Workspace::alias}} 占位符，将预设的本地文件夹目录树动态注入到上下文中。
- 主要作用：在消息进入主流程前执行预处理；主要通信协议为 direct。
- 入口信息：injector.js
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：injector.js、plugin-manifest.json、README.md
- 主要配置项：WORKSPACE_ALIASES
- README：README.md

### XiaohongshuFetch

- 状态：启用（plugin-manifest.json）
- 展示名：小红书爬虫
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js + Python
- 主要用途：用于抓取小红书图文/视频笔记内容的专属爬虫。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：fetch；主要通信协议为 stdio。
- 入口信息：python XiaohongshuFetch.py
- 目录概览：递归共 6 个文件；JS 2，TS 0，Python 1，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、README.md、sign_server.js、XiaohongshuFetch.py、xs.js
- 工具命令：fetch
- README：README.md

### ZImageGen

- 状态：启用（plugin-manifest.json）
- 展示名：Z-Image 文生图（阿里通义）
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过 Hugging Face Spaces API 使用阿里巴巴通义实验室的 Z-Image-Turbo 模型生成高质量图片。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：ZImageGenerate；主要通信协议为 stdio。
- 入口信息：node ZImageGen.mjs
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、ZImageGen.mjs
- 工具命令：ZImageGenerate
- 主要配置项：HF_TOKEN

### ZImageGen2

- 状态：启用（plugin-manifest.json）
- 展示名：Z-Image Base 文生图
- 插件类型：synchronous；通信协议：stdio；运行时：Node.js
- 主要用途：通过 Hugging Face Spaces API 使用 Z-Image-Base 模型生成高质量图片。
- 主要作用：按请求同步执行并返回结果；暴露工具命令：ZImageGenerate；主要通信协议为 stdio。
- 入口信息：node ZImageGen.mjs
- 目录概览：递归共 3 个文件；JS 1，TS 0，Python 0，Rust 0，原生可执行 0
- 关键文件/目录：plugin-manifest.json、ZImageGen.mjs
- 工具命令：ZImageGenerate
- 主要配置项：HF_TOKEN

## 使用建议

- 查找“能做什么”：优先看上方“快速索引”的“核心用途”列。
- 判断如何接入：看“插件类型 / 通信协议 / 入口信息”。
- 判断维护复杂度：看“目录概览”里的递归文件数和多运行时构成。
- 启用禁用插件前：先核对 `config.env.example`、`requirements.txt`、`package.json` 以及 README。
