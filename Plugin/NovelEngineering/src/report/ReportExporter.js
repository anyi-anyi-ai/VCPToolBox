/**
 * @file ReportExporter.js
 * @description Markdown & JSON Report Generator and Exporter for VCPNovelManager
 * @module report/ReportExporter
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { PathGuard } = require('../security/PathGuard');

class ReportExporter {
  /**
   * @param {object} [options={}]
   * @param {PathGuard} [options.pathGuard]
   */
  constructor(options = {}) {
    this.pathGuard = options.pathGuard || new PathGuard();
  }

  /**
   * Compiles complete report data object from database state
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @returns {object}
   */
  generateReportData(dbManager, options = {}) {
    if (!dbManager || !dbManager.isOpen()) {
      throw new Error('DatabaseManager must be initialized and open to generate report.');
    }

    const db = dbManager.getDatabase();
    const scanId = options.scanId && options.scanId !== 'latest' ? options.scanId : null;
    const includeResolved = Boolean(options.includeResolved);

    // 1. Core Statistics
    const stats = dbManager.getStats();

    // 2. Category Distribution
    const catRows = db.prepare(`
      SELECT source_category, COUNT(id) AS count
      FROM source_files
      WHERE status != 'deleted'
      GROUP BY source_category
      ORDER BY count DESC
    `).all();

    const categoryDistribution = {
      planet: 0,
      character: 0,
      organization: 0,
      timeline: 0,
      chapter: 0,
      foreshadowing: 0,
      draft: 0,
      archive: 0,
      unclassified: 0
    };

    for (const r of catRows) {
      categoryDistribution[r.source_category] = r.count;
    }

    // 3. Status Distribution
    const statusRows = db.prepare(`
      SELECT status, COUNT(id) AS count
      FROM source_files
      GROUP BY status
    `).all();
    const statusDistribution = {};
    for (const r of statusRows) {
      statusDistribution[r.status] = r.count;
    }

    // 4. Review Status Distribution
    const reviewRows = db.prepare(`
      SELECT review_status, COUNT(id) AS count
      FROM source_files
      WHERE status != 'deleted'
      GROUP BY review_status
    `).all();
    const reviewStatusDistribution = {};
    for (const r of reviewRows) {
      reviewStatusDistribution[r.review_status] = r.count;
    }

    // 5. Anomalies
    let anomalyFilter = {};
    if (scanId) {
      anomalyFilter.scan_session_id = scanId;
    }
    if (!includeResolved) {
      anomalyFilter.is_resolved = 0;
    }

    const rawAnomalies = dbManager.anomalies.query(anomalyFilter);
    const anomalyBreakdown = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    for (const a of rawAnomalies) {
      const sev = String(a.severity || 'MEDIUM').toUpperCase();
      if (anomalyBreakdown[sev] !== undefined) {
        anomalyBreakdown[sev]++;
      }
    }

    const reportId = `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    const generatedAt = new Date().toISOString();

    return {
      reportId,
      generatedAt,
      scanSessionId: scanId || 'all_sessions',
      statistics: {
        totalFiles: stats.totalFiles,
        totalEntities: stats.totalEntities,
        totalAliases: stats.totalAliases,
        totalTimelineEvents: stats.totalTimelineEvents,
        totalChapters: stats.totalChapters,
        totalForeshadowing: stats.totalForeshadowing,
        totalAnomalies: rawAnomalies.length
      },
      categoryDistribution,
      statusDistribution,
      reviewStatusDistribution,
      anomalyBreakdown,
      anomalies: rawAnomalies
    };
  }

  /**
   * Formats report data into human-readable Markdown
   * @param {object} reportData
   * @returns {string}
   */
  formatMarkdown(reportData) {
    const { reportId, generatedAt, statistics, categoryDistribution, anomalyBreakdown, anomalies } = reportData;

    let md = `# VCPNovelManager Diagnostic & Anomaly Audit Report\n\n`;
    md += `- **Report ID**: \`${reportId}\`\n`;
    md += `- **Generated At**: \`${generatedAt}\`\n`;
    md += `- **Total Files Tracked**: ${statistics.totalFiles}\n`;
    md += `- **Total Entities Extracted**: ${statistics.totalEntities}\n`;
    md += `- **Total Anomalies Detected**: ${statistics.totalAnomalies}\n\n`;

    // Statistics Overview Table
    md += `## 1. World Tree Overview\n\n`;
    md += `| Metric | Count |\n`;
    md += `|---|---:|\n`;
    md += `| Source Files | ${statistics.totalFiles} |\n`;
    md += `| Lore Entities | ${statistics.totalEntities} |\n`;
    md += `| Entity Aliases | ${statistics.totalAliases} |\n`;
    md += `| Timeline Events | ${statistics.totalTimelineEvents} |\n`;
    md += `| Novel Chapters | ${statistics.totalChapters} |\n`;
    md += `| Foreshadowing Hooks | ${statistics.totalForeshadowing} |\n`;
    md += `| Total Active Conflicts | ${statistics.totalAnomalies} |\n\n`;

    // Category Distribution Table
    md += `## 2. Category Distribution\n\n`;
    md += `| Category | Files Count |\n`;
    md += `|---|---:|\n`;
    for (const [cat, count] of Object.entries(categoryDistribution)) {
      md += `| \`${cat}\` | ${count} |\n`;
    }
    md += `\n`;

    // Anomaly Severity Breakdown Table
    md += `## 3. Anomaly Severity Breakdown\n\n`;
    md += `| Severity | Count | Impact Level |\n`;
    md += `|---|---:|---|\n`;
    md += `| 🔴 **CRITICAL** | ${anomalyBreakdown.CRITICAL} | Corrupts primary key / entity identity |\n`;
    md += `| 🟠 **HIGH** | ${anomalyBreakdown.HIGH} | Semantic collision / timeline causality break |\n`;
    md += `| 🟡 **MEDIUM** | ${anomalyBreakdown.MEDIUM} | Governance / disambiguation ambiguity |\n`;
    md += `| 🔵 **LOW** | ${anomalyBreakdown.LOW} | Vault hygiene / stub placeholder note |\n`;
    md += `| ⚪ **INFO** | ${anomalyBreakdown.INFO} | Informational notice |\n\n`;

    // Detected Anomalies Detailed List
    md += `## 4. Detected Conflicts & Remediation Plan\n\n`;
    if (anomalies.length === 0) {
      md += `*No anomalies or conflicts detected in the world tree index. Vault is healthy!*\n\n`;
    } else {
      anomalies.forEach((anom, idx) => {
        const sevEmoji = anom.severity === 'CRITICAL' ? '🔴' : (anom.severity === 'HIGH' ? '🟠' : (anom.severity === 'MEDIUM' ? '🟡' : '🔵'));
        md += `### ${idx + 1}. [${anom.severity}] ${anom.title}\n\n`;
        md += `- **Rule**: \`${anom.anomaly_rule_id}\` (${anom.anomaly_type})\n`;
        md += `- **Description**: ${anom.message}\n`;
        if (anom.affectedFilePaths && anom.affectedFilePaths.length > 0) {
          md += `- **Affected Files**:\n`;
          anom.affectedFilePaths.forEach(fp => {
            md += `  - \`${fp}\`\n`;
          });
        }
        if (anom.suggested_action) {
          md += `- **Recommended Action**: ${anom.suggested_action}\n`;
        }
        md += `\n`;
      });
    }

    return md;
  }

  /**
   * Formats report data into formatted JSON string
   * @param {object} reportData
   * @returns {string}
   */
  formatJson(reportData) {
    return JSON.stringify(reportData, null, 2);
  }

  /**
   * Exports report to disk and returns file metadata
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {string} [options.format='both'] - 'json', 'markdown', 'both'
   * @param {string} [options.outputPath='reports/audit_report.json']
   * @param {string} [options.scanId]
   * @param {boolean} [options.includeResolved=false]
   * @returns {object}
   */
  exportToFile(dbManager, options = {}) {
    const reportData = this.generateReportData(dbManager, options);
    const format = (options.format || 'both').toLowerCase();
    const rawOutPath = options.outputPath || 'reports/audit_report.json';

    let savedJsonPath = null;
    let savedMarkdownPath = null;

    const baseName = path.basename(rawOutPath, path.extname(rawOutPath));
    const dirName = path.dirname(rawOutPath);

    // Prepare JSON export
    if (format === 'json' || format === 'both') {
      const jsonCandidate = path.join(dirName, `${baseName}.json`);
      const targetJsonPath = path.isAbsolute(jsonCandidate)
        ? jsonCandidate
        : path.resolve(this.pathGuard.pluginRoot, jsonCandidate);

      const resolvedJson = this.pathGuard.assertWritablePath(targetJsonPath, 'export_json_report');
      const outDir = path.dirname(resolvedJson);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(resolvedJson, this.formatJson(reportData), 'utf8');
      savedJsonPath = resolvedJson.replace(/\\/g, '/');
    }

    // Prepare Markdown export
    if (format === 'markdown' || format === 'both') {
      const mdCandidate = path.join(dirName, `${baseName}.md`);
      const targetMdPath = path.isAbsolute(mdCandidate)
        ? mdCandidate
        : path.resolve(this.pathGuard.pluginRoot, mdCandidate);

      const resolvedMd = this.pathGuard.assertWritablePath(targetMdPath, 'export_markdown_report');
      const outDir = path.dirname(resolvedMd);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(resolvedMd, this.formatMarkdown(reportData), 'utf8');
      savedMarkdownPath = resolvedMd.replace(/\\/g, '/');
    }

    return {
      reportId: reportData.reportId,
      generatedAt: reportData.generatedAt,
      savedJsonPath,
      savedMarkdownPath,
      statistics: reportData.statistics,
      categoryDistribution: reportData.categoryDistribution,
      anomalyBreakdown: reportData.anomalyBreakdown,
      anomalies: reportData.anomalies
    };
  }
}

module.exports = ReportExporter;
