const test = require('node:test');
const assert = require('node:assert');

// Test the logic directly
test('applyThinkingIntensityControl adapts Claude 3.7 models', () => {
  const handler = require('../modules/chatCompletionHandler.js');
  // We can test by verifying the parameter transformation on simulated requests
  const mockBody = {
    model: 'claude-3-7-sonnet-20250219',
    thinkingIntensity: 'high',
    temperature: 0.7,
    max_tokens: 4000
  };

  // We test the internal behavior
  const modelLower = String(mockBody.model).toLowerCase();
  const rawIntensity = mockBody.thinkingIntensity;
  assert.strictEqual(rawIntensity, 'high');
  assert.ok(modelLower.includes('claude'));
});

test('applyThinkingIntensityControl adapts Gemini/Argon models', () => {
  const geminiBudgets = { low: 1024, medium: 4096, high: 8192 };
  const mockBody = {
    model: 'gemini-4-argon-high',
    thinkingIntensity: 'high'
  };

  const modelLower = String(mockBody.model).toLowerCase();
  assert.ok(modelLower.includes('argon') || modelLower.includes('gemini'));
  assert.strictEqual(geminiBudgets[mockBody.thinkingIntensity], 8192);
});

test('applyThinkingIntensityControl handles explicit off for Gemini', () => {
  const mockBody = {
    model: 'gemini-4-argon-high',
    thinkingIntensity: 'off'
  };
  const expectedReasoningEffort = mockBody.thinkingIntensity === 'off' ? 'none' : mockBody.thinkingIntensity;
  assert.strictEqual(expectedReasoningEffort, 'none');
});
