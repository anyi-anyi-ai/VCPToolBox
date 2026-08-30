/**
 * @file zeroMutation.test.js
 * @description E2E Test Suite verifying Zero-Mutation (R6) safety constraint across all operations
 * @module test/e2e/zeroMutation.test
 * @license MIT
 */

'use strict';

const test = require('node:test');
const { describe, it, beforeEach, afterEach } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');

const MicroWorldTreeGenerator = require('../fixtures/MicroWorldTreeGenerator');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');

describe('E2E Zero-Mutation Sandbox Integrity Suite (R6 & Criteria 2)', () => {
  let generator;
  let vaultInfo;
  let pluginWorkingDir;
  let pathGuard;
  let dbManager;
  let dispatcher;

  beforeEach(() => {
    // 1. Generate clean micro world tree
    generator = new MicroWorldTreeGenerator();
    vaultInfo = generator.generate();

    // 2. Set up isolated plugin working directory (writes only permitted here)
    pluginWorkingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-plugin-sandbox-'));
    fs.mkdirSync(path.join(pluginWorkingDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(pluginWorkingDir, 'reports'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: pluginWorkingDir,
      vaultRoot: vaultInfo.vaultDir
    });

    const dbPath = path.join(pluginWorkingDir, 'data', 'novel_index.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: pluginWorkingDir,
      dbManager,
      pathGuard,
      config: {
        DATABASE_PATH: dbPath,
        VAULT_ROOT: vaultInfo.vaultDir
      }
    });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (generator) {
      generator.cleanup();
    }
    if (pluginWorkingDir && fs.existsSync(pluginWorkingDir)) {
      try {
        fs.rmSync(pluginWorkingDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  it('Zero-Mutation Baseline: Pre-scan hash equals Post-scan hash across full scanning pipeline', async () => {
    // 1. Compute Pre-Scan Tree Hash
    const preScanHash = generator.computeTreeHash();
    assert.ok(preScanHash && preScanHash.length === 64, 'Pre-scan tree hash must be a 64-char SHA-256 hex string');

    // Snapshot pre-scan mtimes and sizes of every single file in the vault
    const preSnapshot = new Map();
    for (const file of vaultInfo.files) {
      const stat = fs.statSync(file.absolutePath);
      preSnapshot.set(file.relativePath, {
        size: stat.size,
        mtimeMs: stat.mtimeMs,
        birthtimeMs: stat.birthtimeMs
      });
    }

    // 2. Execute Full Incremental Indexing
    const indexer = new IncrementalIndexer(dbManager, { concurrency: 8 });
    const syncResult = await indexer.sync(vaultInfo.vaultDir, { forceFullRescan: true });
    assert.equal(syncResult.totalFilesScanned, vaultInfo.totalFiles);
    assert.equal(syncResult.filesAdded, vaultInfo.totalFiles);

    // 3. Execute 10 Anomaly Detectors
    const anomalyEngine = new AnomalyEngine();
    const anomalyResult = anomalyEngine.runAll(dbManager, syncResult.scanSessionId, { persist: true });
    assert.ok(anomalyResult.totalAnomalies >= 10);

    // 4. Compute Post-Scan Tree Hash
    const postScanHash = generator.computeTreeHash();

    // 5. Strict Zero-Mutation Assertions
    assert.equal(
      preScanHash,
      postScanHash,
      'Vault directory contents altered during scan! Pre-scan hash !== Post-scan hash (Zero-Mutation Violation).'
    );

    // 6. Verify every individual file's size and mtime remained unchanged
    for (const file of vaultInfo.files) {
      const pre = preSnapshot.get(file.relativePath);
      const postStat = fs.statSync(file.absolutePath);
      assert.equal(postStat.size, pre.size, `File size mutated for ${file.relativePath}`);
      assert.equal(postStat.mtimeMs, pre.mtimeMs, `File mtime mutated for ${file.relativePath}`);
    }
  });

  it('Zero-Mutation Multi-Stage Stress: Repeated scans, queries, and reports leave vault completely untouched', async () => {
    const preScanHash = generator.computeTreeHash();

    // Stage 1: Command 1 (ScanWorldTree)
    const scanRes = await dispatcher.dispatch('ScanWorldTree', {
      targetDir: vaultInfo.vaultDir,
      forceFullRescan: true,
      detectAnomalies: true
    });
    assert.equal(scanRes.details.command, 'ScanWorldTree');

    // Stage 2: Command 2 (BuildSourceManifest)
    const manifestRes = await dispatcher.dispatch('BuildSourceManifest', {
      includeFrontmatter: true
    });
    assert.equal(manifestRes.details.command, 'BuildSourceManifest');

    // Stage 3: Command 3 (ClassifySourceFiles)
    const classifyRes = await dispatcher.dispatch('ClassifySourceFiles', {
      targetPath: 'Taranto'
    });
    assert.equal(classifyRes.details.command, 'ClassifySourceFiles');

    // Stage 4: Command 4, 5, 6 (Detection Commands)
    await dispatcher.dispatch('DetectPlaceholderFiles', { maxSizeBytes: 50 });
    await dispatcher.dispatch('DetectDuplicateEntities', {});
    await dispatcher.dispatch('DetectLegacyIdConflicts', {});

    // Stage 5: Command 7, 8 (Query Commands)
    await dispatcher.dispatch('GetSourceFile', {
      relativePath: '02_Entities/Planets/Planet_Alpha_PL002.md',
      includeRawContent: true
    });
    await dispatcher.dispatch('QueryEntities', { query: '林远' });

    // Stage 6: Command 9 (ExportImportReport - writes to plugin sandbox, NEVER to vault)
    const reportRes = await dispatcher.dispatch('ExportImportReport', {
      format: 'both',
      outputPath: 'reports/stress_audit.json'
    });
    assert.equal(reportRes.details.command, 'ExportImportReport');

    // Verify report was written to plugin sandbox, NOT vault
    assert.ok(reportRes.details.savedJsonPath.includes(pluginWorkingDir.replace(/\\/g, '/')));
    assert.ok(!reportRes.details.savedJsonPath.includes(vaultInfo.vaultDir.replace(/\\/g, '/')));

    // Stage 7: Re-scan immediate (Stage 1 cache hit verification)
    const reScanRes = await dispatcher.dispatch('ScanWorldTree', {
      targetDir: vaultInfo.vaultDir,
      forceFullRescan: false
    });
    assert.equal(reScanRes.details.summary.filesUnchanged, vaultInfo.totalFiles);
    assert.equal(reScanRes.details.summary.filesAdded, 0);

    // Compute Post-Stress Tree Hash
    const postStressHash = generator.computeTreeHash();

    assert.equal(
      preScanHash,
      postStressHash,
      'Vault directory mutated during multi-stage stress! Zero-mutation violated.'
    );
  });

  it('Zero-Mutation Security Check: Write attempts directly to vault are blocked by PathGuard', () => {
    const maliciousVaultFilePath = path.join(vaultInfo.vaultDir, 'malicious_injected.md');

    // Assert PathGuard forbids writing inside target vault
    assert.throws(
      () => {
        pathGuard.assertWritablePath(maliciousVaultFilePath, 'malicious_write');
      },
      /SecurityError|Write access forbidden/
    );

    // Confirm no file was created in vault
    assert.equal(fs.existsSync(maliciousVaultFilePath), false);
  });
});
