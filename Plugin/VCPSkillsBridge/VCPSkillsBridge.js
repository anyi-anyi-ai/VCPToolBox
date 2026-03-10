const fs = require('fs').promises;
const path = require('path');

const REGISTRY_PATH = path.resolve(__dirname, '..', '..', 'skills_registry', 'index.json');
const RUNTIME_CONFIG_PATH = path.resolve(__dirname, '..', '..', 'skills_registry', 'runtime_config.json');
const PRIORITY_WEIGHT = {
    P0: 4,
    P1: 3,
    P2: 2,
    P3: 1,
};

function sendResponse(data) {
    console.log(JSON.stringify(data));
    process.exit(0);
}

function normalizeValue(value) {
    if (value === undefined || value === null) return '';
    return String(value).trim().toLowerCase();
}

async function loadJsonIfExists(filePath) {
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

async function loadRegistryBundle() {
    const registry = await loadJsonIfExists(REGISTRY_PATH);
    if (!registry) {
        throw new Error('技能注册表不存在，请先生成 skills_registry/index.json');
    }

    const runtimeConfig = await loadJsonIfExists(RUNTIME_CONFIG_PATH) || {
        version: 'missing',
        defaults: {
            enabled: false,
            recommendable: true,
            bridge_enabled: true,
            deep_execute_enabled: false,
        },
        skills: {},
        summary: {
            total: 0,
            activeTotal: 0,
            disabledTotal: 0,
            recommendableTotal: 0,
            bridgeEnabledTotal: 0,
        },
    };

    return { registry, runtimeConfig };
}

function mergeRuntimeState(skill, runtimeConfig) {
    const defaults = runtimeConfig?.defaults || {};
    const runtimeSkill = runtimeConfig?.skills?.[skill.skill_id] || {};
    const mergedRuntime = {
        enabled: runtimeSkill.enabled ?? defaults.enabled ?? false,
        priority: runtimeSkill.priority || skill.priority || 'P3',
        recommendable: runtimeSkill.recommendable ?? defaults.recommendable ?? true,
        bridge_enabled: runtimeSkill.bridge_enabled ?? defaults.bridge_enabled ?? true,
        deep_execute_enabled: runtimeSkill.deep_execute_enabled ?? defaults.deep_execute_enabled ?? false,
        status: runtimeSkill.status || ((runtimeSkill.enabled ?? defaults.enabled ?? false) ? 'active' : 'disabled'),
        notes: runtimeSkill.notes || '',
    };

    return {
        ...skill,
        runtime: mergedRuntime,
        effective_priority: mergedRuntime.priority || skill.priority || 'P3',
        enabled: Boolean(mergedRuntime.enabled),
        recommendable: Boolean(mergedRuntime.recommendable),
        bridge_enabled: Boolean(mergedRuntime.bridge_enabled),
        deep_execute_enabled: Boolean(mergedRuntime.deep_execute_enabled),
    };
}

function hydrateSkills(registry, runtimeConfig) {
    const skills = Array.isArray(registry.skills) ? registry.skills : [];
    return skills.map(skill => mergeRuntimeState(skill, runtimeConfig));
}

function listSkills(skills, request) {
    const categoryL1 = normalizeValue(request.category_l1);
    const usageMethod = normalizeValue(request.usage_method);
    const family = normalizeValue(request.family);
    const priority = normalizeValue(request.priority);
    const tag = normalizeValue(request.tag);
    const enabledOnly = normalizeValue(request.enabled_only);
    const includeDisabled = normalizeValue(request.include_disabled);
    const limit = Math.max(1, parseInt(request.limit, 10) || 20);

    let filtered = skills;

    if (categoryL1) {
        filtered = filtered.filter(skill => normalizeValue(skill.category?.l1).includes(categoryL1));
    }
    if (usageMethod) {
        filtered = filtered.filter(skill => normalizeValue(skill.usage_category?.usage_method).includes(usageMethod));
    }
    if (family) {
        filtered = filtered.filter(skill => normalizeValue(skill.usage_category?.family).includes(family));
    }
    if (priority) {
        filtered = filtered.filter(skill => normalizeValue(skill.effective_priority) === priority);
    }
    if (tag) {
        filtered = filtered.filter(skill => (skill.tags || []).some(item => normalizeValue(item).includes(tag)));
    }
    if (enabledOnly === 'true') {
        filtered = filtered.filter(skill => skill.enabled);
    } else if (includeDisabled !== 'true') {
        filtered = filtered.filter(skill => skill.enabled);
    }

    return filtered.slice(0, limit);
}

function getSkillDetail(skills, request) {
    const skillId = String(request.skill_id || '').trim();
    if (!skillId) {
        throw new Error('缺少必需参数: skill_id');
    }

    const exactMatches = skills.filter(item => item.skill_id === skillId);
    if (exactMatches.length > 1) {
        throw new Error(`skill_id 不唯一，无法确定技能详情: ${skillId}`);
    }
    if (exactMatches.length === 1) {
        return exactMatches[0];
    }

    const nameMatches = skills.filter(item => item.name === skillId);
    if (nameMatches.length > 1) {
        throw new Error(`技能名称不唯一，请改用 skill_id: ${skillId}`);
    }
    if (nameMatches.length === 1) {
        return nameMatches[0];
    }

    throw new Error(`未找到技能: ${skillId}`);
}

function scoreSkill(skill, preferredNames, preferredUsageMethods) {
    let score = PRIORITY_WEIGHT[String(skill.effective_priority || 'P3').toUpperCase()] || 0;

    if (preferredNames.includes(skill.name)) {
        score += 10;
    }
    if (preferredUsageMethods.includes(skill.usage_category?.usage_method)) {
        score += 6;
    }
    if (skill.recommendable) {
        score += 3;
    }
    if (skill.enabled) {
        score += 2;
    }
    if (skill.bridge_enabled) {
        score += 1;
    }

    return score;
}

function recommendSkills(skills, request) {
    const taskType = normalizeValue(request.task_type);
    const usageMethod = normalizeValue(request.usage_method);
    const limit = Math.max(1, parseInt(request.limit, 10) || 10);

    const scoringRules = {
        research: {
            names: ['search-first', 'iterative-retrieval', 'skill-stocktake'],
            usageMethods: ['检索与发现', '理解与归纳'],
        },
        debug: {
            names: ['systematic-debugging', 'verification-loop', 'security-review'],
            usageMethods: ['验证与审查', '执行与编排'],
        },
        verification: {
            names: ['verification-before-completion', 'verification-loop', 'tdd-workflow'],
            usageMethods: ['验证与审查'],
        },
        planning: {
            names: ['brainstorming', 'writing-plans', 'subagent-driven-development'],
            usageMethods: ['规划与拆解', '执行与编排'],
        },
        governance: {
            names: ['skill-stocktake', 'writing-skills', 'continuous-learning-v2'],
            usageMethods: ['知识治理与持续学习'],
        },
    };

    const preferred = scoringRules[taskType] || { names: [], usageMethods: [] };
    const requestedUsageMethods = usageMethod ? [request.usage_method] : [];
    const allPreferredUsageMethods = [...preferred.usageMethods, ...requestedUsageMethods];

    const ranked = [...skills]
        .filter(skill => skill.enabled && skill.recommendable)
        .sort((a, b) => {
            const aScore = scoreSkill(a, preferred.names, allPreferredUsageMethods);
            const bScore = scoreSkill(b, preferred.names, allPreferredUsageMethods);
            if (aScore !== bScore) return bScore - aScore;
            return a.name.localeCompare(b.name);
        });

    return ranked.slice(0, limit).map(skill => ({
        skill_id: skill.skill_id,
        name: skill.name,
        title: skill.title,
        usage_method: skill.usage_category?.usage_method || '',
        family: skill.usage_category?.family || '',
        priority: skill.effective_priority,
        reason: preferred.names.includes(skill.name)
            ? `技能 ${skill.name} 与任务类型 ${taskType} 高相关，且当前处于可推荐状态`
            : `技能 ${skill.name} 符合启用/推荐条件，属于 ${skill.usage_category?.usage_method || '未分类'} 候选能力`,
    }));
}

function listBridgeableSkills(skills, request) {
    const limit = Math.max(1, parseInt(request.limit, 10) || 50);
    return skills.filter(skill => skill.bridgeable && skill.bridge_enabled && skill.enabled).slice(0, limit);
}

function runSkillStub(skills, request) {
    const skill = getSkillDetail(skills, request);
    if (!skill.enabled) {
        throw new Error(`技能未启用: ${skill.skill_id}`);
    }
    if (!skill.bridge_enabled) {
        throw new Error(`技能未开启桥接: ${skill.skill_id}`);
    }

    return {
        skill_id: skill.skill_id,
        name: skill.name,
        title: skill.title,
        summary: skill.summary,
        category: skill.category,
        usage_category: skill.usage_category,
        bridgeable: skill.bridgeable,
        runtime: skill.runtime,
        message: `当前为桥接模式，占位执行技能 ${skill.name}，返回技能定义与建议动作，不执行深度工作流。`,
        suggested_next_steps: [
            '读取技能定义与适用场景',
            '结合当前任务选择是否进入人工编排或后续工作流引擎',
            '如需深执行，将在后续阶段把该技能内化到 VCP 工作流中',
        ],
    };
}

async function main(request) {
    const { registry, runtimeConfig } = await loadRegistryBundle();
    const skills = hydrateSkills(registry, runtimeConfig);
    const action = String(request.action || '').trim();

    if (!action) {
        throw new Error('缺少必需参数: action');
    }

    switch (action) {
        case 'list_skills':
            return {
                registry_version: registry.version,
                runtime_version: runtimeConfig.version,
                total: skills.length,
                active_total: skills.filter(skill => skill.enabled).length,
                result: listSkills(skills, request),
            };
        case 'get_skill_detail':
            return getSkillDetail(skills, request);
        case 'recommend_skills':
            return {
                task_type: request.task_type || '',
                result: recommendSkills(skills, request),
            };
        case 'list_bridgeable_skills':
            return {
                result: listBridgeableSkills(skills, request),
            };
        case 'run_skill_stub':
            return runSkillStub(skills, request);
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
