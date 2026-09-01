/**
 * @file GovernanceCommands.js
 * @description Handlers for Content Lifecycle & Canon Governance Commands (Phase 3 Milestone 2)
 * @module commands/GovernanceCommands
 * @license MIT
 */

'use strict';

const GovernanceEngine = require('../governance/GovernanceEngine');

class GovernanceCommands {
  /**
   * Command 1: GetGovernanceSummary
   * Aggregates project-wide governance lifecycle statistics, distributions, and review/risk counts.
   * @param {object} params - Input parameters
   * @param {object} context - Execution context { dbManager, pathGuard, config, basePath }
   * @returns {Promise<object>}
   */
  static async handleGetGovernanceSummary(params, context) {
    const { dbManager } = context;
    const engine = new GovernanceEngine(dbManager);
    const result = engine.getGovernanceSummary(params);

    const s = result.summary;
    const fileCanon = s.canonLevelDistribution.sourceFiles;
    const entityCanon = s.canonLevelDistribution.entities;

    const markdown = [
      '### [NovelEngineering] Governance Lifecycle Summary',
      `- **Total Source Files**: ${s.totalFiles}`,
      `- **Total Lore Entities**: ${s.totalEntities}`,
      `- **Total Chapters**: ${s.totalChapters}`,
      `- **Total Entity Relations**: ${s.totalRelations}`,
      `- **Total Timeline Events**: ${s.totalTimelineEvents}`,
      `- **Total Foreshadowing Clues**: ${s.totalForeshadowing}`,
      '',
      '#### Lifecycle & Review Pipeline',
      `- **Pending Review**: ${s.pendingReviewCount} items (files/entities awaiting confirmation)`,
      `- **Canon Promotion Candidates**: ${s.promotionCandidatesCount} items (reviewed, eligible for canon)`,
      `- **Deprecation Risks**: ${s.deprecationRiskCount} relations referencing archived entities`,
      `- **Unresolved Anomalies**: ${s.unresolvedAnomalies} (${s.criticalAnomalies} CRITICAL)`,
      '',
      '#### Canon Level Distribution',
      `- **Level 0 (Draft / Non-Canon)**: ${fileCanon.level0_draft} files, ${entityCanon.level0_draft} entities`,
      `- **Level 1 (Candidate / Secondary)**: ${fileCanon.level1_candidate} files, ${entityCanon.level1_candidate} entities`,
      `- **Level 2 (Authoritative Canon)**: ${fileCanon.level2_canon} files, ${entityCanon.level2_canon} entities`,
      `- **Level 3 (Axiom / Core Lore)**: ${fileCanon.level3_axiom || 0} files, ${entityCanon.level3_axiom || 0} entities`,
      '',
      '#### Audit Log Status',
      `- **Total Recorded Canon Changes**: ${result.auditSummary.totalChanges}`,
      `- **Last Change Timestamp**: ${result.auditSummary.lastChangeAt || 'None'}`
    ].join('\n');

    return {
      status: 'success',
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 2: SetSourceReviewStatus
   * Updates the review status of a source file or entity, automatically cascading to defined entities.
   * @param {object} params
   * @param {number|string} [params.sourceFileId] - Target source file ID
   * @param {string} [params.filePath] - Target source file path (relative or absolute)
   * @param {string} [params.entityId] - Target entity business ID (e.g. "PL-001")
   * @param {string} params.reviewStatus - 'pending'|'in_review'|'reviewed'|'rejected'
   * @param {string} [params.reviewer='system'] - Reviewer identifier
   * @param {string} [params.notes] - Editorial notes / reason
   * @param {boolean} [params.cascade=true] - Whether to cascade to defined entities
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleSetSourceReviewStatus(params, context) {
    const { dbManager } = context;
    const engine = new GovernanceEngine(dbManager);
    const result = engine.setSourceReviewStatus(params);

    const cascadedList = result.affectedEntities && result.affectedEntities.length > 0
      ? `\n- **Cascaded Entities (${result.affectedEntities.length})**: ${result.affectedEntities.map(e => `\`${e.entityId}\``).join(', ')}`
      : '';

    const markdown = [
      '### [NovelEngineering] Review Status Updated',
      `- **Target**: \`${result.targetId}\` (${result.targetType})`,
      `- **Previous Review Status**: \`${result.previousReviewStatus}\``,
      `- **New Review Status**: \`${result.newReviewStatus}\``,
      `- **Operator / Reviewer**: \`${params.reviewer || params.operator || 'system'}\``,
      cascadedList,
      `- **Audit Log ID**: \`#${result.changeRecordId}\``
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 3: PromoteSourceToCanonPreview
   * Previews promotion to canon, verifying prerequisites, anti-silent-promotion gates, and anomaly conflicts.
   * @param {object} params
   * @param {number|string} [params.sourceFileId] - Target source file ID
   * @param {string} [params.filePath] - Target source file path
   * @param {string} [params.entityId] - Target entity business ID
   * @param {number} [params.targetCanonLevel=2] - Target canon level (1, 2, 3)
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handlePromoteSourceToCanonPreview(params, context) {
    const { dbManager } = context;
    const engine = new GovernanceEngine(dbManager);
    const result = engine.promoteToCanonPreview(params);

    const blockerSection = result.blockingErrors && result.blockingErrors.length > 0
      ? `\n> ⚠️ **Promotion Blocked**:\n${result.blockingErrors.map(e => `> - ${e}`).join('\n')}`
      : '';

    const conflictSection = result.potentialConflicts && result.potentialConflicts.length > 0
      ? `\n- **Potential Anomaly Conflicts (${result.potentialConflicts.length})**:\n${result.potentialConflicts.map(c => `  - [${c.severity}] ${c.title}: ${c.message}`).join('\n')}`
      : '- **Potential Anomaly Conflicts**: None detected';

    const entitySection = result.affectedEntities && result.affectedEntities.length > 0
      ? `- **Cascaded Lore Entities**: ${result.affectedEntities.map(e => `\`${e.entityId}\` (${e.canonicalName})`).join(', ')}`
      : '';

    const chapterSection = result.affectedChapters && result.affectedChapters.length > 0
      ? `- **Affected Chapters**: ${result.affectedChapters.join(', ')}`
      : '';

    const markdown = [
      '### [NovelEngineering] Promote to Canon Preview (Dry Run)',
      `- **Target**: \`${result.target.id}\` (${result.target.type})`,
      `- **Eligibility**: ${result.eligible ? '✅ **ELIGIBLE FOR CANON**' : '❌ **PROMOTION BLOCKED**'}`,
      `- **Current Canon Level**: \`${result.target.currentCanonLevel}\` ➔ **Target Canon Level**: \`${result.targetCanonLevel}\``,
      `- **Current Review Status**: \`${result.target.currentReviewStatus}\``,
      `- **Current Status**: \`${result.target.currentStatus}\``,
      blockerSection,
      entitySection,
      chapterSection,
      conflictSection,
      '',
      '*To execute this promotion, call `PromoteSourceToCanon` with `confirmationToken: "CONFIRM_CANON_CHANGE"`.*'
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 4: PromoteSourceToCanon
   * Confirmed promotion to canon status, enforcing SafetyGate and logging to canon_changes.
   * @param {object} params
   * @param {number|string} [params.sourceFileId]
   * @param {string} [params.filePath]
   * @param {string} [params.entityId]
   * @param {number} [params.targetCanonLevel=2]
   * @param {string} params.confirmationToken - Must be 'CONFIRM_CANON_CHANGE'
   * @param {string} [params.operator='system']
   * @param {string} [params.reason]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handlePromoteSourceToCanon(params, context) {
    const { dbManager } = context;
    const engine = new GovernanceEngine(dbManager);
    const result = engine.promoteToCanon(params);

    const cascadedList = result.affectedEntities && result.affectedEntities.length > 0
      ? `\n- **Cascaded Entities (${result.affectedEntities.length})**: ${result.affectedEntities.map(e => `\`${e.entityId}\` (Level ${e.canonLevel})`).join(', ')}`
      : '';

    const markdown = [
      '### [NovelEngineering] Canon Promotion Confirmed',
      `- **Target**: \`${result.targetId}\` (${result.targetType})`,
      `- **Canon Level**: \`${result.canonLevel}\``,
      `- **Review Status**: \`${result.reviewStatus}\``,
      `- **Status**: \`${result.status}\``,
      `- **Operator**: \`${result.operator}\``,
      `- **Reason**: ${result.reason || 'Official canonization'}`,
      cascadedList,
      `- **Audit Log ID**: \`#${result.changeRecordId}\``,
      `- **Timestamp**: \`${result.timestamp}\``
    ].filter(Boolean).join('\n');

    return {
      ...result,
      status: 'success',
      targetStatus: result.status,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 5: DeprecateSourcePreview
   * Previews source/entity deprecation, computing blast radius across entity relations, chapters, timeline, and foreshadowing.
   * @param {object} params
   * @param {number|string} [params.sourceFileId]
   * @param {string} [params.filePath]
   * @param {string} [params.entityId]
   * @param {string} [params.reason]
   * @param {string} [params.replacementEntityId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleDeprecateSourcePreview(params, context) {
    const { dbManager } = context;
    const engine = new GovernanceEngine(dbManager);
    const result = engine.deprecateSourcePreview(params);
    const imp = result.downstreamImpact;

    const relationSection = imp.danglingRelations && imp.danglingRelations.length > 0
      ? `\n- **Dangling Entity Relations (${imp.danglingRelations.length})**:\n${imp.danglingRelations.map(r => `  - \`${r.relation_type}\` ➔ \`${r.target_entity}\` (${r.target_name})`).join('\n')}`
      : '- **Dangling Entity Relations**: None';

    const chapterSection = imp.affectedChapters && imp.affectedChapters.length > 0
      ? `\n- **Affected Chapters (${imp.affectedChapters.length})**: ${imp.affectedChapters.map(c => `CH-${c.chapter_number} (${c.title})`).join(', ')}`
      : '';

    const timelineSection = imp.affectedTimelineEvents && imp.affectedTimelineEvents.length > 0
      ? `\n- **Affected Timeline Events (${imp.affectedTimelineEvents.length})**: ${imp.affectedTimelineEvents.map(t => `\`${t.event_id}\` (${t.title})`).join(', ')}`
      : '';

    const foreshadowSection = imp.activeForeshadowing && imp.activeForeshadowing.length > 0
      ? `\n- **Active Foreshadowing Clues (${imp.activeForeshadowing.length})**: ${imp.activeForeshadowing.map(f => `\`${f.foreshadow_id}\` (${f.title})`).join(', ')}`
      : '';

    const markdown = [
      '### [NovelEngineering] Deprecate Source Preview (Blast Radius)',
      `- **Target**: \`${result.target.id}\` (${result.target.type})`,
      `- **Risk Rating**: **${imp.riskRating}** (${imp.totalDependentCount} total downstream dependents)`,
      `- **Current Status**: \`${result.target.currentStatus}\``,
      `- **Current Canon Level**: \`${result.target.currentCanonLevel}\``,
      result.replacementEntityId ? `- **Replacement Target**: \`${result.replacementEntityId}\`` : '',
      relationSection,
      chapterSection,
      timelineSection,
      foreshadowSection,
      '',
      '*To confirm deprecation, call `DeprecateSource` with `confirmationToken: "CONFIRM_CANON_CHANGE"`.*'
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 6: DeprecateSource
   * Confirmed deprecation setting status='archived' and canon_level=0, cascading to defined entities.
   * @param {object} params
   * @param {number|string} [params.sourceFileId]
   * @param {string} [params.filePath]
   * @param {string} [params.entityId]
   * @param {string} params.confirmationToken - Must be 'CONFIRM_CANON_CHANGE'
   * @param {string} [params.reason]
   * @param {string} [params.replacementEntityId]
   * @param {string} [params.operator='system']
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleDeprecateSource(params, context) {
    const { dbManager } = context;
    const engine = new GovernanceEngine(dbManager);
    const result = engine.deprecateSource(params);

    const cascadedList = result.affectedEntities && result.affectedEntities.length > 0
      ? `\n- **Cascaded Entities (${result.affectedEntities.length})**: ${result.affectedEntities.map(e => `\`${e.entityId}\` (status: archived, canon: 0)`).join(', ')}`
      : '';

    const markdown = [
      '### [NovelEngineering] Source Deprecation Confirmed',
      `- **Target**: \`${result.targetId}\` (${result.targetType})`,
      `- **New Status**: \`${result.status}\``,
      `- **New Canon Level**: \`${result.canonLevel}\``,
      result.replacementEntityId ? `- **Replacement Target**: \`${result.replacementEntityId}\`` : '',
      `- **Operator**: \`${result.operator}\``,
      `- **Reason**: ${result.reason || 'Source deprecated by user'}`,
      cascadedList,
      `- **Audit Log ID**: \`#${result.changeRecordId}\``,
      `- **Timestamp**: \`${result.timestamp}\``
    ].filter(Boolean).join('\n');

    return {
      ...result,
      status: 'success',
      targetStatus: result.status,
      content: markdown,
      details: result
    };
  }
}

module.exports = GovernanceCommands;
