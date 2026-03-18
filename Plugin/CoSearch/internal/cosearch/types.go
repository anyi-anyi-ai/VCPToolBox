package cosearch

import "time"

type Request struct {
	SearchTopic string `json:"SearchTopic"`
	Keywords    any    `json:"Keywords"`
	ShowURL     any    `json:"ShowURL,omitempty"`
	Mode        string `json:"Mode,omitempty"`
	RequestID   string `json:"RequestID,omitempty"`
}

type Response struct {
	Status    string       `json:"status"`
	Result    string       `json:"result,omitempty"`
	Error     string       `json:"error,omitempty"`
	ErrorCode string       `json:"error_code,omitempty"`
	Mode      string       `json:"mode"`
	RequestID string       `json:"request_id,omitempty"`
	Meta      *Meta        `json:"meta,omitempty"`
	Report    *Report      `json:"report,omitempty"`
	Layers    *ReportLayer `json:"layers,omitempty"`
}

type Meta struct {
	DurationMS      int64  `json:"duration_ms"`
	KeywordCount    int    `json:"keyword_count"`
	SuccessCount    int    `json:"success_count"`
	FailedCount     int    `json:"failed_count"`
	Timestamp       string `json:"timestamp"`
	ProtocolVersion string `json:"protocol_version"`
	RequestID       string `json:"request_id,omitempty"`
	RunID           string `json:"run_id,omitempty"`
	ArtifactDir     string `json:"artifact_dir,omitempty"`
}

type Report struct {
	Title      string       `json:"title"`
	Topic      string       `json:"topic"`
	Mode       string       `json:"mode"`
	Rounds     int          `json:"rounds"`
	Items      []ReportItem `json:"items"`
	Stats      ReportStats  `json:"stats"`
	Stopped    string       `json:"stopped_reason"`
	RoundMD    []string     `json:"round_md_files,omitempty"`
	ReportMD   string       `json:"report_md_file,omitempty"`
	ReportJSON string       `json:"report_json_file,omitempty"`
	Started    time.Time    `json:"-"`
	Ended      time.Time    `json:"-"`
}

type ReportItem struct {
	Keyword       string   `json:"keyword"`
	Summary       string   `json:"summary"`
	Sources       []string `json:"sources,omitempty"`
	Failed        bool     `json:"failed"`
	Error         string   `json:"error,omitempty"`
	UsedRound     int      `json:"used_round"`
	SignalGrade   string   `json:"signal_grade"`
	F1Behavior    bool     `json:"f1_behavior_change"`
	F2Survival72h bool     `json:"f2_72h_survival"`
	F3Morphism    bool     `json:"f3_morphism"`
	Why           string   `json:"why,omitempty"`
}

type ReportStats struct {
	S1 int `json:"s1"`
	S2 int `json:"s2"`
	S3 int `json:"s3"`
	N  int `json:"n"`
}

type ReportLayer struct {
	L1Conclusion string `json:"l1_conclusion"`
	L2Signals    string `json:"l2_signals,omitempty"`
	L3Evidence   string `json:"l3_evidence,omitempty"`
	L4Trace      string `json:"l4_trace,omitempty"`
}

type ModeProfile struct {
	Name              string
	Concurrency       int
	MaxRounds         int
	Timeout           time.Duration
	SearchContextSize string
}

type SearchResult struct {
	Keyword   string
	Round     int
	Text      string
	Citations []Citation
	Retry     RetryAudit
	Err       error
}

type Citation struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}

type RetryAudit struct {
	Attempts       int   `json:"attempts"`
	RetryCount     int   `json:"retry_count"`
	BackoffDelayMS int64 `json:"backoff_delay_ms"`
	Exhausted      bool  `json:"exhausted,omitempty"`
}

type RetryRoundStats struct {
	Queries        int   `json:"queries"`
	RetriedQueries int   `json:"retried_queries"`
	TotalAttempts  int   `json:"total_attempts"`
	TotalRetries   int   `json:"total_retries"`
	TotalBackoffMS int64 `json:"total_backoff_delay_ms"`
	ExhaustedCount int   `json:"exhausted_count"`
}

type GapRoundStats struct {
	Before int `json:"before"`
	After  int `json:"after"`
	Closed int `json:"closed"`
}

type RoundAuditInput struct {
	GapBefore int
	GapAfter  int
	Results   map[string]SearchResult
}

// --- Enrichment types (v1.2) ---

type EnrichedQuery struct {
	Intent      string      `json:"intent"`
	Dimensions  []Dimension `json:"dimensions"`
	Constraints Constraints `json:"constraints,omitempty"`
}

type Dimension struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	InfoType        string   `json:"info_type"`
	SubQuestions    []string `json:"sub_questions"`
	SearchQueries   []string `json:"search_queries"`
	Keywords        []string `json:"keywords"`
	QualityCriteria []string `json:"quality_criteria"`
	Priority        int      `json:"priority"`
}

type Constraints struct {
	TimeRange     string `json:"time_range,omitempty"`
	Language      string `json:"language,omitempty"`
	Depth         string `json:"depth,omitempty"`
	MaxDimensions int    `json:"max_dimensions,omitempty"`
}
