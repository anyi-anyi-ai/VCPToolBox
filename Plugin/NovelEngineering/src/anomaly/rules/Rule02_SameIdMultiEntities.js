/**
 * @file Rule02_SameIdMultiEntities.js
 * @description ANOM_002: Same-ID Multiple Entities (同编号多星球/实体)
 * @module anomaly/rules/Rule02_SameIdMultiEntities
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_002_SAME_ID_MULTI_ENTITY';
const SEVERITY = 'CRITICAL';
const CATEGORY = 'ID_INTEGRITY';

/**
 * Detects same business entity_id assigned to multiple distinct entities or multiple files.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();

  const groupSql = `
    SELECT 
      entity_id,
      COUNT(DISTINCT LOWER(TRIM(canonical_name))) AS distinct_name_count,
      COUNT(id) AS total_occurrences,
      GROUP_CONCAT(DISTINCT canonical_name) AS conflicting_names,
      GROUP_CONCAT(DISTINCT entity_type) AS entity_types
    FROM entities
    WHERE status != 'deprecated' AND status != 'deleted'
    GROUP BY entity_id
    HAVING COUNT(DISTINCT LOWER(TRIM(canonical_name))) > 1 OR COUNT(id) > 1
  `;

  const conflictingGroups = db.prepare(groupSql).all();
  const anomalies = [];

  const detailSql = `
    SELECT 
      e.id,
      e.entity_id,
      e.canonical_name,
      e.entity_type,
      e.status,
      e.review_status,
      e.line_number,
      sf.relative_path,
      sf.file_name
    FROM entities e
    LEFT JOIN source_files sf ON e.source_file_id = sf.id
    WHERE e.entity_id = ?
      AND e.status != 'deprecated'
      AND e.status != 'deleted'
    ORDER BY e.id ASC
  `;
  const detailStmt = db.prepare(detailSql);

  for (const group of conflictingGroups) {
    const records = detailStmt.all(group.entity_id);
    const affectedFilePaths = [...new Set(records.map(r => r.relative_path).filter(Boolean))];
    const conflictingNames = [...new Set(records.map(r => r.canonical_name).filter(Boolean))];

    const entities = records.map(r => ({
      dbId: r.id,
      entityId: r.entity_id,
      name: r.canonical_name,
      type: r.entity_type,
      filePath: r.relative_path || 'unknown',
      line: r.line_number || 1,
      status: r.status,
      reviewStatus: r.review_status
    }));

    const isDifferentNames = group.distinct_name_count > 1;
    const title = isDifferentNames
      ? `ID collision on '${group.entity_id}' for distinct entities`
      : `Duplicate definition of entity '${group.entity_id}' across multiple files`;

    const message = isDifferentNames
      ? `ID '${group.entity_id}' is simultaneously assigned to distinct entities: ${conflictingNames.join(', ')}.`
      : `Entity ID '${group.entity_id}' (${conflictingNames.join(', ')}) is defined across ${affectedFilePaths.length} separate files.`;

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title,
      message,
      affected_file_paths_json: affectedFilePaths,
      affected_entity_ids_json: [group.entity_id],
      details_json: {
        entityId: group.entity_id,
        distinctNameCount: group.distinct_name_count,
        totalOccurrences: group.total_occurrences,
        entities
      },
      suggested_action: `Quarantine conflicting notes and reassign unique canonical IDs to distinct entities.`,
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'SAME_ID_MULTI_ENTITY',
  name: 'Same-ID Multiple Entities',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
