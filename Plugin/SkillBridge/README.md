# SkillBridge - Skill 技能目录桥接器

## 1. 插件概述

`SkillBridge` 是 VCP 系统中的静态能力目录供给插件（`static` 类型）。它在 VCP 启动或文件监视器检测到变动时自动执行，快速扫描 `Plugin/SkillBridge/SKILL/` 目录下收录的各类专业领域独立技能包（如 Word/PDF/Excel 文档生成、全栈前端开发、移动原生开发、着色器编程等），解析提取各技能的 `SKILL.md` YAML Frontmatter 前置元数据，编译成紧凑的索引清单并通过 `{{VCPSkillBridge}}` 注入到大模型的系统提示词中。

### 核心特性
- **静态预生成索引**：通过 `node SkillBridge.js` 生成结构化的 `skill-index.txt`，以极低的 Token 开销向 Agent 广播全局可用技能。
- **两阶段按需阅读协议**：
  1. 系统提示词中仅常驻包含各技能的名称与一句话触发描述。
  2. 当智能体接收到对应领域的复杂任务时，再通过文件操作工具（如 `ServerFileOperator`）主动按需读取 `Plugin/SkillBridge/SKILL/<skill-name>/SKILL.md` 深度执行指导，实现“能力无限扩展而提示词不臃肿”。
- **静态插件架构**：无动态交互命令（`invocationCommands: []`），以系统提示词占位符 `{{VCPSkillBridge}}` 为唯一消费接口。

---

## 2. 插件形态与架构分类

- **插件类型**：`static`（静态提供者）
- **通信协议**：`process_stdio`
- **命令暴露**：`invocationCommands: []`（无直接工具调用命令，无需通过 `<<<[TOOL_REQUEST]>>>` 调用）。
- **注册占位符**：`{{VCPSkillBridge}}`

---

## 3. 提示词激活与使用规范

在 Agent 的角色设定或系统提示词中引入占位符：

```text
{{VarSystemPrompt}}

<!-- 引入专业 Skill 技能树目录 -->
{{VCPSkillBridge}}
```

### 展开后的提示词示例：
```text
[VCP 技能库导引]
当需要执行特定复杂领域专业任务时，可主动读取对应技能路径下的 SKILL.md 获取详尽规范：
- minimax-docx: Word 文档深度创建、格式排版与模板套用 (路径: Plugin/SkillBridge/SKILL/minimax-docx/SKILL.md)
- minimax-pdf: PDF 矢量绘制、表单填写与重排版 (路径: Plugin/SkillBridge/SKILL/minimax-pdf/SKILL.md)
- minimax-xlsx: 复杂电子表格构建与公式图表校验 (路径: Plugin/SkillBridge/SKILL/minimax-xlsx/SKILL.md)
- shader-dev: GLSL 着色器开发与视觉特效编程 (路径: Plugin/SkillBridge/SKILL/shader-dev/SKILL.md)
...
```

---

## 4. 智能体按需加载操作示例

当 Agent 需要使用特定技能时，配合 `ServerFileOperator` 进行阅读：
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ServerFileOperator「末」,
command:「始」read_file「末」,
path:「始」Plugin/SkillBridge/SKILL/minimax-docx/SKILL.md「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 5. 配置与技能扩展规范

- **技能目录**：`Plugin/SkillBridge/SKILL/<skill-folder>/`
- **必要文件**：每个技能子目录下必须包含标准的 `SKILL.md`，其头部包含 YAML Frontmatter：
  ```yaml
  ---
  name: example-skill
  description: 简明扼要描述该技能适用的场景与能力范围
  ---
  ```
- **配置项 (`config.env`)**：
  - `SKILLBRIDGE_PATH_MODE`：路径呈现模式（`relative` 或 `absolute`）。
  - `SKILLBRIDGE_HEADER_TEXT`：注入到系统提示词的导引标题文字。
