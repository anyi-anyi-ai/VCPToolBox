/**
 * @file NovelError.js
 * @description Base class for all NovelEngineering typed errors with structured codes, details, and JSON-RPC serialization.
 * @module errors/NovelError
 */

'use strict';

class NovelError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {string} [code='NOVEL_ERROR'] - Machine-readable error code
   * @param {object} [details={}] - Structured context metadata
   */
  constructor(message, code = 'NOVEL_ERROR', details = {}) {
    // Handle both (message, code, details) and (message, { code, details })
    let errCode = code;
    let errDetails = details;
    if (code && typeof code === 'object' && !Array.isArray(code)) {
      errCode = code.code || 'NOVEL_ERROR';
      errDetails = code.details || code;
    }

    super(message);
    this.name = this.constructor.name;
    this.code = errCode || 'NOVEL_ERROR';
    this.details = errDetails && typeof errDetails === 'object' ? { ...errDetails } : {};
    this.context = this.details;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes error to a standard JSON object for stdout responses
   * @returns {object}
   */
  toJSON() {
    return {
      status: 'error',
      name: this.name,
      code: this.code,
      error: this.message,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp
    };
  }

  toString() {
    return `[${this.name}:${this.code}] ${this.message}`;
  }
}

module.exports = NovelError;
