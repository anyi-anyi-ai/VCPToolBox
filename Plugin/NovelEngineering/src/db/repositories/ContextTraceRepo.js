/**
 * @file ContextTraceRepo.js
 * @description Typed CRUD, snapshot lookup and lineage DAO for context_traces table (Phase 4).
 * Stores deterministic provenance records for 5-layer context compilations.
 * @module db/repositories/ContextTraceRepo
 */

'use strict';

const crypto = require('crypto');
const { CollaborationError } = require('../../errors');

class ContextTraceRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for ContextTraceRepo');
    }
    this.db = db;
  }

  /**
   * Normalize and validate context trace record before SQL insertion
   * @private
   * @param {object} data
   * @returns {object}
   */
  _normalizeRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new CollaborationError(
        'Trace payload must be a non-null object',
        CollaborationError.CODES.TRACE_NOT_FOUND,
        { data }
      );
    }

    const snapshotId = data.snapshot_id || data.snapshotId;
    if (!snapshotId || typeof snapshotId !== 'string') {
      throw new CollaborationError(
        'snapshot_id is required for saving a context trace',
        CollaborationError.CODES.TRACE_NOT_FOUND,
        { data }
      );
    }

    const traceItems = data.trace_items_json || data.traceItems || data.lineage || data.trace_items;
    if (traceItems === undefined || traceItems === null) {
      throw new CollaborationError(
        'trace_items is required for saving a context trace',
        CollaborationError.CODES.TRACE_NOT_FOUND,
        { data }
      );
    }

    const toJSON = (val) => {
      if (val === undefined || val === null) return null;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    };

    const traceItemsJson = typeof traceItems === 'object'
      ? JSON.stringify(traceItems)
      : String(traceItems);

    let totalSources = 0;
    if (data.total_sources !== undefined && data.total_sources !== null) {
      totalSources = Number(data.total_sources);
    } else if (Array.isArray(traceItems)) {
      totalSources = traceItems.length;
    } else if (typeof traceItems === 'string') {
      try {
        const parsed = JSON.parse(traceItems);
        if (Array.isArray(parsed)) totalSources = parsed.length;
      } catch (_) {}
    }

    const rawTraceId = data.trace_id !== undefined && data.trace_id !== null ? data.trace_id : data.traceId;
    const traceId = rawTraceId ? String(rawTraceId).trim() : `trc_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const rawProjectId = data.project_id !== undefined && data.project_id !== null ? data.project_id : data.projectId;
    const projectId = String(rawProjectId !== undefined && rawProjectId !== null ? rawProjectId : 'default').trim();

    const rawChapterId = data.chapter_id !== undefined && data.chapter_id !== null ? data.chapter_id : data.chapterId;
    const chapterId = rawChapterId !== undefined && rawChapterId !== null ? String(rawChapterId).trim() : null;

    const rawVol = data.volume_number !== undefined && data.volume_number !== null ? data.volume_number : data.volumeNumber;
    const volumeNumber = rawVol !== undefined && rawVol !== null ? Number(rawVol) : 1;

    const focusEntities = data.focus_entities_json !== undefined ? data.focus_entities_json
      : data.focusEntities !== undefined ? data.focusEntities
      : data.focus_entities;

    const budgetStats = data.budget_stats_json !== undefined ? data.budget_stats_json
      : data.budgetStats !== undefined ? data.budgetStats
      : data.budget_stats;

    const sourceSystems = data.source_systems_json !== undefined ? data.source_systems_json
      : data.sourceSystems !== undefined ? data.sourceSystems
      : data.source_systems;

    const authorities = data.authorities_json !== undefined ? data.authorities_json
      : data.authorities !== undefined ? data.authorities
      : null;

    return {
      trace_id: traceId,
      snapshot_id: String(snapshotId).trim(),
      project_id: projectId,
      chapter_id: chapterId,
      volume_number: volumeNumber,
      focus_entities_json: toJSON(focusEntities),
      total_sources: totalSources,
      trace_items_json: traceItemsJson,
      budget_stats_json: toJSON(budgetStats),
      source_systems_json: toJSON(sourceSystems),
      authorities_json: toJSON(authorities)
    };
  }

  /**
   * Save a context lineage trace record
   * @param {object} traceData
   * @returns {object} Created and hydrated trace record
   */
  saveTrace(traceData) {
    const record = this._normalizeRecord(traceData);
    const sql = `
      INSERT INTO context_traces (
        trace_id, snapshot_id, project_id, chapter_id, volume_number,
        focus_entities_json, total_sources, trace_items_json,
        budget_stats_json, source_systems_json, authorities_json, generated_at
      ) VALUES (
        @trace_id, @snapshot_id, @project_id, @chapter_id, @volume_number,
        @focus_entities_json, @total_sources, @trace_items_json,
        @budget_stats_json, @source_systems_json, @authorities_json, datetime('now', 'localtime')
      )
      ON CONFLICT(snapshot_id) DO UPDATE SET
        trace_id = excluded.trace_id,
        project_id = excluded.project_id,
        chapter_id = excluded.chapter_id,
        volume_number = excluded.volume_number,
        focus_entities_json = excluded.focus_entities_json,
        total_sources = excluded.total_sources,
        trace_items_json = excluded.trace_items_json,
        budget_stats_json = excluded.budget_stats_json,
        source_systems_json = excluded.source_systems_json,
        authorities_json = excluded.authorities_json,
        generated_at = datetime('now', 'localtime')
    `;

    const stmt = this.db.prepare(sql);
    stmt.run(record);
    return this.getBySnapshotId(record.snapshot_id);
  }

  /**
   * Alias for saveTrace
   */
  insert(traceData) {
    return this.saveTrace(traceData);
  }

  /**
   * Retrieve trace by snapshot_id
   * @param {string} snapshotId
   * @returns {object|null}
   */
  getBySnapshotId(snapshotId) {
    const stmt = this.db.prepare('SELECT * FROM context_traces WHERE snapshot_id = ?');
    const row = stmt.get(String(snapshotId));
    return this._hydrateRow(row);
  }

  /**
   * Retrieve trace by trace_id
   * @param {string} traceId
   * @returns {object|null}
   */
  getByTraceId(traceId) {
    const stmt = this.db.prepare('SELECT * FROM context_traces WHERE trace_id = ?');
    const row = stmt.get(String(traceId));
    return this._hydrateRow(row);
  }

  /**
   * Retrieve trace by integer PK id
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM context_traces WHERE id = ?');
    const row = stmt.get(Number(id));
    return this._hydrateRow(row);
  }

  /**
   * Query traces with filtering and pagination
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.project_id || filter.projectId) {
      clauses.push('project_id = @project_id');
      params.project_id = String(filter.project_id || filter.projectId);
    }

    if (filter.chapter_id || filter.chapterId) {
      clauses.push('chapter_id = @chapter_id');
      params.chapter_id = String(filter.chapter_id || filter.chapterId);
    }

    const rawVol = filter.volume_number !== undefined && filter.volume_number !== null ? filter.volume_number : filter.volumeNumber;
    if (rawVol !== undefined && rawVol !== null) {
      clauses.push('volume_number = @volume_number');
      params.volume_number = Number(rawVol);
    }

    if (filter.snapshot_id || filter.snapshotId) {
      clauses.push('snapshot_id = @snapshot_id');
      params.snapshot_id = String(filter.snapshot_id || filter.snapshotId);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = filter.orderBy ? filter.orderBy : 'id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let sql = `SELECT * FROM context_traces ${whereClause} ORDER BY ${orderBy} ${direction}`;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 50);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._hydrateRow(r));
  }

  /**
   * Count traces matching filter
   * @param {object} [filter={}]
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.project_id || filter.projectId) {
      clauses.push('project_id = @project_id');
      params.project_id = String(filter.project_id || filter.projectId);
    }

    if (filter.chapter_id || filter.chapterId) {
      clauses.push('chapter_id = @chapter_id');
      params.chapter_id = String(filter.chapter_id || filter.chapterId);
    }

    const rawVol = filter.volume_number !== undefined && filter.volume_number !== null ? filter.volume_number : filter.volumeNumber;
    if (rawVol !== undefined && rawVol !== null) {
      clauses.push('volume_number = @volume_number');
      params.volume_number = Number(rawVol);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM context_traces ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Retrieve recent traces
   * @param {number} [limit=20]
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  getRecentTraces(limit = 20, filter = {}) {
    return this.query({ ...filter, limit: Math.max(1, parseInt(limit, 10) || 20) });
  }

  /**
   * Delete trace by snapshot_id
   * @param {string} snapshotId
   * @returns {boolean}
   */
  deleteBySnapshotId(snapshotId) {
    const stmt = this.db.prepare('DELETE FROM context_traces WHERE snapshot_id = ?');
    const info = stmt.run(String(snapshotId));
    return info.changes > 0;
  }

  /**
   * Delete trace by trace_id
   * @param {string} traceId
   * @returns {boolean}
   */
  deleteByTraceId(traceId) {
    const stmt = this.db.prepare('DELETE FROM context_traces WHERE trace_id = ?');
    const info = stmt.run(String(traceId));
    return info.changes > 0;
  }

  /**
   * Delete trace by integer PK id
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM context_traces WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Hydrate raw database row
   * @private
   * @param {object|null} row
   * @returns {object|null}
   */
  _hydrateRow(row) {
    if (!row) return null;

    let focusEntities = null;
    let traceItems = null;
    let budgetStats = null;
    let sourceSystems = null;
    let authorities = null;

    if (row.focus_entities_json) {
      try { focusEntities = JSON.parse(row.focus_entities_json); } catch (_) { focusEntities = row.focus_entities_json; }
    }
    if (row.trace_items_json) {
      try { traceItems = JSON.parse(row.trace_items_json); } catch (_) { traceItems = row.trace_items_json; }
    }
    if (row.budget_stats_json) {
      try { budgetStats = JSON.parse(row.budget_stats_json); } catch (_) { budgetStats = row.budget_stats_json; }
    }
    if (row.source_systems_json) {
      try { sourceSystems = JSON.parse(row.source_systems_json); } catch (_) { sourceSystems = row.source_systems_json; }
    }
    if (row.authorities_json) {
      try { authorities = JSON.parse(row.authorities_json); } catch (_) { authorities = row.authorities_json; }
    }

    return {
      id: row.id,
      traceId: row.trace_id,
      trace_id: row.trace_id,
      snapshotId: row.snapshot_id,
      snapshot_id: row.snapshot_id,
      projectId: row.project_id,
      project_id: row.project_id,
      chapterId: row.chapter_id,
      chapter_id: row.chapter_id,
      volumeNumber: row.volume_number,
      volume_number: row.volume_number,
      focusEntities: focusEntities || [],
      focus_entities: focusEntities || [],
      totalSources: row.total_sources,
      total_sources: row.total_sources,
      traceItems: traceItems || [],
      trace_items: traceItems || [],
      lineage: traceItems || [],
      budgetStats: budgetStats || {},
      budget_stats: budgetStats || {},
      sourceSystems: sourceSystems || {},
      source_systems: sourceSystems || {},
      authorities: authorities || {},
      generatedAt: row.generated_at,
      generated_at: row.generated_at
    };
  }
}

module.exports = ContextTraceRepo;
