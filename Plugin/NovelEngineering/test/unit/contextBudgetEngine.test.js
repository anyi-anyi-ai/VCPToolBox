/**
 * @file contextBudgetEngine.test.js
 * @description Comprehensive unit tests for ContextBudgetEngine (11-Level Priority Cascade & Budget Edge Cases).
 * @module test/unit/contextBudgetEngine
 * @license MIT
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const ContextBudgetEngine = require('../../src/collaboration/ContextBudgetEngine');

describe('Phase 4 Milestone 2: ContextBudgetEngine Test Suite', () => {
  describe('1. Multilingual Token Estimation Accuracy', () => {
    it('should accurately estimate tokens for CJK Chinese text', () => {
      const text = '灰港星是流浪舰队停泊的重要枢纽港口。'; // 18 CJK characters
      const tokens = ContextBudgetEngine.estimateTokens(text);
      assert.ok(tokens >= 15 && tokens <= 25, `Expected ~18 tokens, got ${tokens}`);
    });

    it('should estimate tokens for English text and complex JSON objects', () => {
      const text = 'The gray port star was a crucial orbital hub for the fleet.';
      const tokens = ContextBudgetEngine.estimateTokens(text);
      assert.ok(tokens >= 10 && tokens <= 25, `Expected ~14 tokens, got ${tokens}`);

      const obj = { title: 'Chapter 1', words: 500, details: { location: 'Alpha', depth: 3 } };
      assert.ok(ContextBudgetEngine.estimateTokens(obj) > 0);
    });

    it('EDGE-07: Multilingual, Russian, Emojis, Code Blocks & Deterministic Estimation', () => {
      const mixed = '🌌 Deep Space 探索: Привет мир! const x = 42; /* 注释 */';
      const tokens = ContextBudgetEngine.estimateTokens(mixed);
      assert.ok(tokens > 0, 'Estimated tokens for mixed content must be > 0');

      assert.strictEqual(ContextBudgetEngine.estimateTokens(''), 0);
      assert.strictEqual(ContextBudgetEngine.estimateTokens(null), 0);
      assert.strictEqual(ContextBudgetEngine.estimateTokens(undefined), 0);
    });
  });

  describe('2. 11-Level Priority Cascade Trimming (TRIM-01 to TRIM-11)', () => {
    it('TRIM-00: should NOT trim context when token count is below budget ceiling', () => {
      const context = {
        authorDirectives: [{ directive: '写一段灰港星的夜景' }],
        canonFacts: [{ canonicalName: '灰港星', content: '行星设定' }],
        semanticCandidates: [{ title: '参考资料', content: '小酒馆' }]
      };

      const result = ContextBudgetEngine.trimContext(context, 10000);
      assert.strictEqual(result.contextBudget.trimmed, false);
      assert.strictEqual(result.contextBudget.omittedSections.length, 0);
      assert.strictEqual(result.contextBudget.omittedSourceCount, 0);
      assert.strictEqual(result.semanticCandidates.length, 1);
    });

    it('TRIM-01: Priority 11 (extended materials) trimmed first', () => {
      const context = {
        authorDirectives: [{ directive: '必须保持主角冷静' }],
        canonFacts: [{ canonicalName: '灰港星', content: '核心设定' }],
        semanticCandidates: [
          { title: '高优创意', priority: 10, content: '重要线索'.repeat(30) },
          { title: '低优扩展', priority: 11, content: '无关杂项'.repeat(50) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 120);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('extendedMaterials'));
      assert.ok(result.contextBudget.omittedSourceCount > 0);
    });

    it('TRIM-02: Priority 10 (semantic candidates) trimmed and candidate warning attached', () => {
      const context = {
        authorDirectives: [{ directive: '作者指令'.repeat(10) }],
        canonFacts: [{ canonicalName: '灰港星', content: '核心设定'.repeat(10) }],
        semanticCandidates: [
          { title: '参考资料A', priority: 10, content: '资料A'.repeat(80) },
          { title: '参考资料B', priority: 10, content: '资料B'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 100);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('semanticCandidates'));
      assert.ok(result.warnings.some(w => w.includes('部分候选资料未装入上下文')));
    });

    it('TRIM-03: HARD CONSTRAINT - Priority 9 (conflicts/unresolved) must attach structured omission metadata and warning', () => {
      const context = {
        authorDirectives: [{ directive: '重要作者指令'.repeat(50) }],
        conflicts: [{ anomalyCode: 'ANOM_001', message: '严重设定冲突'.repeat(30) }],
        unresolved: [{ threadKey: 'TH_01', description: '未决伏笔'.repeat(30) }]
      };

      const result = ContextBudgetEngine.trimContext(context, 80);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('conflicts') || result.contextBudget.omittedSections.includes('unresolved'));
      assert.ok(result.contextBudget.omittedSourceCount > 0);
      assert.ok(result.warnings.some(w => w.includes('部分冲突与未决设定因Token预算受限已被裁剪，请参考元数据')));
    });

    it('TRIM-04: Priority 8 (reviewed memories) trimmed after candidates and conflicts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [{ canonicalName: '事实', content: '设定' }],
        reviewedMemories: [
          { memoryId: 'mem_1', priority: 8, content: '长篇旧记忆'.repeat(100) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('reviewedMemories'));
      assert.strictEqual(result.reviewedMemories.length, 0);
    });

    it('TRIM-05: Priority 7 (active foreshadowing) trimmed from canonFacts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [
          { id: 1, canonicalName: '规则', category: 'world_rule', canonLevel: 3, content: '公理' },
          { id: 2, canonicalName: '伏笔', category: 'foreshadowing', priority: 7, content: '伏笔线索'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('activeForeshadowing'));
      assert.ok(!result.canonFacts.some(f => f.category === 'foreshadowing'));
    });

    it('TRIM-06: Priority 6 (timeline window) trimmed from canonFacts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [
          { id: 1, canonicalName: '规则', category: 'world_rule', canonLevel: 3, content: '公理' },
          { id: 2, canonicalName: '时间线事件', category: 'timeline', priority: 6, content: '事件细节'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('timelineWindow'));
      assert.ok(!result.canonFacts.some(f => f.category === 'timeline'));
    });

    it('TRIM-07: Priority 5 (character states) trimmed from canonFacts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [
          { id: 1, canonicalName: '核心规则', category: 'world_rule', canonLevel: 3, content: '公理' },
          { id: 2, canonicalName: '角色甲', category: 'character', priority: 5, content: '角色背景'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('characterStates'));
      assert.ok(!result.canonFacts.some(f => f.category === 'character'));
    });

    it('TRIM-08: Priority 4 (focused canon archives) trimmed from canonFacts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [
          { id: 1, canonicalName: '核心规则', category: 'world_rule', canonLevel: 3, content: '公理' },
          { id: 2, canonicalName: '行星档案', category: 'planet', canonLevel: 2, priority: 4, content: '行星详细数据'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('focusedCanonArchives'));
      assert.ok(!result.canonFacts.some(f => f.canonLevel < 3 && f.category !== 'world_rule'));
    });

    it('TRIM-09: Priority 3 (preceding chapter facts) trimmed from canonFacts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [
          { id: 1, canonicalName: '核心规则', category: 'world_rule', canonLevel: 3, content: '公理' },
          { id: 2, title: '第1章', category: 'chapter', isCurrentChapter: false, priority: 3, content: '第1章内容'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('chapterFacts'));
      assert.ok(!result.canonFacts.some(f => f.category === 'chapter' && !f.isCurrentChapter));
    });

    it('TRIM-10: Priority 2 (scoped world rules) trimmed from canonFacts', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [
          { id: 1, title: '全局硬规则', category: 'world_rule', ruleScope: 'global', content: '不可违反公理' },
          { id: 2, title: '区域局部规则', category: 'world_rule', ruleScope: 'scoped', content: '局部重力异常'.repeat(80) }
        ]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.trimmed, true);
      assert.ok(result.contextBudget.omittedSections.includes('worldRulesScoped'));
      assert.ok(!result.canonFacts.some(f => f.category === 'world_rule' && f.ruleScope === 'scoped'));
    });

    it('TRIM-11: HARD CONSTRAINT - Priority 1 (authorDirectives) must NEVER be trimmed even under extreme starvation', () => {
      const hugeDirective = '必须绝对遵循的作者最高指令。'.repeat(100);
      const context = {
        authorDirectives: [{ directive: hugeDirective, priority: 1 }],
        canonFacts: [{ canonicalName: '测试', content: '测试内容' }],
        semanticCandidates: [{ title: '候选', content: '候选内容'.repeat(50) }]
      };

      const result = ContextBudgetEngine.trimContext(context, 10);
      assert.strictEqual(result.authorDirectives.length, 1);
      assert.strictEqual(result.authorDirectives[0].directive, hugeDirective);
      assert.strictEqual(result.contextBudget.trimmed, true);
    });
  });

  describe('3. Budget Boundary Edge Cases (EDGE-01 to EDGE-06)', () => {
    it('EDGE-01: Zero maxTokens clamps budget gracefully', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        semanticCandidates: [{ content: '候选资料' }]
      };

      const result = ContextBudgetEngine.trimContext(context, 0);
      assert.strictEqual(result.contextBudget.maxTokens, 100);
      assert.strictEqual(result.authorDirectives.length, 1);
    });

    it('EDGE-02: Negative maxTokens clamps budget gracefully', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        semanticCandidates: [{ content: '候选资料' }]
      };

      const result = ContextBudgetEngine.trimContext(context, -500);
      assert.strictEqual(result.contextBudget.maxTokens, 100);
      assert.strictEqual(result.authorDirectives.length, 1);
    });

    it('EDGE-03: Tiny maxTokens (50) preserves author directives', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        semanticCandidates: [{ content: '候选资料'.repeat(50) }]
      };

      const result = ContextBudgetEngine.trimContext(context, 50);
      assert.strictEqual(result.contextBudget.maxTokens, 50);
      assert.strictEqual(result.authorDirectives.length, 1);
      assert.strictEqual(result.contextBudget.trimmed, true);
    });

    it('EDGE-04: Huge maxTokens (1000000) does not trigger trimming', () => {
      const context = {
        authorDirectives: [{ directive: '指令' }],
        canonFacts: [{ content: '设定' }]
      };

      const result = ContextBudgetEngine.trimContext(context, 1000000);
      assert.strictEqual(result.contextBudget.trimmed, false);
      assert.strictEqual(result.contextBudget.omittedSections.length, 0);
      assert.strictEqual(result.contextBudget.omittedSourceCount, 0);
    });

    it('EDGE-05: Exact token fit does not trigger trimming', () => {
      const context = {
        authorDirectives: [{ directive: '精确匹配' }]
      };
      const exactTokens = ContextBudgetEngine.estimateTokens(context);

      const result = ContextBudgetEngine.trimContext(context, exactTokens);
      assert.strictEqual(result.contextBudget.trimmed, false);
    });

    it('EDGE-06: Empty payload parameters handle safely', () => {
      const result = ContextBudgetEngine.trimContext({});
      assert.strictEqual(result.contextBudget.trimmed, false);
      assert.strictEqual(result.authorDirectives.length, 0);
      assert.strictEqual(result.canonFacts.length, 0);
      assert.strictEqual(result.contextBudget.maxTokens, 30000);
    });
  });
});
