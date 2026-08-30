/**
 * @file databaseAdversarialStress.test.js
 * @description Adversarial stress-testing suite for VCPNovelManager SQLite Database Layer (M2)
 * Authored by Challenger 1
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('Database Layer Adversarial Stress & Attack Harness (Challenger 1)', () => {
  let tempEnv = null;
  let dbManager = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m2_db_adv_');
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
  // Vector 1: High-Volume Batch Operations & Scalability Stress
  // ==========================================================================
  describe('Vector 1: High-Volume Batch Operations & Scalability Stress', () => {
    it('should efficiently batch insert 5,000 source files in a single transaction', () => {
      const dbPath = path.join(tempEnv.path, 'data', 'stress_files.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      const startTime = Date.now();
      const files = [];
      for (let i = 1; i <= 5000; i++) {
        files.push({
          file_path: `H:/Vault/Lore/Item_${i}.md`,
          relative_path: `Lore/Item_${i}.md`,
          file_name: `Item_${i}.md`,
          extension: '.md',
          size_bytes: 1024 + (i % 500),
          mtime_ms: 1700000000000 + i,
          sha256_hash: `hash_${i}_abcdef1234567890abcdef1234567890`,
          source_category: i % 2 === 0 ? 'lore' : 'planet',
          status: i % 10 === 0 ? 'draft' : 'active',
          review_status: i % 5 === 0 ? 'confirmed' : 'unreviewed',
          has_frontmatter: 1,
          frontmatter_json: { id: `ITEM-${i}`, index: i },
          line_count: 30,
          word_count: 500
        });
      }

      const count = dbManager.sourceFiles.batchUpsert(files);
      const durationMs = Date.now() - startTime;

      assert.equal(count, 5000, 'All 5,000 files should be inserted');
      assert.equal(dbManager.sourceFiles.count(), 5000);
      assert.ok(durationMs < 5000, `Batch insert of 5,000 items took ${durationMs}ms, should be < 5000ms`);

      // Verify index lookup performance
      const lookupStart = Date.now();
      const item2500 = dbManager.sourceFiles.getByRelativePath('Lore/Item_2500.md');
      const lookupMs = Date.now() - lookupStart;

      assert.ok(item2500 !== null);
      assert.equal(item2500.relative_path, 'Lore/Item_2500.md');
      assert.ok(lookupMs < 20, `Indexed relative_path query took ${lookupMs}ms, should be < 20ms`);

      // Verify filtered count
      assert.equal(dbManager.sourceFiles.count({ source_category: 'planet' }), 2500);
    });

    it('should batch upsert 3,000 entities with aliases and JSON attributes', () => {
      dbManager = new DatabaseManager(':memory:');
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/root.md',
        relative_path: 'root.md',
        size_bytes: 100,
        mtime_ms: 1,
        sha256_hash: 'root',
        source_category: 'lore'
      });

      const entities = [];
      for (let i = 1; i <= 3000; i++) {
        entities.push({
          entity_id: `CHAR-${String(i).padStart(4, '0')}`,
          canonical_name: `角色_${i}`,
          entity_type: 'character',
          category: i % 2 === 0 ? 'protagonist' : 'supporting',
          status: 'active',
          review_status: 'unreviewed',
          summary: `人物简介 ${i}`,
          attributes_json: { level: i, power: i * 10, skills: ['combat', 'magic'] },
          source_file_id: sf.id,
          aliases: [`别名_${i}_A`, `别名_${i}_B`]
        });
      }

      const startTime = Date.now();
      const count = dbManager.entities.batchUpsert(entities);
      const durationMs = Date.now() - startTime;

      assert.equal(count, 3000);
      assert.equal(dbManager.entities.count(), 3000);
      assert.ok(durationMs < 5000, `Entity batch upsert took ${durationMs}ms`);

      // Verify total aliases created (3000 * 2 = 6000)
      const stats = dbManager.getStats();
      assert.equal(stats.totalAliases, 6000);

      // Verify alias lookup
      const found = dbManager.entities.findEntitiesByAlias('别名_1500_A');
      assert.equal(found.length, 1);
      assert.equal(found[0].canonical_name, '角色_1500');
    });
  });

  // ==========================================================================
  // Vector 2: Transaction Rollback & Atomicity Under Stress
  // ==========================================================================
  describe('Vector 2: Transaction Rollback & Atomicity Under Stress', () => {
    it('should roll back completely when error occurs mid-batch during custom transaction', () => {
      dbManager = new DatabaseManager(':memory:');

      assert.equal(dbManager.sourceFiles.count(), 0);

      assert.throws(() => {
        const tx = dbManager.transaction(() => {
          for (let i = 1; i <= 100; i++) {
            if (i === 77) {
              throw new Error('Mid-batch intentional crash at item 77');
            }
            dbManager.sourceFiles.insert({
              file_path: `/vault/file_${i}.md`,
              relative_path: `file_${i}.md`,
              size_bytes: 100,
              mtime_ms: 1,
              sha256_hash: `hash_${i}`,
              source_category: 'lore'
            });
          }
        });
        tx();
      }, /Mid-batch intentional crash/);

      assert.equal(dbManager.sourceFiles.count(), 0, 'Database must contain 0 rows after rolled back transaction');
    });

    it('should roll back completely when foreign key constraint is violated in transaction', () => {
      dbManager = new DatabaseManager(':memory:');

      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/valid.md',
        relative_path: 'valid.md',
        size_bytes: 100,
        mtime_ms: 1,
        sha256_hash: 'valid',
        source_category: 'lore'
      });

      assert.throws(() => {
        const tx = dbManager.transaction(() => {
          // Valid insertion
          dbManager.entities.insert({
            entity_id: 'E-01',
            canonical_name: '有效实体',
            source_file_id: sf.id
          });

          // Invalid insertion referencing non-existent source_file_id 999999
          dbManager.entities.insert({
            entity_id: 'E-02',
            canonical_name: '非法外键实体',
            source_file_id: 999999
          });
        });
        tx();
      }, /FOREIGN KEY constraint failed/i);

      // Verify that the valid insertion inside the transaction was also rolled back
      assert.equal(dbManager.entities.count(), 0, 'Transaction rollback must leave entities table empty');
    });
  });

  // ==========================================================================
  // Vector 3: Foreign Key Cascade & Relational Integrity Enforcement
  // ==========================================================================
  describe('Vector 3: Foreign Key Cascade & Relational Integrity Enforcement', () => {
    it('should strictly throw error on insertion with invalid foreign keys when PRAGMA foreign_keys = ON', () => {
      dbManager = new DatabaseManager(':memory:');

      // 1. Invalid source_file_id on entities
      assert.throws(() => {
        dbManager.entities.insert({
          entity_id: 'PL-999',
          canonical_name: '孤立星球',
          source_file_id: 8888
        });
      }, /FOREIGN KEY/i);

      // 2. Invalid entity_id on entity_aliases
      assert.throws(() => {
        dbManager.entities.addAlias({
          entity_id: 7777,
          alias_name: '孤立别名'
        });
      }, /FOREIGN KEY/i);

      // 3. Invalid source_file_id on timeline_events
      assert.throws(() => {
        dbManager.timeline.insert({
          event_id: 'EV-999',
          title: '孤立事件',
          timestamp_order: 100,
          source_file_id: 6666
        });
      }, /FOREIGN KEY/i);

      // 4. Invalid source_file_id on chapters
      assert.throws(() => {
        dbManager.chapters.insert({
          chapter_number: 1,
          title: '孤立章节',
          relative_path: 'Ch.md',
          source_file_id: 5555
        });
      }, /FOREIGN KEY/i);

      // 5. Invalid setup_file_id on foreshadowing
      assert.throws(() => {
        dbManager.foreshadowing.insert({
          foreshadow_id: 'FS-999',
          title: '孤立伏笔',
          description: '无关联文件',
          setup_file_id: 4444
        });
      }, /FOREIGN KEY/i);
    });

    it('should thoroughly cascade delete all dependent records across 6 tables when source_file is deleted', () => {
      dbManager = new DatabaseManager(':memory:');

      const sf1 = dbManager.sourceFiles.insert({
        file_path: '/vault/Book1.md',
        relative_path: 'Book1.md',
        size_bytes: 5000,
        mtime_ms: 1000,
        sha256_hash: 'hash1',
        source_category: 'chapter'
      });

      const sf2 = dbManager.sourceFiles.insert({
        file_path: '/vault/Book2.md',
        relative_path: 'Book2.md',
        size_bytes: 3000,
        mtime_ms: 1000,
        sha256_hash: 'hash2',
        source_category: 'chapter'
      });

      const entity1 = dbManager.entities.insert({
        entity_id: 'CHAR-01',
        canonical_name: '主角一号',
        source_file_id: sf1.id
      }, ['主角别名1', '主角别名2']);

      const entity2 = dbManager.entities.insert({
        entity_id: 'CHAR-02',
        canonical_name: '主角二号',
        source_file_id: sf2.id
      }, ['配角别名']);

      // Mention link sf1 mentions entity2, sf2 mentions entity1
      dbManager.entities.addMention({
        source_file_id: sf1.id,
        entity_id: entity2.id,
        mention_type: 'wikilink'
      });
      dbManager.entities.addMention({
        source_file_id: sf2.id,
        entity_id: entity1.id,
        mention_type: 'wikilink'
      });

      // Chapter
      const ch1 = dbManager.chapters.insert({
        chapter_number: 1,
        volume_number: 1,
        title: '第一章',
        relative_path: 'Book1.md',
        source_file_id: sf1.id,
        pov_entity_id: entity1.id
      });

      // Timeline event referencing entity1
      const tl1 = dbManager.timeline.insert({
        event_id: 'EV-01',
        title: '大事件',
        timestamp_order: 100,
        source_file_id: sf1.id,
        primary_entity_id: entity1.id
      });

      // Foreshadowing setup in sf1, resolved in sf2
      const fs1 = dbManager.foreshadowing.insert({
        foreshadow_id: 'FS-01',
        title: '惊天大伏笔',
        description: '伏笔内容',
        setup_file_id: sf1.id,
        setup_chapter_id: ch1.id,
        resolution_file_id: sf2.id
      });

      // Initial stats
      assert.equal(dbManager.sourceFiles.count(), 2);
      assert.equal(dbManager.entities.count(), 2);
      assert.equal(dbManager.chapters.count(), 1);
      assert.equal(dbManager.timeline.count(), 1);
      assert.equal(dbManager.foreshadowing.count(), 1);

      // Act: Delete sf1 (cascading delete)
      dbManager.sourceFiles.deleteById(sf1.id);

      // Verify sf1 deleted
      assert.equal(dbManager.sourceFiles.getById(sf1.id), null);

      // Verify entity1 is preserved with source_file_id set to null (M1 decoupled contract)
      const updatedEntity1 = dbManager.entities.getById(entity1.id);
      assert.ok(updatedEntity1 !== null);
      assert.equal(updatedEntity1.source_file_id, null);

      // Verify mentions in sf1 cascade deleted
      assert.equal(dbManager.entities.getMentionsBySourceFile(sf1.id).length, 0);

      // Verify chapters in sf1 cascade deleted
      assert.equal(dbManager.chapters.getById(ch1.id), null);

      // Verify timeline in sf1 cascade deleted
      assert.equal(dbManager.timeline.getById(tl1.id), null);

      // Verify foreshadowing setup in sf1 cascade deleted
      assert.equal(dbManager.foreshadowing.getById(fs1.id), null);

      // Verify entity2 in sf2 remains intact
      const preservedEntity2 = dbManager.entities.getById(entity2.id);
      assert.ok(preservedEntity2 !== null);
      assert.equal(preservedEntity2.canonical_name, '主角二号');

      // Verify mention of entity1 from sf2 remains intact because entity1 is preserved
      assert.equal(dbManager.entities.getMentionsBySourceFile(sf2.id).length, 1);
    });

    it('should set NULL on foreign keys when entity is deleted for chapters POV and timeline primary entity', () => {
      dbManager = new DatabaseManager(':memory:');

      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/doc.md',
        relative_path: 'doc.md',
        size_bytes: 100,
        mtime_ms: 1,
        sha256_hash: 'd',
        source_category: 'lore'
      });

      const entity = dbManager.entities.insert({
        entity_id: 'CHAR-99',
        canonical_name: '临时角色',
        source_file_id: sf.id
      });

      const ch = dbManager.chapters.insert({
        chapter_number: 1,
        title: '测试章节',
        relative_path: 'doc.md',
        source_file_id: sf.id,
        pov_entity_id: entity.id
      });

      const tl = dbManager.timeline.insert({
        event_id: 'EV-88',
        title: '测试事件',
        timestamp_order: 10,
        source_file_id: sf.id,
        primary_entity_id: entity.id
      });

      assert.equal(ch.pov_entity_id, entity.id);
      assert.equal(tl.primary_entity_id, entity.id);

      // Delete the entity
      dbManager.entities.deleteById(entity.id);

      // Verify chapters.pov_entity_id was set to NULL
      const updatedCh = dbManager.chapters.getById(ch.id);
      assert.ok(updatedCh !== null);
      assert.equal(updatedCh.pov_entity_id, null);

      // Verify timeline.primary_entity_id was set to NULL
      const updatedTl = dbManager.timeline.getById(tl.id);
      assert.ok(updatedTl !== null);
      assert.equal(updatedTl.primary_entity_id, null);
    });
  });

  // ==========================================================================
  // Vector 4: Complex Entity Alias & Anomaly Detection SQL Harness
  // ==========================================================================
  describe('Vector 4: Complex Entity Alias & Anomaly Detection SQL Harness', () => {
    let sfA = null;
    let sfB = null;
    let sfC = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      sfA = dbManager.sourceFiles.insert({ file_path: '/vault/A.md', relative_path: 'A.md', size_bytes: 100, mtime_ms: 1, sha256_hash: 'a', source_category: 'planet' });
      sfB = dbManager.sourceFiles.insert({ file_path: '/vault/B.md', relative_path: 'B.md', size_bytes: 100, mtime_ms: 1, sha256_hash: 'b', source_category: 'planet' });
      sfC = dbManager.sourceFiles.insert({ file_path: '/vault/C.md', relative_path: 'C.md', size_bytes: 100, mtime_ms: 1, sha256_hash: 'c', source_category: 'character' });
    });

    it('should accurately detect ANOM_001 with whitespace and casing differences across multiple planets', () => {
      // 3 planets with same normalized name '泰拉' but different IDs
      dbManager.entities.insert({ entity_id: 'PL-001', canonical_name: '泰拉', entity_type: 'planet', source_file_id: sfA.id });
      dbManager.entities.insert({ entity_id: 'PL-014', canonical_name: '  泰拉  ', entity_type: 'planet', source_file_id: sfB.id });
      dbManager.entities.insert({ entity_id: 'PL-099', canonical_name: '泰拉', entity_type: 'planet', source_file_id: sfC.id });

      // Deprecated entity should NOT trigger anomaly
      dbManager.entities.insert({ entity_id: 'PL-OLD', canonical_name: '泰拉', entity_type: 'planet', status: 'deprecated', source_file_id: sfA.id });

      const anom1 = dbManager.entities.findDuplicateNamesDiffIds('planet');
      assert.equal(anom1.length, 1);
      assert.equal(anom1[0].normalized_name, '泰拉');
      assert.equal(anom1[0].distinct_id_count, 3);
    });

    it('should accurately detect ANOM_002 with single entity_id mapped to distinct names and multiple rows', () => {
      dbManager.entities.insert({ entity_id: 'SHARED-ID-01', canonical_name: '青龙要塞', entity_type: 'location', source_file_id: sfA.id });
      dbManager.entities.insert({ entity_id: 'SHARED-ID-01', canonical_name: '白虎要塞', entity_type: 'location', source_file_id: sfB.id });

      const anom2 = dbManager.entities.findDuplicateIdsMultiEntities();
      assert.equal(anom2.length, 1);
      assert.equal(anom2[0].entity_id, 'SHARED-ID-01');
      assert.equal(anom2[0].distinct_name_count, 2);
    });

    it('should detect ANOM_005 cross-table collision between legacy_id aliases and canonical entity_ids', () => {
      // e1 has canonical ID 'CHAR-001' and legacy alias 'HERO-OLD'
      const e1 = dbManager.entities.insert({ entity_id: 'CHAR-001', canonical_name: '勇者', entity_type: 'character', source_file_id: sfA.id }, [
        { alias_name: 'HERO-OLD', alias_type: 'legacy_id' }
      ]);

      // e2 has canonical ID 'HERO-OLD' (direct conflict with e1's legacy alias)
      const e2 = dbManager.entities.insert({ entity_id: 'HERO-OLD', canonical_name: '老旧机甲', entity_type: 'item', source_file_id: sfB.id });

      const legacyConflicts = dbManager.entities.findLegacyIdConflicts();
      assert.equal(legacyConflicts.length, 1);
      assert.equal(legacyConflicts[0].legacy_id, 'HERO-OLD');
      assert.equal(legacyConflicts[0].target_name, '勇者');
      assert.equal(legacyConflicts[0].conflicting_name, '老旧机甲');
    });

    it('should search entities by keyword matching across canonical name, summary, description, and aliases', () => {
      const e = dbManager.entities.insert({
        entity_id: 'TECH-01',
        canonical_name: '曲率引擎',
        summary: '超光速跃迁设备',
        description: '由反物质驱动的核心推进系统',
        source_file_id: sfA.id
      }, ['折跃引擎', 'FTL Drive']);

      // 1. Search by canonical name
      assert.equal(dbManager.entities.query({ query: '曲率' }).length, 1);

      // 2. Search by summary
      assert.equal(dbManager.entities.query({ query: '超光速' }).length, 1);

      // 3. Search by description
      assert.equal(dbManager.entities.query({ query: '反物质驱动' }).length, 1);

      // 4. Search by alias
      assert.equal(dbManager.entities.query({ query: 'FTL Drive' }).length, 1);
      assert.equal(dbManager.entities.query({ query: '折跃' }).length, 1);

      // 5. Search for non-existent keyword
      assert.equal(dbManager.entities.query({ query: '魔法飞毯' }).length, 0);
    });
  });

  // ==========================================================================
  // Vector 5: SQL Parameter Safety & Injection Attack Matrix
  // ==========================================================================
  describe('Vector 5: SQL Parameter Safety & Injection Attack Matrix', () => {
    let sourceFileId = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/sec.md',
        relative_path: 'sec.md',
        size_bytes: 100,
        mtime_ms: 1,
        sha256_hash: 'sec',
        source_category: 'lore'
      });
      sourceFileId = sf.id;
    });

    const maliciousPayloads = [
      "'; DROP TABLE source_files; --",
      "' OR '1'='1",
      "' UNION SELECT id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, has_frontmatter, frontmatter_raw, frontmatter_json, line_count, word_count, is_placeholder, placeholder_reason, scan_version, last_scanned_at, created_at, updated_at FROM source_files --",
      "\\0",
      "'; VACUUM; --",
      "\" OR \"\"=\"",
      "<script>alert('xss')</script>",
      "🎉🚀✨👾🔥 Unicode Special 泰拉 𠮷野家",
      "\n\r\t'\"\0\x1a"
    ];

    it('should safely handle malicious SQL injection strings across all SourceFileRepo filter fields', () => {
      for (const payload of maliciousPayloads) {
        // Query should safely execute without SQL injection syntax errors or table destruction
        const res1 = dbManager.sourceFiles.query({ search: payload });
        assert.ok(Array.isArray(res1));

        const res2 = dbManager.sourceFiles.query({ source_category: payload });
        assert.ok(Array.isArray(res2));

        const res3 = dbManager.sourceFiles.query({ status: payload });
        assert.ok(Array.isArray(res3));

        const res4 = dbManager.sourceFiles.query({ review_status: payload });
        assert.ok(Array.isArray(res4));

        const count = dbManager.sourceFiles.count({ search: payload });
        assert.ok(typeof count === 'number');
      }

      // Verify table still exists and is untouched
      assert.equal(dbManager.sourceFiles.count(), 1);
    });

    it('should reject or sanitize malicious orderBy and orderDirection injections', () => {
      const maliciousOrderBy = [
        "id; DROP TABLE entities;",
        "id DESC; DELETE FROM source_files; --",
        "(SELECT 1 FROM sqlite_master)",
        "CASE WHEN (1=1) THEN id ELSE NULL END"
      ];

      for (const attack of maliciousOrderBy) {
        // Must fallback safely to default order column and not execute injection
        const files = dbManager.sourceFiles.query({ orderBy: attack, orderDirection: 'DESC; DROP TABLE entities; --' });
        assert.ok(Array.isArray(files));

        const entities = dbManager.entities.query({ orderBy: attack });
        assert.ok(Array.isArray(entities));

        const timeline = dbManager.timeline.query({ orderBy: attack });
        assert.ok(Array.isArray(timeline));

        const chapters = dbManager.chapters.query({ orderBy: attack });
        assert.ok(Array.isArray(chapters));

        const foreshadowing = dbManager.foreshadowing.query({ orderBy: attack });
        assert.ok(Array.isArray(foreshadowing));

        const anomalies = dbManager.anomalies.query({ orderBy: attack });
        assert.ok(Array.isArray(anomalies));
      }

      // Tables must still exist
      assert.equal(dbManager.sourceFiles.count(), 1);
    });

    it('should safely store and retrieve adversarial strings with quotes, emojis, and newlines', () => {
      const complexString = "O'Connor's \"Special\" \\ 'Key' -- \n\t\r 🎉 世界 🚀 `code` ${injection}";

      const entity = dbManager.entities.insert({
        entity_id: 'ADV-001',
        canonical_name: complexString,
        summary: complexString,
        description: complexString,
        source_file_id: sourceFileId
      }, [complexString]);

      const fetched = dbManager.entities.getById(entity.id);
      assert.equal(fetched.canonical_name, complexString);
      assert.equal(fetched.summary, complexString);
      assert.equal(fetched.description, complexString);
      assert.equal(fetched.aliases[0].alias_name, complexString);

      // Search by exact complex string
      const searched = dbManager.entities.query({ query: "O'Connor's" });
      assert.equal(searched.length, 1);
      assert.equal(searched[0].id, entity.id);
    });
  });

  // ==========================================================================
  // Vector 6: Corrupted JSON, Boundary Conditions & Robustness
  // ==========================================================================
  describe('Vector 6: Corrupted JSON, Boundary Conditions & Robustness', () => {
    let sourceFileId = null;

    beforeEach(() => {
      dbManager = new DatabaseManager(':memory:');
      const sf = dbManager.sourceFiles.insert({
        file_path: '/vault/base.md',
        relative_path: 'base.md',
        size_bytes: 100,
        mtime_ms: 1,
        sha256_hash: 'base',
        source_category: 'lore'
      });
      sourceFileId = sf.id;
    });

    it('should handle corrupted JSON in anomaly_reports without crashing hydration', () => {
      // Manually insert corrupted JSON strings directly via raw SQL
      dbManager.exec(`
        INSERT INTO anomaly_reports (
          scan_session_id, anomaly_rule_id, anomaly_type, severity,
          title, message, affected_file_paths_json, affected_entity_ids_json, details_json, created_at
        ) VALUES (
          'corrupted_sess', 'ANOM_CORRUPT', 'CORRUPTION', 'HIGH',
          'Corrupted Test', 'Message', '{invalid_json}', '[unclosed_array', 'NOT_JSON_AT_ALL', datetime('now', 'localtime')
        )
      `);

      const reports = dbManager.anomalies.getBySessionId('corrupted_sess');
      assert.equal(reports.length, 1);
      assert.deepEqual(reports[0].affectedFilePaths, []);
      assert.deepEqual(reports[0].affectedEntityIds, []);
      assert.deepEqual(reports[0].details, {});
    });

    it('should handle extreme numerical values for timeline, chapters, and file sizes', () => {
      // Negative BC year and fractional timestamp
      const tl = dbManager.timeline.insert({
        event_id: 'EV-BC-3000',
        title: '远古大洪水',
        era_epoch: '纪元前',
        timestamp_order: -3000.05,
        timeline_year: -3000,
        timeline_month: 6,
        timeline_day: 15,
        source_file_id: sourceFileId
      });

      assert.equal(tl.timestamp_order, -3000.05);
      assert.equal(tl.timeline_year, -3000);

      // Decimal chapter number 0.1 and volume 999
      const ch = dbManager.chapters.insert({
        chapter_number: 0.1,
        volume_number: 999,
        title: '序幕前瞻',
        relative_path: 'base.md',
        source_file_id: sourceFileId,
        word_count: 999999
      });

      assert.equal(ch.chapter_number, 0.1);
      assert.equal(ch.volume_number, 999);

      // Large file size (10GB)
      const bigFile = dbManager.sourceFiles.insert({
        file_path: '/vault/huge.raw',
        relative_path: 'huge.raw',
        size_bytes: 10737418240, // 10GB
        mtime_ms: 1724800000000,
        sha256_hash: 'huge_hash',
        source_category: 'archive'
      });

      assert.equal(bigFile.size_bytes, 10737418240);
    });

    it('should safely execute clearAllTables repeatedly without throwing foreign key errors', () => {
      // Seed complex data
      const sf = dbManager.sourceFiles.insert({ file_path: '/vault/f.md', relative_path: 'f.md', size_bytes: 10, mtime_ms: 1, sha256_hash: 'f', source_category: 'lore' });
      const entity = dbManager.entities.insert({ entity_id: 'E-1', canonical_name: '实体', source_file_id: sf.id }, ['别名']);
      dbManager.chapters.insert({ chapter_number: 1, title: 'C', relative_path: 'f.md', source_file_id: sf.id });
      dbManager.timeline.insert({ event_id: 'EV-1', title: 'T', timestamp_order: 1, source_file_id: sf.id });
      dbManager.foreshadowing.insert({ foreshadow_id: 'FS-1', title: 'F', description: 'desc', setup_file_id: sf.id });
      dbManager.anomalies.insert({ scan_session_id: 's', anomaly_rule_id: 'A', anomaly_type: 'T', severity: 'LOW', title: 'A', message: 'M' });

      // First clear
      dbManager.clearAllTables();
      let stats = dbManager.getStats();
      assert.equal(stats.totalFiles, 0);
      assert.equal(stats.totalEntities, 0);
      assert.equal(stats.totalAliases, 0);
      assert.equal(stats.totalChapters, 0);
      assert.equal(stats.totalTimelineEvents, 0);
      assert.equal(stats.totalForeshadowing, 0);
      assert.equal(stats.totalAnomalies, 0);

      // Repeated clear on empty DB must be idempotent and succeed
      dbManager.clearAllTables();
      stats = dbManager.getStats();
      assert.equal(stats.totalFiles, 0);
    });
  });
});
