# PlaceholderExplorerCommand - 占位符管理命令

## 1. 插件概述

`PlaceholderExplorerCommand` 是 VCP 提示词宏与动态变量生态系统的命令行治理工具。它与 `PlaceholderExplorer` 核心扫描索引器紧密协同，为智能体提供对系统中所有 `{{...}}` 占位符的生命周期追踪、双向引用定位、实时干跑预览（`Preview`）、孤儿死链检测（`CheckDeadLinks`）以及带原子备份的高可靠安全编辑能力（`Edit`）。

### 核心特性
- **全域占位符索引与定位**：深度扫描工程内所有 `config.env`、`sarprompt.json`、`TVStxt` 文本文件及代码文件，迅速定位变量的定义位置、行号及下游引用关系。
- **原子级安全修改机制**：编辑遵循严格的安全流程（读入全文 → 内存修改 → 临时文件写入 → 完整性校验 → 备份原文件 → 原子替换）。
- **双向健康检查**：一键检测死链占位符（引用了不存在的变量）、孤儿占位符（定义了但从未被使用）及缺失的文件路径。
- **干跑预览（Dry-Run Preview）**：通过内置的 `messageProcessor.resolveAllVariables` 路径模拟实际渲染输出，验证展开结果。

---

## 2. 命令列表与参数说明

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `Scan` | 重建全量占位符索引数据库 | 无参数 |
| `Locate` | 查询占位符定义、引用链与编辑权限 | `placeholder` (string, 必填): 占位符名称（如 `VarCity` 或 `{{VarCity}}`） |
| `Edit` | 安全修改可写占位符的定义或关联文件正文 | `placeholder` (string, 必填): 目标占位符名称<br>`newValue` (string, 必填): 替换后的新文本内容<br>`scope` (string, 可选, 默认 `definition`): 编辑范围：`definition`（修改配置定义值）或 `file`（修改对应的 TVStxt 物理文件正文） |
| `Preview` | 模拟展开占位符并返回最终渲染文本 | `placeholder` (string, 必填): 目标占位符<br>`role` (string, 可选, 默认 `system`): 角色权限上下文（`system`/`user`/`assistant`）<br>`model` (string, 可选): 模拟的大模型标识 |
| `CheckDeadLinks` | 执行全域双向健康检查，扫描失效死链与孤儿占位符 | 无参数 |

*注：内置变量、复合聚合宏、插件注册宏和声明式只读宏受到安全保护，禁止通过 `Edit` 修改。修改 `config.env` 中的定义值需重启服务生效。*

---

## 3. VCP 标准界定符调用示例

### 3.1 查询占位符定义与引用链 (`Locate`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlaceholderExplorerCommand「末」,
command:「始」Locate「末」,
placeholder:「始」{{VarCity}}「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 安全编辑占位符定义值 (`Edit`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlaceholderExplorerCommand「末」,
command:「始」Edit「末」,
placeholder:「始」{{VarCity}}「末」,
newValue:「始」Beijing「末」,
scope:「始」definition「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 模拟系统提示词干跑展开 (`Preview`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlaceholderExplorerCommand「末」,
command:「始」Preview「末」,
placeholder:「始」{{VarTimeNow}}「末」,
role:「始」system「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.4 执行占位符死链与健康巡检 (`CheckDeadLinks`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlaceholderExplorerCommand「末」,
command:「始」CheckDeadLinks「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **依赖环境**：Node.js 16+ 同步 stdio 执行。
- **配置项 (`configSchema`)**：
  - `PLACEHOLDER_SCAN_ROOT`：扫描起始目录（默认 `.`）。
  - `PLACEHOLDER_INDEX_FILE`：持久化索引文件路径（默认 `generated/placeholder-index.json`）。
  - `PLACEHOLDER_BACKUP_DIR`：修改前自动备份目录（默认 `backups`）。
  - `PLACEHOLDER_BACKUP_RETENTION`：历史备份保留版本数（默认 20）。
  - `PLACEHOLDER_MAX_EDIT_BYTES`：单次编辑最大允许字节数。
