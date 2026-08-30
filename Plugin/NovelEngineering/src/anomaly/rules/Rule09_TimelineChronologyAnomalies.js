/**
 * @file Rule09_TimelineChronologyAnomalies.js
 * @description ANOM_009: Timeline Chronology / Causality Order Anomalies (时间线年代/因果时序异常)
 * @module anomaly/rules/Rule09_TimelineChronologyAnomalies
 * @license MIT
 */

'use strict';

const RULE_ID = 'ANOM_009_TIMELINE_CHRONOLOGY_ORDER';
const SEVERITY = 'HIGH';
const CATEGORY = 'NARRATIVE_LOGIC';

/**
 * Detects timeline chronological reversals, causality prerequisite inversions, and start/end discrepancies.
 * @param {import('../../db/DatabaseManager')} dbManager
 * @param {string} [scanSessionId='default']
 * @param {object} [options={}]
 * @returns {Array<object>} Array of detected anomaly objects
 */
function detect(dbManager, scanSessionId = 'default', options = {}) {
  const db = dbManager.getDatabase();
  const anomalies = [];

  // Fetch all timeline events
  const events = db.prepare(`
    SELECT 
      te.id,
      te.event_id,
      te.title,
      te.timestamp_order,
      te.era_epoch,
      te.timeline_year,
      te.causality_prerequisite_ids_json,
      sf.relative_path
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

  // 1. Causality Prerequisite Inversion
  for (const child of events) {
    let prereqs = [];
    try {
      if (child.causality_prerequisite_ids_json) {
        const parsed = typeof child.causality_prerequisite_ids_json === 'string'
          ? JSON.parse(child.causality_prerequisite_ids_json)
          : child.causality_prerequisite_ids_json;
        if (Array.isArray(parsed)) {
          prereqs = parsed;
        } else if (typeof parsed === 'string') {
          prereqs = [parsed];
        }
      }
    } catch {}

    for (const prereqId of prereqs) {
      const pIdStr = String(prereqId).toLowerCase().trim();
      const parent = eventMap.get(pIdStr);

      if (parent) {
        if (child.timestamp_order < parent.timestamp_order) {
          const affectedFiles = [child.relative_path, parent.relative_path].filter(Boolean);

          anomalies.push({
            scan_session_id: scanSessionId,
            anomaly_rule_id: RULE_ID,
            anomaly_type: CATEGORY,
            severity: SEVERITY,
            title: `Causality timeline inversion: '${child.event_id}' precedes prerequisite '${parent.event_id}'`,
            message: `Event '${child.title}' (${child.event_id}, time: ${child.timestamp_order}) lists '${parent.title}' (${parent.event_id}, time: ${parent.timestamp_order}) as prerequisite, but occurs strictly earlier.`,
            affected_file_paths_json: affectedFiles,
            affected_entity_ids_json: [],
            details_json: {
              childEvent: {
                id: child.event_id,
                title: child.title,
                timestamp: child.timestamp_order,
                filePath: child.relative_path
              },
              prerequisiteEvent: {
                id: parent.event_id,
                title: parent.title,
                timestamp: parent.timestamp_order,
                filePath: parent.relative_path
              },
              timeDelta: parent.timestamp_order - child.timestamp_order
            },
            suggested_action: `Adjust timestamp of child event or prerequisite event, or fix the causality dependency direction.`,
            is_resolved: 0
          });
        }
      }
    }
  }

  // 2. Chapter Timeline Bounds Inversion (timeline_start > timeline_end)
  const chapters = db.prepare(`
    SELECT 
      c.id,
      c.chapter_number,
      c.volume_number,
      c.title,
      c.timeline_start,
      c.timeline_end,
      sf.relative_path
    FROM chapters c
    LEFT JOIN source_files sf ON c.source_file_id = sf.id
    WHERE c.timeline_start IS NOT NULL AND c.timeline_end IS NOT NULL
  `).all();

  for (const ch of chapters) {
    if (ch.timeline_start > ch.timeline_end) {
      anomalies.push({
        scan_session_id: scanSessionId,
        anomaly_rule_id: RULE_ID,
        anomaly_type: CATEGORY,
        severity: SEVERITY,
        title: `Chapter timeline bound inversion: '${ch.title}'`,
        message: `Chapter '${ch.title}' (Vol ${ch.volume_number}, Ch ${ch.chapter_number}) has timeline_start (${ch.timeline_start}) greater than timeline_end (${ch.timeline_end}).`,
        affected_file_paths_json: [ch.relative_path].filter(Boolean),
        affected_entity_ids_json: [],
        details_json: {
          chapterId: ch.id,
          title: ch.title,
          timelineStart: ch.timeline_start,
          timelineEnd: ch.timeline_end,
          filePath: ch.relative_path
        },
        suggested_action: `Correct the timeline start/end order in chapter metadata.`,
        is_resolved: 0
      });
    }
  }

  return anomalies;
}

module.exports = {
  id: RULE_ID,
  ruleId: RULE_ID,
  identifier: 'TIMELINE_CHRONOLOGY_ORDER',
  name: 'Timeline Chronology / Causality Order Anomalies',
  severity: SEVERITY,
  category: CATEGORY,
  detect
};
