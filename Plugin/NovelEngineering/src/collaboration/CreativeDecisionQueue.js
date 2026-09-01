/**
 * @file CreativeDecisionQueue.js
 * @description Creative Decision Staging Queue with pending_author_confirmation and Zero Canon Mutation Isolation.
 * Clean delegation to DecisionQueueRepo with strict author confirmation gating.
 * @module collaboration/CreativeDecisionQueue
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../errors');

class CreativeDecisionQueue {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   */
  constructor(dbManager) {
    if (!dbManager) {
      throw new CollaborationError('DatabaseManager is required for CreativeDecisionQueue');
    }
    this.dbManager = dbManager;
    this.repo = dbManager.decisionQueue;
  }

  /**
   * Register a new agent creative proposal in the staging queue
   * Guarantees ZERO direct mutation to canon tables (entities, source_files, canon_changes)
   * @param {object} params
   * @returns {object} Created decision record with pending_author_confirmation status
   */
  registerDecision(params = {}) {
    if (!params || typeof params !== 'object') {
      throw new CollaborationError(
        'Creative decision payload must be a non-null object',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { params }
      );
    }

    const decisionType = params.decisionType || params.decision_type;
    if (!decisionType) {
      throw new CollaborationError(
        'decisionType is required for registering creative decision',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { params }
      );
    }

    const proposer = params.proposer || params.author || 'AI_Agent';
    const proposedChanges = params.proposedChanges !== undefined ? params.proposedChanges
      : (params.proposed_changes !== undefined ? params.proposed_changes : params.changes);
    if (proposedChanges === undefined || proposedChanges === null) {
      throw new CollaborationError(
        'proposedChanges is required for registering creative decision',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { params }
      );
    }

    // Force default pending status
    const record = {
      queue_id: params.queueId || params.queue_id,
      project_id: params.projectId || params.project_id || 'default',
      chapter_id: params.chapterId || params.chapter_id || null,
      decision_type: decisionType,
      proposer,
      author: proposer,
      target_entity_id: params.targetEntityId || params.target_entity_id || null,
      source_entities_json: params.sourceEntities || params.source_entities || [],
      proposed_changes_json: proposedChanges,
      rationale: params.rationale || null,
      tags_json: params.tags || [],
      priority: params.priority || 'normal',
      status: 'pending_author_confirmation',
      source_system: params.sourceSystem || 'NovelEngineering',
      authority: 'agent_proposal',
      sha256_hash: params.sha256Hash || params.sha256_hash
    };

    return this.repo.enqueue(record);
  }

  /**
   * Alias for registerDecision
   * @param {object} params
   * @returns {object}
   */
  enqueue(params) {
    return this.registerDecision(params);
  }

  /**
   * Batch register creative decisions inside a single transaction with flood rate protection
   * @param {Array<object>} decisions
   * @param {object} [options={}]
   * @returns {Array<object>} Enqueued decision records
   */
  batchRegisterDecisions(decisions = [], options = {}) {
    if (!Array.isArray(decisions)) {
      throw new CollaborationError('Decisions must be an array', CollaborationError.CODES.DECISION_QUEUE_ERROR);
    }

    const maxBatch = options.maxBatchSize || 500;
    if (decisions.length > maxBatch) {
      throw new CollaborationError(
        `Batch size ${decisions.length} exceeds maximum allowed limit of ${maxBatch}`,
        CollaborationError.CODES.DECISION_QUEUE_ERROR
      );
    }

    return this.repo.batchEnqueue(decisions);
  }

  /**
   * Alias for batchRegisterDecisions
   * @param {Array<object>} decisions
   * @param {object} [options={}]
   * @returns {Array<object>}
   */
  batchEnqueue(decisions, options) {
    return this.batchRegisterDecisions(decisions, options);
  }

  /**
   * Retrieve single decision by queueId
   * @param {string} queueId
   * @returns {object|null}
   */
  getDecision(queueId) {
    if (!queueId) return null;
    return this.repo.getByQueueId(String(queueId).trim());
  }

  /**
   * Alias for getDecision
   * @param {string} queueId
   * @returns {object|null}
   */
  getByQueueId(queueId) {
    return this.getDecision(queueId);
  }

  /**
   * Retrieve single decision by integer ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    return this.repo.getById(id);
  }

  /**
   * Query pending decisions waiting for author confirmation
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  getPendingDecisions(filter = {}) {
    return this.repo.getPending(filter);
  }

  /**
   * Alias for getPendingDecisions
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  getPending(filter = {}) {
    return this.getPendingDecisions(filter);
  }

  /**
   * Query decisions with filters
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  query(filter = {}) {
    return this.repo.query(filter);
  }

  /**
   * Review a decision (Approve / Reject / Update)
   * @param {string|number} queueId
   * @param {object} reviewData
   * @param {string} [reviewData.action] - 'approve' | 'reject'
   * @param {string} [reviewData.status] - 'approved' | 'rejected' | 'applied' | 'cancelled'
   * @param {string} [reviewData.reviewer='author']
   * @param {string} [reviewData.comment]
   * @returns {object} Updated decision record
   */
  reviewDecision(queueId, reviewData = {}) {
    const decision = typeof queueId === 'number' ? this.getById(queueId) : this.getDecision(queueId);
    if (!decision) {
      throw new CollaborationError(
        `Decision not found with queueId: ${queueId}`,
        CollaborationError.CODES.DECISION_NOT_FOUND,
        { queueId }
      );
    }

    let status = reviewData.status ? String(reviewData.status).toLowerCase().trim() : null;
    const reviewer = reviewData.reviewer || reviewData.reviewedBy || reviewData.author || 'author';
    const comment = reviewData.comment || reviewData.reviewComment || null;

    if (!status && reviewData.action) {
      const action = String(reviewData.action).toLowerCase().trim();
      if (action === 'approve') {
        status = 'approved_for_canon';
      } else if (action === 'reject') {
        status = 'rejected';
      } else {
        throw new CollaborationError(
          `Invalid review action "${reviewData.action}". Must be "approve" or "reject".`,
          CollaborationError.CODES.DECISION_QUEUE_ERROR
        );
      }
    }

    if (!status) {
      throw new CollaborationError(
        'reviewDecision requires action ("approve"|"reject") or status in reviewData',
        CollaborationError.CODES.DECISION_QUEUE_ERROR,
        { reviewData }
      );
    }

    return this.repo.updateStatus(queueId, status, {
      reviewedBy: reviewer,
      reviewComment: comment || (status === 'approved_for_canon' || status === 'approved' ? 'Approved by author' : 'Rejected by author'),
      reviewedAt: reviewData.reviewedAt || new Date().toISOString()
    });
  }

  /**
   * Update decision status
   * @param {string|number} queueIdOrId
   * @param {string} newStatus
   * @param {object} [reviewData={}]
   * @returns {object}
   */
  updateStatus(queueIdOrId, newStatus, reviewData = {}) {
    return this.repo.updateStatus(queueIdOrId, newStatus, reviewData);
  }

  /**
   * Get queue summary statistics
   * @param {string} [projectId]
   * @returns {object}
   */
  getQueueStats(projectId = null) {
    return this.repo.getSummary(projectId);
  }

  /**
   * Alias for getQueueStats
   * @param {string} [projectId]
   * @returns {object}
   */
  getSummary(projectId = null) {
    return this.getQueueStats(projectId);
  }

  /**
   * Delete decision record
   * @param {string} queueId
   * @returns {boolean}
   */
  deleteDecision(queueId) {
    return this.repo.deleteByQueueId(queueId);
  }

  /**
   * Alias for deleteDecision
   * @param {string} queueId
   * @returns {boolean}
   */
  deleteByQueueId(queueId) {
    return this.deleteDecision(queueId);
  }

  /**
   * Delete decision record by integer PK id
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    return this.repo.deleteById(id);
  }
}

module.exports = CreativeDecisionQueue;
