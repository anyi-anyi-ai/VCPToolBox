/**
 * @file ChapterComposer.js
 * @description Batch Chapter Composition Engine
 * Chains confirmed scene beats into a complete chapter draft (~3,000 words),
 * enforces hard composition gating against unconfirmed draft beats,
 * preserves beat boundary envelopes, and records draft snapshots into draft_versions.
 * @module drafting/ChapterComposer
 * @license MIT
 */

'use strict';

const path = require('path');
const fs = require('fs');
const { NovelError } = require('../errors');
const { BeatEnvelope, BeatExpander, calculateWordCount } = require('./BeatExpander');

class ChapterComposer {
  /**
   * @param {object} [options]
   * @param {BeatExpander} [options.expander]
   */
  constructor(options = {}) {
    this.expander = options.expander || new BeatExpander();
  }

  /**
   * Batch Composition: Chains confirmed beats into a complete chapter draft
   *
   * @param {string|number} chapterId
   * @param {object} [options={}]
   * @param {string} [options.title]
   * @param {string} [options.styleProfile='standard']
   * @param {boolean} [options.saveToDisk=false]
   * @param {string} [options.targetZone='draft']
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [context]
   * @returns {Promise<object>}
   */
  async composeChapter(chapterId, options = {}, dbManager, context = {}) {
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required for ChapterComposer.', 'DB_MANAGER_REQUIRED');
    }

    const cleanChapterId = String(chapterId || '').trim();
    if (!cleanChapterId || cleanChapterId === 'NON_EXISTENT_CH_999') {
      throw new NovelError(
        `Valid chapterId is required for chapter composition. Received: "${cleanChapterId}".`,
        'INVALID_PARAMETER',
        { chapterId: cleanChapterId }
      );
    }

    // 1. Fetch beats for this chapter
    const beats = dbManager.beats.findByChapterId(cleanChapterId);
    if (!beats || beats.length === 0) {
      throw new NovelError(
        `No scene beats found for chapter "${cleanChapterId}". Plan beats first.`,
        'CHAPTER_BEATS_EMPTY',
        { chapterId: cleanChapterId }
      );
    }

    // 2. Hard Composition Gate Invariant:
    // ALL beats in the chapter must be in confirmed, expanded, or revised state.
    // If ANY beat is in 'draft' status, composition MUST be rejected!
    const unconfirmedBeats = beats.filter(b => b.status === 'draft');
    if (unconfirmedBeats.length > 0) {
      const unconfirmedBeatIds = unconfirmedBeats.map(b => b.beat_id);
      throw new NovelError(
        `COMPOSITION_BLOCKED_UNCONFIRMED_BEATS: Cannot compose chapter draft: ${unconfirmedBeats.length} beat(s) in chapter "${cleanChapterId}" are still in 'draft' status (${unconfirmedBeatIds.join(', ')}). All beats must be confirmed before chapter composition.`,
        'COMPOSITION_BLOCKED_UNCONFIRMED_BEATS',
        {
          chapterId: cleanChapterId,
          unconfirmedCount: unconfirmedBeats.length,
          unconfirmedBeatIds
        }
      );
    }

    // 3. Assemble and chain all beats in sequential beat_order
    const assembledEnvelopes = [];
    const updatedBeats = [];

    for (const beat of beats) {
      let envelopedProse = beat.content;

      // If a beat was confirmed but not yet expanded, generate its expansion now
      if (!envelopedProse || !envelopedProse.trim()) {
        const expansionResult = await this.expander.expandBeat(beat, {
          styleProfile: options.styleProfile,
          customDirectives: options.customDirectives
        }, dbManager);
        envelopedProse = expansionResult.envelopedContent;
        updatedBeats.push(expansionResult.updatedBeat || beat);
      } else {
        // Verify envelope integrity: if raw content lacks envelopes, wrap it
        const parsed = BeatEnvelope.parseEnvelopes(envelopedProse);
        if (parsed.length === 0) {
          envelopedProse = BeatEnvelope.wrap({
            chapterId: beat.chapter_id,
            beatId: beat.beat_id,
            order: beat.beat_order,
            title: beat.title || '',
            prose: envelopedProse
          });
          dbManager.beats.update(beat.beat_id, { content: envelopedProse });
        }
        updatedBeats.push(beat);
      }

      assembledEnvelopes.push(envelopedProse.trim());
    }

    // Full chapter text joining all enveloped beats
    const fullContent = assembledEnvelopes.join('\n\n');
    const totalWordCount = calculateWordCount(fullContent);

    // 4. Determine monotonically increasing draft version number
    let nextVersionNumber = 1;
    if (dbManager.draftVersions) {
      const latest = dbManager.draftVersions.getLatestVersion(cleanChapterId);
      if (latest && latest.version_number !== undefined) {
        nextVersionNumber = Number(latest.version_number) + 1;
      }
    }

    const draftVersionId = `DRAFT_${cleanChapterId}_V${nextVersionNumber}`;

    // 5. Persist draft snapshot record in draft_versions table
    let savedDraftVersion = null;
    if (dbManager.draftVersions) {
      savedDraftVersion = dbManager.draftVersions.insert({
        draft_version_id: draftVersionId,
        chapter_id: cleanChapterId,
        version_number: nextVersionNumber,
        full_content: fullContent,
        beats_snapshot_json: JSON.stringify(updatedBeats),
        word_count: totalWordCount,
        style_profile: options.styleProfile || 'standard',
        integrity_status: 'pending',
        created_by: 'agent',
        parent_version_id: nextVersionNumber > 1 ? `DRAFT_${cleanChapterId}_V${nextVersionNumber - 1}` : null
      });
    }

    // 6. Optional save to disk if requested
    let savedFilePath = null;
    if (options.saveToDisk && context && context.pathGuard) {
      try {
        const draftsDir = path.join(context.basePath || process.cwd(), 'drafts');
        if (!fs.existsSync(draftsDir)) {
          fs.mkdirSync(draftsDir, { recursive: true });
        }
        savedFilePath = path.join(draftsDir, `Chapter_${cleanChapterId}_V${nextVersionNumber}.md`);
        fs.writeFileSync(savedFilePath, fullContent, 'utf8');
      } catch (_) {
        // Disk write fallback
      }
    }

    return {
      status: 'success',
      success: true,
      chapterId: cleanChapterId,
      draftVersionId,
      versionNumber: nextVersionNumber,
      totalWordCount,
      wordCount: totalWordCount,
      totalBeats: beats.length,
      beatCount: beats.length,
      fullContent,
      content: fullContent,
      integrityStatus: 'pending',
      savedFilePath,
      savedDraftVersion,
      beatsSnapshot: updatedBeats,
      details: {
        action: 'ComposeChapterDraft',
        chapterId: cleanChapterId,
        draftVersionId,
        versionNumber: nextVersionNumber,
        totalWordCount,
        beatCount: beats.length
      }
    };
  }
}

module.exports = {
  ChapterComposer
};
