package cosearch

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	BaseURL                             string
	APIKey                              string
	Model                               string
	Proxy                               string
	Format                              string // "responses" or "completions"
	Concurrency                         int    // override mode concurrency (0 = use default)
	TimeoutLite                         time.Duration
	TimeoutStd                          time.Duration
	TimeoutDeep                         time.Duration
	WorkspaceDir                        string
	AllowedDomains                      []string
	EnableWebSearchAllowedDomainsFilter bool // default false; when true, pass allowlist to web_search tool payload
}

func LoadConfig() (Config, error) {
	baseURL := strings.TrimSpace(os.Getenv("COSEARCH_BASE_URL"))
	if baseURL == "" {
		baseURL = "https://api.openai.com/v1/responses"
	}

	apiKey := strings.TrimSpace(os.Getenv("COSEARCH_API_KEY"))
	if apiKey == "" {
		apiKey = strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
	}

	model := strings.TrimSpace(os.Getenv("COSEARCH_MODEL"))
	if model == "" {
		model = "gpt-5.2"
	}

	proxy := strings.TrimSpace(os.Getenv("HTTP_PROXY"))

	apiFormat := strings.ToLower(strings.TrimSpace(os.Getenv("COSEARCH_API_FORMAT")))
	if apiFormat != "completions" {
		apiFormat = "responses"
	}

	workspace := strings.TrimSpace(os.Getenv("COSEARCH_WORKSPACE_DIR"))
	if workspace == "" {
		workspace = "workspace"
	}

	var domains []string
	if d := strings.TrimSpace(os.Getenv("COSEARCH_ALLOWED_DOMAINS")); d != "" {
		for _, s := range strings.Split(d, ",") {
			s = strings.TrimSpace(s)
			if s != "" {
				domains = append(domains, s)
			}
		}
	}
	domains = normalizeAllowedDomains(domains)

	cfg := Config{
		BaseURL:                             baseURL,
		APIKey:                              apiKey,
		Model:                               model,
		Proxy:                               proxy,
		Format:                              apiFormat,
		Concurrency:                         envInt("COSEARCH_CONCURRENCY", 0),
		TimeoutLite:                         envDuration("COSEARCH_TIMEOUT_LITE", 0),
		TimeoutStd:                          envDuration("COSEARCH_TIMEOUT_STANDARD", 0),
		TimeoutDeep:                         envDuration("COSEARCH_TIMEOUT_DEEP", 0),
		WorkspaceDir:                        workspace,
		AllowedDomains:                      domains,
		EnableWebSearchAllowedDomainsFilter: envBool("COSEARCH_WEB_SEARCH_ALLOWED_DOMAINS_FILTER", false),
	}

	if cfg.APIKey == "" {
		return Config{}, fmt.Errorf("缺少 API Key，请设置 COSEARCH_API_KEY 或 OPENAI_API_KEY")
	}
	return cfg, nil
}

// WorkspaceBase returns the configured workspace directory.
// Uses COSEARCH_WORKSPACE_DIR env var, defaults to "workspace".
func WorkspaceBase() string {
	if dir := strings.TrimSpace(os.Getenv("COSEARCH_WORKSPACE_DIR")); dir != "" {
		return dir
	}
	return "workspace"
}
func envInt(key string, fallback int) int {
	s := strings.TrimSpace(os.Getenv(key))
	if s == "" {
		return fallback
	}
	v, err := strconv.Atoi(s)
	if err != nil || v <= 0 {
		return fallback
	}
	return v
}

// envDuration reads a duration in seconds from env, returns fallback if unset.
func envDuration(key string, fallback time.Duration) time.Duration {
	s := strings.TrimSpace(os.Getenv(key))
	if s == "" {
		return fallback
	}
	v, err := strconv.Atoi(s)
	if err != nil || v <= 0 {
		return fallback
	}
	return time.Duration(v) * time.Second
}

func envBool(key string, fallback bool) bool {
	s := strings.TrimSpace(strings.ToLower(os.Getenv(key)))
	if s == "" {
		return fallback
	}
	switch s {
	case "1", "true", "t", "yes", "y", "on":
		return true
	case "0", "false", "f", "no", "n", "off":
		return false
	default:
		return fallback
	}
}
