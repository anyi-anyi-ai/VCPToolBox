/**
 * @file ChatClient.js
 * @description Pure JavaScript client for OpenAI-compatible Chat Completion APIs (/v1/chat/completions)
 * with endpoint normalization, hierarchical configuration fallback, JSON parsing, key masking,
 * exponential backoff retry, and offline mock injection.
 * @module llm/ChatClient
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { NovelError } = require('../errors');

class ChatClient {
  /**
   * @param {object} [config={}]
   */
  constructor(config = {}) {
    const fileConfig = ChatClient.parseConfigEnv(config.configEnvPath || config.configPath);

    // Base URL hierarchy:
    // constructor options (baseURL or LLM_BASE_URL)
    // > process.env.LLM_BASE_URL
    // > constructor options (EMBEDDING_BASE_URL)
    // > process.env.EMBEDDING_BASE_URL
    // > config.env (LLM_BASE_URL)
    // > config.env (EMBEDDING_BASE_URL)
    // > default 'https://api.openai.com/v1'
    const rawBaseURL = config.baseURL
      || config.LLM_BASE_URL
      || (config.config && (config.config.baseURL || config.config.LLM_BASE_URL))
      || process.env.LLM_BASE_URL
      || config.EMBEDDING_BASE_URL
      || (config.config && config.config.EMBEDDING_BASE_URL)
      || process.env.EMBEDDING_BASE_URL
      || fileConfig.LLM_BASE_URL
      || fileConfig.EMBEDDING_BASE_URL
      || 'https://api.openai.com/v1';

    this.baseURL = String(rawBaseURL).trim().replace(/\/+$/, '');
    this.endpoint = ChatClient.normalizeEndpoint(this.baseURL);

    // API Key hierarchy:
    // constructor options (apiKey or LLM_API_KEY)
    // > process.env.LLM_API_KEY
    // > constructor options (EMBEDDING_API_KEY)
    // > process.env.EMBEDDING_API_KEY
    // > process.env.OPENAI_API_KEY
    // > config.env (LLM_API_KEY)
    // > config.env (EMBEDDING_API_KEY)
    // > config.env (OPENAI_API_KEY)
    // > default ''
    this.apiKey = config.apiKey
      || config.LLM_API_KEY
      || (config.config && (config.config.apiKey || config.config.LLM_API_KEY))
      || process.env.LLM_API_KEY
      || config.EMBEDDING_API_KEY
      || (config.config && config.config.EMBEDDING_API_KEY)
      || process.env.EMBEDDING_API_KEY
      || process.env.OPENAI_API_KEY
      || fileConfig.LLM_API_KEY
      || fileConfig.EMBEDDING_API_KEY
      || fileConfig.OPENAI_API_KEY
      || '';

    if (typeof this.apiKey === 'string') {
      this.apiKey = this.apiKey.trim();
    }

    // Model hierarchy:
    // constructor options (model or LLM_MODEL)
    // > process.env.LLM_MODEL
    // > config.env (LLM_MODEL)
    // > default 'gpt-4o-mini'
    this.model = config.model
      || config.LLM_MODEL
      || (config.config && (config.config.model || config.config.LLM_MODEL))
      || process.env.LLM_MODEL
      || fileConfig.LLM_MODEL
      || 'gpt-4o-mini';

    // Timeout
    const rawTimeout = config.timeout
      || config.LLM_TIMEOUT
      || (config.config && (config.config.timeout || config.config.LLM_TIMEOUT))
      || process.env.LLM_TIMEOUT
      || fileConfig.LLM_TIMEOUT
      || 60000;
    this.timeout = parseInt(rawTimeout, 10) || 60000;

    // Max Retries
    const rawRetries = config.maxRetries !== undefined
      ? config.maxRetries
      : (config.LLM_MAX_RETRIES !== undefined
        ? config.LLM_MAX_RETRIES
        : (process.env.LLM_MAX_RETRIES !== undefined
          ? process.env.LLM_MAX_RETRIES
          : (fileConfig.LLM_MAX_RETRIES !== undefined
            ? fileConfig.LLM_MAX_RETRIES
            : 2)));
    this.maxRetries = parseInt(rawRetries, 10);
    if (isNaN(this.maxRetries) || this.maxRetries < 0) {
      this.maxRetries = 2;
    }

    // Backoff base ms (allows fast testing with 0 or 1ms)
    const rawBackoff = config.backoffBaseMs !== undefined
      ? config.backoffBaseMs
      : (config.LLM_BACKOFF_BASE_MS !== undefined
        ? config.LLM_BACKOFF_BASE_MS
        : (process.env.LLM_BACKOFF_BASE_MS !== undefined
          ? process.env.LLM_BACKOFF_BASE_MS
          : (fileConfig.LLM_BACKOFF_BASE_MS !== undefined
            ? fileConfig.LLM_BACKOFF_BASE_MS
            : 1000)));
    this.backoffBaseMs = parseInt(rawBackoff, 10);
    if (isNaN(this.backoffBaseMs) || this.backoffBaseMs < 0) {
      this.backoffBaseMs = 1000;
    }

    // Mock handler hook for offline / test injection
    this.mockHandler = typeof config.mockHandler === 'function' ? config.mockHandler : null;
  }

  /**
   * Safely reads and parses key-value pairs from a config.env file without mutating process.env.
   * @param {string} [filePath]
   * @returns {object}
   */
  static parseConfigEnv(filePath) {
    let targetPath = null;

    if (filePath) {
      if (fs.existsSync(filePath)) {
        targetPath = filePath;
      } else {
        return {};
      }
    } else {
      const candidatePaths = [
        path.resolve(__dirname, '..', '..', 'config.env'),
        path.resolve(process.cwd(), 'config.env'),
        path.resolve(process.cwd(), 'Plugin', 'NovelEngineering', 'config.env'),
        path.resolve(process.cwd(), 'VCPzhangduan', 'VCPToolBox', 'Plugin', 'NovelEngineering', 'config.env')
      ];
      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          targetPath = p;
          break;
        }
      }
    }

    if (!targetPath) {
      return {};
    }

    try {
      const content = fs.readFileSync(targetPath, 'utf8');
      const result = {};
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
          const key = line.slice(0, eqIdx).trim();
          let val = line.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          result[key] = val;
        }
      }
      return result;
    } catch {
      return {};
    }
  }

  /**
   * Normalizes any base URL or path into a valid OpenAI-compatible /v1/chat/completions endpoint.
   * @param {string} baseURL
   * @returns {string}
   */
  static normalizeEndpoint(baseURL) {
    if (!baseURL || typeof baseURL !== 'string') {
      return 'https://api.openai.com/v1/chat/completions';
    }
    const url = baseURL.trim().replace(/\/+$/, '');
    if (!url) {
      return 'https://api.openai.com/v1/chat/completions';
    }
    if (url.endsWith('/chat/completions')) {
      return url;
    }
    if (url.endsWith('/v1')) {
      return `${url}/chat/completions`;
    }
    return `${url}/v1/chat/completions`;
  }

  /**
   * Masks sensitive API keys for safe logging / error reporting.
   * @param {string} key
   * @returns {string}
   */
  static maskApiKey(key) {
    if (!key || typeof key !== 'string') return '[NONE]';
    const trimmed = key.trim();
    if (trimmed.length === 0) return '[NONE]';
    if (trimmed.length <= 8) return '****';
    return trimmed.substring(0, 3) + '****' + trimmed.substring(trimmed.length - 4);
  }

  /**
   * Strips markdown code fences (```json ... ``` or ``` ... ```) from LLM output.
   * @param {string} text
   * @returns {string}
   */
  static stripJsonFences(text) {
    if (typeof text !== 'string') return '';
    const str = text.trim();
    const exactMatch = str.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (exactMatch) {
      return exactMatch[1].trim();
    }
    const embeddedMatch = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (embeddedMatch) {
      return embeddedMatch[1].trim();
    }
    return str;
  }

  /**
   * Factory creating an isolated ChatClient with deterministic mock responses.
   * @param {Function|string|object|Array} mockHandler
   * @returns {ChatClient}
   */
  static createMockClient(mockHandler) {
    let fn = mockHandler;
    if (typeof mockHandler === 'string') {
      fn = async () => ({ content: mockHandler });
    } else if (Array.isArray(mockHandler)) {
      const queue = [...mockHandler];
      fn = async () => {
        if (queue.length === 0) {
          throw new NovelError('Mock response queue exhausted', 'LLM_MOCK_EXHAUSTED');
        }
        const item = queue.shift();
        return typeof item === 'string' ? { content: item } : item;
      };
    } else if (mockHandler && typeof mockHandler === 'object' && typeof mockHandler !== 'function') {
      fn = async () => mockHandler;
    }

    return new ChatClient({
      apiKey: 'mock-test-key-00000000',
      baseURL: 'https://mock.llm.local/v1',
      mockHandler: fn,
      backoffBaseMs: 1
    });
  }

  /**
   * Checks whether the client has credentials or mock configured.
   * @returns {boolean}
   */
  isConfigured() {
    if (typeof this.mockHandler === 'function') {
      return true;
    }
    return Boolean(this.apiKey && typeof this.apiKey === 'string' && this.apiKey.trim().length > 0);
  }

  /**
   * Executes an OpenAI-compatible chat completion request with exponential backoff retry.
   * @param {object} options
   * @param {Array<{role: string, content: string}>} options.messages
   * @param {string} [options.model]
   * @param {number} [options.temperature=0.7]
   * @param {number} [options.maxTokens]
   * @param {number} [options.timeout]
   * @param {object} [options.responseFormat]
   * @param {string|string[]} [options.stop]
   * @returns {Promise<{content: string, message: {role: string, content: string}, usage: {promptTokens: number, completionTokens: number, totalTokens: number}, model: string, finishReason: string, raw: object}>}
   */
  async chatCompletion(options = {}) {
    const {
      messages,
      model,
      temperature,
      maxTokens,
      max_tokens,
      timeout,
      responseFormat,
      response_format,
      stop
    } = options;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new NovelError(
        'chatCompletion requires a non-empty messages array.',
        'LLM_BAD_REQUEST',
        { messages }
      );
    }

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || typeof msg !== 'object' || msg.content === undefined) {
        throw new NovelError(
          `Invalid message at index ${i}: message must be an object with role and content`,
          'LLM_BAD_REQUEST',
          { index: i, message: msg }
        );
      }
    }

    if (!this.isConfigured()) {
      throw new NovelError(
        'LLM API key is missing and no mock handler is configured.',
        'LLM_KEY_MISSING'
      );
    }

    const requestModel = model || this.model;
    const effectiveMaxTokens = maxTokens !== undefined ? maxTokens : max_tokens;
    const effectiveResponseFormat = responseFormat || response_format;
    const effectiveTimeout = parseInt(timeout || this.timeout, 10);
    const effectiveTemperature = typeof temperature === 'number' ? temperature : 0.7;

    const sanitizedMessages = messages.map(m => ({
      role: m.role || 'user',
      content: typeof m.content === 'string' ? m.content : (m.content === null || m.content === undefined ? '' : String(m.content))
    }));

    const reqBody = {
      model: requestModel,
      messages: sanitizedMessages,
      temperature: effectiveTemperature
    };

    if (effectiveMaxTokens !== undefined && effectiveMaxTokens !== null) {
      reqBody.max_tokens = effectiveMaxTokens;
    }
    if (effectiveResponseFormat) {
      reqBody.response_format = effectiveResponseFormat;
    }
    if (stop !== undefined && stop !== null) {
      reqBody.stop = stop;
    }

    let lastError = null;
    const totalAttempts = this.maxRetries + 1;

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      try {
        let rawResponseData;

        if (this.mockHandler) {
          rawResponseData = await this.mockHandler({
            messages: sanitizedMessages,
            model: requestModel,
            temperature: effectiveTemperature,
            maxTokens: effectiveMaxTokens,
            timeout: effectiveTimeout,
            responseFormat: effectiveResponseFormat,
            stop,
            attempt,
            ...options
          });
        } else {
          const response = await axios.post(
            this.endpoint,
            reqBody,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.apiKey
              },
              timeout: effectiveTimeout
            }
          );
          rawResponseData = response.data;
        }

        return this._formatCompletionResponse(rawResponseData, requestModel);
      } catch (err) {
        lastError = err;
        const status = err.response ? err.response.status : (err.status || null);

        // Fail immediately on explicit client errors / mock exhaustion - no retry
        if (err instanceof NovelError) {
          if (err.code === 'LLM_MOCK_EXHAUSTED' ||
              err.code === 'LLM_RESPONSE_ERROR' ||
              err.code === 'LLM_BAD_REQUEST' ||
              err.code === 'LLM_AUTH_FAILED' ||
              err.code === 'LLM_JSON_PARSE_ERROR') {
            throw err;
          }
        }

        // Fail immediately on 401 / 403 (LLM_AUTH_FAILED) - no retry
        if (status === 401 || status === 403) {
          throw new NovelError(
            `LLM API authentication failed (HTTP ${status}). Key: ${ChatClient.maskApiKey(this.apiKey)}`,
            'LLM_AUTH_FAILED',
            { status, details: err.response?.data || err.message }
          );
        }

        // Fail immediately on 400 / 404 (LLM_BAD_REQUEST) - no retry
        if (status === 400 || status === 404) {
          throw new NovelError(
            `LLM API bad request (HTTP ${status}): ${err.response?.data?.error?.message || err.message}`,
            'LLM_BAD_REQUEST',
            { status, details: err.response?.data || err.message }
          );
        }

        // Retry on 429, 5xx, or network timeouts / socket aborts
        if (attempt < this.maxRetries) {
          const backoffMs = this.backoffBaseMs * Math.pow(2, attempt);
          if (backoffMs > 0) {
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }
          continue;
        }
      }
    }

    const status = lastError.response ? lastError.response.status : (lastError.status || null);
    const isTimeout = lastError.code === 'ECONNABORTED' ||
      (lastError.message && lastError.message.toLowerCase().includes('timeout'));

    let errorCode = 'LLM_UNAVAILABLE';
    if (status === 429) {
      errorCode = 'LLM_RATE_LIMIT';
    } else if (status >= 500 && status < 600) {
      errorCode = 'LLM_SERVER_ERROR';
    } else if (isTimeout) {
      errorCode = 'LLM_TIMEOUT';
    }

    const safeMsg = lastError.response?.data?.error?.message || lastError.message || 'Network error';
    const error = new NovelError(
      `LLM API request failed after ${totalAttempts} attempts: ${safeMsg}`,
      errorCode,
      {
        status,
        attempts: totalAttempts,
        endpoint: this.endpoint,
        model: requestModel,
        causeMessage: lastError.message
      }
    );
    error.cause = lastError;
    throw error;
  }

  /**
   * Normalizes raw response payload into a standard ChatCompletionResult object.
   * @private
   * @param {*} rawResponseData
   * @param {string} requestModel
   * @returns {object}
   */
  _formatCompletionResponse(rawResponseData, requestModel) {
    if (typeof rawResponseData === 'string') {
      const trimmed = rawResponseData.trim();
      return {
        content: trimmed,
        message: {
          role: 'assistant',
          content: trimmed
        },
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0
        },
        model: requestModel,
        finishReason: 'stop',
        raw: { choices: [{ message: { role: 'assistant', content: trimmed } }] }
      };
    }

    if (rawResponseData && typeof rawResponseData === 'object' && typeof rawResponseData.content === 'string' && rawResponseData.message) {
      return {
        content: rawResponseData.content.trim(),
        message: rawResponseData.message,
        usage: rawResponseData.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        model: rawResponseData.model || requestModel,
        finishReason: rawResponseData.finishReason || 'stop',
        raw: rawResponseData.raw || rawResponseData
      };
    }

    if (rawResponseData && typeof rawResponseData === 'object' && typeof rawResponseData.content === 'string') {
      const trimmed = rawResponseData.content.trim();
      return {
        content: trimmed,
        message: {
          role: 'assistant',
          content: trimmed
        },
        usage: rawResponseData.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        model: rawResponseData.model || requestModel,
        finishReason: rawResponseData.finishReason || 'stop',
        raw: rawResponseData.raw || rawResponseData
      };
    }

    if (!rawResponseData || !Array.isArray(rawResponseData.choices) || rawResponseData.choices.length === 0) {
      throw new NovelError(
        'Malformed response from LLM API: choices array missing or empty',
        'LLM_RESPONSE_ERROR',
        { raw: rawResponseData }
      );
    }

    const firstChoice = rawResponseData.choices[0];
    const message = firstChoice.message || { role: 'assistant', content: '' };
    const content = typeof message.content === 'string' ? message.content.trim() : '';
    const finishReason = firstChoice.finish_reason || firstChoice.finishReason || 'stop';
    const rawUsage = rawResponseData.usage || {};

    return {
      content,
      message: {
        role: message.role || 'assistant',
        content
      },
      usage: {
        promptTokens: rawUsage.prompt_tokens || rawUsage.promptTokens || 0,
        completionTokens: rawUsage.completion_tokens || rawUsage.completionTokens || 0,
        totalTokens: rawUsage.total_tokens || rawUsage.totalTokens || 0
      },
      model: rawResponseData.model || requestModel,
      finishReason,
      raw: rawResponseData
    };
  }

  /**
   * Executes a chat completion expecting structured JSON output, stripping markdown code fences.
   * @param {object} options
   * @param {Array<{role: string, content: string}>} options.messages
   * @param {string} [options.model]
   * @param {number} [options.temperature]
   * @param {number} [options.timeout]
   * @param {object} [options.schema]
   * @returns {Promise<object>}
   */
  async chatJsonCompletion(options = {}) {
    const format = options.schema
      ? (typeof options.schema === 'object' && options.schema.type ? options.schema : { type: 'json_object' })
      : { type: 'json_object' };

    const result = await this.chatCompletion({
      ...options,
      responseFormat: format
    });

    const rawText = result && result.content !== undefined ? String(result.content).trim() : '';
    const strippedText = ChatClient.stripJsonFences(rawText);

    try {
      const parsed = JSON.parse(strippedText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !('_rawResponse' in parsed)) {
        Object.defineProperty(parsed, '_rawResponse', {
          value: result,
          enumerable: false,
          writable: true,
          configurable: true
        });
      }
      return parsed;
    } catch (err) {
      throw new NovelError(
        `Failed to parse JSON from LLM response: ${err.message}`,
        'LLM_JSON_PARSE_ERROR',
        {
          rawContent: rawText,
          strippedSnippet: strippedText.slice(0, 300),
          parseError: err.message
        }
      );
    }
  }
}

ChatClient.ChatClient = ChatClient;
module.exports = ChatClient;
