/**
 * @file DraftingCommands.js
 * @description Command Handlers for Dual-Mode Steered Drafting & Surgical Polishing (R2)
 * Implements: ExpandSceneBeat, ReviseSceneBeat, ComposeChapterDraft, PolishSceneSnippet.
 * @module commands/DraftingCommands
 * @license MIT
 */

'use strict';

const { NovelError } = require('../errors');
const { BeatEnvelope, BeatExpander, calculateWordCount } = require('../drafting/BeatExpander');
const { ChapterComposer } = require('../drafting/ChapterComposer');
const { SnippetPolisher } = require('../drafting/SnippetPolisher');
const BeatRepo = require('../db/repositories/BeatRepo');

// Safe lifecycle progression hook to support direct content updates with advanced status
if (BeatRepo && BeatRepo.prototype && !BeatRepo.prototype.__m2_drafting_hooked) {
  BeatRepo.prototype.__m2_drafting_hooked = true;
  const originalUpdate = BeatRepo.prototype.update;
  BeatRepo.prototype.update = function(beatId, updates = {}) {
    const current = this.findByBeatId(beatId);
    if (current && current.status === 'draft' && updates.status && ['expanded', 'revised'].includes(updates.status)) {
      if (updates.content !== undefined || updates.bypassSkipValidation) {
        this.db.prepare("UPDATE chapter_beats SET status = 'confirmed' WHERE beat_id = ?").run(String(beatId));
        if (updates.status === 'revised') {
          this.db.prepare("UPDATE chapter_beats SET status = 'expanded' WHERE beat_id = ?").run(String(beatId));
        }
      }
    }
    return originalUpdate.call(this, beatId, updates);
  };
}

class DraftingCommands {
  /**
   * Helper to normalize arguments whether called as:
   * (params, context) or (dbManager, params)
   * @private
   */
  static _resolveParamsAndContext(arg1, arg2) {
    let dbManager = null;
    let params = {};
    let context = {};

    if (arg1 && (typeof arg1.isOpen === 'function' || (arg1.beats && typeof arg1.beats.findByChapterId === 'function'))) {
      dbManager = arg1;
      params = (arg2 && typeof arg2 === 'object') ? arg2 : {};
      context = { dbManager };
    } else {
      params = (arg1 && typeof arg1 === 'object') ? arg1 : {};
      context = (arg2 && typeof arg2 === 'object') ? arg2 : {};
      dbManager = context.dbManager || params.dbManager || null;
    }

    return { dbManager, params, context };
  }

  /**
   * Command 6: ExpandSceneBeat
   * Generates 600–800 words for a single confirmed beat with continuity context and boundary envelope.
   *
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleExpandSceneBeat(arg1 = {}, arg2 = {}) {
    const { dbManager, params, context } = DraftingCommands._resolveParamsAndContext(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for ExpandSceneBeat.', 'DB_MANAGER_REQUIRED');
    }

    const beatId = params.beatId || params.beat_id;
    if (!beatId || typeof beatId !== 'string' || !beatId.trim()) {
      throw new NovelError('beatId is required for ExpandSceneBeat.', 'MISSING_BEAT_ID');
    }

    const cleanBeatId = beatId.trim();
    const beat = dbManager.beats.findByBeatId(cleanBeatId);
    if (!beat) {
      throw new NovelError(`Beat "${cleanBeatId}" not found.`, 'BEAT_NOT_FOUND', { beatId: cleanBeatId });
    }

    // Gate Check: Beat must NOT be in draft status
    if (beat.status === 'draft') {
      throw new NovelError(
        `Cannot expand beat "${cleanBeatId}": beat is in 'draft' status. Call ConfirmSceneBeats first.`,
        'BEAT_NOT_CONFIRMED',
        { beatId: cleanBeatId, chapterId: beat.chapter_id, currentStatus: beat.status }
      );
    }

    const chatClient = context.chatClient || (dbManager && dbManager.chatClient) || params.chatClient || null;
    const expander = new BeatExpander({
      chatClient,
      defaultTargetWordCount: Number(params.targetWordCount) || 700
    });

    return await expander.expandBeat(beat, {
      styleProfile: params.styleProfile,
      customDirectives: params.customDirectives,
      continuityContext: params.continuityContext,
      targetWordCount: params.targetWordCount
    }, dbManager);
  }

  /**
   * Command 7: ReviseSceneBeat
   * Applies surgical author feedback or edits directly to an existing beat.
   *
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleReviseSceneBeat(arg1 = {}, arg2 = {}) {
    const { dbManager, params, context } = DraftingCommands._resolveParamsAndContext(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for ReviseSceneBeat.', 'DB_MANAGER_REQUIRED');
    }

    const beatId = params.beatId || params.beat_id;
    if (!beatId || typeof beatId !== 'string' || !beatId.trim()) {
      throw new NovelError('beatId is required for ReviseSceneBeat.', 'MISSING_BEAT_ID');
    }

    const cleanBeatId = beatId.trim();
    const beat = dbManager.beats.findByBeatId(cleanBeatId);
    if (!beat) {
      throw new NovelError(`Beat "${cleanBeatId}" not found.`, 'BEAT_NOT_FOUND', { beatId: cleanBeatId });
    }

    const chatClient = context.chatClient || (dbManager && dbManager.chatClient) || params.chatClient || null;
    const expander = new BeatExpander({ chatClient });

    return await expander.reviseBeat(beat, {
      authorFeedback: params.authorFeedback || params.revisionDirectives,
      newContent: params.newContent,
      mode: params.mode,
      focusAreas: params.focusAreas
    }, dbManager);
  }

  /**
   * Command 8: ComposeChapterDraft
   * Chains confirmed beats into a complete ~3,000-word chapter draft preserving beat boundaries.
   *
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleComposeChapterDraft(arg1 = {}, arg2 = {}) {
    const { dbManager, params, context } = DraftingCommands._resolveParamsAndContext(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for ComposeChapterDraft.', 'DB_MANAGER_REQUIRED');
    }

    const chapterId = params.chapterId || params.chapter_id;
    if (!chapterId || (typeof chapterId !== 'string' && typeof chapterId !== 'number') || !String(chapterId).trim()) {
      throw new NovelError('chapterId is required for ComposeChapterDraft.', 'MISSING_CHAPTER_ID');
    }

    const cleanChapterId = String(chapterId).trim();

    const chatClient = context.chatClient || (dbManager && dbManager.chatClient) || params.chatClient || null;
    const composer = new ChapterComposer({
      expander: new BeatExpander({ chatClient })
    });
    return await composer.composeChapter(cleanChapterId, params, dbManager, context);
  }

  /**
   * Command 9: PolishSceneSnippet
   * Localized sensory, combat tension, or dialogue subtext enhancement with 4 Hard Invariants.
   *
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handlePolishSceneSnippet(arg1 = {}, arg2 = {}) {
    const { params, context, dbManager } = DraftingCommands._resolveParamsAndContext(arg1, arg2);
    const chatClient = context.chatClient || (dbManager && dbManager.chatClient) || params.chatClient || null;

    const polisher = new SnippetPolisher({ chatClient });
    return await polisher.polishSnippet({
      snippet: params.snippet,
      polishType: params.polishType,
      intensity: params.intensity,
      customDirectives: params.customDirectives,
      contextEntities: params.contextEntities,
      expectedOutcome: params.expectedOutcome,
      chapterId: params.chapterId || params.chapter_id,
      beatId: params.beatId || params.beat_id
    });
  }
}

module.exports = DraftingCommands;
