/**
 * @file test_two_stage_rag.js
 * @description Comprehensive unit & stdio protocol verification for Two-Stage Hybrid RAG
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const EmbeddingClient = require('../../src/rag/EmbeddingClient');
const VectorStoreManager = require('../../src/rag/VectorStoreManager');
const BM25FallbackEngine = require('../../src/rag/BM25FallbackEngine');
const SummaryExtractorEngine = require('../../src/rag/SummaryExtractorEngine');
const NovelLoreRetriever = require('../../src/rag/NovelLoreRetriever');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');

async function runAllTests() {
  console.log('=== [TEST] Starting Two-Stage Hybrid RAG Verification ===\n');
  let passed = 0;

  // --- TEST 1: EmbeddingClient Key Masking & Dimension Assertion ---
  {
    console.log('[Test 1] EmbeddingClient API key masking & validation');
    assert.strictEqual(EmbeddingClient.maskApiKey('sk-1234567890abcdef'), 'sk-****cdef');
    assert.strictEqual(EmbeddingClient.maskApiKey('short'), '****');
    assert.strictEqual(EmbeddingClient.maskApiKey(''), '[NONE]');

    const clientNoKey = new EmbeddingClient({ EMBEDDING_API_KEY: "" });
    assert.strictEqual(clientNoKey.isConfigured(), false);

    let threwMissingKey = false;
    try {
      await clientNoKey.embedQuery('test');
    } catch (e) {
      threwMissingKey = true;
      assert.strictEqual(e.code, 'EMBEDDING_UNAVAILABLE');
    }
    assert.strictEqual(threwMissingKey, true);
    console.log('  -> PASSED: Key masking and missing key degradation verified.');
    passed++;
  }

  // --- TEST 2: VectorStoreManager Pure JS Storage & Cosine Similarity ---
  {
    console.log('\n[Test 2] VectorStoreManager storage & cosine similarity');
    const tmpStoreDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_vec_test_'));
    try {
      const store = new VectorStoreManager({ storeDir: tmpStoreDir });
      store.load();

      // Insert test vectors (dimension 4)
      store.upsertItems([
        {
          id: 'doc_1',
          embedding: [1, 0, 0, 0],
          title: '地球母星档案',
          category: 'planet',
          canon_level: 3,
          summary_text: '人类文明的发源地'
        },
        {
          id: 'doc_2',
          embedding: [0, 1, 0, 0],
          title: '星云空间站',
          category: 'technology',
          canon_level: 1,
          summary_text: '太空反重力中继设施'
        }
      ]);

      assert.strictEqual(store.getDimensions(), 4);
      assert.strictEqual(store.getItems().length, 2);

      // Query for vector close to doc_1
      const hits = store.search([0.9, 0.1, 0, 0], { topK: 1 });
      assert.strictEqual(hits.length, 1);
      assert.strictEqual(hits[0].item.id, 'doc_1');
      assert.ok(hits[0].score > 0.9);

      // Dimension mismatch assertion check
      let threwDimMismatch = false;
      try {
        store.upsertItems([{ id: "doc_bad", embedding: [1, 2] }]);
      } catch (e) {
        threwDimMismatch = true;
        assert.strictEqual(e.code, 'EMBEDDING_DIMENSION_MISMATCH');
      }
      assert.strictEqual(threwDimMismatch, true);

      console.log('  -> PASSED: Pure JS vector storage, cosine ranking, and dimension assertion verified.');
      passed++;
    } finally {
      fs.rmSync(tmpStoreDir, { recursive: true, force: true });
    }
  }

  // --- TEST 3: BM25 Fallback Engine ---
  {
    console.log('\n[Test 3] BM25FallbackEngine keyword & entity boosting');
    const docs = [
      { id: '1', title: '艾莉亚人设卡', summary_text: '星际领航员，拥有精神共振天赋', category: 'character', canon_level: 3, related_entities: ['艾莉亚'] },
      { id: '2', title: '重力曲率引擎', summary_text: '星际飞船的主推进装置，利用超空间跃迁', category: 'technology', canon_level: 3, related_entities: ['星云基地'] }
    ];
    const bm25 = new BM25FallbackEngine(docs);
    const res = bm25.search('领航员共振', { topK: 1 });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].item.id, '1');
    console.log('  -> PASSED: BM25 Chinese tokenization and ranking verified.');
    passed++;
  }

  // --- TEST 4: Two-stage Summary-to-Detail & Stale Tracking ---
  {
    console.log('\n[Test 4] Two-stage Retrieval & Stale Change Tracking');
    const tmpVault = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_vault_test_'));
    const tmpStore = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_store_test_'));
    try {
      // Create source lore file with headings and 2000 chars of text
      const loreDir = path.join(tmpVault, '01_设定');
      fs.mkdirSync(loreDir, { recursive: true });
      const sourceLorePath = path.join(loreDir, '反重力引擎.md');
      const fullText = [
        "---",
        "title: 反重力引擎公理",
        "canon_level: 3",
        "category: technology",
        "---",
        "# 反重力引擎公理",
        "## 核心运作法则",
        "反重力引擎通过操控引力子场，产生与行星引力等额的斥力场，实现无工质悬浮。",
        "## 能量消耗与冷却",
        "需要零点能晶体提供持续能源，过热时将自动进入休眠锁定状态。".repeat(20)
      ].join("\n");
      fs.writeFileSync(sourceLorePath, fullText, "utf8");

      // 1. Generate skeleton (verify safety gate)
      const extractor = new SummaryExtractorEngine({ vaultPath: tmpVault });
      let threwGate = false;
      try {
        extractor.generateSummarySkeletons({ confirmationToken: "WRONG_TOKEN" });
      } catch (e) {
        threwGate = true;
        assert.strictEqual(e.code, 'SAFETY_TOKEN_MISSING');
      }
      assert.strictEqual(threwGate, true);

      const genRes = extractor.generateSummarySkeletons({ confirmationToken: "CONFIRM_GENERATE_SKELETON" });
      assert.strictEqual(genRes.totalCreated, 1);

      // 2. Build index without API Key -> should gracefully allow indexing
      const retriever = new NovelLoreRetriever({
        vaultPath: tmpVault,
        config: { EMBEDDING_API_KEY: "" },
        vectorStore: new VectorStoreManager({ storeDir: tmpStore })
      });

      // Fallback search before vector embedding -> BM25 automatically triggers
      const searchRes1 = await retriever.searchWorldTree({
        query: "引力子场悬浮",
        topK: 1,
        fetchDetail: true,
        charLimit: 500
      });
      assert.strictEqual(searchRes1.status, "success");
      assert.strictEqual(searchRes1.isBm25Fallback, true);
      assert.strictEqual(searchRes1.hits.length, 1);
      assert.strictEqual(searchRes1.hits[0].isStale, false);
      assert.ok(searchRes1.hits[0].details.includes("引力子场"));
      assert.ok(searchRes1.hits[0].details.length <= 600); // capped by charLimit

      // 3. Modify source file -> Stale tracking test
      fs.appendFileSync(sourceLorePath, "\n\n【紧急修订：发现引力波共振缺陷】");
      const searchRes2 = await retriever.searchWorldTree({
        query: "引力子场悬浮",
        topK: 1,
        fetchDetail: true
      });
      assert.strictEqual(searchRes2.hits[0].isStale, true);
      assert.ok(searchRes2.hits[0].staleWarning !== null);
      console.log('  -> PASSED: Two-stage retrieval, charLimit capping, and real-time Stale detection verified.');
      passed++;
    } finally {
      fs.rmSync(tmpVault, { recursive: true, force: true });
      fs.rmSync(tmpStore, { recursive: true, force: true });
    }
  }

  // --- TEST 5: CommandDispatcher Integration & Help Listing ---
  {
    console.log('\n[Test 5] CommandDispatcher registration & help listing');
    const dispatcher = new CommandDispatcher();
    const helpRes = await dispatcher.dispatch('help', {});
    assert.ok(helpRes.availableCommands.includes('SearchWorldTree'));
    assert.ok(helpRes.availableCommands.includes('BuildSummaryIndex'));
    assert.ok(helpRes.availableCommands.includes('GenerateSummarySkeleton'));
    console.log('  -> PASSED: CommandDispatcher recognizes all 3 RAG commands.');
    passed++;
  }

  // --- TEST 6: stdio Protocol Verification (Matching VCPToolBox execution) ---
  {
    console.log('\n[Test 6] stdio Protocol Verification (Piping JSON stdin -> stdout)');
    const entryPoint = path.resolve(__dirname, '..', '..', 'NovelEngineering.js');
    const inputPayload = JSON.stringify({
      command: 'help'
    });

    const proc = spawnSync(process.execPath, [entryPoint], {
      input: inputPayload,
      encoding: 'utf8',
      timeout: 10000
    });

    assert.strictEqual(proc.status, 0, "Process exited with non-zero: " + proc.stderr);
    const outputJson = JSON.parse(proc.stdout.trim());
    assert.strictEqual(outputJson.status, 'success');
    assert.ok(outputJson.result);
    assert.ok(Array.isArray(outputJson.result.content));
    console.log('  -> PASSED: stdio JSON protocol matches VCPToolBox contract perfectly.');
    passed++;
  }

  console.log(`\n🎉 ALL ${passed}/6 TEST SUITES PASSED CLEANLY!\n`);
}

runAllTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
