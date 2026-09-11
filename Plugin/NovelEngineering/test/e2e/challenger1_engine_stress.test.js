/**
 * @file challenger1_engine_stress.test.js
 * @description Adversarial empirical stress-test suite for VCP NovelEngineering backend engine
 * Verification Challenger 1 for consistency scan remediation project
 * @module test/e2e/challenger1_engine_stress
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { PathGuard } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const FileClassifier = require('../../src/scanner/FileClassifier');
const Rule02_SameIdMultiEntities = require('../../src/anomaly/rules/Rule02_SameIdMultiEntities');
const Rule03_HistoryVersionSimilarity = require('../../src/anomaly/rules/Rule03_HistoryVersionSimilarity');
const Rule04_PlaceholderFiles = require('../../src/anomaly/rules/Rule04_PlaceholderFiles');
const { createTempDir } = require('../helpers/tempDir');

describe('Challenger 1: Engine Adversarial Empirical Stress Test Suite', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let pathGuard = null;
  let dbPath = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_chal1_');
    vaultDir = tempEnv.createSubdir('vault');
    pluginDir = tempEnv.createSubdir('plugin');
    dbPath = path.join(pluginDir, 'data', 'novel_index.db');

    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv) {
      tempEnv.cleanup();
    }
  });

  // ==========================================================================
  // CHALLENGE 1: Cross-File Entity Deduplication & Ordering Invariance
  // ==========================================================================
  describe('Challenge 1: Cross-File Entity Deduplication Ordering Invariance', () => {
    it('1.1: Order A (Primary Planet Note FIRST, Index Card SECOND) -> single canonical entity row', async () => {
      // 1. Create Primary Planet Directory and File
      const planetDir = path.join(vaultDir, '04_星球档案', 'V-001 苔原-047');
      fs.mkdirSync(planetDir, { recursive: true });
      const primaryFile = path.join(planetDir, '00_星球总览.md');
      fs.writeFileSync(
        primaryFile,
        '---\nid: V-001\nname: 苔原-047\ncategory: planet\n---\n# 苔原-047\n极端寒带苔原生态星球。',
        'utf8'
      );

      // 2. Index Primary Note first
      await IncrementalIndexer.sync(vaultDir, dbManager);

      let entities = dbManager.entities.query({ limit: 10 });
      assert.equal(entities.length, 1, 'Should have exactly 1 entity after primary note sync');
      assert.equal(entities[0].entity_id, 'V-001');
      assert.equal(entities[0].canonical_name, '苔原-047');
      const primaryEntityDbId = entities[0].id;

      // 3. Create Index / Summary Card
      const summaryDir = path.join(vaultDir, '00_总览与索引', '原子定位卡');
      fs.mkdirSync(summaryDir, { recursive: true });
      const summaryFile = path.join(summaryDir, 'SUMMARY_V-001_苔原-047.md');
      fs.writeFileSync(
        summaryFile,
        '---\ncategory: planet\ntype: planet\nid: V-001\nsummary_version: 1\n---\n# SUMMARY_V-001\n索引原子定位卡。',
        'utf8'
      );

      // 4. Index Summary Card second
      await IncrementalIndexer.sync(vaultDir, dbManager);

      entities = dbManager.entities.query({ limit: 10 });
      assert.equal(entities.length, 1, 'Should STILL have exactly 1 entity row in entities table');
      assert.equal(entities[0].id, primaryEntityDbId, 'Canonical entity DB id must be preserved');
      assert.equal(entities[0].canonical_name, '苔原-047');

      // 5. Verify Rule02 reports zero false positives
      const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_session_1_1');
      assert.equal(anomalies.length, 0, 'Rule02 should report 0 anomalies');
    });

    it('1.2: Order B (Index Card FIRST, Primary Planet Note SECOND) -> single canonical entity row', async () => {
      // 1. Create Index / Summary Card first
      const summaryDir = path.join(vaultDir, '00_总览与索引', '原子定位卡');
      fs.mkdirSync(summaryDir, { recursive: true });
      const summaryFile = path.join(summaryDir, 'SUMMARY_V-001_苔原-047.md');
      fs.writeFileSync(
        summaryFile,
        '---\ncategory: planet\ntype: planet\nid: V-001\nsummary_version: 1\n---\n# SUMMARY_V-001\n索引原子定位卡。',
        'utf8'
      );

      // 2. Index Summary Card first
      await IncrementalIndexer.sync(vaultDir, dbManager);

      // Reference file must NOT create an independent entity row in entities
      let entities = dbManager.entities.query({ limit: 10 });
      assert.equal(entities.length, 0, 'Index card alone should not own an entity row in entities');

      // 3. Create Primary Planet Directory and File second
      const planetDir = path.join(vaultDir, '04_星球档案', 'V-001 苔原-047');
      fs.mkdirSync(planetDir, { recursive: true });
      const primaryFile = path.join(planetDir, '00_星球总览.md');
      fs.writeFileSync(
        primaryFile,
        '---\nid: V-001\nname: 苔原-047\ncategory: planet\n---\n# 苔原-047\n极端寒带苔原生态星球。',
        'utf8'
      );

      // 4. Index Primary Note second
      await IncrementalIndexer.sync(vaultDir, dbManager);

      entities = dbManager.entities.query({ limit: 10 });
      assert.equal(entities.length, 1, 'Should have exactly 1 entity row in entities table');
      assert.equal(entities[0].entity_id, 'V-001');
      assert.equal(entities[0].canonical_name, '苔原-047');

      // 5. Verify Rule02 reports zero false positives
      const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_session_1_2');
      assert.equal(anomalies.length, 0, 'Rule02 should report 0 anomalies');
    });

    it('1.3: Self-healing: should purge pre-existing stale entity row owned by index card', async () => {
      // 1. Insert a primary note and its source_file
      const primaryFileRecord = dbManager.sourceFiles.insert({
        file_path: path.join(vaultDir, '04_星球档案', 'V-001', '00_星球总览.md'),
        relative_path: '04_星球档案/V-001/00_星球总览.md',
        file_name: '00_星球总览.md',
        extension: '.md',
        size_bytes: 200,
        mtime_ms: Date.now(),
        sha256_hash: 'hash_primary',
        source_category: 'planet_system',
        status: 'active'
      });

      const primaryEntity = dbManager.entities.insert({
        entity_id: 'V-001',
        canonical_name: '苔原-047',
        entity_type: 'planet',
        source_file_id: primaryFileRecord.id
      });

      // 2. Simulate historical buggy state: index card also has an entity row in entities
      const summaryFileRecord = dbManager.sourceFiles.insert({
        file_path: path.join(vaultDir, '00_总览与索引', '原子定位卡', 'SUMMARY_V-001.md'),
        relative_path: '00_总览与索引/原子定位卡/SUMMARY_V-001.md',
        file_name: 'SUMMARY_V-001.md',
        extension: '.md',
        size_bytes: 150,
        mtime_ms: Date.now(),
        sha256_hash: 'hash_summary',
        source_category: 'meta_placeholder',
        status: 'active'
      });

      const staleSummaryEntity = dbManager.entities.insert({
        entity_id: 'V-001',
        canonical_name: 'SUMMARY_V-001_苔原-047',
        entity_type: 'planet',
        source_file_id: summaryFileRecord.id
      });

      // Before re-indexing, 2 entity rows exist, which triggers ANOM_002
      let initialAnomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_stale_before');
      assert.equal(initialAnomalies.length, 1, 'Initial duplicate state should trigger ANOM_002');

      // 3. Write summary file on disk with updated content to force re-indexing
      const summaryDir = path.join(vaultDir, '00_总览与索引', '原子定位卡');
      fs.mkdirSync(summaryDir, { recursive: true });
      fs.writeFileSync(
        path.join(summaryDir, 'SUMMARY_V-001.md'),
        '---\ncategory: planet\nid: V-001\nsummary_version: 2\n---\n# SUMMARY\nUpdated content.',
        'utf8'
      );

      // Re-scan
      await IncrementalIndexer.sync(vaultDir, dbManager);

      // 4. Stale row must have been cleaned up
      const entities = dbManager.entities.query({ limit: 10 });
      assert.equal(entities.length, 1, 'Stale entity row owned by summary file should be purged');
      assert.equal(entities[0].id, primaryEntity.id);

      const postAnomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_stale_after');
      assert.equal(postAnomalies.length, 0, 'ANOM_002 must be resolved after stale row purge');
    });
  });

  // ==========================================================================
  // CHALLENGE 2: Frontmatter Edge Cases & Category Resolution
  // ==========================================================================
  describe('Challenge 2: Frontmatter Edge Cases & Category Resolution', () => {
    it('2.1: Frontmatter category: planet in 00_总览与索引 must resolve to meta_placeholder, not planet_system', () => {
      const classified = FileClassifier.classify({
        relativePath: '00_总览与索引/原子定位卡/SUMMARY_V-042_冰原星.md',
        fileName: 'SUMMARY_V-042_冰原星.md',
        rawContent: '---\ncategory: planet\ntype: planet\nid: V-042\nname: 冰原星\n---\n# 冰原星定位卡'
      });

      assert.equal(
        classified.sourceCategory,
        'meta_placeholder',
        'Reference card category must be forced to meta_placeholder'
      );
      assert.notEqual(classified.sourceCategory, 'planet_system');
      assert.ok(classified.entity, 'Entity object is returned for linkage');
      assert.equal(classified.entity.facetRole, 'supplement', 'Facet role must be supplement, not definition');
      assert.equal(classified.entity.isReference, true, 'isReference must be true');
    });

    it('2.2: Frontmatter category: planet in 08_知识图谱节点 must resolve to meta_placeholder, not planet_system', () => {
      const classified = FileClassifier.classify({
        relativePath: '08_知识图谱节点/01_星球节点/V-042 冰原星_图谱.md',
        fileName: 'V-042 冰原星_图谱.md',
        rawContent: '---\ncategory: planet\ntype: planet\nid: V-042\nname: 冰原星\n---\n# 知识图谱节点'
      });

      assert.equal(
        classified.sourceCategory,
        'meta_placeholder',
        'Knowledge graph node category must be forced to meta_placeholder'
      );
      assert.notEqual(classified.sourceCategory, 'planet_system');
      assert.equal(classified.entity.facetRole, 'supplement');
      assert.equal(classified.entity.isReference, true);
    });

    it('2.3: Frontmatter category: character in 00_总览与索引 must resolve to meta_placeholder', () => {
      const classified = FileClassifier.classify({
        relativePath: '00_总览与索引/人物速查/CHAR_SUMMARY_001.md',
        fileName: 'CHAR_SUMMARY_001.md',
        rawContent: '---\ncategory: character\ntype: character\nid: CHAR-001\nname: 亚当\n---\n# 人物速查'
      });

      assert.equal(classified.sourceCategory, 'meta_placeholder');
      assert.notEqual(classified.sourceCategory, 'character_bio');
      assert.equal(classified.entity.isReference, true);
    });

    it('2.4: Arbitrary location with summary_version property must be recognized as reference', () => {
      const classified = FileClassifier.classify({
        relativePath: '随意目录/定位卡_任意位置.md',
        fileName: '定位卡_任意位置.md',
        rawContent: '---\ncategory: planet\nid: V-099\nsummary_version: 1\n---\n# 定位卡'
      });

      assert.equal(classified.sourceCategory, 'meta_placeholder');
      assert.equal(classified.entity.facetRole, 'supplement');
      assert.equal(classified.entity.isReference, true);
    });
  });

  // ==========================================================================
  // CHALLENGE 3: True Collision Detection
  // ==========================================================================
  describe('Challenge 3: True Collision Detection Stress', () => {
    it('3.1 (ADVERSARIAL STRESS): Two different planet directories in 04_星球档案 claiming SAME entity_id with divergent names', async () => {
      // Planet Directory A
      const p1Dir = path.join(vaultDir, '04_星球档案', 'V-001 苔原星');
      fs.mkdirSync(p1Dir, { recursive: true });
      fs.writeFileSync(
        path.join(p1Dir, '00_星球总览.md'),
        '---\nid: V-001\nname: 苔原星\n---\n# 苔原星\n这是真实的苔原星。',
        'utf8'
      );

      // Planet Directory B: Conflicting planet claiming the same canonical ID V-001 with distinct name
      const p2Dir = path.join(vaultDir, '04_星球档案', 'V-001 熔岩星');
      fs.mkdirSync(p2Dir, { recursive: true });
      fs.writeFileSync(
        path.join(p2Dir, '00_星球总览.md'),
        '---\nid: V-001\nname: 熔岩星\n---\n# 熔岩星\n这是冲突的熔岩星。',
        'utf8'
      );

      // Execute indexing
      await IncrementalIndexer.sync(vaultDir, dbManager);

      // Detect collisions using Rule02
      const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_session_3_1');

      // CRITICAL ASSERTION:
      // When two different planet folders in 04_星球档案 both claim V-001 with distinct names (苔原星 vs 熔岩星),
      // does the engine detect this true collision?
      const collisionAnomaly = anomalies.find(a => {
        const str = JSON.stringify(a);
        return str.includes('V-001') && (str.includes('熔岩星') || str.includes('苔原星'));
      });

      assert.ok(
        collisionAnomaly,
        'CRITICAL FAILURE: Collision between distinct planet directories in 04_星球档案 claiming identical entity_id V-001 MUST be detected by Rule02'
      );
    });

    it('3.2 (ADVERSARIAL STRESS): Two distinct definition files in the SAME planet directory claiming divergent names', async () => {
      const pDir = path.join(vaultDir, '04_星球档案', 'V-001 苔原星');
      fs.mkdirSync(pDir, { recursive: true });

      // Primary file
      fs.writeFileSync(
        path.join(pDir, '00_星球总览.md'),
        '---\nid: V-001\nname: 苔原星\n---\n# 苔原星\n真实总览。',
        'utf8'
      );

      // Secondary file claiming to be definition with divergent name
      fs.writeFileSync(
        path.join(pDir, '00_备用总览.md'),
        '---\nid: V-001\nname: 假苔原星\n---\n# 假苔原星\n冲突总览。',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_session_3_2');
      const collisionAnomaly = anomalies.find(a => {
        const str = JSON.stringify(a);
        return str.includes('V-001') && (str.includes('假苔原星') || str.includes('苔原星'));
      });

      assert.ok(
        collisionAnomaly,
        'CRITICAL FAILURE: Two definition files in the same directory claiming divergent names for same entity_id MUST trigger anomaly'
      );
    });

    it('3.3: Two standalone entity files claiming same ID with divergent names MUST be detected (Worker 2 baseline)', async () => {
      const charDir = path.join(vaultDir, '02_Entities', 'Characters');
      fs.mkdirSync(charDir, { recursive: true });

      fs.writeFileSync(
        path.join(charDir, 'Alice_CHAR007.md'),
        '---\nid: CHAR-007\nname: 爱丽丝\ncategory: character\n---\n# 爱丽丝\n通信专家。',
        'utf8'
      );

      fs.writeFileSync(
        path.join(charDir, 'Bob_CHAR007.md'),
        '---\nid: CHAR-007\nname: 鲍勃\ncategory: character\n---\n# 鲍勃\n推进专家。',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_session_3_3');
      const charCollision = anomalies.find(a => JSON.stringify(a).includes('CHAR-007'));

      assert.ok(charCollision, 'Standalone collision on CHAR-007 must be detected');
      assert.equal(charCollision.severity, 'CRITICAL');
    });

    it('3.4 (ADVERSARIAL STRESS): Standalone file scanned FIRST, directory anchor file scanned SECOND with divergent names', async () => {
      // Standalone file in 02_Entities/Planets/
      const standDir = path.join(vaultDir, '02_Entities', 'Planets');
      fs.mkdirSync(standDir, { recursive: true });
      fs.writeFileSync(
        path.join(standDir, 'V001_Wilderness.md'),
        '---\nid: V-001\nname: 荒原星\n---\n# 荒原星\n独立设定的荒原星。',
        'utf8'
      );

      // Directory anchor in 04_星球档案/
      const dirPlanet = path.join(vaultDir, '04_星球档案', 'V-001 苔原星');
      fs.mkdirSync(dirPlanet, { recursive: true });
      fs.writeFileSync(
        path.join(dirPlanet, '00_星球总览.md'),
        '---\nid: V-001\nname: 苔原星\n---\n# 苔原星\n档案内的苔原星。',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      const anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_session_3_4');
      const collisionAnomaly = anomalies.find(a => JSON.stringify(a).includes('V-001'));

      assert.ok(
        collisionAnomaly,
        'CRITICAL FAILURE: Conflict between standalone definition and directory anchor definition MUST be detected'
      );
    });
  });

  // ==========================================================================
  // CHALLENGE 4: Archive Files Isolation & Anomaly Filtering
  // ==========================================================================
  describe('Challenge 4: Archive Files Isolation & Anomaly Filtering', () => {
    it('4.1: Files in 09_归档与历史版本/ must be classified with status=archived and entity=null', () => {
      const res = FileClassifier.classify({
        relativePath: '09_归档与历史版本/04_星球档案/V-001 苔原-047/00_星球总览.md',
        fileName: '00_星球总览.md',
        rawContent: '---\nid: V-001\nname: 苔原-047\ncategory: planet\nstatus: active\n---\n# 旧版本'
      });

      assert.equal(res.status, 'archived', 'Status must be archived despite frontmatter status: active');
      assert.equal(res.sourceCategory, 'archive');
      assert.equal(res.entity, null, 'Archived files must not extract domain entities');
    });

    it('4.2: IncrementalIndexer should record archived files in source_files but NOT in entities', async () => {
      const archDir = path.join(vaultDir, '09_归档与历史版本', '历史档案');
      fs.mkdirSync(archDir, { recursive: true });
      fs.writeFileSync(
        path.join(archDir, 'V-001_OLD.md'),
        '---\nid: V-001\nname: 苔原旧版\n---\n# 旧档案',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      const allFiles = dbManager.sourceFiles.query({ limit: 10 });
      assert.equal(allFiles.length, 1);
      assert.equal(allFiles[0].status, 'archived');

      const allEntities = dbManager.entities.query({ limit: 10 });
      assert.equal(allEntities.length, 0, 'Archived file must not produce entity in entities table');
    });

    it('4.3: Archived files must NOT trigger Rule02, Rule03, or Rule04 anomalies', async () => {
      // 1. Create an active planet
      const pDir = path.join(vaultDir, '04_星球档案', 'V-001 苔原星');
      fs.mkdirSync(pDir, { recursive: true });
      fs.writeFileSync(
        path.join(pDir, '00_星球总览.md'),
        '---\nid: V-001\nname: 苔原星\n---\n# 苔原星\n活跃档案。',
        'utf8'
      );

      // 2. Create identical/duplicate content in 09_归档与历史版本/
      const archDir = path.join(vaultDir, '09_归档与历史版本', '04_星球档案', 'V-001 苔原星');
      fs.mkdirSync(archDir, { recursive: true });
      fs.writeFileSync(
        path.join(archDir, '00_星球总览.md'),
        '---\nid: V-001\nname: 苔原星\n---\n# 苔原星\n活跃档案。',
        'utf8'
      );

      // 3. Create a stub file (20B) in 09_归档与历史版本/
      fs.writeFileSync(
        path.join(archDir, 'stub.md'),
        '# Stub file\n',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      // Rule02 check: active vs archived identical name/id must NOT trigger ANOM_002
      const r2Anomalies = Rule02_SameIdMultiEntities.detect(dbManager, 'chal_arch_r2');
      assert.equal(r2Anomalies.length, 0, 'Rule02 must ignore archived files');

      // Rule03 check: active vs archived duplicate must NOT trigger ANOM_003
      const r3Anomalies = Rule03_HistoryVersionSimilarity.detect(dbManager, 'chal_arch_r3');
      const archDupAnomaly = r3Anomalies.find(a => JSON.stringify(a).includes('09_归档与历史版本'));
      assert.equal(archDupAnomaly, undefined, 'Rule03 must ignore archived files');

      // Rule04 check: stub file in archive must NOT trigger ANOM_004
      const r4Anomalies = Rule04_PlaceholderFiles.detect(dbManager, 'chal_arch_r4');
      const archStubAnomaly = r4Anomalies.find(a => JSON.stringify(a).includes('09_归档与历史版本'));
      assert.equal(archStubAnomaly, undefined, 'Rule04 must ignore stub files in archive');
    });
  });

  // ==========================================================================
  // CHALLENGE 5: Stub File Whitelisting in 08_知识图谱节点/
  // ==========================================================================
  describe('Challenge 5: Stub File Whitelisting in 08_知识图谱节点/', () => {
    it('5.1: Stub file <=50B in 08_知识图谱节点/ must NOT trigger ANOM_004', async () => {
      const kgDir = path.join(vaultDir, '08_知识图谱节点', '01_星球节点');
      fs.mkdirSync(kgDir, { recursive: true });
      // Write exactly 30 bytes
      fs.writeFileSync(
        path.join(kgDir, 'V-107 鳞木星_图谱.md'),
        '# V-107\n[[V-107]]\n',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      const r4Anomalies = Rule04_PlaceholderFiles.detect(dbManager, 'chal_kg_r4');
      const kgAnomaly = r4Anomalies.find(a => JSON.stringify(a).includes('08_知识图谱节点'));
      assert.equal(kgAnomaly, undefined, 'Stub file <=50B in 08_知识图谱节点/ must NOT trigger ANOM_004');
    });

    it('5.2: Stub file <=50B OUTSIDE 08_知识图谱节点/ MUST trigger ANOM_004 (True Positive Retention)', async () => {
      const loreDir = path.join(vaultDir, '01_设定库');
      fs.mkdirSync(loreDir, { recursive: true });
      // Write 25 bytes stub
      fs.writeFileSync(
        path.join(loreDir, 'empty_stub.md'),
        '# Stub file\ncontent\n',
        'utf8'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      const r4Anomalies = Rule04_PlaceholderFiles.detect(dbManager, 'chal_outside_kg_r4');
      const stubAnomaly = r4Anomalies.find(a => JSON.stringify(a).includes('empty_stub.md'));
      assert.ok(stubAnomaly, 'Stub file <=50B outside 08_知识图谱节点/ MUST be reported as ANOM_004');
      assert.equal(stubAnomaly.severity, 'LOW');
    });
  });
});
