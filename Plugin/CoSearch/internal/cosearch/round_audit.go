package cosearch

import (
	"fmt"
	"path/filepath"
	"strings"
)

func writeRoundAuditMarkdown(dir string, history []RoundMetrics) (string, error) {
	if strings.TrimSpace(dir) == "" {
		return "", fmt.Errorf("empty audit dir")
	}

	path := filepath.Join(dir, "round-audit.md")
	var b strings.Builder
	b.WriteString("# Round Audit\n\n")
	b.WriteString("| round | IG | TC | SR | retry | gap |\n")
	b.WriteString("|---:|---:|---:|---:|---|---|\n")

	for _, metric := range history {
		retry := fmt.Sprintf(
			"retried=%d/%d, retries=%d, attempts=%d, backoff_ms=%d, exhausted=%d",
			metric.Retry.RetriedQueries,
			metric.Retry.Queries,
			metric.Retry.TotalRetries,
			metric.Retry.TotalAttempts,
			metric.Retry.TotalBackoffMS,
			metric.Retry.ExhaustedCount,
		)
		gap := fmt.Sprintf(
			"before=%d, after=%d, closed=%d",
			metric.Gap.Before,
			metric.Gap.After,
			metric.Gap.Closed,
		)
		b.WriteString(fmt.Sprintf("| %d | %.4f | %.4f | %.4f | %s | %s |\n",
			metric.Round, metric.IG, metric.TC, metric.SR, retry, gap))
	}

	if err := writeFileAtomically(path, []byte(b.String()), 0o644); err != nil {
		return "", err
	}
	return path, nil
}
