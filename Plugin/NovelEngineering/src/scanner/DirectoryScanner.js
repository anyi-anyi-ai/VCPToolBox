/**
 * @file DirectoryScanner.js
 * @description High-performance, streaming read-only recursive vault scanner with symlink loop protection
 * @module scanner/DirectoryScanner
 * @license MIT
 */

'use strict';

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_IGNORE_PATTERNS = [
  '.git',
  '.obsidian',
  '.trash',
  '.stversions',
  '.vscode',
  '.idea',
  'node_modules',
  'dist',
  'build',
  '__pycache__',
  'data',
  'logs',
  'reports'
];

const DEFAULT_SYSTEM_FILES = new Set([
  '.ds_store',
  'desktop.ini',
  'thumbs.db'
]);

const DEFAULT_ALLOWED_EXTENSIONS = [
  '.md',
  '.markdown',
  '.canvas',
  '.txt'
];

class DirectoryScanner {
  /**
   * @param {object} [options={}]
   * @param {number} [options.concurrency=16] - Maximum concurrent file operations
   * @param {Array<string|RegExp>} [options.ignorePatterns] - Directory / file names or patterns to ignore
   * @param {Array<string>} [options.allowedExtensions] - List of file extensions to include
   * @param {number} [options.maxDepth=50] - Maximum directory depth recursion
   * @param {boolean} [options.followSymlinks=true] - Follow symbolic links and junctions with loop guard
   */
  constructor(options = {}) {
    this.concurrency = Math.max(1, parseInt(options.concurrency, 10) || 16);
    this.ignorePatterns = options.ignorePatterns || [...DEFAULT_IGNORE_PATTERNS];
    this.allowedExtensions = new Set(
      (options.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS).map((ext) => ext.toLowerCase())
    );
    this.maxDepth = options.maxDepth !== undefined ? Number(options.maxDepth) : 50;
    this.followSymlinks = options.followSymlinks !== false;
  }

  /**
   * Static helper for one-shot scan
   * @param {string} vaultPath
   * @param {object} [options={}]
   * @returns {Promise<Array<object>>}
   */
  static async scan(vaultPath, options = {}) {
    const scanner = new DirectoryScanner(options);
    return scanner.scanAll(vaultPath);
  }

  /**
   * Checks whether a directory or file name should be ignored
   * @param {string} name
   * @param {string} [relPath='']
   * @returns {boolean}
   */
  shouldIgnore(name, relPath = '') {
    if (!name) return true;
    const lowerName = name.toLowerCase();

    if (DEFAULT_SYSTEM_FILES.has(lowerName)) {
      return true;
    }

    for (const pattern of this.ignorePatterns) {
      if (typeof pattern === 'string') {
        const lowerPattern = pattern.toLowerCase();
        if (lowerName === lowerPattern) return true;
        if (relPath) {
          const normRel = relPath.replace(/\\/g, '/').toLowerCase();
          const segments = normRel.split('/');
          if (segments.includes(lowerPattern)) return true;
        }
      } else if (pattern instanceof RegExp) {
        if (pattern.test(name) || (relPath && pattern.test(relPath))) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Checks whether file extension is allowed
   * @param {string} fileName
   * @returns {boolean}
   */
  isAllowedExtension(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    return this.allowedExtensions.has(ext);
  }

  /**
   * Normalizes path to POSIX relative path
   * @param {string} rootPath
   * @param {string} absolutePath
   * @returns {string}
   */
  toRelativePosixPath(rootPath, absolutePath) {
    const relative = path.relative(rootPath, absolutePath);
    return relative.split(path.sep).join('/');
  }

  /**
   * Async generator that recursively scans directory yielding file entries
   * @param {string} vaultPath - Root directory to scan
   * @yields {object} Discovered file descriptor
   */
  async *scan(vaultPath) {
    if (!vaultPath || typeof vaultPath !== 'string') {
      throw new Error('Vault path must be a non-empty string.');
    }

    const resolvedRoot = path.resolve(vaultPath);
    const rootStat = await fsp.stat(resolvedRoot, { bigint: true }).catch((err) => {
      throw new Error(`Cannot access vault directory: ${resolvedRoot} (${err.message})`);
    });

    if (!rootStat.isDirectory()) {
      throw new Error(`Vault path is not a directory: ${resolvedRoot}`);
    }

    const visitedInodes = new Set();
    const visitedRealPaths = new Set();

    if (rootStat.dev !== undefined && rootStat.ino !== undefined && rootStat.ino !== 0n) {
      visitedInodes.add(`${rootStat.dev.toString()}:${rootStat.ino.toString()}`);
    }
    visitedRealPaths.add(path.normalize(resolvedRoot).toLowerCase());

    const dirQueue = [{ dirPath: resolvedRoot, depth: 0 }];

    while (dirQueue.length > 0) {
      const { dirPath, depth } = dirQueue.shift();
      if (depth > this.maxDepth) continue;

      let entries;
      try {
        entries = await fsp.readdir(dirPath, { withFileTypes: true });
      } catch (err) {
        // Unreadable folder (e.g. permission issue), skip gracefully
        continue;
      }

      for (const entry of entries) {
        const entryName = entry.name;
        const fullPath = path.join(dirPath, entryName);
        const relPath = this.toRelativePosixPath(resolvedRoot, fullPath);

        if (this.shouldIgnore(entryName, relPath)) {
          continue;
        }

        let stat;
        try {
          if (entry.isSymbolicLink()) {
            if (!this.followSymlinks) continue;
            stat = await fsp.stat(fullPath, { bigint: true });
          } else {
            stat = await fsp.stat(fullPath, { bigint: true });
          }
        } catch {
          // Dead symlink or unreadable file
          continue;
        }

        if (stat.isDirectory()) {
          const hasValidInode = stat.dev !== undefined && stat.ino !== undefined && stat.ino !== 0n;
          const inodeKey = hasValidInode ? `${stat.dev.toString()}:${stat.ino.toString()}` : null;

          if (inodeKey && visitedInodes.has(inodeKey)) {
            // Cyclical junction / symlink detected via 64-bit Inode, prevent infinite loop
            continue;
          }

          let normRealPath = null;
          if (entry.isSymbolicLink() || !hasValidInode) {
            try {
              const realDirPath = await fsp.realpath(fullPath);
              normRealPath = path.normalize(realDirPath).toLowerCase();
              if (visitedRealPaths.has(normRealPath)) {
                // Cyclical symlink detected via canonical realpath
                continue;
              }
              visitedRealPaths.add(normRealPath);
            } catch {
              // Ignore realpath error, proceed with inode tracking
            }
          }

          if (inodeKey) {
            visitedInodes.add(inodeKey);
          }
          if (!normRealPath) {
            visitedRealPaths.add(path.normalize(fullPath).toLowerCase());
          }

          dirQueue.push({ dirPath: fullPath, depth: depth + 1 });
        } else if (stat.isFile()) {
          if (!this.isAllowedExtension(entryName)) {
            continue;
          }

          yield {
            absolutePath: fullPath,
            relativePath: relPath,
            fileName: entryName,
            extension: path.extname(entryName).toLowerCase(),
            size: stat.size !== undefined ? Number(stat.size) : 0,
            mtimeMs: stat.mtimeMs !== undefined ? Number(stat.mtimeMs) : (stat.mtime ? stat.mtime.getTime() : 0),
            birthtimeMs: stat.birthtimeMs !== undefined ? Number(stat.birthtimeMs) : (stat.birthtime ? stat.birthtime.getTime() : 0),
            dev: stat.dev !== undefined ? stat.dev.toString() : '0',
            ino: stat.ino !== undefined ? stat.ino.toString() : '0'
          };
        }
      }
    }
  }

  /**
   * Collect all files matching criteria into an array
   * @param {string} vaultPath
   * @returns {Promise<Array<object>>}
   */
  async scanAll(vaultPath) {
    const results = [];
    for await (const file of this.scan(vaultPath)) {
      results.push(file);
    }
    return results;
  }
}

module.exports = DirectoryScanner;
