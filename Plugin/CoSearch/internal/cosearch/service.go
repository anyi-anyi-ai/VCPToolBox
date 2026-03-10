package cosearch

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const protocolVersion = "cosearch-stdio/1.1"

var assessSignalsFunc = AssessSignalsLLM

func Run(ctx context.Context, stdin io.Reader, stdout, stderr io.Writer) {
	logger := bufio.NewWriter(stderr)
	defer logger.Flush()

	start := time.Now()
	resp := execute(ctx, stdin, start)
	enc := json.NewEncoder(stdout)
	enc.SetEscapeHTML(false)
	if err := enc.Encode(resp); err != nil {
		fmt.Fprintf(logger, "[CoSearch] 输出失败: %v\n", err)
	}
}

func execute(ctx context.Context, stdin io.Reader, start time.Time) Response {
	return executeWithClientFactory(ctx, stdin, start, NewOpenAIClient)
}

func executeWithClientFactory(ctx context.Context, stdin io.Reader, start time.Time, clientFactory func(Config) (*OpenAIClient, error)) Response {
	log := NewLogger(os.Stderr)

	req, err := parseRequest(stdin)
	if err != nil {
		trace := newRuntimeTrace("", start)
		return buildError("invalid_json", "无法解析输入JSON", "standard", "", trace, start, 0, 0)
	}
	req.RequestID = strings.TrimSpace(req.RequestID)
	trace := newRuntimeTrace(req.RequestID, start)
	unbindTrace := bindRuntimeTrace(trace)
	defer unbindTrace()

	if strings.TrimSpace(req.SearchTopic) == "" {
		return buildError("invalid_argument", "缺少必需参数: SearchTopic", "standard", req.RequestID, trace, start, 0, 0)
	}

	cfg, err := LoadConfig()
	if err != nil {
		return buildError("config_error", err.Error(), "standard", req.RequestID, trace, start, 0, 0)
	}

	profile, err := ResolveModeWithConfig(req.Mode, cfg)
	if err != nil {
		return buildError("invalid_argument", err.Error(), "standard", req.RequestID, trace, start, 0, 0)
	}

	keywords, err := ParseKeywords(req.Keywords)
	if err != nil {
		return buildError("invalid_argument", "缺少必需参数: Keywords", profile.Name, req.RequestID, trace, start, 0, 0)
	}

	log.Info("cosearch start",
		"topic", req.SearchTopic,
		"mode", profile.Name,
		"keywords", len(keywords),
		"concurrency", profile.Concurrency,
		"timeout", profile.Timeout.String(),
		"request_id", trace.RequestID,
		"run_id", trace.RunID,
		"artifact_dir", trace.artifactDir(WorkspaceBase()),
	)

	if clientFactory == nil {
		clientFactory = NewOpenAIClient
	}

	client, err := clientFactory(cfg)
	if err != nil {
		return buildError("config_error", err.Error(), profile.Name, req.RequestID, trace, start, len(keywords), 0)
	}

	// Prompt Enrichment: decompose topic into orthogonal dimensions
	enrichCtx, enrichCancel := context.WithTimeout(ctx, 60*time.Second)
	enriched := Enrich(enrichCtx, client, req.SearchTopic, keywords)
	enrichCancel()
	if enriched != nil {
		log.Info("enrichment done", "dimensions", len(enriched.Dimensions))
	}

	showURL := ParseShowURL(req.ShowURL)
	deepDegradeNotice := ""

	if profile.Name == modeDeep {
		clarity := AssessDeepClarity(enriched)
		switch clarity.Decision {
		case deepClarityDecisionPass:
			enriched = clarity.Enriched
			log.Info("deep clarity pass",
				"score", fmt.Sprintf("%.2f", clarity.Score),
				"dimensions", clarity.DimensionCount,
				"coverage", fmt.Sprintf("%.2f", clarity.SubQuestionCoverage),
				"query_validity", fmt.Sprintf("%.2f", clarity.QueryValidity),
			)
		case deepClarityDecisionDegrade:
			deepDegradeNotice = clarity.Message
			enriched = clarity.Enriched
			stdProfile, modeErr := ResolveModeWithConfig(modeStandard, cfg)
			if modeErr != nil {
				return buildError("internal_error", "Deep 模式降级失败: "+modeErr.Error(), modeDeep, req.RequestID, trace, start, len(keywords), 0)
			}
			log.Info("deep clarity degrade",
				"message", clarity.Message,
				"score", fmt.Sprintf("%.2f", clarity.Score),
				"dimensions", clarity.DimensionCount,
				"coverage", fmt.Sprintf("%.2f", clarity.SubQuestionCoverage),
				"query_validity", fmt.Sprintf("%.2f", clarity.QueryValidity),
			)
			profile = stdProfile
		case deepClarityDecisionReject:
			return buildError("invalid_argument", clarity.Message, profile.Name, req.RequestID, trace, start, len(keywords), 0)
		default:
			return buildError("internal_error", "未知的 Deep 清晰度判定结果", profile.Name, req.RequestID, trace, start, len(keywords), 0)
		}
	}

	// Deep mode: dual-phase (Context Builder → Report Writer)
	if profile.Name == modeDeep && enriched != nil {
		return executeDeep(ctx, client, req, profile, enriched, showURL, trace, start)
	}

	// Lite/Standard: enrich keywords then use existing runRound flow
	if enriched != nil {
		if flat := FlattenToKeywords(enriched); len(flat) > 0 {
			maxKW := profile.Concurrency * 2
			if len(flat) > maxKW {
				flat = flat[:maxKW]
			}
			keywords = flat
		}
	}

	timeline := make([]map[string]SearchResult, 0, profile.MaxRounds)
	roundFiles := make([]string, 0, profile.MaxRounds)
	for round := 1; round <= profile.MaxRounds; round++ {
		roundCtx, cancel := context.WithTimeout(ctx, profile.Timeout)
		results := runRound(roundCtx, client, req.SearchTopic, keywords, round, profile)
		cancel()
		timeline = append(timeline, results)
		path, _ := writeRoundMarkdown(req.SearchTopic, profile.Name, round, results)
		if path != "" {
			roundFiles = append(roundFiles, path)
		}

		succ := 0
		for _, r := range results {
			if r.Err == nil {
				succ++
			}
		}
		log.Info("round done", "round", round, "success", succ, "total", len(results))

		if round >= 2 && shouldStopByLowGain(timeline) {
			log.Info("early stop", "reason", "low gain")
			break
		}
	}

	assessCtx, assessCancel := context.WithTimeout(ctx, 60*time.Second)
	report, successCount, failedCount := buildReport(assessCtx, client, req, profile, timeline, roundFiles, start, showURL)
	assessCancel()
	if successCount == 0 {
		return buildError("upstream_error", "所有关键词检索失败，请检查网关与模型配置", profile.Name, req.RequestID, trace, start, len(keywords), failedCount)
	}

	layers := buildLayers(report, showURL)
	if deepDegradeNotice != "" {
		layers.L1Conclusion = fmt.Sprintf("⚠️ %s\n\n%s", deepDegradeNotice, layers.L1Conclusion)
	}
	reportMD, reportJSON, err := writeReportArtifacts(report, layers)
	if err != nil {
		return buildError("internal_error", "报告落盘失败: "+err.Error(), profile.Name, req.RequestID, trace, start, len(keywords), failedCount)
	}
	report.ReportMD = reportMD
	report.ReportJSON = reportJSON

	return Response{
		Status:    "success",
		Result:    layers.L1Conclusion,
		Mode:      profile.Name,
		RequestID: req.RequestID,
		Meta: &Meta{
			DurationMS:      time.Since(start).Milliseconds(),
			KeywordCount:    len(keywords),
			SuccessCount:    successCount,
			FailedCount:     failedCount,
			Timestamp:       time.Now().UTC().Format(time.RFC3339),
			ProtocolVersion: protocolVersion,
			RequestID:       trace.RequestID,
			RunID:           trace.RunID,
			ArtifactDir:     trace.artifactDir(WorkspaceBase()),
		},
		Report: &report,
		Layers: &layers,
	}
}

func parseRequest(stdin io.Reader) (Request, error) {
	buf, err := io.ReadAll(stdin)
	if err != nil {
		return Request{}, err
	}
	if len(buf) == 0 {
		return Request{}, errors.New("stdin empty")
	}
	buf = bytes.TrimSpace(buf)
	if len(buf) >= 3 && buf[0] == 0xef && buf[1] == 0xbb && buf[2] == 0xbf {
		buf = bytes.TrimSpace(buf[3:])
	}
	var req Request
	if err := json.Unmarshal(buf, &req); err != nil {
		return Request{}, err
	}
	return req, nil
}

func runRound(ctx context.Context, client *OpenAIClient, topic string, keywords []string, round int, profile ModeProfile) map[string]SearchResult {
	results := make(map[string]SearchResult, len(keywords))
	var mu sync.Mutex
	var wg sync.WaitGroup
	sem := make(chan struct{}, profile.Concurrency)

	for _, kw := range keywords {
		keyword := kw
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			searchResult := callWithRetry(ctx, client, topic, keyword, round, profile)
			mu.Lock()
			results[keyword] = searchResult
			mu.Unlock()
		}()
	}

	wg.Wait()
	return results
}

func shouldStopByLowGain(timeline []map[string]SearchResult) bool {
	if len(timeline) < 2 {
		return false
	}
	curr := timeline[len(timeline)-1]
	prev := timeline[len(timeline)-2]
	improved := 0
	for k, v := range curr {
		if v.Err != nil {
			continue
		}
		old, ok := prev[k]
		if !ok || old.Err != nil {
			improved++
			continue
		}
		if len(strings.TrimSpace(v.Text)) > len(strings.TrimSpace(old.Text))+120 {
			improved++
		}
	}
	return improved == 0
}

func buildReport(ctx context.Context, client *OpenAIClient, req Request, profile ModeProfile, timeline []map[string]SearchResult, roundFiles []string, start time.Time, showURL bool) (Report, int, int) {
	latest := timeline[len(timeline)-1]
	keywords := make([]string, 0, len(latest))
	for k := range latest {
		keywords = append(keywords, k)
	}
	sort.Strings(keywords)

	// Collect successful items for LLM signal assessment
	type pendingItem struct {
		keyword string
		index   int
		sources []string
	}
	items := make([]ReportItem, 0, len(keywords))
	stats := ReportStats{}
	successCount := 0
	failedCount := 0
	var signalItems []SignalItem
	var pending []pendingItem

	for _, keyword := range keywords {
		result := latest[keyword]
		item := ReportItem{Keyword: keyword, UsedRound: len(timeline)}
		if result.Err != nil {
			item.Failed = true
			item.Error = result.Err.Error()
			item.SignalGrade = "N"
			stats.N++
			failedCount++
			items = append(items, item)
			continue
		}

		successCount++
		item.Summary = strings.TrimSpace(result.Text)
		sources := normalizeCitationURLs(result.Citations)
		item.Sources = sources
		if !showURL {
			item.Sources = nil
		}
		pending = append(pending, pendingItem{keyword: keyword, index: len(items), sources: sources})
		signalItems = append(signalItems, SignalItem{
			Keyword: keyword,
			Summary: item.Summary,
			Sources: sources,
		})
		items = append(items, item)
	}

	// LLM batch signal assessment (concurrent, with keyword fallback)
	assessments := assessSignalsFunc(ctx, client, signalItems, 3, profile.Concurrency)
	for _, p := range pending {
		assessment, ok := assessments[p.keyword]
		if !ok {
			assessment = AssessSignal(items[p.index].Summary, p.sources)
		}
		items[p.index].F1Behavior = assessment.F1
		items[p.index].F2Survival72h = assessment.F2
		items[p.index].F3Morphism = assessment.F3
		items[p.index].Why = strings.Join(assessment.Why, "；")
		items[p.index].SignalGrade = assessment.Grade()
		switch items[p.index].SignalGrade {
		case "S1":
			stats.S1++
		case "S2":
			stats.S2++
		case "S3":
			stats.S3++
		default:
			stats.N++
		}
	}

	report := Report{
		Title:   "CoSearch 检索报告",
		Topic:   req.SearchTopic,
		Mode:    profile.Name,
		Rounds:  len(timeline),
		Items:   items,
		Stats:   stats,
		Stopped: stopReason(profile.MaxRounds, len(timeline)),
		RoundMD: roundFiles,
		Started: start,
		Ended:   time.Now(),
	}
	return report, successCount, failedCount
}

func stopReason(maxRounds, actualRounds int) string {
	if actualRounds < maxRounds {
		return "信号增量趋近于零，提前停止"
	}
	return "达到档位最大轮次"
}

func buildLayers(report Report, showURL bool) ReportLayer {
	var b1 strings.Builder
	b1.WriteString("## CoSearch 结论层 (L1)\n\n")
	b1.WriteString(fmt.Sprintf("- 主题: %s\n", report.Topic))
	b1.WriteString(fmt.Sprintf("- 模式: %s\n", report.Mode))
	b1.WriteString("- 核心信号:\n")
	for _, item := range report.Items {
		if item.Failed {
			continue
		}
		line := oneLine(item.Summary, 100)
		b1.WriteString(fmt.Sprintf("  - [%s] %s: %s\n", item.SignalGrade, item.Keyword, line))
	}

	var b2 strings.Builder
	b2.WriteString("## 信号层 (L2)\n\n")
	for _, item := range report.Items {
		if item.Failed {
			continue
		}
		b2.WriteString(fmt.Sprintf("### %s (%s)\n%s\n\n", item.Keyword, item.SignalGrade, oneLine(item.Summary, 260)))
	}

	var b3 strings.Builder
	if showURL {
		b3.WriteString("## 证据层 (L3)\n\n")
		for _, item := range report.Items {
			if item.Failed || len(item.Sources) == 0 {
				continue
			}
			b3.WriteString(fmt.Sprintf("### %s\n", item.Keyword))
			for _, src := range item.Sources {
				b3.WriteString(fmt.Sprintf("- %s\n", src))
			}
			b3.WriteString("\n")
		}
	}

	var b4 strings.Builder
	b4.WriteString("## 轨迹层 (L4)\n\n")
	b4.WriteString(fmt.Sprintf("- rounds: %d\n", report.Rounds))
	b4.WriteString(fmt.Sprintf("- stopped: %s\n", report.Stopped))
	if len(report.RoundMD) > 0 {
		b4.WriteString("- round files:\n")
		for _, path := range report.RoundMD {
			b4.WriteString(fmt.Sprintf("  - %s\n", path))
		}
	}

	return ReportLayer{
		L1Conclusion: b1.String(),
		L2Signals:    b2.String(),
		L3Evidence:   b3.String(),
		L4Trace:      b4.String(),
	}
}

func oneLine(text string, limit int) string {
	text = strings.ReplaceAll(strings.TrimSpace(text), "\n", " ")
	runes := []rune(text)
	if len(runes) <= limit {
		return text
	}
	return string(runes[:limit]) + "..."
}

func buildError(code, message, mode, requestID string, trace runtimeTrace, start time.Time, keywordCount, failedCount int) Response {
	return Response{
		Status:    "error",
		Error:     message,
		ErrorCode: code,
		Mode:      mode,
		RequestID: requestID,
		Meta: &Meta{
			DurationMS:      time.Since(start).Milliseconds(),
			KeywordCount:    keywordCount,
			SuccessCount:    0,
			FailedCount:     failedCount,
			Timestamp:       time.Now().UTC().Format(time.RFC3339),
			ProtocolVersion: protocolVersion,
			RequestID:       requestID,
			RunID:           trace.RunID,
			ArtifactDir:     trace.artifactDir(WorkspaceBase()),
		},
	}
}

func writeRoundMarkdown(topic, mode string, round int, results map[string]SearchResult) (string, error) {
	trace := resolveRuntimeTrace()
	dir := trace.artifactDir(WorkspaceBase())
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}

	path := filepath.Join(dir, fmt.Sprintf("Round-%d.md", round))
	keys := make([]string, 0, len(results))
	for k := range results {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var b strings.Builder
	b.WriteString(fmt.Sprintf("# Round %d\n\n", round))
	b.WriteString(fmt.Sprintf("- topic: %s\n", topic))
	b.WriteString(fmt.Sprintf("- mode: %s\n", mode))
	b.WriteString(fmt.Sprintf("- time: %s\n\n", time.Now().Format(time.RFC3339)))
	b.WriteString(fmt.Sprintf("- run_id: %s\n", trace.RunID))
	if trace.RequestID != "" {
		b.WriteString(fmt.Sprintf("- request_id: %s\n", trace.RequestID))
	}
	b.WriteString("\n")

	for _, keyword := range keys {
		res := results[keyword]
		b.WriteString(fmt.Sprintf("## %s\n", keyword))
		if res.Err != nil {
			b.WriteString(fmt.Sprintf("- status: failed\n- error: %s\n\n", res.Err.Error()))
			continue
		}
		b.WriteString("- status: success\n")
		b.WriteString(fmt.Sprintf("- summary: %s\n", oneLine(res.Text, 220)))
		if len(res.Citations) > 0 {
			b.WriteString("- sources:\n")
			for _, c := range res.Citations {
				b.WriteString(fmt.Sprintf("  - %s\n", c.URL))
			}
		}
		b.WriteString("\n")
	}

	if err := writeFileAtomically(path, []byte(b.String()), 0o644); err != nil {
		return "", err
	}
	return path, nil
}

// executeDeep runs the dual-phase Deep mode: Context Builder → Report Writer.
func executeDeep(ctx context.Context, client *OpenAIClient, req Request, profile ModeProfile, enriched *EnrichedQuery, showURL bool, trace runtimeTrace, start time.Time) Response {
	ctx, cancel := context.WithTimeout(ctx, 25*time.Minute)
	defer cancel()

	// Phase 1: Context Builder
	cb, err := BuildContext(ctx, client, req.SearchTopic, enriched, profile)
	if err != nil {
		return buildError("internal_error", "Context Builder 失败: "+err.Error(), profile.Name, req.RequestID, trace, start, 0, 0)
	}

	if cb.KB.CoveredCount() == 0 {
		return buildError("upstream_error", "所有搜索均未返回有效结果", profile.Name, req.RequestID, trace, start, cb.KB.TotalQuestions(), 0)
	}

	// Phase 2: Report Writer
	rw, err := WriteReport(ctx, client, cb, req, profile, showURL, start)
	if err != nil {
		return buildError("internal_error", "Report Writer 失败: "+err.Error(), profile.Name, req.RequestID, trace, start, cb.KB.TotalQuestions(), 0)
	}

	// Persist artifacts
	reportMD, reportJSON, err := writeReportArtifacts(rw.Report, rw.Layers)
	if err != nil {
		return buildError("internal_error", "报告落盘失败: "+err.Error(), profile.Name, req.RequestID, trace, start, cb.KB.TotalQuestions(), 0)
	}
	rw.Report.ReportMD = reportMD
	rw.Report.ReportJSON = reportJSON

	successCount := cb.KB.CoveredCount()
	failedCount := cb.KB.TotalQuestions() - successCount

	return Response{
		Status:    "success",
		Result:    rw.Layers.L1Conclusion,
		Mode:      profile.Name,
		RequestID: req.RequestID,
		Meta: &Meta{
			DurationMS:      time.Since(start).Milliseconds(),
			KeywordCount:    cb.KB.TotalQuestions(),
			SuccessCount:    successCount,
			FailedCount:     failedCount,
			Timestamp:       time.Now().UTC().Format(time.RFC3339),
			ProtocolVersion: protocolVersion,
			RequestID:       trace.RequestID,
			RunID:           trace.RunID,
			ArtifactDir:     trace.artifactDir(WorkspaceBase()),
		},
		Report: &rw.Report,
		Layers: &rw.Layers,
	}
}
