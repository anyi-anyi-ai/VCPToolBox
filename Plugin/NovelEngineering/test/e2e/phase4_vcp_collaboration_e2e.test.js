/**
 * @file phase4_vcp_collaboration_e2e.test.js
 * @description Milestone 5 Comprehensive End-to-End Test Suite covering all 35 tests across 5 mandatory categories:
 * - Category A: VCP Memory Collaboration (7 tests: A-1 to A-7)
 * - Category B: Context Snapshot Reproducibility (7 tests: B-1 to B-7)
 * - Category C: Engineering State Integrity (7 tests: C-1 to C-7)
 * - Category D: Security & Sandbox (8 tests: D-1 to D-8)
 * - Category E: Corpus & Memory Export (7 tests: E-1 to E-7)
 * 
 * @module test/e2e/phase4_vcp_collaboration_e2e
 * @license MIT
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

describe('Milestone 5: Phase 4 VCP Collaboration & Lifecycle Comprehensive E2E Suite (35 Tests)', () => {
  let tempDir;
  let vaultDir;
  let sandboxDir;
  let dbManager;
  let dispatcher;
  let pathGuard;
  let dbPath;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'novel_m5_e2e_'));
    vaultDir = path.join(tempDir, 'WorldTree');
    sandboxDir = path.join(tempDir, 'Sandbox');

    // Create WorldTree directory structure
    fs.mkdirSync(vaultDir, { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '02_Entities'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '03_Chapters'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '13_小说工程插件', '篇章草稿'), { recursive: true });

    // Create Sandbox directory structure
    fs.mkdirSync(sandboxDir, { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data', 'snapshots'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data', 'rag_corpus'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: sandboxDir,
      vaultRoot: vaultDir
    });

    dbPath = path.join(sandboxDir, 'data', 'novel_test.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: sandboxDir,
      pathGuard,
      dbManager,
      dbPath
    });

    // Populate initial seed canon facts
    const db = dbManager.getDatabase();
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count, frontmatter_json)
      VALUES (1, '01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 250, 1700000000, 'rule_hash_001', 'world_rule', 'active', 'reviewed', 3, 250, '{"rule_scope":"global"}'),
             (2, '02_Entities/GreyHarbor.md', '02_Entities/GreyHarbor.md', 'GreyHarbor.md', '.md', 600, 1700000000, 'planet_hash_001', 'entity', 'active', 'reviewed', 3, 600, '{}'),
             (3, '02_Entities/OldBase.md', '02_Entities/OldBase.md', 'OldBase.md', '.md', 350, 1700000000, 'archived_hash_001', 'entity', 'archived', 'archived', 0, 350, '{}')
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'RULE-001', '光速限制与空间泡', 'rule', 'active', 'reviewed', 3, 1),
             (2, 'PL-001', '灰港星', 'planet', 'active', 'reviewed', 3, 2),
             (3, 'OLD-001', '废弃中继站', 'station', 'archived', 'archived', 0, 3)
    `).run();

    db.prepare(`
      INSERT INTO entity_aliases (entity_id, alias_name)
      VALUES (3, '古老观测台'), (3, '遗落中继')
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
  // CATEGORY A: VCP Memory Collaboration (7 tests: A-1 to A-7)
  // =========================================================================
  describe('Category A: VCP Memory Collaboration', () => {
    it('A-1: SuggestMemoryUpdate produces structured proposals with requiresApproval: true and zero direct DB writes', async () => {
      const db = dbManager.getDatabase();
      const entityCountBefore = db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt;
      const fileCountBefore = db.prepare('SELECT COUNT(*) as cnt FROM source_files').get().cnt;
      const canonChangesBefore = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes').get().cnt;

      const draftText = [
        '# 第三章 灰港星跃迁',
        '林远站在灰港星轨道站上，凝视着深空的星云。#灰港星 #跃迁纪元',
        '根据宇宙基本法则，光速限制与空间泡维持稳定。'
      ].join('\n\n');

      const res = await dispatcher.dispatch('SuggestMemoryUpdate', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent: draftText,
        draftMetadata: { summary: '林远在灰港星启动跃迁准备' },
        snapshotContext: {
          canonFacts: [{ entityId: 'PL-001', canonicalName: '灰港星' }]
        }
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.flow, 'SuggestMemoryUpdate (propose) -> Author confirms -> PublishToVCPMemory (execute)');
      assert.strictEqual(res.requiresApproval, true);
      assert.ok(Array.isArray(res.suggestions));
      assert.ok(res.suggestions.length >= 1);

      // Verify proposal structure
      const chapterSummaryProp = res.suggestions.find(s => s.memoryType === 'chapter_summary');
      assert.ok(chapterSummaryProp, 'Must generate chapter_summary suggestion');
      assert.strictEqual(chapterSummaryProp.requiresApproval, true);
      assert.strictEqual(chapterSummaryProp.status, 'proposed');
      assert.ok(chapterSummaryProp.sourceRefs.length >= 1);
      assert.ok(chapterSummaryProp.sourceRefs[0].sha256);

      // Verify ZERO direct SQLite DB mutation
      const entityCountAfter = db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt;
      const fileCountAfter = db.prepare('SELECT COUNT(*) as cnt FROM source_files').get().cnt;
      const canonChangesAfter = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes').get().cnt;

      assert.strictEqual(entityCountAfter, entityCountBefore, 'Entities table must remain completely unmutated');
      assert.strictEqual(fileCountAfter, fileCountBefore, 'Source files table must remain completely unmutated');
      assert.strictEqual(canonChangesAfter, canonChangesBefore, 'Canon changes table must remain completely unmutated');
    });

    it('A-2: Author confirmation gate: PublishToVCPMemory enforces non-empty confirmedBy and rejects unapproved drafts', async () => {
      const validMemories = [
        {
          memoryType: 'chapter_summary',
          title: '第三章剧情梗概',
          content: '灰港星完成空间泡展开'
        }
      ];

      // Missing or empty confirmedBy should strictly throw CollaborationError
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PublishToVCPMemory', {
            memories: validMemories,
            confirmedBy: ''
          });
        },
        (err) => {
          assert.ok(err instanceof CollaborationError || err.name === 'CollaborationError');
          assert.strictEqual(err.code, 'MEMORY_PUBLISH_ERROR');
          assert.match(err.message, /confirmedBy is required/i);
          return true;
        }
      );

      // Whitespace confirmedBy should also fail anti-pollution gate
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PublishToVCPMemory', {
            memories: validMemories,
            confirmedBy: '   '
          });
        },
        /confirmedBy is required/i
      );

      // Empty memories array should fail validation
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PublishToVCPMemory', {
            memories: [],
            confirmedBy: 'head_author'
          });
        },
        /memories array is required/i
      );
    });

    it('A-3: Schema 1.0 VCP Memory Envelope JSON export with payloadSha256 and item hashes', async () => {
      const memoryContent = '灰港星第三舰队于新历45年完成暗物质引擎改造。';
      const expectedItemHash = crypto.createHash('sha256').update(memoryContent, 'utf8').digest('hex');

      const res = await dispatcher.dispatch('PublishToVCPMemory', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        confirmedBy: 'author_chief_editor',
        memories: [
          {
            memoryId: 'mem_ch03_001',
            memoryType: 'lore_update',
            title: '暗物质引擎改造',
            content: memoryContent,
            tags: ['灰港星', '第三舰队', '引擎']
          }
        ]
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.envelopeVersion, '1.0');
      assert.strictEqual(res.publisher, 'NovelEngineering');
      assert.strictEqual(res.sourceSystem, 'NovelEngineering');
      assert.strictEqual(res.confirmedBy, 'author_chief_editor');
      assert.strictEqual(res.totalMemories, 1);
      assert.strictEqual(typeof res.payloadSha256, 'string');
      assert.strictEqual(res.payloadSha256.length, 64);
      assert.strictEqual(res.publicationStatus, 'EMITTED_FOR_VCP_CONSUMPTION');

      const item = res.memories[0];
      assert.strictEqual(item.memoryId, 'mem_ch03_001');
      assert.strictEqual(item.memoryType, 'lore_update');
      assert.strictEqual(item.requiresApproval, false, 'Confirmed envelope item requiresApproval must be false');
      assert.strictEqual(item.sha256Hash, expectedItemHash);
    });

    it('A-4: Anti-pollution feedback loop prevention: Unreviewed drafts cannot enter long-term memory or RAG', async () => {
      // 1. SuggestMemoryUpdate must always output proposals flagged with requiresApproval: true
      const suggestRes = await dispatcher.dispatch('SuggestMemoryUpdate', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch04',
        draftContent: '# 第四章 未审核草稿内容\n可能包含未经确认的错误设定。'
      });

      assert.strictEqual(suggestRes.requiresApproval, true);
      for (const item of suggestRes.suggestions) {
        assert.strictEqual(item.requiresApproval, true);
        assert.strictEqual(item.status, 'proposed');
      }

      // 2. ExportRagSources must never put draft/unreviewed source files into the canon corpus
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (4, '03_Chapters/Draft_Unreviewed.md', '03_Chapters/Draft_Unreviewed.md', 'Draft_Unreviewed.md', '.md', 100, 1700000000, 'unreviewed_hash', 'chapter', 'draft', 'pending_review', 0)
      `).run();

      const ragExportDir = path.join(sandboxDir, 'data', 'rag_corpus');
      const exportRes = await dispatcher.dispatch('ExportRagSources', {
        outputDir: ragExportDir
      });

      assert.strictEqual(exportRes.status, 'success');
      const canonFiles = fs.readdirSync(exportRes.canonCorpusDir);
      const candidateFiles = fs.readdirSync(exportRes.creativeCorpusDir);

      // Unreviewed draft must NOT be present in exported canon files
      assert.ok(canonFiles.every(f => !f.includes('Draft_Unreviewed')), 'Draft must never be exported as canon');
      assert.ok(candidateFiles.some(f => f.includes('Draft_Unreviewed')), 'Draft should be routed to candidate folder');
    });

    it('A-5: Conflict evaluation: EvaluateMemoryConflict detects contradictory memory claims vs structured SQLite canon', async () => {
      // Canon: PL-001 (灰港星) is active planet
      const conflictingMemories = [
        {
          memoryId: 'mem_contradict_01',
          targetEntityId: 'PL-001',
          title: '灰港星',
          entityStatus: 'destroyed', // Status conflict: memory says destroyed, canon says active
          content: '灰港星在三战中被彻底摧毁'
        },
        {
          memoryId: 'mem_contradict_02',
          targetEntityId: 'PL-001',
          title: '灰港星',
          contradictsCanon: true,
          contradictionReason: 'Memory claims planet is abandoned contrary to canon hub status',
          content: '灰港星已无生命迹象'
        },
        {
          memoryId: 'mem_harmonious_03',
          targetEntityId: 'RULE-001',
          title: '光速限制与空间泡',
          entityStatus: 'active',
          content: '空间泡法则依然生效'
        }
      ];

      const res = await dispatcher.dispatch('EvaluateMemoryConflict', {
        vcpMemories: conflictingMemories
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, false, 'Must fail evaluation when contradictions exist');
      assert.strictEqual(res.conflictCount, 2, 'Must detect exactly 2 conflicts');
      assert.ok(res.consistencyScore < 1.0);
      assert.ok(res.conflicts.some(c => c.memoryId === 'mem_contradict_01' && c.severity === 'CRITICAL'));
      assert.ok(res.conflicts.some(c => c.memoryId === 'mem_contradict_02' && c.severity === 'CRITICAL'));
    });

    it('A-6: Multi-memory batch publication and envelope generation', async () => {
      const batchMemories = [
        { memoryId: 'mem_b_1', memoryType: 'chapter_summary', title: '情节一', content: '先遣队抵达灰港星' },
        { memoryId: 'mem_b_2', memoryType: 'character_state', title: '林远状态', content: '林远升任旗舰指挥官' },
        { memoryId: 'mem_b_3', memoryType: 'world_event', title: '星门开启', content: '第一悬臂星门完成充能' },
        { memoryId: 'mem_b_4', memoryType: 'lore_update', title: '重力波天线', content: '天线阵列恢复广播' },
        { memoryId: 'mem_b_5', memoryType: 'foreshadowing_hint', title: '暗影信号', content: '侦测到未知来源脉冲' }
      ];

      const res = await dispatcher.dispatch('PublishToVCPMemory', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch05',
        confirmedBy: 'author_lead',
        memories: batchMemories
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.totalMemories, 5);
      assert.strictEqual(res.memories.length, 5);
      assert.strictEqual(res.envelopeVersion, '1.0');
      assert.strictEqual(typeof res.payloadSha256, 'string');
      assert.strictEqual(res.payloadSha256.length, 64);

      // Verify each memory has individual SHA-256 and sourceSystem tags
      res.memories.forEach((mem, idx) => {
        assert.strictEqual(mem.sourceSystem, 'NovelEngineering');
        assert.strictEqual(mem.requiresApproval, false);
        assert.strictEqual(typeof mem.sha256Hash, 'string');
        assert.strictEqual(mem.sha256Hash.length, 64);
        assert.strictEqual(mem.memoryId, batchMemories[idx].memoryId);
      });
    });

    it('A-7: Memory update suggestion lifecycle from draft text analysis through author review', async () => {
      // Step 1: Analyze draft text
      const draftContent = '# 第六章 最终决战\n林远率领舰队保卫灰港星，彻底击退掠夺者。#灰港星 #决战胜利';
      const suggestRes = await dispatcher.dispatch('SuggestMemoryUpdate', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch06',
        draftContent,
        snapshotContext: {
          canonFacts: [{ entityId: 'PL-001', canonicalName: '灰港星' }]
        }
      });

      assert.strictEqual(suggestRes.status, 'success');
      assert.ok(suggestRes.suggestions.length >= 1);
      const proposedSummary = suggestRes.suggestions.find(s => s.memoryType === 'chapter_summary');
      assert.ok(proposedSummary);
      assert.strictEqual(proposedSummary.requiresApproval, true);

      // Step 2: Author reviews & approves proposal
      const confirmedMemories = [
        {
          memoryId: proposedSummary.suggestionId,
          memoryType: proposedSummary.memoryType,
          title: proposedSummary.title,
          content: proposedSummary.suggestedContent,
          tags: proposedSummary.suggestedTags,
          sourceRefs: proposedSummary.sourceRefs
        }
      ];

      // Step 3: Publish to VCP long-term memory
      const publishRes = await dispatcher.dispatch('PublishToVCPMemory', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch06',
        confirmedBy: 'author_review_board',
        memories: confirmedMemories
      });

      assert.strictEqual(publishRes.status, 'success');
      assert.strictEqual(publishRes.publicationStatus, 'EMITTED_FOR_VCP_CONSUMPTION');
      assert.strictEqual(publishRes.confirmedBy, 'author_review_board');
      assert.strictEqual(publishRes.memories[0].requiresApproval, false);
      assert.ok(publishRes.payloadSha256);
    });
  });

  // =========================================================================
  // CATEGORY B: Context Snapshot Reproducibility (7 tests: B-1 to B-7)
  // =========================================================================
  describe('Category B: Context Snapshot Reproducibility', () => {
    it('B-1: BuildVCPContext 5-layer funnel compile with schema version 4.0', async () => {
      const res = await dispatcher.dispatch('BuildVCPContext', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        authorDirectives: ['保持冷峻克制的叙事风格'],
        vcpMemoryRefs: [
          { memoryId: 'mem_vcp_01', title: '星门维修历史', content: '星门曾在旧历22年大修', status: 'reviewed' }
        ],
        semanticCandidates: [
          { candidateId: 'cand_01', title: '酒馆传闻', content: '港口酒馆流传的古老星图' }
        ],
        includeConflicts: true,
        includeUnresolved: true,
        maxTokens: 30000
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.contextVersion, '4.0');
      assert.strictEqual(res.projectId, '流浪');
      assert.strictEqual(res.chapterId, 'Vol1_Ch03');
      assert.ok(Array.isArray(res.authorDirectives), 'Layer 1 authorDirectives must be array');
      assert.ok(Array.isArray(res.canonFacts), 'Layer 2 canonFacts must be array');
      assert.ok(Array.isArray(res.reviewedMemories), 'Layer 3 reviewedMemories must be array');
      assert.ok(Array.isArray(res.semanticCandidates), 'Layer 4 semanticCandidates must be array');
      assert.ok(Array.isArray(res.conflicts), 'Layer 5 conflicts must be array');
      assert.ok(Array.isArray(res.unresolved), 'Layer 5 unresolved must be array');
      assert.ok(Array.isArray(res.sourceTrace), 'sourceTrace array must be present');
      assert.ok(res.contextBudget);
      assert.strictEqual(typeof res.contextBudget.estimatedTokens, 'number');
      assert.strictEqual(typeof res.databaseRevision, 'number');
      assert.ok(res.snapshotId);
    });

    it('B-2: 100% deterministic snapshot reproducibility: same input yields identical hashes and content', async () => {
      const params = {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        authorDirectives: ['强调星际距离与相对论效应'],
        vcpMemoryRefs: [{ memoryId: 'mem_rep_1', title: '能源配给', content: '第三期配给定额', status: 'reviewed' }],
        semanticCandidates: [{ candidateId: 'cand_rep_1', title: '流浪商人', content: '偶遇的黑市商人' }],
        maxTokens: 30000
      };

      const res1 = await dispatcher.dispatch('BuildVCPContext', params);
      const res2 = await dispatcher.dispatch('BuildVCPContext', params);

      assert.strictEqual(res1.authorDirectives.length, res2.authorDirectives.length);
      assert.strictEqual(res1.canonFacts.length, res2.canonFacts.length);
      assert.strictEqual(res1.reviewedMemories.length, res2.reviewedMemories.length);
      assert.strictEqual(res1.semanticCandidates.length, res2.semanticCandidates.length);

      // Verify item contents and hashes are 100% identical
      for (let i = 0; i < res1.canonFacts.length; i++) {
        assert.strictEqual(res1.canonFacts[i].sha256Hash, res2.canonFacts[i].sha256Hash);
        assert.strictEqual(res1.canonFacts[i].canonicalName, res2.canonFacts[i].canonicalName);
      }
      for (let i = 0; i < res1.authorDirectives.length; i++) {
        assert.strictEqual(res1.authorDirectives[i].sha256Hash, res2.authorDirectives[i].sha256Hash);
      }
    });

    it('B-3: Anti-override protection: Semantic candidates conflicting with canon are quarantined with overridePrevented: true and warnings', async () => {
      const res = await dispatcher.dispatch('BuildVCPContext', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        semanticCandidates: [
          {
            candidateId: 'cand_conflict_01',
            title: '灰港星',
            canonicalName: '灰港星',
            contradictsCanon: true,
            content: '恶意或过时候选：灰港星已被摧毁并不存在'
          }
        ]
      });

      assert.strictEqual(res.status, 'success');

      // Canon facts must retain the true canon entry
      const canonPlanet = res.canonFacts.find(f => f.canonicalName === '灰港星' || f.entityId === 'PL-001');
      assert.ok(canonPlanet, 'Canon layer must retain valid canon fact');
      assert.strictEqual(canonPlanet.status, 'active');

      // Candidate must be quarantined or override prevented
      const quarantinedCand = res.semanticCandidates.find(c => c.candidateId === 'cand_conflict_01');
      assert.ok(quarantinedCand, 'Candidate should be listed with quarantine flags');
      assert.strictEqual(quarantinedCand.overridePrevented, true);
      assert.strictEqual(quarantinedCand.canonConflict, true);

      // Warnings array must document the anti-override event
      assert.ok(res.warnings.length >= 1);
      assert.ok(res.warnings.some(w => w.includes('Anti-override') || w.includes('quarantine') || w.includes('冲突') || w.includes('灰港星')));
    });

    it('B-4: 11-level context budget priority trimming: Priority 1 (authorDirectives) never trimmed; Priority 9 (conflicts) never dropped silently; Priority 11/10 trimmed first', async () => {
      const largeCandidates = [];
      for (let i = 1; i <= 20; i++) {
        largeCandidates.push({
          candidateId: `cand_heavy_${i}`,
          title: `候选资料片段 ${i}`,
          content: `这是第 ${i} 个候选资料片段，包含冗长的设定描述与背景细节，消耗大量Token。`.repeat(10)
        });
      }

      const res = await dispatcher.dispatch('BuildVCPContext', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        authorDirectives: ['核心指令：绝对优先保护人类母舰！'],
        semanticCandidates: largeCandidates,
        includeConflicts: true,
        maxTokens: 500 // Extremely tight token budget forcing pruning
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.contextBudget.trimmed, true);
      assert.strictEqual(res.contextBudget.trimReason, 'context_budget');

      // Priority 1 (authorDirectives) MUST NEVER be trimmed
      assert.strictEqual(res.authorDirectives.length, 1);
      assert.strictEqual(res.authorDirectives[0].directive, '核心指令：绝对优先保护人类母舰！');

      // Priority 10/11 (semantic candidates) must be trimmed first
      assert.ok(
        res.semanticCandidates.length < largeCandidates.length,
        'Semantic candidates must be trimmed down under tight budget'
      );
      assert.ok(res.contextBudget.omittedSections.includes('candidateSources') || res.contextBudget.omittedSections.includes('semanticCandidates'));
      assert.ok(res.contextBudget.omittedSourceCount > 0);

      // Priority 9 (conflicts) must not be dropped silently; warnings must be recorded
      assert.ok(res.warnings.some(w => w.includes('Token') || w.includes('裁剪') || w.includes('budget') || w.includes('候选')));
    });

    it('B-5: Lineage trace lookup via GetContextTrace with complete sourceTrace and provenance stamps', async () => {
      // 1. Build context to generate trace
      const contextRes = await dispatcher.dispatch('BuildVCPContext', {
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        focusEntities: ['灰港星'],
        authorDirectives: ['坚持硬科幻逻辑']
      });

      const snapshotId = contextRes.snapshotId;
      assert.ok(snapshotId);

      // 2. Retrieve trace
      const traceRes = await dispatcher.dispatch('GetContextTrace', {
        snapshotId
      });

      assert.strictEqual(traceRes.status, 'success');
      assert.strictEqual(traceRes.snapshotId, snapshotId);
      assert.strictEqual(typeof traceRes.databaseRevision, 'number');
      assert.ok(Array.isArray(traceRes.sourceTrace));
      assert.ok(traceRes.sourceTrace.length >= 1);

      // Verify provenance stamp invariant on every trace item
      for (const item of traceRes.sourceTrace) {
        assert.ok(item.sourceSystem, 'Every trace item must have sourceSystem');
        assert.ok(item.authority, 'Every trace item must have authority');
        assert.ok(item.sha256, 'Every trace item must have sha256 hash');
        assert.strictEqual(item.sha256.length, 64, 'SHA-256 stamp must be 64 characters');
      }
    });

    it('B-6: Live disk file SHA-256 integrity verification (INTACT on untouched files, COMPROMISED / HASH_MISMATCH on tampered files)', async () => {
      // Create a physical file on disk in vault
      const ruleFilePath = path.join(vaultDir, '01_Worldview', 'IntegrityRule.md');
      const initialContent = '# 物理法则\n全宇宙遵循热力学第二定律。';
      fs.writeFileSync(ruleFilePath, initialContent, 'utf8');
      const initialSha = crypto.createHash('sha256').update(initialContent).digest('hex');

      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (10, '01_Worldview/IntegrityRule.md', '01_Worldview/IntegrityRule.md', 'IntegrityRule.md', '.md', 100, 1700000000, ?, 'world_rule', 'active', 'reviewed', 3)
      `).run(initialSha);

      // 1. TraceManager verification on untouched file
      const traceManager = new TraceManager(dbManager, { pathGuard });
      const snapId1 = `snap_intact_${Date.now()}`;
      traceManager.saveTrace({
        snapshot_id: snapId1,
        trace_id: `tr_${Date.now()}_1`,
        project_id: '流浪',
        chapter_id: 'Ch01',
        total_sources: 1,
        source_systems: ['NovelEngineering'],
        trace_items: [
          {
            sourceFileId: 10,
            sourceFilePath: '01_Worldview/IntegrityRule.md',
            sha256: initialSha,
            sourceSystem: 'NovelEngineering',
            authority: 'canon'
          }
        ]
      });

      const intactReport = traceManager.verifySnapshotIntegrity(snapId1, vaultDir);
      assert.strictEqual(intactReport.integrityStatus, 'INTACT');
      assert.strictEqual(intactReport.valid, true);
      assert.strictEqual(intactReport.matchedSources, 1);
      assert.strictEqual(intactReport.mismatchedSources, 0);

      // 2. Tamper with disk file
      fs.appendFileSync(ruleFilePath, '\n[Tampered modification]');

      const tamperedReport = traceManager.verifySnapshotIntegrity(snapId1, vaultDir);
      assert.strictEqual(tamperedReport.integrityStatus, 'COMPROMISED');
      assert.strictEqual(tamperedReport.valid, false);
      assert.strictEqual(tamperedReport.mismatchedSources, 1);
      const mismatchDetail = tamperedReport.details.find(d => d.status === 'HASH_MISMATCH');
      assert.ok(mismatchDetail, 'Tampered file must be flagged with HASH_MISMATCH');
    });

    it('B-7: Missing file detection (FILE_MISSING) and virtual in-memory item verification (VIRTUAL_VERIFIED)', async () => {
      const traceManager = new TraceManager(dbManager, { pathGuard });
      const snapId = `snap_missing_virt_${Date.now()}`;
      const virtualSha = crypto.createHash('sha256').update('Virtual Directive Content').digest('hex');

      traceManager.saveTrace({
        snapshot_id: snapId,
        trace_id: `tr_${Date.now()}_missing`,
        project_id: '流浪',
        chapter_id: 'Ch01',
        total_sources: 2,
        source_systems: ['NovelEngineering', 'UserDirective'],
        trace_items: [
          {
            sourceFileId: null,
            sourceFilePath: '99_NonExistent/Missing_File.md',
            sha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
            sourceSystem: 'NovelEngineering',
            authority: 'canon'
          },
          {
            sourceFileId: null,
            sourceFilePath: null, // Virtual in-memory item
            sha256: virtualSha,
            sourceSystem: 'UserDirective',
            authority: 'author_directive'
          }
        ]
      });

      const report = traceManager.verifySnapshotIntegrity(snapId, vaultDir);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.missingSources, 1);
      assert.strictEqual(report.matchedSources, 1);

      const missingItem = report.details.find(d => d.status === 'FILE_MISSING');
      assert.ok(missingItem, 'Missing file must be marked FILE_MISSING');

      const virtualItem = report.details.find(d => d.status === 'VIRTUAL_VERIFIED');
      assert.ok(virtualItem, 'In-memory virtual item must be marked VIRTUAL_VERIFIED');
    });
  });

  // =========================================================================
  // CATEGORY C: Engineering State Integrity (7 tests: C-1 to C-7)
  // =========================================================================
  describe('Category C: Engineering State Integrity', () => {
    it('C-1: RegisterCreativeDecision zero canon mutation under single and batch bombardment', async () => {
      const db = dbManager.getDatabase();
      const initialEntityCount = db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt;
      const initialSourceFileCount = db.prepare('SELECT COUNT(*) as cnt FROM source_files').get().cnt;
      const initialCanonChangesCount = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes').get().cnt;

      // 1. Single registration
      const singleRes = await dispatcher.dispatch('RegisterCreativeDecision', {
        decisionType: 'new_planet_setting',
        targetEntityId: 'PL-999',
        proposedChanges: { name: '新远星', type: 'ice_giant' },
        rationale: '为第五章提供补给点'
      });
      assert.strictEqual(singleRes.status, 'success');

      // 2. Batch bombardment (50 proposals)
      const batchDecisions = [];
      for (let i = 1; i <= 50; i++) {
        batchDecisions.push({
          decisionType: 'batch_entity_proposal',
          targetEntityId: `BOMB-${i}`,
          proposedChanges: { description: `Bombardment proposal ${i}` },
          proposer: 'AI_Agent_Stress'
        });
      }

      const batchRes = await dispatcher.dispatch('RegisterCreativeDecision', {
        action: 'batch',
        decisions: batchDecisions
      });
      assert.strictEqual(batchRes.status, 'success');
      assert.strictEqual(batchRes.totalRegistered, 50);

      // Verify ZERO canon mutation across all core canon tables
      const finalEntityCount = db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt;
      const finalSourceFileCount = db.prepare('SELECT COUNT(*) as cnt FROM source_files').get().cnt;
      const finalCanonChangesCount = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes').get().cnt;

      assert.strictEqual(finalEntityCount, initialEntityCount, 'Entities table must have 0 new records');
      assert.strictEqual(finalSourceFileCount, initialSourceFileCount, 'Source files table must have 0 new records');
      assert.strictEqual(finalCanonChangesCount, initialCanonChangesCount, 'Canon changes table must have 0 new records');

      // Proposals are safely quarantined in canon_changes_queue
      const queueCount = db.prepare('SELECT COUNT(*) as cnt FROM canon_changes_queue').get().cnt;
      assert.strictEqual(queueCount, 51);
    });

    it('C-2: Staged decisions strictly locked to status: pending_author_confirmation', async () => {
      const res = await dispatcher.dispatch('RegisterCreativeDecision', {
        decisionType: 'character_arc_branch',
        targetEntityId: 'CHAR-002',
        proposedChanges: { role: '叛逆者' },
        proposer: 'CoPilot_Agent',
        priority: 'high'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.decision.status, 'pending_author_confirmation');
      assert.strictEqual(res.decision.authority, 'agent_proposal');
      assert.strictEqual(res.decision.proposer, 'CoPilot_Agent');
      assert.strictEqual(res.decision.priority, 'high');
    });

    it('C-3: Author review transition from pending_author_confirmation to approved_for_canon or rejected', async () => {
      // 1. Enqueue proposal 1
      const reg1 = await dispatcher.dispatch('RegisterCreativeDecision', {
        decisionType: 'warp_drive_tweak',
        proposedChanges: { speedLimit: '0.99c' }
      });
      const queueId1 = reg1.queueId;

      // 2. Enqueue proposal 2
      const reg2 = await dispatcher.dispatch('RegisterCreativeDecision', {
        decisionType: 'alien_encounter',
        proposedChanges: { species: '硅基虫族' }
      });
      const queueId2 = reg2.queueId;

      // 3. Author approves proposal 1
      const approveRes = await dispatcher.dispatch('RegisterCreativeDecision', {
        action: 'review',
        queueId: queueId1,
        reviewAction: 'approve',
        reviewer: 'Chief_Author'
      });
      assert.strictEqual(approveRes.status, 'success');
      assert.strictEqual(approveRes.decision.status, 'approved_for_canon');
      assert.strictEqual(approveRes.decision.reviewed_by, 'Chief_Author');

      // 4. Author rejects proposal 2
      const rejectRes = await dispatcher.dispatch('RegisterCreativeDecision', {
        action: 'review',
        queueId: queueId2,
        reviewAction: 'reject',
        reviewer: 'Chief_Author',
        comment: '不符合硬科幻世界观'
      });
      assert.strictEqual(rejectRes.status, 'success');
      assert.strictEqual(rejectRes.decision.status, 'rejected');
      assert.strictEqual(rejectRes.decision.reviewed_by, 'Chief_Author');
      assert.strictEqual(rejectRes.decision.review_comment, '不符合硬科幻世界观');
    });

    it('C-4: EvaluateCanonLeakage Check 1: 100% recall on archived/deprecated entities and aliases', async () => {
      // OLD-001 (废弃中继站, aliases: 古老观测台, 遗落中继) is archived in SQLite
      const draftWithArchivedCanon = '先遣队在航行中意外进入了废弃中继站的停泊位。';
      const draftWithArchivedAlias = '导航仪锁定坐标，赫然显示为古老观测台。';
      const draftClean = '先遣队在航行中安全抵达灰港星。';

      // 1. Test canonical name leak
      const leak1 = await dispatcher.dispatch('EvaluateCanonLeakage', {
        draftContent: draftWithArchivedCanon
      });
      assert.strictEqual(leak1.passed, false);
      assert.strictEqual(leak1.checks.archivedContentLeak.passed, false);
      assert.strictEqual(leak1.criticalCount, 1);
      assert.strictEqual(leak1.violations[0].entityId, 'OLD-001');

      // 2. Test alias leak (100% recall on aliases)
      const leak2 = await dispatcher.dispatch('EvaluateCanonLeakage', {
        draftContent: draftWithArchivedAlias
      });
      assert.strictEqual(leak2.passed, false);
      assert.strictEqual(leak2.checks.archivedContentLeak.passed, false);
      assert.strictEqual(leak2.criticalCount, 1);
      assert.strictEqual(leak2.violations[0].matchText, '古老观测台');

      // 3. Clean draft must pass Check 1
      const cleanRes = await dispatcher.dispatch('EvaluateCanonLeakage', {
        draftContent: draftClean
      });
      assert.strictEqual(cleanRes.checks.archivedContentLeak.passed, true);
    });

    it('C-5: EvaluateCanonLeakage Checks 2-7: candidates, premature timeline, character knowledge boundaries, unconfirmed queue, draft branches, superseded memories', async () => {
      const db = dbManager.getDatabase();

      // Seed timeline event order=10 (future event)
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id)
        VALUES ('EV-FUT-01', '太阳氦闪大爆发', 10.0, 1)
      `).run();

      // Seed unconfirmed queue decision
      db.prepare(`
        INSERT INTO canon_changes_queue (queue_id, project_id, decision_type, proposer, target_entity_id, proposed_changes_json, status, source_system, authority)
        VALUES ('QUE-LEAK-01', '流浪', 'secret_weapon', 'Agent', '暗物质湮灭炮', '{}', 'pending_author_confirmation', 'NovelEngineering', 'agent_proposal')
      `).run();

      const draftWithAllLeaks = [
        '林远在灰港星测试了未验证候选引擎，并使用了暗物质湮灭炮。',
        '他在第一章就预知了太阳氦闪大爆发的准确时间。',
        '林远私下透露了最高机密：反叛军总部坐标。',
        '与此同时在平行世界线B中发生了超重力崩塌。',
        '旧版记忆提到灰港星空间站已于昨日解体。'
      ].join('\n\n');

      const res = await dispatcher.dispatch('EvaluateCanonLeakage', {
        chapterNumber: 1, // Chapter 1 (future event at order 10 is premature)
        draftContent: draftWithAllLeaks,
        snapshotContext: {
          semanticCandidates: [{ candidateId: 'cand_1', title: '未验证候选引擎' }]
        },
        metadata: {
          characterKnowledgeBoundaries: {
            林远: ['反叛军总部坐标']
          },
          otherBranchKeywords: ['平行世界线B'],
          supersededMemories: ['灰港星空间站已于昨日解体']
        }
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.passed, false);

      // Verify all remaining 6 checks are triggered
      assert.strictEqual(res.checks.candidateAsCanonLeak.passed, false, 'Check 2 should trigger');
      assert.strictEqual(res.checks.prematureTimelineLeak.passed, false, 'Check 3 should trigger');
      assert.strictEqual(res.checks.characterKnowledgeLeak.passed, false, 'Check 4 should trigger');
      assert.strictEqual(res.checks.unconfirmedSettingLeak.passed, false, 'Check 5 should trigger');
      assert.strictEqual(res.checks.otherBranchLeak.passed, false, 'Check 6 should trigger');
      assert.strictEqual(res.checks.outdatedMemoryLeak.passed, false, 'Check 7 should trigger');
    });

    it('C-6: EvaluateContextPrecision and noise entity identification', async () => {
      const mockSnapshot = {
        canonFacts: [
          { canonicalName: '灰港星', category: 'planet', content: '灰港星主港' },
          { canonicalName: '光速限制与空间泡', category: 'world_rule', ruleScope: 'global', content: '宇宙公理' },
          { canonicalName: '无关矿业小行星', category: 'asteroid', content: '偏远无名采矿点' },
          { canonicalName: '废弃拖船7号', category: 'vessel', content: '早已退役的运输船' }
        ],
        semanticCandidates: [
          { title: '空间跃迁技术详解', content: '包含空间跃迁参数' },
          { title: '远古厨艺食谱', content: '与航行完全无关的食谱' }
        ]
      };

      const res = await dispatcher.dispatch('EvaluateContextPrecision', {
        contextSnapshot: mockSnapshot,
        targetChapterInfo: {
          focusEntities: ['灰港星'],
          keywords: ['空间跃迁']
        }
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.totalItems, 6);
      assert.strictEqual(res.relevantItems, 3); // 灰港星 (focus), 光速限制 (global rule), 空间跃迁 (keyword)
      assert.strictEqual(res.noiseItems, 3); // 无关矿业小行星, 废弃拖船7号, 远古厨艺食谱
      assert.strictEqual(res.precisionScore, 0.5);
      assert.strictEqual(res.noiseEntities.length, 3);
    });

    it('C-7: EvaluateContextRecall and missed entity/global rule detection', async () => {
      const mockFullFacts = [
        { entity_id: 'PL-001', canonical_name: '灰港星', category: 'planet' },
        { entity_id: 'PL-002', canonical_name: '新木星', category: 'planet' },
        { entity_id: 'RULE-001', canonical_name: '光速限制与空间泡', category: 'world_rule', source_category: 'world_rule' },
        { entity_id: 'RULE-002', canonical_name: '熵增铁律', category: 'world_rule', source_category: 'world_rule' }
      ];

      // Snapshot only recalled 1 entity (灰港星) and missed PL-002 and RULE-002
      const mockSnapshot = {
        canonFacts: [
          { entityId: 'PL-001', canonicalName: '灰港星', content: '灰港星档案' },
          { entityId: 'RULE-001', canonicalName: '光速限制与空间泡', category: 'world_rule', content: '光速限制' }
        ]
      };

      const res = await dispatcher.dispatch('EvaluateContextRecall', {
        contextSnapshot: mockSnapshot,
        targetChapterInfo: {
          focusEntities: ['灰港星', '新木星']
        },
        fullDatabaseFacts: mockFullFacts
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.expectedItemsCount, 4); // 2 focus + 2 global rules
      assert.strictEqual(res.recalledItemsCount, 2);
      assert.strictEqual(res.missedEntitiesCount, 1); // missed PL-002
      assert.strictEqual(res.missedRulesCount, 1); // missed RULE-002
      assert.strictEqual(res.recallScore, 0.5);
      assert.strictEqual(res.missedEntities[0].canonical_name, '新木星');
      assert.strictEqual(res.missedRules[0].canonical_name, '熵增铁律');
    });
  });

  // =========================================================================
  // CATEGORY D: Security & Sandbox (8 tests: D-1 to D-8)
  // =========================================================================
  describe('Category D: Security & Sandbox', () => {
    it('D-1: PathGuard sandbox boundary enforcement against ../ path traversal', async () => {
      await assert.rejects(
        async () => {
          pathGuard.assertWritablePath('../../etc/passwd');
        },
        (err) => {
          assert.ok(err instanceof SecurityViolationError || err.name === 'SecurityError');
          assert.ok(err.code === 'ERR_PATH_OUTSIDE_SANDBOX' || err.code === 'ERR_PATH_TRAVERSAL');
          return true;
        }
      );
    });

    it('D-2: Windows UNC and drive-letter breakout defense', async () => {
      // Prohibit UNC paths
      await assert.rejects(
        async () => {
          pathGuard.assertWritablePath('\\\\192.168.1.100\\c$\\evil.md');
        },
        (err) => {
          assert.strictEqual(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
          return true;
        }
      );

      // Prohibit external drive root outside sandbox
      await assert.rejects(
        async () => {
          pathGuard.assertWritablePath('Z:\\secret\\stolen_canon.json');
        },
        (err) => {
          assert.strictEqual(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
          return true;
        }
      );
    });

    it('D-3: NTFS ADS (Alternate Data Streams) bypass defense', async () => {
      await assert.rejects(
        async () => {
          pathGuard.validatePathSyntax('data/novel_test.db:hidden_stream');
        },
        (err) => {
          assert.strictEqual(err.code, 'ERR_ADS_STREAM_DETECTED');
          assert.match(err.message, /Alternate Data Streams/i);
          return true;
        }
      );
    });

    it('D-4: Symlink / junction escape defense', async () => {
      const escapeTarget = path.join(tempDir, 'outside_target.txt');
      fs.writeFileSync(escapeTarget, 'Outside Secret Content', 'utf8');

      const symlinkPath = path.join(sandboxDir, 'data', 'symlink_outside');
      try {
        fs.symlinkSync(escapeTarget, symlinkPath, 'file');
      } catch (_) {
        // Skip if OS privilege denies symlink creation
        return;
      }

      assert.throws(
        () => {
          pathGuard.assertWritablePath(symlinkPath);
        },
        (err) => {
          assert.ok(err instanceof SecurityViolationError);
          return true;
        }
      );
    });

    it('D-5: Read-only invariant on Obsidian vault 01-12 canon directories', async () => {
      const canonSettingDir = path.join(vaultDir, '01_Worldview', 'ProtectedCanon.md');

      // Attempting to assert writable path targeting vault 01_Worldview must throw
      assert.throws(
        () => {
          pathGuard.assertNoVaultWrite(canonSettingDir);
        },
        (err) => {
          assert.strictEqual(err.code, 'ERR_VAULT_WRITE_BLOCKED');
          assert.match(err.message, /Zero-Mutation Violation/i);
          return true;
        }
      );

      // SaveChapterDraft targeting 01_Worldview via customFilename must be vetoed
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH_HACK_01',
            title: 'Malicious Draft',
            content: 'Trying to overwrite canon',
            customFilename: '../../01_Worldview/OverwrittenCanon.md'
          });
        },
        (err) => {
          assert.ok(err.code === 'ERR_VAULT_WRITE_BLOCKED' || err.code === 'ERR_PATH_TRAVERSAL' || err.name === 'SecurityError');
          return true;
        }
      );
    });

    it('D-6: Draft writing strictly bounded to 13_小说工程插件/篇章草稿/', async () => {
      const res = await dispatcher.dispatch('SaveChapterDraft', {
        chapterId: 'Vol1_Ch07',
        title: '星海启航',
        content: '# 第七章 星海启航\n这是合法的草稿正文。',
        summary: '第七章草稿'
      });

      assert.strictEqual(res.status, 'draft');
      assert.strictEqual(res.canon, 0);
      assert.ok(res.details.draftFilePath);

      // Normalizing path separators to forward slash for reliable regex check
      const normalizedPath = res.details.draftFilePath.replace(/\\/g, '/');
      assert.match(normalizedPath, /13_小说工程插件\/篇章草稿/);

      // Verify SQLite records draft with canon=0
      const db = dbManager.getDatabase();
      const chapterRow = db.prepare("SELECT * FROM chapters WHERE chapter_number = '1' OR title = '星海启航'").get();
      assert.ok(chapterRow);
      assert.strictEqual(chapterRow.status, 'draft');
      assert.strictEqual(chapterRow.canon, 0);
    });

    it('D-7: Two-phase atomic draft write and rollback on SQLite failure', async () => {
      const draftVault = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      const customFilename = 'Vol1_Ch08_Atomic_Rollback_Test.md';
      const targetDraftFile = path.join(draftVault, customFilename);

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'Vol1_Ch08',
            title: '原子回滚测试',
            content: '# 第八章 回滚测试正文',
            customFilename,
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/
      );

      // Verify on-disk draft file was cleanly rolled back (deleted)
      assert.strictEqual(fs.existsSync(targetDraftFile), false, 'Draft file must be cleaned up on SQLite error');
    });

    it('D-8: Typed error hierarchy propagation with zero empty catch error swallowing', async () => {
      // 1. PathGuardError / SecurityError
      assert.throws(
        () => pathGuard.validatePathSyntax(''),
        err => err instanceof SecurityViolationError && err.name === 'SecurityError'
      );

      // 2. GovernanceSafetyError on unconfirmed restore
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('RestoreProjectSnapshot', {
            snapshotId: 'fake_id'
          });
        },
        err => err instanceof GovernanceSafetyError && (err.code === 'GOVERNANCE_CONFIRMATION_REQUIRED' || err.code === 'GOVERNANCE_SAFETY_ERROR')
      );

      // 3. CollaborationError on invalid memory publish
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PublishToVCPMemory', {
            memories: null
          });
        },
        err => err instanceof CollaborationError && err.code === 'MEMORY_PUBLISH_ERROR'
      );

      // 4. SchemaMismatchError / SQLite Error on non-existent table
      assert.throws(
        () => {
          dbManager.getDatabase().prepare('SELECT * FROM non_existent_table_xyz').all();
        },
        err => err && err.message.includes('no such table')
      );
    });
  });

  // =========================================================================
  // CATEGORY E: Corpus & Memory Export (7 tests: E-1 to E-7)
  // =========================================================================
  describe('Category E: Corpus & Memory Export', () => {
    it('E-1: RAG corpus export separating canon/ and candidate/ clean markdown', async () => {
      const exportDir = path.join(sandboxDir, 'data', 'rag_corpus_test');
      const res = await dispatcher.dispatch('ExportRagSources', {
        outputDir: exportDir
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(fs.existsSync(res.canonCorpusDir));
      assert.ok(fs.existsSync(res.creativeCorpusDir));

      const canonFiles = fs.readdirSync(res.canonCorpusDir);
      // Active canon files must be in canon/
      assert.ok(canonFiles.some(f => f.includes('Rules.md')));
      assert.ok(canonFiles.some(f => f.includes('GreyHarbor.md')));

      // Archived file (OldBase.md) must be excluded from canon
      assert.ok(canonFiles.every(f => !f.includes('OldBase.md')));
    });

    it('E-2: manifest.jsonl generation with document checksums and token estimates', async () => {
      const manifestPath = path.join(sandboxDir, 'data', 'rag_corpus', 'manifest.jsonl');
      const res = await dispatcher.dispatch('BuildRagCorpusManifest', {
        outputPath: manifestPath
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(fs.existsSync(manifestPath), 'manifest.jsonl must exist');

      const manifestContent = fs.readFileSync(manifestPath, 'utf8').trim();
      const lines = manifestContent.split('\n').filter(Boolean);
      assert.ok(lines.length >= 1);

      lines.forEach((line) => {
        const doc = JSON.parse(line);
        assert.ok(doc.doc_id || doc.sourceFileId || doc.id);
        assert.ok(doc.sha256 || doc.sha256_hash);
        assert.strictEqual(typeof doc.estimated_tokens || typeof doc.token_estimate || typeof doc.word_count, 'number');
      });
    });

    it('E-3: Project snapshot creation (CreateProjectSnapshot) in data/snapshots/', async () => {
      const res = await dispatcher.dispatch('CreateProjectSnapshot', {
        snapshotName: 'phase4_e2e_snapshot'
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(res.snapshotId);
      assert.ok(res.snapshotPath);
      assert.ok(fs.existsSync(res.snapshotPath));

      const snapshotData = JSON.parse(fs.readFileSync(res.snapshotPath, 'utf8'));
      assert.ok(snapshotData.snapshotId);
      assert.ok(snapshotData.tables);
      assert.ok(snapshotData.tables.entities.length >= 3);
      assert.ok(snapshotData.tables.source_files.length >= 3);
    });

    it('E-4: Snapshot restoration preview (RestoreProjectSnapshotPreview) diff analysis', async () => {
      // 1. Create snapshot
      const createRes = await dispatcher.dispatch('CreateProjectSnapshot', {
        snapshotName: 'preview_diff_base'
      });
      const snapshotId = createRes.snapshotId;

      // 2. Modify live database state
      dbManager.entities.insert({
        entity_id: 'NEW-099',
        canonical_name: '新实体',
        entity_type: 'item',
        status: 'active'
      });

      // 3. Run preview diff
      const previewRes = await dispatcher.dispatch('RestoreProjectSnapshotPreview', {
        snapshotId
      });

      assert.strictEqual(previewRes.status, 'success');
      assert.strictEqual(previewRes.currentVsSnapshotDiff.schemaVersionMatch, true);
      assert.ok(previewRes.currentVsSnapshotDiff);
      assert.strictEqual(previewRes.requiredConfirmationToken, 'CONFIRM_RESTORE');

      // Verify that preview did NOT revert the database yet
      const db = dbManager.getDatabase();
      const count = db.prepare('SELECT COUNT(*) as cnt FROM entities WHERE entity_id = ?').get('NEW-099').cnt;
      assert.strictEqual(count, 1, 'Preview must not mutate live database state');
    });

    it('E-5: Full snapshot restoration (RestoreProjectSnapshot) with confirmation token', async () => {
      // 1. Create initial snapshot
      const createRes = await dispatcher.dispatch('CreateProjectSnapshot', {
        snapshotName: 'restore_test_snapshot'
      });
      const snapshotId = createRes.snapshotId;

      // 2. Add extra entities and modify state
      dbManager.entities.insert({
        entity_id: 'TEMP-101',
        canonical_name: '临时实体',
        entity_type: 'character',
        status: 'active'
      });
      const db = dbManager.getDatabase();
      assert.strictEqual(db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt, 4);

      // 3. Attempt restore WITHOUT confirmationToken -> must throw GovernanceSafetyError
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('RestoreProjectSnapshot', {
            snapshotId
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.strictEqual(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
          assert.match(err.message, /confirmationToken.*is mandatory/i);
          return true;
        }
      );

      // 4. Restore WITH confirmationToken
      const restoreRes = await dispatcher.dispatch('RestoreProjectSnapshot', {
        snapshotId,
        confirmationToken: 'CONFIRM_RESTORE'
      });

      assert.strictEqual(restoreRes.status, 'success');
      assert.strictEqual(restoreRes.snapshotId, snapshotId);

      // Verify database reverted to initial snapshot state (3 entities, TEMP-101 removed)
      assert.strictEqual(db.prepare('SELECT COUNT(*) as cnt FROM entities').get().cnt, 3);
      const tempExists = db.prepare('SELECT COUNT(*) as cnt FROM entities WHERE entity_id = ?').get('TEMP-101').cnt;
      assert.strictEqual(tempExists, 0);
    });

    it('E-6: Universal response envelope enforcement across all commands (requestId UUID and databaseRevision integer)', async () => {
      const commandsToTest = [
        { action: 'BuildVCPContext', params: { chapterId: 'Ch01', focusEntities: ['灰港星'] } },
        { action: 'GetContextTrace', params: { snapshotId: 'ctx_mock_001' } },
        { action: 'RegisterCreativeDecision', params: { decisionType: 'test_decision', proposedChanges: {} } },
        { action: 'SuggestMemoryUpdate', params: { draftContent: '草稿正文' } },
        {
          action: 'PublishToVCPMemory',
          params: { confirmedBy: 'author', memories: [{ memoryType: 'summary', title: '测试', content: '内容' }] }
        },
        { action: 'EvaluateCanonLeakage', params: { draftContent: '干净的草稿正文' } },
        { action: 'EvaluateContextPrecision', params: { contextSnapshot: { canonFacts: [] } } },
        { action: 'EvaluateContextRecall', params: { contextSnapshot: { canonFacts: [] } } },
        { action: 'EvaluateMemoryConflict', params: { vcpMemories: [] } }
      ];

      // Save a mock context trace for GetContextTrace test
      const traceManager = new TraceManager(dbManager, { pathGuard });
      traceManager.saveTrace({
        snapshot_id: 'ctx_mock_001',
        trace_id: 'tr_mock_001',
        project_id: '流浪',
        chapter_id: 'Ch01',
        total_sources: 0,
        source_systems: ['NovelEngineering'],
        trace_items: []
      });

      for (const cmd of commandsToTest) {
        const res = await dispatcher.dispatch(cmd.action, cmd.params);
        assert.strictEqual(res.status, 'success', `Command ${cmd.action} must succeed`);
        assert.ok(res.requestId, `Command ${cmd.action} must have requestId`);
        assert.strictEqual(typeof res.requestId, 'string', `Command ${cmd.action} requestId must be string`);
        assert.ok(res.requestId.length >= 8, `Command ${cmd.action} requestId must be non-trivial`);
        assert.strictEqual(typeof res.databaseRevision, 'number', `Command ${cmd.action} databaseRevision must be number`);
        assert.ok(res.databaseRevision >= 1, `Command ${cmd.action} databaseRevision must be >= 1`);
      }
    });

    it('E-7: Fast utility verification (ping, help with all commands, info with Phase 4)', async () => {
      // 1. Ping
      const pingRes = await dispatcher.dispatch('ping');
      assert.strictEqual(pingRes.pong, true);
      assert.strictEqual(pingRes.message, 'PONG');
      assert.ok(pingRes.timestamp);

      // 2. Help
      const helpRes = await dispatcher.dispatch('help');
      assert.strictEqual(helpRes.version, '1.0.0');
      assert.ok(Array.isArray(helpRes.availableCommands));
      assert.strictEqual(
        helpRes.availableCommands.length,
        42,
        'Help must list all 42 commands (39 domain + 3 utilities)'
      );
      assert.ok(helpRes.availableCommands.includes('BuildVCPContext'));
      assert.ok(helpRes.availableCommands.includes('PublishToVCPMemory'));
      assert.ok(helpRes.availableCommands.includes('EvaluateCanonLeakage'));

      // 3. Info
      const infoRes = await dispatcher.dispatch('info');
      assert.strictEqual(infoRes.name, 'NovelEngineering');
      assert.strictEqual(infoRes.status, 'ready');
      assert.strictEqual(infoRes.version, '1.0.0');
      assert.strictEqual(infoRes.details.milestone, 'Phase 4');
    });
  });
});
