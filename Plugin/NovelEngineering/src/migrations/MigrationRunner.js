/**
 * @file MigrationRunner.js
 * @description File-based SQLite Schema Migration Engine for VCPNovelManager Phase 3
 * @module migrations/MigrationRunner
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { SchemaMismatchError, MigrationError } = require('../errors');

class MigrationRunner {
  /**
   * Compute SHA-256 hash of a file or string buffer
   * @param {string} filePathOrContent
   * @param {boolean} [isContent=false]
   * @returns {string}
   */
  static computeChecksum(filePathOrContent, isContent = false) {
    const hash = crypto.createHash('sha256');
    if (isContent) {
      hash.update(filePathOrContent, 'utf8');
    } else {
      const buffer = fs.readFileSync(filePathOrContent);
      hash.update(buffer);
    }
    return hash.digest('hex');
  }

  /**
   * Initializes schema_version and migration_history tables if they do not exist
   * @param {import('better-sqlite3').Database} db
   */
  static ensureMigrationTables(db) {
    if (!db || !db.open) {
      throw new SchemaMismatchError('Database connection is not open', { stage: 'ensureMigrationTables' });
    }

    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
          description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS migration_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version INTEGER NOT NULL,
          migration_file TEXT NOT NULL,
          checksum TEXT NOT NULL,
          applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
          duration_ms INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'success',
          error_message TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_migration_history_version ON migration_history(version);
    `);
  }

  /**
   * Discover and sort all migration files in the migrations directory
   * @param {string} migrationsDir
   * @returns {Array<{ version: number, name: string, type: 'sql'|'js', filename: string, filepath: string }>}
   */
  static discoverMigrations(migrationsDir) {
    if (!fs.existsSync(migrationsDir)) {
      throw new SchemaMismatchError(`Migrations directory not found: ${migrationsDir}`, { migrationsDir });
    }

    const files = fs.readdirSync(migrationsDir);
    const pattern = /^(\d+)_([\w-]+)\.(sql|js)$/i;
    const migrations = [];
    const seenVersions = new Set();

    for (const filename of files) {
      const match = filename.match(pattern);
      if (!match) continue;

      const version = parseInt(match[1], 10);
      const name = match[2];
      const type = match[3].toLowerCase();
      const filepath = path.join(migrationsDir, filename);

      if (seenVersions.has(version)) {
        throw new SchemaMismatchError(`Duplicate migration version detected: ${version} in file ${filename}`, {
          version,
          filename
        });
      }
      seenVersions.add(version);

      migrations.push({
        version,
        name,
        type,
        filename,
        filepath
      });
    }

    // Sort ascending by version number
    migrations.sort((a, b) => a.version - b.version);
    return migrations;
  }

  /**
   * Get current applied schema version
   * @param {import('better-sqlite3').Database} db
   * @returns {number}
   */
  static getCurrentVersion(db) {
    this.ensureMigrationTables(db);
    const row = db.prepare('SELECT MAX(version) AS current_version FROM schema_version').get();
    return row && row.current_version !== null && row.current_version !== undefined ? Number(row.current_version) : 0;
  }

  /**
   * Retrieve all applied migration history records
   * @param {import('better-sqlite3').Database} db
   * @returns {Array<object>}
   */
  static getMigrationHistory(db) {
    this.ensureMigrationTables(db);
    return db.prepare('SELECT * FROM migration_history ORDER BY id ASC').all();
  }

  /**
   * Detect legacy Phase 1 / Phase 2 databases without schema_version and establish baseline
   * @param {import('better-sqlite3').Database} db
   * @param {Array<object>} availableMigrations
   * @returns {number} Baseline version recorded (0 if clean DB)
   */
  static detectBaseline(db, availableMigrations = []) {
    this.ensureMigrationTables(db);

    const versionCountRow = db.prepare('SELECT COUNT(*) AS cnt FROM schema_version').get();
    if (versionCountRow && versionCountRow.cnt > 0) {
      return this.getCurrentVersion(db);
    }

    // Check if any domain tables exist in the database (excluding SQLite internal and migration tables)
    const domainTables = db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT IN ('schema_version', 'migration_history')"
    ).all().map(r => r.name);

    if (domainTables.length === 0) {
      return 0; // Fresh database
    }

    let baselineVersion = 1;
    let baselineDescription = 'Baseline legacy Phase 1 database';

    // Check if Phase 4 is already in place
    const hasCanonQueue = domainTables.includes('canon_changes_queue');
    const hasContextTraces = domainTables.includes('context_traces');
    if (hasCanonQueue || hasContextTraces) {
      baselineVersion = 4;
      baselineDescription = 'Baseline legacy Phase 4 database';
    } else {
      // Check if Phase 3 is already in place
      const hasEntityRelations = domainTables.includes('entity_relations');
      let hasCanonLevel = false;
      if (domainTables.includes('source_files')) {
        const sfCols = db.pragma('table_info(source_files)');
        hasCanonLevel = Array.isArray(sfCols) && sfCols.some(c => c.name === 'canon_level');
      }

      if (hasEntityRelations || hasCanonLevel) {
        baselineVersion = 3;
        baselineDescription = 'Baseline legacy Phase 3 database';
      } else {
        // Check if Phase 2 extensions exist
        let hasPhase2 = false;
        if (domainTables.includes('timeline_events')) {
          const cols = db.pragma('table_info(timeline_events)');
          hasPhase2 = Array.isArray(cols) && cols.some((c) => c.name === 'time_type');
        }
        if (!hasPhase2 && domainTables.includes('foreshadowing')) {
          const cols = db.pragma('table_info(foreshadowing)');
          hasPhase2 = Array.isArray(cols) && cols.some((c) => c.name === 'introduced_chapter');
        }
        if (hasPhase2) {
          baselineVersion = 2;
          baselineDescription = 'Baseline legacy Phase 2 database';
        }
      }
    }

    // Ensure all baseline tables from migration 001 exist if missing, so subsequent ALTER TABLE statements will succeed
    const mig1 = availableMigrations.find(m => m.version === 1);
    if (mig1 && fs.existsSync(mig1.filepath)) {
      const mig1Sql = fs.readFileSync(mig1.filepath, 'utf8');
      const tableStatements = mig1Sql
        .split(';')
        .map((s) => s.replace(/--[^\r\n]*/g, '').trim())
        .filter((s) => s.toUpperCase().startsWith('CREATE TABLE IF NOT EXISTS'));
      for (const stmt of tableStatements) {
        try {
          db.exec(stmt);
        } catch (_) {}
      }
    }

    // Record baseline in schema_version and migration_history
    const tx = db.transaction(() => {
      for (let v = 1; v <= baselineVersion; v++) {
        const mig = availableMigrations.find((m) => m.version === v);
        const filename = mig ? mig.filename : `00${v}_baseline.sql`;
        const checksum = mig && fs.existsSync(mig.filepath) ? this.computeChecksum(mig.filepath) : 'baseline';

        db.prepare(`
          INSERT INTO migration_history (version, migration_file, checksum, applied_at, duration_ms, status, error_message)
          VALUES (?, ?, ?, datetime('now', 'localtime'), 0, 'success', NULL)
        `).run(v, filename, checksum);

        db.prepare(`
          INSERT INTO schema_version (version, applied_at, description)
          VALUES (?, datetime('now', 'localtime'), ?)
          ON CONFLICT(version) DO UPDATE SET
            applied_at = excluded.applied_at,
            description = excluded.description
        `).run(v, `${baselineDescription} (v${v})`);
      }
    });

    tx();
    return baselineVersion;
  }

  /**
   * Execute all pending migrations sequentially inside transactions
   * @param {import('better-sqlite3').Database} db
   * @param {string} [migrationsDir]
   * @param {object} [options={}]
   * @param {boolean} [options.verifyTamper=true]
   * @param {boolean} [options.verifyFinalSchema=true]
   * @returns {{ currentVersion: number, applied: Array<object>, alreadyUpToDate: boolean, durationMs: number }}
   */
  static runMigrations(db, migrationsDir, options = {}) {
    const startTime = Date.now();
    const targetDir = migrationsDir || path.resolve(__dirname);
    const verifyTamper = options.verifyTamper !== false;
    const verifyFinalSchema = options.verifyFinalSchema !== false;

    if (!db || !db.open) {
      throw new SchemaMismatchError('Database must be open to execute migrations', { migrationsDir: targetDir });
    }

    this.ensureMigrationTables(db);
    const availableMigrations = this.discoverMigrations(targetDir);

    // Detect baseline if existing database lacks schema_version
    this.detectBaseline(db, availableMigrations);

    const currentVersion = this.getCurrentVersion(db);

    // Verify tamper on already applied migrations
    if (verifyTamper) {
      const appliedHistory = db.prepare(
        "SELECT * FROM migration_history WHERE status = 'success' ORDER BY version ASC"
      ).all();

      for (const record of appliedHistory) {
        const mig = availableMigrations.find((m) => m.version === record.version);
        if (mig && record.checksum !== 'baseline') {
          const currentHash = this.computeChecksum(mig.filepath);
          if (currentHash !== record.checksum) {
            throw new SchemaMismatchError(
              `Migration file tampering detected for version ${record.version} (${record.migration_file}). Expected checksum ${record.checksum}, but got ${currentHash}`,
              {
                version: record.version,
                migration_file: record.migration_file,
                expectedChecksum: record.checksum,
                actualChecksum: currentHash
              }
            );
          }
        }
      }
    }

    // Filter pending migrations
    const pendingMigrations = availableMigrations.filter((m) => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      if (verifyFinalSchema) {
        this.verifySchema(db);
      }
      return {
        currentVersion,
        applied: [],
        alreadyUpToDate: true,
        durationMs: Date.now() - startTime
      };
    }

    const appliedResults = [];

    for (const migration of pendingMigrations) {
      const checksum = this.computeChecksum(migration.filepath);
      const migStartTime = Date.now();

      const executeSingle = db.transaction(() => {
        if (migration.type === 'sql') {
          const sql = fs.readFileSync(migration.filepath, 'utf8');
          // Execute statements, tolerating duplicate column/index additions if already present
          const statements = sql
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          for (const stmt of statements) {
            try {
              db.exec(stmt);
            } catch (stmtErr) {
              if (
                stmtErr.message &&
                (stmtErr.message.includes('duplicate column name') ||
                 stmtErr.message.includes('already exists'))
              ) {
                // Safely ignore duplicate column or index already existing
                continue;
              }
              throw stmtErr;
            }
          }
        } else if (migration.type === 'js') {
          const script = require(migration.filepath);
          if (typeof script.up === 'function') {
            script.up(db);
          } else if (typeof script === 'function') {
            script(db);
          } else {
            throw new Error(`Migration script ${migration.filename} does not export an up(db) function`);
          }
        }

        const durationMs = Date.now() - migStartTime;

        // Record in migration_history
        db.prepare(`
          INSERT INTO migration_history (version, migration_file, checksum, applied_at, duration_ms, status, error_message)
          VALUES (?, ?, ?, datetime('now', 'localtime'), ?, 'success', NULL)
        `).run(migration.version, migration.filename, checksum, durationMs);

        // Record in schema_version
        db.prepare(`
          INSERT INTO schema_version (version, applied_at, description)
          VALUES (?, datetime('now', 'localtime'), ?)
          ON CONFLICT(version) DO UPDATE SET
            applied_at = excluded.applied_at,
            description = excluded.description
        `).run(migration.version, migration.name);

        return {
          version: migration.version,
          file: migration.filename,
          checksum,
          durationMs
        };
      });

      try {
        const res = executeSingle();
        appliedResults.push(res);
      } catch (err) {
        const durationMs = Date.now() - migStartTime;
        // Record failure in migration_history outside the transaction
        try {
          db.prepare(`
            INSERT INTO migration_history (version, migration_file, checksum, applied_at, duration_ms, status, error_message)
            VALUES (?, ?, ?, datetime('now', 'localtime'), ?, 'failed', ?)
          `).run(migration.version, migration.filename, checksum, durationMs, err.message);
        } catch (_) {}

        throw new MigrationError(
          `Migration failed at version ${migration.version} (${migration.filename}): ${err.message}`,
          {
            version: migration.version,
            migrationFile: migration.filename,
            originalError: err.message
          }
        );
      }
    }

    const newVersion = this.getCurrentVersion(db);

    if (verifyFinalSchema) {
      this.verifySchema(db);
    }

    return {
      currentVersion: newVersion,
      applied: appliedResults,
      alreadyUpToDate: false,
      durationMs: Date.now() - startTime
    };
  }

  /**
   * Verify schema integrity across all required Phase 3 tables and columns
   * @param {import('better-sqlite3').Database} db
   */
  static verifySchema(db) {
    if (!db || !db.open) {
      throw new SchemaMismatchError('Cannot verify schema: database is closed');
    }

    const requiredTables = [
      'schema_version',
      'migration_history',
      'source_files',
      'entities',
      'entity_aliases',
      'file_entities',
      'entity_relations',
      'timeline_events',
      'chapters',
      'foreshadowing',
      'anomaly_reports',
      'canon_changes',
      'scan_manifests',
      'canon_changes_queue',
      'context_traces'
    ];

    const existingTables = new Set(
      db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map((r) => r.name)
    );

    const missingTables = requiredTables.filter((t) => !existingTables.has(t));
    if (missingTables.length > 0) {
      throw new SchemaMismatchError(
        `Database schema integrity violation: missing required tables [${missingTables.join(', ')}]`,
        {
          missingTables,
          expectedTables: requiredTables,
          existingTables: Array.from(existingTables)
        }
      );
    }

    // Verify critical columns
    const sourceCols = new Set(db.pragma('table_info(source_files)').map((c) => c.name));
    if (!sourceCols.has('canon_level')) {
      throw new SchemaMismatchError('source_files table is missing "canon_level" column', { table: 'source_files', missingColumn: 'canon_level' });
    }

    const entityCols = new Set(db.pragma('table_info(entities)').map((c) => c.name));
    if (!entityCols.has('canon_level')) {
      throw new SchemaMismatchError('entities table is missing "canon_level" column', { table: 'entities', missingColumn: 'canon_level' });
    }

    const timelineCols = new Set(db.pragma('table_info(timeline_events)').map((c) => c.name));
    if (!timelineCols.has('time_type')) {
      throw new SchemaMismatchError('timeline_events table is missing "time_type" column', { table: 'timeline_events', missingColumn: 'time_type' });
    }

    const foreshadowCols = new Set(db.pragma('table_info(foreshadowing)').map((c) => c.name));
    if (!foreshadowCols.has('introduced_chapter')) {
      throw new SchemaMismatchError('foreshadowing table is missing "introduced_chapter" column', { table: 'foreshadowing', missingColumn: 'introduced_chapter' });
    }

    const relationCols = new Set(db.pragma('table_info(entity_relations)').map((c) => c.name));
    if (!relationCols.has('relation_type')) {
      throw new SchemaMismatchError('entity_relations table is missing "relation_type" column', { table: 'entity_relations', missingColumn: 'relation_type' });
    }

    const canonCols = new Set(db.pragma('table_info(canon_changes)').map((c) => c.name));
    if (!canonCols.has('confirmation_token') && !canonCols.has('confirmed_by_flag')) {
      throw new SchemaMismatchError('canon_changes table is missing confirmation token column', { table: 'canon_changes' });
    }

    const queueCols = new Set(db.pragma('table_info(canon_changes_queue)').map((c) => c.name));
    if (!queueCols.has('queue_id') || !queueCols.has('status') || !queueCols.has('proposed_changes_json')) {
      throw new SchemaMismatchError('canon_changes_queue table is missing required columns', { table: 'canon_changes_queue' });
    }

    const traceCols = new Set(db.pragma('table_info(context_traces)').map((c) => c.name));
    if (!traceCols.has('trace_id') || !traceCols.has('snapshot_id') || !traceCols.has('trace_items_json')) {
      throw new SchemaMismatchError('context_traces table is missing required columns', { table: 'context_traces' });
    }
  }
}

module.exports = MigrationRunner;
