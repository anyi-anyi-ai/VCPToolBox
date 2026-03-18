package cosearch

import (
	"context"
	"fmt"
	"strings"
)

// CBResult holds the output of the Context Builder phase.
type CBResult struct {
	KB         *KnowledgeBase
	Metrics    *MetricsTracker
	Rounds     int
	StopReason string
	RoundFiles []string
	AuditFile  string
}

// queryMapping tracks which dimension/sub-question a search query belongs to.
type queryMapping struct {
	dimID    string
	sqIndex  int
	question string
}

// BuildContext runs the Context Builder phase for Deep mode.
// It performs multi-round search, writes to KB, and tracks IG/TC/SR.
func BuildContext(ctx context.Context, client *OpenAIClient, topic string, enriched *EnrichedQuery, profile ModeProfile) (*CBResult, error) {
	kb, err := NewKnowledgeBase(topic, enriched)
	if err != nil {
		return nil, fmt.Errorf("create KB: %w", err)
	}
	allowedDomains := allowedDomainsForClient(client)

	metrics := NewMetricsTracker()
	var roundFiles []string
	var stopReason string

	for round := 1; round <= profile.MaxRounds; round++ {
		var keywords []string
		var mapping map[string]queryMapping
		gapBefore := len(kb.Gaps())

		if round == 1 {
			// Round 1: broad search using all enriched search queries
			keywords, mapping = buildBroadQueries(enriched)
		} else {
			// Round 2+: gap-driven search
			ga := AnalyzeGaps(kb, topic)
			gapBefore = ga.GapCount
			if !ga.HasGaps {
				stopReason = "子问题全部覆盖 (TC=1.0)"
				break
			}
			keywords, mapping = buildGapQueries(ga)
		}

		if len(keywords) == 0 {
			stopReason = "无可用搜索查询"
			break
		}

		// Execute search round
		searchCtx, cancel := context.WithTimeout(ctx, profile.Timeout)
		results := runRound(searchCtx, client, topic, keywords, round, profile)
		cancel()
		applyAllowedDomainFilterToRound(results, allowedDomains)

		// Write round markdown
		path, _ := writeRoundMarkdown(topic, profile.Name, round, results)
		if path != "" {
			roundFiles = append(roundFiles, path)
		}

		// Map results to KB notes
		newTexts := make(map[string]string)
		for kw, result := range results {
			if result.Err != nil {
				continue
			}
			newTexts[kw] = result.Text

			if m, ok := mapping[kw]; ok {
				sources := normalizeCitationURLsWithAllowedDomains(result.Citations, allowedDomains)
				kb.WriteNote(KBNote{
					DimID:    m.dimID,
					SQIndex:  m.sqIndex,
					Question: m.question,
					Content:  strings.TrimSpace(result.Text),
					Sources:  sources,
					Round:    round,
				})
			}
		}

		// Record metrics
		gapAfter := len(kb.Gaps())
		metrics.RecordRound(round, kb, newTexts, RoundAuditInput{
			GapBefore: gapBefore,
			GapAfter:  gapAfter,
			Results:   results,
		})

		// Check stop conditions
		if kb.Coverage() >= 1.0 {
			stopReason = "子问题全部覆盖 (TC=1.0)"
			break
		}
		if metrics.ShouldStop(0.1, 2) {
			stopReason = "信息增益连续低于阈值 (IG<0.1)"
			break
		}
	}

	if stopReason == "" {
		stopReason = "达到最大轮次"
	}

	// Finalize KB
	kb.WriteSources()
	kb.WriteIndex()
	metrics.WriteJSON(kb.Dir())
	auditFile, _ := writeRoundAuditMarkdown(kb.Dir(), metrics.History())

	return &CBResult{
		KB:         kb,
		Metrics:    metrics,
		Rounds:     len(metrics.History()),
		StopReason: stopReason,
		RoundFiles: roundFiles,
		AuditFile:  auditFile,
	}, nil
}

// buildBroadQueries creates the Round 1 keyword list from all dimensions.
// Each dimension's first search query maps to its first sub-question, etc.
func buildBroadQueries(eq *EnrichedQuery) ([]string, map[string]queryMapping) {
	var keywords []string
	mapping := make(map[string]queryMapping)
	seen := make(map[string]bool)

	for _, dim := range eq.Dimensions {
		for i, sq := range dim.SubQuestions {
			// Use the corresponding search query if available, otherwise use the sub-question itself
			var query string
			if i < len(dim.SearchQueries) {
				query = dim.SearchQueries[i]
			} else {
				query = sq
			}
			query = strings.TrimSpace(query)
			if query == "" || seen[strings.ToLower(query)] {
				continue
			}
			seen[strings.ToLower(query)] = true
			keywords = append(keywords, query)
			mapping[query] = queryMapping{
				dimID:    dim.ID,
				sqIndex:  i + 1,
				question: sq,
			}
		}
	}
	return keywords, mapping
}

// buildGapQueries creates search queries from gap analysis.
func buildGapQueries(ga GapAnalysis) ([]string, map[string]queryMapping) {
	var keywords []string
	mapping := make(map[string]queryMapping)
	for _, gq := range ga.Queries {
		keywords = append(keywords, gq.Query)
		mapping[gq.Query] = queryMapping{
			dimID:    gq.DimID,
			sqIndex:  gq.SQIndex,
			question: gq.Question,
		}
	}
	return keywords, mapping
}

// FormatCBStopReason returns the stop reason for Round markdown in L4 trace.
func FormatCBStopReason(maxRounds, actualRounds int, stopReason string) string {
	if stopReason != "" {
		return fmt.Sprintf("%s (轮次 %d/%d)", stopReason, actualRounds, maxRounds)
	}
	if actualRounds < maxRounds {
		return fmt.Sprintf("提前停止 (轮次 %d/%d)", actualRounds, maxRounds)
	}
	return fmt.Sprintf("达到最大轮次 (%d)", maxRounds)
}

// DummyBuildContext is a placeholder for testing without real API calls.
// It simulates a CB run with pre-supplied search results.
func DummyBuildContext(topic string, enriched *EnrichedQuery, rounds []map[string]SearchResult) (*CBResult, error) {
	kb, err := NewKnowledgeBase(topic, enriched)
	if err != nil {
		return nil, err
	}

	metrics := NewMetricsTracker()
	_, mapping := buildBroadQueries(enriched)
	var stopReason string

	for round, results := range rounds {
		roundNum := round + 1
		newTexts := make(map[string]string)
		gapBefore := len(kb.Gaps())
		applyAllowedDomainFilterToRound(results, allowedDomainsFromEnv())

		for kw, result := range results {
			if result.Err != nil {
				continue
			}
			newTexts[kw] = result.Text

			// Try broad mapping first, then gap mapping
			if m, ok := mapping[kw]; ok {
				sources := normalizeCitationURLsWithAllowedDomains(result.Citations, allowedDomainsFromEnv())
				kb.WriteNote(KBNote{
					DimID:    m.dimID,
					SQIndex:  m.sqIndex,
					Question: m.question,
					Content:  result.Text,
					Sources:  sources,
					Round:    roundNum,
				})
			}
		}

		gapAfter := len(kb.Gaps())
		metrics.RecordRound(roundNum, kb, newTexts, RoundAuditInput{
			GapBefore: gapBefore,
			GapAfter:  gapAfter,
			Results:   results,
		})

		if kb.Coverage() >= 1.0 {
			stopReason = "子问题全部覆盖 (TC=1.0)"
			break
		}
		if metrics.ShouldStop(0.1, 2) {
			stopReason = "信息增益连续低于阈值 (IG<0.1)"
			break
		}
	}

	if stopReason == "" {
		stopReason = "达到最大轮次"
	}

	kb.WriteSources()
	kb.WriteIndex()
	metrics.WriteJSON(kb.Dir())
	auditFile, _ := writeRoundAuditMarkdown(kb.Dir(), metrics.History())

	return &CBResult{
		KB:         kb,
		Metrics:    metrics,
		Rounds:     len(metrics.History()),
		StopReason: stopReason,
		AuditFile:  auditFile,
	}, nil
}

func applyAllowedDomainFilterToRound(results map[string]SearchResult, allowedDomains []string) {
	for key, res := range results {
		if res.Err != nil || len(res.Citations) == 0 {
			continue
		}
		filtered := normalizeCitationURLsWithAllowedDomains(res.Citations, allowedDomains)
		res.Citations = make([]Citation, 0, len(filtered))
		for _, src := range filtered {
			res.Citations = append(res.Citations, Citation{URL: src})
		}
		results[key] = res
	}
}
