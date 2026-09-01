/**
 * @file QualityEvaluators.js
 * @description (R8) Quality Evaluation Engines for VCP Collaboration: Context Precision, Context Recall, and Memory Conflict.
 * @module collaboration/QualityEvaluators
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../errors');

class QualityEvaluators {
  /**
   * 1. EvaluateContextPrecision
   * Measures what fraction of items in context snapshot are relevant to the target chapter.
   * @param {object} contextSnapshot
   * @param {object} targetChapterInfo
   * @returns {object} Precision metric breakdown
   */
  static EvaluateContextPrecision(contextSnapshot = {}, targetChapterInfo = {}) {
    const focusEntities = new Set(
      (targetChapterInfo.focusEntities || targetChapterInfo.focus || [])
        .map(e => String(e).toLowerCase().trim())
    );
    const chapterKeywords = (targetChapterInfo.keywords || targetChapterInfo.tags || [])
      .map(k => String(k).toLowerCase().trim());

    let totalItems = 0;
    let relevantItems = 0;
    const noiseEntities = [];

    const checkItemRelevance = (item) => {
      if (!item) return false;
      totalItems++;
      const name = String(item.canonicalName || item.canonical_name || item.title || item.entityId || item.entity_id || '').toLowerCase();
      const content = String(item.content || item.rawContent || item.directive || '').toLowerCase();

      // Check focus entity match
      for (const fe of focusEntities) {
        if (fe && (name.includes(fe) || content.includes(fe))) {
          relevantItems++;
          return true;
        }
      }

      // Check global hard rule
      if (item.category === 'world_rule' && (item.ruleScope === 'global' || item.isGlobal === true)) {
        relevantItems++;
        return true;
      }

      // Check chapter keywords
      for (const kw of chapterKeywords) {
        if (kw && (content.includes(kw) || name.includes(kw))) {
          relevantItems++;
          return true;
        }
      }

      noiseEntities.push({
        id: item.entityId || item.id || item.title,
        name: item.canonicalName || item.title,
        category: item.category || 'unknown'
      });
      return false;
    };

    if (Array.isArray(contextSnapshot.canonFacts)) {
      contextSnapshot.canonFacts.forEach(checkItemRelevance);
    }
    if (Array.isArray(contextSnapshot.semanticCandidates)) {
      contextSnapshot.semanticCandidates.forEach(checkItemRelevance);
    }
    if (Array.isArray(contextSnapshot.reviewedMemories)) {
      contextSnapshot.reviewedMemories.forEach(checkItemRelevance);
    }

    const precisionScore = totalItems > 0 ? Number((relevantItems / totalItems).toFixed(4)) : 1.0;

    return {
      precisionScore,
      totalItems,
      relevantItems,
      noiseItems: totalItems - relevantItems,
      noiseEntities: noiseEntities.slice(0, 20),
      recommendations: precisionScore < 0.7
        ? ['Consider narrowing focusEntities or tightening semantic candidate filters.']
        : ['Context precision is within optimal range.']
    };
  }

  /**
   * 2. EvaluateContextRecall
   * Measures whether any critical canon facts, active entities, or key rules were missed from context snapshot.
   * @param {object} contextSnapshot
   * @param {object} targetChapterInfo
   * @param {Array<object>} fullDatabaseFacts
   * @returns {object} Recall metric breakdown
   */
  static EvaluateContextRecall(contextSnapshot = {}, targetChapterInfo = {}, fullDatabaseFacts = []) {
    const focusEntities = new Set(
      (targetChapterInfo.focusEntities || targetChapterInfo.focus || [])
        .map(e => String(e).toLowerCase().trim())
    );

    // Identify expected critical items from full database facts
    const expectedItems = fullDatabaseFacts.filter(fact => {
      if (!fact) return false;
      const name = String(fact.canonical_name || fact.canonicalName || fact.entity_id || fact.entityId || '').toLowerCase();
      const isFocus = Array.from(focusEntities).some(fe => fe && name.includes(fe));
      const isGlobalRule = fact.category === 'world_rule' || fact.source_category === 'world_rule';
      return isFocus || isGlobalRule;
    });

    const snapshotEntityIds = new Set();
    const snapshotContent = [];

    if (Array.isArray(contextSnapshot.canonFacts)) {
      contextSnapshot.canonFacts.forEach(f => {
        if (!f) return;
        if (f.entityId) snapshotEntityIds.add(String(f.entityId).toLowerCase());
        if (f.entity_id) snapshotEntityIds.add(String(f.entity_id).toLowerCase());
        if (f.canonicalName) snapshotEntityIds.add(String(f.canonicalName).toLowerCase());
        if (f.canonical_name) snapshotEntityIds.add(String(f.canonical_name).toLowerCase());
        snapshotContent.push(String(f.content || f.rawContent || ''));
      });
    }

    const missedEntities = [];
    const missedRules = [];
    let recalledCount = 0;

    for (const exp of expectedItems) {
      const entId = String(exp.entity_id || exp.entityId || '').toLowerCase();
      const canonName = String(exp.canonical_name || exp.canonicalName || '').toLowerCase();

      const isRecalled = (entId && snapshotEntityIds.has(entId)) ||
        (canonName && snapshotEntityIds.has(canonName)) ||
        (canonName && snapshotContent.some(c => c.includes(canonName)));

      if (isRecalled) {
        recalledCount++;
      } else {
        if (exp.category === 'world_rule' || exp.source_category === 'world_rule') {
          missedRules.push(exp);
        } else {
          missedEntities.push(exp);
        }
      }
    }

    const totalExpected = expectedItems.length;
    const recallScore = totalExpected > 0 ? Number((recalledCount / totalExpected).toFixed(4)) : 1.0;

    return {
      recallScore,
      expectedItemsCount: totalExpected,
      recalledItemsCount: recalledCount,
      missedEntitiesCount: missedEntities.length,
      missedRulesCount: missedRules.length,
      missedEntities,
      missedRules,
      recommendations: recallScore < 1.0
        ? [`${missedEntities.length} critical entities and ${missedRules.length} rules were omitted.`]
        : ['100% recall achieved on critical focus entities and world rules.']
    };
  }

  /**
   * 3. EvaluateMemoryConflict
   * Detects contradictions between VCP long-term memories and structured canon facts.
   * @param {Array<object>} vcpMemories
   * @param {Array<object>} structuredCanonFacts
   * @returns {object} Conflict detection report
   */
  static EvaluateMemoryConflict(vcpMemories = [], structuredCanonFacts = []) {
    const canonMap = new Map();

    structuredCanonFacts.forEach(f => {
      if (!f) return;
      const id = String(f.entityId || f.entity_id || '').toLowerCase();
      const name = String(f.canonicalName || f.canonical_name || '').toLowerCase();
      if (id) canonMap.set(id, f);
      if (name) canonMap.set(name, f);
    });

    const conflicts = [];

    vcpMemories.forEach((mem, index) => {
      if (!mem) return;
      const targetId = String(mem.targetEntityId || mem.entityId || '').toLowerCase();
      const title = String(mem.title || mem.canonicalName || '').toLowerCase();
      const matchedCanon = (targetId && canonMap.get(targetId)) || (title && canonMap.get(title));

      if (matchedCanon) {
        // Attribute mismatch or status contradiction check
        const memStatus = String(mem.status || mem.entityStatus || '').toLowerCase();
        const canonStatus = String(matchedCanon.status || matchedCanon.canonStatus || '').toLowerCase();

        if (memStatus && canonStatus && memStatus !== canonStatus) {
          conflicts.push({
            memoryId: mem.memoryId || `mem_${index}`,
            canonEntityId: matchedCanon.entityId || matchedCanon.canonicalName,
            contradictionReason: `Status mismatch: Memory asserts status="${memStatus}" but Canon is "${canonStatus}".`,
            memoryValue: memStatus,
            canonValue: canonStatus,
            severity: 'CRITICAL'
          });
        }

        // Direct contradiction flag
        if (mem.contradictsCanon === true || mem.contradictionWithCanon) {
          conflicts.push({
            memoryId: mem.memoryId || `mem_${index}`,
            canonEntityId: matchedCanon.entityId || matchedCanon.canonicalName,
            contradictionReason: mem.contradictionReason || 'Explicit memory contradiction with canon fact',
            memoryValue: mem.content,
            canonValue: matchedCanon.content,
            severity: 'CRITICAL'
          });
        }
      }
    });

    const totalCompared = vcpMemories.length;
    const consistencyScore = totalCompared > 0
      ? Number(Math.max(0, 1 - conflicts.length / totalCompared).toFixed(4))
      : 1.0;

    return {
      passed: conflicts.length === 0,
      conflictCount: conflicts.length,
      consistencyScore,
      conflicts
    };
  }
}

module.exports = QualityEvaluators;
