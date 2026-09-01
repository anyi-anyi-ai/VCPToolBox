/**
 * @file m2_lifecycle_stress_challenger.test.js
 * @description Empirical Challenger Test Suite for Milestone 2: Lifecycle Stress, Multi-Entity Cascade, Dry-Run Parity & Relational Graph Blast Radius
 * @module test/unit/m2_lifecycle_stress_challenger
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

describe('Empirical Challenger Suite: Milestone 2 Lifecycle Stress & Graph Parity', () => {
  let dbManager = null;
  let dispatcher = null;
  let engine = null;

  beforeEach(() => {
    dbManager = new DatabaseManager(':memory:');
    dispatcher = new CommandDispatcher({ dbManager });
    engine = new GovernanceEngine(dbManager);
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
  });

  // ==========================================================================
  // Dimension 1: Rapid & Cyclic State Transitions
  // ==========================================================================
  describe('Dimension 1: Rapid & Cyclic State Transitions', () => {
    it('should correctly traverse full linear lifecycle: draft -> pending -> in_review -> reviewed -> promoted -> deprecated -> rejected re-promotion', async () => {
      // 1. Create draft file
      const draftFile = dbManager.sourceFiles.insert({
        file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-001/01_泰拉设定.md',
        relative_path: '04_星球档案/V-001/01_泰拉设定.md',
        file_name: '01_泰拉设定.md',
        source_category: 'entity',
        status: 'draft',
        review_status: 'pending',
        canon_level: 0
      });

      const ent = dbManager.entities.insert({
        entity_id: 'PL-TERRA',
        canonical_name: '泰拉',
        entity_type: 'planet',
        status: 'draft',
        review_status: 'pending',
        canon_level: 0,
        source_file_id: draftFile.id
      });

      dbManager.entities.addMention({
        source_file_id: draftFile.id,
        entity_id: ent.id,
        mention_type: 'definition'
      });

      // Attempt to promote while in draft/pending -> MUST FAIL
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: draftFile.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
          return true;
        }
      );

      // Step 1: Transition to in_review
      const r1 = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: draftFile.relative_path,
        reviewStatus: 'in_review',
        reviewer: 'editor_1'
      });
      assert.equal(r1.newReviewStatus, 'in_review');
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).review_status, 'in_review');
      assert.equal(dbManager.entities.getById(ent.id).review_status, 'in_review');

      // Still in_review -> promote MUST FAIL
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: draftFile.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'UNREVIEWED_DRAFT_CANON_BLOCKED');
          return true;
        }
      );

      // Step 2: Transition to reviewed
      const r2 = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: draftFile.relative_path,
        reviewStatus: 'reviewed',
        reviewer: 'editor_lead'
      });
      assert.equal(r2.newReviewStatus, 'reviewed');
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).review_status, 'reviewed');
      assert.equal(dbManager.entities.getById(ent.id).review_status, 'reviewed');

      // Step 3: Promote to Canon Level 2
      const r3 = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: draftFile.relative_path,
        targetCanonLevel: 2,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        operator: 'canon_board'
      });
      assert.equal(r3.canonLevel, 2);
      assert.equal(r3.targetStatus || r3.details.status, 'active');
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).canon_level, 2);
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).status, 'active'); // Draft automatically upgraded to active
      assert.equal(dbManager.entities.getById(ent.id).canon_level, 2);
      assert.equal(dbManager.entities.getById(ent.id).status, 'active');

      // Step 4: Promote to Canon Level 3 (Axiom)
      const r4 = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: draftFile.relative_path,
        targetCanonLevel: 3,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        operator: 'chief_author'
      });
      assert.equal(r4.canonLevel, 3);
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).canon_level, 3);
      assert.equal(dbManager.entities.getById(ent.id).canon_level, 3);

      // Step 5: Deprecate source
      const r5 = await dispatcher.dispatch('DeprecateSource', {
        filePath: draftFile.relative_path,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        reason: 'Superseded by Terra Nova specification',
        operator: 'chief_author'
      });
      assert.equal(r5.targetStatus, 'archived');
      assert.equal(r5.canonLevel, 0);
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).status, 'archived');
      assert.equal(dbManager.sourceFiles.getById(draftFile.id).canon_level, 0);
      assert.equal(dbManager.entities.getById(ent.id).status, 'archived');
      assert.equal(dbManager.entities.getById(ent.id).canon_level, 0);

      // Step 6: Attempt to re-promote archived source -> MUST FAIL with INVALID_STATUS_FOR_PROMOTION
      await assert.rejects(
        async () => {
          await dispatcher.dispatch('PromoteSourceToCanon', {
            filePath: draftFile.relative_path,
            targetCanonLevel: 2,
            confirmationToken: 'CONFIRM_CANON_CHANGE'
          });
        },
        (err) => {
          assert.equal(err.code, 'INVALID_STATUS_FOR_PROMOTION');
          return true;
        }
      );

      // Check complete audit sequence in canon_changes
      const auditChanges = dbManager.canonChanges.getRecentChanges(20);
      assert.equal(auditChanges.length, 5); // r1 (review), r2 (review), r3 (promote 2), r4 (promote 3), r5 (deprecate)
      assert.equal(auditChanges[0].change_type, 'DEPRECATE_SOURCE');
      assert.equal(auditChanges[1].change_type, 'PROMOTE_CANON');
      assert.equal(auditChanges[2].change_type, 'PROMOTE_CANON');
      assert.equal(auditChanges[3].change_type, 'UPDATE_REVIEW_STATUS');
      assert.equal(auditChanges[4].change_type, 'UPDATE_REVIEW_STATUS');
    });

    it('should withstand rapid multi-turn review flip-flops without corruption', async () => {
      const file = dbManager.sourceFiles.insert({
        file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-002/02_火星.md',
        relative_path: '04_星球档案/V-002/02_火星.md',
        file_name: '02_火星.md',
        source_category: 'entity',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });

      const sequence = [
        'in_review',
        'rejected',
        'pending',
        'in_review',
        'reviewed',
        'rejected',
        'in_review',
        'reviewed'
      ];

      for (let i = 0; i < sequence.length; i++) {
        const nextStatus = sequence[i];
        const res = await dispatcher.dispatch('SetSourceReviewStatus', {
          filePath: file.relative_path,
          reviewStatus: nextStatus,
          reviewer: `reviewer_${i}`,
          notes: `Flip turn ${i}`
        });

        assert.equal(res.status, 'success');
        assert.equal(res.newReviewStatus, nextStatus);

        const currentDb = dbManager.sourceFiles.getById(file.id);
        assert.equal(currentDb.review_status, nextStatus);
      }

      const summary = dbManager.canonChanges.getSummary();
      assert.equal(summary.totalChanges, sequence.length);
    });
  });

  // ==========================================================================
  // Dimension 2: Multi-Entity Cascade Consistency
  // ==========================================================================
  describe('Dimension 2: Multi-Entity Cascade Consistency', () => {
    it('should cascade to multiple defined/primary entities while strictly shielding wikilink entities', async () => {
      // 1 source file defines 3 entities, references 3 other entities
      const sourceFile = dbManager.sourceFiles.insert({
        file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-100/综合行星系.md',
        relative_path: '04_星球档案/V-100/综合行星系.md',
        file_name: '综合行星系.md',
        source_category: 'entity',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });

      // Defined entity 1 (via source_file_id)
      const defEnt1 = dbManager.entities.insert({
        entity_id: 'PL-101',
        canonical_name: '天王星',
        entity_type: 'planet',
        status: 'active',
        review_status: 'pending',
        canon_level: 0,
        source_file_id: sourceFile.id
      });

      // Defined entity 2 (via mention_type: definition)
      const defEnt2 = dbManager.entities.insert({
        entity_id: 'ORG-102',
        canonical_name: '天王星科研联合体',
        entity_type: 'organization',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });
      dbManager.entities.addMention({
        source_file_id: sourceFile.id,
        entity_id: defEnt2.id,
        mention_type: 'definition'
      });

      // Defined entity 3 (via mention_type: primary_subject)
      const defEnt3 = dbManager.entities.insert({
        entity_id: 'FAC-103',
        canonical_name: '深空轨道站',
        entity_type: 'facility',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });
      dbManager.entities.addMention({
        source_file_id: sourceFile.id,
        entity_id: defEnt3.id,
        mention_type: 'primary_subject'
      });

      // Referenced entities (wikilink)
      const refEnt1 = dbManager.entities.insert({
        entity_id: 'CHAR-REF1',
        canonical_name: '旁观宇航员',
        entity_type: 'character',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });
      dbManager.entities.addMention({
        source_file_id: sourceFile.id,
        entity_id: refEnt1.id,
        mention_type: 'wikilink'
      });

      const refEnt2 = dbManager.entities.insert({
        entity_id: 'SYS-REF2',
        canonical_name: '柯伊伯带',
        entity_type: 'location',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });
      dbManager.entities.addMention({
        source_file_id: sourceFile.id,
        entity_id: refEnt2.id,
        mention_type: 'wikilink'
      });

      // Test 1: Review status cascade
      const revRes = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: sourceFile.relative_path,
        reviewStatus: 'reviewed'
      });

      assert.equal(revRes.status, 'success');
      assert.equal(revRes.affectedEntities.length, 3);
      const affectedIds = revRes.affectedEntities.map(e => e.entityId).sort();
      assert.deepEqual(affectedIds, ['FAC-103', 'ORG-102', 'PL-101']);

      // Verify DB values of defined entities
      assert.equal(dbManager.entities.getById(defEnt1.id).review_status, 'reviewed');
      assert.equal(dbManager.entities.getById(defEnt2.id).review_status, 'reviewed');
      assert.equal(dbManager.entities.getById(defEnt3.id).review_status, 'reviewed');

      // Verify referenced entities remain UNTOUCHED
      assert.equal(dbManager.entities.getById(refEnt1.id).review_status, 'pending');
      assert.equal(dbManager.entities.getById(refEnt2.id).review_status, 'pending');

      // Test 2: Canon promotion cascade
      const promoRes = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: sourceFile.relative_path,
        targetCanonLevel: 2,
        confirmationToken: 'CONFIRM_CANON_CHANGE'
      });

      assert.equal(promoRes.status, 'success');
      assert.equal(promoRes.affectedEntities.length, 3);
      assert.equal(dbManager.entities.getById(defEnt1.id).canon_level, 2);
      assert.equal(dbManager.entities.getById(defEnt2.id).canon_level, 2);
      assert.equal(dbManager.entities.getById(defEnt3.id).canon_level, 2);

      // Referenced entities still canon_level 0
      assert.equal(dbManager.entities.getById(refEnt1.id).canon_level, 0);
      assert.equal(dbManager.entities.getById(refEnt2.id).canon_level, 0);

      // Test 3: Deprecation cascade
      const depRes = await dispatcher.dispatch('DeprecateSource', {
        filePath: sourceFile.relative_path,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        reason: 'Entire sector decommissioned'
      });

      assert.equal(depRes.status, 'success');
      assert.equal(depRes.affectedEntities.length, 3);
      assert.equal(dbManager.entities.getById(defEnt1.id).status, 'archived');
      assert.equal(dbManager.entities.getById(defEnt1.id).canon_level, 0);
      assert.equal(dbManager.entities.getById(defEnt2.id).status, 'archived');
      assert.equal(dbManager.entities.getById(defEnt3.id).status, 'archived');

      // Referenced entities still active and canon_level 0
      assert.equal(dbManager.entities.getById(refEnt1.id).status, 'active');
      assert.equal(dbManager.entities.getById(refEnt2.id).status, 'active');
    });

    it('should support disabling cascade when cascade=false is explicitly passed', async () => {
      const sourceFile = dbManager.sourceFiles.insert({
        file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-200/单体文件.md',
        relative_path: '04_星球档案/V-200/单体文件.md',
        file_name: '单体文件.md',
        source_category: 'entity',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });

      const defEnt = dbManager.entities.insert({
        entity_id: 'PL-201',
        canonical_name: '海王星',
        entity_type: 'planet',
        status: 'active',
        review_status: 'pending',
        canon_level: 0,
        source_file_id: sourceFile.id
      });

      const res = await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: sourceFile.relative_path,
        reviewStatus: 'reviewed',
        cascade: false
      });

      assert.equal(res.status, 'success');
      assert.equal(res.affectedEntities.length, 0);

      // File was updated
      assert.equal(dbManager.sourceFiles.getById(sourceFile.id).review_status, 'reviewed');
      // Entity was NOT cascaded
      assert.equal(dbManager.entities.getById(defEnt.id).review_status, 'pending');
    });
  });

  // ==========================================================================
  // Dimension 3: Dry-Run Preview vs Confirmed Execution State Parity
  // ==========================================================================
  describe('Dimension 3: Dry-Run Preview vs Confirmed Execution Parity', () => {
    it('should guarantee 100% state parity between PromoteSourceToCanonPreview and PromoteSourceToCanon', async () => {
      const file = dbManager.sourceFiles.insert({
        file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-300/月球基地.md',
        relative_path: '04_星球档案/V-300/月球基地.md',
        file_name: '月球基地.md',
        source_category: 'entity',
        status: 'active',
        review_status: 'pending',
        canon_level: 0
      });

      const ent = dbManager.entities.insert({
        entity_id: 'BASE-LUNA',
        canonical_name: '广寒宫基地',
        entity_type: 'facility',
        status: 'active',
        review_status: 'pending',
        canon_level: 0,
        source_file_id: file.id
      });

      // Preview before review: eligible MUST be false
      const preview1 = await dispatcher.dispatch('PromoteSourceToCanonPreview', {
        filePath: file.relative_path,
        targetCanonLevel: 2
      });

      assert.equal(preview1.eligible, false);
      assert.ok(preview1.blockingErrors.length > 0);

      // Verify preview1 caused zero DB mutations
      assert.equal(dbManager.sourceFiles.getById(file.id).canon_level, 0);
      assert.equal(dbManager.canonChanges.getSummary().totalChanges, 0);

      // Set to reviewed
      await dispatcher.dispatch('SetSourceReviewStatus', {
        filePath: file.relative_path,
        reviewStatus: 'reviewed'
      });

      // Preview after review: eligible MUST be true
      const preview2 = await dispatcher.dispatch('PromoteSourceToCanonPreview', {
        filePath: file.relative_path,
        targetCanonLevel: 2
      });

      assert.equal(preview2.eligible, true);
      assert.equal(preview2.blockingErrors.length, 0);
      assert.equal(preview2.proposedChanges.canon_level.from, 0);
      assert.equal(preview2.proposedChanges.canon_level.to, 2);
      assert.equal(preview2.proposedChanges.review_status.to, 'reviewed');
      assert.equal(preview2.affectedEntities.length, 1);
      assert.equal(preview2.affectedEntities[0].entityId, 'BASE-LUNA');

      // Now execute confirmed promotion
      const confirmed = await dispatcher.dispatch('PromoteSourceToCanon', {
        filePath: file.relative_path,
        targetCanonLevel: 2,
        confirmationToken: 'CONFIRM_CANON_CHANGE'
      });

      // Parity assertions
      assert.equal(confirmed.canonLevel, preview2.proposedChanges.canon_level.to);
      assert.equal(confirmed.reviewStatus, preview2.proposedChanges.review_status.to);
      assert.equal(confirmed.affectedEntities.length, preview2.affectedEntities.length);
      assert.equal(confirmed.affectedEntities[0].entityId, preview2.affectedEntities[0].entityId);
    });

    it('should guarantee 100% state parity between DeprecateSourcePreview and DeprecateSource', async () => {
      const file = dbManager.sourceFiles.insert({
        file_path: 'H:/Obsidian/WorldTree/04_星球档案/V-400/旧空间站.md',
        relative_path: '04_星球档案/V-400/旧空间站.md',
        file_name: '旧空间站.md',
        source_category: 'entity',
        status: 'active',
        review_status: 'reviewed',
        canon_level: 2
      });

      const ent = dbManager.entities.insert({
        entity_id: 'STA-OLD',
        canonical_name: '天宫旧站',
        entity_type: 'facility',
        status: 'active',
        review_status: 'reviewed',
        canon_level: 2,
        source_file_id: file.id
      });

      // Add chapter dependent
      dbManager.chapters.insert({
        chapter_number: 10,
        title: '空间站危机',
        source_file_id: file.id,
        canon: 1,
        status: 'active'
      });

      // Add foreshadowing dependent
      dbManager.foreshadowing.insert({
        thread_key: 'FS-OLD',
        title: '空间站秘密暗号',
        setup_file_id: file.id,
        status: 'open'
      });

      // Preview deprecation
      const preview = await dispatcher.dispatch('DeprecateSourcePreview', {
        filePath: file.relative_path,
        replacementEntityId: 'STA-NEW'
      });

      assert.equal(preview.target.currentStatus, 'active');
      assert.equal(preview.target.currentCanonLevel, 2);
      assert.equal(preview.downstreamImpact.affectedChapters.length, 1);
      assert.equal(preview.downstreamImpact.activeForeshadowing.length, 1);
      assert.equal(preview.downstreamImpact.riskRating, 'MEDIUM');

      // Verify zero mutations occurred during preview
      assert.equal(dbManager.sourceFiles.getById(file.id).status, 'active');
      assert.equal(dbManager.sourceFiles.getById(file.id).canon_level, 2);

      // Execute confirmed deprecation
      const confirmed = await dispatcher.dispatch('DeprecateSource', {
        filePath: file.relative_path,
        confirmationToken: 'CONFIRM_CANON_CHANGE',
        replacementEntityId: 'STA-NEW'
      });

      assert.equal(confirmed.targetStatus, 'archived');
      assert.equal(confirmed.canonLevel, 0);
      assert.equal(confirmed.replacementEntityId, 'STA-NEW');
      assert.equal(confirmed.affectedEntities[0].entityId, 'STA-OLD');

      // Verify DB matches confirmed result
      assert.equal(dbManager.sourceFiles.getById(file.id).status, 'archived');
      assert.equal(dbManager.sourceFiles.getById(file.id).canon_level, 0);
      assert.equal(dbManager.entities.getById(ent.id).status, 'archived');
      assert.equal(dbManager.entities.getById(ent.id).canon_level, 0);
    });
  });

  // ==========================================================================
  // Dimension 4: Blast Radius Computation on Complex Relational Graphs
  // ==========================================================================
  describe('Dimension 4: Blast Radius on Complex Relational Graphs', () => {
    it('should compute exact blast radius across multi-hop entity graphs, chapters, timeline, and foreshadowing', async () => {
      // Create a hub entity and 6 connected entities
      const hubEntity = dbManager.entities.insert({
        entity_id: 'HUB-CENTRAL',
        canonical_name: '中央枢纽',
        entity_type: 'facility',
        status: 'active',
        review_status: 'reviewed',
        canon_level: 2
      });

      const satelliteIds = ['SAT-1', 'SAT-2', 'SAT-3', 'SAT-4', 'SAT-5', 'SAT-6'];
      const satelliteDbEntities = [];

      for (const sId of satelliteIds) {
        const sEnt = dbManager.entities.insert({
          entity_id: sId,
          canonical_name: `卫星节点_${sId}`,
          entity_type: 'facility',
          status: 'active',
          review_status: 'reviewed',
          canon_level: 2
        });
        satelliteDbEntities.push(sEnt);

        // Add relation from hub to satellite
        dbManager.entityRelations.createRelation({
          source_entity_id: hubEntity.id,
          target_entity_id: sEnt.id,
          relation_type: 'controls',
          description: `Hub controls ${sId}`
        });
      }

      // Add timeline event attached to hub
      dbManager.timeline.insert({
        event_id: 'EV-HUB-01',
        title: '中央枢纽启动',
        primary_entity_id: hubEntity.id,
        timestamp_order: 2050
      });

      // Preview deprecation on hubEntity
      const res = await dispatcher.dispatch('DeprecateSourcePreview', {
        entityId: 'HUB-CENTRAL'
      });

      assert.equal(res.status, 'success');
      assert.equal(res.target.type, 'entity');
      assert.equal(res.target.id, 'HUB-CENTRAL');

      const impact = res.downstreamImpact;
      // 6 dangling relations + 1 timeline event = 7 dependents -> CRITICAL rating
      assert.equal(impact.danglingRelations.length, 6);
      assert.equal(impact.affectedTimelineEvents.length, 1);
      assert.equal(impact.totalDependentCount, 7);
      assert.equal(impact.riskRating, 'CRITICAL');
    });

    it('should accurately calculate deprecationRiskCount in GetGovernanceSummary for archived nodes in relations', async () => {
      // Create active entity A and archived entity B connected by relation
      const entA = dbManager.entities.insert({
        entity_id: 'ENT-A',
        canonical_name: '实体A',
        entity_type: 'concept',
        status: 'active',
        review_status: 'reviewed',
        canon_level: 2
      });

      const entB = dbManager.entities.insert({
        entity_id: 'ENT-B',
        canonical_name: '实体B',
        entity_type: 'concept',
        status: 'archived',
        review_status: 'reviewed',
        canon_level: 0
      });

      dbManager.entityRelations.createRelation({
        source_entity_id: entA.id,
        target_entity_id: entB.id,
        relation_type: 'depends_on',
        description: 'Active entity A depends on archived entity B'
      });

      const res = await dispatcher.dispatch('GetGovernanceSummary');
      assert.equal(res.status, 'success');
      assert.ok(res.summary.deprecationRiskCount >= 1);
    });
  });
});
