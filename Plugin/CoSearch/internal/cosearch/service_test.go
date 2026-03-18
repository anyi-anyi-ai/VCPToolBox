package cosearch

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"testing"
	"time"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return f(req)
}

func jsonResponse(status int, body string) *http.Response {
	return &http.Response{
		StatusCode: status,
		Header: http.Header{
			"Content-Type": []string{"application/json"},
		},
		Body: io.NopCloser(strings.NewReader(body)),
	}
}

func newMockClientFactory(rt http.RoundTripper) func(Config) (*OpenAIClient, error) {
	return func(cfg Config) (*OpenAIClient, error) {
		return &OpenAIClient{
			cfg: cfg,
			httpClient: &http.Client{
				Transport: rt,
				Timeout:   10 * time.Second,
			},
		}, nil
	}
}

func mockSearchPayload(text, url string) string {
	return `{
		"output": [{
			"type": "message",
			"content": [{
				"type": "output_text",
				"text": "` + text + `",
				"annotations": [{"type":"url_citation","title":"doc","url":"` + url + `"}]
			}]
		}]
	}`
}

func TestExecuteSuccessWithMockTransport(t *testing.T) {
	t.Setenv("COSEARCH_BASE_URL", "https://mock.local/v1/responses")
	t.Setenv("COSEARCH_API_KEY", "test-key")
	t.Setenv("COSEARCH_MODEL", "gpt-5.2")
	t.Setenv("COSEARCH_WORKSPACE_DIR", t.TempDir())
	t.Setenv("COSEARCH_CONCURRENCY", "1")

	rt := roundTripFunc(func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		bodyStr := string(body)
		if strings.Contains(bodyStr, `"web_search"`) {
			return jsonResponse(200, mockSearchPayload("这是mock结论，建议升级并关注2026趋势。", "https://example.com/a")), nil
		}
		// 非检索调用（enrichment / assessment）返回错误，触发调用方本地fallback
		return jsonResponse(500, `{"error":{"message":"mock non-search disabled"}}`), nil
	})

	input := bytes.NewBufferString(`{"SearchTopic":"topic","Keywords":"k1,k2","ShowURL":true,"Mode":"lite"}`)
	resp := executeWithClientFactory(context.Background(), input, time.Now(), newMockClientFactory(rt))
	if resp.Status != "success" {
		t.Fatalf("expected success, got %#v", resp)
	}
	if resp.Report == nil || len(resp.Report.Items) != 2 {
		t.Fatalf("unexpected report: %#v", resp.Report)
	}
}

func TestExecuteDeepModeWithMockTransport(t *testing.T) {
	callCount := 0
	var mu sync.Mutex
	rt := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(r.Body)
		bodyStr := string(body)

		mu.Lock()
		callCount++
		mu.Unlock()

		// Enrichment call: has "研究规划专家" in system prompt, no tools
		if !contains(bodyStr, "web_search") && contains(bodyStr, "研究规划") {
			return jsonResponse(200, `{
			"output": [{"type":"message","content":[{"type":"output_text","text":"{\"intent\":\"test\",\"dimensions\":[{\"id\":\"d1\",\"name\":\"Basics\",\"info_type\":\"factual\",\"sub_questions\":[\"What is topic?\"],\"search_queries\":[\"topic overview\"],\"keywords\":[\"topic\"],\"quality_criteria\":[\"accurate\"],\"priority\":1}]}"}]}]
		}`), nil
		}

		// Search calls: has web_search tool
		if contains(bodyStr, "web_search") {
			return jsonResponse(200, `{
			"output": [{"type":"message","content":[{"type":"output_text","text":"这是关于topic的深度研究结论，包含重要发现和建议。本周发布的框架提供了新的原则。","annotations":[{"type":"url_citation","title":"doc","url":"https://example.com/deep"}]}]}]
		}`), nil
		}

		// Report Writer / assessment calls: fail and let service fallback
		return jsonResponse(500, `{"error":{"message":"mock writer disabled"}}`), nil
	})

	t.Setenv("COSEARCH_BASE_URL", "https://mock.local/v1/responses")
	t.Setenv("COSEARCH_API_KEY", "test-key")
	t.Setenv("COSEARCH_MODEL", "test-model")
	t.Setenv("COSEARCH_WORKSPACE_DIR", t.TempDir())
	t.Setenv("COSEARCH_CONCURRENCY", "1")

	input := bytes.NewBufferString(`{"SearchTopic":"topic","Keywords":"k1","ShowURL":true,"Mode":"deep"}`)
	resp := executeWithClientFactory(context.Background(), input, time.Now(), newMockClientFactory(rt))

	if resp.Status != "success" {
		t.Fatalf("expected success, got status=%s error=%s code=%s", resp.Status, resp.Error, resp.ErrorCode)
	}
	if resp.Mode != "deep" {
		t.Fatalf("expected mode=deep, got %s", resp.Mode)
	}
	if resp.Report == nil {
		t.Fatal("expected non-nil report")
	}
	if resp.Layers == nil {
		t.Fatal("expected non-nil layers")
	}
	// Should have L4 with metrics
	if resp.Layers.L4Trace == "" {
		t.Fatal("expected L4 trace")
	}
	// Deep mode should have made multiple API calls (enrichment + search + report writer)
	mu.Lock()
	gotCalls := callCount
	mu.Unlock()
	if gotCalls < 3 {
		t.Fatalf("expected at least 3 API calls, got %d", gotCalls)
	}
}

func contains(s, substr string) bool {
	return bytes.Contains([]byte(s), []byte(substr))
}

func TestExecuteConfigError(t *testing.T) {
	_ = os.Unsetenv("COSEARCH_API_KEY")
	_ = os.Unsetenv("OPENAI_API_KEY")

	input := bytes.NewBufferString(`{"SearchTopic":"topic","Keywords":"k1"}`)
	resp := execute(context.Background(), input, time.Now())
	if resp.Status != "error" || resp.ErrorCode != "config_error" {
		t.Fatalf("unexpected resp: %#v", resp)
	}
}

func TestBuildReportFallbackUsesCurrentItemSources(t *testing.T) {
	origAssess := assessSignalsFunc
	t.Cleanup(func() {
		assessSignalsFunc = origAssess
	})

	assessSignalsFunc = func(ctx context.Context, client *OpenAIClient, items []SignalItem, batchSize, concurrency int) map[string]SignalAssessment {
		return map[string]SignalAssessment{
			"a": {F1: true, F2: false, F3: false, Why: []string{"mock"}},
			// "b" 故意缺失，触发 buildReport fallback
		}
	}

	req := Request{SearchTopic: "topic"}
	profile := ModeProfile{Name: modeStandard, Concurrency: 1, MaxRounds: 2}
	timeline := []map[string]SearchResult{
		{
			"a": {
				Keyword: "a",
				Text:    "建议立即升级并发布变更。",
				Citations: []Citation{
					{Title: "a", URL: "https://example.com/a"},
				},
			},
			"b": {
				Keyword:   "b",
				Text:      "建议今天行动并更新策略。",
				Citations: nil, // 关键：无来源
			},
		},
	}

	report, _, _ := buildReport(context.Background(), nil, req, profile, timeline, nil, time.Now(), true)
	if len(report.Items) != 2 {
		t.Fatalf("expected 2 report items, got %d", len(report.Items))
	}

	var itemA, itemB *ReportItem
	for i := range report.Items {
		switch report.Items[i].Keyword {
		case "a":
			itemA = &report.Items[i]
		case "b":
			itemB = &report.Items[i]
		}
	}
	if itemA == nil || itemB == nil {
		t.Fatalf("missing expected items: %#v", report.Items)
	}
	if !itemA.F1Behavior {
		t.Fatalf("expected item a F1=true from mock assessment, got false")
	}
	// 若 fallback 错误复用了 a 的 sources，这里会被误判为 true
	if itemB.F1Behavior {
		t.Fatalf("expected item b F1=false because it has no sources, got true")
	}
	if itemB.SignalGrade != "N" {
		t.Fatalf("expected item b signal grade N, got %s", itemB.SignalGrade)
	}
}
