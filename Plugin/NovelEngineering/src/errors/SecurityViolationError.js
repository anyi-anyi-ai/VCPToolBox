/**
 * @file SecurityViolationError.js
 * @description Thrown on sandbox escapes, unauthorized vault writes, or illegal path traversals.
 * @module errors/SecurityViolationError
 */

'use strict';

const NovelError = require('./NovelError');

class SecurityViolationError extends NovelError {
  /**
   * @param {string} message
   * @param {object} [details={}]
   */
  constructor(message, details = {}) {
    super(message, 'SECURITY_VIOLATION', details);
  }
}

module.exports = SecurityViolationError;
