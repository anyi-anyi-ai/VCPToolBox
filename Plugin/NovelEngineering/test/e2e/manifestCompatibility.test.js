/**
 * test/e2e/manifestCompatibility.test.js
 * Integration Test Suite for VCP Plugin Manifest & Stdio JSON Protocol (Milestone M1)
 *
 * Requirements Verified:
 * - R1: VCP plugin manifest specification compatibility (Plugin.js schema)
 * - R5: 9 core commands declared in manifest with valid VCP tool call markup
 * - Stdio synchronous protocol: single-line JSON in, single-line JSON out
 * - Strict stdout isolation: no plain text logs contaminating stdout
 * - Built-in commands (ping, help, info) and unknown command error envelopes
 */

'use strict';

const test = require('node:test');
const { describe, it } = test;
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

const PLUGIN_DIR = path.resolve(__dirname, '..', '..');
const MANIFEST_PATH = path.join(PLUGIN_DIR, 'plugin-manifest.json');
const ENTRY_SCRIPT = path.join(PLUGIN_DIR, 'NovelEngineering.js');

/**
 * Helper: Executes NovelEngineering.js via child_process stdio
 * Simulates VCP Plugin.js executePlugin() execution flow.
 */
function invokePluginStdio(payload, envOverrides = {}, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const inputString = typeof payload === 'string' ? payload : JSON.stringify(payload);

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
    child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk;
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk;
    });

    child.on('error', (err) => {
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
        stderr: stderrBuffer.trim(),
        rawStdout: stdoutBuffer
      });
    });

    try {
      if (inputString !== undefined && inputString !== null) {
        child.stdin.write(inputString + '\n');
      }
      child.stdin.end();
    } catch (writeErr) {
      clearTimeout(timer);
      reject(writeErr);
    }
  });
}

describe('Manifest Compatibility & Stdio Protocol E2E (M1)', () => {

  // =========================================================================
  // Suite 1: plugin-manifest.json Schema & VCP Compliance
  // =========================================================================
  describe('Suite 1: plugin-manifest.json Schema & VCP Compliance', () => {
    it('should be valid JSON and readable at plugin root', () => {
      assert.equal(fs.existsSync(MANIFEST_PATH), true, 'plugin-manifest.json must exist');
      const rawContent = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      assert.doesNotThrow(() => JSON.parse(rawContent), 'Manifest must be valid JSON');
    });

    it('should contain required VCP Plugin root fields', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      assert.equal(manifest.name, 'NovelEngineering');
      assert.equal(manifest.pluginType, 'synchronous');
      assert.equal(typeof manifest.displayName, 'string');
      assert.equal(typeof manifest.version, 'string');
      assert.equal(typeof manifest.description, 'string');
      assert.ok(manifest.entryPoint, 'entryPoint must be defined');
      assert.equal(manifest.entryPoint.command, 'node NovelEngineering.js');
      assert.ok(manifest.communication, 'communication must be defined');
      assert.equal(manifest.communication.protocol, 'stdio');
    });

    it('should define complete configSchema with expected configuration keys', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      const schema = manifest.configSchema;
      assert.ok(schema, 'configSchema must exist');
      assert.ok(schema.NOVEL_DB_PATH, 'NOVEL_DB_PATH must be in configSchema');
      assert.ok(schema.DEFAULT_WORLDTREE_PATH, 'DEFAULT_WORLDTREE_PATH must be in configSchema');
      assert.ok(schema.SCAN_BATCH_SIZE, 'SCAN_BATCH_SIZE must be in configSchema');
      assert.ok(schema.DEBUG_MODE, 'DEBUG_MODE must be in configSchema');
    });

    it('should declare all 9 core MVP commands in capabilities.invocationCommands', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      const commands = manifest.capabilities?.invocationCommands;
      assert.ok(Array.isArray(commands), 'capabilities.invocationCommands must be an array');

      const expectedCommands = [
        'ScanWorldTree',
        'BuildSourceManifest',
        'ClassifySourceFiles',
        'DetectPlaceholderFiles',
        'DetectDuplicateEntities',
        'DetectLegacyIdConflicts',
        'GetSourceFile',
        'QueryEntities',
        'ExportImportReport'
      ];

      const declaredNames = commands.map(c => c.command);
      for (const expected of expectedCommands) {
        assert.ok(
          declaredNames.includes(expected),
          `Command "${expected}" must be declared in capabilities.invocationCommands`
        );
      }
      assert.equal(commands.length >= 9, true, 'At least 9 commands declared');
    });

    it('should format command descriptions with VCP delimiter syntax (<<<[TOOL_REQUEST]>>>)', () => {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
      const commands = manifest.capabilities.invocationCommands;

      for (const cmd of commands) {
        assert.ok(cmd.description.includes('<<<[TOOL_REQUEST]>>>'), `${cmd.command} missing <<<[TOOL_REQUEST]>>>`);
        assert.ok(cmd.description.includes('<<<[END_TOOL_REQUEST]>>>'), `${cmd.command} missing <<<[END_TOOL_REQUEST]>>>`);
        assert.ok(cmd.description.includes('tool_name:「始」NovelEngineering「末」'), `${cmd.command} missing tool_name`);
        assert.ok(cmd.description.includes(`command:「始」${cmd.command}「末」`), `${cmd.command} missing command name`);
      }
    });
  });

  // =========================================================================
  // Suite 2: Stdio Dispatcher Execution & Protocol
  // =========================================================================
  describe('Suite 2: Stdio Dispatcher Execution & Protocol', () => {
    it('should execute NovelEngineering.js and exit with code 0', async () => {
      const result = await invokePluginStdio({ action: 'ping' });
      assert.equal(result.code, 0, 'Plugin should exit with code 0');
    });

    it('should return valid single-line JSON on stdout', async () => {
      const result = await invokePluginStdio({ action: 'ping' });
      assert.ok(result.stdout.length > 0, 'stdout must not be empty');

      let parsed;
      assert.doesNotThrow(() => {
        parsed = JSON.parse(result.stdout);
      }, 'stdout must parse as valid JSON');

      assert.ok(parsed.status === 'success' || parsed.status === 'error');
    });

    it('should accept flat parameter object format (VCP stdio convention)', async () => {
      const res1 = await invokePluginStdio({ action: 'ping' });
      const res2 = await invokePluginStdio({ command: 'ping' });

      const parsed1 = JSON.parse(res1.stdout);
      const parsed2 = JSON.parse(res2.stdout);

      assert.equal(parsed1.status, 'success');
      assert.equal(parsed2.status, 'success');
    });

    it('should conform to VCP success response envelope { status, result }', async () => {
      const result = await invokePluginStdio({ action: 'ping' });
      const parsed = JSON.parse(result.stdout);

      assert.equal(parsed.status, 'success');
      assert.ok(parsed.result, 'result object must exist on success');
    });
  });

  // =========================================================================
  // Suite 3: Built-in Utility Commands (ping, help, info)
  // =========================================================================
  describe('Suite 3: Built-in Utility Commands (ping, help, info)', () => {
    it('should respond to "ping" with pong: true and timestamp', async () => {
      const result = await invokePluginStdio({ action: 'ping' });
      const parsed = JSON.parse(result.stdout);

      assert.equal(parsed.status, 'success');
      assert.equal(parsed.result.pong, true);
      assert.ok(parsed.result.timestamp, 'timestamp must be returned');
    });

    it('should respond to "help" with list of available commands and version', async () => {
      const result = await invokePluginStdio({ action: 'help' });
      const parsed = JSON.parse(result.stdout);

      assert.equal(parsed.status, 'success');
      assert.ok(Array.isArray(parsed.result.availableCommands));
      assert.ok(parsed.result.availableCommands.includes('ScanWorldTree'));
      assert.ok(parsed.result.availableCommands.includes('ExportImportReport'));
      assert.ok(parsed.result.version);
    });

    it('should respond to "info" with plugin status and readiness', async () => {
      const result = await invokePluginStdio({ action: 'info' });
      const parsed = JSON.parse(result.stdout);

      assert.equal(parsed.status, 'success');
      assert.equal(parsed.result.name, 'NovelEngineering');
      assert.ok(parsed.result.version);
      assert.ok(parsed.result.status);
    });
  });

  // =========================================================================
  // Suite 4: Unknown Actions & Malformed Input Handling
  // =========================================================================
  describe('Suite 4: Unknown Actions & Malformed Input Handling', () => {
    it('should return error envelope for unknown command with exit code 0', async () => {
      const result = await invokePluginStdio({ action: 'UnknownCommandXYZ' });
      assert.equal(result.code, 0, 'VCP expects exit code 0 even on application-level error');

      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.status, 'error');
      assert.ok(parsed.error.includes('UnknownCommandXYZ') || parsed.error.includes('Unknown') || parsed.error.includes('Unsupported'));
    });

    it('should handle malformed JSON on stdin gracefully without crashing', async () => {
      const result = await invokePluginStdio('{"invalid_json_missing_brace: true');
      assert.equal(result.code, 0);

      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.status, 'error');
      assert.ok(parsed.error.includes('Invalid') || parsed.error.includes('JSON'));
    });

    it('should handle empty stdin gracefully', async () => {
      const result = await invokePluginStdio('');
      assert.equal(result.code, 0);

      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.status, 'error');
    });

    it('should handle whitespace-only stdin gracefully', async () => {
      const result = await invokePluginStdio('   \n  \t  ');
      assert.equal(result.code, 0);

      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.status, 'error');
    });

    it('should return structured error when required parameters are missing', async () => {
      const result = await invokePluginStdio({
        action: 'GetSourceFile',
        parameters: {}
      });
      assert.equal(result.code, 0);

      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.status, 'error');
      assert.ok(parsed.error.length > 0);
    });
  });

  // =========================================================================
  // Suite 5: Stdio Isolation & Stderr Diagnostics
  // =========================================================================
  describe('Suite 5: Stdio Isolation & Stderr Diagnostics', () => {
    it('should ensure stdout contains ONLY the JSON payload (no banners or plain text logs)', async () => {
      const result = await invokePluginStdio({ action: 'ping' });

      const trimmed = result.stdout;
      assert.equal(trimmed.startsWith('{'), true, 'stdout must start with JSON {');
      assert.equal(trimmed.endsWith('}'), true, 'stdout must end with JSON }');

      const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
      assert.equal(lines.length, 1, 'stdout must contain exactly one line of JSON');
    });

    it('should route internal debug logs to stderr when DEBUG_MODE=true without breaking stdout', async () => {
      const result = await invokePluginStdio(
        { action: 'ping' },
        { DEBUG_MODE: 'true' }
      );

      assert.equal(result.code, 0);
      assert.doesNotThrow(() => JSON.parse(result.stdout));

      const parsed = JSON.parse(result.stdout);
      assert.equal(parsed.status, 'success');
    });

    it('should simulate Plugin.js output parser successfully', async () => {
      const result = await invokePluginStdio({ action: 'ping' });

      const potentialJsonMatch = result.stdout.match(/(\{[\s\S]*?\})(?:\s|$)/);
      assert.ok(potentialJsonMatch, 'Must match Plugin.js JSON regex');

      const parsedOutput = JSON.parse(potentialJsonMatch[1]);
      assert.ok(parsedOutput.status === 'success' || parsedOutput.status === 'error');
      assert.equal(parsedOutput.status, 'success');
    });
  });
});
