/**
 * @file AuthoringCommands.js
 * @description Handlers for SaveChapterDraft, ManageForeshadowing, and ManageTimeline commands
 * @module commands/AuthoringCommands
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AuthoringCommands {
  /**
   * Command: SaveChapterDraft
   * Safely writes chapter draft markdown strictly into 13_小说工程插件/篇章草稿/
   * and synchronizes SQLite chapters table with canon = 0, status = 'draft'.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleSaveChapterDraft(params, context) {
    const { dbManager, pathGuard, config = {} } = context;

    const projectId = params.projectId || 'default';
    const chapterId = params.chapterId || params.id || params.chapter_id;
    const title = params.title || params.chapterTitle;
    const content = params.content !== undefined ? params.content : (params.text !== undefined ? params.text : null);
    const summary = params.summary || null;

    if (!chapterId || (typeof chapterId === 'string' && !chapterId.trim())) {
      throw new Error('SaveChapterDraft requires a valid "chapterId" parameter.');
    }
    if (!title || (typeof title === 'string' && !title.trim())) {
      throw new Error('SaveChapterDraft requires a valid "title" parameter.');
    }
    if (content === null || content === undefined) {
      throw new Error('SaveChapterDraft requires a "content" parameter.');
    }

    const volumeNumber = params.volumeNumber !== undefined
      ? Number(params.volumeNumber)
      : (params.volume_number !== undefined ? Number(params.volume_number) : 1);

    let chapterNumber = 1;
    if (params.chapterNumber !== undefined && params.chapterNumber !== null) {
      chapterNumber = Number(params.chapterNumber);
    } else if (params.chapter_number !== undefined && params.chapter_number !== null) {
      chapterNumber = Number(params.chapter_number);
    } else {
      // Try to parse number from chapterId or title
      const numMatch = String(chapterId).match(/\d+(\.\d+)?/) || String(title).match(/\d+(\.\d+)?/);
      if (numMatch) {
        chapterNumber = parseFloat(numMatch[0]);
      }
    }

    const povEntityId = params.povEntityId || params.pov_entity_id || null;
    const customFilename = params.customFilename || params.filename || null;
    const customPath = params.customPath || null;

    // Determine vault root and project root
    const vaultRoot = params.vaultRoot || params.vaultPath || pathGuard.vaultRoot || config.VAULT_ROOT || config.DEFAULT_WORLDTREE_PATH || 'J:\\obsidian库\\obsidian-workflow-vault-main\\流浪\\世界树';
    const projectRoot = params.projectRoot || config.PROJECT_ROOT || (vaultRoot ? path.dirname(vaultRoot) : 'J:\\obsidian库\\obsidian-workflow-vault-main\\流浪');
    const targetZone = String(params.targetZone || params.zone || params.target_zone || 'draft').toLowerCase();

    // Validate customFilename syntax early if provided
    if (customFilename) {
      pathGuard.validatePathSyntax(customFilename);
    }

    // Determine target filename
    let draftFilename = '';
    if (customFilename) {
      draftFilename = customFilename.endsWith('.md') ? customFilename : `${customFilename}.md`;
    } else {
      const padNum = String(chapterNumber).padStart(3, '0');
      const sanitizedTitle = String(title).replace(/[/\\:*?"<>|]/g, '_').trim();
      const sanitizedId = String(chapterId).replace(/[/\\:*?"<>|]/g, '_').trim();
      draftFilename = `CH_${padNum}_${sanitizedTitle || sanitizedId}.md`;
    }

    // Determine target path based on targetZone
    let targetDraftPath = '';
    if (customPath) {
      targetDraftPath = customPath;
    } else if (targetZone === 'manuscript' || targetZone === '正文' || targetZone === '正文卷') {
      const volumeFolder = params.volumeFolder || `第一卷_初啼`;
      targetDraftPath = path.join(projectRoot, '正文卷', volumeFolder, draftFilename);
    } else if (targetZone === 'plotline' || targetZone === '剧情' || targetZone === '剧情线') {
      const subDir = params.subDir || '主线大纲';
      targetDraftPath = path.join(projectRoot, '剧情线', subDir, draftFilename);
    } else {
      targetDraftPath = path.join(vaultRoot, '13_小说工程插件', '篇章草稿', draftFilename);
    }

    // Strict Sandbox Authorization & Zero-Mutation Hard Veto
    const draftFilePath = pathGuard.assertDraftWritablePath(targetDraftPath, vaultRoot);

    // Calculate word count (Chinese characters + English words)
    const chineseMatches = String(content).match(/[\u4e00-\u9fa5]/g) || [];
    const nonChinese = String(content).replace(/[\u4e00-\u9fa5]/g, ' ');
    const englishWords = nonChinese.match(/[a-zA-Z0-9_-]+/g) || [];
    let wordCount = chineseMatches.length + englishWords.length;
    if (wordCount === 0 && String(content).trim().length > 0) {
      wordCount = String(content).trim().length;
    }

    const now = new Date().toISOString();

    // Format Draft Markdown with Frontmatter
    let finalContent = '';
    if (String(content).startsWith('---')) {
      finalContent = String(content);
    } else {
      const frontmatterHeader = [
        '---',
        `chapter_id: ${JSON.stringify(String(chapterId))}`,
        `chapter_number: ${chapterNumber}`,
        `volume_number: ${volumeNumber}`,
        `title: ${JSON.stringify(String(title))}`,
        'status: "draft"',
        'canon: 0',
        `word_count: ${wordCount}`,
        `created_at: "${now}"`,
        `updated_at: "${now}"`,
        `summary: ${JSON.stringify(summary || '')}`,
        '---',
        '',
        content
      ].join('\n');
      finalContent = frontmatterHeader;
    }

    // Check pre-existing file state for atomic rollback recovery
    const fileExistedBefore = fs.existsSync(draftFilePath);
    let previousBackupContent = null;
    if (fileExistedBefore) {
      try {
        previousBackupContent = fs.readFileSync(draftFilePath);
      } catch (err) {
        console.warn(`[AuthoringCommands] Warning: Failed to read existing draft file for backup: ${err.message}`);
      }
    }

    // Two-Phase Atomic Write: Phase 1 (Write to Disk)
    fs.writeFileSync(draftFilePath, finalContent, 'utf8');

    // Calculate relative path from vault root
    const canonicalVault = pathGuard._getCanonicalPath(path.resolve(vaultRoot));
    const relativePath = path.relative(canonicalVault, draftFilePath).replace(/\\/g, '/');

    // Two-Phase Atomic Write: Phase 2 (ACID Database Sync & Rollback Protection)
    let sourceFile = null;
    let chapterRecord = null;

    try {
      // Optional hook for fault injection testing
      if (params._simulateDbFailure === true || params.simulateFailure === true) {
        throw new Error('SIMULATED_DB_WRITE_FAILURE: SQLite transaction failed unexpectedly during SaveChapterDraft.');
      }

      const syncTx = dbManager.transaction(() => {
        // Sync SQLite source_files (status = 'draft', review_status = 'draft')
        sourceFile = dbManager.sourceFiles.upsert({
          file_path: draftFilePath,
          relative_path: relativePath,
          file_name: path.basename(draftFilePath),
          extension: '.md',
          size_bytes: Buffer.byteLength(finalContent, 'utf8'),
          mtime_ms: Date.now(),
          sha256_hash: crypto.createHash('sha256').update(finalContent).digest('hex'),
          source_category: 'draft',
          status: 'draft',
          review_status: 'draft',
          has_frontmatter: 1,
          frontmatter_json: {
            chapter_id: chapterId,
            chapter_number: chapterNumber,
            volume_number: volumeNumber,
            title,
            status: 'draft',
            canon: 0,
            word_count: wordCount,
            summary: summary || ''
          },
          word_count: wordCount
        });

        // Sync SQLite chapters (status = 'draft', canon = 0)
        chapterRecord = dbManager.chapters.upsert({
          chapter_number: chapterNumber,
          volume_number: volumeNumber,
          title: title,
          relative_path: relativePath,
          source_file_id: sourceFile ? sourceFile.id : null,
          word_count: wordCount,
          status: 'draft',
          canon: 0,
          pov_entity_id: povEntityId ? Number(povEntityId) : null,
          summary: summary || null
        });
      });

      syncTx();
    } catch (syncError) {
      // Atomic Rollback: Clean up on-disk file if SQLite transaction fails
      try {
        if (fileExistedBefore && previousBackupContent !== null) {
          fs.writeFileSync(draftFilePath, previousBackupContent);
        } else if (fs.existsSync(draftFilePath)) {
          fs.unlinkSync(draftFilePath);
        }
      } catch (rollbackErr) {
        console.error(`[AuthoringCommands] CRITICAL: Failed to rollback draft file on disk (${draftFilePath}) after transaction abort: ${rollbackErr.message}`);
      }

      throw syncError;
    }

    return {
      status: 'draft',
      canon: 0,
      content: [
        {
          type: 'text',
          text: `Chapter draft saved successfully: \`${relativePath}\` (${wordCount} words, status: draft, canon: 0).`
        }
      ],
      details: {
        command: 'SaveChapterDraft',
        status: 'draft',
        canon: 0,
        chapterId: String(chapterId),
        title,
        volumeNumber,
        chapterNumber,
        wordCount,
        draftFilePath,
        absolutePath: draftFilePath,
        relativePath,
        databaseChapterId: chapterRecord ? chapterRecord.id : null,
        sourceFileId: sourceFile ? sourceFile.id : null,
        writtenAt: now,
        savedAt: now
      }
    };
  }

  /**
   * Command: ManageForeshadowing
   * Manages narrative clues, setups, and payoffs in the foreshadowing table.
   * Actions: add, resolve, list
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleManageForeshadowing(params, context) {
    const { dbManager } = context;

    if (!params.action || typeof params.action !== 'string' || !params.action.trim()) {
      throw new Error('ManageForeshadowing requires an "action" parameter (action is required).');
    }

    const action = String(params.action).trim().toLowerCase();

    if (!['add', 'resolve', 'list'].includes(action)) {
      throw new Error(`Unsupported or unknown invalid action: "${params.action}". Supported actions: add, resolve, list.`);
    }

    if (action === 'add') {
      const threadKey = params.thread_key || params.foreshadow_id || params.foreshadowId;
      const description = params.description;
      const title = params.title || threadKey;

      if (!threadKey || (typeof threadKey === 'string' && !threadKey.trim())) {
        throw new Error('ManageForeshadowing "add" requires a valid "thread_key" (foreshadow_id) parameter.');
      }
      if (!description || (typeof description === 'string' && !description.trim())) {
        throw new Error('ManageForeshadowing "add" requires a valid "description" parameter.');
      }

      const item = dbManager.foreshadowing.upsert({
        foreshadow_id: threadKey,
        title: title || threadKey,
        description: description,
        importance_level: params.importance_level || params.importance || 'major',
        tags_json: params.tags || params.tags_json || null,
        introduced_chapter: params.introduced_chapter !== undefined ? params.introduced_chapter : params.setup_chapter,
        setup_chapter_id: params.setup_chapter_id || null,
        target_resolve_chapter: params.target_resolve_chapter !== undefined ? params.target_resolve_chapter : (params.planned_resolve_chapter !== undefined ? params.planned_resolve_chapter : params.target_chapter),
        actual_resolve_chapter: params.actual_resolve_chapter !== undefined ? params.actual_resolve_chapter : params.resolution_chapter,
        related_entities_json: params.related_entities || params.related_entities_json || params.involved_entities || params.entities || null,
        setup_file_id: params.setup_file_id || null,
        setup_snippet: params.setup_snippet || null,
        setup_line: params.setup_line || 1,
        resolution_notes: params.resolution_notes || null,
        status: 'open'
      });

      return {
        status: 'success',
        content: [
          {
            type: 'text',
            text: `Added foreshadowing clue: [${item.foreshadow_id}] "${item.title}" (status: open).`
          }
        ],
        details: {
          command: 'ManageForeshadowing',
          action: 'add',
          status: 'success',
          actionStatus: 'success',
          foreshadowing: item,
          item
        }
      };
    }

    if (action === 'resolve') {
      const threadKey = params.thread_key || params.foreshadow_id || params.foreshadowId || params.id;
      if (!threadKey) {
        throw new Error('ManageForeshadowing "resolve" requires thread_key (foreshadow_id) or id parameter.');
      }

      let existing = null;
      if (typeof threadKey === 'number' || /^\d+$/.test(String(threadKey))) {
        existing = dbManager.foreshadowing.getById(Number(threadKey));
      }
      if (!existing) {
        existing = dbManager.foreshadowing.getByForeshadowId(String(threadKey));
      }

      if (!existing) {
        throw new Error(`Foreshadowing clue not found: "${threadKey}"`);
      }

      const updated = dbManager.foreshadowing.resolve(existing.id, {
        target_status: params.target_status || params.status || 'closed',
        actual_resolve_chapter: params.actual_resolve_chapter !== undefined ? params.actual_resolve_chapter : (params.resolution_chapter !== undefined ? params.resolution_chapter : params.resolution_chapter_id),
        resolution_notes: params.resolution_notes || params.resolution_snippet || null,
        resolution_file_id: params.resolution_file_id !== undefined ? Number(params.resolution_file_id) : existing.resolution_file_id,
        resolution_chapter_id: params.resolution_chapter_id !== undefined ? Number(params.resolution_chapter_id) : (params.actual_resolve_chapter !== undefined && !isNaN(Number(params.actual_resolve_chapter)) ? Number(params.actual_resolve_chapter) : existing.resolution_chapter_id),
        resolution_snippet: params.resolution_snippet !== undefined ? params.resolution_snippet : (params.resolution_notes || existing.resolution_snippet),
        resolution_line: params.resolution_line !== undefined ? Number(params.resolution_line) : existing.resolution_line
      });

      return {
        status: 'success',
        content: [
          {
            type: 'text',
            text: `Resolved foreshadowing clue: [${updated.foreshadow_id}] "${updated.title}" (status: closed).`
          }
        ],
        details: {
          command: 'ManageForeshadowing',
          action: 'resolve',
          status: 'success',
          actionStatus: 'success',
          foreshadowing: updated,
          item: updated
        }
      };
    }

    if (action === 'list') {
      const filter = {};
      if (params.status && params.status !== 'all' && params.status !== 'ALL') {
        filter.status = params.status;
      }
      if (params.importance_level) {
        filter.importance_level = params.importance_level;
      }
      if (params.query || params.search || params.keyword) {
        filter.query = params.query || params.search || params.keyword;
      }
      if (params.introduced_chapter !== undefined && params.introduced_chapter !== null) {
        filter.introduced_chapter = params.introduced_chapter;
      }
      if (params.target_resolve_chapter !== undefined && params.target_resolve_chapter !== null) {
        filter.target_resolve_chapter = params.target_resolve_chapter;
      }
      if (params.actual_resolve_chapter !== undefined && params.actual_resolve_chapter !== null) {
        filter.actual_resolve_chapter = params.actual_resolve_chapter;
      }
      if (params.active_at_chapter !== undefined && params.active_at_chapter !== null) {
        filter.active_at_chapter = params.active_at_chapter;
      }
      if (params.related_entity || params.related_entities || params.entity) {
        filter.related_entity = params.related_entity || params.related_entities || params.entity;
      }
      if (params.limit !== undefined && params.limit !== null) {
        filter.limit = Number(params.limit);
      }
      if (params.offset !== undefined && params.offset !== null) {
        filter.offset = Number(params.offset);
      }

      const items = dbManager.foreshadowing.query(filter);

      return {
        status: 'success',
        content: [
          {
            type: 'text',
            text: `Found ${items.length} foreshadowing clues.`
          }
        ],
        details: {
          command: 'ManageForeshadowing',
          action: 'list',
          status: 'success',
          actionStatus: 'success',
          items,
          foreshadowing: items,
          list: items,
          totalCount: items.length
        }
      };
    }
  }

  /**
   * Command: ManageTimeline
   * Manages in-universe chronological events in the timeline_events table.
   * Actions: add, query
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleManageTimeline(params, context) {
    const { dbManager } = context;

    if (!params.action || typeof params.action !== 'string' || !params.action.trim()) {
      throw new Error('ManageTimeline requires an "action" parameter (action is required).');
    }

    const action = String(params.action).trim().toLowerCase();

    if (!['add', 'query'].includes(action)) {
      throw new Error(`Unsupported or unknown invalid action: "${params.action}". Supported actions: add, query.`);
    }

    if (action === 'add') {
      const eventName = params.event_name || params.title;
      if (!eventName || (typeof eventName === 'string' && !eventName.trim())) {
        throw new Error('ManageTimeline "add" requires a valid "event_name" (title) parameter.');
      }

      const timeType = params.time_type || (typeof params.time_point === 'object' && params.time_point !== null ? params.time_point.type : 'exact');

      let timePoint = params.time_point !== undefined
        ? params.time_point
        : (params.timestamp_order !== undefined ? params.timestamp_order : null);

      if (timePoint === null || timePoint === undefined) {
        if (timeType === 'interval' && (params.interval_start !== undefined || params.interval_end !== undefined)) {
          timePoint = { type: 'interval', start: params.interval_start, end: params.interval_end };
        } else if (timeType === 'relative' && (params.base_event !== undefined || params.base_event_id !== undefined || params.relative_anchor_event_id !== undefined)) {
          timePoint = {
            type: 'relative',
            base_event: params.base_event || params.base_event_id || params.relative_anchor_event_id,
            offset: params.relative_offset !== undefined ? params.relative_offset : params.offset
          };
        } else if (timeType === 'fuzzy' && (params.fuzzy_time_desc || params.fuzzy_precision || params.relative_time_desc)) {
          timePoint = {
            type: 'fuzzy',
            description: params.fuzzy_time_desc || params.relative_time_desc || params.fuzzy_precision
          };
        } else {
          throw new Error('ManageTimeline "add" requires a valid "time_point" (timestamp_order) parameter.');
        }
      }

      const eventId = params.event_id || params.eventId || `EV-${Date.now().toString(36)}`;

      const event = dbManager.timeline.insert({
        event_id: eventId,
        title: eventName,
        era_epoch: params.era_epoch || 'CE',
        time_point: timePoint,
        time_type: timeType,
        interval_start: params.interval_start,
        interval_end: params.interval_end,
        base_event_id: params.base_event_id || params.base_event || params.relative_anchor_event_id,
        relative_offset: params.relative_offset !== undefined ? params.relative_offset : params.offset,
        fuzzy_time_desc: params.fuzzy_time_desc || params.fuzzy_precision,
        relative_time_desc: params.relative_time_desc || null,
        description: params.description || null,
        involved_entities: params.involved_entities || params.participants || null,
        source_file_id: params.source_file_id || null,
        primary_entity_id: params.primary_entity_id || null,
        status: params.status || 'active'
      });

      return {
        status: 'success',
        content: [
          {
            type: 'text',
            text: `Added timeline event: [${event.event_id}] "${event.title}" at ${event.timestamp_order}.`
          }
        ],
        details: {
          command: 'ManageTimeline',
          action: 'add',
          status: 'success',
          actionStatus: 'success',
          event,
          item: event
        }
      };
    }

    if (action === 'query') {
      const filter = {};
      if (params.query || params.keyword || params.search) {
        filter.query = params.query || params.keyword || params.search;
      }
      if (params.involved_entities || params.entity) {
        filter.involved_entities = params.involved_entities || params.entity;
      }
      if (params.era_epoch) {
        filter.era_epoch = params.era_epoch;
      }
      if (params.time_type) {
        filter.time_type = params.time_type;
      }
      if (params.base_event_id || params.relative_anchor_event_id) {
        filter.base_event_id = params.base_event_id || params.relative_anchor_event_id;
      }
      if (params.min_order !== undefined) {
        filter.min_order = Number(params.min_order);
      }
      if (params.max_order !== undefined) {
        filter.max_order = Number(params.max_order);
      }
      if (params.interval_overlap_start !== undefined) {
        filter.interval_overlap_start = Number(params.interval_overlap_start);
      }
      if (params.interval_overlap_end !== undefined) {
        filter.interval_overlap_end = Number(params.interval_overlap_end);
      }
      if (params.limit !== undefined && params.limit !== null) {
        filter.limit = Number(params.limit);
      }
      if (params.offset !== undefined && params.offset !== null) {
        filter.offset = Number(params.offset);
      }

      const events = dbManager.timeline.query(filter);

      return {
        status: 'success',
        content: [
          {
            type: 'text',
            text: `Found ${events.length} timeline events.`
          }
        ],
        details: {
          command: 'ManageTimeline',
          action: 'query',
          status: 'success',
          actionStatus: 'success',
          events,
          items: events,
          timeline: events,
          totalCount: events.length
        }
      };
    }
  }
}

module.exports = AuthoringCommands;
