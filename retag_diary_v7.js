#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  VCP TagMemo V7 全库打标器 — retag_diary_v7.js                  ║
 * ║                                                                  ║
 * ║  基于 KBM 真实数学引擎的全库重打标脚本。                           ║
 * ║  直接 require KBM 单例，消费其共现矩阵、tagIndex、               ║
 * ║  内生残差等完整数学拓扑，不再手写 SQL 近似。                       ║
 * ║                                                                  ║
 * ║  作者: Nova  for 水云                                    ║
 * ║  版本: 7 — Topological Coverage + Polysemy Blow-up      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const { getEmbeddingsBatch } = require('./EmbeddingUtils');

// ============================================================
// §0  配置加载
// ============================================================

/** 零依赖命令行参数解析器 */
function parseArgs(argv) {
    const args = argv.slice(2);
    const result = { dir: 'dailynote', exclude: '', dryRun: false, limit: '', reset: false, config: '', noTopo: false, force: false, help: false };
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--help' || a === '-h') { result.help = true; }
        else if (a === '--dry-run') { result.dryRun = true; }
        else if (a === '--reset') { result.reset = true; }
        else if (a === '--no-topo') { result.noTopo = true; }
        else if (a === '--force') { result.force = true; }
        else if ((a === '-d' || a === '--dir') && args[i + 1]) { result.dir = args[++i]; }
        else if ((a === '-e' || a === '--exclude') && args[i + 1]) { result.exclude = args[++i]; }
        else if ((a === '-l' || a === '--limit') && args[i + 1]) { result.limit = args[++i]; }
        else if (a === '--config' && args[i + 1]) { result.config = args[++i]; }
        else if (a.startsWith('--dir=')) { result.dir = a.split('=')[1]; }
        else if (a.startsWith('--exclude=')) { result.exclude = a.split('=')[1]; }
        else if (a.startsWith('--limit=')) { result.limit = a.split('=')[1]; }
        else if (a.startsWith('--config=')) { result.config = a.split('=')[1]; }
    }
    return result;
}

const opts = parseArgs(process.argv);

if (opts.help) {
    console.log(`
VCP TagMemo V7 全库打标器 — KBM 真实数学引擎 + 拓扑覆盖 + 多义词检测

用法:
  node retag_diary_v7.js [选项]

选项:
  -d, --dir <path>       扫描目录（相对于项目根目录，默认 dailynote）
  -e, --exclude <dirs>   排除目录（逗号分隔）
  --dry-run              试运行：不写回文件，只打印
  -l, --limit <n>        限制处理数量
  --reset                清除断点，重新开始
  --config <file>        指定配置文件路径
  --no-topo              跳过拓扑地图生成
  --force                强制写回，忽略 Jaccard 门控
  -h, --help             显示帮助信息

示例:
  node retag_diary_v7.js --dry-run --limit 5
  node retag_diary_v7.js --dir dailynote/Nova --exclude VCP百科全书
  node retag_diary_v7.js --reset
`);
    process.exit(0);
}

// 支持 --config 参数指定配置文件
const configFile = opts.config || null;

const dotenv = require('dotenv');
// 优先加载专用配置，再加载通用 config.env 补全
if (configFile && fs.existsSync(configFile)) {
    dotenv.config({ path: path.resolve(configFile) });
    console.log(`[Config] 加载配置: ${configFile}`);
} else if (fs.existsSync(path.join(__dirname, 'tag-processor-config.env'))) {
    dotenv.config({ path: path.join(__dirname, 'tag-processor-config.env') });
    console.log('[Config] 加载配置: tag-processor-config.env');
}
// 通用 config.env 作为 fallback（不覆盖已有值）
dotenv.config({ path: path.join(__dirname, 'config.env') });

// ============================================================
// §2  配置常量
// ============================================================

const CONFIG = {
    // LLM API
    TAG_API_KEY: process.env.TAG_API_KEY || process.env.API_Key,
    TAG_API_URL: process.env.TAG_API_URL || process.env.API_URL,
    TAG_MODEL: process.env.TAG_MODEL || process.env.TagModel || 'gpt-4o-mini',
    TAG_MAX_TOKENS: parseInt(process.env.TAG_MAX_TOKENS || process.env.TagModelMaxTokens || '30000', 10),
    TAG_MAX_OUTPUT_TOKENS: parseInt(
        process.env.TAG_MAX_OUTPUT_TOKENS
        || process.env.TagModelMaxOutPutTokens
        || process.env.TagModelMaxOutputTokens
        || process.env.TAG_MAX_TOKENS
        || process.env.TagModelMaxTokens
        || '30000',
        10
    ),

    // LLM 可选参数（不设置则不发送，由 API 侧使用默认值）
    TAG_TEMPERATURE: process.env.TAG_TEMPERATURE ? parseFloat(process.env.TAG_TEMPERATURE) : undefined,
    TAG_TOP_P: process.env.TAG_TOP_P ? parseFloat(process.env.TAG_TOP_P) : undefined,
    TAG_TIMEOUT_MS: parseInt(process.env.TAG_TIMEOUT_MS || '120000', 10),

    // 并发与重试
    TAG_CONCURRENCY: parseInt(process.env.TAG_CONCURRENCY || '1', 10),
    CONTENT_RETRY_MAX: parseInt(process.env.CONTENT_RETRY_MAX || '1', 10),
    CONTENT_RETRY_DELAY_MS: parseInt(process.env.CONTENT_RETRY_DELAY_MS || '3000', 10),

    // 打标参数
    COLLISION_THRESHOLD: parseFloat(process.env.TAG_COLLISION_THRESHOLD || '0.85'),
    KNN_K: parseInt(process.env.TAG_KNN_K || '10', 10),
    COOCCURRENCE_TOP_K: parseInt(process.env.TAG_COOCCURRENCE_TOP_K || '5', 10),
    MAX_RETRIES: parseInt(process.env.TAG_MAX_RETRIES || '3', 10),
    RETRY_DELAY_MS: parseInt(process.env.TAG_RETRY_DELAY_MS || '5000', 10),

    // 扫描配置
    DAILYNOTE_DIR: path.join(__dirname, opts.dir || process.env.DAILYNOTE_DIR || 'dailynote'),
    EXCLUDE_DIRS: (opts.exclude || process.env.EXCLUDE_DIRS || 'VCP百科全书,前思维簇,反思簇,逻辑推理簇,结果辩证簇,陈词总结梳理簇,测试思维簇')
        .split(',').map(s => s.trim()).filter(Boolean),

    // Jaccard 门控
    JACCARD_FLOOR: parseFloat(process.env.TAG_JACCARD_FLOOR || '0.3'),
    FORCE_WRITE: opts.force || false,

    // 拓扑覆盖率（v7）
    TOPO_EPSILON: parseFloat(process.env.TOPO_EPSILON || '0.25'),
    POLYSEMY_CLUSTER_THRESHOLD: parseFloat(process.env.POLYSEMY_CLUSTER_THRESHOLD || '0.30'),
    POLYSEMY_NEIGHBOR_K: parseInt(process.env.POLYSEMY_NEIGHBOR_K || '10', 10),

    // 断点文件
    CHECKPOINT_FILE: path.join(__dirname, 'retag_checkpoint.json'),

    // ── 时间壳层（提示层半衰期采样 — 替代固定 3×3）──
    // 注意：这是提示层外层采样器，不是 KBM 数学本体
    TEMPORAL_SHELL_HALF_LIFE: parseFloat(process.env.TEMPORAL_SHELL_HALF_LIFE || '3'),      // 半衰期天数（优先用真实日期差，回退到序距）
    TEMPORAL_SHELL_MAX_NEIGHBORS: parseInt(process.env.TEMPORAL_SHELL_MAX_NEIGHBORS || '8', 10), // 单方向最大邻居数
    TEMPORAL_SHELL_STABILITY_THRESHOLD: parseInt(process.env.TEMPORAL_SHELL_STABILITY_THRESHOLD || '1', 10), // 新增唯一标签 ≤ 此值视为稳定

    // ── 动态 Token / 字节预算器 ──
    BUDGET_SOFT_TOKEN: parseInt(process.env.BUDGET_SOFT_TOKEN || '22000', 10),
    BUDGET_HARD_TOKEN: parseInt(process.env.BUDGET_HARD_TOKEN || '28000', 10),
    BUDGET_SOFT_BYTES: parseInt(process.env.BUDGET_SOFT_BYTES || '71680', 10),  // 70KB
    BUDGET_HARD_BYTES: parseInt(process.env.BUDGET_HARD_BYTES || '97280', 10),  // 95KB
};

// ============================================================
// §3  KBM 加载（核心变更：使用真实数学引擎）
// ============================================================

/**
 * KBM 单例引用。require 时构造函数执行（读取 process.env），
 * 但 initialize() 需要显式调用才会构建数学结构。
 */
let kbm = null;

// ── 全局 Tag 分布指标缓存（KBM 初始化后计算一次）──
// 灵感来源：博弈论 市场集中度（Gini/HHI）+ 生态学 群落多样性
let globalTagMetrics = null;

async function waitForKBMTagIndexReady(timeoutMs = 15000) {
    if (!kbm || !kbm.db || !kbm.tagIndex) return false;

    let tagCount = 0;
    try {
        tagCount = kbm.db.prepare('SELECT COUNT(*) as cnt FROM tags').get()?.cnt || 0;
    } catch (e) {
        warn(`读取 tags 总数失败，跳过 tagIndex 等待: ${e.message}`);
        return false;
    }

    if (tagCount === 0) return true;

    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        try {
            if (typeof kbm.tagIndex.stats === 'function') {
                const stats = kbm.tagIndex.stats();
                if ((stats?.totalVectors || 0) > 0) {
                    return true;
                }
            } else {
                // 无 stats 接口时无法可靠判定“是否已恢复完成”，避免误判为死等
                return true;
            }
        } catch (e) {
            warn(`tagIndex 状态探测失败，停止等待: ${e.message}`);
            return false;
        }
        await delay(250);
    }

    return false;
}

async function initializeKBM() {
    log('🧠 正在加载 KnowledgeBaseManager 真实数学引擎...');

    try {
        kbm = require('./KnowledgeBaseManager');
    } catch (e) {
        warn(`KBM 加载失败: ${e.message}`);
        warn('拓扑地图功能将被禁用（回退到无拓扑模式）');
        kbm = null;
        return;
    }

    try {
        // 调用 KBM 的完整初始化流程：
        // - 打开 SQLite（VectorStore/knowledge_base.sqlite）
        // - 加载/恢复 Vexus tag 索引
        // - 构建有向共现矩阵（tagCooccurrenceMatrix）
        // - 初始化 EPA 语义罗盘 + 残差金字塔
        // - 加载内生残差（tagIntrinsicResiduals）
        await kbm.initialize();

        // ── 批量模式：关闭不需要的后台服务 ──
        // chokidar 文件监听（否则写回 Tag 时会触发 KBM 的 _flushBatch）
        if (kbm.watcher) {
            await kbm.watcher.close();
            kbm.watcher = null;
            log('  ↳ chokidar 文件监听已关闭');
        }
        // 清掉 watcher 启动期间可能遗留的批处理状态，避免脚本运行中误触发 _flushBatch
        if (kbm.batchTimer) {
            clearTimeout(kbm.batchTimer);
            kbm.batchTimer = null;
        }
        if (kbm.pendingFiles?.clear) kbm.pendingFiles.clear();
        if (kbm.fileRetryCount?.clear) kbm.fileRetryCount.clear();

        // rag_params.json 监听
        if (kbm.ragParamsWatcher) {
            kbm.ragParamsWatcher.close();
            kbm.ragParamsWatcher = null;
        }
        // 空闲索引扫描定时器
        if (kbm.idleSweepTimer) {
            clearInterval(kbm.idleSweepTimer);
            kbm.idleSweepTimer = null;
        }
        // 矩阵重建定时器
        if (kbm._matrixRebuildTimer) {
            clearTimeout(kbm._matrixRebuildTimer);
            kbm._matrixRebuildTimer = null;
        }

        const tagIndexReady = await waitForKBMTagIndexReady();
        if (!tagIndexReady && kbm.tagIndex) {
            warn('tagIndex 在等待窗口内未确认就绪；后续拓扑分析将按可用性优雅降级');
        }

        // ── 打印数学引擎状态 ──
        const matrixSize = kbm.tagCooccurrenceMatrix ? kbm.tagCooccurrenceMatrix.size : 0;
        const residualSize = kbm.tagIntrinsicResiduals ? kbm.tagIntrinsicResiduals.size : 0;
        const tagCount = kbm.db ? (kbm.db.prepare('SELECT COUNT(*) as cnt FROM tags').get()?.cnt || 0) : 0;

        log(`✅ KBM 数学引擎就绪:`);
        log(`  ↳ 全局标签数:     ${tagCount}`);
        log(`  ↳ 共现矩阵节点:   ${matrixSize}`);
        log(`  ↳ 内生残差:       ${residualSize}`);
        log(`  ↳ tagIndex:       ${kbm.tagIndex ? `✅ Vexus Rust${tagIndexReady ? '' : '（未确认预热完成）'}` : '❌ 不可用'}`);
        log(`  ↳ EPA:            ${kbm.epa ? '✅' : '❌'}`);

        // ── 计算全局 Tag 分布指标（一次性，用于所有日记的拓扑报告）──
        globalTagMetrics = computeGlobalTagMetrics();
        if (globalTagMetrics) {
            log(`  ↳ Tag Gini:       ${globalTagMetrics.gini.toFixed(3)} | HHI: ${globalTagMetrics.hhi.toFixed(4)} | 活跃Tag: ${globalTagMetrics.activeCount}`);
        }

    } catch (e) {
        warn(`KBM 初始化失败: ${e.message}`);
        if (e.stack) warn(e.stack);
        warn('拓扑地图功能将被禁用');
        kbm = null;
    }
}

// ============================================================
// §3.5  全局 Tag 分布指标（博弈论#9 Gini/HHI + 生态学#6 多样性）
// ============================================================

/**
 * 计算全局 tag 使用频率的 Gini 系数和 HHI（赫芬达尔指数）。
 *
 * - Gini: 衡量 tag 使用频率的不均匀度。G→0 均匀，G→1 极度集中。
 *   灵感：博弈论#9 收入不平等 → tag 注意力不平等
 * - HHI: 市场集中度指标。HHI < 0.15 竞争性，> 0.25 高度集中。
 *   灵感：博弈论#9 市场垄断度 → 主干 tag 是否垄断检索
 * - Shannon H: 生态多样性。值越高 tag 分布越均匀。
 *   灵感：生态学#6 群落多样性
 *
 * 仅在 KBM 初始化后调用一次，结果缓存到 globalTagMetrics。
 * 零额外 IO（纯 SQLite 聚合查询）。
 */
function computeGlobalTagMetrics() {
    if (!kbm || !kbm.db) return null;

    try {
        // 每个 tag 出现在多少个文件中（= 使用频率）
        const rows = kbm.db.prepare(
            'SELECT tag_id, COUNT(DISTINCT file_id) as freq FROM file_tags GROUP BY tag_id HAVING freq > 0'
        ).all();

        if (!rows || rows.length < 2) return null;

        const n = rows.length;
        const freqs = rows.map(r => r.freq);
        const totalFreq = freqs.reduce((s, f) => s + f, 0);

        // ── Gini 系数 ──
        // G = (2 * Σ(i * x_i_sorted)) / (n * Σx_i) - (n+1)/n
        const sorted = [...freqs].sort((a, b) => a - b);
        let giniNumer = 0;
        for (let i = 0; i < n; i++) {
            giniNumer += (i + 1) * sorted[i];
        }
        const gini = (2 * giniNumer) / (n * totalFreq) - (n + 1) / n;

        // ── HHI (Herfindahl-Hirschman Index) ──
        // HHI = Σ(s_i²)，s_i = freq_i / totalFreq
        let hhi = 0;
        for (const f of freqs) {
            const share = f / totalFreq;
            hhi += share * share;
        }

        // ── Shannon 多样性 H ──
        let shannonH = 0;
        for (const f of freqs) {
            const p = f / totalFreq;
            if (p > 0) shannonH -= p * Math.log2(p);
        }

        // ── Top-5 高频 tag（主干垄断候选）──
        const topRows = kbm.db.prepare(
            `SELECT t.name, COUNT(DISTINCT ft.file_id) as freq
             FROM file_tags ft JOIN tags t ON ft.tag_id = t.id
             GROUP BY ft.tag_id ORDER BY freq DESC LIMIT 5`
        ).all();
        const top5 = topRows.map(r => ({ name: r.name, freq: r.freq, share: (r.freq / totalFreq * 100).toFixed(1) }));

        return { gini, hhi, shannonH, activeCount: n, totalFreq, top5 };

    } catch (e) {
        warn(`全局 Tag 分布指标计算失败: ${e.message}`);
        return null;
    }
}

// ============================================================
// §4  日志与工具函数
// ============================================================

function log(msg, ...args) { console.log(`[V7] ${msg}`, ...args); }
function warn(msg, ...args) { console.warn(`[V7][WARN] ${msg}`, ...args); }
function fatal(msg) { console.error(`[V7][FATAL] ${msg}`); process.exit(1); }
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// §4.1  预算层辅助函数（提示层 admission controller，不是数学本体）
// ============================================================

/**
 * 中英文混合 Token 估算器。
 * 借鉴 RAGDiaryPlugin._estimateTokens 的启发式公式，
 * 不追求精确 tokenizer，但提供可靠的保守上界。
 */
function estimateTokens(text) {
    if (!text) return 0;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = text.length - chineseChars;
    return Math.ceil(chineseChars * 1.5 + otherChars * 0.25);
}

/** UTF-8 字节长度估算 */
function estimateBytes(text) {
    if (!text) return 0;
    return Buffer.byteLength(text, 'utf-8');
}

/**
 * 动态预算控制器 — 在 callLLMForTags() 发送前对输入做分层裁剪。
 *
 * 裁剪优先级（按设计文档 §7.3）：
 *   1. 压缩时间壳层细节
 *   2. 压缩拓扑叙述性文字
 *   3. 缩短正文截断长度
 *   4. 极端情况移除拓扑
 *   5. 绝对硬限截断
 *
 * 始终保留：当前正文核心、当前标签、关键拓扑摘要。
 * 返回 { userPrompt, actions: string[] }
 */
function applyBudgetControl(systemPrompt, userPrompt) {
    const actions = [];

    const totalEstTokens = () => estimateTokens(systemPrompt + userPrompt);
    const totalEstBytes = () => {
        const reqObj = {
            model: CONFIG.TAG_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: CONFIG.TAG_MAX_OUTPUT_TOKENS
        };
        return estimateBytes(JSON.stringify(reqObj));
    };

    let tokens = totalEstTokens();
    let bytes = totalEstBytes();

    // ── 绿色区：预算充裕，直接放行 ──
    if (tokens <= CONFIG.BUDGET_SOFT_TOKEN && bytes <= CONFIG.BUDGET_SOFT_BYTES) {
        return { userPrompt, actions };
    }

    // ── 黄色区：轻裁剪 — 压缩拓扑分析段落 ──
    const topoIdx = userPrompt.indexOf('\n## 拓扑分析\n');
    if (topoIdx >= 0) {
        const topoContent = userPrompt.substring(topoIdx);
        if (topoContent.length > 2000) {
            const trimmedTopo = topoContent.substring(0, 2000) + '\n...(拓扑分析已压缩)\n';
            userPrompt = userPrompt.substring(0, topoIdx) + trimmedTopo;
            actions.push(`拓扑压缩 ${topoContent.length}→${trimmedTopo.length}`);
            tokens = totalEstTokens();
            bytes = totalEstBytes();
        }
    }

    if (tokens <= CONFIG.BUDGET_HARD_TOKEN && bytes <= CONFIG.BUDGET_HARD_BYTES) {
        return { userPrompt, actions };
    }

    // ── 橙色区：深度截断正文 ──
    const bodyHeader = '## 日记正文\n\n';
    const bodyStart = userPrompt.indexOf(bodyHeader);
    if (bodyStart >= 0) {
        const contentStart = bodyStart + bodyHeader.length;
        const nextSection = userPrompt.indexOf('\n## ', contentStart);
        if (nextSection > contentStart) {
            const currentBody = userPrompt.substring(contentStart, nextSection);
            if (currentBody.length > 3000) {
                const trimmed = currentBody.substring(0, 3000) + '\n...(正文已深度截断)\n';
                userPrompt = userPrompt.substring(0, contentStart) + trimmed + userPrompt.substring(nextSection);
                actions.push(`正文深度截断 ${currentBody.length}→3000`);
                tokens = totalEstTokens();
                bytes = totalEstBytes();
            }
        }
    }

    if (tokens <= CONFIG.BUDGET_HARD_TOKEN && bytes <= CONFIG.BUDGET_HARD_BYTES) {
        return { userPrompt, actions };
    }

    // ── 红色区：完全移除拓扑 ──
    const topoIdx2 = userPrompt.indexOf('\n## 拓扑分析\n');
    if (topoIdx2 >= 0) {
        userPrompt = userPrompt.substring(0, topoIdx2);
        actions.push('拓扑完全移除（硬预算）');
        tokens = totalEstTokens();
        bytes = totalEstBytes();
    }

    // ── 爆线保护：绝对限制 ──
    if (tokens > 30000 || bytes > 102400) {
        const maxChars = Math.floor(30000 / 0.8);
        if (userPrompt.length > maxChars) {
            userPrompt = userPrompt.substring(0, maxChars) + '\n...(绝对预算截断)\n';
            actions.push(`绝对预算截断 → ${maxChars}字`);
        }
    }

    return { userPrompt, actions };
}

/** 格式化剩余时间 */
function formatETA(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '计算中...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h${m}m${s}s`;
    if (m > 0) return `${m}m${s}s`;
    return `${s}s`;
}

/** 余弦相似度 */
function cosineSimilarity(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom > 1e-9 ? dot / denom : 0;
}

function toNormalizedTagKey(tag) {
    return String(tag || '').trim().toLowerCase();
}

function uniqueTagsCaseInsensitive(tags) {
    const unique = [];
    const seen = new Set();

    for (const tag of tags || []) {
        const cleaned = String(tag || '').trim();
        if (!cleaned) continue;

        const key = cleaned.toLowerCase();
        if (seen.has(key)) continue;

        seen.add(key);
        unique.push(cleaned);
    }

    return unique;
}

function decodeVectorBlob(blob, expectedDim = null) {
    if (!blob) return null;

    try {
        if (blob instanceof Float32Array) {
            if (expectedDim !== null && blob.length !== expectedDim) return null;
            return blob;
        }

        const byteLength = blob.byteLength ?? blob.length ?? 0;
        if (!byteLength || byteLength % 4 !== 0) return null;

        const vec = new Float32Array(byteLength / 4);
        new Uint8Array(vec.buffer).set(blob);

        if (expectedDim !== null && vec.length !== expectedDim) return null;
        return vec;
    } catch (e) {
        return null;
    }
}

function getTimelineGroupKey(filePath) {
    const relPath = path.relative(CONFIG.DAILYNOTE_DIR, filePath);
    const parts = relPath.split(path.sep).filter(Boolean);
    return parts.length > 1 ? parts[0] : '__ROOT__';
}

/**
 * 从文件路径/文件名中尝试提取日期（YYYY-MM-DD 或 YYYY.MM.DD 格式）。
 * 用于时间壳层的真实天数差计算。
 * 返回 Date 对象或 null。
 */
function extractDateFromPath(filePath) {
    const basename = path.basename(filePath);
    const match = basename.match(/(\d{4})[-._ ]?(\d{2})[-._ ]?(\d{2})/);
    if (!match) return null;
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    return isNaN(d.getTime()) ? null : d;
}

// ============================================================
// §5  断点续传
// ============================================================

function loadCheckpoint() {
    if (opts.reset) {
        if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
            fs.unlinkSync(CONFIG.CHECKPOINT_FILE);
            log('🗑️  已清除断点文件');
        }
        return new Set();
    }
    try {
        if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
            const data = JSON.parse(fs.readFileSync(CONFIG.CHECKPOINT_FILE, 'utf-8'));
            log(`📌 恢复断点: 已处理 ${data.processed.length} 篇`);
            return new Set(data.processed);
        }
    } catch (e) {
        warn(`断点文件损坏，从头开始: ${e.message}`);
    }
    return new Set();
}

function saveCheckpoint(processedSet) {
    const data = {
        updated: new Date().toISOString(),
        count: processedSet.size,
        processed: [...processedSet]
    };
    fs.writeFileSync(CONFIG.CHECKPOINT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ============================================================
// §6  文件扫描器
// ============================================================

async function scanDiaryFiles(rootDir, excludeDirs) {
    const files = [];

    async function walk(dir) {
        let entries;
        try {
            entries = await fsPromises.readdir(dir, { withFileTypes: true });
        } catch (e) {
            warn(`无法读取目录 ${dir}: ${e.message}`);
            return;
        }

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name.startsWith('.')) continue;
                if (excludeDirs.includes(entry.name)) continue;
                await walk(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === '.txt' || ext === '.md') {
                    files.push(fullPath);
                }
            }
        }
    }

    await walk(rootDir);

    // 按文件名排序（保证时间顺序，用于时间壳层 / 半衰期邻域采样）
    files.sort((a, b) => {
        const nameA = path.basename(a).toLowerCase();
        const nameB = path.basename(b).toLowerCase();
        return nameA.localeCompare(nameB);
    });

    return files;
}

// ============================================================
// §7  日记解析器
// ============================================================

/**
 * 从日记内容中提取正文和 Tag 行
 * 从末尾向前搜索，兼容 `Tag: xxx` / `Tag：xxx` / `[[Tag: xxx]]`
 */
function parseDiary(content) {
    const lines = content.split('\n');

    let tagLineIndex = -1;
    let tagLineText = '';
    const searchLimit = Math.max(0, lines.length - 5);

    for (let i = lines.length - 1; i >= searchLimit; i--) {
        const trimmed = lines[i].trim();
        if (!trimmed) continue;

        if (/^Tag[：:]\s*.+/i.test(trimmed)) {
            tagLineIndex = i;
            tagLineText = trimmed;
            break;
        }
        const bracketMatch = trimmed.match(/^\[\[Tag[：:]\s*(.+?)\]\]$/i);
        if (bracketMatch) {
            tagLineIndex = i;
            tagLineText = `Tag: ${bracketMatch[1]}`;
            break;
        }
    }

    if (tagLineIndex >= 0) {
        const body = lines.slice(0, tagLineIndex).join('\n').trimEnd();
        const oldTags = extractTagNames(tagLineText);
        return { body, tagLine: tagLineText, tagLineIndex, oldTags, hasTag: true };
    }

    return { body: content.trimEnd(), tagLine: '', tagLineIndex: -1, oldTags: [], hasTag: false };
}

/**
 * 从 Tag 行文本提取标签名数组
 */
function extractTagNames(tagLine) {
    const content = tagLine.replace(/^(?:\[\[)?Tag[：:]\s*/i, '').replace(/\]\]$/, '');
    const decorativeEmojis = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    return content
        .split(/[,，、;|｜]/)
        .map(t => t.replace(/[。.]+$/g, '').replace(decorativeEmojis, ' ').replace(/\s+/g, ' ').trim())
        .filter(t => t.length > 0);
}

// ============================================================
// §8  Tag 格式修复
// ============================================================

function fixTagFormat(tagLine) {
    let fixed = tagLine.trim();
    fixed = fixed.replace(/^(?:\[\[)?tag[：:]\s*/i, '');
    fixed = fixed.replace(/\]\]$/, '');

    let normalized = fixed
        .replace(/[\uff1a]/g, '')
        .replace(/[\uff0c]/g, ', ')
        .replace(/[\u3001]/g, ', ');

    normalized = normalized
        .replace(/,\s*/g, ', ')
        .replace(/\s+,/g, ',')
        .replace(/\s{2,}/g, ' ')
        .trim();

    return 'Tag: ' + normalized;
}

// ============================================================
// §9  拓扑地图生成器（KBM 真实数学引擎版）
// ============================================================

/**
 * 生成自然语言拓扑地图，注入 LLM 上下文。
 * 所有数学计算均来自 KBM 的真实数据结构，而非手写 SQL 近似。
 */
async function generateTopoMap(body, oldTags, neighborTags, options = {}) {
    if (!kbm || opts.noTopo) return '';

    const sections = [];

    try {
        // ── 9.1  向量邻域（KBM tagIndex.search — Rust Vexus KNN）──
        const knnSection = getVectorNeighborhood(oldTags);
        if (knnSection) sections.push(knnSection);

        // ── 9.2  旧标签拓扑（KBM tagCooccurrenceMatrix — V7 有向势能矩阵）──
        const topoSection = getTagTopology(oldTags);
        if (topoSection) sections.push(topoSection);

        // ── 9.3  向量碰撞检测（KBM db.vector 列 + 余弦相似度）──
        const collisionSection = detectTagCollisions(oldTags);
        if (collisionSection) sections.push(collisionSection);

        // ── 9.4  时间壳层（提示层半衰期采样 — 替代固定 3×3）──
        // 这是提示层外层采样器，不是数学本体。
        // 旧 3×3 等权邻域已被更一般的半衰期时间壳层策略替代。
        if (neighborTags && neighborTags.shells && neighborTags.shells.length > 0) {
            let timeSection = `[时间壳层]（半衰期邻域，${neighborTags.shellCount}层 / ${neighborTags.totalTags.length}标签）\n`;
            for (const shell of neighborTags.shells) {
                const weightPct = (shell.weight * 100).toFixed(0);
                const tagPreview = shell.tags.slice(0, 8).join(', ');
                const overflow = shell.tags.length > 8 ? ` (+${shell.tags.length - 8})` : '';
                timeSection += `- 壳${shell.distance}(w=${weightPct}%,+${shell.newUnique}新): ${tagPreview}${overflow}\n`;
            }
            sections.push(timeSection);
        } else if (neighborTags && (neighborTags.prev?.length > 0 || neighborTags.next?.length > 0)) {
            // Legacy 3×3 回退路径（保留向后兼容）
            let timeSection = '[时间邻域]（3×3 窗口内的标签）\n';
            if (neighborTags.prev.length > 0) timeSection += `前3篇标签: ${neighborTags.prev.join(', ')}\n`;
            if (neighborTags.next.length > 0) timeSection += `后3篇标签: ${neighborTags.next.join(', ')}\n`;
            sections.push(timeSection);
        }

        // ── 9.5  内生残差（KBM tagIntrinsicResiduals — Rust 预计算）──
        const residualSection = getIntrinsicResiduals(oldTags);
        if (residualSection) sections.push(residualSection);

        // ── 9.6  语义密度雷达（v7 — 球面几何局部密度）──
        const densitySection = getSemanticDensityRadar(oldTags);
        if (densitySection) sections.push(densitySection);

        // ── 9.7  拓扑覆盖率（v7 — 神经复形 + 语义体积）──
        const topoCoverageSection = getTopologicalCoverage(oldTags);
        if (topoCoverageSection) sections.push(topoCoverageSection);

        // ── 9.8  多义词分析（v7— 共现聚类奇点检测）──
        const polysemySection = getPolysemyAnalysis(oldTags, kbm);
        if (polysemySection) sections.push(polysemySection);

        // ── 9.9  全局标签生态概况（自然语言，供 LLM 理解全局上下文）──
        if (globalTagMetrics) {
            const m = globalTagMetrics;
            let ecoSection = '[全局标签生态]\n';
            // 主干集中度：用自然语言让 LLM 知道该保守还是激进
            if (m.gini > 0.7) {
                ecoSection += `- ⚠️ 标签分布高度不均：少数高频标签主导了检索，请优先用精确子标签替代泛化词\n`;
            } else if (m.gini > 0.5) {
                ecoSection += `- 标签分布中等不均：存在一定主干集中，打标时注意平衡通用词与专精词\n`;
            } else {
                ecoSection += `- ✅ 标签分布较均匀，可按正常策略打标\n`;
            }
            // Top-5 主干占比提示
            if (m.top5 && m.top5.length > 0) {
                const top5Share = m.top5.reduce((s, t) => s + parseFloat(t.share), 0);
                if (top5Share > 30) {
                    ecoSection += `- 当前最高频的5个标签（${m.top5.map(t => t.name).join('、')}）合计占比${top5Share.toFixed(0)}%，如果旧标签中包含这些词，请考虑是否有更精确的替代\n`;
                }
            }
            sections.push(ecoSection);
        }

    } catch (e) {
        warn(`拓扑地图生成异常: ${e.message}`);
    }

    if (sections.length === 0) return '';
    return '\n---\n以下是该日记在全局标签网络中的拓扑分析，供你参考以改善标签质量：\n\n' + sections.join('\n');
}

/**
 * 9.1 通过旧标签 embedding 均值 + KBM tagIndex 做真实 KNN
 *
 * 旧方案：手动 SQL 读 embedding 列 + JS 暴力余弦遍历全库 O(N)
 * 新方案：从 KBM db 读 vector 列计算均值，通过 Rust Vexus tagIndex.search() 做 O(log N) KNN
 */
function getVectorNeighborhood(oldTags) {
    if (!kbm || !kbm.tagIndex || !kbm.db || oldTags.length === 0) return null;

    try {
        const dim = kbm.config.dimension;

        // ── 从 KBM DB 读取旧标签的向量，计算均值 ──
        const oldVectors = [];
        const stmt = kbm.db.prepare('SELECT vector FROM tags WHERE name = ? AND vector IS NOT NULL');

        for (const tagName of oldTags) {
            const row = stmt.get(tagName);
            if (row && row.vector) {
                const vec = decodeVectorBlob(row.vector, dim);
                if (vec) {
                    oldVectors.push(vec);
                }
            }
        }

        if (oldVectors.length === 0) return null;

        // 计算均值向量
        const queryVec = new Float32Array(dim);
        for (const vec of oldVectors) {
            for (let d = 0; d < dim; d++) {
                queryVec[d] += vec[d];
            }
        }
        for (let d = 0; d < dim; d++) {
            queryVec[d] /= oldVectors.length;
        }

        // ── 通过 Rust Vexus tagIndex 做真实 KNN ──
        const searchBuffer = Buffer.from(queryVec.buffer, queryVec.byteOffset, queryVec.byteLength);
        // 请求比 KNN_K 更多的结果，因为需要过滤掉自身旧标签
        const rawResults = kbm.tagIndex.search(searchBuffer, CONFIG.KNN_K + oldTags.length);

        // Hydrate 名称并过滤掉自身旧标签
        const oldTagSet = new Set(oldTags.map(t => t.toLowerCase()));
        const hydrate = kbm.db.prepare('SELECT name FROM tags WHERE id = ?');
        const topK = [];

        for (const r of rawResults) {
            const row = hydrate.get(r.id);
            if (!row) continue;
            if (oldTagSet.has(row.name.toLowerCase())) continue; // 跳过自身
            topK.push({ name: row.name, score: r.score });
            if (topK.length >= CONFIG.KNN_K) break;
        }

        if (topK.length === 0) return null;

        // 分为核心引力区（前5）和边缘引力区（6-10）
        const core = topK.slice(0, 5).map(t => `${t.name}(${t.score.toFixed(3)})`);
        const edge = topK.slice(5).map(t => `${t.name}(${t.score.toFixed(3)})`);

        let section = '[向量邻域]（KBM Rust Vexus KNN）\n';
        section += `核心引力区: ${core.join(', ')}\n`;
        if (edge.length > 0) {
            section += `边缘引力区: ${edge.join(', ')}\n`;
        }
        return section;

    } catch (e) {
        warn(`向量邻域计算失败: ${e.message}`);
        return null;
    }
}

/**
 * 9.2 通过 KBM tagCooccurrenceMatrix 获取标签拓扑
 *
 * 旧方案：手写 SQL JOIN file_tags + position 比较，做有向共现计数
 * 新方案：直接读 KBM 已构建的 V7 有向序位势能共现矩阵 Map<tagId, Map<tagId, weight>>
 */
function getTagTopology(oldTags) {
    if (!kbm || !kbm.tagCooccurrenceMatrix || !kbm.db || oldTags.length === 0) return null;

    try {
        const matrix = kbm.tagCooccurrenceMatrix;
        const totalFiles = kbm.db.prepare('SELECT COUNT(DISTINCT file_id) as cnt FROM file_tags').get()?.cnt || 1;
        const getTagId = kbm.db.prepare('SELECT id FROM tags WHERE name = ?');
        const getTagName = kbm.db.prepare('SELECT name FROM tags WHERE id = ?');
        const getFileCount = kbm.db.prepare('SELECT COUNT(DISTINCT file_id) as cnt FROM file_tags WHERE tag_id = ?');

        const lines = [];

        for (const tagName of oldTags.slice(0, 8)) {
            const tagRow = getTagId.get(tagName);
            if (!tagRow) continue;
            const tagId = tagRow.id;

            // ── 出连接：直接从矩阵读取 matrix.get(tagId) ──
            const outMap = matrix.get(tagId);
            const outLinks = [];
            if (outMap) {
                // 按权重降序排列，取 Top-K
                const sorted = Array.from(outMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, CONFIG.COOCCURRENCE_TOP_K);
                for (const [targetId, weight] of sorted) {
                    const name = getTagName.get(targetId)?.name;
                    if (name) outLinks.push({ name, weight });
                }
            }

            // ── 入连接：遍历矩阵找指向 tagId 的边 ──
            const inLinks = [];
            for (const [sourceId, targets] of matrix.entries()) {
                if (sourceId === tagId) continue;
                const w = targets.get(tagId);
                if (w && w > 0) {
                    const name = getTagName.get(sourceId)?.name;
                    if (name) inLinks.push({ name, weight: w });
                }
            }
            // 按权重降序，取 Top-K
            inLinks.sort((a, b) => b.weight - a.weight);
            const topInLinks = inLinks.slice(0, CONFIG.COOCCURRENCE_TOP_K);

            // 覆盖率
            const fileCount = getFileCount.get(tagId)?.cnt || 0;
            const coverage = ((fileCount / totalFiles) * 100).toFixed(1);

            const outNames = outLinks.map(l => `${l.name}(${l.weight.toFixed(2)})`);
            const inNames = topInLinks.map(l => `${l.name}(${l.weight.toFixed(2)})`);

            let line = `- "${tagName}" → outDeg=${outLinks.length}, inDeg=${topInLinks.length}, 覆盖率=${coverage}%`;
            if (outNames.length > 0) line += `\n  出连接: ${outNames.join(', ')}`;
            if (inNames.length > 0) line += `\n  入连接: ${inNames.join(', ')}`;

            // 判断连接度等级
            const totalDeg = (outMap ? outMap.size : 0) + inLinks.length;
            if (totalDeg > 20) line += '\n  ⚠️ 高泛化标签，建议细化或保留';
            else if (totalDeg <= 2) line += '\n  ℹ️ 低频标签，可能是独特概念';

            lines.push(line);
        }

        if (lines.length === 0) return null;
        return '[旧标签拓扑]（KBM V7 有向序位势能共现矩阵）\n' + lines.join('\n');

    } catch (e) {
        warn(`标签拓扑查询失败: ${e.message}`);
        return null;
    }
}

/**
 * 9.3 检测标签向量碰撞（余弦相似度 > 阈值的标签对）
 *
 * 通过 KBM db 读取 vector 列（注意：KBM schema 中列名是 vector，不是 embedding）
 */
function detectTagCollisions(oldTags) {
    if (!kbm || !kbm.db || oldTags.length < 2) return null;

    try {
        const dim = kbm.config.dimension;
        const stmt = kbm.db.prepare('SELECT id, name, vector FROM tags WHERE name = ? AND vector IS NOT NULL');

        const tagVectors = [];
        for (const tagName of oldTags) {
            const row = stmt.get(tagName);
            if (row && row.vector) {
                const vec = decodeVectorBlob(row.vector, dim);
                if (vec) {
                    tagVectors.push({ name: row.name, vec });
                }
            }
        }

        if (tagVectors.length < 2) return null;

        const collisions = [];
        for (let i = 0; i < tagVectors.length; i++) {
            for (let j = i + 1; j < tagVectors.length; j++) {
                const sim = cosineSimilarity(tagVectors[i].vec, tagVectors[j].vec);
                if (sim >= CONFIG.COLLISION_THRESHOLD) {
                    collisions.push({
                        a: tagVectors[i].name,
                        b: tagVectors[j].name,
                        sim
                    });
                }
            }
        }

        if (collisions.length === 0) return null;

        let section = '[向量碰撞警告]（余弦相似度 > ' + CONFIG.COLLISION_THRESHOLD + ' 的标签对）\n';
        for (const c of collisions) {
            section += `- "${c.a}" 与 "${c.b}" (相似度 ${c.sim.toFixed(3)}) → 建议合并\n`;
        }
        return section;

    } catch (e) {
        warn(`碰撞检测失败: ${e.message}`);
        return null;
    }
}

/**
 * 9.5 查询内生残差
 *
 * 旧方案：手写 SQL 查 tag_intrinsic_residuals 表
 * 新方案：直接读 KBM 内存中的 tagIntrinsicResiduals Map（Rust 预计算结果）
 */
function getIntrinsicResiduals(oldTags) {
    if (!kbm || !kbm.tagIntrinsicResiduals || !kbm.db || oldTags.length === 0) return null;

    try {
        const getTagId = kbm.db.prepare('SELECT id FROM tags WHERE name = ?');
        const residuals = kbm.tagIntrinsicResiduals;

        const lines = [];
        for (const tagName of oldTags.slice(0, 8)) {
            const tagRow = getTagId.get(tagName);
            if (!tagRow) continue;

            const energy = residuals.get(tagRow.id);
            if (energy !== undefined) {
                // KBM 已将残差能量 clamp 到 [0.5, 2.0]
                lines.push(`- "${tagName}": 残差能量=${energy.toFixed(3)}`);
            }
        }

        if (lines.length === 0) return null;
        return '[内生残差]（KBM Rust 预计算，标签信息密度分数）\n' + lines.join('\n');

    } catch (e) {
        return null;
    }
}

/**
 * 9.6 语义密度雷达（v7）
 *
 * 对每个旧标签，用 tagIndex.search(tagVec, 30) 获取最近 30 个邻居，
 * 统计 score > 0.7（角距 < ~45°）的邻居数量 = 局部密度。
 * 复用已有 tagIndex，零额外 IO。
 */
function getSemanticDensityRadar(oldTags) {
    if (!kbm || !kbm.tagIndex || !kbm.db || oldTags.length === 0) return null;

    try {
        const dim = kbm.config.dimension;
        const stmt = kbm.db.prepare('SELECT vector FROM tags WHERE name = ? AND vector IS NOT NULL');
        const lines = [];

        for (const tagName of oldTags.slice(0, 8)) {
            const row = stmt.get(tagName);
            if (!row || !row.vector) continue;

            const vec = decodeVectorBlob(row.vector, dim);
            if (!vec) continue;

            // Rust Vexus O(log N) KNN — 零额外 IO
            const searchBuffer = Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength);
            const neighbors = kbm.tagIndex.search(searchBuffer, 30);

            // 统计 score > 0.7（角距 < ~45°）的邻居数量
            const denseCount = neighbors.filter(n => n.score > 0.7).length;

            let assessment;
            if (denseCount >= 15) assessment = '过度细分区，建议合并近义词';
            else if (denseCount >= 8) assessment = '中密度区域';
            else if (denseCount >= 3) assessment = '适度密度';
            else assessment = '独特语义方向，建议保留';

            const level = denseCount >= 10 ? '高' : denseCount >= 4 ? '中' : '低';
            lines.push(`- "${tagName}" 周围密度: ${level} (半径内${denseCount}个邻居) → ${assessment}`);
        }

        if (lines.length === 0) return null;
        return '[语义密度雷达]（球面几何局部密度）\n' + lines.join('\n');

    } catch (e) {
        warn(`语义密度雷达计算失败: ${e.message}`);
        return null;
    }
}

// ── Union-Find 数据结构（用于连通分量计算）──

class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = new Array(n).fill(0);
    }
    find(x) {
        if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
        return this.parent[x];
    }
    union(x, y) {
        const rx = this.find(x), ry = this.find(y);
        if (rx === ry) return;
        if (this.rank[rx] < this.rank[ry]) { this.parent[rx] = ry; }
        else if (this.rank[rx] > this.rank[ry]) { this.parent[ry] = rx; }
        else { this.parent[ry] = rx; this.rank[rx]++; }
    }
    /** 返回连通分量列表 [[idx,...], ...] */
    components(n) {
        const map = new Map();
        for (let i = 0; i < n; i++) {
            const r = this.find(i);
            if (!map.has(r)) map.set(r, []);
            map.get(r).push(i);
        }
        return [...map.values()];
    }
}

/**
 * 计算 n×n 实对称矩阵的 log-det（LU 分解 / 直接高斯消元）
 * 对 n ≤ 15 的小矩阵完全可接受
 */
function logDet(matrix, n) {
    // 复制矩阵（避免修改原始数据）
    const A = [];
    for (let i = 0; i < n; i++) {
        A.push(new Float64Array(n));
        for (let j = 0; j < n; j++) A[i][j] = matrix[i][j];
    }

    let logAbsDet = 0;
    let sign = 1;

    for (let col = 0; col < n; col++) {
        // 部分主元选择
        let maxVal = Math.abs(A[col][col]);
        let maxRow = col;
        for (let row = col + 1; row < n; row++) {
            if (Math.abs(A[row][col]) > maxVal) {
                maxVal = Math.abs(A[row][col]);
                maxRow = row;
            }
        }

        if (maxVal < 1e-12) return -Infinity; // 奇异矩阵

        if (maxRow !== col) {
            [A[col], A[maxRow]] = [A[maxRow], A[col]];
            sign *= -1;
        }

        logAbsDet += Math.log(Math.abs(A[col][col]));
        if (A[col][col] < 0) sign *= -1;

        // 消元
        for (let row = col + 1; row < n; row++) {
            const factor = A[row][col] / A[col][col];
            for (let j = col + 1; j < n; j++) {
                A[row][j] -= factor * A[col][j];
            }
        }
    }

    return logAbsDet; // sign 对 Gram 矩阵总是正的
}

/**
 * 单链接层次聚类（用于多义词检测）
 * @param {number[][]} simMatrix  n×n 相似度矩阵
 * @param {number} threshold  相似度阈值（低于此值视为不同簇）
 * @returns {Set<number>[]}  非空簇列表
 */
function singleLinkageClustering(simMatrix, threshold, n) {
    const uf = new UnionFind(n);
    // 收集所有对的相似度，按降序排列
    const pairs = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            pairs.push({ i, j, sim: simMatrix[i][j] });
        }
    }
    pairs.sort((a, b) => b.sim - a.sim);

    // 合并相似度 > threshold 的对
    for (const { i, j, sim } of pairs) {
        if (sim < threshold) break;
        uf.union(i, j);
    }

    return uf.components(n);
}

/**
 * 9.7 拓扑覆盖率（v7— 替代 Gram-Schmidt 残差覆盖率）
 *
 * 双指标系统：
 * A. 图连通性分析（β₀ 近似）— 基于 Union-Find 计算连通分量
 * B. 语义体积指标（DPP 核行列式）— log-det(Gram 矩阵) 衡量标签张成的语义体积
 *
 * 数学基础：Borsuk 神经定理 — 标签影响域（余弦球冠）的连通覆盖
 * 纯内存计算，零额外 IO。
 */
function getTopologicalCoverage(oldTags) {
    if (!kbm || !kbm.db || oldTags.length === 0) return null;

    try {
        const dim = kbm.config.dimension;
        const stmt = kbm.db.prepare('SELECT name, vector FROM tags WHERE name = ? AND vector IS NOT NULL');

        // ── Step 1: 读取标签向量 ──
        const tagVectors = [];
        for (const tagName of oldTags) {
            const row = stmt.get(tagName);
            if (!row || !row.vector) continue;
            const vec = decodeVectorBlob(row.vector, dim);
            if (vec) {
                tagVectors.push({ name: row.name, vec });
            }
        }

        if (tagVectors.length < 2) return null;

        const n = tagVectors.length;

        // ── Step 2: 构建 n×n Gram 矩阵（余弦相似度）──
        const gramMatrix = Array.from({ length: n }, () => new Float64Array(n));
        for (let i = 0; i < n; i++) {
            gramMatrix[i][i] = 1.0; // 自身余弦 = 1
            for (let j = i + 1; j < n; j++) {
                const sim = cosineSimilarity(tagVectors[i].vec, tagVectors[j].vec);
                gramMatrix[i][j] = sim;
                gramMatrix[j][i] = sim;
            }
        }

        // ── Step 3A: 图连通性分析（β₀）——Union-Find ──
        const uf = new UnionFind(n);
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (gramMatrix[i][j] > CONFIG.TOPO_EPSILON) {
                    uf.union(i, j);
                }
            }
        }
        const islands = uf.components(n);
        const beta0 = islands.length;

        // ── Step 3B: 语义体积指标（log-det Gram 矩阵）──
        const ld = logDet(gramMatrix, n);
        const volumeScore = isFinite(ld) ? ld / n : 0;

        // ── Step 4: 生成诊断报告 ──
        let section = '[拓扑覆盖]（语义神经复形 · β₀连通性 + DPP语义体积）\n';

        // 连通性
        if (beta0 === 1) {
            section += `- β₀=1 ✅ 标签语义连贯（单连通）\n`;
        } else {
            section += `- β₀=${beta0} ⚠️ 语义分裂为${beta0}个岛:\n`;
            islands.forEach((island, idx) => {
                const names = island.map(i => tagVectors[i].name);
                section += `  岛${idx + 1}: [${names.join(', ')}]\n`;
            });
            section += `  → 建议：添加桥接标签连接语义岛\n`;
        }

        // 语义体积
        section += `- 语义体积: ${volumeScore.toFixed(3)} (log-det/n，越大覆盖面越广)\n`;

        // 如果存在断裂，搜索桥接标签
        if (beta0 > 1 && kbm.tagIndex) {
            try {
                const island1 = islands[0];
                const island2 = islands[1];
                const midpoint = new Float32Array(dim);

                for (const i of island1) {
                    for (let d = 0; d < dim; d++) midpoint[d] += tagVectors[i].vec[d];
                }
                for (const i of island2) {
                    for (let d = 0; d < dim; d++) midpoint[d] += tagVectors[i].vec[d];
                }
                const totalCount = island1.length + island2.length;
                for (let d = 0; d < dim; d++) midpoint[d] /= totalCount;

                const searchBuffer = Buffer.from(midpoint.buffer, midpoint.byteOffset, midpoint.byteLength);
                const candidates = kbm.tagIndex.search(searchBuffer, 5 + oldTags.length);
                const oldTagSet = new Set(oldTags.map(t => t.toLowerCase()));
                const hydrate = kbm.db.prepare('SELECT name FROM tags WHERE id = ?');
                const bridges = [];
                for (const r of candidates) {
                    const row = hydrate.get(r.id);
                    if (!row || oldTagSet.has(row.name.toLowerCase())) continue;
                    bridges.push(row.name);
                    if (bridges.length >= 3) break;
                }
                if (bridges.length > 0) {
                    section += `- 推荐桥接标签: [${bridges.join('], [')}]\n`;
                }
            } catch (e) { /* 桥接搜索非关键路径 */ }
        }

        return section;

    } catch (e) {
        warn(`拓扑覆盖率计算失败: ${e.message}`);
        return null;
    }
}

/**
 * 9.8 多义词分析（v7 — 共现聚类奇点检测 / Blow-up）
 *
 * 对每个旧标签，从共现矩阵获取 top-K 共现邻居，
 * 对邻居向量做单链接聚类，检测标签是否为多义词（语义奇点）。
 * 迷向度 ≥ 2 即为多义词，输出每个义项的代表词。
 *
 * 零额外 IO：完全基于 KBM 的 tagCooccurrenceMatrix + SQLite tags 表。
 */
function getPolysemyAnalysis(oldTags, kbmRef) {
    const kb = kbmRef || kbm;
    if (!kb || !kb.tagCooccurrenceMatrix || !kb.db) return null;
    if (oldTags.length === 0) return null;

    try {
        const dim = kb.config.dimension;
        const matrix = kb.tagCooccurrenceMatrix;
        const getTagId = kb.db.prepare('SELECT id FROM tags WHERE name = ?');
        const getTagInfo = kb.db.prepare('SELECT id, name, vector FROM tags WHERE id = ?');

        const lines = [];
        const K = CONFIG.POLYSEMY_NEIGHBOR_K;
        const clusterThreshold = CONFIG.POLYSEMY_CLUSTER_THRESHOLD;

        for (const tagName of oldTags.slice(0, 8)) {
            const tagRow = getTagId.get(tagName);
            if (!tagRow) continue;

            const outMap = matrix.get(tagRow.id);
            if (!outMap || outMap.size < 4) continue; // 邻居不足，无法分析

            // Step 1: 取 Top-K 共现邻居的向量
            const sorted = Array.from(outMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, K);

            const neighborVecs = [];
            for (const [nid] of sorted) {
                const info = getTagInfo.get(nid);
                if (!info || !info.vector) continue;
                const vec = decodeVectorBlob(info.vector, dim);
                if (vec) {
                    neighborVecs.push({ id: nid, name: info.name, vec });
                }
            }

            if (neighborVecs.length < 4) continue;

            // Step 2: 计算邻居间的余弦相似度矩阵
            const m = neighborVecs.length;
            const simMat = Array.from({ length: m }, () => new Float64Array(m));
            for (let i = 0; i < m; i++) {
                simMat[i][i] = 1.0;
                for (let j = i + 1; j < m; j++) {
                    const sim = cosineSimilarity(neighborVecs[i].vec, neighborVecs[j].vec);
                    simMat[i][j] = sim;
                    simMat[j][i] = sim;
                }
            }

            // Step 3: 单链接聚类
            const clusters = singleLinkageClustering(simMat, clusterThreshold, m);
            const senseCount = clusters.length;

            // Step 4: 输出
            if (senseCount >= 2) {
                // 多义词（奇点）
                let line = `⚠️ "${tagName}" 检测到${senseCount}个义项:`;
                const clusterStrs = clusters.map(cluster => {
                    const reps = cluster.slice(0, 3).map(idx => neighborVecs[idx].name);
                    return `[${reps.join(',')}]`;
                });
                line += ` ${clusterStrs.join(' | ')}`;
                line += `\n→ 建议：根据日记上下文选择精确子标签替代`;
                lines.push(line);
            } else {
                // 单义 ✅
                lines.push(`"${tagName}" 单义 ✅`);
            }
        }

        if (lines.length === 0) return null;
        return '[多义词分析]（共现聚类 · 奇点检测）\n' + lines.join('\n');

    } catch (e) {
        warn(`多义词分析失败: ${e.message}`);
        return null;
    }
}

// ============================================================
// §10  时间壳层标签收集（半衰期时间邻域 + 稳定性判停）
// ============================================================

/**
 * 收集当前文件的时间壳层邻居标签。
 *
 * 这是**提示层外层采样器**，替代原固定 3×3 等权邻域。
 * 旧 3×3 不是 bug，而是被更一般的半衰期时间壳层策略替代。
 *
 * 核心变化：
 *   - 不再固定前3后3，而是按距离 d 逐层扩展
 *   - 每层权重 w(d) = 0.5^(d / halfLife)
 *   - 轻量稳定性判停：连续2轮新增唯一标签 ≤ 阈值即停
 *   - 仍然只在同一顶层日记本组内取候选（保留分组边界）
 *
 * 半衰期语义参考 RAGDiaryPlugin TimeDecay 思想，
 * 但不照搬其在线修饰符 DSL。
 *
 * 返回 { shells: [{distance, weight, tags, newUnique}], totalTags: string[], shellCount: number }
 */
function getTemporalShellTags(currentIndex, allParsed) {
    const current = allParsed[currentIndex];
    if (!current) return { shells: [], totalTags: [], shellCount: 0 };

    const currentGroupKey = getTimelineGroupKey(current.filePath);
    const maxNeighbors = CONFIG.TEMPORAL_SHELL_MAX_NEIGHBORS;
    const halfLifeDays = CONFIG.TEMPORAL_SHELL_HALF_LIFE;
    const stabilityThreshold = CONFIG.TEMPORAL_SHELL_STABILITY_THRESHOLD;

    // 尝试从当前文件提取日期（用于真实天数衰减）
    const currentDate = extractDateFromPath(current.filePath);

    // ── Step 1: 收集同组邻居，记录序距与可选日期 ──
    // 每个邻居: { ordinal, daysDelta, tags }
    const neighbors = [];

    let pCount = 0;
    for (let i = currentIndex - 1; i >= 0 && pCount < maxNeighbors; i--) {
        const candidate = allParsed[i];
        if (!candidate || getTimelineGroupKey(candidate.filePath) !== currentGroupKey) continue;
        pCount++;
        if (candidate.parsed.oldTags.length > 0) {
            const nDate = extractDateFromPath(candidate.filePath);
            const daysDelta = (currentDate && nDate)
                ? Math.abs(Math.round((currentDate - nDate) / 86400000))
                : null;
            neighbors.push({ ordinal: pCount, daysDelta, tags: candidate.parsed.oldTags });
        }
    }

    let nCount = 0;
    for (let i = currentIndex + 1; i < allParsed.length && nCount < maxNeighbors; i++) {
        const candidate = allParsed[i];
        if (!candidate || getTimelineGroupKey(candidate.filePath) !== currentGroupKey) continue;
        nCount++;
        if (candidate.parsed.oldTags.length > 0) {
            const nDate = extractDateFromPath(candidate.filePath);
            const daysDelta = (currentDate && nDate)
                ? Math.abs(Math.round((currentDate - nDate) / 86400000))
                : null;
            neighbors.push({ ordinal: nCount, daysDelta, tags: candidate.parsed.oldTags });
        }
    }

    if (neighbors.length === 0) return { shells: [], totalTags: [], shellCount: 0 };

    // ── Step 2: 按实际天数 / 序距排序，统一计算半衰期权重 ──
    // 优先用真实天数差 (daysDelta)，回退到序距 (ordinal) 作为 d
    neighbors.sort((a, b) => {
        const dA = a.daysDelta !== null ? a.daysDelta : a.ordinal;
        const dB = b.daysDelta !== null ? b.daysDelta : b.ordinal;
        return dA - dB;
    });

    // ── Step 3: 逐个构建壳层 + 半衰期权重 + 稳定性判停 ──
    const shells = [];
    const cumulativeTagSet = new Set();
    let consecutiveStable = 0;

    for (const neighbor of neighbors) {
        // d 优先使用真实天数差 (halfLifeDays)，回退到序距
        const d = neighbor.daysDelta !== null ? neighbor.daysDelta : neighbor.ordinal;
        // 半衰期衰减: w(d) = 0.5^(Δt / halfLifeDays)
        // 对 d=0（同日）取满权
        const weight = d > 0 ? Math.pow(0.5, d / halfLifeDays) : 1.0;

        const shellTags = new Set(neighbor.tags);

        // 稳定性：统计本邻居贡献了多少真正新的唯一标签
        const prevCumulSize = cumulativeTagSet.size;
        shellTags.forEach(t => cumulativeTagSet.add(t));
        const newUnique = cumulativeTagSet.size - prevCumulSize;

        shells.push({ distance: d, weight, tags: [...shellTags], newUnique });

        // 启发式稳定性判停（局部神经复形覆盖增量趋稳近似）：
        // 连续 2 轮新增唯一标签 ≤ 阈值 → 停止继续扩张
        if (newUnique <= stabilityThreshold) {
            consecutiveStable++;
            if (consecutiveStable >= 2) break;
        } else {
            consecutiveStable = 0;
        }
    }

    return { shells, totalTags: [...cumulativeTagSet], shellCount: shells.length };
}

// ============================================================
// §11  LLM 调用器
// ============================================================

/** TagMaster V7 System Prompt */
const TAG_SYSTEM_PROMPT = `你是 VCP TagMemo V7 打标专家。你的任务是为日记内容重新生成高质量的标签。

## 打标原则

1. **序位势能**：你输出的标签顺序代表重要性递减。排在第1位的标签拥有最高的语义势能。请把最核心的标签放在最前面。

2. **标签类型**：
   - 核心主题词（1-3个）：这篇日记在说什么
   - 桥接词（2-4个）：与其他话题的关联
   - 引力词（1-2个）：什么场景下需要检索到这篇
   - 时间锚（可选）：重要的时间节点

3. **标签质量**：
   - 每个标签 2-8 个字为佳，不超过 15 字
   - 避免过于泛化的标签（如"日常"、"记录"、"笔记"），除非日记确实只有这些内容
   - 避免冗余重复（如同时使用"性能优化"和"代码加速"）
   - 标签数量：通常 5-12 个，根据日记信息密度调整

4. **保守性原则（最重要）**：
   你的首要义务是**不做无意义的改动**。如果拓扑分析显示：
   - 所有旧标签均无泛化风险警告（无 ⚠️）
   - 拓扑覆盖显示 β₀=1（单连通）
   - 无碰撞警告
   - 内生残差均 > 1.0
   那么你应该**原样返回旧标签**，只做微调（补时间锚、修正序位）。
   不要为了"显得有用"而替换措辞。保留原词即是最大的贡献。
   评价标准：如果新旧标签 Jaccard 相似度 < 0.5 且拓扑分析无负面信号（⚠️），
   说明你做了过度改动，这比不改更差。

5. **标签格式**：
   - 使用英文逗号+空格分隔
   - 纯文本，不带 # 前缀

6. **拓扑地图利用**：
   - 如果提供了拓扑分析，请参考向量邻域推荐的关联标签
   - 注意碰撞警告，避免使用高度相似的重复标签
   - 参考时间邻域标签，保持时间线上的连贯性
   - 如果旧标签中有高泛化标签，请尝试细化
   - 如果多义词分析报告了⚠️奇点标签，请选择更精确的子标签替代
   - 如果拓扑覆盖显示语义岛断裂（β₀>1），请考虑添加桥接标签

## 输出格式

严格按以下格式输出，不要有任何其他内容：

[[Tag: 标签1, 标签2, 标签3, ...]]`;

/**
 * 从 AI 响应中提取 Tag 行
 */
function extractTagFromAIResponse(aiResponse) {
    const bracketMatch = aiResponse.match(/\[\[Tag[：:]\s*(.+?)\]\]/i);
    if (bracketMatch && bracketMatch[1]) {
        return 'Tag: ' + bracketMatch[1].trim();
    }

    const lines = aiResponse.split('\n');
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
        const trimmed = lines[i].trim();
        if (/^Tag[：:]\s*.+/i.test(trimmed)) {
            return trimmed.replace(/^tag[：:]\s*/i, 'Tag: ');
        }
    }

    return null;
}

/**
 * 调用 LLM 生成新标签（带指数退避重试）
 */
async function callLLMForTags(body, oldTags, topoMap) {
    if (!CONFIG.TAG_API_KEY || !CONFIG.TAG_API_URL) {
        fatal('API 配置缺失！请检查 TAG_API_KEY 和 TAG_API_URL');
    }

    let userPrompt = '';

    const truncatedBody = body.length > 6000 ? body.substring(0, 6000) + '\n...(正文已截断)' : body;
    userPrompt += '## 日记正文\n\n' + truncatedBody + '\n';

    if (oldTags.length > 0) {
        userPrompt += '\n## 当前标签\n\n' + oldTags.join(', ') + '\n';
    }

    if (topoMap) {
        userPrompt += '\n## 拓扑分析\n' + topoMap + '\n';
    }

    // ── 预算层：动态 Token/字节预算审计 ──
    // 这是提示层 admission controller，不是数学本体。
    // 动态预算器优先于扩邻域：若预算吃紧，先裁剪内容，不强扩。
    const budgetResult = applyBudgetControl(TAG_SYSTEM_PROMPT, userPrompt);
    userPrompt = budgetResult.userPrompt;
    if (budgetResult.actions.length > 0) {
        log(`  💰 [预算] ${budgetResult.actions.join('; ')}`);
    }

    const requestData = {
        model: CONFIG.TAG_MODEL,
        messages: [
            { role: 'system', content: TAG_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
        ],
        max_tokens: CONFIG.TAG_MAX_OUTPUT_TOKENS,
    };
    // 可选参数：不硬编码，只在用户显式配置时才发送
    if (CONFIG.TAG_TEMPERATURE !== undefined) requestData.temperature = CONFIG.TAG_TEMPERATURE;
    if (CONFIG.TAG_TOP_P !== undefined) requestData.top_p = CONFIG.TAG_TOP_P;

    const apiEndpoint = CONFIG.TAG_API_URL.includes('/chat/completions')
        ? CONFIG.TAG_API_URL
        : `${CONFIG.TAG_API_URL}/v1/chat/completions`;

    for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
        try {
            const fetch = (await import('node-fetch')).default;

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.TAG_API_KEY}`
                },
                body: JSON.stringify(requestData),
                timeout: CONFIG.TAG_TIMEOUT_MS
            });

            if (response.status === 429) {
                const retryAfter = response.headers.get('retry-after');
                const waitTime = retryAfter
                    ? parseInt(retryAfter) * 1000
                    : Math.pow(2, attempt) * CONFIG.RETRY_DELAY_MS;
                warn(`API 限流 429 (尝试 ${attempt}/${CONFIG.MAX_RETRIES})，等待 ${Math.round(waitTime / 1000)}s...`);
                if (attempt < CONFIG.MAX_RETRIES) { await delay(waitTime); continue; }
                return null;
            }

            if (response.status >= 500) {
                const backoff = Math.pow(2, attempt - 1) * 2000;
                warn(`服务器错误 ${response.status} (尝试 ${attempt}/${CONFIG.MAX_RETRIES})，等待 ${backoff}ms...`);
                if (attempt < CONFIG.MAX_RETRIES) { await delay(backoff); continue; }
                return null;
            }

            if (response.status === 401 || response.status === 403) {
                fatal(`认证失败 (${response.status})。请检查 TAG_API_KEY 和 TAG_API_URL。`);
            }

            if (!response.ok) {
                let errorText = '';
                try { errorText = await response.text(); } catch (e) { errorText = '无法读取错误'; }
                warn(`API 错误 (${response.status}): ${errorText.substring(0, 200)}`);
                return null;
            }

            const result = await response.json();

            if (result.choices && result.choices.length > 0) {
                const aiResponse = result.choices[0].message?.content || '';
                return extractTagFromAIResponse(aiResponse);
            }

            warn('API 返回无 choices');
            return null;

        } catch (err) {
            warn(`LLM 调用异常 (尝试 ${attempt}/${CONFIG.MAX_RETRIES}): ${err.message}`);
            if (attempt < CONFIG.MAX_RETRIES) {
                await delay(Math.pow(2, attempt - 1) * 2000);
                continue;
            }
            return null;
        }
    }

    return null;
}

// ============================================================
// §11.5  输出后处理器（v7 — Jaccard 门控）
// ============================================================

/**
 * 检测拓扑地图文本中是否包含负面信号（⚠️ 标记）。
 * 如果拓扑报告包含泛化风险、碰撞警告等 ⚠️ 标记，说明旧标签确实有问题，
 * LLM 的大幅改动是合理的，不应被 Jaccard 门控拦截。
 */
function hasNegativeSignals(topoMap) {
    if (!topoMap || typeof topoMap !== 'string') return false;
    return topoMap.includes('⚠️');
}

/**
 * 后处理 LLM 输出的新标签：碰撞检测、新旧差异报告、局部密度检查、Jaccard 门控。
 * 返回 { approved: boolean, reason?: string, jaccard: number }
 * approved=false 时，主循环应拒绝写回，保留原标签。
 */
function postProcessTags(oldTags, newTags, relPath, topoMap) {
    try {
        // ── 1. 新旧差异报告（大小写不敏感 + 去重）──
        const uniqueOldTags = uniqueTagsCaseInsensitive(oldTags);
        const uniqueNewTags = uniqueTagsCaseInsensitive(newTags);

        const oldSet = new Set(uniqueOldTags.map(toNormalizedTagKey));
        const newSet = new Set(uniqueNewTags.map(toNormalizedTagKey));

        const kept = uniqueNewTags.filter(t => oldSet.has(toNormalizedTagKey(t)));
        const added = uniqueNewTags.filter(t => !oldSet.has(toNormalizedTagKey(t)));
        const removed = uniqueOldTags.filter(t => !newSet.has(toNormalizedTagKey(t)));

        const unionSet = new Set([...oldSet, ...newSet]);
        const intersectionCount = [...newSet].filter(t => oldSet.has(t)).length;
        const jaccard = unionSet.size > 0 ? (intersectionCount / unionSet.size) : 1;

        log(`\n  📊 [后处理] ${relPath}`);
        log(`    Jaccard相似度: ${(jaccard * 100).toFixed(1)}% | 保留${kept.length} 新增${added.length} 删除${removed.length}`);
        if (added.length > 0) log(`    ＋ 新增: ${added.join(', ')}`);
        if (removed.length > 0) log(`    － 删除: ${removed.join(', ')}`);

        if (newSet.size === 0) {
            warn(`    ⚠️ 新标签为空，拒绝写回`);
            return { approved: false, reason: 'empty_new_tags', jaccard: 0 };
        }

        if (oldSet.size === 0) {
            log(`    ℹ️ 无旧标签基线，跳过 Jaccard 门控`);
            return { approved: true, reason: 'bootstrap_no_old_tags', jaccard };
        }

        // ── 2. 新标签碰撞检测（cosine > COLLISION_THRESHOLD → 警告）──
        if (kbm && kbm.db && newTags.length >= 2) {
            try {
                const dim = kbm.config.dimension;
                const stmt = kbm.db.prepare('SELECT name, vector FROM tags WHERE name = ? AND vector IS NOT NULL');
                const vecs = [];

                for (const tag of newTags) {
                    const row = stmt.get(tag);
                    if (row && row.vector) {
                        const vec = decodeVectorBlob(row.vector, dim);
                        if (vec) vecs.push({ name: row.name, vec });
                    }
                }

                for (let i = 0; i < vecs.length; i++) {
                    for (let j = i + 1; j < vecs.length; j++) {
                        const sim = cosineSimilarity(vecs[i].vec, vecs[j].vec);
                        if (sim >= CONFIG.COLLISION_THRESHOLD) {
                            warn(`    ⚠️ 新标签碰撞: "${vecs[i].name}" ↔ "${vecs[j].name}" (${sim.toFixed(3)})`);
                        }
                    }
                }
            } catch (e) { /* graceful degrade — 碰撞检测非关键路径 */ }
        }

        // ── 3. 新增标签局部密度检查 ──
        if (kbm && kbm.tagIndex && kbm.db && added.length > 0) {
            try {
                const dim = kbm.config.dimension;
                const stmt = kbm.db.prepare('SELECT vector FROM tags WHERE name = ? AND vector IS NOT NULL');

                for (const tag of added.slice(0, 5)) {
                    const row = stmt.get(tag);
                    if (!row || !row.vector) continue;
                    const vec = decodeVectorBlob(row.vector, dim);
                    if (!vec) continue;
                    const searchBuffer = Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength);
                    const neighbors = kbm.tagIndex.search(searchBuffer, 30);
                    const denseCount = neighbors.filter(n => n.score > 0.7).length;
                    if (denseCount >= 15) {
                        warn(`    ⚠️ 新标签 "${tag}" 位于高密度区域 (${denseCount}个邻居)，可能过度细分`);
                    }
                }
            } catch (e) { /* graceful degrade */ }
        }

        // ── 4. Jaccard 门控（v7.0）──
        if (jaccard < CONFIG.JACCARD_FLOOR && !hasNegativeSignals(topoMap)) {
            // 拓扑没有负面信号，但 LLM 大改了 → 可疑的过度重构
            log(`    ⚠️ 门控触发：Jaccard=${jaccard.toFixed(2)} < ${CONFIG.JACCARD_FLOOR}，且拓扑无负面信号`);
            log(`      → 拒绝写回，保留原标签`);
            return { approved: false, reason: 'jaccard_gate', jaccard };
        }

        return { approved: true, jaccard };

    } catch (e) {
        warn(`后处理异常: ${e.message}`);
        // 异常时默认放行，不阻塞流程
        return { approved: true, jaccard: 1 };
    }
}

// ============================================================
// §12  写回器
// ============================================================

/**
 * 将新 Tag 写回日记文件
 */
async function writeBackTags(filePath, content, parsed, newTagLine) {
    const fixedTagLine = fixTagFormat(newTagLine);

    let newContent;
    if (parsed.hasTag) {
        const lines = content.split('\n');
        lines[parsed.tagLineIndex] = fixedTagLine;
        newContent = lines.join('\n');
    } else {
        newContent = content.trimEnd() + '\n' + fixedTagLine;
    }

    await fsPromises.writeFile(filePath, newContent, 'utf-8');
    return fixedTagLine;
}

// ============================================================
// §13  统计与进度
// ============================================================

const stats = {
    total: 0,
    processed: 0,
    retagged: 0,
    skipped: 0,
    gated: 0,
    errors: 0,
    startTime: 0,
};

function printProgress(current, total, fileName) {
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const avgTime = elapsed / Math.max(current, 1);
    const remaining = avgTime * (total - current);

    const bar = '█'.repeat(Math.floor(current / total * 30)) + '░'.repeat(30 - Math.floor(current / total * 30));
    const pct = ((current / total) * 100).toFixed(1);

    process.stdout.write(`\r  [${bar}] ${pct}% (${current}/${total}) ETA: ${formatETA(remaining)} | ${path.basename(fileName).substring(0, 30)}`);
}

function printStats() {
    const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(1);
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║            TagMemo V7 打标完成统计                          ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  总文件数:     ${stats.total.toString().padStart(5)}                                    ║`);
    console.log(`║  成功重打标:   ${stats.retagged.toString().padStart(5)}                                    ║`);
    console.log(`║  门控拦截:     ${stats.gated.toString().padStart(5)} (Jaccard < ${CONFIG.JACCARD_FLOOR} 且拓扑无警告)      ║`);
    console.log(`║  跳过(断点):   ${stats.skipped.toString().padStart(5)}                                    ║`);
    console.log(`║  错误:         ${stats.errors.toString().padStart(5)}                                    ║`);
    console.log(`║  总耗时:       ${elapsed.padStart(5)}s                                   ║`);
    console.log(`║  数学引擎:     ${(kbm ? 'KBM ✅' : '无 ❌').padEnd(8)}                                 ║`);
    if (globalTagMetrics) {
        const m = globalTagMetrics;
        console.log(`║  Tag Gini:     ${m.gini.toFixed(3).padStart(5)} | HHI: ${m.hhi.toFixed(4)} | H: ${m.shannonH.toFixed(1)}bits       ║`);
    }
    console.log('╚══════════════════════════════════════════════════════════════╝');
}

// ============================================================
// §14  主函数
// ============================================================

async function main() {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║   VCP TagMemo V7 全库打标器 — 拓扑覆盖 + 多义词检测        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');

    // ── 14.0  初始化 KBM 数学引擎 ──
    if (!opts.noTopo) {
        await initializeKBM();
    } else {
        log('⏩ --no-topo 模式，跳过 KBM 初始化');
    }

    // 验证 API 配置
    if (!CONFIG.TAG_API_KEY || !CONFIG.TAG_API_URL) {
        fatal('API 配置缺失！请在 tag-processor-config.env 或 config.env 中设置 TAG_API_KEY 和 TAG_API_URL（或 API_Key 和 API_URL）');
    }

    log(`扫描目录:    ${CONFIG.DAILYNOTE_DIR}`);
    log(`排除目录:    ${CONFIG.EXCLUDE_DIRS.join(', ')}`);
    log(`LLM 模型:    ${CONFIG.TAG_MODEL}`);
    log(`碰撞阈值:    ${CONFIG.COLLISION_THRESHOLD}`);
    log(`Jaccard门控: ${CONFIG.JACCARD_FLOOR} ${CONFIG.FORCE_WRITE ? '(--force 已启用，门控跳过)' : ''}`);
    log(`数学引擎:    ${kbm ? 'KBM (共现矩阵 + Vexus KNN + 内生残差)' : '无（跳过拓扑）'}`);
    log(`模式:        ${opts.dryRun ? '🔍 试运行（不写回）' : '✏️  正式运行（写回文件）'}`);
    if (opts.limit) log(`处理上限:    ${opts.limit}`);
    console.log('');

    // 检查扫描目录
    if (!fs.existsSync(CONFIG.DAILYNOTE_DIR)) {
        fatal(`扫描目录不存在: ${CONFIG.DAILYNOTE_DIR}`);
    }

    // ── 14.1  扫描文件 ──
    log('📁 扫描文件中...');
    const allFiles = await scanDiaryFiles(CONFIG.DAILYNOTE_DIR, CONFIG.EXCLUDE_DIRS);
    log(`📄 发现 ${allFiles.length} 个日记文件`);

    if (allFiles.length === 0) {
        log('没有找到日记文件，退出。');
        await shutdownKBM();
        return;
    }

    // ── 14.2  加载断点 ──
    const processed = loadCheckpoint();
    stats.skipped = processed.size;

    // ── 14.3  预解析所有文件（用于时间窗口） ──
    log('📖 预解析文件...');
    const allParsed = [];
    for (const filePath of allFiles) {
        try {
            const content = await fsPromises.readFile(filePath, 'utf-8');
            const parsed = parseDiary(content);
            allParsed.push({ filePath, content, parsed });
        } catch (e) {
            allParsed.push({ filePath, content: '', parsed: { body: '', tagLine: '', tagLineIndex: -1, oldTags: [], hasTag: false } });
        }
    }

    // ── 14.4  确定待处理列表 ──
    let toProcess = [];
    for (let i = 0; i < allParsed.length; i++) {
        if (!processed.has(allParsed[i].filePath)) {
            toProcess.push(i);
        }
    }

    if (opts.limit) {
        const limit = parseInt(opts.limit, 10);
        if (limit > 0 && limit < toProcess.length) {
            toProcess = toProcess.slice(0, limit);
        }
    }

    stats.total = toProcess.length;
    log(`🎯 待处理: ${stats.total} 篇（已跳过 ${stats.skipped} 篇断点）`);
    console.log('');

    if (stats.total === 0) {
        log('✅ 所有文件已处理完毕！');
        await shutdownKBM();
        return;
    }

    // ── 14.5  处理（支持 LLM 并发 — KBM 是只读静态的，安全并行）──
    stats.startTime = Date.now();
    const concurrency = Math.max(1, CONFIG.TAG_CONCURRENCY);
    if (concurrency > 1) log(`🚀 LLM 并发度: ${concurrency}`);

    /**
     * 处理单篇日记的完整流程（纯函数式，不依赖外部循环变量 idx）
     * KBM 是初始化后只读的，allParsed 在此阶段也只读，所以并发安全。
     */
    async function processSingleDiary(taskIdx, globalIdx) {
        const { filePath, content, parsed } = allParsed[globalIdx];
        const relPath = path.relative(CONFIG.DAILYNOTE_DIR, filePath);

        if (concurrency <= 1) printProgress(taskIdx + 1, stats.total, relPath);

        try {
            if (!parsed.body || parsed.body.trim().length < 10) {
                warn(`\n  跳过空文件: ${relPath}`);
                processed.add(filePath);
                stats.errors++;
                return;
            }

            // 收集时间壳层标签（半衰期邻域 + 稳定性判停）
            const neighborTags = getTemporalShellTags(globalIdx, allParsed);

            // 生成拓扑地图
            let topoMap = '';
            if (!opts.noTopo) {
                topoMap = await generateTopoMap(parsed.body, parsed.oldTags, neighborTags);
            }

            // 调用 LLM（含内容级重试：HTTP 200 但解析不出 Tag 时再试）
            let newTagLine = await callLLMForTags(parsed.body, parsed.oldTags, topoMap);

            for (let retry = 0; !newTagLine && retry < CONFIG.CONTENT_RETRY_MAX; retry++) {
                warn(`\n  ⚠️ 内容级重试 ${retry + 1}/${CONFIG.CONTENT_RETRY_MAX}: ${relPath}`);
                await delay(CONFIG.CONTENT_RETRY_DELAY_MS);
                newTagLine = await callLLMForTags(parsed.body, parsed.oldTags, topoMap);
            }

            if (!newTagLine) {
                warn(`\n  ❌ LLM 重试后仍返回空: ${relPath}`);
                stats.errors++;
                return;
            }

            // ── v7 输出后处理 + Jaccard 门控 ──
            const newTags = extractTagNames(newTagLine);
            if (newTags.length === 0) {
                warn(`\n  ❌ AI 返回的 Tag 为空: ${relPath}`);
                stats.errors++;
                return;
            }
            const ppResult = postProcessTags(parsed.oldTags, newTags, relPath, topoMap);

            // 写回或打印（受门控约束）
            if (ppResult.approved || CONFIG.FORCE_WRITE) {
                if (CONFIG.FORCE_WRITE && !ppResult.approved) {
                    log(`    🔓 --force 覆盖门控，强制写回`);
                }
                if (opts.dryRun) {
                    const fixed = fixTagFormat(newTagLine);
                    console.log(`\n  [DRY-RUN] ${relPath}`);
                    if (parsed.hasTag) console.log(`    旧: ${parsed.tagLine}`);
                    console.log(`    新: ${fixed}`);
                } else {
                    const written = await writeBackTags(filePath, content, parsed, newTagLine);
                    allParsed[globalIdx].parsed.oldTags = extractTagNames(written);
                }
                stats.retagged++;
            } else {
                console.log(`\n  🚫 [${path.basename(filePath)}] 被 Jaccard 门控拦截 (${ppResult.reason}), Jaccard=${ppResult.jaccard.toFixed(2)}, 保留原标签`);
                stats.gated++;
            }
            processed.add(filePath);

        } catch (e) {
            warn(`\n  ❌ 处理异常 ${relPath}: ${e.message}`);
            stats.errors++;
        }
    }

    // ── 按并发度分批执行 ──
    for (let batchStart = 0; batchStart < toProcess.length; batchStart += concurrency) {
        const batchEnd = Math.min(batchStart + concurrency, toProcess.length);
        const batch = [];
        for (let taskIdx = batchStart; taskIdx < batchEnd; taskIdx++) {
            batch.push(processSingleDiary(taskIdx, toProcess[taskIdx]));
        }
        await Promise.all(batch);

        // 批次间进度 & 断点
        if (concurrency > 1) {
            printProgress(Math.min(batchEnd, toProcess.length), stats.total, `batch ${Math.floor(batchStart / concurrency) + 1}`);
        }
        if (!opts.dryRun && stats.retagged > 0 && stats.retagged % 5 < concurrency) {
            saveCheckpoint(processed);
        }
    }

    // ── 14.6  收尾 ──
    if (!opts.dryRun) {
        saveCheckpoint(processed);
    }

    await shutdownKBM();

    stats.processed = stats.retagged + stats.errors;
    printStats();

    if (stats.errors > 0) {
        log('⚠️  部分文件处理失败，可重新运行脚本自动从断点继续。');
    } else {
        log('✅ 全部完成！');
        if (!opts.dryRun && fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
            fs.unlinkSync(CONFIG.CHECKPOINT_FILE);
            log('🗑️  断点文件已清除（全部成功）');
        }
    }
}

/**
 * 安全关闭 KBM（只关闭 DB 连接，不触发完整 shutdown 流程）
 */
async function shutdownKBM() {
    if (kbm && kbm.db) {
        try {
            kbm.db.close();
            log('🔒 KBM 数据库连接已关闭');
        } catch (e) { /* ignore */ }
    }
}

// ============================================================
// §15  启动
// ============================================================

main().catch(err => {
    console.error('[V7][FATAL] 未捕获异常:', err);
    if (kbm && kbm.db) { try { kbm.db.close(); } catch (e) { /* ignore */ } }
    process.exit(1);
});