'use strict';

const path = require('path');
const fs = require('fs');

// 加载config.env
const configPath = path.join(__dirname, 'config.env');
const config = {};
if (fs.existsSync(configPath)) {
  const raw = fs.readFileSync(configPath, 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) config[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  }
}

// VCP数据根路径（绝对路径）
const VCP_DATA_PATH = config.VCP_DATA_PATH
  || path.resolve(__dirname, '../../../VCPChat/AppData');

/**
 * DeepMemo搜索入口 - 纯Node.js关键词滑窗匹配
 * server.js调用格式: deepMemoModule.search({ keyword, maid, window_size, userDataPath, currentTopicId })
 */
async function search(params) {
  const {
    keyword = '',
    window_size = 10,
    userDataPath,
    currentTopicId = ''
  } = params;

  if (!keyword.trim()) {
    return { status: 'error', error: '[DeepMemo] 未提供有效关键词' };
  }

  const winSize = Math.max(1, Math.min(20, parseInt(window_size) || 10));

  // 构建UserData目录路径
  const dataPath = userDataPath || path.join(VCP_DATA_PATH, 'UserData');

  // 分割关键词
  const keywords = keyword.trim().split(/[\s,，]+/).filter(k => k.length > 0);

  const results = [];
  const seen = new Set();

  // 遍历所有Agent目录
  if (!fs.existsSync(dataPath)) {
    return { status: 'error', error: `[DeepMemo] UserData目录不存在: ${dataPath}` };
  }

  const agentDirs = fs.readdirSync(dataPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const agentId of agentDirs) {
    const topicsDir = path.join(dataPath, agentId, 'topics');
    if (!fs.existsSync(topicsDir)) continue;

    const topicDirs = fs.readdirSync(topicsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const topicId of topicDirs) {
      const historyFile = path.join(topicsDir, topicId, 'history.json');
      if (!fs.existsSync(historyFile)) continue;

      let messages;
      try {
        const raw = fs.readFileSync(historyFile, 'utf8');
        messages = JSON.parse(raw);
        if (!Array.isArray(messages)) continue;
      } catch (e) {
        continue;
      }

      // 滑窗匹配
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const content = typeof msg.content === 'string'
          ? msg.content
          : (Array.isArray(msg.content)
            ? msg.content.map(c => c.text || '').join(' ')
            : JSON.stringify(msg.content));

        const matched = keywords.some(kw =>
          content.toLowerCase().includes(kw.toLowerCase())
        );

        if (matched) {
          // 提取窗口上下文
          const start = Math.max(0, i - Math.floor(winSize / 2));
          const end = Math.min(messages.length, i + Math.ceil(winSize / 2));
          const window = messages.slice(start, end);

          const key = `${agentId}:${topicId}:${i}`;
          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              agentId,
              topicId,
              matchIndex: i,
              role: msg.role,
              content: content.slice(0, 300),
              context: window.map(m => ({
                role: m.role,
                content: (typeof m.content === 'string'
                  ? m.content
                  : JSON.stringify(m.content)).slice(0, 200)
              }))
            });
          }

          if (results.length >= 20) break;
        }
      }
      if (results.length >= 20) break;
    }
    if (results.length >= 20) break;
  }

  return {
    status: 'success',
    found: results.length,
    keyword,
    results
  };
}

module.exports = { search };// ---- VCP Tool Bridge (added by Aemeath) ----
async function processToolCall(args = {}) {
  const { keyword = '', window_size = 10, maid = '', userDataPath, currentTopicId = '' } = args || {};
  return await search({ keyword, window_size, maid, userDataPath, currentTopicId });
}

function initialize() {
  return true;
}

function shutdown() {
  return true;
}

// overwrite export for hybridservice direct invocation
module.exports = { search, processToolCall, initialize, shutdown };