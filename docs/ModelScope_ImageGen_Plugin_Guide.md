# VCPToolBox 魔搭(ModelScope) 绘图插件执行说明

本说明文档面向 VCPToolBox 开发者与测试人员，旨在指导如何从零开始，使用魔搭（ModelScope）提供的免费 API 接入文生图能力，实现“输入提示词 -> 生成图片 -> 在 VCP 中展示/保存”的完整链路。

---

## 1. 前置准备与环境要求

### 1.1 环境要求
- **Node.js**: 建议 Node.js 18.x 或以上版本（VCPToolBox 运行基础）。
- **网络要求**: 确保运行 VCPToolBox 的服务器/本地机器能够访问公网，特别是 `https://api-inference.modelscope.cn`。
- **依赖安装**:
  若插件采用 Node.js (JavaScript/MJS) 编写，通常只需内置的 `fetch` 或安装 `axios` 等 HTTP 请求库。如果需要处理图像数据，可能需要文件系统读写权限（Node.js 内置的 `fs` 模块）。
  *(注: 魔搭官方提供了 Python 的 requests 示例，但在 VCPToolBox 插件体系中，推荐使用 Node.js 原生 fetch 或 axios 以保持统一。)*

### 1.2 获取 ModelScope API Token
1. **注册账号**: 访问 [ModelScope 官网](https://www.modelscope.cn/) 注册并登录。
2. **实名认证与绑定**: 注意，账号注册后需**绑定阿里云账号**，并且**通过实名认证**后才可使用 API-Inference 免费服务。
3. **获取 Token**: 访问 [我的 Access Token](https://modelscope.cn/my/myaccesstoken) 页面，复制您的 SDK Token。

---

## 2. 插件结构与配置规范

VCPToolBox 插件采用扁平化目录结构。我们将创建一个名为 `ModelScopeImageGen` 的新插件。

### 2.1 目录位置
将插件放置在 VCPToolBox 根目录下的 `Plugin/` 文件夹中：
```text
VCPToolBox/
  └─ Plugin/
       └─ ModelScopeImageGen/
            ├─ config.env.example       # 配置模板
            ├─ plugin-manifest.json     # 插件声明文件
            ├─ ModelScopeImageGen.mjs   # 核心执行代码
            └─ README.md                # 插件说明
```

### 2.2 配置文件 (`config.env.example`)
创建一个配置模板，方便用户在实际运行前拷贝为 `config.env` 并填入密钥：
```env
# 魔搭 API Access Token
MODELSCOPE_API_KEY=your_token_here

# 默认模型ID (例如 Qwen-Image 或 SD 系列)
MODELSCOPE_DEFAULT_MODEL=Qwen/Qwen-Image

# 默认生成参数
MODELSCOPE_DEFAULT_SIZE=1024x1024
MODELSCOPE_DEFAULT_STEPS=30

# 图片输出目录 (相对于 VCPToolBox 根目录)
MODELSCOPE_OUTPUT_DIR=image/modelscope_gen
```
*运行时读取：在插件加载时，通过 VCPToolBox 的环境变量读取机制（如 `process.env.MODELSCOPE_API_KEY`）获取配置。支持热更新的话，可监听配置重载事件。*

---

## 3. 核心能力与交互流程

根据魔搭 API 文档，该插件应具备以下核心交互链路：

1. **接收输入**: 接收来自 VCP 的用户提示词（Prompt）、可选的负面提示词（Negative Prompt）、以及尺寸（Size）等参数。
2. **任务提交 (异步)**: 向魔搭 API 发送 `POST` 请求（带有 `X-ModelScope-Async-Mode: true` 头），提交生成任务，并获取 `task_id`。
3. **轮询状态**: 拿到 `task_id` 后，通过定时发送 `GET` 请求（每 5 秒）轮询任务状态（`task_status`），直到状态变为 `SUCCEED` 或 `FAILED`。
4. **获取结果并保存**: 状态成功后，从 `output_images` 字段提取图片 URL，下载图片数据并保存至本地目录（如 `image/modelscope_gen`）。
5. **返回给前端**: 将生成的本地文件路径（如 `![Generated Image](image/modelscope_gen/xxx.jpg)`）作为结果返回给 VCPToolBox 前端展示。
6. **失败与超时处理**: 若轮询超过设定次数（如 60 秒）或返回 `FAILED`，抛出明确错误并中断。

### 支持的核心参数
*注：以下参数基于当前 API 文档支持情况。*
- **model**: 必填，AIGC 模型 ID（如 `Qwen/Qwen-Image`）。
- **prompt**: 必填，正向提示词（建议英文，长度<2000）。
- **negative_prompt**: 可选，负向提示词。
- **size**: 可选，分辨率（如 `1024x1024`）。
- **seed**: 可选，随机种子。
- **steps**: 可选，采样步数。
- **guidance**: 可选，提示词引导系数。

---

## 4. 请求与响应示例 (Node.js Fetch 示例)

以下演示如何在 Node.js 环境中发起请求、轮询并下载图片。

```javascript
import fs from 'fs/promises';
import path from 'path';

const API_KEY = process.env.MODELSCOPE_API_KEY;
const BASE_URL = 'https://api-inference.modelscope.cn/';
const COMMON_HEADERS = {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
};

// 1. 提交生成任务
async function submitImageTask(prompt) {
    const response = await fetch(`${BASE_URL}v1/images/generations`, {
        method: 'POST',
        headers: {
            ...COMMON_HEADERS,
            "X-ModelScope-Async-Mode": "true"
        },
        body: JSON.stringify({
            model: "Qwen/Qwen-Image",
            prompt: prompt,
            size: "1024x1024" // 可选参数
        })
    });

    if (!response.ok) throw new Error(`Submit Failed: ${response.statusText}`);
    const data = await response.json();
    return data.task_id; // 返回任务 ID
}

// 2. 轮询任务状态并下载结果
async function pollAndDownload(taskId, outputDir) {
    const maxRetries = 20; // 最大轮询次数
    let attempts = 0;

    while (attempts < maxRetries) {
        const response = await fetch(`${BASE_URL}v1/tasks/${taskId}`, {
            headers: {
                ...COMMON_HEADERS,
                "X-ModelScope-Task-Type": "image_generation"
            }
        });
        
        if (!response.ok) throw new Error(`Poll Failed: ${response.statusText}`);
        const data = await response.json();

        if (data.task_status === 'SUCCEED') {
            const imgUrl = data.output_images[0];
            return await downloadImage(imgUrl, outputDir);
        } else if (data.task_status === 'FAILED') {
            throw new Error('Image generation failed by API.');
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000)); // 暂停 5 秒
    }
    throw new Error('Task timeout.');
}

// 3. 下载并保存图片
async function downloadImage(url, outputDir) {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    const filename = `modelscope_${Date.now()}.jpg`;
    const filepath = path.join(outputDir, filename);
    
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    return filepath;
}
```

---

## 5. 运行与调试指南

### 5.1 如何启用与加载
1. 确保 `Plugin/ModelScopeImageGen` 目录包含正确的 `plugin-manifest.json`（不带 `.block` 后缀）。
2. 在插件目录下复制 `config.env.example` 为 `config.env`，并填入您的 `MODELSCOPE_API_KEY`。
3. 重启 VCPToolBox 服务器 (`node server.js` 或 PM2)。观察启动日志，确认插件被成功加载。

### 5.2 常见问题排查 (Troubleshooting)

- **401 Unauthorized**:
  - **原因**: Token 错误、未配置、或账号未实名认证/未绑定阿里云账号。
  - **解决**: 检查 `config.env`；登录魔搭控制台确认账号状态。
- **429 Too Many Requests**:
  - **原因**: 触发了免费额度限流。
  - **解决**: 降低调用频率，或考虑通过 API-Provider 绑定外部计费账号。
- **返回体为空或报错**:
  - **解决**: 检查传参。特别是部分模型不支持 `size` 或 `negative_prompt`，请用最小请求（仅 `model` 和 `prompt`）进行探测验证。
- **日志查看**:
  - 在 VCPToolBox 中，使用内建的日志面板 (`AdminPanel`)，或查看终端输出，确认请求的 Payload 和 API 响应状态。

---

## 6. 安全与合规提醒

1. **Token 保护**: **切勿**将真实的 `config.env` 文件提交到代码仓库（Git）。请确保 `.gitignore` 中包含 `config.env`。
2. **日志脱敏**: 在打印请求/响应日志时，注意屏蔽 `Authorization` Header 中的 Token。
3. **内容安全**: 用户输入的 Prompt 建议在插件层进行基本过滤，防止恶意注入或触发 API 侧的严格审查导致账号封禁。
4. **免费额度警告**: API-Inference 免费提供但有限流。在并发场景下极易触发 429 错误。插件必须实现健壮的重试机制，并在配额耗尽时优雅地通知用户。

*(注：本文档中的模型与参数说明基于当前魔搭 API-Inference 文档。由于模型可能上下线，具体参数支持度请以当前在线 API 响应为准。若遇异常，建议先采用最小参数进行探测。)*
