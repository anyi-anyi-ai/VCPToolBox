/**
 * @file ChapterRepo.js
 * @description Typed CRUD repository for chapters table
 * @module db/repositories/ChapterRepo
 */

'use strict';

class ChapterRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for ChapterRepo');
    }
    this.db = db;
  }

  /**
   * Normalize chapter record for SQL binding
   * @private
   */
  _normalizeRecord(data) {
    return {
      chapter_number: Number(data.chapter_number) || 1,
      volume_number: Number(data.volume_number) || 1,
      title: data.title || '',
      relative_path: data.relative_path || '',
      source_file_id: data.source_file_id !== undefined && data.source_file_id !== null ? Number(data.source_file_id) : null,
      word_count: Number(data.word_count) || 0,
      status: data.status || 'draft',
      canon: data.canon !== undefined && data.canon !== null ? Number(data.canon) : 0,
      timeline_start: data.timeline_start !== undefined && data.timeline_start !== null ? Number(data.timeline_start) : null,
      timeline_end: data.timeline_end !== undefined && data.timeline_end !== null ? Number(data.timeline_end) : null,
      pov_entity_id: data.pov_entity_id ? Number(data.pov_entity_id) : null,
      summary: data.summary || null
    };
  }

  /**
   * Insert a chapter record
   * @param {object} data
   * @returns {object} Inserted chapter
   */
  insert(data) {
    const record = this._normalizeRecord(data);
    const sql = `
      INSERT INTO chapters (
        chapter_number, volume_number, title, relative_path,
        source_file_id, word_count, status, canon, timeline_start,
        timeline_end, pov_entity_id, summary,
        created_at, updated_at
      ) VALUES (
        @chapter_number, @volume_number, @title, @relative_path,
        @source_file_id, @word_count, @status, @canon, @timeline_start,
        @timeline_end, @pov_entity_id, @summary,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return this.getById(info.lastInsertRowid);
  }

  /**
   * Upsert a chapter record
   * @param {object} data
   * @returns {object}
   */
  upsert(data) {
    if (data.id) {
      const record = { ...this._normalizeRecord(data), id: Number(data.id) };
      const sql = `
        UPDATE chapters SET
          chapter_number = @chapter_number,
          volume_number = @volume_number,
          title = @title,
          relative_path = @relative_path,
          source_file_id = @source_file_id,
          word_count = @word_count,
          status = @status,
          canon = @canon,
          timeline_start = @timeline_start,
          timeline_end = @timeline_end,
          pov_entity_id = @pov_entity_id,
          summary = @summary,
          updated_at = datetime('now', 'localtime')
        WHERE id = @id
      `;
      this.db.prepare(sql).run(record);
      return this.getById(record.id);
    }

    let existing = null;
    if (data.source_file_id) {
      existing = this.db.prepare(
        'SELECT id FROM chapters WHERE source_file_id = ?'
      ).get(Number(data.source_file_id));
    }

    if (!existing && data.volume_number !== undefined && data.chapter_number !== undefined) {
      existing = this.db.prepare(
        'SELECT id FROM chapters WHERE volume_number = ? AND chapter_number = ?'
      ).get(Number(data.volume_number), Number(data.chapter_number));
    }

    if (!existing && data.relative_path) {
      existing = this.db.prepare(
        'SELECT id FROM chapters WHERE relative_path = ?'
      ).get(data.relative_path);
    }

    if (existing) {
      return this.upsert({ ...data, id: existing.id });
    }

    return this.insert(data);
  }

  /**
   * Batch upsert chapters
   * @param {Array<object>} chapters
   * @returns {number}
   */
  batchUpsert(chapters) {
    if (!Array.isArray(chapters) || chapters.length === 0) {
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

    return tx(chapters);
  }

  /**
   * Retrieve chapter by ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT c.*, e.canonical_name AS pov_entity_name, sf.file_name AS source_file_name
      FROM chapters c
      LEFT JOIN entities e ON c.pov_entity_id = e.id
      LEFT JOIN source_files sf ON c.source_file_id = sf.id
      WHERE c.id = ?
    `);
    return stmt.get(Number(id)) || null;
  }

  /**
   * Retrieve chapter by volume and chapter number
   * @param {number} volumeNumber
   * @param {number} chapterNumber
   * @returns {object|null}
   */
  getByVolumeAndChapter(volumeNumber, chapterNumber) {
    const stmt = this.db.prepare(`
      SELECT c.*, e.canonical_name AS pov_entity_name, sf.file_name AS source_file_name
      FROM chapters c
      LEFT JOIN entities e ON c.pov_entity_id = e.id
      LEFT JOIN source_files sf ON c.source_file_id = sf.id
      WHERE c.volume_number = ? AND c.chapter_number = ?
    `);
    return stmt.get(Number(volumeNumber), Number(chapterNumber)) || null;
  }

  /**
   * Retrieve chapter by source_file_id
   * @param {number} sourceFileId
   * @returns {object|null}
   */
  getBySourceFileId(sourceFileId) {
    const stmt = this.db.prepare(`
      SELECT c.*, e.canonical_name AS pov_entity_name, sf.file_name AS source_file_name
      FROM chapters c
      LEFT JOIN entities e ON c.pov_entity_id = e.id
      LEFT JOIN source_files sf ON c.source_file_id = sf.id
      WHERE c.source_file_id = ?
    `);
    return stmt.get(Number(sourceFileId)) || null;
  }

  /**
   * Query chapters with filters
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.volume_number !== undefined) {
      clauses.push('c.volume_number = @volume_number');
      params.volume_number = Number(filter.volume_number);
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        clauses.push(`c.status IN (${filter.status.map((_, i) => `@status_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`status_${i}`] = s; });
      } else {
        clauses.push('c.status = @status');
        params.status = filter.status;
      }
    }

    if (filter.pov_entity_id) {
      clauses.push('c.pov_entity_id = @pov_entity_id');
      params.pov_entity_id = Number(filter.pov_entity_id);
    }

    if (filter.source_file_id) {
      clauses.push('c.source_file_id = @source_file_id');
      params.source_file_id = Number(filter.source_file_id);
    }

    if (filter.query || filter.keyword || filter.search) {
      const kw = filter.query || filter.keyword || filter.search;
      clauses.push('(c.title LIKE @kw OR c.summary LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const validSortColumns = new Set(['id', 'chapter_number', 'volume_number', 'word_count', 'created_at']);
    const orderBy = validSortColumns.has(filter.orderBy) ? `c.${filter.orderBy}` : 'c.volume_number ASC, c.chapter_number ASC';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : '';

    let sql = `
      SELECT c.*, e.canonical_name AS pov_entity_name, sf.file_name AS source_file_name
      FROM chapters c
      LEFT JOIN entities e ON c.pov_entity_id = e.id
      LEFT JOIN source_files sf ON c.source_file_id = sf.id
      ${whereClause}
      ORDER BY ${orderBy} ${direction}
    `;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    return this.db.prepare(sql).all(params);
  }

  /**
   * Count chapters matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.volume_number !== undefined) {
      clauses.push('volume_number = @volume_number');
      params.volume_number = Number(filter.volume_number);
    }
    if (filter.status) {
      clauses.push('status = @status');
      params.status = filter.status;
    }
    if (filter.source_file_id) {
      clauses.push('source_file_id = @source_file_id');
      params.source_file_id = Number(filter.source_file_id);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM chapters ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Delete chapter by ID
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM chapters WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete chapters by source file ID
   * @param {number} sourceFileId
   * @returns {number}
   */
  deleteBySourceFileId(sourceFileId) {
    const stmt = this.db.prepare('DELETE FROM chapters WHERE source_file_id = ?');
    const info = stmt.run(Number(sourceFileId));
    return info.changes;
  }
}

module.exports = ChapterRepo;
