-- ============================================================================
-- Migration 004: Phase 4 Collaboration Protocol & Creative Decision Queue
-- Target Database: better-sqlite3 (v12.4.1+)
-- ============================================================================

-- 1. Creative Decision Queue Table (Staging queue for Agent proposals)
CREATE TABLE IF NOT EXISTS canon_changes_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue_id TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL DEFAULT 'default',
    decision_type TEXT NOT NULL,
    proposer TEXT NOT NULL,
    author TEXT,
    target_entity_id TEXT,
    source_entities_json TEXT,
    proposed_changes_json TEXT NOT NULL,
    rationale TEXT,
    chapter_id TEXT,
    tags_json TEXT,
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'pending_author_confirmation',
    source_system TEXT NOT NULL DEFAULT 'NovelEngineering',
    authority TEXT NOT NULL DEFAULT 'agent_proposal',
    sha256_hash TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    review_comment TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_canon_queue_status ON canon_changes_queue(status);
CREATE INDEX IF NOT EXISTS idx_canon_queue_type ON canon_changes_queue(decision_type);
CREATE INDEX IF NOT EXISTS idx_canon_queue_proposer ON canon_changes_queue(proposer);
CREATE INDEX IF NOT EXISTS idx_canon_queue_target_ent ON canon_changes_queue(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_canon_queue_created ON canon_changes_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_canon_queue_project ON canon_changes_queue(project_id);

-- 2. Context Traces Table (Deterministic Lineage Logging)
CREATE TABLE IF NOT EXISTS context_traces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT NOT NULL UNIQUE,
    snapshot_id TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL DEFAULT 'default',
    chapter_id TEXT,
    volume_number INTEGER NOT NULL DEFAULT 1,
    focus_entities_json TEXT,
    total_sources INTEGER NOT NULL DEFAULT 0,
    trace_items_json TEXT NOT NULL,
    budget_stats_json TEXT,
    source_systems_json TEXT,
    authorities_json TEXT,
    generated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_context_traces_snapshot ON context_traces(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_context_traces_trace_id ON context_traces(trace_id);
CREATE INDEX IF NOT EXISTS idx_context_traces_generated ON context_traces(generated_at);
CREATE INDEX IF NOT EXISTS idx_context_traces_project ON context_traces(project_id);
