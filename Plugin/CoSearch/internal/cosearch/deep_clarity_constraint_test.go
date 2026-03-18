package cosearch

import (
	"strings"
	"testing"
)

func TestAssessDeepClarityPass(t *testing.T) {
	eq := &EnrichedQuery{
		Intent: "test",
		Dimensions: []Dimension{
			{ID: "d1", SubQuestions: []string{"What is A?"}, SearchQueries: []string{"A definition"}},
			{ID: "d2", SubQuestions: []string{"How A works?"}, SearchQueries: []string{"A mechanism"}},
			{ID: "d3", SubQuestions: []string{"A impact?"}, SearchQueries: []string{"A impact analysis"}},
		},
	}

	assessment := AssessDeepClarity(eq)
	if assessment.Decision != deepClarityDecisionPass {
		t.Fatalf("expected pass, got %s (%s)", assessment.Decision, assessment.Message)
	}
	if assessment.Score < 0.70 {
		t.Fatalf("expected score >= 0.70, got %.2f", assessment.Score)
	}
	if assessment.DimensionCount != 3 {
		t.Fatalf("expected 3 dimensions, got %d", assessment.DimensionCount)
	}
	if assessment.Enriched == nil || len(assessment.Enriched.Dimensions) != 3 {
		t.Fatalf("expected sanitized enrichment with 3 dimensions, got %#v", assessment.Enriched)
	}
}

func TestAssessDeepClarityDegrade(t *testing.T) {
	eq := &EnrichedQuery{
		Intent: "test",
		Dimensions: []Dimension{
			{ID: "d1", SubQuestions: []string{"Question 1"}, SearchQueries: []string{""}},
			{ID: "d2", SubQuestions: []string{"Question 2"}, SearchQueries: []string{""}},
		},
	}

	assessment := AssessDeepClarity(eq)
	if assessment.Decision != deepClarityDecisionDegrade {
		t.Fatalf("expected degrade, got %s (%s)", assessment.Decision, assessment.Message)
	}
	if !strings.Contains(assessment.Message, "降级") {
		t.Fatalf("expected degrade message, got: %s", assessment.Message)
	}
	if assessment.TotalQueries != 0 {
		t.Fatalf("expected 0 explicit queries, got %d", assessment.TotalQueries)
	}
}

func TestAssessDeepClarityReject(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{ID: "d1", SubQuestions: []string{"???"}, SearchQueries: []string{"!!!"}},
		},
	}

	assessment := AssessDeepClarity(eq)
	if assessment.Decision != deepClarityDecisionReject {
		t.Fatalf("expected reject, got %s (%s)", assessment.Decision, assessment.Message)
	}
	if !strings.Contains(assessment.Message, "无法进入 Deep 模式") {
		t.Fatalf("unexpected reject message: %s", assessment.Message)
	}
}

func TestSanitizeEnrichedQueryKeepAlignment(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{
				ID:            "",
				SubQuestions:  []string{"Q1", "  ", "Q3"},
				SearchQueries: []string{"query-1", "query-2", ""},
				Keywords:      []string{" a ", "A", "b"},
			},
		},
	}

	sanitized := sanitizeEnrichedQuery(eq)
	if sanitized == nil || len(sanitized.Dimensions) != 1 {
		t.Fatalf("expected one sanitized dimension, got %#v", sanitized)
	}
	d := sanitized.Dimensions[0]
	if d.ID == "" {
		t.Fatal("expected generated dimension id")
	}
	if len(d.SubQuestions) != 2 {
		t.Fatalf("expected 2 cleaned sub-questions, got %d", len(d.SubQuestions))
	}
	if len(d.SearchQueries) != 2 {
		t.Fatalf("expected 2 aligned search queries, got %d", len(d.SearchQueries))
	}
	if d.SearchQueries[1] != "" {
		t.Fatalf("expected second aligned query empty, got %q", d.SearchQueries[1])
	}
	if len(d.Keywords) != 2 {
		t.Fatalf("expected deduped keywords=2, got %v", d.Keywords)
	}
}
