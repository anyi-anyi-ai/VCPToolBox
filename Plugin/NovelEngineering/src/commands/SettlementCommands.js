/**
 * @file SettlementCommands.js
 * @description Command handlers for Milestone 4 (R4): State Settlement & Rollback
 * @module commands/SettlementCommands
 */

'use strict';

const { StateSettlementManager } = require('../settlement/StateSettlementManager');

function getSettlementManager(context) {
  return new StateSettlementManager(context.dbManager, context.pathGuard, context);
}

async function handleExtractStateMutations(params, context) {
  return getSettlementManager(context).extractStateMutations(params);
}

async function handleReviewStateMutations(params, context) {
  return getSettlementManager(context).reviewStateMutations(params);
}

async function handleApplyStateMutations(params, context) {
  return getSettlementManager(context).applyStateMutations(params);
}

async function handleRollbackStateMutations(params, context) {
  return getSettlementManager(context).rollbackStateMutations(params);
}

async function handleGenerateLorePatch(params, context) {
  return getSettlementManager(context).generateLorePatch(params);
}

async function handleSyncLorePatch(params, context) {
  return getSettlementManager(context).syncLorePatch(params);
}

module.exports = {
  handleExtractStateMutations,
  handleReviewStateMutations,
  handleApplyStateMutations,
  handleRollbackStateMutations,
  handleGenerateLorePatch,
  handleSyncLorePatch
};
