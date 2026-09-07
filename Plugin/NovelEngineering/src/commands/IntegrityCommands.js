/**
 * @file IntegrityCommands.js
 * @description Command handlers for Milestone 3 (R3): Multi-Dimensional Quality Gate
 * @module commands/IntegrityCommands
 */

'use strict';

const { DraftIntegrityEvaluator } = require('../integrity/DraftIntegrityEvaluator');

async function handleEvaluateDraftIntegrity(params, context) {
  const evaluator = new DraftIntegrityEvaluator(context.dbManager, context);
  return evaluator.evaluateIntegrity(params);
}

async function handleCreateRevisionTasks(params, context) {
  const evaluator = new DraftIntegrityEvaluator(context.dbManager, context);
  return evaluator.createRevisionTasks(params);
}

module.exports = {
  handleEvaluateDraftIntegrity,
  handleCreateRevisionTasks
};
