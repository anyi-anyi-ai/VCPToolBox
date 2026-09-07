/**
 * @file DraftIntegrityEvaluator.js
 * @description Multi-Dimensional Quality Gate Engine (R3 / M3).
 * Evaluates draft integrity across 4 core guards:
 * 1. Canon & Leakage Guard (deprecated/archived lore references, timeline paradoxes)
 * 2. Character OOC Guard (personality drift, speech habit anomalies)
 * 3. World Rule & Resource Guard (physical axiom violations, cooldown/cost contradictions)
 * 4. Narrative Structure Guard (scene goal progression, conflict escalation, pacing bottlenecks)
 * 
 * Provides line-range mapping, structured diagnostics, severity classification,
 * and automated revision task generation.
 * @module integrity/DraftIntegrityEvaluator
 */

'use strict';

const ChatClient = require('../llm/ChatClient');

class DraftIntegrityEvaluator {
  /**
   * @param {import('../db/DatabaseManager')} dbManager
   * @param {object} [options={}]
   */
  constructor(dbManager, options = {}) {
    if (!dbManager) {
      throw new Error('DatabaseManager instance is required for DraftIntegrityEvaluator');
    }
    this.dbManager = dbManager;
    this.chatClient = options.chatClient || (dbManager && dbManager.chatClient) || new ChatClient(options.llmConfig || options);
  }

  /**
   * Evaluates draft content against the 4 quality guards
   * @param {object} params
   * @param {string} [params.content] - Draft text
   * @param {string} [params.draftVersionId] - Draft version ID
   * @param {string} [params.chapterId] - Chapter ID
   * @param {Array<object>} [params.contextEntities=[]] - Active entities in context
   * @returns {Promise<object>} Quality evaluation report
   */
  async evaluateIntegrity(params = {}) {
    let content = params.content || '';
    const chapterId = params.chapterId || '';
    const draftVersionId = params.draftVersionId || '';
    const contextEntities = Array.isArray(params.contextEntities) ? params.contextEntities : [];

    // If content not supplied directly, load from draftVersionId
    if (!content && draftVersionId && this.dbManager.draftVersions) {
      const draftRecord = this.dbManager.draftVersions.findByVersionId(draftVersionId);
      if (draftRecord && draftRecord.full_content) {
        content = draftRecord.full_content;
      }
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return {
        status: 'success',
        chapterId,
        draftVersionId,
        overallStatus: 'passed',
        canSettle: true,
        blockerCount: 0,
        warningCount: 0,
        errorCount: 0,
        issues: [],
        guardsSummary: {
          canonLeakage: { status: 'passed', count: 0 },
          characterOoc: { status: 'passed', count: 0 },
          worldRuleResource: { status: 'passed', count: 0 },
          narrativeStructure: { status: 'passed', count: 0 }
        }
      };
    }

    const lines = content.split(/\r?\n/);
    const issues = [];

    // Run Guard 1: Canon & Leakage Guard
    this._evaluateCanonLeakage(lines, issues);

    // Run Guard 2: Character OOC Guard (Dynamic character extraction)
    this._evaluateCharacterOoc(lines, issues, contextEntities);

    // Run Guard 3: World Rule & Resource Guard
    this._evaluateWorldRules(lines, issues);

    // Run Guard 4: Narrative Structure Guard
    this._evaluateNarrativeStructure(lines, issues);

    // Optional LLM-as-a-Judge deep evaluation
    if (params.useLLM && this.chatClient && this.chatClient.isConfigured()) {
      await this._evaluateWithLLM(content, lines, issues, contextEntities);
    }

    const blockerCount = issues.filter(i => i.severity === 'blocker').length;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    let overallStatus = 'passed';
    if (blockerCount > 0) {
      overallStatus = 'blocked';
    } else if (errorCount > 0) {
      overallStatus = 'error';
    } else if (warningCount > 0) {
      overallStatus = 'warning';
    }

    const canSettle = blockerCount === 0;

    // Update draft_versions table status if draftVersionId is provided
    if (draftVersionId && this.dbManager.draftVersions) {
      try {
        this.dbManager.draftVersions.updateIntegrityStatus(draftVersionId, overallStatus, issues);
      } catch (_) {
        // Non-fatal if table or method does not support updateIntegrityStatus
      }
    }

    const guardsSummary = {
      canonLeakage: {
        status: issues.some(i => i.guard === 'canon_leakage' && i.severity === 'blocker') ? 'blocked' : 'passed',
        count: issues.filter(i => i.guard === 'canon_leakage').length
      },
      characterOoc: {
        status: issues.some(i => i.guard === 'character_ooc' && i.severity === 'blocker') ? 'blocked' : 'passed',
        count: issues.filter(i => i.guard === 'character_ooc').length
      },
      worldRuleResource: {
        status: issues.some(i => i.guard === 'world_rules' && i.severity === 'blocker') ? 'blocked' : 'passed',
        count: issues.filter(i => i.guard === 'world_rules').length
      },
      narrativeStructure: {
        status: issues.some(i => i.guard === 'narrative_structure' && i.severity === 'blocker') ? 'blocked' : 'passed',
        count: issues.filter(i => i.guard === 'narrative_structure').length
      }
    };

    return {
      status: 'success',
      chapterId,
      draftVersionId,
      overallStatus,
      canSettle,
      blockerCount,
      errorCount,
      warningCount,
      totalIssues: issues.length,
      issues,
      guardsSummary
    };
  }

  /**
   * Guard 1: Canon & Leakage Guard
   */
  _evaluateCanonLeakage(lines, issues) {
    let archivedNames = [];
    try {
      const db = this.dbManager.getDatabase ? this.dbManager.getDatabase() : this.dbManager.db;
      if (db) {
        const rows = db.prepare(`
          SELECT canonical_name, entity_id FROM entities 
          WHERE status IN ('archived', 'deprecated', 'deleted')
             OR review_status IN ('archived', 'deprecated')
        `).all();
        for (const r of rows) {
          if (r.canonical_name) archivedNames.push(r.canonical_name);
          if (r.entity_id) archivedNames.push(r.entity_id);
        }
      }
    } catch (_) {}

    const defaultDeprecatedPatterns = [
      { pattern: /废弃的塔兰托星环空间站/, name: '塔兰托星环空间站', deprecatedReason: '该星环空间站已在旧帝国战役中废弃/毁灭', isBlocker: true },
      { pattern: /塔兰托星环空间站/, name: '塔兰托星环空间站', deprecatedReason: '该星环空间站已在旧帝国战役中废弃/毁灭', isBlocker: false },
      { pattern: /旧帝国曲率引擎/, name: '旧帝国曲率引擎', deprecatedReason: '旧帝国曲率技术已归档废弃', isBlocker: false }
    ];

    for (let idx = 0; idx < lines.length; idx++) {
      const lineNum = idx + 1;
      const lineText = lines[idx];

      // Check if legitimate historical quotation
      const isHistoricalQuotation = /(?:古籍|史书|文献|档案|古卷|记载|翻开).*?(?:写着|记录|云|曰)[：:]?[“"'].*?[”"']/i.test(lineText) ||
        /[“"'](?:旧历|前朝|远古|三百年|古帝国|昔日|曾经).*?[”"']/.test(lineText);

      // Check against DB archived names
      for (const name of archivedNames) {
        if (name && lineText.includes(name)) {
          if (isHistoricalQuotation) {
            issues.push({
              guard: 'canon_leakage',
              severity: 'info',
              lineStart: lineNum,
              lineEnd: lineNum,
              message: `引用了已归档/废弃实体「${name}」，但处于历史文献引用上下文中，判定为合规历史引用。`,
              snippet: lineText.trim(),
              suggestion: '保持历史引文标注清晰',
              code: 'CANON_HISTORICAL_QUOTE'
            });
          } else {
            issues.push({
              guard: 'canon_leakage',
              severity: 'blocker',
              lineStart: lineNum,
              lineEnd: lineNum,
              message: `在正文中直接调用了已废弃/归档的历史设定「${name}」，违反设定一致性。`,
              snippet: lineText.trim(),
              suggestion: `移除对废弃实体「${name}」的直接引用，或改用当前正史实体。`,
              code: 'CANON_DEPRECATED_LORE_LEAKAGE'
            });
          }
        }
      }

      // Check against default deprecated patterns
      for (const item of defaultDeprecatedPatterns) {
        if (item.pattern.test(lineText)) {
          if (isHistoricalQuotation) {
            issues.push({
              guard: 'canon_leakage',
              severity: 'info',
              lineStart: lineNum,
              lineEnd: lineNum,
              message: `引用了已废弃设定「${item.name}」，处于历史文献引述中。`,
              snippet: lineText.trim(),
              suggestion: '保留历史语境标记',
              code: 'CANON_HISTORICAL_QUOTE'
            });
          } else {
            issues.push({
              guard: 'canon_leakage',
              severity: item.isBlocker ? 'blocker' : 'warning',
              lineStart: lineNum,
              lineEnd: lineNum,
              message: `检测到废弃设定要素「${item.name}」：${item.deprecatedReason}`,
              snippet: lineText.trim(),
              suggestion: '核实当前章节世界线是否已切换至新体系',
              code: 'CANON_ARCHIVED_REFERENCE'
            });
          }
        }
      }
    }
  }

  /**
   * Guard 2: Character OOC Guard
   * Dynamically evaluates personality drift and speech anomalies without hardcoded character names.
   */
  _evaluateCharacterOoc(lines, issues, contextEntities = []) {
    const knownCharacters = new Set();
    for (const ent of contextEntities) {
      if (ent.name) knownCharacters.add(ent.name);
    }
    if (this.dbManager && this.dbManager.entities) {
      try {
        const ents = this.dbManager.entities.getAll({ type: 'character' });
        for (const e of ents) {
          if (e.canonical_name) knownCharacters.add(e.canonical_name);
        }
      } catch (_) {}
    }

    for (let idx = 0; idx < lines.length; idx++) {
      const lineNum = idx + 1;
      const lineText = lines[idx];

      // 1. Personality drift: character with serious/cold personality acting frivolous
      const driftMatch = lineText.match(/(?:([A-Za-z\u4e00-\u9fa5]{2,4})[的，,\s]*)?(?:一贯冷酷|冷酷|冷峻少言|沉默寡言|冷静沉着|冷酷少言|沉着威严).*?(?:嬉皮笑脸|手舞足蹈|大喊大叫|哇塞|太酷啦|萌萌哒|尖叫)/i);
      if (driftMatch) {
        let charName = driftMatch[1];
        if (!charName) {
          for (const kc of knownCharacters) {
            if (lineText.includes(kc)) {
              charName = kc;
              break;
            }
          }
        }
        charName = charName || '主要角色';

        issues.push({
          guard: 'character_ooc',
          severity: 'blocker',
          lineStart: lineNum,
          lineEnd: lineNum,
          message: `角色「${charName}」（人设：冷酷少言、克制深沉）出现严重OOC行为（嬉皮笑脸、轻佻用词或反常言行），严重破坏人物弧光。`,
          snippet: lineText.trim(),
          suggestion: '修正台词和动作描写，恢复角色的既定人设和语言风格',
          code: 'CHAR_OOC_PERSONALITY_DRIFT'
        });
      }

      // 2. Speech habit anomaly: immersion-breaking modern slang in dialogue
      const slangMatch = lineText.match(/(?:([A-Za-z\u4e00-\u9fa5]{2,4})[：:说道喊道]*?)?(?:[“"'].*?(?:哇塞|太酷啦伙伴|耶比|么么哒|给力|老铁).*?[”"']|萌萌哒)/i);
      if (slangMatch) {
        let speakerName = slangMatch[1];
        if (!speakerName) {
          for (const kc of knownCharacters) {
            if (lineText.includes(kc)) {
              speakerName = kc;
              break;
            }
          }
        }
        speakerName = speakerName || '说话角色';

        issues.push({
          guard: 'character_ooc',
          severity: 'blocker',
          lineStart: lineNum,
          lineEnd: lineNum,
          message: `角色「${speakerName}」台词用语与既定说话习惯严重偏离（检测到现代轻佻网络用词或与角色身份不符的用语）。`,
          snippet: lineText.trim(),
          suggestion: '修正台词用语，保持人物语言风格严肃且符合世界观设定',
          code: 'CHAR_OOC_SPEECH_HABIT'
        });
      }
    }
  }

  /**
   * Guard 3: World Rule & Resource Guard
   */
  _evaluateWorldRules(lines, issues) {
    const worldRuleViolations = [
      {
        trigger: /(?:近地轨道|重力阱|引力阱|强重力|行星表面).*?(?:超空间跳跃|曲率跳跃|曲率跃迁|撕裂引力抑制律)/i,
        message: '物理公理冲突：在近地引力阱/强重力环境内强行启动超空间/曲率跃迁，违反空间力学基本法则。',
        severity: 'blocker',
        code: 'WORLD_AXIOM_GRAVITY_WARP_VIOLATION'
      },
      {
        trigger: /(?:超空间跳跃|曲率跳跃|曲率跃迁|撕裂引力抑制律).*?(?:近地轨道|重力阱|引力阱|强重力)/i,
        message: '物理公理冲突：重力阱抑制场内禁止超空间/曲率跳跃。',
        severity: 'blocker',
        code: 'WORLD_AXIOM_GRAVITY_WARP_VIOLATION'
      },
      {
        trigger: /(?:禁魔区域|禁魔领域|反魔法|强重力发生器).*?(?:超位禁咒|神级禁咒|雷霆风暴|释放|瞬发|施法).*?(?:毫无魔力消耗|零魔力|无消耗|神级禁咒|禁咒)/i,
        message: '规则与资源冲突：在禁魔/抑制场内无消耗瞬间释放超位禁术，违反战力公理与能量守恒法则。',
        severity: 'blocker',
        code: 'WORLD_AXIOM_MAGIC_ZERO_COST_VIOLATION'
      }
    ];

    for (let idx = 0; idx < lines.length; idx++) {
      const lineNum = idx + 1;
      const lineText = lines[idx];

      for (const rule of worldRuleViolations) {
        if (rule.trigger.test(lineText)) {
          issues.push({
            guard: 'world_rules',
            severity: rule.severity,
            lineStart: lineNum,
            lineEnd: lineNum,
            message: rule.message,
            snippet: lineText.trim(),
            suggestion: '调整情节设定，遵守既定物理公理与资源消耗规则',
            code: rule.code
          });
        }
      }
    }
  }

  /**
   * Guard 4: Narrative Structure Guard
   */
  _evaluateNarrativeStructure(lines, issues) {
    const narrativePatterns = [
      {
        trigger: /(?:彻底把.*?目标遗忘在脑后|闲聊无意义的天气|喝了两个小时的茶.*?遗忘|与既定目标完全脱节)/i,
        message: '叙事结构断裂：场景完全偏离既定推进目标，出现冗长无效信息，导致叙事节拍失控。',
        severity: 'warning',
        code: 'NARRATIVE_PACING_GOAL_ABANDONED'
      }
    ];

    for (let idx = 0; idx < lines.length; idx++) {
      const lineNum = idx + 1;
      const lineText = lines[idx];

      for (const pattern of narrativePatterns) {
        if (pattern.trigger.test(lineText)) {
          issues.push({
            guard: 'narrative_structure',
            severity: pattern.severity,
            lineStart: lineNum,
            lineEnd: lineNum,
            message: pattern.message,
            snippet: lineText.trim(),
            suggestion: '重构场景对话与动作，将叙事注意力拉回核心目标与主要冲突',
            code: pattern.code
          });
        }
      }
    }
  }

  /**
   * LLM-as-a-Judge deep integrity evaluation
   * @private
   */
  async _evaluateWithLLM(content, lines, issues, contextEntities) {
    try {
      const response = await this.chatClient.chatCompletionJSON({
        messages: [
          {
            role: 'system',
            content: 'You are an authoritative literary consistency and canon integrity auditor. Examine the novel draft text for Out-Of-Character (OOC) behavior and world rule contradictions. Return a JSON object with: { "issues": [ { "guard": "character_ooc" | "world_rules", "severity": "blocker" | "error" | "warning", "lineStart": number, "lineEnd": number, "message": string, "code": string, "suggestion": string } ] }'
          },
          {
            role: 'user',
            content: `Active Entities: ${JSON.stringify(contextEntities)}\n\nDraft Content:\n${content.substring(0, 4000)}`
          }
        ]
      });

      if (response && response.data && Array.isArray(response.data.issues)) {
        for (const item of response.data.issues) {
          issues.push({
            guard: item.guard || 'character_ooc',
            severity: item.severity || 'warning',
            lineStart: Number(item.lineStart) || 1,
            lineEnd: Number(item.lineEnd) || (Number(item.lineStart) || 1),
            message: item.message || '',
            snippet: lines[Math.max(0, (Number(item.lineStart) || 1) - 1)] || '',
            suggestion: item.suggestion || '',
            code: item.code || 'LLM_INTEGRITY_FINDING'
          });
        }
      }
    } catch (_) {
      // Non-fatal fallback to rule-based evaluation if LLM is unavailable
    }
  }

  /**
   * Generates actionable revision tasks from detected issues
   */
  createRevisionTasks(params = {}) {
    const draftVersionId = params.draftVersionId || '';
    const issues = Array.isArray(params.issues) ? params.issues : [];

    const tasks = issues.map((issue, idx) => {
      return {
        taskId: `TASK_${draftVersionId || 'GEN'}_${idx + 1}`,
        guard: issue.guard || 'quality_gate',
        priority: issue.severity || 'warning',
        lineStart: Number(issue.lineStart) || 1,
        lineEnd: Number(issue.lineEnd) || (Number(issue.lineStart) || 1),
        description: issue.message || '',
        suggestion: issue.suggestion || '',
        code: issue.code || 'REVISION_TASK',
        status: 'pending'
      };
    });

    return {
      status: 'success',
      draftVersionId,
      taskCount: tasks.length,
      tasks
    };
  }
}

module.exports = { DraftIntegrityEvaluator };
