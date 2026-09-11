'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createTempDir } = require('../helpers/tempDir');
const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const Rule02_SameIdMultiEntities = require('../../src/anomaly/rules/Rule02_SameIdMultiEntities');
const { PathGuard } = require('../../src/security/PathGuard');

async function test() {
  const tempEnv = createTempDir('vcp_probe_');
  const vaultDir = tempEnv.createSubdir('vault');
  const pluginDir = tempEnv.createSubdir('plugin');

  // Directory 1
  const p1Dir = path.join(vaultDir, '04_星球档案', 'V-001 苔原星');
  fs.mkdirSync(p1Dir, { recursive: true });
  fs.writeFileSync(path.join(p1Dir, '00_星球总览.md'), '---\nid: V-001\nname: 苔原星\n---\n# 苔原星\n这是苔原星档案。', 'utf8');

  // Directory 2
  const p2Dir = path.join(vaultDir, '04_星球档案', 'V-001 熔岩星');
  fs.mkdirSync(p2Dir, { recursive: true });
  fs.writeFileSync(path.join(p2Dir, '00_星球总览.md'), '---\nid: V-001\nname: 熔岩星\n---\n# 熔岩星\n这是熔岩星档案。', 'utf8');

  const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
  const pathGuard = new PathGuard({ pluginRoot: pluginDir, vaultRoot: vaultDir });
  const dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

  console.log('--- SYNCING VAULT ---');
  const scanRes = await IncrementalIndexer.sync(vaultDir, dbManager);
  console.log('Scan result:', scanRes);

  const entities = dbManager.entities.query({ limit: 10 });
  console.log('Entities in DB:', entities);

  const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'probe_session');
  console.log('Rule02 anomalies detected:', anomalies.length, JSON.stringify(anomalies, null, 2));

  dbManager.close();
  tempEnv.cleanup();
}

test().catch(console.error);
