# AsepriteOperator - Aseprite 图形操作器

## 1. 插件概述

`AsepriteOperator` 是 VCP 生态中基于 Aseprite 命令行与动态 Lua 脚本执行机制构建的同步图形操作工具插件。它为智能体（Agent）提供了完整的像素级艺术绘制、画布生命周期管理、图层与影格编排、几何图形渲染以及精灵图导出能力。

### 核心特性
- **生命周期管理**：支持从零初始化 `.aseprite` 专有画布、添加图层（`AddLayer`）与动画影格（`AddFrame`），以及安全另存（`SaveAs`）。
- **几何与像素操作**：提供单像素与批量像素绘制（`DrawPixels`）、直线（`DrawLine`，兼容 Bresenham 算法）、矩形与实心填充（`DrawRectangle`）、油漆桶泛洪填充（`FillArea`）、正圆绘制（`DrawCircle`）。
- **导出能力**：一键导出为通用位图或动画格式（PNG、GIF、JPG 等），支持自定义分辨率与调色板保持。
- **批量串行执行（Batch）**：支持在单个工具请求中串行执行多条指令，通过数字后缀（`command1`, `width1`, `command2`, ...）减少跨进程交互开销。
- **路径与错误恢复**：推荐使用绝对路径；针对远程或缺失文件返回标准结构化错误代码 `FILE_NOT_FOUND_LOCALLY`。

---

## 2. 命令列表与参数说明

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数说明 (标注必填/可选) |
|---|---|---|
| `CreateCanvas` | 创建指定尺寸的空白 `.aseprite` 文件 | `width` (int, 必填): 画布宽度(px)<br>`height` (int, 必填): 画布高度(px)<br>`filename` (str, 必填): 保存文件绝对路径 |
| `AddLayer` | 向既有画布添加新图层 | `filename` (str, 必填): 目标画布路径<br>`layer_name` (str, 必填): 新图层名称<br>`save_as` (str, 可选): 另存目标路径(避免覆盖) |
| `AddFrame` | 向既有画布添加新动画影格 | `filename` (str, 必填): 目标画布路径<br>`save_as` (str, 可选): 另存目标路径 |
| `DrawPixels` | 批量绘制指定坐标及颜色的像素集合 | `filename` (str, 必填): 目标画布路径<br>`pixels` (list, 必填): 原生 JSON 数组 `[{"x": int, "y": int, "color": "#RRGGBB"}]`<br>`save_as` (str, 可选): 另存目标路径 |
| `DrawLine` | 绘制直线（Bresenham 算法） | `filename` (str, 必填): 目标画布路径<br>`x_start` / `x1` (int, 必填): 起点 X<br>`y_start` / `y1` (int, 必填): 起点 Y<br>`x_end` / `x2` (int, 必填): 终点 X<br>`y_end` / `y2` (int, 必填): 终点 Y<br>`color` (str, 可选, 默认 `#000000`): 十六进制颜色<br>`thickness` (int, 可选, 默认 1): 线条粗细<br>`save_as` (str, 可选): 另存目标路径 |
| `DrawRectangle` | 绘制矩形线框或实心矩形 | `filename` (str, 必填): 目标画布路径<br>`x` (int, 必填): 左上角 X<br>`y` (int, 必填): 左上角 Y<br>`width` (int, 必填): 矩形宽度<br>`height` (int, 必填): 矩形高度<br>`color` (str, 可选, 默认 `#000000`): 边框/填充颜色<br>`fill` (bool, 可选, 默认 false): 是否实心填充<br>`save_as` (str, 可选): 另存目标路径 |
| `FillArea` | 油漆桶泛洪填充 | `filename` (str, 必填): 目标画布路径<br>`x` (int, 必填): 种子点 X<br>`y` (int, 必填): 种子点 Y<br>`color` (str, 可选): 目标填充颜色<br>`save_as` (str, 可选): 另存目标路径 |
| `DrawCircle` | 绘制圆形线框或实心圆 | `filename` (str, 必填): 目标画布路径<br>`center_x` (int, 必填): 圆心 X<br>`center_y` (int, 必填): 圆心 Y<br>`radius` (int, 必填): 半径<br>`color` (str, 可选): 颜色<br>`fill` (bool, 可选, 默认 false): 是否实心填充<br>`save_as` (str, 可选): 另存目标路径 |
| `SaveAs` | 另存既有 `.aseprite` 工程至新路径 | `filename` (str, 必填): 原工程路径<br>`save_as` (str, 必填): 新目标路径 |
| `ExportSprite` | 导出为位图或动画图片 | `filename` (str, 必填): 源 `.aseprite` 路径<br>`output_filename` (str, 必填): 导出的目标图片路径<br>`format` (str, 可选, 默认 png): 格式如 `png`, `gif`, `jpg` |
| `Batch` | 串行多指令组合执行 | `command1`, `command2`, ... (str, 必填): 子命令名称<br>对应命令的各参数追加数字后缀 (如 `width1`, `filename2`) |

---

## 3. VCP 标准界定符调用示例

### 3.1 创建 64x64 像素新画布
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」CreateCanvas「末」,
width:「始」64「末」,
height:「始」64「末」,
filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.aseprite「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 绘制像素点集
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」DrawPixels「末」,
filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.aseprite「末」,
pixels:「始」[{"x":10,"y":10,"color":"#FF0000"},{"x":10,"y":11,"color":"#00FF00"}]「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 导出为 PNG 精灵图
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」ExportSprite「末」,
filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.aseprite「末」,
output_filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.png「末」,
format:「始」png「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.4 批量串行调用示例 (Batch)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」Batch「末」,
command1:「始」CreateCanvas「末」,
width1:「始」32「末」,
height1:「始」32「末」,
filename1:「始」C:/Project/VCPToolBox/image/Aseprite/icon.aseprite「末」,
command2:「始」DrawRectangle「末」,
filename2:「始」C:/Project/VCPToolBox/image/Aseprite/icon.aseprite「末」,
x2:「始」0「末」,
y2:「始」0「末」,
width2:「始」32「末」,
height2:「始」32「末」,
color2:「始」#000000「末」,
fill2:「始」true「末」,
command3:「始」ExportSprite「末」,
filename3:「始」C:/Project/VCPToolBox/image/Aseprite/icon.aseprite「末」,
output_filename3:「始」C:/Project/VCPToolBox/image/Aseprite/icon.png「末」,
format3:「始」png「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 配置与环境要求

- **运行环境**：Python 3.8+，本地需已安装 Aseprite 商业版或开源编译版。
- **配置项 (`config.env` 或系统环境变量)**：
  - `ASEPRITE_PATH`：Aseprite 可执行程序绝对路径，例如：`C:\Program Files\Aseprite\Aseprite.exe` 或 `D:\steam\steamapps\common\Aseprite\Aseprite.exe`。
- **推荐目录**：建议操作工程存放在 `image/Aseprite/` 目录下，确保 VCP 静态文件服务器可直接预览导出的资源。
