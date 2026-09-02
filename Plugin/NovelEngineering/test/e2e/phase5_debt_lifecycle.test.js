/**
 * @file phase5_debt_lifecycle.test.js
 * @description Phase 5 Narrative Debt Lifecycle E2E Test Suite (Tier 1 & Tier 2)
 * Tests creation, interest accrual, partial & full payoffs, overdue warnings,
 * summary calculations, boundary checks, and audit logging in debt_events.
 * 
 * @module test/e2e/phase5_debt_lifecycle
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

describe('Phase 5: Narrative Debt Lifecycle E2E Suite (Tier 1 & Tier 2)', () => {
  let tempDir;
  let vaultDir;
  let sandboxDir;
  let dbManager;
  let dispatcher;
  let pathGuard;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_p5_lifecycle_'));
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
  // Tier 1: Primary Functional Paths (DLC-01 to DLC-06)
  // =========================================================================

  it('DLC-01: should create narrative debts with distinct debt types and initialize balances', async () => {
    // 1. Create a core_mystery debt
    const mysteryRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '皇帝遇刺之谜',
      description: '老皇帝在密室被刺杀，凶手留下黑日徽章',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 50,
      basePrincipal: 100.0,
      interestRate: 0.05,
      relatedEntities: ['CHAR_EMPEROR', 'FACTION_BLACK_SUN']
    });

    assert.equal(mysteryRes.success, true);
    assert.ok(mysteryRes.debtId);
    assert.equal(mysteryRes.debt.title, '皇帝遇刺之谜');
    assert.equal(mysteryRes.debt.debtType, 'core_mystery');
    assert.equal(mysteryRes.debt.borrowedChapter, 1);
    assert.equal(mysteryRes.debt.targetPayoffChapter, 50);
    assert.equal(mysteryRes.debt.basePrincipal, 100.0);
    assert.equal(mysteryRes.debt.currentBalance, 100.0);
    assert.equal(mysteryRes.debt.status, 'active');
    assert.equal(mysteryRes.debt.accruedChapters, 0);

    // 2. Create a subplot_hook debt
    const hookRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '酒馆密信线索',
      description: '接头人给出的半张残卷',
      debtType: 'subplot_hook',
      borrowedChapter: 3,
      targetPayoffChapter: 15,
      basePrincipal: 30.0,
      interestRate: 0.08
    });

    assert.equal(hookRes.success, true);
    assert.ok(hookRes.debtId);
    assert.equal(hookRes.debt.debtType, 'subplot_hook');
    assert.equal(hookRes.debt.basePrincipal, 30.0);

    // 3. Create a crisis_hook debt with linked foreshadow_id
    const crisisRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '边境虫潮突袭危机',
      description: '第三防线侦测到超大规模虫族迁徙',
      debtType: 'crisis_hook',
      borrowedChapter: 5,
      targetPayoffChapter: 10,
      basePrincipal: 50.0,
      foreshadowId: 'FS_BUG_INVASION_01'
    });

    assert.equal(crisisRes.success, true);
    assert.equal(crisisRes.debt.foreshadowId, 'FS_BUG_INVASION_01');
    assert.equal(crisisRes.debt.status, 'active');
  });

  it('DLC-02: should accrue interest over sequential chapters and update balances', async () => {
    // Setup: Create debts at Chapter 1
    const d1 = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '身世血脉诅咒',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 20,
      basePrincipal: 100.0,
      interestRate: 0.05
    });

    const d2 = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '神秘刺客的佩刀',
      debtType: 'subplot_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 5,
      basePrincipal: 40.0,
      interestRate: 0.10
    });

    // Accrue at chapter 3 (2 chapters of interest accrued)
    const accrueRes1 = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 3
    });

    assert.equal(accrueRes1.success, true);
    assert.equal(accrueRes1.currentChapter, 3);
    assert.ok(accrueRes1.updatedDebtsCount >= 2);
    assert.ok(accrueRes1.totalAccruedPressure > 0);

    // Verify updated debt 1 balance
    const q1 = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId: d1.debtId
    });
    const debt1 = q1.debts ? q1.debts[0] : q1.debt;
    assert.ok(debt1);
    assert.equal(debt1.accruedChapters, 2);
    assert.ok(debt1.currentBalance > 100.0, `Expected balance > 100, got ${debt1.currentBalance}`);

    // Accrue to chapter 6 (target for d2 was 5 -> now newly overdue!)
    const accrueRes2 = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 6
    });

    assert.equal(accrueRes2.success, true);
    assert.ok(accrueRes2.newlyOverdueCount >= 1 || accrueRes2.overdueCount >= 1);

    // Verify debt 2 reflects overdue / elevated balance
    const q2 = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId: d2.debtId
    });
    const debt2 = q2.debts ? q2.debts[0] : q2.debt;
    assert.ok(debt2);
    assert.equal(debt2.accruedChapters, 5);
    assert.ok(debt2.currentBalance > 40.0);
  });

  it('DLC-03: should execute partial payoff and transition status to partially_paid', async () => {
    const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '上古神器符文',
      debtType: 'subplot_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 20,
      basePrincipal: 100.0,
      interestRate: 0.0
    });

    const debtId = createRes.debtId;

    // Partial payoff of 40.0 at chapter 5
    const payRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      amount: 40.0,
      chapterNumber: 5,
      triggerReason: '主角破译了第一段符文密码'
    });

    assert.equal(payRes.success, true);
    assert.equal(payRes.debtId, debtId);
    assert.equal(payRes.status, 'partially_paid');
    assert.equal(payRes.remainingBalance, 60.0);

    // Verify query returns updated status
    const queryRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId
    });
    const debt = queryRes.debts ? queryRes.debts[0] : queryRes.debt;
    assert.equal(debt.status, 'partially_paid');
    assert.equal(debt.currentBalance, 60.0);
  });

  it('DLC-04: should execute full payoff and transition status to paid with zero balance', async () => {
    const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '密宗叛徒的真实身份',
      debtType: 'subplot_hook',
      borrowedChapter: 2,
      targetPayoffChapter: 10,
      basePrincipal: 50.0,
      interestRate: 0.0
    });

    const debtId = createRes.debtId;

    // Full payoff at chapter 9
    const payRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      amount: 50.0,
      chapterNumber: 9,
      triggerReason: '叛徒在断崖被当场揭穿伏诛'
    });

    assert.equal(payRes.success, true);
    assert.equal(payRes.status, 'paid');
    assert.equal(payRes.remainingBalance, 0);

    // Query paid debt
    const queryRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId
    });
    const debt = queryRes.debts ? queryRes.debts[0] : queryRes.debt;
    assert.equal(debt.status, 'paid');
    assert.equal(debt.currentBalance, 0);
  });

  it('DLC-05: should query debts with diverse filter combinations', async () => {
    // Create multiple debts
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '主线谜题A',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 50,
      basePrincipal: 100.0,
      relatedEntities: ['ENT_ALPHA']
    });

    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '支线钩子B',
      debtType: 'subplot_hook',
      borrowedChapter: 2,
      targetPayoffChapter: 10,
      basePrincipal: 30.0,
      relatedEntities: ['ENT_BETA']
    });

    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '危机钩子C',
      debtType: 'crisis_hook',
      borrowedChapter: 3,
      targetPayoffChapter: 8,
      basePrincipal: 40.0,
      relatedEntities: ['ENT_ALPHA']
    });

    // 1. Query by debtType
    const mysteryQuery = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtType: 'core_mystery'
    });
    assert.ok(mysteryQuery.debts.length >= 1);
    assert.equal(mysteryQuery.debts[0].debtType, 'core_mystery');

    // 2. Query by entity
    const entityQuery = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      entityId: 'ENT_ALPHA'
    });
    assert.ok(entityQuery.debts.length >= 2);

    // 3. Query all active
    const activeQuery = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      status: 'active'
    });
    assert.ok(activeQuery.debts.length >= 3);
  });

  it('DLC-06: should compute aggregate summary with health and balance metrics', async () => {
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '债务1',
      debtType: 'core_mystery',
      borrowedChapter: 1,
      targetPayoffChapter: 30,
      basePrincipal: 100.0
    });

    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '债务2',
      debtType: 'crisis_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 5,
      basePrincipal: 50.0
    });

    // Accrue to chapter 10 (debt2 becomes overdue)
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 10
    });

    const summary = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'summary',
      currentChapter: 10
    });

    assert.equal(summary.totalActiveDebts, 2);
    assert.equal(summary.totalPrincipal, 150.0);
    assert.ok(summary.totalCurrentBalance >= 150.0);
    assert.ok(summary.overdueCount >= 1);
    assert.ok(typeof summary.averagePressure === 'number');
    assert.ok(summary.healthIndex !== undefined);
  });

  // =========================================================================
  // Tier 2: Boundary Value Analysis & Error Handling (DLC-07 to DLC-14)
  // =========================================================================

  it('DLC-07: should reject invalid create payloads with descriptive errors', async () => {
    // Missing title
    await assert.rejects(async () => {
      await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        debtType: 'core_mystery'
      });
    }, /title|required/i);

    // Invalid target chapter (target <= borrowed)
    await assert.rejects(async () => {
      await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        title: '逆向时间债务',
        borrowedChapter: 10,
        targetPayoffChapter: 5
      });
    }, /target.*chapter|invalid|chapter/i);

    // Negative principal
    await assert.rejects(async () => {
      await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        title: '负数本金债务',
        basePrincipal: -50.0
      });
    }, /principal|positive|invalid/i);
  });

  it('DLC-08: should handle overdue debts with escalating pressure calculations', async () => {
    const res = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '紧急定时炸弹钩子',
      debtType: 'crisis_hook',
      borrowedChapter: 1,
      targetPayoffChapter: 5,
      basePrincipal: 100.0,
      interestRate: 0.10
    });

    // Accrue to chapter 15 (10 chapters past target payoff chapter)
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 15
    });

    const queryRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId: res.debtId
    });

    const debt = queryRes.debts ? queryRes.debts[0] : queryRes.debt;
    assert.ok(debt);
    assert.ok(debt.accruedChapters >= 14);
    // Overdue balance should be significantly higher than initial principal
    assert.ok(debt.currentBalance > 150.0, `Expected balance > 150, got ${debt.currentBalance}`);
  });

  it('DLC-09: should clamp payoff amount when payment exceeds remaining balance', async () => {
    const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '小额线索债务',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 20.0,
      interestRate: 0.0
    });

    const debtId = createRes.debtId;

    // Overpay with 100.0 on a 20.0 debt
    const payRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      amount: 100.0,
      chapterNumber: 2
    });

    assert.equal(payRes.success, true);
    assert.equal(payRes.status, 'paid');
    assert.equal(payRes.remainingBalance, 0);

    const queryRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId
    });
    const debt = queryRes.debts ? queryRes.debts[0] : queryRes.debt;
    assert.equal(debt.currentBalance, 0);
    assert.equal(debt.status, 'paid');
  });

  it('DLC-10: should reject payoff on non-existent debtId', async () => {
    await assert.rejects(async () => {
      await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'pay',
        debtId: 'NON_EXISTENT_DEBT_9999',
        amount: 50.0
      });
    }, /not found|non-existent|invalid/i);
  });

  it('DLC-11: should handle idempotent payoff on already paid debt safely', async () => {
    const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '单次付清债务',
      borrowedChapter: 1,
      targetPayoffChapter: 5,
      basePrincipal: 50.0,
      interestRate: 0.0
    });

    const debtId = createRes.debtId;

    // First pay
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      amount: 50.0,
      chapterNumber: 2
    });

    // Second pay on already paid debt
    const secondPay = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      amount: 10.0,
      chapterNumber: 3
    });

    assert.equal(secondPay.status, 'paid');
    assert.equal(secondPay.remainingBalance, 0);
  });

  it('DLC-12: should maintain constant balance when interest rate is zero', async () => {
    const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '零利息固定背景设定',
      debtType: 'world_lore',
      borrowedChapter: 1,
      targetPayoffChapter: 100,
      basePrincipal: 77.5,
      interestRate: 0.0
    });

    // Accrue across 30 chapters
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 30
    });

    const queryRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'query',
      debtId: createRes.debtId
    });
    const debt = queryRes.debts ? queryRes.debts[0] : queryRes.debt;
    assert.equal(debt.currentBalance, 77.5);
    assert.equal(debt.accruedChapters, 29);
  });

  it('DLC-13: should record complete immutable event audit trail in debt_events', async () => {
    const db = dbManager.getDatabase();

    // 1. Create debt
    const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'create',
      title: '事件追踪测试债务',
      borrowedChapter: 1,
      targetPayoffChapter: 10,
      basePrincipal: 100.0,
      interestRate: 0.05
    });
    const debtId = createRes.debtId;

    // 2. Accrue interest
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'accrue',
      currentChapter: 4
    });

    // 3. Partial pay
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      amount: 30.0,
      chapterNumber: 5,
      triggerReason: '获得部分线索'
    });

    // 4. Final pay
    await dispatcher.dispatch('ManageNarrativeDebt', {
      action: 'pay',
      debtId,
      chapterNumber: 8,
      triggerReason: '彻底解开谜题'
    });

    // Query debt_events table directly
    const events = db.prepare('SELECT * FROM debt_events WHERE debt_id = ? ORDER BY id ASC').all(debtId);

    assert.ok(events.length >= 3, `Expected at least 3 events, found ${events.length}`);
    const eventTypes = events.map(e => e.event_type);
    assert.ok(eventTypes.includes('create') || eventTypes.includes('borrow'));
    assert.ok(eventTypes.includes('pay') || eventTypes.includes('payoff') || eventTypes.includes('partial_pay'));
  });

  it('DLC-14: should execute ManageNarrativeDebt commands via child_process stdio RPC', async () => {
    // 1. Test ping via stdio
    const pingRes = await invokeStdioCommand({
      action: 'ping'
    }, {
      DATABASE_PATH: dbPath,
      PLUGIN_ROOT: sandboxDir
    });

    assert.equal(pingRes.code, 0);
    assert.equal(pingRes.json.status, 'success');

    // 2. Test ManageNarrativeDebt create via stdio
    const createStdio = await invokeStdioCommand({
      action: 'ManageNarrativeDebt',
      parameters: {
        action: 'create',
        title: 'STDIO命令行测试债务',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 20,
        basePrincipal: 80.0
      }
    }, {
      DATABASE_PATH: dbPath,
      PLUGIN_ROOT: sandboxDir
    });

    assert.equal(createStdio.code, 0);
    assert.equal(createStdio.json.status, 'success');
    assert.ok(createStdio.json.result.debtId || createStdio.json.result.details.debtId);
  });
});
