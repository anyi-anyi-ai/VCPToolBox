package cosearch

import "testing"

func TestResolveModeDefault(t *testing.T) {
	m, err := ResolveMode("")
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if m.Name != "standard" {
		t.Fatalf("unexpected mode: %s", m.Name)
	}
}

func TestResolveModeInvalid(t *testing.T) {
	if _, err := ResolveMode("unknown"); err == nil {
		t.Fatal("expected error")
	}
}
