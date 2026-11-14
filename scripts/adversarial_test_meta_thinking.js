// H:\VCP\VCPzhangduan\VCPToolBox\scripts\adversarial_test_meta_thinking.js
// Comprehensive Adversarial & Empirical Test Harness for Meta Thinking Chains and Physical Assets

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ACTIVE_CONFIG_PATH = path.resolve('H:/VCP/VCPzhangduan/VCPToolBox/Plugin/RAGDiaryPlugin/meta_thinking_chains.json');
const MIRROR_CONFIG_PATH = path.resolve('H:/VCP/VCPzhangduan/external_services/插件/Plugin/RAGDiaryPlugin/meta_thinking_chains.json');
const DAILYNOTE_DIR = path.resolve('H:/VCP/VCPzhangduan/VCPToolBox/dailynote');

const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    warnings: 0,
    categories: {},
    details: []
};

function logResult(status, category, name, message, extra = null) {
    const item = { status, category, name, message, extra };
    results.details.push(item);
    if (!results.categories[category]) {
        results.categories[category] = { passed: 0, failed: 0, warnings: 0 };
    }
    if (status === 'PASS') {
        results.testsPassed++;
        results.categories[category].passed++;
    } else if (status === 'FAIL') {
        results.testsFailed++;
        results.categories[category].failed++;
    } else if (status === 'WARN') {
        results.warnings++;
        results.categories[category].warnings++;
    }
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`[${icon} ${status}] [${category}] ${name}: ${message}`);
    if (extra && status !== 'PASS') {
        console.log('   Extra Details:', JSON.stringify(extra, null, 2));
    }
}

console.log('======================================================================');
console.log('  VCP EMPIRICAL CHALLENGER: ADVERSARIAL STRESS SUITE (META THINKING)  ');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// 1. JSON Parsing & Structural Integrity
// -----------------------------------------------------------------------------
let activeConfig = null;
let mirrorConfig = null;

try {
    const activeRaw = fs.readFileSync(ACTIVE_CONFIG_PATH, 'utf-8');
    activeConfig = JSON.parse(activeRaw);
    logResult('PASS', 'JSON_INTEGRITY', 'Active JSON parse', `Successfully parsed active config (${fs.statSync(ACTIVE_CONFIG_PATH).size} bytes)`);
} catch (e) {
    logResult('FAIL', 'JSON_INTEGRITY', 'Active JSON parse', `Failed to parse active JSON: ${e.message}`);
}

try {
    const mirrorRaw = fs.readFileSync(MIRROR_CONFIG_PATH, 'utf-8');
    mirrorConfig = JSON.parse(mirrorRaw);
    logResult('PASS', 'JSON_INTEGRITY', 'Mirror JSON parse', `Successfully parsed mirror config (${fs.statSync(MIRROR_CONFIG_PATH).size} bytes)`);
} catch (e) {
    logResult('FAIL', 'JSON_INTEGRITY', 'Mirror JSON parse', `Failed to parse mirror JSON: ${e.message}`);
}

// -----------------------------------------------------------------------------
// 2. Exact Mirror File Byte-Equality Check
// -----------------------------------------------------------------------------
try {
    const activeBytes = fs.readFileSync(ACTIVE_CONFIG_PATH);
    const mirrorBytes = fs.readFileSync(MIRROR_CONFIG_PATH);

    const activeHash = crypto.createHash('sha256').update(activeBytes).digest('hex');
    const mirrorHash = crypto.createHash('sha256').update(mirrorBytes).digest('hex');

    if (activeBytes.length === mirrorBytes.length && activeHash === mirrorHash) {
        logResult('PASS', 'BYTE_PARITY', 'Active vs Mirror SHA-256 Parity',
            `Byte-identical: Length=${activeBytes.length} bytes, SHA-256=${activeHash}`
        );
    } else {
        let diffOffset = -1;
        const minLen = Math.min(activeBytes.length, mirrorBytes.length);
        for (let i = 0; i < minLen; i++) {
            if (activeBytes[i] !== mirrorBytes[i]) {
                diffOffset = i;
                break;
            }
        }
        if (diffOffset === -1 && activeBytes.length !== mirrorBytes.length) {
            diffOffset = minLen;
        }
        logResult('FAIL', 'BYTE_PARITY', 'Active vs Mirror SHA-256 Parity',
            `Files differ! Active: ${activeBytes.length}B (hash:${activeHash}), Mirror: ${mirrorBytes.length}B (hash:${mirrorHash}), First diff offset: ${diffOffset}`,
            { activeLen: activeBytes.length, mirrorLen: mirrorBytes.length, diffOffset }
        );
    }
} catch (e) {
    logResult('FAIL', 'BYTE_PARITY', 'Active vs Mirror SHA-256 Parity', `Error reading files for byte comparison: ${e.message}`);
}

// -----------------------------------------------------------------------------
// 3. Physical Directory Audit & Real Filesystem Inventory
// -----------------------------------------------------------------------------
const realEntries = fs.readdirSync(DAILYNOTE_DIR, { withFileTypes: true });
const realDirNames = new Set();
const realDirMap = new Map(); // exact dir name -> info

for (const entry of realEntries) {
    if (entry.isDirectory()) {
        const dirName = entry.name;
        realDirNames.add(dirName);
        const fullDirPath = path.join(DAILYNOTE_DIR, dirName);
        try {
            const files = fs.readdirSync(fullDirPath);
            const mdFiles = files.filter(f => f.toLowerCase().endsWith('.md'));
            const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt'));
            const totalValidNodes = mdFiles.length + txtFiles.length;

            // Audit node files for zero-byte or corruption
            let corruptedCount = 0;
            for (const f of files) {
                if (f.toLowerCase().endsWith('.md') || f.toLowerCase().endsWith('.txt')) {
                    const filePath = path.join(fullDirPath, f);
                    const stats = fs.statSync(filePath);
                    if (stats.size === 0) {
                        corruptedCount++;
                    }
                }
            }

            realDirMap.set(dirName, {
                fileCount: files.length,
                mdCount: mdFiles.length,
                txtCount: txtFiles.length,
                validNodeCount: totalValidNodes,
                corruptedCount,
                files: files.slice(0, 5)
            });
        } catch (err) {
            realDirMap.set(dirName, { error: err.message });
        }
    }
}

logResult('PASS', 'PHYSICAL_SCAN', 'Dailynote Physical Catalog',
    `Found ${realDirNames.size} physical directories in ${DAILYNOTE_DIR}`
);

// -----------------------------------------------------------------------------
// 4. Chains & Clusters Invariant Testing
// -----------------------------------------------------------------------------
if (activeConfig && activeConfig.chains) {
    const chains = activeConfig.chains;
    const chainNames = Object.keys(chains);

    logResult('PASS', 'CHAINS_INVENTORY', 'Configured Chains Count',
        `Found ${chainNames.length} chains: [${chainNames.join(', ')}]`
    );

    const expectedV3Chains = ['default', 'coding', 'lightpaint', 'investigation', 'traceback', 'conjugation', 'fool', 'disco', 'eroticism'];
    const expectedLegacyChains = ['youxi', 'cenji', 'huihua', 'jiansuo', 'shendusikao'];
    const allExpected = [...expectedV3Chains, ...expectedLegacyChains];

    // Check all expected chains
    for (const exp of allExpected) {
        if (chains[exp]) {
            logResult('PASS', 'CHAIN_PRESENCE', `Chain: ${exp}`, `Required chain "${exp}" is registered`);
        } else {
            logResult('FAIL', 'CHAIN_PRESENCE', `Chain: ${exp}`, `Missing required chain "${exp}"`);
        }
    }

    const allReferencedClusters = new Map();

    for (const [chainName, chainConfig] of Object.entries(chains)) {
        if (!chainConfig || typeof chainConfig !== 'object') {
            logResult('FAIL', 'CHAIN_SCHEMA', `${chainName}`, `Chain config is not an object`);
            continue;
        }

        const clusters = chainConfig.clusters;
        const kSequence = chainConfig.kSequence;

        // Clusters array check
        if (!Array.isArray(clusters)) {
            logResult('FAIL', 'CHAIN_SCHEMA', `${chainName}.clusters`, `clusters is not an array`);
            continue;
        }
        if (clusters.length === 0) {
            logResult('FAIL', 'CHAIN_SCHEMA', `${chainName}.clusters`, `clusters array is empty`);
        }
        if (clusters.length > 32) {
            logResult('FAIL', 'BUDGET_LIMIT', `${chainName}.clusters.length`, `Length ${clusters.length} exceeds max limit of 32`);
        } else {
            logResult('PASS', 'BUDGET_LIMIT', `${chainName}.clusters.length`, `Length ${clusters.length} <= 32`);
        }

        // kSequence array check
        if (!Array.isArray(kSequence)) {
            logResult('FAIL', 'CHAIN_SCHEMA', `${chainName}.kSequence`, `kSequence is not an array`);
            continue;
        }
        if (kSequence.length === 0) {
            logResult('FAIL', 'CHAIN_SCHEMA', `${chainName}.kSequence`, `kSequence array is empty`);
        }

        // Strict length equality
        if (kSequence.length !== clusters.length) {
            logResult('FAIL', 'PARITY_CONSTRAINT', `${chainName}.length_parity`,
                `kSequence length (${kSequence.length}) !== clusters length (${clusters.length})`,
                { clustersLen: clusters.length, kSeqLen: kSequence.length }
            );
        } else {
            logResult('PASS', 'PARITY_CONSTRAINT', `${chainName}.length_parity`,
                `Strict length match: clusters=${clusters.length}, kSequence=${kSequence.length}`
            );
        }

        // kSequence value range: safe integer, 0 <= k <= 32
        let kRangeValid = true;
        kSequence.forEach((k, idx) => {
            if (!Number.isSafeInteger(k) || k < 0 || k > 32) {
                kRangeValid = false;
                logResult('FAIL', 'K_RANGE_CONSTRAINT', `${chainName}.kSequence[${idx}]`, `Invalid k=${k} (must be safe int in 0..32)`);
            }
        });
        if (kRangeValid) {
            logResult('PASS', 'K_RANGE_CONSTRAINT', `${chainName}.kSequence_values`, `All ${kSequence.length} K values are valid integers within [0, 32]`);
        }

        // Description check for V3 chains
        if (expectedV3Chains.includes(chainName)) {
            if (typeof chainConfig.description !== 'string' || chainConfig.description.trim().length === 0) {
                logResult('FAIL', 'DESCRIPTION_CHECK', `${chainName}.description`, `V3 chain "${chainName}" missing valid non-empty description`);
            } else {
                logResult('PASS', 'DESCRIPTION_CHECK', `${chainName}.description`, `V3 description present (${chainConfig.description.length} chars)`);
            }
        }

        // Collect cluster references
        clusters.forEach((cl, idx) => {
            if (!allReferencedClusters.has(cl)) {
                allReferencedClusters.set(cl, []);
            }
            allReferencedClusters.get(cl).push(`${chainName}[${idx}]`);
        });
    }

    // -------------------------------------------------------------------------
    // 5. Stress-Testing Physical Cluster Existence, Unicode & Case Sensitivity
    // -------------------------------------------------------------------------
    console.log(`\n--- ADVERSARIAL PHYSICAL ASSET MAPPING TEST (${allReferencedClusters.size} UNIQUE REFERENCED CLUSTERS) ---`);

    for (const [clusterName, references] of allReferencedClusters.entries()) {
        const refStr = references.join(', ');

        // Exact match check (case-sensitive, raw Unicode)
        const exactMatch = realDirNames.has(clusterName);

        // Unicode normalization tests
        const nfcName = clusterName.normalize('NFC');
        const nfdName = clusterName.normalize('NFD');
        let unicodeMatch = null;
        let caseInsensitiveMatch = null;

        for (const dir of realDirNames) {
            if (dir.normalize('NFC') === nfcName || dir.normalize('NFD') === nfdName) {
                unicodeMatch = dir;
            }
            if (dir.toLowerCase() === clusterName.toLowerCase()) {
                caseInsensitiveMatch = dir;
            }
        }

        if (!exactMatch) {
            if (caseInsensitiveMatch) {
                logResult('FAIL', 'PHYSICAL_CLUSTER', clusterName,
                    `CASE MISMATCH! Config has "${clusterName}", disk has "${caseInsensitiveMatch}". Refs: ${refStr}`,
                    { configCluster: clusterName, diskDir: caseInsensitiveMatch, references }
                );
            } else {
                const candidates = [];
                for (const dir of realDirNames) {
                    if (dir.includes(clusterName) || clusterName.includes(dir)) {
                        candidates.push(dir);
                    }
                }
                logResult('FAIL', 'PHYSICAL_CLUSTER', clusterName,
                    `DIRECTORY NOT FOUND ON DISK! Refs: ${refStr}. Fuzzy candidates: ${JSON.stringify(candidates)}`,
                    { configCluster: clusterName, fuzzyCandidates: candidates, references }
                );
            }
        } else {
            const info = realDirMap.get(clusterName);
            if (!info) {
                logResult('FAIL', 'PHYSICAL_CLUSTER', clusterName, `Could not inspect directory "${clusterName}"`);
            } else if (info.fileCount === 0) {
                logResult('FAIL', 'NON_EMPTY_CHECK', clusterName, `Directory is EMPTY (0 files)! Refs: ${refStr}`);
            } else if (info.validNodeCount === 0) {
                logResult('FAIL', 'NON_EMPTY_CHECK', clusterName, `Directory has 0 valid (.md / .txt) thought nodes! Refs: ${refStr}`);
            } else if (info.corruptedCount > 0) {
                logResult('FAIL', 'CORRUPTION_CHECK', clusterName, `Found ${info.corruptedCount} 0-byte corrupt nodes! Refs: ${refStr}`);
            } else {
                logResult('PASS', 'PHYSICAL_CLUSTER', clusterName,
                    `EXACT MATCH: contains ${info.validNodeCount} valid thought nodes (${info.mdCount} .md, ${info.txtCount} .txt, 0 corrupt). Refs: ${refStr}`
                );
            }
        }
    }

    // -------------------------------------------------------------------------
    // 6. Explicit Acceptance Criteria Verification
    // -------------------------------------------------------------------------
    console.log('\n--- ACCEPTANCE CRITERIA CONTRACT VERIFICATION ---');

    // default chain contract
    const defaultChain = chains['default'];
    const expectedDefaultClusters = [
        "【通用v3】前思维簇",
        "【通用v3】逻辑推理簇",
        "【通用v3】反思簇",
        "【通用v3】结果辩证簇",
        "【通用v3】陈词总结簇"
    ];
    const expectedDefaultK = [3, 2, 2, 2, 2];

    const defClustersOk = JSON.stringify(defaultChain?.clusters) === JSON.stringify(expectedDefaultClusters);
    const defKOk = JSON.stringify(defaultChain?.kSequence) === JSON.stringify(expectedDefaultK);

    if (defClustersOk && defKOk) {
        logResult('PASS', 'ACCEPTANCE_CRITERIA', 'default chain contract',
            `default chain strictly matches 5 【通用v3】 clusters and kSequence [3, 2, 2, 2, 2]`
        );
    } else {
        logResult('FAIL', 'ACCEPTANCE_CRITERIA', 'default chain contract',
            `default chain mismatch! Clusters OK: ${defClustersOk}, K-Sequence OK: ${defKOk}`,
            { actualClusters: defaultChain?.clusters, actualK: defaultChain?.kSequence }
        );
    }

    // -------------------------------------------------------------------------
    // 7. High-Stakes Exam Protocol Parsing & Whitelist Routing Simulation
    // -------------------------------------------------------------------------
    console.log('\n--- HIGH-STAKES EXAM COGNITIVE PROTOCOL SIMULATION ---');

    const examPlaceholder = '[[VCP元思考::Auto:0.75:investigation,coding,traceback,default::Group]]';
    const examRegex = /\[\[VCP元思考(?:::([\s\S]*?))?\]\]/i;
    const match = examPlaceholder.match(examRegex);

    if (!match) {
        logResult('FAIL', 'EXAM_PROTOCOL', 'Placeholder regex match', `Failed to match ${examPlaceholder}`);
    } else {
        const modifiersAndParams = match[1] || '';
        const parts = modifiersAndParams.replace(/^:+/, '').split('::').map(p => p.trim()).filter(Boolean);

        let parsedChainName = 'default';
        let parsedUseGroup = false;
        let parsedIsAuto = false;
        let parsedThreshold = 0.65;
        let parsedWhitelist = null;

        for (const part of parts) {
            const lowerPart = part.toLowerCase();
            if (lowerPart.startsWith('auto')) {
                parsedIsAuto = true;
                const autoMatch = part.match(/^auto(?::([\d.]+))?(?::(.+))?$/i);
                if (autoMatch) {
                    if (autoMatch[1]) parsedThreshold = parseFloat(autoMatch[1]);
                    if (autoMatch[2]) parsedWhitelist = autoMatch[2].split(',').map(s => s.trim()).filter(Boolean);
                }
            } else if (lowerPart === 'group') {
                parsedUseGroup = true;
            }
        }

        const protocolOk = (
            parsedIsAuto === true &&
            parsedThreshold === 0.75 &&
            parsedUseGroup === true &&
            Array.isArray(parsedWhitelist) &&
            parsedWhitelist.length === 4 &&
            parsedWhitelist.includes('investigation') &&
            parsedWhitelist.includes('coding') &&
            parsedWhitelist.includes('traceback') &&
            parsedWhitelist.includes('default')
        );

        if (protocolOk) {
            logResult('PASS', 'EXAM_PROTOCOL', 'Exam protocol parsing',
                `Parsed correctly: Auto=true, Threshold=0.75, Whitelist=[${parsedWhitelist.join(', ')}], Group=true`
            );
        } else {
            logResult('FAIL', 'EXAM_PROTOCOL', 'Exam protocol parsing',
                `Parsed incorrectly: Auto=${parsedIsAuto}, Threshold=${parsedThreshold}, Whitelist=${JSON.stringify(parsedWhitelist)}, Group=${parsedUseGroup}`
            );
        }

        // Verify that all chains in the whitelist exist in meta_thinking_chains.json
        for (const targetChain of parsedWhitelist) {
            if (chains[targetChain]) {
                logResult('PASS', 'EXAM_PROTOCOL', `Whitelist target: ${targetChain}`, `Chain "${targetChain}" is registered and ready`);
            } else {
                logResult('FAIL', 'EXAM_PROTOCOL', `Whitelist target: ${targetChain}`, `Chain "${targetChain}" is NOT registered!`);
            }
        }
    }

    // -------------------------------------------------------------------------
    // 8. MetaThinkingManager End-to-End Simulation across all 14 Chains
    // -------------------------------------------------------------------------
    console.log('\n--- SIMULATING MetaThinkingManager EXECUTION ---');

    for (const chainName of chainNames) {
        const chainConfig = chains[chainName];
        const chain = chainConfig.clusters;
        const finalKSequence = [...chainConfig.kSequence];

        // Validation logic replication from MetaThinkingManager.js lines 150-173 & 241-243
        let valid = true;
        if (!chainConfig || !chainConfig.clusters || !chainConfig.kSequence) valid = false;
        if (!Array.isArray(chain) || chain.length === 0) valid = false;
        if (!Array.isArray(finalKSequence) || finalKSequence.length === 0) valid = false;
        if (finalKSequence.length !== chain.length) valid = false;
        if (chain.length > 32 || finalKSequence.some(k => !Number.isSafeInteger(k) || k < 0 || k > 32)) valid = false;

        if (!valid) {
            logResult('FAIL', 'SIMULATION', `${chainName} validation`, `Failed runtime validation in MetaThinkingManager`);
            continue;
        }

        // Stage-by-stage traversal simulation
        let missingStage = null;
        for (let i = 0; i < chain.length; i++) {
            const cluster = chain[i];
            if (!realDirNames.has(cluster)) {
                missingStage = { stage: i + 1, cluster };
                break;
            }
        }

        if (missingStage) {
            logResult('FAIL', 'SIMULATION', `${chainName} stage traversal`,
                `Stage ${missingStage.stage} cluster "${missingStage.cluster}" does not exist in dailynote/`,
                { chainName, missingStage }
            );
        } else {
            logResult('PASS', 'SIMULATION', `${chainName} stage traversal`,
                `Simulated all ${chain.length} stages successfully with physical directories and K values`
            );
        }
    }

    // -------------------------------------------------------------------------
    // 9. Adversarial Malformed & Boundary Attacks
    // -------------------------------------------------------------------------
    console.log('\n--- ADVERSARIAL MALFORMED INPUT & BOUNDARY ATTACKS ---');

    // Attack 1: Prototype pollution lookup
    const prototypeKeys = ['__proto__', 'constructor', 'toString', 'valueOf'];
    for (const protoKey of prototypeKeys) {
        const protoConfig = chains[protoKey];
        if (!protoConfig || !protoConfig.clusters) {
            logResult('PASS', 'ADVERSARIAL_ATTACK', `Prototype lookup: ${protoKey}`, `Safely resolved to undefined/non-chain`);
        } else {
            logResult('FAIL', 'ADVERSARIAL_ATTACK', `Prototype lookup: ${protoKey}`, `Vulnerable to prototype lookup!`);
        }
    }

    // Attack 2: Case sensitivity attack on chain names
    const caseAttacks = ['Default', 'CODING', 'Coding', 'LightPaint', 'INVESTIGATION'];
    for (const attack of caseAttacks) {
        if (chains[attack]) {
            logResult('WARN', 'ADVERSARIAL_ATTACK', `Case insensitive key collision: ${attack}`, `Found chain with non-standard casing`);
        } else {
            logResult('PASS', 'ADVERSARIAL_ATTACK', `Chain key case sensitivity: ${attack}`, `Safely strict: "${attack}" does not trigger "${attack.toLowerCase()}"`);
        }
    }

    // Attack 3: Empty string & whitespace attack
    const emptyKeys = ['', ' ', '   ', '\t', '\n'];
    for (const emptyKey of emptyKeys) {
        if (chains[emptyKey]) {
            logResult('FAIL', 'ADVERSARIAL_ATTACK', `Empty chain key check`, `Found empty chain key!`);
        } else {
            logResult('PASS', 'ADVERSARIAL_ATTACK', `Empty chain key check`, `Safely rejected empty key "${emptyKey.replace(/\n/g, '\\n')}"`);
        }
    }
}

// -----------------------------------------------------------------------------
// Summary & Verdict
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log('                      ADVERSARIAL TEST SUMMARY                        ');
console.log('======================================================================');
console.log(`Total Passed:   ${results.testsPassed}`);
console.log(`Total Failed:   ${results.testsFailed}`);
console.log(`Total Warnings: ${results.warnings}`);
console.log('Category Breakdown:');
for (const [cat, data] of Object.entries(results.categories)) {
    console.log(`  - ${cat.padEnd(22)}: Passed=${data.passed}, Failed=${data.failed}, Warnings=${data.warnings}`);
}

const summaryFile = path.resolve('H:/VCP/.agents/teamwork/challenger_1/adversarial_test_results.json');
fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2), 'utf-8');
console.log(`\nDetailed JSON results exported to: ${summaryFile}`);

if (results.testsFailed > 0) {
    console.log('\n======================================================================');
    console.log('  ❌ ADVERSARIAL VERDICT: REQUEST_CHANGES (Defects Detected)          ');
    console.log('======================================================================');
    process.exit(1);
} else {
    console.log('\n======================================================================');
    console.log('  ✅ ADVERSARIAL VERDICT: APPROVE (All Stress Tests Succeeded)       ');
    console.log('======================================================================');
    process.exit(0);
}
