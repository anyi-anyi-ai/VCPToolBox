/**
 * @file LoreRAGCommands.js
 * @description Handlers for Two-Stage Hybrid RAG Commands (SearchWorldTree, BuildSummaryIndex, GenerateSummarySkeleton)
 * @module commands/LoreRAGCommands
 * @license MIT
 */

'use strict';

const path = require('path');
const NovelLoreRetriever = require('../rag/NovelLoreRetriever');
const SummaryExtractorEngine = require('../rag/SummaryExtractorEngine');
const { NovelError } = require('../errors');

class LoreRAGCommands {
  /**
   * Command: SearchWorldTree
   * Two-stage search: summary vector/BM25 recall + precise slice extraction
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleSearchWorldTree(params, context) {
    const { config, pathGuard } = context;
    const vaultPath = params.vaultPath || config.VAULT_ROOT || config.DEFAULT_WORLDTREE_PATH;
    if (!vaultPath) {
      throw new NovelError('Vault root path is not configured (VAULT_ROOT).', 'CONFIG_ERROR');
    }

    const retriever = new NovelLoreRetriever({
      vaultPath,
      summaryRelDir: params.summaryRelDir || config.SUMMARY_REL_DIR || "00_总览与索引",
      config
    });

    return await retriever.searchWorldTree(params);
  }

  /**
   * Command: BuildSummaryIndex
   * Scans and updates embedding vectors for summary files with incremental change detection
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleBuildSummaryIndex(params, context) {
    const { config } = context;
    const vaultPath = params.vaultPath || config.VAULT_ROOT || config.DEFAULT_WORLDTREE_PATH;
    if (!vaultPath) {
      throw new NovelError('Vault root path is not configured (VAULT_ROOT).', 'CONFIG_ERROR');
    }

    const retriever = new NovelLoreRetriever({
      vaultPath,
      summaryRelDir: params.summaryRelDir || config.SUMMARY_REL_DIR || "00_总览与索引",
      config
    });

    const result = await retriever.buildSummaryIndex(params);

    const markdown = [
      '### [NovelEngineering] 世界树定位概览向量索引更新完成',
      '- **扫描目录**: `' + (params.summaryRelDir || config.SUMMARY_REL_DIR || "00_总览与索引") + '`',
      '- **概览文件总数**: **' + result.totalFiles + '**',
      '- **新增/更新向量数**: **' + result.indexedCount + '**',
      '- **检测到已过时条目**: **' + result.staleCount + '**',
      '- **向量维度**: `' + (result.dimensions || '未索引') + '`'
    ].join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }

  /**
   * Command: GenerateSummarySkeleton
   * Automatically generates summary skeleton files for Markdown docs in vault (requires safety token)
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGenerateSummarySkeleton(params, context) {
    const { config, pathGuard } = context;
    const vaultPath = params.vaultPath || config.VAULT_ROOT || config.DEFAULT_WORLDTREE_PATH;
    if (!vaultPath) {
      throw new NovelError('Vault root path is not configured (VAULT_ROOT).', 'CONFIG_ERROR');
    }

    const extractor = new SummaryExtractorEngine({
      vaultPath,
      summaryRelDir: params.summaryRelDir || config.SUMMARY_REL_DIR || "00_总览与索引",
      pathGuard
    });

    const result = extractor.generateSummarySkeletons(params);

    const markdown = [
      '### [NovelEngineering] 世界树定位概览骨架生成完成',
      '- **已生成概览骨架数**: **' + result.totalCreated + '**',
      '- **已跳过（已存在）**: **' + result.totalSkipped + '**',
      '- **错误数**: **' + result.errorsCount + '**',
      result.totalCreated > 0 ? '- **存放目录**: `' + (params.summaryRelDir || "00_总览与索引") + '`' : ''
    ].filter(Boolean).join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }
}

module.exports = LoreRAGCommands;
