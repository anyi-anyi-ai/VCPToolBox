/**
 * @file Rule11_DebtOverdue.js
 * @description ANOM_DEBT_OVERDUE: Narrative Debt Overdue Past Target Chapter (叙事债务逾期未偿还异常)
 * @module anomaly/rules/Rule11_DebtOverdue
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_DEBT_OVERDUE';
const SEVERITY = 'HIGH';
const CATEGORY = 'NARRATIVE_DEBT_ANOMALY';

/**
 * Detects debts exceeding target_payoff_chapter without full resolution.
 * Assigns severity ('CRITICAL' or 'HIGH') and emits ANOM_DEBT_OVERDUE anomalies.
 * 
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @param {number} [options.currentChapter]
 * @param {string} [options.projectId]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  if (!dbManager) return [];
  const db = dbManager.getDatabase ? dbManager.getDatabase() : dbManager.db;
  if (!db) return [];

  // Verify narrative_debts table exists
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='narrative_debts'").get();
    if (!tableCheck) return [];
  } catch (_) {
    return [];
  }

  const projectId = options.projectId || options.project_id || null;
  const anomalies = [];

  // Determine current chapter context
  let currentChapter = options.currentChapter !== undefined && options.currentChapter !== null
    ? Number(options.currentChapter)
    : null;

  if (currentChapter === null || isNaN(currentChapter)) {
    try {
      const maxChapRow = db.prepare("SELECT MAX(chapter_number) as max_chap FROM chapters WHERE status != 'draft'").get();
      if (maxChapRow && maxChapRow.max_chap !== null) {
        currentChapter = Number(maxChapRow.max_chap);
      }
    } catch (_) {}
  }

  if (currentChapter === null || isNaN(currentChapter)) {
    try {
      const debtMaxRow = db.prepare('SELECT MAX(COALESCE(last_accrued_chapter, borrowed_chapter)) as max_chap FROM narrative_debts').get();
      if (debtMaxRow && debtMaxRow.max_chap !== null) {
        currentChapter = Number(debtMaxRow.max_chap);
      }
    } catch (_) {}
  }

  if (currentChapter === null || isNaN(currentChapter)) {
    currentChapter = 1;
  }

  let sql = `
    SELECT nd.*, sf.relative_path AS source_file_path
    FROM narrative_debts nd
    LEFT JOIN foreshadowing fs ON nd.foreshadow_id = fs.foreshadow_id
    LEFT JOIN source_files sf ON fs.setup_file_id = sf.id
    WHERE nd.status IN ('active', 'overdue', 'partially_paid')
  `;
  const params = [];

  if (projectId) {
    sql += ' AND nd.project_id = ?';
    params.push(projectId);
  }

  let rows = [];
  try {
    rows = db.prepare(sql).all(...params);
  } catch (err) {
    console.warn(`[Rule11_DebtOverdue] Query error: ${err.message}`);
    return [];
  }

  for (const debt of rows) {
    const targetChap = debt.target_payoff_chapter !== null && debt.target_payoff_chapter !== undefined
      ? Number(debt.target_payoff_chapter)
      : null;

    const accruedChap = debt.last_accrued_chapter !== null && debt.last_accrued_chapter !== undefined
      ? Number(debt.last_accrued_chapter)
      : (debt.borrowed_chapter + (debt.accrued_chapters || 0));

    const effectiveChap = Math.max(currentChapter, accruedChap);

    const isOverdue = debt.status === 'overdue' || (
      targetChap !== null && (effectiveChap > targetChap || (debt.last_accrued_chapter !== null && debt.last_accrued_chapter > targetChap))
    );

    if (isOverdue) {
      const overdueChapters = targetChap !== null && effectiveChap > targetChap
        ? effectiveChap - targetChap
        : (debt.accrued_chapters > (targetChap ? targetChap - debt.borrowed_chapter : 0) ? debt.accrued_chapters - (targetChap - debt.borrowed_chapter) : 1);

      // Assign severity
      const isCritical = debt.debt_type === 'core_mystery' ||
                         overdueChapters >= 5 ||
                         debt.current_balance >= (debt.base_principal * 2) ||
                         debt.urgency_level === 'critical';
      const severity = isCritical ? 'CRITICAL' : 'HIGH';

      let relatedEntities = [];
      if (debt.related_entities_json) {
        try {
          const parsed = JSON.parse(debt.related_entities_json);
          relatedEntities = Array.isArray(parsed) ? parsed : [parsed];
        } catch (_) {
          relatedEntities = [debt.related_entities_json];
        }
      }

      const affectedFiles = [debt.source_file_path].filter(Boolean);

      anomalies.push({
        scan_session_id: scanSessionId,
        anomaly_rule_id: RULE_ID,
        ruleId: RULE_ID,
        rule_id: RULE_ID,
        rule_name: 'Rule_DebtOverdue: Narrative Debt Overdue Past Target Chapter',
        anomaly_type: CATEGORY,
        severity,
        title: `叙事债务逾期未偿还: ${debt.title} (${debt.debt_id})`,
        message: `叙事债务 "${debt.title}" (${debt.debt_id}, 类型: ${debt.debt_type}) 目标偿还章节为第${targetChap || 'N/A'}章，现已逾期 ${overdueChapters} 章未偿还，当前债务余额已累积至 ${debt.current_balance}。`,
        description: `叙事债务 "${debt.title}" (${debt.debt_id}) 逾期未偿还 (目标第${targetChap || 'N/A'}章)`,
        affected_file_paths_json: affectedFiles,
        affected_entity_ids_json: relatedEntities,
        details_json: {
          debtId: debt.debt_id,
          title: debt.title,
          debtType: debt.debt_type,
          borrowedChapter: debt.borrowed_chapter,
          targetPayoffChapter: targetChap,
          currentBalance: debt.current_balance,
          basePrincipal: debt.base_principal,
          overdueChapters,
          status: debt.status,
          urgencyLevel: debt.urgency_level,
          foreshadowId: debt.foreshadow_id
        },
        suggested_action: '在后续章节推进相关支线伏笔或安排阶段性微偿付(RecordMicroPayoff)以释放叙事压力。',
        is_resolved: 0
      });
    }
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'DEBT_OVERDUE',
  name: 'Narrative Debt Overdue Past Target Chapter',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
