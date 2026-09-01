# VCPNovelManager Diagnostic & Anomaly Audit Report

- **Report ID**: `RPT-20260831-CEE3`
- **Generated At**: `2026-08-31T12:25:25.838Z`
- **Total Files Tracked**: 7355
- **Total Entities Extracted**: 1265
- **Total Anomalies Detected**: 685

## 1. World Tree Overview

| Metric | Count |
|---|---:|
| Source Files | 7355 |
| Lore Entities | 1265 |
| Entity Aliases | 0 |
| Timeline Events | 86 |
| Novel Chapters | 1 |
| Foreshadowing Hooks | 0 |
| Total Active Conflicts | 685 |

## 2. Category Distribution

| Category | Files Count |
|---|---:|
| `planet` | 0 |
| `character` | 0 |
| `organization` | 0 |
| `timeline` | 0 |
| `chapter` | 0 |
| `foreshadowing` | 0 |
| `draft` | 0 |
| `archive` | 0 |
| `unclassified` | 0 |

## 3. Anomaly Severity Breakdown

| Severity | Count | Impact Level |
|---|---:|---|
| 🔴 **CRITICAL** | 0 | Corrupts primary key / entity identity |
| 🟠 **HIGH** | 475 | Semantic collision / timeline causality break |
| 🟡 **MEDIUM** | 130 | Governance / disambiguation ambiguity |
| 🔵 **LOW** | 80 | Vault hygiene / stub placeholder note |
| ⚪ **INFO** | 0 | Informational notice |

## 4. Detected Conflicts & Remediation Plan

### 1. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 2. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 3. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 4. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 5. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 6. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-103.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 0304572a4c98...) found across 2 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-103.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-103_尸位素餐.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-103.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-103_尸位素餐.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 7. [MEDIUM] Duplicate file or historical clone detected: '04_基础设施与关键节点.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 2d9485f01851...) found across 2 paths: 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/04_基础设施与关键节点.md.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/04_基础设施与关键节点.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 8. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-123.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 3017b79837b5...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-123.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-123.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-123_射石饮羽.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-123.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-123.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-123_射石饮羽.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 9. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-115.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 31ab655f2489...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-115.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-115.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-115_煮豆燃萁.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-115.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-115.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-115_煮豆燃萁.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 10. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-107.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 325dfff6659a...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-107.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-107.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-107_投桃报李.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-107.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-107.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-107_投桃报李.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 11. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-110.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 39213893fb93...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-110.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-110.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-110_鸡犬升天.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-110.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-110.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-110_鸡犬升天.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 12. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-119.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 48ac6e3909c2...) found across 2 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-119.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-119.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-119.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-119.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 13. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-121.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 49c773658975...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-121.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-121.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-121_井蛙语海.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-121.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-121.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-121_井蛙语海.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 14. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-104.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 5a7741243a98...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-104.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-104.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-104_指桑骂槐.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-104.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-104.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-104_指桑骂槐.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 15. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-106.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 5f49dbd54076...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-106.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-106.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-106_越俎代庖.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-106.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-106.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-106_越俎代庖.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 16. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-111.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 663ed01f7e21...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-111.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-111.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-111_南辕北辙.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-111.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-111.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-111_南辕北辙.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 17. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-118.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 71a8dd647a4e...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-118.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-118.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-118_泥中曳尾.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-118.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-118.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-118_泥中曳尾.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 18. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-120.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 7aa97f5e48ce...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-120.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-120.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-120_与虎谋皮.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-120.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-120.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-120_与虎谋皮.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 19. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-102.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 7d0e66c6cef0...) found across 2 paths: 创意提取库/卡片盒/01_成语俗语/CARD-CY-102.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-102_丧家之犬.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-102.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-102_丧家之犬.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 20. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-105.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 83f32601dc13...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-105.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-105.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-105_釜底游鱼.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-105.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-105.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-105_釜底游鱼.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 21. [MEDIUM] Duplicate file or historical clone detected: '03_势力关系总图.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 91610794f503...) found across 6 paths: 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/03_势力关系总图.md.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/03_势力关系总图.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 22. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-109.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: 9c87010619d5...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-109.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-109.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-109_胶柱鼓瑟.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-109.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-109.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-109_胶柱鼓瑟.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 23. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-101.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: a5a6ff2ee05b...) found across 2 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-101.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-101.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-101.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-101.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 24. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-114.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: af2cb75de0c3...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-114.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-114.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-114_祸起萧墙.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-114.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-114.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-114_祸起萧墙.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 25. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-108.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: b108d51823ea...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-108.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-108.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-108_如履薄冰.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-108.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-108.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-108_如履薄冰.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 26. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-112.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: b3ed4d0cc5c2...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-112.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-112.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-112_乘兴而来.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-112.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-112.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-112_乘兴而来.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 27. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-117.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: be07936d2d69...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-117.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-117.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-117_按图索骥.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-117.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-117.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-117_按图索骥.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 28. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-122.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: c247fbe208e4...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-122.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-122.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-122_得陇望蜀.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-122.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-122.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-122_得陇望蜀.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 29. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-125.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: dec3bbcd891e...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-125.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-125.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-125_桃李不言.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-125.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-125.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-125_桃李不言.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 30. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-113.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: e08d294e16fc...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-113.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-113.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-113_破镜重圆.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-113.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-113.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-113_破镜重圆.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 31. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-116.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: e9e23347b441...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-116.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-116.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-116_亡戟得矛.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-116.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-116.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-116_亡戟得矛.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 32. [MEDIUM] Duplicate file or historical clone detected: 'CARD-CY-124.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Identical file content (SHA-256: f36738dd018f...) found across 3 paths: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-124.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-124.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-124_螳臂当车.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-124.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-124.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-124_螳臂当车.md`
- **Recommended Action**: Set status of historical/backup copies to 'archived' and exclude from primary RAG indexing pipelines.

### 33. [MEDIUM] Potential historical version fork: '00_全宇宙核心种族与关键器物总览.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '00_全宇宙核心种族与关键器物总览.md' exist across directories: 05_种族与器物/00_总览/00_全宇宙核心种族与关键器物总览.md, 05_种族与器物/01_核心种族/00_全宇宙核心种族与关键器物总览.md.
- **Affected Files**:
  - `05_种族与器物/00_总览/00_全宇宙核心种族与关键器物总览.md`
  - `05_种族与器物/01_核心种族/00_全宇宙核心种族与关键器物总览.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 34. [MEDIUM] Potential historical version fork: '00_势力总档案.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '00_势力总档案.md' exist across directories: 00_模板库/势力体系/00_势力总档案.md, 04_星球档案/V-165 赤昼星/07_势力体系/势力/A_闪瞎眼采矿公司/00_势力总档案.md, 04_星球档案/V-165 赤昼星/07_势力体系/势力/B_暗影摸鱼联合会/00_势力总档案.md, 04_星球档案/V-165 赤昼星/07_势力体系/势力/C_防晒霜走私黑帮/00_势力总档案.md, 04_星球档案/V-166 盐骨星/07_势力体系/势力/A_深渊卤水抽取署/00_势力总档案.md, 04_星球档案/V-166 盐骨星/07_势力体系/势力/B_高血压互助联盟/00_势力总档案.md, 04_星球档案/V-166 盐骨星/07_势力体系/势力/C_咸鱼腌制商会/00_势力总档案.md, 04_星球档案/V-167 风蚀星/07_势力体系/势力/A_极风矿业部/00_势力总档案.md, 04_星球档案/V-167 风蚀星/07_势力体系/势力/B_发型保卫战线/00_势力总档案.md, 04_星球档案/V-167 风蚀星/07_势力体系/势力/C_逆风飙车党/00_势力总档案.md, 04_星球档案/V-168 井国星/07_势力体系/势力/A_圣水总控局/00_势力总档案.md, 04_星球档案/V-168 井国星/07_势力体系/势力/B_水管维修工总会/00_势力总档案.md, 04_星球档案/V-168 井国星/07_势力体系/势力/C_偷水老鼠帮/00_势力总档案.md, 04_星球档案/V-169 冠海星/07_势力体系/势力/A_光蜜抽吸署/00_势力总档案.md, 04_星球档案/V-169 冠海星/07_势力体系/势力/B_树干保卫阵线/00_势力总档案.md, 04_星球档案/V-169 冠海星/07_势力体系/势力/C_拾荒蘑菇帮/00_势力总档案.md, 04_星球档案/V-170 迁林星/07_势力体系/势力/A_步根采伐署/00_势力总档案.md, 04_星球档案/V-170 迁林星/07_势力体系/势力/B_追林放牧人公会/00_势力总档案.md, 04_星球档案/V-170 迁林星/07_势力体系/势力/C_路标篡改党/00_势力总档案.md, 04_星球档案/V-171 红叶星/07_势力体系/势力/A_医疗植株与热能萃取局/00_势力总档案.md, 04_星球档案/V-171 红叶星/07_势力体系/势力/B_发烧友同盟/00_势力总档案.md, 04_星球档案/V-171 红叶星/07_势力体系/势力/C_退烧药走私卡特尔/00_势力总档案.md, 04_星球档案/V-172 镜叶星/07_势力体系/势力/A_光学信号阵列局/00_势力总档案.md, 04_星球档案/V-172 镜叶星/07_势力体系/势力/B_光绘艺术家协会/00_势力总档案.md, 04_星球档案/V-172 镜叶星/07_势力体系/势力/C_墨镜黑手党/00_势力总档案.md, 04_星球档案/V-173 琥珀云星/07_势力体系/势力/A_云端树脂垄断局/00_势力总档案.md, 04_星球档案/V-173 琥珀云星/07_势力体系/势力/B_防粘连劳工阵线/00_势力总档案.md, 04_星球档案/V-173 琥珀云星/07_势力体系/势力/C_破壁者帮会/00_势力总档案.md, 04_星球档案/V-174 沉云星/07_势力体系/势力/A_大气重压监测与云胶采集局/00_势力总档案.md, 04_星球档案/V-174 沉云星/07_势力体系/势力/B_顶天伞匠公会/00_势力总档案.md, 04_星球档案/V-174 沉云星/07_势力体系/势力/C_造雨师黑帮/00_势力总档案.md, 04_星球档案/V-175 青核星/07_势力体系/势力/A_精神提纯与青金采掘局/00_势力总档案.md, 04_星球档案/V-175 青核星/07_势力体系/势力/B_苦修防辐射会/00_势力总档案.md, 04_星球档案/V-175 青核星/07_势力体系/势力/C_极乐投毒者/00_势力总档案.md, 04_星球档案/V-176 白潮星/07_势力体系/势力/A_防撞胶体压榨局/00_势力总档案.md, 04_星球档案/V-176 白潮星/07_势力体系/势力/B_针刺防卫联盟/00_势力总档案.md, 04_星球档案/V-176 白潮星/07_势力体系/势力/C_气囊走私帮/00_势力总档案.md, 04_星球档案/V-177 寂冻星/07_势力体系/势力/A_声波液化与极寒封存局/00_势力总档案.md, 04_星球档案/V-177 寂冻星/07_势力体系/势力/B_无声拾荒者公会/00_势力总档案.md, 04_星球档案/V-177 寂冻星/07_势力体系/势力/C_爆音掷弹兵/00_势力总档案.md, 04_星球档案/V-178 蓝棺星/07_势力体系/势力/A_休眠阵列与气态开采局/00_势力总档案.md, 04_星球档案/V-178 蓝棺星/07_势力体系/势力/B_棺材骑士团/00_势力总档案.md, 04_星球档案/V-178 蓝棺星/07_势力体系/势力/C_梦境骇客/00_势力总档案.md, 04_星球档案/V-179 浮礁星/07_势力体系/势力/A_废料降解与生态压实局/00_势力总档案.md, 04_星球档案/V-179 浮礁星/07_势力体系/势力/B_拾荒造岛师公会/00_势力总档案.md, 04_星球档案/V-179 浮礁星/07_势力体系/势力/C_沉船炸岛帮/00_势力总档案.md, 04_星球档案/V-180 雨幕星/07_势力体系/势力/A_降水收集与防化防锈局/00_势力总档案.md, 04_星球档案/V-180 雨幕星/07_势力体系/势力/B_撑伞帮/00_势力总档案.md, 04_星球档案/V-180 雨幕星/07_势力体系/势力/C_破伤风骑士团/00_势力总档案.md, 04_星球档案/V-181 潮锁星/07_势力体系/势力/A_晨昏线轨道管理与热能调配局/00_势力总档案.md, 04_星球档案/V-181 潮锁星/07_势力体系/势力/B_追光跑酷团/00_势力总档案.md, 04_星球档案/V-181 潮锁星/07_势力体系/势力/C_永夜逐影者/00_势力总档案.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/A_反磁距采矿与引力平衡局/00_势力总档案.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/B_无铁纯净教团/00_势力总档案.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/C_磁暴冲浪党/00_势力总档案.md.
- **Affected Files**:
  - `00_模板库/势力体系/00_势力总档案.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/势力/A_闪瞎眼采矿公司/00_势力总档案.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/势力/B_暗影摸鱼联合会/00_势力总档案.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/势力/C_防晒霜走私黑帮/00_势力总档案.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/势力/A_深渊卤水抽取署/00_势力总档案.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/势力/B_高血压互助联盟/00_势力总档案.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/势力/C_咸鱼腌制商会/00_势力总档案.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/势力/A_极风矿业部/00_势力总档案.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/势力/B_发型保卫战线/00_势力总档案.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/势力/C_逆风飙车党/00_势力总档案.md`
  - `04_星球档案/V-168 井国星/07_势力体系/势力/A_圣水总控局/00_势力总档案.md`
  - `04_星球档案/V-168 井国星/07_势力体系/势力/B_水管维修工总会/00_势力总档案.md`
  - `04_星球档案/V-168 井国星/07_势力体系/势力/C_偷水老鼠帮/00_势力总档案.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/势力/A_光蜜抽吸署/00_势力总档案.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/势力/B_树干保卫阵线/00_势力总档案.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/势力/C_拾荒蘑菇帮/00_势力总档案.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/势力/A_步根采伐署/00_势力总档案.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/势力/B_追林放牧人公会/00_势力总档案.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/势力/C_路标篡改党/00_势力总档案.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/势力/A_医疗植株与热能萃取局/00_势力总档案.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/势力/B_发烧友同盟/00_势力总档案.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/势力/C_退烧药走私卡特尔/00_势力总档案.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/势力/A_光学信号阵列局/00_势力总档案.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/势力/B_光绘艺术家协会/00_势力总档案.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/势力/C_墨镜黑手党/00_势力总档案.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/势力/A_云端树脂垄断局/00_势力总档案.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/势力/B_防粘连劳工阵线/00_势力总档案.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/势力/C_破壁者帮会/00_势力总档案.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/势力/A_大气重压监测与云胶采集局/00_势力总档案.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/势力/B_顶天伞匠公会/00_势力总档案.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/势力/C_造雨师黑帮/00_势力总档案.md`
  - `04_星球档案/V-175 青核星/07_势力体系/势力/A_精神提纯与青金采掘局/00_势力总档案.md`
  - `04_星球档案/V-175 青核星/07_势力体系/势力/B_苦修防辐射会/00_势力总档案.md`
  - `04_星球档案/V-175 青核星/07_势力体系/势力/C_极乐投毒者/00_势力总档案.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/势力/A_防撞胶体压榨局/00_势力总档案.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/势力/B_针刺防卫联盟/00_势力总档案.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/势力/C_气囊走私帮/00_势力总档案.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/势力/A_声波液化与极寒封存局/00_势力总档案.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/势力/B_无声拾荒者公会/00_势力总档案.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/势力/C_爆音掷弹兵/00_势力总档案.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/势力/A_休眠阵列与气态开采局/00_势力总档案.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/势力/B_棺材骑士团/00_势力总档案.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/势力/C_梦境骇客/00_势力总档案.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/势力/A_废料降解与生态压实局/00_势力总档案.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/势力/B_拾荒造岛师公会/00_势力总档案.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/势力/C_沉船炸岛帮/00_势力总档案.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/势力/A_降水收集与防化防锈局/00_势力总档案.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/势力/B_撑伞帮/00_势力总档案.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/势力/C_破伤风骑士团/00_势力总档案.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/势力/A_晨昏线轨道管理与热能调配局/00_势力总档案.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/势力/B_追光跑酷团/00_势力总档案.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/势力/C_永夜逐影者/00_势力总档案.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/A_反磁距采矿与引力平衡局/00_势力总档案.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/B_无铁纯净教团/00_势力总档案.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/C_磁暴冲浪党/00_势力总档案.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 35. [MEDIUM] Potential historical version fork: '00_星球势力总览.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '00_星球势力总览.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/00_星球势力总览.md, 04_星球档案/V-072 寒星/07_势力体系/00_星球势力总览.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/00_星球势力总览.md`
  - `04_星球档案/V-072 寒星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 36. [MEDIUM] Potential historical version fork: '00_星球总览.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '00_星球总览.md' exist across directories: 00_模板库/势力体系/00_星球总览.md, 07_势力体系/V-079 生命星/00_星球总览.md, 07_势力体系/V-080 混沌星/00_星球总览.md, 07_势力体系/V-081 灵能星/00_星球总览.md, 07_势力体系/V-082 时间星/00_星球总览.md, 07_势力体系/V-083 虚空星/00_星球总览.md, 07_势力体系/V-084 维度星/00_星球总览.md, 04_星球档案/V-001 苔原-047/07_势力体系/00_星球总览.md, 04_星球档案/V-002 灰港星/07_势力体系/00_星球总览.md, 04_星球档案/V-003 风暴星/07_势力体系/00_星球总览.md, 04_星球档案/V-004 翠叶星/07_势力体系/00_星球总览.md, 04_星球档案/V-005 金沙星/07_势力体系/00_星球总览.md, 04_星球档案/V-006 深渊星/07_势力体系/00_星球总览.md, 04_星球档案/V-007 雪墓星/07_势力体系/00_星球总览.md, 04_星球档案/V-008 层书星/07_势力体系/00_星球总览.md, 04_星球档案/V-009 夜沙星/07_势力体系/00_星球总览.md, 04_星球档案/V-010 歌云星/07_势力体系/00_星球总览.md, 04_星球档案/V-011 镜潮星/07_势力体系/00_星球总览.md, 04_星球档案/V-012 心火星/07_势力体系/00_星球总览.md, 04_星球档案/V-013 孢云星/07_势力体系/00_星球总览.md, 04_星球档案/V-014 鸣晶星/07_势力体系/00_星球总览.md, 04_星球档案/V-015 影晶星/07_势力体系/00_星球总览.md, 04_星球档案/V-016 霜环星/07_势力体系/00_星球总览.md, 04_星球档案/V-017 锈河星/07_势力体系/00_星球总览.md, 04_星球档案/V-018 浮叶星/07_势力体系/00_星球总览.md, 04_星球档案/V-019 鸣钟星/07_势力体系/00_星球总览.md, 04_星球档案/V-020 镜沙星/07_势力体系/00_星球总览.md, 04_星球档案/V-021 霜恸星/07_势力体系/00_星球总览.md, 04_星球档案/V-022 气旋星/07_势力体系/00_星球总览.md, 04_星球档案/V-023 磁暴星/07_势力体系/00_星球总览.md, 04_星球档案/V-024 沸海星/07_势力体系/00_星球总览.md, 04_星球档案/V-025 织网星/07_势力体系/00_星球总览.md, 04_星球档案/V-026 涡流星/07_势力体系/00_星球总览.md, 04_星球档案/V-027 晶海星/07_势力体系/00_星球总览.md, 04_星球档案/V-028 基因星/07_势力体系/00_星球总览.md, 04_星球档案/V-029 梦泽星/07_势力体系/00_星球总览.md, 04_星球档案/V-030 熔核星/07_势力体系/00_星球总览.md, 04_星球档案/V-031 灰核星/07_势力体系/00_星球总览.md, 04_星球档案/V-032 磁渊星/07_势力体系/00_星球总览.md, 04_星球档案/V-033 灰烬星/07_势力体系/00_星球总览.md, 04_星球档案/V-034 寄生星/07_势力体系/00_星球总览.md, 04_星球档案/V-035 极电星/07_势力体系/00_星球总览.md, 04_星球档案/V-036 碎刃星/07_势力体系/00_星球总览.md, 04_星球档案/V-037 光棱星/07_势力体系/00_星球总览.md, 04_星球档案/V-038 尘歌星/07_势力体系/00_星球总览.md, 04_星球档案/V-039 雾隐星/07_势力体系/00_星球总览.md, 04_星球档案/V-040 血藤星/07_势力体系/00_星球总览.md, 04_星球档案/V-041 雷泽星/07_势力体系/00_星球总览.md, 04_星球档案/V-042 铁锈星/07_势力体系/00_星球总览.md, 04_星球档案/V-043 浮冰星/07_势力体系/00_星球总览.md, 04_星球档案/V-044 沙海星/07_势力体系/00_星球总览.md, 04_星球档案/V-045 深渊海星/07_势力体系/00_星球总览.md, 04_星球档案/V-046 磁极星/07_势力体系/00_星球总览.md, 04_星球档案/V-047 幽光星/07_势力体系/00_星球总览.md, 04_星球档案/V-048 声波星/07_势力体系/00_星球总览.md, 04_星球档案/V-049 潮汐星/07_势力体系/00_星球总览.md, 04_星球档案/V-050 死寂星/07_势力体系/00_星球总览.md, 04_星球档案/V-052 火雨星/07_势力体系/00_星球总览.md, 04_星球档案/V-053 冰风暴星/07_势力体系/00_星球总览.md, 04_星球档案/V-054 熔岩星/07_势力体系/00_星球总览.md, 04_星球档案/V-055 晶核星/07_势力体系/00_星球总览.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/00_星球总览.md, 04_星球档案/V-057 回声星/07_势力体系/00_星球总览.md, 04_星球档案/V-058 碎星带/07_势力体系/00_星球总览.md, 04_星球档案/V-059 晶尘星/07_势力体系/00_星球总览.md, 04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md, 04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md, 04_星球档案/V-062 磁星/07_势力体系/00_星球总览.md, 04_星球档案/V-063 气态巨星/07_势力体系/00_星球总览.md, 04_星球档案/V-064 雾霭星/07_势力体系/00_星球总览.md, 04_星球档案/V-065 星云星/07_势力体系/00_星球总览.md, 04_星球档案/V-066 裂谷星/07_势力体系/00_星球总览.md, 04_星球档案/V-067 浮岛星/07_势力体系/00_星球总览.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/00_星球总览.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/00_星球总览.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/00_星球总览.md, 04_星球档案/V-073 水星/07_势力体系/00_星球总览.md, 04_星球档案/V-074 光年星/07_势力体系/00_星球总览.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/00_星球总览.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/00_星球总览.md, 04_星球档案/V-077 重力星/07_势力体系/00_星球总览.md, 04_星球档案/V-078 水晶星/07_势力体系/00_星球总览.md, 04_星球档案/V-079 生命星/07_势力体系/00_星球总览.md, 04_星球档案/V-080 混沌星/07_势力体系/00_星球总览.md, 04_星球档案/V-081 灵能星/07_势力体系/00_星球总览.md, 04_星球档案/V-082 时间星/07_势力体系/00_星球总览.md, 04_星球档案/V-083 虚空星/07_势力体系/00_星球总览.md, 04_星球档案/V-084 维度星/07_势力体系/00_星球总览.md, 04_星球档案/V-085 能量星/07_势力体系/00_星球总览.md, 04_星球档案/V-086 星核星/07_势力体系/00_星球总览.md, 04_星球档案/V-087 光明星/07_势力体系/00_星球总览.md, 04_星球档案/V-088 暗黑星/07_势力体系/00_星球总览.md, 04_星球档案/V-089 晶灵星/07_势力体系/00_星球总览.md, 04_星球档案/V-090 机械星/07_势力体系/00_星球总览.md, 04_星球档案/V-091 冰巨星/07_势力体系/00_星球总览.md, 04_星球档案/V-092 重力波星/07_势力体系/00_星球总览.md, 04_星球档案/V-093 光速星/07_势力体系/00_星球总览.md, 04_星球档案/V-094 空间星/07_势力体系/00_星球总览.md, 04_星球档案/V-095 意识星/07_势力体系/00_星球总览.md, 04_星球档案/V-096 概率星/07_势力体系/00_星球总览.md, 04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md, 04_星球档案/V-098 虚无星/07_势力体系/00_星球总览.md, 04_星球档案/V-099 命运星/07_势力体系/00_星球总览.md, 04_星球档案/V-100 永恒星/07_势力体系/00_星球总览.md, 04_星球档案/V-101 灵魂星/07_势力体系/00_星球总览.md, 04_星球档案/V-102 自由星/07_势力体系/00_星球总览.md, 04_星球档案/V-103 真理星/07_势力体系/00_星球总览.md, 04_星球档案/V-104 秩序星/07_势力体系/00_星球总览.md, 04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md, 04_星球档案/V-106 起源星/07_势力体系/00_星球总览.md, 04_星球档案/V-107 鳞木星/07_势力体系/00_星球总览.md, 04_星球档案/V-108 息土星/07_势力体系/00_星球总览.md, 04_星球档案/V-109 锈骨星/07_势力体系/00_星球总览.md, 04_星球档案/V-110 毒岚星/07_势力体系/00_星球总览.md, 04_星球档案/V-111 晶髓星/07_势力体系/00_星球总览.md, 04_星球档案/V-112 幽泉星/07_势力体系/00_星球总览.md, 04_星球档案/V-113 狱火星/07_势力体系/00_星球总览.md, 04_星球档案/V-114 蛊厄星/07_势力体系/00_星球总览.md, 04_星球档案/V-115 铸心星/07_势力体系/00_星球总览.md, 04_星球档案/V-116 幻蜃星/07_势力体系/00_星球总览.md, 04_星球档案/V-117 渊噬星/07_势力体系/00_星球总览.md, 04_星球档案/V-118 凛灾星/07_势力体系/00_星球总览.md, 04_星球档案/V-119 震爆星/07_势力体系/00_星球总览.md, 04_星球档案/V-120 蚀骨星/07_势力体系/00_星球总览.md, 04_星球档案/V-121 烬灰星/07_势力体系/00_星球总览.md, 04_星球档案/V-122 锈死星/07_势力体系/00_星球总览.md, 04_星球档案/V-123 衰变星/07_势力体系/00_星球总览.md, 04_星球档案/V-124 重压星/07_势力体系/00_星球总览.md, 04_星球档案/V-125 极酸星/07_势力体系/00_星球总览.md, 04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md, 04_星球档案/V-127 幻魇星/07_势力体系/00_星球总览.md, 04_星球档案/V-128 雷暴星/07_势力体系/00_星球总览.md, 04_星球档案/V-129 冰晶星/07_势力体系/00_星球总览.md, 04_星球档案/V-130 胶沼星/07_势力体系/00_星球总览.md, 04_星球档案/V-131 震荡星/07_势力体系/00_星球总览.md, 04_星球档案/V-132 镜面星/07_势力体系/00_星球总览.md, 04_星球档案/V-133 骨灰星/07_势力体系/00_星球总览.md, 04_星球档案/V-134 沸石星/07_势力体系/00_星球总览.md, 04_星球档案/V-135 毒晶星/07_势力体系/00_星球总览.md, 04_星球档案/V-136 黑洞星/07_势力体系/00_星球总览.md, 04_星球档案/V-137 虚空回声星/07_势力体系/00_星球总览.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/00_星球总览.md, 04_星球档案/V-139 辐射星/07_势力体系/00_星球总览.md, 04_星球档案/V-140 漩涡星/07_势力体系/00_星球总览.md, 04_星球档案/V-141 腐蚀星/07_势力体系/00_星球总览.md, 04_星球档案/V-142 磁陷星/07_势力体系/00_星球总览.md, 04_星球档案/V-143 焦土星/07_势力体系/00_星球总览.md, 04_星球档案/V-144 结晶海星/07_势力体系/00_星球总览.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/00_星球总览.md, 04_星球档案/V-146 沸腾海星/07_势力体系/00_星球总览.md, 04_星球档案/V-147 超导冰原星/07_势力体系/00_星球总览.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/00_星球总览.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/00_星球总览.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/00_星球总览.md, 04_星球档案/V-151 星尘星/07_势力体系/00_星球总览.md, 04_星球档案/V-152 气体巨行星/07_势力体系/00_星球总览.md, 04_星球档案/V-153 脉冲星/07_势力体系/00_星球总览.md, 04_星球档案/V-154 白矮星/07_势力体系/00_星球总览.md, 04_星球档案/V-155 夸克星/07_势力体系/00_星球总览.md, 04_星球档案/V-156 反物质星/07_势力体系/00_星球总览.md, 04_星球档案/V-157 奇异质星/07_势力体系/00_星球总览.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/00_星球总览.md, 04_星球档案/V-159 音波星/07_势力体系/00_星球总览.md, 04_星球档案/V-160 引力星/07_势力体系/00_星球总览.md, 04_星球档案/V-161 幻象星/07_势力体系/00_星球总览.md, 04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md, 04_星球档案/V-163 植物星/07_势力体系/00_星球总览.md, 04_星球档案/V-164 终极星/07_势力体系/00_星球总览.md, 04_星球档案/V-165 赤昼星/07_势力体系/00_星球总览.md, 04_星球档案/V-166 盐骨星/07_势力体系/00_星球总览.md, 04_星球档案/V-167 风蚀星/07_势力体系/00_星球总览.md, 04_星球档案/V-168 井国星/07_势力体系/00_星球总览.md, 04_星球档案/V-169 冠海星/07_势力体系/00_星球总览.md, 04_星球档案/V-170 迁林星/07_势力体系/00_星球总览.md, 04_星球档案/V-171 红叶星/07_势力体系/00_星球总览.md, 04_星球档案/V-172 镜叶星/07_势力体系/00_星球总览.md, 04_星球档案/V-173 琥珀云星/07_势力体系/00_星球总览.md, 04_星球档案/V-174 沉云星/07_势力体系/00_星球总览.md, 04_星球档案/V-175 青核星/07_势力体系/00_星球总览.md, 04_星球档案/V-176 白潮星/07_势力体系/00_星球总览.md, 04_星球档案/V-177 寂冻星/07_势力体系/00_星球总览.md, 04_星球档案/V-178 蓝棺星/07_势力体系/00_星球总览.md, 04_星球档案/V-179 浮礁星/07_势力体系/00_星球总览.md, 04_星球档案/V-180 雨幕星/07_势力体系/00_星球总览.md, 04_星球档案/V-181 潮锁星/07_势力体系/00_星球总览.md, 04_星球档案/V-182 泡界星/07_势力体系/00_星球总览.md, 04_星球档案/V-183 万峰星/07_势力体系/00_星球总览.md, 04_星球档案/V-184 空谷星/07_势力体系/00_星球总览.md, 04_星球档案/V-185 铁脊星/07_势力体系/00_星球总览.md, 04_星球档案/V-186 震庭星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `04_星球档案/V-001 苔原-047/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-002 灰港星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-003 风暴星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-004 翠叶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-008 层书星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-012 心火星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-025 织网星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-028 基因星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-035 极电星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-048 声波星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-057 回声星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-062 磁星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-065 星云星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-073 水星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-074 光年星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-077 重力星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-079 生命星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-082 时间星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-084 维度星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-085 能量星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-086 星核星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-087 光明星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-090 机械星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-093 光速星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-094 空间星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-095 意识星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-096 概率星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-098 虚无星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-099 命运星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-100 永恒星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-101 灵魂星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-102 自由星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-103 真理星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-106 起源星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-108 息土星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-124 重压星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-159 音波星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-160 引力星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-163 植物星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-164 终极星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-168 井国星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-175 青核星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-182 泡界星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 37. [MEDIUM] Potential historical version fork: '01_势力总档案.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '01_势力总档案.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/01_势力总档案.md, 04_星球档案/V-072 寒星/07_势力体系/01_势力总档案.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/01_势力总档案.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/01_势力总档案.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/01_势力总档案.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/01_势力总档案.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/01_势力总档案.md`
  - `04_星球档案/V-072 寒星/07_势力体系/01_势力总档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/01_势力总档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/01_势力总档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/01_势力总档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/01_势力总档案.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 38. [MEDIUM] Potential historical version fork: '01_总览卡.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '01_总览卡.md' exist across directories: 04_星球档案/V-001 苔原-047/01_总览卡.md, 04_星球档案/V-002 灰港星/01_总览卡.md, 04_星球档案/V-003 风暴星/01_总览卡.md, 04_星球档案/V-004 翠叶星/01_总览卡.md, 04_星球档案/V-005 金沙星/01_总览卡.md, 04_星球档案/V-006 深渊星/01_总览卡.md, 04_星球档案/V-007 雪墓星/01_总览卡.md, 04_星球档案/V-008 层书星/01_总览卡.md, 04_星球档案/V-009 夜沙星/01_总览卡.md, 04_星球档案/V-010 歌云星/01_总览卡.md, 04_星球档案/V-011 镜潮星/01_总览卡.md, 04_星球档案/V-012 心火星/01_总览卡.md, 04_星球档案/V-013 孢云星/01_总览卡.md, 04_星球档案/V-014 鸣晶星/01_总览卡.md, 04_星球档案/V-015 影晶星/01_总览卡.md, 04_星球档案/V-016 霜环星/01_总览卡.md, 04_星球档案/V-017 锈河星/01_总览卡.md, 04_星球档案/V-018 浮叶星/01_总览卡.md, 04_星球档案/V-019 鸣钟星/01_总览卡.md, 04_星球档案/V-020 镜沙星/01_总览卡.md, 04_星球档案/V-021 霜恸星/01_总览卡.md, 04_星球档案/V-022 气旋星/01_总览卡.md, 04_星球档案/V-023 磁暴星/01_总览卡.md, 04_星球档案/V-024 沸海星/01_总览卡.md, 04_星球档案/V-025 织网星/01_总览卡.md, 04_星球档案/V-026 涡流星/01_总览卡.md, 04_星球档案/V-027 晶海星/01_总览卡.md, 04_星球档案/V-028 基因星/01_总览卡.md, 04_星球档案/V-029 梦泽星/01_总览卡.md, 04_星球档案/V-030 熔核星/01_总览卡.md, 04_星球档案/V-031 灰核星/01_总览卡.md, 04_星球档案/V-032 磁渊星/01_总览卡.md, 04_星球档案/V-033 灰烬星/01_总览卡.md, 04_星球档案/V-034 寄生星/01_总览卡.md, 04_星球档案/V-035 极电星/01_总览卡.md, 04_星球档案/V-036 碎刃星/01_总览卡.md, 04_星球档案/V-037 光棱星/01_总览卡.md, 04_星球档案/V-038 尘歌星/01_总览卡.md, 04_星球档案/V-039 雾隐星/01_总览卡.md, 04_星球档案/V-040 血藤星/01_总览卡.md, 04_星球档案/V-041 雷泽星/01_总览卡.md, 04_星球档案/V-042 铁锈星/01_总览卡.md, 04_星球档案/V-043 浮冰星/01_总览卡.md, 04_星球档案/V-044 沙海星/01_总览卡.md, 04_星球档案/V-045 深渊海星/01_总览卡.md, 04_星球档案/V-046 磁极星/01_总览卡.md, 04_星球档案/V-047 幽光星/01_总览卡.md, 04_星球档案/V-048 声波星/01_总览卡.md, 04_星球档案/V-049 潮汐星/01_总览卡.md, 04_星球档案/V-050 死寂星/01_总览卡.md, 04_星球档案/V-052 火雨星/01_总览卡.md, 04_星球档案/V-053 冰风暴星/01_总览卡.md, 04_星球档案/V-054 熔岩星/01_总览卡.md, 04_星球档案/V-055 晶核星/01_总览卡.md, 04_星球档案/V-056 重力缝隙星/01_总览卡.md, 04_星球档案/V-057 回声星/01_总览卡.md, 04_星球档案/V-058 碎星带/01_总览卡.md, 04_星球档案/V-059 晶尘星/01_总览卡.md, 04_星球档案/V-060 暗物质星/01_总览卡.md, 04_星球档案/V-061 孢子星/01_总览卡.md, 04_星球档案/V-062 磁星/01_总览卡.md, 04_星球档案/V-063 气态巨星/01_总览卡.md, 04_星球档案/V-064 雾霭星/01_总览卡.md, 04_星球档案/V-065 星云星/01_总览卡.md, 04_星球档案/V-066 裂谷星/01_总览卡.md, 04_星球档案/V-067 浮岛星/01_总览卡.md, 04_星球档案/V-068 蓝藻星/01_总览卡.md, 04_星球档案/V-069 极光磁暴星/01_总览卡.md, 04_星球档案/V-070 腐毒沼泽星/01_总览卡.md, 04_星球档案/V-071 重力扭曲星/01_总览卡.md, 04_星球档案/V-072 寒星/01_总览卡.md, 04_星球档案/V-073 水星/01_总览卡.md, 04_星球档案/V-074 光年星/01_总览卡.md, 04_星球档案/V-075 强碱腐蚀星/01_总览卡.md, 04_星球档案/V-076 微重力陨石星/01_总览卡.md, 04_星球档案/V-077 重力星/01_总览卡.md, 04_星球档案/V-078 水晶星/01_总览卡.md, 04_星球档案/V-079 生命星/01_总览卡.md, 04_星球档案/V-080 混沌星/01_总览卡.md, 04_星球档案/V-081 灵能星/01_总览卡.md, 04_星球档案/V-082 时间星/01_总览卡.md, 04_星球档案/V-083 虚空星/01_总览卡.md, 04_星球档案/V-084 维度星/01_总览卡.md, 04_星球档案/V-085 能量星/01_总览卡.md, 04_星球档案/V-086 星核星/01_总览卡.md, 04_星球档案/V-087 光明星/01_总览卡.md, 04_星球档案/V-088 暗黑星/01_总览卡.md, 04_星球档案/V-089 晶灵星/01_总览卡.md, 04_星球档案/V-090 机械星/01_总览卡.md, 04_星球档案/V-091 冰巨星/01_总览卡.md, 04_星球档案/V-092 重力波星/01_总览卡.md, 04_星球档案/V-093 光速星/01_总览卡.md, 04_星球档案/V-094 空间星/01_总览卡.md, 04_星球档案/V-095 意识星/01_总览卡.md, 04_星球档案/V-096 概率星/01_总览卡.md, 04_星球档案/V-097 梦境星/01_总览卡.md, 04_星球档案/V-098 虚无星/01_总览卡.md, 04_星球档案/V-099 命运星/01_总览卡.md, 04_星球档案/V-100 永恒星/01_总览卡.md, 04_星球档案/V-101 灵魂星/01_总览卡.md, 04_星球档案/V-102 自由星/01_总览卡.md, 04_星球档案/V-103 真理星/01_总览卡.md, 04_星球档案/V-104 秩序星/01_总览卡.md, 04_星球档案/V-105 暗物质星/01_总览卡.md, 04_星球档案/V-106 起源星/01_总览卡.md, 04_星球档案/V-107 鳞木星/01_总览卡.md, 04_星球档案/V-108 息土星/01_总览卡.md, 04_星球档案/V-109 锈骨星/01_总览卡.md, 04_星球档案/V-110 毒岚星/01_总览卡.md, 04_星球档案/V-111 晶髓星/01_总览卡.md, 04_星球档案/V-112 幽泉星/01_总览卡.md, 04_星球档案/V-113 狱火星/01_总览卡.md, 04_星球档案/V-114 蛊厄星/01_总览卡.md, 04_星球档案/V-115 铸心星/01_总览卡.md, 04_星球档案/V-116 幻蜃星/01_总览卡.md, 04_星球档案/V-117 渊噬星/01_总览卡.md, 04_星球档案/V-118 凛灾星/01_总览卡.md, 04_星球档案/V-119 震爆星/01_总览卡.md, 04_星球档案/V-120 蚀骨星/01_总览卡.md, 04_星球档案/V-121 烬灰星/01_总览卡.md, 04_星球档案/V-122 锈死星/01_总览卡.md, 04_星球档案/V-123 衰变星/01_总览卡.md, 04_星球档案/V-124 重压星/01_总览卡.md, 04_星球档案/V-125 极酸星/01_总览卡.md, 04_星球档案/V-126 孢子星/01_总览卡.md, 04_星球档案/V-127 幻魇星/01_总览卡.md, 04_星球档案/V-128 雷暴星/01_总览卡.md, 04_星球档案/V-129 冰晶星/01_总览卡.md, 04_星球档案/V-130 胶沼星/01_总览卡.md, 04_星球档案/V-131 震荡星/01_总览卡.md, 04_星球档案/V-132 镜面星/01_总览卡.md, 04_星球档案/V-133 骨灰星/01_总览卡.md, 04_星球档案/V-134 沸石星/01_总览卡.md, 04_星球档案/V-135 毒晶星/01_总览卡.md, 04_星球档案/V-136 黑洞星/01_总览卡.md, 04_星球档案/V-137 虚空回声星/01_总览卡.md, 04_星球档案/V-138 碎星带陨石星/01_总览卡.md, 04_星球档案/V-139 辐射星/01_总览卡.md, 04_星球档案/V-140 漩涡星/01_总览卡.md, 04_星球档案/V-141 腐蚀星/01_总览卡.md, 04_星球档案/V-142 磁陷星/01_总览卡.md, 04_星球档案/V-143 焦土星/01_总览卡.md, 04_星球档案/V-144 结晶海星/01_总览卡.md, 04_星球档案/V-145 虚空暗面星/01_总览卡.md, 04_星球档案/V-146 沸腾海星/01_总览卡.md, 04_星球档案/V-147 超导冰原星/01_总览卡.md, 04_星球档案/V-148 裂变废墟星/01_总览卡.md, 04_星球档案/V-149 液氮极寒星/01_总览卡.md, 04_星球档案/V-150 黑洞边缘星/01_总览卡.md, 04_星球档案/V-151 星尘星/01_总览卡.md, 04_星球档案/V-152 气体巨行星/01_总览卡.md, 04_星球档案/V-153 脉冲星/01_总览卡.md, 04_星球档案/V-154 白矮星/01_总览卡.md, 04_星球档案/V-155 夸克星/01_总览卡.md, 04_星球档案/V-156 反物质星/01_总览卡.md, 04_星球档案/V-157 奇异质星/01_总览卡.md, 04_星球档案/V-158 碎裂时空星/01_总览卡.md, 04_星球档案/V-159 音波星/01_总览卡.md, 04_星球档案/V-160 引力星/01_总览卡.md, 04_星球档案/V-161 幻象星/01_总览卡.md, 04_星球档案/V-162 梦境星/01_总览卡.md, 04_星球档案/V-163 植物星/01_总览卡.md, 04_星球档案/V-164 终极星/01_总览卡.md, 04_星球档案/V-165 赤昼星/01_总览卡.md, 04_星球档案/V-166 盐骨星/01_总览卡.md, 04_星球档案/V-167 风蚀星/01_总览卡.md, 04_星球档案/V-168 井国星/01_总览卡.md, 04_星球档案/V-169 冠海星/01_总览卡.md, 04_星球档案/V-170 迁林星/01_总览卡.md, 04_星球档案/V-171 红叶星/01_总览卡.md, 04_星球档案/V-172 镜叶星/01_总览卡.md, 04_星球档案/V-173 琥珀云星/01_总览卡.md, 04_星球档案/V-174 沉云星/01_总览卡.md, 04_星球档案/V-175 青核星/01_总览卡.md, 04_星球档案/V-176 白潮星/01_总览卡.md, 04_星球档案/V-177 寂冻星/01_总览卡.md, 04_星球档案/V-178 蓝棺星/01_总览卡.md, 04_星球档案/V-179 浮礁星/01_总览卡.md, 04_星球档案/V-180 雨幕星/01_总览卡.md, 04_星球档案/V-181 潮锁星/01_总览卡.md, 04_星球档案/V-182 泡界星/01_总览卡.md, 04_星球档案/V-183 万峰星/01_总览卡.md, 04_星球档案/V-184 空谷星/01_总览卡.md, 04_星球档案/V-185 铁脊星/01_总览卡.md, 04_星球档案/V-186 震庭星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/01_总览卡.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/01_总览卡.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/01_总览卡.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/01_总览卡.md`
  - `04_星球档案/V-002 灰港星/01_总览卡.md`
  - `04_星球档案/V-003 风暴星/01_总览卡.md`
  - `04_星球档案/V-004 翠叶星/01_总览卡.md`
  - `04_星球档案/V-005 金沙星/01_总览卡.md`
  - `04_星球档案/V-006 深渊星/01_总览卡.md`
  - `04_星球档案/V-007 雪墓星/01_总览卡.md`
  - `04_星球档案/V-008 层书星/01_总览卡.md`
  - `04_星球档案/V-009 夜沙星/01_总览卡.md`
  - `04_星球档案/V-010 歌云星/01_总览卡.md`
  - `04_星球档案/V-011 镜潮星/01_总览卡.md`
  - `04_星球档案/V-012 心火星/01_总览卡.md`
  - `04_星球档案/V-013 孢云星/01_总览卡.md`
  - `04_星球档案/V-014 鸣晶星/01_总览卡.md`
  - `04_星球档案/V-015 影晶星/01_总览卡.md`
  - `04_星球档案/V-016 霜环星/01_总览卡.md`
  - `04_星球档案/V-017 锈河星/01_总览卡.md`
  - `04_星球档案/V-018 浮叶星/01_总览卡.md`
  - `04_星球档案/V-019 鸣钟星/01_总览卡.md`
  - `04_星球档案/V-020 镜沙星/01_总览卡.md`
  - `04_星球档案/V-021 霜恸星/01_总览卡.md`
  - `04_星球档案/V-022 气旋星/01_总览卡.md`
  - `04_星球档案/V-023 磁暴星/01_总览卡.md`
  - `04_星球档案/V-024 沸海星/01_总览卡.md`
  - `04_星球档案/V-025 织网星/01_总览卡.md`
  - `04_星球档案/V-026 涡流星/01_总览卡.md`
  - `04_星球档案/V-027 晶海星/01_总览卡.md`
  - `04_星球档案/V-028 基因星/01_总览卡.md`
  - `04_星球档案/V-029 梦泽星/01_总览卡.md`
  - `04_星球档案/V-030 熔核星/01_总览卡.md`
  - `04_星球档案/V-031 灰核星/01_总览卡.md`
  - `04_星球档案/V-032 磁渊星/01_总览卡.md`
  - `04_星球档案/V-033 灰烬星/01_总览卡.md`
  - `04_星球档案/V-034 寄生星/01_总览卡.md`
  - `04_星球档案/V-035 极电星/01_总览卡.md`
  - `04_星球档案/V-036 碎刃星/01_总览卡.md`
  - `04_星球档案/V-037 光棱星/01_总览卡.md`
  - `04_星球档案/V-038 尘歌星/01_总览卡.md`
  - `04_星球档案/V-039 雾隐星/01_总览卡.md`
  - `04_星球档案/V-040 血藤星/01_总览卡.md`
  - `04_星球档案/V-041 雷泽星/01_总览卡.md`
  - `04_星球档案/V-042 铁锈星/01_总览卡.md`
  - `04_星球档案/V-043 浮冰星/01_总览卡.md`
  - `04_星球档案/V-044 沙海星/01_总览卡.md`
  - `04_星球档案/V-045 深渊海星/01_总览卡.md`
  - `04_星球档案/V-046 磁极星/01_总览卡.md`
  - `04_星球档案/V-047 幽光星/01_总览卡.md`
  - `04_星球档案/V-048 声波星/01_总览卡.md`
  - `04_星球档案/V-049 潮汐星/01_总览卡.md`
  - `04_星球档案/V-050 死寂星/01_总览卡.md`
  - `04_星球档案/V-052 火雨星/01_总览卡.md`
  - `04_星球档案/V-053 冰风暴星/01_总览卡.md`
  - `04_星球档案/V-054 熔岩星/01_总览卡.md`
  - `04_星球档案/V-055 晶核星/01_总览卡.md`
  - `04_星球档案/V-056 重力缝隙星/01_总览卡.md`
  - `04_星球档案/V-057 回声星/01_总览卡.md`
  - `04_星球档案/V-058 碎星带/01_总览卡.md`
  - `04_星球档案/V-059 晶尘星/01_总览卡.md`
  - `04_星球档案/V-060 暗物质星/01_总览卡.md`
  - `04_星球档案/V-061 孢子星/01_总览卡.md`
  - `04_星球档案/V-062 磁星/01_总览卡.md`
  - `04_星球档案/V-063 气态巨星/01_总览卡.md`
  - `04_星球档案/V-064 雾霭星/01_总览卡.md`
  - `04_星球档案/V-065 星云星/01_总览卡.md`
  - `04_星球档案/V-066 裂谷星/01_总览卡.md`
  - `04_星球档案/V-067 浮岛星/01_总览卡.md`
  - `04_星球档案/V-068 蓝藻星/01_总览卡.md`
  - `04_星球档案/V-069 极光磁暴星/01_总览卡.md`
  - `04_星球档案/V-070 腐毒沼泽星/01_总览卡.md`
  - `04_星球档案/V-071 重力扭曲星/01_总览卡.md`
  - `04_星球档案/V-072 寒星/01_总览卡.md`
  - `04_星球档案/V-073 水星/01_总览卡.md`
  - `04_星球档案/V-074 光年星/01_总览卡.md`
  - `04_星球档案/V-075 强碱腐蚀星/01_总览卡.md`
  - `04_星球档案/V-076 微重力陨石星/01_总览卡.md`
  - `04_星球档案/V-077 重力星/01_总览卡.md`
  - `04_星球档案/V-078 水晶星/01_总览卡.md`
  - `04_星球档案/V-079 生命星/01_总览卡.md`
  - `04_星球档案/V-080 混沌星/01_总览卡.md`
  - `04_星球档案/V-081 灵能星/01_总览卡.md`
  - `04_星球档案/V-082 时间星/01_总览卡.md`
  - `04_星球档案/V-083 虚空星/01_总览卡.md`
  - `04_星球档案/V-084 维度星/01_总览卡.md`
  - `04_星球档案/V-085 能量星/01_总览卡.md`
  - `04_星球档案/V-086 星核星/01_总览卡.md`
  - `04_星球档案/V-087 光明星/01_总览卡.md`
  - `04_星球档案/V-088 暗黑星/01_总览卡.md`
  - `04_星球档案/V-089 晶灵星/01_总览卡.md`
  - `04_星球档案/V-090 机械星/01_总览卡.md`
  - `04_星球档案/V-091 冰巨星/01_总览卡.md`
  - `04_星球档案/V-092 重力波星/01_总览卡.md`
  - `04_星球档案/V-093 光速星/01_总览卡.md`
  - `04_星球档案/V-094 空间星/01_总览卡.md`
  - `04_星球档案/V-095 意识星/01_总览卡.md`
  - `04_星球档案/V-096 概率星/01_总览卡.md`
  - `04_星球档案/V-097 梦境星/01_总览卡.md`
  - `04_星球档案/V-098 虚无星/01_总览卡.md`
  - `04_星球档案/V-099 命运星/01_总览卡.md`
  - `04_星球档案/V-100 永恒星/01_总览卡.md`
  - `04_星球档案/V-101 灵魂星/01_总览卡.md`
  - `04_星球档案/V-102 自由星/01_总览卡.md`
  - `04_星球档案/V-103 真理星/01_总览卡.md`
  - `04_星球档案/V-104 秩序星/01_总览卡.md`
  - `04_星球档案/V-105 暗物质星/01_总览卡.md`
  - `04_星球档案/V-106 起源星/01_总览卡.md`
  - `04_星球档案/V-107 鳞木星/01_总览卡.md`
  - `04_星球档案/V-108 息土星/01_总览卡.md`
  - `04_星球档案/V-109 锈骨星/01_总览卡.md`
  - `04_星球档案/V-110 毒岚星/01_总览卡.md`
  - `04_星球档案/V-111 晶髓星/01_总览卡.md`
  - `04_星球档案/V-112 幽泉星/01_总览卡.md`
  - `04_星球档案/V-113 狱火星/01_总览卡.md`
  - `04_星球档案/V-114 蛊厄星/01_总览卡.md`
  - `04_星球档案/V-115 铸心星/01_总览卡.md`
  - `04_星球档案/V-116 幻蜃星/01_总览卡.md`
  - `04_星球档案/V-117 渊噬星/01_总览卡.md`
  - `04_星球档案/V-118 凛灾星/01_总览卡.md`
  - `04_星球档案/V-119 震爆星/01_总览卡.md`
  - `04_星球档案/V-120 蚀骨星/01_总览卡.md`
  - `04_星球档案/V-121 烬灰星/01_总览卡.md`
  - `04_星球档案/V-122 锈死星/01_总览卡.md`
  - `04_星球档案/V-123 衰变星/01_总览卡.md`
  - `04_星球档案/V-124 重压星/01_总览卡.md`
  - `04_星球档案/V-125 极酸星/01_总览卡.md`
  - `04_星球档案/V-126 孢子星/01_总览卡.md`
  - `04_星球档案/V-127 幻魇星/01_总览卡.md`
  - `04_星球档案/V-128 雷暴星/01_总览卡.md`
  - `04_星球档案/V-129 冰晶星/01_总览卡.md`
  - `04_星球档案/V-130 胶沼星/01_总览卡.md`
  - `04_星球档案/V-131 震荡星/01_总览卡.md`
  - `04_星球档案/V-132 镜面星/01_总览卡.md`
  - `04_星球档案/V-133 骨灰星/01_总览卡.md`
  - `04_星球档案/V-134 沸石星/01_总览卡.md`
  - `04_星球档案/V-135 毒晶星/01_总览卡.md`
  - `04_星球档案/V-136 黑洞星/01_总览卡.md`
  - `04_星球档案/V-137 虚空回声星/01_总览卡.md`
  - `04_星球档案/V-138 碎星带陨石星/01_总览卡.md`
  - `04_星球档案/V-139 辐射星/01_总览卡.md`
  - `04_星球档案/V-140 漩涡星/01_总览卡.md`
  - `04_星球档案/V-141 腐蚀星/01_总览卡.md`
  - `04_星球档案/V-142 磁陷星/01_总览卡.md`
  - `04_星球档案/V-143 焦土星/01_总览卡.md`
  - `04_星球档案/V-144 结晶海星/01_总览卡.md`
  - `04_星球档案/V-145 虚空暗面星/01_总览卡.md`
  - `04_星球档案/V-146 沸腾海星/01_总览卡.md`
  - `04_星球档案/V-147 超导冰原星/01_总览卡.md`
  - `04_星球档案/V-148 裂变废墟星/01_总览卡.md`
  - `04_星球档案/V-149 液氮极寒星/01_总览卡.md`
  - `04_星球档案/V-150 黑洞边缘星/01_总览卡.md`
  - `04_星球档案/V-151 星尘星/01_总览卡.md`
  - `04_星球档案/V-152 气体巨行星/01_总览卡.md`
  - `04_星球档案/V-153 脉冲星/01_总览卡.md`
  - `04_星球档案/V-154 白矮星/01_总览卡.md`
  - `04_星球档案/V-155 夸克星/01_总览卡.md`
  - `04_星球档案/V-156 反物质星/01_总览卡.md`
  - `04_星球档案/V-157 奇异质星/01_总览卡.md`
  - `04_星球档案/V-158 碎裂时空星/01_总览卡.md`
  - `04_星球档案/V-159 音波星/01_总览卡.md`
  - `04_星球档案/V-160 引力星/01_总览卡.md`
  - `04_星球档案/V-161 幻象星/01_总览卡.md`
  - `04_星球档案/V-162 梦境星/01_总览卡.md`
  - `04_星球档案/V-163 植物星/01_总览卡.md`
  - `04_星球档案/V-164 终极星/01_总览卡.md`
  - `04_星球档案/V-165 赤昼星/01_总览卡.md`
  - `04_星球档案/V-166 盐骨星/01_总览卡.md`
  - `04_星球档案/V-167 风蚀星/01_总览卡.md`
  - `04_星球档案/V-168 井国星/01_总览卡.md`
  - `04_星球档案/V-169 冠海星/01_总览卡.md`
  - `04_星球档案/V-170 迁林星/01_总览卡.md`
  - `04_星球档案/V-171 红叶星/01_总览卡.md`
  - `04_星球档案/V-172 镜叶星/01_总览卡.md`
  - `04_星球档案/V-173 琥珀云星/01_总览卡.md`
  - `04_星球档案/V-174 沉云星/01_总览卡.md`
  - `04_星球档案/V-175 青核星/01_总览卡.md`
  - `04_星球档案/V-176 白潮星/01_总览卡.md`
  - `04_星球档案/V-177 寂冻星/01_总览卡.md`
  - `04_星球档案/V-178 蓝棺星/01_总览卡.md`
  - `04_星球档案/V-179 浮礁星/01_总览卡.md`
  - `04_星球档案/V-180 雨幕星/01_总览卡.md`
  - `04_星球档案/V-181 潮锁星/01_总览卡.md`
  - `04_星球档案/V-182 泡界星/01_总览卡.md`
  - `04_星球档案/V-183 万峰星/01_总览卡.md`
  - `04_星球档案/V-184 空谷星/01_总览卡.md`
  - `04_星球档案/V-185 铁脊星/01_总览卡.md`
  - `04_星球档案/V-186 震庭星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/01_总览卡.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/01_总览卡.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/01_总览卡.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 39. [MEDIUM] Potential historical version fork: '01_次级势力总表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '01_次级势力总表.md' exist across directories: 00_模板库/势力体系/01_次级势力总表.md, 04_星球档案/V-021 霜恸星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-035 极电星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-073 水星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-074 光年星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-077 重力星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-078 水晶星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-085 能量星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-151 星尘星/07_势力体系/01_次级势力总表.md, 04_星球档案/V-165 赤昼星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-166 盐骨星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-167 风蚀星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-168 井国星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-169 冠海星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-170 迁林星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-171 红叶星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-172 镜叶星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-173 琥珀云星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-174 沉云星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-175 青核星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-176 白潮星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-177 寂冻星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-178 蓝棺星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-179 浮礁星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-180 雨幕星/07_势力体系/势力/次级势力/01_次级势力总表.md, 04_星球档案/V-181 潮锁星/07_势力体系/势力/次级势力/01_次级势力总表.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/次级势力/01_次级势力总表.md.
- **Affected Files**:
  - `00_模板库/势力体系/01_次级势力总表.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-035 极电星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-073 水星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-074 光年星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-077 重力星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-085 能量星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/01_次级势力总表.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-168 井国星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-175 青核星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/势力/次级势力/01_次级势力总表.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/势力/次级势力/01_次级势力总表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 40. [MEDIUM] Potential historical version fork: '01_资源与生态基础.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '01_资源与生态基础.md' exist across directories: 04_星球档案/V-001 苔原-047/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-002 灰港星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-003 风暴星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-004 翠叶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-005 金沙星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-006 深渊星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-007 雪墓星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-008 层书星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-009 夜沙星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-010 歌云星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-011 镜潮星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-012 心火星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-013 孢云星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-014 鸣晶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-015 影晶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-016 霜环星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-017 锈河星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-018 浮叶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-019 鸣钟星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-020 镜沙星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-022 气旋星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-023 磁暴星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-024 沸海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-025 织网星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-026 涡流星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-027 晶海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-028 基因星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-029 梦泽星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-030 熔核星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-031 灰核星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-032 磁渊星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-033 灰烬星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-034 寄生星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-036 碎刃星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-037 光棱星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-038 尘歌星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-039 雾隐星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-040 血藤星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-041 雷泽星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-042 铁锈星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-043 浮冰星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-044 沙海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-045 深渊海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-046 磁极星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-047 幽光星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-048 声波星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-049 潮汐星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-050 死寂星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-052 火雨星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-053 冰风暴星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-054 熔岩星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-055 晶核星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-057 回声星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-058 碎星带/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-059 晶尘星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-060 暗物质星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-061 孢子星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-062 磁星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-063 气态巨星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-064 雾霭星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-065 星云星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-066 裂谷星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-067 浮岛星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-079 生命星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-080 混沌星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-081 灵能星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-082 时间星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-083 虚空星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-084 维度星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-086 星核星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-087 光明星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-088 暗黑星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-089 晶灵星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-090 机械星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-091 冰巨星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-092 重力波星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-093 光速星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-094 空间星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-095 意识星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-096 概率星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-097 梦境星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-104 秩序星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-105 暗物质星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-106 起源星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-107 鳞木星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-108 息土星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-109 锈骨星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-110 毒岚星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-111 晶髓星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-112 幽泉星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-113 狱火星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-114 蛊厄星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-115 铸心星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-116 幻蜃星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-117 渊噬星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-118 凛灾星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-119 震爆星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-120 蚀骨星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-121 烬灰星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-122 锈死星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-123 衰变星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-124 重压星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-125 极酸星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-126 孢子星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-127 幻魇星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-128 雷暴星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-129 冰晶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-130 胶沼星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-131 震荡星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-132 镜面星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-133 骨灰星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-134 沸石星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-135 毒晶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-136 黑洞星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-137 虚空回声星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-139 辐射星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-140 漩涡星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-141 腐蚀星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-142 磁陷星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-143 焦土星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-144 结晶海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-146 沸腾海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-147 超导冰原星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-152 气体巨行星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-153 脉冲星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-154 白矮星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-155 夸克星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-156 反物质星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-157 奇异质星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-159 音波星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-160 引力星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-161 幻象星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-162 梦境星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-163 植物星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-164 终极星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-165 赤昼星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-166 盐骨星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-167 风蚀星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-168 井国星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-169 冠海星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-170 迁林星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-171 红叶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-172 镜叶星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-173 琥珀云星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-174 沉云星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-175 青核星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-176 白潮星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-177 寂冻星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-178 蓝棺星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-179 浮礁星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-180 雨幕星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-181 潮锁星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-182 泡界星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-183 万峰星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-184 空谷星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-185 铁脊星/07_势力体系/01_资源与生态基础.md, 04_星球档案/V-186 震庭星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/01_资源与生态基础.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/01_资源与生态基础.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-002 灰港星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-003 风暴星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-004 翠叶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-008 层书星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-012 心火星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-025 织网星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-028 基因星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-048 声波星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-057 回声星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-062 磁星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-065 星云星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-079 生命星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-082 时间星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-084 维度星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-086 星核星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-087 光明星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-090 机械星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-093 光速星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-094 空间星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-095 意识星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-096 概率星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-106 起源星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-108 息土星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-124 重压星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-159 音波星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-160 引力星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-163 植物星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-164 终极星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-168 井国星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-175 青核星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-182 泡界星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/01_资源与生态基础.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/01_资源与生态基础.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/01_资源与生态基础.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 41. [MEDIUM] Potential historical version fork: '01_资源谱系总表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '01_资源谱系总表.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-002 灰港星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-003 风暴星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-005 金沙星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-006 深渊星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-008 层书星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-010 歌云星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-012 心火星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-013 孢云星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-015 影晶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-016 霜环星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-017 锈河星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-022 气旋星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-024 沸海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-025 织网星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-026 涡流星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-027 晶海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-028 基因星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-030 熔核星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-031 灰核星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-034 寄生星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-035 极电星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-037 光棱星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-040 血藤星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-044 沙海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-046 磁极星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-047 幽光星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-048 声波星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-050 死寂星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-052 火雨星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-055 晶核星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-057 回声星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-058 碎星带/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-061 孢子星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-062 磁星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-065 星云星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-072 寒星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-073 水星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-074 光年星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-077 重力星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-078 水晶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-079 生命星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-080 混沌星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-081 灵能星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-082 时间星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-083 虚空星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-084 维度星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-085 能量星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-086 星核星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-087 光明星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-090 机械星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-092 重力波星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-093 光速星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-094 空间星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-095 意识星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-096 概率星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-097 梦境星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-098 虚无星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-099 命运星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-100 永恒星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-102 自由星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-103 真理星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-104 秩序星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-106 起源星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-108 息土星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-113 狱火星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-115 铸心星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-119 震爆星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-122 锈死星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-123 衰变星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-124 重压星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-125 极酸星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-126 孢子星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-131 震荡星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-132 镜面星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-134 沸石星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-139 辐射星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-143 焦土星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-151 星尘星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-154 白矮星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-155 夸克星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-156 反物质星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-159 音波星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-160 引力星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-161 幻象星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-162 梦境星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-163 植物星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-164 终极星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-168 井国星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-169 冠海星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-170 迁林星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-171 红叶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-174 沉云星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-175 青核星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-176 白潮星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-182 泡界星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-183 万峰星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-184 空谷星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/01_资源谱系总表.md, 04_星球档案/V-186 震庭星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/01_资源谱系总表.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/01_资源谱系总表.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/01_资源谱系总表.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/01_资源谱系总表.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/01_资源谱系总表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 42. [MEDIUM] Potential historical version fork: '01_顶级势力总表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '01_顶级势力总表.md' exist across directories: 07_势力体系/V-079 生命星/01_顶级势力总表.md, 07_势力体系/V-080 混沌星/01_顶级势力总表.md, 07_势力体系/V-081 灵能星/01_顶级势力总表.md, 07_势力体系/V-082 时间星/01_顶级势力总表.md, 07_势力体系/V-083 虚空星/01_顶级势力总表.md, 07_势力体系/V-084 维度星/01_顶级势力总表.md, 04_星球档案/V-098 虚无星/07_势力体系/01_顶级势力总表.md, 04_星球档案/V-099 命运星/07_势力体系/01_顶级势力总表.md, 04_星球档案/V-100 永恒星/07_势力体系/01_顶级势力总表.md, 04_星球档案/V-101 灵魂星/07_势力体系/01_顶级势力总表.md, 04_星球档案/V-102 自由星/07_势力体系/01_顶级势力总表.md, 04_星球档案/V-103 真理星/07_势力体系/01_顶级势力总表.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/01_顶级势力总表.md`
  - `07_势力体系/V-080 混沌星/01_顶级势力总表.md`
  - `07_势力体系/V-081 灵能星/01_顶级势力总表.md`
  - `07_势力体系/V-082 时间星/01_顶级势力总表.md`
  - `07_势力体系/V-083 虚空星/01_顶级势力总表.md`
  - `07_势力体系/V-084 维度星/01_顶级势力总表.md`
  - `04_星球档案/V-098 虚无星/07_势力体系/01_顶级势力总表.md`
  - `04_星球档案/V-099 命运星/07_势力体系/01_顶级势力总表.md`
  - `04_星球档案/V-100 永恒星/07_势力体系/01_顶级势力总表.md`
  - `04_星球档案/V-101 灵魂星/07_势力体系/01_顶级势力总表.md`
  - `04_星球档案/V-102 自由星/07_势力体系/01_顶级势力总表.md`
  - `04_星球档案/V-103 真理星/07_势力体系/01_顶级势力总表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 43. [MEDIUM] Potential historical version fork: '02_次级势力总表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '02_次级势力总表.md' exist across directories: 07_势力体系/V-079 生命星/02_次级势力总表.md, 07_势力体系/V-080 混沌星/02_次级势力总表.md, 07_势力体系/V-081 灵能星/02_次级势力总表.md, 07_势力体系/V-082 时间星/02_次级势力总表.md, 07_势力体系/V-083 虚空星/02_次级势力总表.md, 07_势力体系/V-084 维度星/02_次级势力总表.md, 04_星球档案/V-098 虚无星/07_势力体系/02_次级势力总表.md, 04_星球档案/V-099 命运星/07_势力体系/02_次级势力总表.md, 04_星球档案/V-100 永恒星/07_势力体系/02_次级势力总表.md, 04_星球档案/V-101 灵魂星/07_势力体系/02_次级势力总表.md, 04_星球档案/V-102 自由星/07_势力体系/02_次级势力总表.md, 04_星球档案/V-103 真理星/07_势力体系/02_次级势力总表.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/02_次级势力总表.md`
  - `07_势力体系/V-080 混沌星/02_次级势力总表.md`
  - `07_势力体系/V-081 灵能星/02_次级势力总表.md`
  - `07_势力体系/V-082 时间星/02_次级势力总表.md`
  - `07_势力体系/V-083 虚空星/02_次级势力总表.md`
  - `07_势力体系/V-084 维度星/02_次级势力总表.md`
  - `04_星球档案/V-098 虚无星/07_势力体系/02_次级势力总表.md`
  - `04_星球档案/V-099 命运星/07_势力体系/02_次级势力总表.md`
  - `04_星球档案/V-100 永恒星/07_势力体系/02_次级势力总表.md`
  - `04_星球档案/V-101 灵魂星/07_势力体系/02_次级势力总表.md`
  - `04_星球档案/V-102 自由星/07_势力体系/02_次级势力总表.md`
  - `04_星球档案/V-103 真理星/07_势力体系/02_次级势力总表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 44. [MEDIUM] Potential historical version fork: '02_物质与能源系统.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '02_物质与能源系统.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-002 灰港星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-003 风暴星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-005 金沙星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-006 深渊星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-008 层书星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-010 歌云星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-012 心火星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-013 孢云星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-015 影晶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-016 霜环星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-017 锈河星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-022 气旋星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-024 沸海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-025 织网星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-026 涡流星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-027 晶海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-028 基因星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-030 熔核星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-031 灰核星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-034 寄生星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-035 极电星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-037 光棱星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-040 血藤星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-044 沙海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-046 磁极星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-047 幽光星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-048 声波星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-050 死寂星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-052 火雨星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-055 晶核星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-057 回声星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-058 碎星带/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-061 孢子星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-062 磁星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-065 星云星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-072 寒星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-073 水星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-074 光年星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-077 重力星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-078 水晶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-079 生命星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-080 混沌星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-081 灵能星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-082 时间星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-083 虚空星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-084 维度星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-085 能量星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-086 星核星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-087 光明星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-090 机械星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-092 重力波星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-093 光速星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-094 空间星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-095 意识星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-096 概率星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-097 梦境星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-098 虚无星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-099 命运星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-100 永恒星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-102 自由星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-103 真理星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-104 秩序星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-106 起源星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-108 息土星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-113 狱火星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-115 铸心星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-119 震爆星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-122 锈死星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-123 衰变星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-124 重压星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-125 极酸星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-126 孢子星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-131 震荡星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-132 镜面星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-134 沸石星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-139 辐射星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-143 焦土星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-151 星尘星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-154 白矮星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-155 夸克星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-156 反物质星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-159 音波星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-160 引力星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-161 幻象星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-162 梦境星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-163 植物星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-164 终极星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-168 井国星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-169 冠海星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-170 迁林星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-171 红叶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-174 沉云星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-175 青核星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-176 白潮星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-182 泡界星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-183 万峰星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-184 空谷星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/02_物质与能源系统.md, 04_星球档案/V-186 震庭星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/02_物质与能源系统.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/02_物质与能源系统.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/02_物质与能源系统.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/02_物质与能源系统.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/02_物质与能源系统.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 45. [MEDIUM] Potential historical version fork: '02_详细档案.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '02_详细档案.md' exist across directories: 04_星球档案/V-001 苔原-047/02_详细档案.md, 04_星球档案/V-002 灰港星/02_详细档案.md, 04_星球档案/V-003 风暴星/02_详细档案.md, 04_星球档案/V-004 翠叶星/02_详细档案.md, 04_星球档案/V-005 金沙星/02_详细档案.md, 04_星球档案/V-006 深渊星/02_详细档案.md, 04_星球档案/V-007 雪墓星/02_详细档案.md, 04_星球档案/V-008 层书星/02_详细档案.md, 04_星球档案/V-009 夜沙星/02_详细档案.md, 04_星球档案/V-010 歌云星/02_详细档案.md, 04_星球档案/V-011 镜潮星/02_详细档案.md, 04_星球档案/V-012 心火星/02_详细档案.md, 04_星球档案/V-013 孢云星/02_详细档案.md, 04_星球档案/V-014 鸣晶星/02_详细档案.md, 04_星球档案/V-015 影晶星/02_详细档案.md, 04_星球档案/V-016 霜环星/02_详细档案.md, 04_星球档案/V-017 锈河星/02_详细档案.md, 04_星球档案/V-018 浮叶星/02_详细档案.md, 04_星球档案/V-019 鸣钟星/02_详细档案.md, 04_星球档案/V-020 镜沙星/02_详细档案.md, 04_星球档案/V-021 霜恸星/02_详细档案.md, 04_星球档案/V-022 气旋星/02_详细档案.md, 04_星球档案/V-023 磁暴星/02_详细档案.md, 04_星球档案/V-024 沸海星/02_详细档案.md, 04_星球档案/V-025 织网星/02_详细档案.md, 04_星球档案/V-026 涡流星/02_详细档案.md, 04_星球档案/V-027 晶海星/02_详细档案.md, 04_星球档案/V-028 基因星/02_详细档案.md, 04_星球档案/V-029 梦泽星/02_详细档案.md, 04_星球档案/V-030 熔核星/02_详细档案.md, 04_星球档案/V-031 灰核星/02_详细档案.md, 04_星球档案/V-032 磁渊星/02_详细档案.md, 04_星球档案/V-033 灰烬星/02_详细档案.md, 04_星球档案/V-034 寄生星/02_详细档案.md, 04_星球档案/V-035 极电星/02_详细档案.md, 04_星球档案/V-036 碎刃星/02_详细档案.md, 04_星球档案/V-037 光棱星/02_详细档案.md, 04_星球档案/V-038 尘歌星/02_详细档案.md, 04_星球档案/V-039 雾隐星/02_详细档案.md, 04_星球档案/V-040 血藤星/02_详细档案.md, 04_星球档案/V-041 雷泽星/02_详细档案.md, 04_星球档案/V-042 铁锈星/02_详细档案.md, 04_星球档案/V-043 浮冰星/02_详细档案.md, 04_星球档案/V-044 沙海星/02_详细档案.md, 04_星球档案/V-045 深渊海星/02_详细档案.md, 04_星球档案/V-046 磁极星/02_详细档案.md, 04_星球档案/V-047 幽光星/02_详细档案.md, 04_星球档案/V-048 声波星/02_详细档案.md, 04_星球档案/V-049 潮汐星/02_详细档案.md, 04_星球档案/V-050 死寂星/02_详细档案.md, 04_星球档案/V-052 火雨星/02_详细档案.md, 04_星球档案/V-053 冰风暴星/02_详细档案.md, 04_星球档案/V-054 熔岩星/02_详细档案.md, 04_星球档案/V-055 晶核星/02_详细档案.md, 04_星球档案/V-056 重力缝隙星/02_详细档案.md, 04_星球档案/V-057 回声星/02_详细档案.md, 04_星球档案/V-058 碎星带/02_详细档案.md, 04_星球档案/V-059 晶尘星/02_详细档案.md, 04_星球档案/V-060 暗物质星/02_详细档案.md, 04_星球档案/V-061 孢子星/02_详细档案.md, 04_星球档案/V-062 磁星/02_详细档案.md, 04_星球档案/V-063 气态巨星/02_详细档案.md, 04_星球档案/V-064 雾霭星/02_详细档案.md, 04_星球档案/V-065 星云星/02_详细档案.md, 04_星球档案/V-066 裂谷星/02_详细档案.md, 04_星球档案/V-067 浮岛星/02_详细档案.md, 04_星球档案/V-068 蓝藻星/02_详细档案.md, 04_星球档案/V-069 极光磁暴星/02_详细档案.md, 04_星球档案/V-070 腐毒沼泽星/02_详细档案.md, 04_星球档案/V-071 重力扭曲星/02_详细档案.md, 04_星球档案/V-072 寒星/02_详细档案.md, 04_星球档案/V-073 水星/02_详细档案.md, 04_星球档案/V-074 光年星/02_详细档案.md, 04_星球档案/V-075 强碱腐蚀星/02_详细档案.md, 04_星球档案/V-076 微重力陨石星/02_详细档案.md, 04_星球档案/V-077 重力星/02_详细档案.md, 04_星球档案/V-078 水晶星/02_详细档案.md, 04_星球档案/V-079 生命星/02_详细档案.md, 04_星球档案/V-080 混沌星/02_详细档案.md, 04_星球档案/V-081 灵能星/02_详细档案.md, 04_星球档案/V-082 时间星/02_详细档案.md, 04_星球档案/V-083 虚空星/02_详细档案.md, 04_星球档案/V-084 维度星/02_详细档案.md, 04_星球档案/V-085 能量星/02_详细档案.md, 04_星球档案/V-086 星核星/02_详细档案.md, 04_星球档案/V-087 光明星/02_详细档案.md, 04_星球档案/V-088 暗黑星/02_详细档案.md, 04_星球档案/V-089 晶灵星/02_详细档案.md, 04_星球档案/V-090 机械星/02_详细档案.md, 04_星球档案/V-091 冰巨星/02_详细档案.md, 04_星球档案/V-092 重力波星/02_详细档案.md, 04_星球档案/V-093 光速星/02_详细档案.md, 04_星球档案/V-094 空间星/02_详细档案.md, 04_星球档案/V-095 意识星/02_详细档案.md, 04_星球档案/V-096 概率星/02_详细档案.md, 04_星球档案/V-097 梦境星/02_详细档案.md, 04_星球档案/V-098 虚无星/02_详细档案.md, 04_星球档案/V-099 命运星/02_详细档案.md, 04_星球档案/V-100 永恒星/02_详细档案.md, 04_星球档案/V-101 灵魂星/02_详细档案.md, 04_星球档案/V-102 自由星/02_详细档案.md, 04_星球档案/V-103 真理星/02_详细档案.md, 04_星球档案/V-104 秩序星/02_详细档案.md, 04_星球档案/V-105 暗物质星/02_详细档案.md, 04_星球档案/V-106 起源星/02_详细档案.md, 04_星球档案/V-107 鳞木星/02_详细档案.md, 04_星球档案/V-108 息土星/02_详细档案.md, 04_星球档案/V-109 锈骨星/02_详细档案.md, 04_星球档案/V-110 毒岚星/02_详细档案.md, 04_星球档案/V-111 晶髓星/02_详细档案.md, 04_星球档案/V-112 幽泉星/02_详细档案.md, 04_星球档案/V-113 狱火星/02_详细档案.md, 04_星球档案/V-114 蛊厄星/02_详细档案.md, 04_星球档案/V-115 铸心星/02_详细档案.md, 04_星球档案/V-116 幻蜃星/02_详细档案.md, 04_星球档案/V-117 渊噬星/02_详细档案.md, 04_星球档案/V-118 凛灾星/02_详细档案.md, 04_星球档案/V-119 震爆星/02_详细档案.md, 04_星球档案/V-120 蚀骨星/02_详细档案.md, 04_星球档案/V-121 烬灰星/02_详细档案.md, 04_星球档案/V-122 锈死星/02_详细档案.md, 04_星球档案/V-123 衰变星/02_详细档案.md, 04_星球档案/V-124 重压星/02_详细档案.md, 04_星球档案/V-125 极酸星/02_详细档案.md, 04_星球档案/V-126 孢子星/02_详细档案.md, 04_星球档案/V-127 幻魇星/02_详细档案.md, 04_星球档案/V-128 雷暴星/02_详细档案.md, 04_星球档案/V-129 冰晶星/02_详细档案.md, 04_星球档案/V-130 胶沼星/02_详细档案.md, 04_星球档案/V-131 震荡星/02_详细档案.md, 04_星球档案/V-132 镜面星/02_详细档案.md, 04_星球档案/V-133 骨灰星/02_详细档案.md, 04_星球档案/V-134 沸石星/02_详细档案.md, 04_星球档案/V-135 毒晶星/02_详细档案.md, 04_星球档案/V-136 黑洞星/02_详细档案.md, 04_星球档案/V-137 虚空回声星/02_详细档案.md, 04_星球档案/V-138 碎星带陨石星/02_详细档案.md, 04_星球档案/V-139 辐射星/02_详细档案.md, 04_星球档案/V-140 漩涡星/02_详细档案.md, 04_星球档案/V-141 腐蚀星/02_详细档案.md, 04_星球档案/V-142 磁陷星/02_详细档案.md, 04_星球档案/V-143 焦土星/02_详细档案.md, 04_星球档案/V-144 结晶海星/02_详细档案.md, 04_星球档案/V-145 虚空暗面星/02_详细档案.md, 04_星球档案/V-146 沸腾海星/02_详细档案.md, 04_星球档案/V-147 超导冰原星/02_详细档案.md, 04_星球档案/V-148 裂变废墟星/02_详细档案.md, 04_星球档案/V-149 液氮极寒星/02_详细档案.md, 04_星球档案/V-150 黑洞边缘星/02_详细档案.md, 04_星球档案/V-151 星尘星/02_详细档案.md, 04_星球档案/V-152 气体巨行星/02_详细档案.md, 04_星球档案/V-153 脉冲星/02_详细档案.md, 04_星球档案/V-154 白矮星/02_详细档案.md, 04_星球档案/V-155 夸克星/02_详细档案.md, 04_星球档案/V-156 反物质星/02_详细档案.md, 04_星球档案/V-157 奇异质星/02_详细档案.md, 04_星球档案/V-158 碎裂时空星/02_详细档案.md, 04_星球档案/V-159 音波星/02_详细档案.md, 04_星球档案/V-160 引力星/02_详细档案.md, 04_星球档案/V-161 幻象星/02_详细档案.md, 04_星球档案/V-162 梦境星/02_详细档案.md, 04_星球档案/V-163 植物星/02_详细档案.md, 04_星球档案/V-164 终极星/02_详细档案.md, 04_星球档案/V-165 赤昼星/02_详细档案.md, 04_星球档案/V-166 盐骨星/02_详细档案.md, 04_星球档案/V-167 风蚀星/02_详细档案.md, 04_星球档案/V-168 井国星/02_详细档案.md, 04_星球档案/V-169 冠海星/02_详细档案.md, 04_星球档案/V-170 迁林星/02_详细档案.md, 04_星球档案/V-171 红叶星/02_详细档案.md, 04_星球档案/V-172 镜叶星/02_详细档案.md, 04_星球档案/V-173 琥珀云星/02_详细档案.md, 04_星球档案/V-174 沉云星/02_详细档案.md, 04_星球档案/V-175 青核星/02_详细档案.md, 04_星球档案/V-176 白潮星/02_详细档案.md, 04_星球档案/V-177 寂冻星/02_详细档案.md, 04_星球档案/V-178 蓝棺星/02_详细档案.md, 04_星球档案/V-179 浮礁星/02_详细档案.md, 04_星球档案/V-180 雨幕星/02_详细档案.md, 04_星球档案/V-181 潮锁星/02_详细档案.md, 04_星球档案/V-182 泡界星/02_详细档案.md, 04_星球档案/V-183 万峰星/02_详细档案.md, 04_星球档案/V-184 空谷星/02_详细档案.md, 04_星球档案/V-185 铁脊星/02_详细档案.md, 04_星球档案/V-186 震庭星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/02_详细档案.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/02_详细档案.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/02_详细档案.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/02_详细档案.md`
  - `04_星球档案/V-002 灰港星/02_详细档案.md`
  - `04_星球档案/V-003 风暴星/02_详细档案.md`
  - `04_星球档案/V-004 翠叶星/02_详细档案.md`
  - `04_星球档案/V-005 金沙星/02_详细档案.md`
  - `04_星球档案/V-006 深渊星/02_详细档案.md`
  - `04_星球档案/V-007 雪墓星/02_详细档案.md`
  - `04_星球档案/V-008 层书星/02_详细档案.md`
  - `04_星球档案/V-009 夜沙星/02_详细档案.md`
  - `04_星球档案/V-010 歌云星/02_详细档案.md`
  - `04_星球档案/V-011 镜潮星/02_详细档案.md`
  - `04_星球档案/V-012 心火星/02_详细档案.md`
  - `04_星球档案/V-013 孢云星/02_详细档案.md`
  - `04_星球档案/V-014 鸣晶星/02_详细档案.md`
  - `04_星球档案/V-015 影晶星/02_详细档案.md`
  - `04_星球档案/V-016 霜环星/02_详细档案.md`
  - `04_星球档案/V-017 锈河星/02_详细档案.md`
  - `04_星球档案/V-018 浮叶星/02_详细档案.md`
  - `04_星球档案/V-019 鸣钟星/02_详细档案.md`
  - `04_星球档案/V-020 镜沙星/02_详细档案.md`
  - `04_星球档案/V-021 霜恸星/02_详细档案.md`
  - `04_星球档案/V-022 气旋星/02_详细档案.md`
  - `04_星球档案/V-023 磁暴星/02_详细档案.md`
  - `04_星球档案/V-024 沸海星/02_详细档案.md`
  - `04_星球档案/V-025 织网星/02_详细档案.md`
  - `04_星球档案/V-026 涡流星/02_详细档案.md`
  - `04_星球档案/V-027 晶海星/02_详细档案.md`
  - `04_星球档案/V-028 基因星/02_详细档案.md`
  - `04_星球档案/V-029 梦泽星/02_详细档案.md`
  - `04_星球档案/V-030 熔核星/02_详细档案.md`
  - `04_星球档案/V-031 灰核星/02_详细档案.md`
  - `04_星球档案/V-032 磁渊星/02_详细档案.md`
  - `04_星球档案/V-033 灰烬星/02_详细档案.md`
  - `04_星球档案/V-034 寄生星/02_详细档案.md`
  - `04_星球档案/V-035 极电星/02_详细档案.md`
  - `04_星球档案/V-036 碎刃星/02_详细档案.md`
  - `04_星球档案/V-037 光棱星/02_详细档案.md`
  - `04_星球档案/V-038 尘歌星/02_详细档案.md`
  - `04_星球档案/V-039 雾隐星/02_详细档案.md`
  - `04_星球档案/V-040 血藤星/02_详细档案.md`
  - `04_星球档案/V-041 雷泽星/02_详细档案.md`
  - `04_星球档案/V-042 铁锈星/02_详细档案.md`
  - `04_星球档案/V-043 浮冰星/02_详细档案.md`
  - `04_星球档案/V-044 沙海星/02_详细档案.md`
  - `04_星球档案/V-045 深渊海星/02_详细档案.md`
  - `04_星球档案/V-046 磁极星/02_详细档案.md`
  - `04_星球档案/V-047 幽光星/02_详细档案.md`
  - `04_星球档案/V-048 声波星/02_详细档案.md`
  - `04_星球档案/V-049 潮汐星/02_详细档案.md`
  - `04_星球档案/V-050 死寂星/02_详细档案.md`
  - `04_星球档案/V-052 火雨星/02_详细档案.md`
  - `04_星球档案/V-053 冰风暴星/02_详细档案.md`
  - `04_星球档案/V-054 熔岩星/02_详细档案.md`
  - `04_星球档案/V-055 晶核星/02_详细档案.md`
  - `04_星球档案/V-056 重力缝隙星/02_详细档案.md`
  - `04_星球档案/V-057 回声星/02_详细档案.md`
  - `04_星球档案/V-058 碎星带/02_详细档案.md`
  - `04_星球档案/V-059 晶尘星/02_详细档案.md`
  - `04_星球档案/V-060 暗物质星/02_详细档案.md`
  - `04_星球档案/V-061 孢子星/02_详细档案.md`
  - `04_星球档案/V-062 磁星/02_详细档案.md`
  - `04_星球档案/V-063 气态巨星/02_详细档案.md`
  - `04_星球档案/V-064 雾霭星/02_详细档案.md`
  - `04_星球档案/V-065 星云星/02_详细档案.md`
  - `04_星球档案/V-066 裂谷星/02_详细档案.md`
  - `04_星球档案/V-067 浮岛星/02_详细档案.md`
  - `04_星球档案/V-068 蓝藻星/02_详细档案.md`
  - `04_星球档案/V-069 极光磁暴星/02_详细档案.md`
  - `04_星球档案/V-070 腐毒沼泽星/02_详细档案.md`
  - `04_星球档案/V-071 重力扭曲星/02_详细档案.md`
  - `04_星球档案/V-072 寒星/02_详细档案.md`
  - `04_星球档案/V-073 水星/02_详细档案.md`
  - `04_星球档案/V-074 光年星/02_详细档案.md`
  - `04_星球档案/V-075 强碱腐蚀星/02_详细档案.md`
  - `04_星球档案/V-076 微重力陨石星/02_详细档案.md`
  - `04_星球档案/V-077 重力星/02_详细档案.md`
  - `04_星球档案/V-078 水晶星/02_详细档案.md`
  - `04_星球档案/V-079 生命星/02_详细档案.md`
  - `04_星球档案/V-080 混沌星/02_详细档案.md`
  - `04_星球档案/V-081 灵能星/02_详细档案.md`
  - `04_星球档案/V-082 时间星/02_详细档案.md`
  - `04_星球档案/V-083 虚空星/02_详细档案.md`
  - `04_星球档案/V-084 维度星/02_详细档案.md`
  - `04_星球档案/V-085 能量星/02_详细档案.md`
  - `04_星球档案/V-086 星核星/02_详细档案.md`
  - `04_星球档案/V-087 光明星/02_详细档案.md`
  - `04_星球档案/V-088 暗黑星/02_详细档案.md`
  - `04_星球档案/V-089 晶灵星/02_详细档案.md`
  - `04_星球档案/V-090 机械星/02_详细档案.md`
  - `04_星球档案/V-091 冰巨星/02_详细档案.md`
  - `04_星球档案/V-092 重力波星/02_详细档案.md`
  - `04_星球档案/V-093 光速星/02_详细档案.md`
  - `04_星球档案/V-094 空间星/02_详细档案.md`
  - `04_星球档案/V-095 意识星/02_详细档案.md`
  - `04_星球档案/V-096 概率星/02_详细档案.md`
  - `04_星球档案/V-097 梦境星/02_详细档案.md`
  - `04_星球档案/V-098 虚无星/02_详细档案.md`
  - `04_星球档案/V-099 命运星/02_详细档案.md`
  - `04_星球档案/V-100 永恒星/02_详细档案.md`
  - `04_星球档案/V-101 灵魂星/02_详细档案.md`
  - `04_星球档案/V-102 自由星/02_详细档案.md`
  - `04_星球档案/V-103 真理星/02_详细档案.md`
  - `04_星球档案/V-104 秩序星/02_详细档案.md`
  - `04_星球档案/V-105 暗物质星/02_详细档案.md`
  - `04_星球档案/V-106 起源星/02_详细档案.md`
  - `04_星球档案/V-107 鳞木星/02_详细档案.md`
  - `04_星球档案/V-108 息土星/02_详细档案.md`
  - `04_星球档案/V-109 锈骨星/02_详细档案.md`
  - `04_星球档案/V-110 毒岚星/02_详细档案.md`
  - `04_星球档案/V-111 晶髓星/02_详细档案.md`
  - `04_星球档案/V-112 幽泉星/02_详细档案.md`
  - `04_星球档案/V-113 狱火星/02_详细档案.md`
  - `04_星球档案/V-114 蛊厄星/02_详细档案.md`
  - `04_星球档案/V-115 铸心星/02_详细档案.md`
  - `04_星球档案/V-116 幻蜃星/02_详细档案.md`
  - `04_星球档案/V-117 渊噬星/02_详细档案.md`
  - `04_星球档案/V-118 凛灾星/02_详细档案.md`
  - `04_星球档案/V-119 震爆星/02_详细档案.md`
  - `04_星球档案/V-120 蚀骨星/02_详细档案.md`
  - `04_星球档案/V-121 烬灰星/02_详细档案.md`
  - `04_星球档案/V-122 锈死星/02_详细档案.md`
  - `04_星球档案/V-123 衰变星/02_详细档案.md`
  - `04_星球档案/V-124 重压星/02_详细档案.md`
  - `04_星球档案/V-125 极酸星/02_详细档案.md`
  - `04_星球档案/V-126 孢子星/02_详细档案.md`
  - `04_星球档案/V-127 幻魇星/02_详细档案.md`
  - `04_星球档案/V-128 雷暴星/02_详细档案.md`
  - `04_星球档案/V-129 冰晶星/02_详细档案.md`
  - `04_星球档案/V-130 胶沼星/02_详细档案.md`
  - `04_星球档案/V-131 震荡星/02_详细档案.md`
  - `04_星球档案/V-132 镜面星/02_详细档案.md`
  - `04_星球档案/V-133 骨灰星/02_详细档案.md`
  - `04_星球档案/V-134 沸石星/02_详细档案.md`
  - `04_星球档案/V-135 毒晶星/02_详细档案.md`
  - `04_星球档案/V-136 黑洞星/02_详细档案.md`
  - `04_星球档案/V-137 虚空回声星/02_详细档案.md`
  - `04_星球档案/V-138 碎星带陨石星/02_详细档案.md`
  - `04_星球档案/V-139 辐射星/02_详细档案.md`
  - `04_星球档案/V-140 漩涡星/02_详细档案.md`
  - `04_星球档案/V-141 腐蚀星/02_详细档案.md`
  - `04_星球档案/V-142 磁陷星/02_详细档案.md`
  - `04_星球档案/V-143 焦土星/02_详细档案.md`
  - `04_星球档案/V-144 结晶海星/02_详细档案.md`
  - `04_星球档案/V-145 虚空暗面星/02_详细档案.md`
  - `04_星球档案/V-146 沸腾海星/02_详细档案.md`
  - `04_星球档案/V-147 超导冰原星/02_详细档案.md`
  - `04_星球档案/V-148 裂变废墟星/02_详细档案.md`
  - `04_星球档案/V-149 液氮极寒星/02_详细档案.md`
  - `04_星球档案/V-150 黑洞边缘星/02_详细档案.md`
  - `04_星球档案/V-151 星尘星/02_详细档案.md`
  - `04_星球档案/V-152 气体巨行星/02_详细档案.md`
  - `04_星球档案/V-153 脉冲星/02_详细档案.md`
  - `04_星球档案/V-154 白矮星/02_详细档案.md`
  - `04_星球档案/V-155 夸克星/02_详细档案.md`
  - `04_星球档案/V-156 反物质星/02_详细档案.md`
  - `04_星球档案/V-157 奇异质星/02_详细档案.md`
  - `04_星球档案/V-158 碎裂时空星/02_详细档案.md`
  - `04_星球档案/V-159 音波星/02_详细档案.md`
  - `04_星球档案/V-160 引力星/02_详细档案.md`
  - `04_星球档案/V-161 幻象星/02_详细档案.md`
  - `04_星球档案/V-162 梦境星/02_详细档案.md`
  - `04_星球档案/V-163 植物星/02_详细档案.md`
  - `04_星球档案/V-164 终极星/02_详细档案.md`
  - `04_星球档案/V-165 赤昼星/02_详细档案.md`
  - `04_星球档案/V-166 盐骨星/02_详细档案.md`
  - `04_星球档案/V-167 风蚀星/02_详细档案.md`
  - `04_星球档案/V-168 井国星/02_详细档案.md`
  - `04_星球档案/V-169 冠海星/02_详细档案.md`
  - `04_星球档案/V-170 迁林星/02_详细档案.md`
  - `04_星球档案/V-171 红叶星/02_详细档案.md`
  - `04_星球档案/V-172 镜叶星/02_详细档案.md`
  - `04_星球档案/V-173 琥珀云星/02_详细档案.md`
  - `04_星球档案/V-174 沉云星/02_详细档案.md`
  - `04_星球档案/V-175 青核星/02_详细档案.md`
  - `04_星球档案/V-176 白潮星/02_详细档案.md`
  - `04_星球档案/V-177 寂冻星/02_详细档案.md`
  - `04_星球档案/V-178 蓝棺星/02_详细档案.md`
  - `04_星球档案/V-179 浮礁星/02_详细档案.md`
  - `04_星球档案/V-180 雨幕星/02_详细档案.md`
  - `04_星球档案/V-181 潮锁星/02_详细档案.md`
  - `04_星球档案/V-182 泡界星/02_详细档案.md`
  - `04_星球档案/V-183 万峰星/02_详细档案.md`
  - `04_星球档案/V-184 空谷星/02_详细档案.md`
  - `04_星球档案/V-185 铁脊星/02_详细档案.md`
  - `04_星球档案/V-186 震庭星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/02_详细档案.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/02_详细档案.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/02_详细档案.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 46. [MEDIUM] Potential historical version fork: '02_顶级势力总表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '02_顶级势力总表.md' exist across directories: 00_模板库/势力体系/02_顶级势力总表.md, 04_星球档案/V-001 苔原-047/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-002 灰港星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-003 风暴星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-004 翠叶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-005 金沙星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-006 深渊星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-007 雪墓星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-008 层书星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-009 夜沙星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-010 歌云星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-011 镜潮星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-012 心火星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-013 孢云星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-014 鸣晶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-015 影晶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-016 霜环星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-017 锈河星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-018 浮叶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-019 鸣钟星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-020 镜沙星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-021 霜恸星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-022 气旋星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-023 磁暴星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-024 沸海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-025 织网星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-026 涡流星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-027 晶海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-028 基因星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-029 梦泽星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-030 熔核星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-031 灰核星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-032 磁渊星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-033 灰烬星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-034 寄生星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-035 极电星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-036 碎刃星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-037 光棱星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-038 尘歌星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-039 雾隐星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-040 血藤星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-041 雷泽星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-042 铁锈星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-043 浮冰星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-044 沙海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-045 深渊海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-046 磁极星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-047 幽光星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-048 声波星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-049 潮汐星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-050 死寂星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-052 火雨星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-053 冰风暴星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-054 熔岩星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-055 晶核星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-057 回声星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-058 碎星带/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-059 晶尘星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-060 暗物质星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-061 孢子星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-062 磁星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-063 气态巨星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-064 雾霭星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-065 星云星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-066 裂谷星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-067 浮岛星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-068 蓝藻星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-072 寒星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-073 水星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-074 光年星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-077 重力星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-078 水晶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-079 生命星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-080 混沌星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-081 灵能星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-082 时间星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-083 虚空星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-084 维度星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-085 能量星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-086 星核星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-087 光明星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-088 暗黑星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-089 晶灵星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-090 机械星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-091 冰巨星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-092 重力波星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-093 光速星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-094 空间星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-095 意识星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-096 概率星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-097 梦境星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-104 秩序星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-105 暗物质星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-106 起源星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-107 鳞木星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-108 息土星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-109 锈骨星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-110 毒岚星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-111 晶髓星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-112 幽泉星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-113 狱火星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-114 蛊厄星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-115 铸心星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-116 幻蜃星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-117 渊噬星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-118 凛灾星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-119 震爆星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-120 蚀骨星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-121 烬灰星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-122 锈死星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-123 衰变星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-124 重压星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-125 极酸星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-126 孢子星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-127 幻魇星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-128 雷暴星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-129 冰晶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-130 胶沼星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-131 震荡星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-132 镜面星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-133 骨灰星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-134 沸石星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-135 毒晶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-136 黑洞星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-137 虚空回声星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-139 辐射星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-140 漩涡星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-141 腐蚀星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-142 磁陷星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-143 焦土星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-144 结晶海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-146 沸腾海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-147 超导冰原星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-151 星尘星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-152 气体巨行星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-153 脉冲星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-154 白矮星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-155 夸克星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-156 反物质星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-157 奇异质星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-159 音波星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-160 引力星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-161 幻象星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-162 梦境星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-163 植物星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-164 终极星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-165 赤昼星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-166 盐骨星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-167 风蚀星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-168 井国星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-169 冠海星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-170 迁林星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-171 红叶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-172 镜叶星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-173 琥珀云星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-174 沉云星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-175 青核星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-176 白潮星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-177 寂冻星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-178 蓝棺星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-179 浮礁星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-180 雨幕星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-181 潮锁星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-182 泡界星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-183 万峰星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-184 空谷星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-185 铁脊星/07_势力体系/02_顶级势力总表.md, 04_星球档案/V-186 震庭星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/02_顶级势力总表.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/02_顶级势力总表.md.
- **Affected Files**:
  - `00_模板库/势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-001 苔原-047/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-002 灰港星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-003 风暴星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-004 翠叶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-008 层书星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-012 心火星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-025 织网星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-028 基因星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-035 极电星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-048 声波星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-057 回声星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-062 磁星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-065 星云星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-068 蓝藻星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-072 寒星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-073 水星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-074 光年星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-077 重力星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-079 生命星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-082 时间星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-084 维度星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-085 能量星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-086 星核星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-087 光明星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-090 机械星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-093 光速星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-094 空间星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-095 意识星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-096 概率星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-106 起源星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-108 息土星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-124 重压星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-159 音波星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-160 引力星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-163 植物星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-164 终极星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-168 井国星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-175 青核星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-182 泡界星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/02_顶级势力总表.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/02_顶级势力总表.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/02_顶级势力总表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 47. [MEDIUM] Potential historical version fork: '03_势力关系总图.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '03_势力关系总图.md' exist across directories: 00_模板库/势力体系/03_势力关系总图.md, 07_势力体系/V-079 生命星/03_势力关系总图.md, 07_势力体系/V-080 混沌星/03_势力关系总图.md, 07_势力体系/V-081 灵能星/03_势力关系总图.md, 07_势力体系/V-082 时间星/03_势力关系总图.md, 07_势力体系/V-083 虚空星/03_势力关系总图.md, 07_势力体系/V-084 维度星/03_势力关系总图.md, 04_星球档案/V-001 苔原-047/07_势力体系/03_势力关系总图.md, 04_星球档案/V-002 灰港星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-003 风暴星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-004 翠叶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-005 金沙星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-006 深渊星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-007 雪墓星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-008 层书星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-009 夜沙星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-010 歌云星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-011 镜潮星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-012 心火星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-013 孢云星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-014 鸣晶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-015 影晶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-016 霜环星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-017 锈河星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-018 浮叶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-019 鸣钟星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-020 镜沙星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-021 霜恸星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-022 气旋星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-023 磁暴星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-024 沸海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-025 织网星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-026 涡流星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-027 晶海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-028 基因星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-029 梦泽星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-030 熔核星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-031 灰核星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-032 磁渊星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-033 灰烬星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-034 寄生星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-035 极电星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-036 碎刃星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-037 光棱星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-038 尘歌星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-039 雾隐星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-040 血藤星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-041 雷泽星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-042 铁锈星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-043 浮冰星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-044 沙海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-045 深渊海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-046 磁极星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-047 幽光星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-048 声波星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-049 潮汐星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-050 死寂星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-052 火雨星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-053 冰风暴星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-054 熔岩星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-055 晶核星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-057 回声星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-058 碎星带/07_势力体系/03_势力关系总图.md, 04_星球档案/V-059 晶尘星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-060 暗物质星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-061 孢子星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-062 磁星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-063 气态巨星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-064 雾霭星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-065 星云星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-066 裂谷星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-067 浮岛星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-073 水星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-074 光年星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-077 重力星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-078 水晶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-079 生命星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-080 混沌星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-081 灵能星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-082 时间星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-083 虚空星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-084 维度星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-085 能量星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-086 星核星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-087 光明星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-088 暗黑星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-089 晶灵星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-090 机械星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-091 冰巨星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-092 重力波星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-093 光速星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-094 空间星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-095 意识星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-096 概率星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-097 梦境星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-098 虚无星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-099 命运星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-100 永恒星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-101 灵魂星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-102 自由星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-103 真理星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-104 秩序星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-105 暗物质星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-106 起源星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-107 鳞木星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-108 息土星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-109 锈骨星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-110 毒岚星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-111 晶髓星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-112 幽泉星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-113 狱火星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-114 蛊厄星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-115 铸心星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-116 幻蜃星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-117 渊噬星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-118 凛灾星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-119 震爆星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-120 蚀骨星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-121 烬灰星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-122 锈死星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-123 衰变星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-124 重压星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-125 极酸星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-126 孢子星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-127 幻魇星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-128 雷暴星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-129 冰晶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-130 胶沼星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-131 震荡星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-132 镜面星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-133 骨灰星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-134 沸石星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-135 毒晶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-136 黑洞星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-137 虚空回声星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-139 辐射星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-140 漩涡星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-141 腐蚀星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-142 磁陷星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-143 焦土星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-144 结晶海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-146 沸腾海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-147 超导冰原星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-151 星尘星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-152 气体巨行星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-153 脉冲星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-154 白矮星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-155 夸克星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-156 反物质星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-157 奇异质星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-159 音波星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-160 引力星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-161 幻象星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-162 梦境星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-163 植物星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-164 终极星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-165 赤昼星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-166 盐骨星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-167 风蚀星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-168 井国星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-169 冠海星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-170 迁林星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-171 红叶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-172 镜叶星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-173 琥珀云星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-174 沉云星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-175 青核星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-176 白潮星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-177 寂冻星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-178 蓝棺星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-179 浮礁星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-180 雨幕星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-181 潮锁星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-182 泡界星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-183 万峰星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-184 空谷星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-185 铁脊星/07_势力体系/03_势力关系总图.md, 04_星球档案/V-186 震庭星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/03_势力关系总图.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/03_势力关系总图.md.
- **Affected Files**:
  - `00_模板库/势力体系/03_势力关系总图.md`
  - `07_势力体系/V-079 生命星/03_势力关系总图.md`
  - `07_势力体系/V-080 混沌星/03_势力关系总图.md`
  - `07_势力体系/V-081 灵能星/03_势力关系总图.md`
  - `07_势力体系/V-082 时间星/03_势力关系总图.md`
  - `07_势力体系/V-083 虚空星/03_势力关系总图.md`
  - `07_势力体系/V-084 维度星/03_势力关系总图.md`
  - `04_星球档案/V-001 苔原-047/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-002 灰港星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-003 风暴星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-004 翠叶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-008 层书星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-012 心火星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-025 织网星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-028 基因星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-035 极电星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-048 声波星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-057 回声星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-062 磁星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-065 星云星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-073 水星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-074 光年星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-077 重力星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-079 生命星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-082 时间星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-084 维度星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-085 能量星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-086 星核星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-087 光明星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-090 机械星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-093 光速星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-094 空间星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-095 意识星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-096 概率星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-098 虚无星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-099 命运星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-100 永恒星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-101 灵魂星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-102 自由星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-103 真理星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-106 起源星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-108 息土星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-124 重压星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-159 音波星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-160 引力星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-163 植物星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-164 终极星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-168 井国星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-175 青核星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-182 泡界星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/03_势力关系总图.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/03_势力关系总图.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/03_势力关系总图.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 48. [MEDIUM] Potential historical version fork: '03_医疗与精神系统.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '03_医疗与精神系统.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-002 灰港星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-003 风暴星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-005 金沙星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-006 深渊星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-008 层书星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-010 歌云星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-012 心火星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-013 孢云星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-015 影晶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-016 霜环星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-017 锈河星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-022 气旋星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-024 沸海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-025 织网星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-026 涡流星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-027 晶海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-028 基因星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-030 熔核星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-031 灰核星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-034 寄生星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-035 极电星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-037 光棱星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-040 血藤星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-044 沙海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-046 磁极星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-047 幽光星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-048 声波星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-050 死寂星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-052 火雨星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-055 晶核星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-057 回声星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-058 碎星带/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-061 孢子星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-062 磁星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-065 星云星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-072 寒星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-073 水星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-074 光年星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-077 重力星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-078 水晶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-079 生命星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-080 混沌星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-081 灵能星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-082 时间星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-083 虚空星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-084 维度星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-085 能量星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-086 星核星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-087 光明星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-090 机械星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-092 重力波星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-093 光速星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-094 空间星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-095 意识星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-096 概率星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-097 梦境星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-098 虚无星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-099 命运星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-100 永恒星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-102 自由星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-103 真理星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-104 秩序星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-106 起源星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-108 息土星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-113 狱火星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-115 铸心星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-119 震爆星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-122 锈死星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-123 衰变星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-124 重压星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-125 极酸星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-126 孢子星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-131 震荡星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-132 镜面星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-134 沸石星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-139 辐射星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-143 焦土星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-151 星尘星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-154 白矮星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-155 夸克星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-156 反物质星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-159 音波星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-160 引力星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-161 幻象星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-162 梦境星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-163 植物星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-164 终极星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-168 井国星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-169 冠海星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-170 迁林星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-171 红叶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-174 沉云星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-175 青核星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-176 白潮星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-182 泡界星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-183 万峰星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-184 空谷星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/03_医疗与精神系统.md, 04_星球档案/V-186 震庭星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/03_医疗与精神系统.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/03_医疗与精神系统.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/03_医疗与精神系统.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/03_医疗与精神系统.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/03_医疗与精神系统.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 49. [MEDIUM] Potential historical version fork: '03_次级势力总表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '03_次级势力总表.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/03_次级势力总表.md, 04_星球档案/V-072 寒星/07_势力体系/03_次级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/03_次级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/03_次级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/03_次级势力总表.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/03_次级势力总表.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/03_次级势力总表.md`
  - `04_星球档案/V-072 寒星/07_势力体系/03_次级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/03_次级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/03_次级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/03_次级势力总表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/03_次级势力总表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 50. [MEDIUM] Potential historical version fork: '04_势力关系总图.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '04_势力关系总图.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/04_势力关系总图.md, 04_星球档案/V-072 寒星/07_势力体系/04_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/04_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/04_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/04_势力关系总图.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/04_势力关系总图.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/04_势力关系总图.md`
  - `04_星球档案/V-072 寒星/07_势力体系/04_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/04_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/04_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/04_势力关系总图.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/04_势力关系总图.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 51. [MEDIUM] Potential historical version fork: '04_基础设施与关键节点.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '04_基础设施与关键节点.md' exist across directories: 04_星球档案/V-001 苔原-047/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-002 灰港星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-003 风暴星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-004 翠叶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-005 金沙星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-006 深渊星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-007 雪墓星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-008 层书星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-009 夜沙星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-010 歌云星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-011 镜潮星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-012 心火星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-013 孢云星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-014 鸣晶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-015 影晶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-016 霜环星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-017 锈河星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-018 浮叶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-019 鸣钟星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-020 镜沙星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-021 霜恸星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-022 气旋星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-023 磁暴星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-024 沸海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-025 织网星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-026 涡流星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-027 晶海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-028 基因星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-029 梦泽星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-030 熔核星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-031 灰核星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-032 磁渊星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-033 灰烬星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-034 寄生星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-035 极电星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-036 碎刃星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-037 光棱星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-038 尘歌星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-039 雾隐星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-040 血藤星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-041 雷泽星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-042 铁锈星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-043 浮冰星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-044 沙海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-045 深渊海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-046 磁极星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-047 幽光星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-048 声波星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-049 潮汐星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-050 死寂星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-052 火雨星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-053 冰风暴星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-054 熔岩星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-055 晶核星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-057 回声星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-058 碎星带/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-059 晶尘星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-060 暗物质星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-061 孢子星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-062 磁星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-063 气态巨星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-064 雾霭星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-065 星云星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-066 裂谷星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-067 浮岛星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-079 生命星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-080 混沌星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-081 灵能星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-082 时间星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-083 虚空星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-084 维度星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-085 能量星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-086 星核星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-087 光明星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-088 暗黑星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-089 晶灵星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-090 机械星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-091 冰巨星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-092 重力波星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-093 光速星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-094 空间星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-095 意识星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-096 概率星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-097 梦境星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-104 秩序星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-105 暗物质星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-106 起源星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-107 鳞木星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-108 息土星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-109 锈骨星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-110 毒岚星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-111 晶髓星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-112 幽泉星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-113 狱火星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-114 蛊厄星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-115 铸心星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-116 幻蜃星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-117 渊噬星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-118 凛灾星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-119 震爆星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-120 蚀骨星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-121 烬灰星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-122 锈死星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-123 衰变星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-124 重压星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-125 极酸星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-126 孢子星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-127 幻魇星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-128 雷暴星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-129 冰晶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-130 胶沼星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-131 震荡星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-132 镜面星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-133 骨灰星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-134 沸石星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-135 毒晶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-136 黑洞星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-137 虚空回声星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-139 辐射星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-140 漩涡星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-141 腐蚀星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-142 磁陷星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-143 焦土星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-144 结晶海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-146 沸腾海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-147 超导冰原星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-152 气体巨行星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-153 脉冲星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-154 白矮星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-155 夸克星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-156 反物质星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-157 奇异质星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-159 音波星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-160 引力星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-161 幻象星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-162 梦境星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-163 植物星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-164 终极星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-165 赤昼星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-166 盐骨星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-167 风蚀星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-168 井国星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-169 冠海星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-170 迁林星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-171 红叶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-172 镜叶星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-173 琥珀云星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-174 沉云星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-175 青核星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-176 白潮星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-177 寂冻星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-178 蓝棺星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-179 浮礁星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-180 雨幕星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-181 潮锁星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-182 泡界星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-183 万峰星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-184 空谷星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-185 铁脊星/07_势力体系/04_基础设施与关键节点.md, 04_星球档案/V-186 震庭星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/04_基础设施与关键节点.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/04_基础设施与关键节点.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-002 灰港星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-003 风暴星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-004 翠叶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-008 层书星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-012 心火星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-025 织网星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-028 基因星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-035 极电星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-048 声波星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-057 回声星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-062 磁星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-065 星云星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-079 生命星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-082 时间星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-084 维度星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-085 能量星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-086 星核星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-087 光明星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-090 机械星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-093 光速星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-094 空间星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-095 意识星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-096 概率星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-106 起源星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-108 息土星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-124 重压星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-159 音波星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-160 引力星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-163 植物星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-164 终极星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-168 井国星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-175 青核星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-182 泡界星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/04_基础设施与关键节点.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/04_基础设施与关键节点.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/04_基础设施与关键节点.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 52. [MEDIUM] Potential historical version fork: '04_基础设施与资源闭环.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '04_基础设施与资源闭环.md' exist across directories: 00_模板库/势力体系/04_基础设施与资源闭环.md, 07_势力体系/V-079 生命星/04_基础设施与资源闭环.md, 07_势力体系/V-080 混沌星/04_基础设施与资源闭环.md, 07_势力体系/V-081 灵能星/04_基础设施与资源闭环.md, 07_势力体系/V-082 时间星/04_基础设施与资源闭环.md, 07_势力体系/V-083 虚空星/04_基础设施与资源闭环.md, 07_势力体系/V-084 维度星/04_基础设施与资源闭环.md, 04_星球档案/V-073 水星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-074 光年星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-077 重力星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-078 水晶星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-098 虚无星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-099 命运星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-100 永恒星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-101 灵魂星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-102 自由星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-103 真理星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/04_基础设施与资源闭环.md, 04_星球档案/V-151 星尘星/07_势力体系/04_基础设施与资源闭环.md.
- **Affected Files**:
  - `00_模板库/势力体系/04_基础设施与资源闭环.md`
  - `07_势力体系/V-079 生命星/04_基础设施与资源闭环.md`
  - `07_势力体系/V-080 混沌星/04_基础设施与资源闭环.md`
  - `07_势力体系/V-081 灵能星/04_基础设施与资源闭环.md`
  - `07_势力体系/V-082 时间星/04_基础设施与资源闭环.md`
  - `07_势力体系/V-083 虚空星/04_基础设施与资源闭环.md`
  - `07_势力体系/V-084 维度星/04_基础设施与资源闭环.md`
  - `04_星球档案/V-073 水星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-074 光年星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-077 重力星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-098 虚无星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-099 命运星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-100 永恒星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-101 灵魂星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-102 自由星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-103 真理星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/04_基础设施与资源闭环.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/04_基础设施与资源闭环.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 53. [MEDIUM] Potential historical version fork: '04_生态与空间系统.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '04_生态与空间系统.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-002 灰港星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-003 风暴星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-005 金沙星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-006 深渊星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-008 层书星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-010 歌云星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-012 心火星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-013 孢云星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-015 影晶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-016 霜环星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-017 锈河星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-022 气旋星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-024 沸海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-025 织网星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-026 涡流星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-027 晶海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-028 基因星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-030 熔核星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-031 灰核星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-034 寄生星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-035 极电星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-037 光棱星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-040 血藤星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-044 沙海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-046 磁极星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-047 幽光星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-048 声波星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-050 死寂星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-052 火雨星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-055 晶核星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-057 回声星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-058 碎星带/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-061 孢子星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-062 磁星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-065 星云星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-072 寒星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-073 水星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-074 光年星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-077 重力星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-078 水晶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-079 生命星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-080 混沌星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-081 灵能星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-082 时间星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-083 虚空星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-084 维度星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-085 能量星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-086 星核星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-087 光明星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-090 机械星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-092 重力波星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-093 光速星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-094 空间星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-095 意识星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-096 概率星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-097 梦境星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-098 虚无星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-099 命运星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-100 永恒星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-102 自由星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-103 真理星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-104 秩序星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-106 起源星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-108 息土星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-113 狱火星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-115 铸心星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-119 震爆星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-122 锈死星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-123 衰变星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-124 重压星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-125 极酸星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-126 孢子星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-131 震荡星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-132 镜面星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-134 沸石星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-139 辐射星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-143 焦土星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-151 星尘星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-154 白矮星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-155 夸克星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-156 反物质星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-159 音波星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-160 引力星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-161 幻象星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-162 梦境星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-163 植物星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-164 终极星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-168 井国星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-169 冠海星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-170 迁林星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-171 红叶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-174 沉云星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-175 青核星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-176 白潮星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-182 泡界星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-183 万峰星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-184 空谷星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/04_生态与空间系统.md, 04_星球档案/V-186 震庭星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/04_生态与空间系统.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/04_生态与空间系统.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/04_生态与空间系统.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/04_生态与空间系统.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/04_生态与空间系统.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 54. [MEDIUM] Potential historical version fork: '05_势力档案_顶级势力A.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '05_势力档案_顶级势力A.md' exist across directories: 07_势力体系/V-079 生命星/05_势力档案_顶级势力A.md, 07_势力体系/V-080 混沌星/05_势力档案_顶级势力A.md, 07_势力体系/V-081 灵能星/05_势力档案_顶级势力A.md, 07_势力体系/V-082 时间星/05_势力档案_顶级势力A.md, 07_势力体系/V-083 虚空星/05_势力档案_顶级势力A.md, 07_势力体系/V-084 维度星/05_势力档案_顶级势力A.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/05_势力档案_顶级势力A.md`
  - `07_势力体系/V-080 混沌星/05_势力档案_顶级势力A.md`
  - `07_势力体系/V-081 灵能星/05_势力档案_顶级势力A.md`
  - `07_势力体系/V-082 时间星/05_势力档案_顶级势力A.md`
  - `07_势力体系/V-083 虚空星/05_势力档案_顶级势力A.md`
  - `07_势力体系/V-084 维度星/05_势力档案_顶级势力A.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 55. [MEDIUM] Potential historical version fork: '05_历史时间线.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '05_历史时间线.md' exist across directories: 04_星球档案/V-004 翠叶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-005 金沙星/07_势力体系/05_历史时间线.md, 04_星球档案/V-006 深渊星/07_势力体系/05_历史时间线.md, 04_星球档案/V-007 雪墓星/07_势力体系/05_历史时间线.md, 04_星球档案/V-008 层书星/07_势力体系/05_历史时间线.md, 04_星球档案/V-009 夜沙星/07_势力体系/05_历史时间线.md, 04_星球档案/V-010 歌云星/07_势力体系/05_历史时间线.md, 04_星球档案/V-011 镜潮星/07_势力体系/05_历史时间线.md, 04_星球档案/V-012 心火星/07_势力体系/05_历史时间线.md, 04_星球档案/V-013 孢云星/07_势力体系/05_历史时间线.md, 04_星球档案/V-014 鸣晶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-015 影晶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-016 霜环星/07_势力体系/05_历史时间线.md, 04_星球档案/V-017 锈河星/07_势力体系/05_历史时间线.md, 04_星球档案/V-018 浮叶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-019 鸣钟星/07_势力体系/05_历史时间线.md, 04_星球档案/V-020 镜沙星/07_势力体系/05_历史时间线.md, 04_星球档案/V-021 霜恸星/07_势力体系/05_历史时间线.md, 04_星球档案/V-022 气旋星/07_势力体系/05_历史时间线.md, 04_星球档案/V-023 磁暴星/07_势力体系/05_历史时间线.md, 04_星球档案/V-024 沸海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-025 织网星/07_势力体系/05_历史时间线.md, 04_星球档案/V-026 涡流星/07_势力体系/05_历史时间线.md, 04_星球档案/V-027 晶海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-028 基因星/07_势力体系/05_历史时间线.md, 04_星球档案/V-029 梦泽星/07_势力体系/05_历史时间线.md, 04_星球档案/V-030 熔核星/07_势力体系/05_历史时间线.md, 04_星球档案/V-031 灰核星/07_势力体系/05_历史时间线.md, 04_星球档案/V-032 磁渊星/07_势力体系/05_历史时间线.md, 04_星球档案/V-033 灰烬星/07_势力体系/05_历史时间线.md, 04_星球档案/V-034 寄生星/07_势力体系/05_历史时间线.md, 04_星球档案/V-035 极电星/07_势力体系/05_历史时间线.md, 04_星球档案/V-036 碎刃星/07_势力体系/05_历史时间线.md, 04_星球档案/V-037 光棱星/07_势力体系/05_历史时间线.md, 04_星球档案/V-038 尘歌星/07_势力体系/05_历史时间线.md, 04_星球档案/V-039 雾隐星/07_势力体系/05_历史时间线.md, 04_星球档案/V-040 血藤星/07_势力体系/05_历史时间线.md, 04_星球档案/V-041 雷泽星/07_势力体系/05_历史时间线.md, 04_星球档案/V-042 铁锈星/07_势力体系/05_历史时间线.md, 04_星球档案/V-043 浮冰星/07_势力体系/05_历史时间线.md, 04_星球档案/V-044 沙海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-045 深渊海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-046 磁极星/07_势力体系/05_历史时间线.md, 04_星球档案/V-047 幽光星/07_势力体系/05_历史时间线.md, 04_星球档案/V-048 声波星/07_势力体系/05_历史时间线.md, 04_星球档案/V-049 潮汐星/07_势力体系/05_历史时间线.md, 04_星球档案/V-050 死寂星/07_势力体系/05_历史时间线.md, 04_星球档案/V-052 火雨星/07_势力体系/05_历史时间线.md, 04_星球档案/V-053 冰风暴星/07_势力体系/05_历史时间线.md, 04_星球档案/V-054 熔岩星/07_势力体系/05_历史时间线.md, 04_星球档案/V-055 晶核星/07_势力体系/05_历史时间线.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/05_历史时间线.md, 04_星球档案/V-057 回声星/07_势力体系/05_历史时间线.md, 04_星球档案/V-058 碎星带/07_势力体系/05_历史时间线.md, 04_星球档案/V-059 晶尘星/07_势力体系/05_历史时间线.md, 04_星球档案/V-060 暗物质星/07_势力体系/05_历史时间线.md, 04_星球档案/V-061 孢子星/07_势力体系/05_历史时间线.md, 04_星球档案/V-062 磁星/07_势力体系/05_历史时间线.md, 04_星球档案/V-063 气态巨星/07_势力体系/05_历史时间线.md, 04_星球档案/V-064 雾霭星/07_势力体系/05_历史时间线.md, 04_星球档案/V-065 星云星/07_势力体系/05_历史时间线.md, 04_星球档案/V-066 裂谷星/07_势力体系/05_历史时间线.md, 04_星球档案/V-067 浮岛星/07_势力体系/05_历史时间线.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/05_历史时间线.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/05_历史时间线.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/05_历史时间线.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/05_历史时间线.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/05_历史时间线.md, 04_星球档案/V-079 生命星/07_势力体系/05_历史时间线.md, 04_星球档案/V-080 混沌星/07_势力体系/05_历史时间线.md, 04_星球档案/V-081 灵能星/07_势力体系/05_历史时间线.md, 04_星球档案/V-082 时间星/07_势力体系/05_历史时间线.md, 04_星球档案/V-083 虚空星/07_势力体系/05_历史时间线.md, 04_星球档案/V-084 维度星/07_势力体系/05_历史时间线.md, 04_星球档案/V-085 能量星/07_势力体系/05_历史时间线.md, 04_星球档案/V-086 星核星/07_势力体系/05_历史时间线.md, 04_星球档案/V-087 光明星/07_势力体系/05_历史时间线.md, 04_星球档案/V-088 暗黑星/07_势力体系/05_历史时间线.md, 04_星球档案/V-089 晶灵星/07_势力体系/05_历史时间线.md, 04_星球档案/V-090 机械星/07_势力体系/05_历史时间线.md, 04_星球档案/V-091 冰巨星/07_势力体系/05_历史时间线.md, 04_星球档案/V-092 重力波星/07_势力体系/05_历史时间线.md, 04_星球档案/V-093 光速星/07_势力体系/05_历史时间线.md, 04_星球档案/V-094 空间星/07_势力体系/05_历史时间线.md, 04_星球档案/V-095 意识星/07_势力体系/05_历史时间线.md, 04_星球档案/V-096 概率星/07_势力体系/05_历史时间线.md, 04_星球档案/V-097 梦境星/07_势力体系/05_历史时间线.md, 04_星球档案/V-104 秩序星/07_势力体系/05_历史时间线.md, 04_星球档案/V-105 暗物质星/07_势力体系/05_历史时间线.md, 04_星球档案/V-106 起源星/07_势力体系/05_历史时间线.md, 04_星球档案/V-107 鳞木星/07_势力体系/05_历史时间线.md, 04_星球档案/V-108 息土星/07_势力体系/05_历史时间线.md, 04_星球档案/V-109 锈骨星/07_势力体系/05_历史时间线.md, 04_星球档案/V-110 毒岚星/07_势力体系/05_历史时间线.md, 04_星球档案/V-111 晶髓星/07_势力体系/05_历史时间线.md, 04_星球档案/V-112 幽泉星/07_势力体系/05_历史时间线.md, 04_星球档案/V-113 狱火星/07_势力体系/05_历史时间线.md, 04_星球档案/V-114 蛊厄星/07_势力体系/05_历史时间线.md, 04_星球档案/V-115 铸心星/07_势力体系/05_历史时间线.md, 04_星球档案/V-116 幻蜃星/07_势力体系/05_历史时间线.md, 04_星球档案/V-117 渊噬星/07_势力体系/05_历史时间线.md, 04_星球档案/V-118 凛灾星/07_势力体系/05_历史时间线.md, 04_星球档案/V-119 震爆星/07_势力体系/05_历史时间线.md, 04_星球档案/V-120 蚀骨星/07_势力体系/05_历史时间线.md, 04_星球档案/V-121 烬灰星/07_势力体系/05_历史时间线.md, 04_星球档案/V-122 锈死星/07_势力体系/05_历史时间线.md, 04_星球档案/V-123 衰变星/07_势力体系/05_历史时间线.md, 04_星球档案/V-124 重压星/07_势力体系/05_历史时间线.md, 04_星球档案/V-125 极酸星/07_势力体系/05_历史时间线.md, 04_星球档案/V-126 孢子星/07_势力体系/05_历史时间线.md, 04_星球档案/V-127 幻魇星/07_势力体系/05_历史时间线.md, 04_星球档案/V-128 雷暴星/07_势力体系/05_历史时间线.md, 04_星球档案/V-129 冰晶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-130 胶沼星/07_势力体系/05_历史时间线.md, 04_星球档案/V-131 震荡星/07_势力体系/05_历史时间线.md, 04_星球档案/V-132 镜面星/07_势力体系/05_历史时间线.md, 04_星球档案/V-133 骨灰星/07_势力体系/05_历史时间线.md, 04_星球档案/V-134 沸石星/07_势力体系/05_历史时间线.md, 04_星球档案/V-135 毒晶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-136 黑洞星/07_势力体系/05_历史时间线.md, 04_星球档案/V-137 虚空回声星/07_势力体系/05_历史时间线.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/05_历史时间线.md, 04_星球档案/V-139 辐射星/07_势力体系/05_历史时间线.md, 04_星球档案/V-140 漩涡星/07_势力体系/05_历史时间线.md, 04_星球档案/V-141 腐蚀星/07_势力体系/05_历史时间线.md, 04_星球档案/V-142 磁陷星/07_势力体系/05_历史时间线.md, 04_星球档案/V-143 焦土星/07_势力体系/05_历史时间线.md, 04_星球档案/V-144 结晶海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/05_历史时间线.md, 04_星球档案/V-146 沸腾海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-147 超导冰原星/07_势力体系/05_历史时间线.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/05_历史时间线.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/05_历史时间线.md, 04_星球档案/V-152 气体巨行星/07_势力体系/05_历史时间线.md, 04_星球档案/V-153 脉冲星/07_势力体系/05_历史时间线.md, 04_星球档案/V-154 白矮星/07_势力体系/05_历史时间线.md, 04_星球档案/V-155 夸克星/07_势力体系/05_历史时间线.md, 04_星球档案/V-156 反物质星/07_势力体系/05_历史时间线.md, 04_星球档案/V-157 奇异质星/07_势力体系/05_历史时间线.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/05_历史时间线.md, 04_星球档案/V-159 音波星/07_势力体系/05_历史时间线.md, 04_星球档案/V-160 引力星/07_势力体系/05_历史时间线.md, 04_星球档案/V-161 幻象星/07_势力体系/05_历史时间线.md, 04_星球档案/V-162 梦境星/07_势力体系/05_历史时间线.md, 04_星球档案/V-163 植物星/07_势力体系/05_历史时间线.md, 04_星球档案/V-164 终极星/07_势力体系/05_历史时间线.md, 04_星球档案/V-165 赤昼星/07_势力体系/05_历史时间线.md, 04_星球档案/V-166 盐骨星/07_势力体系/05_历史时间线.md, 04_星球档案/V-167 风蚀星/07_势力体系/05_历史时间线.md, 04_星球档案/V-168 井国星/07_势力体系/05_历史时间线.md, 04_星球档案/V-169 冠海星/07_势力体系/05_历史时间线.md, 04_星球档案/V-170 迁林星/07_势力体系/05_历史时间线.md, 04_星球档案/V-171 红叶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-172 镜叶星/07_势力体系/05_历史时间线.md, 04_星球档案/V-173 琥珀云星/07_势力体系/05_历史时间线.md, 04_星球档案/V-174 沉云星/07_势力体系/05_历史时间线.md, 04_星球档案/V-175 青核星/07_势力体系/05_历史时间线.md, 04_星球档案/V-176 白潮星/07_势力体系/05_历史时间线.md, 04_星球档案/V-177 寂冻星/07_势力体系/05_历史时间线.md, 04_星球档案/V-178 蓝棺星/07_势力体系/05_历史时间线.md, 04_星球档案/V-179 浮礁星/07_势力体系/05_历史时间线.md, 04_星球档案/V-180 雨幕星/07_势力体系/05_历史时间线.md, 04_星球档案/V-181 潮锁星/07_势力体系/05_历史时间线.md, 04_星球档案/V-182 泡界星/07_势力体系/05_历史时间线.md, 04_星球档案/V-183 万峰星/07_势力体系/05_历史时间线.md, 04_星球档案/V-184 空谷星/07_势力体系/05_历史时间线.md, 04_星球档案/V-185 铁脊星/07_势力体系/05_历史时间线.md, 04_星球档案/V-186 震庭星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/05_历史时间线.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/05_历史时间线.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-008 层书星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-012 心火星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-025 织网星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-028 基因星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-035 极电星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-048 声波星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-057 回声星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-062 磁星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-065 星云星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-079 生命星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-082 时间星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-084 维度星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-085 能量星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-086 星核星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-087 光明星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-090 机械星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-093 光速星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-094 空间星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-095 意识星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-096 概率星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-106 起源星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-108 息土星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-124 重压星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-159 音波星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-160 引力星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-163 植物星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-164 终极星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-168 井国星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-175 青核星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-182 泡界星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/05_历史时间线.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/05_历史时间线.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/05_历史时间线.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 56. [MEDIUM] Potential historical version fork: '05_基础设施与资源闭环.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '05_基础设施与资源闭环.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/05_基础设施与资源闭环.md, 04_星球档案/V-072 寒星/07_势力体系/05_基础设施与资源闭环.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/05_基础设施与资源闭环.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/05_基础设施与资源闭环.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/05_基础设施与资源闭环.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/05_基础设施与资源闭环.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/05_基础设施与资源闭环.md`
  - `04_星球档案/V-072 寒星/07_势力体系/05_基础设施与资源闭环.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/05_基础设施与资源闭环.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/05_基础设施与资源闭环.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/05_基础设施与资源闭环.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/05_基础设施与资源闭环.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 57. [MEDIUM] Potential historical version fork: '05_星际关系筛查表.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '05_星际关系筛查表.md' exist across directories: 04_星球档案/V-001 苔原-047/05_星际关系筛查表.md, 04_星球档案/V-002 灰港星/05_星际关系筛查表.md, 04_星球档案/V-003 风暴星/05_星际关系筛查表.md, 04_星球档案/V-004 翠叶星/05_星际关系筛查表.md, 04_星球档案/V-005 金沙星/05_星际关系筛查表.md, 04_星球档案/V-006 深渊星/05_星际关系筛查表.md, 04_星球档案/V-007 雪墓星/05_星际关系筛查表.md, 04_星球档案/V-008 层书星/05_星际关系筛查表.md, 04_星球档案/V-009 夜沙星/05_星际关系筛查表.md, 04_星球档案/V-010 歌云星/05_星际关系筛查表.md, 04_星球档案/V-011 镜潮星/05_星际关系筛查表.md, 04_星球档案/V-012 心火星/05_星际关系筛查表.md, 04_星球档案/V-013 孢云星/05_星际关系筛查表.md, 04_星球档案/V-014 鸣晶星/05_星际关系筛查表.md, 04_星球档案/V-015 影晶星/05_星际关系筛查表.md, 04_星球档案/V-016 霜环星/05_星际关系筛查表.md, 04_星球档案/V-017 锈河星/05_星际关系筛查表.md, 04_星球档案/V-018 浮叶星/05_星际关系筛查表.md, 04_星球档案/V-019 鸣钟星/05_星际关系筛查表.md, 04_星球档案/V-020 镜沙星/05_星际关系筛查表.md, 04_星球档案/V-021 霜恸星/05_星际关系筛查表.md, 04_星球档案/V-022 气旋星/05_星际关系筛查表.md, 04_星球档案/V-023 磁暴星/05_星际关系筛查表.md, 04_星球档案/V-024 沸海星/05_星际关系筛查表.md, 04_星球档案/V-025 织网星/05_星际关系筛查表.md, 04_星球档案/V-026 涡流星/05_星际关系筛查表.md, 04_星球档案/V-027 晶海星/05_星际关系筛查表.md, 04_星球档案/V-028 基因星/05_星际关系筛查表.md, 04_星球档案/V-029 梦泽星/05_星际关系筛查表.md, 04_星球档案/V-030 熔核星/05_星际关系筛查表.md, 04_星球档案/V-031 灰核星/05_星际关系筛查表.md, 04_星球档案/V-032 磁渊星/05_星际关系筛查表.md, 04_星球档案/V-033 灰烬星/05_星际关系筛查表.md, 04_星球档案/V-034 寄生星/05_星际关系筛查表.md, 04_星球档案/V-035 极电星/05_星际关系筛查表.md, 04_星球档案/V-036 碎刃星/05_星际关系筛查表.md, 04_星球档案/V-037 光棱星/05_星际关系筛查表.md, 04_星球档案/V-038 尘歌星/05_星际关系筛查表.md, 04_星球档案/V-039 雾隐星/05_星际关系筛查表.md, 04_星球档案/V-040 血藤星/05_星际关系筛查表.md, 04_星球档案/V-041 雷泽星/05_星际关系筛查表.md, 04_星球档案/V-042 铁锈星/05_星际关系筛查表.md, 04_星球档案/V-043 浮冰星/05_星际关系筛查表.md, 04_星球档案/V-044 沙海星/05_星际关系筛查表.md, 04_星球档案/V-045 深渊海星/05_星际关系筛查表.md, 04_星球档案/V-046 磁极星/05_星际关系筛查表.md, 04_星球档案/V-047 幽光星/05_星际关系筛查表.md, 04_星球档案/V-048 声波星/05_星际关系筛查表.md, 04_星球档案/V-049 潮汐星/05_星际关系筛查表.md, 04_星球档案/V-050 死寂星/05_星际关系筛查表.md, 04_星球档案/V-052 火雨星/05_星际关系筛查表.md, 04_星球档案/V-053 冰风暴星/05_星际关系筛查表.md, 04_星球档案/V-054 熔岩星/05_星际关系筛查表.md, 04_星球档案/V-055 晶核星/05_星际关系筛查表.md, 04_星球档案/V-056 重力缝隙星/05_星际关系筛查表.md, 04_星球档案/V-057 回声星/05_星际关系筛查表.md, 04_星球档案/V-058 碎星带/05_星际关系筛查表.md, 04_星球档案/V-059 晶尘星/05_星际关系筛查表.md, 04_星球档案/V-060 暗物质星/05_星际关系筛查表.md, 04_星球档案/V-061 孢子星/05_星际关系筛查表.md, 04_星球档案/V-062 磁星/05_星际关系筛查表.md, 04_星球档案/V-063 气态巨星/05_星际关系筛查表.md, 04_星球档案/V-064 雾霭星/05_星际关系筛查表.md, 04_星球档案/V-065 星云星/05_星际关系筛查表.md, 04_星球档案/V-066 裂谷星/05_星际关系筛查表.md, 04_星球档案/V-067 浮岛星/05_星际关系筛查表.md, 04_星球档案/V-068 蓝藻星/05_星际关系筛查表.md, 04_星球档案/V-069 极光磁暴星/05_星际关系筛查表.md, 04_星球档案/V-070 腐毒沼泽星/05_星际关系筛查表.md, 04_星球档案/V-071 重力扭曲星/05_星际关系筛查表.md, 04_星球档案/V-072 寒星/05_星际关系筛查表.md, 04_星球档案/V-073 水星/05_星际关系筛查表.md, 04_星球档案/V-074 光年星/05_星际关系筛查表.md, 04_星球档案/V-075 强碱腐蚀星/05_星际关系筛查表.md, 04_星球档案/V-076 微重力陨石星/05_星际关系筛查表.md, 04_星球档案/V-077 重力星/05_星际关系筛查表.md, 04_星球档案/V-078 水晶星/05_星际关系筛查表.md, 04_星球档案/V-079 生命星/05_星际关系筛查表.md, 04_星球档案/V-080 混沌星/05_星际关系筛查表.md, 04_星球档案/V-081 灵能星/05_星际关系筛查表.md, 04_星球档案/V-082 时间星/05_星际关系筛查表.md, 04_星球档案/V-083 虚空星/05_星际关系筛查表.md, 04_星球档案/V-084 维度星/05_星际关系筛查表.md, 04_星球档案/V-085 能量星/05_星际关系筛查表.md, 04_星球档案/V-086 星核星/05_星际关系筛查表.md, 04_星球档案/V-087 光明星/05_星际关系筛查表.md, 04_星球档案/V-088 暗黑星/05_星际关系筛查表.md, 04_星球档案/V-089 晶灵星/05_星际关系筛查表.md, 04_星球档案/V-090 机械星/05_星际关系筛查表.md, 04_星球档案/V-091 冰巨星/05_星际关系筛查表.md, 04_星球档案/V-092 重力波星/05_星际关系筛查表.md, 04_星球档案/V-093 光速星/05_星际关系筛查表.md, 04_星球档案/V-094 空间星/05_星际关系筛查表.md, 04_星球档案/V-095 意识星/05_星际关系筛查表.md, 04_星球档案/V-096 概率星/05_星际关系筛查表.md, 04_星球档案/V-097 梦境星/05_星际关系筛查表.md, 04_星球档案/V-098 虚无星/05_星际关系筛查表.md, 04_星球档案/V-099 命运星/05_星际关系筛查表.md, 04_星球档案/V-100 永恒星/05_星际关系筛查表.md, 04_星球档案/V-101 灵魂星/05_星际关系筛查表.md, 04_星球档案/V-102 自由星/05_星际关系筛查表.md, 04_星球档案/V-103 真理星/05_星际关系筛查表.md, 04_星球档案/V-104 秩序星/05_星际关系筛查表.md, 04_星球档案/V-105 暗物质星/05_星际关系筛查表.md, 04_星球档案/V-106 起源星/05_星际关系筛查表.md, 04_星球档案/V-107 鳞木星/05_星际关系筛查表.md, 04_星球档案/V-108 息土星/05_星际关系筛查表.md, 04_星球档案/V-109 锈骨星/05_星际关系筛查表.md, 04_星球档案/V-110 毒岚星/05_星际关系筛查表.md, 04_星球档案/V-111 晶髓星/05_星际关系筛查表.md, 04_星球档案/V-112 幽泉星/05_星际关系筛查表.md, 04_星球档案/V-113 狱火星/05_星际关系筛查表.md, 04_星球档案/V-114 蛊厄星/05_星际关系筛查表.md, 04_星球档案/V-115 铸心星/05_星际关系筛查表.md, 04_星球档案/V-116 幻蜃星/05_星际关系筛查表.md, 04_星球档案/V-117 渊噬星/05_星际关系筛查表.md, 04_星球档案/V-118 凛灾星/05_星际关系筛查表.md, 04_星球档案/V-119 震爆星/05_星际关系筛查表.md, 04_星球档案/V-120 蚀骨星/05_星际关系筛查表.md, 04_星球档案/V-121 烬灰星/05_星际关系筛查表.md, 04_星球档案/V-122 锈死星/05_星际关系筛查表.md, 04_星球档案/V-123 衰变星/05_星际关系筛查表.md, 04_星球档案/V-124 重压星/05_星际关系筛查表.md, 04_星球档案/V-125 极酸星/05_星际关系筛查表.md, 04_星球档案/V-126 孢子星/05_星际关系筛查表.md, 04_星球档案/V-127 幻魇星/05_星际关系筛查表.md, 04_星球档案/V-128 雷暴星/05_星际关系筛查表.md, 04_星球档案/V-129 冰晶星/05_星际关系筛查表.md, 04_星球档案/V-130 胶沼星/05_星际关系筛查表.md, 04_星球档案/V-131 震荡星/05_星际关系筛查表.md, 04_星球档案/V-132 镜面星/05_星际关系筛查表.md, 04_星球档案/V-133 骨灰星/05_星际关系筛查表.md, 04_星球档案/V-134 沸石星/05_星际关系筛查表.md, 04_星球档案/V-135 毒晶星/05_星际关系筛查表.md, 04_星球档案/V-136 黑洞星/05_星际关系筛查表.md, 04_星球档案/V-137 虚空回声星/05_星际关系筛查表.md, 04_星球档案/V-138 碎星带陨石星/05_星际关系筛查表.md, 04_星球档案/V-139 辐射星/05_星际关系筛查表.md, 04_星球档案/V-140 漩涡星/05_星际关系筛查表.md, 04_星球档案/V-141 腐蚀星/05_星际关系筛查表.md, 04_星球档案/V-142 磁陷星/05_星际关系筛查表.md, 04_星球档案/V-143 焦土星/05_星际关系筛查表.md, 04_星球档案/V-144 结晶海星/05_星际关系筛查表.md, 04_星球档案/V-145 虚空暗面星/05_星际关系筛查表.md, 04_星球档案/V-146 沸腾海星/05_星际关系筛查表.md, 04_星球档案/V-147 超导冰原星/05_星际关系筛查表.md, 04_星球档案/V-148 裂变废墟星/05_星际关系筛查表.md, 04_星球档案/V-149 液氮极寒星/05_星际关系筛查表.md, 04_星球档案/V-150 黑洞边缘星/05_星际关系筛查表.md, 04_星球档案/V-151 星尘星/05_星际关系筛查表.md, 04_星球档案/V-152 气体巨行星/05_星际关系筛查表.md, 04_星球档案/V-153 脉冲星/05_星际关系筛查表.md, 04_星球档案/V-154 白矮星/05_星际关系筛查表.md, 04_星球档案/V-155 夸克星/05_星际关系筛查表.md, 04_星球档案/V-156 反物质星/05_星际关系筛查表.md, 04_星球档案/V-157 奇异质星/05_星际关系筛查表.md, 04_星球档案/V-158 碎裂时空星/05_星际关系筛查表.md, 04_星球档案/V-159 音波星/05_星际关系筛查表.md, 04_星球档案/V-160 引力星/05_星际关系筛查表.md, 04_星球档案/V-161 幻象星/05_星际关系筛查表.md, 04_星球档案/V-162 梦境星/05_星际关系筛查表.md, 04_星球档案/V-163 植物星/05_星际关系筛查表.md, 04_星球档案/V-164 终极星/05_星际关系筛查表.md, 04_星球档案/V-165 赤昼星/05_星际关系筛查表.md, 04_星球档案/V-166 盐骨星/05_星际关系筛查表.md, 04_星球档案/V-167 风蚀星/05_星际关系筛查表.md, 04_星球档案/V-168 井国星/05_星际关系筛查表.md, 04_星球档案/V-169 冠海星/05_星际关系筛查表.md, 04_星球档案/V-170 迁林星/05_星际关系筛查表.md, 04_星球档案/V-171 红叶星/05_星际关系筛查表.md, 04_星球档案/V-172 镜叶星/05_星际关系筛查表.md, 04_星球档案/V-173 琥珀云星/05_星际关系筛查表.md, 04_星球档案/V-174 沉云星/05_星际关系筛查表.md, 04_星球档案/V-175 青核星/05_星际关系筛查表.md, 04_星球档案/V-176 白潮星/05_星际关系筛查表.md, 04_星球档案/V-177 寂冻星/05_星际关系筛查表.md, 04_星球档案/V-178 蓝棺星/05_星际关系筛查表.md, 04_星球档案/V-179 浮礁星/05_星际关系筛查表.md, 04_星球档案/V-180 雨幕星/05_星际关系筛查表.md, 04_星球档案/V-181 潮锁星/05_星际关系筛查表.md, 04_星球档案/V-182 泡界星/05_星际关系筛查表.md, 04_星球档案/V-183 万峰星/05_星际关系筛查表.md, 04_星球档案/V-184 空谷星/05_星际关系筛查表.md, 04_星球档案/V-185 铁脊星/05_星际关系筛查表.md, 04_星球档案/V-186 震庭星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/05_星际关系筛查表.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/05_星际关系筛查表.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/05_星际关系筛查表.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/05_星际关系筛查表.md`
  - `04_星球档案/V-002 灰港星/05_星际关系筛查表.md`
  - `04_星球档案/V-003 风暴星/05_星际关系筛查表.md`
  - `04_星球档案/V-004 翠叶星/05_星际关系筛查表.md`
  - `04_星球档案/V-005 金沙星/05_星际关系筛查表.md`
  - `04_星球档案/V-006 深渊星/05_星际关系筛查表.md`
  - `04_星球档案/V-007 雪墓星/05_星际关系筛查表.md`
  - `04_星球档案/V-008 层书星/05_星际关系筛查表.md`
  - `04_星球档案/V-009 夜沙星/05_星际关系筛查表.md`
  - `04_星球档案/V-010 歌云星/05_星际关系筛查表.md`
  - `04_星球档案/V-011 镜潮星/05_星际关系筛查表.md`
  - `04_星球档案/V-012 心火星/05_星际关系筛查表.md`
  - `04_星球档案/V-013 孢云星/05_星际关系筛查表.md`
  - `04_星球档案/V-014 鸣晶星/05_星际关系筛查表.md`
  - `04_星球档案/V-015 影晶星/05_星际关系筛查表.md`
  - `04_星球档案/V-016 霜环星/05_星际关系筛查表.md`
  - `04_星球档案/V-017 锈河星/05_星际关系筛查表.md`
  - `04_星球档案/V-018 浮叶星/05_星际关系筛查表.md`
  - `04_星球档案/V-019 鸣钟星/05_星际关系筛查表.md`
  - `04_星球档案/V-020 镜沙星/05_星际关系筛查表.md`
  - `04_星球档案/V-021 霜恸星/05_星际关系筛查表.md`
  - `04_星球档案/V-022 气旋星/05_星际关系筛查表.md`
  - `04_星球档案/V-023 磁暴星/05_星际关系筛查表.md`
  - `04_星球档案/V-024 沸海星/05_星际关系筛查表.md`
  - `04_星球档案/V-025 织网星/05_星际关系筛查表.md`
  - `04_星球档案/V-026 涡流星/05_星际关系筛查表.md`
  - `04_星球档案/V-027 晶海星/05_星际关系筛查表.md`
  - `04_星球档案/V-028 基因星/05_星际关系筛查表.md`
  - `04_星球档案/V-029 梦泽星/05_星际关系筛查表.md`
  - `04_星球档案/V-030 熔核星/05_星际关系筛查表.md`
  - `04_星球档案/V-031 灰核星/05_星际关系筛查表.md`
  - `04_星球档案/V-032 磁渊星/05_星际关系筛查表.md`
  - `04_星球档案/V-033 灰烬星/05_星际关系筛查表.md`
  - `04_星球档案/V-034 寄生星/05_星际关系筛查表.md`
  - `04_星球档案/V-035 极电星/05_星际关系筛查表.md`
  - `04_星球档案/V-036 碎刃星/05_星际关系筛查表.md`
  - `04_星球档案/V-037 光棱星/05_星际关系筛查表.md`
  - `04_星球档案/V-038 尘歌星/05_星际关系筛查表.md`
  - `04_星球档案/V-039 雾隐星/05_星际关系筛查表.md`
  - `04_星球档案/V-040 血藤星/05_星际关系筛查表.md`
  - `04_星球档案/V-041 雷泽星/05_星际关系筛查表.md`
  - `04_星球档案/V-042 铁锈星/05_星际关系筛查表.md`
  - `04_星球档案/V-043 浮冰星/05_星际关系筛查表.md`
  - `04_星球档案/V-044 沙海星/05_星际关系筛查表.md`
  - `04_星球档案/V-045 深渊海星/05_星际关系筛查表.md`
  - `04_星球档案/V-046 磁极星/05_星际关系筛查表.md`
  - `04_星球档案/V-047 幽光星/05_星际关系筛查表.md`
  - `04_星球档案/V-048 声波星/05_星际关系筛查表.md`
  - `04_星球档案/V-049 潮汐星/05_星际关系筛查表.md`
  - `04_星球档案/V-050 死寂星/05_星际关系筛查表.md`
  - `04_星球档案/V-052 火雨星/05_星际关系筛查表.md`
  - `04_星球档案/V-053 冰风暴星/05_星际关系筛查表.md`
  - `04_星球档案/V-054 熔岩星/05_星际关系筛查表.md`
  - `04_星球档案/V-055 晶核星/05_星际关系筛查表.md`
  - `04_星球档案/V-056 重力缝隙星/05_星际关系筛查表.md`
  - `04_星球档案/V-057 回声星/05_星际关系筛查表.md`
  - `04_星球档案/V-058 碎星带/05_星际关系筛查表.md`
  - `04_星球档案/V-059 晶尘星/05_星际关系筛查表.md`
  - `04_星球档案/V-060 暗物质星/05_星际关系筛查表.md`
  - `04_星球档案/V-061 孢子星/05_星际关系筛查表.md`
  - `04_星球档案/V-062 磁星/05_星际关系筛查表.md`
  - `04_星球档案/V-063 气态巨星/05_星际关系筛查表.md`
  - `04_星球档案/V-064 雾霭星/05_星际关系筛查表.md`
  - `04_星球档案/V-065 星云星/05_星际关系筛查表.md`
  - `04_星球档案/V-066 裂谷星/05_星际关系筛查表.md`
  - `04_星球档案/V-067 浮岛星/05_星际关系筛查表.md`
  - `04_星球档案/V-068 蓝藻星/05_星际关系筛查表.md`
  - `04_星球档案/V-069 极光磁暴星/05_星际关系筛查表.md`
  - `04_星球档案/V-070 腐毒沼泽星/05_星际关系筛查表.md`
  - `04_星球档案/V-071 重力扭曲星/05_星际关系筛查表.md`
  - `04_星球档案/V-072 寒星/05_星际关系筛查表.md`
  - `04_星球档案/V-073 水星/05_星际关系筛查表.md`
  - `04_星球档案/V-074 光年星/05_星际关系筛查表.md`
  - `04_星球档案/V-075 强碱腐蚀星/05_星际关系筛查表.md`
  - `04_星球档案/V-076 微重力陨石星/05_星际关系筛查表.md`
  - `04_星球档案/V-077 重力星/05_星际关系筛查表.md`
  - `04_星球档案/V-078 水晶星/05_星际关系筛查表.md`
  - `04_星球档案/V-079 生命星/05_星际关系筛查表.md`
  - `04_星球档案/V-080 混沌星/05_星际关系筛查表.md`
  - `04_星球档案/V-081 灵能星/05_星际关系筛查表.md`
  - `04_星球档案/V-082 时间星/05_星际关系筛查表.md`
  - `04_星球档案/V-083 虚空星/05_星际关系筛查表.md`
  - `04_星球档案/V-084 维度星/05_星际关系筛查表.md`
  - `04_星球档案/V-085 能量星/05_星际关系筛查表.md`
  - `04_星球档案/V-086 星核星/05_星际关系筛查表.md`
  - `04_星球档案/V-087 光明星/05_星际关系筛查表.md`
  - `04_星球档案/V-088 暗黑星/05_星际关系筛查表.md`
  - `04_星球档案/V-089 晶灵星/05_星际关系筛查表.md`
  - `04_星球档案/V-090 机械星/05_星际关系筛查表.md`
  - `04_星球档案/V-091 冰巨星/05_星际关系筛查表.md`
  - `04_星球档案/V-092 重力波星/05_星际关系筛查表.md`
  - `04_星球档案/V-093 光速星/05_星际关系筛查表.md`
  - `04_星球档案/V-094 空间星/05_星际关系筛查表.md`
  - `04_星球档案/V-095 意识星/05_星际关系筛查表.md`
  - `04_星球档案/V-096 概率星/05_星际关系筛查表.md`
  - `04_星球档案/V-097 梦境星/05_星际关系筛查表.md`
  - `04_星球档案/V-098 虚无星/05_星际关系筛查表.md`
  - `04_星球档案/V-099 命运星/05_星际关系筛查表.md`
  - `04_星球档案/V-100 永恒星/05_星际关系筛查表.md`
  - `04_星球档案/V-101 灵魂星/05_星际关系筛查表.md`
  - `04_星球档案/V-102 自由星/05_星际关系筛查表.md`
  - `04_星球档案/V-103 真理星/05_星际关系筛查表.md`
  - `04_星球档案/V-104 秩序星/05_星际关系筛查表.md`
  - `04_星球档案/V-105 暗物质星/05_星际关系筛查表.md`
  - `04_星球档案/V-106 起源星/05_星际关系筛查表.md`
  - `04_星球档案/V-107 鳞木星/05_星际关系筛查表.md`
  - `04_星球档案/V-108 息土星/05_星际关系筛查表.md`
  - `04_星球档案/V-109 锈骨星/05_星际关系筛查表.md`
  - `04_星球档案/V-110 毒岚星/05_星际关系筛查表.md`
  - `04_星球档案/V-111 晶髓星/05_星际关系筛查表.md`
  - `04_星球档案/V-112 幽泉星/05_星际关系筛查表.md`
  - `04_星球档案/V-113 狱火星/05_星际关系筛查表.md`
  - `04_星球档案/V-114 蛊厄星/05_星际关系筛查表.md`
  - `04_星球档案/V-115 铸心星/05_星际关系筛查表.md`
  - `04_星球档案/V-116 幻蜃星/05_星际关系筛查表.md`
  - `04_星球档案/V-117 渊噬星/05_星际关系筛查表.md`
  - `04_星球档案/V-118 凛灾星/05_星际关系筛查表.md`
  - `04_星球档案/V-119 震爆星/05_星际关系筛查表.md`
  - `04_星球档案/V-120 蚀骨星/05_星际关系筛查表.md`
  - `04_星球档案/V-121 烬灰星/05_星际关系筛查表.md`
  - `04_星球档案/V-122 锈死星/05_星际关系筛查表.md`
  - `04_星球档案/V-123 衰变星/05_星际关系筛查表.md`
  - `04_星球档案/V-124 重压星/05_星际关系筛查表.md`
  - `04_星球档案/V-125 极酸星/05_星际关系筛查表.md`
  - `04_星球档案/V-126 孢子星/05_星际关系筛查表.md`
  - `04_星球档案/V-127 幻魇星/05_星际关系筛查表.md`
  - `04_星球档案/V-128 雷暴星/05_星际关系筛查表.md`
  - `04_星球档案/V-129 冰晶星/05_星际关系筛查表.md`
  - `04_星球档案/V-130 胶沼星/05_星际关系筛查表.md`
  - `04_星球档案/V-131 震荡星/05_星际关系筛查表.md`
  - `04_星球档案/V-132 镜面星/05_星际关系筛查表.md`
  - `04_星球档案/V-133 骨灰星/05_星际关系筛查表.md`
  - `04_星球档案/V-134 沸石星/05_星际关系筛查表.md`
  - `04_星球档案/V-135 毒晶星/05_星际关系筛查表.md`
  - `04_星球档案/V-136 黑洞星/05_星际关系筛查表.md`
  - `04_星球档案/V-137 虚空回声星/05_星际关系筛查表.md`
  - `04_星球档案/V-138 碎星带陨石星/05_星际关系筛查表.md`
  - `04_星球档案/V-139 辐射星/05_星际关系筛查表.md`
  - `04_星球档案/V-140 漩涡星/05_星际关系筛查表.md`
  - `04_星球档案/V-141 腐蚀星/05_星际关系筛查表.md`
  - `04_星球档案/V-142 磁陷星/05_星际关系筛查表.md`
  - `04_星球档案/V-143 焦土星/05_星际关系筛查表.md`
  - `04_星球档案/V-144 结晶海星/05_星际关系筛查表.md`
  - `04_星球档案/V-145 虚空暗面星/05_星际关系筛查表.md`
  - `04_星球档案/V-146 沸腾海星/05_星际关系筛查表.md`
  - `04_星球档案/V-147 超导冰原星/05_星际关系筛查表.md`
  - `04_星球档案/V-148 裂变废墟星/05_星际关系筛查表.md`
  - `04_星球档案/V-149 液氮极寒星/05_星际关系筛查表.md`
  - `04_星球档案/V-150 黑洞边缘星/05_星际关系筛查表.md`
  - `04_星球档案/V-151 星尘星/05_星际关系筛查表.md`
  - `04_星球档案/V-152 气体巨行星/05_星际关系筛查表.md`
  - `04_星球档案/V-153 脉冲星/05_星际关系筛查表.md`
  - `04_星球档案/V-154 白矮星/05_星际关系筛查表.md`
  - `04_星球档案/V-155 夸克星/05_星际关系筛查表.md`
  - `04_星球档案/V-156 反物质星/05_星际关系筛查表.md`
  - `04_星球档案/V-157 奇异质星/05_星际关系筛查表.md`
  - `04_星球档案/V-158 碎裂时空星/05_星际关系筛查表.md`
  - `04_星球档案/V-159 音波星/05_星际关系筛查表.md`
  - `04_星球档案/V-160 引力星/05_星际关系筛查表.md`
  - `04_星球档案/V-161 幻象星/05_星际关系筛查表.md`
  - `04_星球档案/V-162 梦境星/05_星际关系筛查表.md`
  - `04_星球档案/V-163 植物星/05_星际关系筛查表.md`
  - `04_星球档案/V-164 终极星/05_星际关系筛查表.md`
  - `04_星球档案/V-165 赤昼星/05_星际关系筛查表.md`
  - `04_星球档案/V-166 盐骨星/05_星际关系筛查表.md`
  - `04_星球档案/V-167 风蚀星/05_星际关系筛查表.md`
  - `04_星球档案/V-168 井国星/05_星际关系筛查表.md`
  - `04_星球档案/V-169 冠海星/05_星际关系筛查表.md`
  - `04_星球档案/V-170 迁林星/05_星际关系筛查表.md`
  - `04_星球档案/V-171 红叶星/05_星际关系筛查表.md`
  - `04_星球档案/V-172 镜叶星/05_星际关系筛查表.md`
  - `04_星球档案/V-173 琥珀云星/05_星际关系筛查表.md`
  - `04_星球档案/V-174 沉云星/05_星际关系筛查表.md`
  - `04_星球档案/V-175 青核星/05_星际关系筛查表.md`
  - `04_星球档案/V-176 白潮星/05_星际关系筛查表.md`
  - `04_星球档案/V-177 寂冻星/05_星际关系筛查表.md`
  - `04_星球档案/V-178 蓝棺星/05_星际关系筛查表.md`
  - `04_星球档案/V-179 浮礁星/05_星际关系筛查表.md`
  - `04_星球档案/V-180 雨幕星/05_星际关系筛查表.md`
  - `04_星球档案/V-181 潮锁星/05_星际关系筛查表.md`
  - `04_星球档案/V-182 泡界星/05_星际关系筛查表.md`
  - `04_星球档案/V-183 万峰星/05_星际关系筛查表.md`
  - `04_星球档案/V-184 空谷星/05_星际关系筛查表.md`
  - `04_星球档案/V-185 铁脊星/05_星际关系筛查表.md`
  - `04_星球档案/V-186 震庭星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/05_星际关系筛查表.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/05_星际关系筛查表.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/05_星际关系筛查表.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 58. [MEDIUM] Potential historical version fork: '05_特殊组织与暗网.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '05_特殊组织与暗网.md' exist across directories: 04_星球档案/V-073 水星/07_势力体系/05_特殊组织与暗网.md, 04_星球档案/V-074 光年星/07_势力体系/05_特殊组织与暗网.md, 04_星球档案/V-077 重力星/07_势力体系/05_特殊组织与暗网.md, 04_星球档案/V-078 水晶星/07_势力体系/05_特殊组织与暗网.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/05_特殊组织与暗网.md, 04_星球档案/V-151 星尘星/07_势力体系/05_特殊组织与暗网.md.
- **Affected Files**:
  - `04_星球档案/V-073 水星/07_势力体系/05_特殊组织与暗网.md`
  - `04_星球档案/V-074 光年星/07_势力体系/05_特殊组织与暗网.md`
  - `04_星球档案/V-077 重力星/07_势力体系/05_特殊组织与暗网.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/05_特殊组织与暗网.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/05_特殊组织与暗网.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/05_特殊组织与暗网.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 59. [MEDIUM] Potential historical version fork: '05_装备与科技系统.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '05_装备与科技系统.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-002 灰港星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-003 风暴星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-005 金沙星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-006 深渊星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-008 层书星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-010 歌云星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-012 心火星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-013 孢云星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-015 影晶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-016 霜环星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-017 锈河星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-022 气旋星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-024 沸海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-025 织网星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-026 涡流星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-027 晶海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-028 基因星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-030 熔核星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-031 灰核星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-034 寄生星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-035 极电星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-037 光棱星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-040 血藤星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-044 沙海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-046 磁极星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-047 幽光星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-048 声波星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-050 死寂星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-052 火雨星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-055 晶核星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-057 回声星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-058 碎星带/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-061 孢子星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-062 磁星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-065 星云星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-072 寒星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-073 水星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-074 光年星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-077 重力星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-078 水晶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-079 生命星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-080 混沌星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-081 灵能星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-082 时间星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-083 虚空星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-084 维度星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-085 能量星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-086 星核星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-087 光明星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-090 机械星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-092 重力波星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-093 光速星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-094 空间星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-095 意识星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-096 概率星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-097 梦境星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-098 虚无星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-099 命运星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-100 永恒星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-102 自由星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-103 真理星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-104 秩序星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-106 起源星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-108 息土星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-113 狱火星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-115 铸心星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-119 震爆星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-122 锈死星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-123 衰变星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-124 重压星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-125 极酸星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-126 孢子星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-131 震荡星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-132 镜面星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-134 沸石星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-139 辐射星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-143 焦土星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-151 星尘星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-154 白矮星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-155 夸克星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-156 反物质星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-159 音波星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-160 引力星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-161 幻象星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-162 梦境星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-163 植物星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-164 终极星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-168 井国星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-169 冠海星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-170 迁林星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-171 红叶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-174 沉云星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-175 青核星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-176 白潮星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-182 泡界星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-183 万峰星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-184 空谷星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/05_装备与科技系统.md, 04_星球档案/V-186 震庭星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/05_装备与科技系统.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/05_装备与科技系统.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/05_装备与科技系统.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/05_装备与科技系统.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/05_装备与科技系统.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 60. [MEDIUM] Potential historical version fork: '06_关系与制度系统.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '06_关系与制度系统.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-002 灰港星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-003 风暴星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-005 金沙星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-006 深渊星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-008 层书星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-010 歌云星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-012 心火星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-013 孢云星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-015 影晶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-016 霜环星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-017 锈河星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-022 气旋星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-024 沸海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-025 织网星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-026 涡流星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-027 晶海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-028 基因星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-030 熔核星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-031 灰核星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-034 寄生星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-035 极电星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-037 光棱星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-040 血藤星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-044 沙海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-046 磁极星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-047 幽光星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-048 声波星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-050 死寂星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-052 火雨星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-055 晶核星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-057 回声星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-058 碎星带/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-061 孢子星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-062 磁星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-065 星云星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-072 寒星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-073 水星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-074 光年星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-077 重力星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-078 水晶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-079 生命星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-080 混沌星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-081 灵能星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-082 时间星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-083 虚空星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-084 维度星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-085 能量星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-086 星核星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-087 光明星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-090 机械星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-092 重力波星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-093 光速星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-094 空间星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-095 意识星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-096 概率星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-097 梦境星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-098 虚无星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-099 命运星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-100 永恒星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-102 自由星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-103 真理星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-104 秩序星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-106 起源星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-108 息土星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-113 狱火星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-115 铸心星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-119 震爆星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-122 锈死星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-123 衰变星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-124 重压星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-125 极酸星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-126 孢子星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-131 震荡星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-132 镜面星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-134 沸石星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-139 辐射星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-143 焦土星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-151 星尘星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-154 白矮星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-155 夸克星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-156 反物质星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-159 音波星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-160 引力星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-161 幻象星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-162 梦境星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-163 植物星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-164 终极星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-168 井国星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-169 冠海星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-170 迁林星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-171 红叶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-174 沉云星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-175 青核星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-176 白潮星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-182 泡界星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-183 万峰星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-184 空谷星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/06_关系与制度系统.md, 04_星球档案/V-186 震庭星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/06_关系与制度系统.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/06_关系与制度系统.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/06_关系与制度系统.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/06_关系与制度系统.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/06_关系与制度系统.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 61. [MEDIUM] Potential historical version fork: '06_军事与安保力量.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '06_军事与安保力量.md' exist across directories: 04_星球档案/V-073 水星/07_势力体系/06_军事与安保力量.md, 04_星球档案/V-074 光年星/07_势力体系/06_军事与安保力量.md, 04_星球档案/V-077 重力星/07_势力体系/06_军事与安保力量.md, 04_星球档案/V-078 水晶星/07_势力体系/06_军事与安保力量.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/06_军事与安保力量.md, 04_星球档案/V-151 星尘星/07_势力体系/06_军事与安保力量.md.
- **Affected Files**:
  - `04_星球档案/V-073 水星/07_势力体系/06_军事与安保力量.md`
  - `04_星球档案/V-074 光年星/07_势力体系/06_军事与安保力量.md`
  - `04_星球档案/V-077 重力星/07_势力体系/06_军事与安保力量.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/06_军事与安保力量.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/06_军事与安保力量.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/06_军事与安保力量.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 62. [MEDIUM] Potential historical version fork: '06_势力档案_顶级势力B.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '06_势力档案_顶级势力B.md' exist across directories: 07_势力体系/V-079 生命星/06_势力档案_顶级势力B.md, 07_势力体系/V-080 混沌星/06_势力档案_顶级势力B.md, 07_势力体系/V-081 灵能星/06_势力档案_顶级势力B.md, 07_势力体系/V-082 时间星/06_势力档案_顶级势力B.md, 07_势力体系/V-083 虚空星/06_势力档案_顶级势力B.md, 07_势力体系/V-084 维度星/06_势力档案_顶级势力B.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/06_势力档案_顶级势力B.md`
  - `07_势力体系/V-080 混沌星/06_势力档案_顶级势力B.md`
  - `07_势力体系/V-081 灵能星/06_势力档案_顶级势力B.md`
  - `07_势力体系/V-082 时间星/06_势力档案_顶级势力B.md`
  - `07_势力体系/V-083 虚空星/06_势力档案_顶级势力B.md`
  - `07_势力体系/V-084 维度星/06_势力档案_顶级势力B.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 63. [MEDIUM] Potential historical version fork: '06_奇葩风俗与日常.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '06_奇葩风俗与日常.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/06_奇葩风俗与日常.md, 04_星球档案/V-072 寒星/07_势力体系/06_奇葩风俗与日常.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/06_奇葩风俗与日常.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/06_奇葩风俗与日常.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/06_奇葩风俗与日常.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/06_奇葩风俗与日常.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/06_奇葩风俗与日常.md`
  - `04_星球档案/V-072 寒星/07_势力体系/06_奇葩风俗与日常.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/06_奇葩风俗与日常.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/06_奇葩风俗与日常.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/06_奇葩风俗与日常.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/06_奇葩风俗与日常.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 64. [MEDIUM] Potential historical version fork: '06_对外关系与星际利益.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '06_对外关系与星际利益.md' exist across directories: 04_星球档案/V-056 重力缝隙星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-057 回声星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-058 碎星带/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-059 晶尘星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-060 暗物质星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-061 孢子星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-062 磁星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-063 气态巨星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-086 星核星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-087 光明星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-088 暗黑星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-089 晶灵星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-090 机械星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-092 重力波星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-093 光速星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-094 空间星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-095 意识星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-096 概率星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-097 梦境星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-104 秩序星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-106 起源星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-136 黑洞星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-137 虚空回声星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-139 辐射星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-140 漩涡星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-141 腐蚀星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-142 磁陷星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-161 幻象星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-164 终极星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-165 赤昼星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-166 盐骨星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-167 风蚀星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-168 井国星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-169 冠海星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-170 迁林星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-171 红叶星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-172 镜叶星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-173 琥珀云星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-174 沉云星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-175 青核星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-176 白潮星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-177 寂冻星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-178 蓝棺星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-179 浮礁星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-180 雨幕星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-181 潮锁星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-183 万峰星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-184 空谷星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-185 铁脊星/07_势力体系/06_对外关系与星际利益.md, 04_星球档案/V-186 震庭星/07_势力体系/06_对外关系与星际利益.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/06_对外关系与星际利益.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/06_对外关系与星际利益.md.
- **Affected Files**:
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-057 回声星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-062 磁星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-086 星核星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-087 光明星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-090 机械星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-093 光速星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-094 空间星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-095 意识星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-096 概率星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-106 起源星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-164 终极星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-168 井国星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-175 青核星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/06_对外关系与星际利益.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/06_对外关系与星际利益.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/06_对外关系与星际利益.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/06_对外关系与星际利益.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 65. [MEDIUM] Potential historical version fork: '06_重要人物与领袖.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '06_重要人物与领袖.md' exist across directories: 04_星球档案/V-004 翠叶星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-005 金沙星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-006 深渊星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-007 雪墓星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-008 层书星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-009 夜沙星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-010 歌云星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-011 镜潮星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-012 心火星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-013 孢云星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-014 鸣晶星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-015 影晶星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-016 霜环星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-017 锈河星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-018 浮叶星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-019 鸣钟星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-020 镜沙星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-021 霜恸星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-022 气旋星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-023 磁暴星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-024 沸海星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-025 织网星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-026 涡流星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-027 晶海星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-028 基因星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-029 梦泽星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-030 熔核星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-031 灰核星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-032 磁渊星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-033 灰烬星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-034 寄生星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-035 极电星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-036 碎刃星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-037 光棱星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-038 尘歌星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-039 雾隐星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-040 血藤星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-041 雷泽星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-042 铁锈星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-043 浮冰星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-044 沙海星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-045 深渊海星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-046 磁极星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-047 幽光星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-048 声波星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-049 潮汐星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-050 死寂星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-052 火雨星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-053 冰风暴星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-054 熔岩星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-055 晶核星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-064 雾霭星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-065 星云星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-066 裂谷星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-067 浮岛星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-079 生命星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-080 混沌星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-081 灵能星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-082 时间星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-083 虚空星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-084 维度星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-085 能量星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-091 冰巨星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-105 暗物质星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-107 鳞木星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-108 息土星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-109 锈骨星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-110 毒岚星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-111 晶髓星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-112 幽泉星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-113 狱火星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-114 蛊厄星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-115 铸心星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-116 幻蜃星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-117 渊噬星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-118 凛灾星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-119 震爆星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-120 蚀骨星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-121 烬灰星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-122 锈死星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-123 衰变星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-124 重压星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-125 极酸星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-126 孢子星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-127 幻魇星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-128 雷暴星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-129 冰晶星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-130 胶沼星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-131 震荡星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-132 镜面星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-133 骨灰星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-134 沸石星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-135 毒晶星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-143 焦土星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-144 结晶海星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-146 沸腾海星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-147 超导冰原星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-152 气体巨行星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-153 脉冲星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-154 白矮星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-155 夸克星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-156 反物质星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-157 奇异质星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-159 音波星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-160 引力星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-162 梦境星/07_势力体系/06_重要人物与领袖.md, 04_星球档案/V-163 植物星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/06_重要人物与领袖.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/06_重要人物与领袖.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-008 层书星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-012 心火星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-025 织网星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-028 基因星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-035 极电星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-048 声波星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-065 星云星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-079 生命星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-082 时间星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-084 维度星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-085 能量星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-108 息土星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-124 重压星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-159 音波星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-160 引力星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/06_重要人物与领袖.md`
  - `04_星球档案/V-163 植物星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/06_重要人物与领袖.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/06_重要人物与领袖.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 66. [MEDIUM] Potential historical version fork: '07_冲突事件库.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '07_冲突事件库.md' exist across directories: 04_星球档案/V-056 重力缝隙星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-057 回声星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-058 碎星带/07_势力体系/07_冲突事件库.md, 04_星球档案/V-059 晶尘星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-060 暗物质星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-061 孢子星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-062 磁星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-063 气态巨星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-086 星核星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-087 光明星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-088 暗黑星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-089 晶灵星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-090 机械星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-092 重力波星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-093 光速星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-094 空间星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-095 意识星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-096 概率星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-097 梦境星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-104 秩序星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-106 起源星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-136 黑洞星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-137 虚空回声星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-139 辐射星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-140 漩涡星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-141 腐蚀星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-142 磁陷星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-161 幻象星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-164 终极星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-165 赤昼星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-166 盐骨星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-167 风蚀星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-168 井国星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-169 冠海星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-170 迁林星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-171 红叶星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-172 镜叶星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-173 琥珀云星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-174 沉云星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-175 青核星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-176 白潮星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-177 寂冻星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-178 蓝棺星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-179 浮礁星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-180 雨幕星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-181 潮锁星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-183 万峰星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-184 空谷星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-185 铁脊星/07_势力体系/07_冲突事件库.md, 04_星球档案/V-186 震庭星/07_势力体系/07_冲突事件库.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/07_冲突事件库.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/07_冲突事件库.md.
- **Affected Files**:
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-057 回声星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-062 磁星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-086 星核星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-087 光明星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-090 机械星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-093 光速星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-094 空间星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-095 意识星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-096 概率星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-106 起源星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-164 终极星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-168 井国星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-175 青核星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/07_冲突事件库.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/07_冲突事件库.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/07_冲突事件库.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/07_冲突事件库.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 67. [MEDIUM] Potential historical version fork: '07_剥削与阶级系统.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '07_剥削与阶级系统.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-002 灰港星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-003 风暴星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-005 金沙星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-006 深渊星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-008 层书星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-010 歌云星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-012 心火星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-013 孢云星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-015 影晶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-016 霜环星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-017 锈河星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-022 气旋星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-024 沸海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-025 织网星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-026 涡流星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-027 晶海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-028 基因星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-030 熔核星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-031 灰核星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-034 寄生星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-035 极电星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-037 光棱星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-040 血藤星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-044 沙海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-046 磁极星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-047 幽光星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-048 声波星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-050 死寂星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-052 火雨星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-055 晶核星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-057 回声星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-058 碎星带/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-061 孢子星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-062 磁星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-065 星云星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-072 寒星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-073 水星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-074 光年星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-077 重力星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-078 水晶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-079 生命星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-080 混沌星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-081 灵能星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-082 时间星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-083 虚空星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-084 维度星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-085 能量星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-086 星核星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-087 光明星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-090 机械星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-092 重力波星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-093 光速星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-094 空间星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-095 意识星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-096 概率星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-097 梦境星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-098 虚无星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-099 命运星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-100 永恒星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-102 自由星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-103 真理星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-104 秩序星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-106 起源星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-108 息土星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-113 狱火星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-115 铸心星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-119 震爆星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-122 锈死星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-123 衰变星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-124 重压星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-125 极酸星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-126 孢子星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-131 震荡星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-132 镜面星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-134 沸石星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-139 辐射星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-143 焦土星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-151 星尘星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-154 白矮星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-155 夸克星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-156 反物质星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-159 音波星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-160 引力星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-161 幻象星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-162 梦境星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-163 植物星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-164 终极星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-168 井国星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-169 冠海星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-170 迁林星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-171 红叶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-174 沉云星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-175 青核星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-176 白潮星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-182 泡界星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-183 万峰星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-184 空谷星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/07_剥削与阶级系统.md, 04_星球档案/V-186 震庭星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/07_剥削与阶级系统.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/07_剥削与阶级系统.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/07_剥削与阶级系统.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/07_剥削与阶级系统.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/07_剥削与阶级系统.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 68. [MEDIUM] Potential historical version fork: '07_势力大事件.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '07_势力大事件.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/07_势力大事件.md, 04_星球档案/V-072 寒星/07_势力体系/07_势力大事件.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/07_势力大事件.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/07_势力大事件.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/07_势力大事件.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/07_势力大事件.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/07_势力大事件.md`
  - `04_星球档案/V-072 寒星/07_势力体系/07_势力大事件.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/07_势力大事件.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/07_势力大事件.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/07_势力大事件.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/07_势力大事件.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 69. [MEDIUM] Potential historical version fork: '07_势力档案_顶级势力C.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '07_势力档案_顶级势力C.md' exist across directories: 07_势力体系/V-079 生命星/07_势力档案_顶级势力C.md, 07_势力体系/V-080 混沌星/07_势力档案_顶级势力C.md, 07_势力体系/V-081 灵能星/07_势力档案_顶级势力C.md, 07_势力体系/V-082 时间星/07_势力档案_顶级势力C.md, 07_势力体系/V-083 虚空星/07_势力档案_顶级势力C.md, 07_势力体系/V-084 维度星/07_势力档案_顶级势力C.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/07_势力档案_顶级势力C.md`
  - `07_势力体系/V-080 混沌星/07_势力档案_顶级势力C.md`
  - `07_势力体系/V-081 灵能星/07_势力档案_顶级势力C.md`
  - `07_势力体系/V-082 时间星/07_势力档案_顶级势力C.md`
  - `07_势力体系/V-083 虚空星/07_势力档案_顶级势力C.md`
  - `07_势力体系/V-084 维度星/07_势力档案_顶级势力C.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 70. [MEDIUM] Potential historical version fork: '07_日常与社会风貌.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '07_日常与社会风貌.md' exist across directories: 04_星球档案/V-004 翠叶星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-005 金沙星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-006 深渊星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-007 雪墓星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-008 层书星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-009 夜沙星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-010 歌云星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-011 镜潮星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-012 心火星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-013 孢云星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-014 鸣晶星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-015 影晶星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-016 霜环星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-017 锈河星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-018 浮叶星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-019 鸣钟星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-020 镜沙星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-021 霜恸星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-022 气旋星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-023 磁暴星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-024 沸海星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-025 织网星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-026 涡流星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-027 晶海星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-028 基因星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-029 梦泽星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-030 熔核星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-031 灰核星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-032 磁渊星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-033 灰烬星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-034 寄生星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-035 极电星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-036 碎刃星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-037 光棱星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-038 尘歌星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-039 雾隐星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-040 血藤星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-041 雷泽星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-042 铁锈星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-043 浮冰星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-044 沙海星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-045 深渊海星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-046 磁极星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-047 幽光星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-048 声波星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-049 潮汐星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-050 死寂星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-052 火雨星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-053 冰风暴星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-054 熔岩星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-055 晶核星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-064 雾霭星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-065 星云星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-066 裂谷星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-067 浮岛星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-079 生命星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-080 混沌星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-081 灵能星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-082 时间星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-083 虚空星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-084 维度星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-085 能量星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-091 冰巨星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-105 暗物质星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-107 鳞木星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-108 息土星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-109 锈骨星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-110 毒岚星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-111 晶髓星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-112 幽泉星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-113 狱火星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-114 蛊厄星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-115 铸心星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-116 幻蜃星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-117 渊噬星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-118 凛灾星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-119 震爆星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-120 蚀骨星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-121 烬灰星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-122 锈死星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-123 衰变星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-124 重压星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-125 极酸星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-126 孢子星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-127 幻魇星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-128 雷暴星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-129 冰晶星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-130 胶沼星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-131 震荡星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-132 镜面星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-133 骨灰星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-134 沸石星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-135 毒晶星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-143 焦土星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-144 结晶海星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-146 沸腾海星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-147 超导冰原星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-152 气体巨行星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-153 脉冲星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-154 白矮星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-155 夸克星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-156 反物质星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-157 奇异质星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-159 音波星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-160 引力星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-162 梦境星/07_势力体系/07_日常与社会风貌.md, 04_星球档案/V-163 植物星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/07_日常与社会风貌.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/07_日常与社会风貌.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-008 层书星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-012 心火星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-025 织网星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-028 基因星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-035 极电星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-048 声波星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-065 星云星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-079 生命星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-082 时间星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-084 维度星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-085 能量星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-108 息土星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-124 重压星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-159 音波星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-160 引力星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/07_日常与社会风貌.md`
  - `04_星球档案/V-163 植物星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/07_日常与社会风貌.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/07_日常与社会风貌.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 71. [MEDIUM] Potential historical version fork: '07_经济与贸易网络.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '07_经济与贸易网络.md' exist across directories: 04_星球档案/V-073 水星/07_势力体系/07_经济与贸易网络.md, 04_星球档案/V-074 光年星/07_势力体系/07_经济与贸易网络.md, 04_星球档案/V-077 重力星/07_势力体系/07_经济与贸易网络.md, 04_星球档案/V-078 水晶星/07_势力体系/07_经济与贸易网络.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/07_经济与贸易网络.md, 04_星球档案/V-151 星尘星/07_势力体系/07_经济与贸易网络.md.
- **Affected Files**:
  - `04_星球档案/V-073 水星/07_势力体系/07_经济与贸易网络.md`
  - `04_星球档案/V-074 光年星/07_势力体系/07_经济与贸易网络.md`
  - `04_星球档案/V-077 重力星/07_势力体系/07_经济与贸易网络.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/07_经济与贸易网络.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/07_经济与贸易网络.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/07_经济与贸易网络.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 72. [MEDIUM] Potential historical version fork: '08_人物与人才池.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '08_人物与人才池.md' exist across directories: 04_星球档案/V-056 重力缝隙星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-057 回声星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-058 碎星带/07_势力体系/08_人物与人才池.md, 04_星球档案/V-059 晶尘星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-060 暗物质星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-061 孢子星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-062 磁星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-063 气态巨星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-086 星核星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-087 光明星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-088 暗黑星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-089 晶灵星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-090 机械星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-092 重力波星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-093 光速星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-094 空间星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-095 意识星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-096 概率星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-097 梦境星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-104 秩序星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-106 起源星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-136 黑洞星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-137 虚空回声星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-139 辐射星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-140 漩涡星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-141 腐蚀星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-142 磁陷星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-161 幻象星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-164 终极星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-165 赤昼星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-166 盐骨星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-167 风蚀星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-168 井国星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-169 冠海星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-170 迁林星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-171 红叶星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-172 镜叶星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-173 琥珀云星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-174 沉云星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-175 青核星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-176 白潮星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-177 寂冻星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-178 蓝棺星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-179 浮礁星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-180 雨幕星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-181 潮锁星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-183 万峰星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-184 空谷星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-185 铁脊星/07_势力体系/08_人物与人才池.md, 04_星球档案/V-186 震庭星/07_势力体系/08_人物与人才池.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/08_人物与人才池.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/08_人物与人才池.md.
- **Affected Files**:
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-057 回声星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-062 磁星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-086 星核星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-087 光明星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-090 机械星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-093 光速星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-094 空间星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-095 意识星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-096 概率星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-106 起源星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-164 终极星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-168 井国星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-175 青核星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/08_人物与人才池.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/08_人物与人才池.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/08_人物与人才池.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/08_人物与人才池.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 73. [MEDIUM] Potential historical version fork: '08_关键人物档案.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '08_关键人物档案.md' exist across directories: 04_星球档案/V-073 水星/07_势力体系/08_关键人物档案.md, 04_星球档案/V-074 光年星/07_势力体系/08_关键人物档案.md, 04_星球档案/V-077 重力星/07_势力体系/08_关键人物档案.md, 04_星球档案/V-078 水晶星/07_势力体系/08_关键人物档案.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/08_关键人物档案.md, 04_星球档案/V-151 星尘星/07_势力体系/08_关键人物档案.md.
- **Affected Files**:
  - `04_星球档案/V-073 水星/07_势力体系/08_关键人物档案.md`
  - `04_星球档案/V-074 光年星/07_势力体系/08_关键人物档案.md`
  - `04_星球档案/V-077 重力星/07_势力体系/08_关键人物档案.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/08_关键人物档案.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/08_关键人物档案.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/08_关键人物档案.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 74. [MEDIUM] Potential historical version fork: '08_奇葩特产与经济.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '08_奇葩特产与经济.md' exist across directories: 07_势力体系/V-079 生命星/08_奇葩特产与经济.md, 07_势力体系/V-080 混沌星/08_奇葩特产与经济.md, 07_势力体系/V-081 灵能星/08_奇葩特产与经济.md, 07_势力体系/V-082 时间星/08_奇葩特产与经济.md, 07_势力体系/V-083 虚空星/08_奇葩特产与经济.md, 07_势力体系/V-084 维度星/08_奇葩特产与经济.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/08_奇葩特产与经济.md`
  - `07_势力体系/V-080 混沌星/08_奇葩特产与经济.md`
  - `07_势力体系/V-081 灵能星/08_奇葩特产与经济.md`
  - `07_势力体系/V-082 时间星/08_奇葩特产与经济.md`
  - `07_势力体系/V-083 虚空星/08_奇葩特产与经济.md`
  - `07_势力体系/V-084 维度星/08_奇葩特产与经济.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 75. [MEDIUM] Potential historical version fork: '08_星际交流与跨星计划.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '08_星际交流与跨星计划.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/08_星际交流与跨星计划.md, 04_星球档案/V-072 寒星/07_势力体系/08_星际交流与跨星计划.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/08_星际交流与跨星计划.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/08_星际交流与跨星计划.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/08_星际交流与跨星计划.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/08_星际交流与跨星计划.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/08_星际交流与跨星计划.md`
  - `04_星球档案/V-072 寒星/07_势力体系/08_星际交流与跨星计划.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/08_星际交流与跨星计划.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/08_星际交流与跨星计划.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/08_星际交流与跨星计划.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/08_星际交流与跨星计划.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 76. [MEDIUM] Potential historical version fork: '08_资源组合反应.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '08_资源组合反应.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-002 灰港星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-003 风暴星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-005 金沙星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-006 深渊星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-008 层书星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-010 歌云星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-012 心火星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-013 孢云星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-015 影晶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-016 霜环星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-017 锈河星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-022 气旋星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-024 沸海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-025 织网星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-026 涡流星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-027 晶海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-028 基因星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-030 熔核星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-031 灰核星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-034 寄生星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-035 极电星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-037 光棱星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-040 血藤星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-044 沙海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-046 磁极星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-047 幽光星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-048 声波星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-050 死寂星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-052 火雨星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-055 晶核星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-057 回声星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-058 碎星带/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-061 孢子星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-062 磁星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-065 星云星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-072 寒星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-073 水星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-074 光年星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-077 重力星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-078 水晶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-079 生命星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-080 混沌星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-081 灵能星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-082 时间星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-083 虚空星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-084 维度星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-085 能量星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-086 星核星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-087 光明星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-090 机械星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-092 重力波星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-093 光速星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-094 空间星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-095 意识星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-096 概率星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-097 梦境星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-098 虚无星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-099 命运星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-100 永恒星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-102 自由星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-103 真理星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-104 秩序星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-106 起源星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-108 息土星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-113 狱火星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-115 铸心星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-119 震爆星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-122 锈死星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-123 衰变星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-124 重压星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-125 极酸星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-126 孢子星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-131 震荡星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-132 镜面星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-134 沸石星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-139 辐射星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-143 焦土星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-151 星尘星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-154 白矮星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-155 夸克星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-156 反物质星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-159 音波星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-160 引力星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-161 幻象星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-162 梦境星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-163 植物星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-164 终极星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-168 井国星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-169 冠海星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-170 迁林星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-171 红叶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-174 沉云星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-175 青核星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-176 白潮星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-182 泡界星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-183 万峰星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-184 空谷星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/08_资源组合反应.md, 04_星球档案/V-186 震庭星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/08_资源组合反应.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/08_资源组合反应.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/08_资源组合反应.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/08_资源组合反应.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/08_资源组合反应.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 77. [MEDIUM] Potential historical version fork: '08_跨星际互动点.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '08_跨星际互动点.md' exist across directories: 04_星球档案/V-004 翠叶星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-005 金沙星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-006 深渊星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-007 雪墓星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-008 层书星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-009 夜沙星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-010 歌云星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-011 镜潮星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-012 心火星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-013 孢云星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-014 鸣晶星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-015 影晶星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-016 霜环星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-017 锈河星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-018 浮叶星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-019 鸣钟星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-020 镜沙星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-021 霜恸星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-022 气旋星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-023 磁暴星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-024 沸海星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-025 织网星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-026 涡流星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-027 晶海星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-028 基因星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-029 梦泽星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-030 熔核星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-031 灰核星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-032 磁渊星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-033 灰烬星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-034 寄生星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-035 极电星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-036 碎刃星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-037 光棱星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-038 尘歌星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-039 雾隐星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-040 血藤星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-041 雷泽星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-042 铁锈星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-043 浮冰星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-044 沙海星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-045 深渊海星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-046 磁极星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-047 幽光星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-048 声波星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-049 潮汐星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-050 死寂星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-052 火雨星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-053 冰风暴星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-054 熔岩星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-055 晶核星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-064 雾霭星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-065 星云星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-066 裂谷星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-067 浮岛星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-079 生命星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-080 混沌星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-081 灵能星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-082 时间星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-083 虚空星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-084 维度星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-085 能量星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-091 冰巨星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-105 暗物质星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-107 鳞木星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-108 息土星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-109 锈骨星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-110 毒岚星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-111 晶髓星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-112 幽泉星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-113 狱火星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-114 蛊厄星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-115 铸心星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-116 幻蜃星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-117 渊噬星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-118 凛灾星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-119 震爆星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-120 蚀骨星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-121 烬灰星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-122 锈死星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-123 衰变星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-124 重压星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-125 极酸星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-126 孢子星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-127 幻魇星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-128 雷暴星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-129 冰晶星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-130 胶沼星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-131 震荡星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-132 镜面星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-133 骨灰星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-134 沸石星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-135 毒晶星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-143 焦土星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-144 结晶海星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-146 沸腾海星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-147 超导冰原星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-152 气体巨行星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-153 脉冲星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-154 白矮星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-155 夸克星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-156 反物质星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-157 奇异质星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-159 音波星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-160 引力星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-162 梦境星/07_势力体系/08_跨星际互动点.md, 04_星球档案/V-163 植物星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/08_跨星际互动点.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/08_跨星际互动点.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-008 层书星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-012 心火星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-025 织网星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-028 基因星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-035 极电星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-048 声波星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-065 星云星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-079 生命星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-082 时间星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-084 维度星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-085 能量星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-108 息土星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-124 重压星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-159 音波星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-160 引力星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/08_跨星际互动点.md`
  - `04_星球档案/V-163 植物星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/08_跨星际互动点.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/08_跨星际互动点.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 78. [MEDIUM] Potential historical version fork: '09_历史大事件与传说.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '09_历史大事件与传说.md' exist across directories: 07_势力体系/V-079 生命星/09_历史大事件与传说.md, 07_势力体系/V-080 混沌星/09_历史大事件与传说.md, 07_势力体系/V-081 灵能星/09_历史大事件与传说.md, 07_势力体系/V-082 时间星/09_历史大事件与传说.md, 07_势力体系/V-083 虚空星/09_历史大事件与传说.md, 07_势力体系/V-084 维度星/09_历史大事件与传说.md.
- **Affected Files**:
  - `07_势力体系/V-079 生命星/09_历史大事件与传说.md`
  - `07_势力体系/V-080 混沌星/09_历史大事件与传说.md`
  - `07_势力体系/V-081 灵能星/09_历史大事件与传说.md`
  - `07_势力体系/V-082 时间星/09_历史大事件与传说.md`
  - `07_势力体系/V-083 虚空星/09_历史大事件与传说.md`
  - `07_势力体系/V-084 维度星/09_历史大事件与传说.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 79. [MEDIUM] Potential historical version fork: '09_待确认问题.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '09_待确认问题.md' exist across directories: 04_星球档案/V-001 苔原-047/07_势力体系/09_待确认问题.md, 04_星球档案/V-002 灰港星/07_势力体系/09_待确认问题.md, 04_星球档案/V-003 风暴星/07_势力体系/09_待确认问题.md, 04_星球档案/V-004 翠叶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-005 金沙星/07_势力体系/09_待确认问题.md, 04_星球档案/V-006 深渊星/07_势力体系/09_待确认问题.md, 04_星球档案/V-007 雪墓星/07_势力体系/09_待确认问题.md, 04_星球档案/V-008 层书星/07_势力体系/09_待确认问题.md, 04_星球档案/V-009 夜沙星/07_势力体系/09_待确认问题.md, 04_星球档案/V-010 歌云星/07_势力体系/09_待确认问题.md, 04_星球档案/V-011 镜潮星/07_势力体系/09_待确认问题.md, 04_星球档案/V-012 心火星/07_势力体系/09_待确认问题.md, 04_星球档案/V-013 孢云星/07_势力体系/09_待确认问题.md, 04_星球档案/V-014 鸣晶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-015 影晶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-016 霜环星/07_势力体系/09_待确认问题.md, 04_星球档案/V-017 锈河星/07_势力体系/09_待确认问题.md, 04_星球档案/V-018 浮叶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-019 鸣钟星/07_势力体系/09_待确认问题.md, 04_星球档案/V-020 镜沙星/07_势力体系/09_待确认问题.md, 04_星球档案/V-021 霜恸星/07_势力体系/09_待确认问题.md, 04_星球档案/V-022 气旋星/07_势力体系/09_待确认问题.md, 04_星球档案/V-023 磁暴星/07_势力体系/09_待确认问题.md, 04_星球档案/V-024 沸海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-025 织网星/07_势力体系/09_待确认问题.md, 04_星球档案/V-026 涡流星/07_势力体系/09_待确认问题.md, 04_星球档案/V-027 晶海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-028 基因星/07_势力体系/09_待确认问题.md, 04_星球档案/V-029 梦泽星/07_势力体系/09_待确认问题.md, 04_星球档案/V-030 熔核星/07_势力体系/09_待确认问题.md, 04_星球档案/V-031 灰核星/07_势力体系/09_待确认问题.md, 04_星球档案/V-032 磁渊星/07_势力体系/09_待确认问题.md, 04_星球档案/V-033 灰烬星/07_势力体系/09_待确认问题.md, 04_星球档案/V-034 寄生星/07_势力体系/09_待确认问题.md, 04_星球档案/V-035 极电星/07_势力体系/09_待确认问题.md, 04_星球档案/V-036 碎刃星/07_势力体系/09_待确认问题.md, 04_星球档案/V-037 光棱星/07_势力体系/09_待确认问题.md, 04_星球档案/V-038 尘歌星/07_势力体系/09_待确认问题.md, 04_星球档案/V-039 雾隐星/07_势力体系/09_待确认问题.md, 04_星球档案/V-040 血藤星/07_势力体系/09_待确认问题.md, 04_星球档案/V-041 雷泽星/07_势力体系/09_待确认问题.md, 04_星球档案/V-042 铁锈星/07_势力体系/09_待确认问题.md, 04_星球档案/V-043 浮冰星/07_势力体系/09_待确认问题.md, 04_星球档案/V-044 沙海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-045 深渊海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-046 磁极星/07_势力体系/09_待确认问题.md, 04_星球档案/V-047 幽光星/07_势力体系/09_待确认问题.md, 04_星球档案/V-048 声波星/07_势力体系/09_待确认问题.md, 04_星球档案/V-049 潮汐星/07_势力体系/09_待确认问题.md, 04_星球档案/V-050 死寂星/07_势力体系/09_待确认问题.md, 04_星球档案/V-052 火雨星/07_势力体系/09_待确认问题.md, 04_星球档案/V-053 冰风暴星/07_势力体系/09_待确认问题.md, 04_星球档案/V-054 熔岩星/07_势力体系/09_待确认问题.md, 04_星球档案/V-055 晶核星/07_势力体系/09_待确认问题.md, 04_星球档案/V-056 重力缝隙星/07_势力体系/09_待确认问题.md, 04_星球档案/V-057 回声星/07_势力体系/09_待确认问题.md, 04_星球档案/V-058 碎星带/07_势力体系/09_待确认问题.md, 04_星球档案/V-059 晶尘星/07_势力体系/09_待确认问题.md, 04_星球档案/V-060 暗物质星/07_势力体系/09_待确认问题.md, 04_星球档案/V-061 孢子星/07_势力体系/09_待确认问题.md, 04_星球档案/V-062 磁星/07_势力体系/09_待确认问题.md, 04_星球档案/V-063 气态巨星/07_势力体系/09_待确认问题.md, 04_星球档案/V-064 雾霭星/07_势力体系/09_待确认问题.md, 04_星球档案/V-065 星云星/07_势力体系/09_待确认问题.md, 04_星球档案/V-066 裂谷星/07_势力体系/09_待确认问题.md, 04_星球档案/V-067 浮岛星/07_势力体系/09_待确认问题.md, 04_星球档案/V-069 极光磁暴星/07_势力体系/09_待确认问题.md, 04_星球档案/V-070 腐毒沼泽星/07_势力体系/09_待确认问题.md, 04_星球档案/V-071 重力扭曲星/07_势力体系/09_待确认问题.md, 04_星球档案/V-073 水星/07_势力体系/09_待确认问题.md, 04_星球档案/V-074 光年星/07_势力体系/09_待确认问题.md, 04_星球档案/V-075 强碱腐蚀星/07_势力体系/09_待确认问题.md, 04_星球档案/V-076 微重力陨石星/07_势力体系/09_待确认问题.md, 04_星球档案/V-077 重力星/07_势力体系/09_待确认问题.md, 04_星球档案/V-078 水晶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-079 生命星/07_势力体系/09_待确认问题.md, 04_星球档案/V-080 混沌星/07_势力体系/09_待确认问题.md, 04_星球档案/V-081 灵能星/07_势力体系/09_待确认问题.md, 04_星球档案/V-082 时间星/07_势力体系/09_待确认问题.md, 04_星球档案/V-083 虚空星/07_势力体系/09_待确认问题.md, 04_星球档案/V-084 维度星/07_势力体系/09_待确认问题.md, 04_星球档案/V-085 能量星/07_势力体系/09_待确认问题.md, 04_星球档案/V-086 星核星/07_势力体系/09_待确认问题.md, 04_星球档案/V-087 光明星/07_势力体系/09_待确认问题.md, 04_星球档案/V-088 暗黑星/07_势力体系/09_待确认问题.md, 04_星球档案/V-089 晶灵星/07_势力体系/09_待确认问题.md, 04_星球档案/V-090 机械星/07_势力体系/09_待确认问题.md, 04_星球档案/V-091 冰巨星/07_势力体系/09_待确认问题.md, 04_星球档案/V-092 重力波星/07_势力体系/09_待确认问题.md, 04_星球档案/V-093 光速星/07_势力体系/09_待确认问题.md, 04_星球档案/V-094 空间星/07_势力体系/09_待确认问题.md, 04_星球档案/V-095 意识星/07_势力体系/09_待确认问题.md, 04_星球档案/V-096 概率星/07_势力体系/09_待确认问题.md, 04_星球档案/V-097 梦境星/07_势力体系/09_待确认问题.md, 04_星球档案/V-104 秩序星/07_势力体系/09_待确认问题.md, 04_星球档案/V-105 暗物质星/07_势力体系/09_待确认问题.md, 04_星球档案/V-106 起源星/07_势力体系/09_待确认问题.md, 04_星球档案/V-107 鳞木星/07_势力体系/09_待确认问题.md, 04_星球档案/V-108 息土星/07_势力体系/09_待确认问题.md, 04_星球档案/V-109 锈骨星/07_势力体系/09_待确认问题.md, 04_星球档案/V-110 毒岚星/07_势力体系/09_待确认问题.md, 04_星球档案/V-111 晶髓星/07_势力体系/09_待确认问题.md, 04_星球档案/V-112 幽泉星/07_势力体系/09_待确认问题.md, 04_星球档案/V-113 狱火星/07_势力体系/09_待确认问题.md, 04_星球档案/V-114 蛊厄星/07_势力体系/09_待确认问题.md, 04_星球档案/V-115 铸心星/07_势力体系/09_待确认问题.md, 04_星球档案/V-116 幻蜃星/07_势力体系/09_待确认问题.md, 04_星球档案/V-117 渊噬星/07_势力体系/09_待确认问题.md, 04_星球档案/V-118 凛灾星/07_势力体系/09_待确认问题.md, 04_星球档案/V-119 震爆星/07_势力体系/09_待确认问题.md, 04_星球档案/V-120 蚀骨星/07_势力体系/09_待确认问题.md, 04_星球档案/V-121 烬灰星/07_势力体系/09_待确认问题.md, 04_星球档案/V-122 锈死星/07_势力体系/09_待确认问题.md, 04_星球档案/V-123 衰变星/07_势力体系/09_待确认问题.md, 04_星球档案/V-124 重压星/07_势力体系/09_待确认问题.md, 04_星球档案/V-125 极酸星/07_势力体系/09_待确认问题.md, 04_星球档案/V-126 孢子星/07_势力体系/09_待确认问题.md, 04_星球档案/V-127 幻魇星/07_势力体系/09_待确认问题.md, 04_星球档案/V-128 雷暴星/07_势力体系/09_待确认问题.md, 04_星球档案/V-129 冰晶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-130 胶沼星/07_势力体系/09_待确认问题.md, 04_星球档案/V-131 震荡星/07_势力体系/09_待确认问题.md, 04_星球档案/V-132 镜面星/07_势力体系/09_待确认问题.md, 04_星球档案/V-133 骨灰星/07_势力体系/09_待确认问题.md, 04_星球档案/V-134 沸石星/07_势力体系/09_待确认问题.md, 04_星球档案/V-135 毒晶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-136 黑洞星/07_势力体系/09_待确认问题.md, 04_星球档案/V-137 虚空回声星/07_势力体系/09_待确认问题.md, 04_星球档案/V-138 碎星带陨石星/07_势力体系/09_待确认问题.md, 04_星球档案/V-139 辐射星/07_势力体系/09_待确认问题.md, 04_星球档案/V-140 漩涡星/07_势力体系/09_待确认问题.md, 04_星球档案/V-141 腐蚀星/07_势力体系/09_待确认问题.md, 04_星球档案/V-142 磁陷星/07_势力体系/09_待确认问题.md, 04_星球档案/V-143 焦土星/07_势力体系/09_待确认问题.md, 04_星球档案/V-144 结晶海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-145 虚空暗面星/07_势力体系/09_待确认问题.md, 04_星球档案/V-146 沸腾海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-147 超导冰原星/07_势力体系/09_待确认问题.md, 04_星球档案/V-148 裂变废墟星/07_势力体系/09_待确认问题.md, 04_星球档案/V-149 液氮极寒星/07_势力体系/09_待确认问题.md, 04_星球档案/V-150 黑洞边缘星/07_势力体系/09_待确认问题.md, 04_星球档案/V-151 星尘星/07_势力体系/09_待确认问题.md, 04_星球档案/V-152 气体巨行星/07_势力体系/09_待确认问题.md, 04_星球档案/V-153 脉冲星/07_势力体系/09_待确认问题.md, 04_星球档案/V-154 白矮星/07_势力体系/09_待确认问题.md, 04_星球档案/V-155 夸克星/07_势力体系/09_待确认问题.md, 04_星球档案/V-156 反物质星/07_势力体系/09_待确认问题.md, 04_星球档案/V-157 奇异质星/07_势力体系/09_待确认问题.md, 04_星球档案/V-158 碎裂时空星/07_势力体系/09_待确认问题.md, 04_星球档案/V-159 音波星/07_势力体系/09_待确认问题.md, 04_星球档案/V-160 引力星/07_势力体系/09_待确认问题.md, 04_星球档案/V-161 幻象星/07_势力体系/09_待确认问题.md, 04_星球档案/V-162 梦境星/07_势力体系/09_待确认问题.md, 04_星球档案/V-163 植物星/07_势力体系/09_待确认问题.md, 04_星球档案/V-164 终极星/07_势力体系/09_待确认问题.md, 04_星球档案/V-165 赤昼星/07_势力体系/09_待确认问题.md, 04_星球档案/V-166 盐骨星/07_势力体系/09_待确认问题.md, 04_星球档案/V-167 风蚀星/07_势力体系/09_待确认问题.md, 04_星球档案/V-168 井国星/07_势力体系/09_待确认问题.md, 04_星球档案/V-169 冠海星/07_势力体系/09_待确认问题.md, 04_星球档案/V-170 迁林星/07_势力体系/09_待确认问题.md, 04_星球档案/V-171 红叶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-172 镜叶星/07_势力体系/09_待确认问题.md, 04_星球档案/V-173 琥珀云星/07_势力体系/09_待确认问题.md, 04_星球档案/V-174 沉云星/07_势力体系/09_待确认问题.md, 04_星球档案/V-175 青核星/07_势力体系/09_待确认问题.md, 04_星球档案/V-176 白潮星/07_势力体系/09_待确认问题.md, 04_星球档案/V-177 寂冻星/07_势力体系/09_待确认问题.md, 04_星球档案/V-178 蓝棺星/07_势力体系/09_待确认问题.md, 04_星球档案/V-179 浮礁星/07_势力体系/09_待确认问题.md, 04_星球档案/V-180 雨幕星/07_势力体系/09_待确认问题.md, 04_星球档案/V-181 潮锁星/07_势力体系/09_待确认问题.md, 04_星球档案/V-183 万峰星/07_势力体系/09_待确认问题.md, 04_星球档案/V-184 空谷星/07_势力体系/09_待确认问题.md, 04_星球档案/V-185 铁脊星/07_势力体系/09_待确认问题.md, 04_星球档案/V-186 震庭星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/09_待确认问题.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/09_待确认问题.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-002 灰港星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-003 风暴星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-004 翠叶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-005 金沙星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-006 深渊星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-007 雪墓星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-008 层书星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-009 夜沙星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-010 歌云星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-011 镜潮星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-012 心火星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-013 孢云星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-014 鸣晶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-015 影晶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-016 霜环星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-017 锈河星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-018 浮叶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-019 鸣钟星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-020 镜沙星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-021 霜恸星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-022 气旋星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-023 磁暴星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-024 沸海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-025 织网星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-026 涡流星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-027 晶海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-028 基因星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-029 梦泽星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-030 熔核星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-031 灰核星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-032 磁渊星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-033 灰烬星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-034 寄生星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-035 极电星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-036 碎刃星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-037 光棱星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-038 尘歌星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-039 雾隐星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-040 血藤星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-041 雷泽星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-042 铁锈星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-043 浮冰星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-044 沙海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-045 深渊海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-046 磁极星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-047 幽光星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-048 声波星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-049 潮汐星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-050 死寂星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-052 火雨星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-053 冰风暴星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-054 熔岩星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-055 晶核星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-056 重力缝隙星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-057 回声星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-058 碎星带/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-059 晶尘星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-060 暗物质星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-061 孢子星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-062 磁星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-063 气态巨星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-064 雾霭星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-065 星云星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-066 裂谷星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-067 浮岛星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-069 极光磁暴星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-070 腐毒沼泽星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-071 重力扭曲星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-073 水星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-074 光年星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-075 强碱腐蚀星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-076 微重力陨石星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-077 重力星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-078 水晶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-079 生命星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-080 混沌星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-081 灵能星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-082 时间星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-083 虚空星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-084 维度星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-085 能量星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-086 星核星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-087 光明星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-088 暗黑星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-089 晶灵星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-090 机械星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-091 冰巨星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-092 重力波星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-093 光速星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-094 空间星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-095 意识星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-096 概率星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-097 梦境星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-104 秩序星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-106 起源星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-107 鳞木星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-108 息土星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-109 锈骨星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-110 毒岚星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-111 晶髓星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-112 幽泉星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-113 狱火星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-114 蛊厄星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-115 铸心星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-116 幻蜃星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-117 渊噬星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-118 凛灾星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-119 震爆星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-120 蚀骨星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-121 烬灰星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-122 锈死星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-123 衰变星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-124 重压星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-125 极酸星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-127 幻魇星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-128 雷暴星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-129 冰晶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-130 胶沼星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-131 震荡星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-132 镜面星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-133 骨灰星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-134 沸石星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-135 毒晶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-136 黑洞星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-137 虚空回声星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-138 碎星带陨石星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-139 辐射星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-140 漩涡星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-141 腐蚀星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-142 磁陷星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-143 焦土星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-144 结晶海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-145 虚空暗面星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-146 沸腾海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-147 超导冰原星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-148 裂变废墟星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-149 液氮极寒星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-150 黑洞边缘星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-151 星尘星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-152 气体巨行星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-153 脉冲星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-154 白矮星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-155 夸克星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-156 反物质星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-157 奇异质星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-158 碎裂时空星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-159 音波星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-160 引力星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-161 幻象星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-163 植物星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-164 终极星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-165 赤昼星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-166 盐骨星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-167 风蚀星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-168 井国星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-169 冠海星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-170 迁林星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-171 红叶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-172 镜叶星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-173 琥珀云星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-174 沉云星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-175 青核星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-176 白潮星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-177 寂冻星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-178 蓝棺星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-179 浮礁星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-180 雨幕星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-181 潮锁星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-183 万峰星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-184 空谷星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-185 铁脊星/07_势力体系/09_待确认问题.md`
  - `04_星球档案/V-186 震庭星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/09_待确认问题.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/09_待确认问题.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 80. [MEDIUM] Potential historical version fork: '09_待确认问题与跑团接口.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '09_待确认问题与跑团接口.md' exist across directories: 04_星球档案/V-068 蓝藻星/07_势力体系/09_待确认问题与跑团接口.md, 04_星球档案/V-072 寒星/07_势力体系/09_待确认问题与跑团接口.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/09_待确认问题与跑团接口.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/09_待确认问题与跑团接口.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/09_待确认问题与跑团接口.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/09_待确认问题与跑团接口.md.
- **Affected Files**:
  - `04_星球档案/V-068 蓝藻星/07_势力体系/09_待确认问题与跑团接口.md`
  - `04_星球档案/V-072 寒星/07_势力体系/09_待确认问题与跑团接口.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/09_待确认问题与跑团接口.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/09_待确认问题与跑团接口.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/09_待确认问题与跑团接口.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/09_待确认问题与跑团接口.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 81. [MEDIUM] Potential historical version fork: '09_浮叶神经网络核心.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '09_浮叶神经网络核心.md' exist across directories: 05_种族与器物/01_核心种族/09_浮叶神经网络核心.md, 05_种族与器物/02_关键器物/09_浮叶神经网络核心.md.
- **Affected Files**:
  - `05_种族与器物/01_核心种族/09_浮叶神经网络核心.md`
  - `05_种族与器物/02_关键器物/09_浮叶神经网络核心.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 82. [MEDIUM] Potential historical version fork: '09_资源贸易与时空航道.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '09_资源贸易与时空航道.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-002 灰港星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-003 风暴星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-005 金沙星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-006 深渊星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-008 层书星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-010 歌云星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-012 心火星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-013 孢云星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-015 影晶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-016 霜环星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-017 锈河星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-022 气旋星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-024 沸海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-025 织网星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-026 涡流星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-027 晶海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-028 基因星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-030 熔核星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-031 灰核星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-034 寄生星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-035 极电星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-037 光棱星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-040 血藤星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-044 沙海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-046 磁极星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-047 幽光星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-048 声波星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-050 死寂星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-052 火雨星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-055 晶核星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-057 回声星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-058 碎星带/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-061 孢子星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-062 磁星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-065 星云星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-072 寒星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-073 水星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-074 光年星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-077 重力星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-078 水晶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-079 生命星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-080 混沌星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-081 灵能星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-082 时间星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-083 虚空星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-084 维度星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-085 能量星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-086 星核星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-087 光明星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-090 机械星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-092 重力波星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-093 光速星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-094 空间星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-095 意识星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-096 概率星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-097 梦境星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-098 虚无星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-099 命运星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-100 永恒星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-102 自由星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-103 真理星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-104 秩序星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-106 起源星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-108 息土星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-113 狱火星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-115 铸心星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-119 震爆星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-122 锈死星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-123 衰变星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-124 重压星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-125 极酸星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-126 孢子星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-131 震荡星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-132 镜面星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-134 沸石星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-139 辐射星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-143 焦土星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-151 星尘星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-154 白矮星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-155 夸克星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-156 反物质星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-159 音波星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-160 引力星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-161 幻象星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-162 梦境星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-163 植物星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-164 终极星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-168 井国星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-169 冠海星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-170 迁林星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-171 红叶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-174 沉云星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-175 青核星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-176 白潮星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-182 泡界星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-183 万峰星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-184 空谷星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/09_资源贸易与时空航道.md, 04_星球档案/V-186 震庭星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/09_资源贸易与时空航道.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/09_资源贸易与时空航道.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/09_资源贸易与时空航道.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/09_资源贸易与时空航道.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 83. [MEDIUM] Potential historical version fork: '10_黑市与时空势力.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '10_黑市与时空势力.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-002 灰港星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-003 风暴星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-005 金沙星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-006 深渊星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-008 层书星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-010 歌云星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-012 心火星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-013 孢云星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-015 影晶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-016 霜环星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-017 锈河星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-022 气旋星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-024 沸海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-025 织网星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-026 涡流星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-027 晶海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-028 基因星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-030 熔核星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-031 灰核星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-034 寄生星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-035 极电星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-037 光棱星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-040 血藤星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-044 沙海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-046 磁极星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-047 幽光星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-048 声波星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-050 死寂星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-052 火雨星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-055 晶核星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-057 回声星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-058 碎星带/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-061 孢子星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-062 磁星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-065 星云星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-072 寒星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-073 水星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-074 光年星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-077 重力星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-078 水晶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-079 生命星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-080 混沌星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-081 灵能星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-082 时间星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-083 虚空星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-084 维度星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-085 能量星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-086 星核星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-087 光明星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-090 机械星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-092 重力波星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-093 光速星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-094 空间星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-095 意识星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-096 概率星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-097 梦境星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-098 虚无星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-099 命运星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-100 永恒星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-102 自由星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-103 真理星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-104 秩序星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-106 起源星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-108 息土星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-113 狱火星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-115 铸心星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-119 震爆星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-122 锈死星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-123 衰变星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-124 重压星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-125 极酸星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-126 孢子星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-131 震荡星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-132 镜面星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-134 沸石星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-139 辐射星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-143 焦土星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-151 星尘星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-154 白矮星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-155 夸克星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-156 反物质星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-159 音波星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-160 引力星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-161 幻象星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-162 梦境星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-163 植物星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-164 终极星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-168 井国星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-169 冠海星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-170 迁林星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-171 红叶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-174 沉云星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-175 青核星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-176 白潮星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-182 泡界星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-183 万峰星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-184 空谷星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/10_黑市与时空势力.md, 04_星球档案/V-186 震庭星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/10_黑市与时空势力.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/10_黑市与时空势力.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/10_黑市与时空势力.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/10_黑市与时空势力.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/10_黑市与时空势力.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 84. [MEDIUM] Potential historical version fork: '11_逻辑压力测试.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '11_逻辑压力测试.md' exist across directories: 04_星球档案/V-001 苔原-047/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-002 灰港星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-003 风暴星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-004 翠叶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-005 金沙星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-006 深渊星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-007 雪墓星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-008 层书星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-009 夜沙星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-010 歌云星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-011 镜潮星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-012 心火星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-013 孢云星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-014 鸣晶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-015 影晶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-016 霜环星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-017 锈河星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-018 浮叶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-019 鸣钟星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-020 镜沙星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-021 霜恸星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-022 气旋星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-023 磁暴星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-024 沸海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-025 织网星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-026 涡流星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-027 晶海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-028 基因星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-029 梦泽星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-030 熔核星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-031 灰核星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-032 磁渊星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-033 灰烬星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-034 寄生星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-035 极电星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-036 碎刃星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-037 光棱星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-038 尘歌星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-039 雾隐星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-040 血藤星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-041 雷泽星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-042 铁锈星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-043 浮冰星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-044 沙海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-045 深渊海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-046 磁极星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-047 幽光星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-048 声波星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-049 潮汐星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-050 死寂星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-052 火雨星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-053 冰风暴星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-054 熔岩星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-055 晶核星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-056 重力缝隙星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-057 回声星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-058 碎星带/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-059 晶尘星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-060 暗物质星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-061 孢子星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-062 磁星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-063 气态巨星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-064 雾霭星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-065 星云星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-066 裂谷星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-067 浮岛星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-068 蓝藻星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-069 极光磁暴星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-071 重力扭曲星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-072 寒星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-073 水星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-074 光年星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-076 微重力陨石星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-077 重力星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-078 水晶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-079 生命星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-080 混沌星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-081 灵能星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-082 时间星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-083 虚空星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-084 维度星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-085 能量星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-086 星核星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-087 光明星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-088 暗黑星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-089 晶灵星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-090 机械星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-091 冰巨星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-092 重力波星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-093 光速星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-094 空间星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-095 意识星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-096 概率星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-097 梦境星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-098 虚无星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-099 命运星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-100 永恒星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-101 灵魂星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-102 自由星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-103 真理星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-104 秩序星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-105 暗物质星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-106 起源星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-107 鳞木星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-108 息土星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-109 锈骨星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-110 毒岚星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-111 晶髓星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-112 幽泉星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-113 狱火星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-114 蛊厄星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-115 铸心星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-116 幻蜃星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-117 渊噬星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-118 凛灾星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-119 震爆星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-120 蚀骨星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-121 烬灰星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-122 锈死星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-123 衰变星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-124 重压星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-125 极酸星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-126 孢子星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-127 幻魇星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-128 雷暴星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-129 冰晶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-130 胶沼星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-131 震荡星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-132 镜面星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-133 骨灰星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-134 沸石星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-135 毒晶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-136 黑洞星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-137 虚空回声星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-138 碎星带陨石星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-139 辐射星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-140 漩涡星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-141 腐蚀星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-142 磁陷星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-143 焦土星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-144 结晶海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-145 虚空暗面星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-146 沸腾海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-147 超导冰原星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-148 裂变废墟星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-149 液氮极寒星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-150 黑洞边缘星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-151 星尘星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-152 气体巨行星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-153 脉冲星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-154 白矮星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-155 夸克星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-156 反物质星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-157 奇异质星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-158 碎裂时空星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-159 音波星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-160 引力星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-161 幻象星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-162 梦境星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-163 植物星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-164 终极星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-165 赤昼星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-166 盐骨星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-167 风蚀星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-168 井国星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-169 冠海星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-170 迁林星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-171 红叶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-172 镜叶星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-173 琥珀云星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-174 沉云星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-175 青核星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-176 白潮星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-177 寂冻星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-178 蓝棺星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-179 浮礁星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-180 雨幕星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-181 潮锁星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-182 泡界星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-183 万峰星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-184 空谷星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-185 铁脊星/06_全量资源系统/11_逻辑压力测试.md, 04_星球档案/V-186 震庭星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/11_逻辑压力测试.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/11_逻辑压力测试.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-002 灰港星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-003 风暴星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-004 翠叶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-005 金沙星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-006 深渊星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-007 雪墓星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-008 层书星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-009 夜沙星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-010 歌云星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-011 镜潮星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-012 心火星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-013 孢云星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-014 鸣晶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-015 影晶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-016 霜环星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-017 锈河星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-018 浮叶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-019 鸣钟星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-020 镜沙星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-021 霜恸星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-022 气旋星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-023 磁暴星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-024 沸海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-025 织网星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-026 涡流星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-027 晶海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-028 基因星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-029 梦泽星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-030 熔核星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-031 灰核星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-032 磁渊星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-033 灰烬星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-034 寄生星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-035 极电星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-036 碎刃星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-037 光棱星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-038 尘歌星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-039 雾隐星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-040 血藤星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-041 雷泽星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-042 铁锈星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-043 浮冰星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-044 沙海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-045 深渊海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-046 磁极星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-047 幽光星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-048 声波星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-049 潮汐星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-050 死寂星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-052 火雨星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-053 冰风暴星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-054 熔岩星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-055 晶核星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-056 重力缝隙星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-057 回声星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-058 碎星带/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-059 晶尘星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-060 暗物质星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-061 孢子星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-062 磁星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-063 气态巨星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-064 雾霭星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-065 星云星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-066 裂谷星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-067 浮岛星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-068 蓝藻星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-069 极光磁暴星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-070 腐毒沼泽星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-071 重力扭曲星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-072 寒星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-073 水星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-074 光年星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-075 强碱腐蚀星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-076 微重力陨石星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-077 重力星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-078 水晶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-079 生命星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-080 混沌星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-081 灵能星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-082 时间星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-083 虚空星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-084 维度星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-085 能量星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-086 星核星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-087 光明星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-088 暗黑星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-089 晶灵星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-090 机械星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-091 冰巨星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-092 重力波星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-093 光速星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-094 空间星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-095 意识星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-096 概率星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-097 梦境星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-098 虚无星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-099 命运星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-100 永恒星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-101 灵魂星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-102 自由星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-103 真理星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-104 秩序星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-105 暗物质星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-106 起源星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-107 鳞木星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-108 息土星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-109 锈骨星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-110 毒岚星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-111 晶髓星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-112 幽泉星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-113 狱火星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-114 蛊厄星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-115 铸心星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-116 幻蜃星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-117 渊噬星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-118 凛灾星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-119 震爆星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-120 蚀骨星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-121 烬灰星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-122 锈死星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-123 衰变星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-124 重压星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-125 极酸星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-126 孢子星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-127 幻魇星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-128 雷暴星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-129 冰晶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-130 胶沼星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-131 震荡星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-132 镜面星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-133 骨灰星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-134 沸石星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-135 毒晶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-136 黑洞星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-137 虚空回声星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-138 碎星带陨石星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-139 辐射星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-140 漩涡星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-141 腐蚀星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-142 磁陷星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-143 焦土星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-144 结晶海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-145 虚空暗面星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-146 沸腾海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-147 超导冰原星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-148 裂变废墟星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-149 液氮极寒星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-150 黑洞边缘星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-151 星尘星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-152 气体巨行星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-153 脉冲星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-154 白矮星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-155 夸克星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-156 反物质星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-157 奇异质星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-158 碎裂时空星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-159 音波星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-160 引力星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-161 幻象星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-162 梦境星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-163 植物星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-164 终极星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-165 赤昼星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-166 盐骨星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-167 风蚀星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-168 井国星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-169 冠海星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-170 迁林星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-171 红叶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-172 镜叶星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-173 琥珀云星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-174 沉云星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-175 青核星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-176 白潮星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-177 寂冻星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-178 蓝棺星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-179 浮礁星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-180 雨幕星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-181 潮锁星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-182 泡界星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-183 万峰星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-184 空谷星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-185 铁脊星/06_全量资源系统/11_逻辑压力测试.md`
  - `04_星球档案/V-186 震庭星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/06_全量资源系统/11_逻辑压力测试.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/06_全量资源系统/11_逻辑压力测试.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 85. [MEDIUM] Potential historical version fork: 'CARD-CY-101_画地为牢.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of 'CARD-CY-101_画地为牢.md' exist across directories: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-101_画地为牢.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-101_画地为牢.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-101_画地为牢.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-101_画地为牢.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 86. [MEDIUM] Potential historical version fork: 'CARD-CY-119_抱残守缺.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of 'CARD-CY-119_抱残守缺.md' exist across directories: 创意提取库/卡片盒/01_成语与古典典故/CARD-CY-119_抱残守缺.md, 创意提取库/卡片盒/01_成语俗语/CARD-CY-119_抱残守缺.md.
- **Affected Files**:
  - `创意提取库/卡片盒/01_成语与古典典故/CARD-CY-119_抱残守缺.md`
  - `创意提取库/卡片盒/01_成语俗语/CARD-CY-119_抱残守缺.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 87. [MEDIUM] Potential historical version fork: '基因星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '基因星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-028 基因星/03_生态/基因星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/03_生态/基因星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-028 基因星/03_生态/基因星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/03_生态/基因星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 88. [MEDIUM] Potential historical version fork: '基因星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '基因星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-028 基因星/03_生态/基因星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-070 基因星/03_生态/基因星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-028 基因星/03_生态/基因星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/03_生态/基因星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 89. [MEDIUM] Potential historical version fork: '孢子星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '孢子星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-061 孢子星/03_生态/孢子星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-126 孢子星/03_生态/孢子星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/03_生态/孢子星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-126 孢子星/03_生态/孢子星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 90. [MEDIUM] Potential historical version fork: '孢子星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '孢子星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-061 孢子星/03_生态/孢子星衍生生态·特殊物质.md, 04_星球档案/V-126 孢子星/03_生态/孢子星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/03_生态/孢子星衍生生态·特殊物质.md`
  - `04_星球档案/V-126 孢子星/03_生态/孢子星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 91. [MEDIUM] Potential historical version fork: '宇宙通用规则.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '宇宙通用规则.md' exist across directories: 01_世界观与核心法则/宇宙通用规则.md, 12_剧本与基础设定/宇宙通用规则.md.
- **Affected Files**:
  - `01_世界观与核心法则/宇宙通用规则.md`
  - `12_剧本与基础设定/宇宙通用规则.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 92. [MEDIUM] Potential historical version fork: '暗物质星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '暗物质星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-060 暗物质星/03_生态/暗物质星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-105 暗物质星/03_生态/暗物质星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/03_生态/暗物质星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-105 暗物质星/03_生态/暗物质星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 93. [MEDIUM] Potential historical version fork: '暗物质星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '暗物质星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-060 暗物质星/03_生态/暗物质星衍生生态·特殊物质.md, 04_星球档案/V-105 暗物质星/03_生态/暗物质星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/03_生态/暗物质星衍生生态·特殊物质.md`
  - `04_星球档案/V-105 暗物质星/03_生态/暗物质星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 94. [MEDIUM] Potential historical version fork: '机械星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '机械星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-090 机械星/03_生态/机械星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/03_生态/机械星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-090 机械星/03_生态/机械星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/03_生态/机械星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 95. [MEDIUM] Potential historical version fork: '机械星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '机械星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-090 机械星/03_生态/机械星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-096 机械星/03_生态/机械星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-090 机械星/03_生态/机械星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/03_生态/机械星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 96. [MEDIUM] Potential historical version fork: '极电星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '极电星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-035 极电星/03_生态/极电星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/03_生态/极电星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-035 极电星/03_生态/极电星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/03_生态/极电星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 97. [MEDIUM] Potential historical version fork: '极电星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '极电星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-035 极电星/03_生态/极电星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-025 极电星/03_生态/极电星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-035 极电星/03_生态/极电星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/03_生态/极电星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 98. [MEDIUM] Potential historical version fork: '梦境星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '梦境星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-097 梦境星/03_生态/梦境星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-162 梦境星/03_生态/梦境星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/03_生态/梦境星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-162 梦境星/03_生态/梦境星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 99. [MEDIUM] Potential historical version fork: '梦境星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '梦境星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-097 梦境星/03_生态/梦境星衍生生态·特殊物质.md, 04_星球档案/V-162 梦境星/03_生态/梦境星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/03_生态/梦境星衍生生态·特殊物质.md`
  - `04_星球档案/V-162 梦境星/03_生态/梦境星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 100. [MEDIUM] Potential historical version fork: '梦泽星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '梦泽星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-029 梦泽星/03_生态/梦泽星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/03_生态/梦泽星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-029 梦泽星/03_生态/梦泽星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/03_生态/梦泽星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 101. [MEDIUM] Potential historical version fork: '梦泽星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '梦泽星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-029 梦泽星/03_生态/梦泽星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/03_生态/梦泽星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-029 梦泽星/03_生态/梦泽星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/03_生态/梦泽星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 102. [MEDIUM] Potential historical version fork: '深渊星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '深渊星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-006 深渊星/深渊星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-006 深渊星/03_生态/深渊星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-006 深渊星/深渊星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-006 深渊星/03_生态/深渊星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 103. [MEDIUM] Potential historical version fork: '深渊星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '深渊星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-006 深渊星/深渊星衍生生态·特殊物质.md, 04_星球档案/V-006 深渊星/03_生态/深渊星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-006 深渊星/深渊星衍生生态·特殊物质.md`
  - `04_星球档案/V-006 深渊星/03_生态/深渊星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 104. [MEDIUM] Potential historical version fork: '深渊星衍生生态·生态循环与种间互作.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '深渊星衍生生态·生态循环与种间互作.md' exist across directories: 04_星球档案/V-006 深渊星/深渊星衍生生态·生态循环与种间互作.md, 04_星球档案/V-006 深渊星/03_生态/深渊星衍生生态·生态循环与种间互作.md.
- **Affected Files**:
  - `04_星球档案/V-006 深渊星/深渊星衍生生态·生态循环与种间互作.md`
  - `04_星球档案/V-006 深渊星/03_生态/深渊星衍生生态·生态循环与种间互作.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 105. [MEDIUM] Potential historical version fork: '灰核星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '灰核星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-031 灰核星/03_生态/灰核星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/03_生态/灰核星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-031 灰核星/03_生态/灰核星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/03_生态/灰核星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 106. [MEDIUM] Potential historical version fork: '灰核星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '灰核星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-031 灰核星/03_生态/灰核星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/03_生态/灰核星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-031 灰核星/03_生态/灰核星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/03_生态/灰核星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 107. [MEDIUM] Potential historical version fork: '灰港星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '灰港星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-002 灰港星/灰港星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-002 灰港星/03_生态/灰港星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-002 灰港星/灰港星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-002 灰港星/03_生态/灰港星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 108. [MEDIUM] Potential historical version fork: '灰港星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '灰港星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-002 灰港星/灰港星衍生生态·特殊物质.md, 04_星球档案/V-002 灰港星/03_生态/灰港星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-002 灰港星/灰港星衍生生态·特殊物质.md`
  - `04_星球档案/V-002 灰港星/03_生态/灰港星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 109. [MEDIUM] Potential historical version fork: '灰港星衍生生态·生态循环与种间互作.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '灰港星衍生生态·生态循环与种间互作.md' exist across directories: 04_星球档案/V-002 灰港星/灰港星衍生生态·生态循环与种间互作.md, 04_星球档案/V-002 灰港星/03_生态/灰港星衍生生态·生态循环与种间互作.md.
- **Affected Files**:
  - `04_星球档案/V-002 灰港星/灰港星衍生生态·生态循环与种间互作.md`
  - `04_星球档案/V-002 灰港星/03_生态/灰港星衍生生态·生态循环与种间互作.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 110. [MEDIUM] Potential historical version fork: '熔核星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '熔核星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-030 熔核星/03_生态/熔核星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/03_生态/熔核星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-030 熔核星/03_生态/熔核星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/03_生态/熔核星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 111. [MEDIUM] Potential historical version fork: '熔核星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '熔核星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-030 熔核星/03_生态/熔核星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/03_生态/熔核星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-030 熔核星/03_生态/熔核星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/03_生态/熔核星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 112. [MEDIUM] Potential historical version fork: '生命星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '生命星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-079 生命星/03_生态/生命星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/03_生态/生命星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-079 生命星/03_生态/生命星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/03_生态/生命星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 113. [MEDIUM] Potential historical version fork: '生命星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '生命星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-079 生命星/03_生态/生命星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-092 生命星/03_生态/生命星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-079 生命星/03_生态/生命星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/03_生态/生命星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 114. [MEDIUM] Potential historical version fork: '磁星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '磁星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-062 磁星/03_生态/磁星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/03_生态/磁星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-062 磁星/03_生态/磁星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/03_生态/磁星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 115. [MEDIUM] Potential historical version fork: '磁星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '磁星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-062 磁星/03_生态/磁星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-089 磁星/03_生态/磁星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-062 磁星/03_生态/磁星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/03_生态/磁星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 116. [MEDIUM] Potential historical version fork: '磁暴星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '磁暴星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-023 磁暴星/03_生态/磁暴星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/03_生态/磁暴星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/03_生态/磁暴星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-023 磁暴星/03_生态/磁暴星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/03_生态/磁暴星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/03_生态/磁暴星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 117. [MEDIUM] Potential historical version fork: '磁暴星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '磁暴星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-023 磁暴星/03_生态/磁暴星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/03_生态/磁暴星衍生生态·特殊物质.md, 09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/03_生态/磁暴星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-023 磁暴星/03_生态/磁暴星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/03_生态/磁暴星衍生生态·特殊物质.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/03_生态/磁暴星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 118. [MEDIUM] Potential historical version fork: '翠叶星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '翠叶星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-004 翠叶星/翠叶星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-004 翠叶星/03_生态/翠叶星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/翠叶星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-004 翠叶星/03_生态/翠叶星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 119. [MEDIUM] Potential historical version fork: '翠叶星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '翠叶星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-004 翠叶星/翠叶星衍生生态·特殊物质.md, 04_星球档案/V-004 翠叶星/03_生态/翠叶星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/翠叶星衍生生态·特殊物质.md`
  - `04_星球档案/V-004 翠叶星/03_生态/翠叶星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 120. [MEDIUM] Potential historical version fork: '翠叶星衍生生态·生态循环与种间互作.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '翠叶星衍生生态·生态循环与种间互作.md' exist across directories: 04_星球档案/V-004 翠叶星/翠叶星衍生生态·生态循环与种间互作.md, 04_星球档案/V-004 翠叶星/03_生态/翠叶星衍生生态·生态循环与种间互作.md.
- **Affected Files**:
  - `04_星球档案/V-004 翠叶星/翠叶星衍生生态·生态循环与种间互作.md`
  - `04_星球档案/V-004 翠叶星/03_生态/翠叶星衍生生态·生态循环与种间互作.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 121. [MEDIUM] Potential historical version fork: '苔原-047衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '苔原-047衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-001 苔原-047/苔原-047衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-001 苔原-047/03_生态/苔原-047衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/苔原-047衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-001 苔原-047/03_生态/苔原-047衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 122. [MEDIUM] Potential historical version fork: '苔原-047衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '苔原-047衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-001 苔原-047/苔原-047衍生生态·特殊物质.md, 04_星球档案/V-001 苔原-047/03_生态/苔原-047衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/苔原-047衍生生态·特殊物质.md`
  - `04_星球档案/V-001 苔原-047/03_生态/苔原-047衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 123. [MEDIUM] Potential historical version fork: '苔原-047衍生生态·生态循环与种间互作.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '苔原-047衍生生态·生态循环与种间互作.md' exist across directories: 04_星球档案/V-001 苔原-047/苔原-047衍生生态·生态循环与种间互作.md, 04_星球档案/V-001 苔原-047/03_生态/苔原-047衍生生态·生态循环与种间互作.md.
- **Affected Files**:
  - `04_星球档案/V-001 苔原-047/苔原-047衍生生态·生态循环与种间互作.md`
  - `04_星球档案/V-001 苔原-047/03_生态/苔原-047衍生生态·生态循环与种间互作.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 124. [MEDIUM] Potential historical version fork: '金沙星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '金沙星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-005 金沙星/金沙星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-005 金沙星/03_生态/金沙星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-005 金沙星/金沙星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-005 金沙星/03_生态/金沙星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 125. [MEDIUM] Potential historical version fork: '金沙星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '金沙星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-005 金沙星/金沙星衍生生态·特殊物质.md, 04_星球档案/V-005 金沙星/03_生态/金沙星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-005 金沙星/金沙星衍生生态·特殊物质.md`
  - `04_星球档案/V-005 金沙星/03_生态/金沙星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 126. [MEDIUM] Potential historical version fork: '金沙星衍生生态·生态循环与种间互作.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '金沙星衍生生态·生态循环与种间互作.md' exist across directories: 04_星球档案/V-005 金沙星/金沙星衍生生态·生态循环与种间互作.md, 04_星球档案/V-005 金沙星/03_生态/金沙星衍生生态·生态循环与种间互作.md.
- **Affected Files**:
  - `04_星球档案/V-005 金沙星/金沙星衍生生态·生态循环与种间互作.md`
  - `04_星球档案/V-005 金沙星/03_生态/金沙星衍生生态·生态循环与种间互作.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 127. [MEDIUM] Potential historical version fork: '镜潮星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '镜潮星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-011 镜潮星/03_生态/镜潮星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/03_生态/镜潮星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-011 镜潮星/03_生态/镜潮星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/03_生态/镜潮星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 128. [MEDIUM] Potential historical version fork: '镜潮星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '镜潮星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-011 镜潮星/03_生态/镜潮星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/03_生态/镜潮星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-011 镜潮星/03_生态/镜潮星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/03_生态/镜潮星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 129. [MEDIUM] Potential historical version fork: '霜恸星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '霜恸星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-021 霜恸星/03_生态/霜恸星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/03_生态/霜恸星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-021 霜恸星/03_生态/霜恸星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/03_生态/霜恸星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 130. [MEDIUM] Potential historical version fork: '霜恸星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '霜恸星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-021 霜恸星/03_生态/霜恸星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/03_生态/霜恸星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-021 霜恸星/03_生态/霜恸星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/03_生态/霜恸星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 131. [MEDIUM] Potential historical version fork: '霜环星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '霜环星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-016 霜环星/03_生态/霜环星衍生生态·异化灾害与区域奇观.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/03_生态/霜环星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-016 霜环星/03_生态/霜环星衍生生态·异化灾害与区域奇观.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/03_生态/霜环星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 132. [MEDIUM] Potential historical version fork: '霜环星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '霜环星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-016 霜环星/03_生态/霜环星衍生生态·特殊物质.md, 09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/03_生态/霜环星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-016 霜环星/03_生态/霜环星衍生生态·特殊物质.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/03_生态/霜环星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 133. [MEDIUM] Potential historical version fork: '风暴星衍生生态·异化灾害与区域奇观.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '风暴星衍生生态·异化灾害与区域奇观.md' exist across directories: 04_星球档案/V-003 风暴星/风暴星衍生生态·异化灾害与区域奇观.md, 04_星球档案/V-003 风暴星/03_生态/风暴星衍生生态·异化灾害与区域奇观.md.
- **Affected Files**:
  - `04_星球档案/V-003 风暴星/风暴星衍生生态·异化灾害与区域奇观.md`
  - `04_星球档案/V-003 风暴星/03_生态/风暴星衍生生态·异化灾害与区域奇观.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 134. [MEDIUM] Potential historical version fork: '风暴星衍生生态·特殊物质.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '风暴星衍生生态·特殊物质.md' exist across directories: 04_星球档案/V-003 风暴星/风暴星衍生生态·特殊物质.md, 04_星球档案/V-003 风暴星/03_生态/风暴星衍生生态·特殊物质.md.
- **Affected Files**:
  - `04_星球档案/V-003 风暴星/风暴星衍生生态·特殊物质.md`
  - `04_星球档案/V-003 风暴星/03_生态/风暴星衍生生态·特殊物质.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 135. [MEDIUM] Potential historical version fork: '风暴星衍生生态·生态循环与种间互作.md'

- **Rule**: `ANOM_003_HISTORICAL_VERSION_DUPLICATION` (STRUCTURAL_DUPLICATION)
- **Description**: Multiple version forks of '风暴星衍生生态·生态循环与种间互作.md' exist across directories: 04_星球档案/V-003 风暴星/风暴星衍生生态·生态循环与种间互作.md, 04_星球档案/V-003 风暴星/03_生态/风暴星衍生生态·生态循环与种间互作.md.
- **Affected Files**:
  - `04_星球档案/V-003 风暴星/风暴星衍生生态·生态循环与种间互作.md`
  - `04_星球档案/V-003 风暴星/03_生态/风暴星衍生生态·生态循环与种间互作.md`
- **Recommended Action**: Consolidate version forks and archive older revisions.

### 136. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-107 鳞木星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-107 鳞木星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-107 鳞木星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 137. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-108 息土星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-108 息土星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-108 息土星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 138. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-109 锈骨星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-109 锈骨星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-109 锈骨星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 139. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-110 毒岚星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-110 毒岚星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-110 毒岚星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 140. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-111 晶髓星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-111 晶髓星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-111 晶髓星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 141. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-112 幽泉星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-112 幽泉星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-112 幽泉星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 142. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-113 狱火星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-113 狱火星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-113 狱火星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 143. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-114 蛊厄星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-114 蛊厄星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-114 蛊厄星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 144. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-115 铸心星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-115 铸心星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-115 铸心星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 145. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-116 幻蜃星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-116 幻蜃星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-116 幻蜃星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 146. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-117 渊噬星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-117 渊噬星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-117 渊噬星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 147. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-118 凛灾星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-118 凛灾星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-118 凛灾星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 148. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-119 震爆星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-119 震爆星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-119 震爆星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 149. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-120 蚀骨星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-120 蚀骨星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-120 蚀骨星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 150. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-121 烬灰星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-121 烬灰星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-121 烬灰星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 151. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-122 锈死星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-122 锈死星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-122 锈死星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 152. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-123 衰变星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-123 衰变星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-123 衰变星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 153. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-124 重压星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-124 重压星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-124 重压星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 154. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-125 极酸星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-125 极酸星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-125 极酸星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 155. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-126 孢子星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-126 孢子星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-126 孢子星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 156. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-127 幻魇星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-127 幻魇星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-127 幻魇星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 157. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-128 雷暴星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-128 雷暴星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-128 雷暴星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 158. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-129 冰晶星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-129 冰晶星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-129 冰晶星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 159. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-130 胶沼星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-130 胶沼星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-130 胶沼星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 160. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-131 震荡星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-131 震荡星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-131 震荡星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 161. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-132 镜面星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-132 镜面星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-132 镜面星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 162. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-133 骨灰星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-133 骨灰星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-133 骨灰星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 163. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-134 沸石星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-134 沸石星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-134 沸石星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 164. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-135 毒晶星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-135 毒晶星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-135 毒晶星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 165. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-136 黑洞星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-136 黑洞星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-136 黑洞星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 166. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-139 辐射星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-139 辐射星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-139 辐射星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 167. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-140 漩涡星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-140 漩涡星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-140 漩涡星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 168. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-141 腐蚀星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-141 腐蚀星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-141 腐蚀星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 169. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-142 磁陷星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-142 磁陷星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-142 磁陷星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 170. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-143 焦土星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-143 焦土星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-143 焦土星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 171. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-151 星尘星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-151 星尘星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-151 星尘星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 172. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-153 脉冲星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-153 脉冲星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-153 脉冲星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 173. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-154 白矮星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-154 白矮星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-154 白矮星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 174. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-155 夸克星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-155 夸克星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-155 夸克星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 175. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-159 音波星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-159 音波星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-159 音波星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 176. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-160 引力星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-160 引力星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-160 引力星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 177. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-161 幻象星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-161 幻象星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-161 幻象星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 178. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-162 梦境星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-162 梦境星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-162 梦境星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 179. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-163 植物星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-163 植物星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-163 植物星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 180. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-164 终极星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-164 终极星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-164 终极星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 181. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-165 赤昼星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-165 赤昼星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-165 赤昼星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 182. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-166 盐骨星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-166 盐骨星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-166 盐骨星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 183. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-167 风蚀星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-167 风蚀星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-167 风蚀星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 184. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-168 井国星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-168 井国星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-168 井国星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 185. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-169 冠海星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-169 冠海星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-169 冠海星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 186. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-170 迁林星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-170 迁林星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-170 迁林星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 187. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-171 红叶星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-171 红叶星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-171 红叶星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 188. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-172 镜叶星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-172 镜叶星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-172 镜叶星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 189. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-174 沉云星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-174 沉云星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-174 沉云星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 190. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-175 青核星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-175 青核星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-175 青核星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 191. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-176 白潮星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-176 白潮星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-176 白潮星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 192. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-177 寂冻星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-177 寂冻星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-177 寂冻星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 193. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-178 蓝棺星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-178 蓝棺星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-178 蓝棺星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 194. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-179 浮礁星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-179 浮礁星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-179 浮礁星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 195. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-180 雨幕星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-180 雨幕星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-180 雨幕星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 196. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-181 潮锁星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-181 潮锁星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-181 潮锁星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 197. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-182 泡界星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-182 泡界星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-182 泡界星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 198. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-183 万峰星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-183 万峰星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-183 万峰星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 199. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-184 空谷星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-184 空谷星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-184 空谷星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 200. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-185 铁脊星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-185 铁脊星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-185 铁脊星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 201. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-186 震庭星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-186 震庭星_图谱.md' is an empty or minimal placeholder (30B, 6 words). Reason: FILE_SIZE_LE_30B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-186 震庭星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 202. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-144 结晶海星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-144 结晶海星_图谱.md' is an empty or minimal placeholder (33B, 7 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-144 结晶海星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 203. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-146 沸腾海星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-146 沸腾海星_图谱.md' is an empty or minimal placeholder (33B, 7 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-146 沸腾海星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 204. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-156 反物质星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-156 反物质星_图谱.md' is an empty or minimal placeholder (33B, 7 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-156 反物质星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 205. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-157 奇异质星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-157 奇异质星_图谱.md' is an empty or minimal placeholder (33B, 7 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-157 奇异质星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 206. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-173 琥珀云星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-173 琥珀云星_图谱.md' is an empty or minimal placeholder (33B, 7 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-173 琥珀云星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 207. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-137 虚空回声星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-137 虚空回声星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-137 虚空回声星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 208. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-145 虚空暗面星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-145 虚空暗面星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-145 虚空暗面星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 209. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-147 超导冰原星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-147 超导冰原星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-147 超导冰原星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 210. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-148 裂变废墟星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-148 裂变废墟星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-148 裂变废墟星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 211. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-149 液氮极寒星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-149 液氮极寒星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-149 液氮极寒星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 212. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-150 黑洞边缘星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-150 黑洞边缘星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-150 黑洞边缘星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 213. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-152 气体巨行星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-152 气体巨行星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-152 气体巨行星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 214. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-158 碎裂时空星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-158 碎裂时空星_图谱.md' is an empty or minimal placeholder (36B, 8 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-158 碎裂时空星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 215. [LOW] Stub placeholder file detected: '08_知识图谱节点/01_星球节点/V-138 碎星带陨石星_图谱.md'

- **Rule**: `ANOM_004_PLACEHOLDER_STUB_FILE` (VAULT_HYGIENE)
- **Description**: File '08_知识图谱节点/01_星球节点/V-138 碎星带陨石星_图谱.md' is an empty or minimal placeholder (39B, 9 words). Reason: FILE_SIZE_LE_50B.
- **Affected Files**:
  - `08_知识图谱节点/01_星球节点/V-138 碎星带陨石星_图谱.md`
- **Recommended Action**: Fill in entity/chapter content or mark as placeholder to exclude from deep RAG generation.

### 216. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 217. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 218. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 219. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 220. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 221. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 222. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 223. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 224. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 225. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 226. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 227. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 228. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 229. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 230. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 231. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 232. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 233. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 234. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 235. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 236. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 237. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 238. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 239. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 240. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 241. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 242. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 243. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 244. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 245. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 246. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 247. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 248. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 249. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 250. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 251. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 252. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 253. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 254. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 255. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 256. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 257. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 258. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 259. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 260. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 261. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 262. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 263. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 264. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 265. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 266. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 267. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 268. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 269. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 270. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 271. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 272. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 273. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 274. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 275. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 276. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 277. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 278. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 279. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 280. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 281. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 282. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 283. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 284. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 285. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 286. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 287. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 288. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 289. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 290. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 291. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 292. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 293. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 294. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 295. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 296. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 297. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 298. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 299. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 300. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 301. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 302. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 303. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 304. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 305. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 306. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 307. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 308. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 309. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 310. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 311. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 312. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 313. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 314. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 315. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 316. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 317. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 318. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 319. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 320. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 321. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 322. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 323. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 324. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 325. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 326. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 327. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 328. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 329. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 330. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 331. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 332. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 333. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 334. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 335. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 336. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 337. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 338. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 339. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 340. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 341. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 342. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 343. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 344. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 345. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 346. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 347. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 348. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 349. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 350. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 351. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 352. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 353. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 354. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 355. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 356. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 357. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 358. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 359. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 360. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 361. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 362. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 363. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 364. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 365. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 366. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 367. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 368. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 369. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 370. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 371. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 372. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 373. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 374. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 375. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 376. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 377. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 378. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 379. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 380. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 381. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 382. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 383. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 384. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 385. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 386. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 387. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 388. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 389. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 390. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 391. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 392. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 393. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 394. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 395. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 396. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 397. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 398. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 399. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 400. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 401. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 402. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 403. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 404. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 405. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 406. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 407. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 408. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 409. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 410. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 411. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 412. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 413. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 414. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 415. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 416. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 417. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 418. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 419. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 420. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 421. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 422. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 423. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 424. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 425. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 426. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 427. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 428. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 429. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 430. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 431. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 432. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 433. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 434. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 435. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 436. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 437. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 438. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 439. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 440. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 441. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 442. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 443. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 444. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 445. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 446. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 447. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 448. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 449. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 450. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 451. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 452. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 453. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 454. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 455. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 456. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 457. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 458. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 459. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 460. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 461. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 462. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 463. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 464. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 465. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 466. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 467. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 468. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 469. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 470. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 471. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 472. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 473. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 474. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 475. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 476. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 477. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 478. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 479. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 480. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 481. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 482. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 483. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 484. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 485. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 486. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 487. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 488. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 489. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 490. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 491. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 492. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 493. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 494. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 495. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 496. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 497. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 498. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 499. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 500. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 501. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 502. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 503. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 504. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 505. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 506. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 507. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 508. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 509. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 510. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 511. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 512. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 513. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 514. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 515. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 516. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 517. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 518. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 519. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 520. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 521. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 522. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 523. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 524. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 525. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 526. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 527. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 528. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 529. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 530. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 531. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 532. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 533. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 534. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 535. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 536. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 537. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 538. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 539. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 540. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 541. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 542. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 543. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 544. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 545. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 546. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 547. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 548. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 549. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 550. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 551. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 552. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 553. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 554. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 555. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 556. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 557. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 558. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 559. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 560. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 561. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 562. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 563. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 564. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 565. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 566. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 567. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 568. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 569. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 570. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 571. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 572. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 573. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 574. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 575. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 576. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 577. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 578. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 579. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 580. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 581. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 582. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 583. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 584. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 585. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 586. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 587. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 588. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 589. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 590. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 591. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 592. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 593. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 594. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 595. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 596. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 597. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 598. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 599. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 600. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 601. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 602. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 603. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 604. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 605. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 606. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 607. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 608. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 609. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 610. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 611. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 612. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 613. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 614. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 615. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 616. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 617. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 618. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 619. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 620. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 621. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 622. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 623. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 624. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 625. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 626. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 627. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 628. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 629. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 630. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 631. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 632. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 633. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 634. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 635. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 636. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 637. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 638. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 639. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 640. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 641. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 642. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 643. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 644. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 645. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 646. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 647. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 648. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 649. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 650. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 651. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 652. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 653. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 654. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 655. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 656. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 657. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 658. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 659. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 660. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 661. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 662. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 663. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 664. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 665. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 666. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 667. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 668. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 669. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 670. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 671. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 672. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 673. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 674. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 675. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 676. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 677. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 678. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 679. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 680. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

### 681. [HIGH] Duplicate planet name with divergent IDs: '孢子星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '孢子星' is assigned multiple distinct IDs (V-061, V-126) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-061 孢子星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-126 孢子星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-061, V-126) into canonical entity and deprecate secondary draft notes.

### 682. [HIGH] Duplicate planet name with divergent IDs: '星球势力总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球势力总览' is assigned multiple distinct IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) across 4 files.
- **Affected Files**:
  - `09_归档与历史版本/冗余V系列历史版本/V-021 霜环星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-069 熔核星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-070 基因星/07_势力体系/00_星球势力总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-071 梦泽星/07_势力体系/00_星球势力总览.md`
- **Recommended Action**: Merge conflicting IDs (07_势力体系_89ecf262_00_星球势力总览, 07_势力体系_534bb33c_00_星球势力总览, 07_势力体系_8b82db0c_00_星球势力总览, 07_势力体系_a7217dc6_00_星球势力总览) into canonical entity and deprecate secondary draft notes.

### 683. [HIGH] Duplicate planet name with divergent IDs: '星球总览'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '星球总览' is assigned multiple distinct IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) across 16 files.
- **Affected Files**:
  - `00_模板库/势力体系/00_星球总览.md`
  - `07_势力体系/V-079 生命星/00_星球总览.md`
  - `07_势力体系/V-080 混沌星/00_星球总览.md`
  - `07_势力体系/V-081 灵能星/00_星球总览.md`
  - `07_势力体系/V-082 时间星/00_星球总览.md`
  - `07_势力体系/V-083 虚空星/00_星球总览.md`
  - `07_势力体系/V-084 维度星/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-016 霜恸星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-025 极电星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-040 磁暴星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-051 镜潮星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-064 灰核星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-089 磁星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-092 生命星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/冗余V系列历史版本/V-096 机械星/07_势力体系/00_星球总览.md`
  - `09_归档与历史版本/原初字母前缀历史版本/G-02 磁暴星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (势力体系_91b768ef_00_星球总览, V-079_生命星_07ed03dc_00_星球总览, V-080_混沌星_2faca795_00_星球总览, V-081_灵能星_d4fd1823_00_星球总览, V-082_时间星_8d5849a6_00_星球总览, V-083_虚空星_3e7c0add_00_星球总览, V-084_维度星_fed54f6d_00_星球总览, 07_势力体系_567a2207_00_星球总览, 07_势力体系_4c37cfa4_00_星球总览, 07_势力体系_062ebb95_00_星球总览, 07_势力体系_6161a00e_00_星球总览, 07_势力体系_284ac03a_00_星球总览, 07_势力体系_5d462f43_00_星球总览, 07_势力体系_4bcca05f_00_星球总览, 07_势力体系_dfffdf4d_00_星球总览, 07_势力体系_cd864bff_00_星球总览) into canonical entity and deprecate secondary draft notes.

### 684. [HIGH] Duplicate planet name with divergent IDs: '暗物质星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '暗物质星' is assigned multiple distinct IDs (V-060, V-105) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-060 暗物质星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-105 暗物质星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-060, V-105) into canonical entity and deprecate secondary draft notes.

### 685. [HIGH] Duplicate planet name with divergent IDs: '梦境星'

- **Rule**: `ANOM_001_SAME_NAME_DIFF_ID` (ENTITY_CONFLICT)
- **Description**: Planet '梦境星' is assigned multiple distinct IDs (V-097, V-162) across 2 files.
- **Affected Files**:
  - `04_星球档案/V-097 梦境星/07_势力体系/00_星球总览.md`
  - `04_星球档案/V-162 梦境星/07_势力体系/00_星球总览.md`
- **Recommended Action**: Merge conflicting IDs (V-097, V-162) into canonical entity and deprecate secondary draft notes.

