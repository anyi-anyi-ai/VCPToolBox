#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 优先读取同目录下的 config.env
const envPath = path.join(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        for (const line of envContent.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [k, ...v] = trimmed.split('=');
                const key = k.trim();
                const val = v.join('=').trim().replace(/^["']|["']$/g, '');
                if (key && !(key in process.env)) {
                    process.env[key] = val;
                }
            }
        }
    } catch (_) {}
}

const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'black-forest-labs/FLUX.1-schnell';
const ROTATION_STRATEGY = (process.env.ROTATION_STRATEGY || 'failover').toLowerCase();
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || path.resolve(__dirname, '../../..');

const SAVE_DIR = process.env.SAVE_DIR
    ? path.resolve(process.env.SAVE_DIR)
    : path.join(PROJECT_BASE_PATH, 'image', 'huggingface');

if (!fs.existsSync(SAVE_DIR)) {
    try {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
    } catch (_) {}
}

/**
 * Hugging Face 账号池管理器
 * 规则：
 * 1. 账号 1 (主账号): 强制本机原生宽带网络直连，不走代理。
 * 2. 账号 2 及往后 (副账号): 走本地 Docker 粘性节点池代理 (如 http://127.0.0.1:2260)。
 */
class HFAccountPoolManager {
    constructor() {
        this.accounts = [];
        this.currentIndex = 0;
        this._loadAccounts();
    }

    _loadAccounts() {
        this.accounts = [];

        // 1. 主账号 (本机直连)
        const primaryToken = process.env.HUGGINGFACE_API_TOKEN || '';
        if (primaryToken) {
            this.accounts.push({
                id: 'primary (本机直连)',
                apiToken: primaryToken,
                isPrimary: true,
                proxy: null,
                stickyHeader: null,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                cooldownUntil: 0
            });
        }

        // 2. 结构化 JSON 格式副账号
        if (process.env.HUGGINGFACE_ACCOUNTS) {
            try {
                const parsed = JSON.parse(process.env.HUGGINGFACE_ACCOUNTS);
                if (Array.isArray(parsed)) {
                    parsed.forEach((acc, idx) => {
                        if (acc.apiToken) {
                            const isFirst = this.accounts.length === 0 && idx === 0;
                            this.accounts.push({
                                id: acc.id || `account_${idx + 1}`,
                                apiToken: acc.apiToken,
                                isPrimary: isFirst || acc.isPrimary === true,
                                proxy: isFirst ? null : (acc.proxy || process.env.DOCKER_STICKY_PROXY || null),
                                stickyHeader: acc.stickyHeader || acc.proxyHeader || null,
                                userAgent: acc.userAgent || `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/12${idx}.0.0.0 Safari/537.36`,
                                cooldownUntil: 0
                            });
                        }
                    });
                }
            } catch (e) {
                console.error(`[HuggingFaceGen] 解析 HUGGINGFACE_ACCOUNTS JSON 失败: ${e.message}`);
            }
        }

        // 3. 多行副账号配置 (HUGGINGFACE_SECONDARY_ACCOUNT_2, 3...)
        // 格式: ApiToken,ProxyUrl,StickyNodeValue
        for (let i = 2; i <= 20; i++) {
            const secVal = process.env[`HUGGINGFACE_SECONDARY_ACCOUNT_${i}`];
            if (!secVal) continue;
            const parts = secVal.split(',').map(s => s.trim());
            if (parts.length >= 1 && parts[0]) {
                const apiToken = parts[0];
                const proxyUrl = parts[1] || process.env.DOCKER_STICKY_PROXY || 'http://127.0.0.1:2260';
                const stickyNode = parts[2] || `hf-node-${i}`;

                this.accounts.push({
                    id: `secondary_${i} (粘性节点:${stickyNode})`,
                    apiToken,
                    isPrimary: false,
                    proxy: proxyUrl,
                    stickyHeader: { 'Proxy-Session': stickyNode, 'X-Sticky-Node': stickyNode },
                    userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/12${i}.0.0.0 Safari/537.36`,
                    cooldownUntil: 0
                });
            }
        }
    }

    getAvailableAccount() {
        if (this.accounts.length === 0) {
            throw new Error('未配置任何 Hugging Face 凭证。请在 config.env 中填入 HUGGINGFACE_API_TOKEN。');
        }

        const now = Date.now();
        const activeAccounts = this.accounts.filter(acc => acc.cooldownUntil <= now);

        if (activeAccounts.length === 0) {
            const nearestReset = Math.min(...this.accounts.map(a => a.cooldownUntil));
            const waitMinutes = Math.max(1, Math.round((nearestReset - now) / 60000));
            throw new Error(`所有 Hugging Face 账号当前均处于请求冷却中，预计将在 ${waitMinutes} 分钟后恢复。`);
        }

        if (ROTATION_STRATEGY === 'failover') {
            const primary = activeAccounts.find(a => a.isPrimary);
            if (primary) return primary;
            return activeAccounts[0];
        } else {
            const acc = activeAccounts[this.currentIndex % activeAccounts.length];
            this.currentIndex = (this.currentIndex + 1) % activeAccounts.length;
            return acc;
        }
    }

    markCooldown(acc, hours = 1) {
        acc.cooldownUntil = Date.now() + hours * 3600 * 1000;
        console.warn(`[HuggingFaceGen] 账号 [${acc.id}] 遇到限流或暂时不可用，进入冷却 (${hours} 小时)。`);
    }
}

const accountPool = new HFAccountPoolManager();

async function sendRequestWithAccount(account, endpoint, payload) {
    const headers = {
        'Authorization': `Bearer ${account.apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': account.userAgent || 'VCP-Toolbox/1.0 (HuggingFaceGen)'
    };

    if (account.stickyHeader) {
        Object.assign(headers, account.stickyHeader);
    }

    const fetchOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    };

    // 主账号：严格原生直连！副账号：走本地 Docker 粘性节点池代理
    if (!account.isPrimary && account.proxy) {
        try {
            const { ProxyAgent } = require('undici');
            fetchOptions.dispatcher = new ProxyAgent({
                uri: account.proxy,
                headers: account.stickyHeader || {}
            });
        } catch (_) {
            try {
                const { HttpsProxyAgent } = require('https-proxy-agent');
                fetchOptions.agent = new HttpsProxyAgent(account.proxy);
            } catch (e) {}
        }
    }

    return fetch(endpoint, fetchOptions);
}

function normalizeModelName(rawModel) {
    const m = (rawModel || '').trim().toLowerCase();
    if (!m) return DEFAULT_MODEL;
    if (m.includes('flux')) return 'black-forest-labs/FLUX.1-schnell';
    if (m.includes('animagine') || m.includes('anime')) return 'cagliostrolab/animagine-xl-3.1';
    if (m.includes('lightning')) return 'ByteDance/SDXL-Lightning';
    if (m.includes('sdxl') || m.includes('diffusion')) return 'stabilityai/stable-diffusion-xl-base-1.0';
    if (rawModel.includes('/')) return rawModel.trim();
    return DEFAULT_MODEL;
}

async function generateImageWithFailover(args, maxRetries = 3) {
    const prompt = (args.prompt || args.query || args.keywords || '').trim();
    if (!prompt) {
        throw new Error('生图任务缺少必填参数 "prompt"（画面提示词）。');
    }

    const model = normalizeModelName(args.model);
    const width = parseInt(args.width, 10) || 1024;
    const height = parseInt(args.height, 10) || 1024;
    const showBase64 = args.show_base64 === true || args.show_base64 === 'true';

    const parameters = { width, height };
    if (args.negative_prompt) parameters.negative_prompt = args.negative_prompt;
    if (args.num_inference_steps) parameters.num_inference_steps = parseInt(args.num_inference_steps, 10);
    if (args.guidance_scale) parameters.guidance_scale = parseFloat(args.guidance_scale);
    if (args.seed !== undefined && args.seed !== '') parameters.seed = parseInt(args.seed, 10);

    const payload = { inputs: prompt, parameters };
    const endpoint = `https://api-inference.huggingface.co/models/${model}`;

    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        let account;
        try {
            account = accountPool.getAvailableAccount();
        } catch (e) {
            throw e;
        }

        const jitter = Math.floor(Math.random() * 700) + 500;
        await new Promise(r => setTimeout(r, jitter));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        try {
            const response = await sendRequestWithAccount(account, endpoint, payload);
            clearTimeout(timeoutId);

            if (response.status === 429) {
                accountPool.markCooldown(account, 2);
                lastError = new Error(`HF 账号 [${account.id}] 触发限流 (429)，自动漂移切换至下一账号...`);
                continue;
            }

            if (response.status === 503) {
                let errJson = {};
                try { errJson = await response.json(); } catch (_) {}
                const waitTime = errJson.estimated_time ? Math.round(errJson.estimated_time) : 20;
                throw new Error(`Hugging Face 模型 [${model}] 正在云端冷启动加载中 (预计需 ${waitTime} 秒)，请稍等片刻重试。`);
            }

            if (!response.ok) {
                let errDetail = '';
                try {
                    const errJson = await response.json();
                    errDetail = JSON.stringify(errJson.error || errJson);
                } catch (_) {
                    errDetail = await response.text();
                }
                throw new Error(`HF API 异常 HTTP ${response.status} (账号: ${account.id}): ${errDetail}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (buffer.length < 512) {
                throw new Error(`HF 返回非图像内容: ${buffer.toString('utf8').slice(0, 150)}`);
            }

            const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
            const ext = isPng ? 'png' : 'jpg';

            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
            const randomHex = crypto.randomBytes(4).toString('hex');
            const filename = `hf_${timestamp}_${randomHex}.${ext}`;
            const localFilePath = path.join(SAVE_DIR, filename);

            fs.writeFileSync(localFilePath, buffer);

            const relativeImagePath = path.relative(PROJECT_BASE_PATH, localFilePath).replace(/\\/g, '/');
            const localFileUrl = `file:///${localFilePath.replace(/\\/g, '/')}`;

            const networkType = account.isPrimary ? '本机宽带直连通道' : `Docker粘性节点分流通道 [${account.proxy}]`;

            const content = [
                {
                    type: 'text',
                    text: `✨ 图片已由 Hugging Face 官方 Serverless 算力成功生成！\n\n` +
                          `- 调度账号: ${account.id} (${networkType})\n` +
                          `- 提示词: ${prompt}\n` +
                          `- 采用模型: ${model}\n` +
                          `- 画面尺寸: ${width}x${height}\n` +
                          `- 本地文件: [${filename}](${localFileUrl})\n\n` +
                          `【多账号状态】已启用隔离轮询调度，主账号走原生网络，副账号走独立粘性节点。`
                }
            ];

            if (showBase64) {
                const mimeType = isPng ? 'image/png' : 'image/jpeg';
                content.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:${mimeType};base64,${buffer.toString('base64')}`
                    }
                });
            }

            return {
                content,
                details: {
                    usedAccount: account.id,
                    isPrimaryNetwork: account.isPrimary,
                    localPath: localFilePath,
                    relativePath: relativeImagePath,
                    model,
                    width,
                    height
                }
            };
        } catch (err) {
            clearTimeout(timeoutId);
            lastError = err;
            console.warn(`[HuggingFaceGen] 账号 [${account.id}] 本轮请求失败: ${err.message}，尝试漂移至下一账号...`);
            accountPool.markCooldown(account, 1);
        }
    }

    throw lastError || new Error('所有可用 HF 账号请求均失败，请检查网络或配置。');
}

function parseRawInput(raw) {
    let text = String(raw || '').trim();
    if (!text) return null;
    const match = text.match(/<<<\[TOOL_REQUEST\]>>>([\s\S]*?)<<<\[TOOL_REQUEST_END\]>>>/);
    if (match) {
        text = match[1].trim();
    }
    text = text.replace(/^\uFEFF/, '');
    try {
        return JSON.parse(text);
    } catch (_) {
        return null;
    }
}

function parseCliArgs() {
    const argv = process.argv.slice(2);
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--prompt' && argv[i+1]) args.prompt = argv[++i];
        else if (argv[i] === '--model' && argv[i+1]) args.model = argv[++i];
        else if (argv[i] === '--width' && argv[i+1]) args.width = Number(argv[++i]);
        else if (argv[i] === '--height' && argv[i+1]) args.height = Number(argv[++i]);
        else if (argv[i] === '--steps' && argv[i+1]) args.num_steps = Number(argv[++i]);
        else if (argv[i] === '--command' && argv[i+1]) args.command = argv[++i];
    }
    return Object.keys(args).length > 0 ? args : null;
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

        const result = await generateImageWithFailover(parsedArgs);

        console.log(JSON.stringify({
            status: 'success',
            result
        }));
    } catch (err) {
        console.log(JSON.stringify({
            status: 'error',
            error: `HuggingFaceGen 插件错误: ${err.message}`
        }));
        process.exit(1);
    }
}

main();
