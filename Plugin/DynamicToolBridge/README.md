# DynamicToolBridge - 动态工具清单桥接器

## 1. 插件概述

`DynamicToolBridge` 是 VCP 系统中专为 `{{VCPDynamicTools}}` 动态插件目录机制提供后台配置管理与桥接支持的系统级架构插件。

在多插件环境下，如果将全部上百个工具的完整描述一次性硬编码塞入提示词，会导致巨额的 Token 浪费并干扰模型的决策注意力。`{{VCPDynamicTools}}` 机制通过语义分类与按需暴露，将工具目录按需动态分发给大语言模型。`DynamicToolBridge` 负责管理该机制的核心配置（包括小模型分类器参数、API 路由以及分类持久化），为 VCP 管理面板（AdminPanel）提供标准化的 Schema 呈现。

### 核心特性
- **管理配置桥接**：在 VCP 插件中心可视化管理小模型自动分类器的启停、模型名称、兼容端点与 API 凭据。
- **冷热隔离机制**：小模型分类仅在“新增插件”、“插件说明变更”或“管理员手动重构分类”时执行，绝不介入对话请求的高频主路径。
- **双重 API 策略**：支持直接复用主服务 `config.env` 中的通用模型网关，亦可指定独立的轻量分类模型（如 Gemini Flash Lite、Qwen-Turbo 等）。

---

## 2. 插件形态与架构分类

- **插件类型**：`synchronous` / 系统配置桥接插件
- **通信协议**：`stdio`（通过 `noop.js` 空操作占位，不启动冗余进程）
- **工具调用状态**：`invocationCommands: []`（无直接工具调用命令）。
  *注：智能体不可直接通过 `<<<[TOOL_REQUEST]>>>` 调用此插件，其功能完全体现为提示词占位符展开与后台分类管理。*

---

## 3. 提示词激活与使用规范

若需在系统提示词中引入轻量级动态工具目录，可在 Agent 的 System Prompt 中直接嵌入占位符：

```text
{{VarSystemPrompt}}

<!-- 注入由 DynamicToolBridge 支撑的动态工具清单 -->
{{VCPDynamicTools}}
```

当请求流经 VCP 提示词渲染管道时，`{{VCPDynamicTools}}` 会自动根据当前对话意图展开为筛选匹配的候选工具元数据。

---

## 4. 配置与环境要求

在 `Plugin/DynamicToolBridge/config.env`（可由 `config.env.example` 复制）中配置私有参数：

| 配置项 | 类型 | 默认值 | 详细说明 |
|---|---|---|---|
| `SmallModel_Enabled` | boolean | `false` | 是否开启小模型智能增量分类器 |
| `SmallModel_Use_Main_Config` | boolean | `true` | 是否直接复用主系统 `config.env` 的 `API_URL` 与 `API_Key` |
| `SmallModel_Model` | string | `""` | 用于工具语义分类的轻量级模型名称（如 `gemini-2.0-flash-lite`） |
| `SmallModel_Endpoint` | string | `""` | 独立 OpenAI 兼容端点（仅当 `SmallModel_Use_Main_Config=false` 时生效） |
| `SmallModel_API_Key` | string | `""` | 独立端点的授权密钥（仅当 `SmallModel_Use_Main_Config=false` 时生效） |
