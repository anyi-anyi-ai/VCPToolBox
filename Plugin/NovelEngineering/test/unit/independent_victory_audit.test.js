/**
 * @file independent_victory_audit.test.js
 * @description Independent Victory Audit Verification Suite for VCPNovelManager Phase 1 MVP
 * Validating Requirements R1-R6 and Acceptance Criteria 1-3 under Benchmark Mode.
 */

'use strict';

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const PLUGIN_ROOT = path.resolve(__dirname, '..', '..');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const DirectoryScanner = require('../../src/scanner/DirectoryScanner');
const FrontmatterParser = require('../../src/scanner/FrontmatterParser');
const FileClassifier = require('../../src/scanner/FileClassifier');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');
const MicroWorldTreeGenerator = require('../fixtures/MicroWorldTreeGenerator');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');

describe('VICTORY AUDIT: Independent Verification Suite (R1-R6, AC1-AC3)', () => {
  let tempEnvDir = null;
  let mockVaultDir = null;
  let mockPluginDbDir = null;

  before(() => {
    tempEnvDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_victory_audit_'));
    mockVaultDir = path.join(tempEnvDir, 'mock_vault');
    mockPluginDbDir = path.join(tempEnvDir, 'plugin_db');
    fs.mkdirSync(mockVaultDir, { recursive: true });
    fs.mkdirSync(mockPluginDbDir, { recursive: true });
  });

  after(() => {
    if (tempEnvDir && fs.existsSync(tempEnvDir)) {
      try {
        fs.rmSync(tempEnvDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // =========================================================================
  // Requirement R1 & Acceptance Criteria 1: Plugin Specification & Manifest
  // =========================================================================
  describe('R1 & AC1: Plugin Architecture & Manifest Verification', () => {
    test('plugin-manifest.json must be valid and conform to VCP plugin specifications', () => {
      const manifestPath = path.join(PLUGIN_ROOT, 'plugin-manifest.json');
      assert.ok(fs.existsSync(manifestPath), 'plugin-manifest.json must exist');

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      assert.equal(manifest.name, 'NovelEngineering');
      assert.equal(manifest.pluginType, 'synchronous');
      assert.equal(manifest.entryPoint.command, 'node NovelEngineering.js');
      assert.equal(manifest.communication.protocol, 'stdio');
      assert.ok(manifest.configSchema, 'configSchema must be declared');
      assert.ok(manifest.capabilities && Array.isArray(manifest.capabilities.invocationCommands), 'invocationCommands must be declared');

      const requiredCommands = [
        'ScanWorldTree',
        'BuildSourceManifest',
        'ClassifySourceFiles',
        'DetectPlaceholderFiles',
        'DetectDuplicateEntities',
        'DetectLegacyIdConflicts',
        'GetSourceFile',
        'QueryEntities',
        'ExportImportReport'
      ];

      const declaredCommands = manifest.capabilities.invocationCommands.map(c => c.command);
      for (const reqCmd of requiredCommands) {
        assert.ok(declaredCommands.includes(reqCmd), `Declared commands must include "${reqCmd}"`);
      }
    });

    test('NovelEngineering.js CLI entrypoint must parse stdio JSON RPC and return valid envelopes', () => {
      const entryPath = path.join(PLUGIN_ROOT, 'NovelEngineering.js');
      const payload = JSON.stringify({ action: 'ping', parameters: {} });

      const res = spawnSync('node', [entryPath], {
        input: payload,
        encoding: 'utf8',
        cwd: PLUGIN_ROOT
      });

      assert.equal(res.status, 0, 'CLI entrypoint must exit with code 0');
      const stdoutLines = res.stdout.trim().split(/\r?\n/).filter(Boolean);
      assert.equal(stdoutLines.length, 1, 'Stdout must emit exactly one single-line JSON');

      const parsed = JSON.parse(stdoutLines[0]);
      assert.equal(parsed.status, 'success');
      assert.equal(parsed.result.pong, true);
    });
  });

  // =========================================================================
  // Requirement R2: Structured SQLite Index (Schema & Repositories)
  // =========================================================================
  describe('R2: SQLite Schema & CRUD Layer Verification', () => {
    test('DatabaseManager must initialize all 9 tables and enforce WAL/Foreign Keys', () => {
      const dbPath = path.join(mockPluginDbDir, 'test_index.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnvDir });
      const dbManager = new DatabaseManager(dbPath, { pathGuard });

      const tableNames = dbManager.getTableNames();
      const expectedTables = [
        'anomaly_reports',
        'chapters',
        'entities',
        'entity_aliases',
        'file_entities',
        'foreshadowing',
        'scan_manifests',
        'source_files',
        'timeline_events'
      ];

      for (const tbl of expectedTables) {
        assert.ok(tableNames.includes(tbl), `Table "${tbl}" must be created`);
      }

      const stats = dbManager.getStats();
      assert.equal(stats.foreignKeysEnabled, true, 'Foreign keys must be ON');
      assert.equal(stats.journalMode.toLowerCase(), 'wal', 'Journal mode must be WAL');

      dbManager.close();
    });

    test('Database Repositories must perform typed CRUD, relational cascades, and transactions', () => {
      const dbPath = path.join(mockPluginDbDir, 'crud_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnvDir });
      const dbManager = new DatabaseManager(dbPath, { pathGuard });

      // 1. Insert Source File
      const file = dbManager.sourceFiles.insert({
        file_path: '/vault/02_Entities/Planets/PL001_Terra.md',
        relative_path: '02_Entities/Planets/PL001_Terra.md',
        file_name: 'PL001_Terra.md',
        size_bytes: 1024,
        mtime_ms: Date.now(),
        sha256_hash: 'a'.repeat(64),
        source_category: 'planet_system',
        status: 'active',
        review_status: 'confirmed',
        has_frontmatter: 1,
        frontmatter_json: { id: 'PL-001', name: '泰拉' }
      });
      assert.ok(file.id > 0);

      // 2. Insert Entity with Aliases
      const entity = dbManager.entities.insert({
        entity_id: 'PL-001',
        canonical_name: '泰拉',
        entity_type: 'planet',
        source_file_id: file.id
      }, ['地球', '母星']);
      assert.ok(entity.id > 0);
      assert.equal(entity.aliases.length, 2);

      // 3. Foreign Key Cascade on deletion
      dbManager.sourceFiles.deleteById(file.id);
      const remainingEntities = dbManager.entities.query({ source_file_id: file.id });
      assert.equal(remainingEntities.length, 0, 'Entities must be cascaded on file deletion');

      dbManager.close();
    });
  });

  // =========================================================================
  // Requirement R3 & AC2: Read-Only Scanner, Classifier & Incremental Update
  // =========================================================================
  describe('R3 & AC2: Read-Only Scanner, Classifier & Incremental Indexer', () => {
    let generator = null;
    let vaultInfo = null;

    before(() => {
      generator = new MicroWorldTreeGenerator({ targetDir: mockVaultDir });
      vaultInfo = generator.generate();
    });

    test('DirectoryScanner must stream traversal and discover all vault files', async () => {
      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(mockVaultDir);
      assert.equal(files.length, vaultInfo.totalFiles, 'Scanner must discover all synthetic files');
    });

    test('FileClassifier must classify files into 5-tier taxonomy and extract domain models', () => {
      const sample = vaultInfo.files.find(f => f.relativePath.includes('Taranto_PL001.md'));
      const rawContent = fs.readFileSync(sample.absolutePath, 'utf8');

      const result = FileClassifier.classify({
        relativePath: sample.relativePath,
        absolutePath: sample.absolutePath,
        fileName: path.basename(sample.relativePath),
        fileSize: sample.sizeBytes,
        rawContent
      });

      assert.equal(result.sourceCategory, 'planet_system');
      assert.equal(result.status, 'active');
      assert.equal(result.reviewStatus, 'confirmed');
      assert.ok(result.entity, 'Entity must be extracted');
      assert.equal(result.entity.entity_id, 'PL-001');
      assert.equal(result.entity.canonical_name, '塔兰托');
    });

    test('IncrementalIndexer must execute 2-stage change detection accurately', async () => {
      const dbPath = path.join(mockPluginDbDir, 'indexer_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnvDir });
      const dbManager = new DatabaseManager(dbPath, { pathGuard });

      const indexer = new IncrementalIndexer(dbManager);

      // Pass 1: Full Initial Sync
      const pass1 = await indexer.sync(mockVaultDir);
      assert.equal(pass1.filesAdded, vaultInfo.totalFiles);
      assert.equal(pass1.filesUnchanged, 0);

      // Pass 2: Immediate rescan (Stage 1 Cache Hit)
      const pass2 = await indexer.sync(mockVaultDir);
      assert.equal(pass2.filesAdded, 0);
      assert.equal(pass2.filesUpdated, 0);
      assert.equal(pass2.filesUnchanged, vaultInfo.totalFiles, 'All files must hit Stage 1 cache');

      // Stage 2 Hash Hit: Touch mtime without content modification
      const touchFile = vaultInfo.files[0].absolutePath;
      const now = new Date();
      fs.utimesSync(touchFile, now, now);

      const pass3 = await indexer.sync(mockVaultDir);
      assert.equal(pass3.filesUnchanged, vaultInfo.totalFiles, 'File with touched mtime must hit Stage 2 hash cache');

      dbManager.close();
    });
  });

  // =========================================================================
  // Requirement R4 & AC3: 10 Anomaly & Conflict Detection Rules
  // =========================================================================
  describe('R4 & AC3: 10 Anomaly & Conflict Detection (100% Precision & Recall)', () => {
    test('AnomalyEngine must achieve 100% recall on 10 embedded anomalies and 0 false positives on controls', async () => {
      const dbPath = path.join(mockPluginDbDir, 'anomaly_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnvDir });
      const dbManager = new DatabaseManager(dbPath, { pathGuard });

      const indexer = new IncrementalIndexer(dbManager);
      const syncResult = await indexer.sync(mockVaultDir);

      const anomalyEngine = new AnomalyEngine();
      const anomalyResult = anomalyEngine.runAll(dbManager, syncResult.scanSessionId, { persist: true });

      assert.equal(anomalyResult.totalAnomalies, 10, 'Must detect exactly 10 anomaly instances');

      const expectedRules = [
        'ANOM_001_SAME_NAME_DIFF_ID',
        'ANOM_002_SAME_ID_MULTI_ENTITY',
        'ANOM_003_HISTORICAL_VERSION_DUPLICATION',
        'ANOM_004_PLACEHOLDER_STUB_FILE',
        'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT',
        'ANOM_006_AI_HUMAN_MIXED_DATA',
        'ANOM_007_DANGLING_CROSS_REFERENCE',
        'ANOM_008_ALIAS_CROSS_COLLISION',
        'ANOM_009_TIMELINE_CHRONOLOGY_ORDER',
        'ANOM_010_FORESHADOWING_UNCLOSED_STATUS'
      ];

      const detectedRuleIds = anomalyResult.anomalies.map(a => a.anomaly_rule_id);
      for (const rId of expectedRules) {
        assert.ok(detectedRuleIds.includes(rId), `Rule "${rId}" must be detected`);
        const count = detectedRuleIds.filter(id => id === rId).length;
        assert.equal(count, 1, `Rule "${rId}" must have exactly 1 occurrence`);
      }

      // Check severity breakdown
      assert.ok(anomalyResult.breakdown.CRITICAL >= 1, 'Must have CRITICAL anomaly');
      assert.ok(anomalyResult.breakdown.HIGH >= 3, 'Must have HIGH anomalies');
      assert.ok(anomalyResult.breakdown.MEDIUM >= 4, 'Must have MEDIUM anomalies');
      assert.ok(anomalyResult.breakdown.LOW >= 2, 'Must have LOW anomalies');

      dbManager.close();
    });
  });

  // =========================================================================
  // Requirement R5: 9 Core Commands Dispatching
  // =========================================================================
  describe('R5: All 9 Core MVP Commands Dispatching', () => {
    let dispatcher = null;
    let dbManager = null;

    before(async () => {
      const dbPath = path.join(mockPluginDbDir, 'commands_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnvDir });
      dbManager = new DatabaseManager(dbPath, { pathGuard });
      const indexer = new IncrementalIndexer(dbManager);
      await indexer.sync(mockVaultDir);

      dispatcher = new CommandDispatcher({
        basePath: tempEnvDir,
        dbPath,
        dbManager,
        pathGuard
      });
    });

    after(() => {
      if (dispatcher) dispatcher.close();
    });

    test('1. ScanWorldTree command', async () => {
      const res = await dispatcher.dispatch('ScanWorldTree', { vaultPath: mockVaultDir });
      assert.equal(res.details.command, 'ScanWorldTree');
      assert.ok(res.details.summary.totalFilesScanned > 0);
    });

    test('2. BuildSourceManifest command', async () => {
      const res = await dispatcher.dispatch('BuildSourceManifest', {});
      assert.equal(res.details.command, 'BuildSourceManifest');
      assert.ok(res.details.manifest.length > 0);
    });

    test('3. ClassifySourceFiles command', async () => {
      const res = await dispatcher.dispatch('ClassifySourceFiles', { targetPath: '*' });
      assert.equal(res.details.command, 'ClassifySourceFiles');
      assert.ok(res.details.results.length > 0);
    });

    test('4. DetectPlaceholderFiles command', async () => {
      const res = await dispatcher.dispatch('DetectPlaceholderFiles', { maxSizeBytes: 50 });
      assert.equal(res.details.command, 'DetectPlaceholderFiles');
      assert.equal(res.details.placeholderCount, 1);
    });

    test('5. DetectDuplicateEntities command', async () => {
      const res = await dispatcher.dispatch('DetectDuplicateEntities', {});
      assert.equal(res.details.command, 'DetectDuplicateEntities');
      assert.ok(res.details.collisionCount >= 2);
    });

    test('6. DetectLegacyIdConflicts command', async () => {
      const res = await dispatcher.dispatch('DetectLegacyIdConflicts', {});
      assert.equal(res.details.command, 'DetectLegacyIdConflicts');
      assert.ok(res.details.conflictCount >= 1);
    });

    test('7. GetSourceFile command', async () => {
      const res = await dispatcher.dispatch('GetSourceFile', { filePath: '02_Entities/Planets/Taranto_PL001.md' });
      assert.equal(res.details.command, 'GetSourceFile');
      assert.equal(res.details.file.relativePath, '02_Entities/Planets/Taranto_PL001.md');
    });

    test('8. QueryEntities command', async () => {
      const res = await dispatcher.dispatch('QueryEntities', { query: '塔兰托' });
      assert.equal(res.details.command, 'QueryEntities');
      assert.ok(res.details.entities.length >= 1);
    });

    test('9. ExportImportReport command', async () => {
      const reportPath = path.join(tempEnvDir, 'reports', 'audit_report.json');
      const res = await dispatcher.dispatch('ExportImportReport', { outputPath: reportPath, format: 'both' });
      assert.equal(res.details.command, 'ExportImportReport');
      assert.ok(fs.existsSync(res.details.savedJsonPath));
      assert.ok(fs.existsSync(res.details.savedMarkdownPath));
    });
  });

  // =========================================================================
  // Requirement R6 & AC2: Zero Mutation & Security Sandbox Boundary
  // =========================================================================
  describe('R6 & AC2: Mathematical Zero-Mutation & Sandbox Verification', () => {
    test('Vault SHA-256 tree hash must remain bit-for-bit unchanged across full operations', async () => {
      const preScanHash = MicroWorldTreeGenerator.computeTreeHash(mockVaultDir);

      const dbPath = path.join(mockPluginDbDir, 'zero_mut_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnvDir });
      const dbManager = new DatabaseManager(dbPath, { pathGuard });

      // Run sync, 10 anomaly rules, command dispatcher operations, and export report
      const indexer = new IncrementalIndexer(dbManager);
      const syncResult = await indexer.sync(mockVaultDir);

      const anomalyEngine = new AnomalyEngine();
      anomalyEngine.runAll(dbManager, syncResult.scanSessionId, { persist: true });

      const dispatcher = new CommandDispatcher({
        basePath: tempEnvDir,
        dbPath,
        dbManager,
        pathGuard
      });

      await dispatcher.dispatch('ScanWorldTree', { vaultPath: mockVaultDir });
      await dispatcher.dispatch('BuildSourceManifest', {});
      await dispatcher.dispatch('ClassifySourceFiles', { targetPath: '*' });
      await dispatcher.dispatch('DetectPlaceholderFiles', {});
      await dispatcher.dispatch('DetectDuplicateEntities', {});
      await dispatcher.dispatch('DetectLegacyIdConflicts', {});
      await dispatcher.dispatch('GetSourceFile', { filePath: '01_Worldview/World_Cosmology_Canon.md', includeRawContent: true });
      await dispatcher.dispatch('QueryEntities', { query: '林远' });
      await dispatcher.dispatch('ExportImportReport', { outputPath: path.join(tempEnvDir, 'reports', 'final_audit.json') });

      dispatcher.close();
      dbManager.close();

      const postScanHash = MicroWorldTreeGenerator.computeTreeHash(mockVaultDir);
      assert.equal(postScanHash, preScanHash, 'Pre-scan and post-scan SHA-256 tree hash must match bit-for-bit');
    });

    test('PathGuard must actively block any write attempt targeting inside the vault or outside sandbox', () => {
      const pathGuard = new PathGuard({
        pluginRoot: tempEnvDir,
        vaultRoot: mockVaultDir
      });

      // 1. Vault write attempt must throw SecurityError
      assert.throws(() => {
        pathGuard.assertWritablePath(path.join(mockVaultDir, 'evil_mutation.md'));
      }, (err) => {
        return err instanceof SecurityError && (err.code === 'ERR_VAULT_WRITE_BLOCKED' || err.code === 'ERR_PATH_OUTSIDE_SANDBOX');
      });

      // 2. Traversal outside plugin root must throw SecurityError
      assert.throws(() => {
        pathGuard.assertWritablePath(path.join(tempEnvDir, '..', 'escape.db'));
      }, (err) => {
        return err instanceof SecurityError && err.code === 'ERR_PATH_OUTSIDE_SANDBOX';
      });
    });
  });
});
