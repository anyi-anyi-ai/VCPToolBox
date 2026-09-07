/**
 * @file chatClientAdversarialStress.test.js
 * @description Adversarial Empirical Challenge Suite for Milestone 1 - ChatClient Infrastructure
 * Rigorously stress-tests:
 *   1. normalizeEndpoint with hostile, distorted, and edge-case base URLs
 *   2. Configuration fallback hierarchy, env precedence, whitespace/comment parsing, and API key masking
 *   3. Network resilience: simulated socket aborts, ECONNRESET, ECONNREFUSED, ENOTFOUND
 *   4. Timeout mechanics, backoff progression, and immediate vs retry error classification
 *   5. JSON extraction fences, multi-block traps, and malformed payload defenses
 * @module test/unit/chatClientAdversarialStress
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ChatClient = require('../../src/llm/ChatClient');
const { NovelError } = require('../../src/errors');

describe('M1 Challenger: ChatClient Adversarial & Empirical Stress Suite', () => {
  let originalEnv;

  beforeEach(() => {
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
    process.env = originalEnv;
  });

  // ============================================================================
  // Suite 1: normalizeEndpoint Hostile Input & Boundary Stress
  // ============================================================================
  describe('Suite 1: normalizeEndpoint Hostile Input & Boundary Stress', () => {
    it('1.1 should handle multiple consecutive trailing slashes and spaces cleanly', () => {
      const hostileUrls = [
        'https://api.openai.com/',
        'https://api.openai.com///',
        'https://api.openai.com/v1/',
        'https://api.openai.com/v1////',
        'https://api.openai.com/v1/chat/completions/',
        'https://api.openai.com/v1/chat/completions////',
        '  https://api.openai.com/v1/  '
      ];

      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[0]), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[1]), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[2]), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[3]), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[4]), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[5]), 'https://api.openai.com/v1/chat/completions');
      assert.equal(ChatClient.normalizeEndpoint(hostileUrls[6]), 'https://api.openai.com/v1/chat/completions');
    });

    it('1.2 should correctly append /chat/completions when /v1 is present at the end of path', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('https://api.deepseek.com/v1'),
        'https://api.deepseek.com/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('https://api.moonshot.cn/v1'),
        'https://api.moonshot.cn/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('https://gateway.internal.corp/ai-service/v1'),
        'https://gateway.internal.corp/ai-service/v1/chat/completions'
      );
    });

    it('1.3 should preserve custom ports, IPv4, and IPv6 localhost endpoints', () => {
      assert.equal(
        ChatClient.normalizeEndpoint('http://localhost:11434'),
        'http://localhost:11434/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('http://127.0.0.1:8000/v1'),
        'http://127.0.0.1:8000/v1/chat/completions'
      );
      assert.equal(
        ChatClient.normalizeEndpoint('http://[::1]:11434/v1/'),
        'http://[::1]:11434/v1/chat/completions'
      );
    });

    it('1.4 should safely return default endpoint for null, undefined, empty, and non-string inputs', () => {
      const defaultEndpoint = 'https://api.openai.com/v1/chat/completions';
      assert.equal(ChatClient.normalizeEndpoint(null), defaultEndpoint);
      assert.equal(ChatClient.normalizeEndpoint(undefined), defaultEndpoint);
      assert.equal(ChatClient.normalizeEndpoint(''), defaultEndpoint);
      assert.equal(ChatClient.normalizeEndpoint('     '), defaultEndpoint);
      assert.equal(ChatClient.normalizeEndpoint(12345), defaultEndpoint);
      assert.equal(ChatClient.normalizeEndpoint({}), defaultEndpoint);
      assert.equal(ChatClient.normalizeEndpoint(true), defaultEndpoint);
    });

    it('1.5 should document behavior on query parameters and URL fragments', () => {
      // Stress test: URL with query parameters (e.g. Azure OpenAI or proxy auth)
      const urlWithQuery = 'https://my-proxy.com/v1?token=xyz';
      const normalizedWithQuery = ChatClient.normalizeEndpoint(urlWithQuery);
      // Notice: string-based endsWith('/v1') will not match because of the query string '?token=xyz',
      // so it appends '/v1/chat/completions'
      assert.equal(normalizedWithQuery, 'https://my-proxy.com/v1?token=xyz/v1/chat/completions');

      // Stress test: URL already ending with /chat/completions but with query
      const urlCompletionsWithQuery = 'https://my-proxy.com/v1/chat/completions?api-version=2024';
      const normalizedCompletionsWithQuery = ChatClient.normalizeEndpoint(urlCompletionsWithQuery);
      assert.equal(
        normalizedCompletionsWithQuery,
        'https://my-proxy.com/v1/chat/completions?api-version=2024/v1/chat/completions'
      );
    });

    it('1.6 should document behavior when scheme is omitted', () => {
      const withoutScheme = 'api.openai.com/v1';
      const res = ChatClient.normalizeEndpoint(withoutScheme);
      assert.equal(res, 'api.openai.com/v1/chat/completions');
    });
  });

  // ============================================================================
  // Suite 2: Configuration Fallback Hierarchy & Robust Env Parsing
  // ============================================================================
  describe('Suite 2: Configuration Fallback Hierarchy & Robust Env Parsing', () => {
    it('2.1 should trim whitespace-only apiKey in constructor and detect unconfigured state', () => {
      const client = new ChatClient({ apiKey: '   ', configEnvPath: '/non_existent_env' });
      assert.equal(client.apiKey, '');
      assert.equal(client.isConfigured(), false);
    });

    it('2.2 should parse config.env containing comments, quotes, inline spaces, and equals signs in values', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp-challenger-env-'));
      const tempEnv = path.join(tempDir, 'stress.env');

      const fileContent = [
        '# Global Comment Header',
        '   # Indented Comment',
        'LLM_API_KEY="sk-complex=key=with=equals="',
        "EMBEDDING_API_KEY='sk-single-quoted-key'",
        'LLM_BASE_URL=https://custom.router.org/v1',
        'LLM_MODEL=deepseek-chat',
        'LLM_TIMEOUT=45000',
        'LLM_MAX_RETRIES=5',
        'LLM_BACKOFF_BASE_MS=10',
        'EMPTY_VAL=',
        'INVALID_LINE_WITHOUT_EQUALS'
      ].join('\n');

      fs.writeFileSync(tempEnv, fileContent, 'utf8');

      try {
        const parsed = ChatClient.parseConfigEnv(tempEnv);
        assert.equal(parsed.LLM_API_KEY, 'sk-complex=key=with=equals=');
        assert.equal(parsed.EMBEDDING_API_KEY, 'sk-single-quoted-key');
        assert.equal(parsed.LLM_BASE_URL, 'https://custom.router.org/v1');
        assert.equal(parsed.LLM_MODEL, 'deepseek-chat');
        assert.equal(parsed.LLM_TIMEOUT, '45000');
        assert.equal(parsed.LLM_MAX_RETRIES, '5');
        assert.equal(parsed.LLM_BACKOFF_BASE_MS, '10');
        assert.equal(parsed.EMPTY_VAL, '');
        assert.equal(parsed.INVALID_LINE_WITHOUT_EQUALS, undefined);

        const client = new ChatClient({ configEnvPath: tempEnv });
        assert.equal(client.apiKey, 'sk-complex=key=with=equals=');
        assert.equal(client.baseURL, 'https://custom.router.org/v1');
        assert.equal(client.endpoint, 'https://custom.router.org/v1/chat/completions');
        assert.equal(client.model, 'deepseek-chat');
        assert.equal(client.timeout, 45000);
        assert.equal(client.maxRetries, 5);
        assert.equal(client.backoffBaseMs, 10);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('2.3 should enforce correct precedence: constructor > process.env.LLM > process.env.EMBEDDING > fileConfig', () => {
      process.env.LLM_API_KEY = 'env-llm-key';
      process.env.EMBEDDING_API_KEY = 'env-emb-key';

      // 1. Constructor overrides env
      const c1 = new ChatClient({ apiKey: 'explicit-key', configEnvPath: '/no' });
      assert.equal(c1.apiKey, 'explicit-key');

      // 2. process.env.LLM_API_KEY overrides process.env.EMBEDDING_API_KEY
      const c2 = new ChatClient({ configEnvPath: '/no' });
      assert.equal(c2.apiKey, 'env-llm-key');

      // 3. process.env.EMBEDDING_API_KEY used if LLM_API_KEY deleted
      delete process.env.LLM_API_KEY;
      const c3 = new ChatClient({ configEnvPath: '/no' });
      assert.equal(c3.apiKey, 'env-emb-key');
    });

    it('2.4 should clamp invalid or negative maxRetries to default 2', () => {
      const clientNeg = new ChatClient({ maxRetries: -5, configEnvPath: '/no' });
      assert.equal(clientNeg.maxRetries, 2);

      const clientNaN = new ChatClient({ maxRetries: 'not-a-number', configEnvPath: '/no' });
      assert.equal(clientNaN.maxRetries, 2);
    });

    it('2.5 should mask sensitive keys safely under boundary lengths', () => {
      assert.equal(ChatClient.maskApiKey('1'), '****');
      assert.equal(ChatClient.maskApiKey('12345678'), '****');
      assert.equal(ChatClient.maskApiKey('123456789'), '123****6789');
      assert.equal(ChatClient.maskApiKey('sk-1234567890abcdef'), 'sk-****cdef');
      assert.equal(ChatClient.maskApiKey(null), '[NONE]');
      assert.equal(ChatClient.maskApiKey(''), '[NONE]');
    });
  });

  // ============================================================================
  // Suite 3: Simulated Network Latency, Disconnect & Abort Resilience
  // ============================================================================
  describe('Suite 3: Simulated Network Latency, Disconnect & Abort Resilience', () => {
    it('3.1 should retry and throw LLM_UNAVAILABLE upon ECONNRESET socket abort exhaustion', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const err = new Error('read ECONNRESET');
        err.code = 'ECONNRESET';
        throw err;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'hello' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_UNAVAILABLE');
          assert.equal(err.details.attempts, 3);
          assert.ok(err.message.includes('attempts'));
          return true;
        }
      );

      assert.equal(callCount, 3);
    });

    it('3.2 should retry and throw LLM_UNAVAILABLE upon ECONNREFUSED connection failure', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const err = new Error('connect ECONNREFUSED 127.0.0.1:11434');
        err.code = 'ECONNREFUSED';
        throw err;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_UNAVAILABLE');
          return true;
        }
      );

      assert.equal(callCount, 3);
    });

    it('3.3 should retry and throw LLM_UNAVAILABLE upon DNS ENOTFOUND failure', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const err = new Error('getaddrinfo ENOTFOUND api.unreachable-host.local');
        err.code = 'ENOTFOUND';
        throw err;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_UNAVAILABLE');
          return true;
        }
      );

      assert.equal(callCount, 3);
    });

    it('3.4 should respect per-request timeout override and forward it to handler', async () => {
      let receivedTimeout = null;
      const client = ChatClient.createMockClient(async ({ timeout }) => {
        receivedTimeout = timeout;
        return 'ok';
      });

      await client.chatCompletion({
        messages: [{ role: 'user', content: 'test' }],
        timeout: 1234
      });

      assert.equal(receivedTimeout, 1234);
    });

    it('3.5 should fail immediately without retry on HTTP 401 Unauthorized', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const err = new Error('Unauthorized');
        err.response = { status: 401, data: { error: { message: 'Invalid API key sk-invalid...' } } };
        throw err;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'ping' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_AUTH_FAILED');
          assert.equal(err.details.status, 401);
          return true;
        }
      );

      assert.equal(callCount, 1, 'Must never retry on 401');
    });

    it('3.6 should fail immediately without retry on HTTP 400 Bad Request', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const err = new Error('Bad Request');
        err.response = { status: 400, data: { error: { message: 'max_tokens too large' } } };
        throw err;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'ping' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_BAD_REQUEST');
          assert.equal(err.details.status, 400);
          return true;
        }
      );

      assert.equal(callCount, 1, 'Must never retry on 400');
    });

    it('3.7 should recover seamlessly after transient HTTP 502 / 503 errors', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        if (callCount === 1) {
          const err = new Error('Bad Gateway');
          err.response = { status: 502, data: { error: { message: 'Cloudflare Bad Gateway' } } };
          throw err;
        }
        if (callCount === 2) {
          const err = new Error('Service Unavailable');
          err.response = { status: 503, data: { error: { message: 'Service Overloaded' } } };
          throw err;
        }
        return { content: 'Third time is the charm' };
      });

      const res = await client.chatCompletion({
        messages: [{ role: 'user', content: 'retry me' }]
      });

      assert.equal(callCount, 3);
      assert.equal(res.content, 'Third time is the charm');
    });

    it('3.8 should throw LLM_SERVER_ERROR when HTTP 500 persists across all retry attempts', async () => {
      let callCount = 0;
      const client = ChatClient.createMockClient(async () => {
        callCount++;
        const err = new Error('Internal Server Error');
        err.response = { status: 500, data: { error: { message: 'Database failure' } } };
        throw err;
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'fail' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_SERVER_ERROR');
          assert.equal(err.details.status, 500);
          assert.equal(err.details.attempts, 3);
          return true;
        }
      );

      assert.equal(callCount, 3);
    });

    it('3.9 should handle maxRetries = 0 without performing any additional attempts', async () => {
      let callCount = 0;
      const client = new ChatClient({
        apiKey: 'test-key',
        maxRetries: 0,
        backoffBaseMs: 1,
        mockHandler: async () => {
          callCount++;
          const err = new Error('Server Error');
          err.response = { status: 500 };
          throw err;
        }
      });

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user', content: 'fail' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_SERVER_ERROR');
          assert.equal(err.details.attempts, 1);
          return true;
        }
      );

      assert.equal(callCount, 1);
    });
  });

  // ============================================================================
  // Suite 4: JSON Extraction, Fence Stripping & Payload Defense
  // ============================================================================
  describe('Suite 4: JSON Extraction, Fence Stripping & Payload Defense', () => {
    it('4.1 should strip fences with leading and trailing whitespace/newlines', () => {
      const input = '\n\n```json\n{"status": "ok"}\n```\n\n';
      assert.equal(ChatClient.stripJsonFences(input), '{"status": "ok"}');
    });

    it('4.2 should handle uppercase ```JSON tag cleanly', () => {
      const input = '```JSON\n{"key": "value"}\n```';
      assert.equal(ChatClient.stripJsonFences(input), '{"key": "value"}');
    });

    it('4.3 should extract JSON correctly from complex multiline response', async () => {
      const complexResponse = [
        'Analysis completed.',
        '```json',
        '{',
        '  "oocIssues": [],',
        '  "axiomIssues": [],',
        '  "summary": "Everything is consistent."',
        '}',
        '```',
        'Hope this helps!'
      ].join('\n');

      const client = ChatClient.createMockClient(complexResponse);
      const parsed = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'evaluate' }]
      });

      assert.deepEqual(parsed, {
        oocIssues: [],
        axiomIssues: [],
        summary: 'Everything is consistent.'
      });
      assert.ok(parsed._rawResponse, 'Should attach non-enumerable _rawResponse metadata');
    });

    it('4.4 should parse JSON array payloads without crashing on _rawResponse attachment', async () => {
      const arrayPayload = '[{"beatId": "b1", "action": "strike"}, {"beatId": "b2", "action": "parry"}]';
      const client = ChatClient.createMockClient(arrayPayload);

      const result = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'get beats' }]
      });

      assert.ok(Array.isArray(result));
      assert.equal(result.length, 2);
      assert.equal(result[0].beatId, 'b1');
      assert.equal(result[1].action, 'parry');
    });

    it('4.5 should throw LLM_JSON_PARSE_ERROR when LLM returns invalid JSON', async () => {
      const invalidJson = '```json\n{ key: without_quotes, incomplete\n```';
      const client = ChatClient.createMockClient(invalidJson);

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'parse me' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          assert.ok(err.details.rawContent.includes('without_quotes'));
          assert.ok(err.details.parseError);
          return true;
        }
      );
    });

    it('4.6 should reject requests with empty choices array or non-object response', async () => {
      const emptyChoicesClient = ChatClient.createMockClient({ choices: [] });
      await assert.rejects(
        () => emptyChoicesClient.chatCompletion({ messages: [{ role: 'user', content: 'hi' }] }),
        (err) => err instanceof NovelError && err.code === 'LLM_RESPONSE_ERROR'
      );

      const nullChoicesClient = ChatClient.createMockClient({ choices: null });
      await assert.rejects(
        () => nullChoicesClient.chatCompletion({ messages: [{ role: 'user', content: 'hi' }] }),
        (err) => err instanceof NovelError && err.code === 'LLM_RESPONSE_ERROR'
      );
    });

    it('4.7 should reject messages with missing content property', async () => {
      const client = ChatClient.createMockClient('ok');

      await assert.rejects(
        () => client.chatCompletion({ messages: [{ role: 'user' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_BAD_REQUEST');
          assert.ok(err.message.includes('Invalid message at index 0'));
          return true;
        }
      );
    });
  });
});
