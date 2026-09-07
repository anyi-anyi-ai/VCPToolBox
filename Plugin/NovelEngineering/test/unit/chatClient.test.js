/**
 * @file chatClient.test.js
 * @description Comprehensive unit tests for ChatClient (Milestone 1 - R1)
 * Covers configuration fallback hierarchy, endpoint normalization, key masking,
 * mock chat completion, JSON extraction with code fence stripping, error handling,
 * retry backoff, and timeout behavior.
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ChatClient = require('../../src/llm/ChatClient');
const { NovelError } = require('../../src/errors');

describe('Milestone 1: ChatClient Infrastructure (R1)', () => {
  let originalEnv;

  beforeEach(() => {
    // Snapshot environment variables before each test
    originalEnv = { ...process.env };
    delete process.env.LLM_API_KEY;
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_MODEL;
    delete process.env.LLM_TIMEOUT;
    delete process.env.LLM_MAX_RETRIES;
    delete process.env.LLM_BACKOFF_BASE_MS;
    delete process.env.EMBEDDING_API_KEY;
    delete process.env.EMBEDDING_BASE_URL;
    delete process.env.EMBEDDING_MODEL;
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  // ============================================================================
  // Suite 1: Endpoint Normalization
  // ============================================================================
  describe('Suite 1: Endpoint Normalization', () => {
    it('1.1 should normalize standard OpenAI domain to /v1/chat/completions', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('https://api.openai.com'),
        'https://api.openai.com/v1/chat/completions'
      );
    });

    it('1.2 should normalize domain with trailing slash without double slashes', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('https://api.openai.com/'),
        'https://api.openai.com/v1/chat/completions'
      );
    });

    it('1.3 should normalize endpoint already containing /v1', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('https://router.tumuer.me/v1'),
        'https://router.tumuer.me/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('https://router.tumuer.me/v1/'),
        'https://router.tumuer.me/v1/chat/completions'
      );
    });

    it('1.4 should keep intact an endpoint that already includes /chat/completions', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('https://router.tumuer.me/v1/chat/completions'),
        'https://router.tumuer.me/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('https://router.tumuer.me/v1/chat/completions/'),
        'https://router.tumuer.me/v1/chat/completions'
      );
    });

    it('1.5 should normalize local Ollama or custom port endpoints', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('http://localhost:11434'),
        'http://localhost:11434/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('http://localhost:11434/v1'),
        'http://localhost:11434/v1/chat/completions'
      );
    });

    it('1.6 should fall back to default endpoint on empty, null, or undefined', () => {
      assert.equal(ChatClient.normalizeEndpoint(''), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(null), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(undefined), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint('   '), 'https://api.openai.com/v1/chat/completions');
    });
  });

  // ============================================================================
  // Suite 2: Configuration Fallback Hierarchy & Key Masking
  // ============================================================================
  describe('Suite 2: Configuration Fallback Hierarchy & Key Masking', () => {
    it('2.1 should prioritize explicit constructor options over all environment variables', () => {
      process.env.LLM_API_KEY = 'env-llm-key';
      process.env.LLM_BASE_URL = 'https://env.llm.local/v1';
      process.env.LLM_MODEL = 'env-model';

      const client = new ChatClient({
        apiKey: 'explicit-opt-key',
        baseURL: 'https://opt.custom.com/v1',
        model: 'opt-custom-model',
        timeout: 45000,
        maxRetries: 3
      });

      assert.equal(client.apiKey, 'explicit-opt-key');
      assert.equal(client.baseURL, 'https://opt.custom.com/v1');
      assert.equal(client.endpoint, 'https://opt.custom.com/v1/chat/completions');
      assert.equal(client.model, 'opt-custom-model');
      assert.equal(client.timeout, 45000);
      assert.equal(client.maxRetries, 3);
      assert.equal(client.isConfigured(), true);
    });

    it('2.2 should prioritize process.env.LLM_* over process.env.EMBEDDING_*', () => {
      process.env.LLM_API_KEY = 'llm-key-123';
      process.env.LLM_BASE_URL = 'https://llm.provider.com/v1';
      process.env.LLM_MODEL = 'deepseek-chat';
      process.env.EMBEDDING_API_KEY = 'emb-key-456';
      process.env.EMBEDDING_BASE_URL = 'https://emb.provider.com/v1';

      const client = new ChatClient({});

      assert.equal(client.apiKey, 'llm-key-123');
      assert.equal(client.baseURL, 'https://llm.provider.com/v1');
      assert.equal(client.model, 'deepseek-chat');
    });

    it('2.3 should fall back to process.env.EMBEDDING_* when LLM_* is absent', () => {
      process.env.EMBEDDING_API_KEY = 'emb-key-fallback';
      process.env.EMBEDDING_BASE_URL = 'https://emb-router.local/v1';

      const client = new ChatClient({});

      assert.equal(client.apiKey, 'emb-key-fallback');
      assert.equal(client.baseURL, 'https://emb-router.local/v1');
      assert.equal(client.model, 'gpt-4o-mini'); // default model
      assert.equal(client.isConfigured(), true);
    });

    it('2.4 should fall back to parsing config.env file when no env vars are present', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-config-test-'));
      const tempEnvPath = path.join(tempDir, 'test.env');
      fs.writeFileSync(
        tempEnvPath,
        [
          '# Test config file',
          'EMBEDDING_BASE_URL=https://file-fallback.router.com/v1',
          'EMBEDDING_API_KEY=sk-fileFallback1234567890',
          'LLM_MODEL=qwen-plus',
          'LLM_TIMEOUT=30000',
          'LLM_MAX_RETRIES=4'
        ].join('\n'),
        'utf8'
      );

      try {
        const client = new ChatClient({ configEnvPath: tempEnvPath });
        assert.equal(client.baseURL, 'https://file-fallback.router.com/v1');
        assert.equal(client.apiKey, 'sk-fileFallback1234567890');
        assert.equal(client.model, 'qwen-plus');
        assert.equal(client.timeout, 30000);
        assert.equal(client.maxRetries, 4);
        assert.equal(client.isConfigured(), true);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('2.5 should fall back to defaults when completely unconfigured', () => {
      const nonExistentPath = path.join(os.tmpdir(), 'non_existent_' + Date.now() + '.env');
      const client = new ChatClient({ configEnvPath: nonExistentPath });

      assert.equal(client.apiKey, '');
      assert.equal(client.baseURL, 'https://api.openai.com/v1');
      assert.equal(client.endpoint, 'https://api.openai.com/v1/chat/completions');
      assert.equal(client.model, 'gpt-4o-mini');
      assert.equal(client.timeout, 60000);
      assert.equal(client.maxRetries, 2);
      assert.equal(client.isConfigured(), false);
    });

    it('2.6 should mask API keys securely in log outputs and error reports', () => {
      assert.equal(ChatClient.maskApiKey(null), '[NONE]');
      assert.equal(ChatClient.maskApiKey(undefined), '[NONE]');
      assert.equal(ChatClient.maskApiKey(''), '[NONE]');
      assert.equal(ChatClient.maskApiKey('   '), '[NONE]');
      assert.equal(ChatClient.maskApiKey('12345678'), '****');
      assert.equal(ChatClient.maskApiKey('short'), '****');
      assert.equal(ChatClient.maskApiKey('sk-1234567890abcdef'), 'sk-****cdef');
      assert.equal(ChatClient.maskApiKey('sk-TIGGxizvo855mbokgmbYitKnxYUdS9hzSsZLuawJnqenU0pc'), 'sk-****U0pc');
    });

    it('2.7 should read project config.env automatically when unconfigured by options and env', () => {
      const client = new ChatClient({});
      assert.equal(client.baseURL, 'https://router.tumuer.me/v1');
      assert.equal(client.endpoint, 'https://router.tumuer.me/v1/chat/completions');
      assert.equal(client.apiKey, 'sk-TIGGxizvo855mbokgmbYitKnxYUdS9hzSsZLuawJnqenU0pc');
      assert.equal(client.isConfigured(), true);
    });
  });

  // ============================================================================
  // Suite 3: Mock Client & Chat Completion
  // ============================================================================
  describe('Suite 3: Mock Client & Chat Completion', () => {
    it('3.1 should execute chat completion via mock handler with custom content string', async () => {
      const client = ChatClient.createMockClient('夜幕降临，废弃矿坑深处的冷凝管道开始渗水。');

      assert.equal(client.isConfigured(), true);

      const result = await client.chatCompletion({
        messages: [
          { role: 'system', content: 'You are a webnovel writer.' },
          { role: 'user', content: 'Describe the scene.' }
        ]
      });

      assert.equal(result.content, '夜幕降临，废弃矿坑深处的冷凝管道开始渗水。');
      assert.equal(result.message.role, 'assistant');
      assert.equal(result.message.content, '夜幕降临，废弃矿坑深处的冷凝管道开始渗水。');
      assert.equal(result.model, 'gpt-4o-mini');
      assert.equal(result.finishReason, 'stop');
      assert.equal(typeof result.usage, 'object');
    });

    it('3.2 should forward request parameters accurately to mockHandler', async () => {
      let capturedPayload = null;

      const client = ChatClient.createMockClient(async (payload) => {
        capturedPayload = payload;
        return {
          content: 'Payload verification response',
          usage: { promptTokens: 15, completionTokens: 8, totalTokens: 23 }
        };
      });

      const response = await client.chatCompletion({
        messages: [
          { role: 'system', content: 'System instruction' },
          { role: 'user', content: 'User prompt' }
        ],
        model: 'deepseek-v3',
        temperature: 0.2,
        maxTokens: 512,
        timeout: 15000,
        stop: ['[END]']
      });

      assert.ok(capturedPayload);
      assert.equal(capturedPayload.model, 'deepseek-v3');
      assert.equal(capturedPayload.temperature, 0.2);
      assert.equal(capturedPayload.maxTokens, 512);
      assert.equal(capturedPayload.timeout, 15000);
      assert.deepEqual(capturedPayload.stop, ['[END]']);
      assert.equal(capturedPayload.messages.length, 2);
      assert.equal(response.content, 'Payload verification response');
      assert.equal(response.usage.promptTokens, 15);
      assert.equal(response.usage.completionTokens, 8);
    });

    it('3.3 should support response queues with multiple sequential calls', async () => {
      const client = ChatClient.createMockClient([
        'Response 1',
        'Response 2',
        'Response 3'
      ]);

      const r1 = await client.chatCompletion({ messages: [{ role: 'user', content: '1' }] });
      const r2 = await client.chatCompletion({ messages: [{ role: 'user', content: '2' }] });
      const r3 = await client.chatCompletion({ messages: [{ role: 'user', content: '3' }] });

      assert.equal(r1.content, 'Response 1');
      assert.equal(r2.content, 'Response 2');
      assert.equal(r3.content, 'Response 3');

      // Subsequent call when queue is exhausted should fail gracefully
      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: '4' }] }),
        (err) => err instanceof NovelError && err.code === 'LLM_MOCK_EXHAUSTED'
      );
    });

    it('3.4 should reject requests with empty or invalid messages parameter', async () => {
      const client = ChatClient.createMockClient('Sample');

      await assert.rejects(
        () => client.chatCompletion({ messages: [] }),
        (err) => err instanceof NovelError && err.code === 'LLM_BAD_REQUEST'
      );

      await assert.rejects(
        () => client.chatCompletion({ messages: null }),
        (err) => err instanceof NovelError && err.code === 'LLM_BAD_REQUEST'
      );

      await assert.rejects(
        () => client.chatCompletion({ messages: ['invalid-string-message'] }),
        (err) => err instanceof NovelError && err.code === 'LLM_BAD_REQUEST'
      );
    });

    it('3.5 should reject unconfigured client without API key or mock handler', async () => {
      const client = new ChatClient({ apiKey: '', configEnvPath: '/non_existent.env' });
      assert.equal(client.isConfigured(), false);

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'hi' }] }),
        (err) => err instanceof NovelError && err.code === 'LLM_KEY_MISSING'
      );
    });
  });

  // ============================================================================
  // Suite 4: JSON Completion & Markdown Fence Stripping
  // ============================================================================
  describe('Suite 4: JSON Completion & Markdown Fence Stripping', () => {
    it('4.1 should parse raw valid JSON without markdown code fences', async () => {
      const client = ChatClient.createMockClient('{"status": "success", "score": 98}');

      const data = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'Rate draft' }]
      });

      assert.deepEqual(data, { status: 'success', score: 98 });
    });

    it('4.2 should cleanly strip ```json ... ``` markdown code fences', async () => {
      const payload = '```json\n{\n  "verdict": "pass",\n  "issues": []\n}\n```';
      const client = ChatClient.createMockClient(payload);

      const data = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'Audit canon' }]
      });

      assert.deepEqual(data, { verdict: 'pass', issues: [] });
    });

    it('4.3 should cleanly strip ``` ... ``` code fences without json tag', async () => {
      const payload = '```\n{\n  "target": "lore_rule",\n  "active": true\n}\n```';
      const client = ChatClient.createMockClient(payload);

      const data = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'Check rule' }]
      });

      assert.deepEqual(data, { target: 'lore_rule', active: true });
    });

    it('4.4 should extract embedded JSON when LLM adds explanatory prose before or after fences', async () => {
      const payload = [
        'Here is the structured evaluation result:',
        '```json',
        '{"blockerCount": 0, "canSettle": true}',
        '```',
        'Let me know if you need further adjustments.'
      ].join('\n');

      const client = ChatClient.createMockClient(payload);

      const data = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'Extract' }]
      });

      assert.deepEqual(data, { blockerCount: 0, canSettle: true });
    });

    it('4.5 should throw LLM_JSON_PARSE_ERROR when response is not valid JSON', async () => {
      const client = ChatClient.createMockClient('```json\n{ invalid: json without quotes here }\n```');

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'Bad JSON' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          assert.ok(err.details.rawContent.includes('invalid'));
          return true;
        }
      );
    });

    it('4.6 stripJsonFences static helper should handle edge cases robustly', () => {
      assert.equal(ChatClient.stripJsonFences(null), '');
      assert.equal(ChatClient.stripJsonFences(undefined), '');
      assert.equal(ChatClient.stripJsonFences('{"a":1}'), '{"a":1}');
      assert.equal(ChatClient.stripJsonFences('```json\n{"a":1}\n```'), '{"a":1}');
      assert.equal(ChatClient.stripJsonFences('```JSON\n{"a":1}\n```'), '{"a":1}');
      assert.equal(ChatClient.stripJsonFences('  ```\n{"a":1}\n```  '), '{"a":1}');
    });

    it('4.7 should pass schema option through responseFormat in chatJsonCompletion', async () => {
      let capturedPayload = null;
      const client = ChatClient.createMockClient(async (payload) => {
        capturedPayload = payload;
        return '{"result": 42}';
      });

      const schema = { type: 'json_schema', json_schema: { name: 'calc' } };
      const parsed = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'calc' }],
        schema
      });

      assert.deepEqual(parsed, { result: 42 });
      assert.deepEqual(capturedPayload.responseFormat, schema);
    });
  });

  // ============================================================================
  // Suite 5: Error Handling & Retry Mechanics
  // ============================================================================
  describe('Suite 5: Error Handling & Retry Mechanics', () => {
    it('5.1 should fail immediately on HTTP 401 with LLM_AUTH_FAILED and zero retries', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const error = new Error('Unauthorized access token');
        error.response = { status: 401, data: { error: { message: 'Invalid API key' } } };
        throw error;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_AUTH_FAILED');
          assert.equal(err.details.status, 401);
          return true;
        }
      );

      // Crucial: Must NOT retry on authentication failure
      assert.equal(callCount, 1);
    });

    it('5.2 should fail immediately on HTTP 403 with LLM_AUTH_FAILED and zero retries', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const error = new Error('Forbidden resource');
        error.response = { status: 403, data: { error: { message: 'Access denied' } } };
        throw error;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_AUTH_FAILED');
          assert.equal(err.details.status, 403);
          return true;
        }
      );

      assert.equal(callCount, 1);
    });

    it('5.3 should fail immediately on HTTP 400 with LLM_BAD_REQUEST and zero retries', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const error = new Error('Invalid model name');
        error.response = { status: 400, data: { error: { message: 'The model gpt-unknown does not exist' } } };
        throw error;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_BAD_REQUEST');
          return true;
        }
      );

      assert.equal(callCount, 1);
    });

    it('5.4 should retry on HTTP 500 and succeed if transient error resolves', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        if (callCount === 1) {
          const error = new Error('Internal Server Error');
          error.response = { status: 500, data: { error: { message: 'Overloaded' } } };
          throw error;
        }
        return { content: 'Recovered after transient error' };
      });

      const response = await client.chatCompletion({
        messages: [{ role: 'user', content: 'Retry test' }]
      });

      assert.equal(callCount, 2);
      assert.equal(response.content, 'Recovered after transient error');
    });

    it('5.5 should retry up to maxRetries on HTTP 429 and throw LLM_RATE_LIMIT upon exhaustion', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const error = new Error('Rate limit exceeded');
        error.response = { status: 429, data: { error: { message: 'Too many requests' } } };
        throw error;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'Rate test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_RATE_LIMIT');
          assert.equal(err.details.attempts, 3); // 1 initial + 2 retries
          return true;
        }
      );

      assert.equal(callCount, 3);
    });

    it('5.6 should retry and throw LLM_TIMEOUT on request timeout exhaustion', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const error = new Error('timeout of 5000ms exceeded');
        error.code = 'ECONNABORTED';
        throw error;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'Timeout test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_TIMEOUT');
          assert.equal(err.details.attempts, 3);
          return true;
        }
      );

      assert.equal(callCount, 3);
    });

    it('5.7 should reject malformed responses lacking choices array', async () => {
      const client = ChatClient.createMockClient(async () => {
        return { choices: [] }; // Malformed OpenAI response
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'Malformed' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_RESPONSE_ERROR');
          return true;
        }
      );
    });
  });
});
