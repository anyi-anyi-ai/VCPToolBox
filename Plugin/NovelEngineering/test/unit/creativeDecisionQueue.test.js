/**
 * @file creativeDecisionQueue.test.js
 * @description Unit tests for CreativeDecisionQueue (Staging Queue & Zero Canon Mutation Isolation).
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const DatabaseManager = require('../../src/db/DatabaseManager');
const CreativeDecisionQueue = require('../../src/collaboration/CreativeDecisionQueue');
const { CollaborationError } = require('../../src/errors');

describe('Phase 4 Milestone 2: CreativeDecisionQueue Test Suite', () => {
  let dbManager;
  let queue;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    queue = new CreativeDecisionQueue(dbManager);
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) dbManager.close();
  });

  describe('1. Proposal Enqueue & Pending State', () => {
    it('should register decision proposal with pending_author_confirmation status', () => {
      const decision = queue.registerDecision({
        projectId: '流浪',
        chapterId: 'Vol1_Ch02',
        decisionType: 'ADD_ENTITY',
        proposer: 'Agent_Writer',
        targetEntityId: 'star_alpha',
        proposedChanges: { canonicalName: '阿尔法星', type: 'planet' },
        rationale: '第2章需要引入的新行星'
      });

      assert.ok(decision.queue_id);
      assert.strictEqual(decision.status, 'pending_author_confirmation');
      assert.strictEqual(decision.authority, 'agent_proposal');
      assert.ok(decision.sha256_hash);
    });
  });

  describe('2. CRITICAL ISOLATION: Zero Canon Mutation Bombardment', () => {
    it('100-call bombardment must strictly isolate data in canon_changes_queue without touching canon facts', () => {
      const db = dbManager.getDatabase();
      const initialEntitiesCount = db.prepare('SELECT count(*) AS cnt FROM entities').get().cnt;
      const initialCanonChangesCount = db.prepare('SELECT count(*) AS cnt FROM canon_changes').get().cnt;

      for (let i = 0; i < 100; i++) {
        queue.registerDecision({
          decisionType: 'MODIFY_CANON',
          proposer: `Bot_${i}`,
          targetEntityId: `ent_${i}`,
          proposedChanges: { state: 'altered' }
        });
      }

      const pendingCount = queue.getPendingDecisions().length;
      assert.strictEqual(pendingCount, 100);

      // Verify canon tables are completely untouched
      const finalEntitiesCount = db.prepare('SELECT count(*) AS cnt FROM entities').get().cnt;
      const finalCanonChangesCount = db.prepare('SELECT count(*) AS cnt FROM canon_changes').get().cnt;

      assert.strictEqual(finalEntitiesCount, initialEntitiesCount);
      assert.strictEqual(finalCanonChangesCount, initialCanonChangesCount);
    });
  });

  describe('3. Review Flow', () => {
    it('should approve and reject decisions correctly', () => {
      const d1 = queue.registerDecision({ decisionType: 'RULE', proposer: 'Agent', proposedChanges: 'Rule A' });
      const d2 = queue.registerDecision({ decisionType: 'RULE', proposer: 'Agent', proposedChanges: 'Rule B' });

      const approved = queue.reviewDecision(d1.queue_id, { action: 'approve', reviewer: 'Lead_Author' });
      assert.strictEqual(approved.status, 'approved_for_canon');
      assert.strictEqual(approved.reviewed_by, 'Lead_Author');

      const rejected = queue.reviewDecision(d2.queue_id, { action: 'reject', reviewer: 'Lead_Author', comment: 'Rejected' });
      assert.strictEqual(rejected.status, 'rejected');
    });
  });
});
