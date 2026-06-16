# AnkiManage (VCP Plugin)

**Anki 绠＄悊涓庢搷浣滃伐鍏**

AnkiManage 是 VCP 体系下的独立同步插件，用于通过 VCP Agent 对 Anki 数据库进行写入和状态变更操作。

## 功能特性
- **添加笔记**: 支持向指定牌组添加新笔记，自动处理模型字段。
- **更新笔记**: 修改现有笔记的字段内容。
- **卡片控制**: 挂起 (Suspend) 或取消挂起卡片。
- **进度调度**: 重新调度 (Reschedule) 卡片到指定天数后复习。

## 依赖
- **Anki**: 必须在本地运行。
- **AnkiConnect**: 必须安装此 Anki 插件 (代码 2055492159) 并监听端口 `8765`。

## 安装与配置

1. **安装插件**: 将本目录解压至 VCPToolBox 的 `Plugin` 目录下（例如 `VCPToolBox\Plugin\AnkiManage`）。
2. **环境准备**:
    - 确保本机已安装 Python 3.x。
    - 启动 Anki 桌面端。
    - 在 Anki 中安装 `AnkiConnect` 插件 (代码: 2055492159)。
    - 确保 AnkiConnect 配置为监听 `127.0.0.1:8765` (默认设置)。
3. **重启 VCP**: 重启 VCP 主程序以加载新插件。

## 工具调用 (API)

### 1. `anki_add_note`
添加一条新笔记。
- **deck** (string, 必填): 目标牌组名称 (如 "Default")。
- **model** (string, 必填): 笔记类型名称 (如 "Basic")。建议先调用 `anki_get_models` 获取准确名称。
- **fields** (string, 必填): **JSON 格式字符串**，定义字段内容。
  - 示例: `'{"Front": "Hello", "Back": "你好"}'`
- **tags** (string, 可选): 空格分隔的标签字符串 (如 "vcp english")。

### 2. `anki_update_note`
更新笔记内容。
- **note_id** (number, 必填): 笔记 ID (非卡片 ID)。
- **fields** (string, 必填): **JSON 格式字符串**，包含要更新的字段。

### 3. `anki_suspend`
挂起或取消挂起卡片。
- **card_ids** (string, 必填): **逗号分隔**的 Card ID 列表字符串 (如 "12345,67890")。
- **suspend** (string, 必填): "true" (挂起) 或 "false" (取消挂起)。

### 4. `anki_reschedule`
调整卡片复习时间。
- **card_ids** (string, 必填): **逗号分隔**的 Card ID 列表字符串。
- **days** (number, 必填): 距离今天的天数 (整数)。

## 注意事项
- **JSON 格式**: `fields` 参数必须是有效的 JSON 字符串，而不是 Python 字典或 JavaScript 对象。Agent 必须确保存储正确的转义。
- **ID 类型**: 注意区分 `Note ID` (用于内容更新) 和 `Card ID` (用于调度/挂起)。
