package cosearch

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestCallWithRetryWithConfig_SuccessAfterRetry(t *testing.T) {
	cfg := retryConfig{
		MaxAttempts: 3,
		BaseDelay:   1 * time.Millisecond,
		MaxDelay:    1 * time.Millisecond,
	}

	attempts := 0
	searchOnce := func(context.Context) SearchResult {
		attempts++
		if attempts == 1 {
			return SearchResult{Err: errors.New("HTTP 429 - rate limited")}
		}
		return SearchResult{Text: "ok"}
	}

	res := callWithRetryWithConfig(context.Background(), cfg, searchOnce)
	if res.Err != nil {
		t.Fatalf("expected success, got err: %v", res.Err)
	}
	if res.Retry.Attempts != 2 || res.Retry.RetryCount != 1 {
		t.Fatalf("unexpected retry audit: %+v", res.Retry)
	}
	if res.Retry.Exhausted {
		t.Fatalf("expected non-exhausted retry, got %+v", res.Retry)
	}
}

func TestCallWithRetryWithConfig_Exhausted(t *testing.T) {
	cfg := retryConfig{
		MaxAttempts: 2,
		BaseDelay:   1 * time.Millisecond,
		MaxDelay:    1 * time.Millisecond,
	}

	res := callWithRetryWithConfig(context.Background(), cfg, func(context.Context) SearchResult {
		return SearchResult{Err: errors.New("HTTP 500 - upstream error")}
	})

	if res.Err == nil {
		t.Fatal("expected error after retries exhausted")
	}
	if !res.Retry.Exhausted {
		t.Fatalf("expected exhausted=true, got %+v", res.Retry)
	}
	if res.Retry.Attempts != 2 || res.Retry.RetryCount != 1 {
		t.Fatalf("unexpected retry audit: %+v", res.Retry)
	}
}

func TestSummarizeRoundRetry(t *testing.T) {
	stats := summarizeRoundRetry(map[string]SearchResult{
		"q1": {
			Retry: RetryAudit{Attempts: 1, RetryCount: 0},
		},
		"q2": {
			Retry: RetryAudit{Attempts: 3, RetryCount: 2, BackoffDelayMS: 42, Exhausted: true},
		},
	})

	if stats.Queries != 2 {
		t.Fatalf("expected queries=2, got %d", stats.Queries)
	}
	if stats.RetriedQueries != 1 || stats.TotalRetries != 2 {
		t.Fatalf("unexpected retry totals: %+v", stats)
	}
	if stats.TotalAttempts != 4 {
		t.Fatalf("expected total attempts=4, got %d", stats.TotalAttempts)
	}
	if stats.ExhaustedCount != 1 {
		t.Fatalf("expected exhausted count=1, got %d", stats.ExhaustedCount)
	}
}
