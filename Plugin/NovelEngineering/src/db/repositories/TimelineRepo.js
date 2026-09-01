/**
 * @file TimelineRepo.js
 * @description Typed CRUD repository for timeline_events table with multi-modal time point support
 * @module db/repositories/TimelineRepo
 */

'use strict';

class TimelineRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for TimelineRepo');
    }
    this.db = db;
  }

  /**
   * Normalize timeline record for SQL binding
   * @private
   */
  _normalizeRecord(data) {
    const toJSON = (val) => {
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        return JSON.stringify(val);
      }
      return val || null;
    };

    let timeType = data.time_type || data.timeType || 'exact';
    let intervalStart = data.interval_start !== undefined && data.interval_start !== null ? Number(data.interval_start) : (data.intervalStart !== undefined && data.intervalStart !== null ? Number(data.intervalStart) : null);
    let intervalEnd = data.interval_end !== undefined && data.interval_end !== null ? Number(data.interval_end) : (data.intervalEnd !== undefined && data.intervalEnd !== null ? Number(data.intervalEnd) : null);
    let baseEventId = data.base_event_id || data.baseEventId || data.base_event || data.relative_anchor_event_id || data.relativeAnchorEventId || null;
    let relativeOffset = data.relative_offset !== undefined && data.relative_offset !== null
      ? data.relative_offset
      : (data.relativeOffset !== undefined && data.relativeOffset !== null
        ? data.relativeOffset
        : (data.offset !== undefined && data.offset !== null ? data.offset : null));
    let fuzzyTimeDesc = data.fuzzy_time_desc || data.fuzzyTimeDesc || (data.fuzzy_precision ? String(data.fuzzy_precision) : null);
    let timePointJson = null;
    let relativeTimeDesc = data.relative_time_desc || data.relativeTimeDesc || null;
    let timestampOrder = data.timestamp_order !== undefined && data.timestamp_order !== null
      ? Number(data.timestamp_order)
      : (data.timestampOrder !== undefined && data.timestampOrder !== null ? Number(data.timestampOrder) : null);

    // Handle object-shaped time_point: { type: "...", ... }
    if (typeof data.time_point === 'object' && data.time_point !== null) {
      timePointJson = JSON.stringify(data.time_point);
      const tp = data.time_point;
      timeType = tp.type || timeType || 'exact';

      if (timeType === 'interval') {
        intervalStart = tp.start !== undefined ? Number(tp.start) : intervalStart;
        intervalEnd = tp.end !== undefined ? Number(tp.end) : intervalEnd;
      } else if (timeType === 'relative') {
        baseEventId = tp.base_event || tp.base_event_id || tp.relative_anchor_event_id || baseEventId;
        relativeOffset = tp.offset !== undefined ? tp.offset : (tp.relative_offset !== undefined ? tp.relative_offset : relativeOffset);
      } else if (timeType === 'fuzzy') {
        fuzzyTimeDesc = tp.description || tp.desc || tp.text || fuzzyTimeDesc;
        relativeTimeDesc = relativeTimeDesc || fuzzyTimeDesc;
      } else if (timeType === 'exact') {
        timestampOrder = tp.value !== undefined ? Number(tp.value) : (tp.time_point !== undefined ? Number(tp.time_point) : null);
      }
    } else if (typeof data.time_point === 'string' && isNaN(Number(data.time_point))) {
      // String fuzzy time (e.g. "大流浪纪元初期")
      timeType = 'fuzzy';
      fuzzyTimeDesc = data.time_point;
      relativeTimeDesc = relativeTimeDesc || data.time_point;
      timePointJson = JSON.stringify({ type: 'fuzzy', description: data.time_point });
    } else if (data.time_point !== undefined && data.time_point !== null && !isNaN(Number(data.time_point))) {
      timestampOrder = Number(data.time_point);
    }

    // Determine timestamp_order based on time_type if not explicitly passed
    if (timestampOrder === null || isNaN(timestampOrder)) {
      if (data.timestamp_order !== undefined && data.timestamp_order !== null && !isNaN(Number(data.timestamp_order))) {
        timestampOrder = Number(data.timestamp_order);
      } else if (timeType === 'interval') {
        timestampOrder = intervalStart !== null ? intervalStart : (intervalEnd !== null ? intervalEnd : 0);
      } else if (timeType === 'relative') {
        let resolvedBase = null;
        if (baseEventId && this.db) {
          try {
            const baseRow = this.db.prepare('SELECT timestamp_order FROM timeline_events WHERE event_id = ?').get(baseEventId);
            if (baseRow && baseRow.timestamp_order !== null && baseRow.timestamp_order !== undefined) {
              resolvedBase = Number(baseRow.timestamp_order);
            }
          } catch (_) {}
        }
        let numOffset = 0;
        if (typeof relativeOffset === 'number') {
          numOffset = relativeOffset;
        } else if (typeof relativeOffset === 'string') {
          const match = relativeOffset.match(/[-+]?\d+(\.\d+)?/);
          numOffset = match ? parseFloat(match[0]) : 0;
        }
        timestampOrder = (resolvedBase !== null ? resolvedBase : 0) + numOffset;
      } else if (timeType === 'fuzzy') {
        const str = String(fuzzyTimeDesc || relativeTimeDesc || '');
        const bcMatch = str.match(/公元前\s*(\d+(\.\d+)?)/);
        if (bcMatch) {
          timestampOrder = -parseFloat(bcMatch[1]);
        } else {
          const numMatch = str.match(/-?\d+(\.\d+)?/);
          timestampOrder = numMatch ? parseFloat(numMatch[0]) : 0;
        }
      } else {
        timestampOrder = 0;
      }
    }

    const eventId = data.event_id || data.eventId || data.id_code || (data.id && typeof data.id === 'string' ? data.id : '') || `EV-${timestampOrder}-${Date.now().toString(36)}`;

    const numRelativeOffset = relativeOffset !== null && !isNaN(Number(relativeOffset))
      ? Number(relativeOffset)
      : (typeof relativeOffset === 'string' ? (parseFloat(relativeOffset.match(/[-+]?\d+(\.\d+)?/)?.[0]) || null) : null);

    return {
      event_id: eventId,
      title: data.title || data.event_name || '',
      era_epoch: data.era_epoch || 'CE',
      timestamp_order: timestampOrder,
      timeline_year: data.timeline_year !== undefined && data.timeline_year !== null
        ? Number(data.timeline_year)
        : (Number.isFinite(timestampOrder) ? (Number.isInteger(timestampOrder) ? timestampOrder : Math.floor(timestampOrder)) : null),
      timeline_month: data.timeline_month !== undefined && data.timeline_month !== null ? Number(data.timeline_month) : null,
      timeline_day: data.timeline_day !== undefined && data.timeline_day !== null ? Number(data.timeline_day) : null,
      relative_time_desc: relativeTimeDesc,
      description: data.description || null,
      source_file_id: data.source_file_id !== undefined && data.source_file_id !== null ? Number(data.source_file_id) : null,
      primary_entity_id: data.primary_entity_id ? Number(data.primary_entity_id) : null,
      participant_entity_ids_json: toJSON(data.participant_entity_ids_json || data.involved_entities || data.participants),
      causality_prerequisite_ids_json: toJSON(data.causality_prerequisite_ids_json || data.prerequisites),
      causality_consequence_ids_json: toJSON(data.causality_consequence_ids_json || data.consequences),
      status: data.status || 'active',
      time_type: timeType,
      interval_start: intervalStart,
      interval_end: intervalEnd,
      base_event_id: baseEventId,
      relative_offset: numRelativeOffset,
      fuzzy_time_desc: fuzzyTimeDesc,
      time_point_json: timePointJson,
      _rawRelativeOffset: typeof relativeOffset === 'string' ? relativeOffset : null
    };
  }

  /**
   * Format database row into structured object with time_point and aliases
   * @private
   */
  _formatRow(row) {
    if (!row) return null;

    let involvedEntities = [];
    try {
      if (row.participant_entity_ids_json) {
        involvedEntities = JSON.parse(row.participant_entity_ids_json);
      }
    } catch (_) {}

    let timePoint = null;
    if (row.time_point_json) {
      try {
        timePoint = JSON.parse(row.time_point_json);
      } catch (_) {}
    }

    if (!timePoint) {
      if (row.time_type === 'interval') {
        timePoint = {
          type: 'interval',
          start: row.interval_start !== null ? row.interval_start : row.timestamp_order,
          end: row.interval_end !== null ? row.interval_end : row.timestamp_order
        };
      } else if (row.time_type === 'relative') {
        timePoint = {
          type: 'relative',
          base_event: row.base_event_id,
          base_event_id: row.base_event_id,
          relative_anchor_event_id: row.base_event_id,
          offset: row.relative_offset !== null ? row.relative_offset : 0,
          relative_offset: row.relative_offset !== null ? row.relative_offset : 0
        };
      } else if (row.time_type === 'fuzzy') {
        timePoint = {
          type: 'fuzzy',
          description: row.fuzzy_time_desc || row.relative_time_desc || ''
        };
      } else {
        timePoint = row.timestamp_order;
      }
    }

    return {
      ...row,
      event_name: row.title,
      time_point: timePoint,
      relative_anchor_event_id: row.base_event_id,
      involved_entities: involvedEntities,
      participants: involvedEntities
    };
  }

  /**
   * Insert a timeline event
   * @param {object} data
   * @returns {object} Inserted event
   */
  insert(data) {
    const record = this._normalizeRecord(data);
    const sql = `
      INSERT INTO timeline_events (
        event_id, title, era_epoch, timestamp_order, timeline_year,
        timeline_month, timeline_day, relative_time_desc, description,
        source_file_id, primary_entity_id, participant_entity_ids_json,
        causality_prerequisite_ids_json, causality_consequence_ids_json,
        status, time_type, interval_start, interval_end, base_event_id,
        relative_offset, fuzzy_time_desc, time_point_json,
        created_at, updated_at
      ) VALUES (
        @event_id, @title, @era_epoch, @timestamp_order, @timeline_year,
        @timeline_month, @timeline_day, @relative_time_desc, @description,
        @source_file_id, @primary_entity_id, @participant_entity_ids_json,
        @causality_prerequisite_ids_json, @causality_consequence_ids_json,
        @status, @time_type, @interval_start, @interval_end, @base_event_id,
        @relative_offset, @fuzzy_time_desc, @time_point_json,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    const row = this.getById(info.lastInsertRowid);
    if (record._rawRelativeOffset && row) {
      row.relative_offset = record._rawRelativeOffset;
    }
    return row;
  }

  /**
   * Alias for insert
   */
  create(data) {
    return this.insert(data);
  }

  /**
   * Upsert a timeline event
   * @param {object} data
   * @returns {object}
   */
  upsert(data) {
    if (data.id && Number.isInteger(Number(data.id))) {
      const record = { ...this._normalizeRecord(data), id: Number(data.id) };
      const sql = `
        UPDATE timeline_events SET
          event_id = @event_id,
          title = @title,
          era_epoch = @era_epoch,
          timestamp_order = @timestamp_order,
          timeline_year = @timeline_year,
          timeline_month = @timeline_month,
          timeline_day = @timeline_day,
          relative_time_desc = @relative_time_desc,
          description = @description,
          source_file_id = @source_file_id,
          primary_entity_id = @primary_entity_id,
          participant_entity_ids_json = @participant_entity_ids_json,
          causality_prerequisite_ids_json = @causality_prerequisite_ids_json,
          causality_consequence_ids_json = @causality_consequence_ids_json,
          status = @status,
          time_type = @time_type,
          interval_start = @interval_start,
          interval_end = @interval_end,
          base_event_id = @base_event_id,
          relative_offset = @relative_offset,
          fuzzy_time_desc = @fuzzy_time_desc,
          time_point_json = @time_point_json,
          updated_at = datetime('now', 'localtime')
        WHERE id = @id
      `;
      this.db.prepare(sql).run(record);
      const row = this.getById(record.id);
      if (record._rawRelativeOffset && row) {
        row.relative_offset = record._rawRelativeOffset;
      }
      return row;
    }

    let existing = null;
    if (data.source_file_id && data.event_id) {
      existing = this.db.prepare(
        'SELECT id FROM timeline_events WHERE source_file_id = ? AND event_id = ?'
      ).get(Number(data.source_file_id), data.event_id);
    }

    if (!existing && (data.event_id || data.eventId)) {
      const eId = data.event_id || data.eventId;
      existing = this.db.prepare(
        'SELECT id FROM timeline_events WHERE event_id = ?'
      ).get(eId);
    }

    if (existing) {
      return this.upsert({ ...data, id: existing.id });
    }

    return this.insert(data);
  }

  /**
   * Batch upsert timeline events
   * @param {Array<object>} events
   * @returns {number}
   */
  batchUpsert(events) {
    if (!Array.isArray(events) || events.length === 0) {
      return 0;
    }

    const tx = this.db.transaction((items) => {
      let count = 0;
      for (const item of items) {
        this.upsert(item);
        count++;
      }
      return count;
    });

    return tx(events);
  }

  /**
   * Retrieve event by primary key ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_file_path
      FROM timeline_events te
      LEFT JOIN entities e ON te.primary_entity_id = e.id
      LEFT JOIN source_files sf ON te.source_file_id = sf.id
      WHERE te.id = ?
    `);
    const row = stmt.get(Number(id));
    return this._formatRow(row);
  }

  /**
   * Retrieve event by canon event_id (e.g. "EV-2042-01")
   * @param {string} eventId
   * @returns {object|null}
   */
  getByEventId(eventId) {
    const stmt = this.db.prepare(`
      SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_file_path
      FROM timeline_events te
      LEFT JOIN entities e ON te.primary_entity_id = e.id
      LEFT JOIN source_files sf ON te.source_file_id = sf.id
      WHERE te.event_id = ?
    `);
    const row = stmt.get(eventId);
    return this._formatRow(row);
  }

  /**
   * Query timeline events chronologically
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.era_epoch) {
      clauses.push('te.era_epoch = @era_epoch');
      params.era_epoch = filter.era_epoch;
    }

    if (filter.time_type) {
      clauses.push('te.time_type = @time_type');
      params.time_type = filter.time_type;
    }

    if (filter.base_event_id || filter.relative_anchor_event_id) {
      clauses.push('te.base_event_id = @base_event_id');
      params.base_event_id = filter.base_event_id || filter.relative_anchor_event_id;
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        clauses.push(`te.status IN (${filter.status.map((_, i) => `@status_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`status_${i}`] = s; });
      } else {
        clauses.push('te.status = @status');
        params.status = filter.status;
      }
    }

    if (filter.primary_entity_id) {
      clauses.push('te.primary_entity_id = @primary_entity_id');
      params.primary_entity_id = Number(filter.primary_entity_id);
    }

    if (filter.source_file_id) {
      clauses.push('te.source_file_id = @source_file_id');
      params.source_file_id = Number(filter.source_file_id);
    }

    if (filter.interval_overlap_start !== undefined && filter.interval_overlap_end !== undefined) {
      clauses.push(`(
        (te.interval_start IS NOT NULL AND te.interval_end IS NOT NULL AND te.interval_start <= @overlap_end AND te.interval_end >= @overlap_start)
        OR (te.timestamp_order BETWEEN @overlap_start AND @overlap_end)
      )`);
      params.overlap_start = Number(filter.interval_overlap_start);
      params.overlap_end = Number(filter.interval_overlap_end);
    } else {
      if (filter.min_order !== undefined) {
        clauses.push('(te.timestamp_order >= @min_order OR (te.interval_end IS NOT NULL AND te.interval_end >= @min_order))');
        params.min_order = Number(filter.min_order);
      }

      if (filter.max_order !== undefined) {
        clauses.push('(te.timestamp_order <= @max_order OR (te.interval_start IS NOT NULL AND te.interval_start <= @max_order))');
        params.max_order = Number(filter.max_order);
      }
    }

    if (filter.year !== undefined) {
      clauses.push('te.timeline_year = @year');
      params.year = Number(filter.year);
    }

    if (filter.query || filter.keyword || filter.search) {
      const kw = filter.query || filter.keyword || filter.search;
      clauses.push('(te.title LIKE @kw OR te.description LIKE @kw OR te.event_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    if (filter.involved_entities || filter.entity) {
      const ent = filter.involved_entities || filter.entity;
      clauses.push('(te.participant_entity_ids_json LIKE @entity_filter OR te.title LIKE @entity_filter OR te.description LIKE @entity_filter)');
      params.entity_filter = `%${ent}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const validSortColumns = new Set(['id', 'timestamp_order', 'timeline_year', 'created_at']);
    const orderBy = validSortColumns.has(filter.orderBy) ? `te.${filter.orderBy}` : 'te.timestamp_order';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT te.*, e.canonical_name AS primary_entity_name, sf.relative_path AS source_file_path
      FROM timeline_events te
      LEFT JOIN entities e ON te.primary_entity_id = e.id
      LEFT JOIN source_files sf ON te.source_file_id = sf.id
      ${whereClause}
      ORDER BY ${orderBy} ${direction}
    `;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Count timeline events matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.era_epoch) {
      clauses.push('era_epoch = @era_epoch');
      params.era_epoch = filter.era_epoch;
    }
    if (filter.time_type) {
      clauses.push('time_type = @time_type');
      params.time_type = filter.time_type;
    }
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        clauses.push(`status IN (${filter.status.map((_, i) => `@status_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`status_${i}`] = s; });
      } else {
        clauses.push('status = @status');
        params.status = filter.status;
      }
    }
    if (filter.primary_entity_id) {
      clauses.push('primary_entity_id = @primary_entity_id');
      params.primary_entity_id = Number(filter.primary_entity_id);
    }
    if (filter.source_file_id) {
      clauses.push('source_file_id = @source_file_id');
      params.source_file_id = Number(filter.source_file_id);
    }
    if (filter.min_order !== undefined) {
      clauses.push('timestamp_order >= @min_order');
      params.min_order = Number(filter.min_order);
    }
    if (filter.max_order !== undefined) {
      clauses.push('timestamp_order <= @max_order');
      params.max_order = Number(filter.max_order);
    }
    if (filter.year !== undefined || filter.timeline_year !== undefined) {
      clauses.push('timeline_year = @year');
      params.year = Number(filter.year !== undefined ? filter.year : filter.timeline_year);
    }
    if (filter.query || filter.keyword) {
      const kw = filter.query || filter.keyword;
      clauses.push('(title LIKE @kw OR description LIKE @kw OR event_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }
    if (filter.involved_entities || filter.entity) {
      const ent = filter.involved_entities || filter.entity;
      clauses.push('(participant_entity_ids_json LIKE @entity_filter OR title LIKE @entity_filter OR description LIKE @entity_filter)');
      params.entity_filter = `%${ent}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM timeline_events ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Delete timeline event by ID
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM timeline_events WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete all timeline events for a source file
   * @param {number} sourceFileId
   * @returns {number}
   */
  deleteBySourceFileId(sourceFileId) {
    const stmt = this.db.prepare('DELETE FROM timeline_events WHERE source_file_id = ?');
    const info = stmt.run(Number(sourceFileId));
    return info.changes;
  }

  /**
   * ANOM_009: Detect timeline causality order inversions
   * Child event has an earlier timestamp than its prerequisite event
   * @returns {Array<object>}
   */
  findChronologyInversions() {
    const sql = `
      SELECT 
        te.id AS child_id,
        te.event_id AS child_event_id,
        te.title AS child_title,
        te.timestamp_order AS child_time,
        te.source_file_id AS child_source_file_id,
        sf_child.relative_path AS child_file_path,
        p.value AS prerequisite_event_id,
        pe.id AS prerequisite_id,
        pe.title AS prerequisite_title,
        pe.timestamp_order AS prerequisite_time,
        pe.source_file_id AS prerequisite_source_file_id,
        sf_prereq.relative_path AS prerequisite_file_path
      FROM timeline_events te,
           json_each(te.causality_prerequisite_ids_json) p
      JOIN timeline_events pe ON pe.event_id = p.value
      LEFT JOIN source_files sf_child ON te.source_file_id = sf_child.id
      LEFT JOIN source_files sf_prereq ON pe.source_file_id = sf_prereq.id
      WHERE te.timestamp_order < pe.timestamp_order
    `;
    return this.db.prepare(sql).all();
  }
}

module.exports = TimelineRepo;
