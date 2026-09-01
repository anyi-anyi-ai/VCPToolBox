/**
 * @file index.js
 * @description Centralized exports for all NovelEngineering typed error classes.
 * @module errors
 */

'use strict';

const NovelError = require('./NovelError');
const SchemaMismatchError = require('./SchemaMismatchError');
const GovernanceSafetyError = require('./GovernanceSafetyError');
const SecurityViolationError = require('./SecurityViolationError');
const MigrationError = require('./MigrationError');
const ConsistencyError = require('./ConsistencyError');
const CollaborationError = require('./CollaborationError');

module.exports = {
  NovelError,
  SchemaMismatchError,
  GovernanceSafetyError,
  SecurityViolationError,
  MigrationError,
  ConsistencyError,
  CollaborationError
};

