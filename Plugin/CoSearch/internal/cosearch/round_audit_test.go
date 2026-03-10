package cosearch

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestWriteRoundAuditMarkdown(t *testing.T) {
	dir := t.TempDir()
	path, err := writeRoundAuditMarkdown(dir, []RoundMetrics{
		{
			Round: 1,
			IG:    1.0,
			TC:    0.4,
			SR:    0.0,
			Retry: RetryRoundStats{
				Queries:        3,
				RetriedQueries: 1,
				TotalAttempts:  4,
				TotalRetries:   1,
				TotalBackoffMS: 80,
				ExhaustedCount: 0,
			},
			Gap: GapRoundStats{Before: 5, After: 3, Closed: 2},
		},
	})
	if err != nil {
		t.Fatalf("writeRoundAuditMarkdown failed: %v", err)
	}
	if filepath.Base(path) != "round-audit.md" {
		t.Fatalf("unexpected file name: %s", path)
	}

	content, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read round-audit.md failed: %v", err)
	}
	text := string(content)
	if !strings.Contains(text, "| round | IG | TC | SR | retry | gap |") {
		t.Fatalf("missing markdown header: %s", text)
	}
	if !strings.Contains(text, "retried=1/3") || !strings.Contains(text, "before=5, after=3, closed=2") {
		t.Fatalf("missing retry/gap details: %s", text)
	}
}
