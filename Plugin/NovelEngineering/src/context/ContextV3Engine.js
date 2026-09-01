/**
 * @file ContextV3Engine.js
 * @description Context v3 Snapshot Aggregator & Deterministic Provenance Tracker (Phase 3 Milestone 4)
 * @module context/ContextV3Engine
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const RuleClassifier = require('./RuleClassifier');
const { NovelError, SchemaMismatchError } = require('../errors');

class ContextV3Engine {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {import('../security/PathGuard')} [options.pathGuard]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new NovelError('DatabaseManager is required for ContextV3Engine', 'INVALID_PARAMETER');
    }
    this.dbManager = dbManager;
    this.options = options;
    this.pathGuard = options.pathGuard || (dbManager && dbManager.pathGuard) || null;
  }

  /**
   * Generates deterministic SHA-256 hash stamp for content tracking (64-char lowercase hex)
   * @param {string|object|null} content
   * @param {string|null} [existingHash]
   * @returns {string}
   */
  static computeHashStamp(content, existingHash) {
    if (existingHash && typeof existingHash === 'string' && /^[0-9a-f]{64}$/i.test(existingHash.trim())) {
      return existingHash.trim().toLowerCase();
    }
    const text = typeof content === 'string'
      ? content
      : (content !== undefined && content !== null ? JSON.stringify(content) : '');
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex').toLowerCase();
  }

  /**
   * Normalizes effective canon level across legacy and Phase 3 records
   * @param {number|string|null} canonLevel
   * @param {string|null} reviewStatus
   * @param {string|null} status
   * @returns {number}
   */
  static normalizeCanonLevel(canonLevel, reviewStatus, status) {
    let lvl = Number(canonLevel);
    if (isNaN(lvl)) lvl = 0;

    const st = String(status || '').toLowerCase().trim();
    const rev = String(reviewStatus || '').toLowerCase().trim();

    // If explicit canon level >= 2, preserve it
    if (lvl >= 2) return lvl;

    // Legacy or explicit canonical / confirmed / finalized / core_canon status -> elevate to 2
    if (['canonical', 'confirmed', 'finalized', 'core_canon'].includes(st)) {
      return Math.max(lvl, 2);
    }

    // Confirmed / human-confirmed / approved review status on non-draft/non-conflict records
    if (['confirmed', 'human_confirmed', 'finalized', 'approved'].includes(rev)) {
      if (!['draft', 'placeholder', 'deprecated', 'archived', 'deleted', 'conflict'].includes(st)) {
        return Math.max(lvl, 2);
      }
    }

    // Legacy world rules or lore marked reviewed with active/completed/finalized status
    if (rev === 'reviewed' && ['canonical', 'confirmed', 'finalized', 'core_canon'].includes(st)) {
      return Math.max(lvl, 2);
    }

    return lvl;
  }

  /**
   * Normalizes focus entity query input supporting comma-delimited strings, arrays, and objects
   * @param {*} rawFocus
   * @returns {Array<string>}
   */
  static normalizeFocusEntities(rawFocus) {
    if (!rawFocus) return [];

    if (Array.isArray(rawFocus)) {
      const result = [];
      for (const item of rawFocus) {
        if (typeof item === 'string') {
          const parts = item.split(/[,，]/).map(s => s.trim()).filter(Boolean);
          result.push(...parts);
        } else if (item && typeof item === 'object') {
          const name = item.canonicalName || item.canonical_name || item.name || item.entityId || item.entity_id || item.title;
          if (name) result.push(String(name).trim());
        }
      }
      return Array.from(new Set(result.filter(Boolean)));
    }

    if (typeof rawFocus === 'string') {
      return Array.from(new Set(rawFocus.split(/[,，]/).map(s => s.trim()).filter(Boolean)));
    }

    if (typeof rawFocus === 'object') {
      const name = rawFocus.canonicalName || rawFocus.canonical_name || rawFocus.name || rawFocus.entityId || rawFocus.entity_id || rawFocus.title;
      return name ? [String(name).trim()] : [];
    }

    return [];
  }

  /**
   * Builds a Context v3 Snapshot for chapter generation / authoring
   * @param {object} params
   * @param {string} [params.projectId='default']
   * @param {string|number} [params.chapterId]
   * @param {number|string} [params.chapterNumber]
   * @param {number} [params.volumeNumber=1]
   * @param {Array<string>|string} [params.focusEntities=[]]
   * @param {string} [params.sourcePolicy='canon_and_reviewed'] - 'canon_only'|'canon_and_reviewed'|'include_drafts'|'all'
   * @param {number} [params.maxTokens]
   * @param {boolean} [params.includeWorldRules=true]
   * @param {boolean} [params.includeTimeline=true]
   * @param {boolean} [params.includeForeshadowing=true]
   * @param {boolean} [params.includeRawContent=true]
   * @returns {object}
   */
  buildSnapshot(params = {}) {
    const projectId = params.projectId || 'default';
    const rawChapterId = params.chapterId !== undefined && params.chapterId !== null
      ? params.chapterId
      : (params.chapterNumber !== undefined && params.chapterNumber !== null
          ? params.chapterNumber
          : (params.chapter !== undefined && params.chapter !== null ? params.chapter : params.chapter_number));
    const volumeNumber = params.volumeNumber !== undefined && params.volumeNumber !== null
      ? Number(params.volumeNumber)
      : (params.volume_number !== undefined ? Number(params.volume_number) : 1);

    // Normalize focusEntities: support array, comma-separated string (both English & Chinese), or single entity
    const rawFocus = params.focusEntities !== undefined
      ? params.focusEntities
      : (params.focusEntity !== undefined
          ? params.focusEntity
          : (params.entities !== undefined
              ? params.entities
              : (params.entity !== undefined ? params.entity : params.focus)));

    const focusEntityNames = ContextV3Engine.normalizeFocusEntities(rawFocus);

    const sourcePolicy = params.sourcePolicy
      ? String(params.sourcePolicy).toLowerCase().trim()
      : 'include_drafts';

    const maxTokens = params.maxTokens ? Number(params.maxTokens) : null;
    const includeWorldRules = params.includeWorldRules !== false && params.includeWorldRules !== 'false';
    const includeTimeline = params.includeTimeline !== false && params.includeTimeline !== 'false';
    const includeForeshadowing = params.includeForeshadowing !== false && params.includeForeshadowing !== 'false';
    const includeRawContent = params.includeRawContent !== false && params.includeRawContent !== 'false';

    const db = this.dbManager.getDatabase();

    // 1. Resolve Target Chapter
    const chapterObj = this._resolveChapter(rawChapterId, volumeNumber);

    // 2. Resolve Focus Entities & Graph Neighborhood
    const {
      matchedEntities,
      focusEntityIds,
      focusEntityDbIds,
      focusSourceFileIds,
      neighborEntityDbIds,
      entityAliasesMap
    } = this._resolveFocusEntities(focusEntityNames, chapterObj);

    // 3. Initialize Snapshot Buckets
    const worldRulesGlobal = [];
    const worldRulesScoped = [];
    const canonSources = [];
    const chapterSources = [];
    const candidateSources = [];
    const conflicts = [];
    const unresolved = [];
    const timelineEvents = [];

    // --- 3A. World Rules Aggregation (Global Axioms vs Scoped Rules) ---
    if (includeWorldRules) {
      let worldFiles = [];
      try {
        const deletedFilter = sourcePolicy === 'all' ? '' : "AND status NOT IN ('deleted', 'archived')";
        worldFiles = db.prepare(`
          SELECT * FROM source_files
          WHERE (source_category = 'world_rule' OR relative_path LIKE '01_%' OR relative_path LIKE '%Worldview%')
            ${deletedFilter}
          ORDER BY canon_level DESC, id ASC
        `).all();
      } catch (err) {
        if (err.message && err.message.includes('no such table')) {
          throw new SchemaMismatchError(`Database schema error during world rule query: ${err.message}`, {
            table: 'source_files',
            originalError: err.message
          });
        }
        console.warn(`[ContextV3Engine] Warning loading world rules: ${err.message}`);
      }

      for (const wf of worldFiles) {
        if (!this._matchesPolicy(wf.canon_level, wf.review_status, wf.status, sourcePolicy)) {
          continue;
        }

        const classification = RuleClassifier.classify(wf);
        const content = this._safeReadContent(wf.file_path, wf.file_name, includeRawContent);
        const hashStamp = ContextV3Engine.computeHashStamp(content || wf.file_name, wf.sha256_hash);
        const relPath = wf.relative_path || wf.file_path || `01_Worldview/${wf.file_name}`;

        const provenanceItem = {
          sourceFileId: wf.id,
          source_file_id: wf.id,
          sourceFilePath: relPath,
          source_file_path: relPath,
          entityId: `RULE-${wf.id}`,
          entity_id: `RULE-${wf.id}`,
          canonicalName: (wf.file_name || 'rule').replace(/\.md$/i, ''),
          canonical_name: (wf.file_name || 'rule').replace(/\.md$/i, ''),
          title: (wf.file_name || 'rule').replace(/\.md$/i, ''),
          category: wf.source_category || 'world_rule',
          scopeType: classification.scopeType,
          scope_type: classification.scopeType,
          isGlobal: classification.isGlobal,
          boundEntities: classification.boundEntities || [],
          canonLevel: ContextV3Engine.normalizeCanonLevel(wf.canon_level, wf.review_status, wf.status),
          canon_level: ContextV3Engine.normalizeCanonLevel(wf.canon_level, wf.review_status, wf.status),
          status: wf.status || 'active',
          reviewStatus: wf.review_status || 'reviewed',
          review_status: wf.review_status || 'reviewed',
          sha256Hash: hashStamp,
          hashTrackingStamp: hashStamp,
          hash_tracking_stamp: hashStamp,
          matchReason: classification.reason,
          content,
          rawContent: content,
          summary: wf.summary || null
        };

        if (classification.isGlobal) {
          worldRulesGlobal.push(provenanceItem);
        } else {
          // Scoped rules: check if bound entities or text/path matches any focus entity
          let matchesFocus = false;
          if (focusEntityNames.length === 0) {
            matchesFocus = true; // Include if no focus filter is applied
          } else {
            // Check bound entities intersection
            if (classification.boundEntities && classification.boundEntities.length > 0) {
              matchesFocus = classification.boundEntities.some(be => {
                const beLower = String(be).toLowerCase();
                return focusEntityIds.has(be) || focusEntityNames.some(fn => fn.toLowerCase() === beLower);
              });
            }
            // Check text/path matching if not already matched
            if (!matchesFocus) {
              matchesFocus = focusEntityNames.some(fn => {
                const pattern = new RegExp(fn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                return pattern.test(relPath) || pattern.test(wf.file_name) || pattern.test(content);
              });
            }
          }

          if (matchesFocus) {
            worldRulesScoped.push(provenanceItem);
          }
        }
      }
    }

    // --- 3B. Entity Canon & Candidate Sources Aggregation ---
    const processedSourceFileIds = new Set();

    for (const ent of matchedEntities) {
      let entFiles = [];
      try {
        const deletedFilter = sourcePolicy === 'all' ? '' : "AND sf.status NOT IN ('deleted', 'archived')";
        entFiles = db.prepare(`
          SELECT DISTINCT sf.*, fe.mention_type
          FROM file_entities fe
          JOIN source_files sf ON fe.source_file_id = sf.id
          WHERE fe.entity_id = ? ${deletedFilter}
          UNION
          SELECT sf.*, 'primary_definition' AS mention_type
          FROM source_files sf
          WHERE sf.id = ? ${deletedFilter}
        `).all(ent.id, ent.source_file_id || -1);
      } catch (err) {
        // Fallback for single-table schema if file_entities table is absent
        try {
          if (ent.source_file_id) {
            const singleFile = db.prepare('SELECT *, \'primary_definition\' AS mention_type FROM source_files WHERE id = ?').get(ent.source_file_id);
            if (singleFile) entFiles = [singleFile];
          }
        } catch (_) {}
      }

      // If no source files associated in DB, create virtual representation from entity
      if (entFiles.length === 0) {
        if (this._matchesPolicy(ent.canon_level, ent.review_status, ent.status, sourcePolicy)) {
          const virtualContent = ent.description || ent.summary || `# ${ent.canonical_name}\n${ent.entity_type} entity.`;
          const hashStamp = ContextV3Engine.computeHashStamp(virtualContent, null);
          const aliases = entityAliasesMap.get(ent.id) || [];
          const virtualRelPath = `04_Entities/${ent.entity_type || 'General'}/${ent.entity_id || ent.canonical_name}.md`;

          const provenanceItem = {
            sourceFileId: ent.source_file_id || ent.id,
            source_file_id: ent.source_file_id || ent.id,
            sourceFilePath: virtualRelPath,
            source_file_path: virtualRelPath,
            entityId: ent.entity_id,
            entity_id: ent.entity_id,
            entityDbId: ent.id,
            canonicalName: ent.canonical_name,
            canonical_name: ent.canonical_name,
            entityType: ent.entity_type || 'entity',
            entity_type: ent.entity_type || 'entity',
            category: ent.category || ent.entity_type || 'entity',
            mentionType: 'virtual_entity',
            canonLevel: ContextV3Engine.normalizeCanonLevel(ent.canon_level, ent.review_status, ent.status),
            canon_level: ContextV3Engine.normalizeCanonLevel(ent.canon_level, ent.review_status, ent.status),
            status: ent.status || 'active',
            reviewStatus: ent.review_status || 'reviewed',
            review_status: ent.review_status || 'reviewed',
            sha256Hash: hashStamp,
            hashTrackingStamp: hashStamp,
            hash_tracking_stamp: hashStamp,
            matchReason: `Matched focus entity "${ent.canonical_name}" (${ent.entity_id})`,
            content: virtualContent,
            rawContent: virtualContent,
            description: ent.description || virtualContent,
            aliases
          };

          const effectiveLvl = ContextV3Engine.normalizeCanonLevel(ent.canon_level, ent.review_status, ent.status);
          const isRev = ['reviewed', 'confirmed', 'approved', 'human_confirmed', 'finalized'].includes(String(ent.review_status || '').toLowerCase().trim());
          const isDraftOrPlaceholder = ['draft', 'placeholder', 'deprecated', 'archived', 'deleted', 'conflict'].includes(String(ent.status || '').toLowerCase().trim());

          if (ent.status === 'conflict' || ent.review_status === 'conflicted') {
            conflicts.push({
              anomalyCode: 'ANOM_ENTITY_CONFLICT',
              anomaly_code: 'ANOM_ENTITY_CONFLICT',
              title: `实体设定冲突: ${ent.canonical_name}`,
              message: `实体 ${ent.canonical_name} (${ent.entity_id}) 处于冲突状态`,
              description: `实体 ${ent.canonical_name} (${ent.entity_id}) 处于冲突状态`,
              sourceFilePath: virtualRelPath,
              source_file_path: virtualRelPath,
              status: 'conflict',
              reviewStatus: 'conflicted',
              review_status: 'conflicted',
              sha256Hash: hashStamp,
              hashTrackingStamp: hashStamp,
              hash_tracking_stamp: hashStamp,
              relatedEntity: ent.entity_id,
              content: virtualContent
            });
          } else if (effectiveLvl >= 2 && isRev && !isDraftOrPlaceholder) {
            canonSources.push(provenanceItem);
          } else {
            candidateSources.push(provenanceItem);
          }
        }
        continue;
      }

      for (const sf of entFiles) {
        if (processedSourceFileIds.has(`${ent.id}_${sf.id}`)) continue;
        processedSourceFileIds.add(`${ent.id}_${sf.id}`);

        if (!this._matchesPolicy(sf.canon_level !== undefined ? sf.canon_level : ent.canon_level, sf.review_status || ent.review_status, sf.status, sourcePolicy)) {
          continue;
        }

        const content = this._safeReadContent(sf.file_path, sf.file_name, includeRawContent);
        const hashStamp = ContextV3Engine.computeHashStamp(content || sf.file_name, sf.sha256_hash);
        const aliases = entityAliasesMap.get(ent.id) || [];
        const relPath = sf.relative_path || sf.file_path || `04_Entities/${sf.file_name}`;

        const rawCanon = sf.canon_level !== undefined && sf.canon_level !== null
          ? sf.canon_level
          : ent.canon_level;

        const effectiveReviewStatus = sf.review_status || ent.review_status || 'pending';
        const effectiveStatus = sf.status || ent.status || 'active';
        const effectiveCanonLevel = ContextV3Engine.normalizeCanonLevel(rawCanon, effectiveReviewStatus, effectiveStatus);

        const provenanceItem = {
          sourceFileId: sf.id,
          source_file_id: sf.id,
          sourceFilePath: relPath,
          source_file_path: relPath,
          entityId: ent.entity_id,
          entity_id: ent.entity_id,
          entityDbId: ent.id,
          canonicalName: ent.canonical_name,
          canonical_name: ent.canonical_name,
          entityType: ent.entity_type || 'entity',
          entity_type: ent.entity_type || 'entity',
          category: ent.category || sf.source_category || 'entity',
          mentionType: sf.mention_type || 'definition',
          canonLevel: effectiveCanonLevel,
          canon_level: effectiveCanonLevel,
          status: effectiveStatus,
          reviewStatus: effectiveReviewStatus,
          review_status: effectiveReviewStatus,
          sha256Hash: hashStamp,
          hashTrackingStamp: hashStamp,
          hash_tracking_stamp: hashStamp,
          matchReason: `Matched focus entity "${ent.canonical_name}" (${ent.entity_id})`,
          content,
          rawContent: content,
          description: ent.description || content,
          aliases
        };

        const isRev = ['reviewed', 'confirmed', 'approved', 'human_confirmed', 'finalized'].includes(String(effectiveReviewStatus || '').toLowerCase().trim());
        const isDraftOrPlaceholder = ['draft', 'placeholder', 'deprecated', 'archived', 'deleted', 'conflict'].includes(String(effectiveStatus || '').toLowerCase().trim());

        // Check if item represents a conflict
        if (effectiveStatus === 'conflict' || effectiveReviewStatus === 'conflicted') {
          conflicts.push({
            anomalyCode: 'ANOM_FILE_CONFLICT',
            anomaly_code: 'ANOM_FILE_CONFLICT',
            title: `设定冲突: ${ent.canonical_name}`,
            message: `文件 ${relPath} 标记为冲突设定`,
            description: `文件 ${relPath} 标记为冲突设定`,
            sourceFilePath: relPath,
            source_file_path: relPath,
            status: 'conflict',
            reviewStatus: 'conflicted',
            review_status: 'conflicted',
            sha256Hash: hashStamp,
            hashTrackingStamp: hashStamp,
            hash_tracking_stamp: hashStamp,
            relatedEntity: ent.entity_id,
            content
          });
        } else if (effectiveCanonLevel >= 2 && isRev && !isDraftOrPlaceholder) {
          canonSources.push(provenanceItem);
        } else {
          candidateSources.push(provenanceItem);
        }
      }
    }

    // --- 3C. Preceding & Target Chapter Sources ---
    if (chapterObj) {
      const chapterContent = this._safeReadContent(chapterObj.file_path, chapterObj.relative_path, includeRawContent) || chapterObj.summary || chapterObj.title;
      const targetHash = ContextV3Engine.computeHashStamp(chapterContent, null);
      const targetRelPath = chapterObj.relative_path || `03_Chapters/Chapter_${chapterObj.chapter_number || chapterObj.id}.md`;

      chapterSources.push({
        chapterId: String(chapterObj.chapter_number !== undefined && chapterObj.chapter_number !== null ? chapterObj.chapter_number : chapterObj.id),
        chapter_id: String(chapterObj.chapter_number !== undefined && chapterObj.chapter_number !== null ? chapterObj.chapter_number : chapterObj.id),
        chapterNumber: Number(chapterObj.chapter_number),
        chapter_number: Number(chapterObj.chapter_number),
        volumeNumber: Number(chapterObj.volume_number) || volumeNumber,
        volume_number: Number(chapterObj.volume_number) || volumeNumber,
        title: chapterObj.title || `Chapter ${chapterObj.chapter_number}`,
        sourceFilePath: targetRelPath,
        source_file_path: targetRelPath,
        status: chapterObj.status || 'draft',
        canon: chapterObj.canon !== undefined ? chapterObj.canon : 0,
        reviewStatus: chapterObj.status === 'completed' || chapterObj.status === 'published' ? 'approved' : 'active',
        review_status: chapterObj.status === 'completed' || chapterObj.status === 'published' ? 'approved' : 'active',
        sha256Hash: targetHash,
        hashTrackingStamp: targetHash,
        hash_tracking_stamp: targetHash,
        summary: chapterObj.summary || null,
        content: chapterContent,
        rawContent: chapterContent,
        isTargetChapter: true
      });

      // Add preceding canonical chapters in volume
      try {
        const prevChapters = db.prepare(`
          SELECT c.*, sf.relative_path AS source_relative_path, sf.file_path, sf.sha256_hash
          FROM chapters c
          LEFT JOIN source_files sf ON c.source_file_id = sf.id
          WHERE c.volume_number = ? AND c.chapter_number < ? AND (c.canon = 1 OR c.status IN ('completed', 'published'))
          ORDER BY c.chapter_number DESC LIMIT 3
        `).all(chapterObj.volume_number || volumeNumber, chapterObj.chapter_number || 9999);

        for (const prev of prevChapters) {
          const prevContent = this._safeReadContent(prev.file_path, prev.source_relative_path || prev.relative_path, includeRawContent) || prev.summary || prev.title;
          const pHash = ContextV3Engine.computeHashStamp(prevContent, prev.sha256_hash);
          const pRelPath = prev.relative_path || prev.source_relative_path || `03_Chapters/Chapter_${prev.chapter_number}.md`;

          chapterSources.push({
            chapterId: String(prev.chapter_number !== undefined ? prev.chapter_number : prev.id),
            chapter_id: String(prev.chapter_number !== undefined ? prev.chapter_number : prev.id),
            chapterNumber: Number(prev.chapter_number),
            chapter_number: Number(prev.chapter_number),
            volumeNumber: Number(prev.volume_number) || volumeNumber,
            volume_number: Number(prev.volume_number) || volumeNumber,
            title: prev.title,
            sourceFilePath: pRelPath,
            source_file_path: pRelPath,
            status: prev.status || 'completed',
            canon: 1,
            reviewStatus: 'approved',
            review_status: 'approved',
            sha256Hash: pHash,
            hashTrackingStamp: pHash,
            hash_tracking_stamp: pHash,
            summary: prev.summary || null,
            content: prevContent,
            rawContent: prevContent,
            isTargetChapter: false
          });
        }
      } catch (err) {
        console.warn(`[ContextV3Engine] Warning loading preceding chapters: ${err.message}`);
      }
    }

    // --- 3D. Structured 5-Channel Timeline Events Recall ---
    if (includeTimeline) {
      const recalledEventsMap = new Map();

      // Channel 1: Primary Entity ID match
      if (focusEntityDbIds.size > 0) {
        try {
          const placeholders = Array.from(focusEntityDbIds).map(() => '?').join(',');
          const eventsByPrimary = db.prepare(`
            SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
            FROM timeline_events te
            LEFT JOIN entities e ON te.primary_entity_id = e.id
            LEFT JOIN source_files sf ON te.source_file_id = sf.id
            WHERE te.primary_entity_id IN (${placeholders})
          `).all(...Array.from(focusEntityDbIds));

          for (const evt of eventsByPrimary) {
            const key = evt.event_id || String(evt.id);
            recalledEventsMap.set(key, {
              ...evt,
              matchReason: `Primary entity #${evt.primary_entity_id} (${evt.primary_entity_name || 'Entity'}) graph recall`
            });
          }
        } catch (err) {
          console.warn(`[ContextV3Engine] Channel 1 timeline error: ${err.message}`);
        }
      }

      // Channel 2: Source File ID match
      if (focusSourceFileIds.size > 0) {
        try {
          const placeholders = Array.from(focusSourceFileIds).map(() => '?').join(',');
          const eventsByFile = db.prepare(`
            SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
            FROM timeline_events te
            LEFT JOIN entities e ON te.primary_entity_id = e.id
            LEFT JOIN source_files sf ON te.source_file_id = sf.id
            WHERE te.source_file_id IN (${placeholders})
          `).all(...Array.from(focusSourceFileIds));

          for (const evt of eventsByFile) {
            const key = evt.event_id || String(evt.id);
            if (!recalledEventsMap.has(key)) {
              recalledEventsMap.set(key, {
                ...evt,
                matchReason: `Source file #${evt.source_file_id} link match`
              });
            }
          }
        } catch (err) {
          console.warn(`[ContextV3Engine] Channel 2 timeline error: ${err.message}`);
        }
      }

      // Channel 3: 1st-degree Entity Relations Graph Neighborhood match
      if (neighborEntityDbIds.size > 0) {
        try {
          const placeholders = Array.from(neighborEntityDbIds).map(() => '?').join(',');
          const eventsByNeighbor = db.prepare(`
            SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
            FROM timeline_events te
            LEFT JOIN entities e ON te.primary_entity_id = e.id
            LEFT JOIN source_files sf ON te.source_file_id = sf.id
            WHERE te.primary_entity_id IN (${placeholders})
          `).all(...Array.from(neighborEntityDbIds));

          for (const evt of eventsByNeighbor) {
            const key = evt.event_id || String(evt.id);
            if (!recalledEventsMap.has(key)) {
              recalledEventsMap.set(key, {
                ...evt,
                matchReason: `1st-degree relation neighbor #${evt.primary_entity_id} (${evt.primary_entity_name || 'Neighbor'}) graph recall`
              });
            }
          }
        } catch (err) {
          console.warn(`[ContextV3Engine] Channel 3 timeline error: ${err.message}`);
        }
      }

      // Channel 4: Participant / Involved Entities JSON Match
      for (const entCode of focusEntityIds) {
        try {
          const eventsInvolved = db.prepare(`
            SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
            FROM timeline_events te
            LEFT JOIN entities e ON te.primary_entity_id = e.id
            LEFT JOIN source_files sf ON te.source_file_id = sf.id
            WHERE (te.participant_entity_ids_json LIKE ? OR te.involved_entities_json LIKE ?)
          `).all(`%${entCode}%`, `%${entCode}%`);

          for (const evt of eventsInvolved) {
            const key = evt.event_id || String(evt.id);
            if (!recalledEventsMap.has(key)) {
              recalledEventsMap.set(key, {
                ...evt,
                matchReason: `Participant entity "${entCode}" match`
              });
            }
          }
        } catch (err) {
          // Schema fallback if participant columns differ
          try {
            const eventsInvolvedFallback = db.prepare(`
              SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
              FROM timeline_events te
              LEFT JOIN entities e ON te.primary_entity_id = e.id
              LEFT JOIN source_files sf ON te.source_file_id = sf.id
              WHERE te.description LIKE ?
            `).all(`%${entCode}%`);

            for (const evt of eventsInvolvedFallback) {
              const key = evt.event_id || String(evt.id);
              if (!recalledEventsMap.has(key)) {
                recalledEventsMap.set(key, {
                  ...evt,
                  matchReason: `Text description mention "${entCode}" match`
                });
              }
            }
          } catch (_) {}
        }
      }

      // Channel 5: Chapter Time Window & Chapter Bounds Match
      if (chapterObj) {
        try {
          let eventsByChapter = [];
          const hasStart = chapterObj.timeline_start !== undefined && chapterObj.timeline_start !== null;
          const hasEnd = chapterObj.timeline_end !== undefined && chapterObj.timeline_end !== null;

          if (hasStart && hasEnd) {
            eventsByChapter = db.prepare(`
              SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
              FROM timeline_events te
              LEFT JOIN entities e ON te.primary_entity_id = e.id
              LEFT JOIN source_files sf ON te.source_file_id = sf.id
              WHERE (
                (te.timestamp_order >= ? AND te.timestamp_order <= ?)
                OR (te.interval_start IS NOT NULL AND te.interval_end IS NOT NULL AND te.interval_start <= ? AND te.interval_end >= ?)
              )
            `).all(chapterObj.timeline_start, chapterObj.timeline_end, chapterObj.timeline_end, chapterObj.timeline_start);
          }

          // If no events matched by window, check by source_file_id or textual references
          if (eventsByChapter.length === 0 && chapterObj.chapter_number) {
            try {
              eventsByChapter = db.prepare(`
                SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
                FROM timeline_events te
                LEFT JOIN entities e ON te.primary_entity_id = e.id
                LEFT JOIN source_files sf ON te.source_file_id = sf.id
                WHERE (
                  te.source_file_id = ?
                  OR te.description LIKE ?
                  OR te.title LIKE ?
                )
              `).all(
                chapterObj.source_file_id || -1,
                `%第${chapterObj.chapter_number}章%`,
                `%Chapter ${chapterObj.chapter_number}%`
              );
            } catch (_) {}
          }

          for (const evt of eventsByChapter) {
            const key = evt.event_id || String(evt.id);
            if (!recalledEventsMap.has(key)) {
              recalledEventsMap.set(key, {
                ...evt,
                matchReason: `Chapter #${chapterObj.chapter_number || chapterObj.id} temporal window match`
              });
            }
          }
        } catch (err) {
          console.warn(`[ContextV3Engine] Channel 5 timeline error: ${err.message}`);
        }
      }

      // If no focus entities or chapter specified, recall chronological timeline sample
      if (recalledEventsMap.size === 0 && focusEntityNames.length === 0) {
        try {
          const generalEvents = db.prepare(`
            SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_relative_path
            FROM timeline_events te
            LEFT JOIN entities e ON te.primary_entity_id = e.id
            LEFT JOIN source_files sf ON te.source_file_id = sf.id
            ORDER BY te.timestamp_order ASC LIMIT 20
          `).all();

          for (const evt of generalEvents) {
            const key = evt.event_id || String(evt.id);
            recalledEventsMap.set(key, {
              ...evt,
              matchReason: 'General timeline chronological recall'
            });
          }
        } catch (_) {}
      }

      // Sort timeline events chronologically by timestamp_order
      const sortedEvents = Array.from(recalledEventsMap.values()).sort((a, b) => {
        const orderA = a.timestamp_order !== undefined ? Number(a.timestamp_order) : 0;
        const orderB = b.timestamp_order !== undefined ? Number(b.timestamp_order) : 0;
        return orderA - orderB;
      });

      for (const evt of sortedEvents) {
        const evtContent = evt.description || evt.title || '';
        const timePointStr = evt.time_point || evt.relative_time_desc || (evt.timestamp_order !== undefined ? String(evt.timestamp_order) : 'N/A');
        const hashStamp = ContextV3Engine.computeHashStamp(`${evt.title}|${timePointStr}|${evtContent}`, null);
        const relPath = evt.source_relative_path || `04_Timeline/Event_${evt.event_id || evt.id}.md`;

        timelineEvents.push({
          eventId: evt.event_id || `EVT-${evt.id}`,
          event_id: evt.event_id || `EVT-${evt.id}`,
          title: evt.title,
          timePoint: timePointStr,
          time_point: timePointStr,
          timestampOrder: evt.timestamp_order !== undefined ? Number(evt.timestamp_order) : 0,
          timestamp_order: evt.timestamp_order !== undefined ? Number(evt.timestamp_order) : 0,
          eraEpoch: evt.era_epoch || 'CE',
          era_epoch: evt.era_epoch || 'CE',
          description: evt.description || '',
          content: evt.description || evt.title || '',
          primaryEntityId: evt.primary_entity_id,
          primary_entity_id: evt.primary_entity_id,
          primaryEntityName: evt.primary_entity_name || null,
          primary_entity: evt.primary_entity_name || null,
          sourceFilePath: relPath,
          source_file_path: relPath,
          status: evt.status || 'active',
          reviewStatus: 'confirmed',
          review_status: 'confirmed',
          sha256Hash: hashStamp,
          hashTrackingStamp: hashStamp,
          hash_tracking_stamp: hashStamp,
          matchReason: evt.matchReason || 'Timeline graph recall'
        });
      }
    }

    // --- 3E. Foreshadowing & Unresolved Lore ---
    if (includeForeshadowing) {
      const recalledFsMap = new Map();
      const fsQueryTerms = focusEntityIds.size > 0 ? Array.from(focusEntityIds) : (focusEntityNames.length > 0 ? focusEntityNames : []);

      if (fsQueryTerms.length > 0) {
        for (const term of fsQueryTerms) {
          try {
            const fList = db.prepare(`
              SELECT fs.*, sf.relative_path AS setup_file_path, sf.sha256_hash AS setup_sha256
              FROM foreshadowing fs
              LEFT JOIN source_files sf ON fs.setup_file_id = sf.id
              WHERE fs.status = 'open' AND (fs.related_entities_json LIKE ? OR fs.description LIKE ? OR fs.title LIKE ?)
            `).all(`%${term}%`, `%${term}%`, `%${term}%`);

            for (const f of fList) {
              const key = f.foreshadow_id || String(f.id);
              if (!recalledFsMap.has(key)) {
                recalledFsMap.set(key, { ...f, matchTerm: term });
              }
            }
          } catch (_) {}
        }
      }

      // If chapter specified, also check foreshadowing planted in this chapter or general open clues
      if (chapterObj) {
        try {
          const chFs = db.prepare(`
            SELECT fs.*, sf.relative_path AS setup_file_path, sf.sha256_hash AS setup_sha256
            FROM foreshadowing fs
            LEFT JOIN source_files sf ON fs.setup_file_id = sf.id
            WHERE fs.status = 'open' AND (fs.setup_chapter_id = ? OR fs.introduced_chapter = ?)
          `).all(chapterObj.id, String(chapterObj.chapter_number || chapterObj.id));

          for (const f of chFs) {
            const key = f.foreshadow_id || String(f.id);
            if (!recalledFsMap.has(key)) {
              recalledFsMap.set(key, { ...f, matchTerm: `Chapter #${chapterObj.chapter_number || chapterObj.id}` });
            }
          }
        } catch (_) {}
      }

      // If no foreshadowing recalled by direct entity/chapter link, recall major open threads
      if (recalledFsMap.size === 0) {
        try {
          const allOpen = db.prepare(`
            SELECT fs.*, sf.relative_path AS setup_file_path, sf.sha256_hash AS setup_sha256
            FROM foreshadowing fs
            LEFT JOIN source_files sf ON fs.setup_file_id = sf.id
            WHERE fs.status = 'open'
            ORDER BY CASE WHEN fs.importance_level = 'critical' THEN 1 WHEN fs.importance_level = 'major' THEN 2 ELSE 3 END ASC
            LIMIT 20
          `).all();

          for (const f of allOpen) {
            const key = f.foreshadow_id || String(f.id);
            if (!recalledFsMap.has(key)) {
              recalledFsMap.set(key, { ...f, matchTerm: 'Open thread' });
            }
          }
        } catch (_) {}
      }

      for (const f of recalledFsMap.values()) {
        const fContent = f.description || f.setup_snippet || f.title || '';
        const hashStamp = ContextV3Engine.computeHashStamp(fContent, f.setup_sha256);
        const relPath = f.setup_file_path || `05_Foreshadowing/Hook_${f.foreshadow_id || f.id}.md`;

        unresolved.push({
          id: f.id,
          foreshadowId: f.foreshadow_id || f.thread_key || `FS-${f.id}`,
          foreshadow_id: f.foreshadow_id || f.thread_key || `FS-${f.id}`,
          threadKey: f.thread_key || f.foreshadow_id || `FS-${f.id}`,
          thread_key: f.thread_key || f.foreshadow_id || `FS-${f.id}`,
          title: f.title,
          description: f.description || '',
          content: fContent,
          setupChapter: f.introduced_chapter || f.setup_chapter_id || f.setup_chapter || null,
          setup_chapter: f.introduced_chapter || f.setup_chapter_id || f.setup_chapter || null,
          importanceLevel: f.importance_level || 'major',
          importance_level: f.importance_level || 'major',
          status: f.status || 'open',
          reviewStatus: 'open',
          review_status: 'open',
          sourceFilePath: relPath,
          source_file_path: relPath,
          sha256Hash: hashStamp,
          hashTrackingStamp: hashStamp,
          hash_tracking_stamp: hashStamp,
          relatedEntity: f.matchTerm || null,
          matchReason: `Open foreshadowing thread related to "${f.matchTerm || 'narrative'}"`
        });
      }
    }

    // --- 3F. Conflicts & Anomaly Warnings Query ---
    const recalledAnomsMap = new Map();
    const anomQueryTerms = focusEntityIds.size > 0 ? Array.from(focusEntityIds) : (focusEntityNames.length > 0 ? focusEntityNames : []);

    // Also check table anomaly_reports
    try {
      const activeAnomalies = db.prepare(`
        SELECT a.*
        FROM anomaly_reports a
        WHERE a.is_resolved = 0
        ORDER BY CASE 
          WHEN a.severity = 'CRITICAL' THEN 1 
          WHEN a.severity = 'HIGH' THEN 2 
          WHEN a.severity = 'MEDIUM' THEN 3 
          ELSE 4 
        END ASC
        LIMIT 50
      `).all();

      for (const a of activeAnomalies) {
        let isRelevant = false;
        let matchedTerm = null;

        if (anomQueryTerms.length === 0) {
          isRelevant = true; // Include top unresolved if no focus entities specified
        } else {
          for (const term of anomQueryTerms) {
            const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            if (pattern.test(a.affected_entity_ids_json || '') ||
                pattern.test(a.affected_file_paths_json || '') ||
                pattern.test(a.involved_entities_json || '') ||
                pattern.test(a.title || '') ||
                pattern.test(a.message || '')) {
              isRelevant = true;
              matchedTerm = term;
              break;
            }
          }
        }

        if (isRelevant) {
          const key = a.id || a.anomaly_rule_id;
          if (!recalledAnomsMap.has(key)) {
            let affectedFiles = [];
            if (a.affected_file_paths_json) {
              try { affectedFiles = JSON.parse(a.affected_file_paths_json); } catch (_) {}
            }
            const sourceFilePath = Array.isArray(affectedFiles) && affectedFiles[0] ? affectedFiles[0] : 'virtual_anomaly.md';
            const anomHash = ContextV3Engine.computeHashStamp(a.message || a.title || a.anomaly_rule_id, null);

            recalledAnomsMap.set(key, {
              ruleId: a.anomaly_rule_id || 'ANOM_CONFLICT',
              anomalyCode: a.anomaly_rule_id || 'ANOM_CONFLICT',
              anomaly_code: a.anomaly_rule_id || 'ANOM_CONFLICT',
              severity: a.severity || 'warning',
              title: a.title || '设定冲突预警',
              message: a.message || '检测到设定冲突',
              description: a.message || '检测到设定冲突',
              sourceFilePath,
              source_file_path: sourceFilePath,
              status: 'conflict',
              reviewStatus: 'warning',
              review_status: 'warning',
              sha256Hash: anomHash,
              hashTrackingStamp: anomHash,
              hash_tracking_stamp: anomHash,
              relatedEntity: matchedTerm || 'general',
              content: a.message || a.title || ''
            });
          }
        }
      }
    } catch (anomErr) {
      if (anomErr.message && anomErr.message.includes('no such table') && !anomErr.message.includes('anomaly_reports')) {
        throw new SchemaMismatchError(`Database schema error during anomaly conflict query: ${anomErr.message}`, {
          query: 'anomaly_reports',
          originalError: anomErr.message
        });
      }
      // If table anomaly_reports does not exist, check fallback table anomalies
      try {
        const legacyAnoms = db.prepare('SELECT * FROM anomalies WHERE is_resolved = 0 LIMIT 50').all();
        for (const a of legacyAnoms) {
          const key = a.id || a.anomaly_code;
          const anomHash = ContextV3Engine.computeHashStamp(a.message || a.title, null);
          if (!recalledAnomsMap.has(key)) {
            recalledAnomsMap.set(key, {
              ruleId: a.anomaly_code || 'ANOM_CONFLICT',
              anomalyCode: a.anomaly_code || 'ANOM_CONFLICT',
              anomaly_code: a.anomaly_code || 'ANOM_CONFLICT',
              severity: a.severity || 'warning',
              title: a.title || '设定冲突预警',
              message: a.message || '检测到设定冲突',
              description: a.message || '检测到设定冲突',
              sourceFilePath: 'virtual_anomaly.md',
              source_file_path: 'virtual_anomaly.md',
              status: 'conflict',
              reviewStatus: 'warning',
              review_status: 'warning',
              sha256Hash: anomHash,
              hashTrackingStamp: anomHash,
              hash_tracking_stamp: anomHash,
              relatedEntity: 'general',
              content: a.message || a.title || ''
            });
          }
        }
      } catch (_) {}
    }

    for (const anomItem of recalledAnomsMap.values()) {
      conflicts.push(anomItem);
    }

    // --- 4. Backward and Forward Dual Compatibility for worldRules ---
    // Composite array containing all world rules (global + scoped)
    // with attached .global and .scoped array properties
    const worldRulesComposite = [...worldRulesGlobal, ...worldRulesScoped];
    worldRulesComposite.global = worldRulesGlobal;
    worldRulesComposite.scoped = worldRulesScoped;

    const snapshotId = `ctx_snap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const snapshot = {
      version: '3.0',
      snapshotId,
      worldRules: worldRulesComposite,
      canonSources,
      chapterSources,
      candidateSources,
      conflicts,
      unresolved,
      timelineEvents
    };

    // --- 5. Build Assembled Context Markdown ---
    const assembledContext = this._buildAssembledContextMarkdown(snapshot, chapterObj, sourcePolicy, maxTokens);

    const totalSources = worldRulesComposite.length + canonSources.length + chapterSources.length + candidateSources.length;

    const metadata = {
      projectId,
      chapter: chapterObj,
      sourcePolicyApplied: sourcePolicy,
      totalSources,
      globalRulesCount: worldRulesGlobal.length,
      scopedRulesCount: worldRulesScoped.length,
      canonSourcesCount: canonSources.length,
      candidateSourcesCount: candidateSources.length,
      timelineEventsCount: timelineEvents.length,
      unresolvedCount: unresolved.length,
      conflictsCount: conflicts.length,
      generatedAt: new Date().toISOString()
    };

    const recalledEntities = [...canonSources, ...candidateSources];

    return {
      version: '3.0',
      snapshotId,
      snapshot,
      assembledContext,
      metadata,
      // Direct properties for backward compatibility with Phase 2/2.5 tests:
      worldRules: worldRulesComposite,
      world_rules: worldRulesComposite,
      canonSources,
      canon_sources: canonSources,
      chapterSources,
      chapter_sources: chapterSources,
      candidateSources,
      candidate_sources: candidateSources,
      conflicts,
      unresolved,
      timelineEvents,
      timeline: timelineEvents,
      timeline_events: timelineEvents,
      relevantTimelineEvents: timelineEvents,
      foreshadowing: unresolved,
      openForeshadowing: unresolved,
      open_foreshadowing: unresolved,
      entities: recalledEntities,
      chapter: chapterObj
    };
  }

  // =========================================================================
  // Helper Methods
  // =========================================================================

  /**
   * Evaluates if a record matches the sourcePolicy filter
   * @private
   * @param {number} canonLevel
   * @param {string} reviewStatus
   * @param {string} status
   * @param {string} policy
   * @returns {boolean}
   */
  _matchesPolicy(canonLevel, reviewStatus, status, policy) {
    const st = String(status || '').toLowerCase().trim();
    const rev = String(reviewStatus || '').toLowerCase().trim();

    if (st === 'deleted') return false;
    if (policy === 'all') return true;
    if (st === 'archived' || st === 'deprecated') return false;

    // Setting conflicts must always pass policy so they can be collected in conflicts bucket
    if (st === 'conflict' || rev === 'conflicted' || st === 'conflicted') {
      return true;
    }

    const lvl = ContextV3Engine.normalizeCanonLevel(canonLevel, reviewStatus, status);
    const isReviewed = ['reviewed', 'confirmed', 'approved', 'human_confirmed', 'finalized'].includes(rev);

    switch (policy) {
      case 'canon_only':
        return lvl >= 2 && isReviewed && !['draft', 'placeholder', 'archived', 'deleted', 'deprecated', 'conflict'].includes(st);

      case 'canon_and_reviewed':
        if (['deleted', 'archived', 'deprecated', 'placeholder'].includes(st)) return false;
        if (st === 'draft' && !isReviewed) return false;
        return (lvl >= 2 && isReviewed) || (lvl >= 1 && (isReviewed || st === 'active')) || (st === 'active' && isReviewed);

      case 'include_drafts':
        return lvl >= 0 && st !== 'archived' && st !== 'deleted' && st !== 'deprecated';

      default:
        return (lvl >= 2 && isReviewed) || (lvl >= 1 && (isReviewed || st === 'active')) || (st === 'active' && isReviewed);
    }
  }

  /**
   * Resolves target chapter metadata by ID, sequence number, or title
   * @private
   * @param {string|number|null} rawChapterId
   * @param {number} volumeNumber
   * @returns {object|null}
   */
  _resolveChapter(rawChapterId, volumeNumber) {
    if (rawChapterId === undefined || rawChapterId === null || String(rawChapterId).trim() === '') {
      return null;
    }
    const db = this.dbManager.getDatabase();
    const chStr = String(rawChapterId).trim();
    const chNum = parseInt(chStr, 10);

    try {
      if (!isNaN(chNum)) {
        // Strategy A: Match by volume_number and chapter_number
        const byVol = db.prepare('SELECT * FROM chapters WHERE volume_number = ? AND chapter_number = ?').get(volumeNumber, chNum);
        if (byVol) return byVol;

        // Strategy B: Match by chapter_number across all volumes
        const byNum = db.prepare('SELECT * FROM chapters WHERE chapter_number = ? ORDER BY volume_number ASC LIMIT 1').get(chNum);
        if (byNum) return byNum;

        // Strategy C: Match by numeric PK id
        const byId = db.prepare('SELECT * FROM chapters WHERE id = ?').get(chNum);
        if (byId) return byId;
      }

      // Strategy D: Match by relative path or title substring
      const byPath = db.prepare('SELECT * FROM chapters WHERE relative_path LIKE ? OR title LIKE ? LIMIT 1').get(`%${chStr}%`, `%${chStr}%`);
      if (byPath) return byPath;
    } catch (err) {
      console.warn(`[ContextV3Engine] Chapter resolution error: ${err.message}`);
    }

    return null;
  }

  /**
   * Resolves focus entities, aliases, POV character, and 1st-degree relational graph neighbors
   * @private
   * @param {Array<string>} focusEntityNames
   * @param {object|null} chapterObj
   * @returns {object}
   */
  _resolveFocusEntities(focusEntityNames, chapterObj) {
    const matchedEntities = [];
    const focusEntityIds = new Set();
    const focusEntityDbIds = new Set();
    const focusSourceFileIds = new Set();
    const neighborEntityDbIds = new Set();
    const entityAliasesMap = new Map();

    const db = this.dbManager.getDatabase();

    // 1. Resolve Focus Entity Names & Aliases
    for (const name of focusEntityNames) {
      try {
        // Match in entities by entity_id or canonical_name
        const ents = db.prepare(`
          SELECT e.* FROM entities e
          WHERE e.entity_id = ? OR e.canonical_name = ?
        `).all(name, name);

        // Match in entity_aliases
        const aliasEnts = db.prepare(`
          SELECT e.* FROM entity_aliases ea
          JOIN entities e ON ea.entity_id = e.id
          WHERE ea.alias_name = ?
        `).all(name);

        const combined = [...ents, ...aliasEnts];
        for (const ent of combined) {
          if (!focusEntityDbIds.has(ent.id)) {
            focusEntityDbIds.add(ent.id);
            focusEntityIds.add(ent.entity_id);
            matchedEntities.push(ent);
            if (ent.source_file_id) {
              focusSourceFileIds.add(ent.source_file_id);
            }
          }
        }
      } catch (err) {
        console.warn(`[ContextV3Engine] Entity resolution error for "${name}": ${err.message}`);
      }
    }

    // 2. Resolve POV Entity from Chapter
    if (chapterObj && chapterObj.pov_entity_id && !focusEntityDbIds.has(chapterObj.pov_entity_id)) {
      try {
        let povEnt = null;
        if (this.dbManager.entities && typeof this.dbManager.entities.getById === 'function') {
          povEnt = this.dbManager.entities.getById(chapterObj.pov_entity_id);
        } else {
          povEnt = db.prepare('SELECT * FROM entities WHERE id = ?').get(chapterObj.pov_entity_id);
        }
        if (povEnt) {
          matchedEntities.push(povEnt);
          focusEntityDbIds.add(povEnt.id);
          focusEntityIds.add(povEnt.entity_id);
          if (povEnt.source_file_id) {
            focusSourceFileIds.add(povEnt.source_file_id);
          }
        }
      } catch (_) {}
    }

    // 3. Load Aliases for All Matched Entities
    for (const ent of matchedEntities) {
      try {
        const aliases = db.prepare('SELECT alias_name FROM entity_aliases WHERE entity_id = ?').all(ent.id);
        entityAliasesMap.set(ent.id, aliases.map(a => a.alias_name));
      } catch (_) {
        entityAliasesMap.set(ent.id, []);
      }
    }

    // 4. Resolve 1st-Degree Relational Graph Neighborhood
    if (focusEntityDbIds.size > 0) {
      try {
        const placeholders = Array.from(focusEntityDbIds).map(() => '?').join(',');
        const relations = db.prepare(`
          SELECT source_entity_id, target_entity_id
          FROM entity_relations
          WHERE source_entity_id IN (${placeholders}) OR target_entity_id IN (${placeholders})
        `).all(...Array.from(focusEntityDbIds), ...Array.from(focusEntityDbIds));

        for (const rel of relations) {
          if (!focusEntityDbIds.has(rel.source_entity_id)) {
            neighborEntityDbIds.add(rel.source_entity_id);
          }
          if (!focusEntityDbIds.has(rel.target_entity_id)) {
            neighborEntityDbIds.add(rel.target_entity_id);
          }
        }
      } catch (_) {
        // entity_relations table might not exist in old test databases
      }
    }

    return {
      matchedEntities,
      focusEntityIds,
      focusEntityDbIds,
      focusSourceFileIds,
      neighborEntityDbIds,
      entityAliasesMap
    };
  }

  /**
   * Safely reads on-disk markdown text with sandbox enforcement
   * @private
   * @param {string|null} filePath
   * @param {string|null} fileNameOrFallback
   * @param {boolean} [includeRawContent=true]
   * @returns {string}
   */
  _safeReadContent(filePath, fileNameOrFallback, includeRawContent = true) {
    if (!includeRawContent) return '';
    if (!filePath) return fileNameOrFallback || '';

    try {
      if (this.pathGuard) {
        const readPath = this.pathGuard.assertReadOnlyPath(filePath, 'r');
        if (fs.existsSync(readPath)) {
          return fs.readFileSync(readPath, 'utf8');
        }
      } else if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
    } catch (_) {
      // Graceful fallback for non-existent mock paths
    }

    return fileNameOrFallback || '';
  }

  /**
   * Formats structured Markdown assembled context string
   * @private
   * @param {object} snapshot
   * @param {object|null} chapter
   * @param {string} policy
   * @param {number|null} maxTokens
   * @returns {string}
   */
  _buildAssembledContextMarkdown(snapshot, chapter, policy, maxTokens) {
    const sections = [];

    sections.push('# NovelEngineering Context v3 Snapshot');
    if (chapter) {
      sections.push(`## Chapter Focus: CH-${chapter.chapter_number !== undefined ? chapter.chapter_number : 'N/A'} (${chapter.title || 'Untitled'}) [Volume ${chapter.volume_number || 1}]`);
    }

    // 1. Universal World Rules (Global Axioms)
    if (snapshot.worldRules && snapshot.worldRules.global && snapshot.worldRules.global.length > 0) {
      sections.push('## 🌌 Universal World Rules (Global Axioms)');
      for (const r of snapshot.worldRules.global) {
        const stamp = r.sha256Hash ? r.sha256Hash.slice(0, 12) : 'unhashed';
        sections.push(`### [Axiom] ${r.canonicalName} (\`${r.sourceFilePath}\` | SHA256: \`${stamp}...\`)\n${r.content || ''}`);
      }
    }

    // 2. Local World Rules (Scoped)
    if (snapshot.worldRules && snapshot.worldRules.scoped && snapshot.worldRules.scoped.length > 0) {
      sections.push('## 🪐 Local World Rules (Scoped)');
      for (const r of snapshot.worldRules.scoped) {
        sections.push(`### [Scoped Rule] ${r.canonicalName} (\`${r.sourceFilePath}\`)\n${r.content || ''}`);
      }
    }

    // 3. Authoritative Canon Lore
    if (snapshot.canonSources && snapshot.canonSources.length > 0) {
      sections.push('## 📜 Authoritative Canon Lore');
      for (const c of snapshot.canonSources) {
        const stamp = c.sha256Hash ? c.sha256Hash.slice(0, 12) : 'unhashed';
        const aliasStr = c.aliases && c.aliases.length > 0 ? ` | Aliases: ${c.aliases.join(', ')}` : '';
        sections.push(`### [Canon Level ${c.canonLevel}] ${c.canonicalName} (${c.entityId}${aliasStr})\n*Source: \`${c.sourceFilePath}\` | Status: ${c.status} | SHA256: \`${stamp}...\`*\n\n${c.content || ''}`);
      }
    }

    // 4. Candidate & Reference Sources
    if (snapshot.candidateSources && snapshot.candidateSources.length > 0) {
      sections.push('## 💡 Candidate & Reference Sources');
      for (const c of snapshot.candidateSources) {
        sections.push(`### [Candidate] ${c.canonicalName} (${c.entityId})\n*Source: \`${c.sourceFilePath}\` | Review: ${c.reviewStatus}*\n\n${c.content || ''}`);
      }
    }

    // 5. Timeline Events
    if (snapshot.timelineEvents && snapshot.timelineEvents.length > 0) {
      sections.push('## ⏳ Timeline & Chronological Events');
      for (const t of snapshot.timelineEvents) {
        sections.push(`- **[${t.timePoint || 'Unknown'}]** \`${t.eventId}\`: **${t.title}** *(Order: ${t.timestampOrder})* — ${t.description || 'No description'}`);
      }
    }

    // 6. Foreshadowing & Unresolved Hooks
    if (snapshot.unresolved && snapshot.unresolved.length > 0) {
      sections.push('## 🧵 Open Foreshadowing & Narrative Clues');
      for (const f of snapshot.unresolved) {
        sections.push(`- **[${f.importanceLevel || 'major'}]** \`${f.foreshadowId}\`: **${f.title}** *(Planted: CH-${f.setupChapter || 'N/A'})* — ${f.description || ''}`);
      }
    }

    // 7. Active Setting Conflicts
    if (snapshot.conflicts && snapshot.conflicts.length > 0) {
      sections.push('## ⚠️ Active Setting Conflicts');
      for (const c of snapshot.conflicts) {
        sections.push(`- 🔴 **[${c.severity || 'warning'}] ${c.title}**: ${c.message} *(Source: \`${c.sourceFilePath || 'virtual'}\`)*`);
      }
    }

    let fullMarkdown = sections.join('\n\n');

    // Token budget control (if maxTokens specified)
    if (maxTokens && maxTokens > 0) {
      const charBudget = maxTokens * 3; // Approx ~3 characters per token ceiling
      if (fullMarkdown.length > charBudget) {
        fullMarkdown = fullMarkdown.slice(0, charBudget) + '\n\n... [Context truncated due to maxTokens budget limit]';
      }
    }

    return fullMarkdown;
  }
}

module.exports = ContextV3Engine;
