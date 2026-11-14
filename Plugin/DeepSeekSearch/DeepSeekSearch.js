#!/usr/bin/env node
/**
 * DeepSeekSearch - 基于 DeepSeek 官方 Search & Fetch API 的搜索与抓取插件
 * 
 * 官方端点规范:
 * 1. 网页搜索: POST https://api.deepseek.com/v1/tools/search
 *    - query: string (1~128 chars, 支持 site:, -site:, -, -"..." 等高级语法)
 *    - count: integer (1~50, 默认 10)
 *    - need_content: boolean (是否包含完整抓取正文)
 *    - ori_question: string (可选，用户原始问题)
 *    - localization: string (可选，IP地址用于本地化)
 * 2. 网页抓取: POST https://api.deepseek.com/v1/tools/fetch
 *    - url: string (目标网页URL)
 */

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const dotenv = require('dotenv');

// --- 1. 配置加载 (多层回退机制) ---

// 优先读取插件本目录的 config.env
const localConfigPath = path.resolve(__dirname, 'config.env');
if (fs.existsSync(localConfigPath)) {
    dotenv.config({ path: localConfigPath });
}

// 次级读取 VCPToolBox 根目录的 config.env
const rootConfigPath = path.resolve(__dirname, '../../config.env');
if (fs.existsSync(rootConfigPath)) {
    dotenv.config({ path: rootConfigPath });
}

function getEnvConfig(keyName, fallbackVal = '') {
    return process.env[keyName] || process.env[keyName.toUpperCase()] || fallbackVal;
}

const RAW_API_KEY = getEnvConfig('DeepSeekApiKey', getEnvConfig('DEEPSEEK_API_KEY', ''));
const RAW_API_BASE = getEnvConfig('DeepSeekApiBase', getEnvConfig('DEEPSEEK_API_BASE', 'https://api.deepseek.com'));
const TIMEOUT_MS = parseInt(getEnvConfig('DeepSeekSearchTimeout', getEnvConfig('DEEPSEEK_SEARCH_TIMEOUT', '25000')), 10) || 25000;
const MAX_CONCURRENT = parseInt(getEnvConfig('DeepSeekMaxConcurrent', getEnvConfig('DEEPSEEK_MAX_CONCURRENT', '5')), 10) || 5;
const DEFAULT_COUNT = parseInt(getEnvConfig('DeepSeekDefaultCount', getEnvConfig('DEEPSEEK_DEFAULT_COUNT', '10')), 10) || 10;

// 标准化 API Base (移除尾部斜杠及多余的 /v1)
let API_BASE = RAW_API_BASE.trim().replace(/\/+$/, '');
if (API_BASE.endsWith('/v1')) {
    API_BASE = API_BASE.slice(0, -3);
}

// 解析并支持逗号分隔的多 Key 轮询
const API_KEYS = RAW_API_KEY.split(',')
    .map(k => k.trim())
    .filter(Boolean);

let keyIndex = 0;
function getNextApiKey() {
    if (API_KEYS.length === 0) return '';
    const key = API_KEYS[keyIndex % API_KEYS.length];
    keyIndex++;
    return key;
}

// --- 2. 辅助工具函数 ---

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function parseBool(val, defaultVal = false) {
    if (val === undefined || val === null) return defaultVal;
    if (typeof val === 'boolean') return val;
    const str = String(val).trim().toLowerCase();
    return str === 'true' || str === '1' || str === 'yes';
}

function getFirstParam(obj, keys, defaultVal = undefined) {
    if (!obj || typeof obj !== 'object') return defaultVal;
    for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
            return obj[k];
        }
    }
    return defaultVal;
}

// --- 3. HTTP 请求与自动重试机制 ---

async function postWithRetry(endpoint, body, maxRetries = 2) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const apiKey = getNextApiKey();
        if (!apiKey) {
            throw new Error('未配置 DeepSeekApiKey。请在插件 config.env 或根目录配置 DeepSeekApiKey。');
        }

        try {
            const response = await axios.post(`${API_BASE}${endpoint}`, body, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'VCP-DeepSeekSearch/1.0'
                },
                timeout: TIMEOUT_MS
            });
            return response.data;
        } catch (err) {
            lastError = err;
            const status = err.response?.status;
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;

            // 遇到可重试的临时错误（如 429 限流、502/503/504、网络超时等）
            const isTransient = !status || status === 429 || (status >= 500 && status < 600) || err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT';
            if (attempt < maxRetries && isTransient) {
                const backoff = (attempt + 1) * 1500;
                await sleep(backoff);
                continue;
            }

            throw new Error(`[HTTP ${status || '网络错误'}] ${errorMsg}`);
        }
    }

    throw lastError;
}

// --- 4. 业务核心：DeepSeek 网页搜索 ---

async function executeSingleSearch(query, options = {}) {
    const { count = DEFAULT_COUNT, needContent = false, oriQuestion, localization } = options;

    const payload = {
        query: String(query).trim().slice(0, 128)
    };

    const countNum = parseInt(count, 10);
    if (!isNaN(countNum)) {
        payload.count = Math.max(1, Math.min(50, countNum));
    }
    if (needContent) {
        payload.need_content = true;
    }
    if (oriQuestion) {
        payload.ori_question = String(oriQuestion).trim().slice(0, 128);
    }
    if (localization) {
        payload.localization = String(localization).trim();
    }

    return await postWithRetry('/v1/tools/search', payload);
}

function formatRerankScore(score) {
    if (typeof score !== 'number') return '';
    const formatted = score.toFixed(2);
    if (score >= 2.0) return `[高质量 ★ ${formatted}]`;
    if (score >= 1.0) return `[相关度 ${formatted}]`;
    return `[相关度 ${formatted}]`;
}

function formatSearchResultsToMarkdown(query, apiResponse) {
    const results = apiResponse?.results || [];
    if (!Array.isArray(results) || results.length === 0) {
        return `### 🔍 查询: \`${query}\`\n\n*未检索到相关网页内容。*\n`;
    }

    let md = `### 🔍 查询: \`${query}\` (共 ${results.length} 条检索结果)\n\n`;

    results.forEach((item, idx) => {
        const title = item.title ? item.title.trim().replace(/\r?\n/g, ' ') : '无标题网页';
        const url = item.url ? item.url.trim() : '';
        const score = typeof item.rerank_score === 'number' ? item.rerank_score : item.rer_score;
        const scoreBadge = formatRerankScore(score);

        md += `${idx + 1}. **[${title}](${url})** ${scoreBadge}\n`;

        // 优先展示模型友好的详细摘要 summary，无 summary 时展示短 snippet
        const summary = (item.summary || item.snippet || '').trim();
        if (summary) {
            md += `   > ${summary.replace(/\n+/g, '\n   > ')}\n`;
        }

        // 若请求附带抓取正文 (need_content: true)，将完整正文放入折叠框中
        if (item.content && String(item.content).trim()) {
            const content = String(item.content).trim();
            const preview = content.length > 500 ? content.slice(0, 500) + '... (正文较长已截断)' : content;
            md += `   <details>\n   <summary>📄 查看抓取正文摘要</summary>\n\n   ${preview.replace(/\n/g, '\n   ')}\n\n   </details>\n`;
        }

        md += `\n`;
    });

    return md;
}

// --- 5. 业务核心：DeepSeek 网页正文抓取 ---

async function executeSingleFetch(url) {
    const cleanUrl = String(url).trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        throw new Error(`非法的网页 URL 地址: "${cleanUrl}"，必须以 http:// 或 https:// 开头`);
    }

    const payload = { url: cleanUrl };
    return await postWithRetry('/v1/tools/fetch', payload);
}

function formatFetchResultToMarkdown(url, apiResponse) {
    const title = apiResponse?.title ? apiResponse.title.trim() : '网页正文抓取';
    const content = apiResponse?.content ? apiResponse.content.trim() : '（未获取到有效正文文本）';

    return `## 📄 抓取页面: [${title}](${url})\n\n---\n\n${content}\n\n`;
}

// --- 6. 并发控制执行调度器 ---

async function runChunked(items, concurrency, fn) {
    const results = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const chunk = items.slice(i, i + concurrency);
        const chunkPromises = chunk.map(item => fn(item));
        const chunkResults = await Promise.allSettled(chunkPromises);
        results.push(...chunkResults);
    }
    return results;
}

// --- 7. 主分发调度函数 ---

async function handleSearchCommand(requestData) {
    let rawQuery = getFirstParam(requestData, ['query', 'q', 'keyword', 'keywords', 'search_query']);
    if (!rawQuery) {
        throw new Error('缺少必需的参数: query。请提供需要检索的关键词。');
    }

    const count = getFirstParam(requestData, ['count', 'max_results', 'limit'], DEFAULT_COUNT);
    const needContent = parseBool(getFirstParam(requestData, ['need_content', 'needContent', 'include_content', 'fetch_content']), false);
    const oriQuestion = getFirstParam(requestData, ['ori_question', 'oriQuestion', 'question']);
    const localization = getFirstParam(requestData, ['localization', 'ip']);
    const format = String(getFirstParam(requestData, ['format', 'output_format'], 'markdown')).toLowerCase();

    // 检查是否附带 site 语法
    const site = getFirstParam(requestData, ['site', 'domain']);

    // 解析 | 管道符多关键词并发
    const subQueries = String(rawQuery)
        .split('|')
        .map(q => q.trim())
        .filter(Boolean);

    if (subQueries.length === 0) {
        throw new Error('检索关键词为空，请输入有效关键词。');
    }

    const searchOptions = {
        count,
        needContent,
        oriQuestion,
        localization
    };

    if (subQueries.length === 1) {
        // 单个查询
        let finalQuery = subQueries[0];
        if (site && !finalQuery.includes('site:')) {
            finalQuery = `${finalQuery} site:${site.trim()}`;
        }

        const data = await executeSingleSearch(finalQuery, searchOptions);
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        }
        return formatSearchResultsToMarkdown(finalQuery, data);
    } else {
        // 多关键词并行检索
        const executedQueries = subQueries.map(q => {
            if (site && !q.includes('site:')) {
                return `${q} site:${site.trim()}`;
            }
            return q;
        });

        const settledResults = await runChunked(executedQueries, MAX_CONCURRENT, async (q) => {
            const data = await executeSingleSearch(q, searchOptions);
            return { query: q, data };
        });

        let successCount = 0;
        let md = `## 🌐 DeepSeek 多路并行搜索报告 (共 ${executedQueries.length} 个检索词)\n\n`;
        const rawJsonList = [];

        settledResults.forEach((res, idx) => {
            const targetQuery = executedQueries[idx];
            if (res.status === 'fulfilled') {
                successCount++;
                const { data } = res.value;
                rawJsonList.push({ query: targetQuery, data });
                md += formatSearchResultsToMarkdown(targetQuery, data);
                md += '\n---\n\n';
            } else {
                md += `### ❌ 查询失败: \`${targetQuery}\`\n> 错误信息: ${res.reason?.message || '未知错误'}\n\n---\n\n`;
            }
        });

        if (successCount === 0) {
            throw new Error(`所有检索关键词均执行失败。错误: ${settledResults[0]?.reason?.message || '未知错误'}`);
        }

        if (format === 'json') {
            return JSON.stringify(rawJsonList, null, 2);
        }
        return md;
    }
}

async function handleFetchCommand(requestData) {
    const rawUrl = getFirstParam(requestData, ['url', 'urls', 'link', 'target_url']);
    if (!rawUrl) {
        throw new Error('缺少必需的参数: url。请提供需要抓取的网页完整 URL 地址。');
    }

    const subUrls = String(rawUrl)
        .split('|')
        .map(u => u.trim())
        .filter(Boolean);

    if (subUrls.length === 0) {
        throw new Error('URL 地址为空，请输入有效网址。');
    }

    if (subUrls.length === 1) {
        const targetUrl = subUrls[0];
        const data = await executeSingleFetch(targetUrl);
        return formatFetchResultToMarkdown(targetUrl, data);
    } else {
        const settledResults = await runChunked(subUrls, MAX_CONCURRENT, async (u) => {
            const data = await executeSingleFetch(u);
            return { url: u, data };
        });

        let successCount = 0;
        let md = `## 📄 DeepSeek 网页多路批量抓取报告 (共 ${subUrls.length} 个页面)\n\n`;

        settledResults.forEach((res, idx) => {
            const targetUrl = subUrls[idx];
            if (res.status === 'fulfilled') {
                successCount++;
                const { data } = res.value;
                md += formatFetchResultToMarkdown(targetUrl, data);
            } else {
                md += `### ❌ 抓取失败: [${targetUrl}](${targetUrl})\n> 错误信息: ${res.reason?.message || '未知错误'}\n\n---\n\n`;
            }
        });

        if (successCount === 0) {
            throw new Error(`所有网页抓取均执行失败。错误: ${settledResults[0]?.reason?.message || '未知错误'}`);
        }

        return md;
    }
}

// --- 8. 入口执行与 STDIO 通信 ---

async function main() {
    let inputBuffer = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
        inputBuffer += chunk;
    });

    process.stdin.on('end', async () => {
        let output = {};

        try {
            if (!inputBuffer.trim()) {
                throw new Error('未从 stdin 接收到任何输入数据。');
            }

            let requestData;
            try {
                requestData = JSON.parse(inputBuffer);
            } catch (err) {
                throw new Error(`解析输入 JSON 数据失败: ${err.message}`);
            }

            // 识别命令
            const command = String(
                getFirstParam(requestData, ['command', 'commandIdentifier', 'action', 'cmd'], '')
            ).toLowerCase();

            let resultMarkdown = '';

            if (command === 'deepseekfetch' || command === 'fetch' || (requestData.url && !requestData.query)) {
                // 抓取模式
                resultMarkdown = await handleFetchCommand(requestData);
            } else {
                // 默认走搜索模式
                resultMarkdown = await handleSearchCommand(requestData);
            }

            output = {
                status: 'success',
                result: resultMarkdown
            };

        } catch (err) {
            output = {
                status: 'error',
                error: `[DeepSeekSearch Error] ${err.message}`
            };
        }

        // 输出标准 JSON 字符串到 stdout
        process.stdout.write(JSON.stringify(output, null, 2));
        process.exit(0);
    });
}

main().catch(fatalErr => {
    const errorOutput = {
        status: 'error',
        error: `[DeepSeekSearch Fatal] ${fatalErr.message || fatalErr}`
    };
    process.stdout.write(JSON.stringify(errorOutput, null, 2));
    process.exit(1);
});
