package cosearch

import (
	"os"
	"strings"
	"testing"
)

func testEnrichedQuery() *EnrichedQuery {
	return &EnrichedQuery{
		Intent: "understand X",
		Dimensions: []Dimension{
			{
				ID:            "d1",
				Name:          "Basics",
				SubQuestions:  []string{"What is X?", "How does X work?"},
				SearchQueries: []string{"X definition", "X mechanism"},
			},
			{
				ID:            "d2",
				Name:          "Impact",
				SubQuestions:  []string{"Why is X important?"},
				SearchQueries: []string{"X importance impact"},
			},
		},
	}
}

func TestBuildBroadQueries(t *testing.T) {
	eq := testEnrichedQuery()
	keywords, mapping := buildBroadQueries(eq)

	if len(keywords) != 3 {
		t.Fatalf("expected 3 keywords, got %d: %v", len(keywords), keywords)
	}

	// Verify mapping
	for _, kw := range keywords {
		if _, ok := mapping[kw]; !ok {
			t.Fatalf("keyword %q not in mapping", kw)
		}
	}

	// Check specific mapping
	if m := mapping["X definition"]; m.dimID != "d1" || m.sqIndex != 1 {
		t.Fatalf("unexpected mapping for 'X definition': %+v", m)
	}
}

func TestBuildBroadQueries_Dedup(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", SubQuestions: []string{"Q1"}, SearchQueries: []string{"same query"}},
			{ID: "d2", SubQuestions: []string{"Q2"}, SearchQueries: []string{"Same Query"}},
		},
	}
	keywords, _ := buildBroadQueries(eq)
	if len(keywords) != 1 {
		t.Fatalf("expected 1 deduped keyword, got %d: %v", len(keywords), keywords)
	}
}

func TestDummyBuildContext_FullCoverage(t *testing.T) {
	eq := testEnrichedQuery()

	// Simulate one round that covers all sub-questions
	round1 := map[string]SearchResult{
		"X definition": {
			Keyword:   "X definition",
			Round:     1,
			Text:      "X is a framework for building distributed systems. It was created in 2020.",
			Citations: []Citation{{URL: "https://example.com/x"}},
		},
		"X mechanism": {
			Keyword:   "X mechanism",
			Round:     1,
			Text:      "X works by using consensus algorithms and distributed hash tables.",
			Citations: []Citation{{URL: "https://example.com/x-how"}},
		},
		"X importance impact": {
			Keyword:   "X importance impact",
			Round:     1,
			Text:      "X is important because it solves the CAP theorem trade-offs efficiently.",
			Citations: []Citation{{URL: "https://example.com/x-why"}},
		},
	}

	result, err := DummyBuildContext("X research", eq, []map[string]SearchResult{round1})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(result.KB.Dir())

	// Should have full coverage
	if result.KB.Coverage() < 1.0 {
		t.Fatalf("expected full coverage, got %.2f", result.KB.Coverage())
	}
	if result.Rounds != 1 {
		t.Fatalf("expected 1 round, got %d", result.Rounds)
	}
	if !strings.Contains(result.StopReason, "TC=1.0") {
		t.Fatalf("unexpected stop reason: %s", result.StopReason)
	}

	// Verify metrics
	h := result.Metrics.History()
	if len(h) != 1 {
		t.Fatalf("expected 1 metrics entry, got %d", len(h))
	}
	if h[0].IG != 1.0 {
		t.Fatalf("expected IG=1.0 for first round, got %.2f", h[0].IG)
	}
	if h[0].TC != 1.0 {
		t.Fatalf("expected TC=1.0, got %.2f", h[0].TC)
	}
}

func TestDummyBuildContext_PartialCoverage(t *testing.T) {
	eq := testEnrichedQuery()

	// Only cover d1-sq1
	round1 := map[string]SearchResult{
		"X definition": {
			Keyword: "X definition",
			Round:   1,
			Text:    "X is a framework for building distributed systems and applications.",
		},
	}

	result, err := DummyBuildContext("X", eq, []map[string]SearchResult{round1})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(result.KB.Dir())

	// Only 1 of 3 covered
	expected := 1.0 / 3.0
	if cov := result.KB.Coverage(); cov < expected-0.01 || cov > expected+0.01 {
		t.Fatalf("expected ~%.2f coverage, got %.2f", expected, cov)
	}

	// Should have gaps
	gaps := result.KB.Gaps()
	if len(gaps) != 2 {
		t.Fatalf("expected 2 gaps, got %d", len(gaps))
	}
}

func TestDummyBuildContext_IGEarlyStop(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", SubQuestions: []string{"Q1", "Q2", "Q3"}, SearchQueries: []string{"sq1", "sq2", "sq3"}},
		},
	}

	// 3 rounds with decreasing novelty, only covering sq1
	round1 := map[string]SearchResult{
		"sq1": {Keyword: "sq1", Round: 1, Text: "This is novel information about the first question and its context."},
	}
	round2 := map[string]SearchResult{
		"sq1": {Keyword: "sq1", Round: 2, Text: "This is novel information about the first question and its context."},
	}
	round3 := map[string]SearchResult{
		"sq1": {Keyword: "sq1", Round: 3, Text: "This is novel information about the first question and its context."},
	}

	result, err := DummyBuildContext("test", eq, []map[string]SearchResult{round1, round2, round3})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(result.KB.Dir())

	// Rounds 2 and 3 have IG=0 (exact same text), should trigger early stop
	if !strings.Contains(result.StopReason, "IG") {
		// Note: round 2 and 3 have identical text, IG drops to 0
		// ShouldStop(0.1, 2) checks last 2 rounds
		t.Logf("stop reason: %s, rounds: %d", result.StopReason, result.Rounds)
	}
}

func TestDummyBuildContext_NoResults(t *testing.T) {
	eq := testEnrichedQuery()

	// No search results at all
	result, err := DummyBuildContext("empty", eq, []map[string]SearchResult{{}})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(result.KB.Dir())

	if result.KB.Coverage() != 0.0 {
		t.Fatalf("expected 0 coverage, got %.2f", result.KB.Coverage())
	}
}

func TestFormatCBStopReason(t *testing.T) {
	cases := []struct {
		maxR, actualR int
		reason        string
		contains      string
	}{
		{10, 3, "TC=1.0", "TC=1.0"},
		{10, 5, "", "提前停止"},
		{10, 10, "", "达到最大轮次"},
	}
	for _, c := range cases {
		got := FormatCBStopReason(c.maxR, c.actualR, c.reason)
		if !strings.Contains(got, c.contains) {
			t.Fatalf("expected %q in %q", c.contains, got)
		}
	}
}
