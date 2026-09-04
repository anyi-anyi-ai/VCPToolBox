# DailyNoteSearcher - 日记/知识库高性能搜索器 (Rust)

## 1. 插件概述

`DailyNoteSearcher` 是由 Rust 编写并在底层以原生二进制常驻运行的高性能全文检索服务插件。它通过 Node.js 桥接层（`DailyNoteSearcher.js`）以 `hybridservice`（直接 HTTP/内存桥接）模式接入 VCP 体系，为智能体提供在 `dailynote`（日记目录）或 `knowledge`（冷知识库目录）中的毫秒级极速搜索能力。

### 核心特性
- **双模检索能力**：
  1. **精准文本与正则表达式检索**：支持多关键词 AND 匹配、大小写敏感控制、全词匹配及行级上下文切片（`context_lines`）。
  2. **BM25 语义打分排序召回**：针对 Agent 长期记忆系统设计的概率相关性排序模型，支持正文匹配（`body`）或标签筛选（`tag`）。
- **极速常驻架构**：底层 Rust 守护进程常驻监听 `127.0.0.1:38765`，具备父进程存活检测与优雅退出机制，避免频繁冷启动。
- **跨平台原生二进制**：自动识别 Windows (x64)、Linux (x64/arm64) 与 macOS。

---

## 2. 命令列表与参数说明

### 核心命令：`SearchDailyNote`

#### 模式一：默认文本 / 正则检索参数
| 参数名称 | 类型 | 必填/可选 | 默认值 | 说明 |
|---|---|---|---|---|
| `query` | string | 必填* | 无 | 待检索的关键词、文本片段或正则表达式（若指定 `queries` 则非必填） |
| `queries` | array | 可选 | 无 | 多关键词数组，执行多词 AND 联合匹配 |
| `folder` | string | 可选 | 根目录 | 指定一级子目录名称（如 `Nova`, `TDBdocs`） |
| `root_path` | string | 可选 | `dailynote` | 检索根目录，可传入 `knowledge` 或绝对路径 |
| `allowed_extensions` | string | 可选 | `.md,.txt,.json,.html` | 检索文件格式白名单，逗号分隔 |
| `ignored_folders` | string | 可选 | `VectorStore,DebugLog` | 需忽略的目录名称，逗号分隔 |
| `max_results` | integer | 可选 | 200 | 最大返回匹配条目数 |
| `is_regex` | boolean | 可选 | false | 是否将 `query` 作为正则表达式解析 |
| `case_sensitive` | boolean | 可选 | false | 是否区分大小写 |
| `whole_word` | boolean | 可选 | false | 是否进行全词边界匹配 |
| `context_lines` | integer | 可选 | 2 | 匹配行前后额外返回的上下文行数 |

#### 模式二：BM25 排序召回参数 (`mode="bm25"`)
| 参数名称 | 类型 | 必填/可选 | 默认值 | 说明 |
|---|---|---|---|---|
| `mode` | string | 必填 | 无 | 必须固定传入 `bm25` |
| `query` | string | 必填 | 无 | 用户检索意图或自然语言问题 |
| `folder` | string | 必填 | 无 | 目标角色日记本目录名（如 `Nova`） |
| `query_tokens` | array | 可选 | 无 | 预分词后的词组数组（与 JS/Jieba 分词对齐） |
| `root_path` | string | 可选 | `dailynote` | 日记根目录相对或绝对路径 |
| `bm25_limit` | integer | 可选 | 10 | 候选范围，按时间倒序取最近 N 条文档打分 |
| `bm25_search_mode` | string | 可选 | `body` | 匹配模式：`body`（检索正文）或 `tag`（仅检索文档末尾标签行） |
| `tag_blacklist` | string | 可选 | 无 | 停用词黑名单（支持逗号、竖线、换行分隔） |

---

## 3. VCP 标准界定符调用示例

### 3.1 默认文本精准检索
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DailyNoteSearcher「末」,
command:「始」SearchDailyNote「末」,
query:「始」TriviumDB search_hybrid「末」,
root_path:「始」knowledge「末」,
folder:「始」TDBdocs「末」,
allowed_extensions:「始」md,txt,json,html「末」,
is_regex:「始」false「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 正则表达式匹配
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DailyNoteSearcher「末」,
command:「始」SearchDailyNote「末」,
query:「始」\d{4}-\d{2}-\d{2} 记忆同步「末」,
folder:「始」Nova「末」,
is_regex:「始」true「末」,
context_lines:「始」3「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 BM25 正文语义相关度召回（推荐）
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DailyNoteSearcher「末」,
command:「始」SearchDailyNote「末」,
mode:「始」bm25「末」,
query:「始」分布式节点如何跨节点取文件「末」,
folder:「始」VCP桌面知识「末」,
root_path:「始」dailynote「末」,
bm25_limit:「始」20「末」,
bm25_search_mode:「始」body「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.4 BM25 Tag 标签行召回
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DailyNoteSearcher「末」,
command:「始」SearchDailyNote「末」,
mode:「始」bm25「末」,
query:「始」桌面图标和壁纸操作「末」,
folder:「始」VCP桌面知识「末」,
root_path:「始」dailynote「末」,
bm25_limit:「始」10「末」,
bm25_search_mode:「始」tag「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **底层二进制依赖**：`Plugin/DailyNoteSearcher/bin/` 目录下需具备对应平台的编译产物（如 `DailyNoteSearcher.exe`）。
- **环境配置 (`config.env`)**：
  - `DAILY_NOTE_SEARCHER_HOST`：常驻服务监听地址，默认 `127.0.0.1`。
  - `DAILY_NOTE_SEARCHER_PORT`：固定通信端口，默认 `38765`。
  - `DAILY_NOTE_SEARCHER_TIMEOUT`：通信超时阈值，默认 `60000` (ms)。
  - `DAILY_NOTE_ROOT`：日记根目录名称，默认 `dailynote`。
