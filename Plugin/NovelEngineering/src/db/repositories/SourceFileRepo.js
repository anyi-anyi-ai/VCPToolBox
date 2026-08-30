/**
 * @file SourceFileRepo.js
 * @description Typed CRUD repository for source_files table
 * @module db/repositories/SourceFileRepo
 */

'use strict';

class SourceFileRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for SourceFileRepo');
    }
    this.db = db;
  }

  /**
   * Normalize input file data object for SQL binding
   * @private
   */
  _normalizeRecord(data) {
    const frontmatterJson = typeof data.frontmatter_json === 'object' && data.frontmatter_json !== null
      ? JSON.stringify(data.frontmatter_json)
      : (data.frontmatter_json || null);

    return {
      file_path: data.file_path,
      relative_path: data.relative_path,
      file_name: data.file_name || (data.relative_path ? data.relative_path.split('/').pop() : ''),
      extension: data.extension || (data.file_name ? `.${data.file_name.split('.').pop()}` : '.md'),
      size_bytes: Number(data.size_bytes) || 0,
      mtime_ms: Number(data.mtime_ms) || 0,
      sha256_hash: data.sha256_hash || '',
      source_category: data.source_category || data.category || 'unclassified',
      status: data.status || 'active',
      review_status: data.review_status || 'unreviewed',
      has_frontmatter: data.has_frontmatter ? 1 : 0,
      frontmatter_raw: data.frontmatter_raw || null,
      frontmatter_json: frontmatterJson,
      line_count: Number(data.line_count) || 0,
      word_count: Number(data.word_count) || 0,
      is_placeholder: data.is_placeholder ? 1 : 0,
      placeholder_reason: data.placeholder_reason || null,
      scan_version: Number(data.scan_version) || 1,
      last_scanned_at: data.last_scanned_at || new Date().toISOString()
    };
  }

  /**
   * Inserts a new source file record
   * @param {object} data
   * @returns {object} Inserted record with id
   */
  insert(data) {
    const record = this._normalizeRecord(data);
    const sql = `
      INSERT INTO source_files (
        file_path, relative_path, file_name, extension, size_bytes, mtime_ms,
        sha256_hash, source_category, status, review_status, has_frontmatter,
        frontmatter_raw, frontmatter_json, line_count, word_count,
        is_placeholder, placeholder_reason, scan_version, last_scanned_at,
        created_at, updated_at
      ) VALUES (
        @file_path, @relative_path, @file_name, @extension, @size_bytes, @mtime_ms,
        @sha256_hash, @source_category, @status, @review_status, @has_frontmatter,
        @frontmatter_raw, @frontmatter_json, @line_count, @word_count,
        @is_placeholder, @placeholder_reason, @scan_version, @last_scanned_at,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return this.getById(info.lastInsertRowid);
  }

  /**
   * Upserts a source file record by relative_path
   * @param {object} data
   * @returns {object} Upserted record with id
   */
  upsert(data) {
    const record = this._normalizeRecord(data);
    const sql = `
      INSERT INTO source_files (
        file_path, relative_path, file_name, extension, size_bytes, mtime_ms,
        sha256_hash, source_category, status, review_status, has_frontmatter,
        frontmatter_raw, frontmatter_json, line_count, word_count,
        is_placeholder, placeholder_reason, scan_version, last_scanned_at,
        created_at, updated_at
      ) VALUES (
        @file_path, @relative_path, @file_name, @extension, @size_bytes, @mtime_ms,
        @sha256_hash, @source_category, @status, @review_status, @has_frontmatter,
        @frontmatter_raw, @frontmatter_json, @line_count, @word_count,
        @is_placeholder, @placeholder_reason, @scan_version, @last_scanned_at,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
      ON CONFLICT(relative_path) DO UPDATE SET
        file_path = excluded.file_path,
        file_name = excluded.file_name,
        extension = excluded.extension,
        size_bytes = excluded.size_bytes,
        mtime_ms = excluded.mtime_ms,
        sha256_hash = excluded.sha256_hash,
        source_category = excluded.source_category,
        status = excluded.status,
        review_status = excluded.review_status,
        has_frontmatter = excluded.has_frontmatter,
        frontmatter_raw = excluded.frontmatter_raw,
        frontmatter_json = excluded.frontmatter_json,
        line_count = excluded.line_count,
        word_count = excluded.word_count,
        is_placeholder = excluded.is_placeholder,
        placeholder_reason = excluded.placeholder_reason,
        scan_version = excluded.scan_version,
        last_scanned_at = excluded.last_scanned_at,
        updated_at = datetime('now', 'localtime')
    `;
    const stmt = this.db.prepare(sql);
    stmt.run(record);
    return this.getByRelativePath(record.relative_path);
  }

  /**
   * Batch upserts multiple source files in a single transaction
   * @param {Array<object>} files
   * @returns {number} Count of processed items
   */
  batchUpsert(files) {
    if (!Array.isArray(files) || files.length === 0) {
      return 0;
    }

    const sql = `
      INSERT INTO source_files (
        file_path, relative_path, file_name, extension, size_bytes, mtime_ms,
        sha256_hash, source_category, status, review_status, has_frontmatter,
        frontmatter_raw, frontmatter_json, line_count, word_count,
        is_placeholder, placeholder_reason, scan_version, last_scanned_at,
        created_at, updated_at
      ) VALUES (
        @file_path, @relative_path, @file_name, @extension, @size_bytes, @mtime_ms,
        @sha256_hash, @source_category, @status, @review_status, @has_frontmatter,
        @frontmatter_raw, @frontmatter_json, @line_count, @word_count,
        @is_placeholder, @placeholder_reason, @scan_version, @last_scanned_at,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
      ON CONFLICT(relative_path) DO UPDATE SET
        file_path = excluded.file_path,
        file_name = excluded.file_name,
        extension = excluded.extension,
        size_bytes = excluded.size_bytes,
        mtime_ms = excluded.mtime_ms,
        sha256_hash = excluded.sha256_hash,
        source_category = excluded.source_category,
        status = excluded.status,
        review_status = excluded.review_status,
        has_frontmatter = excluded.has_frontmatter,
        frontmatter_raw = excluded.frontmatter_raw,
        frontmatter_json = excluded.frontmatter_json,
        line_count = excluded.line_count,
        word_count = excluded.word_count,
        is_placeholder = excluded.is_placeholder,
        placeholder_reason = excluded.placeholder_reason,
        scan_version = excluded.scan_version,
        last_scanned_at = excluded.last_scanned_at,
        updated_at = datetime('now', 'localtime')
    `;

    const stmt = this.db.prepare(sql);
    const insertMany = this.db.transaction((items) => {
      let count = 0;
      for (const item of items) {
        stmt.run(this._normalizeRecord(item));
        count++;
      }
      return count;
    });

    return insertMany(files);
  }

  /**
   * Retrieve file record by integer primary key
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const stmt = this.db.prepare('SELECT * FROM source_files WHERE id = ?');
    const row = stmt.get(Number(id));
    return row || null;
  }

  /**
   * Retrieve file record by absolute file path
   * @param {string} filePath
   * @returns {object|null}
   */
  getByPath(filePath) {
    const stmt = this.db.prepare('SELECT * FROM source_files WHERE file_path = ?');
    const row = stmt.get(filePath);
    return row || null;
  }

  /**
   * Retrieve file record by relative path
   * @param {string} relativePath
   * @returns {object|null}
   */
  getByRelativePath(relativePath) {
    const stmt = this.db.prepare('SELECT * FROM source_files WHERE relative_path = ?');
    const row = stmt.get(relativePath);
    return row || null;
  }

  /**
   * Polymorphic lookup: accepts numeric ID or string path (relative/absolute)
   * @param {string|number} pathOrId
   * @returns {object|null}
   */
  findByPathOrId(pathOrId) {
    if (pathOrId === null || pathOrId === undefined) {
      return null;
    }

    if (typeof pathOrId === 'number' || (/^\d+$/.test(String(pathOrId)) && !String(pathOrId).includes('/') && !String(pathOrId).includes('\\'))) {
      const byId = this.getById(Number(pathOrId));
      if (byId) return byId;
    }

    const str = String(pathOrId).replace(/\\/g, '/');
    const byRel = this.getByRelativePath(str);
    if (byRel) return byRel;

    return this.getByPath(pathOrId);
  }

  /**
   * Query source files with flexible filters
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const { whereClause, params } = this._buildWhereClause(filter);

    const validSortColumns = new Set([
      'id', 'relative_path', 'file_name', 'size_bytes', 'mtime_ms',
      'source_category', 'status', 'review_status', 'created_at', 'updated_at'
    ]);
    const orderBy = validSortColumns.has(filter.orderBy) ? filter.orderBy : 'id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `SELECT * FROM source_files ${whereClause} ORDER BY ${orderBy} ${direction}`;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const stmt = this.db.prepare(sql);
    return stmt.all(params);
  }

  /**
   * Count source files matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const { whereClause, params } = this._buildWhereClause(filter);
    const sql = `SELECT COUNT(*) AS total FROM source_files ${whereClause}`;
    const stmt = this.db.prepare(sql);
    const res = stmt.get(params);
    return res ? res.total : 0;
  }

  /**
   * Fast retrieval of all relative paths and change-detection hashes
   * @returns {Array<{id: number, relative_path: string, sha256_hash: string, mtime_ms: number, size_bytes: number, status: string}>}
   */
  getAllRelativePaths() {
    const stmt = this.db.prepare(
      'SELECT id, relative_path, sha256_hash, mtime_ms, size_bytes, status FROM source_files'
    );
    return stmt.all();
  }

  /**
   * Delete source file by ID (cascades to child tables)
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM source_files WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete source file by relative path
   * @param {string} relativePath
   * @returns {boolean}
   */
  deleteByRelativePath(relativePath) {
    const stmt = this.db.prepare('DELETE FROM source_files WHERE relative_path = ?');
    const info = stmt.run(relativePath);
    return info.changes > 0;
  }

  /**
   * Soft-deletes a record by setting status = 'deleted'
   * @param {number|string} idOrRelPath
   * @returns {boolean}
   */
  softDelete(idOrRelPath) {
    const isNum = typeof idOrRelPath === 'number' || /^\d+$/.test(String(idOrRelPath));
    const sql = isNum
      ? `UPDATE source_files SET status = 'deleted', updated_at = datetime('now', 'localtime') WHERE id = ?`
      : `UPDATE source_files SET status = 'deleted', updated_at = datetime('now', 'localtime') WHERE relative_path = ?`;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(isNum ? Number(idOrRelPath) : String(idOrRelPath));
    return info.changes > 0;
  }

  /**
   * Batch soft delete multiple relative paths
   * @param {Array<string>} relativePaths
   * @returns {number} Count of soft-deleted items
   */
  batchSoftDelete(relativePaths) {
    if (!Array.isArray(relativePaths) || relativePaths.length === 0) {
      return 0;
    }
    const stmt = this.db.prepare(
      `UPDATE source_files SET status = 'deleted', updated_at = datetime('now', 'localtime') WHERE relative_path = ?`
    );
    const tx = this.db.transaction((paths) => {
      let count = 0;
      for (const p of paths) {
        const info = stmt.run(p);
        count += info.changes;
      }
      return count;
    });
    return tx(relativePaths);
  }

  /**
   * Update placeholder flags for a file
   * @param {number} id
   * @param {boolean} isPlaceholder
   * @param {string|null} reason
   * @returns {boolean}
   */
  updatePlaceholderStatus(id, isPlaceholder, reason = null) {
    const stmt = this.db.prepare(`
      UPDATE source_files
      SET is_placeholder = ?, placeholder_reason = ?, status = CASE WHEN ? = 1 THEN 'placeholder' ELSE status END, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);
    const val = isPlaceholder ? 1 : 0;
    const info = stmt.run(val, reason, val, Number(id));
    return info.changes > 0;
  }

  /**
   * Builds SQL WHERE clause and param map from filter object
   * @private
   */
  _buildWhereClause(filter) {
    const clauses = [];
    const params = {};

    if (filter.source_category || filter.category) {
      const cat = filter.source_category || filter.category;
      if (Array.isArray(cat)) {
        clauses.push(`source_category IN (${cat.map((_, i) => `@cat_${i}`).join(', ')})`);
        cat.forEach((c, i) => { params[`cat_${i}`] = c; });
      } else {
        clauses.push('source_category = @source_category');
        params.source_category = cat;
      }
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

    if (filter.review_status) {
      if (Array.isArray(filter.review_status)) {
        clauses.push(`review_status IN (${filter.review_status.map((_, i) => `@rev_${i}`).join(', ')})`);
        filter.review_status.forEach((r, i) => { params[`rev_${i}`] = r; });
      } else {
        clauses.push('review_status = @review_status');
        params.review_status = filter.review_status;
      }
    }

    if (filter.is_placeholder !== undefined && filter.is_placeholder !== null) {
      clauses.push('is_placeholder = @is_placeholder');
      params.is_placeholder = filter.is_placeholder ? 1 : 0;
    }

    if (filter.min_size !== undefined) {
      clauses.push('size_bytes >= @min_size');
      params.min_size = Number(filter.min_size);
    }

    if (filter.max_size !== undefined) {
      clauses.push('size_bytes <= @max_size');
      params.max_size = Number(filter.max_size);
    }

    if (filter.search || filter.query) {
      clauses.push('(file_name LIKE @search OR relative_path LIKE @search)');
      params.search = `%${filter.search || filter.query}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    return { whereClause, params };
  }
}

module.exports = SourceFileRepo;
