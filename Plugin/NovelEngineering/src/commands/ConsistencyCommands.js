/**
 * @file ConsistencyCommands.js
 * @description Handlers for Consistency Engine & Change Impact Analysis Commands (Phase 3 Milestone 3)
 * @module commands/ConsistencyCommands
 * @license MIT
 */

'use strict';

const ConsistencyEngine = require('../consistency/ConsistencyEngine');
const ImpactAnalyzer = require('../consistency/ImpactAnalyzer');

class ConsistencyCommands {
  /**
   * Command: CheckConsistency
   * Validates multi-dimensional worldbuilding consistency (contradictions, paradoxes, dangling references)
   * @param {object} params
   * @param {string} [params.scope='all'] - 'all'|'timeline'|'foreshadowing'|'entities'|'relations'
   * @param {string} [params.severityThreshold='INFO'] - 'INFO'|'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'
   * @param {boolean} [params.persistToReports=true] - Whether to persist detected anomalies into anomaly_reports
   * @param {Array<string|number>|string} [params.entityIds] - Optional entity ID filter
   * @param {string} [params.category] - Optional category filter
   * @param {string} [params.scanSessionId] - Optional scan session ID
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleCheckConsistency(params, context) {
    const { dbManager } = context;
    const engine = new ConsistencyEngine(dbManager);
    const result = engine.checkConsistency(params);

    const counts = result.severityCounts || { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const markdown = [
      '### [NovelEngineering] Worldbuilding Consistency Report',
      `- **Scope**: \`${result.scope}\``,
      `- **Severity Threshold**: \`${result.severityThreshold}\``,
      `- **Total Issues Detected**: **${result.totalIssues}**`,
      `- **Breakdown**: 🔴 ${counts.CRITICAL} Critical | 🟠 ${counts.HIGH} High | 🟡 ${counts.MEDIUM} Medium | ⚪ ${counts.LOW} Low | ℹ️ ${counts.INFO} Info`,
      '',
      result.anomalies && result.anomalies.length > 0
        ? '#### Detected Inconsistencies'
        : '✅ *All worldbuilding consistency checks passed with zero issues!*',
      ...(result.anomalies || []).slice(0, 15).map(a => `- **[${a.severity || 'MEDIUM'}] ${a.title || a.rule_name || a.anomaly_rule_id}**: ${a.message}`),
      result.anomalies && result.anomalies.length > 15 ? `*...and ${result.anomalies.length - 15} more issues.*` : ''
    ].filter(Boolean).join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }

  /**
   * Command: AnalyzeChangeImpact
   * Evaluates blast radius and dependent links prior to entity or file mutations
   * @param {object} params
   * @param {string|number} [params.entityId]
   * @param {number} [params.entityDbId]
   * @param {string|number} [params.sourceFileId]
   * @param {string} [params.filePath]
   * @param {string} [params.relativePath]
   * @param {string|number} [params.targetId]
   * @param {string} [params.targetType]
   * @param {string} [params.changeType='MODIFY'] - 'MODIFY'|'DEPRECATE'|'RENAME'|'RELOCATE'|'PROMOTE'
   * @param {object} [params.proposedChanges]
   * @param {number} [params.maxDepth=2]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleAnalyzeChangeImpact(params, context) {
    const { dbManager } = context;
    const analyzer = new ImpactAnalyzer(dbManager);
    const result = analyzer.analyzeChangeImpact(params);

    const ratingEmoji = {
      CRITICAL: '🔴',
      HIGH: '🟠',
      MEDIUM: '🟡',
      LOW: '🟢'
    }[result.impactRating] || '⚪';

    const relationsList = result.directRelations && result.directRelations.length > 0
      ? `\n- **Direct Relations (${result.directRelations.length})**: ${result.directRelations.map(r => `\`${r.relationType}\` ➔ \`${r.partnerEntityId}\` (${r.partnerName})`).join(', ')}`
      : '';

    const chaptersList = result.affectedChapters && result.affectedChapters.length > 0
      ? `\n- **Affected Chapters (${result.affectedChapters.length})**: ${result.affectedChapters.map(c => `CH-${c.chapterNumber} ("${c.title}")`).join(', ')}`
      : '';

    const timelineList = result.affectedTimelineEvents && result.affectedTimelineEvents.length > 0
      ? `\n- **Affected Timeline Events (${result.affectedTimelineEvents.length})**: ${result.affectedTimelineEvents.map(t => `\`${t.eventId}\` ("${t.title}")`).join(', ')}`
      : '';

    const foreshadowingList = result.activeForeshadowing && result.activeForeshadowing.length > 0
      ? `\n- **Active Foreshadowing Threads (${result.activeForeshadowing.length})**: ${result.activeForeshadowing.map(f => `\`${f.foreshadowId}\` ("${f.title}")`).join(', ')}`
      : '';

    const recommendationsList = result.recommendations && result.recommendations.length > 0
      ? `\n#### Actionable Recommendations\n${result.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}`
      : '';

    const markdown = [
      '### [NovelEngineering] Change Impact & Blast Radius Analysis',
      `- **Target**: \`${result.target.id}\` (${result.target.type} - "${result.target.canonicalName}")`,
      `- **Change Type**: \`${result.changeType}\``,
      `- **Impact Rating**: ${ratingEmoji} **${result.impactRating}** (Blast Radius Score: **${result.blastRadiusScore}**)`,
      `- **Current Lore Canon Level**: Level \`${result.target.currentCanonLevel}\``,
      relationsList,
      chaptersList,
      timelineList,
      foreshadowingList,
      recommendationsList
    ].filter(Boolean).join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }

  /**
   * Command: EvaluateDebtHealth
   * Evaluates story narrative debt health, overdue anomalies, payoff drought, and hook monotony
   * @param {object} params
   * @param {string} [params.projectId]
   * @param {number} [params.currentChapter]
   * @param {object} [params.options]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleEvaluateDebtHealth(params = {}, context = {}) {
    const { dbManager } = context;
    if (!dbManager) {
      throw new Error('DatabaseManager is required for EvaluateDebtHealth');
    }

    const engine = new ConsistencyEngine(dbManager);
    const result = engine.evaluateDebtHealth(params);

    const gradeEmoji = {
      A: '🟢',
      B: '🔵',
      C: '🟡',
      D: '🟠',
      F: '🔴'
    }[result.healthGrade] || '⚪';

    const metrics = result.metrics || {};
    const warnings = result.warnings || [];
    const recommendations = result.recommendations || [];

    const typeDistStr = Object.entries(metrics.typeDistribution || {})
      .map(([t, count]) => `\`${t}\`: ${count}`)
      .join(', ') || 'None';

    const markdown = [
      '### [NovelEngineering] Narrative Debt Health Diagnostic Report',
      `- **Health Grade**: ${gradeEmoji} **Grade ${result.healthGrade}** (Health Score: **${result.healthScore}/100**)`,
      `- **Active Debts**: **${metrics.totalActiveDebts}** (Overdue: **${metrics.totalOverdueDebts}**, Ratio: **${(metrics.overdueRatio * 100).toFixed(1)}%**)`,
      `- **Chapters Since Last Payoff**: **${metrics.chaptersSinceLastPayoff}** (Payoff Drought: **${metrics.isPayoffDrought ? '⚠️ YES' : '✅ NO'}**)`,
      `- **Hook Monotony Score**: **${(metrics.hookMonotonyScore * 100).toFixed(1)}%**`,
      `- **Hook Type Distribution**: ${typeDistStr}`,
      '',
      warnings.length > 0
        ? '#### Narrative Health Warnings\n' + warnings.map(w => `- ⚠️ **[${w.severity}] ${w.code}**: ${w.message}`).join('\n')
        : '✅ *Zero narrative debt anomalies detected! Plot progression is balanced and engaging.*',
      '',
      recommendations.length > 0
        ? '#### Actionable Recommendations\n' + recommendations.map(r => `- 💡 ${r}`).join('\n')
        : ''
    ].filter(Boolean).join('\n');

    return {
      success: true,
      status: 'success',
      command: 'EvaluateDebtHealth',
      healthGrade: result.healthGrade,
      healthScore: result.healthScore,
      metrics: result.metrics,
      warnings: result.warnings,
      recommendations: result.recommendations,
      content: markdown,
      details: result
    };
  }
}

module.exports = ConsistencyCommands;
