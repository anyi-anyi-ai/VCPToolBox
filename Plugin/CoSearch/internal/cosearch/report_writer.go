package cosearch

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// RWResult holds the output of the Report Writer phase.
type RWResult struct {
	Report Report
	Layers ReportLayer
}

// WriteReport reads the KB and generates a structured report using LLM.
// It does NOT make any web search requests — only LLM calls for writing.
func WriteReport(ctx context.Context, client *OpenAIClient, cb *CBResult, req Request, profile ModeProfile, showURL bool, start time.Time) (*RWResult, error) {
	notes, err := cb.KB.ReadAllNotes()
	if err != nil || len(notes) == 0 {
		return fallbackReport(ctx, client, cb, req, profile, showURL, start, nil, allowedDomainsForClient(client)), nil
	}
	allowedDomains := allowedDomainsForClient(client)
	evidenceNotes := constrainNotesToEvidence(notes, allowedDomains)
	if len(evidenceNotes) == 0 {
		return fallbackReport(ctx, client, cb, req, profile, showURL, start, evidenceNotes, allowedDomains), nil
	}

	// Build context from KB notes
	kbContext := buildKBContext(evidenceNotes, allowedDomains)

	// Generate outline via LLM
	outline, err := generateOutline(ctx, client, req.SearchTopic, kbContext)
	if err != nil || strings.TrimSpace(outline) == "" {
		outline = buildDefaultOutlineFromNotes(evidenceNotes)
	}

	// Generate full report via LLM
	reportText, err := generateSectionedReport(ctx, client, req.SearchTopic, outline, kbContext)
	if err != nil || strings.TrimSpace(reportText) == "" {
		return fallbackReport(ctx, client, cb, req, profile, showURL, start, evidenceNotes, allowedDomains), nil
	}

	// Assemble into Report + Layers
	return assembleReport(ctx, client, cb, req, profile, showURL, start, outline, reportText, evidenceNotes, allowedDomains), nil
}

func buildKBContext(notes []KBNote, allowedDomains []string) string {
	var b strings.Builder
	for _, note := range notes {
		evidence := noteEvidenceURLs(note, allowedDomains)
		if len(evidence) == 0 {
			continue
		}
		b.WriteString(fmt.Sprintf("## [%s] %s\n", note.DimID, note.Question))
		b.WriteString(note.Content)
		b.WriteString("\n\n证据URL:\n")
		for _, src := range evidence {
			b.WriteString("- " + src + "\n")
		}
		b.WriteString("\n\n")
	}
	return b.String()
}

func buildDefaultOutline(cb *CBResult) string {
	var b strings.Builder
	b.WriteString("# 报告大纲\n\n")
	notes, _ := cb.KB.ReadAllNotes()
	seen := make(map[string]bool)
	for _, note := range notes {
		if !seen[note.DimID] {
			seen[note.DimID] = true
			b.WriteString(fmt.Sprintf("## %s\n", note.Question))
		}
	}
	b.WriteString("## 总结与建议\n")
	return b.String()
}

func buildDefaultOutlineFromNotes(notes []KBNote) string {
	var b strings.Builder
	b.WriteString("# 报告大纲\n\n")
	seen := make(map[string]bool)
	for _, note := range notes {
		if !seen[note.DimID] {
			seen[note.DimID] = true
			b.WriteString(fmt.Sprintf("## %s\n", note.Question))
		}
	}
	b.WriteString("## 总结与建议\n")
	return b.String()
}

const outlineSystemPrompt = `你是一个研究报告大纲专家。根据提供的研究笔记，生成一个清晰的报告大纲。

要求：
1. 大纲应包含 3-7 个主要章节
2. 每个章节标题应简洁明确
3. 最后一节应为总结与建议
4. 使用 Markdown 格式（## 标题）
5. 只输出大纲，不要正文内容`

func generateOutline(ctx context.Context, client *OpenAIClient, topic, kbContext string) (string, error) {
	prompt := fmt.Sprintf("研究主题：%s\n\n研究笔记：\n%s\n\n请生成报告大纲。", topic, kbContext)
	return callLLMForWriting(ctx, client, outlineSystemPrompt, prompt)
}

const reportSystemPrompt = `你是一个研究报告撰写专家。根据大纲和研究笔记，撰写完整的研究报告。

要求：
1. 严格按照大纲结构撰写
2. 每节内容基于提供的研究笔记，不要编造信息
3. 使用客观、学术的语气
4. 包含关键发现和数据
5. 最后给出有依据的结论和建议
6. 使用 Markdown 格式
7. 只能引用研究笔记中出现的证据URL支持的结论；证据不足时明确写“证据不足”`

func generateSectionedReport(ctx context.Context, client *OpenAIClient, topic, outline, kbContext string) (string, error) {
	prompt := fmt.Sprintf("研究主题：%s\n\n报告大纲：\n%s\n\n研究笔记：\n%s\n\n请按大纲撰写完整报告。", topic, outline, kbContext)
	return callLLMForWriting(ctx, client, reportSystemPrompt, prompt)
}

// callLLMForWriting calls the LLM without web_search tool (pure writing).
func callLLMForWriting(ctx context.Context, client *OpenAIClient, systemPrompt, userPrompt string) (string, error) {
	text, _, err := client.Call(ctx, systemPrompt, userPrompt, CallOptions{})
	return text, err
}

// assembleReport builds Report + ReportLayer from LLM-generated content.
func assembleReport(ctx context.Context, client *OpenAIClient, cb *CBResult, req Request, profile ModeProfile, showURL bool, start time.Time, outline, reportText string, notes []KBNote, allowedDomains []string) *RWResult {
	items, stats, successCount := buildReportItems(ctx, client, notes, cb, showURL, allowedDomains)

	report := Report{
		Title:   "CoSearch 深度研究报告",
		Topic:   req.SearchTopic,
		Mode:    profile.Name,
		Rounds:  cb.Rounds,
		Items:   items,
		Stats:   stats,
		Stopped: cb.StopReason,
		RoundMD: cb.RoundFiles,
		Started: start,
		Ended:   time.Now(),
	}
	_ = successCount

	// Build layers from LLM-generated report
	layers := buildDeepLayers(reportText, cb, showURL, collectEvidenceSources(notes, allowedDomains))

	return &RWResult{Report: report, Layers: layers}
}

// fallbackReport assembles a report directly from KB notes without LLM.
func fallbackReport(ctx context.Context, client *OpenAIClient, cb *CBResult, req Request, profile ModeProfile, showURL bool, start time.Time, notes []KBNote, allowedDomains []string) *RWResult {
	if notes == nil {
		rawNotes, _ := cb.KB.ReadAllNotes()
		notes = constrainNotesToEvidence(rawNotes, allowedDomains)
	}
	items, stats, _ := buildReportItems(ctx, client, notes, cb, showURL, allowedDomains)

	report := Report{
		Title:   "CoSearch 深度研究报告",
		Topic:   req.SearchTopic,
		Mode:    profile.Name,
		Rounds:  cb.Rounds,
		Items:   items,
		Stats:   stats,
		Stopped: cb.StopReason,
		RoundMD: cb.RoundFiles,
		Started: start,
		Ended:   time.Now(),
	}

	// Assemble L1-L4 directly from KB notes
	var l1 strings.Builder
	l1.WriteString("## CoSearch 结论层 (L1)\n\n")
	l1.WriteString(fmt.Sprintf("- 主题: %s\n", req.SearchTopic))
	l1.WriteString(fmt.Sprintf("- 模式: %s (深度研究)\n", profile.Name))
	l1.WriteString(fmt.Sprintf("- 轮次: %d\n", cb.Rounds))
	l1.WriteString(fmt.Sprintf("- 覆盖率: %.0f%%\n", cb.KB.Coverage()*100))
	if len(notes) == 0 {
		l1.WriteString("- 核心发现: 证据不足（无满足闸门的有效URL）\n")
	} else {
		l1.WriteString("- 核心发现:\n")
		for _, note := range notes {
			l1.WriteString(fmt.Sprintf("  - [%s] %s\n", note.DimID, note.Question))
		}
	}

	var l2 strings.Builder
	l2.WriteString("## 信号层 (L2)\n\n")
	for _, note := range notes {
		l2.WriteString(fmt.Sprintf("### [%s] %s\n%s\n\n", note.DimID, note.Question, oneLine(note.Content, 300)))
	}

	var l3 strings.Builder
	if showURL {
		l3.WriteString("## 证据层 (L3)\n\n")
		evidenceSources := collectEvidenceSources(notes, allowedDomains)
		for i, src := range evidenceSources {
			l3.WriteString(fmt.Sprintf("%d. %s\n", i+1, src))
		}
		if len(evidenceSources) == 0 {
			l3.WriteString("- 无可用证据URL\n")
		}
	}

	l4 := buildL4Trace(cb)

	layers := ReportLayer{
		L1Conclusion: l1.String(),
		L2Signals:    l2.String(),
		L3Evidence:   l3.String(),
		L4Trace:      l4,
	}

	return &RWResult{Report: report, Layers: layers}
}

func buildReportItems(ctx context.Context, client *OpenAIClient, notes []KBNote, cb *CBResult, showURL bool, allowedDomains []string) ([]ReportItem, ReportStats, int) {
	items := make([]ReportItem, 0, len(notes))
	stats := ReportStats{}
	successCount := 0

	// Collect signal items for LLM assessment
	var signalItems []SignalItem
	evidenceByKey := make(map[string][]string, len(notes))
	for _, note := range notes {
		key := fmt.Sprintf("%s:%s", note.DimID, note.Question)
		evidence := noteEvidenceURLs(note, allowedDomains)
		if len(evidence) == 0 {
			continue
		}
		evidenceByKey[key] = evidence
		signalItems = append(signalItems, SignalItem{
			Keyword: key,
			Summary: note.Content,
			Sources: evidence,
		})
	}

	// LLM batch signal assessment
	assessments := AssessSignalsLLM(ctx, client, signalItems, 3, 2)

	for _, note := range notes {
		key := fmt.Sprintf("%s:%s", note.DimID, note.Question)
		evidence := evidenceByKey[key]
		if len(evidence) == 0 {
			continue
		}
		item := ReportItem{
			Keyword:   key,
			Summary:   oneLine(note.Content, 260),
			UsedRound: note.Round,
		}
		assessment, ok := assessments[key]
		if !ok {
			assessment = AssessSignal(note.Content, evidence)
		}
		assessment = applyEvidenceURLGate(assessment, evidence)
		item.F1Behavior = assessment.F1
		item.F2Survival72h = assessment.F2
		item.F3Morphism = assessment.F3
		item.Why = strings.Join(assessment.Why, "；")
		item.SignalGrade = assessment.Grade()
		if showURL {
			item.Sources = evidence
		}

		switch item.SignalGrade {
		case "S1":
			stats.S1++
		case "S2":
			stats.S2++
		case "S3":
			stats.S3++
		default:
			stats.N++
		}
		items = append(items, item)
		successCount++
	}

	return items, stats, successCount
}

func buildDeepLayers(reportText string, cb *CBResult, showURL bool, evidenceSources []string) ReportLayer {
	// L1: extract first section or summary
	l1 := extractL1FromReport(reportText, cb)

	// L2: the full report text
	l2 := "## 研究报告 (L2)\n\n" + reportText

	// L3: sources
	var l3 strings.Builder
	if showURL {
		l3.WriteString("## 证据层 (L3)\n\n")
		for i, src := range evidenceSources {
			l3.WriteString(fmt.Sprintf("%d. %s\n", i+1, src))
		}
		if len(evidenceSources) == 0 {
			l3.WriteString("- 无可用证据URL\n")
		}
	}

	// L4: trace
	l4 := buildL4Trace(cb)

	return ReportLayer{
		L1Conclusion: l1,
		L2Signals:    l2,
		L3Evidence:   l3.String(),
		L4Trace:      l4,
	}
}

func extractL1FromReport(reportText string, cb *CBResult) string {
	var b strings.Builder
	b.WriteString("## CoSearch 结论层 (L1)\n\n")
	b.WriteString(fmt.Sprintf("- 覆盖率: %.0f%% (%d/%d 子问题)\n",
		cb.KB.Coverage()*100, cb.KB.CoveredCount(), cb.KB.TotalQuestions()))
	b.WriteString(fmt.Sprintf("- 轮次: %d\n", cb.Rounds))
	b.WriteString(fmt.Sprintf("- 停止原因: %s\n\n", cb.StopReason))

	// Extract first paragraph as executive summary
	lines := strings.Split(reportText, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		b.WriteString(trimmed)
		b.WriteString("\n")
		break
	}
	return b.String()
}

func buildL4Trace(cb *CBResult) string {
	var b strings.Builder
	b.WriteString("## 轨迹层 (L4)\n\n")
	b.WriteString(fmt.Sprintf("- rounds: %d\n", cb.Rounds))
	b.WriteString(fmt.Sprintf("- stopped: %s\n", cb.StopReason))
	b.WriteString(fmt.Sprintf("- coverage: %.1f%%\n", cb.KB.Coverage()*100))

	// Metrics history
	if h := cb.Metrics.History(); len(h) > 0 {
		b.WriteString("- metrics:\n")
		for _, m := range h {
			b.WriteString(fmt.Sprintf("  - round %d: IG=%.2f TC=%.2f SR=%.2f\n", m.Round, m.IG, m.TC, m.SR))
			b.WriteString(fmt.Sprintf("    - retry: queries=%d retried=%d attempts=%d retries=%d backoff=%dms exhausted=%d\n",
				m.Retry.Queries,
				m.Retry.RetriedQueries,
				m.Retry.TotalAttempts,
				m.Retry.TotalRetries,
				m.Retry.TotalBackoffMS,
				m.Retry.ExhaustedCount,
			))
			b.WriteString(fmt.Sprintf("    - gap: before=%d after=%d closed=%d\n",
				m.Gap.Before,
				m.Gap.After,
				m.Gap.Closed,
			))
		}
	}

	if len(cb.RoundFiles) > 0 {
		b.WriteString("- round files:\n")
		for _, path := range cb.RoundFiles {
			b.WriteString(fmt.Sprintf("  - %s\n", path))
		}
	}

	return b.String()
}

// DummyWriteReport builds a report from a CBResult without LLM calls.
// Useful for testing and as a fallback.
func DummyWriteReport(cb *CBResult, req Request, profile ModeProfile, showURL bool, start time.Time) *RWResult {
	return fallbackReport(context.Background(), nil, cb, req, profile, showURL, start, nil, allowedDomainsFromEnv())
}

func constrainNotesToEvidence(notes []KBNote, allowedDomains []string) []KBNote {
	filtered := make([]KBNote, 0, len(notes))
	for _, note := range notes {
		if len(noteEvidenceURLs(note, allowedDomains)) == 0 {
			continue
		}
		filtered = append(filtered, note)
	}
	return filtered
}

func collectEvidenceSources(notes []KBNote, allowedDomains []string) []string {
	all := make([]string, 0, len(notes)*2)
	for _, note := range notes {
		all = append(all, noteEvidenceURLs(note, allowedDomains)...)
	}
	return normalizeSourceURLsWithAllowedDomains(all, allowedDomains)
}
