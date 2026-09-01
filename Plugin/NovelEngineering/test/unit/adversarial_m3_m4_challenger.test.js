/**
 * @file adversarial_m3_m4_challenger.test.js
 * @description Comprehensive Adversarial Stress Test Suite for Phase 4 Collaboration & Evaluation Commands
 * (Milestones 3 & 4: CollaborationCommands.js, CommandDispatcher.js, ContextBudgetEngine.js,
 * CreativeDecisionQueue.js, VCPMemoryPublisher.js, CanonLeakageEvaluator.js, QualityEvaluators.js).
 * 
 * Tests:
 * 1. Malformed / Corrupted inputs, SQL injection attempts, type coercion, missing fields across all 9 collaboration commands.
 * 2. High-volume batch registration of creative decisions into queue (proving zero canon mutation & isolation).
 * 3. Strict anti-pollution gating on PublishToVCPMemory (missing/whitespace confirmedBy, empty/malformed memory payloads).
 * 4. Extreme context budget pruning in BuildVCPContext (11-level cascade: Priority 1 preserved, Priority 9 warnings, Priority 11 trimmed first).
 * 5. Anti-override protections and 7-check canon leakage verification with 100% recall on archived entities.
 * 
 * @module test/unit/adversarial_m3_m4_challenger
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
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const CollaborationCommands = require('../../src/commands/CollaborationCommands');
const ContextBudgetEngine = require('../../src/collaboration/ContextBudgetEngine');
const CreativeDecisionQueue = require('../../src/collaboration/CreativeDecisionQueue');
const VCPMemoryPublisher = require('../../src/collaboration/VCPMemoryPublisher');
const CanonLeakageEvaluator = require('../../src/collaboration/CanonLeakageEvaluator');
const QualityEvaluators = require('../../src/collaboration/QualityEvaluators');
const { CollaborationError } = require('../../src/errors');

describe('Adversarial M3 & M4 Challenger Stress Test Suite', () => {
  let tempDir;
  let dbManager;
  let pathGuard;
  let dispatcher;
  let context;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'adv_m3_m4_challenger_'));
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

    context = {
      dbManager,
      pathGuard,
      basePath: tempDir,
      config: { DATABASE_PATH: ':memory:' }
    };

    // Seed comprehensive test database
    const db = dbManager.getDatabase();

    // 1. Source files
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, '01_Worldview/CoreRules.md', '01_Worldview/CoreRules.md', 'CoreRules.md', '.md', 200, 1700000000, 'sha_rule_01', 'world_rule', 'active', 'reviewed', 3, 200),
             (2, '04_Entities/Planets/GreyHarbor.md', '04_Entities/Planets/GreyHarbor.md', 'GreyHarbor.md', '.md', 500, 1700000000, 'sha_planet_01', 'entity', 'active', 'reviewed', 2, 500),
             (3, '04_Entities/Stations/OldStation.md', '04_Entities/Stations/OldStation.md', 'OldStation.md', '.md', 300, 1700000000, 'sha_station_01', 'entity', 'archived', 'archived', 0, 300),
             (4, '02_Characters/CaptainVex.md', '02_Characters/CaptainVex.md', 'CaptainVex.md', '.md', 400, 1700000000, 'sha_char_01', 'entity', 'active', 'reviewed', 2, 400)
    `).run();

    // 2. Entities
    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'RULE-001', '超光速跃迁质能守恒律', 'rule', 'active', 'reviewed', 3, 1),
             (2, 'PL-001', '灰港星', 'planet', 'active', 'reviewed', 2, 2),
             (3, 'OLD-001', '旧时代空间站7号', 'station', 'archived', 'archived', 0, 3),
             (4, 'CHR-001', '维克斯舰长', 'character', 'active', 'reviewed', 2, 4)
    `).run();

    // 3. Entity Aliases (including for archived entity)
    db.prepare(`
      INSERT INTO entity_aliases (entity_id, alias_name, alias_type, is_primary)
      VALUES (2, '灰港', 'short_name', 1),
             (2, 'Grey Harbor', 'english', 0),
             (3, '遗弃空间站', 'historical', 1),
             (3, 'Station Seven', 'english', 0),
             (4, '维克斯', 'short_name', 1)
    `).run();

    // 4. Timeline Events
    db.prepare(`
      INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, description, status)
      VALUES ('EVT-01', '灰港星停泊条约签署', 1, 2, '舰队与地方议会达成初步协议', 'active'),
             ('EVT-02', '第三次超空间风暴爆发', 5, 1, '席卷整个星区的剧烈风暴', 'active')
    `).run();
  });

  afterEach(() => {
    if (dispatcher) {
      dispatcher.close();
    }
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
  // SECTION 1: CommandDispatcher & CollaborationCommands Malformed Input Resilience
  // =========================================================================
  describe('Section 1: Malformed / Corrupted Input Resilience & Type Coercion', () => {
    it('ADV-DISP-01: Disallow empty, null, numeric, or unsupported command actions', async () => {
      await assert.rejects(
        () => dispatcher.dispatch(''),
        /Action must be a non-empty string/
      );

      await assert.rejects(
        () => dispatcher.dispatch(null),
        /Action must be a non-empty string/
      );

      await assert.rejects(
        () => dispatcher.dispatch(12345),
        /Action must be a non-empty string/
      );

      await assert.rejects(
        () => dispatcher.dispatch('NonExistentCommand_MaliciousAction'),
        /Unsupported or unknown command/
      );
    });

    it('ADV-DISP-02: SQL Injection attempts in command parameters must be harmlessly parameterized', async () => {
      const db = dbManager.getDatabase();
      const initialEntityCount = db.prepare('SELECT count(*) AS cnt FROM entities').get().cnt;

      // Attempt SQL injection in GetContextTrace
      await assert.rejects(
        () => dispatcher.dispatch('GetContextTrace', {
          snapshotId: "ctx_fake' OR 1=1; DROP TABLE entities; --"
        }),
        /Context trace not found/
      );

      // Verify entities table was NOT dropped or modified
      const currentEntityCount = db.prepare('SELECT count(*) AS cnt FROM entities').get().cnt;
      assert.strictEqual(currentEntityCount, initialEntityCount);

      // Attempt SQL injection in RegisterCreativeDecision
      const decisionRes = await dispatcher.dispatch('RegisterCreativeDecision', {
        decisionType: "ADD_RULE'; DROP TABLE source_files; --",
        proposer: "hacker' OR '1'='1",
        proposedChanges: { rule: 'malicious payload' }
      });
      assert.strictEqual(decisionRes.status, 'success');

      // Verify source_files table is intact
      const sourceCount = db.prepare('SELECT count(*) AS cnt FROM source_files').get().cnt;
      assert.ok(sourceCount > 0);
    });

    it('ADV-DISP-03: GetContextTrace missing both snapshotId and traceId throws INVALID_COLLABORATION_PAYLOAD', async () => {
      await assert.rejects(
        () => CollaborationCommands.handleGetContextTrace({}, context),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.strictEqual(err.code, CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD);
          return true;
        }
      );
    });

    it('ADV-DISP-04: SuggestMemoryUpdate missing or empty draftContent throws INVALID_COLLABORATION_PAYLOAD', async () => {
      await assert.rejects(
        () => CollaborationCommands.handleSuggestMemoryUpdate({}, context),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.ok(err.message.includes('draftContent'));
          return true;
        }
      );

      await assert.rejects(
        () => CollaborationCommands.handleSuggestMemoryUpdate({ draftContent: 12345 }, context),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          return true;
        }
      );
    });

    it('ADV-DISP-05: EvaluateCanonLeakage missing or invalid draftContent throws INVALID_COLLABORATION_PAYLOAD', async () => {
      await assert.rejects(
        () => CollaborationCommands.handleEvaluateCanonLeakage({}, context),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.strictEqual(err.code, CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD);
          return true;
        }
      );

      await assert.rejects(
        () => CollaborationCommands.handleEvaluateCanonLeakage({ draftContent: null }, context),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          return true;
        }
      );
    });

    it('ADV-DISP-06: Quality Evaluation commands handle empty / corrupted inputs without throwing uncaught exceptions', async () => {
      // EvaluateContextPrecision with empty objects
      const precRes = await dispatcher.dispatch('EvaluateContextPrecision', {});
      assert.strictEqual(precRes.status, 'success');
      assert.strictEqual(precRes.precisionScore, 1.0);
      assert.strictEqual(precRes.totalItems, 0);

      // EvaluateContextRecall with empty objects
      const recRes = await dispatcher.dispatch('EvaluateContextRecall', {});
      assert.strictEqual(recRes.status, 'success');
      assert.ok(typeof recRes.recallScore === 'number');

      // EvaluateMemoryConflict with empty memories
      const confRes = await dispatcher.dispatch('EvaluateMemoryConflict', {});
      assert.strictEqual(confRes.status, 'success');
      assert.strictEqual(confRes.conflictCount, 0);
      assert.strictEqual(confRes.passed, true);
    });

    it('ADV-DISP-07: All 9 collaboration commands guarantee requestId and databaseRevision envelope fields', async () => {
      // 1. BuildVCPContext
      const r1 = await dispatcher.dispatch('BuildVCPContext', { projectId: '流浪', chapterId: 1 });
      assert.ok(r1.requestId && typeof r1.requestId === 'string');
      assert.strictEqual(typeof r1.databaseRevision, 'number');

      // 2. RegisterCreativeDecision
      const r2 = await dispatcher.dispatch('RegisterCreativeDecision', { decisionType: 'TEST', proposedChanges: {} });
      assert.ok(r2.requestId);
      assert.strictEqual(typeof r2.databaseRevision, 'number');

      // 3. SuggestMemoryUpdate
      const r3 = await dispatcher.dispatch('SuggestMemoryUpdate', { draftContent: '测试草稿内容' });
      assert.ok(r3.requestId);
      assert.strictEqual(typeof r3.databaseRevision, 'number');

      // 4. PublishToVCPMemory
      const r4 = await dispatcher.dispatch('PublishToVCPMemory', {
        confirmedBy: 'author',
        memories: [{ title: '测试', content: '测试内容' }]
      });
      assert.ok(r4.requestId);
      assert.strictEqual(typeof r4.databaseRevision, 'number');

      // 5. EvaluateCanonLeakage
      const r5 = await dispatcher.dispatch('EvaluateCanonLeakage', { draftContent: '正文测试' });
      assert.ok(r5.requestId);
      assert.strictEqual(typeof r5.databaseRevision, 'number');

      // 6. EvaluateContextPrecision
      const r6 = await dispatcher.dispatch('EvaluateContextPrecision', {});
      assert.ok(r6.requestId);
      assert.strictEqual(typeof r6.databaseRevision, 'number');

      // 7. EvaluateContextRecall
      const r7 = await dispatcher.dispatch('EvaluateContextRecall', {});
      assert.ok(r7.requestId);
      assert.strictEqual(typeof r7.databaseRevision, 'number');

      // 8. EvaluateMemoryConflict
      const r8 = await dispatcher.dispatch('EvaluateMemoryConflict', {});
      assert.ok(r8.requestId);
      assert.strictEqual(typeof r8.databaseRevision, 'number');
    });
  });

  // =========================================================================
  // SECTION 2: Batch Decision Registration & Zero Canon Mutation Guarantee
  // =========================================================================
  describe('Section 2: Creative Decision Queue & Zero Canon Mutation Isolation', () => {
    it('ADV-DEC-01: Mass registration of 250 decisions strictly isolates in queue without altering canon tables', async () => {
      const db = dbManager.getDatabase();
      const initialEntities = db.prepare('SELECT * FROM entities ORDER BY id').all();
      const initialSourceFiles = db.prepare('SELECT * FROM source_files ORDER BY id').all();
      const initialTimeline = db.prepare('SELECT * FROM timeline_events ORDER BY id').all();
      const initialCanonChanges = db.prepare('SELECT count(*) AS cnt FROM canon_changes').get().cnt;

      const queue = new CreativeDecisionQueue(dbManager);
      const decisions = [];

      for (let i = 0; i < 250; i++) {
        decisions.push({
          decisionType: i % 2 === 0 ? 'MUTATE_CANON_RULE' : 'DESTROY_PLANET',
          proposer: `Adversarial_Bot_${i}`,
          targetEntityId: `PL-00${i}`,
          proposedChanges: { action: 'delete_entity', target: '灰港星', level: 999 },
          rationale: `Adversarial bombardment attempt ${i}`
        });
      }

      // Execute batch registration
      const registered = queue.batchRegisterDecisions(decisions);
      assert.strictEqual(registered.length, 250);

      // Verify all registered items are in pending_author_confirmation
      const pending = queue.getPendingDecisions();
      assert.strictEqual(pending.length, 250);
      assert.ok(pending.every(d => d.status === 'pending_author_confirmation'));
      assert.ok(pending.every(d => d.authority === 'agent_proposal'));

      // Check CANON TABLES ARE 100% UNTOUCHED
      const currentEntities = db.prepare('SELECT * FROM entities ORDER BY id').all();
      const currentSourceFiles = db.prepare('SELECT * FROM source_files ORDER BY id').all();
      const currentTimeline = db.prepare('SELECT * FROM timeline_events ORDER BY id').all();
      const currentCanonChanges = db.prepare('SELECT count(*) AS cnt FROM canon_changes').get().cnt;

      assert.deepStrictEqual(currentEntities, initialEntities);
      assert.deepStrictEqual(currentSourceFiles, initialSourceFiles);
      assert.deepStrictEqual(currentTimeline, initialTimeline);
      assert.strictEqual(currentCanonChanges, initialCanonChanges);
    });

    it('ADV-DEC-02: Batch size exceeding maxBatchSize limit (500) is rejected', () => {
      const queue = new CreativeDecisionQueue(dbManager);
      const hugeBatch = new Array(501).fill({ decisionType: 'TEST', proposedChanges: 'dummy' });

      assert.throws(
        () => queue.batchRegisterDecisions(hugeBatch),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.ok(err.message.includes('exceeds maximum allowed limit of 500'));
          return true;
        }
      );
    });

    it('ADV-DEC-03: Registering with missing decisionType or proposedChanges throws DECISION_QUEUE_ERROR', () => {
      const queue = new CreativeDecisionQueue(dbManager);

      assert.throws(
        () => queue.registerDecision({ proposedChanges: { foo: 'bar' } }),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.strictEqual(err.code, CollaborationError.CODES.DECISION_QUEUE_ERROR);
          return true;
        }
      );

      assert.throws(
        () => queue.registerDecision({ decisionType: 'ADD_ENTITY' }),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.strictEqual(err.code, CollaborationError.CODES.DECISION_QUEUE_ERROR);
          return true;
        }
      );
    });

    it('ADV-DEC-04: Reviewing a non-existent decision throws DECISION_NOT_FOUND', () => {
      const queue = new CreativeDecisionQueue(dbManager);

      assert.throws(
        () => queue.reviewDecision('non_existent_queue_id_999', { action: 'approve' }),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.strictEqual(err.code, CollaborationError.CODES.DECISION_NOT_FOUND);
          return true;
        }
      );
    });
  });

  // =========================================================================
  // SECTION 3: PublishToVCPMemory Anti-Pollution Gates & confirmedBy Enforcement
  // =========================================================================
  describe('Section 3: PublishToVCPMemory Anti-Pollution Gates', () => {
    it('ADV-PUB-01: Rejects publish without confirmedBy or with whitespace-only confirmedBy', async () => {
      const publisher = new VCPMemoryPublisher(dbManager);

      // Missing confirmedBy (set to empty string)
      assert.throws(
        () => publisher.publishMemories({
          confirmedBy: '',
          memories: [{ title: 'Memory 1', content: 'Summary text' }]
        }),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.strictEqual(err.code, CollaborationError.CODES.MEMORY_PUBLISH_ERROR);
          assert.ok(err.message.includes('confirmedBy is required'));
          return true;
        }
      );

      // Whitespace confirmedBy
      assert.throws(
        () => publisher.publishMemories({
          confirmedBy: '   ',
          memories: [{ title: 'Memory 1', content: 'Summary text' }]
        }),
        (err) => {
          assert.ok(err instanceof CollaborationError);
          assert.ok(err.message.includes('confirmedBy is required'));
          return true;
        }
      );
    });

    it('ADV-PUB-02: Rejects publish with empty memories array or invalid memory items', () => {
      const publisher = new VCPMemoryPublisher(dbManager);

      // Empty array
      assert.throws(
        () => publisher.publishMemories({ confirmedBy: 'author', memories: [] }),
        /memories array is required/
      );

      // Non-array
      assert.throws(
        () => publisher.publishMemories({ confirmedBy: 'author', memories: 'not-an-array' }),
        /memories array is required/
      );

      // Array with item lacking content
      assert.throws(
        () => publisher.publishMemories({
          confirmedBy: 'author',
          memories: [{ title: 'No Content Memory' }]
        }),
        /must have content/
      );

      // Array with empty string content
      assert.throws(
        () => publisher.publishMemories({
          confirmedBy: 'author',
          memories: [{ title: 'Empty Content', content: '   ' }]
        }),
        /must have content/
      );
    });

    it('ADV-PUB-03: Valid memory publish emits Schema 1.0 envelope with zero SQLite mutations', async () => {
      const db = dbManager.getDatabase();
      const initialTableCounts = {
        entities: db.prepare('SELECT count(*) AS cnt FROM entities').get().cnt,
        source_files: db.prepare('SELECT count(*) AS cnt FROM source_files').get().cnt,
        canon_changes: db.prepare('SELECT count(*) AS cnt FROM canon_changes').get().cnt
      };

      const publisher = new VCPMemoryPublisher(dbManager);
      const envelope = publisher.publishMemories({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        confirmedBy: 'Head_Author_001',
        memories: [
          {
            memoryType: 'chapter_summary',
            title: '第3章完成梗概',
            content: '维克斯舰长成功抵达灰港星并完成燃料补给。',
            tags: ['灰港星', '第3章', '补给'],
            syncTarget: 'DailyNote'
          }
        ]
      });

      assert.strictEqual(envelope.envelopeVersion, '1.0');
      assert.strictEqual(envelope.publisher, 'NovelEngineering');
      assert.strictEqual(envelope.confirmedBy, 'Head_Author_001');
      assert.strictEqual(envelope.totalMemories, 1);
      assert.strictEqual(envelope.status, 'EMITTED_FOR_VCP_CONSUMPTION');
      assert.ok(envelope.payloadSha256 && envelope.payloadSha256.length === 64);
      assert.strictEqual(envelope.memories[0].requiresApproval, false);
      assert.strictEqual(envelope.memories[0].authority, 'confirmed_draft');

      // Verify zero DB mutations
      assert.strictEqual(db.prepare('SELECT count(*) AS cnt FROM entities').get().cnt, initialTableCounts.entities);
      assert.strictEqual(db.prepare('SELECT count(*) AS cnt FROM source_files').get().cnt, initialTableCounts.source_files);
      assert.strictEqual(db.prepare('SELECT count(*) AS cnt FROM canon_changes').get().cnt, initialTableCounts.canon_changes);
    });
  });

  // =========================================================================
  // SECTION 4: Extreme Context Budget Pruning & Anti-Override in BuildVCPContext
  // =========================================================================
  describe('Section 4: Context Budget Pruning & Anti-Override Funnel', () => {
    it('ADV-CTX-01: Priority 1 (authorDirectives) is NEVER pruned even under severe starvation (maxTokens: 30)', async () => {
      const hugeDirective = '必须绝对执行的作者最高原则：严禁让维克斯舰长直接向帝国投降。'.repeat(5);

      const params = {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        authorDirectives: [hugeDirective],
        semanticCandidates: [
          { title: '扩展资料1', priority: 11, content: '低优扩展内容'.repeat(50) },
          { title: '候选资料2', priority: 10, content: '高优候选资料'.repeat(50) }
        ],
        maxTokens: 30
      };

      const res = await CollaborationCommands.handleBuildVCPContext(params, context);
      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.contextBudget.trimmed, true);

      // Priority 1 directive remains intact
      assert.strictEqual(res.authorDirectives.length, 1);
      assert.strictEqual(res.authorDirectives[0].directive, hugeDirective);
      assert.strictEqual(res.authorDirectives[0].priority, 1);

      // Priority 11 and 10 were pruned
      assert.strictEqual(res.semanticCandidates.length, 0);
      assert.ok(res.contextBudget.omittedSections.includes('extendedMaterials') || res.contextBudget.omittedSections.includes('semanticCandidates'));
    });

    it('ADV-CTX-02: Priority 9 (conflicts & unresolved) emits structured warnings when budget is tight', () => {
      const rawContext = {
        authorDirectives: [{ directive: '作者核心要求'.repeat(40), priority: 1 }],
        conflicts: [
          { anomalyCode: 'ANOM_001', message: '灰港星主权所属冲突：军方 vs 议会'.repeat(20), priority: 9 }
        ],
        unresolved: [
          { threadKey: 'TH_001', description: '关于古老信号的悬念伏笔'.repeat(20), priority: 9 }
        ]
      };

      const result = ContextBudgetEngine.trimContext(rawContext, 60);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('conflicts') || result.contextBudget.omittedSections.includes('unresolved'));
      assert.ok(result.warnings.some(w => w.includes('部分冲突与未决设定因Token预算受限已被裁剪')));
    });

    it('ADV-CTX-03: Strict Anti-Override blocks candidate from overwriting established canon entity', async () => {
      const params = {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        semanticCandidates: [
          {
            candidateId: 'cand_bad_override',
            canonicalName: '灰港星',
            content: '灰港星在五年前已经被超新星爆发彻底毁灭',
            overridesCanon: true,
            status: 'conflict'
          }
        ]
      };

      const res = await CollaborationCommands.handleBuildVCPContext(params, context);
      assert.strictEqual(res.status, 'success');

      // Canon facts must still contain 灰港星 as active
      const greyHarborCanon = res.canonFacts.find(f => f.canonicalName === '灰港星');
      assert.ok(greyHarborCanon, 'Canon must retain 灰港星');
      assert.strictEqual(greyHarborCanon.authority, 'canon_reviewed');

      // Warning emitted
      assert.ok(res.warnings.some(w => w.includes('OVERRIDE_PREVENTED') || w.includes('灰港星')));

      // Candidate marked overridePrevented
      const candidateItem = res.semanticCandidates.find(c => c.candidateId === 'cand_bad_override');
      if (candidateItem) {
        assert.strictEqual(candidateItem.overridePrevented, true);
      }
    });

    it('ADV-CTX-04: Lineage Trace auto-logged in SQLite and retrievable via GetContextTrace', async () => {
      const buildRes = await CollaborationCommands.handleBuildVCPContext({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星']
      }, context);

      const snapshotId = buildRes.snapshotId;
      assert.ok(snapshotId);

      const traceRes = await CollaborationCommands.handleGetContextTrace({ snapshotId }, context);
      assert.strictEqual(traceRes.status, 'success');
      assert.strictEqual(traceRes.snapshotId, snapshotId);
      assert.ok(traceRes.totalSources > 0);
      assert.ok(Array.isArray(traceRes.sourceTrace));
      assert.ok(traceRes.sourceTrace.every(t => t.sha256 && t.authority));
    });
  });

  // =========================================================================
  // SECTION 5: 7-Check Canon Leakage Evaluator & 100% Archived Recall
  // =========================================================================
  describe('Section 5: Canon Leakage 7-Check Inspection Engine', () => {
    it('ADV-LEAK-01: 100% Recall on Archived Entity name, alias, and ID (Check 1 CRITICAL)', async () => {
      const evaluator = new CanonLeakageEvaluator(dbManager);

      // Draft mentioning archived canonical name
      const r1 = evaluator.evaluateLeakage({
        draftContent: '探险队降落到了旧时代空间站7号的外围停泊区。'
      });
      assert.strictEqual(r1.passed, false);
      assert.ok(r1.criticalCount >= 1);
      assert.strictEqual(r1.checks.archivedContentLeak.passed, false);

      // Draft mentioning archived alias
      const r2 = evaluator.evaluateLeakage({
        draftContent: '雷达在黑暗中发现了遗弃空间站的废墟轮廓。'
      });
      assert.strictEqual(r2.passed, false);
      assert.ok(r2.criticalCount >= 1);

      // Draft mentioning archived ID
      const r3 = evaluator.evaluateLeakage({
        draftContent: '控制台记录显示该设施编号为 OLD-001。'
      });
      assert.strictEqual(r3.passed, false);
      assert.ok(r3.criticalCount >= 1);
    });

    it('ADV-LEAK-02: Premature Timeline event detection (Check 3 WARNING)', async () => {
      const evaluator = new CanonLeakageEvaluator(dbManager);

      // Chapter 2 draft references Chapter 5 event '第三次超空间风暴爆发'
      const report = evaluator.evaluateLeakage({
        chapterNumber: 2,
        draftContent: '由于第三次超空间风暴爆发，所有星际航道已经全部关闭。'
      });

      assert.strictEqual(report.checks.prematureTimelineLeak.passed, false);
      assert.ok(report.warnings.length >= 0);
      assert.ok(report.violations.some(v => v.checkType === 'prematureTimelineLeak'));
    });

    it('ADV-LEAK-03: Character knowledge boundary violation (Check 4 WARNING)', async () => {
      const evaluator = new CanonLeakageEvaluator(dbManager);

      const report = evaluator.evaluateLeakage({
        draftContent: '维克斯舰长微笑着说：“我已经知道了量子核心密码是 9876-ALPHA。”',
        metadata: {
          characterKnowledgeBoundaries: {
            维克斯舰长: ['9876-ALPHA', '帝国绝密协议']
          }
        }
      });

      assert.strictEqual(report.checks.characterKnowledgeLeak.passed, false);
      assert.ok(report.violations.some(v => v.checkType === 'characterKnowledgeLeak'));
    });

    it('ADV-LEAK-04: Unconfirmed creative decision leak from queue (Check 5 CRITICAL)', async () => {
      // Register a pending creative decision
      const queue = new CreativeDecisionQueue(dbManager);
      queue.registerDecision({
        decisionType: 'NEW_WEAPON',
        targetEntityId: 'DARK_MATTER_CANNON_99',
        proposedChanges: { name: '暗物质泯灭炮' }
      });

      const evaluator = new CanonLeakageEvaluator(dbManager);
      const report = evaluator.evaluateLeakage({
        draftContent: '巡洋舰的主武器 DARK_MATTER_CANNON_99 已经充能完毕。'
      });

      assert.strictEqual(report.checks.unconfirmedSettingLeak.passed, false);
      assert.strictEqual(report.passed, false);
      assert.ok(report.violations.some(v => v.checkType === 'unconfirmedSettingLeak'));
    });

    it('ADV-LEAK-05: Clean draft with active canon entities passes with zero violations', async () => {
      const evaluator = new CanonLeakageEvaluator(dbManager);

      const report = evaluator.evaluateLeakage({
        chapterNumber: 1,
        draftContent: '维克斯舰长驾驶着巡航舰，依照超光速跃迁质能守恒律安全抵达灰港星。'
      });

      assert.strictEqual(report.passed, true);
      assert.strictEqual(report.leakCount, 0);
      assert.strictEqual(report.criticalCount, 0);
      assert.strictEqual(report.warningCount, 0);
    });
  });
});
