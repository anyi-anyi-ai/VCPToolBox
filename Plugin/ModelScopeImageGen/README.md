# ModelScopeImageGen

使用魔搭（ModelScope）`API-Inference` 的 AIGC 接口进行**文生图**（异步任务 + 轮询）。

## 安装
1. 目录放置：`Plugin/ModelScopeImageGen/`
2. 复制配置：将 `config.env.example` 复制为 `config.env` 并填写 Token：
   - Token 获取：<https://modelscope.cn/my/myaccesstoken>
   - 注意：需要绑定阿里云账号并完成实名认证后才能使用 API-Inference。

## 配置项
见 [`config.env.example`](./config.env.example)。

## 调用参数
插件支持（均为可选/必选）参数见 [`plugin-manifest.json`](./plugin-manifest.json)：
- `prompt` (必填)
- `negative_prompt`
- `model`
- `size`
- `steps`
- `seed`
- `guidance`
- `timeout_sec`
- `poll_interval_sec`

## 输出
返回 Markdown：包含生成图片的本地相对路径与本次任务元信息（task_id/model/size/steps/seed/guidance）。

## 调试
- 常见错误：
  - 401：Token 不正确/未配置/账号未实名认证
  - 429：触发限流（降低频率/实现重试或考虑 API-Provider）
- 推荐先用最小参数探测：只传 `model` + `prompt`。
