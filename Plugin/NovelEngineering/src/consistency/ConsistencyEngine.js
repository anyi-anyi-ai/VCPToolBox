/**
 * @file ConsistencyEngine.js
 * @description Consistency Validation Engine & Multi-Dimensional Rule Orchestrator (Phase 3 Milestone 3)
 * @module consistency/ConsistencyEngine
 * @license MIT
 */

'use strict';

const AnomalyEngine = require('../anomaly/AnomalyEngine');
const { NovelError } = require('../errors');

class ConsistencyEngine {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new NovelError('DatabaseManager is required for ConsistencyEngine', 'INVALID_PARAMETER');
    }
    this.dbManager = dbManager;
    this.options = options;
    this.anomalyEngine = new AnomalyEngine(options);
  }

  /**
   * Executes multi-dimensional consistency check across entities, timelines, foreshadowing, and relations
   * @param {object} [params={}]
   * @param {string} [params.scope='all'] - 'all'|'timeline'|'foreshadowing'|'entities'|'relations'
   * @param {string} [params.severityThreshold='INFO'] - 'INFO'|'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'|'error'|'warning'
   * @param {boolean} [params.persistToReports=true] - Whether to write detected anomalies to anomaly_reports table
   * @param {Array<string|number>|string} [params.entityIds] - Optional entity business ID(s) or DB ID(s) to filter
   * @param {string} [params.category] - Optional category filter (e.g. 'NARRATIVE_LOGIC', 'PLOT_TRACKING', 'GRAPH_INTEGRITY')
   * @param {string} [params.scanSessionId] - Optional scan session identifier
   * @param {Array<string>} [params.includeRules] - Optional explicit rule IDs to execute
   * @returns {object} Full consistency validation report
   */
  checkConsistency(params = {}) {
    const scope = String(params.scope || 'all').toLowerCase().trim();
    const rawThreshold = String(params.severityThreshold || 'INFO').toUpperCase().trim();
    const persistToReports = params.persistToReports !== false;
    const scanSessionId = params.scanSessionId || `consistency_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const categoryFilter = params.category ? String(params.category).toUpperCase().trim() : null;

    // Normalize severity threshold mapping
    const severityRanks = {
      INFO: 0,
      LOW: 1,
      MEDIUM: 2,
      WARNING: 2,
      HIGH: 3,
      ERROR: 3,
      CRITICAL: 4
    };

    const minRank = severityRanks[rawThreshold] !== undefined ? severityRanks[rawThreshold] : 0;
    const displayThreshold = (rawThreshold === 'ERROR' ? 'HIGH' : (rawThreshold === 'WARNING' ? 'MEDIUM' : (rawThreshold || 'INFO')));

    // 1. Run core anomaly engine rules (run without direct persistence so we do a unified filter & insert)
    let rulesToInclude = params.includeRules;
    if (scope !== 'all') {
      if (scope === 'timeline') {
        rulesToInclude = ['ANOM_009_TIMELINE_CHRONOLOGY_ORDER', 'ANOM_009_TIMELINE_ANOMALY', 'ANOM_009', 'TIMELINE_CHRONOLOGY_ORDER'];
      } else if (scope === 'foreshadowing') {
        rulesToInclude = ['ANOM_010_FORESHADOWING_UNCLOSED_STATUS', 'ANOM_010_FORESHADOW_MISMATCH', 'ANOM_010', 'FORESHADOWING_UNCLOSED_STATUS'];
      } else if (scope === 'entities') {
        rulesToInclude = [
          'ANOM_001_SAME_NAME_DIFF_ID', 'SAME_NAME_DIFF_ID', 'ANOM_001',
          'ANOM_002_SAME_ID_MULTI_ENTITY', 'ANOM_002_SAME_ID_MULTI_ENTITIES', 'SAME_ID_MULTI_ENTITY', 'ANOM_002',
          'ANOM_005_LEGACY_DEPRECATED_ID_CONFLICT', 'ANOM_005_LEGACY_ID_CONFLICTS', 'LEGACY_DEPRECATED_ID_CONFLICT', 'ANOM_005',
          'ANOM_008_ALIAS_CROSS_COLLISION', 'ANOM_008_ALIAS_COLLISIONS', 'ALIAS_CROSS_COLLISION', 'ANOM_008'
        ];
      } else if (scope === 'relations') {
        rulesToInclude = [
          'ANOM_007_DANGLING_CROSS_REFERENCE', 'DANGLING_CROSS_REFERENCE',
          'ANOM_007_DANGLING_ENTITY_REFERENCES', 'ANOM_007_DANGLING_ENTITY_REF', 'ANOM_007'
        ];
      }
    }

    let coreAnomalies = [];
    try {
      const anomalyResult = this.anomalyEngine.runAll(this.dbManager, scanSessionId, {
        persist: false,
        includeRules: rulesToInclude
      });
      coreAnomalies = anomalyResult && Array.isArray(anomalyResult.anomalies) ? anomalyResult.anomalies : [];
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in core anomaly engine execution: ${err.message}`);
    }

    // 2. Perform deep multi-dimensional domain checks
    const customIssues = this._runAdvancedConsistencyChecks(scope, scanSessionId);

    // 3. Combine all issues
    let allIssues = [...coreAnomalies, ...customIssues];

    // 4. Optional entity ID filtering
    if (params.entityIds) {
      const targetEntityFilter = Array.isArray(params.entityIds)
        ? params.entityIds.map(e => String(e).toLowerCase().trim())
        : [String(params.entityIds).toLowerCase().trim()];

      allIssues = allIssues.filter(issue => {
        let affected = [];
        try {
          if (Array.isArray(issue.affected_entity_ids_json)) {
            affected = issue.affected_entity_ids_json;
          } else if (typeof issue.affected_entity_ids_json === 'string') {
            affected = JSON.parse(issue.affected_entity_ids_json);
          }
        } catch (_) {
          affected = [];
        }
        const affectedLower = (Array.isArray(affected) ? affected : []).map(a => String(a).toLowerCase().trim());
        return targetEntityFilter.some(t => affectedLower.includes(t));
      });
    }

    // 5. Optional category filtering
    if (categoryFilter) {
      allIssues = allIssues.filter(issue => {
        const cat = (issue.anomaly_type || issue.category || '').toUpperCase();
        return cat.includes(categoryFilter) || categoryFilter.includes(cat);
      });
    }

    // 6. Filter by severity threshold
    const filteredIssues = allIssues.filter(issue => {
      const rank = severityRanks[(issue.severity || 'MEDIUM').toUpperCase()] !== undefined
        ? severityRanks[(issue.severity || 'MEDIUM').toUpperCase()]
        : 1;
      return rank >= minRank;
    });

    // 7. Aggregate severity counts & category breakdown
    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const categoryCounts = {};

    for (const issue of filteredIssues) {
      const sev = (issue.severity || 'MEDIUM').toUpperCase();
      if (severityCounts[sev] !== undefined) {
        severityCounts[sev]++;
      } else {
        severityCounts.INFO++;
      }

      const cat = issue.anomaly_type || issue.category || 'GENERAL_CONSISTENCY';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // 8. Persist filtered issues if persistToReports is true
    if (persistToReports && filteredIssues.length > 0) {
      try {
        this.dbManager.anomalies.batchInsert(filteredIssues);
      } catch (err) {
        console.warn(`[ConsistencyEngine] Warning: Failed to persist consistency issues to anomaly_reports: ${err.message}`);
      }
    }

    return {
      scanSessionId,
      scope,
      severityThreshold: displayThreshold,
      totalIssues: filteredIssues.length,
      severityCounts,
      categoryCounts,
      anomalies: filteredIssues,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Advanced domain consistency checks:
   * - Dimension 1: Entity Attribute & Lifecycle Paradoxes
   * - Dimension 2: Timeline Chronological Causal Paradoxes & Cycles
   * - Dimension 3: Foreshadowing Lifecycle & Narrative Payoff Mismatches
   * - Dimension 4: Relational Graph Inconsistencies & Semantic Contradictions
   * @private
   * @param {string} scope
   * @param {string} scanSessionId
   * @returns {Array<object>}
   */
  _runAdvancedConsistencyChecks(scope, scanSessionId) {
    const issues = [];
    const db = this.dbManager.getDatabase();

    // =========================================================================
    // Dimension 1: Entity Attribute & Lifecycle Conflicts
    // =========================================================================
    if (scope === 'all' || scope === 'entities') {
      this._checkEntityAttributeConflicts(db, scanSessionId, issues);
      this._checkEntityLifecycleParadoxes(db, scanSessionId, issues);
    }

    // =========================================================================
    // Dimension 2: Timeline Causal Paradoxes & Sequencing Errors
    // =========================================================================
    if (scope === 'all' || scope === 'timeline') {
      this._checkTimelineCausalInversions(db, scanSessionId, issues);
      this._checkTimelineCausalCycles(db, scanSessionId, issues);
      this._checkTimelineIntervalAndChapterBounds(db, scanSessionId, issues);
      this._checkCharacterBilocation(db, scanSessionId, issues);
    }

    // =========================================================================
    // Dimension 3: Foreshadowing Lifecycle & Narrative Payoffs
    // =========================================================================
    if (scope === 'all' || scope === 'foreshadowing') {
      this._checkForeshadowingTemporalParadoxes(db, scanSessionId, issues);
      this._checkForeshadowingOverdueClues(db, scanSessionId, issues);
      this._checkForeshadowingArchivedReferences(db, scanSessionId, issues);
    }

    // =========================================================================
    // Dimension 4: Relational Inconsistencies & Graph Integrity
    // =========================================================================
    if (scope === 'all' || scope === 'relations') {
      this._checkRelationalIntegrity(db, scanSessionId, issues);
      this._checkRelationalSemanticConflicts(db, scanSessionId, issues);
    }

    return issues;
  }

  // ===========================================================================
  // Dimension 1 Check Helpers
  // ===========================================================================

  /**
   * Detects multi-definition attribute contradictions across entity definitions
   * @private
   */
  _checkEntityAttributeConflicts(db, scanSessionId, issues) {
    try {
      const rows = db.prepare(`
        SELECT e.id, e.entity_id, e.canonical_name, e.entity_type, e.status, e.canon_level,
               e.attributes_json, sf.relative_path
        FROM entities e
        LEFT JOIN source_files sf ON e.source_file_id = sf.id
        WHERE e.status NOT IN ('deleted', 'deprecated') AND e.attributes_json IS NOT NULL
      `).all();

      // Group by canonical entity_id
      const groupMap = new Map();
      for (const r of rows) {
        const eCode = String(r.entity_id || '').trim();
        if (!eCode) continue;
        if (!groupMap.has(eCode)) groupMap.set(eCode, []);
        groupMap.get(eCode).push(r);
      }

      for (const [entityCode, entityRows] of groupMap.entries()) {
        if (entityRows.length < 2) continue;

        // Compare attributes pairwise
        for (let i = 0; i < entityRows.length; i++) {
          for (let j = i + 1; j < entityRows.length; j++) {
            const e1 = entityRows[i];
            const e2 = entityRows[j];

            let attr1 = {};
            let attr2 = {};
            try { attr1 = typeof e1.attributes_json === 'string' ? JSON.parse(e1.attributes_json) : (e1.attributes_json || {}); } catch (_) {}
            try { attr2 = typeof e2.attributes_json === 'string' ? JSON.parse(e2.attributes_json) : (e2.attributes_json || {}); } catch (_) {}

            const conflictingKeys = [];
            const compareKeys = ['faction', 'affiliation', 'species', 'gender', 'power_rank', 'realm', 'origin_world', 'homeworld', 'status'];

            for (const key of compareKeys) {
              if (attr1[key] !== undefined && attr2[key] !== undefined) {
                const val1 = String(attr1[key]).trim().toLowerCase();
                const val2 = String(attr2[key]).trim().toLowerCase();
                if (val1 && val2 && val1 !== val2) {
                  conflictingKeys.push({ key, val1: attr1[key], val2: attr2[key] });
                }
              }
            }

            if (conflictingKeys.length > 0) {
              const sameCanon = e1.canon_level === e2.canon_level;
              const severity = sameCanon ? (e1.canon_level >= 2 ? 'CRITICAL' : 'HIGH') : 'MEDIUM';
              const affectedFiles = [e1.relative_path, e2.relative_path].filter(Boolean);

              issues.push({
                scan_session_id: scanSessionId,
                anomaly_rule_id: 'CONSIST_ENTITY_ATTRIBUTE_CONFLICT',
                rule_name: 'Conflicting Entity Attributes Across Definitions',
                anomaly_type: 'ENTITY_CONFLICT',
                severity,
                title: `Attribute conflict in entity '${entityCode}' (${conflictingKeys.map(k => k.key).join(', ')})`,
                message: `Entity '${entityCode}' has conflicting attributes between ${e1.relative_path || `record #${e1.id}`} and ${e2.relative_path || `record #${e2.id}`}: ${conflictingKeys.map(c => `${c.key} ("${c.val1}" vs "${c.val2}")`).join('; ')}.`,
                affected_file_paths_json: JSON.stringify(affectedFiles),
                affected_entity_ids_json: JSON.stringify([entityCode]),
                details_json: JSON.stringify({ entityCode, conflictingKeys, definition1: e1, definition2: e2 }),
                suggested_action: sameCanon
                  ? 'Reconcile contradictory canonical attribute definitions to maintain worldbuilding consistency.'
                  : 'Update lower canon draft attribute to match established canonical value.',
                is_resolved: 0
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in entity attribute check: ${err.message}`);
    }
  }

  /**
   * Detects post-mortem or post-archival timeline actions by deceased entities
   * @private
   */
  _checkEntityLifecycleParadoxes(db, scanSessionId, issues) {
    try {
      const deadEntities = db.prepare(`
        SELECT id, entity_id, canonical_name, status, attributes_json
        FROM entities
        WHERE status IN ('archived', 'deceased')
      `).all();

      for (const ent of deadEntities) {
        let deathTimestamp = null;
        try {
          const attrs = typeof ent.attributes_json === 'string' ? JSON.parse(ent.attributes_json) : (ent.attributes_json || {});
          if (attrs && (attrs.death_time !== undefined || attrs.death_timestamp !== undefined)) {
            deathTimestamp = Number(attrs.death_time || attrs.death_timestamp);
          }
        } catch (_) {}

        if (deathTimestamp !== null && !isNaN(deathTimestamp)) {
          const postMortemEvents = db.prepare(`
            SELECT te.id, te.event_id, te.title, te.timestamp_order, sf.relative_path
            FROM timeline_events te
            LEFT JOIN source_files sf ON te.source_file_id = sf.id
            WHERE te.primary_entity_id = ? AND te.timestamp_order > ? AND te.status != 'discarded'
          `).all(ent.id, deathTimestamp);

          for (const evt of postMortemEvents) {
            issues.push({
              scan_session_id: scanSessionId,
              anomaly_rule_id: 'CONSIST_ENTITY_LIFECYCLE_PARADOX',
              rule_name: 'Post-Mortem Timeline Activity Paradox',
              anomaly_type: 'ENTITY_CONFLICT',
              severity: 'CRITICAL',
              title: `Post-mortem event for entity '${ent.entity_id}' (${evt.event_id})`,
              message: `Deceased entity '${ent.canonical_name}' (${ent.entity_id}, died at t=${deathTimestamp}) is listed as primary actor in event '${evt.title}' (${evt.event_id}, t=${evt.timestamp_order}).`,
              affected_file_paths_json: JSON.stringify([evt.relative_path].filter(Boolean)),
              affected_entity_ids_json: JSON.stringify([ent.entity_id]),
              details_json: JSON.stringify({ entity: ent, deathTimestamp, event: evt }),
              suggested_action: 'Flag event as flashback/memory or adjust timeline timestamp order.',
              is_resolved: 0
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in lifecycle paradox check: ${err.message}`);
    }
  }

  // ===========================================================================
  // Dimension 2 Check Helpers
  // ===========================================================================

  /**
   * Detects relative anchor time offset inversions
   * Supports both standard schema (base_event_id, relative_offset) and prototype columns (relative_to_event_id, relative_offset_seconds)
   * @private
   */
  _checkTimelineCausalInversions(db, scanSessionId, issues) {
    try {
      // Query timeline events with either standard or prototype columns safely
      const events = db.prepare(`
        SELECT te.*, sf.relative_path
        FROM timeline_events te
        LEFT JOIN source_files sf ON te.source_file_id = sf.id
        WHERE te.status != 'discarded'
      `).all();

      const eventMap = new Map();
      for (const ev of events) {
        if (ev.event_id) {
          eventMap.set(ev.event_id.toLowerCase().trim(), ev);
        }
      }

      for (const evt of events) {
        // Resolve anchor ID
        const baseId = evt.base_event_id || evt.relative_to_event_id || null;
        if (!baseId) continue;

        // Resolve offset
        let offset = null;
        if (evt.relative_offset !== null && evt.relative_offset !== undefined) {
          offset = Number(evt.relative_offset);
        } else if (evt.relative_offset_seconds !== null && evt.relative_offset_seconds !== undefined) {
          offset = Number(evt.relative_offset_seconds);
        }

        if (offset === null || isNaN(offset)) continue;

        const baseEvt = eventMap.get(String(baseId).toLowerCase().trim());
        if (!baseEvt) {
          // Dangling anchor
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_TIMELINE_DANGLING_ANCHOR',
            rule_name: 'Relative Timeline Event Anchored to Missing Event',
            anomaly_type: 'CAUSAL_PARADOX',
            severity: 'HIGH',
            title: `Timeline event '${evt.event_id}' has missing base event '${baseId}'`,
            message: `Event "${evt.title}" (${evt.event_id}) defines relative offset from base_event_id "${baseId}" which does not exist in timeline.`,
            affected_file_paths_json: JSON.stringify([evt.relative_path].filter(Boolean)),
            affected_entity_ids_json: JSON.stringify(evt.primary_entity_id ? [String(evt.primary_entity_id)] : []),
            details_json: JSON.stringify({ evt, missingBaseEventId: baseId }),
            suggested_action: 'Ensure base event exists or remove relative anchor.',
            is_resolved: 0
          });
          continue;
        }

        // Check if positive offset has earlier timestamp_order or negative offset has later timestamp_order
        const isInverted = (offset > 0 && evt.timestamp_order < baseEvt.timestamp_order) ||
                           (offset < 0 && evt.timestamp_order > baseEvt.timestamp_order);

        if (isInverted) {
          const affectedFiles = [evt.relative_path, baseEvt.relative_path].filter(Boolean);
          const affectedEntities = [];
          if (evt.primary_entity_id) affectedEntities.push(String(evt.primary_entity_id));
          if (baseEvt.primary_entity_id) affectedEntities.push(String(baseEvt.primary_entity_id));

          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_001_CAUSAL_PARADOX',
            rule_name: 'Timeline Causal Inversion Paradox',
            anomaly_type: 'CAUSAL_PARADOX',
            severity: 'CRITICAL',
            title: `Causal paradox between ${evt.event_id} and ${baseEvt.event_id}`,
            message: `Event "${evt.title}" (${evt.event_id}) has ${offset > 0 ? 'positive' : 'negative'} relative offset (${offset}) but ${offset > 0 ? 'earlier' : 'later'} timestamp_order (${evt.timestamp_order}) than parent "${baseEvt.title}" (${baseEvt.timestamp_order}).`,
            affected_file_paths_json: JSON.stringify(affectedFiles),
            affected_entity_ids_json: JSON.stringify(Array.from(new Set(affectedEntities))),
            details_json: JSON.stringify({
              childEvent: { eventId: evt.event_id, title: evt.title, timestampOrder: evt.timestamp_order },
              baseEvent: { eventId: baseEvt.event_id, title: baseEvt.title, timestampOrder: baseEvt.timestamp_order },
              relativeOffset: offset
            }),
            suggested_action: 'Adjust event timestamp_order to reflect chronological order after base event.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in timeline causal inversion check: ${err.message}`);
    }
  }

  /**
   * Detects circular causal prerequisite cycles via 3-color DFS
   * @private
   */
  _checkTimelineCausalCycles(db, scanSessionId, issues) {
    try {
      const events = db.prepare(`
        SELECT event_id, title, causality_prerequisite_ids_json
        FROM timeline_events
        WHERE status != 'discarded' AND causality_prerequisite_ids_json IS NOT NULL
      `).all();

      const adj = new Map();
      const titleMap = new Map();

      for (const ev of events) {
        const id = ev.event_id.toLowerCase().trim();
        titleMap.set(id, ev.title);
        if (!adj.has(id)) adj.set(id, []);

        let prereqs = [];
        try {
          const parsed = typeof ev.causality_prerequisite_ids_json === 'string'
            ? JSON.parse(ev.causality_prerequisite_ids_json)
            : ev.causality_prerequisite_ids_json;
          if (Array.isArray(parsed)) prereqs = parsed;
          else if (typeof parsed === 'string') prereqs = [parsed];
        } catch (_) {}

        for (const p of prereqs) {
          const pId = String(p).toLowerCase().trim();
          // Edge: pId -> id (pId causes id)
          if (!adj.has(pId)) adj.set(pId, []);
          adj.get(pId).push(id);
        }
      }

      // DFS 3-color: 0 = unvisited, 1 = visiting (in stack), 2 = visited
      const state = new Map();
      const parentMap = new Map();
      const detectedCycles = [];

      const dfs = (u) => {
        state.set(u, 1);
        const neighbors = adj.get(u) || [];

        for (const v of neighbors) {
          const vState = state.get(v) || 0;
          if (vState === 1) {
            // Cycle found: reconstruct path u back to v
            const cyclePath = [v, u];
            let curr = u;
            while (curr && parentMap.get(curr) && parentMap.get(curr) !== v && cyclePath.length < 20) {
              curr = parentMap.get(curr);
              cyclePath.push(curr);
            }
            cyclePath.reverse();
            detectedCycles.push(cyclePath);
          } else if (vState === 0) {
            parentMap.set(v, u);
            dfs(v);
          }
        }
        state.set(u, 2);
      };

      for (const node of adj.keys()) {
        if ((state.get(node) || 0) === 0) {
          dfs(node);
        }
      }

      for (const cycle of detectedCycles.slice(0, 5)) {
        const displayPath = cycle.map(id => id.toUpperCase()).join(' ➔ ');
        issues.push({
          scan_session_id: scanSessionId,
          anomaly_rule_id: 'CONSIST_TIMELINE_CAUSAL_CYCLE',
          rule_name: 'Timeline Causal Dependency Loop',
          anomaly_type: 'CAUSAL_PARADOX',
          severity: 'CRITICAL',
          title: `Causal dependency cycle detected: ${displayPath}`,
          message: `Timeline events form an impossible causal loop where events circularly prerequisite one another: ${displayPath}.`,
          affected_file_paths_json: '[]',
          affected_entity_ids_json: '[]',
          details_json: JSON.stringify({ cycle }),
          suggested_action: 'Break the causal loop by removing circular prerequisite links.',
          is_resolved: 0
        });
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in timeline causal cycle check: ${err.message}`);
    }
  }

  /**
   * Interval bounds and chapter timeline start/end validation
   * @private
   */
  _checkTimelineIntervalAndChapterBounds(db, scanSessionId, issues) {
    try {
      // 1. Interval start > interval end in timeline_events
      const intervalEvents = db.prepare(`
        SELECT te.id, te.event_id, te.title, te.interval_start, te.interval_end, sf.relative_path
        FROM timeline_events te
        LEFT JOIN source_files sf ON te.source_file_id = sf.id
        WHERE te.time_type = 'interval' AND te.interval_start IS NOT NULL AND te.interval_end IS NOT NULL
      `).all();

      for (const ev of intervalEvents) {
        if (Number(ev.interval_start) > Number(ev.interval_end)) {
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_TIMELINE_INTERVAL_INVERSION',
            rule_name: 'Timeline Event Interval Inversion',
            anomaly_type: 'CAUSAL_PARADOX',
            severity: 'HIGH',
            title: `Event '${ev.event_id}' interval_start > interval_end`,
            message: `Event "${ev.title}" (${ev.event_id}) has interval_start (${ev.interval_start}) greater than interval_end (${ev.interval_end}).`,
            affected_file_paths_json: JSON.stringify([ev.relative_path].filter(Boolean)),
            affected_entity_ids_json: '[]',
            details_json: JSON.stringify(ev),
            suggested_action: 'Swap or correct interval start and end timestamps.',
            is_resolved: 0
          });
        }
      }

      // 2. Chapter timeline_start > timeline_end
      const chapters = db.prepare(`
        SELECT c.id, c.chapter_number, c.volume_number, c.title, c.timeline_start, c.timeline_end, sf.relative_path
        FROM chapters c
        LEFT JOIN source_files sf ON c.source_file_id = sf.id
        WHERE c.timeline_start IS NOT NULL AND c.timeline_end IS NOT NULL
      `).all();

      for (const ch of chapters) {
        if (Number(ch.timeline_start) > Number(ch.timeline_end)) {
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_CHAPTER_TIMELINE_INVERSION',
            rule_name: 'Chapter Timeline Bound Inversion',
            anomaly_type: 'CAUSAL_PARADOX',
            severity: 'HIGH',
            title: `Chapter '${ch.title}' timeline_start > timeline_end`,
            message: `Chapter "${ch.title}" (Vol ${ch.volume_number}, Ch ${ch.chapter_number}) has timeline_start (${ch.timeline_start}) greater than timeline_end (${ch.timeline_end}).`,
            affected_file_paths_json: JSON.stringify([ch.relative_path].filter(Boolean)),
            affected_entity_ids_json: '[]',
            details_json: JSON.stringify(ch),
            suggested_action: 'Correct the chronological start/end interval in chapter metadata.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in interval/chapter bounds check: ${err.message}`);
    }
  }

  /**
   * Character bilocation check (same primary entity at same timestamp in conflicting narrative events)
   * @private
   */
  _checkCharacterBilocation(db, scanSessionId, issues) {
    try {
      const rows = db.prepare(`
        SELECT te.id, te.event_id, te.title, te.timestamp_order, te.primary_entity_id, e.entity_id AS entity_code, e.canonical_name, sf.relative_path
        FROM timeline_events te
        JOIN entities e ON te.primary_entity_id = e.id
        LEFT JOIN source_files sf ON te.source_file_id = sf.id
        WHERE te.primary_entity_id IS NOT NULL AND te.status != 'discarded'
        ORDER BY te.primary_entity_id, te.timestamp_order
      `).all();

      for (let i = 0; i < rows.length - 1; i++) {
        const e1 = rows[i];
        const e2 = rows[i + 1];

        if (e1.primary_entity_id === e2.primary_entity_id && e1.timestamp_order === e2.timestamp_order && e1.event_id !== e2.event_id) {
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_TIMELINE_BILOCATION_PARADOX',
            rule_name: 'Character Bilocation / Concurrency Paradox',
            anomaly_type: 'CAUSAL_PARADOX',
            severity: 'HIGH',
            title: `Character bilocation for '${e1.canonical_name}' at t=${e1.timestamp_order}`,
            message: `Entity '${e1.canonical_name}' (${e1.entity_code}) is registered as the primary actor for two simultaneous distinct events at t=${e1.timestamp_order}: '${e1.title}' (${e1.event_id}) and '${e2.title}' (${e2.event_id}).`,
            affected_file_paths_json: JSON.stringify([e1.relative_path, e2.relative_path].filter(Boolean)),
            affected_entity_ids_json: JSON.stringify([e1.entity_code]),
            details_json: JSON.stringify({ event1: e1, event2: e2 }),
            suggested_action: 'Differentiate exact timestamp ordering or note narrative parallel POV.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in bilocation check: ${err.message}`);
    }
  }

  // ===========================================================================
  // Dimension 3 Check Helpers
  // ===========================================================================

  /**
   * Foreshadowing resolution before setup temporal paradox
   * Supports standard schema (setup_chapter_id, resolution_chapter_id, introduced_chapter, target_resolve_chapter, actual_resolve_chapter)
   * and prototype columns (setup_chapter, resolve_chapter)
   * @private
   */
  _checkForeshadowingTemporalParadoxes(db, scanSessionId, issues) {
    try {
      const rows = db.prepare(`
        SELECT f.*, sf_setup.relative_path AS setup_file_path, sf_res.relative_path AS res_file_path
        FROM foreshadowing f
        LEFT JOIN source_files sf_setup ON f.setup_file_id = sf_setup.id
        LEFT JOIN source_files sf_res ON f.resolution_file_id = sf_res.id
      `).all();

      for (const f of rows) {
        // Resolve setup chapter index
        let setupIndex = null;
        if (f.setup_chapter !== null && f.setup_chapter !== undefined && !isNaN(Number(f.setup_chapter))) {
          setupIndex = Number(f.setup_chapter);
        } else if (f.setup_chapter_id !== null && f.setup_chapter_id !== undefined && !isNaN(Number(f.setup_chapter_id))) {
          setupIndex = Number(f.setup_chapter_id);
        } else if (f.introduced_chapter !== null && f.introduced_chapter !== undefined && !isNaN(Number(f.introduced_chapter))) {
          setupIndex = Number(f.introduced_chapter);
        }

        // Resolve resolution chapter index
        let resolveIndex = null;
        if (f.resolve_chapter !== null && f.resolve_chapter !== undefined && !isNaN(Number(f.resolve_chapter))) {
          resolveIndex = Number(f.resolve_chapter);
        } else if (f.resolution_chapter_id !== null && f.resolution_chapter_id !== undefined && !isNaN(Number(f.resolution_chapter_id))) {
          resolveIndex = Number(f.resolution_chapter_id);
        } else if (f.actual_resolve_chapter !== null && f.actual_resolve_chapter !== undefined && !isNaN(Number(f.actual_resolve_chapter))) {
          resolveIndex = Number(f.actual_resolve_chapter);
        } else if (f.target_resolve_chapter !== null && f.target_resolve_chapter !== undefined && !isNaN(Number(f.target_resolve_chapter))) {
          resolveIndex = Number(f.target_resolve_chapter);
        }

        if (setupIndex !== null && resolveIndex !== null && resolveIndex < setupIndex) {
          const affectedFiles = [f.setup_file_path, f.res_file_path].filter(Boolean);
          let relatedEntities = [];
          try {
            relatedEntities = typeof f.related_entities_json === 'string'
              ? JSON.parse(f.related_entities_json)
              : (f.related_entities_json || []);
          } catch (_) {}

          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_002_FORESHADOW_TEMPORAL_PARADOX',
            rule_name: 'Foreshadowing Resolved Before Setup Paradox',
            anomaly_type: 'FORESHADOW_MISMATCH',
            severity: 'HIGH',
            title: `Foreshadowing ${f.foreshadow_id} resolved before setup`,
            message: `Foreshadowing "${f.title}" (${f.foreshadow_id}) has resolve_chapter (${resolveIndex}) prior to setup_chapter (${setupIndex}).`,
            affected_file_paths_json: JSON.stringify(affectedFiles),
            affected_entity_ids_json: JSON.stringify(Array.isArray(relatedEntities) ? relatedEntities : []),
            details_json: JSON.stringify({ foreshadowId: f.foreshadow_id, setupChapter: setupIndex, resolveChapter: resolveIndex }),
            suggested_action: 'Fix resolution chapter number to occur chronologically after setup chapter.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in foreshadowing temporal paradox check: ${err.message}`);
    }
  }

  /**
   * Detects overdue major/core_climax foreshadowing clues
   * @private
   */
  _checkForeshadowingOverdueClues(db, scanSessionId, issues) {
    try {
      const maxChapRow = db.prepare(`
        SELECT MAX(chapter_number) AS max_chapter
        FROM chapters
        WHERE status != 'draft'
      `).get();

      const maxChapter = maxChapRow && maxChapRow.max_chapter !== null ? Number(maxChapRow.max_chapter) : null;
      if (maxChapter === null || isNaN(maxChapter)) return;

      const openHooks = db.prepare(`
        SELECT f.*, sf.relative_path
        FROM foreshadowing f
        LEFT JOIN source_files sf ON f.setup_file_id = sf.id
        WHERE f.status = 'open' AND f.target_resolve_chapter IS NOT NULL
      `).all();

      for (const hook of openHooks) {
        const targetChap = Number(hook.target_resolve_chapter);
        if (!isNaN(targetChap) && maxChapter > targetChap + 2) {
          const isCoreClimax = (hook.importance_level || '').toLowerCase() === 'core_climax';
          const severity = isCoreClimax ? 'HIGH' : 'MEDIUM';

          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_FORESHADOW_OVERDUE',
            rule_name: 'Overdue Foreshadowing Clue Past Planned Target',
            anomaly_type: 'FORESHADOW_MISMATCH',
            severity,
            title: `Overdue foreshadowing thread '${hook.foreshadow_id}' (target Ch-${targetChap}, current Ch-${maxChapter})`,
            message: `Open plot clue "${hook.title}" (${hook.foreshadow_id}, importance: ${hook.importance_level}) was scheduled for payoff by chapter ${targetChap}, but narrative is at chapter ${maxChapter}.`,
            affected_file_paths_json: JSON.stringify([hook.relative_path].filter(Boolean)),
            affected_entity_ids_json: hook.related_entities_json || '[]',
            details_json: JSON.stringify({ hook, maxCompletedChapter: maxChapter }),
            suggested_action: 'Pay off the foreshadowing clue in upcoming chapters or update target_resolve_chapter.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in overdue foreshadowing check: ${err.message}`);
    }
  }

  /**
   * Open foreshadowing referencing archived or deleted entities
   * @private
   */
  _checkForeshadowingArchivedReferences(db, scanSessionId, issues) {
    try {
      const openHooks = db.prepare(`
        SELECT f.id, f.foreshadow_id, f.title, f.related_entities_json, sf.relative_path
        FROM foreshadowing f
        LEFT JOIN source_files sf ON f.setup_file_id = sf.id
        WHERE f.status = 'open' AND f.related_entities_json IS NOT NULL
      `).all();

      for (const hook of openHooks) {
        let entityRefs = [];
        try {
          entityRefs = typeof hook.related_entities_json === 'string'
            ? JSON.parse(hook.related_entities_json)
            : (hook.related_entities_json || []);
        } catch (_) {}

        if (!Array.isArray(entityRefs)) continue;

        for (const ref of entityRefs) {
          const refStr = String(ref).trim();
          if (!refStr) continue;

          const ent = db.prepare(`
            SELECT id, entity_id, canonical_name, status
            FROM entities
            WHERE entity_id = ? OR id = ?
          `).get(refStr, Number(refStr) || -1);

          if (ent && (ent.status === 'archived' || ent.status === 'deleted' || ent.status === 'deprecated')) {
            issues.push({
              scan_session_id: scanSessionId,
              anomaly_rule_id: 'CONSIST_003_FORESHADOW_ARCHIVED_ENTITY',
              rule_name: 'Active Foreshadowing Relies on Archived Entity',
              anomaly_type: 'FORESHADOW_MISMATCH',
              severity: 'MEDIUM',
              title: `Active foreshadowing ${hook.foreshadow_id} references archived entity ${ent.entity_id}`,
              message: `Open foreshadowing "${hook.title}" references entity "${ent.entity_id}" which has status "${ent.status}".`,
              affected_file_paths_json: JSON.stringify([hook.relative_path].filter(Boolean)),
              affected_entity_ids_json: JSON.stringify([ent.entity_id]),
              details_json: JSON.stringify({ foreshadowId: hook.foreshadow_id, entity: ent }),
              suggested_action: 'Update foreshadowing reference to active replacement entity or close thread.',
              is_resolved: 0
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in foreshadowing archived reference check: ${err.message}`);
    }
  }

  // ===========================================================================
  // Dimension 4 Check Helpers
  // ===========================================================================

  /**
   * Relational integrity: dangling endpoints and relations to archived entities
   * @private
   */
  _checkRelationalIntegrity(db, scanSessionId, issues) {
    try {
      const relations = db.prepare(`
        SELECT er.id, er.relation_type, er.source_entity_id, er.target_entity_id,
               se.entity_id AS s_code, se.status AS s_status,
               te.entity_id AS t_code, te.status AS t_status,
               sf.relative_path
        FROM entity_relations er
        LEFT JOIN entities se ON er.source_entity_id = se.id
        LEFT JOIN entities te ON er.target_entity_id = te.id
        LEFT JOIN source_files sf ON er.source_file_id = sf.id
      `).all();

      for (const rel of relations) {
        if (!rel.s_code || !rel.t_code) {
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_004_DANGLING_RELATION_RECORD',
            rule_name: 'Entity Relation References Non-Existent Entity DB ID',
            anomaly_type: 'GRAPH_INTEGRITY',
            severity: 'CRITICAL',
            title: `Dangling relation #${rel.id} (${rel.relation_type})`,
            message: `Relation #${rel.id} references source_entity_id=${rel.source_entity_id} (${rel.s_code || 'MISSING'}) -> target_entity_id=${rel.target_entity_id} (${rel.t_code || 'MISSING'}).`,
            affected_file_paths_json: JSON.stringify([rel.relative_path].filter(Boolean)),
            affected_entity_ids_json: JSON.stringify([rel.s_code, rel.t_code].filter(Boolean)),
            details_json: JSON.stringify(rel),
            suggested_action: 'Delete orphan relation record or re-bind to valid entity DB ID.',
            is_resolved: 0
          });
        } else if (rel.s_status === 'archived' || rel.s_status === 'deprecated' || rel.t_status === 'archived' || rel.t_status === 'deprecated') {
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_005_RELATION_ARCHIVED_ENDPOINT',
            rule_name: 'Active Relation Links Archived Entity',
            anomaly_type: 'GRAPH_INTEGRITY',
            severity: 'LOW',
            title: `Relation #${rel.id} links archived entity`,
            message: `Relation "${rel.relation_type}" links ${rel.s_code} (${rel.s_status}) to ${rel.t_code} (${rel.t_status}).`,
            affected_file_paths_json: JSON.stringify([rel.relative_path].filter(Boolean)),
            affected_entity_ids_json: JSON.stringify([rel.s_code, rel.t_code]),
            details_json: JSON.stringify(rel),
            suggested_action: 'Prune inactive relation or archive relation record.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in relational integrity check: ${err.message}`);
    }
  }

  /**
   * Semantic conflicts between relation pairs (e.g. ally_of AND hostile_to, genealogical cycles, self-references)
   * @private
   */
  _checkRelationalSemanticConflicts(db, scanSessionId, issues) {
    try {
      const relations = db.prepare(`
        SELECT er.id, er.source_entity_id, er.target_entity_id, er.relation_type,
               se.entity_id AS s_code, te.entity_id AS t_code
        FROM entity_relations er
        JOIN entities se ON er.source_entity_id = se.id
        JOIN entities te ON er.target_entity_id = te.id
      `).all();

      // 1. Self-reference check
      for (const rel of relations) {
        if (rel.source_entity_id === rel.target_entity_id) {
          const invalidSelfTypes = ['parent_of', 'opposes', 'hostile_to', 'subordinate_to', 'child_of', 'controls'];
          if (invalidSelfTypes.includes(rel.relation_type)) {
            issues.push({
              scan_session_id: scanSessionId,
              anomaly_rule_id: 'CONSIST_RELATION_INVALID_SELF',
              rule_name: 'Invalid Self-Referential Relation',
              anomaly_type: 'GRAPH_INTEGRITY',
              severity: 'HIGH',
              title: `Invalid self-referential '${rel.relation_type}' on entity '${rel.s_code}'`,
              message: `Entity '${rel.s_code}' has invalid reflexive relation '${rel.relation_type}' with itself.`,
              affected_file_paths_json: '[]',
              affected_entity_ids_json: JSON.stringify([rel.s_code]),
              details_json: JSON.stringify(rel),
              suggested_action: 'Remove impossible self-relation.',
              is_resolved: 0
            });
          }
        }
      }

      // Group by unordered entity pair for contradictory types
      const pairMap = new Map();
      for (const rel of relations) {
        const key = [rel.source_entity_id, rel.target_entity_id].sort((a, b) => a - b).join('_');
        if (!pairMap.has(key)) pairMap.set(key, []);
        pairMap.get(key).push(rel);
      }

      for (const rels of pairMap.values()) {
        if (rels.length < 2) continue;

        const types = rels.map(r => r.relation_type);
        const hasAlly = types.includes('ally_of');
        const hasHostile = types.includes('hostile_to') || types.includes('opposes');

        if (hasAlly && hasHostile) {
          const r1 = rels[0];
          issues.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: 'CONSIST_RELATION_SEMANTIC_CONFLICT',
            rule_name: 'Contradictory Semantic Relations Between Entities',
            anomaly_type: 'GRAPH_INTEGRITY',
            severity: 'HIGH',
            title: `Contradictory relations between '${r1.s_code}' and '${r1.t_code}' (ally vs hostile)`,
            message: `Entities '${r1.s_code}' and '${r1.t_code}' have mutually contradictory relation types: [${types.join(', ')}].`,
            affected_file_paths_json: '[]',
            affected_entity_ids_json: JSON.stringify([r1.s_code, r1.t_code]),
            details_json: JSON.stringify({ relations: rels }),
            suggested_action: 'Resolve relation conflict by setting dynamic timeline conditions or removing contradictory edge.',
            is_resolved: 0
          });
        }
      }
    } catch (err) {
      console.warn(`[ConsistencyEngine] Warning in relational semantic conflicts check: ${err.message}`);
    }
  }
}

module.exports = ConsistencyEngine;
