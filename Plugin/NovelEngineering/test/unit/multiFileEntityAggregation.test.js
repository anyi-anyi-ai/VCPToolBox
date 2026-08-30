/**
 * @file multiFileEntityAggregation.test.js
 * @description Comprehensive unit test suite for multi-file directory anchor aggregation and facet role tagging
 * @module test/unit/multiFileEntityAggregation
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const DatabaseManager = require('../../src/db/DatabaseManager');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('Multi-File Entity Directory Anchor & Aggregation Suite', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let indexer = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_agg_test_');
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

  it('M1-AGG-01: should aggregate 5 sub-files under a planet dossier into exactly 1 canonical entity with correct facets', async () => {
    const planetDir = path.join(vaultDir, '04_星球档案', 'V-001 塔兰托');
    fs.mkdirSync(path.join(planetDir, '07_势力体系'), { recursive: true });

    fs.writeFileSync(
      path.join(planetDir, '00_星球总览.md'),
      '---\nname: 塔兰托\ncode: V-001\ntype: planet\naliases: [赤红要塞]\n---\n# 塔兰托\n行星总览描述：帝国边境重镇。'
    );
    fs.writeFileSync(
      path.join(planetDir, '01_地理生态.md'),
      '# 地理生态\n赤道覆盖高密度玄武岩熔岩平原。'
    );
    fs.writeFileSync(
      path.join(planetDir, '02_历史纪元.md'),
      '# 历史纪元\n新历42年建立前哨要塞。'
    );
    fs.writeFileSync(
      path.join(planetDir, '07_势力体系', '01_执政同盟.md'),
      '# 执政同盟\n总督府与星区驻军总部。'
    );
    fs.writeFileSync(
      path.join(planetDir, '07_势力体系', '02_黑水反抗军.md'),
      '# 黑水反抗军\n地下矿井游击组织。'
    );

    const summary = await indexer.sync();
    assert.equal(summary.totalFilesScanned, 5);
    assert.equal(summary.totalEntitiesExtracted, 1, 'Exactly 1 canonical entity must be extracted for V-001 dossier');

    // Verify entities table has 1 record
    const allEntities = dbManager.entities.getByEntityId('V-001');
    assert.equal(allEntities.length, 1, 'Should have exactly 1 entity record in entities table');
    const entity = allEntities[0];
    assert.equal(entity.entity_id, 'V-001');
    assert.equal(entity.canonical_name, '塔兰托');
    assert.equal(entity.entity_type, 'planet');

    // Verify file_entities table has 5 entries
    const entityWithFacets = dbManager.entities.getEntityWithFacets('V-001');
    assert.ok(entityWithFacets, 'Entity with facets must be found');
    assert.equal(entityWithFacets.linkedFiles.length, 5, 'Must link all 5 sub-files in file_entities');

    // Verify facets categorization
    assert.equal(entityWithFacets.facets.definition.length, 1, '00_星球总览.md must be definition facet');
    assert.ok(entityWithFacets.facets.definition[0].relative_path.includes('00_星球总览.md'));
    assert.equal(entityWithFacets.facets.supplement.length, 4, 'Remaining 4 sub-files must be supplement facets');
  });

  it('M1-AGG-02: should classify conflicted sub-files into the conflict facet bucket', async () => {
    const planetDir = path.join(vaultDir, '04_星球档案', 'V-042 荒原星');
    fs.mkdirSync(planetDir, { recursive: true });

    fs.writeFileSync(
      path.join(planetDir, '00_星球总览.md'),
      '---\nname: 荒原星\ncode: V-042\ntype: planet\n---\n# 荒原星\n沙漠行星。'
    );
    fs.writeFileSync(
      path.join(planetDir, '01_地理生态_conflict.md'),
      '# 地理生态 (冲突版)\n记载大气层含氧量为0%（与总览记载的12%矛盾）。'
    );
    fs.writeFileSync(
      path.join(planetDir, '02_历史_draft.md'),
      '---\nreview_status: conflicted\n---\n# 历史待定稿\n未定稿纪年。'
    );

    await indexer.sync();

    const entityWithFacets = dbManager.entities.getEntityWithFacets('V-042');
    assert.ok(entityWithFacets);
    assert.equal(entityWithFacets.facets.definition.length, 1);
    assert.equal(entityWithFacets.facets.conflict.length, 2, 'Both conflicted files must be classified into conflict facet');
  });

  it('M1-AGG-03: should scale efficiently across 50 planet dossiers (250 files) creating exactly 50 canonical entities', async () => {
    for (let i = 1; i <= 50; i++) {
      const code = `V-${String(i).padStart(3, '0')}`;
      const dir = path.join(vaultDir, '04_星球档案', `${code} 星球${i}`);
      fs.mkdirSync(path.join(dir, '07_势力'), { recursive: true });

      fs.writeFileSync(path.join(dir, '00_星球总览.md'), `# 星球${i}\n总览内容。`);
      fs.writeFileSync(path.join(dir, '01_地理生态.md'), `# 地理生态\n生态内容。`);
      fs.writeFileSync(path.join(dir, '02_资源矿产.md'), `# 资源矿产\n矿产内容。`);
      fs.writeFileSync(path.join(dir, '07_势力', '01_执政.md'), `# 执政机构\n执政内容。`);
      fs.writeFileSync(path.join(dir, '07_势力', '02_民间.md'), `# 民间机构\n民间内容。`);
    }

    const t0 = Date.now();
    const summary = await indexer.sync();
    const durationMs = Date.now() - t0;

    assert.equal(summary.totalFilesScanned, 250);
    assert.equal(summary.totalEntitiesExtracted, 50, 'Must extract exactly 50 canonical planet entities');
    assert.ok(durationMs < 10000, `250 files sync should execute rapidly (took ${durationMs}ms)`);

    const count = dbManager.entities.count({ entity_type: 'planet' });
    assert.equal(count, 50, 'Database entities table must contain exactly 50 planet records');

    const totalMentions = dbManager.prepare('SELECT COUNT(*) AS total FROM file_entities').get();
    assert.equal(totalMentions.total, 250, 'Database file_entities must contain exactly 250 linkages');
  });

  it('M1-AGG-04: should maintain backwards compatibility with standalone entity files', async () => {
    const standaloneDir = path.join(vaultDir, '02_Entities', 'Planets');
    fs.mkdirSync(standaloneDir, { recursive: true });

    fs.writeFileSync(
      path.join(standaloneDir, 'Taranto_PLANET-001.md'),
      '---\nname: 塔兰托要塞星\ncategory: planet\ntype: planet\n---\n# 塔兰托要塞星\n单文件独立星球记录。'
    );

    const summary = await indexer.sync();
    assert.equal(summary.totalFilesScanned, 1);
    assert.equal(summary.totalEntitiesExtracted, 1);

    const entity = dbManager.entities.getSingleByEntityId('PLANET-001');
    assert.ok(entity);
    assert.equal(entity.canonical_name, '塔兰托要塞星');
    assert.ok(entity.source_file_id > 0);

    const mentions = dbManager.entities.getMentionsByEntity(entity.id);
    assert.equal(mentions.length, 1);
    assert.equal(mentions[0].mention_type, 'definition');
  });

  it('M1-AGG-05: should incrementally update canonical entity fields when definition file is edited', async () => {
    const planetDir = path.join(vaultDir, '04_星球档案', 'V-001');
    fs.mkdirSync(planetDir, { recursive: true });

    const overviewPath = path.join(planetDir, '00_星球总览.md');
    fs.writeFileSync(overviewPath, '# 塔兰托\n初始版本描述。');
    fs.writeFileSync(path.join(planetDir, '01_地理生态.md'), '# 地理生态');

    await indexer.sync();
    const ent1 = dbManager.entities.getSingleByEntityId('V-001');
    assert.equal(ent1.summary, '初始版本描述。');

    // Update definition file
    fs.writeFileSync(overviewPath, '# 塔兰托 (新版)\n已更新的最新总览描述。');
    const updateSummary = await indexer.sync();
    assert.equal(updateSummary.filesUpdated, 1);

    const ent2 = dbManager.entities.getSingleByEntityId('V-001');
    assert.equal(ent2.summary, '已更新的最新总览描述。');
    assert.equal(ent2.id, ent1.id, 'Primary key DB ID must remain stable');
  });

  it('M1-AGG-06: should collect and bind aliases from multiple constituent files to the canonical entity', async () => {
    const planetDir = path.join(vaultDir, '04_星球档案', 'V-007 极光星');
    fs.mkdirSync(path.join(planetDir, '07_势力'), { recursive: true });

    fs.writeFileSync(
      path.join(planetDir, '00_星球总览.md'),
      '---\nname: 极光星\ncode: V-007\naliases: [极夜之都, 冰原星]\n---\n# 极光星'
    );
    fs.writeFileSync(
      path.join(planetDir, '07_势力', '01_冰盾卫队.md'),
      '---\naliases: [北方长城]\n---\n# 冰盾卫队'
    );

    await indexer.sync();

    const entity = dbManager.entities.getSingleByEntityId('V-007');
    assert.ok(entity);
    const aliasNames = (entity.aliases || []).map((a) => a.alias_name);
    assert.ok(aliasNames.includes('极夜之都'));
    assert.ok(aliasNames.includes('冰原星'));
    assert.ok(aliasNames.includes('北方长城'));
  });
});
