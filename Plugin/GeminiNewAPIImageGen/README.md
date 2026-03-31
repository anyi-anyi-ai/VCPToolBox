# GeminiNewAPIImageGen

通过 NewAPI 中转站调用 Gemini 图像模型进行图片生成与编辑。

## 配置
复制 `config.env.example` 为 `config.env`，填写：

- NewAPIImageKey
- NewAPIBaseURL
- NewAPIModel

默认：
- BaseURL: https://site.atopes.de/v1
- Model: 假流式-gemini-3-pro-image-preview

## 命令
- generate
- edit
- check