# PollinationsGen · 极速开源免费绘图插件

> 基于 [Pollinations.ai](https://pollinations.ai/) 官方公共 API 打造的零门槛、免 Key、全天候高可用生图插件。

---

## 一、 核心亮点与免费额度说明

| 维度 | 说明 |
| :--- | :--- |
| **免费额度** | **永久 100% 免费**，无需注册账号，无需绑定信用卡，无需配置任何 API Key。 |
| **每日可出图数量** | **理论无上限（每日可出几百至上千张）**。公共节点仅有宽松的单 IP 频率限制，日常连续调用完全畅通。 |
| **出图速度** | 采用分布式全球边缘 CDN，单张生成耗时通常仅需 **2 ~ 5 秒**。 |
| **水印与商用** | 默认开启 `nologo=true`，**纯净无水印**输出。基于开源 FLUX 架构，商用友好。 |
| **存储策略** | 自动下载生成的二进制图片并转存到本地 `image/pollinations/` 目录，生成永久有效的本地磁盘链接与直链。 |

---

## 二、 支持的模型清单与适用场景

插件内置支持 5 大精选模型生态（在参数中通过 `model` 字段指定，默认 `flux`）：

| 模型标识 (`model`) | 模型名称与架构 | 核心擅长与适用场景 |
| :--- | :--- | :--- |
| **`flux`** *(默认)* | **FLUX.1-schnell** | **综合画质最高**。精准的提示词对齐、复杂空间透视、清晰的英文排版印刷与光影渲染。 |
| **`flux-realism`** | **FLUX Realism 特化** | **超写实人像摄影与胶片质感**。皮肤纹理、景深虚化、单反微距真实感极强。 |
| **`flux-anime`** | **FLUX Anime 二次元特化** | **日系动漫、轻小说插画与赛博风格**。发丝细腻、色彩明艳，契合角色立绘与壁纸。 |
| **`flux-3d`** | **FLUX 3D 渲染器** | **C4D / Blender 3D 卡通与盲盒手办风格**。适合图标、立体场景与潮玩设计。 |
| **`turbo`** | **SDXL Turbo 极速版** | **亚秒级出图**。适合快速概念草图预览与头脑风暴，对细节要求不高但追求极速的场景。 |

---

## 三、 调用方式与示例

### 1. VCP 原生收纳箱标准调用 (`<<<[TOOL_REQUEST]>>>`)

```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PollinationsGen「末」,
command:「始」PollinationsGenerate「末」,
prompt:「始」masterpiece, best quality, 1girl, silver hair, glowing blue eyes, cyberpunk city street, neon lights, 8k resolution「末」,
model:「始」flux-anime「末」,
width:「始」1024「末」,
height:「始」1024「末」
<<<[END_TOOL_REQUEST]>>>
```

### 2. JEV 语义意图自然语言调用

```text
JEV:「始」请使用 {媒体娱乐} 中的 `PollinationsGen`，围绕【赛博朋克雨夜街道中的银发少女】，并参考[模型: flux-anime, 尺寸: 1024x1024]来完成任务。「末」
```

---

## 四、 完整参数规范表

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :---: | :---: | :---: | :--- |
| `prompt` | string | **是** | - | 画面描述提示词，支持中英文（英文提示词在细节控制上更精准）。 |
| `model` | string | 否 | `flux` | 绘图模型：`flux`、`flux-realism`、`flux-anime`、`flux-3d`、`turbo`。 |
| `width` | number | 否 | `1024` | 画面宽度，范围 256 ~ 2048。 |
| `height` | number | 否 | `1024` | 画面高度，范围 256 ~ 2048。 |
| `seed` | number | 否 | 随机 | 随机数种子（整数）。固定种子可在微调提示词时保持人物长相与构图不变。 |
| `nologo` | boolean| 否 | `true` | 是否去除图片右下角水印（默认开启纯净无水印）。 |
| `enhance` | boolean| 否 | `false`| 是否启用 Pollinations 官方 LLM 自动扩展丰富提示词。 |
| `show_base64` | boolean| 否 | `false`| 是否在响应结果中附带 base64 数据流。 |

---

## 五、 本地测试与排错

你可以直接在终端中管道输入测试本插件：
```powershell
echo '{"prompt": "cute cat in a garden", "model": "flux"}' | node H:\VCP\VCPzhangduan\VCPToolBox\Plugin\PollinationsGen\PollinationsGen.js
```
- 若因网络策略无法连接 `image.pollinations.ai`，在 `config.env` 中配置 `HTTP_PROXY=http://127.0.0.1:7890` 即可畅通无阻。
