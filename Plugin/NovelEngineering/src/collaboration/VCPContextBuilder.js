/**
 * @file VCPContextBuilder.js
 * @description 5-Layer Context Funnel Compiler (Schema 4.0) with Strict Anti-Override Logic and Lineage Trace Auto-Logging.
 * @module collaboration/VCPContextBuilder
 */

'use strict';

const crypto = require('crypto');
const ContextBudgetEngine = require('./ContextBudgetEngine');
const TraceManager = require('./TraceManager');
const ContextV3Engine = require('../context/ContextV3Engine');
const { CollaborationError } = require('../errors');

class VCPContextBuilder {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {TraceManager} [options.traceManager]
   * @param {ContextV3Engine} [options.contextV3Engine]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new CollaborationError('DatabaseManager instance is required for VCPContextBuilder');
    }
    this.dbManager = dbManager;
    this.traceManager = options.traceManager || new TraceManager(dbManager);
    this.contextV3Engine = options.contextV3Engine || new ContextV3Engine(dbManager, options);
  }

  /**
   * Generate UUID v4
   * @private
   */
  _generateUUID() {
    return crypto.randomUUID ? crypto.randomUUID() : `req_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Generate SHA-256 hash stamp (64-char lowercase hex)
   * @private
   */
  _computeHash(content) {
    const text = typeof content === 'string' ? content : JSON.stringify(content || '');
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex').toLowerCase();
  }

  /**
   * Build 5-layer VCP Context Snapshot matching exact Schema 4.0 specification
   * @param {object} params
   * @param {string} [params.projectId='default']
   * @param {string|number} [params.chapterId]
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
   * @returns {object} Standard 4.0 JSON Context Snapshot
   */
  buildContext(params = {}) {
    const requestId = params.requestId || this._generateUUID();
    const databaseRevision = this.dbManager.getSchemaVersion ? this.dbManager.getSchemaVersion() : 4;
    const projectId = String(params.projectId || 'default').trim();
    const chapterId = params.chapterId !== undefined && params.chapterId !== null ? String(params.chapterId).trim() : 'general';
    const maxTokens = Number(params.maxTokens) || 30000;

    const rawFocus = params.focusEntities || params.focusEntity || [];
    const focusEntities = ContextV3Engine.normalizeFocusEntities(rawFocus);
    const sourcePolicy = params.sourcePolicy ? String(params.sourcePolicy).toLowerCase().trim() : 'canon_and_reviewed';

    const snapshotId = `ctx_v4_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const warnings = [];

    // --- LAYER 1: Author Directives (Top Priority) ---
    const rawDirectives = Array.isArray(params.authorDirectives)
      ? params.authorDirectives
      : (params.authorDirectives ? [params.authorDirectives] : []);

    const authorDirectives = rawDirectives.map((d, index) => {
      const content = typeof d === 'string' ? d : (d.content || d.directive || JSON.stringify(d));
      const hash = this._computeHash(content);
      return {
        id: `dir_${index + 1}`,
        directive: content,
        content,
        sourceSystem: 'UserDirective',
        authority: 'author_directive',
        priority: 1,
        sha256Hash: hash,
        hashTrackingStamp: hash
      };
    });

    // --- Retrieve Underlying Engineering Facts via ContextV3Engine ---
    const underlyingSnapshot = this.contextV3Engine.buildSnapshot({
      projectId,
      chapterId,
      focusEntities,
      sourcePolicy,
      includeWorldRules: params.includeWorldRules !== false,
      includeTimeline: true,
      includeForeshadowing: true,
      includeRawContent: true
    });

    // --- LAYER 2: Canon Facts ---
    const canonFacts = [];
    const canonEntityMap = new Map(); // entityId/canonicalName -> canon item

    // Aggregate World Rules (Global & Scoped)
    const rawGlobalRules = underlyingSnapshot.worldRulesGlobal ||
      (underlyingSnapshot.worldRules && underlyingSnapshot.worldRules.global) ||
      (Array.isArray(underlyingSnapshot.worldRules)
        ? underlyingSnapshot.worldRules.filter(r => r.isGlobal || r.scopeType === 'global' || r.ruleScope === 'global')
        : []);

    const rawScopedRules = underlyingSnapshot.worldRulesScoped ||
      (underlyingSnapshot.worldRules && underlyingSnapshot.worldRules.scoped) ||
      (Array.isArray(underlyingSnapshot.worldRules)
        ? underlyingSnapshot.worldRules.filter(r => !r.isGlobal && r.scopeType !== 'global' && r.ruleScope !== 'global')
        : []);

    rawGlobalRules.forEach(r => {
      const item = {
        ...r,
        sourceSystem: r.sourceSystem || 'NovelEngineering',
        authority: 'canon_core',
        priority: 2,
        category: 'world_rule',
        ruleScope: 'global',
        sha256Hash: r.sha256Hash || this._computeHash(r.content || r.rawContent || r.rule_name || r.title),
        hashTrackingStamp: r.sha256Hash || this._computeHash(r.content || r.rawContent || r.rule_name || r.title)
      };
      canonFacts.push(item);
    });

    rawScopedRules.forEach(r => {
      const item = {
        ...r,
        sourceSystem: r.sourceSystem || 'NovelEngineering',
        authority: 'canon_core',
        priority: 2,
        category: 'world_rule',
        ruleScope: 'scoped',
        sha256Hash: r.sha256Hash || this._computeHash(r.content || r.rawContent || r.rule_name || r.title),
        hashTrackingStamp: r.sha256Hash || this._computeHash(r.content || r.rawContent || r.rule_name || r.title)
      };
      canonFacts.push(item);
    });

    // Aggregate Canon Sources & Chapter Sources
    if (underlyingSnapshot.canonSources) {
      underlyingSnapshot.canonSources.forEach(s => {
        const isCharacter = s.entityType === 'character' || s.category === 'character';
        const item = {
          ...s,
          sourceSystem: s.sourceSystem || 'NovelEngineering',
          authority: s.canonLevel >= 3 ? 'canon_core' : 'canon_reviewed',
          priority: isCharacter ? 5 : 4,
          category: s.category || (isCharacter ? 'character' : 'entity'),
          sha256Hash: s.sha256Hash || this._computeHash(s.content || s.canonicalName),
          hashTrackingStamp: s.sha256Hash || this._computeHash(s.content || s.canonicalName)
        };
        canonFacts.push(item);
        if (s.entityId) canonEntityMap.set(String(s.entityId).toLowerCase(), item);
        if (s.canonicalName) canonEntityMap.set(String(s.canonicalName).toLowerCase(), item);
      });
    }

    if (underlyingSnapshot.chapterSources) {
      underlyingSnapshot.chapterSources.forEach(cs => {
        const item = {
          ...cs,
          sourceSystem: cs.sourceSystem || 'NovelEngineering',
          authority: 'canon_chapter',
          priority: 3,
          category: 'chapter',
          sha256Hash: cs.sha256Hash || this._computeHash(cs.content || cs.title),
          hashTrackingStamp: cs.sha256Hash || this._computeHash(cs.content || cs.title)
        };
        canonFacts.push(item);
      });
    }

    // Aggregate Timeline Events (Priority 6)
    if (underlyingSnapshot.timelineEvents) {
      underlyingSnapshot.timelineEvents.forEach(te => {
        const item = {
          ...te,
          sourceSystem: te.sourceSystem || 'NovelEngineering',
          authority: 'canon_timeline',
          priority: 6,
          category: 'timeline',
          sha256Hash: te.sha256Hash || this._computeHash(te.content || te.title || te.description),
          hashTrackingStamp: te.sha256Hash || this._computeHash(te.content || te.title || te.description)
        };
        canonFacts.push(item);
      });
    }

    // --- LAYER 3: Reviewed Memories (DailyNote & Reviewed Decisions) ---
    const reviewedMemories = [];
    const incomingMemoryRefs = Array.isArray(params.vcpMemoryRefs) ? params.vcpMemoryRefs : [];

    incomingMemoryRefs.forEach((mem, index) => {
      const content = typeof mem === 'string' ? mem : (mem.content || mem.summary || JSON.stringify(mem));
      const hash = mem.sha256Hash || this._computeHash(content);
      const isReviewed = mem.isReviewed === true || mem.status === 'reviewed' || mem.reviewStatus === 'confirmed';

      // Anti-Override check: If memory contradicts canon
      const memEntityId = (mem.entityId || mem.targetEntityId || '').toLowerCase();
      const memName = (mem.canonicalName || mem.title || '').toLowerCase();
      const existingCanon = (memEntityId && canonEntityMap.get(memEntityId)) || (memName && canonEntityMap.get(memName));

      if (existingCanon && mem.contradictionWithCanon) {
        warnings.push(`[WARN_SEMANTIC_OVERRIDE_PREVENTED] VCP Memory "${mem.title || mem.memoryId || index}" contradicts canon entity "${existingCanon.canonicalName || existingCanon.entityId}". Canon takes strict precedence.`);
        return; // Exclude contradicting unverified memory
      }

      reviewedMemories.push({
        memoryId: mem.memoryId || `mem_${index + 1}`,
        memoryType: mem.memoryType || 'daily_note',
        title: mem.title || `Memory #${index + 1}`,
        content,
        tags: Array.isArray(mem.tags) ? mem.tags : [],
        sourceSystem: mem.sourceSystem || 'VCP-DailyNote',
        authority: isReviewed ? 'reviewed_memory' : 'unreviewed_memory',
        priority: 8,
        sha256Hash: hash,
        hashTrackingStamp: hash
      });
    });

    // --- LAYER 4: Semantic Candidates (External RAG & Brainstorms) with Anti-Override ---
    const semanticCandidates = [];
    const incomingCandidates = Array.isArray(params.semanticCandidates)
      ? params.semanticCandidates
      : [];

    // Also merge candidateSources from underlying snapshot
    const allCandidates = [
      ...(underlyingSnapshot.candidateSources || []).map(cs => ({ ...cs, sourceSystem: 'NovelEngineering', authority: 'candidate_source' })),
      ...incomingCandidates
    ];

    allCandidates.forEach((cand, index) => {
      const candContent = typeof cand === 'string' ? cand : (cand.content || cand.snippet || JSON.stringify(cand));
      const hash = cand.sha256Hash || this._computeHash(candContent);
      const candEntityId = String(cand.entityId || cand.entity_id || '').toLowerCase();
      const candName = String(cand.canonicalName || cand.canonical_name || cand.title || '').toLowerCase();

      const existingCanon = (candEntityId && canonEntityMap.get(candEntityId)) || (candName && canonEntityMap.get(candName));

      // ANTI-OVERRIDE CHECK
      if (existingCanon) {
        // If candidate attempts to override canon properties or has conflicting status
        const isConflicting = cand.status === 'conflict' || cand.overrideAttempt === true || cand.contradictsCanon === true || cand.overridesCanon === true;
        if (isConflicting) {
          warnings.push(`[WARN_SEMANTIC_OVERRIDE_PREVENTED] Candidate "${cand.title || cand.canonicalName || cand.entityId || index}" contradicts canon entity "${existingCanon.canonicalName || existingCanon.entityId}". Canon takes strict precedence.`);
          semanticCandidates.push({
            candidateId: cand.candidateId || `cand_${index + 1}`,
            title: cand.title || cand.canonicalName || `Candidate #${index + 1}`,
            content: candContent,
            sourceSystem: cand.sourceSystem || 'VCP-RAG',
            authority: 'semantic_candidate',
            priority: 10,
            overridePrevented: true,
            canonConflict: true,
            sha256Hash: hash,
            hashTrackingStamp: hash
          });
          return;
        }
      }

      semanticCandidates.push({
        candidateId: cand.candidateId || `cand_${index + 1}`,
        title: cand.title || cand.canonicalName || `Candidate #${index + 1}`,
        content: candContent,
        sourceSystem: cand.sourceSystem || 'VCP-RAG',
        authority: cand.authority || 'semantic_candidate',
        priority: cand.priority || 10,
        sha256Hash: hash,
        hashTrackingStamp: hash
      });
    });

    // --- LAYER 5: Conflicts & Unknowns ---
    const conflicts = (params.includeConflicts !== false ? (underlyingSnapshot.conflicts || []) : []).map(c => ({
      ...c,
      sourceSystem: 'NovelEngineering',
      authority: 'conflict_warning',
      priority: 9,
      sha256Hash: c.sha256Hash || this._computeHash(c.content || c.message || c.title),
      hashTrackingStamp: c.sha256Hash || this._computeHash(c.content || c.message || c.title)
    }));

    const unresolved = (params.includeUnresolved !== false ? (underlyingSnapshot.unresolved || []) : []).map(u => ({
      ...u,
      sourceSystem: 'NovelEngineering',
      authority: 'unresolved_foreshadowing',
      priority: 9,
      sha256Hash: u.sha256Hash || this._computeHash(u.content || u.description || u.title),
      hashTrackingStamp: u.sha256Hash || this._computeHash(u.content || u.description || u.title)
    }));

    // Compile Lineage Source Trace
    const sourceTrace = [];
    const allLayers = [
      ...authorDirectives,
      ...canonFacts,
      ...reviewedMemories,
      ...semanticCandidates,
      ...conflicts,
      ...unresolved
    ];

    allLayers.forEach((item) => {
      sourceTrace.push({
        sourceFileId: item.sourceFileId || item.source_file_id || null,
        sourceFilePath: item.sourceFilePath || item.source_file_path || null,
        sourceSystem: item.sourceSystem || 'NovelEngineering',
        authority: item.authority || 'unknown',
        sha256: item.sha256Hash || item.hashTrackingStamp || null,
        entityId: item.entityId || item.entity_id || null,
        category: item.category || 'general',
        priority: item.priority || 10
      });
    });

    // --- Assemble Context V4 Payload ---
    const rawPayload = {
      contextVersion: '4.0',
      projectId,
      chapterId,
      snapshotId,
      requestId,
      databaseRevision,
      authorDirectives,
      canonFacts,
      reviewedMemories,
      semanticCandidates,
      conflicts,
      unresolved,
      sourceTrace,
      warnings
    };

    // Apply 11-Level Priority Budget Trimming Cascade
    const trimmedResult = ContextBudgetEngine.trimContext(rawPayload, maxTokens);

    // Automatically Persist Context Trace to SQLite
    try {
      this.traceManager.saveTrace({
        snapshotId,
        projectId,
        chapterId,
        totalSources: sourceTrace.length,
        traceItems: sourceTrace,
        budgetStats: trimmedResult.contextBudget,
        sourceSystems: Array.from(new Set(sourceTrace.map(t => t.sourceSystem))),
        focusEntities
      });
    } catch (err) {
      trimmedResult.warnings.push(`Context trace persistence notice: ${err.message}`);
    }

    return trimmedResult;
  }
}

module.exports = VCPContextBuilder;
