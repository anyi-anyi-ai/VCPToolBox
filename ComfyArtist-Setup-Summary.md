# ComfyArtist Agent 设置完成

## 已完成的工作

### 1. 创建了 ComfyArtist Agent
- **位置**: `H:/VCP/VCPzhangduan/VCPToolBox/Agent/ComfyArtist.txt`
- **功能**: 专业的 AI 图像生成助手
- **支持**: 文生图、图生图、风格迁移、图像编辑

### 2. 创建了 15 个工作流模板

#### Z-Image 系列（7个）
| 模板名 | 类型 | 模型 | 说明 |
|--------|------|------|------|
| `zimage-t2i-fp8` | 文生图 | z-image-turbo-fp8 | **默认推荐** |
| `zimage-t2i-bf16` | 文生图 | z_image_turbo_bf16_nsfw | 高质量 |
| `zimage-t2i-zit-nsw` | 文生图 | ZIT-NSW_Photorealistic_90 | 写实摄影 |
| `zimage-t2i-zit-perfect` | 文生图 | ZIT-完美perfeczion_20 | 完美版 |
| `zimage-i2i-fp8` | 图生图 | z-image-turbo-fp8 | 风格迁移 |
| `zimage-i2i-bf16` | 图生图 | z_image_turbo_bf16_nsfw | NSFW图生图 |
| `zimage-edit-fp8` | 图像修改 | z-image-turbo-fp8 | 图像编辑 |

#### Klein/K2K 系列（8个）
| 模板名 | 类型 | 模型 | 说明 |
|--------|------|------|------|
| `klein-t2i-miracle` | 文生图 | F2K-9b-miracleNSFW | miracleNSFW |
| `klein-t2i-pornmaster` | 文生图 | F2K-9b-pornmaster | pornmaster v4Turbo |
| `klein-t2i-true-v2` | 文生图 | Flux2-Klein-9B-True-v2 | True-v2 |
| `klein-t2i-darkbeast` | 文生图 | F2K-9b-darkBeast | DarkBeast |
| `klein-inpaint-miracle` | 内补重绘 | F2K-9b-miracleNSFW | 局部重绘 |
| `klein-inpaint-true-v2` | 内补重绘 | Flux2-Klein-9B-True-v2 | 局部重绘 |
| `klein-edit-darkbeast` | 图像编辑 | F2K-9b-darkBeast | 图像编辑 |
| `klein-edit-pornmaster` | 图像编辑 | F2K-9b-pornmaster | 图像编辑 |

### 3. 修改了 ComfyUIGen 插件
- **添加图片上传功能**: 支持 URL、本地路径、base64 三种格式
- **新增 `image` 和 `mask` 参数**: 用于图生图和重绘
- **添加 `form-data` 依赖**: 用于 multipart 上传

### 4. 更新了配置文件
- **comfyui-settings.json**:
  - 默认模板: `zimage-t2i-fp8`
  - 分辨率: 1920×1080
  - 清空了 qualityTags（Z-Image 使用中文自然语言）
  - 清空了 negativePrompt（CFG=1 时无效）

## 测试结果

✅ **Z-Image 文生图测试通过** - `zimage-t2i-fp8` 成功生成图片
✅ **Klein 文生图测试通过** - `klein-t2i-miracle` 成功生成图片
✅ **图生图功能测试通过** - `zimage-i2i-fp8` 成功上传图片并生成新图片

## 使用方法

### 在 VCP 中使用 ComfyArtist Agent

1. **选择 Agent**: 在 VCP 中选择 `ComfyArtist` Agent
2. **文生图**: 直接描述你想要的图像
3. **图生图**: 上传图片并描述修改
4. **指定模板**: 在描述中指定模板名

### 示例对话

**文生图：**
```
用户: 帮我画一位年轻女性，在咖啡店看书，晨光透过窗户
ComfyArtist: [调用 zimage-t2i-fp8 生成图像]
```

**图生图：**
```
用户: [上传图片] 把这张图片转换为动漫风格
ComfyArtist: [调用 zimage-i2i-fp8 生成图像]
```

**指定模板：**
```
用户: 用 Klein 模型画一个赛博朋克风格的城市
ComfyArtist: [调用 klein-t2i-miracle 生成图像]
```

## 配置信息

### ComfyUI 服务器
- **地址**: http://127.0.0.1:8818
- **版本**: 0.28.3

### 默认参数
- **分辨率**: 1920×1080
- **采样器**: euler
- **调度器**: simple
- **CFG**: 1（Z-Image/Klein 都是）
- **步数**: 9（Z-Image）/ 8（Klein）

### 图片保存位置
- **本地**: `H:\VCP\VCPzhangduan\VCPToolBox\image\comfyuigen\`
- **URL**: `http://localhost:6005/pw=6668test/images/comfyuigen/`

## 文件清单

### Agent 配置
- `H:/VCP/VCPzhangduan/VCPToolBox/Agent/ComfyArtist.txt`
- `H:/VCP/VCPzhangduan/VCPToolBox/Agent/ComfyArtist-README.md`

### 工作流模板
- `H:/VCP/VCPzhangduan/VCPToolBox/Plugin/ComfyUIGen/workflows/zimage-*.json` (7个)
- `H:/VCP/VCPzhangduan/VCPToolBox/Plugin/ComfyUIGen/workflows/klein-*.json` (8个)

### 插件代码
- `H:/VCP/VCPzhangduan/VCPToolBox/Plugin/ComfyUIGen/ComfyUIGen.js` (已修改)
- `H:/VCP/VCPzhangduan/VCPToolBox/Plugin/ComfyUIGen/package.json` (已更新)

### 配置文件
- `H:/VCP/VCPzhangduan/VCPToolBox/Plugin/ComfyUIGen/comfyui-settings.json` (已更新)

### 测试脚本
- `H:/VCP/VCPzhangduan/VCPToolBox/test-comfyartist.sh`

## 下一步

1. **在 VCP 中加载 ComfyArtist Agent**
2. **测试完整的对话流程**
3. **根据需要调整提示词指南**
4. **添加更多工作流模板（如视频生成）**

## 故障排除

### 图片生成失败
1. 检查 ComfyUI 是否运行（端口 8818）
2. 检查模型文件是否存在
3. 查看 ComfyUI 控制台错误信息

### 图片质量不佳
1. 尝试使用不同的模板
2. 优化提示词描述
3. 调整分辨率（1920×1080 或 1024×1024）

### 图生图失败
1. 确保图片路径正确
2. 检查图片格式（支持 PNG、JPG）
3. 确认图片可访问

## 更新日志

### 2026-07-26
- 创建 ComfyArtist Agent
- 添加 15 个工作流模板
- 修改 ComfyUIGen 插件支持图片上传
- 更新配置文件
- 完成测试
