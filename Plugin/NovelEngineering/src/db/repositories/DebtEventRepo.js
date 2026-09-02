/**
 * @file DebtEventRepo.js
 * @description Typed CRUD and audit trail DAO for debt_events table (Phase 5).
 * Records lifecycle events: borrow, accrue, escalate, micro_payoff, payoff, default, adjust.
 * @module db/repositories/DebtEventRepo
 */

'use strict';

const { NovelError } = require('../../errors');

const EVENT_TYPES = {
  BORROW: 'borrow',
  ACCRUE: 'accrue',
  ESCALATE: 'escalate',
  MICRO_PAYOFF: 'micro_payoff',
  PAYOFF: 'payoff',
  DEFAULT: 'default',
  ADJUST: 'adjust'
};

class DebtEventRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for DebtEventRepo');
    }
    this.db = db;
  }

  /**
   * Normalize and validate event data
   * @private
   * @param {object} data
   * @returns {object}
   */
  _normalizeRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new NovelError('Event payload must be a non-null object');
    }

    const rawDebtId = data.debt_id !== undefined && data.debt_id !== null ? data.debt_id : data.debtId;
    if (!rawDebtId || typeof rawDebtId !== 'string') {
      throw new NovelError('debt_id is required for recording a debt event');
    }
    const debtId = String(rawDebtId).trim();

    const rawEventType = data.event_type !== undefined && data.event_type !== null ? data.event_type : data.eventType;
    if (!rawEventType || typeof rawEventType !== 'string') {
      throw new NovelError('event_type is required for recording a debt event');
    }
    const eventType = String(rawEventType).toLowerCase().trim();

    const rawChapter = data.chapter_number !== undefined && data.chapter_number !== null
      ? data.chapter_number
      : data.chapterNumber !== undefined && data.chapterNumber !== null
        ? data.chapterNumber
        : data.chapter;
    const chapterNumber = Number.isInteger(Number(rawChapter)) ? Number(rawChapter) : 1;

    const rawDelta = data.delta_balance !== undefined && data.delta_balance !== null
      ? data.delta_balance
      : data.deltaBalance !== undefined && data.deltaBalance !== null
        ? data.deltaBalance
        : 0.0;
    const deltaBalance = Number(rawDelta) || 0.0;

    const rawNewBalance = data.new_balance !== undefined && data.new_balance !== null
      ? data.new_balance
      : data.newBalance !== undefined && data.newBalance !== null
        ? data.newBalance
        : 0.0;
    const newBalance = Number(rawNewBalance) || 0.0;

    const rawTrigger = data.trigger_reason !== undefined && data.trigger_reason !== null
      ? data.trigger_reason
      : data.triggerReason !== undefined && data.triggerReason !== null
        ? data.triggerReason
        : null;
    const triggerReason = rawTrigger !== null ? String(rawTrigger).trim() : null;

    let metadataJson = null;
    const rawMetadata = data.metadata_json !== undefined ? data.metadata_json : data.metadata;
    if (rawMetadata !== undefined && rawMetadata !== null) {
      metadataJson = typeof rawMetadata === 'object' ? JSON.stringify(rawMetadata) : String(rawMetadata);
    }

    return {
      debt_id: debtId,
      event_type: eventType,
      chapter_number: chapterNumber,
      delta_balance: deltaBalance,
      new_balance: newBalance,
      trigger_reason: triggerReason,
      metadata_json: metadataJson
    };
  }

  /**
   * Hydrate raw database row
   * @private
   * @param {object} row
   * @returns {object|null}
   */
  _formatRow(row) {
    if (!row) return null;

    let metadata = null;
    if (row.metadata_json) {
      try {
        metadata = JSON.parse(row.metadata_json);
      } catch (_) {
        metadata = row.metadata_json;
      }
    }

    return {
      id: Number(row.id),
      debtId: row.debt_id,
      debt_id: row.debt_id,
      eventType: row.event_type,
      event_type: row.event_type,
      chapterNumber: Number(row.chapter_number),
      chapter_number: Number(row.chapter_number),
      deltaBalance: Number(row.delta_balance),
      delta_balance: Number(row.delta_balance),
      newBalance: Number(row.new_balance),
      new_balance: Number(row.new_balance),
      triggerReason: row.trigger_reason,
      trigger_reason: row.trigger_reason,
      metadata,
      metadata_json: row.metadata_json,
      createdAt: row.created_at,
      created_at: row.created_at
    };
  }

  /**
   * Record a single debt event
   * @param {object} data
   * @returns {object} Created event record
   */
  recordEvent(data) {
    const record = this._normalizeRecord(data);
    const stmt = this.db.prepare(`
      INSERT INTO debt_events (
        debt_id, event_type, chapter_number, delta_balance, new_balance, trigger_reason, metadata_json
      ) VALUES (
        @debt_id, @event_type, @chapter_number, @delta_balance, @new_balance, @trigger_reason, @metadata_json
      )
    `);

    const result = stmt.run(record);
    return this.getById(result.lastInsertRowid);
  }

  /**
   * Alias for recordEvent
   * @param {object} data
   * @returns {object}
   */
  insert(data) {
    return this.recordEvent(data);
  }

  /**
   * Bulk insert events inside a transaction
   * @param {Array<object>} events
   * @returns {Array<object>}
   */
  batchRecordEvents(events) {
    if (!Array.isArray(events) || events.length === 0) return [];

    const stmt = this.db.prepare(`
      INSERT INTO debt_events (
        debt_id, event_type, chapter_number, delta_balance, new_balance, trigger_reason, metadata_json
      ) VALUES (
        @debt_id, @event_type, @chapter_number, @delta_balance, @new_balance, @trigger_reason, @metadata_json
      )
    `);

    const insertedIds = [];
    const tx = this.db.transaction((items) => {
      for (const item of items) {
        const record = this._normalizeRecord(item);
        const res = stmt.run(record);
        insertedIds.push(res.lastInsertRowid);
      }
    });

    tx(events);
    return insertedIds.map((id) => this.getById(id));
  }

  /**
   * Alias for batchRecordEvents
   * @param {Array<object>} events
   * @returns {Array<object>}
   */
  batchInsert(events) {
    return this.batchRecordEvents(events);
  }

  /**
   * Get event by primary key ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const row = this.db.prepare('SELECT * FROM debt_events WHERE id = ?').get(id);
    return this._formatRow(row);
  }

  /**
   * Get all events for a given debt, chronologically sorted
   * @param {string} debtId
   * @param {object} [options={}]
   * @returns {Array<object>}
   */
  getEventsForDebt(debtId, options = {}) {
    if (!debtId) return [];
    const orderDir = options.orderDir && options.orderDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const limitClause = options.limit && Number.isInteger(options.limit) ? `LIMIT ${options.limit}` : '';
    const rows = this.db.prepare(`
      SELECT * FROM debt_events
      WHERE debt_id = ?
      ORDER BY chapter_number ${orderDir}, id ${orderDir}
      ${limitClause}
    `).all(debtId);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Get latest event for a given debt
   * @param {string} debtId
   * @returns {object|null}
   */
  getLatestEventForDebt(debtId) {
    const row = this.db.prepare(`
      SELECT * FROM debt_events
      WHERE debt_id = ?
      ORDER BY chapter_number DESC, id DESC
      LIMIT 1
    `).get(debtId);
    return this._formatRow(row);
  }

  /**
   * Get all events occurring at a specific chapter
   * @param {number} chapterNumber
   * @returns {Array<object>}
   */
  getEventsByChapter(chapterNumber) {
    const rows = this.db.prepare(`
      SELECT * FROM debt_events
      WHERE chapter_number = ?
      ORDER BY id ASC
    `).all(chapterNumber);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Get all events in a chapter range
   * @param {number} startChapter
   * @param {number} endChapter
   * @returns {Array<object>}
   */
  getEventsByChapterRange(startChapter, endChapter) {
    const rows = this.db.prepare(`
      SELECT * FROM debt_events
      WHERE chapter_number >= ? AND chapter_number <= ?
      ORDER BY chapter_number ASC, id ASC
    `).all(startChapter, endChapter);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Aggregate event statistics
   * @param {string} [debtId=null]
   * @returns {object}
   */
  getEventStats(debtId = null) {
    let sql = 'SELECT event_type, COUNT(*) as count, SUM(delta_balance) as total_delta FROM debt_events';
    const params = [];
    if (debtId) {
      sql += ' WHERE debt_id = ?';
      params.push(debtId);
    }
    sql += ' GROUP BY event_type';

    const rows = this.db.prepare(sql).all(...params);
    const byType = {};
    let totalEvents = 0;
    let netDelta = 0;

    for (const r of rows) {
      byType[r.event_type] = {
        count: Number(r.count),
        totalDelta: Number(r.total_delta || 0)
      };
      totalEvents += Number(r.count);
      netDelta += Number(r.total_delta || 0);
    }

    return {
      totalEvents,
      netDelta,
      byType
    };
  }

  /**
   * Delete events for a specific debt
   * @param {string} debtId
   * @returns {number} Changes count
   */
  deleteEventsForDebt(debtId) {
    const res = this.db.prepare('DELETE FROM debt_events WHERE debt_id = ?').run(debtId);
    return res.changes;
  }

  /**
   * Count total events matching optional filter
   * @param {object} [filter={}]
   * @returns {number}
   */
  count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM debt_events WHERE 1=1';
    const params = [];

    if (filter.debtId || filter.debt_id) {
      sql += ' AND debt_id = ?';
      params.push(filter.debtId || filter.debt_id);
    }
    if (filter.eventType || filter.event_type) {
      sql += ' AND event_type = ?';
      params.push(filter.eventType || filter.event_type);
    }
    if (filter.chapterNumber !== undefined || filter.chapter_number !== undefined) {
      sql += ' AND chapter_number = ?';
      params.push(filter.chapterNumber !== undefined ? filter.chapterNumber : filter.chapter_number);
    }

    const row = this.db.prepare(sql).get(...params);
    return row ? Number(row.count) : 0;
  }
}

DebtEventRepo.EVENT_TYPES = EVENT_TYPES;

module.exports = DebtEventRepo;
