/**
 * @file MigrationError.js
 * @description Thrown when database migration execution, checksum verification, or version upgrade fails.
 * @module errors/MigrationError
 */

'use strict';

const NovelError = require('./NovelError');

class MigrationError extends NovelError {
  /**
   * @param {string} message
   * @param {object} [details={}]
   */
  constructor(message, details = {}) {
    super(message, 'MIGRATION_ERROR', details);
  }
}

module.exports = MigrationError;
