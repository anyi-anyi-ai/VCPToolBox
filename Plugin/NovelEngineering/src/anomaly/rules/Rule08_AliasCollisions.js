/**
 * @file Rule08_AliasCollisions.js
 * @description ANOM_008: Alias Collisions Across Different Entities (别名跨实体冲突/重叠)
 * @module anomaly/rules/Rule08_AliasCollisions
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_008_ALIAS_CROSS_COLLISION';
const SEVERITY = 'MEDIUM';
const CATEGORY = 'DISAMBIGUATION';

/**
 * Detects ambiguous alias names registered across distinct entities.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();
  const anomalies = [];
  const seenAliases = new Set();

  // 1. Same alias registered to multiple distinct entities
  const groupSql = `
    SELECT 
      LOWER(TRIM(ea.alias_name)) AS normalized_alias,
      ea.alias_name,
      COUNT(DISTINCT ea.entity_id) AS distinct_entity_count
    FROM entity_aliases ea
    JOIN entities e ON ea.entity_id = e.id
    WHERE e.status != 'deprecated' AND e.status != 'deleted'
    GROUP BY LOWER(TRIM(ea.alias_name))
    HAVING COUNT(DISTINCT ea.entity_id) > 1
  `;

  const collidingAliases = db.prepare(groupSql).all();

  const detailSql = `
    SELECT 
      ea.id AS alias_db_id,
      ea.alias_name,
      ea.alias_type,
      ea.is_primary,
      e.id AS entity_db_id,
      e.entity_id,
      e.canonical_name,
      e.entity_type,
      sf.relative_path
    FROM entity_aliases ea
    JOIN entities e ON ea.entity_id = e.id
    LEFT JOIN source_files sf ON e.source_file_id = sf.id
    WHERE LOWER(TRIM(ea.alias_name)) = ?
      AND e.status != 'deprecated'
      AND e.status != 'deleted'
    ORDER BY ea.id ASC
  `;
  const detailStmt = db.prepare(detailSql);

  for (const group of collidingAliases) {
    seenAliases.add(group.normalized_alias);
    const records = detailStmt.all(group.normalized_alias);
    const affectedFiles = [...new Set(records.map(r => r.relative_path).filter(Boolean))];
    const affectedEntityIds = [...new Set(records.map(r => r.entity_id).filter(Boolean))];

    const entities = records.map(r => ({
      aliasDbId: r.alias_db_id,
      aliasType: r.alias_type,
      isPrimary: r.is_primary === 1,
      entityDbId: r.entity_db_id,
      entityId: r.entity_id,
      name: r.canonical_name,
      type: r.entity_type,
      filePath: r.relative_path || 'unknown'
    }));

    const entityNames = records.map(r => `${r.entity_id} (${r.canonical_name})`);

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Ambiguous alias '${group.alias_name}' shared across multiple entities`,
      message: `Alias '${group.alias_name}' is registered by ${group.distinct_entity_count} distinct entities: ${entityNames.join(', ')}.`,
      affected_file_paths_json: affectedFiles,
      affected_entity_ids_json: affectedEntityIds,
      details_json: {
        aliasName: group.alias_name,
        normalizedAlias: group.normalized_alias,
        distinctEntityCount: group.distinct_entity_count,
        entities
      },
      suggested_action: `Demote colliding aliases to is_primary=0 and use namespace/type qualifiers for resolution.`,
      is_resolved: 0
    });
  }

  // 2. Alias of Entity A colliding with canonical name of Entity B
  const crossNameSql = `
    SELECT 
      ea.alias_name,
      ea.entity_id AS alias_entity_db_id,
      e1.entity_id AS alias_entity_canon_id,
      e1.canonical_name AS alias_entity_name,
      sf1.relative_path AS alias_file_path,
      e2.id AS target_entity_db_id,
      e2.entity_id AS target_entity_canon_id,
      e2.canonical_name AS target_canonical_name,
      sf2.relative_path AS target_file_path
    FROM entity_aliases ea
    JOIN entities e1 ON ea.entity_id = e1.id
    JOIN entities e2 ON LOWER(TRIM(ea.alias_name)) = LOWER(TRIM(e2.canonical_name))
    LEFT JOIN source_files sf1 ON e1.source_file_id = sf1.id
    LEFT JOIN source_files sf2 ON e2.source_file_id = sf2.id
    WHERE e1.id != e2.id
      AND e1.status != 'deprecated'
      AND e2.status != 'deprecated'
  `;

  const crossNameCollisions = db.prepare(crossNameSql).all();
  for (const c of crossNameCollisions) {
    const norm = c.alias_name.toLowerCase().trim();
    if (seenAliases.has(norm)) continue;
    seenAliases.add(norm);

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Alias '${c.alias_name}' of '${c.alias_entity_name}' collides with canonical name of '${c.target_canonical_name}'`,
      message: `Alias '${c.alias_name}' (of ${c.alias_entity_canon_id}) collides with the primary canonical name of entity ${c.target_entity_canon_id}.`,
      affected_file_paths_json: [c.alias_file_path, c.target_file_path].filter(Boolean),
      affected_entity_ids_json: [c.alias_entity_canon_id, c.target_entity_canon_id],
      details_json: {
        aliasName: c.alias_name,
        aliasEntity: { id: c.alias_entity_canon_id, name: c.alias_entity_name, filePath: c.alias_file_path },
        targetEntity: { id: c.target_entity_canon_id, name: c.target_canonical_name, filePath: c.target_file_path }
      },
      suggested_action: `Disambiguate alias or rename secondary entity alias.`,
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'ALIAS_CROSS_COLLISION',
  name: 'Alias Collisions Across Different Entities',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
