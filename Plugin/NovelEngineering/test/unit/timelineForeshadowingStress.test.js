/**
 * @file timelineForeshadowingStress.test.js
 * @description Adversarial Stress & Edge-Case Test Harness for Multi-Modal Timeline (F3) and Enhanced Foreshadowing (F4)
 * Authored by Challenger 2 (Milestone 1)
 * @module test/unit/timelineForeshadowingStress
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

describe('Challenger 2: Timeline & Foreshadowing Adversarial Stress Harness', () => {
  let tempEnv = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_c2_stress_');
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

  // ==========================================================================
  // Vector 1: Chained Relative Timeline Events & Dependency Resolution
  // ==========================================================================
  describe('Vector 1: Chained Relative Events & Circular Relative Dependencies', () => {

    it('V1.1: should resolve deep 5-hop relative chain (A -> B -> C -> D -> E) with mixed offsets', async () => {
      // 1. Root event A (exact: 1000)
      const resA = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CHAIN-A',
        event_name: '纪元创立',
        time_point: 1000
      });
      assert.equal(resA.details.event.timestamp_order, 1000);

      // 2. Event B relative to A (+50 -> 1050)
      const resB = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CHAIN-B',
        event_name: '第一次东征',
        time_type: 'relative',
        base_event_id: 'EV-CHAIN-A',
        relative_offset: 50
      });
      assert.equal(resB.details.event.timestamp_order, 1050);

      // 3. Event C relative to B (-20 -> 1030)
      const resC = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CHAIN-C',
        event_name: '先锋军遇伏',
        time_type: 'relative',
        base_event_id: 'EV-CHAIN-B',
        relative_offset: -20
      });
      assert.equal(resC.details.event.timestamp_order, 1030);

      // 4. Event D relative to C (+100.5 -> 1130.5)
      const resD = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CHAIN-D',
        event_name: '援军抵达',
        time_type: 'relative',
        base_event_id: 'EV-CHAIN-C',
        relative_offset: 100.5
      });
      assert.equal(resD.details.event.timestamp_order, 1130.5);

      // 5. Event E relative to D (0 offset -> 1130.5)
      const resE = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CHAIN-E',
        event_name: '决战爆发',
        time_type: 'relative',
        base_event_id: 'EV-CHAIN-D',
        relative_offset: 0
      });
      assert.equal(resE.details.event.timestamp_order, 1130.5);

      // Query chronological ordering
      const queryRes = await dispatcher.dispatch('ManageTimeline', { action: 'query' });
      const events = queryRes.details.events;
      const order = events.map(e => e.event_id);
      assert.deepEqual(order, ['EV-CHAIN-A', 'EV-CHAIN-C', 'EV-CHAIN-B', 'EV-CHAIN-D', 'EV-CHAIN-E']);
    });

    it('V1.2: should handle self-referencing relative event without crash or infinite recursion', async () => {
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-SELF-REF',
        event_name: '自我参照事件',
        time_type: 'relative',
        base_event_id: 'EV-SELF-REF',
        relative_offset: 15
      });

      assert.equal(res.status, 'success');
      // Look up returns null before insertion, so base resolves to 0 + offset 15 = 15
      assert.equal(res.details.event.timestamp_order, 15);
      assert.equal(res.details.event.base_event_id, 'EV-SELF-REF');
    });

    it('V1.3: should handle 2-way circular relative dependency safely', async () => {
      // Event 1 references Event 2 (which does not exist yet)
      const res1 = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CIRC-1',
        event_name: '环形事件1',
        time_type: 'relative',
        base_event_id: 'EV-CIRC-2',
        relative_offset: 10
      });
      assert.equal(res1.details.event.timestamp_order, 10);

      // Event 2 references Event 1 (which now exists with timestamp_order 10)
      const res2 = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CIRC-2',
        event_name: '环形事件2',
        time_type: 'relative',
        base_event_id: 'EV-CIRC-1',
        relative_offset: 20
      });
      assert.equal(res2.details.event.timestamp_order, 30);

      // Re-upsert Event 1 referencing Event 2
      const res1Updated = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CIRC-1',
        event_name: '环形事件1更新',
        time_type: 'relative',
        base_event_id: 'EV-CIRC-2',
        relative_offset: 10
      });
      assert.equal(res1Updated.details.event.timestamp_order, 40);
    });

    it('V1.4: should fallback gracefully when base event does not exist', async () => {
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-ORPHAN-REL',
        event_name: '孤立相对事件',
        time_type: 'relative',
        base_event_id: 'EV-NON-EXISTENT-999',
        relative_offset: 42
      });

      assert.equal(res.status, 'success');
      assert.equal(res.details.event.timestamp_order, 42);
      assert.equal(res.details.event.base_event_id, 'EV-NON-EXISTENT-999');
    });

    it('V1.5: should parse relative string offsets with prefixes and signs', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-ANCHOR',
        event_name: '锚点',
        time_point: 2000
      });

      const resPlus = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '偏移+5.5',
        time_point: {
          type: 'relative',
          base_event: 'EV-ANCHOR',
          offset: '+5.5年'
        }
      });
      assert.equal(resPlus.details.event.timestamp_order, 2005.5);

      const resMinus = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '偏移-12',
        time_point: {
          type: 'relative',
          base_event: 'EV-ANCHOR',
          offset: '-12个月'
        }
      });
      assert.equal(resMinus.details.event.timestamp_order, 1988);
    });
  });

  // ==========================================================================
  // Vector 2: Overlapping Interval Queries Across Negative/BC & Extreme Spans
  // ==========================================================================
  describe('Vector 2: Overlapping Interval Queries Across Negative/BC & Extreme Boundaries', () => {

    it('V2.1: should accurately query interval overlaps in BC / negative timestamp ranges', async () => {
      // Event BC-A: [-3000, -2500]
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-BC-A',
        event_name: '古神纪元前叶',
        time_type: 'interval',
        interval_start: -3000,
        interval_end: -2500
      });

      // Event BC-B: [-2600, -2000]
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-BC-B',
        event_name: '大洪水时代',
        time_type: 'interval',
        interval_start: -2600,
        interval_end: -2000
      });

      // Event BC-C: [-1500, -1000]
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-BC-C',
        event_name: '青铜复兴期',
        time_type: 'interval',
        interval_start: -1500,
        interval_end: -1000
      });

      // Query window [-2700, -2200]
      // Matches BC-A (ends -2500 >= -2700, starts -3000 <= -2200)
      // Matches BC-B (ends -2000 >= -2700, starts -2600 <= -2200)
      // Excludes BC-C (starts -1500 > -2200)
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        interval_overlap_start: -2700,
        interval_overlap_end: -2200
      });

      assert.equal(res.details.events.length, 2);
      const ids = res.details.events.map(e => e.event_id);
      assert.ok(ids.includes('EV-BC-A'));
      assert.ok(ids.includes('EV-BC-B'));
      assert.ok(!ids.includes('EV-BC-C'));
    });

    it('V2.2: should handle zero-duration intervals at exact boundaries', async () => {
      // Zero duration event at 2024
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-ZERO-2024',
        event_name: '瞬时脉冲',
        time_type: 'interval',
        interval_start: 2024,
        interval_end: 2024
      });

      // Point 1: Query [2020, 2024] (exact right edge touch) -> MATCH
      const res1 = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        interval_overlap_start: 2020,
        interval_overlap_end: 2024
      });
      assert.equal(res1.details.events.length, 1);

      // Point 2: Query [2024, 2030] (exact left edge touch) -> MATCH
      const res2 = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        interval_overlap_start: 2024,
        interval_overlap_end: 2030
      });
      assert.equal(res2.details.events.length, 1);

      // Point 3: Query [2024.0001, 2030] (just outside) -> NO MATCH
      const res3 = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        interval_overlap_start: 2024.0001,
        interval_overlap_end: 2030
      });
      assert.equal(res3.details.events.length, 0);
    });

    it('V2.3: should handle large spans crossing BC to CE across zero', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-CROSS-ZERO',
        event_name: '百万年星际迁徙',
        time_type: 'interval',
        interval_start: -50000,
        interval_end: 50000
      });

      // Query tiny slice in CE
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        interval_overlap_start: 2000,
        interval_overlap_end: 2025
      });
      assert.equal(res.details.events.length, 1);
      assert.equal(res.details.events[0].event_id, 'EV-CROSS-ZERO');
    });

    it('V2.4: should support astronomical scale floating point timestamps without precision loss', async () => {
      const bigCosmicTime = -13800000000.5;
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_id: 'EV-BIG-BANG',
        event_name: '宇宙大爆炸',
        time_point: bigCosmicTime
      });

      assert.equal(res.details.event.timestamp_order, bigCosmicTime);

      const queried = await dispatcher.dispatch('ManageTimeline', {
        action: 'query',
        min_order: -14000000000,
        max_order: -13000000000
      });
      assert.equal(queried.details.events.length, 1);
      assert.equal(queried.details.events[0].timestamp_order, bigCosmicTime);
    });
  });

  // ==========================================================================
  // Vector 3: Fuzzy Time Strings & Descriptive Formats
  // ==========================================================================
  describe('Vector 3: Fuzzy Time Strings with and without Embedded Years/Eras', () => {

    it('V3.1: should extract BC year from Chinese text and set negative timestamp_order', async () => {
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '牧野之战',
        time_type: 'fuzzy',
        fuzzy_time_desc: '约公元前1046年春'
      });

      assert.equal(res.status, 'success');
      const ev = res.details.event;
      assert.equal(ev.time_type, 'fuzzy');
      assert.equal(ev.timestamp_order, -1046);
      assert.equal(ev.fuzzy_time_desc, '约公元前1046年春');
    });

    it('V3.2: should extract CE year and decimals from noisy fuzzy text', async () => {
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '新航路开辟',
        time_point: {
          type: 'fuzzy',
          description: '星历 2150.8 年深空开拓季'
        }
      });

      assert.equal(res.status, 'success');
      const ev = res.details.event;
      assert.equal(ev.time_type, 'fuzzy');
      assert.equal(ev.timestamp_order, 2150.8);
      assert.equal(ev.time_point.description, '星历 2150.8 年深空开拓季');
    });

    it('V3.3: should handle non-numeric fuzzy string gracefully with 0 order and full text preservation', async () => {
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '神话创世',
        time_type: 'fuzzy',
        fuzzy_time_desc: '太古鸿蒙初辟之时'
      });

      assert.equal(res.status, 'success');
      const ev = res.details.event;
      assert.equal(ev.time_type, 'fuzzy');
      assert.equal(ev.timestamp_order, 0);
      assert.equal(ev.fuzzy_time_desc, '太古鸿蒙初辟之时');
      assert.deepEqual(ev.time_point, {
        type: 'fuzzy',
        description: '太古鸿蒙初辟之时'
      });
    });

    it('V3.4: should accept direct string time_point as fuzzy time', async () => {
      const res = await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '黑暗时代',
        time_point: '大断裂后的第三个世纪'
      });

      assert.equal(res.status, 'success');
      const ev = res.details.event;
      assert.equal(ev.time_type, 'fuzzy');
      assert.equal(ev.fuzzy_time_desc, '大断裂后的第三个世纪');
    });
  });

  // ==========================================================================
  // Vector 4: Foreshadowing Lifecycle State Transitions & Query Engine
  // ==========================================================================
  describe('Vector 4: Foreshadowing Lifecycle State Transitions & Queries', () => {

    it('V4.1: should complete entire lifecycle (add -> resolve -> query active at chapter)', async () => {
      // 1. Add Foreshadowing Thread
      const addRes = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-SECRET-SEAL',
        title: '密教封印',
        description: '在地下墓穴发现的古老封印，刻有双头蛇徽记。',
        importance_level: 'core_climax',
        introduced_chapter: '3',
        target_resolve_chapter: '25',
        related_entities: ['密教', '大主教', '双头蛇'],
        tags: ['主线', '悬疑']
      });

      assert.equal(addRes.status, 'success');
      const clue = addRes.details.foreshadowing;
      assert.equal(clue.foreshadow_id, 'FS-SECRET-SEAL');
      assert.equal(clue.status, 'open');
      assert.equal(clue.introduced_chapter, 3);
      assert.equal(clue.target_resolve_chapter, 25);
      assert.deepEqual(clue.related_entities, ['密教', '大主教', '双头蛇']);

      // 2. Active at Chapter 10 (Should be ACTIVE)
      const listActive10 = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        active_at_chapter: 10
      });
      assert.equal(listActive10.details.items.length, 1);
      assert.equal(listActive10.details.items[0].foreshadow_id, 'FS-SECRET-SEAL');

      // 3. Active at Chapter 2 (Introduced at 3, so NOT active yet)
      const listActive2 = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        active_at_chapter: 2
      });
      assert.equal(listActive2.details.items.length, 0);

      // 4. Resolve at Chapter 20
      const resolveRes = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'resolve',
        thread_key: 'FS-SECRET-SEAL',
        actual_resolve_chapter: '20',
        resolution_notes: '主角在第20章破译了双头蛇徽记的真正含义。'
      });
      assert.equal(resolveRes.status, 'success');
      const resolved = resolveRes.details.foreshadowing;
      assert.equal(resolved.status, 'closed');
      assert.equal(resolved.actual_resolve_chapter, 20);
      assert.ok(resolved.resolution_notes.includes('双头蛇徽记'));

      // 5. Active at Chapter 22 (Already closed, so NOT returned by active_at_chapter query)
      const listActive22 = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        active_at_chapter: 22
      });
      assert.equal(listActive22.details.items.length, 0);

      // 6. Query by status = 'closed'
      const listClosed = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        status: 'closed'
      });
      assert.equal(listClosed.details.items.length, 1);
    });

    it('V4.2: should support alphanumeric and decimal chapter representations', async () => {
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-DECIMAL',
        title: '番外线索',
        description: '特别篇线索',
        introduced_chapter: '12.5',
        target_resolve_chapter: 'CH-FINAL'
      });

      const res = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        introduced_chapter: '12.5'
      });
      assert.equal(res.details.items.length, 1);
      assert.equal(res.details.items[0].introduced_chapter, 12.5);
      assert.equal(res.details.items[0].target_resolve_chapter, 'CH-FINAL');
    });

    it('V4.3: should filter foreshadowing by related entities (array, comma-delimited, single)', async () => {
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-ENT-1',
        title: '暗杀信',
        description: '信件内容',
        related_entities: ['刺客工会', '摄政王']
      });

      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-ENT-2',
        title: '军械图纸',
        description: '图纸细节',
        related_entities: '皇家工坊, 摄政王'
      });

      const resRegent = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        related_entity: '摄政王'
      });
      assert.equal(resRegent.details.items.length, 2);

      const resAssassin = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        related_entity: '刺客工会'
      });
      assert.equal(resAssassin.details.items.length, 1);
      assert.equal(resAssassin.details.items[0].foreshadow_id, 'FS-ENT-1');
    });
  });

  // ==========================================================================
  // Vector 5: Concurrency, Bulk Upsert, and SQL Injection Attacks
  // ==========================================================================
  describe('Vector 5: Concurrency, Bulk Upsert, and SQL Injection Resistance', () => {

    it('V5.1: should withstand aggressive SQL injection payloads in timeline fields', async () => {
      const sqlInjections = [
        "'); DROP TABLE timeline_events; --",
        "' OR '1'='1",
        "admin'--",
        "1; ATTACH DATABASE 'malicious.db' AS evil; --",
        "\" OR \"\"=\"",
        "'; UPDATE chapters SET canon=1; --"
      ];

      for (const [idx, payload] of sqlInjections.entries()) {
        const res = await dispatcher.dispatch('ManageTimeline', {
          action: 'add',
          event_id: `EV-SQLI-${idx}`,
          event_name: payload,
          description: payload,
          era_epoch: payload,
          time_point: 2000 + idx,
          involved_entities: [payload]
        });

        assert.equal(res.status, 'success', `Must successfully handle payload ${idx}`);
        assert.equal(res.details.event.title, payload);
      }

      // Verify timeline table is intact and has all rows
      const count = dbManager.timeline.count();
      assert.equal(count, sqlInjections.length, 'All injected events must exist without table drop or corruption');
    });

    it('V5.2: should withstand SQL injection in timeline and foreshadowing queries', async () => {
      await dispatcher.dispatch('ManageTimeline', {
        action: 'add',
        event_name: '正常事件',
        time_point: 100
      });

      const sqliSearchQueries = [
        "' OR 1=1 --",
        "' UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28 --",
        "admin') OR ('1'='1"
      ];

      for (const query of sqliSearchQueries) {
        const resTL = await dispatcher.dispatch('ManageTimeline', {
          action: 'query',
          query: query
        });
        assert.equal(resTL.status, 'success');
        assert.equal(resTL.details.events.length, 0, 'Should return empty results safely without SQL error or leak');

        const resFS = await dispatcher.dispatch('ManageForeshadowing', {
          action: 'list',
          query: query
        });
        assert.equal(resFS.status, 'success');
        assert.equal(resFS.details.items.length, 0);
      }
    });

    it('V5.3: should perform high-volume bulk upsert (1,000 items) within single transaction', () => {
      const tlItems = [];
      const fsItems = [];

      for (let i = 1; i <= 1000; i++) {
        tlItems.push({
          event_id: `EV-BULK-${i}`,
          title: `批量事件 ${i}`,
          timestamp_order: i * 10,
          era_epoch: '批量纪元',
          time_type: i % 3 === 0 ? 'interval' : 'exact',
          interval_start: i % 3 === 0 ? i * 10 : null,
          interval_end: i % 3 === 0 ? i * 10 + 5 : null
        });

        fsItems.push({
          foreshadow_id: `FS-BULK-${i}`,
          title: `批量伏笔 ${i}`,
          description: `伏笔描述 ${i}`,
          introduced_chapter: String(Math.floor(i / 10) + 1),
          target_resolve_chapter: String(Math.floor(i / 10) + 10),
          importance_level: i % 2 === 0 ? 'major' : 'minor'
        });
      }

      const startTL = Date.now();
      const countTL = dbManager.timeline.batchUpsert(tlItems);
      const durationTL = Date.now() - startTL;

      assert.equal(countTL, 1000);
      assert.equal(dbManager.timeline.count(), 1000);
      assert.ok(durationTL < 3000, `Batch insert 1000 timeline events took ${durationTL}ms, should be < 3000ms`);

      const startFS = Date.now();
      const countFS = dbManager.foreshadowing.batchUpsert(fsItems);
      const durationFS = Date.now() - startFS;

      assert.equal(countFS, 1000);
      assert.equal(dbManager.foreshadowing.count(), 1000);
      assert.ok(durationFS < 3000, `Batch insert 1000 foreshadowing items took ${durationFS}ms, should be < 3000ms`);
    });
  });
});
