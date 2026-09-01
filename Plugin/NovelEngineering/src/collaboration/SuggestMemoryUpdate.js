/**
 * @file SuggestMemoryUpdate.js
 * @description (R7) Proposes Structured DailyNote Memory Updates Before Author Confirmation.
 * Pure analytical proposal engine: Zero direct DB writes.
 * @module collaboration/SuggestMemoryUpdate
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../errors');

class SuggestMemoryUpdate {
  /**
   * @param {import('../db/DatabaseManager')} [dbManager]
   */
  constructor(dbManager = null) {
    this.dbManager = dbManager;
  }

  /**
   * Extract hashtags from draft content
   * @private
   * @param {string} text
   * @returns {Array<string>}
   */
  _extractInlineTags(text) {
    if (!text || typeof text !== 'string') return [];
    const matches = text.match(/#([\w\u4e00-\u9fa5\-]+)/g);
    if (!matches) return [];
    return matches.map((m) => m.slice(1).trim()).filter(Boolean);
  }

  /**
   * Analyze draft content and context to propose structured DailyNote memory updates
   * @param {object} params
   * @param {string} [params.projectId]
   * @param {string} [params.chapterId]
   * @param {string} params.draftContent
   * @param {object} [params.draftMetadata={}]
   * @param {object} [params.snapshotContext]
   * @param {string} [params.requestId]
   * @returns {object} Structured suggestions payload
   */
  suggestUpdates(params = {}) {
    if (!params || !params.draftContent || typeof params.draftContent !== 'string') {
      throw new CollaborationError(
        'draftContent (string) is required for SuggestMemoryUpdate',
        CollaborationError.CODES.COLLABORATION_VALIDATION_ERROR
      );
    }

    const requestId = params.requestId || (crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`);
    const databaseRevision = this.dbManager && this.dbManager.getSchemaVersion ? this.dbManager.getSchemaVersion() : 4;
    const projectId = String(params.projectId || 'default').trim();
    const chapterId = String(params.chapterId || 'general').trim();
    const draftText = params.draftContent;
    const meta = params.draftMetadata || {};

    const inlineTags = this._extractInlineTags(draftText);
    const metaTags = Array.isArray(meta.tags) ? meta.tags.map((t) => String(t).trim()).filter(Boolean) : [];

    const suggestions = [];

    // 1. Chapter Summary Proposal
    const firstParagraphs = draftText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const summarySnippet = firstParagraphs.slice(0, 3).join('\n\n').slice(0, 500);

    const chapterSummaryTags = Array.from(
      new Set(['chapter_summary', chapterId, projectId, ...metaTags, ...inlineTags].filter(Boolean))
    );

    suggestions.push({
      suggestionId: `sug_sum_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`,
      memoryType: 'chapter_summary',
      title: `${chapterId} 剧情进度与梗概`,
      suggestedContent: meta.summary || summarySnippet || `${chapterId} 正文完成，包含核心剧情推进。`,
      suggestedTags: chapterSummaryTags,
      sourceRefs: [
        {
          chapterId,
          projectId,
          sha256: crypto.createHash('sha256').update(draftText, 'utf8').digest('hex')
        }
      ],
      targetSection: `daily_notes/${new Date().toISOString().slice(0, 10)}`,
      requiresApproval: true,
      status: 'proposed'
    });

    // 2. Entity State Delta Proposals
    if (params.snapshotContext && Array.isArray(params.snapshotContext.canonFacts)) {
      params.snapshotContext.canonFacts.forEach((fact) => {
        if (fact.canonicalName && draftText.includes(fact.canonicalName)) {
          const entityTags = Array.from(
            new Set(['entity_update', fact.canonicalName, chapterId, ...metaTags].filter(Boolean))
          );

          suggestions.push({
            suggestionId: `sug_ent_${fact.entityId || fact.canonicalName}_${crypto.randomBytes(2).toString('hex')}`,
            memoryType: 'entity_state_delta',
            targetEntityId: fact.entityId || null,
            title: `实体状态变更: ${fact.canonicalName}`,
            suggestedContent: `在篇章 ${chapterId} 中，实体 ${fact.canonicalName} 参与了关键情节发展。`,
            suggestedTags: entityTags,
            sourceRefs: [
              {
                entityId: fact.entityId,
                sourceFileId: fact.sourceFileId || null,
                sha256: fact.sha256Hash || null
              }
            ],
            targetSection: 'entities/state_deltas',
            requiresApproval: true,
            status: 'proposed'
          });
        }
      });
    }

    return {
      requestId,
      databaseRevision,
      projectId,
      chapterId,
      generatedAt: new Date().toISOString(),
      totalSuggestions: suggestions.length,
      requiresApproval: true,
      flow: 'SuggestMemoryUpdate (propose) -> Author confirms -> PublishToVCPMemory (execute)',
      suggestions
    };
  }

  /**
   * Alias for suggestUpdates
   */
  suggestMemoryUpdate(params = {}) {
    return this.suggestUpdates(params);
  }
}

module.exports = SuggestMemoryUpdate;
