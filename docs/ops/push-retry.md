# 推送重试（外部故障兜底）

`github.com:443` 会**间歇性**不通，导致 `git push` 失败、提交留在本地。这份文档记录兜底机制与已知坑。

## 自动化

| 项 | 值 |
| --- | --- |
| 计划任务 | `DSH-GitHub-RetryPush` |
| 频率 | 每 15 分钟 |
| 脚本 | `tools/retry-push.ps1` |
| 日志 | `%APPDATA%\dsh-desktop\harness\logs\push-retry.log` |
| 行为 | 只在本地领先远端时推送；**绝不自动 commit**（避免把半成品推上去） |

脚本从 `$PSScriptRoot` 推导仓库根，不硬编码中文路径。无待推送提交时静默退出，保持日志干净。

## 已知坑：脚本必须存为 UTF-8 with BOM

PowerShell 5.1 读**无 BOM** 的 UTF-8 脚本时按 ANSI 解码，中文变乱码 → 路径字面量失效 → **脚本静默秒退**。2026-09-19 已踩过这个坑（见提交 `70a5f5c`）。

同样的坑也会咬到**读中文 markdown 文件**：`Get-Content` 按 ANSI 解码 UTF-8，中文变乱码且部分标点**不可逆丢失**；`Get-Content` 还会**丢行**（同一文件报 138 行，`.NET ReadAllText` 报 161 行）。结论：**处理中文文本用 `read` / `write` / `edit` 工具，不要用 PowerShell 文本 cmdlet**；必须用 PowerShell 时走 `[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)`。

## 观测记录

| 日期 | 现象 |
| --- | --- |
| 2026-09-19 | `github.com:443` 间歇不通；同时刻 `api.github.com`、`codeload.github.com`、`ssh.github.com:443` 仍可达 |
| 2026-09-19 | 本地积压 3 个未推送提交，由计划任务兜底 |
| 2026-09-19 | `git config http.curloptResolve` 曾被写入本地配置，但**未验证生效**（该项可能不存在、被 Git 静默忽略）。网络恢复后需重新验证，勿当成已修复 |
