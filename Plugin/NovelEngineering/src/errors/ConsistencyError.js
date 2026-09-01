/**
 * @file ConsistencyError.js
 * @description Thrown when novel lore consistency validation detects contradictions or invariant violations.
 * @module errors/ConsistencyError
 */

'use strict';

const NovelError = require('./NovelError');

class ConsistencyError extends NovelError {
  /**
   * @param {string} message
   * @param {object} [details={}]
   */
  constructor(message, details = {}) {
    super(message, 'CONSISTENCY_ERROR', details);
  }
}

module.exports = ConsistencyError;
