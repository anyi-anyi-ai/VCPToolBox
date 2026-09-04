# PlumBlossomDivination - 梅花易数占卜

## 1. 插件概述

`PlumBlossomDivination` 是基于中国传统易学“先天八卦数”算法与现代前端视觉渲染技术构建的梅花易数起卦占卜插件。它支持数字起卦、农历/公历时间起卦以及天机随机起卦三种模式，精确推演本卦、互卦、变卦及动爻（初爻至上爻），并通过五行生克关系（金、木、水、火、土）分析体卦与用卦的吉凶走向，最终生成国风分爻视觉卡片（支持富文本 HTML 直接呈递给用户）。

### 核心特性
- **经典先天八卦数理**：严格遵循先天八卦数序（乾一、兑二、离三、震四、巽五、坎六、艮七、坤八），以上数除八求上卦，下数除八求下卦，合数除六求动爻。
- **三种起卦维度**：
  1. `divine_by_numbers`：依据用户直觉指定的两组正整数起卦。
  2. `divine_by_time`：结合当前系统时间（年月日时辰支数）起卦。
  3. `divine_random`：系统随机生成天机数快速起卦。
- **国风分爻渲染与动爻特效**：
  - 阴阳爻分明（阳爻连续、阴爻断开）。
  - 五行色彩标示（金=#d4af37, 木=#4caf50, 水=#2196f3, 火=#f44336, 土=#8d6e63）。
  - 动爻发光呼吸特效（glow class），本卦与变卦动爻阴阳自动翻转对比。
- **体用生克分析**：自动标注体卦（静）与用卦（动），判定用生体、用克体、体克用、体生用或比和关系。

---

## 2. 命令列表与参数说明

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `divine_by_numbers` | 根据用户指定的两个数字推演起卦 | `number1` (number, 必填): 用于计算上卦的数字<br>`number2` (number, 必填): 用于计算下卦的数字<br>`question` (string, 可选): 所测之事或疑惑 |
| `divine_by_time` | 根据当前时间与地支自动起卦 | `question` (string, 可选): 所测之事 |
| `divine_random` | 由系统随机摇取天机数起卦 | `question` (string, 可选): 所测之事 |

---

## 3. VCP 标准界定符调用示例

### 3.1 数字起卦 (`divine_by_numbers`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlumBlossomDivination「末」,
command:「始」divine_by_numbers「末」,
number1:「始」7「末」,
number2:「始」9「末」,
question:「始」问今日项目推进运势「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 当前时间起卦 (`divine_by_time`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlumBlossomDivination「末」,
command:「始」divine_by_time「末」,
question:「始」问某项投资是否可行「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.3 随机天机起卦 (`divine_random`)
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」PlumBlossomDivination「末」,
command:「始」divine_random「末」,
question:「始」出门旅行吉凶「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. AI 解读与渲染建议

- **HTML 渲染**：插件返回的 `content` 包含完整的 HTML 样式与 CSS 规则，支持在 VCP 客户端中直接呈现精美的卦象卡片。
- **解卦指引**：
  1. **本卦卦辞**：反映事情当前的现状与本质。
  2. **动爻爻辞**：核心关键转折点（阳爻称“九”，阴爻称“六”）。
  3. **体用生克**：用生体（大吉）、比和（吉）、体克用（小吉需耗力）、体生用（泄气耗损）、用克体（受阻或凶）。
  4. **变卦趋势**：事物发展的最终走向与结局。
