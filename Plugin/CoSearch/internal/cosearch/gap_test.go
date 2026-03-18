package cosearch

import (
	"os"
	"testing"
)

func TestAnalyzeGaps_AllUncovered(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", Name: "A", SubQuestions: []string{"What is X?", "How does X work?"}},
			{ID: "d2", Name: "B", SubQuestions: []string{"Why X?"}},
		},
	}
	kb, err := NewKnowledgeBase("test topic", eq)
	if err != nil {
		t.Fatalf("KB failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	ga := AnalyzeGaps(kb, "test topic")
	if !ga.HasGaps {
		t.Fatal("expected HasGaps=true")
	}
	if ga.GapCount != 3 {
		t.Fatalf("expected 3 gaps, got %d", ga.GapCount)
	}
	if ga.TC != 0.0 {
		t.Fatalf("expected TC=0, got %.2f", ga.TC)
	}
	if len(ga.Queries) != 3 {
		t.Fatalf("expected 3 queries, got %d", len(ga.Queries))
	}
}

func TestAnalyzeGaps_PartiallyCovered(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", Name: "A", SubQuestions: []string{"Q1", "Q2"}},
		},
	}
	kb, err := NewKnowledgeBase("test", eq)
	if err != nil {
		t.Fatalf("KB failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	kb.WriteNote(KBNote{DimID: "d1", SQIndex: 1, Question: "Q1", Content: "A1", Round: 1})

	ga := AnalyzeGaps(kb, "test")
	if ga.GapCount != 1 {
		t.Fatalf("expected 1 gap, got %d", ga.GapCount)
	}
	if ga.Queries[0].Question != "Q2" {
		t.Fatalf("expected gap for Q2, got %s", ga.Queries[0].Question)
	}
}

func TestAnalyzeGaps_FullyCovered(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", Name: "A", SubQuestions: []string{"Q1"}},
		},
	}
	kb, err := NewKnowledgeBase("test", eq)
	if err != nil {
		t.Fatalf("KB failed: %v", err)
	}
	defer os.RemoveAll(kb.Dir())

	kb.WriteNote(KBNote{DimID: "d1", SQIndex: 1, Question: "Q1", Content: "A", Round: 1})

	ga := AnalyzeGaps(kb, "test")
	if ga.HasGaps {
		t.Fatal("expected no gaps")
	}
	if ga.TC != 1.0 {
		t.Fatalf("expected TC=1.0, got %.2f", ga.TC)
	}
}

func TestFormatGapQuery(t *testing.T) {
	q := formatGapQuery("AI safety", "What are the risks?")
	if q != "AI safety What are the risks?" {
		t.Fatalf("unexpected query: %s", q)
	}
}
