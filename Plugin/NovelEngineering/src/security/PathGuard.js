/**
 * @file PathGuard.js
 * @description Security Sandbox & Zero-Mutation Boundary Kernel for VCPNovelManager
 * @module security/PathGuard
 * @license MIT
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { SecurityViolationError } = require('../errors');

/**
 * Standard Security Error for all boundary and mutation violations.
 */
class SecurityError extends SecurityViolationError {
  /**
   * @param {string} message
   * @param {object|string} [detailsOrCode]
   * @param {string} [requestedPath]
   * @param {string} [allowedBase]
   */
  constructor(message, detailsOrCode = {}, requestedPath = null, allowedBase = null) {
    super(message);
    this.name = 'SecurityError';

    if (typeof detailsOrCode === 'string') {
      this.code = detailsOrCode;
      this.targetPath = requestedPath;
      this.requestedPath = requestedPath;
      this.allowedRoot = allowedBase;
      this.allowedBase = allowedBase;
      this.operation = 'unknown';
      this.timestamp = new Date().toISOString();
    } else if (typeof detailsOrCode === 'object' && detailsOrCode !== null) {
      this.code = detailsOrCode.code || 'ERR_SECURITY_VIOLATION';
      this.targetPath = detailsOrCode.targetPath || detailsOrCode.requestedPath || requestedPath;
      this.requestedPath = this.targetPath;
      this.allowedRoot = detailsOrCode.allowedRoot || detailsOrCode.allowedBase || allowedBase;
      this.allowedBase = this.allowedRoot;
      this.operation = detailsOrCode.operation || 'unknown';
      this.timestamp = detailsOrCode.timestamp || new Date().toISOString();
    } else {
      this.code = 'ERR_SECURITY_VIOLATION';
      this.targetPath = requestedPath;
      this.requestedPath = requestedPath;
      this.allowedRoot = allowedBase;
      this.allowedBase = allowedBase;
      this.operation = 'unknown';
      this.timestamp = new Date().toISOString();
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SecurityError);
    }
  }

  toJSON() {
    return {
      status: 'error',
      error: this.name,
      code: this.code,
      message: this.message,
      targetPath: this.targetPath,
      requestedPath: this.requestedPath,
      allowedRoot: this.allowedRoot,
      allowedBase: this.allowedBase,
      operation: this.operation,
      timestamp: this.timestamp
    };
  }
}

/**
 * PathGuard Kernel: Enforces strict sandboxing and zero-mutation guarantees.
 */
class PathGuard {
  /**
   * @param {object} [options]
   * @param {string} [options.pluginRoot] - Absolute path to allowed plugin sandbox root.
   * @param {string} [options.baseDir] - Alias for pluginRoot.
   * @param {string} [options.vaultRoot] - Optional active target Obsidian vault root.
   * @param {string} [options.vaultPath] - Alias for vaultRoot.
   * @param {string[]} [options.allowedSubdirs] - Optional list of allowed subdirectories.
   */
  constructor(options = {}) {
    const rawRoot = options.pluginRoot || options.baseDir || path.resolve(__dirname, '..', '..');
    this.pluginRoot = this._canonicalizeExisting(rawRoot);
    this.baseDir = this.pluginRoot;

    const rawVault = options.vaultRoot || options.vaultPath || null;
    this.vaultRoot = rawVault ? this._canonicalizeExisting(rawVault) : null;
    this.vaultPath = this.vaultRoot;

    this.allowedSubdirs = options.allowedSubdirs || ['data', 'logs', 'reports', 'temp', 'test'];

    // Check for illegal collision where vault and sandbox are identical
    if (this.vaultRoot && this._isSamePath(this.pluginRoot, this.vaultRoot)) {
      throw new SecurityError(
        'Critical Configuration Error: Plugin sandbox root cannot be identical to target vault root.',
        'ERR_VAULT_SANDBOX_COLLISION',
        this.vaultRoot,
        this.pluginRoot
      );
    }
  }

  /**
   * Sets or updates the active target Obsidian vault root.
   * @param {string} vaultPath
   */
  setVaultRoot(vaultPath) {
    if (!vaultPath || typeof vaultPath !== 'string') {
      this.vaultRoot = null;
      this.vaultPath = null;
      return;
    }
    const resolved = this._canonicalizeExisting(vaultPath);
    if (this._isSamePath(this.pluginRoot, resolved)) {
      throw new SecurityError(
        'Critical Configuration Error: Target vault root cannot overlap with plugin sandbox root.',
        'ERR_VAULT_SANDBOX_COLLISION',
        resolved,
        this.pluginRoot
      );
    }
    this.vaultRoot = resolved;
    this.vaultPath = resolved;
  }

  /**
   * Checks whether a target path is inside the active vault directory.
   * @param {string} targetPath
   * @returns {boolean}
   */
  isVaultPath(targetPath) {
    if (!this.vaultRoot || typeof targetPath !== 'string' || !targetPath.trim()) {
      return false;
    }
    try {
      const resolved = path.resolve(this.baseDir, targetPath);
      const canonical = this._getCanonicalPath(resolved);
      return this._isPathInside(canonical, this.vaultRoot);
    } catch {
      return false;
    }
  }

  /**
   * Asserts that a path is NOT located inside the target vault.
   * @param {string} targetPath
   */
  assertNoVaultWrite(targetPath) {
    if (this.isVaultPath(targetPath)) {
      throw new SecurityError(
        `Zero-Mutation Violation: Write blocked on target vault path: ${targetPath}`,
        'ERR_VAULT_WRITE_BLOCKED',
        targetPath,
        this.vaultRoot
      );
    }
  }

  /**
   * Validates path syntax, character safety, DOS devices, and NTFS ADS.
   * @param {string} inputPath
   * @throws {SecurityError|TypeError}
   * @returns {string} Fully resolved path
   */
  validatePathSyntax(inputPath) {
    if (inputPath === null || inputPath === undefined || typeof inputPath !== 'string') {
      throw new TypeError('Path must be a non-empty string.');
    }

    if (inputPath.trim().length === 0) {
      throw new SecurityError('Path cannot be empty or whitespace only.', 'ERR_INVALID_PATH', inputPath, this.baseDir);
    }

    if (inputPath.includes('\0')) {
      throw new SecurityError('Null byte injection detected in path.', 'ERR_INVALID_PATH', inputPath, this.baseDir);
    }

    // URL-encoded traversal sequences check (%2e%2e, %2f, %5c)
    if (/%2e/i.test(inputPath) || /%2f/i.test(inputPath) || /%5c/i.test(inputPath)) {
      throw new SecurityError(
        `URL-encoded traversal sequence detected: ${inputPath}`,
        'ERR_PATH_TRAVERSAL',
        inputPath,
        this.baseDir
      );
    }

    // Windows UNC network share paths check
    if (inputPath.startsWith('\\\\') || inputPath.startsWith('//')) {
      throw new SecurityError(
        `UNC network share paths are prohibited: ${inputPath}`,
        'ERR_PATH_OUTSIDE_SANDBOX',
        inputPath,
        this.baseDir
      );
    }

    // Windows NTFS Alternate Data Streams (ADS) detection
    const pathWithoutDrive = inputPath.replace(/^[a-zA-Z]:/, '');
    if (pathWithoutDrive.includes(':')) {
      throw new SecurityError(
        'NTFS Alternate Data Streams (colon syntax) are prohibited.',
        'ERR_ADS_STREAM_DETECTED',
        inputPath,
        this.baseDir
      );
    }

    // Windows DOS Reserved Device Names & trailing space/dot check
    const segments = inputPath.split(/[\\/]/).filter(Boolean);
    const DOS_DEVICE_REGEX = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;
    for (const segment of segments) {
      if (DOS_DEVICE_REGEX.test(segment)) {
        throw new SecurityError(
          `Windows reserved DOS device name detected: ${segment}`,
          'ERR_RESERVED_DEVICE_NAME',
          inputPath,
          this.baseDir
        );
      }
      if (process.platform === 'win32' && segment !== '.' && segment !== '..' && (segment.endsWith(' ') || segment.endsWith('.'))) {
        throw new SecurityError(
          `Path segment has dangerous trailing dot or space: "${segment}"`,
          'ERR_INVALID_PATH',
          inputPath,
          this.baseDir
        );
      }
    }

    return path.resolve(this.baseDir, inputPath);
  }

  /**
   * Asserts that a path is authorized for write operations.
   * Throws SecurityError if outside plugin sandbox or targeting vault.
   * @param {string} targetPath
   * @param {string} [operation='write']
   * @returns {string} Canonical validated writable path
   */
  assertWritablePath(targetPath, operation = 'write') {
    const resolved = this.validatePathSyntax(targetPath);

    // 1. Check zero-mutation vault protection
    this.assertNoVaultWrite(targetPath);
    this.assertNoVaultWrite(resolved);

    const canonical = this._getCanonicalPath(resolved);
    this.assertNoVaultWrite(canonical);

    // 2. Check if inside allowed plugin sandbox
    if (!this._isPathInside(canonical, this.pluginRoot)) {
      throw new SecurityError(
        `Sandbox Violation: Write operation '${operation}' blocked outside plugin root: ${canonical}`,
        'ERR_PATH_OUTSIDE_SANDBOX',
        canonical,
        this.pluginRoot
      );
    }

    return canonical;
  }

  /**
   * Asserts that a target path resides within the plugin sandbox.
   * @param {string} targetPath
   * @param {string} [operation='sandbox_access']
   * @returns {string} Canonical path inside sandbox
   */
  assertSandboxPath(targetPath, operation = 'sandbox_access') {
    return this.assertWritablePath(targetPath, operation);
  }

  /**
   * Asserts that a chapter draft path is strictly authorized for writing in 13_小说工程插件/篇章草稿/
   * Enforces 100% hard veto on writes to 01_ through 12_ setting folders.
   * @param {string} targetPath
   * @param {string} [explicitVaultRoot=null]
   * @param {string} [operation='draft_write']
   * @returns {string} Canonical validated writable draft path
   */
  assertDraftWritablePath(targetPath, explicitVaultRoot = null, operation = 'draft_write') {
    // 1. Strict syntax and character validation
    this.validatePathSyntax(targetPath);

    // 2. Determine effective vault root
    const rawVault = explicitVaultRoot || this.vaultRoot || (this.config && this.config.VAULT_ROOT) || (this.config && this.config.DEFAULT_WORLDTREE_PATH) || null;
    if (!rawVault) {
      throw new SecurityError(
        'Target vault root is required for chapter draft writing authorization.',
        'ERR_VAULT_ROOT_UNSPECIFIED',
        targetPath,
        this.baseDir
      );
    }

    const canonicalVault = this._canonicalizeExisting(rawVault);

    // Resolve target path against vault
    const resolved = path.isAbsolute(targetPath)
      ? path.resolve(targetPath)
      : path.resolve(canonicalVault, targetPath);

    const canonicalTarget = this._getCanonicalPath(resolved);

    // 3. Compute relative path from vault root
    const compTarget = process.platform === 'win32' ? canonicalTarget.toLowerCase() : canonicalTarget;
    const compVault = process.platform === 'win32' ? canonicalVault.toLowerCase() : canonicalVault;

    const relFromVault = path.relative(canonicalVault, canonicalTarget).replace(/\\/g, '/');

    // 4. Check for traversal escaping vault root
    if (relFromVault.startsWith('..') || !compTarget.startsWith(compVault)) {
      throw new SecurityError(
        `Directory traversal detected escaping vault root: ${targetPath}`,
        'ERR_PATH_TRAVERSAL',
        canonicalTarget,
        canonicalVault
      );
    }

    // 5. 100% HARD VETO on 01_ through 12_ setting folders
    const segments = relFromVault.split('/').filter(Boolean);
    const SETTING_FOLDER_REGEX = /^(0[1-9]|1[0-2])($|[_-])/i;

    for (const segment of segments) {
      if (SETTING_FOLDER_REGEX.test(segment)) {
        throw new SecurityError(
          `Zero-Mutation Violation: Write attempt strictly blocked on setting folder 01~12: "${relFromVault}"`,
          'ERR_VAULT_WRITE_BLOCKED',
          canonicalTarget,
          canonicalVault
        );
      }
    }

    // 6. Must reside strictly in authorized draft sandbox: 13_小说工程插件/篇章草稿/ or 13_*
    const isSandboxAuthorized = segments.length > 0 && (/^13($|[_-])/i.test(segments[0]) || relFromVault.startsWith('13_小说工程插件'));
    if (!isSandboxAuthorized) {
      throw new SecurityError(
        `Sandbox Isolation Violation: Draft write target "${relFromVault}" is outside authorized sandbox 13_小说工程插件/篇章草稿/`,
        'ERR_VAULT_WRITE_BLOCKED',
        canonicalTarget,
        canonicalVault
      );
    }

    // 7. Symlink / Junction Escape Check: Verify that the canonical path does not resolve outside draft sandbox
    let checkDir = path.dirname(resolved);
    while (checkDir && checkDir !== canonicalVault && checkDir !== path.dirname(checkDir)) {
      if (fs.existsSync(checkDir)) {
        try {
          const lstat = fs.lstatSync(checkDir);
          if (lstat.isSymbolicLink()) {
            const realDir = fs.realpathSync.native(checkDir);
            const compRealDir = process.platform === 'win32' ? realDir.toLowerCase() : realDir;
            if (!compRealDir.startsWith(compVault) || SETTING_FOLDER_REGEX.test(path.relative(canonicalVault, realDir).split(path.sep)[0])) {
              throw new SecurityError(
                `Symlink/Junction escape detected: "${checkDir}" points outside authorized sandbox to "${realDir}"`,
                'ERR_VAULT_WRITE_BLOCKED',
                checkDir,
                canonicalVault
              );
            }
          }
        } catch (err) {
          if (err instanceof SecurityError) throw err;
        }
      }
      checkDir = path.dirname(checkDir);
    }

    // 8. Ensure parent directory exists inside sandbox
    const parentDir = path.dirname(canonicalTarget);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    return canonicalTarget;
  }

  /**
   * Helper to retrieve or create the designated draft sandbox directory
   * @param {string} [explicitVaultRoot=null]
   * @returns {string}
   */
  getAuthorizedDraftDir(explicitVaultRoot = null) {
    const rawVault = explicitVaultRoot || this.vaultRoot || (this.config && this.config.VAULT_ROOT) || (this.config && this.config.DEFAULT_WORLDTREE_PATH) || null;
    if (!rawVault) {
      throw new SecurityError(
        'Target vault root is required to resolve draft directory.',
        'ERR_VAULT_ROOT_UNSPECIFIED',
        null,
        this.baseDir
      );
    }
    const canonicalVault = this._canonicalizeExisting(rawVault);
    const draftDir = path.join(canonicalVault, '13_小说工程插件', '篇章草稿');
    if (!fs.existsSync(draftDir)) {
      fs.mkdirSync(draftDir, { recursive: true });
    }
    return this._getCanonicalPath(draftDir);
  }

  /**
   * Asserts that a read operation uses safe read-only flags and valid path.
   * @param {string} targetPath
   * @param {string|number} [flags='r']
   * @param {string} [operation='read']
   * @returns {string} Canonical validated readable path
   */
  assertReadOnlyPath(targetPath, flags = 'r', operation = 'read') {
    const resolved = this.validatePathSyntax(targetPath);
    const canonical = this._getCanonicalPath(resolved);

    // Validate flag safety
    this.assertReadOnlyFlag(flags, operation, canonical);

    return canonical;
  }

  /**
   * Validates that file open flags contain NO write or mutation permissions.
   * @param {string|number} flags
   * @param {string} [operation='open']
   * @param {string} [targetPath='']
   */
  assertReadOnlyFlag(flags, operation = 'open', targetPath = '') {
    const readOnlyStringFlags = new Set(['r', 'rs', 'sr']);
    const writeStringFlags = new Set([
      'r+', 'rs+', 'sr+', 'w', 'w+', 'wx', 'w+x', 'xw', 'xw+', 'a', 'a+', 'ax', 'a+x', 'xa', 'xa+'
    ]);

    if (typeof flags === 'string') {
      if (readOnlyStringFlags.has(flags)) {
        return;
      }
      if (writeStringFlags.has(flags)) {
        throw new SecurityError(
          `Security Violation: Illegal write/mutate flag '${flags}' specified for read operation '${operation}'`,
          'ERR_INVALID_FILE_FLAG',
          targetPath,
          this.baseDir
        );
      }
      throw new SecurityError(
        `Security Violation: Unrecognized file flag '${flags}'`,
        'ERR_INVALID_FILE_FLAG',
        targetPath,
        this.baseDir
      );
    } else if (typeof flags === 'number') {
      const O_RDWR = fs.constants.O_RDWR || 2;
      const O_WRONLY = fs.constants.O_WRONLY || 1;
      const O_CREAT = fs.constants.O_CREAT || 256;
      const O_TRUNC = fs.constants.O_TRUNC || 512;
      const O_APPEND = fs.constants.O_APPEND || 8;

      if (
        (flags & O_RDWR) !== 0 ||
        (flags & O_WRONLY) !== 0 ||
        (flags & O_CREAT) !== 0 ||
        (flags & O_TRUNC) !== 0 ||
        (flags & O_APPEND) !== 0
      ) {
        throw new SecurityError(
          `Security Violation: Numeric open flags (0x${flags.toString(16)}) contain write/create bitmasks.`,
          'ERR_INVALID_FILE_FLAG',
          targetPath,
          this.baseDir
        );
      }
    }
  }

  /**
   * Safely joins segments against baseDir preventing directory traversal.
   * @param {string} base
   * @param  {...string} segments
   * @returns {string}
   */
  safeJoin(base, ...segments) {
    if (typeof base !== 'string' || !base.trim()) {
      throw new TypeError('Base path must be a non-empty string.');
    }
    const joined = path.join(base, ...segments);
    const resolved = path.resolve(joined);
    const canonicalBase = this._getCanonicalPath(path.resolve(base));
    const canonicalTarget = this._getCanonicalPath(resolved);

    if (!this._isPathInside(canonicalTarget, canonicalBase)) {
      throw new SecurityError(
        `Directory traversal detected escaping base: ${joined}`,
        'ERR_PATH_TRAVERSAL',
        canonicalTarget,
        canonicalBase
      );
    }
    return canonicalTarget;
  }

  /**
   * Canonicalizes path handling Windows drive letters, case, slashes, and 8.3 names.
   * @param {string} inputPath
   * @returns {string}
   */
  normalizePath(inputPath) {
    const resolved = path.resolve(this.baseDir, inputPath);
    return this._getCanonicalPath(resolved);
  }

  /**
   * Helper to retrieve a safe, pre-validated path in plugin/data/
   * @param {string} filename
   * @returns {string}
   */
  getSafeDataPath(filename) {
    const dataDir = path.join(this.pluginRoot, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const fullPath = path.join(dataDir, filename);
    return this.assertWritablePath(fullPath, 'create_data_file');
  }

  /**
   * Helper to retrieve a safe, pre-validated path in plugin/logs/
   * @param {string} filename
   * @returns {string}
   */
  getSafeLogPath(filename) {
    const logDir = path.join(this.pluginRoot, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const fullPath = path.join(logDir, filename);
    return this.assertWritablePath(fullPath, 'create_log_file');
  }

  /**
   * Helper to retrieve a safe, pre-validated path in plugin/reports/
   * @param {string} filename
   * @returns {string}
   */
  getSafeReportPath(filename) {
    const reportDir = path.join(this.pluginRoot, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const fullPath = path.join(reportDir, filename);
    return this.assertWritablePath(fullPath, 'create_report_file');
  }

  /**
   * Helper to retrieve or create a safe, pre-validated path in plugin/data/snapshots/
   * @param {string} [filename='']
   * @returns {string} Canonical validated snapshot path or snapshot directory
   */
  getSafeSnapshotPath(filename = '') {
    const snapDir = path.join(this.pluginRoot, 'data', 'snapshots');
    if (!fs.existsSync(snapDir)) {
      fs.mkdirSync(snapDir, { recursive: true });
    }
    const fullPath = filename ? path.join(snapDir, filename) : snapDir;
    return this.assertWritablePath(fullPath, 'create_snapshot_file');
  }

  /**
   * Helper to retrieve or create the designated snapshots directory inside sandbox
   * @returns {string} Canonical snapshot directory path
   */
  getSafeSnapshotDir() {
    return this.getSafeSnapshotPath('');
  }

  /**
   * Helper to retrieve or create a safe, pre-validated path in plugin/data/rag_corpus/
   * @param {string} [subpath='']
   * @returns {string} Canonical validated RAG corpus path or RAG directory
   */
  getSafeRagCorpusPath(subpath = '') {
    const ragDir = path.join(this.pluginRoot, 'data', 'rag_corpus');
    if (!fs.existsSync(ragDir)) {
      fs.mkdirSync(ragDir, { recursive: true });
    }
    const fullPath = subpath ? path.join(ragDir, subpath) : ragDir;
    return this.assertWritablePath(fullPath, 'create_rag_file');
  }

  /**
   * Helper to retrieve or create the designated RAG corpus directory inside sandbox
   * @returns {string} Canonical RAG corpus directory path
   */
  getSafeRagCorpusDir() {
    return this.getSafeRagCorpusPath('');
  }

  /**
   * Creates an intercepted SafeFs wrapper around Node's fs module.
   * @param {object} [baseFs=require('fs')]
   * @returns {object} Wrapped fs with automatic assertion checks
   */
  createSafeFs(baseFs = fs) {
    const self = this;
    const safeFsPromises = {
      ...baseFs.promises,
      writeFile: (filePath, data, options) => {
        const safePath = self.assertWritablePath(filePath, 'writeFile');
        return baseFs.promises.writeFile(safePath, data, options);
      },
      appendFile: (filePath, data, options) => {
        const safePath = self.assertWritablePath(filePath, 'appendFile');
        return baseFs.promises.appendFile(safePath, data, options);
      },
      unlink: (filePath) => {
        const safePath = self.assertWritablePath(filePath, 'unlink');
        return baseFs.promises.unlink(safePath);
      },
      mkdir: (dirPath, options) => {
        const safePath = self.assertWritablePath(dirPath, 'mkdir');
        return baseFs.promises.mkdir(safePath, options);
      },
      rm: (dirPath, options) => {
        const safePath = self.assertWritablePath(dirPath, 'rm');
        return baseFs.promises.rm(safePath, options);
      },
      open: (filePath, flags = 'r', mode) => {
        self.assertReadOnlyFlag(flags, 'promises.open', String(filePath));
        return baseFs.promises.open(filePath, flags, mode);
      },
      readFile: (filePath, options) => {
        const safePath = self.assertReadOnlyPath(filePath, 'r', 'readFile');
        return baseFs.promises.readFile(safePath, options);
      }
    };

    return {
      ...baseFs,
      promises: safeFsPromises,
      writeFileSync: (filePath, data, options) => {
        const safePath = self.assertWritablePath(filePath, 'writeFileSync');
        return baseFs.writeFileSync(safePath, data, options);
      },
      appendFileSync: (filePath, data, options) => {
        const safePath = self.assertWritablePath(filePath, 'appendFileSync');
        return baseFs.appendFileSync(safePath, data, options);
      },
      unlinkSync: (filePath) => {
        const safePath = self.assertWritablePath(filePath, 'unlinkSync');
        return baseFs.unlinkSync(safePath);
      },
      mkdirSync: (dirPath, options) => {
        const safePath = self.assertWritablePath(dirPath, 'mkdirSync');
        return baseFs.mkdirSync(safePath, options);
      },
      rmSync: (dirPath, options) => {
        const safePath = self.assertWritablePath(dirPath, 'rmSync');
        return baseFs.rmSync(safePath, options);
      },
      openSync: (filePath, flags = 'r', mode) => {
        self.assertReadOnlyFlag(flags, 'openSync', String(filePath));
        return baseFs.openSync(filePath, flags, mode);
      },
      readFileSync: (filePath, options) => {
        const safePath = self.assertReadOnlyPath(filePath, 'r', 'readFileSync');
        return baseFs.readFileSync(safePath, options);
      },
      createReadStream: (filePath, options = {}) => {
        const flags = options.flags || 'r';
        self.assertReadOnlyFlag(flags, 'createReadStream', String(filePath));
        return baseFs.createReadStream(filePath, options);
      },
      createWriteStream: (filePath, options = {}) => {
        const safePath = self.assertWritablePath(filePath, 'createWriteStream');
        return baseFs.createWriteStream(safePath, options);
      }
    };
  }

  // --- Internal Helpers ---

  _canonicalizeExisting(targetPath) {
    const resolved = path.resolve(targetPath);
    try {
      if (fs.existsSync(resolved)) {
        return fs.realpathSync.native(resolved);
      }
    } catch {}
    return resolved;
  }

  _getCanonicalPath(targetPath) {
    const resolved = path.resolve(targetPath);
    if (fs.existsSync(resolved)) {
      try {
        return fs.realpathSync.native(resolved);
      } catch {
        return resolved;
      }
    }

    // Resolve nearest existing ancestor
    let current = resolved;
    const missingSegments = [];
    while (true) {
      const parent = path.dirname(current);
      if (fs.existsSync(current)) {
        try {
          const canonicalParent = fs.realpathSync.native(current);
          return path.join(canonicalParent, ...missingSegments.reverse());
        } catch {
          return resolved;
        }
      }
      if (parent === current) {
        return resolved;
      }
      missingSegments.push(path.basename(current));
      current = parent;
    }
  }

  _isPathInside(targetPath, parentDir) {
    const normTarget = this._getCanonicalPath(targetPath);
    const normParent = this._getCanonicalPath(parentDir);

    const compTarget = process.platform === 'win32' ? normTarget.toLowerCase() : normTarget;
    const compParent = process.platform === 'win32' ? normParent.toLowerCase() : normParent;

    if (compTarget === compParent) {
      return true;
    }

    const relative = path.relative(compParent, compTarget);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  _isSamePath(pathA, pathB) {
    const normA = this._getCanonicalPath(pathA);
    const normB = this._getCanonicalPath(pathB);
    if (process.platform === 'win32') {
      return normA.toLowerCase() === normB.toLowerCase();
    }
    return normA === normB;
  }
}

module.exports = {
  PathGuard,
  SecurityError
};
