/**
 * @file Rule05_LegacyIdConflicts.js
 * @description ANOM_005: Legacy / Deprecated ID Conflicts (新旧 ID / 弃用 ID 冲突)
 * @module anomaly/rules/Rule05_LegacyIdConflicts
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT';
const SEVERITY = 'HIGH';
const CATEGORY = 'SCHEMA_MIGRATION';

/**
 * Detects legacy identifier conflicts with active canonical entities.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();

  // 1. Alias legacy_id matching active entity_id of another entity
  const sql = `
    SELECT 
      ea.alias_name AS legacy_id,
      ea.entity_id AS target_db_id,
      e_target.canonical_name AS target_name,
      e_target.entity_id AS target_canonical_id,
      e_conflict.id AS conflicting_db_id,
      e_conflict.entity_id AS conflicting_canonical_id,
      e_conflict.canonical_name AS conflicting_name,
      sf_target.relative_path AS target_file_path,
      sf_conflict.relative_path AS conflicting_file_path
    FROM entity_aliases ea
    JOIN entities e_target ON ea.entity_id = e_target.id
    JOIN entities e_conflict ON LOWER(TRIM(ea.alias_name)) = LOWER(TRIM(e_conflict.entity_id))
    LEFT JOIN source_files sf_target ON e_target.source_file_id = sf_target.id
    LEFT JOIN source_files sf_conflict ON e_conflict.source_file_id = sf_conflict.id
    WHERE (ea.alias_type = 'legacy_id' OR ea.alias_name LIKE 'OLD-%' OR ea.alias_name LIKE 'V1_%')
      AND e_target.id != e_conflict.id
      AND e_target.status != 'deprecated'
      AND e_conflict.status != 'deprecated'
  `;

  const rows = db.prepare(sql).all();
  const anomalies = [];
  const seenKeys = new Set();

  for (const r of rows) {
    const key = `${r.legacy_id}_${r.target_db_id}_${r.conflicting_db_id}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    const affectedFiles = [r.target_file_path, r.conflicting_file_path].filter(Boolean);
    const affectedEntities = [r.target_canonical_id, r.conflicting_canonical_id].filter(Boolean);

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Legacy ID '${r.legacy_id}' collides with active entity ID`,
      message: `Legacy identifier '${r.legacy_id}' (alias of '${r.target_name}' [${r.target_canonical_id}]) collides with active entity '${r.conflicting_name}' [${r.conflicting_canonical_id}].`,
      affected_file_paths_json: affectedFiles,
      affected_entity_ids_json: affectedEntities,
      details_json: {
        legacyId: r.legacy_id,
        intendedEntity: {
          id: r.target_db_id,
          entityId: r.target_canonical_id,
          name: r.target_name,
          filePath: r.target_file_path
        },
        conflictingEntity: {
          id: r.conflicting_db_id,
          entityId: r.conflicting_canonical_id,
          name: r.conflicting_name,
          filePath: r.conflicting_file_path
        }
      },
      suggested_action: `Reassign unique canonical ID to '${r.conflicting_name}' and maintain explicit legacy ID redirect.`,
      is_resolved: 0
    });
  }

  // 2. Also check if entity_id itself matches legacy patterns while another entity has the new canonical ID
  const legacyPatterns = options.legacyIdPatterns || ['^OLD-', '^V1_', '^LEGACY-'];
  const legacyRegexes = legacyPatterns.map(p => new RegExp(p, 'i'));

  const allEntities = db.prepare(`
    SELECT e.id, e.entity_id, e.canonical_name, sf.relative_path
    FROM entities e
    LEFT JOIN source_files sf ON e.source_file_id = sf.id
    WHERE e.status != 'deprecated' AND e.status != 'deleted'
  `).all();

  for (const ent of allEntities) {
    const isLegacy = legacyRegexes.some(rx => rx.test(ent.entity_id));
    if (isLegacy) {
      // Find if canonical non-legacy entity exists with the stripped ID
      const strippedId = ent.entity_id.replace(/^(OLD-|V1_|LEGACY-)/i, '');
      const matchingCanon = allEntities.find(e => e.id !== ent.id && e.entity_id.toLowerCase() === strippedId.toLowerCase());
      if (matchingCanon) {
        const key = `legacy_pattern_${ent.entity_id}_${matchingCanon.entity_id}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          anomalies.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: RULE_ID,
            anomaly_type: CATEGORY,
            severity: SEVERITY,
            title: `Legacy format ID '${ent.entity_id}' coexists with modern '${matchingCanon.entity_id}'`,
            message: `Legacy formatted entity '${ent.canonical_name}' (${ent.entity_id}) conflicts with modern entity '${matchingCanon.canonical_name}' (${matchingCanon.entity_id}).`,
            affected_file_paths_json: [ent.relative_path, matchingCanon.relative_path].filter(Boolean),
            affected_entity_ids_json: [ent.entity_id, matchingCanon.entity_id],
            details_json: {
              legacyEntity: ent,
              modernEntity: matchingCanon
            },
            suggested_action: `Migrate legacy entity note to modern ID scheme.`,
            is_resolved: 0
          });
        }
      }
    }
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'LEGACY_DEPRECATED_ID_CONFLICT',
  name: 'Legacy / Deprecated ID Conflicts',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
