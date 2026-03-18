package cosearch

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestExtractClaims(t *testing.T) {
	text := "这是第一个事实。这是第二个事实。短句。"
	claims := extractClaims(text)
	// "短句。" is < 8 runes, should be skipped
	if len(claims) != 2 {
		t.Fatalf("expected 2 claims, got %d: %v", len(claims), claims)
	}
}

func TestExtractClaims_English(t *testing.T) {
	text := "This is the first claim. This is the second claim. Hi."
	claims := extractClaims(text)
	if len(claims) != 2 {
		t.Fatalf("expected 2 claims, got %d: %v", len(claims), claims)
	}
}

func TestExtractClaims_Empty(t *testing.T) {
	if claims := extractClaims(""); claims != nil {
		t.Fatalf("expected nil for empty, got %v", claims)
	}
}

func TestComputeIG_FirstRound(t *testing.T) {
	m := NewMetricsTracker()
	texts := map[string]string{
		"q1": "这是一个全新的研究发现，具有重要意义。另一个发现也非常关键。",
	}
	ig := m.computeIG(texts)
	// First round: all claims are new
	if ig != 1.0 {
		t.Fatalf("expected IG=1.0 for first round, got %.2f", ig)
	}
}

func TestComputeIG_SecondRound_Partial(t *testing.T) {
	m := NewMetricsTracker()
	texts1 := map[string]string{
		"q1": "这是一个全新的研究发现，具有重要意义。",
	}
	m.computeIG(texts1) // seed known claims

	texts2 := map[string]string{
		"q1": "这是一个全新的研究发现，具有重要意义。这是第二轮的新发现。",
	}
	ig := m.computeIG(texts2)
	// 2 claims total, 1 new → IG = 0.5
	if ig < 0.49 || ig > 0.51 {
		t.Fatalf("expected IG≈0.5, got %.2f", ig)
	}
}

func TestComputeSR_NoPrevious(t *testing.T) {
	m := NewMetricsTracker()
	sr := m.computeSR(map[string]string{"q1": "some text here"})
	if sr != 0.0 {
		t.Fatalf("expected SR=0 with no previous, got %.2f", sr)
	}
}

func TestComputeSR_IdenticalTexts(t *testing.T) {
	m := NewMetricsTracker()
	m.prevTexts["q1"] = "this is the same text content for testing"
	sr := m.computeSR(map[string]string{"q1": "this is the same text content for testing"})
	if sr < 0.99 {
		t.Fatalf("expected SR≈1.0 for identical texts, got %.2f", sr)
	}
}

func TestComputeSR_DifferentTexts(t *testing.T) {
	m := NewMetricsTracker()
	m.prevTexts["q1"] = "alpha beta gamma delta epsilon"
	sr := m.computeSR(map[string]string{"q1": "zeta eta theta iota kappa"})
	if sr != 0.0 {
		t.Fatalf("expected SR=0 for completely different texts, got %.2f", sr)
	}
}

func TestRecordRound(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", Name: "A", SubQuestions: []string{"What?", "How?"}},
		},
	}
	kb, err := NewKnowledgeBase("test", eq)
	if err != nil {
		t.Fatalf("KB creation failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	m := NewMetricsTracker()

	// Round 1
	texts := map[string]string{"q1": "这是一个重要的研究发现和结论。"}
	metrics := m.RecordRound(1, kb, texts, RoundAuditInput{
		GapBefore: 2,
		GapAfter:  1,
		Results: map[string]SearchResult{
			"q1": {
				Keyword: "q1",
				Retry: RetryAudit{
					Attempts:       2,
					RetryCount:     1,
					BackoffDelayMS: 120,
				},
			},
		},
	})

	if metrics.Round != 1 {
		t.Fatalf("expected round=1, got %d", metrics.Round)
	}
	if metrics.IG != 1.0 {
		t.Fatalf("expected IG=1.0 for first round, got %.2f", metrics.IG)
	}
	if metrics.TC != 0.0 {
		t.Fatalf("expected TC=0.0 (nothing covered yet), got %.2f", metrics.TC)
	}
	if metrics.Retry.TotalRetries != 1 {
		t.Fatalf("expected retry count=1, got %d", metrics.Retry.TotalRetries)
	}
	if metrics.Gap.Closed != 1 {
		t.Fatalf("expected gap closed=1, got %d", metrics.Gap.Closed)
	}

	if len(m.History()) != 1 {
		t.Fatalf("expected 1 history entry, got %d", len(m.History()))
	}
}

func TestShouldStop(t *testing.T) {
	m := NewMetricsTracker()
	m.history = []RoundMetrics{
		{Round: 1, IG: 0.8},
		{Round: 2, IG: 0.05},
		{Round: 3, IG: 0.03},
	}

	// IG < 0.1 for 2 consecutive rounds → should stop
	if !m.ShouldStop(0.1, 2) {
		t.Fatal("expected ShouldStop=true")
	}

	// But not for 3 consecutive (round 1 had 0.8)
	if m.ShouldStop(0.1, 3) {
		t.Fatal("expected ShouldStop=false for 3 consecutive")
	}
}

func TestShouldStop_NotEnoughRounds(t *testing.T) {
	m := NewMetricsTracker()
	m.history = []RoundMetrics{{Round: 1, IG: 0.01}}

	if m.ShouldStop(0.1, 2) {
		t.Fatal("should not stop with only 1 round")
	}
}

func TestWriteJSON(t *testing.T) {
	m := NewMetricsTracker()
	m.history = []RoundMetrics{
		{Round: 1, IG: 0.9, TC: 0.3, SR: 0.0},
		{Round: 2, IG: 0.4, TC: 0.7, SR: 0.3},
	}

	dir := t.TempDir()
	path, err := m.WriteJSON(dir)
	if err != nil {
		t.Fatalf("WriteJSON failed: %v", err)
	}

	content, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read metrics.json failed: %v", err)
	}

	s := string(content)
	if !strings.Contains(s, "\"ig\": 0.9") {
		t.Fatalf("metrics.json missing expected data: %s", s)
	}
	if !strings.Contains(s, "\"retry\"") || !strings.Contains(s, "\"gap\"") {
		t.Fatalf("metrics.json missing retry/gap fields: %s", s)
	}
	if filepath.Base(path) != "metrics.json" {
		t.Fatalf("expected metrics.json, got %s", path)
	}
}

func TestLatest(t *testing.T) {
	m := NewMetricsTracker()
	if m.Latest().Round != 0 {
		t.Fatal("expected zero for empty history")
	}
	m.history = []RoundMetrics{{Round: 3, IG: 0.1}}
	if m.Latest().Round != 3 {
		t.Fatal("expected round 3")
	}
}
