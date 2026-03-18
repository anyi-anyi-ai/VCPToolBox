package cosearch

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strings"
)

func ParseResponsePayload(payload []byte) (string, []Citation, error) {
	trimmed := bytes.TrimSpace(payload)
	if len(trimmed) == 0 {
		return "", nil, fmt.Errorf("响应为空")
	}
	if looksLikeSSE(trimmed) {
		return parseSSEPayload(trimmed)
	}
	return parseJSONPayload(trimmed)
}

func looksLikeSSE(payload []byte) bool {
	if bytes.HasPrefix(payload, []byte("event:")) {
		return true
	}
	if bytes.Contains(payload, []byte("\nevent:")) {
		return true
	}
	return false
}

func parseSSEPayload(payload []byte) (string, []Citation, error) {
	lines := strings.Split(string(payload), "\n")
	var deltas strings.Builder

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		dataText := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if dataText == "" || dataText == "[DONE]" {
			continue
		}

		var event map[string]any
		if err := json.Unmarshal([]byte(dataText), &event); err != nil {
			continue
		}
		eventType, _ := event["type"].(string)

		switch eventType {
		case "response.output_text.delta":
			delta, _ := event["delta"].(string)
			deltas.WriteString(delta)
		case "response.completed":
			responseObj, ok := event["response"].(map[string]any)
			if !ok {
				continue
			}
			responseBytes, err := json.Marshal(responseObj)
			if err != nil {
				continue
			}
			text, citations, err := parseJSONPayload(responseBytes)
			if err == nil && strings.TrimSpace(text) != "" {
				return text, citations, nil
			}
		}
	}

	if strings.TrimSpace(deltas.String()) != "" {
		return strings.TrimSpace(deltas.String()), nil, nil
	}
	return "", nil, fmt.Errorf("SSE 响应中未找到可用文本")
}

func parseJSONPayload(payload []byte) (string, []Citation, error) {
	var data map[string]any
	if err := json.Unmarshal(payload, &data); err != nil {
		return "", nil, fmt.Errorf("解析响应失败: %w", err)
	}

	if text, ok := data["output_text"].(string); ok && strings.TrimSpace(text) != "" {
		return strings.TrimSpace(text), nil, nil
	}

	textParts := make([]string, 0)
	citations := make([]Citation, 0)
	seenURL := map[string]struct{}{}

	outputItems, _ := data["output"].([]any)
	for _, item := range outputItems {
		itemMap, ok := item.(map[string]any)
		if !ok {
			continue
		}
		if itemMap["type"] != "message" {
			continue
		}
		contents, _ := itemMap["content"].([]any)
		for _, content := range contents {
			contentMap, ok := content.(map[string]any)
			if !ok {
				continue
			}
			if contentMap["type"] != "output_text" {
				continue
			}
			if text, ok := contentMap["text"].(string); ok && strings.TrimSpace(text) != "" {
				textParts = append(textParts, strings.TrimSpace(text))
			}
			annotations, _ := contentMap["annotations"].([]any)
			for _, ann := range annotations {
				annMap, ok := ann.(map[string]any)
				if !ok || annMap["type"] != "url_citation" {
					continue
				}
				url, _ := annMap["url"].(string)
				title, _ := annMap["title"].(string)
				if url == "" {
					continue
				}
				if _, exists := seenURL[url]; exists {
					continue
				}
				seenURL[url] = struct{}{}
				citations = append(citations, Citation{Title: title, URL: url})
			}
		}
	}

	if len(textParts) > 0 {
		return strings.Join(textParts, "\n\n"), citations, nil
	}

	if choices, ok := data["choices"].([]any); ok && len(choices) > 0 {
		if first, ok := choices[0].(map[string]any); ok {
			if msg, ok := first["message"].(map[string]any); ok {
				if content, ok := msg["content"].(string); ok && strings.TrimSpace(content) != "" {
					return strings.TrimSpace(content), citations, nil
				}
			}
		}
	}

	return "", nil, fmt.Errorf("响应中未找到可用文本")
}
