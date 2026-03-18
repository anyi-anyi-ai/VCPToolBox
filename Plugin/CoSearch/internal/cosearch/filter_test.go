package cosearch

import (
	"context"
	"os"
	"strings"
	"testing"
)

func TestAssessSignalS1(t *testing.T) {
	summary := "建议立即迁移到新的评测流程。本周已发布更新，且该方案能形成可复用的框架与原则，适用于多团队协作。这一趋势在近期的行业实践中反复出现，背后的因果链条清晰可追溯，体现了从传统方法到新范式的转变路线，是值得关注的长期模式，建议各团队尽早评估并制定相应的适配策略。"
	sources := []string{"https://example.com/a", "https://example.com/b"}
	assessment := AssessSignal(summary, sources)
	if !assessment.F1 || !assessment.F2 || !assessment.F3 {
		t.Fatalf("expected F1/F2/F3 all true, got %#v", assessment)
	}
	if assessment.Grade() != "S1" {
		t.Fatalf("expected S1, got %s", assessment.Grade())
	}
}

func TestNormalizeCitationURLs(t *testing.T) {
	citations := []Citation{
		{URL: "https://example.com/a"},
		{URL: "https://example.com/a"},
		{URL: "ftp://bad.com/file"},
		{URL: "bad-url"},
		{URL: "http://example.org/x"},
	}
	got := normalizeCitationURLs(citations)
	if len(got) != 2 {
		t.Fatalf("expected 2 valid urls, got %#v", got)
	}
}

func TestWriteReportArtifacts(t *testing.T) {
	report := Report{
		Title:   "CoSearch 检索报告",
		Topic:   "topic",
		Mode:    "lite",
		Rounds:  1,
		Stopped: "达到档位最大轮次",
		Items: []ReportItem{{
			Keyword:       "k1",
			Summary:       "summary",
			SignalGrade:   "S3",
			F1Behavior:    false,
			F2Survival72h: false,
			F3Morphism:    true,
		}},
	}
	layers := ReportLayer{L1Conclusion: "L1", L2Signals: "L2", L4Trace: "L4"}

	mdPath, jsonPath, err := writeReportArtifacts(report, layers)
	if err != nil {
		t.Fatalf("write artifacts failed: %v", err)
	}
	defer os.Remove(mdPath)
	defer os.Remove(jsonPath)

	mdBody, err := os.ReadFile(mdPath)
	if err != nil {
		t.Fatalf("read md failed: %v", err)
	}
	if !strings.Contains(string(mdBody), "CoSearch 检索报告") {
		t.Fatalf("unexpected md content: %s", string(mdBody))
	}

	jsonBody, err := os.ReadFile(jsonPath)
	if err != nil {
		t.Fatalf("read json failed: %v", err)
	}
	if !strings.Contains(string(jsonBody), "\"topic\": \"topic\"") {
		t.Fatalf("unexpected json content: %s", string(jsonBody))
	}
}

func TestParseLLMSignalResponse_Valid(t *testing.T) {
	input := `[{"id":1,"f1":true,"f2":false,"f3":true,"why_f1":"contains actionable advice","why_f2":"","why_f3":"transferable pattern"},{"id":2,"f1":false,"f2":true,"f3":false,"why_f1":"","why_f2":"temporal info","why_f3":""}]`
	results := parseLLMSignalResponse(input, 2)
	if len(results) != 2 {
		t.Fatalf("expected 2 results, got %d", len(results))
	}
	if !results[0].F1 || results[0].F2 || !results[0].F3 {
		t.Fatalf("item 1 unexpected: %+v", results[0])
	}
	if results[1].F1 || !results[1].F2 || results[1].F3 {
		t.Fatalf("item 2 unexpected: %+v", results[1])
	}
}

func TestParseLLMSignalResponse_MarkdownFence(t *testing.T) {
	// Simulate LLM wrapping JSON in markdown code fence
	// parseLLMSignalResponse finds the JSON array by locating [ and ]
	input := "some text before [{\"id\":1,\"f1\":true,\"f2\":true,\"f3\":false,\"why_f1\":\"test\",\"why_f2\":\"still valid\",\"why_f3\":\"\"}] some text after"
	results := parseLLMSignalResponse(input, 1)
	if len(results) != 1 {
		t.Fatalf("expected 1 result from markdown-wrapped JSON, got %d", len(results))
	}
	if !results[0].F1 || !results[0].F2 || results[0].F3 {
		t.Fatalf("unexpected result: %+v", results[0])
	}
}

func TestParseLLMSignalResponse_Invalid(t *testing.T) {
	results := parseLLMSignalResponse("not json at all", 1)
	if results != nil {
		t.Fatalf("expected nil for invalid JSON, got %+v", results)
	}
}

func TestParseLLMSignalResponse_Empty(t *testing.T) {
	results := parseLLMSignalResponse("", 0)
	if results != nil {
		t.Fatalf("expected nil for empty input, got %+v", results)
	}
}

func TestAssessSignalsLLM_NilClient_Fallback(t *testing.T) {
	items := []SignalItem{
		{
			Keyword: "test-keyword",
			Summary: "建议立即升级到新版本，最近发布了重要更新。这一趋势反映了从旧模式到新范式的根本转变，值得所有团队关注和评估。",
			Sources: []string{"https://example.com"},
		},
	}
	results := AssessSignalsLLM(context.Background(), nil, items, 3, 2)
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	a, ok := results["test-keyword"]
	if !ok {
		t.Fatal("missing result for test-keyword")
	}
	// Nil client should fallback to keyword matching
	if a.Grade() == "" {
		t.Fatal("expected non-empty grade from fallback")
	}
}

func TestAssessSignalsLLM_EmptyItems(t *testing.T) {
	results := AssessSignalsLLM(context.Background(), nil, nil, 3, 2)
	if len(results) != 0 {
		t.Fatalf("expected empty results for nil items, got %d", len(results))
	}
}

func TestAssessSignalsLLM_BatchSplitting(t *testing.T) {
	// 7 items with batchSize=3 should create 3 batches (3+3+1)
	items := make([]SignalItem, 7)
	for i := range items {
		items[i] = SignalItem{
			Keyword: strings.Repeat("k", i+1), // unique keys
			Summary: "测试内容",
			Sources: []string{"https://example.com"},
		}
	}
	// Nil client: all fall back to keyword matching, but all 7 should be returned
	results := AssessSignalsLLM(context.Background(), nil, items, 3, 2)
	if len(results) != 7 {
		t.Fatalf("expected 7 results, got %d", len(results))
	}
}
