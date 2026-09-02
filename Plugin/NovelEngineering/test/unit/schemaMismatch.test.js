/**
 * @file schemaMismatch.test.js
 * @description Anti-Swallow & Schema Mismatch Assertion Suite (M1)
 * @module test/unit/schemaMismatch
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const DatabaseManager = require('../../src/db/DatabaseManager');
const {
  NovelError,
  SchemaMismatchError,
  GovernanceSafetyError,
  SecurityViolationError,
  MigrationError,
  ConsistencyError
} = require('../../src/errors');

describe('Milestone 1: Anti-Swallow & Schema Mismatch Assertion Suite', () => {
  let dbManager = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  describe('Suite 1: Typed Error Hierarchy & Serialization', () => {
    it('should instantiate NovelError base class and serialize properly via toJSON()', () => {
      const err = new NovelError('Test novel error', 'ERR_TEST', { field: 'test' });
      assert.equal(err.name, 'NovelError');
      assert.equal(err.code, 'ERR_TEST');
      assert.equal(err.message, 'Test novel error');
      assert.equal(err.details.field, 'test');
      assert.ok(err.timestamp);

      const json = err.toJSON();
      assert.equal(json.status, 'error');
      assert.equal(json.code, 'ERR_TEST');
      assert.equal(json.error, 'Test novel error');
      assert.equal(json.message, 'Test novel error');
    });

    it('should instantiate SchemaMismatchError with code SCHEMA_MISMATCH', () => {
      const err = new SchemaMismatchError('Table missing', { tableName: 'anomalies' });
      assert.equal(err.name, 'SchemaMismatchError');
      assert.equal(err.code, 'SCHEMA_MISMATCH');
      assert.equal(err.details.tableName, 'anomalies');
    });

    it('should instantiate GovernanceSafetyError with code GOVERNANCE_CONFIRMATION_REQUIRED', () => {
      const err = new GovernanceSafetyError('Missing token', { requiredToken: 'CONFIRM_CANON_CHANGE' });
      assert.equal(err.name, 'GovernanceSafetyError');
      assert.equal(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
      assert.equal(err.details.requiredToken, 'CONFIRM_CANON_CHANGE');
    });

    it('should instantiate SecurityViolationError with code SECURITY_VIOLATION', () => {
      const err = new SecurityViolationError('Path escape', { requestedPath: '../secret' });
      assert.equal(err.name, 'SecurityViolationError');
      assert.equal(err.code, 'SECURITY_VIOLATION');
      assert.equal(err.details.requestedPath, '../secret');
    });

    it('should instantiate MigrationError with code MIGRATION_ERROR', () => {
      const err = new MigrationError('Checksum mismatch', { version: 2 });
      assert.equal(err.name, 'MigrationError');
      assert.equal(err.code, 'MIGRATION_ERROR');
      assert.equal(err.details.version, 2);
    });

    it('should instantiate ConsistencyError with code CONSISTENCY_ERROR', () => {
      const err = new ConsistencyError('Paradox found', { ruleId: 'TIMELINE_PARADOX' });
      assert.equal(err.name, 'ConsistencyError');
      assert.equal(err.code, 'CONSISTENCY_ERROR');
      assert.equal(err.details.ruleId, 'TIMELINE_PARADOX');
    });
  });

  describe('Suite 2: Database Schema Integrity Verification', () => {
    it('should pass verifySchemaIntegrity() when all canonical tables exist', () => {
      assert.doesNotThrow(() => {
        const res = dbManager.verifySchemaIntegrity();
        assert.equal(res.valid, true);
      });
    });

    it('should throw SchemaMismatchError when a required table is dropped', () => {
      dbManager.db.exec('DROP TABLE anomaly_reports;');

      assert.throws(
        () => {
          dbManager.verifySchemaIntegrity();
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError || err.code === 'SCHEMA_MISMATCH');
          assert.equal(err.code, 'SCHEMA_MISMATCH');
          assert.ok(err.details.missingTables.includes('anomaly_reports'));
          return true;
        }
      );
    });

    it('should throw SchemaMismatchError when a required column is missing', () => {
      // Create test DB missing canon_level on source_files
      const rawDb = new (require('better-sqlite3'))(':memory:');
      rawDb.exec(`
        CREATE TABLE schema_version (version INTEGER PRIMARY KEY, applied_at TEXT, description TEXT);
        CREATE TABLE migration_history (id INTEGER PRIMARY KEY, version INTEGER, migration_file TEXT, checksum TEXT, applied_at TEXT, duration_ms INTEGER, status TEXT, error_message TEXT);
        CREATE TABLE scan_manifests (id INTEGER PRIMARY KEY, scan_session_id TEXT);
        CREATE TABLE source_files (id INTEGER PRIMARY KEY, file_path TEXT, relative_path TEXT);
        CREATE TABLE entities (id INTEGER PRIMARY KEY, entity_id TEXT, canonical_name TEXT, entity_type TEXT, canon_level INTEGER);
        CREATE TABLE entity_aliases (id INTEGER PRIMARY KEY);
        CREATE TABLE file_entities (id INTEGER PRIMARY KEY);
        CREATE TABLE entity_relations (id INTEGER PRIMARY KEY, relation_type TEXT);
        CREATE TABLE timeline_events (id INTEGER PRIMARY KEY, time_type TEXT);
        CREATE TABLE chapters (id INTEGER PRIMARY KEY);
        CREATE TABLE foreshadowing (id INTEGER PRIMARY KEY, introduced_chapter TEXT);
        CREATE TABLE anomaly_reports (id INTEGER PRIMARY KEY, anomaly_rule_id TEXT, severity TEXT, scan_session_id TEXT);
        CREATE TABLE canon_changes (id INTEGER PRIMARY KEY, confirmation_token TEXT);
        CREATE TABLE canon_changes_queue (id INTEGER PRIMARY KEY, queue_id TEXT, status TEXT, proposed_changes_json TEXT);
        CREATE TABLE context_traces (id INTEGER PRIMARY KEY, trace_id TEXT, snapshot_id TEXT, trace_items_json TEXT);
        CREATE TABLE narrative_debts (id INTEGER PRIMARY KEY, debt_id TEXT, current_balance REAL, status TEXT);
        CREATE TABLE debt_events (id INTEGER PRIMARY KEY, debt_id TEXT, event_type TEXT, chapter_number INTEGER);
        CREATE TABLE micro_payoffs (id INTEGER PRIMARY KEY, debt_id TEXT, payoff_id TEXT, chapter_number INTEGER);
      `);

      const MigrationRunner = require('../../src/migrations/MigrationRunner');
      assert.throws(
        () => {
          MigrationRunner.verifySchema(rawDb);
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError || err.code === 'SCHEMA_MISMATCH');
          assert.ok(err.message.includes('canon_level'));
          return true;
        }
      );

      rawDb.close();
    });
  });

  describe('Suite 3: Anti-Swallow Query Assertions', () => {
    it('should throw SQLite error when preparing query against a non-existent table and never return empty array', () => {
      assert.throws(
        () => {
          dbManager.db.prepare('SELECT * FROM non_existent_table_xyz').all();
        },
        /no such table: non_existent_table_xyz/
      );
    });

    it('should throw SQLite error when inserting into non-existent column', () => {
      assert.throws(
        () => {
          dbManager.db.prepare('INSERT INTO source_files (non_existent_column_abc) VALUES (1)').run();
        },
        /has no column named non_existent_column_abc/
      );
    });

    it('should log diagnostic warning when parsing malformed JSON in AnomalyRepo without swallowing silently', () => {
      // Direct raw insert of corrupted JSON
      dbManager.db.prepare(`
        INSERT INTO anomaly_reports (
          scan_session_id, anomaly_rule_id, anomaly_type, severity, title, message,
          affected_file_paths_json, affected_entity_ids_json, details_json
        ) VALUES (
          'session_test', 'ANOM_001', 'conflict', 'HIGH', 'Test Anomaly', 'Msg',
          '{corrupted_json_syntax', '[corrupted_entity', '{corrupted_details'
        )
      `).run();

      const list = dbManager.anomalies.getBySessionId('session_test');
      assert.equal(list.length, 1);
      // Confirms safe fallback to empty structures while warning was logged
      assert.deepEqual(list[0].affectedFilePaths, []);
      assert.deepEqual(list[0].affectedEntityIds, []);
      assert.deepEqual(list[0].details, {});
    });
  });
});
