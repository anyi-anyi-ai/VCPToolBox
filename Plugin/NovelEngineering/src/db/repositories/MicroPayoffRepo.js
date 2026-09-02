/**
 * @file MicroPayoffRepo.js
 * @description Typed CRUD and pacing fatigue mitigation DAO for micro_payoffs table (Phase 5).
 * Tracks intermediate payoffs, clue reveals, reader satisfaction, and fatigue mitigation scores.
 * @module db/repositories/MicroPayoffRepo
 */

'use strict';

const crypto = require('crypto');
const { NovelError } = require('../../errors');

const PAYOFF_TYPES = {
  CLUE_REVEALED: 'clue_revealed',
  MINOR_SATISFACTION: 'minor_satisfaction',
  THEORY_CONFIRMED: 'theory_confirmed',
  CRISIS_ALLEVIATED: 'crisis_alleviated',
  SUB_PAYOFF: 'sub_payoff',
  FORESHADOW_ADVANCE: 'foreshadow_advance'
};

class MicroPayoffRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for MicroPayoffRepo');
    }
    this.db = db;
  }

  /**
   * Normalize and validate payoff payload
   * @private
   * @param {object} data
   * @returns {object}
   */
  _normalizeRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new NovelError('Payoff payload must be a non-null object');
    }

    const rawDebtId = data.debt_id !== undefined && data.debt_id !== null ? data.debt_id : data.debtId;
    if (!rawDebtId || typeof rawDebtId !== 'string') {
      throw new NovelError('debt_id is required for recording a micro payoff');
    }
    const debtId = String(rawDebtId).trim();

    const rawPayoffId = data.payoff_id !== undefined && data.payoff_id !== null ? data.payoff_id : data.payoffId;
    const payoffId = rawPayoffId
      ? String(rawPayoffId).trim()
      : `payoff_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const rawChapter = data.chapter_number !== undefined && data.chapter_number !== null
      ? data.chapter_number
      : data.chapterNumber !== undefined && data.chapterNumber !== null
        ? data.chapterNumber
        : data.chapter;
    const chapterNumber = Number.isInteger(Number(rawChapter)) ? Number(rawChapter) : 1;

    const rawType = data.payoff_type !== undefined && data.payoff_type !== null
      ? data.payoff_type
      : data.payoffType !== undefined && data.payoffType !== null
        ? data.payoffType
        : 'minor_satisfaction';
    const payoffType = String(rawType).toLowerCase().trim();

    const rawSatisfaction = data.satisfaction_score !== undefined && data.satisfaction_score !== null
      ? data.satisfaction_score
      : data.satisfactionScore !== undefined && data.satisfactionScore !== null
        ? data.satisfactionScore
        : 1.0;
    const satisfactionScore = Number(rawSatisfaction) || 1.0;

    const rawFatigue = data.fatigue_mitigation_score !== undefined && data.fatigue_mitigation_score !== null
      ? data.fatigue_mitigation_score
      : data.fatigueMitigationScore !== undefined && data.fatigueMitigationScore !== null
        ? data.fatigueMitigationScore
        : 1.0;
    const fatigueMitigationScore = Number(rawFatigue) || 1.0;

    const rawReduction = data.principal_reduction !== undefined && data.principal_reduction !== null
      ? data.principal_reduction
      : data.principalReduction !== undefined && data.principalReduction !== null
        ? data.principalReduction
        : 0.0;
    const principalReduction = Number(rawReduction) || 0.0;

    const rawDesc = data.description !== undefined && data.description !== null ? data.description : null;
    const description = rawDesc !== null ? String(rawDesc).trim() : null;

    const rawSnippet = data.snippet !== undefined && data.snippet !== null ? data.snippet : null;
    const snippet = rawSnippet !== null ? String(rawSnippet).trim() : null;

    return {
      debt_id: debtId,
      payoff_id: payoffId,
      chapter_number: chapterNumber,
      payoff_type: payoffType,
      satisfaction_score: satisfactionScore,
      fatigue_mitigation_score: fatigueMitigationScore,
      principal_reduction: principalReduction,
      description,
      snippet
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

    return {
      id: Number(row.id),
      debtId: row.debt_id,
      debt_id: row.debt_id,
      payoffId: row.payoff_id,
      payoff_id: row.payoff_id,
      chapterNumber: Number(row.chapter_number),
      chapter_number: Number(row.chapter_number),
      payoffType: row.payoff_type,
      payoff_type: row.payoff_type,
      satisfactionScore: Number(row.satisfaction_score),
      satisfaction_score: Number(row.satisfaction_score),
      fatigueMitigationScore: Number(row.fatigue_mitigation_score),
      fatigue_mitigation_score: Number(row.fatigue_mitigation_score),
      principalReduction: Number(row.principal_reduction),
      principal_reduction: Number(row.principal_reduction),
      description: row.description,
      snippet: row.snippet,
      createdAt: row.created_at,
      created_at: row.created_at
    };
  }

  /**
   * Record a single micro-payoff
   * @param {object} data
   * @returns {object}
   */
  recordPayoff(data) {
    const record = this._normalizeRecord(data);
    const stmt = this.db.prepare(`
      INSERT INTO micro_payoffs (
        debt_id, payoff_id, chapter_number, payoff_type, satisfaction_score, fatigue_mitigation_score,
        principal_reduction, description, snippet
      ) VALUES (
        @debt_id, @payoff_id, @chapter_number, @payoff_type, @satisfaction_score, @fatigue_mitigation_score,
        @principal_reduction, @description, @snippet
      )
    `);

    stmt.run(record);
    return this.getByPayoffId(record.payoff_id);
  }

  /**
   * Alias for recordPayoff
   * @param {object} data
   * @returns {object}
   */
  insert(data) {
    return this.recordPayoff(data);
  }

  /**
   * Bulk insert micro-payoffs inside transaction
   * @param {Array<object>} payoffs
   * @returns {Array<object>}
   */
  batchInsert(payoffs) {
    if (!Array.isArray(payoffs) || payoffs.length === 0) return [];

    const stmt = this.db.prepare(`
      INSERT INTO micro_payoffs (
        debt_id, payoff_id, chapter_number, payoff_type, satisfaction_score, fatigue_mitigation_score,
        principal_reduction, description, snippet
      ) VALUES (
        @debt_id, @payoff_id, @chapter_number, @payoff_type, @satisfaction_score, @fatigue_mitigation_score,
        @principal_reduction, @description, @snippet
      )
    `);

    const insertedPayoffIds = [];
    const tx = this.db.transaction((items) => {
      for (const item of items) {
        const record = this._normalizeRecord(item);
        stmt.run(record);
        insertedPayoffIds.push(record.payoff_id);
      }
    });

    tx(payoffs);
    return insertedPayoffIds.map((id) => this.getByPayoffId(id));
  }

  /**
   * Get payoff by numeric PK ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const row = this.db.prepare('SELECT * FROM micro_payoffs WHERE id = ?').get(id);
    return this._formatRow(row);
  }

  /**
   * Get payoff by payoff_id or id
   * @param {string|number} payoffId
   * @returns {object|null}
   */
  getByPayoffId(payoffId) {
    if (!payoffId) return null;
    if (typeof payoffId === 'number' || /^\d+$/.test(String(payoffId))) {
      const byNum = this.db.prepare('SELECT * FROM micro_payoffs WHERE id = ? OR payoff_id = ?').get(payoffId, String(payoffId));
      if (byNum) return this._formatRow(byNum);
    }
    const row = this.db.prepare('SELECT * FROM micro_payoffs WHERE payoff_id = ?').get(String(payoffId));
    return this._formatRow(row);
  }

  /**
   * Alias for getByPayoffId
   * @param {string|number} payoffId
   * @returns {object|null}
   */
  getPayoffById(payoffId) {
    return this.getByPayoffId(payoffId);
  }

  /**
   * Get all micro-payoffs for a specific narrative debt
   * @param {string} debtId
   * @param {object} [options={}]
   * @returns {Array<object>}
   */
  getPayoffsForDebt(debtId, options = {}) {
    if (!debtId) return [];
    const orderDir = options.orderDir && options.orderDir.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const limitClause = options.limit && Number.isInteger(options.limit) ? `LIMIT ${options.limit}` : '';
    const rows = this.db.prepare(`
      SELECT * FROM micro_payoffs
      WHERE debt_id = ?
      ORDER BY chapter_number ${orderDir}, id ${orderDir}
      ${limitClause}
    `).all(debtId);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Get micro-payoffs occurring at a specific chapter
   * @param {number} chapterNumber
   * @returns {Array<object>}
   */
  getPayoffsByChapter(chapterNumber) {
    const rows = this.db.prepare(`
      SELECT * FROM micro_payoffs
      WHERE chapter_number = ?
      ORDER BY id ASC
    `).all(chapterNumber);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Get micro-payoffs across a range of chapters
   * @param {number} startChapter
   * @param {number} endChapter
   * @returns {Array<object>}
   */
  getPayoffsByChapterRange(startChapter, endChapter) {
    const rows = this.db.prepare(`
      SELECT * FROM micro_payoffs
      WHERE chapter_number >= ? AND chapter_number <= ?
      ORDER BY chapter_number ASC, id ASC
    `).all(startChapter, endChapter);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Aggregate payoff metrics and fatigue mitigation stats
   * @param {number} [startChapter=null]
   * @param {number} [endChapter=null]
   * @param {string} [debtId=null]
   * @returns {object}
   */
  getTotalPayoffsStats(startChapter = null, endChapter = null, debtId = null) {
    let sql = `
      SELECT
        COUNT(*) as total_count,
        SUM(satisfaction_score) as total_satisfaction,
        SUM(fatigue_mitigation_score) as total_fatigue_mitigated,
        SUM(principal_reduction) as total_principal_reduced,
        AVG(satisfaction_score) as avg_satisfaction,
        AVG(fatigue_mitigation_score) as avg_fatigue_mitigated
      FROM micro_payoffs
      WHERE 1=1
    `;
    const params = [];

    if (startChapter !== null && startChapter !== undefined) {
      sql += ' AND chapter_number >= ?';
      params.push(startChapter);
    }
    if (endChapter !== null && endChapter !== undefined) {
      sql += ' AND chapter_number <= ?';
      params.push(endChapter);
    }
    if (debtId) {
      sql += ' AND debt_id = ?';
      params.push(debtId);
    }

    const row = this.db.prepare(sql).get(...params);
    return {
      totalPayoffsCount: row && row.total_count ? Number(row.total_count) : 0,
      totalSatisfactionScore: row && row.total_satisfaction ? Number(row.total_satisfaction) : 0,
      totalFatigueMitigated: row && row.total_fatigue_mitigated ? Number(row.total_fatigue_mitigated) : 0,
      totalPrincipalReduced: row && row.total_principal_reduced ? Number(row.total_principal_reduced) : 0,
      avgSatisfaction: row && row.avg_satisfaction ? Number(row.avg_satisfaction) : 0,
      avgFatigueMitigated: row && row.avg_fatigue_mitigated ? Number(row.avg_fatigue_mitigated) : 0
    };
  }

  /**
   * Get recent micro payoffs
   * @param {number} [limit=10]
   * @returns {Array<object>}
   */
  getRecentPayoffs(limit = 10) {
    const rows = this.db.prepare(`
      SELECT * FROM micro_payoffs
      ORDER BY chapter_number DESC, id DESC
      LIMIT ?
    `).all(limit);

    return rows.map((r) => this._formatRow(r));
  }

  /**
   * Delete a single micro payoff
   * @param {string|number} payoffId
   * @returns {boolean}
   */
  deletePayoff(payoffId) {
    const res = this.db.prepare('DELETE FROM micro_payoffs WHERE payoff_id = ? OR id = ?').run(String(payoffId), Number(payoffId) || 0);
    return res.changes > 0;
  }

  /**
   * Count total payoffs matching filter
   * @param {object} [filter={}]
   * @returns {number}
   */
  count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM micro_payoffs WHERE 1=1';
    const params = [];

    if (filter.debtId || filter.debt_id) {
      sql += ' AND debt_id = ?';
      params.push(filter.debtId || filter.debt_id);
    }
    if (filter.payoffType || filter.payoff_type) {
      sql += ' AND payoff_type = ?';
      params.push(filter.payoffType || filter.payoff_type);
    }
    if (filter.chapterNumber !== undefined || filter.chapter_number !== undefined) {
      sql += ' AND chapter_number = ?';
      params.push(filter.chapterNumber !== undefined ? filter.chapterNumber : filter.chapter_number);
    }

    const row = this.db.prepare(sql).get(...params);
    return row ? Number(row.count) : 0;
  }
}

MicroPayoffRepo.PAYOFF_TYPES = PAYOFF_TYPES;

module.exports = MicroPayoffRepo;
