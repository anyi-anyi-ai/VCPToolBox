/**
 * @file GovernanceEngine.js
 * @description Content Lifecycle & 3-Axis Governance Engine for NovelEngineering Phase 3
 * @module governance/GovernanceEngine
 * @license MIT
 */

'use strict';

const SafetyGate = require('./SafetyGate');
const { NovelError, GovernanceSafetyError } = require('../errors');

class GovernanceEngine {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {SafetyGate} [options.safetyGate]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required for GovernanceEngine.');
    }
    this.dbManager = dbManager;
    this.safetyGate = options.safetyGate || new SafetyGate(dbManager);
  }

  // ==========================================================================
  // 1. Governance Summary & Lifecycle Statistics
  // ==========================================================================

  /**
   * Computes project-wide governance lifecycle statistics and metrics
   * @param {object} [options={}]
   * @returns {object}
   */
  getGovernanceSummary(options = {}) {
    const db = this.dbManager.getDatabase();

    // Source Files Distributions
    const fileStatusRows = db.prepare('SELECT status, COUNT(*) AS cnt FROM source_files GROUP BY status').all();
    const fileReviewRows = db.prepare('SELECT review_status, COUNT(*) AS cnt FROM source_files GROUP BY review_status').all();
    const fileCanonRows = db.prepare('SELECT canon_level, COUNT(*) AS cnt FROM source_files GROUP BY canon_level').all();
    const fileCategoryRows = db.prepare('SELECT source_category, COUNT(*) AS cnt FROM source_files GROUP BY source_category').all();
    const totalFilesRow = db.prepare('SELECT COUNT(*) AS total FROM source_files').get();

    // Entities Distributions
    const entityStatusRows = db.prepare('SELECT status, COUNT(*) AS cnt FROM entities GROUP BY status').all();
    const entityReviewRows = db.prepare('SELECT review_status, COUNT(*) AS cnt FROM entities GROUP BY review_status').all();
    const entityCanonRows = db.prepare('SELECT canon_level, COUNT(*) AS cnt FROM entities GROUP BY canon_level').all();
    const entityTypeRows = db.prepare('SELECT entity_type, COUNT(*) AS cnt FROM entities GROUP BY entity_type').all();
    const totalEntitiesRow = db.prepare('SELECT COUNT(*) AS total FROM entities').get();

    // Chapters & Timeline & Foreshadowing & Relations
    const chapterStats = db.prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN canon=1 THEN 1 ELSE 0 END) AS canonCount, SUM(CASE WHEN status=\'draft\' THEN 1 ELSE 0 END) AS draftCount FROM chapters').get();
    const timelineStats = db.prepare('SELECT COUNT(*) AS total FROM timeline_events').get();
    const relationStats = db.prepare('SELECT COUNT(*) AS total FROM entity_relations').get();
    const foreshadowingStats = db.prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN status=\'open\' THEN 1 ELSE 0 END) AS openCount, SUM(CASE WHEN status=\'closed\' THEN 1 ELSE 0 END) AS closedCount FROM foreshadowing').get();

    // Anomalies
    const anomalyStats = db.prepare('SELECT COUNT(*) AS total, SUM(CASE WHEN is_resolved=0 THEN 1 ELSE 0 END) AS unresolved, SUM(CASE WHEN severity=\'CRITICAL\' AND is_resolved=0 THEN 1 ELSE 0 END) AS critical FROM anomaly_reports').get();

    // Helper map builders
    const toMap = (rows, keyProp, valProp = 'cnt') => {
      const res = {};
      for (const r of rows) {
        if (r[keyProp] !== null && r[keyProp] !== undefined) {
          res[r[keyProp]] = r[valProp];
        }
      }
      return res;
    };

    const statusDist = {
      sourceFiles: toMap(fileStatusRows, 'status'),
      entities: toMap(entityStatusRows, 'status')
    };

    const reviewDist = {
      sourceFiles: toMap(fileReviewRows, 'review_status'),
      entities: toMap(entityReviewRows, 'review_status')
    };

    const buildCanonMap = (rows) => {
      const base = {
        level0_draft: 0,
        level1_candidate: 0,
        level2_canon: 0,
        level3_axiom: 0
      };
      for (const r of rows) {
        const lvl = Number(r.canon_level);
        if (lvl === 0) base.level0_draft = r.cnt;
        else if (lvl === 1) base.level1_candidate = r.cnt;
        else if (lvl === 2) base.level2_canon = r.cnt;
        else if (lvl === 3) base.level3_axiom = r.cnt;
        else base[`level${lvl}`] = r.cnt;
      }
      return base;
    };

    const canonDist = {
      sourceFiles: buildCanonMap(fileCanonRows),
      entities: buildCanonMap(entityCanonRows)
    };

    // Pending review items (pending / unreviewed / draft in active status)
    const pendingFiles = db.prepare(
      "SELECT COUNT(*) AS cnt FROM source_files WHERE review_status IN ('pending', 'unreviewed', 'draft') AND status = 'active'"
    ).get().cnt;
    const pendingEntities = db.prepare(
      "SELECT COUNT(*) AS cnt FROM entities WHERE review_status IN ('pending', 'unreviewed', 'draft') AND status = 'active'"
    ).get().cnt;

    // Promotion candidates (reviewed and active, canon_level < 2)
    const candidateFiles = db.prepare(
      "SELECT COUNT(*) AS cnt FROM source_files WHERE review_status IN ('reviewed', 'confirmed') AND canon_level < 2 AND status = 'active'"
    ).get().cnt;
    const candidateEntities = db.prepare(
      "SELECT COUNT(*) AS cnt FROM entities WHERE review_status IN ('reviewed', 'confirmed') AND canon_level < 2 AND status = 'active'"
    ).get().cnt;

    // Deprecation risk (archived items still referenced in active entity relations)
    const deprecationRiskRow = db.prepare(`
      SELECT COUNT(DISTINCT er.id) AS cnt
      FROM entity_relations er
      JOIN entities se ON er.source_entity_id = se.id
      JOIN entities te ON er.target_entity_id = te.id
      WHERE se.status = 'archived' OR te.status = 'archived'
    `).get();

    const auditSummary = this.dbManager.canonChanges.getSummary();
    const recentCanonChanges = this.dbManager.canonChanges.getRecentChanges(10);

    return {
      summary: {
        totalFiles: totalFilesRow ? totalFilesRow.total : 0,
        totalEntities: totalEntitiesRow ? totalEntitiesRow.total : 0,
        totalChapters: chapterStats ? chapterStats.total : 0,
        totalRelations: relationStats ? relationStats.total : 0,
        totalTimelineEvents: timelineStats ? timelineStats.total : 0,
        totalForeshadowing: foreshadowingStats ? foreshadowingStats.total : 0,
        statusDistribution: statusDist,
        reviewDistribution: reviewDist,
        canonLevelDistribution: canonDist,
        categoryDistribution: toMap(fileCategoryRows, 'source_category'),
        entityTypeDistribution: toMap(entityTypeRows, 'entity_type'),
        pendingReviewCount: pendingFiles + pendingEntities,
        promotionCandidatesCount: candidateFiles + candidateEntities,
        deprecationRiskCount: deprecationRiskRow ? deprecationRiskRow.cnt : 0,
        unresolvedAnomalies: anomalyStats ? (anomalyStats.unresolved || 0) : 0,
        criticalAnomalies: anomalyStats ? (anomalyStats.critical || 0) : 0
      },
      auditSummary,
      recentCanonChanges
    };
  }

  // ==========================================================================
  // 2. Review Status Management & Cascade
  // ==========================================================================

  /**
   * Updates review status of source file or entity, cascading to defined entities
   * @param {object} params
   * @param {number|string} [params.sourceFileId]
   * @param {string} [params.filePath]
   * @param {string} [params.entityId]
   * @param {string} params.reviewStatus - 'pending'|'in_review'|'reviewed'|'rejected'
   * @param {string} [params.reviewer='system']
   * @param {string} [params.notes]
   * @param {boolean} [params.cascade=true]
   * @returns {object}
   */
  setSourceReviewStatus(params = {}) {
    const rawStatus = String(params.reviewStatus || params.status || '').toLowerCase().trim();
    const normalizedStatus = rawStatus === 'confirmed' ? 'reviewed' : (rawStatus === 'unreviewed' ? 'pending' : rawStatus);
    const validStatuses = new Set(['pending', 'in_review', 'reviewed', 'rejected']);

    if (!validStatuses.has(normalizedStatus)) {
      throw new NovelError(`Invalid reviewStatus: "${rawStatus}". Must be one of: pending, in_review, reviewed, rejected.`, 'INVALID_PARAMETER');
    }

    const { target, targetType } = this._resolveTarget(params);
    const reviewer = params.reviewer || params.operator || 'system';
    const notes = params.notes || params.reason || `Review status updated to ${normalizedStatus}`;
    const shouldCascade = params.cascade !== false;

    const beforeState = {
      id: target.id,
      targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
      review_status: target.review_status,
      status: target.status,
      canon_level: target.canon_level
    };

    const affectedEntities = [];

    const mutationFn = () => {
      const db = this.dbManager.getDatabase();
      const now = new Date().toISOString();

      if (targetType === 'source_file') {
        db.prepare(
          "UPDATE source_files SET review_status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
        ).run(normalizedStatus, target.id);

        if (shouldCascade) {
          // Cascade to entities defined in this file
          const cascadeEntities = db.prepare(`
            SELECT e.id, e.entity_id, e.canonical_name, e.review_status
            FROM entities e
            WHERE e.source_file_id = ?
            UNION
            SELECT e.id, e.entity_id, e.canonical_name, e.review_status
            FROM file_entities fe
            JOIN entities e ON fe.entity_id = e.id
            WHERE fe.source_file_id = ? AND fe.mention_type IN ('definition', 'primary_subject')
          `).all(target.id, target.id);

          for (const ent of cascadeEntities) {
            db.prepare(
              "UPDATE entities SET review_status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
            ).run(normalizedStatus, ent.id);

            affectedEntities.push({
              id: ent.id,
              entityId: ent.entity_id,
              canonicalName: ent.canonical_name,
              previousReviewStatus: ent.review_status,
              newReviewStatus: normalizedStatus
            });
          }
        }
      } else {
        db.prepare(
          "UPDATE entities SET review_status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
        ).run(normalizedStatus, target.id);
      }

      return {
        targetType,
        targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
        targetDbId: target.id,
        previousReviewStatus: target.review_status,
        newReviewStatus: normalizedStatus,
        affectedEntities,
        updatedAt: now
      };
    };

    const { mutationResult, changeRecord } = this.safetyGate.executeWithAudit({
      changeType: 'UPDATE_REVIEW_STATUS',
      targetType,
      targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
      targetDbId: target.id,
      beforeState,
      operator: reviewer,
      reason: notes,
      impactSummary: { affectedEntitiesCount: affectedEntities.length },
      mutationFn
    });

    return {
      success: true,
      ...mutationResult,
      changeRecordId: changeRecord ? changeRecord.id : null
    };
  }

  // ==========================================================================
  // 3. Canon Promotion (Preview & Execute)
  // ==========================================================================

  /**
   * Preview canon promotion, checking eligibility, conflicts, and affected entities
   * @param {object} params
   * @returns {object}
   */
  promoteToCanonPreview(params = {}) {
    const { target, targetType } = this._resolveTarget(params);
    const targetCanonLevel = params.targetCanonLevel !== undefined ? Number(params.targetCanonLevel) : 2;

    const blockingErrors = [];
    const normalizedReview = (target.review_status || '').toLowerCase().trim();
    const isReviewed = normalizedReview === 'reviewed' || normalizedReview === 'confirmed';

    if (target.status === 'archived' || target.status === 'deleted') {
      blockingErrors.push(`Cannot promote ${targetType} with status "${target.status}". Must be active.`);
    }

    if (targetCanonLevel >= 2 && !isReviewed) {
      blockingErrors.push(
        `Direct silent promotion of unreviewed draft to canon (level ${targetCanonLevel}) is prohibited. Target must pass review (review_status='reviewed') before promotion. Current status is "${target.review_status}".`
      );
    }

    // Identify affected entities (if target is source_file)
    const db = this.dbManager.getDatabase();
    const affectedEntities = [];
    if (targetType === 'source_file') {
      const definedEntities = db.prepare(`
        SELECT e.id, e.entity_id, e.canonical_name, e.canon_level, e.review_status
        FROM entities e
        WHERE e.source_file_id = ?
        UNION
        SELECT e.id, e.entity_id, e.canonical_name, e.canon_level, e.review_status
        FROM file_entities fe
        JOIN entities e ON fe.entity_id = e.id
        WHERE fe.source_file_id = ? AND fe.mention_type IN ('definition', 'primary_subject')
      `).all(target.id, target.id);

      for (const ent of definedEntities) {
        affectedEntities.push({
          id: ent.id,
          entityId: ent.entity_id,
          canonicalName: ent.canonical_name,
          currentCanonLevel: ent.canon_level,
          targetCanonLevel
        });
      }
    }

    // Check potential conflicts in anomaly_reports
    const targetIdStr = targetType === 'source_file' ? target.relative_path : target.entity_id;
    const anomalies = db.prepare(`
      SELECT anomaly_rule_id, severity, title, message
      FROM anomaly_reports
      WHERE is_resolved = 0 AND (affected_file_paths_json LIKE @kw OR affected_entity_ids_json LIKE @kw)
    `).all({ kw: `%${targetIdStr}%` });

    // Check affected chapters
    const affectedChapters = db.prepare(
      'SELECT chapter_number, title FROM chapters WHERE source_file_id = ?'
    ).all(target.id).map(c => `CH-${c.chapter_number} (${c.title})`);

    return {
      previewOnly: true,
      eligible: blockingErrors.length === 0,
      target: {
        type: targetType,
        id: targetIdStr,
        dbId: target.id,
        canonicalName: target.canonical_name || target.file_name,
        currentCanonLevel: target.canon_level || 0,
        currentReviewStatus: target.review_status,
        currentStatus: target.status
      },
      targetCanonLevel,
      proposedChanges: {
        canon_level: { from: target.canon_level || 0, to: targetCanonLevel },
        review_status: { from: target.review_status, to: 'reviewed' },
        status: { from: target.status, to: 'active' }
      },
      affectedEntities,
      affectedChapters,
      potentialConflicts: anomalies,
      blockingErrors,
      requiredConfirmationToken: 'CONFIRM_CANON_CHANGE',
      instructions: 'To execute this promotion, call PromoteSourceToCanon with confirmationToken: "CONFIRM_CANON_CHANGE".'
    };
  }

  /**
   * Confirmed canon promotion guarded by SafetyGate
   * @param {object} params
   * @returns {object}
   */
  promoteToCanon(params = {}) {
    // 1. Mandatory confirmation token check
    this.safetyGate.verifyConfirmation(params, 'PromoteSourceToCanon');

    // 2. Target resolution & invariant checks
    const { target, targetType } = this._resolveTarget(params);
    const targetCanonLevel = params.targetCanonLevel !== undefined ? Number(params.targetCanonLevel) : 2;
    this.safetyGate.validatePromotionRules(target, targetType, targetCanonLevel);

    const operator = params.operator || 'system';
    const reason = params.reason || 'Official canonization after review';
    const affectedEntities = [];

    const beforeState = {
      id: target.id,
      targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
      canon_level: target.canon_level,
      review_status: target.review_status,
      status: target.status
    };

    const mutationFn = () => {
      const db = this.dbManager.getDatabase();

      if (targetType === 'source_file') {
        db.prepare(`
          UPDATE source_files
          SET canon_level = ?, review_status = 'reviewed', status = CASE WHEN status = 'draft' THEN 'active' ELSE status END, updated_at = datetime('now', 'localtime')
          WHERE id = ?
        `).run(targetCanonLevel, target.id);

        // Cascade to defined entities
        const cascadeEntities = db.prepare(`
          SELECT e.id, e.entity_id, e.canonical_name, e.canon_level, e.review_status
          FROM entities e
          WHERE e.source_file_id = ?
          UNION
          SELECT e.id, e.entity_id, e.canonical_name, e.canon_level, e.review_status
          FROM file_entities fe
          JOIN entities e ON fe.entity_id = e.id
          WHERE fe.source_file_id = ? AND fe.mention_type IN ('definition', 'primary_subject')
        `).all(target.id, target.id);

        for (const ent of cascadeEntities) {
          db.prepare(`
            UPDATE entities
            SET canon_level = ?, review_status = 'reviewed', status = CASE WHEN status = 'draft' THEN 'active' ELSE status END, updated_at = datetime('now', 'localtime')
            WHERE id = ?
          `).run(targetCanonLevel, ent.id);

          affectedEntities.push({
            id: ent.id,
            entityId: ent.entity_id,
            canonicalName: ent.canonical_name,
            canonLevel: targetCanonLevel,
            reviewStatus: 'reviewed'
          });
        }
      } else {
        db.prepare(`
          UPDATE entities
          SET canon_level = ?, review_status = 'reviewed', status = CASE WHEN status = 'draft' THEN 'active' ELSE status END, updated_at = datetime('now', 'localtime')
          WHERE id = ?
        `).run(targetCanonLevel, target.id);
      }

      return {
        targetType,
        targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
        targetDbId: target.id,
        canonLevel: targetCanonLevel,
        reviewStatus: 'reviewed',
        status: 'active',
        affectedEntities,
        operator,
        reason,
        timestamp: new Date().toISOString()
      };
    };

    const { mutationResult, changeRecord } = this.safetyGate.executeWithAudit({
      changeType: 'PROMOTE_CANON',
      targetType,
      targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
      targetDbId: target.id,
      beforeState,
      operator,
      reason,
      impactSummary: { targetCanonLevel, affectedEntitiesCount: affectedEntities.length },
      mutationFn
    });

    return {
      success: true,
      ...mutationResult,
      changeRecordId: changeRecord ? changeRecord.id : null
    };
  }

  // ==========================================================================
  // 4. Source & Entity Deprecation (Preview & Execute)
  // ==========================================================================

  /**
   * Preview deprecation blast radius and dependent links
   * @param {object} params
   * @returns {object}
   */
  deprecateSourcePreview(params = {}) {
    const { target, targetType } = this._resolveTarget(params);
    const db = this.dbManager.getDatabase();

    let danglingRelations = [];
    let affectedChapters = [];
    let affectedTimeline = [];
    let activeForeshadowing = [];

    if (targetType === 'entity') {
      danglingRelations = db.prepare(`
        SELECT er.id, er.relation_type, te.entity_id AS target_entity, te.canonical_name AS target_name
        FROM entity_relations er
        JOIN entities te ON er.target_entity_id = te.id
        WHERE er.source_entity_id = ?
        UNION
        SELECT er.id, er.relation_type, se.entity_id AS target_entity, se.canonical_name AS target_name
        FROM entity_relations er
        JOIN entities se ON er.source_entity_id = se.id
        WHERE er.target_entity_id = ?
      `).all(target.id, target.id);

      affectedChapters = db.prepare(
        'SELECT chapter_number, title FROM chapters WHERE pov_entity_id = ?'
      ).all(target.id);

      affectedTimeline = db.prepare(
        'SELECT event_id, title FROM timeline_events WHERE primary_entity_id = ?'
      ).all(target.id);
    } else {
      affectedChapters = db.prepare(
        'SELECT chapter_number, title FROM chapters WHERE source_file_id = ?'
      ).all(target.id);

      activeForeshadowing = db.prepare(
        'SELECT foreshadow_id, title FROM foreshadowing WHERE setup_file_id = ? AND status = \'open\''
      ).all(target.id);
    }

    const totalDependents = danglingRelations.length + affectedChapters.length + affectedTimeline.length + activeForeshadowing.length;
    const riskRating = totalDependents > 5 ? 'CRITICAL' : (totalDependents > 2 ? 'HIGH' : (totalDependents > 0 ? 'MEDIUM' : 'LOW'));

    return {
      previewOnly: true,
      target: {
        type: targetType,
        id: targetType === 'source_file' ? target.relative_path : target.entity_id,
        dbId: target.id,
        currentStatus: target.status,
        currentCanonLevel: target.canon_level || 0
      },
      downstreamImpact: {
        danglingRelations,
        affectedChapters,
        affectedTimelineEvents: affectedTimeline,
        activeForeshadowing,
        totalDependentCount: totalDependents,
        riskRating
      },
      replacementEntityId: params.replacementEntityId || null,
      requiredConfirmationToken: 'CONFIRM_CANON_CHANGE',
      instructions: 'To execute deprecation, call DeprecateSource with confirmationToken: "CONFIRM_CANON_CHANGE".'
    };
  }

  /**
   * Confirmed deprecation setting status='archived' and canon_level=0
   * @param {object} params
   * @returns {object}
   */
  deprecateSource(params = {}) {
    // 1. Mandatory confirmation token check
    this.safetyGate.verifyConfirmation(params, 'DeprecateSource');

    // 2. Target resolution & invariant checks
    const { target, targetType } = this._resolveTarget(params);
    this.safetyGate.validateDeprecationRules(target, targetType);

    const operator = params.operator || 'system';
    const reason = params.reason || 'Source deprecation';
    const replacementEntityId = params.replacementEntityId || null;
    const affectedEntities = [];

    const beforeState = {
      id: target.id,
      targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
      status: target.status,
      canon_level: target.canon_level,
      review_status: target.review_status
    };

    const mutationFn = () => {
      const db = this.dbManager.getDatabase();

      if (targetType === 'source_file') {
        db.prepare(
          "UPDATE source_files SET status = 'archived', canon_level = 0, updated_at = datetime('now', 'localtime') WHERE id = ?"
        ).run(target.id);

        // Cascade to defined entities
        const cascadeEntities = db.prepare(`
          SELECT e.id, e.entity_id, e.canonical_name
          FROM entities e
          WHERE e.source_file_id = ?
          UNION
          SELECT e.id, e.entity_id, e.canonical_name
          FROM file_entities fe
          JOIN entities e ON fe.entity_id = e.id
          WHERE fe.source_file_id = ? AND fe.mention_type IN ('definition', 'primary_subject')
        `).all(target.id, target.id);

        for (const ent of cascadeEntities) {
          db.prepare(
            "UPDATE entities SET status = 'archived', canon_level = 0, updated_at = datetime('now', 'localtime') WHERE id = ?"
          ).run(ent.id);

          affectedEntities.push({
            id: ent.id,
            entityId: ent.entity_id,
            canonicalName: ent.canonical_name,
            status: 'archived',
            canonLevel: 0
          });
        }
      } else {
        db.prepare(
          "UPDATE entities SET status = 'archived', canon_level = 0, updated_at = datetime('now', 'localtime') WHERE id = ?"
        ).run(target.id);
      }

      return {
        targetType,
        targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
        targetDbId: target.id,
        status: 'archived',
        canonLevel: 0,
        affectedEntities,
        replacementEntityId,
        operator,
        reason,
        timestamp: new Date().toISOString()
      };
    };

    const { mutationResult, changeRecord } = this.safetyGate.executeWithAudit({
      changeType: 'DEPRECATE_SOURCE',
      targetType,
      targetId: targetType === 'source_file' ? target.relative_path : target.entity_id,
      targetDbId: target.id,
      beforeState,
      operator,
      reason,
      impactSummary: { replacementEntityId, affectedEntitiesCount: affectedEntities.length },
      mutationFn
    });

    return {
      success: true,
      ...mutationResult,
      changeRecordId: changeRecord ? changeRecord.id : null
    };
  }

  // ==========================================================================
  // Helper Target Resolver
  // ==========================================================================

  /**
   * Resolves target record from polymorphic parameters
   * @private
   * @param {object} params
   * @returns {{ target: object, targetType: 'source_file'|'entity' }}
   */
  _resolveTarget(params = {}) {
    // 1. Check if source file is targeted
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
      if (file) {
        return { target: file, targetType: 'source_file' };
      }
    }

    // 2. Check if entity is targeted
    const hasEntityParam = params.entityId ||
      params.entity_id ||
      params.entityDbId !== undefined ||
      params.entity_db_id !== undefined;

    if (hasEntityParam) {
      const entityRef = params.entityId || params.entity_id || params.entityDbId || params.entity_db_id;
      const entity = (typeof entityRef === 'number' || /^\d+$/.test(String(entityRef)))
        ? (this.dbManager.entities.getById(Number(entityRef)) || this.dbManager.entities.getSingleByEntityId(String(entityRef)))
        : this.dbManager.entities.getSingleByEntityId(String(entityRef));

      if (entity) {
        return { target: entity, targetType: 'entity' };
      }
    }

    // 3. Fallback polymorphic targetId / targetType
    if (params.targetId || params.target_id) {
      const tId = params.targetId || params.target_id;
      const tType = String(params.targetType || params.target_type || '').toLowerCase();

      if (tType === 'entity' || tType === 'entities') {
        const ent = this.dbManager.entities.getSingleByEntityId(String(tId)) || this.dbManager.entities.getById(Number(tId));
        if (ent) return { target: ent, targetType: 'entity' };
      }

      if (tType === 'source_file' || tType === 'file') {
        const file = this.dbManager.sourceFiles.findByPathOrId(tId);
        if (file) return { target: file, targetType: 'source_file' };
      }

      const file = this.dbManager.sourceFiles.findByPathOrId(tId);
      if (file) return { target: file, targetType: 'source_file' };

      const ent = this.dbManager.entities.getSingleByEntityId(String(tId)) || this.dbManager.entities.getById(Number(tId));
      if (ent) return { target: ent, targetType: 'entity' };
    }

    throw new NovelError('Target source file or entity could not be resolved from input parameters.', 'TARGET_NOT_FOUND', { params });
  }
}

module.exports = GovernanceEngine;
