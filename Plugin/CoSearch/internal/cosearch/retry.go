package cosearch

import (
	"context"
	"math/rand"
	"strings"
	"time"
)

// retryConfig controls the retry behavior.
type retryConfig struct {
	MaxAttempts int
	BaseDelay   time.Duration
	MaxDelay    time.Duration
}

var defaultRetryConfig = retryConfig{
	MaxAttempts: 3,
	BaseDelay:   1 * time.Second,
	MaxDelay:    8 * time.Second,
}

// callWithRetry performs a search with exponential backoff + jitter retry.
// Only retries on transient errors (429, 5xx, timeout).
func callWithRetry(ctx context.Context, client *OpenAIClient, topic, keyword string, round int, profile ModeProfile) SearchResult {
	searchOnce := func(callCtx context.Context) SearchResult {
		return client.SearchKeyword(callCtx, topic, keyword, round, profile)
	}
	return callWithRetryWithConfig(ctx, defaultRetryConfig, searchOnce)
}

func callWithRetryWithConfig(ctx context.Context, cfg retryConfig, searchOnce func(context.Context) SearchResult) SearchResult {
	if cfg.MaxAttempts <= 0 {
		cfg.MaxAttempts = 1
	}
	if cfg.BaseDelay <= 0 {
		cfg.BaseDelay = 1 * time.Second
	}
	if cfg.MaxDelay < cfg.BaseDelay {
		cfg.MaxDelay = cfg.BaseDelay
	}
	audit := RetryAudit{}

	for attempt := 0; attempt < cfg.MaxAttempts; attempt++ {
		result := searchOnce(ctx)
		audit.Attempts = attempt + 1
		audit.RetryCount = attempt

		if result.Err == nil {
			result.Retry = audit
			return result
		}

		// Only retry transient errors
		if !isRetryable(result.Err) {
			result.Retry = audit
			return result
		}

		// Last attempt: return the error
		if attempt == cfg.MaxAttempts-1 {
			audit.Exhausted = true
			result.Retry = audit
			return result
		}

		// Exponential backoff with jitter
		delay := backoffWithJitter(cfg.BaseDelay, cfg.MaxDelay, attempt)
		audit.BackoffDelayMS += delay.Milliseconds()
		select {
		case <-ctx.Done():
			result.Retry = audit
			return result
		case <-time.After(delay):
		}
	}

	// Should not reach here
	result := searchOnce(ctx)
	if result.Retry.Attempts == 0 {
		result.Retry = RetryAudit{Attempts: 1}
	}
	return result
}

// isRetryable returns true for transient HTTP errors.
func isRetryable(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "http 429") ||
		strings.Contains(msg, "http 5") ||
		strings.Contains(msg, "timeout") ||
		strings.Contains(msg, "context deadline exceeded")
}

// backoffWithJitter calculates delay = min(baseDelay * 2^attempt + jitter, maxDelay).
func backoffWithJitter(base, max time.Duration, attempt int) time.Duration {
	delay := base << uint(attempt) // base * 2^attempt
	if delay > max {
		delay = max
	}
	// Add jitter: ±25%
	jitter := time.Duration(rand.Int63n(int64(delay)/2)) - delay/4
	delay += jitter
	if delay < 0 {
		delay = base
	}
	return delay
}

func summarizeRoundRetry(results map[string]SearchResult) RetryRoundStats {
	stats := RetryRoundStats{}
	for _, res := range results {
		stats.Queries++
		attempts := res.Retry.Attempts
		if attempts <= 0 {
			attempts = 1
		}

		retries := res.Retry.RetryCount
		if retries < 0 {
			retries = 0
		}
		if retries == 0 && attempts > 1 {
			retries = attempts - 1
		}

		stats.TotalAttempts += attempts
		stats.TotalRetries += retries
		stats.TotalBackoffMS += maxInt64(res.Retry.BackoffDelayMS, 0)
		if retries > 0 {
			stats.RetriedQueries++
		}
		if res.Retry.Exhausted {
			stats.ExhaustedCount++
		}
	}
	return stats
}

func maxInt64(a, b int64) int64 {
	if a < b {
		return b
	}
	return a
}
