/**
 * @file VectorStoreManager.js
 * @description Pure JavaScript file-based local vector store with cosine similarity, dimension assertion, and metadata filtering
 * @module rag/VectorStoreManager
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { NovelError } = require('../errors');

class VectorStoreManager {
  constructor(options = {}) {
    this.storeDir = options.storeDir || path.resolve(__dirname, '..', '..', 'data', 'vector_store');
    this.pathGuard = options.pathGuard || null;
    this.manifestFile = path.join(this.storeDir, 'manifest.json');
    this.vectorsFile = path.join(this.storeDir, 'vectors.json');
    this._manifest = null;
    this._vectors = new Map();
  }

  _ensureDir() {
    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
    }
  }

  load() {
    this._ensureDir();
    if (fs.existsSync(this.manifestFile)) {
      try {
        const raw = fs.readFileSync(this.manifestFile, 'utf8');
        this._manifest = JSON.parse(raw);
      } catch (_) {
        this._manifest = { version: '1.0.0', dimensions: null, items: [] };
      }
    } else {
      this._manifest = { version: '1.0.0', dimensions: null, items: [] };
    }

    this._vectors.clear();
    if (fs.existsSync(this.vectorsFile)) {
      try {
        const rawVecs = fs.readFileSync(this.vectorsFile, 'utf8');
        const parsed = JSON.parse(rawVecs);
        for (const [id, vec] of Object.entries(parsed)) {
          this._vectors.set(id, vec);
        }
      } catch (_) {}
    }
    return this;
  }

  save() {
    this._ensureDir();
    if (!this._manifest) {
      this._manifest = { version: '1.0.0', dimensions: null, items: [] };
    }
    this._manifest.updated_at = new Date().toISOString();
    fs.writeFileSync(this.manifestFile, JSON.stringify(this._manifest, null, 2), 'utf8');

    const vecsObj = {};
    for (const [id, vec] of this._vectors.entries()) {
      vecsObj[id] = Array.isArray(vec) ? vec : Array.from(vec);
    }
    fs.writeFileSync(this.vectorsFile, JSON.stringify(vecsObj), 'utf8');
  }

  getDimensions() {
    if (!this._manifest) this.load();
    return this._manifest.dimensions;
  }

  getItems() {
    if (!this._manifest) this.load();
    return this._manifest.items || [];
  }

  getItemById(id) {
    return this.getItems().find(i => i.id === id) || null;
  }

  upsertItems(items) {
    if (!this._manifest) this.load();
    if (!Array.isArray(items) || items.length === 0) return;

    for (const item of items) {
      if (!item.id) {
        throw new NovelError('Each vector item must have an id', 'INVALID_VECTOR_ITEM');
      }

      if (Array.isArray(item.embedding) && item.embedding.length > 0) {
        const dims = item.embedding.length;
        if (this._manifest.dimensions === null || this._manifest.items.length === 0) {
          this._manifest.dimensions = dims;
        } else if (this._manifest.dimensions !== dims) {
          throw new NovelError('Cannot insert vector with dimension ' + dims + '. Store expects ' + this._manifest.dimensions + '.', 'EMBEDDING_DIMENSION_MISMATCH');
        }
        this._vectors.set(item.id, item.embedding);
      }

      const existingIdx = this._manifest.items.findIndex(i => i.id === item.id);
      const meta = {
        id: item.id,
        summary_file: item.summary_file || item.summaryFile,
        target_relative_path: item.target_relative_path || item.targetRelativePath,
        target_headings: item.target_headings || item.targetHeadings || [],
        target_line_ranges: item.target_line_ranges || item.targetLineRanges || [],
        title: item.title || path.basename(item.summary_file || '', '.md'),
        category: item.category || 'lore',
        canon_level: Number(item.canon_level !== undefined ? item.canon_level : 0),
        related_entities: item.related_entities || item.relatedEntities || [],
        summary_text: item.summary_text || item.summaryText || '',
        summary_sha256: item.summary_sha256 || item.summarySha256 || '',
        source_sha256: item.source_sha256 || item.sourceSha256 || '',
        stale: Boolean(item.stale),
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        this._manifest.items[existingIdx] = meta;
      } else {
        this._manifest.items.push(meta);
      }
    }
    this.save();
  }

  static cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  search(queryVector, options = {}) {
    if (!this._manifest) this.load();
    if (!Array.isArray(queryVector)) {
      throw new NovelError('Query vector must be an array of floats.', 'INVALID_QUERY_VECTOR');
    }
    if (this._manifest.dimensions && queryVector.length !== this._manifest.dimensions) {
      throw new NovelError('Query vector dimension ' + queryVector.length + ' does not match store dimension ' + this._manifest.dimensions + '.', 'EMBEDDING_DIMENSION_MISMATCH');
    }
    const topK = Math.max(1, parseInt(options.topK || 3, 10));
    const filterCategory = options.category ? String(options.category).toLowerCase().trim() : null;
    const canonOnly = Boolean(options.canonOnly);
    const scored = [];
    for (const item of this._manifest.items) {
      if (filterCategory && String(item.category || '').toLowerCase() !== filterCategory) continue;
      if (canonOnly && (Number(item.canon_level) || 0) < 2) continue;
      const vec = this._vectors.get(item.id);
      if (!vec) continue;
      const score = VectorStoreManager.cosineSimilarity(queryVector, vec);
      scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

module.exports = VectorStoreManager;