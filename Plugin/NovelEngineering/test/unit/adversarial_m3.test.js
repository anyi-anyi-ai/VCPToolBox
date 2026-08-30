/**
 * @file adversarial_m3.test.js
 * @description Empirical Challenger 1 Adversarial Stress Test Suite for Milestone M3
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const DirectoryScanner = require('../../src/scanner/DirectoryScanner');
const FrontmatterParser = require('../../src/scanner/FrontmatterParser');
const FileClassifier = require('../../src/scanner/FileClassifier');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('M3 Adversarial Empirical Challenge Suite', () => {
  let tempEnv = null;
  let dbManager = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m3_adv_');
    pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
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
  // Section 1: Dirty & Malformed YAML Stress Testing
  // ==========================================================================
  describe('1. Malformed & Dirty YAML Resilience', () => {
    it('should recover key-values from unclosed quotes in YAML', () => {
      const content = `---
id: PLANET-999
name: "Unclosed quote planet
category: entity
type: planet
status: canonical
---
# Planet Description
This planet survived unclosed quotes.`;

      const parsed = FrontmatterParser.parse(content);
      assert.equal(parsed.hasFrontmatter, true);
      assert.equal(parsed.isCorrupted, true);
      assert.ok(parsed.parseError, 'Should record parsing error');
      assert.equal(parsed.frontmatter.id, 'PLANET-999');
      assert.equal(parsed.frontmatter.category, 'entity');
      assert.equal(parsed.frontmatter.type, 'planet');

      const classified = FileClassifier.classify({
        relativePath: '02_Entities/Planets/PLANET-999.md',
        rawContent: content
      });
      assert.equal(classified.sourceCategory, 'planet_system');
      assert.equal(classified.entity?.entity_id, 'PLANET-999');
    });

    it('should handle Chinese colons in YAML frontmatter', () => {
      const content = `---
id： PLANET-CHINESE-01
name： 沧海星
category： entity
type： planet
status： finalized
review_status： human_confirmed
---
# 沧海星档案
位于第三旋臂的海洋行星。`;

      const parsed = FrontmatterParser.parse(content);
      assert.equal(parsed.hasFrontmatter, true);
      assert.equal(parsed.frontmatter.id, 'PLANET-CHINESE-01');
      assert.equal(parsed.frontmatter.name, '沧海星');
      assert.equal(parsed.frontmatter.category, 'entity');

      const classified = FileClassifier.classify({
        relativePath: '02_Entities/Planets/沧海星.md',
        rawContent: content
      });
      assert.equal(classified.sourceCategory, 'planet_system');
      assert.equal(classified.entity?.entity_id, 'PLANET-CHINESE-01');
      assert.equal(classified.entity?.canonical_name, '沧海星');
      assert.equal(classified.reviewStatus, 'human_confirmed');
    });

    it('should handle tab-indented YAML frontmatter', () => {
      const content = `---\n\tid: TAB-ENTITY-01\n\tname: Tab Star\n\ttype: planet\n---\nBody with tabs`;
      const parsed = FrontmatterParser.parse(content);
      assert.equal(parsed.hasFrontmatter, true);
      assert.equal(parsed.frontmatter.id, 'TAB-ENTITY-01');
      assert.equal(parsed.frontmatter.name, 'Tab Star');
    });

    it('should handle unclosed frontmatter block (starts with --- but no ending ---)', () => {
      const content = `---
id: UNCLOSED-DELIM
name: Missing Ending
type: character
This is text that never closed the frontmatter delimiter.
`;
      const parsed = FrontmatterParser.parse(content);
      assert.equal(parsed.isCorrupted, true);
      assert.equal(parsed.hasFrontmatter, false);
      assert.ok(parsed.parseError.includes('Unclosed'));
      assert.ok(parsed.body.includes('UNCLOSED-DELIM'));
    });

    it('should handle YAML with colons inside values (e.g. URLs and timestamps)', () => {
      const content = `---
id: URL-ENTITY-01
name: Web Resource
source_url: https://example.com/api/v1/resource:1234
timestamp: 2026-08-28T12:00:00Z
---
Body text`;
      const parsed = FrontmatterParser.parse(content);
      assert.equal(parsed.frontmatter.id, 'URL-ENTITY-01');
      assert.equal(parsed.frontmatter.source_url, 'https://example.com/api/v1/resource:1234');
    });

    it('should handle scalar or array YAML gracefully without crashing', () => {
      const arrayContent = `---\n- item1\n- item2\n- item3\n---\nBody text`;
      const parsedArray = FrontmatterParser.parse(arrayContent);
      assert.equal(parsedArray.hasFrontmatter, true);
      assert.deepEqual(parsedArray.frontmatter.items, ['item1', 'item2', 'item3']);

      const scalarContent = `---\n"just a raw string"\n---\nBody text`;
      const parsedScalar = FrontmatterParser.parse(scalarContent);
      assert.equal(parsedScalar.hasFrontmatter, true);
      assert.equal(parsedScalar.frontmatter.value, 'just a raw string');
    });

    it('should parse huge files (>5MB) without memory exhaustion or stack overflow', () => {
      const largeBody = '# Huge Chapter\n' + '这是一段重复生成的超长小说正文内容。\n'.repeat(150000); // ~6.5MB
      const content = `---
id: HUGE-CH-001
chapter_number: 99
title: 终焉之战
category: chapter
---
${largeBody}`;

      const t0 = Date.now();
      const parsed = FrontmatterParser.parse(content);
      const duration = Date.now() - t0;

      assert.equal(parsed.hasFrontmatter, true);
      assert.equal(parsed.frontmatter.id, 'HUGE-CH-001');
      assert.equal(parsed.frontmatter.chapter_number, 99);
      assert.ok(parsed.wordCount > 100000, `Word count should be > 100k, got ${parsed.wordCount}`);
      assert.ok(duration < 2500, `Parsing 6.5MB took ${duration}ms, should be < 2500ms`);

      const classified = FileClassifier.classify({
        relativePath: '03_Chapters/Vol05/第99章_终焉之战.md',
        rawContent: content
      });
      assert.equal(classified.sourceCategory, 'chapter_text');
      assert.equal(classified.chapter?.chapter_number, 99);
    });

    it('should handle UTF-8 BOM, emoji, and Unicode supplementary characters', () => {
      const bomContent = '\uFEFF---\nid: UTF8-BOM-01\nname: 🌟超新星🌟\nalias: 𠮷野星\ncategory: entity\ntype: planet\n---\n# 🌟超新星档案\n[[𠮷野星|AliasLink]] #宇宙/🌟奇观';
      const parsed = FrontmatterParser.parse(bomContent);
      assert.equal(parsed.hasFrontmatter, true);
      assert.equal(parsed.frontmatter.id, 'UTF8-BOM-01');
      assert.equal(parsed.frontmatter.name, '🌟超新星🌟');
      assert.equal(parsed.wikilinks.length, 1);
      assert.equal(parsed.wikilinks[0].target, '𠮷野星');
      assert.equal(parsed.wikilinks[0].alias, 'AliasLink');
      assert.ok(parsed.tags.includes('宇宙/🌟奇观'));
    });
  });

  // ==========================================================================
  // Section 2: Extreme Traversal & Symlink Protection
  // ==========================================================================
  describe('2. Extreme Directory Traversal & Symlink Protection', () => {
    it('should traverse deep directory hierarchy up to maxDepth and prune beyond maxDepth', async () => {
      const vaultDir = tempEnv.createSubdir('deep_vault');

      // Create 55 nested folders
      let currentDir = vaultDir;
      for (let i = 1; i <= 55; i++) {
        currentDir = path.join(currentDir, `level_${i}`);
        fs.mkdirSync(currentDir);
        fs.writeFileSync(path.join(currentDir, `note_${i}.md`), `# Level ${i}`, 'utf8');
      }

      // Scanner with maxDepth = 20
      const scanner = new DirectoryScanner({ maxDepth: 20 });
      const files = await scanner.scanAll(vaultDir);

      assert.equal(files.length, 20);
      assert.ok(files.every(f => f.relativePath.split('/').length <= 21));
    });

    it('should ignore all specified system and hidden folders/files', async () => {
      const vaultDir = tempEnv.createSubdir('ignore_vault');

      const gitDir = path.join(vaultDir, '.git');
      const obsDir = path.join(vaultDir, '.obsidian');
      const trashDir = path.join(vaultDir, '.trash');
      const nodeDir = path.join(vaultDir, 'node_modules');
      const dataDir = path.join(vaultDir, 'data');
      const validDir = path.join(vaultDir, '01_Worldview');

      for (const d of [gitDir, obsDir, trashDir, nodeDir, dataDir]) {
        fs.mkdirSync(d, { recursive: true });
        fs.writeFileSync(path.join(d, 'file.md'), '# Content', 'utf8');
      }
      fs.mkdirSync(validDir, { recursive: true });

      fs.writeFileSync(path.join(validDir, 'desktop.ini'), '[Content]', 'utf8');
      fs.writeFileSync(path.join(validDir, 'valid_note.md'), '# Valid Note', 'utf8');

      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(vaultDir);

      assert.equal(files.length, 1);
      assert.equal(files[0].fileName, 'valid_note.md');
      assert.equal(files[0].relativePath, '01_Worldview/valid_note.md');
    });

    it('should detect and break circular symlink / junction loops without infinite loop', async () => {
      const vaultDir = tempEnv.createSubdir('symlink_vault');
      const dirA = path.join(vaultDir, 'FolderA');
      const dirB = path.join(vaultDir, 'FolderB');
      fs.mkdirSync(dirA, { recursive: true });
      fs.mkdirSync(dirB, { recursive: true });

      fs.writeFileSync(path.join(dirA, 'noteA.md'), '# Note A', 'utf8');
      fs.writeFileSync(path.join(dirB, 'noteB.md'), '# Note B', 'utf8');

      let symlinksCreated = false;
      try {
        fs.symlinkSync(dirB, path.join(dirA, 'linkToB'), 'junction');
        fs.symlinkSync(dirA, path.join(dirB, 'linkToA'), 'junction');
        symlinksCreated = true;
      } catch (err) {
        console.warn('Windows junction creation skipped:', err.message);
      }

      if (symlinksCreated) {
        const scanner = new DirectoryScanner();
        const files = await scanner.scanAll(vaultDir);

        const fileNames = files.map(f => f.fileName).sort();
        assert.deepEqual(fileNames, ['noteA.md', 'noteB.md']);
      }
    });

    it('should gracefully skip broken / dead symlinks', async () => {
      const vaultDir = tempEnv.createSubdir('dead_symlink_vault');
      fs.writeFileSync(path.join(vaultDir, 'alive.md'), '# Alive', 'utf8');

      try {
        fs.symlinkSync(path.join(vaultDir, 'non_existent_folder'), path.join(vaultDir, 'dead_link'), 'junction');
      } catch (_) {}

      const scanner = new DirectoryScanner();
      const files = await scanner.scanAll(vaultDir);
      assert.equal(files.length, 1);
      assert.equal(files[0].fileName, 'alive.md');
    });
  });

  // ==========================================================================
  // Section 3: Incremental Indexer 2-Stage Change Detection Stress Testing
  // ==========================================================================
  describe('3. Incremental Indexer 2-Stage Change Detection & Sync', () => {
    let mockVault = null;
    let dbPath = null;

    beforeEach(() => {
      mockVault = tempEnv.createSubdir('indexer_vault');
      dbPath = tempEnv.resolve('novel_index.db');
      dbManager = new DatabaseManager(dbPath, { pathGuard });
    });

    it('should correctly handle initial scan of mixed valid, dirty, tiny, and empty files', async () => {
      const pDir = path.join(mockVault, '02_Entities', 'Planets');
      const chDir = path.join(mockVault, '03_Chapters');
      const stubDir = path.join(mockVault, '06_Stubs');
      fs.mkdirSync(pDir, { recursive: true });
      fs.mkdirSync(chDir, { recursive: true });
      fs.mkdirSync(stubDir, { recursive: true });

      // 1. Valid Planet
      fs.writeFileSync(path.join(pDir, 'PLANET-001.md'), `---
id: PLANET-001
name: 塔兰托
category: entity
type: planet
status: canonical
review_status: human_confirmed
---
# 塔兰托星
母星设定。`, 'utf8');

      // 2. Dirty YAML Planet
      fs.writeFileSync(path.join(pDir, 'PLANET-002.md'), `---
id： PLANET-002
name： 普罗米修斯
category： entity
type： planet
status： finalized
---
# 普罗米修斯
矿业行星。`, 'utf8');

      // 3. 25-byte Stub File (<=30B placeholder)
      fs.writeFileSync(path.join(stubDir, 'stub_25b.md'), '# Placeholder Note 25B', 'utf8');

      // 4. Chapter File
      fs.writeFileSync(path.join(chDir, '第01章_启航.md'), `---
chapter_number: 1
title: 启航
category: chapter
status: finalized
---
# 第一章 启航
远航舰队出发了。`, 'utf8');

      const summary1 = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(summary1.totalFilesScanned, 4);
      assert.equal(summary1.filesAdded, 4);
      assert.equal(summary1.filesUpdated, 0);
      assert.equal(summary1.filesUnchanged, 0);
      assert.equal(summary1.filesDeleted, 0);
      assert.equal(summary1.totalEntitiesExtracted, 2);
      assert.equal(summary1.totalChapters, 1);

      // Verify DB Records
      const files = dbManager.sourceFiles.query();
      assert.equal(files.length, 4);

      const stubRec = files.find(f => f.relative_path.includes('stub_25b.md'));
      assert.equal(stubRec.status, 'placeholder');
      assert.equal(stubRec.is_placeholder, 1);
      assert.equal(stubRec.placeholder_reason, 'FILE_SIZE_LE_30B');

      const p2Rec = files.find(f => f.relative_path.includes('PLANET-002.md'));
      assert.equal(p2Rec.source_category, 'planet_system');

      const entities = dbManager.entities.query();
      assert.equal(entities.length, 2);
    });

    it('Stage 1 Fast Check: should skip re-reading all files on immediate re-scan', async () => {
      const pDir = path.join(mockVault, '02_Entities');
      fs.mkdirSync(pDir, { recursive: true });
      fs.writeFileSync(path.join(pDir, 'char1.md'), '---\nid: CHAR-01\nname: Alice\ntype: character\n---\nBio', 'utf8');
      fs.writeFileSync(path.join(pDir, 'char2.md'), '---\nid: CHAR-02\nname: Bob\ntype: character\n---\nBio', 'utf8');

      await IncrementalIndexer.sync(mockVault, dbManager);

      // Immediate 2nd scan
      const summary2 = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(summary2.totalFilesScanned, 2);
      assert.equal(summary2.filesAdded, 0);
      assert.equal(summary2.filesUpdated, 0);
      assert.equal(summary2.filesUnchanged, 2);
      assert.equal(summary2.filesDeleted, 0);
    });

    it('Stage 2 Hash Check: should detect touched mtime without updating content or entities', async () => {
      const pDir = path.join(mockVault, '02_Entities');
      fs.mkdirSync(pDir, { recursive: true });
      const charPath = path.join(pDir, 'char1.md');
      fs.writeFileSync(charPath, '---\nid: CHAR-01\nname: Alice\ntype: character\n---\nBio', 'utf8');

      await IncrementalIndexer.sync(mockVault, dbManager);

      const now = new Date();
      const future = new Date(now.getTime() + 10000);
      fs.utimesSync(charPath, future, future);

      const summary = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(summary.totalFilesScanned, 1);
      assert.equal(summary.filesAdded, 0);
      assert.equal(summary.filesUpdated, 0);
      assert.equal(summary.filesUnchanged, 1);

      const rec = dbManager.sourceFiles.getByRelativePath('02_Entities/char1.md');
      assert.equal(rec.mtime_ms, Math.round(future.getTime()));
    });

    it('Stage 2 Mismatch: should re-parse and update entity when file content is modified', async () => {
      const pDir = path.join(mockVault, '02_Entities');
      fs.mkdirSync(pDir, { recursive: true });
      const charPath = path.join(pDir, 'char1.md');
      fs.writeFileSync(charPath, '---\nid: CHAR-01\nname: Alice\ntype: character\n---\nBio V1', 'utf8');

      await IncrementalIndexer.sync(mockVault, dbManager);

      const future = new Date(Date.now() + 2000);
      fs.writeFileSync(charPath, '---\nid: CHAR-01\nname: Alicia\ntype: character\n---\nBio V2 Updated', 'utf8');
      fs.utimesSync(charPath, future, future);

      const summary = await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(summary.totalFilesScanned, 1);
      assert.equal(summary.filesAdded, 0);
      assert.equal(summary.filesUpdated, 1);
      assert.equal(summary.filesUnchanged, 0);

      const entities = dbManager.entities.query();
      assert.equal(entities.length, 1);
      assert.equal(entities[0].canonical_name, 'Alicia');
      assert.ok(entities[0].description.includes('Bio V2 Updated'));
    });

    it('should reconcile file deletions in both soft and hard delete modes', async () => {
      const pDir = path.join(mockVault, '02_Entities');
      fs.mkdirSync(pDir, { recursive: true });
      const f1 = path.join(pDir, 'f1.md');
      const f2 = path.join(pDir, 'f2.md');
      fs.writeFileSync(f1, '# F1', 'utf8');
      fs.writeFileSync(f2, '# F2', 'utf8');

      // 1. Initial Sync
      await IncrementalIndexer.sync(mockVault, dbManager);
      assert.equal(dbManager.sourceFiles.count(), 2);

      // 2. Delete f2 from disk
      fs.unlinkSync(f2);

      // 3. Soft delete sync (default)
      const summarySoft = await IncrementalIndexer.sync(mockVault, dbManager, { deleteMode: 'soft' });
      assert.equal(summarySoft.filesDeleted, 1);
      assert.equal(summarySoft.filesUnchanged, 1);

      const recF2 = dbManager.sourceFiles.getByRelativePath('02_Entities/f2.md');
      assert.ok(recF2, 'Soft delete preserves record');
      assert.equal(recF2.status, 'deleted');

      // 4. Hard delete sync
      const indexerHard = new IncrementalIndexer({ vaultPath: mockVault, dbManager, pathGuard, deleteMode: 'hard' });
      const summaryHard = await indexerHard.sync();
      assert.equal(summaryHard.filesDeleted, 1);
      const recF2Hard = dbManager.sourceFiles.getByRelativePath('02_Entities/f2.md');
      assert.equal(recF2Hard, null, 'Hard delete must remove row from DB');
    });

    it('should maintain atomic integrity across scan_manifests on multiple runs', async () => {
      const pDir = path.join(mockVault, '01_Worldview');
      fs.mkdirSync(pDir, { recursive: true });
      fs.writeFileSync(path.join(pDir, 'cosmology.md'), '# 宇宙学\n世界设定。', 'utf8');

      await IncrementalIndexer.sync(mockVault, dbManager);
      await IncrementalIndexer.sync(mockVault, dbManager);

      const manifests = dbManager.anomalies.queryManifests(10);
      assert.equal(manifests.length, 2);
      assert.equal(manifests[0].total_files_scanned, 1);
      assert.equal(manifests[1].total_files_scanned, 1);
      assert.equal(manifests[0].files_unchanged, 1);
    });
  });

  // ==========================================================================
  // Section 4: 5-Tier Classifier Edge Cases & Domain Model Extraction
  // ==========================================================================
  describe('4. 5-Tier Classifier & Semantic Model Extraction Edge Cases', () => {
    it('should resolve Tier 4 frontmatter priority over Tier 1 directory heuristics', () => {
      const classified = FileClassifier.classify({
        relativePath: '03_Chapters/Vol01/world_lore_note.md',
        rawContent: `---
id: LORE-001
category: worldview_setting
type: cosmology
status: canonical
review_status: human_confirmed
---
# 宇宙常数设定
物理法则说明。`
      });

      assert.equal(classified.sourceCategory, 'worldview_setting');
      assert.equal(classified.status, 'finalized');
      assert.equal(classified.reviewStatus, 'human_confirmed');
    });

    it('should prioritize Tier 3 placeholder status over Tier 4 canonical frontmatter for <=30B stubs', () => {
      const rawStub = '---\nstatus: canonical\n---';
      const classified = FileClassifier.classify({
        relativePath: '02_Entities/Planets/PLANET-STUB.md',
        fileSize: Buffer.byteLength(rawStub, 'utf8'),
        rawContent: rawStub
      });

      assert.equal(classified.isPlaceholder, true);
      assert.equal(classified.status, 'placeholder');
      assert.equal(classified.placeholderReason, 'FILE_SIZE_LE_30B');
    });

    it('should extract complex aliases: nicknames, legacy IDs, and former names', () => {
      const content = `---
id: PLANET-001
name: 塔兰托
aliases:
  - 塔星
  - 帝国之门
legacy_id:
  - OLD-P-001
  - TALANTO-V1
former_name: 塔兰托原型星
category: entity
type: planet
---
# 塔兰托
母星。`;

      const classified = FileClassifier.classify({
        relativePath: '02_Entities/Planets/PLANET-001.md',
        rawContent: content
      });

      assert.equal(classified.entity.entity_id, 'PLANET-001');
      assert.equal(classified.aliases.length, 5);

      const types = classified.aliases.map(a => a.alias_type);
      assert.ok(types.includes('nickname'));
      assert.ok(types.includes('legacy_id'));
      assert.ok(types.includes('former_name'));
    });

    it('should extract timeline events with negative / BCE years and prerequisites', () => {
      const content = `---
id: EV-BCE-01
title: 第一次星际接触
era_epoch: BCE
timeline_year: -2500
timeline_month: 6
timeline_day: 15
timestamp_order: -25000615
category: timeline_record
prerequisites:
  - EV-BCE-00
consequences:
  - EV-CE-01
---
# 第一次星际接触
人类首次接收到地外无线电信号。`;

      const classified = FileClassifier.classify({
        relativePath: '04_Timeline/EV-BCE-01.md',
        rawContent: content
      });

      assert.equal(classified.sourceCategory, 'timeline_record');
      assert.equal(classified.timelineEvent.event_id, 'EV-BCE-01');
      assert.equal(classified.timelineEvent.era_epoch, 'BCE');
      assert.equal(classified.timelineEvent.timeline_year, -2500);
      assert.equal(classified.timelineEvent.timestamp_order, -25000615);
      assert.deepEqual(classified.timelineEvent.causality_prerequisite_ids_json, ['EV-BCE-00']);
    });

    it('should extract novel chapter with decimal numbering (e.g. 第10.5章)', () => {
      const content = `---
title: 番外：星港之夜
category: chapter_text
---
# 第10.5章 番外：星港之夜
正文内容。`;

      const classified = FileClassifier.classify({
        relativePath: '03_Chapters/Vol02/第10.5章_星港之夜.md',
        rawContent: content
      });

      assert.equal(classified.sourceCategory, 'chapter_text');
      assert.equal(classified.chapter.chapter_number, 10.5);
      assert.equal(classified.chapter.volume_number, 2);
    });

    it('should extract foreshadowing clues with tags and importance level', () => {
      const content = `---
id: FS-CORE-001
title: 损坏的折跃核心
importance: core_climax
status: open
setup_snippet: 维修日志中缺少了第3号核心的校验记录
---
# 伏笔：损坏的折跃核心
[[塔兰托]] 港口遗留的损坏核心。 #伏笔/核心 #暗线`;

      const classified = FileClassifier.classify({
        relativePath: '05_Foreshadowing/FS-CORE-001.md',
        rawContent: content
      });

      assert.equal(classified.sourceCategory, 'foreshadowing_entry');
      assert.equal(classified.foreshadowing.foreshadow_id, 'FS-CORE-001');
      assert.equal(classified.foreshadowing.importance_level, 'core_climax');
      assert.equal(classified.foreshadowing.status, 'open');
      assert.ok(classified.tags.includes('伏笔/核心'));
    });
  });
});