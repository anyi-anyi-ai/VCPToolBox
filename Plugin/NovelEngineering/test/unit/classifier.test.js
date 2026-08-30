/**
 * @file classifier.test.js
 * @description Comprehensive unit test suite for Scanner, Parser, Classifier & Incremental Indexer (M3)
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const DirectoryScanner = require('../../src/scanner/DirectoryScanner');
const FrontmatterParser = require('../../src/scanner/FrontmatterParser');
const FileClassifier = require('../../src/scanner/FileClassifier');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('VCPNovelManager Scanner, Classifier & Incremental Hasher Suite (M3)', () => {
  let tempEnv = null;
  let vaultDir = null;
  let dbManager = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m3_test_');
    vaultDir = tempEnv.createSubdir('mock_vault');
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
  // Suite 1: DirectoryScanner Unit Tests
  // ==========================================================================
  describe('Suite 1: DirectoryScanner Traversal, Filter & Guard Rules', () => {
    it('should recursively traverse a directory and discover markdown and canvas files', async () => {
      // Create directory hierarchy
      const dir1 = path.join(vaultDir, '01_WorldView', 'Geography');
      const dir2 = path.join(vaultDir, '02_Entities', 'Planets');
      fs.mkdirSync(dir1, { recursive: true });
      fs.mkdirSync(dir2, { recursive: true });

      fs.writeFileSync(path.join(dir1, 'Routes.md'), '# Star Routes');
      fs.writeFileSync(path.join(dir2, 'Taranto.md'), '# Planet Taranto');
      fs.writeFileSync(path.join(vaultDir, 'Index.canvas'), '{"nodes":[]}');

      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(vaultDir);

      assert.equal(files.length, 3);
      const relPaths = files.map((f) => f.relativePath).sort();
      assert.deepEqual(relPaths, [
        '01_WorldView/Geography/Routes.md',
        '02_Entities/Planets/Taranto.md',
        'Index.canvas'
      ]);

      // Check metadata fields
      const taranto = files.find((f) => f.fileName === 'Taranto.md');
      assert.ok(taranto);
      assert.equal(taranto.extension, '.md');
      assert.ok(taranto.size > 0);
      assert.ok(taranto.mtimeMs > 0);
    });

    it('should filter out default ignore patterns (.git, .obsidian, node_modules, .trash, Thumbs.db)', async () => {
      const gitDir = path.join(vaultDir, '.git');
      const obsDir = path.join(vaultDir, '.obsidian');
      const nodeDir = path.join(vaultDir, 'node_modules', 'some-pkg');
      const dataDir = path.join(vaultDir, 'data');
      fs.mkdirSync(gitDir, { recursive: true });
      fs.mkdirSync(obsDir, { recursive: true });
      fs.mkdirSync(nodeDir, { recursive: true });
      fs.mkdirSync(dataDir, { recursive: true });

      fs.writeFileSync(path.join(gitDir, 'config.md'), 'git config');
      fs.writeFileSync(path.join(obsDir, 'workspace.json'), '{}');
      fs.writeFileSync(path.join(nodeDir, 'readme.md'), 'module readme');
      fs.writeFileSync(path.join(dataDir, 'cache.md'), 'data cache');
      fs.writeFileSync(path.join(vaultDir, 'desktop.ini'), 'sys file');
      fs.writeFileSync(path.join(vaultDir, 'Thumbs.db'), 'thumbs');
      fs.writeFileSync(path.join(vaultDir, 'ValidDoc.md'), '# Valid Document');

      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(vaultDir);

      assert.equal(files.length, 1);
      assert.equal(files[0].relativePath, 'ValidDoc.md');
    });

    it('should filter files with unapproved extensions', async () => {
      fs.writeFileSync(path.join(vaultDir, 'valid.md'), '# Markdown');
      fs.writeFileSync(path.join(vaultDir, 'valid.txt'), 'Plain text');
      fs.writeFileSync(path.join(vaultDir, 'ignore.pdf'), 'PDF');
      fs.writeFileSync(path.join(vaultDir, 'ignore.exe'), 'EXE');
      fs.writeFileSync(path.join(vaultDir, 'ignore.json'), '{}');

      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(vaultDir);

      const fileNames = files.map((f) => f.fileName).sort();
      assert.deepEqual(fileNames, ['valid.md', 'valid.txt']);
    });

    it('should prevent cyclical symlink loops via inode tracking', async () => {
      const subDir = path.join(vaultDir, 'SubFolder');
      fs.mkdirSync(subDir, { recursive: true });
      fs.writeFileSync(path.join(subDir, 'doc.md'), '# Sub Doc');

      // Attempt to create symlink / junction pointing back to vaultDir
      const symlinkPath = path.join(subDir, 'loop_link');
      try {
        fs.symlinkSync(vaultDir, symlinkPath, 'junction');
      } catch (err) {
        // If symlink creation fails due to OS privilege on Windows, skip symlink assertion
      }

      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(vaultDir);

      assert.ok(files.length >= 1);
      const doc = files.find((f) => f.fileName === 'doc.md');
      assert.ok(doc);
    });

    it('should throw clear error on non-existent vault path', async () => {
      const nonExistent = path.join(vaultDir, 'does_not_exist_folder');
      const scanner = new DirectoryScanner();
      await assert.rejects(
        async () => {
          await scanner.scanAll(nonExistent);
        },
        /Cannot access vault directory/
      );
    });
  });

  // ==========================================================================
  // Suite 2: FrontmatterParser Unit Tests
  // ==========================================================================
  describe('Suite 2: FrontmatterParser Fault-Tolerance & Extraction', () => {
    it('should cleanly parse standard YAML frontmatter and markdown body', () => {
      const content = `---
id: ENT-P001
name: 塔兰托
code: PLANET-001
category: entity
type: planet
status: canonical
tags: [scifi, colony]
---
# 塔兰托星

这是位于第一象限的殖民星。
`;

      const res = FrontmatterParser.parse(content);
      assert.equal(res.hasFrontmatter, true);
      assert.equal(res.isCorrupted, false);
      assert.equal(res.frontmatter.id, 'ENT-P001');
      assert.equal(res.frontmatter.name, '塔兰托');
      assert.equal(res.frontmatter.code, 'PLANET-001');
      assert.deepEqual(res.frontmatter.tags, ['scifi', 'colony']);
      assert.ok(res.body.includes('# 塔兰托星'));
    });

    it('should strip UTF-8 BOM without affecting frontmatter parsing', () => {
      const content = `\uFEFF---
title: With BOM
status: draft
---
# Content`;

      const res = FrontmatterParser.parse(content);
      assert.equal(res.hasFrontmatter, true);
      assert.equal(res.frontmatter.title, 'With BOM');
      assert.equal(res.isCorrupted, false);
    });

    it('should recover key-value pairs from dirty Obsidian YAML with syntax errors', () => {
      const dirtyYamlContent = `---
title: 暗能量潮汐
category: world_setting
tags: [energy, tide, invalid_syntax: "missing_quote
code: CODE-999
author：总编剧
status: draft
---
# 暗能量潮汐
宇宙大尺度的能量波动。
`;

      const res = FrontmatterParser.parse(dirtyYamlContent);
      assert.equal(res.hasFrontmatter, true);
      assert.equal(res.isCorrupted, true);
      assert.ok(res.parseError);

      // Verify regex recovery rescued properties
      assert.equal(res.frontmatter.title, '暗能量潮汐');
      assert.equal(res.frontmatter.category, 'world_setting');
      assert.equal(res.frontmatter.code, 'CODE-999');
      assert.equal(res.frontmatter.author, '总编剧');
      assert.equal(res.frontmatter.status, 'draft');
    });

    it('should flag unclosed frontmatter blocks as corrupted', () => {
      const unclosed = `---
title: Unclosed Frontmatter
category: planet
# Missing closing delimiter
`;

      const res = FrontmatterParser.parse(unclosed);
      assert.equal(res.isCorrupted, true);
      assert.equal(res.parseError, 'Unclosed YAML frontmatter delimiter');
    });

    it('should extract wikilinks with line numbers and aliases', () => {
      const body = `
Line 1 text
Line 2 mentions [[虚空方舟号]] and [[阿尔法星|母星基地]].
Line 3 has [[不存在的幻影星系]].
`;

      const links = FrontmatterParser.extractWikilinks(body);
      assert.equal(links.length, 3);

      assert.equal(links[0].target, '虚空方舟号');
      assert.equal(links[0].alias, null);
      assert.equal(links[0].line, 3);

      assert.equal(links[1].target, '阿尔法星');
      assert.equal(links[1].alias, '母星基地');
      assert.equal(links[1].line, 3);

      assert.equal(links[2].target, '不存在的幻影星系');
      assert.equal(links[2].alias, null);
      assert.equal(links[2].line, 4);
    });

    it('should extract tags from frontmatter and markdown body', () => {
      const content = `---
tags: [lore, cosmology]
---
# Heading
This is an #exploration note regarding #void_rift anomaly.
`;
      const res = FrontmatterParser.parse(content);
      assert.ok(res.tags.includes('lore'));
      assert.ok(res.tags.includes('cosmology'));
      assert.ok(res.tags.includes('exploration'));
      assert.ok(res.tags.includes('void_rift'));
    });

    it('should calculate accurate bilingual word counts and headings', () => {
      const content = `
# 宇宙背景介绍
Deep space exploration commenced in year 2042.
## 第一阶段
人类文明向外延伸。
`;
      const res = FrontmatterParser.parse(content);
      assert.equal(res.headings.length, 2);
      assert.equal(res.headings[0].level, 1);
      assert.equal(res.headings[0].text, '宇宙背景介绍');
      assert.equal(res.headings[1].level, 2);
      assert.equal(res.headings[1].text, '第一阶段');

      assert.ok(res.wordCount >= 18);
    });
  });

  // ==========================================================================
  // Suite 3: FileClassifier 5-Tier Cascade Unit Tests
  // ==========================================================================
  describe('Suite 3: FileClassifier 5-Tier Taxonomy & Feature Extraction', () => {
    it('Tier 1 & Tier 2: should classify worldview, entities, chapters, timeline, and foreshadowing by path & filename', () => {
      const worldClass = FileClassifier.classify({
        relativePath: '01_WorldView/Cosmology/DarkEnergy.md',
        rawContent: '# Dark Energy'
      });
      assert.equal(worldClass.sourceCategory, 'worldview_setting');

      const planetClass = FileClassifier.classify({
        relativePath: '02_Entities/Planets/阿尔法星.md',
        rawContent: '# 阿尔法星'
      });
      assert.equal(planetClass.sourceCategory, 'planet_system');

      const charClass = FileClassifier.classify({
        relativePath: '02_Entities/Characters/艾莉亚_人物卡.md',
        rawContent: '# 艾莉亚'
      });
      assert.equal(charClass.sourceCategory, 'character_bio');

      const chapterClass = FileClassifier.classify({
        relativePath: '03_Chapters/Vol01/第01章_启程.md',
        rawContent: '# 第01章 启程\n故事开始。'
      });
      assert.equal(chapterClass.sourceCategory, 'chapter_text');
      assert.ok(chapterClass.chapter);
      assert.equal(chapterClass.chapter.chapter_number, 1);
      assert.equal(chapterClass.chapter.volume_number, 1);

      const timelineClass = FileClassifier.classify({
        relativePath: '04_Timeline/2042年_大灾变.md',
        rawContent: '# 2042年 大灾变'
      });
      assert.equal(timelineClass.sourceCategory, 'timeline_record');

      const fsClass = FileClassifier.classify({
        relativePath: '05_Foreshadowing/神秘坠落物_伏笔.md',
        rawContent: '# 神秘坠落物'
      });
      assert.equal(fsClass.sourceCategory, 'foreshadowing_entry');
    });

    it('Tier 3: should identify <=30B and <=50B files as placeholders with reason codes', () => {
      // 30B stub file
      const stubContent = '---\ntitle: 无名旅者\n---\n';
      const stubClass = FileClassifier.classify({
        relativePath: '02_Entities/Characters/无名旅者.md',
        fileSize: Buffer.byteLength(stubContent, 'utf8'),
        rawContent: stubContent
      });

      assert.equal(stubClass.status, 'placeholder');
      assert.equal(stubClass.isPlaceholder, true);
      assert.equal(stubClass.placeholderReason, 'FILE_SIZE_LE_30B');

      // 45B stub file
      const stub45 = '# 第10章 待写\n待补充详细情节描述。';
      const stub45Class = FileClassifier.classify({
        relativePath: '03_Chapters/Drafts/第10章.md',
        fileSize: Buffer.byteLength(stub45, 'utf8'),
        rawContent: stub45
      });
      assert.equal(stub45Class.status, 'placeholder');
      assert.equal(stub45Class.isPlaceholder, true);
      assert.equal(stub45Class.placeholderReason, 'FILE_SIZE_LE_50B');
    });

    it('Tier 4: should allow Frontmatter YAML properties to override path and filename defaults', () => {
      const content = `---
id: SPEC-01
name: 特殊遗物
category: entity
type: relic
status: canonical
review_status: manual_verified
verified: true
author: human_canon
---
# 特殊遗物
正典确认设定。`;

      const res = FileClassifier.classify({
        relativePath: '06_References/Misc/draft.md', // Misplaced in references
        fileSize: Buffer.byteLength(content, 'utf8'),
        rawContent: content
      });

      assert.equal(res.sourceCategory, 'character_bio');
      assert.equal(res.status, 'finalized');
      assert.equal(res.reviewStatus, 'human_confirmed');
      assert.ok(res.entity);
      assert.equal(res.entity.entity_id, 'SPEC-01');
      assert.equal(res.entity.canonical_name, '特殊遗物');
      assert.equal(res.entity.entity_type, 'relic');
    });

    it('Tier 5: should extract entity aliases, legacy_id, timeline events, and foreshadowing hooks', () => {
      // Entity with aliases and legacy ID
      const entityContent = `---
id: WND-ORG-2024-001
code: ORG-001
name: 先驱者学会
legacy_id: OLD-ORG-12
aliases: [学会, 先驱者组织]
former_name: 旧日研习社
type: organization
---
# 先驱者学会
科学探索联盟。`;

      const entityRes = FileClassifier.classify({
        relativePath: '02_Entities/Organizations/先驱者学会.md',
        fileSize: Buffer.byteLength(entityContent, 'utf8'),
        rawContent: entityContent
      });

      assert.ok(entityRes.entity);
      assert.equal(entityRes.entity.entity_id, 'WND-ORG-2024-001');
      assert.equal(entityRes.entity.canonical_name, '先驱者学会');

      const aliasNames = entityRes.aliases.map((a) => a.alias_name).sort();
      assert.ok(aliasNames.includes('学会'));
      assert.ok(aliasNames.includes('先驱者组织'));
      assert.ok(aliasNames.includes('OLD-ORG-12'));
      assert.ok(aliasNames.includes('旧日研习社'));

      const legacyAlias = entityRes.aliases.find((a) => a.alias_name === 'OLD-ORG-12');
      assert.equal(legacyAlias.alias_type, 'legacy_id');

      // Timeline event extraction
      const timelineContent = `---
id: EV-2042-01
title: 第一次跃迁测试
era_epoch: 新历
timestamp_order: 2042.0815
year: 2042
month: 8
day: 15
prerequisites: [EV-2041-99]
consequences: [EV-2042-02]
---
# 第一次跃迁测试
人类成功实现了超光速跳跃。`;

      const tlRes = FileClassifier.classify({
        relativePath: '04_Timeline/EV-2042-01.md',
        fileSize: Buffer.byteLength(timelineContent, 'utf8'),
        rawContent: timelineContent
      });

      assert.ok(tlRes.timelineEvent);
      assert.equal(tlRes.timelineEvent.event_id, 'EV-2042-01');
      assert.equal(tlRes.timelineEvent.timestamp_order, 2042.0815);
      assert.deepEqual(tlRes.timelineEvent.causality_prerequisite_ids_json, ['EV-2041-99']);

      // Foreshadowing extraction
      const fsContent = `---
id: FS-001
title: 坠毁飞船的黑匣子
status: open
importance: core_climax
tags: [mystery, alien]
---
主角在荒原中发现了黑匣子，里面记录着未知的求救信号。`;

      const fsRes = FileClassifier.classify({
        relativePath: '05_Foreshadowing/FS-001.md',
        fileSize: Buffer.byteLength(fsContent, 'utf8'),
        rawContent: fsContent
      });

      assert.ok(fsRes.foreshadowing);
      assert.equal(fsRes.foreshadowing.foreshadow_id, 'FS-001');
      assert.equal(fsRes.foreshadowing.status, 'open');
      assert.equal(fsRes.foreshadowing.importance_level, 'core_climax');
    });

    it('Phase 1.5 Hotfix: should generate distinct fallback entity IDs for identical filenames in different subdirectories', () => {
      const fileA = FileClassifier.classify({
        relativePath: '09_Reference/FolderA/00_Summary.md',
        fileName: '00_Summary.md',
        rawContent: '---\ncategory: entity\n---\n# Faction Summary A'
      });
      const fileB = FileClassifier.classify({
        relativePath: '09_Reference/FolderB/00_Summary.md',
        fileName: '00_Summary.md',
        rawContent: '---\ncategory: entity\n---\n# Faction Summary B'
      });

      assert.ok(fileA.entity);
      assert.ok(fileB.entity);
      assert.notEqual(fileA.entity.entity_id, fileB.entity.entity_id);
      assert.ok(fileA.entity.entity_id.startsWith('FolderA_'));
      assert.ok(fileA.entity.entity_id.endsWith('_00_Summary'));
      assert.ok(fileB.entity.entity_id.startsWith('FolderB_'));
      assert.ok(fileB.entity.entity_id.endsWith('_00_Summary'));
    });

    it('Phase 1.5 Hotfix: should format fallback entity ID for root-level files without dot prefix', () => {
      const rootFile = FileClassifier.classify({
        relativePath: 'Overview.md',
        fileName: 'Overview.md',
        frontmatter: { category: 'entity' },
        rawContent: '---\ncategory: entity\n---\n# Overview'
      });

      assert.ok(rootFile.entity);
      assert.ok(!rootFile.entity.entity_id.startsWith('._'));
      assert.ok(rootFile.entity.entity_id.endsWith('_Overview'));
    });
  });

  // ==========================================================================
  // Suite 4: IncrementalIndexer & 2-Stage Change Detection Suite
  // ==========================================================================
  describe('Suite 4: IncrementalIndexer 2-Stage Change Detection & Sync', () => {
    let mockVault = null;

    beforeEach(() => {
      mockVault = tempEnv.createSubdir('index_vault');
      const dbPath = tempEnv.resolve('novel_index.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });
    });

    it('should perform full initial scan, inserting source_files, entities, and manifests', async () => {
      // 1. Setup mock vault files
      const planetDir = path.join(mockVault, '02_Entities', 'Planets');
      const chapterDir = path.join(mockVault, '03_Chapters', 'Vol01');
      fs.mkdirSync(planetDir, { recursive: true });
      fs.mkdirSync(chapterDir, { recursive: true });

      const planetContent = `---
id: PLANET-001
name: 塔兰托
code: PLANET-001
category: entity
type: planet
status: canonical
aliases: [塔兰托星, 边缘明珠]
---
# 塔兰托
第一象限殖民星。`;

      const chapterContent = `---
chapter_number: 1
volume_number: 1
title: 启程
status: published
---
# 第01章 启程
[[塔兰托]] 星港上空警报长鸣。`;

      fs.writeFileSync(path.join(planetDir, '塔兰托_PLANET-001.md'), planetContent);
      fs.writeFileSync(path.join(chapterDir, '第01章_启程.md'), chapterContent);

      // 2. Execute IncrementalIndexer sync
      const result = await IncrementalIndexer.sync(mockVault, dbManager);

      assert.equal(result.totalFilesScanned, 2);
      assert.equal(result.filesAdded, 2);
      assert.equal(result.filesUpdated, 0);
      assert.equal(result.filesUnchanged, 0);
      assert.equal(result.filesDeleted, 0);
      assert.equal(result.totalEntitiesExtracted, 1);
      assert.equal(result.totalChapters, 1);

      // 3. Verify SQLite DB state
      const sourceFiles = dbManager.sourceFiles.query();
      assert.equal(sourceFiles.length, 2);

      const entities = dbManager.entities.query();
      assert.equal(entities.length, 1);
      assert.equal(entities[0].canonical_name, '塔兰托');
      assert.equal(entities[0].entity_id, 'PLANET-001');

      const aliases = dbManager.entities.getAliasesForEntity(entities[0].id);
      assert.equal(aliases.length, 2);

      const chapters = dbManager.chapters.query();
      assert.equal(chapters.length, 1);
      assert.equal(chapters[0].title, '启程');

      const manifest = dbManager.anomalies.getLatestManifest();
      assert.ok(manifest);
      assert.equal(manifest.total_files_scanned, 2);
      assert.equal(manifest.files_added, 2);
    });

    it('Stage 1 Cache Hit: should skip unmodified files on immediate second scan', async () => {
      const dir = path.join(mockVault, '01_WorldView');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'Lore.md'), '# World Lore\nCanonical backstory.');

      // First scan
      const firstResult = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(firstResult.filesAdded, 1);
      assert.equal(firstResult.filesUnchanged, 0);

      // Second immediate scan without modifying file
      const secondResult = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(secondResult.filesAdded, 0);
      assert.equal(secondResult.filesUpdated, 0);
      assert.equal(secondResult.filesUnchanged, 1);
      assert.equal(secondResult.filesDeleted, 0);
    });

    it('Stage 2 Hash Hit: should recognize identical content when only mtime is touched', async () => {
      const dir = path.join(mockVault, '01_WorldView');
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, 'Lore.md');
      fs.writeFileSync(filePath, '# World Lore\nCanonical backstory.');

      await IncrementalIndexer.sync(mockVault, dbManager);

      // Touch mtime into future without changing content
      const futureTime = new Date(Date.now() + 10000);
      fs.utimesSync(filePath, futureTime, futureTime);

      const res = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(res.filesAdded, 0);
      assert.equal(res.filesUpdated, 0);
      assert.equal(res.filesUnchanged, 1); // Content hash matched!
    });

    it('Stage 2 Mismatch: should update record and extracted entity when file content is modified', async () => {
      const dir = path.join(mockVault, '02_Entities', 'Planets');
      fs.mkdirSync(dir, { recursive: true });
      const filePath = path.join(dir, '阿尔法_PLANET-007.md');

      fs.writeFileSync(
        filePath,
        '---\nid: PLANET-007\nname: 阿尔法星\nstatus: draft\n---\n# 阿尔法星\n初始草稿。'
      );

      await IncrementalIndexer.sync(mockVault, dbManager);

      let entity = dbManager.entities.getSingleByEntityId('PLANET-007');
      assert.equal(entity.canonical_name, '阿尔法星');
      assert.equal(entity.status, 'draft');

      // Update file content with new name and finalized status
      fs.writeFileSync(
        filePath,
        '---\nid: PLANET-007\nname: 阿尔法先锋基地\nstatus: canonical\n---\n# 阿尔法先锋基地\n更新后的正典设定。'
      );

      const res = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(res.filesAdded, 0);
      assert.equal(res.filesUpdated, 1);
      assert.equal(res.filesUnchanged, 0);

      // Check DB updated
      entity = dbManager.entities.getSingleByEntityId('PLANET-007');
      assert.equal(entity.canonical_name, '阿尔法先锋基地');
      assert.equal(entity.status, 'active');
    });

    it('should reconcile deleted files when removed from disk', async () => {
      const dir = path.join(mockVault, '01_WorldView');
      fs.mkdirSync(dir, { recursive: true });
      const file1 = path.join(dir, 'Keep.md');
      const file2 = path.join(dir, 'RemoveMe.md');

      fs.writeFileSync(file1, '# Keep');
      fs.writeFileSync(file2, '# Remove Me');

      await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(dbManager.sourceFiles.count(), 2);

      // Remove file2 from disk
      fs.unlinkSync(file2);

      const res = await IncrementalIndexer.sync(mockVault, dbManager, { deleteMode: 'soft' });
      assert.equal(res.filesDeleted, 1);
      assert.equal(res.filesUnchanged, 1);

      // Verify soft deletion in DB
      const kept = dbManager.sourceFiles.getByRelativePath('01_WorldView/Keep.md');
      const removed = dbManager.sourceFiles.getByRelativePath('01_WorldView/RemoveMe.md');
      assert.ok(kept);
      assert.notEqual(kept.status, 'deleted');
      assert.ok(removed);
      assert.equal(removed.status, 'deleted');
    });
  });
});
