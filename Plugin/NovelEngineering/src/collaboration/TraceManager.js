/**
 * @file TraceManager.js
 * @description Provenance Lineage Retrieval & Live File SHA-256 Integrity Verification Service.
 * @module collaboration/TraceManager
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CollaborationError } = require('../errors');
const { PathGuard } = require('../security/PathGuard');

class TraceManager {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {PathGuard} [options.pathGuard]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new CollaborationError('DatabaseManager is required for TraceManager');
    }
    this.dbManager = dbManager;
    this.pathGuard = options.pathGuard || (dbManager && dbManager.pathGuard) || new PathGuard();
  }

  /**
   * Save context trace lineage to context_traces table
   * @param {object} traceData
   * @returns {object} Saved trace record
   */
  saveTrace(traceData) {
    if (!this.dbManager.contextTraces) {
      throw new CollaborationError('ContextTraceRepo is not mounted in DatabaseManager');
    }
    return this.dbManager.contextTraces.saveTrace(traceData);
  }

  /**
   * Retrieve trace by snapshot ID
   * @param {string} snapshotId
   * @returns {object|null}
   */
  getTraceBySnapshotId(snapshotId) {
    if (!snapshotId) return null;
    return this.dbManager.contextTraces.getBySnapshotId(String(snapshotId).trim());
  }

  /**
   * Retrieve trace by trace ID
   * @param {string} traceId
   * @returns {object|null}
   */
  getTraceById(traceId) {
    if (!traceId) return null;
    return this.dbManager.contextTraces.getByTraceId(String(traceId).trim());
  }

  /**
   * Query traces with flexible filtering
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  queryTraces(filter = {}) {
    return this.dbManager.contextTraces.query(filter);
  }

  /**
   * Verify SHA-256 live file integrity for a given snapshot
   * Checks every referenced file against current disk state
   * @param {string} snapshotId
   * @param {string} [vaultRoot] - Optional root directory for resolving relative paths
   * @returns {object} Integrity verification report
   */
  verifySnapshotIntegrity(snapshotId, vaultRoot = null) {
    const trace = this.getTraceBySnapshotId(snapshotId);
    if (!trace) {
      throw new CollaborationError(
        `Context trace not found for snapshotId: ${snapshotId}`,
        CollaborationError.CODES.TRACE_NOT_FOUND,
        { snapshotId }
      );
    }

    const traceItems = Array.isArray(trace.trace_items) ? trace.trace_items : [];
    let matchedSources = 0;
    let mismatchedSources = 0;
    let missingSources = 0;
    const details = [];

    const rootDir = vaultRoot || this.pathGuard.vaultRoot || process.cwd();

    for (const item of traceItems) {
      const relPath = item.sourceFilePath || item.filePath || item.source_file_path;
      const expectedSha256 = (item.sha256 || item.sha256Hash || '').toLowerCase().trim();
      const sourceFileId = item.sourceFileId || item.source_file_id || null;

      if (!relPath) {
        // Virtual/in-memory item without physical file path
        if (expectedSha256 && expectedSha256.length === 64) {
          matchedSources++;
          details.push({
            sourceFileId,
            sourceFilePath: null,
            status: 'VIRTUAL_VERIFIED',
            expectedSha256,
            liveSha256: expectedSha256
          });
        }
        continue;
      }

      // Resolve candidate path safely
      let fullPath = path.isAbsolute(relPath) ? relPath : path.resolve(rootDir, relPath);

      if (!fs.existsSync(fullPath)) {
        missingSources++;
        details.push({
          sourceFileId,
          sourceFilePath: relPath,
          status: 'FILE_MISSING',
          expectedSha256,
          liveSha256: null,
          error: `File does not exist at resolved path: ${fullPath}`
        });
        continue;
      }

      try {
        const fileContent = fs.readFileSync(fullPath);
        const liveSha256 = crypto.createHash('sha256').update(fileContent).digest('hex').toLowerCase();

        if (liveSha256 === expectedSha256) {
          matchedSources++;
          details.push({
            sourceFileId,
            sourceFilePath: relPath,
            status: 'MATCHED',
            expectedSha256,
            liveSha256
          });
        } else {
          mismatchedSources++;
          details.push({
            sourceFileId,
            sourceFilePath: relPath,
            status: 'HASH_MISMATCH',
            expectedSha256,
            liveSha256,
            error: `SHA-256 mismatch. Recorded: ${expectedSha256}, Live: ${liveSha256}`
          });
        }
      } catch (err) {
        mismatchedSources++;
        details.push({
          sourceFileId,
          sourceFilePath: relPath,
          status: 'READ_ERROR',
          expectedSha256,
          liveSha256: null,
          error: err.message
        });
      }
    }

    const isValid = mismatchedSources === 0 && missingSources === 0;

    return {
      snapshotId,
      traceId: trace.trace_id,
      projectId: trace.project_id,
      chapterId: trace.chapter_id,
      verifiedAt: new Date().toISOString(),
      valid: isValid,
      integrityStatus: isValid ? 'INTACT' : 'COMPROMISED',
      totalSources: traceItems.length,
      matchedSources,
      mismatchedSources,
      missingSources,
      details
    };
  }
}

module.exports = TraceManager;
