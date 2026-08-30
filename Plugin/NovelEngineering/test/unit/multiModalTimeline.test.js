/**
 * @file multiModalTimeline.test.js
 * @description Comprehensive unit test suite for multi-modal timeline data model (exact, interval, relative, fuzzy)
 * @module test/unit/multiModalTimeline
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

describe('Multi-Modal Timeline Engine Suite', () => {
  let tempEnv = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_mm_tl_test_');
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

  it('M1-TL-01: should insert and query exact scalar time points', async () => {
    const res = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '太阳系防线建立',
      time_point: 2042,
      era_epoch: '新历'
    });

    assert.equal(res.status, 'success');
    const event = res.details.event;
    assert.equal(event.time_type, 'exact');
    assert.equal(event.timestamp_order, 2042);
    assert.equal(event.timeline_year, 2042);

    const queryRes = await dispatcher.dispatch('ManageTimeline', {
      action: 'query',
      time_type: 'exact'
    });
    assert.equal(queryRes.details.events.length, 1);
    assert.equal(queryRes.details.events[0].title, '太阳系防线建立');
  });

  it('M1-TL-02: should insert and query interval time points', async () => {
    const res = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '第一次星际停火谈判',
      time_type: 'interval',
      interval_start: 2045,
      interval_end: 2048,
      era_epoch: '新历'
    });

    assert.equal(res.status, 'success');
    const event = res.details.event;
    assert.equal(event.time_type, 'interval');
    assert.equal(event.interval_start, 2045);
    assert.equal(event.interval_end, 2048);
    assert.equal(event.timestamp_order, 2045);

    // Verify structured time_point object hydration
    assert.deepEqual(event.time_point, {
      type: 'interval',
      start: 2045,
      end: 2048
    });
  });

  it('M1-TL-03: should insert relative time points linked to base events and calculate chronological order', async () => {
    // 1. Base Event
    const baseRes = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_id: 'EV-BASE-001',
      event_name: '天门堡垒陷落',
      time_point: 2050,
      era_epoch: '新历'
    });
    assert.equal(baseRes.status, 'success');

    // 2. Relative Event (+3 years)
    const relRes = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '远征军反攻战役',
      time_type: 'relative',
      base_event_id: 'EV-BASE-001',
      relative_offset: 3,
      era_epoch: '新历'
    });

    assert.equal(relRes.status, 'success');
    const relEvent = relRes.details.event;
    assert.equal(relEvent.time_type, 'relative');
    assert.equal(relEvent.base_event_id, 'EV-BASE-001');
    assert.equal(relEvent.timestamp_order, 2053, 'Timestamp order should automatically resolve to 2050 + 3 = 2053');
  });

  it('M1-TL-04: should support object-shaped relative time_point with string offsets', async () => {
    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_id: 'EV-CORONATION',
      event_name: '新皇登基',
      time_point: 3000
    });

    const res = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '三年大赦',
      time_point: {
        type: 'relative',
        base_event: 'EV-CORONATION',
        offset: '+3'
      }
    });

    assert.equal(res.status, 'success');
    const ev = res.details.event;
    assert.equal(ev.time_type, 'relative');
    assert.equal(ev.timestamp_order, 3003);
  });

  it('M1-TL-05: should insert and query fuzzy time points preserving descriptive text', async () => {
    const res = await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '远古先驱者遗迹初现',
      time_type: 'fuzzy',
      fuzzy_time_desc: '大流浪纪元初期（约公元前500年）',
      era_epoch: '神话'
    });

    assert.equal(res.status, 'success');
    const ev = res.details.event;
    assert.equal(ev.time_type, 'fuzzy');
    assert.equal(ev.fuzzy_time_desc, '大流浪纪元初期（约公元前500年）');
    assert.equal(ev.timestamp_order, -500);

    // Hydration check
    assert.equal(typeof ev.time_point, 'object');
    assert.equal(ev.time_point.type, 'fuzzy');
  });

  it('M1-TL-06: should query interval overlaps accurately', async () => {
    // Event A: 2030 - 2040
    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '第一次接触战争',
      time_type: 'interval',
      interval_start: 2030,
      interval_end: 2040
    });

    // Event B: 2035 - 2045
    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '边境封锁时期',
      time_type: 'interval',
      interval_start: 2035,
      interval_end: 2045
    });

    // Event C: 2050 - 2060
    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '和平重建期',
      time_type: 'interval',
      interval_start: 2050,
      interval_end: 2060
    });

    // Query overlap [2038, 2042] -> Matches Event A and Event B, but not Event C
    const overlapRes = await dispatcher.dispatch('ManageTimeline', {
      action: 'query',
      interval_overlap_start: 2038,
      interval_overlap_end: 2042
    });

    assert.equal(overlapRes.details.events.length, 2);
    const titles = overlapRes.details.events.map((e) => e.title);
    assert.ok(titles.includes('第一次接触战争'));
    assert.ok(titles.includes('边境封锁时期'));
    assert.ok(!titles.includes('和平重建期'));
  });

  it('M1-TL-07: should query relative events anchored to a specific base event', async () => {
    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_id: 'EV-CORE',
      event_name: '核心引爆',
      time_point: 1000
    });

    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '冲击波抵达第一行星',
      time_type: 'relative',
      base_event_id: 'EV-CORE',
      relative_offset: 1
    });

    await dispatcher.dispatch('ManageTimeline', {
      action: 'add',
      event_name: '冲击波抵达第二行星',
      time_type: 'relative',
      base_event_id: 'EV-CORE',
      relative_offset: 2
    });

    const res = await dispatcher.dispatch('ManageTimeline', {
      action: 'query',
      base_event_id: 'EV-CORE'
    });

    assert.equal(res.details.events.length, 2);
  });
});
