/**
 * test/helpers/tempDir.js
 * Ephemeral sandbox directory utility for tests
 * @license MIT
 */

'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function createTempDir(prefix = 'vcp-test-') {
  const dirPath = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  return {
    path: dirPath,
    resolve: (...segments) => path.resolve(dirPath, ...segments),
    createSubdir: (subdir) => {
      const sub = path.join(dirPath, subdir);
      fs.mkdirSync(sub, { recursive: true });
      return sub;
    },
    cleanup: () => {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } catch (_) {}
    }
  };
}

module.exports = { createTempDir };
