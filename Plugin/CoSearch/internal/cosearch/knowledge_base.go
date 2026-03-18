package cosearch

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// KBNote represents a single knowledge note for a sub-question.
type KBNote struct {
	DimID    string
	SQIndex  int
	Question string
	Content  string
	Sources  []string
	Round    int
}

// GapQuestion represents an uncovered sub-question.
type GapQuestion struct {
	DimID    string
	SQIndex  int
	Question string
}

// KnowledgeBase manages the structured KB directory for Deep mode.
//
// Directory layout:
//
//	{root}/
//	├── index.md
//	├── knowledge_base/
//	│   ├── d1-sq1.md
//	│   └── ...
//	└── sources/
//	    └── sources.md
type KnowledgeBase struct {
	root        string
	topic       string
	plan        []planItem // flattened sub-questions
	covered     map[string]bool
	sourcesSeen map[string]bool
	sourceList  []string
}

type planItem struct {
	dimID    string
	dimName  string
	sqIndex  int
	question string
}

func noteKey(dimID string, sqIndex int) string {
	return fmt.Sprintf("%s-sq%d", dimID, sqIndex)
}

func noteFilename(dimID string, sqIndex int) string {
	return noteKey(dimID, sqIndex) + ".md"
}

// NewKnowledgeBase creates the KB directory structure from an EnrichedQuery.
// Returns an error if directory creation fails.
func NewKnowledgeBase(topic string, eq *EnrichedQuery) (*KnowledgeBase, error) {
	day := time.Now().Format("2006-01-02")
	root := filepath.Join(WorkspaceBase(), day, "kb")

	for _, sub := range []string{"", "knowledge_base", "sources"} {
		if err := os.MkdirAll(filepath.Join(root, sub), 0o755); err != nil {
			return nil, fmt.Errorf("create KB dir: %w", err)
		}
	}

	var plan []planItem
	for _, dim := range eq.Dimensions {
		for i, q := range dim.SubQuestions {
			plan = append(plan, planItem{
				dimID:    dim.ID,
				dimName:  dim.Name,
				sqIndex:  i + 1,
				question: q,
			})
		}
	}

	kb := &KnowledgeBase{
		root:        root,
		topic:       topic,
		plan:        plan,
		covered:     make(map[string]bool, len(plan)),
		sourcesSeen: make(map[string]bool),
	}

	if err := kb.WriteIndex(); err != nil {
		return nil, err
	}
	return kb, nil
}

// Dir returns the KB root directory path.
func (kb *KnowledgeBase) Dir() string {
	return kb.root
}

// WriteNote persists a knowledge note and marks the sub-question as covered.
func (kb *KnowledgeBase) WriteNote(note KBNote) error {
	var b strings.Builder
	b.WriteString(fmt.Sprintf("# %s\n\n", note.Question))
	b.WriteString(fmt.Sprintf("- dimension: %s\n", note.DimID))
	b.WriteString(fmt.Sprintf("- round: %d\n\n", note.Round))
	b.WriteString(note.Content)
	b.WriteString("\n")

	if len(note.Sources) > 0 {
		b.WriteString("\n## Sources\n\n")
		for _, src := range note.Sources {
			b.WriteString(fmt.Sprintf("- %s\n", src))
		}
	}

	path := filepath.Join(kb.root, "knowledge_base", noteFilename(note.DimID, note.SQIndex))
	if err := os.WriteFile(path, []byte(b.String()), 0o644); err != nil {
		return fmt.Errorf("write note %s: %w", path, err)
	}

	kb.covered[noteKey(note.DimID, note.SQIndex)] = true
	kb.AddSources(note.Sources)
	return nil
}

// ReadNote reads a single note file from disk.
func (kb *KnowledgeBase) ReadNote(dimID string, sqIndex int) (string, error) {
	path := filepath.Join(kb.root, "knowledge_base", noteFilename(dimID, sqIndex))
	data, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// ReadAllNotes reads all note files sorted by dimension and sub-question index.
func (kb *KnowledgeBase) ReadAllNotes() ([]KBNote, error) {
	var notes []KBNote
	for _, p := range kb.plan {
		key := noteKey(p.dimID, p.sqIndex)
		if !kb.covered[key] {
			continue
		}
		content, err := kb.ReadNote(p.dimID, p.sqIndex)
		if err != nil {
			continue
		}
		notes = append(notes, KBNote{
			DimID:    p.dimID,
			SQIndex:  p.sqIndex,
			Question: p.question,
			Content:  content,
		})
	}
	return notes, nil
}

// AddSources accumulates unique source URLs.
func (kb *KnowledgeBase) AddSources(urls []string) {
	for _, u := range urls {
		u = strings.TrimSpace(u)
		if u == "" || kb.sourcesSeen[u] {
			continue
		}
		kb.sourcesSeen[u] = true
		kb.sourceList = append(kb.sourceList, u)
	}
}

// WriteSources persists the deduplicated source list.
func (kb *KnowledgeBase) WriteSources() error {
	var b strings.Builder
	b.WriteString("# Sources\n\n")
	for i, src := range kb.sourceList {
		b.WriteString(fmt.Sprintf("%d. %s\n", i+1, src))
	}
	path := filepath.Join(kb.root, "sources", "sources.md")
	return os.WriteFile(path, []byte(b.String()), 0o644)
}

// TotalQuestions returns the total number of sub-questions in the plan.
func (kb *KnowledgeBase) TotalQuestions() int {
	return len(kb.plan)
}

// CoveredCount returns the number of covered sub-questions.
func (kb *KnowledgeBase) CoveredCount() int {
	return len(kb.covered)
}

// Coverage returns TC = covered / total. Returns 1.0 if plan is empty.
func (kb *KnowledgeBase) Coverage() float64 {
	if len(kb.plan) == 0 {
		return 1.0
	}
	return float64(len(kb.covered)) / float64(len(kb.plan))
}

// Gaps returns uncovered sub-questions for gap-driven searching.
func (kb *KnowledgeBase) Gaps() []GapQuestion {
	var gaps []GapQuestion
	for _, p := range kb.plan {
		if !kb.covered[noteKey(p.dimID, p.sqIndex)] {
			gaps = append(gaps, GapQuestion{
				DimID:    p.dimID,
				SQIndex:  p.sqIndex,
				Question: p.question,
			})
		}
	}
	return gaps
}

// WriteIndex writes/updates the index.md with plan status.
func (kb *KnowledgeBase) WriteIndex() error {
	var b strings.Builder
	b.WriteString(fmt.Sprintf("# Knowledge Base: %s\n\n", kb.topic))
	b.WriteString(fmt.Sprintf("- created: %s\n", time.Now().Format(time.RFC3339)))
	b.WriteString(fmt.Sprintf("- coverage: %.1f%% (%d/%d)\n\n",
		kb.Coverage()*100, kb.CoveredCount(), kb.TotalQuestions()))

	b.WriteString("## Sub-Questions\n\n")

	// Group by dimension
	dimOrder := make([]string, 0)
	dimMap := make(map[string][]planItem)
	for _, p := range kb.plan {
		if _, ok := dimMap[p.dimID]; !ok {
			dimOrder = append(dimOrder, p.dimID)
		}
		dimMap[p.dimID] = append(dimMap[p.dimID], p)
	}
	sort.Strings(dimOrder)

	for _, dimID := range dimOrder {
		items := dimMap[dimID]
		if len(items) > 0 {
			b.WriteString(fmt.Sprintf("### %s — %s\n\n", dimID, items[0].dimName))
		}
		for _, p := range items {
			key := noteKey(p.dimID, p.sqIndex)
			status := "[ ]"
			if kb.covered[key] {
				status = "[x]"
			}
			b.WriteString(fmt.Sprintf("- %s %s (`%s`)\n", status, p.question, noteFilename(p.dimID, p.sqIndex)))
		}
		b.WriteString("\n")
	}

	path := filepath.Join(kb.root, "index.md")
	return os.WriteFile(path, []byte(b.String()), 0o644)
}

// Sources returns the current deduplicated source list.
func (kb *KnowledgeBase) Sources() []string {
	return kb.sourceList
}
