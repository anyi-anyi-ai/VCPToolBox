const http = require('http');
const https = require('https');
const { execFile } = require('child_process');

const OBSIDIAN_EXECUTABLE_PATH = process.env.OBSIDIAN_EXECUTABLE_PATH || 'obsidian';
const OBSIDIAN_VAULT_NAME = process.env.OBSIDIAN_VAULT_NAME || '';
const OBSIDIAN_REST_URL = process.env.OBSIDIAN_REST_URL || 'http://127.0.0.1:27123';
const OBSIDIAN_REST_KEY = process.env.OBSIDIAN_REST_KEY || '';
const OBSIDIAN_DEBUG = normalizeBoolean(process.env.OBSIDIAN_DEBUG, false);
const OBSIDIAN_VERIFY_WRITE = normalizeBoolean(process.env.OBSIDIAN_VERIFY_WRITE, true);
const OBSIDIAN_ALLOWED_COMMANDS = (process.env.OBSIDIAN_ALLOWED_COMMANDS || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

function debugLog(event, details = {}) {
    if (!OBSIDIAN_DEBUG) return;
    try {
        console.error(`[ObsidianManager][${event}] ${JSON.stringify(details)}`);
    } catch {
        console.error(`[ObsidianManager][${event}]`, details);
    }
}

function summarizeContent(content, maxLength = 120) {
    const value = String(content ?? '');
    const normalized = value.replace(/\s+/g, ' ').trim();
    return normalized.slice(0, maxLength);
}

function isAbsoluteLikePath(filepath) {
    return /^[a-zA-Z]:[\\/]/.test(filepath) || /^\\\\/.test(filepath);
}

function validateVaultRelativePath(filepath, fieldLabel = 'filepath') {
    const original = normalizeValue(filepath);
    if (!original) throw new Error(`缺少参数: ${fieldLabel}`);
    if (isAbsoluteLikePath(original)) {
        throw new Error(`${fieldLabel} 必须是 Vault 内相对路径，不能传入磁盘绝对路径: ${original}`);
    }

    const cleaned = cleanPath(original);
    if (!cleaned) throw new Error(`${fieldLabel} 不能为空路径`);
    if (cleaned.includes('..')) {
        throw new Error(`${fieldLabel} 不能包含上级路径跳转: ${original}`);
    }
    return cleaned;
}

async function verifyWrittenContent(filepath, expectedContent) {
    const actualContent = await requestAPI('GET', buildVaultEndpoint(filepath), null, true);
    const expected = String(expectedContent ?? '');
    const actual = String(actualContent ?? '');
    const matched = actual === expected;
    return {
        verified: matched,
        filepath,
        expectedLength: Buffer.byteLength(expected, 'utf8'),
        actualLength: Buffer.byteLength(actual, 'utf8'),
        expectedPreview: summarizeContent(expected),
        actualPreview: summarizeContent(actual),
    };
}

function outputResult(status, resultOrError, extra = {}) {
    const output = { status, ...extra };
    if (status === 'success') {
        output.result = resultOrError;
    } else {
        output.error = resultOrError instanceof Error ? resultOrError.message : resultOrError;
    }
    console.log(JSON.stringify(output));
    process.exit(0);
}

function normalizeValue(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim();
}

function normalizeBoolean(value, defaultValue = false) {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
    return defaultValue;
}

function normalizeInteger(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}

function coalesce(...values) {
    for (const value of values) {
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return undefined;
}

function cleanPath(p) {
    let value = normalizeValue(p).replace(/\\/g, '/');
    while (value.startsWith('/')) value = value.slice(1);
    value = value.replace(/\/+/g, '/');
    return value;
}

function getRequiredString(parameters, aliases, fieldLabel) {
    for (const alias of aliases) {
        const value = normalizeValue(parameters[alias]);
        if (value) return value;
    }
    throw new Error(`缺少参数: ${fieldLabel}`);
}

function getOptionalString(parameters, aliases, defaultValue = '') {
    for (const alias of aliases) {
        const value = normalizeValue(parameters[alias]);
        if (value) return value;
    }
    return defaultValue;
}

function normalizeCommandName(command) {
    return normalizeValue(command).toLowerCase().replace(/[_\-\s]+/g, '');
}

const COMMAND_ALIASES = {
    listdirectory: 'ListDirectory',
    listdir: 'ListDirectory',
    readdirectory: 'ListDirectory',
    readnote: 'ReadNote',
    readfile: 'ReadNote',
    getnote: 'ReadNote',
    writenote: 'WriteNote',
    writefile: 'WriteNote',
    createnote: 'WriteNote',
    appendnote: 'AppendNote',
    appendfile: 'AppendNote',
    addtonote: 'AppendNote',
    searchvault: 'SearchVault',
    search: 'SearchVault',
    searchnotes: 'SearchVault',
    searchadvanced: 'SearchAdvanced',
    advancedsearch: 'SearchAdvanced',
    getactivenote: 'GetActiveNote',
    activenote: 'GetActiveNote',
    currentnote: 'GetActiveNote',
    deletenote: 'DeleteNote',
    deletefile: 'DeleteNote',
    removenote: 'DeleteNote',
    movenote: 'MoveNote',
    renamenote: 'RenameNote',
    getnotemetadata: 'GetNoteMetadata',
    metadata: 'GetNoteMetadata',
    createdailynote: 'CreateDailyNote',
    ensuredailynote: 'CreateDailyNote',
    listrecentnotes: 'ListRecentNotes',
    recentnotes: 'ListRecentNotes',
    opennote: 'OpenNote',
    openfile: 'OpenNote',
    openvault: 'OpenVault',
    opendailynote: 'OpenDailyNote',
    openuri: 'OpenURI',
    runobsidiancommand: 'RunObsidianCommand',
    runcommand: 'RunObsidianCommand',
    batch: 'Batch',
    batchcommands: 'Batch',
};

function canonicalCommandName(command) {
    const normalized = normalizeCommandName(command);
    return COMMAND_ALIASES[normalized] || normalizeValue(command);
}

function resolveBatchOperations(request) {
    if (Array.isArray(request.operations) && request.operations.length > 0) {
        return request.operations.map(item => ({ ...item }));
    }

    const numberedCommands = Object.keys(request)
        .map(key => {
            const match = key.match(/^command(\d+)$/i);
            if (!match) return null;
            return Number(match[1]);
        })
        .filter(item => Number.isInteger(item))
        .sort((a, b) => a - b);

    if (numberedCommands.length === 0) return [];

    return numberedCommands.map(index => {
        const operation = { command: request[`command${index}`] };
        for (const [key, value] of Object.entries(request)) {
            if (key.toLowerCase() === `command${index}`.toLowerCase()) continue;
            const suffixMatch = key.match(new RegExp(`^(.*)${index}$`, 'i'));
            if (suffixMatch) {
                operation[suffixMatch[1]] = value;
            }
        }
        return operation;
    });
}

function buildVaultEndpoint(rawPath, forceDirectory = false) {
    const cleanedPath = cleanPath(rawPath);
    if (!cleanedPath) return '/vault/';
    return forceDirectory ? `/vault/${cleanedPath}/` : `/vault/${cleanedPath}`;
}

function buildObsidianURI(action, parameters = {}) {
    const search = new URLSearchParams();
    if (OBSIDIAN_VAULT_NAME) {
        search.set('vault', OBSIDIAN_VAULT_NAME);
    }

    if (action === 'open') {
        const file = coalesce(parameters.file, parameters.path, parameters.filepath, parameters.note);
        if (file) search.set('file', normalizeValue(file));
    }

    if (action === 'daily') {
        search.set('daily', 'true');
    }

    if (action === 'command') {
        const commandId = normalizeValue(parameters.commandId || parameters.command);
        if (!commandId) throw new Error('缺少参数: commandId');
        search.set('commandid', commandId);
    }

    const query = search.toString();
    return `obsidian://${action}${query ? `?${query}` : ''}`;
}

function ensureAllowedCommand(commandId) {
    if (OBSIDIAN_ALLOWED_COMMANDS.length === 0) {
        throw new Error('未配置 OBSIDIAN_ALLOWED_COMMANDS，已禁用 RunObsidianCommand 以避免危险调用');
    }
    if (!OBSIDIAN_ALLOWED_COMMANDS.includes(commandId)) {
        throw new Error(`命令未在白名单中: ${commandId}`);
    }
}

function runObsidianCLI(args, options = {}) {
    return new Promise((resolve, reject) => {
        let finalArgs = [];
        if (OBSIDIAN_VAULT_NAME && !options.skipVault) {
            finalArgs.push('--vault', OBSIDIAN_VAULT_NAME);
        }
        finalArgs = finalArgs.concat(args);

        execFile(OBSIDIAN_EXECUTABLE_PATH, finalArgs, (error, stdout, stderr) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    reject(new Error(`找不到配置的 Obsidian 程序: ${OBSIDIAN_EXECUTABLE_PATH}`));
                } else {
                    reject(new Error(`执行失败: ${error.message} \nStderr: ${stderr}`));
                }
                return;
            }
            if (stderr && stderr.trim() !== '') {
                reject(new Error(`命令警告或报错: ${stderr}`));
                return;
            }
            resolve({ stdout: stdout.trim(), args: finalArgs });
        });
    });
}

function requestAPI(method, endpoint, body = null, isTextResponse = false) {
    return new Promise((resolve, reject) => {
        if (!OBSIDIAN_REST_KEY) return reject(new Error('未配置 OBSIDIAN_REST_KEY'));

        const url = new URL(endpoint, OBSIDIAN_REST_URL);
        const protocol = url.protocol === 'https:' ? https : http;
        const options = {
            method,
            headers: { Authorization: `Bearer ${OBSIDIAN_REST_KEY}` },
        };

        let payload = body;
        if (payload !== null && payload !== undefined) {
            if (typeof payload === 'string' && (method === 'PUT' || method === 'POST')) {
                options.headers['Content-Type'] = 'text/markdown';
            } else {
                options.headers['Content-Type'] = 'application/json';
                if (typeof payload !== 'string') payload = JSON.stringify(payload);
            }
        }

        debugLog('request.start', {
            method,
            endpoint,
            url: url.toString(),
            isTextResponse,
            payloadType: payload === null || payload === undefined ? 'none' : typeof payload,
            payloadLength: payload === null || payload === undefined ? 0 : Buffer.byteLength(String(payload), 'utf8'),
            payloadPreview: payload === null || payload === undefined ? '' : summarizeContent(payload),
        });

        const req = protocol.request(url, options, res => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                debugLog('request.end', {
                    method,
                    endpoint,
                    url: url.toString(),
                    statusCode: res.statusCode,
                    responseLength: Buffer.byteLength(data || '', 'utf8'),
                    responsePreview: summarizeContent(data),
                });

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    if (isTextResponse) {
                        resolve(data);
                        return;
                    }
                    try {
                        resolve(data.trim() === '' ? {} : JSON.parse(data));
                    } catch {
                        resolve(data);
                    }
                    return;
                }
                reject(new Error(`REST API Error ${res.statusCode}: ${data}`));
            });
        });

        req.on('error', error => {
            debugLog('request.error', {
                method,
                endpoint,
                url: url.toString(),
                message: error.message,
            });
            reject(new Error(`网络异常: ${error.message}`));
        });
        if (payload !== null && payload !== undefined) req.write(payload);
        req.end();
    });
}

function buildSearchQuery(parameters) {
    const query = getRequiredString(parameters, ['query', 'keyword', 'search', 'q'], 'query');
    const path = getOptionalString(parameters, ['path', 'directoryPath', 'folderPath'], '');
    const tag = getOptionalString(parameters, ['tag', 'label'], '');
    const terms = [query];
    if (path) terms.push(`path:${path}`);
    if (tag) terms.push(`#${tag.replace(/^#/, '')}`);
    return terms.join(' ');
}

const commandHandlers = {
    async ListDirectory(parameters) {
        const path = getOptionalString(parameters, ['path', 'directoryPath', 'dir', 'folderPath'], '/');
        const endpoint = buildVaultEndpoint(path, true);
        const result = await requestAPI('GET', endpoint);
        return {
            mode: 'rest',
            command: 'ListDirectory',
            path: cleanPath(path) || '/',
            result,
        };
    },

    async ReadNote(parameters) {
        const filepath = cleanPath(getRequiredString(parameters, ['filepath', 'filePath', 'path', 'notePath'], 'filepath'));
        const result = await requestAPI('GET', buildVaultEndpoint(filepath), null, true);
        return {
            mode: 'rest',
            command: 'ReadNote',
            filepath,
            result,
        };
    },

    async WriteNote(parameters) {
        const rawFilepath = getRequiredString(parameters, ['filepath', 'filePath', 'path', 'notePath'], 'filepath');
        const filepath = validateVaultRelativePath(rawFilepath, 'filepath');
        const content = coalesce(parameters.content, parameters.text, parameters.body);
        if (content === undefined || content === null) throw new Error('缺少参数: content');
        const textContent = String(content);

        debugLog('write.prepare', {
            rawFilepath,
            filepath,
            contentLength: Buffer.byteLength(textContent, 'utf8'),
            contentPreview: summarizeContent(textContent),
            verifyWrite: OBSIDIAN_VERIFY_WRITE,
            restUrl: OBSIDIAN_REST_URL,
            vaultName: OBSIDIAN_VAULT_NAME,
        });

        const writeResponse = await requestAPI('PUT', buildVaultEndpoint(filepath), textContent, true);
        let verification = {
            verified: false,
            skipped: !OBSIDIAN_VERIFY_WRITE,
            filepath,
            reason: OBSIDIAN_VERIFY_WRITE ? 'not-run' : 'disabled-by-config',
        };

        if (OBSIDIAN_VERIFY_WRITE) {
            verification = await verifyWrittenContent(filepath, textContent);
            debugLog('write.verify', verification);
            if (!verification.verified) {
                throw new Error(`写入接口返回成功，但写后校验失败: ${filepath}；expectedLength=${verification.expectedLength}, actualLength=${verification.actualLength}, expectedPreview=${verification.expectedPreview}, actualPreview=${verification.actualPreview}`);
            }
        }

        return {
            mode: 'rest',
            command: 'WriteNote',
            filepath,
            writeVerified: verification.verified,
            verification,
            restUrl: OBSIDIAN_REST_URL,
            vaultName: OBSIDIAN_VAULT_NAME || null,
            apiResponsePreview: summarizeContent(writeResponse),
            result: `文件写入成功并完成校验: ${filepath}`,
        };
    },

    async AppendNote(parameters) {
        const filepath = cleanPath(getRequiredString(parameters, ['filepath', 'filePath', 'path', 'notePath'], 'filepath'));
        const content = coalesce(parameters.content, parameters.text, parameters.body, parameters.appendContent);
        if (content === undefined || content === null || String(content) === '') throw new Error('缺少参数: content');
        await requestAPI('POST', buildVaultEndpoint(filepath), String(content), true);
        return {
            mode: 'rest',
            command: 'AppendNote',
            filepath,
            result: `内容追加成功: ${filepath}`,
        };
    },

    async SearchVault(parameters) {
        const query = getRequiredString(parameters, ['query', 'keyword', 'search', 'q'], 'query');
        const result = await requestAPI('POST', `/search/simple/?query=${encodeURIComponent(query)}`, null, false);
        return {
            mode: 'rest',
            command: 'SearchVault',
            query,
            result,
        };
    },

    async SearchAdvanced(parameters) {
        const query = buildSearchQuery(parameters);
        const result = await requestAPI('POST', `/search/simple/?query=${encodeURIComponent(query)}`, null, false);
        return {
            mode: 'rest',
            command: 'SearchAdvanced',
            query,
            limit: normalizeInteger(coalesce(parameters.limit, parameters.maxResults), 20),
            result,
        };
    },

    async GetActiveNote() {
        const result = await requestAPI('GET', '/active/', null, false);
        return {
            mode: 'rest',
            command: 'GetActiveNote',
            result,
        };
    },

    async DeleteNote(parameters) {
        const filepath = cleanPath(getRequiredString(parameters, ['filepath', 'filePath', 'path', 'notePath'], 'filepath'));
        await requestAPI('DELETE', buildVaultEndpoint(filepath), null, false);
        return {
            mode: 'rest',
            command: 'DeleteNote',
            filepath,
            result: `文件删除成功: ${filepath}`,
        };
    },

    async MoveNote(parameters) {
        const from = cleanPath(getRequiredString(parameters, ['from', 'sourcePath', 'filepath', 'filePath'], 'from'));
        const to = cleanPath(getRequiredString(parameters, ['to', 'targetPath', 'destinationPath', 'newPath'], 'to'));
        const body = { target: to };
        await requestAPI('POST', `${buildVaultEndpoint(from)}/move`, body, false);
        return {
            mode: 'rest',
            command: 'MoveNote',
            from,
            to,
            result: `文件移动成功: ${from} -> ${to}`,
        };
    },

    async RenameNote(parameters) {
        const filepath = cleanPath(getRequiredString(parameters, ['filepath', 'filePath', 'path', 'notePath'], 'filepath'));
        const newName = getRequiredString(parameters, ['newName', 'name', 'targetName', 'renameTo'], 'newName');
        const segments = filepath.split('/').filter(Boolean);
        if (segments.length === 0) throw new Error('无法重命名空路径');
        segments[segments.length - 1] = newName;
        const targetPath = segments.join('/');
        return commandHandlers.MoveNote({ from: filepath, to: targetPath });
    },

    async GetNoteMetadata(parameters) {
        const filepath = cleanPath(getRequiredString(parameters, ['filepath', 'filePath', 'path', 'notePath'], 'filepath'));
        const content = await requestAPI('GET', buildVaultEndpoint(filepath), null, true);
        const metadata = {
            filepath,
            extension: filepath.includes('.') ? filepath.split('.').pop().toLowerCase() : '',
            size: Buffer.byteLength(content || '', 'utf8'),
            lineCount: String(content || '').split(/\r?\n/).length,
            headingCount: (String(content || '').match(/^#{1,6}\s+/gm) || []).length,
            taskCount: (String(content || '').match(/^- \[[ xX]\]/gm) || []).length,
            modifiedAt: null,
            createdAt: null,
        };
        return {
            mode: 'rest',
            command: 'GetNoteMetadata',
            filepath,
            result: metadata,
        };
    },

    async CreateDailyNote(parameters) {
        const folder = cleanPath(getOptionalString(parameters, ['folder', 'directory', 'path', 'dailyFolder'], 'Daily Notes'));
        const date = getOptionalString(parameters, ['date', 'day'], new Date().toISOString().slice(0, 10));
        const filename = getOptionalString(parameters, ['filename', 'name'], `${date}.md`);
        const filepath = cleanPath(`${folder}/${filename}`);
        const template = coalesce(parameters.content, parameters.template, parameters.body, `# ${date}\n`);
        await requestAPI('PUT', buildVaultEndpoint(filepath), String(template), true);
        return {
            mode: 'rest',
            command: 'CreateDailyNote',
            filepath,
            date,
            result: `每日笔记已创建或覆盖: ${filepath}`,
        };
    },

    async ListRecentNotes(parameters) {
        const path = getOptionalString(parameters, ['path', 'directoryPath', 'folderPath'], '/');
        const limit = Math.max(1, normalizeInteger(coalesce(parameters.limit, parameters.count, parameters.maxResults), 10));
        const directoryResult = await requestAPI('GET', buildVaultEndpoint(path, true));
        const list = Array.isArray(directoryResult) ? directoryResult.slice(0, limit) : directoryResult;
        return {
            mode: 'rest',
            command: 'ListRecentNotes',
            path: cleanPath(path) || '/',
            limit,
            result: list,
        };
    },

    async OpenNote(parameters) {
        const filepath = getOptionalString(parameters, ['filepath', 'filePath', 'path', 'notePath'], '');
        const noteName = getOptionalString(parameters, ['noteName', 'title', 'name', 'note'], '');
        const target = filepath || noteName;
        if (!target) throw new Error('缺少参数: filepath 或 noteName');
        const execution = await runObsidianCLI(['open', target]);
        return {
            mode: 'cli',
            command: 'OpenNote',
            target,
            cliArgs: execution.args,
            result: `成功在前台唤起并打开目标: ${target}`,
        };
    },

    async OpenVault(parameters) {
        const vaultName = getOptionalString(parameters, ['vaultName', 'name', 'vault'], OBSIDIAN_VAULT_NAME);
        if (!vaultName) throw new Error('缺少参数: vaultName，且未配置 OBSIDIAN_VAULT_NAME');
        const execution = await runObsidianCLI(['open'], { skipVault: true });
        return {
            mode: 'cli',
            command: 'OpenVault',
            vaultName,
            cliArgs: execution.args,
            result: `已请求打开 Obsidian Vault: ${vaultName}`,
        };
    },

    async OpenDailyNote() {
        const uri = buildObsidianURI('daily');
        const execution = await runObsidianCLI([uri], { skipVault: true });
        return {
            mode: 'cli',
            command: 'OpenDailyNote',
            uri,
            cliArgs: execution.args,
            result: '已请求打开每日笔记',
        };
    },

    async OpenURI(parameters) {
        const uri = getRequiredString(parameters, ['uri', 'url'], 'uri');
        const execution = await runObsidianCLI([uri], { skipVault: true });
        return {
            mode: 'cli',
            command: 'OpenURI',
            uri,
            cliArgs: execution.args,
            result: `已请求打开 URI: ${uri}`,
        };
    },

    async RunObsidianCommand(parameters) {
        const commandId = getRequiredString(parameters, ['commandId', 'command', 'obsidianCommand'], 'commandId');
        ensureAllowedCommand(commandId);
        const uri = buildObsidianURI('command', { commandId });
        const execution = await runObsidianCLI([uri], { skipVault: true });
        return {
            mode: 'cli',
            command: 'RunObsidianCommand',
            commandId,
            uri,
            cliArgs: execution.args,
            result: `已请求执行 Obsidian 命令: ${commandId}`,
        };
    },
};

async function executeSingleCommand(rawCommand, parameters = {}) {
    const command = canonicalCommandName(rawCommand);
    const handler = commandHandlers[command];
    if (!handler) {
        throw new Error(`未知的混合指令: ${rawCommand}`);
    }
    return handler(parameters);
}

async function processBatchRequest(request) {
    const operations = resolveBatchOperations(request);
    if (operations.length === 0) {
        throw new Error('Batch 模式缺少 operations 或 command1/command2/...');
    }

    const stopOnError = normalizeBoolean(coalesce(request.stopOnError, request.failFast), false);
    const results = [];

    for (let index = 0; index < operations.length; index += 1) {
        const operation = operations[index] || {};
        const { command, ...parameters } = operation;
        try {
            const result = await executeSingleCommand(command, parameters);
            results.push({ index: index + 1, command: canonicalCommandName(command), status: 'success', result });
        } catch (error) {
            results.push({ index: index + 1, command: canonicalCommandName(command), status: 'error', error: error.message });
            if (stopOnError) {
                return {
                    stopped: true,
                    stopOnError: true,
                    operations: results,
                };
            }
        }
    }

    return {
        stopped: false,
        stopOnError,
        operations: results,
        summary: {
            total: results.length,
            success: results.filter(item => item.status === 'success').length,
            failed: results.filter(item => item.status === 'error').length,
        },
    };
}

async function processRequest(req) {
    const command = canonicalCommandName(req.command || req.action);
    if (!command) {
        throw new Error('缺少参数: command');
    }

    if (command === 'Batch') {
        return processBatchRequest(req);
    }

    const { command: _command, action: _action, ...parameters } = req;
    return executeSingleCommand(command, parameters);
}

function main() {
    let inputData = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
        inputData += chunk;
    });
    process.stdin.on('end', async () => {
        if (!inputData.trim()) {
            outputResult('error', '无输入');
            return;
        }

        try {
            const request = JSON.parse(inputData);
            const result = await processRequest(request);
            outputResult('success', result);
        } catch (error) {
            if (error instanceof SyntaxError) {
                outputResult('error', `JSON 语法错误: ${error.message}`);
                return;
            }
            outputResult('error', error);
        }
    });
}

if (require.main === module) main();
