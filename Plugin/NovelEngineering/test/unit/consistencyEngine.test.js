/**
 * @file consistencyEngine.test.js
 * @description Comprehensive unit, integration, and adversarial tests for Consistency Engine and Impact Analyzer (Milestone 3)
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const ConsistencyEngine = require('../../src/consistency/ConsistencyEngine');
const ImpactAnalyzer = require('../../src/consistency/ImpactAnalyzer');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { NovelError } = require('../../src/errors');

describe('Milestone 3: Worldbuilding Consistency Engine & Change Impact Analysis', () => {
  let dbManager;
  let dispatcher;
  let consistencyEngine;
  let impactAnalyzer;

  beforeEach(() => {
    dbManager = DatabaseManager.initDatabase(':memory:');
    dispatcher = new CommandDispatcher({ dbManager });
    consistencyEngine = new ConsistencyEngine(dbManager);
    impactAnalyzer = new ImpactAnalyzer(dbManager);

    const db = dbManager.getDatabase();

    // 1. Source Files Fixture
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, '/vault/01_Worldview/Cosmology.md', '01_Worldview/Cosmology.md', 'Cosmology.md', '.md', 1024, 1725000000000, 'hash1', 'world_rule', 'active', 'reviewed', 3, 500),
             (2, '/vault/04_Entities/Planets/Terra.md', '04_Entities/Planets/Terra.md', 'Terra.md', '.md', 2048, 1725000000000, 'hash2', 'planet', 'active', 'reviewed', 2, 800),
             (3, '/vault/04_Entities/Characters/LinYuan.md', '04_Entities/Characters/LinYuan.md', 'LinYuan.md', '.md', 1500, 1725000000000, 'hash3', 'character', 'active', 'reviewed', 2, 600),
             (4, '/vault/03_Chapters/Chapter_01.md', '03_Chapters/Chapter_01.md', 'Chapter_01.md', '.md', 8000, 1725000000000, 'hash4', 'chapter_text', 'active', 'reviewed', 2, 3000),
             (5, '/vault/04_Entities/Artifacts/OldRelic.md', '04_Entities/Artifacts/OldRelic.md', 'OldRelic.md', '.md', 600, 1725000000000, 'hash5', 'item', 'archived', 'pending', 0, 200),
             (6, '/vault/03_Chapters/Chapter_02_Draft.md', '03_Chapters/Chapter_02_Draft.md', 'Chapter_02_Draft.md', '.md', 4000, 1725000000000, 'hash6', 'chapter_text', 'draft', 'unreviewed', 0, 1500)
    `).run();

    // 2. Entities Fixture
    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, attributes_json, source_file_id)
      VALUES (1, 'ENT-TERRA', 'Terra Prime', 'planet', 'active', 'reviewed', 2, '{"gravity": 1.0, "faction": "Solar Alliance"}', 2),
             (2, 'ENT-LIN', 'Lin Yuan', 'character', 'active', 'reviewed', 2, '{"gender": "male", "faction": "Frontier Fleet"}', 3),
             (3, 'ENT-RELIC', 'Ancient Relic', 'item', 'archived', 'pending', 0, '{"origin": "Unknown"}', 5),
             (4, 'ENT-KAEL', 'Kael Voss', 'character', 'active', 'reviewed', 2, '{"gender": "male", "faction": "Rebel Corps"}', 3)
    `).run();

    // 3. File Entities Cross References
    db.prepare(`
      INSERT INTO file_entities (source_file_id, entity_id, mention_type, mention_count)
      VALUES (2, 1, 'definition', 1),
             (3, 2, 'definition', 1),
             (4, 2, 'primary_subject', 12),
             (4, 1, 'referenced', 4),
             (5, 3, 'definition', 1)
    `).run();

    // 4. Entity Relations
    db.prepare(`
      INSERT INTO entity_relations (id, source_entity_id, target_entity_id, relation_type, confidence, bidirectional, weight)
      VALUES (1, 2, 1, 'origin_planet', 0.95, 0, 1.0),
             (2, 2, 3, 'possesses_relic', 0.80, 0, 1.0),
             (3, 2, 4, 'ally_of', 0.90, 1, 1.0)
    `).run();

    // 5. Chapters
    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon, timeline_start, timeline_end)
      VALUES (1, 1, 1, 'Prologue of Terra', '03_Chapters/Chapter_01.md', 4, 2, 'published', 1, 2040.0, 2042.0),
             (2, 2, 1, 'The Relic Awakening', '03_Chapters/Chapter_02_Draft.md', 6, 2, 'draft', 0, 2045.0, 2046.0)
    `).run();

    // 6. Timeline Events
    db.prepare(`
      INSERT INTO timeline_events (event_id, title, era_epoch, timestamp_order, primary_entity_id, source_file_id, status, time_type, base_event_id, relative_offset, causality_prerequisite_ids_json)
      VALUES ('EVT-001', 'Fall of Old Terra', 'CE', 2042.0101, 1, 2, 'active', 'exact', NULL, NULL, NULL),
             ('EVT-002', 'Lin Yuan Discovers Relic', 'CE', 2040.0, 2, 4, 'active', 'relative', 'EVT-001', 100000, '["EVT-001"]')
    `).run();

    // 7. Foreshadowing
    db.prepare(`
      INSERT INTO foreshadowing (foreshadow_id, title, description, setup_chapter_id, resolution_chapter_id, introduced_chapter, actual_resolve_chapter, setup_file_id, status, importance_level, related_entities_json)
      VALUES ('FS-001', 'Secret Relic Activation', 'The relic has a secret celestial glow', 5, 2, '5', '2', 4, 'open', 'major', '["ENT-RELIC"]')
    `).run();
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // ===========================================================================
  // Category 1: Entity Attribute & Lifecycle Inconsistencies
  // ===========================================================================
  describe('Category 1: Entity Attribute & Lifecycle Inconsistencies', () => {
    it('T1.1: should detect duplicate Entity IDs across different files (ANOM_002)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, source_file_id)
        VALUES ('ENT-TERRA', 'Terra Duplicate Note', 'planet', 'active', 1)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const dup = result.anomalies.find(a => a.anomaly_rule_id === 'ANOM_002_SAME_ID_MULTI_ENTITIES' || a.anomaly_rule_id === 'ANOM_002_SAME_ID_MULTI_ENTITY' || a.anomaly_rule_id === 'ANOM_002');
      assert.ok(dup, 'Must detect duplicate entity_id collision');
      assert.equal(dup.severity, 'CRITICAL');
    });

    it('T1.2: should detect same entity name with differing IDs (ANOM_001)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, source_file_id)
        VALUES ('ENT-TERRA-ALT', 'Terra Prime', 'planet', 'active', 1)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const nameConflict = result.anomalies.find(a => a.anomaly_rule_id === 'ANOM_001_SAME_NAME_DIFF_ID' || a.anomaly_rule_id === 'ANOM_001');
      assert.ok(nameConflict, 'Must detect same canonical_name across different entity_ids');
    });

    it('T1.3: should detect conflicting attributes across entity definitions (CONSIST_ENTITY_ATTRIBUTE_CONFLICT)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, canon_level, attributes_json, source_file_id)
        VALUES ('ENT-LIN', 'Lin Yuan Draft Variant', 'character', 'active', 2, '{"gender": "female", "faction": "Dark Syndicate"}', 1)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const attrConflict = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_ENTITY_ATTRIBUTE_CONFLICT');
      assert.ok(attrConflict, 'Must detect conflicting attributes in ENT-LIN across notes');
      assert.ok(attrConflict.message.includes('faction') || attrConflict.message.includes('gender'));
      assert.equal(attrConflict.severity, 'CRITICAL');
    });

    it('T1.4: should detect post-mortem activity paradox for deceased entity (CONSIST_ENTITY_LIFECYCLE_PARADOX)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, attributes_json)
        VALUES (10, 'ENT-DECEASED', 'General Vance', 'character', 'deceased', '{"death_time": 2030.0}')
      `).run();

      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status)
        VALUES ('EVT-999', 'General Vance Leads Charge', 2050.0, 10, 'active')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const paradox = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_ENTITY_LIFECYCLE_PARADOX');
      assert.ok(paradox, 'Must detect post-mortem timeline event');
      assert.equal(paradox.severity, 'CRITICAL');
    });

    it('T1.5: should detect dangling relation records and relations to archived entities (CONSIST_004, CONSIST_005)', () => {
      const db = dbManager.getDatabase();
      // Insert dangling relation pointing to non-existent entity dbId 9999 with foreign keys temporarily OFF
      db.pragma('foreign_keys = OFF');
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (1, 9999, 'controls')
      `).run();
      db.pragma('foreign_keys = ON');

      const result = consistencyEngine.checkConsistency({ scope: 'relations' });
      const dangling = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_004_DANGLING_RELATION_RECORD');
      assert.ok(dangling, 'Must detect dangling relation record pointing to non-existent ID 9999');
      assert.equal(dangling.severity, 'CRITICAL');

      const archivedLink = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_005_RELATION_ARCHIVED_ENDPOINT');
      assert.ok(archivedLink, 'Must detect relation #2 linking archived ENT-RELIC');
      assert.equal(archivedLink.severity, 'LOW');
    });

    it('T1.6: should detect contradictory relations and invalid self-references', () => {
      const db = dbManager.getDatabase();
      // Contradictory ally_of and hostile_to between ENT-LIN (2) and ENT-KAEL (4)
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (2, 4, 'hostile_to')
      `).run();

      // Invalid self-relation
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (2, 2, 'parent_of')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'relations' });
      const semanticConflict = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_RELATION_SEMANTIC_CONFLICT');
      assert.ok(semanticConflict, 'Must detect contradictory ally_of and hostile_to relations');

      const selfRef = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_RELATION_INVALID_SELF');
      assert.ok(selfRef, 'Must detect invalid self-referential parent_of relation');
    });
  });

  // ===========================================================================
  // Category 2: Timeline Causal Paradoxes & Sequencing Errors
  // ===========================================================================
  describe('Category 2: Timeline Causal Paradoxes & Sequencing Errors', () => {
    it('T2.1: should detect relative offset chronological inversion (CONSIST_001_CAUSAL_PARADOX)', () => {
      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const causal = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_001_CAUSAL_PARADOX');
      assert.ok(causal, 'Must detect EVT-002 occurring before EVT-001 despite positive relative offset');
      assert.equal(causal.severity, 'CRITICAL');
    });

    it('T2.2: should detect circular causal loops via 3-color DFS (CONSIST_TIMELINE_CAUSAL_CYCLE)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, causality_prerequisite_ids_json)
        VALUES ('EVT-A', 'Event Alpha', 2010.0, '["EVT-C"]'),
               ('EVT-B', 'Event Beta', 2020.0, '["EVT-A"]'),
               ('EVT-C', 'Event Gamma', 2030.0, '["EVT-B"]')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const cycle = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE');
      assert.ok(cycle, 'Must detect causal dependency cycle EVT-A -> EVT-B -> EVT-C -> EVT-A');
      assert.equal(cycle.severity, 'CRITICAL');
    });

    it('T2.3: should detect chapter and interval timeline bounds inversions', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO chapters (chapter_number, title, relative_path, timeline_start, timeline_end)
        VALUES (99, 'Broken Bounds Chapter', '03_Chapters/Broken.md', 2050.0, 2030.0)
      `).run();

      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, time_type, interval_start, interval_end)
        VALUES ('EVT-INT-ERR', 'War Period', 2040.0, 'interval', 2055.0, 2045.0)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const chapInversion = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_CHAPTER_TIMELINE_INVERSION' || a.anomaly_rule_id === 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER');
      assert.ok(chapInversion, 'Must detect chapter timeline_start > timeline_end');

      const intervalInversion = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_INTERVAL_INVERSION');
      assert.ok(intervalInversion, 'Must detect interval_start > interval_end');
    });

    it('T2.4: should detect character bilocation paradox', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status)
        VALUES ('EVT-BILO-1', 'Lin Yuan in Capital City', 2044.0, 2, 'active'),
               ('EVT-BILO-2', 'Lin Yuan on Outer Rim Colony', 2044.0, 2, 'active')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const bilocation = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_BILOCATION_PARADOX');
      assert.ok(bilocation, 'Must detect same character participating in conflicting simultaneous events');
    });
  });

  // ===========================================================================
  // Category 3: Foreshadowing Lifecycle & Narrative Payoff Mismatches
  // ===========================================================================
  describe('Category 3: Foreshadowing Lifecycle & Narrative Payoff Mismatches', () => {
    it('T3.1: should detect foreshadowing resolved before setup (CONSIST_002_FORESHADOW_TEMPORAL_PARADOX)', () => {
      const result = consistencyEngine.checkConsistency({ scope: 'foreshadowing' });
      const paradox = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_002_FORESHADOW_TEMPORAL_PARADOX');
      assert.ok(paradox, 'Must detect FS-001 resolved in chapter 2 before setup in chapter 5');
      assert.equal(paradox.severity, 'HIGH');
    });

    it('T3.2: should detect open foreshadowing referencing archived entity (CONSIST_003_FORESHADOW_ARCHIVED_ENTITY)', () => {
      const result = consistencyEngine.checkConsistency({ scope: 'foreshadowing' });
      const archivedRef = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_003_FORESHADOW_ARCHIVED_ENTITY');
      assert.ok(archivedRef, 'Must detect FS-001 referencing archived ENT-RELIC');
      assert.equal(archivedRef.severity, 'MEDIUM');
    });

    it('T3.3: should detect overdue core climax / major foreshadowing (CONSIST_FORESHADOW_OVERDUE)', () => {
      const db = dbManager.getDatabase();
      // Current max chapter is 1, let's add completed chapters up to 10
      db.prepare(`
        INSERT INTO chapters (chapter_number, title, relative_path, status, canon)
        VALUES (10, 'The Final Gateway', '03_Chapters/Chapter_10.md', 'completed', 1)
      `).run();

      db.prepare(`
        INSERT INTO foreshadowing (foreshadow_id, title, description, setup_chapter_id, target_resolve_chapter, status, importance_level)
        VALUES ('FS-OVERDUE', 'The Prophecy of Kings', 'Ancient prophecy promise', 1, 3, 'open', 'core_climax')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'foreshadowing' });
      const overdue = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_FORESHADOW_OVERDUE');
      assert.ok(overdue, 'Must detect overdue core_climax clue targeted for Ch-3 when manuscript is at Ch-10');
      assert.equal(overdue.severity, 'HIGH');
    });
  });

  // ===========================================================================
  // Category 4: Blast Radius, Graph Traversal & Impact Scoring
  // ===========================================================================
  describe('Category 4: Blast Radius, Graph Traversal & Impact Scoring', () => {
    it('T4.1: should compute blast radius and CRITICAL rating on high-connectivity entity deprecation', () => {
      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-LIN',
        changeType: 'DEPRECATE'
      });

      assert.equal(impact.target.id, 'ENT-LIN');
      assert.equal(impact.target.type, 'entity');
      assert.equal(impact.changeType, 'DEPRECATE');
      assert.ok(impact.directRelations.length >= 3, 'Must identify 3 direct relations');
      assert.ok(impact.affectedChapters.length >= 2, 'Must cascade to linked POV chapters');
      assert.ok(impact.affectedTimelineEvents.length >= 1, 'Must cascade to timeline events');
      assert.ok(impact.blastRadiusScore >= 20, `Blast radius score should be substantial (${impact.blastRadiusScore})`);
      assert.ok(['HIGH', 'CRITICAL'].includes(impact.impactRating));
      assert.ok(impact.recommendations.length > 0);
      assert.ok(impact.recommendations.some(r => r.includes('snapshot') || r.includes('Snapshot')));
      assert.ok(impact.recommendations.some(r => r.includes('CONFIRM_CANON_CHANGE')));
    });

    it('T4.2: should compute LOW rating for isolated leaf entity modification', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
        VALUES (99, 'ENT-LEAF', 'Minor Merchant', 'character', 'active', 0)
      `).run();

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-LEAF',
        changeType: 'MODIFY'
      });

      assert.equal(impact.target.id, 'ENT-LEAF');
      assert.equal(impact.impactRating, 'LOW');
      assert.equal(impact.directRelations.length, 0);
      assert.ok(impact.blastRadiusScore < 8);
    });

    it('T4.3: should analyze source file change impact across defined entities, chapters, and setups', () => {
      const impact = impactAnalyzer.analyzeChangeImpact({
        filePath: '04_Entities/Planets/Terra.md',
        changeType: 'DEPRECATE'
      });

      assert.equal(impact.target.type, 'source_file');
      assert.ok(impact.affectedEntities.length >= 1);
      assert.ok(impact.affectedEntities.some(e => e.entityId === 'ENT-TERRA'));
      assert.equal(impact.changeType, 'DEPRECATE');
    });

    it('T4.4: should perform multi-hop graph traversal and compute secondDegreeRelations', () => {
      const db = dbManager.getDatabase();
      // Add 2nd hop from ENT-KAEL (4) to ENT-REBEL-BASE (50)
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
        VALUES (50, 'ENT-BASE', 'Secret Rebel Base', 'location', 'active', 1)
      `).run();

      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, confidence)
        VALUES (4, 50, 'located_in', 0.85)
      `).run();

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-LIN',
        maxDepth: 2
      });

      assert.ok(impact.secondDegreeRelations.length >= 1, 'Must discover 2nd-degree relation to ENT-BASE');
      const hop2 = impact.secondDegreeRelations.find(r => r.hopEntityId === 'ENT-BASE');
      assert.ok(hop2, 'Must include ENT-BASE in second degree relations');
      assert.equal(impact.traversalStats.maxDepthReached, 2);
    });
  });

  // ===========================================================================
  // Category 5: Persistence, Sessions & Filter Control
  // ===========================================================================
  describe('Category 5: Persistence, Sessions & Filter Control', () => {
    it('T5.1: should persist detected anomalies when persistToReports is true', () => {
      const testSessionId = `test_sess_${Date.now()}`;
      const result = consistencyEngine.checkConsistency({
        scope: 'all',
        persistToReports: true,
        scanSessionId: testSessionId
      });

      assert.ok(result.totalIssues > 0);

      const db = dbManager.getDatabase();
      const rows = db.prepare('SELECT * FROM anomaly_reports WHERE scan_session_id = ?').all(testSessionId);
      assert.equal(rows.length, result.totalIssues, 'All returned anomalies must be persisted to anomaly_reports table');
    });

    it('T5.2: should not insert records into anomaly_reports when persistToReports is false', () => {
      const testSessionId = `dryrun_sess_${Date.now()}`;
      const result = consistencyEngine.checkConsistency({
        scope: 'all',
        persistToReports: false,
        scanSessionId: testSessionId
      });

      assert.ok(result.totalIssues > 0);

      const db = dbManager.getDatabase();
      const rows = db.prepare('SELECT * FROM anomaly_reports WHERE scan_session_id = ?').all(testSessionId);
      assert.equal(rows.length, 0, 'Zero records must be inserted into anomaly_reports during dry-run');
    });

    it('T5.3: should filter consistency report by scope and severity threshold', () => {
      const result = consistencyEngine.checkConsistency({
        scope: 'timeline',
        severityThreshold: 'CRITICAL'
      });

      assert.equal(result.scope, 'timeline');
      assert.equal(result.severityThreshold, 'CRITICAL');
      for (const a of result.anomalies) {
        assert.equal(a.severity, 'CRITICAL');
      }
    });

    it('T5.4: should filter consistency report by target entityIds', () => {
      const result = consistencyEngine.checkConsistency({
        entityIds: ['ENT-RELIC']
      });

      assert.ok(result.totalIssues >= 1);
      for (const a of result.anomalies) {
        const affected = typeof a.affected_entity_ids_json === 'string'
          ? JSON.parse(a.affected_entity_ids_json)
          : a.affected_entity_ids_json;
        assert.ok(affected.includes('ENT-RELIC') || affected.includes('3'));
      }
    });
  });

  // ===========================================================================
  // Category 6: Error Handling & Protocol Envelope Validation
  // ===========================================================================
  describe('Category 6: Error Handling & Protocol Envelope Validation', () => {
    it('T6.1: should throw TARGET_NOT_FOUND NovelError on missing target in ImpactAnalyzer', () => {
      assert.throws(
        () => impactAnalyzer.analyzeChangeImpact({ entityId: 'NON_EXISTENT_ID_9999' }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          return true;
        }
      );
    });

    it('T6.2: should throw INVALID_PARAMETER NovelError when DatabaseManager is omitted', () => {
      assert.throws(
        () => new ConsistencyEngine(null),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_PARAMETER');
          return true;
        }
      );

      assert.throws(
        () => new ImpactAnalyzer(null),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_PARAMETER');
          return true;
        }
      );
    });

    it('T6.3: should dispatch CheckConsistency via CommandDispatcher returning formatted envelope', async () => {
      const res = await dispatcher.dispatch('CheckConsistency', {
        scope: 'all',
        severityThreshold: 'INFO'
      });

      assert.equal(res.status, 'success');
      assert.ok(res.totalIssues >= 2);
      assert.ok(typeof res.content === 'string');
      assert.ok(res.content.includes('Worldbuilding Consistency Report'));
      assert.ok(res.details);
      assert.equal(res.details.totalIssues, res.totalIssues);
    });

    it('T6.4: should dispatch AnalyzeChangeImpact via CommandDispatcher returning formatted envelope', async () => {
      const res = await dispatcher.dispatch('AnalyzeChangeImpact', {
        entityId: 'ENT-LIN',
        changeType: 'DEPRECATE'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.target.id, 'ENT-LIN');
      assert.ok(typeof res.content === 'string');
      assert.ok(res.content.includes('Change Impact & Blast Radius Analysis'));
      assert.ok(res.blastRadiusScore > 0);
      assert.ok(res.recommendations.length > 0);
    });
  });
});
