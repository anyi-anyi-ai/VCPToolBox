/**
 * @file QueryCommands.js
 * @description Handlers for GetSourceFile and QueryEntities commands
 * @module commands/QueryCommands
 * @license MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class QueryCommands {
  /**
   * Helper to generate a deterministic SHA-256 hash tracking stamp
   * @param {string|object|null} content
   * @param {string|null} existingHash
   * @returns {string} 64-character lowercase hexadecimal hash
   * @private
   */
  static _computeHashStamp(content, existingHash) {
    if (existingHash && typeof existingHash === 'string' && existingHash.length === 64) {
      return existingHash;
    }
    const text = typeof content === 'string' ? content : (content ? JSON.stringify(content) : '');
    return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  }
  /**
   * Command 7: GetSourceFile
   * Retrieves comprehensive indexed metadata, frontmatter, entities, and anomalies for a single file.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetSourceFile(params, context) {
    const { dbManager, pathGuard } = context;
    const filePath = params.relativePath || params.filePath;
    const fileId = params.id || params.fileId;

    if (!filePath && !fileId) {
      throw new Error('GetSourceFile requires either "relativePath"/"filePath" or "id"/"fileId" parameter.');
    }

    let fileRecord = null;
    if (fileId) {
      fileRecord = dbManager.sourceFiles.getById(fileId);
    } else if (filePath) {
      // Normalize relative path if absolute was passed
      let relPath = filePath.replace(/\\/g, '/');
      if (pathGuard.vaultRoot && relPath.toLowerCase().startsWith(pathGuard.vaultRoot.replace(/\\/g, '/').toLowerCase())) {
        relPath = relPath.slice(pathGuard.vaultRoot.length).replace(/^[\\/]/, '');
      }
      fileRecord = dbManager.sourceFiles.getByRelativePath(relPath) || dbManager.sourceFiles.getByPath(filePath);
    }

    if (!fileRecord) {
      return {
        content: [
          {
            type: 'text',
            text: `File not found in index: ${filePath || fileId}`
          }
        ],
        details: {
          command: 'GetSourceFile',
          file: null
        }
      };
    }

    // Parse frontmatter
    let frontmatter = {};
    if (fileRecord.frontmatter_json) {
      try {
        frontmatter = JSON.parse(fileRecord.frontmatter_json);
      } catch {}
    }

    // Get extracted entities
    const entities = dbManager.entities.query({ source_file_id: fileRecord.id });

    // Get active anomalies affecting this file
    const anomalies = dbManager.anomalies.query({ query: fileRecord.relative_path });

    // Include raw content if requested
    let rawContent = null;
    if (params.includeRawContent && fileRecord.file_path) {
      try {
        const readPath = pathGuard.assertReadOnlyPath(fileRecord.file_path, 'r');
        rawContent = fs.readFileSync(readPath, 'utf8');
      } catch {
        rawContent = fileRecord.frontmatter_raw || null;
      }
    }

    const filePayload = {
      id: fileRecord.id,
      relativePath: fileRecord.relative_path,
      fileName: fileRecord.file_name,
      sizeBytes: fileRecord.size_bytes,
      mtimeMs: fileRecord.mtime_ms,
      sha256: fileRecord.sha256_hash,
      category: fileRecord.source_category,
      status: fileRecord.status,
      reviewStatus: fileRecord.review_status,
      hasFrontmatter: Boolean(fileRecord.has_frontmatter),
      frontmatter,
      entities: entities.map(e => ({
        id: e.id,
        entityId: e.entity_id,
        canonicalName: e.canonical_name,
        type: e.entity_type,
        category: e.category,
        status: e.status,
        reviewStatus: e.review_status,
        summary: e.summary,
        aliases: e.aliases ? e.aliases.map(a => a.alias_name) : []
      })),
      anomalies: anomalies.map(a => ({
        id: a.id,
        ruleId: a.anomaly_rule_id,
        severity: a.severity,
        title: a.title,
        message: a.message
      }))
    };

    if (rawContent !== null) {
      filePayload.rawContent = rawContent;
    }

    return {
      content: [
        {
          type: 'text',
          text: `Retrieved metadata for \`${fileRecord.relative_path}\`.`
        }
      ],
      details: {
        command: 'GetSourceFile',
        file: filePayload
      }
    };
  }

  /**
   * Command 8: QueryEntities
   * Multi-criteria search and retrieval on canon entities catalog.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleQueryEntities(params, context) {
    const { dbManager } = context;
    const query = params.query || params.keyword || params.search || '';
    const entityType = params.entityType || params.type;
    const reviewStatus = params.reviewStatus;
    const status = params.status;
    const planet = params.planet;
    const includeAliases = params.includeAliases !== false;
    const limit = Number.isInteger(params.limit) ? params.limit : (params.limit ? parseInt(params.limit, 10) : 20);
    const offset = Number.isInteger(params.offset) ? params.offset : (params.offset ? parseInt(params.offset, 10) : 0);

    const filter = {
      limit,
      offset,
      includeAliases,
      orderBy: 'id',
      orderDirection: 'ASC'
    };

    if (query) filter.query = query;
    if (entityType && entityType !== 'ALL') filter.entity_type = entityType;
    if (reviewStatus && reviewStatus !== 'ALL') filter.review_status = reviewStatus;
    if (status && status !== 'ALL') filter.status = status;

    let results = dbManager.entities.query(filter);
    const totalMatches = dbManager.entities.count(filter);

    // Planet filter fallback if specified
    if (planet && planet !== 'ALL') {
      results = results.filter(e => {
        let attrs = {};
        try {
          if (e.attributes_json) attrs = JSON.parse(e.attributes_json);
        } catch {}
        return (
          e.entity_type === 'planet' ||
          attrs.planet === planet ||
          attrs.parent_planet === planet ||
          (e.summary && e.summary.includes(planet))
        );
      });
    }

    const entities = results.map(e => {
      let aliases = [];
      if (e.aliases && Array.isArray(e.aliases)) {
        aliases = e.aliases.map(a => a.alias_name || a);
      }

      return {
        id: e.id,
        entityId: e.entity_id,
        canonicalName: e.canonical_name,
        entityType: e.entity_type,
        category: e.category,
        status: e.status,
        reviewStatus: e.review_status,
        summary: e.summary,
        aliases,
        sourceFile: e.source_file_relative_path || null
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${entities.length} matching entities (${totalMatches} total matching criteria).`
        }
      ],
      details: {
        command: 'QueryEntities',
        totalCount: totalMatches,
        limit,
        offset,
        entities
      }
    };
  }

  /**
   * Command: GetChapterContext
   * Multi-stage contextual aggregator for LLM chapter generation.
   * Resolves target chapter metadata, recalls active focus entities via exact and alias matching,
   * loads foundational world rules, active open foreshadowing, and chronological timeline events,
   * reads on-disk markdown text safely without mutating source files, and packages structured JSON.
   * @param {object} params
   * @param {string} [params.projectId] - Optional project identifier
   * @param {string|number} [params.chapterId] - Chapter identifier or number
   * @param {string|number} [params.chapterNumber] - Explicit chapter number
   * @param {number} [params.volumeNumber] - Optional volume number
   * @param {Array<string>|string} [params.focusEntities] - Entities or aliases to recall
   * @param {boolean} [params.includeWorldRules=true] - Whether to include foundational world rules
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetChapterContext(params = {}, context = {}) {
    const { dbManager, pathGuard } = context;
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required in context for GetChapterContext.');
    }

    const projectId = params.projectId || 'wandering_novel';
    const rawChapterId = params.chapterId !== undefined && params.chapterId !== null
      ? params.chapterId
      : params.chapterNumber;
    const volumeNumber = params.volumeNumber !== undefined && params.volumeNumber !== null
      ? Number(params.volumeNumber)
      : null;
    const includeWorldRules = params.includeWorldRules !== false && params.includeWorldRules !== 'false';

    // ------------------------------------------------------------------------
    // 1. Resolve Target Chapter Metadata
    // ------------------------------------------------------------------------
    let chapterRecord = null;
    if (rawChapterId !== undefined && rawChapterId !== null && String(rawChapterId).trim() !== '') {
      const chStr = String(rawChapterId).trim();
      const chNum = parseInt(chStr, 10);

      // Strategy A: Match by volume_number AND chapter_number
      if (!isNaN(chNum) && volumeNumber) {
        chapterRecord = dbManager.chapters.getByVolumeAndChapter(volumeNumber, chNum);
      }

      // Strategy B: Match by numeric chapter_number across all volumes
      if (!chapterRecord && !isNaN(chNum)) {
        const chList = dbManager.db.prepare(`
          SELECT c.*, e.canonical_name AS pov_entity_name, sf.file_name AS source_file_name, sf.relative_path AS source_relative_path
          FROM chapters c
          LEFT JOIN entities e ON c.pov_entity_id = e.id
          LEFT JOIN source_files sf ON c.source_file_id = sf.id
          WHERE c.chapter_number = ?
          ORDER BY c.volume_number ASC, c.id ASC
        `).all(chNum);
        if (chList.length > 0) {
          chapterRecord = chList[0];
        }
      }

      // Strategy C: Match by database primary key ID
      if (!chapterRecord && !isNaN(chNum)) {
        chapterRecord = dbManager.chapters.getById(chNum);
      }

      // Strategy D: Match by relative path, title, or substring in chapters table
      if (!chapterRecord) {
        const rows = dbManager.db.prepare(`
          SELECT c.*, e.canonical_name AS pov_entity_name, sf.file_name AS source_file_name, sf.relative_path AS source_relative_path
          FROM chapters c
          LEFT JOIN entities e ON c.pov_entity_id = e.id
          LEFT JOIN source_files sf ON c.source_file_id = sf.id
          WHERE c.relative_path LIKE ? OR c.title LIKE ?
          ORDER BY c.id ASC
        `).all(`%${chStr}%`, `%${chStr}%`);
        if (rows.length > 0) {
          chapterRecord = rows[0];
        }
      }

      // Strategy E: Fallback search in source_files for draft chapters or unindexed chapters
      if (!chapterRecord) {
        const sfRows = dbManager.db.prepare(`
          SELECT * FROM source_files
          WHERE (source_category IN ('chapter_text', 'draft') OR relative_path LIKE '%Chapter%' OR relative_path LIKE '%篇章草稿%')
            AND (relative_path LIKE ? OR file_name LIKE ? OR frontmatter_json LIKE ?)
          ORDER BY id DESC LIMIT 1
        `).all(`%${chStr}%`, `%${chStr}%`, `%"chapter_id":"${chStr}"%`);
        if (sfRows.length > 0) {
          const sf = sfRows[0];
          let fm = {};
          try { fm = JSON.parse(sf.frontmatter_json || '{}'); } catch {}
          chapterRecord = {
            id: sf.id,
            chapter_number: fm.chapter_number || (isNaN(chNum) ? 1 : chNum),
            volume_number: fm.volume_number || (volumeNumber || 1),
            title: fm.title || sf.file_name.replace(/\.md$/i, ''),
            relative_path: sf.relative_path,
            source_file_id: sf.id,
            word_count: sf.word_count || 0,
            status: sf.status || 'draft',
            canon: sf.source_category === 'draft' ? 0 : 1,
            summary: fm.summary || null
          };
        }
      }
    }

    const chapterObj = chapterRecord ? {
      id: chapterRecord.id,
      chapterId: String(chapterRecord.chapter_number || chapterRecord.id),
      chapter_id: String(chapterRecord.chapter_number || chapterRecord.id),
      chapterNumber: Number(chapterRecord.chapter_number) || 1,
      chapter_number: Number(chapterRecord.chapter_number) || 1,
      volumeNumber: Number(chapterRecord.volume_number) || 1,
      volume_number: Number(chapterRecord.volume_number) || 1,
      title: chapterRecord.title || `Chapter ${chapterRecord.chapter_number || 1}`,
      relativePath: chapterRecord.relative_path || chapterRecord.source_relative_path || null,
      relative_path: chapterRecord.relative_path || chapterRecord.source_relative_path || null,
      wordCount: Number(chapterRecord.word_count) || 0,
      word_count: Number(chapterRecord.word_count) || 0,
      status: chapterRecord.status || 'draft',
      canon: chapterRecord.canon !== undefined ? Number(chapterRecord.canon) : (chapterRecord.status === 'draft' ? 0 : 1),
      timelineStart: chapterRecord.timeline_start !== null ? Number(chapterRecord.timeline_start) : null,
      timeline_start: chapterRecord.timeline_start !== null ? Number(chapterRecord.timeline_start) : null,
      timelineEnd: chapterRecord.timeline_end !== null ? Number(chapterRecord.timeline_end) : null,
      timeline_end: chapterRecord.timeline_end !== null ? Number(chapterRecord.timeline_end) : null,
      povEntityId: chapterRecord.pov_entity_id || null,
      pov_entity_id: chapterRecord.pov_entity_id || null,
      pov: chapterRecord.pov_entity_name || null,
      povEntityName: chapterRecord.pov_entity_name || null,
      summary: chapterRecord.summary || null
    } : null;

    // ------------------------------------------------------------------------
    // 2. Parse and Search Focus Entities (Multi-stage fuzzy & alias recall)
    // ------------------------------------------------------------------------
    let focusTerms = [];
    if (typeof params.focusEntities === 'string') {
      focusTerms = params.focusEntities
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(params.focusEntities)) {
      focusTerms = params.focusEntities
        .map(t => String(t).trim())
        .filter(Boolean);
    }

    const recalledEntities = [];
    const canonSources = [];
    const candidateSources = [];
    const conflicts = [];
    const seenEntityDbIds = new Set();

    for (const term of focusTerms) {
      if (!term) continue;

      const querySql = `
        SELECT e.*,
               sf.relative_path AS source_file_relative_path,
               sf.file_path AS source_file_path,
               sf.file_name AS source_file_name,
               sf.sha256_hash AS source_sha256,
               CASE
                 WHEN LOWER(TRIM(e.canonical_name)) = LOWER(TRIM(@term)) THEN 100
                 WHEN LOWER(TRIM(e.entity_id)) = LOWER(TRIM(@term)) THEN 95
                 WHEN EXISTS (
                   SELECT 1 FROM entity_aliases ea
                   WHERE ea.entity_id = e.id AND LOWER(TRIM(ea.alias_name)) = LOWER(TRIM(@term))
                 ) THEN 90
                 WHEN LOWER(e.canonical_name) LIKE LOWER(@termWild) THEN 70
                 WHEN LOWER(e.entity_id) LIKE LOWER(@termWild) THEN 65
                 WHEN EXISTS (
                   SELECT 1 FROM entity_aliases ea
                   WHERE ea.entity_id = e.id AND LOWER(ea.alias_name) LIKE LOWER(@termWild)
                 ) THEN 60
                 ELSE 40
               END AS match_score
        FROM entities e
        LEFT JOIN source_files sf ON e.source_file_id = sf.id
        WHERE (
          LOWER(TRIM(e.canonical_name)) = LOWER(TRIM(@term))
          OR LOWER(TRIM(e.entity_id)) = LOWER(TRIM(@term))
          OR LOWER(e.canonical_name) LIKE LOWER(@termWild)
          OR LOWER(e.entity_id) LIKE LOWER(@termWild)
          OR EXISTS (
            SELECT 1 FROM entity_aliases ea
            WHERE ea.entity_id = e.id AND (
              LOWER(TRIM(ea.alias_name)) = LOWER(TRIM(@term))
              OR LOWER(ea.alias_name) LIKE LOWER(@termWild)
            )
          )
        )
        AND e.status NOT IN ('deprecated', 'archived', 'deleted', 'obsolete')
        AND (e.review_status IS NULL OR e.review_status NOT IN ('deprecated', 'rejected'))
        ORDER BY
          match_score DESC,
          CASE WHEN e.review_status IN ('confirmed', 'human_confirmed') THEN 1 ELSE 2 END ASC,
          CASE WHEN e.status IN ('canonical', 'active', 'finalized') THEN 1 ELSE 2 END ASC,
          e.id ASC
      `;

      const matches = dbManager.db.prepare(querySql).all({
        term,
        termWild: `%${term}%`
      });

      for (const entityRow of matches) {
        if (!seenEntityDbIds.has(entityRow.id)) {
          seenEntityDbIds.add(entityRow.id);

          const aliasRows = dbManager.entities.getAliasesForEntity(entityRow.id);
          const aliases = Array.isArray(aliasRows) ? aliasRows.map(a => a.alias_name || a) : [];

          // Read on-disk markdown body via PathGuard read-only assertion
          let rawContent = null;
          let sourceFilePath = entityRow.source_file_path;
          if (!sourceFilePath && entityRow.source_file_relative_path && pathGuard && pathGuard.vaultRoot) {
            sourceFilePath = path.resolve(pathGuard.vaultRoot, entityRow.source_file_relative_path);
          }

          if (sourceFilePath && fs.existsSync(sourceFilePath)) {
            try {
              const safePath = pathGuard ? pathGuard.assertReadOnlyPath(sourceFilePath, 'r') : sourceFilePath;
              rawContent = fs.readFileSync(safePath, 'utf8');
            } catch {
              rawContent = entityRow.description || entityRow.summary || null;
            }
          } else {
            rawContent = entityRow.description || entityRow.summary || null;
          }

          const relPath = entityRow.source_file_relative_path || (sourceFilePath && pathGuard && pathGuard.vaultRoot ? path.relative(pathGuard.vaultRoot, sourceFilePath).replace(/\\/g, '/') : `02_Entities/${entityRow.entity_id}.md`);
          const hashStamp = QueryCommands._computeHashStamp(rawContent || entityRow.description || entityRow.summary, entityRow.source_sha256);

          const entityObj = {
            id: entityRow.id,
            entityId: entityRow.entity_id,
            entity_id: entityRow.entity_id,
            canonicalName: entityRow.canonical_name,
            canonical_name: entityRow.canonical_name,
            entityType: entityRow.entity_type,
            entity_type: entityRow.entity_type,
            category: entityRow.category,
            status: entityRow.status,
            reviewStatus: entityRow.review_status,
            review_status: entityRow.review_status,
            sourceFilePath: relPath,
            source_file_path: relPath,
            hashTrackingStamp: hashStamp,
            hash_tracking_stamp: hashStamp,
            summary: entityRow.summary,
            description: entityRow.description,
            content: rawContent || entityRow.description || entityRow.summary || '',
            rawContent,
            aliases,
            sourceFile: relPath,
            source_file: relPath
          };

          recalledEntities.push(entityObj);

          // Route to canonSources vs candidateSources vs conflicts
          if (entityRow.status === 'conflict' || entityRow.review_status === 'conflicted') {
            conflicts.push({
              anomalyCode: 'ANOM_ENTITY_CONFLICT',
              anomaly_code: 'ANOM_ENTITY_CONFLICT',
              title: `实体设定冲突: ${entityRow.canonical_name}`,
              message: entityRow.summary || `实体 ${entityRow.canonical_name} 存在冲突版本`,
              description: entityRow.description || entityRow.summary || '',
              sourceFilePath: relPath,
              source_file_path: relPath,
              status: 'conflict',
              reviewStatus: 'conflicted',
              review_status: 'conflicted',
              hashTrackingStamp: hashStamp,
              hash_tracking_stamp: hashStamp,
              involvedEntities: [entityRow.canonical_name, entityRow.entity_id],
              involved_entities: [entityRow.canonical_name, entityRow.entity_id],
              content: rawContent || entityRow.description || entityRow.summary || ''
            });
          } else if (
            ['draft', 'generated', 'placeholder'].includes(entityRow.status) ||
            ['pending_review', 'ai_generated', 'unreviewed', 'draft'].includes(entityRow.review_status)
          ) {
            candidateSources.push(entityObj);
          } else {
            canonSources.push(entityObj);
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 3. World Rules Query (if includeWorldRules = true)
    // ------------------------------------------------------------------------
    const recalledWorldRules = [];
    const seenRuleKeys = new Set();

    if (includeWorldRules) {
      // 1. Entities in worldview / concept / law / rule categories
      const ruleEntitiesSql = `
        SELECT e.*,
               sf.relative_path AS source_file_relative_path,
               sf.file_path AS source_file_path,
               sf.file_name AS source_file_name,
               sf.sha256_hash AS source_sha256
        FROM entities e
        LEFT JOIN source_files sf ON e.source_file_id = sf.id
        WHERE (
          e.entity_type IN ('concept', 'worldview', 'law', 'physics', 'rule', 'lore', 'axiom')
          OR e.category IN ('worldview_setting', 'lore', 'worldview')
          OR (sf.source_category = 'worldview_setting')
          OR (sf.relative_path LIKE '01_Worldview%' OR sf.relative_path LIKE '00_Worldview%' OR sf.relative_path LIKE '01_世界观%')
        )
        AND e.status NOT IN ('deprecated', 'archived', 'deleted', 'obsolete')
        AND (e.review_status IS NULL OR e.review_status NOT IN ('deprecated', 'rejected'))
        ORDER BY
          CASE WHEN e.review_status IN ('confirmed', 'human_confirmed') THEN 1 ELSE 2 END ASC,
          e.id ASC
      `;

      const ruleEntities = dbManager.db.prepare(ruleEntitiesSql).all();
      for (const r of ruleEntities) {
        const key = `entity_${r.id}`;
        if (!seenRuleKeys.has(key)) {
          seenRuleKeys.add(key);

          let rawContent = null;
          let sourceFilePath = r.source_file_path;
          if (!sourceFilePath && r.source_file_relative_path && pathGuard && pathGuard.vaultRoot) {
            sourceFilePath = path.resolve(pathGuard.vaultRoot, r.source_file_relative_path);
          }

          if (sourceFilePath && fs.existsSync(sourceFilePath)) {
            try {
              const safePath = pathGuard ? pathGuard.assertReadOnlyPath(sourceFilePath, 'r') : sourceFilePath;
              rawContent = fs.readFileSync(safePath, 'utf8');
            } catch {
              rawContent = r.description || r.summary || null;
            }
          } else {
            rawContent = r.description || r.summary || null;
          }

          const relPath = r.source_file_relative_path || (sourceFilePath && pathGuard && pathGuard.vaultRoot ? path.relative(pathGuard.vaultRoot, sourceFilePath).replace(/\\/g, '/') : `01_Worldview/${r.entity_id || 'rule'}.md`);
          const hashStamp = QueryCommands._computeHashStamp(rawContent || r.description || r.summary, r.source_sha256);

          recalledWorldRules.push({
            id: r.id,
            entityId: r.entity_id || `RULE-${r.id}`,
            entity_id: r.entity_id || `RULE-${r.id}`,
            canonicalName: r.canonical_name,
            canonical_name: r.canonical_name,
            title: r.canonical_name,
            entityType: r.entity_type || 'lore',
            entity_type: r.entity_type || 'lore',
            category: r.category || 'worldview_setting',
            sourceFilePath: relPath,
            source_file_path: relPath,
            status: r.status || 'canonical',
            reviewStatus: r.review_status || 'confirmed',
            review_status: r.review_status || 'confirmed',
            hashTrackingStamp: hashStamp,
            hash_tracking_stamp: hashStamp,
            summary: r.summary,
            content: rawContent || r.description || r.summary || '',
            rawContent,
            relativePath: relPath,
            relative_path: relPath
          });
        }
      }

      // 2. Source files in Worldview folder without standalone entity records
      const ruleFilesSql = `
        SELECT sf.*
        FROM source_files sf
        WHERE (
          sf.source_category = 'worldview_setting'
          OR sf.relative_path LIKE '01_Worldview%'
          OR sf.relative_path LIKE '00_Worldview%'
          OR sf.relative_path LIKE '01_世界观%'
        )
        AND sf.status NOT IN ('deprecated', 'archived', 'deleted', 'obsolete')
        AND (sf.review_status IS NULL OR sf.review_status NOT IN ('deprecated', 'rejected'))
        ORDER BY sf.id ASC
      `;

      const ruleFiles = dbManager.db.prepare(ruleFilesSql).all();
      for (const sf of ruleFiles) {
        const key = `file_${sf.id}`;
        if (!seenRuleKeys.has(key)) {
          seenRuleKeys.add(key);

          let rawContent = null;
          let sourceFilePath = sf.file_path;
          if (!sourceFilePath && sf.relative_path && pathGuard && pathGuard.vaultRoot) {
            sourceFilePath = path.resolve(pathGuard.vaultRoot, sf.relative_path);
          }

          if (sourceFilePath && fs.existsSync(sourceFilePath)) {
            try {
              const safePath = pathGuard ? pathGuard.assertReadOnlyPath(sourceFilePath, 'r') : sourceFilePath;
              rawContent = fs.readFileSync(safePath, 'utf8');
            } catch {
              rawContent = sf.frontmatter_raw || null;
            }
          } else {
            rawContent = sf.frontmatter_raw || null;
          }

          let title = sf.file_name.replace(/\.md$/i, '');
          if (rawContent) {
            const headingMatch = rawContent.match(/^#\s+(.+)$/m);
            if (headingMatch) {
              title = headingMatch[1].trim();
            }
          }
          if (sf.frontmatter_json) {
            try {
              const fm = JSON.parse(sf.frontmatter_json);
              if (fm.title) title = fm.title;
              else if (fm.name) title = fm.name;
            } catch {}
          }

          const alreadyCovered = recalledWorldRules.some(
            wr => wr.relativePath === sf.relative_path || wr.title === title || wr.canonicalName === title
          );

          if (!alreadyCovered) {
            const hashStamp = QueryCommands._computeHashStamp(rawContent || sf.frontmatter_raw || title, sf.sha256_hash);
            recalledWorldRules.push({
              id: sf.id,
              entityId: sf.file_name.replace(/\.md$/i, ''),
              entity_id: sf.file_name.replace(/\.md$/i, ''),
              canonicalName: title,
              canonical_name: title,
              title,
              entityType: 'lore',
              entity_type: 'lore',
              category: sf.source_category || 'worldview_setting',
              sourceFilePath: sf.relative_path,
              source_file_path: sf.relative_path,
              status: sf.status || 'canonical',
              reviewStatus: sf.review_status || 'confirmed',
              review_status: sf.review_status || 'confirmed',
              hashTrackingStamp: hashStamp,
              hash_tracking_stamp: hashStamp,
              summary: sf.file_name,
              content: rawContent || sf.frontmatter_raw || '',
              rawContent,
              relativePath: sf.relative_path,
              relative_path: sf.relative_path
            });
          }
        }
      }
    }

    // ------------------------------------------------------------------------
    // 4. Chapter Sources Query
    // ------------------------------------------------------------------------
    const chapterSources = [];
    if (chapterRecord) {
      let chRawContent = null;
      let chPath = chapterRecord.relative_path || chapterRecord.source_relative_path;
      if (chPath && pathGuard && pathGuard.vaultRoot) {
        const fullChPath = path.resolve(pathGuard.vaultRoot, chPath);
        if (fs.existsSync(fullChPath)) {
          try {
            const safeP = pathGuard.assertReadOnlyPath(fullChPath, 'r');
            chRawContent = fs.readFileSync(safeP, 'utf8');
          } catch {}
        }
      }
      const chHash = QueryCommands._computeHashStamp(chRawContent || chapterRecord.summary || chapterRecord.title, chapterRecord.sha256_hash);
      const targetChItem = {
        chapterId: String(chapterRecord.chapter_number || chapterRecord.id),
        chapter_id: String(chapterRecord.chapter_number || chapterRecord.id),
        chapterNumber: Number(chapterRecord.chapter_number) || 1,
        chapter_number: Number(chapterRecord.chapter_number) || 1,
        volumeNumber: Number(chapterRecord.volume_number) || 1,
        volume_number: Number(chapterRecord.volume_number) || 1,
        title: chapterRecord.title,
        sourceFilePath: chPath || '03_Chapters/virtual_chapter.md',
        source_file_path: chPath || '03_Chapters/virtual_chapter.md',
        status: chapterRecord.status || 'draft',
        canon: chapterRecord.canon !== undefined ? Number(chapterRecord.canon) : (chapterRecord.status === 'draft' ? 0 : 1),
        reviewStatus: chapterRecord.canon === 1 ? 'approved' : 'draft',
        review_status: chapterRecord.canon === 1 ? 'approved' : 'draft',
        hashTrackingStamp: chHash,
        hash_tracking_stamp: chHash,
        summary: chapterRecord.summary || null,
        content: chRawContent || chapterRecord.summary || chapterRecord.title
      };
      chapterSources.push(targetChItem);

      // Also load preceding canonical chapters in volume for narrative context
      try {
        const prevChapters = dbManager.db.prepare(`
          SELECT c.*, sf.relative_path AS source_relative_path, sf.sha256_hash
          FROM chapters c
          LEFT JOIN source_files sf ON c.source_file_id = sf.id
          WHERE c.volume_number = ? AND c.chapter_number < ? AND (c.canon = 1 OR c.status IN ('completed', 'published'))
          ORDER BY c.chapter_number DESC LIMIT 3
        `).all(targetChItem.volumeNumber, targetChItem.chapterNumber);

        for (const prevCh of prevChapters) {
          const pHash = QueryCommands._computeHashStamp(prevCh.summary || prevCh.title, prevCh.sha256_hash);
          chapterSources.push({
            chapterId: String(prevCh.chapter_number || prevCh.id),
            chapter_id: String(prevCh.chapter_number || prevCh.id),
            chapterNumber: Number(prevCh.chapter_number),
            chapter_number: Number(prevCh.chapter_number),
            volumeNumber: Number(prevCh.volume_number) || 1,
            volume_number: Number(prevCh.volume_number) || 1,
            title: prevCh.title,
            sourceFilePath: prevCh.relative_path || prevCh.source_relative_path || '03_Chapters/prev_chapter.md',
            source_file_path: prevCh.relative_path || prevCh.source_relative_path || '03_Chapters/prev_chapter.md',
            status: prevCh.status || 'completed',
            canon: 1,
            reviewStatus: 'approved',
            review_status: 'approved',
            hashTrackingStamp: pHash,
            hash_tracking_stamp: pHash,
            summary: prevCh.summary || null,
            content: prevCh.summary || prevCh.title
          });
        }
      } catch (_) {}
    }

    // ------------------------------------------------------------------------
    // 5. Active Conflict Warnings Query
    // ------------------------------------------------------------------------
    try {
      const activeAnomalies = dbManager.db.prepare(`
        SELECT a.*, sf.relative_path AS source_file_relative_path, sf.sha256_hash
        FROM anomalies a
        LEFT JOIN source_files sf ON a.source_file_id = sf.id
        WHERE a.status = 'open' OR a.status = 'active'
        ORDER BY CASE WHEN a.severity = 'critical' THEN 1 WHEN a.severity = 'error' THEN 2 ELSE 3 END ASC
        LIMIT 50
      `).all();

      for (const anom of activeAnomalies) {
        const anomHash = QueryCommands._computeHashStamp(anom.message || anom.title || anom.anomaly_code, anom.sha256_hash);
        let invEntities = [];
        if (anom.involved_entities_json) {
          try { invEntities = JSON.parse(anom.involved_entities_json); } catch {}
        }
        conflicts.push({
          anomalyCode: anom.anomaly_code || anom.anomaly_rule_id || 'ANOM_CONFLICT',
          anomaly_code: anom.anomaly_code || anom.anomaly_rule_id || 'ANOM_CONFLICT',
          title: anom.title || '设定冲突预警',
          message: anom.message || anom.description || '检测到设定冲突',
          description: anom.description || anom.message || '检测到设定冲突',
          sourceFilePath: anom.source_file_relative_path || 'virtual_anomaly.md',
          source_file_path: anom.source_file_relative_path || 'virtual_anomaly.md',
          status: 'conflict',
          reviewStatus: 'warning',
          review_status: 'warning',
          hashTrackingStamp: anomHash,
          hash_tracking_stamp: anomHash,
          involvedEntities: invEntities,
          involved_entities: invEntities,
          content: anom.message || anom.title || ''
        });
      }
    } catch (_) {}

    // ------------------------------------------------------------------------
    // 6. Open Foreshadowing & Unresolved Hooks Query
    // ------------------------------------------------------------------------
    const openForeshadowing = [];
    const fsSql = `
      SELECT fs.*,
             sf_setup.relative_path AS setup_file_path,
             sf_setup.sha256_hash AS setup_sha256,
             c_setup.title AS setup_chapter_title
      FROM foreshadowing fs
      LEFT JOIN source_files sf_setup ON fs.setup_file_id = sf_setup.id
      LEFT JOIN chapters c_setup ON fs.setup_chapter_id = c_setup.id
      WHERE fs.status = 'open'
      ORDER BY
        CASE
          WHEN fs.importance_level = 'critical' THEN 1
          WHEN fs.importance_level = 'major' THEN 2
          ELSE 3
        END ASC,
        fs.id ASC
    `;
    const fsRows = dbManager.db.prepare(fsSql).all();
    for (const f of fsRows) {
      const fsHash = QueryCommands._computeHashStamp(f.description || f.setup_snippet || f.title, f.setup_sha256);
      openForeshadowing.push({
        id: f.id,
        threadKey: f.thread_key || f.foreshadow_id,
        thread_key: f.thread_key || f.foreshadow_id,
        foreshadowId: f.foreshadow_id,
        foreshadow_id: f.foreshadow_id,
        id_code: f.foreshadow_id,
        title: f.title,
        description: f.description,
        status: f.status,
        reviewStatus: 'unresolved',
        review_status: 'unresolved',
        sourceFilePath: f.setup_file_path || '05_Foreshadowing/virtual_clue.md',
        source_file_path: f.setup_file_path || '05_Foreshadowing/virtual_clue.md',
        hashTrackingStamp: fsHash,
        hash_tracking_stamp: fsHash,
        importanceLevel: f.importance_level || 'major',
        importance_level: f.importance_level || 'major',
        setupChapterId: f.setup_chapter_id,
        setup_chapter_id: f.setup_chapter_id,
        setupSnippet: f.setup_snippet,
        setup_snippet: f.setup_snippet,
        setupFilePath: f.setup_file_path,
        setup_file_path: f.setup_file_path,
        content: f.description || f.setup_snippet || f.title
      });
    }

    // ------------------------------------------------------------------------
    // 7. Timeline Events Query
    // ------------------------------------------------------------------------
    const timelineEvents = [];
    const tlSql = `
      SELECT te.*,
             e.canonical_name AS primary_entity_name,
             sf.relative_path AS source_file_path,
             sf.sha256_hash AS source_sha256
      FROM timeline_events te
      LEFT JOIN entities e ON te.primary_entity_id = e.id
      LEFT JOIN source_files sf ON te.source_file_id = sf.id
      WHERE te.status NOT IN ('deprecated', 'archived', 'deleted', 'obsolete')
      ORDER BY te.timestamp_order ASC, te.id ASC
    `;
    const tlRows = dbManager.db.prepare(tlSql).all();
    for (const t of tlRows) {
      const tlHash = QueryCommands._computeHashStamp(t.description || t.title, t.source_sha256);
      timelineEvents.push({
        id: t.id,
        eventId: t.event_id,
        event_id: t.event_id,
        title: t.title,
        eventName: t.title,
        event_name: t.title,
        eraEpoch: t.era_epoch,
        era_epoch: t.era_epoch,
        timePoint: t.relative_time_desc || (t.timeline_year ? `${t.timeline_year}年` : `Order ${t.timestamp_order}`),
        time_point: t.relative_time_desc || (t.timeline_year ? `${t.timeline_year}年` : `Order ${t.timestamp_order}`),
        timestampOrder: t.timestamp_order,
        timestamp_order: t.timestamp_order,
        timelineYear: t.timeline_year,
        timeline_year: t.timeline_year,
        description: t.description,
        status: t.status,
        primaryEntity: t.primary_entity_name || null,
        sourceFilePath: t.source_file_path || null,
        source_file_path: t.source_file_path || null,
        hashTrackingStamp: tlHash,
        hash_tracking_stamp: tlHash
      });
    }

    // ------------------------------------------------------------------------
    // 8. Assemble Structured Context Markdown String
    // ------------------------------------------------------------------------
    const contextSections = [];

    if (chapterObj) {
      contextSections.push(
        `# 篇章上下文：${chapterObj.title || `第 ${chapterObj.chapter_number} 章`}\n` +
        `- 卷号：第 ${chapterObj.volume_number || 1} 卷\n` +
        `- 章节编号：第 ${chapterObj.chapter_number || 1} 章\n` +
        `- 状态：${chapterObj.status || 'draft'}\n` +
        `- 视角人物 (POV)：${chapterObj.pov || chapterObj.povEntityName || '全知'}\n` +
        `- 概要：${chapterObj.summary || '无'}`
      );
    } else {
      contextSections.push('# 篇章上下文\n- 未指定目标章节');
    }

    if (recalledWorldRules.length > 0) {
      const ruleText = recalledWorldRules.map(r => {
        const bodyContent = r.content || r.rawContent || r.summary || '无内容';
        return `### 规则：${r.title || r.canonicalName} (${r.entityId || 'RULE'})\n${bodyContent}`;
      }).join('\n\n');
      contextSections.push(`## 世界观公理与规则 (World Rules)\n${ruleText}`);
    }

    if (canonSources.length > 0) {
      const canonText = canonSources.map(e => {
        const aliasStr = e.aliases && e.aliases.length > 0 ? e.aliases.join(', ') : '无';
        const bodyContent = e.content || e.rawContent || e.description || e.summary || '无详细设定';
        return `### 正史档案：${e.canonicalName} (${e.entityId}) [类型: ${e.entityType}]\n- 状态: ${e.status} | 审核: ${e.reviewStatus} | 追踪戳: ${e.hashTrackingStamp.slice(0, 8)}...\n- 别名: ${aliasStr}\n- 设定内容:\n${bodyContent}`;
      }).join('\n\n');
      contextSections.push(`## 正史档案 (Canon Sources)\n${canonText}`);
    }

    if (candidateSources.length > 0) {
      const candText = candidateSources.map(e => {
        const bodyContent = e.content || e.rawContent || e.description || e.summary || '无详细设定';
        return `### 候选设定：${e.canonicalName} (${e.entityId})\n- 状态: ${e.status} | 审核: ${e.reviewStatus} | 追踪戳: ${e.hashTrackingStamp.slice(0, 8)}...\n- 设定内容:\n${bodyContent}`;
      }).join('\n\n');
      contextSections.push(`## 创意与候选参考 (Candidate Sources)\n${candText}`);
    }

    if (conflicts.length > 0) {
      const confText = conflicts.map(c => {
        return `- **[${c.anomalyCode}] ${c.title}**: ${c.message} (源: \`${c.sourceFilePath}\`)`;
      }).join('\n');
      contextSections.push(`## 冲突设定预警 (Conflicts)\n${confText}`);
    }

    if (openForeshadowing.length > 0) {
      const fsText = openForeshadowing.map(f => {
        return `- **[${f.importanceLevel || 'major'}] ${f.title}** (${f.foreshadowId}): ${f.description || f.setupSnippet || '无描述'}`;
      }).join('\n');
      contextSections.push(`## 活跃未决伏笔 (Unresolved Foreshadowing)\n${fsText}`);
    }

    if (timelineEvents.length > 0) {
      const tlText = timelineEvents.map(t => {
        return `- [${t.eraEpoch || 'CE'} | 序号 ${t.timestampOrder}] **${t.title}** (${t.eventId}): ${t.description || '无详细描述'}`;
      }).join('\n');
      contextSections.push(`## 关联时间线事件 (Relevant Timeline Events)\n${tlText}`);
    }

    const assembledContext = contextSections.join('\n\n');

    // ------------------------------------------------------------------------
    // 9. Format 6-Category Snapshot & Return Output Payload
    // ------------------------------------------------------------------------
    const snapshot = {
      worldRules: recalledWorldRules,
      canonSources,
      chapterSources,
      candidateSources,
      conflicts,
      unresolved: openForeshadowing
    };

    const details = {
      command: 'GetChapterContext',
      projectId,
      chapter: chapterObj,
      snapshot,
      worldRules: recalledWorldRules,
      world_rules: recalledWorldRules,
      canonSources,
      canon_sources: canonSources,
      chapterSources,
      chapter_sources: chapterSources,
      candidateSources,
      candidate_sources: candidateSources,
      conflicts,
      unresolved: openForeshadowing,
      entities: recalledEntities,
      openForeshadowing,
      foreshadowing: openForeshadowing,
      open_foreshadowing: openForeshadowing,
      relevantTimelineEvents: timelineEvents,
      timeline: timelineEvents,
      timeline_events: timelineEvents,
      assembledContext
    };

    return {
      content: [
        {
          type: 'text',
          text: `Retrieved context snapshot for Chapter ${chapterObj ? (chapterObj.chapterNumber || chapterObj.id) : (rawChapterId || 'General')}: ${recalledWorldRules.length} world rules, ${canonSources.length} canon sources, ${chapterSources.length} chapter sources, ${candidateSources.length} candidates, ${conflicts.length} conflicts, ${openForeshadowing.length} unresolved hooks.`
        }
      ],
      details,
      snapshot,
      // Direct property access aliases for convenient caller extraction
      chapter: chapterObj,
      worldRules: recalledWorldRules,
      world_rules: recalledWorldRules,
      canonSources,
      canon_sources: canonSources,
      chapterSources,
      chapter_sources: chapterSources,
      candidateSources,
      candidate_sources: candidateSources,
      conflicts,
      unresolved: openForeshadowing,
      entities: recalledEntities,
      openForeshadowing,
      foreshadowing: openForeshadowing,
      open_foreshadowing: openForeshadowing,
      relevantTimelineEvents: timelineEvents,
      timeline: timelineEvents,
      timeline_events: timelineEvents,
      assembledContext
    };
  }

  /**
   * Alias for GetChapterContext
   */
  static async GetChapterContext(params, context) {
    return QueryCommands.handleGetChapterContext(params, context);
  }

  /**
   * Alias for getChapterContext
   */
  static async getChapterContext(params, context) {
    return QueryCommands.handleGetChapterContext(params, context);
  }
}

module.exports = QueryCommands;

