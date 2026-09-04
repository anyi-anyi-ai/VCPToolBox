# ObsidianBridge

通过 Obsidian 官方 CLI (v1.12+) 桥接 VCP 与 Obsidian 笔记库，让 AI 伙伴直接读写、搜索、管理你的 Obsidian 知识库。

## 概述

ObsidianBridge 是一个 VCP 同步插件，通过调用 Obsidian 官方命令行接口（CLI），让 AI 伙伴能够：

- 📖 **读写笔记** — 读取、创建、追加、前插笔记内容
- 🔍 **全文搜索** — 支持普通搜索和带上下文的语义搜索
- 📅 **每日笔记** — 读取/追加/前插今日 Daily Note，获取路径
- 🏷️ **标签与属性** — 统计标签、读写 frontmatter Properties
- 🔗 **链接关系** — 查询出站链接和反向链接
- 📐 **结构分析** — 大纲查看、字数统计、文件/文件夹浏览
- ✅ **任务管理** — 获取待办任务，支持按文件/每日/全库筛选
- 📋 **模板列表** — 列出 vault 中已配置的模板

## 前置要求

### 1. Obsidian v1.12+ 及官方 CLI

ObsidianBridge 依赖 Obsidian 2026 年推出的官方 CLI。**它不是一个独立的命令行工具**，而是 Obsidian 桌面端内置的功能。

**安装步骤：**

1. 确保 Obsidian 已更新至 **v1.12.0** 或更高版本
2. 打开 Obsidian → 设置 → 常规 (General/About)
3. 找到 **Command Line Interface (CLI)** 选项
4. 点击 **Register CLI** / **注册**
5. 如果提示 Installer 过旧，请前往 [obsidian.md/download](https://obsidian.md/download) 下载最新安装包并覆盖安装

**验证安装：**

```bash
# Windows (PowerShell)
obsidian version

# 如果返回版本号（如 1.12.7），说明 CLI 已就绪
# 如果提示找不到命令，检查 PATH 或使用完整路径：
# D:\你的Obsidian安装路径\Obsidian.com version
```

> ⚠️ **注意**：v1.12.7 的 Changelog 明确提到 "Obsidian Installer is now bundled with a new binary file for using the CLI"。如果你是从旧版本自动升级的，可能需要重新下载安装包覆盖安装，以获取最新的 CLI 二进制文件。

### 2. 运行时要求

- **Node.js 18+**（VCP 环境自带）
- **使用 CLI 时必须保持 Obsidian 桌面端打开**（CLI 通过 IPC 与运行中的 Obsidian 通信）

## 特性

✅ **22 项命令** — 覆盖笔记读写、搜索、每日笔记、标签、属性、链接、任务、模板等
✅ **零依赖** — 仅使用 Node.js 内置 `child_process`、`path`、`fs`
✅ **可配置 CLI 路径** — 通过 `config.env` 指定 Obsidian CLI 路径，未配置时自动使用系统 PATH
✅ **参数校验** — 无效 scope 值自动拦截，缺少必需参数明确报错
✅ **Frontmatter 安全** — `prepend` 命令自动插入到 YAML `---` 之后，不破坏元数据
✅ **多行内容** — `create` / `append` / `prepend` 支持 `\n` 换行
✅ **VCP 标准接口** — 支持 stdio 和 `handleRequest()` 双入口

## 技术架构

```
┌─────────────┐    JSON (stdin/stdout)    ┌────────────────────────┐
│  VCP Server  │ ────── tool call ──────→  │  obsidian_bridge.js    │
│  (Plugin.js) │ ←──── JSON result ──────  │  (Node.js, 零依赖)     │
└─────────────┘                           └──────────┬─────────────┘
                                                     │ execFileSync()
                                                     │ (参数数组, 绕过Shell)
                                                     ▼
                                          ┌──────────────────────┐
                                          │  Obsidian CLI         │
                                          │  (Obsidian.com/exe)   │
                                          └──────────┬───────────┘
                                                     │ IPC
                                                     ▼
                                          ┌──────────────────────┐
                                          │  Obsidian Desktop     │
                                          │  (运行中的 vault)      │
                                          └──────────────────────┘
```

## 命令参考

### 笔记读写

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `read` | 读取笔记完整内容 | `file` 或 `path` | `vault` |
| `create` | 创建新笔记 | `name` | `content`, `folder`, `template`, `overwrite`, `vault` |
| `append` | 向笔记末尾追加内容 | `file`/`path` + `content` | `vault` |
| `prepend` | 向笔记开头插入内容 | `file`/`path` + `content` | `inline`, `vault` |

### 每日笔记

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `daily_read` | 读取今日每日笔记 | 无 | `vault` |
| `daily_append` | 向今日笔记末尾追加 | `content` | `vault` |
| `daily_prepend` | 向今日笔记开头插入 | `content` | `inline`, `vault` |
| `daily_path` | 获取今日笔记路径 | 无 | `vault` |

### 搜索

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `search` | 全文搜索 | `query` | `limit`, `folder`, `vault` |
| `search_context` | 带上下文搜索（返回匹配行周围内容） | `query` | `limit`, `folder`, `case_sensitive`, `vault` |

### 标签与属性

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `tags` | 统计 vault 所有标签及使用次数 | 无 | `vault` |
| `property_set` | 设置笔记 frontmatter 属性 | `file`/`path` + `name` + `value` | `type`, `vault` |
| `property_read` | 读取笔记某个属性值 | `name` | `file`/`path`, `vault` |
| `properties` | 列出 vault 或文件的所有属性 | 无 | `file`/`path`, `format`, `total`, `counts`, `sort`, `vault` |

### 链接关系

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `links` | 查询笔记的出站链接 | `file` 或 `path` | `total`, `vault` |
| `backlinks` | 查询笔记的反向链接 | `file` 或 `path` | `vault` |

### 结构与统计

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `files` | 列出 vault 中的文件 | 无 | `folder`, `ext`, `total`, `vault` |
| `folders` | 列出 vault 中的文件夹 | 无 | `folder`, `total`, `vault` |
| `outline` | 显示笔记标题大纲 | 无 | `file`/`path`, `format` (tree/md/json), `total`, `vault` |
| `wordcount` | 字数和字符数统计 | 无 | `file`/`path`, `words`, `characters`, `vault` |

### 任务管理

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `tasks` | 获取待办任务 | 无 | `file`/`path`, `scope` (daily/all), `done`, `status`, `vault` |

> **scope 说明**：指定 `file`/`path` 时自动查该文件任务；未指定时默认 `daily`（今日每日笔记）；可设为 `all`（全库）。无效 scope 值会被拦截并报错。

### 模板

| 命令 | 说明 | 必需参数 | 可选参数 |
|------|------|----------|----------|
| `templates` | 列出 vault 可用模板 | 无 | `total`, `vault` |

> **前提**：需要在 Obsidian 设置中配置 Templates 核心插件的模板文件夹。

## 参数说明

- **`file`**：按笔记名解析（类似 wikilink），如 `file=中心思想`
- **`path`**：精确相对路径，如 `path=分析/复分析/核心与主干/中心思想.md`
- **`vault`**：可选，指定 vault 名称（多 vault 环境下使用）
- **`content`**：支持 `\n` 换行，`\t` 制表符
- **`format`**：部分命令支持输出格式选择（`json`, `yaml`, `tsv`, `tree`, `md` 等）

## 安装

1. 将 `ObsidianBridge` 文件夹放入 VCPToolBox 的 `Plugin` 目录
2. 将 `config.env.example` 复制为 `config.env`，根据需要填写 Obsidian CLI 路径（详见下方配置章节）
3. 重启 VCPToolBox 后端（或等待插件热重载）
4. 确认 Obsidian 桌面端已打开并已注册 CLI

## 配置

### Obsidian CLI 路径（可选）

默认情况下，插件使用系统 PATH 中的 `obsidian` 命令。如果你的 Obsidian CLI 不在 PATH 中，或需要指定特定安装路径：

1. 将 `config.env.example` 复制为 `config.env`
2. 设置 `OBSIDIAN_CLI_PATH` 为你的 Obsidian CLI 完整路径

```bash
# Windows 示例
OBSIDIAN_CLI_PATH=D:\Obsidian\ObProgram\Obsidian.com

# macOS 示例
OBSIDIAN_CLI_PATH=/Applications/Obsidian.app/Contents/MacOS/Obsidian
```

> 如果 `config.env` 不存在或 `OBSIDIAN_CLI_PATH` 为空，插件自动使用 `obsidian` 命令。

如需支持 `templates` 命令，请在 Obsidian 中配置：
- 设置 → 核心插件 → Templates → 模板文件夹位置

如需支持 `daily_*` 系列命令，请在 Obsidian 中配置：
- 设置 → 核心插件 → Daily Notes → 新文件存放位置 + 模板文件位置

## 安全策略

以下 Obsidian CLI 命令存在破坏性风险，**本插件不提供 handler**：

| 命令 | 风险 |
|------|------|
| `delete` | 永久删除文件 |
| `move` / `rename` | 可能破坏内链结构 |
| `eval` | 在 Obsidian 中执行任意 JS 代码 |
| `dev:*` | 开发者工具，权限过大 |
| `plugin:install/uninstall` | 改变 Obsidian 运行环境 |
| `history:restore` | 可能覆盖当前文件内容 |

> 如需这些能力，请通过 Obsidian 桌面端或命令行手动执行。

## 文件结构

```
Plugin/ObsidianBridge/
├── obsidian_bridge.js      # 插件主体 (~19KB, 零依赖)
├── config.env.example      # CLI 路径配置模板
├── plugin-manifest.json    # VCP 插件清单 (22 命令)
└── README.md               # 本文件
```

## 测试记录

v1.2.0 配置化测试（2026-05-08）：

**config.env 配置化加载（2项）**：
- `OBSIDIAN_CLI_PATH` 填写绝对路径 → 正确加载并调用成功 ✅
- `OBSIDIAN_CLI_PATH` 为空 → 正确 fallback 到系统 PATH 中的 `obsidian` ✅

v1.1.2 共 23 项测试全部通过（2026-05-02）：

**核心读写（6项）**：
- `read` 读取笔记完整内容 ✅
- `create` 创建笔记（含多行 content + YAML frontmatter）✅
- `append` 多行追加 ✅
- `prepend` 前插（自动插入 YAML 之后，不破坏 frontmatter）✅
- `daily_read` 读取今日每日笔记 ✅
- `daily_append` / `daily_prepend` / `daily_path` ✅

**搜索（2项）**：
- `search` 全文搜索 ✅
- `search_context` 带上下文搜索 ✅

**标签与属性（4项）**：
- `tags` 标签统计 ✅
- `property_set` 设置属性 ✅
- `property_read` 读取属性 ✅
- `properties` 列出属性（format=json/yaml）✅

**链接关系（2项）**：
- `links` 出站链接 ✅
- `backlinks` 反向链接 ✅

**结构与统计（4项）**：
- `files` / `folders` 文件/文件夹列表 ✅
- `outline` 标题大纲（format=tree/md）✅
- `wordcount` 字数统计 ✅

**任务管理（3项）**：
- `tasks scope=daily` 今日任务 ✅
- `tasks scope=all` 全库任务 ✅
- `tasks path=指定文件` 指定文件任务 ✅

**防御性测试（1项）**：
- `tasks scope=monthly` → 正确返回 `scope invalid: monthly. Use: daily, all` ✅

**模板（1项）**：
- `templates` 列出已配置模板 ✅

v1.3.0 安全迁移回归测试（2026-05-26）：

**基线验证（5项）**：
- `daily_path` execFileSync 启动 .com ✅
- `search query="VCP 部署"` 含空格参数 ✅
- `files folder="数学maths"` 目录参数 ✅
- `read file="中心思想"` 中文笔记名 ✅
- `tags` 无参数 + flags ✅

**写入完整性（5项）**：
- `create` 多行 content + Shell 元字符（$HOME `echo` && ||）✅
- `search_context` 上下文搜索 ✅
- `append` 追加 + Shell 元字符 ✅
- `prepend` 前插 + frontmatter 安全 ✅
- `property_set` / `property_read` 属性读写（IPC 延迟确认）✅

**链接+结构（5项）**：
- `links` / `backlinks` / `folders` / `templates` ✅
- `tasks scope=monthly` 无效 scope 防御性拦截 ✅

**边界测试（6项）**：
- content 含多个等号（x=y+z=w, E=mc²）：CLI 在第一个 = 处切割 ✅
- Unicode 极端（Emoji/CJK扩展/零宽空格/日韩文）✅
- 空 content 创建 ✅
- 搜索含等号内容（E=mc²）✅
- 长内容追加（~500字符）✅
- Shell 注入防御验证：$HOME/$PATH/`echo test`/&& || 全部原样写入 ✅

## 已知限制

1. **依赖运行中的 Obsidian**：CLI 通过 IPC 与 Obsidian 通信，桌面端必须保持打开
2. **命令执行方式**：已从 `execSync` 字符串拼接迁移至 `execFileSync` 参数数组（v1.3.0）。当 CLI 路径为 `.exe`/`.com` 或无后缀时，参数通过数组直传子进程，完全绕过 Shell，消除了 Shell 注入风险。当 CLI 路径为 `.bat`/`.cmd` 时，自动降级到 `execSync`（保持向后兼容），并在 stderr 打印警告引导迁移
3. **单 vault**：默认操作当前打开的 vault。多 vault 环境需通过 `vault` 参数指定

## 版本历史

- **v1.3.0** (2026-05-26): 安全加固——将 `execSync` 字符串拼接迁移至 `execFileSync` 参数数组，消除 Shell 注入面。新增 `.bat`/`.cmd` 自动检测与降级机制（CVE-2024-27980 防护）。21 项回归测试全部通过
- **v1.2.0** (2026-05-08): 新增 `config.env` 配置文件支持，CLI 路径不再硬编码；未配置时自动 fallback 到系统 PATH 中的 `obsidian` 命令
- **v1.1.2** (2026-05-02): 修复 `tasks` 忽略 `file`/`path` 参数的问题；新增 `scope` 值白名单校验；版本号同步
- **v1.1.1** (2026-05-02): 修复多行 `content` 写入时字面量 `\n` 被过度转义导致换行失效的问题
- **v1.1.0** (2026-05-01): 新增 12 个命令（`files`/`folders`/`prepend`/`daily_prepend`/`daily_path`/`search_context`/`wordcount`/`outline`/`property_read`/`properties`/`links`/`templates`）；修复 `create` 的 `.md` 双重后缀和无效 `silent` flag
- **v1.0.0** : 初始版本，10 个核心命令

## 贡献者

- **Nova & 水野小夜** — 原始架构设计与 v1.0.0 实现。将 Obsidian 官方 CLI 封装为 VCP 插件的创意和基本的完整功能来自他们，可谓是奠基作者。
- **infinite-vector** — v1.1.x~v1.3.x 系列扩展：命令扩展、转义修复、任务修复、scope 校验、配置化 CLI 路径、execFileSync 安全迁移、单元测试、README

## License

MIT
---

# 节点写作模式 (v1.4.0)

## 它解决什么

Obsidian CLI 只有 `create` / `append` / `prepend`,**没有替换**。想改一篇笔记中间的某一段,只能整篇读出、字符串替换、整篇写回——而"找到那一段"依赖脆弱的逐字匹配。

节点写作模式用**不可见的 HTML 注释锚点**把 Markdown 变成可寻址的:

```markdown
<!--AUTO_core_BEGIN-->这是核心论点<!--AUTO_core_END-->
```

HTML 注释在 Obsidian 渲染视图里不可见,所以对人类读者无感;而 `AUTO_{tag}_BEGIN/END` 是一对可寻址锚点,程序据此精确切分文本。

**Agent 侧同样无感**:写入时用中文双间隔号标记,读取时锚点被翻译成 `[node-tag:xxx]`。Agent 全程不接触 HTML。

## 核心设计:node_add 是唯一渡口

```
文本空间                    渡口                    锚点空间
（脆弱、有歧义）           node_add            （确定、可寻址）
                              │
 逐字匹配 target ─────────────┼──────────────→ tag → 正则定位锚点对
 失败模式 3 种：              │                 失败模式 1 种：
  · 0 处匹配                  │                  · tag 不存在
  · N 处匹配（歧义）          │                    （可枚举可用 tag）
  · 与已有锚点重叠            │
```

`node_add` 是唯一需要提供原文的命令。渡过一次之后,`node_text_replace` / `node_text_delete` / `node_delete` 全部只需 tag。

这解释了两条规则为何是必须而非洁癖:
- **tag 唯一性硬报错** — 重名一出现,锚点空间的确定性当场失效,整套退回文本匹配
- **拒绝嵌套/交叉** — 交叉锚点会让正则切出错误边界,污染的是寻址能力本身

## 六个命令

| 命令 | 作用 | 必需参数 | 定位方式 |
|------|------|----------|----------|
| `node_create` | 从零起草,`··` → 锚点 | name/path | 无需(白纸) |
| `node_add` | 逐字定位原文,包成节点 | file/path, target, tag | **文本匹配** |
| `node_text_replace` | 按 tag 换正文 | file/path, tag, content | tag |
| `node_text_delete` | 按 tag 清空正文,留锚点 | file/path, tag | tag |
| `node_delete` | 拆空壳(前置:正文为空) | file/path, tag | tag |
| `node_read` | 三模式读取 | file/path, mode | tag(mode=node) |

命名对称:`*_text_*` 操作**正文**,`node_add`/`node_delete` 操作**锚点**。
六个命令均注册连字符别名(`node-add` 等),指向同一 handler。

## 白板落笔原则

`node_create` 用中文双间隔号 `··内容··` 成对标记节点。

**没配对的点不报错,原样保留为字面量。**

```
输入 ··你好··       → <!--AUTO_Default1_BEGIN-->你好<!--AUTO_Default1_END-->
输入 ··你好···      → 锚点对 + 尾部保留一个 ·
输入 列夫·托尔斯泰  → 原样(单点永不参与转译,人名号安全)
```

理由:报错是把"写法不规范"当异常,而它只是"没兑换到便利"。节点模式是**叠加**在普通 Markdown 之上的可选增益,不是取代它的新语法。抛异常会让整次写入失败——用户明明只想写个人名。

**自诊断链路**:Agent 写错不会收到报错,但审计表会显示"节点总数: 0"。审计表即反馈通道,规则违反是自证的,不是被判罚的。

## tag 分发

程序先数出成对数量 N,据此给出长度 N 的 index 位:

- `tags` 少于 N → 后续位补 `Default{i}`(i 为全局序号,直接等于审计表行号)
- 中间留空(`x,,z`)→ 空位补 `Default2`
- 末尾多打逗号 → 剔除后再校验,不因手滑报错
- `tags` **多于** N → **唯一的报错条件**(意味着 Agent 数错了自己写的节点)

tag 白名单:`字母/数字/下划线/连字符/中文`。禁空格,禁 `-->` 片段(畸形 tag 能撕破注释锚点自身)。

## 两步删除法

```
node_text_delete  →  正文清空,锚点变空壳,审计表显示 ∅ 长度 0
                          ↓  （可回头窗口）
node_delete       →  拆除锚点
```

`node_delete` 硬前置条件是正文已为空。不可逆动作被切成两步,每步都留下可审计的中间态——Agent 有机会在拆壳前从审计表发现删错对象。单命令 + mode 参数没有这个窗口。

## 审计表

所有写入命令操作完毕都返回最新审计表,Agent 无需再读一次:

```
节点总数: 2  |  已添加节点 "formula"

| # | tag | 首5 | 尾5 | 长度 |
|---|-----|-----|-----|------|
| 1 | core | 改写后的论 | 写后的论点 | 6 |
| 2 | formula | 公式: $\th | nabla$ | 31 |
```

- 首尾5字符:先剥 `#` 标题语法保留文字,再 trim,按 **Unicode 码点**计数(emoji 不被切半)
- 短块首尾窗口重叠时原样输出,靠长度列判断
- 空节点显示 `∅`,长度 0

## node_read 三模式

`mode` 为**必填**参数:

- `full` — 整篇正文,锚点转为 `[node-tag:xxx]…[/node-tag:xxx]`
- `tags` — 仅节点清单(审计表)
- `node` — 仅指定 tag 的节点正文(需 tag 参数)

**推荐工作流**:长文先 `mode=tags` 看地图,再 `mode=node` 精读需要的那一段,不必把整篇吞进上下文。这是锚点体系的真正收益。

## 重要:为何节点模式的写入不走 CLI

**实测发现 Obsidian CLI 会无条件还原 `content=` 里的转义序列**,`--help` 只写了 "Use \n for newline, \t for tab",但它不区分上下文:

```
传入 X\thetaY   →  落盘 X<TAB>hetaY     ← \t 被吃掉
传入 X\nablaY   →  落盘 X<LF>ablaY      ← \n 被吃掉
传入 X\neqY     →  落盘 X<LF>eqY
传入 X\toY      →  落盘 X<TAB>oY
传入 X\alphaY   →  落盘 X\alphaY        ← 安全(\a 不在转义表)
```

受害面:`\theta \times \tau \to \text \nabla \neq \ne \notin \nu \top \triangle` 等以 `\t`/`\n` 开头的 LaTeX 命令,以及 Windows 路径 `C:\temp`。

**这是既存缺陷,不由 v1.4.0 引入** — 现有 `create`/`append`/`prepend` 一直存在此问题,且 `escapeValue` 主动把内容里的 `\n` 转成字面量交给 CLI,等于固化了这个损坏面。

对节点模式尤其严重:node_* 是**整篇覆写**,一次操作会炸掉全文所有这类序列,而非仅新写入的部分。

**因此节点模式采用读写分离**:

```
读:  obsidian file (定位/乐观锁基线) → fs.readFileSync
写:  fs.writeFileSync + 落盘字节级校验
```

连带收益:
- LaTeX / 反斜杠内容**字节级无损**
- **消除 argv `MAX_ARG_STRLEN` = 128KB 上限**(实测 vault 最大笔记已占 61%)
- 避开 `execCLI` 的 `.trim()`,不再削掉文件首尾空白
- 少一次进程往返

代价是偏离"不碰文件系统"的原设计。但 `fs` 是 Node 内置(`loadCliPath()` 已在用),且备选方案是已知会损坏数学笔记的写入路径。

**原有 22 个命令一行未改**,行为(含此既存缺陷)保持原样。

## 并发安全

`pluginType: synchronous` + stdio 意味着**每次工具调用都 fork 一个新 node 进程**,进程一死内存状态即消失——任何内存锁完全无效。

`node_lock.js` 用文件锁:
- 原语 `fs.openSync(path, 'wx')`,排他创建,原子操作
- 按笔记路径加锁(SHA1 前16位),不同笔记可并行
- 锁文件记 PID + 时间戳,30s 过期回收(略高于 execCLI 的 25s 超时)
- 持有者进程已死(`process.kill(pid, 0)` 探测)则立即回收
- 最长等待 15s,超时报错并给出锁文件路径

**乐观锁**:读取时记下 `mtimeMs`,写回前二次校验,变了就中止且不写入任何内容。

这把竞态窗口从"整个读改写"压缩到"最后几十毫秒",**但没有归零** — 你在最后一刻于 Obsidian 内敲的字仍可能被覆盖。CLI 不提供原子 CAS 写入,这是固有代价。写入失败时错误信息会提示 `obsidian history path=…` 自查历史版本。

## 架构与模块

```
Plugin/ObsidianBridge/
├── obsidian_bridge.js        # 主体。仅新增 11 行 require 接线
│                             # escapeValue/buildCommand/execCLI 三根主轴未改
├── node_transpiler.js  16KB  # 纯函数层,零 IO。所有字符串变换
├── node_lock.js         4KB  # 跨进程文件锁
├── node_io.js           6KB  # IO 层。CLI 定位 + fs 读写 + 乐观锁
├── node_handlers.js     7KB  # 6 个 handler。仅编排 IO 顺序
├── test_node_transpiler.js   # 53 项单测,可脱离 Obsidian 运行
└── plugin-manifest.json      # 28 命令 (22 + 6)
```

**统一写入流水线**,五个写入命令唯一差异是中间那个纯函数:

```
lock(path)
  → obsidian file      (定位 relPath + 取 mtime 基线)
  → fs 读
  → 【纯函数变换】      ← 唯一差异点
  → fs 写 (二次 mtime 校验 + 落盘字节校验)
  → unlock
  → 返回最新审计表
```

**五片切分**是一切 tag 操作的唯一寻址入口:

```
head │ <!--AUTO_x_BEGIN--> │ body │ <!--AUTO_x_END--> │ tail
  ①            ②             ③           ④            ⑤
```

四个 tag 操作都只是"选哪几片重新拼起来":replace 换 ③、text_delete 清空 ③、delete 丢 ②③④、read(node) 只返回 ③。寻址逻辑只写一次,只需测一次。

**锚点零换行、位置忠实** — 紧贴被标记文本首尾插入,自身不产生换行。所以能安全包住句中短语而不劈开段落;`node_delete` 拆壳后 ① ⑤ 直接相接,天然无缝。

## 测试记录 (2026-09-02)

**纯函数层 53/53** — 白板落笔/落单点/人名号/代码块跳过/空行保留/tag 分发/重名检测/嵌套检测/五片还原/渡口三种失败模式/两步删除法/三模式读取/Unicode 码点计数/表格转义/LaTeX 回归

**端到端 24/24**(fork 子进程 + stdin 喂 JSON,完全模拟 VCP 真实调用) — 六命令全链路、LaTeX 字节级无损、锚点落盘、空行保留、可读式转译无 HTML 残留、连字符别名、`file=` wikilink 解析、原有 22 命令未受影响

**文件锁** — 子进程正确阻塞并超时报错、释放后可重取、锁文件自清理

**已知未测**:`E2BIG` 精确阈值(改 fs 直写后该路径已不经 argv);Obsidian 内存态未保存缓冲与外部写入的冲突行为

## 已知限制

1. **依赖运行中的 Obsidian** — 定位与 vault 路径解析仍走 CLI(IPC)
2. **乐观锁非原子** — 最后几十毫秒的竞态窗口无法消除
3. **不支持嵌套节点** — v1 一律拒绝,把语义压简单
4. **`node_create` 不支持 template** — 模板内容与节点转译的合并顺序尚未定义,已明确报错引导
5. **原有命令的 LaTeX 缺陷未修** — 保持原行为,仅节点模式安全
