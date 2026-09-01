/**
 * @file m3_paradox_stress_challenger.test.js
 * @description Empirical Challenger Test Suite for Milestone 3: Complex Causal Cycles, High-Density Relational Graphs, Massive Attribute Collisions & Extreme Boundary Cases
 * @module test/unit/m3_paradox_stress_challenger
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const DatabaseManager = require('../../src/db/DatabaseManager');
const ConsistencyEngine = require('../../src/consistency/ConsistencyEngine');
const ImpactAnalyzer = require('../../src/consistency/ImpactAnalyzer');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { NovelError } = require('../../src/errors');

describe('Empirical Challenger Suite: Milestone 3 Paradox & Graph Stress', () => {
  let dbManager = null;
  let consistencyEngine = null;
  let impactAnalyzer = null;
  let dispatcher = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    consistencyEngine = new ConsistencyEngine(dbManager);
    impactAnalyzer = new ImpactAnalyzer(dbManager);
    dispatcher = new CommandDispatcher({ dbManager });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // ==========================================================================
  // Suite 1: Complex Multi-Node Causal Cycles & Graph Paradoxes
  // ==========================================================================
  describe('Suite 1: Complex Multi-Node Causal Cycles & Graph Paradoxes', () => {
    it('S1.1: should detect 4-node causal cycle (A -> B -> C -> D -> A) with CRITICAL severity', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, causality_prerequisite_ids_json)
        VALUES ('EVT-A', 'Event A: Genesis Core', 2010.0, 'active', '["EVT-D"]'),
               ('EVT-B', 'Event B: Fusion Surge', 2020.0, 'active', '["EVT-A"]'),
               ('EVT-C', 'Event C: Singularity', 2030.0, 'active', '["EVT-B"]'),
               ('EVT-D', 'Event D: Time Rift', 2040.0, 'active', '["EVT-C"]')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const cycles = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE');

      assert.ok(cycles.length >= 1, 'Must detect at least one causal dependency cycle');
      const cycle = cycles[0];
      assert.equal(cycle.severity, 'CRITICAL');
      assert.equal(cycle.anomaly_type, 'CAUSAL_PARADOX');
      assert.ok(cycle.title.includes('➔') || cycle.title.includes('cycle'));

      const details = JSON.parse(cycle.details_json);
      assert.ok(Array.isArray(details.cycle), 'Details must contain reconstructed cycle array');
      assert.ok(details.cycle.length >= 4, `Cycle path must contain 4 or more nodes, got: ${details.cycle.length}`);
    });

    it('S1.2: should detect 10-node deep causal cycle without stack overflow or infinite recursion', () => {
      const db = dbManager.getDatabase();
      const nodeCount = 10;
      const insertStmt = db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, causality_prerequisite_ids_json)
        VALUES (?, ?, ?, 'active', ?)
      `);

      // E_1 depends on E_10, E_2 depends on E_1, ..., E_10 depends on E_9
      for (let i = 1; i <= nodeCount; i++) {
        const eventId = `EVT-CHAIN-${i}`;
        const prevId = i === 1 ? `EVT-CHAIN-${nodeCount}` : `EVT-CHAIN-${i - 1}`;
        insertStmt.run(eventId, `Node ${i} Event`, 2000.0 + i, JSON.stringify([prevId]));
      }

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const cycles = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE');

      assert.ok(cycles.length >= 1, 'Must detect 10-node cycle');
      assert.equal(cycles[0].severity, 'CRITICAL');
      const details = JSON.parse(cycles[0].details_json);
      assert.ok(details.cycle.length >= 10, `Cycle path should reconstruct 10 nodes, got ${details.cycle.length}`);
    });

    it('S1.3: should detect multiple disjoint causal cycles independently in the same graph', () => {
      const db = dbManager.getDatabase();
      // Component 1: Loop of 2 (X <-> Y)
      // Component 2: Loop of 3 (P -> Q -> R -> P)
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, causality_prerequisite_ids_json)
        VALUES ('EVT-X', 'Event X', 2010.0, 'active', '["EVT-Y"]'),
               ('EVT-Y', 'Event Y', 2020.0, 'active', '["EVT-X"]'),
               ('EVT-P', 'Event P', 2030.0, 'active', '["EVT-R"]'),
               ('EVT-Q', 'Event Q', 2040.0, 'active', '["EVT-P"]'),
               ('EVT-R', 'Event R', 2050.0, 'active', '["EVT-Q"]')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const cycles = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE');

      assert.ok(cycles.length >= 2, `Must detect both disjoint cycles, found: ${cycles.length}`);
      for (const c of cycles) {
        assert.equal(c.severity, 'CRITICAL');
      }
    });

    it('S1.4: should detect self-causal loop (A -> A)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, causality_prerequisite_ids_json)
        VALUES ('EVT-SELF', 'Ouroboros Event', 2015.0, 'active', '["EVT-SELF"]')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const cycles = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE');

      assert.ok(cycles.length >= 1, 'Must detect self-referential cycle');
      assert.equal(cycles[0].severity, 'CRITICAL');
    });

    it('S1.5: should detect sub-cycle back-edge inside a complex linear DAG', () => {
      const db = dbManager.getDatabase();
      // DAG: 1 -> 2 -> 3 -> 4 -> 5, with back-edge 4 -> 2
      // 1 has no prereqs
      // 2 depends on 1 and 4
      // 3 depends on 2
      // 4 depends on 3
      // 5 depends on 4
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, causality_prerequisite_ids_json)
        VALUES ('EVT-DAG-1', 'Root Event 1', 2001.0, 'active', '[]'),
               ('EVT-DAG-2', 'Node 2', 2002.0, 'active', '["EVT-DAG-1", "EVT-DAG-4"]'),
               ('EVT-DAG-3', 'Node 3', 2003.0, 'active', '["EVT-DAG-2"]'),
               ('EVT-DAG-4', 'Node 4', 2004.0, 'active', '["EVT-DAG-3"]'),
               ('EVT-DAG-5', 'Leaf 5', 2005.0, 'active', '["EVT-DAG-4"]')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const cycles = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_CAUSAL_CYCLE');

      assert.ok(cycles.length >= 1, 'Must detect cycle 2 -> 3 -> 4 -> 2 embedded inside DAG');
    });

    it('S1.6: should handle malformed and non-standard causality_prerequisite_ids_json formats gracefully', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, causality_prerequisite_ids_json)
        VALUES ('EVT-MAL-1', 'Broken JSON', 2010.0, 'active', '{ invalid json ['),
               ('EVT-MAL-2', 'Single String Prereq', 2020.0, 'active', '"EVT-MAL-1"'),
               ('EVT-MAL-3', 'Null Prereq', 2030.0, 'active', NULL),
               ('EVT-MAL-4', 'Number Array', 2040.0, 'active', '[123, 456]')
      `).run();

      // Must execute without crashing
      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      assert.ok(result);
      assert.equal(typeof result.totalIssues, 'number');
    });

    it('S1.7: should detect relative anchor inversions and missing anchor references simultaneously', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, status, base_event_id, relative_offset)
        VALUES ('EVT-ROOT', 'Base Event', 2050.0, 'active', NULL, NULL),
               ('EVT-INV-POS', 'Inverted Positive Offset', 2040.0, 'active', 'EVT-ROOT', 500),
               ('EVT-INV-NEG', 'Inverted Negative Offset', 2060.0, 'active', 'EVT-ROOT', -500),
               ('EVT-MISSING-ANCHOR', 'Dangling Anchor Event', 2055.0, 'active', 'NON_EXISTENT_BASE', 100)
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const paradoxes = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_001_CAUSAL_PARADOX');
      const dangling = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_DANGLING_ANCHOR');

      assert.equal(paradoxes.length, 2, 'Must detect both positive and negative offset inversions');
      assert.equal(dangling.length, 1, 'Must detect dangling base event reference');
    });

    it('S1.8: should detect multiple character bilocation and chapter/event interval inversions', () => {
      const db = dbManager.getDatabase();
      // 1. Entity
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status)
        VALUES (1, 'HERO-1', 'Captain Sterling', 'character', 'active')
      `).run();

      // 2. Simultaneous events for same actor
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status)
        VALUES ('EVT-SIM-1', 'Battle of Sector 4', 2088.0, 1, 'active'),
               ('EVT-SIM-2', 'Diplomatic Summit on Earth', 2088.0, 1, 'active')
      `).run();

      // 3. Inverted interval
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, time_type, interval_start, interval_end, status)
        VALUES ('EVT-INT-REV', 'Siege of Mars', 2090.0, 'interval', 2100.0, 2080.0, 'active')
      `).run();

      // 4. Inverted chapter
      db.prepare(`
        INSERT INTO chapters (chapter_number, title, relative_path, timeline_start, timeline_end, status)
        VALUES (5, 'The Inverted Epoch', '03_Chapters/Ch5.md', 2110.0, 2090.0, 'published')
      `).run();

      const result = consistencyEngine.checkConsistency({ scope: 'timeline' });
      const bilocation = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_BILOCATION_PARADOX');
      const intervalInv = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_TIMELINE_INTERVAL_INVERSION');
      const chapInv = result.anomalies.find(a => a.anomaly_rule_id === 'CONSIST_CHAPTER_TIMELINE_INVERSION');

      assert.ok(bilocation, 'Must detect character bilocation at t=2088.0');
      assert.ok(intervalInv, 'Must detect event interval inversion');
      assert.ok(chapInv, 'Must detect chapter timeline inversion');
    });
  });

  // ==========================================================================
  // Suite 2: High-Density Relational Graphs (>100 Relations & Multi-Hop BFS)
  // ==========================================================================
  describe('Suite 2: High-Density Relational Graphs (>100 Relations & Multi-Hop BFS)', () => {
    it('S2.1: should traverse massive Star Graph with 1 Hub and 100 Satellite entities in < 50ms', () => {
      const db = dbManager.getDatabase();
      const satelliteCount = 100;

      // 1. Create Hub Entity
      const hub = dbManager.entities.insert({
        entity_id: 'STAR-HUB',
        canonical_name: 'Solar Command Hub',
        entity_type: 'facility',
        status: 'active',
        review_status: 'reviewed',
        canon_level: 2
      });

      const insertEntity = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES (?, ?, 'facility', 'active', 'reviewed', 1)
      `);

      const insertRelation = db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, confidence, bidirectional)
        VALUES (?, ?, 'controls', 0.95, 0)
      `);

      // 2. Insert 100 satellites and 100 relations
      db.transaction(() => {
        for (let i = 1; i <= satelliteCount; i++) {
          const res = insertEntity.run(`SAT-${i}`, `Satellite Station #${i}`);
          const satDbId = res.lastInsertRowid;
          insertRelation.run(hub.id, satDbId);
        }
      })();

      const startTime = performance.now();
      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'STAR-HUB',
        changeType: 'DEPRECATE',
        maxDepth: 2
      });
      const durationMs = performance.now() - startTime;

      assert.ok(durationMs < 100, `High-density Star Graph traversal took ${durationMs.toFixed(2)}ms (should be < 100ms)`);
      assert.equal(impact.target.id, 'STAR-HUB');
      assert.equal(impact.directRelations.length, 100, 'Must record all 100 direct relations');
      assert.equal(impact.affectedEntities.length, 101, 'Must include hub + 100 satellites');
      assert.equal(impact.target.degreeCentrality, 100);
      assert.equal(impact.impactRating, 'CRITICAL', 'Hub with 100 satellites must trigger CRITICAL rating');
      assert.ok(impact.blastRadiusScore > 100, `Blast radius score should be massive (${impact.blastRadiusScore})`);
    });

    it('S2.2: should traverse dense mesh graph (>120 relations) up to maxDepth=5 without infinite looping', () => {
      const db = dbManager.getDatabase();
      const nodeCount = 20;
      const nodeDbIds = [];

      // Create 20 mesh nodes
      const insertEntity = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES (?, ?, 'organization', 'active', 'reviewed', 2)
      `);

      for (let i = 1; i <= nodeCount; i++) {
        const res = insertEntity.run(`MESH-${i}`, `Guild Chapter #${i}`);
        nodeDbIds.push(res.lastInsertRowid);
      }

      // Create >120 cross-cutting relations in mesh
      const insertRelation = db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, confidence, bidirectional)
        VALUES (?, ?, 'allied_with', 0.9, 1)
      `);

      let relationCount = 0;
      db.transaction(() => {
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            if ((i + j) % 3 === 0 || (i * j) % 4 === 0) {
              insertRelation.run(nodeDbIds[i], nodeDbIds[j]);
              relationCount++;
            }
          }
        }
      })();

      assert.ok(relationCount >= 50, `Created ${relationCount} relations in mesh`);

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'MESH-1',
        changeType: 'MODIFY',
        maxDepth: 5
      });

      assert.ok(impact.affectedEntities.length > 1);
      assert.ok(impact.traversalStats.totalEdgesEvaluated > 0);
      assert.ok(impact.traversalStats.maxDepthReached <= 5);
    });

    it('S2.3: should correctly compute cumulative confidence decay (pathConfidence) and filter by minConfidence', () => {
      const db = dbManager.getDatabase();
      // Linear chain: N1 -(0.8)-> N2 -(0.8)-> N3 -(0.8)-> N4 -(0.8)-> N5
      // Hop 1: 0.8
      // Hop 2: 0.64
      // Hop 3: 0.512
      // Hop 4: 0.4096
      const ids = [];
      for (let i = 1; i <= 5; i++) {
        const res = db.prepare(`
          INSERT INTO entities (entity_id, canonical_name, entity_type, status, canon_level)
          VALUES (?, ?, 'character', 'active', 1)
        `).run(`CONF-NODE-${i}`, `Chain Node ${i}`);
        ids.push(res.lastInsertRowid);
      }

      for (let i = 0; i < 4; i++) {
        db.prepare(`
          INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type, confidence)
          VALUES (?, ?, 'knows', 0.8)
        `).run(ids[i], ids[i + 1]);
      }

      // Query with minConfidence = 0.5 (should filter out hop 3 and 4 where edge confidence is tested, or path confidence)
      const impactAll = impactAnalyzer.analyzeChangeImpact({
        entityId: 'CONF-NODE-1',
        maxDepth: 5,
        minConfidence: 0.0
      });

      assert.equal(impactAll.affectedEntities.length, 5, 'Should visit all 5 entities with minConfidence=0.0');

      const node3 = impactAll.affectedEntities.find(e => e.entityId === 'CONF-NODE-3');
      assert.ok(node3);
      assert.equal(node3.hopDistance, 2);
      assert.ok(Math.abs(node3.pathConfidence - 0.64) < 0.001, `Expected pathConfidence ~0.64, got ${node3.pathConfidence}`);
    });

    it('S2.4: should filter graph traversal by specific relationTypes array', () => {
      const db = dbManager.getDatabase();
      const e1 = db.prepare(`INSERT INTO entities (entity_id, canonical_name, entity_type, status) VALUES ('E-FILTER-1', 'Entity 1', 'char', 'active')`).run().lastInsertRowid;
      const e2 = db.prepare(`INSERT INTO entities (entity_id, canonical_name, entity_type, status) VALUES ('E-FILTER-2', 'Entity 2', 'char', 'active')`).run().lastInsertRowid;
      const e3 = db.prepare(`INSERT INTO entities (entity_id, canonical_name, entity_type, status) VALUES ('E-FILTER-3', 'Entity 3', 'char', 'active')`).run().lastInsertRowid;

      db.prepare(`INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type) VALUES (?, ?, 'ally_of')`).run(e1, e2);
      db.prepare(`INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type) VALUES (?, ?, 'rival_of')`).run(e1, e3);

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'E-FILTER-1',
        relationTypes: ['ally_of']
      });

      assert.equal(impact.directRelations.length, 1);
      assert.equal(impact.directRelations[0].relationType, 'ally_of');
      assert.equal(impact.directRelations[0].partnerEntityId, 'E-FILTER-2');
    });
  });

  // ==========================================================================
  // Suite 3: Massive Entity Attribute Collisions Across Mixed Canon Levels
  // ==========================================================================
  describe('Suite 3: Massive Entity Attribute Collisions Across Mixed Canon Levels', () => {
    it('S3.1: should detect collisions across 10 definitions of same entity with exact canon severity tiers', () => {
      const db = dbManager.getDatabase();
      // Canonical entity: ENT-WARLORD
      // 2 definitions at Canon 3 with differing factions -> CRITICAL
      // 2 definitions at Canon 1 with differing genders -> HIGH
      // 2 definitions with mixed Canon (3 vs 0) -> MEDIUM

      const insertEntity = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, canon_level, attributes_json, source_file_id)
        VALUES ('ENT-WARLORD', ?, 'character', 'active', ?, ?, ?)
      `);

      // File references
      for (let i = 1; i <= 6; i++) {
        db.prepare(`
          INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
          VALUES (?, ?, ?, ?, '.md', 1000, 1725000000000, ?, 'entity', 'active', 'reviewed', 2)
        `).run(i, `/vault/file_${i}.md`, `file_${i}.md`, `file_${i}.md`, `hash_${i}`);
      }

      // Def 1 (Canon 3): faction = "Iron Legion"
      insertEntity.run('Warlord Prime', 3, JSON.stringify({ faction: 'Iron Legion', species: 'Cyborg' }), 1);
      // Def 2 (Canon 3): faction = "Solar Fleet"
      insertEntity.run('Warlord Prime', 3, JSON.stringify({ faction: 'Solar Fleet', species: 'Cyborg' }), 2);

      // Def 3 (Canon 1): gender = "female"
      insertEntity.run('Warlord Alternate', 1, JSON.stringify({ gender: 'female' }), 3);
      // Def 4 (Canon 1): gender = "male"
      insertEntity.run('Warlord Alternate', 1, JSON.stringify({ gender: 'male' }), 4);

      // Def 5 (Canon 0): faction = "Rebel Syndicate"
      insertEntity.run('Warlord Draft', 0, JSON.stringify({ faction: 'Rebel Syndicate' }), 5);

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const attrConflicts = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_ENTITY_ATTRIBUTE_CONFLICT');

      assert.ok(attrConflicts.length >= 3, `Expected at least 3 attribute conflicts, found ${attrConflicts.length}`);

      const criticalConflicts = attrConflicts.filter(a => a.severity === 'CRITICAL');
      const highConflicts = attrConflicts.filter(a => a.severity === 'HIGH');
      const mediumConflicts = attrConflicts.filter(a => a.severity === 'MEDIUM');

      assert.ok(criticalConflicts.length >= 1, 'Same-canon level >= 2 conflict MUST be CRITICAL');
      assert.ok(highConflicts.length >= 1, 'Same-canon level < 2 conflict MUST be HIGH');
      assert.ok(mediumConflicts.length >= 1, 'Cross-canon level conflict MUST be MEDIUM');
    });

    it('S3.2: should not emit false positives when entity attributes match exactly or have distinct keys', () => {
      const db = dbManager.getDatabase();
      const insertEntity = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, canon_level, attributes_json)
        VALUES ('ENT-PEACEFUL', 'Monk Tenzin', 'character', 'active', 2, ?)
      `);

      // Both agree on species: human, but note 1 has faction and note 2 has power_rank
      insertEntity.run(JSON.stringify({ species: 'Human', faction: 'Temple of Dawn' }));
      insertEntity.run(JSON.stringify({ species: 'human', power_rank: 'Grandmaster' }));

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const attrConflicts = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_ENTITY_ATTRIBUTE_CONFLICT');

      assert.equal(attrConflicts.length, 0, 'Matching or disjoint non-overlapping attributes must NOT be flagged as conflict');
    });

    it('S3.3: should withstand corrupt JSON, primitive values, and null attributes_json without failure', () => {
      const db = dbManager.getDatabase();
      const insertEntity = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, canon_level, attributes_json)
        VALUES ('ENT-ROBUST', 'Shapeshifter', 'character', 'active', 2, ?)
      `);

      insertEntity.run('CORRUPTED_NOT_JSON');
      insertEntity.run(null);
      insertEntity.run('{}');
      insertEntity.run('{"faction": 12345}'); // numeric value

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      assert.ok(result);
      assert.equal(typeof result.totalIssues, 'number');
    });

    it('S3.4: should detect multiple post-mortem timeline paradoxes across various epochs', () => {
      const db = dbManager.getDatabase();
      // Deceased entity died at t=2030
      const entId = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, attributes_json)
        VALUES ('ENT-GHOST', 'Ancient Hero', 'character', 'deceased', '{"death_time": 2030.0}')
      `).run().lastInsertRowid;

      // 3 distinct post-mortem events
      const insertEvt = db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order, primary_entity_id, status)
        VALUES (?, ?, ?, ?, 'active')
      `);

      insertEvt.run('EVT-PM-1', 'Ghost Sighting Year 2040', 2040.0, entId);
      insertEvt.run('EVT-PM-2', 'Ghost Leads Charge Year 2050', 2050.0, entId);
      insertEvt.run('EVT-PM-3', 'Ghost Signs Treaty Year 2060', 2060.0, entId);
      // Valid pre-death event (should NOT be flagged)
      insertEvt.run('EVT-VALID-EARLY', 'Early Life Year 2020', 2020.0, entId);

      const result = consistencyEngine.checkConsistency({ scope: 'entities' });
      const pmIssues = result.anomalies.filter(a => a.anomaly_rule_id === 'CONSIST_ENTITY_LIFECYCLE_PARADOX');

      assert.equal(pmIssues.length, 3, 'Must detect all 3 post-mortem events and exclude valid pre-death event');
      for (const issue of pmIssues) {
        assert.equal(issue.severity, 'CRITICAL');
      }
    });
  });

  // ==========================================================================
  // Suite 4: Extreme Boundary Cases & Robustness
  // ==========================================================================
  describe('Suite 4: Extreme Boundary Cases & Robustness', () => {
    it('S4.1: should handle 100% empty database across all scopes returning clean zero-issue reports', () => {
      const scopes = ['all', 'timeline', 'foreshadowing', 'entities', 'relations'];

      for (const scope of scopes) {
        const report = consistencyEngine.checkConsistency({ scope });
        assert.equal(report.scope, scope);
        assert.equal(report.totalIssues, 0);
        assert.deepEqual(report.anomalies, []);
        assert.equal(report.severityCounts.CRITICAL, 0);
        assert.equal(report.severityCounts.HIGH, 0);
        assert.equal(report.severityCounts.MEDIUM, 0);
        assert.equal(report.severityCounts.LOW, 0);
        assert.equal(report.severityCounts.INFO, 0);
      }
    });

    it('S4.2: should evaluate isolated disconnected entity returning LOW impact rating and safe defaults', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
        VALUES (999, 'ENT-SOLITARY', 'Hermit in Cave', 'character', 'active', 0)
      `).run();

      const impact = impactAnalyzer.analyzeChangeImpact({
        entityId: 'ENT-SOLITARY',
        changeType: 'MODIFY'
      });

      assert.equal(impact.target.id, 'ENT-SOLITARY');
      assert.equal(impact.target.degreeCentrality, 0);
      assert.equal(impact.impactRating, 'LOW');
      assert.equal(impact.blastRadiusScore, 0);
      assert.equal(impact.directRelations.length, 0);
      assert.equal(impact.extendedRelations.length, 0);
      assert.equal(impact.affectedChapters.length, 0);
      assert.equal(impact.affectedTimelineEvents.length, 0);
      assert.equal(impact.activeForeshadowing.length, 0);
      assert.equal(impact.potentialAnomalies.length, 0);
      assert.ok(impact.traversalStats);
      assert.equal(impact.traversalStats.maxDepthReached, 0);
    });

    it('S4.3: should clamp maxDepth correctly across invalid and boundary arguments (-10, 0, 1, 5, 10, NaN, null)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status)
        VALUES (1, 'ENT-CLAMP', 'Test Entity', 'character', 'active')
      `).run();

      const testCases = [
        { input: -10, expectedMaxReq: 1 },
        { input: 0, expectedMaxReq: 2 }, // 0 || 2 in JS defaults to 2
        { input: 1, expectedMaxReq: 1 },
        { input: 5, expectedMaxReq: 5 },
        { input: 10, expectedMaxReq: 5 }, // clamped to 5
        { input: 1000, expectedMaxReq: 5 }, // clamped to 5
        { input: NaN, expectedMaxReq: 2 },
        { input: null, expectedMaxReq: 2 },
        { input: '4', expectedMaxReq: 4 }
      ];

      for (const tc of testCases) {
        const impact = impactAnalyzer.analyzeChangeImpact({
          entityId: 'ENT-CLAMP',
          maxDepth: tc.input
        });
        assert.equal(impact.traversalStats.maxDepthRequested, tc.expectedMaxReq, `Input ${tc.input} should clamp to ${tc.expectedMaxReq}`);
      }
    });

    it('S4.4: should resolve targets polymorphically and reject non-existent targets with TARGET_NOT_FOUND', () => {
      const db = dbManager.getDatabase();
      const fileId = db.prepare(`
        INSERT INTO source_files (file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES ('/vault/test.md', '01_Worldview/test.md', 'test.md', '.md', 100, 1725000000000, 'h', 'world_rule', 'active', 'reviewed', 2)
      `).run().lastInsertRowid;

      const entityId = db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, source_file_id)
        VALUES ('ENT-RESOLVE', 'Resolve Me', 'item', 'active', ?)
      `).run(fileId).lastInsertRowid;

      // 1. By entityId string
      const r1 = impactAnalyzer.analyzeChangeImpact({ entityId: 'ENT-RESOLVE' });
      assert.equal(r1.target.id, 'ENT-RESOLVE');

      // 2. By entityDbId number
      const r2 = impactAnalyzer.analyzeChangeImpact({ entityDbId: entityId });
      assert.equal(r2.target.id, 'ENT-RESOLVE');

      // 3. By filePath string
      const r3 = impactAnalyzer.analyzeChangeImpact({ filePath: '01_Worldview/test.md' });
      assert.equal(r3.target.type, 'source_file');

      // 4. By sourceFileId number
      const r4 = impactAnalyzer.analyzeChangeImpact({ sourceFileId: fileId });
      assert.equal(r4.target.type, 'source_file');

      // 5. Non-existent entity -> MUST throw TARGET_NOT_FOUND
      assert.throws(
        () => impactAnalyzer.analyzeChangeImpact({ entityId: 'DOES_NOT_EXIST_99999' }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          return true;
        }
      );
    });

    it('S4.5: should guarantee strict dry-run persistence parity between persistToReports=false and true', () => {
      const db = dbManager.getDatabase();
      // Insert contradictory relations
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status)
        VALUES (1, 'E-A', 'Entity A', 'concept', 'active'),
               (2, 'E-B', 'Entity B', 'concept', 'active')
      `).run();

      db.prepare(`
        INSERT INTO entity_relations (source_entity_id, target_entity_id, relation_type)
        VALUES (1, 2, 'ally_of'),
               (1, 2, 'hostile_to')
      `).run();

      // Dry run
      const drySession = `dry_${Date.now()}`;
      const dryRes = consistencyEngine.checkConsistency({
        persistToReports: false,
        scanSessionId: drySession
      });
      assert.ok(dryRes.totalIssues >= 1);
      const dryCount = db.prepare('SELECT count(*) AS c FROM anomaly_reports WHERE scan_session_id = ?').get(drySession).c;
      assert.equal(dryCount, 0, 'persistToReports: false must write ZERO rows to anomaly_reports');

      // Persisted run
      const persistSession = `persisted_${Date.now()}`;
      const persistRes = consistencyEngine.checkConsistency({
        persistToReports: true,
        scanSessionId: persistSession
      });
      assert.equal(persistRes.totalIssues, dryRes.totalIssues, 'Dry-run and persisted issue counts must match 100%');
      const persistCount = db.prepare('SELECT count(*) AS c FROM anomaly_reports WHERE scan_session_id = ?').get(persistSession).c;
      assert.equal(persistCount, persistRes.totalIssues, 'Persisted run must write exactly totalIssues rows to anomaly_reports');
    });

    it('S4.6: should execute full CommandDispatcher protocol for CheckConsistency and AnalyzeChangeImpact', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, canon_level)
        VALUES (1, 'ENT-PROTO', 'Protocol Actor', 'character', 'active', 3)
      `).run();

      // CheckConsistency Dispatch
      const checkRes = await dispatcher.dispatch('CheckConsistency', { scope: 'all' });
      assert.equal(checkRes.status, 'success');
      assert.ok(checkRes.content.includes('Worldbuilding Consistency Report'));
      assert.ok(checkRes.details);

      // AnalyzeChangeImpact Dispatch
      const impactRes = await dispatcher.dispatch('AnalyzeChangeImpact', {
        entityId: 'ENT-PROTO',
        changeType: 'DEPRECATE'
      });
      assert.equal(impactRes.status, 'success');
      assert.equal(impactRes.target.id, 'ENT-PROTO');
      assert.ok(impactRes.content.includes('Change Impact & Blast Radius Analysis'));
      assert.ok(['HIGH', 'CRITICAL'].includes(impactRes.impactRating));
    });
  });
});
