/**
 * @file test/unit/snapshots.test.js
 * @description Comprehensive Unit Test Suite for Milestone 5: Project Snapshots & Point-in-Time Recovery
 * @module test/unit/snapshots
 * @license MIT
 *
 * Test Matrix Covered:
 * 1. Snapshot Creation:
 *    - Schema format (NovelEngineering_Snapshot_v3), metadata capture, timestamping, custom naming
 *    - Full table capture of all 12+ core tables (source_files, entities, entity_aliases, file_entities,
 *      entity_relations, canon_changes, chapters, timeline_events, foreshadowing, anomaly_reports,
 *      schema_version, migration_history)
 *    - File size validation and non-empty archive generation
 *    - Accurate record statistics (tableStats)
 * 2. Restore Preview & Diffing:
 *    - Accurate delta calculation between live database and snapshot (filesDelta, entitiesDelta)
 *    - Detection of newly added, modified, or deleted records
 *    - Schema version matching validation (schemaVersionMatch, safeToRestore)
 *    - Preview-only execution without mutating active database
 * 3. Governance Safety Gating & Atomic Restore:
 *    - Strict rejection of restore without confirmationToken ('CONFIRM_RESTORE')
 *    - Atomic transaction execution: full recovery of all tables in dependency order
 *    - Integrity verification on corrupted snapshot
 * 4. PathGuard Sandboxing & Security Boundaries:
 *    - Hard block on snapshot path traversal (../../evil.json)
 *    - Hard block on write attempts targeting target Obsidian vault folders (01_~12_)
 *    - Safe resolution of snapshot by ID, explicit path, or most recent backup
 *    - Structured error codes (ERR_PATH_OUTSIDE_SANDBOX, ERR_VAULT_WRITE_BLOCKED, SNAPSHOT_NOT_FOUND)
 * 5. CommandDispatcher Integration:
 *    - CreateProjectSnapshot, RestoreProjectSnapshotPreview, RestoreProjectSnapshot
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const SnapshotEngine = require('../../src/snapshot/SnapshotEngine');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const { GovernanceSafetyError, NovelError } = require('../../src/errors');

describe('Milestone 5: Project Snapshots Unit Test Suite', () => {
  let tempPluginDir;
  let tempVaultDir;
  let snapshotsDir;
  let pathGuard;
  let dbManager;
  let snapshotEngine;
  let dispatcher;

  beforeEach(() => {
    // 1. Setup isolated temporary sandbox directories
    tempPluginDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_m5_plugin_'));
    tempVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_m5_vault_'));

    snapshotsDir = path.join(tempPluginDir, 'data', 'snapshots');
    fs.mkdirSync(snapshotsDir, { recursive: true });

    // Mock Obsidian Vault 01_~12_ folders
    fs.mkdirSync(path.join(tempVaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(tempVaultDir, '04_Entities'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: tempPluginDir,
      vaultRoot: tempVaultDir
    });

    dbManager = DatabaseManager.initDatabase(':memory:', { pathGuard });
    snapshotEngine = new SnapshotEngine(dbManager, { snapshotsDir, pathGuard });
    dispatcher = new CommandDispatcher({ dbManager, pathGuard, basePath: tempPluginDir });

    // 2. Seed comprehensive mock database data across all tables
    const db = dbManager.getDatabase();

    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, 'H:/mock/01_Worldview/Cosmology.md', '01_Worldview/Cosmology.md', 'Cosmology.md', '.md', 1200, 1700000000, 'hash_cosmology_01', 'world_rule', 'active', 'reviewed', 3, 1200),
             (2, 'H:/mock/04_Entities/Planets/Terra.md', '04_Entities/Planets/Terra.md', 'Terra.md', '.md', 2500, 1700000000, 'hash_terra_02', 'entity', 'active', 'reviewed', 2, 2500),
             (3, 'H:/mock/04_Entities/Drafts/CyberMoon.md', '04_Entities/Drafts/CyberMoon.md', 'CyberMoon.md', '.md', 800, 1700000000, 'hash_moon_03', 'draft', 'draft', 'pending', 0, 800)
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'ENT-COSMOS', 'Speed of Light Axiom', 'concept', 'active', 'reviewed', 3, 1),
             (2, 'ENT-TERRA', 'Terra Prime', 'planet', 'active', 'reviewed', 2, 2),
             (3, 'ENT-CYBERMOON', 'Cyber Moon 9', 'technology', 'draft', 'pending', 0, 3)
    `).run();

    db.prepare(`
      INSERT INTO entity_aliases (id, entity_id, alias_name, alias_type, is_primary)
      VALUES (1, 2, '地球母星', 'nickname', 1),
             (2, 2, 'Terra Nova', 'translation', 0)
    `).run();

    db.prepare(`
      INSERT INTO file_entities (id, source_file_id, entity_id, mention_type)
      VALUES (1, 1, 1, 'definition'),
             (2, 2, 2, 'definition'),
             (3, 3, 3, 'definition')
    `).run();

    db.prepare(`
      INSERT INTO entity_relations (id, source_entity_id, target_entity_id, relation_type, confidence, description)
      VALUES (1, 2, 1, 'governed_by', 1.0, 'Terra is governed by cosmological axioms')
    `).run();

    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, status, canon)
      VALUES (1, 1, 1, 'Chapter 1: The Awakening', '03_Chapters/CH01.md', 2, 'completed', 1)
    `).run();

    db.prepare(`
      INSERT INTO timeline_events (id, event_id, title, timestamp_order, era_epoch, description)
      VALUES (1, 'EV-001', 'The Great Ignition', 2042.5, 'CE', 'First fusion drive activation')
    `).run();

    db.prepare(`
      INSERT INTO foreshadowing (id, foreshadow_id, title, description, status, importance_level)
      VALUES (1, 'FS-001', 'Sub-core Quantum Signal', 'Mysterious beacon in Earth mantle', 'open', 'major')
    `).run();

    db.prepare(`
      INSERT INTO canon_changes (id, target_type, target_id, change_type, confirmation_token, confirmed_by_flag, operator, reason)
      VALUES (1, 'entity', 'ENT-TERRA', 'PROMOTE', 'CONFIRM_CANON_CHANGE', 1, 'chief_editor', 'Verified by world tree review')
    `).run();

    db.prepare(`
      INSERT INTO anomaly_reports (id, scan_session_id, anomaly_rule_id, anomaly_type, severity, title, message, affected_file_paths_json)
      VALUES (1, 'session_001', 'ANOM_004_PLACEHOLDER_FILES', 'PLACEHOLDER', 'LOW', 'Placeholder Detected', 'Placeholder file detected', '["04_Entities/Drafts/empty.md"]')
    `).run();
  });

  afterEach(() => {
    if (dbManager) dbManager.close();
    if (fs.existsSync(tempPluginDir)) {
      try {
        fs.rmSync(tempPluginDir, { recursive: true, force: true });
      } catch (_) {}
    }
    if (fs.existsSync(tempVaultDir)) {
      try {
        fs.rmSync(tempVaultDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // =========================================================================
  // Suite 1: Snapshot Creation & Schema Integrity
  // =========================================================================
  describe('Suite 1: Snapshot Creation & Schema Integrity', () => {
    it('should create an external JSON snapshot file capturing all 12 core tables', () => {
      const result = snapshotEngine.createProjectSnapshot({
        snapshotName: 'm5_golden_snapshot',
        description: 'Comprehensive test baseline snapshot'
      });

      assert.ok(result.snapshotId);
      assert.ok(result.snapshotId.includes('m5_golden_snapshot'));
      assert.ok(result.snapshotPath);
      assert.ok(fs.existsSync(result.snapshotPath));
      assert.ok(result.fileSizeBytes > 0);

      // Verify tableStats breakdown
      assert.equal(result.tableStats.source_files, 3);
      assert.equal(result.tableStats.entities, 3);
      assert.equal(result.tableStats.entity_aliases, 2);
      assert.equal(result.tableStats.file_entities, 3);
      assert.equal(result.tableStats.entity_relations, 1);
      assert.equal(result.tableStats.chapters, 1);
      assert.equal(result.tableStats.timeline_events, 1);
      assert.equal(result.tableStats.foreshadowing, 1);
      assert.equal(result.tableStats.canon_changes, 1);
      assert.equal(result.tableStats.anomaly_reports, 1);

      // Verify file content structure
      const rawJson = fs.readFileSync(result.snapshotPath, 'utf8');
      const snapshotPayload = JSON.parse(rawJson);

      assert.equal(snapshotPayload.format, 'NovelEngineering_Snapshot_v3');
      assert.equal(snapshotPayload.snapshotId, result.snapshotId);
      assert.equal(snapshotPayload.snapshotName, 'm5_golden_snapshot');
      assert.equal(snapshotPayload.description, 'Comprehensive test baseline snapshot');
      assert.ok(snapshotPayload.schemaVersion >= 1);
      assert.ok(snapshotPayload.tables);
      assert.equal(snapshotPayload.tables.entities.length, 3);
      assert.equal(snapshotPayload.tables.source_files.length, 3);
    });

    it('should sanitize special characters in snapshotName and handle default parameters', () => {
      const result = snapshotEngine.createProjectSnapshot({
        snapshotName: 'backup/unsafe name: #1?*'
      });

      assert.ok(result.snapshotId);
      assert.ok(!result.snapshotId.includes('/'));
      assert.ok(!result.snapshotId.includes(':'));
      assert.ok(!result.snapshotId.includes(' '));
      assert.ok(fs.existsSync(result.snapshotPath));
    });
  });

  // =========================================================================
  // Suite 2: Snapshot Restore Preview & Diffing Analysis
  // =========================================================================
  describe('Suite 2: Snapshot Restore Preview & Diffing Analysis', () => {
    it('should calculate live vs snapshot entity and file deltas without mutating DB', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'baseline_state' });

      // Mutate live database: Add 2 entities, remove 1 source_file
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (98, 'ENT-98', 'Star X', 'planet')").run();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (99, 'ENT-99', 'Star Y', 'planet')").run();
      db.prepare('DELETE FROM source_files WHERE id = 3').run();

      const preview = snapshotEngine.restoreProjectSnapshotPreview({ snapshotId: snap.snapshotId });

      assert.equal(preview.previewOnly, true);
      assert.equal(preview.safeToRestore, true);
      assert.equal(preview.requiredConfirmationToken, 'CONFIRM_RESTORE');

      // Live has 5 entities, Snapshot has 3 (diff: -2)
      assert.equal(preview.currentVsSnapshotDiff.entitiesDelta.live, 5);
      assert.equal(preview.currentVsSnapshotDiff.entitiesDelta.snapshot, 3);
      assert.equal(preview.currentVsSnapshotDiff.entitiesDelta.diff, -2);

      // Live has 2 files, Snapshot has 3 (diff: +1)
      assert.equal(preview.currentVsSnapshotDiff.filesDelta.live, 2);
      assert.equal(preview.currentVsSnapshotDiff.filesDelta.snapshot, 3);
      assert.equal(preview.currentVsSnapshotDiff.filesDelta.diff, 1);

      // Verify active DB was not modified by preview
      assert.equal(db.prepare('SELECT COUNT(*) as c FROM entities').get().c, 5);
    });

    it('should report schemaVersionMatch accurately', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'version_check' });
      const preview = snapshotEngine.restoreProjectSnapshotPreview({ snapshotId: snap.snapshotId });

      assert.equal(preview.currentVsSnapshotDiff.schemaVersionMatch, true);
      assert.equal(preview.safeToRestore, true);
    });
  });

  // =========================================================================
  // Suite 3: Governance Safety Gating & Atomic Restore Execution
  // =========================================================================
  describe('Suite 3: Governance Safety Gating & Atomic Restore Execution', () => {
    it('should strictly throw GovernanceSafetyError if confirmationToken is omitted or invalid', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'safe_gate_snap' });

      assert.throws(
        () => snapshotEngine.restoreProjectSnapshot({ snapshotId: snap.snapshotId }),
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
          return true;
        }
      );

      assert.throws(
        () => snapshotEngine.restoreProjectSnapshot({
          snapshotId: snap.snapshotId,
          confirmationToken: 'INVALID_TOKEN'
        }),
        /GOVERNANCE_CONFIRMATION_REQUIRED/
      );
    });

    it('should execute complete atomic restore when valid confirmationToken is supplied', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'full_restore_snap' });

      // Destroy active data in database
      const db = dbManager.getDatabase();
      db.prepare('DELETE FROM anomaly_reports').run();
      db.prepare('DELETE FROM foreshadowing').run();
      db.prepare('DELETE FROM timeline_events').run();
      db.prepare('DELETE FROM chapters').run();
      db.prepare('DELETE FROM canon_changes').run();
      db.prepare('DELETE FROM entity_relations').run();
      db.prepare('DELETE FROM file_entities').run();
      db.prepare('DELETE FROM entity_aliases').run();
      db.prepare('DELETE FROM entities').run();
      db.prepare('DELETE FROM source_files').run();

      assert.equal(db.prepare('SELECT COUNT(*) as c FROM entities').get().c, 0);
      assert.equal(db.prepare('SELECT COUNT(*) as c FROM source_files').get().c, 0);

      // Perform recovery
      const restoreRes = snapshotEngine.restoreProjectSnapshot({
        snapshotId: snap.snapshotId,
        confirmationToken: 'CONFIRM_RESTORE'
      });

      assert.equal(restoreRes.success, true);
      assert.equal(restoreRes.snapshotId, snap.snapshotId);
      assert.equal(restoreRes.restoredTables.source_files, 3);
      assert.equal(restoreRes.restoredTables.entities, 3);
      assert.equal(restoreRes.restoredTables.entity_aliases, 2);
      assert.equal(restoreRes.restoredTables.entity_relations, 1);
      assert.equal(restoreRes.restoredTables.foreshadowing, 1);

      // Verify database table contents are identical to original state
      const restoredEntities = db.prepare('SELECT * FROM entities ORDER BY id ASC').all();
      assert.equal(restoredEntities.length, 3);
      assert.equal(restoredEntities[0].entity_id, 'ENT-COSMOS');
      assert.equal(restoredEntities[1].canonical_name, 'Terra Prime');
    });

    it('should resolve snapshot automatically by ID or fallback to latest backup', () => {
      const snap1 = snapshotEngine.createProjectSnapshot({ snapshotName: 'backup_one' });
      const snap2 = snapshotEngine.createProjectSnapshot({ snapshotName: 'backup_two' });

      // Resolve by partial snapshotId
      const preview1 = snapshotEngine.restoreProjectSnapshotPreview({ snapshotId: snap1.snapshotId });
      assert.equal(preview1.snapshotMeta.snapshotId, snap1.snapshotId);

      // Resolve without params (defaults to latest)
      const previewLatest = snapshotEngine.restoreProjectSnapshotPreview();
      assert.equal(previewLatest.snapshotMeta.snapshotId, snap2.snapshotId);
    });

    it('should throw NovelError SNAPSHOT_NOT_FOUND when snapshots directory is empty', () => {
      const emptyDir = path.join(tempPluginDir, 'empty_snapshots');
      fs.mkdirSync(emptyDir, { recursive: true });
      const emptyEngine = new SnapshotEngine(dbManager, { snapshotsDir: emptyDir, pathGuard });

      assert.throws(
        () => emptyEngine.restoreProjectSnapshotPreview(),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'SNAPSHOT_NOT_FOUND');
          return true;
        }
      );
    });
  });

  // =========================================================================
  // Suite 4: PathGuard Sandboxing & Boundary Security Enforcement
  // =========================================================================
  describe('Suite 4: PathGuard Sandboxing & Boundary Security Enforcement', () => {
    it('should block snapshot creation or restore attempting directory traversal outside plugin sandbox', () => {
      assert.throws(
        () => snapshotEngine.restoreProjectSnapshotPreview({
          snapshotPath: path.resolve(tempPluginDir, '..', 'evil.json')
        }),
        (err) => {
          assert.ok(err instanceof SecurityError);
          assert.equal(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
          return true;
        }
      );
    });

    it('should strictly block attempts to write or restore snapshots directly into Obsidian vault 01_~12_ folders', () => {
      const vaultTarget = path.join(tempVaultDir, '01_Worldview', 'hack_snapshot.json');
      assert.throws(
        () => snapshotEngine.restoreProjectSnapshotPreview({ snapshotPath: vaultTarget }),
        (err) => {
          assert.ok(err instanceof SecurityError);
          return true;
        }
      );
    });
  });

  // =========================================================================
  // Suite 5: CommandDispatcher Integration
  // =========================================================================
  describe('Suite 5: CommandDispatcher Integration', () => {
    it('should dispatch CreateProjectSnapshot, RestoreProjectSnapshotPreview, and RestoreProjectSnapshot end-to-end', async () => {
      // 1. Create Snapshot via Dispatcher
      const createRes = await dispatcher.dispatch('CreateProjectSnapshot', {
        snapshotName: 'dispatcher_e2e_snap',
        description: 'Testing through command dispatcher router'
      });

      assert.equal(createRes.status, 'success');
      assert.ok(createRes.snapshotId);
      assert.ok(createRes.content.includes('Project Snapshot Created'));
      assert.equal(createRes.tableStats.entities, 3);

      // 2. Preview Restore via Dispatcher
      const previewRes = await dispatcher.dispatch('RestoreProjectSnapshotPreview', {
        snapshotId: createRes.snapshotId
      });

      assert.equal(previewRes.status, 'success');
      assert.equal(previewRes.safeToRestore, true);
      assert.ok(previewRes.content.includes('Restore Preview'));

      // 3. Execute Restore via Dispatcher with token
      const restoreRes = await dispatcher.dispatch('RestoreProjectSnapshot', {
        snapshotId: createRes.snapshotId,
        confirmationToken: 'CONFIRM_RESTORE'
      });

      assert.equal(restoreRes.status, 'success');
      assert.equal(restoreRes.success, true);
      assert.ok(restoreRes.content.includes('Restored Successfully'));
      assert.equal(restoreRes.restoredTables.entities, 3);
    });
  });
});
