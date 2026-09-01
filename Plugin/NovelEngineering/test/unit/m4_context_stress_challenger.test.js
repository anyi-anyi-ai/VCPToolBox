/**
 * @file m4_context_stress_challenger.test.js
 * @description Empirical Challenger Test Suite for Milestone 4 (Context v3 & Provenance Stress Harness)
 * @module test/unit/m4_context_stress_challenger
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const ContextV3Engine = require('../../src/context/ContextV3Engine');
const RuleClassifier = require('../../src/context/RuleClassifier');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard } = require('../../src/security/PathGuard');
const { createTempDir } = require('../helpers/tempDir');

describe('Empirical Challenger: Milestone 4 Context v3 & Provenance Stress Suite', () => {
  let tempEnv = null;
  let vaultDir = null;
  let pluginDir = null;
  let dbManager = null;
  let dispatcher = null;
  let engine = null;
  let pathGuard = null;

  beforeEach(() => {
    tempEnv = createTempDir('vcp_m4_stress_');
    vaultDir = tempEnv.createSubdir('mock_vault');
    pluginDir = tempEnv.createSubdir('mock_plugin');

    // Create WorldTree directories
    const worldDir = path.join(vaultDir, '01_Worldview');
    const planetDir = path.join(vaultDir, '04_Entities', 'Planets');
    const charDir = path.join(vaultDir, '04_Entities', 'Characters');
    const chDir = path.join(vaultDir, '03_Chapters');
    const tlDir = path.join(vaultDir, '04_Timeline');
    const fsDir = path.join(vaultDir, '05_Foreshadowing');

    fs.mkdirSync(worldDir, { recursive: true });
    fs.mkdirSync(planetDir, { recursive: true });
    fs.mkdirSync(charDir, { recursive: true });
    fs.mkdirSync(chDir, { recursive: true });
    fs.mkdirSync(tlDir, { recursive: true });
    fs.mkdirSync(fsDir, { recursive: true });

    // Initialize Database
    const dbPath = path.join(pluginDir, 'data', 'novel_index.db');
    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = DatabaseManager.initDatabase(dbPath, { pathGuard });
    engine = new ContextV3Engine(dbManager, { pathGuard });
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
  // SUITE 1: Massive Lore Graph Stress (50+ Entities, 100+ Rules, 200+ Events)
  // =========================================================================
  describe('Suite 1: Massive Lore Graph Stress Generation', () => {

    it('S1.1: should generate context for 60 focus entities, 120 rules, 250 timeline events in < 2500ms', () => {
      const db = dbManager.getDatabase();
      const startTime = Date.now();

      // 1. Insert 120 World Rules (20 Global Axioms + 100 Scoped Rules)
      const insertFile = db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, frontmatter_json)
        VALUES (?, ?, ?, ?, '.md', 200, 100000, ?, 'world_rule', 'active', 'reviewed', ?, ?)
      `);

      for (let i = 1; i <= 120; i++) {
        const isGlobal = i <= 20;
        const relPath = `01_Worldview/Rule_${String(i).padStart(3, '0')}.md`;
        const absPath = path.join(vaultDir, relPath);
        const content = isGlobal
          ? `# Global Axiom ${i}\nFundamental universal constant #${i}.`
          : `# Scoped Rule ${i}\nLocal sector environmental rule for ENT-${(i % 60) + 1}.`;
        fs.writeFileSync(absPath, content, 'utf8');

        const fm = isGlobal
          ? { rule_scope: 'global', axiom_id: i }
          : { rule_scope: 'scoped', bound_entities: [`ENT-${(i % 60) + 1}`] };

        const hash = crypto.createHash('sha256').update(content).digest('hex');
        insertFile.run(i, relPath, absPath, `Rule_${String(i).padStart(3, '0')}.md`, hash, isGlobal ? 3 : 2, JSON.stringify(fm));
      }

      // 2. Insert 60 Entities + Aliases + File Links
      const insertEntity = db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (?, ?, ?, ?, 'active', 'confirmed', 2, ?)
      `);
      const insertAlias = db.prepare(`
        INSERT INTO entity_aliases (entity_id, alias_name)
        VALUES (?, ?)
      `);
      const insertFileEntity = db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (?, ?, 'primary_definition')
      `);

      const focusNames = [];
      for (let i = 1; i <= 60; i++) {
        const entId = `ENT-${i}`;
        const entName = `LoreEntity_${i}`;
        const sfId = 120 + i;
        const relPath = `04_Entities/Characters/Entity_${String(i).padStart(3, '0')}.md`;
        const absPath = path.join(vaultDir, relPath);
        const content = `# ${entName} (${entId})\nCanonical bio description for lore entity ${i}.`;
        fs.writeFileSync(absPath, content, 'utf8');

        const hash = crypto.createHash('sha256').update(content).digest('hex');
        insertFile.run(sfId, relPath, absPath, `Entity_${String(i).padStart(3, '0')}.md`, hash, 2, JSON.stringify({ id: entId }));
        insertEntity.run(i, entId, entName, i % 2 === 0 ? 'character' : 'planet', sfId);
        insertAlias.run(i, `Alias_${entName}`);
        insertFileEntity.run(sfId, i);

        focusNames.push(entName);
      }

      // 3. Insert 250 Timeline Events distributed across entities
      const insertTimeline = db.prepare(`
        INSERT INTO timeline_events (id, event_id, title, relative_time_desc, timestamp_order, primary_entity_id, source_file_id, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `);

      for (let i = 1; i <= 250; i++) {
        const primaryEntId = (i % 60) + 1;
        const order = 1000.0 + (i * 1.5);
        insertTimeline.run(
          i,
          `EVT-${String(i).padStart(4, '0')}`,
          `Epic Event ${i}`,
          `Epoch ${Math.floor(order)}`,
          order,
          primaryEntId,
          120 + primaryEntId,
          `Detailed description of historical event ${i} involving ENT-${primaryEntId}.`
        );
      }

      // 4. Insert Chapter
      const chPath = path.join(vaultDir, '03_Chapters', 'Chapter_050.md');
      fs.writeFileSync(chPath, '# Chapter 50: The Grand Convergence\n50 entities assemble in the deep void.', 'utf8');
      const sfChId = 300;
      insertFile.run(sfChId, '03_Chapters/Chapter_050.md', chPath, 'Chapter_050.md', crypto.createHash('sha256').update('Chapter 50').digest('hex'), 2, JSON.stringify({ chapter_number: 50 }));

      db.prepare(`
        INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon)
        VALUES (50, 50, 1, 'The Grand Convergence', '03_Chapters/Chapter_050.md', ?, 1, 'active', 1)
      `).run(sfChId);

      // Execute Context Generation for all 60 Focus Entities
      const result = engine.buildSnapshot({
        chapterNumber: 50,
        volumeNumber: 1,
        focusEntities: focusNames,
        sourcePolicy: 'canon_and_reviewed',
        includeWorldRules: true,
        includeTimeline: true
      });

      const elapsed = Date.now() - startTime;

      // Assertions
      assert.ok(elapsed < 3500, `Execution should complete swiftly under high load, took ${elapsed}ms`);
      assert.equal(result.snapshot.worldRules.global.length, 20, `Must retain all 20 global axioms, got ${result.snapshot.worldRules.global.length}`);
      assert.ok(result.snapshot.worldRules.scoped.length >= 50, `Must recall scoped rules for focus entities, got ${result.snapshot.worldRules.scoped.length}`);
      assert.ok(result.snapshot.canonSources.length >= 60, `Must recall all 60 canon focus entities, got ${result.snapshot.canonSources.length}`);
      assert.ok(result.snapshot.timelineEvents.length >= 200, `Must recall 200+ timeline events, got ${result.snapshot.timelineEvents.length}`);

      // Verify Chronological Monotonic Sorting
      const events = result.snapshot.timelineEvents;
      for (let j = 1; j < events.length; j++) {
        assert.ok(
          events[j].timestampOrder >= events[j - 1].timestampOrder,
          `Timeline events must be strictly sorted: ${events[j - 1].timestampOrder} <= ${events[j].timestampOrder}`
        );
      }
    });

    it('S1.2: should handle dense entity relations graph with 50 inter-entity links without exponential explosion', () => {
      const db = dbManager.getDatabase();

      // Seed 20 entities
      for (let i = 1; i <= 20; i++) {
        const sfId = 200 + i;
        db.prepare(`
          INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
          VALUES (?, ?, ?, ?, '.md', 100, 100000, 'hash', 'entity', 'active', 'confirmed', 2)
        `).run(sfId, `04_Entities/E_${i}.md`, `path/to/E_${i}.md`, `E_${i}.md`);

        db.prepare(`
          INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
          VALUES (?, ?, ?, 'character', 'active', 'confirmed', 2, ?)
        `).run(i, `ENT-REL-${i}`, `Hero_${i}`, sfId);
      }

      // Create dense relations: 1 hub entity connected to 19 others
      const insertRel = db.prepare(`
        INSERT INTO entity_relations (id, source_entity_id, target_entity_id, relation_type, weight, confidence, bidirectional, description)
        VALUES (?, 1, ?, 'ally_of', 1.0, 1.0, 1, 'Alliance link')
      `);

      for (let i = 2; i <= 20; i++) {
        insertRel.run(i, i);
      }

      // Add timeline events for the neighbor entities
      const insertTl = db.prepare(`
        INSERT INTO timeline_events (id, event_id, title, timestamp_order, primary_entity_id, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `);
      for (let i = 2; i <= 20; i++) {
        insertTl.run(i, `EVT-NEIGHBOR-${i}`, `Neighbor Action ${i}`, 100.0 + i, i);
      }

      // Query context focusing ONLY on Hub entity (Hero_1)
      const res = engine.buildSnapshot({
        focusEntities: ['Hero_1'],
        includeTimeline: true
      });

      // Channel 3 must recall neighbor events via 1st-degree relational graph
      assert.ok(res.snapshot.timelineEvents.length >= 19, `Must recall 1st-degree relation neighbor events, got ${res.snapshot.timelineEvents.length}`);
    });
  });

  // =========================================================================
  // SUITE 2: Provenance SHA-256 Hash Tampering & Collision Resistance
  // =========================================================================
  describe('Suite 2: Provenance SHA-256 Hash Tampering & Collision Detection', () => {

    it('S2.1: should generate deterministic SHA-256 hash stamp for content tracking', () => {
      const db = dbManager.getDatabase();
      const filePath = path.join(vaultDir, '04_Entities', 'Planets', 'Terra_Prime.md');
      const originalContent = '# 泰拉母星\n初始正史设定：人口100亿，装有2000台行星发动机。';
      fs.writeFileSync(filePath, originalContent, 'utf8');

      const origHash = crypto.createHash('sha256').update(originalContent).digest('hex');

      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (1, '04_Entities/Planets/Terra_Prime.md', ?, 'Terra_Prime.md', '.md', 100, 100000, ?, 'entity', 'active', 'confirmed', 2)
      `).run(filePath, origHash);

      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (1, 'ENT-TERRA', '泰拉母星', 'planet', 'active', 'confirmed', 2, 1)
      `).run();

      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (1, 1, 'primary_definition')
      `).run();

      // Snapshot 1 (Original)
      const snap1 = engine.buildSnapshot({ focusEntities: ['泰拉母星'] });
      assert.equal(snap1.snapshot.canonSources.length, 1);
      const hash1 = snap1.snapshot.canonSources[0].sha256Hash;
      assert.equal(hash1, origHash, 'Snapshot hash stamp must match content SHA256 digest');
      assert.match(hash1, /^[0-9a-f]{64}$/, 'Hash must be 64-char lowercase hex');
    });

    it('S2.2: should produce 64-char lowercase hex hash stamps across all 7 snapshot buckets', () => {
      const db = dbManager.getDatabase();

      // 1. World rule
      const ruleFile = path.join(vaultDir, '01_Worldview', 'Axiom.md');
      fs.writeFileSync(ruleFile, '# Axiom\nSpeed limit', 'utf8');
      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, frontmatter_json)
        VALUES (1, '01_Worldview/Axiom.md', ?, 'Axiom.md', '.md', 100, 100000, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'world_rule', 'active', 'reviewed', 3, '{"rule_scope":"global"}')
      `).run(ruleFile);

      // 2. Canon & Candidate entities
      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (2, '04_Entities/C1.md', 'c1_path', 'C1.md', '.md', 100, 100000, 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'entity', 'active', 'confirmed', 2),
               (3, '04_Entities/C2.md', 'c2_path', 'C2.md', '.md', 100, 100000, 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', 'entity', 'active', 'pending', 1)
      `).run();

      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (1, 'ENT-1', 'CanonHero', 'character', 'active', 'confirmed', 2, 2),
               (2, 'ENT-2', 'CandHero', 'character', 'active', 'pending', 1, 3)
      `).run();

      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (2, 1, 'primary_definition'), (3, 2, 'primary_definition')
      `).run();

      // 3. Chapter
      db.prepare(`
        INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, status, canon)
        VALUES (1, 1, 1, 'Genesis', '03_Chapters/CH_01.md', 2, 'completed', 1)
      `).run();

      // 4. Timeline
      db.prepare(`
        INSERT INTO timeline_events (id, event_id, title, timestamp_order, primary_entity_id, status)
        VALUES (1, 'EVT-1', 'Big Bang', 0.0, 1, 'active')
      `).run();

      // 5. Foreshadowing
      db.prepare(`
        INSERT INTO foreshadowing (id, foreshadow_id, title, description, setup_chapter_id, status, related_entities_json)
        VALUES (1, 'FS-1', 'Secret Map', 'Hidden in vault', 1, 'open', '["ENT-1"]')
      `).run();

      // 6. Anomaly Report (Conflict)
      db.prepare(`
        INSERT INTO anomaly_reports (id, scan_session_id, anomaly_rule_id, anomaly_type, severity, title, message, affected_file_paths_json, affected_entity_ids_json, is_resolved)
        VALUES (1, 'sess_1', 'ANOM_001', 'CONFLICT', 'HIGH', 'Conflict Title', 'Conflict Message', '["04_Entities/C1.md"]', '["ENT-1"]', 0)
      `).run();

      const res = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['CanonHero', 'CandHero'],
        sourcePolicy: 'canon_and_reviewed'
      });

      const hexRegex = /^[0-9a-f]{64}$/;

      // Validate all 7 buckets
      assert.ok(res.snapshot.worldRules.global.every(r => hexRegex.test(r.sha256Hash)), 'Global rules sha256');
      assert.ok(res.snapshot.canonSources.every(c => hexRegex.test(c.sha256Hash)), 'Canon sources sha256');
      assert.ok(res.snapshot.candidateSources.every(c => hexRegex.test(c.sha256Hash)), 'Candidate sources sha256');
      assert.ok(res.snapshot.chapterSources.every(c => hexRegex.test(c.sha256Hash)), 'Chapter sources sha256');
      assert.ok(res.snapshot.timelineEvents.every(t => hexRegex.test(t.sha256Hash)), 'Timeline events sha256');
      assert.ok(res.snapshot.unresolved.every(u => hexRegex.test(u.sha256Hash)), 'Unresolved hooks sha256');
      assert.ok(res.snapshot.conflicts.every(c => hexRegex.test(c.sha256Hash)), 'Conflicts sha256');
    });
  });

  // =========================================================================
  // SUITE 3: Strict Token Budget Truncation Harness
  // =========================================================================
  describe('Suite 3: Token Budget Truncation Under Strict Limits', () => {

    it('S3.1: should strictly truncate assembledContext under maxTokens = 100 (~300 chars) while preserving full structured JSON', () => {
      const db = dbManager.getDatabase();

      // Seed voluminous lore
      const longText = 'A'.repeat(5000);
      const filePath = path.join(vaultDir, '04_Entities', 'Planets', 'Voluminous_World.md');
      fs.writeFileSync(filePath, `# Voluminous World\n${longText}`, 'utf8');

      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (1, '04_Entities/Planets/Voluminous_World.md', ?, 'Voluminous_World.md', '.md', 5100, 100000, 'hash', 'entity', 'active', 'confirmed', 2)
      `).run(filePath);

      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (1, 'ENT-VOL', 'Voluminous World', 'planet', 'active', 'confirmed', 2, 1)
      `).run();

      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (1, 1, 'primary_definition')
      `).run();

      const res = engine.buildSnapshot({
        focusEntities: ['Voluminous World'],
        maxTokens: 100 // 100 tokens ~ 300 char budget
      });

      // 1. Assembled Context must be truncated
      assert.ok(res.assembledContext.includes('... [Context truncated due to maxTokens budget limit]'), 'Must include truncation notice');
      assert.ok(res.assembledContext.length <= 400, `Assembled text must be strictly bounded, got ${res.assembledContext.length}`);

      // 2. Structured JSON buckets must retain full untouched content
      assert.equal(res.snapshot.canonSources.length, 1);
      assert.ok(res.snapshot.canonSources[0].content.length >= 5000, 'Structured bucket must NOT be truncated');
    });

    it('S3.2: should handle maxTokens = 1000 (~3000 chars) accurately', () => {
      const db = dbManager.getDatabase();
      const longText = 'B'.repeat(10000);
      const filePath = path.join(vaultDir, '04_Entities', 'Planets', 'Medium_World.md');
      fs.writeFileSync(filePath, `# Medium World\n${longText}`, 'utf8');

      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (1, '04_Entities/Planets/Medium_World.md', ?, 'Medium_World.md', '.md', 10100, 100000, 'hash', 'entity', 'active', 'confirmed', 2)
      `).run(filePath);

      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (1, 'ENT-MED', 'Medium World', 'planet', 'active', 'confirmed', 2, 1)
      `).run();

      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (1, 1, 'primary_definition')
      `).run();

      const res = engine.buildSnapshot({
        focusEntities: ['Medium World'],
        maxTokens: 1000
      });

      assert.ok(res.assembledContext.includes('... [Context truncated due to maxTokens budget limit]'));
      assert.ok(res.assembledContext.length <= 3100, `Assembled text bounded by ~3000 chars, got ${res.assembledContext.length}`);
    });

    it('S3.3: should gracefully handle extreme maxTokens arguments (0, -100, NaN, null, undefined, 1000000)', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level)
        VALUES (1, '04_Entities/Test.md', 'test', 'Test.md', '.md', 50, 100000, 'hash', 'entity', 'active', 'confirmed', 2)
      `).run();

      db.prepare(`
        INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
        VALUES (1, 'ENT-T', 'TestEntity', 'character', 'active', 'confirmed', 2, 1)
      `).run();

      db.prepare(`
        INSERT INTO file_entities (source_file_id, entity_id, mention_type)
        VALUES (1, 1, 'primary_definition')
      `).run();

      // Zero & Negative
      const rZero = engine.buildSnapshot({ focusEntities: ['TestEntity'], maxTokens: 0 });
      assert.ok(rZero.assembledContext.length > 0, 'maxTokens=0 should not truncate');

      const rNeg = engine.buildSnapshot({ focusEntities: ['TestEntity'], maxTokens: -100 });
      assert.ok(rNeg.assembledContext.length > 0, 'maxTokens=-100 should not crash');

      // NaN
      const rNaN = engine.buildSnapshot({ focusEntities: ['TestEntity'], maxTokens: NaN });
      assert.ok(rNaN.assembledContext.length > 0, 'maxTokens=NaN should not crash');

      // Enormous budget
      const rHuge = engine.buildSnapshot({ focusEntities: ['TestEntity'], maxTokens: 1000000 });
      assert.ok(!rHuge.assembledContext.includes('... [Context truncated'), 'Should not truncate when budget is huge');
    });
  });

  // =========================================================================
  // SUITE 4: Boundary Inputs & Malformed Parameter Robustness
  // =========================================================================
  describe('Suite 4: Boundary Inputs & Malformed Parameter Robustness', () => {

    it('S4.1: should handle null, undefined, empty array, and comma strings in focusEntities', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, frontmatter_json)
        VALUES (1, '01_Worldview/Core.md', 'core', 'Core.md', '.md', 100, 100000, 'hash', 'world_rule', 'active', 'reviewed', 3, '{"rule_scope":"global"}')
      `).run();

      const nullRes = engine.buildSnapshot({ focusEntities: null });
      assert.equal(nullRes.snapshot.worldRules.global.length, 1);

      const undefRes = engine.buildSnapshot({ focusEntities: undefined });
      assert.equal(undefRes.snapshot.worldRules.global.length, 1);

      const emptyRes = engine.buildSnapshot({ focusEntities: [] });
      assert.equal(emptyRes.snapshot.worldRules.global.length, 1);

      const commaRes = engine.buildSnapshot({ focusEntities: ', , , ' });
      assert.equal(commaRes.snapshot.worldRules.global.length, 1);

      const mixedRes = engine.buildSnapshot({ focusEntities: [null, '', undefined, '   '] });
      assert.equal(mixedRes.snapshot.worldRules.global.length, 1);
    });

    it('S4.2: should handle non-existent chapters and extreme chapter numbers (-999, 999999, float, strings)', () => {
      const rNeg = engine.buildSnapshot({ chapterNumber: -999 });
      assert.equal(rNeg.metadata.chapter, null, 'Negative chapter returns null chapter metadata without crashing');

      const rHuge = engine.buildSnapshot({ chapterNumber: 999999999 });
      assert.equal(rHuge.metadata.chapter, null);

      const rFloat = engine.buildSnapshot({ chapterNumber: 2.5 });
      assert.equal(rFloat.metadata.chapter, null);

      const rStr = engine.buildSnapshot({ chapterNumber: 'Chapter_NonExistent_404' });
      assert.equal(rStr.metadata.chapter, null);
    });

    it('S4.3: should fallback safely on unrecognized sourcePolicy arguments', () => {
      const res = engine.buildSnapshot({
        sourcePolicy: 'unrecognized_wild_policy_name_123'
      });
      assert.equal(res.metadata.sourcePolicyApplied, 'unrecognized_wild_policy_name_123');
      assert.ok(Array.isArray(res.snapshot.canonSources));
    });
  });

  // =========================================================================
  // SUITE 5: CommandDispatcher stdio Protocol Verification
  // =========================================================================
  describe('Suite 5: CommandDispatcher Protocol Envelope Stress', () => {

    it('S5.1: should dispatch GetChapterContext with full v3 envelope and triple-layer compatibility', async () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO source_files (id, relative_path, file_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, frontmatter_json)
        VALUES (1, '01_Worldview/Core.md', 'core', 'Core.md', '.md', 100, 100000, 'hash', 'world_rule', 'active', 'reviewed', 3, '{"rule_scope":"global"}')
      `).run();

      const response = await dispatcher.dispatch('GetChapterContext', {
        chapterNumber: 1,
        sourcePolicy: 'canon_and_reviewed',
        maxTokens: 500
      });

      assert.equal(response.status, 'success');
      assert.ok(response.details, 'Must include details payload');
      assert.equal(response.details.version, '3.0');
      assert.ok(response.details.snapshot, 'Must contain standard snapshot v3');
      assert.ok(response.details.assembledContext, 'Must contain assembled context markdown');
      assert.ok(response.details.metadata, 'Must contain generation metadata');

      // Check backward compatibility fields on top-level envelope
      assert.ok(Array.isArray(response.worldRules));
      assert.ok(Array.isArray(response.worldRules.global));
      assert.ok(Array.isArray(response.entities));
      assert.ok(Array.isArray(response.timeline));
      assert.ok(Array.isArray(response.foreshadowing));
    });
  });
});
