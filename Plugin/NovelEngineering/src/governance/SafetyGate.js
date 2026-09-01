/**
 * @file SafetyGate.js
 * @description Mandatory Confirmation Gate and Audit Logging for Governance Mutations
 * @module governance/SafetyGate
 * @license MIT
 */

'use strict';

const { GovernanceSafetyError } = require('../errors');

class SafetyGate {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {string} [options.requiredToken='CONFIRM_CANON_CHANGE']
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required for SafetyGate.');
    }
    this.dbManager = dbManager;
    this.requiredToken = options.requiredToken || 'CONFIRM_CANON_CHANGE';
  }

  /**
   * Verifies the mandatory confirmation token
   * @param {object} params
   * @param {string} operation
   * @throws {GovernanceSafetyError}
   * @returns {boolean}
   */
  verifyConfirmation(params = {}, operation = 'CanonMutation') {
    const token = params.confirmationToken || params.confirmation_token;
    const boolFlag = params.confirmCanonChange === true || params.confirm_canon_change === true;

    const isValid = token === this.requiredToken || (boolFlag && token === undefined);

    if (!isValid || (token !== undefined && token !== this.requiredToken)) {
      throw new GovernanceSafetyError(
        `SafetyGate: Action "${operation}" rejected. Modifying canon level or lifecycle status requires explicit confirmation token "${this.requiredToken}".`,
        {
          code: 'GOVERNANCE_CONFIRMATION_REQUIRED',
          operation,
          requiredToken: this.requiredToken,
          providedToken: token || null,
          targetType: params.targetType || params.target_type || null,
          targetId: params.targetId || params.target_id || params.sourceFileId || params.filePath || params.entityId || null
        }
      );
    }

    return true;
  }

  /**
   * Validates promotion state rules (anti-silent-promotion)
   * @param {object} target - Target entity or source_file record
   * @param {'source_file'|'entity'} targetType
   * @param {number} targetCanonLevel - Target canon level (1, 2, 3)
   * @throws {GovernanceSafetyError}
   * @returns {boolean}
   */
  validatePromotionRules(target, targetType, targetCanonLevel) {
    if (!target) {
      throw new GovernanceSafetyError(`Target ${targetType} does not exist for promotion.`, {
        code: 'TARGET_NOT_FOUND',
        targetType
      });
    }

    if (target.status === 'archived' || target.status === 'deleted') {
      throw new GovernanceSafetyError(
        `Cannot promote ${targetType} with status "${target.status}". Target must be active before promotion.`,
        {
          code: 'INVALID_STATUS_FOR_PROMOTION',
          targetType,
          targetId: target.entity_id || target.relative_path || target.id,
          currentStatus: target.status
        }
      );
    }

    // Rule: Reject direct silent promotion of drafts / unreviewed content to canon (level >= 2)
    const normalizedReview = (target.review_status || '').toLowerCase().trim();
    const isReviewed = normalizedReview === 'reviewed' || normalizedReview === 'confirmed';

    if (targetCanonLevel >= 2 && !isReviewed) {
      throw new GovernanceSafetyError(
        `Direct silent promotion of unreviewed draft to canon (level ${targetCanonLevel}) is prohibited. Target must pass editorial review (review_status='reviewed') before canon promotion. Current review_status is "${target.review_status}".`,
        {
          code: 'UNREVIEWED_DRAFT_CANON_BLOCKED',
          targetType,
          targetId: target.entity_id || target.relative_path || target.id,
          currentReviewStatus: target.review_status,
          currentCanonLevel: target.canon_level || 0,
          targetCanonLevel
        }
      );
    }

    return true;
  }

  /**
   * Validates deprecation state rules
   * @param {object} target
   * @param {'source_file'|'entity'} targetType
   * @throws {GovernanceSafetyError}
   * @returns {boolean}
   */
  validateDeprecationRules(target, targetType) {
    if (!target) {
      throw new GovernanceSafetyError(`Target ${targetType} does not exist for deprecation.`, {
        code: 'TARGET_NOT_FOUND',
        targetType
      });
    }

    if (target.status === 'deleted') {
      throw new GovernanceSafetyError(`Target ${targetType} is already deleted.`, {
        code: 'ALREADY_DELETED',
        targetType,
        targetId: target.entity_id || target.relative_path || target.id
      });
    }

    return true;
  }

  /**
   * Executes a mutation inside an ACID transaction with audit logging
   * @param {object} options
   * @param {string} options.changeType - 'PROMOTE_CANON' | 'DEPRECATE_SOURCE' | 'UPDATE_REVIEW_STATUS'
   * @param {'source_file'|'entity'|'chapter'} options.targetType
   * @param {string} options.targetId
   * @param {number} [options.targetDbId]
   * @param {object} options.beforeState
   * @param {string} [options.operator='system']
   * @param {string} [options.reason]
   * @param {object} [options.impactSummary]
   * @param {Function} options.mutationFn - Callback executing DB updates
   * @returns {{ mutationResult: object, changeRecord: object }}
   */
  executeWithAudit(options) {
    const {
      changeType,
      targetType,
      targetId,
      targetDbId = null,
      beforeState,
      operator = 'system',
      reason = null,
      impactSummary = null,
      mutationFn
    } = options;

    let mutationResult = null;
    let changeRecord = null;

    const tx = this.dbManager.transaction(() => {
      // 1. Execute mutation
      mutationResult = mutationFn();

      // 2. Derive afterState
      const afterState = mutationResult && mutationResult.afterState
        ? mutationResult.afterState
        : mutationResult;

      // 3. Record audit entry in canon_changes
      changeRecord = this.dbManager.canonChanges.recordChange({
        change_type: changeType,
        target_type: targetType,
        target_id: String(targetId),
        target_db_id: targetDbId,
        before_state_json: beforeState,
        after_state_json: afterState,
        confirmation_token: this.requiredToken,
        confirmed_by_flag: 1,
        operator,
        reason,
        impact_summary_json: impactSummary
      });
    });

    tx();

    return {
      mutationResult,
      changeRecord
    };
  }
}

module.exports = SafetyGate;
