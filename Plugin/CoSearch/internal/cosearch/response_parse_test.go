package cosearch

import "testing"

func TestParseResponsePayload_MessageAndCitations(t *testing.T) {
	payload := []byte(`{
	  "output": [
	    {
	      "type": "message",
	      "content": [
	        {
	          "type": "output_text",
	          "text": "核心结论A",
	          "annotations": [
	            {"type": "url_citation", "title": "S1", "url": "https://example.com/1"},
	            {"type": "url_citation", "title": "S1", "url": "https://example.com/1"}
	          ]
	        }
	      ]
	    }
	  ]
	}`)
	text, citations, err := ParseResponsePayload(payload)
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if text != "核心结论A" {
		t.Fatalf("unexpected text: %s", text)
	}
	if len(citations) != 1 {
		t.Fatalf("expected 1 citation, got %d", len(citations))
	}
}

func TestParseResponsePayload_OutputTextShortcut(t *testing.T) {
	payload := []byte(`{"output_text":"hello"}`)
	text, citations, err := ParseResponsePayload(payload)
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if text != "hello" || len(citations) != 0 {
		t.Fatalf("unexpected parse result: %s %#v", text, citations)
	}
}
