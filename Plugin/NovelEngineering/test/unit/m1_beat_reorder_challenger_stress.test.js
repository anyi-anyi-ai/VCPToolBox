/**
 * @file m1_beat_reorder_challenger_stress.test.js
 * @description Empirical Challenger Stress Test Suite for Milestone 1:
 * Scene Beats Choreography & Hierarchy (R1) - Beat Reordering & Invariant Safety.
 *
 * Covers:
 *   1. Beat Reordering Permutations (Swaps, Inversions, 100-run Random Shuffles)
 *   2. Strict Invariant Verification: UNIQUE(chapter_id, beat_order) constraint holds
 *   3. Monotonic Version Increment Guarantee
 *   4. Adversarial Malformed Reorder Inputs:
 *      - Duplicate beat IDs
 *      - Missing beat IDs
 *      - Cross-chapter foreign beat IDs
 *      - Empty or non-array inputs
 *   5. Transactional Atomicity & Rollback: No negative temporary orders leak on error
 *   6. Multi-Chapter Isolation & Status/Metadata Preservation
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

describe('Milestone 1 Challenger: Beat Reordering & Concurrency/Invariant Safety', () => {
  let dbManager = null;
  let dispatcher = null;
  let tempDir = null;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'beats_m1_challenger_'));
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
  // Area 1: Valid Reorder Permutations & Invariant Verification
  // =========================================================================
  describe('Area 1: Valid Reorder Permutations & Invariant Verification', () => {
    it('1.1 should safely swap adjacent beats (1 <-> 2) with monotonic version increments and no UNIQUE collision', async () => {
      const chapterId = 'CH_SWAP_01';
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
      assert.equal(beats[2].version, 2); // all reordered beats get version incremented
    });

    it('1.2 should invert a 10-beat list completely without UNIQUE constraint failure', async () => {
      const chapterId = 'CH_INV_10';
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

    it('1.3 should invert a 50-beat large-scale list cleanly', async () => {
      const chapterId = 'CH_INV_50';
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

    it('1.4 should endure 100 consecutive random shuffles with continuous contiguous ordering and monotonic version increments', async () => {
      const chapterId = 'CH_SHUFFLE_100';
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

      // Deterministic PRNG for reproducible shuffle
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

        // Verify order strictly matches permutation and is contiguous 1..count
        for (let i = 0; i < count; i++) {
          assert.equal(dbBeats[i].beat_id, currentIds[i], `Round ${round}: beat at slot ${i} mismatch`);
          assert.equal(dbBeats[i].beat_order, i + 1, `Round ${round}: beat_order must be ${i + 1}`);
          // Initial was version 1, each round adds 1
          assert.equal(dbBeats[i].version, round + 1, `Round ${round}: version must be ${round + 1}`);
        }
      }

      // Verify no temporary negative beat_orders exist in DB
      const negativeBeats = dbManager.db.prepare(
        'SELECT * FROM chapter_beats WHERE chapter_id = ? AND beat_order < 0'
      ).all(chapterId);
      assert.equal(negativeBeats.length, 0, 'No negative beat_order should remain after shuffles');
    });
  });

  // =========================================================================
  // Area 2: Adversarial Reorder Inputs & Validation Rejection
  // =========================================================================
  describe('Area 2: Adversarial Reorder Inputs & Rejection Invariants', () => {
    const chapterId = 'CH_ADVERSARIAL';

    beforeEach(async () => {
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId,
          beats: [
            { beatId: 'B_ADV_1', sceneGoal: 'Adv Goal 1' },
            { beatId: 'B_ADV_2', sceneGoal: 'Adv Goal 2' },
            { beatId: 'B_ADV_3', sceneGoal: 'Adv Goal 3' }
          ]
        },
        { dbManager }
      );
    });

    it('2.1 should reject duplicate beat IDs in orderedBeatIds with DUPLICATE_BEAT_REORDER_IDS and preserve state', async () => {
      const duplicateList = ['B_ADV_1', 'B_ADV_1', 'B_ADV_2'];

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

      // Verify DB unchanged: versions still 1, orders still 1, 2, 3
      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats[0].beat_id, 'B_ADV_1');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[0].version, 1);
      assert.equal(beats[1].beat_id, 'B_ADV_2');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[1].version, 1);
      assert.equal(beats[2].beat_id, 'B_ADV_3');
      assert.equal(beats[2].beat_order, 3);
      assert.equal(beats[2].version, 1);
    });

    it('2.2 should reject missing beat IDs in orderedBeatIds with BEAT_REORDER_COUNT_MISMATCH', async () => {
      // Provide only 2 of 3 beats
      const missingList = ['B_ADV_2', 'B_ADV_1'];

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

      // Verify DB unchanged
      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats.length, 3);
      assert.equal(beats[0].beat_id, 'B_ADV_1');
      assert.equal(beats[0].version, 1);
    });

    it('2.3 should reject foreign beat IDs belonging to another chapter with BEAT_NOT_IN_CHAPTER', async () => {
      // Plan beats in another chapter
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_OTHER',
          beats: [{ beatId: 'B_OTHER_1', sceneGoal: 'Foreign Goal' }]
        },
        { dbManager }
      );

      // Try reordering chapterId with a beat from CH_OTHER
      const crossChapterList = ['B_ADV_1', 'B_ADV_2', 'B_OTHER_1'];

      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: crossChapterList },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'BEAT_NOT_IN_CHAPTER');
          assert.equal(err.details.beatId, 'B_OTHER_1');
          return true;
        }
      );

      // Verify both chapters untouched
      const chBeats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(chBeats.length, 3);
      assert.equal(chBeats[0].version, 1);

      const otherBeats = dbManager.beats.findByChapterId('CH_OTHER');
      assert.equal(otherBeats.length, 1);
      assert.equal(otherBeats[0].beat_id, 'B_OTHER_1');
      assert.equal(otherBeats[0].beat_order, 1);
    });

    it('2.4 should reject empty list or non-array orderedBeatIds with INVALID_ORDERED_BEAT_IDS', async () => {
      // Empty array
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: [] },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_ORDERED_BEAT_IDS');
          return true;
        }
      );

      // null
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: null },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_ORDERED_BEAT_IDS');
          return true;
        }
      );

      // Non-array string
      await assert.rejects(
        () => BeatCommands.handleReorderSceneBeats(
          { chapterId, orderedBeatIds: 'B_ADV_1,B_ADV_2,B_ADV_3' },
          { dbManager }
        ),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_ORDERED_BEAT_IDS');
          return true;
        }
      );
    });

    it('2.5 should reject BeatRepo.updateOrder directly when passed empty or non-array input', () => {
      assert.throws(
        () => dbManager.beats.updateOrder(chapterId, []),
        /INVALID_BEAT_ORDER_PARAM/
      );

      assert.throws(
        () => dbManager.beats.updateOrder(chapterId, null),
        /INVALID_BEAT_ORDER_PARAM/
      );
    });
  });

  // =========================================================================
  // Area 3: Transactional Atomicity, Multi-Chapter & Metadata Preservation
  // =========================================================================
  describe('Area 3: Transactional Atomicity, Multi-Chapter & Metadata Preservation', () => {
    it('3.1 should completely roll back transaction and prevent negative order leak if database error occurs', () => {
      const chapterId = 'CH_ROLLBACK';
      dbManager.beats.insert({ beat_id: 'B_RB_1', chapter_id: chapterId, beat_order: 1, scene_goal: 'G1' });
      dbManager.beats.insert({ beat_id: 'B_RB_2', chapter_id: chapterId, beat_order: 2, scene_goal: 'G2' });

      // Intentionally craft an invalid operation inside updateOrder by feeding duplicate IDs that collide in step 2
      // Step 1: B_RB_1 -> -1, B_RB_1 -> -2
      // Step 2: B_RB_1 -> 1, B_RB_1 -> 2
      // Because B_RB_2 was NOT in the list, B_RB_2 is still order 2!
      // Assigning B_RB_1 to order 2 causes SQLite UNIQUE constraint failure!
      assert.throws(
        () => {
          dbManager.beats.updateOrder(chapterId, ['B_RB_1', 'B_RB_1']);
        },
        /UNIQUE constraint failed/
      );

      // Verify that transaction rolled back completely:
      // NO beats should have negative orders!
      const negBeats = dbManager.db.prepare('SELECT * FROM chapter_beats WHERE beat_order < 0').all();
      assert.equal(negBeats.length, 0, 'No negative temporary orders must leak on rollback');

      // Original orders and versions must be intact
      const beats = dbManager.beats.findByChapterId(chapterId);
      assert.equal(beats[0].beat_id, 'B_RB_1');
      assert.equal(beats[0].beat_order, 1);
      assert.equal(beats[0].version, 1);
      assert.equal(beats[1].beat_id, 'B_RB_2');
      assert.equal(beats[1].beat_order, 2);
      assert.equal(beats[1].version, 1);
    });

    it('3.2 should maintain multi-chapter isolation without cross-chapter order collisions', async () => {
      // Chapter 1 has beats 1, 2
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_ISO_A',
          beats: [
            { beatId: 'BA_1', sceneGoal: 'A1' },
            { beatId: 'BA_2', sceneGoal: 'A2' }
          ]
        },
        { dbManager }
      );

      // Chapter 2 has beats with same local orders 1, 2
      await BeatCommands.handlePlanSceneBeats(
        {
          chapterId: 'CH_ISO_B',
          beats: [
            { beatId: 'BB_1', sceneGoal: 'B1' },
            { beatId: 'BB_2', sceneGoal: 'B2' }
          ]
        },
        { dbManager }
      );

      // Reorder Chapter A
      await BeatCommands.handleReorderSceneBeats(
        { chapterId: 'CH_ISO_A', orderedBeatIds: ['BA_2', 'BA_1'] },
        { dbManager }
      );

      // Verify Chapter A is reversed and version bumped
      const beatsA = dbManager.beats.findByChapterId('CH_ISO_A');
      assert.equal(beatsA[0].beat_id, 'BA_2');
      assert.equal(beatsA[0].beat_order, 1);
      assert.equal(beatsA[0].version, 2);
      assert.equal(beatsA[1].beat_id, 'BA_1');
      assert.equal(beatsA[1].beat_order, 2);
      assert.equal(beatsA[1].version, 2);

      // Verify Chapter B is completely unaffected
      const beatsB = dbManager.beats.findByChapterId('CH_ISO_B');
      assert.equal(beatsB[0].beat_id, 'BB_1');
      assert.equal(beatsB[0].beat_order, 1);
      assert.equal(beatsB[0].version, 1);
      assert.equal(beatsB[1].beat_id, 'BB_2');
      assert.equal(beatsB[1].beat_order, 2);
      assert.equal(beatsB[1].version, 1);
    });

    it('3.3 should preserve all rich metadata, status lifecycle, and content during reorders', async () => {
      const chapterId = 'CH_META';
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

      // Progress BM_1 to confirmed, then expanded with content
      await BeatCommands.handleConfirmSceneBeats({ chapterId, beatIds: ['BM_1'] }, { dbManager });
      dbManager.beats.update('BM_1', { status: 'expanded', content: 'Expanded prose text' });

      // Progress BM_2 to confirmed
      await BeatCommands.handleConfirmSceneBeats({ chapterId, beatIds: ['BM_2'] }, { dbManager });

      // Reorder: Swap BM_2 and BM_1
      await BeatCommands.handleReorderSceneBeats(
        { chapterId, orderedBeatIds: ['BM_2', 'BM_1'] },
        { dbManager }
      );

      const refreshed = dbManager.beats.findByChapterId(chapterId);

      // Verify BM_2 is now order 1, status still confirmed
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

      // Verify BM_1 is now order 2, status still expanded with content preserved
      assert.equal(refreshed[1].beat_id, 'BM_1');
      assert.equal(refreshed[1].beat_order, 2);
      assert.equal(refreshed[1].status, 'expanded');
      assert.equal(refreshed[1].content, 'Expanded prose text');
      assert.equal(refreshed[1].title, 'Title Alpha');
    });

    it('3.4 should handle CommandDispatcher dispatching of ReorderSceneBeats with full parameter mapping', async () => {
      const chapterId = 'CH_DISP_REORDER';
      await dispatcher.dispatch('PlanSceneBeats', {
        chapterId,
        beats: [
          { beatId: 'BD_1', sceneGoal: 'G1' },
          { beatId: 'BD_2', sceneGoal: 'G2' }
        ]
      });

      const res = await dispatcher.dispatch('ReorderSceneBeats', {
        chapterId,
        orderedBeatIds: ['BD_2', 'BD_1']
      });

      assert.equal(res.status, 'success');
      assert.equal(res.beats[0].beat_id, 'BD_2');
      assert.equal(res.beats[0].beat_order, 1);
      assert.equal(res.beats[1].beat_id, 'BD_1');
      assert.equal(res.beats[1].beat_order, 2);
    });
  });
});
