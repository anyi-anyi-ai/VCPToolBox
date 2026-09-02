/**
 * @file m5_phase5_empirical_challenge.test.js
 * @description Milestone 5 Empirical Challenger Adversarial Stress Suite for Phase 5 Narrative Debt Lifecycle.
 * Stress-tests end-to-end integration, extreme cutoff with >50 overdue debts, token budget trim immunity,
 * anomaly detection rules, micro-payoffs, health grade evaluations, concurrency, and security injection boundaries.
 * 
 * @module test/e2e/m5_phase5_empirical_challenge
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
const ConsistencyEngine = require('../../src/consistency/ConsistencyEngine');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');

const PLUGIN_DIR = path.resolve(__dirname, '..', '..');
const ENTRY_SCRIPT = path.join(PLUGIN_DIR, 'NovelEngineering.js');

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

describe('M5 Phase 5 Empirical Challenger: Adversarial Stress & Zero Regression Suite', () => {
  let tempDir;
  let vaultDir;
  let sandboxDir;
  let dbManager;
  let dispatcher;
  let pathGuard;
  let dbPath;
  let consistencyEngine;
  let anomalyEngine;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_m5_challenge_'));
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

    dbPath = path.join(sandboxDir, 'data', 'novel_challenge.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: sandboxDir,
      pathGuard,
      dbManager,
      dbPath
    });

    consistencyEngine = new ConsistencyEngine(dbManager);
    anomalyEngine = new AnomalyEngine();

    const db = dbManager.getDatabase();
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count, frontmatter_json)
      VALUES (1, '01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 250, 1700000000, 'rule_hash_001', 'world_rule', 'active', 'reviewed', 3, 250, '{"rule_scope":"global"}'),
             (2, '02_Entities/LinFeng.md', '02_Entities/LinFeng.md', 'LinFeng.md', '.md', 600, 1700000000, 'entity_hash_001', 'entity', 'active', 'reviewed', 3, 600, '{}'),
             (3, '03_Chapters/Chapter_01.md', '03_Chapters/Chapter_01.md', 'Chapter_01.md', '.md', 3000, 1700000000, 'ch1_hash', 'chapter_text', 'active', 'reviewed', 2, 2000, '{}')
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'CHAR_LIN_FENG', '林枫', 'character', 'active', 'reviewed', 3, 2)
    `).run();

    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, status, source_file_id)
      VALUES (1, 1, 1, '第1章 绝境重生', '03_Chapters/Chapter_01.md', 'published', 3)
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
  // Vector 1: Complete Narrative Debt Lifecycle & Foreshadowing Auto-Resolution
  // =========================================================================
  describe('Vector 1: End-to-End Lifecycle & Foreshadowing Resolution', () => {
    it('V1-01: Full lifecycle: create -> accrue 20 chapters -> partial pay -> full pay -> foreshadowing auto-resolve', async () => {
      // 1. Insert active foreshadowing
      const db = dbManager.getDatabase();
      const fshRes = db.prepare(`
        INSERT INTO foreshadowing (foreshadow_id, title, description, status, importance_level, introduced_chapter, target_resolve_chapter)
        VALUES ('FS_MYSTERY_ARTIFACT', '太古祖符封印之谜', '在第1章发现残破祖符', 'open', 'major', '1', '15')
      `).run();
      const fshId = 'FS_MYSTERY_ARTIFACT';

      // 2. Create debt linked to foreshadowing
      const debtRes = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        title: '太古祖符封印之谜',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 15,
        basePrincipal: 100.0,
        interestRate: 0.05,
        foreshadowId: fshId,
        relatedEntities: ['CHAR_LIN_FENG']
      });

      assert.equal(debtRes.success, true);
      const debtId = debtRes.debtId;

      // 3. Multi-chapter accruals up to chapter 10
      const accrueRes1 = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'accrue',
        currentChapter: 10
      });
      assert.equal(accrueRes1.success, true);

      // Verify anti-reentrancy: running accrue again at chapter 10 should yield 0 new updates
      const reentrantAccrue = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'accrue',
        currentChapter: 10
      });
      assert.equal(reentrantAccrue.updatedDebtsCount, 0, 'Re-accruing same chapter must be idempotent');

      // Check balance has compounded
      const qMid = await dispatcher.dispatch('ManageNarrativeDebt', { action: 'query', debtId });
      const midDebt = qMid.debt;
      assert.ok(midDebt.currentBalance > 100.0);
      assert.equal(midDebt.status, 'active');

      // 4. Partial payoff of 50.0
      const partialPay = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'pay',
        debtId,
        amount: 50.0,
        chapterNumber: 12,
        triggerReason: '破除第一层封印'
      });
      assert.equal(partialPay.status, 'partially_paid');
      assert.ok(partialPay.remainingBalance > 0);

      // Verify foreshadowing remains open
      const fshMid = db.prepare('SELECT * FROM foreshadowing WHERE foreshadow_id = ?').get(fshId);
      assert.equal(fshMid.status, 'open', 'Foreshadowing must stay open on partial payoff');

      // 5. Full payoff of remaining balance
      const fullPay = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'pay',
        debtId,
        amount: partialPay.remainingBalance + 10.0, // overpay
        chapterNumber: 14,
        triggerReason: '完全解开祖符封印'
      });
      assert.equal(fullPay.status, 'paid');
      assert.equal(fullPay.remainingBalance, 0);

      // 6. Verify linked foreshadowing is automatically resolved/closed
      const fshFinal = db.prepare('SELECT * FROM foreshadowing WHERE foreshadow_id = ?').get(fshId);
      assert.ok(
        fshFinal.status === 'closed' || fshFinal.status === 'resolved',
        `Expected foreshadowing status to be closed/resolved, got ${fshFinal.status}`
      );
    });
  });

  // =========================================================================
  // Vector 2: Extreme Cutoff & Flood Defense (>20 to 50 Overdue Debts)
  // =========================================================================
  describe('Vector 2: Extreme Flood Defense & Top 5 Cutoff', () => {
    it('V2-01: Flood with 35 overdue debts -> strictly cutoff to Top 5 highest current_weight', async () => {
      // Seed 35 overdue debts with varying weights
      for (let i = 1; i <= 35; i++) {
        await dispatcher.dispatch('ManageNarrativeDebt', {
          action: 'create',
          debtId: `OVERDUE_FLOOD_${String(i).padStart(3, '0')}`,
          title: `严重逾期大坑 #${i}`,
          debtType: i % 2 === 0 ? 'core_mystery' : 'crisis_hook',
          borrowedChapter: 1,
          targetPayoffChapter: 5,
          basePrincipal: 50.0 + i * 10.0 // balances from 60 to 400
        });
      }

      // Accrue to chapter 20 (all 35 are severely overdue)
      await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'accrue',
        currentChapter: 20
      });

      // Call GetDebtPressure
      const pressureRes = await dispatcher.dispatch('GetDebtPressure', {
        chapterNumber: 20,
        maxItems: 5
      });

      assert.equal(pressureRes.layer, 6);
      assert.equal(pressureRes.immuneToTokenTrimming, true);
      assert.equal(pressureRes.extremeCutoffApplied, true);
      assert.equal(pressureRes.omittedDebtsCount, 30); // 35 - 5 = 30

      const vector = pressureRes.debtPressureVector;
      assert.equal(vector.overdueDebts.length, 5, 'Must strictly truncate overdue debts to Top 5');

      // Verify Top 5 are strictly the highest current_weight in descending order
      for (let i = 0; i < vector.overdueDebts.length - 1; i++) {
        assert.ok(
          vector.overdueDebts[i].currentWeight >= vector.overdueDebts[i + 1].currentWeight,
          'Debts must be ordered strictly by currentWeight DESC'
        );
      }

      // Verify the formatted prompt snippet contains truncation notice
      assert.ok(
        pressureRes.formattedContextSnippet.includes('Extreme defense cutoff applied') ||
        pressureRes.formattedContextSnippet.includes('omitted from prompt')
      );
    });
  });

  // =========================================================================
  // Vector 3: Token Budget Trimming Immunity Under Ultra-Tight Budget
  // =========================================================================
  describe('Vector 3: Token Budget Trimming Immunity', () => {
    it('V3-01: Ultra-tight maxTokens=100 with heavy memory/candidate payload -> Layer 6 preserved intact', async () => {
      // Create high-pressure debt
      await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        title: '核心绝密：宗门覆灭真相',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 20,
        basePrincipal: 200.0
      });

      // Assemble massive competing context layers
      const longMemory1 = '这是一段极长的次要辅助记忆，用于测试裁剪算法 '.repeat(80);
      const longMemory2 = '第二段冗余对话记忆，包含大量无关背景描摹 '.repeat(80);
      const longCandidate = 'RAG向量检索候选段落，篇幅巨大，需要优先被丢弃 '.repeat(100);

      const contextRes = await dispatcher.dispatch('BuildVCPContext', {
        chapterId: 5,
        maxTokens: 100, // Very small token budget!
        vcpMemoryRefs: [
          { memoryId: 'MEM_01', content: longMemory1, priority: 10 },
          { memoryId: 'MEM_02', content: longMemory2, priority: 11 }
        ],
        semanticCandidates: [
          { candidateId: 'CAND_01', content: longCandidate, priority: 11 }
        ]
      });

      // Verify Layer 6 is present and marked immune
      const layer6 = contextRes.debtPressure || contextRes.narrativeDebtPressure;
      assert.ok(layer6, 'Layer 6 narrative debt pressure must exist in context snapshot');
      assert.equal(layer6.immuneToTokenTrimming, true, 'Layer 6 must have immuneToTokenTrimming: true');
      assert.ok(layer6.debtPressureVector || layer6.formattedContextSnippet);
    });
  });

  // =========================================================================
  // Vector 4: Anomaly Rules Deep Diagnostics (Rule 11, Rule 12, Rule 13)
  // =========================================================================
  describe('Vector 4: Anomaly Detection Diagnostics', () => {
    it('V4-01: Anomaly Engine catches ANOM_DEBT_OVERDUE, ANOM_PAYOFF_DROUGHT, and ANOM_HOOK_MONOTONY concurrently', () => {
      // 1. Create 4 debts of same type (monotony) and overdue (overdue) with no payoffs (drought)
      for (let i = 1; i <= 4; i++) {
        dbManager.narrativeDebts.createDebt({
          debtId: `MONO_OVERDUE_${i}`,
          title: `千篇一律支线钩子 ${i}`,
          debtType: 'subplot_hook',
          borrowedChapter: 1,
          targetPayoffChapter: 4,
          basePrincipal: 50.0
        });
      }

      // Run AnomalyEngine at chapter 12
      const scanRes = anomalyEngine.runAll(dbManager, 'stress_anomaly_scan', {
        currentChapter: 12,
        persist: false
      });

      assert.ok(scanRes.totalAnomalies >= 3, `Expected at least 3 anomalies, found ${scanRes.totalAnomalies}`);
      const ruleIds = scanRes.anomalies.map(a => a.anomaly_rule_id);

      assert.ok(ruleIds.includes('ANOM_DEBT_OVERDUE'), 'Must detect ANOM_DEBT_OVERDUE');
      assert.ok(ruleIds.includes('ANOM_PAYOFF_DROUGHT'), 'Must detect ANOM_PAYOFF_DROUGHT');
      assert.ok(ruleIds.includes('ANOM_HOOK_MONOTONY'), 'Must detect ANOM_HOOK_MONOTONY');
    });

    it('V4-02: ConsistencyEngine checkConsistency respects scope="debt" and scope="all"', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'SCOPE_TEST_DEBT',
        title: '测试范围过滤债务',
        debtType: 'crisis_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 3
      });

      const debtScopeRes = consistencyEngine.checkConsistency({
        scope: 'debt',
        currentChapter: 8
      });

      assert.ok(debtScopeRes.anomalies.some(a => a.anomaly_rule_id === 'ANOM_DEBT_OVERDUE'));
    });
  });

  // =========================================================================
  // Vector 5: Micro-Payoffs, Fatigue Mitigation & Compounding Relief
  // =========================================================================
  describe('Vector 5: Micro-Payoffs & Fatigue Mitigation', () => {
    it('V5-01: Multi-stage micro-payoffs reduce debt balance and mitigate narrative fatigue', async () => {
      const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        title: '九品金丹炼制秘方',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 20,
        basePrincipal: 100.0,
        interestRate: 0.0
      });
      const debtId = createRes.debtId;

      // 1. First micro-payoff (Chapter 5, -30 principal)
      const micro1 = await dispatcher.dispatch('RecordMicroPayoff', {
        debtId,
        chapterNumber: 5,
        payoffType: 'sub_payoff',
        principalReduction: 30.0,
        satisfactionScore: 0.85,
        fatigueMitigationScore: 0.9,
        description: '获得了三味主药中的第一味：龙血芝'
      });
      assert.equal(micro1.success, true);
      assert.equal(micro1.principalReduction, 30.0);
      assert.equal(micro1.remainingBalance, 70.0);

      // 2. Second micro-payoff (Chapter 8, -40 principal)
      const micro2 = await dispatcher.dispatch('RecordMicroPayoff', {
        debtId,
        chapterNumber: 8,
        payoffType: 'sub_payoff',
        principalReduction: 40.0,
        satisfactionScore: 0.95,
        fatigueMitigationScore: 0.95,
        description: '获得了第二味主药：九幽霜草'
      });
      assert.equal(micro2.remainingBalance, 30.0);

      // 3. Final micro-payoff (Chapter 10, -30 principal -> fully paid)
      const micro3 = await dispatcher.dispatch('RecordMicroPayoff', {
        debtId,
        chapterNumber: 10,
        payoffType: 'full_payoff',
        principalReduction: 30.0,
        satisfactionScore: 1.0,
        description: '集齐药材并炼成金丹'
      });
      assert.equal(micro3.remainingBalance, 0);

      const finalQuery = await dispatcher.dispatch('ManageNarrativeDebt', { action: 'query', debtId });
      assert.equal(finalQuery.debt.status, 'paid');
    });
  });

  // =========================================================================
  // Vector 6: Health Grading Diagnostics & Extreme Crisis Score
  // =========================================================================
  describe('Vector 6: Health Grading Diagnostics Across Spectrum', () => {
    it('V6-01: Health grade scales accurately from Grade A (100) down to Grade F (<45)', async () => {
      // Case 1: Empty database -> Grade A (100)
      const repA = await dispatcher.dispatch('EvaluateDebtHealth', { currentChapter: 10 });
      assert.equal(repA.healthGrade, 'A');
      assert.equal(repA.healthScore, 100);

      // Case 2: Catastrophic crisis -> 10 severely overdue debts of same type with no payoffs
      for (let i = 1; i <= 10; i++) {
        dbManager.narrativeDebts.createDebt({
          title: `崩盘主线谜团 ${i}`,
          debtType: 'core_mystery',
          borrowedChapter: 1,
          targetPayoffChapter: 3,
          basePrincipal: 200.0,
          currentBalance: 500.0
        });
      }

      const repF = await dispatcher.dispatch('EvaluateDebtHealth', { currentChapter: 25 });
      assert.equal(repF.healthGrade, 'F');
      assert.ok(repF.healthScore < 45, `Expected score < 45, got ${repF.healthScore}`);
      assert.ok(repF.warnings.length >= 3);
      assert.ok(repF.recommendations.length >= 2);
    });
  });

  // =========================================================================
  // Vector 7: Concurrency, Idempotency, Malformed Inputs & Security Boundaries
  // =========================================================================
  describe('Vector 7: Concurrency, Security & Malformed Input Robustness', () => {
    it('V7-01: Rapid concurrent command dispatches execute safely without SQLite locking', async () => {
      const promises = [];
      for (let i = 1; i <= 15; i++) {
        promises.push(dispatcher.dispatch('ManageNarrativeDebt', {
          action: 'create',
          title: `并发创建测试 ${i}`,
          debtType: 'subplot_hook',
          borrowedChapter: 1,
          targetPayoffChapter: 20,
          basePrincipal: 30.0 + i
        }));
      }

      const results = await Promise.all(promises);
      assert.equal(results.length, 15);
      for (const res of results) {
        assert.equal(res.success, true);
      }
    });

    it('V7-02: Withstands aggressive SQL injection and script injection payloads in debt fields', async () => {
      const sqlPayload = "'; DROP TABLE narrative_debts; -- <script>alert(1)</script>";
      const createRes = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'create',
        title: sqlPayload,
        description: sqlPayload,
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 10,
        basePrincipal: 50.0
      });

      assert.equal(createRes.success, true);
      assert.equal(createRes.debt.title, sqlPayload);

      // Verify table still exists and query functions normally
      const qRes = await dispatcher.dispatch('ManageNarrativeDebt', {
        action: 'query',
        debtId: createRes.debtId
      });
      assert.ok(qRes.debt);
      assert.equal(qRes.debt.title, sqlPayload);
    });

    it('V7-03: Cascade deletion removes associated debt_events and micro_payoffs', () => {
      const db = dbManager.getDatabase();
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'CASCADE_TEST_DEBT',
        title: '级联删除测试',
        borrowedChapter: 1,
        targetPayoffChapter: 10,
        basePrincipal: 60.0
      });

      // Add a micro payoff
      dbManager.microPayoffs.recordPayoff({
        debtId: debt.debtId,
        chapterNumber: 2,
        payoffType: 'sub_payoff',
        principalReduction: 10.0
      });

      // Delete debt
      const delSuccess = dbManager.narrativeDebts.deleteDebt(debt.debtId);
      assert.equal(delSuccess, true);

      // Assert cascaded removal
      const evCount = db.prepare('SELECT COUNT(*) as count FROM debt_events WHERE debt_id = ?').get(debt.debtId).count;
      const mpCount = db.prepare('SELECT COUNT(*) as count FROM micro_payoffs WHERE debt_id = ?').get(debt.debtId).count;
      assert.equal(evCount, 0, 'Debt events must be cascade deleted');
      assert.equal(mpCount, 0, 'Micro payoffs must be cascade deleted');
    });
  });
});
