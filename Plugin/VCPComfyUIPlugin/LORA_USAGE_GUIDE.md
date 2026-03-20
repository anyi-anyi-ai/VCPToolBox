# VCPComfyUIPlugin LoRA 功能使用指南

## 概述

VCPComfyUIPlugin 现已支持完整的 LoRA 管理功能，包括：

- **LoRA 发现**：自动从 ComfyUI 获取可用 LoRA 列表
- **本地扫描**：直接扫描本地 LoRA 目录，读取 .safetensors 文件内嵌元数据
- **自动建档**：从文件名推断元数据，支持 Civitai API 获取详细信息
- **智能匹配**：根据聊天上下文和提示词自动推荐合适的 LoRA
- **动态注入**：在生成图像时自动将 LoRA 注入工作流

## 📦 依赖安装

本地扫描功能需要 `safetensors` 库来读取 LoRA 文件内嵌元数据：

```bash
pip install safetensors
```

**注意**：如果未安装 `safetensors` 库，插件会自动回退到简单读取模式（直接读取文件头），但可能无法获取所有元数据字段。建议安装以获得最佳体验。

## 🚀 快速开始

### 方式一：本地扫描建档（推荐）⭐

**最准确的方式**：直接扫描本地 LoRA 文件，读取内嵌的训练元数据

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」scan_local_loras「末」
<<<[END_TOOL_REQUEST]>>>
```

这条命令会：
1. 扫描配置的本地 LoRA 目录（`COMFYUI_LORA_DIR` 或 `COMFYUI_LORA_PATH`）
2. 读取每个 .safetensors 文件的内嵌元数据
3. 提取训练参数、标签、触发词等信息
4. 自动分类并保存到元数据库

### 方式二：ComfyUI API + Civitai 建档

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」auto_register_all_loras「末」,
use_civitai:「始」true「末」
<<<[END_TOOL_REQUEST]>>>
```

这条命令会：
1. 从 ComfyUI API 获取 LoRA 列表
2. 从文件名推断标签、风格、类别
3. 尝试从 Civitai API 获取详细描述
4. 自动生成完整的元数据库

## 自动建档原理

### 1. 文件名推断

系统会从 LoRA 文件名中识别关键词：

| 关键词 | 推断类别 | 自动标签 |
|--------|----------|----------|
| anime, manga | 风格类 | anime, style, illustration |
| realistic, realism | 风格类 | realistic, photorealistic |
| detail, tweaker | 增强类 | detail, enhancement, quality |
| character, girl, boy | 角色类 | character |
| fantasy, scifi, cyberpunk | 主题类 | fantasy, theme |
| dress, uniform, swimsuit | 服装类 | clothing, outfit |

**示例**：
- `anime_style_v1.safetensors` → 标签: [anime, style], 类别: style
- `detail_tweaker_0.8.safetensors` → 标签: [detail, enhancement], 默认强度: 0.8
- `realistic_photo.safetensors` → 标签: [realistic, photo], 类别: style

### 2. Civitai API 获取

如果启用 `use_civitai: true`，系统会：
1. 用文件名搜索 Civitai 模型库
2. 获取官方描述和标签
3. 提取触发词信息

## 新增命令

### 1. `scan_local_loras` - 本地扫描建档 ⭐⭐⭐

**最准确的建档方式**：直接扫描本地 LoRA 目录，读取 .safetensors 文件内嵌的元数据。

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」scan_local_loras「末」
<<<[END_TOOL_REQUEST]>>>
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lora_dir` | string | 配置文件中的 `COMFYUI_LORA_DIR` | LoRA 目录路径（可选） |

**前置配置：**
在 `config.env` 中设置 LoRA 目录：
```
COMFYUI_LORA_DIR=E:\S-wei\novelai\models\Lora
```

**返回示例：**
```json
{
  "status": "success",
  "result": {
    "total": 25,
    "saved": 25,
    "lora_dir": "E:\\S-wei\\novelai\\models\\Lora",
    "metadata_dir": "lora_metadata",
    "loras": [
      {
        "filename": "anime_style_v1.safetensors",
        "category": "style",
        "tags": ["anime", "style", "illustration"],
        "trigger_words": ["anime style"],
        "has_metadata": true,
        "metadata_path": "lora_metadata/anime_style_v1.json"
      }
    ],
    "message": "成功扫描 25 个 LoRA，保存 25 个元数据文件"
  }
}
```

**读取的元数据包括：**
- `ss_output_description` - 训练时设置的描述
- `ss_tag` - 训练标签
- `ss_output_trigger_words` - 触发词
- `ss_network_module` - 网络模块类型
- 文件大小、修改时间、内容哈希等

### 2. `auto_register_all_loras` - 一键自动建档

自动注册所有 LoRA 并推断元数据（支持本地扫描 + Civitai）。

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」auto_register_all_loras「末」,
use_civitai:「始」true「末」,
force_update:「始」false「末」,
use_local_scan:「始」true「末」
<<<[END_TOOL_REQUEST]>>>
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `use_civitai` | boolean | true | 是否从 Civitai 获取元数据 |
| `force_update` | boolean | false | 是否强制更新已有条目 |
| `use_local_scan` | boolean | true | 是否优先使用本地扫描 |

**返回示例：**
```json
{
  "status": "success",
  "result": {
    "total_loras": 15,
    "newly_registered": ["anime_style.safetensors", "detail_tweaker.safetensors"],
    "updated": [],
    "skipped": ["already_registered.safetensors"],
    "message": "已注册 2 个新 LoRA，更新 0 个，跳过 1 个"
  }
}
```

### 3. `list_loras` - 列出所有 LoRA

列出所有已建档的 LoRA，支持自动注册新发现的 LoRA。

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」list_loras「末」,
refresh:「始」true「末」,
auto_register:「始」true「末」,
use_civitai:「始」true「末」
<<<[END_TOOL_REQUEST]>>>
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `refresh` | boolean | false | 从 ComfyUI 重新扫描 |
| `auto_register` | boolean | false | 自动注册新发现的 LoRA |
| `use_civitai` | boolean | true | 从 Civitai 获取元数据 |

### 3. `get_lora_info` - 获取 LoRA 详情

获取单个 LoRA 的详细信息。

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」get_lora_info「末」,
lora_name:「始」anime_style.safetensors「末」
<<<[END_TOOL_REQUEST]>>>
```

### 4. `register_lora` - 手动注册 LoRA

手动为 LoRA 添加元数据（覆盖自动推断）。

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」register_lora「末」,
lora_name:「始」anime_style.safetensors「末」,
description:「始」Anime style LoRA for generating anime-like illustrations「末」,
tags:「始」["anime", "style", "illustration", "2D"]「末」,
trigger_words:「始」["anime style", "anime art", "anime illustration"]「末」,
default_strength:「始」0.8「末」
<<<[END_TOOL_REQUEST]>>>
```

### 5. `match_loras` - 智能匹配 LoRA

根据上下文和提示词智能匹配最适合的 LoRA。

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」match_loras「末」,
prompt:「始」a beautiful anime girl with long hair「末」,
context:「始」user wants anime style illustration「末」,
max_results:「始」3「末」
<<<[END_TOOL_REQUEST]>>>
```

## 图像生成中的 LoRA 使用

### 方式一：手动指定 LoRA

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」generate_image「末」,
workflow_id:「始」default.json「末」,
prompt:「始」a beautiful anime girl「末」,
loras:「始」[{"lora_name": "anime_style.safetensors", "strength": 0.8}]「末」
<<<[END_TOOL_REQUEST]>>>
```

### 方式二：自动匹配 LoRA

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」VCPComfyUIPlugin「末」,
command:「始」generate_image「末」,
workflow_id:「始」default.json「末」,
prompt:「始」a beautiful anime girl with long hair「末」,
auto_match_lora:「始」true「末」,
max_loras:「始」2「末」
<<<[END_TOOL_REQUEST]>>>
```

## 智能匹配算法

匹配分数计算规则：

| 匹配类型 | 分数 |
|----------|------|
| 触发词匹配 | +15 分 |
| 标签匹配 | +10 分 |
| 兼容风格匹配 | +8 分 |
| 描述关键词匹配 | +2 分/词 |
| 使用频率加权 | +0~5 分 |

## 工作流 LoRA 注入原理

当指定 LoRA 时，插件会：

1. 查找工作流中的模型加载节点
2. 在模型加载节点后创建 LoraLoader 节点
3. 链接模型和 CLIP 输出通过 LoRA 节点
4. 更新后续节点的输入引用

注入后的工作流结构：
```
CheckpointLoader -> LoraLoader_1 -> LoraLoader_2 -> KSampler
                        |                |
                   (LoRA 1)         (LoRA 2)
```

## 最佳实践

### 1. 首次使用
```
# 1. 一键自动建档
auto_register_all_loras(use_civitai=true)

# 2. 检查结果
list_loras()

# 3. 手动调整重要 LoRA
register_lora(lora_name="important.safetensors", description="...")
```

### 2. 日常使用
```
# 生成时自动匹配
generate_image(prompt="...", auto_match_lora=true)
```

### 3. 强度设置建议
- 风格类 LoRA：0.6-0.9
- 角色类 LoRA：0.7-1.0
- 细节增强类：0.5-0.8

## 故障排查

### LoRA 未生效
1. 检查 LoRA 文件是否在 ComfyUI 的 `models/loras` 目录
2. 运行 `list_loras(refresh=true)`
3. 检查工作流是否有模型加载节点

### 自动建档不准确
1. 使用 `register_lora` 手动修正
2. 检查文件名是否包含有意义的关键词
3. 确保网络可访问 Civitai API

### Civitai 获取失败
- 检查网络连接
- 文件名与 Civitai 上的模型名可能不一致
- 使用 `register_lora` 手动添加信息
