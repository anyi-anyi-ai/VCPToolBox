-- ============================================================================
-- Migration 006: Phase 6 Scene Beats, Dual-Mode Drafts, State Mutations & Lore Sources
-- Target Database: better-sqlite3 (v12.4.1+)
-- ============================================================================

-- 1. Scene Beats Table
CREATE TABLE IF NOT EXISTS chapter_beats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beat_id TEXT NOT NULL UNIQUE,
    chapter_id TEXT NOT NULL,
    beat_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    scene_goal TEXT NOT NULL,
    conflict TEXT,
    characters_json TEXT NOT NULL DEFAULT '[]',
    location TEXT NOT NULL DEFAULT '',
    world_rules_json TEXT NOT NULL DEFAULT '[]',
    debt_action_json TEXT,
    emotional_tone TEXT,
    input_state_json TEXT,
    expected_output TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    UNIQUE(chapter_id, beat_order)
);

CREATE INDEX IF NOT EXISTS idx_beats_chapter_id ON chapter_beats(chapter_id);
CREATE INDEX IF NOT EXISTS idx_beats_beat_id ON chapter_beats(beat_id);
CREATE INDEX IF NOT EXISTS idx_beats_status ON chapter_beats(status);

-- 2. Draft Versions Table
CREATE TABLE IF NOT EXISTS draft_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draft_version_id TEXT NOT NULL UNIQUE,
    chapter_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    full_content TEXT NOT NULL,
    beats_snapshot_json TEXT NOT NULL DEFAULT '[]',
    word_count INTEGER NOT NULL DEFAULT 0,
    style_profile TEXT,
    integrity_status TEXT NOT NULL DEFAULT 'pending',
    created_by TEXT NOT NULL DEFAULT 'agent',
    parent_version_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_draft_versions_chapter ON draft_versions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_draft_versions_version_id ON draft_versions(draft_version_id);
CREATE INDEX IF NOT EXISTS idx_draft_versions_integrity ON draft_versions(integrity_status);

-- 3. State Mutations Table
CREATE TABLE IF NOT EXISTS state_mutations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mutation_id TEXT NOT NULL UNIQUE,
    chapter_id TEXT NOT NULL,
    draft_version_id TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    mutation_type TEXT NOT NULL,
    field_path TEXT NOT NULL,
    old_value_json TEXT,
    new_value_json TEXT NOT NULL,
    source_text TEXT NOT NULL,
    source_range TEXT,
    confidence REAL NOT NULL DEFAULT 1.0,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    applied_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_state_mutations_chapter ON state_mutations(chapter_id);
CREATE INDEX IF NOT EXISTS idx_state_mutations_draft_ver ON state_mutations(draft_version_id);
CREATE INDEX IF NOT EXISTS idx_state_mutations_entity ON state_mutations(entity_id);
CREATE INDEX IF NOT EXISTS idx_state_mutations_status ON state_mutations(status);

-- 4. Lore Sources Registry Table
CREATE TABLE IF NOT EXISTS lore_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL UNIQUE,
    entity_id TEXT NOT NULL,
    source_type TEXT NOT NULL DEFAULT 'canon',
    source_chapter TEXT,
    source_range TEXT,
    confidence REAL NOT NULL DEFAULT 1.0,
    priority INTEGER NOT NULL DEFAULT 2,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_lore_sources_entity ON lore_sources(entity_id);
CREATE INDEX IF NOT EXISTS idx_lore_sources_type ON lore_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_lore_sources_priority ON lore_sources(priority);
