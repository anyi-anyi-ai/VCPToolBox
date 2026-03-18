package cosearch

import (
	"fmt"
	"regexp"
	"strings"
)

const (
	deepClarityDecisionPass    = "pass"
	deepClarityDecisionDegrade = "degrade"
	deepClarityDecisionReject  = "reject"
)

var meaningfulQueryPattern = regexp.MustCompile(`[\p{L}\p{N}]`)

// DeepClarityAssessment describes whether a Deep-mode investigation can run safely.
type DeepClarityAssessment struct {
	Decision string
	Message  string
	Reasons  []string

	DimensionCount      int
	TotalSubQuestions   int
	CoveredSubQuestions int
	SubQuestionCoverage float64
	TotalQueries        int
	ValidQueries        int
	QueryValidity       float64
	Score               float64

	Enriched *EnrichedQuery
}

// AssessDeepClarity evaluates enrichment quality for Deep mode.
// It checks dimension breadth, sub-question executable coverage, and query validity.
func AssessDeepClarity(eq *EnrichedQuery) DeepClarityAssessment {
	if eq == nil {
		return DeepClarityAssessment{
			Decision: deepClarityDecisionDegrade,
			Message:  "未获得结构化问题拆解，Deep 模式已自动降级为 standard 模式。",
		}
	}

	normalized := sanitizeEnrichedQuery(eq)
	assessment := DeepClarityAssessment{Enriched: normalized}
	if normalized == nil || len(normalized.Dimensions) == 0 {
		assessment.Decision = deepClarityDecisionReject
		assessment.Reasons = []string{"未识别到可执行的研究维度"}
		assessment.Message = "无法进入 Deep 模式：未识别到可执行的研究维度。请补充至少 1 个包含明确子问题的维度，或改用 standard 模式。"
		return assessment
	}

	assessment.DimensionCount = len(normalized.Dimensions)
	for _, dim := range normalized.Dimensions {
		assessment.TotalSubQuestions += len(dim.SubQuestions)
		for i, sq := range dim.SubQuestions {
			explicitQuery := ""
			if i < len(dim.SearchQueries) {
				explicitQuery = strings.TrimSpace(dim.SearchQueries[i])
			}

			if explicitQuery != "" {
				assessment.TotalQueries++
				if isMeaningfulQuery(explicitQuery) {
					assessment.ValidQueries++
				}
			}

			if isMeaningfulQuery(explicitQuery) || isMeaningfulQuery(sq) {
				assessment.CoveredSubQuestions++
			}
		}

		for i := len(dim.SubQuestions); i < len(dim.SearchQueries); i++ {
			extra := strings.TrimSpace(dim.SearchQueries[i])
			if extra == "" {
				continue
			}
			assessment.TotalQueries++
			if isMeaningfulQuery(extra) {
				assessment.ValidQueries++
			}
		}
	}

	if assessment.TotalSubQuestions > 0 {
		assessment.SubQuestionCoverage = float64(assessment.CoveredSubQuestions) / float64(assessment.TotalSubQuestions)
	}
	if assessment.TotalQueries > 0 {
		assessment.QueryValidity = float64(assessment.ValidQueries) / float64(assessment.TotalQueries)
	}

	dimensionScore := float64(assessment.DimensionCount) / 3.0
	if dimensionScore > 1.0 {
		dimensionScore = 1.0
	}
	assessment.Score = 0.40*dimensionScore + 0.35*assessment.SubQuestionCoverage + 0.25*assessment.QueryValidity

	assessment.Reasons = buildDeepClarityReasons(assessment)

	if assessment.TotalSubQuestions == 0 || assessment.CoveredSubQuestions == 0 || assessment.SubQuestionCoverage < 0.34 {
		assessment.Decision = deepClarityDecisionReject
		assessment.Message = buildDeepRejectMessage(assessment)
		return assessment
	}

	if assessment.Score >= 0.70 && assessment.SubQuestionCoverage >= 0.60 && assessment.TotalQueries > 0 && assessment.QueryValidity >= 0.50 {
		assessment.Decision = deepClarityDecisionPass
		assessment.Message = fmt.Sprintf(
			"Deep 模式清晰度通过（评分 %.2f，维度 %d，子问题覆盖 %.0f%%，查询有效性 %.0f%%）。",
			assessment.Score,
			assessment.DimensionCount,
			assessment.SubQuestionCoverage*100,
			assessment.QueryValidity*100,
		)
		return assessment
	}

	assessment.Decision = deepClarityDecisionDegrade
	assessment.Message = buildDeepDegradeMessage(assessment)
	return assessment
}

func buildDeepClarityReasons(a DeepClarityAssessment) []string {
	reasons := make([]string, 0, 3)
	if a.DimensionCount < 3 {
		reasons = append(reasons, fmt.Sprintf("维度数量偏少（当前 %d，建议 ≥3）", a.DimensionCount))
	}
	if a.SubQuestionCoverage < 0.70 {
		reasons = append(reasons, fmt.Sprintf("子问题可执行覆盖率偏低（%.0f%%，建议 ≥70%%）", a.SubQuestionCoverage*100))
	}
	switch {
	case a.TotalQueries == 0:
		reasons = append(reasons, "缺少可评估的搜索查询")
	case a.QueryValidity < 0.70:
		reasons = append(reasons, fmt.Sprintf("查询有效性偏低（%.0f%%，建议 ≥70%%）", a.QueryValidity*100))
	}
	return reasons
}

func buildDeepDegradeMessage(a DeepClarityAssessment) string {
	base := "Deep 模式清晰度不足，已自动降级为 standard 模式。"
	if len(a.Reasons) == 0 {
		return base
	}
	return fmt.Sprintf("%s 原因：%s。", base, strings.Join(a.Reasons, "；"))
}

func buildDeepRejectMessage(a DeepClarityAssessment) string {
	base := "无法进入 Deep 模式：问题拆解不可执行"
	if len(a.Reasons) > 0 {
		base = fmt.Sprintf("%s（%s）", base, strings.Join(a.Reasons, "；"))
	}
	return base + "。请补充可执行子问题与有效搜索查询，或改用 standard 模式。"
}

func sanitizeEnrichedQuery(eq *EnrichedQuery) *EnrichedQuery {
	if eq == nil {
		return nil
	}
	out := &EnrichedQuery{
		Intent:      strings.TrimSpace(eq.Intent),
		Constraints: eq.Constraints,
	}

	for i, dim := range eq.Dimensions {
		id := strings.TrimSpace(dim.ID)
		if id == "" {
			id = fmt.Sprintf("d%d", i+1)
		}

		cleanSubs := make([]string, 0, len(dim.SubQuestions))
		cleanQueries := make([]string, 0, len(dim.SubQuestions))
		for idx, sq := range dim.SubQuestions {
			sq = strings.TrimSpace(sq)
			if sq == "" {
				continue
			}
			cleanSubs = append(cleanSubs, sq)

			q := ""
			if idx < len(dim.SearchQueries) {
				q = strings.TrimSpace(dim.SearchQueries[idx])
			}
			cleanQueries = append(cleanQueries, q)
		}

		if len(cleanSubs) == 0 {
			continue
		}

		cleanDim := Dimension{
			ID:              id,
			Name:            strings.TrimSpace(dim.Name),
			InfoType:        strings.TrimSpace(dim.InfoType),
			SubQuestions:    cleanSubs,
			SearchQueries:   cleanQueries,
			Keywords:        trimNonEmptyUnique(dim.Keywords),
			QualityCriteria: trimNonEmptyUnique(dim.QualityCriteria),
			Priority:        dim.Priority,
		}
		out.Dimensions = append(out.Dimensions, cleanDim)
	}

	if len(out.Dimensions) == 0 {
		return nil
	}
	return out
}

func trimNonEmptyUnique(items []string) []string {
	seen := make(map[string]struct{}, len(items))
	out := make([]string, 0, len(items))
	for _, raw := range items {
		s := strings.TrimSpace(raw)
		if s == "" {
			continue
		}
		key := strings.ToLower(s)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, s)
	}
	return out
}

func isMeaningfulQuery(s string) bool {
	s = strings.TrimSpace(s)
	if s == "" {
		return false
	}
	return meaningfulQueryPattern.MatchString(s)
}
