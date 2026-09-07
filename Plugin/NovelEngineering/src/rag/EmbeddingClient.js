/**
 * @file EmbeddingClient.js
 * @description Pure JavaScript client for OpenAI-compatible Embedding APIs with key masking, retry, and dimension validation
 * @module rag/EmbeddingClient
 * @license MIT
 */

'use strict';

const axios = require('axios');
const { NovelError } = require('../errors');

class EmbeddingClient {
  /**
   * @param {object} [config={}]
   */
  constructor(config = {}) {
    this.baseURL = (config.EMBEDDING_BASE_URL || process.env.EMBEDDING_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.apiKey = config.EMBEDDING_API_KEY || process.env.EMBEDDING_API_KEY || '';
    this.model = config.EMBEDDING_MODEL || process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
    this.expectedDimensions = (config.EMBEDDING_DIMENSIONS || process.env.EMBEDDING_DIMENSIONS)
      ? parseInt(config.EMBEDDING_DIMENSIONS || process.env.EMBEDDING_DIMENSIONS, 10)
      : null;
    this.timeout = parseInt(config.timeout || process.env.EMBEDDING_TIMEOUT || 60000, 10);
    this.maxRetries = parseInt(config.maxRetries || 2, 10);
  }

  static maskApiKey(key) {
    if (!key || typeof key !== 'string') return '[NONE]';
    const trimmed = key.trim();
    if (trimmed.length <= 8) return '****';
    return trimmed.substring(0, 3) + '****' + trimmed.substring(trimmed.length - 4);
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async embedBatch(texts, batchSize = 16) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    if (texts.length > batchSize) {
      const allResults = [];
      const totalBatches = Math.ceil(texts.length / batchSize);
      for (let i = 0; i < texts.length; i += batchSize) {
        const batchNum = Math.floor(i / batchSize) + 1;
        const chunk = texts.slice(i, i + batchSize);
        console.log(`[EmbeddingClient] 正在嵌入批次 ${batchNum}/${totalBatches} (${chunk.length} 条文本)...`);
        const chunkResults = await this._embedSingleBatch(chunk);
        allResults.push(...chunkResults);
      }
      console.log(`[EmbeddingClient] 全部 ${totalBatches} 批次嵌入完成。`);
      return allResults;
    }

    return this._embedSingleBatch(texts);
  }

  async _embedSingleBatch(texts) {
    if (!this.isConfigured()) {
      const err = new NovelError('Embedding API key is missing. Vector search disabled.', 'EMBEDDING_KEY_MISSING');
      err.code = 'EMBEDDING_UNAVAILABLE';
      throw err;
    }

    const sanitizedTexts = texts.map(t => (typeof t === 'string' ? t.trim() : String(t || '')));
    const endpoint = this.baseURL + '/embeddings';

    let lastError = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const reqBody = {
          input: sanitizedTexts,
          model: this.model
        };
        if (this.expectedDimensions) {
          reqBody.dimensions = this.expectedDimensions;
        }

        const response = await axios.post(
          endpoint,
          reqBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + this.apiKey.trim()
            },
            timeout: this.timeout
          }
        );

        const data = response.data;
        if (!data || !Array.isArray(data.data)) {
          throw new NovelError('Malformed response from Embedding API: data array missing', 'EMBEDDING_RESPONSE_ERROR');
        }

        const sorted = data.data.slice().sort((a, b) => (a.index || 0) - (b.index || 0));

        const results = sorted.map((item, idx) => {
          const vec = item.embedding;
          if (!Array.isArray(vec) || vec.length === 0) {
            throw new NovelError('Embedding vector at index ' + idx + ' is empty or not an array', 'EMBEDDING_VECTOR_EMPTY');
          }

          if (this.expectedDimensions && vec.length !== this.expectedDimensions) {
            throw new NovelError(
              'Embedding dimension mismatch: expected ' + this.expectedDimensions + ', got ' + vec.length,
              'EMBEDDING_DIMENSION_MISMATCH'
            );
          }

          return {
            embedding: vec,
            dimensions: vec.length,
            index: item.index !== undefined ? item.index : idx
          };
        });

        return results;
      } catch (err) {
        lastError = err;
        const status = err.response ? err.response.status : null;
        if (status === 401 || status === 403) {
          throw new NovelError(
            'Embedding API authentication failed (HTTP ' + status + '). Key: ' + EmbeddingClient.maskApiKey(this.apiKey),
            'EMBEDDING_AUTH_FAILED'
          );
        }

        if (attempt < this.maxRetries) {
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    const safeMessage = lastError && lastError.message ? lastError.message : 'Unknown network failure';
    const err = new NovelError(
      'Embedding API request failed after ' + (this.maxRetries + 1) + ' attempts: ' + safeMessage,
      'EMBEDDING_UNAVAILABLE'
    );
    err.cause = lastError;
    throw err;
  }

  async embedQuery(query) {
    const results = await this.embedBatch([query]);
    if (!results || results.length === 0) {
      throw new NovelError('No embedding returned for query.', 'EMBEDDING_EMPTY');
    }
    return results[0];
  }
}

module.exports = EmbeddingClient;
