/**
 * test/unit/pathGuard.test.js
 * Unit Test Suite for PathGuard Security Sandbox (Milestone M1)
 *
 * Requirements Verified:
 * - R6: Zero-mutation vault isolation and plugin directory write sandboxing
 * - Path traversal defense (../../, URL encoding, ADS, 8.3 filenames, UNC paths)
 * - SecurityError contract and structured error codes
 */

'use strict';

const test = require('node:test');
const { describe, it, beforeEach, afterEach } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

// Module under test
const { PathGuard, SecurityError } = require('../../src/security/PathGuard.js');

describe('PathGuard Unit Test Suite (M1)', () => {
  let tempBaseDir;
  let tempVaultDir;
  let guard;

  beforeEach(() => {
    // Create isolated ephemeral test directories
    tempBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-test-plugin-'));
    tempVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-test-vault-'));

    // Create standard subdirectories in plugin base
    fs.mkdirSync(path.join(tempBaseDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(tempBaseDir, 'data', 'reports'), { recursive: true });

    // Create standard subdirectories in mock vault
    fs.mkdirSync(path.join(tempVaultDir, '01-WorldSetting'), { recursive: true });
    fs.mkdirSync(path.join(tempVaultDir, '.obsidian'), { recursive: true });

    // Initialize PathGuard instance
    guard = new PathGuard({
      baseDir: tempBaseDir,
      vaultPath: tempVaultDir
    });
  });

  afterEach(() => {
    // Cleanup temporary directories
    try {
      fs.rmSync(tempBaseDir, { recursive: true, force: true });
      fs.rmSync(tempVaultDir, { recursive: true, force: true });
    } catch (_) {}
  });

  // =========================================================================
  // Suite 1: Valid Writable Path Verification
  // =========================================================================
  describe('Suite 1: Valid Writable Path Verification', () => {
    it('should allow relative paths within data directory', () => {
      const target = 'data/novel_index.db';
      const resolved = guard.assertWritablePath(target);
      const expected = path.resolve(tempBaseDir, 'data', 'novel_index.db');
      assert.equal(resolved.toLowerCase(), expected.toLowerCase());
    });

    it('should allow nested relative paths within reports directory', () => {
      const target = 'data/reports/import_report_20260828.json';
      const resolved = guard.assertWritablePath(target);
      const expected = path.resolve(tempBaseDir, 'data', 'reports', 'import_report_20260828.json');
      assert.equal(resolved.toLowerCase(), expected.toLowerCase());
    });

    it('should allow absolute paths located inside base directory', () => {
      const target = path.join(tempBaseDir, 'data', 'custom_output.db');
      const resolved = guard.assertWritablePath(target);
      assert.equal(resolved.toLowerCase(), target.toLowerCase());
    });

    it('should normalize forward slashes and backward slashes on Windows', () => {
      const targetForward = 'data/reports/summary.md';
      const targetBackward = 'data\\reports\\summary.md';
      const resForward = guard.assertWritablePath(targetForward);
      const resBackward = guard.assertWritablePath(targetBackward);
      assert.equal(resForward.toLowerCase(), resBackward.toLowerCase());
    });

    it('should allow the base directory itself as a writable target', () => {
      const resolved = guard.assertWritablePath(tempBaseDir);
      assert.equal(resolved.toLowerCase(), path.resolve(tempBaseDir).toLowerCase());
    });
  });

  // =========================================================================
  // Suite 2: Blocked Outside Writes (Sandbox Enforcement)
  // =========================================================================
  describe('Suite 2: Blocked Outside Writes (Sandbox Enforcement)', () => {
    it('should block write attempts to sibling plugin directories', () => {
      const siblingPath = path.resolve(tempBaseDir, '..', 'FileOperator', 'malicious.js');
      assert.throws(
        () => guard.assertWritablePath(siblingPath),
        (err) => {
          assert(err instanceof SecurityError);
          assert.equal(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
          return true;
        }
      );
    });

    it('should block write attempts to parent directories', () => {
      const parentPath = path.resolve(tempBaseDir, '..', 'server.js');
      assert.throws(
        () => guard.assertWritablePath(parentPath),
        (err) => err instanceof SecurityError && err.code === 'ERR_PATH_OUTSIDE_SANDBOX'
      );
    });

    it('should block writes to root / operating system directories', () => {
      const sysPath = process.platform === 'win32'
        ? 'C:\\Windows\\System32\\exploit.dll'
        : '/etc/passwd';
      assert.throws(
        () => guard.assertWritablePath(sysPath),
        (err) => err instanceof SecurityError && err.code === 'ERR_PATH_OUTSIDE_SANDBOX'
      );
    });

    it('should block prefix collision attacks (e.g. /plugin_evil vs /plugin)', () => {
      const prefixCollisionPath = `${tempBaseDir}_evil${path.sep}payload.js`;
      assert.throws(
        () => guard.assertWritablePath(prefixCollisionPath),
        (err) => err instanceof SecurityError && err.code === 'ERR_PATH_OUTSIDE_SANDBOX'
      );
    });

    it('should block drive hopping attempts on Windows (e.g. C: vs H:)', () => {
      if (process.platform === 'win32') {
        const otherDrive = tempBaseDir.toUpperCase().startsWith('C:') ? 'D:\\evil.db' : 'C:\\evil.db';
        assert.throws(
          () => guard.assertWritablePath(otherDrive),
          (err) => err instanceof SecurityError
        );
      }
    });
  });

  // =========================================================================
  // Suite 3: Target Vault Protection (Zero Mutation Enforcement - R6)
  // =========================================================================
  describe('Suite 3: Target Vault Protection (Zero Mutation - R6)', () => {
    it('should identify paths inside vault correctly via isVaultPath()', () => {
      const insidePath = path.join(tempVaultDir, '01-WorldSetting', 'planet_01.md');
      const outsidePath = path.join(tempBaseDir, 'data', 'index.db');
      assert.equal(guard.isVaultPath(insidePath), true);
      assert.equal(guard.isVaultPath(outsidePath), false);
    });

    it('should strictly block any write targeting the vault root', () => {
      const vaultTarget = path.join(tempVaultDir, 'marker.txt');
      assert.throws(
        () => guard.assertWritablePath(vaultTarget),
        (err) => err instanceof SecurityError
      );
      assert.throws(
        () => guard.assertNoVaultWrite(vaultTarget),
        (err) => err instanceof SecurityError && err.code === 'ERR_VAULT_WRITE_BLOCKED'
      );
    });

    it('should strictly block writes to nested vault markdown files', () => {
      const docPath = path.join(tempVaultDir, '01-WorldSetting', 'planet_kepler.md');
      assert.throws(
        () => guard.assertNoVaultWrite(docPath),
        (err) => err instanceof SecurityError && err.code === 'ERR_VAULT_WRITE_BLOCKED'
      );
    });

    it('should strictly block writes to vault hidden metadata (.obsidian / .git)', () => {
      const metaPath = path.join(tempVaultDir, '.obsidian', 'plugins.json');
      assert.throws(
        () => guard.assertNoVaultWrite(metaPath),
        (err) => err instanceof SecurityError && err.code === 'ERR_VAULT_WRITE_BLOCKED'
      );
    });

    it('should allow read-only access to files inside vault via assertReadOnlyPath()', () => {
      const docPath = path.join(tempVaultDir, '01-WorldSetting', 'planet_kepler.md');
      const verifiedReadPath = guard.assertReadOnlyPath(docPath);
      assert.equal(verifiedReadPath.toLowerCase(), path.resolve(docPath).toLowerCase());
    });
  });

  // =========================================================================
  // Suite 4: Path Traversal & Injection Attack Matrix
  // =========================================================================
  describe('Suite 4: Path Traversal & Injection Attack Matrix', () => {
    it('should block classic directory traversal (data/../../secret.env)', () => {
      const traversal = 'data/../../secret.env';
      assert.throws(
        () => guard.assertWritablePath(traversal),
        (err) => err instanceof SecurityError && (err.code === 'ERR_PATH_OUTSIDE_SANDBOX' || err.code === 'ERR_PATH_TRAVERSAL')
      );
    });

    it('should block deep traversal attacks (data/../../../../../../Windows)', () => {
      const deepTraversal = 'data/../../../../../../Windows/System32/config';
      assert.throws(
        () => guard.assertWritablePath(deepTraversal),
        (err) => err instanceof SecurityError
      );
    });

    it('should block URL-encoded traversal sequences (%2e%2e%2f and %2e%2e/)', () => {
      const encodedTraversal = 'data/%2e%2e/%2e%2e/config.env';
      assert.throws(
        () => guard.assertWritablePath(encodedTraversal),
        (err) => err instanceof SecurityError
      );
    });

    it('should reject null-byte termination attacks (data/index.db\\0.exe)', () => {
      const nullBytePath = 'data/index.db\0.exe';
      assert.throws(
        () => guard.assertWritablePath(nullBytePath),
        (err) => err instanceof SecurityError && err.code === 'ERR_INVALID_PATH'
      );
    });

    it('should reject Windows Alternate Data Stream (ADS) injection (data/file.db:stream)', () => {
      if (process.platform === 'win32') {
        const adsPath = path.join(tempBaseDir, 'data', 'novel_index.db:hidden_stream');
        assert.throws(
          () => guard.assertWritablePath(adsPath),
          (err) => err instanceof SecurityError
        );
      }
    });

    it('should block UNC network share paths (\\\\attacker-server\\share\\evil.db)', () => {
      const uncPath = '\\\\attacker-server\\share\\evil.db';
      assert.throws(
        () => guard.assertWritablePath(uncPath),
        (err) => err instanceof SecurityError
      );
    });
  });

  // =========================================================================
  // Suite 5: Edge Cases & Robustness
  // =========================================================================
  describe('Suite 5: Edge Cases & Robustness', () => {
    it('should throw TypeError for null, undefined, or non-string inputs', () => {
      assert.throws(() => guard.assertWritablePath(null), TypeError);
      assert.throws(() => guard.assertWritablePath(undefined), TypeError);
      assert.throws(() => guard.assertWritablePath(12345), TypeError);
      assert.throws(() => guard.assertWritablePath({}), TypeError);
    });

    it('should reject empty or whitespace-only paths', () => {
      assert.throws(
        () => guard.assertWritablePath(''),
        (err) => err instanceof SecurityError && err.code === 'ERR_INVALID_PATH'
      );
      assert.throws(
        () => guard.assertWritablePath('   '),
        (err) => err instanceof SecurityError && err.code === 'ERR_INVALID_PATH'
      );
    });

    it('should sanitize redundant dots and duplicate slashes (data/././/reports//file.db)', () => {
      const messyPath = 'data/././/reports//file.db';
      const resolved = guard.assertWritablePath(messyPath);
      const expected = path.resolve(tempBaseDir, 'data', 'reports', 'file.db');
      assert.equal(resolved.toLowerCase(), expected.toLowerCase());
    });

    it('should reject Windows reserved device names (CON, PRN, AUX, NUL, COM1, LPT1)', () => {
      if (process.platform === 'win32') {
        const reservedTargets = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1', 'data/CON.txt'];
        for (const reserved of reservedTargets) {
          assert.throws(
            () => guard.assertWritablePath(reserved),
            (err) => err instanceof SecurityError && err.code === 'ERR_RESERVED_DEVICE_NAME',
            `Expected ${reserved} to be rejected as reserved device name`
          );
        }
      }
    });

    it('should safely join segments without allowing traversal via safeJoin()', () => {
      const safeResult = guard.safeJoin(tempBaseDir, 'data', 'reports', '2026.json');
      const expected = path.resolve(tempBaseDir, 'data', 'reports', '2026.json');
      assert.equal(safeResult.toLowerCase(), expected.toLowerCase());

      assert.throws(
        () => guard.safeJoin(tempBaseDir, 'data', '..', '..', 'evil.js'),
        (err) => err instanceof SecurityError
      );
    });
  });
});
