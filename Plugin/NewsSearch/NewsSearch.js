#!/usr/bin/env node
/**
 * NewsSearch - VCP 同步插件
 * 日报工作流专用新闻聚合搜索器
 * 
 * 功能:
 *   1. daily_scan  - 根据 news-sources.json 自动扫描全部板块
 *   2. search      - 自定义单次搜索
 *   3. list_boards - 列出所有可用板块
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ========== 配置加载 ==========
const SOURCES_PATH = path.join(__dirname, 'news-sources.json');
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const DEFAULT_SEARCH_DEPTH = process.env.DEFAULT_SEARCH_DEPTH || 'basic';
const MAX_CONCURRENT = parseInt(process.env.MAX_CONCURRENT || '3', 10);
const DEDUP_THRESHOLD = parseFloat(process.env.DEDUP_THRESHOLD || '0.85');

// ========== 工具函数 ==========

function loadSources() {
    try {
        const raw = fs.readFileSync(SOURCES_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        throw new Error(`无法加载信息源配置: ${e.message}`);
    }
}

function getDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function tavilySearch(query, topic, maxResults, searchDepth) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: query,
            topic: topic || 'general',
            search_depth: searchDepth || DEFAULT_SEARCH_DEPTH,
            max_results: maxResults || 5,
            include_answer: true,
            include_raw_content: false
        });

        const options = {
            hostname: 'api.tavily.com',
            port: 443,
            path: '/search',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.results) {
                        resolve(parsed);
                    } else if (parsed.detail) {
                        reject(new Error(`Tavily API error: ${parsed.detail}`));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    reject(new Error(`JSON parse error: ${e.message}`));
                }
            });
        });

        req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Request timeout (30s)'));
        });
        req.write(payload);
        req.end();
    });
}

// 简单的标题去重 (基于 Jaccard 相似度)
function jaccardSimilarity(a, b) {
    const setA = new Set(a.toLowerCase().split(/\s+/));
    const setB = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}

function deduplicateResults(results) {
    const unique = [];
    for (const item of results) {
        const isDup = unique.some(existing => 
            jaccardSimilarity(existing.title || '', item.title || '') > DEDUP_THRESHOLD
        );
        if (!isDup) {
            unique.push(item);
        }
    }
    return unique;
}

// 并发控制器
async function asyncPool(limit, items, fn) {
    const results = [];
    const executing = new Set();
    for (const item of items) {
        const p = Promise.resolve().then(() => fn(item));
        results.push(p);
        executing.add(p);
        const clean = () => executing.delete(p);
        p.then(clean, clean);
        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }
    return Promise.allSettled(results);
}

// ========== 命令处理 ==========

async function handleDailyScan(args) {
    const sources = loadSources();
    const profile = sources.daily_scan_profile;
    if (!profile) throw new Error('news-sources.json 中缺少 daily_scan_profile');

    const dateStr = args.date || getDateString();
    const boardFilter = args.boards ? args.boards.split(',').map(s => s.trim()) : null;
    const includeExtras = args.include_extras !== 'false';

    const boards = boardFilter 
        ? profile.boards.filter(b => boardFilter.includes(b.id))
        : profile.boards;

    const report = {
        scan_date: dateStr,
        profile_name: profile.name,
        boards: [],
        extras: {},
        stats: { total_results: 0, total_queries: 0, errors: [] }
    };

    // 构建所有搜索任务
    const tasks = [];
    for (const board of boards) {
        for (const qConfig of board.queries) {
            tasks.push({
                boardId: board.id,
                boardLabel: board.label,
                query: qConfig.query_template.replace('{date}', dateStr),
                topic: qConfig.topic,
                maxResults: qConfig.max_results,
                priority: qConfig.priority,
                fallback: qConfig.fallback || false
            });
        }
    }

    // 添加 extras 任务
    if (includeExtras && sources.extras) {
        for (const [key, eConfig] of Object.entries(sources.extras)) {
            tasks.push({
                boardId: `_extra_${key}`,
                boardLabel: key,
                query: eConfig.query_template,
                topic: eConfig.topic,
                maxResults: eConfig.max_results,
                priority: 99,
                isExtra: true,
                extraKey: key
            });
        }
    }

    report.stats.total_queries = tasks.length;

    // 执行搜索
    const results = await asyncPool(MAX_CONCURRENT, tasks, async (task) => {
        try {
            const searchResult = await tavilySearch(task.query, task.topic, task.maxResults);
            return { ...task, success: true, data: searchResult };
        } catch (e) {
            return { ...task, success: false, error: e.message };
        }
    });

    // 整理结果
    const boardMap = {};
    for (const r of results) {
        const settled = r.status === 'fulfilled' ? r.value : { ...r.reason, success: false };
        
        if (settled.isExtra) {
            if (settled.success && settled.data) {
                report.extras[settled.extraKey] = {
                    query: settled.query,
                    answer: settled.data.answer || null,
                    results: (settled.data.results || []).map(r => ({
                        title: r.title,
                        url: r.url,
                        content: r.content
                    }))
                };
            }
            continue;
        }

        if (!boardMap[settled.boardId]) {
            boardMap[settled.boardId] = {
                id: settled.boardId,
                label: settled.boardLabel,
                results: [],
                errors: []
            };
        }

        if (settled.success && settled.data && settled.data.results) {
            const items = settled.data.results.map(r => ({
                title: r.title,
                url: r.url,
                content: r.content,
                score: r.score || 0,
                published_date: r.published_date || null
            }));
            boardMap[settled.boardId].results.push(...items);
            report.stats.total_results += items.length;
        } else if (!settled.success) {
            boardMap[settled.boardId].errors.push(settled.error);
            report.stats.errors.push(`[${settled.boardId}] ${settled.error}`);
        }
    }

    // 去重并排序
    for (const [id, board] of Object.entries(boardMap)) {
        board.results = deduplicateResults(board.results);
        board.results.sort((a, b) => (b.score || 0) - (a.score || 0));
        report.boards.push(board);
    }

    // 生成文本摘要
    let summary = `# 📡 NewsSearch 日报扫描结果\n`;
    summary += `**扫描日期**: ${dateStr} | **配置**: ${profile.name}\n`;
    summary += `**统计**: ${report.stats.total_queries} 次查询, ${report.stats.total_results} 条结果`;
    if (report.stats.errors.length > 0) {
        summary += `, ⚠️ ${report.stats.errors.length} 个错误`;
    }
    summary += `\n\n---\n\n`;

    for (const board of report.boards) {
        summary += `## ${board.label}\n`;
        if (board.results.length === 0) {
            summary += `> 暂无结果\n\n`;
            continue;
        }
        for (const item of board.results.slice(0, 8)) {
            summary += `- **${item.title}**\n`;
            if (item.content) {
                const snippet = item.content.substring(0, 200).replace(/\n/g, ' ');
                summary += `  ${snippet}...\n`;
            }
            summary += `  🔗 ${item.url}\n\n`;
        }
    }

    if (Object.keys(report.extras).length > 0) {
        summary += `---\n\n## 📦 附加素材\n`;
        for (const [key, extra] of Object.entries(report.extras)) {
            summary += `### ${key}\n`;
            if (extra.answer) summary += `> ${extra.answer}\n\n`;
            for (const r of extra.results.slice(0, 3)) {
                summary += `- ${r.title}: ${r.url}\n`;
            }
            summary += `\n`;
        }
    }

    return summary;
}

async function handleSearch(args) {
    const query = args.query || args.Query;
    if (!query) throw new Error('缺少必需参数: query');

    const topic = args.topic || args.Topic || 'general';
    const maxResults = parseInt(args.max_results || args.maxResults || '5', 10);
    const searchDepth = args.search_depth || args.searchDepth || DEFAULT_SEARCH_DEPTH;

    const result = await tavilySearch(query, topic, maxResults, searchDepth);
    
    let output = `# 🔍 搜索结果: "${query}"\n`;
    output += `**Topic**: ${topic} | **Depth**: ${searchDepth}\n\n`;
    
    if (result.answer) {
        output += `## 📝 AI 摘要\n${result.answer}\n\n---\n\n`;
    }

    if (result.results && result.results.length > 0) {
        output += `## 📰 详细结果 (${result.results.length})\n`;
        for (const item of result.results) {
            output += `### ${item.title}\n`;
            if (item.content) output += `${item.content.substring(0, 300)}\n`;
            output += `🔗 ${item.url}\n\n`;
        }
    }

    return output;
}

function handleListBoards() {
    const sources = loadSources();
    const profile = sources.daily_scan_profile;
    
    let output = `# 📋 可用信息源板块\n\n`;
    output += `**配置名**: ${profile.name}\n\n`;
    
    for (const board of profile.boards) {
        const totalQueries = board.queries.length;
        const totalMax = board.queries.reduce((sum, q) => sum + q.max_results, 0);
        output += `- **${board.label}** (id: \`${board.id}\`) — ${totalQueries} 个查询模板, 最多 ${totalMax} 条结果\n`;
    }

    if (sources.extras) {
        output += `\n**附加素材**: ${Object.keys(sources.extras).join(', ')}\n`;
    }

    return output;
}

// ========== 主入口 ==========

async function main() {
    let inputData = '';
    
    process.stdin.setEncoding('utf-8');
    
    await new Promise((resolve) => {
        process.stdin.on('data', chunk => inputData += chunk);
        process.stdin.on('end', resolve);
    });

    let args;
    try {
        args = JSON.parse(inputData.trim());
    } catch (e) {
        console.log(JSON.stringify({
            status: 'error',
            error: `输入解析失败: ${e.message}`
        }));
        process.exit(1);
    }

    const command = args.command || args.Command || 'daily_scan';

    try {
        let result;
        switch (command) {
            case 'daily_scan':
                result = await handleDailyScan(args);
                break;
            case 'search':
                result = await handleSearch(args);
                break;
            case 'list_boards':
                result = handleListBoards();
                break;
            default:
                throw new Error(`未知命令: ${command}。可用命令: daily_scan, search, list_boards`);
        }

        console.log(JSON.stringify({
            status: 'success',
            result: result
        }));
    } catch (e) {
        console.log(JSON.stringify({
            status: 'error',
            error: e.message
        }));
    }

    process.exit(0);
}

main();