/**
 * @file BeatCommands.js
 * @description Command Handlers for Scene Beats Choreography & Hierarchy (R1)
 * Implements: PlanSceneBeats, GetSceneBeats, UpdateSceneBeat, ReorderSceneBeats, ConfirmSceneBeats,
 * and the Chapter Composition Gate helper.
 * @module commands/BeatCommands
 * @license MIT
 */

'use strict';

const { NovelError } = require('../errors');

class BeatCommands {
  /**
   * Helper to normalize arguments whether called as:
   * (params, context) or (dbManager, params)
   * @private
   */
  static _resolveParamsAndDb(arg1, arg2) {
    let dbManager = null;
    let params = {};

    if (arg1 && (typeof arg1.isOpen === 'function' || (arg1.beats && typeof arg1.beats.findByChapterId === 'function'))) {
      dbManager = arg1;
      params = (arg2 && typeof arg2 === 'object') ? arg2 : {};
    } else {
      params = (arg1 && typeof arg1 === 'object') ? arg1 : {};
      dbManager = (arg2 && arg2.dbManager) ? arg2.dbManager : (params.dbManager || null);
    }

    return { dbManager, params };
  }

  /**
   * Command: PlanSceneBeats
   * Creates or overwrites scene beats for a chapter in batch or via automated parameter-driven planning.
   * @param {object} [arg1] - params object or DatabaseManager instance
   * @param {object} [arg2] - context object or params object
   * @returns {Promise<object>}
   */
  static async handlePlanSceneBeats(arg1 = {}, arg2 = {}) {
    const { dbManager, params } = BeatCommands._resolveParamsAndDb(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for PlanSceneBeats.', 'DB_MANAGER_REQUIRED');
    }

    const chapterId = params.chapterId || params.chapter_id;
    if (!chapterId || (typeof chapterId !== 'string' && typeof chapterId !== 'number') || !String(chapterId).trim()) {
      throw new NovelError('chapterId is required for PlanSceneBeats.', 'MISSING_CHAPTER_ID');
    }
    const cleanChapterId = String(chapterId).trim();

    const hasExplicitBeats = (params.beats !== undefined && params.beats !== null);

    if (hasExplicitBeats) {
      const beats = params.beats;
      if (!Array.isArray(beats) || beats.length === 0) {
        throw new NovelError('beats must be a non-empty array for PlanSceneBeats.', 'INVALID_BEATS_ARRAY');
      }

      const overwrite = Boolean(params.overwrite || params.forceReplan || params.force_replan);

      // If overwrite is requested, purge existing beats for this chapter
      if (overwrite) {
        dbManager.beats.deleteByChapterId(cleanChapterId);
      }

      // Determine current existing beats for order offset
      const existingBeats = dbManager.beats.findByChapterId(cleanChapterId);
      let currentMaxOrder = 0;
      if (existingBeats.length > 0) {
        currentMaxOrder = Math.max(...existingBeats.map(b => Number(b.beat_order) || 0));
      }

      const plannedBeats = [];

      // Insert all beats in order
      for (let i = 0; i < beats.length; i++) {
        const item = beats[i];
        if (!item || typeof item !== 'object') {
          throw new NovelError(`Beat item at index ${i} is invalid.`, 'INVALID_BEAT_ITEM');
        }

        const sceneGoal = item.sceneGoal || item.scene_goal;
        if (!sceneGoal || typeof sceneGoal !== 'string' || !sceneGoal.trim()) {
          throw new NovelError(
            `Scene goal is required for beat at index ${i} in chapter "${cleanChapterId}".`,
            'MISSING_BEAT_GOAL',
            { chapterId: cleanChapterId, index: i }
          );
        }

        const assignedOrder = item.beatOrder !== undefined
          ? Number(item.beatOrder)
          : (item.beat_order !== undefined ? Number(item.beat_order) : (currentMaxOrder + i + 1));

        let beatId = item.beatId || item.beat_id;
        if (!beatId || typeof beatId !== 'string' || !beatId.trim()) {
          const sanitizedCid = cleanChapterId.replace(/[^a-zA-Z0-9_-]/g, '');
          const orderStr = String(assignedOrder).padStart(2, '0');
          beatId = `BEAT_${sanitizedCid}_${orderStr}`;
        } else {
          beatId = String(beatId).trim();
        }

        const created = dbManager.beats.insert({
          beat_id: beatId,
          chapter_id: cleanChapterId,
          beat_order: assignedOrder,
          title: item.title || '',
          scene_goal: sceneGoal.trim(),
          conflict: item.conflict || '',
          characters: item.characters || item.characters_json || [],
          location: item.location || '',
          world_rules: item.worldRules || item.world_rules || item.world_rules_json || [],
          debt_action: item.debtAction || item.debt_action || item.debt_action_json || null,
          emotional_tone: item.emotionalTone || item.emotional_tone || '',
          input_state: item.inputState || item.input_state || item.input_state_json || null,
          expected_output: item.expectedOutput || item.expected_output || '',
          status: 'draft',
          version: 1,
          content: item.content || null
        });

        plannedBeats.push(created);
      }

      const allChapterBeats = dbManager.beats.findByChapterId(cleanChapterId);
      const allConfirmed = allChapterBeats.length > 0 && allChapterBeats.every(b => b.status !== 'draft');

      const summaryLines = allChapterBeats.map(
        b => `- #${b.beat_order} \`${b.beat_id}\` [${b.status}]: **${b.title || 'Untitled'}** — Goal: ${b.scene_goal}`
      );

      return {
        status: 'success',
        success: true,
        chapterId: cleanChapterId,
        totalBeats: allChapterBeats.length,
        count: allChapterBeats.length,
        allConfirmed,
        plannedBeats,
        beats: allChapterBeats,
        content: `### [PlanSceneBeats] Chapter ${cleanChapterId} Planned (${allChapterBeats.length} beats, allConfirmed: ${allConfirmed ? 'YES' : 'NO'})\n${summaryLines.join('\n')}`,
        details: {
          action: 'PlanSceneBeats',
          chapterId: cleanChapterId,
          totalBeats: allChapterBeats.length,
          count: allChapterBeats.length,
          allConfirmed,
          beats: allChapterBeats
        }
      };
    }

    // Automated Beat Planning Branch
    const forceReplan = Boolean(params.forceReplan || params.force_replan || params.overwrite);
    if (forceReplan) {
      dbManager.beats.deleteByChapterId(cleanChapterId);
    }

    // Determine targetCount with clamping (minimum 2, maximum 6, default 3)
    let parsedTargetCount = undefined;
    if (params.targetCount !== undefined && !isNaN(Number(params.targetCount))) {
      parsedTargetCount = Math.max(2, Math.min(6, Number(params.targetCount)));
    } else if (params.targetBeatsCount !== undefined && !isNaN(Number(params.targetBeatsCount))) {
      parsedTargetCount = Math.max(2, Math.min(6, Number(params.targetBeatsCount)));
    }

    const chapterGoal = String(params.chapterGoal || params.chapter_goal || '推进主线剧情').trim();
    const characters = Array.isArray(params.characters)
      ? params.characters
      : (Array.isArray(params.focusEntities) ? params.focusEntities : ['主要出场角色']);
    const location = String(params.location || '场景主地点').trim();
    const worldRules = Array.isArray(params.worldRules || params.world_rules)
      ? (params.worldRules || params.world_rules)
      : [];
    const debtAction = params.debtAction || params.debt_action || null;

    let plannedBeats = [];

    // 1. Try BeatChoreographer integration
    let choreo = null;
    try {
      const BeatChoreographer = require('../beats/BeatChoreographer');
      if (typeof BeatChoreographer === 'function') {
        choreo = new BeatChoreographer(dbManager);
      }
    } catch (_) {
      choreo = null;
    }

    if (choreo && typeof choreo.planSceneBeats === 'function') {
      const choreoParams = {
        ...params,
        chapterId: cleanChapterId,
        chapterGoal,
        characters,
        location,
        worldRules,
        debtAction,
        forceReplan
      };
      if (parsedTargetCount !== undefined) {
        choreoParams.targetCount = parsedTargetCount;
        choreoParams.targetBeatsCount = parsedTargetCount;
      }
      const choreoResult = choreo.planSceneBeats(choreoParams);
      if (choreoResult && Array.isArray(choreoResult.beats)) {
        plannedBeats = choreoResult.beats;
      }
    }

    // 2. Fallback construction if choreo produced no beats
    if (!plannedBeats || plannedBeats.length === 0) {
      const targetCount = parsedTargetCount !== undefined ? parsedTargetCount : 3;
      const defaultTemplates = [
        { phase: 'Beginning/Inciting Incident', goal: '开端：建立当前场景局势与引出潜在张力', tone: 'calm_tension', conflict: '环境阻碍与情报迷雾' },
        { phase: 'Middle/Rising Tension & Conflict', goal: '发展：核心交互与目标逼近，矛盾激化', tone: 'rising_conflict', conflict: '动机冲突与利益试探' },
        { phase: 'Climax/Scene Turn', goal: '高潮：重大抉择或突发变故，戏剧性转折', tone: 'climax_turn', conflict: '实质危机与战力碰撞' },
        { phase: 'Resolution/Cliffhanger', goal: '结局：阶段性结果落地，抛出下一场景钩子', tone: 'suspense_hook', conflict: '遗留悬念与债务兑现' }
      ];

      const existingBeats = dbManager.beats.findByChapterId(cleanChapterId);
      let currentMaxOrder = 0;
      if (existingBeats.length > 0 && !forceReplan) {
        currentMaxOrder = Math.max(...existingBeats.map(b => Number(b.beat_order) || 0));
      }

      plannedBeats = [];
      for (let i = 0; i < targetCount; i++) {
        const tpl = defaultTemplates[i] || defaultTemplates[defaultTemplates.length - 1];
        const assignedOrder = currentMaxOrder + i + 1;
        const sanitizedCid = cleanChapterId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const orderStr = String(assignedOrder).padStart(2, '0');
        const beatId = `BEAT_${sanitizedCid}_${orderStr}`;

        const created = dbManager.beats.insert({
          beat_id: beatId,
          chapter_id: cleanChapterId,
          beat_order: assignedOrder,
          title: `节拍 ${assignedOrder}：${tpl.phase}`,
          scene_goal: `${chapterGoal} -> ${tpl.goal}`,
          conflict: tpl.conflict,
          characters,
          location,
          world_rules: worldRules,
          debt_action: i === targetCount - 1 && debtAction ? debtAction : null,
          emotional_tone: tpl.tone,
          input_state: { phaseIndex: assignedOrder },
          expected_output: `完成 ${tpl.phase} 阶段情节推进`,
          status: 'draft',
          version: 1
        });
        plannedBeats.push(created);
      }
    }

    const allChapterBeats = dbManager.beats.findByChapterId(cleanChapterId);
    const allConfirmed = allChapterBeats.length > 0 && allChapterBeats.every(b => b.status !== 'draft');

    const summaryLines = allChapterBeats.map(
      b => `- #${b.beat_order} \`${b.beat_id}\` [${b.status}]: **${b.title || 'Untitled'}** — Goal: ${b.scene_goal}`
    );

    return {
      status: 'success',
      success: true,
      chapterId: cleanChapterId,
      totalBeats: allChapterBeats.length,
      count: allChapterBeats.length,
      allConfirmed,
      plannedBeats: allChapterBeats,
      beats: allChapterBeats,
      content: `### [PlanSceneBeats] Chapter ${cleanChapterId} Planned (${allChapterBeats.length} beats, allConfirmed: ${allConfirmed ? 'YES' : 'NO'})\n${summaryLines.join('\n')}`,
      details: {
        action: 'PlanSceneBeats',
        chapterId: cleanChapterId,
        totalBeats: allChapterBeats.length,
        count: allChapterBeats.length,
        allConfirmed,
        beats: allChapterBeats
      }
    };
  }

  /**
   * Command: GetSceneBeats
   * Retrieves all beats for a chapter sorted by beat_order ascending.
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleGetSceneBeats(arg1 = {}, arg2 = {}) {
    const { dbManager, params } = BeatCommands._resolveParamsAndDb(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for GetSceneBeats.', 'DB_MANAGER_REQUIRED');
    }

    const chapterId = params.chapterId || params.chapter_id;
    if (!chapterId || (typeof chapterId !== 'string' && typeof chapterId !== 'number') || !String(chapterId).trim()) {
      throw new NovelError('chapterId is required for GetSceneBeats.', 'MISSING_CHAPTER_ID');
    }
    const cleanChapterId = String(chapterId).trim();

    const statusFilter = params.status ? String(params.status).toLowerCase().trim() : 'all';
    const allChapterBeats = dbManager.beats.findByChapterId(cleanChapterId);

    const countsByStatus = {
      draft: 0,
      confirmed: 0,
      expanded: 0,
      revised: 0
    };

    for (const beat of allChapterBeats) {
      if (countsByStatus[beat.status] !== undefined) {
        countsByStatus[beat.status]++;
      }
    }

    const beats = statusFilter === 'all'
      ? allChapterBeats
      : allChapterBeats.filter(b => b.status === statusFilter);

    const allConfirmed = allChapterBeats.length > 0 && countsByStatus.draft === 0;
    const readyForComposition = allConfirmed;

    const summaryLines = beats.map(
      b => `- #${b.beat_order} \`${b.beat_id}\` [${b.status}|v${b.version}]: **${b.title || 'Untitled'}** — Goal: ${b.scene_goal}`
    );

    return {
      status: 'success',
      success: true,
      chapterId: cleanChapterId,
      totalBeats: beats.length,
      countsByStatus,
      allConfirmed,
      readyForComposition,
      beats,
      content: `### [GetSceneBeats] Chapter ${cleanChapterId} Beats (${beats.length} beats, Composition Ready: ${readyForComposition ? 'YES' : 'NO'})\n${summaryLines.join('\n')}`,
      details: {
        action: 'GetSceneBeats',
        chapterId: cleanChapterId,
        totalBeats: beats.length,
        countsByStatus,
        allConfirmed,
        readyForComposition,
        beats
      }
    };
  }

  /**
   * Command: UpdateSceneBeat
   * Updates attributes or goals of a single scene beat.
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleUpdateSceneBeat(arg1 = {}, arg2 = {}) {
    const { dbManager, params } = BeatCommands._resolveParamsAndDb(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for UpdateSceneBeat.', 'DB_MANAGER_REQUIRED');
    }

    const beatId = params.beatId || params.beat_id;
    if (!beatId || typeof beatId !== 'string' || !beatId.trim()) {
      throw new NovelError('beatId is required for UpdateSceneBeat.', 'MISSING_BEAT_ID');
    }
    const cleanBeatId = String(beatId).trim();

    const updates = params.updates || {};
    if (typeof updates !== 'object' || updates === null) {
      throw new NovelError('updates must be an object for UpdateSceneBeat.', 'INVALID_UPDATES_PARAM');
    }

    if (params.resetStatus !== undefined) {
      updates.resetStatus = Boolean(params.resetStatus);
    }

    const updatedBeat = dbManager.beats.update(cleanBeatId, updates);

    return {
      status: 'success',
      success: true,
      beatId: cleanBeatId,
      updatedBeat,
      beat: updatedBeat,
      content: `### [UpdateSceneBeat] Beat ${cleanBeatId} updated (status: ${updatedBeat.status}, version: ${updatedBeat.version})`,
      details: {
        action: 'UpdateSceneBeat',
        beatId: cleanBeatId,
        version: updatedBeat.version,
        status: updatedBeat.status,
        updatedBeat
      }
    };
  }

  /**
   * Command: ReorderSceneBeats
   * Atomically reorders beats in a chapter using a collision-free two-phase transaction.
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleReorderSceneBeats(arg1 = {}, arg2 = {}) {
    const { dbManager, params } = BeatCommands._resolveParamsAndDb(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for ReorderSceneBeats.', 'DB_MANAGER_REQUIRED');
    }

    const chapterId = params.chapterId || params.chapter_id;
    if (!chapterId || (typeof chapterId !== 'string' && typeof chapterId !== 'number') || !String(chapterId).trim()) {
      throw new NovelError('chapterId is required for ReorderSceneBeats.', 'MISSING_CHAPTER_ID');
    }
    const cleanChapterId = String(chapterId).trim();

    const orderedBeatIds = params.orderedBeatIds || params.ordered_beat_ids;
    if (!Array.isArray(orderedBeatIds) || orderedBeatIds.length === 0) {
      throw new NovelError('orderedBeatIds must be a non-empty array for ReorderSceneBeats.', 'INVALID_ORDERED_BEAT_IDS');
    }

    // Check for duplicate IDs
    const idSet = new Set(orderedBeatIds);
    if (idSet.size !== orderedBeatIds.length) {
      throw new NovelError('Duplicate beat IDs found in orderedBeatIds.', 'DUPLICATE_BEAT_REORDER_IDS');
    }

    // Verify all IDs belong to this chapter
    const existingBeats = dbManager.beats.findByChapterId(cleanChapterId);
    const existingIds = new Set(existingBeats.map(b => b.beat_id));

    if (orderedBeatIds.length !== existingBeats.length) {
      throw new NovelError(
        `orderedBeatIds count (${orderedBeatIds.length}) does not match existing beats count (${existingBeats.length}) for chapter "${cleanChapterId}".`,
        'BEAT_REORDER_COUNT_MISMATCH'
      );
    }

    for (const bid of orderedBeatIds) {
      if (!existingIds.has(bid)) {
        throw new NovelError(
          `Beat "${bid}" does not belong to chapter "${cleanChapterId}".`,
          'BEAT_NOT_IN_CHAPTER',
          { chapterId: cleanChapterId, beatId: bid }
        );
      }
    }

    // Execute two-phase transaction via repository
    const reorderedBeats = dbManager.beats.updateOrder(cleanChapterId, orderedBeatIds);

    const summaryLines = reorderedBeats.map(
      b => `- #${b.beat_order} \`${b.beat_id}\` [${b.status}|v${b.version}]: **${b.title || 'Untitled'}**`
    );

    return {
      status: 'success',
      success: true,
      chapterId: cleanChapterId,
      reorderedCount: reorderedBeats.length,
      beats: reorderedBeats,
      content: `### [ReorderSceneBeats] Chapter ${cleanChapterId} beats reordered (${reorderedBeats.length} beats)\n${summaryLines.join('\n')}`,
      details: {
        action: 'ReorderSceneBeats',
        chapterId: cleanChapterId,
        reorderedCount: reorderedBeats.length,
        beats: reorderedBeats
      }
    };
  }

  /**
   * Command: ConfirmSceneBeats
   * Locks scene beats, transitioning them from draft to confirmed.
   * @param {object} [arg1]
   * @param {object} [arg2]
   * @returns {Promise<object>}
   */
  static async handleConfirmSceneBeats(arg1 = {}, arg2 = {}) {
    const { dbManager, params } = BeatCommands._resolveParamsAndDb(arg1, arg2);
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for ConfirmSceneBeats.', 'DB_MANAGER_REQUIRED');
    }

    const chapterId = params.chapterId || params.chapter_id;
    if (!chapterId || (typeof chapterId !== 'string' && typeof chapterId !== 'number') || !String(chapterId).trim()) {
      throw new NovelError('chapterId is required for ConfirmSceneBeats.', 'MISSING_CHAPTER_ID');
    }
    const cleanChapterId = String(chapterId).trim();

    const existingBeats = dbManager.beats.findByChapterId(cleanChapterId);
    if (existingBeats.length === 0) {
      throw new NovelError(`No scene beats found for chapter "${cleanChapterId}". Plan beats first.`, 'CHAPTER_BEATS_EMPTY');
    }

    const specifiedBeatIds = params.beatIds || params.beat_ids;
    let targetBeats = [];

    if (Array.isArray(specifiedBeatIds) && specifiedBeatIds.length > 0) {
      const specifiedSet = new Set(specifiedBeatIds);
      targetBeats = existingBeats.filter(b => specifiedSet.has(b.beat_id));
      if (targetBeats.length === 0) {
        throw new NovelError('None of the specified beatIds were found in the chapter.', 'BEATS_NOT_FOUND');
      }
    } else {
      // Default: confirm all beats currently in draft status
      targetBeats = existingBeats.filter(b => b.status === 'draft');
    }

    let confirmedCount = 0;
    for (const beat of targetBeats) {
      // Validate that scene_goal is non-empty
      if (!beat.scene_goal || !beat.scene_goal.trim()) {
        throw new NovelError(
          `Cannot confirm beat "${beat.beat_id}": scene_goal is empty. Every confirmed beat must have a dramatic goal.`,
          'BEAT_GOAL_EMPTY',
          { beatId: beat.beat_id, chapterId: cleanChapterId }
        );
      }

      if (beat.status === 'draft') {
        dbManager.beats.update(beat.beat_id, { status: 'confirmed' });
        confirmedCount++;
      }
    }

    const refreshedBeats = dbManager.beats.findByChapterId(cleanChapterId);
    const remainingDraftCount = refreshedBeats.filter(b => b.status === 'draft').length;
    const allConfirmed = refreshedBeats.length > 0 && remainingDraftCount === 0;

    return {
      status: 'success',
      success: true,
      chapterId: cleanChapterId,
      confirmedCount,
      remainingDraftCount,
      allConfirmed,
      readyForComposition: allConfirmed,
      beats: refreshedBeats,
      content: `### [ConfirmSceneBeats] Chapter ${cleanChapterId}: ${confirmedCount} beats confirmed. All beats confirmed: ${allConfirmed ? 'YES' : 'NO'}`,
      details: {
        action: 'ConfirmSceneBeats',
        chapterId: cleanChapterId,
        confirmedCount,
        remainingDraftCount,
        allConfirmed,
        readyForComposition: allConfirmed,
        beats: refreshedBeats
      }
    };
  }

  /**
   * Status progression & Gate enforcement helper
   * Checks that chapter composition is blocked if any beat is in draft status.
   * Throws COMPOSITION_BLOCKED_UNCONFIRMED_BEATS or CHAPTER_BEATS_EMPTY on violation.
   * @param {DatabaseManager} arg1
   * @param {string|number} arg2
   * @returns {{ ready: boolean, chapterId: string, totalBeats: number }}
   */
  static verifyChapterCompositionGate(arg1, arg2) {
    let dbManager = null;
    let chapterId = null;

    if (arg1 && (typeof arg1.isOpen === 'function' || (arg1.beats && typeof arg1.beats.findByChapterId === 'function'))) {
      dbManager = arg1;
      chapterId = arg2;
    } else if (arg2 && (typeof arg2.isOpen === 'function' || (arg2.beats && typeof arg2.beats.findByChapterId === 'function'))) {
      dbManager = arg2;
      chapterId = arg1;
    } else {
      dbManager = arg1;
      chapterId = arg2;
    }

    if (!dbManager) {
      throw new NovelError('DatabaseManager is required for composition gate verification.', 'DB_MANAGER_REQUIRED');
    }

    const cleanChapterId = String(chapterId || '').trim();
    if (!cleanChapterId) {
      throw new NovelError('chapterId is required for composition gate verification.', 'MISSING_CHAPTER_ID');
    }

    const beats = dbManager.beats.findByChapterId(cleanChapterId);
    if (!beats || beats.length === 0) {
      throw new NovelError(
        `No scene beats found for chapter "${cleanChapterId}". Plan beats first.`,
        'CHAPTER_BEATS_EMPTY',
        { chapterId: cleanChapterId }
      );
    }

    const unconfirmed = beats.filter(b => b.status === 'draft');
    if (unconfirmed.length > 0) {
      const unconfirmedBeatIds = unconfirmed.map(b => b.beat_id);
      throw new NovelError(
        `Cannot compose chapter draft: ${unconfirmed.length} beat(s) in chapter "${cleanChapterId}" are still in 'draft' status (${unconfirmedBeatIds.join(', ')}). All beats must be confirmed before chapter composition.`,
        'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS',
        {
          chapterId: cleanChapterId,
          unconfirmedCount: unconfirmed.length,
          unconfirmedBeatIds
        }
      );
    }

    return {
      ready: true,
      chapterId: cleanChapterId,
      totalBeats: beats.length
    };
  }
}

module.exports = BeatCommands;
