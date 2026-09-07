/**
 * @file m2_challenger1_stress.test.js
 * @description Empirical Challenger 1 Adversarial Stress Test Suite for Milestone 2:
 * Dual-Mode Steered Drafting & Surgical Polishing (R2).
 *
 * Covers:
 *   1. Boundary Envelope Edge Cases (Malformed, Unclosed, Nested, Missing Attributes, Duplicate IDs)
 *   2. Composition Gating Bypass Resistance (Mixed draft+confirmed, all draft, empty, adversarial bypass flags)
 *   3. Polishing Invariant 1: Canon Facts & Entities (Characters, Locations, Directives)
 *   4. Polishing Invariant 2: Physical Injury & State (Fracture healing, Amputation, Exhaustion/Fatigue)
 *   5. Polishing Invariant 3: Timeline Causality & Order (Explosion/collapse sequence, Strike vs Death sequence)
 *   6. Polishing Invariant 4: Key Narrative Outcomes (Defeat to Victory, Retreat to Conquest)
 *   7. Interactive Step-by-Step Gating & State Progression
 *
 * @module test/unit/m2_challenger1_stress.test
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const BeatCommands = require('../../src/commands/BeatCommands');
const DraftingCommands = require('../../src/commands/DraftingCommands');
const { BeatEnvelope, BeatExpander, calculateWordCount } = require('../../src/drafting/BeatExpander');
const { ChapterComposer } = require('../../src/drafting/ChapterComposer');
const { SnippetPolisher } = require('../../src/drafting/SnippetPolisher');
const { NovelError } = require('../../src/errors');

function createTestSandbox() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_m2_challenger1_'));
  const vaultDir = path.join(tempDir, 'WorldTree');
  const sandboxDir = path.join(tempDir, 'Sandbox');

  fs.mkdirSync(vaultDir, { recursive: true });
  fs.mkdirSync(sandboxDir, { recursive: true });
  fs.mkdirSync(path.join(sandboxDir, 'data'), { recursive: true });

  const pathGuard = new PathGuard({
    pluginRoot: sandboxDir,
    vaultRoot: vaultDir
  });

  const dbPath = path.join(sandboxDir, 'data', 'novel_challenger_m2.db');
  const dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

  const dispatcher = new CommandDispatcher({
    basePath: sandboxDir,
    pathGuard,
    dbManager,
    dbPath
  });

  return {
    tempDir,
    vaultDir,
    sandboxDir,
    pathGuard,
    dbManager,
    dbPath,
    dispatcher,
    cleanup: () => {
      if (dbManager && dbManager.isOpen()) {
        dbManager.close();
      }
      if (fs.existsSync(tempDir)) {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  };
}

describe('M2 Challenger 1: Adversarial Stress Test Suite', () => {
  let sandbox;
  let dbManager;
  let dispatcher;

  beforeEach(() => {
    sandbox = createTestSandbox();
    dbManager = sandbox.dbManager;
    dispatcher = sandbox.dispatcher;
  });

  afterEach(() => {
    sandbox.cleanup();
  });

  // =========================================================================
  // Section 1: Boundary Envelope Edge Cases & Stress
  // =========================================================================
  describe('Section 1: Boundary Envelope Edge Cases & Parsing Resilience', () => {
    it('1.1 should detect unclosed tags (START without END)', () => {
      const text = '<!-- BEAT_START: chapter_id="CH1" beat_id="B1" order="1" title="T1" -->\n这是一段没有闭合标签的正文。';
      const check = BeatEnvelope.validateEnvelopes(text);
      assert.strictEqual(check.valid, false, 'Unclosed envelope must be marked invalid');
      assert.ok(check.errors.some(e => e.includes('Mismatched') || e.includes('unclosed')));
    });

    it('1.2 should detect orphaned closing tags (END without START)', () => {
      const text = '正文前置内容。\n<!-- BEAT_END: beat_id="B1" -->';
      const check = BeatEnvelope.validateEnvelopes(text);
      assert.strictEqual(check.valid, false, 'Orphaned closing tag must be marked invalid');
      assert.ok(check.errors.some(e => e.includes('Mismatched')));
    });

    it('1.3 should detect nested beat envelopes (START inside another START)', () => {
      const nested = [
        '<!-- BEAT_START: chapter_id="CH1" beat_id="B_OUTER" order="1" title="外层节拍" -->',
        '外层正文开始。',
        '<!-- BEAT_START: chapter_id="CH1" beat_id="B_INNER" order="2" title="内层节拍" -->',
        '内层正文。',
        '<!-- BEAT_END: beat_id="B_INNER" -->',
        '外层正文结束。',
        '<!-- BEAT_END: beat_id="B_OUTER" -->'
      ].join('\n');

      const check = BeatEnvelope.validateEnvelopes(nested);
      assert.strictEqual(check.valid, false, 'Nested beat envelopes must be flagged as invalid');
      assert.ok(check.errors.some(e => e.includes('nested') || e.includes('Mismatched')));
    });

    it('1.4 should detect missing attributes in envelope tags', () => {
      // Missing chapter_id attribute
      const missingChapterId = '<!-- BEAT_START: beat_id="B1" order="1" title="T1" -->\n缺少chapterId\n<!-- BEAT_END: beat_id="B1" -->';
      const check1 = BeatEnvelope.validateEnvelopes(missingChapterId);
      assert.strictEqual(check1.valid, false, 'Tag missing chapter_id must fail validation');

      // Missing beat_id attribute in START
      const missingBeatId = '<!-- BEAT_START: chapter_id="CH1" order="1" title="T1" -->\n缺少beatId\n<!-- BEAT_END: beat_id="B1" -->';
      const check2 = BeatEnvelope.validateEnvelopes(missingBeatId);
      assert.strictEqual(check2.valid, false, 'Tag missing beat_id must fail validation');
    });

    it('1.5 should detect duplicate beat IDs across multiple envelopes', () => {
      const duplicateText = [
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'BEAT_SAME', order: 1, title: '节拍A', prose: '内容A' }),
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'BEAT_SAME', order: 2, title: '节拍B', prose: '内容B' })
      ].join('\n\n');

      const check = BeatEnvelope.validateEnvelopes(duplicateText);
      assert.strictEqual(check.valid, false, 'Duplicate beat IDs must fail validation');
      assert.ok(check.errors.some(e => e.includes('Duplicate beat envelope ID')));
    });

    it('1.6 should handle envelope tags with varying whitespace and tabs', () => {
      const textWithSpaces = '<!--   BEAT_START:   chapter_id="CH_SPC"   beat_id="B_SPC"   order="3"   title="空格测试"   -->\n正文内容。\n<!--   BEAT_END:   beat_id="B_SPC"   -->';
      const parsed = BeatEnvelope.parseEnvelopes(textWithSpaces);
      assert.strictEqual(parsed.length, 1, 'Should parse envelope with loose spacing');
      assert.strictEqual(parsed[0].chapterId, 'CH_SPC');
      assert.strictEqual(parsed[0].beatId, 'B_SPC');
      assert.strictEqual(parsed[0].order, 3);
      assert.strictEqual(parsed[0].title, '空格测试');
      assert.strictEqual(parsed[0].prose, '正文内容。');
    });

    it('1.7 should surgically replace beat prose in a multi-beat draft without altering neighbors', () => {
      const draft = [
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B1', order: 1, title: 'T1', prose: '第一节原本内容' }),
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B2', order: 2, title: 'T2', prose: '第二节原本内容' }),
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B3', order: 3, title: 'T3', prose: '第三节原本内容' })
      ].join('\n\n');

      const updated = BeatEnvelope.replaceBeatProse(draft, 'B2', '第二节已经被精准手术式替换');
      const parsed = BeatEnvelope.parseEnvelopes(updated);

      assert.strictEqual(parsed.length, 3);
      assert.strictEqual(parsed[0].prose, '第一节原本内容');
      assert.strictEqual(parsed[1].prose, '第二节已经被精准手术式替换');
      assert.strictEqual(parsed[2].prose, '第三节原本内容');
    });

    it('1.8 replaceBeatProse should return unchanged content if beatId does not exist', () => {
      const draft = BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B1', order: 1, title: 'T1', prose: '内容' });
      const same = BeatEnvelope.replaceBeatProse(draft, 'NON_EXISTENT_BEAT', '新正文');
      assert.strictEqual(same, draft);
    });

    it('1.9 [CHALLENGE] should expose blind spot on malformed envelope comments without attributes', () => {
      // Tags with corrupted/missing attributes format like <!-- BEAT_START: corrupted -->
      const corrupted = '<!-- BEAT_START: corrupted_content -->\n正文内容\n<!-- BEAT_END: corrupted_content -->';
      const check = BeatEnvelope.validateEnvelopes(corrupted);
      // Because START_TAG_REGEX strictly requires chapter_id="..." beat_id="...", corrupted tags are not counted as start tags
      // If end tag is also non-conforming, both counts are 0 and validateEnvelopes erroneously reports valid: true!
      const hasBlindSpot = check.valid === true && check.beatCount === 0;
      assert.ok(hasBlindSpot, 'validateEnvelopes fails to detect malformed comment tags without attribute syntax');
    });
  });

  // =========================================================================
  // Section 2: Composition Gating Bypass Resistance
  // =========================================================================
  describe('Section 2: Composition Gating Bypass Resistance', () => {
    beforeEach(async () => {
      // Create a chapter with 4 beats in mixed states
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_GATE_ADVERSARIAL',
        beats: [
          { beatId: 'BEAT_G_1', title: '节拍1', sceneGoal: '目标1' },
          { beatId: 'BEAT_G_2', title: '节拍2', sceneGoal: '目标2' },
          { beatId: 'BEAT_G_3', title: '节拍3', sceneGoal: '目标3' },
          { beatId: 'BEAT_G_4', title: '节拍4', sceneGoal: '目标4' }
        ]
      }, { dbManager });
    });

    it('2.1 should reject composition when all beats are in draft status', async () => {
      await assert.rejects(
        () => DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_GATE_ADVERSARIAL' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.strictEqual(err.details.unconfirmedCount, 4);
          return true;
        }
      );
    });

    it('2.2 should strictly reject composition when beats are partially confirmed (mixed draft + confirmed)', async () => {
      // Confirm beats 1 and 3 only; beats 2 and 4 remain draft
      await BeatCommands.handleConfirmSceneBeats({
        chapterId: 'CH_GATE_ADVERSARIAL',
        beatIds: ['BEAT_G_1', 'BEAT_G_3']
      }, { dbManager });

      await assert.rejects(
        () => DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_GATE_ADVERSARIAL' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.strictEqual(err.details.unconfirmedCount, 2);
          assert.deepStrictEqual(err.details.unconfirmedBeatIds.sort(), ['BEAT_G_2', 'BEAT_G_4']);
          return true;
        }
      );
    });

    it('2.3 should strictly reject composition even if only ONE single beat remains in draft status', async () => {
      // Confirm beats 1, 2, 3; beat 4 remains draft
      await BeatCommands.handleConfirmSceneBeats({
        chapterId: 'CH_GATE_ADVERSARIAL',
        beatIds: ['BEAT_G_1', 'BEAT_G_2', 'BEAT_G_3']
      }, { dbManager });

      await assert.rejects(
        () => DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_GATE_ADVERSARIAL' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.strictEqual(err.details.unconfirmedCount, 1);
          assert.deepStrictEqual(err.details.unconfirmedBeatIds, ['BEAT_G_4']);
          return true;
        }
      );
    });

    it('2.4 should resist adversarial bypass parameters (force, bypassGating, ignoreUnconfirmed)', async () => {
      // Only confirm beat 1
      await BeatCommands.handleConfirmSceneBeats({
        chapterId: 'CH_GATE_ADVERSARIAL',
        beatIds: ['BEAT_G_1']
      }, { dbManager });

      const bypassAttempts = [
        { force: true },
        { bypassGating: true },
        { ignoreUnconfirmed: true },
        { skipValidation: true },
        { overrideGate: true }
      ];

      for (const attempt of bypassAttempts) {
        await assert.rejects(
          () => DraftingCommands.handleComposeChapterDraft(
            { chapterId: 'CH_GATE_ADVERSARIAL', ...attempt },
            { dbManager }
          ),
          (err) => {
            assert.ok(err instanceof NovelError);
            assert.strictEqual(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
            return true;
          },
          `Bypass attempt ${JSON.stringify(attempt)} must NOT bypass composition gate!`
        );
      }
    });

    it('2.5 should permit composition once ALL beats are confirmed, expanded, or revised', async () => {
      // Confirm all beats
      await BeatCommands.handleConfirmSceneBeats({
        chapterId: 'CH_GATE_ADVERSARIAL'
      }, { dbManager });

      // Expand beat 1, revise beat 2, leave beat 3 and 4 confirmed
      await DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_G_1' }, { dbManager });
      await DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_G_2' }, { dbManager });
      await DraftingCommands.handleReviseSceneBeat({ beatId: 'BEAT_G_2', authorFeedback: '微调' }, { dbManager });

      const res = await DraftingCommands.handleComposeChapterDraft({
        chapterId: 'CH_GATE_ADVERSARIAL'
      }, { dbManager });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.beatCount, 4);
      assert.ok(res.totalWordCount >= 2400);
      assert.ok(res.draftVersionId.includes('CH_GATE_ADVERSARIAL'));
    });

    it('2.6 should reject composition on empty or non-existent chapter', async () => {
      await assert.rejects(
        () => DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_NON_EXISTENT_9999' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.ok(err.code === 'CHAPTER_BEATS_EMPTY' || err.code === 'INVALID_PARAMETER');
          return true;
        }
      );
    });

    it('2.7 should reject ExpandSceneBeat on an unconfirmed draft beat', async () => {
      await assert.rejects(
        () => DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_G_4' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'BEAT_NOT_CONFIRMED');
          assert.ok(err.message.includes('draft'));
          return true;
        }
      );
    });
  });

  // =========================================================================
  // Section 3: Hard Polishing Invariant 1 - Canon Facts & Entities
  // =========================================================================
  describe('Section 3: Invariant 1 - Canon Facts & Entities Invariance', () => {
    const polisher = new SnippetPolisher();

    it('3.1 should reject altering canonical character name via contextEntities', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：沈澈潜入指挥中心。修改：张三潜入指挥中心。',
          polishType: 'dialogue_subtext',
          contextEntities: [{ entityId: 'CHAR_01', name: '沈澈' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('canon_facts_and_entities'));
          return true;
        }
      );
    });

    it('3.2 should reject omitting canonical secondary character name via contextEntities', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：艾森在掩体后装填弹药。修改：路人甲在掩体后装填弹药。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_02', name: '艾森' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('canon_facts_and_entities'));
          return true;
        }
      );
    });

    it('3.3 should reject altering canonical location name via contextEntities', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：队伍在云落峡谷遭遇伏击。修改：队伍在黑石荒原遭遇伏击。',
          polishType: 'sensory',
          contextEntities: [{ entityId: 'LOC_01', name: '云落峡谷' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('canon_facts_and_entities'));
          return true;
        }
      );
    });

    it('3.4 should reject altering common canonical entities even without contextEntities', async () => {
      // Testing built-in common entities: 塔兰要塞
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：主力部队进驻塔兰要塞。修改：主力部队进驻未知城堡。',
          polishType: 'sensory'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('canon_facts_and_entities'));
          return true;
        }
      );

      // Testing built-in common entities: 晨曦号
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：晨曦号主炮充能完毕。修改：破浪号主炮充能完毕。',
          polishType: 'combat_tension'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('canon_facts_and_entities'));
          return true;
        }
      );
    });

    it('3.5 should reject rename directives in customDirectives', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '沈澈握紧了枪托。',
          polishType: 'sensory',
          customDirectives: '将主角改名为李四'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('canon_facts_and_entities'));
          return true;
        }
      );
    });

    it('3.6 should allow sensory polish when canonical entities are strictly preserved', async () => {
      const res = await polisher.polishSnippet({
        snippet: '沈澈握紧枪托，在雨中注视着前方的巡逻机。',
        polishType: 'sensory',
        contextEntities: [{ entityId: 'CHAR_01', name: '沈澈' }]
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.invariantCheck.passed, true);
      assert.ok(res.polishedSnippet.includes('沈澈'));
    });
  });

  // =========================================================================
  // Section 4: Hard Polishing Invariant 2 - Physical Injury & State
  // =========================================================================
  describe('Section 4: Invariant 2 - Physical Injury & State Invariance', () => {
    const polisher = new SnippetPolisher();

    it('4.1 should reject healing a fractured limb (骨折 -> 完好无损 / 双手持枪)', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：沈澈左臂骨折剧痛，只能勉强靠墙。修改：沈澈手臂完好无损，轻松双手持枪射击。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_001', name: '沈澈', injury: 'left_arm_fracture' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('physical_injury_state'));
          return true;
        }
      );
    });

    it('4.2 should reject erasing an amputation (断臂 -> 生长如初 / 挥剑自如)', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：战士断臂淌血，退至石柱后。修改：战士手臂生长如初，挥剑自如击溃强敌。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_002', name: '战士', injury: 'amputation' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('physical_injury_state'));
          return true;
        }
      );
    });

    it('4.3 should reject removing exhaustion / fatigue state when registered in contextEntities', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：沈澈体力严重透支，近乎瘫软。修改：沈澈完全康复，健步如飞冲上前去。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_001', name: '沈澈', injury: 'severe_exhaustion' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('physical_injury_state'));
          return true;
        }
      );
    });

    it('4.4 should reject healing injuries detected directly in prose keywords', async () => {
      // Detecting '重伤' and '剧痛' in original text, claiming '痊愈' and '行动如常'
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：沈澈身负重伤剧痛难忍。修改：沈澈伤势彻底痊愈，行动如常继续巡逻。',
          polishType: 'sensory'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('physical_injury_state'));
          return true;
        }
      );
    });

    it('4.5 should allow polish that preserves injury texture without healing', async () => {
      const res = await polisher.polishSnippet({
        snippet: '沈澈强忍着左臂骨折的刺骨剧痛，右手死死握住短刃。',
        polishType: 'combat_tension',
        contextEntities: [{ entityId: 'CHAR_001', name: '沈澈', injury: 'left_arm_fracture' }]
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.invariantCheck.passed, true);
    });

    it('4.6 [CHALLENGE] should expose exhaustion keywords gap in pure prose without contextEntities', () => {
      // In pure prose without contextEntities, exhaustion/fatigue keywords (虚脱, 透支, 力竭, exhaustion)
      // are omitted from injuryKeywords, so removing them is NOT caught!
      const check = polisher.verifyInvariants({
        snippet: '原句：沈澈体力严重透支，极度虚脱。修改：沈澈完全康复，健步如飞冲上前去。',
        polishType: 'sensory'
      });
      // Documenting the gap: check.passed is true because exhaustion is not in injuryKeywords!
      assert.strictEqual(check.passed, true, 'Exhaustion keywords are missing from injuryKeywords list in SnippetPolisher');
    });
  });

  // =========================================================================
  // Section 5: Hard Polishing Invariant 3 - Timeline Causality & Order
  // =========================================================================
  describe('Section 5: Invariant 3 - Timeline Causality & Chronological Order', () => {
    const polisher = new SnippetPolisher();

    it('5.1 should reject reversing explosion -> bunker sequence', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：他先引爆了炸药，随后跃入地下掩体。修改：他跳进掩体后，数小时前炸药早已引爆。',
          polishType: 'combat_tension'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('timeline_causality_order'));
          return true;
        }
      );
    });

    it('5.2 should reject reversing explosion -> gate collapse sequence', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：爆炸发生后，城门坍塌。修改：城门坍塌后很久，炸药才被点燃。',
          polishType: 'combat_tension'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('timeline_causality_order'));
          return true;
        }
      );
    });

    it('5.3 [CHALLENGE] should expose gap: reversing strike vs death causality bypasses Invariant 3', () => {
      // Reversing cause (strike) vs effect (death)
      const testSnippet = '原句：他一剑刺中敌人要害，敌人随后倒地身亡。修改：敌人在倒地身亡很久之后，才被一剑刺中。';
      
      const check = polisher.verifyInvariants({
        snippet: testSnippet,
        polishType: 'combat_tension'
      });

      // Documenting the gap: current regex only tests explosion/bunker/gate collapse!
      // Therefore reversing strike vs death passes without violation!
      assert.strictEqual(check.passed, true, 'Reversing strike vs death is not detected by explosion-only regex');
    });
  });

  // =========================================================================
  // Section 6: Hard Polishing Invariant 4 - Key Narrative Outcomes
  // =========================================================================
  describe('Section 6: Invariant 4 - Key Narrative Outcomes Invariance', () => {
    const polisher = new SnippetPolisher();

    it('6.1 should reject turning defeat into victory (被迫撤退 -> 大获全胜)', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：伏击战最终失败，主角被迫撤退。修改：主角反手消灭全军，大获全胜。',
          polishType: 'dialogue_subtext',
          expectedOutcome: 'forced_retreat'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('key_narrative_outcomes'));
          return true;
        }
      );
    });

    it('6.2 should reject turning negotiation failure into success (协议告吹 -> 签订主权协议)', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：谈判协议告吹，刺客败退。修改：刺客威逼得手，签订了主权归属协议。',
          polishType: 'dialogue_subtext',
          expectedOutcome: 'deal_failed'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('key_narrative_outcomes'));
          return true;
        }
      );
    });

    it('6.3 should reject turning defeat into victory when detected via defeat keywords without explicit expectedOutcome', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：沈澈战死，守军全面败退。修改：守军全面胜利，反败为胜。',
          polishType: 'combat_tension'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.details.violatedInvariants.includes('key_narrative_outcomes'));
          return true;
        }
      );
    });

    it('6.4 should allow polish when narrative outcome remains consistent', async () => {
      const res = await polisher.polishSnippet({
        snippet: '沈澈被迫退入雨林深处，身后追兵的枪声渐行渐远。',
        polishType: 'sensory',
        expectedOutcome: 'retreat'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.invariantCheck.passed, true);
    });
  });

  // =========================================================================
  // Section 7: Dispatcher End-to-End Stress
  // =========================================================================
  describe('Section 7: Dispatcher End-to-End Stress & Edge Cases', () => {
    it('7.1 should reject ComposeChapterDraft with missing chapterId via dispatcher', async () => {
      await assert.rejects(
        () => dispatcher.dispatch('ComposeChapterDraft', {}),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'MISSING_CHAPTER_ID');
          return true;
        }
      );
    });

    it('7.2 should reject ExpandSceneBeat with missing beatId via dispatcher', async () => {
      await assert.rejects(
        () => dispatcher.dispatch('ExpandSceneBeat', {}),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'MISSING_BEAT_ID');
          return true;
        }
      );
    });

    it('7.3 should reject PolishSceneSnippet with missing snippet via dispatcher', async () => {
      await assert.rejects(
        () => dispatcher.dispatch('PolishSceneSnippet', { snippet: '' }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'INVALID_PARAMETER');
          return true;
        }
      );
    });
  });
});
