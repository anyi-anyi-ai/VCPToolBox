/**
 * @file FileClassifier.js
 * @description 5-tier classification cascade and semantic feature extraction for Obsidian World Tree files
 * @module scanner/FileClassifier
 * @license MIT
 */

'use strict';

const crypto = require('node:crypto');
const path = require('node:path');
const FrontmatterParser = require('./FrontmatterParser');

class FileClassifier {
  /**
   * Classifies a file entry through the 5-tier cascade and extracts domain entities
   * @param {object} params
   * @param {string} params.relativePath - Normalized POSIX relative path
   * @param {string} [params.absolutePath] - Full file path
   * @param {string} [params.fileName] - Base filename
   * @param {number} [params.fileSize=0] - Size in bytes
   * @param {string} [params.rawContent=''] - Raw file text content
   * @param {object} [params.frontmatter] - Pre-parsed frontmatter (optional)
   * @param {string} [params.body] - Pre-parsed markdown body (optional)
   * @param {boolean} [params.isCorrupted=false] - Corruption flag
   * @param {string} [params.parseError=null] - Parser error if any
   * @param {Array} [params.wikilinks] - Pre-extracted wikilinks (optional)
   * @param {Array} [params.tags] - Pre-extracted tags (optional)
   * @param {number} [params.lineCount] - Line count
   * @param {number} [params.wordCount] - Word count
   * @returns {object} Classification result and extracted domain models
   */
  static classify(params) {
    const relativePath = (params.relativePath || '').replace(/\\/g, '/');
    const fileName = params.fileName || (relativePath ? relativePath.split('/').pop() : '');
    const extension = path.extname(fileName).toLowerCase();
    const fileSize = params.fileSize !== undefined && params.fileSize !== null
      ? Number(params.fileSize)
      : (params.rawContent ? Buffer.byteLength(params.rawContent, 'utf8') : (params.body ? Buffer.byteLength(params.body, 'utf8') : 0));

    let parsed = null;
    if (params.frontmatter !== undefined && params.body !== undefined) {
      parsed = {
        frontmatter: params.frontmatter || {},
        body: params.body || '',
        rawFrontmatter: params.rawFrontmatter || null,
        hasFrontmatter: params.hasFrontmatter !== undefined ? !!params.hasFrontmatter : Object.keys(params.frontmatter || {}).length > 0,
        isCorrupted: !!params.isCorrupted,
        parseError: params.parseError || null,
        wikilinks: params.wikilinks || FrontmatterParser.extractWikilinks(params.body || ''),
        tags: params.tags || FrontmatterParser.extractTags(params.body || '', params.frontmatter || {}),
        headings: params.headings || FrontmatterParser.extractHeadings(params.body || ''),
        lineCount: params.lineCount !== undefined ? params.lineCount : (params.rawContent ? params.rawContent.split(/\r?\n/).length : 0),
        wordCount: params.wordCount !== undefined ? params.wordCount : FrontmatterParser.calculateWordCount(params.body || ''),
        isBodyEmpty: (params.body || '').trim().length === 0
      };
    } else {
      parsed = FrontmatterParser.parse(params.rawContent || '');
    }

    const { frontmatter, body, wikilinks, tags, lineCount, wordCount, isBodyEmpty, isCorrupted } = parsed;

    // --- Detect Directory Anchor ---
    const directoryAnchor = FileClassifier._detectDirectoryAnchor(relativePath);

    // --- Tier 1: Path Hierarchy Heuristics ---
    let tier1Category = null;
    let tier1Status = null;
    const pathLower = relativePath.toLowerCase();
    const pathSegments = pathLower.split('/');

    if (directoryAnchor) {
      if (directoryAnchor.defaultEntityType === 'planet') {
        tier1Category = 'planet_system';
      } else if (directoryAnchor.defaultEntityType === 'character') {
        tier1Category = 'character_bio';
      } else {
        tier1Category = 'character_bio';
      }
    } else if (pathLower.includes('01_worldview') || pathLower.includes('00_worldview') || pathLower.includes('01_世界观') || pathLower.includes('设定/') || pathLower.includes('geography') || pathLower.includes('cosmology')) {
      tier1Category = 'worldview_setting';
    } else if (pathLower.includes('02_entities/planets') || pathLower.includes('星球/')) {
      tier1Category = 'planet_system';
    } else if (pathLower.includes('02_entities/characters') || pathLower.includes('人物/')) {
      tier1Category = 'character_bio';
    } else if (pathLower.includes('02_entities') || pathLower.includes('02_实体') || pathLower.includes('factions') || pathLower.includes('organizations') || pathLower.includes('ships') || pathLower.includes('relics')) {
      tier1Category = 'character_bio'; // generic entity card
    } else if (pathLower.includes('03_chapters') || pathLower.includes('03_正文') || pathLower.includes('chapters/') || /第.*卷/.test(pathLower)) {
      tier1Category = 'chapter_text';
    } else if (pathLower.includes('04_timeline') || pathLower.includes('04_时间线') || pathLower.includes('events/') || pathLower.includes('chronology')) {
      tier1Category = 'timeline_record';
    } else if (pathLower.includes('05_foreshadowing') || pathLower.includes('05_伏笔') || pathLower.includes('clues/') || pathLower.includes('线索/')) {
      tier1Category = 'foreshadowing_entry';
    } else if (pathLower.includes('06_references') || pathLower.includes('06_参考资料') || pathLower.includes('notes/')) {
      tier1Category = 'unclassified';
    } else if (pathSegments.length === 1 || pathLower.includes('canvas') || pathLower.includes('templates')) {
      tier1Category = 'meta_placeholder';
    }

    if (pathLower.includes('99_archive') || pathLower.includes('archive/') || pathLower.includes('history/') || pathLower.includes('v1_backup')) {
      tier1Status = 'deprecated';
    }

    // --- Tier 2: Filename Patterns ---
    let tier2Category = null;
    let tier2Status = null;
    let tier2Review = null;
    const nameLower = fileName.toLowerCase();

    if (extension === '.canvas' || nameLower === 'index.md' || nameLower === 'readme.md' || nameLower.startsWith('moc')) {
      tier2Category = 'meta_placeholder';
    } else if (/planet[-_]|\bplanet\b|星球/i.test(fileName)) {
      tier2Category = 'planet_system';
    } else if (/人物卡|设定卡|档案|char[-_]/i.test(fileName)) {
      tier2Category = 'character_bio';
    } else if (/第.*章|chapter|第.*节|大纲/i.test(fileName)) {
      tier2Category = 'chapter_text';
    } else if (/年.*月.*日|纪元|战役|事件|ev[-_]|tl[-_]/i.test(fileName)) {
      tier2Category = 'timeline_record';
    } else if (/伏笔|线索|暗线|fs[-_]|hook[-_]/i.test(fileName)) {
      tier2Category = 'foreshadowing_entry';
    }

    if (/_deprecated|_old|_v1|_backup/i.test(fileName)) {
      tier2Status = 'deprecated';
    } else if (/草稿|_draft/i.test(fileName)) {
      tier2Status = 'draft';
    }

    if (/_ai_draft|_ai_gen|ai_generated/i.test(fileName)) {
      tier2Review = 'ai_generated';
    }

    // --- Tier 3: Size & Empty Content Heuristics ---
    let isPlaceholder = false;
    let placeholderReason = null;
    let tier3Status = null;

    if (fileSize <= 30) {
      isPlaceholder = true;
      placeholderReason = 'FILE_SIZE_LE_30B';
      tier3Status = 'placeholder';
    } else if (fileSize <= 50) {
      isPlaceholder = true;
      placeholderReason = 'FILE_SIZE_LE_50B';
      tier3Status = 'placeholder';
    } else if (isBodyEmpty && Object.keys(frontmatter).length <= 2) {
      isPlaceholder = true;
      placeholderReason = 'EMPTY_BODY';
      tier3Status = 'placeholder';
    } else if (body.trim().length > 0 && body.trim().length <= 30 && /^#\s+[^\n]+$/.test(body.trim())) {
      isPlaceholder = true;
      placeholderReason = 'EMPTY_BODY';
      tier3Status = 'placeholder';
    }

    // --- Tier 4: Frontmatter (YAML) Extraction & Priority Overrides ---
    let tier4Category = null;
    let tier4Status = null;
    let tier4Review = null;

    const fmCategory = String(frontmatter.category || frontmatter.source_category || '').toLowerCase();
    const fmType = String(frontmatter.type || frontmatter.entity_type || '').toLowerCase();
    const fmStatus = String(frontmatter.status || '').toLowerCase();
    const fmReview = String(frontmatter.review_status || '').toLowerCase();

    if (fmCategory === 'world_setting' || fmCategory === 'worldview' || fmCategory === 'worldview_setting' || fmCategory === 'lore' || fmType === 'lore' || fmType === 'cosmology' || fmType === 'geography') {
      tier4Category = 'worldview_setting';
    } else if (fmCategory === 'planet' || fmType === 'planet' || fmCategory === 'planet_system') {
      tier4Category = 'planet_system';
    } else if (fmCategory === 'character' || fmType === 'character' || fmCategory === 'character_bio') {
      tier4Category = 'character_bio';
    } else if (fmCategory === 'entity' || fmCategory === 'entity_card' || ['faction', 'organization', 'relic', 'ship', 'item', 'location'].includes(fmType)) {
      tier4Category = fmType === 'planet' ? 'planet_system' : 'character_bio';
    } else if (fmCategory === 'chapter' || fmCategory === 'chapter_text' || fmType === 'chapter' || fmType === 'outline' || frontmatter.chapter_number !== undefined) {
      tier4Category = 'chapter_text';
    } else if (fmCategory === 'timeline' || fmCategory === 'timeline_record' || fmType === 'event' || frontmatter.timestamp !== undefined || frontmatter.timestamp_order !== undefined) {
      tier4Category = 'timeline_record';
    } else if (fmCategory === 'foreshadowing' || fmCategory === 'foreshadowing_entry' || fmType === 'clue' || fmType === 'hook' || frontmatter.target_chapter !== undefined) {
      tier4Category = 'foreshadowing_entry';
    } else if (fmCategory === 'meta' || fmCategory === 'meta_placeholder' || fmType === 'canvas' || fmType === 'index') {
      tier4Category = 'meta_placeholder';
    }

    if (fmStatus === 'active') {
      tier4Status = 'active';
    } else if (['canonical', 'finalized', 'published'].includes(fmStatus)) {
      tier4Status = 'finalized';
    } else if (['draft', 'in_progress', 'writing', 'wip'].includes(fmStatus)) {
      tier4Status = 'draft';
    } else if (['deprecated', 'archived', 'obsolete'].includes(fmStatus)) {
      tier4Status = 'deprecated';
    } else if (['placeholder', 'stub'].includes(fmStatus)) {
      tier4Status = 'placeholder';
    } else if (['generated', 'ai_generated'].includes(fmStatus)) {
      tier4Status = 'generated';
    } else if (['conflict', 'conflicted', 'dispute'].includes(fmStatus)) {
      tier4Status = 'conflict';
    }

    if (frontmatter.verified === true || frontmatter.verified === 'true' || ['manual_verified', 'human_confirmed', 'confirmed'].includes(fmReview) || frontmatter.author === 'human_canon' || frontmatter.reviewed_by === 'human') {
      tier4Review = 'human_confirmed';
    } else if (frontmatter.ai_generated === true || frontmatter.ai_generated === 'true' || fmReview === 'ai_generated' || frontmatter.generator || tags.includes('ai-gen') || tags.includes('ai_generated')) {
      tier4Review = 'ai_generated';
    } else if (fmReview === 'pending_review' || fmReview === 'review_needed') {
      tier4Review = 'pending_review';
    } else if (['conflicted', 'conflict', 'dispute'].includes(fmReview)) {
      tier4Review = 'conflicted';
    } else if (fmReview === 'rejected') {
      tier4Review = 'unreviewed';
    }

    // Resolve Final source_category
    let sourceCategory = tier4Category || tier2Category || tier1Category || 'unclassified';

    // Resolve Final status
    let status;
    if (isPlaceholder) {
      status = 'placeholder';
    } else if (tier4Status) {
      status = tier4Status;
    } else if (tier2Status) {
      status = tier2Status;
    } else if (tier1Status) {
      status = tier1Status;
    } else {
      status = 'draft';
    }

    // Resolve Final review_status
    let reviewStatus = tier4Review || tier2Review || 'unreviewed';

    // --- Tier 5: Semantic Extraction (Entities, Timelines, Chapters, Foreshadowing) ---
    const extracted = this._extractSemanticEntities({
      relativePath,
      fileName,
      frontmatter,
      body,
      sourceCategory,
      status,
      reviewStatus,
      wikilinks,
      tags,
      wordCount,
      lineCount,
      directoryAnchor
    });

    const parsedAnchor = directoryAnchor ? FileClassifier._parseAnchorSegment(directoryAnchor.anchorSegment) : null;
    const anchorId = parsedAnchor ? (parsedAnchor.entityId || directoryAnchor.anchorSegment) : null;

    return {
      sourceCategory,
      status,
      reviewStatus,
      isPlaceholder,
      placeholderReason,
      isCorrupted: parsed.isCorrupted,
      parseError: parsed.parseError,
      hasFrontmatter: parsed.hasFrontmatter,
      rawFrontmatter: parsed.rawFrontmatter,
      frontmatter,
      body,
      wikilinks,
      tags,
      headings: parsed.headings,
      lineCount,
      wordCount,
      directoryAnchor: anchorId,
      entity: extracted.entity,
      aliases: extracted.aliases,
      timelineEvent: extracted.timelineEvent,
      chapter: extracted.chapter,
      foreshadowing: extracted.foreshadowing
    };
  }

  /**
   * Detects whether a relative POSIX path resides within an entity directory anchor.
   * @param {string} relativePath - POSIX relative path (e.g. "04_星球档案/V-001/07_势力体系/00_星球总览.md")
   * @returns {object|null} Anchor descriptor or null if standalone/non-entity
   */
  static _detectDirectoryAnchor(relativePath) {
    const norm = (relativePath || '').replace(/\\/g, '/');
    const segments = norm.split('/').filter(Boolean);
    if (segments.length < 2) return null;

    // Pattern 1: 04_星球档案/<anchor>/... or 04_planets/<anchor>/... or 04_planet/<anchor>/... or 星球档案/<anchor>/...
    if (/^(04_星球档案|04_planets|04_planet|星球档案|planets|planet|星球)/i.test(segments[0])) {
      if (segments.length >= 3) {
        const anchorSegment = segments[1];
        return {
          containerPath: segments[0],
          anchorSegment,
          anchorRelativePath: `${segments[0]}/${anchorSegment}`,
          defaultEntityType: 'planet',
          depth: segments.length - 2
        };
      }
    }

    // Pattern 2: 02_Entities/<Category>/<anchor>/... or 02_实体/<类别>/<anchor>/...
    if (/^(02_entities|02_实体|entities|实体)/i.test(segments[0])) {
      if (segments.length >= 3) {
        const categorySegment = segments[1].toLowerCase();
        let defaultType = 'concept';
        if (/planet|星球/.test(categorySegment)) defaultType = 'planet';
        else if (/character|人物/.test(categorySegment)) defaultType = 'character';
        else if (/organization|faction|组织|势力/.test(categorySegment)) defaultType = 'organization';
        else if (/relic|item|遗物|道具/.test(categorySegment)) defaultType = 'item';
        else if (/location|地点/.test(categorySegment)) defaultType = 'location';

        if (segments.length >= 4) {
          const anchorSegment = segments[2];
          return {
            containerPath: `${segments[0]}/${segments[1]}`,
            anchorSegment,
            anchorRelativePath: `${segments[0]}/${segments[1]}/${anchorSegment}`,
            defaultEntityType: defaultType,
            depth: segments.length - 3
          };
        }
      }
    }

    // Pattern 3: Generic <Category>/<anchor>/... (e.g. Characters/Alice/Bio.md, Factions/Alliance/xxx.md)
    if (/^(characters|organizations|factions|relics|ships|items|locations|人物|势力|组织|遗物|地点)/i.test(segments[0])) {
      if (segments.length >= 3) {
        const categorySegment = segments[0].toLowerCase();
        let defaultType = 'concept';
        if (/planet|星球/.test(categorySegment)) defaultType = 'planet';
        else if (/character|人物/.test(categorySegment)) defaultType = 'character';
        else if (/org|faction|组织|势力/.test(categorySegment)) defaultType = 'organization';
        else if (/relic|item|遗物|道具/.test(categorySegment)) defaultType = 'item';
        else if (/location|地点/.test(categorySegment)) defaultType = 'location';

        const anchorSegment = segments[1];
        return {
          containerPath: segments[0],
          anchorSegment,
          anchorRelativePath: `${segments[0]}/${anchorSegment}`,
          defaultEntityType: defaultType,
          depth: segments.length - 2
        };
      }
    }

    return null;
  }

  /**
   * Extracts canonical ID and canonical name candidates from an anchor segment string.
   * Examples:
   *   "V-001" -> { entityId: "V-001", canonicalName: "V-001" }
   *   "V-001 泰拉" -> { entityId: "V-001", canonicalName: "泰拉" }
   *   "PLANET-108_Oceania" -> { entityId: "PLANET-108", canonicalName: "Oceania" }
   *   "CHAR-007_Alice" -> { entityId: "CHAR-007", canonicalName: "Alice" }
   *   "苔原星" -> { entityId: "苔原星", canonicalName: "苔原星" }
   */
  static _parseAnchorSegment(anchorSegment) {
    if (!anchorSegment) return { entityId: '', canonicalName: '' };
    const codeMatch = anchorSegment.match(/([A-Z]+-\d+|[A-Z]+-[A-Z0-9-]+|V-\d+|P-\d+|CHAR-\d+|ORG-\d+|PLANET-\d+)/i);
    let entityId = '';
    let canonicalName = '';

    if (codeMatch) {
      entityId = codeMatch[1].toUpperCase();
      const cleanName = anchorSegment
        .replace(new RegExp(codeMatch[1].replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), '')
        .replace(/^[_\-\s]+|[_\-\s]+$/g, '')
        .trim();
      canonicalName = cleanName || entityId;
    } else {
      entityId = anchorSegment.replace(/[^\w\u4e00-\u9fa5-]/g, '_').trim();
      canonicalName = anchorSegment.trim();
    }

    return { entityId, canonicalName };
  }

  /**
   * Classifies the semantic facet role of a file for its owning entity.
   * @param {object} params
   * @param {string} params.fileName - Base filename (e.g. "00_星球总览.md")
   * @param {string} params.relativePath - Relative POSIX path
   * @param {object} params.frontmatter - Parsed frontmatter
   * @param {boolean} params.isDirectoryAnchor - Whether file is inside directory anchor
   * @param {string} params.anchorSegment - Name of parent anchor folder
   * @param {string} params.status - File status ('active', 'conflict', etc.)
   * @param {string} params.reviewStatus - Review status ('confirmed', 'conflicted', etc.)
   * @returns {'definition' | 'supplement' | 'conflict' | 'primary_subject'}
   */
  static _classifyFacetRole({ fileName, relativePath, frontmatter = {}, isDirectoryAnchor = false, anchorSegment = '', status = '', reviewStatus = '' }) {
    // 1. Explicit frontmatter override
    if (frontmatter.facet_role && ['definition', 'supplement', 'conflict', 'primary_subject'].includes(String(frontmatter.facet_role).toLowerCase())) {
      return String(frontmatter.facet_role).toLowerCase();
    }
    if (frontmatter.role && ['definition', 'supplement', 'conflict', 'primary_subject'].includes(String(frontmatter.role).toLowerCase())) {
      return String(frontmatter.role).toLowerCase();
    }

    // 2. Conflict markers
    if (
      status === 'conflict' ||
      reviewStatus === 'conflicted' ||
      frontmatter.review_status === 'conflicted' ||
      frontmatter.status === 'conflict' ||
      frontmatter.status === 'conflicted' ||
      /_conflict|_dispute|冲突|争议|未决|异议/i.test(fileName || '') ||
      /_conflict|_dispute|冲突|争议/i.test(relativePath || '')
    ) {
      return 'conflict';
    }

    // 3. Directory Anchor Facet Classification
    if (isDirectoryAnchor) {
      const baseName = (fileName || '').replace(/\.md$/i, '').toLowerCase();
      const anchorLow = (anchorSegment || '').toLowerCase();
      const isPrimaryOverview = (
        baseName === '00_星球总览' ||
        baseName === '00_总览' ||
        baseName === '00_summary' ||
        baseName === '00_overview' ||
        baseName === 'overview' ||
        baseName === 'index' ||
        baseName === 'readme' ||
        baseName === 'profile' ||
        baseName === 'main' ||
        baseName === '设定卡' ||
        baseName === '人物卡' ||
        baseName === '档案' ||
        baseName.startsWith('00_') ||
        baseName === anchorLow ||
        frontmatter.is_definition === true ||
        frontmatter.type === 'definition'
      );

      return isPrimaryOverview ? 'definition' : 'supplement';
    }

    // 4. Standalone file
    return 'definition';
  }

  /**
   * Helper to extract domain entity structures from parsed file data
   * @private
   */
  static _extractSemanticEntities(data) {
    const { relativePath, fileName, frontmatter, body, sourceCategory, status, reviewStatus, wikilinks, tags, wordCount, directoryAnchor } = data;

    let entity = null;
    const aliases = [];
    let timelineEvent = null;
    let chapter = null;
    let foreshadowing = null;

    // 1. Entity Extraction
    const isEntityCandidate =
      !!directoryAnchor ||
      sourceCategory === 'planet_system' ||
      sourceCategory === 'character_bio' ||
      frontmatter.id ||
      frontmatter.code ||
      frontmatter.category === 'entity' ||
      frontmatter.type === 'planet' ||
      frontmatter.type === 'character' ||
      frontmatter.type === 'faction' ||
      frontmatter.type === 'organization' ||
      frontmatter.type === 'relic' ||
      frontmatter.type === 'ship';

    if (directoryAnchor || (isEntityCandidate && sourceCategory !== 'chapter_text' && sourceCategory !== 'timeline_record' && sourceCategory !== 'foreshadowing_entry')) {
      let entityId = '';
      let canonicalName = '';
      let entityType = '';
      let isDirectoryAnchor = false;
      let facetRole = 'definition';
      let directoryAnchorSegment = null;

      if (directoryAnchor) {
        isDirectoryAnchor = true;
        directoryAnchorSegment = directoryAnchor.anchorSegment;
        const parsedAnchor = FileClassifier._parseAnchorSegment(directoryAnchor.anchorSegment);

        entityId = frontmatter.id || frontmatter.code || frontmatter.entity_id || parsedAnchor.entityId;
        canonicalName = frontmatter.name || frontmatter.title || frontmatter.canonical_name || parsedAnchor.canonicalName || entityId;
        entityType = frontmatter.type || frontmatter.entity_type || directoryAnchor.defaultEntityType || 'planet';
        facetRole = FileClassifier._classifyFacetRole({
          fileName,
          relativePath,
          frontmatter,
          isDirectoryAnchor: true,
          anchorSegment: directoryAnchor.anchorSegment,
          status,
          reviewStatus
        });
      } else {
        // Determine canonical ID for standalone file
        entityId = frontmatter.id || frontmatter.code || frontmatter.entity_id || '';
        if (!entityId) {
          // Match code from filename like "塔兰托_PLANET-001.md" or "PLANET-001.md"
          const idMatch = fileName.match(/([A-Z]+-\d+|[A-Z]+-[A-Z0-9-]+)/);
          if (idMatch) {
            entityId = idMatch[1];
          } else {
            // Generate fallback deterministic ID with path disambiguation
            const normRelPath = relativePath.replace(/\\/g, '/');
            const hashPrefix = crypto.createHash('sha256').update(normRelPath).digest('hex').slice(0, 8);
            const baseName = path.basename(fileName, path.extname(fileName)).replace(/[^\w\u4e00-\u9fa5-]/g, '_');
            const rawParent = path.dirname(normRelPath);
            const parentFolder = (rawParent && rawParent !== '.' && rawParent !== '')
              ? path.basename(rawParent).replace(/[^\w\u4e00-\u9fa5-]/g, '_')
              : '';
            entityId = parentFolder ? `${parentFolder}_${hashPrefix}_${baseName}` : `${hashPrefix}_${baseName}`;
          }
        }

        // Determine canonical Name
        canonicalName = frontmatter.name || frontmatter.title || frontmatter.canonical_name || '';
        if (!canonicalName) {
          const baseName = path.basename(fileName, path.extname(fileName));
          canonicalName = baseName.replace(/_[A-Z0-9-]+$/i, '').replace(/^[A-Z0-9-]+_/i, '').trim();
        }

        // Determine entity type
        entityType = frontmatter.type || frontmatter.entity_type || '';
        if (!entityType) {
          if (sourceCategory === 'planet_system' || /planet|星球/i.test(relativePath)) {
            entityType = 'planet';
          } else if (sourceCategory === 'character_bio' || /character|人物/i.test(relativePath)) {
            entityType = 'character';
          } else if (/faction|org|组织|同盟|学会/i.test(relativePath)) {
            entityType = 'organization';
          } else if (/relic|item|道具|遗物/i.test(relativePath)) {
            entityType = 'item';
          } else {
            entityType = 'concept';
          }
        }

        facetRole = FileClassifier._classifyFacetRole({
          fileName,
          relativePath,
          frontmatter,
          isDirectoryAnchor: false,
          anchorSegment: '',
          status,
          reviewStatus
        });
      }

      // Summary / description
      const lines = body.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
      const summary = lines.length > 0 ? lines[0].slice(0, 300) : null;

      // Extract attributes
      const attributes = { ...frontmatter };
      delete attributes.id;
      delete attributes.name;
      delete attributes.title;
      delete attributes.type;
      delete attributes.category;
      delete attributes.status;
      delete attributes.review_status;

      entity = {
        entity_id: String(entityId).trim(),
        canonical_name: String(canonicalName).trim(),
        entity_type: String(entityType).trim(),
        category: frontmatter.category || null,
        status: status === 'finalized' ? 'active' : status,
        review_status: reviewStatus === 'human_confirmed' ? 'confirmed' : reviewStatus,
        summary,
        description: body.trim() || null,
        attributes_json: attributes,
        line_number: 1,
        isDirectoryAnchor,
        facetRole,
        directoryAnchor: directoryAnchorSegment
      };

      // Extract Aliases
      if (frontmatter.aliases) {
        const rawAliases = Array.isArray(frontmatter.aliases) ? frontmatter.aliases : [frontmatter.aliases];
        for (const a of rawAliases) {
          if (typeof a === 'string' && a.trim()) {
            aliases.push({
              alias_name: a.trim(),
              alias_type: 'nickname',
              is_primary: 0
            });
          }
        }
      }

      if (frontmatter.alias && typeof frontmatter.alias === 'string') {
        aliases.push({
          alias_name: frontmatter.alias.trim(),
          alias_type: 'nickname',
          is_primary: 0
        });
      }

      if (frontmatter.legacy_id) {
        const legIds = Array.isArray(frontmatter.legacy_id) ? frontmatter.legacy_id : [frontmatter.legacy_id];
        for (const leg of legIds) {
          if (leg && String(leg).trim()) {
            aliases.push({
              alias_name: String(leg).trim(),
              alias_type: 'legacy_id',
              is_primary: 0
            });
          }
        }
      }

      if (frontmatter.former_name) {
        aliases.push({
          alias_name: String(frontmatter.former_name).trim(),
          alias_type: 'former_name',
          is_primary: 0
        });
      }
    }

    // 2. Timeline Event Extraction
    if (sourceCategory === 'timeline_record' || frontmatter.timestamp_order !== undefined || frontmatter.event_id) {
      let eventId = frontmatter.id || frontmatter.event_id || '';
      if (!eventId) {
        const evMatch = fileName.match(/(EV-[A-Z0-9-]+|TL-\d+)/i);
        eventId = evMatch ? evMatch[1] : path.basename(fileName, path.extname(fileName));
      }

      const title = frontmatter.title || frontmatter.name || path.basename(fileName, path.extname(fileName));
      const eraEpoch = frontmatter.era_epoch || frontmatter.epoch || 'CE';
      const timestampOrder = Number(frontmatter.timestamp_order || frontmatter.timestamp || frontmatter.order) || 0;
      const timelineYear = frontmatter.timeline_year !== undefined ? Number(frontmatter.timeline_year) : (frontmatter.year !== undefined ? Number(frontmatter.year) : null);
      const timelineMonth = frontmatter.timeline_month !== undefined ? Number(frontmatter.timeline_month) : (frontmatter.month !== undefined ? Number(frontmatter.month) : null);
      const timelineDay = frontmatter.timeline_day !== undefined ? Number(frontmatter.timeline_day) : (frontmatter.day !== undefined ? Number(frontmatter.day) : null);

      timelineEvent = {
        event_id: String(eventId).trim(),
        title: String(title).trim(),
        era_epoch: String(eraEpoch).trim(),
        timestamp_order: timestampOrder,
        timeline_year: timelineYear,
        timeline_month: timelineMonth,
        timeline_day: timelineDay,
        relative_time_desc: frontmatter.relative_time || frontmatter.relative_time_desc || null,
        description: body.trim() || null,
        causality_prerequisite_ids_json: frontmatter.prerequisites || frontmatter.causality_prerequisite_ids || [],
        causality_consequence_ids_json: frontmatter.consequences || frontmatter.causality_consequence_ids || [],
        status: status === 'finalized' ? 'active' : status
      };
    }

    // 3. Chapter Extraction
    if (sourceCategory === 'chapter_text' || frontmatter.chapter_number !== undefined) {
      let chapterNum = 1;
      if (frontmatter.chapter_number !== undefined) {
        chapterNum = Number(frontmatter.chapter_number);
      } else {
        const chMatch = fileName.match(/第\s*(\d+(?:\.\d+)?)\s*章/i) || fileName.match(/chapter\s*(\d+(?:\.\d+)?)/i);
        if (chMatch) {
          chapterNum = Number(chMatch[1]);
        }
      }

      let volumeNum = 1;
      if (frontmatter.volume_number !== undefined) {
        volumeNum = Number(frontmatter.volume_number);
      } else {
        const volMatch = relativePath.match(/Vol\s*(\d+)/i) || relativePath.match(/第\s*(\d+)\s*卷/i);
        if (volMatch) {
          volumeNum = Number(volMatch[1]);
        }
      }

      const chapterTitle = frontmatter.title || path.basename(fileName, path.extname(fileName));

      chapter = {
        chapter_number: chapterNum,
        volume_number: volumeNum,
        title: String(chapterTitle).trim(),
        relative_path: relativePath,
        word_count: wordCount,
        status: status === 'finalized' ? 'completed' : status,
        timeline_start: frontmatter.timeline_start ? Number(frontmatter.timeline_start) : null,
        timeline_end: frontmatter.timeline_end ? Number(frontmatter.timeline_end) : null,
        pov_entity_id: frontmatter.pov ? Number(frontmatter.pov) : null,
        summary: frontmatter.summary || (body ? body.slice(0, 300) : null)
      };
    }

    // 4. Foreshadowing Extraction
    if (sourceCategory === 'foreshadowing_entry' || frontmatter.foreshadow_id) {
      let foreshadowId = frontmatter.id || frontmatter.foreshadow_id || '';
      if (!foreshadowId) {
        const fsMatch = fileName.match(/(FS-[A-Z0-9-]+|HOOK-\d+)/i);
        foreshadowId = fsMatch ? fsMatch[1] : path.basename(fileName, path.extname(fileName));
      }

      const title = frontmatter.title || path.basename(fileName, path.extname(fileName));

      foreshadowing = {
        foreshadow_id: String(foreshadowId).trim(),
        title: String(title).trim(),
        description: body.trim() || frontmatter.description || '',
        setup_line: 1,
        setup_snippet: frontmatter.setup_snippet || (body ? body.slice(0, 200) : null),
        status: frontmatter.status || (status === 'finalized' ? 'closed' : 'open'),
        importance_level: frontmatter.importance || frontmatter.importance_level || 'major',
        tags_json: tags
      };
    }

    return {
      entity,
      aliases,
      timelineEvent,
      chapter,
      foreshadowing
    };
  }
}

module.exports = FileClassifier;
