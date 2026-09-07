/**
 * @file beats_hierarchy.test.js
 * @description Comprehensive unit tests for Milestone 1: Scene Beats Choreography & Hierarchy (R1)
 * Covers BeatRepo CRUD, two-phase reorder collision mitigation, status lifecycle state machine,
 * BeatCommands dispatching, and composition gate enforcement.
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const BeatCommands = require('../../src/commands/BeatCommands');
const { PathGuard } = require('../../src/security/PathGuard');
const { NovelError } = require('../../src/errors');

describe('Milestone 1: Scene Beats Choreography & Hierarchy (R1)', () => {
  let dbManager = null;
  let dispatcher = null;
  let tempDir = null;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beats_m1_test_'));
    const pathGuard = new PathGuard({ pluginRoot: tempDir });
    dbManager = new DatabaseManager(':memory:', { pathGuard });
    dispatcher = new CommandDispatcher({
      basePath: tempDir,
      dbManager,
      pathGuard
    });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // =========================================================================
  // Suite 1: Database Schema & BeatRepo CRUD Operations
  // =========================================================================
  describe('Suite 1: Database Schema & BeatRepo CRUD Operations', () => {
    it('1.1 should have chapter_beats table with all expected columns and indices', () => {
      const tableInfo = dbManager.db.pragma('table_info(chapter_beats)');
      const colNames = tableInfo.map(c => c.name);

      const requiredCols = [
        'id', 'beat_id', 'chapter_id', 'beat_order', 'title', 'scene_goal',
        'conflict', 'characters_json', 'location', 'world_rules_json',
        'debt_action_json', 'emotional_tone', 'input_state_json', 'expected_output',
        'status', 'version', 'content', 'created_at', 'updated_at'
      ];

      for (const col of requiredCols) {
        assert.ok(colNames.includes(col), `chapter_beats must include column: ${col}`);
      }

      const indices = dbManager.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='chapter_beats'"
      ).all().map(r => r.name);

      assert.ok(indices.includes('idx_beats_chapter_id'), 'idx_beats_chapter_id must exist');
      assert.ok(indices.includes('idx_beats_beat_id'), 'idx_beats_beat_id must exist');
      assert.ok(indices.includes('idx_beats_status'), 'idx_beats_status must exist');
    });

    it('1.2 should insert beat with default status draft and version 1', () => {
      const beat = dbManager.beats.insert({
        beat_id: 'BEAT_CH001_01',
        chapter_id: 'CH001',
        beat_order: 1,
        title: '密林伏击',
        scene_goal: '主角遭遇先遣小队潜伏袭击并存活',
        conflict: '伤势未愈且地形劣势',
        characters: ['CHAR_001_AETHEN', 'CHAR_009_SCOUT'],
        location: 'LOC_MIST_FOREST',
        world_rules: ['AXIOM_THERMAL_SHIELD'],
        debt_action: { action: 'accrue', debt_id: 'DEBT_01', amount: 10.0 },
        emotional_tone: 'tense_survival'
      });

      assert.ok(beat);
      assert.equal(beat.beat_id, 'BEAT_CH001_01');
      assert.equal(beat.chapter_id, 'CH001');
      assert.equal(beat.beat_order, 1);
      assert.equal(beat.title, '密林伏击');
      assert.equal(beat.scene_goal, '主角遭遇先遣小队潜伏袭击并存活');
      assert.equal(beat.status, 'draft');
      assert.equal(beat.version, 1);
      assert.deepEqual(JSON.parse(beat.characters_json), ['CHAR_001_AETHEN', 'CHAR_009_SCOUT']);
      assert.equal(beat.location, 'LOC_MIST_FOREST');
      assert.deepEqual(JSON.parse(beat.world_rules_json), ['AXIOM_THERMAL_SHIELD']);
      assert.deepEqual(JSON.parse(beat.debt_action_json), { action: 'accrue', debt_id: 'DEBT_01', amount: 10.0 });
    });

    it('1.3 should reject beat insertion when scene_goal or chapter_id is missing', () => {
      assert.throws(
        () => {
          dbManager.beats.insert({
            beat_id: 'BEAT_ERR_01',
            chapter_id: '',
            scene_goal: 'Some goal'
          });
        },
        /MISSING_CHAPTER_ID/
      );

      assert.throws(
        () => {
          dbManager.beats.insert({
            beat_id: 'BEAT_ERR_02',
            chapter_id: 'CH001',
            scene_goal: '   '
          });
        },
        /MISSING_BEAT_GOAL/
      );
    });

    it('1.4 should find beats by chapterId ordered by beat_order ascending', () => {
      dbManager.beats.insert({
        beat_id: 'BEAT_C1_03',
        chapter_id: 'C1',
        beat_order: 3,
        scene_goal: 'Goal 3'
      });
      dbManager.beats.insert({
        beat_id: 'BEAT_C1_01',
        chapter_id: 'C1',
        beat_order: 1,
        scene_goal: 'Goal 1'
      });
      dbManager.beats.insert({
        beat_id: 'BEAT_C1_02',
        chapter_id: 'C1',
        beat_order: 2,
        scene_goal: 'Goal 2'
      });

      const beats = dbManager.beats.findByChapterId('C1');
      assert.equal(beats.length, 3);
      assert.equal(beats[0].beat_id, 'BEAT_C1_01');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[1].beat_id, 'BEAT_C1_02');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[2].beat_id, 'BEAT_C1_03');
      assert.equal(beats[2].beat_order, 3);
    });

    it('1.5 should delete beats by chapterId and beatId', () => {
      dbManager.beats.insert({ beat_id: 'B1', chapter_id: 'DEL_CH', beat_order: 1, scene_goal: 'G1' });
      dbManager.beats.insert({ beat_id: 'B2', chapter_id: 'DEL_CH', beat_order: 2, scene_goal: 'G2' });
      dbManager.beats.insert({ beat_id: 'B3', chapter_id: 'OTHER_CH', beat_order: 1, scene_goal: 'G3' });

      dbManager.beats.deleteByBeatId('B1');
      assert.equal(dbManager.beats.findByBeatId('B1'), null);
      assert.ok(dbManager.beats.findByBeatId('B2'));

      dbManager.beats.deleteByChapterId('DEL_CH');
      assert.equal(dbManager.beats.findByChapterId('DEL_CH').length, 0);
      assert.equal(dbManager.beats.findByChapterId('OTHER_CH').length, 1);
    });
  });

  // =========================================================================
  // Suite 2: Two-Phase Reorder Engine (Preventing SQLite UNIQUE Collisions)
  // =========================================================================
  describe('Suite 2: Two-Phase Reorder Engine (Collision-Free)', () => {
    beforeEach(() => {
      // Create 4 initial beats with contiguous orders 1, 2, 3, 4
      for (let i = 1; i <= 4; i++) {
        dbManager.beats.insert({
          beat_id: `BEAT_RE_${i}`,
          chapter_id: 'CH_REORDER',
          beat_order: i,
          title: `Beat Title ${i}`,
          scene_goal: `Goal for beat ${i}`
        });
      }
    });

    it('2.1 should safely swap adjacent beats (2 <-> 1) without SQLite UNIQUE collision', () => {
      // In a naive loop, setting BEAT_RE_2 to order 1 while BEAT_RE_1 is order 1 crashes SQLite.
      // Two-phase reorder must succeed cleanly.
      const reordered = dbManager.beats.updateOrder('CH_REORDER', [
        'BEAT_RE_2',
        'BEAT_RE_1',
        'BEAT_RE_3',
        'BEAT_RE_4'
      ]);

      assert.equal(reordered.length, 4);
      assert.equal(reordered[0].beat_id, 'BEAT_RE_2');
      assert.equal(reordered[0].beat_order, 1);
      assert.equal(reordered[0].version, 2); // Version bumped on reorder

      assert.equal(reordered[1].beat_id, 'BEAT_RE_1');
      assert.equal(reordered[1].beat_order, 2);
      assert.equal(reordered[1].version, 2);

      assert.equal(reordered[2].beat_id, 'BEAT_RE_3');
      assert.equal(reordered[2].beat_order, 3);

      assert.equal(reordered[3].beat_id, 'BEAT_RE_4');
      assert.equal(reordered[3].beat_order, 4);
    });

    it('2.2 should completely invert an array of beats (4, 3, 2, 1) cleanly', () => {
      const inverted = dbManager.beats.updateOrder('CH_REORDER', [
        'BEAT_RE_4',
        'BEAT_RE_3',
        'BEAT_RE_2',
        'BEAT_RE_1'
      ]);

      assert.equal(inverted[0].beat_id, 'BEAT_RE_4');
      assert.equal(inverted[0].beat_order, 1);
      assert.equal(inverted[1].beat_id, 'BEAT_RE_3');
      assert.equal(inverted[1].beat_order, 2);
      assert.equal(inverted[2].beat_id, 'BEAT_RE_2');
      assert.equal(inverted[2].beat_order, 3);
      assert.equal(inverted[3].beat_id, 'BEAT_RE_1');
      assert.equal(inverted[3].beat_order, 4);
    });

    it('2.3 should scramble a 10-beat sequence under high shuffle without collision', () => {
      const cid = 'CH_STRESS_REORDER';
      const originalIds = [];
      for (let i = 1; i <= 10; i++) {
        const bid = `BEAT_STRESS_${i}`;
        originalIds.push(bid);
        dbManager.beats.insert({
          beat_id: bid,
          chapter_id: cid,
          beat_order: i,
          scene_goal: `Stress Goal ${i}`
        });
      }

      // Reverse and rotate
      const shuffledIds = [
        'BEAT_STRESS_10', 'BEAT_STRESS_1', 'BEAT_STRESS_9', 'BEAT_STRESS_2',
        'BEAT_STRESS_8', 'BEAT_STRESS_3', 'BEAT_STRESS_7', 'BEAT_STRESS_4',
        'BEAT_STRESS_6', 'BEAT_STRESS_5'
      ];

      const result = dbManager.beats.updateOrder(cid, shuffledIds);
      assert.equal(result.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(result[i].beat_id, shuffledIds[i]);
        assert.equal(result[i].beat_order, i + 1);
      }
    });
  });

  // =========================================================================
  // Suite 3: Status Lifecycle State Machine & Version Bumping
  // =========================================================================
  describe('Suite 3: Status Lifecycle State Machine & Version Bumping', () => {
    let beatId = 'BEAT_STAT_01';

    beforeEach(() => {
      dbManager.beats.insert({
        beat_id: beatId,
        chapter_id: 'CH_STAT',
        beat_order: 1,
        title: '状态机节拍',
        scene_goal: '验证状态跃迁与版本单调递增'
      });
    });

    it('3.1 should monotonically bump version on updates', () => {
      const initial = dbManager.beats.findByBeatId(beatId);
      assert.equal(initial.version, 1);

      const up1 = dbManager.beats.update(beatId, { title: '新标题 1' });
      assert.equal(up1.version, 2);
      assert.equal(up1.title, '新标题 1');

      const up2 = dbManager.beats.update(beatId, { emotional_tone: 'somber' });
      assert.equal(up2.version, 3);
      assert.equal(up2.emotional_tone, 'somber');
    });

    it('3.2 should enforce standard status progression: draft -> confirmed -> expanded -> revised', () => {
      // 1. draft -> confirmed (valid)
      const c1 = dbManager.beats.update(beatId, { status: 'confirmed' });
      assert.equal(c1.status, 'confirmed');

      // 2. confirmed -> expanded (valid)
      const c2 = dbManager.beats.update(beatId, { status: 'expanded', content: 'prose content' });
      assert.equal(c2.status, 'expanded');

      // 3. expanded -> revised (valid)
      const c3 = dbManager.beats.update(beatId, { status: 'revised', content: 'revised prose content' });
      assert.equal(c3.status, 'revised');

      // 4. revised -> revised (valid idempotent revision)
      const c4 = dbManager.beats.update(beatId, { status: 'revised', content: 'another revision' });
      assert.equal(c4.status, 'revised');
    });

    it('3.3 should reject illegal status skip: draft -> expanded or draft -> revised', () => {
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'expanded' });
        },
        /INVALID_BEAT_STATUS_TRANSITION/
      );

      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'revised' });
        },
        /INVALID_BEAT_STATUS_TRANSITION/
      );
    });

    it('3.4 should support demotion back to draft via resetStatus flag', () => {
      // Progress to confirmed then expanded
      dbManager.beats.update(beatId, { status: 'confirmed' });
      const exp = dbManager.beats.update(beatId, { status: 'expanded' });
      assert.equal(exp.status, 'expanded');

      // Author drastically alters core scene goal, requiring demotion to draft
      const demoted = dbManager.beats.update(beatId, {
        scene_goal: '完全重构的戏剧目标',
        resetStatus: true
      });

      assert.equal(demoted.status, 'draft');
      assert.equal(demoted.scene_goal, '完全重构的戏剧目标');
      assert.ok(demoted.version > exp.version);
    });
  });

  // =========================================================================
  // Suite 4: BeatCommands Implementation & API Contract Verification
  // =========================================================================
  describe('Suite 4: BeatCommands Implementation & API Contracts', () => {
    it('4.1 PlanSceneBeats: should batch create beats with auto-generated IDs and default draft status', async () => {
      const res = await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH002',
          beats: [
            {
              title: '开端：警报拉响',
              sceneGoal: '空间站发生引力坍塌警报，主角紧急撤离',
              conflict: '通道被陨石残片封堵',
              characters: ['CHAR_001_AETHEN']
            },
            {
              title: '中段：断路决择',
              sceneGoal: '二选一决定是否营救隔壁舱段的生还者',
              conflict: '氧气仅存7分钟'
            }
          ]
        },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.chapterId, 'CH002');
      assert.equal(res.totalBeats, 2);
      assert.equal(res.allConfirmed, false);
      assert.equal(res.beats[0].status, 'draft');
      assert.equal(res.beats[0].beat_order, 1);
      assert.equal(res.beats[0].beat_id, 'BEAT_CH002_01');
      assert.equal(res.beats[1].beat_order, 2);
      assert.equal(res.beats[1].beat_id, 'BEAT_CH002_02');
      assert.ok(res.content.includes('Chapter CH002 Planned'));
    });

    it('4.2 PlanSceneBeats: should reject missing chapterId or empty beats array', async () => {
      await assert.rejects(
        () => BeatCommands.handlePlanSceneBeats({ chapterId: '', beats: [{ sceneGoal: 'Goal' }] }, { dbManager }),
        /MISSING_CHAPTER_ID/
      );

      await assert.rejects(
        () => BeatCommands.handlePlanSceneBeats({ chapterId: 'CH001', beats: [] }, { dbManager }),
        /INVALID_BEATS_ARRAY/
      );

      await assert.rejects(
        () => BeatCommands.handlePlanSceneBeats({ chapterId: 'CH001', beats: [{ title: 'No Goal' }] }, { dbManager }),
        /MISSING_BEAT_GOAL/
      );
    });

    it('4.3 GetSceneBeats: should return ordered beats, countsByStatus, and readyForComposition boolean', async () => {
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH003',
          beats: [
            { sceneGoal: 'Goal 1', title: 'Beat 1' },
            { sceneGoal: 'Goal 2', title: 'Beat 2' },
            { sceneGoal: 'Goal 3', title: 'Beat 3' }
          ]
        },
        { dbManager }
      );

      const res1 = await BeatCommands.handleGetSceneBeats({ chapterId: 'CH003' }, { dbManager });
      assert.equal(res1.status, 'success');
      assert.equal(res1.totalBeats, 3);
      assert.equal(res1.allConfirmed, false);
      assert.equal(res1.readyForComposition, false);
      assert.equal(res1.countsByStatus.draft, 3);
      assert.equal(res1.countsByStatus.confirmed, 0);

      // Confirm all beats
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH003' }, { dbManager });

      const res2 = await BeatCommands.handleGetSceneBeats({ chapterId: 'CH003' }, { dbManager });
      assert.equal(res2.allConfirmed, true);
      assert.equal(res2.readyForComposition, true);
      assert.equal(res2.countsByStatus.draft, 0);
      assert.equal(res2.countsByStatus.confirmed, 3);
    });

    it('4.4 UpdateSceneBeat: should update attributes and return updated structure', async () => {
      await BeatCommands.handlePlanSceneBeats(
        { chapterId: 'CH004', beats: [{ beatId: 'BEAT_UP_01', sceneGoal: 'Original Goal' }] },
        { dbManager }
      );

      const res = await BeatCommands.handleUpdateSceneBeat(
        {
          beatId: 'BEAT_UP_01',
          updates: {
            title: '精修标题',
            sceneGoal: '精修戏剧目标',
            emotionalTone: 'heavy_suspense'
          }
        },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.beat.title, '精修标题');
      assert.equal(res.beat.scene_goal, '精修戏剧目标');
      assert.equal(res.beat.emotional_tone, 'heavy_suspense');
      assert.equal(res.beat.version, 2);
    });

    it('4.5 ReorderSceneBeats: should reorder and validate consistency', async () => {
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH005',
          beats: [
            { beatId: 'B_01', sceneGoal: 'G1' },
            { beatId: 'B_02', sceneGoal: 'G2' },
            { beatId: 'B_03', sceneGoal: 'G3' }
          ]
        },
        { dbManager }
      );

      // Successful reorder: 3, 1, 2
      const res = await BeatCommands.handleReorderSceneBeats(
        { chapterId: 'CH005', orderedBeatIds: ['B_03', 'B_01', 'B_02'] },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.beats[0].beat_id, 'B_03');
      assert.equal(res.beats[0].beat_order, 1);
      assert.equal(res.beats[1].beat_id, 'B_01');
      assert.equal(res.beats[1].beat_order, 2);
      assert.equal(res.beats[2].beat_id, 'B_02');
      assert.equal(res.beats[2].beat_order, 3);

      // Rejects mismatched count or missing beat
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId: 'CH005', orderedBeatIds: ['B_03', 'B_01'] },
          { dbManager }
        ),
        /BEAT_REORDER_COUNT_MISMATCH/
      );

      // Rejects duplicate IDs
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId: 'CH005', orderedBeatIds: ['B_03', 'B_03', 'B_01'] },
          { dbManager }
        ),
        /DUPLICATE_BEAT_REORDER_IDS/
      );
    });

    it('4.6 ConfirmSceneBeats: should confirm specific beats or all draft beats', async () => {
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH006',
          beats: [
            { beatId: 'CONF_1', sceneGoal: 'Valid Goal 1' },
            { beatId: 'CONF_2', sceneGoal: 'Valid Goal 2' }
          ]
        },
        { dbManager }
      );

      // Confirm only first beat
      const partRes = await BeatCommands.handleConfirmSceneBeats(
        { chapterId: 'CH006', beatIds: ['CONF_1'] },
        { dbManager }
      );

      assert.equal(partRes.confirmedCount, 1);
      assert.equal(partRes.remainingDraftCount, 1);
      assert.equal(partRes.allConfirmed, false);

      // Confirm remaining beats
      const fullRes = await BeatCommands.handleConfirmSceneBeats(
        { chapterId: 'CH006' },
        { dbManager }
      );

      assert.equal(fullRes.remainingDraftCount, 0);
      assert.equal(fullRes.allConfirmed, true);
    });

    it('4.7 ConfirmSceneBeats: should reject confirming beat with empty scene_goal', async () => {
      // Directly insert invalid beat with empty goal into DB to simulate edge case
      dbManager.db.prepare(
        "INSERT INTO chapter_beats (beat_id, chapter_id, beat_order, title, scene_goal, status) VALUES ('EMPTY_GOAL', 'CH_BAD', 1, 'Empty Goal Beat', '', 'draft')"
      ).run();

      await assert.rejects(
        () => BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_BAD' }, { dbManager }),
        /BEAT_GOAL_EMPTY/
      );
    });

    it('4.8 PlanSceneBeats: should support automated parameter-driven planning when beats array is omitted', async () => {
      const res = await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_AUTO_01',
          chapterGoal: '渗透敌方要塞',
          targetCount: 3
        },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.success, true);
      assert.equal(res.chapterId, 'CH_AUTO_01');
      assert.equal(res.totalBeats, 3);
      assert.equal(res.count, 3);
      assert.equal(res.allConfirmed, false);
      assert.equal(res.beats.length, 3);
      assert.equal(res.beats[0].status, 'draft');
      assert.equal(res.beats[0].beat_order, 1);
      assert.ok(res.beats[0].scene_goal.includes('渗透敌方要塞'));
    });

    it('4.9 PlanSceneBeats: should clamp automated targetCount between 2 and 6', async () => {
      // 0 clamped to 2
      const lowRes = await BeatCommands.handlePlanSceneBeats(
        { chapterId: 'CH_AUTO_LOW', targetCount: 0 },
        { dbManager }
      );
      assert.ok(lowRes.totalBeats >= 2);

      // 100 clamped to 6
      const highRes = await BeatCommands.handlePlanSceneBeats(
        { chapterId: 'CH_AUTO_HIGH', targetCount: 100 },
        { dbManager }
      );
      assert.ok(highRes.totalBeats <= 6);
    });

    it('4.10 PlanSceneBeats: should support forceReplan to replace existing draft beats', async () => {
      await BeatCommands.handlePlanSceneBeats(
        { chapterId: 'CH_AUTO_REPLAN', targetCount: 4 },
        { dbManager }
      );
      let beats = dbManager.beats.findByChapterId('CH_AUTO_REPLAN');
      assert.equal(beats.length, 4);

      await BeatCommands.handlePlanSceneBeats(
        { chapterId: 'CH_AUTO_REPLAN', targetCount: 2, forceReplan: true },
        { dbManager }
      );
      beats = dbManager.beats.findByChapterId('CH_AUTO_REPLAN');
      assert.equal(beats.length, 2);
    });

    it('4.11 BeatCommands: should support flexible calling signatures (dbManager, params) and (params, context)', async () => {
      // Calling as handlePlanSceneBeats(dbManager, params)
      const res = await BeatCommands.handlePlanSceneBeats(
        dbManager,
        { chapterId: 'CH_SIG_TEST', targetCount: 3 }
      );
      assert.equal(res.status, 'success');
      assert.equal(res.totalBeats, 3);

      // Calling handleGetSceneBeats(dbManager, params)
      const getRes = await BeatCommands.handleGetSceneBeats(
        dbManager,
        { chapterId: 'CH_SIG_TEST' }
      );
      assert.equal(getRes.status, 'success');
      assert.equal(getRes.totalBeats, 3);

      // Calling verifyChapterCompositionGate(chapterId, dbManager)
      assert.throws(
        () => BeatCommands.verifyChapterCompositionGate('CH_SIG_TEST', dbManager),
        /COMPOSITION_BLOCKED_UNCONFIRMED_BEATS/
      );
    });
  });

  // =========================================================================
  // Suite 5: Chapter Composition Gate Enforcement
  // =========================================================================
  describe('Suite 5: Chapter Composition Gate Enforcement', () => {
    it('5.1 should throw CHAPTER_BEATS_EMPTY if chapter has 0 planned beats', () => {
      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, 'NON_EXISTENT_CH');
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'CHAPTER_BEATS_EMPTY');
          return true;
        }
      );
    });

    it('5.2 should throw COMPOSITION_BLOCKED_UNCONFIRMED_BEATS when any beat is still draft', async () => {
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_GATE_TEST',
          beats: [
            { beatId: 'G_BEAT_1', sceneGoal: 'Goal 1' },
            { beatId: 'G_BEAT_2', sceneGoal: 'Goal 2' }
          ]
        },
        { dbManager }
      );

      // Only confirm beat 1
      await BeatCommands.handleConfirmSceneBeats(
        { chapterId: 'CH_GATE_TEST', beatIds: ['G_BEAT_1'] },
        { dbManager }
      );

      // Verify gate blocks composition
      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, 'CH_GATE_TEST');
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.ok(err.message.includes('G_BEAT_2'));
          assert.equal(err.details.unconfirmedCount, 1);
          assert.deepEqual(err.details.unconfirmedBeatIds, ['G_BEAT_2']);
          return true;
        }
      );
    });

    it('5.3 should pass gate check when all beats in chapter are confirmed or beyond', async () => {
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_GATE_PASS',
          beats: [
            { beatId: 'PASS_1', sceneGoal: 'Goal 1' },
            { beatId: 'PASS_2', sceneGoal: 'Goal 2' }
          ]
        },
        { dbManager }
      );

      // Confirm all
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_GATE_PASS' }, { dbManager });

      const check = BeatCommands.verifyChapterCompositionGate(dbManager, 'CH_GATE_PASS');
      assert.equal(check.ready, true);
      assert.equal(check.chapterId, 'CH_GATE_PASS');
      assert.equal(check.totalBeats, 2);

      // Advance one beat to expanded and one to revised
      dbManager.beats.update('PASS_1', { status: 'expanded' });
      dbManager.beats.update('PASS_2', { status: 'expanded' });
      dbManager.beats.update('PASS_2', { status: 'revised' });

      // Both expanded and revised are non-draft, so gate still passes
      const check2 = BeatCommands.verifyChapterCompositionGate(dbManager, 'CH_GATE_PASS');
      assert.equal(check2.ready, true);
    });
  });

  // =========================================================================
  // Suite 6: CommandDispatcher Routing & Manifest Compatibility
  // =========================================================================
  describe('Suite 6: CommandDispatcher Routing & Manifest Compatibility', () => {
    it('6.1 should dispatch all 5 beat commands via CommandDispatcher', async () => {
      // 1. PlanSceneBeats
      const planRes = await dispatcher.dispatch('PlanSceneBeats', {
        chapterId: 'DISPATCH_CH',
        beats: [
          { beatId: 'DSP_1', sceneGoal: 'Dispatch Goal 1', title: 'Step 1' },
          { beatId: 'DSP_2', sceneGoal: 'Dispatch Goal 2', title: 'Step 2' }
        ]
      });
      assert.equal(planRes.status, 'success');
      assert.equal(planRes.totalBeats, 2);

      // 2. GetSceneBeats
      const getRes = await dispatcher.dispatch('GetSceneBeats', { chapterId: 'DISPATCH_CH' });
      assert.equal(getRes.status, 'success');
      assert.equal(getRes.allConfirmed, false);

      // 3. UpdateSceneBeat
      const updateRes = await dispatcher.dispatch('UpdateSceneBeat', {
        beatId: 'DSP_1',
        updates: { emotionalTone: 'mysterious' }
      });
      assert.equal(updateRes.status, 'success');
      assert.equal(updateRes.beat.emotional_tone, 'mysterious');

      // 4. ReorderSceneBeats
      const reorderRes = await dispatcher.dispatch('ReorderSceneBeats', {
        chapterId: 'DISPATCH_CH',
        orderedBeatIds: ['DSP_2', 'DSP_1']
      });
      assert.equal(reorderRes.status, 'success');
      assert.equal(reorderRes.beats[0].beat_id, 'DSP_2');

      // 5. ConfirmSceneBeats
      const confirmRes = await dispatcher.dispatch('ConfirmSceneBeats', { chapterId: 'DISPATCH_CH' });
      assert.equal(confirmRes.status, 'success');
      assert.equal(confirmRes.allConfirmed, true);
    });

    it('6.2 should include all 5 beat commands in help output', async () => {
      const help = await dispatcher.dispatch('help');
      assert.ok(help.availableCommands.includes('PlanSceneBeats'));
      assert.ok(help.availableCommands.includes('GetSceneBeats'));
      assert.ok(help.availableCommands.includes('UpdateSceneBeat'));
      assert.ok(help.availableCommands.includes('ReorderSceneBeats'));
      assert.ok(help.availableCommands.includes('ConfirmSceneBeats'));
    });
  });

  // =========================================================================
  // Suite 7: Challenger 2 Adversarial Stress Tests: Status Lifecycle & Composition Gate
  // =========================================================================
  describe('Suite 7: Challenger 2 Adversarial Stress Tests: Status Lifecycle & Composition Gate', () => {
    it('7.1 should reject illegal status strings (completed, published, invalid, archived) on insert and update', () => {
      const illegalStatuses = ['completed', 'published', 'invalid', 'archived', 'pending', 'unknown'];

      for (const badStatus of illegalStatuses) {
        // Insert with illegal status
        assert.throws(
          () => {
            dbManager.beats.insert({
              beat_id: `BEAT_BAD_${badStatus}`,
              chapter_id: 'CH_BAD_STATUS',
              beat_order: 1,
              scene_goal: 'Goal for bad status test',
              status: badStatus
            });
          },
          (err) => {
            assert.ok(err instanceof NovelError);
            assert.equal(err.code, 'INVALID_BEAT_STATUS');
            return true;
          },
          `Expected INVALID_BEAT_STATUS on insert with status: ${badStatus}`
        );
      }

      // Create a valid beat in draft
      dbManager.beats.insert({
        beat_id: 'BEAT_CH7_01',
        chapter_id: 'CH_CH7_01',
        beat_order: 1,
        scene_goal: 'Testing illegal update'
      });

      for (const badStatus of illegalStatuses) {
        // Update with illegal status
        assert.throws(
          () => {
            dbManager.beats.update('BEAT_CH7_01', { status: badStatus });
          },
          (err) => {
            assert.ok(err instanceof NovelError);
            assert.equal(err.code, 'INVALID_BEAT_STATUS');
            return true;
          },
          `Expected INVALID_BEAT_STATUS on update with status: ${badStatus}`
        );
      }
    });

    it('7.2 should reject invalid lifecycle skips (draft -> expanded, draft -> revised, confirmed -> revised)', () => {
      dbManager.beats.insert({
        beat_id: 'BEAT_CH7_SKIP',
        chapter_id: 'CH_CH7_SKIP',
        beat_order: 1,
        scene_goal: 'Testing invalid skip transitions'
      });

      // draft -> expanded (direct skip)
      assert.throws(
        () => {
          dbManager.beats.update('BEAT_CH7_SKIP', { status: 'expanded' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          assert.equal(err.details.currentStatus, 'draft');
          assert.equal(err.details.candidateStatus, 'expanded');
          return true;
        }
      );

      // draft -> revised (direct skip)
      assert.throws(
        () => {
          dbManager.beats.update('BEAT_CH7_SKIP', { status: 'revised' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          assert.equal(err.details.currentStatus, 'draft');
          assert.equal(err.details.candidateStatus, 'revised');
          return true;
        }
      );

      // Advance to confirmed
      dbManager.beats.update('BEAT_CH7_SKIP', { status: 'confirmed' });

      // confirmed -> revised (skip expanded)
      assert.throws(
        () => {
          dbManager.beats.update('BEAT_CH7_SKIP', { status: 'revised' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          assert.equal(err.details.currentStatus, 'confirmed');
          assert.equal(err.details.candidateStatus, 'revised');
          return true;
        }
      );

      // Advance to expanded
      dbManager.beats.update('BEAT_CH7_SKIP', { status: 'expanded' });

      // expanded -> confirmed (backwards transition without resetStatus)
      assert.throws(
        () => {
          dbManager.beats.update('BEAT_CH7_SKIP', { status: 'confirmed' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          return true;
        }
      );
    });

    it('7.3 should successfully execute full progression and resetStatus demotion from confirmed and expanded back to draft', () => {
      dbManager.beats.insert({
        beat_id: 'BEAT_CH7_LIFECYCLE',
        chapter_id: 'CH_CH7_LIFECYCLE',
        beat_order: 1,
        scene_goal: 'Full lifecycle and reset testing'
      });

      // 1. draft (v1) -> confirmed (v2)
      let b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'confirmed' });
      assert.equal(b.status, 'confirmed');
      assert.equal(b.version, 2);

      // Test resetStatus from confirmed -> draft
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { resetStatus: true });
      assert.equal(b.status, 'draft');
      assert.equal(b.version, 3);

      // Re-confirm: draft (v3) -> confirmed (v4)
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'confirmed' });
      assert.equal(b.status, 'confirmed');
      assert.equal(b.version, 4);

      // confirmed (v4) -> expanded (v5)
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'expanded', content: 'Expanded content' });
      assert.equal(b.status, 'expanded');
      assert.equal(b.version, 5);

      // Test resetStatus from expanded -> draft
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { resetStatus: true });
      assert.equal(b.status, 'draft');
      assert.equal(b.version, 6);

      // Verify that after reset, direct skip to expanded is blocked again
      assert.throws(
        () => {
          dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'expanded' });
        },
        /INVALID_BEAT_STATUS_TRANSITION/
      );

      // Re-advance all the way: draft -> confirmed -> expanded -> revised
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'confirmed' });
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'expanded' });
      b = dbManager.beats.update('BEAT_CH7_LIFECYCLE', { status: 'revised', content: 'Final polished' });
      assert.equal(b.status, 'revised');
      assert.equal(b.version, 9);
    });

    it('7.4 Composition Gate: 5 beats in chapter, 4 confirmed, 1 draft -> MUST reject with COMPOSITION_BLOCKED_UNCONFIRMED_BEATS and identify unconfirmed beat', async () => {
      const chId = 'CH_GATE_5_SCENARIO';

      // 1. Plan 5 beats
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: chId,
          beats: [
            { beatId: 'B5_1', sceneGoal: 'Scene 1: Scout ahead' },
            { beatId: 'B5_2', sceneGoal: 'Scene 2: Infiltrate base' },
            { beatId: 'B5_3', sceneGoal: 'Scene 3: Steal documents' }, // will leave draft
            { beatId: 'B5_4', sceneGoal: 'Scene 4: Trigger alarm' },
            { beatId: 'B5_5', sceneGoal: 'Scene 5: Escape via rooftop' }
          ]
        },
        { dbManager }
      );

      // 2. Confirm 4 of 5 beats (1, 2, 4, 5), leaving B5_3 as draft
      await BeatCommands.handleConfirmSceneBeats(
        { chapterId: chId, beatIds: ['B5_1', 'B5_2', 'B5_4', 'B5_5'] },
        { dbManager }
      );

      // Verify DB beat states
      const beats = dbManager.beats.findByChapterId(chId);
      assert.equal(beats.length, 5);
      assert.equal(beats[0].status, 'confirmed');
      assert.equal(beats[1].status, 'confirmed');
      assert.equal(beats[2].status, 'draft'); // B5_3
      assert.equal(beats[3].status, 'confirmed');
      assert.equal(beats[4].status, 'confirmed');

      // 3. Call verifyChapterCompositionGate -> MUST throw COMPOSITION_BLOCKED_UNCONFIRMED_BEATS
      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, chId);
        },
        (err) => {
          assert.ok(err instanceof NovelError, 'Must be NovelError');
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.equal(err.details.chapterId, chId);
          assert.equal(err.details.unconfirmedCount, 1);
          assert.deepEqual(err.details.unconfirmedBeatIds, ['B5_3']);
          assert.ok(err.message.includes('B5_3'), 'Error message must identify unconfirmed beat');
          return true;
        }
      );
    });

    it('7.5 Composition Gate: 0 beats in chapter -> MUST reject with CHAPTER_BEATS_EMPTY', () => {
      const emptyChId = 'CH_ZERO_BEATS_EMPTY';

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, emptyChId);
        },
        (err) => {
          assert.ok(err instanceof NovelError, 'Must be NovelError');
          assert.equal(err.code, 'CHAPTER_BEATS_EMPTY');
          assert.equal(err.details.chapterId, emptyChId);
          assert.ok(err.message.includes('No scene beats found'));
          return true;
        }
      );
    });

    it('7.6 Composition Gate: All 5 confirmed -> Gate passes cleanly', async () => {
      const chAll = 'CH_GATE_ALL_5_CONF';

      // 1. Plan 5 beats
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: chAll,
          beats: [
            { beatId: 'ALL5_1', sceneGoal: 'Goal 1' },
            { beatId: 'ALL5_2', sceneGoal: 'Goal 2' },
            { beatId: 'ALL5_3', sceneGoal: 'Goal 3' },
            { beatId: 'ALL5_4', sceneGoal: 'Goal 4' },
            { beatId: 'ALL5_5', sceneGoal: 'Goal 5' }
          ]
        },
        { dbManager }
      );

      // 2. Confirm all 5 beats
      const confirmRes = await BeatCommands.handleConfirmSceneBeats(
        { chapterId: chAll },
        { dbManager }
      );
      assert.equal(confirmRes.confirmedCount, 5);
      assert.equal(confirmRes.allConfirmed, true);

      // 3. Gate verification MUST pass
      const gateRes = BeatCommands.verifyChapterCompositionGate(dbManager, chAll);
      assert.ok(gateRes);
      assert.equal(gateRes.ready, true);
      assert.equal(gateRes.chapterId, chAll);
      assert.equal(gateRes.totalBeats, 5);
    });

    it('7.7 Composition Gate: Mixed advanced states (confirmed, expanded, revised) pass, then resetStatus demotion immediately blocks gate', async () => {
      const chMixed = 'CH_GATE_MIXED_ADVANCED';

      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: chMixed,
          beats: [
            { beatId: 'ADV_1', sceneGoal: 'Goal 1' },
            { beatId: 'ADV_2', sceneGoal: 'Goal 2' },
            { beatId: 'ADV_3', sceneGoal: 'Goal 3' },
            { beatId: 'ADV_4', sceneGoal: 'Goal 4' },
            { beatId: 'ADV_5', sceneGoal: 'Goal 5' }
          ]
        },
        { dbManager }
      );

      // Confirm all 5
      await BeatCommands.handleConfirmSceneBeats({ chapterId: chMixed }, { dbManager });

      // Progress beats: ADV_2 to expanded, ADV_3 to revised, ADV_4 to expanded, ADV_5 to revised
      dbManager.beats.update('ADV_2', { status: 'expanded' });
      dbManager.beats.update('ADV_3', { status: 'expanded' });
      dbManager.beats.update('ADV_3', { status: 'revised' });
      dbManager.beats.update('ADV_4', { status: 'expanded' });
      dbManager.beats.update('ADV_5', { status: 'expanded' });
      dbManager.beats.update('ADV_5', { status: 'revised' });

      // Gate passes because all beats are in valid non-draft states
      const passResult = BeatCommands.verifyChapterCompositionGate(dbManager, chMixed);
      assert.equal(passResult.ready, true);
      assert.equal(passResult.totalBeats, 5);

      // Adversarial mutation: demote ADV_3 back to draft via resetStatus
      dbManager.beats.update('ADV_3', { resetStatus: true });

      // Gate must now immediately block and identify ADV_3
      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, chMixed);
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.equal(err.details.unconfirmedCount, 1);
          assert.deepEqual(err.details.unconfirmedBeatIds, ['ADV_3']);
          return true;
        }
      );
    });

    it('7.8 Composition Gate: Parameter boundary validation (null dbManager, empty chapterId)', () => {
      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(null, 'CH001');
        },
        /DB_MANAGER_REQUIRED/
      );

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, '');
        },
        /MISSING_CHAPTER_ID/
      );

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, '   ');
        },
        /MISSING_CHAPTER_ID/
      );
    });
  });

  // =========================================================================
  // Suite 8: Challenger 1 Adversarial Stress Tests: Beat Reordering & Concurrency/Invariant Safety
  // =========================================================================
  describe('Suite 8: Challenger 1 Adversarial Stress Tests: Beat Reordering & Invariant Safety', () => {
    it('8.1 should safely swap adjacent beats (1 <-> 2) with monotonic version increments and no UNIQUE collision', async () => {
      const chapterId = 'CH_CH1_SWAP_01';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [
            { beatId: 'B_SWAP_1', sceneGoal: 'Goal 1', title: 'Beat 1' },
            { beatId: 'B_SWAP_2', sceneGoal: 'Goal 2', title: 'Beat 2' },
            { beatId: 'B_SWAP_3', sceneGoal: 'Goal 3', title: 'Beat 3' }
          ]
        },
        { dbManager }
      );

      // Verify initial state
      let beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats[0].beat_id, 'B_SWAP_1');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[0].version, 1);
      assert.equal(beats[1].beat_id, 'B_SWAP_2');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[1].version, 1);
      assert.equal(beats[2].beat_id, 'B_SWAP_3');
      assert.equal(beats[2].beat_order, 3);
      assert.equal(beats[2].version, 1);

      // Reorder: Swap 1 <-> 2: ['B_SWAP_2', 'B_SWAP_1', 'B_SWAP_3']
      const swapRes = await BeatCommands.handleReorderSceneBeats(
        {
          chapterId,
          orderedBeatIds: ['B_SWAP_2', 'B_SWAP_1', 'B_SWAP_3']
        },
        { dbManager }
      );

      assert.equal(swapRes.status, 'success');
      beats = dbManager.beats.findByChapterId(chapterId);

      // Assert contiguous 1, 2, 3 orders
      assert.equal(beats.length, 3);
      assert.equal(beats[0].beat_id, 'B_SWAP_2');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[0].version, 2);

      assert.equal(beats[1].beat_id, 'B_SWAP_1');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[1].version, 2);

      assert.equal(beats[2].beat_id, 'B_SWAP_3');
      assert.equal(beats[2].beat_order, 3);
      assert.equal(beats[2].version, 2);
    });

    it('8.2 should invert a 10-beat list completely without UNIQUE constraint failure', async () => {
      const chapterId = 'CH_CH1_INV_10';
      const initialBeats = [];
      const originalIds = [];
      for (let i = 1; i <= 10; i++) {
        const id = `B_INV_${String(i).padStart(2, '0')}`;
        originalIds.push(id);
        initialBeats.push({
          beatId: id,
          sceneGoal: `Inversion Goal ${i}`,
          title: `Scene ${i}`
        });
      }

      await BeatCommands.handlePlanSceneBeats({ chapterId, beats: initialBeats }, { dbManager });

      // Invert the list: [10, 9, 8, ... 1]
      const reversedIds = [...originalIds].reverse();
      const res = await BeatCommands.handleReorderSceneBeats(
        { chapterId, orderedBeatIds: reversedIds },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.beats.length, 10);

      const dbBeats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(dbBeats.length, 10);

      for (let i = 0; i < 10; i++) {
        assert.equal(dbBeats[i].beat_id, reversedIds[i]);
        assert.equal(dbBeats[i].beat_order, i + 1);
        assert.equal(dbBeats[i].version, 2);
      }
    });

    it('8.3 should invert a 50-beat large-scale list cleanly with contiguous orders', async () => {
      const chapterId = 'CH_CH1_INV_50';
      const initialBeats = [];
      const originalIds = [];
      for (let i = 1; i <= 50; i++) {
        const id = `B_L50_${String(i).padStart(3, '0')}`;
        originalIds.push(id);
        initialBeats.push({
          beatId: id,
          sceneGoal: `Scale Goal ${i}`,
          title: `Scale Scene ${i}`
        });
      }

      await BeatCommands.handlePlanSceneBeats({ chapterId, beats: initialBeats }, { dbManager });

      const reversedIds = [...originalIds].reverse();
      const res = await BeatCommands.handleReorderSceneBeats(
        { chapterId, orderedBeatIds: reversedIds },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.beats.length, 50);

      const dbBeats = dbManager.beats.findByChapterId(chapterId);
      for (let i = 0; i < 50; i++) {
        assert.equal(dbBeats[i].beat_id, reversedIds[i]);
        assert.equal(dbBeats[i].beat_order, i + 1);
        assert.equal(dbBeats[i].version, 2);
      }
    });

    it('8.4 should endure 100 consecutive random shuffles with contiguous ordering and monotonic version increments', async () => {
      const chapterId = 'CH_CH1_SHUF_100';
      const initialBeats = [];
      const beatIds = [];
      const count = 10;
      for (let i = 1; i <= count; i++) {
        const id = `B_SHUF_${i}`;
        beatIds.push(id);
        initialBeats.push({
          beatId: id,
          sceneGoal: `Shuffle Goal ${i}`,
          title: `Shuffle Beat ${i}`
        });
      }

      await BeatCommands.handlePlanSceneBeats({ chapterId, beats: initialBeats }, { dbManager });

      let seed = 123456789;
      function pseudoRandom() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      }

      function shuffle(arr) {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(pseudoRandom() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
      }

      let currentIds = [...beatIds];
      const totalRounds = 100;

      for (let round = 1; round <= totalRounds; round++) {
        currentIds = shuffle(currentIds);

        const res = await BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: currentIds },
          { dbManager }
        );

        assert.equal(res.status, 'success');

        const dbBeats = dbManager.beats.findByChapterId(chapterId);
        assert.equal(dbBeats.length, count);

        for (let i = 0; i < count; i++) {
          assert.equal(dbBeats[i].beat_id, currentIds[i], `Round ${round}: beat at slot ${i} mismatch`);
          assert.equal(dbBeats[i].beat_order, i + 1, `Round ${round}: beat_order must be ${i + 1}`);
          assert.equal(dbBeats[i].version, round + 1, `Round ${round}: version must be ${round + 1}`);
        }
      }

      const negativeBeats = dbManager.db.prepare(
        'SELECT * FROM chapter_beats WHERE chapter_id = ? AND beat_order < 0'
      ).all(chapterId);
      assert.equal(negativeBeats.length, 0, 'No negative beat_order should remain after shuffles');
    });

    it('8.5 should reject duplicate beat IDs in orderedBeatIds with DUPLICATE_BEAT_REORDER_IDS and preserve original state', async () => {
      const chapterId = 'CH_CH1_DUP_TEST';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [
            { beatId: 'B_D_1', sceneGoal: 'Goal 1' },
            { beatId: 'B_D_2', sceneGoal: 'Goal 2' },
            { beatId: 'B_D_3', sceneGoal: 'Goal 3' }
          ]
        },
        { dbManager }
      );

      const duplicateList = ['B_D_1', 'B_D_1', 'B_D_2'];

      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: duplicateList },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'DUPLICATE_BEAT_REORDER_IDS');
          return true;
        }
      );

      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats[0].beat_id, 'B_D_1');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[0].version, 1);
      assert.equal(beats[1].beat_id, 'B_D_2');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[1].version, 1);
      assert.equal(beats[2].beat_id, 'B_D_3');
      assert.equal(beats[2].beat_order, 3);
      assert.equal(beats[2].version, 1);
    });

    it('8.6 should reject missing beat IDs in orderedBeatIds with BEAT_REORDER_COUNT_MISMATCH', async () => {
      const chapterId = 'CH_CH1_MISS_TEST';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [
            { beatId: 'B_M_1', sceneGoal: 'Goal 1' },
            { beatId: 'B_M_2', sceneGoal: 'Goal 2' },
            { beatId: 'B_M_3', sceneGoal: 'Goal 3' }
          ]
        },
        { dbManager }
      );

      const missingList = ['B_M_2', 'B_M_1'];

      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: missingList },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'BEAT_REORDER_COUNT_MISMATCH');
          return true;
        }
      );

      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats.length, 3);
      assert.equal(beats[0].beat_id, 'B_M_1');
      assert.equal(beats[0].version, 1);
    });

    it('8.7 should reject foreign beat IDs belonging to another chapter with BEAT_NOT_IN_CHAPTER', async () => {
      const chapterId = 'CH_CH1_MAIN';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [
            { beatId: 'B_MAIN_1', sceneGoal: 'Goal 1' },
            { beatId: 'B_MAIN_2', sceneGoal: 'Goal 2' }
          ]
        },
        { dbManager }
      );

      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_CH1_FOREIGN',
          beats: [{ beatId: 'B_FOR_1', sceneGoal: 'Foreign Goal' }]
        },
        { dbManager }
      );

      const crossChapterList = ['B_MAIN_1', 'B_FOR_1'];

      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: crossChapterList },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'BEAT_NOT_IN_CHAPTER');
          assert.equal(err.details.beatId, 'B_FOR_1');
          return true;
        }
      );

      const mainBeats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(mainBeats.length, 2);
      assert.equal(mainBeats[0].version, 1);
    });

    it('8.8 should reject empty or non-array orderedBeatIds across command and repository layers', async () => {
      const chapterId = 'CH_CH1_EMPTY_TEST';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [{ beatId: 'B_E_1', sceneGoal: 'Goal 1' }]
        },
        { dbManager }
      );

      // ReorderSceneBeats empty array
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats({ chapterId, orderedBeatIds: [] }, { dbManager }),
        /INVALID_ORDERED_BEAT_IDS/
      );

      // ReorderSceneBeats null
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats({ chapterId, orderedBeatIds: null }, { dbManager }),
        /INVALID_ORDERED_BEAT_IDS/
      );

      // BeatRepo.updateOrder empty array
      assert.throws(
        () => dbManager.beats.updateOrder(chapterId, []),
        /INVALID_BEAT_ORDER_PARAM/
      );

      // BeatRepo.updateOrder null
      assert.throws(
        () => dbManager.beats.updateOrder(chapterId, null),
        /INVALID_BEAT_ORDER_PARAM/
      );
    });

    it('8.9 should completely roll back transaction and prevent negative order leak if database error occurs', () => {
      const chapterId = 'CH_CH1_ROLLBACK';
      dbManager.beats.insert({ beat_id: 'B_RB_1', chapter_id: chapterId, beat_order: 1, scene_goal: 'G1' });
      dbManager.beats.insert({ beat_id: 'B_RB_2', chapter_id: chapterId, beat_order: 2, scene_goal: 'G2' });

      // Direct call with collision triggers SQLite UNIQUE constraint failure
      assert.throws(
        () => {
          dbManager.beats.updateOrder(chapterId, ['B_RB_1', 'B_RB_1']);
        },
        /UNIQUE constraint failed/
      );

      // Verify that transaction rolled back completely: no negative orders leak
      const negBeats = dbManager.db.prepare('SELECT * FROM chapter_beats WHERE beat_order < 0').all();
      assert.equal(negBeats.length, 0, 'No negative temporary orders must leak on rollback');

      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats[0].beat_id, 'B_RB_1');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[0].version, 1);
      assert.equal(beats[1].beat_id, 'B_RB_2');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[1].version, 1);
    });

    it('8.10 should preserve all rich metadata, status lifecycle, and content during reorders', async () => {
      const chapterId = 'CH_CH1_META';
      const richBeat1 = {
        beatId: 'BM_1',
        sceneGoal: 'Goal Alpha',
        title: 'Title Alpha',
        conflict: 'Severe Storm',
        characters: ['CHAR_HERO'],
        location: 'Mountain Top',
        worldRules: ['AXIOM_GRAVITY'],
        debtAction: { action: 'accrue', debtId: 'DEBT_1' },
        emotionalTone: 'solemn'
      };
      const richBeat2 = {
        beatId: 'BM_2',
        sceneGoal: 'Goal Beta',
        title: 'Title Beta',
        conflict: 'Internal Doubt',
        characters: ['CHAR_SAGE'],
        location: 'Cave',
        worldRules: ['AXIOM_MAGIC'],
        debtAction: { action: 'pay', debtId: 'DEBT_2' },
        emotionalTone: 'triumphant'
      };

      await BeatCommands.handlePlanSceneBeats({ chapterId, beats: [richBeat1, richBeat2] }, { dbManager });

      await BeatCommands.handleConfirmSceneBeats({ chapterId, beatIds: ['BM_1'] }, { dbManager });
      dbManager.beats.update('BM_1', { status: 'expanded', content: 'Expanded prose text' });
      await BeatCommands.handleConfirmSceneBeats({ chapterId, beatIds: ['BM_2'] }, { dbManager });

      await BeatCommands.handleReorderSceneBeats(
        { chapterId, orderedBeatIds: ['BM_2', 'BM_1'] },
        { dbManager }
      );

      const refreshed = dbManager.beats.findByChapterId(chapterId);

      assert.equal(refreshed[0].beat_id, 'BM_2');
      assert.equal(refreshed[0].beat_order, 1);
      assert.equal(refreshed[0].status, 'confirmed');
      assert.equal(refreshed[0].title, 'Title Beta');
      assert.equal(refreshed[0].scene_goal, 'Goal Beta');
      assert.equal(refreshed[0].conflict, 'Internal Doubt');
      assert.deepEqual(JSON.parse(refreshed[0].characters_json), ['CHAR_SAGE']);
      assert.equal(refreshed[0].location, 'Cave');
      assert.deepEqual(JSON.parse(refreshed[0].world_rules_json), ['AXIOM_MAGIC']);
      assert.deepEqual(JSON.parse(refreshed[0].debt_action_json), { action: 'pay', debtId: 'DEBT_2' });
      assert.equal(refreshed[0].emotional_tone, 'triumphant');

      assert.equal(refreshed[1].beat_id, 'BM_1');
      assert.equal(refreshed[1].beat_order, 2);
      assert.equal(refreshed[1].status, 'expanded');
      assert.equal(refreshed[1].content, 'Expanded prose text');
      assert.equal(refreshed[1].title, 'Title Alpha');
    });
  });
});
