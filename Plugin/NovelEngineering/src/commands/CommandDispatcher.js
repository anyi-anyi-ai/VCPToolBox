/**
 * @file CommandDispatcher.js
 * @description Central Command Router and Handler for NovelEngineering VCP Plugin
 * @module commands/CommandDispatcher
 * @license MIT
 */

'use strict';

const path = require('path');
const { PathGuard } = require('../security/PathGuard');
const DatabaseManager = require('../db/DatabaseManager');
const ScanCommands = require('./ScanCommands');
const DetectionCommands = require('./DetectionCommands');
const QueryCommands = require('./QueryCommands');
const AuthoringCommands = require('./AuthoringCommands');
const ReportCommands = require('./ReportCommands');
const GovernanceCommands = require('./GovernanceCommands');
const ConsistencyCommands = require('./ConsistencyCommands');
const SnapshotCommands = require('./SnapshotCommands');
const RagExportCommands = require('./RagExportCommands');
const CollaborationCommands = require('./CollaborationCommands');
const DebtCommands = require('./DebtCommands');

class CommandDispatcher {
  /**
   * @param {object} [options]
   * @param {string} [options.basePath] - Plugin directory base path
   * @param {object} [options.config] - Environment configuration map
   * @param {PathGuard} [options.pathGuard] - Optional shared PathGuard instance
   * @param {DatabaseManager} [options.dbManager] - Optional shared DatabaseManager instance
   * @param {string} [options.dbPath] - Database path (e.g. 'data/novel_index.db' or ':memory:')
   */
  constructor(options = {}) {
    this.basePath = options.basePath || path.resolve(__dirname, '..', '..');
    this.config = options.config || process.env;
    this.pathGuard = options.pathGuard || new PathGuard({ pluginRoot: this.basePath });
    this.dbPath = options.dbPath || this.config.DATABASE_PATH || 'data/novel_index.db';
    this.dbManager = options.dbManager || null;
    this.version = '1.0.0';
    this.name = 'NovelEngineering';
  }

  /**
   * Lazy initializes and returns the shared DatabaseManager instance
   * @returns {DatabaseManager}
   */
  getDbManager() {
    if (!this.dbManager || this.dbManager.isClosed()) {
      this.dbManager = DatabaseManager.initDatabase(this.dbPath, {
        pathGuard: this.pathGuard
      });
    }
    return this.dbManager;
  }

  /**
   * Closes database connection if open
   */
  close() {
    if (this.dbManager && this.dbManager.isOpen()) {
      this.dbManager.close();
    }
    this.dbManager = null;
  }

  /**
   * Builds execution context passed to command handlers
   * @returns {object}
   */
  getContext() {
    const self = this;
    return {
      get dbManager() {
        return self.getDbManager();
      },
      pathGuard: this.pathGuard,
      config: this.config,
      basePath: this.basePath
    };
  }

  /**
   * Dispatches a command action with given parameters
   * @param {string} action
   * @param {object} [parameters={}]
   * @returns {Promise<object>}
   */
  async dispatch(action, parameters = {}) {
    if (!action || typeof action !== 'string') {
      throw new Error('Action must be a non-empty string.');
    }

    const trimmedAction = action.trim();

    // 1. Built-in Utility Commands (Fast path, zero DB connection)
    switch (trimmedAction) {
      case 'ping':
        return this._handlePing(parameters);

      case 'help':
        return this._handleHelp(parameters);

      case 'info':
        return this._handleInfo(parameters);
    }

    // 2. Validate against supported domain commands before acquiring DB context
    const supportedDomainCommands = new Set([
      'ScanWorldTree',
      'BuildSourceManifest',
      'ClassifySourceFiles',
      'DetectPlaceholderFiles',
      'DetectDuplicateEntities',
      'DetectLegacyIdConflicts',
      'GetSourceFile',
      'QueryEntities',
      'GetChapterContext',
      'SaveChapterDraft',
      'ManageForeshadowing',
      'ManageTimeline',
      'ExportImportReport',
      // Phase 3 Milestone 2 Governance Commands
      'GetGovernanceSummary',
      'SetSourceReviewStatus',
      'PromoteSourceToCanonPreview',
      'PromoteSourceToCanon',
      'DeprecateSourcePreview',
      'DeprecateSource',
      // Phase 3 Milestone 3 Consistency & Impact Commands
      'CheckConsistency',
      'AnalyzeChangeImpact',
      // Phase 3 Milestone 5 Snapshot & RAG Commands
      'CreateProjectSnapshot',
      'RestoreProjectSnapshotPreview',
      'RestoreProjectSnapshot',
      'BuildRagCorpusManifest',
      'ExportRagSources',
      // Phase 4 Milestone 2-4 Collaboration & Quality Commands
      'BuildVCPContext',
      'GetContextTrace',
      'RegisterCreativeDecision',
      'SuggestMemoryUpdate',
      'PublishToVCPMemory',
      'EvaluateCanonLeakage',
      'EvaluateContextPrecision',
      'EvaluateContextRecall',
      'EvaluateMemoryConflict',
      // Phase 5 Narrative Debt Tracking Commands
      'ManageNarrativeDebt',
      'RecordMicroPayoff',
      'GetDebtPressure',
      'EvaluateDebtHealth'
    ]);

    if (!supportedDomainCommands.has(trimmedAction)) {
      throw new Error(
        `Unsupported or unknown command: "${trimmedAction}". Supported commands: ${Array.from(supportedDomainCommands).join(', ')}, ping, help, info.`
      );
    }

    const context = this.getContext();

    // 3. Core MVP & Phase 2/3 Domain Commands
    switch (trimmedAction) {
      case 'ScanWorldTree':
        return ScanCommands.handleScanWorldTree(parameters, context);

      case 'BuildSourceManifest':
        return ScanCommands.handleBuildSourceManifest(parameters, context);

      case 'ClassifySourceFiles':
        return ScanCommands.handleClassifySourceFiles(parameters, context);

      case 'DetectPlaceholderFiles':
        return DetectionCommands.handleDetectPlaceholderFiles(parameters, context);

      case 'DetectDuplicateEntities':
        return DetectionCommands.handleDetectDuplicateEntities(parameters, context);

      case 'DetectLegacyIdConflicts':
        return DetectionCommands.handleDetectLegacyIdConflicts(parameters, context);

      case 'GetSourceFile':
        return QueryCommands.handleGetSourceFile(parameters, context);

      case 'QueryEntities':
        return QueryCommands.handleQueryEntities(parameters, context);

      case 'GetChapterContext':
        return QueryCommands.handleGetChapterContext(parameters, context);

      case 'SaveChapterDraft':
        return AuthoringCommands.handleSaveChapterDraft(parameters, context);

      case 'ManageForeshadowing':
        return AuthoringCommands.handleManageForeshadowing(parameters, context);

      case 'ManageTimeline':
        return AuthoringCommands.handleManageTimeline(parameters, context);

      case 'ExportImportReport':
        return ReportCommands.handleExportImportReport(parameters, context);

      // Phase 3 Milestone 2 Governance Commands
      case 'GetGovernanceSummary':
        return GovernanceCommands.handleGetGovernanceSummary(parameters, context);

      case 'SetSourceReviewStatus':
        return GovernanceCommands.handleSetSourceReviewStatus(parameters, context);

      case 'PromoteSourceToCanonPreview':
        return GovernanceCommands.handlePromoteSourceToCanonPreview(parameters, context);

      case 'PromoteSourceToCanon':
        return GovernanceCommands.handlePromoteSourceToCanon(parameters, context);

      case 'DeprecateSourcePreview':
        return GovernanceCommands.handleDeprecateSourcePreview(parameters, context);

      case 'DeprecateSource':
        return GovernanceCommands.handleDeprecateSource(parameters, context);

      // Phase 3 Milestone 3 Consistency & Impact Commands
      case 'CheckConsistency':
        return ConsistencyCommands.handleCheckConsistency(parameters, context);

      case 'AnalyzeChangeImpact':
        return ConsistencyCommands.handleAnalyzeChangeImpact(parameters, context);

      // Phase 3 Milestone 5 Snapshot & RAG Commands
      case 'CreateProjectSnapshot':
        return SnapshotCommands.handleCreateProjectSnapshot(parameters, context);

      case 'RestoreProjectSnapshotPreview':
        return SnapshotCommands.handleRestoreProjectSnapshotPreview(parameters, context);

      case 'RestoreProjectSnapshot':
        return SnapshotCommands.handleRestoreProjectSnapshot(parameters, context);

      case 'BuildRagCorpusManifest':
        return RagExportCommands.handleBuildRagCorpusManifest(parameters, context);

      case 'ExportRagSources':
        return RagExportCommands.handleExportRagSources(parameters, context);

      // Phase 4 Milestone 2-4 Collaboration & Quality Commands
      case 'BuildVCPContext':
        return CollaborationCommands.handleBuildVCPContext(parameters, context);

      case 'GetContextTrace':
        return CollaborationCommands.handleGetContextTrace(parameters, context);

      case 'RegisterCreativeDecision':
        return CollaborationCommands.handleRegisterCreativeDecision(parameters, context);

      case 'SuggestMemoryUpdate':
        return CollaborationCommands.handleSuggestMemoryUpdate(parameters, context);

      case 'PublishToVCPMemory':
        return CollaborationCommands.handlePublishToVCPMemory(parameters, context);

      case 'EvaluateCanonLeakage':
        return CollaborationCommands.handleEvaluateCanonLeakage(parameters, context);

      case 'EvaluateContextPrecision':
        return CollaborationCommands.handleEvaluateContextPrecision(parameters, context);

      case 'EvaluateContextRecall':
        return CollaborationCommands.handleEvaluateContextRecall(parameters, context);

      case 'EvaluateMemoryConflict':
        return CollaborationCommands.handleEvaluateMemoryConflict(parameters, context);

      // Phase 5 Narrative Debt Tracking Commands
      case 'ManageNarrativeDebt':
        return DebtCommands.handleManageNarrativeDebt(parameters, context);

      case 'RecordMicroPayoff':
        return DebtCommands.handleRecordMicroPayoff(parameters, context);

      case 'GetDebtPressure':
        return DebtCommands.handleGetDebtPressure(parameters, context);

      case 'EvaluateDebtHealth':
        return ConsistencyCommands.handleEvaluateDebtHealth(parameters, context);

      default:
        throw new Error(
          `Unsupported or unknown command: "${trimmedAction}". Supported commands: ${Array.from(supportedDomainCommands).join(', ')}, ping, help, info.`
        );
    }
  }

  // --- Built-in Command Handlers ---

  _handlePing(params) {
    const timestamp = new Date().toISOString();
    return {
      pong: true,
      timestamp,
      message: 'PONG',
      content: `### [NovelEngineering] Ping Response\n- **Status**: Active\n- **Timestamp**: \`${timestamp}\``,
      details: {
        action: 'ping',
        pong: true,
        timestamp
      }
    };
  }

  _handleHelp(params) {
    const availableCommands = [
      'ScanWorldTree',
      'BuildSourceManifest',
      'ClassifySourceFiles',
      'DetectPlaceholderFiles',
      'DetectDuplicateEntities',
      'DetectLegacyIdConflicts',
      'GetSourceFile',
      'QueryEntities',
      'GetChapterContext',
      'SaveChapterDraft',
      'ManageForeshadowing',
      'ManageTimeline',
      'ExportImportReport',
      'GetGovernanceSummary',
      'SetSourceReviewStatus',
      'PromoteSourceToCanonPreview',
      'PromoteSourceToCanon',
      'DeprecateSourcePreview',
      'DeprecateSource',
      'CheckConsistency',
      'AnalyzeChangeImpact',
      'CreateProjectSnapshot',
      'RestoreProjectSnapshotPreview',
      'RestoreProjectSnapshot',
      'BuildRagCorpusManifest',
      'ExportRagSources',
      // Phase 4 Collaboration & Evaluation
      'BuildVCPContext',
      'GetContextTrace',
      'RegisterCreativeDecision',
      'SuggestMemoryUpdate',
      'PublishToVCPMemory',
      'EvaluateCanonLeakage',
      'EvaluateContextPrecision',
      'EvaluateContextRecall',
      'EvaluateMemoryConflict',
      // Phase 5 Narrative Debt Tracking
      'ManageNarrativeDebt',
      'RecordMicroPayoff',
      'GetDebtPressure',
      'EvaluateDebtHealth',
      'ping',
      'help',
      'info'
    ];

    const commandListMarkdown = availableCommands.map(cmd => `- \`${cmd}\``).join('\n');
    return {
      availableCommands,
      version: this.version,
      message: 'NovelEngineering available commands',
      content: `### [NovelEngineering] Available Commands (v${this.version})\n${commandListMarkdown}`,
      details: {
        action: 'help',
        version: this.version,
        availableCommands
      }
    };
  }

  _handleInfo(params) {
    return {
      name: this.name,
      displayName: '流浪小说工程 (VCPNovelManager)',
      version: this.version,
      status: 'ready',
      protocol: 'stdio',
      pluginType: 'synchronous',
      content: `### [NovelEngineering] Plugin Info\n- **Name**: ${this.name}\n- **Version**: \`${this.version}\`\n- **Status**: \`ready\`\n- **Protocol**: \`stdio\` (synchronous)`,
      details: {
        name: this.name,
        displayName: '流浪小说工程 (VCPNovelManager)',
        version: this.version,
        status: 'ready',
        milestone: 'Phase 4'
      }
    };
  }
}

module.exports = {
  CommandDispatcher
};
