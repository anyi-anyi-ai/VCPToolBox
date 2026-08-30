/**
 * @file Rule10_ForeshadowingUnclosedMismatch.js
 * @description ANOM_010: Foreshadowing Unclosed / Status Mismatch (伏笔未回收/状态不匹配异常)
 * @module anomaly/rules/Rule10_ForeshadowingUnclosedMismatch
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_010_FORESHADOWING_UNCLOSED_STATUS';
const SEVERITY = 'LOW';
const CATEGORY = 'PLOT_TRACKING';

/**
 * Detects unresolved or inconsistent foreshadowing statuses and missing resolution chapters.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();
  const anomalies = [];

  const sql = `
    SELECT 
      fs.id,
      fs.foreshadow_id,
      fs.title,
      fs.description,
      fs.status,
      fs.setup_file_id,
      fs.setup_chapter_id,
      fs.resolution_file_id,
      fs.resolution_chapter_id,
      sf_setup.relative_path AS setup_file_path,
      sf_res.relative_path AS resolution_file_path,
      c_res.title AS chapter_title,
      c_res.status AS chapter_status
    FROM foreshadowing fs
    LEFT JOIN source_files sf_setup ON fs.setup_file_id = sf_setup.id
    LEFT JOIN source_files sf_res ON fs.resolution_file_id = sf_res.id
    LEFT JOIN chapters c_res ON fs.resolution_chapter_id = c_res.id
  `;

  const rows = db.prepare(sql).all();

  for (const r of rows) {
    const isClosed = r.status === 'closed' || r.status === 'resolved';

    // Case 1: Marked closed but no resolution file or chapter given
    if (isClosed && !r.resolution_file_id && !r.resolution_chapter_id) {
      anomalies.push({
        scan_session_id: scanSessionId,
        anomaly_rule_id: RULE_ID,
        anomaly_type: CATEGORY,
        severity: SEVERITY,
        title: `Foreshadowing '${r.foreshadow_id}' marked closed without resolution reference`,
        message: `Foreshadowing clue '${r.title}' (${r.foreshadow_id}) is marked '${r.status}' but lacks resolution_file_id and resolution_chapter_id.`,
        affected_file_paths_json: [r.setup_file_path].filter(Boolean),
        affected_entity_ids_json: [],
        details_json: {
          foreshadowId: r.foreshadow_id,
          title: r.title,
          status: r.status,
          setupFile: r.setup_file_path
        },
        suggested_action: `Provide resolution chapter and payoff line reference, or revert status to 'open'.`,
        is_resolved: 0
      });
    }
    // Case 2: Marked closed but pointing to draft resolution chapter
    else if (isClosed && r.chapter_status === 'draft') {
      anomalies.push({
        scan_session_id: scanSessionId,
        anomaly_rule_id: RULE_ID,
        anomaly_type: CATEGORY,
        severity: SEVERITY,
        title: `Foreshadowing '${r.foreshadow_id}' resolved in unfinalized draft chapter`,
        message: `Foreshadowing clue '${r.title}' is marked '${r.status}' pointing to draft chapter '${r.chapter_title}'.`,
        affected_file_paths_json: [r.setup_file_path, r.resolution_file_path].filter(Boolean),
        affected_entity_ids_json: [],
        details_json: {
          foreshadowId: r.foreshadow_id,
          title: r.title,
          chapterTitle: r.chapter_title,
          chapterStatus: r.chapter_status
        },
        suggested_action: `Ensure resolution chapter is published/completed or keep foreshadowing as 'pending_review'.`,
        is_resolved: 0
      });
    }
    // Case 3: Marked contradictory
    else if (r.status === 'contradictory') {
      anomalies.push({
        scan_session_id: scanSessionId,
        anomaly_rule_id: RULE_ID,
        anomaly_type: CATEGORY,
        severity: 'MEDIUM',
        title: `Foreshadowing '${r.foreshadow_id}' marked contradictory`,
        message: `Foreshadowing clue '${r.title}' has contradictory narrative developments.`,
        affected_file_paths_json: [r.setup_file_path].filter(Boolean),
        affected_entity_ids_json: [],
        details_json: {
          foreshadowId: r.foreshadow_id,
          title: r.title,
          status: r.status
        },
        suggested_action: `Resolve narrative plot contradiction in upcoming outline revision.`,
        is_resolved: 0
      });
    }
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'FORESHADOWING_UNCLOSED_STATUS',
  name: 'Foreshadowing Unclosed / Status Mismatch',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
