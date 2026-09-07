/**
 * @file NovelLoreRetriever.js
 * @description Two-stage Summary-to-Detail retriever with BM25 failover, stale tracking, and heading-level slice extraction
 * @module rag/NovelLoreRetriever
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { NovelError } = require('../errors');
const EmbeddingClient = require('./EmbeddingClient');
const VectorStoreManager = require('./VectorStoreManager');
const BM25FallbackEngine = require('./BM25FallbackEngine');
const FrontmatterParser = require('../scanner/FrontmatterParser');

class NovelLoreRetriever {
  constructor(options = {}) {
    this.vaultPath = path.resolve(options.vaultPath || process.env.VAULT_ROOT || '.');
    this.summaryRelDir = options.summaryRelDir || process.env.SUMMARY_REL_DIR || '00_总览与索引';
    this.config = options.config || process.env;
    this.vectorStore = options.vectorStore || new VectorStoreManager({
      storeDir: path.resolve(__dirname, '..', '..', 'data', 'vector_store')
    });
    this.embeddingClient = options.embeddingClient || new EmbeddingClient(this.config);
    this.bm25Engine = null;
  }

  static computeSha256(content) {
    return crypto.createHash('sha256').update(content, 'utf8').digest('hex').toLowerCase();
  }

  static _getMarkdownFilesRecursive(dir) {
    if (!fs.existsSync(dir)) return [];
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        results = results.concat(NovelLoreRetriever._getMarkdownFilesRecursive(full));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(full);
      }
    }
    return results;
  }

  _scanSummaryDirDirectly() {
    const summaryFullDir = path.join(this.vaultPath, this.summaryRelDir);
    if (!fs.existsSync(summaryFullDir)) return [];
    const files = NovelLoreRetriever._getMarkdownFilesRecursive(summaryFullDir);
    const items = [];
    for (const summaryFullPath of files) {
      const f = path.basename(summaryFullPath);
      const summaryRelPath = path.relative(this.vaultPath, summaryFullPath).replace(/\\/g, '/');
      const raw = fs.readFileSync(summaryFullPath, 'utf8');
      const { frontmatter, body } = FrontmatterParser.parse(raw);
      items.push({
        id: summaryRelPath,
        summary_file: summaryRelPath,
        target_relative_path: frontmatter.target_relative_path || '',
        target_headings: Array.isArray(frontmatter.target_headings) ? frontmatter.target_headings : [],
        target_line_ranges: Array.isArray(frontmatter.target_line_ranges) ? frontmatter.target_line_ranges : [],
        title: frontmatter.title || path.basename(f, '.md').replace(/^SUMMARY_/, ''),
        category: frontmatter.category || 'lore',
        canon_level: Number(frontmatter.canon_level !== undefined ? frontmatter.canon_level : 0),
        related_entities: Array.isArray(frontmatter.related_entities) ? frontmatter.related_entities : [],
        summary_text: body.trim(),
        summary_sha256: NovelLoreRetriever.computeSha256(raw),
        source_sha256: frontmatter.source_sha256 || '',
        stale: false
      });
    }
    return items;
  }

  async buildSummaryIndex(params = {}) {
    const summaryFullDir = path.join(this.vaultPath, this.summaryRelDir);
    if (!fs.existsSync(summaryFullDir)) {
      return { status: 'success', message: 'Summary directory does not exist: ' + this.summaryRelDir, indexedCount: 0, staleCount: 0 };
    }
    this.vectorStore.load();
    const files = NovelLoreRetriever._getMarkdownFilesRecursive(summaryFullDir);
    const itemsToEmbed = [];
    const itemsToUpsert = [];
    let staleDetectedCount = 0;

    for (const summaryFullPath of files) {
      const f = path.basename(summaryFullPath);
      const summaryRelPath = path.relative(this.vaultPath, summaryFullPath).replace(/\\/g, '/');
      const raw = fs.readFileSync(summaryFullPath, 'utf8');
      const summarySha256 = NovelLoreRetriever.computeSha256(raw);
      const { frontmatter, body } = FrontmatterParser.parse(raw);
      const targetRelPath = frontmatter.target_relative_path || '';
      let currentSourceSha256 = '';
      let isStale = false;
      if (targetRelPath) {
        const targetFullPath = path.join(this.vaultPath, targetRelPath);
        if (fs.existsSync(targetFullPath)) {
          const sourceRaw = fs.readFileSync(targetFullPath, 'utf8');
          currentSourceSha256 = NovelLoreRetriever.computeSha256(sourceRaw);
          if (frontmatter.source_sha256 && frontmatter.source_sha256 !== currentSourceSha256) {
            isStale = true;
            staleDetectedCount++;
          }
        }
      }
      const existingItem = this.vectorStore.getItemById(summaryRelPath);
      const needEmbed = params.forceReindex || !existingItem || existingItem.summary_sha256 !== summarySha256;
      const itemMeta = {
        id: summaryRelPath,
        summary_file: summaryRelPath,
        target_relative_path: targetRelPath,
        target_headings: Array.isArray(frontmatter.target_headings) ? frontmatter.target_headings : [],
        target_line_ranges: Array.isArray(frontmatter.target_line_ranges) ? frontmatter.target_line_ranges : [],
        title: frontmatter.title || path.basename(f, '.md').replace(/^SUMMARY_/, ''),
        category: frontmatter.category || 'lore',
        canon_level: Number(frontmatter.canon_level !== undefined ? frontmatter.canon_level : 0),
        related_entities: Array.isArray(frontmatter.related_entities) ? frontmatter.related_entities : [],
        summary_text: body.trim(),
        summary_sha256: summarySha256,
        source_sha256: currentSourceSha256,
        stale: isStale
      };
      if (needEmbed) {
        const textSnippet = (itemMeta.summary_text || '').length > 1200
          ? itemMeta.summary_text.substring(0, 1200)
          : (itemMeta.summary_text || '');
        itemsToEmbed.push({
          meta: itemMeta,
          embedText: itemMeta.title + '\n分类: ' + itemMeta.category + '\n关联实体: ' + itemMeta.related_entities.join(', ') + '\n' + textSnippet
        });
      } else {
        if (existingItem.stale !== isStale) {
          existingItem.stale = isStale;
          existingItem.source_sha256 = currentSourceSha256;
          itemsToUpsert.push({ ...existingItem, embedding: this.vectorStore._vectors.get(existingItem.id) });
        }
      }
    }

    let indexedVectorCount = 0;
    if (itemsToEmbed.length > 0) {
      if (this.embeddingClient.isConfigured()) {
        const texts = itemsToEmbed.map(i => i.embedText);
        const embeddings = await this.embeddingClient.embedBatch(texts);
        for (let i = 0; i < itemsToEmbed.length; i++) {
          itemsToUpsert.push({ ...itemsToEmbed[i].meta, embedding: embeddings[i].embedding });
        }
        indexedVectorCount = itemsToEmbed.length;
      } else {
        // Gracefully save meta without embeddings for BM25
        for (let i = 0; i < itemsToEmbed.length; i++) {
          itemsToUpsert.push(itemsToEmbed[i].meta);
        }
      }
    }

    if (itemsToUpsert.length > 0) {
      this.vectorStore.upsertItems(itemsToUpsert);
    }

    return {
      status: 'success',
      totalFiles: files.length,
      indexedCount: indexedVectorCount,
      bm25ItemsCount: this.vectorStore.getItems().length,
      staleCount: staleDetectedCount,
      dimensions: this.vectorStore.getDimensions(),
      isVectorActive: Boolean(indexedVectorCount > 0 || this.vectorStore.getDimensions())
    };
  }

  _extractSourceSlice(targetRelPath, targetHeadings, lineRanges, charLimit = 3000) {
    if (!targetRelPath) return null;
    const fullPath = path.join(this.vaultPath, targetRelPath);
    if (!fs.existsSync(fullPath)) return '[SOURCE_FILE_NOT_FOUND: ' + targetRelPath + ']';
    const raw = fs.readFileSync(fullPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    if (Array.isArray(lineRanges) && lineRanges.length > 0 && Array.isArray(lineRanges[0])) {
      const extractedChunks = [];
      for (const [start, end] of lineRanges) {
        const s = Math.max(0, start - 1);
        const e = Math.min(lines.length, end);
        extractedChunks.push(lines.slice(s, e).join('\n'));
      }
      let combined = extractedChunks.join('\n\n---\n\n');
      if (combined.length > charLimit) {
        combined = combined.substring(0, charLimit) + '\n\n... [已根据 charLimit 截断剩余部分]';
      }
      return combined;
    }
    const { body } = FrontmatterParser.parse(raw);
    if (body.length > charLimit) {
      return body.substring(0, charLimit) + '\n\n... [已根据 charLimit 截断剩余部分]';
    }
    return body;
  }

  async searchWorldTree(params = {}) {
    const query = String(params.query || '').trim();
    if (!query) {
      throw new NovelError('Query must be a non-empty string', 'INVALID_PARAMETER');
    }
    const topK = Math.max(1, parseInt(params.topK || 3, 10));
    const fetchDetail = params.fetchDetail !== false && params.fetchDetail !== 'false';
    const category = params.category ? String(params.category).trim() : null;
    const canonOnly = Boolean(params.canonOnly);
    const charLimit = Math.max(200, parseInt(params.charLimit || 3000, 10));

    this.vectorStore.load();
    let allItems = this.vectorStore.getItems();
    if (allItems.length === 0) {
      allItems = this._scanSummaryDirDirectly();
    }

    let hits = [];
    let isBm25Fallback = false;
    let fallbackReason = null;

    if (this.embeddingClient.isConfigured() && allItems.length > 0 && this.vectorStore.getDimensions()) {
      try {
        const queryEmbedding = await this.embeddingClient.embedQuery(query);
        hits = this.vectorStore.search(queryEmbedding.embedding, { topK, category, canonOnly });
      } catch (err) {
        isBm25Fallback = true;
        fallbackReason = 'Embedding API unavailable (' + err.message + '). Falling back to BM25 keyword search.';
      }
    } else {
      isBm25Fallback = true;
      fallbackReason = !this.embeddingClient.isConfigured()
        ? 'Embedding API key not configured. Using BM25 fallback.'
        : 'Vector store is empty. Using BM25 fallback.';
    }

    if (isBm25Fallback) {
      if (!this.bm25Engine) {
        this.bm25Engine = new BM25FallbackEngine(allItems);
      } else {
        this.bm25Engine.setDocuments(allItems);
      }
      hits = this.bm25Engine.search(query, { topK, category, canonOnly });
    }

    const processedHits = [];
    for (const h of hits) {
      const item = h.item;
      const canonLevel = Number(item.canon_level) || 0;
      const canonLabel = canonLevel >= 2 ? '[核心正史]' : '[参考草稿/脑洞]';
      let liveStale = Boolean(item.stale);
      if (item.target_relative_path) {
        const targetFullPath = path.join(this.vaultPath, item.target_relative_path);
        if (fs.existsSync(targetFullPath)) {
          const liveRaw = fs.readFileSync(targetFullPath, 'utf8');
          const liveSha256 = NovelLoreRetriever.computeSha256(liveRaw);
          if (item.source_sha256 && item.source_sha256 !== liveSha256) {
            liveStale = true;
          }
        }
      }
      let detailContent = null;
      if (fetchDetail && item.target_relative_path) {
        detailContent = this._extractSourceSlice(item.target_relative_path, item.target_headings, item.target_line_ranges, charLimit);
      }
      processedHits.push({
        id: item.id,
        title: item.title,
        category: item.category,
        canonLevel,
        canonLabel,
        isStale: liveStale,
        staleWarning: liveStale ? '【STALE 警告：对应世界树源文件已发生修改，本概述可能过时】' : null,
        targetRelativePath: item.target_relative_path,
        targetHeadings: item.target_headings,
        score: Number(h.score.toFixed(4)),
        summary: item.summary_text,
        details: detailContent
      });
    }

    const mdParts = [
      '### [NovelEngineering] 世界树设定检索结果 (共召回 ' + processedHits.length + ' 条)',
      '- **检索词**: "' + query + '"',
      isBm25Fallback ? '- **检索通道**: [BM25 关键词兜底] (' + fallbackReason + ')' : '- **检索通道**: [向量语义检索 (Hybrid RAG)]'
    ];
    if (processedHits.length === 0) {
      mdParts.push('', '> 未检索到与该查询匹配的世界树设定条目。');
    } else {
      processedHits.forEach((hit, idx) => {
        mdParts.push('');
        mdParts.push('#### ' + (idx + 1) + '. ' + hit.canonLabel + ' ' + hit.title + ' (匹配分: ' + hit.score + ')');
        if (hit.staleWarning) mdParts.push('> ⚠️ **' + hit.staleWarning + '**');
        mdParts.push('- **原件路径**: `' + (hit.targetRelativePath || '无') + '` | **分类**: `' + hit.category + '`');
        mdParts.push('- **浓缩概览**: ' + hit.summary);
        if (hit.details) {
          mdParts.push('- **精准原件切片**:');
          mdParts.push('```markdown\n' + hit.details + '\n```');
        }
      });
    }
    return {
      status: 'success',
      query,
      isBm25Fallback,
      fallbackReason,
      totalHits: processedHits.length,
      hits: processedHits,
      content: mdParts.join('\n'),
      details: { query, isBm25Fallback, totalHits: processedHits.length, hits: processedHits }
    };
  }
}

module.exports = NovelLoreRetriever;