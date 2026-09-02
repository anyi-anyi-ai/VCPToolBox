/**
 * @file evaluateDebtHealth.test.js
 * @description Comprehensive unit test suite for Phase 5 Milestone 4:
 * Narrative Debt Health Evaluation, Consistency Rules (Rule11_DebtOverdue, Rule12_PayoffDrought, Rule13_HookMonotony),
 * AnomalyEngine integration, ConsistencyEngine Dimension 5, and EvaluateDebtHealth command.
 * 
 * @module test/unit/evaluateDebtHealth
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const ConsistencyEngine = require('../../src/consistency/ConsistencyEngine');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');
const Rule11 = require('../../src/anomaly/rules/Rule11_DebtOverdue');
const Rule12 = require('../../src/anomaly/rules/Rule12_PayoffDrought');
const Rule13 = require('../../src/anomaly/rules/Rule13_HookMonotony');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');

describe('Phase 5 Milestone 4: Narrative Debt Health & Consistency Rules Unit Suite', () => {
  let dbManager;
  let dispatcher;
  let consistencyEngine;
  let anomalyEngine;

  beforeEach(() => {
    dbManager = DatabaseManager.initDatabase(':memory:');
    dispatcher = new CommandDispatcher({ dbManager });
    consistencyEngine = new ConsistencyEngine(dbManager);
    anomalyEngine = new AnomalyEngine();

    const db = dbManager.getDatabase();

    // Standard seed data for chapters and source files
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, '01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 250, 1700000000, 'h1', 'world_rule', 'active', 'reviewed', 3, 250),
             (2, '03_Chapters/Chapter_01.md', '03_Chapters/Chapter_01.md', 'Chapter_01.md', '.md', 3000, 1700000000, 'h2', 'chapter_text', 'active', 'reviewed', 2, 2000),
             (3, '03_Chapters/Chapter_10.md', '03_Chapters/Chapter_10.md', 'Chapter_10.md', '.md', 3000, 1700000000, 'h3', 'chapter_text', 'active', 'reviewed', 2, 2000)
    `).run();

    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, status, source_file_id)
      VALUES (1, 1, 1, '第1章 启程', '03_Chapters/Chapter_01.md', 'published', 2),
             (2, 10, 1, '第10章 风暴', '03_Chapters/Chapter_10.md', 'published', 3)
    `).run();
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // =========================================================================
  // Section 1: Rule 11 (Rule11_DebtOverdue) Tests
  // =========================================================================
  describe('Rule 11: Rule11_DebtOverdue', () => {
    it('R11-01: should detect overdue debt when current chapter exceeds target_payoff_chapter', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_OVERDUE_01',
        title: '迟迟未解的灭门惨案',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 5,
        basePrincipal: 50.0
      });

      const anomalies = Rule11.detect(dbManager, 'test_r11', { currentChapter: 8 });
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_DEBT_OVERDUE');
      assert.equal(anomalies[0].severity, 'HIGH');
      assert.equal(anomalies[0].details_json.debtId, 'DEBT_OVERDUE_01');
      assert.equal(anomalies[0].details_json.overdueChapters, 3);
    });

    it('R11-02: should assign CRITICAL severity for overdue core_mystery debts', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_CORE_OVERDUE',
        title: '核心主线大结局之谜',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 6,
        basePrincipal: 100.0
      });

      const anomalies = Rule11.detect(dbManager, 'test_r11', { currentChapter: 7 });
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].severity, 'CRITICAL');
    });

    it('R11-03: should assign CRITICAL severity when debt is overdue by >= 5 chapters', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_LONG_OVERDUE',
        title: '遗忘在旧村庄的宝剑',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 4,
        basePrincipal: 30.0
      });

      const anomalies = Rule11.detect(dbManager, 'test_r11', { currentChapter: 12 });
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].severity, 'CRITICAL');
      assert.equal(anomalies[0].details_json.overdueChapters, 8);
    });

    it('R11-04: should return empty anomalies array when all debts are within planned target chapter', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_ON_TIME',
        title: '按计划推进中的支线',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 20,
        basePrincipal: 50.0
      });

      const anomalies = Rule11.detect(dbManager, 'test_r11', { currentChapter: 10 });
      assert.equal(anomalies.length, 0);
    });

    it('R11-05: should ignore paid and closed debts even if chapter is past target', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_PAID_EARLY',
        title: '已完结的悬念',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 5,
        basePrincipal: 50.0
      });

      dbManager.narrativeDebts.applyPayoff(debt.debtId, 50.0, { chapterNumber: 4 });

      const anomalies = Rule11.detect(dbManager, 'test_r11', { currentChapter: 10 });
      assert.equal(anomalies.length, 0);
    });
  });

  // =========================================================================
  // Section 2: Rule 12 (Rule12_PayoffDrought) Tests
  // =========================================================================
  describe('Rule 12: Rule12_PayoffDrought', () => {
    it('R12-01: should detect payoff drought when continuous chapters >= 5 have zero payoffs', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_ACTIVE_1',
        title: '漫长无兑现的主线',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 30,
        basePrincipal: 100.0
      });

      const anomalies = Rule12.detect(dbManager, 'test_r12', {
        currentChapter: 7,
        droughtThreshold: 5
      });

      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_PAYOFF_DROUGHT');
      assert.equal(anomalies[0].severity, 'MEDIUM');
      assert.ok(anomalies[0].details_json.chaptersSinceLastPayoff >= 5);
    });

    it('R12-02: should assign HIGH severity for prolonged drought >= 10 chapters', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_DROUGHT_LONG',
        title: '极度枯燥无反馈期',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 30,
        basePrincipal: 80.0
      });

      const anomalies = Rule12.detect(dbManager, 'test_r12', {
        currentChapter: 15,
        droughtThreshold: 5
      });

      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].severity, 'HIGH');
      assert.ok(anomalies[0].details_json.chaptersSinceLastPayoff >= 10);
    });

    it('R12-03: should reset drought when micro_payoffs exist in recent chapters', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_WITH_MICRO',
        title: '有阶段性反馈的剧情',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 30,
        basePrincipal: 100.0
      });

      // Record micro-payoff at chapter 6
      dbManager.microPayoffs.recordPayoff({
        debtId: debt.debtId,
        chapterNumber: 6,
        payoffType: 'clue_revealed',
        principalReduction: 10.0,
        description: '揭示了部分线索'
      });

      // At chapter 8, chaptersSinceLastPayoff = 2 < 5
      const anomalies = Rule12.detect(dbManager, 'test_r12', {
        currentChapter: 8,
        droughtThreshold: 5
      });

      assert.equal(anomalies.length, 0);
    });

    it('R12-04: should return empty anomalies when there are zero active debts', () => {
      // Empty database
      const anomalies = Rule12.detect(dbManager, 'test_r12', {
        currentChapter: 10,
        droughtThreshold: 5
      });

      assert.equal(anomalies.length, 0);
    });
  });

  // =========================================================================
  // Section 3: Rule 13 (Rule13_HookMonotony) Tests
  // =========================================================================
  describe('Rule 13: Rule13_HookMonotony', () => {
    it('R13-01: should detect monotony when > 60% of active debts are of the same type (>= 3 debts)', () => {
      // 4 subplot_hook and 1 core_mystery (4/5 = 80% > 60%)
      for (let i = 1; i <= 4; i++) {
        dbManager.narrativeDebts.createDebt({
          debtId: `DEBT_HOOK_${i}`,
          title: `重复的支线悬念 ${i}`,
          debtType: 'subplot_hook',
          borrowedChapter: 1,
          targetPayoffChapter: 20
        });
      }
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT_CORE_1',
        title: '唯一的主线谜题',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 30
      });

      const anomalies = Rule13.detect(dbManager, 'test_r13', {
        monotonyThreshold: 0.60,
        minDebtsForMonotony: 3
      });

      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_HOOK_MONOTONY');
      assert.equal(anomalies[0].details_json.dominantType, 'subplot_hook');
      assert.equal(anomalies[0].details_json.dominantCount, 4);
      assert.equal(anomalies[0].details_json.totalActiveDebts, 5);
      assert.equal(anomalies[0].details_json.monotonyRatio, 0.8);
    });

    it('R13-02: should return empty when hook types are well-diversified', () => {
      // 1 core_mystery, 1 subplot_hook, 1 crisis_hook, 1 character_promise (25% each)
      dbManager.narrativeDebts.createDebt({ title: '主线', debtType: 'core_mystery', targetPayoffChapter: 20 });
      dbManager.narrativeDebts.createDebt({ title: '支线', debtType: 'subplot_hook', targetPayoffChapter: 20 });
      dbManager.narrativeDebts.createDebt({ title: '危机', debtType: 'crisis_hook', targetPayoffChapter: 20 });
      dbManager.narrativeDebts.createDebt({ title: '承诺', debtType: 'character_promise', targetPayoffChapter: 20 });

      const anomalies = Rule13.detect(dbManager, 'test_r13', {
        monotonyThreshold: 0.60
      });

      assert.equal(anomalies.length, 0);
    });

    it('R13-03: should not trigger monotony when total active debts < 3', () => {
      // 2 debts of same type
      dbManager.narrativeDebts.createDebt({ title: '钩子1', debtType: 'subplot_hook', targetPayoffChapter: 20 });
      dbManager.narrativeDebts.createDebt({ title: '钩子2', debtType: 'subplot_hook', targetPayoffChapter: 20 });

      const anomalies = Rule13.detect(dbManager, 'test_r13', {
        monotonyThreshold: 0.60,
        minDebtsForMonotony: 3
      });

      assert.equal(anomalies.length, 0);
    });
  });

  // =========================================================================
  // Section 4: AnomalyEngine Integration Tests
  // =========================================================================
  describe('AnomalyEngine Integration with Rules 11, 12, 13', () => {
    it('AE-01: should register Rule11, Rule12, and Rule13 in AnomalyEngine', () => {
      const registered = anomalyEngine.getRegisteredRules();
      const ruleIds = registered.map(r => r.id);

      assert.ok(ruleIds.includes('ANOM_DEBT_OVERDUE'));
      assert.ok(ruleIds.includes('ANOM_PAYOFF_DROUGHT'));
      assert.ok(ruleIds.includes('ANOM_HOOK_MONOTONY'));
    });

    it('AE-02: should run individual rules by ID via AnomalyEngine.runRule', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'AE_OVERDUE_DEBT',
        title: '测试单独执行规则',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 3
      });

      const r11Res = anomalyEngine.runRule('ANOM_DEBT_OVERDUE', dbManager, 'session_ae', { currentChapter: 6 });
      assert.equal(r11Res.length, 1);
      assert.equal(r11Res[0].anomaly_rule_id, 'ANOM_DEBT_OVERDUE');
    });

    it('AE-03: should run all registered rules and compute breakdown', () => {
      // Create debts triggering both overdue and drought
      dbManager.narrativeDebts.createDebt({
        debtId: 'AE_MULTI_1',
        title: '逾期主线',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 3
      });
      dbManager.narrativeDebts.createDebt({
        debtId: 'AE_MULTI_2',
        title: '逾期支线',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 4
      });

      const summary = anomalyEngine.runAll(dbManager, 'session_all', {
        currentChapter: 10,
        persist: false
      });

      assert.ok(summary.totalAnomalies >= 2);
      assert.ok(summary.breakdown.CRITICAL >= 1 || summary.breakdown.HIGH >= 1);
      const ruleIds = summary.anomalies.map(a => a.anomaly_rule_id);
      assert.ok(ruleIds.includes('ANOM_DEBT_OVERDUE'));
      assert.ok(ruleIds.includes('ANOM_PAYOFF_DROUGHT'));
    });
  });

  // =========================================================================
  // Section 5: ConsistencyEngine Dimension 5 Health Evaluation Tests
  // =========================================================================
  describe('ConsistencyEngine Dimension 5 Health Evaluation & Grades', () => {
    it('CE-01: should return Grade A (100 score) when there are zero debts', () => {
      const report = consistencyEngine.evaluateDebtHealth({ currentChapter: 10 });

      assert.equal(report.success, true);
      assert.equal(report.healthGrade, 'A');
      assert.equal(report.healthScore, 100);
      assert.equal(report.metrics.totalActiveDebts, 0);
      assert.equal(report.metrics.totalOverdueDebts, 0);
      assert.equal(report.warnings.length, 0);
      assert.ok(report.recommendations.length > 0);
    });

    it('CE-02: should return Grade A when debts are healthy with recent payoffs and diversity', () => {
      // Create 3 diverse active debts with high target chapters
      const d1 = dbManager.narrativeDebts.createDebt({ title: '主线A', debtType: 'core_mystery', borrowedChapter: 5, targetPayoffChapter: 30 });
      dbManager.narrativeDebts.createDebt({ title: '支线B', debtType: 'subplot_hook', borrowedChapter: 6, targetPayoffChapter: 25 });
      dbManager.narrativeDebts.createDebt({ title: '危机C', debtType: 'crisis_hook', borrowedChapter: 7, targetPayoffChapter: 20 });

      // Record micro-payoff at chapter 9
      dbManager.microPayoffs.recordPayoff({
        debtId: d1.debtId,
        chapterNumber: 9,
        payoffType: 'clue_revealed',
        principalReduction: 10.0
      });

      const report = consistencyEngine.evaluateDebtHealth({ currentChapter: 10 });

      assert.equal(report.healthGrade, 'A');
      assert.ok(report.healthScore >= 90);
      assert.equal(report.metrics.totalOverdueDebts, 0);
      assert.equal(report.metrics.isPayoffDrought, false);
      assert.equal(report.warnings.length, 0);
    });

    it('CE-03: should return Grade B or C when single minor delay or drought occurs', () => {
      // 2 active debts, 1 slightly overdue
      dbManager.narrativeDebts.createDebt({
        title: '稍逾期支线',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 5,
        basePrincipal: 30.0
      });
      dbManager.narrativeDebts.createDebt({
        title: '正常主线',
        debtType: 'core_mystery',
        borrowedChapter: 1,
        targetPayoffChapter: 20,
        basePrincipal: 100.0
      });

      // Chapter 7: 1 overdue debt (overdueRatio = 0.5), drought = 6 >= 5
      const report = consistencyEngine.evaluateDebtHealth({ currentChapter: 7 });

      assert.ok(report.healthGrade === 'B' || report.healthGrade === 'C');
      assert.ok(report.healthScore >= 60 && report.healthScore < 90);
      assert.equal(report.metrics.totalOverdueDebts, 1);
      assert.ok(report.warnings.length >= 1);
    });

    it('CE-04: should return Grade D when multiple overdue debts and drought exist', () => {
      // 3 active debts, 2 overdue, prolonged drought
      dbManager.narrativeDebts.createDebt({ title: '逾期1', debtType: 'subplot_hook', borrowedChapter: 1, targetPayoffChapter: 4 });
      dbManager.narrativeDebts.createDebt({ title: '逾期2', debtType: 'crisis_hook', borrowedChapter: 1, targetPayoffChapter: 5 });
      dbManager.narrativeDebts.createDebt({ title: '正常3', debtType: 'core_mystery', borrowedChapter: 1, targetPayoffChapter: 20 });

      const report = consistencyEngine.evaluateDebtHealth({ currentChapter: 10 });

      assert.equal(report.healthGrade, 'D');
      assert.ok(report.healthScore >= 45 && report.healthScore < 60);
      assert.equal(report.metrics.totalOverdueDebts, 2);
      assert.equal(report.metrics.isPayoffDrought, true);
    });

    it('CE-05: should return Grade F (< 45 score) under critical debt crisis', () => {
      // 5 debts, all overdue, extreme core_mystery overdue, extreme monotony, prolonged drought
      for (let i = 1; i <= 5; i++) {
        dbManager.narrativeDebts.createDebt({
          title: `严重逾期核心谜题 ${i}`,
          debtType: 'core_mystery',
          borrowedChapter: 1,
          targetPayoffChapter: 3,
          basePrincipal: 100.0,
          currentBalance: 300.0
        });
      }

      const report = consistencyEngine.evaluateDebtHealth({ currentChapter: 20 });

      assert.equal(report.healthGrade, 'F');
      assert.ok(report.healthScore < 45);
      assert.equal(report.metrics.totalActiveDebts, 5);
      assert.equal(report.metrics.totalOverdueDebts, 5);
      assert.equal(report.metrics.overdueRatio, 1.0);
      assert.equal(report.metrics.isPayoffDrought, true);
      assert.ok(report.warnings.length >= 3);
    });

    it('CE-06: should invoke _checkNarrativeDebtHealth alias smoothly', () => {
      const aliasReport = consistencyEngine._checkNarrativeDebtHealth({ currentChapter: 5 });
      assert.equal(aliasReport.success, true);
      assert.ok(aliasReport.healthGrade);
      assert.ok(typeof aliasReport.healthScore === 'number');
    });

    it('CE-07: should include narrative debt anomalies when checkConsistency scope is "all" or "debt"', () => {
      dbManager.narrativeDebts.createDebt({
        title: '一致性扫描逾期债务',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 3
      });

      const allRes = consistencyEngine.checkConsistency({ scope: 'all', currentChapter: 8 });
      const debtAnoms = allRes.anomalies.filter(a => a.anomaly_rule_id === 'ANOM_DEBT_OVERDUE');
      assert.ok(debtAnoms.length >= 1);

      const debtScopeRes = consistencyEngine.checkConsistency({ scope: 'debt', currentChapter: 8 });
      assert.ok(debtScopeRes.anomalies.some(a => a.anomaly_rule_id === 'ANOM_DEBT_OVERDUE'));
    });
  });

  // =========================================================================
  // Section 6: CommandDispatcher & ConsistencyCommands Tests
  // =========================================================================
  describe('Command: EvaluateDebtHealth via CommandDispatcher', () => {
    it('CMD-01: should execute EvaluateDebtHealth via CommandDispatcher and return structured report', async () => {
      dbManager.narrativeDebts.createDebt({
        title: '指令测试债务',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 5
      });

      const res = await dispatcher.dispatch('EvaluateDebtHealth', {
        currentChapter: 8
      });

      assert.equal(res.status, 'success');
      assert.equal(res.command, 'EvaluateDebtHealth');
      assert.ok(['A', 'B', 'C', 'D', 'F'].includes(res.healthGrade));
      assert.ok(typeof res.healthScore === 'number');
      assert.ok(res.metrics);
      assert.equal(res.metrics.totalActiveDebts, 1);
      assert.equal(res.metrics.totalOverdueDebts, 1);
      assert.ok(Array.isArray(res.warnings));
      assert.ok(Array.isArray(res.recommendations));
      assert.ok(typeof res.content === 'string');
      assert.ok(res.content.includes('Narrative Debt Health Diagnostic Report'));
    });

    it('CMD-02: should filter by projectId in EvaluateDebtHealth command', async () => {
      // Debt for project A
      dbManager.narrativeDebts.createDebt({
        projectId: 'project_A',
        title: '项目A专属债务',
        debtType: 'core_mystery',
        borrowedChapter: 8,
        targetPayoffChapter: 20
      });

      // Debt for project B
      dbManager.narrativeDebts.createDebt({
        projectId: 'project_B',
        title: '项目B专属债务',
        debtType: 'subplot_hook',
        borrowedChapter: 1,
        targetPayoffChapter: 5
      });

      const reportA = await dispatcher.dispatch('EvaluateDebtHealth', {
        projectId: 'project_A',
        currentChapter: 10
      });

      assert.equal(reportA.metrics.totalActiveDebts, 1);
      assert.equal(reportA.metrics.totalOverdueDebts, 0);
      assert.equal(reportA.healthGrade, 'A');

      const reportB = await dispatcher.dispatch('EvaluateDebtHealth', {
        projectId: 'project_B',
        currentChapter: 10
      });

      assert.equal(reportB.metrics.totalActiveDebts, 1);
      assert.equal(reportB.metrics.totalOverdueDebts, 1);
    });

    it('CMD-03: should accept custom droughtThreshold and monotonyThreshold options', async () => {
      // 3 active debts of same type at chapter 4 (borrowed at ch 1)
      for (let i = 1; i <= 3; i++) {
        dbManager.narrativeDebts.createDebt({
          title: `同类型债务 ${i}`,
          debtType: 'subplot_hook',
          borrowedChapter: 1,
          targetPayoffChapter: 20
        });
      }

      // Default threshold is 5 (at ch 4, drought is false)
      const defaultRes = await dispatcher.dispatch('EvaluateDebtHealth', {
        currentChapter: 4
      });
      assert.equal(defaultRes.metrics.isPayoffDrought, false);

      // Custom threshold is 3 (at ch 4, drought is true!)
      const customRes = await dispatcher.dispatch('EvaluateDebtHealth', {
        currentChapter: 4,
        droughtThreshold: 3
      });
      assert.equal(customRes.metrics.isPayoffDrought, true);
    });
  });
});
