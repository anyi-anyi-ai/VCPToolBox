/**
 * @file memoryCollaboration.test.js
 * @description Unit tests for SuggestMemoryUpdate (R7) and VCPMemoryPublisher (R4).
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const SuggestMemoryUpdate = require('../../src/collaboration/SuggestMemoryUpdate');
const VCPMemoryPublisher = require('../../src/collaboration/VCPMemoryPublisher');

describe('Phase 4 Milestone 2: Memory Collaboration Test Suite', () => {
  describe('1. SuggestMemoryUpdate (R7)', () => {
    it('should propose structured DailyNote updates before author confirmation', () => {
      const suggestEngine = new SuggestMemoryUpdate();
      const draftContent = '# 第3章 灰港夜色\n\n灰港星的空港在深夜依然繁忙。李林注视着舷窗外的飞船队列。';

      const result = suggestEngine.suggestUpdates({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        draftContent,
        snapshotContext: {
          canonFacts: [{ entityId: 'hui_gang', canonicalName: '灰港星' }]
        }
      });

      assert.ok(result.requestId);
      assert.strictEqual(result.requiresApproval, true);
      assert.ok(result.suggestions.length >= 1);

      const chapterSummary = result.suggestions.find(s => s.memoryType === 'chapter_summary');
      assert.ok(chapterSummary);
      assert.strictEqual(chapterSummary.status, 'proposed');
      assert.strictEqual(chapterSummary.requiresApproval, true);
    });
  });

  describe('2. VCPMemoryPublisher (R4)', () => {
    it('should emit standardized memory envelope JSON with SHA-256 integrity hash', () => {
      const publisher = new VCPMemoryPublisher();
      const envelope = publisher.publishMemories({
        projectId: '流浪',
        chapterId: 'Vol1_Ch03',
        memories: [
          {
            memoryType: 'chapter_summary',
            title: 'Vol1_Ch03 梗概',
            content: '李林抵达灰港星并接洽联络人。',
            tags: ['灰港星', 'Vol1_Ch03']
          }
        ]
      });

      assert.strictEqual(envelope.envelopeVersion, '1.0');
      assert.strictEqual(envelope.publisher, 'NovelEngineering');
      assert.strictEqual(envelope.status, 'EMITTED_FOR_VCP_CONSUMPTION');
      assert.ok(envelope.payloadSha256 && envelope.payloadSha256.length === 64);
      assert.strictEqual(envelope.totalMemories, 1);
      assert.strictEqual(envelope.memories[0].requiresApproval, false);
    });
  });
});
