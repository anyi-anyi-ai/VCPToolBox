/**
 * @file m2_governance_safety_adversarial.test.js
 * @description Empirical Adversarial Security Challenger Test Suite for Milestone 2 Governance Safety Gate
 * @module test/unit/m2_governance_safety_adversarial
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const DatabaseManager = require('../../src/db/DatabaseManager');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const GovernanceEngine = require('../../src/governance/GovernanceEngine');
const SafetyGate = require('../../src/governance/SafetyGate');
const { GovernanceSafetyError, NovelError } = require('../../src/errors');

describe('Adversarial Security Challenger: Milestone 2 Governance Safety Gate', () => {
  let dbManager = null;
  let dispatcher = null;
  let engine = null;

  let activeSourceFile = null;
  let draftSourceFile = null;
  let archivedSourceFile = null;
  let deletedSourceFile = null;

  let activeEntity = null;
  let draftEntity = null;
  let archivedEntity = null;
  let deletedEntity = null;
  let wikilinkEntity = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    dispatcher = new CommandDispatcher({ dbManager });
    engine = new GovernanceEngine(dbManager);

    // 1. Seed Source Files across all lifecycle statuses
    activeSourceFile = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-001/00_星球总览.md',
      relative_path: '04_星球档案/V-001/00_星球总览.md',
      file_name: '00_星球总览.md',
      source_category: 'entity',
      status: 'active',
      review_status: 'pending',
      canon_level: 0
    });

    draftSourceFile = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/13_小说工程插件/篇章草稿/CH_001_草稿.md',
      relative_path: '13_小说工程插件/篇章草稿/CH_001_草稿.md',
      file_name: 'CH_001_草稿.md',
      source_category: 'draft',
      status: 'draft',
      review_status: 'pending',
      canon_level: 0
    });

    archivedSourceFile = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-999/废弃档案.md',
      relative_path: '04_星球档案/V-999/废弃档案.md',
      file_name: '废弃档案.md',
      source_category: 'entity',
      status: 'archived',
      review_status: 'rejected',
      canon_level: 0
    });

    deletedSourceFile = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-000/已删除文件.md',
      relative_path: '04_星球档案/V-000/已删除文件.md',
      file_name: '已删除文件.md',
      source_category: 'entity',
      status: 'deleted',
      review_status: 'rejected',
      canon_level: 0
    });

    // 2. Seed Entities
    activeEntity = dbManager.entities.insert({
      entity_id: 'PL-001',
      canonical_name: '泰拉',
      entity_type: 'planet',
      status: 'active',
      review_status: 'pending',
      canon_level: 0,
      source_file_id: activeSourceFile.id
    });

    draftEntity = dbManager.entities.insert({
      entity_id: 'CHAR-001',
      canonical_name: '草稿角色',
      entity_type: 'character',
      status: 'draft',
      review_status: 'pending',
      canon_level: 0,
      source_file_id: draftSourceFile.id
    });

    archivedEntity = dbManager.entities.insert({
      entity_id: 'PL-999',
      canonical_name: '废弃星球',
      entity_type: 'planet',
      status: 'archived',
      review_status: 'reviewed', // Even if reviewed, status is archived!
      canon_level: 0,
      source_file_id: archivedSourceFile.id
    });

    deletedEntity = dbManager.entities.insert({
      entity_id: 'PL-000',
      canonical_name: '已删除实体',
      entity_type: 'planet',
      status: 'deleted',
      review_status: 'rejected',
      canon_level: 0,
      source_file_id: deletedSourceFile.id
    });

    wikilinkEntity = dbManager.entities.insert({
      entity_id: 'SYS-SOL',
      canonical_name: '太阳系',
      entity_type: 'location',
      status: 'active',
      review_status: 'pending',
      canon_level: 0
    });

    // Mentions
    dbManager.entities.addMention({
      source_file_id: activeSourceFile.id,
      entity_id: activeEntity.id,
      mention_type: 'definition'
    });

    dbManager.entities.addMention({
      source_file_id: activeSourceFile.id,
      entity_id: wikilinkEntity.id,
      mention_type: 'wikilink'
    });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // ==========================================================================
  // Attack Group 1: Token Forgery & Authorization Bypass Attempts
  // ==========================================================================
  describe('Attack Group 1: Token Forgery & Confirmation Bypass', () => {
    const attackTokens = [
      { desc: 'undefined / missing token', params: {} },
      { desc: 'null token', params: { confirmationToken: null } },
      { desc: 'empty string token', params: { confirmationToken: '' } },
      { desc: 'whitespace string token', params: { confirmationToken: '   ' } },
      { desc: 'lowercase token', params: { confirmationToken: 'confirm_canon_change' } },
      { desc: 'padded token', params: { confirmationToken: ' CONFIRM_CANON_CHANGE ' } },
      { desc: 'null-byte injected token', params: { confirmationToken: 'CONFIRM_CANON_CHANGE\0admin' } },
      { desc: 'numeric token', params: { confirmationToken: 12345 } },
      { desc: 'boolean true as token', params: { confirmationToken: true } },
      { desc: 'array token', params: { confirmationToken: ['CONFIRM_CANON_CHANGE'] } },
      { desc: 'object token', params: { confirmationToken: { token: 'CONFIRM_CANON_CHANGE' } } },
      { desc: 'SQLi token', params: { confirmationToken: "CONFIRM_CANON_CHANGE' OR 1=1 --" } },
      { desc: 'confirmCanonChange = false', params: { confirmCanonChange: false } },
      { desc: 'confirmCanonChange = "true" (string)', params: { confirmCanonChange: 'true' } },
      { desc: 'confirmCanonChange = 1 (number)', params: { confirmCanonChange: 1 } },
      { desc: 'confirmCanonChange = true with wrong confirmationToken', params: { confirmCanonChange: true, confirmationToken: 'INVALID_TOKEN' } }
    ];

    for (const { desc, params } of attackTokens) {
      it(`should reject PromoteSourceToCanon on ${desc}`, async () => {
        const changesBefore = dbManager.canonChanges.getSummary().totalChanges;

        await assert.rejects(
          async () => {
            await dispatcher.dispatch('PromoteSourceToCanon', {
              filePath: activeSourceFile.relative_path,
              targetCanonLevel: 2,
              ...params
            });
          },
          (err) => {
            assert.ok(err instanceof GovernanceSafetyError, `Expected GovernanceSafetyError but got ${err.constructor.name}`);
            assert.equal(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
            return true;
          }
        );

        // Verify zero mutations and zero audit entries
        const fileAfter = dbManager.sourceFiles.getById(activeSourceFile.id);
        assert.equal(fileAfter.canon_level, 0);
        assert.equal(fileAfter.review_status, 'pending');

        const changesAfter = dbManager.canonChanges.getSummary().totalChanges;
        assert.equal(changesAfter, changesBefore, 'No audit record should be created on failed token check');
      });

      it(`should reject DeprecateSource on ${desc}`, async () => {
        const changesBefore = dbManager.canonChanges.getSummary().totalChanges;

        await assert.rejects(
          async () => {
            await dispatcher.dispatch('DeprecateSource', {
              filePath: activeSourceFile.relative_path,
              reason: 'Adversarial deprecation test',
              ...params
            });
          },
          (err) => {
            assert.ok(err instanceof GovernanceSafetyError, `Expected GovernanceSafetyError but got ${err.constructor.name}`);
            assert.equal(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
            return true;
          }
        );

        // Verify zero mutations and zero audit entries
        const fileAfter = dbManager.sourceFiles.getById(activeSourceFile.id);
        assert.equal(fileAfter.status, 'active');

        const changesAfter = dbManager.canonChanges.getSummary().totalChanges;
        assert.equal(changesAfter, changesBefore, 'No audit record should be created on failed token check');
      });
    }
  });

  // ==========================================================================
  // Attack Group 2: Anti-Silent Promotion Gate (Unreviewed / Draft / Rejected)
  // ==========================================================================
  describe('Attack Group 2: Anti-Silent Promotion of Unreviewed Drafts to Canon', () => {
    const unreviewedStatuses = ['pending', 'unreviewed', 'in_review', 'rejected', 'draft', ''];

    for (const rStatus of unreviewedStatuses) {
      it(`should block source_file promotion to canon level 2 when review_status is "${rStatus}"`, async () => {
        // Set review_status directly in DB
        dbManager.getDatabase().prepare('UPDATE source_files SET review_status = ? WHERE id = ?').run(rStatus, activeSourceFile.id);

        await assert.rejects(
          async () => {
            await dispatcher.dispatch('PromoteSourceToCanon', {
              filePath: activeSourceFile.relative_path,
              targetCanonLevel: 2,
              confirmationToken: 'CONFIRM_CANON_CHANGE'
            });
          },
          (err) => {
            assert.ok(err instanceof GovernanceSafetyError);
            assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
            assert.match(err.message, /Direct silent promotion of unreviewed draft to canon/);
            return true;
          }
        );

        // Verify state remains unpromoted
        const dbFile = dbManager.sourceFiles.getById(activeSourceFile.id);
        assert.equal(dbFile.canon_level, 0);
      });

      it(`should block entity direct promotion to canon level 3 when review_status is "${rStatus}"`, async () => {
        dbManager.getDatabase().prepare('UPDATE entities SET review_status = ? WHERE id = ?').run(rStatus, activeEntity.id);

        await assert.rejects(
          async () => {
            await dispatcher.dispatch('PromoteSourceToCanon', {
              entityId: activeEntity.entity_id,
              targetCanonLevel: 3,
              confirmationToken: 'CONFIRM_CANON_CHANGE'
            });
          },
          (err) => {
            assert.ok(err instanceof GovernanceSafetyError);
            assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
            return true;
          }
        );

        // Verify state remains unpromoted
        const dbEnt = dbManager.entities.getById(activeEntity.id);
        assert.equal(dbEnt.canon_level, 0);
      });
    }

    it('should block promotion of draft source file even if token is provided', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: draftSourceFile.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
          return true;
        }
      );
    });

    it('should block promotion of draft entity even if token is provided', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            entityId: draftEntity.entity_id,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
          return true;
        }
      );
    });
  });

  // ==========================================================================
  // Attack Group 3: Promotion of Archived / Deleted Records
  // ==========================================================================
  describe('Attack Group 3: Promotion of Archived / Deleted Records', () => {
    it('should block promotion on archived source file with INVALID_STATUS_FOR_PROMOTION', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: archivedSourceFile.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'INVALID_STATUS_FOR_PROMOTION');
          assert.match(err.message, /Cannot promote source_file with status "archived"/);
          return true;
        }
      );
    });

    it('should block promotion on archived entity (even if review_status is reviewed) with INVALID_STATUS_FOR_PROMOTION', async () => {
      assert.equal(archivedEntity.review_status, 'reviewed'); // Ensure it was seeded as reviewed

      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            entityId: archivedEntity.entity_id,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'INVALID_STATUS_FOR_PROMOTION');
          assert.match(err.message, /Cannot promote entity with status "archived"/);
          return true;
        }
      );
    });

    it('should block promotion on deleted source file with INVALID_STATUS_FOR_PROMOTION', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: deletedSourceFile.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'INVALID_STATUS_FOR_PROMOTION');
          return true;
        }
      );
    });

    it('should block promotion on deleted entity with INVALID_STATUS_FOR_PROMOTION', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            entityId: deletedEntity.entity_id,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'INVALID_STATUS_FOR_PROMOTION');
          return true;
        }
      );
    });
  });

  // ==========================================================================
  // Attack Group 4: Deprecating Already-Deleted Records
  // ==========================================================================
  describe('Attack Group 4: Deprecating Already-Deleted Sources', () => {
    it('should block deprecation of deleted source file with ALREADY_DELETED', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('DeprecateSource', {
            filePath: deletedSourceFile.relative_path,
            confirmationToken: 'CONFIRM_CANON_CHANGE',
            reason: 'Attempting to re-deprecate deleted file'
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'ALREADY_DELETED');
          assert.match(err.message, /Target source_file is already deleted/);
          return true;
        }
      );
    });

    it('should block deprecation of deleted entity with ALREADY_DELETED', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('DeprecateSource', {
            entityId: deletedEntity.entity_id,
            confirmationToken: 'CONFIRM_CANON_CHANGE',
            reason: 'Attempting to re-deprecate deleted entity'
          });
        },
        (err) => {
          assert.ok(err instanceof GovernanceSafetyError);
          assert.equal(err.code, 'ALREADY_DELETED');
          assert.match(err.message, /Target entity is already deleted/);
          return true;
        }
      );
    });
  });

  // ==========================================================================
  // Attack Group 5: Cascade Boundary Containment & Untracked Mutation Defenses
  // ==========================================================================
  describe('Attack Group 5: Mutation Containment & Audit Integrity', () => {
    it('should NOT cascade review status changes to wikilink/referenced entities', async () => {
      const res = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: activeSourceFile.relative_path,
        reviewStatus: 'reviewed',
        reviewer: 'lead_challenger',
        notes: 'Testing cascade isolation'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.affectedEntities.length, 1);
      assert.equal(res.affectedEntities[0].entityId, 'PL-001');

      // Check wikilinkEntity was NOT modified
      const wikiEnt = dbManager.entities.getById(wikilinkEntity.id);
      assert.equal(wikiEnt.review_status, 'pending', 'Wikilink entity must remain untouched');
    });

    it('should NOT cascade canon promotion to wikilink/referenced entities', async () => {
      // Review file first
      await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: activeSourceFile.relative_path,
        reviewStatus: 'reviewed'
      });

      // Promote file
      const res = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: activeSourceFile.relative_path,
        targetCanonLevel: 2,
        confirmationToken: 'CONFIRM_CANON_CHANGE'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.affectedEntities.length, 1);
      assert.equal(res.affectedEntities[0].entityId, 'PL-001');

      // Check wikilinkEntity was NOT promoted
      const wikiEnt = dbManager.entities.getById(wikilinkEntity.id);
      assert.equal(wikiEnt.canon_level, 0, 'Wikilink entity canon level must not be promoted');
    });

    it('should NOT cascade deprecation to wikilink/referenced entities', async () => {
      const res = await dispatcher.dispatch('DeprecateSource', {
        filePath: activeSourceFile.relative_path,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        reason: 'Testing cascade isolation on deprecation'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.affectedEntities.length, 1);
      assert.equal(res.affectedEntities[0].entityId, 'PL-001');

      // Check wikilinkEntity was NOT archived
      const wikiEnt = dbManager.entities.getById(wikilinkEntity.id);
      assert.equal(wikiEnt.status, 'active', 'Wikilink entity status must remain active');
    });

    it('should record complete before/after states and operator audit trail on mutations', async () => {
      // 1. Review status change audit
      const r1 = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: activeSourceFile.relative_path,
        reviewStatus: 'reviewed',
        reviewer: 'auditor_007',
        notes: 'Approved by auditor'
      });

      const audit1 = dbManager.canonChanges.getById(r1.changeRecordId);
      assert.equal(audit1.change_type, 'UPDATE_REVIEW_STATUS');
      assert.equal(audit1.operator, 'auditor_007');
      assert.equal(audit1.reason, 'Approved by auditor');
      assert.equal(audit1.before_state.review_status, 'pending');
      assert.equal(audit1.after_state.newReviewStatus, 'reviewed');

      // 2. Promotion audit
      const r2 = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: activeSourceFile.relative_path,
        targetCanonLevel: 2,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        operator: 'canon_master',
        reason: 'Promoted to official canon'
      });

      const audit2 = dbManager.canonChanges.getById(r2.changeRecordId);
      assert.equal(audit2.change_type, 'PROMOTE_CANON');
      assert.equal(audit2.operator, 'canon_master');
      assert.equal(audit2.confirmed_by_flag, 1);
      assert.equal(audit2.before_state.canon_level, 0);
      assert.equal(audit2.after_state.canonLevel, 2);

      // 3. Deprecation audit
      const r3 = await dispatcher.dispatch('DeprecateSource', {
        entityId: 'PL-001',
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        operator: 'retirer_001',
        reason: 'Lore retconned'
      });

      const audit3 = dbManager.canonChanges.getById(r3.changeRecordId);
      assert.equal(audit3.change_type, 'DEPRECATE_SOURCE');
      assert.equal(audit3.operator, 'retirer_001');
      assert.equal(audit3.before_state.status, 'active');
      assert.equal(audit3.after_state.status, 'archived');
    });

    it('should roll back completely and record zero audit on simulated transaction failure', () => {
      const gate = new SafetyGate(dbManager);
      const changesBefore = dbManager.canonChanges.getSummary().totalChanges;

      assert.throws(
        () => {
          gate.executeWithAudit({
            changeType: 'PROMOTE_CANON',
            targetType: 'source_file',
            targetId: activeSourceFile.relative_path,
            beforeState: { canon_level: 0 },
            mutationFn: () => {
              dbManager.getDatabase().prepare('UPDATE source_files SET canon_level = 3 WHERE id = ?').run(activeSourceFile.id);
              throw new Error('SIMULATED_CRASH_MID_TRANSACTION');
            }
          });
        },
        /SIMULATED_CRASH_MID_TRANSACTION/
      );

      // Verify DB rollback
      const dbFile = dbManager.sourceFiles.getById(activeSourceFile.id);
      assert.equal(dbFile.canon_level, 0, 'Database mutation must be rolled back by ACID transaction');

      // Verify no orphan audit record
      const changesAfter = dbManager.canonChanges.getSummary().totalChanges;
      assert.equal(changesAfter, changesBefore, 'No audit record should persist after transaction rollback');
    });
  });

  // ==========================================================================
  // Attack Group 6: Target Resolution & Parameter Boundary Stress
  // ==========================================================================
  describe('Attack Group 6: Target Resolution & Parameter Stress', () => {
    it('should reject non-existent targets with TARGET_NOT_FOUND', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanonPreview', {
            filePath: 'non_existent_folder/non_existent_file.md'
          });
        },
        (err) => {
          assert.equal(err.code, 'TARGET_NOT_FOUND');
          return true;
        }
      );
    });

    it('should reject invalid reviewStatus with INVALID_PARAMETER', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SetSourceReviewStatus', {
            filePath: activeSourceFile.relative_path,
            reviewStatus: 'hacked_status'
          });
        },
        (err) => {
          assert.equal(err.code, 'INVALID_PARAMETER');
          return true;
        }
      );
    });
  });
});
