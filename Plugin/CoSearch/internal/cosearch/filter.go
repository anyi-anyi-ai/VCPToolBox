package cosearch

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"
)

type SignalAssessment struct {
	F1  bool
	F2  bool
	F3  bool
	Why []string
}

func (a SignalAssessment) Grade() string {
	score := 0
	if a.F1 {
		score++
	}
	if a.F2 {
		score++
	}
	if a.F3 {
		score++
	}
	switch score {
	case 3:
		return "S1"
	case 2:
		return "S2"
	case 1:
		return "S3"
	default:
		return "N"
	}
}

func AssessSignal(summary string, sources []string) SignalAssessment {
	text := strings.TrimSpace(summary)
	lower := strings.ToLower(text)
	validEvidence := normalizeSourceURLsWithAllowedDomains(sources, allowedDomainsFromEnv())
	hasCitation := len(validEvidence) > 0

	f1 := hasCitation && hasAny(lower,
		"建议", "应", "需要", "必须", "行动", "迁移", "升级", "弃用", "发布", "变更",
		"should", "must", "recommend", "action", "migrate", "deprecate", "release", "breaking",
	)

	f2 := hasCitation && hasAny(lower,
		"今日", "本周", "最近", "更新", "最新", "发布时间", "2026", "2025",
		"today", "this week", "recent", "updated", "latest", "released", "2026", "2025",
	)

	f3 := len([]rune(text)) >= 120 && hasAny(lower,
		"趋势", "模式", "原则", "框架", "路线", "权衡", "因果", "范式",
		"trend", "pattern", "principle", "framework", "tradeoff", "causal", "paradigm",
	)

	reasons := make([]string, 0, 4)
	if f1 {
		reasons = append(reasons, "F1通过：包含可执行变化信号")
	}
	if f2 {
		reasons = append(reasons, "F2通过：包含近期可持续价值信号")
	}
	if f3 {
		reasons = append(reasons, "F3通过：包含可迁移方法/态射信号")
	}
	if len(reasons) == 0 {
		reasons = append(reasons, "三问过滤未通过，降为噪声或观察项")
	}

	assessment := SignalAssessment{F1: f1, F2: f2, F3: f3, Why: reasons}
	return applyEvidenceURLGate(assessment, validEvidence)
}

func normalizeCitationURLs(citations []Citation) []string {
	return normalizeCitationURLsWithAllowedDomains(citations, allowedDomainsFromEnv())
}

func hasAny(text string, keywords ...string) bool {
	for _, keyword := range keywords {
		if strings.Contains(text, keyword) {
			return true
		}
	}
	return false
}

// --- LLM-based Signal Assessment ---

// SignalItem represents one item to be assessed by LLM.
type SignalItem struct {
	Keyword string
	Summary string
	Sources []string
}

// llmSignalResult is the JSON structure returned by the LLM for one item.
type llmSignalResult struct {
	ID    int    `json:"id"`
	F1    bool   `json:"f1"`
	F2    bool   `json:"f2"`
	F3    bool   `json:"f3"`
	WhyF1 string `json:"why_f1"`
	WhyF2 string `json:"why_f2"`
	WhyF3 string `json:"why_f3"`
}

const signalAssessSystemPrompt = `你是信号质量评估专家。对每条搜索结果严格判断三个维度：

F1（行为变化信号）：内容是否包含需要读者改变决策或采取行动的可执行信息？
  - 通过示例："建议立即升级到v3"、"该API将于下月弃用"、"团队需要重新评估技术栈"
  - 不通过示例："这个建议已被证明无效"、纯描述性内容、历史回顾

F2（72h存活信号）：该信息在72小时后是否仍然有效和有价值？
  - 通过示例：技术趋势分析、方法论总结、架构设计原则
  - 不通过示例：实时新闻标题、临时公告、已过时的版本信息

F3（可迁移态射信号）：内容是否包含可迁移到其他领域的方法论、模式或框架？
  - 通过示例："这种分布式一致性模式可用于任何状态同步场景"
  - 不通过示例：仅适用于特定产品的操作指南、纯数据罗列

注意：
- 要看语义，不要看关键词。"这个建议不靠谱" 中虽包含 "建议" 但 F1 应为 false
- 因果推理、深层分析即使不含特定词汇，也可能满足 F3
- 每个维度的理由字段(why_f1/why_f2/why_f3)必须给出具体判断依据，不能只写"通过"或"不通过"
- 严格返回 JSON 数组，不要添加任何其他文字`

// AssessSignalsLLM uses LLM to assess F1/F2/F3 for a batch of items.
// Items are split into sub-batches of batchSize and executed concurrently.
// On LLM failure, individual batches fall back to keyword matching.
func AssessSignalsLLM(ctx context.Context, client *OpenAIClient, items []SignalItem, batchSize, concurrency int) map[string]SignalAssessment {
	if len(items) == 0 {
		return make(map[string]SignalAssessment)
	}

	// Fallback to keyword matching if no client available
	if client == nil {
		results := make(map[string]SignalAssessment, len(items))
		for _, item := range items {
			results[item.Keyword] = AssessSignal(item.Summary, item.Sources)
		}
		return results
	}

	if batchSize <= 0 {
		batchSize = 3
	}
	if concurrency <= 0 {
		concurrency = 2
	}

	// Split into sub-batches
	var batches [][]SignalItem
	for i := 0; i < len(items); i += batchSize {
		end := i + batchSize
		if end > len(items) {
			end = len(items)
		}
		batches = append(batches, items[i:end])
	}

	results := make(map[string]SignalAssessment, len(items))
	var mu sync.Mutex
	var wg sync.WaitGroup
	sem := make(chan struct{}, concurrency)

	for _, batch := range batches {
		batch := batch
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			assessments := assessBatchLLM(ctx, client, batch)
			mu.Lock()
			for k, v := range assessments {
				results[k] = v
			}
			mu.Unlock()
		}()
	}

	wg.Wait()
	return results
}

// assessBatchLLM calls LLM for one sub-batch. Falls back to keyword matching on failure.
func assessBatchLLM(ctx context.Context, client *OpenAIClient, batch []SignalItem) map[string]SignalAssessment {
	results := make(map[string]SignalAssessment, len(batch))

	// Build prompt
	var b strings.Builder
	for i, item := range batch {
		snippet := item.Summary
		if len([]rune(snippet)) > 300 {
			snippet = string([]rune(snippet)[:300]) + "..."
		}
		b.WriteString(fmt.Sprintf("[%d] 关键词: %s\n摘要: %s\n\n", i+1, item.Keyword, snippet))
	}
	b.WriteString(fmt.Sprintf("请返回严格 JSON 数组（%d 个元素）:\n", len(batch)))
	b.WriteString(`[{"id":1,"f1":true,"f2":false,"f3":true,"why_f1":"给出明确选型建议","why_f2":"临时公告，时效短","why_f3":"评估方法可迁移到其它选型"}]`)

	// Call LLM with timeout (60s to accommodate large Deep mode batches)
	callCtx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	text, _, err := client.Call(callCtx, signalAssessSystemPrompt, b.String(), CallOptions{})
	if err != nil {
		// Fallback: keyword matching for entire batch
		for _, item := range batch {
			results[item.Keyword] = AssessSignal(item.Summary, item.Sources)
		}
		return results
	}

	// Parse LLM response
	parsed := parseLLMSignalResponse(text, len(batch))
	if parsed == nil {
		// Parse failed: fallback
		for _, item := range batch {
			results[item.Keyword] = AssessSignal(item.Summary, item.Sources)
		}
		return results
	}

	for _, r := range parsed {
		idx := r.ID - 1
		if idx < 0 || idx >= len(batch) {
			continue
		}
		item := batch[idx]
		reasons := make([]string, 0, 4)
		if r.F1 {
			reasons = append(reasons, "F1通过："+fallbackReason(r.WhyF1, "包含可执行变化信号"))
		}
		if r.F2 {
			reasons = append(reasons, "F2通过："+fallbackReason(r.WhyF2, "72h内仍有效"))
		}
		if r.F3 {
			reasons = append(reasons, "F3通过："+fallbackReason(r.WhyF3, "可迁移到其它领域"))
		}
		if len(reasons) == 0 {
			why := coalesce(r.WhyF1, r.WhyF2, r.WhyF3)
			if why == "" {
				why = "三问均未通过"
			}
			reasons = append(reasons, "LLM判断："+why)
		}
		results[item.Keyword] = SignalAssessment{
			F1:  r.F1,
			F2:  r.F2,
			F3:  r.F3,
			Why: reasons,
		}
		evidenceURLs := normalizeSourceURLsWithAllowedDomains(item.Sources, allowedDomainsFromEnv())
		results[item.Keyword] = applyEvidenceURLGate(results[item.Keyword], evidenceURLs)
	}

	// Fill any missing items with keyword fallback
	for _, item := range batch {
		if _, ok := results[item.Keyword]; !ok {
			results[item.Keyword] = AssessSignal(item.Summary, item.Sources)
		}
	}

	return results
}

// parseLLMSignalResponse extracts the JSON array from LLM response text.
func parseLLMSignalResponse(text string, expected int) []llmSignalResult {
	text = strings.TrimSpace(text)

	// Find JSON array in response (LLM may wrap with markdown code block)
	start := strings.Index(text, "[")
	end := strings.LastIndex(text, "]")
	if start < 0 || end < 0 || end <= start {
		return nil
	}
	jsonStr := text[start : end+1]

	var results []llmSignalResult
	if err := json.Unmarshal([]byte(jsonStr), &results); err != nil {
		return nil
	}

	return results
}

// fallbackReason returns reason if non-empty, otherwise returns the fallback.
func fallbackReason(reason, fallback string) string {
	if r := strings.TrimSpace(reason); r != "" {
		return r
	}
	return fallback
}

// coalesce returns the first non-empty string.
func coalesce(ss ...string) string {
	for _, s := range ss {
		if strings.TrimSpace(s) != "" {
			return strings.TrimSpace(s)
		}
	}
	return ""
}
