# 定期试推：本地领先远端时尝试 git push，成功即止。
# 由计划任务 DSH-GitHub-RetryPush 每 15 分钟调用一次。
# 只推送【已有提交】—— 绝不自动 commit，避免把半成品提交上去。

$repo   = 'D:\桌面\deepseek'
$logDir = Join-Path $env:APPDATA 'dsh-desktop\harness\logs'
$log    = Join-Path $logDir 'push-retry.log'

if (-not (Test-Path $repo)) { exit 0 }
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$utf8 = New-Object System.Text.UTF8Encoding($false)
function Write-Log([string]$msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $msg
  [System.IO.File]::AppendAllText($log, $line + "`r`n", $utf8)
}

Set-Location $repo
$env:GIT_TERMINAL_PROMPT = '0'

$ahead = 0
try {
  $raw = & git rev-list --count 'origin/main..HEAD' 2>$null
  if ($raw) { $ahead = [int]$raw }
} catch { $ahead = 0 }

# 没有待推送的提交 -> 静默退出，不写日志（保持日志干净）
if ($ahead -le 0) { exit 0 }

$out = & git push 2>&1
if ($LASTEXITCODE -eq 0) {
  Write-Log ("PUSH OK - {0} commit(s) uploaded" -f $ahead)
} else {
  $first = ($out | Select-Object -First 1)
  Write-Log ("PUSH FAILED - {0} commit(s) stay local : {1}" -f $ahead, $first)
}
exit 0
