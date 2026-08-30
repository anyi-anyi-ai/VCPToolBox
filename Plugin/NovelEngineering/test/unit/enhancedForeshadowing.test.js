/**
 * @file enhancedForeshadowing.test.js
 * @description Comprehensive unit test suite for enhanced foreshadowing lifecycle tracking
 * @module test/unit/enhancedForeshadowing
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { createTempDir } = require('../helpers/tempDir');

describe('Enhanced Foreshadowing Lifecycle Tracking Suite', () => {
  let tempEnv = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_fs_enh_test_');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({ pluginRoot: pluginDir });
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

  it('M1-FS-01: should add a foreshadowing thread with all 4 lifecycle fields and related entities', async () => {
    const res = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-BLACK-BOX',
      title: '黑匣子里的古老日志',
      description: '主角在坠毁飞船残骸中发现了一个带有帝国绝密印章的黑匣子。',
      importance_level: 'major',
      introduced_chapter: '12',
      target_resolve_chapter: '45',
      related_entities: ['林恩', '塔兰托帝国', '先驱者学会'],
      tags: ['主线', '古科技']
    });

    assert.equal(res.status, 'success');
    const clue = res.details.foreshadowing || res.details.item;
    assert.equal(clue.foreshadow_id, 'FS-BLACK-BOX');
    assert.equal(clue.introduced_chapter, 12);
    assert.equal(clue.target_resolve_chapter, 45);
    assert.equal(clue.status, 'open');
    assert.deepEqual(clue.related_entities, ['林恩', '塔兰托帝国', '先驱者学会']);
  });

  it('M1-FS-02: should resolve a foreshadowing thread with actual resolve chapter and resolution notes', async () => {
    // 1. Add Clue
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-POISON-DAGGER',
      title: '淬毒匕首',
      description: '刺客遗落的匕首上刻有十字徽记。',
      introduced_chapter: '5',
      target_resolve_chapter: '20'
    });

    // 2. Resolve Clue
    const res = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'resolve',
      thread_key: 'FS-POISON-DAGGER',
      actual_resolve_chapter: '18',
      resolution_notes: '在第18章审判庭对质中，主教认领了该匕首并交代了主使人。'
    });

    assert.equal(res.status, 'success');
    const resolved = res.details.foreshadowing || res.details.item;
    assert.equal(resolved.status, 'closed');
    assert.equal(resolved.actual_resolve_chapter, 18);
    assert.ok(resolved.resolution_notes.includes('审判庭对质'));
  });

  it('M1-FS-03: should filter foreshadowing by introduced_chapter and target_resolve_chapter', async () => {
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-01',
      title: '线索1',
      description: '描述1',
      introduced_chapter: '10',
      target_resolve_chapter: '30'
    });

    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-02',
      title: '线索2',
      description: '描述2',
      introduced_chapter: '10',
      target_resolve_chapter: '50'
    });

    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-03',
      title: '线索3',
      description: '描述3',
      introduced_chapter: '25',
      target_resolve_chapter: '30'
    });

    // Query introduced at chapter 10
    const resIntro = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'list',
      introduced_chapter: '10'
    });
    assert.equal(resIntro.details.items.length, 2);

    // Query target resolve at chapter 30
    const resTarget = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'list',
      target_resolve_chapter: '30'
    });
    assert.equal(resTarget.details.items.length, 2);
  });

  it('M1-FS-04: should query foreshadowing threads related to a specific entity', async () => {
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-REL-1',
      title: '关于泰拉的预言',
      description: '预言石板。',
      related_entities: ['泰拉', '神庙']
    });

    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-REL-2',
      title: '关于火星的密令',
      description: '军团调令。',
      related_entities: ['火星', '执政官']
    });

    const res = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'list',
      related_entity: '泰拉'
    });

    assert.equal(res.details.items.length, 1);
    assert.equal(res.details.items[0].foreshadow_id, 'FS-REL-1');
  });

  it('M1-FS-05: should query active (open) foreshadowing threads active at a specific chapter', async () => {
    // Thread 1: introduced chapter 5 (Active at chapter 15)
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-ACTIVE-1',
      title: '早期伏笔',
      description: '线索',
      introduced_chapter: '5'
    });

    // Thread 2: introduced chapter 25 (NOT active at chapter 15)
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-ACTIVE-2',
      title: '后期伏笔',
      description: '线索',
      introduced_chapter: '25'
    });

    // Thread 3: introduced chapter 2, resolved at chapter 10 (Closed - NOT active at chapter 15)
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'add',
      thread_key: 'FS-CLOSED-3',
      title: '已完结伏笔',
      description: '线索',
      introduced_chapter: '2'
    });
    await dispatcher.dispatch('ManageForeshadowing', {
      action: 'resolve',
      thread_key: 'FS-CLOSED-3',
      actual_resolve_chapter: '10'
    });

    const res = await dispatcher.dispatch('ManageForeshadowing', {
      action: 'list',
      active_at_chapter: 15
    });

    assert.equal(res.details.items.length, 1);
    assert.equal(res.details.items[0].foreshadow_id, 'FS-ACTIVE-1');
  });
});
