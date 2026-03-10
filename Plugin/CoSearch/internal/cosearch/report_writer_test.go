package cosearch

import (
	"os"
	"strings"
	"testing"
	"time"
)

func buildTestCBResult(t *testing.T) *CBResult {
	t.Helper()
	eq := testEnrichedQuery()

	// Use DummyBuildContext to get a CBResult
	round1 := map[string]SearchResult{
		"X definition": {
			Keyword:   "X definition",
			Round:     1,
			Text:      "X is a distributed systems framework created in 2020. It provides consensus mechanisms and fault tolerance.",
			Citations: []Citation{{URL: "https://example.com/x"}},
		},
		"X mechanism": {
			Keyword:   "X mechanism",
			Round:     1,
			Text:      "X works through a novel consensus algorithm that combines Raft and PBFT approaches for better throughput.",
			Citations: []Citation{{URL: "https://example.com/x-how"}},
		},
		"X importance impact": {
			Keyword:   "X importance impact",
			Round:     1,
			Text:      "X is important because it reduces distributed system complexity by 40%. Industry adoption has grown rapidly.",
			Citations: []Citation{{URL: "https://example.com/x-why"}},
		},
	}

	result, err := DummyBuildContext("X research", eq, []map[string]SearchResult{round1})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	return result
}

func TestDummyWriteReport(t *testing.T) {
	cb := buildTestCBResult(t)
	defer os.RemoveAll(cb.KB.Dir())

	req := Request{SearchTopic: "X research"}
	profile := ModeProfile{Name: "deep", MaxRounds: 10}
	start := time.Now()

	rw := DummyWriteReport(cb, req, profile, true, start)

	if rw.Report.Title != "CoSearch 深度研究报告" {
		t.Fatalf("unexpected title: %s", rw.Report.Title)
	}
	if rw.Report.Topic != "X research" {
		t.Fatalf("unexpected topic: %s", rw.Report.Topic)
	}
	if rw.Report.Mode != "deep" {
		t.Fatalf("unexpected mode: %s", rw.Report.Mode)
	}
}

func TestDummyWriteReport_Layers(t *testing.T) {
	cb := buildTestCBResult(t)
	defer os.RemoveAll(cb.KB.Dir())

	req := Request{SearchTopic: "X research"}
	profile := ModeProfile{Name: "deep", MaxRounds: 10}

	rw := DummyWriteReport(cb, req, profile, true, time.Now())

	// L1 should contain topic and coverage
	if !strings.Contains(rw.Layers.L1Conclusion, "X research") {
		t.Fatal("L1 missing topic")
	}
	if !strings.Contains(rw.Layers.L1Conclusion, "100%") {
		t.Fatal("L1 missing coverage")
	}

	// L2 should contain signal details
	if !strings.Contains(rw.Layers.L2Signals, "(L2)") {
		t.Fatal("L2 header missing")
	}

	// L3 should contain sources (showURL=true)
	if !strings.Contains(rw.Layers.L3Evidence, "example.com") {
		t.Fatal("L3 missing sources")
	}

	// L4 should contain metrics
	if !strings.Contains(rw.Layers.L4Trace, "IG=") {
		t.Fatal("L4 missing metrics")
	}
	if !strings.Contains(rw.Layers.L4Trace, "retry:") {
		t.Fatal("L4 missing retry details")
	}
	if !strings.Contains(rw.Layers.L4Trace, "gap:") {
		t.Fatal("L4 missing gap details")
	}
}

func TestDummyWriteReport_NoShowURL(t *testing.T) {
	cb := buildTestCBResult(t)
	defer os.RemoveAll(cb.KB.Dir())

	req := Request{SearchTopic: "X"}
	profile := ModeProfile{Name: "deep", MaxRounds: 10}

	rw := DummyWriteReport(cb, req, profile, false, time.Now())

	// L3 should be empty when showURL=false
	if strings.Contains(rw.Layers.L3Evidence, "example.com") {
		t.Fatal("L3 should not contain URLs when showURL=false")
	}

	// Items should not have sources
	for _, item := range rw.Report.Items {
		if len(item.Sources) > 0 {
			t.Fatal("items should not have sources when showURL=false")
		}
	}
}

func TestDummyWriteReport_Items(t *testing.T) {
	cb := buildTestCBResult(t)
	defer os.RemoveAll(cb.KB.Dir())

	req := Request{SearchTopic: "X"}
	profile := ModeProfile{Name: "deep", MaxRounds: 10}

	rw := DummyWriteReport(cb, req, profile, true, time.Now())

	if len(rw.Report.Items) != 3 {
		t.Fatalf("expected 3 items, got %d", len(rw.Report.Items))
	}

	// Each item should have a signal grade
	for _, item := range rw.Report.Items {
		if item.SignalGrade == "" {
			t.Fatalf("item %s missing signal grade", item.Keyword)
		}
	}
}

func TestBuildL4Trace(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{{ID: "d1", SubQuestions: []string{"Q1"}}},
	}
	kb, _ := NewKnowledgeBase("test", eq)
	defer os.RemoveAll(kb.Dir())

	metrics := NewMetricsTracker()
	metrics.history = []RoundMetrics{
		{
			Round: 1,
			IG:    0.9,
			TC:    0.5,
			SR:    0.0,
			Retry: RetryRoundStats{
				Queries:        2,
				RetriedQueries: 1,
				TotalAttempts:  3,
				TotalRetries:   1,
				TotalBackoffMS: 120,
				ExhaustedCount: 0,
			},
			Gap: GapRoundStats{
				Before: 3,
				After:  2,
				Closed: 1,
			},
		},
		{
			Round: 2,
			IG:    0.3,
			TC:    1.0,
			SR:    0.2,
			Retry: RetryRoundStats{
				Queries:        2,
				RetriedQueries: 0,
				TotalAttempts:  2,
				TotalRetries:   0,
				TotalBackoffMS: 0,
				ExhaustedCount: 0,
			},
			Gap: GapRoundStats{
				Before: 2,
				After:  0,
				Closed: 2,
			},
		},
	}

	cb := &CBResult{
		KB:         kb,
		Metrics:    metrics,
		Rounds:     2,
		StopReason: "TC=1.0",
		RoundFiles: []string{"round-1.md", "round-2.md"},
	}

	l4 := buildL4Trace(cb)

	if !strings.Contains(l4, "rounds: 2") {
		t.Fatal("L4 missing rounds")
	}
	if !strings.Contains(l4, "TC=1.0") {
		t.Fatal("L4 missing stop reason")
	}
	if !strings.Contains(l4, "IG=0.90") {
		t.Fatal("L4 missing IG metric")
	}
	if !strings.Contains(l4, "retry: queries=2 retried=1 attempts=3 retries=1 backoff=120ms exhausted=0") {
		t.Fatal("L4 missing retry detail line")
	}
	if !strings.Contains(l4, "gap: before=3 after=2 closed=1") {
		t.Fatal("L4 missing gap detail line")
	}
	if !strings.Contains(l4, "round-1.md") {
		t.Fatal("L4 missing round file")
	}
}

func TestBuildDefaultOutline(t *testing.T) {
	cb := buildTestCBResult(t)
	defer os.RemoveAll(cb.KB.Dir())

	outline := buildDefaultOutline(cb)
	if !strings.Contains(outline, "大纲") {
		t.Fatal("outline missing header")
	}
	if !strings.Contains(outline, "总结与建议") {
		t.Fatal("outline missing conclusion section")
	}
}
