# PluginSourceViewer (ServerPluginSourceViewer) - 插件源码查询器

## 1. 插件概述

`PluginSourceViewer`（在系统注册名称中标识为 `ServerPluginSourceViewer`）是 VCP 系统的本地元编程与反思审计工具。当智能体在运行时需要理解某个插件的底层具体实现、验证参数格式、或是排查插件行为异常时，该工具能够动态检索 `Plugin/` 目录下的清单与源码，将目标插件的主代码入口、清单元数据以及经过净化的文件目录树直接呈现给 AI。

### 核心特性
- **入口智能推断**：自动解析目标插件的 `plugin-manifest.json`，识别 `entryPoint.script` 或 `entryPoint.command`，读取 Node.js、Python 或 Shell 等文本源代码。
- **二进制与缓存防护**：针对 `.exe`、编译后二进制动态库或压缩包，输出友好提示而非乱码；自动忽略 `node_modules`、`target`、`dist`、`build`、`__pycache__` 等庞大缓存。
- **本地目录拓扑树**：输出格式清晰的 ASCII 树形结构，方便 Agent 全览插件工程全貌。
- **命名注意点**：本插件物理目录名为 `PluginSourceViewer`，但在 VCP 插件系统注册的标准工具名（`tool_name`）为 `ServerPluginSourceViewer`。

---

## 2. 命令列表与参数说明

### 主命令：`ViewPluginSource`

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `ViewPluginSource` | 查询并打印指定本地插件的源码与目录结构 | `targettool` (string, 必填): 目标插件在 manifest 中声明的名称（如 `AnySearch`, `DigitalOracle`, `AsepriteOperator`） |

*注：若查询的工具未在本地物理目录中找到，工具会返回清晰的未命中说明（如该工具为分布式远程挂载节点或已被禁用），并附带本地可见的候选工具列表。*

---

## 3. VCP 标准界定符调用示例

### 3.1 查看 AsepriteOperator 插件源码与结构
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ServerPluginSourceViewer「末」,
command:「始」ViewPluginSource「末」,
targettool:「始」AsepriteOperator「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 检查 DigitalOracle 插件入口源码
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ServerPluginSourceViewer「末」,
command:「始」ViewPluginSource「末」,
targettool:「始」DigitalOracle「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 探查 DailyNoteSearcher 架构（包含 Rust 与 JS 桥接）
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」ServerPluginSourceViewer「末」,
command:「始」ViewPluginSource「末」,
targettool:「始」DailyNoteSearcher「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **运行环境**：Node.js >= 14.0.0。
- **调用权限**：需要对本地 `Plugin/` 根目录具备只读访问权限。
- **通信协议**：`synchronous` stdio 协议，超时时间 60000ms。
