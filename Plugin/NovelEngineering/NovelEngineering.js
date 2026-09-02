/**
 * NovelEngineering.js - VCP Novel Manager Synchronous Stdio Entry Point
 * @module NovelEngineering
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 1. Stdout / Stderr Isolation: Redirect all diagnostic logging to stderr
const originalStdoutWrite = process.stdout.write.bind(process.stdout);
console.log = (...args) => console.error(...args);
console.info = (...args) => console.error(...args);
console.debug = (...args) => console.error(...args);
console.warn = (...args) => console.error(...args);

function debugLog(...args) {
  if (process.env.DEBUG_MODE === 'true' || process.env.DebugMode === 'true') {
    console.error(`[NovelEngineering DEBUG ${new Date().toISOString()}]`, ...args);
  }
}

// 2. Load Environment Variables (config.env -> .env -> defaults)
const configEnvPath = path.join(__dirname, 'config.env');
const dotEnvPath = path.join(__dirname, '.env');
if (fs.existsSync(configEnvPath)) {
  dotenv.config({ path: configEnvPath });
} else if (fs.existsSync(dotEnvPath)) {
  dotenv.config({ path: dotEnvPath });
}

// 3. Write Response to stdout
function outputSuccess(data) {
  let resultObj = {};

  if (typeof data === 'string') {
    resultObj = {
      content: [{ type: 'text', text: data }],
      details: {}
    };
  } else if (data && typeof data === 'object') {
    resultObj = { ...data };

    if (!resultObj.content) {
      resultObj.content = [
        {
          type: 'text',
          text: data.message || 'Operation completed successfully.'
        }
      ];
    } else if (typeof resultObj.content === 'string') {
      resultObj.content = [{ type: 'text', text: resultObj.content }];
    }

    if (!resultObj.details && !data.pong && !data.availableCommands && !data.name) {
      resultObj.details = {};
    }
  }

  const payload = {
    status: 'success',
    result: resultObj
  };

  originalStdoutWrite(JSON.stringify(payload) + '\n');
}

function outputError(errorMessage, details = null) {
  let msg = errorMessage;
  let code = undefined;
  let det = details;

  if (errorMessage instanceof Error || (errorMessage && typeof errorMessage === 'object')) {
    msg = errorMessage.message || String(errorMessage);
    if (errorMessage.code) code = errorMessage.code;
    if (errorMessage.details && typeof errorMessage.details === 'object' && Object.keys(errorMessage.details).length > 0) {
      det = det ? { ...errorMessage.details, ...det } : errorMessage.details;
    }
  }

  const payload = {
    status: 'error',
    error: typeof msg === 'string' ? msg : String(msg)
  };
  if (code) {
    payload.code = code;
  }
  if (det) {
    payload.details = det;
  }
  originalStdoutWrite(JSON.stringify(payload) + '\n');
}

// 4. Request Normalization
function normalizeRequest(rawInput) {
  if (!rawInput || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    throw new Error('Invalid input payload: expected a JSON object.');
  }

  // 优先使用 command 作为顶层路由，如果没有再回退到 action
  const routeCommand = rawInput.command || rawInput.commandIdentifier || rawInput.action;
  if (!routeCommand || typeof routeCommand !== 'string' || !routeCommand.trim()) {
    throw new Error('Missing or invalid command identifier.');
  }

  let parameters = {};
  if (rawInput.parameters && typeof rawInput.parameters === 'object' && !Array.isArray(rawInput.parameters)) {
    parameters = { ...rawInput.parameters };
  } else {
    // ⚠️ 关键修改：不要把 action 剥离掉！保留它传给内部处理器
    const { command: _c, commandIdentifier: _ci, parameters: _p, ...rest } = rawInput;
    parameters = rest;
  }

  return { action: routeCommand.trim(), parameters };
}

// 5. Command Routing Pipeline
async function dispatchCommand(action, parameters) {
  debugLog(`Dispatching command: ${action}`, parameters);

  const dispatcherPath = path.join(__dirname, 'src', 'commands', 'CommandDispatcher.js');
  if (fs.existsSync(dispatcherPath)) {
    const { CommandDispatcher } = require(dispatcherPath);
    const basePath = process.env.PLUGIN_ROOT || __dirname;
    const dispatcher = new CommandDispatcher({
      basePath,
      config: process.env
    });
    return await dispatcher.dispatch(action, parameters);
  }

  throw new Error(`CommandDispatcher module not found at: ${dispatcherPath}`);
}

// 6. Main Process Loop (Stdio Ingestion)
async function main() {
  let inputBuffer = '';

  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
  });

  process.stdin.on('end', async () => {
    try {
      const rawContent = inputBuffer.trim();
      if (!rawContent) {
        outputError('Empty stdin received by NovelEngineering plugin.');
        process.exit(0);
        return;
      }

      let rawJson;
      try {
        rawJson = JSON.parse(rawContent);
      } catch (jsonErr) {
        outputError(`Invalid JSON input: ${jsonErr.message}`);
        process.exit(0);
        return;
      }

      const { action, parameters } = normalizeRequest(rawJson);
      const result = await dispatchCommand(action, parameters);
      outputSuccess(result);
      process.exit(0);
    } catch (error) {
      debugLog('Execution failure:', error);
      outputError(error);
      process.exit(0);
    }
  });

  process.stdin.on('error', (err) => {
    debugLog('process.stdin error:', err);
    outputError(`process.stdin stream error: ${err.message}`);
    process.exit(0);
  });
}

// 7. Global Safety Traps
process.on('uncaughtException', (err) => {
  console.error('[NovelEngineering uncaughtException]', err);
  outputError(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[NovelEngineering unhandledRejection]', reason);
  outputError(`Unhandled Rejection: ${reason && reason.message ? reason.message : String(reason)}`);
  process.exit(1);
});

process.on('SIGTERM', () => {
  debugLog('Received SIGTERM, exiting gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  debugLog('Received SIGINT, exiting gracefully');
  process.exit(0);
});

// Launch
main();
