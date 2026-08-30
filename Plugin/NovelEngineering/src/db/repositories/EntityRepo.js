/**
 * @file EntityRepo.js
 * @description Typed CRUD repository for entities, entity_aliases, and file_entities tables
 * @module db/repositories/EntityRepo
 */

'use strict';

class EntityRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for EntityRepo');
    }
    this.db = db;
  }

  /**
   * Normalize entity data object for SQL binding
   * @private
   */
  _normalizeEntity(data) {
    const attributesJson = typeof data.attributes_json === 'object' && data.attributes_json !== null
      ? JSON.stringify(data.attributes_json)
      : (data.attributes_json || null);

    return {
      entity_id: data.entity_id || data.id_code || '',
      canonical_name: data.canonical_name || data.name || '',
      entity_type: data.entity_type || data.type || 'concept',
      category: data.category || null,
      status: data.status || 'active',
      review_status: data.review_status || 'unreviewed',
      summary: data.summary || null,
      description: data.description || null,
      attributes_json: attributesJson,
      source_file_id: data.source_file_id !== undefined && data.source_file_id !== null ? Number(data.source_file_id) : null,
      line_number: Number(data.line_number) || 1
    };
  }

  /**
   * Inserts an entity with optional aliases
   * @param {object} entityData
   * @param {Array<string|object>} [aliases=[]]
   * @returns {object} Inserted entity with aliases
   */
  insert(entityData, aliases = []) {
    const record = this._normalizeEntity(entityData);
    const sql = `
      INSERT INTO entities (
        entity_id, canonical_name, entity_type, category, status,
        review_status, summary, description, attributes_json,
        source_file_id, line_number, created_at, updated_at
      ) VALUES (
        @entity_id, @canonical_name, @entity_type, @category, @status,
        @review_status, @summary, @description, @attributes_json,
        @source_file_id, @line_number, datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;

    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    const entityDbId = info.lastInsertRowid;

    // Handle embedded or passed aliases
    const allAliases = Array.isArray(aliases) && aliases.length > 0
      ? aliases
      : (Array.isArray(entityData.aliases) ? entityData.aliases : []);

    if (allAliases.length > 0) {
      this.batchAddAliases(
        allAliases.map((a) => {
          if (typeof a === 'string') {
            return {
              entity_id: entityDbId,
              alias_name: a,
              alias_type: 'nickname',
              is_primary: 0,
              source_file_id: record.source_file_id
            };
          }
          return {
            entity_id: entityDbId,
            alias_name: a.alias_name || a.name,
            alias_type: a.alias_type || a.type || 'nickname',
            is_primary: a.is_primary ? 1 : 0,
            source_file_id: a.source_file_id || record.source_file_id
          };
        })
      );
    }

    return this.getById(entityDbId);
  }

  /**
   * Upserts an entity record
   * @param {object} entityData
   * @param {Array<string|object>} [aliases=[]]
   * @returns {object} Upserted entity
   */
  upsert(entityData, aliases = []) {
    if (entityData.id) {
      const record = { ...this._normalizeEntity(entityData), id: Number(entityData.id) };
      const sql = `
        UPDATE entities SET
          entity_id = @entity_id,
          canonical_name = @canonical_name,
          entity_type = @entity_type,
          category = @category,
          status = @status,
          review_status = @review_status,
          summary = @summary,
          description = @description,
          attributes_json = @attributes_json,
          source_file_id = @source_file_id,
          line_number = @line_number,
          updated_at = datetime('now', 'localtime')
        WHERE id = @id
      `;
      this.db.prepare(sql).run(record);

      const allAliases = Array.isArray(aliases) && aliases.length > 0
        ? aliases
        : (Array.isArray(entityData.aliases) ? entityData.aliases : []);
      if (allAliases.length > 0) {
        this.deleteAliasesForEntity(record.id);
        this.batchAddAliases(
          allAliases.map((a) => ({
            entity_id: record.id,
            alias_name: typeof a === 'string' ? a : (a.alias_name || a.name),
            alias_type: typeof a === 'object' ? (a.alias_type || 'nickname') : 'nickname',
            is_primary: typeof a === 'object' && a.is_primary ? 1 : 0,
            source_file_id: typeof a === 'object' && a.source_file_id ? a.source_file_id : record.source_file_id
          }))
        );
      }
      return this.getById(record.id);
    }

    // Check if entity already exists in this source file
    const existing = this.db.prepare(
      'SELECT id FROM entities WHERE source_file_id = ? AND entity_id = ?'
    ).get(Number(entityData.source_file_id), entityData.entity_id);

    if (existing) {
      return this.upsert({ ...entityData, id: existing.id }, aliases);
    }

    return this.insert(entityData, aliases);
  }

  /**
   * Batch upserts multiple entities in a single transaction
   * @param {Array<object>} entities
   * @returns {number} Count of processed entities
   */
  batchUpsert(entities) {
    if (!Array.isArray(entities) || entities.length === 0) {
      return 0;
    }

    const tx = this.db.transaction((items) => {
      let count = 0;
      for (const item of items) {
        this.upsert(item, item.aliases);
        count++;
      }
      return count;
    });

    return tx(entities);
  }

  /**
   * Retrieve entity by database primary key ID
   * @param {number} id
   * @param {boolean} [includeAliases=true]
   * @returns {object|null}
   */
  getById(id, includeAliases = true) {
    const stmt = this.db.prepare('SELECT * FROM entities WHERE id = ?');
    const entity = stmt.get(Number(id));
    if (!entity) return null;

    if (includeAliases) {
      entity.aliases = this.getAliasesForEntity(entity.id);
    }
    return entity;
  }

  /**
   * Retrieve all entities matching canon entity_id (e.g. "PL-001")
   * @param {string} entityId
   * @param {boolean} [includeAliases=true]
   * @returns {Array<object>}
   */
  getByEntityId(entityId, includeAliases = true) {
    const stmt = this.db.prepare('SELECT * FROM entities WHERE entity_id = ?');
    const rows = stmt.all(entityId);
    if (includeAliases && rows.length > 0) {
      for (const row of rows) {
        row.aliases = this.getAliasesForEntity(row.id);
      }
    }
    return rows;
  }

  /**
   * Partial update for an entity row
   * @param {number} id
   * @param {object} updates
   * @returns {object|null}
   */
  update(id, updates = {}) {
    const fields = [];
    const params = { id: Number(id) };

    const allowedFields = [
      'canonical_name', 'entity_type', 'category', 'status',
      'review_status', 'summary', 'description', 'attributes_json',
      'source_file_id', 'line_number'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = @${field}`);
        if (field === 'attributes_json' && typeof updates[field] === 'object' && updates[field] !== null) {
          params[field] = JSON.stringify(updates[field]);
        } else {
          params[field] = updates[field];
        }
      }
    }

    if (fields.length === 0) return this.getById(id);

    fields.push("updated_at = datetime('now', 'localtime')");
    const sql = `UPDATE entities SET ${fields.join(', ')} WHERE id = @id`;
    this.db.prepare(sql).run(params);
    return this.getById(id);
  }

  /**
   * Retrieve single entity matching source_file_id and entity_id
   * @param {number} sourceFileId
   * @param {string} entityId
   * @returns {object|null}
   */
  getBySourceFileIdAndEntityId(sourceFileId, entityId) {
    const stmt = this.db.prepare('SELECT * FROM entities WHERE source_file_id = ? AND entity_id = ?');
    const entity = stmt.get(Number(sourceFileId), String(entityId));
    if (!entity) return null;
    entity.aliases = this.getAliasesForEntity(entity.id);
    return entity;
  }

  /**
   * Retrieve single entity matching entity_id
   * @param {string} entityId
   * @param {boolean} [includeAliases=true]
   * @returns {object|null}
   */
  getSingleByEntityId(entityId, includeAliases = true) {
    const rows = this.getByEntityId(entityId, includeAliases);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Retrieve entities by canonical name
   * @param {string} name
   * @param {string} [entityType=null]
   * @returns {Array<object>}
   */
  getByName(name, entityType = null) {
    let sql = 'SELECT * FROM entities WHERE LOWER(TRIM(canonical_name)) = LOWER(TRIM(?))';
    const params = [name];
    if (entityType) {
      sql += ' AND entity_type = ?';
      params.push(entityType);
    }
    const rows = this.db.prepare(sql).all(...params);
    for (const r of rows) {
      r.aliases = this.getAliasesForEntity(r.id);
    }
    return rows;
  }

  /**
   * Structured query on entities with alias matching, filtering, and pagination
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.entity_id) {
      clauses.push('e.entity_id = @entity_id');
      params.entity_id = filter.entity_id;
    }

    if (filter.entity_type || filter.type) {
      const type = filter.entity_type || filter.type;
      if (Array.isArray(type)) {
        clauses.push(`e.entity_type IN (${type.map((_, i) => `@type_${i}`).join(', ')})`);
        type.forEach((t, i) => { params[`type_${i}`] = t; });
      } else {
        clauses.push('e.entity_type = @entity_type');
        params.entity_type = type;
      }
    }

    if (filter.category) {
      clauses.push('e.category = @category');
      params.category = filter.category;
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        clauses.push(`e.status IN (${filter.status.map((_, i) => `@status_${i}`).join(', ')})`);
        filter.status.forEach((s, i) => { params[`status_${i}`] = s; });
      } else {
        clauses.push('e.status = @status');
        params.status = filter.status;
      }
    }

    if (filter.review_status) {
      if (Array.isArray(filter.review_status)) {
        clauses.push(`e.review_status IN (${filter.review_status.map((_, i) => `@rev_${i}`).join(', ')})`);
        filter.review_status.forEach((r, i) => { params[`rev_${i}`] = r; });
      } else {
        clauses.push('e.review_status = @review_status');
        params.review_status = filter.review_status;
      }
    }

    if (filter.source_file_id) {
      clauses.push('e.source_file_id = @source_file_id');
      params.source_file_id = Number(filter.source_file_id);
    }

    if (filter.query || filter.keyword || filter.name) {
      const kw = filter.query || filter.keyword || filter.name;
      clauses.push(`(
        e.canonical_name LIKE @kw
        OR e.summary LIKE @kw
        OR e.description LIKE @kw
        OR e.entity_id LIKE @kw
        OR EXISTS (
          SELECT 1 FROM entity_aliases ea
          WHERE ea.entity_id = e.id AND ea.alias_name LIKE @kw
        )
      )`);
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const validSortColumns = new Set([
      'id', 'entity_id', 'canonical_name', 'entity_type', 'status', 'review_status', 'created_at', 'updated_at'
    ]);
    const orderBy = validSortColumns.has(filter.orderBy) ? `e.${filter.orderBy}` : 'e.id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT e.*, sf.relative_path AS source_file_relative_path, sf.file_name AS source_file_name
      FROM entities e
      LEFT JOIN source_files sf ON e.source_file_id = sf.id
      ${whereClause}
      ORDER BY ${orderBy} ${direction}
    `;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    const includeAliases = filter.includeAliases !== false;
    if (includeAliases) {
      for (const row of rows) {
        row.aliases = this.getAliasesForEntity(row.id);
      }
    }

    return rows;
  }

  /**
   * Count entities matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.entity_id) {
      clauses.push('e.entity_id = @entity_id');
      params.entity_id = filter.entity_id;
    }
    if (filter.entity_type || filter.type) {
      const type = filter.entity_type || filter.type;
      if (Array.isArray(type)) {
        clauses.push(`e.entity_type IN (${type.map((_, i) => `@type_${i}`).join(', ')})`);
        type.forEach((t, i) => { params[`type_${i}`] = t; });
      } else {
        clauses.push('e.entity_type = @entity_type');
        params.entity_type = type;
      }
    }
    if (filter.status) {
      clauses.push('e.status = @status');
      params.status = filter.status;
    }
    if (filter.review_status) {
      clauses.push('e.review_status = @review_status');
      params.review_status = filter.review_status;
    }
    if (filter.query || filter.keyword) {
      const kw = filter.query || filter.keyword;
      clauses.push(`(e.canonical_name LIKE @kw OR e.summary LIKE @kw OR e.entity_id LIKE @kw)`);
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM entities e ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Delete entity by ID (cascades to aliases and file_entities)
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM entities WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete all entities belonging to a source file
   * @param {number} sourceFileId
   * @returns {number} Count of deleted entities
   */
  deleteBySourceFileId(sourceFileId) {
    const stmt = this.db.prepare('DELETE FROM entities WHERE source_file_id = ?');
    const info = stmt.run(Number(sourceFileId));
    return info.changes;
  }

  // ==========================================================================
  // Alias Operations
  // ==========================================================================

  /**
   * Adds an alias to an entity
   * @param {object} aliasData
   * @returns {object} Inserted alias record
   */
  addAlias(aliasData) {
    const record = {
      entity_id: Number(aliasData.entity_id),
      alias_name: aliasData.alias_name || aliasData.name,
      alias_type: aliasData.alias_type || aliasData.type || 'nickname',
      is_primary: aliasData.is_primary ? 1 : 0,
      source_file_id: aliasData.source_file_id ? Number(aliasData.source_file_id) : null
    };

    const sql = `
      INSERT INTO entity_aliases (
        entity_id, alias_name, alias_type, is_primary, source_file_id, created_at
      ) VALUES (
        @entity_id, @alias_name, @alias_type, @is_primary, @source_file_id, datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return { id: info.lastInsertRowid, ...record };
  }

  /**
   * Batch inserts aliases
   * @param {Array<object>} aliases
   * @returns {number}
   */
  batchAddAliases(aliases) {
    if (!Array.isArray(aliases) || aliases.length === 0) {
      return 0;
    }

    const sql = `
      INSERT INTO entity_aliases (
        entity_id, alias_name, alias_type, is_primary, source_file_id, created_at
      ) VALUES (
        @entity_id, @alias_name, @alias_type, @is_primary, @source_file_id, datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const tx = this.db.transaction((items) => {
      let count = 0;
      for (const item of items) {
        stmt.run({
          entity_id: Number(item.entity_id),
          alias_name: item.alias_name || item.name,
          alias_type: item.alias_type || item.type || 'nickname',
          is_primary: item.is_primary ? 1 : 0,
          source_file_id: item.source_file_id ? Number(item.source_file_id) : null
        });
        count++;
      }
      return count;
    });

    return tx(aliases);
  }

  /**
   * Get all aliases for an entity
   * @param {number} entityDbId
   * @returns {Array<object>}
   */
  getAliasesForEntity(entityDbId) {
    const stmt = this.db.prepare('SELECT * FROM entity_aliases WHERE entity_id = ? ORDER BY is_primary DESC, id ASC');
    return stmt.all(Number(entityDbId));
  }

  /**
   * Find entities matching an alias name
   * @param {string} aliasName
   * @returns {Array<object>}
   */
  findEntitiesByAlias(aliasName) {
    const sql = `
      SELECT e.*, ea.alias_name, ea.alias_type, ea.is_primary
      FROM entity_aliases ea
      JOIN entities e ON ea.entity_id = e.id
      WHERE LOWER(TRIM(ea.alias_name)) = LOWER(TRIM(?))
    `;
    return this.db.prepare(sql).all(aliasName);
  }

  /**
   * Delete alias by primary key ID
   * @param {number} id
   * @returns {boolean}
   */
  deleteAlias(id) {
    const stmt = this.db.prepare('DELETE FROM entity_aliases WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete all aliases for an entity
   * @param {number} entityDbId
   * @returns {number}
   */
  deleteAliasesForEntity(entityDbId) {
    const stmt = this.db.prepare('DELETE FROM entity_aliases WHERE entity_id = ?');
    const info = stmt.run(Number(entityDbId));
    return info.changes;
  }

  /**
   * Deletes all aliases originating from a specific source file
   * @param {number} sourceFileId
   * @returns {number}
   */
  deleteAliasesBySourceFile(sourceFileId) {
    const stmt = this.db.prepare('DELETE FROM entity_aliases WHERE source_file_id = ?');
    const info = stmt.run(Number(sourceFileId));
    return info.changes;
  }

  // ==========================================================================
  // File Entities (Mentions / Cross-References)
  // ==========================================================================

  /**
   * Records or updates an entity mention in a source file
   * @param {object} mentionData
   * @returns {object}
   */
  addMention(mentionData) {
    const occurrences = typeof mentionData.occurrences_json === 'object' && mentionData.occurrences_json !== null
      ? JSON.stringify(mentionData.occurrences_json)
      : (mentionData.occurrences_json || null);

    const record = {
      source_file_id: Number(mentionData.source_file_id),
      entity_id: Number(mentionData.entity_id),
      mention_type: mentionData.mention_type || 'referenced',
      mention_count: Number(mentionData.mention_count) || 1,
      occurrences_json: occurrences
    };

    const sql = `
      INSERT INTO file_entities (
        source_file_id, entity_id, mention_type, mention_count, occurrences_json, created_at
      ) VALUES (
        @source_file_id, @entity_id, @mention_type, @mention_count, @occurrences_json, datetime('now', 'localtime')
      )
      ON CONFLICT(source_file_id, entity_id, mention_type) DO UPDATE SET
        mention_count = excluded.mention_count,
        occurrences_json = excluded.occurrences_json
    `;
    const stmt = this.db.prepare(sql);
    stmt.run(record);
    return record;
  }

  /**
   * Batch adds entity mentions
   * @param {Array<object>} mentions
   * @returns {number}
   */
  batchAddMentions(mentions) {
    if (!Array.isArray(mentions) || mentions.length === 0) {
      return 0;
    }

    const tx = this.db.transaction((items) => {
      let count = 0;
      for (const m of items) {
        this.addMention(m);
        count++;
      }
      return count;
    });

    return tx(mentions);
  }

  /**
   * Retrieves all mentions inside a source file
   * @param {number} sourceFileId
   * @returns {Array<object>}
   */
  getMentionsBySourceFile(sourceFileId) {
    const sql = `
      SELECT fe.*, e.entity_id AS canon_entity_id, e.canonical_name, e.entity_type
      FROM file_entities fe
      JOIN entities e ON fe.entity_id = e.id
      WHERE fe.source_file_id = ?
    `;
    return this.db.prepare(sql).all(Number(sourceFileId));
  }

  /**
   * Retrieves all source files mentioning an entity
   * @param {number} entityId
   * @returns {Array<object>}
   */
  getMentionsByEntity(entityId) {
    const sql = `
      SELECT fe.*, sf.relative_path, sf.file_name, sf.source_category
      FROM file_entities fe
      JOIN source_files sf ON fe.source_file_id = sf.id
      WHERE fe.entity_id = ?
    `;
    return this.db.prepare(sql).all(Number(entityId));
  }

  /**
   * Retrieve all linked source files and facet roles for an entity.
   * @param {number} entityDbId
   * @returns {Array<object>}
   */
  getLinkedFilesByEntity(entityDbId) {
    const sql = `
      SELECT 
        fe.id AS junction_id,
        fe.mention_type AS facet_role,
        fe.mention_type,
        fe.mention_count,
        fe.occurrences_json,
        sf.id AS source_file_id,
        sf.file_path,
        sf.relative_path,
        sf.file_name,
        sf.source_category,
        sf.status,
        sf.review_status,
        sf.sha256_hash,
        sf.size_bytes,
        sf.mtime_ms
      FROM file_entities fe
      JOIN source_files sf ON fe.source_file_id = sf.id
      WHERE fe.entity_id = ?
      ORDER BY 
        CASE fe.mention_type
          WHEN 'definition' THEN 1
          WHEN 'primary_subject' THEN 2
          WHEN 'supplement' THEN 3
          WHEN 'conflict' THEN 4
          ELSE 5
        END ASC,
        sf.relative_path ASC
    `;
    return this.db.prepare(sql).all(Number(entityDbId));
  }

  /**
   * Retrieve an entity with structured facet groupings.
   * @param {number|string} idOrEntityId
   * @returns {object|null}
   */
  getEntityWithFacets(idOrEntityId) {
    let entity = null;
    if (typeof idOrEntityId === 'number' || /^\d+$/.test(String(idOrEntityId))) {
      entity = this.getById(Number(idOrEntityId));
    }
    if (!entity) {
      entity = this.getSingleByEntityId(String(idOrEntityId));
    }
    if (!entity) return null;

    const linkedFiles = this.getLinkedFilesByEntity(entity.id);
    const facets = {
      definition: [],
      supplement: [],
      conflict: [],
      primary_subject: [],
      wikilink: []
    };

    for (const file of linkedFiles) {
      const role = file.facet_role || file.mention_type || 'referenced';
      if (!facets[role]) facets[role] = [];
      facets[role].push(file);
    }

    return {
      ...entity,
      facets,
      linkedFiles
    };
  }

  /**
   * Delete mentions in a source file
   * @param {number} sourceFileId
   * @returns {number}
   */
  deleteMentionsBySourceFile(sourceFileId) {
    const stmt = this.db.prepare('DELETE FROM file_entities WHERE source_file_id = ?');
    const info = stmt.run(Number(sourceFileId));
    return info.changes;
  }

  // ==========================================================================
  // Anomaly & Conflict Detection Helpers
  // ==========================================================================

  /**
   * ANOM_001: Same-Name Planet Different ID
   * @param {string} [entityType='planet']
   * @returns {Array<object>}
   */
  findDuplicateNamesDiffIds(entityType = 'planet') {
    const sql = `
      SELECT 
        LOWER(TRIM(canonical_name)) AS normalized_name,
        canonical_name,
        COUNT(DISTINCT entity_id) AS distinct_id_count,
        GROUP_CONCAT(DISTINCT entity_id) AS conflicting_ids,
        GROUP_CONCAT(DISTINCT source_file_id) AS file_ids
      FROM entities
      WHERE entity_type = ? AND status != 'deprecated'
      GROUP BY LOWER(TRIM(canonical_name))
      HAVING COUNT(DISTINCT entity_id) > 1
    `;
    return this.db.prepare(sql).all(entityType);
  }

  /**
   * ANOM_002: Same-ID Multiple Entities
   * @returns {Array<object>}
   */
  findDuplicateIdsMultiEntities() {
    const sql = `
      SELECT 
        entity_id,
        COUNT(DISTINCT canonical_name) AS distinct_name_count,
        COUNT(id) AS total_occurrences,
        GROUP_CONCAT(DISTINCT canonical_name) AS conflicting_names,
        GROUP_CONCAT(DISTINCT entity_type) AS entity_types,
        GROUP_CONCAT(DISTINCT source_file_id) AS file_ids
      FROM entities
      WHERE status != 'deprecated'
      GROUP BY entity_id
      HAVING COUNT(DISTINCT canonical_name) > 1 OR COUNT(id) > 1
    `;
    return this.db.prepare(sql).all();
  }

  /**
   * ANOM_005: Legacy ID conflicts with active canonical entities
   * @returns {Array<object>}
   */
  findLegacyIdConflicts() {
    const sql = `
      SELECT 
        ea.alias_name AS legacy_id,
        ea.entity_id AS target_db_id,
        e_target.canonical_name AS target_name,
        e_target.entity_id AS target_canonical_id,
        e_conflict.id AS conflicting_db_id,
        e_conflict.entity_id AS conflicting_canonical_id,
        e_conflict.canonical_name AS conflicting_name
      FROM entity_aliases ea
      JOIN entities e_target ON ea.entity_id = e_target.id
      JOIN entities e_conflict ON ea.alias_name = e_conflict.entity_id
      WHERE ea.alias_type = 'legacy_id' 
        AND e_target.id != e_conflict.id
    `;
    return this.db.prepare(sql).all();
  }

  /**
   * ANOM_008: Alias collisions across distinct entities
   * @returns {Array<object>}
   */
  findDuplicateAliases() {
    const sql = `
      SELECT 
        LOWER(TRIM(ea.alias_name)) AS normalized_alias,
        ea.alias_name,
        COUNT(DISTINCT ea.entity_id) AS distinct_entity_count,
        GROUP_CONCAT(DISTINCT e.entity_id || ' (' || e.canonical_name || ')') AS conflicting_entities
      FROM entity_aliases ea
      JOIN entities e ON ea.entity_id = e.id
      GROUP BY LOWER(TRIM(ea.alias_name))
      HAVING COUNT(DISTINCT ea.entity_id) > 1
    `;
    return this.db.prepare(sql).all();
  }
}

module.exports = EntityRepo;
