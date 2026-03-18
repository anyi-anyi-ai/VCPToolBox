package cosearch

import (
	"fmt"
	"strings"
	"time"
)

const (
	modeLite     = "lite"
	modeStandard = "standard"
	modeDeep     = "deep"
)

// ResolveMode returns the mode profile, applying config overrides if set.
func ResolveMode(mode string) (ModeProfile, error) {
	return ResolveModeWithConfig(mode, Config{})
}

// ResolveModeWithConfig returns the mode profile with env var overrides from Config.
func ResolveModeWithConfig(mode string, cfg Config) (ModeProfile, error) {
	m := strings.ToLower(strings.TrimSpace(mode))
	if m == "" {
		m = modeStandard
	}

	var profile ModeProfile
	switch m {
	case modeLite:
		profile = ModeProfile{
			Name:              modeLite,
			Concurrency:       2,
			MaxRounds:         1,
			Timeout:           90 * time.Second,
			SearchContextSize: "low",
		}
		if cfg.TimeoutLite > 0 {
			profile.Timeout = cfg.TimeoutLite
		}
	case modeStandard:
		profile = ModeProfile{
			Name:              modeStandard,
			Concurrency:       3,
			MaxRounds:         2,
			Timeout:           75 * time.Second,
			SearchContextSize: "medium",
		}
		if cfg.TimeoutStd > 0 {
			profile.Timeout = cfg.TimeoutStd
		}
	case modeDeep:
		profile = ModeProfile{
			Name:              modeDeep,
			Concurrency:       4,
			MaxRounds:         10,
			Timeout:           150 * time.Second,
			SearchContextSize: "high",
		}
		if cfg.TimeoutDeep > 0 {
			profile.Timeout = cfg.TimeoutDeep
		}
	default:
		return ModeProfile{}, fmt.Errorf("invalid mode: %s", mode)
	}

	// Global concurrency override
	if cfg.Concurrency > 0 {
		profile.Concurrency = cfg.Concurrency
	}

	return profile, nil
}
