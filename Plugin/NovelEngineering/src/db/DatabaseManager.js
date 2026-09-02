/**
 * @file DatabaseManager.js
 * @description SQLite Connection, Migration Coordinator & Repository Orchestrator for VCPNovelManager Phase 3
 * @module db/DatabaseManager
 */

'use strict';

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { PathGuard } = require('../security/PathGuard');
const { SchemaMismatchError, MigrationError } = require('../errors');

// Core DAOs
const SourceFileRepo = require('./repositories/SourceFileRepo');
const EntityRepo = require('./repositories/EntityRepo');
const EntityRelationRepo = require('./repositories/EntityRelationRepo');
const CanonChangeRepo = require('./repositories/CanonChangeRepo');
const TimelineRepo = require('./repositories/TimelineRepo');
const ChapterRepo = require('./repositories/ChapterRepo');
const ForeshadowingRepo = require('./repositories/ForeshadowingRepo');
const AnomalyRepo = require('./repositories/AnomalyRepo');
const DecisionQueueRepo = require('./repositories/DecisionQueueRepo');
const ContextTraceRepo = require('./repositories/ContextTraceRepo');
const NarrativeDebtRepo = require('./repositories/NarrativeDebtRepo');
const DebtEventRepo = require('./repositories/DebtEventRepo');
const MicroPayoffRepo = require('./repositories/MicroPayoffRepo');

// Migration Runner
const MigrationRunner = require('../migrations/MigrationRunner');

class DatabaseManager {
  /**
   * @param {string} [dbPath='data/novel_index.db'] - Absolute, relative path, or ':memory:'
   * @param {object} [options={}]
   * @param {PathGuard} [options.pathGuard] - Optional PathGuard instance
   * @param {boolean} [options.autoInit=true] - Automatically execute schema migrations
   * @param {boolean} [options.readOnly=false] - Open database in read-only mode
   * @param {string} [options.migrationsDir] - Custom directory for migration scripts
   */
  constructor(dbPath = 'data/novel_index.db', options = {}) {
    this.rawPath = dbPath;
    this.options = options;
    this.pathGuard = options.pathGuard || new PathGuard();
    this.isMemory = dbPath === ':memory:';

    this.db = null;
    this.resolvedPath = null;
    this.migrationsDir = options.migrationsDir || path.resolve(__dirname, '..', 'migrations');

    // Typed Repositories
    this.sourceFiles = null;
    this.entities = null;
    this.entityRelations = null;
    this.canonChanges = null;
    this.timeline = null;
    this.chapters = null;
    this.foreshadowing = null;
    this.anomalies = null;
    this.decisionQueue = null;
    this.contextTraces = null;
    this.narrativeDebts = null;
    this.debtEvents = null;
    this.microPayoffs = null;

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
    return new DatabaseManager(dbPath, { ...options, autoInit: true });
  }

  /**
   * Initializes the SQLite connection, enforces PRAGMAs, executes migrations, and binds repositories
   * @returns {DatabaseManager}
   */
  init() {
    if (this.db && this.db.open) {
      return this;
    }

    if (this.isMemory) {
      this.resolvedPath = ':memory:';
      this.db = new Database(':memory:');
    } else {
      const candidatePath = path.isAbsolute(this.rawPath)
        ? this.rawPath
        : path.resolve(this.pathGuard.pluginRoot, this.rawPath);

      this.resolvedPath = this.pathGuard.assertWritablePath(candidatePath, 'open_database');

      const dir = path.dirname(this.resolvedPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(this.resolvedPath, {
        readonly: !!this.options.readOnly,
        fileMustExist: !!this.options.fileMustExist,
        timeout: 10000
      });
    }

    // Apply production PRAGMAs
    this._applyPragmas();

    // Execute file-based migrations
    if (!this.options.readOnly) {
      this._runMigrations();
    }

    // Initialize typed repositories
    this.sourceFiles = new SourceFileRepo(this.db);
    this.entities = new EntityRepo(this.db);
    this.entityRelations = new EntityRelationRepo(this.db);
    this.canonChanges = new CanonChangeRepo(this.db);
    this.timeline = new TimelineRepo(this.db);
    this.chapters = new ChapterRepo(this.db);
    this.foreshadowing = new ForeshadowingRepo(this.db);
    this.anomalies = new AnomalyRepo(this.db);
    this.decisionQueue = new DecisionQueueRepo(this.db);
    this.contextTraces = new ContextTraceRepo(this.db);
    this.narrativeDebts = new NarrativeDebtRepo(this.db);
    this.debtEvents = new DebtEventRepo(this.db);
    this.microPayoffs = new MicroPayoffRepo(this.db);

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
    this.db.pragma('busy_timeout = 10000');
    this.db.pragma('cache_size = -64000'); // 64MB cache
    this.db.pragma('temp_store = MEMORY');
  }

  /**
   * Check if schema has been initialized
   * @private
   * @returns {boolean}
   */
  _isSchemaInitialized() {
    if (!this.isOpen()) return false;
    try {
      const row = this.db.prepare(
        "SELECT count(*) AS cnt FROM sqlite_master WHERE type='table' AND name='source_files'"
      ).get();
      return Boolean(row && row.cnt > 0);
    } catch (err) {
      console.error('[DatabaseManager] Failed to inspect sqlite_master:', err.message);
      throw new SchemaMismatchError(`Database initialization inspection failed: ${err.message}`, {
        originalError: err.message
      });
    }
  }

  /**
   * Execute file-based migration runner
   * @private
   */
  _runMigrations() {
    if (fs.existsSync(this.migrationsDir)) {
      MigrationRunner.runMigrations(this.db, this.migrationsDir);
    } else {
      // Fallback to bootstrap schema.sql if migrations directory is unavailable
      const schemaFile = path.resolve(__dirname, 'schema.sql');
      if (fs.existsSync(schemaFile)) {
        const sql = fs.readFileSync(schemaFile, 'utf8');
        this.db.exec(sql);
      } else {
        throw new SchemaMismatchError(`Neither migrations dir (${this.migrationsDir}) nor schema.sql (${schemaFile}) found.`);
      }
    }
  }

  /**
   * Returns the current schema version recorded in the database
   * @returns {number}
   */
  getSchemaVersion() {
    if (!this.isOpen()) return 0;
    return MigrationRunner.getCurrentVersion(this.db);
  }

  /**
   * Returns migration history records
   * @returns {Array<object>}
   */
  getMigrationHistory() {
    if (!this.isOpen()) return [];
    return MigrationRunner.getMigrationHistory(this.db);
  }

  /**
   * Verifies the structural integrity of the database schema against canonical Phase 3 requirements
   * @throws {SchemaMismatchError}
   * @returns {{ valid: boolean, schemaVersion: number, tables: Array<string>, missingTables: Array<string>, errors: Array<string> }}
   */
  verifySchemaIntegrity() {
    if (!this.isOpen()) {
      throw new SchemaMismatchError('Database is closed. Cannot verify schema integrity.');
    }

    const expectedTables = [
      'schema_version',
      'migration_history',
      'scan_manifests',
      'source_files',
      'entities',
      'entity_aliases',
      'file_entities',
      'entity_relations',
      'canon_changes',
      'timeline_events',
      'chapters',
      'foreshadowing',
      'anomaly_reports',
      'canon_changes_queue',
      'context_traces',
      'narrative_debts',
      'debt_events',
      'micro_payoffs'
    ];

    const actualTables = new Set(this.getTableNames());
    const missingTables = expectedTables.filter((t) => !actualTables.has(t));
    const errors = [];

    if (missingTables.length > 0) {
      errors.push(`Missing required tables: ${missingTables.join(', ')}`);
    }

    // Verify critical columns
    const criticalColumns = {
      source_files: ['canon_level', 'review_status', 'status', 'sha256_hash'],
      entities: ['entity_id', 'canonical_name', 'entity_type', 'canon_level'],
      entity_relations: ['source_entity_id', 'target_entity_id', 'relation_type'],
      timeline_events: ['time_type'],
      foreshadowing: ['introduced_chapter'],
      anomaly_reports: ['anomaly_rule_id', 'severity', 'scan_session_id'],
      canon_changes_queue: ['queue_id', 'decision_type', 'proposer', 'status', 'proposed_changes_json'],
      context_traces: ['trace_id', 'snapshot_id', 'trace_items_json'],
      narrative_debts: ['debt_id', 'borrowed_chapter', 'current_balance', 'interest_rate', 'status'],
      debt_events: ['debt_id', 'event_type', 'chapter_number', 'new_balance'],
      micro_payoffs: ['debt_id', 'payoff_id', 'chapter_number', 'payoff_type']
    };

    for (const [table, cols] of Object.entries(criticalColumns)) {
      if (actualTables.has(table)) {
        try {
          const tableInfo = this.db.pragma(`table_info("${table}")`);
          const existingCols = new Set(tableInfo.map((c) => c.name));
          for (const col of cols) {
            if (!existingCols.has(col)) {
              errors.push(`Table '${table}' is missing required column '${col}'`);
            }
          }
        } catch (err) {
          errors.push(`Failed to inspect table '${table}': ${err.message}`);
        }
      }
    }

    if (missingTables.length > 0 || errors.length > 0) {
      throw new SchemaMismatchError(
        `Database schema integrity violation: ${errors.join('; ')}`,
        { missingTables, expectedTables, errors }
      );
    }

    return {
      valid: true,
      schemaVersion: this.getSchemaVersion(),
      tables: Array.from(actualTables),
      missingTables: [],
      errors: []
    };
  }

  /**
   * Run a function inside an ACID transaction
   * @param {Function} fn
   * @returns {*}
   */
  transaction(fn) {
    if (!this.isOpen()) {
      throw new Error('Database is closed. Cannot execute transaction.');
    }
    return this.db.transaction(fn);
  }

  /**
   * Execute raw SQL statements
   * @param {string} sql
   */
  exec(sql) {
    if (!this.isOpen()) {
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
    if (!this.isOpen()) {
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
    if (this.isOpen()) {
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
    if (!this.isOpen()) return [];
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
      } catch (err) {
        console.warn(`[DatabaseManager.getStats] Failed to count table "${name}": ${err.message}`);
        tableCounts[name] = -1;
      }
    }

    let fileSizeBytes = 0;
    if (!this.isMemory && this.resolvedPath && fs.existsSync(this.resolvedPath)) {
      try {
        fileSizeBytes = fs.statSync(this.resolvedPath).size;
      } catch (_) {}
    }

    let journalMode = 'unknown';
    let foreignKeys = 0;
    try {
      const jm = this.db.pragma('journal_mode');
      journalMode = jm && jm[0] ? jm[0].journal_mode : 'unknown';
      const fk = this.db.pragma('foreign_keys');
      foreignKeys = fk && fk[0] ? fk[0].foreign_keys : 0;
    } catch (_) {}

    return {
      status: 'open',
      schemaVersion: this.getSchemaVersion(),
      isMemory: this.isMemory,
      dbPath: this.resolvedPath,
      fileSizeBytes,
      journalMode,
      foreignKeysEnabled: foreignKeys === 1,
      tables: tableCounts,
      totalFiles: tableCounts.source_files || 0,
      totalEntities: tableCounts.entities || 0,
      totalAliases: tableCounts.entity_aliases || 0,
      totalEntityRelations: tableCounts.entity_relations || 0,
      totalCanonChanges: tableCounts.canon_changes || 0,
      totalTimelineEvents: tableCounts.timeline_events || 0,
      totalChapters: tableCounts.chapters || 0,
      totalForeshadowing: tableCounts.foreshadowing || 0,
      totalAnomalies: tableCounts.anomaly_reports || 0,
      totalManifests: tableCounts.scan_manifests || 0,
      totalDecisionQueue: tableCounts.canon_changes_queue || 0,
      totalContextTraces: tableCounts.context_traces || 0,
      totalNarrativeDebts: tableCounts.narrative_debts || 0,
      totalDebtEvents: tableCounts.debt_events || 0,
      totalMicroPayoffs: tableCounts.micro_payoffs || 0
    };
  }

  /**
   * Resets all application tables by truncating data within a transaction
   */
  clearAllTables() {
    if (!this.isOpen()) return;

    const tables = [
      'micro_payoffs',
      'debt_events',
      'narrative_debts',
      'context_traces',
      'canon_changes_queue',
      'canon_changes',
      'entity_relations',
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
        try {
          this.db.prepare(`DELETE FROM ${table}`).run();
          this.db.prepare(`DELETE FROM sqlite_sequence WHERE name = '${table}'`).run();
        } catch (err) {
          console.warn(`[DatabaseManager.clearAllTables] Failed to clear table "${table}": ${err.message}`);
        }
      }
      this.db.pragma('foreign_keys = ON');
    });

    tx();
  }

  // ==========================================================================
  // High-Level Interface Contract Delegates
  // ==========================================================================

  upsertSourceFile(fileRecord) {
    return this.sourceFiles.upsert(fileRecord);
  }

  batchUpsertEntities(entities) {
    return this.entities.batchUpsert(entities);
  }

  saveScanManifest(manifest) {
    return this.anomalies.insertManifest(manifest);
  }

  recordAnomalies(anomalies) {
    return this.anomalies.batchInsert(anomalies);
  }

  queryEntities(filter) {
    return this.entities.query(filter);
  }

  getSourceFile(filePathOrId) {
    return this.sourceFiles.findByPathOrId(filePathOrId);
  }

  getAnomalyReport(scanId) {
    return this.anomalies.getBySessionId(scanId);
  }

  enqueueDecision(decisionData) {
    return this.decisionQueue.enqueue(decisionData);
  }

  getPendingDecisions(filter) {
    return this.decisionQueue.getPending(filter);
  }

  saveContextTrace(traceData) {
    return this.contextTraces.saveTrace(traceData);
  }

  getContextTrace(snapshotOrTraceId) {
    return this.contextTraces.getBySnapshotId(snapshotOrTraceId) || this.contextTraces.getByTraceId(snapshotOrTraceId);
  }

  createNarrativeDebt(data) {
    return this.narrativeDebts.createDebt(data);
  }

  getNarrativeDebt(debtId) {
    return this.narrativeDebts.getById(debtId);
  }

  accrueNarrativeDebts(currentChapter, options) {
    return this.narrativeDebts.accrueInterest(currentChapter, options);
  }

  payNarrativeDebt(debtId, amount, options) {
    return this.narrativeDebts.applyPayoff(debtId, amount, options);
  }

  recordDebtEvent(eventData) {
    return this.debtEvents.recordEvent(eventData);
  }

  recordMicroPayoff(data) {
    return this.microPayoffs.recordPayoff(data);
  }
}

module.exports = DatabaseManager;
