/**
 * @file DatabaseManager.js
 * @description SQLite Connection & Repository Orchestrator for VCPNovelManager
 * @module db/DatabaseManager
 */

'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { PathGuard } = require('../security/PathGuard');

const SourceFileRepo = require('./repositories/SourceFileRepo');
const EntityRepo = require('./repositories/EntityRepo');
const TimelineRepo = require('./repositories/TimelineRepo');
const ChapterRepo = require('./repositories/ChapterRepo');
const ForeshadowingRepo = require('./repositories/ForeshadowingRepo');
const AnomalyRepo = require('./repositories/AnomalyRepo');

class DatabaseManager {
  /**
   * @param {string} [dbPath='data/novel_index.db'] - Absolute, relative path, or ':memory:'
   * @param {object} [options={}]
   * @param {PathGuard} [options.pathGuard] - Optional PathGuard instance
   * @param {boolean} [options.autoInit=true] - Automatically execute schema DDL
   * @param {boolean} [options.readOnly=false] - Open database in read-only mode
   */
  constructor(dbPath = 'data/novel_index.db', options = {}) {
    this.rawPath = dbPath;
    this.options = options;
    this.pathGuard = options.pathGuard || new PathGuard();
    this.isMemory = dbPath === ':memory:';

    this.db = null;
    this.resolvedPath = null;

    // Repositories
    this.sourceFiles = null;
    this.entities = null;
    this.timeline = null;
    this.chapters = null;
    this.foreshadowing = null;
    this.anomalies = null;

    if (options.autoInit !== false) {
      this.init();
    }
  }

  /**
   * Static factory to initialize a DatabaseManager
   * @param {string} [dbPath='data/novel_index.db']
   * @param {object} [options={}]
   * @returns {DatabaseManager}
   */
  static initDatabase(dbPath = 'data/novel_index.db', options = {}) {
    const manager = new DatabaseManager(dbPath, { ...options, autoInit: true });
    return manager;
  }

  /**
   * Initializes the SQLite connection, enforces PRAGMAs, and executes DDL schema
   */
  init() {
    if (this.db && this.db.open) {
      return this;
    }

    if (this.isMemory) {
      this.resolvedPath = ':memory:';
      this.db = new Database(':memory:');
    } else {
      // Resolve path
      const candidatePath = path.isAbsolute(this.rawPath)
        ? this.rawPath
        : path.resolve(this.pathGuard.pluginRoot, this.rawPath);

      // Validate write sandbox via PathGuard
      this.resolvedPath = this.pathGuard.assertWritablePath(candidatePath, 'open_database');

      // Ensure directory exists
      const dir = path.dirname(this.resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(this.resolvedPath, {
        readonly: !!this.options.readOnly,
        fileMustExist: !!this.options.fileMustExist,
        timeout: 5000
      });
    }

    // Apply production PRAGMAs
    this._applyPragmas();

    // Initialize schema tables
    this._initSchema();

    // Initialize typed repositories
    this.sourceFiles = new SourceFileRepo(this.db);
    this.entities = new EntityRepo(this.db);
    this.timeline = new TimelineRepo(this.db);
    this.chapters = new ChapterRepo(this.db);
    this.foreshadowing = new ForeshadowingRepo(this.db);
    this.anomalies = new AnomalyRepo(this.db);

    return this;
  }

  /**
   * Apply optimized SQLite PRAGMA settings
   * @private
   */
  _applyPragmas() {
    if (!this.isMemory && !this.options.readOnly) {
      this.db.pragma('journal_mode = WAL');
    }
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('busy_timeout = 5000');
    this.db.pragma('cache_size = -64000'); // 64MB cache
    this.db.pragma('temp_store = MEMORY');
  }

  /**
   * Load and execute DDL schema from schema.sql
   * @private
   */
  _initSchema() {
    if (this.options.readOnly) {
      return;
    }
    // 1. Run pre-migrations on existing tables before schema.sql creates indexes
    this._runMigrations();

    const schemaFile = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaFile)) {
      const sql = fs.readFileSync(schemaFile, 'utf8');
      this.db.exec(sql);
    } else {
      throw new Error(`Schema file not found at: ${schemaFile}`);
    }

    // 2. Run post-migrations to guarantee all indexes exist
    this._runMigrations();
  }

  /**
   * Run dynamic schema migrations for backward compatibility
   * @private
   */
  _runMigrations() {
    try {
      const tableColumnDefs = {
        chapters: [
          { name: 'volume_number', type: 'INTEGER NOT NULL DEFAULT 1' },
          { name: 'relative_path', type: "TEXT NOT NULL DEFAULT ''" },
          { name: 'source_file_id', type: 'INTEGER' },
          { name: 'word_count', type: 'INTEGER NOT NULL DEFAULT 0' },
          { name: 'status', type: "TEXT NOT NULL DEFAULT 'draft'" },
          { name: 'canon', type: 'INTEGER NOT NULL DEFAULT 0' },
          { name: 'timeline_start', type: 'REAL' },
          { name: 'timeline_end', type: 'REAL' },
          { name: 'pov_entity_id', type: 'INTEGER' },
          { name: 'summary', type: 'TEXT' }
        ],
        timeline_events: [
          { name: 'event_name', type: "TEXT NOT NULL DEFAULT ''" },
          { name: 'era_epoch', type: "TEXT NOT NULL DEFAULT 'CE'" },
          { name: 'timeline_year', type: 'INTEGER' },
          { name: 'timeline_month', type: 'INTEGER' },
          { name: 'timeline_day', type: 'INTEGER' },
          { name: 'relative_time_desc', type: 'TEXT' },
          { name: 'description', type: 'TEXT' },
          { name: 'source_file_id', type: 'INTEGER' },
          { name: 'primary_entity_id', type: 'INTEGER' },
          { name: 'participant_entity_ids_json', type: 'TEXT' },
          { name: 'causality_prerequisite_ids_json', type: 'TEXT' },
          { name: 'causality_consequence_ids_json', type: 'TEXT' },
          { name: 'status', type: "TEXT NOT NULL DEFAULT 'active'" },
          { name: 'time_type', type: "TEXT NOT NULL DEFAULT 'exact'" },
          { name: 'interval_start', type: 'REAL' },
          { name: 'interval_end', type: 'REAL' },
          { name: 'base_event_id', type: 'TEXT' },
          { name: 'relative_offset', type: 'REAL' },
          { name: 'fuzzy_time_desc', type: 'TEXT' },
          { name: 'time_point_json', type: 'TEXT' }
        ],
        foreshadowing: [
          { name: 'thread_key', type: 'TEXT' },
          { name: 'setup_file_id', type: 'INTEGER' },
          { name: 'setup_chapter_id', type: 'INTEGER' },
          { name: 'setup_line', type: 'INTEGER NOT NULL DEFAULT 1' },
          { name: 'setup_snippet', type: 'TEXT' },
          { name: 'resolution_file_id', type: 'INTEGER' },
          { name: 'resolution_chapter_id', type: 'INTEGER' },
          { name: 'resolution_line', type: 'INTEGER' },
          { name: 'resolution_snippet', type: 'TEXT' },
          { name: 'status', type: "TEXT NOT NULL DEFAULT 'open'" },
          { name: 'importance_level', type: "TEXT NOT NULL DEFAULT 'major'" },
          { name: 'introduced_chapter', type: 'TEXT' },
          { name: 'target_resolve_chapter', type: 'TEXT' },
          { name: 'actual_resolve_chapter', type: 'TEXT' },
          { name: 'related_entities_json', type: 'TEXT' },
          { name: 'resolution_notes', type: 'TEXT' }
        ],
        entities: [
          { name: 'category', type: 'TEXT' },
          { name: 'status', type: "TEXT NOT NULL DEFAULT 'active'" },
          { name: 'review_status', type: "TEXT NOT NULL DEFAULT 'unreviewed'" },
          { name: 'summary', type: 'TEXT' },
          { name: 'description', type: 'TEXT' },
          { name: 'attributes_json', type: 'TEXT' },
          { name: 'source_file_id', type: 'INTEGER' },
          { name: 'line_number', type: 'INTEGER NOT NULL DEFAULT 1' }
        ],
        source_files: [
          { name: 'relative_path', type: "TEXT NOT NULL DEFAULT ''" },
          { name: 'file_name', type: "TEXT NOT NULL DEFAULT ''" },
          { name: 'extension', type: "TEXT NOT NULL DEFAULT ''" },
          { name: 'size_bytes', type: 'INTEGER NOT NULL DEFAULT 0' },
          { name: 'mtime_ms', type: 'INTEGER NOT NULL DEFAULT 0' },
          { name: 'birthtime_ms', type: 'INTEGER NOT NULL DEFAULT 0' },
          { name: 'sha256_hash', type: "TEXT NOT NULL DEFAULT ''" },
          { name: 'source_category', type: "TEXT NOT NULL DEFAULT 'unclassified'" },
          { name: 'status', type: "TEXT NOT NULL DEFAULT 'active'" },
          { name: 'review_status', type: "TEXT NOT NULL DEFAULT 'unreviewed'" },
          { name: 'frontmatter_json', type: 'TEXT' },
          { name: 'ast_structure_json', type: 'TEXT' }
        ]
      };

      for (const [tableName, expectedCols] of Object.entries(tableColumnDefs)) {
        const existingCols = this.db.pragma(`table_info(${tableName})`);
        if (Array.isArray(existingCols) && existingCols.length > 0) {
          const colNames = new Set(existingCols.map(c => c.name));
          for (const col of expectedCols) {
            if (!colNames.has(col.name)) {
              try {
                this.db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type};`);
              } catch (_) {}
            }
          }
        }
      }

      // Ensure additional indexes exist
      try {
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_chapters_canon ON chapters(canon);');
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_timeline_time_type ON timeline_events(time_type);");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_timeline_interval ON timeline_events(interval_start, interval_end);");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_timeline_base_event ON timeline_events(base_event_id);");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_foreshadow_intro_chap ON foreshadowing(introduced_chapter);");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_foreshadow_target_chap ON foreshadowing(target_resolve_chapter);");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_foreshadow_actual_chap ON foreshadowing(actual_resolve_chapter);");
        this.db.exec("CREATE INDEX IF NOT EXISTS idx_file_entities_type ON file_entities(mention_type);");
      } catch (_) {}
    } catch (_) {}
  }

  /**
   * Run a function inside an ACID transaction
   * @param {Function} fn
   * @returns {*}
   */
  transaction(fn) {
    if (!this.db || !this.db.open) {
      throw new Error('Database is closed. Cannot execute transaction.');
    }
    const tx = this.db.transaction(fn);
    return tx;
  }

  /**
   * Execute raw SQL statements
   * @param {string} sql
   */
  exec(sql) {
    if (!this.db || !this.db.open) {
      throw new Error('Database is closed.');
    }
    return this.db.exec(sql);
  }

  /**
   * Prepares a SQL statement
   * @param {string} sql
   * @returns {import('better-sqlite3').Statement}
   */
  prepare(sql) {
    if (!this.db || !this.db.open) {
      throw new Error('Database is closed.');
    }
    return this.db.prepare(sql);
  }

  /**
   * Get underlying better-sqlite3 database instance
   * @returns {import('better-sqlite3').Database}
   */
  getDatabase() {
    return this.db;
  }

  /**
   * Check if connection is open
   * @returns {boolean}
   */
  isOpen() {
    return !!(this.db && this.db.open);
  }

  /**
   * Check if connection is closed
   * @returns {boolean}
   */
  isClosed() {
    return !this.isOpen();
  }

  /**
   * Safely closes the database connection
   */
  close() {
    if (this.db && this.db.open) {
      this.db.close();
    }
    this.db = null;
  }

  /**
   * Executes VACUUM on database
   */
  vacuum() {
    if (this.isOpen() && !this.isMemory) {
      this.db.exec('VACUUM;');
    }
  }

  /**
   * Executes WAL checkpoint
   * @param {'PASSIVE'|'FULL'|'RESTART'|'TRUNCATE'} [mode='PASSIVE']
   * @returns {object}
   */
  checkpoint(mode = 'PASSIVE') {
    if (this.isOpen() && !this.isMemory) {
      return this.db.pragma(`wal_checkpoint(${mode})`);
    }
    return null;
  }

  /**
   * Returns list of created table names
   * @returns {Array<string>}
   */
  getTableNames() {
    const rows = this.db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).all();
    return rows.map((r) => r.name);
  }

  /**
   * Collect comprehensive statistics across all database tables
   * @returns {object}
   */
  getStats() {
    if (!this.isOpen()) {
      return { status: 'closed' };
    }

    const tableNames = this.getTableNames();
    const tableCounts = {};
    for (const name of tableNames) {
      try {
        const res = this.db.prepare(`SELECT COUNT(*) AS count FROM "${name}"`).get();
        tableCounts[name] = res ? res.count : 0;
      } catch {
        tableCounts[name] = -1;
      }
    }

    let fileSizeBytes = 0;
    if (!this.isMemory && this.resolvedPath && fs.existsSync(this.resolvedPath)) {
      try {
        fileSizeBytes = fs.statSync(this.resolvedPath).size;
      } catch {}
    }

    let journalMode = 'unknown';
    let foreignKeys = 0;
    try {
      const jm = this.db.pragma('journal_mode');
      journalMode = jm && jm[0] ? jm[0].journal_mode : 'unknown';
      const fk = this.db.pragma('foreign_keys');
      foreignKeys = fk && fk[0] ? fk[0].foreign_keys : 0;
    } catch {}

    return {
      status: 'open',
      isMemory: this.isMemory,
      dbPath: this.resolvedPath,
      fileSizeBytes,
      journalMode,
      foreignKeysEnabled: foreignKeys === 1,
      tables: tableCounts,
      totalFiles: tableCounts.source_files || 0,
      totalEntities: tableCounts.entities || 0,
      totalAliases: tableCounts.entity_aliases || 0,
      totalTimelineEvents: tableCounts.timeline_events || 0,
      totalChapters: tableCounts.chapters || 0,
      totalForeshadowing: tableCounts.foreshadowing || 0,
      totalAnomalies: tableCounts.anomaly_reports || 0,
      totalManifests: tableCounts.scan_manifests || 0
    };
  }

  /**
   * Resets all tables by truncating data within a transaction
   */
  clearAllTables() {
    if (!this.isOpen()) return;

    const tables = [
      'anomaly_reports',
      'foreshadowing',
      'chapters',
      'timeline_events',
      'file_entities',
      'entity_aliases',
      'entities',
      'source_files',
      'scan_manifests'
    ];

    const tx = this.db.transaction(() => {
      this.db.pragma('foreign_keys = OFF');
      for (const table of tables) {
        this.db.prepare(`DELETE FROM ${table}`).run();
        this.db.prepare(`DELETE FROM sqlite_sequence WHERE name = '${table}'`).run();
      }
      this.db.pragma('foreign_keys = ON');
    });

    tx();
  }

  // ==========================================================================
  // High-Level Interface Contract Delegates (as per PROJECT.md)
  // ==========================================================================

  /**
   * Upsert a single source file record
   * @param {object} fileRecord
   * @returns {object}
   */
  upsertSourceFile(fileRecord) {
    return this.sourceFiles.upsert(fileRecord);
  }

  /**
   * Batch upsert entity records
   * @param {Array<object>} entities
   * @returns {number}
   */
  batchUpsertEntities(entities) {
    return this.entities.batchUpsert(entities);
  }

  /**
   * Save a scan manifest
   * @param {object} manifest
   * @returns {object}
   */
  saveScanManifest(manifest) {
    return this.anomalies.insertManifest(manifest);
  }

  /**
   * Record a list of anomaly reports
   * @param {Array<object>} anomalies
   * @returns {number}
   */
  recordAnomalies(anomalies) {
    return this.anomalies.batchInsert(anomalies);
  }

  /**
   * Query entities matching criteria
   * @param {object} filter
   * @returns {Array<object>}
   */
  queryEntities(filter) {
    return this.entities.query(filter);
  }

  /**
   * Get single source file by path or ID
   * @param {string|number} filePathOrId
   * @returns {object|null}
   */
  getSourceFile(filePathOrId) {
    return this.sourceFiles.findByPathOrId(filePathOrId);
  }

  /**
   * Get anomaly report for a scan session
   * @param {string} scanId
   * @returns {Array<object>}
   */
  getAnomalyReport(scanId) {
    return this.anomalies.getBySessionId(scanId);
  }
}

module.exports = DatabaseManager;
