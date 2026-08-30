/**
 * @file adversarial_security_rollback_m3.test.js
 * @description Adversarial penetration test suite for SaveChapterDraft and PathGuard (Milestone 3 / Milestone 4)
 * Covers: Directory Traversal, UNC paths, Symlink/Junction Escapes, Absolute Path bypass, and Atomic Transaction Rollback Cleanup
 * @module test/unit/adversarial_security_rollback_m3
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
const { createTempDir } = require('../helpers/tempDir');

describe('Milestone 3 & 4: Adversarial Security Sandbox & Atomic Rollback Suite (R3)', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let outsideDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_sec_rollback_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');
    outsideDir = tempEnv.createSubdir('outside_vault');

    // Create 01~12 setting folders
    for (let i = 1; i <= 12; i++) {
      const folderName = `${String(i).padStart(2, '0')}_Setting_${i}`;
      fs.mkdirSync(path.join(vaultDir, folderName), { recursive: true });
    }
    fs.mkdirSync(path.join(vaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '02_Entities'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '04_星球档案'), { recursive: true });

    // Populate canon world rules
    fs.writeFileSync(
      path.join(vaultDir, '01_Worldview', 'Cosmology.md'),
      '# Immutable Worldview Core\nZero mutation guaranteed.',
      'utf8'
    );

    const dbPath = path.join(pluginDir, 'data', 'security_test.db');
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
    if (dispatcher) dispatcher.close();
    if (dbManager && dbManager.isOpen()) dbManager.close();
    if (tempEnv) tempEnv.cleanup();
  });

  // =========================================================================
  // Section 1: Hacker Escape & Penetration Tests (AC 3)
  // =========================================================================
  describe('Penetration Vector 1: Directory Traversal Attacks', () => {
    it('ADV-SEC-01: should intercept standard and deep ../ traversal into setting directories', async () => {
      const payloads = [
        path.join(vaultDir, '13_小说工程插件', '篇章草稿', '..', '..', '01_Worldview', 'hack.md'),
        path.join(vaultDir, '13_小说工程插件', '篇章草稿', '..', '..', '04_星球档案', 'hack.md'),
        path.join(vaultDir, '13_小说工程插件', '篇章草稿', '..', '..', '..', 'outside.md'),
        '../../01_Worldview/hack.md'
      ];

      for (const customPath of payloads) {
        await assert.rejects(
          async () => {
            await dispatcher.dispatch('SaveChapterDraft', {
              chapterId: 'HACK-TRAV',
              title: 'Traversal Exploit',
              content: '# Malicious Injection',
              customPath,
              vaultRoot: vaultDir
            });
          },
          (err) => {
            assert.ok(
              err.name === 'SecurityError' ||
              err.code === 'ERR_VAULT_WRITE_BLOCKED' ||
              err.code === 'ERR_PATH_TRAVERSAL' ||
              /blocked|unauthorized|sandbox|traversal/i.test(err.message),
              `Expected SecurityError for ${customPath}, got: ${err.message}`
            );
            return true;
          }
        );
      }

      assert.equal(fs.existsSync(path.join(vaultDir, '01_Worldview', 'hack.md')), false);
    });

    it('ADV-SEC-02: should intercept URL-encoded traversal sequences (%2e%2e, %2f, %5c)', async () => {
      const urlEncodedPath = path.join(vaultDir, '13_小说工程插件', '篇章草稿', '%2e%2e%2f01_Worldview%2fhack.md');

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'HACK-URL',
            title: 'URL Traversal',
            content: '# Exploit',
            customPath: urlEncodedPath,
            vaultRoot: vaultDir
          });
        },
        /SecurityError|ERR_PATH_TRAVERSAL|ERR_INVALID_PATH|traversal/i
      );
    });
  });

  describe('Penetration Vector 2: Windows UNC Network Share Attacks', () => {
    it('ADV-SEC-03: should 100% block Windows UNC network paths (\\\\server\\share\\...)', async () => {
      const uncPaths = [
        '\\\\192.168.1.100\\c$\\payload.md',
        '\\\\attacker-server\\share\\evil_draft.md',
        '//remote-smb-share/vault/draft.md'
      ];

      for (const uncPath of uncPaths) {
        await assert.rejects(
          async () => {
            await dispatcher.dispatch('SaveChapterDraft', {
              chapterId: 'HACK-UNC',
              title: 'UNC Attack',
              content: '# UNC Injection',
              customPath: uncPath,
              vaultRoot: vaultDir
            });
          },
          (err) => {
            assert.ok(
              err.name === 'SecurityError' ||
              err.code === 'ERR_PATH_OUTSIDE_SANDBOX' ||
              /UNC|prohibited|outside|network/i.test(err.message),
              `Expected UNC rejection for ${uncPath}, got: ${err.message}`
            );
            return true;
          }
        );
      }
    });
  });

  describe('Penetration Vector 3: Symlink & Junction Escape Defenses', () => {
    it('ADV-SEC-04: should intercept symlink / junction escapes pointing to setting lore folders', async () => {
      const draftSandbox = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      fs.mkdirSync(draftSandbox, { recursive: true });

      const linkPath = path.join(draftSandbox, 'symlink_to_worldview');
      const targetLoreDir = path.join(vaultDir, '01_Worldview');

      let linkCreated = false;
      try {
        fs.symlinkSync(targetLoreDir, linkPath, 'junction');
        linkCreated = true;
      } catch {
        try {
          fs.symlinkSync(targetLoreDir, linkPath, 'dir');
          linkCreated = true;
        } catch (_) {}
      }

      if (linkCreated) {
        const attackFilePath = path.join(linkPath, 'injected_rule.md');

        await assert.rejects(
          async () => {
            await dispatcher.dispatch('SaveChapterDraft', {
              chapterId: 'HACK-JUNCTION',
              title: 'Junction Escape',
              content: '# Hijacked Worldview',
              customPath: attackFilePath,
              vaultRoot: vaultDir
            });
          },
          (err) => {
            assert.ok(
              err.name === 'SecurityError' ||
              err.code === 'ERR_VAULT_WRITE_BLOCKED' ||
              /blocked|symlink|junction|outside/i.test(err.message)
            );
            return true;
          }
        );

        assert.equal(fs.existsSync(path.join(targetLoreDir, 'injected_rule.md')), false);
      }
    });
  });

  describe('Penetration Vector 4: Absolute Path & System Path Bypass', () => {
    it('ADV-SEC-05: should block absolute paths outside the vault root', async () => {
      const outsideFile = path.join(outsideDir, 'unauthorized_draft.md');

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'HACK-ABS',
            title: 'Absolute Bypass',
            content: '# Outside Injection',
            customPath: outsideFile,
            vaultRoot: vaultDir
          });
        },
        /SecurityError|ERR_PATH_TRAVERSAL|ERR_VAULT_WRITE_BLOCKED|outside/i
      );

      assert.equal(fs.existsSync(outsideFile), false);
    });
  });

  // =========================================================================
  // Section 2: Atomic Write & Rollback Cleanup Verification (AC 4)
  // =========================================================================
  describe('Section 2: Atomic Rollback & Error Recovery Harnesses', () => {
    it('ADV-ROLL-01: should automatically delete on-disk markdown draft file if SQLite transaction fails', async () => {
      const draftSandbox = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      fs.mkdirSync(draftSandbox, { recursive: true });

      const expectedDraftFile = path.join(draftSandbox, 'CH_099_失败回滚测试.md');

      // Ensure file does not exist initially
      if (fs.existsSync(expectedDraftFile)) fs.unlinkSync(expectedDraftFile);

      // Execute SaveChapterDraft with simulated database failure
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH-099',
            title: '失败回滚测试',
            content: '# 失败测试\n这是一篇在写入数据库时失败的草稿。',
            volumeNumber: 1,
            chapterNumber: 99,
            vaultRoot: vaultDir,
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/i
      );

      // Verify that the markdown file was cleanly deleted by rollback handler
      assert.equal(
        fs.existsSync(expectedDraftFile),
        false,
        'On-disk draft file MUST be cleanly deleted when SQLite transaction fails'
      );

      // Verify no chapter record was committed in SQLite
      const chRow = dbManager.chapters.getByVolumeAndChapter(1, 99);
      assert.equal(chRow, null, 'No chapter record should exist in database');
    });

    it('ADV-ROLL-02: should preserve existing draft file content if update transaction fails', async () => {
      const draftSandbox = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      fs.mkdirSync(draftSandbox, { recursive: true });

      // 1. First save legitimate draft
      const initialPayload = {
        chapterId: 'CH-088',
        title: '初始原始草稿',
        content: '# 原始合法正文\n这是初始内容。',
        volumeNumber: 1,
        chapterNumber: 88,
        vaultRoot: vaultDir
      };

      const res = await dispatcher.dispatch('SaveChapterDraft', initialPayload);
      const draftFile = res.details.draftFilePath;
      assert.ok(fs.existsSync(draftFile));
      const originalFileContent = fs.readFileSync(draftFile, 'utf8');

      // 2. Now attempt update with simulated failure
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH-088',
            title: '更新草稿失败',
            content: '# 破损的新内容',
            volumeNumber: 1,
            chapterNumber: 88,
            customFilename: path.basename(draftFile),
            vaultRoot: vaultDir,
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/i
      );

      // 3. Verify original file content was fully restored by rollback
      assert.ok(fs.existsSync(draftFile), 'File should still exist');
      const restoredContent = fs.readFileSync(draftFile, 'utf8');
      assert.equal(restoredContent, originalFileContent, 'Original file content must be restored upon update rollback');
    });
  });
});
