// Plugin/AgentCreator/AgentCreator.js
// 智能Agent创作工坊 - hybridservice + direct 插件
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// ===== 模块级状态 =====
let AGENT_DIR = '';
let PROJECT_BASE_PATH = '';
let AGENT_MAP_FILE = '';
let DEFAULT_FILE_EXT = '.txt';
let BACKUP_ON_EDIT = true;
let AUTO_UPDATE_MAP = true;

let cachedTemplates = null; // Map<templateName, templateObject>
let agentManager = null;

// ===== 模块导出 =====
module.exports = { initialize, processToolCall, shutdown };

// ===== 初始化 =====
function initialize(config, dependencies) {
    PROJECT_BASE_PATH = config.PROJECT_BASE_PATH || path.resolve(__dirname, '..', '..');
    AGENT_DIR = process.env.AGENT_DIR_PATH
        ? path.resolve(PROJECT_BASE_PATH, process.env.AGENT_DIR_PATH)
        : path.join(PROJECT_BASE_PATH, 'Agent');
    AGENT_MAP_FILE = path.join(PROJECT_BASE_PATH, 'agent_map.json');
    DEFAULT_FILE_EXT = config.DEFAULT_FILE_EXT || '.txt';
    BACKUP_ON_EDIT = config.BACKUP_ON_EDIT !== 'false' && config.BACKUP_ON_EDIT !== false;
    AUTO_UPDATE_MAP = config.AUTO_UPDATE_MAP !== 'false' && config.AUTO_UPDATE_MAP !== false;

    try {
        agentManager = require('../../modules/agentManager');
    } catch (e) {
        console.error('[AgentCreator] Failed to load agentManager:', e.message);
    }

    loadTemplates();
    console.log(`[AgentCreator] Initialized. AGENT_DIR=${AGENT_DIR}, templates=${cachedTemplates ? cachedTemplates.size : 0}`);
}

function shutdown() {
    cachedTemplates = null;
    console.log('[AgentCreator] Shutdown.');
}

// ===== processToolCall 核心分发 =====
async function processToolCall(args) {
    // 串语法兼容：command -> command1
    if (args.command && !args.command1) {
        args.command1 = args.command;
        migrateUnindexedParams(args, 1);
    }

    const results = [];
    let i = 1;
    while (args[`command${i}`]) {
        const command = args[`command${i}`];
        const cmdArgs = extractCommandArgs(args, i);
        try {
            const result = await executeCommand(command, cmdArgs);
            results.push({ command, status: 'success', result });
        } catch (error) {
            results.push({ command, status: 'error', error: error.message });
        }
        i++;
    }

    if (results.length === 0) {
        return { status: 'error', error: '未指定任何命令。可用命令: CreateAgent, CreateFromTemplate, ListAgents, ViewAgent, EditAgent, CopyAgent, DeleteAgent, PreviewAgent, ListTemplates, ListAvailableResources, AnalyzeAgent, SuggestTools' };
    }

    return results.length === 1
        ? { status: results[0].status, ...(results[0].status === 'success' ? { result: results[0].result } : { error: results[0].error }) }
        : { status: 'success', results };
}

async function executeCommand(command, args) {
    switch (command) {
        case 'CreateAgent':             return await cmdCreateAgent(args);
        case 'CreateFromTemplate':      return await cmdCreateFromTemplate(args);
        case 'ListAgents':              return await cmdListAgents();
        case 'ViewAgent':               return await cmdViewAgent(args);
        case 'EditAgent':               return await cmdEditAgent(args);
        case 'CopyAgent':              return await cmdCopyAgent(args);
        case 'DeleteAgent':             return await cmdDeleteAgent(args);
        case 'PreviewAgent':            return await cmdPreviewAgent(args);
        case 'ListTemplates':           return await cmdListTemplates();
        case 'ListAvailableResources':  return await cmdListAvailableResources(args);
        case 'AnalyzeAgent':            return await cmdAnalyzeAgent(args);
        case 'SuggestTools':            return await cmdSuggestTools(args);
        default:
            throw new Error(`未知命令: ${command}。可用: CreateAgent, CreateFromTemplate, ListAgents, ViewAgent, EditAgent, CopyAgent, DeleteAgent, PreviewAgent, ListTemplates, ListAvailableResources, AnalyzeAgent, SuggestTools`);
    }
}

// ===================================================================
// 阶段一：核心 CRUD 命令
// ===================================================================

async function cmdCreateAgent(args) {
    const { agent_name, content, display_name, file_ext } = args;
    if (!agent_name) throw new Error('缺少必需参数: agent_name');
    if (!content) throw new Error('缺少必需参数: content');
    if (!/^[a-zA-Z0-9_]+$/.test(agent_name)) {
        throw new Error('agent_name 只允许字母、数字和下划线');
    }

    const ext = file_ext || DEFAULT_FILE_EXT;
    const filename = `${agent_name}${ext}`;
    const filePath = path.join(AGENT_DIR, filename);

    // 检查文件是否已存在
    if (fsSync.existsSync(filePath)) {
        throw new Error(`Agent文件 ${filename} 已存在。如要覆盖请先使用 EditAgent 或 DeleteAgent。`);
    }

    await fs.writeFile(filePath, content, 'utf-8');

    // 更新 agent_map.json
    const mapAlias = display_name || agent_name;
    let mapUpdated = false;
    if (AUTO_UPDATE_MAP) {
        mapUpdated = await updateAgentMap(mapAlias, filename, 'add');
    }

    // 通知 agentManager 重新扫描
    await notifyAgentManager();

    return {
        message: `Agent "${agent_name}" 创建成功。`,
        fileName: filename,
        mapAlias: mapAlias,
        mapUpdated: mapUpdated,
        hint: mapUpdated
            ? `已自动在 agent_map.json 中注册: "${mapAlias}" -> "${filename}"。`
            : '未更新 agent_map.json，如需在系统中使用此Agent，请手动添加映射。'
    };
}

async function cmdListAgents() {
    let agentMap = {};
    try {
        const mapContent = await fs.readFile(AGENT_MAP_FILE, 'utf-8');
        agentMap = JSON.parse(mapContent);
    } catch (e) {
        if (e.code !== 'ENOENT') console.error('[AgentCreator] Error reading agent_map.json:', e.message);
    }

    const files = await fs.readdir(AGENT_DIR, { withFileTypes: true });
    const agentFiles = files
        .filter(f => f.isFile() && (f.name.endsWith('.txt') || f.name.endsWith('.md')))
        .filter(f => !f.name.endsWith('.bak') && !f.name.includes('backup'));

    const agents = [];
    for (const file of agentFiles) {
        const filePath = path.join(AGENT_DIR, file.name);
        const stat = await fs.stat(filePath);
        const nameWithoutExt = path.parse(file.name).name;
        const aliases = Object.entries(agentMap)
            .filter(([_, filename]) => filename === file.name)
            .map(([alias]) => alias);

        agents.push({
            fileName: file.name,
            name: nameWithoutExt,
            size: `${(stat.size / 1024).toFixed(1)}KB`,
            lastModified: stat.mtime.toISOString().replace('T', ' ').substring(0, 19),
            registered: aliases.length > 0,
            aliases: aliases.length > 0 ? aliases : ['(未注册)'],
        });
    }

    return {
        total: agents.length,
        registered: agents.filter(a => a.registered).length,
        unregistered: agents.filter(a => !a.registered).length,
        agents,
    };
}

async function cmdViewAgent(args) {
    const { agent_name } = args;
    if (!agent_name) throw new Error('缺少必需参数: agent_name');

    const filePath = await resolveAgentFilePath(agent_name);
    const content = await fs.readFile(filePath, 'utf-8');
    const stat = await fs.stat(filePath);

    return {
        agent_name,
        fileName: path.basename(filePath),
        size: `${(stat.size / 1024).toFixed(1)}KB`,
        lastModified: stat.mtime.toISOString().replace('T', ' ').substring(0, 19),
        content,
    };
}

async function cmdEditAgent(args) {
    const { agent_name, content } = args;
    if (!agent_name) throw new Error('缺少必需参数: agent_name');
    if (!content) throw new Error('缺少必需参数: content');

    const filePath = await resolveAgentFilePath(agent_name);

    if (BACKUP_ON_EDIT) {
        const backupPath = filePath + '.bak';
        await fs.copyFile(filePath, backupPath);
    }

    await fs.writeFile(filePath, content, 'utf-8');
    await notifyAgentManager();

    return {
        message: `Agent "${agent_name}" 已更新。`,
        fileName: path.basename(filePath),
        backupCreated: BACKUP_ON_EDIT,
    };
}

async function cmdCopyAgent(args) {
    const { source_agent, new_agent_name, new_display_name } = args;
    if (!source_agent) throw new Error('缺少必需参数: source_agent');
    if (!new_agent_name) throw new Error('缺少必需参数: new_agent_name');
    if (!/^[a-zA-Z0-9_]+$/.test(new_agent_name)) {
        throw new Error('new_agent_name 只允许字母、数字和下划线');
    }

    const sourceFilePath = await resolveAgentFilePath(source_agent);
    const sourceContent = await fs.readFile(sourceFilePath, 'utf-8');

    const ext = path.extname(sourceFilePath) || DEFAULT_FILE_EXT;
    const newFileName = `${new_agent_name}${ext}`;
    const newFilePath = path.join(AGENT_DIR, newFileName);

    if (fsSync.existsSync(newFilePath)) {
        throw new Error(`目标文件 ${newFileName} 已存在。`);
    }

    await fs.writeFile(newFilePath, sourceContent, 'utf-8');

    const mapAlias = new_display_name || new_agent_name;
    let mapUpdated = false;
    if (AUTO_UPDATE_MAP) {
        mapUpdated = await updateAgentMap(mapAlias, newFileName, 'add');
    }

    await notifyAgentManager();

    return {
        message: `Agent "${source_agent}" 已复制为 "${new_agent_name}"。`,
        sourceFile: path.basename(sourceFilePath),
        newFile: newFileName,
        mapAlias,
        mapUpdated,
        hint: '复制后的Agent内容与源Agent完全相同。建议使用 EditAgent 修改个性化内容。'
    };
}

async function cmdDeleteAgent(args) {
    const { agent_name, confirm } = args;
    if (!agent_name) throw new Error('缺少必需参数: agent_name');
    if (confirm !== 'yes') throw new Error('删除操作需要确认。请设置 confirm 参数为 "yes"。');

    const filePath = await resolveAgentFilePath(agent_name);
    const fileName = path.basename(filePath);

    await fs.unlink(filePath);

    // 同时删除备份文件（如果存在）
    try { await fs.unlink(filePath + '.bak'); } catch (e) { /* 忽略 */ }

    let mapUpdated = false;
    if (AUTO_UPDATE_MAP) {
        mapUpdated = await updateAgentMap(null, fileName, 'removeByFile');
    }

    await notifyAgentManager();

    return {
        message: `Agent "${agent_name}" (文件: ${fileName}) 已删除。`,
        mapUpdated,
    };
}

// ===================================================================
// 阶段二：智能功能
// ===================================================================

async function cmdPreviewAgent(args) {
    const { agent_name } = args;
    if (!agent_name) throw new Error('缺少必需参数: agent_name');

    const filePath = await resolveAgentFilePath(agent_name);
    const rawContent = await fs.readFile(filePath, 'utf-8');

    const placeholders = extractPlaceholders(rawContent);
    let previewContent = rawContent;

    // 替换系统时间变量
    const now = new Date();
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    previewContent = previewContent.replace(/\{\{Date\}\}/g, now.toLocaleDateString('zh-CN'));
    previewContent = previewContent.replace(/\{\{Time\}\}/g, now.toLocaleTimeString('zh-CN'));
    previewContent = previewContent.replace(/\{\{Today\}\}/g, dayNames[now.getDay()]);
    previewContent = previewContent.replace(/\{\{Port\}\}/g, process.env.PORT || '6005');

    // 替换 Tar/Var 变量（仅展示值预览，不递归）
    for (const key of Object.keys(process.env)) {
        if (key.startsWith('Tar') || key.startsWith('Var')) {
            const val = process.env[key];
            const preview = val.length > 200 ? val.substring(0, 200) + '...[截断]' : val;
            previewContent = previewContent.replace(
                new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
                `[${key}: ${preview}]`
            );
        }
    }

    // 标注 RAG 引用
    previewContent = previewContent.replace(/\[\[([^\]]+)\]\]/g, (_, ref) => `[RAG日记检索: ${ref}]`);
    previewContent = previewContent.replace(/<<([^>]+)>>/g, (_, ref) => `[RAG Group检索: ${ref}]`);
    previewContent = previewContent.replace(/《《([^》]+)》》/g, (_, ref) => `[RAG TagMemo检索: ${ref}]`);

    // 标注 VCP 插件占位符
    const pluginPhs = placeholders.filter(p => p.startsWith('VCP'));
    for (const pp of pluginPhs) {
        previewContent = previewContent.replace(
            new RegExp(`\\{\\{${pp}\\}\\}`, 'g'),
            `[插件工具描述: ${pp}]`
        );
    }

    return {
        agent_name,
        rawLength: rawContent.length,
        previewContent,
        placeholderSummary: categorizePlaceholders(placeholders),
        hint: '预览中 RAG/插件/Tar/Var 引用未实际展开，仅做标注。系统时间变量已展开为当前值。'
    };
}

async function cmdListAvailableResources(args) {
    const type = (args.type || 'all').toLowerCase();
    const result = {};

    if (type === 'all' || type === 'plugins') {
        result.plugins = getAvailablePlugins();
    }
    if (type === 'all' || type === 'tar') {
        result.tarVariables = getEnvVarsByPrefix('Tar');
    }
    if (type === 'all' || type === 'var') {
        result.varVariables = getEnvVarsByPrefix('Var');
    }
    if (type === 'all' || type === 'diaries') {
        result.diaries = await getAvailableDiaries();
    }

    return result;
}

async function cmdAnalyzeAgent(args) {
    const { agent_name } = args;
    if (!agent_name) throw new Error('缺少必需参数: agent_name');

    const filePath = await resolveAgentFilePath(agent_name);
    const content = await fs.readFile(filePath, 'utf-8');
    const stat = await fs.stat(filePath);

    const allPlaceholders = extractPlaceholders(content);
    const categorized = categorizePlaceholders(allPlaceholders);

    const hasTarSysPrompt = content.includes('{{TarSysPrompt}}');
    const hasVarUser = content.includes('{{VarUser}}');
    const hasDiaryConfig = /\[\[.*日记本.*\]\]/.test(content);
    const hasRagRef = /\[\[.*\]\]|<<.*>>|《《.*》》/.test(content);
    const hasToolRef = allPlaceholders.some(p => p.startsWith('VCP'));
    const hasEmojiSystem = content.includes('TarEmojiPrompt') || content.includes('表情包');

    // 检查未注册的占位符
    const knownPrefixes = ['Tar', 'Var', 'Sar', 'VCP', 'Date', 'Time', 'Today', 'Festival', 'Port', 'Image_Key'];
    const unresolvedPlaceholders = allPlaceholders.filter(ph => {
        const isKnown = knownPrefixes.some(prefix => ph.startsWith(prefix)) ||
            ['Date', 'Time', 'Today', 'Festival', 'Port', 'Image_Key'].includes(ph);
        if (isKnown) return false;
        // 检查是否为已注册 Agent
        if (agentManager && typeof agentManager.isAgent === 'function') {
            return !agentManager.isAgent(ph);
        }
        return true;
    });

    return {
        agent_name,
        fileName: path.basename(filePath),
        fileSize: `${(stat.size / 1024).toFixed(1)}KB`,
        lineCount: content.split('\n').length,
        placeholders: categorized,
        keyComponents: {
            TarSysPrompt: { present: hasTarSysPrompt, importance: '关键', note: hasTarSysPrompt ? '已包含' : '建议添加 {{TarSysPrompt}}' },
            VarUser: { present: hasVarUser, importance: '推荐', note: hasVarUser ? '已包含' : '建议添加 {{VarUser}}' },
            日记本: { present: hasDiaryConfig, importance: '推荐', note: hasDiaryConfig ? '已配置' : '建议配置 [[Agent名日记本::Time::Group::TagMemo0.65]]' },
            RAG知识库: { present: hasRagRef, importance: '可选', note: hasRagRef ? '已配置' : '可添加知识库引用' },
            VCP工具: { present: hasToolRef, importance: '推荐', note: hasToolRef ? '已配置' : '建议添加VCP工具占位符' },
            表情包: { present: hasEmojiSystem, importance: '可选', note: hasEmojiSystem ? '已配置' : '可添加 {{TarEmojiPrompt}}' },
        },
        unresolvedPlaceholders: unresolvedPlaceholders.length > 0
            ? { count: unresolvedPlaceholders.length, items: unresolvedPlaceholders, warning: '这些占位符可能未注册，运行时将无法解析' }
            : { count: 0, message: '所有占位符均可正常解析' },
    };
}

async function cmdSuggestTools(args) {
    const { description } = args;
    if (!description) throw new Error('缺少必需参数: description');

    const desc = description.toLowerCase();

    // 关键词 -> 推荐工具 映射
    const toolMap = {
        '搜索|查询|检索|查找|search': ['VCPTavilySearch', 'VCPGoogleSearch'],
        '论文|学术|研究|arxiv|pubmed': ['VCPArxivDailyPapers', 'VCPPubMedSearch', 'VCPPaperReader'],
        '计算|数学|公式|统计': ['VCPSciCalculator'],
        '图片|画图|绘画|生成图|插画': ['VCPFluxGen', 'VCPGeminiImageGen', 'VCPComfyUIGen'],
        '音乐|作曲|歌曲|音频': ['VCPSunoGen', 'VCPMIDITranslator'],
        '文件|读写|文档|pdf': ['ServerFileOperator'],
        '天气|气象|温度': ['VCPWeatherInfo'],
        '视频|动画': ['VCPGrokVideo'],
        '代码|编程|开发|程序': ['VCPCodeSearcher', 'VCPPowerShellExecutor'],
        '日记|记忆|笔记|记录': ['VCPDailyNoteEditor', 'VCPLightMemo'],
        '网页|url|链接': ['VCPUrlFetch'],
        '新闻|热点|资讯': ['VCPDailyHot'],
        '定时|提醒|日程': ['VCPScheduleManager'],
        '论坛|交流|帖子': ['VCPForumLister'],
        '浏览器|chrome|网页控制': ['VCPChromeBridge'],
        '动漫|番剧|anime': ['VCPAnimeFinder', 'VCPBilibiliFetch'],
    };

    const recommendedTools = new Set();
    for (const [keywords, tools] of Object.entries(toolMap)) {
        if (keywords.split('|').some(kw => desc.includes(kw))) {
            tools.forEach(t => recommendedTools.add(t));
        }
    }

    // 推荐变量
    const recommendedVars = ['TarSysPrompt'];
    if (desc.includes('表情') || desc.includes('emoji')) recommendedVars.push('TarEmojiPrompt');
    if (desc.includes('渲染') || desc.includes('html') || desc.includes('图表')) recommendedVars.push('VarRendering');
    if (desc.includes('文件') || desc.includes('文档')) recommendedVars.push('VarFileTool');
    if (desc.includes('日记') || desc.includes('记忆')) recommendedVars.push('VarDailyNoteGuide');
    recommendedVars.push('VarUser', 'VarSystemInfo');

    // 推荐模板
    let recommendedTemplate = '对话伙伴';
    if (desc.match(/角色|扮演|人设|虚构|二次元/)) recommendedTemplate = '角色扮演';
    else if (desc.match(/工具|任务|执行|自动化/)) recommendedTemplate = '工具专家';
    else if (desc.match(/知识|学习|文档|检索/)) recommendedTemplate = '知识管家';
    else if (desc.match(/写作|创作|故事|小说/)) recommendedTemplate = '创意写手';
    else if (desc.match(/女仆|陪伴|宠物|萌/)) recommendedTemplate = '主题女仆';
    else if (desc.match(/命令|脚本|运维|系统/)) recommendedTemplate = '任务执行者';

    return {
        description,
        recommendations: {
            template: recommendedTemplate,
            tools: [...recommendedTools].map(t => ({ name: t, placeholder: `{{${t}}}` })),
            variables: recommendedVars.map(v => ({ name: v, placeholder: `{{${v}}}` })),
            diaryConfig: {
                personal: `[[${'{AgentName}'}日记本::Time::Group::TagMemo0.65]]`,
                knowledge: `[[${'{AgentName}'}的知识日记本::Time::Group::TagMemo0.5]]`,
                public: '[[公共日记本:Time::Group::Rerank::TagMemo0.55]]',
                hint: '请将 {AgentName} 替换为实际的Agent名称。日记本需在 dailynote/ 目录下创建对应文件夹。'
            },
            essentialStructure: [
                '1. 日记本/知识库引用区（文件开头）',
                '2. ————过往记忆区分隔线————',
                '3. 角色设定与个性描述',
                '4. {{TarSysPrompt}} 系统提示注入',
                '5. 工具描述占位符（{{VCPxxx}}）',
                '6. {{VarDailyNoteGuide}} 日记指南（如需日记功能）',
                '7. 额外指令（{{VarRendering}} 等）'
            ]
        }
    };
}

// ===================================================================
// 阶段三：模板系统
// ===================================================================

async function cmdListTemplates() {
    if (!cachedTemplates || cachedTemplates.size === 0) loadTemplates();

    const templateList = [];
    for (const [name, template] of cachedTemplates) {
        templateList.push({
            name,
            description: template.description,
            category: template.category,
            suitableFor: template.suitableFor,
            requiredParams: template.requiredParams,
            optionalParams: template.optionalParams || [],
            paramExample: template.paramExample || {},
        });
    }

    return { total: templateList.length, templates: templateList };
}

async function cmdCreateFromTemplate(args) {
    const { template_name, agent_name, display_name, params, save } = args;
    if (!template_name) throw new Error('缺少必需参数: template_name');
    if (!agent_name) throw new Error('缺少必需参数: agent_name');

    if (!cachedTemplates || cachedTemplates.size === 0) loadTemplates();
    const template = cachedTemplates.get(template_name);
    if (!template) {
        const available = [...cachedTemplates.keys()].join(', ');
        throw new Error(`未找到模板 "${template_name}"。可用模板: ${available}`);
    }

    let templateParams = {};
    if (params) {
        try {
            templateParams = typeof params === 'string' ? JSON.parse(params) : params;
        } catch (e) {
            throw new Error(`params 参数不是有效的JSON: ${e.message}`);
        }
    }

    // 验证必需参数
    if (template.requiredParams) {
        for (const rp of template.requiredParams) {
            if (!templateParams[rp]) {
                throw new Error(`模板 "${template_name}" 需要参数: ${rp}。完整参数列表: ${template.requiredParams.join(', ')}`);
            }
        }
    }

    // 渲染模板
    const renderedContent = renderTemplate(template, {
        agent_name,
        display_name: display_name || agent_name,
        ...templateParams
    });

    if (String(save).toLowerCase() === 'true') {
        return await cmdCreateAgent({ agent_name, content: renderedContent, display_name });
    }

    return {
        message: `模板 "${template_name}" 渲染完成。以下是预览内容，请审阅后使用 CreateAgent 命令保存。`,
        template_used: template_name,
        agent_name,
        preview_content: renderedContent,
        hint: '如满意此内容，可使用 CreateAgent 命令保存，或设置 save 参数为 true 重新调用此命令。'
    };
}

// ===================================================================
// 辅助函数
// ===================================================================

async function resolveAgentFilePath(agentName) {
    // 方式1: 直接文件名匹配
    for (const ext of ['.txt', '.md', '']) {
        const filePath = path.join(AGENT_DIR, `${agentName}${ext}`);
        if (fsSync.existsSync(filePath) && fsSync.statSync(filePath).isFile()) {
            return filePath;
        }
    }

    // 方式2: 从 agent_map.json 查找别名
    try {
        const mapContent = await fs.readFile(AGENT_MAP_FILE, 'utf-8');
        const agentMap = JSON.parse(mapContent);
        if (agentMap[agentName]) {
            const filePath = path.join(AGENT_DIR, agentMap[agentName]);
            if (fsSync.existsSync(filePath)) return filePath;
        }
    } catch (e) { /* ignore */ }

    throw new Error(`找不到Agent "${agentName}"。请使用 ListAgents 命令查看所有可用Agent。`);
}

async function updateAgentMap(alias, filename, action) {
    let agentMap = {};
    try {
        const content = await fs.readFile(AGENT_MAP_FILE, 'utf-8');
        agentMap = JSON.parse(content);
    } catch (e) {
        if (e.code !== 'ENOENT') throw e;
    }

    if (action === 'add') {
        agentMap[alias] = filename;
    } else if (action === 'remove') {
        delete agentMap[alias];
    } else if (action === 'removeByFile') {
        for (const [key, val] of Object.entries(agentMap)) {
            if (val === filename) delete agentMap[key];
        }
    }

    await fs.writeFile(AGENT_MAP_FILE, JSON.stringify(agentMap, null, 2), 'utf-8');

    // 通知 agentManager 重新加载映射
    if (agentManager && typeof agentManager.loadMap === 'function') {
        try { await agentManager.loadMap(); } catch (e) { /* ignore */ }
    }

    return true;
}

async function notifyAgentManager() {
    if (agentManager && typeof agentManager.scanAgentFiles === 'function') {
        try { await agentManager.scanAgentFiles(); } catch (e) { /* ignore */ }
    }
}

function extractPlaceholders(content) {
    const regex = /\{\{([a-zA-Z0-9_:]+)\}\}/g;
    const matches = [...content.matchAll(regex)];
    return [...new Set(matches.map(m => m[1]))];
}

function categorizePlaceholders(placeholders) {
    return {
        tar: placeholders.filter(p => p.startsWith('Tar')),
        var: placeholders.filter(p => p.startsWith('Var')),
        sar: placeholders.filter(p => p.startsWith('Sar')),
        plugins: placeholders.filter(p => p.startsWith('VCP')),
        system: placeholders.filter(p => ['Date', 'Time', 'Today', 'Festival', 'Port', 'Image_Key'].includes(p)),
        agents: placeholders.filter(p =>
            !p.startsWith('Tar') && !p.startsWith('Var') && !p.startsWith('Sar') && !p.startsWith('VCP') &&
            !['Date', 'Time', 'Today', 'Festival', 'Port', 'Image_Key'].includes(p) &&
            !p.includes(':')
        ),
    };
}

function getAvailablePlugins() {
    try {
        const pm = require('../../Plugin');
        const descriptions = pm.getIndividualPluginDescriptions();
        const plugins = [];
        for (const [key, desc] of descriptions) {
            plugins.push({
                placeholder: `{{${key}}}`,
                pluginName: key.replace(/^VCP/, ''),
                descriptionPreview: desc.substring(0, 150) + (desc.length > 150 ? '...' : '')
            });
        }
        return plugins;
    } catch (e) {
        return [{ error: '无法加载插件列表: ' + e.message }];
    }
}

function getEnvVarsByPrefix(prefix) {
    const vars = [];
    for (const key of Object.keys(process.env)) {
        if (key.startsWith(prefix)) {
            const val = String(process.env[key]);
            vars.push({
                name: key,
                placeholder: `{{${key}}}`,
                valuePreview: val.substring(0, 100) + (val.length > 100 ? '...' : ''),
                isFile: val.endsWith('.txt'),
            });
        }
    }
    return vars;
}

async function getAvailableDiaries() {
    const dailyNoteRoot = process.env.KNOWLEDGEBASE_ROOT_PATH ||
        path.join(PROJECT_BASE_PATH, 'dailynote');
    try {
        const entries = await fs.readdir(dailyNoteRoot, { withFileTypes: true });
        return entries
            .filter(e => e.isDirectory())
            .map(e => ({
                name: e.name,
                syntax: {
                    time: `[[${e.name}::Time::Group::TagMemo0.65]]`,
                    group: `<<${e.name}::Group>>`,
                    tagmemo: `《《${e.name}::Group::TagMemo》》`
                }
            }));
    } catch (e) {
        return [{ error: '无法扫描日记本目录: ' + e.message }];
    }
}

// ===== 模板系统 =====

function loadTemplates() {
    cachedTemplates = new Map();
    const templatesDir = path.join(__dirname, 'templates');

    if (!fsSync.existsSync(templatesDir)) {
        fsSync.mkdirSync(templatesDir, { recursive: true });
    }

    const files = fsSync.readdirSync(templatesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
        if (file.startsWith('_')) continue;
        try {
            const template = JSON.parse(fsSync.readFileSync(path.join(templatesDir, file), 'utf-8'));
            cachedTemplates.set(template.name || path.parse(file).name, template);
        } catch (e) {
            console.error(`[AgentCreator] Failed to load template ${file}:`, e.message);
        }
    }
}

function renderTemplate(template, params) {
    let content = template.template;
    for (const [key, value] of Object.entries(params)) {
        if (value != null) {
            content = content.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value));
        }
    }
    // 清理未填充的可选参数占位符
    content = content.replace(/\$\{[a-zA-Z0-9_]+\}/g, '');
    // 清理多余空行（3+连续空行压缩为2个）
    content = content.replace(/\n{4,}/g, '\n\n\n');
    return content.trim();
}

// ===== 串语法辅助 =====

function migrateUnindexedParams(args, index) {
    const knownParams = [
        'agent_name', 'content', 'display_name', 'file_ext', 'template_name',
        'params', 'save', 'source_agent', 'new_agent_name', 'new_display_name',
        'confirm', 'model', 'type', 'description'
    ];
    for (const param of knownParams) {
        if (args[param] !== undefined && args[`${param}${index}`] === undefined) {
            args[`${param}${index}`] = args[param];
        }
    }
}

function extractCommandArgs(args, index) {
    const result = {};
    const suffix = String(index);

    for (const [key, value] of Object.entries(args)) {
        if (key === `command${index}` || key === 'command' || key === 'tool_name') continue;
        if (key.endsWith(suffix) && key !== suffix) {
            const baseKey = key.slice(0, -suffix.length);
            result[baseKey] = value;
        }
    }

    // 对于单命令调用（index=1），也接受不带后缀的参数
    if (index === 1) {
        const knownParams = [
            'agent_name', 'content', 'display_name', 'file_ext', 'template_name',
            'params', 'save', 'source_agent', 'new_agent_name', 'new_display_name',
            'confirm', 'model', 'type', 'description'
        ];
        for (const param of knownParams) {
            if (args[param] !== undefined && result[param] === undefined) {
                result[param] = args[param];
            }
        }
    }

    return result;
}
