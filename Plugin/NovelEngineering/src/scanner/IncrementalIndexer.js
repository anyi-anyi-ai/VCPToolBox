/**
 * @file IncrementalIndexer.js
 * @description Two-stage mtime/size + SHA-256 change detection and atomic SQLite incremental indexer
 * @module scanner/IncrementalIndexer
 * @license MIT
 */

'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const DirectoryScanner = require('./DirectoryScanner');
const FrontmatterParser = require('./FrontmatterParser');
const FileClassifier = require('./FileClassifier');

class IncrementalIndexer {
  /**
   * @param {import('../db/DatabaseManager')|object} dbManagerOrConfig - Initialized DatabaseManager instance or config object
   * @param {object} [options={}]
   * @param {number} [options.concurrency=16] - Scan concurrency
   * @param {string} [options.deleteMode='soft'] - 'soft' (mark deleted) or 'hard' (delete rows)
   */
  constructor(dbManagerOrConfig, options = {}) {
    let dbManager = dbManagerOrConfig;
    let opts = options;
    if (dbManagerOrConfig && typeof dbManagerOrConfig === 'object' && dbManagerOrConfig.dbManager) {
      dbManager = dbManagerOrConfig.dbManager;
      opts = dbManagerOrConfig;
      this.vaultPath = dbManagerOrConfig.vaultPath || null;
    }
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required for IncrementalIndexer.');
    }
    this.dbManager = dbManager;
    this.concurrency = Math.max(1, parseInt(opts.concurrency, 10) || 16);
    this.deleteMode = opts.deleteMode === 'hard' ? 'hard' : 'soft';
    this.vaultPath = this.vaultPath || opts.vaultPath || null;
  }

  /**
   * Static sync helper
   * @param {string} vaultPath
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @returns {Promise<object>}
   */
  static async sync(vaultPath, dbManager, options = {}) {
    const indexer = new IncrementalIndexer(dbManager, options);
    return indexer.sync(vaultPath, options);
  }

  /**
   * Performs an incremental sync of the vault against the database
   * @param {string} [vaultPath] - Absolute or relative path to vault
   * @param {object} [options={}]
   * @returns {Promise<object>} Sync summary statistics
   */
  async sync(vaultPath, options = {}) {
    let targetVault = vaultPath;
    let opts = options;
    if (typeof vaultPath === 'object' && vaultPath !== null) {
      opts = vaultPath;
      targetVault = opts.vaultPath || this.vaultPath;
    } else if (!targetVault) {
      targetVault = this.vaultPath || opts.vaultPath;
    }
    if (!targetVault) {
      throw new Error('vaultPath is required for IncrementalIndexer.sync()');
    }

    const startTime = Date.now();
    const scanStartTimeStr = new Date(startTime).toISOString();
    const resolvedVault = path.resolve(targetVault);

    const scanSessionId = options.scanSessionId || `scan_${startTime}_${crypto.randomBytes(4).toString('hex')}`;
    const scanner = new DirectoryScanner({
      concurrency: this.concurrency,
      ...(options.scannerOptions || {})
    });

    // 1. Collect existing file map from SQLite
    const existingFileRows = this.dbManager.sourceFiles.getAllRelativePaths();
    const existingMap = new Map();
    for (const row of existingFileRows) {
      existingMap.set(row.relative_path, row);
    }

    const seenPaths = new Set();
    const seenEntitiesInSync = new Set();
    const actions = []; // list of items to process inside transaction

    let totalFilesScanned = 0;
    let filesAdded = 0;
    let filesUpdated = 0;
    let filesUnchanged = 0;
    let filesDeleted = 0;
    let totalEntitiesExtracted = 0;
    let totalTimelineEvents = 0;
    let totalChapters = 0;
    let totalForeshadowing = 0;

    // 2. Discover files via streaming DirectoryScanner
    const discoveredFiles = await scanner.scanAll(resolvedVault);
    totalFilesScanned = discoveredFiles.length;

    const nowIso = new Date().toISOString();

    // 3. Process each discovered file with 2-Stage Change Detection
    for (const entry of discoveredFiles) {
      const relPath = entry.relativePath;
      seenPaths.add(relPath);
      const cached = existingMap.get(relPath);

      // --- Stage 1: Fast mtime + size check ---
      if (
        cached &&
        cached.status !== 'deleted' &&
        cached.mtime_ms === entry.mtimeMs &&
        cached.size_bytes === entry.size
      ) {
        // Fast match: Content is unchanged, skip disk read & hashing!
        filesUnchanged++;
        actions.push({
          type: 'touch_scan',
          id: cached.id,
          relativePath: relPath,
          lastScannedAt: nowIso
        });
        continue;
      }

      // --- Stage 2: Content Hash check ---
      let fileBuffer;
      try {
        fileBuffer = await fsp.readFile(entry.absolutePath);
      } catch (readErr) {
        // File might have been removed or locked, skip
        continue;
      }

      const sha256Hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      if (
        cached &&
        cached.status !== 'deleted' &&
        cached.sha256_hash === sha256Hash
      ) {
        // Hash match: Content is identical (only mtime was touched)
        filesUnchanged++;
        actions.push({
          type: 'touch_mtime',
          id: cached.id,
          relativePath: relPath,
          mtimeMs: entry.mtimeMs,
          sizeBytes: entry.size,
          lastScannedAt: nowIso
        });
        continue;
      }

      // --- Stage 2 Mismatch / New File: Full parse and classification ---
      const rawContent = fileBuffer.toString('utf8');
      const classification = FileClassifier.classify({
        relativePath: relPath,
        absolutePath: entry.absolutePath,
        fileName: entry.fileName,
        fileSize: entry.size,
        rawContent
      });

      const fileRecord = {
        file_path: entry.absolutePath,
        relative_path: relPath,
        file_name: entry.fileName,
        extension: entry.extension,
        size_bytes: entry.size,
        mtime_ms: entry.mtimeMs,
        sha256_hash: sha256Hash,
        source_category: classification.sourceCategory,
        status: classification.status,
        review_status: classification.reviewStatus,
        has_frontmatter: classification.hasFrontmatter ? 1 : 0,
        frontmatter_raw: classification.rawFrontmatter,
        frontmatter_json: classification.frontmatter,
        line_count: classification.lineCount,
        word_count: classification.wordCount,
        is_placeholder: classification.isPlaceholder ? 1 : 0,
        placeholder_reason: classification.placeholderReason,
        scan_version: 1,
        last_scanned_at: nowIso
      };

      if (cached) {
        filesUpdated++;
        actions.push({
          type: 'update_file',
          id: cached.id,
          fileRecord,
          classification
        });
      } else {
        filesAdded++;
        actions.push({
          type: 'insert_file',
          fileRecord,
          classification
        });
      }

      if (classification.entity) {
        const entId = classification.entity.entity_id;
        if (classification.entity.isDirectoryAnchor) {
          if (!seenEntitiesInSync.has(entId)) {
            seenEntitiesInSync.add(entId);
            totalEntitiesExtracted++;
          }
        } else {
          totalEntitiesExtracted++;
        }
      }
      if (classification.timelineEvent) totalTimelineEvents++;
      if (classification.chapter) totalChapters++;
      if (classification.foreshadowing) totalForeshadowing++;
    }

    // 4. Deletion Reconciliation (Find removed files)
    const deletedRelPaths = [];
    for (const [existingRelPath, cachedRecord] of existingMap.entries()) {
      if (!seenPaths.has(existingRelPath)) {
        deletedRelPaths.push(existingRelPath);
      }
    }
    filesDeleted = deletedRelPaths.length;

    // 5. Execute all updates in an atomic SQLite Transaction
    const executeSyncTransaction = this.dbManager.transaction(() => {
      // Touch unchanged files
      const touchScanStmt = this.dbManager.prepare(
        "UPDATE source_files SET last_scanned_at = ? WHERE id = ?"
      );
      const touchMtimeStmt = this.dbManager.prepare(
        "UPDATE source_files SET mtime_ms = ?, size_bytes = ?, last_scanned_at = ?, updated_at = datetime('now', 'localtime') WHERE id = ?"
      );

      for (const action of actions) {
        if (action.type === 'touch_scan') {
          touchScanStmt.run(action.lastScannedAt, action.id);
        } else if (action.type === 'touch_mtime') {
          touchMtimeStmt.run(action.mtimeMs, action.sizeBytes, action.lastScannedAt, action.id);
        } else if (action.type === 'insert_file' || action.type === 'update_file') {
          // Upsert source file
          const savedFile = this.dbManager.sourceFiles.upsert(action.fileRecord);
          const sourceFileId = savedFile.id;
          const { classification } = action;

          // Clear previous domain models for this source file to prevent stale state
          this.dbManager.timeline.deleteBySourceFileId(sourceFileId);
          this.dbManager.chapters.deleteBySourceFileId(sourceFileId);
          this.dbManager.foreshadowing.deleteBySetupFileId(sourceFileId);
          this.dbManager.entities.deleteMentionsBySourceFile(sourceFileId);
          this.dbManager.entities.deleteAliasesBySourceFile(sourceFileId);

          // Save extracted Entity
          if (classification.entity) {
            const ent = classification.entity;
            const facetRole = ent.facetRole || 'definition';
            const isDirectoryAnchor = !!ent.isDirectoryAnchor;

            let canonicalEntity = null;

            if (isDirectoryAnchor) {
              // Multi-file directory aggregation: lookup existing canonical entity by entity_id
              canonicalEntity = this.dbManager.entities.getSingleByEntityId(ent.entity_id);

              if (!canonicalEntity) {
                // First file under this anchor: insert canonical entity
                canonicalEntity = this.dbManager.entities.insert({
                  entity_id: ent.entity_id,
                  canonical_name: ent.canonical_name || ent.entity_id,
                  entity_type: ent.entity_type || 'planet',
                  category: ent.category,
                  status: ent.status,
                  review_status: ent.review_status,
                  summary: ent.summary,
                  description: ent.description,
                  attributes_json: ent.attributes_json,
                  source_file_id: sourceFileId,
                  line_number: ent.line_number || 1
                }, classification.aliases);
              } else {
                // Existing canonical entity: if this file is 'definition', update canonical fields
                if (facetRole === 'definition') {
                  this.dbManager.entities.update(canonicalEntity.id, {
                    canonical_name: ent.canonical_name || canonicalEntity.canonical_name,
                    source_file_id: sourceFileId,
                    summary: ent.summary || canonicalEntity.summary,
                    description: ent.description || canonicalEntity.description,
                    status: ent.status,
                    review_status: ent.review_status,
                    attributes_json: ent.attributes_json
                  });
                }
                // Register aliases attached to this specific constituent file
                if (classification.aliases && classification.aliases.length > 0) {
                  this.dbManager.entities.batchAddAliases(
                    classification.aliases.map((a) => ({
                      entity_id: canonicalEntity.id,
                      alias_name: typeof a === 'string' ? a : (a.alias_name || a.name),
                      alias_type: typeof a === 'object' ? (a.alias_type || 'nickname') : 'nickname',
                      is_primary: typeof a === 'object' && a.is_primary ? 1 : 0,
                      source_file_id: sourceFileId
                    }))
                  );
                }
              }
            } else {
              // Standalone entity file
              this.dbManager.entities.deleteBySourceFileId(sourceFileId);
              let existingEntity = this.dbManager.entities.getBySourceFileIdAndEntityId(sourceFileId, ent.entity_id);
              if (!existingEntity) {
                canonicalEntity = this.dbManager.entities.insert({
                  ...ent,
                  source_file_id: sourceFileId
                }, classification.aliases);
              } else {
                canonicalEntity = this.dbManager.entities.upsert({
                  ...ent,
                  id: existingEntity.id,
                  source_file_id: sourceFileId
                }, classification.aliases);
              }
            }

            // Register M:N Linkage in file_entities with Facet Role
            if (canonicalEntity && canonicalEntity.id) {
              this.dbManager.entities.addMention({
                source_file_id: sourceFileId,
                entity_id: canonicalEntity.id,
                mention_type: facetRole,
                mention_count: 1
              });
            }
          }

          // Save extracted Timeline Event
          if (classification.timelineEvent) {
            const tlData = {
              ...classification.timelineEvent,
              source_file_id: sourceFileId
            };
            this.dbManager.timeline.insert(tlData);
          }

          // Save extracted Chapter
          if (classification.chapter) {
            const chData = {
              ...classification.chapter,
              source_file_id: sourceFileId
            };
            this.dbManager.chapters.insert(chData);
          }

          // Save extracted Foreshadowing
          if (classification.foreshadowing) {
            const fsData = {
              ...classification.foreshadowing,
              setup_file_id: sourceFileId
            };
            this.dbManager.foreshadowing.insert(fsData);
          }
        }
      }

      // Handle Deletions
      if (deletedRelPaths.length > 0) {
        if (this.deleteMode === 'hard') {
          for (const delPath of deletedRelPaths) {
            this.dbManager.sourceFiles.deleteByRelativePath(delPath);
          }
        } else {
          this.dbManager.sourceFiles.batchSoftDelete(deletedRelPaths);
        }
      }
    });

    executeSyncTransaction();

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const scanEndTimeStr = new Date(endTime).toISOString();

    const summary = {
      scanSessionId,
      vaultRootPath: resolvedVault,
      totalFilesScanned,
      filesAdded,
      filesUpdated,
      filesUnchanged,
      filesDeleted,
      totalEntitiesExtracted,
      totalTimelineEvents,
      totalChapters,
      totalForeshadowing,
      durationMs
    };

    // 6. Record Scan Manifest
    this.dbManager.anomalies.insertManifest({
      scan_session_id: scanSessionId,
      vault_root_path: resolvedVault,
      scan_start_time: scanStartTimeStr,
      scan_end_time: scanEndTimeStr,
      scan_duration_ms: durationMs,
      total_files_scanned: totalFilesScanned,
      files_added: filesAdded,
      files_updated: filesUpdated,
      files_unchanged: filesUnchanged,
      files_deleted: filesDeleted,
      total_entities_extracted: totalEntitiesExtracted,
      total_anomalies_detected: 0,
      manifest_summary_json: summary
    });

    return summary;
  }
}

module.exports = IncrementalIndexer;
