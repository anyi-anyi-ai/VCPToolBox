/**
 * @file EntityRelationRepo.js
 * @description Typed CRUD and Graph Traversal Repository for entity_relations Table (Phase 3)
 * @module db/repositories/EntityRelationRepo
 */

'use strict';

class EntityRelationRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for EntityRelationRepo');
    }
    this.db = db;
  }

  /**
   * Normalize relation data object for SQL binding
   * @private
   */
  _normalizeRecord(data) {
    const toJSON = (val) => {
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val || null;
    };

    const sourceEntityId = this.resolveEntityDbId(data.source_entity_id !== undefined ? data.source_entity_id : data.sourceEntityId);
    const targetEntityId = this.resolveEntityDbId(data.target_entity_id !== undefined ? data.target_entity_id : data.targetEntityId);

    return {
      source_entity_id: sourceEntityId,
      target_entity_id: targetEntityId,
      relation_type: String(data.relation_type || data.relationType || 'related_to').toLowerCase().trim(),
      weight: data.weight !== undefined && data.weight !== null ? Number(data.weight) : 1.0,
      confidence: data.confidence !== undefined && data.confidence !== null ? Number(data.confidence) : 1.0,
      bidirectional: data.bidirectional ? 1 : 0,
      description: data.description || null,
      attributes_json: toJSON(data.attributes_json || data.attributes),
      source_file_id: data.source_file_id !== undefined && data.source_file_id !== null ? Number(data.source_file_id) : null
    };
  }

  /**
   * Helper to resolve entity parameter (either numeric DB ID or canonical entity_id string)
   * @param {number|string} entityRef
   * @returns {number|null} entity DB ID
   */
  resolveEntityDbId(entityRef) {
    if (entityRef === null || entityRef === undefined) return null;
    if (typeof entityRef === 'number') {
      return entityRef;
    }
    if (/^\d+$/.test(String(entityRef)) && !isNaN(Number(entityRef))) {
      // Check if it exists as numeric PK first
      const byPk = this.db.prepare('SELECT id FROM entities WHERE id = ?').get(Number(entityRef));
      if (byPk) return byPk.id;
    }
    const row = this.db.prepare('SELECT id FROM entities WHERE entity_id = ? LIMIT 1').get(String(entityRef));
    return row ? row.id : (typeof entityRef === 'number' ? entityRef : null);
  }

  /**
   * Insert a relation record (throws on unique conflict)
   * @param {object} relationData
   * @returns {object} Inserted relation
   */
  createRelation(relationData) {
    return this.insert(relationData);
  }

  /**
   * Insert a relation record
   * @param {object} data
   * @returns {object} Inserted relation
   */
  insert(data) {
    const record = this._normalizeRecord(data);
    if (!record.source_entity_id || !record.target_entity_id) {
      throw new Error('source_entity_id and target_entity_id are required');
    }

    const sql = `
      INSERT INTO entity_relations (
        source_entity_id, target_entity_id, relation_type, weight, confidence,
        bidirectional, description, attributes_json, source_file_id, created_at, updated_at
      ) VALUES (
        @source_entity_id, @target_entity_id, @relation_type, @weight, @confidence,
        @bidirectional, @description, @attributes_json, @source_file_id, datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `;
    const stmt = this.db.prepare(sql);
    const info = stmt.run(record);
    return this.getById(info.lastInsertRowid);
  }

  /**
   * Upsert a relation record by unique constraint (source, target, relation_type)
   * @param {object} data
   * @returns {object}
   */
  upsert(data) {
    const record = this._normalizeRecord(data);
    if (!record.source_entity_id || !record.target_entity_id) {
      throw new Error('source_entity_id and target_entity_id are required');
    }

    const sql = `
      INSERT INTO entity_relations (
        source_entity_id, target_entity_id, relation_type, weight, confidence,
        bidirectional, description, attributes_json, source_file_id, created_at, updated_at
      ) VALUES (
        @source_entity_id, @target_entity_id, @relation_type, @weight, @confidence,
        @bidirectional, @description, @attributes_json, @source_file_id, datetime('now', 'localtime'), datetime('now', 'localtime')
      )
      ON CONFLICT(source_entity_id, target_entity_id, relation_type) DO UPDATE SET
        weight = excluded.weight,
        confidence = excluded.confidence,
        bidirectional = excluded.bidirectional,
        description = COALESCE(excluded.description, entity_relations.description),
        attributes_json = COALESCE(excluded.attributes_json, entity_relations.attributes_json),
        source_file_id = COALESCE(excluded.source_file_id, entity_relations.source_file_id),
        updated_at = datetime('now', 'localtime')
    `;
    const stmt = this.db.prepare(sql);
    stmt.run(record);
    return this.getBySourceAndTarget(record.source_entity_id, record.target_entity_id, record.relation_type);
  }

  /**
   * Batch upsert relations in a transaction
   * @param {Array<object>} relations
   * @returns {number}
   */
  batchUpsert(relations) {
    if (!Array.isArray(relations) || relations.length === 0) return 0;
    const tx = this.db.transaction((items) => {
      let count = 0;
      for (const item of items) {
        this.upsert(item);
        count++;
      }
      return count;
    });
    return tx(relations);
  }

  /**
   * Retrieve relation by primary key ID
   * @param {number} id
   * @returns {object|null}
   */
  getById(id) {
    const sql = `
      SELECT 
        er.*,
        se.entity_id AS source_canon_id,
        se.canonical_name AS source_name,
        se.entity_type AS source_type,
        te.entity_id AS target_canon_id,
        te.canonical_name AS target_name,
        te.entity_type AS target_type,
        sf.relative_path AS source_file_relative_path
      FROM entity_relations er
      JOIN entities se ON er.source_entity_id = se.id
      JOIN entities te ON er.target_entity_id = te.id
      LEFT JOIN source_files sf ON er.source_file_id = sf.id
      WHERE er.id = ?
    `;
    const row = this.db.prepare(sql).get(Number(id));
    return this._hydrateRelation(row);
  }

  /**
   * Find specific relation between two entities
   * @param {number|string} sourceRef
   * @param {number|string} targetRef
   * @param {string} [relationType=null]
   * @returns {object|null}
   */
  findRelation(sourceRef, targetRef, relationType = null) {
    return this.getBySourceAndTarget(sourceRef, targetRef, relationType);
  }

  /**
   * Retrieve relation by source, target, and optional relation type
   * @param {number|string} sourceRef
   * @param {number|string} targetRef
   * @param {string} [relationType=null]
   * @returns {object|null}
   */
  getBySourceAndTarget(sourceRef, targetRef, relationType = null) {
    const sourceId = this.resolveEntityDbId(sourceRef);
    const targetId = this.resolveEntityDbId(targetRef);
    if (!sourceId || !targetId) return null;

    let sql = `
      SELECT 
        er.*,
        se.entity_id AS source_canon_id,
        se.canonical_name AS source_name,
        se.entity_type AS source_type,
        te.entity_id AS target_canon_id,
        te.canonical_name AS target_name,
        te.entity_type AS target_type,
        sf.relative_path AS source_file_relative_path
      FROM entity_relations er
      JOIN entities se ON er.source_entity_id = se.id
      JOIN entities te ON er.target_entity_id = te.id
      LEFT JOIN source_files sf ON er.source_file_id = sf.id
      WHERE er.source_entity_id = ? AND er.target_entity_id = ?
    `;
    const params = [sourceId, targetId];
    if (relationType) {
      sql += ' AND er.relation_type = ?';
      params.push(String(relationType).toLowerCase().trim());
    }
    const row = this.db.prepare(sql).get(...params);
    return this._hydrateRelation(row);
  }

  /**
   * Get relations connected to an entity (outgoing, incoming, or both)
   * @param {number|string} entityRef - entity DB ID or canonical entity_id
   * @param {object} [options={}]
   * @param {'both'|'outgoing'|'incoming'} [options.direction='both']
   * @param {string} [options.relationType]
   * @param {number} [options.minConfidence=0]
   * @returns {Array<object>}
   */
  getRelationsForEntity(entityRef, options = {}) {
    const entityDbId = this.resolveEntityDbId(entityRef);
    if (!entityDbId) return [];

    const direction = options.direction || 'both';
    const clauses = [];
    const params = [];

    if (direction === 'outgoing') {
      clauses.push('er.source_entity_id = ?');
      params.push(entityDbId);
    } else if (direction === 'incoming') {
      clauses.push('er.target_entity_id = ?');
      params.push(entityDbId);
    } else {
      clauses.push('(er.source_entity_id = ? OR er.target_entity_id = ?)');
      params.push(entityDbId, entityDbId);
    }

    if (options.relationType) {
      clauses.push('er.relation_type = ?');
      params.push(String(options.relationType).toLowerCase().trim());
    }

    if (options.minConfidence !== undefined) {
      clauses.push('er.confidence >= ?');
      params.push(Number(options.minConfidence));
    }

    const sql = `
      SELECT 
        er.*,
        se.entity_id AS source_canon_id,
        se.canonical_name AS source_name,
        se.entity_type AS source_type,
        te.entity_id AS target_canon_id,
        te.canonical_name AS target_name,
        te.entity_type AS target_type,
        sf.relative_path AS source_file_relative_path,
        CASE WHEN er.source_entity_id = ${entityDbId} THEN 'OUTGOING' ELSE 'INCOMING' END AS direction
      FROM entity_relations er
      JOIN entities se ON er.source_entity_id = se.id
      JOIN entities te ON er.target_entity_id = te.id
      LEFT JOIN source_files sf ON er.source_file_id = sf.id
      WHERE ${clauses.join(' AND ')}
      ORDER BY er.weight DESC, er.confidence DESC, er.id ASC
    `;

    const rows = this.db.prepare(sql).all(...params);
    return rows.map((r) => this._hydrateRelation(r));
  }

  /**
   * Get outgoing relations for an entity
   * @param {number|string} entityRef
   * @param {string} [relationType=null]
   * @returns {Array<object>}
   */
  getOutgoingRelations(entityRef, relationType = null) {
    return this.getRelationsForEntity(entityRef, { direction: 'outgoing', relationType });
  }

  /**
   * Get incoming relations for an entity
   * @param {number|string} entityRef
   * @param {string} [relationType=null]
   * @returns {Array<object>}
   */
  getIncomingRelations(entityRef, relationType = null) {
    return this.getRelationsForEntity(entityRef, { direction: 'incoming', relationType });
  }

  /**
   * Get relations by relation type
   * @param {string} relationType
   * @returns {Array<object>}
   */
  getRelationsByType(relationType) {
    return this.query({ relation_type: relationType });
  }

  /**
   * Performs BFS neighborhood traversal to extract connected knowledge subgraph
   * @param {Array<number|string>} seedEntityRefs - Array of entity DB IDs or canon entity_ids
   * @param {number} [maxDepth=1] - Hops (1 to 5)
   * @param {object} [options={}]
   * @param {Array<string>} [options.relationTypes]
   * @param {number} [options.minConfidence=0]
   * @returns {{ nodes: Array<object>, edges: Array<object>, seedEntityIds: Array<number>, totalNodes: number, totalEdges: number, maxDepthReached: number }}
   */
  getGraph(seedEntityRefs, maxDepth = 1, options = {}) {
    const rawSeeds = Array.isArray(seedEntityRefs) ? seedEntityRefs : [seedEntityRefs];
    const seedIds = [];
    for (const ref of rawSeeds) {
      const id = this.resolveEntityDbId(ref);
      if (id && !seedIds.includes(id)) seedIds.push(id);
    }

    if (seedIds.length === 0) {
      return { nodes: [], edges: [], seedEntityIds: [], totalNodes: 0, totalEdges: 0, maxDepthReached: 0 };
    }

    const depthLimit = Math.min(5, Math.max(1, parseInt(maxDepth, 10) || 1));
    const visitedNodeIds = new Map(); // id -> depth
    const edgeMap = new Map(); // edge_id -> edge
    let currentLevel = [...seedIds];

    for (const id of seedIds) {
      visitedNodeIds.set(id, 0);
    }

    let actualDepth = 0;

    for (let depth = 1; depth <= depthLimit; depth++) {
      if (currentLevel.length === 0) break;
      actualDepth = depth;
      const nextLevel = [];

      for (const nodeId of currentLevel) {
        const relations = this.getRelationsForEntity(nodeId, {
          direction: 'both',
          minConfidence: options.minConfidence
        });

        for (const rel of relations) {
          if (options.relationTypes && Array.isArray(options.relationTypes)) {
            if (!options.relationTypes.includes(rel.relation_type)) continue;
          }

          edgeMap.set(rel.id, rel);

          const neighborId = rel.source_entity_id === nodeId ? rel.target_entity_id : rel.source_entity_id;
          if (!visitedNodeIds.has(neighborId)) {
            visitedNodeIds.set(neighborId, depth);
            nextLevel.push(neighborId);
          }
        }
      }

      currentLevel = nextLevel;
    }

    // Hydrate all node entities
    const nodeIds = Array.from(visitedNodeIds.keys());
    let nodes = [];
    if (nodeIds.length > 0) {
      const placeholders = nodeIds.map(() => '?').join(', ');
      const nodeRows = this.db.prepare(
        `SELECT id, entity_id, canonical_name, entity_type, category, status, review_status, canon_level, summary
         FROM entities WHERE id IN (${placeholders})`
      ).all(...nodeIds);

      nodes = nodeRows.map((n) => ({
        ...n,
        depth: visitedNodeIds.get(n.id) || 0,
        isSeed: seedIds.includes(n.id)
      }));
    }

    return {
      nodes,
      edges: Array.from(edgeMap.values()),
      seedEntityIds: seedIds,
      totalNodes: nodes.length,
      totalEdges: edgeMap.size,
      maxDepthReached: actualDepth
    };
  }

  /**
   * Find paths between start and target entities
   * @param {number|string} startRef
   * @param {number|string} targetRef
   * @param {number} [maxDepth=3]
   * @returns {Array<Array<object>>} Paths array
   */
  findPaths(startRef, targetRef, maxDepth = 3) {
    const startId = this.resolveEntityDbId(startRef);
    const targetId = this.resolveEntityDbId(targetRef);
    if (!startId || !targetId) return [];
    if (startId === targetId) return [[{ nodeId: startId, edge: null }]];

    const depthLimit = Math.min(5, Math.max(1, maxDepth));
    const paths = [];
    const queue = [[{ nodeId: startId, edge: null }]];

    while (queue.length > 0) {
      const path = queue.shift();
      if (path.length > depthLimit + 1) continue;

      const lastNode = path[path.length - 1].nodeId;
      if (lastNode === targetId) {
        paths.push(path);
        continue;
      }

      const relations = this.getRelationsForEntity(lastNode, { direction: 'both' });
      for (const rel of relations) {
        const nextNode = rel.source_entity_id === lastNode ? rel.target_entity_id : rel.source_entity_id;
        const alreadyVisited = path.some((p) => p.nodeId === nextNode);
        if (!alreadyVisited) {
          queue.push([...path, { nodeId: nextNode, edge: rel }]);
        }
      }
    }

    return paths;
  }

  /**
   * Query relations with filters
   * @param {object} filter
   * @returns {Array<object>}
   */
  query(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.source_entity_id) {
      clauses.push('er.source_entity_id = @source_id');
      params.source_id = Number(this.resolveEntityDbId(filter.source_entity_id));
    }
    if (filter.target_entity_id) {
      clauses.push('er.target_entity_id = @target_id');
      params.target_id = Number(this.resolveEntityDbId(filter.target_entity_id));
    }
    if (filter.relation_type) {
      clauses.push('er.relation_type = @relation_type');
      params.relation_type = String(filter.relation_type).toLowerCase().trim();
    }
    if (filter.min_confidence !== undefined) {
      clauses.push('er.confidence >= @min_confidence');
      params.min_confidence = Number(filter.min_confidence);
    }
    if (filter.source_file_id) {
      clauses.push('er.source_file_id = @source_file_id');
      params.source_file_id = Number(filter.source_file_id);
    }
    if (filter.query || filter.search) {
      const kw = filter.query || filter.search;
      clauses.push('(er.description LIKE @kw OR se.canonical_name LIKE @kw OR te.canonical_name LIKE @kw)');
      params.kw = `%${kw}%`;
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const orderBy = filter.orderBy ? `er.${filter.orderBy}` : 'er.id';
    const direction = filter.orderDirection && String(filter.orderDirection).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let sql = `
      SELECT 
        er.*,
        se.entity_id AS source_canon_id,
        se.canonical_name AS source_name,
        se.entity_type AS source_type,
        te.entity_id AS target_canon_id,
        te.canonical_name AS target_name,
        te.entity_type AS target_type,
        sf.relative_path AS source_file_relative_path
      FROM entity_relations er
      JOIN entities se ON er.source_entity_id = se.id
      JOIN entities te ON er.target_entity_id = te.id
      LEFT JOIN source_files sf ON er.source_file_id = sf.id
      ${whereClause}
      ORDER BY ${orderBy} ${direction}
    `;

    if (filter.limit !== undefined && filter.limit !== null) {
      const limit = Math.max(0, parseInt(filter.limit, 10) || 20);
      const offset = Math.max(0, parseInt(filter.offset, 10) || 0);
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const rows = this.db.prepare(sql).all(params);
    return rows.map((r) => this._hydrateRelation(r));
  }

  /**
   * Count relations matching filter
   * @param {object} filter
   * @returns {number}
   */
  count(filter = {}) {
    const clauses = [];
    const params = {};

    if (filter.source_entity_id) {
      clauses.push('er.source_entity_id = @source_id');
      params.source_id = Number(this.resolveEntityDbId(filter.source_entity_id));
    }
    if (filter.target_entity_id) {
      clauses.push('er.target_entity_id = @target_id');
      params.target_id = Number(this.resolveEntityDbId(filter.target_entity_id));
    }
    if (filter.relation_type) {
      clauses.push('er.relation_type = @relation_type');
      params.relation_type = String(filter.relation_type).toLowerCase().trim();
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT COUNT(*) AS total FROM entity_relations er ${whereClause}`;
    const res = this.db.prepare(sql).get(params);
    return res ? res.total : 0;
  }

  /**
   * Delete relation by primary key ID
   * @param {number} id
   * @returns {boolean}
   */
  deleteById(id) {
    const stmt = this.db.prepare('DELETE FROM entity_relations WHERE id = ?');
    const info = stmt.run(Number(id));
    return info.changes > 0;
  }

  /**
   * Delete directed relation
   * @param {number|string} sourceRef
   * @param {number|string} targetRef
   * @param {string} relationType
   * @returns {boolean}
   */
  deleteRelation(sourceRef, targetRef, relationType) {
    const sourceId = this.resolveEntityDbId(sourceRef);
    const targetId = this.resolveEntityDbId(targetRef);
    if (!sourceId || !targetId) return false;

    const stmt = this.db.prepare(
      'DELETE FROM entity_relations WHERE source_entity_id = ? AND target_entity_id = ? AND relation_type = ?'
    );
    const info = stmt.run(Number(sourceId), Number(targetId), String(relationType).toLowerCase().trim());
    return info.changes > 0;
  }

  /**
   * Delete all relations connected to an entity
   * @param {number|string} entityRef
   * @returns {number}
   */
  deleteByEntityId(entityRef) {
    const entityDbId = this.resolveEntityDbId(entityRef);
    if (!entityDbId) return 0;

    const stmt = this.db.prepare(
      'DELETE FROM entity_relations WHERE source_entity_id = ? OR target_entity_id = ?'
    );
    const info = stmt.run(Number(entityDbId), Number(entityDbId));
    return info.changes;
  }

  /**
   * Delete relations by source file ID
   * @param {number} sourceFileId
   * @returns {number}
   */
  deleteBySourceFileId(sourceFileId) {
    const stmt = this.db.prepare('DELETE FROM entity_relations WHERE source_file_id = ?');
    const info = stmt.run(Number(sourceFileId));
    return info.changes;
  }

  /**
   * Parse JSON columns in relation row
   * @private
   */
  _hydrateRelation(row) {
    if (!row) return null;
    let attributes = {};
    if (row.attributes_json) {
      try {
        attributes = JSON.parse(row.attributes_json);
      } catch (err) {
        console.warn(`[EntityRelationRepo] Failed to parse attributes_json for relation ${row.id}: ${err.message}`);
        attributes = {};
      }
    }
    return {
      ...row,
      attributes
    };
  }
}

module.exports = EntityRelationRepo;
