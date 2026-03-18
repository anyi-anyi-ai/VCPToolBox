# QQGroupReader - QQ群聊消息读取器

> VCPToolBox 插件 | 支持 macOS / Windows
> 版本：1.0.0 | 更新：2026-02-17

---

## 一、这个插件能做什么？

**QQGroupReader** 是一个 VCPToolBox 插件，能让 AI Agent **直接读取你本地 QQ 的群聊消息**，无需任何第三方服务。

### 核心功能

| 命令 | 功能 |
|------|------|
| `ListGroups` | 列出你 QQ 里所有群，按消息数排序 |
| `ReadGroupMessages` | 读取指定群的消息（支持按时间范围和数量限制） |
| `ReadWatchedMessages` | 只读取匹配关注条件的消息（关注人 + 关注话题） |
| `GetNewMessages` | 增量读取新消息（自动记录上次位置，适合轮询） |

### 关注过滤

你可以配置：
- **关注群号**：只关注特定群的消息
- **关注 QQ 号**：特定人的消息会被标记为 `[★关注人]`
- **关注关键词**：包含关键词的消息会被标记为 `[★话题:xxx]`

### 使用场景

- 让 AI 帮你总结群里今天聊了什么
- 监控群里的资源分享（免费 API、token 等）
- 配合 MacScreenAgent 实现智能客服（AI 读消息 → 分析 → 自动回复）
- 定期生成群聊摘要报告

---

## 二、工作原理

```
QQ 客户端 → 本地加密数据库 (nt_msg.db)
                    ↓
          复制数据库 → 去掉 1024 字节头部
                    ↓
          sqlcipher 解密（需要密钥）
                    ↓
          SQL 查询群消息 → Protobuf 二进制解析
                    ↓
          文本提取 + 噪音清理 + 关注标记
                    ↓
          结构化 JSON 输出给 AI Agent
```

### 技术细节

1. **数据库加密**：NTQQ 使用 SQLCipher 加密本地数据库，参数为 `kdf_iter=4000, cipher_page_size=4096, HMAC_SHA1, PBKDF2_HMAC_SHA512`
2. **头部处理**：NTQQ 在标准 SQLCipher 数据库前添加了 1024 字节的自定义头部，需要去掉才能解密
3. **消息格式**：消息内容存储为 Protobuf 二进制格式（字段 `40800`），插件通过启发式解析提取可读文本
4. **噪音清理**：过滤掉 UID、文件名、URL、protobuf 内部字段名、二进制残留等噪音
5. **昵称解析**：从 `profile_info.db` 和 `nt_uid_mapping_table` 解析发送者昵称和 QQ 号

### 密钥提取

这是最关键的一步——你需要从 QQ 进程内存中提取数据库解密密钥。

> ⚠️ **密钥是 16 字节的字符串**，每次 QQ 重启后可能会变化，需要重新提取。

---

## 三、macOS 安装与使用

### 前置条件

- macOS（Intel 或 Apple Silicon）
- QQ 桌面版（NTQQ 架构）
- Node.js 18+
- sqlcipher（通过 Homebrew 安装）
- VCPToolBox

### 步骤 1：安装 sqlcipher

```bash
brew install sqlcipher
```

安装后路径通常为：
- Apple Silicon: `/opt/homebrew/opt/sqlcipher/bin/sqlcipher`
- Intel Mac: `/usr/local/opt/sqlcipher/bin/sqlcipher`

### 步骤 2：找到 QQ 数据库目录

```bash
ls ~/Library/Containers/com.tencent.qq/Data/Library/Application\ Support/QQ/
```

你会看到类似 `nt_qq_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` 的目录，数据库在其中的 `nt_db` 子目录：

```bash
ls ~/Library/Containers/com.tencent.qq/Data/Library/Application\ Support/QQ/nt_qq_*/nt_db/
# 应该能看到 nt_msg.db、profile_info.db 等文件
```

### 步骤 3：提取数据库密钥

这是最难的一步，需要**临时关闭 SIP（系统完整性保护）**来使用 lldb 调试 QQ 进程。

#### 3.1 关闭 SIP

1. 关机
2. 长按电源键进入恢复模式
3. 打开终端，执行：`csrutil disable`
4. 重启

#### 3.2 找到密钥函数偏移地址

```bash
# 找到 wrapper.node 路径
find /Applications/QQ.app -name "wrapper.node" 2>/dev/null

# 用 objdump 查找 nt_sqlite3_key_v2 函数偏移
objdump -t /Applications/QQ.app/Contents/Frameworks/wrapper.node | grep sqlite3_key
```

记下 `nt_sqlite3_key_v2` 的偏移地址（如 `0x2e225c4`）。

> ⚠️ QQ 每次更新后这个地址可能变化，需要重新查找。

#### 3.3 用 lldb 提取密钥

```bash
# 启动 QQ 并登录
# 找到 QQ 进程 PID
pgrep -f QQ

# 附加 lldb
lldb -p <QQ_PID>

# 在 nt_sqlite3_key_v2 设置断点（替换为你的偏移地址）
(lldb) image list wrapper.node
# 记下基地址 base_addr
(lldb) br set -a <base_addr + 偏移地址>
(lldb) continue

# 断点命中后，x2 寄存器包含密钥指针，x3 是长度
(lldb) register read x2 x3
(lldb) memory read -c 16 -f C <x2的值>
```

你会看到 16 字节的密钥字符串。

#### 3.4 重新开启 SIP（推荐）

密钥提取后，建议重新开启 SIP：
1. 关机 → 恢复模式
2. `csrutil enable`
3. 重启

### 步骤 4：验证密钥

```bash
# 复制数据库并去掉头部
cp ~/Library/Containers/com.tencent.qq/Data/Library/Application\ Support/QQ/nt_qq_*/nt_db/nt_msg.db /tmp/nt_msg.db
tail -c +1025 /tmp/nt_msg.db > /tmp/nt_msg_clean.db

# 用 sqlcipher 验证
/opt/homebrew/opt/sqlcipher/bin/sqlcipher /tmp/nt_msg_clean.db
sqlite> PRAGMA key = "你的密钥";
sqlite> PRAGMA kdf_iter = 4000;
sqlite> PRAGMA cipher_page_size = 4096;
sqlite> PRAGMA cipher_hmac_algorithm = HMAC_SHA1;
sqlite> PRAGMA cipher_default_kdf_algorithm = PBKDF2_HMAC_SHA512;
sqlite> SELECT count(*) FROM group_msg_table;
```

如果返回数字而不是报错，说明密钥正确。

### 步骤 5：配置插件

```bash
cd VCPToolBox/Plugin/QQGroupReader
cp config.env.example config.env
```

编辑 `config.env`：

```env
QQ_DB_KEY=你提取的16字节密钥
QQ_DB_DIR=/Users/你的用户名/Library/Containers/com.tencent.qq/Data/Library/Application Support/QQ/nt_qq_HASH/nt_db
SQLCIPHER_PATH=/opt/homebrew/opt/sqlcipher/bin/sqlcipher

# 关注配置（可选）
WATCH_GROUP=你要关注的群号
WATCH_QQ=你要关注的QQ号
WATCH_KEYWORDS=AI,大模型,LLM,GPT,免费,token
```

### 步骤 6：测试

```bash
# 列出所有群
echo '{"command":"ListGroups"}' | node QQGroupReader.js

# 读取指定群最近6小时消息
echo '{"command":"ReadGroupMessages","group_id":"你的群号","hours":"6"}' | node QQGroupReader.js
```

### 步骤 7：注册到 VCPToolBox

在 `TVStxt/supertool.txt` 中添加 `{{VCPQQGroupReader}}`，重启 VCPToolBox 即可。

---

## 四、Windows 安装与使用

### 与 macOS 的差异

| 项目 | macOS | Windows |
|------|-------|---------|
| QQ 数据库路径 | `~/Library/Containers/com.tencent.qq/.../nt_db/` | `C:\Users\用户名\Documents\Tencent Files\nt_qq_HASH\nt_db\` |
| sqlcipher 安装 | `brew install sqlcipher` | 需手动编译或下载预编译版 |
| 密钥提取工具 | lldb（需关闭 SIP） | 有现成工具（见下方） |
| 头部偏移 | 1024 字节 | 1024 字节（相同） |
| 加密参数 | 相同 | 相同 |

### 步骤 1：安装 sqlcipher（Windows）

**方法 A：使用预编译版（推荐）**

从 [sqlcipher releases](https://github.com/nicehash/sqlcipher/releases) 或其他可信来源下载 Windows 预编译的 sqlcipher.exe。

**方法 B：使用 vcpkg 编译**

```powershell
vcpkg install sqlcipher
```

**方法 C：使用 Chocolatey**

```powershell
choco install sqlcipher
```

将 sqlcipher.exe 的路径记下来，后面配置要用。

### 步骤 2：找到 QQ 数据库目录

Windows 上 NTQQ 数据库通常在：

```
C:\Users\你的用户名\Documents\Tencent Files\nt_qq_HASH\nt_db\
```

或者：

```
C:\Users\你的用户名\AppData\Local\Tencent\QQ\nt_qq_HASH\nt_db\
```

> 具体路径取决于 QQ 版本，可以在文件管理器中搜索 `nt_msg.db`。

### 步骤 3：提取数据库密钥（Windows）

Windows 上有现成的开源工具，比 macOS 简单很多：

**方法 A：使用 qq-win-db-key（推荐）**

参考 GitHub 项目 [QQBackup/qq-win-db-key](https://github.com/QQBackup/qq-win-db-key)，可以直接从 QQ 进程内存中提取密钥。

**方法 B：使用 Windows_NTQQ_DB_Decrypt_Tool**

参考 GitHub 项目 [r4inb00w/Windows_NTQQ_DB_Decrypt_Tool](https://github.com/r4inb00w/Windows_NTQQ_DB_Decrypt_Tool)。

**方法 C：使用 x64dbg 手动提取**

原理与 macOS 的 lldb 相同：
1. 用 x64dbg 附加到 QQ 进程
2. 在 `nt_sqlite3_key_v2` 函数设置断点
3. 断点命中后从寄存器/栈中读取密钥

### 步骤 4：配置插件

编辑 `config.env`：

```env
QQ_DB_KEY=你提取的16字节密钥
QQ_DB_DIR=C:\Users\你的用户名\Documents\Tencent Files\nt_qq_HASH\nt_db
SQLCIPHER_PATH=C:\path\to\sqlcipher.exe

WATCH_GROUP=你要关注的群号
WATCH_QQ=你要关注的QQ号
WATCH_KEYWORDS=AI,大模型,LLM,GPT,免费,token
```

### 步骤 5：代码适配（Windows 需要修改）

插件代码本身是跨平台的（Node.js），但有一个地方需要注意：

**路径分隔符**：Node.js 的 `path.join` 会自动处理，无需修改。

**sqlcipher 调用**：`execSync` 在 Windows 上也能正常工作，无需修改。

**头部去除**：`fs.readFileSync` + `slice(1024)` 是纯 JavaScript，跨平台兼容。

**总结：代码本身无需修改，只需正确配置 `config.env` 中的路径即可。**

### 步骤 6：测试

```powershell
# 在 PowerShell 中
echo '{"command":"ListGroups"}' | node QQGroupReader.js
```

---

## 五、插件文件说明

```
QQGroupReader/
├── plugin-manifest.json      # VCPToolBox 插件契约文件
├── QQGroupReader.js          # 主脚本（Node.js）
├── config.env.example        # 配置模板（复制为 config.env 后填写）
└── state/                    # 运行时状态（GetNewMessages 的时间戳记录）
```

### config.env 配置项

| 配置项 | 必填 | 说明 |
|--------|------|------|
| `QQ_DB_KEY` | ✅ | 数据库解密密钥（16 字节） |
| `QQ_DB_DIR` | ✅ | nt_db 目录的完整路径 |
| `SQLCIPHER_PATH` | ✅ | sqlcipher 可执行文件路径 |
| `DEFAULT_HOURS` | ❌ | 默认查询时间范围（默认 24 小时） |
| `MAX_MESSAGES` | ❌ | 单次最大消息数（默认 500） |
| `WATCH_GROUP` | ❌ | 关注的群号（逗号分隔） |
| `WATCH_QQ` | ❌ | 关注的 QQ 号（逗号分隔） |
| `WATCH_KEYWORDS` | ❌ | 关注的关键词（逗号分隔） |

---

## 六、AI Agent 调用示例

### 列出所有群

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」QQGroupReader「末」,
command:「始」ListGroups「末」
<<<[END_TOOL_REQUEST]>>>
```

### 读取群消息

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」QQGroupReader「末」,
command:「始」ReadGroupMessages「末」,
group_id:「始」123456789「末」,
hours:「始」6「末」
<<<[END_TOOL_REQUEST]>>>
```

### 读取关注消息

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」QQGroupReader「末」,
command:「始」ReadWatchedMessages「末」,
hours:「始」12「末」
<<<[END_TOOL_REQUEST]>>>
```

### 增量获取新消息

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」QQGroupReader「末」,
command:「始」GetNewMessages「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 七、常见问题

### Q: 密钥提取后 QQ 重启了，还能用吗？

A: QQ 重启后密钥**可能会变化**，需要重新提取。建议在提取密钥后不要重启 QQ。

### Q: QQ 更新后插件还能用吗？

A: QQ 更新后 `nt_sqlite3_key_v2` 的函数偏移地址可能变化，需要重新用 objdump/x64dbg 查找。但数据库加密参数通常不会变。

### Q: 为什么有些消息显示为空或乱码？

A: 图片、文件、表情包等非文本消息会被自动过滤。少量消息的 Protobuf 结构可能无法被启发式解析器正确处理。

### Q: 性能如何？

A: 单次调用约 0.3 秒（包含复制 90MB 数据库 + 解密 + 查询），5 秒轮询完全没问题。

### Q: 会影响 QQ 正常使用吗？

A: 不会。插件只是**复制**数据库文件后操作副本，不会修改原始数据库，也不会干扰 QQ 进程。

### Q: 支持私聊消息吗？

A: 当前版本只支持群消息（`group_msg_table`）。私聊消息在 `c2c_msg_table` 中，原理相同，可以扩展。

---

## 八、安全提示

- **密钥安全**：`config.env` 中包含数据库解密密钥，请勿分享或提交到公开仓库
- **数据隐私**：插件读取的是你本地的 QQ 消息，数据不会上传到任何服务器
- **SIP 恢复**：macOS 用户提取密钥后请尽快重新开启 SIP（`csrutil enable`）
- **合规使用**：请遵守相关法律法规，不要用于非法用途

---

## 九、致谢

- [Mythologyli/qq-nt-db](https://github.com/Mythologyli/qq-nt-db) - NTQQ 数据库解密原理
- [QQBackup/qq-win-db-key](https://github.com/QQBackup/qq-win-db-key) - Windows 密钥提取工具
- [sqlcipher](https://www.zetetic.net/sqlcipher/) - SQLite 加密扩展
- VCPToolBox - AI 中间层框架
