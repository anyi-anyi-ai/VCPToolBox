/**
 * @file DraftVersionRepo.js
 * @description Typed CRUD repository for draft_versions table
 * @module db/repositories/DraftVersionRepo
 */
'use strict';

class DraftVersionRepo {
  constructor(db) {
    if (!db) throw new Error('Database instance is required for DraftVersionRepo');
    this.db = db;
  }

  insert(data) {
    const sql = 'INSERT INTO draft_versions (' +
      'draft_version_id, chapter_id, version_number, full_content, ' +
      'beats_snapshot_json, word_count, style_profile, integrity_status, ' +
      'created_by, parent_version_id) VALUES (' +
      '@draft_version_id, @chapter_id, @version_number, @full_content, ' +
      '@beats_snapshot_json, @word_count, @style_profile, @integrity_status, ' +
      '@created_by, @parent_version_id)';
    const stmt = this.db.prepare(sql);
    stmt.run({
      draft_version_id: data.draft_version_id || data.draftVersionId,
      chapter_id: String(data.chapter_id || data.chapterId),
      version_number: Number(data.version_number !== undefined ? data.version_number : data.versionNumber) || 1,
      full_content: data.full_content || data.fullContent || '',
      beats_snapshot_json: typeof data.beats_snapshot_json === 'string' ? data.beats_snapshot_json : JSON.stringify(data.beats_snapshot || []),
      word_count: Number(data.word_count || (data.full_content ? data.full_content.length : 0)),
      style_profile: data.style_profile || data.styleProfile || 'standard',
      integrity_status: data.integrity_status || data.integrityStatus || 'pending',
      created_by: data.created_by || data.createdBy || 'agent',
      parent_version_id: data.parent_version_id || data.parentVersionId || null
    });
    return this.findByVersionId(data.draft_version_id || data.draftVersionId);
  }

  findByVersionId(draftVersionId) {
    return this.db.prepare('SELECT * FROM draft_versions WHERE draft_version_id = ?').get(draftVersionId) || null;
  }

  findByChapterId(chapterId) {
    return this.db.prepare('SELECT * FROM draft_versions WHERE chapter_id = ? ORDER BY version_number DESC').all(String(chapterId));
  }

  getLatestVersion(chapterId) {
    return this.db.prepare('SELECT * FROM draft_versions WHERE chapter_id = ? ORDER BY version_number DESC LIMIT 1').get(String(chapterId)) || null;
  }

  updateIntegrityStatus(draftVersionId, status) {
    return this.db.prepare('UPDATE draft_versions SET integrity_status = ? WHERE draft_version_id = ?').run(status, draftVersionId);
  }
}
module.exports = DraftVersionRepo;