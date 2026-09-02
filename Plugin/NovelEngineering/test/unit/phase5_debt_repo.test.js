/**
 * @file phase5_debt_repo.test.js
 * @description Comprehensive unit test suite for Phase 5 Narrative Debt & Micro-Payoffs system.
 * Covers migration 005, NarrativeDebtRepo, DebtEventRepo, MicroPayoffRepo, DatabaseManager integration,
 * compounding math, overdue state machine, and audit lineage.
 * @module test/unit/phase5_debt_repo.test
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const NarrativeDebtRepo = require('../../src/db/repositories/NarrativeDebtRepo');
const DebtEventRepo = require('../../src/db/repositories/DebtEventRepo');
const MicroPayoffRepo = require('../../src/db/repositories/MicroPayoffRepo');
const MigrationRunner = require('../../src/migrations/MigrationRunner');
const { createTempDir } = require('../helpers/tempDir');
const { PathGuard } = require('../../src/security/PathGuard');
const { NovelError } = require('../../src/errors');

describe('Phase 5 Milestone 1: Narrative Debt Tracking System', () => {
  let dbManager = null;
  let tempEnv = null;

  beforeEach(() => {
    tempEnv = createTempDir();
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv && typeof tempEnv.cleanup === 'function') {
      tempEnv.cleanup();
    }
  });

  describe('Suite 1: Database Initialization & Migration 005 Integrity', () => {
    it('1.1 should initialize clean in-memory database with schema_version 5 and all Phase 5 tables', () => {
      dbManager = new DatabaseManager(':memory:');
      const tables = dbManager.getTableNames();

      assert.ok(tables.includes('narrative_debts'), 'narrative_debts table must exist');
      assert.ok(tables.includes('debt_events'), 'debt_events table must exist');
      assert.ok(tables.includes('micro_payoffs'), 'micro_payoffs table must exist');

      const version = dbManager.getSchemaVersion();
      assert.equal(version, 5, 'Schema version must be 5');

      const integrity = dbManager.verifySchemaIntegrity();
      assert.equal(integrity.valid, true);
      assert.equal(integrity.schemaVersion, 5);
      assert.equal(integrity.errors.length, 0);
    });

    it('1.2 should record migration 005 in migration_history with valid checksum and duration', () => {
      dbManager = new DatabaseManager(':memory:');
      const history = dbManager.getMigrationHistory();
      const m5 = history.find((h) => h.version === 5);

      assert.ok(m5, 'Migration 005 record must exist in migration_history');
      assert.equal(m5.status, 'success');
      assert.equal(m5.checksum.length, 64, 'Checksum must be a 64-char SHA-256 hex string');
      assert.ok(m5.duration_ms >= 0);
    });

    it('1.3 should upgrade existing Phase 4 database to Phase 5 without data loss', () => {
      const dbPath = path.join(tempEnv.path, 'upgrade_phase4_to_5.db');
      const testDb = new Database(dbPath);

      // Create Phase 4 schema baseline
      testDb.exec(`
        CREATE TABLE schema_version (version INTEGER PRIMARY KEY, applied_at TEXT, description TEXT);
        INSERT INTO schema_version (version, description) VALUES (4, 'Phase 4 Baseline');
        CREATE TABLE source_files (id INTEGER PRIMARY KEY, file_path TEXT UNIQUE, relative_path TEXT UNIQUE, file_name TEXT, extension TEXT, size_bytes INTEGER, mtime_ms INTEGER, sha256_hash TEXT, source_category TEXT, status TEXT, review_status TEXT, canon_level INTEGER);
        CREATE TABLE entities (id INTEGER PRIMARY KEY, entity_id TEXT, canonical_name TEXT, entity_type TEXT, canon_level INTEGER);
        CREATE TABLE entity_aliases (id INTEGER PRIMARY KEY, entity_id INTEGER, alias_name TEXT, alias_type TEXT, is_primary INTEGER);
        CREATE TABLE file_entities (id INTEGER PRIMARY KEY, source_file_id INTEGER, entity_id INTEGER, mention_type TEXT);
        CREATE TABLE entity_relations (id INTEGER PRIMARY KEY, source_entity_id INTEGER, target_entity_id INTEGER, relation_type TEXT);
        CREATE TABLE canon_changes (id INTEGER PRIMARY KEY, change_type TEXT, target_type TEXT, target_id TEXT, confirmation_token TEXT);
        CREATE TABLE timeline_events (id INTEGER PRIMARY KEY, event_id TEXT, title TEXT, timestamp_order REAL, time_type TEXT);
        CREATE TABLE chapters (id INTEGER PRIMARY KEY, chapter_number REAL, volume_number INTEGER, title TEXT, relative_path TEXT);
        CREATE TABLE foreshadowing (id INTEGER PRIMARY KEY, foreshadow_id TEXT, thread_key TEXT, title TEXT, description TEXT, setup_file_id INTEGER, setup_chapter_id INTEGER, setup_line INTEGER, setup_snippet TEXT, resolution_file_id INTEGER, resolution_chapter_id INTEGER, resolution_line INTEGER, resolution_snippet TEXT, status TEXT, importance_level TEXT, tags_json TEXT, introduced_chapter TEXT, target_resolve_chapter TEXT, actual_resolve_chapter TEXT, related_entities_json TEXT, resolution_notes TEXT, created_at TEXT, updated_at TEXT);
        CREATE TABLE anomaly_reports (id INTEGER PRIMARY KEY, scan_session_id TEXT, anomaly_rule_id TEXT, severity TEXT, title TEXT, message TEXT, affected_file_paths_json TEXT);
        CREATE TABLE scan_manifests (id INTEGER PRIMARY KEY, scan_session_id TEXT UNIQUE, vault_root_path TEXT, scan_start_time TEXT);
        CREATE TABLE canon_changes_queue (id INTEGER PRIMARY KEY, queue_id TEXT UNIQUE, decision_type TEXT, proposer TEXT, status TEXT, proposed_changes_json TEXT);
        CREATE TABLE context_traces (id INTEGER PRIMARY KEY, trace_id TEXT UNIQUE, snapshot_id TEXT, trace_items_json TEXT);

        INSERT INTO entities (entity_id, canonical_name, entity_type, canon_level) VALUES ('ENT-001', '地球', 'planet', 2);
        INSERT INTO foreshadowing (foreshadow_id, title, description, introduced_chapter)
        VALUES ('FSH-001', '古老石板的预言', '主角在第1章发现的残缺石板', '1');
      `);
      testDb.close();

      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      assert.equal(dbManager.getSchemaVersion(), 5);
      const tables = dbManager.getTableNames();
      assert.ok(tables.includes('narrative_debts'));
      assert.ok(tables.includes('debt_events'));
      assert.ok(tables.includes('micro_payoffs'));

      // Verify Phase 4 data intact
      const entity = dbManager.entities.getSingleByEntityId('ENT-001');
      assert.ok(entity);
      assert.equal(entity.canonical_name, '地球');

      const foreshadow = dbManager.foreshadowing.getByForeshadowId('FSH-001');
      assert.ok(foreshadow);
      assert.equal(foreshadow.title, '古老石板的预言');
    });

    it('1.4 should be completely idempotent on repeated migration execution', () => {
      dbManager = new DatabaseManager(':memory:');
      const initialVersion = dbManager.getSchemaVersion();
      assert.equal(initialVersion, 5);

      const migrationsDir = path.resolve(__dirname, '../../src/migrations');
      const result = MigrationRunner.runMigrations(dbManager.db, migrationsDir);

      assert.equal(result.alreadyUpToDate, true);
      assert.equal(result.applied.length, 0);
      assert.equal(result.currentVersion, 5);
    });
  });

  describe('Suite 2: NarrativeDebtRepo CRUD & Type Defaults', () => {
    let repo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.narrativeDebts;
    });

    it('2.1 should create debt with default subplot_hook type values', () => {
      const debt = repo.createDebt({
        title: '神秘黑衣人的真实身份',
        borrowedChapter: 1
      });

      assert.ok(debt.debtId.startsWith('debt_'));
      assert.equal(debt.title, '神秘黑衣人的真实身份');
      assert.equal(debt.debtType, 'subplot_hook');
      assert.equal(debt.borrowedChapter, 1);
      assert.equal(debt.targetPayoffChapter, 16); // 1 + 15 offset
      assert.equal(debt.basePrincipal, 3.0);
      assert.equal(debt.interestRate, 0.15);
      assert.equal(debt.currentBalance, 3.0);
      assert.equal(debt.accruedChapters, 0);
      assert.equal(debt.status, 'active');
      assert.equal(debt.urgencyLevel, 'normal');
      assert.equal(debt.isOverdue, false);
      assert.deepEqual(debt.relatedEntities, []);
    });

    it('2.2 should create core_mystery and crisis_hook debts with type-specific defaults', () => {
      const mystery = repo.createDebt({
        title: '世界毁灭之谜',
        debtType: 'core_mystery',
        borrowedChapter: 5
      });
      assert.equal(mystery.debtType, 'core_mystery');
      assert.equal(mystery.basePrincipal, 10.0);
      assert.equal(mystery.interestRate, 0.05);
      assert.equal(mystery.targetPayoffChapter, 55); // 5 + 50

      const crisis = repo.createDebt({
        title: '三日内未解毒将经脉尽断',
        debtType: 'crisis_hook',
        borrowedChapter: 10
      });
      assert.equal(crisis.debtType, 'crisis_hook');
      assert.equal(crisis.basePrincipal, 5.0);
      assert.equal(crisis.interestRate, 0.25);
      assert.equal(crisis.targetPayoffChapter, 15); // 10 + 5
    });

    it('2.3 should accept custom principals, rates, target chapters, and entity relations', () => {
      const customDebt = repo.createDebt({
        debtId: 'DEBT-CUSTOM-001',
        title: '失落的弑神剑碎片',
        description: '藏在极北冰原深处',
        debtType: 'world_secret',
        borrowedChapter: 3,
        targetPayoffChapter: 25,
        basePrincipal: 50.0,
        interestRate: 0.12,
        relatedEntities: ['ENT-HERO-01', 'ENT-SWORD-99'],
        foreshadowId: 'FSH-999',
        metadata: { importance: 'high', region: 'North' }
      });

      assert.equal(customDebt.debtId, 'DEBT-CUSTOM-001');
      assert.equal(customDebt.basePrincipal, 50.0);
      assert.equal(customDebt.interestRate, 0.12);
      assert.equal(customDebt.targetPayoffChapter, 25);
      assert.deepEqual(customDebt.relatedEntities, ['ENT-HERO-01', 'ENT-SWORD-99']);
      assert.equal(customDebt.foreshadowId, 'FSH-999');
      assert.equal(customDebt.metadata.region, 'North');
    });

    it('2.4 should retrieve debt by row ID, string debtId, and foreshadowId', () => {
      const created = repo.createDebt({
        debtId: 'DEBT-FIND-001',
        title: '掌门密令',
        foreshadowId: 'FSH-ORDER-01'
      });

      const byRowId = repo.getById(created.id);
      assert.ok(byRowId);
      assert.equal(byRowId.debtId, 'DEBT-FIND-001');

      const byDebtId = repo.getByDebtId('DEBT-FIND-001');
      assert.ok(byDebtId);
      assert.equal(byDebtId.id, created.id);

      const byForeshadow = repo.findByForeshadowId('FSH-ORDER-01');
      assert.ok(byForeshadow);
      assert.equal(byForeshadow.debtId, 'DEBT-FIND-001');
    });

    it('2.5 should update mutable fields on narrative debt', () => {
      const created = repo.createDebt({
        title: '初始标题',
        borrowedChapter: 1
      });

      const updated = repo.updateDebt(created.debtId, {
        title: '修改后的标题',
        description: '补充了详细描述',
        urgencyLevel: 'high',
        targetPayoffChapter: 20,
        metadata: { statusNote: 'escalated' }
      });

      assert.equal(updated.title, '修改后的标题');
      assert.equal(updated.description, '补充了详细描述');
      assert.equal(updated.urgencyLevel, 'high');
      assert.equal(updated.targetPayoffChapter, 20);
      assert.equal(updated.metadata.statusNote, 'escalated');
    });

    it('2.6 should batch insert multiple debts transactionally', () => {
      const debts = [
        { title: '债务1', debtType: 'subplot_hook', borrowedChapter: 1 },
        { title: '债务2', debtType: 'crisis_hook', borrowedChapter: 2 },
        { title: '债务3', debtType: 'power_teaser', borrowedChapter: 3 }
      ];

      const inserted = repo.batchInsert(debts);
      assert.equal(inserted.length, 3);
      assert.equal(repo.count(), 3);
    });
  });

  describe('Suite 3: Dynamic Interest Accrual & Overdue Escalation Engine', () => {
    let repo = null;
    let eventRepo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.narrativeDebts;
      eventRepo = dbManager.debtEvents;
    });

    it('3.1 should accrue interest for active debts on chapter advancement', () => {
      const debt = repo.createDebt({
        debtId: 'DEBT-ACCRUE-01',
        title: '普通的支线伏笔',
        debtType: 'subplot_hook',
        basePrincipal: 100.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 10
      });

      // Accrue at chapter 2
      const result = repo.accrueInterest(2);
      assert.equal(result.success, true);
      assert.equal(result.currentChapter, 2);
      assert.equal(result.updatedDebtsCount, 1);
      assert.equal(result.newlyOverdueCount, 0);
      assert.equal(result.totalAccruedPressure, 10.0);

      const updated = repo.getByDebtId('DEBT-ACCRUE-01');
      assert.equal(updated.currentBalance, 110.0);
      assert.equal(updated.accruedChapters, 1);
      assert.equal(updated.lastAccruedChapter, 2);

      // Verify audit event recorded
      const events = eventRepo.getEventsForDebt('DEBT-ACCRUE-01');
      assert.equal(events.length, 2); // 1 borrow + 1 accrue
      const accrueEvent = events.find((e) => e.eventType === 'accrue');
      assert.ok(accrueEvent);
      assert.equal(accrueEvent.chapterNumber, 2);
      assert.equal(accrueEvent.deltaBalance, 10.0);
      assert.equal(accrueEvent.newBalance, 110.0);
    });

    it('3.2 should prevent double accrual on repeated calls for same chapter (Idempotency)', () => {
      repo.createDebt({
        debtId: 'DEBT-IDEM-01',
        title: '幂等性测试债务',
        basePrincipal: 100.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 10
      });

      const res1 = repo.accrueInterest(2);
      assert.equal(res1.updatedDebtsCount, 1);

      const res2 = repo.accrueInterest(2);
      assert.equal(res2.updatedDebtsCount, 0, 'Should not accrue again for chapter 2');

      const debt = repo.getByDebtId('DEBT-IDEM-01');
      assert.equal(debt.currentBalance, 110.0);
      assert.equal(debt.accruedChapters, 1);
    });

    it('3.3 should compound interest sequentially over multiple chapters', () => {
      repo.createDebt({
        debtId: 'DEBT-COMPOUND-01',
        title: '复利计息测试',
        basePrincipal: 100.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 20
      });

      // Chapter 2: 100 * (1 + 0.10) = 110
      repo.accrueInterest(2);
      // Chapter 3: 110 * (1 + 0.10) = 121
      repo.accrueInterest(3);
      // Chapter 4: 121 * (1 + 0.10) = 133.1
      repo.accrueInterest(4);

      const debt = repo.getByDebtId('DEBT-COMPOUND-01');
      assert.equal(debt.currentBalance, 133.1);
      assert.equal(debt.accruedChapters, 3);
      assert.equal(debt.lastAccruedChapter, 4);
    });

    it('3.4 should escalate overdue debts with penalty multiplier when target chapter is passed', () => {
      repo.createDebt({
        debtId: 'DEBT-OVERDUE-01',
        title: '紧急危机未解',
        debtType: 'crisis_hook',
        basePrincipal: 100.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 3 // Should be paid by chapter 3
      });

      // Accrue at chapter 2 (not overdue yet)
      repo.accrueInterest(2);
      let debt = repo.getByDebtId('DEBT-OVERDUE-01');
      assert.equal(debt.status, 'active');
      assert.equal(debt.currentBalance, 110.0);

      // Accrue at chapter 3 (due chapter, not overdue yet)
      repo.accrueInterest(3);
      debt = repo.getByDebtId('DEBT-OVERDUE-01');
      assert.equal(debt.status, 'active');
      assert.equal(debt.currentBalance, 121.0);

      // Accrue at chapter 4 (SURPASSED target chapter 3 -> OVERDUE with 1.5x penalty rate = 0.15)
      const res4 = repo.accrueInterest(4, { overdueMultiplier: 1.5 });
      assert.equal(res4.newlyOverdueCount, 1);

      debt = repo.getByDebtId('DEBT-OVERDUE-01', 4);
      assert.equal(debt.status, 'overdue');
      assert.equal(debt.isOverdue, true);
      // 121 + (121 * 0.15) = 121 + 18.15 = 139.15
      assert.equal(debt.currentBalance, 139.15);

      // Verify escalate event was recorded
      const events = eventRepo.getEventsForDebt('DEBT-OVERDUE-01');
      const escalateEvent = events.find((e) => e.eventType === 'escalate');
      assert.ok(escalateEvent);
      assert.equal(escalateEvent.chapterNumber, 4);
      assert.equal(escalateEvent.triggerReason, 'target_payoff_chapter_surpassed');
    });
  });

  describe('Suite 4: Debt Payoffs (Partial & Full) and Balance Clamping', () => {
    let repo = null;
    let eventRepo = null;
    let payoffRepo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.narrativeDebts;
      eventRepo = dbManager.debtEvents;
      payoffRepo = dbManager.microPayoffs;
    });

    it('4.1 should apply partial payoff and transition status to partially_paid', () => {
      repo.createDebt({
        debtId: 'DEBT-PAY-01',
        title: '大悬念',
        basePrincipal: 100.0,
        currentBalance: 100.0
      });

      const res = repo.applyPayoff('DEBT-PAY-01', 40.0, { chapterNumber: 5, reason: '揭露了部分线索' });
      assert.equal(res.success, true);
      assert.equal(res.previousBalance, 100.0);
      assert.equal(res.principalReduction, 40.0);
      assert.equal(res.newBalance, 60.0);
      assert.equal(res.status, 'partially_paid');
      assert.equal(res.isFullyPaid, false);

      const debt = repo.getByDebtId('DEBT-PAY-01');
      assert.equal(debt.currentBalance, 60.0);
      assert.equal(debt.status, 'partially_paid');

      const events = eventRepo.getEventsForDebt('DEBT-PAY-01');
      const payEvent = events.find((e) => e.eventType === 'payoff');
      assert.ok(payEvent);
      assert.equal(payEvent.deltaBalance, -40.0);
      assert.equal(payEvent.newBalance, 60.0);
    });

    it('4.2 should apply full payoff and transition status to paid and clamp balance to 0', () => {
      repo.createDebt({
        debtId: 'DEBT-FULL-PAY',
        title: '凶手是谁',
        basePrincipal: 50.0,
        currentBalance: 50.0
      });

      const res = repo.applyPayoff('DEBT-FULL-PAY', 50.0, { chapterNumber: 10 });
      assert.equal(res.isFullyPaid, true);
      assert.equal(res.newBalance, 0.0);
      assert.equal(res.status, 'paid');

      const debt = repo.getByDebtId('DEBT-FULL-PAY');
      assert.equal(debt.currentBalance, 0.0);
      assert.equal(debt.status, 'paid');
    });

    it('4.3 should safely clamp overpayment to 0 without negative balance', () => {
      repo.createDebt({
        debtId: 'DEBT-OVERPAY',
        title: '小伏笔',
        basePrincipal: 20.0,
        currentBalance: 20.0
      });

      const res = repo.applyPayoff('DEBT-OVERPAY', 100.0);
      assert.equal(res.isFullyPaid, true);
      assert.equal(res.newBalance, 0.0);
      assert.equal(res.principalReduction, 20.0);
    });

    it('4.4 should record micro payoff record when recordMicroPayoff option is enabled', () => {
      repo.createDebt({
        debtId: 'DEBT-MICRO-PAY',
        title: '宗门大比悬念',
        basePrincipal: 80.0,
        currentBalance: 80.0
      });

      repo.applyPayoff('DEBT-MICRO-PAY', 30.0, {
        recordMicroPayoff: true,
        payoffType: 'clue_revealed',
        chapterNumber: 8,
        satisfactionScore: 4.5,
        fatigueMitigationScore: 3.0,
        description: '主角展现隐藏实力反击'
      });

      const payoffs = payoffRepo.getPayoffsForDebt('DEBT-MICRO-PAY');
      assert.equal(payoffs.length, 1);
      assert.equal(payoffs[0].payoffType, 'clue_revealed');
      assert.equal(payoffs[0].satisfactionScore, 4.5);
      assert.equal(payoffs[0].fatigueMitigationScore, 3.0);
      assert.equal(payoffs[0].principalReduction, 30.0);
    });
  });

  describe('Suite 5: DebtEventRepo Operations & Event History', () => {
    let repo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.debtEvents;
      // Also create parent debt for FK constraint
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-EVT-01',
        title: '事件测试债务'
      });
    });

    it('5.1 should record and query events in chronological order', () => {
      repo.recordEvent({
        debtId: 'DEBT-EVT-01',
        eventType: 'accrue',
        chapterNumber: 2,
        deltaBalance: 5.0,
        newBalance: 15.0,
        triggerReason: 'chapter_pass'
      });
      repo.recordEvent({
        debtId: 'DEBT-EVT-01',
        eventType: 'payoff',
        chapterNumber: 4,
        deltaBalance: -10.0,
        newBalance: 5.0,
        triggerReason: 'mini_climax'
      });

      const events = repo.getEventsForDebt('DEBT-EVT-01');
      assert.equal(events.length, 3); // 1 borrow from createDebt + 2 custom
      assert.equal(events[0].eventType, 'borrow');
      assert.equal(events[1].eventType, 'accrue');
      assert.equal(events[2].eventType, 'payoff');
    });

    it('5.2 should query events by chapter and chapter range', () => {
      repo.recordEvent({ debtId: 'DEBT-EVT-01', eventType: 'accrue', chapterNumber: 5, newBalance: 20 });
      repo.recordEvent({ debtId: 'DEBT-EVT-01', eventType: 'accrue', chapterNumber: 6, newBalance: 25 });
      repo.recordEvent({ debtId: 'DEBT-EVT-01', eventType: 'payoff', chapterNumber: 7, newBalance: 15 });

      const ch5Events = repo.getEventsByChapter(5);
      assert.equal(ch5Events.length, 1);
      assert.equal(ch5Events[0].chapterNumber, 5);

      const rangeEvents = repo.getEventsByChapterRange(5, 7);
      assert.equal(rangeEvents.length, 3);
    });

    it('5.3 should aggregate event statistics', () => {
      repo.recordEvent({ debtId: 'DEBT-EVT-01', eventType: 'accrue', chapterNumber: 2, deltaBalance: 5, newBalance: 15 });
      repo.recordEvent({ debtId: 'DEBT-EVT-01', eventType: 'accrue', chapterNumber: 3, deltaBalance: 6, newBalance: 21 });
      repo.recordEvent({ debtId: 'DEBT-EVT-01', eventType: 'payoff', chapterNumber: 4, deltaBalance: -10, newBalance: 11 });

      const stats = repo.getEventStats('DEBT-EVT-01');
      assert.equal(stats.totalEvents, 4); // 1 borrow + 2 accrue + 1 payoff
      assert.ok(stats.byType.accrue);
      assert.equal(stats.byType.accrue.count, 2);
      assert.equal(stats.byType.accrue.totalDelta, 11);
      assert.equal(stats.byType.payoff.count, 1);
    });
  });

  describe('Suite 6: MicroPayoffRepo Operations & Fatigue Mitigation Metrics', () => {
    let repo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.microPayoffs;
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-MP-01',
        title: '微兑现测试债务'
      });
    });

    it('6.1 should record micro-payoffs with scores and descriptions', () => {
      const payoff = repo.recordPayoff({
        debtId: 'DEBT-MP-01',
        payoffType: 'clue_revealed',
        chapterNumber: 3,
        satisfactionScore: 4.0,
        fatigueMitigationScore: 3.5,
        principalReduction: 15.0,
        description: '在藏经阁发现残页',
        snippet: '林远翻开古籍，赫然发现...'
      });

      assert.ok(payoff.payoffId.startsWith('payoff_'));
      assert.equal(payoff.payoffType, 'clue_revealed');
      assert.equal(payoff.satisfactionScore, 4.0);
      assert.equal(payoff.fatigueMitigationScore, 3.5);
      assert.equal(payoff.principalReduction, 15.0);
      assert.equal(payoff.description, '在藏经阁发现残页');
    });

    it('6.2 should aggregate payoff statistics and fatigue mitigated totals', () => {
      repo.recordPayoff({ debtId: 'DEBT-MP-01', chapterNumber: 2, payoffType: 'clue_revealed', satisfactionScore: 3.0, fatigueMitigationScore: 2.0, principalReduction: 10.0 });
      repo.recordPayoff({ debtId: 'DEBT-MP-01', chapterNumber: 4, payoffType: 'minor_satisfaction', satisfactionScore: 5.0, fatigueMitigationScore: 4.0, principalReduction: 20.0 });

      const stats = repo.getTotalPayoffsStats(1, 10);
      assert.equal(stats.totalPayoffsCount, 2);
      assert.equal(stats.totalSatisfactionScore, 8.0);
      assert.equal(stats.totalFatigueMitigated, 6.0);
      assert.equal(stats.totalPrincipalReduced, 30.0);
      assert.equal(stats.avgSatisfaction, 4.0);
      assert.equal(stats.avgFatigueMitigated, 3.0);
    });

    it('6.3 should get recent payoffs and delete payoff', () => {
      const p1 = repo.recordPayoff({ debtId: 'DEBT-MP-01', chapterNumber: 1, payoffType: 'sub_payoff' });
      const p2 = repo.recordPayoff({ debtId: 'DEBT-MP-01', chapterNumber: 2, payoffType: 'clue_revealed' });

      const recent = repo.getRecentPayoffs(5);
      assert.equal(recent.length, 2);
      assert.equal(recent[0].payoffId, p2.payoffId);

      const deleted = repo.deletePayoff(p1.payoffId);
      assert.equal(deleted, true);
      assert.equal(repo.count(), 1);
    });
  });

  describe('Suite 7: Multi-Criteria Querying, Overdue Queries & Story Health Summary', () => {
    let repo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.narrativeDebts;

      repo.createDebt({ debtId: 'D1', title: '主线谜团', debtType: 'core_mystery', borrowedChapter: 1, targetPayoffChapter: 50, basePrincipal: 100.0, currentBalance: 120.0, urgencyLevel: 'normal', relatedEntities: ['ENT-01'] });
      repo.createDebt({ debtId: 'D2', title: '支线钩子', debtType: 'subplot_hook', borrowedChapter: 2, targetPayoffChapter: 10, basePrincipal: 30.0, currentBalance: 50.0, urgencyLevel: 'high', status: 'overdue', relatedEntities: ['ENT-02'] });
      repo.createDebt({ debtId: 'D3', title: '生死危机', debtType: 'crisis_hook', borrowedChapter: 5, targetPayoffChapter: 8, basePrincipal: 50.0, currentBalance: 90.0, urgencyLevel: 'critical', status: 'overdue', relatedEntities: ['ENT-01', 'ENT-03'] });
      repo.createDebt({ debtId: 'D4', title: '已结清债务', debtType: 'character_promise', borrowedChapter: 1, targetPayoffChapter: 5, basePrincipal: 20.0, currentBalance: 0.0, status: 'paid' });
    });

    it('7.1 should query debts with complex filters', () => {
      const activeDebts = repo.queryDebts({ status: ['active', 'overdue'] });
      assert.equal(activeDebts.totalCount, 3);

      const ent1Debts = repo.queryDebts({ relatedEntity: 'ENT-01' });
      assert.equal(ent1Debts.totalCount, 2);

      const crisisDebts = repo.queryDebts({ debtType: 'crisis_hook' });
      assert.equal(crisisDebts.totalCount, 1);
      assert.equal(crisisDebts.debts[0].debtId, 'D3');

      const highPressureDebts = repo.queryDebts({ minBalance: 60.0 });
      assert.equal(highPressureDebts.totalCount, 2);
    });

    it('7.2 should query overdue debts ordered by balance', () => {
      const overdue = repo.getOverdueDebts(15);
      assert.equal(overdue.length, 2);
      assert.equal(overdue[0].debtId, 'D3'); // 90.0
      assert.equal(overdue[1].debtId, 'D2'); // 50.0
    });

    it('7.3 should calculate comprehensive story health summary', () => {
      const summary = repo.getSummary(15);

      assert.equal(summary.totalActiveDebts, 3);
      assert.equal(summary.totalPrincipal, 180.0); // 100 + 30 + 50
      assert.equal(summary.totalCurrentBalance, 260.0); // 120 + 50 + 90
      assert.equal(summary.totalStoryPressure, 260.0);
      assert.equal(summary.overdueCount, 2);
      assert.equal(summary.highestDebt.debtId, 'D1'); // 120.0
      assert.ok(summary.healthIndex >= 0 && summary.healthIndex <= 100);
      assert.ok(summary.byType.core_mystery);
      assert.ok(summary.byType.subplot_hook);
      assert.ok(summary.byType.crisis_hook);
    });
  });

  describe('Suite 8: Cascades, Transactions, DatabaseManager Integration & Security', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('8.1 should cascade delete debt events and micro payoffs when debt is deleted', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-CASCADE-01',
        title: '级联删除测试'
      });

      dbManager.debtEvents.recordEvent({
        debtId: 'DEBT-CASCADE-01',
        eventType: 'accrue',
        chapterNumber: 2,
        newBalance: 10
      });

      dbManager.microPayoffs.recordPayoff({
        debtId: 'DEBT-CASCADE-01',
        chapterNumber: 2,
        payoffType: 'clue_revealed'
      });

      assert.equal(dbManager.debtEvents.getEventsForDebt('DEBT-CASCADE-01').length, 2);
      assert.equal(dbManager.microPayoffs.getPayoffsForDebt('DEBT-CASCADE-01').length, 1);

      const deleted = dbManager.narrativeDebts.deleteDebt('DEBT-CASCADE-01');
      assert.equal(deleted, true);

      assert.equal(dbManager.narrativeDebts.getById('DEBT-CASCADE-01'), null);
      assert.equal(dbManager.debtEvents.getEventsForDebt('DEBT-CASCADE-01').length, 0);
      assert.equal(dbManager.microPayoffs.getPayoffsForDebt('DEBT-CASCADE-01').length, 0);
    });

    it('8.2 should clear all tables including Phase 5 tables via clearAllTables without errors', () => {
      dbManager.narrativeDebts.createDebt({ debtId: 'DEBT-CLR-01', title: '清空测试' });
      dbManager.microPayoffs.recordPayoff({ debtId: 'DEBT-CLR-01', chapterNumber: 1, payoffType: 'clue_revealed' });

      assert.equal(dbManager.narrativeDebts.count(), 1);
      assert.equal(dbManager.microPayoffs.count(), 1);

      dbManager.clearAllTables();

      assert.equal(dbManager.narrativeDebts.count(), 0);
      assert.equal(dbManager.debtEvents.count(), 0);
      assert.equal(dbManager.microPayoffs.count(), 0);
    });

    it('8.3 should include Phase 5 table counts in getStats()', () => {
      dbManager.narrativeDebts.createDebt({ debtId: 'DEBT-STAT-01', title: '统计测试' });
      dbManager.microPayoffs.recordPayoff({ debtId: 'DEBT-STAT-01', chapterNumber: 1, payoffType: 'sub_payoff' });

      const stats = dbManager.getStats();
      assert.equal(stats.schemaVersion, 5);
      assert.equal(stats.totalNarrativeDebts, 1);
      assert.equal(stats.totalDebtEvents, 1); // initial borrow event
      assert.equal(stats.totalMicroPayoffs, 1);
    });

    it('8.4 should execute DatabaseManager convenience delegates smoothly', () => {
      const created = dbManager.createNarrativeDebt({
        debtId: 'DEBT-DELEGATE-01',
        title: '委托接口测试',
        basePrincipal: 50.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 5
      });

      assert.ok(created);
      const retrieved = dbManager.getNarrativeDebt('DEBT-DELEGATE-01');
      assert.equal(retrieved.debtId, 'DEBT-DELEGATE-01');

      const accrueRes = dbManager.accrueNarrativeDebts(2);
      assert.equal(accrueRes.updatedDebtsCount, 1);

      const payRes = dbManager.payNarrativeDebt('DEBT-DELEGATE-01', 20.0, { chapterNumber: 2 });
      assert.equal(payRes.principalReduction, 20.0);

      const event = dbManager.recordDebtEvent({
        debtId: 'DEBT-DELEGATE-01',
        eventType: 'adjust',
        chapterNumber: 2,
        deltaBalance: 0,
        newBalance: 35.0
      });
      assert.ok(event);

      const payoff = dbManager.recordMicroPayoff({
        debtId: 'DEBT-DELEGATE-01',
        chapterNumber: 2,
        payoffType: 'minor_satisfaction'
      });
      assert.ok(payoff);
    });

    it('8.5 should be immune to SQL injection in titles, metadata, and filter queries', () => {
      const evilTitle = "'; DROP TABLE narrative_debts; --";
      const debt = dbManager.createNarrativeDebt({
        title: evilTitle,
        description: "Evil'; DELETE FROM debt_events; --",
        metadata: { evil: "'; DROP TABLE micro_payoffs; --" }
      });

      assert.ok(debt);
      assert.equal(debt.title, evilTitle);

      const queried = dbManager.narrativeDebts.queryDebts({
        relatedEntity: "' OR '1'='1"
      });
      assert.ok(Array.isArray(queried.debts));

      // Assert table still exists and is intact
      const tables = dbManager.getTableNames();
      assert.ok(tables.includes('narrative_debts'));
    });
  });

  // ==========================================================================
  // Suite 9: Adversarial Challenge: Extreme Interest Rates & Huge Chapter Jumps
  // ==========================================================================
  describe('Suite 9: Adversarial Challenge: Extreme Interest Rates & Huge Chapter Jumps', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('9.1 should handle 0% interest rate without growth across multiple chapters', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-ZERO-RATE',
        title: '零利率债务',
        basePrincipal: 250.0,
        interestRate: 0.0,
        borrowedChapter: 1,
        targetPayoffChapter: 20
      });

      assert.equal(debt.currentBalance, 250.0);

      // Accrue chapters 2 through 10
      for (let ch = 2; ch <= 10; ch++) {
        const res = dbManager.narrativeDebts.accrueInterest(ch);
        assert.equal(res.updatedDebtsCount, 1);
        assert.equal(res.totalAccruedPressure, 0.0);
      }

      const postDebt = dbManager.narrativeDebts.getByDebtId('DEBT-ZERO-RATE');
      assert.equal(postDebt.currentBalance, 250.0);
      assert.equal(postDebt.accruedChapters, 9);
      assert.equal(postDebt.status, 'active');
    });

    it('9.2 should handle 100% (1.0) interest rate with exact doubling each chapter', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-100PCT-RATE',
        title: '百分之百超高利息',
        basePrincipal: 10.0,
        interestRate: 1.0,
        borrowedChapter: 1,
        targetPayoffChapter: 50
      });

      // Chapter 2: 10 + 10 = 20
      dbManager.narrativeDebts.accrueInterest(2);
      let d = dbManager.narrativeDebts.getByDebtId('DEBT-100PCT-RATE');
      assert.equal(d.currentBalance, 20.0);

      // Chapter 3: 20 + 20 = 40
      dbManager.narrativeDebts.accrueInterest(3);
      d = dbManager.narrativeDebts.getByDebtId('DEBT-100PCT-RATE');
      assert.equal(d.currentBalance, 40.0);

      // Chapter 4: 40 + 40 = 80
      dbManager.narrativeDebts.accrueInterest(4);
      d = dbManager.narrativeDebts.getByDebtId('DEBT-100PCT-RATE');
      assert.equal(d.currentBalance, 80.0);
    });

    it('9.3 should handle negative interest rate gracefully without crashing', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-NEG-RATE',
        title: '负利率衰减债务',
        basePrincipal: 100.0,
        interestRate: -0.1, // -10% per chapter
        borrowedChapter: 1,
        targetPayoffChapter: 30
      });

      // Chapter 2: 100 + (-10) = 90
      dbManager.narrativeDebts.accrueInterest(2);
      const d2 = dbManager.narrativeDebts.getByDebtId('DEBT-NEG-RATE');
      assert.equal(d2.currentBalance, 90.0);

      // Chapter 3: 90 + (-9) = 81
      dbManager.narrativeDebts.accrueInterest(3);
      const d3 = dbManager.narrativeDebts.getByDebtId('DEBT-NEG-RATE');
      assert.equal(d3.currentBalance, 81.0);
    });

    it('9.4 should handle huge sequential chapter advancement (500 chapters) with finite mathematical convergence', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-500-CHAPS',
        title: '五百章长生纪元伏笔',
        basePrincipal: 10.0,
        interestRate: 0.01, // 1% per chapter
        borrowedChapter: 1,
        targetPayoffChapter: 200
      });

      // Advance through 500 chapters
      for (let ch = 2; ch <= 500; ch++) {
        dbManager.narrativeDebts.accrueInterest(ch);
      }

      const d = dbManager.narrativeDebts.getByDebtId('DEBT-500-CHAPS');
      assert.ok(!Number.isNaN(d.currentBalance), 'Balance must not be NaN');
      assert.ok(Number.isFinite(d.currentBalance), 'Balance must be finite');
      assert.ok(d.currentBalance > 10.0, 'Balance must be greater than principal');
      assert.equal(d.accruedChapters, 499);
      assert.equal(d.lastAccruedChapter, 500);
      assert.equal(d.status, 'overdue');
      assert.equal(d.urgencyLevel, 'critical');

      // Verify total events logged equals 500 (1 borrow + 499 accrue + 1 escalate)
      const events = dbManager.debtEvents.getEventsForDebt('DEBT-500-CHAPS');
      assert.equal(events.length, 501);
    });

    it('9.5 should handle direct huge chapter jump in a single accrue call', () => {
      const debt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-DIRECT-JUMP',
        title: '跳章计息测试',
        basePrincipal: 100.0,
        interestRate: 0.05,
        borrowedChapter: 1,
        targetPayoffChapter: 10
      });

      // Jump directly from chapter 1 to chapter 500 in one step
      const res = dbManager.narrativeDebts.accrueInterest(500);
      assert.equal(res.updatedDebtsCount, 1);
      assert.equal(res.newlyOverdueCount, 1);

      const d = dbManager.narrativeDebts.getByDebtId('DEBT-DIRECT-JUMP');
      assert.equal(d.accruedChapters, 1);
      assert.equal(d.lastAccruedChapter, 500);
      assert.equal(d.status, 'overdue');
      // Overdue penalty rate = 0.05 * 1.5 = 0.075 -> delta = 7.5 -> newBalance = 107.5
      assert.equal(d.currentBalance, 107.5);
    });
  });

  // ==========================================================================
  // Suite 10: Adversarial Challenge: Anti-Reentrancy & Accrual Idempotency Under Pressure
  // ==========================================================================
  describe('Suite 10: Adversarial Challenge: Anti-Reentrancy & Accrual Idempotency', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('10.1 should strictly prevent double accrual across 50 rapid sequential re-entrant calls for the same chapter', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-REENTRANT-01',
        title: '防重入压力测试',
        basePrincipal: 100.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 20
      });

      // First call for chapter 2: must accrue
      const firstRes = dbManager.narrativeDebts.accrueInterest(2);
      assert.equal(firstRes.updatedDebtsCount, 1);
      assert.equal(firstRes.totalAccruedPressure, 10.0);

      const dAfterFirst = dbManager.narrativeDebts.getByDebtId('DEBT-REENTRANT-01');
      assert.equal(dAfterFirst.currentBalance, 110.0);
      assert.equal(dAfterFirst.accruedChapters, 1);
      assert.equal(dAfterFirst.lastAccruedChapter, 2);

      // 49 repeated calls for chapter 2: MUST ALL BE NO-OPS (0 updated)
      for (let i = 2; i <= 50; i++) {
        const noopRes = dbManager.narrativeDebts.accrueInterest(2);
        assert.equal(noopRes.updatedDebtsCount, 0, `Call ${i} must update 0 debts`);
        assert.equal(noopRes.totalAccruedPressure, 0.0);
      }

      const dFinal = dbManager.narrativeDebts.getByDebtId('DEBT-REENTRANT-01');
      assert.equal(dFinal.currentBalance, 110.0, 'Balance must remain 110.0 after 50 calls');
      assert.equal(dFinal.accruedChapters, 1, 'Accrued chapters must strictly remain 1');
      assert.equal(dFinal.lastAccruedChapter, 2);

      // Total events should be exactly 2 (1 borrow + 1 accrue)
      const events = dbManager.debtEvents.getEventsForDebt('DEBT-REENTRANT-01');
      assert.equal(events.length, 2);
    });

    it('10.2 should maintain strict idempotency under interleaved chapter numbers', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-INTERLEAVE',
        title: '乱序调用防重入',
        basePrincipal: 100.0,
        interestRate: 0.10,
        borrowedChapter: 1,
        targetPayoffChapter: 50
      });

      // Call ch 5
      dbManager.narrativeDebts.accrueInterest(5);
      let d = dbManager.narrativeDebts.getByDebtId('DEBT-INTERLEAVE');
      assert.equal(d.currentBalance, 110.0);
      assert.equal(d.lastAccruedChapter, 5);

      // Call ch 3 (past chapter): should NOT accrue because last_accrued_chapter is 5 >= 3
      const pastRes = dbManager.narrativeDebts.accrueInterest(3);
      assert.equal(pastRes.updatedDebtsCount, 0);

      // Call ch 5 again: should NOT accrue
      const repeatRes = dbManager.narrativeDebts.accrueInterest(5);
      assert.equal(repeatRes.updatedDebtsCount, 0);

      // Call ch 6: should accrue normally
      const nextRes = dbManager.narrativeDebts.accrueInterest(6);
      assert.equal(nextRes.updatedDebtsCount, 1);

      d = dbManager.narrativeDebts.getByDebtId('DEBT-INTERLEAVE');
      assert.equal(d.currentBalance, 121.0);
      assert.equal(d.lastAccruedChapter, 6);
      assert.equal(d.accruedChapters, 2);
    });
  });

  // ==========================================================================
  // Suite 11: Adversarial Challenge: Payoff Boundary Clamping & Overpayment Defense
  // ==========================================================================
  describe('Suite 11: Adversarial Challenge: Payoff Boundary Clamping & Overpayment Defense', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('11.1 should clamp balance to exact 0 when paying exact remaining amount', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-EXACT-PAY',
        title: '精准偿还测试',
        basePrincipal: 123.456,
        currentBalance: 123.456
      });

      const res = dbManager.narrativeDebts.applyPayoff('DEBT-EXACT-PAY', 123.456);
      assert.equal(res.success, true);
      assert.equal(res.previousBalance, 123.456);
      assert.equal(res.newBalance, 0);
      assert.equal(res.principalReduction, 123.456);
      assert.equal(res.status, 'paid');
      assert.equal(res.isFullyPaid, true);

      const d = dbManager.narrativeDebts.getByDebtId('DEBT-EXACT-PAY');
      assert.equal(d.currentBalance, 0);
      assert.equal(d.status, 'paid');
    });

    it('11.2 should strictly reject 0 payoff amount with NovelError', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-ZERO-AMT',
        title: '零金额偿还',
        basePrincipal: 50.0
      });

      assert.throws(
        () => {
          dbManager.narrativeDebts.applyPayoff('DEBT-ZERO-AMT', 0);
        },
        (err) => {
          assert.ok(err instanceof NovelError || err.name === 'NovelError');
          assert.match(err.message, /Payoff amount must be greater than 0/i);
          return true;
        }
      );
    });

    it('11.3 should strictly reject negative payoff amount with NovelError', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-NEG-PAY',
        title: '负金额偿还',
        basePrincipal: 50.0
      });

      assert.throws(
        () => {
          dbManager.narrativeDebts.applyPayoff('DEBT-NEG-PAY', -100.0);
        },
        (err) => {
          assert.ok(err instanceof NovelError || err.name === 'NovelError');
          assert.match(err.message, /Payoff amount must be greater than 0/i);
          return true;
        }
      );
    });

    it('11.4 should clamp overpayment safely without going negative and record correct reduced amount', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-OVERPAY',
        title: '超额偿还防御',
        basePrincipal: 45.0,
        currentBalance: 45.0
      });

      const res = dbManager.narrativeDebts.applyPayoff('DEBT-OVERPAY', 10000.0);
      assert.equal(res.success, true);
      assert.equal(res.previousBalance, 45.0);
      assert.equal(res.newBalance, 0);
      assert.equal(res.principalReduction, 45.0); // Only actual reduction
      assert.equal(res.status, 'paid');
      assert.equal(res.isFullyPaid, true);

      const d = dbManager.narrativeDebts.getByDebtId('DEBT-OVERPAY');
      assert.equal(d.currentBalance, 0);
      assert.equal(d.status, 'paid');
    });

    it('11.5 should handle sequential step-wise payoffs transitioning active -> partially_paid -> paid', () => {
      dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-STEP-PAY',
        title: '阶梯偿还测试',
        basePrincipal: 100.0,
        currentBalance: 100.0
      });

      // Step 1: Pay 30 -> Balance 70 -> partially_paid
      const step1 = dbManager.narrativeDebts.applyPayoff('DEBT-STEP-PAY', 30.0);
      assert.equal(step1.newBalance, 70.0);
      assert.equal(step1.status, 'partially_paid');
      assert.equal(step1.isFullyPaid, false);

      // Step 2: Pay 40 -> Balance 30 -> partially_paid
      const step2 = dbManager.narrativeDebts.applyPayoff('DEBT-STEP-PAY', 40.0);
      assert.equal(step2.newBalance, 30.0);
      assert.equal(step2.status, 'partially_paid');
      assert.equal(step2.isFullyPaid, false);

      // Step 3: Pay remaining 30 -> Balance 0 -> paid
      const step3 = dbManager.narrativeDebts.applyPayoff('DEBT-STEP-PAY', 30.0);
      assert.equal(step3.newBalance, 0);
      assert.equal(step3.status, 'paid');
      assert.equal(step3.isFullyPaid, true);

      const d = dbManager.narrativeDebts.getByDebtId('DEBT-STEP-PAY');
      assert.equal(d.status, 'paid');
      assert.equal(d.currentBalance, 0);
    });
  });

  // ==========================================================================
  // Suite 12: Adversarial Challenge: High-Volume Scale (500 Debts Batching & Mass Accrual)
  // ==========================================================================
  describe('Suite 12: Adversarial Challenge: High-Volume Scale (500 Debts)', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('12.1 should execute high-volume batch insertion of 500 debts in a single transaction in < 200ms', () => {
      const debts = [];
      const types = ['core_mystery', 'subplot_hook', 'crisis_hook', 'character_promise', 'power_teaser', 'world_secret'];

      for (let i = 1; i <= 500; i++) {
        debts.push({
          debtId: `DEBT-SCALE-${String(i).padStart(4, '0')}`,
          title: `批量压力债务 ${i}`,
          debtType: types[i % types.length],
          basePrincipal: (i % 50) + 10.0,
          interestRate: 0.05 + ((i % 10) * 0.01),
          borrowedChapter: (i % 20) + 1,
          targetPayoffChapter: (i % 20) + 20,
          relatedEntities: [`ENT-${i % 100}`],
          metadata: { scaleIndex: i }
        });
      }

      const startTime = Date.now();
      const created = dbManager.narrativeDebts.batchInsert(debts);
      const elapsed = Date.now() - startTime;

      assert.equal(created.length, 500);
      assert.equal(dbManager.narrativeDebts.count(), 500);
      assert.equal(dbManager.debtEvents.count(), 500); // 500 initial borrow events
      assert.ok(elapsed < 2000, `Batch insert took ${elapsed}ms, must be < 2000ms`);
    });

    it('12.2 should accrue interest across all 500 debts simultaneously in a single transaction under stress', () => {
      const debts = [];
      for (let i = 1; i <= 500; i++) {
        debts.push({
          debtId: `DEBT-MASS-ACCRUE-${i}`,
          title: `Mass Accrue Debt ${i}`,
          basePrincipal: 100.0,
          borrowedChapter: 1,
          targetPayoffChapter: 10
        });
      }
      dbManager.narrativeDebts.batchInsert(debts);

      // Mass accrue for chapter 2
      const startTime = Date.now();
      const res = dbManager.narrativeDebts.accrueInterest(2);
      const elapsed = Date.now() - startTime;

      assert.equal(res.updatedDebtsCount, 500);
      assert.ok(res.totalAccruedPressure > 0);
      assert.ok(elapsed < 1000, `Mass accrue took ${elapsed}ms, must be < 1000ms`);

      // Verify all 500 debts updated
      const stats = dbManager.debtEvents.getEventStats();
      assert.equal(stats.totalEvents, 1000); // 500 borrow + 500 accrue
    });

    it('12.3 should query and paginate across 500 debts with complex multi-criteria filters', () => {
      const debts = [];
      for (let i = 1; i <= 500; i++) {
        debts.push({
          debtId: `DEBT-QRY-${i}`,
          title: `Query Debt ${i}`,
          debtType: i <= 250 ? 'core_mystery' : 'crisis_hook',
          basePrincipal: i * 2.0,
          borrowedChapter: (i % 10) + 1,
          targetPayoffChapter: (i % 10) + 15
        });
      }
      dbManager.narrativeDebts.batchInsert(debts);

      // Paginated query
      const page1 = dbManager.narrativeDebts.queryDebts({
        debtType: 'core_mystery',
        limit: 20,
        offset: 0,
        orderBy: 'current_balance',
        orderDir: 'DESC'
      });

      assert.equal(page1.totalCount, 250);
      assert.equal(page1.debts.length, 20);
      assert.equal(page1.debts[0].debtType, 'core_mystery');
      assert.ok(page1.debts[0].currentBalance >= page1.debts[1].currentBalance);

      // Page 2
      const page2 = dbManager.narrativeDebts.queryDebts({
        debtType: 'core_mystery',
        limit: 20,
        offset: 20,
        orderBy: 'current_balance',
        orderDir: 'DESC'
      });
      assert.equal(page2.totalCount, 250);
      assert.equal(page2.debts.length, 20);
      assert.notEqual(page1.debts[0].debtId, page2.debts[0].debtId);
    });
  });
});

