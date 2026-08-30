/**
 * @file contextSnapshot_m2.test.js
 * @description Unit tests for Milestone 2 (F5, F6): Structured 6-Category Context Snapshot with SHA-256 Hash Tracking Stamps
 * @module test/unit/contextSnapshot_m2
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

describe('Milestone 2: 6-Category Context Snapshot Suite (R2)', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(async () => {
    tempEnv = createTempDir('vcp_snapshot_test_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    const worldDir = path.join(vaultDir, '01_Worldview');
    const planetDir = path.join(vaultDir, '02_Entities', 'Planets');
    const charDir = path.join(vaultDir, '02_Entities', 'Characters');
    const chDir = path.join(vaultDir, '03_Chapters', 'Vol01');
    const fsDir = path.join(vaultDir, '05_Foreshadowing');

    fs.mkdirSync(worldDir, { recursive: true });
    fs.mkdirSync(planetDir, { recursive: true });
    fs.mkdirSync(charDir, { recursive: true });
    fs.mkdirSync(chDir, { recursive: true });
    fs.mkdirSync(fsDir, { recursive: true });

    // 1. World rule
    fs.writeFileSync(
      path.join(worldDir, 'Cosmology_Axioms.md'),
      '---\ncategory: worldview_setting\nstatus: canonical\nreview_status: confirmed\n---\n# 宇宙常数\n光速为每秒三十万公里。',
      'utf8'
    );

    // 2. Canonical entity
    fs.writeFileSync(
      path.join(planetDir, 'Terra_PL001.md'),
      '---\nid: PL-001\nname: 泰拉\ncategory: planet\nstatus: canonical\nreview_status: confirmed\naliases: ["母星"]\n---\n# 泰拉\n母星设定。',
      'utf8'
    );

    // 3. Candidate / Draft entity
    fs.writeFileSync(
      path.join(charDir, 'Candidate_Spy.md'),
      '---\nid: CHAR-099\nname: 潜伏者X\ncategory: character\nstatus: draft\nreview_status: pending_review\n---\n# 潜伏者X\n可能的双面间谍候选设定。',
      'utf8'
    );

    // 4. Conflicted entity
    fs.writeFileSync(
      path.join(planetDir, 'Mars_Conflict.md'),
      '---\nid: PL-002\nname: 火星前哨\ncategory: planet\nstatus: conflict\nreview_status: conflicted\n---\n# 火星前哨\n冲突设定：已被摧毁 vs 正在繁荣运转。',
      'utf8'
    );

    // 5. Chapter
    fs.writeFileSync(
      path.join(chDir, 'Chapter01_Launch.md'),
      '---\nchapter_number: 1\nvolume_number: 1\ntitle: 启航\nstatus: completed\n---\n# 第一章 启航\n启航正文。',
      'utf8'
    );

    // 6. Foreshadowing
    fs.writeFileSync(
      path.join(fsDir, 'FS001_HiddenKey.md'),
      '---\nid: FS-001\ntitle: 第三货舱的密封箱\nstatus: open\nimportance_level: critical\n---\n第三货舱隐藏的古老遗物。',
      'utf8'
    );

    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });
    const dbPath = path.join(pluginDir, 'data', 'test.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    await IncrementalIndexer.sync(vaultDir, dbManager);

    // Insert an explicit anomaly to verify conflict detection
    dbManager.anomalies.insert({
      anomaly_code: 'ANOM_001',
      title: '同名不同ID异常',
      severity: 'warning',
      message: '火星存在双重定义冲突',
      source_file_id: 1,
      involved_entities_json: JSON.stringify(['PL-002', '火星前哨'])
    });

    dispatcher = new CommandDispatcher({
      basePath: pluginDir,
      dbPath,
      dbManager,
      pathGuard
    });
  });

  afterEach(() => {
    if (dbManager) dbManager.close();
    if (tempEnv) tempEnv.cleanup();
  });

  it('M2-CTX-01: should return strictly structured 6 categories in snapshot object', async () => {
    const res = await dispatcher.dispatch('GetChapterContext', {
      chapterId: '1',
      focusEntities: ['泰拉', '潜伏者X', '火星前哨'],
      includeWorldRules: true
    });

    assert.ok(res, 'Result must exist');
    const details = res.details;
    assert.ok(details.snapshot, 'details.snapshot must exist');

    const { worldRules, canonSources, chapterSources, candidateSources, conflicts, unresolved } = details.snapshot;

    assert.ok(Array.isArray(worldRules), 'worldRules must be an array');
    assert.ok(Array.isArray(canonSources), 'canonSources must be an array');
    assert.ok(Array.isArray(chapterSources), 'chapterSources must be an array');
    assert.ok(Array.isArray(candidateSources), 'candidateSources must be an array');
    assert.ok(Array.isArray(conflicts), 'conflicts must be an array');
    assert.ok(Array.isArray(unresolved), 'unresolved must be an array');

    assert.ok(worldRules.length >= 1, 'worldRules should contain Cosmology Axioms');
    assert.ok(canonSources.length >= 1, 'canonSources should contain Terra PL-001');
    assert.ok(candidateSources.length >= 1, 'candidateSources should contain Candidate Spy');
    assert.ok(conflicts.length >= 1, 'conflicts should contain Mars conflict and/or anomaly');
    assert.ok(unresolved.length >= 1, 'unresolved should contain FS-001');
    assert.ok(chapterSources.length >= 1, 'chapterSources should contain Chapter 1');
  });

  it('M2-CTX-02: should attach 64-char SHA-256 hashTrackingStamp and sourceFilePath to every entry in all 6 categories', async () => {
    const res = await dispatcher.dispatch('GetChapterContext', {
      chapterId: '1',
      focusEntities: ['泰拉', '潜伏者X', '火星前哨'],
      includeWorldRules: true
    });

    const categories = ['worldRules', 'canonSources', 'chapterSources', 'candidateSources', 'conflicts', 'unresolved'];
    const snapshot = res.details.snapshot;

    for (const cat of categories) {
      const items = snapshot[cat];
      assert.ok(items.length > 0, `Category ${cat} must contain at least one item`);

      for (const item of items) {
        assert.ok(item.sourceFilePath, `${cat} item must contain sourceFilePath`);
        assert.ok(typeof item.sourceFilePath === 'string', `${cat} sourceFilePath must be string`);
        assert.ok(item.status, `${cat} item must contain status`);
        assert.ok(item.reviewStatus, `${cat} item must contain reviewStatus`);

        const hash = item.hashTrackingStamp;
        assert.ok(hash, `${cat} item must contain hashTrackingStamp`);
        assert.equal(typeof hash, 'string', `${cat} hashTrackingStamp must be string`);
        assert.equal(hash.length, 64, `${cat} hashTrackingStamp must be 64-char hex string`);
        assert.ok(/^[0-9a-f]{64}$/i.test(hash), `${cat} hashTrackingStamp must match hex format`);
      }
    }
  });

  it('M2-CTX-03: should segregate confirmed canon lore from candidate/draft proposals', async () => {
    const res = await dispatcher.dispatch('GetChapterContext', {
      chapterId: '1',
      focusEntities: ['泰拉', '潜伏者X'],
      includeWorldRules: true
    });

    const { canonSources, candidateSources } = res.details.snapshot;

    // Terra is confirmed -> in canonSources, not candidateSources
    assert.ok(canonSources.some(e => e.canonicalName === '泰拉'));
    assert.ok(!candidateSources.some(e => e.canonicalName === '泰拉'));

    // Spy is draft -> in candidateSources, not canonSources
    assert.ok(candidateSources.some(e => e.canonicalName === '潜伏者X'));
    assert.ok(!canonSources.some(e => e.canonicalName === '潜伏者X'));
  });

  it('M2-CTX-04: should capture conflicts without suppression or discarding', async () => {
    const res = await dispatcher.dispatch('GetChapterContext', {
      chapterId: '1',
      focusEntities: ['火星前哨'],
      includeWorldRules: true
    });

    const { conflicts } = res.details.snapshot;
    assert.ok(conflicts.length >= 1, 'Conflicts must contain conflict warnings');
    assert.ok(
      conflicts.some(c => (c.title && c.title.includes('火星')) || (c.message && c.message.includes('火星')) || c.anomalyCode === 'ANOM_001'),
      'Conflict array must contain Mars conflict details'
    );
  });
});
