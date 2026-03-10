/**
 * QQGroupReader - QQ群聊消息读取器
 * 
 * 从本地 NTQQ 加密数据库中读取群聊消息。
 * 使用 sqlcipher 解密 SQLCipher 加密的 nt_msg.db，提取群消息文本。
 * 
 * 插件类型: synchronous (stdio)
 * 输入: JSON { command, group_id, hours, limit }
 * 输出: JSON { success, data/error }
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// 加载配置
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const QQ_DB_KEY = process.env.QQ_DB_KEY || '';
const QQ_DB_DIR = process.env.QQ_DB_DIR || '';
const SQLCIPHER_PATH = process.env.SQLCIPHER_PATH || '/opt/homebrew/opt/sqlcipher/bin/sqlcipher';
const DEFAULT_HOURS = parseInt(process.env.DEFAULT_HOURS) || 24;
const MAX_MESSAGES = parseInt(process.env.MAX_MESSAGES) || 500;

// 关注配置
const WATCH_GROUP = (process.env.WATCH_GROUP || '').split(',').map(s => s.trim()).filter(Boolean);
const WATCH_QQ = (process.env.WATCH_QQ || '').split(',').map(s => s.trim()).filter(Boolean);
const WATCH_KEYWORDS = (process.env.WATCH_KEYWORDS || '').split(',').map(s => s.trim()).filter(Boolean);

const PRAGMA_HEADER = `PRAGMA key = "${QQ_DB_KEY}";
PRAGMA kdf_iter = 4000;
PRAGMA cipher_page_size = 4096;
PRAGMA cipher_hmac_algorithm = HMAC_SHA1;
PRAGMA cipher_default_kdf_algorithm = PBKDF2_HMAC_SHA512;
`;

// ============================================================
// Protobuf 解析工具
// ============================================================

function decodeVarint(data, pos) {
  let result = 0;
  let shift = 0;
  while (pos < data.length) {
    const b = data[pos];
    result |= (b & 0x7F) << shift;
    pos++;
    if (!(b & 0x80)) break;
    shift += 7;
  }
  return [result, pos];
}

function isMeaningfulText(text) {
  text = text.trim();
  if (text.length < 1) return false;
  // 排除 UID
  if (text.startsWith('u_') && text.length > 15) return false;
  // 排除纯 hex hash
  if (/^[0-9a-fA-F]{16,}$/.test(text)) return false;
  // 排除文件名
  if (/^[0-9A-F]{32}\.(jpg|png|gif|mp4|webp)$/i.test(text)) return false;
  // 排除下载链接
  if (text.includes('download?appid') || text.includes('multimedia.nt.qq.com')) return false;
  if (text.startsWith('http://') || text.startsWith('https://')) return false;
  // 排除 protobuf 内部字段名
  const internalFields = ['main', 'nick_str1', 'nick_str2', 'uin_str1', 'uin_str2',
    'type_str2', 'suffix_str', 'action_str', 'action_img_url', 'jp_str1',
    'prodid', 'msgType', 'senderUin'];
  if (internalFields.includes(text)) return false;
  // 排除 fileid
  if (text.startsWith('Eh') && text.length > 50 && !/[，。！？\s]/.test(text)) return false;
  // 排除纯路径片段
  if (/^(Users|Library|Containers|com\.tencent|Application|Support|nt_qq|nt_data|Pic|Ori|\d{4}-\d{2})$/.test(text)) return false;
  // 排除 API key 模式 (sk-xxx)
  if (/^sk-[A-Za-z0-9]{20,}$/.test(text)) return false;
  // 排除纯数字 QQ 号（单独出现的）
  if (/^\d{5,12}$/.test(text)) return false;
  // 乱码检测：如果不可打印字符占比超过 30%，认为是二进制噪音
  const unprintable = text.replace(/[\u0020-\u007e\u00a0-\uffff]/g, '').length;
  if (unprintable > text.length * 0.3) return false;
  // 必须包含可读字符
  if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffefa-zA-Z0-9]/.test(text)) return true;
  return false;
}

function cleanExtractedText(text) {
  if (!text) return text;
  // 移除 Unicode 替换字符和控制字符
  let cleaned = text.replace(/[\ufffd\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
  // 移除 protobuf 残留的二进制噪音（连续的非可读字符）
  cleaned = cleaned.replace(/[^\u0020-\u007e\u00a0-\uffff]{2,}/g, '');
  // 清理开头的 protobuf tag/length 前缀（Latin-1 扩展区 + 短噪音）
  // 这些是 @ 引用消息中 protobuf 编码的 field tag + varint length
  cleaned = cleaned.replace(/^[\u0080-\u024f\u0000-\u001f]{1,10}/g, '');
  // 清理文本中间夹杂的单个 Latin-1 扩展字符噪音
  cleaned = cleaned.replace(/[\u0080-\u00ff][\w\u4e00-\u9fff]/g, (m) => m.slice(1));
  // 清理 protobuf 引用前缀模式：1-4个乱码字符 + 可选数字/字母 + 中文/英文开头
  cleaned = cleaned.replace(/^[\u0080-\u052f]{1,6}[a-zA-Z0-9]{0,3}(?=[\u4e00-\u9fff@a-zA-Z\[])/g, '');
  // 清理开头的单字符 protobuf tag 残留（如 "i2"、"iT"、"i?" 后跟中文/英文）
  cleaned = cleaned.replace(/^[a-z][0-9A-Z?$<>#]{0,2}(?=[\u4e00-\u9fff@a-zA-Z\[我你他她它的是在有])/g, '');
  // 清理引用消息中混入的 UID（u_xxx 格式）
  cleaned = cleaned.replace(/u_[A-Za-z0-9_-]{15,}/g, '').trim();
  // 清理多余空格和首尾空白
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  // 如果清理后只剩下很短的噪音（<2个可读字符），返回空
  const readable = cleaned.replace(/[^\u4e00-\u9fffa-zA-Z0-9]/g, '');
  if (readable.length < 2 && cleaned.length < 5) return '';
  return cleaned;
}

function parseProtobufText(blob) {
  if (!blob || blob.length === 0) return { text: null, type: 'empty' };

  const texts = [];
  let i = 0;

  while (i < blob.length) {
    try {
      if (i >= blob.length) break;
      const [tagVal, newI] = decodeVarint(blob, i);
      if (newI === i) break;
      i = newI;

      const wireType = tagVal & 0x07;

      if (wireType === 0) {
        // varint
        const [, ni] = decodeVarint(blob, i);
        i = ni;
      } else if (wireType === 1) {
        // 64-bit
        i += 8;
      } else if (wireType === 2) {
        // length-delimited
        const [length, ni] = decodeVarint(blob, i);
        i = ni;
        if (length > 0 && i + length <= blob.length) {
          const chunk = blob.slice(i, i + length);
          i += length;
          try {
            const text = chunk.toString('utf-8');
            // 检查是否包含非法 UTF-8 替换字符过多
            const replacements = (text.match(/\ufffd/g) || []).length;
            if (replacements < text.length * 0.3 && isMeaningfulText(text)) {
              texts.push(text);
            } else if (chunk.length > 10) {
              // 尝试递归解析嵌套 protobuf
              const subTexts = parseNestedProtobuf(chunk);
              texts.push(...subTexts);
            }
          } catch (e) {
            // 非文本
          }
        } else {
          if (length > 0) i = Math.min(i + length, blob.length);
        }
      } else if (wireType === 5) {
        // 32-bit
        i += 4;
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }

  if (texts.length > 0) {
    const seen = new Set();
    const unique = texts.filter(t => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    return { text: unique.join(' '), type: 'text' };
  }
  return { text: null, type: 'non-text' };
}

function parseNestedProtobuf(data) {
  const texts = [];
  let i = 0;
  while (i < data.length) {
    try {
      const [tagVal, newI] = decodeVarint(data, i);
      if (newI === i || newI > data.length) break;
      i = newI;
      const wireType = tagVal & 0x07;

      if (wireType === 0) {
        const [, ni] = decodeVarint(data, i);
        i = ni;
      } else if (wireType === 1) {
        i += 8;
      } else if (wireType === 2) {
        const [length, ni] = decodeVarint(data, i);
        i = ni;
        if (length > 0 && i + length <= data.length) {
          const chunk = data.slice(i, i + length);
          i += length;
          try {
            const text = chunk.toString('utf-8');
            const replacements = (text.match(/\ufffd/g) || []).length;
            if (replacements < text.length * 0.3 && isMeaningfulText(text)) {
              texts.push(text);
            }
          } catch (e) { /* skip */ }
        } else {
          break;
        }
      } else if (wireType === 5) {
        i += 4;
      } else {
        break;
      }
    } catch (e) {
      break;
    }
  }
  return texts;
}

// ============================================================
// 数据库操作
// ============================================================

function prepareDatabases() {
  const tmpDir = os.tmpdir();
  const msgDbSrc = path.join(QQ_DB_DIR, 'nt_msg.db');
  const profileDbSrc = path.join(QQ_DB_DIR, 'profile_info.db');

  if (!fs.existsSync(msgDbSrc)) {
    throw new Error(`消息数据库不存在: ${msgDbSrc}`);
  }

  // 复制并去头
  const msgDbTmp = path.join(tmpDir, 'qqgr_nt_msg.db');
  const msgDbClean = path.join(tmpDir, 'qqgr_nt_msg_clean.db');
  const profileDbTmp = path.join(tmpDir, 'qqgr_profile.db');
  const profileDbClean = path.join(tmpDir, 'qqgr_profile_clean.db');

  // 复制消息数据库
  fs.copyFileSync(msgDbSrc, msgDbTmp);
  const msgData = fs.readFileSync(msgDbTmp);
  fs.writeFileSync(msgDbClean, msgData.slice(1024));

  // 复制 profile 数据库（如果存在）
  if (fs.existsSync(profileDbSrc)) {
    fs.copyFileSync(profileDbSrc, profileDbTmp);
    const profileData = fs.readFileSync(profileDbTmp);
    fs.writeFileSync(profileDbClean, profileData.slice(1024));
  }

  // 清理临时中间文件
  try { fs.unlinkSync(msgDbTmp); } catch (e) { /* ignore */ }
  try { fs.unlinkSync(profileDbTmp); } catch (e) { /* ignore */ }

  return { msgDb: msgDbClean, profileDb: fs.existsSync(profileDbClean) ? profileDbClean : null };
}

function runSql(dbPath, sql) {
  const fullSql = PRAGMA_HEADER + sql;
  try {
    const result = execSync(`"${SQLCIPHER_PATH}" "${dbPath}"`, {
      input: fullSql,
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024, // 50MB
      timeout: 25000
    });
    const lines = result.trim().split('\n');
    return lines.filter(l => l && l !== 'ok');
  } catch (e) {
    throw new Error(`SQL 执行失败: ${e.message}`);
  }
}

function runSqlBinary(dbPath, sql) {
  const fullSql = PRAGMA_HEADER + sql;
  try {
    const result = execSync(`"${SQLCIPHER_PATH}" "${dbPath}"`, {
      input: fullSql,
      maxBuffer: 50 * 1024 * 1024,
      timeout: 25000
    });
    return result;
  } catch (e) {
    throw new Error(`SQL 执行失败: ${e.message}`);
  }
}

// ============================================================
// 业务逻辑
// ============================================================

function loadProfiles(msgDb, profileDb) {
  const profiles = {};

  // 从 profile_info_v6 加载昵称
  if (profileDb) {
    try {
      const lines = runSql(profileDb, `.mode list\n.separator §\nSELECT [1000],[1001],[1002] FROM profile_info_v6;`);
      for (const line of lines) {
        const parts = line.split('§');
        if (parts.length >= 3) {
          const [uid, nick, qq] = parts;
          profiles[uid] = { nick: nick || `QQ:${qq}`, qq };
        }
      }
    } catch (e) {
      // profile 数据库可能不可用
    }
  }

  // 从 nt_uid_mapping_table 补充 QQ 号
  try {
    const lines = runSql(msgDb, `.mode list\n.separator §\nSELECT [48902],[1002] FROM nt_uid_mapping_table;`);
    for (const line of lines) {
      const parts = line.split('§');
      if (parts.length >= 2) {
        const [uid, qq] = parts;
        if (!profiles[uid]) {
          profiles[uid] = { nick: `QQ:${qq}`, qq };
        } else if (!profiles[uid].qq) {
          profiles[uid].qq = qq;
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return profiles;
}

function readGroupMessages(msgDb, profileDb, groupId, hours, limit) {
  const profiles = loadProfiles(msgDb, profileDb);
  const sinceTs = Math.floor(Date.now() / 1000) - hours * 3600;

  // 查询消息（使用 hex 输出 BLOB）
  const sql = `.mode list
.separator §
SELECT [40050],[40020],[40027],[40010],hex([40800]) 
FROM group_msg_table 
WHERE [40027] = ${groupId} AND [40050] >= ${sinceTs}
ORDER BY [40050] ASC
LIMIT ${limit};`;

  const lines = runSql(msgDb, sql);
  const messages = [];

  for (const line of lines) {
    const parts = line.split('§', 5);
    if (parts.length < 5) continue;

    const [ts, senderUid, group, msgType, hexData] = parts;

    let timeStr = '??:??';
    let dateStr = '????-??-??';
    try {
      const d = new Date(parseInt(ts) * 1000);
      timeStr = d.toTimeString().slice(0, 8);
      dateStr = d.toISOString().slice(0, 10);
    } catch (e) { /* ignore */ }

    const senderInfo = profiles[senderUid] || {};
    const senderName = senderInfo.nick || (senderUid ? senderUid.slice(0, 12) : '?');

    if (!hexData) continue;

    try {
      const raw = Buffer.from(hexData, 'hex');
      const { text, type } = parseProtobufText(raw);

      if (text) {
        // 清理戳一戳等 XML 消息
        let cleanText = text;
        if (cleanText.includes('<gtip')) {
          const norMatch = cleanText.match(/txt="([^"]+)"/);
          cleanText = norMatch ? `[${norMatch[1]}]` : '[互动消息]';
        }

        // 应用通用文本清理
        cleanText = cleanExtractedText(cleanText);

        // 跳过无意义消息
        if (!cleanText || cleanText === '[动画表情]' || cleanText.trim().length === 0) continue;
        // 跳过纯图片/文件消息（只剩文件名或空白）
        if (/^\$?[0-9A-F]{32}\.(jpg|png|gif|mp4|webp)$/i.test(cleanText.trim())) continue;

        // 关注标记
        const tags = [];
        const qq = senderInfo.qq || '';
        if (WATCH_QQ.length > 0 && WATCH_QQ.includes(qq)) {
          tags.push('★关注人');
        }
        if (WATCH_KEYWORDS.length > 0) {
          const matched = WATCH_KEYWORDS.filter(kw => cleanText.includes(kw));
          if (matched.length > 0) {
            tags.push(`★话题:${matched.slice(0, 3).join(',')}`);
          }
        }

        messages.push({
          time: timeStr,
          date: dateStr,
          sender: senderName,
          sender_qq: qq,
          content: cleanText,
          tags
        });
      }
    } catch (e) {
      // 解析失败，跳过
    }
  }

  return messages;
}

function listGroups(msgDb) {
  const sql = `.mode list
.separator §
SELECT [40021], COUNT(*) as cnt FROM group_msg_table GROUP BY [40021] ORDER BY cnt DESC LIMIT 50;`;

  const lines = runSql(msgDb, sql);
  const groups = [];

  for (const line of lines) {
    const parts = line.split('§');
    if (parts.length >= 2) {
      groups.push({
        group_id: parts[0],
        message_count: parseInt(parts[1])
      });
    }
  }

  return groups;
}

// ============================================================
// 主入口 (stdio)
// ============================================================

function formatTextSummary(messages) {
  if (!messages || messages.length === 0) return '';
  let textSummary = '';
  const dateGroups = {};
  for (const msg of messages) {
    const key = msg.date;
    if (!dateGroups[key]) dateGroups[key] = [];
    dateGroups[key].push(msg);
  }
  for (const [date, msgs] of Object.entries(dateGroups)) {
    textSummary += `\n【${date}】\n`;
    for (const msg of msgs) {
      const tagStr = (msg.tags && msg.tags.length > 0) ? ` [${msg.tags.join('] [')}]` : '';
      textSummary += `[${msg.time}] ${msg.sender}:${tagStr} ${msg.content}\n`;
    }
  }
  return textSummary;
}

function processRequest(input) {
  try {
    if (!QQ_DB_KEY) {
      return { status: 'error', error: '未配置 QQ_DB_KEY，请在 config.env 中设置数据库解密密钥' };
    }
    if (!QQ_DB_DIR) {
      return { status: 'error', error: '未配置 QQ_DB_DIR，请在 config.env 中设置数据库目录路径' };
    }

    const { command, group_id, hours, limit } = input;
    const { msgDb, profileDb } = prepareDatabases();

    if (command === 'ListGroups') {
      const groups = listGroups(msgDb);
      return {
        status: 'success',
        result: {
          groups,
          total: groups.length,
          description: `共发现 ${groups.length} 个群，按消息数量降序排列`
        }
      };
    }

    if (command === 'ReadGroupMessages') {
      if (!group_id) {
        return { status: 'error', error: '缺少参数 group_id（群号）' };
      }

      const h = parseInt(hours) || DEFAULT_HOURS;
      const lim = Math.min(parseInt(limit) || MAX_MESSAGES, MAX_MESSAGES);
      const messages = readGroupMessages(msgDb, profileDb, group_id, h, lim);

      const textSummary = formatTextSummary(messages);

      return {
        status: 'success',
        result: {
          group_id,
          hours: h,
          message_count: messages.length,
          text_summary: textSummary || '该时间段内没有找到消息。',
          messages
        }
      };
    }

    if (command === 'ReadWatchedMessages') {
      const targetGroup = group_id || (WATCH_GROUP.length > 0 ? WATCH_GROUP[0] : '');
      if (!targetGroup) {
        return { status: 'error', error: '未配置 WATCH_GROUP 且未提供 group_id' };
      }

      const h = parseInt(hours) || DEFAULT_HOURS;
      const lim = Math.min(parseInt(limit) || MAX_MESSAGES, MAX_MESSAGES);
      const allMessages = readGroupMessages(msgDb, profileDb, targetGroup, h, lim);

      // 只保留有标记的消息（关注人或关注话题）
      const watched = allMessages.filter(m => m.tags && m.tags.length > 0);
      const textSummary = formatTextSummary(watched);

      return {
        status: 'success',
        result: {
          group_id: targetGroup,
          hours: h,
          total_messages: allMessages.length,
          watched_count: watched.length,
          watch_config: {
            watch_qq: WATCH_QQ,
            watch_keywords: WATCH_KEYWORDS.slice(0, 10)
          },
          text_summary: textSummary || '该时间段内没有匹配关注条件的消息。',
          messages: watched
        }
      };
    }

    if (command === 'GetNewMessages') {
      const targetGroup = group_id || (WATCH_GROUP.length > 0 ? WATCH_GROUP[0] : '');
      if (!targetGroup) {
        return { status: 'error', error: '未配置 WATCH_GROUP 且未提供 group_id' };
      }

      // 读取上次时间戳
      const stateDir = path.join(__dirname, 'state');
      if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });
      const stateFile = path.join(stateDir, `last_ts_${targetGroup}.txt`);
      let lastTs = 0;
      try { lastTs = parseInt(fs.readFileSync(stateFile, 'utf-8').trim()) || 0; } catch (e) { /* first run */ }

      // 如果从未读取过，默认读最近 5 分钟
      const sinceTs = lastTs > 0 ? lastTs : Math.floor(Date.now() / 1000) - 300;
      const lim = Math.min(parseInt(limit) || 100, MAX_MESSAGES);

      const sql = `.mode list
.separator §
SELECT [40050],[40020],[40027],[40010],hex([40800]) 
FROM group_msg_table 
WHERE [40027] = ${targetGroup} AND [40050] > ${sinceTs}
ORDER BY [40050] ASC
LIMIT ${lim};`;

      const profiles = loadProfiles(msgDb, profileDb);
      const lines = runSql(msgDb, sql);
      const messages = [];
      let maxTs = sinceTs;

      for (const line of lines) {
        const parts = line.split('§', 5);
        if (parts.length < 5) continue;
        const [ts, senderUid, group, msgType, hexData] = parts;
        const tsNum = parseInt(ts);
        if (tsNum > maxTs) maxTs = tsNum;

        let timeStr = '??:??';
        try { timeStr = new Date(tsNum * 1000).toTimeString().slice(0, 8); } catch (e) {}

        const senderInfo = profiles[senderUid] || {};
        const senderName = senderInfo.nick || (senderUid ? senderUid.slice(0, 12) : '?');
        if (!hexData) continue;

        try {
          const raw = Buffer.from(hexData, 'hex');
          const { text } = parseProtobufText(raw);
          if (!text) continue;

          let cleanText = text;
          if (cleanText.includes('<gtip')) {
            const norMatch = cleanText.match(/txt="([^"]+)"/);
            cleanText = norMatch ? `[${norMatch[1]}]` : '[互动消息]';
          }
          cleanText = cleanExtractedText(cleanText);
          if (!cleanText || cleanText === '[动画表情]' || cleanText.trim().length === 0) continue;
          if (/^\$?[0-9A-F]{32}\.(jpg|png|gif|mp4|webp)$/i.test(cleanText.trim())) continue;

          const tags = [];
          const qq = senderInfo.qq || '';
          if (WATCH_QQ.length > 0 && WATCH_QQ.includes(qq)) tags.push('★关注人');
          if (WATCH_KEYWORDS.length > 0) {
            const matched = WATCH_KEYWORDS.filter(kw => cleanText.includes(kw));
            if (matched.length > 0) tags.push(`★话题:${matched.slice(0, 3).join(',')}`);
          }

          messages.push({ time: timeStr, sender: senderName, sender_qq: qq, content: cleanText, tags });
        } catch (e) {}
      }

      // 保存最新时间戳
      fs.writeFileSync(stateFile, String(maxTs), 'utf-8');

      const textSummary = formatTextSummary(messages.map(m => ({ ...m, date: '' })));

      return {
        status: 'success',
        result: {
          group_id: targetGroup,
          new_count: messages.length,
          since_ts: sinceTs,
          latest_ts: maxTs,
          text_summary: textSummary || '没有新消息。',
          messages
        }
      };
    }

    return { status: 'error', error: `未知命令: ${command}` };
  } catch (e) {
    return { status: 'error', error: e.message };
  }
}

// stdio 读取
let inputData = '';
process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => { inputData += chunk; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);
    const result = processRequest(input);
    process.stdout.write(JSON.stringify(result));
  } catch (e) {
    process.stdout.write(JSON.stringify({
      status: 'error',
      error: `输入解析失败: ${e.message}`
    }));
  }
});
