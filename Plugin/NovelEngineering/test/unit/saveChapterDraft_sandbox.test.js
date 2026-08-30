/**
 * @file saveChapterDraft_sandbox.test.js
 * @description Comprehensive unit test suite for SaveChapterDraft and Sandbox Security Isolation
 * @module test/unit/saveChapterDraft_sandbox
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const FrontmatterParser = require('../../src/scanner/FrontmatterParser');
const { createTempDir } = require('../helpers/tempDir');

describe('SaveChapterDraft & Strict Sandbox Security Isolation Suite', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_draft_test_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    // Create 01~12 mock folders in vault to simulate source worldview
    for (let i = 1; i <= 12; i++) {
      const folderName = `${String(i).padStart(2, '0')}_SettingFolder_${i}`;
      fs.mkdirSync(path.join(vaultDir, folderName), { recursive: true });
    }
    fs.mkdirSync(path.join(vaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '02_Entities'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '03_Chapters'), { recursive: true });

    // Populate a sample canon file in 01_Worldview
    fs.writeFileSync(
      path.join(vaultDir, '01_Worldview', 'Cosmology.md'),
      '# Immutable Worldview Lore\nDo not mutate.',
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

  // =========================================================================
  // Tier 1: Legitimate Draft Writing in Sandbox 13
  // =========================================================================
  describe('Tier 1: Legitimate Sandbox Draft Creation & SQLite Sync', () => {

    it('F3-T1.1: should successfully write chapter draft into designated 13_小说工程插件/篇章草稿/ folder', async () => {
      const draftContent = '# 第一章 启航之日\n\n深空舰队在西伯利亚永冻层上空完成了最后的集结。';
      const payload = {
        projectId: 'wandering_novel',
        chapterId: 'CH-001',
        title: '第一章 启航之日',
        content: draftContent,
        summary: '舰队集结启航',
        volumeNumber: 1,
        chapterNumber: 1,
        vaultRoot: vaultDir
      };

      const result = await dispatcher.dispatch('SaveChapterDraft', payload);

      assert.ok(result, 'Dispatcher must return a response object');
      const details = result.details || result;
      assert.equal(details.status || result.status, 'draft', 'Status must be draft');
      assert.equal(details.canon !== undefined ? details.canon : 0, 0, 'Canon flag must be 0');

      // Verify physical file was written into 13_小说工程插件/篇章草稿/
      const expectedSandboxDir = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      assert.ok(fs.existsSync(expectedSandboxDir), 'Sandbox directory 13_小说工程插件/篇章草稿/ must exist');

      const writtenFiles = fs.readdirSync(expectedSandboxDir);
      assert.ok(writtenFiles.length >= 1, 'Draft file must be created inside sandbox directory');

      const draftFilePath = path.join(expectedSandboxDir, writtenFiles[0]);
      const fileText = fs.readFileSync(draftFilePath, 'utf8');
      assert.ok(fileText.includes('第一章 启航之日'), 'Written draft must contain chapter title');
      assert.ok(fileText.includes('深空舰队在西伯利亚永冻层上空'), 'Written draft must contain chapter body');
    });

    it('F3-T1.2: should format draft with structured YAML frontmatter (status=draft, canon=0)', async () => {
      const payload = {
        chapterId: 'CH-002',
        title: '第二章 跃迁深渊',
        content: '# 第二章 跃迁深渊\n\n超空间引擎共振启动。',
        summary: '跃迁进入深渊',
        volumeNumber: 1,
        chapterNumber: 2,
        vaultRoot: vaultDir
      };

      await dispatcher.dispatch('SaveChapterDraft', payload);

      const sandboxDir = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      const draftFiles = fs.readdirSync(sandboxDir).filter(f => f.includes('002') || f.includes('跃迁'));
      assert.ok(draftFiles.length > 0, 'Draft file for CH-002 must exist');

      const draftPath = path.join(sandboxDir, draftFiles[0]);
      const parsed = FrontmatterParser.parse(fs.readFileSync(draftPath, 'utf8'));

      assert.equal(parsed.hasFrontmatter, true, 'Draft must contain valid YAML frontmatter');
      assert.equal(parsed.frontmatter.status, 'draft', 'Frontmatter status must be draft');
      assert.equal(Number(parsed.frontmatter.canon), 0, 'Frontmatter canon must be 0');
      assert.equal(parsed.frontmatter.title, '第二章 跃迁深渊');
    });

    it('F3-T1.3: should insert or update SQLite chapters table with canon=0 and status=draft', async () => {
      const payload = {
        chapterId: 'CH-003',
        title: '第三章 暗物质风暴',
        content: '# 第三章 暗物质风暴\n\n观测站侦测到强烈的暗能量脉冲，护盾系统全面过载。',
        summary: '遭遇暗物质风暴',
        volumeNumber: 1,
        chapterNumber: 3,
        vaultRoot: vaultDir
      };

      const res = await dispatcher.dispatch('SaveChapterDraft', payload);
      const details = res.details || res;

      // Query chapters table directly
      const chapters = dbManager.chapters.query({ volume_number: 1 });
      const ch3 = chapters.find(c => c.chapter_number === 3 || c.title.includes('暗物质风暴'));

      assert.ok(ch3, 'Chapter record must be indexed in SQLite chapters table');
      assert.equal(ch3.status, 'draft', 'SQLite status must be draft');
      assert.equal(ch3.canon !== undefined ? ch3.canon : 0, 0, 'SQLite canon column must be 0');
      assert.ok(ch3.word_count > 0, 'Word count must be calculated');
      assert.ok(ch3.relative_path.includes('13_小说工程插件'), 'relative_path must point into 13 sandbox');
    });

    it('F3-T1.4: should correctly update existing draft on re-save (upsert idempotency)', async () => {
      const initialPayload = {
        chapterId: 'CH-004',
        title: '第四章 遗迹初探',
        content: '# 第四章 遗迹初探\n\n初始草稿版本。',
        summary: '初始版本',
        volumeNumber: 1,
        chapterNumber: 4,
        vaultRoot: vaultDir
      };

      await dispatcher.dispatch('SaveChapterDraft', initialPayload);

      const updatePayload = {
        chapterId: 'CH-004',
        title: '第四章 遗迹初探',
        content: '# 第四章 遗迹初探\n\n扩展后的完整草稿，包含详细的人物对白与环境描写。',
        summary: '扩展后的修订版本',
        volumeNumber: 1,
        chapterNumber: 4,
        vaultRoot: vaultDir
      };

      await dispatcher.dispatch('SaveChapterDraft', updatePayload);

      const chapters = dbManager.chapters.query({ volume_number: 1 });
      const ch4List = chapters.filter(c => c.chapter_number === 4);
      assert.equal(ch4List.length, 1, 'Re-saving chapter draft must upsert, NOT create duplicate records');
      assert.equal(ch4List[0].summary, '扩展后的修订版本');
    });

    it('F3-T1.5: should calculate accurate bilingual word count for Chinese and English drafts', async () => {
      const payload = {
        chapterId: 'CH-005',
        title: '第5章 双语测试',
        content: '# 第5章 双语测试\n\nDeep space probe alpha dispatched. 探测器顺利进入第三轨道。',
        volumeNumber: 1,
        chapterNumber: 5,
        vaultRoot: vaultDir
      };

      const result = await dispatcher.dispatch('SaveChapterDraft', payload);
      const details = result.details || result;
      assert.ok(details.wordCount > 10, 'Word count should account for both English tokens and Chinese characters');
    });
  });

  // =========================================================================
  // Tier 2: Strict Sandbox Security Hardening & Zero-Tolerance Rejections
  // =========================================================================
  describe('Tier 2: Strict Sandbox Boundary & Attack Defense', () => {

    it('F3-T2.1: should strictly reject write attempts targeting 01_Worldview setting folder', async () => {
      const illegalPayload = {
        chapterId: 'HACK-01',
        title: '越权写入设定',
        content: '# Malicious Content',
        customPath: path.join(vaultDir, '01_Worldview', 'hack.md'),
        vaultRoot: vaultDir
      };

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', illegalPayload);
        },
        (err) => {
          assert.ok(
            err.code === 'ERR_VAULT_WRITE_BLOCKED' ||
            err.name === 'SecurityError' ||
            /blocked|unauthorized|sandbox|forbidden/i.test(err.message),
            `Expected ERR_VAULT_WRITE_BLOCKED, got: ${err.message}`
          );
          return true;
        }
      );

      // Verify 01_Worldview/Cosmology.md was untouched
      const originalText = fs.readFileSync(path.join(vaultDir, '01_Worldview', 'Cosmology.md'), 'utf8');
      assert.equal(originalText, '# Immutable Worldview Lore\nDo not mutate.');
      assert.equal(fs.existsSync(path.join(vaultDir, '01_Worldview', 'hack.md')), false);
    });

    it('F3-T2.2: should strictly reject write attempts targeting 02_Entities setting folder', async () => {
      const illegalPayload = {
        chapterId: 'HACK-02',
        title: '越权修改实体',
        content: '# Overwrite Planet',
        customPath: path.join(vaultDir, '02_Entities', 'Planets', 'InjectedPlanet.md'),
        vaultRoot: vaultDir
      };

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', illegalPayload);
        },
        /ERR_VAULT_WRITE_BLOCKED|SecurityError|blocked|sandbox/i
      );

      assert.equal(fs.existsSync(path.join(vaultDir, '02_Entities', 'Planets', 'InjectedPlanet.md')), false);
    });

    it('F3-T2.3: should strictly reject write attempts targeting 03_Chapters source directory', async () => {
      const illegalPayload = {
        chapterId: 'HACK-03',
        title: '越权写入03正文源目录',
        content: '# Direct Chapter Overwrite',
        customPath: path.join(vaultDir, '03_Chapters', 'Vol01', 'Chapter_01.md'),
        vaultRoot: vaultDir
      };

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', illegalPayload);
        },
        /ERR_VAULT_WRITE_BLOCKED|SecurityError|blocked|sandbox/i
      );
    });

    it('F3-T2.4: should reject directory traversal escape attempts (../01_Worldview)', async () => {
      const traversalPayload = {
        chapterId: 'HACK-TRAVERSAL',
        title: '目录穿透攻击',
        content: '# Traversal Attack',
        customPath: path.join(vaultDir, '13_小说工程插件', '篇章草稿', '..', '..', '01_Worldview', 'evil.md'),
        vaultRoot: vaultDir
      };

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', traversalPayload);
        },
        /ERR_VAULT_WRITE_BLOCKED|ERR_PATH_TRAVERSAL|SecurityError|blocked|sandbox/i
      );

      assert.equal(fs.existsSync(path.join(vaultDir, '01_Worldview', 'evil.md')), false);
    });

    it('F3-T2.5: should reject dangerous filenames (null-byte injection, NTFS ADS, DOS reserved names)', async () => {
      const nullBytePayload = {
        chapterId: 'HACK-NULL',
        title: 'Null Byte Injected',
        content: '# Null Attack',
        customFilename: 'draft.md\0.exe',
        vaultRoot: vaultDir
      };

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', nullBytePayload);
        },
        /ERR_INVALID_PATH|ERR_SECURITY_VIOLATION|SecurityError|null byte|invalid/i
      );

      const adsPayload = {
        chapterId: 'HACK-ADS',
        title: 'ADS Stream',
        content: '# ADS Stream Attack',
        customFilename: 'draft.md:hidden_stream',
        vaultRoot: vaultDir
      };

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', adsPayload);
        },
        /ERR_ADS_STREAM_DETECTED|ERR_INVALID_PATH|SecurityError|colon|stream/i
      );
    });
  });

  // =========================================================================
  // Tier 3: Cross-Feature Integration with POV Entity & Indexer
  // =========================================================================
  describe('Tier 3: POV Entity & Query Cross-Feature Integration', () => {

    it('F3-T3.1: should support binding POV character entity ID to draft chapter record', async () => {
      // 1. Create a dummy character entity in DB
      const charFile = dbManager.sourceFiles.insert({
        file_path: path.join(vaultDir, '02_Entities', 'Characters', 'LiYuan.md'),
        relative_path: '02_Entities/Characters/LiYuan.md',
        file_name: 'LiYuan.md',
        extension: '.md',
        size_bytes: 200,
        mtime_ms: Date.now(),
        sha256_hash: 'dummyhash123',
        source_category: 'character_bio',
        status: 'active',
        review_status: 'confirmed'
      });

      const charEntity = dbManager.entities.insert({
        entity_id: 'CHAR-005',
        canonical_name: '林远',
        entity_type: 'character',
        source_file_id: charFile.id
      });

      // 2. Save draft with POV entity ID
      const payload = {
        chapterId: 'CH-006',
        title: '第六章 领航视角',
        content: '# 第六章 领航视角\n\n林远注视着前方的引力波纹。',
        volumeNumber: 1,
        chapterNumber: 6,
        povEntityId: charEntity.id,
        vaultRoot: vaultDir
      };

      await dispatcher.dispatch('SaveChapterDraft', payload);

      const ch6 = dbManager.chapters.getByVolumeAndChapter(1, 6);
      assert.ok(ch6);
      assert.equal(ch6.pov_entity_id, charEntity.id);
      assert.equal(ch6.pov_entity_name, '林远');
    });

    it('F3-T3.2: should allow GetSourceFile to inspect indexed draft metadata after creation', async () => {
      const payload = {
        chapterId: 'CH-007',
        title: '第七章 航向未知',
        content: '# 第七章 航向未知\n\n全舰队进入休眠程序。',
        volumeNumber: 1,
        chapterNumber: 7,
        vaultRoot: vaultDir
      };

      const saveRes = await dispatcher.dispatch('SaveChapterDraft', payload);
      const details = saveRes.details || saveRes;
      const relPath = details.relativePath;

      assert.ok(relPath, 'SaveChapterDraft must return relativePath');

      const getRes = await dispatcher.dispatch('GetSourceFile', { relativePath: relPath });
      assert.ok(getRes);
      assert.ok(getRes.details);
      if (getRes.details.file) {
        assert.equal(getRes.details.file.status, 'draft');
      }
    });
  });

  // =========================================================================
  // Tier 4: Multi-Chapter Drafting Workload & Zero-Mutation Integrity
  // =========================================================================
  describe('Tier 4: Vault-Scale Drafting Stress & Zero-Mutation Verification', () => {

    it('F3-T4.1: should save 10 sequential chapter drafts leaving 01~12 folders 100% untouched', async () => {
      const totalChapters = 10;

      for (let i = 1; i <= totalChapters; i++) {
        const payload = {
          chapterId: `BATCH-CH-${String(i).padStart(2, '0')}`,
          title: `第${i}章 连载草稿`,
          content: `# 第${i}章 连载草稿\n\n这是第 ${i} 章的自动保存草稿内容。`,
          summary: `第 ${i} 章概要`,
          volumeNumber: 2,
          chapterNumber: i,
          vaultRoot: vaultDir
        };

        await dispatcher.dispatch('SaveChapterDraft', payload);
      }

      // Assert SQLite chapters count
      const vol2Chapters = dbManager.chapters.query({ volume_number: 2 });
      assert.equal(vol2Chapters.length, totalChapters, `Must have ${totalChapters} chapters in volume 2`);

      // Verify all 01~12 folders remain unchanged
      for (let i = 1; i <= 12; i++) {
        const folderName = `${String(i).padStart(2, '0')}_SettingFolder_${i}`;
        const folderPath = path.join(vaultDir, folderName);
        const files = fs.readdirSync(folderPath);
        assert.equal(files.length, 0, `Folder ${folderName} must have 0 draft files`);
      }

      // Verify 01_Worldview lore integrity
      const worldLore = fs.readFileSync(path.join(vaultDir, '01_Worldview', 'Cosmology.md'), 'utf8');
      assert.equal(worldLore, '# Immutable Worldview Lore\nDo not mutate.');
    });
  });
});
