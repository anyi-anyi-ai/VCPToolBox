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

const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'flux';
const DEFAULT_WIDTH = parseInt(process.env.DEFAULT_WIDTH, 10) || 1024;
const DEFAULT_HEIGHT = parseInt(process.env.DEFAULT_HEIGHT, 10) || 1024;
const HTTP_PROXY = process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy || '';
const PROJECT_BASE_PATH = process.env.PROJECT_BASE_PATH || path.resolve(__dirname, '../../..');

// 确定图片保存目录
const SAVE_DIR = process.env.SAVE_DIR 
    ? path.resolve(process.env.SAVE_DIR)
    : path.join(PROJECT_BASE_PATH, 'image', 'pollinations');

if (!fs.existsSync(SAVE_DIR)) {
    try {
        fs.mkdirSync(SAVE_DIR, { recursive: true });
    } catch (_) {}
}

/**
 * 创建支持代理的 fetch 请求
 */
async function fetchWithProxy(url, options = {}) {
    if (HTTP_PROXY) {
        try {
            const { HttpsProxyAgent } = require('https-proxy-agent');
            const agent = new HttpsProxyAgent(HTTP_PROXY);
            const nodeFetch = require('node-fetch');
            return nodeFetch(url, { ...options, agent });
        } catch (_) {
            // 如果未加载代理模块则回退至原生 fetch
            return fetch(url, options);
        }
    }
    return fetch(url, options);
}

/**
 * 执行生图任务
 */
async function generateImage(args) {
    const prompt = (args.prompt || args.query || args.keywords || '').trim();
    if (!prompt) {
        throw new Error('生图任务缺少必填参数 "prompt"（画面提示词）。');
    }

    const model = (args.model || DEFAULT_MODEL).toLowerCase();
    const width = parseInt(args.width, 10) || DEFAULT_WIDTH;
    const height = parseInt(args.height, 10) || DEFAULT_HEIGHT;
    const seed = args.seed !== undefined && args.seed !== '' ? parseInt(args.seed, 10) : Math.floor(Math.random() * 2147483647);
    const nologo = args.nologo !== false && args.nologo !== 'false';
    const enhance = args.enhance === true || args.enhance === 'true';
    const showBase64 = args.show_base64 === true || args.show_base64 === 'true';

    // 构建标准 Pollinations URL
    const baseUrl = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt);
    const urlParams = new URLSearchParams({
        model: model,
        width: String(Math.min(2048, Math.max(256, width))),
        height: String(Math.min(2048, Math.max(256, height))),
        seed: String(seed),
        nologo: String(nologo),
        enhance: String(enhance)
    });

    const fullImageUrl = `${baseUrl}?${urlParams.toString()}`;

    // 下载二进制数据并保存到本地
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 秒超时

    let response;
    try {
        response = await fetchWithProxy(fullImageUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            signal: controller.signal
        });
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Pollinations AI 生成超时 (90秒)，请检查网络或稍后重试。');
        }
        throw new Error(`Pollinations AI 网络连接失败: ${err.message}`);
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        throw new Error(`Pollinations AI 接口返回异常 HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 检查是否返回了有效图片 (防止错误返回 HTML)
    if (buffer.length < 1024) {
        const textPreview = buffer.toString('utf8');
        if (textPreview.includes('Error') || textPreview.includes('html')) {
            throw new Error(`Pollinations AI 返回错误内容: ${textPreview.slice(0, 200)}`);
        }
    }

    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const randomHex = crypto.randomBytes(4).toString('hex');
    const filename = `pollinations_${timestamp}_${randomHex}.jpg`;
    const localFilePath = path.join(SAVE_DIR, filename);

    fs.writeFileSync(localFilePath, buffer);

    // 拼装对外访问路径
    const relativeImagePath = path.relative(PROJECT_BASE_PATH, localFilePath).replace(/\\/g, '/');
    const localFileUrl = `file:///${localFilePath.replace(/\\/g, '/')}`;

    const content = [
        {
            type: 'text',
            text: `✨ 图片已由 Pollinations AI (开源免费通道) 成功生成！\n\n` +
                  `- 提示词: ${prompt}\n` +
                  `- 采用模型: ${model}\n` +
                  `- 画面尺寸: ${width}x${height}\n` +
                  `- 随机种子: ${seed}\n` +
                  `- 本地文件: [${filename}](${localFileUrl})\n` +
                  `- 在线链接: ${fullImageUrl}\n\n` +
                  `【温馨提示】已为您保存至本地磁盘，请直接预览。`
        }
    ];

    if (showBase64) {
        content.push({
            type: 'image_url',
            image_url: {
                url: `data:image/jpeg;base64,${buffer.toString('base64')}`
            }
        });
    }

    return {
        content,
        details: {
            url: fullImageUrl,
            localPath: localFilePath,
            relativePath: relativeImagePath,
            model,
            width,
            height,
            seed
        }
    };
}

/**
 * 标准 VCP Stdio 通信入口
 */
async function main() {
    try {
        const inputChunks = [];
        for await (const chunk of process.stdin) {
            inputChunks.push(chunk);
        }
        const inputData = inputChunks.join('').trim();
        if (!inputData) {
            throw new Error('未从 stdin 收到输入参数。');
        }

        const parsedArgs = JSON.parse(inputData);
        const result = await generateImage(parsedArgs);

        console.log(JSON.stringify({
            status: 'success',
            result
        }));
    } catch (err) {
        console.log(JSON.stringify({
            status: 'error',
            error: `PollinationsGen 插件错误: ${err.message}`
        }));
        process.exit(1);
    }
}

main();
