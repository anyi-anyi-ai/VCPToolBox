#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

// 1. 加载本地 config.env
function loadLocalEnv() {
    const envPath = path.join(__dirname, 'config.env');
    if (fs.existsSync(envPath)) {
        try {
            const content = fs.readFileSync(envPath, 'utf8');
            for (const line of content.split(/\r?\n/)) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                    const idx = trimmed.indexOf('=');
                    const key = trimmed.slice(0, idx).trim();
                    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
                    if (key && !(key in process.env)) {
                        process.env[key] = val;
                    }
                }
            }
        } catch (_) {}
    }
}
loadLocalEnv();

const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || path.resolve(__dirname, '../../..');
const RUNNINGHUB_GATEWAY_URL = (process.env.RUNNINGHUB_GATEWAY_URL || 'http://127.0.0.1:8788/v1').replace(/\/+$/, '');
const RUNNINGHUB_GATEWAY_KEY = process.env.RUNNINGHUB_GATEWAY_KEY || 'sk-rh-adm-master-key';
const RUNNINGHUB_PROJECT_PATH = process.env.RUNNINGHUB_PROJECT_PATH || 'F:\\github\\01_API_Gateways\\runninghub2api';
const RUNNINGHUB_PYTHON_CMD = process.env.RUNNINGHUB_PYTHON_CMD || 'python';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'qwen_image';

const SAVE_DIR = process.env.SAVE_DIR
    ? path.resolve(process.env.SAVE_DIR)
    : path.join(PROJECT_BASE_PATH, 'image', 'runninghub');

if (!fs.existsSync(SAVE_DIR)) {
    try {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
    } catch (_) {}
}

/**
 * 模型别名映射表 (友好简称 -> runninghub2api 内部工作流别名)
 */
function mapModelAlias(inputModel) {
    if (!inputModel) return 'qwen-image';
    const m = String(inputModel).trim().toLowerCase();
    const map = {
        'qwen_image': 'qwen-image',
        'qwen': 'qwen-image',
        'qwen-image': 'qwen-image',
        '通义': 'qwen-image',
        '千问': 'qwen-image',
        'dalle_3': 'dall-e-3',
        'dalle3': 'dall-e-3',
        'dall-e-3': 'dall-e-3',
        'dalle': 'dall-e-3',
        'ecommerce': 'e-commerce-product-main-image-automatic-matching-scenes',
        'e-commerce': 'e-commerce-product-main-image-automatic-matching-scenes',
        'e-commerce-product-main-image-automatic-matching-scenes': 'e-commerce-product-main-image-automatic-matching-scenes',
        '电商': 'e-commerce-product-main-image-automatic-matching-scenes',
        '电商主图': 'e-commerce-product-main-image-automatic-matching-scenes',
        '商品': 'e-commerce-product-main-image-automatic-matching-scenes'
    };
    return map[m] || m;
}

/**
 * 守护与自启动检测
 * 若本地 8788 端口未响应，自动尝试从 RUNNINGHUB_PROJECT_PATH 后台拉起服务
 */
async function ensureGatewayRunning() {
    let healthUrl = 'http://127.0.0.1:8788/health';
    try {
        const u = new URL(RUNNINGHUB_GATEWAY_URL);
        healthUrl = `${u.protocol}//${u.host}/health`;
    } catch (_) {}

    const checkAlive = async () => {
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 1200);
            const res = await fetch(healthUrl, { signal: controller.signal });
            clearTimeout(tid);
            return res.ok;
        } catch (_) {
            return false;
        }
    };

    if (await checkAlive()) {
        return true;
    }

    // 服务未就绪，尝试自动拉起
    if (fs.existsSync(RUNNINGHUB_PROJECT_PATH)) {
        try {
            const runScript = path.join(RUNNINGHUB_PROJECT_PATH, 'run.py');
            if (fs.existsSync(runScript)) {
                const child = spawn(RUNNINGHUB_PYTHON_CMD, ['run.py'], {
                    cwd: RUNNINGHUB_PROJECT_PATH,
                    detached: true,
                    stdio: 'ignore',
                    windowsHide: true
                });
                child.unref();

                // 轮询等待最多 8 秒
                const start = Date.now();
                while (Date.now() - start < 8000) {
                    await new Promise(r => setTimeout(r, 600));
                    if (await checkAlive()) {
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn(`[RunningHubGen] 尝试拉起网关异常: ${e.message}`);
        }
    }

    return await checkAlive();
}

/**
 * 解析输入参数 (兼容 VCP 标记语法、标准 JSON 与命令行参数)
 */
function parseRawInput(raw) {
    let text = String(raw || '').trim();
    if (!text) return null;

    // 1. 去除 UTF-8 BOM
    text = text.replace(/^\uFEFF/, '');

    // 2. 检查 VCP 传统标签 <<<[TOOL_REQUEST]>>> ... <<<[END_TOOL_REQUEST]>>>
    const match = text.match(/<<<\[TOOL_REQUEST\]>>>([\s\S]*?)<<<\[(?:END_TOOL_REQUEST|TOOL_REQUEST_END)\]>>>/i);
    const body = match ? match[1].trim() : text;

    // 3. 尝试解析「始」...「末」格式
    if (body.includes('「始」') && body.includes('「末」')) {
        const result = {};
        const regex = /(\w+)\s*:\s*「始」([\s\S]*?)「末」/g;
        let m;
        while ((m = regex.exec(body)) !== null) {
            result[m[1]] = m[2].trim();
        }
        if (Object.keys(result).length > 0) {
            return result;
        }
    }

    // 4. 尝试 JSON 解析
    try {
        const json = JSON.parse(body);
        if (json && typeof json === 'object') {
            // 支持参数包裹在 parameters 或 args 中的形态
            if (json.parameters && typeof json.parameters === 'object') {
                return { ...json, ...json.parameters };
            }
            return json;
        }
    } catch (_) {}

    return null;
}

function parseCliArgs() {
    const argv = process.argv.slice(2);
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--prompt' && argv[i + 1]) args.prompt = argv[++i];
        else if (arg === '--model' && argv[i + 1]) args.model = argv[++i];
        else if (arg === '--size' && argv[i + 1]) args.size = argv[++i];
        else if (arg === '--command' && argv[i + 1]) args.command = argv[++i];
        else if (arg === '--showbase64') args.showbase64 = true;
    }
    return Object.keys(args).length > 0 ? args : null;
}

/**
 * 执行生图主流程
 */
async function generateImage(params) {
    const prompt = (params.prompt || params.p || '').trim();
    if (!prompt) {
        throw new Error("缺少必需参数 'prompt' (生图提示词)。");
    }

    const rawModel = params.model || DEFAULT_MODEL;
    const targetModel = mapModelAlias(rawModel);
    const size = params.size || '1024x1024';
    const showBase64 = params.showbase64 === true || params.showbase64 === 'true';

    // 确保本地网关在线
    const isAlive = await ensureGatewayRunning();
    if (!isAlive) {
        throw new Error(
            `无法连接到 RunningHub2API 本地网关 (${RUNNINGHUB_GATEWAY_URL})。\n` +
            `请确认服务已启动，或检查项目路径: ${RUNNINGHUB_PROJECT_PATH}`
        );
    }

    const endpoint = `${RUNNINGHUB_GATEWAY_URL}/images/generations`;
    const payload = {
        model: targetModel,
        prompt: prompt,
        size: size,
        n: 1
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 分钟超时 (ComfyUI 执行队列)

    let response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RUNNINGHUB_GATEWAY_KEY}`
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
    } catch (e) {
        clearTimeout(timeoutId);
        throw new Error(`请求 RunningHub 网关失败: ${e.message}`);
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
        let errText = '';
        try {
            const errJson = await response.json();
            errText = errJson.detail || JSON.stringify(errJson);
        } catch (_) {
            errText = await response.text();
        }

        if (errText.includes('TOKEN_INVALID') || errText.includes('412')) {
            throw new Error(
                `RunningHub 账号登录凭证已失效 (412 TOKEN_INVALID)。\n` +
                `【解决方案】\n` +
                `1. 登录 RunningHub 官网: https://www.runninghub.ai\n` +
                `2. 在浏览器 F12 网络请求中复制最新 Authorization Token\n` +
                `3. 打开网关控制台: http://127.0.0.1:8788/static/index.html 更新或重新导入账号。`
            );
        }

        throw new Error(`RunningHub 网关返回错误 (HTTP ${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0 || !data.data[0].url) {
        throw new Error(`RunningHub 网关未返回有效的图片 URL: ${JSON.stringify(data).slice(0, 200)}`);
    }

    const remoteUrl = data.data[0].url;

    // 下载生成的图片至本地 SAVE_DIR
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const randomHex = crypto.randomBytes(4).toString('hex');
    const filename = `rh_${timestamp}_${randomHex}.png`;
    const localFilePath = path.join(SAVE_DIR, filename);

    let imageBuffer;
    // 若返回的是本地 outputs 路径的直链，可优先从 outputs 本地文件读取
    const matchOutputs = remoteUrl.match(/\/outputs\/([^/?#]+)/);
    let copiedDirectly = false;
    if (matchOutputs && RUNNINGHUB_PROJECT_PATH) {
        const directSource = path.join(RUNNINGHUB_PROJECT_PATH, 'data', 'outputs', matchOutputs[1]);
        if (fs.existsSync(directSource)) {
            try {
                fs.copyFileSync(directSource, localFilePath);
                imageBuffer = fs.readFileSync(localFilePath);
                copiedDirectly = true;
            } catch (_) {}
        }
    }

    if (!copiedDirectly) {
        const dlRes = await fetch(remoteUrl);
        if (!dlRes.ok) {
            throw new Error(`下载生成图像失败 (HTTP ${dlRes.status}) from: ${remoteUrl}`);
        }
        const arrayBuf = await dlRes.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
        fs.writeFileSync(localFilePath, imageBuffer);
    }

    const relativeImagePath = path.relative(PROJECT_BASE_PATH, localFilePath).replace(/\\/g, '/');
    const localFileUrl = `file:///${localFilePath.replace(/\\/g, '/')}`;

    const content = [
        {
            type: 'text',
            text: `✨ 图片已由 RunningHub 云端 ComfyUI 工作流成功生成！\n\n` +
                  `- 调度工作流: ${targetModel}\n` +
                  `- 提示词: ${prompt}\n` +
                  `- 出图规格: ${size}\n` +
                  `- 本地文件: [${filename}](${localFileUrl})\n` +
                  `- 网关直链: ${remoteUrl}\n\n` +
                  `【多账号与节点池】已通过 runninghub2api 自动分配可用账号与粘性节点通道，隔离防封保障。`
        }
    ];

    if (showBase64 && imageBuffer) {
        content.push({
            type: 'image_url',
            image_url: {
                url: `data:image/png;base64,${imageBuffer.toString('base64')}`
            }
        });
    }

    return {
        content,
        details: {
            model: targetModel,
            size,
            localPath: localFilePath,
            relativePath: relativeImagePath,
            remoteUrl,
            filename
        }
    };
}

async function main() {
    try {
        let parsedArgs = parseCliArgs();
        if (!parsedArgs) {
            const inputChunks = [];
            for await (const chunk of process.stdin) {
                inputChunks.push(chunk);
            }
            const inputData = inputChunks.join('').trim();
            parsedArgs = parseRawInput(inputData);
        }

        if (!parsedArgs) {
            throw new Error('未收到有效的生图参数 (可通过 stdin 传递 JSON，或使用 CLI 参数 --prompt <内容>)。');
        }

        const result = await generateImage(parsedArgs);

        console.log(JSON.stringify({
            status: 'success',
            result
        }));
    } catch (err) {
        console.log(JSON.stringify({
            status: 'error',
            error: `RunningHubGen 插件错误: ${err.message}`
        }));
        process.exit(1);
    }
}

main();
