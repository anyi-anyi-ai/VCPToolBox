/**
 * @file m1_phase4_challenger_stress.test.js
 * @description Adversarial Stress & Chaos Test Suite for Phase 4 Milestone 1 (DecisionQueueRepo & ContextTraceRepo)
 * @module test/unit/m1_phase4_challenger_stress
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const path = require('path');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const DecisionQueueRepo = require('../../src/db/repositories/DecisionQueueRepo');
const ContextTraceRepo = require('../../src/db/repositories/ContextTraceRepo');
const { CollaborationError, NovelError } = require('../../src/errors');
const { createTempDir } = require('../helpers/tempDir');

describe('Phase 4 Milestone 1: Challenger 1 Adversarial Stress Test Suite', () => {
  let tempEnv = null;
  let dbManager = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_challenger_stress_');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv) {
      tempEnv.cleanup();
    }
  });

  // ==========================================================================
  // 1. 1000-Call Spam Flood & Queue Isolation Test
  // ==========================================================================
  describe('1. 1000-Call Spam Flood & Absolute Canon Isolation', () => {
    it('CRITICAL ISOLATION: 1000-call spam flood on enqueue must keep core canon tables 100% unmutated', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      // Seed initial canon data
      const entity1 = dbManager.entities.create({
        canonical_name: 'Alpha Centauri Station',
        entity_type: 'location',
        canon_level: 2,
        description: 'Prime orbital settlement'
      });
      const file1 = dbManager.sourceFiles.create({
        filePath: '01_World/Station.md',
        relativePath: '01_World/Station.md',
        fileName: 'Station.md',
        extension: '.md',
        sizeBytes: 1024,
        sourceCategory: 'worldview',
        canonLevel: 2
      });
      const chapter1 = dbManager.chapters.create({
        chapterNumber: 1,
        volumeNumber: 1,
        title: 'Prologue',
        relativePath: '02_Chapters/Chapter_01.md'
      });
      const timeline1 = dbManager.timeline.create({
        eventId: 'EVT-001',
        title: 'Station Construction',
        timestampOrder: 1.0,
        timeType: 'explicit'
      });

      // Capture pre-flood baseline state
      const initialEntityCount = dbManager.entities.count();
      const initialFileCount = dbManager.sourceFiles.count();
      const initialCanonChangesCount = dbManager.canonChanges.count();
      const initialChaptersCount = dbManager.chapters.count();
      const initialTimelineCount = dbManager.timeline.count();

      assert.equal(initialEntityCount, 1);
      assert.equal(initialFileCount, 1);
      assert.equal(initialChaptersCount, 1);
      assert.equal(initialTimelineCount, 1);

      // Perform 1000 rapid spam enqueue calls
      const decisionTypes = ['CREATE_ENTITY', 'UPDATE_ENTITY', 'DELETE_ENTITY', 'MERGE_ENTITIES', 'ADD_WORLD_RULE'];
      const priorities = ['low', 'normal', 'high', 'urgent'];

      for (let i = 0; i < 1000; i++) {
        const type = decisionTypes[i % decisionTypes.length];
        const prio = priorities[i % priorities.length];
        const res = queueRepo.enqueue({
          decisionType: type,
          proposer: `ChaosBot-${i % 10}`,
          targetEntityId: `ENT-CHAOS-${i}`,
          proposedChanges: {
            name: `Hostile Mutation Attempt ${i}`,
            tamperField: 'OVERRIDE_CORE_FACT',
            iteration: i,
            payload: { nested: `data_${i}`, secure: true }
          },
          rationale: `Stress bombardment iteration ${i}`,
          chapterId: String((i % 20) + 1),
          priority: prio,
          tags: [`spam_${i % 5}`, 'stress_test']
        });

        assert.ok(res.id > 0);
        assert.ok(res.queueId.startsWith('dec_'));
        assert.equal(res.status, 'pending_author_confirmation');
      }

      // Assert queue has exactly 1000 records
      assert.equal(queueRepo.count(), 1000);
      assert.equal(queueRepo.getPending().length, 1000);

      // Assert core tables remain 100% UNMUTATED
      assert.equal(dbManager.entities.count(), initialEntityCount, 'entities table MUST remain unmutated');
      assert.equal(dbManager.sourceFiles.count(), initialFileCount, 'source_files table MUST remain unmutated');
      assert.equal(dbManager.canonChanges.count(), initialCanonChangesCount, 'canon_changes audit table MUST remain unmutated');
      assert.equal(dbManager.chapters.count(), initialChaptersCount, 'chapters table MUST remain unmutated');
      assert.equal(dbManager.timeline.count(), initialTimelineCount, 'timeline_events table MUST remain unmutated');

      // Verify original records are bit-for-bit intact
      const fetchedEntity = dbManager.entities.getById(entity1.id);
      assert.equal(fetchedEntity.canonical_name, 'Alpha Centauri Station');

      const fetchedFile = dbManager.sourceFiles.getById(file1.id);
      assert.equal(fetchedFile.file_path, '01_World/Station.md');

      const summary = queueRepo.getSummary();
      assert.equal(summary.totalDecisions, 1000);
      assert.equal(summary.pendingCount, 1000);
      assert.equal(summary.approvedCount, 0);
      assert.equal(summary.rejectedCount, 0);
    });
  });

  // ==========================================================================
  // 2. Batch Enqueue & Transaction Atomicity Under Pressure
  // ==========================================================================
  describe('2. Batch Operations & Transaction Atomicity', () => {
    it('should handle large 500-item batchEnqueue cleanly inside single ACID transaction', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      const batchData = [];
      for (let i = 0; i < 500; i++) {
        batchData.push({
          decisionType: 'ADD_WORLD_RULE',
          proposer: `BatchAgent-${i % 5}`,
          proposedChanges: { ruleId: `RULE-${i}`, statement: `Thermodynamic law ${i}` },
          priority: i % 2 === 0 ? 'high' : 'normal'
        });
      }

      const results = queueRepo.batchEnqueue(batchData);
      assert.equal(results.length, 500);
      assert.equal(queueRepo.count(), 500);

      // Verify order and properties
      assert.equal(results[0].proposedChanges.ruleId, 'RULE-0');
      assert.equal(results[499].proposedChanges.ruleId, 'RULE-499');
    });

    it('should safely return empty array on empty or non-array batch input', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      assert.deepEqual(queueRepo.batchEnqueue([]), []);
      assert.deepEqual(queueRepo.batchEnqueue(null), []);
      assert.deepEqual(queueRepo.batchEnqueue(undefined), []);
      assert.deepEqual(queueRepo.batchEnqueue('invalid'), []);
    });

    it('should fail atomically if an item in the batch violates constraints', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      const badBatch = [
        { decisionType: 'VALID_1', proposer: 'Agent-1', proposedChanges: { ok: 1 } },
        { decisionType: null, proposer: 'Agent-2', proposedChanges: { bad: 1 } }, // Invalid!
        { decisionType: 'VALID_3', proposer: 'Agent-3', proposedChanges: { ok: 3 } }
      ];

      assert.throws(
        () => queueRepo.batchEnqueue(badBatch),
        (err) => err instanceof CollaborationError
      );

      // Verify zero items inserted
      assert.equal(queueRepo.count(), 0);
    });
  });

  // ==========================================================================
  // 3. Status Transitions & Review Workflow
  // ==========================================================================
  describe('3. Status Transitions & Review Workflow Stress', () => {
    it('should handle full lifecycle: pending -> approved -> applied / rejected / cancelled', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      const item = queueRepo.enqueue({
        decisionType: 'MODIFY_RELATION',
        proposer: 'Agent-LifeCycle',
        proposedChanges: { source: 'A', target: 'B', rel: 'allies' }
      });

      assert.equal(item.status, 'pending_author_confirmation');

      // 1. Approve
      const approved = queueRepo.updateStatus(item.queueId, 'approved', {
        reviewedBy: 'ChiefEditor',
        reviewComment: 'Approved for production'
      });
      assert.equal(approved.status, 'approved');
      assert.equal(approved.reviewedBy, 'ChiefEditor');
      assert.equal(approved.reviewComment, 'Approved for production');

      // 2. Mark Applied
      const applied = queueRepo.updateStatus(item.id, 'applied', {
        reviewedBy: 'SystemSyncWorker',
        reviewComment: 'Applied to canon in Chapter 12'
      });
      assert.equal(applied.status, 'applied');
      assert.equal(applied.reviewedBy, 'SystemSyncWorker');

      // Summary reflects state
      const summary = queueRepo.getSummary();
      assert.equal(summary.appliedCount, 1);
      assert.equal(summary.pendingCount, 0);
    });

    it('should throw CollaborationError with DECISION_NOT_FOUND when reviewing non-existent record', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      assert.throws(
        () => queueRepo.updateStatus('queue_non_existent_99999', 'approved'),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.DECISION_NOT_FOUND
      );

      assert.throws(
        () => queueRepo.updateStatus(999999, 'rejected'),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.DECISION_NOT_FOUND
      );
    });

    it('should throw CollaborationError when reviewDecision is called without status', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      const item = queueRepo.enqueue({
        decisionType: 'TEST',
        proposer: 'Agent',
        proposedChanges: {}
      });

      assert.throws(
        () => queueRepo.reviewDecision(item.queueId, {}),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.DECISION_QUEUE_ERROR
      );
    });
  });

  // ==========================================================================
  // 4. Corrupted Payloads, SQL Injection Attempts & SHA-256 Integrity
  // ==========================================================================
  describe('4. Corrupted Payloads, SQL Injection & Defensive Validation', () => {
    it('should reject non-object and null payloads with CollaborationError', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      assert.throws(() => queueRepo.enqueue(null), (err) => err instanceof CollaborationError);
      assert.throws(() => queueRepo.enqueue(undefined), (err) => err instanceof CollaborationError);
      assert.throws(() => queueRepo.enqueue('string_payload'), (err) => err instanceof CollaborationError);
      assert.throws(() => queueRepo.enqueue(12345), (err) => err instanceof CollaborationError);
      assert.throws(() => queueRepo.enqueue(true), (err) => err instanceof CollaborationError);
    });

    it('should resist SQL injection attempts in string fields and store them literally', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      const injectionString = "'); DROP TABLE canon_changes_queue; SELECT ('";
      const item = queueRepo.enqueue({
        decisionType: 'SQL_INJECTION_PROBE',
        proposer: injectionString,
        targetEntityId: injectionString,
        proposedChanges: { payload: injectionString },
        rationale: injectionString
      });

      assert.ok(item);
      assert.equal(item.proposer, injectionString);
      assert.equal(item.targetEntityId, injectionString);
      assert.equal(item.rationale, injectionString);

      // Verify table still exists and has 1 record
      assert.equal(queueRepo.count(), 1);
    });

    it('should compute exact deterministic SHA-256 hash of proposed_changes_json', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      const proposed = { key1: 'value1', nested: [1, 2, 3] };
      const expectedJson = JSON.stringify(proposed);
      const expectedHash = crypto.createHash('sha256').update(expectedJson, 'utf8').digest('hex');

      const item = queueRepo.enqueue({
        decisionType: 'VERIFY_HASH',
        proposer: 'HasherAgent',
        proposedChanges: proposed
      });

      assert.equal(item.sha256Hash, expectedHash);
      assert.equal(item.sha256_hash, expectedHash);
    });

    it('should gracefully handle corrupt or non-JSON strings stored in JSON columns during hydration', () => {
      dbManager = new DatabaseManager(':memory:');
      const queueRepo = dbManager.decisionQueue;

      // Manually insert row with non-JSON string in proposed_changes_json and tags_json
      const sql = `
        INSERT INTO canon_changes_queue (
          queue_id, project_id, decision_type, proposer, proposed_changes_json, tags_json
        ) VALUES (
          'queue_corrupt_01', 'default', 'CORRUPT_TEST', 'CorruptAgent', '{invalid-json-string', 'not-a-json-array'
        )
      `;
      dbManager.db.prepare(sql).run();

      const hydrated = queueRepo.getByQueueId('queue_corrupt_01');
      assert.ok(hydrated);
      assert.equal(hydrated.queueId, 'queue_corrupt_01');
      assert.equal(hydrated.proposedChanges, '{invalid-json-string');
      assert.equal(hydrated.tags, 'not-a-json-array');
    });
  });

  // ==========================================================================
  // 5. ContextTraceRepo Lineage Upsert Collision & Provenance Stress
  // ==========================================================================
  describe('5. ContextTraceRepo Upsert Collisions & Provenance Stress', () => {
    it('should handle repeated upserts on the same snapshot_id idempotently without creating duplicate rows', () => {
      dbManager = new DatabaseManager(':memory:');
      const traceRepo = dbManager.contextTraces;

      const snapshotId = 'snap_collision_test_001';

      // 1. Initial save
      const firstSave = traceRepo.saveTrace({
        snapshotId,
        projectId: 'project_alpha',
        chapterId: '1',
        volumeNumber: 1,
        focusEntities: ['ENT-01'],
        traceItems: [
          { sourceFilePath: '01_World/A.md', authority: 'canon' }
        ],
        budgetStats: { totalTokens: 1000 }
      });

      assert.ok(firstSave);
      assert.equal(firstSave.snapshotId, snapshotId);
      assert.equal(firstSave.totalSources, 1);
      assert.equal(traceRepo.count(), 1);

      // 2. Second save with updated lineage on SAME snapshot_id
      const secondSave = traceRepo.saveTrace({
        snapshotId,
        projectId: 'project_alpha',
        chapterId: '1',
        volumeNumber: 1,
        focusEntities: ['ENT-01', 'ENT-02'],
        traceItems: [
          { sourceFilePath: '01_World/A.md', authority: 'canon' },
          { sourceFilePath: '02_World/B.md', authority: 'candidate' }
        ],
        budgetStats: { totalTokens: 2500 }
      });

      // Assert count is still exactly 1 (no duplicate rows)
      assert.equal(traceRepo.count(), 1);
      assert.equal(secondSave.snapshotId, snapshotId);
      assert.equal(secondSave.id, firstSave.id);
      assert.equal(secondSave.totalSources, 2);
      assert.equal(secondSave.focusEntities.length, 2);
      assert.equal(secondSave.budgetStats.totalTokens, 2500);

      // Fetch by snapshotId
      const fetched = traceRepo.getBySnapshotId(snapshotId);
      assert.equal(fetched.totalSources, 2);
      assert.equal(fetched.focusEntities[1], 'ENT-02');
    });

    it('should stress-test 300 sequential trace saves and verify pagination and filtering', () => {
      dbManager = new DatabaseManager(':memory:');
      const traceRepo = dbManager.contextTraces;

      for (let i = 0; i < 300; i++) {
        traceRepo.saveTrace({
          snapshotId: `snap_batch_${i}`,
          projectId: i % 2 === 0 ? 'project_even' : 'project_odd',
          chapterId: String((i % 10) + 1),
          volumeNumber: Math.floor(i / 100) + 1,
          focusEntities: [`ENT-${i}`],
          traceItems: [{ source: `File_${i}.md`, index: i }],
          budgetStats: { tokens: 500 + i }
        });
      }

      assert.equal(traceRepo.count(), 300);
      assert.equal(traceRepo.count({ projectId: 'project_even' }), 150);
      assert.equal(traceRepo.count({ chapterId: '5' }), 30);

      // Test pagination
      const page1 = traceRepo.query({ projectId: 'project_even', limit: 20, offset: 0 });
      assert.equal(page1.length, 20);

      const page2 = traceRepo.query({ projectId: 'project_even', limit: 20, offset: 20 });
      assert.equal(page2.length, 20);
      assert.notEqual(page1[0].id, page2[0].id);

      const recent = traceRepo.getRecentTraces(15);
      assert.equal(recent.length, 15);
    });

    it('should reject invalid trace payloads missing snapshot_id or trace_items', () => {
      dbManager = new DatabaseManager(':memory:');
      const traceRepo = dbManager.contextTraces;

      assert.throws(
        () => traceRepo.saveTrace({ traceItems: [{ file: 'test.md' }] }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceRepo.saveTrace({ snapshotId: 'snap_missing_items' }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceRepo.saveTrace(null),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );
    });

    it('should hydrate corrupt JSON strings in context_traces gracefully', () => {
      dbManager = new DatabaseManager(':memory:');
      const traceRepo = dbManager.contextTraces;

      // Direct insert with invalid JSON in budget_stats_json
      const sql = `
        INSERT INTO context_traces (
          trace_id, snapshot_id, project_id, trace_items_json, budget_stats_json
        ) VALUES (
          'trc_corrupt_01', 'snap_corrupt_01', 'default', '[]', '{invalid-budget-json'
        )
      `;
      dbManager.db.prepare(sql).run();

      const fetched = traceRepo.getBySnapshotId('snap_corrupt_01');
      assert.ok(fetched);
      assert.equal(fetched.budgetStats, '{invalid-budget-json');
    });
  });

  // ==========================================================================
  // 6. CollaborationError Typed Hierarchy & Error Code Enforcement
  // ==========================================================================
  describe('6. CollaborationError Hierarchy & Code Completeness', () => {
    it('should properly extend NovelError and support all defined collaboration error codes', () => {
      const err = new CollaborationError('Test collaboration failure', CollaborationError.CODES.CANON_LEAKAGE_DETECTED, {
        details: 'Unauthorized canon modification'
      });

      assert.ok(err instanceof Error);
      assert.ok(err instanceof NovelError);
      assert.ok(err instanceof CollaborationError);
      assert.equal(err.name, 'CollaborationError');
      assert.equal(err.code, 'CANON_LEAKAGE_DETECTED');
      assert.equal(err.context.details, 'Unauthorized canon modification');

      // Verify all required error codes exist
      const expectedCodes = [
        'COLLABORATION_ERROR',
        'SEMANTIC_OVERRIDE_PREVENTED',
        'TRACE_NOT_FOUND',
        'INTEGRITY_COMPROMISED',
        'DECISION_QUEUE_ERROR',
        'DECISION_NOT_FOUND',
        'DECISION_ALREADY_REVIEWED',
        'MEMORY_PUBLISH_ERROR',
        'CANON_LEAKAGE_DETECTED',
        'CONTEXT_BUDGET_EXCEEDED',
        'INVALID_COLLABORATION_PAYLOAD'
      ];

      for (const code of expectedCodes) {
        assert.ok(CollaborationError.CODES[code], `CollaborationError.CODES.${code} must be defined`);
      }
    });
  });
});
