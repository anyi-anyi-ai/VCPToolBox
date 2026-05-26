# PlumBlossomDivination 文件夹小白说明

这个文件夹是 VCP 的“梅花易数占卜”插件。

## 它是什么

梅花易数是一种传统起卦方法。这个插件把数字、时间或随机数转换成卦象，并生成可视化结果，供 AI 继续解读。

## 主要能力

- 数字起卦：输入两个数字，计算上卦、下卦和动爻。
- 时间起卦：根据当前时间自动起卦。
- 随机起卦：系统随机生成天机数。
- 显示本卦、变卦、动爻、体用关系。
- 用不同颜色表示五行。
- 输出 HTML，可在前端直接渲染成漂亮卦象。

## 重要文件

- `PlumBlossomDivination/plum_blossom_divination.js`：插件主程序。
- `PlumBlossomDivination/plugin-manifest.json`：VCP 插件清单。
- `PlumBlossomDivination/dataset/64hexagrams.json`：六十四卦数据。
- `package.json`：Node.js 项目信息。

## 小白怎么理解

你可以问“今天运势如何”或“这件事能不能成”，AI 调用这个插件起卦，插件给出卦象，AI 再结合卦辞和问题进行解释。

## 注意

它更适合娱乐、文化体验和灵感辅助，不应该当成严肃决策依据。

## 一句话总结

这是一个把梅花易数起卦流程做成 VCP 工具的国风占卜插件。
