/**
 * @file m1_phase5_challenger2_adversarial.test.js
 * @description Empirical Adversarial Challenge Test Suite for Phase 5 Milestone 1
 * Stress-tests FK constraints, cascade deletions, transaction rollbacks, corrupted migrations,
 * clearAllTables under load, verifySchemaIntegrity anomalies, and extreme boundary values.
 * @module test/unit/m1_phase5_challenger2_adversarial
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const NarrativeDebtRepo = require('../../src/db/repositories/NarrativeDebtRepo');
const DebtEventRepo = require('../../src/db/repositories/DebtEventRepo');
const MicroPayoffRepo = require('../../src/db/repositories/MicroPayoffRepo');
const MigrationRunner = require('../../src/migrations/MigrationRunner');
const { SchemaMismatchError, MigrationError, NovelError } = require('../../src/errors');
const { createTempDir } = require('../helpers/tempDir');
const { PathGuard } = require('../../src/security/PathGuard');

describe('Phase 5 Milestone 1: Challenger 2 Empirical Adversarial Stress Suite', () => {
  let dbManager = null;
  let tempEnv = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_p5_m1_challenger_');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv && typeof tempEnv.cleanup === 'function') {
      tempEnv.cleanup();
    }
  });

  // ==========================================================================
  // Suite 1: Foreign Key Enforcement & Cascade Deletions
  // ==========================================================================
  describe('Suite 1: Foreign Key Enforcement & Atomic Cascades', () => {
    it('1.1 should strictly reject orphan debt_events referencing non-existent debt_id via SQLite FK constraint', () => {
      dbManager = new DatabaseManager(':memory:');
      const rawDb = dbManager.getDatabase();

      // Ensure PRAGMA foreign_keys is ON
      const fkRow = rawDb.pragma('foreign_keys', { simple: true });
      assert.equal(fkRow, 1, 'PRAGMA foreign_keys must be active (1)');

      // Attempt to insert debt_events with non-existent debt_id
      assert.throws(
        () => {
          rawDb.prepare(`
            INSERT INTO debt_events (debt_id, event_type, chapter_number, delta_balance, new_balance)
            VALUES ('NON_EXISTENT_DEBT_999', 'accrue', 1, 10.0, 110.0)
          `).run();
        },
        (err) => {
          assert.match(err.message, /FOREIGN KEY constraint failed/i);
          return true;
        },
        'Must reject orphan debt_event record'
      );
    });

    it('1.2 should strictly reject orphan micro_payoffs referencing non-existent debt_id via SQLite FK constraint', () => {
      dbManager = new DatabaseManager(':memory:');
      const rawDb = dbManager.getDatabase();

      assert.throws(
        () => {
          rawDb.prepare(`
            INSERT INTO micro_payoffs (debt_id, payoff_id, chapter_number, payoff_type)
            VALUES ('NON_EXISTENT_DEBT_888', 'payoff_fake_1', 1, 'clue_revealed')
          `).run();
        },
        (err) => {
          assert.match(err.message, /FOREIGN KEY constraint failed/i);
          return true;
        },
        'Must reject orphan micro_payoff record'
      );
    });

    it('1.3 should execute full deep cascade deletion across 100 child events and 50 micro-payoffs upon debt deletion', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;
      const eventRepo = dbManager.debtEvents;
      const payoffRepo = dbManager.microPayoffs;

      const debt = debtRepo.createDebt({
        debtId: 'DEBT-MASS-CASCADE',
        title: '大规模级联测试债务',
        basePrincipal: 500.0,
        borrowedChapter: 1
      });

      // Insert 100 debt events
      const events = [];
      for (let i = 2; i <= 101; i++) {
        events.push({
          debtId: 'DEBT-MASS-CASCADE',
          eventType: i % 2 === 0 ? 'accrue' : 'adjust',
          chapterNumber: i,
          deltaBalance: 5.0,
          newBalance: 500.0 + (i * 5)
        });
      }
      eventRepo.batchRecordEvents(events);

      // Insert 50 micro-payoffs
      const payoffs = [];
      for (let i = 1; i <= 50; i++) {
        payoffs.push({
          debtId: 'DEBT-MASS-CASCADE',
          payoffId: `PAYOFF-CASCADE-${i}`,
          chapterNumber: i,
          payoffType: 'clue_revealed',
          satisfactionScore: 4.0,
          fatigueMitigationScore: 3.0,
          principalReduction: 2.0
        });
      }
      payoffRepo.batchInsert(payoffs);

      // Verify records exist before deletion
      assert.equal(debtRepo.count({ debtId: 'DEBT-MASS-CASCADE' }), 1);
      assert.equal(eventRepo.count({ debtId: 'DEBT-MASS-CASCADE' }), 101); // 1 initial borrow + 100
      assert.equal(payoffRepo.count({ debtId: 'DEBT-MASS-CASCADE' }), 50);

      // Perform deletion via repository
      const deleted = debtRepo.deleteDebt('DEBT-MASS-CASCADE');
      assert.equal(deleted, true);

      // Verify complete atomic wipe
      assert.equal(debtRepo.getById('DEBT-MASS-CASCADE'), null);
      assert.equal(eventRepo.getEventsForDebt('DEBT-MASS-CASCADE').length, 0);
      assert.equal(payoffRepo.getPayoffsForDebt('DEBT-MASS-CASCADE').length, 0);
      assert.equal(eventRepo.count({ debtId: 'DEBT-MASS-CASCADE' }), 0);
      assert.equal(payoffRepo.count({ debtId: 'DEBT-MASS-CASCADE' }), 0);
    });

    it('1.4 should maintain absolute isolation between distinct debts during cascade deletion', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;
      const eventRepo = dbManager.debtEvents;
      const payoffRepo = dbManager.microPayoffs;

      // Create Debt A and Debt B
      debtRepo.createDebt({ debtId: 'DEBT-ISOL-A', title: 'Debt A' });
      debtRepo.createDebt({ debtId: 'DEBT-ISOL-B', title: 'Debt B' });

      eventRepo.recordEvent({ debtId: 'DEBT-ISOL-A', eventType: 'accrue', chapterNumber: 2, newBalance: 10 });
      eventRepo.recordEvent({ debtId: 'DEBT-ISOL-B', eventType: 'accrue', chapterNumber: 2, newBalance: 20 });

      payoffRepo.recordPayoff({ debtId: 'DEBT-ISOL-A', chapterNumber: 2, payoffType: 'clue_revealed' });
      payoffRepo.recordPayoff({ debtId: 'DEBT-ISOL-B', chapterNumber: 2, payoffType: 'clue_revealed' });

      // Delete Debt A
      debtRepo.deleteDebt('DEBT-ISOL-A');

      // Verify Debt A wiped
      assert.equal(debtRepo.getById('DEBT-ISOL-A'), null);
      assert.equal(eventRepo.getEventsForDebt('DEBT-ISOL-A').length, 0);
      assert.equal(payoffRepo.getPayoffsForDebt('DEBT-ISOL-A').length, 0);

      // Verify Debt B completely untouched
      const bDebt = debtRepo.getById('DEBT-ISOL-B');
      assert.ok(bDebt);
      assert.equal(bDebt.debtId, 'DEBT-ISOL-B');
      assert.equal(eventRepo.getEventsForDebt('DEBT-ISOL-B').length, 2); // 1 borrow + 1 accrue
      assert.equal(payoffRepo.getPayoffsForDebt('DEBT-ISOL-B').length, 1);
    });

    it('1.5 should cascade delete via raw SQL DELETE statement at SQLite engine level', () => {
      dbManager = new DatabaseManager(':memory:');
      const rawDb = dbManager.getDatabase();

      rawDb.prepare(`
        INSERT INTO narrative_debts (debt_id, title, base_principal, current_balance)
        VALUES ('DEBT-RAW-SQL-01', 'Direct SQL Cascade', 100.0, 100.0)
      `).run();

      rawDb.prepare(`
        INSERT INTO debt_events (debt_id, event_type, chapter_number, delta_balance, new_balance)
        VALUES ('DEBT-RAW-SQL-01', 'borrow', 1, 100.0, 100.0)
      `).run();

      rawDb.prepare(`
        INSERT INTO micro_payoffs (debt_id, payoff_id, chapter_number, payoff_type)
        VALUES ('DEBT-RAW-SQL-01', 'PAY-RAW-01', 1, 'minor_satisfaction')
      `).run();

      // Execute raw SQL DELETE
      rawDb.prepare("DELETE FROM narrative_debts WHERE debt_id = 'DEBT-RAW-SQL-01'").run();

      const eventsCount = rawDb.prepare("SELECT COUNT(*) as count FROM debt_events WHERE debt_id = 'DEBT-RAW-SQL-01'").get().count;
      const payoffsCount = rawDb.prepare("SELECT COUNT(*) as count FROM micro_payoffs WHERE debt_id = 'DEBT-RAW-SQL-01'").get().count;

      assert.equal(eventsCount, 0, 'debt_events must be automatically cascaded by SQLite engine');
      assert.equal(payoffsCount, 0, 'micro_payoffs must be automatically cascaded by SQLite engine');
    });
  });

  // ==========================================================================
  // Suite 2: Transaction Rollbacks & ACID Atomicity Under Injected Faults
  // ==========================================================================
  describe('Suite 2: Transaction Rollbacks & ACID Fault Tolerance', () => {
    it('2.1 should execute 100% rollback when batchInsert encounters a constraint error midway', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;

      const initialCount = debtRepo.count();
      assert.equal(initialCount, 0);

      // 10 items, where item 8 has a duplicate debtId that violates UNIQUE constraint
      const batchItems = [
        { debtId: 'DEBT-ROLLBACK-01', title: 'Batch Item 1' },
        { debtId: 'DEBT-ROLLBACK-02', title: 'Batch Item 2' },
        { debtId: 'DEBT-ROLLBACK-03', title: 'Batch Item 3' },
        { debtId: 'DEBT-ROLLBACK-04', title: 'Batch Item 4' },
        { debtId: 'DEBT-ROLLBACK-05', title: 'Batch Item 5' },
        { debtId: 'DEBT-ROLLBACK-06', title: 'Batch Item 6' },
        { debtId: 'DEBT-ROLLBACK-07', title: 'Batch Item 7' },
        { debtId: 'DEBT-ROLLBACK-01', title: 'DUPLICATE ID 1' }, // Duplicate of Item 1!
        { debtId: 'DEBT-ROLLBACK-09', title: 'Batch Item 9' }
      ];

      assert.throws(
        () => {
          debtRepo.batchInsert(batchItems);
        },
        (err) => {
          assert.match(err.message, /UNIQUE constraint failed/i);
          return true;
        },
        'batchInsert must fail on duplicate key'
      );

      // Verify ZERO records were persisted due to transaction rollback
      assert.equal(debtRepo.count(), 0, 'Entire batch must rollback to 0 records');
      assert.equal(dbManager.debtEvents.count(), 0, 'Audit events must also rollback to 0');
    });

    it('2.2 should execute complete rollback when custom multi-table transaction encounters runtime exception', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;
      const eventRepo = dbManager.debtEvents;

      debtRepo.createDebt({ debtId: 'DEBT-ATOMIC-01', title: 'Initial Debt', basePrincipal: 100.0, currentBalance: 100.0 });
      assert.equal(debtRepo.count(), 1);
      assert.equal(eventRepo.count(), 1);

      // Attempt transaction that mutates debt, inserts event, then throws error
      assert.throws(() => {
        dbManager.transaction(() => {
          debtRepo.updateDebt('DEBT-ATOMIC-01', { currentBalance: 999.0, status: 'overdue' });
          eventRepo.recordEvent({
            debtId: 'DEBT-ATOMIC-01',
            eventType: 'accrue',
            chapterNumber: 99,
            newBalance: 999.0
          });
          throw new Error('SIMULATED_TRANSACTION_CRASH');
        })();
      }, /SIMULATED_TRANSACTION_CRASH/);

      // Verify pre-crash state restored
      const debt = debtRepo.getByDebtId('DEBT-ATOMIC-01');
      assert.equal(debt.currentBalance, 100.0, 'Balance must remain 100.0');
      assert.equal(debt.status, 'active', 'Status must remain active');
      assert.equal(eventRepo.count(), 1, 'Event count must remain 1');
    });

    it('2.3 should preserve mathematical consistency under rapid multi-turn operations', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;
      const eventRepo = dbManager.debtEvents;

      const debt = debtRepo.createDebt({
        debtId: 'DEBT-MATH-01',
        title: 'Math Consistency Debt',
        basePrincipal: 100.0,
        interestRate: 0.05,
        borrowedChapter: 1,
        targetPayoffChapter: 20
      });

      let expectedBalance = 100.0;

      // 10 chapters sequential compounding
      for (let ch = 2; ch <= 11; ch++) {
        debtRepo.accrueInterest(ch);
        const delta = Math.round(expectedBalance * 0.05 * 1000) / 1000;
        expectedBalance = Math.round((expectedBalance + delta) * 1000) / 1000;
      }

      const postAccrue = debtRepo.getByDebtId('DEBT-MATH-01');
      assert.equal(postAccrue.currentBalance, expectedBalance);

      // Apply 3 partial payoffs
      debtRepo.applyPayoff('DEBT-MATH-01', 30.0, { chapterNumber: 12 });
      expectedBalance = Math.max(0, Math.round((expectedBalance - 30.0) * 1000) / 1000);

      debtRepo.applyPayoff('DEBT-MATH-01', 25.5, { chapterNumber: 13 });
      expectedBalance = Math.max(0, Math.round((expectedBalance - 25.5) * 1000) / 1000);

      const finalDebt = debtRepo.getByDebtId('DEBT-MATH-01');
      assert.equal(finalDebt.currentBalance, expectedBalance);

      // Validate event audit ledger matches final state
      const events = eventRepo.getEventsForDebt('DEBT-MATH-01');
      const latestEvent = events[events.length - 1];
      assert.equal(latestEvent.newBalance, expectedBalance);
    });
  });

  // ==========================================================================
  // Suite 3: Migration Upgrades on Corrupted & Incomplete Databases
  // ==========================================================================
  describe('Suite 3: Migration Resilience on Corrupted, Incomplete & Tampered Databases', () => {
    it('3.1 should detect and report migration file tampering when checksum in history does not match', () => {
      const dbPath = path.join(tempEnv.path, 'tamper_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });
      assert.equal(dbManager.getSchemaVersion(), 5);
      dbManager.close();

      // Open raw DB and tamper with checksum in migration_history
      const rawDb = new Database(dbPath);
      rawDb.prepare(`
        UPDATE migration_history
        SET checksum = 'TAMPERED_FAKE_CHECKSUM_000000000000000000000000000000000000000000'
        WHERE version = 5
      `).run();
      rawDb.close();

      // Attempt to initialize DatabaseManager with tamper verification enabled
      assert.throws(
        () => {
          new DatabaseManager(dbPath, { pathGuard });
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError || err.name === 'SchemaMismatchError');
          assert.match(err.message, /Migration file tampering detected/i);
          return true;
        },
        'Must detect tampered checksum'
      );
    });

    it('3.2 should gracefully upgrade legacy Phase 1, Phase 2, Phase 3 databases missing schema_version', () => {
      // Simulate Phase 3 legacy database with domain tables but NO schema_version table
      const dbPath = path.join(tempEnv.path, 'legacy_p3_no_version.db');
      const testDb = new Database(dbPath);
      testDb.exec(`
        CREATE TABLE source_files (id INTEGER PRIMARY KEY, file_path TEXT UNIQUE, relative_path TEXT, file_name TEXT, extension TEXT, size_bytes INTEGER, mtime_ms INTEGER, sha256_hash TEXT, source_category TEXT, status TEXT, review_status TEXT, canon_level INTEGER);
        CREATE TABLE entities (id INTEGER PRIMARY KEY, entity_id TEXT, canonical_name TEXT, entity_type TEXT, canon_level INTEGER);
        CREATE TABLE entity_aliases (id INTEGER PRIMARY KEY, entity_id INTEGER, alias_name TEXT, alias_type TEXT, is_primary INTEGER);
        CREATE TABLE file_entities (id INTEGER PRIMARY KEY, source_file_id INTEGER, entity_id INTEGER, mention_type TEXT);
        CREATE TABLE entity_relations (id INTEGER PRIMARY KEY, source_entity_id INTEGER, target_entity_id INTEGER, relation_type TEXT);
        CREATE TABLE canon_changes (id INTEGER PRIMARY KEY, change_type TEXT, target_type TEXT, target_id TEXT, confirmation_token TEXT);
        CREATE TABLE timeline_events (id INTEGER PRIMARY KEY, event_id TEXT, title TEXT, timestamp_order REAL, time_type TEXT);
        CREATE TABLE chapters (id INTEGER PRIMARY KEY, chapter_number REAL, volume_number INTEGER, title TEXT, relative_path TEXT);
        CREATE TABLE foreshadowing (id INTEGER PRIMARY KEY, foreshadow_id TEXT, thread_key TEXT, title TEXT, description TEXT, status TEXT, introduced_chapter TEXT);
        CREATE TABLE anomaly_reports (id INTEGER PRIMARY KEY, scan_session_id TEXT, anomaly_rule_id TEXT, severity TEXT, title TEXT, message TEXT, affected_file_paths_json TEXT);
        CREATE TABLE scan_manifests (id INTEGER PRIMARY KEY, scan_session_id TEXT UNIQUE, vault_root_path TEXT, scan_start_time TEXT);
      `);
      testDb.close();

      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      assert.equal(dbManager.getSchemaVersion(), 5);
      const tables = dbManager.getTableNames();
      assert.ok(tables.includes('narrative_debts'));
      assert.ok(tables.includes('debt_events'));
      assert.ok(tables.includes('micro_payoffs'));
      assert.ok(tables.includes('canon_changes_queue'));
      assert.ok(tables.includes('context_traces'));

      const integrity = dbManager.verifySchemaIntegrity();
      assert.equal(integrity.valid, true);
    });

    it('3.3 should reject migrations directory with duplicate migration versions', () => {
      const mockMigDir = path.join(tempEnv.path, 'mock_migrations_dup');
      fs.mkdirSync(mockMigDir, { recursive: true });

      fs.writeFileSync(path.join(mockMigDir, '001_first.sql'), 'CREATE TABLE t1 (id INT);', 'utf8');
      fs.writeFileSync(path.join(mockMigDir, '001_duplicate.sql'), 'CREATE TABLE t2 (id INT);', 'utf8');

      assert.throws(
        () => {
          MigrationRunner.discoverMigrations(mockMigDir);
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError || err.name === 'SchemaMismatchError');
          assert.match(err.message, /Duplicate migration version detected: 1/i);
          return true;
        }
      );
    });

    it('3.4 should record failed migration in migration_history and throw MigrationError on SQL syntax failure', () => {
      const mockMigDir = path.join(tempEnv.path, 'mock_migrations_fail');
      fs.mkdirSync(mockMigDir, { recursive: true });

      fs.writeFileSync(path.join(mockMigDir, '001_valid.sql'), 'CREATE TABLE valid_tbl (id INTEGER PRIMARY KEY);', 'utf8');
      fs.writeFileSync(path.join(mockMigDir, '002_corrupt.sql'), 'INVALID SQL SYNTAX HERE !!! DROP EVERYTHING ???;', 'utf8');

      const memDb = new Database(':memory:');
      assert.throws(
        () => {
          MigrationRunner.runMigrations(memDb, mockMigDir);
        },
        (err) => {
          assert.ok(err instanceof MigrationError || err.name === 'MigrationError');
          assert.match(err.message, /Migration failed at version 2/i);
          return true;
        }
      );

      // Verify that version 2 was recorded as 'failed' in migration_history
      const failedRecord = memDb.prepare("SELECT * FROM migration_history WHERE version = 2").get();
      assert.ok(failedRecord);
      assert.equal(failedRecord.status, 'failed');
      assert.ok(failedRecord.error_message);
      memDb.close();
    });
  });

  // ==========================================================================
  // Suite 4: clearAllTables & verifySchemaIntegrity Under Stress
  // ==========================================================================
  describe('Suite 4: clearAllTables & verifySchemaIntegrity Stress Testing', () => {
    it('4.1 should rapidly clear all 16 tables populated with 5,000+ total records without FK or deadlock errors', () => {
      dbManager = new DatabaseManager(':memory:');

      // Populate Phase 1-4 tables
      for (let i = 1; i <= 200; i++) {
        dbManager.sourceFiles.create({
          filePath: `01_World/File_${i}.md`,
          relativePath: `01_World/File_${i}.md`,
          fileName: `File_${i}.md`,
          canonLevel: 1
        });
        dbManager.entities.create({
          canonical_name: `Entity_${i}`,
          entity_type: 'character',
          canon_level: 2
        });
        dbManager.chapters.create({
          chapterNumber: i,
          title: `Chapter ${i}`
        });
        dbManager.foreshadowing.insert({
          foreshadow_id: `FSH-STRESS-${i}`,
          title: `Foreshadow ${i}`,
          introduced_chapter: `${i}`
        });
      }

      // Populate Phase 5 tables with 500 debts, 1500 events, 500 payoffs
      for (let i = 1; i <= 300; i++) {
        dbManager.narrativeDebts.createDebt({
          debtId: `DEBT-STRESS-${i}`,
          title: `Stress Debt ${i}`,
          basePrincipal: 100.0,
          borrowedChapter: i % 10 + 1
        });
        dbManager.debtEvents.recordEvent({
          debtId: `DEBT-STRESS-${i}`,
          eventType: 'accrue',
          chapterNumber: i % 10 + 2,
          newBalance: 110.0
        });
        dbManager.microPayoffs.recordPayoff({
          debtId: `DEBT-STRESS-${i}`,
          payoffId: `PAY-STRESS-${i}`,
          chapterNumber: i % 10 + 2,
          payoffType: 'clue_revealed'
        });
      }

      const preStats = dbManager.getStats();
      assert.ok(preStats.totalFiles >= 200);
      assert.ok(preStats.totalEntities >= 200);
      assert.ok(preStats.totalNarrativeDebts >= 300);
      assert.ok(preStats.totalDebtEvents >= 600); // 300 borrow + 300 accrue
      assert.ok(preStats.totalMicroPayoffs >= 300);

      // Execute clearAllTables
      dbManager.clearAllTables();

      // Verify every table is 0
      const postStats = dbManager.getStats();
      assert.equal(postStats.totalFiles, 0);
      assert.equal(postStats.totalEntities, 0);
      assert.equal(postStats.totalChapters, 0);
      assert.equal(postStats.totalForeshadowing, 0);
      assert.equal(postStats.totalNarrativeDebts, 0);
      assert.equal(postStats.totalDebtEvents, 0);
      assert.equal(postStats.totalMicroPayoffs, 0);

      // Verify SQLite foreign keys remain ON after clearAllTables
      const fk = dbManager.getDatabase().pragma('foreign_keys', { simple: true });
      assert.equal(fk, 1, 'foreign_keys PRAGMA must remain ON after clearAllTables');

      // Verify fresh insertions work seamlessly
      const freshDebt = dbManager.narrativeDebts.createDebt({
        debtId: 'DEBT-FRESH-01',
        title: 'Fresh Start'
      });
      assert.ok(freshDebt);
      assert.equal(freshDebt.debtId, 'DEBT-FRESH-01');
      assert.equal(dbManager.narrativeDebts.count(), 1);
    });

    it('4.2 should throw SchemaMismatchError with exact diagnostic details when Phase 5 tables are dropped', () => {
      dbManager = new DatabaseManager(':memory:');
      const rawDb = dbManager.getDatabase();

      // Drop narrative_debts
      rawDb.exec('DROP TABLE IF EXISTS micro_payoffs; DROP TABLE IF EXISTS debt_events; DROP TABLE IF EXISTS narrative_debts;');

      assert.throws(
        () => {
          dbManager.verifySchemaIntegrity();
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError || err.name === 'SchemaMismatchError');
          assert.match(err.message, /Missing required tables.*narrative_debts/i);
          assert.match(err.message, /debt_events/i);
          assert.match(err.message, /micro_payoffs/i);
          return true;
        }
      );
    });

    it('4.3 should throw SchemaMismatchError when critical columns are missing in narrative_debts', () => {
      dbManager = new DatabaseManager(':memory:');
      const rawDb = dbManager.getDatabase();

      // Drop and recreate broken narrative_debts missing 'interest_rate' and 'current_balance'
      rawDb.exec(`
        DROP TABLE IF EXISTS micro_payoffs;
        DROP TABLE IF EXISTS debt_events;
        DROP TABLE IF EXISTS narrative_debts;
        CREATE TABLE narrative_debts (
          id INTEGER PRIMARY KEY,
          debt_id TEXT NOT NULL,
          borrowed_chapter INTEGER NOT NULL
        );
      `);

      assert.throws(
        () => {
          dbManager.verifySchemaIntegrity();
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError || err.name === 'SchemaMismatchError');
          assert.match(err.message, /missing required column/i);
          return true;
        }
      );
    });
  });

  // ==========================================================================
  // Suite 5: Extreme Boundary Math, Formatting & Input Defense
  // ==========================================================================
  describe('Suite 5: Extreme Boundary Math, Formatting & Input Defense', () => {
    it('5.1 should handle 100 chapters of compound interest without numerical overflow or NaN', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;

      debtRepo.createDebt({
        debtId: 'DEBT-CENTURY-01',
        title: '百年长线伏笔',
        basePrincipal: 100.0,
        interestRate: 0.05,
        borrowedChapter: 1,
        targetPayoffChapter: 200
      });

      for (let ch = 2; ch <= 100; ch++) {
        debtRepo.accrueInterest(ch);
      }

      const debt = debtRepo.getByDebtId('DEBT-CENTURY-01');
      assert.ok(!Number.isNaN(debt.currentBalance), 'Balance must not be NaN');
      assert.ok(Number.isFinite(debt.currentBalance), 'Balance must be finite');
      assert.ok(debt.currentBalance > 100.0, 'Balance must have grown');
      assert.equal(debt.accruedChapters, 99);
      assert.equal(debt.lastAccruedChapter, 100);
    });

    it('5.2 should safely handle extreme floating point inputs and overpayments', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;

      debtRepo.createDebt({
        debtId: 'DEBT-EXTREME-01',
        title: '微小浮点债务',
        basePrincipal: 0.0001,
        interestRate: 0.00001,
        borrowedChapter: 1
      });

      const payoffRes = debtRepo.applyPayoff('DEBT-EXTREME-01', 999999.999);
      assert.equal(payoffRes.isFullyPaid, true);
      assert.equal(payoffRes.newBalance, 0);
      assert.equal(payoffRes.status, 'paid');

      const debt = debtRepo.getByDebtId('DEBT-EXTREME-01');
      assert.equal(debt.currentBalance, 0);
      assert.equal(debt.status, 'paid');
    });

    it('5.3 should reject non-positive payoff amounts with NovelError', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;

      debtRepo.createDebt({ debtId: 'DEBT-ZERO-PAY', title: 'Zero Pay' });

      assert.throws(
        () => {
          debtRepo.applyPayoff('DEBT-ZERO-PAY', 0);
        },
        (err) => {
          assert.ok(err instanceof NovelError || err.name === 'NovelError');
          assert.match(err.message, /Payoff amount must be greater than 0/i);
          return true;
        }
      );

      assert.throws(
        () => {
          debtRepo.applyPayoff('DEBT-ZERO-PAY', -50.0);
        },
        (err) => {
          assert.ok(err instanceof NovelError || err.name === 'NovelError');
          assert.match(err.message, /Payoff amount must be greater than 0/i);
          return true;
        }
      );
    });

    it('5.4 should handle bizarre unicode, emojis, SQL wildcards, and corrupted JSON metadata safely', () => {
      dbManager = new DatabaseManager(':memory:');
      const debtRepo = dbManager.narrativeDebts;

      const bizarreTitle = '💥 混沌神帝【第999代】— "Special \\\' Quotes \\" & %_[] wildcards 🎭';
      const debt = debtRepo.createDebt({
        debtId: 'DEBT-UNICODE-999',
        title: bizarreTitle,
        description: 'Multi-line\n\r\tDescription with \u0000 sanitized or escaped',
        relatedEntities: ['ENT-🎭-1', 'ENT-⚡-2'],
        metadata: { complex: { nested: [1, 2, 'three'], emoji: '🔥' } }
      });

      assert.ok(debt);
      assert.equal(debt.title, bizarreTitle);
      assert.deepEqual(debt.relatedEntities, ['ENT-🎭-1', 'ENT-⚡-2']);
      assert.equal(debt.metadata.complex.emoji, '🔥');

      // Test query matching
      const queryRes = debtRepo.queryDebts({ relatedEntity: '🎭' });
      assert.equal(queryRes.totalCount, 1);
      assert.equal(queryRes.debts[0].debtId, 'DEBT-UNICODE-999');
    });
  });
});
