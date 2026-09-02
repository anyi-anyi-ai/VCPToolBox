/**
 * @file commandDispatcher_collaboration.test.js
 * @description Comprehensive unit tests for CommandDispatcher routing of Phase 4 Collaboration & Evaluation Commands (Milestones 3 & 4).
 * Validates dispatching of all 9 commands, help listing, info metadata, error propagation, and envelope structure.
 * @module test/unit/commandDispatcher_collaboration
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { CollaborationError } = require('../../src/errors');

describe('CommandDispatcher - Phase 4 Collaboration Routing Test Suite', () => {
  let tempDir;
  let dbManager;
  let pathGuard;
  let dispatcher;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'disp_collab_test_'));
    pathGuard = new PathGuard({
      pluginRoot: tempDir,
      vaultRoot: path.join(tempDir, 'vault')
    });

    dbManager = DatabaseManager.initDatabase(':memory:', { pathGuard });
    dispatcher = new CommandDispatcher({
      basePath: tempDir,
      dbManager,
      pathGuard
    });

    // Seed test entities
    const db = dbManager.getDatabase();
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, '01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 200, 1700000000, 'h1', 'world_rule', 'active', 'reviewed', 3, 200),
             (2, '04_Entities/GreyHarbor.md', '04_Entities/GreyHarbor.md', 'GreyHarbor.md', '.md', 500, 1700000000, 'h2', 'entity', 'active', 'reviewed', 2, 500),
             (3, '04_Entities/ArchivedStation.md', '04_Entities/ArchivedStation.md', 'ArchivedStation.md', '.md', 300, 1700000000, 'h3', 'entity', 'archived', 'archived', 0, 300)
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'RULE-01', '宇宙常数与超空间跃迁', 'rule', 'active', 'reviewed', 3, 1),
             (2, 'PL-001', '灰港星', 'planet', 'active', 'reviewed', 2, 2),
             (3, 'OLD-001', '古老空间站', 'station', 'archived', 'archived', 0, 3)
    `).run();
  });

  afterEach(() => {
    if (dispatcher) {
      dispatcher.close();
    }
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  describe('1. Help & Info Metadata Verification', () => {
    it('help command should list all available commands (including Phase 4 & Phase 5 commands)', async () => {
      const res = await dispatcher.dispatch('help');
      assert.strictEqual(typeof res, 'object');
      assert.ok(Array.isArray(res.availableCommands));
      assert.strictEqual(res.availableCommands.length, 42);

      const requiredPhase4 = [
        'BuildVCPContext',
        'GetContextTrace',
        'RegisterCreativeDecision',
        'SuggestMemoryUpdate',
        'PublishToVCPMemory',
        'EvaluateCanonLeakage',
        'EvaluateContextPrecision',
        'EvaluateContextRecall',
        'EvaluateMemoryConflict'
      ];

      for (const cmd of requiredPhase4) {
        assert.ok(
          res.availableCommands.includes(cmd),
          `Command "${cmd}" must be registered in availableCommands`
        );
      }
    });

    it('info command should report milestone as Phase 4', async () => {
      const res = await dispatcher.dispatch('info');
      assert.strictEqual(res.name, 'NovelEngineering');
      assert.strictEqual(res.status, 'ready');
      assert.strictEqual(res.details.milestone, 'Phase 4');
    });
  });

  describe('2. All 9 Phase 4 Commands Dispatching & Universal Envelopes', () => {
    it('1. BuildVCPContext via dispatcher', async () => {
      const res = await dispatcher.dispatch('BuildVCPContext', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星']
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.strictEqual(res.contextVersion, '4.0');
      assert.strictEqual(res.projectId, '流浪');
      assert.ok(res.content && typeof res.content === 'string');
      assert.ok(res.details);
    });

    it('2. GetContextTrace via dispatcher', async () => {
      // First build a context
      const buildRes = await dispatcher.dispatch('BuildVCPContext', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星']
      });

      const res = await dispatcher.dispatch('GetContextTrace', {
        snapshotId: buildRes.snapshotId,
        verifyIntegrity: true
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.snapshotId, buildRes.snapshotId);
      assert.ok(res.traceId);
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('3. RegisterCreativeDecision via dispatcher', async () => {
      const res = await dispatcher.dispatch('RegisterCreativeDecision', {
        decisionType: 'WORLD_RULE',
        proposedChanges: { law: '跃迁冷却时间为12标准小时' },
        rationale: '防止剧情节奏崩坏'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.action, 'enqueue');
      assert.ok(res.queueId);
      assert.strictEqual(res.decision.status, 'pending_author_confirmation');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('4. SuggestMemoryUpdate via dispatcher', async () => {
      const res = await dispatcher.dispatch('SuggestMemoryUpdate', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent: '# 第3章 灰港起航\n\n舰队缓缓脱离星门，向外环跃迁。'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.requiresApproval, true);
      assert.ok(Array.isArray(res.suggestions));
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('5. PublishToVCPMemory via dispatcher', async () => {
      const res = await dispatcher.dispatch('PublishToVCPMemory', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        confirmedBy: 'author_editor',
        memories: [
          {
            memoryType: 'chapter_summary',
            title: '第3章摘要',
            content: '舰队脱离星门顺利启程。'
          }
        ]
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.envelopeVersion, '1.0');
      assert.strictEqual(res.publicationStatus, 'EMITTED_FOR_VCP_CONSUMPTION');
      assert.strictEqual(res.confirmedBy, 'author_editor');
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('6. EvaluateCanonLeakage via dispatcher', async () => {
      const res = await dispatcher.dispatch('EvaluateCanonLeakage', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent: '林远在灰港星检查飞船引擎，遵守宇宙常数与超空间跃迁规律。'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, true);
      assert.strictEqual(res.leakCount, 0);
      assert.ok(res.checks);
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('7. EvaluateContextPrecision via dispatcher', async () => {
      const res = await dispatcher.dispatch('EvaluateContextPrecision', {
        contextSnapshot: {
          canonFacts: [
            { entityId: 'PL-001', canonicalName: '灰港星', content: '港口' }
          ]
        },
        targetChapterInfo: {
          focusEntities: ['灰港星']
        }
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.precisionScore, 1.0);
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('8. EvaluateContextRecall via dispatcher', async () => {
      const res = await dispatcher.dispatch('EvaluateContextRecall', {
        contextSnapshot: {
          canonFacts: [
            { entityId: 'PL-001', canonicalName: '灰港星', content: '港口' }
          ]
        },
        targetChapterInfo: {
          focusEntities: ['灰港星']
        }
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(typeof res.recallScore === 'number');
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });

    it('9. EvaluateMemoryConflict via dispatcher', async () => {
      const res = await dispatcher.dispatch('EvaluateMemoryConflict', {
        vcpMemories: [
          { targetEntityId: 'PL-001', status: 'active', title: '灰港星正常运行' }
        ]
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, true);
      assert.strictEqual(res.conflictCount, 0);
      assert.ok(res.requestId);
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.content);
      assert.ok(res.details);
    });
  });

  describe('3. Error Handling & Validation in Dispatcher', () => {
    it('should reject unknown command with clear error message', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('InvalidUnknownCommand123');
        },
        (err) => err.message.includes('Unsupported or unknown command')
      );
    });

    it('should propagate typed CollaborationError from handlers', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SuggestMemoryUpdate', {});
        },
        (err) => err instanceof CollaborationError
      );
    });
  });
});
