package cosearch

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func writeReportArtifacts(report Report, layers ReportLayer) (string, string, error) {
	trace := resolveRuntimeTrace()
	dir := trace.artifactDir(WorkspaceBase())
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", "", err
	}

	mdPath := filepath.Join(dir, "CoSearchReport.md")
	jsonPath := filepath.Join(dir, "CoSearchReport.json")

	mdContent := renderReportMarkdown(report, layers)
	if err := writeFileAtomically(mdPath, []byte(mdContent), 0o644); err != nil {
		return "", "", err
	}

	jsonBody, err := json.MarshalIndent(report, "", "  ")
	if err != nil {
		return "", "", err
	}
	if err := writeFileAtomically(jsonPath, jsonBody, 0o644); err != nil {
		return "", "", err
	}

	return mdPath, jsonPath, nil
}

func renderReportMarkdown(report Report, layers ReportLayer) string {
	var b strings.Builder
	b.WriteString("# CoSearch 检索报告\n\n")
	b.WriteString(fmt.Sprintf("- 主题: %s\n", report.Topic))
	b.WriteString(fmt.Sprintf("- 模式: %s\n", report.Mode))
	b.WriteString(fmt.Sprintf("- 轮次: %d\n", report.Rounds))
	b.WriteString(fmt.Sprintf("- 停止原因: %s\n\n", report.Stopped))

	b.WriteString(layers.L1Conclusion)
	b.WriteString("\n")
	b.WriteString(layers.L2Signals)
	b.WriteString("\n")
	if strings.TrimSpace(layers.L3Evidence) != "" {
		b.WriteString(layers.L3Evidence)
		b.WriteString("\n")
	}
	b.WriteString(layers.L4Trace)
	b.WriteString("\n")

	b.WriteString("## 条目明细\n\n")
	for _, item := range report.Items {
		b.WriteString(fmt.Sprintf("### %s\n", item.Keyword))
		if item.Failed {
			b.WriteString(fmt.Sprintf("- 状态: 失败\n- 错误: %s\n\n", item.Error))
			continue
		}
		b.WriteString(fmt.Sprintf("- 分级: %s\n", item.SignalGrade))
		b.WriteString(fmt.Sprintf("- F1/F2/F3: %t/%t/%t\n", item.F1Behavior, item.F2Survival72h, item.F3Morphism))
		if item.Why != "" {
			b.WriteString(fmt.Sprintf("- 理由: %s\n", item.Why))
		}
		if len(item.Sources) > 0 {
			b.WriteString("- 来源:\n")
			for _, src := range item.Sources {
				b.WriteString(fmt.Sprintf("  - %s\n", src))
			}
		}
		b.WriteString("\n")
	}

	return b.String()
}
