/**
 * test/unit/syncLorePatch_optionA.test.js
 * Comprehensive unit tests verifying Option A in SyncLorePatch:
 * Only modify YAML Frontmatter properties; prose body below '---' remains 100% byte-for-byte intact.
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createTempDir } = require('../helpers/tempDir');
const { StateSettlementManager } = require('../../src/settlement/StateSettlementManager');
const { PathGuard } = require('../../src/security/PathGuard');
const { ChatClient } = require('../../src/llm/ChatClient');

describe('Option A: SyncLorePatch Frontmatter-Only Modification & Body Preservation', () => {
  let tempSandbox;
  let vaultRoot;
  let pathGuard;
  let mockDbManager;
  let manager;

  beforeEach(() => {
    tempSandbox = createTempDir('option-a-test-');
    vaultRoot = tempSandbox.createSubdir('WorldTree');
    tempSandbox.createSubdir('WorldTree/02_Entities');

    pathGuard = new PathGuard({ vaultRoot });

    // Mock DB manager with state mutations repo
    const mockMutations = [
      {
        id: 1,
        mutation_id: 'MUT_001',
        draft_version_id: 'DV_TEST_CH01',
        chapter_id: 'CH01',
        entity_id: 'CHAR_ALICE',
        field_path: 'attributes.status',
        old_value_json: '"healthy"',
        new_value_json: '"injured"',
        source_range: 'L12-L15',
        status: 'draft'
      },
      {
        id: 2,
        mutation_id: 'MUT_002',
        draft_version_id: 'DV_TEST_CH01',
        chapter_id: 'CH01',
        entity_id: 'CHAR_BOB',
        field_path: 'faction',
        old_value_json: '"neutral"',
        new_value_json: '"rebel"',
        source_range: 'L25-L30',
        status: 'draft'
      }
    ];

    mockDbManager = {
      stateMutations: {
        findByDraftVersionId: (draftVerId) => {
          if (draftVerId === 'DV_EMPTY') return [];
          return mockMutations.filter(m => m.draft_version_id === draftVerId);
        }
      }
    };

    const mockChat = ChatClient.createMockClient({
      defaultResponse: '{"mutations": []}'
    });

    manager = new StateSettlementManager(mockDbManager, pathGuard, { chatClient: mockChat });
  });

  afterEach(() => {
    tempSandbox.cleanup();
  });

  it('OPTA-01: updates frontmatter key and preserves prose body 100% byte-for-byte', async () => {
    const filePath = path.join(vaultRoot, '02_Entities', 'CHAR_ALICE.md');
    const originalBody = `\n# 角色详情：爱丽丝\n\n- 身高: 168cm\n- 瞳色: 蔚蓝\n\n> "这片星空下，没有谁能独善其身。"\n\n### 历史备忘录\n在第三纪元初，曾参与裂隙调查。保留原始作者手稿，不得篡改任何字符。\n`;
    const initialFileContent = `---\nentity_id: "CHAR_ALICE"\nstatus: healthy\nage: 24\n---${originalBody}`;

    fs.writeFileSync(filePath, initialFileContent, 'utf8');

    const result = await manager.syncLorePatch({
      draftVersionId: 'DV_TEST_CH01',
      confirmationToken: 'CONFIRM_SYNC_LORE_PATCH'
    });

    assert.equal(result.status, 'success');
    assert.equal(result.syncedCount, 2);

    const updatedContent = fs.readFileSync(filePath, 'utf8');
    const fmMatch = updatedContent.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?([\s\S]*)$/);
    assert.ok(fmMatch, 'File must have valid YAML frontmatter delimiters');

    const frontmatter = fmMatch[1];
    const extractedBody = fmMatch[2];

    // Frontmatter should be updated with new status: "injured"
    assert.match(frontmatter, /status:\s*"injured"/);
    assert.match(frontmatter, /age:\s*24/);

    // Body below frontmatter must be 100% byte-for-byte identical to originalBody
    assert.equal(`\n${extractedBody}`, originalBody);
  });

  it('OPTA-02: appends new key to existing frontmatter if key did not exist, body preserved', async () => {
    const filePath = path.join(vaultRoot, '02_Entities', 'CHAR_BOB.md');
    const originalBody = `\n# 鲍勃档案\n\n自由撰稿人与潜行者。\n无已知软肋。\n`;
    const initialFileContent = `---\nentity_id: "CHAR_BOB"\nlevel: 5\n---${originalBody}`;

    fs.writeFileSync(filePath, initialFileContent, 'utf8');

    const result = await manager.syncLorePatch({
      draftVersionId: 'DV_TEST_CH01',
      confirmationToken: 'CONFIRM_SYNC_LORE_PATCH'
    });

    assert.equal(result.status, 'success');

    const updatedContent = fs.readFileSync(filePath, 'utf8');
    const fmMatch = updatedContent.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n)?([\s\S]*)$/);
    assert.ok(fmMatch);

    const frontmatter = fmMatch[1];
    const extractedBody = fmMatch[2];

    assert.match(frontmatter, /faction:\s*"rebel"/);
    assert.match(frontmatter, /level:\s*5/);
    assert.equal(`\n${extractedBody}`, originalBody);
  });

  it('OPTA-03: prepends frontmatter if file previously had none, keeping original content intact', async () => {
    const filePath = path.join(vaultRoot, '02_Entities', 'CHAR_ALICE.md');
    const originalContent = `# 爱丽丝的纯手写笔记\n\n没有任何 YAML 头。\n全部为纯文本作者灵感。\n`;

    fs.writeFileSync(filePath, originalContent, 'utf8');

    const result = await manager.syncLorePatch({
      draftVersionId: 'DV_TEST_CH01',
      confirmationToken: 'CONFIRM_SYNC_LORE_PATCH'
    });

    assert.equal(result.status, 'success');

    const updatedContent = fs.readFileSync(filePath, 'utf8');
    assert.ok(updatedContent.startsWith('---\nstatus: "injured"\n---\n\n'));
    assert.ok(updatedContent.endsWith(originalContent));
  });

  it('OPTA-04: creates new file with frontmatter and stub header if target does not exist', async () => {
    const filePath = path.join(vaultRoot, '02_Entities', 'CHAR_DEFAULT.md');
    assert.equal(fs.existsSync(filePath), false);

    const result = await manager.syncLorePatch({
      draftVersionId: 'DV_EMPTY',
      confirmationToken: 'CONFIRM_SYNC_LORE_PATCH'
    });

    assert.equal(result.status, 'success');
    assert.equal(fs.existsSync(filePath), true);

    const content = fs.readFileSync(filePath, 'utf8');
    assert.match(content, /^---\nentity_id: "CHAR_DEFAULT"\nstatus: updated\n---\n\n# CHAR_DEFAULT\n$/);
  });

  it('OPTA-05: rejects execution if confirmationToken is invalid or omitted', async () => {
    await assert.rejects(
      async () => {
        await manager.syncLorePatch({ draftVersionId: 'DV_TEST_CH01' });
      },
      {
        name: 'NovelError',
        code: 'INVALID_CONFIRMATION_TOKEN'
      }
    );

    await assert.rejects(
      async () => {
        await manager.syncLorePatch({
          draftVersionId: 'DV_TEST_CH01',
          confirmationToken: 'INVALID_TOKEN'
        });
      },
      {
        name: 'NovelError',
        code: 'INVALID_CONFIRMATION_TOKEN'
      }
    );
  });

  it('OPTA-06: fails closed on corrupted draft version indicator', async () => {
    await assert.rejects(
      async () => {
        await manager.syncLorePatch({
          draftVersionId: 'DV_CORRUPT_PATCH',
          confirmationToken: 'CONFIRM_SYNC_LORE_PATCH'
        });
      },
      {
        name: 'NovelError',
        code: 'ERR_LORE_PATCH_CORRUPTION'
      }
    );
  });
});
