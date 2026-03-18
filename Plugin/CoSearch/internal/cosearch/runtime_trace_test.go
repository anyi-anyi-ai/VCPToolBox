package cosearch

import (
	"bytes"
	"context"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestWriteFileAtomically_ReplacesContent(t *testing.T) {
	target := filepath.Join(t.TempDir(), "atomic.txt")
	if err := writeFileAtomically(target, []byte("v1"), 0o644); err != nil {
		t.Fatalf("write v1 failed: %v", err)
	}
	if err := writeFileAtomically(target, []byte("v2"), 0o644); err != nil {
		t.Fatalf("write v2 failed: %v", err)
	}

	body, err := os.ReadFile(target)
	if err != nil {
		t.Fatalf("read target failed: %v", err)
	}
	if got := string(body); got != "v2" {
		t.Fatalf("expected v2, got %q", got)
	}

	tmpFiles, err := filepath.Glob(filepath.Join(filepath.Dir(target), ".atomic.txt.tmp-*"))
	if err != nil {
		t.Fatalf("glob tmp files failed: %v", err)
	}
	if len(tmpFiles) != 0 {
		t.Fatalf("tmp files should be cleaned, got: %#v", tmpFiles)
	}
}

func TestArtifactsPathUseRunIDAndRequestID(t *testing.T) {
	workspace := t.TempDir()
	t.Setenv("COSEARCH_WORKSPACE_DIR", workspace)

	trace := newRuntimeTrace("REQ/Trace#001", time.Date(2026, 2, 27, 9, 0, 0, 0, time.UTC))
	unbind := bindRuntimeTrace(trace)
	defer unbind()

	roundPath, err := writeRoundMarkdown("topic", "lite", 1, map[string]SearchResult{
		"k1": {Keyword: "k1", Text: "summary"},
	})
	if err != nil {
		t.Fatalf("write round failed: %v", err)
	}

	report := Report{Topic: "topic", Mode: "lite", Rounds: 1, Stopped: "达到档位最大轮次"}
	layers := ReportLayer{L1Conclusion: "L1", L2Signals: "L2", L4Trace: "L4"}
	mdPath, jsonPath, err := writeReportArtifacts(report, layers)
	if err != nil {
		t.Fatalf("write report failed: %v", err)
	}

	expectedRunSeg := filepath.Join("runs", "run_"+trace.RunID)
	if !strings.Contains(roundPath, expectedRunSeg) || !strings.Contains(mdPath, expectedRunSeg) || !strings.Contains(jsonPath, expectedRunSeg) {
		t.Fatalf("expected run id segment %q in artifact paths: round=%s md=%s json=%s", expectedRunSeg, roundPath, mdPath, jsonPath)
	}

	expectedReqSeg := "req_" + trace.RequestSlug
	if !strings.Contains(roundPath, expectedReqSeg) || !strings.Contains(mdPath, expectedReqSeg) || !strings.Contains(jsonPath, expectedReqSeg) {
		t.Fatalf("expected request id segment %q in artifact paths: round=%s md=%s json=%s", expectedReqSeg, roundPath, mdPath, jsonPath)
	}
}

func TestExecutePropagatesRequestAndRunIntoMetaAndArtifacts(t *testing.T) {
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
		return jsonResponse(500, `{"error":{"message":"mock non-search disabled"}}`), nil
	})

	inputRequestID := "Req-Bridge-2026/01"
	input := bytes.NewBufferString(`{"SearchTopic":"topic","Keywords":"k1","ShowURL":true,"Mode":"lite","RequestID":"` + inputRequestID + `"}`)
	resp := executeWithClientFactory(context.Background(), input, time.Now(), newMockClientFactory(rt))
	if resp.Status != "success" {
		t.Fatalf("expected success, got %#v", resp)
	}
	if resp.Meta == nil {
		t.Fatal("expected meta")
	}
	if resp.Meta.RequestID != inputRequestID {
		t.Fatalf("meta request id mismatch: want %q got %q", inputRequestID, resp.Meta.RequestID)
	}
	if resp.Meta.RunID == "" {
		t.Fatal("meta run_id should not be empty")
	}
	if resp.Meta.ArtifactDir == "" {
		t.Fatal("meta artifact_dir should not be empty")
	}

	reqSeg := "req_" + sanitizePathSegment(inputRequestID, 48)
	if !strings.Contains(resp.Meta.ArtifactDir, reqSeg) {
		t.Fatalf("artifact_dir should contain request segment %q, got %s", reqSeg, resp.Meta.ArtifactDir)
	}
	if !strings.Contains(resp.Meta.ArtifactDir, filepath.Join("runs", "run_"+resp.Meta.RunID)) {
		t.Fatalf("artifact_dir should contain run segment, got %s", resp.Meta.ArtifactDir)
	}

	if resp.Report == nil {
		t.Fatal("expected report")
	}
	if !strings.HasPrefix(filepath.Clean(resp.Report.ReportMD), filepath.Clean(resp.Meta.ArtifactDir)) {
		t.Fatalf("report md path should be under artifact dir: artifact=%s report=%s", resp.Meta.ArtifactDir, resp.Report.ReportMD)
	}
	if !strings.HasPrefix(filepath.Clean(resp.Report.ReportJSON), filepath.Clean(resp.Meta.ArtifactDir)) {
		t.Fatalf("report json path should be under artifact dir: artifact=%s report=%s", resp.Meta.ArtifactDir, resp.Report.ReportJSON)
	}
	for _, path := range resp.Report.RoundMD {
		if !strings.HasPrefix(filepath.Clean(path), filepath.Clean(resp.Meta.ArtifactDir)) {
			t.Fatalf("round path should be under artifact dir: artifact=%s round=%s", resp.Meta.ArtifactDir, path)
		}
	}
}
