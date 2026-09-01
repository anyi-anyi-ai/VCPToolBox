/**
 * @file GovernanceSafetyError.js
 * @description Thrown when a governance mutation is attempted without mandatory confirmation or violates state transitions.
 * @module errors/GovernanceSafetyError
 */

'use strict';

const NovelError = require('./NovelError');

class GovernanceSafetyError extends NovelError {
  /**
   * @param {string} message
   * @param {string|object} [codeOrDetails={}]
   * @param {object} [maybeDetails={}]
   */
  constructor(message, codeOrDetails = {}, maybeDetails = {}) {
    let code = 'GOVERNANCE_CONFIRMATION_REQUIRED';
    let details = {};
    if (typeof codeOrDetails === 'string') {
      code = codeOrDetails;
      details = maybeDetails || {};
    } else if (codeOrDetails && typeof codeOrDetails === 'object') {
      details = codeOrDetails;
      code = details.code || 'GOVERNANCE_CONFIRMATION_REQUIRED';
    }
    super(message, code, details);
  }
}

module.exports = GovernanceSafetyError;
