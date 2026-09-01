/**
 * @file traceManager.test.js
 * @description Comprehensive unit tests for TraceManager (Category B: Context Snapshot Reproducibility, Lineage Retrieval & Live SHA-256 Integrity Verification).
 * @module test/unit/traceManager
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DatabaseManager = require('../../src/db/DatabaseManager');
const TraceManager = require('../../src/collaboration/TraceManager');
const VCPContextBuilder = require('../../src/collaboration/VCPContextBuilder');
const { CollaborationError } = require('../../src/errors');
const { createTempDir } = require('../helpers/tempDir');

describe('Phase 4 Milestone 2: Category B - TraceManager Test Suite', () => {
  let dbManager;
  let traceManager;
  let tempEnv;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    traceManager = new TraceManager(dbManager);
    tempEnv = createTempDir('trace_test_');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) dbManager.close();
    if (tempEnv && tempEnv.cleanup) tempEnv.cleanup();
  });

  describe('Category B: Context Snapshot Reproducibility & Lineage Verification', () => {
    it('B-1: 100% Deterministic Idempotency across runs', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES ('orbit_dock', '星轨船坞', 'dock', 'active', 'confirmed', 2)
      `).run();

      const contextBuilder = new VCPContextBuilder(dbManager);

      const res1 = contextBuilder.buildContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        focusEntities: ['星轨船坞'],
        authorDirectives: ['保持冷静'],
        semanticCandidates: [{ candidateId: 'cand_1', title: '参考材料', content: '甲板结构' }]
      });

      const res2 = contextBuilder.buildContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        focusEntities: ['星轨船坞'],
        authorDirectives: ['保持冷静'],
        semanticCandidates: [{ candidateId: 'cand_1', title: '参考材料', content: '甲板结构' }]
      });

      // Assert structural and hash idempotency
      assert.strictEqual(res1.authorDirectives[0].sha256Hash, res2.authorDirectives[0].sha256Hash);
      assert.strictEqual(res1.canonFacts.length, res2.canonFacts.length);
      assert.strictEqual(res1.semanticCandidates[0].sha256Hash, res2.semanticCandidates[0].sha256Hash);
      assert.strictEqual(res1.sourceTrace.length, res2.sourceTrace.length);
    });

    it('B-2: Context Trace Auto-Persistence & Retrieval by snapshotId', () => {
      const trace = traceManager.saveTrace({
        snapshotId: 'snap_b2_001',
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        totalSources: 2,
        traceItems: [
          { sourceFileId: 1, sourceSystem: 'NovelEngineering', sha256: 'a'.repeat(64), authority: 'canon_core' },
          { sourceFileId: 2, sourceSystem: 'VCP-RAG', sha256: 'b'.repeat(64), authority: 'semantic_candidate' }
        ],
        budgetStats: { maxTokens: 30000, estimatedTokens: 500, trimmed: false }
      });

      assert.ok(trace);
      assert.strictEqual(trace.snapshot_id, 'snap_b2_001');

      const retrieved = traceManager.getTraceBySnapshotId('snap_b2_001');
      assert.ok(retrieved);
      assert.strictEqual(retrieved.snapshotId, 'snap_b2_001');
      assert.strictEqual(retrieved.projectId, '流浪');
      assert.strictEqual(retrieved.totalSources, 2);
      assert.strictEqual(retrieved.traceItems.length, 2);
    });

    it('B-3: Context Trace Retrieval by traceId', () => {
      const saved = traceManager.saveTrace({
        snapshotId: 'snap_b3_001',
        projectId: '流浪',
        chapterId: 'Vol1_Ch02',
        traceItems: [{ sourceFileId: 10, sha256: 'c'.repeat(64) }]
      });

      assert.ok(saved.trace_id);
      const retrieved = traceManager.getTraceById(saved.trace_id);
      assert.ok(retrieved);
      assert.strictEqual(retrieved.traceId, saved.trace_id);
      assert.strictEqual(retrieved.snapshotId, 'snap_b3_001');
    });

    it('B-4: Non-Existent ID & Malformed Input Handling', () => {
      // 1. Snapshot not found returns null
      assert.strictEqual(traceManager.getTraceBySnapshotId('snap_non_existent'), null);
      assert.strictEqual(traceManager.getTraceBySnapshotId(''), null);
      assert.strictEqual(traceManager.getTraceBySnapshotId(null), null);

      // 2. TraceId not found returns null
      assert.strictEqual(traceManager.getTraceById('trc_non_existent'), null);
      assert.strictEqual(traceManager.getTraceById(null), null);

      // 3. verifySnapshotIntegrity on non-existent snapshot throws CollaborationError TRACE_NOT_FOUND
      assert.throws(
        () => traceManager.verifySnapshotIntegrity('snap_non_existent'),
        (err) => {
          return err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND;
        }
      );
    });

    it('B-5: Live SHA-256 File Integrity Verification (INTACT)', () => {
      const testDir = tempEnv.createSubdir('01_Rules');
      const testFile = path.join(testDir, 'physics.md');
      fs.writeFileSync(testFile, '# Core Hard Rules\nFTL travel limit 100c.', 'utf8');

      const fileSha256 = crypto.createHash('sha256').update(fs.readFileSync(testFile)).digest('hex').toLowerCase();

      traceManager.saveTrace({
        snapshotId: 'snap_intact_01',
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        traceItems: [
          { sourceFileId: 1, sourceFilePath: testFile, sha256: fileSha256, authority: 'canon_core' }
        ]
      });

      const report = traceManager.verifySnapshotIntegrity('snap_intact_01', tempEnv.path);
      assert.strictEqual(report.valid, true);
      assert.strictEqual(report.integrityStatus, 'INTACT');
      assert.strictEqual(report.matchedSources, 1);
      assert.strictEqual(report.mismatchedSources, 0);
      assert.strictEqual(report.missingSources, 0);
      assert.strictEqual(report.details[0].status, 'MATCHED');
    });

    it('B-6: Live File Modification Tamper Detection (COMPROMISED)', () => {
      const testDir = tempEnv.createSubdir('01_Rules');
      const testFile = path.join(testDir, 'rules.md');
      fs.writeFileSync(testFile, '# Original Immutable Rules\nLight speed is absolute ceiling.', 'utf8');

      const originalSha256 = crypto.createHash('sha256').update(fs.readFileSync(testFile)).digest('hex').toLowerCase();

      traceManager.saveTrace({
        snapshotId: 'snap_tamper_01',
        projectId: '流浪',
        traceItems: [
          { sourceFileId: 2, sourceFilePath: testFile, sha256: originalSha256, authority: 'canon_core' }
        ]
      });

      // Maliciously tamper with file on disk
      fs.writeFileSync(testFile, '# Malicious Mutation\nLight speed limit bypassed without authorization.', 'utf8');

      const report = traceManager.verifySnapshotIntegrity('snap_tamper_01', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.matchedSources, 0);
      assert.strictEqual(report.mismatchedSources, 1);
      assert.strictEqual(report.details[0].status, 'HASH_MISMATCH');
      assert.ok(report.details[0].liveSha256 !== originalSha256);
    });

    it('B-7: Missing File & Virtual Item Verification', () => {
      const testDir = tempEnv.createSubdir('04_Planets');
      const testFile = path.join(testDir, 'deleted_planet.md');
      fs.writeFileSync(testFile, 'Temporary Planet File', 'utf8');
      const fileSha = crypto.createHash('sha256').update(fs.readFileSync(testFile)).digest('hex').toLowerCase();

      const virtualSha = crypto.createHash('sha256').update('Author Directive in Memory', 'utf8').digest('hex').toLowerCase();

      traceManager.saveTrace({
        snapshotId: 'snap_mixed_01',
        projectId: '流浪',
        traceItems: [
          { sourceFileId: 1, sourceFilePath: testFile, sha256: fileSha },
          { sourceFileId: null, sourceFilePath: null, sha256: virtualSha, authority: 'author_directive' }
        ]
      });

      // Delete physical file
      fs.unlinkSync(testFile);

      const report = traceManager.verifySnapshotIntegrity('snap_mixed_01', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.missingSources, 1);
      assert.strictEqual(report.matchedSources, 1); // Virtual item verified
      assert.strictEqual(report.details[0].status, 'FILE_MISSING');
      assert.strictEqual(report.details[1].status, 'VIRTUAL_VERIFIED');
    });

    it('B-8: Query Traces with Filters', () => {
      traceManager.saveTrace({ snapshotId: 'snap_q_1', projectId: '流浪', chapterId: '1', traceItems: [] });
      traceManager.saveTrace({ snapshotId: 'snap_q_2', projectId: '流浪', chapterId: '2', traceItems: [] });
      traceManager.saveTrace({ snapshotId: 'snap_q_3', projectId: '其他', chapterId: '1', traceItems: [] });

      const queried = traceManager.queryTraces({ projectId: '流浪' });
      assert.strictEqual(queried.length, 2);
    });
  });
});
