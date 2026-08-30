/**
 * @file ForeshadowingRepo.js
 * @description Typed CRUD repository for foreshadowing table with full lifecycle chapter tracking
 * @module db/repositories/ForeshadowingRepo
 */

'use strict';

class ForeshadowingRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for ForeshadowingRepo');
    }
    this.db = db;
  }

  /**
   * Normalize record for SQL binding
   * @private
   */
  _normalizeRecord(data) {
    const toJSON = (val) => {
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        return JSON.stringify(val);
      }
      return val || null;
    };

    const tagsJson = toJSON(data.tags_json || data.tags);
    let rawRel = data.related_entities_json || data.related_entities || data.involved_entities || data.entities;
    if (typeof rawRel === 'string' && !rawRel.startsWith('[')) {
      rawRel = rawRel.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const relatedEntitiesJson = toJSON(rawRel);

    const introducedChap = data.introduced_chapter !== undefined && data.introduced_chapter !== null
      ? String(data.introduced_chapter)
      : (data.setup_chapter !== undefined && data.setup_chapter !== null
        ? String(data.setup_chapter)
        : (data.setup_chapter_id !== undefined && data.setup_chapter_id !== null ? String(data.setup_chapter_id) : null));

    const targetResolveChap = data.target_resolve_chapter !== undefined && data.target_resolve_chapter !== null
      ? String(data.target_resolve_chapter)
      : (data.planned_resolve_chapter !== undefined && data.planned_resolve_chapter !== null
        ? String(data.planned_resolve_chapter)
        : (data.target_chapter !== undefined && data.target_chapter !== null ? String(data.target_chapter) : null));

    const actualResolveChap = data.actual_resolve_chapter !== undefined && data.actual_resolve_chapter !== null
      ? String(data.actual_resolve_chapter)
      : (data.resolution_chapter !== undefined && data.resolution_chapter !== null
        ? String(data.resolution_chapter)
        : (data.resolution_chapter_id !== undefined && data.resolution_chapter_id !== null ? String(data.resolution_chapter_id) : null));

    const setupChapId = data.setup_chapter_id
      ? Number(data.setup_chapter_id)
      : (introducedChap && !isNaN(Number(introducedChap)) ? Number(introducedChap) : null);

    const resChapId = data.resolution_chapter_id
      ? Number(data.resolution_chapter_id)
      : (actualResolveChap && !isNaN(Number(actualResolveChap)) ? Number(actualResolveChap) : null);

    return {
      foreshadow_id: data.foreshadow_id || data.thread_key || data.id_code || data.foreshadowId || '',
      title: data.title || '',
      description: data.description || '',
      setup_file_id: data.setup_file_id !== undefined && data.setup_file_id !== null ? Number(data.setup_file_id) : null,
      setup_chapter_id: setupChapId,
      setup_line: Number(data.setup_line) || 1,
      setup_snippet: data.setup_snippet || null,
      resolution_file_id: data.resolution_file_id ? Number(data.resolution_file_id) : null,
      resolution_chapter_id: resChapId,
      resolution_line: data.resolution_line !== undefined && data.resolution_line !== null ? Number(data.resolution_line) : null,
      resolution_snippet: data.resolution_snippet || data.resolution_notes || null,
      status: data.status || 'open',
      importance_level: data.importance_level || data.importance || 'major',
      tags_json: tagsJson,
      introduced_chapter: introducedChap,
      target_resolve_chapter: targetResolveChap,
      actual_resolve_chapter: actualResolveChap,
      related_entities_json: relatedEntitiesJson,
      resolution_notes: data.resolution_notes || data.resolution_snippet || null
    };
  }

  /**
   * Hydrates row with structured aliases and lifecycle fields
   * @private
   */
  _formatRow(row) {
    if (!row) return null;

    let relatedEntities = [];
    try {
      if (row.related_entities_json) {
        relatedEntities = JSON.parse(row.related_entities_json);
      }
    } catch (_) {}

    let tags = [];
    try {
      if (row.tags_json) {
        tags = JSON.parse(row.tags_json);
      }
    } catch (_) {}

    const introducedChap = row.introduced_chapter !== null
      ? (isNaN(Number(row.introduced_chapter)) ? row.introduced_chapter : Number(row.introduced_chapter))
      : (row.setup_chapter_id !== null ? row.setup_chapter_id : null);

    const targetResolveChap = row.target_resolve_chapter !== null
      ? (isNaN(Number(row.target_resolve_chapter)) ? row.target_resolve_chapter : Number(row.target_resolve_chapter))
      : null;

    const actualResolveChap = row.actual_resolve_chapter !== null
      ? (isNaN(Number(row.actual_resolve_chapter)) ? row.actual_resolve_chapter : Number(row.actual_resolve_chapter))
      : (row.resolution_chapter_id !== null ? row.resolution_chapter_id : null);

    return {
      ...row,
      thread_key: row.foreshadow_id,
      introduced_chapter: introducedChap,
      target_resolve_chapter: targetResolveChap,
      actual_resolve_chapter: actualResolveChap,
      related_entities: relatedEntities,
      tags: tags,
      resolution_notes: row.resolution_notes || row.resolution_snippet || null
    };
  }

  /**
   * Insert a foreshadowing record
   * @param {object} data
   * @returns {object} Inserted record
   */
  insert(data) {
    const record = this._normalizeRecord(data);
    const sql = `
      INSERT INTO foreshadowing (
        foreshadow_id, title, description, setup_file_id, setup_chapter_id,
        setup_line, setup_snippet, resolution_file_id, resolution_chapter_id,
        resolution_line, resolution_snippet, status, importance_level,
        tags_json, introduced_chapter, target_resolve_chapter,
        actual_resolve_chapter, related_entities_json, resolution_notes,
        created_at, updated_at
      ) VALUES (
        @foreshadow_id, @title, @description, @setup_file_id, @setup_chapter_id,
        @setup_line, @setup_snippet, @resolution_file_id, @resolution_chapter_id,
        @resolution_line, @resolution_snippet, @status, @importance_level,
        @tags_json, @introduced_chapter, @target_resolve_chapter,
        @actual_resolve_chapter, @related_entities_json, @resolution_notes,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return this.getById(info.lastInsertRowid);
  }

  /**
   * Upsert a foreshadowing record
   * @param {object} data
   * @returns {object}
   */
  upsert(data) {
    if (data.id) {
      const record = { ...this._normalizeRecord(data), id: Number(data.id) };
      const sql = `
        UPDATE foreshadowing SET
          foreshadow_id = @foreshadow_id,
          title = @title,
          description = @description,
          setup_file_id = @setup_file_id,
          setup_chapter_id = @setup_chapter_id,
          setup_line = @setup_line,
          setup_snippet = @setup_snippet,
          resolution_file_id = @resolution_file_id,
          resolution_chapter_id = @resolution_chapter_id,
          resolution_line = @resolution_line,
          resolution_snippet = @resolution_snippet,
          status = @status,
          importance_level = @importance_level,
          tags_json = @tags_json,
          introduced_chapter = @introduced_chapter,
          target_resolve_chapter = @target_resolve_chapter,
          actual_resolve_chapter = @actual_resolve_chapter,
          related_entities_json = @related_entities_json,
          resolution_notes = @resolution_notes,
          updated_at = datetime('now', 'localtime')
        WHERE id = @id
      `;
      this.db.prepare(sql).run(record);
      return this.getById(record.id);
    }

    let existing = null;
    if (data.setup_file_id && data.foreshadow_id) {
      existing = this.db.prepare(
        'SELECT id FROM foreshadowing WHERE setup_file_id = ? AND foreshadow_id = ?'
      ).get(Number(data.setup_file_id), data.foreshadow_id);
    }

    if (!existing && (data.foreshadow_id || data.thread_key || data.foreshadowId)) {
      const key = data.foreshadow_id || data.thread_key || data.foreshadowId;
      existing = this.db.prepare(
        'SELECT id FROM foreshadowing WHERE foreshadow_id = ?'
      ).get(key);
    }

    if (existing) {
      return this.upsert({ ...data, id: existing.id });
    }

    return this.insert(data);
  }

  /**
   * Batch upsert foreshadowing clues
   * @param {Array<object>} clues
   * @returns {number}
   */
  batchUpsert(clues) {
    if (!Array.isArray(clues) || clues.length === 0) {
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

    return tx(clues);
  }

  /**
   * Retrieve foreshadowing by ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT fs.*,
             sf_setup.relative_path AS setup_file_path,
             c_setup.title AS setup_chapter_title,
             sf_res.relative_path AS resolution_file_path,
             c_res.title AS resolution_chapter_title
      FROM foreshadowing fs
      LEFT JOIN source_files sf_setup ON fs.setup_file_id = sf_setup.id
      LEFT JOIN chapters c_setup ON fs.setup_chapter_id = c_setup.id
      LEFT JOIN source_files sf_res ON fs.resolution_file_id = sf_res.id
      LEFT JOIN chapters c_res ON fs.resolution_chapter_id = c_res.id
      WHERE fs.id = ?
    `);
    const row = stmt.get(Number(id));
    return this._formatRow(row);
  }

  /**
   * Retrieve by canon foreshadow_id (e.g. "FS-001")
   * @param {string} foreshadowId
   * @returns {object|null}
   */
  getByForeshadowId(foreshadowId) {
    const stmt = this.db.prepare(`
      SELECT fs.*,
             sf_setup.relative_path AS setup_file_path,
             c_setup.title AS setup_chapter_title,
             sf_res.relative_path AS resolution_file_path,
             c_res.title AS resolution_chapter_title
      FROM foreshadowing fs
      LEFT JOIN source_files sf_setup ON fs.setup_file_id = sf_setup.id
      LEFT JOIN chapters c_setup ON fs.setup_chapter_id = c_setup.id
      LEFT JOIN source_files sf_res ON fs.resolution_file_id = sf_res.id
      LEFT JOIN chapters c_res ON fs.resolution_chapter_id = c_res.id
      WHERE fs.foreshadow_id = ?
    `);
    const row = stmt.get(foreshadowId);
    return this._formatRow(row);
  }

  /**
   * Query foreshadowing items
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.status && filter.status !== 'all' && filter.status !== 'ALL') {
      if (Array.isArray(filter.status)) {
        clauses.push(`fs.status IN (${filter.status.map((_, i) => `@status_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`status_${i}`] = s; });
      } else {
        clauses.push('fs.status = @status');
        params.status = filter.status;
      }
    }

    if (filter.importance_level) {
      clauses.push('fs.importance_level = @importance_level');
      params.importance_level = filter.importance_level;
    }

    if (filter.setup_file_id) {
      clauses.push('fs.setup_file_id = @setup_file_id');
      params.setup_file_id = Number(filter.setup_file_id);
    }

    if (filter.setup_chapter_id) {
      clauses.push('fs.setup_chapter_id = @setup_chapter_id');
      params.setup_chapter_id = Number(filter.setup_chapter_id);
    }

    if (filter.introduced_chapter !== undefined && filter.introduced_chapter !== null) {
      clauses.push('(fs.introduced_chapter = @introduced_chapter OR fs.setup_chapter_id = @introduced_chapter_num)');
      params.introduced_chapter = String(filter.introduced_chapter);
      params.introduced_chapter_num = Number(filter.introduced_chapter) || 0;
    }

    if (filter.target_resolve_chapter !== undefined && filter.target_resolve_chapter !== null) {
      clauses.push('fs.target_resolve_chapter = @target_resolve_chapter');
      params.target_resolve_chapter = String(filter.target_resolve_chapter);
    }

    if (filter.actual_resolve_chapter !== undefined && filter.actual_resolve_chapter !== null) {
      clauses.push('(fs.actual_resolve_chapter = @actual_resolve_chapter OR fs.resolution_chapter_id = @actual_resolve_chapter_num)');
      params.actual_resolve_chapter = String(filter.actual_resolve_chapter);
      params.actual_resolve_chapter_num = Number(filter.actual_resolve_chapter) || 0;
    }

    if (filter.active_at_chapter !== undefined && filter.active_at_chapter !== null) {
      clauses.push(`(
        fs.status = 'open' AND (
          (fs.introduced_chapter IS NOT NULL AND CAST(fs.introduced_chapter AS REAL) <= @active_at_chapter)
          OR (fs.setup_chapter_id IS NOT NULL AND fs.setup_chapter_id <= @active_at_chapter)
          OR (fs.introduced_chapter IS NULL AND fs.setup_chapter_id IS NULL)
        )
      )`);
      params.active_at_chapter = Number(filter.active_at_chapter);
    }

    if (filter.related_entity || filter.related_entities || filter.entity) {
      const ent = filter.related_entity || filter.related_entities || filter.entity;
      clauses.push('(fs.related_entities_json LIKE @rel_entity OR fs.title LIKE @rel_entity OR fs.description LIKE @rel_entity)');
      params.rel_entity = `%${ent}%`;
    }

    if (filter.resolution_file_id) {
      clauses.push('fs.resolution_file_id = @resolution_file_id');
      params.resolution_file_id = Number(filter.resolution_file_id);
    }

    if (filter.resolution_chapter_id) {
      clauses.push('fs.resolution_chapter_id = @resolution_chapter_id');
      params.resolution_chapter_id = Number(filter.resolution_chapter_id);
    }

    if (filter.query || filter.keyword || filter.search) {
      const kw = filter.query || filter.keyword || filter.search;
      clauses.push('(fs.title LIKE @kw OR fs.description LIKE @kw OR fs.foreshadow_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const validSortColumns = new Set(['id', 'foreshadow_id', 'status', 'importance_level', 'created_at']);
    const orderBy = validSortColumns.has(filter.orderBy) ? `fs.${filter.orderBy}` : 'fs.id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT fs.*,
             sf_setup.relative_path AS setup_file_path,
             c_setup.title AS setup_chapter_title,
             sf_res.relative_path AS resolution_file_path,
             c_res.title AS resolution_chapter_title
      FROM foreshadowing fs
      LEFT JOIN source_files sf_setup ON fs.setup_file_id = sf_setup.id
      LEFT JOIN chapters c_setup ON fs.setup_chapter_id = c_setup.id
      LEFT JOIN source_files sf_res ON fs.resolution_file_id = sf_res.id
      LEFT JOIN chapters c_res ON fs.resolution_chapter_id = c_res.id
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
   * Count foreshadowing items matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.status) {
      clauses.push('status = @status');
      params.status = filter.status;
    }
    if (filter.importance_level) {
      clauses.push('importance_level = @importance_level');
      params.importance_level = filter.importance_level;
    }
    if (filter.query || filter.keyword) {
      const kw = filter.query || filter.keyword;
      clauses.push('(title LIKE @kw OR description LIKE @kw OR foreshadow_id LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM foreshadowing ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Mark a foreshadowing clue as resolved/closed
   * @param {number} id
   * @param {object} resolutionData
   * @returns {object|null}
   */
  resolve(id, resolutionData = {}) {
    const targetStatus = resolutionData.target_status || resolutionData.status || 'closed';
    const actualChap = resolutionData.actual_resolve_chapter !== undefined && resolutionData.actual_resolve_chapter !== null
      ? String(resolutionData.actual_resolve_chapter)
      : (resolutionData.resolution_chapter !== undefined && resolutionData.resolution_chapter !== null
        ? String(resolutionData.resolution_chapter)
        : (resolutionData.resolution_chapter_id !== undefined && resolutionData.resolution_chapter_id !== null ? String(resolutionData.resolution_chapter_id) : null));

    const notes = resolutionData.resolution_notes || resolutionData.resolution_snippet || null;

    const sql = `
      UPDATE foreshadowing SET
        status = @target_status,
        actual_resolve_chapter = COALESCE(@actual_resolve_chapter, actual_resolve_chapter),
        resolution_notes = COALESCE(@resolution_notes, resolution_notes),
        resolution_file_id = @resolution_file_id,
        resolution_chapter_id = @resolution_chapter_id,
        resolution_line = @resolution_line,
        resolution_snippet = @resolution_snippet,
        updated_at = datetime('now', 'localtime')
      WHERE id = @id
    `;
    this.db.prepare(sql).run({
      id: Number(id),
      target_status: targetStatus,
      actual_resolve_chapter: actualChap,
      resolution_notes: notes,
      resolution_file_id: resolutionData.resolution_file_id ? Number(resolutionData.resolution_file_id) : null,
      resolution_chapter_id: resolutionData.resolution_chapter_id ? Number(resolutionData.resolution_chapter_id) : (actualChap && !isNaN(Number(actualChap)) ? Number(actualChap) : null),
      resolution_line: resolutionData.resolution_line !== undefined ? Number(resolutionData.resolution_line) : null,
      resolution_snippet: resolutionData.resolution_snippet || notes || null
    });
    return this.getById(id);
  }

  /**
   * Delete foreshadowing by ID
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM foreshadowing WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete by setup file ID
   * @param {number} setupFileId
   * @returns {number}
   */
  deleteBySetupFileId(setupFileId) {
    const stmt = this.db.prepare('DELETE FROM foreshadowing WHERE setup_file_id = ?');
    const info = stmt.run(Number(setupFileId));
    return info.changes;
  }

  /**
   * ANOM_010: Detect foreshadowing unclosed / status mismatch
   * Closed without resolution reference or pointing to draft chapter
   * @returns {Array<object>}
   */
  findUnclosedStatusMismatches() {
    const sql = `
      SELECT 
        fs.id,
        fs.foreshadow_id,
        fs.title,
        fs.status,
        fs.setup_file_id,
        sf_setup.relative_path AS setup_file_path,
        fs.resolution_file_id,
        fs.resolution_chapter_id,
        c.title AS resolution_chapter_title,
        c.status AS resolution_chapter_status
      FROM foreshadowing fs
      LEFT JOIN source_files sf_setup ON fs.setup_file_id = sf_setup.id
      LEFT JOIN chapters c ON fs.resolution_chapter_id = c.id
      WHERE (fs.status = 'closed' AND (fs.resolution_file_id IS NULL AND fs.resolution_chapter_id IS NULL))
         OR (fs.status = 'closed' AND fs.resolution_chapter_id IS NOT NULL AND c.status = 'draft')
    `;
    return this.db.prepare(sql).all();
  }
}

module.exports = ForeshadowingRepo;
