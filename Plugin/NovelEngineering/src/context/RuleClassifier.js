/**
 * @file RuleClassifier.js
 * @description World Rule Classifier for Global Axioms vs Scoped Rules (Phase 3 Milestone 4)
 * @module context/RuleClassifier
 * @license MIT
 */

'use strict';

class RuleClassifier {
  /**
   * Determines if a world rule / entity is a global axiom vs scoped rule based on 6-tier classification
   * @param {object} ruleRecord - Entity or SourceFile record
   * @returns {{ isGlobal: boolean, scopeType: 'global'|'scoped', reason: string, boundEntities: string[] }}
   */
  static classify(ruleRecord = {}) {
    if (!ruleRecord) {
      return { isGlobal: false, scopeType: 'scoped', reason: 'Null record', boundEntities: [] };
    }

    // 1. Extract parsed frontmatter or attributes JSON
    let fm = {};
    if (ruleRecord.frontmatter_json) {
      try {
        fm = typeof ruleRecord.frontmatter_json === 'string'
          ? JSON.parse(ruleRecord.frontmatter_json)
          : ruleRecord.frontmatter_json;
      } catch (_) { fm = {}; }
    } else if (ruleRecord.attributes_json) {
      try {
        fm = typeof ruleRecord.attributes_json === 'string'
          ? JSON.parse(ruleRecord.attributes_json)
          : ruleRecord.attributes_json;
      } catch (_) { fm = {}; }
    } else if (ruleRecord.frontmatter && typeof ruleRecord.frontmatter === 'object') {
      fm = ruleRecord.frontmatter;
    }

    // Extract potential bound entities
    const boundEntities = [];
    if (fm.bound_entity_id) boundEntities.push(String(fm.bound_entity_id).trim());
    if (Array.isArray(fm.bound_entities)) boundEntities.push(...fm.bound_entities.map(e => String(e).trim()));
    if (Array.isArray(fm.entities)) boundEntities.push(...fm.entities.map(e => String(e).trim()));
    if (Array.isArray(fm.bound_tags)) boundEntities.push(...fm.bound_tags.map(t => String(t).trim()));
    const entIdVal = fm.entity_id || fm.entityId || fm.id;
    if (entIdVal && (ruleRecord.source_category === 'world_rule' || ruleRecord.source_category === 'entity' || fm.rule_scope === 'scoped' || !fm.rule_scope)) {
      boundEntities.push(String(entIdVal).trim());
    }
    if (fm.planet) boundEntities.push(String(fm.planet).trim());
    if (fm.faction) boundEntities.push(String(fm.faction).trim());
    if (fm.chapter_number !== undefined || fm.chapter !== undefined) {
      boundEntities.push(`CH-${fm.chapter_number || fm.chapter}`);
    }

    // Tier 1: Explicit Frontmatter Scope Flag
    const scopeVal = String(fm.rule_scope || fm.scope || '').toLowerCase().trim();
    if (scopeVal === 'global' || fm.global === true || fm.is_global === true) {
      return { isGlobal: true, scopeType: 'global', reason: 'Explicit frontmatter scope=global', boundEntities };
    }
    if (scopeVal === 'scoped' || scopeVal === 'local' || fm.global === false || fm.is_global === false) {
      return { isGlobal: false, scopeType: 'scoped', reason: 'Explicit frontmatter scope=scoped', boundEntities };
    }

    // Tier 2: Bound Entities / Tags Check & Universal Category with no bindings
    const relPath = (ruleRecord.relative_path || ruleRecord.file_path || '').replace(/\\/g, '/');
    if (/^(02_|03_|04_|05_|06_)/i.test(relPath) || /(entities|characters|planets|chapters|foreshadowing)/i.test(relPath)) {
      return { isGlobal: false, scopeType: 'scoped', reason: 'Entity or chapter path hierarchy', boundEntities };
    }

    const category = (ruleRecord.source_category || ruleRecord.category || ruleRecord.entity_type || '').toLowerCase();
    const isRuleCategory = ['world_rule', 'system_rule', 'rule', 'lore', 'worldview_setting', 'axiom', 'cosmology', 'universal_law'].includes(category);

    if (isRuleCategory) {
      if (boundEntities.length > 0) {
        return { isGlobal: false, scopeType: 'scoped', reason: `Rule bound to entities: [${boundEntities.join(', ')}]`, boundEntities };
      }
      if (['world_rule', 'system_rule', 'cosmology', 'universal_law', 'axiom'].includes(category)) {
        return { isGlobal: true, scopeType: 'global', reason: `Universal rule category "${category}" with no entity bindings`, boundEntities: [] };
      }
    }

    // Tier 3: Universal Core Axiom Level (canon_level >= 3)
    if (ruleRecord.canon_level >= 3 && boundEntities.length === 0) {
      return { isGlobal: true, scopeType: 'global', reason: 'Canon Level 3 (Universal Core Axiom)', boundEntities: [] };
    }

    // Tier 4: Vault Path Hierarchy Heuristics
    if (/01_.*(公理|核心|axiom|fundamental|core_rule|cosmology)/i.test(relPath) || /^(00_|01_core)/i.test(relPath)) {
      return { isGlobal: true, scopeType: 'global', reason: 'Core worldview path hierarchy', boundEntities: [] };
    }
    if (/01_.*(planets?|factions?|locations?|characters?|局部|区域)/i.test(relPath)) {
      return { isGlobal: false, scopeType: 'scoped', reason: 'Local/entity-specific worldview folder', boundEntities };
    }

    // Tier 5: Title / Keyword Heuristics
    const name = (ruleRecord.canonical_name || ruleRecord.file_name || ruleRecord.title || '').toLowerCase();
    if (/^(宇宙公理|基础物理法则|世界底层法则|universal axiom|fundamental law)/i.test(name)) {
      return { isGlobal: true, scopeType: 'global', reason: 'Universal axiom title pattern', boundEntities: [] };
    }

    // Tier 6: Default Fallback
    return {
      isGlobal: false,
      scopeType: 'scoped',
      reason: 'Standard scoped rule (defaults to scoped)',
      boundEntities
    };
  }

  /**
   * Convenience boolean check
   * @param {object} ruleRecord
   * @returns {boolean}
   */
  static isGlobal(ruleRecord) {
    return RuleClassifier.classify(ruleRecord).isGlobal;
  }
}

module.exports = RuleClassifier;
