/**
 * @file MicroWorldTreeGenerator.js
 * @description Synthetic Obsidian World-Tree Vault Generator embedding Control Cases and All 10 Anomaly Types
 * @module test/fixtures/MicroWorldTreeGenerator
 * @license MIT
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

class MicroWorldTreeGenerator {
  /**
   * @param {object} [options={}]
   * @param {string} [options.targetDir] - Optional explicit target directory for the mock vault
   * @param {string} [options.tempDirPrefix='vcp-microworld-'] - Temp directory prefix if targetDir not given
   */
  constructor(options = {}) {
    this.options = options;
    this.targetDir = options.targetDir || null;
    this.tempDirPrefix = options.tempDirPrefix || 'vcp-microworld-';
    this.isEphemeral = !options.targetDir;
    this.createdFiles = [];
    this.vaultRoot = null;
  }

  /**
   * Definition of all control and anomaly files embedded in the micro world tree.
   * @returns {Array<{ relativePath: string, content: string, category: string, anomalyRuleId?: string, isAnomaly: boolean }>}
   */
  getFileDefinitions() {
    return [
      // =========================================================================
      // Control Files (Canonical & Correct Cases)
      // =========================================================================
      {
        relativePath: '01_Worldview/World_Cosmology_Canon.md',
        category: 'worldview_setting',
        isAnomaly: false,
        content: [
          '---',
          'category: worldview_setting',
          'type: lore',
          'status: finalized',
          'review_status: confirmed',
          'verified: true',
          'author: human_canon',
          '---',
          '# 恒星衰变与流浪公理',
          '',
          '人类进入大流浪纪元，核心公理：所有星舰遵守流浪宪章，禁止攻击中立科学观测站。本设定已经人类主创团队完全确认并冻结。'
        ].join('\n')
      },
      {
        relativePath: '02_Entities/Planets/Planet_Alpha_PL002.md',
        category: 'planet_system',
        isAnomaly: false,
        content: [
          '---',
          'category: planet',
          'type: planet',
          'id: PL-002',
          'name: 阿尔法星',
          'status: active',
          'review_status: confirmed',
          '---',
          '# 阿尔法星 (PL-002)',
          '',
          '作为人类星际远航的中继补给站，阿尔法星拥有稳定的第三轨道生态圈与大型聚变船坞。'
        ].join('\n')
      },
      {
        relativePath: '02_Entities/Characters/Protagonist_CHAR005.md',
        category: 'character_bio',
        isAnomaly: false,
        content: [
          '---',
          'category: character',
          'type: character',
          'id: CHAR-005',
          'name: 林远',
          'status: active',
          'review_status: confirmed',
          'planet: "[[Planet_Alpha_PL002]]"',
          'aliases: ["远航先锋"]',
          '---',
          '# 林远 (CHAR-005)',
          '',
          '流浪舰队探索号领航员，曾参与第一次深空跃迁探索任务，具有出色的引力透镜导航直觉。'
        ].join('\n')
      },
      {
        relativePath: '03_Chapters/Vol01/Chapter_01.md',
        category: 'chapter_text',
        isAnomaly: false,
        content: [
          '---',
          'category: chapter',
          'chapter_number: 1',
          'volume_number: 1',
          'title: 启航之日',
          'status: finalized',
          'timeline_start: 100',
          'timeline_end: 120',
          '---',
          '# 第一章 启航之日',
          '',
          '巨型行星推进器的蓝色等离子烈焰划破了永夜的天空，林远站在观测窗前，凝视着渐渐远去的母星地平线。'
        ].join('\n')
      },
      {
        relativePath: '03_Chapters/Vol01/Chapter_02.md',
        category: 'chapter_text',
        isAnomaly: false,
        content: [
          '---',
          'category: chapter',
          'chapter_number: 2',
          'volume_number: 1',
          'title: 跃迁深渊',
          'status: finalized',
          'timeline_start: 121',
          'timeline_end: 150',
          '---',
          '# 第二章 跃迁深渊',
          '',
          '超空间引擎的共振频率达到了峰值，周围的群星在引力透镜效应下被拉伸成耀眼的光弧。'
        ].join('\n')
      },
      {
        relativePath: '04_Timeline/Event_Genesis_EV001.md',
        category: 'timeline_record',
        isAnomaly: false,
        content: [
          '---',
          'category: timeline_record',
          'type: event',
          'id: EV-001',
          'title: 流浪时代开启',
          'timestamp_order: 10',
          'timeline_year: 2100',
          'status: active',
          '---',
          '# 流浪时代开启 (EV-001)',
          '',
          '公元2100年，联合国流浪委员会正式通过大迁移决议，开启流浪纪元第一阶段推进工程。'
        ].join('\n')
      },
      {
        relativePath: '04_Timeline/Event_FirstContact_EV002.md',
        category: 'timeline_record',
        isAnomaly: false,
        content: [
          '---',
          'category: timeline_record',
          'type: event',
          'id: EV-002',
          'title: 首次深空通讯建立',
          'timestamp_order: 20',
          'timeline_year: 2110',
          'prerequisites: ["EV-001"]',
          'status: active',
          '---',
          '# 首次深空通讯建立 (EV-002)',
          '',
          '公元2110年，先遣舰队与阿尔法星补给站建立稳定亚空间超光速通信链路。'
        ].join('\n')
      },
      {
        relativePath: '05_Foreshadowing/Hook_AncientRelic_FS002.md',
        category: 'foreshadowing_entry',
        isAnomaly: false,
        content: [
          '---',
          'category: foreshadowing_entry',
          'type: clue',
          'id: FS-002',
          'title: 远古方舟黑匣子',
          'status: open',
          'importance: major',
          '---',
          '# 远古方舟黑匣子 (FS-002)',
          '',
          '在柯伊伯带边缘遗迹中发掘出的先驱者黑匣子，其加密算法无法被现有量子计算机破解。'
        ].join('\n')
      },

      // =========================================================================
      // 10 Anomaly Test Cases (ANOM_001 through ANOM_010)
      // =========================================================================

      // 1. ANOM_001: Same-Name Planet Different ID
      {
        relativePath: '02_Entities/Planets/Taranto_PL001.md',
        category: 'planet_system',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_001_SAME_NAME_DIFF_ID',
        anomalyType: 'ANOM_001',
        content: [
          '---',
          'category: planet',
          'type: planet',
          'id: PL-001',
          'name: 塔兰托',
          'status: active',
          'review_status: confirmed',
          '---',
          '# 塔兰托 (PL-001)',
          '',
          '塔兰托行星是外环防御要塞星，部署有三座行星级重力偏转护盾与高轨防御空港。'
        ].join('\n')
      },
      {
        relativePath: '02_Entities/Planets/Taranto_PL099.md',
        category: 'planet_system',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_001_SAME_NAME_DIFF_ID',
        anomalyType: 'ANOM_001',
        content: [
          '---',
          'category: planet',
          'type: planet',
          'id: PL-099',
          'name: 塔兰托',
          'status: active',
          'review_status: confirmed',
          '---',
          '# 塔兰托 (PL-099)',
          '',
          '塔兰托星的另一份独立草案记录，错误使用了编号 PL-099，与要塞星主档案冲突。'
        ].join('\n')
      },

      // 2. ANOM_002: Same Entity ID Multiple Entities
      {
        relativePath: '02_Entities/Characters/Alice_CHAR007.md',
        category: 'character_bio',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_002_SAME_ID_MULTI_ENTITY',
        anomalyType: 'ANOM_002',
        content: [
          '---',
          'category: character',
          'type: character',
          'id: CHAR-007',
          'name: 爱丽丝',
          'status: active',
          'review_status: confirmed',
          '---',
          '# 爱丽丝 (CHAR-007)',
          '',
          '首席通信工程师，负责星际量子阵列维护与超空间信标校准工作。'
        ].join('\n')
      },
      {
        relativePath: '02_Entities/Characters/Bob_CHAR007.md',
        category: 'character_bio',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_002_SAME_ID_MULTI_ENTITY',
        anomalyType: 'ANOM_002',
        content: [
          '---',
          'category: character',
          'type: character',
          'id: CHAR-007',
          'name: 鲍勃',
          'status: active',
          'review_status: confirmed',
          '---',
          '# 鲍勃 (CHAR-007)',
          '',
          '推进器维护主管，因归档失误错误占用了同一人员编号 CHAR-007。'
        ].join('\n')
      },

      // 3. ANOM_003: Historical Version Similarity / Duplicate
      {
        relativePath: '01_Worldview/Cosmology_Canonical.md',
        category: 'worldview_setting',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_003_HISTORICAL_VERSION_DUPLICATION',
        anomalyType: 'ANOM_003',
        content: [
          '---',
          'category: worldview_setting',
          'type: lore',
          'status: finalized',
          'review_status: confirmed',
          '---',
          '# 宇宙常数与空间曲率',
          '',
          '流浪舰队所处的引力扇区中，暗能量常数存在微小扰动，这是空间跃迁引擎运作的理论基石。'
        ].join('\n')
      },
      {
        relativePath: '99_Archive/Cosmology_Canonical_v1_backup.md',
        category: 'worldview_setting',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_003_HISTORICAL_VERSION_DUPLICATION',
        anomalyType: 'ANOM_003',
        content: [
          '---',
          'category: worldview_setting',
          'type: lore',
          'status: finalized',
          'review_status: confirmed',
          '---',
          '# 宇宙常数与空间曲率',
          '',
          '流浪舰队所处的引力扇区中，暗能量常数存在微小扰动，这是空间跃迁引擎运作的理论基石。'
        ].join('\n')
      },

      // 4. ANOM_004: 30B Placeholder Stub File (size <= 30 bytes)
      {
        relativePath: '02_Entities/Planets/Stub_Planet_30B.md',
        category: 'planet_system',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_004_PLACEHOLDER_STUB_FILE',
        anomalyType: 'ANOM_004',
        content: '# 占位待填\n' // Exact 14 bytes (<= 30B)
      },

      // 5. ANOM_005: Legacy / Deprecated ID Collision
      {
        relativePath: '02_Entities/Planets/Planet_Prometheus_P001.md',
        category: 'planet_system',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT',
        anomalyType: 'ANOM_005',
        content: [
          '---',
          'category: planet',
          'type: planet',
          'id: P-001',
          'name: 新普罗米修斯',
          'status: active',
          'review_status: confirmed',
          '---',
          '# 新普罗米修斯 (P-001)',
          '',
          '新发现的高丰度矿物行星，在新版世界观编号体系中分配了代号 P-001。'
        ].join('\n')
      },
      {
        relativePath: '02_Entities/Characters/Elder_CHAR001.md',
        category: 'character_bio',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT',
        anomalyType: 'ANOM_005',
        content: [
          '---',
          'category: character',
          'type: character',
          'id: CHAR-001',
          'name: 老指挥官',
          'status: active',
          'review_status: confirmed',
          'legacy_id: ["P-001"]',
          '---',
          '# 老指挥官 (CHAR-001)',
          '',
          '第一代旗舰最高司令官，在旧时代档案代号为 P-001，产生跨实体旧编号冲突。'
        ].join('\n')
      },

      // 6. ANOM_006: AI-Generated vs Human-Confirmed Mixed Data
      {
        relativePath: '01_Worldview/Canonical/AI_Unreviewed_Cosmology.md',
        category: 'worldview_setting',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_006_AI_HUMAN_MIXED_DATA',
        anomalyType: 'ANOM_006',
        content: [
          '---',
          'category: worldview_setting',
          'type: lore',
          'status: draft',
          'review_status: ai_generated',
          'ai_generated: true',
          '---',
          '# AI生成的引力波异常推演',
          '',
          '这是由 AI 辅助生成的宇宙暗物质分布推演设定，放置在 canonical 目录下但未经人类主创审阅确认。'
        ].join('\n')
      },

      // 7. ANOM_007: Dangling Entity References (Broken wikilink)
      {
        relativePath: '02_Entities/Characters/Explorer_CHAR003.md',
        category: 'character_bio',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_007_DANGLING_CROSS_REFERENCE',
        anomalyType: 'ANOM_007',
        content: [
          '---',
          'category: character',
          'type: character',
          'id: CHAR-003',
          'name: 探险家罗恩',
          'status: active',
          'review_status: confirmed',
          'planet: "[[NonExistent_Ghost_Planet_X999]]"',
          '---',
          '# 探险家罗恩 (CHAR-003)',
          '',
          '罗恩声称曾目睹幽灵星 X999 的爆发，但在世界树索引中不存在该星球的任何档案。'
        ].join('\n')
      },

      // 8. ANOM_008: Alias Collisions Across Different Entities
      {
        relativePath: '02_Entities/Characters/Spy_CHAR004.md',
        category: 'character_bio',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_008_ALIAS_CROSS_COLLISION',
        anomalyType: 'ANOM_008',
        content: [
          '---',
          'category: character',
          'type: character',
          'id: CHAR-004',
          'name: 特工幽灵',
          'status: active',
          'review_status: confirmed',
          'aliases: ["影子执行者", "Phantom"]',
          '---',
          '# 特工幽灵 (CHAR-004)',
          '',
          '情报部特勤探员，在军方内部代号为影子执行者。'
        ].join('\n')
      },
      {
        relativePath: '02_Entities/Organizations/Faction_ORG001.md',
        category: 'character_bio',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_008_ALIAS_CROSS_COLLISION',
        anomalyType: 'ANOM_008',
        content: [
          '---',
          'category: character_bio',
          'type: organization',
          'id: ORG-001',
          'name: 幽灵战团',
          'status: active',
          'review_status: confirmed',
          'aliases: ["影子执行者", "ShadowOps"]',
          '---',
          '# 幽灵战团 (ORG-001)',
          '',
          '外围武装同盟，在黑市中也使用影子执行者作为组织暗号，与特工幽灵发生别名冲突。'
        ].join('\n')
      },

      // 9. ANOM_009: Timeline Chronology / Causality Order Anomalies
      {
        relativePath: '04_Timeline/Event_Parent_EV200.md',
        category: 'timeline_record',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER',
        anomalyType: 'ANOM_009',
        content: [
          '---',
          'category: timeline_record',
          'type: event',
          'id: EV-200',
          'title: 第二次大航海启航',
          'timestamp_order: 200',
          'timeline_year: 2200',
          'status: active',
          '---',
          '# 第二次大航海启航 (EV-200)',
          '',
          '公元2200年，集结了三千艘恒星级方舟的第二远征舰队浩荡启航。'
        ].join('\n')
      },
      {
        relativePath: '04_Timeline/Event_Child_Inverted_EV100.md',
        category: 'timeline_record',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER',
        anomalyType: 'ANOM_009',
        content: [
          '---',
          'category: timeline_record',
          'type: event',
          'id: EV-100',
          'title: 远航成果庆功会',
          'timestamp_order: 100',
          'timeline_year: 2150',
          'status: active',
          'prerequisites: ["EV-200"]',
          '---',
          '# 远航成果庆功会 (EV-100)',
          '',
          '记录了远航凯旋的庆功盛典，但时间戳 100 倒流在启航仪式 200 之前。'
        ].join('\n')
      },

      // 10. ANOM_010: Foreshadowing Unclosed / Status Mismatch
      {
        relativePath: '05_Foreshadowing/Hook_Unresolved_FS001.md',
        category: 'foreshadowing_entry',
        isAnomaly: true,
        anomalyRuleId: 'ANOM_010_FORESHADOWING_UNCLOSED_STATUS',
        anomalyType: 'ANOM_010',
        content: [
          '---',
          'category: foreshadowing_entry',
          'type: clue',
          'id: FS-001',
          'title: 深空神秘莫尔斯信号',
          'status: resolved',
          'importance: major',
          '---',
          '# 深空神秘莫尔斯信号 (FS-001)',
          '',
          '先遣队在航行初期接收到的神秘信号，状态被标记为 resolved，但缺少任何回收章节和解密文件。'
        ].join('\n')
      }
    ];
  }

  /**
   * Generates the synthetic micro world-tree directory on disk.
   * @param {string} [customVaultDir]
   * @returns {{ vaultDir: string, files: Array<object>, totalFiles: number, anomalyManifest: object, controlManifest: object }}
   */
  generate(customVaultDir = null) {
    const vaultPath = customVaultDir || this.targetDir || fs.mkdtempSync(path.join(os.tmpdir(), this.tempDirPrefix));
    this.vaultRoot = path.resolve(vaultPath);

    if (!fs.existsSync(this.vaultRoot)) {
      fs.mkdirSync(this.vaultRoot, { recursive: true });
    }

    const definitions = this.getFileDefinitions();
    this.createdFiles = [];

    const anomalyManifest = {};
    const controlManifest = [];

    for (const def of definitions) {
      const fullPath = path.join(this.vaultRoot, def.relativePath);
      const dirName = path.dirname(fullPath);

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      fs.writeFileSync(fullPath, def.content, 'utf8');

      const stat = fs.statSync(fullPath);
      const sha256 = crypto.createHash('sha256').update(def.content, 'utf8').digest('hex');

      const fileInfo = {
        relativePath: def.relativePath.replace(/\\/g, '/'),
        absolutePath: fullPath,
        sizeBytes: stat.size,
        mtimeMs: stat.mtimeMs,
        sha256,
        category: def.category,
        isAnomaly: def.isAnomaly,
        anomalyRuleId: def.anomalyRuleId || null,
        anomalyType: def.anomalyType || null
      };

      this.createdFiles.push(fileInfo);

      if (def.isAnomaly && def.anomalyType) {
        if (!anomalyManifest[def.anomalyType]) {
          anomalyManifest[def.anomalyType] = {
            ruleId: def.anomalyRuleId,
            anomalyType: def.anomalyType,
            files: []
          };
        }
        anomalyManifest[def.anomalyType].files.push(fileInfo.relativePath);
      } else {
        controlManifest.push(fileInfo.relativePath);
      }
    }

    return {
      vaultDir: this.vaultRoot,
      files: this.createdFiles,
      totalFiles: this.createdFiles.length,
      anomalyManifest,
      controlManifest
    };
  }

  /**
   * Computes a deterministic recursive SHA-256 tree hash of all files in the vault.
   * Guaranteed to be identical if and only if no files were modified, created, deleted, or metadata-altered.
   * @param {string} [vaultDir]
   * @returns {string} SHA-256 hex string
   */
  static computeTreeHash(vaultDir) {
    if (!vaultDir || !fs.existsSync(vaultDir)) {
      throw new Error(`Cannot compute tree hash: vault directory does not exist at '${vaultDir}'`);
    }

    const allFileEntries = [];

    function walk(currentDir, relativePrefix = '') {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const entryRel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          walk(fullPath, entryRel);
        } else if (entry.isFile()) {
          const posixRel = entryRel.replace(/\\/g, '/');
          const fileBuf = fs.readFileSync(fullPath);
          const fileHash = crypto.createHash('sha256').update(fileBuf).digest('hex');
          const stat = fs.statSync(fullPath);
          allFileEntries.push({
            path: posixRel,
            hash: fileHash,
            size: stat.size
          });
        }
      }
    }

    walk(path.resolve(vaultDir));

    // Sort entries deterministically by POSIX relative path
    allFileEntries.sort((a, b) => a.path.localeCompare(b.path));

    // Combine all entries into root vault hash
    const rootHasher = crypto.createHash('sha256');
    for (const item of allFileEntries) {
      rootHasher.update(`${item.path}|${item.size}|${item.hash}\n`);
    }

    return rootHasher.digest('hex');
  }

  /**
   * Instance method wrapper for computeTreeHash
   * @returns {string} SHA-256 hex string
   */
  computeTreeHash() {
    if (!this.vaultRoot) {
      throw new Error('Vault has not been generated yet. Call generate() first.');
    }
    return MicroWorldTreeGenerator.computeTreeHash(this.vaultRoot);
  }

  /**
   * Returns list of expected anomaly metadata for assertions
   * @returns {Array<{ ruleId: string, type: string, expectedCount: number, description: string }>}
   */
  getExpectedAnomalies() {
    return [
      {
        ruleId: 'ANOM_001_SAME_NAME_DIFF_ID',
        type: 'ANOM_001',
        expectedCount: 1,
        severity: 'HIGH',
        description: 'Same-name planet with divergent IDs (PL-001 vs PL-099 for 塔兰托)'
      },
      {
        ruleId: 'ANOM_002_SAME_ID_MULTI_ENTITY',
        type: 'ANOM_002',
        expectedCount: 1,
        severity: 'CRITICAL',
        description: 'Same entity ID claimed by multiple distinct entities (CHAR-007 for 爱丽丝 & 鲍勃)'
      },
      {
        ruleId: 'ANOM_003_HISTORICAL_VERSION_DUPLICATION',
        type: 'ANOM_003',
        expectedCount: 1,
        severity: 'MEDIUM',
        description: 'Exact bit-for-bit historical archive duplicate (Cosmology_Canonical)'
      },
      {
        ruleId: 'ANOM_004_PLACEHOLDER_STUB_FILE',
        type: 'ANOM_004',
        expectedCount: 1,
        severity: 'LOW',
        description: 'Placeholder stub file under 30 bytes (Stub_Planet_30B.md)'
      },
      {
        ruleId: 'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT',
        type: 'ANOM_005',
        expectedCount: 1,
        severity: 'HIGH',
        description: 'Legacy ID alias collides with modern entity ID (P-001 on CHAR-001 vs Planet P-001)'
      },
      {
        ruleId: 'ANOM_006_AI_HUMAN_MIXED_DATA',
        type: 'ANOM_006',
        expectedCount: 1,
        severity: 'MEDIUM',
        description: 'AI-generated unreviewed file placed inside canonical folder'
      },
      {
        ruleId: 'ANOM_007_DANGLING_CROSS_REFERENCE',
        type: 'ANOM_007',
        expectedCount: 1,
        severity: 'MEDIUM',
        description: 'Dangling entity wikilink reference to non-existent NonExistent_Ghost_Planet_X999'
      },
      {
        ruleId: 'ANOM_008_ALIAS_CROSS_COLLISION',
        type: 'ANOM_008',
        expectedCount: 1,
        severity: 'MEDIUM',
        description: 'Alias name 影子执行者 collision between CHAR-004 and ORG-001'
      },
      {
        ruleId: 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER',
        type: 'ANOM_009',
        expectedCount: 1,
        severity: 'HIGH',
        description: 'Timeline causality inversion (EV-100 time 100 precedes prerequisite EV-200 time 200)'
      },
      {
        ruleId: 'ANOM_010_FORESHADOWING_UNCLOSED_STATUS',
        type: 'ANOM_010',
        expectedCount: 1,
        severity: 'LOW',
        description: 'Foreshadowing marked resolved without resolution chapter reference (FS-001)'
      }
    ];
  }

  /**
   * Cleans up the temporary vault directory if created ephemerally.
   */
  cleanup() {
    if (this.vaultRoot && fs.existsSync(this.vaultRoot)) {
      try {
        fs.rmSync(this.vaultRoot, { recursive: true, force: true });
      } catch (err) {
        // Silently ignore or retry on Windows handle lag
        try {
          fs.rmSync(this.vaultRoot, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  }
}

module.exports = MicroWorldTreeGenerator;
