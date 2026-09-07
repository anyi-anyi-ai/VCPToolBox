/**
 * @file BeatRepo.js
 * @description Typed CRUD repository for chapter_beats table with two-phase reorder and status lifecycle enforcement
 * @module db/repositories/BeatRepo
 */

'use strict';

const { NovelError } = require('../../errors');

const VALID_STATUSES = ['draft', 'confirmed', 'expanded', 'revised'];

const STATUS_PROGRESSION_ORDER = {
  draft: 0,
  confirmed: 1,
  expanded: 2,
  revised: 3
};

class BeatRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) throw new Error('Database instance is required for BeatRepo');
    this.db = db;
  }

  /**
   * Insert a new scene beat
   * @param {object} data
   * @returns {object}
   */
  insert(data) {
    if (!data) throw new NovelError('Beat data is required for insert.', 'INVALID_BEAT_DATA');

    const beatId = data.beat_id || data.beatId;
    if (!beatId || typeof beatId !== 'string') {
      throw new NovelError('Valid beat_id is required.', 'MISSING_BEAT_ID');
    }

    const chapterId = String(data.chapter_id || data.chapterId || '');
    if (!chapterId.trim()) {
      throw new NovelError('Valid chapter_id is required.', 'MISSING_CHAPTER_ID');
    }

    const sceneGoal = data.scene_goal || data.sceneGoal || '';
    if (!sceneGoal || typeof sceneGoal !== 'string' || !sceneGoal.trim()) {
      throw new NovelError('scene_goal is required for beat creation.', 'MISSING_BEAT_GOAL');
    }

    const beatOrder = Number(data.beat_order !== undefined ? data.beat_order : data.beatOrder) || 1;
    const initialStatus = (data.status || 'draft').toLowerCase().trim();

    if (!VALID_STATUSES.includes(initialStatus)) {
      throw new NovelError(`Invalid initial beat status: "${initialStatus}".`, 'INVALID_BEAT_STATUS');
    }

    const sql = 'INSERT INTO chapter_beats (' +
      'beat_id, chapter_id, beat_order, title, scene_goal, conflict, ' +
      'characters_json, location, world_rules_json, debt_action_json, ' +
      'emotional_tone, input_state_json, expected_output, status, version, content' +
      ') VALUES (' +
      '@beat_id, @chapter_id, @beat_order, @title, @scene_goal, @conflict, ' +
      '@characters_json, @location, @world_rules_json, @debt_action_json, ' +
      '@emotional_tone, @input_state_json, @expected_output, @status, @version, @content)';

    const stmt = this.db.prepare(sql);
    stmt.run({
      beat_id: beatId,
      chapter_id: chapterId,
      beat_order: beatOrder,
      title: data.title || '',
      scene_goal: sceneGoal.trim(),
      conflict: data.conflict || '',
      characters_json: typeof data.characters_json === 'string'
        ? data.characters_json
        : JSON.stringify(data.characters || data.characters_json || []),
      location: data.location || '',
      world_rules_json: typeof data.world_rules_json === 'string'
        ? data.world_rules_json
        : JSON.stringify(data.world_rules || data.worldRules || data.world_rules_json || []),
      debt_action_json: typeof data.debt_action_json === 'string'
        ? data.debt_action_json
        : (data.debt_action || data.debtAction ? JSON.stringify(data.debt_action || data.debtAction) : null),
      emotional_tone: data.emotional_tone || data.emotionalTone || '',
      input_state_json: typeof data.input_state_json === 'string'
        ? data.input_state_json
        : (data.input_state || data.inputState ? JSON.stringify(data.input_state || data.inputState) : null),
      expected_output: data.expected_output || data.expectedOutput || '',
      status: initialStatus,
      version: Number(data.version) || 1,
      content: data.content || null
    });

    return this.findByBeatId(beatId);
  }

  /**
   * Find a beat by unique beat_id
   * @param {string} beatId
   * @returns {object|null}
   */
  findByBeatId(beatId) {
    if (!beatId) return null;
    return this.db.prepare('SELECT * FROM chapter_beats WHERE beat_id = ?').get(String(beatId)) || null;
  }

  /**
   * Find all beats for a chapter ordered by beat_order ascending
   * @param {string|number} chapterId
   * @param {object} [filter={}]
   * @param {string} [filter.status]
   * @returns {Array<object>}
   */
  findByChapterId(chapterId, filter = {}) {
    const cid = String(chapterId);
    if (filter && filter.status && filter.status !== 'all') {
      return this.db.prepare(
        'SELECT * FROM chapter_beats WHERE chapter_id = ? AND status = ? ORDER BY beat_order ASC'
      ).all(cid, String(filter.status).toLowerCase().trim());
    }
    return this.db.prepare(
      'SELECT * FROM chapter_beats WHERE chapter_id = ? ORDER BY beat_order ASC'
    ).all(cid);
  }

  /**
   * Update a beat with version increment and status lifecycle validation
   * @param {string} beatId
   * @param {object} updates
   * @returns {object}
   */
  update(beatId, updates = {}) {
    const current = this.findByBeatId(beatId);
    if (!current) {
      throw new NovelError(`Beat "${beatId}" not found.`, 'BEAT_NOT_FOUND', { beatId });
    }

    const cleanUpdates = { ...updates };
    const resetStatus = Boolean(cleanUpdates.resetStatus);
    delete cleanUpdates.resetStatus;

    // Handle status progression
    let newStatus = current.status;
    if (resetStatus) {
      newStatus = 'draft';
    } else if (cleanUpdates.status !== undefined) {
      const candidateStatus = String(cleanUpdates.status).toLowerCase().trim();
      if (!VALID_STATUSES.includes(candidateStatus)) {
        throw new NovelError(`Invalid beat status: "${candidateStatus}".`, 'INVALID_BEAT_STATUS', { candidateStatus });
      }

      if (candidateStatus !== current.status) {
        // Enforce status progression: draft -> confirmed -> expanded -> revised
        const currentRank = STATUS_PROGRESSION_ORDER[current.status];
        const candidateRank = STATUS_PROGRESSION_ORDER[candidateStatus];

        const isStandardProgression = (candidateRank === currentRank + 1);
        const isRevisedRedraft = (current.status === 'revised' && (candidateStatus === 'revised' || candidateStatus === 'expanded'));
        const isDemotionToDraft = (candidateStatus === 'draft');

        if (!isStandardProgression && !isRevisedRedraft && !isDemotionToDraft) {
          throw new NovelError(
            `Invalid status transition from "${current.status}" to "${candidateStatus}". Allowed progression: draft -> confirmed -> expanded -> revised.`,
            'INVALID_BEAT_STATUS_TRANSITION',
            { currentStatus: current.status, candidateStatus }
          );
        }
        newStatus = candidateStatus;
      }
    }

    // Monotonically increment version unless explicitly provided
    let newVersion = current.version + 1;
    if (cleanUpdates.version !== undefined && !isNaN(Number(cleanUpdates.version))) {
      newVersion = Number(cleanUpdates.version);
    }

    // Field mapping
    const fieldMapping = {
      beatId: 'beat_id',
      beat_id: 'beat_id',
      chapterId: 'chapter_id',
      chapter_id: 'chapter_id',
      beatOrder: 'beat_order',
      beat_order: 'beat_order',
      title: 'title',
      sceneGoal: 'scene_goal',
      scene_goal: 'scene_goal',
      conflict: 'conflict',
      characters: 'characters_json',
      characters_json: 'characters_json',
      location: 'location',
      worldRules: 'world_rules_json',
      world_rules: 'world_rules_json',
      world_rules_json: 'world_rules_json',
      debtAction: 'debt_action_json',
      debt_action: 'debt_action_json',
      debt_action_json: 'debt_action_json',
      emotionalTone: 'emotional_tone',
      emotional_tone: 'emotional_tone',
      inputState: 'input_state_json',
      input_state: 'input_state_json',
      input_state_json: 'input_state_json',
      expectedOutput: 'expected_output',
      expected_output: 'expected_output',
      content: 'content'
    };

    const setClauses = [];
    const params = { beat_id: beatId };

    setClauses.push('status = @status');
    params.status = newStatus;

    setClauses.push('version = @version');
    params.version = newVersion;

    setClauses.push("updated_at = datetime('now', 'localtime')");

    for (const [key, val] of Object.entries(cleanUpdates)) {
      if (key === 'status' || key === 'version' || key === 'id' || key === 'created_at' || key === 'updated_at') {
        continue;
      }

      const colName = fieldMapping[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (colName === 'beat_id') continue;

      const paramKey = `val_${colName}`;
      let processedVal = val;

      if (['characters_json', 'world_rules_json', 'debt_action_json', 'input_state_json'].includes(colName)) {
        if (typeof val === 'object' && val !== null) {
          processedVal = JSON.stringify(val);
        }
      }

      setClauses.push(`${colName} = @${paramKey}`);
      params[paramKey] = processedVal;
    }

    const sql = `UPDATE chapter_beats SET ${setClauses.join(', ')} WHERE beat_id = @beat_id`;
    this.db.prepare(sql).run(params);

    return this.findByBeatId(beatId);
  }

  /**
   * Reorder beats sequentially inside a TWO-PHASE TRANSACTION
   * Phase 1: Set temporary negative order to prevent UNIQUE(chapter_id, beat_order) collision.
   * Phase 2: Set final positive sequential order and increment version.
   * @param {string|number} chapterId
   * @param {Array<string>} orderedBeatIds
   * @returns {Array<object>}
   */
  updateOrder(chapterId, orderedBeatIds = []) {
    const cid = String(chapterId);

    if (!Array.isArray(orderedBeatIds) || orderedBeatIds.length === 0) {
      throw new NovelError('orderedBeatIds must be a non-empty array of beat IDs.', 'INVALID_BEAT_ORDER_PARAM');
    }

    // Phase 1: Update to temporary negative orders
    const toTempStmt = this.db.prepare(
      "UPDATE chapter_beats SET beat_order = ?, updated_at = datetime('now', 'localtime') WHERE beat_id = ? AND chapter_id = ?"
    );

    // Phase 2: Update to final positive 1-based sequential orders with version increment
    const toFinalStmt = this.db.prepare(
      "UPDATE chapter_beats SET beat_order = ?, version = version + 1, updated_at = datetime('now', 'localtime') WHERE beat_id = ? AND chapter_id = ?"
    );

    const tx = this.db.transaction((beatIds) => {
      // Step 1: Negate beat_order to free positive slots and prevent UNIQUE collisions
      for (let i = 0; i < beatIds.length; i++) {
        toTempStmt.run(-(i + 1), String(beatIds[i]), cid);
      }

      // Step 2: Assign target contiguous 1-based positive order and bump version
      for (let i = 0; i < beatIds.length; i++) {
        toFinalStmt.run(i + 1, String(beatIds[i]), cid);
      }
    });

    tx(orderedBeatIds);
    return this.findByChapterId(cid);
  }

  /**
   * Delete all beats for a chapter
   * @param {string|number} chapterId
   * @returns {object} SQLite RunResult
   */
  deleteByChapterId(chapterId) {
    return this.db.prepare('DELETE FROM chapter_beats WHERE chapter_id = ?').run(String(chapterId));
  }

  /**
   * Delete a beat by unique beat_id
   * @param {string} beatId
   * @returns {object} SQLite RunResult
   */
  deleteByBeatId(beatId) {
    return this.db.prepare('DELETE FROM chapter_beats WHERE beat_id = ?').run(String(beatId));
  }
}

module.exports = BeatRepo;