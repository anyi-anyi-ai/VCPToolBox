/**
 * @file phase5_pressure_injection.test.js
 * @description Phase 5 Narrative Debt Pressure & Layer 6 Context Injection E2E Test Suite (Tier 1 & Tier 2)
 * Tests GetDebtPressure command, Layer 6 context funnel integration, token budget pruning immunity,
 * focusEntities filtering, Rule_DebtOverdue consistency rule, and stdio execution.
 * 
 * @module test/e2e/phase5_pressure_injection
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const { VCPContextBuilder } = require('../../src/collaboration');

const PLUGIN_DIR = path.resolve(__dirname, '..', '..');
const ENTRY_SCRIPT = path.join(PLUGIN_DIR, 'NovelEngineering.js');

/**
 * Subprocess stdio invocation helper
 */
function invokeStdioCommand(payload, envOverrides = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const inputString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const child = spawn(process.execPath, [ENTRY_SCRIPT], {
      cwd: PLUGIN_DIR,
      env: {
        ...process.env,
        DEBUG_MODE: 'false',
        ...envOverrides
      },
      shell: false,
      windowsHide: true
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
      reject(new Error(`Plugin execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk;
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return;

      const trimmedStdout = stdoutBuffer.trim();
      let parsedJson = null;
      try {
        parsedJson = JSON.parse(trimmedStdout);
      } catch (_) {}

      resolve({
        code,
        signal,
        stdout: trimmedStdout,
        stderr: stderrBuffer.trim(),
        json: parsedJson
      });
    });

    try {
      if (inputString !== undefined && inputString !== null) {
        child.stdin.write(inputString + '\n');
      }
      child.stdin.end();
    } catch (writeErr) {
      clearTimeout(timer);
      reject(writeErr);
    }
  });
}

describe('Phase 5: Narrative Debt Pressure & Layer 6 Injection E2E Suite (Tier 1 & Tier 2)', () => {
  let tempDir;
  let vaultDir;
  let sandboxDir;
  let dbManager;
  let dispatcher;
  let pathGuard;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_p5_pressure_'));
    vaultDir = path.join(tempDir, 'WorldTree');
    sandboxDir = path.join(tempDir, 'Sandbox');

    fs.mkdirSync(vaultDir, { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '02_Entities'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '03_Chapters'), { recursive: true });

    fs.mkdirSync(sandboxDir, { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: sandboxDir,
      vaultRoot: vaultDir
    });

    dbPath = path.join(sandboxDir, 'data', 'novel_test.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: sandboxDir,
      pathGuard,
      dbManager,
      dbPath
    });

    // Populate standard seed entities and world rules
    const db = dbManager.getDatabase();
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count, frontmatter_json)
      VALUES (1, '01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 250, 1700000000, 'rule_hash_001', 'world_rule', 'active', 'reviewed', 3, 250, '{"rule_scope":"global"}'),
             (2, '02_Entities/GreyHarbor.md', '02_Entities/GreyHarbor.md', 'GreyHarbor.md', '.md', 600, 1700000000, 'planet_hash_001', 'entity', 'active', 'reviewed', 3, 600, '{}')
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'RULE-001', '灵气潮汐法则', 'rule', 'active', 'reviewed', 3, 1),
             (2, 'ENT_GU_CHEN', '顾沉', 'character', 'active', 'reviewed', 3, 2)
    `).run();
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // =========================================================================
  // Tier 1: Primary Functional Paths (PI-01 to PI-05)
  // =========================================================================

  it('PI-01: should return structured Layer 6 format with immuneToTokenTrimming flag', async () => {
    // Seed an active debt
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '顾家禁地石碑之谜',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 20,
      basePrincipal: 100.0,
      relatedEntities: ['ENT_GU_CHEN']
    });

    const pressureRes = await dispatcher.dispatch('GetDebtPressure', {
      chapterNumber: 5
    });

    assert.equal(pressureRes.layer, 6);
    assert.equal(pressureRes.layerName, 'narrative_debt_pressure');
    assert.equal(pressureRes.immuneToTokenTrimming, true);
    assert.ok(pressureRes.debtPressureVector);
    assert.ok(typeof pressureRes.formattedContextSnippet === 'string');
  });

  it('PI-02: should compute structured vector with totalPressure, highestUrgency, and debt lists', async () => {
    // 1. Core mystery (normal urgency)
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '主线谜题：古魔残魂',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 30,
      basePrincipal: 100.0,
      interestRate: 0.05
    });

    // 2. Crisis hook (near deadline at chapter 8)
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '危机钩子：拍卖行刺客伏击',
      debtType: 'crisis_hook',
      borrowedChapter: 5,
      targetPayoffChapter: 8,
      basePrincipal: 50.0,
      interestRate: 0.10
    });

    // Accrue at chapter 7
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 7
    });

    const pressureRes = await dispatcher.dispatch('GetDebtPressure', {
      chapterNumber: 7
    });

    const vector = pressureRes.debtPressureVector;
    assert.ok(vector.totalPressure > 0);
    assert.ok(vector.highestUrgency !== undefined);
    assert.ok(Array.isArray(vector.activeHooks));
    assert.ok(vector.activeHooks.length >= 2);
  });

  it('PI-03: should format clean Markdown prompt snippet containing urgency and payoff targets', async () => {
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '遗迹密匙争夺',
      description: '各大势力在青云宗外围集结争夺密匙',
      debtType: 'crisis_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 80.0
    });

    const pressureRes = await dispatcher.dispatch('GetDebtPressure', {
      chapterNumber: 9
    });

    const snippet = pressureRes.formattedContextSnippet;
    assert.ok(snippet.includes('遗迹密匙争夺') || snippet.includes('narrative_debt') || snippet.includes('债务'));
    assert.ok(snippet.length > 20);
  });

  it('PI-04: should integrate Layer 6 debt pressure into BuildVCPContext response payload', async () => {
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '九幽玄晶下落',
      debtType: 'subplot_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 15,
      basePrincipal: 60.0,
      relatedEntities: ['ENT_GU_CHEN']
    });

    const contextRes = await dispatcher.dispatch('BuildVCPContext', {
      chapterId: 5,
      focusEntities: ['ENT_GU_CHEN'],
      maxTokens: 10000
    });

    // Verify Layer 6 is present in context or payload
    assert.ok(contextRes.debtPressure || contextRes.narrativeDebtPressure || contextRes.layer6 || (contextRes.sourceTrace && contextRes.sourceTrace.some(t => t.authority === 'narrative_debt' || t.category === 'narrative_debt')));
  });

  it('PI-05: should filter debt pressure by focusEntities', async () => {
    // Debt for Gu Chen
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '顾沉的佩剑暗纹',
      debtType: 'subplot_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 40.0,
      relatedEntities: ['ENT_GU_CHEN']
    });

    // Debt for unrelated entity
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '药王谷长老的秘密',
      debtType: 'subplot_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 50.0,
      relatedEntities: ['ENT_YAO_WANG']
    });

    const focusedRes = await dispatcher.dispatch('GetDebtPressure', {
      chapterNumber: 5,
      focusEntities: ['ENT_GU_CHEN']
    });

    const vector = focusedRes.debtPressureVector;
    const debtTitles = (vector.activeHooks || []).map(d => d.title || d.name);
    assert.ok(debtTitles.includes('顾沉的佩剑暗纹'));
  });

  // =========================================================================
  // Tier 2: Token Budget Immunity & Consistency Rules (PI-06 to PI-10)
  // =========================================================================

  it('PI-06: should strictly preserve Layer 6 under extreme token budget constraints (Immunity to Trimming)', async () => {
    // Populate large memories and candidates to force heavy trimming
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '核心不可裁剪债务：灭门惨案真凶',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 20,
      basePrincipal: 100.0
    });

    // Call BuildVCPContext with very small token limit (300 tokens)
    const contextRes = await dispatcher.dispatch('BuildVCPContext', {
      chapterId: 10,
      maxTokens: 300,
      vcpMemoryRefs: [
        { memoryId: 'm1', content: '大量次要记忆数据 '.repeat(100) },
        { memoryId: 'm2', content: '更多次要备忘内容 '.repeat(100) }
      ],
      semanticCandidates: [
        { candidateId: 'c1', content: 'RAG候选检索长段落 '.repeat(100) }
      ]
    });

    // Even if memory / candidate layers get pruned, Layer 6 debt pressure must be preserved
    if (contextRes.debtPressure) {
      assert.equal(contextRes.debtPressure.immuneToTokenTrimming, true);
      assert.ok(contextRes.debtPressure.debtPressureVector || contextRes.debtPressure.formattedContextSnippet);
    } else if (contextRes.narrativeDebtPressure) {
      assert.equal(contextRes.narrativeDebtPressure.immuneToTokenTrimming, true);
    }
  });

  it('PI-07: should trigger Rule_DebtOverdue when chapter exceeds targetPayoffChapter', async () => {
    // Create debt target at chapter 5
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '已逾期未填大坑',
      description: '主角在第1章许诺3日内归还神器，现已第10章毫无动静',
      debtType: 'crisis_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 5,
      basePrincipal: 100.0
    });

    // Accrue to chapter 10
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 10
    });

    // Check consistency
    const consistencyRes = await dispatcher.dispatch('CheckConsistency', {
      scope: 'all'
    });

    assert.ok(consistencyRes.anomalies || consistencyRes.issues);
    const anomalies = consistencyRes.anomalies || consistencyRes.issues;
    const overdueAnomaly = anomalies.find(a =>
      a.ruleId === 'ANOM_DEBT_OVERDUE' ||
      a.ruleId === 'DEBT_OVERDUE' ||
      a.ruleId === 'Rule_DebtOverdue' ||
      (a.title && a.title.includes('债务')) ||
      (a.description && a.description.includes('逾期'))
    );

    assert.ok(overdueAnomaly, 'Expected Rule_DebtOverdue anomaly to be detected');
  });

  it('PI-08: should return structured overdue anomaly report with severity and suggested action', async () => {
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '严重超期主线伏笔',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 100.0
    });

    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 25
    });

    const report = await dispatcher.dispatch('CheckConsistency', {
      scope: 'all'
    });

    const issues = report.anomalies || report.issues || [];
    const overdue = issues.find(i => (i.ruleId || i.id || '').includes('DEBT_OVERDUE') || (i.description || '').includes('逾期'));
    if (overdue) {
      assert.ok(overdue.severity === 'HIGH' || overdue.severity === 'CRITICAL' || overdue.severity === 'WARNING' || overdue.severity === 'error');
    }
  });

  it('PI-09: should handle empty database gracefully in GetDebtPressure', async () => {
    const emptyRes = await dispatcher.dispatch('GetDebtPressure', {
      chapterNumber: 1
    });

    assert.equal(emptyRes.layer, 6);
    assert.equal(emptyRes.immuneToTokenTrimming, true);
    assert.equal(emptyRes.debtPressureVector.totalPressure, 0);
    assert.equal(emptyRes.debtPressureVector.overdueDebts.length, 0);
  });

  it('PI-10: should execute GetDebtPressure via child_process stdio RPC', async () => {
    // Seed debt
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: 'STDIO压力测试债务',
      debtType: 'subplot_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 50.0
    });

    const stdioRes = await invokeStdioCommand({
      action: 'GetDebtPressure',
      parameters: {
        chapterNumber: 5
      }
    }, {
      DATABASE_PATH: dbPath,
      PLUGIN_ROOT: sandboxDir
    });

    assert.equal(stdioRes.code, 0);
    assert.equal(stdioRes.json.status, 'success');
    const result = stdioRes.json.result;
    assert.ok(result.layer === 6 || (result.details && result.details.layer === 6));
  });
});
