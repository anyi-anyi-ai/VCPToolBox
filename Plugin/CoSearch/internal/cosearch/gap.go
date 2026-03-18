package cosearch

import "fmt"

// GapAnalysis holds the result of gap detection.
type GapAnalysis struct {
	TC       float64
	GapCount int
	Queries  []GapSearchQuery
	HasGaps  bool
}

// GapSearchQuery is a search query generated to fill a knowledge gap.
type GapSearchQuery struct {
	DimID    string
	SQIndex  int
	Question string
	Query    string // formatted search query
}

// AnalyzeGaps examines the KB and produces targeted search queries for uncovered sub-questions.
func AnalyzeGaps(kb *KnowledgeBase, topic string) GapAnalysis {
	gaps := kb.Gaps()
	tc := kb.Coverage()

	queries := make([]GapSearchQuery, 0, len(gaps))
	for _, g := range gaps {
		queries = append(queries, GapSearchQuery{
			DimID:    g.DimID,
			SQIndex:  g.SQIndex,
			Question: g.Question,
			Query:    formatGapQuery(topic, g.Question),
		})
	}

	return GapAnalysis{
		TC:       tc,
		GapCount: len(gaps),
		Queries:  queries,
		HasGaps:  len(gaps) > 0,
	}
}

// formatGapQuery creates a search query from a topic and sub-question.
func formatGapQuery(topic, question string) string {
	return fmt.Sprintf("%s %s", topic, question)
}
