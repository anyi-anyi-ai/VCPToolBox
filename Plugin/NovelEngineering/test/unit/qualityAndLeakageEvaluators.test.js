/**
 * @file qualityAndLeakageEvaluators.test.js
 * @description Unit tests for CanonLeakageEvaluator (R5-FIX 7 Checks) and QualityEvaluators (R8).
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const CanonLeakageEvaluator = require('../../src/collaboration/CanonLeakageEvaluator');
const QualityEvaluators = require('../../src/collaboration/QualityEvaluators');

describe('Phase 4 Milestone 2: Quality & Leakage Evaluators Test Suite', () => {
  let dbManager;
  let leakageEvaluator;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    leakageEvaluator = new CanonLeakageEvaluator(dbManager);
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) dbManager.close();
  });

  describe('1. CanonLeakageEvaluator 7 Checks (R5-FIX)', () => {
    it('Check 1 (100% RECALL): should catch reference to archived entity', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO entities (entity_id, canonical_name, entity_type, status, review_status, canon_level)
        VALUES ('old_relic_01', '遗弃空间站', 'station', 'archived', 'archived', 0)
      `).run();

      const draft = '舰队在遗弃空间站稍作休整后继续跃迁。';
      const report = leakageEvaluator.evaluateLeakage({
        projectId: '流浪',
        chapterId: 'Vol1_Ch01',
        draftContent: draft
      });

      assert.strictEqual(report.passed, false);
      assert.strictEqual(report.checks.archivedContentLeak.passed, false);
      assert.ok(report.violations.some(v => v.matchText === '遗弃空间站'));
    });

    it('Check 2: should catch candidate treated as canon', () => {
      const draft = '据可靠消息，暗影黑洞确实存在。';
      const report = leakageEvaluator.evaluateLeakage({
        draftContent: draft,
        snapshotContext: {
          semanticCandidates: [{ candidateId: 'cand_1', title: '暗影黑洞' }]
        }
      });

      assert.strictEqual(report.checks.candidateAsCanonLeak.passed, false);
    });

    it('Check 3: should catch premature timeline events', () => {
      const db = dbManager.getDatabase();
      db.prepare(`
        INSERT INTO timeline_events (event_id, title, timestamp_order)
        VALUES ('EV-002', '第二次跃迁战役', 10)
      `).run();

      const draft = '在第二次跃迁战役爆发时，众人震惊。';
      const report = leakageEvaluator.evaluateLeakage({
        chapterNumber: 2, // Chapter 2 referencing Chapter 10 event
        draftContent: draft
      });

      assert.strictEqual(report.checks.prematureTimelineLeak.passed, false);
    });

    it('Check 4: should catch character knowledge boundary violations', () => {
      const draft = '李林在酒馆中低声自语：“暗星计划的核心秘密就是反物质反应堆。”';
      const report = leakageEvaluator.evaluateLeakage({
        draftContent: draft,
        metadata: {
          characterKnowledgeBoundaries: {
            '李林': ['反物质反应堆']
          }
        }
      });

      assert.strictEqual(report.checks.characterKnowledgeLeak.passed, false);
      assert.ok(report.violations.some(v => v.checkType === 'characterKnowledgeLeak'));
    });

    it('Check 5: should catch unconfirmed decision queue settings', () => {
      dbManager.enqueueDecision({
        decisionType: 'CHANGE_CANON',
        proposer: 'Agent',
        targetEntityId: 'forbidden_weapon_x',
        proposedChanges: 'Super weapon'
      });

      const draft = '他们启动了 forbidden_weapon_x。';
      const report = leakageEvaluator.evaluateLeakage({ draftContent: draft });

      assert.strictEqual(report.passed, false);
      assert.strictEqual(report.checks.unconfirmedSettingLeak.passed, false);
    });

    it('Check 6: should catch keywords from other draft branches', () => {
      const draft = '在分支剧情中，探索队发现了幽灵母舰。';
      const report = leakageEvaluator.evaluateLeakage({
        draftContent: draft,
        metadata: {
          otherBranchKeywords: ['幽灵母舰']
        }
      });

      assert.strictEqual(report.checks.otherBranchLeak.passed, false);
      assert.ok(report.violations.some(v => v.checkType === 'otherBranchLeak'));
    });

    it('Check 7: should catch outdated superseded memories', () => {
      const draft = '灰港星总督仍然是老雷诺。';
      const report = leakageEvaluator.evaluateLeakage({
        draftContent: draft,
        metadata: {
          supersededMemories: ['老雷诺']
        }
      });

      assert.strictEqual(report.checks.outdatedMemoryLeak.passed, false);
      assert.ok(report.violations.some(v => v.checkType === 'outdatedMemoryLeak'));
    });
  });

  describe('2. QualityEvaluators (R8)', () => {
    it('EvaluateContextPrecision: should calculate precision score correctly', () => {
      const snapshot = {
        canonFacts: [
          { canonicalName: '灰港星', category: 'planet' },
          { canonicalName: '无关恒星', category: 'star' }
        ]
      };

      const result = QualityEvaluators.EvaluateContextPrecision(snapshot, {
        focusEntities: ['灰港星']
      });

      assert.strictEqual(result.totalItems, 2);
      assert.strictEqual(result.relevantItems, 1);
      assert.strictEqual(result.precisionScore, 0.5);
    });

    it('EvaluateContextRecall: should calculate recall and identify missing entities', () => {
      const snapshot = {
        canonFacts: [{ canonicalName: '灰港星' }]
      };
      const fullFacts = [
        { canonicalName: '灰港星' },
        { canonicalName: '黑石要塞' }
      ];

      const result = QualityEvaluators.EvaluateContextRecall(snapshot, {
        focusEntities: ['灰港星', '黑石要塞']
      }, fullFacts);

      assert.strictEqual(result.expectedItemsCount, 2);
      assert.strictEqual(result.recalledItemsCount, 1);
      assert.strictEqual(result.recallScore, 0.5);
      assert.strictEqual(result.missedEntities.length, 1);
    });

    it('EvaluateMemoryConflict: should detect status conflict between memory and canon', () => {
      const memories = [
        { targetEntityId: 'hui_gang', status: 'destroyed' }
      ];
      const canonFacts = [
        { entityId: 'hui_gang', status: 'active' }
      ];

      const result = QualityEvaluators.EvaluateMemoryConflict(memories, canonFacts);
      assert.strictEqual(result.passed, false);
      assert.strictEqual(result.conflictCount, 1);
      assert.strictEqual(result.conflicts[0].severity, 'CRITICAL');
    });
  });
});
