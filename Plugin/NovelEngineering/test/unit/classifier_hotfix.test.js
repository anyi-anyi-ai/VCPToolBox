/**
 * @file classifier_hotfix.test.js
 * @description Comprehensive unit test suite for Phase 1.5 Entity ID Fallback Hotfix
 * @module test/unit/classifier_hotfix
 * @license MIT
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');

const FileClassifier = require('../../src/scanner/FileClassifier');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('Phase 1.5 Hotfix: Entity ID Fallback Disambiguation Suite', () => {

  // =========================================================================
  // Tier 1: Core Fallback ID Format & Uniqueness
  // =========================================================================
  describe('Tier 1: Core Fallback ID Format & Uniqueness', () => {

    it('F1-T1.1: should generate distinct entity IDs for identical filenames in different subdirectories', () => {
      const pathA = '09_Reference/CategoryA/00_Summary.md';
      const pathB = '09_Reference/CategoryB/00_Summary.md';

      const fileA = FileClassifier.classify({
        relativePath: pathA,
        fileName: '00_Summary.md',
        rawContent: '---\ncategory: entity\n---\n# Faction Summary A\nOverview of CategoryA.'
      });

      const fileB = FileClassifier.classify({
        relativePath: pathB,
        fileName: '00_Summary.md',
        rawContent: '---\ncategory: entity\n---\n# Faction Summary B\nOverview of CategoryB.'
      });

      assert.ok(fileA.entity, 'fileA should have an extracted entity');
      assert.ok(fileB.entity, 'fileB should have an extracted entity');
      assert.notEqual(fileA.entity.entity_id, fileB.entity.entity_id, 'Entity IDs for identical filenames in distinct folders MUST NOT collide');

      // Assert structure: contains parent folder and base name
      assert.ok(fileA.entity.entity_id.includes('00_Summary'), 'Entity ID should contain base filename');
      assert.ok(fileB.entity.entity_id.includes('00_Summary'), 'Entity ID should contain base filename');
      assert.ok(fileA.entity.entity_id.includes('CategoryA'), 'Entity ID should contain parent folder name');
    });

    it('F1-T1.2: should produce deterministic entity IDs on repeated classification of the same relative path', () => {
      const relPath = '02_Entities/Planets/Overview.md';

      const run1 = FileClassifier.classify({
        relativePath: relPath,
        fileName: 'Overview.md',
        rawContent: '# Planet Overview\nVersion 1 body content.'
      });

      const run2 = FileClassifier.classify({
        relativePath: relPath,
        fileName: 'Overview.md',
        rawContent: '# Planet Overview\nVersion 2 body content with modifications.'
      });

      assert.ok(run1.entity);
      assert.ok(run2.entity);
      assert.equal(run1.entity.entity_id, run2.entity.entity_id, 'Fallback entity ID must be strictly deterministic across re-indexing runs');
    });

    it('F1-T1.3: should prioritize explicit YAML frontmatter id over fallback generation', () => {
      const res = FileClassifier.classify({
        relativePath: '02_Entities/Characters/Alice.md',
        fileName: 'Alice.md',
        rawContent: [
          '---',
          'id: CHAR-007',
          'name: 爱丽丝',
          'category: character',
          '---',
          '# 爱丽丝'
        ].join('\n')
      });

      assert.ok(res.entity);
      assert.equal(res.entity.entity_id, 'CHAR-007', 'Explicit frontmatter id must take absolute precedence');
      assert.equal(res.entity.canonical_name, '爱丽丝');
    });

    it('F1-T1.4: should prioritize explicit YAML frontmatter code or entity_id over fallback generation', () => {
      const resCode = FileClassifier.classify({
        relativePath: '02_Entities/Planets/Taranto.md',
        fileName: 'Taranto.md',
        rawContent: [
          '---',
          'code: PLANET-001',
          'name: 塔兰托',
          'category: planet',
          '---',
          '# 塔兰托'
        ].join('\n')
      });

      assert.ok(resCode.entity);
      assert.equal(resCode.entity.entity_id, 'PLANET-001', 'Explicit frontmatter code must take precedence');

      const resEntityId = FileClassifier.classify({
        relativePath: '02_Entities/Organizations/PioneerGuild.md',
        fileName: 'PioneerGuild.md',
        rawContent: [
          '---',
          'entity_id: ORG-042',
          'name: 先驱者学会',
          'category: entity',
          'type: organization',
          '---',
          '# 先驱者学会'
        ].join('\n')
      });

      assert.ok(resEntityId.entity);
      assert.equal(resEntityId.entity.entity_id, 'ORG-042', 'Explicit frontmatter entity_id must take precedence');
    });

    it('F1-T1.5: should handle root-level files gracefully without invalid parent prefix', () => {
      const res = FileClassifier.classify({
        relativePath: 'RootOverview.md',
        fileName: 'RootOverview.md',
        frontmatter: { category: 'entity' },
        rawContent: '---\ncategory: entity\n---\n# Root Overview\nGlobal summary at root level.'
      });

      assert.ok(res.entity);
      assert.ok(!res.entity.entity_id.startsWith('._'), 'Root entity ID must not start with dot prefix');
      assert.ok(res.entity.entity_id.includes('RootOverview'), 'Root entity ID must include base name');
    });
  });

  // =========================================================================
  // Tier 2: Boundary, Character Sanitization & Path Edge Cases
  // =========================================================================
  describe('Tier 2: Boundary & Encoding Edge Cases', () => {

    it('F1-T2.1: should extract uppercase code pattern from filename when no frontmatter ID is present', () => {
      const res = FileClassifier.classify({
        relativePath: '02_Entities/Planets/Taranto_PLANET-001.md',
        fileName: 'Taranto_PLANET-001.md',
        rawContent: '# 塔兰托\n行星要塞。'
      });

      assert.ok(res.entity);
      assert.equal(res.entity.entity_id, 'PLANET-001', 'Filename with standard uppercase code pattern should extract code directly');
    });

    it('F1-T2.2: should sanitize special characters, spaces, and punctuation in filenames and parent directories', () => {
      const res = FileClassifier.classify({
        relativePath: '04_Planets/V-068 [Special]/05_势力档案 - 顶级势力 (A).md',
        fileName: '05_势力档案 - 顶级势力 (A).md',
        rawContent: '# 顶级势力A\n详细设定。'
      });

      assert.ok(res.entity);
      assert.ok(!res.entity.entity_id.includes('['), 'Entity ID must not contain unescaped brackets');
      assert.ok(!res.entity.entity_id.includes('('), 'Entity ID must not contain unescaped parentheses');
      assert.ok(!res.entity.entity_id.includes(' '), 'Entity ID must not contain spaces');
    });

    it('F1-T2.3: should produce identical fallback entity ID regardless of Windows backslash vs POSIX forward slash', () => {
      const resPosix = FileClassifier.classify({
        relativePath: '04_Planets/V-100/07_Factions/00_Summary.md',
        fileName: '00_Summary.md',
        rawContent: '# Summary'
      });

      const resWin = FileClassifier.classify({
        relativePath: '04_Planets\\V-100\\07_Factions\\00_Summary.md',
        fileName: '00_Summary.md',
        rawContent: '# Summary'
      });

      assert.ok(resPosix.entity);
      assert.ok(resWin.entity);
      assert.equal(resPosix.entity.entity_id, resWin.entity.entity_id, 'Normalized path hashes must be identical across Windows and POSIX separators');
    });

    it('F1-T2.4: should preserve Chinese characters in baseName and parentFolder while maintaining uniqueness', () => {
      const resA = FileClassifier.classify({
        relativePath: '09_世界观参考/苔原体系/00_星球总览.md',
        fileName: '00_星球总览.md',
        rawContent: '---\ncategory: entity\n---\n# 苔原星势力总览'
      });

      const resB = FileClassifier.classify({
        relativePath: '09_世界观参考/灰港体系/00_星球总览.md',
        fileName: '00_星球总览.md',
        rawContent: '---\ncategory: entity\n---\n# 灰港星势力总览'
      });

      assert.ok(resA.entity);
      assert.ok(resB.entity);
      assert.notEqual(resA.entity.entity_id, resB.entity.entity_id);
      assert.ok(resA.entity.entity_id.includes('00_星球总览'));
      assert.ok(resB.entity.entity_id.includes('00_星球总览'));
    });

    it('F1-T2.5: should preserve canonical name cleanly when fallback ID is used', () => {
      const res = FileClassifier.classify({
        relativePath: '02_Entities/Planets/深海之渊.md',
        fileName: '深海之渊.md',
        rawContent: '# 深海之渊\n高密度水行星。'
      });

      assert.ok(res.entity);
      assert.equal(res.entity.canonical_name, '深海之渊', 'Canonical name must not be mangled by fallback ID generation');
    });
  });

  // =========================================================================
  // Tier 3: Cross-Feature Database & Alias Compatibility
  // =========================================================================
  describe('Tier 3: Database & Alias Cross-Feature Compatibility', () => {
    let tempEnv = null;
    let dbManager = null;

    it('F1-T3.1: should insert entity with fallback ID into SQLite and retrieve by entity_id', () => {
      tempEnv = createTempDir('vcp_hotfix_db_');
      const dbPath = tempEnv.resolve('hotfix_test.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      // Create dummy source file
      const sourceFile = dbManager.sourceFiles.insert({
        file_path: tempEnv.resolve('mock_vault/04_Planets/V-001/07_Factions/00_Summary.md'),
        relative_path: '04_Planets/V-001/07_Factions/00_Summary.md',
        file_name: '00_Summary.md',
        extension: '.md',
        size_bytes: 100,
        mtime_ms: Date.now(),
        sha256_hash: crypto.createHash('sha256').update('test content').digest('hex'),
        source_category: 'planet_system',
        status: 'active',
        review_status: 'unreviewed'
      });

      const classification = FileClassifier.classify({
        relativePath: '04_Planets/V-001/07_Factions/00_Summary.md',
        fileName: '00_Summary.md',
        rawContent: '# Faction Summary'
      });

      const entityRecord = {
        ...classification.entity,
        source_file_id: sourceFile.id
      };

      const inserted = dbManager.entities.insert(entityRecord, classification.aliases);
      assert.ok(inserted);
      assert.ok(inserted.id > 0);

      const queried = dbManager.entities.getByEntityId(classification.entity.entity_id);
      assert.equal(queried.length, 1);
      assert.equal(queried[0].entity_id, classification.entity.entity_id);

      dbManager.close();
      tempEnv.cleanup();
    });

    it('F1-T3.2: should correctly bind aliases to entity with fallback ID', () => {
      tempEnv = createTempDir('vcp_hotfix_alias_');
      const dbPath = tempEnv.resolve('hotfix_alias.db');
      const pathGuard = new PathGuard({ pluginRoot: tempEnv.path });
      dbManager = new DatabaseManager(dbPath, { pathGuard });

      const sourceFile = dbManager.sourceFiles.insert({
        file_path: tempEnv.resolve('mock_vault/02_Entities/Planets/Unknown_Planet.md'),
        relative_path: '02_Entities/Planets/Unknown_Planet.md',
        file_name: 'Unknown_Planet.md',
        extension: '.md',
        size_bytes: 120,
        mtime_ms: Date.now(),
        sha256_hash: crypto.createHash('sha256').update('alias test').digest('hex'),
        source_category: 'planet_system',
        status: 'active',
        review_status: 'unreviewed'
      });

      const classification = FileClassifier.classify({
        relativePath: '02_Entities/Planets/Unknown_Planet.md',
        fileName: 'Unknown_Planet.md',
        rawContent: [
          '---',
          'name: 未知暗星',
          'aliases: ["暗星-09", "幽冥地"]',
          'category: planet',
          '---',
          '# 未知暗星'
        ].join('\n')
      });

      const entityRecord = {
        ...classification.entity,
        source_file_id: sourceFile.id
      };

      const inserted = dbManager.entities.insert(entityRecord, classification.aliases);
      assert.ok(inserted);

      const aliases = dbManager.entities.getAliasesForEntity(inserted.id);
      assert.equal(aliases.length, 2);
      const aliasNames = aliases.map(a => a.alias_name).sort();
      assert.deepEqual(aliasNames, ['幽冥地', '暗星-09']);

      dbManager.close();
      tempEnv.cleanup();
    });
  });

  // =========================================================================
  // Tier 4: Real-World 50-Planet Template Workload Stress
  // =========================================================================
  describe('Tier 4: Vault-Scale Multi-Template Workload Stress', () => {

    it('F1-T4.1: should guarantee zero collisions across 50 simulated identical template files', () => {
      const generatedIds = new Set();
      const totalTemplates = 50;

      for (let i = 1; i <= totalTemplates; i++) {
        const planetNum = String(i).padStart(3, '0');
        const relPath = `04_星球档案/V-${planetNum} 星球/07_势力体系/00_星球总览.md`;

        const res = FileClassifier.classify({
          relativePath: relPath,
          fileName: '00_星球总览.md',
          rawContent: `# V-${planetNum} 势力总览\n本星球总览档案。`
        });

        assert.ok(res.entity, `Planet V-${planetNum} must extract entity`);
        const id = res.entity.entity_id;

        assert.ok(!generatedIds.has(id), `Duplicate fallback entity ID detected for planet ${planetNum}: ${id}`);
        generatedIds.add(id);
      }

      assert.equal(generatedIds.size, totalTemplates, `All ${totalTemplates} template files must have distinct entity IDs`);
    });
  });
});
