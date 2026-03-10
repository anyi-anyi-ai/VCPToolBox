package cosearch

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDummyBuildContext_WritesRoundAuditArtifacts(t *testing.T) {
	eq := testEnrichedQuery()
	round1 := map[string]SearchResult{
		"X definition": {
			Keyword: "X definition",
			Round:   1,
			Text:    "X is a framework for distributed systems with verifiable behavior.",
			Retry: RetryAudit{
				Attempts:       2,
				RetryCount:     1,
				BackoffDelayMS: 50,
			},
		},
	}

	result, err := DummyBuildContext("X audit", eq, []map[string]SearchResult{round1})
	if err != nil {
		t.Fatalf("DummyBuildContext failed: %v", err)
	}
	defer os.RemoveAll(result.KB.Dir())

	if strings.TrimSpace(result.AuditFile) == "" {
		t.Fatal("expected round audit markdown path")
	}
	if _, err := os.Stat(result.AuditFile); err != nil {
		t.Fatalf("round audit markdown missing: %v", err)
	}

	metricsPath := filepath.Join(result.KB.Dir(), "metrics.json")
	content, err := os.ReadFile(metricsPath)
	if err != nil {
		t.Fatalf("read metrics.json failed: %v", err)
	}
	data := string(content)
	if !strings.Contains(data, "\"retry\"") || !strings.Contains(data, "\"gap\"") {
		t.Fatalf("metrics.json missing retry/gap data: %s", data)
	}
}
