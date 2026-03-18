package cosearch

import (
	"net"
	"net/url"
	"os"
	"regexp"
	"strings"
)

var inlineURLPattern = regexp.MustCompile(`https?://[^\s<>"\]\)]+`)

// normalizeAllowedDomains canonicalizes domain allowlist entries and removes duplicates.
func normalizeAllowedDomains(domains []string) []string {
	seen := make(map[string]struct{}, len(domains))
	out := make([]string, 0, len(domains))
	for _, raw := range domains {
		domain := normalizeAllowedDomain(raw)
		if domain == "" {
			continue
		}
		if _, ok := seen[domain]; ok {
			continue
		}
		seen[domain] = struct{}{}
		out = append(out, domain)
	}
	return out
}

func normalizeAllowedDomain(raw string) string {
	s := strings.TrimSpace(strings.ToLower(raw))
	if s == "" {
		return ""
	}
	if !strings.Contains(s, "://") {
		s = "https://" + s
	}
	u, err := url.Parse(s)
	if err != nil {
		return ""
	}
	host := normalizeHost(u.Hostname())
	if host == "" {
		return ""
	}
	return host
}

func normalizeHost(host string) string {
	host = strings.TrimSpace(strings.ToLower(host))
	host = strings.TrimSuffix(host, ".")
	if host == "" || strings.Contains(host, " ") {
		return ""
	}
	return host
}

func allowedDomainsFromEnv() []string {
	raw := strings.TrimSpace(os.Getenv("COSEARCH_ALLOWED_DOMAINS"))
	if raw == "" {
		return nil
	}
	return normalizeAllowedDomains(strings.Split(raw, ","))
}

func allowedDomainsForClient(client *OpenAIClient) []string {
	if client != nil && len(client.cfg.AllowedDomains) > 0 {
		return normalizeAllowedDomains(client.cfg.AllowedDomains)
	}
	return allowedDomainsFromEnv()
}

func hostAllowed(host string, allowedDomains []string) bool {
	host = normalizeHost(host)
	if host == "" {
		return false
	}
	if len(allowedDomains) == 0 {
		return true
	}
	for _, allowed := range allowedDomains {
		if host == allowed {
			return true
		}
		// IP allowlist only supports exact match.
		if net.ParseIP(allowed) != nil {
			continue
		}
		if strings.HasSuffix(host, "."+allowed) {
			return true
		}
	}
	return false
}

// normalizeSourceURLsWithAllowedDomains validates URLs and applies allowed-domain filtering.
func normalizeSourceURLsWithAllowedDomains(sources []string, allowedDomains []string) []string {
	allowed := normalizeAllowedDomains(allowedDomains)
	seen := map[string]struct{}{}
	urls := make([]string, 0, len(sources))
	for _, src := range sources {
		raw := strings.TrimSpace(src)
		if raw == "" {
			continue
		}
		u, err := url.Parse(raw)
		if err != nil || u.Hostname() == "" {
			continue
		}
		if u.Scheme != "http" && u.Scheme != "https" {
			continue
		}
		if !hostAllowed(u.Hostname(), allowed) {
			continue
		}
		normalized := u.String()
		if _, ok := seen[normalized]; ok {
			continue
		}
		seen[normalized] = struct{}{}
		urls = append(urls, normalized)
	}
	return urls
}

func normalizeCitationURLsWithAllowedDomains(citations []Citation, allowedDomains []string) []string {
	rawSources := make([]string, 0, len(citations))
	for _, c := range citations {
		rawSources = append(rawSources, c.URL)
	}
	return normalizeSourceURLsWithAllowedDomains(rawSources, allowedDomains)
}

func extractInlineURLs(text string, allowedDomains []string) []string {
	matches := inlineURLPattern.FindAllString(text, -1)
	return normalizeSourceURLsWithAllowedDomains(matches, allowedDomains)
}

func noteEvidenceURLs(note KBNote, allowedDomains []string) []string {
	candidates := make([]string, 0, len(note.Sources)+4)
	candidates = append(candidates, note.Sources...)
	candidates = append(candidates, extractInlineURLs(note.Content, allowedDomains)...)
	return normalizeSourceURLsWithAllowedDomains(candidates, allowedDomains)
}

func applyEvidenceURLGate(assessment SignalAssessment, evidenceURLs []string) SignalAssessment {
	if len(evidenceURLs) > 0 {
		return assessment
	}
	if assessment.F1 || assessment.F2 {
		assessment.F1 = false
		assessment.F2 = false
		assessment.Why = append(assessment.Why, "证据闸门：缺少有效URL，F1/F2已降级")
	}
	return assessment
}
