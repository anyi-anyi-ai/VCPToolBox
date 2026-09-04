# Project: VCPToolBox Manifest Normalization & Docs Generation

## Architecture
- **VCP Plugin Ecosystem (`Plugin/*/plugin-manifest.json`)**:
  - Declarative manifests defining plugin metadata, entry points, and `capabilities.invocationCommands`.
  - Commands must declare dual fields `command` and `commandIdentifier` with identical string values for complete forward and backward compatibility.
- **VCP Engine Core (`Plugin.js`)**:
  - Dynamically discovers active plugins in `Plugin/` and builds prompt placeholders (`buildVCPDescription`).
  - Formats commands into `- <DisplayName> (<name>) - 命令: <cmdName>:\n    <description>`.
- **VCP Delimiter Protocol (`modules/vcpLoop/toolCallParser.js`)**:
  - Standard delimiter format for CP Agent tool requests:
    ```text
    <<<[TOOL_REQUEST]>>>
    tool_name:「始」<PluginName>「末」,
    command:「始」<CommandName>「末」,
    <param>:「始」<value>「末」
    <<<[END_TOOL_REQUEST]>>>
    ```
- **Active Plugin Documentation (`Plugin/<target>/README.md`)**:
  - 16 active plugins missing standard documentation will have structured `README.md` files detailing capability, command parameters (required/optional), and standard delimiter invocation templates (or architectural placeholder syntax for preprocessor plugins).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Plugin.js Syntax Repair | Fix orphaned `}` at line 1079 and guard `cmd.description` in `Plugin.js` | M1 | Survey Explorer 3 |
| F2 | ChKSzMusicFetch entryPoint Repair | Add missing `entryPoint` to `ChKSzMusicFetch/plugin-manifest.json` | M1 | Survey Explorer 3 |
| F3 | All 104 Manifests Dual-Field Normalization | Mirror `command` and `commandIdentifier` across all commands in all 104 manifests; resolve conflicts in DigitalOracle and GeminiNewAPIImageGen; ensure 100% JSON.parse | M1 | Survey Explorer 1 |
| F4 | 16 Target Plugins Standard README Generation | Generate structured `README.md` (length ≥ 300 chars, parameter tables, VCP standard delimiter examples) for all 16 target active plugins | M2 | Survey Explorer 2 |
| F5 | R3 Placeholder & Engine Verification Script | Author and run `scripts/verify_r3_placeholders.js` validating syntax, dual fields, JSON parsing, and 0 matches of `命令: N/A` | M3 | Survey Explorer 3 |
| F6 | Full Verification Gate | Comprehensive multi-agent review, challenge, and forensic audit for zero defects | M4 | Project Orchestrator |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Engine Syntax Fix & 104 Manifests Normalization (R1) | Fix `Plugin.js:1079`, normalize all 104 manifests for dual fields, fix `ChKSzMusicFetch` entryPoint | none | DONE |
| M2 | 16 Active Plugins Standard Documentation (R2) | Generate standard `README.md` for the 16 target active plugins based on `explorer_survey_2` blueprint | M1 | DONE |
| M3 | Engine Verification & Placeholders Zero-Defect (R3) | Implement `scripts/verify_r3_placeholders.js`, run validation, verify 0 occurrences of `命令: N/A` | M1, M2 | DONE |
| M4 | Final Quality Gate & Audit | Comprehensive review, challenger stress-testing, forensic integrity audit | M1, M2, M3 | IN_PROGRESS |

## Interface Contracts
### Command Item Schema (`capabilities.invocationCommands[]`)
```json
{
  "command": "<CommandName>",
  "commandIdentifier": "<CommandName>",
  "description": "<Usage description>",
  "parameters": { ... },
  "example": "..."
}
```
Rule: `command === commandIdentifier`. Neither may be undefined or null.

### VCP Tool Request Protocol
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」<PluginName>「末」,
command:「始」<CommandName>「末」,
<param_name>:「始」<param_value>「末」
<<<[END_TOOL_REQUEST]>>>
```

## Code Layout
- `Plugin.js`: Engine plugin manager & placeholder builder.
- `Plugin/*/plugin-manifest.json`: 104 active plugin manifests.
- `Plugin/<16_target_plugins>/README.md`: Standard documentation files for the 16 target active plugins.
- `scripts/verify_r3_placeholders.js`: Verification script testing syntax, manifests, and placeholder generation.
