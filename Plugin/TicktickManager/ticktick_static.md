# TicktickManager 静态任务快照

更新时间：2026/5/31 09:24:30 Asia/Shanghai

## 需要更新 TICKTICK_ACCESS_TOKEN

当前 TicktickManager 无法访问滴答清单 OpenAPI。请主动提醒账号持有者：需要重新获取 TICKTICK_ACCESS_TOKEN，填入插件 config.env，然后重启 VCPToolBox。

### 原因

- 错误类型：AUTH_ERROR
- 错误信息：缺少 TICKTICK_ACCESS_TOKEN，TicktickManager 静态刷新已跳过。
- 滴答清单当前政策不再提供刷新令牌，TICKTICK_ACCESS_TOKEN 有效期约半年。
- 本插件不会在 VCPToolBox 运行环境中自动获取、刷新或写回 token。

### 账号持有者需要执行

1. 在插件根目录使用独立获取脚本，或按滴答清单官方方式获取新的 TICKTICK_ACCESS_TOKEN。
2. 打开 TicktickManager 的 config.env，更新 TICKTICK_ACCESS_TOKEN。
3. 不要再填写或依赖刷新令牌。
4. 重启 VCPToolBox，让插件重新加载配置并由 VCP 静态注入机制刷新内容。

在账号持有者完成以上步骤前，请不要继续调用 TicktickManager 的任务创建、更新、删除或读取功能。
