# ComfyUI Agent 设置指南

## 🔧 快速修复步骤

### 1. 检查ComfyUI配置
确保在ComfyUI的`config.env`中正确设置了：
```
COMFYUI_BASE_URL=http://127.0.0.1:8199
```

### 2. 验证模型文件
运行以下命令确认可用的模型：
```bash
curl http://127.0.0.1:8199/object_info | jq '.CheckpointLoaderSimple.input.required.ckpt_name[0][]'
```

### 3. 修复常见错误

#### ❌ 错误1: `AttributeError: 'str' object has no attribute 'get'`
**原因**: 工作流格式解析错误
**修复**: 已更新代码支持多种JSON格式

#### ❌ 错误2: `400 Bad Request: prompt_outputs_failed_validation`
**原因**: 引用的模型文件不存在
**修复**: 
1. 使用 `discover_environment` 获取准确模型列表
2. 确保模型文件放在ComfyUI的`models/checkpoints/`目录
3. 使用存在的模型名称（如`v1-5-pruned-emaonly.ckpt`）

#### ❌ 错误3: `prompt_no_outputs`
**原因**: 工作流缺少SaveImage节点
**修复**: 代码已自动添加SaveImage节点

### 4. 测试命令序列

**步骤1**: 发现环境
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」discover_environment「末」
<<<[END_TOOL_REQUEST]>>>
```

**步骤2**: 列出工作流
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」list_workflows「末」
<<<[END_TOOL_REQUEST]>>>
```

**步骤3**: 生成图像（使用基础工作流）
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
workflow_id:「始」basic_txt2img.json「末」,
prompt:「始」A beautiful sunset over mountains「末」,
negative_prompt:「始」blurry, low quality「末」,
seed:「始」12345「末」
<<<[END_TOOL_REQUEST]>>>
```

### 5. 可用工作流模板

- `basic_txt2img.json` - 基础文生图
- `Unsaved Workflow.json` - 当前默认工作流

### 6. 参数规范

**必需参数**:
- `tool_name`: 固定为 `VCPComfyUIPlugin`
- `workflow_id` 或 `workflow_json`: 指定工作流

**可选参数**:
- `prompt`: 正面提示词（替换模板中的`{prompt}`）
- `negative_prompt`: 负面提示词（替换模板中的`{negative_prompt}`）
- `model_name`: 必须是ComfyUI中实际存在的模型文件
- `seed`: 随机种子（整数）
- `steps`: 采样步数（默认20）
- `cfg`: CFG Scale（默认7.5）
- `width/height`: 图像尺寸（使用模板中的默认值）

### 7. 调试命令

查看详细日志：
```bash
tail -f Plugin/VCPComfyUIPlugin/debug_log.txt
```

验证ComfyUI连接：
```bash
curl http://127.0.0.1:8199