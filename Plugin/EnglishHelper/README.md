# EnglishHelper - 英语学习与语法分析助手

## 1. 插件概述

`EnglishHelper` 是基于 Python、spaCy 自然语言处理库（`en_core_web_sm`）、NLTK WordNet 以及本地 ECDICT 词典库（`ecdict_mini.db`）构建的高性能英语学习辅助插件。它为 VCP 智能体提供了专业的词汇查释、音标查询、依存句法成分分析、长难句切分、语法点详析以及个人错题本管理能力。

### 核心特性
- **词汇深度消歧与查词**：基于本地离线 SQLite 词典快速获取词义、音标、变形（复数、时态、分词）与词性。
- **句法依存树解析（NLP）**：利用 spaCy 提取句子的主谓宾、定状补结构，分析从句成分与语法依赖标签。
- **错题本与间隔复习**：维护本地用户学习数据库（`english_helper_user.db`），支持生词与语法难点一键入库（`wrongbook_add`）。
- **兼容双层调用规范**：既支持 VCP Manifest 顶层指令（`EnglishHelperCore`, `EnglishHelperLookup`），也支持直接指定底层功能子命令（`command: lookup_word` 等）。

---

## 2. 命令列表与参数说明

### 2.1 Manifest 顶层主命令
| 主命令名称 (`command` / `commandIdentifier`) | 功能定位 | 说明 |
|---|---|---|
| `EnglishHelperCore` | 综合语言处理主入口 | 承载句法分析、断句、语法解析、错题管理等全功能 |
| `EnglishHelperLookup` | 词典查询与消歧入口 | 快速检索单词词义、释义、例句与音标 |

### 2.2 功能子命令 (`command` 参数值)
| 子命令 (`command`) | 功能说明 | 核心参数 (标注必填/可选) |
|---|---|---|
| `lookup_word` | 单词/短语查词 | `word` (string, 必填): 待查询的英文单词 |
| `analyze_sentence` | 句子句法成分与依存关系分析 | `text` 或 `sentence` (string, 必填): 待分析的英文文本 |
| `sentence_split` | 文本长句断句与分句提取 | `text` 或 `sentence` (string, 必填): 待切分的英文文本 |
| `grammar_explain` | 英文语法知识点详析与示例 | `grammar` (string, 必填): 语法点名称（如 `present perfect`, `inversion`） |
| `wrongbook_add` | 添加单词或句型到个人错题本 | `item_id` (string, 必填): 生词或难点标识<br>`item_type` (string, 可选, 默认 `word`): 类别（`word`/`sentence`/`grammar`）<br>`item_text` (string, 可选): 详细上下文例句 |

---

## 3. VCP 标准界定符调用示例

### 3.1 查词示例（通过 `EnglishHelperLookup` 或直接 `lookup_word`）
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」EnglishHelper「末」,
command:「始」lookup_word「末」,
word:「始」epiphany「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 句子句法成分深度分析
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」EnglishHelper「末」,
command:「始」analyze_sentence「末」,
text:「始」Having completed the audit, the engineer submitted the final report.「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 语法点讲解
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」EnglishHelper「末」,
command:「始」grammar_explain「末」,
grammar:「始」subjunctive mood「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.4 错题本添加记录
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」EnglishHelper「末」,
command:「始」wrongbook_add「末」,
item_id:「始」ubiquitous「末」,
item_type:「始」word「末」,
item_text:「始」Smartphones have become ubiquitous in daily life.「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **运行环境**：Python 3.8+，需安装 `spacy`、`nltk` 依赖，并加载语言模型 `en_core_web_sm`。
- **本地数据库**：
  - `ecdict_mini.db`：内置本地基础词库。
  - `english_helper_user.db`：用户学习与错题本持久化 SQLite 数据库（自动初始化）。
- **配置项 (`config.env`)**：
  - `REQUEST_TIMEOUT`：超时时间（默认 60000ms）。
  - `ONLINE_DICT_ENABLED`：是否启用在线并联查询（默认 false）。
