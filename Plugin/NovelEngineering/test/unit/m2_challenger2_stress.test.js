/**
 * @file m2_challenger2_stress.test.js
 * @description Adversarial Stress, Concurrency & Lineage Cryptographic Verification Harness for Phase 4 Milestone 2.
 * @module test/unit/m2_challenger2_stress
 * @license MIT
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const TraceManager = require('../../src/collaboration/TraceManager');
const VCPContextBuilder = require('../../src/collaboration/VCPContextBuilder');
const { PathGuard } = require('../../src/security/PathGuard');
const IncrementalIndexer = require('../../src/scanner/IncrementalIndexer');
const { CollaborationError } = require('../../src/errors');
const { createTempDir } = require('../helpers/tempDir');

describe('Phase 4 Milestone 2: Challenger 2 Empirical Stress & Cryptographic Lineage Verification Suite', () => {
  let tempEnv;
  let pluginDir;
  let vaultDir;
  let pathGuard;
  let dbManager;
  let traceManager;

  beforeEach(() => {
    tempEnv = createTempDir('m2_chal2_stress_');
    pluginDir = tempEnv.createSubdir('plugin_root');
    vaultDir = tempEnv.createSubdir('vault_root');
    fs.mkdirSync(path.join(pluginDir, 'data'), { recursive: true });

    pathGuard = new PathGuard({
      pluginRoot: pluginDir,
      vaultRoot: vaultDir
    });

    dbManager = new DatabaseManager(':memory:', { pathGuard });
    traceManager = new TraceManager(dbManager, { pathGuard });
  });

  afterEach(() => {
    if (dbManager && dbManager.isOpen()) {
      dbManager.close();
    }
    if (tempEnv && tempEnv.cleanup) {
      tempEnv.cleanup();
    }
  });

  // ==========================================================================
  // 1. Lineage Persistence Under Concurrent SQLite Writes & Upsert Contention
  // ==========================================================================
  describe('1. Concurrency, High-Throughput Writes & Upsert Contention Stress', () => {
    it('1.1: Concurrent asynchronous writes across 100 distinct snapshot IDs to SQLite WAL DB', async () => {
      // Use on-disk DB inside sandboxed pluginDir to test true file-based WAL concurrency
      const dbPath = path.join(pluginDir, 'data', 'concurrent_traces.db');
      const diskDb = DatabaseManager.initDatabase(dbPath, { pathGuard });
      const diskTraceManager = new TraceManager(diskDb, { pathGuard });

      try {
        const concurrencyCount = 100;
        const writePromises = [];

        for (let i = 0; i < concurrencyCount; i++) {
          const p = (async (index) => {
            const snapId = `snap_concurrent_${String(index).padStart(4, '0')}`;
            const dummySha = crypto.createHash('sha256').update(`item_${index}`).digest('hex');
            return diskTraceManager.saveTrace({
              snapshotId: snapId,
              projectId: index % 2 === 0 ? 'ProjectA' : 'ProjectB',
              chapterId: `Ch_${index % 10}`,
              volumeNumber: Math.floor(index / 20) + 1,
              focusEntities: [`ENT_${index}`, `ENT_${index + 1}`],
              traceItems: [
                { sourceFileId: index, sourceSystem: 'NovelEngineering', sha256: dummySha, authority: 'canon_core' },
                { sourceFileId: index + 1000, sourceSystem: 'VCP-RAG', sha256: dummySha, authority: 'semantic_candidate' }
              ],
              budgetStats: { maxTokens: 30000, estimatedTokens: 500 + index, trimmed: false }
            });
          })(i);

          writePromises.push(p);
        }

        const results = await Promise.all(writePromises);

        // Verify every write succeeded with correct hydration
        assert.strictEqual(results.length, concurrencyCount);
        for (let i = 0; i < concurrencyCount; i++) {
          assert.ok(results[i]);
          assert.strictEqual(results[i].snapshotId, `snap_concurrent_${String(i).padStart(4, '0')}`);
          assert.strictEqual(results[i].totalSources, 2);
          assert.strictEqual(results[i].traceItems.length, 2);
        }

        // Verify database total count
        assert.strictEqual(diskDb.contextTraces.count(), concurrencyCount);
        assert.strictEqual(diskDb.contextTraces.count({ projectId: 'ProjectA' }), 50);
        assert.strictEqual(diskDb.contextTraces.count({ projectId: 'ProjectB' }), 50);
      } finally {
        if (diskDb && diskDb.isOpen()) diskDb.close();
      }
    });

    it('1.2: Extreme Upsert Contention: 50 concurrent writes targeting the EXACT same snapshotId', async () => {
      const dbPath = path.join(pluginDir, 'data', 'upsert_race.db');
      const diskDb = DatabaseManager.initDatabase(dbPath, { pathGuard });
      const diskTraceManager = new TraceManager(diskDb, { pathGuard });

      try {
        const targetSnapshotId = 'snap_upsert_collision_target';
        const contentionCount = 50;
        const racePromises = [];

        for (let i = 0; i < contentionCount; i++) {
          const p = (async (version) => {
            const fakeSha = crypto.createHash('sha256').update(`v_${version}`).digest('hex');
            return diskTraceManager.saveTrace({
              snapshotId: targetSnapshotId,
              traceId: `trc_version_${version}`,
              projectId: 'ContentionProject',
              chapterId: `Ch_${version}`,
              totalSources: version + 1,
              traceItems: Array.from({ length: version + 1 }, (_, idx) => ({
                sourceFileId: idx,
                sha256: fakeSha,
                authority: 'canon_core'
              })),
              budgetStats: { version, timestamp: Date.now() }
            });
          })(i);

          racePromises.push(p);
        }

        const results = await Promise.all(racePromises);

        // All 50 promises must resolve cleanly without crashing SQLite ON CONFLICT DO UPDATE
        assert.strictEqual(results.length, contentionCount);

        // Exactly ONE single record must exist in the database for this snapshotId
        assert.strictEqual(diskDb.contextTraces.count(), 1);

        const finalRecord = diskTraceManager.getTraceBySnapshotId(targetSnapshotId);
        assert.ok(finalRecord);
        assert.strictEqual(finalRecord.snapshotId, targetSnapshotId);
        assert.strictEqual(finalRecord.projectId, 'ContentionProject');
        assert.ok(finalRecord.totalSources >= 1 && finalRecord.totalSources <= 50);
        assert.strictEqual(finalRecord.traceItems.length, finalRecord.totalSources);
      } finally {
        if (diskDb && diskDb.isOpen()) diskDb.close();
      }
    });

    it('1.3: Interleaved Read/Write Under Load (Reader-Writer Non-Blocking Integrity)', async () => {
      const dbPath = path.join(pluginDir, 'data', 'interleaved_rw.db');
      const diskDb = DatabaseManager.initDatabase(dbPath, { pathGuard });
      const diskTraceManager = new TraceManager(diskDb, { pathGuard });

      try {
        // Pre-populate 20 records
        for (let i = 0; i < 20; i++) {
          diskTraceManager.saveTrace({
            snapshotId: `snap_pre_${i}`,
            projectId: 'RWProject',
            traceItems: [{ file: `f_${i}.md`, sha256: 'a'.repeat(64) }]
          });
        }

        const operations = [];

        // Launch 40 writes and 60 concurrent reads
        for (let i = 0; i < 100; i++) {
          if (i % 2 === 0) {
            // Write op
            operations.push((async (idx) => {
              return diskTraceManager.saveTrace({
                snapshotId: `snap_dynamic_${idx}`,
                projectId: 'RWProject',
                traceItems: [{ file: `dyn_${idx}.md`, sha256: 'b'.repeat(64) }]
              });
            })(i));
          } else {
            // Read op
            operations.push((async (idx) => {
              const target = `snap_pre_${idx % 20}`;
              const res = diskTraceManager.getTraceBySnapshotId(target);
              assert.ok(res);
              assert.strictEqual(res.snapshotId, target);
              return res;
            })(i));
          }
        }

        const allOps = await Promise.all(operations);
        assert.strictEqual(allOps.length, 100);
        assert.strictEqual(diskDb.contextTraces.count(), 70); // 20 pre + 50 new
      } finally {
        if (diskDb && diskDb.isOpen()) diskDb.close();
      }
    });

    it('1.4: Massive Payload Stress: 1000 items with full metadata per trace', () => {
      const largeItemCount = 1000;
      const traceItems = [];

      for (let i = 0; i < largeItemCount; i++) {
        traceItems.push({
          sourceFileId: i + 1,
          sourceFilePath: `01_World/Sub/LongPath_${i}/File_${i}.md`,
          sourceSystem: i % 3 === 0 ? 'NovelEngineering' : i % 3 === 1 ? 'VCP-RAG' : 'UserDirective',
          authority: i % 2 === 0 ? 'canon_core' : 'semantic_candidate',
          sha256: crypto.createHash('sha256').update(`large_content_${i}`).digest('hex'),
          entityId: `ENT_${i}`,
          category: 'world_rule',
          priority: (i % 11) + 1
        });
      }

      const saved = traceManager.saveTrace({
        snapshotId: 'snap_massive_1000',
        projectId: 'StressProject',
        chapterId: 'MegaChapter',
        volumeNumber: 99,
        focusEntities: Array.from({ length: 50 }, (_, idx) => `ENT_${idx}`),
        totalSources: largeItemCount,
        traceItems,
        budgetStats: { maxTokens: 100000, estimatedTokens: 85000, trimmed: true, omittedSourceCount: 150 },
        sourceSystems: ['NovelEngineering', 'VCP-RAG', 'UserDirective'],
        authorities: { canon_core: 500, semantic_candidate: 500 }
      });

      assert.ok(saved);
      assert.strictEqual(saved.totalSources, largeItemCount);
      assert.strictEqual(saved.traceItems.length, largeItemCount);

      const retrieved = traceManager.getTraceBySnapshotId('snap_massive_1000');
      assert.ok(retrieved);
      assert.strictEqual(retrieved.totalSources, largeItemCount);
      assert.strictEqual(retrieved.traceItems.length, largeItemCount);
      assert.strictEqual(retrieved.focusEntities.length, 50);
      assert.strictEqual(retrieved.traceItems[999].sourceFileId, 1000);
    });
  });

  // ==========================================================================
  // 2. verifySnapshotIntegrity Live File Tampering & Cryptographic Detection
  // ==========================================================================
  describe('2. verifySnapshotIntegrity Live Disk Tampering & State Transitions', () => {
    it('2.1: Single-byte live file tampering transitions status from INTACT to COMPROMISED', () => {
      const testDir = tempEnv.createSubdir('01_Canon');
      const testFile = path.join(testDir, 'axiom.md');
      const initialContent = '# Fundamental Axiom\nConservation of energy holds unconditionally in Sector 7.';
      fs.writeFileSync(testFile, initialContent, 'utf8');

      const expectedSha256 = crypto.createHash('sha256').update(fs.readFileSync(testFile)).digest('hex').toLowerCase();

      traceManager.saveTrace({
        snapshotId: 'snap_tamper_single_byte',
        projectId: 'TamperTest',
        traceItems: [
          { sourceFileId: 101, sourceFilePath: testFile, sha256: expectedSha256, authority: 'canon_core' }
        ]
      });

      // 1. Verify initially INTACT
      const initialReport = traceManager.verifySnapshotIntegrity('snap_tamper_single_byte', tempEnv.path);
      assert.strictEqual(initialReport.valid, true);
      assert.strictEqual(initialReport.integrityStatus, 'INTACT');
      assert.strictEqual(initialReport.matchedSources, 1);
      assert.strictEqual(initialReport.mismatchedSources, 0);
      assert.strictEqual(initialReport.details[0].status, 'MATCHED');

      // 2. Tamper by changing single character '7' to '8'
      const tamperedContent = '# Fundamental Axiom\nConservation of energy holds unconditionally in Sector 8.';
      fs.writeFileSync(testFile, tamperedContent, 'utf8');

      const tamperedReport = traceManager.verifySnapshotIntegrity('snap_tamper_single_byte', tempEnv.path);
      assert.strictEqual(tamperedReport.valid, false);
      assert.strictEqual(tamperedReport.integrityStatus, 'COMPROMISED');
      assert.strictEqual(tamperedReport.matchedSources, 0);
      assert.strictEqual(tamperedReport.mismatchedSources, 1);
      assert.strictEqual(tamperedReport.missingSources, 0);
      assert.strictEqual(tamperedReport.details[0].status, 'HASH_MISMATCH');
      assert.strictEqual(tamperedReport.details[0].expectedSha256, expectedSha256);
      assert.notStrictEqual(tamperedReport.details[0].liveSha256, expectedSha256);
      assert.ok(tamperedReport.details[0].error.includes('SHA-256 mismatch'));

      // 3. Revert tampering back to exact initial content -> must transition back to INTACT
      fs.writeFileSync(testFile, initialContent, 'utf8');
      const revertedReport = traceManager.verifySnapshotIntegrity('snap_tamper_single_byte', tempEnv.path);
      assert.strictEqual(revertedReport.valid, true);
      assert.strictEqual(revertedReport.integrityStatus, 'INTACT');
      assert.strictEqual(revertedReport.matchedSources, 1);
      assert.strictEqual(revertedReport.mismatchedSources, 0);
    });

    it('2.2: Multi-File Partial Tampering & Status Breakdown Matrix', () => {
      const testDir = tempEnv.createSubdir('02_MultiTamper');
      const files = [];
      const traceItems = [];

      for (let i = 0; i < 10; i++) {
        const filePath = path.join(testDir, `rule_${i}.md`);
        const content = `Rule ${i} content specification payload.`;
        fs.writeFileSync(filePath, content, 'utf8');
        const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex').toLowerCase();
        files.push({ filePath, content, hash });
        traceItems.push({
          sourceFileId: i + 1,
          sourceFilePath: filePath,
          sha256: hash,
          authority: 'canon_core'
        });
      }

      traceManager.saveTrace({
        snapshotId: 'snap_multi_10_files',
        projectId: 'MatrixProject',
        totalSources: 10,
        traceItems
      });

      // Initially all 10 intact
      const rep1 = traceManager.verifySnapshotIntegrity('snap_multi_10_files', tempEnv.path);
      assert.strictEqual(rep1.valid, true);
      assert.strictEqual(rep1.matchedSources, 10);
      assert.strictEqual(rep1.mismatchedSources, 0);
      assert.strictEqual(rep1.missingSources, 0);

      // Tamper 3 files (index 2, 5, 8)
      fs.writeFileSync(files[2].filePath, 'Tampered rule 2', 'utf8');
      fs.writeFileSync(files[5].filePath, 'Tampered rule 5', 'utf8');
      fs.writeFileSync(files[8].filePath, 'Tampered rule 8', 'utf8');

      const rep2 = traceManager.verifySnapshotIntegrity('snap_multi_10_files', tempEnv.path);
      assert.strictEqual(rep2.valid, false);
      assert.strictEqual(rep2.integrityStatus, 'COMPROMISED');
      assert.strictEqual(rep2.totalSources, 10);
      assert.strictEqual(rep2.matchedSources, 7);
      assert.strictEqual(rep2.mismatchedSources, 3);
      assert.strictEqual(rep2.missingSources, 0);

      const statusMap = rep2.details.reduce((acc, d) => {
        acc[d.sourceFileId] = d.status;
        return acc;
      }, {});

      assert.strictEqual(statusMap[1], 'MATCHED');
      assert.strictEqual(statusMap[2], 'MATCHED');
      assert.strictEqual(statusMap[3], 'HASH_MISMATCH'); // index 2 -> sourceFileId 3
      assert.strictEqual(statusMap[4], 'MATCHED');
      assert.strictEqual(statusMap[5], 'MATCHED');
      assert.strictEqual(statusMap[6], 'HASH_MISMATCH'); // index 5 -> sourceFileId 6
      assert.strictEqual(statusMap[7], 'MATCHED');
      assert.strictEqual(statusMap[8], 'MATCHED');
      assert.strictEqual(statusMap[9], 'HASH_MISMATCH'); // index 8 -> sourceFileId 9
      assert.strictEqual(statusMap[10], 'MATCHED');
    });

    it('2.3: Cryptographic Sensitivity to Whitespace, Newlines and Unicode Nulls', () => {
      const testDir = tempEnv.createSubdir('03_Whitespace');
      const testFile = path.join(testDir, 'strict_formatting.md');
      const original = 'Line 1\nLine 2\n';
      fs.writeFileSync(testFile, original, 'utf8');

      const originalHash = crypto.createHash('sha256').update(original, 'utf8').digest('hex').toLowerCase();

      traceManager.saveTrace({
        snapshotId: 'snap_formatting_strict',
        traceItems: [{ sourceFilePath: testFile, sha256: originalHash }]
      });

      // 1. Change \n to \r\n (CRLF mutation)
      fs.writeFileSync(testFile, 'Line 1\r\nLine 2\r\n', 'utf8');
      let report = traceManager.verifySnapshotIntegrity('snap_formatting_strict', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.details[0].status, 'HASH_MISMATCH');

      // 2. Trailing space mutation
      fs.writeFileSync(testFile, 'Line 1 \nLine 2\n', 'utf8');
      report = traceManager.verifySnapshotIntegrity('snap_formatting_strict', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.details[0].status, 'HASH_MISMATCH');

      // 3. Zero-byte file mutation
      fs.writeFileSync(testFile, '', 'utf8');
      report = traceManager.verifySnapshotIntegrity('snap_formatting_strict', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.details[0].liveSha256, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });
  });

  // ==========================================================================
  // 3. Missing Files & Filesystem Anomaly Handling
  // ==========================================================================
  describe('3. Missing Files, Deletions & Filesystem Anomalies', () => {
    it('3.1: Physical File Deletion Triggers FILE_MISSING Without Throwing Unhandled Exception', () => {
      const testDir = tempEnv.createSubdir('04_Deleted');
      const fileA = path.join(testDir, 'fileA.md');
      const fileB = path.join(testDir, 'fileB.md');

      fs.writeFileSync(fileA, 'File A Content', 'utf8');
      fs.writeFileSync(fileB, 'File B Content', 'utf8');

      const hashA = crypto.createHash('sha256').update(fs.readFileSync(fileA)).digest('hex');
      const hashB = crypto.createHash('sha256').update(fs.readFileSync(fileB)).digest('hex');

      traceManager.saveTrace({
        snapshotId: 'snap_deletion_test',
        traceItems: [
          { sourceFileId: 1, sourceFilePath: fileA, sha256: hashA },
          { sourceFileId: 2, sourceFilePath: fileB, sha256: hashB }
        ]
      });

      // Delete fileA from disk
      fs.unlinkSync(fileA);

      const report = traceManager.verifySnapshotIntegrity('snap_deletion_test', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.totalSources, 2);
      assert.strictEqual(report.matchedSources, 1);
      assert.strictEqual(report.missingSources, 1);
      assert.strictEqual(report.mismatchedSources, 0);

      const missingDetail = report.details.find(d => d.sourceFileId === 1);
      assert.ok(missingDetail);
      assert.strictEqual(missingDetail.status, 'FILE_MISSING');
      assert.strictEqual(missingDetail.liveSha256, null);
      assert.ok(missingDetail.error.includes('File does not exist'));
    });

    it('3.2: Compound Chaos: Tampered + Missing + Matched + Virtual in Same Snapshot', () => {
      const testDir = tempEnv.createSubdir('05_Chaos');
      const fileMatched = path.join(testDir, 'matched.md');
      const fileTampered = path.join(testDir, 'tampered.md');
      const fileMissing = path.join(testDir, 'missing.md');

      fs.writeFileSync(fileMatched, 'Matched content', 'utf8');
      fs.writeFileSync(fileTampered, 'Original content', 'utf8');
      fs.writeFileSync(fileMissing, 'Will be deleted', 'utf8');

      const hashMatched = crypto.createHash('sha256').update(fs.readFileSync(fileMatched)).digest('hex');
      const hashTampered = crypto.createHash('sha256').update(fs.readFileSync(fileTampered)).digest('hex');
      const hashMissing = crypto.createHash('sha256').update(fs.readFileSync(fileMissing)).digest('hex');
      const hashVirtual = crypto.createHash('sha256').update('In-memory directive').digest('hex');

      traceManager.saveTrace({
        snapshotId: 'snap_compound_chaos',
        traceItems: [
          { sourceFileId: 1, sourceFilePath: fileMatched, sha256: hashMatched },
          { sourceFileId: 2, sourceFilePath: fileTampered, sha256: hashTampered },
          { sourceFileId: 3, sourceFilePath: fileMissing, sha256: hashMissing },
          { sourceFileId: null, sourceFilePath: null, sha256: hashVirtual, authority: 'author_directive' }
        ]
      });

      // Apply chaos: tamper file 2 and delete file 3
      fs.writeFileSync(fileTampered, 'Malicious modification', 'utf8');
      fs.unlinkSync(fileMissing);

      const report = traceManager.verifySnapshotIntegrity('snap_compound_chaos', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.totalSources, 4);
      assert.strictEqual(report.matchedSources, 2); // 1 physical matched + 1 virtual verified
      assert.strictEqual(report.mismatchedSources, 1);
      assert.strictEqual(report.missingSources, 1);

      assert.strictEqual(report.details[0].status, 'MATCHED');
      assert.strictEqual(report.details[1].status, 'HASH_MISMATCH');
      assert.strictEqual(report.details[2].status, 'FILE_MISSING');
      assert.strictEqual(report.details[3].status, 'VIRTUAL_VERIFIED');
    });

    it('3.3: Directory Path Collision (Path points to directory instead of file)', () => {
      const subDir = tempEnv.createSubdir('directory_as_file.md');
      const fakeSha = crypto.createHash('sha256').update('dir_content').digest('hex');

      traceManager.saveTrace({
        snapshotId: 'snap_dir_collision',
        traceItems: [{ sourceFilePath: subDir, sha256: fakeSha }]
      });

      // Reading directory as a file via readFileSync should result in READ_ERROR without throwing
      const report = traceManager.verifySnapshotIntegrity('snap_dir_collision', tempEnv.path);
      assert.strictEqual(report.valid, false);
      assert.strictEqual(report.integrityStatus, 'COMPROMISED');
      assert.strictEqual(report.mismatchedSources, 1);
      assert.strictEqual(report.details[0].status, 'READ_ERROR');
      assert.ok(report.details[0].error.length > 0);
    });
  });

  // ==========================================================================
  // 4. Virtual Sources vs Physical Files Integrity & Alternate Field Aliases
  // ==========================================================================
  describe('4. Virtual Sources vs Physical Files & Alternate Field Schemas', () => {
    it('4.1: Pure Virtual In-Memory Snapshot Verification', () => {
      const dirSha = crypto.createHash('sha256').update('Directive: Focus on propulsion physics').digest('hex');
      const memSha = crypto.createHash('sha256').update('DailyNote: Captain was promoted').digest('hex');
      const candSha = crypto.createHash('sha256').update('RAG: Plasma reactor dynamics').digest('hex');

      traceManager.saveTrace({
        snapshotId: 'snap_pure_virtual',
        traceItems: [
          { sourceFileId: null, sourceFilePath: null, sha256: dirSha, authority: 'author_directive' },
          { sourceFileId: null, filePath: null, sha256Hash: memSha, authority: 'reviewed_memory' },
          { sourceFileId: null, source_file_path: null, sha256: candSha, authority: 'semantic_candidate' }
        ]
      });

      const report = traceManager.verifySnapshotIntegrity('snap_pure_virtual');
      assert.strictEqual(report.valid, true);
      assert.strictEqual(report.integrityStatus, 'INTACT');
      assert.strictEqual(report.totalSources, 3);
      assert.strictEqual(report.matchedSources, 3);
      assert.strictEqual(report.mismatchedSources, 0);
      assert.strictEqual(report.missingSources, 0);
      assert.strictEqual(report.details[0].status, 'VIRTUAL_VERIFIED');
      assert.strictEqual(report.details[1].status, 'VIRTUAL_VERIFIED');
      assert.strictEqual(report.details[2].status, 'VIRTUAL_VERIFIED');
    });

    it('4.2: Field Name Compatibility Matrix (camelCase vs snake_case)', () => {
      const testDir = tempEnv.createSubdir('06_Aliases');
      const testFile = path.join(testDir, 'alias_file.md');
      fs.writeFileSync(testFile, 'Alias file body', 'utf8');
      const hash = crypto.createHash('sha256').update(fs.readFileSync(testFile)).digest('hex');

      traceManager.saveTrace({
        snapshot_id: 'snap_snake_case_01',
        trace_items: [
          { source_file_id: 88, source_file_path: testFile, sha256: hash }
        ]
      });

      const report = traceManager.verifySnapshotIntegrity('snap_snake_case_01', tempEnv.path);
      assert.strictEqual(report.valid, true);
      assert.strictEqual(report.integrityStatus, 'INTACT');
      assert.strictEqual(report.details[0].sourceFileId, 88);
      assert.strictEqual(report.details[0].status, 'MATCHED');
    });

    it('4.3: Virtual Items with Missing or Non-64-Hex SHA256 Are Handled Without Crashing', () => {
      traceManager.saveTrace({
        snapshotId: 'snap_virtual_corrupt_hash',
        traceItems: [
          { sourceFileId: null, sourceFilePath: null, sha256: 'short_hash', authority: 'author_directive' },
          { sourceFileId: null, sourceFilePath: null, sha256: null, authority: 'semantic_candidate' }
        ]
      });

      const report = traceManager.verifySnapshotIntegrity('snap_virtual_corrupt_hash');
      // Virtual items with invalid hashes are skipped and not falsely marked MATCHED
      assert.strictEqual(report.valid, true); // No mismatched or missing physical sources
      assert.strictEqual(report.matchedSources, 0);
    });
  });

  // ==========================================================================
  // 5. Malformed Payloads, Invalid Snapshot IDs & Edge Error Handling
  // ==========================================================================
  describe('5. Malformed Payloads, Invalid Snapshot IDs & Edge Error Handling', () => {
    it('5.1: verifySnapshotIntegrity on non-existent snapshot throws CollaborationError TRACE_NOT_FOUND', () => {
      assert.throws(
        () => traceManager.verifySnapshotIntegrity('snap_absolutely_does_not_exist'),
        (err) => {
          return err instanceof CollaborationError &&
                 err.code === CollaborationError.CODES.TRACE_NOT_FOUND &&
                 err.message.includes('Context trace not found');
        }
      );
    });

    it('5.2: verifySnapshotIntegrity with null/undefined/empty string throws TRACE_NOT_FOUND', () => {
      assert.throws(
        () => traceManager.verifySnapshotIntegrity(''),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceManager.verifySnapshotIntegrity(null),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceManager.verifySnapshotIntegrity(undefined),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );
    });

    it('5.3: getTraceBySnapshotId & getTraceById edge cases return null safely', () => {
      assert.strictEqual(traceManager.getTraceBySnapshotId(''), null);
      assert.strictEqual(traceManager.getTraceBySnapshotId(null), null);
      assert.strictEqual(traceManager.getTraceBySnapshotId(undefined), null);
      assert.strictEqual(traceManager.getTraceById(''), null);
      assert.strictEqual(traceManager.getTraceById(null), null);
      assert.strictEqual(traceManager.getTraceById(undefined), null);
    });

    it('5.4: saveTrace payload validation rejects invalid or empty structures', () => {
      assert.throws(
        () => traceManager.saveTrace(null),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceManager.saveTrace('invalid string payload'),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceManager.saveTrace({ projectId: 'ProjectWithoutSnapshotId' }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );

      assert.throws(
        () => traceManager.saveTrace({ snapshotId: 'snap_no_trace_items' }),
        (err) => err instanceof CollaborationError && err.code === CollaborationError.CODES.TRACE_NOT_FOUND
      );
    });

    it('5.5: DatabaseManager delegation getContextTrace resolves snapshotId or traceId interchangeably', () => {
      const saved = dbManager.saveContextTrace({
        snapshotId: 'snap_delegation_dual',
        traceId: 'trc_custom_dual_99',
        projectId: 'DualLookupProject',
        traceItems: [{ file: 'test.md', sha256: 'f'.repeat(64) }]
      });

      assert.ok(saved);

      // Lookup by snapshotId
      const bySnap = dbManager.getContextTrace('snap_delegation_dual');
      assert.ok(bySnap);
      assert.strictEqual(bySnap.snapshotId, 'snap_delegation_dual');
      assert.strictEqual(bySnap.traceId, 'trc_custom_dual_99');

      // Lookup by traceId
      const byTrace = dbManager.getContextTrace('trc_custom_dual_99');
      assert.ok(byTrace);
      assert.strictEqual(byTrace.snapshotId, 'snap_delegation_dual');
      assert.strictEqual(byTrace.traceId, 'trc_custom_dual_99');
    });

    it('5.6: TraceManager constructor guard throws if dbManager is missing', () => {
      assert.throws(
        () => new TraceManager(null),
        (err) => err instanceof CollaborationError && err.message.includes('DatabaseManager is required')
      );
    });

    it('5.7: TraceManager methods throw if contextTraces repo is unmounted', () => {
      const mockDb = { isOpen: () => true }; // missing contextTraces
      const unmountedManager = new TraceManager(mockDb);

      assert.throws(
        () => unmountedManager.saveTrace({ snapshotId: 'snap_unmounted', traceItems: [] }),
        (err) => err instanceof CollaborationError && err.message.includes('ContextTraceRepo is not mounted')
      );
    });
  });

  // ==========================================================================
  // 6. End-to-End Lineage Generation & Verification with VCPContextBuilder
  // ==========================================================================
  describe('6. End-to-End Context Compilation to Lineage Verification Workflow', () => {
    it('6.1: Full Pipeline: BuildVCPContext with synced vault records auto-persists trace and verifySnapshotIntegrity validates it', async () => {
      // 1. Setup real vault files with markdown frontmatter
      const worldDir = path.join(vaultDir, '01_Worldview');
      const planetDir = path.join(vaultDir, '02_Entities', 'Planets');
      fs.mkdirSync(worldDir, { recursive: true });
      fs.mkdirSync(planetDir, { recursive: true });

      const axiomFile = path.join(worldDir, 'Axioms.md');
      fs.writeFileSync(
        axiomFile,
        '---\ncategory: worldview_setting\nstatus: canonical\nreview_status: confirmed\n---\n# 宇宙公理\n曲率航行上限为100c。',
        'utf8'
      );

      const planetFile = path.join(planetDir, 'GrayPort.md');
      fs.writeFileSync(
        planetFile,
        '---\nid: PL-007\nname: 灰港星\ncategory: planet\nstatus: canonical\nreview_status: confirmed\naliases: ["灰港"]\n---\n# 灰港星\n灰港星主要港口设施。',
        'utf8'
      );

      // 2. Index vault to SQLite
      await IncrementalIndexer.sync(vaultDir, dbManager);

      // 3. Build context with VCPContextBuilder
      const builder = new VCPContextBuilder(dbManager, { traceManager });

      const contextSnapshot = builder.buildContext({
        projectId: '灰港工程',
        chapterId: 'Vol1_Ch01',
        focusEntities: ['灰港星'],
        authorDirectives: ['保持技术严谨性'],
        vcpMemoryRefs: [{ memoryId: 'mem_1', title: 'Prior Survey', content: 'Survey of GrayPort confirmed intact.' }],
        semanticCandidates: [{ candidateId: 'cand_1', title: 'Dock Specs', content: 'Standard docking bay specs.' }]
      });

      assert.ok(contextSnapshot.snapshotId);
      assert.ok(contextSnapshot.sourceTrace.length >= 3);

      // 4. Retrieve persisted trace from SQLite
      const retrievedTrace = traceManager.getTraceBySnapshotId(contextSnapshot.snapshotId);
      assert.ok(retrievedTrace);
      assert.strictEqual(retrievedTrace.snapshotId, contextSnapshot.snapshotId);
      assert.strictEqual(retrievedTrace.projectId, '灰港工程');

      // 5. Verify cryptographic snapshot integrity against disk
      const integrityReport = traceManager.verifySnapshotIntegrity(contextSnapshot.snapshotId, vaultDir);
      assert.strictEqual(integrityReport.valid, true);
      assert.strictEqual(integrityReport.integrityStatus, 'INTACT');
      assert.ok(integrityReport.matchedSources >= 3);
      assert.strictEqual(integrityReport.mismatchedSources, 0);
      assert.strictEqual(integrityReport.missingSources, 0);

      // 6. Tamper with GrayPort.md on disk
      fs.writeFileSync(
        planetFile,
        '---\nid: PL-007\nname: 灰港星\ncategory: planet\nstatus: canonical\nreview_status: confirmed\naliases: ["灰港"]\n---\n# 灰港星\n[恶意篡改] 港口已被虚空彻底湮灭。',
        'utf8'
      );

      const tamperedReport = traceManager.verifySnapshotIntegrity(contextSnapshot.snapshotId, vaultDir);
      assert.strictEqual(tamperedReport.valid, false);
      assert.strictEqual(tamperedReport.integrityStatus, 'COMPROMISED');
      assert.ok(tamperedReport.mismatchedSources >= 1);
    });
  });
});
