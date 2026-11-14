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

const DEFAULT_MODEL = process.env.DEFAULT_MODEL || '@cf/black-forest-labs/flux-1-schnell';
const ROTATION_STRATEGY = (process.env.ROTATION_STRATEGY || 'failover').toLowerCase(); // 'failover' 或 'round-robin'
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || path.resolve(__dirname, '../../..');

const SAVE_DIR = process.env.SAVE_DIR
    ? path.resolve(process.env.SAVE_DIR)
    : path.join(PROJECT_BASE_PATH, 'image', 'cloudflare');

if (!fs.existsSync(SAVE_DIR)) {
    try {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
    } catch (_) {}
}

/**
 * 账号池管理器 (AccountPoolManager)
 * 核心拓扑规则：
 * 1. 账号 1 (主账号): 绝对使用本机正常网络直连，不走任何代理。
 * 2. 账号 2 及往后 (副账号): 走本地 Docker 粘性节点池代理 (如 http://127.0.0.1:2260)，并绑定各自的粘性节点 Session。
 */
class AccountPoolManager {
    constructor() {
        this.accounts = [];
        this.currentIndex = 0;
        this._loadAccounts();
    }

    _loadAccounts() {
        this.accounts = [];

        // 1. 加载主账号 (必需，使用本机原生网络直连)
        const primaryAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
        const primaryApiToken = process.env.CLOUDFLARE_API_TOKEN || '';

        if (primaryAccountId && primaryApiToken) {
            this.accounts.push({
                id: 'primary (本机直连)',
                accountId: primaryAccountId,
                apiToken: primaryApiToken,
                isPrimary: true,
                proxy: null,          // 主账号严格不走代理，走本机直连
                stickyHeader: null,   // 无粘性节点头
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                cooldownUntil: 0,
                failCount: 0
            });
        }

        // 2. 加载结构化 JSON 格式的副账号 (若有配置 CLOUDFLARE_ACCOUNTS)
        if (process.env.CLOUDFLARE_ACCOUNTS) {
            try {
                const parsed = JSON.parse(process.env.CLOUDFLARE_ACCOUNTS);
                if (Array.isArray(parsed)) {
                    parsed.forEach((acc, idx) => {
                        if (acc.accountId && acc.apiToken) {
                            const isFirst = this.accounts.length === 0 && idx === 0;
                            this.accounts.push({
                                id: acc.id || `account_${idx + 1}`,
                                accountId: acc.accountId,
                                apiToken: acc.apiToken,
                                isPrimary: isFirst || acc.isPrimary === true,
                                proxy: isFirst ? null : (acc.proxy || process.env.DOCKER_STICKY_PROXY || null),
                                stickyHeader: acc.stickyHeader || acc.proxyHeader || null,
                                userAgent: acc.userAgent || `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/12${idx}.0.0.0 Safari/537.36`,
                                cooldownUntil: 0,
                                failCount: 0
                            });
                        }
                    });
                }
            } catch (e) {
                console.error(`[CloudflareAIGen] 解析 CLOUDFLARE_ACCOUNTS JSON 失败: ${e.message}`);
            }
        }

        // 3. 加载多行副账号配置 (CLOUDFLARE_SECONDARY_ACCOUNT_2, 3...)
        // 格式: AccountId,ApiToken,ProxyUrl,StickyNodeValue
        for (let i = 2; i <= 20; i++) {
            const secVal = process.env[`CLOUDFLARE_SECONDARY_ACCOUNT_${i}`];
            if (!secVal) continue;
            const parts = secVal.split(',').map(s => s.trim());
            if (parts.length >= 2 && parts[0] && parts[1]) {
                const accountId = parts[0];
                const apiToken = parts[1];
                const proxyUrl = parts[2] || process.env.DOCKER_STICKY_PROXY || 'http://127.0.0.1:2260';
                const stickyNode = parts[3] || `node-${i}`;

                this.accounts.push({
                    id: `secondary_${i} (粘性节点:${stickyNode})`,
                    accountId,
                    apiToken,
                    isPrimary: false,
                    proxy: proxyUrl,
                    stickyHeader: { 'Proxy-Session': stickyNode, 'X-Sticky-Node': stickyNode },
                    userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/12${i}.0.0.0 Safari/537.36`,
                    cooldownUntil: 0,
                    failCount: 0
                });
            }
        }
    }

    /**
     * 选取下一个可用的健康账号
     */
    getAvailableAccount() {
        if (this.accounts.length === 0) {
            throw new Error('未配置任何 Cloudflare 账号凭证。请在 config.env 中配置 CLOUDFLARE_ACCOUNT_ID 与 CLOUDFLARE_API_TOKEN。');
        }

        const now = Date.now();
        const activeAccounts = this.accounts.filter(acc => acc.cooldownUntil <= now);

        if (activeAccounts.length === 0) {
            // 所有账号均在冷却中（如今日全部超额）
            const nearestReset = Math.min(...this.accounts.map(a => a.cooldownUntil));
            const waitMinutes = Math.max(1, Math.round((nearestReset - now) / 60000));
            throw new Error(`所有 Cloudflare 账号的今日免费额度均已耗尽 (HTTP 429)，预计将在 ${waitMinutes} 分钟后重置。`);
        }

        if (ROTATION_STRATEGY === 'failover') {
            // failover 模式：主账号优先！只要主账号未超额，全部走主账号本机直连；超额才切副账号粘性节点
            const primary = activeAccounts.find(a => a.isPrimary);
            if (primary) return primary;
            return activeAccounts[0];
        } else {
            // round-robin 模式：多账号与粘性节点均匀轮询
            const acc = activeAccounts[this.currentIndex % activeAccounts.length];
            this.currentIndex = (this.currentIndex + 1) % activeAccounts.length;
            return acc;
        }
    }

    /**
     * 标记账号额度耗尽或异常（进入冷却熔断）
     */
    markCooldown(acc, hours = 12) {
        // 次日早 8 点 (UTC 0 点) 或指定冷却时间
        const now = new Date();
        const resetTime = new Date(now);
        resetTime.setUTCHours(24, 0, 0, 0); // 次日 UTC 0:00 额度刷新
        const cooldownMs = resetTime.getTime() - now.getTime();

        acc.cooldownUntil = Date.now() + Math.max(cooldownMs, hours * 3600 * 1000);
        acc.failCount++;
        console.warn(`[CloudflareAIGen] 账号 [${acc.id}] 今日额度已满或受限，已隔离熔断至明日刷新 (冷却时长约 ${(cooldownMs / 3600000).toFixed(1)} 小时)。`);
    }
}

const accountPool = new AccountPoolManager();

/**
 * 根据账号环境特征发起隔离网络请求
 */
async function sendRequestWithAccount(account, endpoint, payload) {
    const headers = {
        'Authorization': `Bearer ${account.apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': account.userAgent || 'VCP-Toolbox/1.0 (CloudflareAIGen)'
    };

    // 如果该账号配置了粘性节点 Header，附加至请求头
    if (account.stickyHeader) {
        Object.assign(headers, account.stickyHeader);
    }

    const fetchOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    };

    // 关键拓扑隔离分支：
    // 主账号：严格为 null，强制本机正常网络直连！
    // 副账号：走本地 Docker 粘性节点池代理
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
    if (m.includes('flux')) return '@cf/black-forest-labs/flux-1-schnell';
    if (m.includes('lightning')) return '@cf/bytedance/stable-diffusion-xl-lightning';
    if (m.includes('dreamshaper') || m.includes('anime')) return '@cf/lykon/dreamshaper-8-lcm';
    if (m.includes('sdxl') || m.includes('diffusion')) return '@cf/stabilityai/stable-diffusion-xl-base-1.0';
    if (m.startsWith('@cf/')) return rawModel.trim();
    return DEFAULT_MODEL;
}

/**
 * 具有自动账号漂移与容灾重试的生图主流程
 */
async function generateImageWithFailover(args, maxRetries = 3) {
    const prompt = (args.prompt || args.query || args.keywords || '').trim();
    if (!prompt) {
        throw new Error('生图任务缺少必填参数 "prompt"（画面提示词）。');
    }

    const model = normalizeModelName(args.model);
    const width = parseInt(args.width, 10) || 1024;
    const height = parseInt(args.height, 10) || 1024;
    const showBase64 = args.show_base64 === true || args.show_base64 === 'true';

    const isFlux = model.includes('flux');
    const payload = { prompt };
    if (args.num_steps) payload.num_steps = parseInt(args.num_steps, 10);
    if (args.seed !== undefined && args.seed !== '') payload.seed = parseInt(args.seed, 10);
    if (!isFlux) {
        if (args.guidance) payload.guidance = parseFloat(args.guidance);
        if (width) payload.width = width;
        if (height) payload.height = height;
    }

    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        let account;
        try {
            account = accountPool.getAvailableAccount();
        } catch (e) {
            throw e;
        }

        const endpoint = `https://api.cloudflare.com/client/v4/accounts/${account.accountId}/ai/run/${model}`;

        // 拟人化自然随机抖动 (500~1200ms)
        const jitter = Math.floor(Math.random() * 700) + 500;
        await new Promise(r => setTimeout(r, jitter));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        try {
            const response = await sendRequestWithAccount(account, endpoint, payload);
            clearTimeout(timeoutId);

            if (response.status === 429) {
                // 捕获额度耗尽，熔断当前账号，自动漂移至下一个账号重试
                accountPool.markCooldown(account, 12);
                lastError = new Error(`账号 [${account.id}] 提示 HTTP 429 免费额度耗尽，已触发自动轮询切换。`);
                continue;
            }

            if (!response.ok) {
                let errDetail = '';
                try {
                    const errJson = await response.json();
                    errDetail = JSON.stringify(errJson.errors || errJson);
                } catch (_) {
                    errDetail = await response.text();
                }
                throw new Error(`Cloudflare API 异常 HTTP ${response.status} (账号: ${account.id}): ${errDetail}`);
            }

            const contentType = response.headers.get('content-type') || '';
            let buffer;
            if (contentType.includes('application/json')) {
                const json = await response.json();
                if (json.result && json.result.image) {
                    buffer = Buffer.from(json.result.image, 'base64');
                } else {
                    throw new Error(`Cloudflare 返回 JSON 缺少 result.image: ${JSON.stringify(json).slice(0, 150)}`);
                }
            } else {
                const arrayBuffer = await response.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
            }

            if (buffer.length < 512) {
                throw new Error(`Cloudflare 返回图片内容过小或损坏: ${buffer.length} 字节`);
            }

            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
            const randomHex = crypto.randomBytes(4).toString('hex');
            const filename = `cf_${timestamp}_${randomHex}.png`;
            const localFilePath = path.join(SAVE_DIR, filename);

            fs.writeFileSync(localFilePath, buffer);

            const relativeImagePath = path.relative(PROJECT_BASE_PATH, localFilePath).replace(/\\/g, '/');
            const localFileUrl = `file:///${localFilePath.replace(/\\/g, '/')}`;

            const networkType = account.isPrimary ? '本机宽带直连通道' : `Docker粘性节点分流通道 [${account.proxy}]`;

            const content = [
                {
                    type: 'text',
                    text: `✨ 图片已由 Cloudflare Workers AI 成功生成！\n\n` +
                          `- 调度账号: ${account.id} (${networkType})\n` +
                          `- 提示词: ${prompt}\n` +
                          `- 采用模型: ${model}\n` +
                          `- 画面尺寸: ${width}x${height}\n` +
                          `- 本地文件: [${filename}](${localFileUrl})\n\n` +
                          `【多账号状态】当前账号池已生效，额度耗尽时自动无缝切换，隔离防封保障。`
                }
            ];

            if (showBase64) {
                content.push({
                    type: 'image_url',
                    image_url: {
                        url: `data:image/png;base64,${buffer.toString('base64')}`
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
            console.warn(`[CloudflareAIGen] 账号 [${account.id}] 本轮请求失败: ${err.message}，尝试漂移至下一账号...`);
            accountPool.markCooldown(account, 1); // 临时冷却 1 小时
        }
    }

    throw lastError || new Error('所有可用账号请求均失败，请检查网络或配置。');
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
            error: `CloudflareAIGen 插件错误: ${err.message}`
        }));
        process.exit(1);
    }
}

main();
