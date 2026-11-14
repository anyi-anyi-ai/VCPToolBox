# RunningHubGen · 智能多账号 ComfyUI 云端出图插件

> 基于本地网关 `runninghub2api` (`F:\github\01_API_Gateways\runninghub2api`) 深度对接 RunningHub 海外站，实现多账号粘性节点池分流、每日自动打卡与云端 ComfyUI 工作流调度。

---

## 一、 核心亮点与免费额度说明

| 维度 | 架构规范与说明 |
| :--- | :--- |
| **工作流调度架构** | **云端 ComfyUI 全流程托管**。无需本地高显存，通过 RunningHub 云端算力集群极速渲染复杂工作流。 |
| **多账号与节点池** | **Docker 粘性节点池分流隔离**。<br>• 账号 1 (主账号): 本机宽带直连。<br>• 账号 2~N (副账号): 自动绑定本地 Docker 独立粘性节点代理 (`http://127.0.0.1:2260`)，实现严格 IP 隔离与防关联防封。 |
| **每日免费额度与出图量** | **每日自动签到打卡赚币**。<br>• 每天定时任务自动执行签到打卡并领取每日免费代币。<br>• 10 个账号池每日累计可产生数百金币，**每日可免费出图 50 ~ 150+ 张**（视具体工作流消耗而定）。 |
| **自动守护与容灾** | **服务离线自启**。插件调用时若检测到 8788 网关未启动，自动通过 `python run.py` 在后台静默拉起服务。 |
| **输出格式** | 自动下载生成大图并持久化保存至 `H:\VCP\VCPzhangduan\image\runninghub/`。 |

---

## 二、 支持的模型/工作流清单

| 工作流别名 (`model`) | 底层工作流与能力 | 核心优势与推荐场景 |
| :--- | :--- | :--- |
| **`qwen_image`** *(默认主力)* | **Qwen Image 2.1 旗舰文生图** | 真实感写实光影、细腻质感、手部解剖结构良好，中英文语义理解极佳。 |
| **`dalle_3`** | **DALL-E-3 创意概念工作流** | 抽象概念、插画设计、电影镜头艺术构图。 |
| **`ecommerce`** | **电商商品主图自动场景匹配** | 智能商品主体抠图与商业背景融合，一键生成电商主图与带货海报。 |

---

## 三、 配置与账号维护指引

### 1. 插件配置文件 (`config.env`)
```ini
# 网关基础地址与密钥 (默认无需改动)
RUNNINGHUB_GATEWAY_URL=http://127.0.0.1:8788/v1
RUNNINGHUB_GATEWAY_KEY=sk-rh-adm-master-key

# 本地网关路径 (用于自动守护自启)
RUNNINGHUB_PROJECT_PATH=F:\github\01_API_Gateways\runninghub2api
RUNNINGHUB_PYTHON_CMD=python

# 出图落地目录
SAVE_DIR=H:\VCP\VCPzhangduan\image\runninghub
```

### 2. 账号 Token 更新说明
RunningHub 登录凭证具有生命周期（约 30 天）。当出现 `412 TOKEN_INVALID` 提示时：
1. 打开浏览器登录 [RunningHub 官网](https://www.runninghub.ai)；
2. 按 `F12` 打开开发者工具，在网络请求标头中复制最新的 `Authorization: Bearer <Token>`；
3. 打开本地网关仪表盘：**`http://127.0.0.1:8788/static/index.html`**；
4. 点击「导入/更新账号」，填入最新 Token 即可恢复正常出图。

---

## 四、 调用方式与示例

### 1. VCP 标准收纳箱格式 (`<<<[TOOL_REQUEST]>>>`)

```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」RunningHubGen「末」,
command:「始」RunningHubGenerateImage「末」,
prompt:「始」A beautiful cyberpunk girl standing in Tokyo street, neon lights, 8k photographic「末」,
model:「始」qwen_image「末」,
size:「始」1024x1024「末」
<<<[END_TOOL_REQUEST]>>>
```

### 2. JEV 语义意图调度调用

```text
JEV:「始」请使用 {媒体娱乐} 中的 `RunningHubGen`，围绕【秋日古寺红枫，石阶落叶，清晨阳光】，并参考[qwen_image, 1024x1024]。「末」
```

### 3. CLI 快速自测

```bash
node H:\VCP\VCPzhangduan\VCPToolBox\Plugin\RunningHubGen\RunningHubGen.js --prompt "cyberpunk city" --model "qwen_image"
```
