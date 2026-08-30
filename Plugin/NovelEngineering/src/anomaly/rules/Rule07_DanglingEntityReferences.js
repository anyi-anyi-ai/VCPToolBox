/**
 * @file Rule07_DanglingEntityReferences.js
 * @description ANOM_007: Dangling Entity References (悬空实体/跨文件引用冲突)
 * @module anomaly/rules/Rule07_DanglingEntityReferences
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_007_DANGLING_CROSS_REFERENCE';
const SEVERITY = 'MEDIUM';
const CATEGORY = 'GRAPH_INTEGRITY';

/**
 * Detects dangling wikilinks and unresolvable entity references across documents.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();
  const anomalies = [];

  // Build lookup index of all valid targets: entity_ids, canonical_names, aliases, relative_paths, file_names
  const entityRows = db.prepare('SELECT entity_id, canonical_name FROM entities WHERE status != \'deleted\'').all();
  const aliasRows = db.prepare('SELECT alias_name FROM entity_aliases').all();
  const fileRows = db.prepare('SELECT relative_path, file_name FROM source_files WHERE status != \'deleted\'').all();

  const validTargets = new Set();
  for (const e of entityRows) {
    if (e.entity_id) validTargets.add(e.entity_id.toLowerCase().trim());
    if (e.canonical_name) validTargets.add(e.canonical_name.toLowerCase().trim());
  }
  for (const a of aliasRows) {
    if (a.alias_name) validTargets.add(a.alias_name.toLowerCase().trim());
  }
  for (const f of fileRows) {
    if (f.relative_path) {
      validTargets.add(f.relative_path.toLowerCase().trim());
      validTargets.add(f.relative_path.replace(/\.md$/i, '').toLowerCase().trim());
    }
    if (f.file_name) {
      validTargets.add(f.file_name.toLowerCase().trim());
      validTargets.add(f.file_name.replace(/\.md$/i, '').toLowerCase().trim());
    }
  }

  // 1. Check file_entities with broken references
  const brokenMentions = db.prepare(`
    SELECT fe.id, fe.source_file_id, fe.entity_id, sf.relative_path
    FROM file_entities fe
    JOIN source_files sf ON fe.source_file_id = sf.id
    LEFT JOIN entities e ON fe.entity_id = e.id
    WHERE e.id IS NULL
  `).all();

  for (const bm of brokenMentions) {
    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Dangling entity link in '${bm.relative_path}'`,
      message: `File '${bm.relative_path}' references deleted or non-existent entity DB ID ${bm.entity_id}.`,
      affected_file_paths_json: [bm.relative_path],
      affected_entity_ids_json: [],
      details_json: {
        sourceFileId: bm.source_file_id,
        targetEntityDbId: bm.entity_id
      },
      suggested_action: `Clean up orphan mention record or restore referenced entity note.`,
      is_resolved: 0
    });
  }

  // 2. Check frontmatter attributes containing non-existent entity IDs or targets
  const sourceFiles = db.prepare('SELECT id, relative_path, frontmatter_json, frontmatter_raw FROM source_files WHERE status != \'deleted\'').all();

  const refKeys = [
    'parent_planet', 'parent_entity', 'planet', 'character', 'organization',
    'location', 'target_entity', 'related_entity', 'linked_entity', 'target'
  ];

  for (const sf of sourceFiles) {
    let fm = {};
    try {
      if (sf.frontmatter_json) {
        fm = JSON.parse(sf.frontmatter_json);
      }
    } catch {}

    for (const key of refKeys) {
      if (fm[key]) {
        const val = String(fm[key]).trim();
        const normVal = val.replace(/^\[\[|\]\]$/g, '').split('|')[0].trim().toLowerCase();
        if (normVal && !validTargets.has(normVal)) {
          anomalies.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: RULE_ID,
            anomaly_type: CATEGORY,
            severity: SEVERITY,
            title: `Dangling entity reference in '${sf.relative_path}': '${val}'`,
            message: `Property '${key}: ${val}' in '${sf.relative_path}' refers to non-existent entity or file '${val}'.`,
            affected_file_paths_json: [sf.relative_path],
            affected_entity_ids_json: [val],
            details_json: {
              referencingFile: sf.relative_path,
              propertyKey: key,
              targetValue: val
            },
            suggested_action: `Create missing note for '${val}' or correct reference property in frontmatter.`,
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
  identifier: 'DANGLING_CROSS_REFERENCE',
  name: 'Dangling Entity References',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
