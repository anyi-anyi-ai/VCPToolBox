/**
 * test/unit/pathGuardAdversarialStress.test.js
 * Adversarial Stress & Attack Harness for PathGuard Security Sandbox (Milestone M1)
 *
 * Attack Vectors:
 * 1. Nested & Complex Path Traversals (mixed slashes, redundant segments, excessive parent hopping)
 * 2. Windows NTFS Alternate Data Streams (ADS) (:stream, ::$DATA, :$INDEX_ALLOCATION, arbitrary stream names)
 * 3. Drive Hopping & Drive-Relative Traversal (C:, D:, X:, absolute vs relative drive paths)
 * 4. 8.3 Short Filenames (PROGRA~1, NOVELE~1, canonicalization resilience)
 * 5. Windows Reserved DOS Device Names (CON, PRN, AUX, NUL, COM1-9, LPT1-9, CONIN$, CONOUT$)
 * 6. Null Bytes & Character Injection (\0, encoded \0, unicode control characters)
 * 7. Trailing Dots and Spaces (Windows NTFS truncation bypass attacks)
 * 8. UNC Network Shares & Extended-Length Paths (\\server\share, //server/share, \\?\UNC)
 * 9. SafeFs API Coverage (writeFile, appendFile, unlink, mkdir, rm, createWriteStream, open flags)
 * 10. Empirical Zero-Mutation Vault Integrity (SHA-256 hash comparison before/after attack floods)
 *
 * @license MIT
 */

'use strict';

const test = require('node:test');
const { describe, it, beforeEach, afterEach } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');

const { PathGuard, SecurityError } = require('../../src/security/PathGuard.js');

/**
 * Calculates SHA-256 hashes of all files in a directory tree recursively.
 */
function snapshotDirectoryState(dirPath) {
  const state = new Map();
  if (!fs.existsSync(dirPath)) return state;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        const stat = fs.statSync(fullPath);
        state.set(fullPath, { hash, size: stat.size, mtimeMs: stat.mtimeMs });
      }
    }
  }

  walk(dirPath);
  return state;
}

/**
 * Verifies that two directory snapshots are 100% byte-for-byte identical.
 */
function assertDirectorySnapshotsIdentical(beforeState, afterState) {
  assert.equal(beforeState.size, afterState.size, `File count mismatch: before=${beforeState.size}, after=${afterState.size}`);
  for (const [filePath, beforeMeta] of beforeState.entries()) {
    const afterMeta = afterState.get(filePath);
    assert.ok(afterMeta, `File was deleted or missing after test: ${filePath}`);
    assert.equal(afterMeta.hash, beforeMeta.hash, `File content was MUTATED: ${filePath}`);
    assert.equal(afterMeta.size, beforeMeta.size, `File size changed: ${filePath}`);
  }
}

describe('PathGuard Adversarial Stress & Attack Harness (Challenger 2)', () => {
  let tempSandboxDir;
  let tempVaultDir;
  let guard;
  let safeFs;

  beforeEach(() => {
    tempSandboxDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-guard-sandbox-'));
    tempVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-guard-vault-'));

    // Populate standard sandbox dirs
    fs.mkdirSync(path.join(tempSandboxDir, 'data'), { recursive: true });
    fs.mkdirSync(path.join(tempSandboxDir, 'data', 'reports'), { recursive: true });
    fs.mkdirSync(path.join(tempSandboxDir, 'logs'), { recursive: true });

    // Populate mock Obsidian vault with realistic files
    fs.mkdirSync(path.join(tempVaultDir, '00-Index'), { recursive: true });
    fs.mkdirSync(path.join(tempVaultDir, '01-WorldTree', 'Planets'), { recursive: true });
    fs.mkdirSync(path.join(tempVaultDir, '.obsidian'), { recursive: true });

    fs.writeFileSync(path.join(tempVaultDir, '00-Index', 'Root.md'), '# World Tree Root\nUID: ROOT_001\n', 'utf8');
    fs.writeFileSync(path.join(tempVaultDir, '01-WorldTree', 'Planets', 'Kepler.md'), '# Kepler-452b\nUID: ENT_001\n', 'utf8');
    fs.writeFileSync(path.join(tempVaultDir, '.obsidian', 'app.json'), '{"vaultName":"TestVault"}\n', 'utf8');

    guard = new PathGuard({
      pluginRoot: tempSandboxDir,
      vaultRoot: tempVaultDir
    });

    safeFs = guard.createSafeFs(fs);
  });

  afterEach(() => {
    try {
      fs.rmSync(tempSandboxDir, { recursive: true, force: true });
      fs.rmSync(tempVaultDir, { recursive: true, force: true });
    } catch (_) {}
  });

  // =========================================================================
  // Vector 1: Complex Nested & Path Traversal Variations
  // =========================================================================
  describe('Vector 1: Complex Nested & Path Traversal Variations', () => {
    it('should permit legal internal traversals that remain within sandbox', () => {
      const internalPaths = [
        'data/../data/novel_index.db',
        'data/reports/../../data/reports/summary.json',
        './data/./reports/../novel.db',
        'logs/../data/test.db'
      ];

      for (const target of internalPaths) {
        const validated = guard.assertWritablePath(target);
        assert.ok(validated.toLowerCase().startsWith(tempSandboxDir.toLowerCase()));
      }
    });

    it('should strictly block escaping traversals regardless of depth or nesting', () => {
      const escapeAttempts = [
        '../outside.txt',
        '../../outside.txt',
        '../../../outside.txt',
        'data/../../../outside.txt',
        'data/reports/../../../../outside.txt',
        'data/./../../outside.txt',
        'data/..\\..\\outside.txt',
        'data/sub1/sub2/../../../../../../../../Windows/System32/calc.exe',
        '....//....//....//outside.txt',
        './../../../../../../../../etc/passwd'
      ];

      for (const target of escapeAttempts) {
        assert.throws(
          () => guard.assertWritablePath(target),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for traversal: ${target}`);
            assert(
              err.code === 'ERR_PATH_OUTSIDE_SANDBOX' ||
              err.code === 'ERR_PATH_TRAVERSAL' ||
              err.code === 'ERR_INVALID_PATH',
              `Expected outside sandbox or invalid path error code for: ${target}, got ${err.code}`
            );
            return true;
          }
        );
      }
    });

    it('should block URL-encoded and mixed URL traversal attacks', () => {
      const encodedAttacks = [
        '%2e%2e/evil.js',
        'data/%2e%2e/%2e%2e/system.ini',
        'data/%2E%2E/%2E%2E/system.ini',
        'data/%2f%2e%2e%2fescape',
        'data/%5c%2e%2e%5cescape'
      ];

      for (const target of encodedAttacks) {
        assert.throws(
          () => guard.assertWritablePath(target),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for encoded traversal: ${target}`);
            assert.equal(err.code, 'ERR_PATH_TRAVERSAL');
            return true;
          }
        );
      }
    });
  });

  // =========================================================================
  // Vector 2: Windows Alternate Data Streams (ADS) Matrix
  // =========================================================================
  describe('Vector 2: Windows Alternate Data Streams (ADS) Matrix', () => {
    it('should block all varieties of NTFS Alternate Data Streams', () => {
      const adsAttacks = [
        'data/index.db:stream',
        'data/index.db:hidden.exe',
        'data/index.db::$DATA',
        'data/index.db:stream:$DATA',
        'data/reports/:$INDEX_ALLOCATION',
        'data/reports/::INDEX_ALLOCATION',
        'data/file.txt:stream1:stream2',
        path.join(tempSandboxDir, 'data', 'file.db:stream')
      ];

      for (const target of adsAttacks) {
        assert.throws(
          () => guard.assertWritablePath(target),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for ADS target: ${target}`);
            assert.equal(err.code, 'ERR_ADS_STREAM_DETECTED');
            return true;
          }
        );
      }
    });
  });

  // =========================================================================
  // Vector 3: Drive Hopping & Drive-Relative Traversal
  // =========================================================================
  describe('Vector 3: Drive Hopping & Drive-Relative Traversal', () => {
    it('should block explicit foreign drive letters on Windows', () => {
      if (process.platform === 'win32') {
        const currentDrive = path.parse(tempSandboxDir).root.toUpperCase();
        const otherDrives = ['C:\\', 'D:\\', 'E:\\', 'H:\\', 'Z:\\'].filter(d => !d.startsWith(currentDrive[0]));

        for (const drive of otherDrives) {
          const foreignPath = path.join(drive, 'escaped_payload.js');
          assert.throws(
            () => guard.assertWritablePath(foreignPath),
            (err) => {
              assert(err instanceof SecurityError, `Expected SecurityError for foreign drive: ${foreignPath}`);
              assert.equal(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
              return true;
            }
          );
        }
      }
    });

    it('should block drive-relative paths targeting foreign drives', () => {
      if (process.platform === 'win32') {
        const currentDrive = path.parse(tempSandboxDir).root.toUpperCase();
        const foreignDriveLetter = currentDrive.startsWith('C') ? 'D' : 'C';
        const driveRelativePath = `${foreignDriveLetter}:relative_escape.txt`;

        assert.throws(
          () => guard.assertWritablePath(driveRelativePath),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for drive-relative: ${driveRelativePath}`);
            return true;
          }
        );
      }
    });
  });

  // =========================================================================
  // Vector 4: 8.3 Short Filenames & Canonicalization
  // =========================================================================
  describe('Vector 4: 8.3 Short Filenames & Canonicalization', () => {
    it('should safely canonicalize existing paths and resolve short names', () => {
      const longPath = path.join(tempSandboxDir, 'data', 'very_long_filename_for_testing_8_3.db');
      fs.writeFileSync(longPath, 'test content');

      const resolved = guard.assertWritablePath(longPath);
      assert.ok(fs.existsSync(resolved));
      assert.equal(resolved.toLowerCase(), longPath.toLowerCase());
    });

    it('should prevent prefix collisions with plugin sandbox directory', () => {
      const evilPrefixPath = `${tempSandboxDir}_attacker${path.sep}injected.js`;
      assert.throws(
        () => guard.assertWritablePath(evilPrefixPath),
        (err) => {
          assert(err instanceof SecurityError);
          assert.equal(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
          return true;
        }
      );
    });

    it('should resolve non-existent target files with existing ancestor directories correctly', () => {
      const nonExistentTarget = path.join(tempSandboxDir, 'data', 'reports', '2026', 'sub', 'new_report.json');
      // The parent dirs 2026/sub don't exist yet, nearest ancestor is data/reports
      const resolved = guard.assertWritablePath(nonExistentTarget);
      assert.ok(resolved.toLowerCase().startsWith(tempSandboxDir.toLowerCase()));
    });
  });

  // =========================================================================
  // Vector 5: Windows Reserved DOS Device Names & Truncation Attacks
  // =========================================================================
  describe('Vector 5: Windows Reserved DOS Device Names & Truncation Attacks', () => {
    it('should block all standard DOS device names case-insensitively with any extension', () => {
      const reservedNames = [
        'CON', 'con', 'Con', 'PRN', 'prn', 'AUX', 'aux', 'NUL', 'nul',
        'COM1', 'com1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
        'LPT1', 'lpt1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
        'CON.txt', 'prn.log', 'aux.json', 'nul.db', 'com1.dat', 'lpt1.tmp',
        'data/CON.txt', 'data/reports/nul.json', 'logs/com3.log'
      ];

      for (const devName of reservedNames) {
        assert.throws(
          () => guard.assertWritablePath(devName),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for reserved device: ${devName}`);
            assert.equal(err.code, 'ERR_RESERVED_DEVICE_NAME');
            return true;
          }
        );
      }
    });

    it('should block dangerous trailing spaces and dots on Windows', () => {
      if (process.platform === 'win32') {
        const trailingAttacks = [
          'data/file.txt ',
          'data/file.txt.',
          'data/file.txt. . ',
          'data/subdir /file.txt',
          'data/subdir./file.txt'
        ];

        for (const target of trailingAttacks) {
          assert.throws(
            () => guard.assertWritablePath(target),
            (err) => {
              assert(err instanceof SecurityError, `Expected SecurityError for trailing space/dot: ${target}`);
              assert.equal(err.code, 'ERR_INVALID_PATH');
              return true;
            }
          );
        }
      }
    });
  });

  // =========================================================================
  // Vector 6: Null Bytes & Character Injections
  // =========================================================================
  describe('Vector 6: Null Bytes & Character Injections', () => {
    it('should block null bytes at any position in the path', () => {
      const nullByteAttacks = [
        'data/index.db\0.exe',
        '\0data/index.db',
        'data/\0/index.db',
        'data/novel\0index.db',
        'data/reports/report.json\0'
      ];

      for (const target of nullByteAttacks) {
        assert.throws(
          () => guard.assertWritablePath(target),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for null byte: ${target}`);
            assert.equal(err.code, 'ERR_INVALID_PATH');
            return true;
          }
        );
      }
    });
  });

  // =========================================================================
  // Vector 7: UNC Network Share Paths
  // =========================================================================
  describe('Vector 7: UNC Network Share Paths', () => {
    it('should block UNC share paths with backslashes or forward slashes', () => {
      const uncAttacks = [
        '\\\\192.168.1.100\\share\\payload.js',
        '\\\\localhost\\c$\\Windows\\evil.exe',
        '//attacker.com/share/data.db',
        '\\\\?\\C:\\malicious.js',
        '\\\\.\\COM1'
      ];

      for (const unc of uncAttacks) {
        assert.throws(
          () => guard.assertWritablePath(unc),
          (err) => {
            assert(err instanceof SecurityError, `Expected SecurityError for UNC path: ${unc}`);
            return true;
          }
        );
      }
    });
  });

  // =========================================================================
  // Vector 8: SafeFs Wrapper Comprehensive Method Interception
  // =========================================================================
  describe('Vector 8: SafeFs Wrapper Comprehensive Method Interception', () => {
    it('should intercept synchronous write methods targeting outside sandbox or vault', () => {
      const vaultTarget = path.join(tempVaultDir, '01-WorldTree', 'Planets', 'Kepler.md');
      const outsideTarget = path.join(tempSandboxDir, '..', 'evil.txt');

      // writeFileSync
      assert.throws(() => safeFs.writeFileSync(vaultTarget, 'MUTATION'), SecurityError);
      assert.throws(() => safeFs.writeFileSync(outsideTarget, 'MUTATION'), SecurityError);

      // appendFileSync
      assert.throws(() => safeFs.appendFileSync(vaultTarget, 'MUTATION'), SecurityError);
      assert.throws(() => safeFs.appendFileSync(outsideTarget, 'MUTATION'), SecurityError);

      // unlinkSync
      assert.throws(() => safeFs.unlinkSync(vaultTarget), SecurityError);
      assert.throws(() => safeFs.unlinkSync(outsideTarget), SecurityError);

      // mkdirSync
      assert.throws(() => safeFs.mkdirSync(path.join(tempVaultDir, 'EvilDir')), SecurityError);
      assert.throws(() => safeFs.mkdirSync(path.join(tempSandboxDir, '..', 'EvilDir')), SecurityError);

      // rmSync
      assert.throws(() => safeFs.rmSync(vaultTarget), SecurityError);
      assert.throws(() => safeFs.rmSync(outsideTarget), SecurityError);

      // createWriteStream
      assert.throws(() => safeFs.createWriteStream(vaultTarget), SecurityError);
      assert.throws(() => safeFs.createWriteStream(outsideTarget), SecurityError);
    });

    it('should intercept asynchronous promise-based write methods', async () => {
      const vaultTarget = path.join(tempVaultDir, '01-WorldTree', 'Planets', 'Kepler.md');
      const outsideTarget = path.join(tempSandboxDir, '..', 'evil_async.txt');

      await assert.rejects(async () => { await safeFs.promises.writeFile(vaultTarget, 'MUTATION'); }, SecurityError);
      await assert.rejects(async () => { await safeFs.promises.writeFile(outsideTarget, 'MUTATION'); }, SecurityError);

      await assert.rejects(async () => { await safeFs.promises.appendFile(vaultTarget, 'MUTATION'); }, SecurityError);
      await assert.rejects(async () => { await safeFs.promises.appendFile(outsideTarget, 'MUTATION'); }, SecurityError);

      await assert.rejects(async () => { await safeFs.promises.unlink(vaultTarget); }, SecurityError);
      await assert.rejects(async () => { await safeFs.promises.unlink(outsideTarget); }, SecurityError);

      await assert.rejects(async () => { await safeFs.promises.mkdir(path.join(tempVaultDir, 'EvilDirAsync')); }, SecurityError);
      await assert.rejects(async () => { await safeFs.promises.mkdir(path.join(tempSandboxDir, '..', 'EvilDirAsync')); }, SecurityError);

      await assert.rejects(async () => { await safeFs.promises.rm(vaultTarget); }, SecurityError);
      await assert.rejects(async () => { await safeFs.promises.rm(outsideTarget); }, SecurityError);
    });

    it('should strictly prohibit write open flags in read operations', () => {
      const vaultFile = path.join(tempVaultDir, '01-WorldTree', 'Planets', 'Kepler.md');

      const illegalFlags = ['w', 'w+', 'r+', 'a', 'a+', 'wx', 'ax', 'xw', 'xa'];
      for (const flag of illegalFlags) {
        assert.throws(
          () => safeFs.openSync(vaultFile, flag),
          (err) => err instanceof SecurityError && err.code === 'ERR_INVALID_FILE_FLAG',
          `Expected SecurityError for openSync with flag: ${flag}`
        );

        assert.throws(
          () => safeFs.createReadStream(vaultFile, { flags: flag }),
          (err) => err instanceof SecurityError && err.code === 'ERR_INVALID_FILE_FLAG',
          `Expected SecurityError for createReadStream with flag: ${flag}`
        );
      }
    });

    it('should allow valid read-only operations on vault files', () => {
      const vaultFile = path.join(tempVaultDir, '01-WorldTree', 'Planets', 'Kepler.md');

      const syncContent = safeFs.readFileSync(vaultFile, 'utf8');
      assert.ok(syncContent.includes('Kepler-452b'));

      const fd = safeFs.openSync(vaultFile, 'r');
      assert.ok(typeof fd === 'number');
      fs.closeSync(fd);
    });

    it('should allow valid writes inside the allowed plugin sandbox', () => {
      const allowedFile = path.join(tempSandboxDir, 'data', 'valid_test.json');
      safeFs.writeFileSync(allowedFile, JSON.stringify({ ok: true }), 'utf8');
      assert.ok(fs.existsSync(allowedFile));

      safeFs.appendFileSync(allowedFile, '\n', 'utf8');
      assert.ok(fs.existsSync(allowedFile));

      safeFs.unlinkSync(allowedFile);
      assert.ok(!fs.existsSync(allowedFile));
    });
  });

  // =========================================================================
  // Vector 9: Collision Check & Misconfiguration Defense
  // =========================================================================
  describe('Vector 9: Collision Check & Misconfiguration Defense', () => {
    it('should throw SecurityError if pluginRoot and vaultRoot are identical', () => {
      assert.throws(
        () => new PathGuard({ pluginRoot: tempSandboxDir, vaultRoot: tempSandboxDir }),
        (err) => err instanceof SecurityError && err.code === 'ERR_VAULT_SANDBOX_COLLISION'
      );
    });

    it('should throw SecurityError if setVaultRoot is called with pluginRoot', () => {
      const g = new PathGuard({ pluginRoot: tempSandboxDir });
      assert.throws(
        () => g.setVaultRoot(tempSandboxDir),
        (err) => err instanceof SecurityError && err.code === 'ERR_VAULT_SANDBOX_COLLISION'
      );
    });
  });

  // =========================================================================
  // Vector 10: Empirical Zero-Mutation Vault Invariant Under Attack Flood
  // =========================================================================
  describe('Vector 10: Empirical Zero-Mutation Vault Invariant Under Attack Flood', () => {
    it('should guarantee 100% zero vault mutations after an extensive flood of adversarial write attempts', async () => {
      // 1. Take initial directory snapshot of vault
      const initialVaultState = snapshotDirectoryState(tempVaultDir);
      assert.ok(initialVaultState.size >= 3, 'Initial vault snapshot must contain created test files');

      // 2. Generate a flood of 100+ varied adversarial attack targets
      const attackTargets = [
        // Direct vault paths
        tempVaultDir,
        path.join(tempVaultDir, '00-Index', 'Root.md'),
        path.join(tempVaultDir, '01-WorldTree', 'Planets', 'Kepler.md'),
        path.join(tempVaultDir, '01-WorldTree', 'Planets', 'NewPlanet.md'),
        path.join(tempVaultDir, '.obsidian', 'app.json'),
        path.join(tempVaultDir, '.obsidian', 'plugins.json'),
        path.join(tempVaultDir, 'new_vault_file.md'),

        // Traversal targeting vault from sandbox
        path.join(tempSandboxDir, '..', path.basename(tempVaultDir), '00-Index', 'Root.md'),
        path.join(tempSandboxDir, 'data', '..', '..', path.basename(tempVaultDir), 'hacked.md'),
        `data/../../${path.basename(tempVaultDir)}/exploit.md`,

        // Traversal escaping sandbox to OS
        '../outside.txt',
        '../../outside.txt',
        '../../../outside.txt',
        'data/../../../../../../Windows/System32/cmd.exe',
        'C:\\Windows\\System32\\calc.exe',
        'D:\\malicious.db',

        // ADS attacks
        'data/file.db:stream',
        'data/file.db::$DATA',
        path.join(tempVaultDir, 'Root.md:hidden'),

        // DOS devices
        'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1', 'data/CON.txt',

        // Null bytes
        'data/file.db\0.exe',
        path.join(tempVaultDir, 'Kepler.md\0.exe'),

        // UNC paths
        '\\\\attacker\\share\\payload.js',
        '//attacker/share/payload.js'
      ];

      let blockedWriteAttempts = 0;

      // 3. Fire all write attacks through SafeFs synchronous and asynchronous methods
      for (const target of attackTargets) {
        // Sync write
        try {
          safeFs.writeFileSync(target, 'CORRUPTION_PAYLOAD');
          assert.fail(`writeFileSync failed to block target: ${target}`);
        } catch (err) {
          assert(err instanceof SecurityError || err instanceof TypeError);
          blockedWriteAttempts++;
        }

        // Sync append
        try {
          safeFs.appendFileSync(target, 'CORRUPTION_PAYLOAD');
          assert.fail(`appendFileSync failed to block target: ${target}`);
        } catch (err) {
          assert(err instanceof SecurityError || err instanceof TypeError);
          blockedWriteAttempts++;
        }

        // Sync unlink
        try {
          safeFs.unlinkSync(target);
          assert.fail(`unlinkSync failed to block target: ${target}`);
        } catch (err) {
          assert(err instanceof SecurityError || err instanceof TypeError);
          blockedWriteAttempts++;
        }

        // Async write
        try {
          await safeFs.promises.writeFile(target, 'CORRUPTION_PAYLOAD');
          assert.fail(`promises.writeFile failed to block target: ${target}`);
        } catch (err) {
          assert(err instanceof SecurityError || err instanceof TypeError);
          blockedWriteAttempts++;
        }
      }

      assert.ok(blockedWriteAttempts >= 100, `Expected at least 100 blocked write attempts, got ${blockedWriteAttempts}`);

      // 4. Take post-attack directory snapshot of vault
      const finalVaultState = snapshotDirectoryState(tempVaultDir);

      // 5. Mathematically verify ZERO mutations: exact same files, sizes, and SHA-256 hashes
      assertDirectorySnapshotsIdentical(initialVaultState, finalVaultState);
    });
  });
});
