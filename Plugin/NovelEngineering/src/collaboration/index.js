/**
 * @file index.js
 * @description Centralized Exports for Phase 4 Collaboration Protocol Services.
 * @module collaboration
 */

'use strict';

const ContextBudgetEngine = require('./ContextBudgetEngine');
const VCPContextBuilder = require('./VCPContextBuilder');
const TraceManager = require('./TraceManager');
const CreativeDecisionQueue = require('./CreativeDecisionQueue');
const SuggestMemoryUpdate = require('./SuggestMemoryUpdate');
const VCPMemoryPublisher = require('./VCPMemoryPublisher');
const CanonLeakageEvaluator = require('./CanonLeakageEvaluator');
const QualityEvaluators = require('./QualityEvaluators');

const MemoryCollaborationService = require('./MemoryCollaborationService');

module.exports = {
  MemoryCollaborationService,
  ContextBudgetEngine,
  VCPContextBuilder,
  TraceManager,
  CreativeDecisionQueue,
  SuggestMemoryUpdate,
  VCPMemoryPublisher,
  CanonLeakageEvaluator,
  QualityEvaluators
};
