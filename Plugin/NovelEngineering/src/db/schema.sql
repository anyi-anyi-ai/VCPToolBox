-- ============================================================================
-- VCPNovelManager SQLite Database Schema v3.0.0
-- Target Engine: better-sqlite3 (v12.4.1+)
-- Architecture: 3-ID Separation (source_file_id, entity_db_id, entity_id)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Schema Version & Migration History Tables
-- ----------------------------------------------------------------------------
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
CREATE INDEX IF NOT EXISTS idx_migration_history_status ON migration_history(status);

-- ----------------------------------------------------------------------------
-- 1. Scan Manifests Table (Audit & Incremental Sync Tracker)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. Source Files Table (Indexed Markdown, Canvas & Lore Documents)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS source_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT NOT NULL UNIQUE,          -- Normalized absolute file path
    relative_path TEXT NOT NULL UNIQUE,      -- Normalized POSIX path relative to vault root
    file_name TEXT NOT NULL,                 -- Base filename with extension (e.g. "PL-001_Terra.md")
    extension TEXT NOT NULL,                 -- File extension (e.g. ".md", ".canvas")
    size_bytes INTEGER NOT NULL,             -- File size in bytes
    mtime_ms INTEGER NOT NULL,               -- File last modified timestamp in milliseconds
    sha256_hash TEXT NOT NULL,               -- SHA-256 content digest (64 hex characters)
    source_category TEXT NOT NULL,           -- 'planet', 'character', 'organization', 'timeline', 'chapter', 'foreshadowing', 'lore', 'concept', 'draft', 'archive', 'unclassified'
    status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'draft', 'placeholder', 'archived', 'deleted'
    review_status TEXT NOT NULL DEFAULT 'unreviewed', -- 'confirmed', 'draft', 'ai_generated', 'unreviewed', 'conflicted'
    canon_level INTEGER NOT NULL DEFAULT 0,  -- 0 = draft/unreviewed, 1 = reference/candidate, 2 = reviewed, 3 = core_canon
    has_frontmatter INTEGER NOT NULL DEFAULT 0,       -- 1 if valid YAML frontmatter was parsed, else 0
    frontmatter_raw TEXT,                    -- Exact raw frontmatter string
    frontmatter_json TEXT,                   -- Parsed frontmatter as JSON object string
    line_count INTEGER NOT NULL DEFAULT 0,   -- Total lines in file
    word_count INTEGER NOT NULL DEFAULT 0,   -- Estimated Chinese/English word count
    is_placeholder INTEGER NOT NULL DEFAULT 0,        -- 1 if classified as empty/stub file
    placeholder_reason TEXT,                 -- Reason code: 'FILE_SIZE_LE_30B', 'EMPTY_BODY', 'STUB_KEYWORD', NULL
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
CREATE INDEX IF NOT EXISTS idx_source_files_canon ON source_files(canon_level);
CREATE INDEX IF NOT EXISTS idx_source_files_placeholder ON source_files(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_source_files_mtime ON source_files(mtime_ms);

-- ----------------------------------------------------------------------------
-- 3. Entities Table (Extracted Lore Entities: Planets, Characters, Orgs, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,    -- entity_db_id (Internal DB Primary Key)
    entity_id TEXT NOT NULL,                 -- Canonical Business/Canon ID (e.g. "PL-001", "CHAR-007", "ORG-03")
    canonical_name TEXT NOT NULL,            -- Primary canonical name (e.g. "泰拉", "艾莉亚")
    entity_type TEXT NOT NULL,               -- 'planet', 'character', 'organization', 'item', 'location', 'technology', 'concept', 'event'
    category TEXT,                           -- Subcategory (e.g. "rocky_planet", "military_org", "ftl_drive")
    status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'deprecated', 'draft', 'placeholder', 'merged'
    review_status TEXT NOT NULL DEFAULT 'unreviewed', -- 'confirmed', 'draft', 'ai_generated', 'unreviewed', 'conflicted'
    canon_level INTEGER NOT NULL DEFAULT 0,  -- 0 = draft, 1 = reference, 2 = reviewed, 3 = core_canon
    summary TEXT,                            -- Brief single-sentence summary
    description TEXT,                        -- Extracted full text / biography
    attributes_json TEXT,                    -- Extracted key-value attributes (gravity, population, affiliation)
    source_file_id INTEGER,                  -- Foreign key to originating source file (Nullable decoupled reference)
    line_number INTEGER NOT NULL DEFAULT 1,  -- Line where entity definition starts
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entities_entity_id ON entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_entities_canonical_name ON entities(canonical_name);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_entities_source_file ON entities(source_file_id);
CREATE INDEX IF NOT EXISTS idx_entities_review_status ON entities(review_status);
CREATE INDEX IF NOT EXISTS idx_entities_canon ON entities(canon_level);
CREATE INDEX IF NOT EXISTS idx_entities_type_name ON entities(entity_type, canonical_name);

-- ----------------------------------------------------------------------------
-- 4. Entity Aliases Table (Synonyms, Translations, Nicknames, Legacy IDs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entity_aliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id INTEGER NOT NULL,              -- Foreign key to entities table (entity_db_id)
    alias_name TEXT NOT NULL,                -- Alternative name (e.g. "地球", "母星", "OLD-PL-01")
    alias_type TEXT NOT NULL DEFAULT 'nickname', -- 'nickname', 'abbreviation', 'former_name', 'legacy_id', 'code_name', 'translation', 'spelling_variant'
    is_primary INTEGER NOT NULL DEFAULT 0,   -- 1 if alias is the designated primary display alias
    source_file_id INTEGER,                  -- Originating source file where alias was registered
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity_id ON entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_name ON entity_aliases(alias_name);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_type ON entity_aliases(alias_type);

-- ----------------------------------------------------------------------------
-- 5. File Entities (Mention & Cross-Reference Linkage)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_file_id INTEGER NOT NULL,         -- Mentioning file
    entity_id INTEGER NOT NULL,              -- Referenced entity (entity_db_id)
    mention_type TEXT NOT NULL DEFAULT 'referenced', -- 'definition', 'primary_subject', 'supplement', 'conflict', 'referenced', 'wikilink', 'tag'
    mention_count INTEGER NOT NULL DEFAULT 1,-- Occurrence count in document
    occurrences_json TEXT,                   -- Array of line numbers and snippet contexts
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    UNIQUE(source_file_id, entity_id, mention_type)
);

CREATE INDEX IF NOT EXISTS idx_file_entities_file ON file_entities(source_file_id);
CREATE INDEX IF NOT EXISTS idx_file_entities_entity ON file_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_file_entities_type ON file_entities(mention_type);

-- ----------------------------------------------------------------------------
-- 6. Entity Relations Table (M:N Knowledge Graph & Inter-Entity Links)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entity_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_entity_id INTEGER NOT NULL,       -- Foreign key to entities(id)
    target_entity_id INTEGER NOT NULL,       -- Foreign key to entities(id)
    relation_type TEXT NOT NULL,             -- 'ally_of', 'hostile_to', 'located_in', 'parent_of', 'member_of', 'controls', 'created_by', 'subordinate_to', 'possesses', 'opposes'
    weight REAL NOT NULL DEFAULT 1.0,        -- Relation strength (0.0 to 1.0+)
    confidence REAL NOT NULL DEFAULT 1.0,    -- Extraction / rule confidence (0.0 to 1.0)
    bidirectional INTEGER NOT NULL DEFAULT 0,
    description TEXT,                        -- Narrative context explaining relation
    attributes_json TEXT,                    -- Key-value attributes describing relation
    source_file_id INTEGER,                  -- Originating source file
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

-- ----------------------------------------------------------------------------
-- 7. Canon Changes Table (Governance Audit Log & State Transition Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS canon_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_type TEXT NOT NULL,               -- 'PROMOTE_CANON', 'DEPRECATE_SOURCE', 'SET_REVIEW_STATUS', 'ROLLBACK_CANON', 'MERGE_ENTITY', 'MANUAL_OVERRIDE'
    target_type TEXT NOT NULL,               -- 'source_file', 'entity', 'chapter', 'timeline_event', 'foreshadowing', 'relation'
    target_id TEXT NOT NULL,                 -- Polymorphic target ID (file relative path, canon entity ID, or PK string)
    target_db_id INTEGER,
    before_state_json TEXT,                  -- JSON snapshot of target state before mutation
    after_state_json TEXT,                   -- JSON snapshot of target state after mutation
    old_value_json TEXT,
    new_value_json TEXT,
    confirmation_token TEXT NOT NULL DEFAULT 'CONFIRM_CANON_CHANGE', -- Verification token (e.g. 'CONFIRM_CANON_CHANGE')
    confirmed_by_flag INTEGER NOT NULL DEFAULT 0,
    operator TEXT NOT NULL DEFAULT 'system', -- User, agent, or automated process identifier
    reason TEXT,                             -- Rationale / justification for mutation
    impact_summary_json TEXT,                -- Computed blast radius summary (affected files, entities, chapters)
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_canon_changes_type ON canon_changes(change_type);
CREATE INDEX IF NOT EXISTS idx_canon_changes_target ON canon_changes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_canon_changes_created ON canon_changes(created_at);

-- ----------------------------------------------------------------------------
-- 8. Timeline Events Table (Chronological Lore & In-Universe History)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,                  -- Canon event identifier (e.g. "EV-2042-01", "TL-001")
    title TEXT NOT NULL,                     -- Event title
    era_epoch TEXT NOT NULL DEFAULT 'CE',    -- '纪元前', '星际纪元', '旧历', '新历', 'CE', 'AD'
    timestamp_order REAL NOT NULL,           -- Continuous float for linear sorting (e.g. 2042.0815)
    timeline_year INTEGER,                   -- Integer year
    timeline_month INTEGER,                  -- Integer month (1-12)
    timeline_day INTEGER,                    -- Integer day (1-31)
    relative_time_desc TEXT,                 -- Human string (e.g. "泰拉历 340 年冬", "大灾变后第三周")
    description TEXT,                        -- Event narrative description
    source_file_id INTEGER,                  -- Originating source file (nullable)
    primary_entity_id INTEGER,               -- Central entity associated with event (references entities(id))
    participant_entity_ids_json TEXT,        -- JSON array of associated entity IDs [1, 4, 12]
    causality_prerequisite_ids_json TEXT,    -- JSON array of event_ids that causally precede this
    causality_consequence_ids_json TEXT,     -- JSON array of event_ids triggered by this
    status TEXT NOT NULL DEFAULT 'active',   -- 'active', 'draft', 'planned', 'alternate_branch', 'discarded'
    time_type TEXT NOT NULL DEFAULT 'exact', -- 'exact', 'interval', 'relative', 'fuzzy'
    interval_start REAL,                     -- Interval start timestamp (for time_type = 'interval')
    interval_end REAL,                       -- Interval end timestamp (for time_type = 'interval')
    base_event_id TEXT,                      -- Reference event ID (for time_type = 'relative')
    relative_offset REAL,                    -- Time offset relative to base event (for time_type = 'relative')
    fuzzy_time_desc TEXT,                    -- Fuzzy narrative time expression (for time_type = 'fuzzy')
    time_point_json TEXT,                    -- Serialized structured time_point object
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(primary_entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_order ON timeline_events(timestamp_order);
CREATE INDEX IF NOT EXISTS idx_timeline_event_id ON timeline_events(event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_source_file ON timeline_events(source_file_id);
CREATE INDEX IF NOT EXISTS idx_timeline_primary_entity ON timeline_events(primary_entity_id);
CREATE INDEX IF NOT EXISTS idx_timeline_time_type ON timeline_events(time_type);
CREATE INDEX IF NOT EXISTS idx_timeline_base_event ON timeline_events(base_event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_interval ON timeline_events(interval_start, interval_end);

-- ----------------------------------------------------------------------------
-- 9. Chapters Table (Novel Manuscript Volume & Chapter Structure)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_number REAL NOT NULL,            -- Supports decimal chapters (e.g. 1, 2, 2.5, 100)
    volume_number INTEGER NOT NULL DEFAULT 1,-- Volume / Book index
    title TEXT NOT NULL,                     -- Chapter title
    relative_path TEXT NOT NULL,             -- File relative path
    source_file_id INTEGER,                  -- Link to source file record (nullable for virtual drafts)
    word_count INTEGER NOT NULL DEFAULT 0,   -- Chapter word count
    status TEXT NOT NULL DEFAULT 'draft',    -- 'outline', 'draft', 'revising', 'completed', 'published', 'archived'
    canon INTEGER NOT NULL DEFAULT 0,        -- 1 = canonical lore, 0 = draft / unapproved
    timeline_start REAL,                     -- Associated starting timeline timestamp_order
    timeline_end REAL,                       -- Associated ending timeline timestamp_order
    pov_entity_id INTEGER,                   -- Point-of-view character entity ID (references entities(id))
    summary TEXT,                            -- Chapter synopsis
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(source_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(pov_entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_chapters_vol_num ON chapters(volume_number, chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapters_source_file ON chapters(source_file_id);
CREATE INDEX IF NOT EXISTS idx_chapters_status ON chapters(status);
CREATE INDEX IF NOT EXISTS idx_chapters_canon ON chapters(canon);

-- ----------------------------------------------------------------------------
-- 10. Foreshadowing Table (Narrative Clues, Setups & Payoffs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS foreshadowing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    foreshadow_id TEXT NOT NULL,             -- Canon clue ID (e.g. "FS-001", "HOOK-04")
    title TEXT NOT NULL,                     -- Short title
    description TEXT NOT NULL,               -- Description of the clue / plot hook
    setup_file_id INTEGER,                   -- Source file where setup appears
    setup_chapter_id INTEGER,                -- Chapter where setup appears
    setup_line INTEGER NOT NULL DEFAULT 1,   -- Line number in setup file
    setup_snippet TEXT,                      -- Excerpt containing the clue
    resolution_file_id INTEGER,              -- Source file where clue is resolved
    resolution_chapter_id INTEGER,           -- Chapter where payoff occurs
    resolution_line INTEGER,                 -- Line number in resolution file
    resolution_snippet TEXT,                 -- Excerpt containing payoff
    status TEXT NOT NULL DEFAULT 'open',     -- 'open', 'closed', 'abandoned', 'contradictory', 'pending_review'
    importance_level TEXT NOT NULL DEFAULT 'major', -- 'minor', 'medium', 'major', 'core_climax'
    tags_json TEXT,                          -- JSON array of category tags
    introduced_chapter TEXT,                 -- Chapter where clue is introduced
    target_resolve_chapter TEXT,             -- Planned resolution chapter
    actual_resolve_chapter TEXT,             -- Actual resolution chapter
    related_entities_json TEXT,              -- JSON array of related entity names/IDs
    resolution_notes TEXT,                   -- Extended resolution documentation
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY(setup_file_id) REFERENCES source_files(id) ON DELETE CASCADE,
    FOREIGN KEY(resolution_file_id) REFERENCES source_files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_foreshadow_id ON foreshadowing(foreshadow_id);
CREATE INDEX IF NOT EXISTS idx_foreshadow_status ON foreshadowing(status);
CREATE INDEX IF NOT EXISTS idx_foreshadow_setup_file ON foreshadowing(setup_file_id);
CREATE INDEX IF NOT EXISTS idx_foreshadow_res_file ON foreshadowing(resolution_file_id);
CREATE INDEX IF NOT EXISTS idx_foreshadow_intro_chap ON foreshadowing(introduced_chapter);
CREATE INDEX IF NOT EXISTS idx_foreshadow_target_chap ON foreshadowing(target_resolve_chapter);
CREATE INDEX IF NOT EXISTS idx_foreshadow_actual_chap ON foreshadowing(actual_resolve_chapter);

-- ----------------------------------------------------------------------------
-- 11. Anomaly Reports Table (Persistent Registry of Detected Conflicts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS anomaly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_session_id TEXT NOT NULL,           -- Associated scan session UUID
    anomaly_rule_id TEXT NOT NULL,           -- e.g. 'ANOM_001_SAME_NAME_DIFF_ID'
    anomaly_type TEXT NOT NULL,              -- Enum category string
    severity TEXT NOT NULL,                  -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'
    title TEXT NOT NULL,                     -- One-line summary of anomaly
    message TEXT NOT NULL,                   -- Human-readable explanation
    affected_file_paths_json TEXT NOT NULL,  -- JSON array of relative file paths
    affected_entity_ids_json TEXT,           -- JSON array of entity canonical IDs or DB IDs
    details_json TEXT,                       -- JSON object with exact conflicting keys, lines, differences
    suggested_action TEXT,                   -- Recommended mitigation / resolution step
    is_resolved INTEGER NOT NULL DEFAULT 0,  -- 0 = active conflict, 1 = ignored/resolved
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_anomaly_rule ON anomaly_reports(anomaly_rule_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_severity ON anomaly_reports(severity);
CREATE INDEX IF NOT EXISTS idx_anomaly_session ON anomaly_reports(scan_session_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_resolved ON anomaly_reports(is_resolved);
