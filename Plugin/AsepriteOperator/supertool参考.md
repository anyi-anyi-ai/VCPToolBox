# AsepriteOperator · Minimal Tool Guide

使用規則（必讀）
- 路徑：建議絕對路徑（Windows 可用 C:/... 或轉義反斜線）。建立新檔放在 C:/VCPToolBox/image/Aseprite。
- 陣列：像素列表 pixels 必須是原生 JSON 陣列（非字串）。
- 批量：使用 command1/command2… 與對應參數後綴 1/2…。
- 顏色：#RRGGBB 或 #RGB。
- file://：支援 file:// URL；如本地不存在，會返回 code=FILE_NOT_FOUND_LOCALLY。

指令（必需參數; [可選]）
- CreateCanvas(width, height, filename)
- AddLayer(filename, layer_name, [save_as])
- AddFrame(filename, [save_as])
- DrawPixels(filename, pixels=[{x,y,color}], [save_as])
- DrawLine(filename, x_start, y_start, x_end, y_end, [color="#000000"], [thickness=1], [save_as])
- DrawRectangle(filename, x, y, width, height, [color], [fill=false], [save_as])
- FillArea(filename, x, y, [color], [save_as])
- DrawCircle(filename, center_x, center_y, radius, [color], [fill=false], [save_as])
- SaveAs(filename, save_as)
- ExportSprite(filename, output_filename, [format])

單指令最小示例
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」CreateCanvas「末」,
width:「始」64「末」,
height:「始」64「末」,
filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.aseprite「末」
<<<[END_TOOL_REQUEST]>>>
```

像素繪製（注意 pixels 為陣列）
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」DrawPixels「末」,
filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.aseprite「末」,
pixels:「始」[{"x":13,"y":12,"color":"#FFFFFF"}]「末」
<<<[END_TOOL_REQUEST]>>>
```

匯出 PNG
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」ExportSprite「末」,
filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.aseprite「末」,
output_filename:「始」C:/Project/VCPToolBox/image/Aseprite/scene1.png「末」
<<<[END_TOOL_REQUEST]>>>
```

批量最小示例（CreateCanvas → DrawLine）
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AsepriteOperator「末」,
command:「始」Batch「末」,

command1:「始」CreateCanvas「末」,
width1:「始」64「末」,
height1:「始」64「末」,
filename1:「始」C:/VCPToolBox/image/Aseprite/batch.aseprite「末」,

command2:「始」DrawLine「末」,
filename2:「始」C:/VCPToolBox/image/Aseprite/batch.aseprite「末」,
x_start2:「始」0「末」,
y_start2:「始」0「末」,
x_end2:「始」63「末」,
y_end2:「始」63「末」
<<<[END_TOOL_REQUEST]>>>
```

輸出規格
- 成功：{"status":"success", ...}
- 失敗：{"status":"error","error":"..."}；如 file:// 缺檔：{"status":"error","code":"FILE_NOT_FOUND_LOCALLY","fileUrl":"..."}