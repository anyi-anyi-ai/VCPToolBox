/**
 * @file anomalyRecall.test.js
 * @description E2E Test Suite verifying 100% Precision & 100% Recall for all 10 Anomaly Types (Criteria 3)
 * @module test/e2e/anomalyRecall.test
 * @license MIT
 */

'use strict';

const test = require('node:test');
const { describe, it, beforeEach, afterEach } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const MicroWorldTreeGenerator = require('../fixtures/MicroWorldTreeGenerator');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');

describe('E2E Anomaly 100% Precision & Recall Test Suite (Criteria 3)', () => {
  let generator;
  let vaultInfo;
  let pluginWorkingDir;
  let pathGuard;
  let dbManager;
  let scanSessionId;
  let detectedAnomalies;
  let anomalyMap;

  beforeEach(async () => {
    // 1. Generate Micro World Tree
    generator = new MicroWorldTreeGenerator();
    vaultInfo = generator.generate();

    // 2. Setup isolated plugin database
    pluginWorkingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-recall-test-'));
    fs.mkdirSync(path.join(pluginWorkingDir, 'data'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: pluginWorkingDir,
      vaultRoot: vaultInfo.vaultDir
    });

    const dbPath = path.join(pluginWorkingDir, 'data', 'novel_index.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    // 3. Perform scan & indexing
    const indexer = new IncrementalIndexer(dbManager);
    const syncResult = await indexer.sync(vaultInfo.vaultDir, { forceFullRescan: true });
    scanSessionId = syncResult.scanSessionId;

    // 4. Run all 10 anomaly detectors
    const engine = new AnomalyEngine();
    const result = engine.runAll(dbManager, scanSessionId, { persist: true });
    detectedAnomalies = result.anomalies;

    // Group anomalies by rule ID for precise rule-by-rule assertions
    anomalyMap = new Map();
    for (const a of detectedAnomalies) {
      if (!anomalyMap.has(a.anomaly_rule_id)) {
        anomalyMap.set(a.anomaly_rule_id, []);
      }
      anomalyMap.get(a.anomaly_rule_id).push(a);
    }
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

  // =========================================================================
  // 1. Global Metric Assertions: 100% Precision, 100% Recall, 0 FP, 0 FN
  // =========================================================================
  it('Global Metric: 100% Precision & 100% Recall across all 10 embedded anomalies', () => {
    const expectedAnomalies = generator.getExpectedAnomalies();
    const totalExpected = expectedAnomalies.length; // 10

    assert.equal(totalExpected, 10, 'Expected exactly 10 distinct anomaly rules in generator');
    assert.equal(
      detectedAnomalies.length,
      10,
      `Expected exactly 10 detected anomalies, but found ${detectedAnomalies.length}`
    );

    // Verify all 10 expected rule IDs are present with count 1
    for (const exp of expectedAnomalies) {
      const found = anomalyMap.get(exp.ruleId) || [];
      assert.equal(
        found.length,
        exp.expectedCount,
        `Anomaly rule ${exp.ruleId} failed recall: expected ${exp.expectedCount}, got ${found.length}`
      );
    }

    // Verify no unknown or spurious rule IDs were produced (Precision = 100%)
    const registeredRules = new AnomalyEngine().getRegisteredRules().map(r => r.id);
    for (const detected of detectedAnomalies) {
      assert.ok(
        registeredRules.includes(detected.anomaly_rule_id),
        `Spurious anomaly detected: ${detected.anomaly_rule_id}`
      );
    }
  });

  // =========================================================================
  // 2. Control Files Verification (Zero False Positives in Control Data)
  // =========================================================================
  it('Control Files Protection: Canonical control files must NOT trigger false anomalies', () => {
    const controlFiles = [
      '01_Worldview/World_Cosmology_Canon.md',
      '02_Entities/Planets/Planet_Alpha_PL002.md',
      '02_Entities/Characters/Protagonist_CHAR005.md',
      '03_Chapters/Vol01/Chapter_01.md',
      '03_Chapters/Vol01/Chapter_02.md',
      '04_Timeline/Event_Genesis_EV001.md',
      '04_Timeline/Event_FirstContact_EV002.md',
      '05_Foreshadowing/Hook_AncientRelic_FS002.md'
    ];

    for (const ctrlPath of controlFiles) {
      // Find if any anomaly flagged this file exclusively as an anomaly culprit
      const flaggingAnomalies = detectedAnomalies.filter(a => {
        const paths = a.affected_file_paths_json || [];
        return paths.length === 1 && paths[0] === ctrlPath;
      });

      assert.equal(
        flaggingAnomalies.length,
        0,
        `Control file '${ctrlPath}' triggered false positive anomaly: ${flaggingAnomalies.map(a => a.anomaly_rule_id).join(', ')}`
      );
    }
  });

  // =========================================================================
  // 3. Granular Rule-by-Rule Anomaly Recall Verification
  // =========================================================================

  it('ANOM_001 Recall: Same-Name Planet Different ID', () => {
    const list = anomalyMap.get('ANOM_001_SAME_NAME_DIFF_ID');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'HIGH');
    assert.equal(a.details_json.canonicalName, '塔兰托');
    assert.equal(a.details_json.distinctIdCount, 2);
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Taranto_PL001.md')));
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Taranto_PL099.md')));
  });

  it('ANOM_002 Recall: Same Entity ID Multiple Entities', () => {
    const list = anomalyMap.get('ANOM_002_SAME_ID_MULTI_ENTITY');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'CRITICAL');
    assert.equal(a.details_json.entityId, 'CHAR-007');
    assert.equal(a.details_json.distinctNameCount, 2);
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Alice_CHAR007.md')));
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Bob_CHAR007.md')));
  });

  it('ANOM_003 Recall: Historical Version Similarity / Duplicate', () => {
    const list = anomalyMap.get('ANOM_003_HISTORICAL_VERSION_DUPLICATION');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'MEDIUM');
    assert.equal(a.details_json.duplicateCount, 2);
    assert.ok(a.affected_file_paths_json.some(p => p.includes('01_Worldview/Cosmology_Canonical.md')));
    assert.ok(a.affected_file_paths_json.some(p => p.includes('99_Archive/Cosmology_Canonical_v1_backup.md')));
  });

  it('ANOM_004 Recall: 30B Placeholder Stub File', () => {
    const list = anomalyMap.get('ANOM_004_PLACEHOLDER_STUB_FILE');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'LOW');
    assert.ok(a.details_json.sizeBytes <= 30);
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Stub_Planet_30B.md')));
  });

  it('ANOM_005 Recall: Legacy / Deprecated ID Collision', () => {
    const list = anomalyMap.get('ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'HIGH');
    assert.equal(a.details_json.legacyId, 'P-001');
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Planet_Prometheus_P001.md')));
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Elder_CHAR001.md')));
  });

  it('ANOM_006 Recall: AI-Generated vs Human-Confirmed Mixed Data', () => {
    const list = anomalyMap.get('ANOM_006_AI_HUMAN_MIXED_DATA');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'MEDIUM');
    assert.ok(a.affected_file_paths_json.some(p => p.includes('AI_Unreviewed_Cosmology.md')));
  });

  it('ANOM_007 Recall: Dangling Entity References', () => {
    const list = anomalyMap.get('ANOM_007_DANGLING_CROSS_REFERENCE');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'MEDIUM');
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Explorer_CHAR003.md')));
    assert.equal(a.details_json.propertyKey, 'planet');
    assert.ok(a.details_json.targetValue.includes('NonExistent_Ghost_Planet_X999'));
  });

  it('ANOM_008 Recall: Alias Collisions Across Different Entities', () => {
    const list = anomalyMap.get('ANOM_008_ALIAS_CROSS_COLLISION');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'MEDIUM');
    assert.equal(a.details_json.aliasName, '影子执行者');
    assert.equal(a.details_json.distinctEntityCount, 2);
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Spy_CHAR004.md')));
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Faction_ORG001.md')));
  });

  it('ANOM_009 Recall: Timeline Chronology / Causality Order Anomalies', () => {
    const list = anomalyMap.get('ANOM_009_TIMELINE_CHRONOLOGY_ORDER');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'HIGH');
    assert.equal(a.details_json.childEvent.id, 'EV-100');
    assert.equal(a.details_json.prerequisiteEvent.id, 'EV-200');
    assert.equal(a.details_json.timeDelta, 100);
  });

  it('ANOM_010 Recall: Foreshadowing Unclosed / Status Mismatch', () => {
    const list = anomalyMap.get('ANOM_010_FORESHADOWING_UNCLOSED_STATUS');
    assert.equal(list.length, 1);
    const a = list[0];
    assert.equal(a.severity, 'LOW');
    assert.equal(a.details_json.foreshadowId, 'FS-001');
    assert.equal(a.details_json.status, 'resolved');
    assert.ok(a.affected_file_paths_json.some(p => p.includes('Hook_Unresolved_FS001.md')));
  });
});
