/**
 * @file DecisionQueueRepo.js
 * @description Typed CRUD, query and staging queue DAO for canon_changes_queue table (Phase 4).
 * Enforces strict isolation to ensure AI agent proposals never directly alter canon tables.
 * @module db/repositories/DecisionQueueRepo
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../../errors');

class DecisionQueueRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for DecisionQueueRepo');
    }
    this.db = db;
  }

  /**
   * Normalize and validate decision payload before SQL insertion
   * @private
   * @param {object} data
   * @returns {object} Normalized record
   */
  _normalizeRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new CollaborationError(
        'Decision payload must be a non-null object',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { data }
      );
    }

    const decisionType = data.decision_type || data.decisionType;
    if (!decisionType || typeof decisionType !== 'string') {
      throw new CollaborationError(
        'decision_type is required for enqueuing a creative decision',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { data }
      );
    }

    const proposer = data.proposer || data.author;
    if (!proposer || typeof proposer !== 'string') {
      throw new CollaborationError(
        'proposer is required for enqueuing a creative decision',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { data }
      );
    }

    const proposedChanges = data.proposed_changes_json !== undefined ? data.proposed_changes_json
      : data.proposed_changes !== undefined ? data.proposed_changes
      : data.proposedChanges !== undefined ? data.proposedChanges
      : data.changes;
    if (proposedChanges === undefined || proposedChanges === null) {
      throw new CollaborationError(
        'proposed_changes is required for enqueuing a creative decision',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { data }
      );
    }

    const toJSON = (val) => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    const proposedChangesJson = typeof proposedChanges === 'object'
      ? JSON.stringify(proposedChanges)
      : String(proposedChanges);

    const sourceEntitiesJson = toJSON(
      data.source_entities_json !== undefined ? data.source_entities_json
        : data.sourceEntities !== undefined ? data.sourceEntities
        : data.source_entities
    );
    const tagsJson = toJSON(
      data.tags_json !== undefined ? data.tags_json
        : data.tags !== undefined ? data.tags
        : null
    );

    const rawQueueId = data.queue_id !== undefined && data.queue_id !== null ? data.queue_id : data.queueId;
    const queueId = rawQueueId ? String(rawQueueId).trim() : `dec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const rawProjectId = data.project_id !== undefined && data.project_id !== null ? data.project_id : data.projectId;
    const projectId = String(rawProjectId !== undefined && rawProjectId !== null ? rawProjectId : 'default').trim();

    const priority = String(data.priority || 'normal').toLowerCase().trim();
    const status = String(data.status || 'pending_author_confirmation').toLowerCase().trim();

    const rawSourceSystem = data.source_system !== undefined && data.source_system !== null ? data.source_system : data.sourceSystem;
    const sourceSystem = String(rawSourceSystem !== undefined && rawSourceSystem !== null ? rawSourceSystem : 'NovelEngineering').trim();

    const authority = String(data.authority || 'agent_proposal').trim();

    const rawTargetEntityId = data.target_entity_id !== undefined && data.target_entity_id !== null ? data.target_entity_id : data.targetEntityId;
    const targetEntityId = rawTargetEntityId !== undefined && rawTargetEntityId !== null ? String(rawTargetEntityId).trim() : null;

    const rawChapterId = data.chapter_id !== undefined && data.chapter_id !== null ? data.chapter_id : data.chapterId;
    const chapterId = rawChapterId !== undefined && rawChapterId !== null ? String(rawChapterId).trim() : null;

    const rawReviewedBy = data.reviewed_by !== undefined && data.reviewed_by !== null ? data.reviewed_by : data.reviewedBy;
    const reviewedBy = rawReviewedBy !== undefined && rawReviewedBy !== null ? String(rawReviewedBy).trim() : null;

    const rawReviewedAt = data.reviewed_at !== undefined && data.reviewed_at !== null ? data.reviewed_at : data.reviewedAt;
    const reviewedAt = rawReviewedAt !== undefined && rawReviewedAt !== null ? rawReviewedAt : null;

    const rawReviewComment = data.review_comment !== undefined && data.review_comment !== null ? data.review_comment : data.reviewComment;
    const reviewComment = rawReviewComment !== undefined && rawReviewComment !== null ? String(rawReviewComment).trim() : null;

    // Compute SHA-256 hash of proposed changes if not provided
    const rawSha256 = data.sha256_hash !== undefined && data.sha256_hash !== null ? data.sha256_hash : data.sha256Hash;
    const sha256Hash = rawSha256 ? String(rawSha256).trim() : crypto
      .createHash('sha256')
      .update(proposedChangesJson, 'utf8')
      .digest('hex');

    return {
      queue_id: queueId,
      project_id: projectId,
      decision_type: String(decisionType).toUpperCase().trim(),
      proposer: String(proposer).trim(),
      author: data.author ? String(data.author).trim() : String(proposer).trim(),
      target_entity_id: targetEntityId,
      source_entities_json: sourceEntitiesJson,
      proposed_changes_json: proposedChangesJson,
      rationale: data.rationale ? String(data.rationale).trim() : null,
      chapter_id: chapterId,
      tags_json: tagsJson,
      priority,
      status,
      source_system: sourceSystem,
      authority,
      sha256_hash: sha256Hash,
      reviewed_by: reviewedBy,
      reviewed_at: reviewedAt,
      review_comment: reviewComment
    };
  }

  /**
   * Enqueue a new agent creative decision proposal into canon_changes_queue
   * @param {object} decisionData
   * @returns {object} Created and hydrated decision record
   */
  enqueue(decisionData) {
    const record = this._normalizeRecord(decisionData);
    const sql = `
      INSERT INTO canon_changes_queue (
        queue_id, project_id, decision_type, proposer, author, target_entity_id,
        source_entities_json, proposed_changes_json, rationale, chapter_id,
        tags_json, priority, status, source_system, authority, sha256_hash,
        reviewed_by, reviewed_at, review_comment, created_at, updated_at
      ) VALUES (
        @queue_id, @project_id, @decision_type, @proposer, @author, @target_entity_id,
        @source_entities_json, @proposed_changes_json, @rationale, @chapter_id,
        @tags_json, @priority, @status, @source_system, @authority, @sha256_hash,
        @reviewed_by, @reviewed_at, @review_comment, datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;

    const stmt = this.db.prepare(sql);
    stmt.run(record);
    return this.getByQueueId(record.queue_id);
  }

  /**
   * Alias for enqueue
   */
  insert(decisionData) {
    return this.enqueue(decisionData);
  }

  /**
   * Batch enqueue multiple decisions inside a single SQLite transaction
   * @param {Array<object>} decisions
   * @returns {Array<object>} Enqueued decision records
   */
  batchEnqueue(decisions) {
    if (!Array.isArray(decisions) || decisions.length === 0) {
      return [];
    }

    const records = decisions.map((d) => this._normalizeRecord(d));
    const sql = `
      INSERT INTO canon_changes_queue (
        queue_id, project_id, decision_type, proposer, author, target_entity_id,
        source_entities_json, proposed_changes_json, rationale, chapter_id,
        tags_json, priority, status, source_system, authority, sha256_hash,
        reviewed_by, reviewed_at, review_comment, created_at, updated_at
      ) VALUES (
        @queue_id, @project_id, @decision_type, @proposer, @author, @target_entity_id,
        @source_entities_json, @proposed_changes_json, @rationale, @chapter_id,
        @tags_json, @priority, @status, @source_system, @authority, @sha256_hash,
        @reviewed_by, @reviewed_at, @review_comment, datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;

    const stmt = this.db.prepare(sql);
    const tx = this.db.transaction((items) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    tx(records);
    return records.map((r) => this.getByQueueId(r.queue_id));
  }

  /**
   * Retrieve decision record by integer primary key ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM canon_changes_queue WHERE id = ?');
    const row = stmt.get(Number(id));
    return this._hydrateRow(row);
  }

  /**
   * Retrieve decision record by unique string queue_id
   * @param {string} queueId
   * @returns {object|null}
   */
  getByQueueId(queueId) {
    const stmt = this.db.prepare('SELECT * FROM canon_changes_queue WHERE queue_id = ?');
    const row = stmt.get(String(queueId));
    return this._hydrateRow(row);
  }

  /**
   * Query decisions with flexible filtering and pagination
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        clauses.push(`status IN (${filter.status.map((_, i) => `@st_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`st_${i}`] = String(s).toLowerCase(); });
      } else {
        clauses.push('status = @status');
        params.status = String(filter.status).toLowerCase();
      }
    }

    if (filter.decision_type || filter.decisionType) {
      const dt = filter.decision_type || filter.decisionType;
      if (Array.isArray(dt)) {
        clauses.push(`decision_type IN (${dt.map((_, i) => `@dt_${i}`).join(', ')})`);
        dt.forEach((t, i) => { params[`dt_${i}`] = String(t).toUpperCase(); });
      } else {
        clauses.push('decision_type = @decision_type');
        params.decision_type = String(dt).toUpperCase();
      }
    }

    if (filter.proposer || filter.author) {
      clauses.push('(proposer = @proposer OR author = @proposer)');
      params.proposer = String(filter.proposer || filter.author);
    }

    if (filter.target_entity_id || filter.targetEntityId) {
      clauses.push('target_entity_id = @target_entity_id');
      params.target_entity_id = String(filter.target_entity_id || filter.targetEntityId);
    }

    if (filter.project_id || filter.projectId) {
      clauses.push('project_id = @project_id');
      params.project_id = String(filter.project_id || filter.projectId);
    }

    if (filter.chapter_id || filter.chapterId) {
      clauses.push('chapter_id = @chapter_id');
      params.chapter_id = String(filter.chapter_id || filter.chapterId);
    }

    if (filter.priority) {
      clauses.push('priority = @priority');
      params.priority = String(filter.priority).toLowerCase();
    }

    if (filter.query || filter.search || filter.rationale) {
      const kw = filter.query || filter.search || filter.rationale;
      clauses.push('(rationale LIKE @kw OR target_entity_id LIKE @kw OR queue_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const validSortCols = new Set(['id', 'created_at', 'updated_at', 'priority', 'status', 'decision_type']);
    const orderBy = validSortCols.has(filter.orderBy) ? filter.orderBy : 'id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let sql = `SELECT * FROM canon_changes_queue ${whereClause} ORDER BY ${orderBy} ${direction}`;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 50);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._hydrateRow(r));
  }

  /**
   * Count decisions matching filter
   * @param {object} [filter={}]
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        clauses.push(`status IN (${filter.status.map((_, i) => `@st_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`st_${i}`] = String(s).toLowerCase(); });
      } else {
        clauses.push('status = @status');
        params.status = String(filter.status).toLowerCase();
      }
    }

    if (filter.decision_type || filter.decisionType) {
      const dt = filter.decision_type || filter.decisionType;
      if (Array.isArray(dt)) {
        clauses.push(`decision_type IN (${dt.map((_, i) => `@dt_${i}`).join(', ')})`);
        dt.forEach((t, i) => { params[`dt_${i}`] = String(t).toUpperCase(); });
      } else {
        clauses.push('decision_type = @decision_type');
        params.decision_type = String(dt).toUpperCase();
      }
    }

    if (filter.project_id || filter.projectId) {
      clauses.push('project_id = @project_id');
      params.project_id = String(filter.project_id || filter.projectId);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM canon_changes_queue ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Retrieve all pending decisions waiting for author confirmation
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  getPending(filter = {}) {
    return this.query({ ...filter, status: 'pending_author_confirmation' });
  }

  /**
   * Update decision status (e.g. approve, reject, apply, cancel)
   * @param {string|number} queueIdOrId
   * @param {string} newStatus
   * @param {object} [reviewData={}]
   * @returns {object} Updated decision record
   */
  updateStatus(queueIdOrId, newStatus, reviewData = {}) {
    const isNum = typeof queueIdOrId === 'number' || /^\d+$/.test(String(queueIdOrId));
    const existing = isNum ? this.getById(Number(queueIdOrId)) : this.getByQueueId(String(queueIdOrId));

    if (!existing) {
      throw new CollaborationError(
        `Creative decision record not found: ${queueIdOrId}`,
        CollaborationError.CODES.DECISION_NOT_FOUND,
        { queueIdOrId }
      );
    }

    const reviewedBy = reviewData.reviewed_by || reviewData.reviewedBy || reviewData.author || 'author';
    const reviewComment = reviewData.review_comment || reviewData.reviewComment || reviewData.comment || null;
    const reviewedAt = reviewData.reviewed_at || reviewData.reviewedAt || new Date().toISOString();

    const sql = isNum
      ? `UPDATE canon_changes_queue
         SET status = @status, reviewed_by = @reviewed_by, reviewed_at = @reviewed_at,
             review_comment = @review_comment, updated_at = datetime('now', 'localtime')
         WHERE id = @id`
      : `UPDATE canon_changes_queue
         SET status = @status, reviewed_by = @reviewed_by, reviewed_at = @reviewed_at,
             review_comment = @review_comment, updated_at = datetime('now', 'localtime')
         WHERE queue_id = @queue_id`;

    const params = {
      status: String(newStatus).toLowerCase().trim(),
      reviewed_by: String(reviewedBy).trim(),
      reviewed_at: reviewedAt,
      review_comment: reviewComment ? String(reviewComment).trim() : null
    };

    if (isNum) params.id = Number(queueIdOrId);
    else params.queue_id = String(queueIdOrId);

    const stmt = this.db.prepare(sql);
    stmt.run(params);

    return isNum ? this.getById(Number(queueIdOrId)) : this.getByQueueId(String(queueIdOrId));
  }

  /**
   * Review a decision with explicit approval/rejection details
   * @param {string|number} queueIdOrId
   * @param {object} reviewData
   * @param {'approved'|'rejected'|'applied'|'cancelled'} reviewData.status
   * @param {string} [reviewData.reviewedBy]
   * @param {string} [reviewData.reviewComment]
   * @returns {object}
   */
  reviewDecision(queueIdOrId, reviewData) {
    if (!reviewData || !reviewData.status) {
      throw new CollaborationError(
        'reviewDecision requires a status in reviewData',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { reviewData }
      );
    }
    return this.updateStatus(queueIdOrId, reviewData.status, reviewData);
  }

  /**
   * Approve a decision
   * @param {string|number} queueIdOrId
   * @param {string} [reviewer='author']
   * @param {string} [comment='Approved by author']
   * @returns {object}
   */
  approve(queueIdOrId, reviewer = 'author', comment = 'Approved by author') {
    return this.updateStatus(queueIdOrId, 'approved', {
      reviewedBy: reviewer,
      reviewComment: comment
    });
  }

  /**
   * Reject a decision
   * @param {string|number} queueIdOrId
   * @param {string} [reviewer='author']
   * @param {string} [comment='Rejected by author']
   * @returns {object}
   */
  reject(queueIdOrId, reviewer = 'author', comment = 'Rejected by author') {
    return this.updateStatus(queueIdOrId, 'rejected', {
      reviewedBy: reviewer,
      reviewComment: comment
    });
  }

  /**
   * Delete decision record by queue_id
   * @param {string} queueId
   * @returns {boolean}
   */
  deleteByQueueId(queueId) {
    const stmt = this.db.prepare('DELETE FROM canon_changes_queue WHERE queue_id = ?');
    const info = stmt.run(String(queueId));
    return info.changes > 0;
  }

  /**
   * Delete decision record by integer PK id
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM canon_changes_queue WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Aggregate statistics for creative decision queue
   * @param {string} [projectId]
   * @returns {object}
   */
  getSummary(projectId = null) {
    const where = projectId ? 'WHERE project_id = ?' : '';
    const params = projectId ? [projectId] : [];

    const total = this.count(projectId ? { projectId } : {});

    const statusRows = this.db.prepare(
      `SELECT status, COUNT(*) AS count FROM canon_changes_queue ${where} GROUP BY status`
    ).all(...params);

    const typeRows = this.db.prepare(
      `SELECT decision_type, COUNT(*) AS count FROM canon_changes_queue ${where} GROUP BY decision_type`
    ).all(...params);

    const proposerRows = this.db.prepare(
      `SELECT proposer, COUNT(*) AS count FROM canon_changes_queue ${where} GROUP BY proposer`
    ).all(...params);

    const byStatus = {};
    for (const r of statusRows) byStatus[r.status] = r.count;

    const byDecisionType = {};
    for (const r of typeRows) byDecisionType[r.decision_type] = r.count;

    const byProposer = {};
    for (const r of proposerRows) byProposer[r.proposer] = r.count;

    const latest = this.db.prepare(
      `SELECT created_at FROM canon_changes_queue ${where} ORDER BY id DESC LIMIT 1`
    ).get(...params);

    return {
      total: total,
      totalDecisions: total,
      pendingCount: byStatus.pending_author_confirmation || 0,
      approvedCount: (byStatus.approved || 0) + (byStatus.approved_for_canon || 0),
      rejectedCount: byStatus.rejected || 0,
      appliedCount: byStatus.applied || 0,
      byStatus,
      byDecisionType,
      byProposer,
      latestDecisionAt: latest ? latest.created_at : null
    };
  }

  /**
   * Alias for getSummary
   * @param {string} [projectId]
   * @returns {object}
   */
  getStats(projectId = null) {
    return this.getSummary(projectId);
  }

  /**
   * Hydrate raw database row into structured object
   * @private
   * @param {object|null} row
   * @returns {object|null}
   */
  _hydrateRow(row) {
    if (!row) return null;

    let sourceEntities = null;
    let proposedChanges = null;
    let tags = null;

    if (row.source_entities_json) {
      try { sourceEntities = JSON.parse(row.source_entities_json); } catch (_) { sourceEntities = row.source_entities_json; }
    }
    if (row.proposed_changes_json) {
      try { proposedChanges = JSON.parse(row.proposed_changes_json); } catch (_) { proposedChanges = row.proposed_changes_json; }
    }
    if (row.tags_json) {
      try { tags = JSON.parse(row.tags_json); } catch (_) { tags = row.tags_json; }
    }

    return {
      id: row.id,
      queueId: row.queue_id,
      queue_id: row.queue_id,
      projectId: row.project_id,
      project_id: row.project_id,
      decisionType: row.decision_type,
      decision_type: row.decision_type,
      proposer: row.proposer,
      author: row.author,
      targetEntityId: row.target_entity_id,
      target_entity_id: row.target_entity_id,
      sourceEntities: sourceEntities || [],
      source_entities: sourceEntities || [],
      proposedChanges: proposedChanges || {},
      proposed_changes: proposedChanges || {},
      rationale: row.rationale,
      chapterId: row.chapter_id,
      chapter_id: row.chapter_id,
      tags: tags || [],
      priority: row.priority,
      status: row.status,
      sourceSystem: row.source_system,
      source_system: row.source_system,
      authority: row.authority,
      sha256Hash: row.sha256_hash,
      sha256_hash: row.sha256_hash,
      reviewedBy: row.reviewed_by,
      reviewed_by: row.reviewed_by,
      reviewer: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      reviewed_at: row.reviewed_at,
      reviewComment: row.review_comment,
      review_comment: row.review_comment,
      comment: row.review_comment,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      updated_at: row.updated_at
    };
  }
}

module.exports = DecisionQueueRepo;
