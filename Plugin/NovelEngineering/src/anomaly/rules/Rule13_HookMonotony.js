/**
 * @file Rule13_HookMonotony.js
 * @description ANOM_HOOK_MONOTONY: Hook Type Monotony & Lack of Narrative Diversity (钩子类型单一化异常)
 * @module anomaly/rules/Rule13_HookMonotony
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_HOOK_MONOTONY';
const SEVERITY = 'LOW';
const CATEGORY = 'NARRATIVE_DEBT_ANOMALY';

/**
 * Detects excessive dominance of a single hook/debt type among active narrative debts.
 * Emits ANOM_HOOK_MONOTONY when a single type exceeds threshold (default 60%) with >= 3 active debts.
 * 
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @param {number} [options.monotonyThreshold=0.60] - Maximum allowable ratio for a single debt type (0.0 - 1.0)
 * @param {number} [options.minDebtsForMonotony=3] - Minimum active debts required before checking monotony
 * @param {string} [options.projectId]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  if (!dbManager) return [];
  const db = dbManager.getDatabase ? dbManager.getDatabase() : dbManager.db;
  if (!db) return [];

  // Check table existence
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='narrative_debts'").get();
    if (!tableCheck) return [];
  } catch (_) {
    return [];
  }

  const projectId = options.projectId || options.project_id || null;
  const monotonyThreshold = options.monotonyThreshold !== undefined && options.monotonyThreshold !== null
    ? Number(options.monotonyThreshold)
    : (options.threshold !== undefined && options.threshold !== null ? Number(options.threshold) : 0.60);
  const minDebts = Number(options.minDebtsForMonotony || options.minDebts) || 3;
  const anomalies = [];

  let sql = `
    SELECT debt_type, COUNT(*) as count, SUM(current_balance) as total_balance
    FROM narrative_debts
    WHERE status IN ('active', 'overdue', 'partially_paid')
  `;
  const params = [];

  if (projectId) {
    sql += ' AND project_id = ?';
    params.push(projectId);
  }

  sql += ' GROUP BY debt_type ORDER BY count DESC';

  let rows = [];
  try {
    rows = db.prepare(sql).all(...params);
  } catch (err) {
    console.warn(`[Rule13_HookMonotony] Query error: ${err.message}`);
    return [];
  }

  if (!rows || rows.length === 0) {
    return [];
  }

  const totalActiveDebts = rows.reduce((sum, r) => sum + Number(r.count), 0);
  if (totalActiveDebts < minDebts) {
    return [];
  }

  const dominant = rows[0];
  const dominantCount = Number(dominant.count);
  const dominantType = dominant.debt_type;
  const ratio = dominantCount / totalActiveDebts;

  const typeDistribution = {};
  for (const r of rows) {
    typeDistribution[r.debt_type] = Number(r.count);
  }

  if (ratio > monotonyThreshold) {
    const isSevere = ratio >= 0.80;
    const severity = isSevere ? 'MEDIUM' : 'LOW';

    const percentage = (ratio * 100).toFixed(1);
    const thresholdPercentage = (monotonyThreshold * 100).toFixed(0);

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      ruleId: RULE_ID,
      rule_id: RULE_ID,
      rule_name: 'Rule_HookMonotony: Excessive Dominance of Single Hook Type',
      anomaly_type: CATEGORY,
      severity,
      title: `钩子类型单一化预警: ${dominantType} 占比 ${percentage}%`,
      message: `当前活跃的 ${totalActiveDebts} 笔叙事债务中，有 ${dominantCount} 笔属于 "${dominantType}" 类型（占比 ${percentage}% > 阈值 ${thresholdPercentage}%），钩子结构过度单一。`,
      description: `钩子类型单一化: ${dominantType} 占比 ${percentage}%`,
      affected_file_paths_json: [],
      affected_entity_ids_json: [],
      details_json: {
        dominantType,
        dominantCount,
        totalActiveDebts,
        monotonyRatio: Math.round(ratio * 1000) / 1000,
        monotonyThreshold,
        typeDistribution,
        isSevere
      },
      suggested_action: '丰富叙事钩子类型，引入人物承诺(character_promise)、能力升级期待(power_teaser)或世界观秘密(world_secret)等多维钩子。',
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'HOOK_MONOTONY',
  name: 'Hook Type Monotony & Lack of Narrative Diversity',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
