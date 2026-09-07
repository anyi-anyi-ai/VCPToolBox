/**
 * @file StateMutationRepo.js
 * @description Typed CRUD repository for state_mutations table
 * @module db/repositories/StateMutationRepo
 */
'use strict';

class StateMutationRepo {
  constructor(db) {
    if (!db) throw new Error('Database instance is required for StateMutationRepo');
    this.db = db;
  }

  insert(data) {
    const sql = 'INSERT INTO state_mutations (' +
      'mutation_id, chapter_id, draft_version_id, entity_id, mutation_type, ' +
      'field_path, old_value_json, new_value_json, source_text, source_range, ' +
      'confidence, reason, status, applied_at) VALUES (' +
      '@mutation_id, @chapter_id, @draft_version_id, @entity_id, @mutation_type, ' +
      '@field_path, @old_value_json, @new_value_json, @source_text, @source_range, ' +
      '@confidence, @reason, @status, @applied_at)';
    const stmt = this.db.prepare(sql);
    stmt.run({
      mutation_id: data.mutation_id || data.mutationId,
      chapter_id: String(data.chapter_id || data.chapterId),
      draft_version_id: data.draft_version_id || data.draftVersionId,
      entity_id: data.entity_id || data.entityId,
      mutation_type: data.mutation_type || data.mutationType,
      field_path: data.field_path || data.fieldPath,
      old_value_json: typeof (data.old_value_json || data.oldValueJson) === 'string'
        ? (data.old_value_json || data.oldValueJson)
        : JSON.stringify(data.old_value !== undefined ? data.old_value : (data.oldValue !== undefined ? data.oldValue : null)),
      new_value_json: typeof (data.new_value_json || data.newValueJson) === 'string'
        ? (data.new_value_json || data.newValueJson)
        : JSON.stringify(data.new_value !== undefined ? data.new_value : (data.newValue !== undefined ? data.newValue : null)),
      source_text: data.source_text || data.sourceText || '',
      source_range: data.source_range || data.sourceRange || '',
      confidence: Number(data.confidence !== undefined ? data.confidence : 1.0),
      reason: data.reason || '',
      status: data.status || 'pending',
      applied_at: data.applied_at || null
    });
    return this.findByMutationId(data.mutation_id || data.mutationId);
  }

  findByMutationId(mutationId) {
    return this.db.prepare('SELECT * FROM state_mutations WHERE mutation_id = ?').get(mutationId) || null;
  }

  findByDraftVersionId(draftVersionId) {
    return this.db.prepare('SELECT * FROM state_mutations WHERE draft_version_id = ? ORDER BY id ASC').all(draftVersionId);
  }

  findByChapterId(chapterId) {
    return this.db.prepare('SELECT * FROM state_mutations WHERE chapter_id = ? ORDER BY id ASC').all(String(chapterId));
  }

  updateStatus(mutationId, status, appliedAt = null) {
    return this.db.prepare('UPDATE state_mutations SET status = ?, applied_at = ? WHERE mutation_id = ?').run(status, appliedAt, mutationId);
  }
}
module.exports = StateMutationRepo;