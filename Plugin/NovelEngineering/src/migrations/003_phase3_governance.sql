-- ============================================================================
-- Migration 003: Phase 3 Governance, Entity Relations & Canon Audit Log
-- Target Database: better-sqlite3 (v12.4.1+)
-- ============================================================================

-- 1. Add canon_level to source_files and entities
ALTER TABLE source_files ADD COLUMN canon_level INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_source_files_canon_level ON source_files(canon_level);

ALTER TABLE entities ADD COLUMN canon_level INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_entities_canon_level ON entities(canon_level);

-- 2. Entity Relations Table (Entity-to-Entity Knowledge Graph)
CREATE TABLE IF NOT EXISTS entity_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_entity_id INTEGER NOT NULL,
    target_entity_id INTEGER NOT NULL,
    relation_type TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 1.0,
    confidence REAL NOT NULL DEFAULT 1.0,
    bidirectional INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    attributes_json TEXT,
    source_file_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY(target_entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE SET NULL,
    UNIQUE(source_entity_id, target_entity_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_entity_relations_source ON entity_relations(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relations_target ON entity_relations(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_relations_type ON entity_relations(relation_type);
CREATE INDEX IF NOT EXISTS idx_entity_relations_source_file ON entity_relations(source_file_id);

-- 3. Canon Changes Table (Governance Audit Log)
CREATE TABLE IF NOT EXISTS canon_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_db_id INTEGER,
    before_state_json TEXT,
    after_state_json TEXT,
    old_value_json TEXT,
    new_value_json TEXT,
    confirmation_token TEXT NOT NULL DEFAULT 'CONFIRM_CANON_CHANGE',
    confirmed_by_flag INTEGER NOT NULL DEFAULT 0,
    operator TEXT NOT NULL DEFAULT 'system',
    reason TEXT,
    impact_summary_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_canon_changes_target ON canon_changes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_canon_changes_type ON canon_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_canon_changes_created ON canon_changes(created_at);
