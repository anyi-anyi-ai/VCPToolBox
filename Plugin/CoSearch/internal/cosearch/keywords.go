package cosearch

import (
	"fmt"
	"strings"
)

func ParseKeywords(input any) ([]string, error) {
	switch v := input.(type) {
	case string:
		return splitKeywordString(v)
	case []any:
		items := make([]string, 0, len(v))
		for _, item := range v {
			s, ok := item.(string)
			if !ok {
				continue
			}
			s = strings.TrimSpace(s)
			if s != "" {
				items = append(items, s)
			}
		}
		if len(items) == 0 {
			return nil, fmt.Errorf("未识别到有效关键词")
		}
		return uniqStrings(items), nil
	case []string:
		items := make([]string, 0, len(v))
		for _, s := range v {
			s = strings.TrimSpace(s)
			if s != "" {
				items = append(items, s)
			}
		}
		if len(items) == 0 {
			return nil, fmt.Errorf("未识别到有效关键词")
		}
		return uniqStrings(items), nil
	default:
		return nil, fmt.Errorf("Keywords 类型不支持")
	}
}

func splitKeywordString(raw string) ([]string, error) {
	normalized := strings.ReplaceAll(raw, "\\n", "\n")
	normalized = strings.ReplaceAll(normalized, "，", ",")
	parts := strings.FieldsFunc(normalized, func(r rune) bool {
		return r == ',' || r == '\n'
	})
	items := make([]string, 0, len(parts))
	for _, p := range parts {
		s := strings.TrimSpace(p)
		if s != "" {
			items = append(items, s)
		}
	}
	if len(items) == 0 {
		return nil, fmt.Errorf("未识别到有效关键词")
	}
	return uniqStrings(items), nil
}

func uniqStrings(items []string) []string {
	seen := make(map[string]struct{}, len(items))
	out := make([]string, 0, len(items))
	for _, item := range items {
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		out = append(out, item)
	}
	return out
}

func ParseShowURL(v any) bool {
	switch t := v.(type) {
	case bool:
		return t
	case string:
		s := strings.ToLower(strings.TrimSpace(t))
		return s == "true" || s == "1" || s == "yes"
	default:
		return false
	}
}
