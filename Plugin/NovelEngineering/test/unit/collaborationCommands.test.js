/**
 * @file collaborationCommands.test.js
 * @description Comprehensive unit tests for CollaborationCommands (Milestones 3 & 4: Phase 4 Collaboration & Evaluation Handlers).
 * Validates all 9 command handlers, standard envelopes (requestId, databaseRevision, content, details),
 * anti-pollution gates, 7-check leakage inspection, and error handling.
 * @module test/unit/collaborationCommands
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const CollaborationCommands = require('../../src/commands/CollaborationCommands');
const { CollaborationError } = require('../../src/errors');

describe('CollaborationCommands Unit Test Suite (Milestones 3 & 4)', () => {
  let tempDir;
  let dbManager;
  let pathGuard;
  let context;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collab_cmd_test_'));
    pathGuard = new PathGuard({
      pluginRoot: tempDir,
      vaultRoot: path.join(tempDir, 'vault')
    });

    dbManager = DatabaseManager.initDatabase(':memory:', { pathGuard });
    context = {
      dbManager,
      pathGuard,
      basePath: tempDir,
      config: { DATABASE_PATH: ':memory:' }
    };

    // Seed test entities and source files
    const db = dbManager.getDatabase();
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, '01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 200, 1700000000, 'rulehash1', 'world_rule', 'active', 'reviewed', 3, 200),
             (2, '04_Entities/GreyHarbor.md', '04_Entities/GreyHarbor.md', 'GreyHarbor.md', '.md', 500, 1700000000, 'planethash1', 'entity', 'active', 'reviewed', 2, 500),
             (3, '04_Entities/OldBase.md', '04_Entities/OldBase.md', 'OldBase.md', '.md', 300, 1700000000, 'archivedhash1', 'entity', 'archived', 'archived', 0, 300)
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'RULE-01', '光速限制与空间泡', 'rule', 'active', 'reviewed', 3, 1),
             (2, 'PL-001', '灰港星', 'planet', 'active', 'reviewed', 2, 2),
             (3, 'OLD-001', '废弃中继站', 'station', 'archived', 'archived', 0, 3)
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
  // 1. BuildVCPContext
  // =========================================================================
  describe('1. handleBuildVCPContext', () => {
    it('should build standard 5-layer VCP Context snapshot (v4.0) with standard envelope', async () => {
      const params = {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        authorDirectives: ['保持严肃叙事基调'],
        vcpMemoryRefs: [
          { memoryId: 'mem_1', title: '星际航路', content: '早期航路记录', status: 'reviewed' }
        ],
        semanticCandidates: [
          { candidateId: 'cand_1', title: '酒馆设定', content: '灰港星著名停泊酒馆' }
        ],
        requestId: 'custom-req-001',
        maxTokens: 30000
      };

      const res = await CollaborationCommands.handleBuildVCPContext(params, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.requestId, 'custom-req-001');
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.strictEqual(res.contextVersion, '4.0');
      assert.strictEqual(res.projectId, '流浪');
      assert.strictEqual(res.chapterId, 'Vol1_Ch03');
      assert.ok(res.snapshotId.startsWith('ctx_v4_'));

      // 5 Layers validation
      assert.ok(Array.isArray(res.authorDirectives));
      assert.strictEqual(res.authorDirectives.length, 1);
      assert.ok(Array.isArray(res.canonFacts));
      assert.ok(Array.isArray(res.reviewedMemories));
      assert.strictEqual(res.reviewedMemories.length, 1);
      assert.ok(Array.isArray(res.semanticCandidates));
      assert.strictEqual(res.semanticCandidates.length, 1);
      assert.ok(Array.isArray(res.conflicts));
      assert.ok(Array.isArray(res.unresolved));

      // Token budget
      assert.strictEqual(typeof res.contextBudget.estimatedTokens, 'number');
      assert.strictEqual(res.contextBudget.maxTokens, 30000);
      assert.strictEqual(res.contextBudget.trimmed, false);

      // Markdown content and details
      assert.ok(typeof res.content === 'string' && res.content.includes('VCP Context Snapshot'));
      assert.ok(res.details && typeof res.details === 'object');
    });

    it('should generate UUID requestId if omitted', async () => {
      const res = await CollaborationCommands.handleBuildVCPContext({}, context);
      assert.strictEqual(res.status, 'success');
      assert.ok(res.requestId && res.requestId.length > 0);
    });

    it('should trigger anti-override warning when candidate conflicts with canon', async () => {
      const params = {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        semanticCandidates: [
          {
            candidateId: 'cand_override',
            canonicalName: '灰港星',
            content: '非正史灰港星已被摧毁',
            overridesCanon: true
          }
        ]
      };

      const res = await CollaborationCommands.handleBuildVCPContext(params, context);
      assert.strictEqual(res.status, 'success');
      assert.ok(res.warnings.some(w => w.includes('OVERRIDE') || w.includes('已阻止') || w.includes('灰港星')));
    });
  });

  // =========================================================================
  // 2. GetContextTrace
  // =========================================================================
  describe('2. handleGetContextTrace', () => {
    it('should retrieve trace and verify live SHA integrity', async () => {
      // Create a snapshot first to auto-record trace
      const buildRes = await CollaborationCommands.handleBuildVCPContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星']
      }, context);

      const snapshotId = buildRes.snapshotId;

      const traceRes = await CollaborationCommands.handleGetContextTrace({
        snapshotId,
        verifyIntegrity: true
      }, context);

      assert.strictEqual(traceRes.status, 'success');
      assert.strictEqual(traceRes.snapshotId, snapshotId);
      assert.ok(traceRes.traceId);
      assert.strictEqual(traceRes.projectId, '流浪');
      assert.strictEqual(traceRes.chapterId, 'Vol1_Ch03');
      assert.ok(Array.isArray(traceRes.sourceTrace));
      assert.ok(traceRes.integrity);
      assert.ok(typeof traceRes.content === 'string' && traceRes.content.includes('Context Lineage Trace'));
      assert.ok(traceRes.details);
    });

    it('should throw CollaborationError if snapshotId and traceId are missing', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handleGetContextTrace({}, context);
        },
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD
      );
    });

    it('should throw CollaborationError if trace is not found', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handleGetContextTrace({ snapshotId: 'non_existent_snap_999' }, context);
        },
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );
    });
  });

  // =========================================================================
  // 3. RegisterCreativeDecision
  // =========================================================================
  describe('3. handleRegisterCreativeDecision', () => {
    it('should enqueue creative decision with pending_author_confirmation status and zero canon mutation', async () => {
      const countBefore = dbManager.getDatabase().prepare('SELECT count(*) as c FROM entities').get().c;

      const res = await CollaborationCommands.handleRegisterCreativeDecision({
        decisionType: 'SETTING_ADDITION',
        targetEntityId: 'PL-001',
        proposedChanges: { atmosphere: 'nitrogen-oxygen', habitable: true },
        rationale: 'AI Agent第3章剧情需要',
        proposer: 'Agent_Writer',
        projectId: '流浪'
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.action, 'enqueue');
      assert.ok(res.queueId && res.queueId.startsWith('dec_'));
      assert.strictEqual(res.decision.status, 'pending_author_confirmation');
      assert.strictEqual(res.decision.authority, 'agent_proposal');
      assert.strictEqual(res.decision.proposer, 'Agent_Writer');

      // Assert zero direct mutation on canon entities table
      const countAfter = dbManager.getDatabase().prepare('SELECT count(*) as c FROM entities').get().c;
      assert.strictEqual(countBefore, countAfter, 'Entities table count must remain unchanged');
    });

    it('should support review action for author confirmation', async () => {
      const reg = await CollaborationCommands.handleRegisterCreativeDecision({
        decisionType: 'PLOT_EVENT',
        proposedChanges: { event: '港口突击' }
      }, context);

      const reviewRes = await CollaborationCommands.handleRegisterCreativeDecision({
        action: 'review',
        queueId: reg.queueId,
        reviewData: {
          action: 'approve',
          reviewer: 'Author_Master',
          comment: '设定符合主线，予以确认'
        }
      }, context);

      assert.strictEqual(reviewRes.status, 'success');
      assert.strictEqual(reviewRes.action, 'review');
      assert.strictEqual(reviewRes.decision.status, 'approved_for_canon');
      assert.strictEqual(reviewRes.decision.reviewer, 'Author_Master');
    });

    it('should support stats and get actions', async () => {
      const statsRes = await CollaborationCommands.handleRegisterCreativeDecision({
        action: 'stats',
        projectId: 'default'
      }, context);

      assert.strictEqual(statsRes.status, 'success');
      assert.strictEqual(statsRes.action, 'stats');
      assert.ok(typeof statsRes.stats.total === 'number');
    });

    it('should throw CollaborationError if decisionType or proposedChanges missing', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handleRegisterCreativeDecision({}, context);
        },
        (err) => err instanceof CollaborationError
      );
    });
  });

  // =========================================================================
  // 4. SuggestMemoryUpdate
  // =========================================================================
  describe('4. handleSuggestMemoryUpdate', () => {
    it('should propose structured DailyNote memory suggestions with requiresApproval=true', async () => {
      const draft = `# 第3章 灰港夜色\n\n灰港星飞船往来穿梭，林远抵达停泊区。\n\n#灰港星 #航行记录`;
      const res = await CollaborationCommands.handleSuggestMemoryUpdate({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent: draft,
        draftMetadata: { tags: ['sci-fi'] }
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.projectId, '流浪');
      assert.strictEqual(res.chapterId, 'Vol1_Ch03');
      assert.strictEqual(res.requiresApproval, true);
      assert.ok(Array.isArray(res.suggestions));
      assert.ok(res.suggestions.length >= 1);

      const summarySug = res.suggestions.find(s => s.memoryType === 'chapter_summary');
      assert.ok(summarySug);
      assert.strictEqual(summarySug.requiresApproval, true);
      assert.strictEqual(summarySug.status, 'proposed');
      assert.ok(summarySug.suggestedTags.includes('Vol1_Ch03'));

      // Markdown and details
      assert.ok(typeof res.content === 'string' && res.content.includes('Memory Update Proposals'));
      assert.ok(res.details);
    });

    it('should throw CollaborationError if draftContent is missing or non-string', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handleSuggestMemoryUpdate({}, context);
        },
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD
      );
    });
  });

  // =========================================================================
  // 5. PublishToVCPMemory
  // =========================================================================
  describe('5. handlePublishToVCPMemory', () => {
    it('should emit standardized VCP Memory Envelope JSON (Schema 1.0) with anti-pollution author gate', async () => {
      const res = await CollaborationCommands.handlePublishToVCPMemory({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        confirmedBy: 'author_john',
        memories: [
          {
            memoryType: 'chapter_summary',
            title: 'Vol1_Ch03 剧情进度',
            content: '林远抵达灰港星并完成首次接触。',
            tags: ['chapter_summary', 'Vol1_Ch03']
          }
        ]
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.envelopeVersion, '1.0');
      assert.strictEqual(res.publisher, 'NovelEngineering');
      assert.strictEqual(res.sourceSystem, 'NovelEngineering');
      assert.strictEqual(res.confirmedBy, 'author_john');
      assert.strictEqual(res.totalMemories, 1);
      assert.ok(res.payloadSha256 && res.payloadSha256.length === 64);
      assert.strictEqual(res.memories[0].authority, 'confirmed_draft');
      assert.strictEqual(res.memories[0].syncTarget, 'DailyNote');
      assert.strictEqual(res.memories[0].requiresApproval, false);

      // Markdown and details
      assert.ok(typeof res.content === 'string' && res.content.includes('VCP Memory Publication Envelope'));
      assert.ok(res.details);
    });

    it('should enforce non-empty memories array', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handlePublishToVCPMemory({
            memories: []
          }, context);
        },
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.MEMORY_PUBLISH_ERROR
      );
    });

    it('should enforce non-empty confirmedBy parameter', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handlePublishToVCPMemory({
            confirmedBy: '   ',
            memories: [{ content: 'test content' }]
          }, context);
        },
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.MEMORY_PUBLISH_ERROR
      );
    });
  });

  // =========================================================================
  // 6. EvaluateCanonLeakage
  // =========================================================================
  describe('6. handleEvaluateCanonLeakage', () => {
    it('should perform full 7-check inspection and catch 100% archived entity leak', async () => {
      const draft = `飞船在废弃中继站附近停泊，林远观察着四周。`;
      const res = await CollaborationCommands.handleEvaluateCanonLeakage({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent: draft
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, false);
      assert.ok(res.leakCount >= 1);
      assert.ok(res.criticalCount >= 1);
      assert.strictEqual(res.checks.archivedContentLeak.passed, false);
      assert.ok(res.violations.some(v => v.matchText === '废弃中继站'));

      // All 7 check items exist in report
      assert.ok(res.checks.archivedContentLeak);
      assert.ok(res.checks.candidateAsCanonLeak);
      assert.ok(res.checks.prematureTimelineLeak);
      assert.ok(res.checks.characterKnowledgeLeak);
      assert.ok(res.checks.unconfirmedSettingLeak);
      assert.ok(res.checks.otherBranchLeak);
      assert.ok(res.checks.outdatedMemoryLeak);

      // Markdown and details
      assert.ok(typeof res.content === 'string' && res.content.includes('Canon Leakage Inspection Report'));
      assert.ok(res.details);
    });

    it('should pass cleanly when draft contains only valid canon and no leaks', async () => {
      const draft = `飞船在灰港星降落，林远按照光速限制与空间泡规则航行。`;
      const res = await CollaborationCommands.handleEvaluateCanonLeakage({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent: draft
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, true);
      assert.strictEqual(res.leakCount, 0);
      assert.strictEqual(res.criticalCount, 0);
    });

    it('should throw CollaborationError if draftContent missing', async () => {
      await assert.rejects(
        async () => {
          await CollaborationCommands.handleEvaluateCanonLeakage({}, context);
        },
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD
      );
    });
  });

  // =========================================================================
  // 7. EvaluateContextPrecision
  // =========================================================================
  describe('7. handleEvaluateContextPrecision', () => {
    it('should evaluate context precision score and noise items', async () => {
      const snapshot = {
        canonFacts: [
          { entityId: 'PL-001', canonicalName: '灰港星', content: '灰港星核心设定' },
          { entityId: 'RULE-01', canonicalName: '光速限制', category: 'world_rule', ruleScope: 'global' },
          { entityId: 'IRRELEVANT-99', canonicalName: '遥远未知星系', content: '无关的远方星系' }
        ]
      };

      const res = await CollaborationCommands.handleEvaluateContextPrecision({
        contextSnapshot: snapshot,
        targetChapterInfo: {
          focusEntities: ['灰港星'],
          keywords: ['光速']
        }
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.totalItems, 3);
      assert.strictEqual(res.relevantItems, 2);
      assert.strictEqual(res.noiseItems, 1);
      assert.ok(res.precisionScore > 0.6);
      assert.ok(Array.isArray(res.noiseEntities));
      assert.ok(Array.isArray(res.recommendations));
      assert.ok(typeof res.content === 'string');
      assert.ok(res.details);
    });
  });

  // =========================================================================
  // 8. EvaluateContextRecall
  // =========================================================================
  describe('8. handleEvaluateContextRecall', () => {
    it('should evaluate context recall score and identify missing facts', async () => {
      const snapshot = {
        canonFacts: [
          { entityId: 'PL-001', canonicalName: '灰港星', content: '灰港星档案' }
        ]
      };

      const fullFacts = [
        { entityId: 'PL-001', canonicalName: '灰港星', category: 'entity' },
        { entityId: 'PL-002', canonicalName: '红石星', category: 'entity' },
        { entityId: 'RULE-01', canonicalName: '宇宙硬规则', category: 'world_rule' }
      ];

      const res = await CollaborationCommands.handleEvaluateContextRecall({
        contextSnapshot: snapshot,
        targetChapterInfo: {
          focusEntities: ['灰港星', '红石星']
        },
        fullDatabaseFacts: fullFacts
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.expectedItemsCount, 3); // 2 focus entities + 1 world rule
      assert.strictEqual(res.recalledItemsCount, 1);
      assert.strictEqual(res.missedEntitiesCount, 1); // 红石星
      assert.strictEqual(res.missedRulesCount, 1); // 宇宙硬规则
      assert.ok(res.recallScore < 1.0);
      assert.ok(typeof res.content === 'string');
      assert.ok(res.details);
    });

    it('should fallback to querying active database facts when omitted', async () => {
      const snapshot = {
        canonFacts: [
          { entityId: 'PL-001', canonicalName: '灰港星', content: '灰港星' }
        ]
      };

      const res = await CollaborationCommands.handleEvaluateContextRecall({
        contextSnapshot: snapshot,
        targetChapterInfo: {
          focusEntities: ['灰港星']
        }
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.ok(typeof res.recallScore === 'number');
    });
  });

  // =========================================================================
  // 9. EvaluateMemoryConflict
  // =========================================================================
  describe('9. handleEvaluateMemoryConflict', () => {
    it('should detect status contradictions between memory and canon', async () => {
      const memories = [
        {
          memoryId: 'mem_conflict_1',
          targetEntityId: 'PL-001',
          status: 'destroyed',
          title: '灰港星已被毁灭'
        }
      ];

      const canonFacts = [
        {
          entityId: 'PL-001',
          canonicalName: '灰港星',
          status: 'active'
        }
      ];

      const res = await CollaborationCommands.handleEvaluateMemoryConflict({
        vcpMemories: memories,
        structuredCanonFacts: canonFacts
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, false);
      assert.strictEqual(res.conflictCount, 1);
      assert.strictEqual(res.conflicts[0].severity, 'CRITICAL');
      assert.ok(res.conflicts[0].contradictionReason.includes('Status mismatch'));
      assert.ok(typeof res.content === 'string');
      assert.ok(res.details);
    });

    it('should pass cleanly when memories and canon are consistent', async () => {
      const memories = [
        {
          memoryId: 'mem_ok_1',
          targetEntityId: 'PL-001',
          status: 'active',
          title: '灰港星繁荣'
        }
      ];

      const res = await CollaborationCommands.handleEvaluateMemoryConflict({
        vcpMemories: memories
      }, context);

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, true);
      assert.strictEqual(res.conflictCount, 0);
      assert.strictEqual(res.consistencyScore, 1.0);
    });
  });
});
