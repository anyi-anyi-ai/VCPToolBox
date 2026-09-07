/**
 * @file m1_challenger2_beat_lifecycle.test.js
 * @description Adversarial empirical stress tests for Milestone 1:
 * Beat Status Lifecycle Progression & Composition Gating.
 * Tested by Challenger 2.
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DatabaseManager = require('../../src/db/DatabaseManager');
const BeatCommands = require('../../src/commands/BeatCommands');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const { NovelError } = require('../../src/errors');

describe('Challenger 2 Empirical Challenge: Beat Status Lifecycle & Composition Gate', () => {
  let dbManager = null;
  let dispatcher = null;
  let tempDir = null;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'challenger2_beats_'));
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
  // Challenge 1: Invalid Beat Status Transitions
  // =========================================================================
  describe('Challenge 1: Invalid Status Transitions & Illegal Status Strings', () => {
    const chapterId = 'CH_CHALLENGE_INV';
    const beatId = 'BEAT_INV_01';

    beforeEach(() => {
      dbManager.beats.insert({
        beat_id: beatId,
        chapter_id: chapterId,
        beat_order: 1,
        title: '初始草稿节拍',
        scene_goal: '测试非法状态跃迁拦截'
      });
    });

    it('1.1 should fail with INVALID_BEAT_STATUS_TRANSITION when attempting draft -> expanded directly', () => {
      // BeatRepo direct call
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'expanded' });
        },
        (err) => {
          assert.ok(err instanceof NovelError, 'Error must be instance of NovelError');
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          assert.equal(err.details.currentStatus, 'draft');
          assert.equal(err.details.candidateStatus, 'expanded');
          return true;
        }
      );

      // Verify status in DB was NOT mutated
      const beat = dbManager.beats.findByBeatId(beatId);
      assert.equal(beat.status, 'draft');
      assert.equal(beat.version, 1);
    });

    it('1.2 should fail with INVALID_BEAT_STATUS_TRANSITION when attempting draft -> revised directly', () => {
      // BeatRepo direct call
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'revised' });
        },
        (err) => {
          assert.ok(err instanceof NovelError, 'Error must be instance of NovelError');
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          assert.equal(err.details.currentStatus, 'draft');
          assert.equal(err.details.candidateStatus, 'revised');
          return true;
        }
      );

      const beat = dbManager.beats.findByBeatId(beatId);
      assert.equal(beat.status, 'draft');
      assert.equal(beat.version, 1);
    });

    it('1.3 should fail with INVALID_BEAT_STATUS on illegal status strings (completed, published, invalid, etc.)', () => {
      const illegalStatuses = ['completed', 'published', 'invalid', 'archived', 'pending', 'DELETED', 'null'];

      for (const badStatus of illegalStatuses) {
        // Attempt update via BeatRepo
        assert.throws(
          () => {
            dbManager.beats.update(beatId, { status: badStatus });
          },
          (err) => {
            assert.ok(err instanceof NovelError, `Expected NovelError for status "${badStatus}"`);
            assert.equal(err.code, 'INVALID_BEAT_STATUS');
            return true;
          },
          `Expected rejection for illegal status: ${badStatus}`
        );

        // Attempt insert via BeatRepo with illegal status
        assert.throws(
          () => {
            dbManager.beats.insert({
              beat_id: `BEAT_BAD_${badStatus}`,
              chapter_id: chapterId,
              beat_order: 99,
              scene_goal: 'Illegal insert test',
              status: badStatus
            });
          },
          (err) => {
            assert.ok(err instanceof NovelError);
            assert.equal(err.code, 'INVALID_BEAT_STATUS');
            return true;
          }
        );
      }
    });

    it('1.4 should reject confirmed -> revised skip (skipping expanded)', () => {
      // Progress to confirmed first
      dbManager.beats.update(beatId, { status: 'confirmed' });

      // Attempt jump from confirmed to revised
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'revised' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          assert.equal(err.details.currentStatus, 'confirmed');
          assert.equal(err.details.candidateStatus, 'revised');
          return true;
        }
      );
    });

    it('1.5 should reject backwards transitions without resetStatus (expanded -> confirmed, revised -> confirmed)', () => {
      // Progress draft -> confirmed -> expanded
      dbManager.beats.update(beatId, { status: 'confirmed' });
      dbManager.beats.update(beatId, { status: 'expanded' });

      // Attempt expanded -> confirmed
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'confirmed' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          return true;
        }
      );

      // Progress expanded -> revised
      dbManager.beats.update(beatId, { status: 'revised' });

      // Attempt revised -> confirmed
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'confirmed' });
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          return true;
        }
      );
    });

    it('1.6 should reject invalid transitions through BeatCommands and CommandDispatcher', async () => {
      // Via BeatCommands.handleUpdateSceneBeat
      await assert.rejects(
        () => BeatCommands.handleUpdateSceneBeat(
          { beatId, updates: { status: 'expanded' } },
          { dbManager }
        ),
        (err) => {
          assert.equal(err.code, 'INVALID_BEAT_STATUS_TRANSITION');
          return true;
        }
      );

      // Via CommandDispatcher dispatch
      await assert.rejects(
        () => dispatcher.dispatch('UpdateSceneBeat', {
          beatId,
          updates: { status: 'published' }
        }),
        (err) => {
          assert.equal(err.code, 'INVALID_BEAT_STATUS');
          return true;
        }
      );
    });
  });

  // =========================================================================
  // Challenge 2: Valid Beat Status Progression & Demotion via resetStatus
  // =========================================================================
  describe('Challenge 2: Valid Status Transitions & resetStatus Semantics', () => {
    const chapterId = 'CH_CHALLENGE_VAL';
    const beatId = 'BEAT_VAL_01';

    beforeEach(() => {
      dbManager.beats.insert({
        beat_id: beatId,
        chapter_id: chapterId,
        beat_order: 1,
        title: '渐进测试节拍',
        scene_goal: '验证完整生命周期与单调递增版本'
      });
    });

    it('2.1 should smoothly execute full progression: draft -> confirmed -> expanded -> revised', () => {
      // 0. draft initial
      const initial = dbManager.beats.findByBeatId(beatId);
      assert.equal(initial.status, 'draft');
      assert.equal(initial.version, 1);

      // 1. draft -> confirmed
      const step1 = dbManager.beats.update(beatId, { status: 'confirmed' });
      assert.equal(step1.status, 'confirmed');
      assert.equal(step1.version, 2);

      // 2. confirmed -> expanded
      const step2 = dbManager.beats.update(beatId, { status: 'expanded', content: '初稿正文内容' });
      assert.equal(step2.status, 'expanded');
      assert.equal(step2.content, '初稿正文内容');
      assert.equal(step2.version, 3);

      // 3. expanded -> revised
      const step3 = dbManager.beats.update(beatId, { status: 'revised', content: '精修后正文内容' });
      assert.equal(step3.status, 'revised');
      assert.equal(step3.content, '精修后正文内容');
      assert.equal(step3.version, 4);

      // 4. revised -> revised (idempotent surgical polishing)
      const step4 = dbManager.beats.update(beatId, { status: 'revised', content: '第二次精修' });
      assert.equal(step4.status, 'revised');
      assert.equal(step4.content, '第二次精修');
      assert.equal(step4.version, 5);

      // 5. revised -> expanded (re-drafting step allowed)
      const step5 = dbManager.beats.update(beatId, { status: 'expanded', content: '重新扩写正文' });
      assert.equal(step5.status, 'expanded');
      assert.equal(step5.version, 6);
    });

    it('2.2 should revert confirmed beat back to draft using resetStatus: true', () => {
      // Progress to confirmed
      const confirmed = dbManager.beats.update(beatId, { status: 'confirmed' });
      assert.equal(confirmed.status, 'confirmed');
      assert.equal(confirmed.version, 2);

      // Reset to draft via BeatRepo
      const reset = dbManager.beats.update(beatId, {
        resetStatus: true,
        scene_goal: '重新规划的目标'
      });
      assert.equal(reset.status, 'draft');
      assert.equal(reset.scene_goal, '重新规划的目标');
      assert.equal(reset.version, 3);

      // Can be confirmed again
      const reconfirmed = dbManager.beats.update(beatId, { status: 'confirmed' });
      assert.equal(reconfirmed.status, 'confirmed');
      assert.equal(reconfirmed.version, 4);
    });

    it('2.3 should revert expanded beat back to draft using resetStatus: true', () => {
      // Progress draft -> confirmed -> expanded
      dbManager.beats.update(beatId, { status: 'confirmed' });
      const exp = dbManager.beats.update(beatId, { status: 'expanded', content: '初稿已就绪' });
      assert.equal(exp.status, 'expanded');

      // Reset to draft
      const reset = dbManager.beats.update(beatId, { resetStatus: true });
      assert.equal(reset.status, 'draft');
      assert.ok(reset.version > exp.version);

      // Verify that after reset, direct jump to expanded is forbidden again
      assert.throws(
        () => {
          dbManager.beats.update(beatId, { status: 'expanded' });
        },
        /INVALID_BEAT_STATUS_TRANSITION/
      );
    });

    it('2.4 should handle resetStatus via BeatCommands.handleUpdateSceneBeat parameter', async () => {
      // Progress to confirmed
      await BeatCommands.handleConfirmSceneBeats({ chapterId }, { dbManager });
      let beat = dbManager.beats.findByBeatId(beatId);
      assert.equal(beat.status, 'confirmed');

      // Call handleUpdateSceneBeat with resetStatus: true
      const res = await BeatCommands.handleUpdateSceneBeat(
        {
          beatId,
          updates: { sceneGoal: '重设场景目标' },
          resetStatus: true
        },
        { dbManager }
      );

      assert.equal(res.status, 'success');
      assert.equal(res.beat.status, 'draft');
      assert.equal(res.beat.scene_goal, '重设场景目标');
    });
  });

  // =========================================================================
  // Challenge 3: Composition Gate Adversarial Verification
  // =========================================================================
  describe('Challenge 3: Chapter Composition Gate Scenarios', () => {
    const chapterId = 'CH_GATE_5BEATS';

    it('3.1 Scenario 1: 5 beats, 4 confirmed, 1 draft -> MUST reject with COMPOSITION_BLOCKED_UNCONFIRMED_BEATS and identify unconfirmed beat', async () => {
      // Plan 5 beats
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [
            { beatId: 'B5_01', sceneGoal: '开场侦查', title: '节拍 1' },
            { beatId: 'B5_02', sceneGoal: '遭遇敌巡逻兵', title: '节拍 2' },
            { beatId: 'B5_03', sceneGoal: '潜入控制室核心', title: '节拍 3' }, // will leave as draft
            { beatId: 'B5_04', sceneGoal: '窃取密钥被发现', title: '节拍 4' },
            { beatId: 'B5_05', sceneGoal: '断后撤离与追逐', title: '节拍 5' }
          ]
        },
        { dbManager }
      );

      // Confirm 4 of the 5 beats (1, 2, 4, 5), leaving B5_03 as draft
      await BeatCommands.handleConfirmSceneBeats(
        { chapterId, beatIds: ['B5_01', 'B5_02', 'B5_04', 'B5_05'] },
        { dbManager }
      );

      // Verify DB statuses
      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats.length, 5);
      assert.equal(beats[0].status, 'confirmed');
      assert.equal(beats[1].status, 'confirmed');
      assert.equal(beats[2].status, 'draft'); // B5_03
      assert.equal(beats[3].status, 'confirmed');
      assert.equal(beats[4].status, 'confirmed');

      // Call gate check -> MUST throw COMPOSITION_BLOCKED_UNCONFIRMED_BEATS
      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, chapterId);
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.equal(err.details.chapterId, chapterId);
          assert.equal(err.details.unconfirmedCount, 1);
          assert.deepEqual(err.details.unconfirmedBeatIds, ['B5_03']);
          assert.ok(err.message.includes('B5_03'), 'Error message must mention B5_03');
          assert.ok(err.message.includes('draft'), 'Error message must mention draft');
          return true;
        }
      );
    });

    it('3.2 Scenario 1 Variation: Position variance of unconfirmed draft beat (first, last, multiple)', async () => {
      const chMulti = 'CH_MULTI_TEST';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: chMulti,
          beats: [
            { beatId: 'MB_01', sceneGoal: 'Goal 1' },
            { beatId: 'MB_02', sceneGoal: 'Goal 2' },
            { beatId: 'MB_03', sceneGoal: 'Goal 3' },
            { beatId: 'MB_04', sceneGoal: 'Goal 4' },
            { beatId: 'MB_05', sceneGoal: 'Goal 5' }
          ]
        },
        { dbManager }
      );

      // Case A: 3 draft, 2 confirmed (MB_02, MB_04 confirmed)
      await BeatCommands.handleConfirmSceneBeats(
        { chapterId: chMulti, beatIds: ['MB_02', 'MB_04'] },
        { dbManager }
      );

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, chMulti);
        },
        (err) => {
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.equal(err.details.unconfirmedCount, 3);
          assert.deepEqual(err.details.unconfirmedBeatIds, ['MB_01', 'MB_03', 'MB_05']);
          return true;
        }
      );

      // Case B: Only last beat is draft (confirm MB_01, MB_03)
      await BeatCommands.handleConfirmSceneBeats(
        { chapterId: chMulti, beatIds: ['MB_01', 'MB_03'] },
        { dbManager }
      );

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, chMulti);
        },
        (err) => {
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.equal(err.details.unconfirmedCount, 1);
          assert.deepEqual(err.details.unconfirmedBeatIds, ['MB_05']);
          return true;
        }
      );
    });

    it('3.3 Scenario 2: 0 beats in chapter -> MUST reject with CHAPTER_BEATS_EMPTY', () => {
      const emptyChapterId = 'CH_COMPLETELY_EMPTY';

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, emptyChapterId);
        },
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'CHAPTER_BEATS_EMPTY');
          assert.equal(err.details.chapterId, emptyChapterId);
          assert.ok(err.message.includes('No scene beats found'));
          return true;
        }
      );
    });

    it('3.4 Scenario 2 Boundaries: Missing chapterId or dbManager -> rejects with appropriate errors', () => {
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

    it('3.5 Scenario 3: All 5 beats confirmed -> Gate passes cleanly', async () => {
      const chAllConf = 'CH_ALL_CONFIRMED';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: chAllConf,
          beats: [
            { beatId: 'AC_01', sceneGoal: 'Goal 1' },
            { beatId: 'AC_02', sceneGoal: 'Goal 2' },
            { beatId: 'AC_03', sceneGoal: 'Goal 3' },
            { beatId: 'AC_04', sceneGoal: 'Goal 4' },
            { beatId: 'AC_05', sceneGoal: 'Goal 5' }
          ]
        },
        { dbManager }
      );

      // Confirm all 5
      const confirmRes = await BeatCommands.handleConfirmSceneBeats(
        { chapterId: chAllConf },
        { dbManager }
      );
      assert.equal(confirmRes.confirmedCount, 5);
      assert.equal(confirmRes.allConfirmed, true);

      // Gate check
      const gateResult = BeatCommands.verifyChapterCompositionGate(dbManager, chAllConf);
      assert.ok(gateResult);
      assert.equal(gateResult.ready, true);
      assert.equal(gateResult.chapterId, chAllConf);
      assert.equal(gateResult.totalBeats, 5);
    });

    it('3.6 Scenario 3 Advanced: Mixed advanced non-draft states (confirmed, expanded, revised) -> Gate passes', async () => {
      const chMixed = 'CH_MIXED_STATES';
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: chMixed,
          beats: [
            { beatId: 'MIX_01', sceneGoal: 'Confirmed beat' },
            { beatId: 'MIX_02', sceneGoal: 'Expanded beat 1' },
            { beatId: 'MIX_03', sceneGoal: 'Revised beat 1' },
            { beatId: 'MIX_04', sceneGoal: 'Expanded beat 2' },
            { beatId: 'MIX_05', sceneGoal: 'Revised beat 2' }
          ]
        },
        { dbManager }
      );

      // Confirm all first
      await BeatCommands.handleConfirmSceneBeats({ chapterId: chMixed }, { dbManager });

      // Advance beats to downstream lifecycle statuses
      dbManager.beats.update('MIX_02', { status: 'expanded' });
      dbManager.beats.update('MIX_03', { status: 'expanded' });
      dbManager.beats.update('MIX_03', { status: 'revised' });
      dbManager.beats.update('MIX_04', { status: 'expanded' });
      dbManager.beats.update('MIX_05', { status: 'expanded' });
      dbManager.beats.update('MIX_05', { status: 'revised' });

      // All beats are non-draft: gate MUST pass
      const gateResult = BeatCommands.verifyChapterCompositionGate(dbManager, chMixed);
      assert.equal(gateResult.ready, true);
      assert.equal(gateResult.totalBeats, 5);

      // If any of them is reset to draft, gate MUST immediately block again
      dbManager.beats.update('MIX_03', { resetStatus: true });

      assert.throws(
        () => {
          BeatCommands.verifyChapterCompositionGate(dbManager, chMixed);
        },
        (err) => {
          assert.equal(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.deepEqual(err.details.unconfirmedBeatIds, ['MIX_03']);
          return true;
        }
      );
    });
  });
});
