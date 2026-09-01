/**
 * @file migrationEngine.test.js
 * @description Comprehensive unit test suite for NovelEngineering File-Based Migration Engine (M1)
 * @module test/unit/migrationEngine
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const MigrationRunner = require('../../src/migrations/MigrationRunner');
const { MigrationError, SchemaMismatchError } = require('../../src/errors');
const { createTempDir } = require('../helpers/tempDir');

describe('Milestone 1: File-Based Migration Engine Test Suite', () => {
  let tempEnv = null;
  let dbManager = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m1_migration_test_');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv) {
      tempEnv.cleanup();
    }
  });

  it('should initialize schema_version and migration_history tables on a clean in-memory database', () => {
    dbManager = new DatabaseManager(':memory:');
    const tables = dbManager.getTableNames();
    assert.ok(tables.includes('schema_version'), 'schema_version table must exist');
    assert.ok(tables.includes('migration_history'), 'migration_history table must exist');

    const version = dbManager.getSchemaVersion();
    assert.equal(typeof version, 'number');
    assert.ok(version >= 3, `Expected schema_version >= 3, got ${version}`);
  });

  it('should execute migrations sequentially and record execution history with duration and checksum', () => {
    dbManager = new DatabaseManager(':memory:');
    const history = dbManager.getMigrationHistory();
    assert.ok(Array.isArray(history));
    assert.ok(history.length >= 3, 'Expected at least 3 migrations applied');

    const v1 = history.find((h) => h.version === 1);
    const v2 = history.find((h) => h.version === 2);
    const v3 = history.find((h) => h.version === 3);

    assert.ok(v1, 'Version 1 migration record must exist');
    assert.ok(v2, 'Version 2 migration record must exist');
    assert.ok(v3, 'Version 3 migration record must exist');

    assert.equal(v1.status, 'success');
    assert.equal(v2.status, 'success');
    assert.equal(v3.status, 'success');
    assert.ok(v1.checksum.length === 64, 'Checksum must be a valid 64-char hex SHA-256 hash');
    assert.ok(v1.duration_ms >= 0, 'duration_ms must be non-negative');
  });

  it('should be completely idempotent on repeated migration executions', () => {
    dbManager = new DatabaseManager(':memory:');
    const initialVersion = dbManager.getSchemaVersion();

    const migrationsDir = path.resolve(__dirname, '../../src/migrations');
    const result = MigrationRunner.runMigrations(dbManager.db, migrationsDir);

    assert.equal(result.applied.length, 0, 'No new migrations should be applied on second run');
    assert.equal(result.alreadyUpToDate, true);
    assert.equal(result.currentVersion, initialVersion, 'Schema version must remain unchanged');
  });

  it('should rollback transaction and throw MigrationError on faulty migration script', () => {
    const customMigrationsDir = path.join(tempEnv.path, 'faulty_migrations');
    fs.mkdirSync(customMigrationsDir, { recursive: true });

    // Valid migration 001
    fs.writeFileSync(
      path.join(customMigrationsDir, '001_valid.sql'),
      'CREATE TABLE test_valid (id INTEGER PRIMARY KEY);'
    );

    // Faulty migration 002 (SQL syntax error)
    fs.writeFileSync(
      path.join(customMigrationsDir, '002_faulty.sql'),
      'CREATE TABLE test_faulty (id INVALID_SYNTAX_ERROR%%;'
    );

    const testDb = new Database(':memory:');

    assert.throws(
      () => {
        MigrationRunner.runMigrations(testDb, customMigrationsDir);
      },
      (err) => {
        assert.ok(err instanceof MigrationError || err.code === 'MIGRATION_ERROR' || err instanceof SchemaMismatchError);
        assert.equal(err.details.version, 2);
        return true;
      }
    );

    // Assert version is 1 and test_faulty table does not exist
    const versionRow = testDb.prepare('SELECT MAX(version) AS v FROM schema_version').get();
    assert.equal(versionRow.v, 1);

    const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((t) => t.name);
    assert.ok(tables.includes('test_valid'));
    assert.ok(!tables.includes('test_faulty'), 'Faulty table must not be created due to transaction rollback');

    testDb.close();
  });

  it('should upgrade existing Phase 1/2 database to Phase 3 without losing existing records', () => {
    const dbPath = path.join(tempEnv.path, 'legacy_upgrade.db');
    const legacyDb = new Database(dbPath);

    // Seed Phase 1 baseline tables without Phase 3 columns
    legacyDb.exec(`
      CREATE TABLE source_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL UNIQUE,
        relative_path TEXT NOT NULL UNIQUE,
        file_name TEXT NOT NULL,
        extension TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        mtime_ms INTEGER NOT NULL,
        sha256_hash TEXT NOT NULL,
        source_category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        review_status TEXT NOT NULL DEFAULT 'unreviewed'
      );
      CREATE TABLE entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT NOT NULL,
        canonical_name TEXT NOT NULL,
        entity_type TEXT NOT NULL
      );
      INSERT INTO source_files (file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category)
      VALUES ('/vault/PL-001.md', 'PL-001.md', 'PL-001.md', '.md', 100, 1000, 'hash1', 'planet');
      INSERT INTO entities (entity_id, canonical_name, entity_type)
      VALUES ('PL-001', '泰拉', 'planet');
    `);
    legacyDb.close();

    // Open via DatabaseManager with MigrationRunner
    const { PathGuard } = require('../../src/security/PathGuard');
    const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
    dbManager = new DatabaseManager(dbPath, { pathGuard });
    assert.ok(dbManager.getSchemaVersion() >= 3);

    // Assert existing records preserved
    const sf = dbManager.sourceFiles.getByRelativePath('PL-001.md');
    assert.ok(sf);
    assert.equal(sf.file_name, 'PL-001.md');
    assert.equal(sf.canon_level, 0, 'Default canon_level added');

    const entity = dbManager.entities.getSingleByEntityId('PL-001');
    assert.ok(entity);
    assert.equal(entity.canonical_name, '泰拉');
    assert.equal(entity.canon_level, 0);

    // Assert new Phase 3 tables exist
    const tables = dbManager.getTableNames();
    assert.ok(tables.includes('entity_relations'));
    assert.ok(tables.includes('canon_changes'));
  });

  it('should support dynamic discovery and execution of JavaScript (.js) migrations with up(db)', () => {
    const customMigrationsDir = path.join(tempEnv.path, 'js_migrations');
    fs.mkdirSync(customMigrationsDir, { recursive: true });

    // JS migration 001
    fs.writeFileSync(
      path.join(customMigrationsDir, '001_js_init.js'),
      `module.exports = {
        up: function(db) {
          db.exec("CREATE TABLE test_js_table (id INTEGER PRIMARY KEY, note TEXT);");
          db.prepare("INSERT INTO test_js_table (note) VALUES (?)").run("created_by_js_migration");
        }
      };`
    );

    const testDb = new Database(':memory:');
    const result = MigrationRunner.runMigrations(testDb, customMigrationsDir, { verifyFinalSchema: false });

    assert.equal(result.currentVersion, 1);
    assert.equal(result.applied.length, 1);

    const row = testDb.prepare('SELECT * FROM test_js_table').get();
    assert.ok(row);
    assert.equal(row.note, 'created_by_js_migration');

    testDb.close();
  });

  it('should throw SchemaMismatchError if migration file checksum was modified after execution (tamper detection)', () => {
    const customMigrationsDir = path.join(tempEnv.path, 'tamper_migrations');
    fs.mkdirSync(customMigrationsDir, { recursive: true });

    const migFile = path.join(customMigrationsDir, '001_tamper_target.sql');
    fs.writeFileSync(migFile, 'CREATE TABLE test_tamper (id INTEGER PRIMARY KEY);');

    const testDb = new Database(':memory:');
    MigrationRunner.runMigrations(testDb, customMigrationsDir, { verifyFinalSchema: false });

    // Tamper with file content after migration
    fs.writeFileSync(migFile, 'CREATE TABLE test_tamper (id INTEGER PRIMARY KEY, modified_col TEXT);');

    assert.throws(
      () => {
        MigrationRunner.runMigrations(testDb, customMigrationsDir, { verifyTamper: true, verifyFinalSchema: false });
      },
      (err) => {
        assert.ok(err instanceof SchemaMismatchError || err.code === 'SCHEMA_MISMATCH');
        assert.ok(err.message.includes('tampering detected') || err.message.includes('checksum'));
        return true;
      }
    );

    testDb.close();
  });
});
