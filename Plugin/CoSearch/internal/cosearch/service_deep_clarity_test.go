package cosearch

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"strings"
	"sync"
	"testing"
	"time"
)

func TestExecuteDeepDegradeToStandardWhenEnrichmentMissing(t *testing.T) {
	t.Setenv("COSEARCH_BASE_URL", "https://mock.local/v1/responses")
	t.Setenv("COSEARCH_API_KEY", "test-key")
	t.Setenv("COSEARCH_MODEL", "test-model")
	t.Setenv("COSEARCH_WORKSPACE_DIR", t.TempDir())
	t.Setenv("COSEARCH_CONCURRENCY", "1")

	rt := roundTripFunc(func(req *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(req.Body)
		bodyStr := string(body)
		if strings.Contains(bodyStr, `"web_search"`) {
			return jsonResponse(200, mockSearchPayload("这是标准模式降级后的结果，包含可执行建议。", "https://example.com/std")), nil
		}
		// enrichment / assessment 返回失败，触发本地 fallback + deep 降级逻辑
		return jsonResponse(500, `{"error":{"message":"mock non-search disabled"}}`), nil
	})

	input := bytes.NewBufferString(`{"SearchTopic":"topic","Keywords":"k1,k2","ShowURL":true,"Mode":"deep"}`)
	resp := executeWithClientFactory(context.Background(), input, time.Now(), newMockClientFactory(rt))

	if resp.Status != "success" {
		t.Fatalf("expected success, got %#v", resp)
	}
	if resp.Mode != modeStandard {
		t.Fatalf("expected downgraded mode=%s, got %s", modeStandard, resp.Mode)
	}
	if !strings.Contains(resp.Result, "降级") {
		t.Fatalf("expected downgrade notice in result, got: %s", resp.Result)
	}
}

func TestExecuteDeepRejectWhenClarityUnexecutable(t *testing.T) {
	t.Setenv("COSEARCH_BASE_URL", "https://mock.local/v1/responses")
	t.Setenv("COSEARCH_API_KEY", "test-key")
	t.Setenv("COSEARCH_MODEL", "test-model")
	t.Setenv("COSEARCH_WORKSPACE_DIR", t.TempDir())
	t.Setenv("COSEARCH_CONCURRENCY", "1")

	var mu sync.Mutex
	searchCalls := 0
	rt := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		body, _ := io.ReadAll(r.Body)
		bodyStr := string(body)

		if strings.Contains(bodyStr, `"web_search"`) {
			mu.Lock()
			searchCalls++
			mu.Unlock()
			return jsonResponse(200, mockSearchPayload("unexpected search", "https://example.com/unexpected")), nil
		}

		if contains(bodyStr, "研究规划") {
			return jsonResponse(200, `{
			"output": [{"type":"message","content":[{"type":"output_text","text":"{\"intent\":\"bad\",\"dimensions\":[{\"id\":\"d1\",\"name\":\"noise\",\"info_type\":\"factual\",\"sub_questions\":[\"???\"],\"search_queries\":[\"!!!\"],\"keywords\":[\"noise\"],\"quality_criteria\":[\"n/a\"],\"priority\":1}]}"}]}]
		}`), nil
		}

		return jsonResponse(500, `{"error":{"message":"mock non-search disabled"}}`), nil
	})

	input := bytes.NewBufferString(`{"SearchTopic":"topic","Keywords":"k1","ShowURL":true,"Mode":"deep"}`)
	resp := executeWithClientFactory(context.Background(), input, time.Now(), newMockClientFactory(rt))

	if resp.Status != "error" {
		t.Fatalf("expected error, got %#v", resp)
	}
	if resp.ErrorCode != "invalid_argument" {
		t.Fatalf("expected invalid_argument, got %s", resp.ErrorCode)
	}
	if !strings.Contains(resp.Error, "无法进入 Deep 模式") {
		t.Fatalf("unexpected error message: %s", resp.Error)
	}

	mu.Lock()
	gotSearchCalls := searchCalls
	mu.Unlock()
	if gotSearchCalls != 0 {
		t.Fatalf("expected 0 web_search calls after clarity reject, got %d", gotSearchCalls)
	}
}
