/**
 * @file getChapterContext.test.js
 * @description Comprehensive unit test suite for GetChapterContext command and recall accuracy
 * @module test/unit/getChapterContext
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
const { createTempDir } = require('../helpers/tempDir');

describe('GetChapterContext: Narrative Context Aggregator Suite', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(async () => {
    tempEnv = createTempDir('vcp_ctx_test_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    // Create WorldTree directory structure
    const worldDir = path.join(vaultDir, '01_Worldview');
    const planetDir = path.join(vaultDir, '02_Entities', 'Planets');
    const charDir = path.join(vaultDir, '02_Entities', 'Characters');
    const chDir = path.join(vaultDir, '03_Chapters', 'Vol01');
    const tlDir = path.join(vaultDir, '04_Timeline');
    const fsDir = path.join(vaultDir, '05_Foreshadowing');

    fs.mkdirSync(worldDir, { recursive: true });
    fs.mkdirSync(planetDir, { recursive: true });
    fs.mkdirSync(charDir, { recursive: true });
    fs.mkdirSync(chDir, { recursive: true });
    fs.mkdirSync(tlDir, { recursive: true });
    fs.mkdirSync(fsDir, { recursive: true });

    // 1. Worldview rules
    fs.writeFileSync(
      path.join(worldDir, 'Cosmology_Canon.md'),
      [
        '---',
        'category: worldview_setting',
        'type: lore',
        'status: finalized',
        'review_status: confirmed',
        '---',
        '# 恒星衰变与流浪公理',
        '',
        '所有星舰必须遵守流浪宪章，暗能量潮汐周期为每300年一次。'
      ].join('\n'),
      'utf8'
    );

    // 2. Canonical Planet entity with aliases
    fs.writeFileSync(
      path.join(planetDir, 'Terra_PL001.md'),
      [
        '---',
        'id: PL-001',
        'name: 泰拉',
        'category: planet',
        'status: canonical',
        'review_status: confirmed',
        'aliases: ["地球", "母星", "蓝星"]',
        '---',
        '# 泰拉 (PL-001)',
        '',
        '人类文明发源地，已开启全功率行星推进器进行深空流浪。'
      ].join('\n'),
      'utf8'
    );

    // 3. Deprecated entity (should be filtered out)
    fs.writeFileSync(
      path.join(planetDir, 'OldTerra_Deprecated.md'),
      [
        '---',
        'id: PL-001-OLD',
        'name: 旧泰拉废案',
        'category: planet',
        'status: deprecated',
        '---',
        '# 旧泰拉废案\n废弃设定。'
      ].join('\n'),
      'utf8'
    );

    // 4. Canonical Character entity
    fs.writeFileSync(
      path.join(charDir, 'LinYuan_CHAR005.md'),
      [
        '---',
        'id: CHAR-005',
        'name: 林远',
        'category: character',
        'status: canonical',
        'review_status: confirmed',
        'aliases: ["领航员林远", "先锋者"]',
        '---',
        '# 林远 (CHAR-005)',
        '',
        '流浪探索号首席领航员，具备空间引力透镜导航直觉。'
      ].join('\n'),
      'utf8'
    );

    // 5. Chapter 1 text
    fs.writeFileSync(
      path.join(chDir, 'Chapter_01.md'),
      [
        '---',
        'chapter_number: 1',
        'volume_number: 1',
        'title: 启航之日',
        'status: finalized',
        'summary: 全球推进器点火，舰队启航。',
        'timeline_start: 100',
        'timeline_end: 120',
        '---',
        '# 第一章 启航之日\n\n等离子烈焰划破夜空。'
      ].join('\n'),
      'utf8'
    );

    // 6. Timeline event
    fs.writeFileSync(
      path.join(tlDir, 'Event_Ignition_EV001.md'),
      [
        '---',
        'id: EV-001',
        'title: 行星推进器总点火',
        'timestamp_order: 105',
        'era_epoch: 新历',
        'status: finalized',
        '---',
        '# 行星推进器总点火 (EV-001)\n\n公元2100年全功率点火。'
      ].join('\n'),
      'utf8'
    );

    // 7. Open Foreshadowing clue
    fs.writeFileSync(
      path.join(fsDir, 'Hook_Relic_FS001.md'),
      [
        '---',
        'id: FS-001',
        'title: 第三货舱古代信号',
        'status: open',
        'importance: major',
        '---',
        '# 第三货舱古代信号 (FS-001)\n\n暗藏在货舱底部的未解密先驱者信号。'
      ].join('\n'),
      'utf8'
    );

    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    // Perform initial index scan to populate SQLite database
    await IncrementalIndexer.sync(vaultDir, dbManager);

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

  // =========================================================================
  // Tier 1: Happy-Path Context Retrieval & Recall
  // =========================================================================
  describe('Tier 1: Core Context Assembly & Entity Recall', () => {

    it('F2-T1.1: should recall canonical entities by exact name and attach raw markdown content', async () => {
      const payload = {
        projectId: 'wandering_novel',
        chapterId: '1',
        focusEntities: ['泰拉', '林远'],
        includeWorldRules: true
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      assert.ok(res, 'Must return result');
      const details = res.details || res;

      assert.ok(details.entities, 'Must contain entities array');
      assert.equal(details.entities.length, 2, 'Should recall exactly 2 focus entities');

      const terra = details.entities.find(e => e.canonicalName === '泰拉' || e.canonical_name === '泰拉' || e.entityId === 'PL-001' || e.entity_id === 'PL-001');
      assert.ok(terra, 'Should recall Terra planet');
      assert.ok(terra.rawContent || terra.content || terra.description, 'Should contain on-disk markdown text');

      const lin = details.entities.find(e => e.canonicalName === '林远' || e.canonical_name === '林远' || e.entityId === 'CHAR-005' || e.entity_id === 'CHAR-005');
      assert.ok(lin, 'Should recall Lin Yuan character');
    });

    it('F2-T1.2: should recall entities via alias resolution (e.g. 地球 -> 泰拉)', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['地球'], // Alias of 泰拉
        includeWorldRules: false
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;

      assert.ok(details.entities);
      assert.ok(details.entities.length >= 1, 'Alias "地球" must resolve to canonical entity');
      const matched = details.entities[0];
      assert.equal(matched.canonicalName || matched.canonical_name, '泰拉');
      assert.equal(matched.entityId || matched.entity_id, 'PL-001');
    });

    it('F2-T1.3: should include foundational worldview rules when includeWorldRules=true', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['林远'],
        includeWorldRules: true
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;

      assert.ok(details.worldRules || details.world_rules, 'Must contain worldRules');
      const rules = details.worldRules || details.world_rules;
      assert.ok(rules.length >= 1, 'Should include at least 1 world rule');
      assert.ok(
        rules.some(r => (r.title || r.canonicalName || r.canonical_name || '').includes('恒星衰变') || (r.content || r.rawContent || '').includes('流浪宪章')),
        'Should include Cosmology Canon rule'
      );
    });

    it('F2-T1.4: should include open foreshadowing clues and chronological timeline events', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['泰拉'],
        includeWorldRules: true
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;

      const foreshadowing = details.foreshadowing || details.openForeshadowing || details.open_foreshadowing;
      assert.ok(foreshadowing, 'Should contain open foreshadowing array');
      assert.ok(foreshadowing.length >= 1, 'Should include active clue FS-001');
      assert.ok(foreshadowing.some(f => (f.foreshadowId || f.foreshadow_id || f.id_code) === 'FS-001' || f.title.includes('第三货舱')));

      const timeline = details.timeline || details.relevantTimelineEvents || details.timeline_events;
      assert.ok(timeline, 'Should contain timeline events array');
      assert.ok(timeline.length >= 1, 'Should include timeline event EV-001');
    });

    it('F2-T1.5: should resolve target chapter metadata cleanly', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['泰拉']
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;

      assert.ok(details.chapter, 'Must contain chapter metadata');
      assert.equal(details.chapter.chapterNumber || details.chapter.chapter_number, 1);
      assert.ok(details.chapter.title.includes('启航之日'));
    });
  });

  // =========================================================================
  // Tier 2: Boundary, Filtering & Fallback Behavior
  // =========================================================================
  describe('Tier 2: Filtering & Graceful Fallbacks', () => {

    it('F2-T2.1: should strictly filter out deprecated and archived entities', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['旧泰拉废案', 'PL-001-OLD'],
        includeWorldRules: false
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;

      assert.ok(details.entities !== undefined);
      assert.equal(details.entities.length, 0, 'Deprecated entity must NOT be included in context');
    });

    it('F2-T2.2: should exclude worldview rules when includeWorldRules=false', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['林远'],
        includeWorldRules: false
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;

      const rules = details.worldRules || details.world_rules || [];
      assert.equal(rules.length, 0, 'World rules must be empty when includeWorldRules=false');
    });

    it('F2-T2.3: should handle non-existent entities gracefully without errors', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: ['不存在的虚空神殿', 'NON_EXISTENT_099'],
        includeWorldRules: true
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      assert.ok(res);
      const details = res.details || res;
      assert.ok(Array.isArray(details.entities));
      assert.equal(details.entities.length, 0);
    });

    it('F2-T2.4: should accept empty focusEntities array and return general chapter context', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: [],
        includeWorldRules: true
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      assert.ok(res);
      const details = res.details || res;
      assert.equal(details.entities.length, 0);
      assert.ok(details.worldRules.length >= 1, 'Should still include world rules if requested');
    });

    it('F2-T2.5: should accept comma-separated string for focusEntities', async () => {
      const payload = {
        chapterId: '1',
        focusEntities: '泰拉, 林远',
        includeWorldRules: false
      };

      const res = await dispatcher.dispatch('GetChapterContext', payload);
      const details = res.details || res;
      assert.equal(details.entities.length, 2, 'Should parse comma-delimited entity string');
    });
  });

  // =========================================================================
  // Tier 3: Cross-Feature Integration with Drafts & Aliases
  // =========================================================================
  describe('Tier 3: Draft Retrieval & Cross-Feature Integration', () => {

    it('F2-T3.1: should retrieve context for a newly authored draft chapter in 13 sandbox', async () => {
      // 1. Save a new draft
      await dispatcher.dispatch('SaveChapterDraft', {
        chapterId: 'CH-002',
        title: '第二章 跃迁测试',
        content: '# 第二章 跃迁测试\n\n测试正文。',
        summary: '进行跃迁引擎测试',
        volumeNumber: 1,
        chapterNumber: 2,
        vaultRoot: vaultDir
      });

      // 2. Retrieve context for Chapter 2
      const res = await dispatcher.dispatch('GetChapterContext', {
        chapterId: '2',
        focusEntities: ['林远'],
        includeWorldRules: true
      });

      const details = res.details || res;
      assert.ok(details.chapter);
      assert.equal(details.chapter.title, '第二章 跃迁测试');
      assert.equal(details.chapter.chapterNumber || details.chapter.chapter_number, 2);
    });

    it('F2-T3.2: should assemble rich prompt context string with zero mutation to on-disk vault', async () => {
      const treeHashBefore = MicroWorldTreeHash(vaultDir);

      const res = await dispatcher.dispatch('GetChapterContext', {
        chapterId: '1',
        focusEntities: ['泰拉', '林远'],
        includeWorldRules: true
      });

      const treeHashAfter = MicroWorldTreeHash(vaultDir);
      assert.equal(treeHashAfter, treeHashBefore, 'Context retrieval MUST be 100% read-only and never mutate files');

      const details = res.details || res;
      if (details.assembledContext) {
        assert.ok(typeof details.assembledContext === 'string');
        assert.ok(details.assembledContext.includes('泰拉'));
        assert.ok(details.assembledContext.includes('林远'));
      }
    });
  });
});

// Deterministic vault tree hasher for read-only verification
function MicroWorldTreeHash(targetDir) {
  const files = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        const buf = fs.readFileSync(full);
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        files.push(`${path.relative(targetDir, full)}|${hash}`);
      }
    }
  }
  walk(targetDir);
  files.sort();
  return crypto.createHash('sha256').update(files.join('\n')).digest('hex');
}
