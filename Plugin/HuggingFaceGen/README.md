# HuggingFaceGen · 全球开源大本营官方 AI 绘图插件

> 基于 [Hugging Face](https://huggingface.co/) 官方 Serverless Inference API 打造的无服务器绘图插件。

---

## 一、 核心亮点与免费额度说明

| 维度 | 官方标准与说明 |
| :--- | :--- |
| **官方免费额度** | 注册任何 Hugging Face 普通账号，即可在个人设置中生成免费的 `User Access Token`（Read 权限）。官方为每个免费开发者提供**每月充足的 Serverless 推理请求（Free Tier / Free Requests）**。 |
| **每日/每月可出图数量** | **每月可稳定免费生成数百至上千张高清图片**（日均约可出 20~50 张）。对于个人开发者日常探索、插画生成、角色设定完全免费充裕。 |
| **开源生态支持** | 接入全球最大的开源模型社区，不仅支持官方收录的黑森林 FLUX.1、Stability AI 官方模型，**还允许传入任意公开的开源文生图模型仓库 ID**。 |
| **网络与输出** | 官方直接流式返回完整图片二进制，自动落地保存至本地 `image/huggingface/` 目录。 |

---

## 二、 支持的模型清单与适用场景

插件内置支持 4 大顶尖模型快捷简写，并允许传入任意公开的社区模型 ID：

| 模型标识 (`model`) | 模型名称与特化方向 | 核心优势与适用场景 |
| :--- | :--- | :--- |
| **`black-forest-labs/FLUX.1-schnell`** *(默认主力)* | **FLUX.1 官方极速版** | **画质天花板**。原作者团队官方模型，支持极高的细节表现力、光影渲染、复杂空间透视与英文文字渲染。 |
| **`cagliostrolab/animagine-xl-3.1`** | **Animagine XL 3.1** (二次元最强) | **日系二次元动漫领域神级模型**。完美支持 Danbooru 标签体系，对番剧角色、二次元少女、机甲立绘呈现极佳。 |
| **`stabilityai/stable-diffusion-xl-base-1.0`** | **SDXL 1.0 官方基底** | **经典艺术与欧美奇幻**。构图大气，适合油画、概念艺术插画与场景设计。 |
| **`ByteDance/SDXL-Lightning`** | **SDXL-Lightning 4-step** | **极速省流**。仅需 4 步推理，生成耗时低至 2 秒，适合快速生成概念草图。 |
| **`自定义 HF 仓库名`** *(扩展)* | 如 `prompthero/openjourney` 等 | 直接在参数中传入 `作者/模型名` 即可自由调用 HF 上成千上万的微调模型！ |

---

## 三、 获取免费 Token 指引 (1分钟完成)

1. 打开并登录 [Hugging Face 官网](https://huggingface.co/)（免费注册账号）；
2. 点击右上角个人头像 -> 进入 **Settings**；
3. 在左侧菜单点击 **Access Tokens**；
4. 点击 **Create new token**，名称随意填写（如 `vcp-image`），权限类型选择 **Read**（只读免费），点击生成并复制该 Token（格式为 `hf_xxxxxxxxxxxxxxxx`）；
5. 将其填入 `Plugin/HuggingFaceGen/config.env` 中的 `HUGGINGFACE_API_TOKEN` 即可。

---

## 四、 调用方式与示例

### 1. VCP 原生收纳箱标准调用 (`<<<[TOOL_REQUEST]>>>`)

```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」HuggingFaceGen「末」,
command:「始」HuggingFaceGenerateImage「末」,
prompt:「始」masterpiece, best quality, 1girl, hatsune miku, concert stage, glow sticks, 8k resolution「末」,
model:「始」cagliostrolab/animagine-xl-3.1「末」,
width:「始」1024「末」,
height:「始」1024「末」
<<<[END_TOOL_REQUEST]>>>
```

### 2. JEV 语义意图自然语言调用

```text
JEV:「始」请使用 {媒体娱乐} 中的 `HuggingFaceGen`，围绕【宏伟的未来赛博朋克大都市高空全景】，并参考[模型: black-forest-labs/FLUX.1-schnell, 尺寸: 1024x1024]来完成任务。「末」
```

---

## 五、 完整参数规范表

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :---: | :---: | :---: | :--- |
| `prompt` | string | **是** | - | 画面描述提示词（英文效果最佳，二次元模型支持标签式描述）。 |
| `model` | string | 否 | `FLUX.1-schnell` | 模型 ID（支持简写如 `flux`, `anime`, `animagine`, `sdxl` 或完整 HF 路径）。 |
| `negative_prompt` | string | 否 | - | 负面提示词（用于排除低画质、变形、水印等）。 |
| `width` | number | 否 | `1024` | 画面宽度。 |
| `height` | number | 否 | `1024` | 画面高度。 |
| `num_inference_steps` | number | 否 | 自动 | 推理步数（Flux 建议 4~8；Animagine 建议 28；Lightning 建议 4）。 |
| `guidance_scale` | number | 否 | 自动 | 提示词引导系数 (CFG)（Anime 建议 7.0；Flux 建议 2.5~3.5）。 |
| `seed` | number | 否 | 随机 | 随机数种子（整数）。 |
| `show_base64` | boolean| 否 | `false`| 是否在响应结果中附带 base64 数据流。 |
