/**
 * @file DetectionCommands.js
 * @description Handlers for DetectPlaceholderFiles, DetectDuplicateEntities, and DetectLegacyIdConflicts commands
 * @module commands/DetectionCommands
 * @license MIT
 */

'use strict';

const Rule01 = require('../anomaly/rules/Rule01_SameNameDiffId');
const Rule02 = require('../anomaly/rules/Rule02_SameIdMultiEntities');
const Rule04 = require('../anomaly/rules/Rule04_PlaceholderFiles');
const Rule05 = require('../anomaly/rules/Rule05_LegacyIdConflicts');
const Rule08 = require('../anomaly/rules/Rule08_AliasCollisions');

class DetectionCommands {
  /**
   * Command 4: DetectPlaceholderFiles
   * Discovers 30B stubs, <=50B empty files, and placeholder notes.
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleDetectPlaceholderFiles(params, context) {
    const { dbManager, config } = context;
    const maxSizeBytes = Number.isInteger(params.maxSizeBytes)
      ? params.maxSizeBytes
      : (parseInt(config.PLACEHOLDER_SIZE_THRESHOLD_BYTES, 10) || 50);

    const anomalies = Rule04.detect(dbManager, 'query', { maxSizeBytes });

    const placeholders = anomalies.map(a => ({
      id: a.details_json.fileId,
      relativePath: a.details_json.relativePath,
      fileName: a.details_json.fileName,
      sizeBytes: a.details_json.sizeBytes,
      wordCount: a.details_json.wordCount,
      reason: a.details_json.reason,
      entityId: a.details_json.entityId,
      canonicalName: a.details_json.canonicalName
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Found ${placeholders.length} placeholder / stub files in database.`
        }
      ],
      details: {
        command: 'DetectPlaceholderFiles',
        placeholderCount: placeholders.length,
        placeholders
      }
    };
  }

  /**
   * Command 5: DetectDuplicateEntities
   * Detects duplicate names with divergent IDs (ANOM_001), duplicate IDs with multiple entities (ANOM_002), and alias collisions (ANOM_008).
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleDetectDuplicateEntities(params, context) {
    const { dbManager } = context;
    const entityType = params.entityType && params.entityType !== 'ALL' ? params.entityType : null;
    const checkAliases = params.checkAliases !== undefined ? Boolean(params.checkAliases) : true;

    const duplicateGroups = [];

    // 1. ANOM_001: Same Name Different ID
    const anom001 = Rule01.detect(dbManager, 'query', { entityType: entityType || 'planet' });
    for (const a of anom001) {
      duplicateGroups.push({
        type: 'SAME_NAME_DIFF_ID',
        canonicalName: a.details_json.canonicalName,
        entityType: entityType || 'planet',
        distinctIdCount: a.details_json.distinctIdCount,
        entities: a.details_json.conflictingEntities
      });
    }

    // 2. ANOM_002: Same ID Multiple Entities
    const anom002 = Rule02.detect(dbManager, 'query', {});
    for (const a of anom002) {
      duplicateGroups.push({
        type: 'SAME_ID_MULTI_ENTITY',
        entityId: a.details_json.entityId,
        distinctNameCount: a.details_json.distinctNameCount,
        totalOccurrences: a.details_json.totalOccurrences,
        entities: a.details_json.entities
      });
    }

    // 3. ANOM_008: Alias Collisions
    if (checkAliases) {
      const anom008 = Rule08.detect(dbManager, 'query', {});
      for (const a of anom008) {
        duplicateGroups.push({
          type: 'ALIAS_CROSS_COLLISION',
          aliasName: a.details_json.aliasName,
          distinctEntityCount: a.details_json.distinctEntityCount,
          entities: a.details_json.entities || [a.details_json.aliasEntity, a.details_json.targetEntity].filter(Boolean)
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Detected ${duplicateGroups.length} entity duplicate / collision groups.`
        }
      ],
      details: {
        command: 'DetectDuplicateEntities',
        collisionCount: duplicateGroups.length,
        duplicateGroups
      }
    };
  }

  /**
   * Command 6: DetectLegacyIdConflicts
   * Identifies deprecated identifier conventions and collisions (ANOM_005).
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleDetectLegacyIdConflicts(params, context) {
    const { dbManager } = context;
    const legacyIdPatterns = params.legacyIdPatterns || (params.idPattern ? [params.idPattern] : null);

    const anom005 = Rule05.detect(dbManager, 'query', { legacyIdPatterns });

    const conflicts = anom005.map(a => ({
      legacyId: a.details_json.legacyId || a.details_json.legacyEntity?.entity_id,
      sourceEntity: a.details_json.intendedEntity || a.details_json.legacyEntity,
      collidingEntity: a.details_json.conflictingEntity || a.details_json.modernEntity,
      actionNeeded: a.suggested_action
    }));

    return {
      content: [
        {
          type: 'text',
          text: `Detected ${conflicts.length} legacy ID collision(s).`
        }
      ],
      details: {
        command: 'DetectLegacyIdConflicts',
        conflictCount: conflicts.length,
        conflicts
      }
    };
  }
}

module.exports = DetectionCommands;
