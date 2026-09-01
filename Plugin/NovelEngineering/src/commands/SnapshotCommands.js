/**
 * @file SnapshotCommands.js
 * @description Handlers for Project Snapshot Creation & Recovery Commands (Phase 3 Milestone 5)
 * @module commands/SnapshotCommands
 * @license MIT
 */

'use strict';

const SnapshotEngine = require('../snapshot/SnapshotEngine');

class SnapshotCommands {
  /**
   * Command: CreateProjectSnapshot
   * Creates an external JSON snapshot archive of all database state in data/snapshots/
   * @param {object} params
   * @param {string} [params.snapshotName]
   * @param {string} [params.description]
   * @param {boolean} [params.includeDrafts=true]
   * @param {boolean} [params.compress=false]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleCreateProjectSnapshot(params, context) {
    const { dbManager, pathGuard } = context;
    const engine = new SnapshotEngine(dbManager, { pathGuard });
    const result = engine.createProjectSnapshot(params);

    const statsList = Object.entries(result.tableStats)
      .map(([tbl, count]) => `- \`${tbl}\`: ${count} records`)
      .join('\n');

    const markdown = [
      '### [NovelEngineering] Project Snapshot Created',
      `- **Snapshot ID**: \`${result.snapshotId}\``,
      `- **Storage Path**: \`${result.snapshotPath}\``,
      `- **Archive Size**: ${(result.fileSizeBytes / 1024).toFixed(2)} KB`,
      `- **Integrity Hash (SHA-256)**: \`${result.integrityHash}\``,
      `- **Timestamp**: \`${result.createdAt}\``,
      '',
      '#### Archived Table Statistics',
      statsList
    ].join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }

  /**
   * Command: RestoreProjectSnapshotPreview
   * Previews restoration diff against current database with integrity verification
   * @param {object} params
   * @param {string} [params.snapshotId]
   * @param {string} [params.snapshotPath]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleRestoreProjectSnapshotPreview(params, context) {
    const { dbManager, pathGuard } = context;
    const engine = new SnapshotEngine(dbManager, { pathGuard });
    const result = engine.restoreProjectSnapshotPreview(params);

    const diff = result.currentVsSnapshotDiff;
    const warningsList = result.warnings && result.warnings.length > 0
      ? `\n> ⚠️ **Warnings**:\n${result.warnings.map(w => `> - ${w}`).join('\n')}\n`
      : '';

    const markdown = [
      '### [NovelEngineering] Project Snapshot Restore Preview (Dry Run)',
      `- **Snapshot ID**: \`${result.snapshotMeta.snapshotId}\``,
      `- **Snapshot Name**: ${result.snapshotMeta.snapshotName}`,
      `- **Created At**: \`${result.snapshotMeta.createdAt}\``,
      `- **Schema Version Match**: ${diff.schemaVersionMatch ? '✅ MATCH' : '⚠️ MISMATCH'} (Live v${diff.currentSchemaVersion} vs Snapshot v${diff.snapshotSchemaVersion})`,
      `- **Integrity Check (SHA-256)**: ${diff.integrityValid ? '✅ VALID' : '❌ CORRUPTED / MISMATCH'}`,
      `- **Files Delta**: Live ${diff.filesDelta.live} ➔ Snapshot ${diff.filesDelta.snapshot} (${diff.filesDelta.diff >= 0 ? '+' : ''}${diff.filesDelta.diff})`,
      `- **Entities Delta**: Live ${diff.entitiesDelta.live} ➔ Snapshot ${diff.entitiesDelta.snapshot} (${diff.entitiesDelta.diff >= 0 ? '+' : ''}${diff.entitiesDelta.diff})`,
      `- **Entity Relations Delta**: Live ${diff.relationsDelta.live} ➔ Snapshot ${diff.relationsDelta.snapshot} (${diff.relationsDelta.diff >= 0 ? '+' : ''}${diff.relationsDelta.diff})`,
      `- **Chapters Delta**: Live ${diff.chaptersDelta.live} ➔ Snapshot ${diff.chaptersDelta.snapshot} (${diff.chaptersDelta.diff >= 0 ? '+' : ''}${diff.chaptersDelta.diff})`,
      `- **Timeline Events Delta**: Live ${diff.timelineDelta.live} ➔ Snapshot ${diff.timelineDelta.snapshot} (${diff.timelineDelta.diff >= 0 ? '+' : ''}${diff.timelineDelta.diff})`,
      `- **Foreshadowing Delta**: Live ${diff.foreshadowingDelta.live} ➔ Snapshot ${diff.foreshadowingDelta.snapshot} (${diff.foreshadowingDelta.diff >= 0 ? '+' : ''}${diff.foreshadowingDelta.diff})`,
      `- **Restoration Safety**: ${result.safeToRestore ? '✅ SAFE TO RESTORE' : '⚠️ RESTORE BLOCKED (VERSION/INTEGRITY ISSUE)'}`,
      warningsList,
      '*To execute this restore, call `RestoreProjectSnapshot` with `confirmationToken: "CONFIRM_RESTORE"`.*'
    ].filter(Boolean).join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }

  /**
   * Command: RestoreProjectSnapshot
   * Restores database state from snapshot with mandatory confirmation token inside an atomic transaction
   * @param {object} params
   * @param {string} [params.snapshotId]
   * @param {string} [params.snapshotPath]
   * @param {string} params.confirmationToken
   * @param {string} [params.operator='system']
   * @param {string} [params.reason]
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleRestoreProjectSnapshot(params, context) {
    const { dbManager, pathGuard } = context;
    const engine = new SnapshotEngine(dbManager, { pathGuard });
    const result = engine.restoreProjectSnapshot(params);

    const tableList = Object.entries(result.restoredTables)
      .map(([tbl, count]) => `- \`${tbl}\`: ${count} records restored`)
      .join('\n');

    const markdown = [
      '### [NovelEngineering] Project Snapshot Restored Successfully',
      `- **Snapshot ID**: \`${result.snapshotId}\``,
      `- **Total Records Restored**: ${result.totalRestoredRecords}`,
      `- **Duration**: ${result.durationMs}ms`,
      `- **Timestamp**: \`${result.timestamp}\``,
      '',
      '#### Restored Tables',
      tableList
    ].join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }
}

module.exports = SnapshotCommands;
