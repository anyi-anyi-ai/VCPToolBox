/**
 * @file fullWorkflow.test.js
 * @description E2E Test Suite verifying End-to-End Stdio JSON RPC Workflow for all 9 Commands (Criteria 1, 3 & R5)
 * @module test/e2e/fullWorkflow.test
 * @license MIT
 */

'use strict';

const test = require('node:test');
const { describe, it, before, after } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { spawn } = require('node:child_process');

const MicroWorldTreeGenerator = require('../fixtures/MicroWorldTreeGenerator');

const PLUGIN_DIR = path.resolve(__dirname, '..', '..');
const ENTRY_SCRIPT = path.join(PLUGIN_DIR, 'NovelEngineering.js');

/**
 * Helper: Executes NovelEngineering.js via child_process stdio
 * @param {object} payload
 * @param {object} [envOverrides={}]
 * @param {number} [timeoutMs=15000]
 * @returns {Promise<{ code: number, stdout: string, stderr: string, json: object }>}
 */
function invokeStdioCommand(payload, envOverrides = {}, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const inputString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const child = spawn(process.execPath, [ENTRY_SCRIPT], {
      cwd: PLUGIN_DIR,
      env: {
        ...process.env,
        DEBUG_MODE: 'false',
        ...envOverrides
      },
      shell: false,
      windowsHide: true
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
      reject(new Error(`Plugin execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk;
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return;

      const trimmedStdout = stdoutBuffer.trim();
      let parsedJson = null;
      try {
        parsedJson = JSON.parse(trimmedStdout);
      } catch (err) {
        // Handled in assertions
      }

      resolve({
        code,
        signal,
        stdout: trimmedStdout,
        stderr: stderrBuffer.trim(),
        rawStdout: stdoutBuffer,
        json: parsedJson
      });
    });

    try {
      if (inputString !== undefined && inputString !== null) {
        child.stdin.write(inputString + '\n');
      }
      child.stdin.end();
    } catch (writeErr) {
      clearTimeout(timer);
      reject(writeErr);
    }
  });
}

describe('E2E Full Stdio JSON RPC Workflow Suite (9 Commands)', () => {
  let generator;
  let vaultInfo;
  let envOverrides;
  let testReportsDir;
  let testDataDir;

  before(() => {
    // 1. Generate Micro World Tree
    generator = new MicroWorldTreeGenerator();
    vaultInfo = generator.generate();

    // 2. Set up clean data and reports directories
    testDataDir = path.join(PLUGIN_DIR, 'data');
    testReportsDir = path.join(PLUGIN_DIR, 'reports');
    if (!fs.existsSync(testDataDir)) fs.mkdirSync(testDataDir, { recursive: true });
    if (!fs.existsSync(testReportsDir)) fs.mkdirSync(testReportsDir, { recursive: true });

    const dbPath = path.join('data', `e2e_workflow_${Date.now()}.db`);
    envOverrides = {
      DATABASE_PATH: dbPath,
      VAULT_ROOT: vaultInfo.vaultDir
    };
  });

  after(() => {
    if (generator) {
      generator.cleanup();
    }
    // Clean up temporary sqlite files created during e2e
    if (envOverrides && envOverrides.DATABASE_PATH) {
      const fullDb = path.join(PLUGIN_DIR, envOverrides.DATABASE_PATH);
      try {
        if (fs.existsSync(fullDb)) fs.unlinkSync(fullDb);
        if (fs.existsSync(`${fullDb}-wal`)) fs.unlinkSync(`${fullDb}-wal`);
        if (fs.existsSync(`${fullDb}-shm`)) fs.unlinkSync(`${fullDb}-shm`);
      } catch (_) {}
    }
  });

  // =========================================================================
  // Command 1: ScanWorldTree
  // =========================================================================
  it('Command 1: ScanWorldTree via stdio - should scan vault and index files', async () => {
    const res = await invokeStdioCommand({
      action: 'ScanWorldTree',
      parameters: {
        targetDir: vaultInfo.vaultDir,
        forceFullRescan: true,
        detectAnomalies: true
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.ok(res.json, `Expected valid JSON on stdout, got: ${res.stdout}`);
    assert.equal(res.json.status, 'success');
    assert.ok(Array.isArray(res.json.result.content));
    assert.ok(res.json.result.details);
    assert.equal(res.json.result.details.command, 'ScanWorldTree');
    assert.equal(res.json.result.details.summary.totalFilesScanned, vaultInfo.totalFiles);
    assert.equal(res.json.result.details.summary.filesAdded, vaultInfo.totalFiles);
    assert.equal(res.json.result.details.summary.anomaliesDetected, 10);
  });

  // =========================================================================
  // Command 2: BuildSourceManifest
  // =========================================================================
  it('Command 2: BuildSourceManifest via stdio - should return complete file manifest', async () => {
    const res = await invokeStdioCommand({
      action: 'BuildSourceManifest',
      parameters: {
        includeFrontmatter: true
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'BuildSourceManifest');
    assert.equal(res.json.result.details.totalFiles, vaultInfo.totalFiles);
    assert.ok(Array.isArray(res.json.result.details.manifest));
    assert.equal(res.json.result.details.manifest.length, vaultInfo.totalFiles);

    // Verify item properties
    const first = res.json.result.details.manifest[0];
    assert.ok(first.relativePath);
    assert.ok(first.fileName);
    assert.ok(first.category);
    assert.ok(first.sha256);
  });

  // =========================================================================
  // Command 3: ClassifySourceFiles
  // =========================================================================
  it('Command 3: ClassifySourceFiles via stdio - should return classification metadata', async () => {
    const res = await invokeStdioCommand({
      action: 'ClassifySourceFiles',
      parameters: {
        targetPath: 'Taranto'
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'ClassifySourceFiles');
    assert.ok(res.json.result.details.totalClassified >= 1);
    assert.ok(Array.isArray(res.json.result.details.results));
  });

  // =========================================================================
  // Command 4: DetectPlaceholderFiles
  // =========================================================================
  it('Command 4: DetectPlaceholderFiles via stdio - should find 30B stub files', async () => {
    const res = await invokeStdioCommand({
      action: 'DetectPlaceholderFiles',
      parameters: {
        maxSizeBytes: 50
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'DetectPlaceholderFiles');
    assert.equal(res.json.result.details.placeholderCount, 1);
    assert.ok(res.json.result.details.placeholders[0].relativePath.includes('Stub_Planet_30B.md'));
  });

  // =========================================================================
  // Command 5: DetectDuplicateEntities
  // =========================================================================
  it('Command 5: DetectDuplicateEntities via stdio - should return duplicate groups & collisions', async () => {
    const res = await invokeStdioCommand({
      action: 'DetectDuplicateEntities',
      parameters: {
        checkAliases: true
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'DetectDuplicateEntities');
    assert.ok(res.json.result.details.collisionCount >= 3); // ANOM_001, ANOM_002, ANOM_008
  });

  // =========================================================================
  // Command 6: DetectLegacyIdConflicts
  // =========================================================================
  it('Command 6: DetectLegacyIdConflicts via stdio - should detect legacy ID collisions', async () => {
    const res = await invokeStdioCommand({
      action: 'DetectLegacyIdConflicts',
      parameters: {}
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'DetectLegacyIdConflicts');
    assert.equal(res.json.result.details.conflictCount, 1);
    assert.equal(res.json.result.details.conflicts[0].legacyId, 'P-001');
  });

  // =========================================================================
  // Command 7: GetSourceFile
  // =========================================================================
  it('Command 7: GetSourceFile via stdio - should retrieve single file metadata and content', async () => {
    const res = await invokeStdioCommand({
      action: 'GetSourceFile',
      parameters: {
        relativePath: '02_Entities/Planets/Planet_Alpha_PL002.md',
        includeRawContent: true
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'GetSourceFile');
    assert.ok(res.json.result.details.file);
    assert.equal(res.json.result.details.file.fileName, 'Planet_Alpha_PL002.md');
    assert.ok(res.json.result.details.file.rawContent.includes('阿尔法星'));
  });

  // =========================================================================
  // Command 8: QueryEntities
  // =========================================================================
  it('Command 8: QueryEntities via stdio - should search canon entities catalog', async () => {
    const res = await invokeStdioCommand({
      action: 'QueryEntities',
      parameters: {
        query: '林远',
        includeAliases: true
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'QueryEntities');
    assert.equal(res.json.result.details.totalCount, 1);
    assert.equal(res.json.result.details.entities[0].canonicalName, '林远');
    assert.equal(res.json.result.details.entities[0].entityId, 'CHAR-005');
  });

  // =========================================================================
  // Command 9: ExportImportReport
  // =========================================================================
  it('Command 9: ExportImportReport via stdio - should write Markdown and JSON reports to reports/', async () => {
    const outName = `e2e_report_${Date.now()}`;
    const relOutPath = `reports/${outName}.json`;

    const res = await invokeStdioCommand({
      action: 'ExportImportReport',
      parameters: {
        format: 'both',
        outputPath: relOutPath
      }
    }, envOverrides);

    assert.equal(res.code, 0);
    assert.equal(res.json.status, 'success');
    assert.equal(res.json.result.details.command, 'ExportImportReport');

    const jsonPath = res.json.result.details.savedJsonPath;
    const mdPath = res.json.result.details.savedMarkdownPath;

    assert.ok(jsonPath, 'JSON report path must be returned');
    assert.ok(mdPath, 'Markdown report path must be returned');
    assert.ok(fs.existsSync(jsonPath), `Exported JSON report must exist at ${jsonPath}`);
    assert.ok(fs.existsSync(mdPath), `Exported Markdown report must exist at ${mdPath}`);

    // Verify JSON Report Content
    const jsonParsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    assert.ok(jsonParsed.reportId);
    assert.ok(jsonParsed.generatedAt);
    assert.equal(jsonParsed.statistics.totalFiles, vaultInfo.totalFiles);
    assert.equal(jsonParsed.statistics.totalAnomalies, 10);
    assert.equal(jsonParsed.anomalyBreakdown.CRITICAL, 1);
    assert.equal(jsonParsed.anomalyBreakdown.HIGH, 3);

    // Verify Markdown Report Content
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    assert.ok(mdContent.includes('# VCPNovelManager Diagnostic & Anomaly Audit Report'));
    assert.ok(mdContent.includes('## 1. World Tree Overview'));
    assert.ok(mdContent.includes('## 2. Category Distribution'));
    assert.ok(mdContent.includes('## 3. Anomaly Severity Breakdown'));
    assert.ok(mdContent.includes('## 4. Detected Conflicts & Remediation Plan'));
    assert.ok(mdContent.includes('ANOM_001_SAME_NAME_DIFF_ID'));
    assert.ok(mdContent.includes('ANOM_002_SAME_ID_MULTI_ENTITY'));

    // Clean up report artifacts
    try {
      if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
      if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
    } catch (_) {}
  });

  // =========================================================================
  // Error Envelope Handling
  // =========================================================================
  it('Error Envelope: invalid command or missing parameters returns structured error JSON', async () => {
    // 1. Unknown action
    const resUnknown = await invokeStdioCommand({
      action: 'InvalidNonExistentAction'
    }, envOverrides);

    assert.equal(resUnknown.code, 0);
    assert.equal(resUnknown.json.status, 'error');
    assert.ok(resUnknown.json.error.includes('Unsupported or unknown command'));

    // 2. Missing targetDir for ScanWorldTree without env fallback
    const resMissing = await invokeStdioCommand({
      action: 'ScanWorldTree',
      parameters: { targetDir: '' }
    }, { ...envOverrides, VAULT_ROOT: '' });

    assert.equal(resMissing.code, 0);
    assert.equal(resMissing.json.status, 'error');
    assert.ok(resMissing.json.error.includes('requires a valid "targetDir"'));
  });
});
