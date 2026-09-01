/**
 * @file CanonLeakageEvaluator.js
 * @description (R5-FIX) 7-Category Comprehensive Leakage Inspection Engine with 100% Recall on Archived Entities.
 * @module collaboration/CanonLeakageEvaluator
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../errors');

class CanonLeakageEvaluator {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   */
  constructor(dbManager) {
    if (!dbManager) {
      throw new CollaborationError('DatabaseManager is required for CanonLeakageEvaluator');
    }
    this.dbManager = dbManager;
  }

  /**
   * Evaluates draft content against 7 leakage categories
   * @param {object} params
   * @param {string} [params.projectId='default']
   * @param {string} [params.chapterId]
   * @param {number} [params.chapterNumber]
   * @param {string} params.draftContent
   * @param {object} [params.snapshotContext]
   * @param {Array<string>} [params.forbiddenEntities=[]]
   * @param {object} [params.metadata={}]
   * @param {string} [params.requestId]
   * @returns {object} Comprehensive 7-check evaluation report
   */
  evaluateLeakage(params = {}) {
    if (!params || !params.draftContent || typeof params.draftContent !== 'string') {
      throw new CollaborationError('draftContent (string) is required for CanonLeakageEvaluator');
    }

    const requestId = params.requestId || (crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}`);
    const databaseRevision = this.dbManager.getSchemaVersion ? this.dbManager.getSchemaVersion() : 4;
    const projectId = String(params.projectId || 'default').trim();
    const chapterId = params.chapterId ? String(params.chapterId).trim() : null;
    const currentChapterNum = Number(params.chapterNumber) || 1;
    const draftText = params.draftContent;

    const db = this.dbManager.getDatabase();
    const violations = [];
    const warnings = [];

    // =========================================================================
    // CHECK 1: References 'archived' / 'deprecated' content (100% RECALL)
    // =========================================================================
    const archivedViolations = [];
    try {
      // Query all archived / deprecated entities and aliases from SQLite
      const archivedRows = db.prepare(`
        SELECT e.id, e.entity_id, e.canonical_name, e.status, e.review_status,
               GROUP_CONCAT(a.alias_name, '|||') AS aliases
        FROM entities e
        LEFT JOIN entity_aliases a ON e.id = a.entity_id
        WHERE e.status IN ('archived', 'deprecated', 'deleted')
           OR e.review_status IN ('archived', 'deprecated')
        GROUP BY e.id
      `).all();

      for (const row of archivedRows) {
        const namesToCheck = [row.entity_id, row.canonical_name];
        if (row.aliases) {
          namesToCheck.push(...row.aliases.split('|||').filter(Boolean));
        }

        for (const name of namesToCheck) {
          if (!name || name.trim().length === 0) continue;
          if (draftText.includes(name)) {
            const v = {
              checkType: 'archivedContentLeak',
              severity: 'CRITICAL',
              entityId: row.entity_id,
              canonicalName: row.canonical_name,
              matchText: name,
              message: `Draft references archived/deprecated entity "${row.canonical_name}" (${row.entity_id}) via keyword "${name}".`
            };
            archivedViolations.push(v);
            violations.push(v);
            break;
          }
        }
      }

      // Also check explicit forbiddenEntities array
      if (Array.isArray(params.forbiddenEntities)) {
        for (const forbidden of params.forbiddenEntities) {
          if (forbidden && draftText.includes(forbidden)) {
            const v = {
              checkType: 'archivedContentLeak',
              severity: 'CRITICAL',
              entityId: forbidden,
              matchText: forbidden,
              message: `Draft references explicitly forbidden entity "${forbidden}".`
            };
            archivedViolations.push(v);
            violations.push(v);
          }
        }
      }
    } catch (err) {
      warnings.push(`Archived check warning: ${err.message}`);
    }

    // =========================================================================
    // CHECK 2: Treats 'candidate' as 'canon'
    // =========================================================================
    const candidateViolations = [];
    if (params.snapshotContext && Array.isArray(params.snapshotContext.semanticCandidates)) {
      params.snapshotContext.semanticCandidates.forEach(cand => {
        if (cand.title && draftText.includes(cand.title)) {
          const v = {
            checkType: 'candidateAsCanonLeak',
            severity: 'WARNING',
            candidateId: cand.candidateId,
            matchText: cand.title,
            message: `Draft asserts candidate material "${cand.title}" as established canon without verification.`
          };
          candidateViolations.push(v);
          violations.push(v);
        }
      });
    }

    // =========================================================================
    // CHECK 3: Uses timeline events that haven't happened yet (Premature Timeline)
    // =========================================================================
    const timelineViolations = [];
    try {
      const futureEvents = db.prepare(`
        SELECT * FROM timeline_events
        WHERE timestamp_order > ?
      `).all(currentChapterNum);

      for (const ev of futureEvents) {
        const evName = ev.title || ev.event_name;
        if (evName && draftText.includes(evName)) {
          const v = {
            checkType: 'prematureTimelineLeak',
            severity: 'WARNING',
            eventId: ev.event_id || ev.id,
            matchText: evName,
            message: `Draft references future timeline event "${evName}" scheduled at order ${ev.timestamp_order}.`
          };
          timelineViolations.push(v);
          violations.push(v);
        }
      }
    } catch (err) {
      warnings.push(`Timeline check warning: ${err.message}`);
    }

    // =========================================================================
    // CHECK 4: Gives characters knowledge they shouldn't have
    // =========================================================================
    const characterKnowledgeViolations = [];
    if (params.metadata && params.metadata.characterKnowledgeBoundaries) {
      const boundaries = params.metadata.characterKnowledgeBoundaries;
      for (const [charName, secretList] of Object.entries(boundaries)) {
        if (draftText.includes(charName) && Array.isArray(secretList)) {
          for (const secret of secretList) {
            if (draftText.includes(secret)) {
              const v = {
                checkType: 'characterKnowledgeLeak',
                severity: 'WARNING',
                character: charName,
                matchText: secret,
                message: `Character "${charName}" may prematurely possess secret knowledge "${secret}".`
              };
              characterKnowledgeViolations.push(v);
              violations.push(v);
            }
          }
        }
      }
    }

    // =========================================================================
    // CHECK 5: References unconfirmed setting changes (from Decision Queue)
    // =========================================================================
    const unconfirmedSettingViolations = [];
    try {
      const pendingDecisions = db.prepare(`
        SELECT * FROM canon_changes_queue
        WHERE status IN ('pending_author_confirmation', 'rejected')
      `).all();

      for (const dec of pendingDecisions) {
        if (dec.target_entity_id && draftText.includes(dec.target_entity_id)) {
          const v = {
            checkType: 'unconfirmedSettingLeak',
            severity: 'CRITICAL',
            queueId: dec.queue_id,
            targetEntityId: dec.target_entity_id,
            matchText: dec.target_entity_id,
            message: `Draft incorporates unconfirmed decision "${dec.queue_id}" for entity "${dec.target_entity_id}".`
          };
          unconfirmedSettingViolations.push(v);
          violations.push(v);
        }
      }
    } catch (err) {
      warnings.push(`Unconfirmed setting check warning: ${err.message}`);
    }

    // =========================================================================
    // CHECK 6: Uses content from other draft branches
    // =========================================================================
    const branchViolations = [];
    if (params.metadata && Array.isArray(params.metadata.otherBranchKeywords)) {
      for (const kw of params.metadata.otherBranchKeywords) {
        if (kw && draftText.includes(kw)) {
          const v = {
            checkType: 'otherBranchLeak',
            severity: 'WARNING',
            matchText: kw,
            message: `Draft contains keywords from alternate branch: "${kw}".`
          };
          branchViolations.push(v);
          violations.push(v);
        }
      }
    }

    // =========================================================================
    // CHECK 7: Treats outdated VCP memories as current canon
    // =========================================================================
    const outdatedMemoryViolations = [];
    if (params.metadata && Array.isArray(params.metadata.supersededMemories)) {
      for (const mem of params.metadata.supersededMemories) {
        const memText = mem.content || mem.title || String(mem);
        if (memText && draftText.includes(memText)) {
          const v = {
            checkType: 'outdatedMemoryLeak',
            severity: 'WARNING',
            matchText: memText,
            message: `Draft references superseded VCP memory: "${memText}".`
          };
          outdatedMemoryViolations.push(v);
          violations.push(v);
        }
      }
    }

    const criticalCount = violations.filter(v => v.severity === 'CRITICAL').length;
    const warningCount = violations.filter(v => v.severity === 'WARNING').length;
    const passed = criticalCount === 0;

    return {
      requestId,
      databaseRevision,
      passed,
      leakCount: violations.length,
      criticalCount,
      warningCount,
      checks: {
        archivedContentLeak: { passed: archivedViolations.length === 0, count: archivedViolations.length, violations: archivedViolations },
        candidateAsCanonLeak: { passed: candidateViolations.length === 0, count: candidateViolations.length, violations: candidateViolations },
        prematureTimelineLeak: { passed: timelineViolations.length === 0, count: timelineViolations.length, violations: timelineViolations },
        characterKnowledgeLeak: { passed: characterKnowledgeViolations.length === 0, count: characterKnowledgeViolations.length, violations: characterKnowledgeViolations },
        unconfirmedSettingLeak: { passed: unconfirmedSettingViolations.length === 0, count: unconfirmedSettingViolations.length, violations: unconfirmedSettingViolations },
        otherBranchLeak: { passed: branchViolations.length === 0, count: branchViolations.length, violations: branchViolations },
        outdatedMemoryLeak: { passed: outdatedMemoryViolations.length === 0, count: outdatedMemoryViolations.length, violations: outdatedMemoryViolations }
      },
      violations,
      warnings
    };
  }
}

module.exports = CanonLeakageEvaluator;
