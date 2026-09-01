/**
 * @file decisionQueueRepo.test.js
 * @description Unit test suite for Phase 4 Milestone 1: Migration 004, DecisionQueueRepo, ContextTraceRepo & DatabaseManager
 * @module test/unit/decisionQueueRepo
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const DecisionQueueRepo = require('../../src/db/repositories/DecisionQueueRepo');
const ContextTraceRepo = require('../../src/db/repositories/ContextTraceRepo');
const MigrationRunner = require('../../src/migrations/MigrationRunner');
const { CollaborationError, SchemaMismatchError } = require('../../src/errors');
const { createTempDir } = require('../helpers/tempDir');

describe('Phase 4 Milestone 1: Schema Evolution & Repositories Test Suite', () => {
  let tempEnv = null;
  let dbManager = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m1_phase4_test_');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv) {
      tempEnv.cleanup();
    }
  });

  describe('1. Migration 004 & Schema Verification', () => {
    it('should initialize clean in-memory database with schema_version 4 and Phase 4 tables', () => {
      dbManager = new DatabaseManager(':memory:');
      const tables = dbManager.getTableNames();

      assert.ok(tables.includes('canon_changes_queue'), 'canon_changes_queue table must exist');
      assert.ok(tables.includes('context_traces'), 'context_traces table must exist');

      const version = dbManager.getSchemaVersion();
      assert.equal(version, 4, 'Schema version must be 4');

      const integrity = dbManager.verifySchemaIntegrity();
      assert.equal(integrity.valid, true);
      assert.equal(integrity.schemaVersion, 4);
    });

    it('should record migration 004 in migration_history with checksum and duration', () => {
      dbManager = new DatabaseManager(':memory:');
      const history = dbManager.getMigrationHistory();
      const m4 = history.find((h) => h.version === 4);

      assert.ok(m4, 'Migration 004 record must exist in migration_history');
      assert.equal(m4.status, 'success');
      assert.ok(m4.checksum.length === 64, 'Checksum must be 64-character SHA-256 hex');
      assert.ok(m4.duration_ms >= 0);
    });

    it('should upgrade existing Phase 3 database to Phase 4 without losing existing records', () => {
      const dbPath = path.join(tempEnv.path, 'upgrade_phase3_to_4.db');
      const testDb = new Database(dbPath);

      // Run migrations up to Phase 3 only using custom directory or baseline
      testDb.exec(`
        CREATE TABLE schema_version (version INTEGER PRIMARY KEY, applied_at TEXT, description TEXT);
        INSERT INTO schema_version (version, description) VALUES (3, 'Phase 3 Baseline');
        CREATE TABLE source_files (id INTEGER PRIMARY KEY, file_path TEXT UNIQUE, relative_path TEXT UNIQUE, file_name TEXT, extension TEXT, size_bytes INTEGER, mtime_ms INTEGER, sha256_hash TEXT, source_category TEXT, status TEXT, review_status TEXT, canon_level INTEGER);
        CREATE TABLE entities (id INTEGER PRIMARY KEY, entity_id TEXT, canonical_name TEXT, entity_type TEXT, canon_level INTEGER);
        CREATE TABLE entity_aliases (id INTEGER PRIMARY KEY, entity_id INTEGER, alias_name TEXT, alias_type TEXT, is_primary INTEGER);
        CREATE TABLE file_entities (id INTEGER PRIMARY KEY, source_file_id INTEGER, entity_id INTEGER, mention_type TEXT);
        CREATE TABLE entity_relations (id INTEGER PRIMARY KEY, source_entity_id INTEGER, target_entity_id INTEGER, relation_type TEXT);
        CREATE TABLE canon_changes (id INTEGER PRIMARY KEY, change_type TEXT, target_type TEXT, target_id TEXT, confirmation_token TEXT);
        CREATE TABLE timeline_events (id INTEGER PRIMARY KEY, event_id TEXT, title TEXT, timestamp_order REAL, time_type TEXT);
        CREATE TABLE chapters (id INTEGER PRIMARY KEY, chapter_number REAL, volume_number INTEGER, title TEXT, relative_path TEXT);
        CREATE TABLE foreshadowing (id INTEGER PRIMARY KEY, foreshadow_id TEXT, title TEXT, description TEXT, introduced_chapter TEXT);
        CREATE TABLE anomaly_reports (id INTEGER PRIMARY KEY, scan_session_id TEXT, anomaly_rule_id TEXT, severity TEXT, title TEXT, message TEXT, affected_file_paths_json TEXT);
        CREATE TABLE scan_manifests (id INTEGER PRIMARY KEY, scan_session_id TEXT UNIQUE, vault_root_path TEXT, scan_start_time TEXT);

        INSERT INTO entities (entity_id, canonical_name, entity_type, canon_level) VALUES ('ENT-001', '地球', 'planet', 2);
      `);
      testDb.close();

      const { PathGuard } = require('../../src/security/PathGuard');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      assert.equal(dbManager.getSchemaVersion(), 4);
      const tables = dbManager.getTableNames();
      assert.ok(tables.includes('canon_changes_queue'));
      assert.ok(tables.includes('context_traces'));

      // Verify Phase 3 data intact
      const entity = dbManager.entities.getSingleByEntityId('ENT-001');
      assert.ok(entity);
      assert.equal(entity.canonical_name, '地球');
    });

    it('should be completely idempotent on repeated migration execution', () => {
      dbManager = new DatabaseManager(':memory:');
      const initialVersion = dbManager.getSchemaVersion();
      assert.equal(initialVersion, 4);

      const migrationsDir = path.resolve(__dirname, '../../src/migrations');
      const result = MigrationRunner.runMigrations(dbManager.db, migrationsDir);

      assert.equal(result.alreadyUpToDate, true);
      assert.equal(result.applied.length, 0);
      assert.equal(result.currentVersion, 4);
    });
  });

  describe('2. DecisionQueueRepo Operations & Isolation', () => {
    let repo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      repo = dbManager.decisionQueue;
    });

    it('should enqueue creative decision proposal with default pending status and generated queue_id', () => {
      const proposal = {
        decision_type: 'CREATE_ENTITY',
        proposer: 'VCP-Agent-LoreWriter',
        target_entity_id: 'ENT-STATION-01',
        proposed_changes: {
          canonicalName: '空间中继站',
          entityType: 'station',
          attributes: { altitudeKm: 36000 }
        },
        rationale: '第5章引入的轨道通信中继站',
        chapter_id: '5',
        tags: ['space_station', 'relay']
      };

      const result = repo.enqueue(proposal);
      assert.ok(result);
      assert.ok(result.id > 0);
      assert.ok(result.queueId.startsWith('dec_'));
      assert.equal(result.decisionType, 'CREATE_ENTITY');
      assert.equal(result.proposer, 'VCP-Agent-LoreWriter');
      assert.equal(result.status, 'pending_author_confirmation');
      assert.equal(result.sourceSystem, 'NovelEngineering');
      assert.equal(result.authority, 'agent_proposal');
      assert.equal(result.proposedChanges.canonicalName, '空间中继站');
      assert.deepEqual(result.tags, ['space_station', 'relay']);
      assert.ok(result.sha256Hash.length === 64);
    });

    it('should retrieve enqueued decision by queue_id and integer id', () => {
      const created = repo.enqueue({
        decisionType: 'ADD_WORLD_RULE',
        proposer: 'VCP-Agent-Physicist',
        targetEntityId: 'RULE-WARP-01',
        proposedChanges: { title: '曲率驱动热耗散定律', ruleLevel: 'local' },
        rationale: '设定约束'
      });

      const byQueueId = repo.getByQueueId(created.queueId);
      assert.ok(byQueueId);
      assert.equal(byQueueId.id, created.id);
      assert.equal(byQueueId.targetEntityId, 'RULE-WARP-01');

      const byId = repo.getById(created.id);
      assert.ok(byId);
      assert.equal(byId.queueId, created.queueId);
    });

    it('should update status on review (approve / reject)', () => {
      const created = repo.enqueue({
        decisionType: 'UPDATE_ENTITY',
        proposer: 'Agent-1',
        targetEntityId: 'ENT-001',
        proposedChanges: { population: '50亿' }
      });

      assert.equal(created.status, 'pending_author_confirmation');

      const reviewed = repo.reviewDecision(created.queueId, {
        status: 'approved',
        reviewedBy: 'HumanAuthor',
        reviewComment: '符合第5章背景设定'
      });

      assert.equal(reviewed.status, 'approved');
      assert.equal(reviewed.reviewedBy, 'HumanAuthor');
      assert.equal(reviewed.reviewComment, '符合第5章背景设定');
      assert.ok(reviewed.reviewedAt !== null);
    });

    it('should query decisions with flexible filters and getPending shorthand', () => {
      repo.enqueue({ decisionType: 'CREATE_ENTITY', proposer: 'Agent-A', proposedChanges: { name: 'A' }, priority: 'high' });
      repo.enqueue({ decisionType: 'CREATE_ENTITY', proposer: 'Agent-B', proposedChanges: { name: 'B' }, priority: 'normal' });
      const itemC = repo.enqueue({ decisionType: 'UPDATE_ENTITY', proposer: 'Agent-A', proposedChanges: { name: 'C' }, priority: 'low' });

      repo.updateStatus(itemC.queueId, 'rejected', { reviewedBy: 'Author' });

      const pending = repo.getPending();
      assert.equal(pending.length, 2);

      const agentAAll = repo.query({ proposer: 'Agent-A' });
      assert.equal(agentAAll.length, 2);

      const highPriority = repo.query({ priority: 'high' });
      assert.equal(highPriority.length, 1);
      assert.equal(highPriority[0].proposer, 'Agent-A');
    });

    it('should batch enqueue multiple proposals inside a transaction', () => {
      const items = [
        { decisionType: 'CREATE_ENTITY', proposer: 'BatchAgent', proposedChanges: { id: 1 } },
        { decisionType: 'CREATE_ENTITY', proposer: 'BatchAgent', proposedChanges: { id: 2 } },
        { decisionType: 'CREATE_ENTITY', proposer: 'BatchAgent', proposedChanges: { id: 3 } }
      ];

      const results = repo.batchEnqueue(items);
      assert.equal(results.length, 3);
      assert.equal(repo.count({ proposer: 'BatchAgent' }), 3);
    });

    it('should compute aggregate summary statistics', () => {
      repo.enqueue({ decisionType: 'CREATE_ENTITY', proposer: 'Agent-1', proposedChanges: { a: 1 } });
      const item2 = repo.enqueue({ decisionType: 'UPDATE_ENTITY', proposer: 'Agent-2', proposedChanges: { a: 2 } });
      repo.updateStatus(item2.queueId, 'approved', { reviewedBy: 'Author' });

      const summary = repo.getSummary();
      assert.equal(summary.totalDecisions, 2);
      assert.equal(summary.pendingCount, 1);
      assert.equal(summary.approvedCount, 1);
      assert.equal(summary.byDecisionType['CREATE_ENTITY'], 1);
      assert.equal(summary.byDecisionType['UPDATE_ENTITY'], 1);
    });

    it('should delete decision by queue_id and id', () => {
      const created = repo.enqueue({ decisionType: 'CREATE_ENTITY', proposer: 'Agent-Del', proposedChanges: { name: 'To Delete' } });
      assert.ok(repo.getByQueueId(created.queueId));

      const deleted = repo.deleteByQueueId(created.queueId);
      assert.equal(deleted, true);
      assert.equal(repo.getByQueueId(created.queueId), null);

      const created2 = repo.enqueue({ decisionType: 'CREATE_ENTITY', proposer: 'Agent-Del2', proposedChanges: { name: 'To Delete 2' } });
      assert.ok(repo.getById(created2.id));
      const deleted2 = repo.deleteById(created2.id);
      assert.equal(deleted2, true);
      assert.equal(repo.getById(created2.id), null);
    });

    it('should throw CollaborationError when required fields are missing', () => {
      assert.throws(
        () => repo.enqueue({ proposer: 'Agent' }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.DECISION_QUEUE_ERROR
      );

      assert.throws(
        () => repo.enqueue({ decision_type: 'CREATE_ENTITY' }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.DECISION_QUEUE_ERROR
      );

      assert.throws(
        () => repo.enqueue({ decision_type: 'CREATE_ENTITY', proposer: 'Agent' }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.DECISION_QUEUE_ERROR
      );
    });

    it('CRITICAL QUEUE ISOLATION: 100-call agent bombardment must strictly isolate data in canon_changes_queue without touching canon facts', () => {
      const initialEntityCount = dbManager.entities.count();
      const initialFileCount = dbManager.sourceFiles.count();
      const initialCanonChangesCount = dbManager.canonChanges.count();
      const initialChaptersCount = dbManager.chapters.count();
      const initialTimelineCount = dbManager.timeline.count();

      for (let i = 0; i < 100; i++) {
        repo.enqueue({
          decisionType: 'CREATE_ENTITY',
          proposer: `SpamAgent-${i}`,
          targetEntityId: `SPAM-ENT-${i}`,
          proposedChanges: { name: `Spam Entity ${i}`, status: 'active', canonLevel: 3 },
          rationale: 'Bombardment attack simulation'
        });
      }

      // Assert queue has 100 pending proposals
      assert.equal(repo.count(), 100);
      assert.equal(repo.getPending().length, 100);

      // Assert core tables remain 100% UNMUTATED
      assert.equal(dbManager.entities.count(), initialEntityCount, 'entities table MUST NOT be mutated');
      assert.equal(dbManager.sourceFiles.count(), initialFileCount, 'source_files table MUST NOT be mutated');
      assert.equal(dbManager.canonChanges.count(), initialCanonChangesCount, 'canon_changes audit table MUST NOT be mutated');
      assert.equal(dbManager.chapters.count(), initialChaptersCount, 'chapters table MUST NOT be mutated');
      assert.equal(dbManager.timeline.count(), initialTimelineCount, 'timeline_events table MUST NOT be mutated');
    });
  });

  describe('3. ContextTraceRepo Lineage Operations', () => {
    let traceRepo = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      traceRepo = dbManager.contextTraces;
    });

    it('should save and retrieve context lineage trace with full metadata', () => {
      const traceData = {
        snapshotId: 'snap_20260831_120000_abcd',
        projectId: 'default',
        chapterId: '5',
        volumeNumber: 1,
        focusEntities: ['ENT-TERRA', 'CHAR-LIN'],
        totalSources: 3,
        traceItems: [
          {
            sourceFileId: 1,
            sourceFilePath: '01_Worldview/Cosmology.md',
            sourceSystem: 'NovelEngineering',
            authority: 'canon',
            sha256Stamp: '1111111111111111111111111111111111111111111111111111111111111111'
          },
          {
            sourceFileId: 3,
            sourceFilePath: '04_Planets/Terra.md',
            sourceSystem: 'NovelEngineering',
            authority: 'canon',
            sha256Stamp: '3333333333333333333333333333333333333333333333333333333333333333'
          },
          {
            sourceFileId: null,
            sourceFilePath: 'virtual/rag/CAND-01',
            sourceSystem: 'VCP-RAG',
            authority: 'candidate',
            sha256Stamp: '8888888888888888888888888888888888888888888888888888888888888888'
          }
        ],
        budgetStats: { totalTokens: 3500, maxTokens: 8000, isTruncated: false },
        sourceSystems: { NovelEngineering: 2, 'VCP-RAG': 1 },
        authorities: { canon: 2, candidate: 1 }
      };

      const saved = traceRepo.saveTrace(traceData);
      assert.ok(saved);
      assert.ok(saved.id > 0);
      assert.equal(saved.snapshotId, 'snap_20260831_120000_abcd');
      assert.ok(saved.traceId.startsWith('trc_'));
      assert.equal(saved.totalSources, 3);
      assert.equal(saved.traceItems.length, 3);
      assert.equal(saved.budgetStats.totalTokens, 3500);
      assert.equal(saved.sourceSystems.NovelEngineering, 2);

      const bySnapshot = traceRepo.getBySnapshotId('snap_20260831_120000_abcd');
      assert.ok(bySnapshot);
      assert.equal(bySnapshot.traceId, saved.traceId);

      const byTrace = traceRepo.getByTraceId(saved.traceId);
      assert.ok(byTrace);
      assert.equal(byTrace.snapshotId, 'snap_20260831_120000_abcd');

      const byId = traceRepo.getById(saved.id);
      assert.ok(byId);
      assert.equal(byId.snapshotId, 'snap_20260831_120000_abcd');
    });

    it('should query traces and get recent traces', () => {
      traceRepo.saveTrace({ snapshotId: 'snap_001', chapterId: '1', traceItems: [{ id: 1 }] });
      traceRepo.saveTrace({ snapshotId: 'snap_002', chapterId: '2', traceItems: [{ id: 2 }] });

      const queried = traceRepo.query({ chapterId: '1' });
      assert.equal(queried.length, 1);
      assert.equal(queried[0].snapshotId, 'snap_001');

      const recent = traceRepo.getRecentTraces(10);
      assert.equal(recent.length, 2);

      const count = traceRepo.count({ chapterId: '2' });
      assert.equal(count, 1);
    });

    it('should throw CollaborationError when saving trace without snapshot_id or traceItems', () => {
      assert.throws(
        () => traceRepo.saveTrace({ traceItems: [] }),
        (err) => err instanceof CollaborationError
      );

      assert.throws(
        () => traceRepo.saveTrace({ snapshotId: 'snap_001' }),
        (err) => err instanceof CollaborationError
      );
    });

    it('should delete trace by snapshot_id or trace_id or id', () => {
      const saved = traceRepo.saveTrace({
        snapshotId: 'snap_to_delete',
        traceItems: [{ id: 1 }]
      });

      assert.ok(traceRepo.getBySnapshotId('snap_to_delete'));
      const deleted = traceRepo.deleteBySnapshotId('snap_to_delete');
      assert.equal(deleted, true);
      assert.equal(traceRepo.getBySnapshotId('snap_to_delete'), null);

      const saved2 = traceRepo.saveTrace({
        snapshotId: 'snap_to_delete_2',
        traceItems: [{ id: 2 }]
      });
      const deleted2 = traceRepo.deleteByTraceId(saved2.traceId);
      assert.equal(deleted2, true);
      assert.equal(traceRepo.getByTraceId(saved2.traceId), null);

      const saved3 = traceRepo.saveTrace({
        snapshotId: 'snap_to_delete_3',
        traceItems: [{ id: 3 }]
      });
      const deleted3 = traceRepo.deleteById(saved3.id);
      assert.equal(deleted3, true);
      assert.equal(traceRepo.getById(saved3.id), null);
    });
  });

  describe('4. DatabaseManager Mount & Delegates', () => {
    it('should provide mounted repositories and high-level interface delegates', () => {
      dbManager = new DatabaseManager(':memory:');

      assert.ok(dbManager.decisionQueue instanceof DecisionQueueRepo);
      assert.ok(dbManager.contextTraces instanceof ContextTraceRepo);

      // Delegate tests
      const decision = dbManager.enqueueDecision({
        decisionType: 'CREATE_ENTITY',
        proposer: 'DelegateAgent',
        proposedChanges: { name: 'Delegate Entity' }
      });
      assert.ok(decision);

      const pending = dbManager.getPendingDecisions();
      assert.equal(pending.length, 1);

      const trace = dbManager.saveContextTrace({
        snapshotId: 'snap_delegate_01',
        traceItems: [{ source: 'test' }]
      });
      assert.ok(trace);

      const retrievedTrace = dbManager.getContextTrace('snap_delegate_01');
      assert.ok(retrievedTrace);
      assert.equal(retrievedTrace.snapshotId, 'snap_delegate_01');
    });

    it('should update getStats to include totalDecisionQueue and totalContextTraces', () => {
      dbManager = new DatabaseManager(':memory:');
      dbManager.enqueueDecision({ decisionType: 'CREATE_ENTITY', proposer: 'A', proposedChanges: {} });
      dbManager.saveContextTrace({ snapshotId: 'snap_stats_01', traceItems: [] });

      const stats = dbManager.getStats();
      assert.equal(stats.schemaVersion, 4);
      assert.equal(stats.totalDecisionQueue, 1);
      assert.equal(stats.totalContextTraces, 1);
    });

    it('should clear all tables including decision queue and context traces without foreign key violations', () => {
      dbManager = new DatabaseManager(':memory:');
      dbManager.enqueueDecision({ decisionType: 'CREATE_ENTITY', proposer: 'A', proposedChanges: {} });
      dbManager.saveContextTrace({ snapshotId: 'snap_clear_01', traceItems: [] });

      assert.equal(dbManager.decisionQueue.count(), 1);
      assert.equal(dbManager.contextTraces.count(), 1);

      dbManager.clearAllTables();

      assert.equal(dbManager.decisionQueue.count(), 0);
      assert.equal(dbManager.contextTraces.count(), 0);
    });
  });
});
