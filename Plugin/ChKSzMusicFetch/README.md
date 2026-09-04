# ChKSzMusicFetch - 多平台音乐检索与解析插件

## 1. 插件概述

`ChKSzMusicFetch` 是基于 ChKSz API 接口开发的高性能混合服务插件（`hybridservice`）。该插件允许 VCP 智能体在对话过程中实时搜索各大流媒体音乐平台的曲目，并一键获取歌曲的直链音频流（支持无损音质 `lossless` 解析）、专辑封面及元数据信息。

### 核心特性
- **主流多平台覆盖**：全面支持网易云音乐（`163`）、QQ 音乐（`qq`）与酷狗音乐（`kugou`）。
- **两阶段检索与点播**：
  - 第一阶段：通过关键词在指定平台检索匹配的歌曲列表（包含歌曲名、歌手、歌曲 ID）。
  - 第二阶段：通过歌曲 ID（网易云）或歌曲名称及索引序号（QQ/酷狗）直接解析出高品质播放音频 URL。
- **结构化 JSON 返回**：响应格式标准化，易于 Agent 提取播放地址或展示给终端用户。

---

## 2. 命令列表与参数说明

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `search_music` | 搜索指定平台歌曲列表（返回 Top 10） | `platform` (string, 必填): 目标平台，可选值: `163` (网易云), `qq` (QQ音乐), `kugou` (酷狗)<br>`keyword` (string, 必填): 搜索关键词（歌曲名、歌手或专辑名） |
| `get_music_url` | 解析并提取指定歌曲的直链音频地址 | `platform` (string, 必填): 目标平台，可选值: `163`, `qq`, `kugou`<br>`id` (string, 必填): 网易云填歌曲数字 ID（如 `186016`）；QQ 或酷狗填歌曲名称/搜索词<br>`n` (string, 可选, 默认 `"1"`): 歌曲序号（仅在 QQ/酷狗多条结果时用于选择第几首，网易云留空） |

---

## 3. VCP 标准界定符调用示例

### 3.1 搜索网易云音乐歌曲
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ChKSzMusicFetch「末」,
command:「始」search_music「末」,
platform:「始」163「末」,
keyword:「始」群星 蔚蓝档案「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 获取网易云指定 ID 歌曲直链
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ChKSzMusicFetch「末」,
command:「始」get_music_url「末」,
platform:「始」163「末」,
id:「始」1956534812「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 检索并获取 QQ 音乐歌曲直链（首选匹配项）
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ChKSzMusicFetch「末」,
command:「始」get_music_url「末」,
platform:「始」qq「末」,
id:「始」夜航星「末」,
n:「始」1「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **依赖环境**：Node.js 16+ 与 `axios` 网络请求库。
- **授权密钥配置**：
  在 `H:\VCP\VCPzhangduan\VCPToolBox\config.env` 中配置 `CHKSZ_API_KEY`：
  ```env
  CHKSZ_API_KEY=your_chksz_api_key_here
  ```
  *注：若未配置 API Key，工具将返回明确错误引导用户前往官方平台注册获取。*
