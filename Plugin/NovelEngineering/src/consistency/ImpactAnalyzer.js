/**
 * @file ImpactAnalyzer.js
 * @description Change Impact & Blast Radius Analysis Engine across the Lore Knowledge Graph (Phase 3 Milestone 3)
 * @module consistency/ImpactAnalyzer
 * @license MIT
 */

'use strict';

const { NovelError } = require('../errors');

class ImpactAnalyzer {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new NovelError('DatabaseManager is required for ImpactAnalyzer', 'INVALID_PARAMETER');
    }
    this.dbManager = dbManager;
    this.options = options;
  }

  /**
   * Analyzes downstream impact and blast radius before a lore mutation is committed.
   * @param {object} params
   * @param {string|number} [params.entityId]
   * @param {number} [params.entityDbId]
   * @param {string|number} [params.sourceFileId]
   * @param {string} [params.filePath]
   * @param {string} [params.relativePath]
   * @param {string|number} [params.targetId]
   * @param {string} [params.targetType]
   * @param {string} [params.changeType='MODIFY'] - 'MODIFY'|'DEPRECATE'|'RENAME'|'RELOCATE'|'PROMOTE'|'DELETE'|'ARCHIVE'
   * @param {object} [params.proposedChanges={}]
   * @param {number} [params.maxDepth=2] - Graph traversal depth (1 to 5)
   * @param {Array<string>} [params.relationTypes]
   * @param {number} [params.minConfidence=0.0]
   * @param {boolean} [params.includeDrafts=true]
   * @returns {object} Full impact analysis report
   */
  analyzeChangeImpact(params = {}) {
    const { target, targetType } = this._resolveTarget(params);
    const changeType = String(params.changeType || 'MODIFY').toUpperCase().trim();
    const proposedChanges = params.proposedChanges || {};
    const maxDepth = Math.min(5, Math.max(1, parseInt(params.maxDepth, 10) || 2));
    const minConfidence = params.minConfidence !== undefined ? Number(params.minConfidence) : 0.0;
    const relationTypes = Array.isArray(params.relationTypes) ? params.relationTypes : null;
    const includeDrafts = params.includeDrafts !== false;

    const db = this.dbManager.getDatabase();

    // 1. Lore Graph Traversal (Entities & Relations)
    const graphResult = this._traverseEntityGraph(target, targetType, {
      maxDepth,
      minConfidence,
      relationTypes,
      db
    });

    const affectedEntities = graphResult.affectedEntities;
    const directRelations = graphResult.directRelations;
    const extendedRelations = graphResult.extendedRelations;
    const secondDegreeRelations = graphResult.secondDegreeRelations;
    const entityDbIds = graphResult.allEntityDbIds;
    const entityCodes = graphResult.allEntityCodes;

    // 2. Cascade: Source Files
    const affectedSourceFiles = this._cascadeSourceFiles(target, targetType, entityDbIds, db);
    const sourceFileIds = affectedSourceFiles.map(f => f.fileId);

    // 3. Cascade: Chapters
    const affectedChapters = this._cascadeChapters(target, targetType, entityDbIds, sourceFileIds, db);
    const chapterIds = affectedChapters.map(c => c.chapterId);

    // 4. Cascade: Timeline Events (Primary, Participants, Causal DAG)
    const affectedTimelineEvents = this._cascadeTimelineEvents(target, targetType, entityDbIds, entityCodes, sourceFileIds, db);

    // 5. Cascade: Foreshadowing Hooks
    const affectedForeshadowing = this._cascadeForeshadowing(target, targetType, entityCodes, sourceFileIds, chapterIds, db);

    // 6. Active Anomalies
    const potentialAnomalies = this._fetchRelatedAnomalies(target, targetType, affectedSourceFiles, affectedEntities, db);

    // 7. Calculate Degree Centrality & Hub Bonus
    const degreeCentrality = this._computeDegreeCentrality(target, targetType, db);

    // 8. Impact Risk Rating & Score Calculation
    const { blastRadiusScore, impactRating, scoreBreakdown } = this._calculateRiskScore({
      target,
      targetType,
      changeType,
      degreeCentrality,
      affectedEntities,
      directRelations,
      extendedRelations,
      affectedSourceFiles,
      affectedChapters,
      affectedTimelineEvents,
      affectedForeshadowing,
      potentialAnomalies
    });

    // 9. Generate Actionable Recommendations
    const structuredRecommendations = this._generateRecommendations({
      target,
      targetType,
      changeType,
      impactRating,
      blastRadiusScore,
      directRelations,
      affectedChapters,
      affectedTimelineEvents,
      affectedForeshadowing,
      potentialAnomalies
    });

    const recommendations = structuredRecommendations.map(r => r.message);
    const targetIdStr = targetType === 'source_file' ? target.relative_path : target.entity_id;

    return {
      target: {
        type: targetType,
        id: targetIdStr,
        dbId: target.id,
        canonicalName: target.canonical_name || target.file_name,
        currentStatus: target.status,
        currentCanonLevel: target.canon_level || 0,
        currentReviewStatus: target.review_status,
        sourceFilePath: target.relative_path || (target.source_file_relative_path || null),
        degreeCentrality
      },
      changeType,
      proposedChanges,
      impactRating,
      blastRadiusScore,
      scoreBreakdown,
      traversalStats: {
        maxDepthRequested: maxDepth,
        maxDepthReached: graphResult.maxDepthReached,
        totalGraphNodesVisited: affectedEntities.length,
        totalEdgesEvaluated: directRelations.length + extendedRelations.length
      },
      directRelations,
      extendedRelations,
      secondDegreeRelations,
      affectedEntities,
      affectedSourceFiles,
      affectedChapters,
      affectedTimelineEvents,
      activeForeshadowing: affectedForeshadowing,
      affectedForeshadowing,
      potentialAnomalies,
      recommendations,
      structuredRecommendations,
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Resolves target record polymorphically from heterogeneous parameters
   * @private
   */
  _resolveTarget(params = {}) {
    const hasFileParam = params.sourceFileId !== undefined ||
      params.source_file_id !== undefined ||
      params.filePath ||
      params.file_path ||
      params.relativePath ||
      params.relative_path ||
      params.fileId !== undefined ||
      params.file_id !== undefined;

    if (hasFileParam) {
      const fileRef = params.sourceFileId !== undefined ? params.sourceFileId :
        (params.source_file_id !== undefined ? params.source_file_id :
        (params.fileId !== undefined ? params.fileId :
        (params.file_id !== undefined ? params.file_id :
        (params.filePath || params.file_path || params.relativePath || params.relative_path))));

      const file = this.dbManager.sourceFiles.findByPathOrId(fileRef);
      if (file) return { target: file, targetType: 'source_file' };
    }

    const hasEntityParam = params.entityId ||
      params.entity_id ||
      params.entityDbId !== undefined ||
      params.entity_db_id !== undefined;

    if (hasEntityParam) {
      const entityRef = params.entityId || params.entity_id || params.entityDbId || params.entity_db_id;
      const entity = (typeof entityRef === 'number' || /^\d+$/.test(String(entityRef)))
        ? (this.dbManager.entities.getById(Number(entityRef)) || this.dbManager.entities.getSingleByEntityId(String(entityRef)))
        : this.dbManager.entities.getSingleByEntityId(String(entityRef));

      if (entity) return { target: entity, targetType: 'entity' };
    }

    if (params.targetId || params.target_id) {
      const tId = params.targetId || params.target_id;
      const tType = String(params.targetType || params.target_type || '').toLowerCase();

      if (tType === 'entity') {
        const ent = this.dbManager.entities.getSingleByEntityId(String(tId)) || this.dbManager.entities.getById(Number(tId));
        if (ent) return { target: ent, targetType: 'entity' };
      }
      if (tType === 'source_file') {
        const file = this.dbManager.sourceFiles.findByPathOrId(tId);
        if (file) return { target: file, targetType: 'source_file' };
      }

      const file = this.dbManager.sourceFiles.findByPathOrId(tId);
      if (file) return { target: file, targetType: 'source_file' };

      const ent = this.dbManager.entities.getSingleByEntityId(String(tId)) || this.dbManager.entities.getById(Number(tId));
      if (ent) return { target: ent, targetType: 'entity' };
    }

    throw new NovelError('Target entity or source file could not be resolved for impact analysis.', 'TARGET_NOT_FOUND', { params });
  }

  /**
   * BFS Traversal across entity_relations up to maxDepth
   * @private
   */
  _traverseEntityGraph(target, targetType, { maxDepth, minConfidence, relationTypes, db }) {
    let seedEntityDbIds = [];

    if (targetType === 'entity') {
      seedEntityDbIds = [target.id];
    } else {
      const defined = db.prepare(`
        SELECT id FROM entities WHERE source_file_id = ?
        UNION
        SELECT entity_id AS id FROM file_entities WHERE source_file_id = ? AND mention_type IN ('definition', 'primary_subject')
      `).all(target.id, target.id);
      seedEntityDbIds = defined.map(d => d.id);
    }

    if (seedEntityDbIds.length === 0) {
      return {
        affectedEntities: [],
        directRelations: [],
        extendedRelations: [],
        secondDegreeRelations: [],
        allEntityDbIds: [],
        allEntityCodes: [],
        maxDepthReached: 0
      };
    }

    const visitedMap = new Map(); // dbId -> { depth, pathConfidence }
    for (const sId of seedEntityDbIds) {
      visitedMap.set(sId, { depth: 0, pathConfidence: 1.0 });
    }

    const directRelations = [];
    const extendedRelations = [];
    const secondDegreeRelations = [];
    let currentTier = [...seedEntityDbIds];
    let maxDepthReached = 0;

    for (let depth = 1; depth <= maxDepth; depth++) {
      if (currentTier.length === 0) break;
      const nextTier = [];
      const placeholders = currentTier.map(() => '?').join(', ');

      let sql = `
        SELECT er.id, er.source_entity_id, er.target_entity_id, er.relation_type,
               er.weight, er.confidence, er.bidirectional, er.description,
               se.id AS source_db_id, se.entity_id AS source_code, se.canonical_name AS source_name,
               te.id AS target_db_id, te.entity_id AS target_code, te.canonical_name AS target_name
        FROM entity_relations er
        JOIN entities se ON er.source_entity_id = se.id
        JOIN entities te ON er.target_entity_id = te.id
        WHERE (er.source_entity_id IN (${placeholders}) OR er.target_entity_id IN (${placeholders}))
      `;
      const params = [...currentTier, ...currentTier];

      if (minConfidence > 0) {
        sql += ' AND er.confidence >= ?';
        params.push(minConfidence);
      }

      const relations = db.prepare(sql).all(...params);
      if (relations.length > 0) {
        maxDepthReached = depth;
      }

      for (const rel of relations) {
        if (relationTypes && !relationTypes.includes(rel.relation_type)) continue;

        const isSource = currentTier.includes(rel.source_entity_id);
        const currNodeId = isSource ? rel.source_entity_id : rel.target_entity_id;
        const neighborId = isSource ? rel.target_entity_id : rel.source_entity_id;
        const neighborCode = isSource ? rel.target_code : rel.source_code;
        const neighborName = isSource ? rel.target_name : rel.source_name;

        const currVisited = visitedMap.get(currNodeId) || { pathConfidence: 1.0 };
        const edgeConfidence = rel.confidence !== null && rel.confidence !== undefined ? rel.confidence : 1.0;
        const newConfidence = currVisited.pathConfidence * edgeConfidence;

        if (depth === 1) {
          directRelations.push({
            relationId: rel.id,
            relationType: rel.relation_type,
            direction: isSource ? 'outgoing' : (rel.bidirectional ? 'bidirectional' : 'incoming'),
            partnerEntityDbId: neighborId,
            partnerEntityId: neighborCode,
            partnerName: neighborName,
            confidence: edgeConfidence
          });
        } else {
          extendedRelations.push({
            relationId: rel.id,
            relationType: rel.relation_type,
            hopDepth: depth,
            sourceEntityId: rel.source_code,
            targetEntityId: rel.target_code,
            pathConfidence: newConfidence
          });

          if (depth === 2) {
            secondDegreeRelations.push({
              relationId: rel.id,
              relationType: rel.relation_type,
              connectedViaEntityId: currNodeId,
              hopEntityId: neighborCode,
              hopName: neighborName
            });
          }
        }

        if (!visitedMap.has(neighborId)) {
          visitedMap.set(neighborId, { depth, pathConfidence: newConfidence });
          nextTier.push(neighborId);
        }
      }

      currentTier = nextTier;
    }

    const allEntityDbIds = Array.from(visitedMap.keys());
    let affectedEntities = [];

    if (allEntityDbIds.length > 0) {
      const placeholders = allEntityDbIds.map(() => '?').join(', ');
      const rows = db.prepare(`
        SELECT id, entity_id, canonical_name, entity_type, status, review_status, canon_level, summary, source_file_id
        FROM entities WHERE id IN (${placeholders})
      `).all(...allEntityDbIds);

      affectedEntities = rows.map(r => {
        const vInfo = visitedMap.get(r.id);
        const hop = vInfo ? vInfo.depth : 0;
        return {
          id: r.id,
          dbId: r.id,
          entityId: r.entity_id,
          canonicalName: r.canonical_name,
          entityType: r.entity_type,
          status: r.status,
          reviewStatus: r.review_status,
          canonLevel: r.canon_level,
          summary: r.summary,
          sourceFileId: r.source_file_id,
          hopDistance: hop,
          pathConfidence: vInfo ? vInfo.pathConfidence : 1.0,
          reason: hop === 0
            ? 'Target Entity'
            : (hop === 1 ? `Direct relation with target entity` : `Graph neighbor at ${hop} hop(s)`)
        };
      });
    }

    const allEntityCodes = affectedEntities.map(e => e.entityId);

    return {
      affectedEntities,
      directRelations,
      extendedRelations,
      secondDegreeRelations,
      allEntityDbIds,
      allEntityCodes,
      maxDepthReached
    };
  }

  /**
   * Cascade to affected source files
   * @private
   */
  _cascadeSourceFiles(target, targetType, entityDbIds, db) {
    const fileMap = new Map();

    if (targetType === 'source_file') {
      fileMap.set(target.id, {
        fileId: target.id,
        relativePath: target.relative_path,
        fileName: target.file_name,
        category: target.source_category,
        status: target.status,
        canonLevel: target.canon_level,
        reason: 'Direct target source file'
      });
    }

    if (entityDbIds.length > 0) {
      const placeholders = entityDbIds.map(() => '?').join(', ');

      // Primary definition files
      const defFiles = db.prepare(`
        SELECT sf.id, sf.relative_path, sf.file_name, sf.source_category, sf.status, sf.canon_level
        FROM entities e
        JOIN source_files sf ON e.source_file_id = sf.id
        WHERE e.id IN (${placeholders})
      `).all(...entityDbIds);

      for (const f of defFiles) {
        if (!fileMap.has(f.id)) {
          fileMap.set(f.id, {
            fileId: f.id,
            relativePath: f.relative_path,
            fileName: f.file_name,
            category: f.source_category,
            status: f.status,
            canonLevel: f.canon_level,
            reason: 'Originating definition file of affected entity'
          });
        }
      }

      // Mentioning files
      const mentionFiles = db.prepare(`
        SELECT sf.id, sf.relative_path, sf.file_name, sf.source_category, sf.status, sf.canon_level, fe.mention_type
        FROM file_entities fe
        JOIN source_files sf ON fe.source_file_id = sf.id
        WHERE fe.entity_id IN (${placeholders})
      `).all(...entityDbIds);

      for (const f of mentionFiles) {
        if (!fileMap.has(f.id)) {
          fileMap.set(f.id, {
            fileId: f.id,
            relativePath: f.relative_path,
            fileName: f.file_name,
            category: f.source_category,
            status: f.status,
            canonLevel: f.canon_level,
            mentionType: f.mention_type,
            reason: `Cross-references affected entity (${f.mention_type})`
          });
        }
      }
    }

    return Array.from(fileMap.values());
  }

  /**
   * Cascade to affected chapters
   * @private
   */
  _cascadeChapters(target, targetType, entityDbIds, sourceFileIds, db) {
    const chapterMap = new Map();

    // 1. Direct file link
    if (sourceFileIds.length > 0) {
      const placeholders = sourceFileIds.map(() => '?').join(', ');
      const rows = db.prepare(`
        SELECT c.id, c.chapter_number, c.volume_number, c.title, c.relative_path, c.status, c.canon, c.pov_entity_id
        FROM chapters c
        WHERE c.source_file_id IN (${placeholders})
      `).all(...sourceFileIds);

      for (const r of rows) {
        chapterMap.set(r.id, {
          chapterId: r.id,
          chapterNumber: r.chapter_number,
          volumeNumber: r.volume_number,
          title: r.title,
          status: r.status,
          canon: r.canon,
          isPovChapter: false,
          reason: 'Chapter document linked to affected source file'
        });
      }
    }

    // 2. POV Entity chapters
    if (entityDbIds.length > 0) {
      const placeholders = entityDbIds.map(() => '?').join(', ');
      const povRows = db.prepare(`
        SELECT c.id, c.chapter_number, c.volume_number, c.title, c.relative_path, c.status, c.canon, c.pov_entity_id
        FROM chapters c
        WHERE c.pov_entity_id IN (${placeholders})
      `).all(...entityDbIds);

      for (const r of povRows) {
        const existing = chapterMap.get(r.id);
        if (existing) {
          existing.isPovChapter = true;
          existing.reason += ' | Point-of-View perspective entity';
        } else {
          chapterMap.set(r.id, {
            chapterId: r.id,
            chapterNumber: r.chapter_number,
            volumeNumber: r.volume_number,
            title: r.title,
            status: r.status,
            canon: r.canon,
            isPovChapter: true,
            reason: 'Chapter is narrated from POV of affected entity'
          });
        }
      }
    }

    return Array.from(chapterMap.values());
  }

  /**
   * Cascade to affected timeline events
   * @private
   */
  _cascadeTimelineEvents(target, targetType, entityDbIds, entityCodes, sourceFileIds, db) {
    const eventMap = new Map();

    // 1. Primary entity
    if (entityDbIds.length > 0) {
      const placeholders = entityDbIds.map(() => '?').join(', ');
      const rows = db.prepare(`
        SELECT id, event_id, title, timestamp_order, relative_time_desc, time_point_json, status, primary_entity_id, causality_consequence_ids_json
        FROM timeline_events
        WHERE primary_entity_id IN (${placeholders})
      `).all(...entityDbIds);

      for (const r of rows) {
        eventMap.set(r.event_id, {
          id: r.id,
          eventId: r.event_id,
          title: r.title,
          timePoint: r.relative_time_desc || r.time_point_json || r.timestamp_order,
          timestampOrder: r.timestamp_order,
          isPrimary: true,
          isCausalConsequence: false,
          reason: 'Primary focal entity of timeline event'
        });
      }
    }

    // 2. Participant entity text match in JSON (participant_entity_ids_json or involved_entities_json)
    for (const code of entityCodes) {
      const pRows = db.prepare(`
        SELECT id, event_id, title, timestamp_order, relative_time_desc, time_point_json, status
        FROM timeline_events
        WHERE participant_entity_ids_json LIKE ?
      `).all(`%${code}%`);

      for (const r of pRows) {
        if (!eventMap.has(r.event_id)) {
          eventMap.set(r.event_id, {
            id: r.id,
            eventId: r.event_id,
            title: r.title,
            timePoint: r.relative_time_desc || r.time_point_json || r.timestamp_order,
            timestampOrder: r.timestamp_order,
            isPrimary: false,
            isCausalConsequence: false,
            reason: `Entity ${code} is a listed participant`
          });
        }
      }
    }

    // 3. Causal Consequence DAG cascade
    const directEventIds = Array.from(eventMap.keys());
    for (const eId of directEventIds) {
      const consequenceRows = db.prepare(`
        SELECT id, event_id, title, timestamp_order, relative_time_desc, time_point_json, status
        FROM timeline_events
        WHERE causality_prerequisite_ids_json LIKE ? OR base_event_id = ?
      `).all(`%${eId}%`, eId);

      for (const cr of consequenceRows) {
        if (!eventMap.has(cr.event_id)) {
          eventMap.set(cr.event_id, {
            id: cr.id,
            eventId: cr.event_id,
            title: cr.title,
            timePoint: cr.relative_time_desc || cr.time_point_json || cr.timestamp_order,
            timestampOrder: cr.timestamp_order,
            isPrimary: false,
            isCausalConsequence: true,
            reason: `Causally dependent on event ${eId}`
          });
        }
      }
    }

    return Array.from(eventMap.values());
  }

  /**
   * Cascade to affected foreshadowing clues
   * @private
   */
  _cascadeForeshadowing(target, targetType, entityCodes, sourceFileIds, chapterIds, db) {
    const hookMap = new Map();

    // 1. Related entities match
    for (const code of entityCodes) {
      const rows = db.prepare(`
        SELECT id, foreshadow_id, title, description, setup_chapter_id, resolution_chapter_id, status, importance_level, introduced_chapter, target_resolve_chapter, actual_resolve_chapter
        FROM foreshadowing
        WHERE related_entities_json LIKE ?
      `).all(`%${code}%`);

      for (const r of rows) {
        hookMap.set(r.foreshadow_id, {
          id: r.id,
          foreshadowId: r.foreshadow_id,
          title: r.title,
          status: r.status,
          importanceLevel: r.importance_level,
          setupChapter: r.introduced_chapter || r.setup_chapter_id,
          resolveChapter: r.actual_resolve_chapter || r.target_resolve_chapter || r.resolution_chapter_id,
          reason: `Plot clue references entity ${code}`
        });
      }
    }

    // 2. Setup or resolution file match
    if (sourceFileIds.length > 0) {
      const placeholders = sourceFileIds.map(() => '?').join(', ');
      const fRows = db.prepare(`
        SELECT id, foreshadow_id, title, description, status, importance_level, setup_file_id, resolution_file_id, introduced_chapter, target_resolve_chapter, actual_resolve_chapter
        FROM foreshadowing
        WHERE setup_file_id IN (${placeholders}) OR resolution_file_id IN (${placeholders})
      `).all(...sourceFileIds, ...sourceFileIds);

      for (const r of fRows) {
        if (!hookMap.has(r.foreshadow_id)) {
          hookMap.set(r.foreshadow_id, {
            id: r.id,
            foreshadowId: r.foreshadow_id,
            title: r.title,
            status: r.status,
            importanceLevel: r.importance_level,
            setupChapter: r.introduced_chapter,
            resolveChapter: r.actual_resolve_chapter || r.target_resolve_chapter,
            reason: 'Clue setup or payoff is authored in affected source file'
          });
        }
      }
    }

    return Array.from(hookMap.values());
  }

  /**
   * Fetch unresolved anomalies attached to target or affected artifacts
   * @private
   */
  _fetchRelatedAnomalies(target, targetType, affectedFiles, affectedEntities, db) {
    const targetIdStr = targetType === 'source_file' ? target.relative_path : target.entity_id;
    const allRelPaths = affectedFiles.map(f => f.relativePath);
    const allCodes = affectedEntities.map(e => e.entityId);

    const matchTerms = Array.from(new Set([targetIdStr, ...allRelPaths, ...allCodes])).filter(Boolean);
    if (matchTerms.length === 0) return [];

    const anomalies = [];
    const seenIds = new Set();

    for (const term of matchTerms.slice(0, 20)) {
      const rows = db.prepare(`
        SELECT id, anomaly_rule_id, severity, title, message
        FROM anomaly_reports
        WHERE is_resolved = 0 AND (affected_file_paths_json LIKE ? OR affected_entity_ids_json LIKE ?)
      `).all(`%${term}%`, `%${term}%`);

      for (const r of rows) {
        if (!seenIds.has(r.id)) {
          seenIds.add(r.id);
          anomalies.push({
            ruleId: r.anomaly_rule_id,
            severity: r.severity,
            title: r.title,
            message: r.message
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Compute Degree Centrality of target
   * @private
   */
  _computeDegreeCentrality(target, targetType, db) {
    if (targetType !== 'entity') return 0;
    try {
      const row = db.prepare(`
        SELECT COUNT(*) AS total
        FROM entity_relations
        WHERE source_entity_id = ? OR target_entity_id = ?
      `).get(target.id, target.id);
      return row ? row.total : 0;
    } catch (_) {
      return 0;
    }
  }

  /**
   * Mathematical Blast Radius Score & Risk Rating Engine
   * @private
   */
  _calculateRiskScore(data) {
    const {
      target,
      targetType,
      changeType,
      degreeCentrality,
      affectedEntities,
      directRelations,
      extendedRelations,
      affectedSourceFiles,
      affectedChapters,
      affectedTimelineEvents,
      affectedForeshadowing,
      potentialAnomalies
    } = data;

    // Artifact Counts
    const canonChaptersCount = affectedChapters.filter(c => c.canon === 1).length;
    const draftChaptersCount = affectedChapters.filter(c => c.canon !== 1).length;
    const primaryTimelineCount = affectedTimelineEvents.filter(t => t.isPrimary || t.isCausalConsequence).length;
    const participantTimelineCount = affectedTimelineEvents.filter(t => !t.isPrimary && !t.isCausalConsequence).length;
    const openForeshadowCount = affectedForeshadowing.filter(f => f.status === 'open').length;
    const closedForeshadowCount = affectedForeshadowing.filter(f => f.status !== 'open').length;
    const directEntitiesCount = affectedEntities.filter(e => e.hopDistance === 1).length;
    const extendedEntitiesCount = affectedEntities.filter(e => e.hopDistance > 1).length;
    const defFilesCount = affectedSourceFiles.filter(f => f.reason && f.reason.includes('definition')).length;
    const refFilesCount = affectedSourceFiles.filter(f => !f.reason || !f.reason.includes('definition')).length;
    const anomaliesCount = potentialAnomalies.length;

    // Sub-scores
    const chaptersScore = (canonChaptersCount * 6.0) + (draftChaptersCount * 3.0);
    const timelineScore = (primaryTimelineCount * 4.5) + (participantTimelineCount * 2.5);
    const foreshadowingScore = (openForeshadowCount * 4.0) + (closedForeshadowCount * 1.5);
    const entitiesScore = (directEntitiesCount * 3.0) + (extendedEntitiesCount * 1.5);
    const sourceFilesScore = (defFilesCount * 4.0) + (refFilesCount * 1.5);
    const anomaliesScore = anomaliesCount * 3.0;

    // Hub Centrality Bonus
    let centralityBonus = 0;
    if (degreeCentrality >= 10) centralityBonus = 12;
    else if (degreeCentrality >= 5) centralityBonus = 5;

    const rawScore = chaptersScore + timelineScore + foreshadowingScore + entitiesScore + sourceFilesScore + anomaliesScore + centralityBonus;

    // Canon Multiplier
    const canonLevel = target.canon_level || 0;
    let canonMultiplier = 1.0;
    if (canonLevel >= 3) canonMultiplier = 2.0;
    else if (canonLevel === 2) canonMultiplier = 1.5;
    else if (canonLevel === 1) canonMultiplier = 1.2;

    // Change Type Multiplier
    let changeTypeMultiplier = 1.0;
    if (changeType === 'DEPRECATE' || changeType === 'DELETE' || changeType === 'ARCHIVE') {
      changeTypeMultiplier = 2.0;
    } else if (changeType === 'RENAME' || changeType === 'RELOCATE') {
      changeTypeMultiplier = 1.4;
    } else if (changeType === 'PROMOTE') {
      changeTypeMultiplier = 1.2;
    }

    const blastRadiusScore = Math.round(rawScore * canonMultiplier * changeTypeMultiplier);

    // Discrete Rating
    const hasCriticalAnomaly = potentialAnomalies.some(a => (a.severity || '').toUpperCase() === 'CRITICAL');

    let impactRating = 'LOW';
    if (
      blastRadiusScore >= 40 ||
      (changeTypeMultiplier >= 2.0 && canonLevel >= 2) ||
      (changeType === 'DEPRECATE' && blastRadiusScore > 10) ||
      canonChaptersCount >= 3 ||
      hasCriticalAnomaly
    ) {
      impactRating = 'CRITICAL';
    } else if (
      blastRadiusScore >= 20 ||
      blastRadiusScore > 15 ||
      canonLevel >= 2 ||
      canonChaptersCount >= 1 ||
      primaryTimelineCount >= 2
    ) {
      impactRating = 'HIGH';
    } else if (
      blastRadiusScore >= 8 ||
      blastRadiusScore > 5 ||
      draftChaptersCount >= 1 ||
      affectedTimelineEvents.length >= 1 ||
      openForeshadowCount >= 1 ||
      directRelations.length > 0
    ) {
      impactRating = 'MEDIUM';
    }

    return {
      blastRadiusScore,
      impactRating,
      scoreBreakdown: {
        rawScore,
        canonMultiplier,
        changeTypeMultiplier,
        centralityBonus,
        artifactScores: {
          entitiesScore,
          chaptersScore,
          timelineScore,
          foreshadowingScore,
          sourceFilesScore,
          anomaliesScore
        }
      }
    };
  }

  /**
   * Actionable Recommendations Generator
   * @private
   */
  _generateRecommendations(data) {
    const {
      target,
      targetType,
      changeType,
      impactRating,
      blastRadiusScore,
      directRelations,
      affectedChapters,
      affectedTimelineEvents,
      affectedForeshadowing,
      potentialAnomalies
    } = data;

    const recommendations = [];

    // 1. Safety Gate & Snapshot
    if (impactRating === 'CRITICAL' || impactRating === 'HIGH') {
      recommendations.push({
        category: 'SAFETY_GATE',
        priority: 'HIGH',
        message: 'Create a point-in-time project snapshot (CreateProjectSnapshot) before applying mutations to this target.'
      });
    }

    if (changeType === 'PROMOTE' || changeType === 'DEPRECATE' || changeType === 'DELETE' || changeType === 'ARCHIVE') {
      recommendations.push({
        category: 'SAFETY_GATE',
        priority: 'HIGH',
        message: 'Mandatory confirmation token "CONFIRM_CANON_CHANGE" required to execute state mutation.'
      });
    }

    // 2. Chapter Editorial Continuity
    if (affectedChapters.length > 0) {
      const canonChaps = affectedChapters.filter(c => c.canon === 1);
      if (canonChaps.length > 0) {
        recommendations.push({
          category: 'CHAPTER_CONTINUITY',
          priority: 'HIGH',
          message: `Review narrative continuity in ${canonChaps.length} canonical chapter(s): ${canonChaps.map(c => `CH-${c.chapterNumber} ("${c.title}")`).join(', ')}.`
        });
      } else {
        recommendations.push({
          category: 'CHAPTER_CONTINUITY',
          priority: 'MEDIUM',
          message: `Update narrative drafts in ${affectedChapters.length} chapter draft(s): ${affectedChapters.map(c => `CH-${c.chapterNumber}`).join(', ')}.`
        });
      }
    }

    // 3. Timeline Re-synchronization
    if (affectedTimelineEvents.length > 0) {
      const causalEvents = affectedTimelineEvents.filter(t => t.isCausalConsequence);
      if (causalEvents.length > 0) {
        recommendations.push({
          category: 'TIMELINE_SYNC',
          priority: 'HIGH',
          message: `Re-evaluate causal timeline dependencies for ${causalEvents.length} downstream event(s): ${causalEvents.map(e => `\`${e.eventId}\` (${e.title})`).join(', ')}.`
        });
      } else {
        recommendations.push({
          category: 'TIMELINE_SYNC',
          priority: 'MEDIUM',
          message: `Verify chronological alignment for ${affectedTimelineEvents.length} timeline event(s): ${affectedTimelineEvents.map(e => `\`${e.eventId}\``).join(', ')}.`
        });
      }
    }

    // 4. Foreshadowing Hooks
    const openHooks = affectedForeshadowing.filter(f => f.status === 'open');
    if (openHooks.length > 0) {
      recommendations.push({
        category: 'FORESHADOWING_AUDIT',
        priority: 'HIGH',
        message: `Verify resolution plans for ${openHooks.length} open foreshadowing thread(s): ${openHooks.map(h => `\`${h.foreshadowId}\` ("${h.title}")`).join(', ')}.`
      });
    }

    // 5. Knowledge Graph Healing
    if ((changeType === 'DEPRECATE' || changeType === 'DELETE' || changeType === 'ARCHIVE') && directRelations.length > 0) {
      recommendations.push({
        category: 'GRAPH_HEALING',
        priority: 'HIGH',
        message: `Assign replacement entities or prune ${directRelations.length} active relation(s) to prevent dangling references: ${directRelations.map(r => `"${r.relationType}" with ${r.partnerEntityId}`).join(', ')}.`
      });
    }

    if (changeType === 'RENAME') {
      recommendations.push({
        category: 'GRAPH_HEALING',
        priority: 'MEDIUM',
        message: 'Ensure former entity name is recorded in entity_aliases table with alias_type="former_name".'
      });
    }

    // 6. Anomaly Resolution
    if (potentialAnomalies.length > 0) {
      recommendations.push({
        category: 'ANOMALY_RESOLUTION',
        priority: 'MEDIUM',
        message: `Resolve ${potentialAnomalies.length} existing anomaly report(s) before elevating canon level.`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: 'SAFETY_GATE',
        priority: 'LOW',
        message: 'Impact is localized. Safe to proceed with standard governance review.'
      });
    }

    return recommendations;
  }
}

module.exports = ImpactAnalyzer;
