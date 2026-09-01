/**
 * @file anom002_elimination.test.js
 * @description End-to-end verification that ANOM_002 false positives are completely eliminated on multi-template structures
 * @module test/e2e/anom002_elimination
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');
const Rule02_SameIdMultiEntities = require('../../src/anomaly/rules/Rule02_SameIdMultiEntities');
const { createTempDir } = require('../helpers/tempDir');

describe('E2E Anomaly Elimination: ANOM_002 False-Positive Eradication', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_anom002_e2e_');
    vaultDir = tempEnv.createSubdir('template_vault');
    pluginDir = tempEnv.createSubdir('plugin_root');

    // Build multi-template planetary directory structure
    // 5 distinct planet directories with identical recurring template filenames
    const templateNames = [
      '00_星球总览.md',
      '00_势力总档案.md',
      '01_势力总档案.md',
      '02_详细档案.md',
      '08_关键人物档案.md'
    ];

    for (let p = 1; p <= 5; p++) {
      const planetNum = String(p).padStart(3, '0');
      const factionDir = path.join(vaultDir, '04_星球档案', `V-${planetNum} 星球`, '07_势力体系');
      fs.mkdirSync(factionDir, { recursive: true });

      for (const tName of templateNames) {
        fs.writeFileSync(
          path.join(factionDir, tName),
          `# V-${planetNum} ${tName}\n\n这是 V-${planetNum} 星球的 ${tName} 模板档案内容。`,
          'utf8'
        );
      }
    }

    // Embed ONE deliberate true-positive ID collision with explicit frontmatter ID
    const charDir = path.join(vaultDir, '02_Entities', 'Characters');
    fs.mkdirSync(charDir, { recursive: true });

    fs.writeFileSync(
      path.join(charDir, 'Alice_CHAR007.md'),
      [
        '---',
        'id: CHAR-007',
        'name: 爱丽丝',
        'category: character',
        '---',
        '# 爱丽丝\n通信专家。'
      ].join('\n'),
      'utf8'
    );

    fs.writeFileSync(
      path.join(charDir, 'Bob_CHAR007.md'),
      [
        '---',
        'id: CHAR-007',
        'name: 鲍勃',
        'category: character',
        '---',
        '# 鲍勃\n推进专家。'
      ].join('\n'),
      'utf8'
    );

    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: pluginDir,
      dbPath,
      dbManager,
      pathGuard
    });
  });

  afterEach(() => {
    if (dispatcher) {
      dispatcher.close();
    }
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv) {
      tempEnv.cleanup();
    }
  });

  it('E2E-ANOM002: should yield exactly 0 ANOM_002 anomalies on 25 template files across 5 planets while detecting 1 genuine collision', async () => {
    // 1. Snapshot vault tree hash before scan to guarantee zero-mutation
    const initialTreeHash = computeVaultHash(vaultDir);

    // 2. Execute full scan and indexing
    const scanResult = await IncrementalIndexer.sync(vaultDir, dbManager);
    assert.ok(scanResult.totalFilesScanned >= 27, `Should scan at least 27 files (got ${scanResult.totalFilesScanned})`);

    // 3. Verify SQLite source files and aggregated entities count
    const allFiles = dbManager.sourceFiles.query({ limit: 100 });
    assert.ok(allFiles.length >= 27, `Should index at least 27 source files (got ${allFiles.length})`);
    const allEntities = dbManager.entities.query({ limit: 100 });
    assert.ok(allEntities.length >= 5, `Should aggregate into at least 5 canonical entities (got ${allEntities.length})`);

    // 4. Run ANOM_002 detection rule directly and via AnomalyEngine
    const rule02Anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'test_session_001');

    // Assert that NO template file triggered ANOM_002
    const templateAnomalies = rule02Anomalies.filter(a => {
      const details = JSON.stringify(a);
      return (
        details.includes('00_星球总览') ||
        details.includes('00_势力总档案') ||
        details.includes('01_势力总档案') ||
        details.includes('02_详细档案') ||
        details.includes('08_关键人物档案')
      );
    });

    assert.equal(
      templateAnomalies.length,
      0,
      `CRITICAL: Expected 0 ANOM_002 anomalies on recurring template files, but found: ${JSON.stringify(templateAnomalies)}`
    );

    // Assert that the genuine deliberate collision (CHAR-007 for Alice & Bob) IS 100% detected
    const genuineCollision = rule02Anomalies.find(a => {
      const json = JSON.stringify(a);
      return json.includes('CHAR-007') || json.includes('爱丽丝') || json.includes('鲍勃');
    });

    assert.ok(
      genuineCollision,
      'True-positive explicit ID collision (CHAR-007) MUST be detected with 100% recall'
    );
    assert.equal(genuineCollision.severity, 'CRITICAL');

    // 5. Test via CommandDispatcher DetectDuplicateEntities command
    const dupRes = await dispatcher.dispatch('DetectDuplicateEntities', { vaultRoot: vaultDir });
    assert.ok(dupRes);
    const dupDetails = dupRes.details || dupRes;
    const dupAnomalies = dupDetails.duplicateGroups || dupDetails.anomalies || [];

    const templateDupCollisions = dupAnomalies.filter(a =>
      a.type === 'SAME_ID_MULTI_ENTITY' &&
      JSON.stringify(a).match(/00_星球总览|00_势力总档案|01_势力总档案|02_详细档案|08_关键人物档案/)
    );
    assert.equal(templateDupCollisions.length, 0, 'DetectDuplicateEntities must report 0 template collisions');

    const genuineDup = dupAnomalies.find(a =>
      a.type === 'SAME_ID_MULTI_ENTITY' && a.entityId === 'CHAR-007'
    );
    assert.ok(genuineDup, 'DetectDuplicateEntities must report genuine duplicate CHAR-007');

    // 6. Assert zero-mutation on vault directory
    const postScanTreeHash = computeVaultHash(vaultDir);
    assert.equal(postScanTreeHash, initialTreeHash, 'Scan and anomaly detection must cause zero mutation to the vault');
  });
});

function computeVaultHash(targetDir) {
  const files = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(current, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else if (e.isFile()) {
        const buf = fs.readFileSync(full);
        const hash = crypto.createHash('sha256').update(buf).digest('hex');
        files.push(`${path.relative(targetDir, full)}|${hash}`);
      }
    }
  }
  walk(targetDir);
  files.sort();
  return crypto.createHash('sha256').update(files.join('\n')).digest('hex');
}
