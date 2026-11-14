# CloudflareAIGen · 官方企业级边缘 AI 绘图插件

> 基于 [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) 官方企业级边缘计算 API 打造的高可靠出图插件。

---

## 一、 核心亮点与免费额度说明

| 维度 | 官方标准与说明 |
| :--- | :--- |
| **官方免费额度** | 每个普通的 Cloudflare 免费账户，**每天固定赠送 10,000 Neurons（神经元算力）**！无需付费升级。 |
| **每日可出图数量** | **每天可稳定免费生成 40 ~ 80 张高分辨率大图**。<br>• `FLUX.1-schnell` 每张约消耗 150~200 Neurons；<br>• `SDXL-Lightning` (4-step) 每张仅消耗约 120 Neurons；<br>• 每天 UTC 00:00（北京时间早上 8:00）自动补满 10,000 Neurons。 |
| **链路稳定性** | **企业级 SLA 99.99%**。依托 Cloudflare 覆盖全球 330+ 城市的顶级 CDN 骨干网络，拒绝任何 503/崩溃，国内直连极快。 |
| **输出格式** | 官方直接返回无损 `image/png` 二进制流，自动落地到本地 `image/cloudflare/` 目录。 |

---

## 二、 支持的模型清单与适用场景

| 模型标识 (`model`) | 架构与模型来源 | 核心优势与推荐场景 | 单张消耗预估 |
| :--- | :--- | :--- | :---: |
| **`@cf/black-forest-labs/flux-1-schnell`** *(默认主力)* | **FLUX.1 官方极速版** (Black Forest Labs) | **构图与画质巅峰**。支持超高精度的画面排版、真实光影渲染、复杂人体姿态与手部细节。 | ~180 Neurons |
| **`@cf/stabilityai/stable-diffusion-xl-base-1.0`** | **SDXL 1.0 经典版** (Stability AI) | **通用艺术大模型**。对欧美奇幻、油画、水彩、电影质感有极强的表现力。 | ~180 Neurons |
| **`@cf/bytedance/stable-diffusion-xl-lightning`** | **SDXL-Lightning 极速版** (字节跳动) | **极速省算力**。仅需 4 步推理，生成耗时不足 2 秒，算力消耗极低（**每天可产出 80+ 张图**）。 | ~120 Neurons |
| **`@cf/lykon/dreamshaper-8-lcm`** | **DreamShaper 8 LCM** (二次元/梦幻) | **动漫立绘与角色肖像**。色彩浓郁、光影通透，极适合生成二次元插画与唯美人物。 | ~150 Neurons |

---

## 三、 获取免费凭证指引 (2分钟完成)

1. 打开并登录 [Cloudflare 控制台](https://dash.cloudflare.com/)（免费注册）；
2. 在控制台首页右侧复制你的 **Account ID**（一串 32 位的十六进制字符串）；
3. 点击右上角「我的个人资料」->「API 令牌 (API Tokens)」->「创建令牌」；
4. 选择「Workers AI」模板（具备 Read 权限），点击完成并复制 **API Token**；
5. 将这两个值填入 `Plugin/CloudflareAIGen/config.env` 中的 `CLOUDFLARE_ACCOUNT_ID` 与 `CLOUDFLARE_API_TOKEN` 即可。

---

## 四、 调用方式与示例

### 1. VCP 原生收纳箱标准调用 (`<<<[TOOL_REQUEST]>>>`)

```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」CloudflareAIGen「末」,
command:「始」CloudflareGenerateImage「末」,
prompt:「始」a futuristic cyberpunk samurai standing in rain, neon reflections, 8k photographic, cinematic lighting「末」,
model:「始」@cf/black-forest-labs/flux-1-schnell「末」,
width:「始」1024「末」,
height:「始」1024「末」
<<<[END_TOOL_REQUEST]>>>
```

### 2. JEV 语义意图自然语言调用

```text
JEV:「始」请使用 {媒体娱乐} 中的 `CloudflareAIGen`，围绕【秋日阳光穿透枫树林的唯美摄影】，并参考[模型: @cf/black-forest-labs/flux-1-schnell, 尺寸: 1024x1024]来完成任务。「末」
```

---

## 五、 完整参数规范表

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :---: | :---: | :---: | :--- |
| `prompt` | string | **是** | - | 画面描述提示词（支持中英文）。 |
| `model` | string | 否 | `flux-1-schnell` | 支持传入完整标识或简写（如 `flux`、`sdxl`、`lightning`、`dreamshaper`）。 |
| `width` | number | 否 | `1024` | 画面宽度。 |
| `height` | number | 否 | `1024` | 画面高度。 |
| `num_steps` | number | 否 | 自动 | 推理步数（Flux 建议 4~8；Lightning 建议 4；SDXL 建议 20~25）。 |
| `guidance` | number | 否 | 自动 | 提示词引导系数 (CFG)（Flux 建议 1.5~3.5；SDXL 建议 7.5）。 |
| `seed` | number | 否 | 随机 | 随机数种子（整数）。 |
| `show_base64` | boolean| 否 | `false`| 是否在响应结果中附带 base64 数据流。 |
