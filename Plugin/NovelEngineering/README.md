# 流浪小说工程 (NovelEngineering / VCPNovelManager) 完整命令指南与 Agent 调用手册

> **插件标识 (tool_name)**: NovelEngineering  
> **协议规范**: VCP 同步插件协议 (stdio)  
> **核心架构**: SQLite 结构化正史图谱 + 隔离草稿沙箱 + Context v3/v4 漏斗 + 7 维正史防污染门禁 + 叙事债务引擎\n
---\n
## 一、VCP 标准调用协议格式\n
Agent 调用任何 NovelEngineering 工具时，必须严格遵守 VCP 标准界定符：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」<命令名>「末」,
<参数名>:「始」<参数值>「末」
<<<[END_TOOL_REQUEST]>>>
`\n
> **特别提醒**：
> 1. 	ool_name 必须精确拼写为 NovelEngineering。
> 2. 命令名全部为 **PascalCase 大驼峰命名**（例如 GetChapterContext、SaveChapterDraft、CheckConsistency），区分大小写。
> 3. 对于写操作（如正史晋升、废弃、快照恢复），系统设有安全门禁，需附带特定的安全确认口令（如 confirmationToken:「始」CONFIRM_CANON_CHANGE「末」）。\n
---\n
## 二、命令按功能模块索引 (39 项)\n
### 1. 世界树扫描与资产识别\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | ScanWorldTree | 对目标 Obsidian 世界树目录执行严格只读扫描，提取 Frontmatter 元数据与内容哈希，并在本地 SQLite 建立增量结构化索引。
参数:
- `vaultPath` (字符串, 可选): 世界树根目录绝对路径。未提供时使用 config.env 中的 VAULT_ROOT。
- `mode` (字符串, 可选, 默认 'incremental'): 扫描模式，可选 'incremental'（根据修改时间与哈希增量更新）或 'full'（全量重建）。
- `forceRehash` (布尔值, 可选, 默认 false): 是否强制重新计算所有文件的 SHA-256 哈希。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ScanWorldTree「末」,
vaultPath:「始」H:\Obsidian\WorldTree「末」,
mode:「始」incremental「末」
<<<[END_TOOL_REQUEST]>>> |
| - | BuildSourceManifest | 生成当前世界树中全部已索引源文件的完整清单报表，支持按分类 (source_category)、状态 (status) 和审核状态 (review_status) 过滤及分页。
参数:
- `vaultPath` (字符串, 可选): 目标世界树路径过滤。
- `sourceCategory` (字符串, 可选): 源文件分类过滤 (如: 'entity', 'timeline', 'setting', 'chapter', 'meta', 'trash')。
- `status` (字符串, 可选): 状态过滤 (如: 'active', 'stub', 'deprecated', 'draft')。
- `reviewStatus` (字符串, 可选): 审核状态过滤 (如: 'confirmed', 'ai_generated', 'pending')。
- `limit` (整数, 可选, 默认 100): 返回最大文件记录数。
- `offset` (整数, 可选, 默认 0): 分页偏移量。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildSourceManifest「末」,
sourceCategory:「始」entity「末」,
limit:「始」50「末」
<<<[END_TOOL_REQUEST]>>> |
| - | ClassifySourceFiles | 对指定路径模式或目录下的文件执行多维分类与特征提取规则预览，返回分类统计与标签明细。
参数:
- `targetPath` (字符串, 可选): 待分类的目标相对路径或 glob 模式。
- `categoryHint` (字符串, 可选): 分类提示词或优先规则。
- `limit` (整数, 可选, 默认 50): 最大分析文件数。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ClassifySourceFiles「末」,
targetPath:「始」01_Entities/**「末」,
limit:「始」30「末」
<<<[END_TOOL_REQUEST]>>> |
| - | DetectPlaceholderFiles | 扫描并检测世界树中约 30B 大小的占位文件、空模板草稿与零字节文件 (ANOM_004)，生成占位清单。
参数:
- `maxSizeBytes` (整数, 可选, 默认 100): 占位文件判定的最大字节数上限。
- `vaultPath` (字符串, 可选): 过滤世界树路径。
- `limit` (整数, 可选, 默认 100): 最大返回数量。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectPlaceholderFiles「末」,
maxSizeBytes:「始」100「末」
<<<[END_TOOL_REQUEST]>>> |
| - | DetectDuplicateEntities | 针对实体库执行同名不同编号 (ANOM_001)、同编号多实体 (ANOM_002) 及别名碰撞 (ANOM_008) 等实体冲突检测。
参数:
- `entityType` (字符串, 可选): 过滤实体类型 (如: 'planet', 'character', 'organization', 'technology')。
- `strictAlias` (布尔值, 可选, 默认 true): 是否严格检测别名表中的冲突碰撞。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectDuplicateEntities「末」,
entityType:「始」planet「末」
<<<[END_TOOL_REQUEST]>>> |
| - | DetectLegacyIdConflicts | 检测历史版本残留的旧版编码格式、已废弃 ID (ANOM_005) 以及与新版标准 ID 体系之间的冲突与映射断链。
参数:
- `idPattern` (字符串, 可选): 自定义旧版 ID 的匹配正则表达式。
- `vaultPath` (字符串, 可选): 过滤世界树路径。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectLegacyIdConflicts「末」
<<<[END_TOOL_REQUEST]>>> |
| - | GetSourceFile | 根据相对路径或文件 ID 精确检索单个源文件的结构化索引详情，包括 Frontmatter、分类标签、提取的实体特征与关联引用。
参数:
- `filePath` (字符串, 可选*): 文件的相对或绝对路径 (与 fileId 二选一)。
- `fileId` (整数/字符串, 可选*): 数据库中的源文件记录 ID。
- `includeRawContent` (布尔值, 可选, 默认 false): 是否包含原始 Markdown 文本内容。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetSourceFile「末」,
filePath:「始」01_Entities/Planets/Terra_001.md「末」,
includeRawContent:「始」true「末」
<<<[END_TOOL_REQUEST]>>> |
| - | QueryEntities | 按名称、别名、实体类型、归属星球或关键词检索索引中的实体元数据与关联文件。
参数:
- `query` (字符串, 可选): 关键词检索 (匹配名称、别名、描述)。
- `entityType` (字符串, 可选): 实体分类 (如: 'character', 'planet', 'organization', 'technology', 'event')。
- `planet` (字符串, 可选): 关联所属星球名称或 ID。
- `status` (字符串, 可选): 实体状态 (如: 'active', 'draft', 'deprecated')。
- `limit` (整数, 可选, 默认 20): 返回记录数。
- `offset` (整数, 可选, 默认 0): 分页偏移量。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」QueryEntities「末」,
query:「始」星云基地「末」,
entityType:「始」location「末」,
limit:「始」10「末」
<<<[END_TOOL_REQUEST]>>> |
| - | ExportImportReport | 导出当前世界树扫描索引、多维分类统计及全部 10 种异常/冲突检测结果的综合分析报告 (Markdown + 结构化 JSON)。
参数:
- `scanId` (整数/字符串, 可选): 指定扫描任务 ID，缺省时使用最近一次扫描结果。
- `includeAnomalies` (布尔值, 可选, 默认 true): 是否包含全部异常冲突明细列表。
- `format` (字符串, 可选, 默认 'both'): 报告输出格式，可选 'markdown', 'json', 'both'。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ExportImportReport「末」,
includeAnomalies:「始」true「末」,
format:「始」both「末」
<<<[END_TOOL_REQUEST]>>> |

### 2. 章节创作与上下文拼装 (Context v3/v4)\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | GetChapterContext | [Context v3] 聚合指定篇章的上下文信息，包括全局世界公理与局部规则分类、正史档案设定、候选创意提案、篇章既定事实、开放伏笔线索、编年史时间线事件以及冲突预警。支持 sourcePolicy 多维正史生命周期过滤策略、maxTokens 预算控制与确定性 SHA-256 数据源追溯。
参数:
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串/整数, 可选*): 篇章唯一代码、序号或标题 (与 chapterNumber 二选一)。
- `chapterNumber` (整数/浮点数, 可选*): 显式篇章章节序号 (如: 1, 2.5)。
- `volumeNumber` (整数, 可选, 默认 1): 篇章归属卷号/分卷编号。
- `focusEntities` (字符串数组/逗号分隔字符串, 可选): 需要召回上下文的焦点实体名称、业务ID (如 'PL-001') 或别名 (如 '地球') 列表。为空时召回通用全局设定。
- `sourcePolicy` (字符串, 可选, 默认 'canon_and_reviewed'): 正史生命周期过滤策略，可选:
  * 'canon_only': 仅正史 (canon_level>=2 且已审核)，严格排除候选草稿
  * 'canon_and_reviewed': 正史及已审核候选 (默认写作模式)
  * 'include_drafts': 包含草稿与脑暴候选 (canon_level>=0)
  * 'all': 全量模式，包含所有未删除记录 (用于审计)
- `maxTokens` (整数, 可选): 上下文文本组装的最大 Token 预算上限。
- `includeWorldRules` (布尔值, 可选, 默认 true): 是否包含世界观底层规则（自动区分为 global 公理与 scoped 局部设定）。
- `includeTimeline` (布尔值, 可选, 默认 true): 是否通过图谱关联与时间区间召回编年史时间线事件。
- `includeForeshadowing` (布尔值, 可选, 默认 true): 是否召回活跃未决伏笔线索。
- `includeRawContent` (布尔值, 可选, 默认 true): 是否挂载实体源文件 Markdown 全文。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetChapterContext「末」,
chapterId:「始」1「末」,
focusEntities:「始」["泰拉", "林远"]「末」,
sourcePolicy:「始」canon_and_reviewed「末」,
includeWorldRules:「始」true「末」,
includeTimeline:「始」true「末」
<<<[END_TOOL_REQUEST]>>> |
| - | SaveChapterDraft | 将小说篇章草稿安全写入受控隔离目录 (13_小说工程插件/篇章草稿/)，严禁修改 01~12 源设定目录，并在 SQLite 数据库中同步记录 (status='draft', canon=0)。
参数:
- `projectId` (字符串, 可选): 项目标识符。
- `chapterId` (字符串/整数, 必填): 篇章唯一代码 (如: 'CH-001')。
- `title` (字符串, 必填): 篇章标题。
- `content` (字符串, 必填): 草稿 Markdown 正文。
- `summary` (字符串, 可选): 篇章概要。
- `volumeNumber` (整数, 可选, 默认 1): 卷号/分卷编号。
- `chapterNumber` (浮点数/整数, 可选): 章节序号 (如: 1, 2.5)。
- `povEntityId` (整数, 可选): 视角角色 (POV) 实体 ID。
- `vaultRoot` (字符串, 可选): 目标世界树根目录。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SaveChapterDraft「末」,
chapterId:「始」CH-001「末」,
title:「始」第1章 启航之日「末」,
content:「始」# 第1章 启航之日 |
| - | BuildVCPContext | [Context v4] 编译与构建标准 5 层合并漏斗（Schema 4.0）上下文快照，将外部语义候选 (semanticCandidates) 与 VCP 长期记忆 (vcpMemoryRefs) 安全融合至底层工程正史中。严格执行反向覆盖防御 (Anti-Override Logic)，禁止外部候选静默覆盖正史；集成 11 级优先级裁剪引擎与全量源血统自动追踪 (Context Tracing)，每条记录附加 sha256 追踪戳并返回 requestId 与 databaseRevision。
参数:
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串/整数, 可选, 默认 'general'): 目标篇章唯一代码或序号。
- `focusEntities` (字符串数组/逗号分隔字符串, 可选): 需要召回上下文的焦点实体列表。
- `vcpMemoryRefs` (对象数组, 可选): 外部 VCP 长期记忆条目引用列表。
- `semanticCandidates` (对象数组, 可选): 外部 RAG/浪潮检索到的语义候选参考资料列表。
- `sourcePolicy` (字符串, 可选, 默认 'canon_and_reviewed'): 正史生命周期过滤策略 ('canon_only', 'canon_and_reviewed', 'include_drafts', 'all')。
- `includeConflicts` (布尔值, 可选, 默认 true): 是否包含设定冲突预警。
- `includeUnresolved` (布尔值, 可选, 默认 true): 是否包含未闭环伏笔与未决设定。
- `includeWorldRules` (布尔值, 可选, 默认 true): 是否包含世界观底层规则（自动区分为 global 与 scoped）。
- `maxTokens` (整数, 可选, 默认 30000): 上下文最大 Token 预算上限。
- `authorDirectives` (字符串/对象数组, 可选): 作者当前最高优先级写作指令。
- `requestId` (字符串, 可选): 请求追踪唯一标识符 (UUID)。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildVCPContext「末」,
projectId:「始」流浪「末」,
chapterId:「始」Vol1_Ch03「末」,
focusEntities:「始」["灰港星"]「末」,
maxTokens:「始」30000「末」
<<<[END_TOOL_REQUEST]>>> |
| - | GetContextTrace | 根据快照 ID (snapshotId) 或追踪 ID (traceId) 检索对应上下文生成的完整血统链与数据源追溯记录。支持磁盘实时文件 SHA-256 完整性核验 (verifyIntegrity=true)，检测源文件是否存在篡改或缺失；输出包含 sourceSystem、authority、sha256 与 requestId/databaseRevision。
参数:
- `snapshotId` (字符串, 可选*): 快照标识符 (与 traceId 二选一)。
- `traceId` (字符串, 可选*): 追踪记录标识符。
- `verifyIntegrity` (布尔值, 可选, 默认 false): 是否执行磁盘源文件 SHA-256 实时完整性校验。
- `vaultRoot` (字符串, 可选): 世界树根目录路径。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetContextTrace「末」,
snapshotId:「始」ctx_v4_1788157500000_abcd「末」,
verifyIntegrity:「始」true「末」
<<<[END_TOOL_REQUEST]>>> |

### 3. 正史治理与一致性审核 (Governance & Consistency)\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | GetGovernanceSummary | 聚合输出世界树全库的正史治理生命周期统计数据、3维状态分布（status × review_status × canon_level）、待审/候选/风险指标与审计日志汇总。
参数: 无必需参数。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetGovernanceSummary「末」
<<<[END_TOOL_REQUEST]>>> |
| - | SetSourceReviewStatus | 更新源文件或实体的审核状态 (pending/in_review/reviewed/rejected)，自动级联同步该源文件中定义的核心实体。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件数据库记录 ID。
- `filePath` (字符串, 可选*): 目标源文件路径（相对或绝对）。
- `entityId` (字符串, 可选*): 目标实体业务代码 (如: 'PL-001')。
- `reviewStatus` (字符串, 必填): 目标审核状态，可选 'pending', 'in_review', 'reviewed', 'rejected'。
- `reviewer` (字符串, 可选, 默认 'system'): 审核人姓名/标识。
- `notes` (字符串, 可选): 审核意见或批注。
- `cascade` (布尔值, 可选, 默认 true): 是否级联同步源文件中定义的核心实体。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SetSourceReviewStatus「末」,
filePath:「始」04_星球档案/V-001/00_星球总览.md「末」,
reviewStatus:「始」reviewed「末」,
reviewer:「始」lead_editor「末」
<<<[END_TOOL_REQUEST]>>> |
| - | PromoteSourceToCanonPreview | 预演正史升格操作，校验审核状态门禁（禁止静默升格未审核草稿）、检测潜在异常冲突并列出受影响的实体与篇章（只读预览）。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `targetCanonLevel` (整数, 可选, 默认 2): 目标正史等级 (1: 候选参考, 2: 正史, 3: 公理法则)。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PromoteSourceToCanonPreview「末」,
filePath:「始」04_星球档案/V-001/00_星球总览.md「末」,
targetCanonLevel:「始」2「末」
<<<[END_TOOL_REQUEST]>>> |
| - | PromoteSourceToCanon | 正式执行正史升格操作，强制要求安全确认令牌 (confirmationToken === 'CONFIRM_CANON_CHANGE')，禁止静默升格草稿，自动级联定义实体并在 canon_changes 中留存审计日志。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `targetCanonLevel` (整数, 可选, 默认 2): 目标正史等级。
- `confirmationToken` (字符串, 必填): 安全确认口令，必须为 'CONFIRM_CANON_CHANGE'。
- `operator` (字符串, 可选, 默认 'system'): 操作人身份。
- `reason` (字符串, 可选): 升格原因。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PromoteSourceToCanon「末」,
entityId:「始」PL-001「末」,
targetCanonLevel:「始」2「末」,
confirmationToken:「始」CONFIRM_CANON_CHANGE「末」,
reason:「始」主编审核通过，正式列入正史「末」
<<<[END_TOOL_REQUEST]>>> |
| - | DeprecateSourcePreview | 预演废弃源文件或实体，分析下游知识图谱关系断链、关联篇章与时间线事件，评估风险级别 (LOW/MEDIUM/HIGH/CRITICAL)（只读预览）。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `reason` (字符串, 可选): 废弃原因。
- `replacementEntityId` (字符串, 可选): 替代实体代码。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DeprecateSourcePreview「末」,
entityId:「始」PL-999「末」
<<<[END_TOOL_REQUEST]>>> |
| - | DeprecateSource | 正式执行源文件或实体废弃，强制要求安全确认口令 (confirmationToken === 'CONFIRM_CANON_CHANGE')，标记 status='archived' 且 canon_level=0，并在 canon_changes 记录审计日志。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `confirmationToken` (字符串, 必填): 安全确认口令，必须为 'CONFIRM_CANON_CHANGE'。
- `reason` (字符串, 必填): 废弃原因。
- `replacementEntityId` (字符串, 可选): 替代实体代码。
- `operator` (字符串, 可选, 默认 'system'): 操作人身份。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DeprecateSource「末」,
entityId:「始」PL-999「末」,
confirmationToken:「始」CONFIRM_CANON_CHANGE「末」,
reason:「始」历史废弃设定，由PL-001完全替代「末」,
replacementEntityId:「始」PL-001「末」
<<<[END_TOOL_REQUEST]>>> |
| - | CheckConsistency | 执行多维世界观一致性校验，检测实体属性冲突、时间线因果悖论、未闭环伏笔与悬空图谱关联。
参数:
- `scope` (字符串, 可选, 默认 'all'): 校验范围 ('all', 'timeline', 'foreshadowing', 'entities', 'relations')。
- `severityThreshold` (字符串, 可选, 默认 'INFO'): 最低严重性过滤 ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')。
- `persistToReports` (布尔值, 可选, 默认 true): 是否自动将检测结果持久化至 anomaly_reports 表。
- `entityIds` (数组/字符串, 可选): 指定过滤校验的目标实体代码或内部 ID 列表。
- `category` (字符串, 可选): 指定过滤校验的异常大类 (如 'ENTITY_CONFLICT', 'CAUSAL_PARADOX', 'FORESHADOW_MISMATCH', 'GRAPH_INTEGRITY')。
- `scanSessionId` (字符串, 可选): 指定会话标识符。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」CheckConsistency「末」,
scope:「始」all「末」
<<<[END_TOOL_REQUEST]>>> |
| - | AnalyzeChangeImpact | 在修改或废弃设定前执行知识图谱深度遍历，评估对实体关系、关联篇章、时间线事件与伏笔的扩散影响（爆炸半径与风险评级）。
参数:
- `entityId` (字符串, 可选*): 目标实体业务代码。
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `changeType` (字符串, 可选, 默认 'MODIFY'): 变更类型 ('MODIFY', 'DEPRECATE', 'RENAME', 'RELOCATE', 'PROMOTE')。
- `proposedChanges` (对象, 可选): 拟变更的属性与字段。
- `maxDepth` (整数, 可选, 默认 2): 图谱遍历深度 (1 到 5)。
- `minConfidence` (数值, 可选, 默认 0.0): 关系边置信度阈值过滤。
- `includeDrafts` (布尔值, 可选, 默认 true): 是否纳入草稿与候选篇章计算。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」AnalyzeChangeImpact「末」,
entityId:「始」PL-001「末」,
changeType:「始」DEPRECATE「末」
<<<[END_TOOL_REQUEST]>>> |

### 4. 项目快照与版本恢复 (Snapshots & Restore)\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | CreateProjectSnapshot | 创建完整的项目级外部 JSON 状态快照，备份全部表结构与索引数据至 data/snapshots/，避免撑爆 SQLite 体积。
参数:
- `snapshotName` (字符串, 可选): 快照备注名称。
- `description` (字符串, 可选): 快照详细描述说明。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」CreateProjectSnapshot「末」,
snapshotName:「始」v1.0_pre_major_revision「末」
<<<[END_TOOL_REQUEST]>>> |
| - | RestoreProjectSnapshotPreview | 预演快照恢复操作，比对当前数据库与目标快照的数据集增减差异（filesDelta/entitiesDelta）与 Schema 版本一致性（只读预览）。
参数:
- `snapshotId` (字符串, 可选*): 快照标识符。
- `snapshotPath` (字符串, 可选*): 快照文件路径。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RestoreProjectSnapshotPreview「末」,
snapshotId:「始」snap_2026-08-31_auto_backup「末」
<<<[END_TOOL_REQUEST]>>> |
| - | RestoreProjectSnapshot | 执行数据库状态从指定快照的原子事务恢复，要求强制确认令牌 (confirmationToken === 'CONFIRM_RESTORE')。
参数:
- `snapshotId` (字符串, 可选*): 快照标识符。
- `snapshotPath` (字符串, 可选*): 快照文件路径。
- `confirmationToken` (字符串, 必填): 确认口令，必须为 'CONFIRM_RESTORE'。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RestoreProjectSnapshot「末」,
snapshotId:「始」snap_2026-08-31_auto_backup「末」,
confirmationToken:「始」CONFIRM_RESTORE「末」
<<<[END_TOOL_REQUEST]>>> |

### 5. RAG 知识库与语料库导出 (RAG & Corpus)\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | BuildRagCorpusManifest | 生成与 VCP 浪潮 (RAG) 对接的 JSONL 清单文件 (manifest.jsonl)，输出包含 doc_type, category, sha256 与词元估算的结构化文档索引。
参数:
- `corpusType` (字符串, 可选, 默认 'all'): 语料库类型 ('all', 'canon', 'creative')。
- `outputPath` (字符串, 可选): 指定导出的 manifest.jsonl 路径。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildRagCorpusManifest「末」
<<<[END_TOOL_REQUEST]>>> |
| - | ExportRagSources | 导出剥离了干扰项的纯净 Markdown 语料库目录，明确拆分为正史库 (canon/) 与创意参考库 (candidate/)，并自动生成汇总 manifest.jsonl。
参数:
- `outputDir` (字符串, 可选): 导出目标目录（默认 data/rag_corpus/）。
- `policy` (字符串, 可选, 默认 'all'): 导出策略 ('all', 'canon_only', 'canon_and_reviewed')。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ExportRagSources「末」
<<<[END_TOOL_REQUEST]>>> |

### 6. 创作决策、记忆沉淀与质量评估 (Decisions & Auditing)\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | RegisterCreativeDecision | 将 AI Agent 提出的新设定或创作决策安全暂存入待审队列 (canon_changes_queue)，状态严格锁定为 pending_author_confirmation。实现正史零污染隔离（严禁直接篡改 entities、source_files 或正史表）；支持批量轰炸防洪与作者审核门禁。
参数:
- `decisionType` (字符串, 必填): 决策类型 (如: 'SETTING_ADDITION', 'CHARACTER_TRAIT', 'PLOT_EVENT', 'WORLD_RULE', 'RELATION_CHANGE')。
- `proposedChanges` (对象/值, 必填): 拟变更的设定属性或结构化内容。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选): 关联篇章代码。
- `proposer` (字符串, 可选, 默认 'AI_Agent'): 提议者标识。
- `targetEntityId` (字符串, 可选): 关联的目标实体业务 ID。
- `sourceEntities` (数组, 可选): 关联的源实体 ID 列表。
- `rationale` (字符串, 可选): 决策理由或设定背景解释。
- `tags` (数组, 可选): 标签列表。
- `priority` (字符串, 可选, 默认 'normal'): 优先级 ('low', 'normal', 'high', 'urgent')。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RegisterCreativeDecision「末」,
decisionType:「始」SETTING_ADDITION「末」,
targetEntityId:「始」PL-001「末」,
proposedChanges:「始」{"atmosphere": "dense_nitrogen", "habitable": true}「末」,
rationale:「始」AI Agent在第3章推导出的星球生态特征「末」
<<<[END_TOOL_REQUEST]>>> |
| - | SuggestMemoryUpdate | (R7) 在篇章草稿完成或审校后，分析正文内容与实体增量，生成面向 VCP DailyNote / RAG 的结构化更新建议清单。纯分析提案引擎，严格执行零数据库直写；遵循 SuggestMemoryUpdate (提案) -> 作者确认 -> PublishToVCPMemory (执行) 协作生命周期闭环。
参数:
- `draftContent` (字符串, 必填): 待分析的篇章草稿 Markdown 文本。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选, 默认 'general'): 篇章代码或标识。
- `draftMetadata` (对象, 可选): 篇章元数据 (如: { tags, summary, volumeNumber, chapterNumber })。
- `snapshotContext` (对象, 可选): 关联的上下文快照，用于实体状态增量匹配。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SuggestMemoryUpdate「末」,
chapterId:「始」Vol1_Ch03「末」,
draftContent:「始」# 第3章 灰港之风 |
| - | PublishToVCPMemory | (R4) 将作者已确认的记忆与剧情摘要打包为标准化 VCP 信封 JSON (Envelope Schema 1.0)，供 VCP DailyNote/RAG 服务安全抓取与沉淀。搭载防污染安全门禁，严格要求作者确认标记 (confirmedBy)；零数据库直写，杜绝草稿自动回流污染 RAG。
参数:
- `memories` (对象数组, 必填): 待推送的确认记忆条目列表，每项包含 memoryType, title, content (或 suggestedContent), tags, sourceRefs 等。
- `confirmedBy` (字符串, 可选, 默认 'author'): 确认人身份，防污染门禁要求非空。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选): 关联篇章代码。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PublishToVCPMemory「末」,
chapterId:「始」Vol1_Ch03「末」,
confirmedBy:「始」author「末」,
memories:「始」[{"memoryType":"chapter_summary","title":"第3章摘要","content":"林远抵达灰港星并完成首次接触。"}]「末」
<<<[END_TOOL_REQUEST]>>> |
| - | EvaluateCanonLeakage | (R5-FIX) 对 AI Agent 编写的草稿正文执行 7 维度全量正史泄露与幻觉巡检。针对已归档/废弃实体 (archived/deprecated) 实现 100% 召回拦截；覆盖 7 项巡检：① 引用废弃归档内容 ② 候选设定误作正史 ③ 提前使用未发生时间线事件 ④ 角色掌握越权全知信息 ⑤ 引用未确认设定变更 ⑥ 混入其他草稿分支内容 ⑦ 将过时 VCP 记忆误作当前正史。
参数:
- `draftContent` (字符串, 必填): 待巡检的草稿 Markdown 正文。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选): 篇章代码。
- `chapterNumber` (整数/浮点数, 可选, 默认 1): 当前章节序号（用于时间线因果校验）。
- `snapshotContext` (对象, 可选): 写作时使用的上下文快照。
- `forbiddenEntities` (字符串数组, 可选): 额外显式禁用的实体或关键词列表。
- `metadata` (对象, 可选): 草稿附加元数据。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateCanonLeakage「末」,
chapterNumber:「始」3「末」,
draftContent:「始」林远在灰港星使用了旧版引擎PL-999...「末」
<<<[END_TOOL_REQUEST]>>> |
| - | EvaluateContextPrecision | (R8) 评估上下文快照的精准度 (Precision)，计算快照中实际与当前写作任务相关的条目比例，识别并剔除无关噪声实体 (noiseEntities)，提供针对性的上下文过滤优化建议。
参数:
- `contextSnapshot` (对象, 必填): 待评估的 5 层或 3.0 上下文快照对象。
- `targetChapterInfo` (对象, 可选): 目标篇章任务信息 (包含 focusEntities, keywords, tags, chapterId)。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateContextPrecision「末」,
targetChapterInfo:「始」{"focusEntities": ["灰港星", "林远"], "keywords": ["跃迁", "港口"]}「末」,
contextSnapshot:「始」{"canonFacts": [...]}「末」
<<<[END_TOOL_REQUEST]>>> |
| - | EvaluateContextRecall | (R8) 评估上下文快照的召回率 (Recall)，检测是否遗漏了应包含的焦点实体、关键正史档案或全局世界公理规则 (Global World Rules)，返回遗漏实体与规则明细清单。
参数:
- `contextSnapshot` (对象, 必填): 待评估的上下文快照对象。
- `targetChapterInfo` (对象, 可选): 目标篇章任务信息 (包含 focusEntities, focus, chapterId)。
- `fullDatabaseFacts` (对象数组, 可选): 完整数据库事实列表，缺省时自动从 SQLite 查询。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateContextRecall「末」,
targetChapterInfo:「始」{"focusEntities": ["灰港星", "林远"]}「末」,
contextSnapshot:「始」{"canonFacts": [...]}「末」
<<<[END_TOOL_REQUEST]>>> |
| - | EvaluateMemoryConflict | (R8) 检测外部 VCP 长期记忆条目与 NovelEngineering 底层结构化正史事实之间的逻辑矛盾与状态冲突，计算一致性得分并定位冲突实体与矛盾原因。
参数:
- `vcpMemories` (对象数组, 必填): 外部传入的 VCP 长期记忆条目列表。
- `structuredCanonFacts` (对象数组, 可选): 结构化正史事实列表，缺省时自动从 SQLite 加载。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateMemoryConflict「末」,
vcpMemories:「始」[{"targetEntityId": "PL-001", "status": "destroyed"}]「末」
<<<[END_TOOL_REQUEST]>>> |

### 7. 叙事债务、伏笔与时间线 (Narrative Debt & Timeline)\n
| # | 命令名 (command) | 功能概要 |
|---|---|---|
| - | ManageForeshadowing | 管理叙事伏笔与暗线状态追踪，支持新增伏笔线索、回收闭环伏笔以及多维度检索伏笔列表。
参数:
- `action` (字符串, 必填): 操作类型，可选 'add' (新增伏笔), 'resolve' (回收伏笔), 'list' (查询列表)。
- `thread_key` (字符串, add/resolve必填): 伏笔标识代码 (如: 'FS-001')。
- `title` (字符串, add必填): 伏笔标题。
- `description` (字符串, add必填): 伏笔具体内容或设定描述。
- `importance_level` (字符串, 可选): 重要级别 ('minor', 'medium', 'major', 'core_climax')。
- `resolution_snippet` (字符串, resolve可选): 伏笔回收/对应段落摘录。
- `status` (字符串, list可选): 过滤状态 ('open', 'closed', 'abandoned', 'all')。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageForeshadowing「末」,
action:「始」add「末」,
thread_key:「始」FS-001「末」,
title:「始」第三货舱暗门「末」,
description:「始」货舱底层有未知量子反应「末」
<<<[END_TOOL_REQUEST]>>> |
| - | ManageTimeline | 管理世界观编年史与事件时间线，支持添加历史大事件以及按时间顺序或涉及实体检索事件列表。
参数:
- `action` (字符串, 必填): 操作类型，可选 'add' (添加事件), 'query' (查询事件)。
- `event_name` (字符串, add必填): 事件名称。
- `time_point` (数值/字符串, add必填): 事件排序时间戳 (如: 2042.0815, -5000)。
- `era_epoch` (字符串, 可选, 默认 'CE'): 纪元/纪历 (如: '旧历', '新历', '星际纪元', 'CE')。
- `description` (字符串, 可选): 事件详细叙事。
- `involved_entities` (数组/字符串, 可选): 参与或关联的实体名称/ID 列表。
- `min_order` (数值, query可选): 起始时间戳过滤。
- `max_order` (数值, query可选): 截止时间戳过滤。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageTimeline「末」,
action:「始」add「末」,
event_name:「始」太阳系联合防线建立「末」,
time_point:「始」2042.0815「末」
<<<[END_TOOL_REQUEST]>>> |
| - | ManageNarrativeDebt | (Phase 5) 管理叙事债务（伏笔借贷、利息累积、偿还兑现、多维查询与故事健康度汇总）。
参数:
- `action` (字符串, 必填): 操作类型 ('create', 'accrue', 'pay', 'query', 'summary')。
- `debtId` (字符串, pay/query可选): 债务唯一标识代码。
- `title` (字符串, create必填): 债务标题/悬念名称。
- `debtType` (字符串, create可选): 债务类型 ('core_mystery', 'subplot_hook', 'crisis_hook', 'character_promise', 'power_teaser', 'world_secret')。
- `borrowedChapter` (整数, create可选, 默认 1): 借出/设伏篇章章节号。
- `targetPayoffChapter` (整数, create可选): 目标偿还/闭环篇章章节号（必须大于 borrowedChapter）。
- `basePrincipal` (数值, create可选): 初始本金/叙事压力基数。
- `interestRate` (数值, create可选): 每章节利息累积复合率。
- `currentChapter` (整数, accrue/query/summary可选): 当前章节进度。
- `amount` (数值, pay可选): 偿还/兑现金额。
- `triggerReason` (字符串, pay可选): 偿还触发剧情理由。
- `status` (字符串, query可选): 状态过滤 ('active', 'overdue', 'partially_paid', 'paid')。
- `entityId` (字符串, query可选): 关联实体业务代码。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageNarrativeDebt「末」,
action:「始」create「末」,
title:「始」老皇帝遇刺之谜「末」,
debtType:「始」core_mystery「末」,
borrowedChapter:「始」1「末」,
targetPayoffChapter:「始」50「末」,
basePrincipal:「始」100.0「末」
<<<[END_TOOL_REQUEST]>>> |
| - | RecordMicroPayoff | (Phase 5) 记录叙事微偿付/阶段性悬念释放，缓解读者追读疲劳并抵扣关联债务本金。
参数:
- `debtId` (字符串, 必填): 关联叙事债务唯一标识代码。
- `chapterNumber` (整数, 可选, 默认 1): 微偿付发生章节号。
- `payoffType` (字符串, 可选): 偿付类型 ('clue_revealed', 'minor_satisfaction', 'theory_confirmed', 'crisis_alleviated', 'sub_payoff', 'foreshadow_advance')。
- `satisfactionScore` (数值, 可选, 默认 1.0): 读者满足度得分。
- `fatigueMitigationScore` (数值, 可选, 默认 1.0): 疲劳缓解系数。
- `principalReduction` (数值, 可选, 默认 0.0): 抵扣的本金数额。
- `description` (字符串, 可选): 偿付内容说明。
- `snippet` (字符串, 可选): 篇章正文剧情摘录。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RecordMicroPayoff「末」,
debtId:「始」debt_123456「末」,
chapterNumber:「始」5「末」,
payoffType:「始」clue_revealed「末」,
principalReduction:「始」20.0「末」,
description:「始」破译了密信的第一段暗号「末」
<<<[END_TOOL_REQUEST]>>> |
| - | GetDebtPressure | (Phase 5) 获取指定章节的叙事债务压力向量 (Layer 6 注入分区)，输出逾期与活跃悬念清单、总压力指数、最高紧迫度等级与 Markdown 提示词片段。支持焦点实体过滤 (focusEntities) 与 Top-5 极值防洪截断。
参数:
- `chapterNumber` (整数, 可选, 默认 1): 目标章节序号。
- `focusEntities` (字符串数组/逗号分隔字符串, 可选): 焦点实体过滤列表。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `maxItems` (整数, 可选, 默认 5): 极值防洪最大条目数限制。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetDebtPressure「末」,
chapterNumber:「始」5「末」,
focusEntities:「始」["顾沉"]「末」
<<<[END_TOOL_REQUEST]>>> |
| - | EvaluateDebtHealth | (Phase 5) 评估故事叙事债务健康度与追读节奏诊断，检测逾期债务 (ANOM_DEBT_OVERDUE)、微兑现干涸 (ANOM_PAYOFF_DROUGHT) 与钩子类型单一化 (ANOM_HOOK_MONOTONY)，输出五级健康评级 ('A'/'B'/'C'/'D'/'F')、0-100 健康得分、结构化指标与针对性创作建议。
参数:
- `currentChapter` (整数, 可选, 默认当前最新章节): 评估章节进度。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `droughtThreshold` (整数, 可选, 默认 5): 兑现干涸判定章节数阈值。
- `monotonyThreshold` (数值, 可选, 默认 0.60): 钩子单一化判定比例阈值。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateDebtHealth「末」,
currentChapter:「始」10「末」
<<<[END_TOOL_REQUEST]>>> |

---\n
## 三、全 39 个命令详解与标准调用示例\n
### 1. ScanWorldTree\n
功能: 对目标 Obsidian 世界树目录执行严格只读扫描，提取 Frontmatter 元数据与内容哈希，并在本地 SQLite 建立增量结构化索引。
参数:
- `vaultPath` (字符串, 可选): 世界树根目录绝对路径。未提供时使用 config.env 中的 VAULT_ROOT。
- `mode` (字符串, 可选, 默认 'incremental'): 扫描模式，可选 'incremental'（根据修改时间与哈希增量更新）或 'full'（全量重建）。
- `forceRehash` (布尔值, 可选, 默认 false): 是否强制重新计算所有文件的 SHA-256 哈希。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ScanWorldTree「末」,
vaultPath:「始」H:\Obsidian\WorldTree「末」,
mode:「始」incremental「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ScanWorldTree「末」,
mode:「始」incremental「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 2. BuildSourceManifest\n
功能: 生成当前世界树中全部已索引源文件的完整清单报表，支持按分类 (source_category)、状态 (status) 和审核状态 (review_status) 过滤及分页。
参数:
- `vaultPath` (字符串, 可选): 目标世界树路径过滤。
- `sourceCategory` (字符串, 可选): 源文件分类过滤 (如: 'entity', 'timeline', 'setting', 'chapter', 'meta', 'trash')。
- `status` (字符串, 可选): 状态过滤 (如: 'active', 'stub', 'deprecated', 'draft')。
- `reviewStatus` (字符串, 可选): 审核状态过滤 (如: 'confirmed', 'ai_generated', 'pending')。
- `limit` (整数, 可选, 默认 100): 返回最大文件记录数。
- `offset` (整数, 可选, 默认 0): 分页偏移量。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildSourceManifest「末」,
sourceCategory:「始」entity「末」,
limit:「始」50「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildSourceManifest「末」,
limit:「始」100「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 3. ClassifySourceFiles\n
功能: 对指定路径模式或目录下的文件执行多维分类与特征提取规则预览，返回分类统计与标签明细。
参数:
- `targetPath` (字符串, 可选): 待分类的目标相对路径或 glob 模式。
- `categoryHint` (字符串, 可选): 分类提示词或优先规则。
- `limit` (整数, 可选, 默认 50): 最大分析文件数。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ClassifySourceFiles「末」,
targetPath:「始」01_Entities/**「末」,
limit:「始」30「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ClassifySourceFiles「末」,
limit:「始」50「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 4. DetectPlaceholderFiles\n
功能: 扫描并检测世界树中约 30B 大小的占位文件、空模板草稿与零字节文件 (ANOM_004)，生成占位清单。
参数:
- `maxSizeBytes` (整数, 可选, 默认 100): 占位文件判定的最大字节数上限。
- `vaultPath` (字符串, 可选): 过滤世界树路径。
- `limit` (整数, 可选, 默认 100): 最大返回数量。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectPlaceholderFiles「末」,
maxSizeBytes:「始」100「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectPlaceholderFiles「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 5. DetectDuplicateEntities\n
功能: 针对实体库执行同名不同编号 (ANOM_001)、同编号多实体 (ANOM_002) 及别名碰撞 (ANOM_008) 等实体冲突检测。
参数:
- `entityType` (字符串, 可选): 过滤实体类型 (如: 'planet', 'character', 'organization', 'technology')。
- `strictAlias` (布尔值, 可选, 默认 true): 是否严格检测别名表中的冲突碰撞。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectDuplicateEntities「末」,
entityType:「始」planet「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectDuplicateEntities「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 6. DetectLegacyIdConflicts\n
功能: 检测历史版本残留的旧版编码格式、已废弃 ID (ANOM_005) 以及与新版标准 ID 体系之间的冲突与映射断链。
参数:
- `idPattern` (字符串, 可选): 自定义旧版 ID 的匹配正则表达式。
- `vaultPath` (字符串, 可选): 过滤世界树路径。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectLegacyIdConflicts「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DetectLegacyIdConflicts「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 7. GetSourceFile\n
功能: 根据相对路径或文件 ID 精确检索单个源文件的结构化索引详情，包括 Frontmatter、分类标签、提取的实体特征与关联引用。
参数:
- `filePath` (字符串, 可选*): 文件的相对或绝对路径 (与 fileId 二选一)。
- `fileId` (整数/字符串, 可选*): 数据库中的源文件记录 ID。
- `includeRawContent` (布尔值, 可选, 默认 false): 是否包含原始 Markdown 文本内容。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetSourceFile「末」,
filePath:「始」01_Entities/Planets/Terra_001.md「末」,
includeRawContent:「始」true「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetSourceFile「末」,
filePath:「始」01_Entities/Planets/Terra_001.md「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 8. QueryEntities\n
功能: 按名称、别名、实体类型、归属星球或关键词检索索引中的实体元数据与关联文件。
参数:
- `query` (字符串, 可选): 关键词检索 (匹配名称、别名、描述)。
- `entityType` (字符串, 可选): 实体分类 (如: 'character', 'planet', 'organization', 'technology', 'event')。
- `planet` (字符串, 可选): 关联所属星球名称或 ID。
- `status` (字符串, 可选): 实体状态 (如: 'active', 'draft', 'deprecated')。
- `limit` (整数, 可选, 默认 20): 返回记录数。
- `offset` (整数, 可选, 默认 0): 分页偏移量。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」QueryEntities「末」,
query:「始」星云基地「末」,
entityType:「始」location「末」,
limit:「始」10「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」QueryEntities「末」,
query:「始」地球「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 9. ExportImportReport\n
功能: 导出当前世界树扫描索引、多维分类统计及全部 10 种异常/冲突检测结果的综合分析报告 (Markdown + 结构化 JSON)。
参数:
- `scanId` (整数/字符串, 可选): 指定扫描任务 ID，缺省时使用最近一次扫描结果。
- `includeAnomalies` (布尔值, 可选, 默认 true): 是否包含全部异常冲突明细列表。
- `format` (字符串, 可选, 默认 'both'): 报告输出格式，可选 'markdown', 'json', 'both'。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ExportImportReport「末」,
includeAnomalies:「始」true「末」,
format:「始」both「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ExportImportReport「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 10. GetChapterContext\n
功能: [Context v3] 聚合指定篇章的上下文信息，包括全局世界公理与局部规则分类、正史档案设定、候选创意提案、篇章既定事实、开放伏笔线索、编年史时间线事件以及冲突预警。支持 sourcePolicy 多维正史生命周期过滤策略、maxTokens 预算控制与确定性 SHA-256 数据源追溯。
参数:
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串/整数, 可选*): 篇章唯一代码、序号或标题 (与 chapterNumber 二选一)。
- `chapterNumber` (整数/浮点数, 可选*): 显式篇章章节序号 (如: 1, 2.5)。
- `volumeNumber` (整数, 可选, 默认 1): 篇章归属卷号/分卷编号。
- `focusEntities` (字符串数组/逗号分隔字符串, 可选): 需要召回上下文的焦点实体名称、业务ID (如 'PL-001') 或别名 (如 '地球') 列表。为空时召回通用全局设定。
- `sourcePolicy` (字符串, 可选, 默认 'canon_and_reviewed'): 正史生命周期过滤策略，可选:
  * 'canon_only': 仅正史 (canon_level>=2 且已审核)，严格排除候选草稿
  * 'canon_and_reviewed': 正史及已审核候选 (默认写作模式)
  * 'include_drafts': 包含草稿与脑暴候选 (canon_level>=0)
  * 'all': 全量模式，包含所有未删除记录 (用于审计)
- `maxTokens` (整数, 可选): 上下文文本组装的最大 Token 预算上限。
- `includeWorldRules` (布尔值, 可选, 默认 true): 是否包含世界观底层规则（自动区分为 global 公理与 scoped 局部设定）。
- `includeTimeline` (布尔值, 可选, 默认 true): 是否通过图谱关联与时间区间召回编年史时间线事件。
- `includeForeshadowing` (布尔值, 可选, 默认 true): 是否召回活跃未决伏笔线索。
- `includeRawContent` (布尔值, 可选, 默认 true): 是否挂载实体源文件 Markdown 全文。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetChapterContext「末」,
chapterId:「始」1「末」,
focusEntities:「始」["泰拉", "林远"]「末」,
sourcePolicy:「始」canon_and_reviewed「末」,
includeWorldRules:「始」true「末」,
includeTimeline:「始」true「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetChapterContext「末」,
chapterId:「始」1「末」,
focusEntities:「始」["泰拉", "林远"]「末」,
sourcePolicy:「始」canon_and_reviewed「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 11. SaveChapterDraft\n
功能: 将小说篇章草稿安全写入受控隔离目录 (13_小说工程插件/篇章草稿/)，严禁修改 01~12 源设定目录，并在 SQLite 数据库中同步记录 (status='draft', canon=0)。
参数:
- `projectId` (字符串, 可选): 项目标识符。
- `chapterId` (字符串/整数, 必填): 篇章唯一代码 (如: 'CH-001')。
- `title` (字符串, 必填): 篇章标题。
- `content` (字符串, 必填): 草稿 Markdown 正文。
- `summary` (字符串, 可选): 篇章概要。
- `volumeNumber` (整数, 可选, 默认 1): 卷号/分卷编号。
- `chapterNumber` (浮点数/整数, 可选): 章节序号 (如: 1, 2.5)。
- `povEntityId` (整数, 可选): 视角角色 (POV) 实体 ID。
- `vaultRoot` (字符串, 可选): 目标世界树根目录。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SaveChapterDraft「末」,
chapterId:「始」CH-001「末」,
title:「始」第1章 启航之日「末」,
content:「始」# 第1章 启航之日\n\n等离子烈焰划破夜空...「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SaveChapterDraft「末」,
chapterId:「始」CH-001「末」,
title:「始」第1章 启航之日「末」,
content:「始」草稿正文「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 12. ManageForeshadowing\n
功能: 管理叙事伏笔与暗线状态追踪，支持新增伏笔线索、回收闭环伏笔以及多维度检索伏笔列表。
参数:
- `action` (字符串, 必填): 操作类型，可选 'add' (新增伏笔), 'resolve' (回收伏笔), 'list' (查询列表)。
- `thread_key` (字符串, add/resolve必填): 伏笔标识代码 (如: 'FS-001')。
- `title` (字符串, add必填): 伏笔标题。
- `description` (字符串, add必填): 伏笔具体内容或设定描述。
- `importance_level` (字符串, 可选): 重要级别 ('minor', 'medium', 'major', 'core_climax')。
- `resolution_snippet` (字符串, resolve可选): 伏笔回收/对应段落摘录。
- `status` (字符串, list可选): 过滤状态 ('open', 'closed', 'abandoned', 'all')。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageForeshadowing「末」,
action:「始」add「末」,
thread_key:「始」FS-001「末」,
title:「始」第三货舱暗门「末」,
description:「始」货舱底层有未知量子反应「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageForeshadowing「末」,
action:「始」list「末」,
status:「始」open「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 13. ManageTimeline\n
功能: 管理世界观编年史与事件时间线，支持添加历史大事件以及按时间顺序或涉及实体检索事件列表。
参数:
- `action` (字符串, 必填): 操作类型，可选 'add' (添加事件), 'query' (查询事件)。
- `event_name` (字符串, add必填): 事件名称。
- `time_point` (数值/字符串, add必填): 事件排序时间戳 (如: 2042.0815, -5000)。
- `era_epoch` (字符串, 可选, 默认 'CE'): 纪元/纪历 (如: '旧历', '新历', '星际纪元', 'CE')。
- `description` (字符串, 可选): 事件详细叙事。
- `involved_entities` (数组/字符串, 可选): 参与或关联的实体名称/ID 列表。
- `min_order` (数值, query可选): 起始时间戳过滤。
- `max_order` (数值, query可选): 截止时间戳过滤。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageTimeline「末」,
action:「始」add「末」,
event_name:「始」太阳系联合防线建立「末」,
time_point:「始」2042.0815「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageTimeline「末」,
action:「始」query「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 14. GetGovernanceSummary\n
功能: 聚合输出世界树全库的正史治理生命周期统计数据、3维状态分布（status × review_status × canon_level）、待审/候选/风险指标与审计日志汇总。
参数: 无必需参数。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetGovernanceSummary「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetGovernanceSummary「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 15. SetSourceReviewStatus\n
功能: 更新源文件或实体的审核状态 (pending/in_review/reviewed/rejected)，自动级联同步该源文件中定义的核心实体。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件数据库记录 ID。
- `filePath` (字符串, 可选*): 目标源文件路径（相对或绝对）。
- `entityId` (字符串, 可选*): 目标实体业务代码 (如: 'PL-001')。
- `reviewStatus` (字符串, 必填): 目标审核状态，可选 'pending', 'in_review', 'reviewed', 'rejected'。
- `reviewer` (字符串, 可选, 默认 'system'): 审核人姓名/标识。
- `notes` (字符串, 可选): 审核意见或批注。
- `cascade` (布尔值, 可选, 默认 true): 是否级联同步源文件中定义的核心实体。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SetSourceReviewStatus「末」,
filePath:「始」04_星球档案/V-001/00_星球总览.md「末」,
reviewStatus:「始」reviewed「末」,
reviewer:「始」lead_editor「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SetSourceReviewStatus「末」,
entityId:「始」PL-001「末」,
reviewStatus:「始」reviewed「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 16. PromoteSourceToCanonPreview\n
功能: 预演正史升格操作，校验审核状态门禁（禁止静默升格未审核草稿）、检测潜在异常冲突并列出受影响的实体与篇章（只读预览）。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `targetCanonLevel` (整数, 可选, 默认 2): 目标正史等级 (1: 候选参考, 2: 正史, 3: 公理法则)。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PromoteSourceToCanonPreview「末」,
filePath:「始」04_星球档案/V-001/00_星球总览.md「末」,
targetCanonLevel:「始」2「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PromoteSourceToCanonPreview「末」,
entityId:「始」PL-001「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 17. PromoteSourceToCanon\n
功能: 正式执行正史升格操作，强制要求安全确认令牌 (confirmationToken === 'CONFIRM_CANON_CHANGE')，禁止静默升格草稿，自动级联定义实体并在 canon_changes 中留存审计日志。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `targetCanonLevel` (整数, 可选, 默认 2): 目标正史等级。
- `confirmationToken` (字符串, 必填): 安全确认口令，必须为 'CONFIRM_CANON_CHANGE'。
- `operator` (字符串, 可选, 默认 'system'): 操作人身份。
- `reason` (字符串, 可选): 升格原因。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PromoteSourceToCanon「末」,
entityId:「始」PL-001「末」,
targetCanonLevel:「始」2「末」,
confirmationToken:「始」CONFIRM_CANON_CHANGE「末」,
reason:「始」主编审核通过，正式列入正史「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PromoteSourceToCanon「末」,
filePath:「始」04_星球档案/V-001/00_星球总览.md「末」,
confirmationToken:「始」CONFIRM_CANON_CHANGE「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 18. DeprecateSourcePreview\n
功能: 预演废弃源文件或实体，分析下游知识图谱关系断链、关联篇章与时间线事件，评估风险级别 (LOW/MEDIUM/HIGH/CRITICAL)（只读预览）。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `reason` (字符串, 可选): 废弃原因。
- `replacementEntityId` (字符串, 可选): 替代实体代码。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DeprecateSourcePreview「末」,
entityId:「始」PL-999「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DeprecateSourcePreview「末」,
filePath:「始」04_星球档案/V-999/废弃草案.md「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 19. DeprecateSource\n
功能: 正式执行源文件或实体废弃，强制要求安全确认口令 (confirmationToken === 'CONFIRM_CANON_CHANGE')，标记 status='archived' 且 canon_level=0，并在 canon_changes 记录审计日志。
参数:
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `entityId` (字符串, 可选*): 目标实体代码。
- `confirmationToken` (字符串, 必填): 安全确认口令，必须为 'CONFIRM_CANON_CHANGE'。
- `reason` (字符串, 必填): 废弃原因。
- `replacementEntityId` (字符串, 可选): 替代实体代码。
- `operator` (字符串, 可选, 默认 'system'): 操作人身份。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DeprecateSource「末」,
entityId:「始」PL-999「末」,
confirmationToken:「始」CONFIRM_CANON_CHANGE「末」,
reason:「始」历史废弃设定，由PL-001完全替代「末」,
replacementEntityId:「始」PL-001「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」DeprecateSource「末」,
entityId:「始」PL-999「末」,
confirmationToken:「始」CONFIRM_CANON_CHANGE「末」,
reason:「始」已废弃「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 20. CheckConsistency\n
功能: 执行多维世界观一致性校验，检测实体属性冲突、时间线因果悖论、未闭环伏笔与悬空图谱关联。
参数:
- `scope` (字符串, 可选, 默认 'all'): 校验范围 ('all', 'timeline', 'foreshadowing', 'entities', 'relations')。
- `severityThreshold` (字符串, 可选, 默认 'INFO'): 最低严重性过滤 ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')。
- `persistToReports` (布尔值, 可选, 默认 true): 是否自动将检测结果持久化至 anomaly_reports 表。
- `entityIds` (数组/字符串, 可选): 指定过滤校验的目标实体代码或内部 ID 列表。
- `category` (字符串, 可选): 指定过滤校验的异常大类 (如 'ENTITY_CONFLICT', 'CAUSAL_PARADOX', 'FORESHADOW_MISMATCH', 'GRAPH_INTEGRITY')。
- `scanSessionId` (字符串, 可选): 指定会话标识符。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」CheckConsistency「末」,
scope:「始」all「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」CheckConsistency「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 21. AnalyzeChangeImpact\n
功能: 在修改或废弃设定前执行知识图谱深度遍历，评估对实体关系、关联篇章、时间线事件与伏笔的扩散影响（爆炸半径与风险评级）。
参数:
- `entityId` (字符串, 可选*): 目标实体业务代码。
- `sourceFileId` (整数/字符串, 可选*): 目标源文件 ID。
- `filePath` (字符串, 可选*): 目标源文件路径。
- `changeType` (字符串, 可选, 默认 'MODIFY'): 变更类型 ('MODIFY', 'DEPRECATE', 'RENAME', 'RELOCATE', 'PROMOTE')。
- `proposedChanges` (对象, 可选): 拟变更的属性与字段。
- `maxDepth` (整数, 可选, 默认 2): 图谱遍历深度 (1 到 5)。
- `minConfidence` (数值, 可选, 默认 0.0): 关系边置信度阈值过滤。
- `includeDrafts` (布尔值, 可选, 默认 true): 是否纳入草稿与候选篇章计算。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」AnalyzeChangeImpact「末」,
entityId:「始」PL-001「末」,
changeType:「始」DEPRECATE「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」AnalyzeChangeImpact「末」,
entityId:「始」PL-001「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 22. CreateProjectSnapshot\n
功能: 创建完整的项目级外部 JSON 状态快照，备份全部表结构与索引数据至 data/snapshots/，避免撑爆 SQLite 体积。
参数:
- `snapshotName` (字符串, 可选): 快照备注名称。
- `description` (字符串, 可选): 快照详细描述说明。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」CreateProjectSnapshot「末」,
snapshotName:「始」v1.0_pre_major_revision「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」CreateProjectSnapshot「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 23. RestoreProjectSnapshotPreview\n
功能: 预演快照恢复操作，比对当前数据库与目标快照的数据集增减差异（filesDelta/entitiesDelta）与 Schema 版本一致性（只读预览）。
参数:
- `snapshotId` (字符串, 可选*): 快照标识符。
- `snapshotPath` (字符串, 可选*): 快照文件路径。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RestoreProjectSnapshotPreview「末」,
snapshotId:「始」snap_2026-08-31_auto_backup「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RestoreProjectSnapshotPreview「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 24. RestoreProjectSnapshot\n
功能: 执行数据库状态从指定快照的原子事务恢复，要求强制确认令牌 (confirmationToken === 'CONFIRM_RESTORE')。
参数:
- `snapshotId` (字符串, 可选*): 快照标识符。
- `snapshotPath` (字符串, 可选*): 快照文件路径。
- `confirmationToken` (字符串, 必填): 确认口令，必须为 'CONFIRM_RESTORE'。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RestoreProjectSnapshot「末」,
snapshotId:「始」snap_2026-08-31_auto_backup「末」,
confirmationToken:「始」CONFIRM_RESTORE「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RestoreProjectSnapshot「末」,
confirmationToken:「始」CONFIRM_RESTORE「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 25. BuildRagCorpusManifest\n
功能: 生成与 VCP 浪潮 (RAG) 对接的 JSONL 清单文件 (manifest.jsonl)，输出包含 doc_type, category, sha256 与词元估算的结构化文档索引。
参数:
- `corpusType` (字符串, 可选, 默认 'all'): 语料库类型 ('all', 'canon', 'creative')。
- `outputPath` (字符串, 可选): 指定导出的 manifest.jsonl 路径。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildRagCorpusManifest「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildRagCorpusManifest「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 26. ExportRagSources\n
功能: 导出剥离了干扰项的纯净 Markdown 语料库目录，明确拆分为正史库 (canon/) 与创意参考库 (candidate/)，并自动生成汇总 manifest.jsonl。
参数:
- `outputDir` (字符串, 可选): 导出目标目录（默认 data/rag_corpus/）。
- `policy` (字符串, 可选, 默认 'all'): 导出策略 ('all', 'canon_only', 'canon_and_reviewed')。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ExportRagSources「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ExportRagSources「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 27. BuildVCPContext\n
功能: [Context v4] 编译与构建标准 5 层合并漏斗（Schema 4.0）上下文快照，将外部语义候选 (semanticCandidates) 与 VCP 长期记忆 (vcpMemoryRefs) 安全融合至底层工程正史中。严格执行反向覆盖防御 (Anti-Override Logic)，禁止外部候选静默覆盖正史；集成 11 级优先级裁剪引擎与全量源血统自动追踪 (Context Tracing)，每条记录附加 sha256 追踪戳并返回 requestId 与 databaseRevision。
参数:
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串/整数, 可选, 默认 'general'): 目标篇章唯一代码或序号。
- `focusEntities` (字符串数组/逗号分隔字符串, 可选): 需要召回上下文的焦点实体列表。
- `vcpMemoryRefs` (对象数组, 可选): 外部 VCP 长期记忆条目引用列表。
- `semanticCandidates` (对象数组, 可选): 外部 RAG/浪潮检索到的语义候选参考资料列表。
- `sourcePolicy` (字符串, 可选, 默认 'canon_and_reviewed'): 正史生命周期过滤策略 ('canon_only', 'canon_and_reviewed', 'include_drafts', 'all')。
- `includeConflicts` (布尔值, 可选, 默认 true): 是否包含设定冲突预警。
- `includeUnresolved` (布尔值, 可选, 默认 true): 是否包含未闭环伏笔与未决设定。
- `includeWorldRules` (布尔值, 可选, 默认 true): 是否包含世界观底层规则（自动区分为 global 与 scoped）。
- `maxTokens` (整数, 可选, 默认 30000): 上下文最大 Token 预算上限。
- `authorDirectives` (字符串/对象数组, 可选): 作者当前最高优先级写作指令。
- `requestId` (字符串, 可选): 请求追踪唯一标识符 (UUID)。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildVCPContext「末」,
projectId:「始」流浪「末」,
chapterId:「始」Vol1_Ch03「末」,
focusEntities:「始」["灰港星"]「末」,
maxTokens:「始」30000「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」BuildVCPContext「末」,
projectId:「始」流浪「末」,
chapterId:「始」Vol1_Ch03「末」,
focusEntities:「始」["灰港星"]「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 28. GetContextTrace\n
功能: 根据快照 ID (snapshotId) 或追踪 ID (traceId) 检索对应上下文生成的完整血统链与数据源追溯记录。支持磁盘实时文件 SHA-256 完整性核验 (verifyIntegrity=true)，检测源文件是否存在篡改或缺失；输出包含 sourceSystem、authority、sha256 与 requestId/databaseRevision。
参数:
- `snapshotId` (字符串, 可选*): 快照标识符 (与 traceId 二选一)。
- `traceId` (字符串, 可选*): 追踪记录标识符。
- `verifyIntegrity` (布尔值, 可选, 默认 false): 是否执行磁盘源文件 SHA-256 实时完整性校验。
- `vaultRoot` (字符串, 可选): 世界树根目录路径。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetContextTrace「末」,
snapshotId:「始」ctx_v4_1788157500000_abcd「末」,
verifyIntegrity:「始」true「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetContextTrace「末」,
snapshotId:「始」ctx_v4_1788157500000_abcd「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 29. RegisterCreativeDecision\n
功能: 将 AI Agent 提出的新设定或创作决策安全暂存入待审队列 (canon_changes_queue)，状态严格锁定为 pending_author_confirmation。实现正史零污染隔离（严禁直接篡改 entities、source_files 或正史表）；支持批量轰炸防洪与作者审核门禁。
参数:
- `decisionType` (字符串, 必填): 决策类型 (如: 'SETTING_ADDITION', 'CHARACTER_TRAIT', 'PLOT_EVENT', 'WORLD_RULE', 'RELATION_CHANGE')。
- `proposedChanges` (对象/值, 必填): 拟变更的设定属性或结构化内容。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选): 关联篇章代码。
- `proposer` (字符串, 可选, 默认 'AI_Agent'): 提议者标识。
- `targetEntityId` (字符串, 可选): 关联的目标实体业务 ID。
- `sourceEntities` (数组, 可选): 关联的源实体 ID 列表。
- `rationale` (字符串, 可选): 决策理由或设定背景解释。
- `tags` (数组, 可选): 标签列表。
- `priority` (字符串, 可选, 默认 'normal'): 优先级 ('low', 'normal', 'high', 'urgent')。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RegisterCreativeDecision「末」,
decisionType:「始」SETTING_ADDITION「末」,
targetEntityId:「始」PL-001「末」,
proposedChanges:「始」{"atmosphere": "dense_nitrogen", "habitable": true}「末」,
rationale:「始」AI Agent在第3章推导出的星球生态特征「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RegisterCreativeDecision「末」,
decisionType:「始」SETTING_ADDITION「末」,
proposedChanges:「始」{"newSetting": "value"}「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 30. SuggestMemoryUpdate\n
功能: (R7) 在篇章草稿完成或审校后，分析正文内容与实体增量，生成面向 VCP DailyNote / RAG 的结构化更新建议清单。纯分析提案引擎，严格执行零数据库直写；遵循 SuggestMemoryUpdate (提案) -> 作者确认 -> PublishToVCPMemory (执行) 协作生命周期闭环。
参数:
- `draftContent` (字符串, 必填): 待分析的篇章草稿 Markdown 文本。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选, 默认 'general'): 篇章代码或标识。
- `draftMetadata` (对象, 可选): 篇章元数据 (如: { tags, summary, volumeNumber, chapterNumber })。
- `snapshotContext` (对象, 可选): 关联的上下文快照，用于实体状态增量匹配。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SuggestMemoryUpdate「末」,
chapterId:「始」Vol1_Ch03「末」,
draftContent:「始」# 第3章 灰港之风\n\n林远站在观测塔顶...「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」SuggestMemoryUpdate「末」,
draftContent:「始」草稿正文内容「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 31. PublishToVCPMemory\n
功能: (R4) 将作者已确认的记忆与剧情摘要打包为标准化 VCP 信封 JSON (Envelope Schema 1.0)，供 VCP DailyNote/RAG 服务安全抓取与沉淀。搭载防污染安全门禁，严格要求作者确认标记 (confirmedBy)；零数据库直写，杜绝草稿自动回流污染 RAG。
参数:
- `memories` (对象数组, 必填): 待推送的确认记忆条目列表，每项包含 memoryType, title, content (或 suggestedContent), tags, sourceRefs 等。
- `confirmedBy` (字符串, 可选, 默认 'author'): 确认人身份，防污染门禁要求非空。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选): 关联篇章代码。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PublishToVCPMemory「末」,
chapterId:「始」Vol1_Ch03「末」,
confirmedBy:「始」author「末」,
memories:「始」[{"memoryType":"chapter_summary","title":"第3章摘要","content":"林远抵达灰港星并完成首次接触。"}]「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」PublishToVCPMemory「末」,
memories:「始」[{"memoryType":"chapter_summary","content":"篇章摘要内容"}]「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 32. EvaluateCanonLeakage\n
功能: (R5-FIX) 对 AI Agent 编写的草稿正文执行 7 维度全量正史泄露与幻觉巡检。针对已归档/废弃实体 (archived/deprecated) 实现 100% 召回拦截；覆盖 7 项巡检：① 引用废弃归档内容 ② 候选设定误作正史 ③ 提前使用未发生时间线事件 ④ 角色掌握越权全知信息 ⑤ 引用未确认设定变更 ⑥ 混入其他草稿分支内容 ⑦ 将过时 VCP 记忆误作当前正史。
参数:
- `draftContent` (字符串, 必填): 待巡检的草稿 Markdown 正文。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `chapterId` (字符串, 可选): 篇章代码。
- `chapterNumber` (整数/浮点数, 可选, 默认 1): 当前章节序号（用于时间线因果校验）。
- `snapshotContext` (对象, 可选): 写作时使用的上下文快照。
- `forbiddenEntities` (字符串数组, 可选): 额外显式禁用的实体或关键词列表。
- `metadata` (对象, 可选): 草稿附加元数据。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateCanonLeakage「末」,
chapterNumber:「始」3「末」,
draftContent:「始」林远在灰港星使用了旧版引擎PL-999...「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateCanonLeakage「末」,
draftContent:「始」草稿正文「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 33. EvaluateContextPrecision\n
功能: (R8) 评估上下文快照的精准度 (Precision)，计算快照中实际与当前写作任务相关的条目比例，识别并剔除无关噪声实体 (noiseEntities)，提供针对性的上下文过滤优化建议。
参数:
- `contextSnapshot` (对象, 必填): 待评估的 5 层或 3.0 上下文快照对象。
- `targetChapterInfo` (对象, 可选): 目标篇章任务信息 (包含 focusEntities, keywords, tags, chapterId)。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateContextPrecision「末」,
targetChapterInfo:「始」{"focusEntities": ["灰港星", "林远"], "keywords": ["跃迁", "港口"]}「末」,
contextSnapshot:「始」{"canonFacts": [...]}「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateContextPrecision「末」,
contextSnapshot:「始」{}「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 34. EvaluateContextRecall\n
功能: (R8) 评估上下文快照的召回率 (Recall)，检测是否遗漏了应包含的焦点实体、关键正史档案或全局世界公理规则 (Global World Rules)，返回遗漏实体与规则明细清单。
参数:
- `contextSnapshot` (对象, 必填): 待评估的上下文快照对象。
- `targetChapterInfo` (对象, 可选): 目标篇章任务信息 (包含 focusEntities, focus, chapterId)。
- `fullDatabaseFacts` (对象数组, 可选): 完整数据库事实列表，缺省时自动从 SQLite 查询。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateContextRecall「末」,
targetChapterInfo:「始」{"focusEntities": ["灰港星", "林远"]}「末」,
contextSnapshot:「始」{"canonFacts": [...]}「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateContextRecall「末」,
contextSnapshot:「始」{}「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 35. EvaluateMemoryConflict\n
功能: (R8) 检测外部 VCP 长期记忆条目与 NovelEngineering 底层结构化正史事实之间的逻辑矛盾与状态冲突，计算一致性得分并定位冲突实体与矛盾原因。
参数:
- `vcpMemories` (对象数组, 必填): 外部传入的 VCP 长期记忆条目列表。
- `structuredCanonFacts` (对象数组, 可选): 结构化正史事实列表，缺省时自动从 SQLite 加载。
- `requestId` (字符串, 可选): 请求追踪 UUID。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateMemoryConflict「末」,
vcpMemories:「始」[{"targetEntityId": "PL-001", "status": "destroyed"}]「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateMemoryConflict「末」,
vcpMemories:「始」[]「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 36. ManageNarrativeDebt\n
功能: (Phase 5) 管理叙事债务（伏笔借贷、利息累积、偿还兑现、多维查询与故事健康度汇总）。
参数:
- `action` (字符串, 必填): 操作类型 ('create', 'accrue', 'pay', 'query', 'summary')。
- `debtId` (字符串, pay/query可选): 债务唯一标识代码。
- `title` (字符串, create必填): 债务标题/悬念名称。
- `debtType` (字符串, create可选): 债务类型 ('core_mystery', 'subplot_hook', 'crisis_hook', 'character_promise', 'power_teaser', 'world_secret')。
- `borrowedChapter` (整数, create可选, 默认 1): 借出/设伏篇章章节号。
- `targetPayoffChapter` (整数, create可选): 目标偿还/闭环篇章章节号（必须大于 borrowedChapter）。
- `basePrincipal` (数值, create可选): 初始本金/叙事压力基数。
- `interestRate` (数值, create可选): 每章节利息累积复合率。
- `currentChapter` (整数, accrue/query/summary可选): 当前章节进度。
- `amount` (数值, pay可选): 偿还/兑现金额。
- `triggerReason` (字符串, pay可选): 偿还触发剧情理由。
- `status` (字符串, query可选): 状态过滤 ('active', 'overdue', 'partially_paid', 'paid')。
- `entityId` (字符串, query可选): 关联实体业务代码。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageNarrativeDebt「末」,
action:「始」create「末」,
title:「始」老皇帝遇刺之谜「末」,
debtType:「始」core_mystery「末」,
borrowedChapter:「始」1「末」,
targetPayoffChapter:「始」50「末」,
basePrincipal:「始」100.0「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」ManageNarrativeDebt「末」,
action:「始」create「末」,
title:「始」老皇帝遇刺之谜「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 37. RecordMicroPayoff\n
功能: (Phase 5) 记录叙事微偿付/阶段性悬念释放，缓解读者追读疲劳并抵扣关联债务本金。
参数:
- `debtId` (字符串, 必填): 关联叙事债务唯一标识代码。
- `chapterNumber` (整数, 可选, 默认 1): 微偿付发生章节号。
- `payoffType` (字符串, 可选): 偿付类型 ('clue_revealed', 'minor_satisfaction', 'theory_confirmed', 'crisis_alleviated', 'sub_payoff', 'foreshadow_advance')。
- `satisfactionScore` (数值, 可选, 默认 1.0): 读者满足度得分。
- `fatigueMitigationScore` (数值, 可选, 默认 1.0): 疲劳缓解系数。
- `principalReduction` (数值, 可选, 默认 0.0): 抵扣的本金数额。
- `description` (字符串, 可选): 偿付内容说明。
- `snippet` (字符串, 可选): 篇章正文剧情摘录。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RecordMicroPayoff「末」,
debtId:「始」debt_123456「末」,
chapterNumber:「始」5「末」,
payoffType:「始」clue_revealed「末」,
principalReduction:「始」20.0「末」,
description:「始」破译了密信的第一段暗号「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」RecordMicroPayoff「末」,
debtId:「始」debt_123456「末」,
payoffType:「始」clue_revealed「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 38. GetDebtPressure\n
功能: (Phase 5) 获取指定章节的叙事债务压力向量 (Layer 6 注入分区)，输出逾期与活跃悬念清单、总压力指数、最高紧迫度等级与 Markdown 提示词片段。支持焦点实体过滤 (focusEntities) 与 Top-5 极值防洪截断。
参数:
- `chapterNumber` (整数, 可选, 默认 1): 目标章节序号。
- `focusEntities` (字符串数组/逗号分隔字符串, 可选): 焦点实体过滤列表。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `maxItems` (整数, 可选, 默认 5): 极值防洪最大条目数限制。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetDebtPressure「末」,
chapterNumber:「始」5「末」,
focusEntities:「始」["顾沉"]「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」GetDebtPressure「末」,
chapterNumber:「始」5「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
### 39. EvaluateDebtHealth\n
功能: (Phase 5) 评估故事叙事债务健康度与追读节奏诊断，检测逾期债务 (ANOM_DEBT_OVERDUE)、微兑现干涸 (ANOM_PAYOFF_DROUGHT) 与钩子类型单一化 (ANOM_HOOK_MONOTONY)，输出五级健康评级 ('A'/'B'/'C'/'D'/'F')、0-100 健康得分、结构化指标与针对性创作建议。
参数:
- `currentChapter` (整数, 可选, 默认当前最新章节): 评估章节进度。
- `projectId` (字符串, 可选, 默认 'default'): 项目标识符。
- `droughtThreshold` (整数, 可选, 默认 5): 兑现干涸判定章节数阈值。
- `monotonyThreshold` (数值, 可选, 默认 0.60): 钩子单一化判定比例阈值。
调用格式:
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateDebtHealth「末」,
currentChapter:「始」10「末」
<<<[END_TOOL_REQUEST]>>>\n
**调用示例**：\n
`	ext
<<<[TOOL_REQUEST]>>>
tool_name:「始」NovelEngineering「末」,
command:「始」EvaluateDebtHealth「末」,
currentChapter:「始」10「末」
<<<[END_TOOL_REQUEST]>>>
`\n
---\n
## 四、Agent 最佳写作协作流水线 (Pipeline)\n

当 CP Agent 承担小说创作或辅助任务时，推荐遵循以下严格防幻觉、防正史污染的 6 步闭环：

`mermaid
graph TD
    A[1. 编译上下文 BuildVCPContext / GetChapterContext] --> B[2. 查阅叙事债务 GetDebtPressure]
    B --> C[3. 撰写草稿 SaveChapterDraft]
    C --> D[4. 7维正史泄露巡检 EvaluateCanonLeakage]
    D -->|发现违规| C
    D -->|通过巡检| E[5. 提炼记忆建议 SuggestMemoryUpdate]
    E --> F[6. 用户确认后沉淀 PublishToVCPMemory]
`

1. **获取上下文**：调用 BuildVCPContext 或 GetChapterContext，获取包含世界公理、出场实体事实、未完结伏笔的确定性上下文；
2. **查询债务压力**：调用 GetDebtPressure 检查当前章节是否有高危即将逾期的伏笔需推进，或需要阶段性微兑现；
3. **安全保存草稿**：草稿正文必须使用 SaveChapterDraft 存入受控沙箱目录，严禁直写或覆盖核心设定源文件；
4. **正史泄露巡检**：撰写完毕后，必须调用 EvaluateCanonLeakage 进行 7 维度质检，拦截废弃实体、越权全知信息与未确认设定；
5. **提取记忆更新**：质检合格后，调用 SuggestMemoryUpdate 提取本章关键剧情增量；
6. **发布沉淀**：获得作者确认后，调用 PublishToVCPMemory 打包并同步至 VCP 长期记忆库。
