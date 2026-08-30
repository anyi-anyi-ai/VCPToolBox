/**
 * @file manageForeshadowing.test.js
 * @description Comprehensive unit test suite for ManageForeshadowing command and narrative state tracking
 * @module test/unit/manageForeshadowing
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

describe('ManageForeshadowing: Narrative Clues & Setups/Payoffs Suite', () => {
  let tempEnv = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_fs_test_');
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
  // Tier 1: Core Actions (add, resolve, list) Happy Path
  // =========================================================================
  describe('Tier 1: Core CRUD Operations Happy Path', () => {

    it('F4-T1.1: should successfully add a new foreshadowing clue with status=open', async () => {
      const payload = {
        action: 'add',
        thread_key: 'FS-001',
        title: '第三货舱未登记古代遗物',
        description: '在远征旗舰货舱底层扫描到未知的量子加密遗物反应。',
        importance_level: 'core_climax',
        tags: ['ancient_tech', 'mystery']
      };

      const res = await dispatcher.dispatch('ManageForeshadowing', payload);
      assert.ok(res, 'Must return response');
      const details = res.details || res;

      assert.equal(details.status || details.actionStatus, 'success', 'Action status must be success');
      const clue = details.foreshadowing || details.item || details;
      assert.equal(clue.foreshadow_id || clue.thread_key || clue.foreshadowId, 'FS-001');
      assert.equal(clue.status, 'open', 'New clue must have initial status open');

      // Verify in SQLite directly
      const dbClue = dbManager.foreshadowing.getByForeshadowId('FS-001');
      assert.ok(dbClue);
      assert.equal(dbClue.title, '第三货舱未登记古代遗物');
      assert.equal(dbClue.importance_level, 'core_climax');
      assert.equal(dbClue.status, 'open');
    });

    it('F4-T1.2: should resolve an existing clue, setting status to closed/resolved with payoff metadata', async () => {
      // 1. Add clue
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-002',
        title: '先遣队莫尔斯信号',
        description: '接收到的神秘救援信号。',
        importance_level: 'major'
      });

      // 2. Resolve clue
      const resolvePayload = {
        action: 'resolve',
        thread_key: 'FS-002',
        resolution_snippet: '第5章中，林远在废弃空间站解码了该信号，证实为50年前失踪的探索一号。',
        resolution_chapter_id: 5,
        resolution_line: 128
      };

      const res = await dispatcher.dispatch('ManageForeshadowing', resolvePayload);
      const details = res.details || res;
      const clue = details.foreshadowing || details.item || details;

      assert.ok(clue.status === 'closed' || clue.status === 'resolved', 'Status must be closed or resolved');

      // Check in DB
      const dbClue = dbManager.foreshadowing.getByForeshadowId('FS-002');
      assert.ok(dbClue);
      assert.ok(dbClue.status === 'closed' || dbClue.status === 'resolved');
      assert.ok(dbClue.resolution_snippet.includes('第5章中'));
    });

    it('F4-T1.3: should list all foreshadowing clues', async () => {
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-003',
        title: '神秘星图残片',
        description: '残缺的跃迁星图。'
      });

      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-004',
        title: '叛变军官暗号',
        description: '通讯记录中的异常频段。'
      });

      const res = await dispatcher.dispatch('ManageForeshadowing', { action: 'list' });
      const details = res.details || res;
      const items = details.items || details.foreshadowing || details.list || [];

      assert.ok(items.length >= 2, 'List must return all registered clues');
    });

    it('F4-T1.4: should filter clues by status (open vs closed)', async () => {
      // Add and resolve one, keep another open
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-OPEN-1',
        title: '未解线索',
        description: '持续开放的伏笔。'
      });

      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-CLOSED-1',
        title: '已解线索',
        description: '已完成闭环的伏笔。'
      });

      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'resolve',
        thread_key: 'FS-CLOSED-1',
        resolution_snippet: '已在第3章回收。'
      });

      const openRes = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        status: 'open'
      });
      const openDetails = openRes.details || openRes;
      const openItems = openDetails.items || openDetails.foreshadowing || openDetails.list || [];

      assert.ok(openItems.every(i => i.status === 'open'), 'All filtered items must have status=open');
      assert.ok(openItems.some(i => (i.foreshadow_id || i.thread_key || i.foreshadowId) === 'FS-OPEN-1'));
    });

    it('F4-T1.5: should filter clues by importance_level', async () => {
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-MAJOR-1',
        title: '核心支柱伏笔',
        description: '主线剧情大结局伏笔。',
        importance_level: 'core_climax'
      });

      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-MINOR-1',
        title: '次要背景伏笔',
        description: '路人角色的背景小插曲。',
        importance_level: 'minor'
      });

      const res = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        importance_level: 'core_climax'
      });
      const details = res.details || res;
      const items = details.items || details.foreshadowing || details.list || [];

      assert.ok(items.length >= 1);
      assert.ok(items.every(i => (i.importance_level || i.importance) === 'core_climax'));
    });
  });

  // =========================================================================
  // Tier 2: Validation, Boundary & Error Handling
  // =========================================================================
  describe('Tier 2: Parameter Validation & Error Handling', () => {

    it('F4-T2.1: should reject invocation with missing or invalid action', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageForeshadowing', {});
        },
        /action|required|invalid/i
      );

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageForeshadowing', { action: 'destroy_universe' });
        },
        /unsupported|unknown|invalid action/i
      );
    });

    it('F4-T2.2: should reject add action when thread_key or description is missing', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageForeshadowing', {
            action: 'add',
            title: 'Only Title'
          });
        },
        /thread_key|foreshadow_id|description|required/i
      );
    });

    it('F4-T2.3: should search clues by keyword query in list action', async () => {
      await dispatcher.dispatch('ManageForeshadowing', {
        action: 'add',
        thread_key: 'FS-SEARCH-1',
        title: '量子引力透镜失稳',
        description: '黑洞边缘观测站的警报。'
      });

      const res = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        query: '量子引力'
      });
      const details = res.details || res;
      const items = details.items || details.foreshadowing || details.list || [];

      assert.ok(items.length >= 1);
      assert.ok(items.some(i => i.title.includes('量子引力')));
    });

    it('F4-T2.4: should support limit and offset pagination in list action', async () => {
      for (let i = 1; i <= 5; i++) {
        await dispatcher.dispatch('ManageForeshadowing', {
          action: 'add',
          thread_key: `FS-PAGE-${i}`,
          title: `分页线索 ${i}`,
          description: `线索描述 ${i}`
        });
      }

      const res = await dispatcher.dispatch('ManageForeshadowing', {
        action: 'list',
        limit: 2,
        offset: 0
      });
      const details = res.details || res;
      const items = details.items || details.foreshadowing || details.list || [];

      assert.equal(items.length, 2, 'Must respect limit of 2 items');
    });

    it('F4-T2.5: should gracefully handle resolving non-existent foreshadowing clue', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('ManageForeshadowing', {
            action: 'resolve',
            thread_key: 'NON_EXISTENT_FS_999',
            resolution_snippet: 'Not found'
          });
        },
        /not found|does not exist|error/i
      );
    });
  });

  // =========================================================================
  // Tier 3 & Tier 4: Multi-Clue Lifecycle Stress
  // =========================================================================
  describe('Tier 3 & 4: Multi-Clue Plot Branching Lifecycle', () => {

    it('F4-T4.1: should manage 10 narrative clues across multiple branches, resolving subset', async () => {
      const totalClues = 10;

      // Add 10 clues
      for (let i = 1; i <= totalClues; i++) {
        await dispatcher.dispatch('ManageForeshadowing', {
          action: 'add',
          thread_key: `BRANCH-FS-${i}`,
          title: `剧情支线线索 ${i}`,
          description: `线索详细说明 ${i}`,
          importance_level: i % 2 === 0 ? 'major' : 'minor'
        });
      }

      // Resolve even numbered clues
      for (let i = 2; i <= totalClues; i += 2) {
        await dispatcher.dispatch('ManageForeshadowing', {
          action: 'resolve',
          thread_key: `BRANCH-FS-${i}`,
          resolution_snippet: `在第 ${i * 2} 章成功闭环回收。`,
          resolution_chapter_id: i * 2
        });
      }

      // Query open clues
      const openRes = await dispatcher.dispatch('ManageForeshadowing', { action: 'list', status: 'open' });
      const openDetails = openRes.details || openRes;
      const openItems = openDetails.items || openDetails.foreshadowing || openDetails.list || [];
      assert.equal(openItems.length, 5, 'Exactly 5 clues should remain open');

      // Query closed clues
      const closedRes = await dispatcher.dispatch('ManageForeshadowing', { action: 'list', status: 'closed' });
      const closedDetails = closedRes.details || closedRes;
      const closedItems = closedDetails.items || closedDetails.foreshadowing || closedDetails.list || [];
      assert.equal(closedItems.length, 5, 'Exactly 5 clues should be closed');
    });
  });
});
