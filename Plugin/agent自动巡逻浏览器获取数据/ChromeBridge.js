// Plugin/ChromeBridge/ChromeBridge.js
// 混合插件：既是Service（常驻监控），又支持Direct调用（执行命令）
// v3.0.0 - 集成 Puppeteer 自动化引擎 + 拟人行为模拟
//   新增: launch_browser / close_browser / human_click / human_type
//         human_scroll / screenshot / get_page_content / execute_script
//   Agent 现在可以主动启动浏览器并像人一样操控它

const pluginManager = require('../../Plugin.js');
const webSocketServer = require('../../WebSocketServer.js');
const fs = require('fs');
const path = require('path');

// ========== Puppeteer 自动化引擎 ==========
const browserManager = require('./browserManager');
const humanBehavior = require('./humanBehavior');

let pluginConfig = {};
let debugMode = false;

// ========== Feed 自动唤醒 Agent 配置 ==========
let feedAutoWakeEnabled = true;
let feedTargetAgent = '旺财';
let feedAutoWakeTriggers = ['auto_favorite'];
let feedUseDelegation = true;
let feedWakePromptTemplate = '大导演刚收藏了一个新视频（来源: {{SOURCE_URL}}）。数据已在 ChromeBridge 投喂队列中，请你立刻调用 get_feed 工具取出完整数据进行处理，然后按照你的工作流程执行嗅探分析并转交蔓蔓！';
// 防抖：记录最近一次自动唤醒的时间戳，避免短时间内重复唤醒
let lastWakeTimestamp = 0;
const WAKE_COOLDOWN_MS = 30000; // 30秒冷却

// ========== 定时巡逻调度器配置 ==========
let patrolEnabled = false;
let patrolIntervalMinutes = 60;
let patrolTimeWindowStart = 9;
let patrolTimeWindowEnd = 23;
let patrolAgent = '旺财';
let patrolStartupDelay = 120;
let patrolPromptTemplate = '';
let patrolTimer = null;
let isPatrolling = false; // 防止并发巡逻

// ========== 收藏夹增量检测 - 状态持久化 ==========
const STATE_FILE = path.join(__dirname, 'state', 'patrol_state.json');

/**
 * 读取巡逻状态（上次看到的视频 ID 列表等）
 * @returns {object} 状态对象
 */
function loadPatrolState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const raw = fs.readFileSync(STATE_FILE, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('[ChromeBridge] ⚠️ 读取巡逻状态失败:', e.message);
    }
    return { last_seen_ids: [], last_patrol_time: null, total_patrols: 0 };
}

/**
 * 保存巡逻状态
 * @param {object} state 状态对象
 */
function savePatrolState(state) {
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
        console.error('[ChromeBridge] ⚠️ 保存巡逻状态失败:', e.message);
    }
}

// 存储连接的Chrome插件客户端
const connectedChromes = new Map();

// 存储等待响应的命令
// key: requestId, value: { resolve, reject, timeout, waitForPageInfo }
const pendingCommands = new Map();

// 投喂数据队列
const feedQueue = [];

function initialize(config) {
    pluginConfig = config;
    debugMode = pluginConfig.DebugMode || false;
    
    // 读取 Feed 自动唤醒配置
    feedAutoWakeEnabled = String(pluginConfig.FeedAutoWakeAgent || 'true').toLowerCase() === 'true';
    feedTargetAgent = pluginConfig.FeedTargetAgent || '旺财';
    feedAutoWakeTriggers = (pluginConfig.FeedAutoWakeTriggers || 'auto_favorite').split(',').map(s => s.trim()).filter(Boolean);
    feedUseDelegation = String(pluginConfig.FeedUseDelegation || 'true').toLowerCase() === 'true';
    feedWakePromptTemplate = pluginConfig.FeedWakePrompt || feedWakePromptTemplate;
    
    if (debugMode) {
        console.log('[ChromeBridge] Initializing hybrid plugin...');
        console.log(`[ChromeBridge] Feed 自动唤醒: ${feedAutoWakeEnabled ? '✅ 启用' : '❌ 禁用'}, 目标Agent: ${feedTargetAgent}, 触发类型: [${feedAutoWakeTriggers.join(', ')}], 委托模式: ${feedUseDelegation}`);
    }
    
    // 读取定时巡逻配置
    patrolEnabled = String(pluginConfig.PatrolEnabled || 'false').toLowerCase() === 'true';
    patrolIntervalMinutes = parseInt(pluginConfig.PatrolIntervalMinutes || '60', 10);
    const timeWindow = (pluginConfig.PatrolTimeWindow || '9-23').split('-');
    patrolTimeWindowStart = parseInt(timeWindow[0] || '9', 10);
    patrolTimeWindowEnd = parseInt(timeWindow[1] || '23', 10);
    patrolAgent = pluginConfig.PatrolAgent || feedTargetAgent;
    patrolStartupDelay = parseInt(pluginConfig.PatrolStartupDelay || '120', 10);
    patrolPromptTemplate = pluginConfig.PatrolPrompt || '请执行收藏夹巡逻任务。';
    
    // 启动定时巡逻调度器
    if (patrolEnabled) {
        startPatrolScheduler();
    }
    
    pluginManager.staticPlaceholderValues.set("{{VCPChromePageInfo}}", "Chrome桥接已加载，等待浏览器连接...");
}

function registerRoutes(app, config, projectBasePath) {
    if (debugMode) {
        console.log('[ChromeBridge] Registering routes...');
    }
}

// WebSocketServer调用：新Chrome客户端连接
function handleNewClient(ws) {
    const clientId = ws.clientId;
    connectedChromes.set(clientId, ws);
    
    console.log(`[ChromeBridge] ✅ Chrome客户端已连接: ${clientId}, 总数: ${connectedChromes.size}`);
    pluginManager.staticPlaceholderValues.set("{{VCPChromePageInfo}}", "浏览器已连接，等待页面信息...");

    ws.on('close', () => {
        connectedChromes.delete(clientId);
        console.log(`[ChromeBridge] ❌ Chrome客户端断开: ${clientId}, 剩余: ${connectedChromes.size}`);
        
        if (connectedChromes.size === 0) {
            pluginManager.staticPlaceholderValues.set("{{VCPChromePageInfo}}", "浏览器连接已断开。");
        }
    });
}

// WebSocketServer调用：收到Chrome客户端的消息
function handleClientMessage(clientId, message) {
    if (message.type === 'pageInfoUpdate') {
        const markdown = message.data.markdown;
        
        // 更新占位符
        pluginManager.staticPlaceholderValues.set("{{VCPChromePageInfo}}", markdown);
        
        if (debugMode) {
            console.log(`[ChromeBridge] 📄 收到页面更新，长度: ${markdown?.length || 0}`);
        }
        
        // 检查是否有等待此页面信息的命令
        pendingCommands.forEach((pendingCmd, requestId) => {
            if (pendingCmd.waitForPageInfo && pendingCmd.commandExecuted) {
                console.log(`[ChromeBridge] 🎉 命令 ${requestId} 收到页面信息，准备返回`);
                clearTimeout(pendingCmd.timeout);
                if (typeof pendingCmd.cleanup === 'function') pendingCmd.cleanup();
                pendingCmd.resolve({
                    success: true,
                    message: pendingCmd.executionMessage,
                    page_info: markdown
                });
                pendingCommands.delete(requestId);
            }
        });
    }
    
    // 处理数据提取结果（来自浏览器插件的extract_data响应）
    if (message.type === 'extract_result') {
        const requestId = message.data?.requestId;
        if (requestId && pendingCommands.has(requestId)) {
            const pending = pendingCommands.get(requestId);
            clearTimeout(pending.timeout);
            pendingCommands.delete(requestId);
            
            if (message.data.status === 'error') {
                pending.reject(new Error(message.data.error || '数据提取失败'));
            } else {
                console.log(`[ChromeBridge] 🎉 数据提取完成: ${requestId}, 类型: ${message.data.extract_type}`);
                pending.resolve({
                    success: true,
                    extract_type: message.data.extract_type,
                    data: message.data.extractedData,
                    source_url: message.data.sourceUrl,
                    extracted_at: new Date().toISOString()
                });
            }
        }
    }
    
    // 处理下载结果（来自浏览器插件的download_video响应）
    if (message.type === 'download_result') {
        const requestId = message.data?.requestId;
        if (requestId && pendingCommands.has(requestId)) {
            const pending = pendingCommands.get(requestId);
            clearTimeout(pending.timeout);
            pendingCommands.delete(requestId);

            if (message.data.status === 'error') {
                pending.reject(new Error(message.data.error || '视频下载失败'));
            } else {
                console.log(`[ChromeBridge] 🎉 视频下载任务已创建: ${requestId}`);
                pending.resolve({
                    success: true,
                    message: message.data.message || '视频下载任务已开始',
                    task_id: message.data.task_id || null,
                    file_name: message.data.file_name || null,
                    save_path: message.data.save_path || null,
                    source_url: message.data.source_url || null,
                    created_at: new Date().toISOString()
                });
            }
        }
    }

    // 处理浏览器插件主动投喂的数据（用户右键"发送给VCP"）
    if (message.type === 'feed_data') {
        console.log(`[ChromeBridge] 🐺 收到浏览器投喂数据: ${message.data?.extract_type} from ${message.data?.sourceUrl}`);
        
        const feedData = {
            id: `feed-${Date.now()}`,
            extract_type: message.data.extract_type,
            page_type: message.data.page_type || null,
            data: message.data.extractedData,
            // API 级精确数据（旺财嗅探增强：统计/作者/话题/BGM/IP属地等）
            apiEnrichedData: message.data.apiEnrichedData || null,
            // 评论 API 缓存数据
            comments: message.data.comments || null,
            video_id: message.data.video_id || null,
            feed_warning: message.data.feed_warning || null,
            source_url: message.data.sourceUrl,
            fed_at: new Date().toISOString()
        };
        
        feedQueue.push(feedData);
        // 最多保留20条
        if (feedQueue.length > 20) feedQueue.shift();
        
        console.log(`[ChromeBridge] 📦 投喂数据已入队，当前队列长度: ${feedQueue.length}`);

        // ========== Phase 2: Feed 自动唤醒 Agent ==========
        if (feedAutoWakeEnabled && feedAutoWakeTriggers.includes(feedData.extract_type)) {
            triggerAgentWake(feedData);
        }
    }
}

// ========== Feed 自动唤醒 Agent 逻辑 ==========
/**
 * 当收到符合条件的 feed_data 时，自动通过 PluginManager 调用 AgentAssistant，
 * 向目标 Agent 发送一条虚拟任务指令。
 * 使用异步委托模式（task_delegation）防止阻塞主线程。
 * @param {object} feedData - 入队的投喂数据对象
 */
function triggerAgentWake(feedData) {
    const now = Date.now();
    
    // 防抖：冷却期内不重复唤醒
    if (now - lastWakeTimestamp < WAKE_COOLDOWN_MS) {
        console.log(`[ChromeBridge] ⏳ 自动唤醒冷却中，跳过本次 (距上次 ${Math.round((now - lastWakeTimestamp) / 1000)}s < ${WAKE_COOLDOWN_MS / 1000}s)`);
        return;
    }
    lastWakeTimestamp = now;
    
    // 构造唤醒提示词（替换模板占位符）
    const wakePrompt = feedWakePromptTemplate
        .replace(/\{\{FEED_TYPE\}\}/g, feedData.extract_type || 'unknown')
        .replace(/\{\{SOURCE_URL\}\}/g, feedData.source_url || '未知来源')
        .replace(/\{\{VIDEO_ID\}\}/g, feedData.video_id || '未知')
        .replace(/\{\{FED_AT\}\}/g, feedData.fed_at || new Date().toISOString())
        .replace(/\{\{FEED_SUMMARY\}\}/g, buildFeedSummary(feedData));
    
    // 构造 AgentAssistant processToolCall 的参数
    const agentArgs = {
        agent_name: feedTargetAgent,
        prompt: wakePrompt,
        maid: 'ChromeBridge(系统自动)',
        // 使用 temporary_contact 以避免污染 Agent 的长期对话上下文
        temporary_contact: 'true'
    };
    
    // 如果启用委托模式，添加 task_delegation 标记
    if (feedUseDelegation) {
        agentArgs.task_delegation = 'true';
    }
    
    console.log(`[ChromeBridge] 🚀 正在自动唤醒 Agent【${feedTargetAgent}】处理 ${feedData.extract_type} 数据...`);
    
    // 异步调用 PluginManager -> AgentAssistant，不阻塞 handleClientMessage
    // 使用 setImmediate 确保消息处理完毕后再触发
    setImmediate(async () => {
        try {
            const result = await pluginManager.processToolCall('AgentAssistant', agentArgs);
            
            if (result?.status === 'success') {
                console.log(`[ChromeBridge] ✅ Agent【${feedTargetAgent}】已被成功唤醒！`);
                if (feedUseDelegation && result.result?.content) {
                    // 委托模式下，打印委托 ID
                    const contentText = Array.isArray(result.result.content)
                        ? result.result.content.map(c => c.text || '').join('')
                        : String(result.result.content);
                    console.log(`[ChromeBridge] 📋 委托详情: ${contentText.substring(0, 200)}`);
                }
            } else {
                console.error(`[ChromeBridge] ❌ 唤醒 Agent【${feedTargetAgent}】失败:`, result?.error || '未知错误');
            }
        } catch (err) {
            console.error(`[ChromeBridge] ❌ 唤醒 Agent【${feedTargetAgent}】时发生异常:`, err.message);
        }
    });
}

/**
 * 从 feedData 中提取关键信息，构建简要摘要文本
 * @param {object} feedData - 投喂数据
 * @returns {string} 摘要文本
 */
function buildFeedSummary(feedData) {
    const parts = [];
    
    if (feedData.data?.title) parts.push(`标题: ${feedData.data.title}`);
    if (feedData.data?.author) parts.push(`作者: ${feedData.data.author}`);
    if (feedData.video_id) parts.push(`视频ID: ${feedData.video_id}`);
    if (feedData.source_url) parts.push(`来源: ${feedData.source_url}`);
    
    // 从 apiEnrichedData 中提取关键统计
    if (feedData.apiEnrichedData) {
        const api = feedData.apiEnrichedData;
        if (api.digg_count !== undefined) parts.push(`点赞: ${api.digg_count}`);
        if (api.comment_count !== undefined) parts.push(`评论: ${api.comment_count}`);
        if (api.collect_count !== undefined) parts.push(`收藏: ${api.collect_count}`);
        if (api.share_count !== undefined) parts.push(`分享: ${api.share_count}`);
    }
    
    if (feedData.feed_warning) parts.push(`⚠️ 警告: ${feedData.feed_warning}`);
    
    return parts.length > 0 ? parts.join(' | ') : '(无摘要信息)';
}

// ========== 定时巡逻调度器 ==========
/**
 * 启动巡逻定时器。服务器启动后延迟 patrolStartupDelay 秒，
 * 然后每隔 patrolIntervalMinutes 分钟检查一次是否需要执行巡逻。
 */
function startPatrolScheduler() {
    if (patrolTimer) {
        clearInterval(patrolTimer);
    }
    
    console.log(`[ChromeBridge] 🕐 巡逻调度器配置：间隔 ${patrolIntervalMinutes} 分钟, 时间窗口 ${patrolTimeWindowStart}:00-${patrolTimeWindowEnd}:00, 目标Agent: ${patrolAgent}`);
    console.log(`[ChromeBridge] 🕐 巡逻调度器将在 ${patrolStartupDelay} 秒后启动...`);
    
    setTimeout(() => {
        console.log(`[ChromeBridge] 🕐 巡逻调度器已激活！每 ${patrolIntervalMinutes} 分钟检查一次。`);
        
        // 启动时立刻检查一次
        checkAndExecutePatrol();
        
        // 然后按间隔定时检查
        patrolTimer = setInterval(() => {
            checkAndExecutePatrol();
        }, patrolIntervalMinutes * 60 * 1000);
        
        // 让定时器不阻止进程退出
        if (patrolTimer.unref) {
            patrolTimer.unref();
        }
    }, patrolStartupDelay * 1000);
}

/**
 * 停止巡逻定时器
 */
function stopPatrolScheduler() {
    if (patrolTimer) {
        clearInterval(patrolTimer);
        patrolTimer = null;
        console.log('[ChromeBridge] 🕐 巡逻调度器已停止。');
    }
}

/**
 * 检查当前时间是否在巡逻窗口内，如果是且没有正在进行的巡逻，则触发巡逻。
 */
function checkAndExecutePatrol() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // 检查是否在时间窗口内
    let inWindow = false;
    if (patrolTimeWindowStart <= patrolTimeWindowEnd) {
        // 普通窗口：如 9-23
        inWindow = currentHour >= patrolTimeWindowStart && currentHour < patrolTimeWindowEnd;
    } else {
        // 跨午夜窗口：如 22-6
        inWindow = currentHour >= patrolTimeWindowStart || currentHour < patrolTimeWindowEnd;
    }
    
    if (!inWindow) {
        if (debugMode) {
            console.log(`[ChromeBridge] 🕐 当前时间 ${currentHour}:00 不在巡逻窗口 (${patrolTimeWindowStart}:00-${patrolTimeWindowEnd}:00)，跳过。`);
        }
        return;
    }
    
    // 防止并发巡逻
    if (isPatrolling) {
        console.log('[ChromeBridge] 🕐 上一次巡逻仍在进行中，跳过本次。');
        return;
    }
    
    executePatrol();
}

/**
 * 执行巡逻：通过 AgentAssistant 向目标 Agent 发送巡逻指令。
 * Agent 会自行调用 ChromeBridge 工具完成浏览器操作。
 */
function executePatrol() {
    isPatrolling = true;
    const patrolState = loadPatrolState();
    patrolState.total_patrols = (patrolState.total_patrols || 0) + 1;
    patrolState.last_patrol_time = new Date().toISOString();
    savePatrolState(patrolState);
    
    console.log(`[ChromeBridge] 🔍 第 ${patrolState.total_patrols} 次定时巡逻开始，唤醒 Agent【${patrolAgent}】...`);
    
    // 构造巡逻指令（将换行转义恢复为真实换行）
    const patrolPrompt = patrolPromptTemplate.replace(/\\n/g, '\n');
    
    const agentArgs = {
        agent_name: patrolAgent,
        prompt: patrolPrompt,
        maid: 'ChromeBridge(定时巡逻)',
        temporary_contact: 'true',
        task_delegation: 'true'
    };
    
    setImmediate(async () => {
        try {
            const result = await pluginManager.processToolCall('AgentAssistant', agentArgs);
            
            if (result?.status === 'success') {
                console.log(`[ChromeBridge] 🔍 巡逻任务已成功委托给 Agent【${patrolAgent}】`);
                if (result.result?.content) {
                    const contentText = Array.isArray(result.result.content)
                        ? result.result.content.map(c => c.text || '').join('')
                        : String(result.result.content);
                    console.log(`[ChromeBridge] 📋 巡逻委托详情: ${contentText.substring(0, 200)}`);
                }
            } else {
                console.error(`[ChromeBridge] ❌ 巡逻唤醒 Agent【${patrolAgent}】失败:`, result?.error || '未知错误');
            }
        } catch (err) {
            console.error(`[ChromeBridge] ❌ 巡逻唤醒 Agent【${patrolAgent}】时发生异常:`, err.message);
        } finally {
            isPatrolling = false;
        }
    });
}

// 执行单个命令的辅助函数（内部使用）
async function executeSingleCommand(chromeWs, command, target, text, url, waitForPageInfo = false, isInCommandChain = false) {
    const requestId = `cb-req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // 特殊处理：open_url 在命令链中时，总是需要等待页面加载完成
    const needsPageLoad = (command === 'open_url' && isInCommandChain);
    const actualWaitForPageInfo = waitForPageInfo || needsPageLoad;
    
    console.log(`[ChromeBridge] 🚀 执行命令: ${command}, requestId: ${requestId}, 等待页面加载: ${actualWaitForPageInfo}`);
    
    // 构建命令消息
    const commandMessage = {
        type: 'command',
        data: {
            requestId,
            command,
            target,
            text,
            url,
            wait_for_page_info: actualWaitForPageInfo
        }
    };
    
    // 发送命令到Chrome
    chromeWs.send(JSON.stringify(commandMessage));
    
    // 创建Promise等待响应
    return new Promise((resolve, reject) => {
        // 监听命令执行结果（提前声明以便在 cleanup 中引用）
        const messageListener = (message) => {
            try {
                const msg = JSON.parse(message);
                
                if (msg.type === 'command_result' && msg.data?.requestId === requestId) {
                    const pending = pendingCommands.get(requestId);
                    if (!pending) return;
                    
                    if (msg.data.status === 'error') {
                        clearTimeout(pending.timeout);
                        pendingCommands.delete(requestId);
                        chromeWs.removeListener('message', messageListener);
                        reject(new Error(msg.data.error || '命令执行失败'));
                    } else if (!actualWaitForPageInfo) {
                        // 不需要等待页面信息，直接返回
                        clearTimeout(pending.timeout);
                        pendingCommands.delete(requestId);
                        chromeWs.removeListener('message', messageListener);
                        resolve({
                            success: true,
                            message: msg.data.message || '命令执行成功'
                        });
                    } else {
                        // 命令执行成功，标记并等待页面信息
                        console.log(`[ChromeBridge] ✅ 命令执行成功，等待页面加载/刷新...`);
                        pending.commandExecuted = true;
                        pending.executionMessage = msg.data.message || '命令执行成功';
                    }
                }
            } catch (e) {
                console.error('[ChromeBridge] 解析消息失败:', e);
            }
        };

        // cleanup 回调：移除 WebSocket 监听器，防止泄漏
        const cleanup = () => chromeWs.removeListener('message', messageListener);

        const timeout = setTimeout(() => {
            cleanup();
            pendingCommands.delete(requestId);
            reject(new Error(`命令执行超时 (${command})`));
        }, 30000); // 30秒超时
        
        // 注册等待（包含 cleanup 回调，供 handleClientMessage 中 pageInfoUpdate 路径调用）
        pendingCommands.set(requestId, {
            resolve,
            reject,
            timeout,
            cleanup,
            waitForPageInfo: actualWaitForPageInfo,
            commandExecuted: false,
            executionMessage: null
        });
        
        chromeWs.on('message', messageListener);
    });
}

// 处理 extract_data 命令的专用方法
async function handleExtractData(chromeWs, params) {
    const requestId = `cb-extract-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const extractType = params.extract_type || 'generic';
    const targetUrl = params.url || null;
    
    console.log(`[ChromeBridge] 🔍 数据提取请求: type=${extractType}, url=${targetUrl || '当前页面'}, requestId=${requestId}`);
    
    const commandMessage = {
        type: 'command',
        data: {
            requestId,
            command: 'extract_data',
            extract_type: extractType,
            url: targetUrl,
            options: {
                comment_count: parseInt(params.comment_count) || 50,
                include_replies: params.include_replies !== 'false',
                sort_by: params.sort_by || 'likes'
            }
        }
    };
    
    chromeWs.send(JSON.stringify(commandMessage));
    
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendingCommands.delete(requestId);
            reject(new Error(`数据提取超时 (${extractType})`));
        }, 60000); // 提取操作给60秒超时
        
        pendingCommands.set(requestId, {
            resolve, reject, timeout,
            waitForPageInfo: false,
            commandExecuted: false,
            executionMessage: null
        });
    });
}

// 处理 download_video 命令 - 请求浏览器侧触发下载
async function handleDownloadVideo(chromeWs, params) {
    const requestId = `cb-download-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const targetUrl = params.url || null;
    const customFilename = params.filename || null;

    console.log(`[ChromeBridge] ⬇️ 视频下载请求: url=${targetUrl || '当前页面'}, requestId=${requestId}`);

    const commandMessage = {
        type: 'command',
        data: {
            requestId,
            command: 'download_video',
            url: targetUrl,
            filename: customFilename
        }
    };

    chromeWs.send(JSON.stringify(commandMessage));

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendingCommands.delete(requestId);
            reject(new Error('视频下载请求超时'));
        }, 60000);

        pendingCommands.set(requestId, {
            resolve, reject, timeout,
            waitForPageInfo: false,
            commandExecuted: false,
            executionMessage: null
        });
    });
}

// 处理 get_feed 命令 - 读取浏览器投喂队列
function handleGetFeed() {
    if (feedQueue.length === 0) {
        return {
            success: true,
            message: '当前没有待处理的投喂数据。',
            feeds: [],
            count: 0
        };
    }
    
    const feeds = [...feedQueue];
    feedQueue.length = 0; // 读取后清空
    
    console.log(`[ChromeBridge] 📖 Agent读取了 ${feeds.length} 条投喂数据`);
    
    return {
        success: true,
        message: `共有 ${feeds.length} 条来自浏览器的投喂数据。`,
        feeds: feeds,
        count: feeds.length
    };
}

// ========== Puppeteer 命令处理器 ==========

// 定义 Puppeteer 专属命令列表（这些命令不需要 Chrome 扩展连接）
const PUPPETEER_COMMANDS = new Set([
    'launch_browser', 'close_browser',
    'human_click', 'human_type', 'human_scroll', 'human_browse',
    'screenshot', 'get_page_content', 'execute_script',
    'open_page', 'navigate', 'list_pages', 'browser_status',
    'favorites_check', 'favorites_mark_seen'
]);

/**
 * 处理 Puppeteer 自动化命令
 * Agent 可以通过这些命令主动启动并控制浏览器
 */
async function handlePuppeteerCommand(params) {
    const command = params.command;

    switch (command) {
        // ---------- 浏览器生命周期 ----------
        case 'launch_browser': {
            const config = {
                chromePath: pluginConfig.ChromePath || params.chrome_path || undefined,
                profilePath: pluginConfig.ChromeProfilePath || params.profile_path || undefined,
                profileName: pluginConfig.ChromeProfileName || params.profile_name || 'Default',
                headless: params.headless === 'true' || params.headless === true,
                loadExtension: params.load_extension !== 'false',
                proxyServer: params.proxy || undefined,
                viewport: params.viewport
                    ? { width: parseInt(params.viewport.split('x')[0]), height: parseInt(params.viewport.split('x')[1]) }
                    : humanBehavior.randomViewport()
            };

            if (debugMode) {
                browserManager.setDebugMode(true);
            }

            console.log(`[ChromeBridge] 🚀 Agent 请求启动浏览器 (headless: ${config.headless}, profile: ${config.profileName})`);
            return await browserManager.launchBrowser(config);
        }

        case 'close_browser': {
            console.log('[ChromeBridge] 🛑 Agent 请求关闭浏览器');
            return await browserManager.closeBrowser();
        }

        case 'browser_status': {
            const running = browserManager.isBrowserRunning();
            if (running) {
                return await browserManager.listPages();
            }
            return { success: true, running: false, message: '浏览器未启动。' };
        }

        // ---------- 页面管理 ----------
        case 'open_page': {
            const url = params.url;
            if (!url) throw new Error('open_page 命令需要 url 参数。');
            console.log(`[ChromeBridge] 📄 Agent 打开新页面: ${url}`);
            const result = await browserManager.openNewPage(url);
            // 等待页面完全加载
            const page = browserManager.getActivePage();
            if (page) {
                await humanBehavior.waitForPageReady(page);
            }
            return result;
        }

        case 'navigate': {
            const url = params.url;
            if (!url) throw new Error('navigate 命令需要 url 参数。');
            console.log(`[ChromeBridge] 🔗 Agent 导航到: ${url}`);
            const result = await browserManager.navigateTo(url);
            const page = browserManager.getActivePage();
            if (page) {
                await humanBehavior.waitForPageReady(page);
            }
            return result;
        }

        case 'list_pages': {
            return await browserManager.listPages();
        }

        // ---------- 拟人操作 ----------
        case 'human_click': {
            const selector = params.selector || params.target;
            if (!selector) throw new Error('human_click 命令需要 selector 参数（CSS选择器）。');
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。请先 launch_browser 并 open_page。');

            console.log(`[ChromeBridge] 🖱️ Agent 拟人点击: ${selector}`);
            await humanBehavior.humanClick(page, selector);

            // 点击后等待可能的页面变化
            await humanBehavior.mediumDelay();

            // 返回点击后的页面状态
            return {
                success: true,
                message: `已拟人点击元素: ${selector}`,
                current_url: page.url()
            };
        }

        case 'human_type': {
            const selector = params.selector || params.target;
            const text = params.text;
            if (!selector) throw new Error('human_type 命令需要 selector 参数。');
            if (!text) throw new Error('human_type 命令需要 text 参数。');
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。');

            console.log(`[ChromeBridge] ⌨️ Agent 拟人输入: "${text.substring(0, 20)}..." -> ${selector}`);
            await humanBehavior.humanType(page, selector, text);

            return {
                success: true,
                message: `已拟人输入 ${text.length} 个字符到 ${selector}`
            };
        }

        case 'human_scroll': {
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。');

            const options = {
                direction: params.direction || 'down',
                distance: params.distance ? parseInt(params.distance) : 0,
                times: params.times ? parseInt(params.times) : 3,
                smooth: params.smooth !== 'false'
            };

            console.log(`[ChromeBridge] 📜 Agent 拟人滚动: ${options.direction}, ${options.times}次`);
            await humanBehavior.humanScroll(page, options);

            return {
                success: true,
                message: `已拟人滚动 ${options.direction} ${options.times} 次`
            };
        }

        case 'human_browse': {
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。');

            const duration = params.duration ? parseInt(params.duration) : 5000;
            console.log(`[ChromeBridge] 👀 Agent 模拟浏览行为 ${duration}ms`);
            await humanBehavior.humanBrowse(page, duration);

            return {
                success: true,
                message: `已模拟 ${duration}ms 的人类浏览行为`
            };
        }

        // ---------- 数据获取 ----------
        case 'get_page_content': {
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。');

            console.log('[ChromeBridge] 📖 Agent 获取页面内容');
            const info = await browserManager.getPageInfo();

            // 同时更新占位符（使 {{VCPChromePageInfo}} 也能获得 Puppeteer 页面信息）
            if (info.content_preview) {
                const markdown = `**${info.title}** (${info.url})\n\n${info.content_preview}`;
                pluginManager.staticPlaceholderValues.set("{{VCPChromePageInfo}}", markdown);
            }

            return info;
        }

        case 'screenshot': {
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。');

            console.log('[ChromeBridge] 📸 Agent 截图当前页面');
            return await browserManager.takeScreenshot({
                fullPage: params.full_page === 'true' || params.full_page === true
            });
        }

        case 'execute_script': {
            const code = params.code || params.script;
            if (!code) throw new Error('execute_script 命令需要 code 参数。');
            const page = browserManager.getActivePage();
            if (!page) throw new Error('没有活动页面。');

            console.log(`[ChromeBridge] 💻 Agent 执行脚本: ${code.substring(0, 80)}...`);
            return await browserManager.executeScript(code);
        }

        // ---------- 收藏夹增量检测 ----------
        case 'favorites_check': {
            // Agent 提供它从页面提取到的视频 ID 列表
            // 本命令负责与上次巡逻的状态做对比，返回哪些是新的
            const currentIdsRaw = params.video_ids || params.ids;
            if (!currentIdsRaw) {
                throw new Error(
                    'favorites_check 需要 video_ids 参数（JSON数组字符串或逗号分隔的ID列表）。\n' +
                    '用法：先通过 get_page_content 或 execute_script 从收藏夹页面提取视频ID列表，然后传入此命令进行增量比对。'
                );
            }

            // 解析 ID 列表（支持 JSON 数组或逗号分隔）
            let currentIds;
            try {
                currentIds = Array.isArray(currentIdsRaw)
                    ? currentIdsRaw
                    : (currentIdsRaw.startsWith('[')
                        ? JSON.parse(currentIdsRaw)
                        : currentIdsRaw.split(',').map(id => id.trim()).filter(Boolean));
            } catch (e) {
                throw new Error(`video_ids 解析失败: ${e.message}`);
            }

            const state = loadPatrolState();
            const lastSeenIds = new Set(state.last_seen_ids || []);

            // 找出新增的 ID（在当前列表中但不在上次记录中）
            const newIds = currentIds.filter(id => !lastSeenIds.has(id));

            // 本次巡逻的源标签（可选，用于区分不同平台的收藏）
            const source = params.source || 'default';

            console.log(`[ChromeBridge] 🔍 收藏夹增量检测 [${source}]: 当前 ${currentIds.length} 个, 上次 ${lastSeenIds.size} 个, 新增 ${newIds.length} 个`);

            return {
                success: true,
                source,
                current_count: currentIds.length,
                last_seen_count: lastSeenIds.size,
                new_count: newIds.length,
                new_ids: newIds,
                has_new: newIds.length > 0,
                last_patrol_time: state.last_patrol_time,
                total_patrols: state.total_patrols,
                message: newIds.length > 0
                    ? `发现 ${newIds.length} 个新收藏！ID: ${newIds.join(', ')}`
                    : '没有发现新收藏，收藏夹无变化。'
            };
        }

        case 'favorites_mark_seen': {
            // Agent 确认已处理完新收藏后，调用此命令更新状态
            const idsToMarkRaw = params.video_ids || params.ids;
            if (!idsToMarkRaw) {
                throw new Error('favorites_mark_seen 需要 video_ids 参数。');
            }

            let idsToMark;
            try {
                idsToMark = Array.isArray(idsToMarkRaw)
                    ? idsToMarkRaw
                    : (idsToMarkRaw.startsWith('[')
                        ? JSON.parse(idsToMarkRaw)
                        : idsToMarkRaw.split(',').map(id => id.trim()).filter(Boolean));
            } catch (e) {
                throw new Error(`video_ids 解析失败: ${e.message}`);
            }

            const state = loadPatrolState();
            const existingIds = new Set(state.last_seen_ids || []);

            // 合并新 ID 到已知列表
            for (const id of idsToMark) {
                existingIds.add(id);
            }

            // 保留最近 200 条记录，防止状态文件无限增长
            const allIds = Array.from(existingIds);
            state.last_seen_ids = allIds.slice(-200);
            state.last_patrol_time = new Date().toISOString();
            state.total_patrols = (state.total_patrols || 0) + 1;

            savePatrolState(state);

            console.log(`[ChromeBridge] ✅ 巡逻状态已更新: 已标记 ${idsToMark.length} 个ID为已见，总记录 ${state.last_seen_ids.length} 条`);

            return {
                success: true,
                marked_count: idsToMark.length,
                total_seen: state.last_seen_ids.length,
                patrol_number: state.total_patrols,
                last_patrol_time: state.last_patrol_time,
                message: `已将 ${idsToMark.length} 个视频ID标记为已处理。累计巡逻 ${state.total_patrols} 次。`
            };
        }

        default:
            throw new Error(`未知的 Puppeteer 命令: ${command}`);
    }
}

// Direct调用接口（hybridservice 使用 processToolCall）
async function processToolCall(params) {
    // get_feed 不需要浏览器连接
    if (params.command === 'get_feed') {
        return handleGetFeed();
    }

    // ========== Puppeteer 自动化命令路由 ==========
    // 这些命令直接走 Puppeteer 引擎，不需要 Chrome 扩展连接
    if (PUPPETEER_COMMANDS.has(params.command)) {
        return await handlePuppeteerCommand(params);
    }
    
    // ========== 以下为原有的 Chrome 扩展通信逻辑 ==========
    // 检查是否有连接的Chrome客户端
    if (connectedChromes.size === 0) {
        // 如果 Puppeteer 浏览器正在运行，提示用户也可以使用 Puppeteer 命令
        if (browserManager.isBrowserRunning()) {
            throw new Error(
                '没有连接的Chrome扩展客户端。但 Puppeteer 浏览器正在运行中！' +
                '你可以使用 Puppeteer 命令（如 human_click, human_type, get_page_content 等）来操作浏览器。' +
                '如需使用扩展功能（extract_data, download_video），请确保VCPBridge扩展已安装并连接。'
            );
        }
        throw new Error(
            '没有连接的Chrome浏览器。你有两种方式操控浏览器：\n' +
            '1. 使用 launch_browser 命令让我主动启动一个浏览器（推荐，可拟人化操作）\n' +
            '2. 确保VCPChrome扩展已安装并连接（用于扩展特定功能如数据提取）'
        );
    }
    
    // 选择客户端：支持可选 client_id 参数指定目标浏览器
    let chromeWs;
    if (params.client_id && connectedChromes.has(params.client_id)) {
        chromeWs = connectedChromes.get(params.client_id);
    } else {
        if (params.client_id) {
            console.warn(`[ChromeBridge] ⚠️ 指定的 client_id "${params.client_id}" 未找到，回退到首个连接`);
        }
        chromeWs = Array.from(connectedChromes.values())[0];
    }
    
    // 特殊处理：extract_data 命令走专用通道
    if (params.command === 'extract_data') {
        return handleExtractData(chromeWs, params);
    }

    // 特殊处理：download_video 命令走专用通道
    if (params.command === 'download_video') {
        return handleDownloadVideo(chromeWs, params);
    }
    
    // 提取所有命令参数
    const commands = [];
    let commandIndex = 1;
    
    // 检查是否有编号的命令（command1, command2, ...）
    while (params[`command${commandIndex}`]) {
        commands.push({
            command: params[`command${commandIndex}`],
            target: params[`target${commandIndex}`],
            text: params[`text${commandIndex}`],
            url: params[`url${commandIndex}`]
        });
        commandIndex++;
    }
    
    // 如果没有编号命令，检查单个命令
    if (commands.length === 0 && params.command) {
        commands.push({
            command: params.command,
            target: params.target,
            text: params.text,
            url: params.url
        });
    }
    
    if (commands.length === 0) {
        throw new Error('未提供任何命令参数');
    }
    
    console.log(`[ChromeBridge] 📋 收到 ${commands.length} 个命令，准备串行执行`);
    
    const isCommandChain = commands.length > 1;
    
    // 串行执行所有命令
    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const isLastCommand = (i === commands.length - 1);
        
        console.log(`[ChromeBridge] 执行命令 ${i + 1}/${commands.length}: ${cmd.command}`);
        
        const result = await executeSingleCommand(
            chromeWs,
            cmd.command,
            cmd.target,
            cmd.text,
            cmd.url,
            isLastCommand,
            isCommandChain
        );
        
        console.log(`[ChromeBridge] ✅ 命令 ${i + 1}/${commands.length} 完成`);
        
        if (isLastCommand) {
            return result;
        }
    }
}

async function shutdown() {
    console.log('[ChromeBridge] 关闭中...');
    
    // 停止巡逻调度器
    stopPatrolScheduler();
    
    // 清理所有待处理的命令
    pendingCommands.forEach((pending, requestId) => {
        clearTimeout(pending.timeout);
        pending.reject(new Error('插件正在关闭'));
    });
    pendingCommands.clear();
    connectedChromes.clear();

    // 关闭 Puppeteer 浏览器（如果正在运行）
    if (browserManager.isBrowserRunning()) {
        console.log('[ChromeBridge] 🛑 正在关闭 Puppeteer 浏览器...');
        try {
            await browserManager.closeBrowser();
        } catch (e) {
            console.error('[ChromeBridge] 关闭 Puppeteer 浏览器失败:', e.message);
        }
    }
}

module.exports = {
    initialize,
    registerRoutes,
    handleNewClient,
    handleClientMessage,
    processToolCall,
    shutdown
};