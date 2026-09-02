/**
 * @file DebtCommands.js
 * @description Command Handlers for Phase 5 Narrative Debt Tracking & Micro-Payoffs
 * Implements ManageNarrativeDebt (create, accrue, pay, query, summary) and RecordMicroPayoff
 * @module commands/DebtCommands
 * @license MIT
 */

'use strict';

const { NovelError } = require('../errors');

class DebtCommands {
  /**
   * Command: ManageNarrativeDebt
   * Actions: create, accrue, pay, query, summary
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleManageNarrativeDebt(params = {}, context = {}) {
    const { dbManager } = context;

    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for ManageNarrativeDebt.');
    }

    const action = params.action ? String(params.action).trim().toLowerCase() : '';
    if (!action) {
      throw new NovelError('ManageNarrativeDebt requires a valid "action" parameter (create, accrue, pay, query, summary).');
    }

    switch (action) {
      case 'create':
        return DebtCommands._handleCreate(params, dbManager);

      case 'accrue':
        return DebtCommands._handleAccrue(params, dbManager);

      case 'pay':
        return DebtCommands._handlePay(params, dbManager);

      case 'query':
        return DebtCommands._handleQuery(params, dbManager);

      case 'summary':
        return DebtCommands._handleSummary(params, dbManager);

      default:
        throw new NovelError(
          `Unsupported action "${params.action}" for ManageNarrativeDebt. Supported actions: create, accrue, pay, query, summary.`
        );
    }
  }

  /**
   * Action: create
   * @private
   */
  static async _handleCreate(params, dbManager) {
    const title = params.title;
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new NovelError('title is required for narrative debt creation');
    }

    const borrowedChapter = params.borrowedChapter !== undefined && params.borrowedChapter !== null
      ? Number(params.borrowedChapter)
      : (params.borrowed_chapter !== undefined && params.borrowed_chapter !== null ? Number(params.borrowed_chapter) : 1);

    if (isNaN(borrowedChapter)) {
      throw new NovelError('Invalid borrowedChapter: must be a number');
    }

    const targetPayoffChapterRaw = params.targetPayoffChapter !== undefined && params.targetPayoffChapter !== null
      ? params.targetPayoffChapter
      : params.target_payoff_chapter;

    if (targetPayoffChapterRaw !== undefined && targetPayoffChapterRaw !== null && targetPayoffChapterRaw !== '') {
      const targetPayoffChapter = Number(targetPayoffChapterRaw);
      if (isNaN(targetPayoffChapter) || targetPayoffChapter <= borrowedChapter) {
        throw new NovelError(
          `Invalid targetPayoffChapter (${targetPayoffChapterRaw}): target payoff chapter must be greater than borrowed chapter (${borrowedChapter})`
        );
      }
    }

    const basePrincipalRaw = params.basePrincipal !== undefined && params.basePrincipal !== null
      ? params.basePrincipal
      : (params.base_principal !== undefined && params.base_principal !== null ? params.base_principal : params.principal);

    if (basePrincipalRaw !== undefined && basePrincipalRaw !== null) {
      const basePrincipal = Number(basePrincipalRaw);
      if (isNaN(basePrincipal) || basePrincipal <= 0) {
        throw new NovelError(`Invalid basePrincipal (${basePrincipalRaw}): base principal must be a positive number greater than 0`);
      }
    }

    const createdDebt = dbManager.narrativeDebts.createDebt(params);

    return {
      success: true,
      debtId: createdDebt.debtId,
      debt: createdDebt,
      content: [
        {
          type: 'text',
          text: `Narrative debt created successfully: [${createdDebt.debtId}] "${createdDebt.title}" (${createdDebt.debtType}, balance: ${createdDebt.currentBalance}).`
        }
      ],
      details: {
        command: 'ManageNarrativeDebt',
        action: 'create',
        debtId: createdDebt.debtId,
        debt: createdDebt
      }
    };
  }

  /**
   * Action: accrue
   * @private
   */
  static async _handleAccrue(params, dbManager) {
    const currentChapter = params.currentChapter !== undefined && params.currentChapter !== null
      ? Number(params.currentChapter)
      : (params.chapter !== undefined && params.chapter !== null ? Number(params.chapter) : 1);

    const overdueMultiplier = params.overdueMultiplier;
    const projectId = params.projectId || params.project_id;

    // Determine the minimum starting chapter needing accrual up to currentChapter
    const db = dbManager.getDatabase ? dbManager.getDatabase() : dbManager.db;
    let minRow = null;
    try {
      let querySql = `
        SELECT MIN(COALESCE(last_accrued_chapter, borrowed_chapter)) as min_chap
        FROM narrative_debts
        WHERE status IN ('active', 'overdue', 'partially_paid')
          AND borrowed_chapter <= ?
          AND (last_accrued_chapter IS NULL OR last_accrued_chapter < ?)
      `;
      const queryParams = [currentChapter, currentChapter];
      if (projectId) {
        querySql += ' AND project_id = ?';
        queryParams.push(projectId);
      }
      minRow = db.prepare(querySql).get(...queryParams);
    } catch (_) {}

    let updatedDebtsCount = 0;
    let newlyOverdueCount = 0;
    let totalAccruedPressure = 0.0;
    let lastAccrueRes = null;

    const startChap = (minRow && minRow.min_chap !== null && minRow.min_chap !== undefined)
      ? Number(minRow.min_chap)
      : currentChapter;

    if (startChap < currentChapter) {
      for (let ch = startChap + 1; ch <= currentChapter; ch++) {
        const stepRes = dbManager.narrativeDebts.accrueInterest(ch, {
          overdueMultiplier,
          projectId
        });
        updatedDebtsCount = Math.max(updatedDebtsCount, stepRes.updatedDebtsCount);
        newlyOverdueCount += stepRes.newlyOverdueCount;
        totalAccruedPressure += stepRes.totalAccruedPressure;
        lastAccrueRes = stepRes;
      }
    } else {
      lastAccrueRes = dbManager.narrativeDebts.accrueInterest(currentChapter, {
        overdueMultiplier,
        projectId
      });
      updatedDebtsCount = lastAccrueRes.updatedDebtsCount;
      newlyOverdueCount = lastAccrueRes.newlyOverdueCount;
      totalAccruedPressure = lastAccrueRes.totalAccruedPressure;
    }

    totalAccruedPressure = Math.round(totalAccruedPressure * 100) / 100;

    return {
      success: true,
      currentChapter,
      updatedDebtsCount,
      newlyOverdueCount,
      overdueCount: newlyOverdueCount,
      totalAccruedPressure,
      content: [
        {
          type: 'text',
          text: `Narrative debts interest accrued for chapter ${currentChapter}: ${updatedDebtsCount} updated, ${newlyOverdueCount} newly overdue, +${totalAccruedPressure} pressure.`
        }
      ],
      details: {
        command: 'ManageNarrativeDebt',
        action: 'accrue',
        currentChapter,
        updatedDebtsCount,
        newlyOverdueCount,
        overdueCount: newlyOverdueCount,
        totalAccruedPressure
      }
    };
  }

  /**
   * Action: pay
   * @private
   */
  static async _handlePay(params, dbManager) {
    const debtId = params.debtId || params.debt_id;
    if (!debtId || typeof debtId !== 'string' || !debtId.trim()) {
      throw new NovelError('debtId is required for narrative debt payoff (invalid or missing debtId)');
    }

    const debt = dbManager.narrativeDebts.getById(debtId);
    if (!debt) {
      throw new NovelError(`Narrative debt not found (non-existent debtId: "${debtId}")`);
    }

    // Idempotent check if already fully paid
    if (debt.status === 'paid' || debt.currentBalance <= 0) {
      return {
        success: true,
        debtId: debt.debtId,
        status: 'paid',
        remainingBalance: 0,
        currentBalance: 0,
        previousBalance: 0,
        principalReduction: 0,
        isFullyPaid: true,
        content: [
          {
            type: 'text',
            text: `Narrative debt [${debt.debtId}] is already fully paid.`
          }
        ],
        details: {
          command: 'ManageNarrativeDebt',
          action: 'pay',
          debtId: debt.debtId,
          status: 'paid',
          remainingBalance: 0,
          currentBalance: 0,
          isFullyPaid: true
        }
      };
    }

    let amount = params.amount !== undefined && params.amount !== null
      ? Number(params.amount)
      : debt.currentBalance;

    if (isNaN(amount) || amount <= 0) {
      throw new NovelError('Payoff amount must be a positive number greater than 0');
    }

    const chapterNumber = params.chapterNumber !== undefined && params.chapterNumber !== null
      ? Number(params.chapterNumber)
      : (params.chapter !== undefined && params.chapter !== null ? Number(params.chapter) : debt.borrowedChapter);

    const triggerReason = params.triggerReason || params.reason || 'narrative_payoff_resolution';

    const payRes = dbManager.narrativeDebts.applyPayoff(debtId, amount, {
      chapterNumber,
      reason: triggerReason,
      recordMicroPayoff: params.recordMicroPayoff,
      payoffType: params.payoffType,
      satisfactionScore: params.satisfactionScore,
      fatigueMitigationScore: params.fatigueMitigationScore,
      description: params.description,
      snippet: params.snippet
    });

    // Auto-resolve foreshadowing if fully paid
    if (payRes.isFullyPaid && debt.foreshadowId && dbManager.foreshadowing) {
      try {
        const existingFsh = dbManager.foreshadowing.getByForeshadowId(debt.foreshadowId);
        if (existingFsh && existingFsh.status !== 'closed' && existingFsh.status !== 'resolved') {
          dbManager.foreshadowing.resolve(existingFsh.id, {
            target_status: 'closed',
            actual_resolve_chapter: chapterNumber,
            resolution_notes: triggerReason
          });
        }
      } catch (fshErr) {
        console.warn(`[DebtCommands] Notice: Could not auto-resolve linked foreshadowing "${debt.foreshadowId}": ${fshErr.message}`);
      }
    }

    return {
      success: true,
      debtId: payRes.debtId,
      status: payRes.status,
      remainingBalance: payRes.newBalance,
      currentBalance: payRes.newBalance,
      previousBalance: payRes.previousBalance,
      principalReduction: payRes.principalReduction,
      isFullyPaid: payRes.isFullyPaid,
      content: [
        {
          type: 'text',
          text: `Narrative debt [${payRes.debtId}] payoff applied: status=${payRes.status}, remainingBalance=${payRes.newBalance}.`
        }
      ],
      details: {
        command: 'ManageNarrativeDebt',
        action: 'pay',
        ...payRes,
        remainingBalance: payRes.newBalance,
        currentBalance: payRes.newBalance
      }
    };
  }

  /**
   * Action: query
   * @private
   */
  static async _handleQuery(params, dbManager) {
    const debtId = params.debtId || params.debt_id;
    if (debtId) {
      const debt = dbManager.narrativeDebts.getById(debtId, params.currentChapter);
      const debts = debt ? [debt] : [];
      return {
        success: true,
        totalCount: debts.length,
        debts,
        debt: debt || null,
        content: [
          {
            type: 'text',
            text: debt ? `Found narrative debt [${debt.debtId}] "${debt.title}".` : `Narrative debt "${debtId}" not found.`
          }
        ],
        details: {
          command: 'ManageNarrativeDebt',
          action: 'query',
          totalCount: debts.length,
          debts,
          debt: debt || null
        }
      };
    }

    // Build filter map
    const filter = { ...params };

    // Status normalization: map 'partial' to 'partially_paid'
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        filter.status = filter.status.map(s => String(s).toLowerCase() === 'partial' ? 'partially_paid' : s);
      } else if (String(filter.status).toLowerCase() === 'partial') {
        filter.status = 'partially_paid';
      }
    }

    // Entity mapping: entityId / entity -> relatedEntity
    if (filter.entityId || filter.entity) {
      filter.relatedEntity = filter.entityId || filter.entity;
    }

    // Urgency normalization
    if (filter.minUrgency || filter.urgency) {
      filter.urgencyLevel = filter.minUrgency || filter.urgency;
    }

    const queryRes = dbManager.narrativeDebts.queryDebts(filter);

    return {
      success: true,
      totalCount: queryRes.totalCount,
      debts: queryRes.debts,
      debt: queryRes.debts.length === 1 ? queryRes.debts[0] : (queryRes.debts[0] || null),
      content: [
        {
          type: 'text',
          text: `Found ${queryRes.totalCount} narrative debt(s).`
        }
      ],
      details: {
        command: 'ManageNarrativeDebt',
        action: 'query',
        totalCount: queryRes.totalCount,
        debts: queryRes.debts
      }
    };
  }

  /**
   * Action: summary
   * @private
   */
  static async _handleSummary(params, dbManager) {
    const currentChapter = params.currentChapter !== undefined && params.currentChapter !== null
      ? Number(params.currentChapter)
      : (params.chapter !== undefined && params.chapter !== null ? Number(params.chapter) : null);

    const projectId = params.projectId || params.project_id || null;

    const summaryRes = dbManager.narrativeDebts.getSummary(currentChapter, projectId);

    return {
      success: true,
      ...summaryRes,
      totalBalance: summaryRes.totalCurrentBalance,
      content: [
        {
          type: 'text',
          text: `Narrative Debt Summary: Active=${summaryRes.totalActiveDebts}, Total Principal=${summaryRes.totalPrincipal}, Total Balance=${summaryRes.totalCurrentBalance}, Overdue=${summaryRes.overdueCount}, Health Index=${summaryRes.healthIndex}/100.`
        }
      ],
      details: {
        command: 'ManageNarrativeDebt',
        action: 'summary',
        ...summaryRes,
        totalBalance: summaryRes.totalCurrentBalance
      }
    };
  }

  /**
   * Command: RecordMicroPayoff
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleRecordMicroPayoff(params = {}, context = {}) {
    const { dbManager } = context;

    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for RecordMicroPayoff.');
    }

    const debtId = params.debtId || params.debt_id;
    if (!debtId || typeof debtId !== 'string' || !debtId.trim()) {
      throw new NovelError('debtId is required for recording a micro payoff (invalid or missing debtId)');
    }

    const debt = dbManager.narrativeDebts.getById(debtId);
    if (!debt) {
      throw new NovelError(`Narrative debt not found (non-existent debtId: "${debtId}")`);
    }

    const recordedPayoff = dbManager.microPayoffs.recordPayoff(params);

    let updatedDebt = debt;
    if (recordedPayoff.principalReduction > 0) {
      const chapterNumber = params.chapterNumber !== undefined && params.chapterNumber !== null
        ? Number(params.chapterNumber)
        : (params.chapter !== undefined && params.chapter !== null ? Number(params.chapter) : debt.borrowedChapter);

      dbManager.narrativeDebts.applyPayoff(debtId, recordedPayoff.principalReduction, {
        chapterNumber,
        reason: 'micro_payoff_reduction',
        description: params.description
      });
      updatedDebt = dbManager.narrativeDebts.getById(debtId);
    }

    return {
      success: true,
      payoffId: recordedPayoff.payoffId,
      payoff: recordedPayoff,
      debtId: debt.debtId,
      principalReduction: recordedPayoff.principalReduction,
      remainingBalance: updatedDebt ? updatedDebt.currentBalance : 0,
      currentBalance: updatedDebt ? updatedDebt.currentBalance : 0,
      content: [
        {
          type: 'text',
          text: `Recorded micro-payoff [${recordedPayoff.payoffId}] for debt [${debt.debtId}] (-${recordedPayoff.principalReduction} principal).`
        }
      ],
      details: {
        command: 'RecordMicroPayoff',
        payoff: recordedPayoff,
        debt: updatedDebt
      }
    };
  }

  /**
   * Command: GetDebtPressure (Layer 6 Narrative Debt Pressure)
   * @param {object} params
   * @param {object} context
   * @returns {Promise<object>}
   */
  static async handleGetDebtPressure(params = {}, context = {}) {
    const { dbManager } = context;
    if (!dbManager) {
      throw new NovelError('DatabaseManager instance is required in context for GetDebtPressure.');
    }

    const chapterNumber = params.chapterNumber !== undefined && params.chapterNumber !== null
      ? Number(params.chapterNumber)
      : (params.chapterId !== undefined && params.chapterId !== null
          ? (Number(params.chapterId) || 1)
          : (params.currentChapter !== undefined && params.currentChapter !== null ? Number(params.currentChapter) : 1));

    const focusEntities = params.focusEntities || params.focusEntity || params.entities || params.entity;
    const projectId = params.projectId || params.project_id || null;
    const maxItems = params.maxItems || 5;

    let debtPressure = null;
    if (dbManager.narrativeDebts && typeof dbManager.narrativeDebts.getDebtPressure === 'function') {
      debtPressure = dbManager.narrativeDebts.getDebtPressure(chapterNumber, {
        focusEntities,
        projectId,
        maxItems
      });
    } else {
      debtPressure = {
        layer: 6,
        layerName: 'narrative_debt_pressure',
        immuneToTokenTrimming: true,
        extremeCutoffApplied: false,
        omittedDebtsCount: 0,
        chapterNumber,
        totalDebtsCount: 0,
        activeDebtsCount: 0,
        overdueDebtsCount: 0,
        debtPressureVector: {
          totalPressure: 0,
          averagePressure: 0,
          highestUrgency: 'low',
          overdueCount: 0,
          activeHooks: [],
          overdueDebts: []
        },
        formattedContextSnippet: `### ⚡ [Narrative Debt Pressure] (Chapter ${chapterNumber})\n*No active narrative debt pressure.*`
      };
    }

    const markdown = debtPressure.formattedContextSnippet;

    return {
      status: 'success',
      command: 'GetDebtPressure',
      layer: debtPressure.layer,
      layerName: debtPressure.layerName,
      immuneToTokenTrimming: debtPressure.immuneToTokenTrimming,
      extremeCutoffApplied: debtPressure.extremeCutoffApplied,
      omittedDebtsCount: debtPressure.omittedDebtsCount,
      chapterNumber: debtPressure.chapterNumber,
      debtPressureVector: debtPressure.debtPressureVector,
      formattedContextSnippet: debtPressure.formattedContextSnippet,
      debts: [
        ...(debtPressure.debtPressureVector.overdueDebts || []),
        ...(debtPressure.debtPressureVector.activeHooks || [])
      ],
      content: [
        {
          type: 'text',
          text: markdown
        }
      ],
      details: {
        command: 'GetDebtPressure',
        ...debtPressure
      }
    };
  }
}

module.exports = DebtCommands;
