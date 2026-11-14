# DeepSeek 搜索与抓取插件 (DeepSeekSearch)

## 📖 插件概览

`DeepSeekSearch` 是专门对接 **DeepSeek 官方 Search & Fetch API** 的高质量搜索引擎与正文提取插件。

底层由 DeepSeek 官方自研的 AI 原生搜索引擎提供支持，索引全球千亿级网页，具备以下核心特性：
- **AI 意图与语义优化**：原生过滤 SEO 农场、GEO 作弊与低质垃圾 AIGC 内容；
- **重排序得分 (rerank_score)**：提供 0~3 分的综合权威度与新鲜度排序标签；
- **长短双摘要**：同时输出便于展示的 `snippet` 与专门适配大模型长上下文阅读理解的 `summary`；
- **正文直接提取**：支持在检索时直接附带网页正文抓取（`need_content: true`）；
- **全网网页转 Markdown**：提供单独的 `DeepSeekFetch` 命令，直接抓取目标网页并自动净化为干净格式的 Markdown。
- **并发多词检索**：原生支持 `|` 管道符，一次调用并发检索多个关键词并聚合汇报。

---

## ⚙️ 配置说明 (`config.env`)

本插件在 `Plugin/DeepSeekSearch/config.env` 中提供如下配置项，同时也支持在 VCP 根目录 `VCPToolBox/config.env` 中统一配置：

```env
# 1. 访问 DeepSeek 官方 API 的凭证（必填）
# 支持单个 Key，或配置多个 Key（用英文逗号分隔）实现自动轮询负载
DeepSeekApiKey=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 2. API 服务器基地址（官方默认为 https://api.deepseek.com）
DeepSeekApiBase=https://api.deepseek.com

# 3. 网络请求超时（毫秒，默认 25000）
DeepSeekSearchTimeout=25000

# 4. 多关键词（| 分隔）或批量抓取时的并发批次上限（默认 5）
DeepSeekMaxConcurrent=5

# 5. 单个关键词默认返回结果条数（1~50，默认 10）
DeepSeekDefaultCount=10
```

---

## 🛠️ 暴露指令与调用指南

### 指令 1: `DeepSeekSearch` (网页搜索)

调用官方 `POST /v1/tools/search` 接口进行高质量网页检索。

#### 参数列表：
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| **`query`** | `string` | **是** | - | 检索词（1~128 字符）。支持高级语法（如 `site:github.com`、`-site:csdn.net`、`-排除词`）。支持使用 `\|` 分隔多个词进行并发多路检索。 |
| **`count`** | `number` | 否 | `10` | 返回结果数量（1~50 条）。 |
| **`need_content`** | `boolean` | 否 | `false` | 是否同时抓取返回网页的正文内容。 |
| **`ori_question`** | `string` | 否 | - | 用户触发此搜索的原始问题，有助于模型理解完整意图。 |
| **`site`** | `string` | 否 | - | 快捷限定域名，例如 `github.com`。 |
| **`format`** | `string` | 否 | `markdown` | 返回格式，可选 `markdown`（适合模型阅读）或 `json`。 |

#### AI Agent 调用示例：
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DeepSeekSearch「末」,
command:「始」DeepSeekSearch「末」,
query:「始」DeepSeek 官方搜索 API 规范 site:deepseek.com | 2026年开源大模型进展「末」,
count:「始」5「末」,
need_content:「始」false「末」
<<<[END_TOOL_REQUEST]>>>
```

---

### 指令 2: `DeepSeekFetch` (网页正文抓取)

调用官方 `POST /v1/tools/fetch` 接口抓取目标网页，并净化转换为干净排版的 Markdown 正文。

#### 参数列表：
| 参数名 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| **`url`** | `string` | **是** | 目标网页的完整 URL 地址。支持使用 `\|` 管道符分隔传入多个 URL 进行批量并行抓取。 |

#### AI Agent 调用示例：
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」DeepSeekSearch「末」,
command:「始」DeepSeekFetch「末」,
url:「始」https://api-docs.deepseek.com/zh-cn/guides/search「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 🔍 技术细节与工程健壮性设计

1. **自动网络容灾重试**：
   当遭遇瞬态网络抖动、超时（ETIMEDOUT）或 429、502、503 状态码时，内部自动采用指数退避重试（最多 2 次）。
2. **多 Key 轮询与负载**：
   在 `DeepSeekApiKey` 中填入多个 Key（逗号分隔）即可在请求和重试时自动轮换 Key。
3. **零外部新包依赖**：
   直接复用 `VCPToolBox` 现有的 `axios` 和 `dotenv`，无需执行 `npm install` 增加体积。
4. **VCP 架构标准对齐**：
   完全遵循 `Plugin.js` 标准的 `synchronous` / `stdio` 协议，输出标准的 `{ status: "success", result: "..." }` 响应结构。
