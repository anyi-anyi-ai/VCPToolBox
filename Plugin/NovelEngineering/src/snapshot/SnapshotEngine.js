/**
 * @file SnapshotEngine.js
 * @description Production-Grade Project Snapshot & Point-in-Time Recovery Engine (Phase 3 Milestone 5)
 * @module snapshot/SnapshotEngine
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { NovelError, GovernanceSafetyError, SecurityViolationError, SchemaMismatchError } = require('../errors');

class SnapshotEngine {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {string} [options.snapshotsDir]
   * @param {import('../security/PathGuard')} [options.pathGuard]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new NovelError('DatabaseManager is required for SnapshotEngine', 'INVALID_PARAMETER');
    }
    this.dbManager = dbManager;
    this.options = options;
    this.pathGuard = options.pathGuard || null;

    // Resolve snapshots directory safely inside sandbox
    if (options.snapshotsDir) {
      this.snapshotsDir = this.pathGuard
        ? this.pathGuard.assertSandboxPath(options.snapshotsDir, 'init snapshots dir')
        : path.resolve(options.snapshotsDir);
    } else if (this.pathGuard && this.pathGuard.pluginRoot) {
      this.snapshotsDir = path.join(this.pathGuard.pluginRoot, 'data', 'snapshots');
    } else {
      const base = dbManager.dbPath && dbManager.dbPath !== ':memory:'
        ? path.dirname(dbManager.dbPath)
        : 'data';
      this.snapshotsDir = path.resolve(base, 'snapshots');
    }
  }

  /**
   * Ensures snapshots directory exists within sandbox
   * @private
   */
  _ensureSnapshotsDir() {
    if (this.pathGuard) {
      this.pathGuard.assertSandboxPath(this.snapshotsDir, 'create snapshot directory');
    }
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
  }

  /**
   * Creates a comprehensive external project snapshot
   * @param {object} [params={}]
   * @param {string} [params.snapshotName]
   * @param {string} [params.description]
   * @param {boolean} [params.includeDrafts=true]
   * @param {boolean} [params.compress=false]
   * @returns {object}
   */
  createProjectSnapshot(params = {}) {
    this._ensureSnapshotsDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = (params.snapshotName || 'auto_backup').replace(/[^a-zA-Z0-9_-]/g, '_');
    const snapshotId = `snap_${timestamp}_${safeName}`;
    const isGzip = Boolean(params.compress || params.compressed);
    const extension = isGzip ? '.json.gz' : '.json';
    const filename = `${snapshotId}${extension}`;
    const snapshotPath = path.join(this.snapshotsDir, filename);

    if (this.pathGuard) {
      this.pathGuard.assertSandboxPath(snapshotPath, 'write snapshot');
    }

    const db = this.dbManager.getDatabase();
    const tableStats = {};
    const tableHashes = {};

    const tableNames = [
      'schema_version',
      'migration_history',
      'scan_manifests',
      'source_files',
      'entities',
      'entity_aliases',
      'file_entities',
      'entity_relations',
      'canon_changes',
      'chapters',
      'timeline_events',
      'foreshadowing',
      'anomaly_reports'
    ];

    const includeDrafts = params.includeDrafts !== false;
    const tablesData = {};

    for (const tbl of tableNames) {
      try {
        let sql = `SELECT * FROM "${tbl}"`;
        // Selective filtering if includeDrafts is false
        if (!includeDrafts) {
          if (tbl === 'source_files') {
            sql = `SELECT * FROM "source_files" WHERE status NOT IN ('draft', 'deleted') AND canon_level > 0`;
          } else if (tbl === 'entities') {
            sql = `SELECT * FROM "entities" WHERE status NOT IN ('draft', 'deleted') AND canon_level > 0`;
          } else if (tbl === 'chapters') {
            sql = `SELECT * FROM "chapters" WHERE canon = 1 OR status != 'draft'`;
          } else if (tbl === 'timeline_events') {
            sql = `SELECT * FROM "timeline_events" WHERE status != 'draft'`;
          }
        }

        const rows = db.prepare(sql).all();
        tablesData[tbl] = rows;
        tableStats[tbl] = rows.length;

        // Compute individual table SHA-256 hash
        const tblJson = JSON.stringify(rows);
        tableHashes[tbl] = crypto.createHash('sha256').update(tblJson, 'utf8').digest('hex');
      } catch (err) {
        tablesData[tbl] = [];
        tableStats[tbl] = 0;
        tableHashes[tbl] = crypto.createHash('sha256').update('[]', 'utf8').digest('hex');
      }
    }

    // Compute canonical integrity hash over all tables
    const tablesCanonicalJson = JSON.stringify(tablesData);
    const integrityHash = crypto.createHash('sha256').update(tablesCanonicalJson, 'utf8').digest('hex');

    const schemaVersion = this.dbManager.getSchemaVersion ? this.dbManager.getSchemaVersion() : 3;

    const payload = {
      format: 'NovelEngineering_Snapshot_v3',
      snapshotId,
      snapshotName: params.snapshotName || 'auto_backup',
      description: params.description || 'Full project snapshot archive',
      schemaVersion,
      createdAt: new Date().toISOString(),
      options: {
        includeDrafts,
        compressed: isGzip
      },
      tableStats,
      integrity: {
        algorithm: 'sha256',
        hash: integrityHash,
        tableHashes
      },
      integrityHash, // Root convenience field
      tables: tablesData
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    let fileSizeBytes = 0;

    if (isGzip) {
      const gzippedBuffer = zlib.gzipSync(Buffer.from(jsonStr, 'utf8'));
      fs.writeFileSync(snapshotPath, gzippedBuffer);
      fileSizeBytes = gzippedBuffer.length;
    } else {
      fs.writeFileSync(snapshotPath, jsonStr, 'utf8');
      fileSizeBytes = Buffer.byteLength(jsonStr, 'utf8');
    }

    return {
      snapshotId,
      snapshotPath: snapshotPath.replace(/\\/g, '/'),
      fileSizeBytes,
      tableStats,
      integrityHash,
      createdAt: payload.createdAt
    };
  }

  /**
   * Previews restoration diff against current database
   * @param {object} params
   * @param {string} [params.snapshotId]
   * @param {string} [params.snapshotPath]
   * @returns {object}
   */
  restoreProjectSnapshotPreview(params = {}) {
    const filePath = this._resolveSnapshotPath(params);
    const snapshotData = this._readSnapshotFile(filePath);

    // Validate Snapshot Schema
    if (!snapshotData || typeof snapshotData !== 'object' || !snapshotData.tables) {
      throw new NovelError('Invalid snapshot format: missing tables definition.', 'INVALID_SNAPSHOT_SCHEMA', { filePath });
    }

    // Validate SHA-256 Integrity Hash
    let integrityValid = true;
    let integrityMismatchDetails = null;
    const expectedHash = snapshotData.integrityHash || (snapshotData.integrity ? snapshotData.integrity.hash : null);

    if (expectedHash && snapshotData.tables) {
      const computedHash = crypto.createHash('sha256').update(JSON.stringify(snapshotData.tables), 'utf8').digest('hex');
      if (computedHash !== expectedHash) {
        integrityValid = false;
        integrityMismatchDetails = {
          expected: expectedHash,
          computed: computedHash
        };
      }
    }

    const db = this.dbManager.getDatabase();
    const currentStats = {};

    const tableNames = [
      'source_files',
      'entities',
      'entity_aliases',
      'file_entities',
      'entity_relations',
      'chapters',
      'timeline_events',
      'foreshadowing',
      'anomaly_reports',
      'canon_changes',
      'scan_manifests'
    ];

    for (const tbl of tableNames) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as c FROM "${tbl}"`).get().c;
        currentStats[tbl] = count;
      } catch {
        currentStats[tbl] = 0;
      }
    }

    const currentSchemaVersion = this.dbManager.getSchemaVersion ? this.dbManager.getSchemaVersion() : 3;
    const snapshotSchemaVersion = snapshotData.schemaVersion || 0;
    const schemaVersionMatch = currentSchemaVersion === snapshotSchemaVersion;

    const filesDelta = {
      live: currentStats.source_files || 0,
      snapshot: snapshotData.tableStats ? (snapshotData.tableStats.source_files || 0) : 0
    };
    filesDelta.diff = filesDelta.snapshot - filesDelta.live;

    const entitiesDelta = {
      live: currentStats.entities || 0,
      snapshot: snapshotData.tableStats ? (snapshotData.tableStats.entities || 0) : 0
    };
    entitiesDelta.diff = entitiesDelta.snapshot - entitiesDelta.live;

    const relationsDelta = {
      live: currentStats.entity_relations || 0,
      snapshot: snapshotData.tableStats ? (snapshotData.tableStats.entity_relations || 0) : 0
    };
    relationsDelta.diff = relationsDelta.snapshot - relationsDelta.live;

    const chaptersDelta = {
      live: currentStats.chapters || 0,
      snapshot: snapshotData.tableStats ? (snapshotData.tableStats.chapters || 0) : 0
    };
    chaptersDelta.diff = chaptersDelta.snapshot - chaptersDelta.live;

    const timelineDelta = {
      live: currentStats.timeline_events || 0,
      snapshot: snapshotData.tableStats ? (snapshotData.tableStats.timeline_events || 0) : 0
    };
    timelineDelta.diff = timelineDelta.snapshot - timelineDelta.live;

    const foreshadowingDelta = {
      live: currentStats.foreshadowing || 0,
      snapshot: snapshotData.tableStats ? (snapshotData.tableStats.foreshadowing || 0) : 0
    };
    foreshadowingDelta.diff = foreshadowingDelta.snapshot - foreshadowingDelta.live;

    const warnings = [];
    if (!schemaVersionMatch) {
      warnings.push(`Schema version mismatch: Live database is v${currentSchemaVersion}, but snapshot is v${snapshotSchemaVersion}. Restoration may cause compatibility errors.`);
    }
    if (!integrityValid) {
      warnings.push('CRITICAL: Snapshot integrity check failed! SHA-256 hash mismatch detected. Archive may be corrupted or tampered with.');
    }

    const safeToRestore = schemaVersionMatch && integrityValid;

    let fileSizeBytes = 0;
    try {
      fileSizeBytes = fs.statSync(filePath).size;
    } catch (_) {}

    return {
      previewOnly: true,
      snapshotMeta: {
        snapshotId: snapshotData.snapshotId,
        snapshotName: snapshotData.snapshotName,
        createdAt: snapshotData.createdAt,
        schemaVersion: snapshotSchemaVersion,
        description: snapshotData.description,
        integrityHash: expectedHash,
        fileSizeBytes,
        filePath: filePath.replace(/\\/g, '/')
      },
      currentVsSnapshotDiff: {
        schemaVersionMatch,
        currentSchemaVersion,
        snapshotSchemaVersion,
        integrityValid,
        integrityMismatchDetails,
        filesDelta,
        entitiesDelta,
        relationsDelta,
        chaptersDelta,
        timelineDelta,
        foreshadowingDelta,
        currentStats,
        snapshotStats: snapshotData.tableStats
      },
      warnings,
      safeToRestore,
      requiredConfirmationToken: 'CONFIRM_RESTORE',
      instructions: 'To restore, call RestoreProjectSnapshot with confirmationToken: "CONFIRM_RESTORE".'
    };
  }

  /**
   * Executes confirmed restoration inside an atomic transaction
   * @param {object} params
   * @param {string} [params.snapshotId]
   * @param {string} [params.snapshotPath]
   * @param {string} params.confirmationToken
   * @param {string} [params.operator='system']
   * @param {string} [params.reason]
   * @returns {object}
   */
  restoreProjectSnapshot(params = {}) {
    const token = params.confirmationToken || params.token;
    if (token !== 'CONFIRM_RESTORE' && token !== 'CONFIRM_CANON_CHANGE') {
      throw new GovernanceSafetyError(
        'Restoring a project snapshot will overwrite existing database records. Parameter confirmationToken: "CONFIRM_RESTORE" is mandatory.',
        'GOVERNANCE_CONFIRMATION_REQUIRED',
        { requiredToken: 'CONFIRM_RESTORE' }
      );
    }

    const filePath = this._resolveSnapshotPath(params);
    const snapshotData = this._readSnapshotFile(filePath);

    // Verify integrity before restore
    const expectedHash = snapshotData.integrityHash || (snapshotData.integrity ? snapshotData.integrity.hash : null);
    if (expectedHash && snapshotData.tables) {
      const computedHash = crypto.createHash('sha256').update(JSON.stringify(snapshotData.tables), 'utf8').digest('hex');
      if (computedHash !== expectedHash) {
        throw new NovelError(
          'Snapshot integrity check failed: SHA-256 mismatch. Refusing to restore corrupted snapshot.',
          'SNAPSHOT_INTEGRITY_MISMATCH',
          { expected: expectedHash, computed: computedHash }
        );
      }
    }

    const startTime = Date.now();
    const db = this.dbManager.getDatabase();
    const restoredTables = {};
    let totalRestoredRecords = 0;

    // Truncation order (reverse dependency order)
    const deletionOrder = [
      'anomaly_reports',
      'foreshadowing',
      'timeline_events',
      'chapters',
      'canon_changes',
      'entity_relations',
      'file_entities',
      'entity_aliases',
      'entities',
      'source_files',
      'scan_manifests'
    ];

    // Insertion order (dependency order)
    const insertionOrder = [
      'scan_manifests',
      'source_files',
      'entities',
      'entity_aliases',
      'file_entities',
      'entity_relations',
      'canon_changes',
      'chapters',
      'timeline_events',
      'foreshadowing',
      'anomaly_reports'
    ];

    db.pragma('foreign_keys = OFF');
    try {
      const restoreTx = db.transaction(() => {
        // Clear existing records in deletion order
        for (const tbl of deletionOrder) {
          try {
            db.prepare(`DELETE FROM "${tbl}"`).run();
            try {
              db.prepare(`DELETE FROM sqlite_sequence WHERE name = '${tbl}'`).run();
            } catch (_) {}
          } catch (err) {
            console.warn(`[SnapshotEngine] Warning clearing table ${tbl}: ${err.message}`);
          }
        }

        // Re-insert data in insertion order
        for (const tbl of insertionOrder) {
          const rows = snapshotData.tables ? snapshotData.tables[tbl] : null;
          if (Array.isArray(rows) && rows.length > 0) {
            const sample = rows[0];
            const cols = Object.keys(sample);
            const quotedCols = cols.map(c => `"${c}"`).join(',');
            const placeholders = cols.map(() => '?').join(',');
            const insertStmt = db.prepare(`INSERT INTO "${tbl}" (${quotedCols}) VALUES (${placeholders})`);

            for (const row of rows) {
              const vals = cols.map(c => row[c]);
              insertStmt.run(...vals);
            }
            restoredTables[tbl] = rows.length;
            totalRestoredRecords += rows.length;
          } else {
            restoredTables[tbl] = 0;
          }
        }

        // Log restoration to canon_changes audit trail
        try {
          const auditStmt = db.prepare(`
            INSERT INTO canon_changes (
              change_type, target_type, target_id, confirmation_token, confirmed_by_flag,
              operator, reason, impact_summary_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
          `);
          auditStmt.run(
            'RESTORE_SNAPSHOT',
            'project_snapshot',
            snapshotData.snapshotId,
            token,
            1,
            params.operator || 'system',
            params.reason || `Restored from project snapshot ${snapshotData.snapshotId}`,
            JSON.stringify({ restoredTables, totalRestoredRecords })
          );
        } catch (err) {
          console.warn(`[SnapshotEngine] Warning logging restore to canon_changes: ${err.message}`);
        }
      });

      restoreTx();
    } finally {
      // Re-enable foreign keys
      try {
        db.pragma('foreign_keys = ON');
      } catch (_) {}
    }
    const durationMs = Date.now() - startTime;

    return {
      success: true,
      snapshotId: snapshotData.snapshotId,
      restoredTables,
      totalRestoredRecords,
      durationMs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Reads snapshot file with transparent Gzip decompression
   * @private
   * @param {string} filePath
   * @returns {object}
   */
  _readSnapshotFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new NovelError(`Snapshot file not found: ${filePath}`, 'SNAPSHOT_NOT_FOUND', { filePath });
    }

    const buffer = fs.readFileSync(filePath);
    let jsonStr = '';

    // Check gzip magic bytes (0x1f, 0x8b) or .gz extension
    if ((buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) || filePath.endsWith('.gz')) {
      try {
        jsonStr = zlib.gunzipSync(buffer).toString('utf8');
      } catch (err) {
        throw new NovelError(`Failed to decompress gzip snapshot: ${err.message}`, 'SNAPSHOT_DECOMPRESS_FAILED', { filePath });
      }
    } else {
      jsonStr = buffer.toString('utf8');
    }

    try {
      return JSON.parse(jsonStr);
    } catch (err) {
      throw new NovelError(`Failed to parse snapshot JSON: ${err.message}`, 'SNAPSHOT_PARSE_FAILED', { filePath });
    }
  }

  /**
   * Resolves snapshot file path
   * @private
   * @param {object} params
   * @returns {string}
   */
  _resolveSnapshotPath(params = {}) {
    if (params.snapshotPath) {
      if (this.pathGuard) {
        return this.pathGuard.assertSandboxPath(params.snapshotPath, 'read snapshot');
      }
      return path.resolve(params.snapshotPath);
    }

    this._ensureSnapshotsDir();

    if (params.snapshotId) {
      const snapJson = path.join(this.snapshotsDir, `${params.snapshotId}.json`);
      if (fs.existsSync(snapJson)) return snapJson;

      const snapGz = path.join(this.snapshotsDir, `${params.snapshotId}.json.gz`);
      if (fs.existsSync(snapGz)) return snapGz;
    }

    // Search snapshotsDir for matching ID or most recent
    const files = fs.readdirSync(this.snapshotsDir).filter(f => f.endsWith('.json') || f.endsWith('.json.gz'));
    if (files.length === 0) {
      throw new NovelError('No snapshots found in snapshots directory.', 'SNAPSHOT_NOT_FOUND', { snapshotsDir: this.snapshotsDir });
    }

    if (params.snapshotId) {
      const match = files.find(f => f.includes(params.snapshotId));
      if (match) return path.join(this.snapshotsDir, match);
    }

    // Default to most recent file (sorted alphabetically/timestamped desc)
    files.sort().reverse();
    return path.join(this.snapshotsDir, files[0]);
  }
}

module.exports = SnapshotEngine;
