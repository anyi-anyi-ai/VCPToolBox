/**
 * 批量消息差异计算
 * 手机端发送所有 topic 的本地消息哈希，桌面端直接返回需要 pull/push 的结果
 */

const { getDb } = require("../core/db");
const { getLogger } = require("../core/logger");

/**
 * 处理 SYNC_TOPIC_HASH_BATCH
 * @param {object} payload - { hashes: { topicId: contentHash } }
 * @returns {object} { type: "SYNC_TOPIC_HASH_RESULTS", changedTopics: [topicId, ...] }
 */
function handleSyncTopicHashBatch(payload) {
  const db = getDb();
  const logger = getLogger();
  if (!db) {
    logger.logOperation("topic_metadata", "diff_batch", "global", "error", "database not initialized");
    return { type: "SYNC_TOPIC_HASH_RESULTS", changedTopics: [] };
  }

  const hashes = payload.hashes || {};
  const changedTopics = [];
  let matchCount = 0;

  for (const [topicId, localHash] of Object.entries(hashes)) {
    try {
      const topicRow = db
        .prepare("SELECT aggregated_hash FROM entity_index WHERE id = ? AND type = 'topic' AND deleted_at IS NULL")
        .get(topicId);

      if (topicRow && topicRow.aggregated_hash !== null && topicRow.aggregated_hash === localHash) {
        matchCount++;
        continue;
      }
      changedTopics.push(topicId);
    } catch (e) {
      // 查询出错时保守处理：视为有变化
      changedTopics.push(topicId);
    }
  }

  const total = Object.keys(hashes).length;
  logger.logOperation("topic_metadata", "diff_batch", "summary", "success", `total=${total} match=${matchCount} changed=${changedTopics.length}`);

  return {
    type: "SYNC_TOPIC_HASH_RESULTS",
    changedTopics,
  };
}

/**
 * 处理 SYNC_TOPIC_HASH_BATCH_V2 (V2: 支持双哈希对比)
 * @param {object} payload - { hashes: { topicId: { configHash, contentHash } } }
 */
function handleSyncTopicHashBatchV2(payload) {
  const db = getDb();
  const logger = getLogger();
  if (!db) {
    logger.logOperation("topic_metadata", "diff_batch_v2", "global", "error", "database not initialized");
    return { type: "SYNC_TOPIC_HASH_RESULTS", changedTopics: [] };
  }

  const hashes = payload.hashes || {};
  const changedTopics = [];
  let matchCount = 0;

  for (const [topicId, remoteHashes] of Object.entries(hashes)) {
    try {
      const topicRow = db
        .prepare("SELECT hash, aggregated_hash FROM entity_index WHERE id = ? AND type = 'topic' AND deleted_at IS NULL")
        .get(topicId);

      if (!topicRow) {
        changedTopics.push(topicId);
        continue;
      }

      const localConfig = topicRow.hash || "";
      const remoteConfig = remoteHashes.configHash || "";
      const localContent = topicRow.aggregated_hash || "";
      const remoteContent = remoteHashes.contentHash || "";

      if (localConfig === remoteConfig && localContent === remoteContent) {
        matchCount++;
      } else {
        changedTopics.push(topicId);
      }
    } catch (e) {
      changedTopics.push(topicId);
    }
  }

  const total = Object.keys(hashes).length;
  logger.logOperation("topic_metadata", "diff_batch_v2", "summary", "success", `total=${total} match=${matchCount} changed=${changedTopics.length}`);

  return {
    type: "SYNC_TOPIC_HASH_RESULTS",
    changedTopics,
  };
}

/**
 * 处理 SYNC_MESSAGE_DIFF_BATCH
 * @param {object} payload - { topics: { topicId: { topicHash, messages: { msgId: hash } } } }
 * @returns {object} { type: "SYNC_DIFF_RESULTS_BATCH", results: { topicId: { toPull, toPush } } }
 */
function handleSyncMessageDiffBatch(payload) {
  const db = getDb();
  const logger = getLogger();
  if (!db) {
    logger.logOperation("messages", "diff_batch", "global", "error", "database not initialized");
    return { type: "SYNC_DIFF_RESULTS_BATCH", results: {} };
  }

  const results = {};
  const topics = payload.topics || {};
  const topicIds = Object.keys(topics);
  let fastPathCount = 0;
  let detailedCount = 0;

  for (const [topicId, localState] of Object.entries(topics)) {
    try {
      // 1. 快速路径：比较 topic 级 aggregated_hash
      const topicRow = db
        .prepare("SELECT aggregated_hash FROM entity_index WHERE id = ? AND type = 'topic' AND deleted_at IS NULL")
        .get(topicId);

      if (topicRow && topicRow.aggregated_hash !== null && topicRow.aggregated_hash === localState.topicHash) {
        results[topicId] = { toPull: [], toPush: false };
        fastPathCount++;
        // fast-path 的 topic 不输出单条日志，避免日志噪音
        continue;
      }

      // 2. 详细比较：读取桌面端 message_index
      const remoteRows = db
        .prepare("SELECT msg_id, hash FROM message_index WHERE topic_id = ?")
        .all(topicId);

      const remoteMap = new Map(remoteRows.map((r) => [r.msg_id, r.hash]));
      const localMap = localState.messages || {};

      const toPull = [];
      let toPush = false;

      for (const [msgId, remoteHash] of remoteMap) {
        const localHash = localMap[msgId];
        if (!localHash) {
          toPull.push(msgId);
        } else if (localHash !== remoteHash) {
          toPull.push(msgId);
        }
      }

      // 本地有而远程没有的 → push
      for (const msgId of Object.keys(localMap)) {
        if (!remoteMap.has(msgId)) {
          toPush = true;
          break;
        }
      }

      results[topicId] = { toPull, toPush };
      detailedCount++;
      logger.logOperation("messages", "diff", topicId, "success", `toPull=${toPull.length} toPush=${toPush}`);
    } catch (e) {
      logger.logOperation("messages", "diff", topicId, "error", e.message);
      results[topicId] = { toPull: [], toPush: false, error: e.message };
    }
  }

  logger.logOperation("messages", "diff_batch", "summary", "success", `topics=${topicIds.length} fast_path=${fastPathCount} detailed=${detailedCount}`);

  return {
    type: "SYNC_DIFF_RESULTS_BATCH",
    results,
  };
}

module.exports = {
  handleSyncTopicHashBatch,
  handleSyncTopicHashBatchV2,
  handleSyncMessageDiffBatch,
};
