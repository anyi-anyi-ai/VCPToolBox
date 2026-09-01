/**
 * @file m3_adversarial_consistency.test.js
 * @description Adversarial False-Positive, Boundary, and Scoring Integrity Probe Suite for Milestone 3
 * Evaluates:
 * 1. Legitimate nonlinear timeline flashbacks (no false positive causal paradoxes)
 * 2. Valid symmetrical reciprocal relations vs invalid self-relations & semantic conflicts
 * 3. Impact Analyzer risk score stability and mathematical multiplier ordering across DEPRECATE, RENAME, PROMOTE, EDIT, CREATE
 * 4. Unresolvable target error handling (must throw typed NovelError with TARGET_NOT_FOUND)
 * 5. Multi-hop cyclic graph traversal resilience and discrete rating boundary stability
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const ConsistencyEngine = require('../../src/consistency/ConsistencyEngine');
const ImpactAnalyzer = require('../../src/consistency/ImpactAnalyzer');
const ConsistencyCommands = require('../../src/commands/ConsistencyCommands');
const { NovelError } = require('../../src/errors');

describe('Milestone 3 Adversarial & Boundary Probe Suite (m3_challenger_2_g2)', () => {
  let dbManager;
  let consistencyEngine;
  let impactAnalyzer;

  beforeEach(() => {
    dbManager = DatabaseManager.initDatabase(':memory:');
    consistencyEngine = new ConsistencyEngine(dbManager);
    impactAnalyzer = new ImpactAnalyzer(dbManager);

    const db = dbManager.getDatabase();

    // Base schema fixtures
    // 1. Source Files
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, '/vault/01_Worldview/Rules.md', '01_Worldview/Rules.md', 'Rules.md', '.md', 1000, 1725000000000, 'hash1', 'world_rule', 'active', 'reviewed', 3, 500),
             (2, '/vault/04_Entities/Characters/Hero.md', '04_Entities/Characters/Hero.md', 'Hero.md', '.md', 2000, 1725000000000, 'hash2', 'character', 'active', 'reviewed', 2, 800),
             (3, '/vault/04_Entities/Characters/Partner.md', '04_Entities/Characters/Partner.md', 'Partner.md', '.md', 2000, 1725000000000, 'hash3', 'character', 'active', 'reviewed', 2, 800),
             (4, '/vault/03_Chapters/Chapter_01.md', '03_Chapters/Chapter_01.md', 'Chapter_01.md', '.md', 5000, 1725000000000, 'hash4', 'chapter_text', 'active', 'reviewed', 2, 2000),
             (5, '/vault/03_Chapters/Chapter_02_Flashback.md', '03_Chapters/Chapter_02_Flashback.md', 'Chapter_02_Flashback.md', '.md', 4500, 1725000000000, 'hash5', 'chapter_text', 'active', 'reviewed', 2, 1800)
    `).run();

    // 2. Entities
    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, attributes_json, source_file_id)
      VALUES (1, 'ENT-HERO', 'Arthur Pendelton', 'character', 'active', 'reviewed', 2, '{"faction": "Solar Vanguard", "species": "human"}', 2),
             (2, 'ENT-PARTNER', 'Gwen Pendelton', 'character', 'active', 'reviewed', 2, '{"faction": "Solar Vanguard", "species": "human"}', 3),
             (3, 'ENT-RIVAL', 'Mordred Drake', 'character', 'active', 'reviewed', 2, '{"faction": "Shadow Syndicate", "species": "human"}', 2)
    `).run();

    // 3. File entities mentions
    db.prepare(`
      INSERT INTO file_entities (source_file_id, entity_id, mention_type, mention_count)
      VALUES (2, 1, 'definition', 1),
             (3, 2, 'definition', 1),
             (4, 1, 'primary_subject', 10),
             (5, 1, 'primary_subject', 8)
    `).run();
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // ===========================================================================
  // 1. Legitimate Nonlinear Timeline Flashbacks vs Causal Paradoxes
  // ===========================================================================
  describe('1. Legitimate Nonlinear Flashbacks & Narrative Anachronisms', () => {
    it('ADV-TIME-01: legitimate flashback events must NOT be falsely flagged as causal paradoxes', () => {
      const db = dbManager.getDatabase();

      // Insert Chronological Narrative Timeline:
      // Event 1: Present Day Battle (t = 2040.0, Chapter 1)
      // Event 2: Flashback Memory of Childhood (t = 2010.0, Chapter 2 flashback scene)
      // Event 3: Historical Origin Prelude (t = 1990.0)
      // Neither Event 2 nor Event 3 lists Event 1 as a causal prerequisite.
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, era_epoch, timestamp_order, primary_entity_id, source_file_id, status, time_type, base_event_id, relative_offset, causality_prerequisite_ids_json)
        VALUES ('EVT-PRESENT-01', 'Battle of New Terra', 'CE', 2040.0, 1, 4, 'active', 'exact', NULL, NULL, NULL),
               ('EVT-FLASHBACK-01', 'Hero Childhood Training', 'CE', 2010.0, 1, 5, 'active', 'flashback', NULL, NULL, NULL),
               ('EVT-ORIGIN-01', 'Founding of the Vanguard', 'CE', 1990.0, 1, 1, 'active', 'exact', NULL, NULL, NULL)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });

      // Ensure NO causal paradox or chronology cycle is raised for legitimate historical/flashback events
      const causalParadoxes = result.anomalies.filter(a =>
        a.anomaly_rule_id === 'CONSIST_001_CAUSAL_PARADOX' ||
        a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE' ||
        a.anomaly_rule_id === 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER' ||
        a.anomaly_type === 'CAUSAL_PARADOX'
      );

      assert.equal(causalParadoxes.length, 0, `Legitimate flashback events must not trigger causal paradoxes: ${JSON.stringify(causalParadoxes)}`);
      assert.equal(result.totalIssues, 0);
    });

    it('ADV-TIME-02: legitimate non-linear chapter narrative intervals must NOT trigger bounds inversion', () => {
      const db = dbManager.getDatabase();

      // Chapter 1 is set in present: 2040 - 2042
      // Chapter 2 is a dedicated flashback volume/chapter: 2010 - 2012
      // Chapter 3 returns to present: 2042 - 2045
      // Each chapter internally has timeline_start <= timeline_end
      db.prepare(`
        INSERT INTO chapters (chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon, timeline_start, timeline_end)
        VALUES (1, 1, 'The Gathering Storm', '03_Chapters/Chapter_01.md', 4, 1, 'published', 1, 2040.0, 2042.0),
               (2, 1, 'Memories of Youth', '03_Chapters/Chapter_02_Flashback.md', 5, 1, 'published', 1, 2010.0, 2012.0),
               (3, 1, 'The Counterattack', '03_Chapters/Chapter_03.md', 4, 1, 'published', 1, 2042.0, 2045.0)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });

      const boundsInversions = result.anomalies.filter(a =>
        a.anomaly_rule_id === 'CONSIST_CHAPTER_TIMELINE_INVERSION' ||
        a.anomaly_rule_id === 'CONSIST_TIMELINE_INTERVAL_INVERSION'
      );

      assert.equal(boundsInversions.length, 0, 'Flashback chapter order across book must not be falsely flagged as chapter interval inversion');
    });

    it('ADV-TIME-03: same character in distinct historical era events must NOT be flagged as bilocation', () => {
      const db = dbManager.getDatabase();

      // Same hero character Arthur in Year 2010 and Year 2040
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status)
        VALUES ('EVT-T1', 'Youth Academy Graduation', 2010.0501, 1, 'active'),
               ('EVT-T2', 'Grand Fleet Command', 2040.0815, 1, 'active')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });

      const bilocation = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_BILOCATION_PARADOX');
      assert.equal(bilocation.length, 0, 'Character at different timestamps must not be flagged as bilocation');
    });

    it('ADV-TIME-04: properly sequenced relative anchor events must pass validation cleanly', () => {
      const db = dbManager.getDatabase();

      // Event A: Base Anchor (t = 2000.0)
      // Event B: Relative (+10 years, t = 2010.0) -> Valid positive offset
      // Event C: Relative (-5 years, t = 1995.0) -> Valid negative offset
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status, time_type, base_event_id, relative_offset)
        VALUES ('EVT-BASE', 'Base Anchor Event', 2000.0, 1, 'active', 'exact', NULL, NULL),
               ('EVT-REL-POS', 'Ten Years Later', 2010.0, 1, 'active', 'relative', 'EVT-BASE', 10.0),
               ('EVT-REL-NEG', 'Five Years Prior', 1995.0, 1, 'active', 'relative', 'EVT-BASE', -5.0)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const causalIssues = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_001_CAUSAL_PARADOX');
      assert.equal(causalIssues.length, 0, 'Correctly sequenced relative offset events must produce 0 causal paradoxes');
    });
  });

  // ===========================================================================
  // 2. Symmetrical Relations vs Invalid Self-Relations & Semantic Conflicts
  // ===========================================================================
  describe('2. Symmetrical Reciprocal Relations vs Invalid Self-Relations', () => {
    it('ADV-REL-01: valid symmetrical relations (spouse_of, sibling_of, ally_of) must NOT trigger conflicts', () => {
      const db = dbManager.getDatabase();

      // Reciprocal symmetrical relations between Arthur (1) and Gwen (2)
      // 1. Arthur spouse_of Gwen (bidirectional: 1)
      // 2. Gwen spouse_of Arthur (bidirectional: 1)
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, bidirectional, confidence)
        VALUES (1, 2, 'spouse_of', 1, 1.0),
               (2, 1, 'spouse_of', 1, 1.0)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'relations' });

      const conflicts = result.anomalies.filter(a =>
        a.anomaly_rule_id === 'CONSIST_RELATION_SEMANTIC_CONFLICT' ||
        a.anomaly_rule_id === 'CONSIST_RELATION_INVALID_SELF'
      );

      assert.equal(conflicts.length, 0, `Symmetrical reciprocal spouse_of relations must NOT trigger semantic conflicts: ${JSON.stringify(conflicts)}`);
    });

    it('ADV-REL-02: invalid self-relations (parent_of, opposes, hostile_to, subordinate_to, controls) MUST be flagged', () => {
      const db = dbManager.getDatabase();

      const invalidTypes = ['parent_of', 'opposes', 'hostile_to', 'subordinate_to', 'child_of', 'controls'];
      for (const relType of invalidTypes) {
        db.prepare(`
          INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
          VALUES (1, 1, ?)
        `).run(relType);
      }

      const result = consistencyEngine.checkConsistency({ scope: 'relations' });
      const selfErrors = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_RELATION_INVALID_SELF');

      assert.equal(selfErrors.length, invalidTypes.length, `All ${invalidTypes.length} invalid self-relations must be detected`);
      for (const err of selfErrors) {
        assert.equal(err.severity, 'HIGH');
        assert.ok(err.message.includes('Arthur Pendelton') || err.message.includes('ENT-HERO'));
      }
    });

    it('ADV-REL-03: mutually contradictory relations (ally_of vs hostile_to) between same pair MUST be flagged', () => {
      const db = dbManager.getDatabase();

      // Arthur (1) and Mordred (3) are both ally_of AND hostile_to
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (1, 3, 'ally_of'),
               (3, 1, 'hostile_to')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'relations' });
      const semanticConflicts = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_RELATION_SEMANTIC_CONFLICT');

      assert.equal(semanticConflicts.length, 1, 'Must detect contradictory ally_of vs hostile_to relations');
      assert.equal(semanticConflicts[0].severity, 'HIGH');
    });

    it('ADV-REL-04: compatible non-contradictory multiple relations (e.g. ally_of and trading_partner) must NOT conflict', () => {
      const db = dbManager.getDatabase();

      // Arthur (1) and Gwen (2) are ally_of AND trading_partner AND colleague_of
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (1, 2, 'ally_of'),
               (1, 2, 'trading_partner'),
               (2, 1, 'colleague_of')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'relations' });
      const semanticConflicts = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_RELATION_SEMANTIC_CONFLICT');

      assert.equal(semanticConflicts.length, 0, 'Compatible overlapping relations must NOT trigger semantic conflict');
    });
  });

  // ===========================================================================
  // 3. Impact Analyzer Risk Score Stability & Multiplier Integrity
  // ===========================================================================
  describe('3. Impact Analyzer Risk Score Stability & Multiplier Ordering', () => {
    beforeEach(() => {
      const db = dbManager.getDatabase();

      // Setup rich connected lore graph for ENT-HERO (1)
      // 2 Direct relations, 1 Chapter, 1 Timeline event, 1 Foreshadowing
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, confidence)
        VALUES (1, 2, 'spouse_of', 1.0),
               (1, 3, 'rival_of', 0.9)
      `).run();

      db.prepare(`
        INSERT INTO chapters (chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon)
        VALUES (1, 1, 'Prologue', '03_Chapters/Chapter_01.md', 4, 1, 'published', 1)
      `).run();

      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status)
        VALUES ('EVT-H1', 'Ascension of Hero', 2040.0, 1, 'active')
      `).run();

      db.prepare(`
        INSERT INTO foreshadowing (foreshadow_id, title, description, status, importance_level, setup_file_id, related_entities_json)
        VALUES ('FS-H1', 'The True Lineage', 'Foreshadowing hero lineage', 'open', 'major', 4, '["ENT-HERO"]')
      `).run();
    });

    it('ADV-SCORE-01: DEPRECATE action must yield strictly higher blast radius score than EDIT and CREATE', () => {
      const impactDeprecate = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        changeType: 'DEPRECATE'
      });

      const impactEdit = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        changeType: 'EDIT'
      });

      const impactModify = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        changeType: 'MODIFY'
      });

      const impactCreate = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        changeType: 'CREATE'
      });

      // Assert multiplier order: DEPRECATE (2.0x) > EDIT/MODIFY/CREATE (1.0x)
      assert.ok(
        impactDeprecate.blastRadiusScore > impactEdit.blastRadiusScore,
        `DEPRECATE score (${impactDeprecate.blastRadiusScore}) must be strictly greater than EDIT score (${impactEdit.blastRadiusScore})`
      );

      assert.equal(impactEdit.blastRadiusScore, impactModify.blastRadiusScore, 'EDIT and MODIFY should produce identical blast radius scores');
      assert.equal(impactEdit.blastRadiusScore, impactCreate.blastRadiusScore, 'EDIT and CREATE should produce identical blast radius scores');

      // Ratio should be approximately 2.0x
      const ratio = impactDeprecate.blastRadiusScore / impactEdit.blastRadiusScore;
      assert.ok(ratio >= 1.9 && ratio <= 2.1, `DEPRECATE score should be approximately 2.0x of EDIT (got ratio: ${ratio})`);
    });

    it('ADV-SCORE-02: Action multipliers must follow monotonic order: DEPRECATE > RENAME > PROMOTE > MODIFY', () => {
      const actions = ['DEPRECATE', 'DELETE', 'ARCHIVE', 'RENAME', 'RELOCATE', 'PROMOTE', 'MODIFY', 'EDIT', 'CREATE'];
      const scores = {};

      for (const action of actions) {
        const impact = impactAnalyzer.analyzeChangeImpact({
          entityId: 'ENT-HERO',
          changeType: action
        });
        scores[action] = impact.blastRadiusScore;
      }

      // 2.0x tier
      assert.equal(scores.DEPRECATE, scores.DELETE);
      assert.equal(scores.DEPRECATE, scores.ARCHIVE);

      // 1.4x tier
      assert.equal(scores.RENAME, scores.RELOCATE);

      // Monotonic ordering
      assert.ok(scores.DEPRECATE > scores.RENAME, `${scores.DEPRECATE} > ${scores.RENAME}`);
      assert.ok(scores.RENAME > scores.PROMOTE, `${scores.RENAME} > ${scores.PROMOTE}`);
      assert.ok(scores.PROMOTE > scores.MODIFY, `${scores.PROMOTE} > ${scores.MODIFY}`);
      assert.equal(scores.MODIFY, scores.EDIT);
      assert.equal(scores.MODIFY, scores.CREATE);
    });

    it('ADV-SCORE-03: Canon Level multipliers must scale risk score deterministically (Level 3 > Level 2 > Level 1 > Level 0)', () => {
      const db = dbManager.getDatabase();

      // Create 4 entities with identical graph topology but differing canon levels
      for (let lvl = 0; lvl <= 3; lvl++) {
        db.prepare(`
          INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
          VALUES (${10 + lvl}, 'ENT-LVL-${lvl}', 'Hero Level ${lvl}', 'character', 'active', ${lvl})
        `).run();

        // Add 1 relation for each
        db.prepare(`
          INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
          VALUES (${10 + lvl}, 2, 'ally_of')
        `).run();
      }

      const scoreL0 = impactAnalyzer.analyzeChangeImpact({ entityId: 'ENT-LVL-0', changeType: 'MODIFY' }).blastRadiusScore;
      const scoreL1 = impactAnalyzer.analyzeChangeImpact({ entityId: 'ENT-LVL-1', changeType: 'MODIFY' }).blastRadiusScore;
      const scoreL2 = impactAnalyzer.analyzeChangeImpact({ entityId: 'ENT-LVL-2', changeType: 'MODIFY' }).blastRadiusScore;
      const scoreL3 = impactAnalyzer.analyzeChangeImpact({ entityId: 'ENT-LVL-3', changeType: 'MODIFY' }).blastRadiusScore;

      assert.ok(scoreL3 > scoreL2, `Level 3 (${scoreL3}) must be > Level 2 (${scoreL2})`);
      assert.ok(scoreL2 > scoreL1, `Level 2 (${scoreL2}) must be > Level 1 (${scoreL1})`);
      assert.ok(scoreL1 >= scoreL0, `Level 1 (${scoreL1}) must be >= Level 0 (${scoreL0})`);
    });

    it('ADV-SCORE-04: Hub Centrality Bonus must be applied for high-degree nodes', () => {
      const db = dbManager.getDatabase();

      // Create a super hub entity with 10 relations
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
        VALUES (99, 'ENT-SUPER-HUB', 'Cosmic Emperor', 'character', 'active', 0)
      `).run();

      for (let i = 1; i <= 10; i++) {
        db.prepare(`
          INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
          VALUES (${100 + i}, 'ENT-MINION-${i}', 'Minion ${i}', 'character', 'active', 0)
        `).run();

        db.prepare(`
          INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
          VALUES (99, ${100 + i}, 'commands')
        `).run();
      }

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-SUPER-HUB',
        changeType: 'MODIFY',
        maxDepth: 1
      });

      assert.equal(impact.target.degreeCentrality, 10);
      assert.equal(impact.scoreBreakdown.centralityBonus, 12, 'Degree >= 10 must grant +12 centrality bonus');
      assert.ok(['HIGH', 'CRITICAL'].includes(impact.impactRating));
    });
  });

  // ===========================================================================
  // 4. Unresolvable Target Handling & Typed Error Integrity
  // ===========================================================================
  describe('4. Unresolvable Target Handling & Typed Error Integrity', () => {
    it('ADV-ERR-01: missing string entityId must throw NovelError with TARGET_NOT_FOUND', () => {
      assert.throws(
        () => impactAnalyzer.analyzeChangeImpact({ entityId: 'NON_EXISTENT_LORE_ENTITY_99999' }),
        (err) => {
          assert.ok(err instanceof NovelError, `Must be instance of NovelError, got ${err.constructor.name}`);
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          assert.ok(err.message.includes('could not be resolved'));
          return true;
        }
      );
    });

    it('ADV-ERR-02: missing numeric entityDbId must throw NovelError with TARGET_NOT_FOUND', () => {
      assert.throws(
        () => impactAnalyzer.analyzeChangeImpact({ entityDbId: 999999 }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          return true;
        }
      );
    });

    it('ADV-ERR-03: missing filePath or relativePath must throw NovelError with TARGET_NOT_FOUND', () => {
      assert.throws(
        () => impactAnalyzer.analyzeChangeImpact({ filePath: '99_GhostVault/NonExistent.md' }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          return true;
        }
      );
    });

    it('ADV-ERR-04: empty parameters object must throw NovelError with TARGET_NOT_FOUND without unhandled crash', () => {
      assert.throws(
        () => impactAnalyzer.analyzeChangeImpact({}),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          return true;
        }
      );
    });

    it('ADV-ERR-05: omitting DatabaseManager in constructor must throw NovelError with INVALID_PARAMETER', () => {
      assert.throws(
        () => new ConsistencyEngine(null),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_PARAMETER');
          return true;
        }
      );

      assert.throws(
        () => new ImpactAnalyzer(undefined),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'INVALID_PARAMETER');
          return true;
        }
      );
    });
  });

  // ===========================================================================
  // 5. Multi-Hop Cyclic Graph Traversal & Boundary Stress
  // ===========================================================================
  describe('5. Cyclic Lore Graph Traversal Resilience & Boundary Filtering', () => {
    it('ADV-GRAPH-01: cyclic lore graph (A <-> B <-> C <-> A) must terminate cleanly without stack overflow', () => {
      const db = dbManager.getDatabase();

      // Create cyclic triangle: ENT-A (50) <-> ENT-B (51) <-> ENT-C (52) <-> ENT-A (50)
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
        VALUES (50, 'ENT-TRI-A', 'Node Alpha', 'character', 'active', 1),
               (51, 'ENT-TRI-B', 'Node Beta', 'character', 'active', 1),
               (52, 'ENT-TRI-C', 'Node Gamma', 'character', 'active', 1)
      `).run();

      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, bidirectional, confidence)
        VALUES (50, 51, 'ally_of', 1, 0.9),
               (51, 52, 'ally_of', 1, 0.9),
               (52, 50, 'ally_of', 1, 0.9)
      `).run();

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-TRI-A',
        maxDepth: 5
      });

      assert.equal(impact.affectedEntities.length, 3, 'Must visit all 3 nodes in cycle without duplicates');
      const visitedCodes = impact.affectedEntities.map(e => e.entityId).sort();
      assert.deepEqual(visitedCodes, ['ENT-TRI-A', 'ENT-TRI-B', 'ENT-TRI-C']);
      assert.equal(impact.traversalStats.totalGraphNodesVisited, 3);
    });

    it('ADV-GRAPH-02: minConfidence filter must prune low-confidence relation edges during traversal', () => {
      const db = dbManager.getDatabase();

      // ENT-HERO (1) has relation to Gwen (confidence: 1.0) and Mordred (confidence: 0.4)
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, confidence)
        VALUES (1, 2, 'confidant_of', 0.95),
               (1, 3, 'suspects', 0.35)
      `).run();

      const impactPruned = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        minConfidence: 0.50
      });

      assert.ok(impactPruned.directRelations.some(r => r.partnerEntityId === 'ENT-PARTNER'));
      assert.ok(!impactPruned.directRelations.some(r => r.partnerEntityId === 'ENT-RIVAL'), 'Edge with confidence 0.35 must be pruned when minConfidence=0.50');
    });

    it('ADV-GRAPH-03: maxDepth clamping must restrict traversal bounds strictly between 1 and 5', () => {
      const impactMin = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        maxDepth: -99
      });
      assert.equal(impactMin.traversalStats.maxDepthRequested, 1, 'Negative maxDepth must clamp to 1');

      const impactMax = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-HERO',
        maxDepth: 100
      });
      assert.equal(impactMax.traversalStats.maxDepthRequested, 5, 'Huge maxDepth must clamp to 5');
    });

    it('ADV-GRAPH-04: ConsistencyCommands handles CheckConsistency and AnalyzeChangeImpact returning standardized envelopes', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (1, 1, 'controls')
      `).run();

      const resCheck = await ConsistencyCommands.handleCheckConsistency(
        { scope: 'relations', persistToReports: false },
        { dbManager }
      );

      assert.equal(resCheck.status, 'success');
      assert.ok(resCheck.totalIssues >= 1);
      assert.ok(resCheck.content.includes('Worldbuilding Consistency Report'));
      assert.equal(resCheck.details.totalIssues, resCheck.totalIssues);

      const resImpact = await ConsistencyCommands.handleAnalyzeChangeImpact(
        { entityId: 'ENT-HERO', changeType: 'DEPRECATE' },
        { dbManager }
      );

      assert.equal(resImpact.status, 'success');
      assert.equal(resImpact.target.id, 'ENT-HERO');
      assert.ok(resImpact.content.includes('Change Impact & Blast Radius Analysis'));
      assert.ok(resImpact.blastRadiusScore > 0);
      assert.ok(resImpact.recommendations.length > 0);
    });
  });
});
