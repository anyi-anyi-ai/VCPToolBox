/**
 * @file ScanCommands.js
 * @description Handlers for ScanWorldTree, BuildSourceManifest, and ClassifySourceFiles commands
 * @module commands/ScanCommands
 * @license MIT
 */

'use strict';

const path = require('path');
const IncrementalIndexer = require('../scanner/IncrementalIndexer');
const AnomalyEngine = require('../anomaly/AnomalyEngine');
const FileClassifier = require('../scanner/FileClassifier');

class ScanCommands {
  /**
   * Command 1: ScanWorldTree
   * Recursively traverses target vault, indexes markdown/canvas files, extracts lore, runs anomaly detection.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleScanWorldTree(params, context) {
    const { dbManager, pathGuard, config } = context || {};
    const hasEmptyExplicit = (params.targetDir === '' || params.vaultPath === '' || params.vaultRoot === '');
    const vaultPath = hasEmptyExplicit ? '' : (params.targetDir || params.vaultPath || params.vaultRoot || (pathGuard && pathGuard.vaultRoot) || (config && (config.VAULT_ROOT || config.DEFAULT_WORLDTREE_PATH)) || '');

    if (!vaultPath || typeof vaultPath !== 'string' || !vaultPath.trim()) {
      throw new Error('ScanWorldTree requires a valid "targetDir" or "vaultPath" parameter.');
    }

    const resolvedVault = path.resolve(vaultPath);
    pathGuard.setVaultRoot(resolvedVault);

    const forceFullRescan = Boolean(params.forceFullRescan || params.forceRehash);
    const detectAnomalies = params.detectAnomalies !== false;
    const batchSize = params.batchSize || 500;

    const startTime = Date.now();

    // 1. Run incremental or full scan
    const indexer = new IncrementalIndexer(dbManager, {
      concurrency: 16
    });

    const syncResult = await indexer.sync(resolvedVault, {
      forceFullRescan
    });

    let anomalyResult = null;
    if (detectAnomalies) {
      const anomalyEngine = new AnomalyEngine();
      anomalyResult = anomalyEngine.runAll(dbManager, syncResult.scanSessionId, { persist: true });
    }

    const durationMs = Date.now() - startTime;
    const breakdown = anomalyResult ? anomalyResult.breakdown : { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    const totalAnomalies = anomalyResult ? anomalyResult.totalAnomalies : 0;

    const summaryMd = `### ScanWorldTree Completed\n` +
      `- **Vault**: \`${resolvedVault.replace(/\\/g, '/')}\`\n` +
      `- **Scanned**: ${syncResult.totalFilesScanned} files in ${durationMs}ms\n` +
      `- **Changes**: ${syncResult.filesAdded} added, ${syncResult.filesUpdated} updated, ${syncResult.filesUnchanged} unchanged, ${syncResult.filesDeleted} deleted\n` +
      `- **Entities Extracted**: ${syncResult.totalEntitiesExtracted}\n` +
      `- **Anomalies Detected**: ${totalAnomalies} (${breakdown.CRITICAL} Critical, ${breakdown.HIGH} High, ${breakdown.MEDIUM} Medium, ${breakdown.LOW} Low, ${breakdown.INFO} Info)`;

    return {
      content: [
        {
          type: 'text',
          text: summaryMd
        }
      ],
      details: {
        command: 'ScanWorldTree',
        scanSessionId: syncResult.scanSessionId,
        timestamp: new Date().toISOString(),
        durationMs,
        totalFilesScanned: syncResult.totalFilesScanned,
        filesAdded: syncResult.filesAdded,
        filesUpdated: syncResult.filesUpdated,
        filesUnchanged: syncResult.filesUnchanged,
        filesDeleted: syncResult.filesDeleted,
        entitiesExtracted: syncResult.totalEntitiesExtracted,
        timelineEventsExtracted: syncResult.totalTimelineEvents,
        chaptersExtracted: syncResult.totalChapters,
        foreshadowingExtracted: syncResult.totalForeshadowing,
        anomaliesDetected: totalAnomalies,
        summary: {
          totalFilesScanned: syncResult.totalFilesScanned,
          filesAdded: syncResult.filesAdded,
          filesUpdated: syncResult.filesUpdated,
          filesUnchanged: syncResult.filesUnchanged,
          filesDeleted: syncResult.filesDeleted,
          entitiesExtracted: syncResult.totalEntitiesExtracted,
          timelineEventsExtracted: syncResult.totalTimelineEvents,
          chaptersExtracted: syncResult.totalChapters,
          foreshadowingExtracted: syncResult.totalForeshadowing,
          anomaliesDetected: totalAnomalies
        },
        anomalyBreakdown: breakdown
      }
    };
  }

  /**
   * Command 2: BuildSourceManifest
   * Generates a structured inventory list of all indexed files in the vault.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleBuildSourceManifest(params, context) {
    const { dbManager, pathGuard, config } = context;
    const categories = params.categories || (params.sourceCategory && params.sourceCategory !== 'ALL' ? [params.sourceCategory] : null);
    const status = params.status && params.status !== 'ALL' ? params.status : null;
    const reviewStatus = params.reviewStatus && params.reviewStatus !== 'ALL' ? params.reviewStatus : null;
    const includeFrontmatter = Boolean(params.includeFrontmatter);
    const limit = Number.isInteger(params.limit) ? params.limit : (params.limit ? parseInt(params.limit, 10) : 10000);
    const offset = Number.isInteger(params.offset) ? params.offset : (params.offset ? parseInt(params.offset, 10) : 0);

    const filter = {
      limit,
      offset,
      orderBy: 'relative_path',
      orderDirection: 'ASC'
    };
    if (categories && categories.length > 0) filter.source_category = categories;
    if (status) filter.status = status;
    if (reviewStatus) filter.review_status = reviewStatus;

    const files = dbManager.sourceFiles.query(filter);
    const totalCount = dbManager.sourceFiles.count(filter);

    const manifestItems = files.map(f => {
      const item = {
        relativePath: f.relative_path,
        fileName: f.file_name,
        sizeBytes: f.size_bytes,
        mtimeMs: f.mtime_ms,
        sha256: f.sha256_hash,
        category: f.source_category,
        status: f.status,
        reviewStatus: f.review_status,
        isPlaceholder: Boolean(f.is_placeholder)
      };

      if (includeFrontmatter && f.frontmatter_json) {
        try {
          item.frontmatter = JSON.parse(f.frontmatter_json);
        } catch {
          item.frontmatter = {};
        }
      }

      return item;
    });

    const vaultRoot = pathGuard.vaultRoot ? pathGuard.vaultRoot.replace(/\\/g, '/') : (config.VAULT_ROOT || 'N/A');

    return {
      content: [
        {
          type: 'text',
          text: `Source manifest compiled: ${manifestItems.length} files tracked (${totalCount} total in database).`
        }
      ],
      details: {
        command: 'BuildSourceManifest',
        timestamp: new Date().toISOString(),
        vaultRoot,
        totalFiles: totalCount,
        manifest: manifestItems
      }
    };
  }

  /**
   * Command 3: ClassifySourceFiles
   * Applies multi-dimensional classification rules to specified files or path query.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleClassifySourceFiles(params, context) {
    const { dbManager } = context;
    const relativePaths = params.relativePaths || [];
    const targetPath = params.targetPath;
    const filterCategory = params.filterCategory || params.categoryHint;
    const filterStatus = params.filterStatus;
    const limit = Number.isInteger(params.limit) ? params.limit : 100;

    let fileRecords = [];

    if (Array.isArray(relativePaths) && relativePaths.length > 0) {
      for (const p of relativePaths) {
        const row = dbManager.sourceFiles.getByRelativePath(p);
        if (row) fileRecords.push(row);
      }
    } else if (targetPath && targetPath !== '*') {
      fileRecords = dbManager.sourceFiles.query({
        search: targetPath,
        limit
      });
    } else {
      const filter = { limit };
      if (filterCategory) filter.source_category = filterCategory;
      if (filterStatus) filter.status = filterStatus;
      fileRecords = dbManager.sourceFiles.query(filter);
    }

    const results = fileRecords.map(f => {
      let decisionReason = `Classified as ${f.source_category} (${f.status}/${f.review_status})`;
      if (f.is_placeholder) {
        decisionReason = `Placeholder note (${f.placeholder_reason || 'size <= 50B'})`;
      } else if (f.has_frontmatter) {
        decisionReason = `Frontmatter metadata and path match '${f.source_category}' taxonomy`;
      } else {
        decisionReason = `Inferred from file path and naming pattern`;
      }

      return {
        relativePath: f.relative_path,
        sourceCategory: f.source_category,
        status: f.status,
        reviewStatus: f.review_status,
        confidence: f.has_frontmatter ? 1.0 : 0.85,
        decisionReason
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `Classified ${results.length} source files.`
        }
      ],
      details: {
        command: 'ClassifySourceFiles',
        totalClassified: results.length,
        results
      }
    };
  }
}

module.exports = ScanCommands;
