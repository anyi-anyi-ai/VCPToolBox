/**
 * @file ContextBudgetEngine.js
 * @description 11-Level Priority Token Budget Estimator & Pruning Cascade for VCP Collaboration Protocol.
 * Enforces strict pruning rules: Priority 1 is NEVER trimmed; Priority 9 is NEVER silently dropped.
 * @module collaboration/ContextBudgetEngine
 */

'use strict';

const { CollaborationError } = require('../errors');

class ContextBudgetEngine {
  /**
   * 11 Priority Levels in descending order of importance (1 = highest / never trim, 11 = lowest / trim first)
   */
  static get PRIORITY_LEVELS() {
    return {
      AUTHOR_DIRECTIVES: 1,      // Priority 1: Author current directives (NEVER trim)
      WORLD_RULES_GLOBAL: 2,     // Priority 2: Global world hard rules
      CHAPTER_FACTS: 3,          // Priority 3: Current + preceding chapter facts
      FOCUSED_CANON_ARCHIVES: 4, // Priority 4: Confirmed archives of focused entities
      CHARACTER_STATES: 5,       // Priority 5: Character current state and known info
      TIMELINE_WINDOW: 6,        // Priority 6: Timeline window
      ACTIVE_FORESHADOWING: 7,   // Priority 7: Active foreshadowing
      REVIEWED_DECISIONS: 8,     // Priority 8: Reviewed creative decisions & memories
      CONFLICTS_AND_UNKNOWN: 9,  // Priority 9: Structured conflicts and unresolved items (NEVER silently drop)
      SEMANTIC_CANDIDATES: 10,   // Priority 10: Semantic candidates and creative materials
      EXTENDED_MATERIALS: 11     // Priority 11: Low-relevance extended materials (trim first)
    };
  }

  /**
   * Fast & deterministic token estimation for multilingual (CJK + Latin) text and objects
   * @param {string|object|Array|null} input
   * @returns {number} Estimated token count
   */
  static estimateTokens(input) {
    if (input === null || input === undefined) return 0;

    if (typeof input === 'object') {
      try {
        const jsonStr = JSON.stringify(input);
        return ContextBudgetEngine.estimateTokens(jsonStr);
      } catch (_) {
        return 0;
      }
    }

    const text = String(input);
    if (!text || text.length === 0) return 0;

    // Count CJK characters (roughly 1 token per character)
    const cjkMatches = text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
    const cjkCount = cjkMatches ? cjkMatches.length : 0;

    // Strip CJK characters and estimate tokens for Latin words / numbers / punctuation
    const nonCjkText = text.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ').trim();
    let latinTokens = 0;
    if (nonCjkText.length > 0) {
      const words = nonCjkText.split(/\s+/).filter(Boolean);
      // Average 1.33 tokens per English word or ~3.8 chars per token
      latinTokens = Math.max(Math.ceil(words.length * 1.33), Math.ceil(nonCjkText.length / 3.8));
    }

    const total = cjkCount + latinTokens;
    return Math.max(1, total);
  }

  /**
   * Cascade-prunes context snapshot according to the 11-level priority order
   * @param {object} contextData - Raw compiled context with 5 layers
   * @param {number} [maxTokens=30000] - Token budget ceiling
   * @param {object} [options={}]
   * @returns {object} Trimmed context with contextBudget metadata
   */
  static trimContext(contextData, maxTokens = 30000, options = {}) {
    let budgetLimit = 30000;
    if (maxTokens !== undefined && maxTokens !== null && !isNaN(Number(maxTokens))) {
      const num = Number(maxTokens);
      budgetLimit = num <= 0 ? 100 : num;
    }
    const result = {
      ...contextData,
      authorDirectives: Array.isArray(contextData.authorDirectives) ? [...contextData.authorDirectives] : [],
      canonFacts: Array.isArray(contextData.canonFacts) ? [...contextData.canonFacts] : [],
      reviewedMemories: Array.isArray(contextData.reviewedMemories) ? [...contextData.reviewedMemories] : [],
      semanticCandidates: Array.isArray(contextData.semanticCandidates) ? [...contextData.semanticCandidates] : [],
      conflicts: Array.isArray(contextData.conflicts) ? [...contextData.conflicts] : [],
      unresolved: Array.isArray(contextData.unresolved) ? [...contextData.unresolved] : [],
      warnings: Array.isArray(contextData.warnings) ? [...contextData.warnings] : []
    };

    // Calculate initial tokens
    const tokenPayload = {};
    if (result.authorDirectives.length > 0) tokenPayload.authorDirectives = result.authorDirectives;
    if (result.canonFacts.length > 0) tokenPayload.canonFacts = result.canonFacts;
    if (result.reviewedMemories.length > 0) tokenPayload.reviewedMemories = result.reviewedMemories;
    if (result.semanticCandidates.length > 0) tokenPayload.semanticCandidates = result.semanticCandidates;
    if (result.conflicts.length > 0) tokenPayload.conflicts = result.conflicts;
    if (result.unresolved.length > 0) tokenPayload.unresolved = result.unresolved;

    const initialTokens = ContextBudgetEngine.estimateTokens(tokenPayload);

    if (initialTokens <= budgetLimit) {
      result.contextBudget = {
        estimatedTokens: initialTokens,
        maxTokens: budgetLimit,
        trimmed: false,
        trimReason: null,
        omittedSections: [],
        omittedSourceCount: 0
      };
      return result;
    }

    // Pruning required
    const omittedSections = new Set();
    let omittedSourceCount = 0;

    // Pruning cascade order: Priority 11 -> 10 -> 9 -> 8 -> 7 -> 6 -> 5 -> 4 -> 3 -> 2 (Priority 1 NEVER trimmed)
    const pruningSteps = [
      {
        priority: 11,
        name: 'extendedMaterials',
        target: 'semanticCandidates',
        filter: (item) => item.priority === 11 || item.authority === 'extended_material' || item.relevance === 'low'
      },
      {
        priority: 10,
        name: 'semanticCandidates',
        target: 'semanticCandidates',
        filter: () => true
      },
      {
        priority: 9,
        name: 'conflictsAndUnknown',
        target: ['conflicts', 'unresolved'],
        isPriority9: true
      },
      {
        priority: 8,
        name: 'reviewedMemories',
        target: 'reviewedMemories',
        filter: () => true
      },
      {
        priority: 7,
        name: 'activeForeshadowing',
        target: 'canonFacts',
        filter: (item) => item.category === 'foreshadowing' || item.mentionType === 'foreshadowing'
      },
      {
        priority: 6,
        name: 'timelineWindow',
        target: 'canonFacts',
        filter: (item) => item.category === 'timeline' || item.mentionType === 'timeline_event'
      },
      {
        priority: 5,
        name: 'characterStates',
        target: 'canonFacts',
        filter: (item) => item.category === 'character' || item.entityType === 'character'
      },
      {
        priority: 4,
        name: 'focusedCanonArchives',
        target: 'canonFacts',
        filter: (item) => item.canonLevel < 3 && item.category !== 'world_rule' && item.category !== 'chapter'
      },
      {
        priority: 3,
        name: 'chapterFacts',
        target: 'canonFacts',
        filter: (item) => item.category === 'chapter' && !item.isCurrentChapter
      },
      {
        priority: 2,
        name: 'worldRulesScoped',
        target: 'canonFacts',
        filter: (item) => item.category === 'world_rule' && item.ruleScope === 'scoped'
      }
    ];

    const getCurrentTokenCount = () => {
      return ContextBudgetEngine.estimateTokens({
        authorDirectives: result.authorDirectives,
        canonFacts: result.canonFacts,
        reviewedMemories: result.reviewedMemories,
        semanticCandidates: result.semanticCandidates,
        conflicts: result.conflicts,
        unresolved: result.unresolved
      });
    };

    for (const step of pruningSteps) {
      if (getCurrentTokenCount() <= budgetLimit) break;

      if (step.isPriority9) {
        // Priority 9 Trimming: conflicts and unresolved
        // HARD CONSTRAINT: Never silently drop. Must record structured metadata.
        const conflictsCount = result.conflicts.length;
        const unresolvedCount = result.unresolved.length;

        if (conflictsCount > 0 || unresolvedCount > 0) {
          // Trim items from end
          while (result.unresolved.length > 0 && getCurrentTokenCount() > budgetLimit) {
            result.unresolved.pop();
            omittedSourceCount++;
            omittedSections.add('unresolved');
          }
          while (result.conflicts.length > 0 && getCurrentTokenCount() > budgetLimit) {
            result.conflicts.pop();
            omittedSourceCount++;
            omittedSections.add('conflicts');
          }

          if (omittedSections.has('conflicts') || omittedSections.has('unresolved')) {
            if (!result.warnings.some(w => w.includes('部分冲突与未决设定因Token预算受限已被裁剪'))) {
              result.warnings.push('部分冲突与未决设定因Token预算受限已被裁剪，请参考元数据');
            }
          }
        }
        continue;
      }

      const targets = Array.isArray(step.target) ? step.target : [step.target];
      for (const targetKey of targets) {
        if (!Array.isArray(result[targetKey]) || result[targetKey].length === 0) continue;

        const originalArray = result[targetKey];
        const toKeep = [];
        const toTrim = [];

        for (let i = 0; i < originalArray.length; i++) {
          const item = originalArray[i];
          if (step.filter(item)) {
            toTrim.push(item);
          } else {
            toKeep.push(item);
          }
        }

        if (toTrim.length > 0) {
          // Drop items from toTrim from end to start until fits
          while (toTrim.length > 0 && getCurrentTokenCount() > budgetLimit) {
            toTrim.pop();
            omittedSourceCount++;
            omittedSections.add(step.name);
          }

          result[targetKey] = [...toKeep, ...toTrim];
          if (step.priority === 10 || step.priority === 11) {
            if (!result.warnings.some(w => w.includes('部分候选资料未装入上下文'))) {
              result.warnings.push('部分候选资料未装入上下文');
            }
          }
        }
      }
    }

    const finalTokens = getCurrentTokenCount();
    result.contextBudget = {
      estimatedTokens: finalTokens,
      maxTokens: budgetLimit,
      trimmed: true,
      trimReason: 'context_budget',
      omittedSections: Array.from(omittedSections),
      omittedSourceCount
    };

    return result;
  }
}

module.exports = ContextBudgetEngine;
