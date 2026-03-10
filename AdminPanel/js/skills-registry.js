import { apiFetch, showMessage } from './utils.js';

const API_BASE_URL = '/admin_api';
const PRIORITY_OPTIONS = ['P0', 'P1', 'P2', 'P3'];

let cachedRegistry = null;
let initialized = false;
let isLoading = false;

export async function initializeSkillsRegistry() {
    setupEventListeners();
    await loadRegistry();
}

function setupEventListeners() {
    if (initialized) {
        return;
    }

    const filterIds = [
        'skills-filter-category',
        'skills-filter-capability',
        'skills-filter-priority',
        'skills-filter-keyword'
    ];

    filterIds.forEach(id => {
        const element = document.getElementById(id);
        if (!element || element.dataset.listenerAttached) {
            return;
        }

        const eventName = id === 'skills-filter-keyword' ? 'input' : 'change';
        element.addEventListener(eventName, () => {
            renderRegistry();
        });
        element.dataset.listenerAttached = 'true';
    });

    ensureBulkManagePanel();
    setupBulkControls();

    const listEl = document.getElementById('skills-registry-list');
    if (listEl && !listEl.dataset.listenerAttached) {
        listEl.addEventListener('click', handleRegistryListClick);
        listEl.addEventListener('change', handleRegistryListChange);
        listEl.dataset.listenerAttached = 'true';
    }

    initialized = true;
}

function ensureBulkManagePanel() {
    const summaryEl = document.getElementById('skills-registry-summary');
    if (!summaryEl) {
        return;
    }

    if (document.getElementById('skills-bulk-manage-panel')) {
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'skills-bulk-manage-panel';
    panel.className = 'process-item';
    panel.style.marginTop = '12px';
    panel.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;">
            <div style="min-width:220px;flex:1;">
                <label for="skills-bulk-usage-method"><strong>批量分类：</strong></label>
                <select id="skills-bulk-usage-method" class="form-control" style="width:100%;margin-top:4px;">
                    <option value="">全部使用方法</option>
                </select>
            </div>
            <div style="min-width:160px;">
                <label for="skills-bulk-priority"><strong>批量优先级：</strong></label>
                <select id="skills-bulk-priority" class="form-control" style="width:100%;margin-top:4px;">
                    <option value="">保持不变</option>
                    ${PRIORITY_OPTIONS.map(priority => `<option value="${priority}">${priority}</option>`).join('')}
                </select>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button type="button" id="skills-bulk-enable" class="btn-primary">批量启用</button>
                <button type="button" id="skills-bulk-disable" class="btn-secondary">批量停用</button>
                <button type="button" id="skills-bulk-apply-priority" class="btn-secondary">批量更新优先级</button>
            </div>
        </div>
        <div id="skills-bulk-manage-hint" style="margin-top:10px;opacity:0.76;">按使用方法对当前注册技能做批量启停或优先级调整。</div>
    `;

    summaryEl.insertAdjacentElement('afterend', panel);
}

function setupBulkControls() {
    const controls = [
        ['skills-bulk-enable', () => handleBulkUpdate({ enabled: true })],
        ['skills-bulk-disable', () => handleBulkUpdate({ enabled: false })],
        ['skills-bulk-apply-priority', handleBulkPriorityUpdate]
    ];

    controls.forEach(([id, handler]) => {
        const element = document.getElementById(id);
        if (!element || element.dataset.listenerAttached) {
            return;
        }
        element.addEventListener('click', handler);
        element.dataset.listenerAttached = 'true';
    });
}

async function loadRegistry() {
    const summaryEl = document.getElementById('skills-registry-summary');
    const listEl = document.getElementById('skills-registry-list');

    if (summaryEl) {
        summaryEl.innerHTML = '<p>正在加载技能运行视图概览...</p>';
    }
    if (listEl) {
        listEl.innerHTML = '<p>正在加载技能列表...</p>';
    }

    isLoading = true;
    try {
        const response = await apiFetch(`${API_BASE_URL}/skills/registry/runtime-view`, {}, false);
        cachedRegistry = response.data;
        populateFilters(cachedRegistry?.skills || []);
        renderRegistry();
    } catch (error) {
        if (summaryEl) {
            summaryEl.innerHTML = `<p class="error-message">加载技能运行视图失败: ${error.message}</p>`;
        }
        if (listEl) {
            listEl.innerHTML = `<p class="error-message">加载技能列表失败: ${error.message}</p>`;
        }
    } finally {
        isLoading = false;
    }
}

function populateFilters(skills) {
    populateSelect(
        'skills-filter-category',
        collectUniqueValues(skills, skill => skill?.category?.l1).sort((a, b) => a.localeCompare(b, 'zh-CN')),
        '全部分类'
    );
    populateSelect(
        'skills-filter-capability',
        collectUniqueValues(skills, skill => skill?.capability_type).sort((a, b) => a.localeCompare(b, 'zh-CN')),
        '全部能力'
    );
    populateSelect(
        'skills-filter-priority',
        collectUniqueValues(skills, skill => skill?.effective_priority || skill?.priority).sort((a, b) => a.localeCompare(b, 'zh-CN')),
        '全部优先级'
    );
    populateSelect(
        'skills-bulk-usage-method',
        collectUniqueValues(skills, skill => skill?.usage_category?.usage_method).sort((a, b) => a.localeCompare(b, 'zh-CN')),
        '全部使用方法'
    );
}

function populateSelect(selectId, values, defaultLabel) {
    const select = document.getElementById(selectId);
    if (!select) {
        return;
    }

    const currentValue = select.value;
    select.innerHTML = `<option value="">${defaultLabel}</option>`;
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
    select.value = values.includes(currentValue) ? currentValue : '';
}

function collectUniqueValues(items, getter) {
    const values = new Set();
    items.forEach(item => {
        const value = getter(item);
        if (value) {
            values.add(value);
        }
    });
    return Array.from(values);
}

function renderRegistry() {
    const summaryEl = document.getElementById('skills-registry-summary');
    const listEl = document.getElementById('skills-registry-list');

    if (!summaryEl || !listEl) {
        return;
    }

    if (!cachedRegistry || !Array.isArray(cachedRegistry.skills)) {
        summaryEl.innerHTML = '<p>暂无技能注册表数据。</p>';
        listEl.innerHTML = '<p>暂无技能数据。</p>';
        return;
    }

    const filteredSkills = filterSkills(cachedRegistry.skills);
    summaryEl.innerHTML = buildSummaryMarkup(cachedRegistry, filteredSkills);

    if (filteredSkills.length === 0) {
        listEl.innerHTML = '<p>当前筛选条件下没有匹配的技能。</p>';
        return;
    }

    listEl.innerHTML = filteredSkills.map(skill => createSkillCard(skill)).join('');
}

function filterSkills(skills) {
    const category = document.getElementById('skills-filter-category')?.value || '';
    const capability = document.getElementById('skills-filter-capability')?.value || '';
    const priority = document.getElementById('skills-filter-priority')?.value || '';
    const keyword = (document.getElementById('skills-filter-keyword')?.value || '').trim().toLowerCase();

    return skills.filter(skill => {
        if (category && skill?.category?.l1 !== category) {
            return false;
        }
        if (capability && skill?.capability_type !== capability) {
            return false;
        }
        if (priority && (skill?.effective_priority || skill?.priority) !== priority) {
            return false;
        }
        if (keyword) {
            const searchableText = [
                skill?.skill_id,
                skill?.name,
                skill?.title,
                skill?.summary,
                skill?.source_origin,
                skill?.language_hint,
                skill?.usage_category?.usage_method,
                skill?.usage_category?.family,
                ...(skill?.tags || [])
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchableText.includes(keyword)) {
                return false;
            }
        }
        return true;
    });
}

function buildSummaryMarkup(registry, filteredSkills) {
    const total = registry?.registeredTotal ?? registry?.total ?? registry?.skills?.length ?? 0;
    const filtered = filteredSkills.length;
    const bridgeable = filteredSkills.filter(skill => skill?.bridge_enabled).length;
    const enabled = filteredSkills.filter(skill => skill?.enabled).length;
    const categories = new Set(filteredSkills.map(skill => skill?.usage_category?.usage_method).filter(Boolean)).size;

    return `
        <div class="process-item">
            <strong>注册表版本：</strong> ${escapeHtml(registry?.version || 'unknown')}<br>
            <strong>注册技能总数：</strong> ${total}<br>
            <strong>当前筛选结果：</strong> ${filtered}<br>
            <strong>当前启用技能：</strong> ${enabled}<br>
            <strong>当前可桥接技能：</strong> ${bridgeable}<br>
            <strong>覆盖使用方法分类：</strong> ${categories}
        </div>
    `;
}

function createSkillCard(skill) {
    const title = escapeHtml(skill?.title || skill?.name || skill?.skill_id || '未命名技能');
    const name = escapeHtml(skill?.name || '');
    const summary = escapeHtml(skill?.summary || '暂无摘要');
    const category = [skill?.category?.l1, skill?.category?.l2, skill?.category?.l3].filter(Boolean).map(escapeHtml).join(' / ');
    const usageCategory = [skill?.usage_category?.usage_method, skill?.usage_category?.family, skill?.usage_category?.domain].filter(Boolean).map(escapeHtml).join(' / ');
    const capability = escapeHtml(skill?.capability_type || '未标注');
    const priority = escapeHtml(skill?.effective_priority || skill?.priority || '未标注');
    const languageHint = escapeHtml(skill?.language_hint || 'unknown');
    const sourceOrigin = escapeHtml(skill?.source_origin || 'unknown');
    const sourcePath = escapeHtml(skill?.source_path || '');
    const tags = Array.isArray(skill?.tags) ? skill.tags.slice(0, 8).map(tag => `<span class="status ${skill?.bridge_enabled ? 'online' : 'stopped'}">${escapeHtml(tag)}</span>`).join(' ') : '';
    const bridgeableText = skill?.bridge_enabled ? '桥接已开启' : (skill?.bridgeable ? '可桥接' : '待桥接');
    const detailPayload = encodeURIComponent(JSON.stringify(skill));
    const checked = skill?.enabled ? 'checked' : '';
    const priorityOptions = PRIORITY_OPTIONS.map(option => `<option value="${option}" ${option === (skill?.effective_priority || skill?.priority) ? 'selected' : ''}>${option}</option>`).join('');

    return `
        <div class="dream-log-card" data-skill-id="${escapeHtml(skill?.skill_id || '')}">
            <div style="padding: 16px;">
                <div style="display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; flex-wrap: wrap;">
                    <div>
                        <h3 style="margin: 0 0 8px 0;">${title}</h3>
                        <div style="opacity: 0.78; margin-bottom: 8px;">${name}</div>
                    </div>
                    <div>
                        <span class="status ${skill?.enabled ? 'online' : 'stopped'}">${skill?.enabled ? '已启用' : '已停用'}</span>
                        <span class="status ${skill?.bridge_enabled ? 'online' : 'stopped'}">${bridgeableText}</span>
                    </div>
                </div>
                <p style="margin: 8px 0 12px 0; line-height: 1.6;">${summary}</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; margin-bottom: 12px;">
                    <div><strong>治理分类：</strong>${category || '未标注'}</div>
                    <div><strong>使用分类：</strong>${usageCategory || '未标注'}</div>
                    <div><strong>能力属性：</strong>${capability}</div>
                    <div><strong>优先级：</strong>${priority}</div>
                    <div><strong>语言：</strong>${languageHint}</div>
                    <div><strong>来源：</strong>${sourceOrigin}</div>
                    <div><strong>路径：</strong><code>${sourcePath || '未知'}</code></div>
                </div>
                <div style="margin-bottom: 12px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <label style="display:flex;gap:6px;align-items:center;">
                        <input type="checkbox" data-action="toggle-skill-enabled" data-skill-id="${escapeHtml(skill?.skill_id || '')}" ${checked}>
                        启用
                    </label>
                    <label style="display:flex;gap:6px;align-items:center;">
                        <span>优先级</span>
                        <select data-action="change-skill-priority" data-skill-id="${escapeHtml(skill?.skill_id || '')}">
                            ${priorityOptions}
                        </select>
                    </label>
                </div>
                <div style="margin-bottom: 12px; display: flex; gap: 6px; flex-wrap: wrap;">
                    ${tags || '<span style="opacity: 0.7;">暂无标签</span>'}
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button type="button" class="btn-secondary" data-action="view-skill-detail" data-skill-id="${escapeHtml(skill?.skill_id || '')}" data-skill-payload="${detailPayload}">查看详情</button>
                    <button type="button" class="btn-secondary" data-action="save-skill-runtime" data-skill-id="${escapeHtml(skill?.skill_id || '')}">保存运行态</button>
                </div>
            </div>
        </div>
    `;
}

async function handleRegistryListClick(event) {
    const saveButton = event.target.closest('[data-action="save-skill-runtime"]');
    if (saveButton) {
        await saveSkillRuntime(saveButton.dataset.skillId);
        return;
    }

    const button = event.target.closest('[data-action="view-skill-detail"]');
    if (!button) {
        return;
    }

    const skillId = button.dataset.skillId;
    const payload = button.dataset.skillPayload;

    try {
        const response = await apiFetch(`${API_BASE_URL}/skills/registry/${encodeURIComponent(skillId)}`, {}, false);
        const skill = response.data;
        showSkillDetail(findSkillById(skillId) || skill);
    } catch (error) {
        try {
            if (payload) {
                showSkillDetail(JSON.parse(decodeURIComponent(payload)));
                showMessage(`技能详情接口加载失败，已展示缓存数据：${error.message}`, 'info');
                return;
            }
        } catch (payloadError) {
            console.warn('Failed to parse cached skill payload:', payloadError);
        }
        showMessage(`加载技能详情失败：${error.message}`, 'error');
    }
}

async function handleRegistryListChange(event) {
    const target = event.target;
    if (!target) {
        return;
    }

    if (target.matches('[data-action="toggle-skill-enabled"]')) {
        const skillId = target.dataset.skillId;
        const checked = Boolean(target.checked);
        updateCachedSkillRuntime(skillId, { enabled: checked });
        renderRegistry();
        return;
    }

    if (target.matches('[data-action="change-skill-priority"]')) {
        const skillId = target.dataset.skillId;
        const priority = target.value;
        updateCachedSkillRuntime(skillId, { priority });
        renderRegistry();
    }
}

function findSkillById(skillId) {
    return cachedRegistry?.skills?.find(skill => skill?.skill_id === skillId) || null;
}

function updateCachedSkillRuntime(skillId, patch) {
    if (!cachedRegistry || !Array.isArray(cachedRegistry.skills)) {
        return;
    }

    cachedRegistry.skills = cachedRegistry.skills.map(skill => {
        if (skill?.skill_id !== skillId) {
            return skill;
        }

        const runtime = {
            ...(skill.runtime || {}),
            ...patch
        };

        return {
            ...skill,
            runtime,
            enabled: runtime.enabled ?? skill.enabled,
            effective_priority: runtime.priority || skill.effective_priority || skill.priority,
            priority: skill.priority,
            recommendable: runtime.recommendable ?? skill.recommendable,
            bridge_enabled: runtime.bridge_enabled ?? skill.bridge_enabled,
            deep_execute_enabled: runtime.deep_execute_enabled ?? skill.deep_execute_enabled,
        };
    });
}

async function saveSkillRuntime(skillId) {
    const skill = findSkillById(skillId);
    if (!skill) {
        showMessage('未找到要保存的技能。', 'error');
        return;
    }

    const patch = {
        enabled: Boolean(skill.runtime?.enabled ?? skill.enabled),
        priority: skill.runtime?.priority || skill.effective_priority || skill.priority,
    };

    try {
        await apiFetch(`${API_BASE_URL}/skills/runtime-config/${encodeURIComponent(skillId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        }, false);
        showMessage(`已保存技能运行态：${skill.title || skill.name || skill.skill_id}`, 'success');
        await loadRegistry();
    } catch (error) {
        showMessage(`保存技能运行态失败：${error.message}`, 'error');
    }
}

async function handleBulkUpdate(changes) {
    const usageMethod = document.getElementById('skills-bulk-usage-method')?.value || '';
    if (!usageMethod) {
        showMessage('请先选择要批量处理的使用方法分类。', 'warning');
        return;
    }

    try {
        await apiFetch(`${API_BASE_URL}/skills/runtime-config/batch`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filter: { usage_method: usageMethod },
                changes,
            }),
        }, false);
        showMessage(`已批量更新分类：${usageMethod}`, 'success');
        await loadRegistry();
    } catch (error) {
        showMessage(`批量更新失败：${error.message}`, 'error');
    }
}

async function handleBulkPriorityUpdate() {
    const usageMethod = document.getElementById('skills-bulk-usage-method')?.value || '';
    const priority = document.getElementById('skills-bulk-priority')?.value || '';

    if (!usageMethod) {
        showMessage('请先选择要批量处理的使用方法分类。', 'warning');
        return;
    }
    if (!priority) {
        showMessage('请先选择批量优先级。', 'warning');
        return;
    }

    await handleBulkUpdate({ priority });
}

function showSkillDetail(skill) {
    const runtime = skill?.runtime || {};
    const detailLines = [
        `技能ID：${skill?.skill_id || '未知'}`,
        `名称：${skill?.title || skill?.name || '未知'}`,
        `能力属性：${skill?.capability_type || '未标注'}`,
        `优先级：${skill?.effective_priority || skill?.priority || '未标注'}`,
        `启用状态：${skill?.enabled ? '已启用' : '已停用'}`,
        `桥接状态：${skill?.bridge_enabled ? '桥接已开启' : (skill?.bridgeable ? '可桥接但未启用' : '待桥接')}`,
        `治理分类：${[skill?.category?.l1, skill?.category?.l2, skill?.category?.l3].filter(Boolean).join(' / ') || '未标注'}`,
        `使用分类：${[skill?.usage_category?.usage_method, skill?.usage_category?.family, skill?.usage_category?.domain].filter(Boolean).join(' / ') || '未标注'}`,
        `来源仓库：${skill?.source_origin || '未知'}`,
        `来源路径：${skill?.source_path || '未知'}`,
        `语言提示：${skill?.language_hint || '未知'}`,
        `摘要：${skill?.summary || '暂无摘要'}`,
        `标签：${Array.isArray(skill?.tags) && skill.tags.length > 0 ? skill.tags.join(', ') : '暂无标签'}`,
        `VCP映射：${Array.isArray(skill?.vcp_mapping) && skill.vcp_mapping.length > 0 ? skill.vcp_mapping.join(', ') : '待补充'}`,
        `运行态备注：${runtime.notes || '无'}`,
        `运行态：enabled=${runtime.enabled === undefined ? '未覆盖' : String(runtime.enabled)}, recommendable=${runtime.recommendable === undefined ? '未覆盖' : String(runtime.recommendable)}, bridge_enabled=${runtime.bridge_enabled === undefined ? '未覆盖' : String(runtime.bridge_enabled)}`,
        `版本：${skill?.version || '未知'}`
    ];

    alert(detailLines.join('\n\n'));
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
