package cosearch

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"unicode"
)

// RoundMetrics holds the three internal metrics for a single round.
type RoundMetrics struct {
	Round int             `json:"round"`
	IG    float64         `json:"ig"`
	TC    float64         `json:"tc"`
	SR    float64         `json:"sr"`
	Retry RetryRoundStats `json:"retry"`
	Gap   GapRoundStats   `json:"gap"`
}

// MetricsTracker computes and records IG/TC/SR across rounds.
type MetricsTracker struct {
	history     []RoundMetrics
	knownClaims map[string]bool   // normalized sentences seen so far
	prevTexts   map[string]string // query key → previous round text (for SR)
}

// NewMetricsTracker creates a fresh metrics tracker.
func NewMetricsTracker() *MetricsTracker {
	return &MetricsTracker{
		knownClaims: make(map[string]bool),
		prevTexts:   make(map[string]string),
	}
}

// RecordRound computes IG/TC/SR + retry/gap audit stats for the round and appends to history.
//   - newTexts: map of query key → search result text for this round
//   - kb: the KnowledgeBase (for TC)
func (m *MetricsTracker) RecordRound(round int, kb *KnowledgeBase, newTexts map[string]string, audit RoundAuditInput) RoundMetrics {
	ig := m.computeIG(newTexts)
	tc := kb.Coverage()
	sr := m.computeSR(newTexts)
	retry := summarizeRoundRetry(audit.Results)
	gap := normalizeGapStats(audit, kb)

	metrics := RoundMetrics{Round: round, IG: ig, TC: tc, SR: sr, Retry: retry, Gap: gap}
	m.history = append(m.history, metrics)

	// Update prevTexts for next round's SR calculation
	for k, v := range newTexts {
		m.prevTexts[k] = v
	}

	return metrics
}

func normalizeGapStats(audit RoundAuditInput, kb *KnowledgeBase) GapRoundStats {
	before := audit.GapBefore
	after := audit.GapAfter

	if before < 0 {
		before = 0
	}
	if after < 0 {
		after = 0
		if kb != nil {
			after = len(kb.Gaps())
		}
	}

	closed := before - after
	if closed < 0 {
		closed = 0
	}

	return GapRoundStats{
		Before: before,
		After:  after,
		Closed: closed,
	}
}

// computeIG calculates Information Gain as the ratio of new claims to total claims.
func (m *MetricsTracker) computeIG(newTexts map[string]string) float64 {
	var totalClaims, newClaims int
	for _, text := range newTexts {
		sentences := extractClaims(text)
		for _, s := range sentences {
			totalClaims++
			if !m.knownClaims[s] {
				newClaims++
				m.knownClaims[s] = true
			}
		}
	}
	if totalClaims == 0 {
		return 0.0
	}
	return float64(newClaims) / float64(totalClaims)
}

// computeSR calculates Signal Redundancy as average keyword overlap with previous round.
func (m *MetricsTracker) computeSR(newTexts map[string]string) float64 {
	var total float64
	var count int
	for k, newText := range newTexts {
		prevText, ok := m.prevTexts[k]
		if !ok {
			continue
		}
		setA := textToWordSet(prevText)
		setB := textToWordSet(newText)
		sim := jaccardSimilarity(setA, setB)
		total += sim
		count++
	}
	if count == 0 {
		return 0.0
	}
	return total / float64(count)
}

// ShouldStop returns true when IG < threshold for N consecutive rounds.
func (m *MetricsTracker) ShouldStop(igThreshold float64, consecutiveRounds int) bool {
	if len(m.history) < consecutiveRounds {
		return false
	}
	for i := len(m.history) - consecutiveRounds; i < len(m.history); i++ {
		if m.history[i].IG >= igThreshold {
			return false
		}
	}
	return true
}

// History returns all recorded round metrics.
func (m *MetricsTracker) History() []RoundMetrics {
	return m.history
}

// Latest returns the most recent round metrics, or zero if none recorded.
func (m *MetricsTracker) Latest() RoundMetrics {
	if len(m.history) == 0 {
		return RoundMetrics{}
	}
	return m.history[len(m.history)-1]
}

// WriteJSON persists the metrics history to a JSON file.
func (m *MetricsTracker) WriteJSON(dir string) (string, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	path := filepath.Join(dir, "metrics.json")
	data, err := json.MarshalIndent(m.history, "", "  ")
	if err != nil {
		return "", fmt.Errorf("marshal metrics: %w", err)
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}

// --- Claim extraction (lightweight, no LLM) ---

// extractClaims splits text into normalized sentence-level claims.
func extractClaims(text string) []string {
	text = strings.TrimSpace(text)
	if text == "" {
		return nil
	}

	// Split on common sentence terminators (Chinese and English)
	var sentences []string
	var current strings.Builder
	for _, r := range text {
		current.WriteRune(r)
		if r == '。' || r == '！' || r == '？' || r == '.' || r == '!' || r == '?' || r == '\n' {
			s := normalizeClaim(current.String())
			if s != "" {
				sentences = append(sentences, s)
			}
			current.Reset()
		}
	}
	// Remaining text
	if s := normalizeClaim(current.String()); s != "" {
		sentences = append(sentences, s)
	}
	return sentences
}

// normalizeClaim normalizes a claim for dedup: lowercase, trim, collapse whitespace.
func normalizeClaim(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)
	// Collapse whitespace
	var b strings.Builder
	prevSpace := false
	for _, r := range s {
		if unicode.IsSpace(r) {
			if !prevSpace {
				b.WriteRune(' ')
				prevSpace = true
			}
		} else {
			b.WriteRune(r)
			prevSpace = false
		}
	}
	result := strings.TrimSpace(b.String())
	// Skip very short claims (noise)
	if len([]rune(result)) < 8 {
		return ""
	}
	return result
}

// textToWordSet splits text into a set of words for Jaccard similarity.
func textToWordSet(text string) map[string]bool {
	set := make(map[string]bool)
	for _, word := range strings.Fields(strings.ToLower(text)) {
		word = strings.TrimFunc(word, func(r rune) bool {
			return unicode.IsPunct(r)
		})
		if len(word) >= 2 {
			set[word] = true
		}
	}
	return set
}

// jaccardSimilarity = |A∩B| / |A∪B|. Returns 0 if both empty.
func jaccardSimilarity(a, b map[string]bool) float64 {
	intersection := 0
	for k := range a {
		if b[k] {
			intersection++
		}
	}
	unionSize := len(a) + len(b) - intersection
	if unionSize == 0 {
		return 0.0
	}
	return float64(intersection) / float64(unionSize)
}
