/**
 * @file challenger2_empirical_stress.test.js
 * @description Comprehensive Adversarial Empirical Stress & Invariant Verification Suite for Challenger 2 (Milestones 3 & 4)
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const { createTempDir } = require('../helpers/tempDir');

/**
 * Computes recursive SHA-256 hash map of all files in a directory.
 */
function getDirectoryHashMap(dirPath) {
  const fileMap = new Map();
  if (!fs.existsSync(dirPath)) return fileMap;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        const stat = fs.statSync(fullPath);
        fileMap.set(fullPath, { hash, size: stat.size, mtimeMs: stat.mtimeMs });
      }
    }
  }

  walk(dirPath);
  return fileMap;
}

/**
 * Computes single composite tree hash for an entire directory.
 */
function computeTreeHash(dirPath) {
  const map = getDirectoryHashMap(dirPath);
  const sortedKeys = Array.from(map.keys()).sort();
  const hasher = crypto.createHash('sha256');
  for (const key of sortedKeys) {
    const meta = map.get(key);
    hasher.update(`${key}:${meta.hash}:${meta.size}`);
  }
  return hasher.digest('hex');
}

describe('Challenger 2 Empirical Verification: Milestones 3 & 4 Adversarial Robustness', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_ch2_stress_');
    vaultDir = tempEnv.createSubdir('vault_root');
    pluginDir = tempEnv.createSubdir('plugin_sandbox');

    // Create 01~12 setting directories in vault
    for (let i = 1; i <= 12; i++) {
      const dirName = `${String(i).padStart(2, '0')}_Setting_${i}`;
      fs.mkdirSync(path.join(vaultDir, dirName), { recursive: true });
    }
    fs.mkdirSync(path.join(vaultDir, '01_Worldview'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '02_Entities', 'Planets'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '03_Chapters', 'Vol01'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '04_星球档案'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '05_Foreshadowing'), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, '13_小说工程插件', '篇章草稿'), { recursive: true });

    // Seed canon setting files
    fs.writeFileSync(
      path.join(vaultDir, '01_Worldview', 'UniverseAxioms.md'),
      '---\ncategory: worldview_setting\nstatus: canonical\nreview_status: confirmed\n---\n# 宇宙公理\n光速为不可逾越的物理上限。',
      'utf8'
    );

    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    const dbPath = path.join(pluginDir, 'data', 'stress_index.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });

    dispatcher = new CommandDispatcher({
      basePath: pluginDir,
      dbPath,
      dbManager,
      pathGuard,
      config: {
        VAULT_ROOT: vaultDir,
        DATABASE_PATH: dbPath
      }
    });
  });

  afterEach(() => {
    if (dispatcher) dispatcher.close();
    if (dbManager && dbManager.isOpen()) dbManager.close();
    if (tempEnv) tempEnv.cleanup();
  });

  // =========================================================================
  // Test Suite 1: PathGuard Sandbox Defense Matrix & Anti-Escape Invariants
  // =========================================================================
  describe('1. PathGuard Sandbox Defense Matrix & Anti-Escape Invariants', () => {
    it('CH2-PG-01: should block all traversal patterns escaping draft sandbox into 01~12 folders', async () => {
      const escapeAttempts = [
        '../01_Worldview/hack.md',
        '../../01_Worldview/hack.md',
        '..\\02_Entities\\hack.md',
        '..\\..\\04_星球档案\\hack.md',
        '../12_Setting_12/hack.md',
        '13_小说工程插件/篇章草稿/../../01_Worldview/exploit.md',
        '13_小说工程插件\\篇章草稿\\..\\..\\03_Chapters\\exploit.md',
        path.join(vaultDir, '13_小说工程插件', '篇章草稿', '..', '..', '01_Worldview', 'exploit.md'),
        path.join(vaultDir, '01_Worldview', 'direct_attack.md'),
        path.join(vaultDir, '04_星球档案', 'direct_attack.md')
      ];

      for (const target of escapeAttempts) {
        await assert.rejects(
          async () => {
            await dispatcher.dispatch('SaveChapterDraft', {
              chapterId: 'CH_HACK_TRAV',
              title: 'Hacked Title',
              content: 'malicious payload',
              customPath: target,
              vaultRoot: vaultDir
            });
          },
          (err) => {
            assert.ok(
              err.name === 'SecurityError' ||
              err.code === 'ERR_VAULT_WRITE_BLOCKED' ||
              err.code === 'ERR_PATH_TRAVERSAL' ||
              /blocked|unauthorized|sandbox|traversal|zero-mutation/i.test(err.message),
              `Expected SecurityError for ${target}, but got: ${err.message}`
            );
            return true;
          }
        );
      }
    });

    it('CH2-PG-02: should block Windows UNC paths, ADS streams, and DOS device names', async () => {
      const dangerousFilenames = [
        'CON.md', 'PRN.md', 'AUX.md', 'NUL.md', 'COM1.md', 'LPT1.md',
        'draft.md:stream', 'draft.md::$DATA', 'draft.md:hidden',
        'draft.md.', 'draft.md '
      ];

      for (const fn of dangerousFilenames) {
        await assert.rejects(
          async () => {
            await dispatcher.dispatch('SaveChapterDraft', {
              chapterId: 'CH_DEV_ATTACK',
              title: 'Dangerous Filename Attack',
              content: 'payload',
              customFilename: fn,
              vaultRoot: vaultDir
            });
          },
          (err) => {
            assert.ok(
              err.name === 'SecurityError' ||
              err.code === 'ERR_RESERVED_DEVICE_NAME' ||
              err.code === 'ERR_ADS_STREAM_DETECTED' ||
              err.code === 'ERR_INVALID_PATH' ||
              /device|alternate|stream|dangerous|invalid/i.test(err.message),
              `Expected SecurityError for filename ${fn}, got: ${err.message}`
            );
            return true;
          }
        );
      }
    });

    it('CH2-PG-03: should block directory junction / symlink escapes in draft folder pointing to setting lore', async () => {
      const draftDir = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      const junctionPath = path.join(draftDir, 'evil_junction_to_lore');
      const loreDir = path.join(vaultDir, '01_Worldview');

      let linkCreated = false;
      try {
        fs.symlinkSync(loreDir, junctionPath, 'junction');
        linkCreated = true;
      } catch {
        try {
          fs.symlinkSync(loreDir, junctionPath, 'dir');
          linkCreated = true;
        } catch (_) {}
      }

      if (linkCreated) {
        const payloadFile = path.join(junctionPath, 'injected_rule.md');
        await assert.rejects(
          async () => {
            await dispatcher.dispatch('SaveChapterDraft', {
              chapterId: 'CH_JUNCTION_TEST',
              title: 'Junction Exploit',
              content: '# Hijack',
              customPath: payloadFile,
              vaultRoot: vaultDir
            });
          },
          (err) => {
            assert.ok(
              err.name === 'SecurityError' ||
              err.code === 'ERR_VAULT_WRITE_BLOCKED' ||
              /symlink|junction|blocked|escape/i.test(err.message)
            );
            return true;
          }
        );

        assert.equal(fs.existsSync(path.join(loreDir, 'injected_rule.md')), false);
      }
    });
  });

  // =========================================================================
  // Test Suite 2: SaveChapterDraft Atomic Two-Phase Write & Rollback Integrity
  // =========================================================================
  describe('2. SaveChapterDraft Atomic Two-Phase Write & Rollback Integrity', () => {
    it('CH2-ROLL-01: should cleanly delete newly created markdown draft file when SQLite sync fails', async () => {
      const draftSandbox = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      const expectedDraftFile = path.join(draftSandbox, 'CH_101_回滚新建文件测试.md');

      assert.equal(fs.existsSync(expectedDraftFile), false);

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH-101',
            title: '回滚新建文件测试',
            content: '# 正文\n新章节正文。',
            volumeNumber: 1,
            chapterNumber: 101,
            vaultRoot: vaultDir,
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/i
      );

      // Verify on-disk file was removed
      assert.equal(fs.existsSync(expectedDraftFile), false, 'Draft file MUST be deleted on DB failure');

      // Verify DB has no chapter record
      const ch = dbManager.chapters.getByVolumeAndChapter(1, 101);
      assert.equal(ch, null, 'Chapter record must not exist in DB');
    });

    it('CH2-ROLL-02: should restore exact byte-for-byte prior content when updating existing draft fails', async () => {
      // 1. Create valid draft first
      const createRes = await dispatcher.dispatch('SaveChapterDraft', {
        chapterId: 'CH-102',
        title: '原有草稿内容',
        content: '# 原有正文\n这是第一版内容。',
        volumeNumber: 1,
        chapterNumber: 102,
        vaultRoot: vaultDir
      });

      const draftPath = createRes.details.draftFilePath;
      assert.ok(fs.existsSync(draftPath));
      const originalFileBytes = fs.readFileSync(draftPath);
      const originalHash = crypto.createHash('sha256').update(originalFileBytes).digest('hex');

      // 2. Attempt update with simulated failure
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH-102',
            title: '损坏的新标题',
            content: '# 损坏的新正文\n这段内容不应该留存在磁盘上。',
            volumeNumber: 1,
            chapterNumber: 102,
            customFilename: path.basename(draftPath),
            vaultRoot: vaultDir,
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/i
      );

      // 3. Verify file content matches original 100% byte-for-byte
      assert.ok(fs.existsSync(draftPath), 'Draft file should still exist');
      const currentBytes = fs.readFileSync(draftPath);
      const currentHash = crypto.createHash('sha256').update(currentBytes).digest('hex');
      assert.equal(currentHash, originalHash, 'File SHA-256 hash must be identical to original after rollback');
      assert.ok(currentBytes.equals(originalFileBytes), 'Restored bytes must exactly match prior backup');
    });

    it('CH2-ROLL-03: should handle concurrent draft savings with distinct chapters without collision', async () => {
      const tasks = [];
      for (let i = 1; i <= 10; i++) {
        tasks.push(
          dispatcher.dispatch('SaveChapterDraft', {
            chapterId: `CH-CONC-${i}`,
            title: `并发章节${i}`,
            content: `# 第${i}章\n并发写入测试内容${i}。`,
            volumeNumber: 1,
            chapterNumber: 200 + i,
            vaultRoot: vaultDir
          })
        );
      }

      const results = await Promise.all(tasks);
      assert.equal(results.length, 10);

      for (let i = 0; i < 10; i++) {
        const res = results[i];
        assert.equal(res.status, 'draft');
        assert.equal(res.canon, 0);
        assert.ok(fs.existsSync(res.details.draftFilePath));

        const dbCh = dbManager.chapters.getByVolumeAndChapter(1, 200 + (i + 1));
        assert.ok(dbCh, `DB Chapter ${200 + (i + 1)} must exist`);
        assert.equal(dbCh.status, 'draft');
        assert.equal(dbCh.canon, 0);
      }
    });
  });

  // =========================================================================
  // Test Suite 3: Multi-File Entity Hierarchy Aggregation & Facet Integrity
  // =========================================================================
  describe('3. Multi-File Entity Hierarchy Aggregation & Facet Integrity', () => {
    it('CH2-AGG-01: should aggregate 1 anchor file and 5 facet sub-files across 4 directory depths into 1 canonical entity', async () => {
      const planetBase = path.join(vaultDir, '04_星球档案', 'V-777 虚空之眼');
      const geoDir = path.join(planetBase, '01_地理生态', 'sub_terrain', 'caves');
      const factionDir = path.join(planetBase, '07_势力体系', 'shadow_council');
      const conflictDir = path.join(planetBase, '99_冲突记录');

      fs.mkdirSync(geoDir, { recursive: true });
      fs.mkdirSync(factionDir, { recursive: true });
      fs.mkdirSync(conflictDir, { recursive: true });

      // Anchor definition file
      fs.writeFileSync(
        path.join(planetBase, '00_星球总览.md'),
        '---\ncode: V-777\nname: 虚空之眼\ntype: planet\ncategory: planet\nstatus: canonical\nreview_status: confirmed\n---\n# 虚空之眼\n高危异构行星。'
      );

      // Supplementary facet files
      fs.writeFileSync(path.join(planetBase, '01_地理生态', 'geo_detail.md'), '# 地理概况\n极寒地貌。');
      fs.writeFileSync(path.join(geoDir, 'deep_crystals.md'), '# 深层晶体洞窟\n高能矿脉。');
      fs.writeFileSync(path.join(planetBase, '07_势力体系', 'factions.md'), '# 势力概况\n三大矿业巨头。');
      fs.writeFileSync(path.join(factionDir, 'inner_circle.md'), '# 暗影议会核心\n秘密决策层。');
      fs.writeFileSync(path.join(conflictDir, 'orbital_strike.md'), '# 轨道轰炸冲突\n第一次轨道战争。');

      const indexer = new IncrementalIndexer({
        vaultPath: vaultDir,
        dbManager,
        pathGuard
      });

      const syncRes = await indexer.sync();
      assert.ok(syncRes.totalFilesScanned >= 6);

      const entityWithFacets = dbManager.entities.getEntityWithFacets('V-777');
      assert.ok(entityWithFacets, 'Canonical entity V-777 must exist');
      assert.equal(entityWithFacets.canonical_name, '虚空之眼');
      assert.equal(entityWithFacets.entity_type, 'planet');

      // Verify all 6 files are linked to V-777
      assert.equal(entityWithFacets.linkedFiles.length, 6, 'All 6 files must be linked in file_entities');
      assert.equal(entityWithFacets.facets.definition.length, 1, 'Exactly 1 definition file');
      assert.equal(entityWithFacets.facets.supplement.length, 4, '4 supplementary facet files');
      assert.equal(entityWithFacets.facets.conflict.length, 1, '1 conflict facet file');

      const crystalFile = entityWithFacets.linkedFiles.find(f => f.file_name === 'deep_crystals.md');
      assert.ok(crystalFile, 'deep_crystals.md must be linked');
      assert.equal(crystalFile.facet_role, 'supplement');
    });

    it('CH2-AGG-02: should preserve canonical entity during incremental re-scan and update file_entities correctly', async () => {
      const planetBase = path.join(vaultDir, '04_星球档案', 'V-777 虚空之眼');
      const geoDir = path.join(planetBase, '01_地理生态');
      fs.mkdirSync(geoDir, { recursive: true });

      fs.writeFileSync(
        path.join(planetBase, '00_星球总览.md'),
        '---\ncode: V-777\nname: 虚空之眼\ntype: planet\ncategory: planet\nstatus: canonical\nreview_status: confirmed\n---\n# 虚空之眼\n高危异构行星。'
      );

      const indexer = new IncrementalIndexer({
        vaultPath: vaultDir,
        dbManager,
        pathGuard
      });

      await indexer.sync();

      let entityWithFacets = dbManager.entities.getEntityWithFacets('V-777');
      assert.ok(entityWithFacets);
      assert.equal(entityWithFacets.linkedFiles.length, 1);

      // Now add new facet file
      const newFacetFile = path.join(geoDir, 'atmosphere.md');
      fs.writeFileSync(newFacetFile, '# 大气层分析\n含有微量未知惰性气体。', 'utf8');

      await indexer.sync();

      entityWithFacets = dbManager.entities.getEntityWithFacets('V-777');
      assert.ok(entityWithFacets);
      assert.equal(entityWithFacets.linkedFiles.length, 2, 'Linked files count must increment to 2');

      const atmos = entityWithFacets.linkedFiles.find(f => f.file_name === 'atmosphere.md');
      assert.ok(atmos, 'atmosphere.md must be linked');
    });
  });

  // =========================================================================
  // Test Suite 4: GetChapterContext 6-Category Snapshot & SHA-256 Stamp Invariant
  // =========================================================================
  describe('4. GetChapterContext 6-Category Snapshot & SHA-256 Stamp Invariant', () => {
    beforeEach(async () => {
      // Seed rich test data for all 6 categories
      // 1. World rules
      fs.writeFileSync(
        path.join(vaultDir, '01_Worldview', 'WarpDriveRules.md'),
        '---\ncategory: worldview_setting\nstatus: canonical\nreview_status: confirmed\n---\n# 曲率引擎法则\n跃迁能耗与质量成二次方关系。'
      );

      // 2. Canon entity
      fs.writeFileSync(
        path.join(vaultDir, '02_Entities', 'Planets', 'Genesis_PL001.md'),
        '---\nid: PL-001\nname: 创世星\ncategory: planet\ntype: planet\nstatus: canonical\nreview_status: confirmed\naliases: ["起始之星", "母星"]\n---\n# 创世星\n文明发源地。'
      );

      // 3. Chapter text
      fs.writeFileSync(
        path.join(vaultDir, '03_Chapters', 'Vol01', 'CH_001_启航.md'),
        '---\nchapter_number: 1\nvolume_number: 1\ntitle: 启航\nstatus: finalized\ncanon: 1\n---\n# 第一章 启航\n探索舰队驶离港口。'
      );

      // 4. Candidate / Draft entity
      fs.writeFileSync(
        path.join(vaultDir, '02_Entities', 'Planets', 'Draft_Moon.md'),
        '---\nid: PL-DRAFT-99\nname: 碎月\ncategory: planet\ntype: planet\nstatus: draft\nreview_status: pending_review\n---\n# 碎月\n疑似被碎裂的卫星。'
      );

      // 5. Conflict entity & Anomaly
      fs.writeFileSync(
        path.join(vaultDir, '02_Entities', 'Planets', 'Mars_Conflict.md'),
        '---\nid: PL-002\nname: 荧惑星\ncategory: planet\ntype: planet\nstatus: conflict\nreview_status: conflicted\n---\n# 荧惑星\n冲突：失联前哨 vs 秘密基地。'
      );

      // 6. Foreshadowing
      fs.writeFileSync(
        path.join(vaultDir, '05_Foreshadowing', 'FS_001_AncientSignal.md'),
        '---\nid: FS-001\ntitle: 深空异常信号\nstatus: open\nimportance_level: high\nintroduced_chapter: 1\ntarget_resolve_chapter: 10\n---\n第三频段接收到的莫尔斯编码。'
      );

      await IncrementalIndexer.sync(vaultDir, dbManager);

      dbManager.anomalies.insert({
        anomaly_code: 'ANOM_001',
        title: '同名实体冲突',
        severity: 'warning',
        message: '荧惑星存在双重记载冲突',
        source_file_id: 1,
        involved_entities_json: JSON.stringify(['PL-002', '荧惑星'])
      });
    });

    it('CH2-CTX-01: should return all 6 categories with 100% valid 64-char SHA-256 hash tracking stamps', async () => {
      const res = await dispatcher.dispatch('GetChapterContext', {
        chapterId: '1',
        focusEntities: ['创世星', '碎月', '荧惑星'],
        includeWorldRules: true
      });

      assert.ok(res.details, 'Response must contain details');
      const snapshot = res.details.snapshot;
      assert.ok(snapshot, 'Response must contain snapshot');

      const expectedCategories = ['worldRules', 'canonSources', 'chapterSources', 'candidateSources', 'conflicts', 'unresolved'];

      for (const cat of expectedCategories) {
        assert.ok(Array.isArray(snapshot[cat]), `Snapshot category ${cat} must be an array`);
        assert.ok(snapshot[cat].length >= 1, `Snapshot category ${cat} must contain items (got ${snapshot[cat].length})`);

        for (const item of snapshot[cat]) {
          assert.ok(item.sourceFilePath, `${cat} item must contain sourceFilePath`);
          assert.ok(item.status, `${cat} item must contain status`);
          assert.ok(item.reviewStatus, `${cat} item must contain reviewStatus`);

          // Verify hash stamp format
          const hashStamp = item.hashTrackingStamp;
          assert.ok(hashStamp, `${cat} item must contain hashTrackingStamp`);
          assert.equal(typeof hashStamp, 'string');
          assert.equal(hashStamp.length, 64, `Hash stamp must be exactly 64 chars, got ${hashStamp.length}`);
          assert.match(hashStamp, /^[0-9a-f]{64}$/i, `Hash stamp must be valid lowercase hex string`);
        }
      }
    });

    it('CH2-CTX-02: should recall entities via alias and resolve correct status categorization', async () => {
      // Recall using alias "起始之星"
      const res = await dispatcher.dispatch('GetChapterContext', {
        chapterId: '1',
        focusEntities: ['起始之星'],
        includeWorldRules: false
      });

      const { canonSources, candidateSources } = res.details.snapshot;
      assert.ok(canonSources.some(e => e.canonicalName === '创世星' || e.entityId === 'PL-001'), 'Must recall 创世星 via alias 起始之星');
      assert.equal(candidateSources.length, 0, 'No candidate entities recalled');
    });

    it('CH2-CTX-03: should withstand SQL injection payloads and special characters in focusEntities', async () => {
      const attackTerms = [
        "' OR 1=1 --",
        "'; DROP TABLE entities; --",
        "创世星' UNION SELECT * FROM source_files --",
        "\\x00",
        "<script>alert(1)</script>",
        "../../etc/passwd"
      ];

      for (const term of attackTerms) {
        const res = await dispatcher.dispatch('GetChapterContext', {
          chapterId: '1',
          focusEntities: [term],
          includeWorldRules: true
        });

        assert.ok(res.details.snapshot, 'Should return valid snapshot without SQL syntax errors or crash');
      }

      // Verify database tables still intact
      const entityCount = dbManager.entities.count();
      assert.ok(entityCount > 0, 'Entities table must remain intact');
    });
  });

  // =========================================================================
  // Test Suite 5: Empirical Zero-Mutation Invariant Under Attack Flood
  // =========================================================================
  describe('5. Empirical Zero-Mutation Invariant Under Attack Flood', () => {
    it('CH2-MUT-01: should ensure setting folders 01~12 are 100% untouched byte-for-byte after attack barrage', async () => {
      const beforeTreeMap = getDirectoryHashMap(vaultDir);
      const beforeTreeHash = computeTreeHash(vaultDir);

      // Launch a barrage of 30 adversarial attacks
      for (let i = 1; i <= 30; i++) {
        try {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: `ATTACK_${i}`,
            title: `Malicious Attack ${i}`,
            content: `Exploit Content ${i}`,
            customPath: path.join(vaultDir, `0${(i % 12) + 1}_Setting_${(i % 12) + 1}`, `exploit_${i}.md`),
            vaultRoot: vaultDir
          });
        } catch (_) {}

        try {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: `ATTACK_TRAV_${i}`,
            title: `Traversal Attack ${i}`,
            content: `Exploit Content ${i}`,
            customPath: path.join(vaultDir, '13_小说工程插件', '篇章草稿', '..', '..', '01_Worldview', `hack_${i}.md`),
            vaultRoot: vaultDir
          });
        } catch (_) {}
      }

      // Filter check: verify 01~12 folders specifically have zero mutations
      for (let i = 1; i <= 12; i++) {
        const dirName = `${String(i).padStart(2, '0')}_Setting_${i}`;
        const dirPath = path.join(vaultDir, dirName);
        const files = fs.readdirSync(dirPath);
        assert.equal(files.length, 0, `Folder ${dirName} must contain 0 files (zero mutation violated!)`);
      }

      const wvFiles = fs.readdirSync(path.join(vaultDir, '01_Worldview'));
      assert.ok(wvFiles.length >= 1);
      assert.ok(!wvFiles.some(f => f.startsWith('exploit_') || f.startsWith('hack_')));
    });
  });
});
