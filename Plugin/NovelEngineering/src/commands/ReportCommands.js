/**
 * @file ReportCommands.js
 * @description Handler for ExportImportReport command
 * @module commands/ReportCommands
 * @license MIT
 */

'use strict';

const ReportExporter = require('../report/ReportExporter');

class ReportCommands {
  /**
   * Command 9: ExportImportReport
   * Generates formatted Markdown and structured JSON audit report and exports to disk.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleExportImportReport(params, context) {
    const { dbManager, pathGuard } = context;
    const format = params.format || 'both';
    const outputPath = params.outputPath || 'reports/audit_report.json';
    const scanId = params.scanId || 'latest';
    const includeResolved = Boolean(params.includeResolved);

    const exporter = new ReportExporter({ pathGuard });

    const exportResult = exporter.exportToFile(dbManager, {
      format,
      outputPath,
      scanId,
      includeResolved
    });

    const summaryText = `### Diagnostic Audit Report Generated\n` +
      (exportResult.savedJsonPath ? `- **JSON**: \`${exportResult.savedJsonPath}\`\n` : '') +
      (exportResult.savedMarkdownPath ? `- **Markdown**: \`${exportResult.savedMarkdownPath}\`\n` : '') +
      `- **Total Anomalies**: ${exportResult.statistics.totalAnomalies} detected across ${exportResult.statistics.totalFiles} files.`;

    return {
      content: [
        {
          type: 'text',
          text: summaryText
        }
      ],
      details: {
        command: 'ExportImportReport',
        reportId: exportResult.reportId,
        generatedAt: exportResult.generatedAt,
        savedJsonPath: exportResult.savedJsonPath,
        savedMarkdownPath: exportResult.savedMarkdownPath,
        statistics: exportResult.statistics,
        categoryDistribution: exportResult.categoryDistribution,
        anomalyBreakdown: exportResult.anomalyBreakdown,
        anomalies: exportResult.anomalies.map(a => ({
          ruleId: a.anomaly_rule_id,
          severity: a.severity,
          title: a.title,
          message: a.message,
          affectedFiles: a.affectedFilePaths || []
        }))
      }
    };
  }
}

module.exports = ReportCommands;
