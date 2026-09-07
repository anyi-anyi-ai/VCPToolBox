/**
 * @file BeatChoreographer.js
 * @description Scene beats orchestration, ordering, status transitions, and axiom binding
 * @module beats/BeatChoreographer
 * @license MIT
 */
'use strict';

const { NovelError } = require('../errors');

class BeatChoreographer {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   */
  constructor(dbManager) {
    if (!dbManager) throw new NovelError('DatabaseManager is required for BeatChoreographer');
    this.dbManager = dbManager;
  }

  /**
   * Automatically plan and generate 3-5 structured scene beats for a chapter
   */
  planSceneBeats(params = {}) {
    const chapterId = String(params.chapterId || params.chapter_id || '').trim();
    if (!chapterId) throw new NovelError('chapterId is required for planSceneBeats', 'INVALID_PARAMETER');

    const chapterGoal = String(params.chapterGoal || params.chapter_goal || '推进主线剧情').trim();
    const targetCount = Math.max(2, Math.min(6, parseInt(params.targetBeatsCount || params.targetCount || 4, 10)));
    const characters = Array.isArray(params.characters) ? params.characters : (params.focusEntities || ['主要出场角色']);
    const location = String(params.location || '场景主地点').trim();
    const worldRules = Array.isArray(params.worldRules || params.world_rules) ? (params.worldRules || params.world_rules) : [];
    const debtAction = params.debtAction || params.debt_action || null;

    // Clean existing draft beats for this chapter if forceReplan
    if (params.forceReplan) {
      this.dbManager.beats.deleteByChapterId(chapterId);
    }

    const defaultTemplates = [
      { phase: '起 (入场与铺垫)', goal: '建立当前场景局势，引出潜在张力', tone: '冷静压抑', conflict: '环境阻碍与情报迷雾' },
      { phase: '承 (交涉与推进)', goal: '核心交互，目标逼近，触发关键信息', tone: '步步紧逼', conflict: '动机冲突与利益试探' },
      { phase: '转 (冲突与危机)', goal: '突发变故或矛盾激化，角色面临抉择', tone: '紧张爆发', conflict: '实质危机与战力碰撞' },
      { phase: '合 (余波与悬念)', goal: '阶段性结果落地，抛出下一场景钩子', tone: '悬念悠长', conflict: '遗留悬念与债务兑现' }
    ];

    const beats = [];
    for (let i = 0; i < targetCount; i++) {
      const tpl = defaultTemplates[i] || defaultTemplates[defaultTemplates.length - 1];
      const beatId = 'BEAT_' + chapterId.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + String(i + 1).padStart(2, '0');
      const beatData = {
        beat_id: beatId,
        chapter_id: chapterId,
        beat_order: i + 1,
        title: '节拍 ' + (i + 1) + '：' + tpl.phase,
        scene_goal: chapterGoal + ' -> ' + tpl.goal,
        conflict: tpl.conflict,
        characters_json: JSON.stringify(characters),
        location: location,
        world_rules_json: JSON.stringify(worldRules),
        debt_action_json: i === targetCount - 1 && debtAction ? JSON.stringify(debtAction) : null,
        emotional_tone: tpl.tone,
        input_state_json: JSON.stringify({ phaseIndex: i + 1 }),
        expected_output: '完成' + tpl.phase + '阶段情节推进',
        status: 'draft',
        version: 1
      };
      const inserted = this.dbManager.beats.insert(beatData);
      beats.push(inserted);
    }

    return {
      status: 'success',
      chapterId,
      totalBeats: beats.length,
      beats,
      message: 'Successfully planned ' + beats.length + ' scene beats for chapter ' + chapterId
    };
  }

  getSceneBeats(params = {}) {
    const chapterId = String(params.chapterId || params.chapter_id || '').trim();
    if (!chapterId) throw new NovelError('chapterId is required for getSceneBeats', 'INVALID_PARAMETER');
    const beats = this.dbManager.beats.findByChapterId(chapterId);
    return { status: 'success', chapterId, totalBeats: beats.length, beats };
  }

  updateSceneBeat(params = {}) {
    const beatId = String(params.beatId || params.beat_id || '').trim();
    if (!beatId) throw new NovelError('beatId is required for updateSceneBeat', 'INVALID_PARAMETER');
    const existing = this.dbManager.beats.findByBeatId(beatId);
    if (!existing) throw new NovelError('Beat not found: ' + beatId, 'NOT_FOUND');
    const updates = { ...params.updates || params };
    delete updates.beatId; delete updates.beat_id;
    updates.version = (existing.version || 1) + 1;
    const updated = this.dbManager.beats.update(beatId, updates);
    return { status: 'success', beat: updated };
  }

  reorderSceneBeats(params = {}) {
    const chapterId = String(params.chapterId || params.chapter_id || '').trim();
    const orderedBeatIds = params.orderedBeatIds || params.ordered_beat_ids || [];
    if (!chapterId || !Array.isArray(orderedBeatIds) || orderedBeatIds.length === 0) {
      throw new NovelError('chapterId and non-empty orderedBeatIds array are required', 'INVALID_PARAMETER');
    }
    const reordered = this.dbManager.beats.updateOrder(chapterId, orderedBeatIds);
    return { status: 'success', chapterId, totalBeats: reordered.length, beats: reordered };
  }

  confirmSceneBeats(params = {}) {
    const chapterId = String(params.chapterId || params.chapter_id || '').trim();
    if (!chapterId) throw new NovelError('chapterId is required for confirmSceneBeats', 'INVALID_PARAMETER');
    const beats = this.dbManager.beats.findByChapterId(chapterId);
    if (beats.length === 0) throw new NovelError('No beats found to confirm for chapter: ' + chapterId, 'EMPTY_BEATS');
    for (const b of beats) {
      this.dbManager.beats.update(b.beat_id, { status: 'confirmed' });
    }
    const confirmedBeats = this.dbManager.beats.findByChapterId(chapterId);
    return {
      status: 'success',
      chapterId,
      confirmedCount: confirmedBeats.length,
      beats: confirmedBeats,
      message: 'All ' + confirmedBeats.length + ' scene beats confirmed and locked for chapter ' + chapterId
    };
  }
}
module.exports = BeatChoreographer;