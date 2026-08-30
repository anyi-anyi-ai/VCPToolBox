/**
 * @file AnomalyEngine.js
 * @description Central Orchestrator and Registry for the 10 Anomaly & Conflict Detection Rules
 * @module anomaly/AnomalyEngine
 * @license MIT
 */

'use strict';

const Rule01 = require('./rules/Rule01_SameNameDiffId');
const Rule02 = require('./rules/Rule02_SameIdMultiEntities');
const Rule03 = require('./rules/Rule03_HistoryVersionSimilarity');
const Rule04 = require('./rules/Rule04_PlaceholderFiles');
const Rule05 = require('./rules/Rule05_LegacyIdConflicts');
const Rule06 = require('./rules/Rule06_AiGeneratedMixedData');
const Rule07 = require('./rules/Rule07_DanglingEntityReferences');
const Rule08 = require('./rules/Rule08_AliasCollisions');
const Rule09 = require('./rules/Rule09_TimelineChronologyAnomalies');
const Rule10 = require('./rules/Rule10_ForeshadowingUnclosedMismatch');

class AnomalyEngine {
  /**
   * @param {object} [options={}]
   */
  constructor(options = {}) {
    this.options = options;
    this.rules = new Map();

    // Register built-in rules (ANOM_001 .. ANOM_010)
    this.registerRule(Rule01);
    this.registerRule(Rule02);
    this.registerRule(Rule03);
    this.registerRule(Rule04);
    this.registerRule(Rule05);
    this.registerRule(Rule06);
    this.registerRule(Rule07);
    this.registerRule(Rule08);
    this.registerRule(Rule09);
    this.registerRule(Rule10);
  }

  /**
   * Registers a rule definition module
   * @param {object} rule
   */
  registerRule(rule) {
    if (!rule || (!rule.id && !rule.ruleId)) {
      throw new Error('Invalid rule module: must export id or ruleId.');
    }
    const ruleId = rule.id || rule.ruleId;
    this.rules.set(ruleId, rule);
    if (rule.identifier) {
      this.rules.set(rule.identifier, rule);
    }
  }

  /**
   * Returns list of all registered rule definitions
   * @returns {Array<object>}
   */
  getRegisteredRules() {
    const unique = new Map();
    for (const rule of this.rules.values()) {
      const id = rule.id || rule.ruleId;
      if (!unique.has(id)) {
        unique.set(id, {
          id: rule.id || rule.ruleId,
          identifier: rule.identifier,
          name: rule.name,
          severity: rule.severity,
          category: rule.category
        });
      }
    }
    return Array.from(unique.values());
  }

  /**
   * Executes a single rule by ID
   * @param {string} ruleId
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {string} [scanSessionId='default']
   * @param {object} [options={}]
   * @returns {Array<object>}
   */
  runRule(ruleId, dbManager, scanSessionId = 'default', options = {}) {
    const rule = this.rules.get(ruleId);
    if (!rule || typeof rule.detect !== 'function') {
      throw new Error(`Anomaly rule not found or invalid: "${ruleId}"`);
    }
    return rule.detect(dbManager, scanSessionId, options);
  }

  /**
   * Runs all 10 anomaly rules, optionally persists to database, and computes breakdown
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {string} [scanSessionId='default']
   * @param {object} [options={}]
   * @param {boolean} [options.persist=true] - Whether to insert detected anomalies into SQLite
   * @param {Array<string>} [options.includeRules] - Optional list of rule IDs to run
   * @returns {object} Execution summary and array of anomalies
   */
  runAll(dbManager, scanSessionId = 'default', options = {}) {
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required to run AnomalyEngine.');
    }

    const startTime = Date.now();
    const allAnomalies = [];
    const breakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };

    const registeredList = this.getRegisteredRules();
    const rulesToRun = options.includeRules && Array.isArray(options.includeRules)
      ? registeredList.filter(r => options.includeRules.includes(r.id) || options.includeRules.includes(r.identifier))
      : registeredList;

    for (const ruleMeta of rulesToRun) {
      const rule = this.rules.get(ruleMeta.id);
      if (rule && typeof rule.detect === 'function') {
        try {
          const ruleResults = rule.detect(dbManager, scanSessionId, options);
          if (Array.isArray(ruleResults)) {
            for (const anom of ruleResults) {
              allAnomalies.push(anom);
              const sev = (anom.severity || 'MEDIUM').toUpperCase();
              if (breakdown[sev] !== undefined) {
                breakdown[sev]++;
              } else {
                breakdown.INFO++;
              }
            }
          }
        } catch (ruleErr) {
          console.error(`[AnomalyEngine] Error executing rule ${ruleMeta.id}:`, ruleErr);
        }
      }
    }

    // Persist anomalies into SQLite if persist !== false
    if (options.persist !== false && allAnomalies.length > 0) {
      try {
        dbManager.anomalies.batchInsert(allAnomalies);
      } catch (dbErr) {
        console.error('[AnomalyEngine] Error persisting anomalies to database:', dbErr);
      }
    }

    // Update scan manifest anomaly count if manifest exists
    if (scanSessionId && scanSessionId !== 'default') {
      try {
        dbManager.anomalies.updateManifest(scanSessionId, {
          total_anomalies_detected: allAnomalies.length
        });
      } catch (manifestErr) {
        // Non-critical if manifest not yet saved
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      scanSessionId,
      totalAnomalies: allAnomalies.length,
      breakdown,
      durationMs,
      anomalies: allAnomalies
    };
  }

  /**
   * Static convenience runner
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {string} [scanSessionId='default']
   * @param {object} [options={}]
   * @returns {object}
   */
  static runAll(dbManager, scanSessionId = 'default', options = {}) {
    const engine = new AnomalyEngine(options);
    return engine.runAll(dbManager, scanSessionId, options);
  }
}

module.exports = AnomalyEngine;
