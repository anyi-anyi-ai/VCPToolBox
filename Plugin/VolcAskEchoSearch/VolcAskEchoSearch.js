#!/usr/bin/env node
/**
 * VolcAskEchoSearch.js
 * VCP 插件：火山引擎 AskEcho Search Infinity 联网搜索
 * 适配支持 MCP (Model Context Protocol) 协议的火山引擎搜索服务端
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');
const dotenv = require('dotenv');

// 1. 加载当前插件目录的 config.env 配置
const envPath = path.join(__dirname, 'config.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

/**
 * 格式化搜索结果为干净利落的 Markdown 文本
 */
function formatSearchResult(mcpResult, query) {
    if (!mcpResult) {
        return `### 🔍 火山 AskEcho 搜索结果 (${query})\n未找到相关有效内容。`;
    }

    let rawText = '';

    if (typeof mcpResult === 'string') {
        rawText = mcpResult;
    } else if (mcpResult.content && Array.isArray(mcpResult.content)) {
        rawText = mcpResult.content
            .filter(item => item.type === 'text' && item.text)
            .map(item => item.text)
            .join('\n\n');
    } else if (mcpResult.result) {
        return formatSearchResult(mcpResult.result, query);
    } else {
        rawText = JSON.stringify(mcpResult, null, 2);
    }

    if (!rawText.trim()) {
        return `### 🔍 火山 AskEcho 搜索结果 (${query})\n未找到相关搜索结果。`;
    }

    // 如果已经是格式化的 Markdown 则直接包装输出
    return `### 🔍 火山 AskEcho 搜索结果 (${query})\n\n${rawText.trim()}`;
}

function resolveUvxCommand() {
    if (process.env.UVX_COMMAND && fs.existsSync(process.env.UVX_COMMAND)) {
        return process.env.UVX_COMMAND;
    }
    const isWin = process.platform === 'win32';
    const binaryName = isWin ? 'uvx.exe' : 'uvx';

    const possiblePaths = [];
    if (isWin) {
        if (process.env.USERPROFILE) {
            possiblePaths.push(path.join(process.env.USERPROFILE, '.cargo', 'bin', binaryName));
            possiblePaths.push(path.join(process.env.USERPROFILE, '.local', 'bin', binaryName));
            possiblePaths.push(path.join(process.env.USERPROFILE, 'AppData', 'Roaming', 'uv', binaryName));
        }
        if (process.env.LOCALAPPDATA) {
            possiblePaths.push(path.join(process.env.LOCALAPPDATA, 'bin', binaryName));
            possiblePaths.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'uv', binaryName));
        }
    } else {
        if (process.env.HOME) {
            possiblePaths.push(path.join(process.env.HOME, '.cargo', 'bin', binaryName));
            possiblePaths.push(path.join(process.env.HOME, '.local', 'bin', binaryName));
        }
    }

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }

    return binaryName;
}

/**
 * MCP Stdio 客户端，封装与 uvx mcp-server-askecho-search-infinity 的 JSON-RPC 交互
 */
async function runMcpSearch(query, envVars) {
    return new Promise((resolve, reject) => {
        const uvxCmd = resolveUvxCommand();

        const args = [
            '--from',
            'git+https://github.com/volcengine/mcp-server#subdirectory=server/mcp_server_askecho_search_infinity',
            'mcp-server-askecho-search-infinity'
        ];

        // 拼接完整的环境变量
        const childEnv = {
            ...process.env,
            ...envVars
        };

        let child;
        try {
            child = spawn(uvxCmd, args, {
                env: childEnv,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: process.platform === 'win32' // Windows 下增强环境调起兼容性
            });
        } catch (err) {
            return reject(new Error(`无法启动 ${uvxCmd} 进程: ${err.message}`));
        }

        let pendingResolve = null;
        let pendingReject = null;
        const pendingCallbacks = new Map();
        let messageIdCounter = 1;
        let isInitialized = false;

        const rl = readline.createInterface({
            input: child.stdout,
            terminal: false
        });

        let stderrLogs = '';
        child.stderr.on('data', (data) => {
            stderrLogs += data.toString();
        });

        child.on('error', (err) => {
            if (err.code === 'ENOENT') {
                reject(new Error(
                    `未找到 ${uvxCmd} 执行程序！请确认已安装 uv。\n` +
                    `Windows 安装命令: powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"\n` +
                    `Linux/macOS 安装命令: curl -LsSf https://astral.sh/uv/install.sh | sh`
                ));
            } else {
                reject(new Error(`MCP 服务进程异常: ${err.message}`));
            }
        });

        // 超时定时器 (45秒)
        const timeoutTimer = setTimeout(() => {
            child.kill();
            reject(new Error(`调用 AskEcho MCP 搜索服务超时(45s)。子进程输出日志:\n${stderrLogs}`));
        }, 45000);

        function sendMessage(msgObj) {
            const jsonStr = JSON.stringify(msgObj);
            child.stdin.write(jsonStr + '\n');
        }

        function callRpc(method, params = {}) {
            return new Promise((res, rej) => {
                const id = messageIdCounter++;
                pendingCallbacks.set(id, { resolve: res, reject: rej });
                sendMessage({
                    jsonrpc: '2.0',
                    id: id,
                    method: method,
                    params: params
                });
            });
        }

        rl.on('line', (line) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            try {
                const msg = JSON.parse(trimmed);

                // 处理 JSON-RPC 响应
                if (msg.id && pendingCallbacks.has(msg.id)) {
                    const { resolve: res, reject: rej } = pendingCallbacks.get(msg.id);
                    pendingCallbacks.delete(msg.id);

                    if (msg.error) {
                        rej(new Error(`MCP RPC Error [${msg.error.code}]: ${msg.error.message}`));
                    } else {
                        res(msg.result);
                    }
                }
            } catch (e) {
                // 非 JSON 行，可能是 MCP Server 的日志
            }
        });

        // 执行完整 MCP 握手与工具调用序列
        (async () => {
            try {
                // 1. 初始化握手
                const initResult = await callRpc('initialize', {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    clientInfo: { name: 'VCP-VolcAskEchoSearch', version: '1.0.0' }
                });

                // 2. 发送 initialized 通知
                sendMessage({
                    jsonrpc: '2.0',
                    method: 'notifications/initialized'
                });
                isInitialized = true;

                // 3. 获取可用工具列表
                let targetToolName = 'askecho_search_infinity';
                try {
                    const toolsListResult = await callRpc('tools/list', {});
                    if (toolsListResult && Array.isArray(toolsListResult.tools) && toolsListResult.tools.length > 0) {
                        targetToolName = toolsListResult.tools[0].name || targetToolName;
                    }
                } catch (e) {
                    // 如果 tools/list 失败，回退使用默认工具名
                }

                // 4. 执行工具调用
                const callResult = await callRpc('tools/call', {
                    name: targetToolName,
                    arguments: { query: query }
                });

                clearTimeout(timeoutTimer);
                child.kill();
                resolve(callResult);
            } catch (err) {
                clearTimeout(timeoutTimer);
                child.kill();
                reject(err);
            }
        })();
    });
}

/**
 * 主入口逻辑
 */
async function main() {
    let inputData = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
        inputData += chunk;
    });

    process.stdin.on('end', async () => {
        let output = {};

        try {
            if (!inputData.trim()) {
                throw new Error("stdin 未接收到输入参数");
            }

            const data = JSON.parse(inputData);
            const query = data.query || data.search_query || data.keyword || data.content;

            if (!query || typeof query !== 'string' || !query.trim()) {
                throw new Error("缺少必需参数: query (搜索关键词或问题)");
            }

            // 提取环境变量鉴权参数
            const apiKey = process.env.ASK_ECHO_SEARCH_INFINITY_API_KEY || '';
            const ak = process.env.VOLCENGINE_ACCESS_KEY || '';
            const sk = process.env.VOLCENGINE_SECRET_KEY || '';

            if (!apiKey.trim() && (!ak.trim() || !sk.trim())) {
                throw new Error(
                    "鉴权失败：未在环境变量或 Plugin/VolcAskEchoSearch/config.env 中找到有效鉴权配置！\n" +
                    "请配置 ASK_ECHO_SEARCH_INFINITY_API_KEY 或同时配置 VOLCENGINE_ACCESS_KEY 与 VOLCENGINE_SECRET_KEY。"
                );
            }

            const envVars = {
                ASK_ECHO_SEARCH_INFINITY_API_KEY: apiKey.trim(),
                VOLCENGINE_ACCESS_KEY: ak.trim(),
                VOLCENGINE_SECRET_KEY: sk.trim()
            };

            // 执行 MCP 搜索
            const mcpResult = await runMcpSearch(query.trim(), envVars);
            const formattedResult = formatSearchResult(mcpResult, query.trim());

            output = {
                status: "success",
                result: formattedResult
            };

        } catch (err) {
            output = {
                status: "error",
                error: `VolcAskEchoSearch 执行错误: ${err.message}`
            };
        }

        process.stdout.write(JSON.stringify(output, null, 2));
    });
}

main().catch((err) => {
    process.stdout.write(JSON.stringify({
        status: "error",
        error: `Unhandled VolcAskEchoSearch Exception: ${err.message || err}`
    }));
    process.exit(1);
});
