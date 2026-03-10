package cosearch

import (
	"os"
	"strings"
	"testing"
	"time"
)

func TestNormalizeCitationURLsWithAllowedDomains_StrictMatch(t *testing.T) {
	citations := []Citation{
		{URL: "https://example.com/a"},
		{URL: "https://sub.example.com/b"},
		{URL: "https://badexample.com/c"},
		{URL: "https://example.com.evil.org/d"},
	}

	got := normalizeCitationURLsWithAllowedDomains(citations, []string{"example.com"})
	if len(got) != 2 {
		t.Fatalf("expected 2 urls after domain filter, got %#v", got)
	}
	if got[0] != "https://example.com/a" || got[1] != "https://sub.example.com/b" {
		t.Fatalf("unexpected filtered urls: %#v", got)
	}
}

func TestLoadConfig_NormalizesAllowedDomains(t *testing.T) {
	t.Setenv("COSEARCH_API_KEY", "test-key")
	t.Setenv("COSEARCH_ALLOWED_DOMAINS", " HTTPS://Example.com , sub.test.org:443/path ,example.com")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}
	if len(cfg.AllowedDomains) != 2 {
		t.Fatalf("expected 2 normalized domains, got %#v", cfg.AllowedDomains)
	}
	if cfg.AllowedDomains[0] != "example.com" || cfg.AllowedDomains[1] != "sub.test.org" {
		t.Fatalf("unexpected domains: %#v", cfg.AllowedDomains)
	}
}

func TestAssessSignal_EvidenceGateRequiresValidURL(t *testing.T) {
	t.Setenv("COSEARCH_ALLOWED_DOMAINS", "example.com")
	summary := "建议立即迁移到新版本。最近发布了更新，方法可形成可迁移框架与原则。"
	assessment := AssessSignal(summary, []string{"https://not-allowed.org/x"})

	if assessment.F1 || assessment.F2 {
		t.Fatalf("expected F1/F2=false due evidence gate, got %#v", assessment)
	}
}

func TestDummyBuildContext_AllowedDomainsResultSideFiltering(t *testing.T) {
	t.Setenv("COSEARCH_ALLOWED_DOMAINS", "example.com")
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{
				ID:            "d1",
				Name:          "Domain",
				SubQuestions:  []string{"Q1"},
				SearchQueries: []string{"kw1"},
			},
		},
	}
	round := map[string]SearchResult{
		"kw1": {
			Keyword: "kw1",
			Round:   1,
			Text:    "content",
			Citations: []Citation{
				{URL: "https://example.com/ok"},
				{URL: "https://evil.org/no"},
			},
		},
	}

	cb, err := DummyBuildContext("topic", eq, []map[string]SearchResult{round})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(cb.KB.Dir())

	if len(cb.KB.Sources()) != 1 || cb.KB.Sources()[0] != "https://example.com/ok" {
		t.Fatalf("unexpected KB sources: %#v", cb.KB.Sources())
	}
}

func TestDummyWriteReport_EvidenceOnlyConstraint(t *testing.T) {
	t.Setenv("COSEARCH_ALLOWED_DOMAINS", "example.com")
	eq := &EnrichedQuery{
		Dimensions: []Dimension{
			{
				ID:            "d1",
				Name:          "D1",
				SubQuestions:  []string{"Q1", "Q2"},
				SearchQueries: []string{"k1", "k2"},
			},
		},
	}
	round := map[string]SearchResult{
		"k1": {
			Keyword:   "k1",
			Round:     1,
			Text:      "有证据的结论",
			Citations: []Citation{{URL: "https://example.com/evidence"}},
		},
		"k2": {
			Keyword:   "k2",
			Round:     1,
			Text:      "无证据结论",
			Citations: []Citation{{URL: "https://other.org/nope"}},
		},
	}
	cb, err := DummyBuildContext("topic", eq, []map[string]SearchResult{round})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(cb.KB.Dir())

	rw := DummyWriteReport(cb, Request{SearchTopic: "topic"}, ModeProfile{Name: "deep"}, true, time.Now())

	if len(rw.Report.Items) != 1 {
		t.Fatalf("expected 1 evidence-backed item, got %d", len(rw.Report.Items))
	}
	if !strings.Contains(rw.Layers.L3Evidence, "https://example.com/evidence") {
		t.Fatalf("expected evidence URL in L3, got: %s", rw.Layers.L3Evidence)
	}
	if strings.Contains(rw.Layers.L2Signals, "Q2") {
		t.Fatalf("L2 should not include non-evidence note: %s", rw.Layers.L2Signals)
	}
}
