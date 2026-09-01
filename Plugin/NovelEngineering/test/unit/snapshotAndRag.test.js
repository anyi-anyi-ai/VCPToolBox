/**
 * @file snapshotAndRag.test.js
 * @description Unit and integration tests for Snapshot Engine and RAG Corpus Exporter (Milestone 5)
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const DatabaseManager = require('../../src/db/DatabaseManager');
const SnapshotEngine = require('../../src/snapshot/SnapshotEngine');
const RagCorpusExporter = require('../../src/rag/RagCorpusExporter');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');

describe('Milestone 5: Project Snapshots & RAG Corpus Export', () => {
  let tempDir;
  let dbManager;
  let dispatcher;
  let snapshotEngine;
  let ragExporter;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'novel_m5_test_'));
    const snapshotsDir = path.join(tempDir, 'data', 'snapshots');
    const ragDir = path.join(tempDir, 'data', 'rag_corpus');

    const pathGuard = new PathGuard({
      pluginRoot: tempDir,
      vaultRoot: path.join(tempDir, 'vault')
    });

    dbManager = DatabaseManager.initDatabase(':memory:', { pathGuard });
    dispatcher = new CommandDispatcher({ dbManager, pathGuard, basePath: tempDir });
    snapshotEngine = new SnapshotEngine(dbManager, { snapshotsDir, pathGuard });
    ragExporter = new RagCorpusExporter(dbManager, { ragDir, pathGuard });

    const db = dbManager.getDatabase();

    // Populate initial data
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, 'H:/mock/01_Worldview/Axiom.md', '01_Worldview/Axiom.md', 'Axiom.md', '.md', 400, 1700000000, 'hash1', 'world_rule', 'active', 'reviewed', 3, 400),
             (2, 'H:/mock/04_Entities/Planets/Terra.md', '04_Entities/Planets/Terra.md', 'Terra.md', '.md', 800, 1700000000, 'hash2', 'entity', 'active', 'reviewed', 2, 800),
             (3, 'H:/mock/04_Entities/Drafts/OldIdea.md', '04_Entities/Drafts/OldIdea.md', 'OldIdea.md', '.md', 300, 1700000000, 'hash3', 'draft', 'draft', 'pending', 0, 300)
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'ENT-AXIOM', 'Speed of Light', 'concept', 'active', 'reviewed', 3, 1),
             (2, 'ENT-TERRA', 'Terra Prime', 'planet', 'active', 'reviewed', 2, 2),
             (3, 'ENT-IDEA', 'Dark Void Ship', 'technology', 'draft', 'pending', 0, 3)
    `).run();

    db.prepare(`
      INSERT INTO entity_relations (id, source_entity_id, target_entity_id, relation_type, confidence)
      VALUES (1, 2, 1, 'governed_by', 1.0)
    `).run();

    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, status, canon)
      VALUES (1, 1, 1, 'First Steps', '03_Chapters/CH_01.md', 2, 'completed', 1)
    `).run();
  });

  afterEach(() => {
    if (dbManager) dbManager.close();
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  describe('SnapshotEngine', () => {
    it('should create a complete JSON snapshot file with table statistics', () => {
      const result = snapshotEngine.createProjectSnapshot({
        snapshotName: 'm5_test_snap',
        description: 'Test backup before migration'
      });

      assert.ok(result.snapshotId.includes('m5_test_snap'));
      assert.ok(fs.existsSync(result.snapshotPath));
      assert.ok(result.fileSizeBytes > 0);
      assert.equal(result.tableStats.source_files, 3);
      assert.equal(result.tableStats.entities, 3);
      assert.equal(result.tableStats.entity_relations, 1);
    });

    it('should preview snapshot restoration diff safely', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'diff_preview_test' });

      // Modify database to create a diff
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (entity_id, canonical_name, entity_type) VALUES ('ENT-NEW', 'New Star', 'planet')").run();

      const preview = snapshotEngine.restoreProjectSnapshotPreview({ snapshotId: snap.snapshotId });

      assert.equal(preview.previewOnly, true);
      assert.equal(preview.safeToRestore, true);
      assert.equal(preview.requiredConfirmationToken, 'CONFIRM_RESTORE');
      assert.equal(preview.currentVsSnapshotDiff.entitiesDelta.live, 4);
      assert.equal(preview.currentVsSnapshotDiff.entitiesDelta.snapshot, 3);
      assert.equal(preview.currentVsSnapshotDiff.entitiesDelta.diff, -1);
    });

    it('should throw GovernanceSafetyError when restoring without confirmationToken', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'token_gate_test' });

      assert.throws(
        () => {
          snapshotEngine.restoreProjectSnapshot({ snapshotId: snap.snapshotId });
        },
        /GOVERNANCE_CONFIRMATION_REQUIRED/
      );
    });

    it('should successfully restore database state with confirmationToken', () => {
      const snap = snapshotEngine.createProjectSnapshot({ snapshotName: 'restore_exec_test' });

      // Mutate database: delete records and add garbage
      const db = dbManager.getDatabase();
      db.prepare('DELETE FROM entities').run();
      db.prepare('DELETE FROM source_files').run();
      assert.equal(db.prepare('SELECT COUNT(*) as c FROM entities').get().c, 0);

      // Execute restoration
      const restoreRes = snapshotEngine.restoreProjectSnapshot({
        snapshotId: snap.snapshotId,
        confirmationToken: 'CONFIRM_RESTORE'
      });

      assert.equal(restoreRes.success, true);
      assert.equal(restoreRes.restoredTables.entities, 3);
      assert.equal(restoreRes.restoredTables.source_files, 3);

      // Verify DB content recovered
      const restoredEnts = db.prepare('SELECT * FROM entities ORDER BY id ASC').all();
      assert.equal(restoredEnts.length, 3);
      assert.equal(restoredEnts[0].entity_id, 'ENT-AXIOM');
    });
  });

  describe('RagCorpusExporter', () => {
    it('should build manifest.jsonl with accurate metadata and token estimates', () => {
      const res = ragExporter.buildRagCorpusManifest();

      assert.ok(fs.existsSync(res.manifestPath));
      assert.equal(res.totalDocuments, 3);
      assert.ok(res.estimatedTokens > 0);
      assert.equal(res.categoryBreakdown.world_rule, 1);
      assert.equal(res.categoryBreakdown.entity, 1);
      assert.equal(res.categoryBreakdown.draft, 1);

      // Inspect jsonl file content
      const lines = fs.readFileSync(res.manifestPath, 'utf8').trim().split('\n');
      assert.equal(lines.length, 3);
      const parsedFirst = JSON.parse(lines[0]);
      assert.ok(parsedFirst.id);
      assert.ok(parsedFirst.doc_type);
      assert.ok(parsedFirst.sha256);
    });

    it('should export clean Markdown files separating canon from candidate corpora', () => {
      const res = ragExporter.exportRagSources();

      assert.ok(fs.existsSync(res.canonCorpusDir));
      assert.ok(fs.existsSync(res.creativeCorpusDir));
      assert.ok(fs.existsSync(res.manifestJsonlPath));

      assert.equal(res.canonFilesCount, 2, 'Canon level >= 2 items go to canon/');
      assert.equal(res.creativeFilesCount, 1, 'Draft items go to candidate/');
      assert.equal(res.totalExportedFiles, 3);

      const canonFiles = fs.readdirSync(res.canonCorpusDir);
      assert.equal(canonFiles.length, 2);
      const creativeFiles = fs.readdirSync(res.creativeCorpusDir);
      assert.equal(creativeFiles.length, 1);
    });
  });

  describe('CommandDispatcher Snapshot & RAG Commands', () => {
    it('should dispatch CreateProjectSnapshot, RestoreProjectSnapshotPreview, RestoreProjectSnapshot', async () => {
      const createRes = await dispatcher.dispatch('CreateProjectSnapshot', { snapshotName: 'cli_test' });
      assert.equal(createRes.status, 'success');
      assert.ok(createRes.snapshotId);

      const prevRes = await dispatcher.dispatch('RestoreProjectSnapshotPreview', { snapshotId: createRes.snapshotId });
      assert.equal(prevRes.status, 'success');
      assert.equal(prevRes.safeToRestore, true);

      const restRes = await dispatcher.dispatch('RestoreProjectSnapshot', {
        snapshotId: createRes.snapshotId,
        confirmationToken: 'CONFIRM_RESTORE'
      });
      assert.equal(restRes.status, 'success');
      assert.ok(restRes.restoredTables);
    });

    it('should dispatch BuildRagCorpusManifest and ExportRagSources', async () => {
      const manifestRes = await dispatcher.dispatch('BuildRagCorpusManifest');
      assert.equal(manifestRes.status, 'success');
      assert.ok(manifestRes.totalDocuments >= 3);

      const exportRes = await dispatcher.dispatch('ExportRagSources');
      assert.equal(exportRes.status, 'success');
      assert.ok(exportRes.totalExportedFiles >= 3);
    });
  });
});
