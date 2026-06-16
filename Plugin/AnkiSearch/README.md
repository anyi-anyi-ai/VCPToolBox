# AnkiSearch (VCP Plugin)

**Anki 鎼滅储涓庢煡璇㈠伐鍏**

AnkiSearch 是 VCP (Virtual Character Protocol) 体系下的独立同步插件，用于通过 VCP Agent 对 Anki 数据库进行只读查询。

## 功能特性
- **高级搜索**: 支持 Anki 所有的搜索语法 (如 `deck:current is:due tag:hard`)。
- **牌组统计**: 获取所有牌组的名称、ID 及当前学习状态（新卡、待复习等）。
- **模型探查**: 动态获取 Anki 中可用的笔记类型 (Note Types) 及其字段结构，辅助 Agent 正确生成写入指令。

## 依赖
- **Anki**: 必须在本地运行。
- **AnkiConnect**: 必须安装此 Anki 插件 (代码 2055492159) 并监听端口 `8765`。
- **Python**: VCP 环境需配置 Python 运行时。

## 安装与配置

1. **安装插件**: 将本目录解压至 VCPToolBox 的 `Plugin` 目录下（例如 `VCPToolBox\Plugin\AnkiSearch`）。
2. **环境准备**:
    - 确保本机已安装 Python 3.x。
    - 启动 Anki 桌面端。
    - 在 Anki 中安装 `AnkiConnect` 插件 (代码: 2055492159)。
    - 确保 AnkiConnect 配置为监听 `127.0.0.1:8765` (默认设置)。
3. **重启 VCP**: 重启 VCP 主程序以加载新插件。

## 工具调用 (API)

### 1. `anki_search_cards`
搜索符合条件的卡片。
- **query** (string, 必填): Anki 查询语句。
  - 示例: `"deck:Default is:due"`

### 2. `anki_get_decks`
获取牌组列表及统计信息。
- **无参数**

### 3. `anki_get_models`
获取所有笔记类型及其字段列表。
- **无参数**

## 故障排除
- 确保 Anki 已启动且 AnkiConnect 插件已安装。
- 如果返回 "连接失败"，请检查 8765 端口是否被占用或防火墙设置。
