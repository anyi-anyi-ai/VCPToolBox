/**
 * @file m4_adversarial_policy.test.js
 * @description Tier-5 Empirical Challenger Adversarial Test Suite for Milestone 4 (Policy Isolation & Boundary Verification)
 * @module test/unit/m4_adversarial_policy
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
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('Milestone 4 Adversarial Challenger: Policy Isolation, Boundary & Chronology Stress Matrix', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let engine = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m4_adv_');
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
      '---\nrule_scope: global\ncanon_level: 3\nstatus: active\nreview_status: reviewed\n---\n# 宇宙公理\n光速为宇宙速度极限。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(worldDir, 'Entropy_Law.md'),
      '---\nglobal: true\ncanon_level: 3\nstatus: active\nreview_status: confirmed\n---\n# 宇宙公理: 熵增定律\n孤立系统熵增不可逆。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(worldDir, 'Terra_Atmosphere.md'),
      '---\nrule_scope: scoped\nbound_entities: ["ENT-TERRA"]\ncanon_level: 2\nstatus: active\nreview_status: reviewed\n---\n# 泰拉大气规则\n富氧环境。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(worldDir, 'Mars_Dust_Storms.md'),
      '---\nrule_scope: scoped\nbound_entities: ["ENT-MARS"]\ncanon_level: 2\nstatus: active\nreview_status: reviewed\n---\n# 火星尘暴规则\n季节性静电尘暴。',
      'utf8'
    );

    // 2. Entities on disk
    fs.writeFileSync(
      path.join(planetDir, 'Terra.md'),
      '---\nid: ENT-TERRA\nname: 泰拉\ncategory: planet\ncanon_level: 2\nstatus: active\nreview_status: confirmed\n---\n# 泰拉\n人类母星。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(charDir, 'LinYuan.md'),
      '---\nid: ENT-LIN\nname: 林远\ncategory: character\ncanon_level: 1\nstatus: active\nreview_status: reviewed\n---\n# 林远\n领航员。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(charDir, 'UnreviewedDraftHero.md'),
      '---\nid: ENT-DRAFT-HERO\nname: 未审核草稿英雄\ncategory: character\ncanon_level: 0\nstatus: draft\nreview_status: unreviewed\n---\n# 未审核草稿英雄\n草稿内容。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(charDir, 'FakeCanonDraft.md'),
      '---\nid: ENT-FAKE-CANON\nname: 虚假正史草稿\ncategory: character\ncanon_level: 2\nstatus: draft\nreview_status: pending\n---\n# 虚假正史草稿\n伪造的canon=2草稿。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(charDir, 'ArchivedOldCanon.md'),
      '---\nid: ENT-ARCHIVED\nname: 已归档历史设定\ncategory: character\ncanon_level: 3\nstatus: archived\nreview_status: confirmed\n---\n# 已归档历史设定\n过时正史。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(charDir, 'DeprecatedFaction.md'),
      '---\nid: ENT-DEPRECATED\nname: 废弃派系\ncategory: faction\ncanon_level: 2\nstatus: deprecated\nreview_status: deprecated\n---\n# 废弃派系\n已废弃。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(starshipDir, 'Voyager_Starship.md'),
      '---\nid: ENT-VOYAGER\nname: 远征号星舰\ncategory: technology\ncanon_level: 2\nstatus: active\nreview_status: confirmed\n---\n# 远征号\n旗舰。',
      'utf8'
    );

    // 3. Chapters on disk
    fs.writeFileSync(
      path.join(chDir, 'Chapter_01.md'),
      '---\nchapter_number: 1\nvolume_number: 1\ntitle: 启航之日\nstatus: completed\ncanon: 1\ntimeline_start: 100\ntimeline_end: 200\n---\n# 第1章\n正史第一章。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(chDir, 'Chapter_02_Draft.md'),
      '---\nchapter_number: 2\nvolume_number: 1\ntitle: 废弃草稿第二章\nstatus: draft\ncanon: 0\ntimeline_start: 201\ntimeline_end: 300\n---\n# 第2章草稿\n草稿第二章。',
      'utf8'
    );
    fs.writeFileSync(
      path.join(chDir, 'Chapter_03.md'),
      '---\nchapter_number: 3\nvolume_number: 1\ntitle: 深空远航\nstatus: active\ncanon: 1\ntimeline_start: 301\ntimeline_end: 400\n---\n# 第3章\n当前创作目标章节。',
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

    try {
      // 1. Populate source_files
      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, frontmatter_json)
        VALUES (1, '01_Worldview/Universal_Axioms.md', ?, 'Universal_Axioms.md', '.md', 100, 100000, '1111111111111111111111111111111111111111111111111111111111111111', 'world_rule', 'active', 'reviewed', 3, '{"rule_scope":"global"}'),
               (2, '01_Worldview/Entropy_Law.md', ?, 'Entropy_Law.md', '.md', 100, 100000, '2222222222222222222222222222222222222222222222222222222222222222', 'world_rule', 'active', 'confirmed', 3, '{"global":true}'),
               (3, '01_Worldview/Terra_Atmosphere.md', ?, 'Terra_Atmosphere.md', '.md', 100, 100000, '3333333333333333333333333333333333333333333333333333333333333333', 'world_rule', 'active', 'reviewed', 2, '{"rule_scope":"scoped","bound_entities":["ENT-TERRA"]}'),
               (4, '01_Worldview/Mars_Dust_Storms.md', ?, 'Mars_Dust_Storms.md', '.md', 100, 100000, '4444444444444444444444444444444444444444444444444444444444444444', 'world_rule', 'active', 'reviewed', 2, '{"rule_scope":"scoped","bound_entities":["ENT-MARS"]}'),
               (5, '04_Entities/Planets/Terra.md', ?, 'Terra.md', '.md', 100, 100000, '5555555555555555555555555555555555555555555555555555555555555555', 'entity', 'active', 'confirmed', 2, '{"id":"ENT-TERRA"}'),
               (6, '04_Entities/Characters/LinYuan.md', ?, 'LinYuan.md', '.md', 100, 100000, '6666666666666666666666666666666666666666666666666666666666666666', 'entity', 'active', 'reviewed', 1, '{"id":"ENT-LIN"}'),
               (7, '04_Entities/Characters/UnreviewedDraftHero.md', ?, 'UnreviewedDraftHero.md', '.md', 100, 100000, '7777777777777777777777777777777777777777777777777777777777777777', 'entity', 'draft', 'unreviewed', 0, '{"id":"ENT-DRAFT-HERO"}'),
               (8, '04_Entities/Characters/FakeCanonDraft.md', ?, 'FakeCanonDraft.md', '.md', 100, 100000, '8888888888888888888888888888888888888888888888888888888888888888', 'entity', 'draft', 'pending', 2, '{"id":"ENT-FAKE-CANON"}'),
               (9, '04_Entities/Characters/ArchivedOldCanon.md', ?, 'ArchivedOldCanon.md', '.md', 100, 100000, '9999999999999999999999999999999999999999999999999999999999999999', 'entity', 'archived', 'confirmed', 3, '{"id":"ENT-ARCHIVED"}'),
               (10, '04_Entities/Characters/DeprecatedFaction.md', ?, 'DeprecatedFaction.md', '.md', 100, 100000, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'entity', 'deprecated', 'deprecated', 2, '{"id":"ENT-DEPRECATED"}'),
               (11, '04_Entities/Starships/Voyager_Starship.md', ?, 'Voyager_Starship.md', '.md', 100, 100000, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'entity', 'active', 'confirmed', 2, '{"id":"ENT-VOYAGER"}'),
               (12, '03_Chapters/Chapter_01.md', ?, 'Chapter_01.md', '.md', 100, 100000, 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', 'chapter', 'completed', 'approved', 2, '{"chapter_number":1}'),
               (13, '03_Chapters/Chapter_02_Draft.md', ?, 'Chapter_02_Draft.md', '.md', 100, 100000, 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd', 'chapter', 'draft', 'active', 0, '{"chapter_number":2}'),
               (14, '03_Chapters/Chapter_03.md', ?, 'Chapter_03.md', '.md', 100, 100000, 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 'chapter', 'active', 'approved', 2, '{"chapter_number":3}')
      `).run(
        path.join(worldDir, 'Universal_Axioms.md'),
        path.join(worldDir, 'Entropy_Law.md'),
        path.join(worldDir, 'Terra_Atmosphere.md'),
        path.join(worldDir, 'Mars_Dust_Storms.md'),
        path.join(planetDir, 'Terra.md'),
        path.join(charDir, 'LinYuan.md'),
        path.join(charDir, 'UnreviewedDraftHero.md'),
        path.join(charDir, 'FakeCanonDraft.md'),
        path.join(charDir, 'ArchivedOldCanon.md'),
        path.join(charDir, 'DeprecatedFaction.md'),
        path.join(starshipDir, 'Voyager_Starship.md'),
        path.join(chDir, 'Chapter_01.md'),
        path.join(chDir, 'Chapter_02_Draft.md'),
        path.join(chDir, 'Chapter_03.md')
      );

      // 2. Populate entities
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (1, 'ENT-TERRA', '泰拉', 'planet', 'active', 'confirmed', 2, 5),
               (2, 'ENT-LIN', '林远', 'character', 'active', 'reviewed', 1, 6),
               (3, 'ENT-DRAFT-HERO', '未审核草稿英雄', 'character', 'draft', 'unreviewed', 0, 7),
               (4, 'ENT-FAKE-CANON', '虚假正史草稿', 'character', 'draft', 'pending', 2, 8),
               (5, 'ENT-ARCHIVED', '已归档历史设定', 'character', 'archived', 'confirmed', 3, 9),
               (6, 'ENT-DEPRECATED', '废弃派系', 'faction', 'deprecated', 'deprecated', 2, 10),
               (7, 'ENT-VOYAGER', '远征号星舰', 'technology', 'active', 'confirmed', 2, 11)
      `).run();

      // 3. Populate file_entities
      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (5, 1, 'primary_definition'),
               (6, 2, 'primary_definition'),
               (7, 3, 'primary_definition'),
               (8, 4, 'primary_definition'),
               (9, 5, 'primary_definition'),
               (10, 6, 'primary_definition'),
               (11, 7, 'primary_definition')
      `).run();

      // 4. Populate entity_relations
      db.prepare(`
        INSERT INTO entity_relations (id, source_entity_id, target_entity_id, relation_type, weight, confidence, bidirectional, description)
        VALUES (1, 2, 7, 'pilots', 1.0, 1.0, 0, '林远领航远征号')
      `).run();

      // 5. Populate chapters
      db.prepare(`
        INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon, timeline_start, timeline_end, summary)
        VALUES (1, 1, 1, '启航之日', '03_Chapters/Chapter_01.md', 12, 2, 'completed', 1, 100, 200, '启航'),
               (2, 2, 1, '废弃草稿第二章', '03_Chapters/Chapter_02_Draft.md', 13, 2, 'draft', 0, 201, 300, '草稿二'),
               (3, 3, 1, '深空远航', '03_Chapters/Chapter_03.md', 14, 2, 'active', 1, 301, 400, '远航')
      `).run();

      // 6. Populate timeline_events
      db.prepare(`
        INSERT INTO timeline_events (id, event_id, title, relative_time_desc, timestamp_order, primary_entity_id, source_file_id, participant_entity_ids_json, description)
        VALUES (1, 'EVT-004', '远征号首次空间折跃', '2045.08', 350.0, 7, 11, '["ENT-VOYAGER"]', '第3章期间折跃'),
               (2, 'EVT-001', '太阳系形成期宇宙尘埃吸积', '-4500000000.0 BCE', -4500000000.0, 1, 5, '["ENT-TERRA"]', '太古时代'),
               (3, 'EVT-003', '林远入选领航员计划', '2040.05', 120.0, 2, 6, '["ENT-LIN","ENT-VOYAGER"]', '第1章领航员'),
               (4, 'EVT-002', '公元元年历法基准点', '0.00', 0.0, 1, 5, '["ENT-TERRA"]', '纪元起点'),
               (5, 'EVT-005', '微秒级跃迁泡脉冲A', '2045.080001', 350.000001, 7, 11, '["ENT-VOYAGER"]', '超精细时间戳A'),
               (6, 'EVT-006', '微秒级跃迁泡脉冲B', '2045.080002', 350.000002, 7, 11, '["ENT-VOYAGER"]', '超精细时间戳B')
      `).run();

      // 7. Populate foreshadowing
      db.prepare(`
        INSERT INTO foreshadowing (id, foreshadow_id, title, description, setup_chapter_id, introduced_chapter, status, importance_level, related_entities_json)
        VALUES (1, 'FS-ADV-01', '暗物质引擎异响', '引擎舱深处传来周期性谐振', 3, '3', 'open', 'critical', '["ENT-VOYAGER"]')
      `).run();
    } catch (err) {
      console.error('SETUP ERROR IN BEFOREEACH:', err);
      throw err;
    }

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
  // VECTOR 1: Draft Leakage Attack
  // =========================================================================
  describe('Vector 1: Draft Leakage & Policy Isolation Attacks', () => {

    it('ADV-LEAK-01: canon_only policy strictly forbids all unreviewed drafts, draft files, and candidates', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['泰拉', '林远', '未审核草稿英雄', '虚假正史草稿', '已归档历史设定', '废弃派系'],
        sourcePolicy: 'canon_only'
      });

      const { canonSources, candidateSources } = result.snapshot;

      // 1. Terra (L2, active, confirmed) must be present in canonSources
      assert.ok(canonSources.some(c => c.canonicalName === '泰拉'), 'Terra (L2 confirmed) must be in canonSources');

      // 2. Candidate sources MUST be completely empty under canon_only
      assert.equal(candidateSources.length, 0, 'candidateSources MUST be strictly empty under canon_only');

      // 3. Unreviewed draft (L0 draft unreviewed) must NOT leak
      assert.ok(!canonSources.some(c => c.canonicalName === '未审核草稿英雄'), 'Unreviewed draft hero MUST NOT leak into canonSources');

      // 4. Fake canon draft (L2 draft pending) must NOT leak into canonSources because status is draft and review is pending
      assert.ok(!canonSources.some(c => c.canonicalName === '虚假正史草稿'), 'Fake canon draft MUST NOT leak into canonSources');

      // 5. Lin Yuan (L1 reviewed) is candidate, so MUST NOT leak into canon_only
      assert.ok(!canonSources.some(c => c.canonicalName === '林远'), 'Candidate Lin Yuan MUST NOT leak into canon_only canonSources');

      // 6. Archived & Deprecated entities must NOT leak into canonSources
      assert.ok(!canonSources.some(c => c.canonicalName === '已归档历史设定'), 'Archived lore MUST NOT leak into canonSources');
      assert.ok(!canonSources.some(c => c.canonicalName === '废弃派系'), 'Deprecated faction MUST NOT leak into canonSources');
    });

    it('ADV-LEAK-02: canon_and_reviewed default policy strictly excludes unreviewed drafts and draft chapters', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['泰拉', '林远', '未审核草稿英雄', '虚假正史草稿', '已归档历史设定', '废弃派系'],
        sourcePolicy: 'canon_and_reviewed'
      });

      const { canonSources, candidateSources, chapterSources } = result.snapshot;

      // 1. Terra in canonSources (L2 confirmed)
      assert.ok(canonSources.some(c => c.canonicalName === '泰拉'));

      // 2. Lin Yuan in candidateSources (L1 reviewed)
      assert.ok(candidateSources.some(c => c.canonicalName === '林远'));

      // 3. Unreviewed draft hero MUST NOT appear in either canonSources or candidateSources
      assert.ok(!canonSources.some(c => c.canonicalName === '未审核草稿英雄'));
      assert.ok(!candidateSources.some(c => c.canonicalName === '未审核草稿英雄'));

      // 4. Archived / Deprecated records MUST NOT appear in canonSources or candidateSources
      assert.ok(!canonSources.some(c => c.canonicalName === '已归档历史设定'));
      assert.ok(!candidateSources.some(c => c.canonicalName === '已归档历史设定'));
      assert.ok(!canonSources.some(c => c.canonicalName === '废弃派系'));
      assert.ok(!candidateSources.some(c => c.canonicalName === '废弃派系'));

      // 5. Preceding chapters: Chapter 1 (completed, canon=1) must be included, Chapter 2 (draft, canon=0) MUST NOT be included as preceding canon
      const precedingChapters = chapterSources.filter(c => !c.isTargetChapter);
      assert.ok(precedingChapters.some(c => c.chapterNumber === 1), 'Chapter 1 (completed canon) must be present in preceding chapters');
      assert.ok(!precedingChapters.some(c => c.chapterNumber === 2), 'Chapter 2 (draft canon=0) MUST NOT leak into preceding canonical chapters');
    });

    it('ADV-LEAK-03: include_drafts policy allows draft entities into candidateSources but still segregates canonSources', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['泰拉', '未审核草稿英雄'],
        sourcePolicy: 'include_drafts'
      });

      const { canonSources, candidateSources } = result.snapshot;

      // Terra in canon
      assert.ok(canonSources.some(c => c.canonicalName === '泰拉'));
      // Draft hero in candidates, NOT in canonSources
      assert.ok(!canonSources.some(c => c.canonicalName === '未审核草稿英雄'));
      assert.ok(candidateSources.some(c => c.canonicalName === '未审核草稿英雄'));
    });
  });

  // =========================================================================
  // VECTOR 2: Global Rule Bypass Attack
  // =========================================================================
  describe('Vector 2: Global Rule Scoping & Bypass Attacks', () => {

    it('ADV-RULE-01: Global axioms are ALWAYS returned when focusEntities is disjoint or non-existent', () => {
      // Disjoint focus entity
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['ENT-NON-EXISTENT-XYZ-9999']
      });

      const { global, scoped } = result.snapshot.worldRules;

      // Global axioms MUST be present
      assert.ok(global.length >= 2, 'All global axioms must be returned regardless of disjoint focus entity');
      assert.ok(global.some(r => r.canonicalName === 'Universal_Axioms'));
      assert.ok(global.some(r => r.canonicalName === 'Entropy_Law'));

      // Scoped rules MUST be empty because disjoint focus does not match Terra or Mars
      assert.equal(scoped.length, 0, 'Scoped rules must be empty for disjoint focus entity');
    });

    it('ADV-RULE-02: Global axioms are ALWAYS returned when focusEntities is empty array or empty string', () => {
      const emptyArrayRes = engine.buildSnapshot({ chapterNumber: 1, focusEntities: [] });
      assert.ok(emptyArrayRes.snapshot.worldRules.global.length >= 2);

      const emptyStringRes = engine.buildSnapshot({ chapterNumber: 1, focusEntities: '   ' });
      assert.ok(emptyStringRes.snapshot.worldRules.global.length >= 2);
    });

    it('ADV-RULE-03: Scoped rules are strictly isolated to bound entities matching focusEntities', () => {
      // Focus strictly on Mars -> should include Mars_Dust_Storms, exclude Terra_Atmosphere
      const marsResult = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['ENT-MARS']
      });

      const { scoped } = marsResult.snapshot.worldRules;
      assert.ok(scoped.some(r => r.canonicalName === 'Mars_Dust_Storms'), 'Mars scoped rule must be included for ENT-MARS');
      assert.ok(!scoped.some(r => r.canonicalName === 'Terra_Atmosphere'), 'Terra scoped rule must NOT leak into ENT-MARS context');
    });

    it('ADV-RULE-04: RuleClassifier evaluates multi-tier heuristics deterministically', () => {
      // Tier 1: Explicit Frontmatter
      assert.equal(RuleClassifier.classify({ frontmatter_json: '{"rule_scope":"global"}' }).isGlobal, true);
      assert.equal(RuleClassifier.classify({ frontmatter_json: '{"global":true}' }).isGlobal, true);
      assert.equal(RuleClassifier.classify({ frontmatter_json: '{"rule_scope":"scoped"}' }).isGlobal, false);
      assert.equal(RuleClassifier.classify({ frontmatter_json: '{"scope":"local"}' }).isGlobal, false);

      // Tier 2: Universal Category with no bound entities vs bound entities
      assert.equal(RuleClassifier.classify({ source_category: 'world_rule', frontmatter_json: '{}' }).isGlobal, true);
      assert.equal(RuleClassifier.classify({ source_category: 'cosmology', frontmatter_json: '{}' }).isGlobal, true);
      assert.equal(RuleClassifier.classify({ source_category: 'world_rule', frontmatter_json: '{"bound_entities":["E1"]}' }).isGlobal, false);

      // Tier 3: Canon Level >= 3
      assert.equal(RuleClassifier.classify({ canon_level: 3 }).isGlobal, true);

      // Tier 4: Vault Path Hierarchy
      assert.equal(RuleClassifier.classify({ relative_path: '01_Worldview/01_Core_Axioms.md' }).isGlobal, true);
      assert.equal(RuleClassifier.classify({ relative_path: '01_Worldview/Planets/Local_Climate.md' }).isGlobal, false);

      // Tier 5: Title Heuristics
      assert.equal(RuleClassifier.classify({ title: '宇宙公理: 强相互作用力恒定' }).isGlobal, true);
      assert.equal(RuleClassifier.classify({ title: '基础物理法则: 质能守恒' }).isGlobal, true);
    });
  });

  // =========================================================================
  // VECTOR 3: Timeline Chronological Integrity
  // =========================================================================
  describe('Vector 3: Timeline Chronological Integrity & Multi-Channel Collision', () => {

    it('ADV-TIME-01: Recalled timeline events from all channels are strictly monotonically non-decreasing in timestamp_order', () => {
      // Focus on Terra, Lin Yuan, Voyager Starship + Chapter 3 window
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['泰拉', '林远', '远征号星舰'],
        includeTimeline: true
      });

      const { timelineEvents } = result.snapshot;
      assert.ok(timelineEvents.length >= 5, 'Should recall multiple events across BCE epoch, CE, and microsecond timestamps');

      // Verify strict monotonic non-decreasing order:
      for (let i = 1; i < timelineEvents.length; i++) {
        const prev = timelineEvents[i - 1];
        const curr = timelineEvents[i];
        assert.ok(
          curr.timestampOrder >= prev.timestampOrder,
          `Chronological inversion detected: Event [${prev.eventId}] (order: ${prev.timestampOrder}) occurred after Event [${curr.eventId}] (order: ${curr.timestampOrder})`
        );
      }

      // Verify ancient BCE timestamp is first
      assert.equal(timelineEvents[0].eventId, 'EVT-001', 'Ancient BCE event (-4.5B) must appear first');
      assert.equal(timelineEvents[0].timestampOrder, -4500000000.0);

      // Verify zero timestamp is second
      assert.equal(timelineEvents[1].eventId, 'EVT-002', 'Zero timestamp event must appear after BCE');
      assert.equal(timelineEvents[1].timestampOrder, 0.0);
    });

    it('ADV-TIME-02: Microsecond floating point precision ordering is preserved', () => {
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['远征号星舰'],
        includeTimeline: true
      });

      const { timelineEvents } = result.snapshot;
      const pulseA = timelineEvents.find(t => t.eventId === 'EVT-005');
      const pulseB = timelineEvents.find(t => t.eventId === 'EVT-006');

      assert.ok(pulseA && pulseB, 'Both microsecond pulses must be recalled');
      const idxA = timelineEvents.indexOf(pulseA);
      const idxB = timelineEvents.indexOf(pulseB);
      assert.ok(idxA < idxB, 'Pulse A (order: 350.000001) must strictly precede Pulse B (order: 350.000002)');
    });

    it('ADV-TIME-03: Multi-channel collision deduplication invariant', () => {
      // EVT-003 matches:
      // - Channel 1 (primary_entity_id: 2 Lin Yuan)
      // - Channel 2 (source_file_id: 6 LinYuan.md)
      // - Channel 3 (1-degree relation with Voyager)
      // - Channel 4 (participant_entity_ids_json: ["ENT-LIN","ENT-VOYAGER"])
      // It must appear EXACTLY ONCE in timelineEvents
      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['林远', '远征号星舰'],
        includeTimeline: true
      });

      const { timelineEvents } = result.snapshot;
      const countEVT003 = timelineEvents.filter(t => t.eventId === 'EVT-003').length;
      assert.equal(countEVT003, 1, 'Multi-channel matched event EVT-003 must be deduplicated to exactly 1 occurrence');
    });
  });

  // =========================================================================
  // VECTOR 4: Sandbox Escape and Injection Attack
  // =========================================================================
  describe('Vector 4: Sandbox Escape and Path Injection Attacks', () => {

    it('ADV-SEC-01: Path traversal in chapterId does not escape sandbox or crash engine', async () => {
      const maliciousChapterIds = [
        '../../../../../../Windows/System32/drivers/etc/hosts',
        '..\\..\\01_Worldview\\secret.md',
        '/etc/passwd',
        '%2e%2e%2f%2e%2e%2f',
        '\\\\192.168.1.100\\share\\draft.md',
        'CON.md',
        'chapter.md:hidden_stream'
      ];

      for (const badChapterId of maliciousChapterIds) {
        // Must handle gracefully without crashing or throwing unhandled exception
        const result = engine.buildSnapshot({
          chapterId: badChapterId,
          focusEntities: ['泰拉']
        });

        assert.ok(result, `Engine should return snapshot object for malicious chapterId: ${badChapterId}`);
        assert.equal(result.metadata.chapter, null, `Malicious path should not resolve to valid chapter: ${badChapterId}`);
        // Global axioms must still function safely
        assert.ok(result.snapshot.worldRules.global.length >= 1);
      }
    });

    it('ADV-SEC-02: Path traversal in focusEntities does not breach sandbox boundaries', () => {
      const maliciousFocus = [
        '../../01_Worldview/Universal_Axioms.md',
        '../../../etc/passwd',
        '\\\\evil\\share'
      ];

      const result = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: maliciousFocus
      });

      assert.ok(result);
      assert.ok(result.snapshot.worldRules.global.length >= 1);
    });

    it('ADV-SEC-03: CommandDispatcher dispatches GetChapterContext safely under adversarial input', async () => {
      const response = await dispatcher.dispatch('GetChapterContext', {
        chapterId: '../../etc/passwd',
        focusEntities: ['../../../secret', '泰拉'],
        sourcePolicy: 'canon_and_reviewed'
      });

      assert.equal(response.status, 'success');
      assert.ok(response.snapshot);
      assert.ok(response.snapshot.worldRules.global.length >= 1);
      assert.ok(response.assembledContext);
    });
  });

  // =========================================================================
  // VECTOR 5: Token Budget & Character Budget Overflow Stress
  // =========================================================================
  describe('Vector 5: Token Budget Overflow Stress', () => {

    it('ADV-TOKEN-01: maxTokens strictly truncates assembledContext while keeping structured buckets intact', () => {
      const maxTokens = 40; // 40 tokens ~ 120 characters budget
      const result = engine.buildSnapshot({
        chapterNumber: 3,
        focusEntities: ['泰拉', '远征号星舰'],
        maxTokens
      });

      const maxExpectedChars = (maxTokens * 3) + 100; // Allow truncation notice buffer
      assert.ok(
        result.assembledContext.length <= maxExpectedChars,
        `assembledContext length (${result.assembledContext.length}) exceeded expected budget limit (${maxExpectedChars})`
      );
      assert.ok(result.assembledContext.includes('Context truncated due to maxTokens budget limit'));

      // Structured buckets must remain fully intact and untruncated
      assert.ok(result.snapshot.worldRules.global.length >= 2);
      assert.ok(result.snapshot.canonSources.length >= 2);
      assert.ok(result.snapshot.timelineEvents.length >= 1);
      assert.ok(result.snapshot.unresolved.length >= 1);
    });
  });
});
