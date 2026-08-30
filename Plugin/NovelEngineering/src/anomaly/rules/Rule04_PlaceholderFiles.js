/**
 * @file Rule04_PlaceholderFiles.js
 * @description ANOM_004: 30B Placeholder / Stub Files (30B 占位文件)
 * @module anomaly/rules/Rule04_PlaceholderFiles
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_004_PLACEHOLDER_STUB_FILE';
const SEVERITY = 'LOW';
const CATEGORY = 'VAULT_HYGIENE';

/**
 * Detects placeholder and stub notes in the vault.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();
  const maxSizeBytes = options.maxSizeBytes !== undefined ? Number(options.maxSizeBytes) : 50;

  const sql = `
    SELECT 
      sf.id,
      sf.relative_path,
      sf.file_name,
      sf.size_bytes,
      sf.line_count,
      sf.word_count,
      sf.is_placeholder,
      sf.placeholder_reason,
      sf.frontmatter_raw,
      e.entity_id,
      e.canonical_name
    FROM source_files sf
    LEFT JOIN entities e ON e.source_file_id = sf.id
    WHERE (
        sf.is_placeholder = 1 
        OR sf.size_bytes <= ? 
        OR (sf.word_count <= 5 AND sf.line_count <= 3)
        OR sf.placeholder_reason IS NOT NULL
      )
      AND sf.status NOT IN ('deleted', 'archived')
    ORDER BY sf.size_bytes ASC, sf.id ASC
  `;

  const rows = db.prepare(sql).all(maxSizeBytes);
  const anomalies = [];

  for (const row of rows) {
    const reason = row.placeholder_reason || (row.size_bytes <= 30 ? 'FILE_SIZE_LE_30B' : (row.size_bytes <= 50 ? 'FILE_SIZE_LE_50B' : 'EMPTY_BODY'));

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Stub placeholder file detected: '${row.relative_path}'`,
      message: `File '${row.relative_path}' is an empty or minimal placeholder (${row.size_bytes}B, ${row.word_count} words). Reason: ${reason}.`,
      affected_file_paths_json: [row.relative_path],
      affected_entity_ids_json: row.entity_id ? [row.entity_id] : [],
      details_json: {
        fileId: row.id,
        relativePath: row.relative_path,
        fileName: row.file_name,
        sizeBytes: row.size_bytes,
        wordCount: row.word_count,
        lineCount: row.line_count,
        reason,
        entityId: row.entity_id || null,
        canonicalName: row.canonical_name || null
      },
      suggested_action: `Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.`,
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'PLACEHOLDER_STUB_FILE',
  name: '30B Placeholder / Stub Files',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
