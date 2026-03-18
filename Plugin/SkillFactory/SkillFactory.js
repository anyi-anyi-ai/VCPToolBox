const fs = require('fs').promises;
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');
const REGISTRY_PATH = path.join(WORKSPACE_ROOT, 'skills_registry', 'index.json');
const DRAFTS_DIR = path.join(WORKSPACE_ROOT, 'skills_registry', 'drafts');

function sendResponse(data) {
    console.log(JSON.stringify(data));
    process.exit(0);
}

function normalizeValue(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim().toLowerCase();
}

function slugify(input) {
    return String(input || '')
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function toArray(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }
    if (!value) {
        return [];
    }
    return [value];
}

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function loadRegistry() {
    const raw = await fs.readFile(REGISTRY_PATH, 'utf-8');
    return JSON.parse(raw);
}

function inferCategory(goalText) {
    const text = normalizeValue(goalText);

    if (text.includes('调试') || text.includes('debug') || text.includes('排错') || text.includes('验证')) {
        return {
            l1: 'B. 工程实现与质量保障',
            l2: 'B2. 验证、调试与质量控制',
            l3: 'B2-1. 验证与调试流'
        };
    }

    if (text.includes('检索') || text.includes('研究') || text.includes('research') || text.includes('搜索')) {
        return {
            l1: 'C. 知识生产与持续学习',
            l2: 'C3. 检索增强与研究',
            l3: 'C3-1. 研究与检索增强'
        };
    }

    if (text.includes('配置') || text.includes('部署') || text.includes('运维')) {
        return {
            l1: 'E. 平台配置与运行支撑',
            l2: 'E2. 运维与运行支撑',
            l3: 'E2-1. 配置与运行支持'
        };
    }

    return {
        l1: 'A. Agent工作流与任务编排',
        l2: 'A2. 执行调度与协同开发',
        l3: 'A2-1. 任务执行与协作流'
    };
}

function inferCapabilityType(goalText) {
    const text = normalizeValue(goalText);
    if (text.includes('模板') || text.includes('特定领域')) {
        return '扩展能力';
    }
    if (text.includes('配置') || text.includes('运维')) {
        return '支撑能力';
    }
    return '核心能力';
}

function inferPriority(goalText) {
    const text = normalizeValue(goalText);
    if (text.includes('实验') || text.includes('可选')) {
        return 'P2';
    }
    if (text.includes('增强') || text.includes('辅助')) {
        return 'P1';
    }
    return 'P0';
}

function inferBridgeable(category, goalText) {
    const text = normalizeValue(goalText);
    if (category?.l1?.startsWith('B.') || category?.l1?.startsWith('C.')) {
        return true;
    }
    return text.includes('检查') || text.includes('review') || text.includes('verify');
}

function inferTitle(goalText) {
    const cleaned = String(goalText || '').trim();
    if (!cleaned) {
        return '未命名技能草案';
    }
    return cleaned.length > 36 ? `${cleaned.slice(0, 36)}...` : cleaned;
}

function buildSkillContent(goalText, skill, modules) {
    const moduleLine = modules.length > 0 ? modules.join('、') : '待补充';
    return `# Skill\n\n## 目的\n${goalText}\n\n## 适用场景\n- 当现有技能无法直接覆盖该需求时\n- 当 Agent 需要稳定复用同一处理流程时\n- 当该能力值得纳入 VCP 长期技能资产时\n\n## 输入\n- 用户的原始目标描述\n- 当前任务上下文\n- 相关代码、配置或知识资料\n\n## 输出\n- 结构化执行方案\n- 关键检查点与决策建议\n- 面向后续插件或工作流可复用的操作步骤\n\n## 执行步骤\n1. 解析用户目标与边界条件\n2. 拆分任务并识别关键风险\n3. 形成建议动作、检查点与产出要求\n4. 在必要时给出后续插件或模块调用建议\n\n## 决策规则\n- 优先复用已存在的稳定能力\n- 若发现输入不足，应先补充上下文再执行\n- 若存在明显风险，应优先输出风险提示与替代方案\n\n## 约束与风险\n- 该草案为自动生成的初版 skill，仍建议进入审核流程\n- 如果与现有 skill 高度重合，应优先考虑合并而不是新增\n\n## 与 VCP 模块的关系\n- 推荐映射模块：${moduleLine}\n- 当前草案名称：${skill.name}\n- 当前草案优先级：${skill.priority}\n`;
}

function draftSkillFromPrompt(request) {
    const userGoal = String(request.user_goal || '').trim();
    if (!userGoal) {
        throw new Error('缺少必需参数: user_goal');
    }

    const preferredLanguage = String(request.preferred_language || 'zh').trim() || 'zh';
    const targetModules = toArray(request.target_module);
    const category = inferCategory(userGoal);
    const capabilityType = inferCapabilityType(userGoal);
    const priority = inferPriority(userGoal);
    const baseName = slugify(request.name || userGoal) || `skill-${Date.now()}`;

    const skill = {
        skill_id: `vcp-local::${baseName}`,
        name: baseName,
        title: String(request.title || inferTitle(userGoal)),
        summary: String(request.summary || userGoal),
        category,
        capability_type: capabilityType,
        priority,
        status: 'draft',
        source_origin: 'vcp-local',
        source_path: `skills_registry/drafts/vcp-local--${baseName}.json`,
        language_hint: preferredLanguage,
        vcp_mapping: targetModules,
        trigger_mode: 'manual_or_rule',
        bridgeable: inferBridgeable(category, userGoal),
        tags: Array.from(new Set(['vcp-local', priority, capabilityType, `lang:${preferredLanguage}`])),
        version: '0.1.0',
        created_by: 'agent',
        created_at: new Date().toISOString()
    };

    skill.content = buildSkillContent(userGoal, skill, targetModules);

    return {
        skill,
        message: '已根据用户目标生成技能草案，可继续执行查重或保存。'
    };
}

function checkSkillOverlap(registry, request) {
    const skill = request.skill || {};
    const name = normalizeValue(skill.name);
    const title = normalizeValue(skill.title);
    const summary = normalizeValue(skill.summary);
    const skills = registry.skills || [];

    const exactMatches = skills.filter(item => normalizeValue(item.name) === name || normalizeValue(item.skill_id) === normalizeValue(skill.skill_id));
    const similarMatches = skills
        .filter(item => {
            const itemName = normalizeValue(item.name);
            const itemTitle = normalizeValue(item.title);
            const itemSummary = normalizeValue(item.summary);
            return (
                (name && itemName.includes(name)) ||
                (name && name.includes(itemName)) ||
                (title && itemTitle.includes(title)) ||
                (summary && itemSummary && (itemSummary.includes(summary) || summary.includes(itemSummary)))
            );
        })
        .slice(0, 10)
        .map(item => ({
            skill_id: item.skill_id,
            name: item.name,
            title: item.title,
            reason: '名称、标题或摘要存在相似性，建议人工确认是否复用或合并'
        }));

    return {
        exact_matches: exactMatches,
        similar_matches: similarMatches,
        risk_level: exactMatches.length > 0 ? 'high' : (similarMatches.length > 0 ? 'medium' : 'low'),
        suggestion: exactMatches.length > 0
            ? '存在完全重复技能，建议优先复用或修改名称'
            : (similarMatches.length > 0 ? '存在相似技能，建议比较差异后再决定是否新增' : '未发现明显重复，可继续保存草案')
    };
}

async function saveSkillDraft(request) {
    const skill = request.skill;
    if (!skill || typeof skill !== 'object') {
        throw new Error('缺少必需参数: skill');
    }
    if (!skill.skill_id || !skill.name || !skill.title) {
        throw new Error('skill 草案缺少关键字段: skill_id/name/title');
    }

    await ensureDir(DRAFTS_DIR);
    const draftFileName = `${skill.skill_id.replace(/::/g, '--').replace(/[^a-zA-Z0-9\-_]/g, '-')}.json`;
    const draftPath = path.join(DRAFTS_DIR, draftFileName);
    const draftRecord = {
        ...skill,
        source_path: path.relative(WORKSPACE_ROOT, draftPath).replace(/\\/g, '/'),
        updated_at: new Date().toISOString()
    };

    await fs.writeFile(draftPath, JSON.stringify(draftRecord, null, 2), 'utf-8');

    return {
        status: 'saved',
        draft_path: draftRecord.source_path,
        skill: draftRecord
    };
}

async function main(request) {
    const action = String(request.action || '').trim();
    if (!action) {
        throw new Error('缺少必需参数: action');
    }

    switch (action) {
        case 'draft_skill_from_prompt':
            return draftSkillFromPrompt(request);
        case 'check_skill_overlap': {
            const registry = await loadRegistry();
            return checkSkillOverlap(registry, request);
        }
        case 'save_skill_draft':
            return saveSkillDraft(request);
        default:
            throw new Error(`不支持的 action: ${action}`);
    }
}

let input = '';
process.stdin.on('data', chunk => {
    input += chunk.toString();
});

process.stdin.on('end', async () => {
    try {
        const request = JSON.parse(input || '{}');
        const result = await main(request);
        sendResponse({ status: 'success', result });
    } catch (error) {
        sendResponse({ status: 'error', error: error.message });
    }
});
