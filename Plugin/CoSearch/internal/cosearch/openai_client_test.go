package cosearch

import (
	"encoding/json"
	"testing"
)

func TestBuildResponsesPayload_WebSearchAllowedDomainsFilterDisabledByDefault(t *testing.T) {
	client := &OpenAIClient{
		cfg: Config{
			Model:          "gpt-test",
			AllowedDomains: []string{"example.com"},
		},
	}

	payload, err := client.buildResponsesPayload("", "test prompt", CallOptions{
		WebSearch: true,
	})
	if err != nil {
		t.Fatalf("buildResponsesPayload failed: %v", err)
	}

	tool := mustFirstTool(t, payload)
	if _, ok := tool["filters"]; ok {
		t.Fatalf("did not expect filters in web_search payload when feature flag is disabled, got %#v", tool["filters"])
	}
}

func TestBuildResponsesPayload_WebSearchAllowedDomainsFilterEnabled(t *testing.T) {
	client := &OpenAIClient{
		cfg: Config{
			Model:                               "gpt-test",
			AllowedDomains:                      []string{" HTTPS://Example.com ", "sub.test.org:443/path", "example.com"},
			EnableWebSearchAllowedDomainsFilter: true,
		},
	}

	payload, err := client.buildResponsesPayload("", "test prompt", CallOptions{
		WebSearch: true,
	})
	if err != nil {
		t.Fatalf("buildResponsesPayload failed: %v", err)
	}

	tool := mustFirstTool(t, payload)
	filters, ok := tool["filters"].(map[string]any)
	if !ok {
		t.Fatalf("expected filters object in web_search payload, got %#v", tool["filters"])
	}
	domains, ok := filters["allowed_domains"].([]any)
	if !ok {
		t.Fatalf("expected allowed_domains array, got %#v", filters["allowed_domains"])
	}
	if len(domains) != 2 {
		t.Fatalf("expected 2 normalized domains, got %#v", domains)
	}
	if domains[0] != "example.com" || domains[1] != "sub.test.org" {
		t.Fatalf("unexpected allowed_domains: %#v", domains)
	}
}

func TestBuildResponsesPayload_WebSearchAllowedDomainsFilterEnabledWithoutDomains(t *testing.T) {
	client := &OpenAIClient{
		cfg: Config{
			Model:                               "gpt-test",
			EnableWebSearchAllowedDomainsFilter: true,
		},
	}

	payload, err := client.buildResponsesPayload("", "test prompt", CallOptions{
		WebSearch: true,
	})
	if err != nil {
		t.Fatalf("buildResponsesPayload failed: %v", err)
	}

	tool := mustFirstTool(t, payload)
	if _, ok := tool["filters"]; ok {
		t.Fatalf("did not expect filters when allowlist is empty, got %#v", tool["filters"])
	}
}

func TestLoadConfig_WebSearchAllowedDomainsFilterToggle(t *testing.T) {
	t.Setenv("COSEARCH_API_KEY", "test-key")
	t.Setenv("COSEARCH_WEB_SEARCH_ALLOWED_DOMAINS_FILTER", "")

	cfg, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}
	if cfg.EnableWebSearchAllowedDomainsFilter {
		t.Fatalf("expected feature flag disabled by default")
	}

	t.Setenv("COSEARCH_WEB_SEARCH_ALLOWED_DOMAINS_FILTER", "true")
	cfg, err = LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed after enabling flag: %v", err)
	}
	if !cfg.EnableWebSearchAllowedDomainsFilter {
		t.Fatalf("expected feature flag enabled when env is true")
	}
}

func mustFirstTool(t *testing.T, payload []byte) map[string]any {
	t.Helper()
	var decoded map[string]any
	if err := json.Unmarshal(payload, &decoded); err != nil {
		t.Fatalf("json.Unmarshal payload failed: %v", err)
	}
	tools, ok := decoded["tools"].([]any)
	if !ok || len(tools) == 0 {
		t.Fatalf("expected non-empty tools array, got %#v", decoded["tools"])
	}
	tool, ok := tools[0].(map[string]any)
	if !ok {
		t.Fatalf("expected tool object, got %#v", tools[0])
	}
	return tool
}
