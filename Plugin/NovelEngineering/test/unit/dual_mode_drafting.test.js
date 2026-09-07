/**
 * @file dual_mode_drafting.test.js
 * @description Unit Test Suite for Milestone 2: Dual-Mode Steered Drafting & Surgical Polishing (R2)
 * Validates: Markdown boundary envelopes, ExpandSceneBeat, ReviseSceneBeat, ComposeChapterDraft,
 * PolishSceneSnippet, the 4 Hard Invariants, CommandDispatcher routing, and plugin manifest.
 * @module test/unit/dual_mode_drafting.test
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
const ChatClient = require('../../src/llm/ChatClient');
const { NovelError } = require('../../src/errors');

function createTestSandbox() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_unit_draft_'));
  const vaultDir = path.join(tempDir, 'WorldTree');
  const sandboxDir = path.join(tempDir, 'Sandbox');

  fs.mkdirSync(vaultDir, { recursive: true });
  fs.mkdirSync(sandboxDir, { recursive: true });
  fs.mkdirSync(path.join(sandboxDir, 'data'), { recursive: true });

  const pathGuard = new PathGuard({
    pluginRoot: sandboxDir,
    vaultRoot: vaultDir
  });

  const dbPath = path.join(sandboxDir, 'data', 'novel_test.db');
  const dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

  const defaultMockProse = '在冷雨与硝烟弥漫的废墟尽头，沈澈单手持枪隐蔽在掩体后方。夜风呼啸着卷起焦黑的尘土，前方的巡逻机探照光束在泥泞中交错扫过。战术目标十分明确：探明敌人先遣队意图。暗处的伏击者悍然现身，子弹与能量弧光撕裂雨幕。生死一线间，沈澈凭借惊人的战斗直觉就地翻滚反击。当最后一抹硝烟消散，全歼先遣小队并缴获星图的战果尘埃落定。'.repeat(5);
  dbManager.chatClient = ChatClient.createMockClient(async () => {
    return { content: defaultMockProse };
  });

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

describe('Milestone 2: Dual-Mode Steered Drafting & Surgical Polishing (R2)', () => {
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
  // Suite 1: Markdown Boundary Envelopes
  // =========================================================================
  describe('Suite 1: Markdown Boundary Envelopes', () => {
    it('1.1 should wrap prose in exact boundary envelope format', () => {
      const wrapped = BeatEnvelope.wrap({
        chapterId: 'CH001',
        beatId: 'BEAT_01',
        order: 1,
        title: '幽暗密林遭遇战',
        prose: '夜风穿过密林，带来浓烈的焦糊味。'
      });

      assert.ok(wrapped.startsWith('<!-- BEAT_START: chapter_id="CH001" beat_id="BEAT_01" order="1" title="幽暗密林遭遇战" -->'));
      assert.ok(wrapped.endsWith('<!-- BEAT_END: beat_id="BEAT_01" -->'));
      assert.ok(wrapped.includes('夜风穿过密林，带来浓烈的焦糊味。'));
    });

    it('1.2 should accurately parse multiple beat envelopes from chapter draft', () => {
      const draft = [
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B1', order: 1, title: '起', prose: '第一节正文。' }),
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B2', order: 2, title: '承', prose: '第二节正文。' })
      ].join('\n\n');

      const envelopes = BeatEnvelope.parseEnvelopes(draft);
      assert.strictEqual(envelopes.length, 2);
      assert.strictEqual(envelopes[0].beatId, 'B1');
      assert.strictEqual(envelopes[0].prose, '第一节正文。');
      assert.strictEqual(envelopes[1].beatId, 'B2');
      assert.strictEqual(envelopes[1].prose, '第二节正文。');
    });

    it('1.3 should validate envelope integrity and detect tag mismatches or duplicates', () => {
      // Valid draft
      const validDraft = BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B1', order: 1, title: 'T1', prose: 'P1' });
      const validCheck = BeatEnvelope.validateEnvelopes(validDraft);
      assert.strictEqual(validCheck.valid, true);
      assert.strictEqual(validCheck.beatCount, 1);

      // Mismatched start and end
      const brokenDraft = '<!-- BEAT_START: chapter_id="CH1" beat_id="B1" order="1" title="T1" -->\nProse without end';
      const brokenCheck = BeatEnvelope.validateEnvelopes(brokenDraft);
      assert.strictEqual(brokenCheck.valid, false);
      assert.ok(brokenCheck.errors.length > 0);

      // Duplicate beat IDs
      const duplicateDraft = [
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B_DUP', order: 1, title: 'T1', prose: 'P1' }),
        BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B_DUP', order: 2, title: 'T2', prose: 'P2' })
      ].join('\n\n');
      const dupCheck = BeatEnvelope.validateEnvelopes(duplicateDraft);
      assert.strictEqual(dupCheck.valid, false);
      assert.ok(dupCheck.errors.some(e => e.includes('Duplicate beat envelope ID')));
    });

    it('1.4 should strip envelopes cleanly and replace beat prose inside draft', () => {
      const wrapped = BeatEnvelope.wrap({ chapterId: 'CH1', beatId: 'B1', order: 1, title: 'T', prose: '原始正文' });
      assert.strictEqual(BeatEnvelope.stripEnvelopes(wrapped), '原始正文');

      const replaced = BeatEnvelope.replaceBeatProse(wrapped, 'B1', '修订后的新正文');
      assert.ok(replaced.includes('修订后的新正文'));
      assert.ok(!replaced.includes('原始正文'));
      assert.ok(replaced.includes('<!-- BEAT_START:'));
      assert.ok(replaced.includes('<!-- BEAT_END:'));
    });
  });

  // =========================================================================
  // Suite 2: Word Count Computation
  // =========================================================================
  describe('Suite 2: Word Count Computation', () => {
    it('2.1 should compute word count across mixed CJK characters and Latin words', () => {
      const mixed = '沈澈进入了 Sector-7 的 Research Lab。';
      // 6 CJK chars + 4 English tokens (Sector, 7, Research, Lab) = 10 words
      const count = calculateWordCount(mixed);
      assert.strictEqual(count, 10);

      const longer = '沈澈穿过迷雾进入了 Sector-7 的 Research Lab。';
      // 10 CJK chars + 4 English tokens = 14 words
      assert.strictEqual(calculateWordCount(longer), 14);
    });

    it('2.2 should ignore markdown boundary comments in word count', () => {
      const pureProse = '沈澈在冷雨中前进。';
      const pureCount = calculateWordCount(pureProse);

      const enveloped = BeatEnvelope.wrap({
        chapterId: 'CH1',
        beatId: 'B1',
        order: 1,
        title: '标题',
        prose: pureProse
      });

      const envelopedCount = calculateWordCount(enveloped);
      assert.strictEqual(envelopedCount, pureCount);
    });

    it('2.3 should return 0 on empty, null, or whitespace-only strings', () => {
      assert.strictEqual(calculateWordCount(''), 0);
      assert.strictEqual(calculateWordCount(null), 0);
      assert.strictEqual(calculateWordCount('   \n\t  '), 0);
    });
  });

  // =========================================================================
  // Suite 3: Interactive Step-by-Step Drafting (ExpandSceneBeat)
  // =========================================================================
  describe('Suite 3: Interactive Step-by-Step Drafting (ExpandSceneBeat)', () => {
    beforeEach(async () => {
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_EXP_01',
        beats: [
          {
            beatId: 'BEAT_EXP_01',
            title: '密林遭遇战',
            sceneGoal: '探明敌人先遣队意图',
            conflict: '潜行者暗中包围',
            characters: ['CHAR_001_AETHEN'],
            location: 'LOC_MIST_VALLEY',
            worldRules: ['AXIOM_THERMAL_SHIELD_OVERHEAT'],
            emotionalTone: 'tense_survival',
            expectedOutput: '全歼先遣小队并缴获星图'
          },
          {
            beatId: 'BEAT_EXP_02',
            title: '审讯与撤离',
            sceneGoal: '逼问主力坐标',
            conflict: '敌人服毒自尽威胁'
          }
        ]
      }, { dbManager });
    });

    it('3.1 should reject expansion if beat is still in draft status', async () => {
      await assert.rejects(
        () => DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_EXP_01' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.ok(err.code === 'BEAT_NOT_CONFIRMED' || err.code === 'INVALID_BEAT_STATUS_TRANSITION');
          assert.ok(err.message.includes('draft'));
          return true;
        }
      );
    });

    it('3.2 should expand confirmed beat into 600-800 words with envelopes and update status to expanded', async () => {
      // Confirm beat first
      await BeatCommands.handleConfirmSceneBeats({
        chapterId: 'CH_EXP_01',
        beatIds: ['BEAT_EXP_01']
      }, { dbManager });

      const res = await DraftingCommands.handleExpandSceneBeat({
        beatId: 'BEAT_EXP_01',
        targetWordCount: 700
      }, { dbManager });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.beatId, 'BEAT_EXP_01');
      assert.ok(res.wordCount >= 600 && res.wordCount <= 850);
      assert.ok(res.content.includes('<!-- BEAT_START:'));
      assert.ok(res.content.includes('<!-- BEAT_END:'));
      assert.ok(res.content.includes('BEAT_EXP_01'));

      // Check DB persistence
      const beatInDb = dbManager.beats.findByBeatId('BEAT_EXP_01');
      assert.strictEqual(beatInDb.status, 'expanded');
      assert.strictEqual(beatInDb.version, 3); // draft(1) -> confirmed(2) -> expanded(3)
      assert.ok(beatInDb.content.includes('<!-- BEAT_START:'));
    });

    it('3.3 should ingest previous beat exit state for seamless continuity on beat 2', async () => {
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_EXP_01' }, { dbManager });
      await DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_EXP_01' }, { dbManager });

      const res2 = await DraftingCommands.handleExpandSceneBeat({
        beatId: 'BEAT_EXP_02',
        continuityContext: '主角手握缴获的受损星图'
      }, { dbManager });

      assert.strictEqual(res2.status, 'success');
      assert.strictEqual(res2.beatId, 'BEAT_EXP_02');
      assert.ok(res2.content.includes('<!-- BEAT_START:'));
      assert.ok(res2.wordCount >= 600);
    });

    it('3.4 should reject expansion of non-existent beatId with BEAT_NOT_FOUND', async () => {
      await assert.rejects(
        () => DraftingCommands.handleExpandSceneBeat({ beatId: 'NON_EXISTENT_BEAT_999' }, { dbManager }),
        /BEAT_NOT_FOUND/
      );
    });
  });

  // =========================================================================
  // Suite 4: Surgical Author Revision (ReviseSceneBeat)
  // =========================================================================
  describe('Suite 4: Surgical Author Revision (ReviseSceneBeat)', () => {
    beforeEach(async () => {
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_REV_01',
        beats: [{ beatId: 'BEAT_REV_01', title: '谈判', sceneGoal: '达成协议' }]
      }, { dbManager });
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_REV_01' }, { dbManager });
      await DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_REV_01' }, { dbManager });
    });

    it('4.1 should revise beat with author feedback and update status to revised', async () => {
      const initialBeat = dbManager.beats.findByBeatId('BEAT_REV_01');
      const v0 = initialBeat.version;

      const res = await DraftingCommands.handleReviseSceneBeat({
        beatId: 'BEAT_REV_01',
        authorFeedback: '增强环境冷雨的感官描写与心理对抗的紧张感',
        focusAreas: ['sensory', 'dialogue_subtext']
      }, { dbManager });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.beatId, 'BEAT_REV_01');
      assert.ok(res.content.includes('<!-- BEAT_START:'));
      assert.ok(res.content.includes('<!-- BEAT_END:'));

      const updatedBeat = dbManager.beats.findByBeatId('BEAT_REV_01');
      assert.strictEqual(updatedBeat.status, 'revised');
      assert.ok(updatedBeat.version > v0);
    });

    it('4.2 should accept newContent directly and wrap in boundary envelope', async () => {
      const res = await DraftingCommands.handleReviseSceneBeat({
        beatId: 'BEAT_REV_01',
        newContent: '这是作者直接传入的手术式精准修订正文内容。'
      }, { dbManager });

      assert.strictEqual(res.status, 'success');
      assert.ok(res.content.includes('这是作者直接传入的手术式精准修订正文内容。'));
      assert.ok(res.content.includes('<!-- BEAT_START:'));
      assert.ok(res.content.includes('<!-- BEAT_END:'));

      const beatInDb = dbManager.beats.findByBeatId('BEAT_REV_01');
      assert.strictEqual(beatInDb.status, 'revised');
    });

    it('4.3 should reject revision on missing beatId or non-existent beat', async () => {
      await assert.rejects(
        () => DraftingCommands.handleReviseSceneBeat({ beatId: '' }, { dbManager }),
        /MISSING_BEAT_ID/
      );
      await assert.rejects(
        () => DraftingCommands.handleReviseSceneBeat({ beatId: 'BEAT_MISSING_888' }, { dbManager }),
        /BEAT_NOT_FOUND/
      );
    });
  });

  // =========================================================================
  // Suite 5: Batch Composition (ComposeChapterDraft)
  // =========================================================================
  describe('Suite 5: Batch Composition (ComposeChapterDraft)', () => {
    it('5.1 should reject composition on chapter with 0 beats (CHAPTER_BEATS_EMPTY)', async () => {
      await assert.rejects(
        () => DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_EMPTY_01' }, { dbManager }),
        /CHAPTER_BEATS_EMPTY/
      );
    });

    it('5.2 should reject composition if ANY beat is unconfirmed (COMPOSITION_BLOCKED_UNCONFIRMED_BEATS)', async () => {
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_GATE_TEST',
        beats: [
          { beatId: 'B_G1', title: '已确认', sceneGoal: '目标1' },
          { beatId: 'B_G2', title: '未确认草稿', sceneGoal: '目标2' }
        ]
      }, { dbManager });

      // Confirm only beat 1
      await BeatCommands.handleConfirmSceneBeats({
        chapterId: 'CH_GATE_TEST',
        beatIds: ['B_G1']
      }, { dbManager });

      await assert.rejects(
        () => DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_GATE_TEST' }, { dbManager }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS');
          assert.ok(err.message.includes('UNCONFIRMED') || err.message.includes('COMPOSITION_BLOCKED'));
          assert.strictEqual(err.details.unconfirmedCount, 1);
          return true;
        }
      );
    });

    it('5.3 should chain confirmed beats into full draft, preserving envelopes and auto-expanding', async () => {
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_BATCH_01',
        beats: [
          { beatId: 'BEAT_BT_01', title: '开端', sceneGoal: '突破重围' },
          { beatId: 'BEAT_BT_02', title: '中段', sceneGoal: '探秘遗迹' },
          { beatId: 'BEAT_BT_03', title: '终局', sceneGoal: '取得能源核心' }
        ]
      }, { dbManager });
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_BATCH_01' }, { dbManager });

      const res = await DraftingCommands.handleComposeChapterDraft({
        chapterId: 'CH_BATCH_01',
        title: '第一章 破晓之光'
      }, { dbManager });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.chapterId, 'CH_BATCH_01');
      assert.strictEqual(res.beatCount, 3);
      assert.ok(res.totalWordCount >= 1800);
      assert.ok(res.content.includes('BEAT_BT_01'));
      assert.ok(res.content.includes('BEAT_BT_02'));
      assert.ok(res.content.includes('BEAT_BT_03'));

      // Verify draft_versions snapshot table insertion
      assert.ok(res.draftVersionId);
      const snapshot = dbManager.draftVersions.findByVersionId(res.draftVersionId);
      assert.ok(snapshot);
      assert.strictEqual(snapshot.chapter_id, 'CH_BATCH_01');
      assert.strictEqual(snapshot.integrity_status, 'pending');
      assert.strictEqual(snapshot.version_number, 1);
    });

    it('5.4 should monotonically increment draft version number on subsequent composition', async () => {
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_VER_INC',
        beats: [{ beatId: 'BEAT_VI_1', title: '单节拍', sceneGoal: '目标' }]
      }, { dbManager });
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_VER_INC' }, { dbManager });

      const res1 = await DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_VER_INC' }, { dbManager });
      assert.strictEqual(res1.versionNumber, 1);

      const res2 = await DraftingCommands.handleComposeChapterDraft({ chapterId: 'CH_VER_INC' }, { dbManager });
      assert.strictEqual(res2.versionNumber, 2);

      const latest = dbManager.draftVersions.getLatestVersion('CH_VER_INC');
      assert.strictEqual(latest.version_number, 2);
    });
  });

  // =========================================================================
  // Suite 6: Surgical Polishing (PolishSceneSnippet) - 3 Polish Types
  // =========================================================================
  describe('Suite 6: Surgical Polishing (PolishSceneSnippet) - 3 Polish Types', () => {
    const polisher = new SnippetPolisher();

    it('6.1 should polish sensory texture with certified invariant preservation', async () => {
      const res = await polisher.polishSnippet({
        snippet: '沈澈握紧枪托，在雨中注视着前方的巡逻机。',
        polishType: 'sensory'
      });

      assert.strictEqual(res.status, 'success');
      assert.ok(res.polishedSnippet.includes('沈澈'));
      assert.ok(res.polishedSnippet.includes('雨'));
      assert.strictEqual(res.invariantCheck.passed, true);
      assert.ok(res.diffSummary);
    });

    it('6.2 should polish combat tension with heightened kinetic weight', async () => {
      const res = await polisher.polishSnippet({
        snippet: '沈澈拔出短刃，死死盯着逼近的黑影。',
        polishType: 'combat_tension'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.invariantCheck.passed, true);
      assert.ok(res.polishedSnippet.includes('沈澈'));
    });

    it('6.3 should polish dialogue subtext with micro-expressions and silence', async () => {
      const res = await polisher.polishSnippet({
        snippet: '沈澈看向对方：“你来晚了。”对方笑了笑。',
        polishType: 'dialogue_subtext'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.invariantCheck.passed, true);
      assert.ok(res.polishedSnippet.includes('沈澈'));
    });

    it('6.4 should reject empty snippet or invalid polishType', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({ snippet: '   ', polishType: 'sensory' }),
        /INVALID_PARAMETER/
      );

      await assert.rejects(
        () => polisher.polishSnippet({ snippet: '有效正文', polishType: 'invalid_type_xyz' }),
        /INVALID_POLISH_TYPE/
      );
    });
  });

  // =========================================================================
  // Suite 7: 4 Hard Polishing Invariant Violations
  // =========================================================================
  describe('Suite 7: 4 Hard Polishing Invariant Violations', () => {
    const polisher = new SnippetPolisher();

    it('7.1 Invariant 1: should reject altering or omitting canonical entity names', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：沈澈开枪。修改：张三开枪。',
          polishType: 'dialogue_subtext',
          contextEntities: [{ entityId: 'CHAR_01', name: '沈澈' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.message.includes('POLISH_INVARIANT_VIOLATION'));
          return true;
        }
      );
    });

    it('7.2 Invariant 2: should reject erasing or healing character physical injuries', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '沈澈左臂骨折剧痛，只能用右手单手托枪。改写：沈澈手臂完好无损，轻松双手持枪射击。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_001', name: '沈澈', injury: 'left_arm_fracture' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          return true;
        }
      );

      // Amputation erasing test
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：断臂淌血。修改：手臂生长如初，挥剑自如。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_01', injury: 'amputation' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          return true;
        }
      );
    });

    it('7.3 Invariant 3: should reject chronological causal timeline sequence inversion', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '他先引爆了炸药，随后跃入地下掩体。改写为：他跳进掩体后，数小时前炸药早已引爆。',
          polishType: 'combat_tension'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          return true;
        }
      );

      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：爆炸发生后，城门坍塌。修改：城门坍塌后很久，炸药才被点燃。',
          polishType: 'combat_tension'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          return true;
        }
      );
    });

    it('7.4 Invariant 4: should reject narrative outcome inversion (defeat into victory)', async () => {
      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '伏击战最终失败，主角被迫撤退。改写：主角反手消灭全军，大获全胜。',
          polishType: 'dialogue_subtext',
          expectedOutcome: 'forced_retreat'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          return true;
        }
      );

      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '原句：协议告吹，刺客败退。修改：刺客威逼得手，签订了主权归属协议。',
          polishType: 'dialogue_subtext',
          expectedOutcome: 'deal_failed'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          return true;
        }
      );
    });
  });

  // =========================================================================
  // Suite 8: CommandDispatcher Routing & Manifest Compatibility
  // =========================================================================
  describe('Suite 8: CommandDispatcher Routing & Manifest Compatibility', () => {
    it('8.1 should dispatch all 4 drafting commands via CommandDispatcher', async () => {
      // Set up confirmed beat for dispatcher tests
      await dispatcher.dispatch('PlanSceneBeats', {
        chapterId: 'CH_DISP_01',
        beats: [{ beatId: 'BEAT_DSP_1', title: 'T1', sceneGoal: 'G1' }]
      });
      await dispatcher.dispatch('ConfirmSceneBeats', { chapterId: 'CH_DISP_01' });

      // 1. ExpandSceneBeat
      const expRes = await dispatcher.dispatch('ExpandSceneBeat', { beatId: 'BEAT_DSP_1' });
      assert.strictEqual(expRes.status, 'success');

      // 2. ReviseSceneBeat
      const revRes = await dispatcher.dispatch('ReviseSceneBeat', {
        beatId: 'BEAT_DSP_1',
        authorFeedback: '强化节奏'
      });
      assert.strictEqual(revRes.status, 'success');

      // 3. ComposeChapterDraft
      const compRes = await dispatcher.dispatch('ComposeChapterDraft', { chapterId: 'CH_DISP_01' });
      assert.strictEqual(compRes.status, 'success');

      // 4. PolishSceneSnippet
      const polRes = await dispatcher.dispatch('PolishSceneSnippet', {
        snippet: '夜色沉沉，老码头的走私船在起伏。',
        polishType: 'sensory'
      });
      assert.strictEqual(polRes.status, 'success');
    });

    it('8.2 should include all 4 drafting commands in help output', async () => {
      const help = await dispatcher.dispatch('help');
      assert.ok(help.availableCommands.includes('ExpandSceneBeat'));
      assert.ok(help.availableCommands.includes('ReviseSceneBeat'));
      assert.ok(help.availableCommands.includes('ComposeChapterDraft'));
      assert.ok(help.availableCommands.includes('PolishSceneSnippet'));
    });

    it('8.3 plugin-manifest.json should be valid and contain all 4 drafting commands with dual fields', () => {
      const manifestPath = path.resolve(__dirname, '../../plugin-manifest.json');
      const content = fs.readFileSync(manifestPath, 'utf8');
      const parsed = JSON.parse(content);

      const commands = parsed.capabilities.invocationCommands;
      const draftingCmds = ['ExpandSceneBeat', 'ReviseSceneBeat', 'ComposeChapterDraft', 'PolishSceneSnippet'];

      for (const cmdName of draftingCmds) {
        const item = commands.find(c => c.command === cmdName);
        assert.ok(item, `Command ${cmdName} must exist in plugin-manifest.json`);
        assert.strictEqual(item.command, item.commandIdentifier, `Dual fields must match for ${cmdName}`);
        assert.ok(item.description && item.description.length > 50, `Command ${cmdName} must have detailed description`);
        assert.ok(item.example && item.example.includes(cmdName), `Command ${cmdName} must have valid example`);
      }
    });
  });

  // =========================================================================
  // Suite 9: LLM Integration (ChatClient & Hard Invariant System Constraints)
  // =========================================================================
  describe('Suite 9: LLM Integration (ChatClient & Hard Invariant System Constraints)', () => {
    it('9.1 BeatExpander should generate prose via mock ChatClient and wrap in envelope', async () => {
      let receivedMessages = null;
      const mockProse = '在冷雨与硝烟弥漫的废墟尽头，沈澈单手持枪隐蔽在掩体后方。夜风呼啸着卷起焦黑的尘土，前方的巡逻机探照光束在泥泞中交错扫过。战术目标十分明确：探明敌人先遣队意图。暗处的伏击者悍然现身，子弹与能量弧光撕裂雨幕。生死一线间，沈澈凭借惊人的战斗直觉就地翻滚反击。当最后一抹硝烟消散，全歼先遣小队并缴获星图的战果尘埃落定。'.repeat(5);

      const mockClient = ChatClient.createMockClient(async ({ messages }) => {
        receivedMessages = messages;
        return { content: mockProse };
      });

      const expander = new BeatExpander({ chatClient: mockClient, defaultTargetWordCount: 650 });

      // Plan and confirm beat
      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_LLM_01',
        beats: [
          {
            beatId: 'BEAT_LLM_01',
            title: 'LLM生成测试节拍',
            sceneGoal: '探明敌人先遣队意图',
            conflict: '潜行者暗中包围',
            characters: ['CHAR_001_AETHEN'],
            expectedOutput: '全歼先遣小队并缴获星图'
          }
        ]
      }, { dbManager });
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_LLM_01' }, { dbManager });

      const beat = dbManager.beats.findByBeatId('BEAT_LLM_01');
      const res = await expander.expandBeat(beat, {}, dbManager);

      assert.strictEqual(res.status, 'success');
      assert.ok(receivedMessages);
      assert.strictEqual(receivedMessages[0].role, 'system');
      assert.ok(receivedMessages[0].content.includes('novelist'));
      assert.strictEqual(receivedMessages[1].role, 'user');
      assert.ok(receivedMessages[1].content.includes('探明敌人先遣队意图'));
      assert.ok(res.content.startsWith('<!-- BEAT_START:'));
      assert.ok(res.content.endsWith('<!-- BEAT_END: beat_id="BEAT_LLM_01" -->'));
      assert.ok(res.wordCount >= 600);
    });

    it('9.2 BeatExpander should dynamically revise beat via mock ChatClient using author feedback', async () => {
      let receivedMessages = null;
      const revisedMockText = '【修订正文】在密集冷雨的洗刷下，沈澈的感官被提升至极限。面对作者要求的节奏强化，动作更加利落紧凑，直击要害。'.repeat(6);

      const mockClient = ChatClient.createMockClient(async ({ messages }) => {
        receivedMessages = messages;
        return { content: revisedMockText };
      });

      await BeatCommands.handlePlanSceneBeats({
        chapterId: 'CH_LLM_REV',
        beats: [{ beatId: 'BEAT_LLM_REV', title: '修订测试', sceneGoal: '目标' }]
      }, { dbManager });
      await BeatCommands.handleConfirmSceneBeats({ chapterId: 'CH_LLM_REV' }, { dbManager });
      await DraftingCommands.handleExpandSceneBeat({ beatId: 'BEAT_LLM_REV' }, { dbManager });

      const expander = new BeatExpander({ chatClient: mockClient });
      const beat = dbManager.beats.findByBeatId('BEAT_LLM_REV');

      const res = await expander.reviseBeat(beat, {
        authorFeedback: '强化节奏与冷雨的质感',
        focusAreas: ['sensory', 'pacing']
      }, dbManager);

      assert.strictEqual(res.status, 'success');
      assert.ok(receivedMessages);
      assert.ok(receivedMessages[1].content.includes('强化节奏与冷雨的质感'));
      assert.ok(res.content.includes('<!-- BEAT_START:'));
      assert.ok(res.content.includes('<!-- BEAT_END:'));
      assert.strictEqual(res.statusTransition, 'expanded -> revised');
    });

    it('9.3 SnippetPolisher should pass 4 hard invariants as strict negative system constraints to ChatClient', async () => {
      let capturedSystemPrompt = '';
      const mockClient = ChatClient.createMockClient(async ({ messages }) => {
        const sysMsg = messages.find(m => m.role === 'system');
        capturedSystemPrompt = sysMsg ? sysMsg.content : '';
        return { content: '冰冷的雨水顺着眉骨滑落。沈澈五指死死扣紧金属枪托，指腹感受到冰冷的阻尼感。' };
      });

      const polisher = new SnippetPolisher({ chatClient: mockClient });
      const res = await polisher.polishSnippet({
        snippet: '沈澈握紧枪托，在雨中注视着前方的巡逻机。',
        polishType: 'sensory'
      });

      assert.strictEqual(res.status, 'success');
      assert.strictEqual(res.invariantCheck.passed, true);
      // Verify all 4 Hard Invariants were embedded into system prompt
      assert.ok(capturedSystemPrompt.includes('canon_facts_and_entities'));
      assert.ok(capturedSystemPrompt.includes('physical_injury_state'));
      assert.ok(capturedSystemPrompt.includes('timeline_causality_order'));
      assert.ok(capturedSystemPrompt.includes('key_narrative_outcomes'));
    });

    it('9.4 SnippetPolisher post-guard should reject LLM output that violates physical injury invariant', async () => {
      // Mock LLM returns output that illegally cures an amputation
      const mockClient = ChatClient.createMockClient(async () => {
        return { content: '沈澈手臂生长如初，挥剑自如，豪气干云。' };
      });

      const polisher = new SnippetPolisher({ chatClient: mockClient });

      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '沈澈断臂淌血，忍着剧痛咬牙后撤。',
          polishType: 'combat_tension',
          contextEntities: [{ entityId: 'CHAR_SC', name: '沈澈', injury: 'amputation' }]
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.message.includes('POLISH_INVARIANT_VIOLATION'));
          return true;
        }
      );
    });

    it('9.5 SnippetPolisher post-guard should reject LLM output that inverts narrative defeat into victory', async () => {
      // Mock LLM returns output that inverts defeat into victory
      const mockClient = ChatClient.createMockClient(async () => {
        return { content: '主角反手消灭全军，大获全胜，顺利夺取了要塞。' };
      });

      const polisher = new SnippetPolisher({ chatClient: mockClient });

      await assert.rejects(
        () => polisher.polishSnippet({
          snippet: '伏击战最终彻底失败，主角被迫撤退进入深山。',
          polishType: 'dialogue_subtext',
          expectedOutcome: 'forced_retreat'
        }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.strictEqual(err.code, 'POLISH_INVARIANT_VIOLATION');
          assert.ok(err.message.includes('POLISH_INVARIANT_VIOLATION'));
          return true;
        }
      );
    });
  });
});
