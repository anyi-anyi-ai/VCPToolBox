/**
 * @file Rule12_PayoffDrought.js
 * @description ANOM_PAYOFF_DROUGHT: Narrative Payoff Drought Detection (叙事兑现干涸异常)
 * @module anomaly/rules/Rule12_PayoffDrought
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_PAYOFF_DROUGHT';
const SEVERITY = 'MEDIUM';
const CATEGORY = 'NARRATIVE_DEBT_ANOMALY';

/**
 * Detects continuous chapters without micro-payoffs or clue resolutions when active debts exist.
 * Emits ANOM_PAYOFF_DROUGHT anomalies to warn about reader fatigue and lack of narrative satisfaction.
 * 
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @param {number} [options.currentChapter]
 * @param {number} [options.droughtThreshold=5] - Minimum consecutive chapters without payoff to trigger anomaly
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
  const droughtThreshold = Number(options.droughtThreshold || options.threshold) || 5;
  const anomalies = [];

  // Query active debts
  let activeDebtSql = "SELECT COUNT(*) as count, MIN(borrowed_chapter) as min_borrowed, MAX(borrowed_chapter) as max_borrowed FROM narrative_debts WHERE status IN ('active', 'overdue', 'partially_paid')";
  const activeParams = [];
  if (projectId) {
    activeDebtSql += ' AND project_id = ?';
    activeParams.push(projectId);
  }

  let activeRow = null;
  try {
    activeRow = db.prepare(activeDebtSql).get(...activeParams);
  } catch (err) {
    console.warn(`[Rule12_PayoffDrought] Active debt query error: ${err.message}`);
    return [];
  }

  const totalActiveDebts = activeRow && activeRow.count ? Number(activeRow.count) : 0;
  if (totalActiveDebts === 0) {
    return [];
  }

  // Determine current chapter
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
    currentChapter = (activeRow && activeRow.max_borrowed) ? Number(activeRow.max_borrowed) : 1;
  }

  // Query last micro-payoff chapter
  let lastMicroChapter = null;
  try {
    const hasMicroTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='micro_payoffs'").get();
    if (hasMicroTable) {
      const microSql = projectId
        ? 'SELECT MAX(mp.chapter_number) as last_micro FROM micro_payoffs mp JOIN narrative_debts nd ON mp.debt_id = nd.debt_id WHERE nd.project_id = ?'
        : 'SELECT MAX(chapter_number) as last_micro FROM micro_payoffs';
      const microRow = projectId ? db.prepare(microSql).get(projectId) : db.prepare(microSql).get();
      if (microRow && microRow.last_micro !== null && microRow.last_micro !== undefined) {
        lastMicroChapter = Number(microRow.last_micro);
      }
    }
  } catch (_) {}

  // Query last debt payoff event chapter
  let lastEventChapter = null;
  try {
    const hasEventTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='debt_events'").get();
    if (hasEventTable) {
      const eventSql = projectId
        ? "SELECT MAX(de.chapter_number) as last_event FROM debt_events de JOIN narrative_debts nd ON de.debt_id = nd.debt_id WHERE de.event_type IN ('payoff', 'partial_pay', 'pay') AND nd.project_id = ?"
        : "SELECT MAX(chapter_number) as last_event FROM debt_events WHERE event_type IN ('payoff', 'partial_pay', 'pay')";
      const eventRow = projectId ? db.prepare(eventSql).get(projectId) : db.prepare(eventSql).get();
      if (eventRow && eventRow.last_event !== null && eventRow.last_event !== undefined) {
        lastEventChapter = Number(eventRow.last_event);
      }
    }
  } catch (_) {}

  // Determine last payoff chapter
  const validPayoffChapters = [lastMicroChapter, lastEventChapter].filter(c => c !== null && !isNaN(c));
  const lastPayoffChapter = validPayoffChapters.length > 0 ? Math.max(...validPayoffChapters) : null;

  const minBorrowed = activeRow && activeRow.min_borrowed !== null ? Number(activeRow.min_borrowed) : 1;

  let chaptersSinceLastPayoff = 0;
  if (lastPayoffChapter !== null) {
    chaptersSinceLastPayoff = Math.max(0, currentChapter - lastPayoffChapter);
  } else {
    chaptersSinceLastPayoff = Math.max(0, currentChapter - minBorrowed);
  }

  if (chaptersSinceLastPayoff >= droughtThreshold) {
    const isSevere = chaptersSinceLastPayoff >= (droughtThreshold * 2);
    const severity = isSevere ? 'HIGH' : 'MEDIUM';

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      ruleId: RULE_ID,
      rule_id: RULE_ID,
      rule_name: 'Rule_PayoffDrought: Narrative Payoff Drought Detected',
      anomaly_type: CATEGORY,
      severity,
      title: `叙事兑现干涸: 连续 ${chaptersSinceLastPayoff} 章无微兑现或伏笔偿还`,
      message: `从第 ${lastPayoffChapter || minBorrowed} 章至第 ${currentChapter} 章（连续 ${chaptersSinceLastPayoff} 章，阈值 ${droughtThreshold} 章），未检测到任何叙事微偿付(MicroPayoff)或悬念兑现记录，当前存在 ${totalActiveDebts} 笔活跃债务积压。`,
      description: `连续 ${chaptersSinceLastPayoff} 章无微兑现或伏笔偿还 (阈值 ${droughtThreshold} 章)`,
      affected_file_paths_json: [],
      affected_entity_ids_json: [],
      details_json: {
        currentChapter,
        lastPayoffChapter,
        chaptersSinceLastPayoff,
        droughtThreshold,
        totalActiveDebts,
        isSevere
      },
      suggested_action: '在近期章节安排微偿付(RecordMicroPayoff)释放线索碎片、确认读者推测或缓解局部危机，恢复追读爽感。',
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'PAYOFF_DROUGHT',
  name: 'Narrative Payoff Drought Detection',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
