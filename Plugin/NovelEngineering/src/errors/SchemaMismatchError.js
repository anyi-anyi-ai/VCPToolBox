/**
 * @file SchemaMismatchError.js
 * @description Thrown when database schema is invalid, missing required tables or columns, or unmigrated.
 * @module errors/SchemaMismatchError
 */

'use strict';

const NovelError = require('./NovelError');

class SchemaMismatchError extends NovelError {
  /**
   * @param {string} message
   * @param {object} [details={}]
   */
  constructor(message, details = {}) {
    super(message, 'SCHEMA_MISMATCH', details);
  }
}

module.exports = SchemaMismatchError;
