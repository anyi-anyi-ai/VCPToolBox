/**
 * @file CollaborationError.js
 * @description Typed error hierarchy for Phase 4 VCP Collaboration Protocol layer.
 * @module errors/CollaborationError
 */

'use strict';

const NovelError = require('./NovelError');

class CollaborationError extends NovelError {
  /**
   * @param {string} message
   * @param {string|object} [codeOrDetails='COLLABORATION_ERROR']
   * @param {object} [maybeDetails={}]
   */
  constructor(message, codeOrDetails = 'COLLABORATION_ERROR', maybeDetails = {}) {
    let code = 'COLLABORATION_ERROR';
    let details = {};

    if (typeof codeOrDetails === 'string') {
      code = codeOrDetails;
      details = maybeDetails && typeof maybeDetails === 'object' ? maybeDetails : {};
    } else if (codeOrDetails && typeof codeOrDetails === 'object') {
      details = codeOrDetails;
      code = details.code || 'COLLABORATION_ERROR';
    }

    super(message, code, details);
  }

  // Pre-defined Error Code Constants
  static get CODES() {
    return {
      COLLABORATION_ERROR: 'COLLABORATION_ERROR',
      SEMANTIC_OVERRIDE_PREVENTED: 'SEMANTIC_OVERRIDE_PREVENTED',
      TRACE_NOT_FOUND: 'TRACE_NOT_FOUND',
      INTEGRITY_COMPROMISED: 'INTEGRITY_COMPROMISED',
      DECISION_QUEUE_ERROR: 'DECISION_QUEUE_ERROR',
      DECISION_NOT_FOUND: 'DECISION_NOT_FOUND',
      DECISION_ALREADY_REVIEWED: 'DECISION_ALREADY_REVIEWED',
      MEMORY_PUBLISH_ERROR: 'MEMORY_PUBLISH_ERROR',
      CANON_LEAKAGE_DETECTED: 'CANON_LEAKAGE_DETECTED',
      CONTEXT_BUDGET_EXCEEDED: 'CONTEXT_BUDGET_EXCEEDED',
      INVALID_COLLABORATION_PAYLOAD: 'INVALID_COLLABORATION_PAYLOAD'
    };
  }
}

module.exports = CollaborationError;
