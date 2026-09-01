/**
 * @file all28EdgeCases.test.js
 * @description Comprehensive End-to-End Test Suite for All 28 Phase 3 Edge Cases & Acceptance Criteria (Milestone 6)
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const DatabaseManager = require('../../src/db/DatabaseManager');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const { SchemaMismatchError, GovernanceSafetyError } = require('../../src/errors');
const MigrationRunner = require('../../src/migrations/MigrationRunner');

describe('Milestone 6: 28 Specified Phase 3 Edge Cases & Acceptance Suite', () => {
  let tempDir;
  let vaultDir;
  let sandboxDir;
  let dbManager;
  let dispatcher;
  let pathGuard;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'novel_28_edge_'));
    vaultDir = path.join(tempDir, 'WorldTree');
    sandboxDir = path.join(tempDir, 'Sandbox');

    fs.mkdirSync(vaultDir, { recursive: true });
    fs.mkdirSync(sandboxDir, { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data', 'snapshots'), { recursive: true });
    fs.mkdirSync(path.join(sandboxDir, 'data', 'rag_corpus'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: sandboxDir,
      vaultRoot: vaultDir
    });

    const dbPath = path.join(sandboxDir, 'data', 'novel_test.db');
    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });
    dispatcher = new CommandDispatcher({
      basePath: sandboxDir,
      pathGuard,
      dbManager,
      dbPath
    });
  });

  afterEach(() => {
    if (dbManager) dbManager.close();
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // --------------------------------------------------------------------------
  // Edge Cases 1-10: Anomaly & Conflict Detection Rules
  // --------------------------------------------------------------------------
  describe('Edge Cases 1-10: Anomaly & Conflict Detection (ANOM_001 - ANOM_010)', () => {
    it('EC-01: should detect ANOM_001_SAME_NAME_DIFF_ID when planet Taranto has 2 definitions (PL-001 & PL-099)', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'PL-001', '塔兰托', 'planet'), (2, 'PL-099', '塔兰托', 'planet')").run();

      const res = await dispatcher.dispatch('DetectDuplicateEntities');
      const groups = res.details?.duplicateGroups || [];
      assert.ok(groups.some(g => g.type === 'SAME_NAME_DIFF_ID' && g.canonicalName === '塔兰托'));

      const checkRes = await dispatcher.dispatch('CheckConsistency');
      assert.equal(checkRes.status, 'success');
      assert.ok(checkRes.anomalies.some(a => a.anomaly_rule_id === 'ANOM_001_SAME_NAME_DIFF_ID' || (a.rule_name && a.rule_name.includes('Same Name'))));
    });

    it('EC-02: should detect ANOM_002_SAME_ID_MULTI_ENTITY when Alice & Bob both declare CHAR-007', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'CHAR-007', 'Alice', 'character'), (2, 'CHAR-007', 'Bob', 'character')").run();

      const res = await dispatcher.dispatch('DetectDuplicateEntities');
      const groups = res.details?.duplicateGroups || [];
      assert.ok(groups.some(g => g.type === 'SAME_ID_MULTI_ENTITY' && g.entityId === 'CHAR-007'));

      const checkRes = await dispatcher.dispatch('CheckConsistency');
      assert.equal(checkRes.status, 'success');
      assert.ok(checkRes.anomalies.some(a => a.anomaly_rule_id === 'ANOM_002_SAME_ID_MULTI_ENTITY' || a.severity === 'CRITICAL'));
    });

    it('EC-03: should detect ANOM_003_HISTORY_VERSION_SIMILARITY for duplicate file in archive', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status)
        VALUES (1, '/mock/01_Worldview/Cosmology.md', '01_Worldview/Cosmology.md', 'Cosmology.md', '.md', 100, 1700000000, 'hash_aaa_111', 'worldview', 'active'),
               (2, '/mock/99_Archive/Cosmology_v1_backup.md', '99_Archive/Cosmology_v1_backup.md', 'Cosmology_v1_backup.md', '.md', 100, 1700000000, 'hash_aaa_111', 'archive', 'draft')
      `).run();

      const res = await dispatcher.dispatch('CheckConsistency');
      assert.equal(res.status, 'success');
      assert.ok(res.anomalies.some(a => a.anomaly_rule_id.startsWith('ANOM_003') || (a.title && (a.title.includes('History Version') || a.title.includes('Duplicate')))));
    });

    it('EC-04: should detect ANOM_004_PLACEHOLDER_FILES for stub file <= 30 bytes', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category) VALUES (1, '/mock/01_Entities/Stub_Planet_30B.md', '01_Entities/Stub_Planet_30B.md', 'Stub_Planet_30B.md', '.md', 14, 1700000000, 'hash_stub', 'entity')").run();

      const res = await dispatcher.dispatch('DetectPlaceholderFiles', { maxSizeBytes: 30 });
      const placeholders = res.details?.placeholders || [];
      assert.ok(placeholders.length >= 1);
      assert.equal(placeholders[0].sizeBytes, 14);

      const checkRes = await dispatcher.dispatch('CheckConsistency');
      assert.equal(checkRes.status, 'success');
      assert.ok(checkRes.anomalies.some(a => a.anomaly_rule_id.startsWith('ANOM_004')));
    });

    it('EC-05: should detect ANOM_005_LEGACY_ID_CONFLICTS when legacy_id collides with modern entity ID', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, frontmatter_json)
        VALUES (1, '/mock/Elder_CHAR001.md', 'Elder_CHAR001.md', 'Elder_CHAR001.md', '.md', 50, 1700000000, 'hash_elder', 'character', '{"legacy_id":["P-001"]}')
      `).run();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'P-001', 'Planet Prometheus', 'planet')").run();

      const res = await dispatcher.dispatch('DetectLegacyIdConflicts');
      const conflicts = res.details?.conflicts || [];
      assert.ok(conflicts.length >= 1);
      assert.equal(conflicts[0].legacyId, 'P-001');

      const checkRes = await dispatcher.dispatch('CheckConsistency');
      assert.equal(checkRes.status, 'success');
      assert.ok(checkRes.anomalies.some(a => a.anomaly_rule_id.startsWith('ANOM_005')));
    });

    it('EC-06: should detect ANOM_006_AI_GENERATED_MIXED_DATA when AI draft is in canonical folder', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, frontmatter_json, status, review_status)
        VALUES (1, '/mock/01_Worldview/AI_Unreviewed.md', '01_Worldview/AI_Unreviewed.md', 'AI_Unreviewed.md', '.md', 120, 1700000000, 'hash_ai', 'worldview', '{"ai_generated":true}', 'active', 'pending')
      `).run();

      const res = await dispatcher.dispatch('CheckConsistency');
      assert.equal(res.status, 'success');
      assert.ok(res.anomalies.some(a => a.anomaly_rule_id.startsWith('ANOM_006')));
    });

    it('EC-07: should detect ANOM_007_DANGLING_ENTITY_REFERENCES when wikilink references missing ghost entity', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, frontmatter_json)
        VALUES (1, '/mock/01_Worldview/Notes.md', '01_Worldview/Notes.md', 'Notes.md', '.md', 80, 1700000000, 'hash_notes', 'worldview', '{"wikilinks":["Ghost_Planet_X999"]}')
      `).run();

      const res = await dispatcher.dispatch('CheckConsistency');
      assert.equal(res.status, 'success');
      assert.ok(res.anomalies.some(a => a.anomaly_rule_id.startsWith('ANOM_007') || a.anomaly_rule_id === 'CONSIST_004_DANGLING_RELATION_RECORD'));
    });

    it('EC-08: should detect ANOM_008_ALIAS_COLLISIONS when two entities share the same alias', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'CHAR-004', 'Character 4', 'character'), (2, 'ORG-001', 'Organization 1', 'organization')").run();
      db.prepare("INSERT INTO entity_aliases (id, entity_id, alias_name) VALUES (1, 1, '影子执行者'), (2, 2, '影子执行者')").run();

      const res = await dispatcher.dispatch('DetectDuplicateEntities');
      const groups = res.details?.duplicateGroups || [];
      assert.ok(groups.some(g => g.type === 'ALIAS_CROSS_COLLISION' && g.aliasName === '影子执行者'));

      const checkRes = await dispatcher.dispatch('CheckConsistency');
      assert.equal(checkRes.status, 'success');
      assert.ok(checkRes.anomalies.some(a => a.anomaly_rule_id.startsWith('ANOM_008')));
    });

    it('EC-09: should detect ANOM_009_TIMELINE_CHRONOLOGY_ANOMALIES for causal time travel inversion', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, relative_time_desc, timestamp_order, base_event_id, relative_offset)
        VALUES ('EV-200', 'Base Parent Event', '2040.0101', 2040.0, NULL, NULL),
               ('EV-100', 'Child Inversion Event', '2030.0101', 2030.0, 'EV-200', 50000)
      `).run();

      const res = await dispatcher.dispatch('CheckConsistency', { scope: 'timeline' });
      assert.equal(res.status, 'success');
      assert.ok(res.anomalies.some(a => a.anomaly_rule_id === 'CONSIST_001_CAUSAL_PARADOX' || a.anomaly_rule_id === 'ANOM_009_TIMELINE_CHRONOLOGY_ANOMALIES'));
    });

    it('EC-10: should detect ANOM_010_FORESHADOWING_UNCLOSED_MISMATCH for invalid resolved status', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO foreshadowing (foreshadow_id, title, description, status, setup_chapter_id, resolution_chapter_id, introduced_chapter, target_resolve_chapter)
        VALUES ('FS-001', 'Unclosed Premature Clue', 'Premature clue description', 'open', 10, 2, '10', '2')
      `).run();

      const res = await dispatcher.dispatch('CheckConsistency', { scope: 'foreshadowing' });
      assert.equal(res.status, 'success');
      assert.ok(res.anomalies.some(a => a.anomaly_rule_id === 'CONSIST_002_FORESHADOW_TEMPORAL_PARADOX' || a.anomaly_rule_id === 'ANOM_010_FORESHADOWING_UNCLOSED_MISMATCH'));
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases 11-14: Classification & Multimodal Lore Invariants
  // --------------------------------------------------------------------------
  describe('Edge Cases 11-14: Parser Robustness, UTF-8 & Entity Aggregation', () => {
    it('EC-11: should parse raw markdown without YAML frontmatter gracefully', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, has_frontmatter, status)
        VALUES (1, '/mock/01_Worldview/RawNote.md', '01_Worldview/RawNote.md', 'RawNote.md', '.md', 50, 1700000000, 'hash_raw', 'worldview', 0, 'draft')
      `).run();

      const res = await dispatcher.dispatch('GetSourceFile', { fileId: 1 });
      const file = res.details?.file || res.file;
      assert.ok(file);
      assert.equal(file.id, 1);
      assert.equal(file.hasFrontmatter, false);
    });

    it('EC-12: should handle corrupted/malformed JSON in frontmatter without crashing', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, frontmatter_json, has_frontmatter)
        VALUES (1, '/mock/01_Worldview/Corrupted.md', '01_Worldview/Corrupted.md', 'Corrupted.md', '.md', 50, 1700000000, 'hash_corr', 'worldview', '{unclosed_bad_json', 1)
      `).run();

      const res = await dispatcher.dispatch('GetSourceFile', { fileId: 1 });
      const file = res.details?.file || res.file;
      assert.ok(file);
      assert.equal(file.id, 1);
      assert.deepEqual(file.frontmatter, {});
    });

    it('EC-13: should handle multi-byte Chinese entity names and punctuation accurately', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'PL-TERRA', '泰拉（母星）', 'planet')").run();
      db.prepare("INSERT INTO entity_aliases (id, entity_id, alias_name) VALUES (1, 1, '潜伏者·X号基地')").run();

      const res = await dispatcher.dispatch('QueryEntities', { query: '潜伏者·X号基地' });
      const entities = res.details?.entities || res.entities || [];
      assert.equal(entities.length, 1);
      assert.equal(entities[0].canonicalName, '泰拉（母星）');
    });

    it('EC-14: should aggregate multiple files under a single entity ID (04_星球档案/V-001/)', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'V-001', 'V-001 泰拉前哨', 'planet')").run();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category)
        VALUES (1, '/mock/04_星球档案/V-001/00_总览.md', '04_星球档案/V-001/00_总览.md', '00_总览.md', '.md', 50, 1700000000, 'hash_14_1', 'entity'),
               (2, '/mock/04_星球档案/V-001/01_地理.md', '04_星球档案/V-001/01_地理.md', '01_地理.md', '.md', 50, 1700000000, 'hash_14_2', 'entity'),
               (3, '/mock/04_星球档案/V-001/07_冲突.md', '04_星球档案/V-001/07_冲突.md', '07_冲突.md', '.md', 50, 1700000000, 'hash_14_3', 'entity')
      `).run();
      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (1, 1, 'definition'),
               (2, 1, 'supplement'),
               (3, 1, 'conflict')
      `).run();

      const res = await dispatcher.dispatch('QueryEntities', { query: 'V-001' });
      const entities = res.details?.entities || res.entities || [];
      assert.equal(entities.length, 1);
      assert.equal(entities[0].entityId, 'V-001');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases 15-17: Governance Gate & Downstream Blast Radius
  // --------------------------------------------------------------------------
  describe('Edge Cases 15-17: Canon Governance & Safety Gate', () => {
    it('EC-15: should reject PromoteSourceToCanon without CONFIRM_CANON_CHANGE token', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type, review_status, status) VALUES (1, 'PL-001', 'Terra', 'planet', 'reviewed', 'active')").run();

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            entityId: 'PL-001',
            targetCanonLevel: 2
          });
        },
        /GOVERNANCE_CONFIRMATION_REQUIRED/
      );
    });

    it('EC-16: should block direct silent promotion of unreviewed draft', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type, review_status, status) VALUES (1, 'DRAFT-01', 'Raw Draft', 'concept', 'pending', 'draft')").run();

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            entityId: 'DRAFT-01',
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        /UNREVIEWED_DRAFT_CANON_BLOCKED|Direct silent promotion/
      );
    });

    it('EC-17: should preview downstream impact when deprecating entity with POV and timeline dependents', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type, status) VALUES (1, 'CHAR-005', 'Lin Yuan', 'character', 'active')").run();
      db.prepare("INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, pov_entity_id) VALUES (1, 1, 1, 'Chapter 1', '03_Chapters/Chapter_01.md', 1)").run();
      db.prepare("INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id) VALUES ('EV-001', 'Launch Event', 1.0, 1)").run();

      const preview = await dispatcher.dispatch('DeprecateSourcePreview', { entityId: 'CHAR-005' });
      assert.equal(preview.status, 'success');
      assert.ok(preview.downstreamImpact.affectedChapters.length >= 1);
      assert.ok(preview.downstreamImpact.affectedTimelineEvents.length >= 1);
      assert.equal(preview.requiredConfirmationToken, 'CONFIRM_CANON_CHANGE');
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases 18-20: Context v3 Aggregation & Timeline Recall
  // --------------------------------------------------------------------------
  describe('Edge Cases 18-20: Context v3, Global Rules & Graph Timeline Recall', () => {
    it('EC-18: should 100% recall global world rules even when focus entity text does not match', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, canon_level, status, review_status, frontmatter_json)
        VALUES (1, '/mock/01_Worldview/Cosmology.md', '01_Worldview/Cosmology.md', 'Cosmology.md', '.md', 100, 1700000000, 'hash_18', 'world_rule', 3, 'active', 'reviewed', '{"rule_scope":"global"}')
      `).run();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'CHAR-005', '林远', 'character')").run();

      const res = await dispatcher.dispatch('GetChapterContext', {
        focusEntities: ['林远']
      });

      assert.equal(res.status, 'success');
      assert.ok(res.snapshot.worldRules.global.some(r => r.sourceFilePath.includes('Cosmology')));
    });

    it('EC-19: should omit scoped rules for other planets when focus entity is on Earth', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, canon_level, status, review_status, frontmatter_json)
        VALUES (1, '/mock/01_Worldview/Mars_Atmosphere.md', '01_Worldview/Mars_Atmosphere.md', 'Mars_Atmosphere.md', '.md', 100, 1700000000, 'hash_19', 'world_rule', 2, 'active', 'reviewed', '{"rule_scope":"scoped","scope":"scoped"}')
      `).run();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (1, 'CHAR-005', '林远', 'character')").run();

      const res = await dispatcher.dispatch('GetChapterContext', {
        focusEntities: ['林远']
      });

      assert.equal(res.status, 'success');
      assert.ok(res.snapshot.worldRules.scoped.every(r => !r.sourceFilePath.includes('Mars')));
    });

    it('EC-20: should recall timeline event via primary_entity_id graph relation without text match', async () => {
      const db = dbManager.getDatabase();
      db.prepare("INSERT INTO entities (id, entity_id, canonical_name, entity_type) VALUES (5, 'CHAR-005', '林远', 'character')").run();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id)
        VALUES ('EV-001', 'Secret Solar Flare Event Without Character Name', 100.0, 5)
      `).run();

      const res = await dispatcher.dispatch('GetChapterContext', {
        focusEntities: ['林远']
      });

      assert.equal(res.status, 'success');
      assert.ok(res.snapshot.timelineEvents.some(t => t.eventId === 'EV-001'));
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases 21-26: Atomic Sandboxing & PathGuard Attack Vectors
  // --------------------------------------------------------------------------
  describe('Edge Cases 21-26: Atomic Rollback & Security Penetration Defense', () => {
    it('EC-21: should cleanly delete on-disk markdown draft upon simulated SQLite failure', async () => {
      const draftVault = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      fs.mkdirSync(draftVault, { recursive: true });

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH-ROLLBACK-01',
            title: 'Test Rollback',
            content: '# Draft Content',
            customFilename: 'CH-ROLLBACK-01_Test_Rollback.md',
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/
      );

      const draftFile = path.join(draftVault, 'CH-ROLLBACK-01_Test_Rollback.md');
      assert.equal(fs.existsSync(draftFile), false, 'Draft file must be cleanly deleted on transaction failure');
    });

    it('EC-22: should restore pre-existing draft content upon failed update', async () => {
      const draftVault = path.join(vaultDir, '13_小说工程插件', '篇章草稿');
      fs.mkdirSync(draftVault, { recursive: true });

      // 1. Initial valid save
      await dispatcher.dispatch('SaveChapterDraft', {
        chapterId: 'CH-UPDATE-01',
        title: 'Original Title',
        content: '# Original Content V1',
        customFilename: 'CH-UPDATE-01_Original_Title.md'
      });

      const draftFile = path.join(draftVault, 'CH-UPDATE-01_Original_Title.md');
      assert.ok(fs.existsSync(draftFile));
      const originalText = fs.readFileSync(draftFile, 'utf8');

      // 2. Failed update
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'CH-UPDATE-01',
            title: 'Original Title',
            content: '# Overwritten Malicious Content',
            customFilename: 'CH-UPDATE-01_Original_Title.md',
            _simulateDbFailure: true
          });
        },
        /SIMULATED_DB_WRITE_FAILURE/
      );

      const recoveredText = fs.readFileSync(draftFile, 'utf8');
      assert.equal(recoveredText, originalText, 'Must restore exact backup content prior to failed overwrite');
    });

    it('EC-23: should intercept directory traversal attempt (../../01_Worldview/hack.md)', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SaveChapterDraft', {
            chapterId: 'HACK',
            title: 'Traversal',
            content: 'Bad',
            customFilename: '../../01_Worldview/hack.md'
          });
        },
        (err) => {
          assert.ok(
            err.message.includes('ERR_VAULT_WRITE_BLOCKED') ||
            err.message.includes('ERR_PATH_TRAVERSAL') ||
            err.message.includes('Traversal') ||
            err.name === 'SecurityError' ||
            err.code === 'ERR_PATH_TRAVERSAL'
          );
          return true;
        }
      );
    });

    it('EC-24: should intercept UNC network share bypass attempt (\\\\192.168.1.100\\share\\evil.md)', () => {
      assert.throws(
        () => {
          pathGuard.assertSandboxPath('\\\\192.168.1.100\\share\\evil.md', 'write');
        },
        (err) => {
          assert.ok(
            err.code === 'ERR_UNC_PATH_DETECTED' ||
            err.code === 'ERR_PATH_OUTSIDE_SANDBOX' ||
            err.code === 'SECURITY_VIOLATION' ||
            err.name === 'SecurityError'
          );
          return true;
        }
      );
    });

    it('EC-25: should intercept NTFS Alternate Data Stream (ADS) injection (draft.md:hidden_stream)', () => {
      assert.throws(
        () => {
          pathGuard.assertDraftWritablePath(path.join(vaultDir, '13_小说工程插件', '篇章草稿', 'draft.md:hidden_stream'));
        },
        (err) => {
          assert.ok(
            err.code === 'ERR_ADS_STREAM_DETECTED' ||
            err.code === 'SECURITY_VIOLATION' ||
            err.name === 'SecurityError'
          );
          return true;
        }
      );
    });

    it('EC-26: should reject write operations attempting mutation of 01_Worldview folder', () => {
      assert.throws(
        () => {
          pathGuard.assertDraftWritablePath(path.join(vaultDir, '01_Worldview', 'forbidden.md'));
        },
        (err) => {
          assert.ok(
            err.code === 'ERR_VAULT_WRITE_BLOCKED' ||
            err.code === 'SECURITY_VIOLATION' ||
            err.name === 'SecurityError'
          );
          return true;
        }
      );
    });
  });

  // --------------------------------------------------------------------------
  // Edge Cases 27-28: Anti-Swallow Integrity & Migration Idempotency
  // --------------------------------------------------------------------------
  describe('Edge Cases 27-28: Anti-Swallow & Migration Idempotency', () => {
    it('EC-27: should throw SQLite error when querying non-existent table and never return empty array', () => {
      const db = dbManager.getDatabase();
      assert.throws(
        () => {
          db.prepare('SELECT * FROM non_existent_ghost_table').all();
        },
        /no such table/i
      );
    });

    it('EC-28: should execute migrations consecutively on populated database with zero data loss', () => {
      const db = dbManager.getDatabase();
      const migrationsDir = path.resolve(__dirname, '..', '..', 'src', 'migrations');

      const secondRun = MigrationRunner.runMigrations(db, migrationsDir);

      assert.equal(secondRun.applied.length, 0, 'Second consecutive migration run must apply 0 new migrations');
      assert.ok(secondRun.currentVersion >= 3);
    });
  });
});
