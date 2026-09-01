/**
 * @file contextV3.test.js
 * @description Comprehensive 18-Case Unit & Integration Test Suite for Context v3 Snapshot Engine (Milestone 4)
 * @module test/unit/contextV3
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const ContextV3Engine = require('../../src/context/ContextV3Engine');
const RuleClassifier = require('../../src/context/RuleClassifier');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

// Helper for deterministic vault directory hashing
function computeVaultHash(targetDir) {
  const files = [];
  function walk(current) {
    if (!fs.existsSync(current)) return;
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

describe('Milestone 4: Context Snapshot v3 Engine Test Matrix (18 Cases)', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let engine = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m4_ctx_test_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    // Create WorldTree directories
    const worldDir = path.join(vaultDir, '01_Worldview');
    const planetDir = path.join(vaultDir, '04_Entities', 'Planets');
    const charDir = path.join(vaultDir, '04_Entities', 'Characters');
    const starshipDir = path.join(vaultDir, '04_Entities', 'Starships');
    const chDir = path.join(vaultDir, '03_Chapters');
    const tlDir = path.join(vaultDir, '04_Timeline');
    const fsDir = path.join(vaultDir, '05_Foreshadowing');

    fs.mkdirSync(worldDir, { recursive: true });
    fs.mkdirSync(planetDir, { recursive: true });
    fs.mkdirSync(charDir, { recursive: true });
    fs.mkdirSync(starshipDir, { recursive: true });
    fs.mkdirSync(chDir, { recursive: true });
    fs.mkdirSync(tlDir, { recursive: true });
    fs.mkdirSync(fsDir, { recursive: true });

    // 1. Worldview files on disk
    fs.writeFileSync(
      path.join(worldDir, 'Universal_Axioms.md'),
      '---\nrule_scope: global\ncanon_level: 3\nstatus: active\nreview_status: reviewed\n---\n# 光速不变公理\n真空光速恒定为每秒三十万公里，无法超越。',
      'utf8'
    );

    fs.writeFileSync(
      path.join(worldDir, 'Terra_Local_Atmosphere.md'),
      '---\nrule_scope: scoped\nbound_entities: ["ENT-TERRA"]\ncanon_level: 2\nstatus: active\nreview_status: reviewed\n---\n# 泰拉局部大气环境\n泰拉大气层富氧，气压为标准1个大气压。',
      'utf8'
    );

    fs.writeFileSync(
      path.join(worldDir, 'Mars_Local_Dust.md'),
      '---\nrule_scope: scoped\nbound_entities: ["ENT-MARS"]\ncanon_level: 2\nstatus: active\nreview_status: reviewed\n---\n# 火星局部尘暴规则\n火星地表季节性出现超大规模静电尘暴。',
      'utf8'
    );

    // 2. Entity files on disk
    fs.writeFileSync(
      path.join(planetDir, 'Terra.md'),
      '---\nid: ENT-TERRA\nname: 泰拉\ncategory: planet\ncanon_level: 2\nstatus: active\nreview_status: confirmed\naliases: ["地球", "母星"]\n---\n# 泰拉 (ENT-TERRA)\n人类母星，配备行星发动机。',
      'utf8'
    );

    fs.writeFileSync(
      path.join(charDir, 'LinYuan.md'),
      '---\nid: ENT-LIN\nname: 林远\ncategory: character\ncanon_level: 1\nstatus: active\nreview_status: reviewed\naliases: ["先锋领航员"]\n---\n# 林远 (ENT-LIN)\n远征号领航员，具备空间引力感知天赋。',
      'utf8'
    );

    fs.writeFileSync(
      path.join(starshipDir, 'Voyager_Starship.md'),
      '---\nid: ENT-VOYAGER\nname: 远征号星舰\ncategory: technology\ncanon_level: 2\nstatus: active\nreview_status: reviewed\n---\n# 远征号星舰 (ENT-VOYAGER)\n重型深空探索舰。',
      'utf8'
    );

    fs.writeFileSync(
      path.join(charDir, 'DraftHero.md'),
      '---\nid: ENT-DRAFT\nname: 草稿英雄X\ncategory: character\ncanon_level: 0\nstatus: draft\nreview_status: pending\n---\n# 草稿英雄X\n未审核的灵感草稿。',
      'utf8'
    );

    // 3. Chapters on disk
    fs.writeFileSync(
      path.join(chDir, 'Chapter_01.md'),
      '---\nchapter_number: 1\nvolume_number: 1\ntitle: 启航之日\nstatus: completed\ncanon: 1\ntimeline_start: 100\ntimeline_end: 120\n---\n# 第1章 启航之日\n推进器全功率轰鸣，舰队脱离轨道。',
      'utf8'
    );

    fs.writeFileSync(
      path.join(chDir, 'Chapter_02.md'),
      '---\nchapter_number: 2\nvolume_number: 1\ntitle: 跃迁前夜\nstatus: draft\ncanon: 0\ntimeline_start: 121\ntimeline_end: 150\n---\n# 第2章 跃迁前夜\n准备进行首次曲率跃迁测试。',
      'utf8'
    );

    // Initialize Database
    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });
    const db = dbManager.getDatabase();

    // Populate source_files
    db.prepare(`
      INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, source_category, status, review_status, canon_level, frontmatter_json, sha256_hash)
      VALUES (1, '01_Worldview/Universal_Axioms.md', ?, 'Universal_Axioms.md', 'md', 1024, 1700000000000, 'world_rule', 'active', 'reviewed', 3, '{"rule_scope":"global"}', '1111111111111111111111111111111111111111111111111111111111111111'),
             (2, '01_Worldview/Terra_Local_Atmosphere.md', ?, 'Terra_Local_Atmosphere.md', 'md', 1024, 1700000000000, 'world_rule', 'active', 'reviewed', 2, '{"rule_scope":"scoped","bound_entities":["ENT-TERRA"]}', '2222222222222222222222222222222222222222222222222222222222222222'),
             (3, '01_Worldview/Mars_Local_Dust.md', ?, 'Mars_Local_Dust.md', 'md', 1024, 1700000000000, 'world_rule', 'active', 'reviewed', 2, '{"rule_scope":"scoped","bound_entities":["ENT-MARS"]}', '3333333333333333333333333333333333333333333333333333333333333333'),
             (4, '04_Entities/Planets/Terra.md', ?, 'Terra.md', 'md', 1024, 1700000000000, 'entity', 'active', 'confirmed', 2, '{"id":"ENT-TERRA"}', '4444444444444444444444444444444444444444444444444444444444444444'),
             (5, '04_Entities/Characters/LinYuan.md', ?, 'LinYuan.md', 'md', 1024, 1700000000000, 'entity', 'active', 'reviewed', 1, '{"id":"ENT-LIN"}', '5555555555555555555555555555555555555555555555555555555555555555'),
             (6, '04_Entities/Starships/Voyager_Starship.md', ?, 'Voyager_Starship.md', 'md', 1024, 1700000000000, 'entity', 'active', 'reviewed', 2, '{"id":"ENT-VOYAGER"}', '6666666666666666666666666666666666666666666666666666666666666666'),
             (7, '04_Entities/Characters/DraftHero.md', ?, 'DraftHero.md', 'md', 1024, 1700000000000, 'entity', 'draft', 'pending', 0, '{"id":"ENT-DRAFT"}', '7777777777777777777777777777777777777777777777777777777777777777'),
             (8, '03_Chapters/Chapter_01.md', ?, 'Chapter_01.md', 'md', 1024, 1700000000000, 'chapter', 'completed', 'approved', 2, '{"chapter_number":1}', '8888888888888888888888888888888888888888888888888888888888888888'),
             (9, '03_Chapters/Chapter_02.md', ?, 'Chapter_02.md', 'md', 1024, 1700000000000, 'chapter', 'draft', 'active', 0, '{"chapter_number":2}', '9999999999999999999999999999999999999999999999999999999999999999')
    `).run(
      path.join(worldDir, 'Universal_Axioms.md'),
      path.join(worldDir, 'Terra_Local_Atmosphere.md'),
      path.join(worldDir, 'Mars_Local_Dust.md'),
      path.join(planetDir, 'Terra.md'),
      path.join(charDir, 'LinYuan.md'),
      path.join(starshipDir, 'Voyager_Starship.md'),
      path.join(charDir, 'DraftHero.md'),
      path.join(chDir, 'Chapter_01.md'),
      path.join(chDir, 'Chapter_02.md')
    );

    // Populate entities
    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'ENT-TERRA', '泰拉', 'planet', 'active', 'confirmed', 2, 4),
             (2, 'ENT-LIN', '林远', 'character', 'active', 'reviewed', 1, 5),
             (3, 'ENT-VOYAGER', '远征号星舰', 'technology', 'active', 'reviewed', 2, 6),
             (4, 'ENT-DRAFT', '草稿英雄X', 'character', 'draft', 'pending', 0, 7)
    `).run();

    // Populate entity_aliases
    db.prepare(`
      INSERT INTO entity_aliases (entity_id, alias_name)
      VALUES (1, '地球'),
             (1, '母星'),
             (2, '先锋领航员')
    `).run();

    // Populate file_entities
    db.prepare(`
      INSERT INTO file_entities (source_file_id, entity_id, mention_type)
      VALUES (4, 1, 'primary_definition'),
             (5, 2, 'primary_definition'),
             (6, 3, 'primary_definition'),
             (7, 4, 'primary_definition')
    `).run();

    // Populate entity_relations (Lin Yuan pilots Voyager Starship)
    db.prepare(`
      INSERT INTO entity_relations (id, source_entity_id, target_entity_id, relation_type, weight, confidence, bidirectional, description)
      VALUES (1, 2, 3, 'pilots', 1.0, 1.0, 0, '林远担任远征号首席领航员')
    `).run();

    // Populate chapters
    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon, timeline_start, timeline_end, summary)
      VALUES (1, 1, 1, '启航之日', '03_Chapters/Chapter_01.md', 8, 2, 'completed', 1, 100, 120, '推进器点火启航'),
             (2, 2, 1, '跃迁前夜', '03_Chapters/Chapter_02.md', 9, 2, 'draft', 0, 121, 150, '曲率引擎跃迁准备')
    `).run();

    // Populate timeline_events (Channels 1, 2, 3, 4, 5)
    db.prepare(`
      INSERT INTO timeline_events (id, event_id, title, relative_time_desc, timestamp_order, primary_entity_id, source_file_id, participant_entity_ids_json, description)
      VALUES (1, 'EVT-100', '行星发动机联合点火', '2040.01', 105.0, 1, 4, '["ENT-TERRA"]', '泰拉全球推进器点火'),
             (2, 'EVT-101', '林远通过领航员选拔', '2041.05', 110.0, 2, 5, '["ENT-LIN"]', '林远以第一名成绩入选领航组'),
             (3, 'EVT-102', '远征号深空船坞下水', '2041.08', 115.0, 3, 6, '["ENT-VOYAGER"]', '远征号完成轨道舾装'),
             (4, 'EVT-103', '首次曲率泡测试', '2042.02', 130.0, 3, 6, '["ENT-VOYAGER","ENT-LIN"]', '测试曲率泡空间压缩')
    `).run();

    // Populate foreshadowing
    db.prepare(`
      INSERT INTO foreshadowing (id, foreshadow_id, title, description, setup_chapter_id, introduced_chapter, status, importance_level, related_entities_json)
      VALUES (1, 'FS-001', '先驱者暗能量信标', '第三货舱检测到微弱未知信号', 1, '1', 'open', 'major', '["ENT-TERRA","ENT-VOYAGER"]')
    `).run();

    // Populate anomaly_reports (Setting conflict)
    db.prepare(`
      INSERT INTO anomaly_reports (id, scan_session_id, anomaly_rule_id, anomaly_type, severity, title, message, affected_file_paths_json, affected_entity_ids_json, is_resolved)
      VALUES (1, 'session_m4_init', 'ANOM_001', 'conflict', 'HIGH', '泰拉自转周期数据冲突', '文档04与01中泰拉自转速率记录不一致', '["04_Entities/Planets/Terra.md"]', '["ENT-TERRA"]', 0)
    `).run();

    engine = new ContextV3Engine(dbManager, { pathGuard });
    dispatcher = new CommandDispatcher({
      basePath: pluginDir,
      dbPath,
      dbManager,
      pathGuard
    });
  });

  afterEach(() => {
    if (dispatcher) dispatcher.close();
    if (dbManager && dbManager.isOpen()) dbManager.close();
    if (tempEnv) tempEnv.cleanup();
  });

  // =========================================================================
  // Group 1: Global vs Scoped Rule Delivery (4 tests)
  // =========================================================================
  describe('Group 1: Global vs Scoped Rule Delivery', () => {

    it('T1.1: Global Axioms Invariant - global axioms must NEVER be filtered by focus terms', () => {
      // Focus on an unrelated term that has no text match in Universal Axioms
      const result = engine.buildSnapshot({
        chapterNumber: 2,
        volumeNumber: 1,
        focusEntities: ['Unrelated_Alien_Robot']
      });

      const { global } = result.snapshot.worldRules;
      assert.ok(global.length >= 1, 'Global rules must be present even when focus entity is unrelated');
      const axiom = global.find(r => r.canonicalName === 'Universal_Axioms');
      assert.ok(axiom, 'Universal_Axioms must be present');
      assert.equal(axiom.scopeType, 'global');
      assert.equal(axiom.canonLevel, 3);
      assert.ok(axiom.sha256Hash);
      assert.ok(axiom.matchReason);
    });

    it('T1.2: Scoped Rules Precision Filtering - bound entities and content matching', () => {
      // Query focus on Terra -> should include Terra_Local_Atmosphere, exclude Mars_Local_Dust
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉']
      });

      const { scoped } = result.snapshot.worldRules;
      assert.ok(scoped.some(r => r.canonicalName === 'Terra_Local_Atmosphere'), 'Should include Terra scoped rule');
      assert.ok(!scoped.some(r => r.canonicalName === 'Mars_Local_Dust'), 'Must exclude Mars scoped rule for Terra focus');
    });

    it('T1.3: Implicit Rule Scope Classification - category, path hierarchy and keyword heuristics', () => {
      // 1. Path heuristic
      const pathAxiom = { relative_path: '01_Worldview/00_Cosmology_Axiom.md', canon_level: 2 };
      assert.equal(RuleClassifier.isGlobal(pathAxiom), true);

      // 2. Category heuristic with no bindings
      const catAxiom = { source_category: 'cosmology', canon_level: 2 };
      assert.equal(RuleClassifier.isGlobal(catAxiom), true);

      // 3. Bound entity rule -> scoped
      const boundRule = { source_category: 'world_rule', frontmatter_json: '{"bound_entities":["ENT-001"]}' };
      assert.equal(RuleClassifier.isGlobal(boundRule), false);
    });

    it('T1.4: Dual Data Structure Invariant - worldRules composite array and object properties', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉']
      });

      const { worldRules } = result.snapshot;
      assert.ok(Array.isArray(worldRules), 'worldRules must pass Array.isArray');
      assert.ok(Array.isArray(worldRules.global), 'worldRules.global must be an array');
      assert.ok(Array.isArray(worldRules.scoped), 'worldRules.scoped must be an array');
      assert.equal(worldRules.length, worldRules.global.length + worldRules.scoped.length);
      assert.ok(typeof worldRules.map === 'function', 'worldRules.map must be iterable');
    });
  });

  // =========================================================================
  // Group 2: Four sourcePolicy Filtering Variations (4 tests)
  // =========================================================================
  describe('Group 2: Four sourcePolicy Filtering Variations', () => {

    it('T2.1: "canon_only" Policy - Level >= 2 and reviewed only; excludes drafts and candidates', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远', '草稿英雄X'],
        sourcePolicy: 'canon_only'
      });

      const { canonSources, candidateSources } = result.snapshot;
      assert.ok(canonSources.some(c => c.canonicalName === '泰拉'), 'Terra (L2 confirmed) must be in canonSources');
      assert.equal(candidateSources.length, 0, 'candidateSources must be empty under canon_only');
      assert.ok(!canonSources.some(c => c.canonicalName === '草稿英雄X'), 'DraftHero must be excluded');
      assert.ok(!canonSources.some(c => c.canonicalName === '林远'), 'LinYuan (L1 candidate) must be excluded from canon_only');
    });

    it('T2.2: "canon_and_reviewed" Policy - Level >= 2 OR Level 1 reviewed; excludes unreviewed drafts', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远', '草稿英雄X'],
        sourcePolicy: 'canon_and_reviewed'
      });

      const { canonSources, candidateSources } = result.snapshot;
      assert.ok(canonSources.some(c => c.canonicalName === '泰拉'), 'Terra must be in canonSources');
      assert.ok(candidateSources.some(c => c.canonicalName === '林远'), 'LinYuan (L1 reviewed) must be in candidateSources');
      assert.ok(!candidateSources.some(c => c.canonicalName === '草稿英雄X'), 'DraftHero (L0 unreviewed) must be excluded');
    });

    it('T2.3: "include_drafts" Policy - Level >= 0 included into candidates', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['草稿英雄X'],
        sourcePolicy: 'include_drafts'
      });

      const { candidateSources } = result.snapshot;
      assert.ok(candidateSources.some(c => c.canonicalName === '草稿英雄X'), 'DraftHero must be recalled under include_drafts');
    });

    it('T2.4: "all" Policy - Complete unfiltered recall of all non-deleted records', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远', '草稿英雄X'],
        sourcePolicy: 'all'
      });

      assert.ok(result.metadata.totalSources >= 3, 'Total sources should aggregate all entities');
      assert.equal(result.metadata.sourcePolicyApplied, 'all');
    });
  });

  // =========================================================================
  // Group 3: SHA-256 Provenance Hash Integrity (3 tests)
  // =========================================================================
  describe('Group 3: SHA-256 Provenance Hash Integrity', () => {

    it('T3.1: 64-character lowercase hex validation across all 7 buckets', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远'],
        sourcePolicy: 'canon_and_reviewed'
      });

      const { worldRules, canonSources, chapterSources, candidateSources, conflicts, unresolved, timelineEvents } = result.snapshot;
      const allBuckets = [
        ...worldRules,
        ...canonSources,
        ...chapterSources,
        ...candidateSources,
        ...conflicts,
        ...unresolved,
        ...timelineEvents
      ];

      assert.ok(allBuckets.length >= 6, 'Should have items in buckets');
      for (const item of allBuckets) {
        assert.ok(item.sha256Hash, 'Item must have sha256Hash');
        assert.equal(typeof item.sha256Hash, 'string');
        assert.equal(item.sha256Hash.length, 64, 'SHA-256 hash must be 64 characters');
        assert.ok(/^[0-9a-f]{64}$/.test(item.sha256Hash), 'Hash must be valid lowercase hex');
        assert.equal(item.hashTrackingStamp, item.sha256Hash, 'hashTrackingStamp must match sha256Hash');
        assert.ok(item.sourceFilePath, 'sourceFilePath must be present');
      }
    });

    it('T3.2: 100% Deterministic Reproducibility on identical state', () => {
      const run1 = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远']
      });

      const run2 = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远']
      });

      assert.equal(run1.snapshot.worldRules[0].sha256Hash, run2.snapshot.worldRules[0].sha256Hash);
      assert.equal(run1.snapshot.canonSources[0].sha256Hash, run2.snapshot.canonSources[0].sha256Hash);
      assert.equal(run1.snapshot.timelineEvents[0].sha256Hash, run2.snapshot.timelineEvents[0].sha256Hash);
    });

    it('T3.3: Content Mutation Hash Sensitivity', () => {
      const contentA = '真空光速恒定为每秒三十万公里。';
      const contentB = '真空光速恒定为每秒三十万公里！'; // 1 char modified

      const hashA = ContextV3Engine.computeHashStamp(contentA, null);
      const hashB = ContextV3Engine.computeHashStamp(contentB, null);

      assert.notEqual(hashA, hashB, 'SHA-256 hash must change upon any content mutation');
      assert.equal(hashA.length, 64);
      assert.equal(hashB.length, 64);
    });
  });

  // =========================================================================
  // Group 4: Structured Timeline Recall via 5 Channels (4 tests)
  // =========================================================================
  describe('Group 4: Structured Timeline Recall via 5 Channels', () => {

    it('T4.1: Channel 1 (primary_entity_id direct link)', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉']
      });

      const { timelineEvents } = result.snapshot;
      const terraEvt = timelineEvents.find(t => t.eventId === 'EVT-100');
      assert.ok(terraEvt, 'Must recall EVT-100 via primary_entity_id');
      assert.ok(terraEvt.matchReason.includes('Primary entity'), 'Match reason must indicate primary entity recall');
    });

    it('T4.2: Channel 2 (source_file_id document association)', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉']
      });

      const { timelineEvents } = result.snapshot;
      assert.ok(timelineEvents.some(t => t.eventId === 'EVT-100'), 'Recalls events linked to source_file_id 4');
    });

    it('T4.3: Channel 3 (1-hop entity_relations graph neighborhood)', () => {
      // Focus on Lin Yuan -> Lin Yuan pilots Voyager Starship -> Voyager events recalled!
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['林远']
      });

      const { timelineEvents } = result.snapshot;
      assert.ok(timelineEvents.some(t => t.eventId === 'EVT-101'), 'Recalls Lin Yuan primary event');
      assert.ok(timelineEvents.some(t => t.eventId === 'EVT-102'), 'Recalls Voyager Starship launch via 1-hop relation');
    });

    it('T4.4: Channel 4 & 5 (participant JSON & chapter interval window sorting)', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['泰拉', '林远']
      });

      const { timelineEvents } = result.snapshot;
      assert.ok(timelineEvents.length >= 3, 'Must recall events within chapter time window [100, 120]');

      // Validate chronological sort
      for (let i = 1; i < timelineEvents.length; i++) {
        assert.ok(
          timelineEvents[i].timestampOrder >= timelineEvents[i - 1].timestampOrder,
          'Timeline events must be strictly sorted by timestampOrder ASC'
        );
      }
    });
  });

  // =========================================================================
  // Group 5: Edge Cases, Protocol Envelopes & Sandboxing (3 tests)
  // =========================================================================
  describe('Group 5: Edge Cases, Protocol Envelopes & Sandboxing', () => {

    it('T5.1: Empty Focus & Non-Existent Chapter Robustness', () => {
      const result = engine.buildSnapshot({
        chapterId: '99999',
        focusEntities: []
      });

      assert.ok(result, 'Must return result');
      assert.equal(result.metadata.chapter, null);
      assert.ok(result.snapshot.worldRules.global.length >= 1, 'Global axioms must still be recalled');
      assert.equal(result.snapshot.canonSources.length, 0);
    });

    it('T5.2: Protocol Response Envelope & Backward Compatibility via CommandDispatcher', async () => {
      const response = await dispatcher.dispatch('GetChapterContext', {
        chapterId: '1',
        focusEntities: '地球, 先锋领航员', // Test alias resolution + comma string
        sourcePolicy: 'canon_and_reviewed'
      });

      assert.equal(response.status, 'success');
      assert.ok(response.details);
      assert.ok(response.snapshot);
      assert.equal(response.snapshot.version, '3.0');
      assert.ok(response.snapshot.snapshotId.startsWith('ctx_snap_'));

      // Backward compatibility assertions for Phase 2 test assertions:
      assert.ok(response.entities || response.details.entities);
      assert.ok(response.worldRules || response.details.worldRules);
      assert.ok(response.chapter || response.details.chapter);
      assert.ok(response.timeline || response.details.timeline);
      assert.ok(response.foreshadowing || response.details.foreshadowing);
      assert.ok(response.conflicts || response.details.conflicts);
      assert.ok(response.assembledContext);
    });

    it('T5.3: Zero Vault Mutation Invariant - micro-hash verification', async () => {
      const hashBefore = computeVaultHash(vaultDir);

      await dispatcher.dispatch('GetChapterContext', {
        chapterId: '1',
        focusEntities: ['泰拉', '林远'],
        sourcePolicy: 'all',
        includeWorldRules: true,
        includeTimeline: true,
        includeForeshadowing: true
      });

      const hashAfter = computeVaultHash(vaultDir);
      assert.equal(hashAfter, hashBefore, 'Vault directory must remain 100% untouched and byte-identical');
    });
  });
});
