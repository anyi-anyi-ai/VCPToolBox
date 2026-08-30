/**
 * @file adversarial_entity_hierarchy_stress.test.js
 * @description Adversarial empirical stress tests for multi-file entity aggregation, deep hierarchies, and schema migration (Milestone 1 Challenger)
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Database = require('better-sqlite3');

const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const FileClassifier = require('../../src/scanner/FileClassifier');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('Adversarial Stress Test: Entity Mapping, Hierarchy & Schema Migrations', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let indexer = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_adv_stress_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({ pluginRoot: pluginDir, allowedReadRoots: [vaultDir] });
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    indexer = new IncrementalIndexer({
      vaultPath: vaultDir,
      dbManager,
      pathGuard
    });
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
  // Suite 1: Deeply Nested Directory Anchors Stress Tests
  // ==========================================================================
  describe('Suite 1: Deeply Nested Hierarchy & Path Anchor Resolution', () => {
    it('ADV-M1-01: should correctly aggregate files deeply nested inside directory anchors (5+ levels deep)', async () => {
      const deepPath = path.join(
        vaultDir,
        '04_星球档案',
        'V-001 塔兰托',
        '07_势力体系',
        'sub_faction',
        'covert_branch',
        'squads'
      );
      fs.mkdirSync(deepPath, { recursive: true });

      // Root overview
      fs.writeFileSync(
        path.join(vaultDir, '04_星球档案', 'V-001 塔兰托', '00_星球总览.md'),
        '---\nname: 塔兰托\ncode: V-001\ntype: planet\n---\n# 塔兰托总览\n帝国军事要塞。'
      );

      // Deep sub-files
      fs.writeFileSync(
        path.join(vaultDir, '04_星球档案', 'V-001 塔兰托', '07_势力体系', '01_总督府.md'),
        '# 总督府\n最高统治机构。'
      );
      fs.writeFileSync(
        path.join(vaultDir, '04_星球档案', 'V-001 塔兰托', '07_势力体系', 'sub_faction', 'detail.md'),
        '# 次级势力细节\n黑水矿工地下行会。'
      );
      fs.writeFileSync(
        path.join(deepPath, 'squad_omega.md'),
        '# 奥米茄特战小队\n极深层级编制记录。'
      );

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 4);
      assert.equal(summary.totalEntitiesExtracted, 1, 'Deeply nested files must all aggregate to single V-001 canonical entity');

      const entityWithFacets = dbManager.entities.getEntityWithFacets('V-001');
      assert.ok(entityWithFacets, 'Canonical entity V-001 must exist');
      assert.equal(entityWithFacets.linkedFiles.length, 4, 'All 4 files (including 5-level deep) must be linked');
      assert.equal(entityWithFacets.facets.definition.length, 1);
      assert.equal(entityWithFacets.facets.supplement.length, 3);

      const omegaLink = entityWithFacets.linkedFiles.find(f => f.file_name === 'squad_omega.md');
      assert.ok(omegaLink, 'squad_omega.md must be linked in file_entities');
      assert.equal(omegaLink.facet_role, 'supplement');
    });

    it('ADV-M1-02: should handle ultra-deep nesting (10 levels deep) under directory anchor without stack overflow or lost reference', async () => {
      const segments = ['04_星球档案', 'V-099 深渊星', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8', 'l9'];
      const ultraDeepDir = path.join(vaultDir, ...segments);
      fs.mkdirSync(ultraDeepDir, { recursive: true });

      fs.writeFileSync(
        path.join(vaultDir, '04_星球档案', 'V-099 深渊星', '00_星球总览.md'),
        '# 深渊星\n深层地下星系。'
      );
      fs.writeFileSync(
        path.join(ultraDeepDir, 'ancient_core.md'),
        '# 古老地核档案\n10层深度古遗物。'
      );

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 2);
      assert.equal(summary.totalEntitiesExtracted, 1);

      const entity = dbManager.entities.getEntityWithFacets('V-099');
      assert.ok(entity);
      assert.equal(entity.linkedFiles.length, 2);
      assert.equal(entity.canonical_name, '深渊星');
    });

    it('ADV-M1-03: should resolve directory anchors across different pattern formats (02_Entities/Planets, Characters, Factions)', async () => {
      // Pattern 2: 02_Entities/Planets/P-101 Oceania/sub
      const p2Dir = path.join(vaultDir, '02_Entities', 'Planets', 'P-101 Oceania', 'sub');
      fs.mkdirSync(p2Dir, { recursive: true });
      fs.writeFileSync(path.join(vaultDir, '02_Entities', 'Planets', 'P-101 Oceania', '00_overview.md'), '# Oceania\nOcean world.');
      fs.writeFileSync(path.join(p2Dir, 'flora.md'), '# Marine Flora\nDeep seaweed.');

      // Pattern 3: Characters/CHAR-007 Alice/missions
      const p3Dir = path.join(vaultDir, 'Characters', 'CHAR-007 Alice', 'missions');
      fs.mkdirSync(p3Dir, { recursive: true });
      fs.writeFileSync(path.join(vaultDir, 'Characters', 'CHAR-007 Alice', 'profile.md'), '# Alice\nProtagonist.');
      fs.writeFileSync(path.join(p3Dir, 'mission1.md'), '# Mission 1\nFirst sortie.');

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 4);
      assert.equal(summary.totalEntitiesExtracted, 2, 'Must extract 1 planet and 1 character canonical entities');

      const oceania = dbManager.entities.getEntityWithFacets('P-101');
      assert.ok(oceania, 'P-101 must exist');
      assert.equal(oceania.canonical_name, 'Oceania');
      assert.equal(oceania.entity_type, 'planet');
      assert.equal(oceania.linkedFiles.length, 2);

      const alice = dbManager.entities.getEntityWithFacets('CHAR-007');
      assert.ok(alice, 'CHAR-007 must exist');
      assert.equal(alice.canonical_name, 'Alice');
      assert.equal(alice.entity_type, 'character');
      assert.equal(alice.linkedFiles.length, 2);
    });
  });

  // ==========================================================================
  // Suite 2: Multi-Planet Identical Sub-File Collision Stress Tests
  // ==========================================================================
  describe('Suite 2: Multi-Planet Identical Sub-File Collision Resistance', () => {
    it('ADV-M1-04: should maintain complete isolation across multiple planets with identical sub-file structures and names', async () => {
      const planetCodes = ['V-001', 'V-002', 'V-003', 'V-004', 'V-005'];
      const subFiles = [
        { name: '00_星球总览.md', content: (code, i) => `# 星球 ${code}\n总览描述 ${i}` },
        { name: '01_地理生态.md', content: (code, i) => `# 地理 ${code}\n生态描述 ${i}` },
        { name: '02_历史纪元.md', content: (code, i) => `# 历史 ${code}\n历史描述 ${i}` },
        { name: '07_势力/01_执政机构.md', content: (code, i) => `# 执政 ${code}\n执政描述 ${i}` },
        { name: '07_势力/02_反抗军.md', content: (code, i) => `# 反抗军 ${code}\n反抗军描述 ${i}` }
      ];

      for (let i = 0; i < planetCodes.length; i++) {
        const code = planetCodes[i];
        const planetDir = path.join(vaultDir, '04_星球档案', `${code} 试验星${i + 1}`);
        fs.mkdirSync(path.join(planetDir, '07_势力'), { recursive: true });

        for (const sf of subFiles) {
          const filePath = path.join(planetDir, sf.name);
          fs.writeFileSync(filePath, sf.content(code, i + 1));
        }
      }

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 25);
      assert.equal(summary.totalEntitiesExtracted, 5, 'Must extract exactly 5 distinct canonical entities');

      for (let i = 0; i < planetCodes.length; i++) {
        const code = planetCodes[i];
        const entityWithFacets = dbManager.entities.getEntityWithFacets(code);
        assert.ok(entityWithFacets, `Entity ${code} must exist in DB`);
        assert.equal(entityWithFacets.canonical_name, `试验星${i + 1}`);
        assert.equal(entityWithFacets.linkedFiles.length, 5, `Entity ${code} must link exactly 5 sub-files`);

        for (const file of entityWithFacets.linkedFiles) {
          assert.ok(
            file.relative_path.includes(`${code} 试验星${i + 1}`),
            `File ${file.relative_path} must belong to directory of ${code}`
          );
        }

        assert.equal(entityWithFacets.facets.definition.length, 1);
        assert.equal(entityWithFacets.facets.supplement.length, 4);
      }

      const junctionCount = dbManager.prepare('SELECT COUNT(*) AS count FROM file_entities').get().count;
      assert.equal(junctionCount, 25, 'Total junction links in file_entities must be exactly 25');

      const sourceFileCount = dbManager.prepare('SELECT COUNT(*) AS count FROM source_files').get().count;
      assert.equal(sourceFileCount, 25, 'Total source_files must be exactly 25');
    });
  });

  // ==========================================================================
  // Suite 3: Anchor Directories with Missing Overview vs Conflict Tags
  // ==========================================================================
  describe('Suite 3: Missing Overview Fallbacks & Conflict Tag Resolution', () => {
    it('ADV-M1-05: should gracefully handle anchor directory with NO overview file, aggregating under fallback canonical name', async () => {
      const planetDir = path.join(vaultDir, '04_星球档案', 'V-777 未命名迷雾星');
      fs.mkdirSync(planetDir, { recursive: true });

      // No 00_星球总览.md! Only supplementary files
      fs.writeFileSync(path.join(planetDir, '01_地理生态.md'), '# 迷雾地理\n浓密迷雾覆盖地表。');
      fs.writeFileSync(path.join(planetDir, '02_矿产资源.md'), '# 晶体矿\n高纯度能量晶体。');

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 2);
      assert.equal(summary.totalEntitiesExtracted, 1);

      const entity = dbManager.entities.getEntityWithFacets('V-777');
      assert.ok(entity, 'Entity V-777 must be created from directory anchor segment');
      assert.equal(entity.entity_id, 'V-777');
      assert.equal(entity.canonical_name, '未命名迷雾星');
      assert.equal(entity.facets.definition.length, 0, 'No definition facet should exist initially');
      assert.equal(entity.facets.supplement.length, 2, 'Both files must be supplements');

      // Incrementally add 00_星球总览.md and sync again
      fs.writeFileSync(
        path.join(planetDir, '00_星球总览.md'),
        '---\nname: 迷雾星 (官方命名)\ncode: V-777\n---\n# 迷雾星\n官方已建立科考站。'
      );

      const summary2 = await indexer.sync();
      assert.equal(summary2.filesAdded, 1);

      const updatedEntity = dbManager.entities.getEntityWithFacets('V-777');
      assert.equal(updatedEntity.canonical_name, '迷雾星 (官方命名)', 'Canonical name must be updated by definition file');
      assert.equal(updatedEntity.facets.definition.length, 1, 'Definition facet must now have 1 file');
      assert.equal(updatedEntity.facets.supplement.length, 2, 'Supplements remain 2');
      assert.equal(updatedEntity.linkedFiles.length, 3);
    });

    it('ADV-M1-06: should classify all files with conflict tags/naming into the conflict facet bucket without crashing', async () => {
      const planetDir = path.join(vaultDir, '04_星球档案', 'V-888 异象星');
      fs.mkdirSync(planetDir, { recursive: true });

      fs.writeFileSync(
        path.join(planetDir, '01_大气模型_conflict.md'),
        '# 大气模型 (异议)\n学者A认为含毒气。'
      );
      fs.writeFileSync(
        path.join(planetDir, '02_重力常数_dispute.md'),
        '# 重力常数 (争议版)\n学者B测算为2.5G。'
      );
      fs.writeFileSync(
        path.join(planetDir, '03_古代文明_未决.md'),
        '---\nreview_status: conflicted\n---\n# 古代文明\n遗迹归属存在历史争议。'
      );

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 3);
      assert.equal(summary.totalEntitiesExtracted, 1);

      const entity = dbManager.entities.getEntityWithFacets('V-888');
      assert.ok(entity);
      assert.equal(entity.facets.definition.length, 0);
      assert.equal(entity.facets.supplement.length, 0);
      assert.equal(entity.facets.conflict.length, 3, 'All 3 files must be categorized into conflict facet');
    });

    it('ADV-M1-07: should respect explicit Frontmatter facet_role override over filename heuristics', async () => {
      const planetDir = path.join(vaultDir, '04_星球档案', 'V-555 绿洲星');
      fs.mkdirSync(planetDir, { recursive: true });

      // Filename looks like supplement, but frontmatter explicitly forces definition
      fs.writeFileSync(
        path.join(planetDir, '99_special_core.md'),
        '---\nfacet_role: definition\nname: 绿洲核心\ncode: V-555\n---\n# 绿洲星实际核心档案'
      );
      // Filename looks like overview, but frontmatter explicitly marks conflict
      fs.writeFileSync(
        path.join(planetDir, '00_星球总览.md'),
        '---\nfacet_role: conflict\n---\n# 伪造的总览'
      );

      await indexer.sync();

      const entity = dbManager.entities.getEntityWithFacets('V-555');
      assert.ok(entity);
      assert.equal(entity.facets.definition.length, 1);
      assert.equal(entity.facets.definition[0].file_name, '99_special_core.md');
      assert.equal(entity.facets.conflict.length, 1);
      assert.equal(entity.facets.conflict[0].file_name, '00_星球总览.md');
    });
  });

  // ==========================================================================
  // Suite 4: Empirical Defect Remediation & Verification Harnesses
  // ==========================================================================
  describe('Suite 4: Empirical Defect Remediation & Verification Harnesses', () => {
    it('ADV-M1-08-FIX: should successfully migrate legacy database lacking new columns without SQLITE_ERROR', () => {
      const legacyDbPath = path.join(pluginDir, 'data', 'legacy_db_test.db');
      if (fs.existsSync(legacyDbPath)) fs.unlinkSync(legacyDbPath);
      const rawDb = new Database(legacyDbPath);

      // Create a legacy schema without Phase 2.5 columns
      rawDb.exec(`
        CREATE TABLE chapters (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chapter_id TEXT NOT NULL UNIQUE,
          chapter_number REAL NOT NULL,
          title TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft'
        );
        CREATE TABLE timeline_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id TEXT NOT NULL,
          title TEXT NOT NULL,
          timestamp_order REAL NOT NULL
        );
      `);
      rawDb.close();

      // Verified fix: DatabaseManager.initDatabase executes pre-migrations, cleanly upgrading legacy DB
      const upgradedDb = DatabaseManager.initDatabase(legacyDbPath, { pathGuard });
      assert.ok(upgradedDb, 'DatabaseManager.initDatabase must successfully initialize legacy database');
      
      const tlCols = upgradedDb.db.pragma('table_info(timeline_events)');
      const colNames = new Set(tlCols.map(c => c.name));
      assert.ok(colNames.has('time_type'), 'time_type column must be added by migration');
      assert.ok(colNames.has('interval_start'), 'interval_start column must be added by migration');
      upgradedDb.close();
      if (fs.existsSync(legacyDbPath)) fs.unlinkSync(legacyDbPath);
    });

    it('ADV-M1-09-FIX: should preserve canonical entity and surviving facets when definition file is deleted (ON DELETE SET NULL)', async () => {
      const hardDeleteIndexer = new IncrementalIndexer({
        vaultPath: vaultDir,
        dbManager,
        pathGuard,
        deleteMode: 'hard'
      });

      const planetDir = path.join(vaultDir, '04_星球档案', 'V-001 塔兰托');
      fs.mkdirSync(planetDir, { recursive: true });
      fs.writeFileSync(path.join(planetDir, '00_星球总览.md'), '# 塔兰托\n总览描述。');
      fs.writeFileSync(path.join(planetDir, '01_地理.md'), '# 地理\n地理描述。');

      await hardDeleteIndexer.sync();
      assert.equal(dbManager.entities.getByEntityId('V-001').length, 1);

      // Now delete 00_星球总览.md from disk
      fs.unlinkSync(path.join(planetDir, '00_星球总览.md'));
      await hardDeleteIndexer.sync();

      // With ON DELETE SET NULL on entities.source_file_id, deleting definition file preserves canonical entity!
      const remainingEntities = dbManager.entities.getByEntityId('V-001');
      assert.equal(
        remainingEntities.length,
        1,
        'Canonical entity must be preserved by ON DELETE SET NULL when definition file is deleted'
      );
      assert.equal(remainingEntities[0].source_file_id, null);

      // And 01_地理.md is still in source_files and linked in file_entities
      const remainingFiles = dbManager.sourceFiles.getAllRelativePaths();
      assert.equal(remainingFiles.length, 1);
      assert.ok(remainingFiles[0].relative_path.includes('01_地理.md'));
    });

    it('ADV-M1-10-FIX: should classify root-level file in 04_星球档案 as meta_placeholder rather than planet entity', () => {
      const result = FileClassifier.classify({
        relativePath: '04_星球档案/README.md',
        fileName: 'README.md',
        rawContent: '# 星球档案索引\n所有星球的索引说明。'
      });

      // Verified fix: README.md is NOT identified as an entity directory anchor
      assert.equal(result.directoryAnchor, null);
      assert.equal(result.entity, null);
      assert.equal(result.sourceCategory, 'meta_placeholder');
    });
  });

  // ==========================================================================
  // Suite 5: Adversarial File Naming & Special Characters
  // ==========================================================================
  describe('Suite 5: Adversarial Anchor Names & SQL Injection Resilience', () => {
    it('ADV-M1-11: should safely parse and index directory anchors with special characters, quotes, and dashes', async () => {
      const safeDirName = "V-999_Beta-Omega 仙女座'前哨";
      const dir = path.join(vaultDir, '04_星球档案', safeDirName);
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(
        path.join(dir, '00_星球总览.md'),
        "# 仙女座前哨\n边境哨站描述。"
      );
      fs.writeFileSync(
        path.join(dir, '01_防卫设施.md'),
        "# 防卫设施\n重型离子炮台。"
      );

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 2);
      assert.equal(summary.totalEntitiesExtracted, 1);

      const entity = dbManager.entities.getEntityWithFacets('V-999');
      assert.ok(entity, 'Entity V-999 must be extracted safely');
      assert.equal(entity.linkedFiles.length, 2);
    });

    it('ADV-M1-12: should handle directory anchors without standard codes (pure Chinese/alphanumeric names)', async () => {
      const dir = path.join(vaultDir, '04_星球档案', '赤红之星');
      fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(path.join(dir, '00_星球总览.md'), '# 赤红之星\n纯汉字命名总览。');
      fs.writeFileSync(path.join(dir, '01_生态.md'), '# 赤红生态\n生态细节。');

      const summary = await indexer.sync();
      assert.equal(summary.totalFilesScanned, 2);
      assert.equal(summary.totalEntitiesExtracted, 1);

      const entity = dbManager.entities.getEntityWithFacets('赤红之星');
      assert.ok(entity, 'Entity 赤红之星 must be found');
      assert.equal(entity.canonical_name, '赤红之星');
      assert.equal(entity.linkedFiles.length, 2);
    });
  });
});
