-- ============================================================================
-- Migration 001: Initial Schema (Phase 1 Baseline)
-- Target Database: better-sqlite3 (v12.4.1+)
-- ============================================================================

-- 1. Schema Version & Migration History
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS migration_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version INTEGER NOT NULL,
    migration_file TEXT NOT NULL,
    checksum TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    duration_ms INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'success',
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_migration_history_version ON migration_history(version);

-- 2. Scan Manifests Table
CREATE TABLE IF NOT EXISTS scan_manifests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_session_id TEXT NOT NULL UNIQUE,
    vault_root_path TEXT NOT NULL,
    scan_start_time TEXT NOT NULL,
    scan_end_time TEXT,
    scan_duration_ms INTEGER,
    total_files_scanned INTEGER NOT NULL DEFAULT 0,
    files_added INTEGER NOT NULL DEFAULT 0,
    files_updated INTEGER NOT NULL DEFAULT 0,
    files_unchanged INTEGER NOT NULL DEFAULT 0,
    files_deleted INTEGER NOT NULL DEFAULT 0,
    total_entities_extracted INTEGER NOT NULL DEFAULT 0,
    total_anomalies_detected INTEGER NOT NULL DEFAULT 0,
    manifest_summary_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_scan_manifests_session ON scan_manifests(scan_session_id);
CREATE INDEX IF NOT EXISTS idx_scan_manifests_created ON scan_manifests(created_at);

-- 3. Source Files Table (Base Phase 1)
CREATE TABLE IF NOT EXISTS source_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,
    relative_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    extension TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    mtime_ms INTEGER NOT NULL,
    sha256_hash TEXT NOT NULL,
    source_category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    review_status TEXT NOT NULL DEFAULT 'unreviewed',
    has_frontmatter INTEGER NOT NULL DEFAULT 0,
    frontmatter_raw TEXT,
    frontmatter_json TEXT,
    line_count INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER NOT NULL DEFAULT 0,
    is_placeholder INTEGER NOT NULL DEFAULT 0,
    placeholder_reason TEXT,
    scan_version INTEGER NOT NULL DEFAULT 1,
    last_scanned_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_source_files_relpath ON source_files(relative_path);
CREATE INDEX IF NOT EXISTS idx_source_files_sha256 ON source_files(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_source_files_category ON source_files(source_category);
CREATE INDEX IF NOT EXISTS idx_source_files_status ON source_files(status);
CREATE INDEX IF NOT EXISTS idx_source_files_review ON source_files(review_status);
CREATE INDEX IF NOT EXISTS idx_source_files_placeholder ON source_files(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_source_files_mtime ON source_files(mtime_ms);

-- 4. Entities Table (Base Phase 1)
CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id TEXT NOT NULL,
    canonical_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    review_status TEXT NOT NULL DEFAULT 'unreviewed',
    summary TEXT,
    description TEXT,
    attributes_json TEXT,
    source_file_id INTEGER,
    line_number INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entities_entity_id ON entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_entities_canonical_name ON entities(canonical_name);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_source_file ON entities(source_file_id);
CREATE INDEX IF NOT EXISTS idx_entities_review_status ON entities(review_status);
CREATE INDEX IF NOT EXISTS idx_entities_type_name ON entities(entity_type, canonical_name);

-- 5. Entity Aliases Table
CREATE TABLE IF NOT EXISTS entity_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,
    alias_name TEXT NOT NULL,
    alias_type TEXT NOT NULL DEFAULT 'nickname',
    is_primary INTEGER NOT NULL DEFAULT 0,
    source_file_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity_id ON entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_name ON entity_aliases(alias_name);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_type ON entity_aliases(alias_type);

-- 6. File Entities Junction Table
CREATE TABLE IF NOT EXISTS file_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_file_id INTEGER NOT NULL,
    entity_id INTEGER NOT NULL,
    mention_type TEXT NOT NULL DEFAULT 'referenced',
    mention_count INTEGER NOT NULL DEFAULT 1,
    occurrences_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    UNIQUE(source_file_id, entity_id, mention_type)
);

CREATE INDEX IF NOT EXISTS idx_file_entities_file ON file_entities(source_file_id);
CREATE INDEX IF NOT EXISTS idx_file_entities_entity ON file_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_file_entities_type ON file_entities(mention_type);

-- 7. Timeline Events Table (Base Phase 1)
CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    title TEXT NOT NULL,
    era_epoch TEXT NOT NULL DEFAULT 'CE',
    timestamp_order REAL NOT NULL,
    timeline_year INTEGER,
    timeline_month INTEGER,
    timeline_day INTEGER,
    relative_time_desc TEXT,
    description TEXT,
    source_file_id INTEGER,
    primary_entity_id INTEGER,
    participant_entity_ids_json TEXT,
    causality_prerequisite_ids_json TEXT,
    causality_consequence_ids_json TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(primary_entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_order ON timeline_events(timestamp_order);
CREATE INDEX IF NOT EXISTS idx_timeline_event_id ON timeline_events(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_source_file ON timeline_events(source_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_primary_entity ON timeline_events(primary_entity_id);

-- 8. Chapters Table (Base Phase 1)
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_number REAL NOT NULL,
    volume_number INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    source_file_id INTEGER,
    word_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    canon INTEGER NOT NULL DEFAULT 0,
    timeline_start REAL,
    timeline_end REAL,
    pov_entity_id INTEGER,
    summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(pov_entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chapters_vol_num ON chapters(volume_number, chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapters_source_file ON chapters(source_file_id);
CREATE INDEX IF NOT EXISTS idx_chapters_status ON chapters(status);
CREATE INDEX IF NOT EXISTS idx_chapters_canon ON chapters(canon);

-- 9. Foreshadowing Table (Base Phase 1)
CREATE TABLE IF NOT EXISTS foreshadowing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foreshadow_id TEXT NOT NULL,
    thread_key TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    setup_file_id INTEGER,
    setup_chapter_id INTEGER,
    setup_line INTEGER NOT NULL DEFAULT 1,
    setup_snippet TEXT,
    resolution_file_id INTEGER,
    resolution_chapter_id INTEGER,
    resolution_line INTEGER,
    resolution_snippet TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    importance_level TEXT NOT NULL DEFAULT 'major',
    tags_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(setup_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(resolution_file_id) REFERENCES source_files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_foreshadow_id ON foreshadowing(foreshadow_id);
CREATE INDEX IF NOT EXISTS idx_foreshadow_status ON foreshadowing(status);
CREATE INDEX IF NOT EXISTS idx_foreshadow_setup_file ON foreshadowing(setup_file_id);
CREATE INDEX IF NOT EXISTS idx_foreshadow_res_file ON foreshadowing(resolution_file_id);

-- 10. Anomaly Reports Table
CREATE TABLE IF NOT EXISTS anomaly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_session_id TEXT NOT NULL,
    anomaly_rule_id TEXT NOT NULL,
    anomaly_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    affected_file_paths_json TEXT NOT NULL,
    affected_entity_ids_json TEXT,
    details_json TEXT,
    suggested_action TEXT,
    is_resolved INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_anomaly_rule ON anomaly_reports(anomaly_rule_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_severity ON anomaly_reports(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_session ON anomaly_reports(scan_session_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_resolved ON anomaly_reports(is_resolved);
