/**
 * @file FrontmatterParser.js
 * @description Fault-tolerant YAML frontmatter parser and Markdown tokenizer with dirty YAML recovery
 * @module scanner/FrontmatterParser
 * @license MIT
 */

'use strict';

const yaml = require('js-yaml');

class FrontmatterParser {
  /**
   * Parses Markdown content, extracting frontmatter, body, wikilinks, tags, and structure
   * @param {string} fileContent - Raw file content
   * @returns {object} Parsed document structure
   */
  static parse(fileContent) {
    if (fileContent === null || fileContent === undefined || typeof fileContent !== 'string') {
      return {
        frontmatter: {},
        body: '',
        rawFrontmatter: null,
        hasFrontmatter: false,
        isCorrupted: false,
        parseError: null,
        wikilinks: [],
        tags: [],
        headings: [],
        lineCount: 0,
        wordCount: 0,
        isBodyEmpty: true
      };
    }

    // 1. Strip UTF-8 BOM
    const content = fileContent.replace(/^\uFEFF/, '');
    const lineCount = content.length === 0 ? 0 : content.split(/\r?\n/).length;

    let frontmatter = {};
    let rawFrontmatter = null;
    let body = content;
    let hasFrontmatter = false;
    let isCorrupted = false;
    let parseError = null;

    // 2. Check for YAML frontmatter block
    if (content.startsWith('---')) {
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

      if (match) {
        hasFrontmatter = true;
        rawFrontmatter = match[1];
        body = match[2];

        try {
          const normalizedYaml = rawFrontmatter.includes('：') ? rawFrontmatter.replace(/：\s*/g, ': ') : rawFrontmatter;
          const parsed = yaml.load(normalizedYaml, { schema: yaml.DEFAULT_SCHEMA });
          if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed)) {
              frontmatter = { items: parsed };
            } else {
              frontmatter = parsed;
            }
          } else if (parsed !== null && parsed !== undefined) {
            if (typeof parsed === 'string' && rawFrontmatter.includes('：')) {
              frontmatter = this._recoverDirtyYaml(rawFrontmatter);
            } else {
              frontmatter = { value: parsed };
            }
          } else {
            frontmatter = this._recoverDirtyYaml(rawFrontmatter);
          }
        } catch (err) {
          // Dirty YAML detected: attempt regex recovery
          isCorrupted = true;
          parseError = err.message || 'YAML parsing error';
          frontmatter = this._recoverDirtyYaml(rawFrontmatter);
        }
      } else {
        // Starts with --- but no matching closing --- delimiter
        const remaining = content.slice(3);
        if (!remaining.includes('---')) {
          isCorrupted = true;
          hasFrontmatter = false;
          parseError = 'Unclosed YAML frontmatter delimiter';
          rawFrontmatter = content;
          body = content;
        }
      }
    }

    // 3. Extract wikilinks from body and content
    const wikilinks = this.extractWikilinks(body);

    // 4. Extract tags (from frontmatter and markdown body)
    const tags = this.extractTags(body, frontmatter);

    // 5. Extract headings
    const headings = this.extractHeadings(body);

    // 6. Compute word count
    const wordCount = this.calculateWordCount(body);
    const isBodyEmpty = body.trim().length === 0;

    return {
      frontmatter,
      body,
      rawFrontmatter,
      hasFrontmatter,
      isCorrupted,
      parseError,
      wikilinks,
      tags,
      headings,
      lineCount,
      wordCount,
      isBodyEmpty
    };
  }

  /**
   * Fallback parser to extract key-value pairs from malformed or dirty YAML
   * @private
   * @param {string} rawYaml
   * @returns {object} Recovered key-value dictionary
   */
  static _recoverDirtyYaml(rawYaml) {
    if (!rawYaml) return {};
    const result = {};
    const lines = rawYaml.split(/\r?\n/);

    let currentArrayKey = null;
    let currentArray = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // Handle array items: - item
      if (line.startsWith('- ') && currentArrayKey) {
        const itemVal = line.slice(2).trim().replace(/^["']|["']$/g, '');
        currentArray.push(itemVal);
        result[currentArrayKey] = currentArray;
        continue;
      }

      // Check standard key: value or Chinese colon key：value
      const kvMatch = line.match(/^([a-zA-Z0-9_\u4e00-\u9fa5-]+)\s*[:：]\s*(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        let val = kvMatch[2].trim();

        if (!val) {
          // Could be starting a list
          currentArrayKey = key;
          currentArray = [];
          continue;
        }

        currentArrayKey = null;

        // Strip surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1).trim();
        } else if (val.startsWith('[') && val.endsWith(']')) {
          // Inline list [a, b, c]
          const inner = val.slice(1, -1).trim();
          val = inner
            ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
            : [];
        } else if (val.toLowerCase() === 'true') {
          val = true;
        } else if (val.toLowerCase() === 'false') {
          val = false;
        } else if (/^-?\d+(\.\d+)?$/.test(val)) {
          val = Number(val);
        }

        result[key] = val;
      }
    }

    return result;
  }

  /**
   * Extracts Obsidian [[Wikilinks]] with line numbers and alias support
   * @param {string} text
   * @returns {Array<{ target: string, alias: string|null, raw: string, line: number }>}
   */
  static extractWikilinks(text) {
    if (!text || typeof text !== 'string') return [];

    const results = [];
    const lines = text.split(/\r?\n/);
    const regex = /\[\[([^\]\r\n|]+)(?:\|([^\]\r\n]+))?\]\]/g;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      let match;
      while ((match = regex.exec(line)) !== null) {
        const target = match[1].trim();
        const alias = match[2] ? match[2].trim() : null;
        results.push({
          target,
          alias,
          raw: match[0],
          line: lineIndex + 1
        });
      }
    }

    return results;
  }

  /**
   * Extracts tags from frontmatter and markdown body (#tag)
   * @param {string} text
   * @param {object} [frontmatter={}]
   * @returns {Array<string>} Unique list of tags without leading '#'
   */
  static extractTags(text, frontmatter = {}) {
    const tagSet = new Set();

    // From frontmatter
    if (frontmatter.tags) {
      if (Array.isArray(frontmatter.tags)) {
        for (const t of frontmatter.tags) {
          if (typeof t === 'string' && t.trim()) {
            tagSet.add(t.trim().replace(/^#/, ''));
          }
        }
      } else if (typeof frontmatter.tags === 'string') {
        frontmatter.tags
          .split(/[\s,]+/)
          .filter(Boolean)
          .forEach((t) => tagSet.add(t.trim().replace(/^#/, '')));
      }
    }

    if (frontmatter.tag) {
      if (typeof frontmatter.tag === 'string') {
        tagSet.add(frontmatter.tag.trim().replace(/^#/, ''));
      }
    }

    // From markdown body (matches #tag but avoids markdown headings like # Header)
    if (text && typeof text === 'string') {
      const bodyTagRegex = /(?:^|\s)#([^\s#.,;:!?，。！？()[\]{}<>]+)(?=\s|$|[.,;:!?，。！？()[\]{}<>])/gu;
      let match;
      while ((match = bodyTagRegex.exec(text)) !== null) {
        const tag = match[1].trim();
        if (tag) {
          tagSet.add(tag);
        }
      }
    }

    return Array.from(tagSet);
  }

  /**
   * Extracts markdown headings
   * @param {string} text
   * @returns {Array<{ level: number, text: string, line: number }>}
   */
  static extractHeadings(text) {
    if (!text || typeof text !== 'string') return [];

    const headings = [];
    const lines = text.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].trim(),
          line: i + 1
        });
      }
    }

    return headings;
  }

  /**
   * Calculates word count (Han characters + alphanumeric words)
   * @param {string} text
   * @returns {number}
   */
  static calculateWordCount(text) {
    if (!text || typeof text !== 'string') return 0;

    // Match Han Chinese characters
    const hanMatches = text.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g);
    const hanCount = hanMatches ? hanMatches.length : 0;

    // Replace Han characters and match Western words
    const stripped = text.replace(/[\u4e00-\u9fa5\u3400-\u4dbf]/g, ' ');
    const westernMatches = stripped.match(/[a-zA-Z0-9_-]+/g);
    const westernCount = westernMatches ? westernMatches.length : 0;

    return hanCount + westernCount;
  }
}

module.exports = FrontmatterParser;
