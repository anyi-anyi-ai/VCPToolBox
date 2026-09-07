/**
 * @file chatClient_challenger_m1_2.test.js
 * @description Adversarial Challenge Test Suite for ChatClient (Milestone 1)
 * Authored by challenger_m1_2.
 * 
 * Tests under stress:
 * 1. Diverse markdown code fence formats (3 backticks, 4 backticks, uppercase JSON,
 *    fences without language tag, text before/after fence, deeply nested trees,
 *    top-level arrays, special Unicode characters, CRLF vs LF line breaks).
 * 2. Invalid JSON handling across 10+ failure modes ensuring NovelError with code
 *    LLM_JSON_PARSE_ERROR is thrown with correct details and without unhandled rejections.
 * 3. Adversarial boundary conditions (multiple code blocks, embedded fences in strings,
 *    language tag variants like json5).
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const ChatClient = require('../../src/llm/ChatClient');
const { NovelError } = require('../../src/errors');

describe('Empirical Adversarial Challenge: ChatClient (challenger_m1_2)', () => {

  // ============================================================================
  // Suite 1: Diverse Markdown Fence Formats
  // ============================================================================
  describe('Suite 1: Markdown Fence Formats & JSON Stripping', () => {

    it('1.1 Standard 3-backtick fence with lowercase json (```json ... ```)', async () => {
      const payload = '```json\n{\n  "status": "active",\n  "count": 42\n}\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { status: 'active', count: 42 });
      assert.equal(ChatClient.stripJsonFences(payload), '{\n  "status": "active",\n  "count": 42\n}');
    });

    it('1.2 Uppercase JSON identifier (```JSON ... ```)', async () => {
      const payload = '```JSON\n{\n  "caseTest": true,\n  "language": "JSON"\n}\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { caseTest: true, language: 'JSON' });
      assert.equal(ChatClient.stripJsonFences(payload), '{\n  "caseTest": true,\n  "language": "JSON"\n}');
    });

    it('1.3 Code fence with no language tag (``` ... ```)', async () => {
      const payload = '```\n{\n  "tag": null,\n  "verified": true\n}\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { tag: null, verified: true });
      assert.equal(ChatClient.stripJsonFences(payload), '{\n  "tag": null,\n  "verified": true\n}');
    });

    it('1.4 Conversational text before the code fence', async () => {
      const payload = [
        'Sure! Here is the JSON structure you requested for the scene analysis:',
        '```json',
        '{"sceneId": "ch01_sc02", "pacing": "fast"}',
        '```'
      ].join('\n');
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { sceneId: 'ch01_sc02', pacing: 'fast' });
      assert.equal(ChatClient.stripJsonFences(payload), '{"sceneId": "ch01_sc02", "pacing": "fast"}');
    });

    it('1.5 Conversational text after the code fence', async () => {
      const payload = [
        '```json',
        '{"sceneId": "ch01_sc02", "pacing": "slow"}',
        '```',
        'I hope this structure meets your chapter requirements. Let me know if you want modifications.'
      ].join('\n');
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { sceneId: 'ch01_sc02', pacing: 'slow' });
      assert.equal(ChatClient.stripJsonFences(payload), '{"sceneId": "ch01_sc02", "pacing": "slow"}');
    });

    it('1.6 Text both before AND after the code fence', async () => {
      const payload = [
        'Preamble: starting JSON block output.',
        '```json',
        '{"draftVersion": 2, "approved": true}',
        '```',
        'Postscript: end of generated block.'
      ].join('\n');
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { draftVersion: 2, approved: true });
      assert.equal(ChatClient.stripJsonFences(payload), '{"draftVersion": 2, "approved": true}');
    });

    it('1.7 Deeply nested objects (6+ levels deep)', async () => {
      const deepObject = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    axiom: '恒星重力阱',
                    delta: -0.042,
                    tags: ['deep', 'nested', 'universe']
                  }
                }
              }
            }
          }
        }
      };
      const payload = '```json\n' + JSON.stringify(deepObject, null, 2) + '\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, deepObject);
      assert.equal(res.level1.level2.level3.level4.level5.level6.axiom, '恒星重力阱');
    });

    it('1.8 Top-level JSON Array', async () => {
      const arrayPayload = [
        { beatId: 'beat_01', score: 95 },
        { beatId: 'beat_02', score: 88 }
      ];
      const payload = '```json\n' + JSON.stringify(arrayPayload) + '\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.ok(Array.isArray(res));
      assert.equal(res.length, 2);
      assert.deepEqual(res, arrayPayload);
    });

    it('1.9 Special Unicode characters, CJK prose, and emojis', async () => {
      const unicodeObject = {
        title: '第108章·量子湮灭之翼',
        quote: '“沈澈低声道：‘这不是重力阱，是思维坍缩。’”',
        emojiBadge: '🚀✨⚔️🛡️',
        surrogatePair: '𠮷野家',
        controlCharacters: 'Line 1\tTabbed\nLine 2',
        specialSpaces: '前缀\u3000全角空格\u200B零宽空格'
      };
      const payload = '```json\n' + JSON.stringify(unicodeObject, null, 2) + '\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, unicodeObject);
      assert.equal(res.emojiBadge, '🚀✨⚔️🛡️');
      assert.equal(res.quote, '“沈澈低声道：‘这不是重力阱，是思维坍缩。’”');
    });

    it('1.10 Windows CRLF line endings (\\r\\n)', async () => {
      const payload = '```json\r\n{\r\n  "crlf": true,\r\n  "os": "windows"\r\n}\r\n```';
      const client = ChatClient.createMockClient(payload);

      const res = await client.chatJsonCompletion({
        messages: [{ role: 'user', content: 'test' }]
      });

      assert.deepEqual(res, { crlf: true, os: 'windows' });
    });

    it('1.11 Empty JSON structures ({} and [])', async () => {
      const clientObj = ChatClient.createMockClient('```json\n{}\n```');
      const resObj = await clientObj.chatJsonCompletion({ messages: [{ role: 'user', content: 'empty' }] });
      assert.deepEqual(resObj, {});

      const clientArr = ChatClient.createMockClient('```json\n[]\n```');
      const resArr = await clientArr.chatJsonCompletion({ messages: [{ role: 'user', content: 'empty' }] });
      assert.deepEqual(resArr, []);
    });

    it('1.12 Stress: 4-backtick fence format (````json ... ````) behavior analysis', async () => {
      // In CommonMark markdown, 4-backtick fences ```` are standard when enclosing content
      // with 3 backticks. Let's document how ChatClient handles 4 backticks.
      const raw4Backticks = '````json\n{"a": 1}\n````';
      const stripped = ChatClient.stripJsonFences(raw4Backticks);

      // Note: Because stripJsonFences regex is /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
      // the 4th backtick and trailing 1st backtick are captured inside the content:
      // stripped evaluates to '`json\n{"a": 1}\n`'.
      // When passed to chatJsonCompletion, this triggers LLM_JSON_PARSE_ERROR.
      const client = ChatClient.createMockClient(raw4Backticks);
      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: '4bt' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });
  });

  // ============================================================================
  // Suite 2: Invalid JSON Handling & Error Guarantees
  // ============================================================================
  describe('Suite 2: Invalid JSON Handling & Error Guarantees', () => {

    it('2.1 Truncated JSON response throws NovelError with LLM_JSON_PARSE_ERROR', async () => {
      const client = ChatClient.createMockClient('```json\n{"status": "in_progress", "data": [1, 2, \n```');

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          assert.ok(err.details.rawContent.includes('in_progress'));
          assert.ok(err.details.strippedSnippet.length > 0);
          assert.ok(typeof err.details.parseError === 'string');
          return true;
        }
      );
    });

    it('2.2 Trailing comma in object / array throws LLM_JSON_PARSE_ERROR', async () => {
      const client = ChatClient.createMockClient('{"items": [1, 2, 3,], "flag": true,}');

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('2.3 Single-quoted JSON strings throw LLM_JSON_PARSE_ERROR', async () => {
      const client = ChatClient.createMockClient("{'title': 'Bad Quotes', 'valid': false}");

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('2.4 Unquoted property keys throw LLM_JSON_PARSE_ERROR', async () => {
      const client = ChatClient.createMockClient('{ status: "active", count: 10 }');

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('2.5 Python-style literals (True, False, None) throw LLM_JSON_PARSE_ERROR', async () => {
      const client = ChatClient.createMockClient('{"active": True, "data": None, "closed": False}');

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('2.6 Conversational refusal without JSON throws LLM_JSON_PARSE_ERROR', async () => {
      const refusal = 'I apologize, but I cannot fulfill this request as it conflicts with safety guidelines.';
      const client = ChatClient.createMockClient(refusal);

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          assert.equal(err.details.rawContent, refusal);
          return true;
        }
      );
    });

    it('2.7 Empty string and whitespace-only responses throw LLM_JSON_PARSE_ERROR', async () => {
      const clientEmpty = ChatClient.createMockClient('');
      await assert.rejects(
        () => clientEmpty.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );

      const clientWhitespace = ChatClient.createMockClient('   \n\t  \r\n  ');
      await assert.rejects(
        () => clientWhitespace.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('2.8 HTML Gateway / Server error page throws LLM_JSON_PARSE_ERROR', async () => {
      const html = '<!DOCTYPE html><html><head><title>502 Bad Gateway</title></head><body><h1>502 Bad Gateway</h1></body></html>';
      const client = ChatClient.createMockClient(html);

      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          assert.ok(err.details.rawContent.includes('502 Bad Gateway'));
          return true;
        }
      );
    });

    it('2.9 JavaScript NaN and undefined tokens throw LLM_JSON_PARSE_ERROR', async () => {
      const clientNaN = ChatClient.createMockClient('{"score": NaN}');
      await assert.rejects(
        () => clientNaN.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );

      const clientUndef = ChatClient.createMockClient('{"value": undefined}');
      await assert.rejects(
        () => clientUndef.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('2.10 Unhandled Rejection Guarantee: chatJsonCompletion rejection is properly caught', async () => {
      let unhandledEmitted = false;
      const onUnhandled = (reason) => {
        unhandledEmitted = true;
      };
      process.on('unhandledRejection', onUnhandled);

      try {
        const client = ChatClient.createMockClient('INVALID_JSON');
        let caughtError = null;

        try {
          await client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] });
        } catch (err) {
          caughtError = err;
        }

        assert.ok(caughtError instanceof NovelError);
        assert.equal(caughtError.code, 'LLM_JSON_PARSE_ERROR');

        // Allow microtask ticks to ensure unhandledRejection didn't fire
        await new Promise((resolve) => setTimeout(resolve, 50));
        assert.equal(unhandledEmitted, false, 'No unhandledRejection event should be emitted');
      } finally {
        process.removeListener('unhandledRejection', onUnhandled);
      }
    });
  });

  // ============================================================================
  // Suite 3: Adversarial Boundary Conditions
  // ============================================================================
  describe('Suite 3: Adversarial Boundary Conditions', () => {

    it('3.1 Multiple code blocks: first block non-JSON triggers parse error in naive stripJsonFences', async () => {
      const payload = [
        'Here is the reasoning:',
        '```markdown',
        '- Rule A passed',
        '- Rule B checked',
        '```',
        'And here is the final output:',
        '```json',
        '{"verdict": "APPROVED"}',
        '```'
      ].join('\n');

      // Demonstrates the boundary limitation: embeddedMatch matches the FIRST code block
      // because (?:json)? is optional, extracting the markdown block.
      const stripped = ChatClient.stripJsonFences(payload);
      assert.ok(stripped.includes('Rule A passed'), 'stripJsonFences extracted the first code block');

      const client = ChatClient.createMockClient(payload);
      await assert.rejects(
        () => client.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] }),
        (err) => {
          assert.ok(err instanceof NovelError);
          assert.equal(err.code, 'LLM_JSON_PARSE_ERROR');
          return true;
        }
      );
    });

    it('3.2 Non-object root values (number, boolean, null) do not attach _rawResponse', async () => {
      const clientNum = ChatClient.createMockClient('42');
      const resNum = await clientNum.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] });
      assert.equal(resNum, 42);

      const clientBool = ChatClient.createMockClient('true');
      const resBool = await clientBool.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] });
      assert.equal(resBool, true);

      const clientNull = ChatClient.createMockClient('null');
      const resNull = await clientNull.chatJsonCompletion({ messages: [{ role: 'user', content: 'test' }] });
      assert.equal(resNull, null);
    });

    it('3.3 Non-string input to stripJsonFences safely returns empty string', () => {
      assert.equal(ChatClient.stripJsonFences(null), '');
      assert.equal(ChatClient.stripJsonFences(undefined), '');
      assert.equal(ChatClient.stripJsonFences(12345), '');
      assert.equal(ChatClient.stripJsonFences({}), '');
      assert.equal(ChatClient.stripJsonFences([]), '');
    });
  });
});
