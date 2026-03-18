package cosearch

import (
	"io"
	"log/slog"
	"os"
)

// NewLogger creates a structured logger writing to the given writer.
// Uses JSON format for machine readability.
func NewLogger(w io.Writer) *slog.Logger {
	if w == nil {
		w = os.Stderr
	}
	return slog.New(slog.NewJSONHandler(w, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}
