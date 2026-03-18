package cosearch

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func newTestEnrichedQuery() *EnrichedQuery {
	return &EnrichedQuery{
		Intent: "test research",
		Dimensions: []Dimension{
			{
				ID:           "d1",
				Name:         "Factual",
				SubQuestions: []string{"What is X?", "How does X work?"},
			},
			{
				ID:           "d2",
				Name:         "Analytical",
				SubQuestions: []string{"Why is X important?"},
			},
		},
	}
}

func TestNewKnowledgeBase(t *testing.T) {
	kb, err := NewKnowledgeBase("test topic", newTestEnrichedQuery())
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	// Verify directory structure
	for _, sub := range []string{"", "knowledge_base", "sources"} {
		info, err := os.Stat(filepath.Join(kb.Dir(), sub))
		if err != nil || !info.IsDir() {
			t.Fatalf("expected directory %s to exist", sub)
		}
	}

	// Verify index.md was created
	idxContent, err := os.ReadFile(filepath.Join(kb.Dir(), "index.md"))
	if err != nil {
		t.Fatalf("index.md not created: %v", err)
	}
	if !strings.Contains(string(idxContent), "test topic") {
		t.Fatal("index.md missing topic")
	}

	if kb.TotalQuestions() != 3 {
		t.Fatalf("expected 3 total questions, got %d", kb.TotalQuestions())
	}
}

func TestKBWriteAndReadNote(t *testing.T) {
	kb, err := NewKnowledgeBase("test topic", newTestEnrichedQuery())
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	note := KBNote{
		DimID:    "d1",
		SQIndex:  1,
		Question: "What is X?",
		Content:  "X is a framework for testing.",
		Sources:  []string{"https://example.com/x"},
		Round:    1,
	}
	if err := kb.WriteNote(note); err != nil {
		t.Fatalf("WriteNote failed: %v", err)
	}

	content, err := kb.ReadNote("d1", 1)
	if err != nil {
		t.Fatalf("ReadNote failed: %v", err)
	}
	if !strings.Contains(content, "X is a framework") {
		t.Fatal("note content mismatch")
	}
	if !strings.Contains(content, "https://example.com/x") {
		t.Fatal("note missing source")
	}
}

func TestKBCoverageAndGaps(t *testing.T) {
	kb, err := NewKnowledgeBase("test", newTestEnrichedQuery())
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	// Initially: 0% coverage, 3 gaps
	if kb.Coverage() != 0.0 {
		t.Fatalf("expected 0%% coverage, got %.2f", kb.Coverage())
	}
	gaps := kb.Gaps()
	if len(gaps) != 3 {
		t.Fatalf("expected 3 gaps, got %d", len(gaps))
	}

	// Cover one sub-question
	kb.WriteNote(KBNote{DimID: "d1", SQIndex: 1, Question: "q1", Content: "answer", Round: 1})

	expectedCov := 1.0 / 3.0
	if cov := kb.Coverage(); cov < expectedCov-0.01 || cov > expectedCov+0.01 {
		t.Fatalf("expected ~%.2f coverage, got %.2f", expectedCov, cov)
	}
	if len(kb.Gaps()) != 2 {
		t.Fatalf("expected 2 gaps, got %d", len(kb.Gaps()))
	}

	// Cover all
	kb.WriteNote(KBNote{DimID: "d1", SQIndex: 2, Question: "q2", Content: "answer", Round: 1})
	kb.WriteNote(KBNote{DimID: "d2", SQIndex: 1, Question: "q3", Content: "answer", Round: 2})

	if kb.Coverage() != 1.0 {
		t.Fatalf("expected 100%% coverage, got %.2f", kb.Coverage())
	}
	if len(kb.Gaps()) != 0 {
		t.Fatalf("expected 0 gaps, got %d", len(kb.Gaps()))
	}
}

func TestKBReadAllNotes(t *testing.T) {
	kb, err := NewKnowledgeBase("test", newTestEnrichedQuery())
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	kb.WriteNote(KBNote{DimID: "d1", SQIndex: 1, Question: "q1", Content: "a1", Round: 1})
	kb.WriteNote(KBNote{DimID: "d2", SQIndex: 1, Question: "q3", Content: "a3", Round: 1})

	notes, err := kb.ReadAllNotes()
	if err != nil {
		t.Fatalf("ReadAllNotes failed: %v", err)
	}
	if len(notes) != 2 {
		t.Fatalf("expected 2 notes, got %d", len(notes))
	}
	// Should be ordered by plan (d1 before d2)
	if notes[0].DimID != "d1" || notes[1].DimID != "d2" {
		t.Fatalf("unexpected order: %s, %s", notes[0].DimID, notes[1].DimID)
	}
}

func TestKBSources(t *testing.T) {
	kb, err := NewKnowledgeBase("test", newTestEnrichedQuery())
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	kb.AddSources([]string{"https://a.com", "https://b.com"})
	kb.AddSources([]string{"https://a.com", "https://c.com", ""})

	if len(kb.Sources()) != 3 {
		t.Fatalf("expected 3 unique sources, got %d", len(kb.Sources()))
	}

	if err := kb.WriteSources(); err != nil {
		t.Fatalf("WriteSources failed: %v", err)
	}

	content, err := os.ReadFile(filepath.Join(kb.Dir(), "sources", "sources.md"))
	if err != nil {
		t.Fatalf("read sources.md failed: %v", err)
	}
	if !strings.Contains(string(content), "https://c.com") {
		t.Fatal("sources.md missing expected URL")
	}
}

func TestKBWriteIndexUpdates(t *testing.T) {
	kb, err := NewKnowledgeBase("test", newTestEnrichedQuery())
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	kb.WriteNote(KBNote{DimID: "d1", SQIndex: 1, Question: "q1", Content: "a", Round: 1})
	kb.WriteIndex()

	content, _ := os.ReadFile(filepath.Join(kb.Dir(), "index.md"))
	s := string(content)
	if !strings.Contains(s, "[x]") {
		t.Fatal("index.md should have checked item")
	}
	if !strings.Contains(s, "[ ]") {
		t.Fatal("index.md should have unchecked items")
	}
	if !strings.Contains(s, "33.3%") {
		t.Fatalf("index.md should show 33.3%% coverage, got:\n%s", s)
	}
}

func TestKBCoverageEmptyPlan(t *testing.T) {
	eq := &EnrichedQuery{Intent: "empty", Dimensions: []Dimension{}}
	kb, err := NewKnowledgeBase("empty", eq)
	if err != nil {
		t.Fatalf("NewKnowledgeBase failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	if kb.Coverage() != 1.0 {
		t.Fatalf("expected 1.0 for empty plan, got %.2f", kb.Coverage())
	}
	if len(kb.Gaps()) != 0 {
		t.Fatalf("expected 0 gaps for empty plan, got %d", len(kb.Gaps()))
	}
}
