/**
 * @file m5_adversarial_challenge.test.js
 * @description Empirical Challenger Adversarial Stress Harness for Milestone 5 Phase 4.
 * Rigorously attacks:
 * - Category A: Memory collaboration edge cases, gating bypass, batch race conditions, contradictory evaluations
 * - Category B: Context reproducibility, extreme budget trimming (0, negative, non-numeric), disk file tampering detection (INTACT/COMPROMISED/FILE_MISSING)
 * - Category C: Concurrency bombardment on CreativeDecisionQueue (zero canon mutations), multi-vector compound leakage detection across all 7 checks
 * - Category D: PathGuard breakout vectors (traversal, UNC, ADS, vault 01-12 write protection, atomic rollback on DB fault)
 * - Category E: Snapshot restore token gating, corrupt JSON resilience, RAG corpus clean isolation
 * 
 * @module test/e2e/m5_adversarial_challenge
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const {
  NovelError,
  SchemaMismatchError,
  GovernanceSafetyError,
  SecurityViolationError,
  CollaborationError
} = require('../../src/errors');
const {
  VCPContextBuilder,
  TraceManager,
  CreativeDecisionQueue,
  SuggestMemoryUpdate,
  VCPMemoryPublisher,
  CanonLeakageEvaluator,
  QualityEvaluators,
  ContextBudgetEngine
} = require('../../src/collaboration');
const SnapshotEngine = require('../../src/snapshot/SnapshotEngine');
const RagCorpusExporter = require('../../src/rag/RagCorpusExporter');

describe('Empirical Challenger: Milestone 5 Adversarial Stress & Hardening Harness', () => {
  let tempDir;
  let vaultDir;
  let sandboxDir;
  let dbManager;
  let dispatcher;
  let pathGuard;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'm5_adv_challenge_'));
    vaultDir = path.join(tempDir, 'WorldTree');
    sandboxDir = path.join(tempDir, 'Sandbox');

    // Create WorldTree folder structure
    fs.mkdirSync(vaultDir, { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '02_Entities'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '03_Chapters'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '13_小说工程插件', '篇章草稿'), { recursive: true });

    // Create Sandbox folder structure
    fs.mkdirSync(sandboxDir, { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data', 'snapshots'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data', 'rag_corpus'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: sandboxDir,
      vaultRoot: vaultDir
    });

    dbPath = path.join(sandboxDir, 'data', 'novel_adv_test.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: sandboxDir,
      pathGuard,
      dbManager,
      dbPath
    });

    // Populate baseline canon facts and test files
    const ruleContent = '# 宇宙底层物理律\n光速为绝对上限，曲率泡需负能量稳定。';
    const ruleFileRel = '01_Worldview/Rules.md';
    const ruleFileFull = path.join(vaultDir, ruleFileRel);
    fs.writeFileSync(ruleFileFull, ruleContent, 'utf8');
    const ruleSha256 = crypto.createHash('sha256').update(ruleContent, 'utf8').digest('hex');

    const planetContent = '# 灰港星档案\n帝国边境的贸易中继星球。';
    const planetFileRel = '02_Entities/GreyHarbor.md';
    const planetFileFull = path.join(vaultDir, planetFileRel);
    fs.writeFileSync(planetFileFull, planetContent, 'utf8');
    const planetSha256 = crypto.createHash('sha256').update(planetContent, 'utf8').digest('hex');

    const archivedContent = '# 遗落基地\n已废弃的旧帝国观测站。';
    const archivedFileRel = '02_Entities/OldBase.md';
    const archivedFileFull = path.join(vaultDir, archivedFileRel);
    fs.writeFileSync(archivedFileFull, archivedContent, 'utf8');
    const archivedSha256 = crypto.createHash('sha256').update(archivedContent, 'utf8').digest('hex');

    const db = dbManager.getDatabase();
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count, frontmatter_json)
      VALUES (1, ?, ?, 'Rules.md', '.md', ?, 1700000000, ?, 'world_rule', 'active', 'reviewed', 3, 50, '{"rule_scope":"global"}'),
             (2, ?, ?, 'GreyHarbor.md', '.md', ?, 1700000000, ?, 'entity', 'active', 'reviewed', 3, 40, '{}'),
             (3, ?, ?, 'OldBase.md', '.md', ?, 1700000000, ?, 'entity', 'archived', 'archived', 0, 30, '{}')
    `).run(
      ruleFileRel, ruleFileRel, Buffer.byteLength(ruleContent), ruleSha256,
      planetFileRel, planetFileRel, Buffer.byteLength(planetContent), planetSha256,
      archivedFileRel, archivedFileRel, Buffer.byteLength(archivedContent), archivedSha256
    );

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'RULE-001', '宇宙底层物理律', 'rule', 'active', 'reviewed', 3, 1),
             (2, 'PL-001', '灰港星', 'planet', 'active', 'reviewed', 3, 2),
             (3, 'OLD-001', '遗落基地', 'station', 'archived', 'archived', 0, 3)
    `).run();

    db.prepare(`
      INSERT INTO entity_aliases (entity_id, alias_name)
      VALUES (3, '古老暗站'), (3, '第九观测所')
    `).run();

    db.prepare(`
      INSERT INTO timeline_events (event_id, title, relative_time_desc, timestamp_order, primary_entity_id, description)
      VALUES ('EV-001', '灰港星建立', '星历100年', 1, 2, '灰港星贸易站正式落成'),
             ('EV-002', '深空舰队决战', '星历200年', 10, 2, '帝国主力与叛军决战')
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
  // VECTOR 1: Category A - Memory Collaboration Stress & Adversarial Gating
  // =========================================================================
  describe('Vector 1: Category A - Memory Collaboration Stress & Adversarial Gating', () => {
    it('ADV-A1: should reject PublishToVCPMemory when confirmedBy is falsified with empty or whitespace values', async () => {
      const publisher = new VCPMemoryPublisher(dbManager);

      const validMemories = [
        {
          memoryType: 'chapter_summary',
          title: '第三章剧情梗概',
          content: '林远抵达灰港星并完成物资补给。',
          tags: ['chapter_summary', '灰港星']
        }
      ];

      // Test whitespace confirmedBy
      assert.throws(() => {
        publisher.publishMemories({
          projectId: '流浪',
          chapterId: 'Vol1_Ch03',
          memories: validMemories,
          confirmedBy: '   '
        });
      }, (err) => {
        assert.ok(err instanceof CollaborationError);
        assert.match(err.message, /Anti-pollution gate: confirmedBy is required/);
        return true;
      });

      // Test empty string confirmedBy
      assert.throws(() => {
        publisher.publishMemories({
          projectId: '流浪',
          chapterId: 'Vol1_Ch03',
          memories: validMemories,
          confirmedBy: ''
        });
      }, (err) => {
        assert.ok(err instanceof CollaborationError);
        return true;
      });
    });

    it('ADV-A2: should reject memory publishing with empty content or non-object memory items', async () => {
      const publisher = new VCPMemoryPublisher(dbManager);

      // Non-array memories
      assert.throws(() => {
        publisher.publishMemories({
          projectId: '流浪',
          memories: 'invalid_string',
          confirmedBy: 'author'
        });
      }, CollaborationError);

      // Empty memories array
      assert.throws(() => {
        publisher.publishMemories({
          projectId: '流浪',
          memories: [],
          confirmedBy: 'author'
        });
      }, CollaborationError);

      // Memory item with empty content
      assert.throws(() => {
        publisher.publishMemories({
          projectId: '流浪',
          memories: [{ memoryType: 'test', content: '   ' }],
          confirmedBy: 'author'
        });
      }, CollaborationError);
    });

    it('ADV-A3: should handle concurrent memory publishing flood and ensure SHA-256 payload integrity', async () => {
      const publisher = new VCPMemoryPublisher(dbManager);
      const concurrency = 30;

      const tasks = Array.from({ length: concurrency }, (_, i) => {
        return Promise.resolve().then(() => {
          const content = `并发测试记忆段落 #${i}: 舰队在星区 ${i} 展开巡航任务。`;
          return publisher.publishMemories({
            projectId: '流浪',
            chapterId: `Vol1_Ch${String(i).padStart(2, '0')}`,
            confirmedBy: `author_${i}`,
            memories: [
              {
                memoryId: `mem_concurrent_${i}`,
                memoryType: 'plot_progress',
                title: `巡航进度 #${i}`,
                content,
                tags: ['巡航', `区段_${i}`]
              }
            ]
          });
        });
      });

      const results = await Promise.all(tasks);
      assert.strictEqual(results.length, concurrency);

      results.forEach((res, i) => {
        assert.strictEqual(res.envelopeVersion, '1.0');
        assert.strictEqual(res.confirmedBy, `author_${i}`);
        assert.strictEqual(res.totalMemories, 1);
        assert.ok(res.payloadSha256 && res.payloadSha256.length === 64);
        assert.ok(res.memories[0].sha256Hash && res.memories[0].sha256Hash.length === 64);

        // Verify SHA-256 recalculated manually matches exactly
        const expectedItemHash = crypto.createHash('sha256').update(res.memories[0].content, 'utf8').digest('hex');
        assert.strictEqual(res.memories[0].sha256Hash, expectedItemHash);
      });
    });

    it('ADV-A4: should detect severe status contradictions and explicit contradiction flags in EvaluateMemoryConflict', () => {
      const canonFacts = [
        { entityId: 'PL-001', canonicalName: '灰港星', status: 'active', content: '繁荣的贸易中心' },
        { entityId: 'OLD-001', canonicalName: '遗落基地', status: 'archived', content: '废弃观测站' }
      ];

      const conflictingMemories = [
        {
          memoryId: 'mem_1',
          targetEntityId: 'PL-001',
          status: 'destroyed', // Status contradiction
          content: '灰港星已被完全炸毁'
        },
        {
          memoryId: 'mem_2',
          targetEntityId: 'OLD-001',
          status: 'active', // Status contradiction
          contradictsCanon: true,
          contradictionReason: '基地秘密重启运作'
        },
        {
          memoryId: 'mem_3',
          targetEntityId: 'PL-001',
          status: 'active', // Consistent
          content: '灰港星贸易航线正常'
        }
      ];

      const report = QualityEvaluators.EvaluateMemoryConflict(conflictingMemories, canonFacts);
      assert.strictEqual(report.passed, false);
      assert.strictEqual(report.conflictCount, 3); // 1 for mem_1 status mismatch, 2 for mem_2 (status mismatch + contradictsCanon flag)
      assert.ok(report.consistencyScore < 1.0);
    });
  });

  // =========================================================================
  // VECTOR 2: Category B - Context Reproducibility & Tamper Detection Stress
  // =========================================================================
  describe('Vector 2: Category B - Context Reproducibility & Tamper Detection Stress', () => {
    it('ADV-B1: ContextBudgetEngine should handle extreme / zero / negative token budgets without crashing', () => {
      const mockContext = {
        authorDirectives: [{ priority: 1, directive: '必须严格遵循光速限制' }],
        canonFacts: [
          { category: 'world_rule', ruleScope: 'global', content: '绝对光速不可超越' },
          { category: 'character', entityType: 'character', canonicalName: '林远' }
        ],
        reviewedMemories: [{ memoryId: 'mem_01', content: '林远持有二级通行证' }],
        semanticCandidates: [
          { priority: 10, title: '未定稿草案: 超空间折跃理论', content: '折跃引擎设想' },
          { priority: 11, authority: 'extended_material', title: '附录: 远古神话', content: '神话传说' }
        ],
        conflicts: [{ entityId: 'RULE-001', reason: '速度超标冲突' }],
        unresolved: [{ foreshadowKey: 'FS-001', question: '谁开启了空间泡？' }],
        warnings: []
      };

      // Test with maxTokens: 0 (should clamp to minimum budget 100)
      const resZero = ContextBudgetEngine.trimContext(mockContext, 0);
      assert.strictEqual(resZero.contextBudget.maxTokens, 100);
      assert.strictEqual(resZero.contextBudget.trimmed, true);
      // Priority 1 (authorDirectives) must NEVER be pruned
      assert.strictEqual(resZero.authorDirectives.length, 1);
      assert.strictEqual(resZero.authorDirectives[0].directive, '必须严格遵循光速限制');

      // Test with negative budget
      const resNeg = ContextBudgetEngine.trimContext(mockContext, -500);
      assert.strictEqual(resNeg.contextBudget.maxTokens, 100);
      assert.strictEqual(resNeg.authorDirectives.length, 1);

      // Test with non-numeric string
      const resNan = ContextBudgetEngine.trimContext(mockContext, 'invalid_number');
      assert.strictEqual(resNan.contextBudget.maxTokens, 30000);
    });

    it('ADV-B2: ContextBudgetEngine should prune Priority 11/10 first, and emit structured warning when Priority 9 conflicts are trimmed', () => {
      const hugeSemanticCandidates = Array.from({ length: 50 }, (_, i) => ({
        priority: 10,
        candidateId: `cand_${i}`,
        title: `候选世界设定 #${i}`,
        content: `这是一段非常冗长的外部RAG检索候选资料内容，包含大量背景描述与设定细节，序号 ${i}。`
      }));

      const mockContext = {
        authorDirectives: [{ priority: 1, directive: '核心任务目标' }],
        canonFacts: [{ category: 'world_rule', ruleScope: 'global', content: '规则' }],
        reviewedMemories: [],
        semanticCandidates: hugeSemanticCandidates,
        conflicts: [{ entityId: 'C-01', reason: '关键设定冲突' }],
        unresolved: [{ foreshadowKey: 'U-01', question: '未决疑问' }],
        warnings: []
      };

      // Tight budget of 150 tokens forces trimming of semantic candidates and conflicts
      const trimmed = ContextBudgetEngine.trimContext(mockContext, 150);
      assert.strictEqual(trimmed.contextBudget.trimmed, true);
      assert.strictEqual(trimmed.contextBudget.trimReason, 'context_budget');
      assert.ok(trimmed.contextBudget.omittedSections.includes('semanticCandidates'));
      assert.strictEqual(trimmed.authorDirectives.length, 1); // Never trimmed

      // Check that warnings contain the budget warning
      assert.ok(trimmed.warnings.some(w => w.includes('部分候选资料未装入上下文') || w.includes('Token预算受限')));
    });

    it('ADV-B3: TraceManager should accurately detect live disk tampering (INTACT, COMPROMISED, FILE_MISSING)', async () => {
      const traceManager = new TraceManager(dbManager, { pathGuard });

      // Save a trace referencing the 3 files in our setup
      const snapshotId = 'snap_adv_trace_test_001';
      const traceRecord = {
        trace_id: 'trace_adv_001',
        snapshot_id: snapshotId,
        project_id: '流浪',
        chapter_id: 'Vol1_Ch01',
        source_policy: 'canon_only',
        trace_items: [
          {
            sourceFileId: 1,
            sourceFilePath: '01_Worldview/Rules.md',
            sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(vaultDir, '01_Worldview/Rules.md'))).digest('hex'),
            authority: 'canon'
          },
          {
            sourceFileId: 2,
            sourceFilePath: '02_Entities/GreyHarbor.md',
            sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(vaultDir, '02_Entities/GreyHarbor.md'))).digest('hex'),
            authority: 'canon'
          },
          {
            sourceFileId: null,
            sourceFilePath: null,
            sha256: crypto.createHash('sha256').update('virtual_directive_item').digest('hex'),
            authority: 'author_directive'
          }
        ]
      };

      traceManager.saveTrace(traceRecord);

      // Phase 1: Verify untouched files are reported as INTACT
      const report1 = traceManager.verifySnapshotIntegrity(snapshotId, vaultDir);
      assert.strictEqual(report1.valid, true);
      assert.strictEqual(report1.integrityStatus, 'INTACT');
      assert.strictEqual(report1.mismatchedSources, 0);
      assert.strictEqual(report1.missingSources, 0);
      assert.strictEqual(report1.matchedSources, 3); // 2 files + 1 virtual item

      // Phase 2: Tamper with GreyHarbor.md on disk
      fs.appendFileSync(path.join(vaultDir, '02_Entities/GreyHarbor.md'), '\n【非法篡改追加内容】', 'utf8');

      const report2 = traceManager.verifySnapshotIntegrity(snapshotId, vaultDir);
      assert.strictEqual(report2.valid, false);
      assert.strictEqual(report2.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report2.mismatchedSources, 1);
      const tamperedItem = report2.details.find(d => d.sourceFilePath === '02_Entities/GreyHarbor.md');
      assert.strictEqual(tamperedItem.status, 'HASH_MISMATCH');
      assert.ok(tamperedItem.error.includes('SHA-256 mismatch'));

      // Phase 3: Delete Rules.md from disk
      fs.unlinkSync(path.join(vaultDir, '01_Worldview/Rules.md'));

      const report3 = traceManager.verifySnapshotIntegrity(snapshotId, vaultDir);
      assert.strictEqual(report3.valid, false);
      assert.strictEqual(report3.missingSources, 1);
      const missingItem = report3.details.find(d => d.sourceFilePath === '01_Worldview/Rules.md');
      assert.strictEqual(missingItem.status, 'FILE_MISSING');
    });
  });

  // =========================================================================
  // VECTOR 3: Category C - Engineering State Integrity & Concurrency Bombardment
  // =========================================================================
  describe('Vector 3: Category C - Engineering State Integrity & Concurrency Bombardment', () => {
    it('ADV-C1: CreativeDecisionQueue must endure massive concurrent registration bombardment with 0 canon mutations', async () => {
      const queue = new CreativeDecisionQueue(dbManager);
      const db = dbManager.getDatabase();

      const canonEntitiesBefore = db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt;
      const canonFilesBefore = db.prepare('SELECT COUNT(*) as cnt FROM source_files').get().cnt;
      const canonChangesBefore = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes').get().cnt;

      const bombCount = 50;
      const tasks = Array.from({ length: bombCount }, (_, i) => {
        return Promise.resolve().then(() => {
          return queue.registerDecision({
            queueId: `adv_bomb_queue_${i}_${Date.now()}`,
            projectId: '流浪',
            chapterId: `Vol1_Ch${i}`,
            decisionType: i % 2 === 0 ? 'entity_attribute_update' : 'new_plot_thread',
            proposer: `AI_Agent_${i}`,
            targetEntityId: 'PL-001',
            proposedChanges: {
              attribute: 'defense_shield',
              value: `能量护盾等级升为 ${i * 100}`,
              sqlInjectionAttempt: "'; DROP TABLE entities; --"
            },
            rationale: `第 ${i} 次战役后设定强化`,
            tags: ['护盾', `第${i}舰队`]
          });
        });
      });

      const enqueued = await Promise.all(tasks);
      assert.strictEqual(enqueued.length, bombCount);

      // Verify all items are strictly in status: pending_author_confirmation
      enqueued.forEach(rec => {
        assert.strictEqual(rec.status, 'pending_author_confirmation');
        assert.strictEqual(rec.authority, 'agent_proposal');
      });

      // Verify ZERO mutations to canon tables
      const canonEntitiesAfter = db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt;
      const canonFilesAfter = db.prepare('SELECT COUNT(*) as cnt FROM source_files').get().cnt;
      const canonChangesAfter = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes').get().cnt;

      assert.strictEqual(canonEntitiesAfter, canonEntitiesBefore);
      assert.strictEqual(canonFilesAfter, canonFilesBefore);
      assert.strictEqual(canonChangesAfter, canonChangesBefore);

      // Verify all items exist in queue
      const pendingCount = queue.getPendingDecisions().length;
      assert.ok(pendingCount >= bombCount);
    });

    it('ADV-C2: CanonLeakageEvaluator must catch compound multi-leak draft across all 7 checks simultaneously', () => {
      const evaluator = new CanonLeakageEvaluator(dbManager);
      const queue = new CreativeDecisionQueue(dbManager);

      // Insert pending decision in queue for entity 'PL-001'
      queue.registerDecision({
        queueId: 'q_pending_leak_001',
        projectId: '流浪',
        decisionType: 'entity_rule_amendment',
        targetEntityId: 'PL-001',
        proposedChanges: { status: 'destroyed' }
      });

      // Construct a composite hostile draft containing leaks for ALL 7 checks:
      // 1. Archived entity alias: '古老暗站'
      // 2. Candidate as canon: '曲率折跃超导体'
      // 3. Premature timeline: '深空舰队决战' (order 10 > chapter 1)
      // 4. Character knowledge boundary: '秘密暗码-DELTA-9'
      // 5. Unconfirmed setting from queue: 'PL-001'
      // 6. Other branch keyword: '平行分支-分支B剧情'
      // 7. Superseded memory: '旧版记忆: 林远尚未获得军衔'
      const compoundDraft = [
        '# 终极对抗测试草稿',
        '林远在灰港星（PL-001）驻扎，前往古老暗站调查废弃遗迹。',
        '科研人员成功制造了曲率折跃超导体，并宣布将其列为帝国法定标准。',
        '他提前获悉了深空舰队决战的全部部署，并私下破译了秘密暗码-DELTA-9。',
        '这是来自平行分支-分支B剧情的核心记录。',
        '然而根据旧版记忆: 林远尚未获得军衔。'
      ].join('\n\n');

      const evaluation = evaluator.evaluateLeakage({
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        chapterNumber: 1,
        draftContent: compoundDraft,
        snapshotContext: {
          semanticCandidates: [{ candidateId: 'CAND-01', title: '曲率折跃超导体' }]
        },
        metadata: {
          characterKnowledgeBoundaries: {
            '林远': ['秘密暗码-DELTA-9']
          },
          otherBranchKeywords: ['平行分支-分支B剧情'],
          supersededMemories: ['旧版记忆: 林远尚未获得军衔']
        }
      });

      assert.strictEqual(evaluation.passed, false);
      assert.ok(evaluation.leakCount >= 6);

      // Verify individual check detections
      assert.strictEqual(evaluation.checks.archivedContentLeak.passed, false);
      assert.ok(evaluation.checks.archivedContentLeak.violations.some(v => v.matchText === '古老暗站'));

      assert.strictEqual(evaluation.checks.candidateAsCanonLeak.passed, false);
      assert.ok(evaluation.checks.candidateAsCanonLeak.violations.some(v => v.matchText === '曲率折跃超导体'));

      assert.strictEqual(evaluation.checks.prematureTimelineLeak.passed, false);
      assert.ok(evaluation.checks.prematureTimelineLeak.violations.some(v => v.matchText === '深空舰队决战'));

      assert.strictEqual(evaluation.checks.characterKnowledgeLeak.passed, false);
      assert.ok(evaluation.checks.characterKnowledgeLeak.violations.some(v => v.matchText === '秘密暗码-DELTA-9'));

      assert.strictEqual(evaluation.checks.unconfirmedSettingLeak.passed, false);
      assert.ok(evaluation.checks.unconfirmedSettingLeak.violations.some(v => v.targetEntityId === 'PL-001'));

      assert.strictEqual(evaluation.checks.otherBranchLeak.passed, false);
      assert.ok(evaluation.checks.otherBranchLeak.violations.some(v => v.matchText === '平行分支-分支B剧情'));

      assert.strictEqual(evaluation.checks.outdatedMemoryLeak.passed, false);
      assert.ok(evaluation.checks.outdatedMemoryLeak.violations.some(v => v.matchText === '旧版记忆: 林远尚未获得军衔'));
    });
  });

  // =========================================================================
  // VECTOR 4: Category D - Security & Sandbox Breakout Defense
  // =========================================================================
  describe('Vector 4: Category D - Security & Sandbox Breakout Defense', () => {
    it('ADV-D1: PathGuard must intercept diverse path traversal and escape variations', () => {
      const escapeAttempts = [
        '../outside_sandbox.txt',
        '..\\outside_sandbox.txt',
        'data/../../outside.txt',
        'data/..\\..\\outside.txt',
        'temp/../../../etc/passwd',
        path.join(vaultDir, '01_Worldview/Rules.md') // Vault path when querying sandbox
      ];

      escapeAttempts.forEach(target => {
        assert.throws(() => {
          pathGuard.assertSandboxPath(target);
        }, (err) => {
          assert.ok(err instanceof SecurityViolationError || err instanceof SecurityError);
          return true;
        });
      });
    });

    it('ADV-D2: PathGuard must block NTFS Alternate Data Streams and UNC breakouts', () => {
      const stealthPayloads = [
        'data/secret.txt:hidden_stream',
        'data/test.db::$DATA',
        '\\\\localhost\\c$\\exploit.txt',
        '\\\\127.0.0.1\\c$\\exploit.txt'
      ];

      stealthPayloads.forEach(target => {
        assert.throws(() => {
          pathGuard.assertSandboxPath(target);
        }, (err) => {
          assert.ok(err instanceof SecurityViolationError || err instanceof SecurityError);
          return true;
        });
      });
    });

    it('ADV-D3: Vault 01-12 folders must be strictly read-only; attempts to resolve for write must fail', () => {
      const canonWriteTargets = [
        '01_Worldview/NewRule.md',
        '02_Entities/NewPlanet.md',
        '03_Chapters/Ch01.md',
        '12_Timeline/Events.md'
      ];

      canonWriteTargets.forEach(rel => {
        const full = path.join(vaultDir, rel);
        assert.throws(() => {
          pathGuard.assertDraftWritablePath(full);
        }, (err) => {
          assert.ok(err instanceof SecurityViolationError || err instanceof SecurityError);
          return true;
        });
      });
    });

    it('ADV-D4: SaveChapterDraft must roll back and unlink draft file if database insertion fails', async () => {
      const draftTitle = '回滚测试篇章草稿';
      const draftContent = '# 回滚草稿内容\n测试原子性回滚机制。';

      // Corrupt database schema temporarily to force DB insert failure
      const db = dbManager.getDatabase();
      db.exec('DROP TABLE chapters');

      await assert.rejects(async () => {
        await dispatcher.dispatch('SaveChapterDraft', {
          projectId: '流浪',
          chapterId: 'Vol1_ChRollback',
          title: draftTitle,
          content: draftContent
        });
      });

      // Verify no orphaned markdown file was left in draft directory
      const draftDir = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      const files = fs.readdirSync(draftDir);
      assert.strictEqual(files.filter(f => f.includes('Vol1_ChRollback')).length, 0);
    });
  });

  // =========================================================================
  // VECTOR 5: Category E - Corpus & Memory Export Governance
  // =========================================================================
  describe('Vector 5: Category E - Corpus & Memory Export Governance', () => {
    it('ADV-E1: SnapshotEngine must enforce confirmationToken token strictly and reject forged tokens', async () => {
      const snapshotEngine = new SnapshotEngine(dbManager, {
        snapshotsDir: path.join(sandboxDir, 'data', 'snapshots'),
        pathGuard
      });

      // Create valid snapshot
      const snapResult = snapshotEngine.createProjectSnapshot({ snapshotName: 'adv_test_snap' });
      assert.ok(snapResult.snapshotId);

      // Attempt restore without confirmationToken -> MUST THROW GovernanceSafetyError
      assert.throws(() => {
        snapshotEngine.restoreProjectSnapshot({ snapshotId: snapResult.snapshotId });
      }, (err) => {
        assert.ok(err instanceof GovernanceSafetyError);
        assert.match(err.message, /confirmationToken/);
        return true;
      });

      // Attempt restore with forged confirmationToken -> MUST THROW GovernanceSafetyError
      assert.throws(() => {
        snapshotEngine.restoreProjectSnapshot({
          snapshotId: snapResult.snapshotId,
          confirmationToken: 'FORGED_TOKEN_XYZ'
        });
      }, (err) => {
        assert.ok(err instanceof GovernanceSafetyError);
        assert.match(err.message, /mandatory/);
        return true;
      });

      // Valid restore with CONFIRM_RESTORE -> SUCCESS
      const restoreRes = snapshotEngine.restoreProjectSnapshot({
        snapshotId: snapResult.snapshotId,
        confirmationToken: 'CONFIRM_RESTORE'
      });
      assert.strictEqual(restoreRes.success, true);
    });

    it('ADV-E2: RagCorpusExporter must cleanly separate canon and candidate corpora while excluding archived files', async () => {
      const exporter = new RagCorpusExporter(dbManager, {
        ragDir: path.join(sandboxDir, 'data', 'rag_corpus'),
        pathGuard
      });

      const exportRes = exporter.exportRagSources({ projectId: '流浪' });
      assert.ok(exportRes.totalExportedFiles >= 2);

      const canonDir = path.join(sandboxDir, 'data', 'rag_corpus', 'canon');
      const candidateDir = path.join(sandboxDir, 'data', 'rag_corpus', 'candidate');

      // Rules.md and GreyHarbor.md must be in canonDir
      assert.ok(fs.existsSync(canonDir));
      const canonFiles = fs.readdirSync(canonDir);
      assert.ok(canonFiles.some(f => f.includes('Rules')));
      assert.ok(canonFiles.some(f => f.includes('GreyHarbor')));

      // OldBase.md (archived) MUST NOT exist in canonDir or candidateDir
      assert.strictEqual(canonFiles.some(f => f.includes('OldBase')), false);
      if (fs.existsSync(candidateDir)) {
        const candidateFiles = fs.readdirSync(candidateDir);
        assert.strictEqual(candidateFiles.some(f => f.includes('OldBase')), false);
      }
    });

    it('ADV-E3: Universal response envelope must be present across Phase 4 collaboration commands', async () => {
      const commandsToTest = [
        {
          action: 'SuggestMemoryUpdate',
          params: {
            projectId: '流浪',
            chapterId: 'Vol1_Ch01',
            draftContent: '正文内容'
          }
        },
        {
          action: 'PublishToVCPMemory',
          params: {
            projectId: '流浪',
            chapterId: 'Vol1_Ch01',
            confirmedBy: 'author',
            memories: [{ memoryType: 'test', title: 'T', content: 'C', tags: ['tag'] }]
          }
        },
        {
          action: 'EvaluateCanonLeakage',
          params: {
            projectId: '流浪',
            draftContent: '干净的草稿正文'
          }
        },
        {
          action: 'RegisterCreativeDecision',
          params: {
            projectId: '流浪',
            decisionType: 'new_idea',
            proposer: 'tester',
            proposedChanges: { idea: 'test' }
          }
        }
      ];

      for (const cmd of commandsToTest) {
        const res = await dispatcher.dispatch(cmd.action, cmd.params);
        assert.strictEqual(typeof res, 'object');
        assert.ok(res.requestId, `Command ${cmd.action} missing requestId`);
        assert.strictEqual(typeof res.databaseRevision, 'number', `Command ${cmd.action} missing integer databaseRevision`);
      }
    });
  });
});
