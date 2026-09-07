/**
 * @file BM25FallbackEngine.js
 * @description In-process BM25 lexical fallback retriever with entity graph boost for NovelEngineering
 * @module rag/BM25FallbackEngine
 * @license MIT
 */

'use strict';

class BM25FallbackEngine {
  /**
   * @param {Array<object>} documents - List of { id, text, metadata }
   * @param {object} [options]
   */
  constructor(documents = [], options = {}) {
    this.k1 = options.k1 || 1.5;
    this.b = options.b || 0.75;
    this.docs = [];
    this.docCount = 0;
    this.avgDocLength = 0;
    this.docFreqs = new Map();
    this.setDocuments(documents);
  }

  static tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    const tokens = [];
    const normalized = text.toLowerCase();

    // 1. English words and numbers
    const words = normalized.match(/[a-z0-9_\-]+/g) || [];
    tokens.push(...words);

    // 2. Chinese characters and bi-grams
    const hanzi = normalized.match(/[\u4e00-\u9fa5]/g) || [];
    for (let i = 0; i < hanzi.length; i++) {
      tokens.push(hanzi[i]);
      if (i + 1 < hanzi.length) {
        tokens.push(hanzi[i] + hanzi[i + 1]);
      }
    }

    return tokens;
  }

  setDocuments(documents) {
    this.docs = [];
    this.docFreqs.clear();
    let totalLength = 0;

    for (const doc of documents) {
      const tokens = BM25FallbackEngine.tokenize(doc.text || doc.summary_text || '');
      const termCounts = new Map();
      for (const t of tokens) {
        termCounts.set(t, (termCounts.get(t) || 0) + 1);
      }

      for (const term of termCounts.keys()) {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      }

      const docLen = tokens.length;
      totalLength += docLen;
      this.docs.push({
        id: doc.id,
        item: doc,
        length: docLen,
        termCounts
      });
    }

    this.docCount = this.docs.length;
    this.avgDocLength = this.docCount > 0 ? totalLength / this.docCount : 0;
  }

  scoreDocument(queryTerms, doc) {
    let score = 0;
    const { length, termCounts } = doc;

    for (const term of queryTerms) {
      const tf = termCounts.get(term) || 0;
      if (tf === 0) continue;

      const df = this.docFreqs.get(term) || 0;
      const idf = Math.log(1 + (this.docCount - df + 0.5) / (df + 0.5));
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (length / (this.avgDocLength || 1)));

      score += idf * (numerator / denominator);
    }

    const title = String(doc.item.title || '').toLowerCase();
    const entities = Array.isArray(doc.item.related_entities) ? doc.item.related_entities : [];
    for (const term of queryTerms) {
      if (title.includes(term)) {
        score += 2.0;
      }
      for (const ent of entities) {
        if (String(ent).toLowerCase().includes(term)) {
          score += 2.5;
        }
      }
    }

    return score;
  }

  search(query, options = {}) {
    const topK = Math.max(1, parseInt(options.topK || 3, 10));
    const filterCategory = options.category ? String(options.category).toLowerCase().trim() : null;
    const canonOnly = Boolean(options.canonOnly);

    const queryTerms = BM25FallbackEngine.tokenize(query);
    if (queryTerms.length === 0) return [];

    const scored = [];
    for (const doc of this.docs) {
      if (filterCategory && String(doc.item.category || '').toLowerCase() !== filterCategory) {
        continue;
      }
      if (canonOnly && (Number(doc.item.canon_level) || 0) < 2) {
        continue;
      }

      const score = this.scoreDocument(queryTerms, doc);
      if (score > 0) {
        scored.push({
          item: doc.item,
          score: Math.min(1.0, score / 10.0),
          rawScore: score
        });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

module.exports = BM25FallbackEngine;
