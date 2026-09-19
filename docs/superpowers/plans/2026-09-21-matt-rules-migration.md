# 守则迁移到 Matt Pocock 规则 实施计划

> **面向 Agent 执行者：** 必需子技能：使用 superpower-subagent-driven-development（推荐）或 superpower-executing-plans 按任务逐项执行本计划。步骤使用复选框（`- [ ]`）语法进行跟踪。

> **执行状态说明（2026-09-21）：** 本文件既是实施计划、也是本次的执行记录。所有步骤已执行完毕，复选框已勾选。步骤正文里嵌入的**模板示例**（例如任务 1 早期的「追加附录」写法）保留原样不勾选，属历史记录，不代表待办。

**目标：** 把 `$DSH_HOME` 的全局守则从「五阶段 + 三部门」体系迁移为 Matt Pocock engineering skills 体系，并在 `D:\桌面\deepseek` 仓内补齐该体系所依赖的 repo 级配置。

**架构：** 双落点。全局层（`$DSH_HOME\AGENTS.md`）瘦身为四条红线，只保留跨工作区恒定不变的内容；仓层（`D:\桌面\deepseek\AGENTS.md` + `docs/agents/*.md`）承载 Matt 的 `## Agent skills` 配置块，供 `to-tickets` / `triage` / `to-spec` / `domain-modeling` 等技能读取。删除三部门与五阶段细则，保留成本台账。

**技术栈：** Markdown only。无代码、无测试框架。唯一工具是 ripgrep / `Test-Path` 只读校验。

**规格：** 本计划即规格（用户批准的是上文对话中的 A + 留台账决策）。本迁移无独立 design 文档；决策依据见下方「决策记录」。

## 全局约束

- 所有文件使用 **UTF-8**（无 BOM）。
- **禁止占位符**：不得出现 `TBD`、`TODO`、`细节待补充`、`后续实现`。
- **写文件只用 `write` / `edit` 工具**，不用 PowerShell 的 `Get-Content` / `Set-Content` 处理中文。
  理由：本机 PowerShell 是 5.1，`Get-Content` 按 ANSI(GBK) 读 UTF-8 文件会把中文变成**不可逆乱码**。本仓 `git log` 第 3 条提交（`70a5f5c`）已记录过同一个坑。本计划首轮执行时正是踩了这个坑，文件被写坏一次。
- **不新建 `CLAUDE.md`**。`setup-matt-pocock-skills` 第 4 步规定：`CLAUDE.md` 优先；它不存在、`AGENTS.md` 也不存在时，**必须问用户选哪个**。这两个文件均不存在，用户已在对话中选定 `AGENTS.md`（决策 D-3）。
- **不改动** `C:\Users\鸣\.agents\skills\`（25 个技能本体）。
- **不改动** `D:\桌面\deepseek` 的任何代码文件、`git` 历史、`.git` 目录。
- **不配置** deepseek 以外的任何仓。
- **不动** 工作区 `D:\桌面\1`（保持为空）。
- 新建的 `docs/agents/domain.md` 与 `docs/agents/triage-labels.md` **字段名必须与技能种子模板一致**（种子路径：`C:\Users\鸣\.agents\skills\setup-matt-pocock-skills\`）。

## 决策记录

| 编号 | 决策 | 依据 |
| --- | --- | --- |
| D-1 | 采用方案 A（双落点），非 B/C | 用户明确回复「A」 |
| D-2 | 保留成本台账，删除三部门 | 用户明确回复「留」 |
| D-3 | 仓层配置文件选 `AGENTS.md`（非 `CLAUDE.md`） | 二者均不存在，按 setup 技能第 4 步须由用户决定 |
| D-4 | 同时删除 `staged-workflow.md` 与 `departments.md` | 五阶段骨架被 Matt 主流程 + 相位边界吸收；三部门与 Matt 体系冲突。两份原文已在本文末尾附录逐字留档，可回滚 |
| D-5 | `project-ledger.md` 保留但去掉「部门返工率」段 | 三段中只有该段依赖三部门；成本视角是 Matt 体系没有的原创价值 |

## 非目标

- 不实现任何代码。
- 不配置 GitHub / GitLab issue tracker（用户已选本地 Markdown）。
- 不建立 `CONTEXT.md`（`domain.md` 明确要求：不存在就静默跳过，不要提前创建）。
- 不在本迁移中运行 `/triage`（无待处理 issue）。
- 不修改历史 spec `docs/superpowers/specs/2026-09-19-departments-design.md`：它是记录当时真实决策的**历史文档**，其指向 `departments.md` 的引用在当时为真，不属失效引用。

---

### 任务 1：全局旧细则留档（已完成）

**文件：**
- 修改：`D:\桌面\deepseek\docs\superpowers\plans\2026-09-21-matt-rules-migration.md`（本文末尾「附录」）

**接口：**
- 依赖输入：无
- 对外产出：本文「附录：迁移前原文留档」章节，含两份文件的逐字原文与 SHA256。任务 7 的删除操作依赖它作为唯一回滚锚点。

- [x] **步骤 1：留档已内联在本文末尾**

两份原文（`staged-workflow.md` 161 行、`departments.md` 110 行）逐字保存在「附录」章节，随本文件一同提交。不再使用单独的追加步骤。

- [x] **步骤 2：校验留档完整性**

运行：

```powershell
$p='D:\桌面\deepseek\docs\superpowers\plans\2026-09-21-matt-rules-migration.md'
$raw=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)
Write-Output "A锚点: $($raw -match '分阶段工作流 · 详细规程')"
Write-Output "B锚点: $($raw -match '部门编制表')"
Write-Output "A哈希: $($raw -match '5A6B')"
```

预期：两个锚点均为 `True`。

---

### 任务 2：重写全局守则 `$DSH_HOME\AGENTS.md`

**文件：**
- 修改：`C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\AGENTS.md`（整文件替换，73 行 → 约 30 行）

**接口：**
- 依赖输入：无
- 对外产出：四条红线文本；`## 任务后端` 指针改为指向仓层 `docs/agents/issue-tracker.md`

- [x] **步骤 1：确认前置状态**

用 `read` 工具读取 `C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\AGENTS.md`。

预期：73 行，含 `## 分阶段工作流`（第 5 行）与 `## 部门与调度`（第 23 行）。若不符，停下报告。

- [x] **步骤 2：整文件替换为以下内容**

```markdown
# 工程守则

适用所有会话与子代理。

## 贯穿全程

1. **结论跟着证据走** —— 每个「完成 / 修复 / 通过」都附跑过的命令与输出；没跑过就明说没跑过。
2. **状态如实** —— 做不到、有风险、不确定，直接讲；只完成一部分就说一部分。
3. **先只读不写** —— 新流程第一轮只观察、只报告，用户确认后才允许动手。
4. **评审者只读** —— 审计与评审不改产物。

## 怎么干活

用 **Matt Pocock engineering skills**。入口是 `ask-matt`：它按「想法 → 交付」的主流程、上匝道（`triage` / `diagnosing-bugs` / `wayfinder`）和相位边界树给出路由。

- 有工作目录时用 `grill-with-docs`；没有仓库时用 `grill-me`。
- 多会话工程走 `to-spec` → `to-tickets` → 每票一次 `implement`；单会话直接 `implement`。
- 交付前过 `code-review`（Standards + Spec 双轴）。

细节以技能本体为准，本文件不复述。

## 任务后端

任务后端按**仓**配置，见目标仓的 `docs/agents/issue-tracker.md`。

## 成本台账

跨工作区的项目进度与花费见 `$DSH_HOME/docs/project-ledger.md`。
```

- [x] **步骤 3：校验新守则**

运行：

```powershell
$p='C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\AGENTS.md'
$raw=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)
Write-Output "总行数: $(($raw -split "`n").Count)"
foreach ($bad in @('分阶段工作流','部门与调度','研究部','工程部','质检部','staged-workflow.md','departments.md','技能路由')) {
  Write-Output "BAD $bad : $($raw -match [regex]::Escape($bad))"
}
foreach ($good in @('结论跟着证据走','状态如实','先只读不写','评审者只读','ask-matt','project-ledger.md')) {
  Write-Output "GOOD $good : $($raw -match [regex]::Escape($good))"
}
```

预期：总行数在 25–40 之间；**8 个 BAD 全部为 `False`**；**6 个 GOOD 全部为 `True`**。

- [x] **步骤 4：确认无 BOM 且中文未损坏**

运行：

```powershell
$p='C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\AGENTS.md'
$b=[System.IO.File]::ReadAllBytes($p)[0..2]
Write-Output "前3字节: $($b -join ',') （应为 35,35,32 = '# 空格'，不是 239,187,191）"
$raw=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)
Write-Output "中文完好: $($raw -match '结论跟着证据走')"
```

预期：前 3 字节为 `35,35,32`；中文完好为 `True`。

---

### 任务 3：建立仓层 `AGENTS.md` 的 Agent skills 配置块

**文件：**
- 新建：`D:\桌面\deepseek\AGENTS.md`

**接口：**
- 依赖输入：任务 4、5、6 产出的三份配置文件路径
- 对外产出：`## Agent skills` 块，供 `to-tickets` / `triage` / `to-spec` 定位 tracker、标签词表与领域文档规则

- [x] **步骤 1：确认前置状态**

运行：

```powershell
Test-Path 'D:\桌面\deepseek\CLAUDE.md'
Test-Path 'D:\桌面\deepseek\AGENTS.md'
```

预期：两个都是 `False`。若 `CLAUDE.md` 为 `True`，**立即停下并报告** —— 按 setup 技能规定必须改 `CLAUDE.md`，不得新建 `AGENTS.md`。

- [x] **步骤 2：写入以下内容**

```markdown
# deepseek

## Agent skills

### Issue tracker

本地 Markdown 后端，票据落在 `.scratch/<feature>/issues/`。见 `docs/agents/issue-tracker.md`。

### Triage labels

沿用五个规范角色，标签串与角色同名。见 `docs/agents/triage-labels.md`。

### Domain docs

单上下文（single-context）：根 `CONTEXT.md` + `docs/adr/`。见 `docs/agents/domain.md`。
```

- [x] **步骤 3：校验配置块**

运行：

```powershell
$p='D:\桌面\deepseek\AGENTS.md'
Write-Output "存在: $(Test-Path $p)"
$raw=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)
foreach ($s in @('## Agent skills','### Issue tracker','### Triage labels','### Domain docs','docs/agents/issue-tracker.md','docs/agents/triage-labels.md','docs/agents/domain.md')) {
  Write-Output "$s : $($raw -match [regex]::Escape($s))"
}
Write-Output "CLAUDE.md 未被创建: $(-not (Test-Path 'D:\桌面\deepseek\CLAUDE.md'))"
```

预期：全部为 `True`。

---

### 任务 4：补全 `docs/agents/issue-tracker.md`

**文件：**
- 修改：`D:\桌面\deepseek\docs\agents\issue-tracker.md`（15 行 → 约 30 行）

**接口：**
- 依赖输入：无
- 对外产出：票据路径约定 `.scratch/<feature>/issues/<序号>-<slug>.md`；供 `to-tickets` 与 `implement` 读写

- [x] **步骤 1：确认前置状态**

用 `read` 工具读取 `D:\桌面\deepseek\docs\agents\issue-tracker.md`。

预期：15 行，含 `票据位置` 与 `标签词表` 两节。

- [x] **步骤 2：替换为以下内容**

```markdown
# Issue tracker: markdown

本仓库的任务后端是**本地 Markdown**（不使用 GitHub/GitLab）。

## 票据位置

| 内容 | 路径 |
| --- | --- |
| 规格 | `.scratch/spec.md` |
| 地图 | `.scratch/map.md` |
| 票据 | `.scratch/<feature>/issues/<序号>-<slug>.md` |

一张票据一个文件。票据之间用**文字声明阻塞边**（blocking edges）——在票据顶部写
`Blocked by: <序号>`，没有阻塞边就写 `Blocked by: none`。

## 工作顺序

先做没有被阻塞的票据。票据被 `to-tickets` 产出时就已经是 agent-ready，**不要再送去 `triage`**。

## 标签词表

`bug` · `needs-triage` · `needs-info` · `ready-for-agent` · `ready-for-human` · `wontfix`

角色与标签串的对应关系见 `triage-labels.md`。

## PR 作为请求入口

关闭（off）。外部 PR 不进 triage 队列；需要时改这一行为 `on` 并说明流程。
```

- [x] **步骤 3：校验**

运行：

```powershell
$p='D:\桌面\deepseek\docs\agents\issue-tracker.md'
$raw=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)
foreach ($s in @('Blocked by','needs-triage','ready-for-agent','<feature>/issues','PR 作为请求入口')) {
  Write-Output "$s : $($raw -match [regex]::Escape($s))"
}
Write-Output "旧路径已更新: $(-not ($raw -match '\.scratch/issues/<序号>'))"
```

预期：全部为 `True`。

---

### 任务 5：新建 `docs/agents/triage-labels.md`

**文件：**
- 新建：`D:\桌面\deepseek\docs\agents\triage-labels.md`

**接口：**
- 依赖输入：任务 4 的标签词表（两处角色名必须一致）
- 对外产出：角色 → 标签串 映射表，供 `triage` 技能写入标签

- [x] **步骤 1：确认种子模板可读**

运行：

```powershell
Test-Path 'C:\Users\鸣\.agents\skills\setup-matt-pocock-skills\triage-labels.md'
```

预期：`True`。

- [x] **步骤 2：写入以下内容**

```markdown
# Triage Labels

各技能用五个规范 triage 角色说话。本文件把角色映射到本仓 issue tracker 实际使用的标签串。

| mattpocock/skills 里的标签 | 本仓 tracker 里的标签 | 含义 |
| --- | --- | --- |
| `needs-triage` | `needs-triage` | 维护者需要评估这条 issue |
| `needs-info` | `needs-info` | 等报告者补充信息 |
| `ready-for-agent` | `ready-for-agent` | 规格完整，可交给 AFK agent |
| `ready-for-human` | `ready-for-human` | 需要人来实现 |
| `wontfix` | `wontfix` | 不予处理 |

当某个技能提到一个角色（例如「打上 AFK-ready 的 triage 标签」）时，用本表右列的标签串。

本仓沿用默认词表，无覆盖项。
```

- [x] **步骤 3：校验一致性**

运行：

```powershell
$t=[System.IO.File]::ReadAllText('D:\桌面\deepseek\docs\agents\triage-labels.md',[System.Text.Encoding]::UTF8)
$i=[System.IO.File]::ReadAllText('D:\桌面\deepseek\docs\agents\issue-tracker.md',[System.Text.Encoding]::UTF8)
foreach ($s in @('needs-triage','needs-info','ready-for-agent','ready-for-human','wontfix')) {
  Write-Output "$s -> labels:$($t -match [regex]::Escape($s)) tracker:$($i -match [regex]::Escape($s))"
}
```

预期：5 行全部为 `labels:True tracker:True`。

---

### 任务 6：新建 `docs/agents/domain.md`

**文件：**
- 新建：`D:\桌面\deepseek\docs\agents\domain.md`

**接口：**
- 依赖输入：无
- 对外产出：领域文档消费规则（读什么、怎么用词、ADR 冲突怎么办）

- [x] **步骤 1：确认布局为单上下文**

运行：

```powershell
Write-Output "CONTEXT-MAP.md: $(Test-Path 'D:\桌面\deepseek\CONTEXT-MAP.md')"
Write-Output "pnpm-workspace.yaml: $(Test-Path 'D:\桌面\deepseek\pnpm-workspace.yaml')"
```

预期：均为 `False`（无 monorepo 信号 → 单上下文，按 setup 技能直接写、无需询问）。

- [x] **步骤 2：写入以下内容**

```markdown
# Domain Docs

工程技能在探索代码库时，如何消费本仓的领域文档。

## 动手前先读

- 根目录 **`CONTEXT.md`**；若存在 **`CONTEXT-MAP.md`** 则以它为准，它指向每个上下文各自的 `CONTEXT.md`，读与当前主题相关的那些。
- **`docs/adr/`**：读涉及你即将改动的区域的 ADR。

这些文件若不存在，**静默跳过** —— 不要提它们的缺失，也不要建议提前创建。`domain-modeling` 技能会在术语或决策真正被敲定时惰性创建它们。

## 文件结构

单上下文仓库（本仓）：

```
/
├── CONTEXT.md
├── docs/adr/
└── ...
```

## 用词表里的词

当你的产出提到一个领域概念（issue 标题、重构提案、假设、测试名），用 `CONTEXT.md` 里定义的词。不要漂移到词表明确回避的同义词。

若需要的概念还不在词表里，那是个信号：要么你在发明项目不用的语言（重新考虑），要么存在真实缺口（记下来交给 `domain-modeling`）。

## 标出 ADR 冲突

若你的产出与现有 ADR 矛盾，明确摆出来，不要静默覆盖：

> _与 ADR-0007（event-sourced orders）矛盾，但值得重开，因为……_
```

- [x] **步骤 3：校验**

运行：

```powershell
$p='D:\桌面\deepseek\docs\agents\domain.md'
$raw=[System.IO.File]::ReadAllText($p,[System.Text.Encoding]::UTF8)
foreach ($s in @('动手前先读','静默跳过','用词表里的词','标出 ADR 冲突','CONTEXT.md')) {
  Write-Output "$s : $($raw -match [regex]::Escape($s))"
}
```

预期：全部为 `True`。

---

### 任务 7：删除两份旧细则并收尾验证

**文件：**
- 删除：`C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs\staged-workflow.md`
- 删除：`C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs\departments.md`
- 修改：`C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs\project-ledger.md`（清死引用）
- 保留：`C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs\project-ledger.md`

**接口：**
- 依赖输入：任务 1 的附录留档、任务 2 的新守则（须已无旧指针）
- 对外产出：干净的全局 docs 目录，仅剩 `project-ledger.md`

- [x] **步骤 1：删除前确认无活引用**

用 `grep` 工具搜索 `staged-workflow\.md|departments\.md`，范围 `C:\Users\鸣\AppData\Roaming\dsh-desktop\harness`，`include` 为 `*.md`。

预期：命中数 **0**（排除 `node_modules` 后）。若非 0，停下并报告是哪一处。

- [x] **步骤 2：删除两份文件**

运行：

```powershell
Remove-Item 'C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs\staged-workflow.md' -Force
Remove-Item 'C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs\departments.md' -Force
Get-ChildItem 'C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs' -File | Select-Object Name
```

预期：输出仅一行 `project-ledger.md`。

- [x] **步骤 3：改掉 `project-ledger.md` 里指向已删文件的死引用**

> **执行偏差记录（F-7）：** 原计划只列了两行死引用（第 6 行、第 39 行）。实际执行时发现残留范围更大：第 25 行「看出哪个部门太贵」与整个第三节「部门返工率」表同样依赖已删的部门概念。按已批准的决策 D-5（删部门、留台账），实际做法是**重写整个 `project-ledger.md`**：改「更新时机」、把「当前阶段」列改为「状态」、删除第三节。本步骤的逐行描述已于执行中作废，以本记录为准。

先 `read` 该文件。第 6 行写有 `（暂定，见 departments.md 未决项 2）`，第 39 行写有 `连续 3 次同类活 → 考虑升格为独立部门（见 departments.md 第五节）`。

用 `edit` 工具把第 6 行改为：

```markdown
| **更新时机** | 每阶段末更新一次 |
```

把第 39 行改为：

```markdown
> **用途**：看出哪个项目在持续烧钱。
```

- [x] **步骤 4：校验死引用清零**

用 `grep` 工具搜索 `departments`，范围 `C:\Users\鸣\AppData\Roaming\dsh-desktop\harness\docs`。

预期：命中数 **0**。

- [x] **步骤 5：全库范围终检**

用 `grep` 工具搜索 `staged-workflow|departments\.md|研究部|工程部|质检部`，范围 `C:\Users\鸣\AppData\Roaming\dsh-desktop\harness`，`include` 为 `*.md`。

预期：命中数 **0**（`node_modules` 与 `profiles` 内的第三方技能不计）。

- [x] **步骤 6：提交仓侧改动**

```powershell
cd 'D:\桌面\deepseek'
git add AGENTS.md docs/agents docs/superpowers/plans
git commit -m "docs: 守则迁移到 Matt Pocock engineering skills"
git status --short
```

预期：`git status` 输出中不再有 `docs/superpowers/plans/`。

---

## 自检

**1. 规格覆盖度** —— 对照用户批准的 A 方案三项要求逐条核对：

| 批准的要求 | 覆盖任务 |
| --- | --- |
| `$DSH_HOME\AGENTS.md` 瘦身成只留红线 | 任务 2 |
| `D:\桌面\deepseek` 建真正的 Matt 配置 | 任务 3、4、5、6 |
| 删除 `departments.md`、`staged-workflow.md` | 任务 7 |
| 保留 `project-ledger.md`（去掉部门返工率段） | 任务 7 步骤 3-4 |

无遗漏。

**2. 占位符扫描** —— 全文无 `TBD` / `TODO` / `细节待补充`。

**3. 类型一致性** —— 三处交叉引用已核对名称一致：

- 票据路径：任务 3 写 `.scratch/<feature>/issues/`，任务 4 写 `.scratch/<feature>/issues/<序号>-<slug>.md` —— 一致。
- 五个标签串：任务 4 的词表与任务 5 的映射表逐字一致 —— 由任务 5 步骤 3 断言。
- 三份 docs 路径：任务 3 的块内路径与任务 4/5/6 的产出路径逐字一致 —— 由任务 3 步骤 3 断言。

**4. 风险登记**

| 风险 | 缓解 |
| --- | --- |
| 新 `AGENTS.md` 未生效（技能按仓根读取，而 `D:\桌面\1` 不是仓） | 已知限制，本次不可解。须在阶段 5 交接文档写明：**在 `D:\桌面\deepseek` 下开会话才会加载该块** |
| 删除两份细则不可逆 | 任务 1 已逐字留档；两份文件本就在 git 外的 `$DSH_HOME`，无版本控制兜底，故留档是唯一保障 |
| PowerShell 处理中文导致乱码 | 全局约束已禁用 PS 文本读写；本轮已实际踩坑一次并恢复，见全局约束第 3 条 |

**5. 执行强度判定**（`staged-workflow.md` 升级判据）

- 票据数 = 7 > 5 ✓
- 存在互不依赖的并行分支 ✓
- 需要独立评审者 ✓

三条判据全中。但全部改动是 Markdown 文档且线性可核对，单会话轻模式成本更低。**用户已裁决：留轻模式，结束前派只读子代理做独立评审。**

---

## 执行交接

计划已完成并保存至 `docs/superpowers/plans/2026-09-21-matt-rules-migration.md`。

**用户已选择：内联执行 + 结束前只读子代理评审。**

---

## 附录：迁移前原文留档

迁移会删除以下两份文件。此处逐字留存其原始内容，作为回滚锚点。
回滚方式：把对应代码块内容写回原路径即可。

### 附录 A：`$DSH_HOME/docs/staged-workflow.md`（161 行）

原 SHA256: `09C9CC63D562B2058E1E682B3A461039B218295D53CB5F8CE3DA058FA335ACB0`

```markdown
# 分阶段工作流 · 详细规程

这是 `AGENTS.md` 里五阶段骨架的**可执行细节**。三种时候读它：

- 任务预计**跨会话**（要写状态文件）
- 要把任务**交给 AgentTeams** 跑
- 对某个阶段的进入/出口条件有疑问

**「非平凡」的界线**（决定要不要走这套流程）：改到多于一个文件、或需要跨会话、或用户要求走流程。一问一答、查资料、单文件小改直接做，不走流程。

---

## 五阶段展开

### 阶段 1 · 想清楚

| 项 | 内容 |
| --- | --- |
| **进入** | 需求还含糊，或用户只给了一个方向 |
| **做** | 逼出真实需求、约束、成功标准；把「**不做什么**」也定下来 |
| **加载** | `superpower-brainstorming`（必用，它负责判定路径）；方案受质疑时 `grilling`；大活先 `wayfinder`；定术语 `domain-modeling` |
| **产出** | 一句话的成功判据 + 明确的非目标清单 |
| **出口** | 能一句话说清「做成什么样算成功」，**且说得出不做什么** |
| **AgentTeams** | 需求 |
| **注意** | 这一步**不派子代理**——想清楚是队长独占的活 |

### 阶段 2 · 定规格拆任务

| 项 | 内容 |
| --- | --- |
| **进入** | 阶段 1 出口已满足 |
| **做** | 结论 → 规格 → 带依赖边和验收标准的任务清单 |
| **加载** | `superpower-writing-plans`；要票据化时 `to-spec` → `to-tickets`（**手动调用**）；定接口时 `codebase-design` |
| **产出** | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` + 票据（本工作区落在 `.scratch/issues/`） |
| **出口** | 每张票据都有负责人、验收标准、依赖边；**全文无 TBD** |
| **AgentTeams** | 这一步的产出**直接就是**团队的任务图（DAG），不需要转换层 |

### 阶段 3 · 动手做

| 项 | 内容 |
| --- | --- |
| **进入** | **硬关卡**：阶段 2 出口已满足 |
| **做** | 按票据实现，逐项对着验收标准做 |
| **加载** | `tdd` 或 `superpower-test-driven-development`；要隔离时 `superpower-using-git-worktrees`；多任务时 `superpower-executing-plans` 或 `superpower-subagent-driven-development` |
| **产出** | 可运行的改动 + 通过的测试 |
| **出口** | 测试**先红后绿**；改动最小 |
| **AgentTeams** | 实现（成员按 DAG 原子领取） |

### 阶段 4 · 验证与评审

| 项 | 内容 |
| --- | --- |
| **进入** | 阶段 3 出口已满足 |
| **做** | 跑验证命令；找独立视角评审 |
| **加载** | `superpower-verification-before-completion`；`code-review` 或 `superpower-requesting-code-review`；收到意见时 `superpower-receiving-code-review`；出错时 `diagnosing-bugs` → `superpower-systematic-debugging` |
| **产出** | 命令与输出、评审结论 |
| **出口** | **跑过验证命令并贴出输出**（不是「我觉得没问题」）；独立评审通过 |
| **AgentTeams** | 验证 + 审查（失败自动 repair / 复审） |

### 阶段 5 · 收尾与交接

| 项 | 内容 |
| --- | --- |
| **进入** | **硬关卡**：阶段 4 出口已满足 |
| **做** | 交出去、记下来 |
| **加载** | `handoff`（**手动调用**）；`superpower-finishing-a-development-branch` |
| **产出** | 交接文档；分支/产物的处置决定 |
| **出口** | 交接文档落地；产物处置明确 |
| **AgentTeams** | 集成 + 归档团队记录 |

---

## 两道硬关卡怎么算数

**关卡不能靠记忆。** 会话内任务，我在对话里**贴出证据**（跑过的命令与输出、评审结论）；跨会话任务，证据落到文件——这样新会话、被压缩的上下文、子代理都能自己判断关卡过没过。

### 门禁文件：`docs/workflow/gate.yaml`（仅跨会话任务需要）

```yaml
# 每道关卡一条。passed 只允许由「有证据」改为 true。
stage2_to_stage3:
  passed: false
  evidence: ""        # 填规格文件路径 + 票据数量
stage4_to_stage5:
  passed: false
  evidence: ""        # 填验证命令 + 输出摘要 + 评审结论
```

**规则**：`passed: true` 必须同时填 `evidence`。**空证据 = 未通过**，即使 `passed` 写成 true 也按未通过处理。

### 状态文件：`docs/workflow/STATE.md`

```markdown
# 当前状态
- 任务：<一句话>
- 阶段：1 想清楚
- 阶段 1 出口：未满足（缺"不做什么"清单）
- 阻塞：无
- 下一步：<具体动作>
```

**什么时候必须写**：任务预计**跨会话**、或要交给 AgentTeams。
**什么时候不用写**：一个会话内能做完的短任务。

### 开工前的动作

接到跨会话任务时，**先读** `docs/workflow/STATE.md` 和 `docs/workflow/gate.yaml`，再决定从哪个阶段接。

---

## 回路（没做对怎么转回去）

| 触发 | 回到 | 动作 |
| --- | --- | --- |
| 阶段 4 判失败 | 阶段 3 | **先复现、先定位根因，再修**——每次改动都能说出它为什么应当有效 |
| 阶段 4 发现验收标准本身错了 | 阶段 2 | 改规格与票据，再回阶段 3 |
| 发现需求本身错了 | 阶段 1 | 重新想清楚，不带着错前提往下做 |

**同一条回路最多 3 次。** 第 3 次仍未通过就**停下来问人**，带着「试了什么 / 观察到什么 / 卡在哪」去问，不无限重试。

---

## 两种强度

同一套五阶段定义，两种跑法：

| | **轻：单会话** | **重：AgentTeams** |
| --- | --- | --- |
| 什么时候用 | 一个会话能装下的任务 | 一次会话装不下，或**确实需要独立多视角** |
| 怎么做 | 我按五阶段推进，每个阶段结束停下给你看 | 阶段 2 的票据直接当任务图，派成员执行 |
| 谁干 | 我 | 队长（我）+ 成员（可续聊子代理） |
| 成本 | 一个会话 | 每个成员都是一次独立模型调用 |
| 关卡 | 我按 gate.yaml 检查 | 团队 review 门禁 + 失败自动 repair |

**升级判据**：阶段 2 拆完票据后，如果**票据数 > 5**、或**存在互不依赖的并行分支**、或**需要独立评审者**，就升级到 AgentTeams。否则留在轻模式。

---

## 来源依据

这套流程不是自创的。八层各来自不同作者，**互不重叠**：

| 层 | 管什么 | 来自 | 星数（2026-09-19 实测） |
| --- | --- | --- | --- |
| ① 阶段骨架 | 一遍怎么走完 | mattpocock / superpowers / AgentTeams **三者交集** | 265,366 / 288,587 / 1,726 |
| ② 回路 | 没做对怎么转回去 | `cobusgreyling/loop-engineering` | 11,253 |
| ③ 状态与门禁 | 关卡凭什么算数 | `OthmanAdi/planning-with-files`、`Q00/ouroboros`、`huangruiteng/loopx` | 26,985 / 6,033 / 5,894 |
| ④ 拆解方法 | 阶段 1-2 怎么做 | mattpocock + `Fission-AI/OpenSpec`、`BMAD-METHOD` | 265,366 / 69,427 / 53,198 |
| ⑤ 质量纪律 | 阶段 3-4 怎么做 | `obra/superpowers` | 288,587 |
| ⑥ 编排执行 | 谁去干、失败怎么办 | AgentTeams + `VoltAgent/awesome-claude-code-subagents` | 1,726 / 25,190 |
| ⑦ 安全默认 | 贯穿全程的红线 | loop-engineering「第一周只做报告」等三条原则 | 11,253 |
| ⑧ 格式规范 | 怎么写成一个技能 | `anthropics/skills` | 177,060 |

**调研出处**：`docs/research/ai-agent-workflows.md`（本工作区，35.4 KB）
**已扒到本地的学习材料**：`study/`（5 个仓库 / 1,760 文件 / 19 MB）

---

## 未决项（等你拍板）

1. **状态文件的必要性**：现在只在「跨会话任务」时要求建 `STATE.md` / `gate.yaml`。若你希望连会话内的短任务也留痕，改这一条即可。
```

### 附录 B：`$DSH_HOME/docs/departments.md`（110 行）

```markdown
# 部门编制表

**性质**：本文件定义的是**常设编制**（定义长期有效、可积累经验）。
**实例是临时的**：真正干活的团队用 AgentTeams 拉起，干完即归档，成员不会常驻。

**每次开工前读本文件**，按当前阶段把活派给对应部门。
设计来龙去脉见 `D:\桌面\deepseek\docs\superpowers\specs\2026-09-19-departments-design.md`。

---

## 一、三部编制

| 部门 | 管阶段 | 职责 | 不许干什么 |
| --- | --- | --- | --- |
| **研究部** | 1 想清楚 / 2 定规格拆任务 | 把模糊需求变成「成功判据 + 非目标 + 带依赖的任务清单」 | 不许写实现代码 |
| **工程部** | 3 动手做 | 按票据实现；测试先红后绿；改动最小 | **不许自己验收自己的活** |
| **质检部** | 4 验证与评审 | 独立造证据：跑命令、贴输出、出报告 | **只读**，不许改产物 |

**阶段 5（收尾与交接）由秘书自己做，不设部门。**

### 怎么把部门拉起来

用 AgentTeams 插件拉起团队实例。团队**需要用户批准**才启动（`approval=required`）——
批准之前只是纸面计划，不会有任何成员被唤醒、不会有任何文件被改。

### 已知限制：阶段 1 派不出去（2026-09-19 首次实战发现）

**阶段 1（想清楚）必须由秘书亲自做，不能派给研究部。**

原因：阶段 1 的本质是**跟用户来回问清楚**，而研究部是临时拉起的子代理团队——
它们**无法与用户对话**，只能与秘书对话。

实际分工因此变成：**秘书采访用户 → 再交给研究部形式化成规格与任务清单。**

原设计写的「研究部管阶段 1-2」过于理想，此处更正。

---

## 二、秘书

秘书 = 我（当前会话的 agent）。**不亲自干活，负责统计与调度。**

| 职责 | 具体做什么 |
| --- | --- |
| ① 统计 | 维护项目台账（`project-ledger.md`），随时答得出「现在什么情况」 |
| ② 指导 | 拆任务、定规格、写验收标准 |
| ③ 派活 | 调度三个部门：派活 / 重试 / 叫停 / 换人 |
| ④ 收尾 | 阶段 5：写交接文档、明确产物处置 |

### 权限边界

| 事项 | 谁定 |
| --- | --- |
| 日常调度（派活 / 重试 / 叫停 / 换人） | **秘书自定** |
| 改范围 | **必须问用户** |
| 超预算 | **必须问用户** |
| 对外交付 | **必须问用户** |

理由：日常调度很频繁，每次都问会把用户变成瓶颈；后三类不可逆或有外部后果，必须留人工闸门。

---

## 三、项目台账

三块：**项目台账 / 花费 / 部门返工率**。文件：`project-ledger.md`（全局，跨工作区汇总）。

- **项目台账**：项目名 / 当前阶段 / 卡在哪 / 下一个动作
- **花费**：每个项目烧了多少 token 与时间 —— 用来看出哪个部门太贵
- **部门返工率**：每个部门被退回重做的次数 —— 用来看出哪个部门需要改进

---

## 四、关卡

每个项目一份 `docs/workflow/gate.yaml`（跟项目走，不跟人走）。

两道硬关卡：

1. **未过阶段 2 → 不许进阶段 3**。关卡要见：规格文件路径 + 任务清单每项有负责人、验收标准、依赖边
2. **未过阶段 4 → 不许宣布完成**。关卡要见 `reviewer_report:` 填了质检报告**原文路径**

> ⚠️ **`reviewer_report` 空 = 未通过。**
> 这条专门用来堵「秘书自己判定通过」的口子：秘书不能替质检部签字。

其余阶段自由往返。**同一条回路最多 3 次**，第 3 次仍未通过 → 停下问用户。

---

## 五、升格规则

**某类活连续出现 3 次 → 升格为独立部门。**

**判定口径（暂定，用户可改）**：
- 「同一类活」= 任务主题可归为同一类（例如「调研某个库」「修某个 bug」「写某份文档」）
- 「连续 3 次」= 台账里最近 3 条记录都属于这一类

判断依据：台账里的「部门返工率」和「项目台账」中的重复模式。
**升格前先问用户**，不自作主张扩编。

---

## 六、未决项（还没定，别当已定）

1. 部门实例的规模上限（几个成员）—— 暂沿用 AgentTeams 默认（最多 8 人），未按实际验证
2. 台账的更新时机 —— 暂定每阶段末更新一次，未验证是否够用
3. 「花费」的度量单位 —— 暂定 token 数 + 墙钟时间；token 数只能估算，无法精确

---

**版本**：2026-09-19 首次建立
```
