/**
 * @file MemoryCollaborationService.js
 * @description Centralized Memory Collaboration Service implementing SuggestMemoryUpdate (R7)
 * and PublishToVCPMemory (R4) with Anti-Pollution Lifecycle Gating.
 * Zero direct writes to external VCP databases or Obsidian 01-12 files.
 * @module collaboration/MemoryCollaborationService
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../errors');
const SuggestMemoryUpdate = require('./SuggestMemoryUpdate');
const VCPMemoryPublisher = require('./VCPMemoryPublisher');

class MemoryCollaborationService {
  /**
   * @param {import('../db/DatabaseManager')} [dbManager]
   */
  constructor(dbManager = null) {
    this.dbManager = dbManager;
    this.suggestEngine = new SuggestMemoryUpdate(dbManager);
    this.publisher = new VCPMemoryPublisher(dbManager);
  }

  /**
   * Proposes structured VCP DailyNote updates before author confirmation
   * Pure analytical proposal engine: Zero direct DB writes.
   * @param {object} params
   * @param {string} params.projectId
   * @param {string} [params.chapterId]
   * @param {string} params.draftContent
   * @param {object} [params.draftMetadata={}]
   * @param {object} [params.snapshotContext]
   * @param {string} [params.requestId]
   * @returns {object} Structured suggestions payload
   */
  suggestMemoryUpdate(params = {}) {
    return this.suggestEngine.suggestUpdates(params);
  }

  /**
   * Alias for suggestMemoryUpdate
   */
  suggestUpdates(params = {}) {
    return this.suggestMemoryUpdate(params);
  }

  /**
   * Publish confirmed memories into standardized VCP envelope JSON Schema 1.0
   * Anti-pollution enforcement: requires confirmedBy author approval.
   * Zero direct DB writes.
   * @param {object} params
   * @param {string} params.projectId
   * @param {string} [params.chapterId]
   * @param {Array<object>} params.memories
   * @param {string} [params.confirmedBy='author']
   * @param {string} [params.requestId]
   * @returns {object} Standardized VCP Memory Envelope JSON
   */
  publishToVCPMemory(params = {}) {
    return this.publisher.publishMemories(params);
  }

  /**
   * Alias for publishToVCPMemory
   */
  publishMemories(params = {}) {
    return this.publishToVCPMemory(params);
  }
}

module.exports = MemoryCollaborationService;
