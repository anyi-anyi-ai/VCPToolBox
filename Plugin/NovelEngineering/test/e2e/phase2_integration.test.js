/**
 * @file phase2_integration.test.js
 * @description End-to-end integration test covering full Phase 2 authoring lifecycle (Scan -> Context -> Draft -> Foreshadowing -> Timeline)
 * @module test/e2e/phase2_integration
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const MicroWorldTreeGenerator = require('../fixtures/MicroWorldTreeGenerator');
const { createTempDir } = require('../helpers/tempDir');

describe('E2E Integration: Phase 2 Full Authoring Lifecycle & Zero Mutation Suite', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;
  let initialSourceHash = null;

  beforeEach(async () => {
    tempEnv = createTempDir('vcp_p2_e2e_');
    vaultDir = tempEnv.createSubdir('e2e_vault');
    pluginDir = tempEnv.createSubdir('e2e_plugin');

    // Generate comprehensive micro world tree with control lore & entities
    const generator = new MicroWorldTreeGenerator({ targetDir: vaultDir });
    generator.generate();

    // Snapshot initial source tree hash (excluding any future 13_ sandbox output)
    initialSourceHash = computeSourceVaultHash(vaultDir);

    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: pluginDir,
      dbPath,
      dbManager,
      pathGuard
    });
  });

  afterEach(() => {
    if (dispatcher) {
      dispatcher.close();
    }
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv) {
      tempEnv.cleanup();
    }
  });

  it('P2-E2E: should execute complete authoring lifecycle: Scan -> Context Recall -> Draft Sandbox Save -> Foreshadowing -> Timeline -> Zero Mutation', async () => {
    // =======================================================================
    // Step 1: Scan & Index World Tree
    // =======================================================================
    const scanRes = await dispatcher.dispatch('ScanWorldTree', { vaultRoot: vaultDir });
    assert.ok(scanRes, 'ScanWorldTree must succeed');
    const scanDetails = scanRes.details || scanRes;
    assert.ok(
      (scanDetails.totalFilesScanned || scanDetails.filesAdded || 0) >= 15,
      'Scan must index all world tree files'
    );

    // =======================================================================
    // Step 2: Context Retrieval via GetChapterContext for Chapter 1
    // =======================================================================
    const contextRes = await dispatcher.dispatch('GetChapterContext', {
      projectId: 'wandering_novel',
      chapterId: '1',
      focusEntities: ['阿尔法星', '林远'],
      includeWorldRules: true
    });

    assert.ok(contextRes, 'GetChapterContext must return result');
    const ctxDetails = contextRes.details || contextRes;

    // Verify entity recall (Alpha planet & Lin Yuan)
    assert.ok(ctxDetails.entities && ctxDetails.entities.length >= 2, 'Must recall both focus entities');
    const hasAlpha = ctxDetails.entities.some(e =>
      (e.canonicalName || e.canonical_name) === '阿尔法星' || (e.entityId || e.entity_id) === 'PL-002'
    );
    const hasLin = ctxDetails.entities.some(e =>
      (e.canonicalName || e.canonical_name) === '林远' || (e.entityId || e.entity_id) === 'CHAR-005'
    );
    assert.ok(hasAlpha, 'Must recall 阿尔法星 (PL-002)');
    assert.ok(hasLin, 'Must recall 林远 (CHAR-005)');

    // Verify worldview rule inclusion
    const worldRules = ctxDetails.worldRules || ctxDetails.world_rules || [];
    assert.ok(worldRules.length >= 1, 'Must include world rules');

    // =======================================================================
    // Step 3: Author and Save Chapter 3 Draft into Sandbox
    // =======================================================================
    const draftText = [
      '# 第三章 深空跃迁测试',
      '',
      '领航员林远站在观测台前，阿尔法星补给站的光点在雷达上逐渐缩小。',
      '超空间引擎发出低沉的轰鸣，空间引力透镜校准完毕。'
    ].join('\n');

    const saveRes = await dispatcher.dispatch('SaveChapterDraft', {
      projectId: 'wandering_novel',
      chapterId: 'CH-003',
      title: '第三章 深空跃迁测试',
      content: draftText,
      summary: '全舰队进行第三次跃迁引擎测试。',
      volumeNumber: 1,
      chapterNumber: 3,
      vaultRoot: vaultDir
    });

    assert.ok(saveRes, 'SaveChapterDraft must succeed');
    const saveDetails = saveRes.details || saveRes;
    assert.equal(saveDetails.status || saveRes.status, 'draft');
    assert.equal(saveDetails.canon !== undefined ? saveDetails.canon : 0, 0);

    // Verify physical file was written ONLY in 13_小说工程插件/篇章草稿/
    const sandboxDir = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
    assert.ok(fs.existsSync(sandboxDir), 'Sandbox directory must exist');
    const draftFiles = fs.readdirSync(sandboxDir);
    assert.ok(draftFiles.length >= 1, 'Draft file must exist in sandbox');

    // Verify SQLite chapters record
    const chapters = dbManager.chapters.query({ volume_number: 1 });
    const ch3 = chapters.find(c => c.chapter_number === 3 || c.title.includes('跃迁测试'));
    assert.ok(ch3, 'Chapter 3 must be recorded in SQLite');
    assert.equal(ch3.status, 'draft');
    assert.equal(ch3.canon !== undefined ? ch3.canon : 0, 0);

    // =======================================================================
    // Step 4: Narrative State Tracking (ManageForeshadowing & ManageTimeline)
    // =======================================================================
    // 4.1 Add new foreshadowing clue for Chapter 3
    const addFsRes = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-101',
      title: '引力波异常频段',
      description: '在第三次跃迁中观测到的未知周期性引力脉冲。',
      importance_level: 'major',
      setup_chapter_id: 3,
      tags: ['gravitational_anomaly', 'cosmic_mystery']
    });
    assert.ok(addFsRes);

    // 4.2 Resolve ancient relic clue FS-002 in Chapter 3
    const resolveFsRes = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'resolve',
      thread_key: 'FS-002',
      resolution_snippet: '在第3章中，林远利用导航计算机破解了黑匣子的第一层外壳。',
      resolution_chapter_id: 3
    });
    assert.ok(resolveFsRes);

    // 4.3 Add new chronological timeline event
    const addTlRes = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '第三次深空跃迁成功',
      time_point: 2115.06,
      era_epoch: '新历',
      description: '舰队成功穿过柯伊伯带引力陷阱。',
      involved_entities: ['林远', '阿尔法星']
    });
    assert.ok(addTlRes);

    // =======================================================================
    // Step 5: Verify Updated State via GetChapterContext for Chapter 3
    // =======================================================================
    const ch3ContextRes = await dispatcher.dispatch('GetChapterContext', {
      projectId: 'wandering_novel',
      chapterId: '3',
      focusEntities: ['林远'],
      includeWorldRules: true
    });

    assert.ok(ch3ContextRes);
    const ch3Ctx = ch3ContextRes.details || ch3ContextRes;
    assert.ok(ch3Ctx.chapter);
    assert.equal(ch3Ctx.chapter.title, '第三章 深空跃迁测试');

    // =======================================================================
    // Step 6: Security Defense Invariant (Attempt Illegal Write to 01_Worldview)
    // =======================================================================
    await assert.rejects(
      async () => {
        await dispatcher.dispatch('SaveChapterDraft', {
          chapterId: 'MALICIOUS_OVERWRITE',
          title: '非法篡改世界观',
          content: '# Hacked Lore',
          customPath: path.join(vaultDir, '01_Worldview', 'Hacked_Worldview.md'),
          vaultRoot: vaultDir
        });
      },
      /ERR_VAULT_WRITE_BLOCKED|SecurityError|blocked|sandbox/i
    );

    // =======================================================================
    // Step 7: Zero-Mutation Verification on 01~12 Source Vault Directories
    // =======================================================================
    const finalSourceHash = computeSourceVaultHash(vaultDir);
    assert.equal(
      finalSourceHash,
      initialSourceHash,
      'Source knowledge base folders 01~12 MUST experience ZERO mutations throughout the entire authoring cycle'
    );
  });
});

// Helper: Computes hash of source setting folders 01~12 only (excluding 13_ sandbox)
function computeSourceVaultHash(targetDir) {
  const files = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      const rel = path.relative(targetDir, full).replace(/\\/g, '/');

      // Skip 13_ sandbox directory when verifying zero mutation of source folders
      if (rel.startsWith('13_') || rel.includes('13_小说工程插件')) {
        continue;
      }

      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        const buf = fs.readFileSync(full);
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        files.push(`${rel}|${hash}`);
      }
    }
  }
  walk(targetDir);
  files.sort();
  return crypto.createHash('sha256').update(files.join('\n')).digest('hex');
}
