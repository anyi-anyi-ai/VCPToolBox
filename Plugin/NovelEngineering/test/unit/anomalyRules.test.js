/**
 * @file anomalyRules.test.js
 * @description Unit Test Suite for All 10 Anomaly Rules & 9 Plugin Commands (Milestone M4)
 * @module test/unit/anomalyRules.test
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

const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const AnomalyEngine = require('../../src/anomaly/AnomalyEngine');

const Rule01 = require('../../src/anomaly/rules/Rule01_SameNameDiffId');
const Rule02 = require('../../src/anomaly/rules/Rule02_SameIdMultiEntities');
const Rule03 = require('../../src/anomaly/rules/Rule03_HistoryVersionSimilarity');
const Rule04 = require('../../src/anomaly/rules/Rule04_PlaceholderFiles');
const Rule05 = require('../../src/anomaly/rules/Rule05_LegacyIdConflicts');
const Rule06 = require('../../src/anomaly/rules/Rule06_AiGeneratedMixedData');
const Rule07 = require('../../src/anomaly/rules/Rule07_DanglingEntityReferences');
const Rule08 = require('../../src/anomaly/rules/Rule08_AliasCollisions');
const Rule09 = require('../../src/anomaly/rules/Rule09_TimelineChronologyAnomalies');
const Rule10 = require('../../src/anomaly/rules/Rule10_ForeshadowingUnclosedMismatch');

const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const ScanCommands = require('../../src/commands/ScanCommands');
const DetectionCommands = require('../../src/commands/DetectionCommands');
const QueryCommands = require('../../src/commands/QueryCommands');
const ReportCommands = require('../../src/commands/ReportCommands');

/**
 * Helper to create compliant mock source file records
 */
function createMockFile(dbManager, overrides = {}) {
  const relPath = overrides.relative_path || `mock_${Date.now()}_${Math.random().toString(16).slice(2, 6)}.md`;
  return dbManager.sourceFiles.insert({
    file_path: overrides.file_path || `/mock/vault/${relPath}`,
    relative_path: relPath,
    file_name: path.basename(relPath),
    extension: path.extname(relPath) || '.md',
    size_bytes: overrides.size_bytes !== undefined ? overrides.size_bytes : 100,
    mtime_ms: Date.now(),
    sha256_hash: overrides.sha256_hash || crypto.randomBytes(32).toString('hex'),
    source_category: overrides.source_category || overrides.category || 'planet_system',
    status: overrides.status || 'active',
    review_status: overrides.review_status || 'confirmed',
    word_count: overrides.word_count !== undefined ? overrides.word_count : 100,
    line_count: overrides.line_count !== undefined ? overrides.line_count : 20,
    is_placeholder: overrides.is_placeholder !== undefined ? overrides.is_placeholder : 0,
    placeholder_reason: overrides.placeholder_reason || null,
    frontmatter_json: overrides.frontmatter_json || null,
    frontmatter_raw: overrides.frontmatter_raw || null
  });
}

describe('VCPNovelManager Anomaly Rules & Command Handlers Suite (M4)', () => {
  let dbManager;
  let testPluginDir;
  let testVaultDir;
  let pathGuard;

  beforeEach(() => {
    testPluginDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-unit-plugin-'));
    testVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-unit-vault-'));
    fs.mkdirSync(path.join(testPluginDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(testPluginDir, 'reports'), { recursive: true });
    pathGuard = new PathGuard({
      pluginRoot: testPluginDir,
      vaultRoot: testVaultDir
    });
    dbManager = DatabaseManager.initDatabase(':memory:', { pathGuard });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (testPluginDir && fs.existsSync(testPluginDir)) {
      try {
        fs.rmSync(testPluginDir, { recursive: true, force: true });
      } catch (_) {}
    }
    if (testVaultDir && fs.existsSync(testVaultDir)) {
      try {
        fs.rmSync(testVaultDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // =========================================================================
  // Suite 1: Isolated Unit Tests for All 10 Anomaly Detection Rules
  // =========================================================================
  describe('Suite 1: Anomaly Detection Rules (ANOM_001 to ANOM_010)', () => {

    it('ANOM_001: should detect duplicate planet names with divergent entity IDs', () => {
      const file1 = createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Taranto_01.md',
        source_category: 'planet_system'
      });
      const file2 = createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Taranto_02.md',
        source_category: 'planet_system'
      });
      const file3 = createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Alpha.md',
        source_category: 'planet_system'
      });

      dbManager.entities.insert({
        entity_id: 'PL-001',
        canonical_name: '塔兰托',
        entity_type: 'planet',
        source_file_id: file1.id,
        status: 'active'
      });
      dbManager.entities.insert({
        entity_id: 'PL-099',
        canonical_name: '塔兰托',
        entity_type: 'planet',
        source_file_id: file2.id,
        status: 'active'
      });

      // Control entity: unique planet
      dbManager.entities.insert({
        entity_id: 'PL-002',
        canonical_name: '阿尔法星',
        entity_type: 'planet',
        source_file_id: file3.id,
        status: 'active'
      });

      const anomalies = Rule01.detect(dbManager, 'test-scan-01');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_001_SAME_NAME_DIFF_ID');
      assert.equal(anomalies[0].severity, 'HIGH');
      assert.equal(anomalies[0].details_json.canonicalName, '塔兰托');
      assert.equal(anomalies[0].details_json.distinctIdCount, 2);
      assert.ok(anomalies[0].affected_file_paths_json.includes('02_Entities/Planets/Taranto_01.md'));
      assert.ok(anomalies[0].affected_file_paths_json.includes('02_Entities/Planets/Taranto_02.md'));
    });

    it('ANOM_002: should detect same entity ID claimed by multiple distinct entities or files', () => {
      const file1 = createMockFile(dbManager, {
        relative_path: '02_Entities/Characters/Alice.md',
        source_category: 'character_bio'
      });
      const file2 = createMockFile(dbManager, {
        relative_path: '02_Entities/Characters/Bob.md',
        source_category: 'character_bio'
      });

      dbManager.entities.insert({
        entity_id: 'CHAR-007',
        canonical_name: '爱丽丝',
        entity_type: 'character',
        source_file_id: file1.id,
        status: 'active'
      });
      dbManager.entities.insert({
        entity_id: 'CHAR-007',
        canonical_name: '鲍勃',
        entity_type: 'character',
        source_file_id: file2.id,
        status: 'active'
      });

      const anomalies = Rule02.detect(dbManager, 'test-scan-02');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_002_SAME_ID_MULTI_ENTITY');
      assert.equal(anomalies[0].severity, 'CRITICAL');
      assert.equal(anomalies[0].details_json.entityId, 'CHAR-007');
      assert.equal(anomalies[0].details_json.distinctNameCount, 2);
    });

    it('ANOM_003: should detect historical version duplicates and identical hash clones', () => {
      const hash = 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef';
      createMockFile(dbManager, {
        relative_path: '01_Worldview/Cosmology.md',
        sha256_hash: hash,
        size_bytes: 512,
        status: 'finalized'
      });
      createMockFile(dbManager, {
        relative_path: '99_Archive/Cosmology_v1_backup.md',
        sha256_hash: hash,
        size_bytes: 512,
        status: 'deprecated'
      });

      // Unique file (not duplicated)
      createMockFile(dbManager, {
        relative_path: '01_Worldview/Unique_Doc.md',
        sha256_hash: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        size_bytes: 256,
        status: 'finalized'
      });

      const anomalies = Rule03.detect(dbManager, 'test-scan-03');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_003_HISTORICAL_VERSION_DUPLICATION');
      assert.equal(anomalies[0].severity, 'MEDIUM');
      assert.equal(anomalies[0].details_json.sha256, hash);
      assert.equal(anomalies[0].details_json.duplicateCount, 2);
    });

    it('ANOM_004: should detect placeholder stub files <= 30B/50B and empty body notes', () => {
      // 1. Placeholder: size <= 30 bytes
      createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Stub30B.md',
        size_bytes: 20,
        word_count: 2,
        line_count: 1,
        is_placeholder: 1,
        placeholder_reason: 'FILE_SIZE_LE_30B',
        status: 'placeholder'
      });

      // 2. Normal file: size > 50 bytes
      createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/NormalPlanet.md',
        size_bytes: 500,
        word_count: 80,
        line_count: 20,
        is_placeholder: 0,
        status: 'active'
      });

      const anomalies = Rule04.detect(dbManager, 'test-scan-04', { maxSizeBytes: 30 });
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_004_PLACEHOLDER_STUB_FILE');
      assert.equal(anomalies[0].severity, 'LOW');
      assert.equal(anomalies[0].details_json.sizeBytes, 20);
      assert.equal(anomalies[0].details_json.reason, 'FILE_SIZE_LE_30B');
    });

    it('ANOM_005: should detect legacy/deprecated ID conflicts across entities', () => {
      const file1 = createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Planet_P001.md',
        status: 'active'
      });
      const file2 = createMockFile(dbManager, {
        relative_path: '02_Entities/Characters/Commander.md',
        status: 'active'
      });

      // Modern entity with ID P-001
      const planet = dbManager.entities.insert({
        entity_id: 'P-001',
        canonical_name: '新普罗米修斯',
        entity_type: 'planet',
        source_file_id: file1.id,
        status: 'active'
      });

      // Character entity with legacy alias P-001
      const char = dbManager.entities.insert({
        entity_id: 'CHAR-001',
        canonical_name: '老指挥官',
        entity_type: 'character',
        source_file_id: file2.id,
        status: 'active'
      });

      dbManager.getDatabase().prepare(`
        INSERT INTO entity_aliases (entity_id, alias_name, alias_type, is_primary)
        VALUES (?, ?, 'legacy_id', 0)
      `).run(char.id, 'P-001');

      const anomalies = Rule05.detect(dbManager, 'test-scan-05');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT');
      assert.equal(anomalies[0].severity, 'HIGH');
      assert.equal(anomalies[0].details_json.legacyId, 'P-001');
    });

    it('ANOM_006: should detect AI-generated unreviewed files in canonical folders or unreviewed states', () => {
      createMockFile(dbManager, {
        relative_path: '01_Worldview/Canonical/AI_Lore.md',
        source_category: 'worldview_setting',
        status: 'draft',
        review_status: 'ai_generated',
        frontmatter_raw: 'ai_generated: true\nreview_status: ai_generated'
      });

      // Canonical file with confirmed review status (control)
      createMockFile(dbManager, {
        relative_path: '01_Worldview/Canonical/Human_Lore.md',
        source_category: 'worldview_setting',
        status: 'finalized',
        review_status: 'confirmed',
        frontmatter_raw: 'review_status: confirmed\nauthor: human'
      });

      const anomalies = Rule06.detect(dbManager, 'test-scan-06');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_006_AI_HUMAN_MIXED_DATA');
      assert.equal(anomalies[0].severity, 'MEDIUM');
      assert.ok(anomalies[0].affected_file_paths_json.includes('01_Worldview/Canonical/AI_Lore.md'));
    });

    it('ANOM_007: should detect dangling wikilink references and broken frontmatter pointers', () => {
      createMockFile(dbManager, {
        relative_path: '02_Entities/Characters/Hero.md',
        frontmatter_json: JSON.stringify({
          planet: '[[NonExistent_Ghost_Planet_X999]]'
        }),
        status: 'active'
      });

      const anomalies = Rule07.detect(dbManager, 'test-scan-07');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_007_DANGLING_CROSS_REFERENCE');
      assert.equal(anomalies[0].severity, 'MEDIUM');
      assert.equal(anomalies[0].details_json.propertyKey, 'planet');
    });

    it('ANOM_008: should detect ambiguous alias name collisions across distinct entities', () => {
      const file1 = createMockFile(dbManager, { relative_path: '02_Entities/Characters/Spy.md' });
      const file2 = createMockFile(dbManager, { relative_path: '02_Entities/Organizations/Faction.md' });

      const ent1 = dbManager.entities.insert({
        entity_id: 'CHAR-004',
        canonical_name: '特工幽灵',
        entity_type: 'character',
        source_file_id: file1.id,
        status: 'active'
      });
      const ent2 = dbManager.entities.insert({
        entity_id: 'ORG-001',
        canonical_name: '幽灵战团',
        entity_type: 'organization',
        source_file_id: file2.id,
        status: 'active'
      });

      const aliasStmt = dbManager.getDatabase().prepare(`
        INSERT INTO entity_aliases (entity_id, alias_name, alias_type, is_primary)
        VALUES (?, ?, 'nickname', 0)
      `);
      aliasStmt.run(ent1.id, '影子执行者');
      aliasStmt.run(ent2.id, '影子执行者');

      const anomalies = Rule08.detect(dbManager, 'test-scan-08');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_008_ALIAS_CROSS_COLLISION');
      assert.equal(anomalies[0].severity, 'MEDIUM');
      assert.equal(anomalies[0].details_json.aliasName, '影子执行者');
      assert.equal(anomalies[0].details_json.distinctEntityCount, 2);
    });

    it('ANOM_009: should detect timeline chronological reversals and prerequisite inversions', () => {
      const file1 = createMockFile(dbManager, { relative_path: '04_Timeline/Event_Parent.md', source_category: 'timeline_record' });
      const file2 = createMockFile(dbManager, { relative_path: '04_Timeline/Event_Child.md', source_category: 'timeline_record' });

      // Parent event at timestamp 200
      dbManager.timeline.insert({
        event_id: 'EV-200',
        title: '第二次大航海启航',
        timestamp_order: 200,
        source_file_id: file1.id,
        status: 'active'
      });

      // Child event at timestamp 100 claiming EV-200 as prerequisite (time reversal!)
      dbManager.timeline.insert({
        event_id: 'EV-100',
        title: '远航成果庆功会',
        timestamp_order: 100,
        causality_prerequisite_ids_json: ['EV-200'],
        source_file_id: file2.id,
        status: 'active'
      });

      const anomalies = Rule09.detect(dbManager, 'test-scan-09');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER');
      assert.equal(anomalies[0].severity, 'HIGH');
      assert.equal(anomalies[0].details_json.childEvent.id, 'EV-100');
      assert.equal(anomalies[0].details_json.prerequisiteEvent.id, 'EV-200');
      assert.equal(anomalies[0].details_json.timeDelta, 100);
    });

    it('ANOM_010: should detect foreshadowing marked resolved without resolution chapter reference', () => {
      const file1 = createMockFile(dbManager, { relative_path: '05_Foreshadowing/Hook_Signal.md', source_category: 'foreshadowing_entry' });
      const file2 = createMockFile(dbManager, { relative_path: '05_Foreshadowing/Hook_Relic.md', source_category: 'foreshadowing_entry' });

      dbManager.foreshadowing.insert({
        foreshadow_id: 'FS-001',
        title: '深空神秘莫尔斯信号',
        description: '未知信号线索',
        status: 'resolved',
        importance_level: 'major',
        setup_file_id: file1.id
      });

      // Control foreshadowing: open
      dbManager.foreshadowing.insert({
        foreshadow_id: 'FS-002',
        title: '远古黑匣子',
        description: '黑匣子解密线索',
        status: 'open',
        importance_level: 'major',
        setup_file_id: file2.id
      });

      const anomalies = Rule10.detect(dbManager, 'test-scan-10');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].anomaly_rule_id, 'ANOM_010_FORESHADOWING_UNCLOSED_STATUS');
      assert.equal(anomalies[0].severity, 'LOW');
      assert.equal(anomalies[0].details_json.foreshadowId, 'FS-001');
    });

    it('AnomalyEngine: should execute all rules and return aggregate breakdown', () => {
      const engine = new AnomalyEngine();
      const registered = engine.getRegisteredRules();
      assert.equal(registered.length, 13);

      // Run against clean database (0 anomalies)
      const cleanResult = engine.runAll(dbManager, 'clean-scan', { persist: false });
      assert.equal(cleanResult.totalAnomalies, 0);
      assert.equal(cleanResult.breakdown.CRITICAL, 0);
      assert.equal(cleanResult.breakdown.HIGH, 0);
    });
  });

  // =========================================================================
  // Suite 2: Unit Tests for All 9 Exposed Plugin Commands
  // =========================================================================
  describe('Suite 2: 9 Core Command Handlers', () => {
    let context;

    beforeEach(() => {
      context = {
        dbManager,
        pathGuard,
        config: {
          DATABASE_PATH: ':memory:',
          VAULT_ROOT: testVaultDir
        },
        basePath: testPluginDir
      };

      // Seed mock records for query commands
      const sf = createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Taranto_PL001.md',
        source_category: 'planet_system',
        status: 'active',
        review_status: 'confirmed',
        size_bytes: 256,
        word_count: 50,
        line_count: 10,
        sha256_hash: '1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
        frontmatter_json: JSON.stringify({ category: 'planet', id: 'PL-001', name: '塔兰托' })
      });

      const ent = dbManager.entities.insert({
        entity_id: 'PL-001',
        canonical_name: '塔兰托',
        entity_type: 'planet',
        category: 'planet',
        status: 'active',
        review_status: 'confirmed',
        source_file_id: sf.id,
        summary: '外环防御要塞星'
      });

      dbManager.getDatabase().prepare(`
        INSERT INTO entity_aliases (entity_id, alias_name, alias_type, is_primary)
        VALUES (?, '要塞塔兰托', 'nickname', 1)
      `).run(ent.id);

      createMockFile(dbManager, {
        relative_path: '02_Entities/Planets/Stub_30B.md',
        source_category: 'planet_system',
        status: 'placeholder',
        size_bytes: 20,
        word_count: 2,
        line_count: 1,
        is_placeholder: 1,
        placeholder_reason: 'FILE_SIZE_LE_30B'
      });
    });

    it('Command 1: ScanWorldTree - should validate params and execute scan', async () => {
      // Valid scan
      const res = await ScanCommands.handleScanWorldTree({ targetDir: testVaultDir }, context);
      assert.ok(res.content);
      assert.equal(res.details.command, 'ScanWorldTree');
      assert.ok(res.details.summary);

      // Missing targetDir should throw
      await assert.rejects(async () => {
        await ScanCommands.handleScanWorldTree({ targetDir: '' }, { ...context, config: {} });
      }, /requires a valid "targetDir"/);
    });

    it('Command 2: BuildSourceManifest - should filter categories, status, and pagination', async () => {
      const resAll = await ScanCommands.handleBuildSourceManifest({}, context);
      assert.equal(resAll.details.command, 'BuildSourceManifest');
      assert.equal(resAll.details.totalFiles, 2);
      assert.equal(resAll.details.manifest.length, 2);

      // Filter by status = 'placeholder'
      const resPlaceholder = await ScanCommands.handleBuildSourceManifest({ status: 'placeholder' }, context);
      assert.equal(resPlaceholder.details.manifest.length, 1);
      assert.equal(resPlaceholder.details.manifest[0].isPlaceholder, true);

      // Pagination
      const resPaged = await ScanCommands.handleBuildSourceManifest({ limit: 1, offset: 0 }, context);
      assert.equal(resPaged.details.manifest.length, 1);
      assert.equal(resPaged.details.totalFiles, 2);
    });

    it('Command 3: ClassifySourceFiles - should classify query results', async () => {
      const res = await ScanCommands.handleClassifySourceFiles({ targetPath: 'Taranto' }, context);
      assert.equal(res.details.command, 'ClassifySourceFiles');
      assert.equal(res.details.totalClassified, 1);
      assert.equal(res.details.results[0].relativePath, '02_Entities/Planets/Taranto_PL001.md');
      assert.equal(res.details.results[0].sourceCategory, 'planet_system');
    });

    it('Command 4: DetectPlaceholderFiles - should retrieve stubs and placeholders', async () => {
      const res = await DetectionCommands.handleDetectPlaceholderFiles({ maxSizeBytes: 30 }, context);
      assert.equal(res.details.command, 'DetectPlaceholderFiles');
      assert.equal(res.details.placeholderCount, 1);
      assert.equal(res.details.placeholders[0].fileName, 'Stub_30B.md');
    });

    it('Command 5: DetectDuplicateEntities - should detect duplicates and alias collisions', async () => {
      const res = await DetectionCommands.handleDetectDuplicateEntities({}, context);
      assert.equal(res.details.command, 'DetectDuplicateEntities');
      assert.ok(Array.isArray(res.details.duplicateGroups));
    });

    it('Command 6: DetectLegacyIdConflicts - should report legacy identifier collisions', async () => {
      const res = await DetectionCommands.handleDetectLegacyIdConflicts({}, context);
      assert.equal(res.details.command, 'DetectLegacyIdConflicts');
      assert.ok(Array.isArray(res.details.conflicts));
    });

    it('Command 7: GetSourceFile - should fetch metadata, frontmatter, entities, and handle not found', async () => {
      // Fetch by relative path
      const res = await QueryCommands.handleGetSourceFile({ relativePath: '02_Entities/Planets/Taranto_PL001.md' }, context);
      assert.equal(res.details.command, 'GetSourceFile');
      assert.ok(res.details.file);
      assert.equal(res.details.file.fileName, 'Taranto_PL001.md');
      assert.equal(res.details.file.entities.length, 1);
      assert.equal(res.details.file.entities[0].canonicalName, '塔兰托');

      // Fetch non-existent file
      const resMissing = await QueryCommands.handleGetSourceFile({ relativePath: 'non/existent.md' }, context);
      assert.equal(resMissing.details.file, null);

      // Missing argument error
      await assert.rejects(async () => {
        await QueryCommands.handleGetSourceFile({}, context);
      }, /requires either "relativePath"/);
    });

    it('Command 8: QueryEntities - should query by keyword, type, reviewStatus, and pagination', async () => {
      // Keyword query
      const resSearch = await QueryCommands.handleQueryEntities({ query: '塔兰托' }, context);
      assert.equal(resSearch.details.command, 'QueryEntities');
      assert.equal(resSearch.details.totalCount, 1);
      assert.equal(resSearch.details.entities[0].entityId, 'PL-001');
      assert.ok(resSearch.details.entities[0].aliases.includes('要塞塔兰托'));

      // Filter by type
      const resType = await QueryCommands.handleQueryEntities({ entityType: 'character' }, context);
      assert.equal(resType.details.totalCount, 0);
    });

    it('Command 9: ExportImportReport - should generate JSON and Markdown reports', async () => {
      const outJson = path.join(testPluginDir, 'reports', 'test_audit.json');
      const res = await ReportCommands.handleExportImportReport({
        format: 'both',
        outputPath: outJson
      }, context);

      assert.equal(res.details.command, 'ExportImportReport');
      assert.ok(res.details.savedJsonPath);
      assert.ok(res.details.savedMarkdownPath);
      assert.ok(fs.existsSync(res.details.savedJsonPath));
      assert.ok(fs.existsSync(res.details.savedMarkdownPath));

      const jsonContent = JSON.parse(fs.readFileSync(res.details.savedJsonPath, 'utf8'));
      assert.ok(jsonContent.reportId);
      assert.equal(jsonContent.statistics.totalFiles, 2);
    });
  });

  // =========================================================================
  // Suite 3: CommandDispatcher Core Routing & Utility Commands
  // =========================================================================
  describe('Suite 3: CommandDispatcher Routing & Utility Actions', () => {
    let dispatcher;

    beforeEach(() => {
      dispatcher = new CommandDispatcher({
        basePath: testPluginDir,
        dbManager,
        pathGuard
      });
    });

    it('should handle "ping" command returning PONG and timestamp', async () => {
      const res = await dispatcher.dispatch('ping');
      assert.equal(res.pong, true);
      assert.equal(res.message, 'PONG');
      assert.ok(res.timestamp);
    });

    it('should handle "help" command listing all 9 core commands and built-ins', async () => {
      const res = await dispatcher.dispatch('help');
      assert.ok(res.availableCommands.includes('ScanWorldTree'));
      assert.ok(res.availableCommands.includes('BuildSourceManifest'));
      assert.ok(res.availableCommands.includes('ClassifySourceFiles'));
      assert.ok(res.availableCommands.includes('DetectPlaceholderFiles'));
      assert.ok(res.availableCommands.includes('DetectDuplicateEntities'));
      assert.ok(res.availableCommands.includes('DetectLegacyIdConflicts'));
      assert.ok(res.availableCommands.includes('GetSourceFile'));
      assert.ok(res.availableCommands.includes('QueryEntities'));
      assert.ok(res.availableCommands.includes('ExportImportReport'));
    });

    it('should handle "info" command returning plugin metadata', async () => {
      const res = await dispatcher.dispatch('info');
      assert.equal(res.name, 'NovelEngineering');
      assert.equal(res.protocol, 'stdio');
      assert.equal(res.status, 'ready');
    });

    it('should reject unknown commands with informative error message', async () => {
      await assert.rejects(async () => {
        await dispatcher.dispatch('UnknownSuperCommand');
      }, /Unsupported or unknown command/);
    });
  });
});
