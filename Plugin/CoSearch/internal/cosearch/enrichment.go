package cosearch

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

const enrichmentSystemPrompt = `你是一个研究规划专家。给定一个研究主题和初始关键词，你的任务是将其分解为正交的搜索维度。

输出要求（严格 JSON）：
{
  "intent": "一句话总结研究意图",
  "dimensions": [
    {
      "id": "d1",
      "name": "维度名称",
      "info_type": "factual|analytical|comparative|temporal|causal",
      "sub_questions": ["该维度下的具体子问题"],
      "search_queries": ["建议的搜索查询，2-3个"],
      "keywords": ["核心关键词，用于正交性检查"],
      "quality_criteria": ["该维度的质量验证标准"],
      "priority": 1
    }
  ]
}

正交性约束（必须遵守）：
1. 维度数量 3-7 个，默认 5 个
2. 每个维度的 keywords 与其他维度重叠不超过 20%
3. 每个维度的 info_type 应尽量不同
4. 遵循 MECE 原则：互斥且穷尽
5. 优先级 1=最高

只输出 JSON，不要任何解释文字。`

func buildEnrichmentUserPrompt(topic string, keywords []string) string {
	var b strings.Builder
	b.WriteString(fmt.Sprintf("研究主题：%s\n", topic))
	if len(keywords) > 0 {
		b.WriteString(fmt.Sprintf("初始关键词：%s\n", strings.Join(keywords, "、")))
	}
	b.WriteString(fmt.Sprintf("当前时间：%s\n", time.Now().Format("2006-01-02")))
	b.WriteString("请将该主题分解为正交搜索维度。")
	return b.String()
}

// Enrich calls the LLM to decompose a research topic into orthogonal dimensions.
// On failure it returns nil (caller should fall back to raw keywords).
func Enrich(ctx context.Context, client *OpenAIClient, topic string, keywords []string) *EnrichedQuery {
	userPrompt := buildEnrichmentUserPrompt(topic, keywords)

	text, _, err := client.Call(ctx, enrichmentSystemPrompt, userPrompt, CallOptions{})
	if err != nil || strings.TrimSpace(text) == "" {
		return nil
	}

	result := parseEnrichmentJSON(text)
	if result == nil || len(result.Dimensions) == 0 {
		return nil
	}

	// Post-validation: fix non-orthogonal pairs by merging
	result.Dimensions = enforceOrthogonality(result.Dimensions)

	// Cap dimensions at 7
	if len(result.Dimensions) > 7 {
		result.Dimensions = result.Dimensions[:7]
	}

	result = sanitizeEnrichedQuery(result)
	if result == nil || len(result.Dimensions) == 0 {
		return nil
	}

	return result
}

func parseEnrichmentJSON(text string) *EnrichedQuery {
	// Strip markdown code fences if present
	text = strings.TrimSpace(text)
	if strings.HasPrefix(text, "```") {
		lines := strings.Split(text, "\n")
		if len(lines) >= 3 {
			lines = lines[1 : len(lines)-1]
			text = strings.Join(lines, "\n")
		}
	}
	text = strings.TrimSpace(text)

	var eq EnrichedQuery
	if err := json.Unmarshal([]byte(text), &eq); err != nil {
		return nil
	}
	return &eq
}

// FlattenToKeywords extracts all search_queries from an EnrichedQuery,
// producing a keyword list compatible with the existing runRound flow.
func FlattenToKeywords(eq *EnrichedQuery) []string {
	seen := make(map[string]bool)
	var result []string
	for _, dim := range eq.Dimensions {
		for _, q := range dim.SearchQueries {
			q = strings.TrimSpace(q)
			if q != "" && !seen[strings.ToLower(q)] {
				seen[strings.ToLower(q)] = true
				result = append(result, q)
			}
		}
	}
	return result
}

// --- Orthogonality checking ---

type DimensionPair struct {
	DimA, DimB string
	Distance   float64
}

// CheckOrthogonality returns dimension pairs whose keyword Jaccard distance
// is below the threshold (i.e., too similar).
func CheckOrthogonality(dims []Dimension, threshold float64) []DimensionPair {
	var pairs []DimensionPair
	for i := 0; i < len(dims); i++ {
		setA := toKeywordSet(dims[i].Keywords)
		for j := i + 1; j < len(dims); j++ {
			setB := toKeywordSet(dims[j].Keywords)
			dist := jaccardDistance(setA, setB)
			if dist < threshold {
				pairs = append(pairs, DimensionPair{
					DimA: dims[i].ID, DimB: dims[j].ID, Distance: dist,
				})
			}
		}
	}
	return pairs
}

// enforceOrthogonality merges dimensions that are too similar (Jaccard distance < 0.7).
func enforceOrthogonality(dims []Dimension) []Dimension {
	const threshold = 0.7
	for {
		pairs := CheckOrthogonality(dims, threshold)
		if len(pairs) == 0 {
			break
		}
		// Merge the first non-orthogonal pair
		p := pairs[0]
		dims = mergeDimensions(dims, p.DimA, p.DimB)
	}
	return dims
}

func mergeDimensions(dims []Dimension, idA, idB string) []Dimension {
	var a, b *Dimension
	var rest []Dimension
	for i := range dims {
		switch dims[i].ID {
		case idA:
			a = &dims[i]
		case idB:
			b = &dims[i]
		default:
			rest = append(rest, dims[i])
		}
	}
	if a == nil || b == nil {
		return dims
	}

	merged := Dimension{
		ID:              a.ID,
		Name:            a.Name + " + " + b.Name,
		InfoType:        a.InfoType,
		SubQuestions:    appendUnique(a.SubQuestions, b.SubQuestions),
		SearchQueries:   appendUnique(a.SearchQueries, b.SearchQueries),
		Keywords:        appendUnique(a.Keywords, b.Keywords),
		QualityCriteria: appendUnique(a.QualityCriteria, b.QualityCriteria),
		Priority:        minInt(a.Priority, b.Priority),
	}
	return append([]Dimension{merged}, rest...)
}

func toKeywordSet(items []string) map[string]bool {
	s := make(map[string]bool, len(items))
	for _, item := range items {
		s[strings.ToLower(strings.TrimSpace(item))] = true
	}
	return s
}

func jaccardDistance(a, b map[string]bool) float64 {
	intersection := 0
	for k := range a {
		if b[k] {
			intersection++
		}
	}
	union := len(a) + len(b) - intersection
	if union == 0 {
		return 1.0
	}
	return 1.0 - float64(intersection)/float64(union)
}

func appendUnique(a, b []string) []string {
	seen := make(map[string]bool, len(a))
	for _, s := range a {
		seen[s] = true
	}
	result := append([]string{}, a...)
	for _, s := range b {
		if !seen[s] {
			result = append(result, s)
		}
	}
	return result
}

func minInt(a, b int) int {
	if a <= b {
		return a
	}
	return b
}
