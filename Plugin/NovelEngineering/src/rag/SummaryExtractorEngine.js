/**
 * @file SummaryExtractorEngine.js
 * @description Generates structured summary skeleton files and tracks source hash for two-stage RAG
 * @module rag/SummaryExtractorEngine
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { NovelError } = require('../errors');
const FrontmatterParser = require('../scanner/FrontmatterParser');

class SummaryExtractorEngine {
  /**
   * @param {object} options
   * @param {string} options.vaultPath
   * @param {string} [options.summaryRelDir='00_总览与索引']
   * @param {import('../security/PathGuard')} [options.pathGuard]
   */
  constructor(options = {}) {
    if (!options.vaultPath) {
      throw new NovelError('vaultPath is required for SummaryExtractorEngine', 'INVALID_PARAMETER');
    }
    this.vaultPath = path.resolve(options.vaultPath);
    this.summaryRelDir = options.summaryRelDir || '00_总览与索引';
    this.summaryFullDir = path.join(this.vaultPath, this.summaryRelDir);
    this.pathGuard = options.pathGuard || null;
  }

  static computeSha256(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex').toLowerCase();
  }

  _ensureSummaryDir() {
    if (this.pathGuard) {
      this.pathGuard.assertSandboxPath(this.summaryFullDir, 'create summary dir');
    }
    if (!fs.existsSync(this.summaryFullDir)) {
      fs.mkdirSync(this.summaryFullDir, { recursive: true });
    }
  }

  /**
   * Extract headings and line ranges from Markdown content
   * @param {string} content
   * @returns {{ headings: string[], lineRanges: Array<[number, number]>, previewText: string }}
   */
  static analyzeMarkdownStructure(content) {
    const lines = content.split(/\r?\n/);
    const headings = [];
    const headingIndices = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        headings.push(match[2].trim());
        headingIndices.push(i + 1);
      }
    }

    const lineRanges = [];
    for (let i = 0; i < headingIndices.length; i++) {
      const start = headingIndices[i];
      const end = i + 1 < headingIndices.length ? headingIndices[i + 1] - 1 : lines.length;
      lineRanges.push([start, end]);
    }

    let inFm = false;
    const bodyLines = [];
    for (const l of lines) {
      if (l.trim() === '---') {
        inFm = !inFm;
        continue;
      }
      if (!inFm && l.trim().length > 0 && !l.startsWith('#')) {
        bodyLines.push(l.trim());
      }
    }

    const previewText = bodyLines.join(' ').substring(0, 300);

    return {
      headings,
      lineRanges,
      previewText
    };
  }

  /**
   * Generates summary skeletons for all Markdown files in vault (excluding the summary dir itself)
   * @param {object} params
   * @param {string} params.confirmationToken - Must be 'CONFIRM_GENERATE_SKELETON'
   * @param {string} [params.targetCategory]
   * @param {boolean} [params.forceOverwrite=false]
   * @returns {object} Summary generation report
   */
  generateSummarySkeletons(params = {}) {
    const token = params.confirmationToken || params.token;
    if (token !== 'CONFIRM_GENERATE_SKELETON') {
      throw new NovelError(
        'Mandatory confirmation token "CONFIRM_GENERATE_SKELETON" required to generate summary skeletons.',
        'SAFETY_TOKEN_MISSING'
      );
    }

    this._ensureSummaryDir();

    const created = [];
    const skipped = [];
    const errors = [];

    const scanDirectory = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === this.summaryRelDir || entry.name.startsWith('.')) continue;
          scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const relPath = path.relative(this.vaultPath, fullPath).replace(/\\/g, '/');
          if (relPath.startsWith(this.summaryRelDir.replace(/\\/g, '/'))) continue;

          try {
            const raw = fs.readFileSync(fullPath, 'utf8');
            const sha256 = SummaryExtractorEngine.computeSha256(raw);
            const { frontmatter, body } = FrontmatterParser.parse(raw);
            const structure = SummaryExtractorEngine.analyzeMarkdownStructure(raw);

            const category = frontmatter.category || frontmatter.source_category || 'lore';
            if (params.targetCategory && category !== params.targetCategory) {
              skipped.push(relPath);
              continue;
            }

            const canonLevel = Number(frontmatter.canon_level !== undefined ? frontmatter.canon_level : (frontmatter.canon ? 3 : 0));
            const baseName = path.basename(entry.name, '.md');
            const summaryFileName = 'SUMMARY_' + baseName + '.md';
            const summaryFilePath = path.join(this.summaryFullDir, summaryFileName);

            if (fs.existsSync(summaryFilePath) && !params.forceOverwrite) {
              skipped.push(relPath);
              continue;
            }

            const entities = frontmatter.entities || frontmatter.related_entities || [baseName];
            const relatedEntitiesStr = Array.isArray(entities) ? JSON.stringify(entities) : JSON.stringify([String(entities)]);

            const skeletonContent = [
              '---',
              'target_relative_path: "' + relPath + '"',
              'target_headings: ' + JSON.stringify(structure.headings.slice(0, 5)),
              'target_line_ranges: ' + JSON.stringify(structure.lineRanges.slice(0, 5)),
              'canon_level: ' + canonLevel,
              'category: "' + category + '"',
              'related_entities: ' + relatedEntitiesStr,
              'source_sha256: "' + sha256 + '"',
              'summary_version: 1',
              '---',
              '',
              '# ' + baseName + ' - 核心定位概述',
              '',
              '> **正史等级**: ' + (canonLevel >= 2 ? '核心正史' : '候选/草稿参考') + ' | **关联文件**: `' + relPath + '`',
              '',
              '## 设定摘要',
              structure.previewText || '（暂无前置文本，请在此处补充 100~300 字的高度浓缩概述）',
              '',
              '## 核心定位锚点',
              structure.headings.length > 0
                ? structure.headings.map(h => '- **' + h + '**').join('\n')
                : '- 通用设定'
            ].join('\n');

            fs.writeFileSync(summaryFilePath, skeletonContent, 'utf8');
            created.push({
              sourcePath: relPath,
              summaryFile: path.relative(this.vaultPath, summaryFilePath).replace(/\\/g, '/'),
              headingsCount: structure.headings.length
            });
          } catch (e) {
            errors.push({ file: relPath, error: e.message });
          }
        }
      }
    };

    scanDirectory(this.vaultPath);

    return {
      status: 'success',
      totalCreated: created.length,
      totalSkipped: skipped.length,
      errorsCount: errors.length,
      createdFiles: created,
      errors
    };
  }
}

module.exports = SummaryExtractorEngine;
