/**
 * @file contextV3Engine.test.js
 * @description Unit and verification tests for Context v3 Engine, Global Rules & Provenance (Milestone 4)
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const ContextV3Engine = require('../../src/context/ContextV3Engine');
const RuleClassifier = require('../../src/context/RuleClassifier');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');

describe('Milestone 4: Context v3 Aggregator & Provenance Tracking', () => {
  let dbManager;
  let dispatcher;
  let engine;

  beforeEach(() => {
    dbManager = DatabaseManager.initDatabase(':memory:');
    dispatcher = new CommandDispatcher({ dbManager });
    engine = new ContextV3Engine(dbManager);

    const db = dbManager.getDatabase();

    // 1. World rules: 1 global axiom (canon_level=3) + 1 explicit scoped rule
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, frontmatter_json, word_count)
      VALUES (1, '/mock/01_Worldview/Universal_Axioms.md', '01_Worldview/Universal_Axioms.md', 'Universal_Axioms.md', '.md', 100, 1000, '1111111111111111111111111111111111111111111111111111111111111111', 'world_rule', 'active', 'reviewed', 3, '{"rule_scope":"global","title":"Speed of Light Invariant"}', 300),
             (2, '/mock/01_Worldview/Terra_Local_Atmosphere.md', '01_Worldview/Terra_Local_Atmosphere.md', 'Terra_Local_Atmosphere.md', '.md', 100, 1000, '2222222222222222222222222222222222222222222222222222222222222222', 'world_rule', 'active', 'reviewed', 2, '{"rule_scope":"scoped","scope":"local"}', 250)
    `).run();

    // 2. Entities: 1 canon planet (Terra), 1 candidate character (Lin Yuan Draft), 1 unreviewed draft
    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (3, '/mock/04_Entities/Planets/Terra.md', '04_Entities/Planets/Terra.md', 'Terra.md', '.md', 100, 1000, '3333333333333333333333333333333333333333333333333333333333333333', 'entity', 'active', 'reviewed', 2, 1000),
             (4, '/mock/04_Entities/Characters/LinYuan_Idea.md', '04_Entities/Characters/LinYuan_Idea.md', 'LinYuan_Idea.md', '.md', 100, 1000, '4444444444444444444444444444444444444444444444444444444444444444', 'entity', 'active', 'pending', 1, 600),
             (5, '/mock/04_Entities/Characters/OldDraft.md', '04_Entities/Characters/OldDraft.md', 'OldDraft.md', '.md', 100, 1000, '5555555555555555555555555555555555555555555555555555555555555555', 'draft', 'draft', 'pending', 0, 400)
    `).run();

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'ENT-TERRA', 'Terra Prime', 'planet', 'active', 'reviewed', 2, 3),
             (2, 'ENT-LIN', 'Lin Yuan', 'character', 'active', 'pending', 1, 4),
             (3, 'ENT-DRAFT', 'Draft Hero', 'character', 'draft', 'pending', 0, 5)
    `).run();

    db.prepare(`
      INSERT INTO file_entities (source_file_id, entity_id, mention_type)
      VALUES (3, 1, 'definition'),
             (4, 2, 'definition'),
             (5, 3, 'definition')
    `).run();

    // 3. Chapters
    db.prepare(`
      INSERT INTO chapters (id, chapter_number, volume_number, title, relative_path, source_file_id, pov_entity_id, status, canon, timeline_start, timeline_end)
      VALUES (1, 1, 1, 'Dawn Over Terra', '03_Chapters/Chapter_01.md', 3, 2, 'completed', 1, 2040.0, 2041.0),
             (2, 2, 1, 'Flight Beyond Orbit', '03_Chapters/Chapter_02.md', 4, 2, 'draft', 0, 2042.0, 2043.0)
    `).run();

    // 4. Timeline Events
    db.prepare(`
      INSERT INTO timeline_events (event_id, title, relative_time_desc, timestamp_order, primary_entity_id)
      VALUES ('EVT-100', 'Terra Colonization Epoch', '2040.0101', 2040.0101, 1),
             ('EVT-101', 'Lin Yuan First Flight', '2042.0601', 2042.0601, 2)
    `).run();

    // 5. Foreshadowing
    db.prepare(`
      INSERT INTO foreshadowing (foreshadow_id, title, description, setup_chapter_id, introduced_chapter, status, related_entities_json)
      VALUES ('FS-100', 'The Lost Signal of Terra', 'Mysterious beacon detected', 1, '1', 'open', '["ENT-TERRA"]')
    `).run();
  });

  afterEach(() => {
    if (dbManager) dbManager.close();
  });

  describe('RuleClassifier', () => {
    it('should classify global axioms vs scoped rules accurately', () => {
      const globalRule = { frontmatter_json: '{"rule_scope":"global"}', canon_level: 3, file_name: 'Axiom.md' };
      assert.equal(RuleClassifier.isGlobal(globalRule), true);

      const scopedRule = { frontmatter_json: '{"rule_scope":"scoped"}', canon_level: 2, file_name: 'Local.md' };
      assert.equal(RuleClassifier.isGlobal(scopedRule), false);
    });
  });

  describe('ContextV3Engine Snapshot Generation & Filtering', () => {
    it('should always include global world rules without focus entity match', () => {
      // Focus on Lin Yuan only (no relation to world rule text)
      const res = engine.buildSnapshot({
        chapterNumber: 2,
        volumeNumber: 1,
        focusEntities: ['Lin Yuan']
      });

      assert.ok(res.snapshot.worldRules.global.length >= 1, 'Global rules must never be filtered out');
      assert.equal(res.snapshot.worldRules.global[0].canonicalName, 'Universal_Axioms');
      assert.equal(res.snapshot.worldRules.global[0].scopeType, 'global');
      assert.ok(res.snapshot.worldRules.global[0].sha256Hash, 'Must have SHA-256 hash');
    });

    it('should enforce sourcePolicy filtering correctly', () => {
      // 1. canon_only policy (should exclude Level 1 Lin Yuan and Level 0 draft)
      const canonOnly = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['Terra Prime', 'Lin Yuan'],
        sourcePolicy: 'canon_only'
      });

      assert.ok(canonOnly.snapshot.canonSources.some(c => c.canonicalName === 'Terra Prime'));
      assert.equal(canonOnly.snapshot.candidateSources.length, 0, 'Candidate sources must be excluded under canon_only');

      // 2. canon_and_reviewed policy
      const canonAndReviewed = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['Terra Prime', 'Lin Yuan'],
        sourcePolicy: 'canon_and_reviewed'
      });
      assert.ok(canonAndReviewed.snapshot.canonSources.length >= 1);

      // 3. all policy (includes everything)
      const allPolicy = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['Terra Prime', 'Lin Yuan', 'Draft Hero'],
        sourcePolicy: 'all'
      });
      assert.ok(allPolicy.metadata.totalSources >= 3);
    });

    it('should recall structured timeline events and open foreshadowing', () => {
      const res = engine.buildSnapshot({
        chapterNumber: 1,
        focusEntities: ['Terra Prime']
      });

      assert.ok(res.snapshot.timelineEvents.some(t => t.eventId === 'EVT-100'));
      assert.ok(res.snapshot.unresolved.some(f => f.foreshadowId === 'FS-100'));
      assert.ok(res.snapshot.timelineEvents[0].sha256Hash);
    });

    it('should dispatch GetChapterContext via CommandDispatcher with v3 snapshot format', async () => {
      const res = await dispatcher.dispatch('GetChapterContext', {
        chapterId: 1,
        focusEntities: ['Terra Prime'],
        sourcePolicy: 'canon_and_reviewed'
      });

      assert.equal(res.status, 'success');
      assert.ok(res.snapshot);
      assert.ok(res.snapshot.worldRules);
      assert.ok(res.assembledContext || (res.content && res.content.length > 0));
    });
  });
});
