/**
 * @file manageTimeline.test.js
 * @description Comprehensive unit test suite for ManageTimeline command and chronological event tracking
 * @module test/unit/manageTimeline
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

describe('ManageTimeline: Chronological Event Tracking & Query Suite', () => {
  let tempEnv = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_tl_test_');
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

  // =========================================================================
  // Tier 1: Core Operations (add, query) Happy Path
  // =========================================================================
  describe('Tier 1: Core Operations Happy Path', () => {

    it('F5-T1.1: should successfully add a timeline event and return confirmation with event ID', async () => {
      const payload = {
        action: 'add',
        event_name: '太阳系联合防线建立',
        time_point: 2042.0815,
        era_epoch: '新历',
        relative_time_desc: '大流浪纪元前夕',
        description: '人类在木星轨道建立了第一道小行星防御拦截矩阵。',
        involved_entities: ['泰拉', '联合防卫军']
      };

      const res = await dispatcher.dispatch('ManageTimeline', payload);
      assert.ok(res, 'Must return response');
      const details = res.details || res;

      assert.equal(details.status || details.actionStatus, 'success', 'Action status must be success');
      const event = details.event || details.item || details;
      assert.equal(event.title || event.event_name, '太阳系联合防线建立');
      assert.equal(Number(event.timestamp_order || event.time_point), 2042.0815);

      // Verify in SQLite directly
      const dbEvents = dbManager.timeline.query({ query: '联合防线' });
      assert.equal(dbEvents.length, 1);
      assert.equal(dbEvents[0].title, '太阳系联合防线建立');
      assert.equal(dbEvents[0].era_epoch, '新历');
    });

    it('F5-T1.2: should query timeline events returning records in chronological ascending order', async () => {
      // Insert events out of chronological order
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '第三次深空战役',
        time_point: 2200,
        era_epoch: '流浪纪元'
      });

      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '第一次超光速跃迁',
        time_point: 2050,
        era_epoch: '流浪纪元'
      });

      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '行星发动机试车',
        time_point: 2040,
        era_epoch: '旧历'
      });

      const res = await dispatcher.dispatch('ManageTimeline', { action: 'query' });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.equal(events.length, 3, 'Must return all 3 events');

      // Verify strict chronological ascending order
      const orders = events.map(e => Number(e.timestamp_order || e.time_point));
      assert.deepEqual(orders, [2040, 2050, 2200], 'Events must be strictly sorted by timestamp_order ascending');
    });

    it('F5-T1.3: should filter timeline events by era_epoch', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '旧时代大浩劫',
        time_point: 1999,
        era_epoch: '旧历'
      });

      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '新历启航日',
        time_point: 2100,
        era_epoch: '新历'
      });

      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        era_epoch: '新历'
      });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.equal(events.length, 1);
      assert.equal(events[0].title || events[0].event_name, '新历启航日');
    });

    it('F5-T1.4: should filter timeline events by timestamp range (min_order and max_order)', async () => {
      for (let y = 2000; y <= 2050; y += 10) {
        await dispatcher.dispatch('ManageTimeline', {
          action: 'add',
          event_name: `编年史事件 ${y}`,
          time_point: y
        });
      }

      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        min_order: 2010,
        max_order: 2030
      });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.equal(events.length, 3, 'Should match 2010, 2020, 2030');
      const years = events.map(e => Number(e.timestamp_order || e.time_point));
      assert.deepEqual(years, [2010, 2020, 2030]);
    });

    it('F5-T1.5: should filter timeline events by involved entities', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '林远授勋仪式',
        time_point: 2045,
        involved_entities: ['林远', '联合舰队']
      });

      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '阿尔法星矿区建设',
        time_point: 2046,
        involved_entities: ['阿尔法星']
      });

      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        involved_entities: '林远'
      });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.ok(events.length >= 1);
      assert.ok(events.some(e => (e.title || e.event_name).includes('林远')));
    });
  });

  // =========================================================================
  // Tier 2: Validation, Boundary & Error Handling
  // =========================================================================
  describe('Tier 2: Parameter Validation & Error Handling', () => {

    it('F5-T2.1: should reject invocation with missing or invalid action', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageTimeline', {});
        },
        /action|required|invalid/i
      );

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageTimeline', { action: 'delete_universe' });
        },
        /unsupported|unknown|invalid action/i
      );
    });

    it('F5-T2.2: should reject add action when event_name or time_point is missing', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageTimeline', {
            action: 'add',
            time_point: 2042
          });
        },
        /event_name|title|required/i
      );

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageTimeline', {
            action: 'add',
            event_name: 'Missing Time'
          });
        },
        /time_point|timestamp_order|required/i
      );
    });

    it('F5-T2.3: should search events by keyword query in query action', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '空间引力透镜失控',
        time_point: 2088,
        description: '黑洞观测站发生重力偏转异常。'
      });

      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        query: '引力透镜'
      });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.equal(events.length, 1);
      assert.equal(events[0].title || events[0].event_name, '空间引力透镜失控');
    });

    it('F5-T2.4: should support decimal and negative timestamp ordering (BCE/pre-history)', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '前古神迹纪元',
        time_point: -5000,
        era_epoch: '史前'
      });

      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '精确测试事件',
        time_point: 2042.081512
      });

      const res = await dispatcher.dispatch('ManageTimeline', { action: 'query' });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.ok(events.length >= 2);
      assert.equal(Number(events[0].timestamp_order || events[0].time_point), -5000, 'Negative timestamp must sort earliest');
    });

    it('F5-T2.5: should support limit and offset pagination in query action', async () => {
      for (let i = 1; i <= 6; i++) {
        await dispatcher.dispatch('ManageTimeline', {
          action: 'add',
          event_name: `分页纪元事件 ${i}`,
          time_point: 2000 + i
        });
      }

      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        limit: 3,
        offset: 0
      });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.equal(events.length, 3, 'Must respect limit=3');
    });
  });

  // =========================================================================
  // Tier 3 & Tier 4: Chronicle Stress Ordering
  // =========================================================================
  describe('Tier 3 & 4: Chronicle Ordering Stress Test', () => {

    it('F5-T4.1: should maintain strict chronological order across 20 events added in random order', async () => {
      const timestamps = [
        2055, 2012, 2099, 2001, 2042, 2033, 2088, 2005, 2077, 2020,
        2066, 2018, 2095, 2008, 2049, 2030, 2082, 2015, 2070, 2025
      ];

      for (let i = 0; i < timestamps.length; i++) {
        await dispatcher.dispatch('ManageTimeline', {
          action: 'add',
          event_name: `大纪元里程碑-${timestamps[i]}`,
          time_point: timestamps[i],
          era_epoch: timestamps[i] < 2050 ? '第一纪元' : '第二纪元'
        });
      }

      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        limit: 50
      });
      const details = res.details || res;
      const events = details.events || details.items || details.timeline || [];

      assert.equal(events.length, 20, 'All 20 events must be returned');

      const expectedSorted = [...timestamps].sort((a, b) => a - b);
      const actualSorted = events.map(e => Number(e.timestamp_order || e.time_point));

      assert.deepEqual(actualSorted, expectedSorted, 'Events must be strictly sorted ascending');
    });
  });
});
