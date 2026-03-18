package cosearch

import "testing"

func TestParseEnrichmentJSON_Valid(t *testing.T) {
	input := `{"intent":"test","dimensions":[{"id":"d1","name":"dim1","info_type":"factual","sub_questions":["q1"],"search_queries":["sq1"],"keywords":["k1"],"quality_criteria":["c1"],"priority":1}]}`
	eq := parseEnrichmentJSON(input)
	if eq == nil {
		t.Fatal("expected non-nil result")
	}
	if eq.Intent != "test" {
		t.Fatalf("expected intent=test, got %s", eq.Intent)
	}
	if len(eq.Dimensions) != 1 {
		t.Fatalf("expected 1 dimension, got %d", len(eq.Dimensions))
	}
	if eq.Dimensions[0].ID != "d1" {
		t.Fatalf("expected id=d1, got %s", eq.Dimensions[0].ID)
	}
}

func TestParseEnrichmentJSON_MarkdownFence(t *testing.T) {
	input := "```json\n{\"intent\":\"fenced\",\"dimensions\":[]}\n```"
	eq := parseEnrichmentJSON(input)
	if eq == nil {
		t.Fatal("expected non-nil result for markdown-fenced input")
	}
	if eq.Intent != "fenced" {
		t.Fatalf("expected intent=fenced, got %s", eq.Intent)
	}
}

func TestParseEnrichmentJSON_Invalid(t *testing.T) {
	if parseEnrichmentJSON("not json") != nil {
		t.Fatal("expected nil for invalid JSON")
	}
	if parseEnrichmentJSON("") != nil {
		t.Fatal("expected nil for empty string")
	}
}

func TestFlattenToKeywords(t *testing.T) {
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{SearchQueries: []string{"query A", "query B"}},
			{SearchQueries: []string{"query b", "query C", ""}},
		},
	}
	got := FlattenToKeywords(eq)
	if len(got) != 3 {
		t.Fatalf("expected 3 unique queries, got %d: %v", len(got), got)
	}
}

func TestFlattenToKeywords_Empty(t *testing.T) {
	eq := &EnrichedQuery{Dimensions: []Dimension{{SearchQueries: []string{" ", ""}}}}
	got := FlattenToKeywords(eq)
	if len(got) != 0 {
		t.Fatalf("expected 0, got %d", len(got))
	}
}

func TestCheckOrthogonality_Similar(t *testing.T) {
	dims := []Dimension{
		{ID: "d1", Keywords: []string{"ai", "ml", "deep learning"}},
		{ID: "d2", Keywords: []string{"ai", "ml", "neural network"}},
	}
	pairs := CheckOrthogonality(dims, 0.8)
	if len(pairs) == 0 {
		t.Fatal("expected non-orthogonal pair detected")
	}
	if pairs[0].DimA != "d1" || pairs[0].DimB != "d2" {
		t.Fatalf("unexpected pair: %+v", pairs[0])
	}
}

func TestCheckOrthogonality_Orthogonal(t *testing.T) {
	dims := []Dimension{
		{ID: "d1", Keywords: []string{"ai", "ml"}},
		{ID: "d2", Keywords: []string{"cooking", "recipe"}},
	}
	pairs := CheckOrthogonality(dims, 0.8)
	if len(pairs) != 0 {
		t.Fatalf("expected no pairs, got %d", len(pairs))
	}
}

func TestEnforceOrthogonality_Merge(t *testing.T) {
	dims := []Dimension{
		{ID: "d1", Name: "A", Keywords: []string{"x", "y", "z"}, Priority: 2},
		{ID: "d2", Name: "B", Keywords: []string{"x", "y", "w"}, Priority: 1},
		{ID: "d3", Name: "C", Keywords: []string{"a", "b", "c"}, Priority: 3},
	}
	result := enforceOrthogonality(dims)
	if len(result) != 2 {
		t.Fatalf("expected 2 dims after merge, got %d", len(result))
	}
	// Merged dimension should have min priority
	if result[0].Priority != 1 {
		t.Fatalf("expected merged priority=1, got %d", result[0].Priority)
	}
}

func TestJaccardDistance(t *testing.T) {
	cases := []struct {
		a, b map[string]bool
		min  float64
		max  float64
	}{
		{map[string]bool{"a": true}, map[string]bool{"a": true}, 0.0, 0.01},
		{map[string]bool{"a": true}, map[string]bool{"b": true}, 0.99, 1.01},
		{map[string]bool{}, map[string]bool{}, 0.99, 1.01},
	}
	for i, c := range cases {
		d := jaccardDistance(c.a, c.b)
		if d < c.min || d > c.max {
			t.Fatalf("case %d: jaccardDistance=%f, expected [%f, %f]", i, d, c.min, c.max)
		}
	}
}

func TestAppendUnique(t *testing.T) {
	result := appendUnique([]string{"a", "b"}, []string{"b", "c"})
	if len(result) != 3 {
		t.Fatalf("expected 3, got %d: %v", len(result), result)
	}
}
