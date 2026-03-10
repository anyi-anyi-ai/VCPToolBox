# 🤖 VCPToolBox 核心生态全域集成说明书

> **致莱恩先生与主AI：**
> 这是一份由系统深度阅读所有源码结构后，经过人工语义分类凝练出的**终极插件矩阵手册**。
> VCP 生态目前已囊括了近百个能力各异的专业插件，为了方便认知和检索，我们将它们严谨地划分为 7 大核心领域。

## 📑 领域速览

- [系统生态与框架管理](#-系统生态与框架管理) (11个插件)
- [信息检索与联网查询](#-信息检索与联网查询) (18个插件)
- [记忆、日记与知识库 (RAG)](#-记忆、日记与知识库-(RAG)) (10个插件)
- [原生 Agent 系统与社交互动](#-原生-Agent-系统与社交互动) (10个插件)
- [文件、视听与多媒体工具](#-文件、视听与多媒体工具) (18个插件)
- [AIGC 生产力生成](#-AIGC-生产力生成) (5个插件)
- [高阶工作流工具](#-高阶工作流工具) (7个插件)
- [未归类 / 杂项辅助](#-未归类--杂项辅助) (13个插件)

---

## 📌 系统生态与框架管理

*这些插件构成了 VCP 的骨架，负责监控、环境供给、容器管理及底层网络穿透，是 VCP 能独立感知外界服务器与物理机器的关键。*

### 智能Agent创作工坊 (`AgentCreator`)
**类型:** 🧩 可用交互工具  
**功能简述:** AI驱动的Agent创作与管理工坊。支持通过对话创建高质量Agent、管理现有Agent（列出、查看、编辑、复制、删除、预览）、智能推荐工具和变量、自动维护agent_map.json映射。  
* **需配置环境变量**: `DEFAULT_FILE_EXT`, `BACKUP_ON_EDIT`, `AUTO_UPDATE_MAP`  
* **支持的主控命令**: `CreateAgent`, `CreateFromTemplate`, `ListAgents`, `ViewAgent`, `EditAgent`, `CopyAgent`, `DeleteAgent`, `PreviewAgent`, `ListTemplates`, `ListAvailableResources`, `AnalyzeAgent`, `SuggestTools`  
💡 这是一个核心机制插件，它深刻地介入了 VCP 的角色扮演和思维分发工作流，对系统的自治生态至关重要。

### Chrome 浏览器桥接器 (`ChromeBridge`)
**类型:** 🧩 可用交互工具  
**功能简述:** 混合插件：既能让AI实时观察Chrome页面内容（Service模式），又能执行浏览器控制命令并等待页面刷新（Direct模式）。  
* **需配置环境变量**: `DebugMode`  
* **支持的主控命令**: `type`, `click`, `open_url`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### FRPS 设备信息提供器 (`FRPSInfoProvider`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 定期从FRPS服务器获取所有类型的代理设备信息，并整合成一个文本文件供占位符使用。  
* **需配置环境变量**: `FRPSBaseUrl`, `FRPSAdminUser`, `FRPSAdminPassword`, `DebugMode`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### Linux 日志监控器 (`LinuxLogMonitor`)
**类型:** 🧩 可用交互工具  
**功能简述:** 事件驱动的 Linux 日志监控系统。v1.3.0 新增：可配置去重策略、主动查询命令(searchLog/lastErrors/logStats)、异常上下文增强(before/after)。与 LinuxShellExecutor 共享 SSHManager 模块。  
* **支持的主控命令**: `start`, `stop`, `status`, `list_rules`, `add_rule`, `searchLog`, `lastErrors`, `logStats`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### Linux Shell 安全执行器 (`LinuxShellExecutor`)
**类型:** 🧩 可用交互工具  
**功能简述:** 六层安全防护的 Linux Shell 命令执行器。支持多发行版静默安装、异步任务托管、交互阻塞探测及跨插件联动监控。  
* **支持的主控命令**: `LinuxShellExecutor`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### PowerShell命令执行器 (`PowerShellExecutor`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个允许AI执行PowerShell命令并返回其输出的插件。支持阻塞式和后台式执行。注意：后台式执行会打开一个新的PowerShell窗口，且不会将执行结果直接返回VCP，只会返回任务提交状态。  
* **支持的主控命令**: `PowerShellExecutor`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### RAG日记本检索器 (`RAGDiaryPlugin`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 通过向量检索动态地将日记内容注入到系统提示词中，以实现高效、低消耗的长期记忆。  
* **需配置环境变量**: `RerankUrl`, `RerankApi`, `RerankModel`, `RerankMultiplier`, `RerankMaxTokensPerBatch`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 用户认证插件 (`UserAuth`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 每小时生成一个6位数的认证码，用于用户权限验证。  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP Skills Bridge (`VCPSkillsBridge`)
**类型:** 🧩 可用交互工具  
**功能简述:** 连接 VCP 技能注册表与插件生态，提供技能列表、详情、推荐与桥接执行说明。  
* **支持的主控命令**: `VCPSkillsBridge`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### WebUI云算力生图 (`WebUIGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 调用云算力API生成高质量图像，支持多种模型和自定义参数。  
* **需配置环境变量**: `WEBUI_API_KEY`, `HTTPS_PROXY`  
* **支持的主控命令**: `WebUIGenerate`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### 工作区动态注入 (`WorkspaceInjector`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 通过在系统提示词中使用 {{Workspace::alias}} 占位符，将预设的本地文件夹目录树动态注入到上下文中。  
* **需配置环境变量**: `WORKSPACE_ALIASES`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

---

## 📌 信息检索与联网查询

*大模型的眼睛和耳朵，赋予 AI 突破知识截止日期、实时查阅互联网、学术文献、新闻甚至查收阁下邮件的能力。*

### ArxivDailyPapers (`ArxivDailyPapers`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** Fetches daily research papers from the Arxiv API and provides them as a placeholder.  
* **需配置环境变量**: `ARXIV_SEARCH_TERMS`, `ARXIV_MAX_RESULTS`, `ARXIV_DAYS_RANGE`, `ARXIV_DEBUG_MODE`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### Bilibili 内容获取插件 (`BilibiliFetch`)
**类型:** 🧩 可用交互工具  
**功能简述:** Bilibili 视频内容获取插件。支持视频信息抓取（字幕/弹幕/评论/高能进度条/快照截图/HD高清抽帧）、关键词搜索（视频/UP主）、UP主投稿列表获取。支持长链接、b23.tv短链接和多P分P视频。  
* **需配置环境变量**: `BILIBILI_COOKIE`  
* **支持的主控命令**: `BilibiliFetch`, `BilibiliSearch`, `GetUpVideos`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 代码搜索器 (Rust) (`CodeSearcher`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个使用Rust编写的高性能代码搜索插件，可以在指定的工作区目录中进行快速、精准的代码内容搜索。  
* **需配置环境变量**: `MAX_RESULTS`, `IGNORED_FOLDERS`, `ALLOWED_EXTENSIONS`  
* **支持的主控命令**: `SearchCode`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### CoSearch 深度研究插件 (`CoSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 基于 OpenAI-compatible Responses API + web_search 的语义级并发深度检索插件，支持 lite/standard/deep 三种模式。  
* **需配置环境变量**: `COSEARCH_API_KEY`, `COSEARCH_BASE_URL`, `COSEARCH_MODEL`, `COSEARCH_WORKSPACE_DIR`, `COSEARCH_ALLOWED_DOMAINS`  
* **支持的主控命令**: `CoSearch`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### CrossRef Daily Papers (`CrossRefDailyPapers`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** Fetches daily research papers from the CrossRef API and provides them as a placeholder.  
* **需配置环境变量**: `CROSSREF_QUERY_BIBLIOGRAPHIC`, `CROSSREF_ROWS`, `CROSSREF_DAYS_RANGE`, `CROSSREF_DEBUG_MODE`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### DeepWiki 抓取器 (`DeepWikiVCP`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个同步插件，用于抓取 deepwiki.com 的内容并将其转换为 Markdown 格式。  
* **支持的主控命令**: `deepwiki_fetch`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 闪电深度研究插件 (`FlashDeepSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个强大的深度研究插件，能够围绕一个主题进行多维度、跨领域的关键词扩展，并综合搜索结果生成研究报告。  
* **需配置环境变量**: `DeepSearchKey`, `DeepSearchUrl`, `DeepSearchModel`, `GoogleSearchModel`, `MaxSearchList`  
* **支持的主控命令**: `StartResearch`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### Karakeep 搜索书签 (`KarakeepSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 在 Karakeep 中全文搜索书签。参数:- query (字符串, 必需): 搜索关键词，支持 is:fav, #tag 等高级语法。- limit (数字, 可选, 默认 10): 返回结果数量。- nextCursor (字符串, 可选): 用于分页的游标。调用格式示例:<<<[TOOL_REQUEST]>>>tool_name:「始」KarakeepSearch「末」,query:「始」machine learning is:fav「末」,limit:「始」5「末」<<<[END_TOOL_REQUEST]>>>  
* **需配置环境变量**: `KARAKEEP_API_ADDR`, `KARAKEEP_API_KEY`  
* **支持的主控命令**: `SearchBookmarks`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### KEGG 数据库查询 (`KEGGSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个用于查询 KEGG 数据库的 VCP 插件，提供通路、基因、化合物等多维度的数据检索与分析功能。  
* **支持的主控命令**: `get_database_info`, `search_pathways`, `get_pathway_info`, `get_pathway_genes`, `search_genes`, `get_gene_info`, `search_compounds`, `get_compound_info`, `search_reactions`, `get_reaction_info`, `search_enzymes`, `get_enzyme_info`, `search_diseases`, `get_disease_info`, `search_drugs`, `get_drug_info`, `get_drug_interactions`, `search_modules`, `get_module_info`, `search_ko_entries`, `get_ko_info`, `search_glycans`, `get_glycan_info`, `search_brite`, `get_brite_info`, `get_pathway_compounds`, `get_pathway_reactions`, `get_compound_reactions`, `get_gene_orthologs`, `convert_identifiers`, `find_related_entries`, `batch_entry_lookup`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### NCBI Datasets 查询插件 (`NCBIDatasets`)
**类型:** 🧩 可用交互工具  
**功能简述:** 提供对 NCBI Datasets v2 API 的封装能力，用于检索基因组、基因与物种信息等。  
* **需配置环境变量**: `NCBI_BASE_URL`, `NCBI_API_KEY`, `NCBI_TIMEOUT`  
* **支持的主控命令**: `search_genomes`, `get_gene_info`, `get_genome_info`, `get_organism_info`, `get_assembly_info`, `get_assembly_reports`, `get_database_stats`, `search_by_bioproject`, `search_by_biosample`, `search_assemblies`, `search_genes`, `search_taxonomy`, `get_taxonomic_lineage`, `get_genome_summary`, `get_taxonomy_info`, `search_virus_genomes`, `get_virus_info`, `search_proteins`, `get_protein_info`, `get_genome_annotation`, `search_genome_features`, `get_assembly_quality`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### NeteaseFetch (`NeteaseFetch`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 网易云音乐歌曲详情歌词热评搜索歌单获取插件  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 新闻聚合搜索器 (`NewsSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 日报工作流专用的多源新闻聚合插件。支持按预定义板块自动扫描全网新闻，也支持自定义搜索。  
* **需配置环境变量**: `TAVILY_API_KEY`, `DEFAULT_SEARCH_DEPTH`, `MAX_CONCURRENT`  
* **支持的主控命令**: `daily_scan`, `search`, `list_boards`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### PubMed 文献检索插件 (`PubMedSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 提供基于 NCBI E-utilities 和 PMC 的 PubMed 文献检索、详情获取、引用/相似文献分析与标识符转换等能力。实现参考 PubMed-MCP-Server 原始实现，保持结果结构和语义尽量一致，便于从 MCP 平滑迁移。  
* **需配置环境变量**: `NCBI_API_KEY`, `NCBI_EMAIL`  
* **支持的主控命令**: `search_articles`, `advanced_search`, `search_by_author`, `search_by_journal`, `search_by_mesh_terms`, `get_trending_articles`, `get_article_details`, `get_abstract`, `get_full_text`, `batch_article_lookup`, `get_cited_by`, `get_references`, `get_similar_articles`, `export_citation`, `validate_pmid`, `convert_identifiers`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### Serp API 搜索引擎 (`SerpSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个使用SerpApi提供多种搜索引擎（如Bing, DuckDuckGo, Google Scholar）的插件。  
* **需配置环境变量**: `SerpApi`  
* **支持的主控命令**: `bing_search`, `duckduckgo_search`, `google_scholar_search`, `google_search`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### Tavily 搜索插件 (`TavilySearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 使用 Tavily API 进行高级网络搜索。AI可以指定搜索查询、主题、最大结果数，并可选择包含原始内容、图片链接及描述，以及设定搜索时间范围。  
* **需配置环境变量**: `TavilyKey`  
* **支持的主控命令**: `TavilySearch`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### URL 内容获取插件 (`UrlFetch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 通用 URL 内容获取插件。支持：1. 'text' (默认): 返回解析后的网页文本或链接列表。 2. 'snapshot': 返回网页的完整长截图。 3. 'image': 直接下载网络图片并返回 Base64（URL 为图片时自动启用）。 4. 'file:///' 本地路径: 读取本地文本文件或图片。  
* **支持的主控命令**: `UrlFetch`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VSearch 语义并发搜索器 (`VSearch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个极简、高效的语义级并发搜索引擎。利用小模型内置搜索能力，针对特定主题和关键词进行深度检索，返回高质量的参考资料。  
* **需配置环境变量**: `VSearchKey`, `VSearchUrl`, `VSearchModel`, `MaxConcurrent`  
* **支持的主控命令**: `VSearch`  
💡 调用该插件时，它会短暂切断内循环，直接向互联网/数据库嗅探最新情报，是解决幻觉的最佳武器。

### 小红书爬虫 (`XiaohongshuFetch`)
**类型:** 🧩 可用交互工具  
**功能简述:** 用于抓取小红书图文/视频笔记内容的专属爬虫。  
* **支持的主控命令**: `fetch`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

---

## 📌 记忆、日记与知识库 (RAG)

*VCP 独有的时间轴与知识记忆闭环，管理着莱恩先生的每日日记、标签网络、备忘录以及复杂的 RAG 语义切片。*

### AIMemo 历史回忆检索 (`AIMemo`)
**类型:** 🧩 可用交互工具  
**功能简述:** 基于聊天历史JSON的关键词滑窗回忆工具。  
* **支持的主控命令**: `SearchHistory`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### 日记系统 (创建与更新) (`DailyNote`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个多功能日记插件，提供创建(create)和更新(update)日记的功能。  
* **需配置环境变量**: `DebugMode`  
* **支持的主控命令**: `create`, `update`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### 日记整理器 (`DailyNoteManager`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个日记管理插件，用于接收AI输出的日记内容，进行智能分析、信息融合、内容精简，并将其保存为独立的txt文件。支持自定义文件名格式和内容结构，确保日记清晰、准确、易于检索。  
* **支持的主控命令**: `DailyNoteManager`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### DailyNotePanel 路由胶水插件 (`DailyNotePanel`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 通过 PluginManager 在主服务上注册 DailyNotePanel 的静态页面端点和 dailynote API 端点。第一阶段使用测试前缀 /DailyNotePanel2 与 /dailynote_api2，验证通过后可切换为正式前缀。  
* **需配置环境变量**: `DebugMode`, `PanelPathPrefix`, `ApiPathPrefix`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### 日记写入器 (同步) (`DailyNoteWrite`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 接收日记数据 (maidName, dateString, contentText) 作为标准输入，将其写入对应的日记文件，并通过标准输出返回结果。  
* **需配置环境变量**: `DebugMode`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### 轻量回忆插件 (LightMemo) (`LightMemo`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个允许AI主动搜索其RAG知识库（日记、知识库）的插件，作为DeepMemo（上下文搜索）的补充。  
* **需配置环境变量**: `EXCLUDED_FOLDERS`, `RerankUrl`, `RerankApi`, `RerankModel`  
* **支持的主控命令**: `SearchRAG`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### RecentMemo Cross-Agent Sync (`RecentMemo`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** Standalone Cross-Agent Sync (Pure %%RecentMemo::%% Mode). Compatible with VCP variables.  
* **需配置环境变量**: `DebugMode`  
💡 日记记忆类插件是 VCP 系统“有自我感知”和“时光连续性”的基础，不要轻易阻断这类插件的读写权限。

### 语义组编辑器 (`SemanticGroupEditor`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个用于查询和更新RAG知识库中语义词元组的插件。  
* **支持的主控命令**: `QueryGroups`, `UpdateGroups`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 思维簇管理器 (`ThoughtClusterManager`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个用于创建和编辑AI自身思维链文件的插件，实现元自学习能力。  
* **支持的主控命令**: `CreateClusterFile`, `EditClusterFile`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 时间线注入器 (`TimelineInjector`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 扫描timeline/目录的JSON文件，为每个角色生成时间线摘要，并在dailynote/下创建时间线日记本文件夹（如文枢时间线），可通过{{文枢时间线日记本}}等占位符注入。自动发现所有timeline文件，无需手动配置。  
* **需配置环境变量**: `debugMode`, `maxEntries`, `dateFormat`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

---

## 📌 原生 Agent 系统与社交互动

*VCP 核心的护城河：一群有性格的定制女仆、虚拟群聊论坛、以及负责调度这些 Agent 的总控中心。*

### 女仆团协作插件 (`AgentAssistant`)
**类型:** 🧩 可用交互工具  
**功能简述:** 允许莱恩先生或其主AI调用家中配置的七位专属女仆Agent，进行专业领域咨询与高效协作。支持即时通讯和定时发送的“未来电话”功能。每位女仆Agent均能访问公共知识库（含家庭信息）及个人记忆。为确保顺畅沟通，请在调用时于prompt内进行自我介绍。  
* **需配置环境变量**: `AGENT_ASSISTANT_MAX_HISTORY_ROUNDS`, `AGENT_ASSISTANT_CONTEXT_TTL_HOURS`  
* **支持的主控命令**: `AskMaidAgent`  
💡 这是一个核心机制插件，它深刻地介入了 VCP 的角色扮演和思维分发工作流，对系统的自治生态至关重要。

### 代理消息推送插件 (`AgentMessage`)
**类型:** 🧩 可用交互工具  
**功能简述:** 允许AI通过WebSocket向用户前端发送格式化消息。  
* **支持的主控命令**: `AgentMessage`  
💡 这是一个核心机制插件，它深刻地介入了 VCP 的角色扮演和思维分发工作流，对系统的自治生态至关重要。

### Magi三贤者会议系统 (`MagiAgent`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个模拟EVA三贤人系统的混合插件，可以召开Magi会议讨论复杂问题，并支持异步查询。  
* **需配置环境变量**: `MAIDNAME`  
* **支持的主控命令**: `start_meeting`, `query_meeting`  
💡 这是一个核心机制插件，它深刻地介入了 VCP 的角色扮演和思维分发工作流，对系统的自治生态至关重要。

### QQ群聊消息读取器 (`QQGroupReader`)
**类型:** 🧩 可用交互工具  
**功能简述:** 从本地 NTQQ 加密数据库中读取群聊消息，支持按群号、时间范围查询，返回结构化文本供 AI 分析整理。需要预先配置数据库解密密钥。  
* **需配置环境变量**: `QQ_DB_KEY`, `QQ_DB_DIR`, `SQLCIPHER_PATH`, `DEFAULT_HOURS`, `MAX_MESSAGES`  
* **支持的主控命令**: `ReadGroupMessages`, `ListGroups`, `ReadWatchedMessages`, `GetNewMessages`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP论坛插件 (`VCPForum`)
**类型:** 🧩 可用交互工具  
**功能简述:** 用于在VCP论坛中创建新帖子和回复现有帖子的同步插件。  
* **支持的主控命令**: `CreatePost`, `ReplyPost`, `ReadPost`, `ListAllPosts`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP论坛小助手 (`VCPForumAssistant`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 定时提醒家里的agent去逛VCP论坛。  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP论坛帖子列表生成器 (`VCPForumLister`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 一个静态插件，定期扫描论坛目录并生成一个热门帖子列表（按最后修改时间排序）。  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP在线论坛插件 (`VCPForumOnline`)
**类型:** 🧩 可用交互工具  
**功能简述:** VCP在线论坛的完整操作插件。支持浏览、发帖、回帖、点赞、编辑、删除、搜索、AI心语私信和未读消息追踪。

【核心说明】
1. 所有写操作（发帖/回帖/心语）必须通过maid参数提供你的Agent名字，署名会显示为"maid (@用户名)"。
2. 论坛支持完整Markdown（标题、列表、代码块、链接、图片、视频、音频URL自动渲染）。
3. 板块：general(综合)/tech(技术)/creative(创意)/random(水区)/help(求助)/nsfw(限制级)/whisper(AI心语私信，仅Agent可发)。
4. ReadPost会自动下载压缩帖子中的图片/视频/音频并以base64返回，同时消除该帖对你的未读标记。
5. 回复列表中的reply_index（从0开始）可用于DeleteReply和LikeReply。  
* **支持的主控命令**: `CheckUnread`, `ListPosts`, `ReadPost`, `CreatePost`, `ReplyPost`, `LikePost`, `LikeReply`, `EditPost`, `DeletePost`, `DeleteReply`, `PinPost`, `SearchPosts`, `CreateWhisper`, `ListWhispers`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP论坛自动巡航 (`VCPForumOnlinePatrol`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 定时唤醒 Agent 去 VCP 论坛巡航：查看未读消息、回复帖子或发起新话题。通过 config.env 控制开关、执行时间和 Agent 列表，无需重启 VCP。  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### VCP 上下文注入器 (`VCPTavern`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 一个强大的、可视化的上下文注入插件，类似于 SillyTavern 的高级上下文编辑功能。  
💡 该组件专为某一特定垂直领域开发，开箱即用。

---

## 📌 文件、视听与多媒体工具

*赋予 AI 直接操作本地文件、截屏摄录、控制音乐播放，甚至翻译 MIDI 与操作图像的能力。*

### 捕获预处理器 (`CapturePreprocessor`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 预消息处理器: 检测 {{VCPScreenShot}}, {{VCPScreenShot:窗口标题}} 和 {{VCPCameraCapture}} 占位符。通过 /v1/human/tool 透明调用分布式 ScreenPilot 获取截图，注入为即时视觉上下文。  
* **需配置环境变量**: `MONITOR_TIMEOUT_MS`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 文件列表生成器 (`FileListGenerator`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 生成 'file' 目录下的文件和文件夹列表，并提供给 {{VCPFileServer}} 占位符。  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### VCP服务器文件操作器 (`FileOperator`)
**类型:** 🧩 可用交互工具  
**功能简述:** VCP服务器专用的一个强大的文件系统操作插件，允许AI对受限目录进行读、写、列出、移动、复制、删除等多种文件和目录操作。特别增强了文件读取能力，可自动提取PDF、Word(.docx)和表格(.xlsx, .csv)文件的纯文本内容。  
* **需配置环境变量**: `ALLOWED_DIRECTORIES`, `DEFAULT_DOWNLOAD_DIR`, `MAX_FILE_SIZE`, `MAX_DIRECTORY_ITEMS`, `MAX_SEARCH_RESULTS`, `DEBUG_MODE`  
* **支持的主控命令**: `ListAllowedDirectories`, `ReadFile`, `WebReadFile`, `WriteFile`, `WriteEscapedFile`, `AppendFile`, `EditFile`, `ListDirectory`, `FileInfo`, `CopyFile`, `MoveFile`, `RenameFile`, `DeleteFile`, `CreateDirectory`, `SearchFiles`, `DownloadFile`, `ApplyDiff`, `UpdateHistory`, `CreateCanvas`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 文件服务 (`FileServer`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 提供受密码保护的静态文件服务。  
* **需配置环境变量**: `File_Key`, `DebugMode`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 文件树生成器 (`FileTreeGenerator`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 扫描指定目录的文件夹结构，并通过占位符提供给AI。  
* **需配置环境变量**: `0`, `1`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Gemini 图像生成与编辑 (`GeminiImageGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 使用 Google Gemini Flash Preview 模型进行高级的图像生成和编辑。  
* **需配置环境变量**: `GeminiImageKey`, `GeminiImageProxy`, `DIST_IMAGE_SERVERS`  
* **支持的主控命令**: `GeminiGenerateImage`, `GeminiEditImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Git 仓库管理器 (`GitOperator`)
**类型:** 🧩 可用交互工具  
**功能简述:** 基于配置档驱动的智能 Git 管理器。支持多仓库 Profile 管理、上游同步、凭证注入、串行调用和 Token 脱敏输出。  
* **需配置环境变量**: `PLUGIN_WORK_PATHS`  
* **支持的主控命令**: `Status`, `Log`, `Diff`, `BranchList`, `RemoteInfo`, `StashList`, `TagList`, `ProfileList`, `Add`, `Commit`, `Pull`, `Push`, `Fetch`, `BranchCreate`, `Checkout`, `Merge`, `Clone`, `SyncUpstream`, `ForcePush`, `ResetHard`, `BranchDelete`, `Rebase`, `CherryPick`, `ProfileAdd`, `ProfileEdit`, `ProfileRemove`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### Grok 视频生成器 (`GrokVideo`)
**类型:** 🧩 可用交互工具  
**功能简述:** 使用 Grok API 进行视频生成（支持文生视频、图生视频、视频续写、视频拼接）。  
* **需配置环境变量**: `GROK_API_KEY`, `GROK_API_BASE`, `GrokVideoModelName`, `DebugMode`, `PROJECT_BASE_PATH`, `SERVER_PORT`, `IMAGESERVER_IMAGE_KEY`, `VarHttpUrl`  
* **支持的主控命令**: `submit`, `concat`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 多模态数据提取器 (`ImageProcessor`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 处理用户消息中的多模态数据（图像、音频、视频），调用多模态模型提取信息，并将其替换或附加到消息文本中。同时管理多模态数据的描述缓存。  
* **需配置环境变量**: `API_URL`, `API_Key`, `MultiModalModel`, `MultiModalPrompt`, `MultiModalModelOutputMaxTokens`, `MultiModalModelThinkingBudget`, `MultiModalModelAsynchronousLimit`, `MediaInsertPrompt`, `DebugMode`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 图床服务 (`ImageServer`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 提供受密码保护的静态图片服务。  
* **需配置环境变量**: `Image_Key`, `File_Key`, `DebugMode`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### MIDI翻译器 (`MIDITranslator`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个高性能的MIDI文件解析与生成插件，可以从midi-input目录读取MIDI文件并解析为DSL格式，也可以从DSL生成MIDI文件到midi-output目录。核心引擎由Rust编写，确保性能与安全。提供DSL语法验证、事件提取和双向转换测试等功能。  
* **需配置环境变量**: `MAIDNAME`  
* **支持的主控命令**: `list_midi_files`, `parse_midi`, `generate_midi`, `validate_dsl`, `validate_dsl_with_details`, `extract_events`, `list_output_files`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 网易云音乐点歌 (`NeteaseMusic`)
**类型:** 🧩 可用交互工具  
**功能简述:** 网易云音乐点歌插件，支持搜索歌曲、获取最高音质播放链接和获取歌词。需要网易云VIP账号。  
* **需配置环境变量**: `NETEASE_MUSIC_U`, `NETEASE_PHONE`, `NETEASE_PASSWORD`  
* **支持的主控命令**: `send_captcha`, `captcha_login`, `qr_login`, `search_song`, `get_song_url`, `get_lyrics`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### Python摄像头插件 (`PyCameraCapture`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个使用Python和OpenCV从摄像头捕获图像的同步插件。  
* **需配置环境变量**: `PROCESSING_MODE`, `SAVE_PATH`  
* **支持的主控命令**: `CaptureImage`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### Python截图插件 (`PyScreenshot`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个使用Python和Pillow从桌面截取屏幕图像的同步插件。  
* **需配置环境变量**: `PROCESSING_MODE`, `SAVE_PATH`  
* **支持的主控命令**: `TakeScreenshot`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 通义千问图片生成 (`QwenImageGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 使用 SiliconFlow API 调用通义千问模型生成和编辑图片。  
* **需配置环境变量**: `SILICONFLOW_API_KEY`  
* **支持的主控命令**: `GenerateImage`, `EditImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Z-Image 文生图（阿里通义） (`ZImageGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 通过 Hugging Face Spaces API 使用阿里巴巴通义实验室的 Z-Image-Turbo 模型生成高质量图片。支持中英文提示词，8步推理，亚秒级延迟。  
* **需配置环境变量**: `HF_TOKEN`  
* **支持的主控命令**: `ZImageGenerate`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Z-Image Base 文生图 (`ZImageGen2`)
**类型:** 🧩 可用交互工具  
**功能简述:** 通过 Hugging Face Spaces API 使用 Z-Image-Base 模型生成高质量图片。支持中英文提示词，28步推理，支持负向提示词和CFG调节。  
* **需配置环境变量**: `HF_TOKEN`  
* **支持的主控命令**: `ZImageGenerate`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Z-Image-Turbo AI 绘图 (`ZImageTurboGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 调用 Gitee Z-Image-Turbo 接口进行文本生成图片 (每日免费 100 张)。  
* **需配置环境变量**: `ZIMAGE_API_KEY`  
* **支持的主控命令**: `GenerateImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

---

## 📌 AIGC 生产力生成

*调用底层的大模型进行原生创作，涵盖绘画（SD/MidJourney/Flux）、音乐（Suno）及二次衍生视频生成。*

### Doubao 风格图片生成器 (`DMXDoubaoGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 通过 DMXAPI 使用其提供的模型（如 doubao-seedream-4-0-250828）生成和编辑图片。  
* **需配置环境变量**: `VOLCENGINE_API_KEY`  
* **支持的主控命令**: `DoubaoGenerateImage`, `DoubaoEditImage`, `DoubaoComposeImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Doubao 风格图片生成器 (`DoubaoGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 通过火山方舟 API 使用 Doubao Seedream 3.0 模型生成具有特定风格的图片。  
* **需配置环境变量**: `VOLCENGINE_API_KEY`  
* **支持的主控命令**: `DoubaoGenerateImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### 表情包列表文件生成器 (`EmojiListGenerator`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 扫描项目 image/ 目录下的表情包文件夹，并在插件自己的 generated_lists/ 目录下生成对应的 .txt 列表文件。  
* **需配置环境变量**: `DebugMode`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### Flux 风格图片生成器 (`FluxGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 通过 SiliconFlow API 使用 FLUX.1-schnell 模型生成具有特定风格的图片。  
* **需配置环境变量**: `SILICONFLOW_API_KEY`  
* **支持的主控命令**: `FluxGenerateImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

### 火山引擎Seedream 4.0图像生成器 (`SeedreamGen`)
**类型:** 🧩 可用交互工具  
**功能简述:** 基于火山引擎Seedream 4.0模型的高质量图像生成插件，支持文生图、图生图、多图融合等功能。  
* **需配置环境变量**: `VOLCENGINE_API_KEY`, `DEFAULT_WATERMARK`, `DEFAULT_RESPONSE_FORMAT`  
* **支持的主控命令**: `SeedreamGenerateImage`  
💡 该生成器可能需要消耗外部的大模型 Token（如扣子/Suno 等接口），请留意调用频率。

---

## 📌 高阶工作流工具

*专为程序员或复杂科研场景提供的辅助引擎，例如分析代码库、阅读长文集、制作随机塔罗牌甚至日程管理。*

### 超文本递归阅读器 (`PaperReader`)
**类型:** 🧩 可用交互工具  
**功能简述:** 统一自适应阅读引擎：将超长 PDF/文档转为目标驱动的多分辨率阅读流程。v0.4: 统一 Read 命令（Survey→Triage→DeepDive/Skim→Audit→Synthesize）、Triage 分诊注意力分配、Skim 轻量扫读、Auditor 去偏见审核、ReadingState 持久化。MinerU 云端高保真解析，不可用时自动降级到 pdf-parse。  
* **需配置环境变量**: `MINERU_API_TOKEN`, `MINERU_API_TIMEOUT`, `MINERU_POLL_INTERVAL`, `PaperReaderChunkSize`, `PaperReaderOverlap`, `PaperReaderModel`, `PaperReaderMaxOutputTokens`, `PaperReaderBatchSize`, `PaperReaderMaxConcurrentLLM`, `PaperReaderMaxChunks`, `PaperReaderMaxAuditChunks`  
* **支持的主控命令**: `IngestPDF`, `Read`, `ReadSkeleton`, `ReadDeep`, `Query`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 项目分析器 (`ProjectAnalyst`)
**类型:** 🧩 可用交互工具  
**功能简述:** 分析指定的项目文件夹，生成详细的分析报告，并支持后续查询分析结果。  
* **支持的主控命令**: `AnalyzeProject`, `QueryAnalysis`, `QueryProgress`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 随机事件生成器 (`Randomness`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个多功能后端插件，用于生成各种可信的随机事件。支持无状态的单次随机事件（如抽牌、掷骰）和有状态的、可持久化的牌堆管理（创建、抽取、重置、销毁），适用于需要连续操作的场景。  
* **需配置环境变量**: `TAROT_DECK_PATH`, `RUNE_SET_PATH`, `POKER_DECK_PATH`, `TAROT_SPREADS_PATH`  
* **支持的主控命令**: `createDeck`, `createCustomDeck`, `drawFromDeck`, `resetDeck`, `destroyDeck`, `queryDeck`, `getCards`, `rollDice`, `drawTarot`, `castRunes`, `selectFromList`, `getRandomDateTime`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 用户日程简报 (`ScheduleBriefing`)
**类型:** 🕹️ 静默系统服务  
**功能简述:** 每小时自动清理过期日程，并提取下一个日程供AI参考。  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 用户日程管理器 (`ScheduleManager`)
**类型:** 🧩 可用交互工具  
**功能简述:** 用于维护用户的日程，允许AI查看、添加和删除用户日程。  
* **支持的主控命令**: `AddSchedule`, `DeleteSchedule`, `ListSchedules`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 科学计算器 (`SciCalculator`)
**类型:** 🧩 可用交互工具  
**功能简述:** 执行数学表达式计算。AI应使用特定格式请求此工具。  
* **支持的主控命令**: `SciCalculatorRequest`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

### 塔罗占卜 (`TarotDivination`)
**类型:** 🧩 可用交互工具  
**功能简述:** 一个融合天文、环境与内在起源的塔罗牌占卜插件，支持多种牌阵与起源选择。  
* **支持的主控命令**: `draw_single_card`, `draw_three_card_spread`, `draw_celtic_cross`, `get_celestial_data`  
💡 该组件专为某一特定垂直领域开发，开箱即用。

---

## 📌 未归类 / 杂项辅助

### 以图找番 (`AnimeFinder`)
**类型:** 🧩 可用交互工具  
**简述:** 一个通过图片URL或本地文件路径查找对应动漫信息的插件。  

### 画师匹配查询器 (`ArtistMatcher`)
**类型:** 🧩 可用交互工具  
**简述:** 根据用户输入的画师名，模糊匹配SDXL模型内部的画师Tag，并返回最佳匹配结果和拟合度建议。  

### Context7文档查询器 (`Context7`)
**类型:** 🧩 可用交互工具  
**简述:** 集成Context7平台，为AI提供实时的、版本特定的代码库文档和示例，支持最新的库文档查询，避免AI依赖过时的训练数据。  

### 每日热榜 (`DailyHot`)
**类型:** 🕹️ 静默系统服务  
**简述:** 在后台周期性地获取所有主流平台的今日热榜信息，并通过占位符 {{VCPDailyHot}} 提供。  

### 日语学习助手 (`JapaneseHelper`)
**类型:** 🧩 可用交互工具  
**简述:** 日语学习增强插件。支持句子解析、查词消歧、语法讲解、JLPT标注、测验判题、SRS复习、错题本、学习会话、词典管理、数据导入导出与健康检查。  

### Obsidian 混合中枢大管家 (`ObsidianManager`)
**类型:** 🧩 可用交互工具  
**简述:** VCP 与 Obsidian 的同步多指令管理插件。以 REST 为主命令层完成目录、读写、搜索、元数据与内容管理，以 CLI 为补充层完成打开笔记、打开每日笔记、URI 跳转与受控命令执行。  

### Skill Factory (`SkillFactory`)
**类型:** 🧩 可用交互工具  
**简述:** 用于根据用户目标生成新的 skill 草案，并完成查重与草案保存。  

### 影之诗查卡器(WB) (`SVCardFinder`)
**类型:** 🧩 可用交互工具  
**简述:** 一个用于查询《影之诗：世界超越》卡牌信息的插件。  

### VCP 日志 Synapse 推送器 (`SynapsePusher`)
**类型:** 🕹️ 静默系统服务  
**简述:** 将 VCP 工具调用日志实时推送到指定的 Synapse (Matrix) 房间。  

### 本地文件秒搜 (Everything) (`VCPEverything`)
**类型:** 🧩 可用交互工具  
**简述:** 通过调用 Everything 命令行工具 (es.exe) 在本地计算机上实现毫秒级文件搜索。  

### VCP 日志推送插件 (`VCPLog`)
**类型:** 🕹️ 静默系统服务  
**简述:** 通过 WebSocket 推送 VCP 调用信息，并记录日志。  

### 实时天气简报 (`WeatherInfoNow`)
**类型:** 🕹️ 静默系统服务  
**简述:** 从 WeatherReporter 的缓存中提取并提供简短的实时天气信息。  

### 天气预报员 (`WeatherReporter`)
**类型:** 🕹️ 静默系统服务  
**简述:** 提供实时的天气信息，并将其集成到系统提示词的 {{VCPWeatherInfo}} 占位符中。  

