#!/usr/bin/env node

import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

const {
    API_KEYS,
    BASE_URL,
    MODEL_NAME,
    PROXY_AGENT,
    DIST_IMAGE_SERVERS,
    PROJECT_BASE_PATH,
    SERVER_PORT,
    IMAGESERVER_IMAGE_KEY,
    VAR_HTTP_URL
} = (() => {
    const keys = (process.env.NewAPIImageKey || '').split(',').map(k => k.trim()).filter(Boolean);
    const proxyUrl = process.env.NewAPIProxy;
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;
    const distServers = (process.env.DIST_IMAGE_SERVERS || '').split(',').map(s => s.trim()).filter(Boolean);

    return {
        API_KEYS: keys,
        BASE_URL: (process.env.NewAPIBaseURL || 'https://site.atopes.de/v1').replace(/\/+$/, ''),
        MODEL_NAME: process.env.NewAPIModel || '假流式-gemini-3-pro-image-preview',
        PROXY_AGENT: agent,
        DIST_IMAGE_SERVERS: distServers,
        PROJECT_BASE_PATH: process.env.PROJECT_BASE_PATH,
        SERVER_PORT: process.env.SERVER_PORT,
        IMAGESERVER_IMAGE_KEY: process.env.IMAGESERVER_IMAGE_KEY,
        VAR_HTTP_URL: process.env.VarHttpUrl
    };
})();

function getRandomApiKey() {
    if (API_KEYS.length === 0) {
        throw new Error("NewAPI 图像密钥未配置。");
    }
    const randomIndex = Math.floor(Math.random() * API_KEYS.length);
    return API_KEYS[randomIndex];
}

function buildAccessibleImageUrl(fileName) {
    const relativePathForUrl = path.join('gemininewapiimagegen', fileName).replace(/\\/g, '/');
    return `${VAR_HTTP_URL}:${SERVER_PORT}/pw=${IMAGESERVER_IMAGE_KEY}/images/${relativePathForUrl}`;
}

async function saveImageBuffer(imageBuffer, mimeType, originalArgs, modelResponseText = null) {
    const extension = mimeType.split('/')[1] || 'png';
    const generatedFileName = `${uuidv4()}.${extension}`;
    const imageDir = path.join(PROJECT_BASE_PATH, 'image', 'gemininewapiimagegen');
    const accessibleImageUrl = buildAccessibleImageUrl(generatedFileName);

    await fs.mkdir(imageDir, { recursive: true });
    await fs.writeFile(path.join(imageDir, generatedFileName), imageBuffer);

    const finalResponseText =
        `${modelResponseText || '图片已成功处理！'}\n\n` +
        `**图片详情:**\n` +
        `- 提示词: ${originalArgs.prompt || ''}\n` +
        `- 可访问URL: ${accessibleImageUrl}\n\n` +
        `请利用可访问url将图片转发给用户`;

    const base64Image = imageBuffer.toString('base64');

    return {
        content: [
            {
                type: 'text',
                text: finalResponseText
            },
            {
                type: 'image_url',
                image_url: {
                    url: `data:${mimeType};base64,${base64Image}`
                }
            }
        ],
        details: {
            serverPath: `image/gemininewapiimagegen/${generatedFileName}`,
            fileName: generatedFileName,
            ...originalArgs,
            imageUrl: accessibleImageUrl,
            modelResponseText
        }
    };
}

async function getImageDataFromUrl(url) {
    if (url.startsWith('data:')) {
        const match = url.match(/^data:(image\/\w+);base64,(.*)$/);
        if (!match) throw new Error('无效的 data URI 格式。');
        return { buffer: Buffer.from(match[2], 'base64'), mimeType: match[1] };
    }

    if (url.startsWith('http')) {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            httpsAgent: PROXY_AGENT
        });
        return {
            buffer: response.data,
            mimeType: response.headers['content-type'] || 'image/jpeg'
        };
    }

    if (url.startsWith('file://')) {
        const filePath = fileURLToPath(url);

        try {
            const buffer = await fs.readFile(filePath);
            const mimeType = mime.lookup(filePath) || 'application/octet-stream';
            return { buffer, mimeType };
        } catch (e) {
            if (e.code !== 'ENOENT') {
                throw new Error(`读取本地文件失败: ${e.message}`);
            }
        }

        if (DIST_IMAGE_SERVERS.length === 0) {
            throw new Error('直接读取本地文件失败，且未配置 DIST_IMAGE_SERVERS。');
        }

        const fileName = path.basename(filePath);
        for (const serverBaseUrl of DIST_IMAGE_SERVERS) {
            const fullHttpUrl = `${serverBaseUrl.trim().replace(/\/$/, '')}/${fileName}`;
            try {
                const response = await axios.get(fullHttpUrl, {
                    responseType: 'arraybuffer',
                    httpsAgent: PROXY_AGENT
                });
                return {
                    buffer: response.data,
                    mimeType: response.headers['content-type'] || 'image/jpeg'
                };
            } catch (_) {}
        }

        throw new Error(`无法从任何分布式图床地址下载文件: ${fileName}`);
    }

    throw new Error('不支持的 URL 协议。请使用 http, https, data URI, 或 file://。');
}

function extractMarkdownImageUrls(text) {
    const urls = [];
    if (!text) return urls;

    const mdRegex = /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/g;
    let m;
    while ((m = mdRegex.exec(text)) !== null) {
        urls.push(m[1]);
    }

    const rawUrlRegex = /(https?:\/\/[^\s"')]+(?:png|jpg|jpeg|webp|gif))/gi;
    while ((m = rawUrlRegex.exec(text)) !== null) {
        urls.push(m[1]);
    }

    return [...new Set(urls)];
}

function extractImagesFromResponse(data) {
    const imageUrls = [];
    const base64Images = [];
    const texts = [];

    function walk(node) {
        if (!node) return;

        if (typeof node === 'string') {
            texts.push(node);
            imageUrls.push(...extractMarkdownImageUrls(node));
            return;
        }

        if (Array.isArray(node)) {
            for (const item of node) walk(item);
            return;
        }

        if (typeof node === 'object') {
            if (typeof node.url === 'string' && /^https?:\/\//.test(node.url)) {
                imageUrls.push(node.url);
            }
            if (typeof node.b64_json === 'string' && node.b64_json.length > 100) {
                base64Images.push(node.b64_json);
            }
            if (node.image_url) {
                if (typeof node.image_url === 'string' && /^https?:\/\//.test(node.image_url)) {
                    imageUrls.push(node.image_url);
                } else if (typeof node.image_url === 'object' && typeof node.image_url.url === 'string') {
                    imageUrls.push(node.image_url.url);
                }
            }
            if (node.type === 'output_image' && typeof node.image_base64 === 'string') {
                base64Images.push(node.image_base64);
            }
            if (typeof node.image_base64 === 'string' && node.image_base64.length > 100) {
                base64Images.push(node.image_base64);
            }
            if (typeof node.text === 'string') {
                texts.push(node.text);
                imageUrls.push(...extractMarkdownImageUrls(node.text));
            }
            for (const key of Object.keys(node)) {
                walk(node[key]);
            }
        }
    }

    walk(data);

    return {
        imageUrls: [...new Set(imageUrls)],
        base64Images: [...new Set(base64Images)],
        texts: [...new Set(texts)].filter(Boolean)
    };
}

async function tryChatCompletions(prompt, args) {
    const apiKey = getRandomApiKey();
    const response = await axios.post(`${BASE_URL}/chat/completions`, {
        model: MODEL_NAME,
        messages: [
            {
                role: 'user',
                content: `请生成一张图片：${prompt}`
            }
        ],
        stream: false,
        ...(args.size ? { size: args.size } : {}),
        ...(args.count ? { n: Number(args.count) } : {})
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: PROXY_AGENT,
        timeout: 300000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });

    return response.data;
}

async function tryResponses(prompt, args) {
    const apiKey = getRandomApiKey();
    const response = await axios.post(`${BASE_URL}/responses`, {
        model: MODEL_NAME,
        input: `请生成一张图片：${prompt}`,
        ...(args.size ? { size: args.size } : {}),
        ...(args.count ? { n: Number(args.count) } : {})
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: PROXY_AGENT,
        timeout: 300000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });

    return response.data;
}

async function tryImageGenerations(prompt, args) {
    const apiKey = getRandomApiKey();
    const response = await axios.post(`${BASE_URL}/images/generations`, {
        model: MODEL_NAME,
        prompt,
        ...(args.size ? { size: args.size } : {}),
        ...(args.count ? { n: Number(args.count) } : {})
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: PROXY_AGENT,
        timeout: 300000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });

    return response.data;
}

async function handleGenerate(args) {
    if (!args.prompt || typeof args.prompt !== 'string') {
        throw new Error("参数错误: 'prompt' 是必需的字符串。");
    }

    const prompt = args.prompt;
    const attempts = [];
    let upstream = null;

    const endpoints = [
        { name: 'chat/completions', fn: () => tryChatCompletions(prompt, args) },
        { name: 'responses', fn: () => tryResponses(prompt, args) },
        { name: 'images/generations', fn: () => tryImageGenerations(prompt, args) }
    ];

    for (const item of endpoints) {
        try {
            upstream = await item.fn();
            attempts.push({ endpoint: item.name, success: true });
            break;
        } catch (e) {
            attempts.push({
                endpoint: item.name,
                success: false,
                error: e.response?.data || e.message || String(e)
            });
        }
    }

    if (!upstream) {
        throw new Error(`所有候选端点调用失败: ${JSON.stringify(attempts)}`);
    }

    const extracted = extractImagesFromResponse(upstream);

    if (extracted.base64Images.length > 0) {
        const imageBuffer = Buffer.from(extracted.base64Images[0], 'base64');
        return await saveImageBuffer(imageBuffer, 'image/png', args, extracted.texts[0] || null);
    }

    if (extracted.imageUrls.length > 0) {
        const { buffer, mimeType } = await getImageDataFromUrl(extracted.imageUrls[0]);
        return await saveImageBuffer(buffer, mimeType, args, extracted.texts[0] || null);
    }

    throw new Error(`接口成功返回，但未解析到图片数据。原始响应: ${JSON.stringify(upstream).slice(0, 3000)}`);
}

async function handleEdit(args) {
    if (!args.prompt || typeof args.prompt !== 'string') {
        throw new Error("参数错误: 'prompt' 是必需的字符串。");
    }

    let imageUrls = [];

    if (typeof args.image_url === 'string' && args.image_url.length > 0) {
        imageUrls.push(args.image_url);
    }

    for (let i = 1; i <= 3; i++) {
        const paramName = `image_url_${i}`;
        if (typeof args[paramName] === 'string' && args[paramName].length > 0) {
            imageUrls.push(args[paramName]);
        }
    }

    if (imageUrls.length === 0) {
        throw new Error("参数错误: 至少需要提供一个图片 URL。");
    }

    const imageParts = [];
    for (const url of imageUrls) {
        try {
            const { buffer, mimeType } = await getImageDataFromUrl(url);
            imageParts.push({
                type: 'input_image',
                image_data: `data:${mimeType};base64,${buffer.toString('base64')}`
            });
        } catch (error) {
            console.error(`[GeminiNewAPIImageGen] 警告: 无法处理图片 URL ${url}，跳过。错误: ${error.message}`);
        }
    }

    if (imageParts.length === 0) {
        throw new Error("参数错误: 提供的所有图片 URL 都无法处理，无法进行编辑。");
    }

    const apiKey = getRandomApiKey();
    const response = await axios.post(`${BASE_URL}/chat/completions`, {
        model: MODEL_NAME,
        messages: [
            {
                role: 'user',
                content: [
                    ...imageParts,
                    { type: 'text', text: args.prompt }
                ]
            }
        ],
        stream: false
    }, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: PROXY_AGENT,
        timeout: 300000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
    });

    const extracted = extractImagesFromResponse(response.data);

    if (extracted.base64Images.length > 0) {
        const imageBuffer = Buffer.from(extracted.base64Images[0], 'base64');
        return await saveImageBuffer(imageBuffer, 'image/png', args, extracted.texts[0] || null);
    }

    if (extracted.imageUrls.length > 0) {
        const { buffer, mimeType } = await getImageDataFromUrl(extracted.imageUrls[0]);
        return await saveImageBuffer(buffer, mimeType, args, extracted.texts[0] || null);
    }

    throw new Error(`编辑接口成功返回，但未解析到图片数据。原始响应: ${JSON.stringify(response.data).slice(0, 3000)}`);
}

async function handleCheck() {
    if (API_KEYS.length === 0) {
        throw new Error("NewAPI 图像密钥未配置。");
    }

    const apiKey = getRandomApiKey();

    try {
        const response = await axios.get(`${BASE_URL}/models`, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            },
            httpsAgent: PROXY_AGENT,
            timeout: 60000
        });

        return {
            content: [
                {
                    type: 'text',
                    text: `配置检查成功。\n- baseURL: ${BASE_URL}\n- model: ${MODEL_NAME}\n- /models 可访问`
                }
            ],
            details: {
                baseURL: BASE_URL,
                model: MODEL_NAME,
                hasKey: API_KEYS.length > 0,
                modelsSample: response.data?.data?.slice?.(0, 5) || response.data
            }
        };
    } catch (e) {
        return {
            content: [
                {
                    type: 'text',
                    text: `基础配置已读取，但 /models 检查失败。\n- baseURL: ${BASE_URL}\n- model: ${MODEL_NAME}\n- error: ${e.response?.data ? JSON.stringify(e.response.data) : e.message}`
                }
            ],
            details: {
                baseURL: BASE_URL,
                model: MODEL_NAME,
                hasKey: API_KEYS.length > 0,
                error: e.response?.data || e.message
            }
        };
    }
}

async function main() {
    let inputData = '';
    try {
        for await (const chunk of process.stdin) {
            inputData += chunk;
        }

        if (!inputData.trim()) {
            throw new Error("未从 stdin 接收到任何输入数据。");
        }

        const parsedArgs = JSON.parse(inputData);
        let resultObject;

        switch (parsedArgs.command) {
            case 'generate':
                resultObject = await handleGenerate(parsedArgs);
                break;
            case 'edit':
                resultObject = await handleEdit(parsedArgs);
                break;
            case 'check':
                resultObject = await handleCheck(parsedArgs);
                break;
            default:
                throw new Error(`未知的命令: '${parsedArgs.command}'。请使用 'generate'、'edit' 或 'check'。`);
        }

        console.log(JSON.stringify({ status: "success", result: resultObject }));
    } catch (e) {
        let detailedError = e.message || "未知的插件错误";
        if (e.response && e.response.data) {
            detailedError += ` - API 响应: ${JSON.stringify(e.response.data)}`;
        }
        const finalErrorMessage = `GeminiNewAPIImageGen 插件错误: ${detailedError}`;
        console.log(JSON.stringify({ status: "error", error: finalErrorMessage }));
        process.exit(1);
    }
}

main();