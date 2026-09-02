/**
 * @file vcpContextBuilder.test.js
 * @description Comprehensive unit tests for VCPContextBuilder (Category A: VCP Memory Collaboration, 5-Layer Funnel, Schema 4.0 & Anti-Override).
 * @module test/unit/vcpContextBuilder
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const VCPContextBuilder = require('../../src/collaboration/VCPContextBuilder');
const TraceManager = require('../../src/collaboration/TraceManager');
const { CollaborationError } = require('../../src/errors');

describe('Phase 4 Milestone 2: Category A - VCPContextBuilder Test Suite', () => {
  let dbManager;
  let contextBuilder;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    contextBuilder = new VCPContextBuilder(dbManager);
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  describe('Category A: VCP Memory Collaboration & 5-Layer Funnel', () => {
    it('A-1: 5-Layer Funnel Assembly & Layer Isolation', () => {
      const res = contextBuilder.buildContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        authorDirectives: ['保持冷静叙事风格', '着重描写港口环境'],
        vcpMemoryRefs: [
          { memoryId: 'mem_01', title: '旧记忆档案', content: '第一卷灰港星的建立过程', status: 'reviewed' }
        ],
        semanticCandidates: [
          { candidateId: 'cand_01', title: '参考资料', content: '酒馆内部结构草案' }
        ],
        maxTokens: 30000
      });

      // 1. All 5 layer arrays exist
      assert.ok(Array.isArray(res.authorDirectives), 'authorDirectives must be an array');
      assert.ok(Array.isArray(res.canonFacts), 'canonFacts must be an array');
      assert.ok(Array.isArray(res.reviewedMemories), 'reviewedMemories must be an array');
      assert.ok(Array.isArray(res.semanticCandidates), 'semanticCandidates must be an array');
      assert.ok(Array.isArray(res.conflicts), 'conflicts must be an array');
      assert.ok(Array.isArray(res.unresolved), 'unresolved must be an array');

      // 2. Layer lengths match inputs
      assert.strictEqual(res.authorDirectives.length, 2);
      assert.strictEqual(res.reviewedMemories.length, 1);
      assert.strictEqual(res.semanticCandidates.length, 1);

      // 3. Layer isolation: sourceSystem stamps
      assert.strictEqual(res.authorDirectives[0].sourceSystem, 'UserDirective');
      assert.strictEqual(res.reviewedMemories[0].sourceSystem, 'VCP-DailyNote');
      assert.strictEqual(res.semanticCandidates[0].sourceSystem, 'VCP-RAG');
    });

    it('A-2: Strict Anti-Override Isolation & Warning Generation', () => {
      // Seed canon entity in DB
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES ('hui_gang', '灰港星', 'planet', 'active', 'confirmed', 2)
      `).run();

      const res = contextBuilder.buildContext({
        projectId: '流浪',
        focusEntities: ['灰港星'],
        semanticCandidates: [
          {
            entityId: 'hui_gang',
            canonicalName: '灰港星',
            content: '恶意修改设定：灰港星已被完全摧毁',
            overrideAttempt: true
          }
        ]
      });

      // 1. Canon fact must remain active and authoritative
      const canonHuiGang = res.canonFacts.find(f => f.canonicalName === '灰港星' || f.entityId === 'hui_gang');
      assert.ok(canonHuiGang, 'Canon entity must exist in canonFacts');
      assert.strictEqual(canonHuiGang.status, 'active');

      // 2. Adversarial candidate must be quarantined in semanticCandidates with overridePrevented
      const cand = res.semanticCandidates.find(c => c.candidateId === 'cand_1' || c.title === '灰港星');
      assert.ok(cand, 'Candidate must be quarantined in semanticCandidates');
      assert.strictEqual(cand.overridePrevented, true);
      assert.strictEqual(cand.canonConflict, true);

      // 3. Warning emitted
      assert.ok(res.warnings.some(w => w.includes('[WARN_SEMANTIC_OVERRIDE_PREVENTED]')));
    });

    it('A-3: Reviewed Memory Integration & Unreviewed Contradiction Gating', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES ('orbit_station', '轨道中继站', 'station', 'active', 'confirmed', 2)
      `).run();

      const res = contextBuilder.buildContext({
        projectId: '流浪',
        focusEntities: ['轨道中继站'],
        vcpMemoryRefs: [
          {
            memoryId: 'mem_good',
            title: '轨道站历史',
            content: '轨道中继站建于星历200年',
            status: 'reviewed'
          },
          {
            memoryId: 'mem_bad',
            title: '未经审核的冲突记忆',
            entityId: 'orbit_station',
            canonicalName: '轨道中继站',
            content: '轨道中继站已被敌方舰队占领',
            contradictionWithCanon: true,
            status: 'unreviewed'
          }
        ]
      });

      // 1. Reviewed memory is placed into reviewedMemories
      const goodMem = res.reviewedMemories.find(m => m.memoryId === 'mem_good');
      assert.ok(goodMem);
      assert.strictEqual(goodMem.authority, 'reviewed_memory');
      assert.strictEqual(goodMem.priority, 8);

      // 2. Contradicting unreviewed memory is gated and filtered out
      const badMem = res.reviewedMemories.find(m => m.memoryId === 'mem_bad');
      assert.strictEqual(badMem, undefined, 'Contradicting unreviewed memory must NOT be included in reviewedMemories');
      assert.ok(res.warnings.some(w => w.includes('[WARN_SEMANTIC_OVERRIDE_PREVENTED]')));
    });

    it('A-4: SourcePolicy Matrix Enforcement', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, source_category, status, review_status, canon_level, sha256_hash)
        VALUES 
          (1, '/vault/01_Worldview/CoreRule.md', '01_Worldview/CoreRule.md', 'CoreRule.md', '.md', 100, 1000, 'worldview', 'active', 'confirmed', 3, '1111111111111111111111111111111111111111111111111111111111111111'),
          (2, '/vault/04_Entities/DraftLore.md', '04_Entities/DraftLore.md', 'DraftLore.md', '.md', 100, 1000, 'entities', 'draft', 'pending', 0, '2222222222222222222222222222222222222222222222222222222222222222')
      `).run();

      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES 
          (1, 'ENT_CORE', '核心公理', 'concept', 'active', 'confirmed', 3, 1),
          (2, 'ENT_DRAFT', '未审草案', 'concept', 'draft', 'pending', 0, 2)
      `).run();

      const resCanonOnly = contextBuilder.buildContext({
        projectId: '流浪',
        sourcePolicy: 'canon_only',
        focusEntities: ['核心公理', '未审草案']
      });

      // Under canon_only, only canonLevel >= 2 in canonFacts
      for (const fact of resCanonOnly.canonFacts) {
        if (fact.canonLevel !== undefined) {
          assert.ok(fact.canonLevel >= 2, `Expected canonLevel >= 2, got ${fact.canonLevel}`);
        }
      }
    });

    it('A-5: Provenance 3-Tag Invariant Across All Layers', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES ('ent_alpha', '阿尔法哨站', 'base', 'active', 'confirmed', 2)
      `).run();

      const res = contextBuilder.buildContext({
        projectId: '流浪',
        focusEntities: ['阿尔法哨站'],
        authorDirectives: ['作者指令：确保硬科幻基调'],
        vcpMemoryRefs: [{ memoryId: 'mem_1', title: '记忆1', content: '内容1', status: 'reviewed' }],
        semanticCandidates: [{ title: '候选1', content: '候选内容1' }]
      });

      const allItems = [
        ...res.authorDirectives,
        ...res.canonFacts,
        ...res.reviewedMemories,
        ...res.semanticCandidates,
        ...res.conflicts,
        ...res.unresolved
      ];

      assert.ok(allItems.length >= 4);
      for (const item of allItems) {
        // Tag 1: sourceSystem
        assert.ok(typeof item.sourceSystem === 'string' && item.sourceSystem.length > 0, `Missing sourceSystem on ${JSON.stringify(item)}`);
        // Tag 2: authority
        assert.ok(typeof item.authority === 'string' && item.authority.length > 0, `Missing authority on ${JSON.stringify(item)}`);
        // Tag 3: sha256Hash
        const hash = item.sha256Hash || item.hashTrackingStamp;
        assert.ok(hash && /^[0-9a-f]{64}$/.test(hash), `Invalid 64-char SHA256 hash: ${hash}`);
      }
    });

    it('A-6: Structured Conflict & Unresolved Item Inclusion', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO anomaly_reports (scan_session_id, anomaly_rule_id, anomaly_type, severity, title, message, affected_file_paths_json)
        VALUES ('SCAN_01', 'ANOM_001', 'ENTITY_CONFLICT', 'CRITICAL', '曲率驱动超温冲突', '发动机温度超过物理硬限制', '[]')
      `).run();

      db.prepare(`
        INSERT INTO foreshadowing (foreshadow_id, title, description, status, importance_level, introduced_chapter)
        VALUES ('FS_001', '失踪的勘探船', '第三章伏笔：勘探船残骸发出异常信号', 'open', 'critical', '3')
      `).run();

      const res = contextBuilder.buildContext({
        projectId: '流浪',
        includeConflicts: true,
        includeUnresolved: true
      });

      // 1. Conflicts extracted
      assert.ok(res.conflicts.length > 0, 'Conflicts must contain anomaly report');
      assert.strictEqual(res.conflicts[0].authority, 'conflict_warning');
      assert.strictEqual(res.conflicts[0].priority, 9);

      // 2. Unresolved extracted
      assert.ok(res.unresolved.length > 0, 'Unresolved must contain open foreshadowing');
      assert.strictEqual(res.unresolved[0].authority, 'unresolved_foreshadowing');
      assert.strictEqual(res.unresolved[0].priority, 9);

      // 3. Flags to exclude
      const resExcluded = contextBuilder.buildContext({
        projectId: '流浪',
        includeConflicts: false,
        includeUnresolved: false
      });
      assert.strictEqual(resExcluded.conflicts.length, 0);
      assert.strictEqual(resExcluded.unresolved.length, 0);
    });

    it('A-7: Strict Schema 4.0 Response Envelope & Revision Fields', () => {
      const res = contextBuilder.buildContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch05',
        requestId: 'custom-req-uuid-1234'
      });

      assert.strictEqual(res.contextVersion, '4.0');
      assert.strictEqual(res.projectId, '流浪');
      assert.strictEqual(res.chapterId, 'Vol1_Ch05');
      assert.ok(res.snapshotId.startsWith('ctx_v4_'));
      assert.strictEqual(res.requestId, 'custom-req-uuid-1234');
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.databaseRevision >= 4);
      assert.ok(res.contextBudget);
      assert.strictEqual(typeof res.contextBudget.estimatedTokens, 'number');
      assert.strictEqual(typeof res.contextBudget.maxTokens, 'number');
      assert.strictEqual(typeof res.contextBudget.trimmed, 'boolean');
      assert.ok(Array.isArray(res.warnings));
    });

    it('A-8: Automatic Context Trace SQLite Persistence', () => {
      const res = contextBuilder.buildContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        authorDirectives: ['保持冷静'],
        semanticCandidates: [{ title: '候选', content: '测试' }]
      });

      const traceRepo = dbManager.contextTraces;
      const trace = traceRepo.getBySnapshotId(res.snapshotId);
      assert.ok(trace, 'Trace record must be automatically persisted to context_traces table');
      assert.strictEqual(trace.snapshot_id, res.snapshotId);
      assert.strictEqual(trace.project_id, '流浪');
      assert.strictEqual(trace.total_sources, res.sourceTrace.length);
    });

    it('A-9: Trace Persistence Notice on Storage Warning', () => {
      // Create builder with broken traceManager to test fault tolerance
      const brokenTraceManager = {
        saveTrace: () => { throw new Error('Disk quota full'); }
      };
      const resilientBuilder = new VCPContextBuilder(dbManager, { traceManager: brokenTraceManager });
      const res = resilientBuilder.buildContext({
        projectId: '流浪'
      });

      assert.ok(res.warnings.some(w => w.includes('Context trace persistence notice: Disk quota full')));
      assert.strictEqual(res.contextVersion, '4.0');
    });
  });
});
