# 🌉 ChromeBridge (VCPToolBox 浏览器桥接中心)

ChromeBridge 是 VCPToolBox 的核心混合插件，旨在打通 AI Agent 与真实物理浏览器之间的壁垒。它赋予了 Agent 像真实人类一样操控浏览器、自动化收集数据、并实现"被动唤醒"与"主动巡逻"的能力。

## ✨ 核心特性

- **双引擎驱动**:
  - **Puppeteer 自动化引擎**: 允许 Agent 在后台直接启动并操控一个真实的 Chrome/Edge 浏览器，支持独立的 Profile 保存登录状态，告别繁琐的扫码登录。
  - **VCPBridge 扩展桥接**: 通过安装在用户常用浏览器上的扩展，实现数据的"一键投喂"和页面状态的实时同步。
- **极致的拟人化 (Anti-Detection)**: 内置 `puppeteer-extra-plugin-stealth`，以及定制的 `humanBehavior.js`。支持贝塞尔曲线轨迹的鼠标移动、带"思考停顿"的随机延迟打字、以及平滑自然的阅读滚动，最大程度规避反爬检测。
- **被动唤醒机制 (Feed Auto-Wake)**: 当用户在手机或电脑浏览器上收藏视频或主动推送数据时，ChromeBridge 会捕获这些数据流，并自动唤醒指定的 Agent（如"旺财"）进行处理。
- **主动巡逻调度器 (Patrol Scheduler)**: 支持设定定时时间窗口，让 Agent 每隔一段时间自动打开浏览器，巡逻指定页面（如抖音收藏夹），比对增量数据，实现全自动的行业信息搜罗。

---

## ⚙️ 快速配置

进入 `Plugin/ChromeBridge` 目录，复制 `config.env.example` 为 `config.env` 并进行配置：

### 1. 基础浏览器设置
```ini
# 指定浏览器可执行文件路径 (留空则自动寻找)
ChromePath=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

# 指定独立的用户数据目录 (强烈推荐，可持久化登录状态)
ChromeProfilePath=Plugin/ChromeBridge/vcp_profile
ChromeProfileName=Default
```

### 2. 被动唤醒配置 (Feed Auto-Wake)
开启此项后，来自浏览器的推送（如收藏动作）将自动唤醒 Agent。
```ini
FeedAutoWakeAgent=true
FeedTargetAgent=旺财
FeedAutoWakeTriggers=auto_favorite,manual_feed
FeedUseDelegation=true
```

### 3. 主动巡逻配置 (Patrol Scheduler)
设定时间窗口，让 Agent 每天定时打卡"上班"搜罗情报。
```ini
PatrolEnabled=true
PatrolIntervalMinutes=60
PatrolTimeWindow=9-23
PatrolAgent=旺财
PatrolStartupDelay=120
```

---

## 🛠️ Agent 工具箱 (共 21 个命令)

ChromeBridge 为 Agent 提供了丰富的操控命令：

### 生命周期管理
- `launch_browser`: 启动浏览器，加载指定的 Profile 并注入防检测脚本。
- `close_browser`: 释放资源，关闭浏览器。
- `browser_status`: 检查浏览器当前状态及打开的标签页。

### 页面导航
- `open_page`: 打开新标签页并导航至指定 URL。
- `navigate`: 在当前标签页跳转。
- `list_pages`: 获取所有活动的标签页信息。

### 拟人化操作 (Human Behavior)
- `human_click`: 模拟人类点击，鼠标按贝塞尔曲线移动并产生随机偏移。
- `human_type`: 模拟人类打字，带有随机字符间隔和概率性的"思考停顿"。
- `human_scroll`: 模拟阅读滚动，分段平滑下滚/上滚。
- `human_browse`: 随机移动鼠标+轻微滚动，制造真实的"活跃"假象。

### 数据提取与分析
- `get_page_content`: 获取当前页面的文本摘要。
- `screenshot`: 截取页面屏幕，支持全页长截图，用于视觉分析。
- `execute_script`: 注入并执行任意 JavaScript。
- `extract_data`: (需扩展支持) 对特定平台(如抖音)进行深度结构化数据提取(视频、评论、作者信息)。
- `get_feed`: 读取由扩展推送到服务端的投喂队列。

### 巡逻与状态管理
- `favorites_check`: 比对当前提取到的视频 ID，筛出之前未处理过的新增项。
- `favorites_mark_seen`: 将已处理的视频 ID 写入持久化状态文件 (`patrol_state.json`)。

---

## 🔄 典型工作流示例 (以旺财巡逻抖音为例)

1. **定时器触发**: ChromeBridge 在设定的时间窗口内，每 60 分钟向"旺财"发送一条包含 `task_delegation` 的巡逻指令。
2. **旺财接单**: 旺财收到指令后，调用 `launch_browser` 启动已经登录好抖音账号的 Edge 浏览器。
3. **导航与浏览**: 调用 `open_page` 进入抖音收藏页面，随后调用多次 `human_scroll` 模拟下滑加载更多。
4. **提取与过滤**: 旺财通过 `execute_script` 获取当前页面所有视频的 ID，然后调用 `favorites_check` 找出"新收藏"的视频。
5. **深度挖掘**: 针对新视频，旺财模拟 `human_click` 点进去，调用 `extract_data` 提取高赞评论，进行痛点分析。
6. **归档与收工**: 旺财将分析出的"张小洋档案"交接给下游 Agent (如蔓蔓)，调用 `favorites_mark_seen` 标记视频已阅，最后 `close_browser` 下班。
