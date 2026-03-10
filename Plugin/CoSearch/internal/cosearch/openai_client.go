package cosearch

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type OpenAIClient struct {
	cfg        Config
	httpClient *http.Client
}

// CallOptions controls optional behavior for API calls.
type CallOptions struct {
	WebSearch         bool
	SearchContextSize string // "low", "medium", "high"
}

func NewOpenAIClient(cfg Config) (*OpenAIClient, error) {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	if cfg.Proxy != "" {
		u, err := url.Parse(cfg.Proxy)
		if err == nil {
			transport.Proxy = http.ProxyURL(u)
		}
	}

	return &OpenAIClient{
		cfg: cfg,
		httpClient: &http.Client{
			Transport: transport,
			Timeout:   180 * time.Second,
		},
	}, nil
}

// Call is the unified API method supporting both Responses and Chat Completions formats.
// Returns the response text and any citations.
func (c *OpenAIClient) Call(ctx context.Context, systemPrompt, userPrompt string, opts CallOptions) (string, []Citation, error) {
	var payload []byte
	var endpoint string
	var err error

	if c.cfg.Format == "completions" {
		payload, err = c.buildCompletionsPayload(systemPrompt, userPrompt, opts)
		endpoint = c.completionsURL()
	} else {
		payload, err = c.buildResponsesPayload(systemPrompt, userPrompt, opts)
		endpoint = c.cfg.BaseURL
	}
	if err != nil {
		return "", nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(payload))
	if err != nil {
		return "", nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.cfg.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", nil, err
	}

	if resp.StatusCode >= 400 {
		message := parseErrorMessage(respBody)
		if message == "" {
			message = string(respBody)
		}
		return "", nil, fmt.Errorf("HTTP %d - %s", resp.StatusCode, message)
	}

	return ParseResponsePayload(respBody)
}

// buildResponsesPayload creates a payload for the OpenAI Responses API format.
func (c *OpenAIClient) buildResponsesPayload(systemPrompt, userPrompt string, opts CallOptions) ([]byte, error) {
	input := []map[string]any{
		{
			"role":    "user",
			"content": userPrompt,
		},
	}

	payload := map[string]any{
		"model":  c.cfg.Model,
		"input":  input,
		"stream": true,
	}

	if systemPrompt != "" {
		payload["instructions"] = systemPrompt
	}

	if opts.WebSearch {
		contextSize := opts.SearchContextSize
		if contextSize == "" {
			contextSize = "medium"
		}
		tool := map[string]any{
			"type":                "web_search",
			"external_web_access": true,
			"search_context_size": contextSize,
		}
		if c.cfg.EnableWebSearchAllowedDomainsFilter && len(c.cfg.AllowedDomains) > 0 {
			tool["filters"] = map[string]any{
				"allowed_domains": normalizeAllowedDomains(c.cfg.AllowedDomains),
			}
		}
		payload["tools"] = []map[string]any{
			tool,
		}
		payload["tool_choice"] = "auto"
	}

	return json.Marshal(payload)
}

// buildCompletionsPayload creates a payload for the Chat Completions API format.
func (c *OpenAIClient) buildCompletionsPayload(systemPrompt, userPrompt string, opts CallOptions) ([]byte, error) {
	messages := make([]map[string]string, 0, 2)
	if systemPrompt != "" {
		messages = append(messages, map[string]string{"role": "system", "content": systemPrompt})
	}

	// For web_search in completions mode, hint the model to include sources
	if opts.WebSearch {
		userPrompt += "\n\n请联网搜索最新信息，并在回答中给出可验证的来源URL。"
	}
	messages = append(messages, map[string]string{"role": "user", "content": userPrompt})

	payload := map[string]any{
		"model":    c.cfg.Model,
		"messages": messages,
		"stream":   false,
	}

	// Some gateways support web_search in completions mode
	if opts.WebSearch {
		payload["web_search"] = true
	}

	return json.Marshal(payload)
}

// completionsURL derives the chat/completions URL from the configured BaseURL.
func (c *OpenAIClient) completionsURL() string {
	base := c.cfg.BaseURL
	// Replace /responses with /chat/completions
	if strings.HasSuffix(base, "/responses") {
		return strings.TrimSuffix(base, "/responses") + "/chat/completions"
	}
	// If base already ends with /chat/completions, use as-is
	if strings.HasSuffix(base, "/chat/completions") {
		return base
	}
	// Default: append /chat/completions
	return strings.TrimRight(base, "/") + "/chat/completions"
}

// SearchKeyword performs a web search for a keyword using the configured API format.
func (c *OpenAIClient) SearchKeyword(ctx context.Context, topic, keyword string, round int, profile ModeProfile) SearchResult {
	prompt := buildSearchPrompt(topic, keyword, round)
	opts := CallOptions{
		WebSearch:         true,
		SearchContextSize: profile.SearchContextSize,
	}

	text, citations, err := c.Call(ctx, "", prompt, opts)
	if err != nil {
		return SearchResult{Keyword: keyword, Round: round, Err: err}
	}
	return SearchResult{Keyword: keyword, Round: round, Text: text, Citations: citations}
}

func buildSearchPrompt(topic, keyword string, round int) string {
	if round <= 1 {
		return fmt.Sprintf("研究主题：%s\n关键词：%s\n请给出结构化结论、关键事实与可验证来源。", topic, keyword)
	}
	return fmt.Sprintf("研究主题：%s\n关键词：%s\n这是第%d轮补充验证，请重点查找反例、边界条件、更新证据，并修正上一轮结论。", topic, keyword, round)
}

func parseErrorMessage(payload []byte) string {
	var data map[string]any
	if err := json.Unmarshal(payload, &data); err != nil {
		return ""
	}
	errorObj, ok := data["error"].(map[string]any)
	if !ok {
		return ""
	}
	if msg, ok := errorObj["message"].(string); ok {
		return msg
	}
	return ""
}
