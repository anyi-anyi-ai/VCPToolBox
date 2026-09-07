/**
 * @file LoreSourceRepo.js
 * @description Typed CRUD repository for lore_sources table
 * @module db/repositories/LoreSourceRepo
 */
'use strict';

class LoreSourceRepo {
  constructor(db) {
    if (!db) throw new Error('Database instance is required for LoreSourceRepo');
    this.db = db;
  }

  insert(data) {
    const sql = 'INSERT INTO lore_sources (' +
      'source_id, entity_id, source_type, source_chapter, ' +
      'source_range, confidence, priority, is_active) VALUES (' +
      '@source_id, @entity_id, @source_type, @source_chapter, ' +
      '@source_range, @confidence, @priority, @is_active)';
    const stmt = this.db.prepare(sql);
    stmt.run({
      source_id: data.source_id || data.sourceId,
      entity_id: data.entity_id || data.entityId,
      source_type: data.source_type || data.sourceType || 'canon',
      source_chapter: data.source_chapter || data.sourceChapter || null,
      source_range: data.source_range || data.sourceRange || null,
      confidence: Number(data.confidence !== undefined ? data.confidence : 1.0),
      priority: Number(data.priority !== undefined ? data.priority : 2),
      is_active: data.is_active !== undefined ? Number(data.is_active) : 1
    });
    return this.findBySourceId(data.source_id || data.sourceId);
  }

  findBySourceId(sourceId) {
    return this.db.prepare('SELECT * FROM lore_sources WHERE source_id = ?').get(sourceId) || null;
  }

  findByEntityId(entityId) {
    return this.db.prepare('SELECT * FROM lore_sources WHERE entity_id = ? AND is_active = 1 ORDER BY priority ASC').all(entityId);
  }
}
module.exports = LoreSourceRepo;