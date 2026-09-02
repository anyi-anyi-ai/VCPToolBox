/**
 * @file CollaborationCommands.js
 * @description Command Handlers for Phase 4 VCP Collaboration Protocol & Quality Evaluation (Milestones 3 & 4)
 * Wraps all 9 collaboration and evaluation commands with standard envelopes, markdown summaries,
 * machine-readable details, and typed error handling.
 * @module commands/CollaborationCommands
 * @license MIT
 */

'use strict';

const crypto = require('crypto');
const {
  VCPContextBuilder,
  TraceManager,
  CreativeDecisionQueue,
  SuggestMemoryUpdate,
  VCPMemoryPublisher,
  CanonLeakageEvaluator,
  QualityEvaluators
} = require('../collaboration');
const { CollaborationError } = require('../errors');

class CollaborationCommands {
  /**
   * Helper to ensure valid requestId (UUID or structured string)
   * @private
   * @param {object} params
   * @returns {string}
   */
  static _ensureRequestId(params = {}) {
    if (params.requestId && typeof params.requestId === 'string' && params.requestId.trim()) {
      return params.requestId.trim();
    }
    return crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Helper to obtain current database schema revision integer
   * @private
   * @param {object} dbManager
   * @returns {number}
   */
  static _getDatabaseRevision(dbManager) {
    if (dbManager && typeof dbManager.getSchemaVersion === 'function') {
      try {
        return dbManager.getSchemaVersion();
      } catch (_) {
        return 4;
      }
    }
    return 4;
  }

  /**
   * Command 1: BuildVCPContext
   * Builds standard 5-layer VCP Context snapshot (Schema 4.0) with anti-override logic and 11-level budget trimming.
   * @param {object} params
   * @param {string} [params.projectId='default']
   * @param {string|number} [params.chapterId='general']
   * @param {Array<string>|string} [params.focusEntities=[]]
   * @param {Array<object>} [params.vcpMemoryRefs=[]]
   * @param {Array<object>} [params.semanticCandidates=[]]
   * @param {string} [params.sourcePolicy='canon_and_reviewed']
   * @param {boolean} [params.includeConflicts=true]
   * @param {boolean} [params.includeUnresolved=true]
   * @param {boolean} [params.includeWorldRules=true]
   * @param {number} [params.maxTokens=30000]
   * @param {Array<string|object>} [params.authorDirectives=[]]
   * @param {string} [params.requestId]
   * @param {object} context - Execution context { dbManager, pathGuard }
   * @returns {Promise<object>}
   */
  static async handleBuildVCPContext(params = {}, context = {}) {
    const { dbManager, pathGuard } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    const builder = new VCPContextBuilder(dbManager, { pathGuard });
    const result = builder.buildContext({ ...params, requestId });

    const markdown = [
      '### [NovelEngineering] VCP Context Snapshot (v4.0)',
      `- **Snapshot ID**: \`${result.snapshotId}\``,
      `- **Chapter / Project**: \`${result.chapterId}\` / \`${result.projectId}\``,
      `- **Request ID**: \`${requestId}\``,
      `- **Database Revision**: \`v${databaseRevision}\``,
      '',
      '#### 5-Layer Compilation Summary',
      `- **Author Directives**: ${(result.authorDirectives || []).length} items (P1)`,
      `- **Canon Facts**: ${(result.canonFacts || []).length} items (P2-P7)`,
      `- **Reviewed Memories**: ${(result.reviewedMemories || []).length} items (P8)`,
      `- **Semantic Candidates**: ${(result.semanticCandidates || []).length} items (P10-P11)`,
      `- **Conflicts / Unresolved**: ${(result.conflicts || []).length} conflicts, ${(result.unresolved || []).length} unresolved (P9)`,
      '',
      '#### Token Budget & Trimming',
      `- **Estimated Tokens**: ${result.contextBudget.estimatedTokens} / ${result.contextBudget.maxTokens}`,
      `- **Trimmed**: ${result.contextBudget.trimmed ? `⚠️ YES (${(result.contextBudget.omittedSections || []).join(', ')})` : '✅ NO'}`,
      (result.warnings && result.warnings.length > 0)
        ? `\n#### Warnings (${result.warnings.length})\n${result.warnings.map(w => `- ⚠️ ${w}`).join('\n')}`
        : ''
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 2: GetContextTrace
   * Retrieves context lineage trace with optional live disk file SHA-256 integrity verification.
   * @param {object} params
   * @param {string} [params.snapshotId]
   * @param {string} [params.traceId]
   * @param {boolean} [params.verifyIntegrity=false]
   * @param {string} [params.vaultRoot]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetContextTrace(params = {}, context = {}) {
    const { dbManager, pathGuard } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    const snapshotId = params.snapshotId || params.snapshot_id;
    const traceId = params.traceId || params.trace_id;

    if (!snapshotId && !traceId) {
      throw new CollaborationError(
        'GetContextTrace requires "snapshotId" or "traceId" parameter.',
        CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD,
        { params }
      );
    }

    const traceManager = new TraceManager(dbManager, { pathGuard });
    const traceRecord = snapshotId
      ? traceManager.getTraceBySnapshotId(snapshotId)
      : traceManager.getTraceById(traceId);

    if (!traceRecord) {
      throw new CollaborationError(
        `Context trace not found for identifier: ${snapshotId || traceId}`,
        CollaborationError.CODES.TRACE_NOT_FOUND,
        { snapshotId, traceId }
      );
    }

    let integrity = null;
    if (params.verifyIntegrity === true || params.checkLiveSha === true) {
      integrity = traceManager.verifySnapshotIntegrity(traceRecord.snapshot_id || snapshotId, params.vaultRoot);
    }

    const markdown = [
      '### [NovelEngineering] Context Lineage Trace Report',
      `- **Snapshot ID**: \`${traceRecord.snapshot_id}\``,
      `- **Trace ID**: \`${traceRecord.trace_id}\``,
      `- **Total Sources Tracked**: ${traceRecord.total_sources}`,
      `- **Source Systems**: ${(traceRecord.source_systems || []).join(', ')}`,
      integrity
        ? `- **Disk Integrity Status**: \`${integrity.integrityStatus}\` (${integrity.matchedSources}/${integrity.totalSources} matched, ${integrity.mismatchedSources} mismatched, ${integrity.missingSources} missing)`
        : ''
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      snapshotId: traceRecord.snapshot_id,
      traceId: traceRecord.trace_id,
      projectId: traceRecord.project_id,
      chapterId: traceRecord.chapter_id,
      totalSources: traceRecord.total_sources,
      sourceSystems: traceRecord.source_systems,
      sourceTrace: traceRecord.trace_items,
      budgetStats: traceRecord.budget_stats,
      integrity,
      content: markdown,
      details: {
        ...traceRecord,
        integrity
      }
    };
  }

  /**
   * Command 3: RegisterCreativeDecision
   * Registers AI Agent creative proposals into staging queue with pending_author_confirmation.
   * Guarantees zero direct mutation to canon tables.
   * @param {object} params
   * @param {string} [params.action='enqueue'] - 'enqueue', 'review', 'get', 'stats', 'batch'
   * @param {string} [params.decisionType]
   * @param {object|any} [params.proposedChanges]
   * @param {string} [params.projectId='default']
   * @param {string} [params.chapterId]
   * @param {string} [params.proposer='AI_Agent']
   * @param {string} [params.targetEntityId]
   * @param {Array<string>} [params.sourceEntities=[]]
   * @param {string} [params.rationale]
   * @param {Array<string>} [params.tags=[]]
   * @param {string} [params.priority='normal']
   * @param {string} [params.queueId]
   * @param {object} [params.reviewData]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleRegisterCreativeDecision(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    const queue = new CreativeDecisionQueue(dbManager);
    const action = String(params.action || 'enqueue').toLowerCase().trim();

    let resultData = {};
    if (action === 'review') {
      const queueId = params.queueId || params.queue_id || params.id;
      const reviewData = params.reviewData || {
        action: params.reviewAction,
        status: params.reviewStatus,
        reviewer: params.reviewer,
        comment: params.comment
      };
      const updated = queue.reviewDecision(queueId, reviewData);
      resultData = { action: 'review', decision: updated };
    } else if (action === 'get' || action === 'by_id') {
      const queueId = params.queueId || params.queue_id;
      const decision = queue.getDecision(queueId);
      resultData = { action: 'get', decision };
    } else if (action === 'stats' || action === 'summary') {
      const stats = queue.getQueueStats(params.projectId);
      resultData = { action: 'stats', stats };
    } else if (action === 'batch') {
      const decisions = Array.isArray(params.decisions) ? params.decisions : [];
      const createdList = queue.batchRegisterDecisions(decisions, params.options);
      resultData = { action: 'batch', totalRegistered: createdList.length, decisions: createdList };
    } else {
      const created = queue.registerDecision(params);
      resultData = { action: 'enqueue', queueId: created.queue_id, decision: created };
    }

    const decisionItem = resultData.decision || (resultData.decisions && resultData.decisions[0]);
    const markdown = [
      '### [NovelEngineering] Creative Decision Staging Queue',
      `- **Action**: \`${action}\``,
      `- **Queue ID**: \`${resultData.queueId || (decisionItem && decisionItem.queue_id) || 'N/A'}\``,
      decisionItem ? `- **Status**: \`${decisionItem.status}\`` : '',
      decisionItem ? `- **Proposer**: \`${decisionItem.proposer}\`` : '',
      decisionItem ? `- **Decision Type**: \`${decisionItem.decision_type}\`` : '',
      `- **Canon Isolation**: ✅ Strict staging isolation (Zero direct canon mutation)`
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...resultData,
      content: markdown,
      details: resultData
    };
  }

  /**
   * Command 4: SuggestMemoryUpdate
   * Proposes structured DailyNote memory updates prior to author confirmation. Pure analytical engine (zero DB writes).
   * @param {object} params
   * @param {string} params.draftContent
   * @param {string} [params.projectId='default']
   * @param {string} [params.chapterId='general']
   * @param {object} [params.draftMetadata={}]
   * @param {object} [params.snapshotContext]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleSuggestMemoryUpdate(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    if (!params.draftContent || typeof params.draftContent !== 'string') {
      throw new CollaborationError(
        'draftContent (string) is required for SuggestMemoryUpdate.',
        CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD,
        { params }
      );
    }

    const engine = new SuggestMemoryUpdate(dbManager);
    const result = engine.suggestUpdates({ ...params, requestId });

    const markdown = [
      '### [NovelEngineering] VCP Long-Term Memory Update Proposals',
      `- **Chapter / Project**: \`${result.chapterId}\` / \`${result.projectId}\``,
      `- **Total Suggestions**: ${result.totalSuggestions}`,
      `- **Requires Author Approval**: \`${result.requiresApproval}\``,
      `- **Flow**: \`${result.flow}\``,
      '',
      '#### Proposed Updates',
      ...(result.suggestions || []).map(s => `- **[${s.memoryType}]** ${s.title} (Target: \`${s.targetSection}\`)`),
      '',
      '*Call `PublishToVCPMemory` after author confirms these suggestions.*'
    ].join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 5: PublishToVCPMemory
   * Emits standardized VCP Memory Envelope JSON (Schema 1.0) with anti-pollution author confirmation gating.
   * @param {object} params
   * @param {Array<object>} params.memories
   * @param {string} [params.confirmedBy='author']
   * @param {string} [params.projectId='default']
   * @param {string} [params.chapterId]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handlePublishToVCPMemory(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    if (typeof params.memories === 'string') { try { params.memories = JSON.parse(params.memories); } catch(e) { params.memories = []; } }
    if (!Array.isArray(params.memories) || params.memories.length === 0) {
      throw new CollaborationError(
        'memories array is required and must not be empty for PublishToVCPMemory.',
        CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
        { params }
      );
    }

    const confirmedBy = params.confirmedBy !== undefined && params.confirmedBy !== null
      ? String(params.confirmedBy).trim()
      : 'author';

    if (!confirmedBy) {
      throw new CollaborationError(
        'Anti-pollution gate: confirmedBy is required to publish memories to VCP.',
        CollaborationError.CODES.MEMORY_PUBLISH_ERROR,
        { params }
      );
    }

    const publisher = new VCPMemoryPublisher(dbManager);
    const result = publisher.publishMemories({ ...params, confirmedBy, requestId });

    const markdown = [
      '### [NovelEngineering] VCP Memory Publication Envelope (Schema 1.0)',
      `- **Status**: \`${result.status}\``,
      `- **Confirmed By**: \`${result.confirmedBy}\``,
      `- **Total Memories Emitted**: ${result.totalMemories}`,
      `- **Payload SHA-256**: \`${result.payloadSha256}\``,
      '',
      '#### Emitted Memory Items',
      ...(result.memories || []).map(m => `- **[${m.memoryType}]** \`${m.title}\` (ID: \`${m.memoryId}\`, Target: \`${m.syncTarget}\`)`)
    ].join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      status: 'success',
      publicationStatus: result.status || 'EMITTED_FOR_VCP_CONSUMPTION',
      content: markdown,
      details: result
    };
  }

  /**
   * Command 6: EvaluateCanonLeakage
   * Full 7-item canon leakage and hallucination inspection with 100% recall on archived entities.
   * @param {object} params
   * @param {string} params.draftContent
   * @param {string} [params.projectId='default']
   * @param {string} [params.chapterId]
   * @param {number} [params.chapterNumber=1]
   * @param {object} [params.snapshotContext]
   * @param {Array<string>} [params.forbiddenEntities=[]]
   * @param {object} [params.metadata={}]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleEvaluateCanonLeakage(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    if (!params.draftContent || typeof params.draftContent !== 'string') {
      throw new CollaborationError(
        'draftContent (string) is required for EvaluateCanonLeakage.',
        CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD,
        { params }
      );
    }

    const evaluator = new CanonLeakageEvaluator(dbManager);
    const result = evaluator.evaluateLeakage({ ...params, requestId });

    const checkStatus = (c) => (c && c.passed ? '✅ PASS' : `❌ FAILED (${(c && c.count) || 0} violations)`);
    const markdown = [
      '### [NovelEngineering] Canon Leakage Inspection Report (7 Checks)',
      `- **Overall Result**: ${result.passed ? '✅ PASSED (Zero Critical Leaks)' : '❌ FAILED (Critical Leakage Detected)'}`,
      `- **Total Violations**: ${result.leakCount} (${result.criticalCount} CRITICAL, ${result.warningCount} WARNING)`,
      '',
      '#### Detailed 7-Check Grid',
      `- **1. Archived Content Leak (100% Recall)**: ${checkStatus(result.checks.archivedContentLeak)}`,
      `- **2. Candidate as Canon Leak**: ${checkStatus(result.checks.candidateAsCanonLeak)}`,
      `- **3. Premature Timeline Event Leak**: ${checkStatus(result.checks.prematureTimelineLeak)}`,
      `- **4. Character Knowledge Boundary Leak**: ${checkStatus(result.checks.characterKnowledgeLeak)}`,
      `- **5. Unconfirmed Setting Decision Leak**: ${checkStatus(result.checks.unconfirmedSettingLeak)}`,
      `- **6. Alternate Draft Branch Leak**: ${checkStatus(result.checks.otherBranchLeak)}`,
      `- **7. Superseded Memory Leak**: ${checkStatus(result.checks.outdatedMemoryLeak)}`
    ].join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 7: EvaluateContextPrecision
   * Calculates precision score and filters noise entities from context snapshots.
   * @param {object} params
   * @param {object} [params.contextSnapshot={}]
   * @param {object} [params.targetChapterInfo={}]
   * @param {Array<string>} [params.focusEntities]
   * @param {Array<string>} [params.keywords]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleEvaluateContextPrecision(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    const snapshot = params.contextSnapshot || params.snapshot || params;
    const chapterInfo = params.targetChapterInfo || {
      focusEntities: params.focusEntities || params.focus || [],
      keywords: params.keywords || params.tags || [],
      chapterId: params.chapterId
    };

    const result = QualityEvaluators.EvaluateContextPrecision(snapshot, chapterInfo);

    const markdown = [
      '### [NovelEngineering] Context Precision Evaluation (R8.1)',
      `- **Precision Score**: ${(result.precisionScore * 100).toFixed(1)}%`,
      `- **Relevant / Total Items**: ${result.relevantItems} / ${result.totalItems}`,
      `- **Noise Items Filtered**: ${result.noiseItems}`,
      `- **Assessment**: ${(result.recommendations || []).join(' ')}`
    ].join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 8: EvaluateContextRecall
   * Calculates recall score and pinpoints missing critical entities/rules from context snapshots.
   * @param {object} params
   * @param {object} [params.contextSnapshot={}]
   * @param {object} [params.targetChapterInfo={}]
   * @param {Array<object>} [params.fullDatabaseFacts]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleEvaluateContextRecall(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    const snapshot = params.contextSnapshot || params.snapshot || params;
    const chapterInfo = params.targetChapterInfo || {
      focusEntities: params.focusEntities || params.focus || [],
      chapterId: params.chapterId
    };

    let fullFacts = params.fullDatabaseFacts || [];
    if (!Array.isArray(fullFacts) || fullFacts.length === 0) {
      if (dbManager && dbManager.entities) {
        try {
          const entities = dbManager.entities.query({ status: 'active' });
          const rules = dbManager.sourceFiles ? dbManager.sourceFiles.query({ source_category: 'world_rule' }) : [];
          fullFacts = [...entities, ...rules];
        } catch (_) {
          fullFacts = [];
        }
      }
    }

    const result = QualityEvaluators.EvaluateContextRecall(snapshot, chapterInfo, fullFacts);

    const markdown = [
      '### [NovelEngineering] Context Recall Evaluation (R8.2)',
      `- **Recall Score**: ${(result.recallScore * 100).toFixed(1)}%`,
      `- **Recalled / Expected Items**: ${result.recalledItemsCount} / ${result.expectedItemsCount}`,
      `- **Missed Critical Entities**: ${result.missedEntitiesCount}`,
      `- **Missed Core Rules**: ${result.missedRulesCount}`,
      `- **Assessment**: ${(result.recommendations || []).join(' ')}`
    ].join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 9: EvaluateMemoryConflict
   * Detects logical contradictions between VCP long-term memories and structured canon facts.
   * @param {object} params
   * @param {Array<object>} [params.vcpMemories=[]]
   * @param {Array<object>} [params.structuredCanonFacts=[]]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleEvaluateMemoryConflict(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    const vcpMemories = Array.isArray(params.vcpMemories) ? params.vcpMemories : (params.memories || []);
    let canonFacts = Array.isArray(params.structuredCanonFacts) ? params.structuredCanonFacts : (params.canonFacts || []);

    if (canonFacts.length === 0 && dbManager && dbManager.entities) {
      try {
        canonFacts = dbManager.entities.query({ status: 'active' });
      } catch (_) {
        canonFacts = [];
      }
    }

    const result = QualityEvaluators.EvaluateMemoryConflict(vcpMemories, canonFacts);

    const markdown = [
      '### [NovelEngineering] Memory Conflict Evaluation (R8.3)',
      `- **Result**: ${result.passed ? '✅ PASSED (No Contradictions)' : `❌ CONFLICTS DETECTED (${result.conflictCount} conflicts)`}`,
      `- **Consistency Score**: ${(result.consistencyScore * 100).toFixed(1)}%`,
      result.conflicts && result.conflicts.length > 0
        ? `\n#### Contradiction Details\n${result.conflicts.map(c => `- **[${c.severity}]** Memory \`${c.memoryId}\` vs Canon \`${c.canonEntityId}\`: ${c.contradictionReason}`).join('\n')}`
        : ''
    ].filter(Boolean).join('\n');

    return {
      status: 'success',
      requestId,
      databaseRevision,
      ...result,
      content: markdown,
      details: result
    };
  }

  /**
   * Command 10: GetDebtPressure
   * Retrieves Layer 6 narrative debt pressure partition with Top-5 extreme cutoff,
   * focusEntities filtering, urgency determination, and markdown context snippet.
   * @param {object} params
   * @param {number|string} [params.chapterNumber]
   * @param {string|number} [params.chapterId]
   * @param {Array<string>|string} [params.focusEntities]
   * @param {string} [params.projectId='default']
   * @param {number} [params.maxItems=5]
   * @param {string} [params.requestId]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetDebtPressure(params = {}, context = {}) {
    const { dbManager } = context;
    const requestId = CollaborationCommands._ensureRequestId(params);
    const databaseRevision = CollaborationCommands._getDatabaseRevision(dbManager);

    if (!dbManager) {
      throw new CollaborationError(
        'DatabaseManager instance is required in context for GetDebtPressure.',
        CollaborationError.CODES.INVALID_COLLABORATION_PAYLOAD,
        { params }
      );
    }

    const chapterNumber = params.chapterNumber !== undefined && params.chapterNumber !== null
      ? Number(params.chapterNumber)
      : (params.chapterId !== undefined && params.chapterId !== null
          ? (Number(params.chapterId) || 1)
          : (params.currentChapter !== undefined && params.currentChapter !== null ? Number(params.currentChapter) : 1));

    const focusEntities = params.focusEntities || params.focusEntity || params.entities || params.entity;
    const projectId = params.projectId || params.project_id || null;
    const maxItems = params.maxItems || 5;

    let debtPressure = null;
    if (dbManager.narrativeDebts && typeof dbManager.narrativeDebts.getDebtPressure === 'function') {
      debtPressure = dbManager.narrativeDebts.getDebtPressure(chapterNumber, {
        focusEntities,
        projectId,
        maxItems
      });
    } else {
      debtPressure = {
        layer: 6,
        layerName: 'narrative_debt_pressure',
        immuneToTokenTrimming: true,
        extremeCutoffApplied: false,
        omittedDebtsCount: 0,
        chapterNumber,
        totalDebtsCount: 0,
        activeDebtsCount: 0,
        overdueDebtsCount: 0,
        debtPressureVector: {
          totalPressure: 0,
          averagePressure: 0,
          highestUrgency: 'low',
          overdueCount: 0,
          activeHooks: [],
          overdueDebts: []
        },
        formattedContextSnippet: `### ⚡ [Narrative Debt Pressure] (Chapter ${chapterNumber})\n*No active narrative debt pressure.*`
      };
    }

    const markdown = debtPressure.formattedContextSnippet;

    return {
      status: 'success',
      command: 'GetDebtPressure',
      requestId,
      databaseRevision,
      layer: debtPressure.layer,
      layerName: debtPressure.layerName,
      immuneToTokenTrimming: debtPressure.immuneToTokenTrimming,
      extremeCutoffApplied: debtPressure.extremeCutoffApplied,
      omittedDebtsCount: debtPressure.omittedDebtsCount,
      chapterNumber: debtPressure.chapterNumber,
      debtPressureVector: debtPressure.debtPressureVector,
      formattedContextSnippet: debtPressure.formattedContextSnippet,
      debts: [
        ...(debtPressure.debtPressureVector.overdueDebts || []),
        ...(debtPressure.debtPressureVector.activeHooks || [])
      ],
      content: [
        {
          type: 'text',
          text: markdown
        }
      ],
      details: {
        command: 'GetDebtPressure',
        requestId,
        databaseRevision,
        ...debtPressure
      }
    };
  }
}

module.exports = CollaborationCommands;
