/**
 * @file RagExportCommands.js
 * @description Handlers for RAG Manifest & Corpus Export Commands (Phase 3 Milestone 5)
 * @module commands/RagExportCommands
 * @license MIT
 */

'use strict';

const RagCorpusExporter = require('../rag/RagCorpusExporter');

class RagExportCommands {
  /**
   * Command: BuildRagCorpusManifest
   * Builds the manifest.jsonl file for RAG ingestion
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleBuildRagCorpusManifest(params, context) {
    const { dbManager, pathGuard } = context;
    const exporter = new RagCorpusExporter(dbManager, { pathGuard });
    const result = exporter.buildRagCorpusManifest(params);

    const breakdownList = Object.entries(result.categoryBreakdown)
      .map(([cat, count]) => `- \`${cat}\`: ${count} documents`)
      .join('\n');

    const markdown = [
      '### [NovelEngineering] RAG Corpus Manifest Generated',
      `- **Manifest Path**: \`${result.manifestPath}\``,
      `- **Total Documents**: **${result.totalDocuments}**`,
      `- **Estimated Tokens**: ~${result.estimatedTokens.toLocaleString()}`,
      '',
      '#### Category Breakdown',
      breakdownList
    ].join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }

  /**
   * Command: ExportRagSources
   * Exports sanitized Markdown files into canon/ and candidate/ corpora
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleExportRagSources(params, context) {
    const { dbManager, pathGuard } = context;
    const exporter = new RagCorpusExporter(dbManager, { pathGuard });
    const result = exporter.exportRagSources(params);

    const markdown = [
      '### [NovelEngineering] RAG Corpus Export Complete',
      `- **Canon Corpus Directory**: \`${result.canonCorpusDir}\` (${result.canonFilesCount} authoritative documents)`,
      `- **Candidate Corpus Directory**: \`${result.creativeCorpusDir}\` (${result.creativeFilesCount} reference/creative drafts)`,
      `- **Consolidated Manifest**: \`${result.manifestJsonlPath}\``,
      `- **Total Exported Documents**: **${result.totalExportedFiles}**`,
      `- **Estimated Token Volume**: ~${(result.estimatedTokens || 0).toLocaleString()}`,
      `- **Duration**: ${result.durationMs}ms`
    ].join('\n');

    return {
      ...result,
      status: 'success',
      content: markdown,
      details: result
    };
  }
}

module.exports = RagExportCommands;
