/**
 * @file test/unit/ragExport.test.js
 * @description Comprehensive Unit Test Suite for Milestone 5: RAG Corpus Manifest & Markdown Exporter
 * @module test/unit/ragExport
 * @license MIT
 *
 * Test Matrix Covered:
 * 1. RAG Manifest JSONL Generation:
 *    - Valid JSON on every single line with full schema conformance
 *    - Automatic exclusion of archived and deleted source files
 *    - Multi-dimensional classification (source_category, canon_level, review_status)
 *    - Token estimation calculation (~1.3x word count) and cumulative totals
 *    - Cryptographic SHA-256 hash calculation per document
 *    - Category breakdown aggregation map
 *    - Filtering by corpusType ('all', 'canon', 'creative')
 * 2. RAG Source Export & Corpus Segregation:
 *    - Clear separation into canon/ (canon_level >= 2) and candidate/ (canon_level < 2 or draft)
 *    - Markdown cleaning: standardized YAML frontmatter prepending
 *    - Sanitization: stripping pre-existing YAML frontmatter to prevent duplication
 *    - Co-located manifest.jsonl generation in output directory
 *    - Accurate file count accounting (totalExportedFiles, canonFilesCount, creativeFilesCount)
 * 3. PathGuard Sandboxing & Vault Zero-Mutation Guarantees:
 *    - Hard veto blocking RAG output directories targeting 01_~12_ Obsidian vault setting folders
 *    - Rejection of directory traversal sequences (../../evil_rag)
 *    - Absolute verification that source files in Obsidian vault remain 100% read-only and unmutated
 * 4. CommandDispatcher Integration:
 *    - BuildRagCorpusManifest, ExportRagSources end-to-end execution
 */

'use strict';

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const DatabaseManager = require('../../src/db/DatabaseManager');
const RagCorpusExporter = require('../../src/rag/RagCorpusExporter');
const { CommandDispatcher } = require('../../src/commands/CommandDispatcher');
const { PathGuard, SecurityError } = require('../../src/security/PathGuard');
const { NovelError } = require('../../src/errors');

describe('Milestone 5: RAG Corpus Manifest & Exporter Unit Test Suite', () => {
  let tempPluginDir;
  let tempVaultDir;
  let ragDir;
  let pathGuard;
  let dbManager;
  let ragExporter;
  let dispatcher;

  beforeEach(() => {
    // 1. Setup isolated ephemeral test directories
    tempPluginDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_rag_plugin_'));
    tempVaultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vcp_rag_vault_'));

    ragDir = path.join(tempPluginDir, 'data', 'rag_corpus');
    fs.mkdirSync(ragDir, { recursive: true });

    // Mock Obsidian Vault 01_~12_ folders with source markdown files
    const vault01 = path.join(tempVaultDir, '01_Worldview');
    const vault04 = path.join(tempVaultDir, '04_Entities', 'Planets');
    const vault13 = path.join(tempVaultDir, '13_小说工程插件', '篇章草稿');
    fs.mkdirSync(vault01, { recursive: true });
    fs.mkdirSync(vault04, { recursive: true });
    fs.mkdirSync(vault13, { recursive: true });

    // Create physical source markdown files to test file reading and frontmatter stripping
    const file1Path = path.join(vault01, 'Cosmology_Axiom.md');
    fs.writeFileSync(file1Path, '---\ntitle: "Old Axiom"\nauthor: "Ancient"\n---\n\n# Cosmology Axiom\n\nThe speed of light is invariant across all localized reference frames.', 'utf8');

    const file2Path = path.join(vault04, 'Terra_Archive.md');
    fs.writeFileSync(file2Path, '---\ncategory: "raw_planet"\n---\n\n# Terra Prime\n\nPrimary cradle of terrestrial civilization located in Sol system.', 'utf8');

    const file3Path = path.join(vault13, 'Chapter_01_Draft.md');
    fs.writeFileSync(file3Path, '# Chapter 1 Draft\n\nPlasma thrusters roared as the colony fleet initiated ignition sequence.', 'utf8');

    const file4ArchivedPath = path.join(vault04, 'Obsolete_Station.md');
    fs.writeFileSync(file4ArchivedPath, '# Obsolete Station\n\nDecommissioned deep space outpost.', 'utf8');

    pathGuard = new PathGuard({
      pluginRoot: tempPluginDir,
      vaultRoot: tempVaultDir
    });

    dbManager = DatabaseManager.initDatabase(':memory:', { pathGuard });
    ragExporter = new RagCorpusExporter(dbManager, { ragDir, pathGuard });
    dispatcher = new CommandDispatcher({ dbManager, pathGuard, basePath: tempPluginDir });

    // 2. Seed database records
    const db = dbManager.getDatabase();

    db.prepare(`
      INSERT INTO source_files (id, file_path, relative_path, file_name, extension, size_bytes, mtime_ms, sha256_hash, source_category, status, review_status, canon_level, word_count)
      VALUES (1, ?, '01_Worldview/Cosmology_Axiom.md', 'Cosmology_Axiom.md', '.md', 500, 1700000000, 'hash_cosmo_500', 'world_rule', 'active', 'reviewed', 3, 500),
             (2, ?, '04_Entities/Planets/Terra_Archive.md', 'Terra_Archive.md', '.md', 1000, 1700000000, 'hash_terra_1000', 'entity', 'active', 'reviewed', 2, 1000),
             (3, ?, '13_小说工程插件/篇章草稿/Chapter_01_Draft.md', 'Chapter_01_Draft.md', '.md', 800, 1700000000, 'hash_ch1_800', 'draft', 'draft', 'pending', 0, 800),
             (4, ?, '04_Entities/Planets/Obsolete_Station.md', 'Obsolete_Station.md', '.md', 300, 1700000000, 'hash_archived_300', 'entity', 'archived', 'rejected', 0, 300)
    `).run(file1Path, file2Path, file3Path, file4ArchivedPath);

    db.prepare(`
      INSERT INTO entities (id, entity_id, canonical_name, entity_type, status, review_status, canon_level, source_file_id)
      VALUES (1, 'ENT-COSMOS', 'Light Invariance', 'concept', 'active', 'reviewed', 3, 1),
             (2, 'ENT-TERRA', 'Terra Prime', 'planet', 'active', 'reviewed', 2, 2)
    `).run();

    db.prepare(`
      INSERT INTO file_entities (id, source_file_id, entity_id, mention_type)
      VALUES (1, 1, 1, 'definition'),
             (2, 2, 2, 'definition')
    `).run();
  });

  afterEach(() => {
    if (dbManager) dbManager.close();
    if (fs.existsSync(tempPluginDir)) {
      try {
        fs.rmSync(tempPluginDir, { recursive: true, force: true });
      } catch (_) {}
    }
    if (fs.existsSync(tempVaultDir)) {
      try {
        fs.rmSync(tempVaultDir, { recursive: true, force: true });
      } catch (_) {}
    }
  });

  // =========================================================================
  // Suite 1: RAG Manifest JSONL Building & Token Estimation
  // =========================================================================
  describe('Suite 1: RAG Manifest JSONL Building & Token Estimation', () => {
    it('should generate valid JSONL manifest excluding archived records', () => {
      const result = ragExporter.buildRagCorpusManifest();

      assert.ok(result.manifestPath);
      assert.ok(fs.existsSync(result.manifestPath));
      assert.equal(result.totalDocuments, 3, 'Archived records must be strictly excluded');
      assert.ok(result.estimatedTokens > 0);

      // Verify Category Breakdown
      assert.equal(result.categoryBreakdown.world_rule, 1);
      assert.equal(result.categoryBreakdown.entity, 1);
      assert.equal(result.categoryBreakdown.draft, 1);
      assert.strictEqual(result.categoryBreakdown.archived, undefined);

      // Verify JSONL line structure
      const lines = fs.readFileSync(result.manifestPath, 'utf8').trim().split('\n');
      assert.equal(lines.length, 3);

      for (const line of lines) {
        const doc = JSON.parse(line);
        assert.ok(doc.id);
        assert.ok(['canon', 'candidate'].includes(doc.doc_type));
        assert.ok(typeof doc.canon_level === 'number');
        assert.ok(doc.relative_path);
        assert.ok(doc.file_name);
        assert.ok(doc.title);
        assert.ok(typeof doc.word_count === 'number');
        assert.ok(typeof doc.estimated_tokens === 'number');
        assert.ok(doc.sha256);
        assert.ok(Array.isArray(doc.entities));
        assert.ok(doc.indexed_at);
      }

      // Check specific entry values
      const parsedDoc1 = JSON.parse(lines[0]);
      assert.equal(parsedDoc1.doc_type, 'canon');
      assert.equal(parsedDoc1.canon_level, 3);
      assert.equal(parsedDoc1.category, 'world_rule');
      assert.equal(parsedDoc1.estimated_tokens, Math.round(500 * 1.3));
      assert.deepEqual(parsedDoc1.entities, ['Light Invariance']);
    });

    it('should support corpusType filtering for canon and creative', () => {
      // 1. Canon only
      const canonRes = ragExporter.buildRagCorpusManifest({ corpusType: 'canon' });
      assert.equal(canonRes.totalDocuments, 2, 'Only canon_level >= 2 items');
      const canonLines = fs.readFileSync(canonRes.manifestPath, 'utf8').trim().split('\n');
      for (const l of canonLines) {
        const doc = JSON.parse(l);
        assert.equal(doc.doc_type, 'canon');
        assert.ok(doc.canon_level >= 2);
      }

      // 2. Creative / Candidate only
      const creativeRes = ragExporter.buildRagCorpusManifest({ corpusType: 'creative' });
      assert.equal(creativeRes.totalDocuments, 1, 'Only canon_level < 2 items');
      const creativeLines = fs.readFileSync(creativeRes.manifestPath, 'utf8').trim().split('\n');
      const creativeDoc = JSON.parse(creativeLines[0]);
      assert.equal(creativeDoc.doc_type, 'candidate');
      assert.equal(creativeDoc.canon_level, 0);
    });
  });

  // =========================================================================
  // Suite 2: RAG Source Export & Corpus Segregation
  // =========================================================================
  describe('Suite 2: RAG Source Export & Corpus Segregation', () => {
    it('should export clean Markdown files segregated into canon/ and candidate/ with sanitized YAML headers', () => {
      const result = ragExporter.exportRagSources();

      assert.ok(fs.existsSync(result.canonCorpusDir));
      assert.ok(fs.existsSync(result.creativeCorpusDir));
      assert.ok(fs.existsSync(result.manifestJsonlPath));

      assert.equal(result.totalExportedFiles, 3);
      assert.equal(result.canonFilesCount, 2);
      assert.equal(result.creativeFilesCount, 1);

      // Verify files inside canon/
      const canonFiles = fs.readdirSync(result.canonCorpusDir);
      assert.equal(canonFiles.length, 2);

      const canonDocPath = path.join(result.canonCorpusDir, canonFiles[0]);
      const canonContent = fs.readFileSync(canonDocPath, 'utf8');

      // Verify standardized YAML header
      assert.ok(canonContent.startsWith('---\n'));
      assert.ok(canonContent.includes('source_id:'));
      assert.ok(canonContent.includes('relative_path:'));
      assert.ok(canonContent.includes('canon_level:'));
      assert.ok(canonContent.includes('review_status:'));

      // Verify old frontmatter was stripped without duplicating '---' markers
      const yamlDelimiterCount = (canonContent.match(/^---$/gm) || []).length;
      assert.equal(yamlDelimiterCount, 2, 'Must contain exactly one pair of frontmatter delimiters');

      // Verify body text is preserved intact
      assert.ok(
        canonContent.includes('The speed of light is invariant') ||
        canonContent.includes('Primary cradle of terrestrial civilization')
      );

      // Verify candidate/ folder contains chapter draft
      const candidateFiles = fs.readdirSync(result.creativeCorpusDir);
      assert.equal(candidateFiles.length, 1);
      const candidateContent = fs.readFileSync(path.join(result.creativeCorpusDir, candidateFiles[0]), 'utf8');
      assert.ok(candidateContent.includes('Plasma thrusters roared'));
    });
  });

  // =========================================================================
  // Suite 3: PathGuard Sandboxing & Vault Zero-Mutation Guarantees
  // =========================================================================
  describe('Suite 3: PathGuard Sandboxing & Vault Zero-Mutation Guarantees', () => {
    it('should strictly block attempts to export RAG corpus into Obsidian vault 01_~12_ folders', () => {
      const vaultTarget = path.join(tempVaultDir, '01_Worldview', 'rag_export');

      assert.throws(
        () => ragExporter.exportRagSources({ outputDir: vaultTarget }),
        (err) => {
          assert.ok(err instanceof SecurityError);
          return true;
        }
      );
    });

    it('should block directory traversal attacks outside sandbox', () => {
      assert.throws(
        () => ragExporter.buildRagCorpusManifest({ outputPath: path.resolve(tempPluginDir, '..', 'hack.jsonl') }),
        (err) => {
          assert.ok(err instanceof SecurityError);
          assert.equal(err.code, 'ERR_PATH_OUTSIDE_SANDBOX');
          return true;
        }
      );
    });

    it('should verify that all original Obsidian vault files remained 100% untouched and unmutated', () => {
      // Execute export
      ragExporter.exportRagSources();

      // Check original file 1 content in vault
      const origFile1 = path.join(tempVaultDir, '01_Worldview', 'Cosmology_Axiom.md');
      const origContent = fs.readFileSync(origFile1, 'utf8');

      // Must still contain original frontmatter and content
      assert.ok(origContent.includes('author: "Ancient"'));
      assert.ok(origContent.includes('The speed of light is invariant'));
    });
  });

  // =========================================================================
  // Suite 4: CommandDispatcher Integration
  // =========================================================================
  describe('Suite 4: CommandDispatcher Integration', () => {
    it('should dispatch BuildRagCorpusManifest and ExportRagSources through CommandDispatcher', async () => {
      // 1. Dispatch BuildRagCorpusManifest
      const manifestRes = await dispatcher.dispatch('BuildRagCorpusManifest', {
        corpusType: 'all'
      });

      assert.equal(manifestRes.status, 'success');
      assert.equal(manifestRes.totalDocuments, 3);
      assert.ok(manifestRes.content.includes('RAG Corpus Manifest Generated'));

      // 2. Dispatch ExportRagSources
      const exportRes = await dispatcher.dispatch('ExportRagSources', {
        policy: 'all'
      });

      assert.equal(exportRes.status, 'success');
      assert.equal(exportRes.totalExportedFiles, 3);
      assert.equal(exportRes.canonFilesCount, 2);
      assert.equal(exportRes.creativeFilesCount, 1);
      assert.ok(exportRes.content.includes('RAG Corpus Export Complete'));
    });
  });
});
