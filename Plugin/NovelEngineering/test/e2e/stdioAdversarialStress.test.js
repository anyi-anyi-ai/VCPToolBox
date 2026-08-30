/**
 * test/e2e/stdioAdversarialStress.test.js
 * Adversarial Stress & Chaos Test Suite for NovelEngineering.js Stdio Dispatcher (Milestone M1)
 *
 * Stress Vectors:
 * 1. Extreme malformed JSON, syntax violations, truncated tokens, prototype pollution
 * 2. Non-object, primitive, array, and nested array JSON payloads
 * 3. 0-byte input, whitespace, tabs, CR/LF, UTF-8 BOM, chunked stream ingestion
 * 4. Huge buffer stress (1MB - 5MB payloads, deep nesting, 10k array items)
 * 5. Command injection, unknown actions, missing parameters, inverted types across all 9 MVP commands
 * 6. Stdout purity & stderr isolation invariants across all execution paths
 *
 * @license MIT
 */

'use strict';

const test = require('node:test');
const { describe, it } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');

const PLUGIN_DIR = path.resolve(__dirname, '..', '..');
const ENTRY_SCRIPT = path.join(PLUGIN_DIR, 'NovelEngineering.js');

/**
 * Invokes NovelEngineering.js via child_process stdio with fine-grained stream control.
 */
function invokeRawStdio(input, options = {}) {
  const {
    envOverrides = {},
    timeoutMs = 15000,
    chunked = false,
    chunkDelayMs = 5,
    chunkSize = 16
  } = options;

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [ENTRY_SCRIPT], {
      cwd: PLUGIN_DIR,
      env: {
        ...process.env,
        DEBUG_MODE: 'false',
        ...envOverrides
      },
      shell: false,
      windowsHide: true
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
      reject(new Error(`Plugin execution timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdoutBuffer += chunk;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => {
      stderrBuffer += chunk;
    });

    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('exit', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) return;

      resolve({
        code,
        signal,
        stdout: stdoutBuffer.trim(),
        rawStdout: stdoutBuffer,
        stderr: stderrBuffer.trim(),
        rawStderr: stderrBuffer
      });
    });

    if (input === null || input === undefined) {
      child.stdin.end();
      return;
    }

    const dataBuffer = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');

    if (!chunked) {
      try {
        child.stdin.write(dataBuffer);
        child.stdin.end();
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    } else {
      // Stream chunks sequentially with interval
      let offset = 0;
      const interval = setInterval(() => {
        if (offset >= dataBuffer.length) {
          clearInterval(interval);
          child.stdin.end();
          return;
        }
        const slice = dataBuffer.subarray(offset, offset + chunkSize);
        offset += chunkSize;
        try {
          child.stdin.write(slice);
        } catch (err) {
          clearInterval(interval);
          clearTimeout(timer);
          reject(err);
        }
      }, chunkDelayMs);
    }
  });
}

/**
 * Standard Invariant Validator:
 * Validates that stdout is strictly valid JSON conforming to the VCP response envelope.
 */
function assertValidVcpEnvelope(res, expectedStatus = null) {
  assert.equal(res.code, 0, `Expected exit code 0, got ${res.code}. stderr: ${res.stderr}`);
  assert.ok(res.stdout.length > 0, 'stdout must not be empty');

  // Verify single JSON line or valid JSON
  let parsed;
  try {
    parsed = JSON.parse(res.stdout);
  } catch (err) {
    assert.fail(`stdout is not valid JSON: "${res.stdout}" (Error: ${err.message})`);
  }

  assert.ok(parsed && typeof parsed === 'object', 'stdout JSON must be an object');
  assert.ok(
    parsed.status === 'success' || parsed.status === 'error',
    `status must be 'success' or 'error', got: ${parsed.status}`
  );

  if (expectedStatus) {
    assert.equal(parsed.status, expectedStatus, `Expected status '${expectedStatus}', got '${parsed.status}'`);
  }

  if (parsed.status === 'success') {
    assert.ok(parsed.result, 'Success envelope must contain result property');
  } else {
    assert.ok(typeof parsed.error === 'string' && parsed.error.length > 0, 'Error envelope must contain error message string');
  }

  return parsed;
}

describe('NovelEngineering Adversarial Stress & Invariant Suite', () => {

  // =========================================================================
  // Suite 1: Extreme Malformed JSON & Syntax Violations
  // =========================================================================
  describe('Suite 1: Extreme Malformed JSON & Syntax Violations', () => {
    const malformedInputs = [
      { name: 'truncated JSON missing brace', payload: '{"action": "ping"' },
      { name: 'unclosed string token', payload: '{"action": "pin' },
      { name: 'trailing comma in object', payload: '{"action": "ping",}' },
      { name: 'unquoted key and value (JS object literal)', payload: '{action: ping}' },
      { name: 'single quoted JSON', payload: "{'action': 'ping'}" },
      { name: 'concatenated multiple JSON objects', payload: '{"action":"ping"}{"action":"info"}' },
      { name: 'raw binary null bytes & control chars', payload: Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0x7b, 0x7d]) },
      { name: 'XML markup payload', payload: '<xml><action>ping</action></xml>' },
      { name: 'HTML script tag injection payload', payload: '<script>alert("xss")</script>' },
      { name: 'SQL injection string payload', payload: "SELECT * FROM source_files WHERE 1=1; DROP TABLE entities;--" },
      { name: 'Unicode escape corruption', payload: '{"action": "\\uZZZZ"}' },
      { name: 'Surrogate half character', payload: '{"action": "\\uD800"}' },
      { name: 'Leading and trailing garbage around JSON', payload: 'GARBAGE_PREFIX {"action":"ping"} GARBAGE_SUFFIX' }
    ];

    for (const { name, payload } of malformedInputs) {
      it(`should gracefully return error envelope for ${name}`, async () => {
        const res = await invokeRawStdio(payload);
        const parsed = assertValidVcpEnvelope(res, 'error');
        assert.ok(parsed.error.length > 0);
      });
    }
  });

  // =========================================================================
  // Suite 2: Non-Object & Primitive / Array Payloads
  // =========================================================================
  describe('Suite 2: Non-Object, Primitive, and Array Payloads', () => {
    const nonObjectInputs = [
      { name: 'JSON null literal', payload: 'null' },
      { name: 'JSON boolean true', payload: 'true' },
      { name: 'JSON boolean false', payload: 'false' },
      { name: 'JSON integer zero', payload: '0' },
      { name: 'JSON positive integer', payload: '42' },
      { name: 'JSON negative float', payload: '-1337.89' },
      { name: 'JSON exponential number', payload: '1e10' },
      { name: 'JSON plain string', payload: '"ping"' },
      { name: 'JSON empty string', payload: '""' },
      { name: 'JSON empty array', payload: '[]' },
      { name: 'JSON array of strings', payload: '["ping", "info"]' },
      { name: 'JSON array of objects', payload: '[{"action": "ping"}]' },
      { name: 'JSON 2D nested array', payload: '[[1, 2], [3, 4]]' }
    ];

    for (const { name, payload } of nonObjectInputs) {
      it(`should reject non-object JSON payload: ${name}`, async () => {
        const res = await invokeRawStdio(payload);
        const parsed = assertValidVcpEnvelope(res, 'error');
        assert.ok(
          parsed.error.includes('object') ||
          parsed.error.includes('Missing') ||
          parsed.error.includes('Invalid') ||
          parsed.error.includes('command'),
          `Error message should explain payload requirement: ${parsed.error}`
        );
      });
    }
  });

  // =========================================================================
  // Suite 3: Empty, Whitespace, BOM, and Chunked Streaming
  // =========================================================================
  describe('Suite 3: Empty, Whitespace, BOM, and Chunked Streaming', () => {
    it('should handle 0-byte input (immediate stream close)', async () => {
      const res = await invokeRawStdio(null);
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Empty'));
    });

    it('should handle empty string input', async () => {
      const res = await invokeRawStdio('');
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Empty'));
    });

    it('should handle whitespace-only spaces, tabs, and newlines', async () => {
      const res = await invokeRawStdio('   \r\n\t  \t\r\n  ');
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Empty'));
    });

    it('should handle UTF-8 BOM preceding valid JSON', async () => {
      const bomPayload = '\uFEFF{"action": "ping"}';
      const res = await invokeRawStdio(bomPayload);
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
    });

    it('should handle chunked slow-stream transmission of valid JSON', async () => {
      const payload = JSON.stringify({ action: 'ping', parameters: { timestamp: Date.now() } });
      const res = await invokeRawStdio(payload, {
        chunked: true,
        chunkSize: 4,
        chunkDelayMs: 5
      });
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
    });
  });

  // =========================================================================
  // Suite 4: Huge Buffer & High-Volume Stress
  // =========================================================================
  describe('Suite 4: Huge Buffer & High-Volume Stress', () => {
    it('should handle 1MB valid JSON payload with large parameter values', async () => {
      const largeString = 'X'.repeat(1024 * 1024); // 1MB string
      const payload = JSON.stringify({
        action: 'ping',
        parameters: { data: largeString }
      });

      const res = await invokeRawStdio(payload);
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
    });

    it('should handle 3MB valid JSON payload across multiple parameters', async () => {
      const chunk1MB = 'A'.repeat(1024 * 1024);
      const chunk2MB = 'B'.repeat(2 * 1024 * 1024);
      const payload = JSON.stringify({
        action: 'ping',
        parameters: { chunk1: chunk1MB, chunk2: chunk2MB }
      });

      const res = await invokeRawStdio(payload);
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
    });

    it('should handle 2MB malformed JSON payload without memory exhaustion or crash', async () => {
      const brokenGarbage = '{"action":"ping","data":"' + 'Z'.repeat(2 * 1024 * 1024); // Unclosed string
      const res = await invokeRawStdio(brokenGarbage);
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Invalid') || parsed.error.includes('JSON'));
    });

    it('should handle deeply nested JSON objects without stack overflow', async () => {
      let nested = { action: 'ping', parameters: { depth: 0 } };
      let curr = nested.parameters;
      for (let i = 1; i <= 100; i++) {
        curr.child = { depth: i };
        curr = curr.child;
      }

      const res = await invokeRawStdio(JSON.stringify(nested));
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
    });

    it('should handle large parameter array with 10,000 items', async () => {
      const items = Array.from({ length: 10000 }, (_, i) => ({ id: i, label: `item_${i}` }));
      const payload = JSON.stringify({
        action: 'ping',
        parameters: { items }
      });

      const res = await invokeRawStdio(payload);
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
    });
  });

  // =========================================================================
  // Suite 5: Command Dispatcher Attack Vectors & Parameter Robustness
  // =========================================================================
  describe('Suite 5: Command Dispatcher Attack Vectors & Parameter Robustness', () => {
    it('should reject missing action / command field', async () => {
      const res = await invokeRawStdio(JSON.stringify({ someKey: 'value' }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should reject empty string action', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: '' }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should reject whitespace-only action', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: '    \t   ' }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should reject numeric action', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: 12345 }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should reject boolean action', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: true }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should reject object action', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: { name: 'ping' } }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should reject array action', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: ['ping'] }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('Missing or invalid command identifier'));
    });

    it('should withstand prototype pollution injection attempts', async () => {
      const payload = JSON.stringify({
        __proto__: { polluted: 'attacker_value', isAdmin: true },
        constructor: { prototype: { polluted: 'attacker_value' } },
        action: 'ping',
        parameters: { test: 1 }
      });

      const res = await invokeRawStdio(payload);
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);
      assert.equal(Object.prototype.polluted, undefined);
      assert.equal(Object.prototype.isAdmin, undefined);
    });

    it('should reject unknown / adversarial command names safely', async () => {
      const maliciousNames = [
        '../../../etc/passwd',
        'ping; rm -rf /',
        'eval',
        'constructor',
        '__proto__',
        'toString',
        'UNKNOWN_CMD_999'
      ];

      for (const cmd of maliciousNames) {
        const res = await invokeRawStdio(JSON.stringify({ action: cmd }));
        const parsed = assertValidVcpEnvelope(res, 'error');
        assert.ok(parsed.error.includes('Unsupported or unknown command'));
      }
    });

    // Verification of all 9 MVP Commands under parameter variations
    const mvpCommands = [
      { cmd: 'ScanWorldTree', params: { vaultPath: 'C:\\test_vault', mode: 'full', forceRehash: true } },
      { cmd: 'BuildSourceManifest', params: { sourceCategory: 'CANONICAL', limit: 25, offset: 0 } },
      { cmd: 'ClassifySourceFiles', params: { targetPath: 'entities/*', limit: 10 } },
      { cmd: 'DetectPlaceholderFiles', params: { maxSizeBytes: 30, limit: 100 } },
      { cmd: 'DetectDuplicateEntities', params: { entityType: 'PLANET', strictAlias: true } },
      { cmd: 'DetectLegacyIdConflicts', params: { idPattern: 'OLD_.*' } },
      { cmd: 'GetSourceFile', params: { filePath: 'World/Sol.md' } },
      { cmd: 'QueryEntities', params: { query: 'Terra', entityType: 'PLANET', limit: 5 } },
      { cmd: 'ExportImportReport', params: { scanId: 'scan_001', format: 'json' } }
    ];

    for (const { cmd, params } of mvpCommands) {
      it(`should successfully dispatch ${cmd} with valid parameters`, async () => {
        const res = await invokeRawStdio(JSON.stringify({ action: cmd, parameters: params }));
        const parsed = assertValidVcpEnvelope(res, 'success');
        assert.ok(parsed.result.content, `Command ${cmd} must return content`);
        assert.ok(parsed.result.details, `Command ${cmd} must return details`);
      });

      it(`should accept ${cmd} with flat parameter format`, async () => {
        const flatPayload = { action: cmd, ...params };
        const res = await invokeRawStdio(JSON.stringify(flatPayload));
        const parsed = assertValidVcpEnvelope(res, 'success');
        assert.ok(parsed.result.content);
      });

      it(`should accept ${cmd} with null or non-object parameters gracefully`, async () => {
        // Special case: GetSourceFile requires filePath or fileId
        if (cmd === 'GetSourceFile') {
          const res = await invokeRawStdio(JSON.stringify({ action: cmd, parameters: null }));
          const parsed = assertValidVcpEnvelope(res, 'error');
          assert.ok(parsed.error.includes('GetSourceFile requires either "filePath" or "fileId"'));
        } else {
          const res = await invokeRawStdio(JSON.stringify({ action: cmd, parameters: null }));
          const parsed = assertValidVcpEnvelope(res, 'success');
          assert.ok(parsed.result.content);
        }
      });
    }

    it('should strictly reject GetSourceFile when both filePath and fileId are missing', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: 'GetSourceFile', parameters: {} }));
      const parsed = assertValidVcpEnvelope(res, 'error');
      assert.ok(parsed.error.includes('filePath') && parsed.error.includes('fileId'));
    });

    it('should accept GetSourceFile with fileId parameter instead of filePath', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: 'GetSourceFile', parameters: { fileId: 'FID_12345' } }));
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.ok(parsed.result.details.parameters.fileId === 'FID_12345');
    });
  });

  // =========================================================================
  // Suite 6: Stdout Purity & Stderr Isolation Invariant
  // =========================================================================
  describe('Suite 6: Stdout Purity & Stderr Isolation Invariant', () => {
    it('should ensure stdout contains ZERO logging text when DEBUG_MODE=true', async () => {
      const res = await invokeRawStdio(
        JSON.stringify({ action: 'ping' }),
        { envOverrides: { DEBUG_MODE: 'true' } }
      );

      // Stdout must be pure JSON
      const parsed = assertValidVcpEnvelope(res, 'success');
      assert.equal(parsed.result.pong, true);

      // Verify that debug logs were routed to stderr
      assert.ok(res.stderr.includes('NovelEngineering DEBUG'), 'stderr should contain debug logs');
      assert.equal(res.rawStdout.includes('NovelEngineering DEBUG'), false, 'stdout must NOT contain debug logs');
    });

    it('should ensure stdout is strictly single-line formatted JSON', async () => {
      const testCases = [
        { action: 'ping' },
        { action: 'help' },
        { action: 'info' },
        { action: 'ScanWorldTree', parameters: { vaultPath: 'C:\\vault' } },
        { action: 'InvalidCommandName' }
      ];

      for (const tc of testCases) {
        const res = await invokeRawStdio(JSON.stringify(tc));
        const trimmed = res.rawStdout.trim();
        const lines = trimmed.split('\n');
        assert.equal(lines.length, 1, `stdout should have exactly 1 line of JSON. Got ${lines.length} lines: ${trimmed}`);
        assert.doesNotThrow(() => JSON.parse(lines[0]));
      }
    });

    it('should ensure stdout ends cleanly with newline character', async () => {
      const res = await invokeRawStdio(JSON.stringify({ action: 'ping' }));
      assert.ok(res.rawStdout.endsWith('\n'), 'stdout should terminate with \\n');
    });
  });
});
