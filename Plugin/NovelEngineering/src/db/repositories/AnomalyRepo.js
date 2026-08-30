/**
 * @file AnomalyRepo.js
 * @description Typed CRUD repository for anomaly_reports and scan_manifests tables
 * @module db/repositories/AnomalyRepo
 */

'use strict';

class AnomalyRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for AnomalyRepo');
    }
    this.db = db;
  }

  /**
   * Normalize anomaly data for SQL binding
   * @private
   */
  _normalizeAnomaly(data) {
    const toJSON = (val, defaultVal = null) => {
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val || defaultVal;
    };

    const affectedFiles = data.affected_file_paths_json || data.affectedFilePaths || data.affected_files || [];
    const affectedEntities = data.affected_entity_ids_json || data.affectedEntityIds || data.affected_entities || [];
    const details = data.details_json || data.details || {};

    return {
      scan_session_id: data.scan_session_id || data.scanSessionId || 'default',
      anomaly_rule_id: data.anomaly_rule_id || data.ruleId || data.rule_id || 'ANOM_UNKNOWN',
      anomaly_type: data.anomaly_type || data.type || 'CONFLICT',
      severity: (data.severity || 'MEDIUM').toUpperCase(),
      title: data.title || '',
      message: data.message || '',
      affected_file_paths_json: toJSON(affectedFiles, '[]'),
      affected_entity_ids_json: toJSON(affectedEntities, '[]'),
      details_json: toJSON(details, '{}'),
      suggested_action: data.suggested_action || data.suggestedAction || null,
      is_resolved: data.is_resolved ? 1 : 0
    };
  }

  /**
   * Insert an anomaly report record
   * @param {object} data
   * @returns {object} Inserted anomaly
   */
  insert(data) {
    const record = this._normalizeAnomaly(data);
    const sql = `
      INSERT INTO anomaly_reports (
        scan_session_id, anomaly_rule_id, anomaly_type, severity,
        title, message, affected_file_paths_json, affected_entity_ids_json,
        details_json, suggested_action, is_resolved, created_at
      ) VALUES (
        @scan_session_id, @anomaly_rule_id, @anomaly_type, @severity,
        @title, @message, @affected_file_paths_json, @affected_entity_ids_json,
        @details_json, @suggested_action, @is_resolved, datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return this.getById(info.lastInsertRowid);
  }

  /**
   * Batch insert anomalies in a transaction
   * @param {Array<object>} anomalies
   * @returns {number}
   */
  batchInsert(anomalies) {
    if (!Array.isArray(anomalies) || anomalies.length === 0) {
      return 0;
    }

    const sql = `
      INSERT INTO anomaly_reports (
        scan_session_id, anomaly_rule_id, anomaly_type, severity,
        title, message, affected_file_paths_json, affected_entity_ids_json,
        details_json, suggested_action, is_resolved, created_at
      ) VALUES (
        @scan_session_id, @anomaly_rule_id, @anomaly_type, @severity,
        @title, @message, @affected_file_paths_json, @affected_entity_ids_json,
        @details_json, @suggested_action, @is_resolved, datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);

    const tx = this.db.transaction((items) => {
      let count = 0;
      for (const item of items) {
        stmt.run(this._normalizeAnomaly(item));
        count++;
      }
      return count;
    });

    return tx(anomalies);
  }

  /**
   * Retrieve anomaly by ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM anomaly_reports WHERE id = ?');
    const row = stmt.get(Number(id));
    if (!row) return null;
    return this._hydrateAnomaly(row);
  }

  /**
   * Retrieve all anomalies for a scan session
   * @param {string} scanSessionId
   * @returns {Array<object>}
   */
  getBySessionId(scanSessionId) {
    const stmt = this.db.prepare('SELECT * FROM anomaly_reports WHERE scan_session_id = ? ORDER BY id ASC');
    const rows = stmt.all(scanSessionId);
    return rows.map((r) => this._hydrateAnomaly(r));
  }

  /**
   * Query anomalies with filters
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.scan_session_id || filter.scanSessionId) {
      clauses.push('scan_session_id = @session_id');
      params.session_id = filter.scan_session_id || filter.scanSessionId;
    }

    if (filter.anomaly_rule_id || filter.ruleId) {
      const rule = filter.anomaly_rule_id || filter.ruleId;
      if (Array.isArray(rule)) {
        clauses.push(`anomaly_rule_id IN (${rule.map((_, i) => `@rule_${i}`).join(', ')})`);
        rule.forEach((r, i) => { params[`rule_${i}`] = r; });
      } else {
        clauses.push('anomaly_rule_id = @rule_id');
        params.rule_id = rule;
      }
    }

    if (filter.severity) {
      if (Array.isArray(filter.severity)) {
        clauses.push(`severity IN (${filter.severity.map((_, i) => `@sev_${i}`).join(', ')})`);
        filter.severity.forEach((s, i) => { params[`sev_${i}`] = String(s).toUpperCase(); });
      } else {
        clauses.push('severity = @severity');
        params.severity = String(filter.severity).toUpperCase();
      }
    }

    if (filter.is_resolved !== undefined && filter.is_resolved !== null) {
      clauses.push('is_resolved = @is_resolved');
      params.is_resolved = filter.is_resolved ? 1 : 0;
    }

    if (filter.query || filter.keyword || filter.search) {
      const kw = filter.query || filter.keyword || filter.search;
      clauses.push('(title LIKE @kw OR message LIKE @kw OR anomaly_rule_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const validSortColumns = new Set(['id', 'severity', 'created_at', 'anomaly_rule_id']);
    const orderBy = validSortColumns.has(filter.orderBy) ? filter.orderBy : 'id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `SELECT * FROM anomaly_reports ${whereClause} ORDER BY ${orderBy} ${direction}`;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._hydrateAnomaly(r));
  }

  /**
   * Count anomalies matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.scan_session_id || filter.scanSessionId) {
      clauses.push('scan_session_id = @session_id');
      params.session_id = filter.scan_session_id || filter.scanSessionId;
    }
    if (filter.severity) {
      clauses.push('severity = @severity');
      params.severity = String(filter.severity).toUpperCase();
    }
    if (filter.anomaly_rule_id || filter.ruleId) {
      clauses.push('anomaly_rule_id = @rule_id');
      params.rule_id = filter.anomaly_rule_id || filter.ruleId;
    }
    if (filter.is_resolved !== undefined && filter.is_resolved !== null) {
      clauses.push('is_resolved = @is_resolved');
      params.is_resolved = filter.is_resolved ? 1 : 0;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM anomaly_reports ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Mark anomaly as resolved
   * @param {number} id
   * @returns {boolean}
   */
  resolve(id) {
    const stmt = this.db.prepare('UPDATE anomaly_reports SET is_resolved = 1 WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete anomaly by ID
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM anomaly_reports WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete all anomalies for a scan session
   * @param {string} scanSessionId
   * @returns {number}
   */
  deleteBySessionId(scanSessionId) {
    const stmt = this.db.prepare('DELETE FROM anomaly_reports WHERE scan_session_id = ?');
    const info = stmt.run(scanSessionId);
    return info.changes;
  }

  /**
   * Get counts breakdown by severity level
   * @param {string} [scanSessionId=null]
   * @returns {{ CRITICAL: number, HIGH: number, MEDIUM: number, LOW: number, INFO: number, total: number }}
   */
  getSummaryBySeverity(scanSessionId = null) {
    let sql = 'SELECT severity, COUNT(*) AS count FROM anomaly_reports';
    const params = [];
    if (scanSessionId) {
      sql += ' WHERE scan_session_id = ?';
      params.push(scanSessionId);
    }
    sql += ' GROUP BY severity';

    const rows = this.db.prepare(sql).all(...params);
    const summary = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0, total: 0 };
    for (const r of rows) {
      const sev = String(r.severity).toUpperCase();
      if (summary[sev] !== undefined) {
        summary[sev] = r.count;
      }
      summary.total += r.count;
    }
    return summary;
  }

  /**
   * Parse JSON columns in anomaly row
   * @private
   */
  _hydrateAnomaly(row) {
    let affectedFiles = [];
    let affectedEntities = [];
    let details = {};

    try {
      if (row.affected_file_paths_json) affectedFiles = JSON.parse(row.affected_file_paths_json);
    } catch {}

    try {
      if (row.affected_entity_ids_json) affectedEntities = JSON.parse(row.affected_entity_ids_json);
    } catch {}

    try {
      if (row.details_json) details = JSON.parse(row.details_json);
    } catch {}

    return {
      ...row,
      affectedFilePaths: affectedFiles,
      affectedEntityIds: affectedEntities,
      details
    };
  }

  // ==========================================================================
  // Scan Manifest Operations
  // ==========================================================================

  /**
   * Insert a scan manifest record
   * @param {object} data
   * @returns {object}
   */
  insertManifest(data) {
    const summaryJson = typeof data.manifest_summary_json === 'object' && data.manifest_summary_json !== null
      ? JSON.stringify(data.manifest_summary_json)
      : (data.manifest_summary_json || null);

    const record = {
      scan_session_id: data.scan_session_id || data.scanSessionId,
      vault_root_path: data.vault_root_path || data.vaultRootPath,
      scan_start_time: data.scan_start_time || data.scanStartTime || new Date().toISOString(),
      scan_end_time: data.scan_end_time || data.scanEndTime || null,
      scan_duration_ms: data.scan_duration_ms !== undefined ? Number(data.scan_duration_ms) : null,
      total_files_scanned: Number(data.total_files_scanned) || 0,
      files_added: Number(data.files_added) || 0,
      files_updated: Number(data.files_updated) || 0,
      files_unchanged: Number(data.files_unchanged) || 0,
      files_deleted: Number(data.files_deleted) || 0,
      total_entities_extracted: Number(data.total_entities_extracted) || 0,
      total_anomalies_detected: Number(data.total_anomalies_detected) || 0,
      manifest_summary_json: summaryJson
    };

    const sql = `
      INSERT INTO scan_manifests (
        scan_session_id, vault_root_path, scan_start_time, scan_end_time,
        scan_duration_ms, total_files_scanned, files_added, files_updated,
        files_unchanged, files_deleted, total_entities_extracted,
        total_anomalies_detected, manifest_summary_json, created_at
      ) VALUES (
        @scan_session_id, @vault_root_path, @scan_start_time, @scan_end_time,
        @scan_duration_ms, @total_files_scanned, @files_added, @files_updated,
        @files_unchanged, @files_deleted, @total_entities_extracted,
        @total_anomalies_detected, @manifest_summary_json, datetime('now', 'localtime')
      )
    `;

    const stmt = this.db.prepare(sql);
    stmt.run(record);
    return this.getManifestBySessionId(record.scan_session_id);
  }

  /**
   * Update an existing scan manifest
   * @param {string} scanSessionId
   * @param {object} updateData
   * @returns {object|null}
   */
  updateManifest(scanSessionId, updateData) {
    const fields = [];
    const params = { session_id: scanSessionId };

    if (updateData.scan_end_time !== undefined) {
      fields.push('scan_end_time = @scan_end_time');
      params.scan_end_time = updateData.scan_end_time;
    }
    if (updateData.scan_duration_ms !== undefined) {
      fields.push('scan_duration_ms = @scan_duration_ms');
      params.scan_duration_ms = Number(updateData.scan_duration_ms);
    }
    if (updateData.total_files_scanned !== undefined) {
      fields.push('total_files_scanned = @total_files_scanned');
      params.total_files_scanned = Number(updateData.total_files_scanned);
    }
    if (updateData.files_added !== undefined) {
      fields.push('files_added = @files_added');
      params.files_added = Number(updateData.files_added);
    }
    if (updateData.files_updated !== undefined) {
      fields.push('files_updated = @files_updated');
      params.files_updated = Number(updateData.files_updated);
    }
    if (updateData.files_unchanged !== undefined) {
      fields.push('files_unchanged = @files_unchanged');
      params.files_unchanged = Number(updateData.files_unchanged);
    }
    if (updateData.files_deleted !== undefined) {
      fields.push('files_deleted = @files_deleted');
      params.files_deleted = Number(updateData.files_deleted);
    }
    if (updateData.total_entities_extracted !== undefined) {
      fields.push('total_entities_extracted = @total_entities_extracted');
      params.total_entities_extracted = Number(updateData.total_entities_extracted);
    }
    if (updateData.total_anomalies_detected !== undefined) {
      fields.push('total_anomalies_detected = @total_anomalies_detected');
      params.total_anomalies_detected = Number(updateData.total_anomalies_detected);
    }
    if (updateData.manifest_summary_json !== undefined) {
      fields.push('manifest_summary_json = @manifest_summary_json');
      params.manifest_summary_json = typeof updateData.manifest_summary_json === 'object'
        ? JSON.stringify(updateData.manifest_summary_json)
        : updateData.manifest_summary_json;
    }

    if (fields.length === 0) {
      return this.getManifestBySessionId(scanSessionId);
    }

    const sql = `UPDATE scan_manifests SET ${fields.join(', ')} WHERE scan_session_id = @session_id`;
    this.db.prepare(sql).run(params);
    return this.getManifestBySessionId(scanSessionId);
  }

  /**
   * Retrieve scan manifest by session ID
   * @param {string} scanSessionId
   * @returns {object|null}
   */
  getManifestBySessionId(scanSessionId) {
    const stmt = this.db.prepare('SELECT * FROM scan_manifests WHERE scan_session_id = ?');
    return stmt.get(scanSessionId) || null;
  }

  /**
   * Retrieve most recent scan manifest
   * @returns {object|null}
   */
  getLatestManifest() {
    const stmt = this.db.prepare('SELECT * FROM scan_manifests ORDER BY id DESC LIMIT 1');
    return stmt.get() || null;
  }

  /**
   * List recent manifests
   * @param {number} [limit=10]
   * @returns {Array<object>}
   */
  queryManifests(limit = 10) {
    const stmt = this.db.prepare('SELECT * FROM scan_manifests ORDER BY id DESC LIMIT ?');
    return stmt.all(Math.max(1, parseInt(limit, 10) || 10));
  }
}

module.exports = AnomalyRepo;
