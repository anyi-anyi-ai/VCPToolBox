# TimedTaskQuery - 定时任务结果查询与取消

## 1. 插件概述

`TimedTaskQuery` 是 VCP 异步未来工具调用生态中的专用生命周期管理工具。

当智能体在任何常规工具调用中附带 `timely_contact: "YYYY-MM-DD-HH:mm"` 调度时间戳时，VCP 内核会将该请求拦截并封装为定时任务，持久化在 `timed_tasks/` 目录中，并立即向 Agent 返回一个全局唯一的任务标识（例如 `task-1779106560000-650e398d`）。`TimedTaskQuery` 允许 Agent 随后根据该 `task_id` 追踪任务状态（`pending`、`executing`、`completed`、`failed`）、提取已完成任务的执行结果，或者在任务触发前将其主动取消。

### 核心特性
- **任务状态透明感知**：实时查询待执行队列与完成结果库（`timed_task_results/`）。
- **提前主动撤销**：支持对尚未触发执行的定时任务执行 `cancel`，清理队列中的持久化文件。
- **多模态瘦身与安全隔离**：提取执行结果时，自动净化过长的 Base64 图像或超大二进制数据，防止 AI 上下文发生 Token 溢出。

---

## 2. 命令列表与参数说明

### 核心命令：`QueryTimedTaskResult`

| 命令名称 (`command` / `commandIdentifier`) | 功能描述 | 参数列表 (标注必填/可选) |
|---|---|---|
| `QueryTimedTaskResult` | 查询定时任务执行状态/结果，或取消待执行任务 | `task_id` / `taskId` (string, 必填): 创建定时任务时系统分配的任务唯一 ID<br>`action` (string, 可选): 设为 `cancel`、`delete` 或 `取消` 时主动撤销任务；留空则表示查询结果<br>`maid` (string, 可选): 调用者署名（如 `Nova`） |

---

## 3. VCP 标准界定符调用示例

### 3.1 查询待执行或已完成的定时任务结果
```text
<<<[TOOL_REQUEST]>>>
tool_name:「始」TimedTaskQuery「末」,
command:「始」QueryTimedTaskResult「末」,
task_id:「始」task-1779106560000-650e398d「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3.2 取消尚未触发的定时任务 (`action: cancel`)
```text
<<<[TOOL_REQUEST]>>>
maid:「始」Nova「末」,
tool_name:「始」TimedTaskQuery「末」,
command:「始」QueryTimedTaskResult「末」,
task_id:「始」task-1779106560000-650e398d「末」,
action:「始」cancel「末」
<<<[END_TOOL_REQUEST]>>>
```

---

## 4. 任务状态与返回结构

- **Pending（等待到点）**：
  ```json
  {
    "status": "success",
    "result": {
      "taskId": "task-1779106560000-650e398d",
      "taskStatus": "pending",
      "targetTime": "2026-09-04 08:00",
      "toolName": "DailyNoteSearcher",
      "message": "任务尚未到达触发时间"
    }
  }
  ```
- **Completed（已执行完毕）**：
  ```json
  {
    "status": "success",
    "result": {
      "taskId": "task-1779106560000-650e398d",
      "taskStatus": "completed",
      "executedAt": "2026-09-04T08:00:01.123Z",
      "content": [{ "type": "text", "text": "执行产出结果..." }]
    }
  }
  ```
- **Cancelled（撤销成功）**：
  ```json
  {
    "status": "success",
    "result": {
      "taskId": "task-1779106560000-650e398d",
      "taskStatus": "cancelled",
      "message": "定时任务已成功取消并清理"
    }
  }
  ```
