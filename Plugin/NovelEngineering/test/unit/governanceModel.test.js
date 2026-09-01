/**
 * @file governanceModel.test.js
 * @description Comprehensive Unit Test Suite for Governance State Model, Safety Gate & Governance Commands (Phase 3 M2)
 * @module test/unit/governanceModel
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

describe('Milestone 2: Governance State Model & Governance Commands Test Suite', () => {
  let dbManager = null;
  let dispatcher = null;
  let engine = null;

  let file1 = null;
  let file2Draft = null;
  let file3Archived = null;
  let entity1 = null;
  let entity2 = null;
  let entity3 = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    dispatcher = new CommandDispatcher({ dbManager });
    engine = new GovernanceEngine(dbManager);

    // 1. Seed Source Files
    file1 = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-001/00_星球总览.md',
      relative_path: '04_星球档案/V-001/00_星球总览.md',
      file_name: '00_星球总览.md',
      source_category: 'entity',
      status: 'active',
      review_status: 'pending',
      canon_level: 0
    });

    file2Draft = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/13_小说工程插件/篇章草稿/CH_001_草稿.md',
      relative_path: '13_小说工程插件/篇章草稿/CH_001_草稿.md',
      file_name: 'CH_001_草稿.md',
      source_category: 'draft',
      status: 'draft',
      review_status: 'pending',
      canon_level: 0
    });

    file3Archived = dbManager.sourceFiles.insert({
      file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-999/旧废案.md',
      relative_path: '04_星球档案/V-999/旧废案.md',
      file_name: '旧废案.md',
      source_category: 'entity',
      status: 'archived',
      review_status: 'rejected',
      canon_level: 0
    });

    // 2. Seed Entities
    entity1 = dbManager.entities.insert({
      entity_id: 'PL-001',
      canonical_name: '泰拉',
      entity_type: 'planet',
      status: 'active',
      review_status: 'pending',
      canon_level: 0,
      source_file_id: file1.id
    });

    entity2 = dbManager.entities.insert({
      entity_id: 'SYS-SOL',
      canonical_name: '太阳系',
      entity_type: 'location',
      status: 'active',
      review_status: 'pending',
      canon_level: 0
    });

    entity3 = dbManager.entities.insert({
      entity_id: 'PL-999',
      canonical_name: '废弃星球',
      entity_type: 'planet',
      status: 'archived',
      review_status: 'rejected',
      canon_level: 0,
      source_file_id: file3Archived.id
    });

    // 3. Link Mentions (definition vs wikilink)
    dbManager.entities.addMention({
      source_file_id: file1.id,
      entity_id: entity1.id,
      mention_type: 'definition'
    });

    dbManager.entities.addMention({
      source_file_id: file1.id,
      entity_id: entity2.id,
      mention_type: 'wikilink'
    });

    // 4. Seed Relation & Timeline & Foreshadowing & Chapter
    dbManager.entityRelations.createRelation({
      source_entity_id: entity1.id,
      target_entity_id: entity2.id,
      relation_type: 'located_in',
      description: '泰拉位于太阳系第三轨道'
    });

    dbManager.timeline.insert({
      event_id: 'EV-001',
      title: '泰拉生态改造完成',
      primary_entity_id: entity1.id,
      source_file_id: file1.id,
      timestamp_order: 2042
    });

    dbManager.chapters.insert({
      chapter_number: 1,
      title: '泰拉起航',
      source_file_id: file1.id,
      canon: 0,
      status: 'draft'
    });

    dbManager.foreshadowing.insert({
      thread_key: 'FS-001',
      title: '地核能量异动',
      setup_file_id: file1.id,
      status: 'open'
    });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // --------------------------------------------------------------------------
  // Suite 1: GetGovernanceSummary
  // --------------------------------------------------------------------------
  describe('GetGovernanceSummary', () => {
    it('should aggregate project-wide status and canon metrics accurately', async () => {
      const res = await dispatcher.dispatch('GetGovernanceSummary');

      assert.equal(res.status, 'success');
      assert.ok(res.summary);
      assert.equal(res.summary.totalFiles, 3);
      assert.equal(res.summary.totalEntities, 3);
      assert.equal(res.summary.totalRelations, 1);
      assert.equal(res.summary.totalTimelineEvents, 1);
      assert.equal(res.summary.totalChapters, 1);
      assert.equal(res.summary.totalForeshadowing, 1);

      assert.equal(res.summary.statusDistribution.sourceFiles.active, 1);
      assert.equal(res.summary.statusDistribution.sourceFiles.draft, 1);
      assert.equal(res.summary.statusDistribution.sourceFiles.archived, 1);

      assert.equal(res.summary.canonLevelDistribution.sourceFiles.level0_draft, 3);
      assert.equal(res.summary.canonLevelDistribution.entities.level0_draft, 3);

      assert.ok(res.summary.pendingReviewCount >= 2);
      assert.ok(res.content.includes('Governance Lifecycle Summary'));
    });
  });

  // --------------------------------------------------------------------------
  // Suite 2: SetSourceReviewStatus
  // --------------------------------------------------------------------------
  describe('SetSourceReviewStatus', () => {
    it('should update review status and cascade to defined entities only', async () => {
      const res = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: file1.relative_path,
        reviewStatus: 'reviewed',
        reviewer: 'lead_editor',
        notes: 'Verified against canon handbook'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.newReviewStatus, 'reviewed');
      assert.equal(res.affectedEntities.length, 1);
      assert.equal(res.affectedEntities[0].entityId, 'PL-001');

      // Verify file1 in DB
      const updatedFile = dbManager.sourceFiles.getById(file1.id);
      assert.equal(updatedFile.review_status, 'reviewed');

      // Verify entity1 (definition) in DB was cascaded
      const updatedEnt1 = dbManager.entities.getById(entity1.id);
      assert.equal(updatedEnt1.review_status, 'reviewed');

      // Verify entity2 (wikilink mention) was NOT cascaded
      const updatedEnt2 = dbManager.entities.getById(entity2.id);
      assert.equal(updatedEnt2.review_status, 'pending');

      // Verify audit log entry in canon_changes
      const auditLog = dbManager.canonChanges.getById(res.changeRecordId);
      assert.ok(auditLog);
      assert.equal(auditLog.change_type, 'UPDATE_REVIEW_STATUS');
      assert.equal(auditLog.operator, 'lead_editor');
      assert.equal(auditLog.reason, 'Verified against canon handbook');
    });

    it('should normalize legacy aliases like "confirmed" to "reviewed"', async () => {
      const res = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: file1.relative_path,
        reviewStatus: 'confirmed'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.newReviewStatus, 'reviewed');
    });

    it('should update review status directly on an entity without cascade', async () => {
      const res = await dispatcher.dispatch('SetSourceReviewStatus', {
        entityId: 'SYS-SOL',
        reviewStatus: 'in_review',
        reviewer: 'reviewer_2'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.targetType, 'entity');
      assert.equal(res.newReviewStatus, 'in_review');

      const ent = dbManager.entities.getById(entity2.id);
      assert.equal(ent.review_status, 'in_review');
    });

    it('should reject invalid review status', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('SetSourceReviewStatus', {
            filePath: file1.relative_path,
            reviewStatus: 'totally_invalid_status'
          });
        },
        /Invalid reviewStatus/
      );
    });
  });

  // --------------------------------------------------------------------------
  // Suite 3: PromoteSourceToCanonPreview & Anti-Silent Promotion Gate
  // --------------------------------------------------------------------------
  describe('PromoteSourceToCanonPreview', () => {
    it('should mark unreviewed draft as ineligible for canon promotion', async () => {
      const res = await dispatcher.dispatch('PromoteSourceToCanonPreview', {
        filePath: file2Draft.relative_path,
        targetCanonLevel: 2
      });

      assert.equal(res.status, 'success');
      assert.equal(res.eligible, false);
      assert.ok(res.blockingErrors.length > 0);
      assert.match(res.blockingErrors[0], /Direct silent promotion of unreviewed draft/);
      assert.equal(res.requiredConfirmationToken, 'CONFIRM_CANON_CHANGE');
    });

    it('should mark archived file as ineligible for promotion', async () => {
      const res = await dispatcher.dispatch('PromoteSourceToCanonPreview', {
        filePath: file3Archived.relative_path,
        targetCanonLevel: 2
      });

      assert.equal(res.status, 'success');
      assert.equal(res.eligible, false);
      assert.match(res.blockingErrors[0], /Cannot promote source_file with status "archived"/);
    });

    it('should mark reviewed source file as eligible for canon promotion', async () => {
      // First review file1
      await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: file1.relative_path,
        reviewStatus: 'reviewed'
      });

      const res = await dispatcher.dispatch('PromoteSourceToCanonPreview', {
        filePath: file1.relative_path,
        targetCanonLevel: 2
      });

      assert.equal(res.status, 'success');
      assert.equal(res.eligible, true);
      assert.equal(res.blockingErrors.length, 0);
      assert.equal(res.affectedEntities.length, 1);
      assert.equal(res.affectedEntities[0].entityId, 'PL-001');
      assert.ok(res.affectedChapters.length > 0);
    });

    it('should detect unresolved anomaly conflicts in preview', async () => {
      // Insert anomaly report affecting file1
      dbManager.anomalies.insert({
        anomaly_rule_id: 'ANOM_001',
        severity: 'CRITICAL',
        title: '同名实体冲突',
        message: '发现与00_星球总览.md冲突的同名实体',
        affected_file_paths_json: [file1.relative_path],
        affected_entity_ids_json: ['PL-001'],
        is_resolved: 0
      });

      const res = await dispatcher.dispatch('PromoteSourceToCanonPreview', {
        filePath: file1.relative_path,
        targetCanonLevel: 2
      });

      assert.equal(res.status, 'success');
      assert.ok(res.potentialConflicts.length > 0);
      assert.equal(res.potentialConflicts[0].anomaly_rule_id, 'ANOM_001');
    });
  });

  // --------------------------------------------------------------------------
  // Suite 4: PromoteSourceToCanon (Confirmed Execution & Safety Gate)
  // --------------------------------------------------------------------------
  describe('PromoteSourceToCanon', () => {
    it('should throw GovernanceSafetyError when confirmationToken is missing', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: file1.relative_path,
            targetCanonLevel: 2
          });
        },
        (err) => {
          assert.equal(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
          assert.match(err.message, /requires explicit confirmation token/);
          return true;
        }
      );
    });

    it('should throw GovernanceSafetyError when confirmationToken is invalid', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: file1.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'WRONG_TOKEN'
          });
        },
        (err) => {
          assert.equal(err.code, 'GOVERNANCE_CONFIRMATION_REQUIRED');
          return true;
        }
      );
    });

    it('should throw GovernanceSafetyError when attempting to promote unreviewed draft even with token', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: file2Draft.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
          assert.match(err.message, /Direct silent promotion of unreviewed draft/);
          return true;
        }
      );
    });

    it('should throw GovernanceSafetyError when attempting to promote archived target', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: file3Archived.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'INVALID_STATUS_FOR_PROMOTION');
          return true;
        }
      );
    });

    it('should successfully promote reviewed target with token and record audit log', async () => {
      // 1. Mark reviewed
      await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: file1.relative_path,
        reviewStatus: 'reviewed'
      });

      // 2. Promote confirmed
      const res = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: file1.relative_path,
        targetCanonLevel: 2,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        operator: 'lead_editor',
        reason: 'Passed full editorial verification'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.canonLevel, 2);
      assert.equal(res.reviewStatus, 'reviewed');

      // Verify DB state of source file
      const dbFile = dbManager.sourceFiles.getById(file1.id);
      assert.equal(dbFile.canon_level, 2);
      assert.equal(dbFile.review_status, 'reviewed');

      // Verify DB state of cascaded entity
      const dbEnt = dbManager.entities.getById(entity1.id);
      assert.equal(dbEnt.canon_level, 2);
      assert.equal(dbEnt.review_status, 'reviewed');

      // Verify audit log
      const audit = dbManager.canonChanges.getById(res.changeRecordId);
      assert.ok(audit);
      assert.equal(audit.change_type, 'PROMOTE_CANON');
      assert.equal(audit.confirmed_by_flag, 1);
      assert.equal(audit.operator, 'lead_editor');
      assert.equal(audit.reason, 'Passed full editorial verification');
    });

    it('should successfully promote entity directly with confirmCanonChange flag', async () => {
      // 1. Mark entity reviewed
      await dispatcher.dispatch('SetSourceReviewStatus', {
        entityId: 'SYS-SOL',
        reviewStatus: 'reviewed'
      });

      // 2. Promote confirmed using boolean flag
      const res = await dispatcher.dispatch('PromoteSourceToCanon', {
        entityId: 'SYS-SOL',
        targetCanonLevel: 3,
        confirmCanonChange: true,
        operator: 'admin',
        reason: 'Universal core axiom location'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.canonLevel, 3);

      const dbEnt = dbManager.entities.getById(entity2.id);
      assert.equal(dbEnt.canon_level, 3);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 5: DeprecateSourcePreview & DeprecateSource
  // --------------------------------------------------------------------------
  describe('DeprecateSourcePreview and DeprecateSource', () => {
    it('should compute downstream impact blast radius in preview for entity', async () => {
      const res = await dispatcher.dispatch('DeprecateSourcePreview', {
        entityId: 'PL-001'
      });

      assert.equal(res.status, 'success');
      assert.ok(res.downstreamImpact);
      assert.equal(res.downstreamImpact.danglingRelations.length, 1);
      assert.equal(res.downstreamImpact.affectedTimelineEvents.length, 1);
      assert.ok(res.downstreamImpact.totalDependentCount >= 2);
      assert.equal(res.downstreamImpact.riskRating, 'MEDIUM');
      assert.equal(res.requiredConfirmationToken, 'CONFIRM_CANON_CHANGE');
    });

    it('should compute downstream impact blast radius in preview for source file', async () => {
      const res = await dispatcher.dispatch('DeprecateSourcePreview', {
        filePath: file1.relative_path
      });

      assert.equal(res.status, 'success');
      assert.ok(res.downstreamImpact);
      assert.equal(res.downstreamImpact.affectedChapters.length, 1);
      assert.equal(res.downstreamImpact.activeForeshadowing.length, 1);
    });

    it('should throw GovernanceSafetyError if confirmationToken is absent', async () => {
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('DeprecateSource', {
            entityId: 'PL-001',
            reason: 'Deprecated by new canon'
          });
        },
        /GOVERNANCE_CONFIRMATION_REQUIRED/
      );
    });

    it('should successfully deprecate entity with confirmationToken and record audit', async () => {
      const res = await dispatcher.dispatch('DeprecateSource', {
        entityId: 'PL-001',
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        reason: 'Deprecated by new canon lore',
        replacementEntityId: 'PL-002',
        operator: 'lead_editor'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.targetStatus, 'archived');
      assert.equal(res.canonLevel, 0);

      // Check DB
      const dbEnt = dbManager.entities.getById(entity1.id);
      assert.equal(dbEnt.status, 'archived');
      assert.equal(dbEnt.canon_level, 0);

      // Check audit log
      const audit = dbManager.canonChanges.getById(res.changeRecordId);
      assert.ok(audit);
      assert.equal(audit.change_type, 'DEPRECATE_SOURCE');
      assert.equal(audit.operator, 'lead_editor');
      assert.equal(audit.reason, 'Deprecated by new canon lore');
    });

    it('should successfully deprecate source file with confirmationToken and cascade to defined entities', async () => {
      const res = await dispatcher.dispatch('DeprecateSource', {
        filePath: file1.relative_path,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        reason: 'Entire star sector redconned',
        operator: 'lore_master'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.targetStatus, 'archived');
      assert.equal(res.canonLevel, 0);
      assert.equal(res.affectedEntities.length, 1);

      // Check DB file
      const dbFile = dbManager.sourceFiles.getById(file1.id);
      assert.equal(dbFile.status, 'archived');
      assert.equal(dbFile.canon_level, 0);

      // Check cascaded entity
      const dbEnt = dbManager.entities.getById(entity1.id);
      assert.equal(dbEnt.status, 'archived');
      assert.equal(dbEnt.canon_level, 0);
    });
  });

  // --------------------------------------------------------------------------
  // Suite 6: SafetyGate Standalone & Target Resolution
  // --------------------------------------------------------------------------
  describe('SafetyGate Standalone & Target Resolution', () => {
    it('should throw TARGET_NOT_FOUND when non-existent target is provided', () => {
      const gate = new SafetyGate(dbManager);
      assert.throws(
        () => {
          gate.validatePromotionRules(null, 'source_file', 2);
        },
        /Target source_file does not exist/
      );
    });

    it('should resolve targets by polymorphic IDs and paths in GovernanceEngine', () => {
      // By numeric ID
      const target1 = engine._resolveTarget({ sourceFileId: file1.id });
      assert.equal(target1.targetType, 'source_file');
      assert.equal(target1.target.id, file1.id);

      // By relative path
      const target2 = engine._resolveTarget({ filePath: file1.relative_path });
      assert.equal(target2.targetType, 'source_file');
      assert.equal(target2.target.id, file1.id);

      // By entity code string
      const target3 = engine._resolveTarget({ entityId: 'PL-001' });
      assert.equal(target3.targetType, 'entity');
      assert.equal(target3.target.entity_id, 'PL-001');

      // By entity DB ID
      const target4 = engine._resolveTarget({ entityDbId: entity1.id });
      assert.equal(target4.targetType, 'entity');
      assert.equal(target4.target.id, entity1.id);
    });

    it('should throw TARGET_NOT_FOUND when parameter fails to match anything', () => {
      assert.throws(
        () => {
          engine._resolveTarget({ entityId: 'NON_EXISTENT_ID_99999' });
        },
        /Target source file or entity could not be resolved/
      );
    });
  });
});
