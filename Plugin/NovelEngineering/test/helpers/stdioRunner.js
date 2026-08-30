/**
 * test/helpers/stdioRunner.js
 * Subprocess stdio invocation helper for VCP plugin testing
 * @license MIT
 */

'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

function executePluginCommand(entryScriptPath, payload, options = {}) {
  const {
    cwd = path.dirname(entryScriptPath),
    env = {},
    timeoutMs = 15000
  } = options;

  return new Promise((resolve, reject) => {
    const inputString = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const child = spawn(process.execPath, [entryScriptPath], {
      cwd,
      env: { ...process.env, ...env },
      shell: false,
      windowsHide: true
    });

    let stdoutBuffer = '';
    let stderrBuffer = '';
    let hasExited = false;

    const timer = setTimeout(() => {
      if (!hasExited) {
        child.kill();
        reject(new Error(`Plugin execution timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdoutBuffer += chunk; });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', chunk => { stderrBuffer += chunk; });

    child.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });

    child.on('exit', (code, signal) => {
      hasExited = true;
      clearTimeout(timer);
      resolve({
        code,
        signal,
        stdout: stdoutBuffer.trim(),
        stderr: stderrBuffer.trim(),
        rawStdout: stdoutBuffer,
        json: () => JSON.parse(stdoutBuffer.trim())
      });
    });

    try {
      if (inputString !== undefined && inputString !== null) {
        child.stdin.write(inputString + '\n');
      }
      child.stdin.end();
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

module.exports = { executePluginCommand };
