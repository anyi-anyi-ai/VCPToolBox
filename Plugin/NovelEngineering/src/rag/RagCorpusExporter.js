/**
 * @file RagCorpusExporter.js
 * @description RAG Corpus Export & Manifest Builder Engine (Phase 3 Milestone 5)
 * @module rag/RagCorpusExporter
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { NovelError } = require('../errors');
const FrontmatterParser = require('../scanner/FrontmatterParser');

class RagCorpusExporter {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   * @param {string} [options.ragDir]
   * @param {import('../security/PathGuard')} [options.pathGuard]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new NovelError('DatabaseManager is required for RagCorpusExporter', 'INVALID_PARAMETER');
    }
    this.dbManager = dbManager;
    this.options = options;
    this.pathGuard = options.pathGuard || (dbManager && dbManager.pathGuard) || null;

    if (options.ragDir) {
      this.ragDir = this.pathGuard
        ? this.pathGuard.assertSandboxPath(options.ragDir, 'init rag dir')
        : path.resolve(options.ragDir);
    } else if (this.pathGuard && this.pathGuard.pluginRoot) {
      this.ragDir = path.join(this.pathGuard.pluginRoot, 'data', 'rag_corpus');
    } else {
      const base = dbManager.dbPath && dbManager.dbPath !== ':memory:'
        ? path.dirname(dbManager.dbPath)
        : 'data';
      this.ragDir = path.resolve(base, 'rag_corpus');
    }
  }

  /**
   * Ensures output directory structure exists within sandbox
   * @private
   * @param {string} targetDir
   */
  _ensureDir(targetDir) {
    if (this.pathGuard) {
      this.pathGuard.assertSandboxPath(targetDir, 'create RAG directory');
    }
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  }

  /**
   * Builds the JSONL manifest for RAG embedding ingestion
   * @param {object} [params={}]
   * @param {string} [params.corpusType='all'] - 'all'|'canon'|'creative'|'candidate'
   * @param {boolean} [params.includeMetadata=true]
   * @param {string} [params.outputPath]
   * @returns {object}
   */
  buildRagCorpusManifest(params = {}) {
    this._ensureDir(this.ragDir);
    const manifestPath = params.outputPath
      ? (this.pathGuard ? this.pathGuard.assertSandboxPath(params.outputPath, 'write manifest') : path.resolve(params.outputPath))
      : path.join(this.ragDir, 'manifest.jsonl');

    const manifestParentDir = path.dirname(manifestPath);
    if (!fs.existsSync(manifestParentDir)) {
      this._ensureDir(manifestParentDir);
    }

    const db = this.dbManager.getDatabase();
    const rows = db.prepare(`
      SELECT sf.*, 
             GROUP_CONCAT(DISTINCT e.canonical_name) AS entity_names,
             GROUP_CONCAT(DISTINCT e.entity_id) AS entity_ids
      FROM source_files sf
      LEFT JOIN file_entities fe ON sf.id = fe.source_file_id
      LEFT JOIN entities e ON fe.entity_id = e.id
      WHERE sf.status NOT IN ('archived', 'deleted')
      GROUP BY sf.id
      ORDER BY sf.canon_level DESC, sf.id ASC
    `).all();

    const manifestEntries = [];
    const categoryBreakdown = {};
    let totalTokens = 0;

    const includeMeta = params.includeMetadata !== false && params.includeMetadata !== 'false';
    const corpusType = (params.corpusType || 'all').toLowerCase().trim();

    for (const r of rows) {
      const canonLevel = Number(r.canon_level) || 0;
      const reviewStatus = String(r.review_status || 'unreviewed').toLowerCase().trim();
      const status = String(r.status || 'active').toLowerCase().trim();

      const isReviewed = ['reviewed', 'confirmed', 'approved', 'finalized'].includes(reviewStatus);
      const isDraftOrPlaceholder = ['draft', 'placeholder', 'deprecated', 'archived', 'deleted'].includes(status);
      const isCanon = (canonLevel >= 2) && isReviewed && !isDraftOrPlaceholder;

      if (corpusType === 'canon' && !isCanon) continue;
      if ((corpusType === 'creative' || corpusType === 'candidate') && isCanon) continue;

      let fm = {};
      if (r.frontmatter_json) {
        try {
          fm = JSON.parse(r.frontmatter_json);
        } catch (_) {
          fm = {};
        }
      }

      // Extract tags
      const tags = FrontmatterParser.extractTags(r.frontmatter_raw || '', fm);

      const words = r.word_count || 100;
      const tokens = Math.round(words * 1.3);
      totalTokens += tokens;

      const cat = r.source_category || 'general';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;

      const sha256 = r.sha256_hash || crypto.createHash('sha256').update((r.file_name || '') + (r.relative_path || '') + r.id, 'utf8').digest('hex');
      const docId = `DOC-${r.id}`;
      const title = fm.title || (r.file_name ? r.file_name.replace(/\.[^/.]+$/, '') : `Document ${r.id}`);
      const entitiesList = r.entity_names ? r.entity_names.split(',').map(s => s.trim()).filter(Boolean) : [];

      const entry = {
        doc_id: docId,
        id: docId,
        relative_path: r.relative_path || r.file_name || `doc_${r.id}.md`,
        file_name: r.file_name || path.basename(r.relative_path || `doc_${r.id}.md`),
        source_category: cat,
        category: cat,
        doc_type: isCanon ? 'canon' : 'candidate',
        canon_level: canonLevel,
        status: r.status || 'active',
        review_status: r.review_status || 'unreviewed',
        title: title,
        tags: tags,
        sha256_hash: sha256,
        sha256: sha256,
        word_count: words,
        token_estimate: tokens,
        estimated_tokens: tokens,
        entities: entitiesList,
        indexed_at: r.created_at || new Date().toISOString()
      };

      if (includeMeta) {
        entry.metadata = {
          file_name: r.file_name,
          extension: r.extension || '.md',
          size_bytes: r.size_bytes || 0,
          line_count: r.line_count || 0,
          word_count: words,
          entities: entitiesList,
          is_placeholder: r.is_placeholder || 0,
          frontmatter: fm,
          indexed_at: r.created_at || new Date().toISOString()
        };
      }

      manifestEntries.push(entry);
    }

    // Write JSONL
    const jsonlContent = manifestEntries.map(e => JSON.stringify(e)).join('\n') + (manifestEntries.length > 0 ? '\n' : '');
    fs.writeFileSync(manifestPath, jsonlContent, 'utf8');

    return {
      manifestPath: manifestPath.replace(/\\/g, '/'),
      totalDocuments: manifestEntries.length,
      estimatedTokens: totalTokens,
      categoryBreakdown,
      sampleEntries: manifestEntries.slice(0, 3)
    };
  }

  /**
   * Exports sanitized Markdown files into canon/ and candidate/ corpora
   * @param {object} [params={}]
   * @param {string} [params.outputDir]
   * @param {string} [params.policy='all'] - 'all'|'canon_only'|'canon_and_reviewed'|'candidate_only'|'creative_only'
   * @param {boolean} [params.stripTags=false]
   * @returns {object}
   */
  exportRagSources(params = {}) {
    const startTime = Date.now();
    const baseOutDir = params.outputDir
      ? (this.pathGuard ? this.pathGuard.assertSandboxPath(params.outputDir, 'export RAG') : path.resolve(params.outputDir))
      : this.ragDir;

    const canonDir = path.join(baseOutDir, 'canon');
    const creativeDir = path.join(baseOutDir, 'candidate');

    this._ensureDir(baseOutDir);
    this._ensureDir(canonDir);
    this._ensureDir(creativeDir);

    const db = this.dbManager.getDatabase();
    const sourceFiles = db.prepare(`
      SELECT sf.*, 
             GROUP_CONCAT(DISTINCT e.canonical_name) AS entity_names
      FROM source_files sf
      LEFT JOIN file_entities fe ON sf.id = fe.source_file_id
      LEFT JOIN entities e ON fe.entity_id = e.id
      WHERE sf.status NOT IN ('archived', 'deleted')
      GROUP BY sf.id
      ORDER BY sf.canon_level DESC, sf.id ASC
    `).all();

    let canonCount = 0;
    let creativeCount = 0;
    const policy = (params.policy || 'all').toLowerCase().trim();
    const stripTags = params.stripTags === true || params.stripTags === 'true';

    for (const sf of sourceFiles) {
      const canonLevel = Number(sf.canon_level) || 0;
      const reviewStatus = String(sf.review_status || 'unreviewed').toLowerCase().trim();
      const status = String(sf.status || 'active').toLowerCase().trim();

      const isReviewed = ['reviewed', 'confirmed', 'approved', 'finalized'].includes(reviewStatus);
      const isDraftOrPlaceholder = ['draft', 'placeholder', 'deprecated', 'archived', 'deleted'].includes(status);
      const isCanon = (canonLevel >= 2) && isReviewed && !isDraftOrPlaceholder;

      // Apply policy filter
      if (policy === 'canon_only' && !isCanon) continue;
      if ((policy === 'candidate_only' || policy === 'creative_only') && isCanon) continue;
      if (policy === 'canon_and_reviewed' && !isCanon && !isReviewed) continue;

      const targetSubdir = isCanon ? canonDir : creativeDir;

      let content = '';
      if (sf.file_path && fs.existsSync(sf.file_path)) {
        try {
          content = fs.readFileSync(sf.file_path, 'utf8');
        } catch (_) {
          content = `# ${sf.file_name}\n\n[Content unreadable from file system]`;
        }
      } else {
        content = `# ${sf.file_name}\n\nCategory: ${sf.source_category}\nCanon Level: ${sf.canon_level}`;
      }

      // 1. Strip YAML frontmatter
      let bodyContent = content.replace(/^---[\s\S]*?---\r?\n?/, '');

      // 2. Strip internal Obsidian comments (%% ... %%)
      bodyContent = bodyContent.replace(/%%[\s\S]*?%%/g, '');

      // 3. Strip HTML comments / internal plugin directives (<!-- ... -->)
      bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');

      // 4. Strip inline #tags if requested
      if (stripTags) {
        bodyContent = bodyContent.replace(/(?:^|\s)#([^\s#.,;:!?，。！？()[\]{}<>]+)/gu, ' $1');
      }

      let fm = {};
      if (sf.frontmatter_json) {
        try { fm = JSON.parse(sf.frontmatter_json); } catch (_) { fm = {}; }
      }
      const title = fm.title || (sf.file_name ? sf.file_name.replace(/\.[^/.]+$/, '') : `Document ${sf.id}`);

      // Format clean standard Markdown header
      const cleanHeader = [
        '---',
        `doc_id: "DOC-${sf.id}"`,
        `source_id: ${sf.id}`,
        `relative_path: ${JSON.stringify(sf.relative_path || sf.file_name)}`,
        `source_category: ${JSON.stringify(sf.source_category || 'general')}`,
        `category: ${JSON.stringify(sf.source_category || 'general')}`,
        `canon_level: ${canonLevel}`,
        `review_status: ${JSON.stringify(sf.review_status || 'unreviewed')}`,
        `title: ${JSON.stringify(title)}`,
        '---',
        ''
      ].join('\n');

      const finalMarkdown = cleanHeader + bodyContent.trim() + '\n';

      const baseName = path.basename(sf.relative_path || sf.file_name || `doc_${sf.id}.md`);
      const safeBaseName = `${sf.source_category || 'general'}_${sf.id}_${baseName}`;
      const outFilePath = path.join(targetSubdir, safeBaseName);

      fs.writeFileSync(outFilePath, finalMarkdown, 'utf8');

      if (isCanon) {
        canonCount++;
      } else {
        creativeCount++;
      }
    }

    // Build consolidated manifest in baseOutDir
    const manifestResult = this.buildRagCorpusManifest({
      outputPath: path.join(baseOutDir, 'manifest.jsonl'),
      corpusType: policy === 'canon_only' ? 'canon' : ((policy === 'candidate_only' || policy === 'creative_only') ? 'creative' : 'all')
    });

    const durationMs = Date.now() - startTime;

    return {
      canonCorpusDir: canonDir.replace(/\\/g, '/'),
      creativeCorpusDir: creativeDir.replace(/\\/g, '/'),
      manifestJsonlPath: manifestResult.manifestPath,
      totalExportedFiles: canonCount + creativeCount,
      canonFilesCount: canonCount,
      creativeFilesCount: creativeCount,
      estimatedTokens: manifestResult.estimatedTokens,
      durationMs
    };
  }
}

module.exports = RagCorpusExporter;
