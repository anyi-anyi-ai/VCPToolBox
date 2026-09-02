/**
 * @file QueryCommands.js
 * @description Handlers for GetSourceFile, QueryEntities, and GetChapterContext commands (Context v3)
 * @module commands/QueryCommands
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ContextV3Engine = require('../context/ContextV3Engine');
const { SchemaMismatchError, SecurityViolationError } = require('../errors');

class QueryCommands {
  /**
   * Helper to generate a deterministic SHA-256 hash tracking stamp
   * @param {string|object|null} content
   * @param {string|null} existingHash
   * @returns {string} 64-character lowercase hexadecimal hash
   * @private
   */
  static _computeHashStamp(content, existingHash) {
    if (existingHash && typeof existingHash === 'string' && existingHash.length === 64) {
      return existingHash.toLowerCase();
    }
    const text = typeof content === 'string' ? content : (content ? JSON.stringify(content) : '');
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex').toLowerCase();
  }

  /**
   * Command 7: GetSourceFile
   * Retrieves comprehensive indexed metadata, frontmatter, entities, and anomalies for a single file.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetSourceFile(params, context) {
    const { dbManager, pathGuard } = context;
    const filePath = params.relativePath || params.filePath;
    const fileId = params.id || params.fileId;

    if (!filePath && !fileId) {
      throw new Error('GetSourceFile requires either "relativePath"/"filePath" or "id"/"fileId" parameter.');
    }

    let fileRecord = null;
    if (fileId) {
      fileRecord = dbManager.sourceFiles.getById(fileId);
    } else if (filePath) {
      // Normalize relative path if absolute was passed
      let relPath = filePath.replace(/\\/g, '/');
      if (pathGuard && pathGuard.vaultRoot && relPath.toLowerCase().startsWith(pathGuard.vaultRoot.replace(/\\/g, '/').toLowerCase())) {
        relPath = relPath.slice(pathGuard.vaultRoot.length).replace(/^[\\/]/, '');
      }
      fileRecord = dbManager.sourceFiles.getByRelativePath(relPath) || dbManager.sourceFiles.getByPath(filePath);
    }

    if (!fileRecord) {
      return {
        content: [
          {
            type: 'text',
            text: `File not found in index: ${filePath || fileId}`
          }
        ],
        details: {
          command: 'GetSourceFile',
          file: null
        }
      };
    }

    // Parse frontmatter
    let frontmatter = {};
    if (fileRecord.frontmatter_json) {
      try {
        frontmatter = JSON.parse(fileRecord.frontmatter_json);
      } catch (e) {
        console.warn(`[QueryCommands.GetSourceFile] Failed to parse frontmatter_json for file ${fileRecord.id}: ${e.message}`);
        frontmatter = {};
      }
    }

    // Get extracted entities
    const entities = dbManager.entities.query({ source_file_id: fileRecord.id });

    // Get active anomalies affecting this file
    const anomalies = dbManager.anomalies.query({ query: fileRecord.relative_path });

    // Include raw content if requested
    let rawContent = null;
    if (params.includeRawContent && fileRecord.file_path) {
      try {
        const readPath = pathGuard ? pathGuard.assertReadOnlyPath(fileRecord.file_path, 'r') : fileRecord.file_path;
        rawContent = fs.readFileSync(readPath, 'utf8');
      } catch (readErr) {
        if (readErr.name === 'SecurityError' || readErr.code === 'SECURITY_VIOLATION') {
          throw readErr;
        }
        console.warn(`[QueryCommands.GetSourceFile] Failed to read source file from disk (${fileRecord.file_path}): ${readErr.message}`);
        rawContent = fileRecord.frontmatter_raw || null;
      }
    }

    const filePayload = {
      id: fileRecord.id,
      relativePath: fileRecord.relative_path,
      fileName: fileRecord.file_name,
      sizeBytes: fileRecord.size_bytes,
      mtimeMs: fileRecord.mtime_ms,
      sha256: fileRecord.sha256_hash,
      category: fileRecord.source_category,
      status: fileRecord.status,
      reviewStatus: fileRecord.review_status,
      hasFrontmatter: Boolean(fileRecord.has_frontmatter),
      frontmatter,
      entities: entities.map(e => ({
        id: e.id,
        entityId: e.entity_id,
        canonicalName: e.canonical_name,
        type: e.entity_type,
        category: e.category,
        status: e.status,
        reviewStatus: e.review_status,
        summary: e.summary,
        aliases: e.aliases ? e.aliases.map(a => a.alias_name) : []
      })),
      anomalies: anomalies.map(a => ({
        id: a.id,
        ruleId: a.anomaly_rule_id,
        severity: a.severity,
        title: a.title,
        message: a.message
      }))
    };

    if (rawContent !== null) {
      filePayload.rawContent = rawContent;
    }

    return {
      content: [
        {
          type: 'text',
          text: `Retrieved metadata for \`${fileRecord.relative_path}\`.`
        }
      ],
      details: {
        command: 'GetSourceFile',
        file: filePayload
      }
    };
  }

  /**
   * Command 8: QueryEntities
   * Multi-criteria search and retrieval on canon entities catalog.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleQueryEntities(params, context) {
    const { dbManager } = context;
    const query = params.query || params.keyword || params.search || '';
    const entityType = params.entityType || params.type;
    const reviewStatus = params.reviewStatus;
    const status = params.status;
    const planet = params.planet;
    const includeAliases = params.includeAliases !== false;
    const limit = Number.isInteger(params.limit) ? params.limit : (params.limit ? parseInt(params.limit, 10) : 20);
    const offset = Number.isInteger(params.offset) ? params.offset : (params.offset ? parseInt(params.offset, 10) : 0);

    const filter = {
      limit,
      offset,
      includeAliases,
      orderBy: 'id',
      orderDirection: 'ASC'
    };

    if (query) filter.query = query;
    if (entityType && entityType !== 'ALL') filter.entity_type = entityType;
    if (reviewStatus && reviewStatus !== 'ALL') filter.review_status = reviewStatus;
    if (status && status !== 'ALL') filter.status = status;

    let results = dbManager.entities.query(filter);
    const totalMatches = dbManager.entities.count(filter);

    // Planet filter fallback if specified
    if (planet && planet !== 'ALL') {
      results = results.filter(e => {
        let attrs = {};
        if (e.attributes_json) {
          try {
            attrs = JSON.parse(e.attributes_json);
          } catch (err) {
            console.warn(`[QueryCommands.QueryEntities] Failed to parse attributes_json for entity ${e.id}: ${err.message}`);
            attrs = {};
          }
        }
        return (
          e.entity_type === 'planet' ||
          attrs.planet === planet ||
          attrs.parent_planet === planet ||
          (e.summary && e.summary.includes(planet))
        );
      });
    }

    const entities = results.map(e => {
      let aliases = [];
      if (e.aliases && Array.isArray(e.aliases)) {
        aliases = e.aliases.map(a => a.alias_name || a);
      }

      return {
        id: e.id,
        entityId: e.entity_id,
        canonicalName: e.canonical_name,
        entityType: e.entity_type,
        category: e.category,
        status: e.status,
        reviewStatus: e.review_status,
        summary: e.summary,
        aliases,
        sourceFile: e.source_file_relative_path || null
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${entities.length} matching entities (${totalMatches} total matching criteria).`
        }
      ],
      details: {
        command: 'QueryEntities',
        totalCount: totalMatches,
        limit,
        offset,
        entities
      }
    };
  }

  /**
   * Command: GetChapterContext (Context v3)
   * Multi-stage contextual aggregator for LLM chapter generation.
   * Delegates to ContextV3Engine.buildSnapshot to assemble global/scoped world rules,
   * canon & candidate lore, chapter sources, open foreshadowing, and structured timeline events.
   * @param {object} params
   * @param {string} [params.projectId] - Optional project identifier
   * @param {string|number} [params.chapterId] - Chapter identifier or number
   * @param {string|number} [params.chapterNumber] - Explicit chapter number
   * @param {number} [params.volumeNumber] - Optional volume number
   * @param {Array<string>|string} [params.focusEntities] - Entities or aliases to recall
   * @param {string} [params.sourcePolicy='canon_and_reviewed'] - Filtering policy ('canon_only'|'canon_and_reviewed'|'include_drafts'|'all')
   * @param {number} [params.maxTokens] - Max token budget
   * @param {boolean} [params.includeWorldRules=true] - Whether to include world rules
   * @param {boolean} [params.includeTimeline=true] - Whether to recall timeline events
   * @param {boolean} [params.includeForeshadowing=true] - Whether to recall open foreshadowing
   * @param {boolean} [params.includeRawContent=true] - Whether to load markdown text
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetChapterContext(params = {}, context = {}) {
    const { dbManager, pathGuard } = context;
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required in context for GetChapterContext.');
    }

    const engine = new ContextV3Engine(dbManager, { pathGuard });
    const result = engine.buildSnapshot(params);

    const chapterObj = result.metadata && result.metadata.chapter;
    const rawChapterId = params.chapterId !== undefined && params.chapterId !== null
      ? params.chapterId
      : params.chapterNumber;

    const details = {
      command: 'GetChapterContext',
      version: '3.0',
      status: 'success',
      projectId: result.metadata.projectId,
      chapter: chapterObj,
      snapshot: result.snapshot,
      metadata: result.metadata,
      worldRules: result.snapshot.worldRules,
      world_rules: result.snapshot.worldRules,
      canonSources: result.snapshot.canonSources,
      canon_sources: result.snapshot.canonSources,
      chapterSources: result.snapshot.chapterSources,
      chapter_sources: result.snapshot.chapterSources,
      candidateSources: result.snapshot.candidateSources,
      candidate_sources: result.snapshot.candidateSources,
      conflicts: result.snapshot.conflicts,
      unresolved: result.snapshot.unresolved,
      entities: result.entities,
      openForeshadowing: result.snapshot.unresolved,
      foreshadowing: result.snapshot.unresolved,
      open_foreshadowing: result.snapshot.unresolved,
      relevantTimelineEvents: result.snapshot.timelineEvents,
      timeline: result.snapshot.timelineEvents,
      timeline_events: result.snapshot.timelineEvents,
      debtPressure: result.snapshot.debtPressure,
      narrativeDebtPressure: result.snapshot.debtPressure,
      assembledContext: result.assembledContext
    };

    return {
      status: 'success',
      version: '3.0',
      command: 'GetChapterContext',
      content: [
        {
          type: 'text',
          text: `Retrieved context snapshot for Chapter ${chapterObj ? (chapterObj.chapter_number || chapterObj.id) : (rawChapterId || 'General')}: ${result.snapshot.worldRules.length} world rules, ${result.snapshot.canonSources.length} canon sources, ${result.snapshot.chapterSources.length} chapter sources, ${result.snapshot.candidateSources.length} candidates, ${result.snapshot.conflicts.length} conflicts, ${result.snapshot.unresolved.length} unresolved hooks.`
        }
      ],
      details,
      snapshot: result.snapshot,
      metadata: result.metadata,
      assembledContext: result.assembledContext,
      chapter: chapterObj,
      worldRules: result.snapshot.worldRules,
      world_rules: result.snapshot.worldRules,
      canonSources: result.snapshot.canonSources,
      canon_sources: result.snapshot.canonSources,
      chapterSources: result.snapshot.chapterSources,
      chapter_sources: result.snapshot.chapterSources,
      candidateSources: result.snapshot.candidateSources,
      candidate_sources: result.snapshot.candidateSources,
      conflicts: result.snapshot.conflicts,
      unresolved: result.snapshot.unresolved,
      entities: result.entities,
      openForeshadowing: result.snapshot.unresolved,
      foreshadowing: result.snapshot.unresolved,
      open_foreshadowing: result.snapshot.unresolved,
      relevantTimelineEvents: result.snapshot.timelineEvents,
      timeline: result.snapshot.timelineEvents,
      timeline_events: result.snapshot.timelineEvents,
      debtPressure: result.snapshot.debtPressure,
      narrativeDebtPressure: result.snapshot.debtPressure
    };
  }

  /**
   * Alias for GetChapterContext
   */
  static async GetChapterContext(params, context) {
    return QueryCommands.handleGetChapterContext(params, context);
  }

  /**
   * Alias for getChapterContext
   */
  static async getChapterContext(params, context) {
    return QueryCommands.handleGetChapterContext(params, context);
  }
}

module.exports = QueryCommands;
