'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SemanticGroupManager = require('../Plugin/RAGDiaryPlugin/SemanticGroupManager');
const MetaThinkingManager = require('../Plugin/RAGDiaryPlugin/MetaThinkingManager');

const EDIT_JSON_PATH = path.resolve(__dirname, '../Plugin/RAGDiaryPlugin/semantic_groups.edit.json');
const MAIN_JSON_PATH = path.resolve(__dirname, '../Plugin/RAGDiaryPlugin/semantic_groups.json');
const CHAINS_JSON_PATH = path.resolve(__dirname, '../Plugin/RAGDiaryPlugin/meta_thinking_chains.json');
const MIRROR_CHAINS_JSON_PATH = path.resolve(__dirname, '../../external_services/插件/Plugin/RAGDiaryPlugin/meta_thinking_chains.json');
const DAILYNOTE_DIR = path.resolve(__dirname, '../dailynote');

// Subclass SemanticGroupManager to completely stub out disk-affecting initialize()
class TestSemanticGroupManager extends SemanticGroupManager {
    constructor() {
        super(null);
    }

    async initialize() {
        // Pure in-memory unit test isolation: do not touch disk or compute vectors
    }
}

function createIsolatedSGM() {
    return new TestSemanticGroupManager();
}

// Replicate RAGDiaryPlugin's exact parsing logic for [[VCP元思考...]]
function parseMetaThinkingTag(text) {
    const metaThinkingDeclarations = [...text.matchAll(/\[\[VCP元思考([^\]]*?)\]\]/g)];
    const results = [];

    for (const match of metaThinkingDeclarations) {
        const placeholder = match[0];
        const modifiersAndParams = match[1] || '';

        let chainName = 'default';
        let useGroup = false;
        let isAutoMode = false;
        let autoThreshold = 0.65;
        let autoWhitelist = null;
        let autoBlacklist = null;

        if (modifiersAndParams) {
            const parts = modifiersAndParams.replace(/^:+/, '').split('::').map(p => p.trim()).filter(Boolean);

            for (const part of parts) {
                const lowerPart = part.toLowerCase();

                if (lowerPart.startsWith('auto')) {
                    isAutoMode = true;
                    const autoMatch = part.match(/^auto(?::([\d.]+))?(?::(.+))?$/i);
                    if (autoMatch) {
                        if (autoMatch[1]) {
                            const parsedThreshold = parseFloat(autoMatch[1]);
                            if (!isNaN(parsedThreshold)) {
                                autoThreshold = parsedThreshold;
                            }
                        }
                        if (autoMatch[2]) {
                            const scopePart = autoMatch[2];
                            if (scopePart.startsWith('!')) {
                                autoBlacklist = scopePart.slice(1).split(',').map(s => s.trim()).filter(Boolean);
                            } else {
                                autoWhitelist = scopePart.split(',').map(s => s.trim()).filter(Boolean);
                            }
                        }
                    }
                    chainName = 'default';
                } else if (lowerPart === 'group') {
                    useGroup = true;
                } else if (part) {
                    if (!isAutoMode) {
                        chainName = part;
                    }
                }
            }
        }

        results.push({
            placeholder,
            chainName,
            useGroup,
            isAutoMode,
            autoThreshold,
            autoWhitelist,
            autoBlacklist
        });
    }

    return results;
}

// =========================================================================
// SUITE 1: Semantic Groups Invariant & Core Synchronization Tests
// =========================================================================
test('SUITE 1.1: Production semantic_groups.edit.json and semantic_groups.json are in perfect sync', () => {
    assert.ok(fs.existsSync(EDIT_JSON_PATH), 'semantic_groups.edit.json must exist');
    assert.ok(fs.existsSync(MAIN_JSON_PATH), 'semantic_groups.json must exist');

    const editData = JSON.parse(fs.readFileSync(EDIT_JSON_PATH, 'utf8'));
    const mainData = JSON.parse(fs.readFileSync(MAIN_JSON_PATH, 'utf8'));

    const sgm = createIsolatedSGM();
    const areDifferent = sgm._areCoreGroupDataDifferent(editData, mainData);

    assert.strictEqual(areDifferent, false, '_areCoreGroupDataDifferent(editData, mainData) must return false');
    assert.strictEqual(Object.keys(editData.groups).length, 15, 'editData must contain exactly 15 groups');
    assert.strictEqual(Object.keys(mainData.groups).length, 15, 'mainData must contain exactly 15 groups');
});

test('SUITE 1.2: Adversarial stress testing of _areCoreGroupDataDifferent against mutations', () => {
    const editData = JSON.parse(fs.readFileSync(EDIT_JSON_PATH, 'utf8'));
    const mainData = JSON.parse(fs.readFileSync(MAIN_JSON_PATH, 'utf8'));
    const sgm = createIsolatedSGM();

    // 1.2.1 Null or undefined mainData
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editData, null), true, 'Must return true if mainData is null');
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editData, undefined), true, 'Must return true if mainData is undefined');

    // 1.2.2 Mutated config
    const editWithConfig = JSON.parse(JSON.stringify(editData));
    editWithConfig.config = { minConfidence: 0.9 };
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editWithConfig, mainData), true, 'Must detect config change');

    // 1.2.3 Extra group added
    const editWithExtra = JSON.parse(JSON.stringify(editData));
    editWithExtra.groups['【未知测试簇】'] = { words: ['测试'], auto_learned: [], weight: 1.0 };
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editWithExtra, mainData), true, 'Must detect extra group');

    // 1.2.4 Group removed
    const editWithMissing = JSON.parse(JSON.stringify(editData));
    delete editWithMissing.groups['毕设'];
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editWithMissing, mainData), true, 'Must detect removed group');

    // 1.2.5 Word content modified
    const editWithModifiedWord = JSON.parse(JSON.stringify(editData));
    editWithModifiedWord.groups['【代码工程与现实编译】'].words[0] = '写代码_altered';
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editWithModifiedWord, mainData), true, 'Must detect altered word');

    // 1.2.6 Word permutation (order change) -> MUST return FALSE because words are sorted before comparison
    const editWithPermutedWords = JSON.parse(JSON.stringify(editData));
    editWithPermutedWords.groups['【代码工程与现实编译】'].words.reverse();
    assert.strictEqual(
        sgm._areCoreGroupDataDifferent(editWithPermutedWords, mainData),
        false,
        'Word permutation must NOT trigger difference (sorting invariance)'
    );

    // 1.2.7 Weight changed
    const editWithAlteredWeight = JSON.parse(JSON.stringify(editData));
    editWithAlteredWeight.groups['毕设'].weight = 2.0;
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editWithAlteredWeight, mainData), true, 'Must detect weight change');

    // 1.2.8 Auto-learned array modified
    const editWithAlteredAutoLearned = JSON.parse(JSON.stringify(editData));
    editWithAlteredAutoLearned.groups['毕设'].auto_learned = ['自动词条'];
    assert.strictEqual(sgm._areCoreGroupDataDifferent(editWithAlteredAutoLearned, mainData), true, 'Must detect auto_learned change');
});

test('SUITE 1.3: User group "毕设" strict preservation & hash cryptographic check', () => {
    const editData = JSON.parse(fs.readFileSync(EDIT_JSON_PATH, 'utf8'));
    const mainData = JSON.parse(fs.readFileSync(MAIN_JSON_PATH, 'utf8'));

    // Check editData
    assert.ok(editData.groups['毕设'], 'User group "毕设" must exist in editData');
    assert.deepStrictEqual(editData.groups['毕设'].words, ['此岸，彼岸，丧葬，']);
    assert.deepStrictEqual(editData.groups['毕设'].auto_learned, []);
    assert.strictEqual(editData.groups['毕设'].weight, 1);

    // Check mainData
    const userGroup = mainData.groups['毕设'];
    assert.ok(userGroup, 'User group "毕设" must exist in mainData');
    assert.deepStrictEqual(userGroup.words, ['此岸，彼岸，丧葬，']);
    assert.deepStrictEqual(userGroup.auto_learned, []);
    assert.strictEqual(userGroup.weight, 1);
    assert.strictEqual(userGroup.vector_id, '71dae7b2-883c-485a-8616-d79eaace8c4c', 'vector_id must match original value');
    assert.strictEqual(userGroup.words_hash, '29cabbf8644dc01f8a2d7d23b9d30dda57103026a0abf3ba00630e2722ac4104', 'words_hash must match original value');

    // Cryptographic validation of words_hash
    const sgm = createIsolatedSGM();
    const computedHash = sgm._getWordsHash(['此岸，彼岸，丧葬，']);
    assert.strictEqual(computedHash, userGroup.words_hash, 'Computed words_hash must match stored words_hash');
});

// =========================================================================
// SUITE 2: Keyword Matching Boundary & Adversarial Inputs on SemanticGroupManager
// =========================================================================
test('SUITE 2: Boundary and adversarial inputs for detectAndActivateGroups', () => {
    const sgm = createIsolatedSGM();
    const mainData = JSON.parse(fs.readFileSync(MAIN_JSON_PATH, 'utf8'));
    sgm.groups = JSON.parse(JSON.stringify(mainData.groups)); // Deep copy to avoid mutating source object

    // 2.1 Boundary: Empty string
    const resEmpty = sgm.detectAndActivateGroups('');
    assert.strictEqual(resEmpty.size, 0, 'Empty string must activate 0 groups');

    // 2.2 Boundary: Whitespace only
    const resWhitespace = sgm.detectAndActivateGroups('   \n\t\r   ');
    assert.strictEqual(resWhitespace.size, 0, 'Whitespace string must activate 0 groups');

    // 2.3 Boundary: Non-matching random string
    const resGibberish = sgm.detectAndActivateGroups('zkf_982347_non_existent_token_xyz_112233');
    assert.strictEqual(resGibberish.size, 0, 'Gibberish string must activate 0 groups');

    // 2.4 Boundary: User group exact keyword matching
    const resUserGroup = sgm.detectAndActivateGroups('本论文讨论此岸，彼岸，丧葬，相关的民俗与哲学');
    assert.ok(resUserGroup.has('毕设'), 'Must activate "毕设" group when matching its vocabulary');
    const userMatch = resUserGroup.get('毕设');
    assert.strictEqual(userMatch.strength, 1.0, 'Strength should be 1.0 (1 match / 1 word)');
    assert.deepStrictEqual(userMatch.matchedWords, ['此岸，彼岸，丧葬，']);

    // 2.5 Multi-word matching within single group
    const codeQuery = '正在调试一段代码，定位并发异步调用中的bug与异常，需要重构接口';
    const resCode = sgm.detectAndActivateGroups(codeQuery);
    assert.ok(resCode.has('【代码工程与现实编译】'), 'Must activate coding group');
    const codeMatch = resCode.get('【代码工程与现实编译】');
    assert.ok(codeMatch.matchedWords.includes('并发'));
    assert.ok(codeMatch.matchedWords.includes('异步'));
    assert.ok(codeMatch.matchedWords.includes('bug'));
    assert.ok(codeMatch.matchedWords.includes('异常'));
    assert.ok(codeMatch.matchedWords.includes('重构'));
    assert.ok(codeMatch.matchedWords.includes('接口'));
    assert.ok(codeMatch.strength > 0.1, 'Strength should reflect multiple matching words');

    // 2.6 Cross-group multi-matching collision
    const multiQuery = '进行技术方案调研与竞品分析，写代码排障并优化性能';
    const resMulti = sgm.detectAndActivateGroups(multiQuery);
    assert.ok(resMulti.has('【代码工程与现实编译】'), 'Coding group must activate');
    assert.ok(resMulti.has('【调查研究与实证实操】'), 'Investigation group must activate');

    // 2.7 Case insensitivity check
    const caseQuery = 'DEBUG THE BUG AND CHECK THE API WITH GIT PR AND COMMIT';
    const resCase = sgm.detectAndActivateGroups(caseQuery);
    assert.ok(resCase.has('【代码工程与现实编译】'), 'Must activate regardless of case');
    const matchedLower = resCase.get('【代码工程与现实编译】').matchedWords.map(w => w.toLowerCase());
    assert.ok(matchedLower.includes('debug'));
    assert.ok(matchedLower.includes('bug'));
    assert.ok(matchedLower.includes('api'));
    assert.ok(matchedLower.includes('git'));
    assert.ok(matchedLower.includes('pr'));
    assert.ok(matchedLower.includes('commit'));

    // 2.8 Stress test: massive 50,000-character payload
    const noise = '今天天气晴朗，风和日丽，云淡风轻。'.repeat(2500); // 50,000 chars
    const stressQuery = noise + ' 我们在终端进行全栈排障并部署上线。' + noise;
    const start = performance.now();
    const resStress = sgm.detectAndActivateGroups(stressQuery);
    const duration = performance.now() - start;
    assert.ok(resStress.has('【代码工程与现实编译】'), 'Must find match inside 100k+ char payload');
    assert.ok(duration < 200, `Massive payload execution took ${duration.toFixed(2)}ms, must be < 200ms`);
});

// =========================================================================
// SUITE 3: R4 Examination Protocol Regex & Parsing Logic
// =========================================================================
test('SUITE 3.1: Exact R4 Examination Protocol Parsing Specification', () => {
    const rawTag = '[[VCP元思考::Auto:0.75:investigation,coding,traceback,default::Group]]';
    const parsed = parseMetaThinkingTag(rawTag);

    assert.strictEqual(parsed.length, 1, 'Exactly one declaration must be found');
    const item = parsed[0];

    assert.strictEqual(item.isAutoMode, true, 'isAutoMode must be true');
    assert.strictEqual(item.autoThreshold, 0.75, 'autoThreshold must be 0.75');
    assert.deepStrictEqual(
        item.autoWhitelist,
        ['investigation', 'coding', 'traceback', 'default'],
        'autoWhitelist must match exact 4 whitelisted chains'
    );
    assert.strictEqual(item.useGroup, true, 'useGroup must be true');
    assert.strictEqual(item.chainName, 'default', 'chainName must be default when isAutoMode is true');
    assert.strictEqual(item.autoBlacklist, null, 'autoBlacklist must be null');
});

test('SUITE 3.2: Adversarial variations of R4 Examination Protocol tag', () => {
    // 3.2.1 Reversed parameter order: Group before Auto
    const reversed = '[[VCP元思考::Group::Auto:0.75:investigation,coding,traceback,default]]';
    const pReversed = parseMetaThinkingTag(reversed)[0];
    assert.strictEqual(pReversed.isAutoMode, true);
    assert.strictEqual(pReversed.autoThreshold, 0.75);
    assert.deepStrictEqual(pReversed.autoWhitelist, ['investigation', 'coding', 'traceback', 'default']);
    assert.strictEqual(pReversed.useGroup, true);

    // 3.2.2 Surrounding whitespace inside tag
    const spaced = '[[VCP元思考 :: Auto:0.75:investigation,coding,traceback,default :: Group ]]';
    const pSpaced = parseMetaThinkingTag(spaced)[0];
    assert.strictEqual(pSpaced.isAutoMode, true);
    assert.strictEqual(pSpaced.autoThreshold, 0.75);
    assert.deepStrictEqual(pSpaced.autoWhitelist, ['investigation', 'coding', 'traceback', 'default']);
    assert.strictEqual(pSpaced.useGroup, true);

    // 3.2.3 Case insensitivity of Auto and Group keywords
    const lower = '[[VCP元思考::auto:0.75:investigation,coding,traceback,default::group]]';
    const pLower = parseMetaThinkingTag(lower)[0];
    assert.strictEqual(pLower.isAutoMode, true);
    assert.strictEqual(pLower.autoThreshold, 0.75);
    assert.deepStrictEqual(pLower.autoWhitelist, ['investigation', 'coding', 'traceback', 'default']);
    assert.strictEqual(pLower.useGroup, true);

    // 3.2.4 Embedded in exam prompt context
    const fullPrompt = `请严格遵循客观事实与工程审计规范完成考卷：
[[VCP元思考::Auto:0.75:investigation,coding,traceback,default::Group]]
问题：请分析系统并发死锁根因并输出修复代码。`;
    const pEmbedded = parseMetaThinkingTag(fullPrompt);
    assert.strictEqual(pEmbedded.length, 1);
    assert.strictEqual(pEmbedded[0].isAutoMode, true);
    assert.strictEqual(pEmbedded[0].autoThreshold, 0.75);
    assert.strictEqual(pEmbedded[0].useGroup, true);

    // 3.2.5 Multiple tags in same message
    const multiTag = '[[VCP元思考::Auto:0.75:investigation,coding,traceback,default::Group]] 以及后续 [[VCP元思考:coding::Group]]';
    const pMulti = parseMetaThinkingTag(multiTag);
    assert.strictEqual(pMulti.length, 2);
    assert.strictEqual(pMulti[0].isAutoMode, true);
    assert.strictEqual(pMulti[1].isAutoMode, false);
    assert.strictEqual(pMulti[1].chainName, 'coding');
    assert.strictEqual(pMulti[1].useGroup, true);
});

// =========================================================================
// SUITE 4: Whitelisted Chains Validation in meta_thinking_chains.json
// =========================================================================
test('SUITE 4: Validation of all 4 whitelisted chains and cluster physical paths', () => {
    assert.ok(fs.existsSync(CHAINS_JSON_PATH), 'meta_thinking_chains.json must exist');
    assert.ok(fs.existsSync(MIRROR_CHAINS_JSON_PATH), 'Mirror meta_thinking_chains.json must exist');

    const activeRaw = fs.readFileSync(CHAINS_JSON_PATH, 'utf8');
    const mirrorRaw = fs.readFileSync(MIRROR_CHAINS_JSON_PATH, 'utf8');

    // Mirror parity assertion
    assert.strictEqual(activeRaw, mirrorRaw, 'Active and mirror meta_thinking_chains.json must be byte-identical');

    const config = JSON.parse(activeRaw);
    assert.ok(config.chains, 'chains root object must exist');

    const whitelist = ['investigation', 'coding', 'traceback', 'default'];

    for (const chainId of whitelist) {
        const chain = config.chains[chainId];
        assert.ok(chain, `Whitelisted chain "${chainId}" must exist in configuration`);

        // Check description
        assert.ok(typeof chain.description === 'string', `${chainId}.description must be string`);
        assert.ok(chain.description.trim().length >= 20, `${chainId}.description must be substantive (>20 chars)`);

        // Check clusters & kSequence
        assert.ok(Array.isArray(chain.clusters), `${chainId}.clusters must be an array`);
        assert.ok(Array.isArray(chain.kSequence), `${chainId}.kSequence must be an array`);
        assert.ok(chain.clusters.length > 0, `${chainId}.clusters cannot be empty`);
        assert.strictEqual(
            chain.clusters.length,
            chain.kSequence.length,
            `${chainId} clusters length (${chain.clusters.length}) must strictly equal kSequence length (${chain.kSequence.length})`
        );

        // Check k values
        for (let i = 0; i < chain.kSequence.length; i++) {
            const k = chain.kSequence[i];
            assert.ok(Number.isSafeInteger(k), `${chainId} kSequence[${i}] must be safe integer`);
            assert.ok(k >= 0 && k <= 32, `${chainId} kSequence[${i}] (${k}) must be between 0 and 32`);
        }

        // Verify physical directories on disk in dailynote
        for (const clusterName of chain.clusters) {
            const clusterPath = path.join(DAILYNOTE_DIR, clusterName);
            assert.ok(
                fs.existsSync(clusterPath),
                `Physical cluster directory must exist on disk: ${clusterPath}`
            );
            const stats = fs.statSync(clusterPath);
            assert.ok(stats.isDirectory(), `Cluster path must be a directory: ${clusterPath}`);

            const files = fs.readdirSync(clusterPath);
            const mdFiles = files.filter(f => f.endsWith('.md'));
            assert.ok(
                mdFiles.length > 0,
                `Cluster directory ${clusterName} must contain at least 1 markdown file, found ${mdFiles.length}`
            );
        }
    }
});

// =========================================================================
// SUITE 5: Cognitive Auto-Routing Simulation in MetaThinkingManager
// =========================================================================
test('SUITE 5: Auto-routing simulation with whitelist filtering and threshold enforcement', async () => {
    // Replicate MetaThinkingManager.processMetaThinkingChain auto-routing decision logic
    function simulateAutoRouting(themeVectors, similarities, autoThreshold, autoWhitelist, autoBlacklist) {
        let bestChain = 'default';
        let maxSimilarity = -1;

        for (const [themeName, _vec] of Object.entries(themeVectors)) {
            if (autoWhitelist && !autoWhitelist.includes(themeName)) continue;
            if (autoBlacklist && autoBlacklist.includes(themeName)) continue;

            const sim = similarities[themeName] ?? 0;
            if (sim > maxSimilarity) {
                maxSimilarity = sim;
                bestChain = themeName;
            }
        }

        let finalChainName;
        if (maxSimilarity >= autoThreshold) {
            finalChainName = bestChain;
        } else {
            finalChainName = 'default';
        }

        return { finalChainName, maxSimilarity, bestChain };
    }

    const mockThemes = {
        coding: [1],
        investigation: [1],
        traceback: [1],
        disco: [1],
        eroticism: [1],
        lightpaint: [1]
    };

    const whitelist = ['investigation', 'coding', 'traceback', 'default'];

    // Scenario A: High similarity on whitelisted chain (coding = 0.82)
    // Non-whitelisted chain (eroticism = 0.95) must be IGNORED despite higher similarity
    const simA = {
        coding: 0.82,
        investigation: 0.70,
        traceback: 0.65,
        eroticism: 0.95, // Higher, but non-whitelisted!
        disco: 0.88     // Higher, but non-whitelisted!
    };
    const resA = simulateAutoRouting(mockThemes, simA, 0.75, whitelist, null);
    assert.strictEqual(resA.finalChainName, 'coding', 'Must choose coding (0.82 >= 0.75) and ignore eroticism/disco');

    // Scenario B: Whitelisted highest similarity is sub-threshold (0.72 < 0.75)
    const simB = {
        coding: 0.72,
        investigation: 0.65,
        traceback: 0.50,
        eroticism: 0.95
    };
    const resB = simulateAutoRouting(mockThemes, simB, 0.75, whitelist, null);
    assert.strictEqual(resB.finalChainName, 'default', 'Must fall back to default when whitelisted similarity < 0.75');

    // Scenario C: Exact threshold boundary (0.75 === 0.75)
    const simC = {
        traceback: 0.75,
        coding: 0.60,
        investigation: 0.74
    };
    const resC = simulateAutoRouting(mockThemes, simC, 0.75, whitelist, null);
    assert.strictEqual(resC.finalChainName, 'traceback', 'Exact threshold match (0.75) must activate traceback');

    // Scenario D: Blacklist test
    const blacklist = ['eroticism', 'disco'];
    const simD = {
        coding: 0.70,
        disco: 0.90
    };
    const resD = simulateAutoRouting(mockThemes, simD, 0.65, null, blacklist);
    assert.strictEqual(resD.finalChainName, 'coding', 'Must exclude blacklisted disco and select coding (0.70 >= 0.65)');
});
