/**
 * @file CanonChangeRepo.js
 * @description Typed CRUD and Governance Audit Log Repository for canon_changes Table (Phase 3)
 * @module db/repositories/CanonChangeRepo
 */

'use strict';

class CanonChangeRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for CanonChangeRepo');
    }
    this.db = db;
  }

  /**
   * Normalize input record for SQL insertion
   * @private
   */
  _normalizeRecord(data) {
    const toJSON = (val) => {
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val || null;
    };

    if (!data.change_type && !data.changeType) {
      throw new Error('change_type is required for recording canon change');
    }
    if (!data.target_type && !data.targetType) {
      throw new Error('target_type is required for recording canon change');
    }
    if (!data.target_id && !data.targetId) {
      throw new Error('target_id is required for recording canon change');
    }

    const beforeStateJson = toJSON(data.before_state_json || data.beforeState || data.before || data.old_value_json || data.oldValue);
    const afterStateJson = toJSON(data.after_state_json || data.afterState || data.after || data.new_value_json || data.newValue);
    const token = data.confirmation_token || data.confirmationToken || 'CONFIRM_CANON_CHANGE';
    const confirmedFlag = data.confirmed_by_flag || data.confirmedByFlag || data.confirmCanonChange ? 1 : 0;

    return {
      change_type: String(data.change_type || data.changeType).toUpperCase().trim(),
      target_type: String(data.target_type || data.targetType).toLowerCase().trim(),
      target_id: String(data.target_id || data.targetId).trim(),
      target_db_id: data.target_db_id !== undefined && data.target_db_id !== null ? Number(data.target_db_id) : null,
      before_state_json: beforeStateJson,
      after_state_json: afterStateJson,
      old_value_json: beforeStateJson,
      new_value_json: afterStateJson,
      confirmation_token: String(token).trim(),
      confirmed_by_flag: confirmedFlag,
      operator: String(data.operator || 'system').trim(),
      reason: data.reason || null,
      impact_summary_json: toJSON(data.impact_summary_json || data.impactSummary || data.impact)
    };
  }

  /**
   * Record a governance state mutation into audit log
   * @param {object} changeData
   * @returns {object} Inserted change record
   */
  recordChange(changeData) {
    return this.insert(changeData);
  }

  /**
   * Insert a change record
   * @param {object} data
   * @returns {object}
   */
  insert(data) {
    const record = this._normalizeRecord(data);
    const sql = `
      INSERT INTO canon_changes (
        change_type, target_type, target_id, target_db_id, before_state_json, after_state_json,
        old_value_json, new_value_json, confirmation_token, confirmed_by_flag,
        operator, reason, impact_summary_json, created_at
      ) VALUES (
        @change_type, @target_type, @target_id, @target_db_id, @before_state_json, @after_state_json,
        @old_value_json, @new_value_json, @confirmation_token, @confirmed_by_flag,
        @operator, @reason, @impact_summary_json, datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return this.getById(info.lastInsertRowid);
  }

  /**
   * Retrieve change record by ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM canon_changes WHERE id = ?');
    const row = stmt.get(Number(id));
    return this._hydrateRow(row);
  }

  /**
   * Retrieve recent canon changes
   * @param {number} [limit=20]
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  getRecentChanges(limit = 20, filter = {}) {
    return this.query({ ...filter, limit: Math.max(1, parseInt(limit, 10) || 20), orderDirection: 'DESC' });
  }

  /**
   * Retrieve all audit entries for a specific target entity or source file
   * @param {string} targetType
   * @param {string|number} targetId
   * @param {number} [limit=50]
   * @returns {Array<object>}
   */
  getChangesForTarget(targetType, targetId, limit = 50) {
    return this.query({
      target_type: targetType,
      target_id: targetId,
      limit: Math.max(1, parseInt(limit, 10) || 50),
      orderDirection: 'DESC'
    });
  }

  /**
   * Query canon changes with filter criteria
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.change_type || filter.changeType) {
      const type = filter.change_type || filter.changeType;
      if (Array.isArray(type)) {
        clauses.push(`change_type IN (${type.map((_, i) => `@type_${i}`).join(', ')})`);
        type.forEach((t, i) => { params[`type_${i}`] = String(t).toUpperCase(); });
      } else {
        clauses.push('change_type = @change_type');
        params.change_type = String(type).toUpperCase();
      }
    }

    if (filter.target_type || filter.targetType) {
      clauses.push('target_type = @target_type');
      params.target_type = String(filter.target_type || filter.targetType).toLowerCase();
    }

    if (filter.target_id || filter.targetId) {
      clauses.push('target_id = @target_id');
      params.target_id = String(filter.target_id || filter.targetId);
    }

    if (filter.operator) {
      clauses.push('operator = @operator');
      params.operator = String(filter.operator);
    }

    if (filter.query || filter.search || filter.reason) {
      const kw = filter.query || filter.search || filter.reason;
      clauses.push('(reason LIKE @kw OR target_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = filter.orderBy ? filter.orderBy : 'id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    let sql = `SELECT * FROM canon_changes ${whereClause} ORDER BY ${orderBy} ${direction}`;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._hydrateRow(r));
  }

  /**
   * Count changes matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.change_type || filter.changeType) {
      clauses.push('change_type = @change_type');
      params.change_type = String(filter.change_type || filter.changeType).toUpperCase();
    }
    if (filter.target_type || filter.targetType) {
      clauses.push('target_type = @target_type');
      params.target_type = String(filter.target_type || filter.targetType).toLowerCase();
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM canon_changes ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Aggregate governance audit statistics
   * @returns {object}
   */
  getSummary() {
    const total = this.count();
    const typeBreakdownRows = this.db.prepare(
      'SELECT change_type, COUNT(*) AS count FROM canon_changes GROUP BY change_type'
    ).all();
    const targetBreakdownRows = this.db.prepare(
      'SELECT target_type, COUNT(*) AS count FROM canon_changes GROUP BY target_type'
    ).all();

    const byChangeType = {};
    for (const r of typeBreakdownRows) byChangeType[r.change_type] = r.count;

    const byTargetType = {};
    for (const r of targetBreakdownRows) byTargetType[r.target_type] = r.count;

    const latest = this.db.prepare('SELECT created_at FROM canon_changes ORDER BY id DESC LIMIT 1').get();

    return {
      totalChanges: total,
      byChangeType,
      byTargetType,
      lastChangeAt: latest ? latest.created_at : null
    };
  }

  /**
   * Parse JSON fields in row
   * @private
   */
  _hydrateRow(row) {
    if (!row) return null;
    let beforeState = null;
    let afterState = null;
    let impactSummary = null;
    let oldValue = null;
    let newValue = null;

    if (row.before_state_json) {
      try { beforeState = JSON.parse(row.before_state_json); } catch (_) { beforeState = row.before_state_json; }
    }
    if (row.after_state_json) {
      try { afterState = JSON.parse(row.after_state_json); } catch (_) { afterState = row.after_state_json; }
    }
    if (row.old_value_json) {
      try { oldValue = JSON.parse(row.old_value_json); } catch (_) { oldValue = row.old_value_json; }
    }
    if (row.new_value_json) {
      try { newValue = JSON.parse(row.new_value_json); } catch (_) { newValue = row.new_value_json; }
    }
    if (row.impact_summary_json) {
      try { impactSummary = JSON.parse(row.impact_summary_json); } catch (_) { impactSummary = row.impact_summary_json; }
    }

    return {
      ...row,
      beforeState: beforeState || oldValue,
      afterState: afterState || newValue,
      before_state: beforeState || oldValue,
      after_state: afterState || newValue,
      oldValue: oldValue || beforeState,
      newValue: newValue || afterState,
      impactSummary
    };
  }
}

module.exports = CanonChangeRepo;
