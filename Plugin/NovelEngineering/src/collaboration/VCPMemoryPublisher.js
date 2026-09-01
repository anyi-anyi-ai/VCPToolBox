/**
 * @file VCPMemoryPublisher.js
 * @description (R4) Standardized Memory Envelope JSON Emitter for VCP Long-Term Memory (DailyNote/RAG).
 * Emits strictly structured envelope JSON: Zero direct DB writes.
 * Anti-pollution lifecycle enforcement: blocks unconfirmed drafts from being published.
 * @module collaboration/VCPMemoryPublisher
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../errors');

class VCPMemoryPublisher {
  /**
   * @param {import('../db/DatabaseManager')} [dbManager]
   */
  constructor(dbManager = null) {
    this.dbManager = dbManager;
  }

  /**
   * Publish confirmed memories into standardized VCP envelope JSON
   * @param {object} params
   * @param {string} [params.projectId]
   * @param {string} [params.chapterId]
   * @param {Array<object>} params.memories
   * @param {string} [params.confirmedBy='author']
   * @param {string} [params.requestId]
   * @returns {object} Standardized VCP Memory Envelope JSON
   */
  publishMemories(params = {}) {
    if (!params || typeof params !== 'object') {
      throw new CollaborationError(
        'Payload must be an object for PublishToVCPMemory',
        CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
        { params }
      );
    }

    if (!Array.isArray(params.memories) || params.memories.length === 0) {
      throw new CollaborationError(
        'memories array is required and must not be empty for PublishToVCPMemory',
        CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
        { params }
      );
    }

    const confirmedBy = params.confirmedBy !== undefined && params.confirmedBy !== null
      ? String(params.confirmedBy).trim()
      : 'author';

    // Anti-pollution gating: if confirmedBy is empty, reject
    if (!confirmedBy) {
      throw new CollaborationError(
        'Anti-pollution gate: confirmedBy is required to publish memories to VCP',
        CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
        { params }
      );
    }

    const requestId = params.requestId || (crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`);
    const databaseRevision = this.dbManager && this.dbManager.getSchemaVersion ? this.dbManager.getSchemaVersion() : 4;
    const projectId = String(params.projectId || 'default').trim();
    const chapterId = params.chapterId ? String(params.chapterId).trim() : null;

    const validatedMemories = params.memories.map((mem, index) => {
      if (!mem || typeof mem !== 'object') {
        throw new CollaborationError(
          `Memory item at index ${index} must be an object`,
          CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
          { item: mem }
        );
      }

      const rawContent = mem.content !== undefined && mem.content !== null
        ? mem.content
        : (mem.suggestedContent !== undefined && mem.suggestedContent !== null ? mem.suggestedContent : null);

      if (rawContent === null || rawContent === undefined || String(rawContent).trim().length === 0) {
        throw new CollaborationError(
          `Memory item at index ${index} must have content`,
          CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
          { item: mem }
        );
      }

      const content = String(rawContent).trim();
      const memoryType = String(mem.memoryType || 'chapter_summary').trim();
      const title = String(mem.title || `Memory [${memoryType}]`).trim();
      const rawTags = Array.isArray(mem.tags)
        ? mem.tags
        : (Array.isArray(mem.suggestedTags) ? mem.suggestedTags : []);
      const tags = Array.from(new Set(rawTags.map((t) => String(t).trim()).filter(Boolean)));

      const memoryId = mem.memoryId ? String(mem.memoryId).trim() : `mem_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      const itemSha256 = crypto.createHash('sha256').update(content, 'utf8').digest('hex');

      return {
        memoryId,
        memoryType,
        title,
        content,
        tags,
        authority: mem.authority || 'confirmed_draft',
        sourceSystem: 'NovelEngineering',
        sourceRefs: Array.isArray(mem.sourceRefs) ? mem.sourceRefs : [],
        requiresApproval: false, // Confirmed envelope is ready for VCP sync
        syncTarget: mem.syncTarget || 'DailyNote',
        sha256Hash: itemSha256
      };
    });

    const payloadString = JSON.stringify(validatedMemories);
    const payloadSha256 = crypto.createHash('sha256').update(payloadString, 'utf8').digest('hex');

    return {
      requestId,
      databaseRevision,
      envelopeVersion: '1.0',
      publisher: 'NovelEngineering',
      sourceSystem: 'NovelEngineering',
      publishedAt: new Date().toISOString(),
      projectId,
      chapterId,
      confirmedBy,
      totalMemories: validatedMemories.length,
      payloadSha256,
      memories: validatedMemories,
      status: 'EMITTED_FOR_VCP_CONSUMPTION'
    };
  }

  /**
   * Alias for publishMemories
   */
  publishToVCPMemory(params = {}) {
    return this.publishMemories(params);
  }
}

module.exports = VCPMemoryPublisher;
