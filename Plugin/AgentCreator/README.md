# AgentCreator (智能Agent创作工坊)

## 📖 插件概览
**AgentCreator** 是一套超级工作流驱动的开发插件。它赋予了底层大语言模型（主 AI）能够 **“自我繁殖与演化”** 的能力：允许 AI 侦听需求并在运行时，热更新、创建、调试或克隆存在于本地的各种定制化子 Agent。

通过它，主 AI 可以自动将外部提示词转化为格式标准的 JSON 配置文件，并能动态探测 VCP 现存插件、环境变量甚至是历史日记记录，来作为新 Agent 的工具集和数据源。

## 🔧 主要功能与命令集

该插件包含三个阶段的复合管理系统设计：

### 阶段一：核心 CRUD 操作
- **`CreateAgent`**: 输入角色设定、描述及可用工具列表，自动将其转化为符合 VCP 标准的 `config.json` 文件并落地于本地存储。
- **`EditAgent`**: 增量更新或覆写某个已存在 Agent 的提示词、工具链配置。默认自带备份机制。
- **`CopyAgent`**: 以现有某个 Agent 为基底，克隆出一份副本以便在此基础上微调（例如：“帮我克隆一个小吉，但让她只懂法律”）。
- **`DeleteAgent`**: 在文件系统中永久删除指定的 Agent，并可选择是否将其从主映射表中移除。
- **`ListAgents`** / **`ViewAgent`**: 列出系统中目前存在的所有 Agent，或精确查看某一个 Agent 的底层 JSON 原始配置结构。

### 阶段二：智能功能分析与预览
- **`AnalyzeAgent`**: 传入一个 Agent 的名字，审查这个 Agent 是否具备解决某种特定问题的能力，以及它的工具链是否完备。
- **`SuggestTools`**: 根据新提出代理的角色需求，智能遍历系统，并为其推荐最合适的 VCP 原生组件作为其挂载工具（如推荐 `FileOperator` 給代码处理 Agent）。
- **`PreviewAgent`**: 基于用户传入的新设定参数，在**不写入任何文件**的前提下进行一次干跑（Dry-run）校验，输出最终的 JSON 预览形态。
- **`ListAvailableResources`**: 探索当前 VCP 工具箱所有的动态资源库（包括可调用的 Plugins、环境信息前缀、Diaries）。

### 阶段三：模板预设系统
- **`ListTemplates`**: 查看系统中预配的标准角色模板库（如通用编程助手、翻译官等）。
- **`CreateFromTemplate`**: 基于基础模板快速克隆一个 Agent，并可传入占位符来实时渲染个性化信息。

## 💡 使用指南

1. **串联语法 (`serialSyntax`)**:
   本插件原生极度适配 VCP 的“串接操作”架构。你可以在一次 Tool Request 内连续呼叫多个动作。只需在参数键名后递增数字（例如 `command1: "ListTemplates"`, `command2: "ListAvailableResources"`），系统内部将流式执行并依序回传报告。
2. **自动映射管理**:
   如果你在调用时并未手动关闭 `AUTO_UPDATE_MAP` 开关，在创建 Agent 后，系统还会自动更新 VCP 的总控路由 `agent_map.json`，使得新的 Agent 即可立刻生存在系统内准备受理任务，无需重启 VCPToolBox！
3. **占位符热替换**:
   支持在新 Agent 预设提示词中填写模板变量。系统可通过 `extractPlaceholders` 函数解析并将所需的上下文依赖作为 `required_env` 强加于此 Agent 的环境校验队列。
