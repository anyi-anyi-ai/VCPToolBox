-- ============================================================================
-- Migration 005: Phase 5 Narrative Debt & Micro-Payoffs System
-- Target Database: better-sqlite3 (v12.4.1+)
-- ============================================================================

-- 1. Narrative Debts Table
CREATE TABLE IF NOT EXISTS narrative_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL DEFAULT 'default',
    title TEXT NOT NULL,
    description TEXT,
    debt_type TEXT NOT NULL DEFAULT 'subplot_hook',
    borrowed_chapter INTEGER NOT NULL DEFAULT 1,
    target_payoff_chapter INTEGER,
    base_principal REAL NOT NULL DEFAULT 100.0,
    interest_rate REAL NOT NULL DEFAULT 0.05,
    current_balance REAL NOT NULL DEFAULT 100.0,
    accrued_chapters INTEGER NOT NULL DEFAULT 0,
    last_accrued_chapter INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    urgency_level TEXT NOT NULL DEFAULT 'normal',
    related_entities_json TEXT,
    foreshadow_id TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_narrative_debts_debt_id ON narrative_debts(debt_id);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_status ON narrative_debts(status);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_type ON narrative_debts(debt_type);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_target_chap ON narrative_debts(target_payoff_chapter);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_borrowed_chap ON narrative_debts(borrowed_chapter);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_foreshadow ON narrative_debts(foreshadow_id);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_project ON narrative_debts(project_id);
CREATE INDEX IF NOT EXISTS idx_narrative_debts_urgency ON narrative_debts(urgency_level);

-- 2. Debt Events Table (Audit Ledger)
CREATE TABLE IF NOT EXISTS debt_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    delta_balance REAL NOT NULL DEFAULT 0.0,
    new_balance REAL NOT NULL,
    trigger_reason TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(debt_id) REFERENCES narrative_debts(debt_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_debt_events_debt_id ON debt_events(debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_events_type ON debt_events(event_type);
CREATE INDEX IF NOT EXISTS idx_debt_events_chapter ON debt_events(chapter_number);
CREATE INDEX IF NOT EXISTS idx_debt_events_created ON debt_events(created_at);

-- 3. Micro-Payoffs Table
CREATE TABLE IF NOT EXISTS micro_payoffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id TEXT NOT NULL,
    payoff_id TEXT NOT NULL UNIQUE,
    chapter_number INTEGER NOT NULL,
    payoff_type TEXT NOT NULL,
    satisfaction_score REAL NOT NULL DEFAULT 1.0,
    fatigue_mitigation_score REAL NOT NULL DEFAULT 1.0,
    principal_reduction REAL NOT NULL DEFAULT 0.0,
    description TEXT,
    snippet TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(debt_id) REFERENCES narrative_debts(debt_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_micro_payoffs_debt_id ON micro_payoffs(debt_id);
CREATE INDEX IF NOT EXISTS idx_micro_payoffs_payoff_id ON micro_payoffs(payoff_id);
CREATE INDEX IF NOT EXISTS idx_micro_payoffs_chapter ON micro_payoffs(chapter_number);
CREATE INDEX IF NOT EXISTS idx_micro_payoffs_type ON micro_payoffs(payoff_type);
