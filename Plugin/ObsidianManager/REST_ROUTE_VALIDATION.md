# ObsidianManager REST Route Validation

本文档用于记录 [`ObsidianManager`](./ObsidianManager.js) 中 REST 路由与**你本机 Obsidian REST 插件版本**的实际一致性校验结果。

## 1. 校验目的

由于不同版本的 Obsidian REST 插件在路由、方法和返回结构上可能存在差异，因此：

- 不能只凭通用经验就断定所有新增路由可用
- 必须把“已验证能力”和“待验证能力”分开管理

本文件就是当前版本的验证登记表。

## 2. 当前代码中使用的 REST 路由

| 命令 | 方法 | 路由 | 当前状态 | 备注 |
|---|---|---|---|---|
| `ListDirectory` | `GET` | `/vault/` 或 `/vault/{path}/` | 基础可靠 | 来自旧实现延续 |
| `ReadNote` | `GET` | `/vault/{path}` | 基础可靠 | 来自旧实现延续 |
| `WriteNote` | `PUT` | `/vault/{path}` | 基础可靠 | 来自旧实现延续 |
| `AppendNote` | `POST` | `/vault/{path}` | 基础可靠 | 来自旧实现延续 |
| `SearchVault` | `POST` | `/search/simple/?query=...` | 基础可靠 | 来自旧实现延续 |
| `GetActiveNote` | `GET` | `/active/` | 基础可靠 | 来自旧实现延续 |
| `DeleteNote` | `DELETE` | `/vault/{path}` | 待实测 | 新增增强项 |
| `MoveNote` | `POST` | `/vault/{path}/move` | 待实测 | 新增增强项 |
| `RenameNote` | - | 复用 `MoveNote` | 待实测 | 依赖 `MoveNote` 成功 |

## 3. 推荐实测方式

在本机 Obsidian REST 插件已运行，且已知：

- `OBSIDIAN_REST_URL`
- `OBSIDIAN_REST_KEY`

的前提下，逐项验证：

### 3.1 ListDirectory

```bash
curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:27123/vault/
```

### 3.2 ReadNote

```bash
curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:27123/vault/收件箱.md
```

### 3.3 WriteNote

```bash
curl -X PUT -H "Authorization: Bearer <TOKEN>" -H "Content-Type: text/markdown" --data "# test" http://127.0.0.1:27123/vault/测试.md
```

### 3.4 AppendNote

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: text/markdown" --data "\nappend line" http://127.0.0.1:27123/vault/测试.md
```

### 3.5 SearchVault

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" "http://127.0.0.1:27123/search/simple/?query=项目A"
```

### 3.6 GetActiveNote

```bash
curl -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:27123/active/
```

### 3.7 DeleteNote

```bash
curl -X DELETE -H "Authorization: Bearer <TOKEN>" http://127.0.0.1:27123/vault/测试.md
```

### 3.8 MoveNote

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" --data '{"target":"项目A/测试.md"}' http://127.0.0.1:27123/vault/收件箱/测试.md/move
```

## 4. 实测记录模板

建议每次验证后补一条记录：

| 日期 | 命令 | 结果 | 插件版本 | 说明 |
|---|---|---|---|---|
| YYYY-MM-DD | `ListDirectory` | ✅ / ❌ | x.y.z | 示例说明 |

## 5. 当前结论

截至当前代码版本：

- 基础读写查与活动笔记路由来自旧实现，可靠性较高
- `DeleteNote` / `MoveNote` / `RenameNote` 已接入代码，但还不能宣称与你本机 REST 插件版本 **完全一致**
- 在补上实测记录前，这三项应视为“增强候选能力”，不是“已百分百确认能力”

## 6. 下一步建议

优先完成这三项验证：

1. `DeleteNote`
2. `MoveNote`
3. `RenameNote`（通过 `MoveNote` 间接确认）

一旦实测通过，再把 [`README.md`](./README.md) 中对应说明从“待实测”升级为“已验证”。
