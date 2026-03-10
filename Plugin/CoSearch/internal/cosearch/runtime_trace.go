package cosearch

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"
	"unicode"
)

type runtimeTrace struct {
	RunID       string
	RequestID   string
	RequestSlug string
	StartedAt   time.Time
}

var (
	runtimeTraceRegistry sync.Map
	runtimeTraceSeq      uint64
)

func newRuntimeTrace(requestID string, startedAt time.Time) runtimeTrace {
	normalizedRequestID := strings.TrimSpace(requestID)
	if startedAt.IsZero() {
		startedAt = time.Now().UTC()
	} else {
		startedAt = startedAt.UTC()
	}
	seq := atomic.AddUint64(&runtimeTraceSeq, 1)
	runID := fmt.Sprintf("%s-%06d", startedAt.Format("20060102T150405"), seq%1_000_000)
	return runtimeTrace{
		RunID:       runID,
		RequestID:   normalizedRequestID,
		RequestSlug: sanitizePathSegment(normalizedRequestID, 48),
		StartedAt:   startedAt,
	}
}

func (trace runtimeTrace) artifactDir(base string) string {
	day := trace.StartedAt.Format("2006-01-02")
	if strings.TrimSpace(day) == "" || day == "0001-01-01" {
		day = time.Now().UTC().Format("2006-01-02")
	}
	dir := filepath.Join(base, day, "runs", "run_"+trace.RunID)
	if trace.RequestSlug != "" {
		dir = filepath.Join(dir, "req_"+trace.RequestSlug)
	}
	return dir
}

func bindRuntimeTrace(trace runtimeTrace) func() {
	gid := currentGoroutineID()
	if gid == 0 {
		return func() {}
	}
	runtimeTraceRegistry.Store(gid, trace)
	return func() {
		runtimeTraceRegistry.Delete(gid)
	}
}

func currentRuntimeTrace() (runtimeTrace, bool) {
	gid := currentGoroutineID()
	if gid == 0 {
		return runtimeTrace{}, false
	}
	value, ok := runtimeTraceRegistry.Load(gid)
	if !ok {
		return runtimeTrace{}, false
	}
	trace, ok := value.(runtimeTrace)
	if !ok {
		return runtimeTrace{}, false
	}
	return trace, true
}

func resolveRuntimeTrace() runtimeTrace {
	if trace, ok := currentRuntimeTrace(); ok {
		return trace
	}
	return newRuntimeTrace("", time.Now())
}

func sanitizePathSegment(raw string, maxLen int) string {
	if maxLen <= 0 {
		maxLen = 32
	}
	var b strings.Builder
	lastDash := false
	for _, r := range strings.TrimSpace(strings.ToLower(raw)) {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
			lastDash = false
		case r == '-' || r == '_' || r == '.':
			if b.Len() == 0 || lastDash {
				continue
			}
			b.WriteByte('-')
			lastDash = true
		default:
			if b.Len() == 0 || lastDash {
				continue
			}
			b.WriteByte('-')
			lastDash = true
		}
		if b.Len() >= maxLen {
			break
		}
	}
	out := strings.Trim(b.String(), "-")
	if len(out) > maxLen {
		out = out[:maxLen]
	}
	return out
}

func currentGoroutineID() uint64 {
	var buf [64]byte
	n := runtime.Stack(buf[:], false)
	if n <= 0 {
		return 0
	}
	// runtime.Stack first line format: "goroutine 123 [running]:\n"
	line := string(buf[:n])
	const prefix = "goroutine "
	if !strings.HasPrefix(line, prefix) {
		return 0
	}
	line = line[len(prefix):]
	end := strings.IndexByte(line, ' ')
	if end <= 0 {
		return 0
	}
	id, err := strconv.ParseUint(line[:end], 10, 64)
	if err != nil {
		return 0
	}
	return id
}

func writeFileAtomically(path string, data []byte, perm os.FileMode) error {
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	tmp, err := os.CreateTemp(dir, "."+filepath.Base(path)+".tmp-*")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)

	if _, err := tmp.Write(data); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Chmod(perm); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return err
	}

	if dirHandle, err := os.Open(dir); err == nil {
		_ = dirHandle.Sync()
		_ = dirHandle.Close()
	}
	return nil
}
