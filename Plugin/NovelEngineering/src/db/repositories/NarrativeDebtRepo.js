/**
 * @file NarrativeDebtRepo.js
 * @description Typed CRUD, state machine, dynamic interest accrual, and query DAO for narrative_debts table (Phase 5).
 * Implements the active narrative debt tracking model (borrowing, compounding, overdue escalation, payoff).
 * @module db/repositories/NarrativeDebtRepo
 */

'use strict';

const crypto = require('crypto');
const { NovelError } = require('../../errors');

const DEBT_TYPES = {
  core_mystery: {
    type: 'core_mystery',
    defaultPrincipal: 10.0,
    defaultInterestRate: 0.05,
    defaultTargetOffset: 50,
    description: '核心主线谜团 / 终极伏笔'
  },
  subplot_hook: {
    type: 'subplot_hook',
    defaultPrincipal: 3.0,
    defaultInterestRate: 0.15,
    defaultTargetOffset: 15,
    description: '支线悬念 / 阶段性钩子'
  },
  crisis_hook: {
    type: 'crisis_hook',
    defaultPrincipal: 5.0,
    defaultInterestRate: 0.25,
    defaultTargetOffset: 5,
    description: '紧迫危机 / 生死悬念'
  },
  character_promise: {
    type: 'character_promise',
    defaultPrincipal: 2.0,
    defaultInterestRate: 0.10,
    defaultTargetOffset: 20,
    description: '人物承诺 / 角色羁绊期待'
  },
  power_teaser: {
    type: 'power_teaser',
    defaultPrincipal: 2.5,
    defaultInterestRate: 0.15,
    defaultTargetOffset: 10,
    description: '能力觉醒 / 升级期待'
  },
  world_secret: {
    type: 'world_secret',
    defaultPrincipal: 4.0,
    defaultInterestRate: 0.08,
    defaultTargetOffset: 30,
    description: '世界观揭秘 / 背景设定秘密'
  }
};

const DEBT_STATUS = {
  ACTIVE: 'active',
  OVERDUE: 'overdue',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  DEFAULTED: 'defaulted',
  ABANDONED: 'abandoned'
};

const URGENCY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class NarrativeDebtRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    if (!db) {
      throw new Error('Database instance is required for NarrativeDebtRepo');
    }
    this.db = db;
  }

  /**
   * Normalize and validate input record
   * @private
   * @param {object} data
   * @returns {object}
   */
  _normalizeRecord(data) {
    if (!data || typeof data !== 'object') {
      throw new NovelError('Debt record payload must be a non-null object');
    }

    const rawTitle = data.title;
    if (!rawTitle || typeof rawTitle !== 'string' || !rawTitle.trim()) {
      throw new NovelError('title is required for narrative debt creation');
    }
    const title = String(rawTitle).trim();

    const rawDebtId = data.debt_id !== undefined && data.debt_id !== null ? data.debt_id : data.debtId;
    const debtId = rawDebtId
      ? String(rawDebtId).trim()
      : `debt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const rawProjectId = data.project_id !== undefined && data.project_id !== null ? data.project_id : data.projectId;
    const projectId = String(rawProjectId !== undefined && rawProjectId !== null ? rawProjectId : 'default').trim();

    const rawDesc = data.description;
    const description = rawDesc !== undefined && rawDesc !== null ? String(rawDesc).trim() : null;

    const rawType = data.debt_type !== undefined && data.debt_type !== null
      ? data.debt_type
      : data.debtType !== undefined && data.debtType !== null
        ? data.debtType
        : 'subplot_hook';
    const debtType = String(rawType).toLowerCase().trim();
    const typeDef = DEBT_TYPES[debtType] || DEBT_TYPES.subplot_hook;

    const rawBorrowed = data.borrowed_chapter !== undefined && data.borrowed_chapter !== null
      ? data.borrowed_chapter
      : data.borrowedChapter !== undefined && data.borrowedChapter !== null
        ? data.chapter || data.borrowedChapter
        : 1;
    const borrowedChapter = Number.isInteger(Number(rawBorrowed)) ? Number(rawBorrowed) : 1;

    let targetPayoffChapter = null;
    const rawTarget = data.target_payoff_chapter !== undefined && data.target_payoff_chapter !== null
      ? data.target_payoff_chapter
      : data.targetPayoffChapter !== undefined && data.targetPayoffChapter !== null
        ? data.targetPayoffChapter
        : data.targetChapter;
    if (rawTarget !== undefined && rawTarget !== null && rawTarget !== '') {
      targetPayoffChapter = Number(rawTarget);
    } else if (typeDef && typeDef.defaultTargetOffset) {
      targetPayoffChapter = borrowedChapter + typeDef.defaultTargetOffset;
    }

    const rawPrincipal = data.base_principal !== undefined && data.base_principal !== null
      ? data.base_principal
      : data.basePrincipal !== undefined && data.basePrincipal !== null
        ? data.basePrincipal
        : data.principal;
    const basePrincipal = rawPrincipal !== undefined && rawPrincipal !== null
      ? Number(rawPrincipal)
      : (typeDef ? typeDef.defaultPrincipal : 100.0);

    const rawRate = data.interest_rate !== undefined && data.interest_rate !== null
      ? data.interest_rate
      : data.interestRate !== undefined && data.interestRate !== null
        ? data.interestRate
        : data.rate;
    const interestRate = rawRate !== undefined && rawRate !== null
      ? Number(rawRate)
      : (typeDef ? typeDef.defaultInterestRate : 0.05);

    const rawBalance = data.current_balance !== undefined && data.current_balance !== null
      ? data.current_balance
      : data.currentBalance !== undefined && data.currentBalance !== null
        ? data.currentBalance
        : data.balance;
    const currentBalance = rawBalance !== undefined && rawBalance !== null
      ? Number(rawBalance)
      : basePrincipal;

    const rawAccrued = data.accrued_chapters !== undefined && data.accrued_chapters !== null
      ? data.accrued_chapters
      : data.accruedChapters;
    const accruedChapters = Number.isInteger(Number(rawAccrued)) ? Number(rawAccrued) : 0;

    const rawLastAccrued = data.last_accrued_chapter !== undefined && data.last_accrued_chapter !== null
      ? data.last_accrued_chapter
      : data.lastAccruedChapter;
    const lastAccruedChapter = rawLastAccrued !== undefined && rawLastAccrued !== null ? Number(rawLastAccrued) : null;

    const rawStatus = data.status || 'active';
    const status = String(rawStatus).toLowerCase().trim();

    const rawUrgency = data.urgency_level || data.urgencyLevel || 'normal';
    const urgencyLevel = String(rawUrgency).toLowerCase().trim();

    let relatedEntitiesJson = null;
    const rawEntities = data.related_entities_json !== undefined
      ? data.related_entities_json
      : data.related_entities !== undefined
        ? data.related_entities
        : data.relatedEntities;
    if (rawEntities !== undefined && rawEntities !== null) {
      relatedEntitiesJson = typeof rawEntities === 'object' ? JSON.stringify(rawEntities) : String(rawEntities);
    }

    const rawForeshadow = data.foreshadow_id !== undefined && data.foreshadow_id !== null
      ? data.foreshadow_id
      : data.foreshadowId;
    const foreshadowId = rawForeshadow !== undefined && rawForeshadow !== null ? String(rawForeshadow).trim() : null;

    let metadataJson = null;
    const rawMetadata = data.metadata_json !== undefined ? data.metadata_json : data.metadata;
    if (rawMetadata !== undefined && rawMetadata !== null) {
      metadataJson = typeof rawMetadata === 'object' ? JSON.stringify(rawMetadata) : String(rawMetadata);
    }

    return {
      debt_id: debtId,
      project_id: projectId,
      title,
      description,
      debt_type: debtType,
      borrowed_chapter: borrowedChapter,
      target_payoff_chapter: targetPayoffChapter,
      base_principal: basePrincipal,
      interest_rate: interestRate,
      current_balance: currentBalance,
      accrued_chapters: accruedChapters,
      last_accrued_chapter: lastAccruedChapter,
      status,
      urgency_level: urgencyLevel,
      related_entities_json: relatedEntitiesJson,
      foreshadow_id: foreshadowId,
      metadata_json: metadataJson
    };
  }

  /**
   * Hydrate database row into structured domain object
   * @private
   * @param {object} row
   * @param {number} [currentChapter=null]
   * @returns {object|null}
   */
  _formatRow(row, currentChapter = null) {
    if (!row) return null;

    let relatedEntities = [];
    if (row.related_entities_json) {
      try {
        const parsed = JSON.parse(row.related_entities_json);
        relatedEntities = Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        relatedEntities = [row.related_entities_json];
      }
    }

    let metadata = null;
    if (row.metadata_json) {
      try {
        metadata = JSON.parse(row.metadata_json);
      } catch (_) {
        metadata = row.metadata_json;
      }
    }

    const targetChapter = row.target_payoff_chapter !== null && row.target_payoff_chapter !== undefined
      ? Number(row.target_payoff_chapter)
      : null;
    const isOverdue = row.status === DEBT_STATUS.OVERDUE || (
      targetChapter !== null && currentChapter !== null && currentChapter > targetChapter && row.status !== DEBT_STATUS.PAID
    );

    return {
      id: Number(row.id),
      debtId: row.debt_id,
      debt_id: row.debt_id,
      projectId: row.project_id,
      project_id: row.project_id,
      title: row.title,
      description: row.description,
      debtType: row.debt_type,
      debt_type: row.debt_type,
      borrowedChapter: Number(row.borrowed_chapter),
      borrowed_chapter: Number(row.borrowed_chapter),
      targetPayoffChapter: targetChapter,
      target_payoff_chapter: targetChapter,
      basePrincipal: Number(row.base_principal),
      base_principal: Number(row.base_principal),
      interestRate: Number(row.interest_rate),
      interest_rate: Number(row.interest_rate),
      currentBalance: Number(row.current_balance),
      current_balance: Number(row.current_balance),
      accruedChapters: Number(row.accrued_chapters),
      accrued_chapters: Number(row.accrued_chapters),
      lastAccruedChapter: row.last_accrued_chapter !== null ? Number(row.last_accrued_chapter) : null,
      last_accrued_chapter: row.last_accrued_chapter !== null ? Number(row.last_accrued_chapter) : null,
      status: row.status,
      urgencyLevel: row.urgency_level,
      urgency_level: row.urgency_level,
      isOverdue: Boolean(isOverdue),
      is_overdue: Boolean(isOverdue),
      relatedEntities,
      related_entities: relatedEntities,
      related_entities_json: row.related_entities_json,
      foreshadowId: row.foreshadow_id,
      foreshadow_id: row.foreshadow_id,
      metadata,
      metadata_json: row.metadata_json,
      createdAt: row.created_at,
      created_at: row.created_at,
      updatedAt: row.updated_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Create / Insert a new narrative debt
   * Automatically creates an initial 'borrow' event in debt_events
   * @param {object} data
   * @returns {object}
   */
  createDebt(data) {
    const record = this._normalizeRecord(data);

    const insertDebtStmt = this.db.prepare(`
      INSERT INTO narrative_debts (
        debt_id, project_id, title, description, debt_type, borrowed_chapter, target_payoff_chapter,
        base_principal, interest_rate, current_balance, accrued_chapters, last_accrued_chapter,
        status, urgency_level, related_entities_json, foreshadow_id, metadata_json, created_at, updated_at
      ) VALUES (
        @debt_id, @project_id, @title, @description, @debt_type, @borrowed_chapter, @target_payoff_chapter,
        @base_principal, @interest_rate, @current_balance, @accrued_chapters, @last_accrued_chapter,
        @status, @urgency_level, @related_entities_json, @foreshadow_id, @metadata_json,
        datetime('now', 'localtime'), datetime('now', 'localtime')
      )
    `);

    const insertEventStmt = this.db.prepare(`
      INSERT INTO debt_events (
        debt_id, event_type, chapter_number, delta_balance, new_balance, trigger_reason, metadata_json, created_at
      ) VALUES (
        ?, 'borrow', ?, ?, ?, 'initial_creation', ?, datetime('now', 'localtime')
      )
    `);

    const tx = this.db.transaction(() => {
      insertDebtStmt.run(record);
      try {
        insertEventStmt.run(
          record.debt_id,
          record.borrowed_chapter,
          record.base_principal,
          record.current_balance,
          record.metadata_json
        );
      } catch (_) {
        // Safe fallback if debt_events table is missing or constrained
      }
    });

    tx();
    return this.getByDebtId(record.debt_id);
  }

  /**
   * Alias for createDebt
   * @param {object} data
   * @returns {object}
   */
  insert(data) {
    return this.createDebt(data);
  }

  /**
   * Alias for createDebt
   * @param {object} data
   * @returns {object}
   */
  create(data) {
    return this.createDebt(data);
  }

  /**
   * Transactional batch insertion
   * @param {Array<object>} debts
   * @returns {Array<object>}
   */
  batchInsert(debts) {
    if (!Array.isArray(debts) || debts.length === 0) return [];

    const insertedIds = [];
    const tx = this.db.transaction((items) => {
      for (const item of items) {
        const created = this.createDebt(item);
        insertedIds.push(created.debt_id);
      }
    });

    tx(debts);
    return insertedIds.map((id) => this.getByDebtId(id));
  }

  /**
   * Find debt by primary key ID or debt_id string
   * @param {string|number} idOrDebtId
   * @param {number} [currentChapter=null]
   * @returns {object|null}
   */
  getById(idOrDebtId, currentChapter = null) {
    if (!idOrDebtId) return null;
    if (typeof idOrDebtId === 'number' || /^\d+$/.test(String(idOrDebtId))) {
      const row = this.db.prepare('SELECT * FROM narrative_debts WHERE id = ? OR debt_id = ?').get(idOrDebtId, String(idOrDebtId));
      return this._formatRow(row, currentChapter);
    }
    const row = this.db.prepare('SELECT * FROM narrative_debts WHERE debt_id = ?').get(String(idOrDebtId));
    return this._formatRow(row, currentChapter);
  }

  /**
   * Alias for getById
   * @param {string|number} debtId
   * @param {number} [currentChapter=null]
   * @returns {object|null}
   */
  getByDebtId(debtId, currentChapter = null) {
    return this.getById(debtId, currentChapter);
  }

  /**
   * Alias for getById
   * @param {string|number} debtId
   * @param {number} [currentChapter=null]
   * @returns {object|null}
   */
  getDebtById(debtId, currentChapter = null) {
    return this.getById(debtId, currentChapter);
  }

  /**
   * Find debt linked to a specific foreshadowing ID
   * @param {string} foreshadowId
   * @returns {object|null}
   */
  findByForeshadowId(foreshadowId) {
    if (!foreshadowId) return null;
    const row = this.db.prepare('SELECT * FROM narrative_debts WHERE foreshadow_id = ?').get(String(foreshadowId));
    return this._formatRow(row);
  }

  /**
   * Update mutable fields on a narrative debt
   * @param {string|number} idOrDebtId
   * @param {object} data
   * @returns {object} Updated record
   */
  updateDebt(idOrDebtId, data) {
    const existing = this.getById(idOrDebtId);
    if (!existing) {
      throw new NovelError(`Narrative debt not found for update: ${idOrDebtId}`);
    }

    const fields = [];
    const params = [];

    const fieldMap = {
      title: 'title',
      description: 'description',
      debt_type: 'debt_type',
      debtType: 'debt_type',
      borrowed_chapter: 'borrowed_chapter',
      borrowedChapter: 'borrowed_chapter',
      target_payoff_chapter: 'target_payoff_chapter',
      targetPayoffChapter: 'target_payoff_chapter',
      base_principal: 'base_principal',
      basePrincipal: 'base_principal',
      interest_rate: 'interest_rate',
      interestRate: 'interest_rate',
      current_balance: 'current_balance',
      currentBalance: 'current_balance',
      accrued_chapters: 'accrued_chapters',
      accruedChapters: 'accrued_chapters',
      last_accrued_chapter: 'last_accrued_chapter',
      lastAccruedChapter: 'last_accrued_chapter',
      status: 'status',
      urgency_level: 'urgency_level',
      urgencyLevel: 'urgency_level',
      foreshadow_id: 'foreshadow_id',
      foreshadowId: 'foreshadow_id'
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = ?`);
        params.push(data[key]);
      }
    }

    if (data.related_entities_json !== undefined || data.related_entities !== undefined || data.relatedEntities !== undefined) {
      const raw = data.related_entities_json !== undefined
        ? data.related_entities_json
        : data.related_entities !== undefined
          ? data.related_entities
          : data.relatedEntities;
      const json = raw !== null ? (typeof raw === 'object' ? JSON.stringify(raw) : String(raw)) : null;
      fields.push('related_entities_json = ?');
      params.push(json);
    }

    if (data.metadata_json !== undefined || data.metadata !== undefined) {
      const raw = data.metadata_json !== undefined ? data.metadata_json : data.metadata;
      const json = raw !== null ? (typeof raw === 'object' ? JSON.stringify(raw) : String(raw)) : null;
      fields.push('metadata_json = ?');
      params.push(json);
    }

    if (fields.length === 0) {
      return existing;
    }

    fields.push("updated_at = datetime('now', 'localtime')");
    params.push(existing.debt_id);

    const sql = `UPDATE narrative_debts SET ${fields.join(', ')} WHERE debt_id = ?`;
    this.db.prepare(sql).run(...params);

    return this.getByDebtId(existing.debt_id);
  }

  /**
   * Alias for updateDebt
   * @param {string|number} idOrDebtId
   * @param {object} data
   * @returns {object}
   */
  update(idOrDebtId, data) {
    return this.updateDebt(idOrDebtId, data);
  }

  /**
   * Accrue interest across all active / unsettled narrative debts for a target chapter
   * Implements compound interest calculation, overdue escalation, and audit logging
   * @param {number} currentChapter
   * @param {object} [options={}]
   * @param {number} [options.overdueMultiplier=1.5]
   * @param {string} [options.projectId=null]
   * @returns {{ success: boolean, currentChapter: number, updatedDebtsCount: number, newlyOverdueCount: number, totalAccruedPressure: number }}
   */
  accrueInterest(currentChapter, options = {}) {
    const chapter = Number.isInteger(Number(currentChapter)) ? Number(currentChapter) : 1;
    const overdueMultiplier = Number(options.overdueMultiplier) || 1.5;
    const projectId = options.projectId || options.project_id || null;

    let sql = `
      SELECT * FROM narrative_debts
      WHERE status IN ('active', 'overdue', 'partially_paid')
        AND borrowed_chapter <= ?
        AND (last_accrued_chapter IS NULL OR last_accrued_chapter < ?)
    `;
    const params = [chapter, chapter];

    if (projectId) {
      sql += ' AND project_id = ?';
      params.push(projectId);
    }

    const debtsToAccrue = this.db.prepare(sql).all(...params);

    const updateDebtStmt = this.db.prepare(`
      UPDATE narrative_debts
      SET current_balance = @current_balance,
          accrued_chapters = accrued_chapters + 1,
          last_accrued_chapter = @last_accrued_chapter,
          status = @status,
          urgency_level = @urgency_level,
          updated_at = datetime('now', 'localtime')
      WHERE debt_id = @debt_id
    `);

    const insertEventStmt = this.db.prepare(`
      INSERT INTO debt_events (
        debt_id, event_type, chapter_number, delta_balance, new_balance, trigger_reason, metadata_json, created_at
      ) VALUES (
        @debt_id, @event_type, @chapter_number, @delta_balance, @new_balance, @trigger_reason, @metadata_json, datetime('now', 'localtime')
      )
    `);

    let updatedDebtsCount = 0;
    let newlyOverdueCount = 0;
    let totalAccruedPressure = 0.0;

    const tx = this.db.transaction(() => {
      for (const rawDebt of debtsToAccrue) {
        const debt = this._formatRow(rawDebt);
        const wasOverdue = debt.status === DEBT_STATUS.OVERDUE;
        const isTargetOverdue = debt.targetPayoffChapter !== null && chapter > debt.targetPayoffChapter;
        const isOverdue = wasOverdue || isTargetOverdue;

        const effectiveRate = isOverdue
          ? debt.interestRate * overdueMultiplier
          : debt.interestRate;

        // Interest delta for one chapter step
        const delta = Math.round(debt.currentBalance * effectiveRate * 1000) / 1000;
        const newBalance = Math.round((debt.currentBalance + delta) * 1000) / 1000;

        let status = debt.status;
        if (isOverdue && status !== DEBT_STATUS.OVERDUE) {
          status = DEBT_STATUS.OVERDUE;
          newlyOverdueCount++;
        }

        // Calculate dynamic urgency level
        let urgencyLevel = URGENCY_LEVELS.NORMAL;
        if (newBalance >= debt.basePrincipal * 2.5 || (isOverdue && chapter - (debt.targetPayoffChapter || 0) >= 5)) {
          urgencyLevel = URGENCY_LEVELS.CRITICAL;
        } else if (isOverdue || newBalance >= debt.basePrincipal * 1.5) {
          urgencyLevel = URGENCY_LEVELS.HIGH;
        } else if (newBalance <= debt.basePrincipal * 0.8) {
          urgencyLevel = URGENCY_LEVELS.LOW;
        }

        updateDebtStmt.run({
          debt_id: debt.debtId,
          current_balance: newBalance,
          last_accrued_chapter: chapter,
          status,
          urgency_level: urgencyLevel
        });

        // Insert accrue audit event
        insertEventStmt.run({
          debt_id: debt.debtId,
          event_type: 'accrue',
          chapter_number: chapter,
          delta_balance: delta,
          new_balance: newBalance,
          trigger_reason: isOverdue ? 'interest_accrual_overdue_penalty' : 'chapter_advancement_interest',
          metadata_json: JSON.stringify({
            previousBalance: debt.currentBalance,
            effectiveRate,
            isOverdue
          })
        });

        // If newly escalated to overdue, insert escalate audit event
        if (!wasOverdue && isOverdue) {
          insertEventStmt.run({
            debt_id: debt.debtId,
            event_type: 'escalate',
            chapter_number: chapter,
            delta_balance: 0.0,
            new_balance: newBalance,
            trigger_reason: 'target_payoff_chapter_surpassed',
            metadata_json: JSON.stringify({
              targetPayoffChapter: debt.targetPayoffChapter,
              overdueMultiplier
            })
          });
        }

        updatedDebtsCount++;
        totalAccruedPressure += delta;
      }
    });

    tx();

    return {
      success: true,
      currentChapter: chapter,
      updatedDebtsCount,
      newlyOverdueCount,
      totalAccruedPressure: Math.round(totalAccruedPressure * 100) / 100
    };
  }

  /**
   * Apply payoff (full or partial) to a narrative debt
   * @param {string|number} idOrDebtId
   * @param {number} amount
   * @param {object} [options={}]
   * @returns {{ success: boolean, debtId: string, previousBalance: number, newBalance: number, principalReduction: number, status: string, isFullyPaid: boolean }}
   */
  applyPayoff(idOrDebtId, amount, options = {}) {
    const debt = this.getById(idOrDebtId);
    if (!debt) {
      throw new NovelError(`Narrative debt not found for payoff: ${idOrDebtId}`);
    }

    const payoffAmount = Number(amount) || 0.0;
    if (payoffAmount <= 0) {
      throw new NovelError('Payoff amount must be greater than 0');
    }

    const prevBalance = debt.currentBalance;
    const reduction = Math.min(prevBalance, payoffAmount);
    const newBalance = Math.max(0, Math.round((prevBalance - reduction) * 1000) / 1000);
    const isFullyPaid = newBalance <= 0;
    const newStatus = isFullyPaid ? DEBT_STATUS.PAID : DEBT_STATUS.PARTIALLY_PAID;
    const newUrgency = isFullyPaid ? URGENCY_LEVELS.LOW : (newBalance < debt.basePrincipal ? URGENCY_LEVELS.NORMAL : debt.urgencyLevel);
    const chapterNumber = options.chapterNumber || options.chapter || debt.borrowedChapter;

    const tx = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE narrative_debts
        SET current_balance = ?,
            status = ?,
            urgency_level = ?,
            updated_at = datetime('now', 'localtime')
        WHERE debt_id = ?
      `).run(newBalance, newStatus, newUrgency, debt.debtId);

      this.db.prepare(`
        INSERT INTO debt_events (
          debt_id, event_type, chapter_number, delta_balance, new_balance, trigger_reason, metadata_json, created_at
        ) VALUES (
          ?, 'payoff', ?, ?, ?, ?, ?, datetime('now', 'localtime')
        )
      `).run(
        debt.debtId,
        chapterNumber,
        -reduction,
        newBalance,
        options.reason || 'narrative_payoff_resolution',
        JSON.stringify({ previousBalance: prevBalance, amount: payoffAmount, isFullyPaid })
      );

      if (options.recordMicroPayoff || options.payoffType) {
        const payoffId = options.payoffId || `payoff_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        this.db.prepare(`
          INSERT INTO micro_payoffs (
            debt_id, payoff_id, chapter_number, payoff_type, satisfaction_score, fatigue_mitigation_score,
            principal_reduction, description, snippet, created_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime')
          )
        `).run(
          debt.debtId,
          payoffId,
          chapterNumber,
          options.payoffType || 'sub_payoff',
          options.satisfactionScore || 1.0,
          options.fatigueMitigationScore || 1.0,
          reduction,
          options.description || null,
          options.snippet || null
        );
      }
    });

    tx();

    return {
      success: true,
      debtId: debt.debtId,
      previousBalance: prevBalance,
      newBalance,
      principalReduction: reduction,
      status: newStatus,
      isFullyPaid
    };
  }

  /**
   * Alias for applyPayoff
   * @param {string|number} idOrDebtId
   * @param {number} amount
   * @param {object} [options={}]
   * @returns {object}
   */
  payDebt(idOrDebtId, amount, options = {}) {
    return this.applyPayoff(idOrDebtId, amount, options);
  }

  /**
   * Query narrative debts with dynamic filtering, sorting, and pagination
   * @param {object} [filter={}]
   * @returns {{ totalCount: number, debts: Array<object> }}
   */
  queryDebts(filter = {}) {
    let whereClauses = ['1=1'];
    const params = [];

    if (filter.projectId || filter.project_id) {
      whereClauses.push('project_id = ?');
      params.push(filter.projectId || filter.project_id);
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        whereClauses.push(`status IN (${filter.status.map(() => '?').join(', ')})`);
        params.push(...filter.status);
      } else {
        whereClauses.push('status = ?');
        params.push(filter.status);
      }
    }

    if (filter.debtType || filter.debt_type) {
      const type = filter.debtType || filter.debt_type;
      if (Array.isArray(type)) {
        whereClauses.push(`debt_type IN (${type.map(() => '?').join(', ')})`);
        params.push(...type);
      } else {
        whereClauses.push('debt_type = ?');
        params.push(type);
      }
    }

    if (filter.urgencyLevel || filter.urgency_level) {
      whereClauses.push('urgency_level = ?');
      params.push(filter.urgencyLevel || filter.urgency_level);
    }

    if (filter.borrowedChapterMin !== undefined || filter.borrowed_chapter_min !== undefined) {
      whereClauses.push('borrowed_chapter >= ?');
      params.push(filter.borrowedChapterMin !== undefined ? filter.borrowedChapterMin : filter.borrowed_chapter_min);
    }
    if (filter.borrowedChapterMax !== undefined || filter.borrowed_chapter_max !== undefined) {
      whereClauses.push('borrowed_chapter <= ?');
      params.push(filter.borrowedChapterMax !== undefined ? filter.borrowedChapterMax : filter.borrowed_chapter_max);
    }

    if (filter.targetPayoffChapterMin !== undefined || filter.target_payoff_chapter_min !== undefined) {
      whereClauses.push('target_payoff_chapter >= ?');
      params.push(filter.targetPayoffChapterMin !== undefined ? filter.targetPayoffChapterMin : filter.target_payoff_chapter_min);
    }
    if (filter.targetPayoffChapterMax !== undefined || filter.target_payoff_chapter_max !== undefined) {
      whereClauses.push('target_payoff_chapter <= ?');
      params.push(filter.targetPayoffChapterMax !== undefined ? filter.targetPayoffChapterMax : filter.target_payoff_chapter_max);
    }

    if (filter.minBalance !== undefined || filter.min_balance !== undefined) {
      whereClauses.push('current_balance >= ?');
      params.push(filter.minBalance !== undefined ? filter.minBalance : filter.min_balance);
    }
    if (filter.maxBalance !== undefined || filter.max_balance !== undefined) {
      whereClauses.push('current_balance <= ?');
      params.push(filter.maxBalance !== undefined ? filter.maxBalance : filter.max_balance);
    }

    if (filter.foreshadowId || filter.foreshadow_id) {
      whereClauses.push('foreshadow_id = ?');
      params.push(filter.foreshadowId || filter.foreshadow_id);
    }

    if (filter.relatedEntity || filter.related_entity) {
      const entity = filter.relatedEntity || filter.related_entity;
      whereClauses.push('related_entities_json LIKE ?');
      params.push(`%${entity}%`);
    }

    if (filter.isOverdue === true || filter.is_overdue === true) {
      if (filter.currentChapter !== undefined && filter.currentChapter !== null) {
        whereClauses.push("(status = 'overdue' OR (target_payoff_chapter IS NOT NULL AND target_payoff_chapter < ? AND status != 'paid'))");
        params.push(filter.currentChapter);
      } else {
        whereClauses.push("status = 'overdue'");
      }
    }

    const whereSql = whereClauses.join(' AND ');

    // Total Count
    const countRow = this.db.prepare(`SELECT COUNT(*) as count FROM narrative_debts WHERE ${whereSql}`).get(...params);
    const totalCount = countRow ? Number(countRow.count) : 0;

    // Sorting & Pagination
    let orderBy = 'id';
    if (filter.orderBy) {
      const allowedOrder = ['id', 'borrowed_chapter', 'target_payoff_chapter', 'current_balance', 'base_principal', 'created_at', 'updated_at'];
      if (allowedOrder.includes(filter.orderBy)) {
        orderBy = filter.orderBy;
      }
    }
    const orderDir = filter.orderDir && String(filter.orderDir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let limitClause = '';
    const paginationParams = [];
    if (filter.limit && Number.isInteger(filter.limit)) {
      limitClause = 'LIMIT ?';
      paginationParams.push(filter.limit);
      if (filter.offset && Number.isInteger(filter.offset)) {
        limitClause += ' OFFSET ?';
        paginationParams.push(filter.offset);
      }
    }

    const sql = `
      SELECT * FROM narrative_debts
      WHERE ${whereSql}
      ORDER BY ${orderBy} ${orderDir}
      ${limitClause}
    `;

    const rows = this.db.prepare(sql).all(...params, ...paginationParams);
    const debts = rows.map((r) => this._formatRow(r, filter.currentChapter));

    return {
      totalCount,
      debts
    };
  }

  /**
   * Alias for queryDebts
   * @param {object} [filter={}]
   * @returns {Array<object>}
   */
  query(filter = {}) {
    return this.queryDebts(filter).debts;
  }

  /**
   * Get all currently overdue narrative debts
   * @param {number} [currentChapter=null]
   * @param {string} [projectId=null]
   * @returns {Array<object>}
   */
  getOverdueDebts(currentChapter = null, projectId = null) {
    let sql = "SELECT * FROM narrative_debts WHERE status != 'paid' AND status != 'abandoned'";
    const params = [];

    if (projectId) {
      sql += ' AND project_id = ?';
      params.push(projectId);
    }

    if (currentChapter !== null && currentChapter !== undefined) {
      sql += " AND (status = 'overdue' OR (target_payoff_chapter IS NOT NULL AND target_payoff_chapter < ?))";
      params.push(currentChapter);
    } else {
      sql += " AND status = 'overdue'";
    }

    sql += ' ORDER BY current_balance DESC';
    const rows = this.db.prepare(sql).all(...params);
    return rows.map((r) => this._formatRow(r, currentChapter));
  }

  /**
   * Aggregate story debt health summary and narrative pressure metrics
   * @param {number} [currentChapter=null]
   * @param {string} [projectId=null]
   * @returns {object}
   */
  getSummary(currentChapter = null, projectId = null) {
    let baseSql = "FROM narrative_debts WHERE status IN ('active', 'overdue', 'partially_paid')";
    const params = [];
    if (projectId) {
      baseSql += ' AND project_id = ?';
      params.push(projectId);
    }

    const aggRow = this.db.prepare(`
      SELECT
        COUNT(*) as total_active,
        SUM(base_principal) as total_principal,
        SUM(current_balance) as total_balance,
        MAX(current_balance) as max_balance
      ${baseSql}
    `).get(...params);

    const totalActiveDebts = aggRow && aggRow.total_active ? Number(aggRow.total_active) : 0;
    const totalPrincipal = aggRow && aggRow.total_principal ? Number(aggRow.total_principal) : 0;
    const totalCurrentBalance = aggRow && aggRow.total_balance ? Number(aggRow.total_balance) : 0;
    const averagePressure = totalActiveDebts > 0 ? Math.round((totalCurrentBalance / totalActiveDebts) * 100) / 100 : 0;

    const overdueDebts = this.getOverdueDebts(currentChapter, projectId);
    const overdueCount = overdueDebts.length;

    // Highest debt record
    let highestDebt = null;
    if (totalActiveDebts > 0) {
      const topRow = this.db.prepare(`
        SELECT * ${baseSql} ORDER BY current_balance DESC LIMIT 1
      `).get(...params);
      highestDebt = this._formatRow(topRow, currentChapter);
    }

    // Breakdown by debt type
    const byTypeRows = this.db.prepare(`
      SELECT debt_type, COUNT(*) as count, SUM(current_balance) as balance
      ${baseSql}
      GROUP BY debt_type
    `).all(...params);

    const byType = {};
    for (const r of byTypeRows) {
      byType[r.debt_type] = {
        count: Number(r.count),
        balance: Number(r.balance || 0)
      };
    }

    // Compute 0-100 Story Health Index (100 = optimal/healthy, 0 = severe debt crisis)
    let healthIndex = 100;
    if (totalActiveDebts > 0) {
      const overdueRatio = overdueCount / totalActiveDebts;
      const pressureRatio = totalPrincipal > 0 ? (totalCurrentBalance / totalPrincipal) : 1.0;

      healthIndex -= Math.min(50, overdueRatio * 60);
      if (pressureRatio > 2.0) {
        healthIndex -= Math.min(30, (pressureRatio - 2.0) * 15);
      }
      if (overdueCount >= 3) {
        healthIndex -= 10;
      }
    }
    healthIndex = Math.max(0, Math.min(100, Math.round(healthIndex)));

    return {
      totalActiveDebts,
      totalPrincipal: Math.round(totalPrincipal * 100) / 100,
      totalCurrentBalance: Math.round(totalCurrentBalance * 100) / 100,
      totalStoryPressure: Math.round(totalCurrentBalance * 100) / 100,
      overdueCount,
      averagePressure,
      healthIndex,
      highestDebt,
      byType
    };
  }

  /**
   * Delete a narrative debt (cascades to events and micro_payoffs via foreign keys)
   * @param {string|number} idOrDebtId
   * @returns {boolean}
   */
  deleteDebt(idOrDebtId) {
    const existing = this.getById(idOrDebtId);
    if (!existing) return false;

    const res = this.db.prepare('DELETE FROM narrative_debts WHERE debt_id = ?').run(existing.debt_id);
    return res.changes > 0;
  }

  /**
   * Alias for deleteDebt
   * @param {string|number} idOrDebtId
   * @returns {boolean}
   */
  delete(idOrDebtId) {
    return this.deleteDebt(idOrDebtId);
  }

  /**
   * Count total debts matching filter
   * @param {object} [filter={}]
   * @returns {number}
   */
  count(filter = {}) {
    return this.queryDebts(filter).totalCount;
  }

  /**
   * Compute structured narrative debt pressure (Layer 6 partition)
   * Implements Top-5 extreme defense cutoff, focusEntities filtering, urgency determination, and markdown prompt formatting.
   * @param {number} [currentChapter=1]
   * @param {object} [options={}]
   * @param {Array<string>|string} [options.focusEntities=[]]
   * @param {string} [options.projectId=null]
   * @param {number} [options.maxItems=5]
   * @returns {object} Standard Layer 6 narrative debt pressure object
   */
  getDebtPressure(currentChapter = 1, options = {}) {
    const chNum = Number.isInteger(Number(currentChapter)) ? Number(currentChapter) : 1;
    const maxItems = Number(options.maxItems) || 5;
    const projectId = options.projectId || options.project_id || null;

    let rawFocus = options.focusEntities || options.focusEntity || options.entities || options.entity || [];
    let focusEntities = [];
    if (Array.isArray(rawFocus)) {
      for (const item of rawFocus) {
        if (typeof item === 'string') {
          focusEntities.push(...item.split(/[,，]/).map(s => s.trim().toLowerCase()).filter(Boolean));
        } else if (item && typeof item === 'object') {
          const name = item.canonicalName || item.canonical_name || item.name || item.entityId || item.entity_id || item.title;
          if (name) focusEntities.push(String(name).trim().toLowerCase());
        }
      }
    } else if (typeof rawFocus === 'string') {
      focusEntities = rawFocus.split(/[,，]/).map(s => s.trim().toLowerCase()).filter(Boolean);
    }

    let sql = "SELECT * FROM narrative_debts WHERE status IN ('active', 'overdue', 'partially_paid')";
    const params = [];
    if (projectId) {
      sql += ' AND project_id = ?';
      params.push(projectId);
    }
    sql += ' ORDER BY current_balance DESC, target_payoff_chapter ASC, borrowed_chapter ASC';

    let rows = [];
    try {
      rows = this.db.prepare(sql).all(...params);
    } catch (_) {
      rows = [];
    }

    const overdueList = [];
    const activeList = [];

    for (const r of rows) {
      const debt = this._formatRow(r, chNum);
      const isOverdue = debt.status === DEBT_STATUS.OVERDUE || (
        debt.targetPayoffChapter !== null && chNum > debt.targetPayoffChapter
      );

      // Focus entities filtering
      if (focusEntities.length > 0) {
        const debtEntities = (debt.relatedEntities || []).map(e => String(e).trim().toLowerCase());
        const titleLower = String(debt.title || '').toLowerCase();
        const descLower = String(debt.description || '').toLowerCase();

        const matchesFocus = focusEntities.some(fe =>
          debtEntities.includes(fe) || titleLower.includes(fe) || descLower.includes(fe)
        );

        if (!matchesFocus) {
          continue;
        }
      }

      const weight = Number(debt.currentBalance !== undefined ? debt.currentBalance : (debt.basePrincipal || 0));
      const overdueChapters = isOverdue && debt.targetPayoffChapter !== null ? Math.max(0, chNum - debt.targetPayoffChapter) : 0;

      let urgencyLevel = debt.urgencyLevel || URGENCY_LEVELS.NORMAL;
      if (isOverdue) {
        urgencyLevel = (overdueChapters >= 5 || weight >= debt.basePrincipal * 2) ? URGENCY_LEVELS.CRITICAL : URGENCY_LEVELS.HIGH;
      } else if (debt.targetPayoffChapter !== null && debt.targetPayoffChapter - chNum <= 2) {
        urgencyLevel = 'warning';
      }

      const debtItem = {
        debtId: debt.debtId,
        debt_id: debt.debtId,
        title: debt.title,
        description: debt.description || '',
        debtType: debt.debtType || 'subplot_hook',
        debt_type: debt.debtType || 'subplot_hook',
        borrowedChapter: debt.borrowedChapter,
        borrowed_chapter: debt.borrowedChapter,
        targetPayoffChapter: debt.targetPayoffChapter,
        target_payoff_chapter: debt.targetPayoffChapter,
        dueChapter: debt.targetPayoffChapter,
        basePrincipal: debt.basePrincipal,
        base_principal: debt.basePrincipal,
        interestRate: debt.interestRate,
        interest_rate: debt.interestRate,
        currentBalance: weight,
        current_balance: weight,
        currentWeight: weight,
        current_weight: weight,
        accruedChapters: debt.accruedChapters || 0,
        accrued_chapters: debt.accruedChapters || 0,
        overdueChapters,
        overdue_chapters: overdueChapters,
        urgencyLevel,
        urgency_level: urgencyLevel,
        status: isOverdue ? DEBT_STATUS.OVERDUE : debt.status,
        isOverdue,
        is_overdue: isOverdue,
        relatedEntities: debt.relatedEntities || [],
        related_entities: debt.relatedEntities || [],
        foreshadowId: debt.foreshadowId || null,
        foreshadow_id: debt.foreshadowId || null
      };

      if (isOverdue) {
        overdueList.push(debtItem);
      } else {
        activeList.push(debtItem);
      }
    }

    // Sort descending by currentWeight, then targetPayoffChapter ASC, then borrowedChapter ASC
    const sortFn = (a, b) => {
      if (b.currentWeight !== a.currentWeight) return b.currentWeight - a.currentWeight;
      if ((a.targetPayoffChapter || 0) !== (b.targetPayoffChapter || 0)) {
        return (a.targetPayoffChapter || 0) - (b.targetPayoffChapter || 0);
      }
      return (a.borrowedChapter || 0) - (b.borrowedChapter || 0);
    };

    overdueList.sort(sortFn);
    activeList.sort(sortFn);

    const totalOverdueCount = overdueList.length;
    const totalActiveCount = activeList.length;
    const omittedDebtsCount = Math.max(0, totalOverdueCount - maxItems) + Math.max(0, totalActiveCount - maxItems);
    const extremeCutoffApplied = totalOverdueCount > maxItems || totalActiveCount > maxItems;

    const topOverdue = overdueList.slice(0, maxItems);
    const topActive = activeList.slice(0, maxItems);

    const allFilteredDebts = [...overdueList, ...activeList];
    const totalPressure = Math.round(allFilteredDebts.reduce((sum, d) => sum + d.currentBalance, 0) * 100) / 100;
    const averagePressure = allFilteredDebts.length > 0 ? Math.round((totalPressure / allFilteredDebts.length) * 100) / 100 : 0;

    let highestUrgency = 'normal';
    if (allFilteredDebts.some(d => d.urgencyLevel === 'critical')) {
      highestUrgency = 'critical';
    } else if (allFilteredDebts.some(d => d.urgencyLevel === 'high')) {
      highestUrgency = 'high';
    } else if (allFilteredDebts.some(d => d.urgencyLevel === 'warning')) {
      highestUrgency = 'warning';
    } else if (allFilteredDebts.some(d => d.urgencyLevel === 'low') && allFilteredDebts.length === 1) {
      highestUrgency = 'low';
    }
    if (allFilteredDebts.length === 0) {
      highestUrgency = 'low';
    }

    // Build formatted Markdown snippet
    const snippetLines = [];
    snippetLines.push(`### ⚡ [Narrative Debt Pressure] (Chapter ${chNum})`);
    if (allFilteredDebts.length === 0) {
      snippetLines.push('*No active narrative debt pressure.*');
    } else {
      for (const d of topOverdue) {
        snippetLines.push(`- 🔴 **[CRITICAL OVERDUE]** \`${d.debtId}\` (Target: CH-${d.targetPayoffChapter !== null ? d.targetPayoffChapter : 'N/A'}, Overdue: +${d.overdueChapters} Chaps, Balance: ${d.currentBalance}): ${d.title}`);
      }
      for (const d of topActive) {
        const icon = d.urgencyLevel === 'warning' ? '🟡' : (d.urgencyLevel === 'high' ? '🟠' : '🟢');
        const tag = d.urgencyLevel.toUpperCase();
        snippetLines.push(`- ${icon} **[${tag}]** \`${d.debtId}\` (Target: CH-${d.targetPayoffChapter !== null ? d.targetPayoffChapter : 'N/A'}, Balance: ${d.currentBalance}): ${d.title}`);
      }
      if (extremeCutoffApplied) {
        snippetLines.push(`*(Extreme defense cutoff applied: ${omittedDebtsCount} lower-priority debts omitted from prompt)*`);
      }
    }
    const formattedContextSnippet = snippetLines.join('\n');

    return {
      layer: 6,
      layerName: 'narrative_debt_pressure',
      immuneToTokenTrimming: true,
      extremeCutoffApplied,
      omittedDebtsCount,
      chapterNumber: chNum,
      totalDebtsCount: allFilteredDebts.length,
      activeDebtsCount: totalActiveCount,
      overdueDebtsCount: totalOverdueCount,
      debtPressureVector: {
        totalPressure,
        averagePressure,
        highestUrgency,
        overdueCount: totalOverdueCount,
        activeHooks: topActive,
        overdueDebts: topOverdue
      },
      formattedContextSnippet
    };
  }
}

NarrativeDebtRepo.DEBT_TYPES = DEBT_TYPES;
NarrativeDebtRepo.DEBT_STATUS = DEBT_STATUS;
NarrativeDebtRepo.URGENCY_LEVELS = URGENCY_LEVELS;

module.exports = NarrativeDebtRepo;
