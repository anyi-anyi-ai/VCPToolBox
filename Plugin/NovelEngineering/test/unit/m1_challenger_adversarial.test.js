/**
 * @file m1_challenger_adversarial.test.js
 * @description Adversarial Empirical Challenge Suite for Milestone 1
 * Targets:
 *   1. Schema Integrity Verification (All 13 tables & critical columns)
 *   2. Anti-Swallow Error Handling (No fake empty arrays, typed error propagation)
 *   3. 3-ID Decoupling Model (source_file_id vs entity_db_id vs canonical entity_id)
 *   4. EntityRelationRepo Boundary Conditions (Duplicates, cycles, self-loops, cascade deletes, BFS depth clamping)
 *   5. CanonChangeRepo Boundary Conditions (Audit immutability, tokens, complex JSON states, pagination)
 * @module test/unit/m1_challenger_adversarial
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const MigrationRunner = require('../../src/migrations/MigrationRunner');
const {
  NovelError,
  SchemaMismatchError,
  GovernanceSafetyError,
  SecurityViolationError,
  MigrationError,
  ConsistencyError
} = require('../../src/errors');

describe('M1 Schema & Anti-Swallow Adversarial Challenger Suite', () => {
  let dbManager = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // ==========================================================================
  // Area 1: Schema Verification & Missing Tables/Columns Stress Testing
  // ==========================================================================
  describe('Area 1: Schema Integrity Verification & Edge Cases', () => {
    const allCanonicalTables = [
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
      'anomaly_reports'
    ];

    it('should confirm all 13 canonical tables exist and verifySchemaIntegrity passes on fresh DB', () => {
      const res = dbManager.verifySchemaIntegrity();
      assert.equal(res.valid, true);
      assert.equal(res.missingTables.length, 0);
      assert.equal(res.errors.length, 0);
      assert.ok(res.schemaVersion >= 3, `Expected schemaVersion >= 3, got ${res.schemaVersion}`);
      for (const table of allCanonicalTables) {
        assert.ok(res.tables.includes(table), `Expected table ${table} to be in verified tables list`);
      }
    });

    for (const tableToDrop of allCanonicalTables) {
      it(`should throw SchemaMismatchError when table "${tableToDrop}" is dropped`, () => {
        // Drop table
        dbManager.db.exec(`DROP TABLE IF EXISTS "${tableToDrop}";`);

        assert.throws(
          () => {
            dbManager.verifySchemaIntegrity();
          },
          (err) => {
            assert.ok(err instanceof SchemaMismatchError, 'Error must be instance of SchemaMismatchError');
            assert.equal(err.code, 'SCHEMA_MISMATCH', 'Error code must be SCHEMA_MISMATCH');
            assert.ok(
              err.details.missingTables.includes(tableToDrop),
              `Missing tables list must include dropped table ${tableToDrop}`
            );
            return true;
          }
        );
      });
    }

    const criticalColumnChecks = [
      { table: 'source_files', col: 'canon_level' },
      { table: 'source_files', col: 'review_status' },
      { table: 'source_files', col: 'status' },
      { table: 'source_files', col: 'sha256_hash' },
      { table: 'entities', col: 'entity_id' },
      { table: 'entities', col: 'canonical_name' },
      { table: 'entities', col: 'entity_type' },
      { table: 'entities', col: 'canon_level' },
      { table: 'entity_relations', col: 'source_entity_id' },
      { table: 'entity_relations', col: 'target_entity_id' },
      { table: 'entity_relations', col: 'relation_type' },
      { table: 'timeline_events', col: 'time_type' },
      { table: 'foreshadowing', col: 'introduced_chapter' },
      { table: 'anomaly_reports', col: 'anomaly_rule_id' },
      { table: 'anomaly_reports', col: 'severity' },
      { table: 'anomaly_reports', col: 'scan_session_id' }
    ];

    for (const { table, col } of criticalColumnChecks) {
      it(`should throw SchemaMismatchError when critical column "${col}" in table "${table}" is missing`, () => {
        // Drop column in SQLite (re-create table without that specific column)
        const rawDb = new Database(':memory:');
        // Initialize minimal valid schema
        rawDb.exec(`
          CREATE TABLE schema_version (version INTEGER PRIMARY KEY, applied_at TEXT, description TEXT);
          CREATE TABLE migration_history (id INTEGER PRIMARY KEY, version INTEGER, migration_file TEXT, checksum TEXT, applied_at TEXT, duration_ms INTEGER, status TEXT, error_message TEXT);
          CREATE TABLE scan_manifests (id INTEGER PRIMARY KEY, scan_session_id TEXT);
          CREATE TABLE source_files (id INTEGER PRIMARY KEY, file_path TEXT, relative_path TEXT, file_name TEXT, extension TEXT, size_bytes INTEGER, mtime_ms INTEGER, sha256_hash TEXT, source_category TEXT, status TEXT, review_status TEXT, canon_level INTEGER);
          CREATE TABLE entities (id INTEGER PRIMARY KEY, entity_id TEXT, canonical_name TEXT, entity_type TEXT, category TEXT, status TEXT, review_status TEXT, canon_level INTEGER, source_file_id INTEGER);
          CREATE TABLE entity_aliases (id INTEGER PRIMARY KEY, entity_id INTEGER, alias_name TEXT, alias_type TEXT, is_primary INTEGER, source_file_id INTEGER);
          CREATE TABLE file_entities (id INTEGER PRIMARY KEY, source_file_id INTEGER, entity_id INTEGER, mention_type TEXT);
          CREATE TABLE entity_relations (id INTEGER PRIMARY KEY, source_entity_id INTEGER, target_entity_id INTEGER, relation_type TEXT, weight REAL, confidence REAL);
          CREATE TABLE canon_changes (id INTEGER PRIMARY KEY, change_type TEXT, target_type TEXT, target_id TEXT, confirmation_token TEXT, confirmed_by_flag INTEGER);
          CREATE TABLE timeline_events (id INTEGER PRIMARY KEY, event_id TEXT, title TEXT, timestamp_order REAL, time_type TEXT);
          CREATE TABLE chapters (id INTEGER PRIMARY KEY, chapter_number REAL, volume_number INTEGER, title TEXT, relative_path TEXT);
          CREATE TABLE foreshadowing (id INTEGER PRIMARY KEY, foreshadow_id TEXT, title TEXT, description TEXT, status TEXT, introduced_chapter TEXT);
          CREATE TABLE anomaly_reports (id INTEGER PRIMARY KEY, scan_session_id TEXT, anomaly_rule_id TEXT, anomaly_type TEXT, severity TEXT, title TEXT, message TEXT, affected_file_paths_json TEXT);
        `);

        // Now drop the target column from target table
        rawDb.exec(`ALTER TABLE "${table}" DROP COLUMN "${col}";`);

        const mockManager = {
          isOpen: () => true,
          getTableNames: () => allCanonicalTables,
          getSchemaVersion: () => 3,
          db: rawDb
        };

        assert.throws(
          () => {
            DatabaseManager.prototype.verifySchemaIntegrity.call(mockManager);
          },
          (err) => {
            assert.ok(err instanceof SchemaMismatchError);
            assert.equal(err.code, 'SCHEMA_MISMATCH');
            assert.ok(err.message.includes(`Table '${table}' is missing required column '${col}'`));
            return true;
          }
        );

        rawDb.close();
      });
    }

    it('should throw SchemaMismatchError if verifySchemaIntegrity() is invoked on a closed database', () => {
      dbManager.close();
      assert.throws(
        () => {
          dbManager.verifySchemaIntegrity();
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError);
          assert.equal(err.code, 'SCHEMA_MISMATCH');
          assert.ok(err.message.includes('Database is closed'));
          return true;
        }
      );
    });

    it('should throw SchemaMismatchError when MigrationRunner detects migration tampering', () => {
      // Create fresh DB and apply migrations
      const rawDb = new Database(':memory:');
      const migrationsDir = path.resolve(__dirname, '../../src/migrations');
      MigrationRunner.runMigrations(rawDb, migrationsDir);

      // Tamper with checksum in migration_history
      rawDb.prepare("UPDATE migration_history SET checksum = '0000000000000000000000000000000000000000000000000000000000000000' WHERE version = 1").run();

      // Run migrations again with verifyTamper=true
      assert.throws(
        () => {
          MigrationRunner.runMigrations(rawDb, migrationsDir, { verifyTamper: true });
        },
        (err) => {
          assert.ok(err instanceof SchemaMismatchError);
          assert.equal(err.code, 'SCHEMA_MISMATCH');
          assert.ok(err.message.includes('tampering detected'));
          return true;
        }
      );

      rawDb.close();
    });
  });

  // ==========================================================================
  // Area 2: Anti-Swallow Error Handling & Query Safety Assertions
  // ==========================================================================
  describe('Area 2: Anti-Swallow Query & Error Enforcement', () => {
    it('should strictly throw SQLite error on querying non-existent table and NEVER return empty array []', () => {
      const nonExistentTables = ['ghost_table_1', 'anomalies_old', 'invalid_table', 'deleted_records'];
      for (const t of nonExistentTables) {
        assert.throws(
          () => {
            dbManager.db.prepare(`SELECT * FROM ${t}`).all();
          },
          (err) => {
            assert.ok(err.message.includes(`no such table: ${t}`));
            return true;
          }
        );

        assert.throws(
          () => {
            dbManager.db.prepare(`SELECT COUNT(*) FROM ${t}`).get();
          },
          (err) => {
            assert.ok(err.message.includes(`no such table: ${t}`));
            return true;
          }
        );
      }
    });

    it('should throw error when inserting invalid required records in CanonChangeRepo and EntityRelationRepo', () => {
      // CanonChangeRepo missing required fields
      assert.throws(
        () => {
          dbManager.canonChanges.insert({});
        },
        /change_type is required/
      );

      assert.throws(
        () => {
          dbManager.canonChanges.insert({ change_type: 'PROMOTE_CANON' });
        },
        /target_type is required/
      );

      assert.throws(
        () => {
          dbManager.canonChanges.insert({ change_type: 'PROMOTE_CANON', target_type: 'entity' });
        },
        /target_id is required/
      );

      // EntityRelationRepo missing required fields
      assert.throws(
        () => {
          dbManager.entityRelations.insert({});
        },
        /source_entity_id and target_entity_id are required/
      );
    });

    it('should return null safely from resolveEntityDbId when entity does not exist', () => {
      assert.equal(dbManager.entityRelations.resolveEntityDbId('NON_EXISTENT_ENTITY_999'), null);
      assert.equal(dbManager.entityRelations.resolveEntityDbId(null), null);
      assert.equal(dbManager.entityRelations.resolveEntityDbId(undefined), null);
    });

    it('should throw typed errors across all error classes with correct codes', () => {
      const e1 = new SchemaMismatchError('mismatch msg');
      assert.equal(e1.code, 'SCHEMA_MISMATCH');
      assert.equal(e1.name, 'SchemaMismatchError');

      const e2 = new GovernanceSafetyError('safety msg');
      assert.equal(e2.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
      assert.equal(e2.name, 'GovernanceSafetyError');

      const e3 = new SecurityViolationError('security msg');
      assert.equal(e3.code, 'SECURITY_VIOLATION');
      assert.equal(e3.name, 'SecurityViolationError');

      const e4 = new MigrationError('migration msg');
      assert.equal(e4.code, 'MIGRATION_ERROR');
      assert.equal(e4.name, 'MigrationError');

      const e5 = new ConsistencyError('consistency msg');
      assert.equal(e5.code, 'CONSISTENCY_ERROR');
      assert.equal(e5.name, 'ConsistencyError');
    });
  });

  // ==========================================================================
  // Area 3: 3-ID Model Decoupling Verification
  // ==========================================================================
  describe('Area 3: 3-ID Model Conformance & Decoupling', () => {
    it('should decouple source_files (source_file_id), entities (entity_db_id), and lore ID (entity_id)', () => {
      // 1. Create multiple source files for the same canonical entity (e.g. planet V-001)
      const file1 = dbManager.sourceFiles.insert({
        file_path: 'J:/vault/04_Planets/V-001/Overview.md',
        relative_path: '04_Planets/V-001/Overview.md',
        source_category: 'planet',
        status: 'active',
        canon_level: 2,
        sha256_hash: '1111111111111111111111111111111111111111111111111111111111111111'
      });

      const file2 = dbManager.sourceFiles.insert({
        file_path: 'J:/vault/04_Planets/V-001/Geology.md',
        relative_path: '04_Planets/V-001/Geology.md',
        source_category: 'planet',
        status: 'active',
        canon_level: 2,
        sha256_hash: '2222222222222222222222222222222222222222222222222222222222222222'
      });

      const file3 = dbManager.sourceFiles.insert({
        file_path: 'J:/vault/04_Planets/V-001/History.md',
        relative_path: '04_Planets/V-001/History.md',
        source_category: 'planet',
        status: 'active',
        canon_level: 2,
        sha256_hash: '3333333333333333333333333333333333333333333333333333333333333333'
      });

      assert.notEqual(file1.id, file2.id);
      assert.notEqual(file2.id, file3.id);

      // 2. Create single unified entity with lore ID "PL-V001"
      const entity = dbManager.entities.insert({
        entity_id: 'PL-V001',
        canonical_name: '新泰拉',
        entity_type: 'planet',
        category: 'rocky_planet',
        canon_level: 2,
        source_file_id: file1.id
      }, ['地球二号', 'Nova Terra']);

      assert.ok(entity.id, 'Entity must have numeric entity_db_id (PK)');
      assert.equal(entity.entity_id, 'PL-V001', 'Entity canonical string ID must be PL-V001');
      assert.equal(entity.aliases.length, 2);

      // 3. Link all 3 files via file_entities junction table (M:N)
      dbManager.entities.addMention({
        source_file_id: file1.id,
        entity_id: entity.id,
        mention_type: 'definition',
        mention_count: 5
      });
      dbManager.entities.addMention({
        source_file_id: file2.id,
        entity_id: entity.id,
        mention_type: 'supplement',
        mention_count: 3
      });
      dbManager.entities.addMention({
        source_file_id: file3.id,
        entity_id: entity.id,
        mention_type: 'referenced',
        mention_count: 2
      });

      // 4. Inspect faceted entity grouping
      const faceted = dbManager.entities.getEntityWithFacets('PL-V001');
      assert.ok(faceted);
      assert.equal(faceted.id, entity.id);
      assert.equal(faceted.facets.definition.length, 1);
      assert.equal(faceted.facets.supplement.length, 1);
      assert.equal(faceted.linkedFiles.length, 3);

      // 5. Decoupling test: Deleting or clearing primary source_file_id leaves the entity in DB
      dbManager.entities.deleteBySourceFileId(file1.id);
      const survivingEntity = dbManager.entities.getById(entity.id);
      assert.ok(survivingEntity, 'Entity must survive when originating source_file_id is cleared');
      assert.equal(survivingEntity.source_file_id, null, 'source_file_id must be cleared to NULL');
    });

    it('should support multiple distinct entities in the same source file without primary key collision', () => {
      const sharedFile = dbManager.sourceFiles.insert({
        file_path: 'J:/vault/02_Entities/Faction_Overview.md',
        relative_path: '02_Entities/Faction_Overview.md',
        source_category: 'organization',
        sha256_hash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
      });

      const org1 = dbManager.entities.insert({
        entity_id: 'ORG-001',
        canonical_name: '星际联邦',
        entity_type: 'organization',
        source_file_id: sharedFile.id
      });

      const org2 = dbManager.entities.insert({
        entity_id: 'ORG-002',
        canonical_name: '自由行者舰队',
        entity_type: 'organization',
        source_file_id: sharedFile.id
      });

      assert.notEqual(org1.id, org2.id);
      assert.notEqual(org1.entity_id, org2.entity_id);
      assert.equal(org1.source_file_id, sharedFile.id);
      assert.equal(org2.source_file_id, sharedFile.id);

      const fromFile = dbManager.entities.query({ source_file_id: sharedFile.id });
      assert.equal(fromFile.length, 2);
    });
  });

  // ==========================================================================
  // Area 4: EntityRelationRepo Boundary Conditions & Graph Stress
  // ==========================================================================
  describe('Area 4: EntityRelationRepo Boundary Conditions & Graph Stress', () => {
    let eA, eB, eC, eD;

    beforeEach(() => {
      eA = dbManager.entities.insert({ entity_id: 'E-A', canonical_name: 'Entity Alpha', entity_type: 'character' });
      eB = dbManager.entities.insert({ entity_id: 'E-B', canonical_name: 'Entity Beta', entity_type: 'character' });
      eC = dbManager.entities.insert({ entity_id: 'E-C', canonical_name: 'Entity Gamma', entity_type: 'organization' });
      eD = dbManager.entities.insert({ entity_id: 'E-D', canonical_name: 'Entity Delta', entity_type: 'planet' });
    });

    it('should throw UNIQUE constraint error on duplicate createRelation and support upsert update', () => {
      // 1. Initial creation
      const rel1 = dbManager.entityRelations.createRelation({
        source_entity_id: eA.id,
        target_entity_id: eB.id,
        relation_type: 'ally_of',
        weight: 1.0,
        confidence: 0.9,
        description: 'Initial alliance'
      });
      assert.ok(rel1.id);

      // 2. Duplicate createRelation must throw UNIQUE constraint failed
      assert.throws(
        () => {
          dbManager.entityRelations.createRelation({
            source_entity_id: eA.id,
            target_entity_id: eB.id,
            relation_type: 'ally_of',
            weight: 2.0
          });
        },
        /UNIQUE constraint failed/
      );

      // 3. Upsert should safely update attributes without duplicating rows
      const updatedRel = dbManager.entityRelations.upsert({
        source_entity_id: eA.id,
        target_entity_id: eB.id,
        relation_type: 'ally_of',
        weight: 3.5,
        confidence: 1.0,
        description: 'Strengthened alliance'
      });

      assert.equal(updatedRel.id, rel1.id);
      assert.equal(updatedRel.weight, 3.5);
      assert.equal(updatedRel.description, 'Strengthened alliance');

      const count = dbManager.entityRelations.count({ source_entity_id: eA.id, target_entity_id: eB.id });
      assert.equal(count, 1);
    });

    it('should support string entity_id resolution transparently in EntityRelationRepo', () => {
      const rel = dbManager.entityRelations.createRelation({
        source_entity_id: 'E-A',
        target_entity_id: 'E-C',
        relation_type: 'member_of',
        confidence: 0.95
      });

      assert.equal(rel.source_entity_id, eA.id);
      assert.equal(rel.target_entity_id, eC.id);
      assert.equal(rel.source_canon_id, 'E-A');
      assert.equal(rel.target_canon_id, 'E-C');
    });

    it('should handle self-loops (A -> A) safely in graph traversal and shortest paths', () => {
      dbManager.entityRelations.createRelation({
        source_entity_id: eA.id,
        target_entity_id: eA.id,
        relation_type: 'self_contained',
        description: 'Self recursion'
      });

      const rels = dbManager.entityRelations.getRelationsForEntity(eA.id);
      assert.equal(rels.length, 1);
      assert.equal(rels[0].source_entity_id, eA.id);
      assert.equal(rels[0].target_entity_id, eA.id);

      // Graph traversal with self-loop should not loop infinitely
      const graph = dbManager.entityRelations.getGraph(eA.id, 3);
      assert.equal(graph.totalNodes, 1);
      assert.equal(graph.totalEdges, 1);
      assert.equal(graph.nodes[0].id, eA.id);

      // findPaths to itself
      const paths = dbManager.entityRelations.findPaths(eA.id, eA.id);
      assert.equal(paths.length, 1);
      assert.equal(paths[0][0].nodeId, eA.id);
    });

    it('should handle 2-cycle (A -> B -> A) and 3-cycle (A -> B -> C -> A) without infinite loops', () => {
      // Create 3-cycle: A -> B -> C -> A
      dbManager.entityRelations.createRelation({ source_entity_id: eA.id, target_entity_id: eB.id, relation_type: 'links_to' });
      dbManager.entityRelations.createRelation({ source_entity_id: eB.id, target_entity_id: eC.id, relation_type: 'links_to' });
      dbManager.entityRelations.createRelation({ source_entity_id: eC.id, target_entity_id: eA.id, relation_type: 'links_to' });

      // BFS graph extraction with maxDepth = 5
      const graph = dbManager.entityRelations.getGraph(eA.id, 5);
      assert.equal(graph.totalNodes, 3);
      assert.equal(graph.totalEdges, 3);
      assert.ok(graph.nodes.some(n => n.id === eA.id));
      assert.ok(graph.nodes.some(n => n.id === eB.id));
      assert.ok(graph.nodes.some(n => n.id === eC.id));

      // findPaths in cyclic graph
      const pathsAC = dbManager.entityRelations.findPaths(eA.id, eC.id, 4);
      assert.ok(pathsAC.length >= 1);
      // First path should be A -> B -> C (or incoming C -> A if bidirectional)
      const p = pathsAC[0];
      assert.equal(p[0].nodeId, eA.id);
      assert.equal(p[p.length - 1].nodeId, eC.id);
    });

    it('should isolate disconnected components cleanly in getGraph and findPaths', () => {
      // Component 1: A <-> B
      dbManager.entityRelations.createRelation({ source_entity_id: eA.id, target_entity_id: eB.id, relation_type: 'allies' });
      // Component 2: C <-> D
      dbManager.entityRelations.createRelation({ source_entity_id: eC.id, target_entity_id: eD.id, relation_type: 'allies' });

      // getGraph on A should never include C or D
      const graphA = dbManager.entityRelations.getGraph(eA.id, 5);
      assert.equal(graphA.totalNodes, 2);
      assert.equal(graphA.totalEdges, 1);
      const nodeIds = graphA.nodes.map(n => n.id);
      assert.ok(nodeIds.includes(eA.id));
      assert.ok(nodeIds.includes(eB.id));
      assert.ok(!nodeIds.includes(eC.id));
      assert.ok(!nodeIds.includes(eD.id));

      // findPaths between disconnected nodes must return empty array []
      const paths = dbManager.entityRelations.findPaths(eA.id, eD.id, 5);
      assert.deepEqual(paths, []);
    });

    it('should cascade delete entity_relations when an entity is deleted with foreign keys ON', () => {
      dbManager.entityRelations.createRelation({ source_entity_id: eA.id, target_entity_id: eB.id, relation_type: 'interacts' });
      dbManager.entityRelations.createRelation({ source_entity_id: eC.id, target_entity_id: eA.id, relation_type: 'targets' });

      assert.equal(dbManager.entityRelations.count({ source_entity_id: eA.id }), 1);
      assert.equal(dbManager.entityRelations.count({ target_entity_id: eA.id }), 1);

      // Delete entity A directly from entities table
      dbManager.entities.deleteById(eA.id);

      // Because of FOREIGN KEY ... ON DELETE CASCADE, both relations must be removed
      assert.equal(dbManager.entityRelations.count({ source_entity_id: eA.id }), 0);
      assert.equal(dbManager.entityRelations.count({ target_entity_id: eA.id }), 0);
      assert.equal(dbManager.entityRelations.count(), 0);
    });

    it('should batchUpsert relations efficiently in a transaction', () => {
      const items = [
        { source_entity_id: eA.id, target_entity_id: eB.id, relation_type: 'r1', weight: 1.0 },
        { source_entity_id: eB.id, target_entity_id: eC.id, relation_type: 'r2', weight: 1.2 },
        { source_entity_id: eC.id, target_entity_id: eD.id, relation_type: 'r3', weight: 1.4 },
        { source_entity_id: eA.id, target_entity_id: eB.id, relation_type: 'r1', weight: 2.0 } // duplicate upsert
      ];

      const count = dbManager.entityRelations.batchUpsert(items);
      assert.equal(count, 4);
      assert.equal(dbManager.entityRelations.count(), 3);

      const relAB = dbManager.entityRelations.getBySourceAndTarget(eA.id, eB.id, 'r1');
      assert.equal(relAB.weight, 2.0);
    });
  });

  // ==========================================================================
  // Area 5: CanonChangeRepo Boundary Conditions & Audit Trail
  // ==========================================================================
  describe('Area 5: CanonChangeRepo Boundary Conditions & Audit Trail', () => {
    it('should record canon change records with full state snapshots and confirmation tokens', () => {
      const record = dbManager.canonChanges.recordChange({
        change_type: 'PROMOTE_CANON',
        target_type: 'source_file',
        target_id: '04_Planets/Terra.md',
        target_db_id: 10,
        before_state_json: { canon_level: 1, review_status: 'draft' },
        after_state_json: { canon_level: 3, review_status: 'confirmed' },
        confirmation_token: 'CONFIRM_CANON_CHANGE',
        confirmed_by_flag: 1,
        operator: 'lead_author',
        reason: 'Passed lore review milestone',
        impact_summary_json: { affected_entities: ['PL-001'], affected_chapters: [1, 2] }
      });

      assert.ok(record.id);
      assert.equal(record.change_type, 'PROMOTE_CANON');
      assert.equal(record.target_type, 'source_file');
      assert.equal(record.target_id, '04_Planets/Terra.md');
      assert.equal(record.confirmation_token, 'CONFIRM_CANON_CHANGE');
      assert.equal(record.confirmed_by_flag, 1);
      assert.equal(record.operator, 'lead_author');
      assert.equal(record.beforeState.canon_level, 1);
      assert.equal(record.afterState.canon_level, 3);
      assert.deepEqual(record.impactSummary.affected_chapters, [1, 2]);

      // Retrieve by ID
      const fetched = dbManager.canonChanges.getById(record.id);
      assert.equal(fetched.id, record.id);
      assert.equal(fetched.reason, 'Passed lore review milestone');
    });

    it('should support multi-criteria queries and summary aggregation in CanonChangeRepo', () => {
      dbManager.canonChanges.recordChange({
        change_type: 'PROMOTE_CANON',
        target_type: 'entity',
        target_id: 'PL-001',
        operator: 'editor_1'
      });
      dbManager.canonChanges.recordChange({
        change_type: 'DEPRECATE_SOURCE',
        target_type: 'source_file',
        target_id: '01_Worldview/Old_Draft.md',
        operator: 'editor_2'
      });
      dbManager.canonChanges.recordChange({
        change_type: 'SET_REVIEW_STATUS',
        target_type: 'entity',
        target_id: 'CHAR-007',
        operator: 'editor_1'
      });

      const editor1Changes = dbManager.canonChanges.query({ operator: 'editor_1' });
      assert.equal(editor1Changes.length, 2);

      const entityChanges = dbManager.canonChanges.getChangesForTarget('entity', 'PL-001');
      assert.equal(entityChanges.length, 1);
      assert.equal(entityChanges[0].target_id, 'PL-001');

      const summary = dbManager.canonChanges.getSummary();
      assert.equal(summary.totalChanges, 3);
      assert.equal(summary.byChangeType.PROMOTE_CANON, 1);
      assert.equal(summary.byChangeType.DEPRECATE_SOURCE, 1);
      assert.equal(summary.byChangeType.SET_REVIEW_STATUS, 1);
      assert.equal(summary.byTargetType.entity, 2);
      assert.equal(summary.byTargetType.source_file, 1);
      assert.ok(summary.lastChangeAt);
    });

    it('should handle complex JSON, Unicode and null states in CanonChangeRepo without corruption', () => {
      const unicodeObj = {
        chinese: '泰拉星际联邦设定',
        special: '🚀✨ 🔥 <script>alert("test")</script>',
        nested: { a: [1, 2, { b: 'ok' }] }
      };

      const record = dbManager.canonChanges.recordChange({
        change_type: 'MANUAL_OVERRIDE',
        target_type: 'entity',
        target_id: 'PL-001',
        before_state_json: null,
        after_state_json: unicodeObj
      });

      const retrieved = dbManager.canonChanges.getById(record.id);
      assert.equal(retrieved.beforeState, null);
      assert.equal(retrieved.afterState.chinese, '泰拉星际联邦设定');
      assert.equal(retrieved.afterState.special, '🚀✨ 🔥 <script>alert("test")</script>');
      assert.equal(retrieved.afterState.nested.a[2].b, 'ok');
    });
  });
});
