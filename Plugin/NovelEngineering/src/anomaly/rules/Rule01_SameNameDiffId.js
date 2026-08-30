/**
 * @file Rule01_SameNameDiffId.js
 * @description ANOM_001: Same-Name Planet Different ID (同名星球不同编号)
 * @module anomaly/rules/Rule01_SameNameDiffId
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_001_SAME_NAME_DIFF_ID';
const SEVERITY = 'HIGH';
const CATEGORY = 'ENTITY_CONFLICT';

/**
 * Detects multiple active planet entity records sharing identical canonical names but different entity IDs.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();
  const targetEntityType = options.entityType || 'planet';

  // Group entities by normalized canonical name having multiple distinct entity_ids
  const groupSql = `
    SELECT 
      LOWER(TRIM(canonical_name)) AS normalized_name,
      canonical_name,
      COUNT(DISTINCT entity_id) AS distinct_id_count,
      COUNT(id) AS total_count
    FROM entities
    WHERE entity_type = ? AND status != 'deprecated' AND status != 'deleted'
    GROUP BY LOWER(TRIM(canonical_name))
    HAVING COUNT(DISTINCT entity_id) > 1
  `;

  const conflictingGroups = db.prepare(groupSql).all(targetEntityType);
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
    WHERE LOWER(TRIM(e.canonical_name)) = ?
      AND e.entity_type = ?
      AND e.status != 'deprecated'
      AND e.status != 'deleted'
    ORDER BY e.id ASC
  `;
  const detailStmt = db.prepare(detailSql);

  for (const group of conflictingGroups) {
    const records = detailStmt.all(group.normalized_name, targetEntityType);
    const affectedFilePaths = [...new Set(records.map(r => r.relative_path).filter(Boolean))];
    const affectedEntityIds = [...new Set(records.map(r => r.entity_id).filter(Boolean))];

    const conflictingEntities = records.map(r => ({
      dbId: r.id,
      entityId: r.entity_id,
      canonicalName: r.canonical_name,
      filePath: r.relative_path || 'unknown',
      line: r.line_number || 1,
      status: r.status,
      reviewStatus: r.review_status
    }));

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Duplicate planet name with divergent IDs: '${group.canonical_name}'`,
      message: `Planet '${group.canonical_name}' is assigned multiple distinct IDs (${affectedEntityIds.join(', ')}) across ${affectedFilePaths.length} files.`,
      affected_file_paths_json: affectedFilePaths,
      affected_entity_ids_json: affectedEntityIds,
      details_json: {
        canonicalName: group.canonical_name,
        normalizedName: group.normalized_name,
        distinctIdCount: group.distinct_id_count,
        conflictingEntities
      },
      suggested_action: `Merge conflicting IDs (${affectedEntityIds.join(', ')}) into canonical entity and deprecate secondary draft notes.`,
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'SAME_NAME_DIFF_ID',
  name: 'Same-Name Planet Different ID',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
