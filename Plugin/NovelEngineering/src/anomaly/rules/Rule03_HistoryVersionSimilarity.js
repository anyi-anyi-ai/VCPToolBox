/**
 * @file Rule03_HistoryVersionSimilarity.js
 * @description ANOM_003: Historical Version Structure Similarity / Duplication (历史版本结构相似/重复)
 * @module anomaly/rules/Rule03_HistoryVersionSimilarity
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_003_HISTORICAL_VERSION_DUPLICATION';
const SEVERITY = 'MEDIUM';
const CATEGORY = 'STRUCTURAL_DUPLICATION';

/**
 * Detects bit-for-bit file duplicates (matching SHA-256) or archived duplicate clones.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();

  // Find exact hash duplicates across non-deleted files
  const hashSql = `
    SELECT 
      sha256_hash,
      COUNT(id) AS duplicate_count
    FROM source_files
    WHERE status != 'deleted' AND sha256_hash IS NOT NULL AND sha256_hash != ''
    GROUP BY sha256_hash
    HAVING COUNT(id) > 1
  `;

  const duplicateHashes = db.prepare(hashSql).all();
  const anomalies = [];
  const reportedFileIds = new Set();

  const fileDetailSql = `
    SELECT 
      sf.id,
      sf.relative_path,
      sf.file_name,
      sf.size_bytes,
      sf.source_category,
      sf.status,
      sf.review_status,
      e.entity_id,
      e.canonical_name
    FROM source_files sf
    LEFT JOIN entities e ON e.source_file_id = sf.id
    WHERE sf.sha256_hash = ? AND sf.status != 'deleted'
    ORDER BY sf.id ASC
  `;
  const fileDetailStmt = db.prepare(fileDetailSql);

  for (const group of duplicateHashes) {
    const files = fileDetailStmt.all(group.sha256_hash);
    const affectedFilePaths = files.map(f => f.relative_path);
    const affectedEntityIds = [...new Set(files.map(f => f.entity_id).filter(Boolean))];

    files.forEach(f => reportedFileIds.add(f.id));

    // Identify which file might be canonical vs archive/backup
    const isArchive = (p) => /archive|backup|history|v1|_old|\.bak/i.test(p);
    const archiveFiles = files.filter(f => isArchive(f.relative_path));
    const canonicalFiles = files.filter(f => !isArchive(f.relative_path));

    const mainFileName = files[0].file_name;
    const title = `Duplicate file or historical clone detected: '${mainFileName}'`;
    const message = archiveFiles.length > 0 && canonicalFiles.length > 0
      ? `File '${archiveFiles[0].relative_path}' is an identical clone of active file '${canonicalFiles[0].relative_path}'.`
      : `Identical file content (SHA-256: ${group.sha256_hash.slice(0, 12)}...) found across ${files.length} paths: ${affectedFilePaths.join(', ')}.`;

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title,
      message,
      affected_file_paths_json: affectedFilePaths,
      affected_entity_ids_json: affectedEntityIds,
      details_json: {
        sha256: group.sha256_hash,
        duplicateCount: group.duplicate_count,
        files: files.map(f => ({
          id: f.id,
          relativePath: f.relative_path,
          sizeBytes: f.size_bytes,
          status: f.status,
          reviewStatus: f.review_status,
          entityId: f.entity_id || null,
          canonicalName: f.canonical_name || null
        }))
      },
      suggested_action: `Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.`,
      is_resolved: 0
    });
  }

  // Also check for same filename across different folders (e.g. active vs archive/backup) if not already caught by hash
  const nameCloneSql = `
    SELECT 
      file_name,
      COUNT(id) AS count
    FROM source_files
    WHERE status != 'deleted'
    GROUP BY LOWER(TRIM(file_name))
    HAVING COUNT(id) > 1
  `;
  const nameClones = db.prepare(nameCloneSql).all();
  const nameDetailStmt = db.prepare(`
    SELECT 
      sf.id,
      sf.relative_path,
      sf.file_name,
      sf.size_bytes,
      sf.sha256_hash,
      sf.status,
      sf.review_status,
      e.entity_id
    FROM source_files sf
    LEFT JOIN entities e ON e.source_file_id = sf.id
    WHERE LOWER(TRIM(sf.file_name)) = LOWER(TRIM(?)) AND sf.status != 'deleted'
  `);

  for (const nc of nameClones) {
    const files = nameDetailStmt.all(nc.file_name);
    // If all these files were already reported under hash match, skip
    const unreported = files.filter(f => !reportedFileIds.has(f.id));
    if (unreported.length <= 1) continue;

    const affectedFilePaths = files.map(f => f.relative_path);
    const affectedEntityIds = [...new Set(files.map(f => f.entity_id).filter(Boolean))];

    anomalies.push({
      scan_session_id: scanSessionId,
      anomaly_rule_id: RULE_ID,
      anomaly_type: CATEGORY,
      severity: SEVERITY,
      title: `Potential historical version fork: '${nc.file_name}'`,
      message: `Multiple version forks of '${nc.file_name}' exist across directories: ${affectedFilePaths.join(', ')}.`,
      affected_file_paths_json: affectedFilePaths,
      affected_entity_ids_json: affectedEntityIds,
      details_json: {
        fileName: nc.file_name,
        files: files.map(f => ({
          id: f.id,
          relativePath: f.relative_path,
          sizeBytes: f.size_bytes,
          status: f.status,
          reviewStatus: f.review_status
        }))
      },
      suggested_action: `Consolidate version forks and archive older revisions.`,
      is_resolved: 0
    });
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'HISTORICAL_VERSION_DUPLICATION',
  name: 'Historical Version Structure Similarity / Duplication',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
