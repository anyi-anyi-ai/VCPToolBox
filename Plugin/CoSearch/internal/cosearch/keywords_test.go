package cosearch

import "testing"

func TestParseKeywordsFromString(t *testing.T) {
	got, err := ParseKeywords("a, b\n c，d")
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if len(got) != 4 {
		t.Fatalf("expected 4, got %d", len(got))
	}
}

func TestParseKeywordsFromArray(t *testing.T) {
	got, err := ParseKeywords([]any{"alpha", " beta ", "", 7})
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if len(got) != 2 || got[0] != "alpha" || got[1] != "beta" {
		t.Fatalf("unexpected keywords: %#v", got)
	}
}

func TestParseShowURL(t *testing.T) {
	cases := []struct {
		input any
		want  bool
	}{
		{true, true},
		{"true", true},
		{"1", true},
		{"false", false},
		{nil, false},
	}
	for _, c := range cases {
		if got := ParseShowURL(c.input); got != c.want {
			t.Fatalf("input=%v got=%v want=%v", c.input, got, c.want)
		}
	}
}
