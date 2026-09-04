# ObsidianBridge (v1.4.0) 命令速查与 Agent 调用指南

> **插件标识 (tool_name)**: ObsidianBridge  
> **协议规范**: VCP 同步插件协议 (stdio)  
> **前置要求**: 本地 Obsidian 桌面端必须保持运行，且已在设置中开启 CLI (v1.12+)

---

## 一、标准调用协议格式

Agent 调用任何 ObsidianBridge 工具时，必须严格遵守 VCP 标准界定符：

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」<命令名>「末」,
<参数名>:「始」<参数值>「末」
<<<[END_TOOL_REQUEST]>>>
`

> **重要规则**：
> - 	ool_name 必须填 ObsidianBridge（注意大小写，不要误填为 ObsidianManager）。
> - 命令名全部为 **小写或小写下划线**（例如 
ead、daily_append、
ode_replace）。
> - 参数值用 「始」 与 「末」 成对包裹。

---

## 二、命令总览 (28 项能力)

| 类别 | 命令名 (command) | 简要说明 |
|---|---|---|
| **基础读写** | 
ead | 读取指定笔记完整内容 |
| | create | 创建新笔记（支持模板与正文） |
| | ppend | 向已有笔记尾部追加文本 |
| | prepend | 向已有笔记头部插入文本（自动避开 frontmatter） |
| **搜索检索** | search | 笔记库全文关键词搜索 |
| | search_context | 带语境上下文片段的全文搜索 |
| **每日笔记** | daily_read | 读取今日 Daily Note 内容 |
| | daily_append | 向今日 Daily Note 尾部追加内容 |
| | daily_prepend | 向今日 Daily Note 头部插入内容 |
| | daily_path | 获取今日 Daily Note 的相对文件路径 |
| **元数据与图谱** | 	ags | 获取所有标签使用频次统计 |
| | property_read | 读取特定 YAML 属性值 |
| | property_set | 设置或新增 YAML 属性 |
| | properties | 列出指定文件或全库的所有属性 |
| | links | 查询指定笔记的出站链接（它链接了谁） |
| | acklinks | 查询指定笔记的反向链接（谁链接了它） |
| **结构与任务** | outline | 提取笔记的标题大纲目录树 |
| | wordcount | 统计笔记的字数与字符数 |
| | 	asks | 提取待办任务列表（支持每日/全库/单文件过滤） |
| | 	emplates | 列出已配置的模板清单 |
| | iles | 列出库中文件列表 |
| | olders | 列出库中文件夹列表 |
| **v1.4.0 节点模式** | 
ode_create | 从零起草带 ··内容·· 的笔记并转译为隐形锚点 |
| | 
ode_add | 逐字定位已有笔记的一段文本，为其添加可寻址 tag 锚点 |
| | 
ode_text_replace | 按 tag 寻址，整段替换节点正文（保留锚点） |
| | 
ode_text_delete | 按 tag 清空节点正文（变为空壳，审计表显示 ∅） |
| | 
ode_delete | 拆除节点锚点（前置条件：正文已清空） |
| | 
ode_read | 节点专用读取（支持 ull / 	ags / 
ode 三模式） |

---

## 三、常用基础命令详解与示例

### 1. 笔记读取与检索 (
ead / search)

#### 读取笔记 (
ead)
- **必填参数**: ile（笔记名，支持 wikilink 格式如 品牌思考）或 path（相对路径如 工作/品牌思考.md）
- **可选参数**: ault（指定笔记库名称）

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」read「末」,
file:「始」2026年年度规划「末」
<<<[END_TOOL_REQUEST]>>>
`

#### 带上下文搜索 (search_context)
- **必填参数**: query（搜索关键词）
- **可选参数**: limit（返回结果上限，默认 10）、older（限定在特定文件夹）

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」search_context「末」,
query:「始」Cauchy积分「末」,
limit:「始」5「末」
<<<[END_TOOL_REQUEST]>>>
`

### 2. 笔记创建与追加 (create / ppend)

#### 创建笔记 (create)
- **必填参数**: 
ame（笔记名）
- **可选参数**: content（正文内容，支持 \n 换行）、older（文件夹路径）、	emplate（模板名）、overwrite（是否覆盖，true/false）

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」create「末」,
name:「始」会议纪要-20260903「末」,
folder:「始」Work/Meetings「末」,
content:「始」# 2026-09-03 会议\n\n- 参会人：AI 伙伴、用户\n- 主题：知识库插件整理「末」
<<<[END_TOOL_REQUEST]>>>
`

#### 尾部追加 (ppend)
- **必填参数**: ile 或 path、content（追加文本）

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」append「末」,
file:「始」待办收件箱「末」,
content:「始」\n- [ ] 检查 VCPToolBox 插件更新「末」
<<<[END_TOOL_REQUEST]>>>
`

### 3. 每日笔记管理 (daily_read / daily_append)

#### 向今日日记追加记录 (daily_append)
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」daily_append「末」,
content:「始」\n- 17:30 完成了 ObsidianBridge 与 NovelEngineering 文档对齐「末」
<<<[END_TOOL_REQUEST]>>>
`

### 4. 任务与属性管理 (	asks / property_set)

#### 获取未完成任务 (	asks)
- **可选参数**: scope（daily 或 ll，默认 daily）、ile 或 path（指定单文件）、done（布尔值，查已完成任务）

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」tasks「末」,
scope:「始」all「末」
<<<[END_TOOL_REQUEST]>>>
`

#### 设置 YAML 属性 (property_set)
- **必填参数**: ile 或 path、
ame（属性键名）、alue（属性值）
- **可选参数**: 	ype（text / list / number / checkbox / date / datetime）

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」property_set「末」,
file:「始」项目/量子计算「末」,
name:「始」status「末」,
value:「始」in_progress「末」,
type:「始」text「末」
<<<[END_TOOL_REQUEST]>>>
`

---

## 四、v1.4.0 节点局部写作模式详解（重点）

节点写作模式（
ode_*）是 v1.4.0 引入的核心能力。Obsidian CLI 本身只有创建和追加，**不支持局部修改**。节点模式通过隐形 HTML 注释锚点（如 <!--AUTO_core_BEGIN-->...<!--AUTO_core_END-->）实现**精准局部覆写**。

> **设计原则**：
> 1. **白板落笔**：Agent 只需写普通 Markdown，用中文双间隔号 ··内容·· 成对包裹节点。
> 2. **零接触 HTML**：Agent 永远不需要手动拼写注释标签。
> 3. **安全直写**：所有 
ode_* 写入直接走底层文件系统 (fs)，避开 CLI 吃掉 \n、\t（破坏 LaTeX 公式 \theta, \times, \nabla 以及 Windows 路径）的已知缺陷，且没有 128KB 长度限制。

### 1. 从零起草带节点的笔记 (
ode_create)
- **必选参数**: 
ame 或 path
- **可选参数**: content（使用 ··内容·· 标记节点）、	ags（逗号分隔的 tag 别名列表）、older

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」node_create「末」,
name:「始」物理研究笔记「末」,
content:「始」# 量子引力概论\n\n核心论点：··当前统一场论的核心分歧在于全息原理的边界条件。··\n\n推导结论：··由爱因斯坦场方程联立解得波函数收敛。··「末」,
tags:「始」core_thesis,conclusion「末」
<<<[END_TOOL_REQUEST]>>>
`

### 2. 节点读取推荐工作流 (
ode_read)
- **必填参数**: ile 或 path、mode（**必须三选一**：	ags / 
ode / ull）
- **按 tag 读取时参数**: 	ag（当 mode=node 时必需）

> **推荐高能效工作流**：
> 1. 先用 mode=tags 快速扫描整篇长文的「节点地图」（不耗费大量上下文 token）；
> 2. 再用 mode=node 精读需要修改的那一个 tag；
> 3. 避免将整篇万字长文全部塞入上下文。

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」node_read「末」,
file:「始」物理研究笔记「末」,
mode:「始」node「末」,
tag:「始」core_thesis「末」
<<<[END_TOOL_REQUEST]>>>
`

### 3. 局部文本精准替换 (
ode_text_replace)
- **必填参数**: ile 或 path、	ag、content（新正文）
- **特点**: 无需提供修改前原文，系统直接按 tag 定位并替换内部正文，保留首尾锚点。

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」node_text_replace「末」,
file:「始」物理研究笔记「末」,
tag:「始」core_thesis「末」,
content:「始」修改后的最新论点：基于 AdS/CFT 对偶性的严格数学证明已经由新实验佐证。「末」
<<<[END_TOOL_REQUEST]>>>
`

### 4. 节点两步删除法 (
ode_text_delete -> 
ode_delete)
为了防止 Agent 手滑一次性误删大量正文，系统强制采用**两步删除法**：
1. **第一步：清空正文** (
ode_text_delete)：正文被清空，锚点变为空壳，审计表显示 ∅（长度为 0）。此时若发现删错，仍可随时用 
ode_text_replace 恢复！
2. **第二步：拆除锚点** (
ode_delete)：**硬前置条件是正文必须已为空**。确认无误后执行拆除，剥离锚点壳，文本完全恢复为纯净 Markdown。

`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」node_text_delete「末」,
file:「始」物理研究笔记「末」,
tag:「始」conclusion「末」
<<<[END_TOOL_REQUEST]>>>
`
确认清空后再拆除壳：
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」ObsidianBridge「末」,
command:「始」node_delete「末」,
file:「始」物理研究笔记「末」,
tag:「始」conclusion「末」
<<<[END_TOOL_REQUEST]>>>
`

---

## 五、Agent 常见调用陷阱与排错

1. **The CLI is unable to find Obsidian**：
   - 原因：本地 Obsidian 桌面端没有打开。
   - 解决：请提示用户打开桌面端 Obsidian。
2. **误用 ObsidianManager 的命令**：
   - 错误：给 ObsidianBridge 发送 ReadNote、WriteNote。
   - 正确：ObsidianBridge 读取命令是 
ead，创建是 create。
3. **
ode_read 忘记传 mode**：
   - mode 是必填参数，必须明确指定为 	ags、
ode 或 ull。
4. **单点与人名号不会误触发节点**：
   - ·· 必须严格双点成对。单点（如 列夫·托尔斯泰）会被自动保护，绝不报错也绝不转译。
