/**
 * @file database.test.js
 * @description Comprehensive unit test suite for VCPNovelManager SQLite Database Layer (M2)
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('VCPNovelManager SQLite Database Layer Suite (M2)', () => {
  let tempEnv = null;
  let dbManager = null;

  beforeEach(() => {
    // Setup isolated temp environment with mock plugin root
    tempEnv = createTempDir('vcp_m2_db_test_');
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
  // Suite 1: Database Initialization, PRAGMAs & Security Sandboxing
  // ==========================================================================
  describe('Suite 1: Database Initialization, PRAGMAs & Security Sandboxing', () => {
    it('should initialize an in-memory database with all 9 tables', () => {
      dbManager = new DatabaseManager(':memory:');
      assert.equal(dbManager.isOpen(), true);
      assert.equal(dbManager.isMemory, true);

      const tables = dbManager.getTableNames();
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

      for (const table of expectedTables) {
        assert.ok(tables.includes(table), `Table ${table} must be created in database`);
      }
    });

    it('should initialize a disk-based database in plugin data directory with WAL mode', () => {
      const dbPath = path.join(tempEnv.path, 'data', 'test_index.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });

      dbManager = new DatabaseManager(dbPath, { pathGuard });
      assert.equal(dbManager.isOpen(), true);
      assert.equal(dbManager.isMemory, false);
      assert.ok(fs.existsSync(dbPath), 'Database file must exist on disk');

      const stats = dbManager.getStats();
      assert.equal(stats.journalMode.toLowerCase(), 'wal');
      assert.equal(stats.foreignKeysEnabled, true);
    });

    it('should block database initialization targeting outside the plugin root via PathGuard', () => {
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      const illegalDbPath = path.join(tempEnv.path, '..', 'evil_novel.db');

      assert.throws(
        () => {
          new DatabaseManager(illegalDbPath, { pathGuard });
        },
        (err) => {
          return err instanceof SecurityError && err.code === 'ERR_PATH_OUTSIDE_SANDBOX';
        }
      );
    });

    it('should block database initialization inside target vault directory', () => {
      const vaultPath = path.join(tempEnv.path, 'vault_obsidian');
      fs.mkdirSync(vaultPath, { recursive: true });

      const pathGuard = new PathGuard({
        pluginRoot: tempEnv.path,
        vaultRoot: vaultPath
      });

      const illegalDbInVault = path.join(vaultPath, 'vault_index.db');
      assert.throws(
        () => {
          new DatabaseManager(illegalDbInVault, { pathGuard });
        },
        (err) => {
          return err instanceof SecurityError && err.code === 'ERR_VAULT_WRITE_BLOCKED';
        }
      );
    });
  });

  // ==========================================================================
  // Suite 2: SourceFileRepo Operations
  // ==========================================================================
  describe('Suite 2: SourceFileRepo Operations', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('should insert and retrieve a source file with full metadata and JSON frontmatter', () => {
      const fileRecord = {
        file_path: 'H:/Vault/Planets/PL-001_Terra.md',
        relative_path: 'Planets/PL-001_Terra.md',
        file_name: 'PL-001_Terra.md',
        extension: '.md',
        size_bytes: 2048,
        mtime_ms: 1724840000000,
        sha256_hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        source_category: 'planet',
        status: 'active',
        review_status: 'confirmed',
        has_frontmatter: 1,
        frontmatter_raw: 'id: PL-001\nname: 泰拉',
        frontmatter_json: { id: 'PL-001', name: '泰拉', type: 'planet' },
        line_count: 50,
        word_count: 850
      };

      const inserted = dbManager.sourceFiles.insert(fileRecord);
      assert.ok(inserted.id > 0);
      assert.equal(inserted.relative_path, 'Planets/PL-001_Terra.md');
      assert.equal(inserted.source_category, 'planet');
      assert.equal(inserted.review_status, 'confirmed');

      const fetched = dbManager.sourceFiles.getById(inserted.id);
      assert.deepEqual(fetched, inserted);

      const byRel = dbManager.sourceFiles.getByRelativePath('Planets/PL-001_Terra.md');
      assert.equal(byRel.id, inserted.id);

      const byPoly = dbManager.sourceFiles.findByPathOrId('Planets/PL-001_Terra.md');
      assert.equal(byPoly.id, inserted.id);
    });

    it('should upsert existing file and update modified fields', () => {
      const fileRecord = {
        file_path: 'H:/Vault/Planets/PL-001_Terra.md',
        relative_path: 'Planets/PL-001_Terra.md',
        file_name: 'PL-001_Terra.md',
        size_bytes: 1000,
        mtime_ms: 1724800000000,
        sha256_hash: 'aaa',
        source_category: 'planet'
      };

      const first = dbManager.sourceFiles.upsert(fileRecord);
      assert.equal(first.size_bytes, 1000);

      const updatedRecord = {
        ...fileRecord,
        size_bytes: 1500,
        mtime_ms: 1724850000000,
        sha256_hash: 'bbb',
        review_status: 'confirmed'
      };

      const second = dbManager.sourceFiles.upsert(updatedRecord);
      assert.equal(second.id, first.id);
      assert.equal(second.size_bytes, 1500);
      assert.equal(second.sha256_hash, 'bbb');
      assert.equal(second.review_status, 'confirmed');
    });

    it('should batch upsert multiple files inside a transaction', () => {
      const files = [];
      for (let i = 1; i <= 25; i++) {
        files.push({
          file_path: `H:/Vault/Chapters/Ch_${String(i).padStart(2, '0')}.md`,
          relative_path: `Chapters/Ch_${String(i).padStart(2, '0')}.md`,
          file_name: `Ch_${String(i).padStart(2, '0')}.md`,
          size_bytes: 3000 + i,
          mtime_ms: 1724800000000 + i,
          sha256_hash: `hash_${i}`,
          source_category: 'chapter',
          status: i <= 20 ? 'active' : 'draft'
        });
      }

      const count = dbManager.sourceFiles.batchUpsert(files);
      assert.equal(count, 25);

      const total = dbManager.sourceFiles.count();
      assert.equal(total, 25);

      const chapterCount = dbManager.sourceFiles.count({ source_category: 'chapter' });
      assert.equal(chapterCount, 25);

      const activeCount = dbManager.sourceFiles.count({ status: 'active' });
      assert.equal(activeCount, 20);
    });

    it('should support multi-criteria queries and pagination', () => {
      dbManager.sourceFiles.batchUpsert([
        { relative_path: 'Planets/PL-001_Terra.md', file_path: '/p1', size_bytes: 500, source_category: 'planet', status: 'active', review_status: 'confirmed' },
        { relative_path: 'Planets/PL-002_Mars.md', file_path: '/p2', size_bytes: 800, source_category: 'planet', status: 'active', review_status: 'unreviewed' },
        { relative_path: 'Characters/CHAR-01.md', file_path: '/c1', size_bytes: 1200, source_category: 'character', status: 'draft', review_status: 'draft' },
        { relative_path: 'Drafts/stub.md', file_path: '/d1', size_bytes: 20, source_category: 'draft', status: 'placeholder', is_placeholder: 1 }
      ]);

      const planets = dbManager.sourceFiles.query({ source_category: 'planet' });
      assert.equal(planets.length, 2);

      const confirmedPlanets = dbManager.sourceFiles.query({ source_category: 'planet', review_status: 'confirmed' });
      assert.equal(confirmedPlanets.length, 1);
      assert.equal(confirmedPlanets[0].relative_path, 'Planets/PL-001_Terra.md');

      const placeholders = dbManager.sourceFiles.query({ is_placeholder: 1 });
      assert.equal(placeholders.length, 1);
      assert.equal(placeholders[0].relative_path, 'Drafts/stub.md');

      const paged = dbManager.sourceFiles.query({ limit: 2, offset: 1 });
      assert.equal(paged.length, 2);
    });

    it('should support soft delete and batch soft delete', () => {
      dbManager.sourceFiles.batchUpsert([
        { relative_path: 'FileA.md', file_path: '/fa', size_bytes: 100, source_category: 'lore' },
        { relative_path: 'FileB.md', file_path: '/fb', size_bytes: 200, source_category: 'lore' }
      ]);

      const res = dbManager.sourceFiles.softDelete('FileA.md');
      assert.equal(res, true);

      const fileA = dbManager.sourceFiles.getByRelativePath('FileA.md');
      assert.equal(fileA.status, 'deleted');

      dbManager.sourceFiles.batchSoftDelete(['FileB.md']);
      const fileB = dbManager.sourceFiles.getByRelativePath('FileB.md');
      assert.equal(fileB.status, 'deleted');
    });
  });

  // ==========================================================================
  // Suite 3: EntityRepo Operations & Conflict Queries
  // ==========================================================================
  describe('Suite 3: EntityRepo Operations & Conflict Queries', () => {
    let sourceFileId = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/Planets/PL-001_Terra.md',
        relative_path: 'Planets/PL-001_Terra.md',
        size_bytes: 500,
        mtime_ms: 1000,
        sha256_hash: 'abc',
        source_category: 'planet'
      });
      sourceFileId = sf.id;
    });

    it('should insert entity with aliases and retrieve joined record', () => {
      const entity = dbManager.entities.insert(
        {
          entity_id: 'PL-001',
          canonical_name: '泰拉',
          entity_type: 'planet',
          category: 'rocky_planet',
          summary: '人类母星',
          source_file_id: sourceFileId
        },
        [
          { alias_name: '地球', is_primary: 1 },
          { alias_name: '母星', is_primary: 0 }
        ]
      );

      assert.ok(entity.id > 0);
      assert.equal(entity.canonical_name, '泰拉');
      assert.equal(entity.aliases.length, 2);
      assert.equal(entity.aliases[0].alias_name, '地球');
      assert.equal(entity.aliases[0].is_primary, 1);

      // Verify alias query
      const byAlias = dbManager.entities.findEntitiesByAlias('地球');
      assert.equal(byAlias.length, 1);
      assert.equal(byAlias[0].id, entity.id);
    });

    it('should track file_entities mentions and cross-references', () => {
      const entity = dbManager.entities.insert({
        entity_id: 'CHAR-001',
        canonical_name: '艾莉亚',
        entity_type: 'character',
        source_file_id: sourceFileId
      });

      dbManager.entities.addMention({
        source_file_id: sourceFileId,
        entity_id: entity.id,
        mention_type: 'wikilink',
        mention_count: 5,
        occurrences_json: [{ line: 12 }, { line: 45 }]
      });

      const mentions = dbManager.entities.getMentionsBySourceFile(sourceFileId);
      assert.equal(mentions.length, 1);
      assert.equal(mentions[0].canonical_name, '艾莉亚');
      assert.equal(mentions[0].mention_count, 5);
    });

    it('should detect ANOM_001: Same-Name Planet Different ID', () => {
      const sf2 = dbManager.sourceFiles.insert({
        file_path: '/vault/Drafts/PL-014_Terra_v2.md',
        relative_path: 'Drafts/PL-014_Terra_v2.md',
        size_bytes: 400,
        mtime_ms: 2000,
        sha256_hash: 'def',
        source_category: 'planet'
      });

      // Planet 1: 泰拉 with PL-001
      dbManager.entities.insert({
        entity_id: 'PL-001',
        canonical_name: '泰拉',
        entity_type: 'planet',
        source_file_id: sourceFileId
      });

      // Planet 2: 泰拉 with PL-014
      dbManager.entities.insert({
        entity_id: 'PL-014',
        canonical_name: '泰拉',
        entity_type: 'planet',
        source_file_id: sf2.id
      });

      const conflicts = dbManager.entities.findDuplicateNamesDiffIds('planet');
      assert.equal(conflicts.length, 1);
      assert.equal(conflicts[0].normalized_name, '泰拉');
      assert.equal(conflicts[0].distinct_id_count, 2);
    });

    it('should detect ANOM_002: Same-ID Multiple Entities', () => {
      const sf2 = dbManager.sourceFiles.insert({
        file_path: '/vault/Planets/PL-005_TirNaNog.md',
        relative_path: 'Planets/PL-005_TirNaNog.md',
        size_bytes: 400,
        mtime_ms: 2000,
        sha256_hash: 'def',
        source_category: 'planet'
      });

      dbManager.entities.insert({
        entity_id: 'PL-005',
        canonical_name: '阿瓦隆',
        entity_type: 'planet',
        source_file_id: sourceFileId
      });

      dbManager.entities.insert({
        entity_id: 'PL-005',
        canonical_name: '提尔纳诺',
        entity_type: 'planet',
        source_file_id: sf2.id
      });

      const collisions = dbManager.entities.findDuplicateIdsMultiEntities();
      assert.equal(collisions.length, 1);
      assert.equal(collisions[0].entity_id, 'PL-005');
      assert.equal(collisions[0].distinct_name_count, 2);
    });

    it('should detect ANOM_008: Alias Collisions Across Distinct Entities', () => {
      const e1 = dbManager.entities.insert({
        entity_id: 'CHAR-002',
        canonical_name: '塞西莉亚',
        entity_type: 'character',
        source_file_id: sourceFileId
      });
      dbManager.entities.addAlias({
        entity_id: e1.id,
        alias_name: '莉亚',
        alias_type: 'nickname'
      });

      const e2 = dbManager.entities.insert({
        entity_id: 'CHAR-009',
        canonical_name: '奥蕾莉亚',
        entity_type: 'character',
        source_file_id: sourceFileId
      });
      dbManager.entities.addAlias({
        entity_id: e2.id,
        alias_name: '莉亚',
        alias_type: 'nickname'
      });

      const aliasCollisions = dbManager.entities.findDuplicateAliases();
      assert.equal(aliasCollisions.length, 1);
      assert.equal(aliasCollisions[0].normalized_alias, '莉亚');
      assert.equal(aliasCollisions[0].distinct_entity_count, 2);
    });
    it('should detect ANOM_005: Legacy ID conflicts with active canonical entities', () => {
      // Entity 1: 泰拉 (PL-001) with legacy alias 'OLD-PL-01'
      const e1 = dbManager.entities.insert(
        {
          entity_id: 'PL-001',
          canonical_name: '泰拉',
          entity_type: 'planet',
          source_file_id: sourceFileId
        },
        [
          { alias_name: 'OLD-PL-01', alias_type: 'legacy_id' }
        ]
      );

      // Entity 2: 火星勘测站 with canonical entity_id 'OLD-PL-01'
      const e2 = dbManager.entities.insert({
        entity_id: 'OLD-PL-01',
        canonical_name: '火星勘测站',
        entity_type: 'location',
        source_file_id: sourceFileId
      });

      const legacyConflicts = dbManager.entities.findLegacyIdConflicts();
      assert.equal(legacyConflicts.length, 1);
      assert.equal(legacyConflicts[0].legacy_id, 'OLD-PL-01');
      assert.equal(legacyConflicts[0].target_name, '泰拉');
      assert.equal(legacyConflicts[0].conflicting_name, '火星勘测站');
    });

    it('should support entity polymorphic retrieval, name lookup, and deletion', () => {
      const e = dbManager.entities.insert({
        entity_id: 'ORG-01',
        canonical_name: '星际联邦',
        entity_type: 'organization',
        source_file_id: sourceFileId
      });

      const single = dbManager.entities.getSingleByEntityId('ORG-01');
      assert.equal(single.id, e.id);

      const byName = dbManager.entities.getByName('星际联邦', 'organization');
      assert.equal(byName.length, 1);
      assert.equal(byName[0].id, e.id);

      // Delete entity
      const deleted = dbManager.entities.deleteById(e.id);
      assert.equal(deleted, true);
      assert.equal(dbManager.entities.getById(e.id), null);
    });
  });

  // ==========================================================================
  // Suite 4: TimelineRepo Operations & Causality Inversion Detection
  // ==========================================================================
  describe('Suite 4: TimelineRepo Operations & Causality Inversion Detection', () => {
    let sourceFileId = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/Timeline/History.md',
        relative_path: 'Timeline/History.md',
        size_bytes: 1200,
        mtime_ms: 1000,
        sha256_hash: 'tl_hash',
        source_category: 'timeline'
      });
      sourceFileId = sf.id;
    });

    it('should insert, query, and sort timeline events chronologically', () => {
      dbManager.timeline.batchUpsert([
        { event_id: 'EV-03', title: '星门建成', timestamp_order: 2050.5, timeline_year: 2050, source_file_id: sourceFileId },
        { event_id: 'EV-01', title: '第一次登月', timestamp_order: 1969.7, timeline_year: 1969, source_file_id: sourceFileId },
        { event_id: 'EV-02', title: '火星基地成立', timestamp_order: 2035.2, timeline_year: 2035, source_file_id: sourceFileId }
      ]);

      const events = dbManager.timeline.query();
      assert.equal(events.length, 3);
      assert.equal(events[0].event_id, 'EV-01');
      assert.equal(events[1].event_id, 'EV-02');
      assert.equal(events[2].event_id, 'EV-03');

      const byEventId = dbManager.timeline.getByEventId('EV-02');
      assert.equal(byEventId.title, '火星基地成立');

      const count = dbManager.timeline.count({ year: 2050 });
      assert.equal(count, 1);
    });

    it('should detect ANOM_009: Timeline Chronology / Causality Order Inversion', () => {
      // Event B (timestamp 2045.06) lists Event A (timestamp 2048.01) as prerequisite
      dbManager.timeline.insert({
        event_id: 'EV-2048-01',
        title: '第二次太阳系内战爆发',
        timestamp_order: 2048.01,
        source_file_id: sourceFileId
      });

      dbManager.timeline.insert({
        event_id: 'EV-2045-02',
        title: '火星停战协议签署',
        timestamp_order: 2045.06,
        source_file_id: sourceFileId,
        causality_prerequisite_ids_json: ['EV-2048-01']
      });

      const inversions = dbManager.timeline.findChronologyInversions();
      assert.equal(inversions.length, 1);
      assert.equal(inversions[0].child_event_id, 'EV-2045-02');
      assert.equal(inversions[0].prerequisite_event_id, 'EV-2048-01');
      assert.ok(inversions[0].child_time < inversions[0].prerequisite_time);
    });
  });

  // ==========================================================================
  // Suite 5: ChapterRepo & ForeshadowingRepo Operations
  // ==========================================================================
  describe('Suite 5: ChapterRepo & ForeshadowingRepo Operations', () => {
    let sourceFileId = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/Chapters/Ch01.md',
        relative_path: 'Chapters/Ch01.md',
        size_bytes: 5000,
        mtime_ms: 1000,
        sha256_hash: 'ch_hash',
        source_category: 'chapter'
      });
      sourceFileId = sf.id;
    });

    it('should manage chapters with decimal numbering and status filters', () => {
      dbManager.chapters.insert({
        chapter_number: 1,
        volume_number: 1,
        title: '启航',
        relative_path: 'Chapters/Ch01.md',
        source_file_id: sourceFileId,
        word_count: 5000,
        status: 'completed'
      });

      dbManager.chapters.insert({
        chapter_number: 1.5,
        volume_number: 1,
        title: '幕间：深空低语',
        relative_path: 'Chapters/Ch01_5.md',
        source_file_id: sourceFileId,
        word_count: 2200,
        status: 'draft'
      });

      const ch1 = dbManager.chapters.getByVolumeAndChapter(1, 1);
      assert.equal(ch1.title, '启航');
      assert.equal(ch1.status, 'completed');

      const bySourceFile = dbManager.chapters.getBySourceFileId(sourceFileId);
      assert.equal(bySourceFile.title, '启航');

      const completed = dbManager.chapters.query({ status: 'completed' });
      assert.equal(completed.length, 1);
      assert.equal(completed[0].chapter_number, 1);

      const count = dbManager.chapters.count({ volume_number: 1 });
      assert.equal(count, 2);
    });

    it('should track foreshadowing clues, resolution, and ANOM_010 detection', () => {
      const clue = dbManager.foreshadowing.insert({
        foreshadow_id: 'FS-001',
        title: '神秘挂坠',
        description: '主角胸前的未知合金挂坠',
        setup_file_id: sourceFileId,
        status: 'open',
        importance_level: 'major'
      });

      assert.equal(clue.status, 'open');

      // Resolve the clue
      const resolved = dbManager.foreshadowing.resolve(clue.id, {
        resolution_file_id: sourceFileId,
        resolution_line: 120,
        resolution_snippet: '挂坠中暗藏星图芯片...'
      });

      assert.equal(resolved.status, 'closed');
      assert.equal(resolved.resolution_line, 120);

      const byIdCode = dbManager.foreshadowing.getByForeshadowId('FS-001');
      assert.equal(byIdCode.id, clue.id);

      // Insert an unclosed/mismatched clue (closed status but null resolution file and chapter)
      dbManager.foreshadowing.insert({
        foreshadow_id: 'FS-002_BAD',
        title: '未解析的伏笔',
        description: '标记关闭却无回收引用的伏笔',
        setup_file_id: sourceFileId,
        status: 'closed', // Faulty status
        resolution_file_id: null,
        resolution_chapter_id: null
      });

      const mismatches = dbManager.foreshadowing.findUnclosedStatusMismatches();
      assert.equal(mismatches.length, 1);
      assert.equal(mismatches[0].foreshadow_id, 'FS-002_BAD');
    });
  });

  // ==========================================================================
  // Suite 6: AnomalyRepo & Scan Manifests Operations
  // ==========================================================================
  describe('Suite 6: AnomalyRepo & Scan Manifests Operations', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('should record anomalies, query by severity, and mark resolved', () => {
      const sessionId = 'scan_20260828_001';

      dbManager.anomalies.batchInsert([
        {
          scan_session_id: sessionId,
          anomaly_rule_id: 'ANOM_001_SAME_NAME_DIFF_ID',
          severity: 'HIGH',
          title: '泰拉星球 ID 冲突',
          message: '检测到两个泰拉星球定义',
          affectedFilePaths: ['Planets/PL-001.md', 'Drafts/PL-014.md']
        },
        {
          scan_session_id: sessionId,
          anomaly_rule_id: 'ANOM_002_SAME_ID_MULTI_ENTITY',
          severity: 'CRITICAL',
          title: 'PL-005 实体编号重复',
          message: '阿瓦隆与提尔纳诺共用 PL-005',
          affectedFilePaths: ['Planets/PL-005_A.md', 'Planets/PL-005_B.md']
        }
      ]);

      const sessionAnomalies = dbManager.anomalies.getBySessionId(sessionId);
      assert.equal(sessionAnomalies.length, 2);
      assert.equal(sessionAnomalies[0].affectedFilePaths.length, 2);

      const criticalOnly = dbManager.anomalies.query({ severity: 'CRITICAL' });
      assert.equal(criticalOnly.length, 1);
      assert.equal(criticalOnly[0].anomaly_rule_id, 'ANOM_002_SAME_ID_MULTI_ENTITY');

      const summary = dbManager.anomalies.getSummaryBySeverity(sessionId);
      assert.equal(summary.CRITICAL, 1);
      assert.equal(summary.HIGH, 1);
      assert.equal(summary.total, 2);

      // Resolve one anomaly
      dbManager.anomalies.resolve(sessionAnomalies[0].id);
      const unresolved = dbManager.anomalies.query({ is_resolved: 0 });
      assert.equal(unresolved.length, 1);
      assert.equal(unresolved[0].anomaly_rule_id, 'ANOM_002_SAME_ID_MULTI_ENTITY');
    });

    it('should manage scan manifest lifecycle', () => {
      const manifest = dbManager.anomalies.insertManifest({
        scan_session_id: 'session_alpha',
        vault_root_path: 'H:/Obsidian/NovelVault',
        total_files_scanned: 100,
        files_added: 95,
        files_updated: 5
      });

      assert.equal(manifest.scan_session_id, 'session_alpha');
      assert.equal(manifest.total_files_scanned, 100);

      // Update manifest upon scan completion
      const updated = dbManager.anomalies.updateManifest('session_alpha', {
        scan_duration_ms: 125,
        total_anomalies_detected: 4,
        manifest_summary_json: { status: 'success' }
      });

      assert.equal(updated.scan_duration_ms, 125);
      assert.equal(updated.total_anomalies_detected, 4);

      const latest = dbManager.anomalies.getLatestManifest();
      assert.equal(latest.scan_session_id, 'session_alpha');

      const manifestsList = dbManager.anomalies.queryManifests(5);
      assert.equal(manifestsList.length, 1);
    });
  });

  // ==========================================================================
  // Suite 7: Foreign Key Cascades & Transaction Rollbacks
  // ==========================================================================
  describe('Suite 7: Foreign Key Cascades & Transaction Rollbacks', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('should cascade delete child entities, mentions, and chapters when source file is deleted', () => {
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/Ch01.md',
        relative_path: 'Ch01.md',
        size_bytes: 1000,
        mtime_ms: 100,
        sha256_hash: 'h1',
        source_category: 'chapter'
      });

      const entity = dbManager.entities.insert({
        entity_id: 'CHAR-01',
        canonical_name: '主角',
        source_file_id: sf.id
      });

      dbManager.entities.addAlias({
        entity_id: entity.id,
        alias_name: '队长'
      });

      dbManager.chapters.insert({
        chapter_number: 1,
        title: '第一章',
        relative_path: 'Ch01.md',
        source_file_id: sf.id
      });

      assert.equal(dbManager.entities.count(), 1);
      assert.equal(dbManager.chapters.count(), 1);
      assert.equal(dbManager.entities.getAliasesForEntity(entity.id).length, 1);

      // Delete the parent source file
      const deleted = dbManager.sourceFiles.deleteById(sf.id);
      assert.equal(deleted, true);

      // Chapters cascade delete; Entity is retained with source_file_id set to null (M1-R1 Decoupling)
      assert.equal(dbManager.chapters.count(), 0);
      assert.equal(dbManager.entities.count(), 1);
      const updatedEntity = dbManager.entities.getById(entity.id);
      assert.equal(updatedEntity.source_file_id, null);
    });

    it('should rollback entire transaction on error', () => {
      assert.equal(dbManager.sourceFiles.count(), 0);

      assert.throws(() => {
        dbManager.transaction(() => {
          dbManager.sourceFiles.insert({
            file_path: '/vault/A.md',
            relative_path: 'A.md',
            size_bytes: 100,
            mtime_ms: 1,
            sha256_hash: 'a',
            source_category: 'lore'
          });

          // Deliberate error to trigger rollback
          throw new Error('Simulated transaction failure');
        })();
      });

      assert.equal(dbManager.sourceFiles.count(), 0, 'Rolled-back transaction must leave table empty');
    });
  });

  // ==========================================================================
  // Suite 8: DatabaseManager High-Level Contract Delegates
  // ==========================================================================
  describe('Suite 8: DatabaseManager High-Level Contract Delegates', () => {
    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
    });

    it('should satisfy all DatabaseManager contract convenience methods', () => {
      const sf = dbManager.upsertSourceFile({
        file_path: '/vault/P.md',
        relative_path: 'P.md',
        size_bytes: 100,
        mtime_ms: 1,
        sha256_hash: 'p',
        source_category: 'planet'
      });

      assert.ok(sf.id > 0);

      const fetchedSf = dbManager.getSourceFile('P.md');
      assert.equal(fetchedSf.id, sf.id);

      dbManager.batchUpsertEntities([
        { entity_id: 'PL-01', canonical_name: '新泰拉', source_file_id: sf.id, entity_type: 'planet' }
      ]);

      const entities = dbManager.queryEntities({ entity_type: 'planet' });
      assert.equal(entities.length, 1);
      assert.equal(entities[0].canonical_name, '新泰拉');

      dbManager.saveScanManifest({
        scan_session_id: 'sess_1',
        vault_root_path: '/vault',
        total_files_scanned: 10
      });

      dbManager.recordAnomalies([
        {
          scan_session_id: 'sess_1',
          anomaly_rule_id: 'ANOM_001',
          severity: 'HIGH',
          title: 'Test Anomaly',
          message: 'Test message',
          affectedFilePaths: ['P.md']
        }
      ]);

      const anomalies = dbManager.getAnomalyReport('sess_1');
      assert.equal(anomalies.length, 1);
      assert.equal(anomalies[0].title, 'Test Anomaly');

      // Clear all tables
      dbManager.clearAllTables();
      const stats = dbManager.getStats();
      assert.equal(stats.totalFiles, 0);
      assert.equal(stats.totalEntities, 0);
      assert.equal(stats.totalAnomalies, 0);
    });
  });

  // ==========================================================================
  // Suite 9: Connection Lifecycle, Execution & Edge Cases
  // ==========================================================================
  describe('Suite 9: Connection Lifecycle, Execution & Edge Cases', () => {
    it('should support raw exec, prepare, vacuum, and checkpoint', () => {
      const dbPath = path.join(tempEnv.path, 'data', 'lifecycle.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      dbManager.exec('CREATE TABLE IF NOT EXISTS custom_table (id INTEGER PRIMARY KEY, note TEXT);');
      const stmt = dbManager.prepare('INSERT INTO custom_table (note) VALUES (?)');
      stmt.run('test note');

      const count = dbManager.prepare('SELECT COUNT(*) AS c FROM custom_table').get().c;
      assert.equal(count, 1);

      dbManager.vacuum();
      const cpResult = dbManager.checkpoint('PASSIVE');
      assert.ok(cpResult !== undefined);

      assert.equal(dbManager.isOpen(), true);
      assert.equal(dbManager.isClosed(), false);

      dbManager.close();
      assert.equal(dbManager.isOpen(), false);
      assert.equal(dbManager.isClosed(), true);

      assert.throws(() => {
        dbManager.exec('SELECT 1');
      }, /closed/i);
    });
  });
});


