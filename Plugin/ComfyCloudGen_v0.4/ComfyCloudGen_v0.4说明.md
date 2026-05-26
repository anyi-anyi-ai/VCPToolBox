# ComfyCloudGen_v0.4 文件夹小白说明

这个文件夹是一个 VCP 插件，用来连接 Comfy Cloud，在云端生成图片或视频。

## 它是什么

Comfy Cloud 是云端 ComfyUI 服务，可以使用远程 GPU 跑图像/视频生成工作流。这个插件把它接进 VCP，让 AI 可以通过工具调用直接生图。

## 主要能力

- 根据提示词生成图片。
- 支持多种模型生态，如 Z-Image、Flux、SDXL、Wan Video 等。
- 自动匹配模型参数，不懂工作流也能用。
- 支持模板工作流，也支持直接提交完整工作流 JSON。
- 支持 LoRA 动态注入。
- 支持工作流缓存，减少重复构建。

## 重要文件

- `ComfyCloudGen.js`：插件主入口，负责解析输入和调度。
- `EcosystemResolver.js`：识别模型属于哪个生态，并合并参数。
- `PipelineFactory.js`：构建图像/视频生成工作流。
- `ComfyCloudAuth.js`：处理登录凭证和 JWT 刷新。
- `ComfyCloudNetwork.js`：提交任务、轮询结果、下载图片。
- `CacheManager.js`：管理工作流缓存。
- `plugin-manifest.json`：告诉 VCP 这个插件怎么被调用。
- `data`：模型、节点、参数校验等大表。
- `workflows`：模板工作流。

## 小白怎么用

最简单的理解：你给 AI 一句画面描述，AI 调这个插件，插件去云端跑图，然后把结果返回。

## 注意

国内使用通常需要配置代理；使用前要完成 Comfy Cloud 登录认证。

## 一句话总结

这是 VCP 的云端生图/生视频插件，让没有本地显卡的用户也能调用云端 GPU 生成内容。
