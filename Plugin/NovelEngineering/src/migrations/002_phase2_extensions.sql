-- ============================================================================
-- Migration 002: Phase 2 Extensions (Timeline Multi-Modal & Foreshadowing Lifecycle)
-- Target Database: better-sqlite3 (v12.4.1+)
-- ============================================================================

-- 1. Timeline Events Multi-Modal Extensions
ALTER TABLE timeline_events ADD COLUMN time_type TEXT NOT NULL DEFAULT 'exact';
ALTER TABLE timeline_events ADD COLUMN interval_start REAL;
ALTER TABLE timeline_events ADD COLUMN interval_end REAL;
ALTER TABLE timeline_events ADD COLUMN base_event_id TEXT;
ALTER TABLE timeline_events ADD COLUMN relative_offset REAL;
ALTER TABLE timeline_events ADD COLUMN fuzzy_time_desc TEXT;
ALTER TABLE timeline_events ADD COLUMN time_point_json TEXT;

CREATE INDEX IF NOT EXISTS idx_timeline_time_type ON timeline_events(time_type);
CREATE INDEX IF NOT EXISTS idx_timeline_base_event ON timeline_events(base_event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_interval ON timeline_events(interval_start, interval_end);

-- 2. Foreshadowing Lifecycle & Entity Tracking Extensions
ALTER TABLE foreshadowing ADD COLUMN introduced_chapter TEXT;
ALTER TABLE foreshadowing ADD COLUMN target_resolve_chapter TEXT;
ALTER TABLE foreshadowing ADD COLUMN actual_resolve_chapter TEXT;
ALTER TABLE foreshadowing ADD COLUMN related_entities_json TEXT;
ALTER TABLE foreshadowing ADD COLUMN resolution_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_foreshadow_intro_chap ON foreshadowing(introduced_chapter);
CREATE INDEX IF NOT EXISTS idx_foreshadow_target_chap ON foreshadowing(target_resolve_chapter);
CREATE INDEX IF NOT EXISTS idx_foreshadow_actual_chap ON foreshadowing(actual_resolve_chapter);
