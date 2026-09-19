# AI 智能体自动工作流：GitHub 技能包（Skills）与模板（Templates）调研

> 面向对象：刚开始接触 AI 编程 / 智能体的中文读者。
> 调研与验证日期：**2026-09-19**（下文所有星数、推送时间均为此日期通过 GitHub API 实测取得）。
> 作者：DeepSeek Harness 调研子代理。

---

## 0. 先说清楚：这份报告的可信度从哪里来

网络上二手文章里的星数经常是错的、过期的，甚至凭空编的。所以这份报告遵循两条规矩：

1. **只有我亲手用 GitHub 官方 API 查过的仓库才会进主表。** 没有验证过的一律不进，或者明确标注"未验证"。
2. **每个数字都注明来源和查询日期。** 星数是会变的，今天是这个数，下个月就不是了。

我用到的 API 端点：

```
GET https://api.github.com/repos/<owner>/<repo>
```

这个端点返回仓库的 `full_name`、`description`、`stargazers_count`（星数）、`pushed_at`（最后推送时间）、`license`（许可证）、`archived`（是否归档）、`size`、`default_branch`。

> ⚠️ 一个重要的环境事实：本次调研所在网络 **`github.com` 直连不可用**（`git clone` 会失败），但 **`api.github.com` 可用**。所以所有验证都走 API，下载走 API 的 tarball 端点。你自己在国内网络环境下大概率也会遇到同样的情况。

**主表里的每一个仓库，我都逐个调用过上面那个端点，全部返回 200。** 我没有验证过的仓库，一个都没写进主表。

---

## 1. 名词先扫盲（小白请先读这一节）

不然后面全是天书。

| 术语 | 大白话解释 |
| --- | --- |
| **Agent（智能体）** | 不只是"聊天"，而是能自己调用工具、读文件、跑命令、看结果再决定下一步的 AI。 |
| **Skill（技能包）** | 一个装说明书的文件夹。核心是一个 `SKILL.md` 文件，里面用 Markdown 写"遇到 X 情况时，按这 1-2-3 步做"。AI 在需要时**动态加载**它，等于临时给 AI 加一门手艺。 |
| **SKILL.md** | 技能包的标准入口文件。开头是一小块 YAML（叫 frontmatter），写技能名字和"什么时候该用我"；下面是正文指令。 |
| **Subagent（子代理）** | 主 AI 把一个大任务拆开，派几个"小弟"各自去干。小弟有独立的上下文，不占用主 AI 的"记忆"，干完把结论汇报回来。 |
| **Workflow / 编排（Orchestration）** | 规定"谁先干、谁后干、干完交给谁"。有的用有向无环图（DAG，就是一张"谁依赖谁"的箭头图）描述。 |
| **Loop（循环）** | 让 AI 反复跑同一套流程（发现任务 → 干活 → 验证 → 记录 → 再来一轮），而不是你每次手动敲一句提示词。 |
| **Context（上下文）** | AI 一次能"看到"的内容总量。内容太长会"记不住"（叫 context rot，上下文腐化），所以有各种压缩、外置记忆、断点续跑的技术。 |
| **Harness（执行外壳）** | 包在模型外面的那层程序，负责给模型工具、循环、权限。Claude Code、Codex CLI、Cursor 都是 harness。上面这些技能包，基本都要装进某个 harness 才有用。 |
| **Spec-driven development（规格驱动开发）** | 先让 AI 把需求和设计写成规格文档，你签字确认，再允许它写代码。防止 AI 一上来就乱写。 |
| **YAML frontmatter** | 文件开头用 `---` 包起来的一小段结构化配置。 |

---

## 2. 技能包 / Skills 合集

这一类的共同点：**把"方法论"写成 AI 能加载的 `SKILL.md`**，你装上去以后，AI 的行为方式会真的改变。

### 2.1 `obra/superpowers` ⭐ 首推

- **链接**：https://github.com/obra/superpowers
- **实测数据（2026-09-19）**：星数 **288,584** ｜ 最后推送 **2026-09-19** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：An agentic skills framework & software development methodology that works.
- **它是什么**：一套完整的软件开发方法论，打包成可组合的技能。它最核心的设计是 **bootstrap（引导）机制** —— 会话一开始就加载一段指令，让技能能在恰当时机**自动触发**，你不需要手动喊"用某某技能"。
- **能学到什么**：
  - 一套真正的开发流程长什么样：**先头脑风暴问清需求 → 拆成规格给你确认 → 写实现计划 → 派子代理逐任务实现并审查 → 收尾分支**。
  - 技能是怎么"塑造 AI 行为"的。它 README 里有一句很实在的话：计划要写得"清楚到让一个热情但没品味、没判断力、没有项目背景、还讨厌写测试的初级工程师也能照着做"。
  - 一个反直觉但重要的观点：**技能是塑造行为的代码，不是普通文档**。改动技能内容要跑评测（eval）验证，不能凭感觉改。
- **适合水平**：**中级偏上**。概念密度高，但目录结构极清晰，小白读 README + `skills/` 目录也能吸收大半。
- **注意**：仓库的 `AGENTS.md` 对 AI 贡献者非常严厉（官方称 PR 拒绝率 94%），那是给"要给它提 PR"的人看的，**你只是学习阅读，完全不受影响**。

### 2.2 `mattpocock/skills`

- **链接**：https://github.com/mattpocock/skills
- **实测数据（2026-09-19）**：星数 **265,356** ｜ 最后推送 **2026-09-18** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：Skills for Real Engineers. Straight from my .agents directory.
- **它是什么**：Matt Pocock（TypeScript 圈知名教育者）日常真正在用的技能集，从自己的 `.agents` 目录直接拿出来。
- **能学到什么**：README 里有一段非常值得小白读的**设计哲学对比**——它点名批评 GSD、BMAD、Spec-Kit 这类"重流程"方案：**它们替你接管了流程，代价是你失去了控制权，而且流程本身的 bug 很难排查。** 所以这套技能刻意做得**小、易改、可组合**。
  - 它还给了两种安装方式的取舍：官方插件 = **订阅**（只读、作者更新你就更新）；`skills.sh` 复制进项目 = **fork**（可编辑、能改成你自己的）。
- **适合水平**：**中级**。文件少（仓库仅约 1.8MB），但预设你有真实工程经验。
- **小白提示**：这段话本身就值回票价——它教你**对"重流程框架"保持警惕**，这是很多新手会踩的坑。

### 2.3 `anthropics/skills`（官方标准范例）⭐ 必读

- **链接**：https://github.com/anthropics/skills
- **实测数据（2026-09-19）**：星数 **177,060** ｜ 最后推送 **2026-09-10** ｜ 许可证：**API 未返回 license 字段** ｜ 已归档：**否**
- **描述（API 原文）**：Public repository for Agent Skills
- **它是什么**：Anthropic 官方的技能范例库，同时包含 **Agent Skills 规范**和**技能模板**。
- **许可证的真实情况**（我实际拆包看过，不是猜的）：
  - 仓库**根目录没有 LICENSE 文件**，API 的 license 字段为空。
  - 但每个技能子目录里有 `LICENSE.txt`：19 个技能里 **18 个有**（只有 `doc-coauthoring` 没有）。
  - README 明确说明：多数技能开源（Apache 2.0）；但 `docx` / `pdf` / `pptx` / `xlsx` 这 4 个支撑 Claude 文档能力的技能是 **source-available（源码可见但非开源）**。
- **能学到什么**：
  - **技能包的标准长什么样**：这是"一手规范"，不是二手转述。
  - `template/SKILL.md` —— 官方技能模板，**你想自己写第一个技能，从这里抄结构最快**。
  - `spec/agent-skills-spec.md` —— 内容只有一行：规范已迁到 https://agentskills.io/specification 。等于给你指了官方规范所在地。
  - 19 个技能覆盖创意设计、开发技术、企业沟通、文档处理，都是可读的真实范例。
- **适合水平**：**小白最适合从这里开始**（配合中文版，见 2.4）。

### 2.4 `jnMetaCode/superpowers-zh`（中文版，小白第一站）⭐

- **链接**：https://github.com/jnMetaCode/superpowers-zh
- **实测数据（2026-09-19）**：星数 **8,150** ｜ 最后推送 **2026-09-17** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：🦸 AI 编程超能力 · 中文增强版 — superpowers（250k+ ⭐）完整汉化 + 4 个中国原创 skills，让 Claude Code / Copilot CLI / Hermes Agent / Cursor / Windsurf / Kiro / Gemini CLI / Qoder 等 26 款 AI 编程工具真正会干活
- **它是什么**：`obra/superpowers` 的**中文翻译加强版**（fork）。
- **能学到什么**：
  - **同样的方法论，用中文讲一遍**——对小白这是决定性的优势。
  - 它比上游多了 4 个**中国原创技能**：`chinese-code-review`、`chinese-commit-conventions`、`chinese-documentation`、`chinese-git-workflow`。这些解决的是国内团队的实际习惯问题（提交信息规范、中文文档、评审话术），上游没有。
  - 它还顺带演示了**一个技能包怎么适配 26 种不同工具**——这本身就是很好的工程范例。
- **适合水平**：**入门首选**。中文、结构清晰、技能数量适中（20 个）。

### 2.5 其他技能合集（均已验证，作为"资源和索引"用）

| 仓库 | 星数 | 最后推送 | 许可证 | 它是什么 / 学什么 |
| --- | --- | --- | --- | --- |
| [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | 96,496 | 2026-09-18 | MIT | Addy Osmani 出品的"生产级"工程技能。**亮点是把技能映射到开发生命周期**：`/spec → /plan → /build → /test → /review → /ship` 共 9 个斜杠命令。适合想看"技能如何覆盖完整流程"的人。 |
| [`ComposioHQ/awesome-claude-skills`](https://github.com/ComposioHQ/awesome-claude-skills) | 75,302 | 2026-09-18 | 无 | 精选清单（awesome list），本身不是技能，是**索引**。适合当"资源黄页"逛。 |
| [`hesreallyhim/awesome-claude-code`](https://github.com/hesreallyhim/awesome-claude-code) | 54,287 | 2026-09-19 | NOASSERTION | 老牌 Claude Code 资源精选集，技能、代理、状态栏、插件都有。同样是**索引**。 |
| [`github/awesome-copilot`](https://github.com/github/awesome-copilot) | 39,151 | 2026-09-18 | MIT | **GitHub 官方**出的 Copilot 指令/代理/技能集合。想看非 Anthropic 阵营怎么组织技能，看这个。 |
| [`wshobson/agents`](https://github.com/wshobson/agents) | 39,789 | 2026-09-19 | MIT | 跨 harness 的代理插件市场（Claude Code、Codex、Cursor、Copilot、Antigravity、Pi 都支持）。**学"一套技能怎么同时兼容多个工具"**。 |
| [`VoltAgent/awesome-agent-skills`](https://github.com/VoltAgent/awesome-agent-skills) | 34,581 | 2026-09-15 | MIT | 号称收录 1000+ 技能，来自官方团队和社区。体积很小（约 791KB），适合快速浏览分类。 |
| [`travisvn/awesome-claude-skills`](https://github.com/travisvn/awesome-claude-skills) | 15,111 | 2026-04-28 | 无 | 另一个精选清单。**注意：最后推送是 2026-04-28，明显比同类旧**，参考价值在下降。 |

> **怎么用这一类清单**：它们是"目录"，不是"教材"。别指望读清单学会技能，要去读清单里指向的具体仓库。

---

## 3. 工作流编排 / 多智能体模板

这一类的共同点：**解决"多个步骤/多个代理怎么协同"**。

### 3.1 `VoltAgent/awesome-claude-code-subagents`（子代理模板的标本库）

- **链接**：https://github.com/VoltAgent/awesome-claude-code-subagents
- **实测数据（2026-09-19）**：星数 **25,190** ｜ 最后推送 **2026-09-14** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：A collection of 100+ specialized Claude Code subagents covering a wide range of development use cases
- **它是什么**：161+ 个子代理定义，分 10 大类。
- **能学到什么**（我拆包读了它的 `CLAUDE.md`，以下格式说明来自实际文件）：
  - **子代理文件的标准格式**：Markdown + YAML frontmatter，三个字段 `name`（名字）、`description`（**什么时候该调用我**，这是自动选择的关键）、`tools`（允许用哪些工具）。
  - **一个非常重要的安全实践：按角色分配工具权限**：
    | 角色类型 | 授予的工具 |
    | --- | --- |
    | 只读（评审、审计） | `Read, Grep, Glob` |
    | 研究（分析） | `Read, Grep, Glob, WebFetch, WebSearch` |
    | 写代码（开发者） | `Read, Write, Edit, Bash, Glob, Grep` |
    | 文档 | `Read, Write, Edit, Glob, Grep, WebFetch, WebSearch` |
    - 意思是：**评审员不该有写权限**。这是"最小权限原则"在智能体上的落地，小白很容易忽略。
  - **子代理存放位置**：项目级 `.claude/agents/`（只对本项目生效，优先级高）vs 全局 `~/.claude/agents/`（所有项目生效）。
  - 10 个分类：核心开发、语言专家、基础设施、质量与安全、数据与 AI、开发者体验、专业领域、商业产品、**元编排（多代理协调）**、研究分析。
- **适合水平**：**初级到中级都合适**。单个代理文件不长，格式统一，非常适合当"抄格式"的模板。

### 3.2 `Fission-AI/OpenSpec`（规格驱动开发）

- **链接**：https://github.com/Fission-AI/OpenSpec
- **实测数据（2026-09-19）**：星数 **69,427** ｜ 最后推送 **2026-09-18** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：Spec-driven development (SDD) for AI coding assistants.
- **它是什么**：让 AI 先写规格、你确认后再写代码的一整套流程工具。
- **能学到什么**：它的 README 把设计哲学写得很直白——`fluid not rigid`（流动而非僵硬）、`iterative not waterfall`（迭代而非瀑布）。**核心价值是理解"为什么要在写代码前卡一道规格关"**，以及怎么避免把 AI 辅助开发做成新的瀑布模型。
- **适合水平**：中级。适合已经被 AI"改需求改到崩溃"过、想找解决方案的人。

### 3.3 `bmad-code-org/BMAD-METHOD`（敏捷 AI 开发方法论）

- **链接**：https://github.com/bmad-code-org/BMAD-METHOD
- **实测数据（2026-09-19）**：星数 **53,198** ｜ 最后推送 **2026-09-18** ｜ 许可证 **NOASSERTION**（非标准许可证，用之前自己看一眼） ｜ 已归档：**否**
- **描述（API 原文）**：Breakthrough Method for Agile Ai Driven Development
- **能学到什么**：一套完整的"用 AI 做敏捷开发"的角色化方法（分析师、产品经理、架构师、开发、QA 等角色分工）。
- **适合水平**：中级。体系庞大（仓库约 52MB），**不建议小白第一个啃**。
- **⚠️ 提醒**：`mattpocock/skills` 的 README 里明确点名批评了 BMAD 这类"接管流程"的方案，认为会削弱你的控制权。**两种观点都值得看，自己判断。**

### 3.4 `openai/openai-agents-python`（代码级编排框架）

- **链接**：https://github.com/openai/openai-agents-python
- **实测数据（2026-09-19）**：星数 **29,554** ｜ 最后推送 **2026-09-18** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：A lightweight, powerful framework for multi-agent workflows
- **它是什么**：OpenAI 官方的多智能体工作流**代码框架**（Python）。
- **能学到什么**：注意——这一类是**写代码用的库**，不是"装上去就生效的技能包"。如果你想理解**多代理交接（handoff）、任务分派在代码层面怎么实现**，这里是最清楚的官方实现。
- **适合水平**：**会写 Python 的中级用户**。纯小白请跳过。

### 3.5 其他编排类（均已验证）

| 仓库 | 星数 | 最后推送 | 许可证 | 它是什么 / 学什么 |
| --- | --- | --- | --- | --- |
| [`bytedance/deer-flow`](https://github.com/bytedance/deer-flow) | 82,666 | 2026-09-19 | MIT | 字节跳动的**长周期（long-horizon）超级代理外壳**：沙箱、记忆、工具、技能、子代理、消息网关。任务可以跑几分钟到几小时。想学"长任务怎么不跑飞"可以看。仓库约 67MB。 |
| [`The-Pocket/PocketFlow`](https://github.com/The-Pocket/PocketFlow) | 11,179 | 2026-07-26 | MIT | **"100 行 LLM 框架"**——用极少的代码讲清智能体编排的本质。**教学价值极高**。注意最后推送是 2026-07-26，稍旧。 |
| [`Untrivial-ai/agent-orchestrator`](https://github.com/Untrivial-ai/agent-orchestrator) | 12,176 | 2026-09-18 | Apache-2.0 | 从"规划到合并"监督一队编码代理，支持 25+ 种 harness。**注意仓库约 288MB，不要随便下载。** |

---

## 4. 循环工程 / Loop 与自主执行

这一类回答的是：**怎么让 AI 自己一轮一轮跑下去，而不是你一直坐在那儿敲提示词。**

### 4.1 `cobusgreyling/loop-engineering` ⭐ 本类最对口

- **链接**：https://github.com/cobusgreyling/loop-engineering
- **实测数据（2026-09-19）**：星数 **11,253** ｜ 最后推送 **2026-09-19** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：Practical patterns, starters & CLI tools for loop engineering with AI coding agents. Design systems that prompt and orchestrate agents (inspired by Addy Osmani and Boris Cherny). Includes loop-audit, loop-init, loop-cost.
- **它是什么**：**"循环工程"这个概念最系统的公开资料**。一句话概括它的主张：**别再去敲下一句提示词了，去设计那个自动给代理派活的系统。**
- **能学到什么**（我拆包看过实际目录）：
  - **一个循环的四个环节**：发现工作 → 交给代理 → 验证结果 → **持久化状态**。
  - **现成的循环模式库**（`patterns/`）：`daily-triage`（每日分诊）、`pr-babysitter`（盯着 PR）、`ci-sweeper`（清理 CI）、`dependency-sweeper`（依赖清理）、`issue-triage`、`changelog-drafter`、`post-merge-cleanup`、`thin-loop`。
  - **非常重要的安全实践**：README 明确说 **"第一周只做报告（report-only）"**。先让循环只观察、只汇报，不要一上来就允许它改代码。**这是小白最该记住的一条。**
  - **预算与护栏**：仓库根目录就有 `loop-budget.md`、`loop-constraints.md`、`gate.yaml`、`loop-run-log.md`、`STATE.md`——**循环要有预算上限、约束条件和运行日志**，不是无限放养。
  - **有中文 README**（`README.zh-CN.md`），对中文读者友好。
  - 现成命令：`npx @cobusgreyling/loop init . --pattern daily-triage --tool claude`，之后 `loop doctor .` 体检。
- **适合水平**：**中级**，但概念讲得清楚，是小白理解"什么是循环"的最佳入口。

### 4.2 `OthmanAdi/planning-with-files`（断点续跑 / 抗遗忘）

- **链接**：https://github.com/OthmanAdi/planning-with-files
- **实测数据（2026-09-19）**：星数 **26,985** ｜ 最后推送 **2026-09-18** ｜ 许可证 **MIT** ｜ 已归档：**否**
- **描述（API 原文）**：Persistent file-based planning for AI coding agents and long-running tasks. Crash-proof markdown plans, session recovery after /clear and compaction, per-turn re-injection against context rot, deterministic completion gate. Manus-style.
- **它是什么**：**把计划写到文件里，而不是留在对话里。**
- **能学到什么**：这条正好补上循环工程的关键弱点——**上下文会丢**：
  - 计划存成 Markdown 文件 → 程序崩了 / 你敲了 `/clear` / 上下文被压缩了，**都能恢复**。
  - `per-turn re-injection`：每一轮都把关键计划重新塞回 AI 眼前，对抗"上下文腐化"（context rot，聊太长就忘事）。
  - `deterministic completion gate`：用确定性的规则判断"任务到底完成没有"，而不是让 AI 自己说"我完成了"。
- **适合水平**：**中级**。概念简单但非常实用，是"长任务不跑偏"的必修课。

### 4.3 其他循环类（均已验证）

| 仓库 | 星数 | 最后推送 | 许可证 | 它是什么 / 学什么 |
| --- | --- | --- | --- | --- |
| [`open-gsd/gsd-core`](https://github.com/open-gsd/gsd-core) | 9,603 | 2026-09-19 | MIT | "Git. Ship. Done"。规格驱动 + 让代理**长时间自主工作而不丢失大局观**。注意默认分支是 `next` 不是 `main`。 |
| [`Q00/ouroboros`](https://github.com/Q00/ouroboros) | 6,033 | 2026-09-15 | MIT | "Agent OS"：访谈把关（interview-gated）、分阶段评估、**有预算的进化循环**。支持 14 种运行时。 |
| [`huangruiteng/loopx`](https://github.com/huangruiteng/loopx) | 5,894 | 2026-09-19 | Apache-2.0 | 长周期代理的**控制平面**：把 Goal、Todo、门禁（gate）、证据、配额、恢复、交接状态持久化在 harness 之上。想深入"状态机 + 断点续跑"看这个。 |

---

## 5. 官方一手资料

**为什么要读官方**：二手文章的术语经常是错的或过期的。规范类的东西必须看一手。

| 仓库 | 星数 | 最后推送 | 许可证 | 它是什么 / 学什么 |
| --- | --- | --- | --- | --- |
| [`anthropics/skills`](https://github.com/anthropics/skills) | 177,060 | 2026-09-10 | 见 2.3 说明 | **Agent Skills 规范的官方范例库**。含规范指针、技能模板、19 个真实技能。**学技能包从这里开始。** |
| [`anthropics/claude-cookbooks`](https://github.com/anthropics/claude-cookbooks) | 52,812 | 2026-09-18 | MIT | Anthropic 官方的 notebook / 配方集。**注意：仓库约 217MB**，别整包下载。 |
| [`anthropics/claude-plugins-official`](https://github.com/anthropics/claude-plugins-official) | 36,482 | 2026-09-18 | Apache-2.0 | **Anthropic 官方维护的插件目录**（高质量插件白名单）。想知道"官方认可的做法长什么样"看这个。 |
| [`openai/openai-cookbook`](https://github.com/openai/openai-cookbook) | 76,064 | 2026-09-18 | MIT | OpenAI 官方示例与指南。**⚠️ 仓库约 972MB（接近 1GB），绝对不要 clone。** |
| [`openai/openai-agents-python`](https://github.com/openai/openai-agents-python) | 29,554 | 2026-09-18 | MIT | OpenAI 官方多代理框架（Python）。见 3.4。 |
| [`vercel/ai`](https://github.com/vercel/ai) | 26,834 | 2026-09-19 | NOASSERTION | Vercel AI SDK，TypeScript 生态的 AI 工具包。**⚠️ 仓库约 393MB，不要整包下载。** |
| [`anthropics/claude-agent-sdk-python`](https://github.com/anthropics/claude-agent-sdk-python) | 8,129 | 2026-09-19 | MIT | Anthropic 官方 Agent SDK（Python）。想用代码搭代理看这个。API 没返回描述文字，我不编。 |

---

## 6. 小白该按什么顺序读（重要）

**结论：不要从星数最高的开始。星数 ≠ 适合你。**

我建议这个顺序，每一步都有明确理由：

### 第 1 步：先建立"技能包"的概念 —— `jnMetaCode/superpowers-zh`
**为什么先读它**：中文、MIT、结构清晰、20 个技能不多不少。你要先搞明白"一个 `SKILL.md` 里到底写了什么"、"技能是怎么被触发的"。用母语建立概念，成本最低。
**读什么**：根目录 `README.md` → `skills/brainstorming/SKILL.md`（看它怎么"逼你想清楚要做什么"）→ `skills/test-driven-development/SKILL.md`。
**读完你应该能回答**：一个技能包最少需要哪些文件？

### 第 2 步：再看官方标准，校准认知 —— `anthropics/skills`
**为什么第二个读**：你从中文版学到的概念，需要用**官方规范**校准一遍，避免学到翻译偏差或社区私货。这是"一手资料"。
**读什么**：根目录 `README.md` → `template/SKILL.md`（**官方模板，抄它结构**）→ `skills/skill-creator/SKILL.md`（教你写技能）→ 随便挑 2 个简单技能看。
**读完你应该能回答**：SKILL.md 的 frontmatter 最少要哪几个字段？

### 第 3 步：理解完整方法论 —— `obra/superpowers`
**为什么第三个读**：先有零件（单个技能），再看整机（技能如何组成方法论）。这个仓库是同类里星数最高的，而且它的核心机制 **bootstrap（让技能自动触发）** 是别处学不到的。
**读什么**：`README.md` 的"How it works"一节 → `skills/` 下 15 个技能挑 4 个：`brainstorming`、`writing-plans`、`subagent-driven-development`、`verification-before-completion`。
**读完你应该能回答**：为什么技能"装在磁盘上"不等于"会被用到"？

### 第 4 步：从"敲提示词"升级到"设计循环" —— `cobusgreyling/loop-engineering`
**为什么第四个读**：前三步都在讲"单次任务怎么做对"，这一步讲**"怎么让它自己一轮轮跑"**，是能力上的台阶。
**读什么**：`README.zh-CN.md`（中文）→ `patterns/daily-triage.md` → 根目录 `loop-budget.md` 和 `gate.yaml`（**理解"护栏"和"预算"为什么必须有**）。
**读完你应该能回答**：为什么第一周必须 report-only（只报告不改代码）？

### 第 5 步：学会写子代理 —— `VoltAgent/awesome-claude-code-subagents`
**为什么第五个读**：循环要跑起来，需要"分工"。这个仓库是**抄格式最方便**的模板库。
**读什么**：`CLAUDE.md`（格式规范）→ `.claude/agents/` 里挑 3 个不同角色的代理对比看 → 重点看 `tools:` 那一行**为什么每个角色不一样**。
**读完你应该能回答**：为什么评审类代理不应该有 `Write` 权限？

### 第 6 步（选读）：解决长任务遗忘 —— `OthmanAdi/planning-with-files`
**为什么最后**：它是"补丁"型技能，解决的是你**已经跑过长任务、被上下文丢失坑过**之后才会真正痛的问题。没踩过坑，读了记不住。

### 一句话路线图

```
概念(中文) → 规范(官方) → 方法论(整机) → 循环(自主) → 分工(子代理) → 长任务(抗遗忘)
superpowers-zh → anthropics/skills → obra/superpowers → loop-engineering → subagents → planning-with-files
```

### 三条给小白的原则（都是上面仓库里反复出现的）

1. **先只读不写。** 让 AI 先观察、先报告、先出计划，你确认后才允许改代码。（`loop-engineering` 的"第一周 report-only"、`superpowers` 的"先头脑风暴再写码"、`OpenSpec` 的"先规格后代码"，说的都是同一件事。）
2. **评审者的权限要低于生产者。** 审计、评审类代理只给读权限。（`awesome-claude-code-subagents` 的工具分配表。）
3. **别一次上重流程。** 先抄一两个小技能，跑通，再考虑整套方法论。（`mattpocock/skills` 明确警告重流程框架会夺走控制权。）

---

## 7. 已下载（实测结果）

下载目录：`D:\桌面\deepseek\study\`，每个仓库一个子目录。压缩包保留在 `study\_archives\`。

**下载方式**（因为 `github.com` 直连不可用，走 API 的 tarball 端点）：

```powershell
curl.exe -sSL --max-time 600 -o out.tar.gz "https://api.github.com/repos/<owner>/<repo>/tarball/<branch>"
tar.exe -xzf out.tar.gz -C <目标目录> --strip-components=1
```

下表所有数字都是**解包后我在本地实际数出来的**，不是从 API 抄的。

| # | 仓库 | 本地路径 | 文件数 | 解包后大小 | SKILL.md 数量 | 结构要点（我实际看到的） |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `anthropics/skills` | `study\anthropics__skills\` | **419** | **10.48 MB** | **20** | 顶层：`skills/`（19 个技能目录）、`spec/`（只有 `agent-skills-spec.md`，内容是一行指向 agentskills.io 的跳转）、`template/SKILL.md`、`README.md`、`.claude-plugin/`、`THIRD_PARTY_NOTICES.md`。**根目录无 LICENSE**；18 个技能子目录各有 `LICENSE.txt`。 |
| 2 | `obra/superpowers` | `study\obra__superpowers\` | **231** | **1.88 MB** | **15** | `skills/` 下 15 个技能：brainstorming、writing-plans、executing-plans、subagent-driven-development、test-driven-development、systematic-debugging、verification-before-completion、requesting-code-review、receiving-code-review、dispatching-parallel-agents、using-git-worktrees、finishing-a-development-branch、writing-skills、diagnosing-superpowers、using-superpowers。另有 `hooks/`、`scripts/`、`docs/`、`tests/` 和 **9 个不同 harness 的插件配置目录**（`.claude-plugin`、`.codex-plugin`、`.cursor-plugin`、`.devin-plugin`、`.hermes-plugin`、`.kimi-plugin`、`.muse-plugin`、`.opencode`、`.pi`）。 |
| 3 | `jnMetaCode/superpowers-zh` | `study\jnMetaCode__superpowers-zh\` | **212** | **1.95 MB** | **20** | `skills/` 下 20 个技能：14 个上游翻译 + 4 个中国原创（`chinese-code-review`、`chinese-commit-conventions`、`chinese-documentation`、`chinese-git-workflow`）+ `mcp-builder`、`workflow-runner`。含 `README.zh-Hant.md`（繁体）。**⚠️ 有 1 个文件没解出来，见下。** |
| 4 | `cobusgreyling/loop-engineering` | `study\cobusgreyling__loop-engineering\` | **702** | **3.55 MB** | **41** | `patterns/`（8 个循环模式 + `registry.yaml`/`registry.schema.json`）、`templates/`（含 `GOAL.md.template`、`gate.yaml.template`、`loop-budget.md.template` 等 11 个 `SKILL.md.*` 模板）、`skills/`（7 个正式技能）、`starters/`（**33 个 SKILL.md**，最大的技能来源）、`tools/`（1 个）、`examples/`、`stories/`、`docs/`。根目录有 `LOOP.md`、`STATE.md`、`gate.yaml`、`loop-budget.md`、`loop-constraints.md`、`loop-run-log.md`，以及**中文 README（`README.zh-CN.md`）**。 |
| 5 | `VoltAgent/awesome-claude-code-subagents` | `study\VoltAgent__awesome-claude-code-subagents\` | **196** | **1.16 MB** | **0** | **这个仓库不用 SKILL.md，用的是子代理定义文件。** `categories/` 下 10 个分类（01-core-development、02-language-specialists、03-infrastructure、04-quality-security、05-data-ai、06-developer-experience、07-specialized-domains、08-business-product、09-meta-orchestration、10-research-analysis），全仓库 **179 个 `.md` 文件**。另有 `.claude-plugin/`、`tools/`、`install-agents.sh`、`CLAUDE.md`。README 自称 161+ 个子代理。 |

**合计：5 个仓库，1,760 个文件，约 19.0 MB。**

### 7.1 下载过程中的一次真实失败（以及怎么解决的）

`anthropics/skills` **第一次下载失败**：`curl` 在 180 秒超时被中断，只拿到 3,356,904 / 3,797,223 字节，tar 报 `Truncated tar archive detected`。

**我没有假装成功**，而是改用更长的超时（`--max-time 600`）重试，**第二次成功**（3,708.2 KB，exit=0，tar exit=0）。上表里的数字全部来自第二次成功的那份。

### 7.2 一处解包异常（已量化影响）

解包 `jnMetaCode/superpowers-zh` 时 tar 报：

```
AGENTS.md: Can't create '\\?\D:\????\deepseek\study\jnMetaCode__superpowers-zh\AGENTS.md': Invalid argument
```

这是我所在环境的已知问题：**解包目标路径含中文（`桌面`）时，个别文件名会触发编码错误**。

我做了比对来量化影响（列出压缩包内条目 vs 磁盘实际文件）：**压缩包内 213 个文件条目，磁盘上缺 1 个，就是 `AGENTS.md`。** 其余 212 个全部正常解出。

**影响评估**：`AGENTS.md` 在该仓库里是"给 AI 贡献者的行为守则"（内容和 `CLAUDE.md` 高度重复，我读过 `CLAUDE.md`，是同一份中文贡献者指南）。**对学习技能包内容几乎没有影响。** 如果你需要它，可以直接在 GitHub 网页上打开：https://github.com/jnMetaCode/superpowers-zh/blob/main/AGENTS.md

---

## 8. 我没能验证 / 没能下载的部分（如实说明）

**这一节很重要——以下内容都不在主表里，请不要当成已验证的结论。**

### 8.1 明确未验证的

| 项目 | 状态 | 原因 |
| --- | --- | --- |
| `agentskills.io/specification` | **未验证** | `anthropics/skills` 的 `spec/agent-skills-spec.md` 里写明规范迁到了这个网址。我**只读到这个跳转声明，没有实际访问该站点**，所以不对其内容作任何描述。 |
| 搜索中看到但**未逐个调用 `/repos/` 端点**的仓库 | **未验证** | 包括 `lobehub/lobehub`、`langgenius/dify`、`ruvnet/ruflo`、`Fission-AI` 之外的若干高星项目。它们出现在 GitHub 搜索 API 结果里（搜索服务同样来自 api.github.com），但我**没有对它们做单仓库端点确认**，因此一律不写进主表、不引用其数字。 |
| `FlowiseAI/Flowise` | **未验证**（但搜索结果显示 `archived=true`） | 搜索 API 返回其 `archived` 为真、星数 55,469。因未做单仓库确认，不进主表。 |
| 各类"awesome"清单里**指向的其他仓库** | **未验证** | 清单本身（如 `ComposioHQ/awesome-claude-skills`）已验证存在；但清单**里面列的项目**我没有一个个验证。 |

### 8.2 未下载的（附原因）

我**故意只下载了 5 个**——用户是小白，堆 10 个压缩包只会让人更懵。以下仓库已验证存在但**没有下载到本地**：

| 仓库 | 未下载原因 |
| --- | --- |
| `mattpocock/skills`（265,356★） | 体积很小（约 1.8MB），**本可下载**。把它排在下载清单外，是为了避免一次给出两份"技能框架"造成概念重复（它和 `obra/superpowers` 定位重叠）。**这是取舍，不是失败。** 想学随时可以自己下。 |
| `openai/openai-cookbook` | **仓库约 972 MB（接近 1GB）**，不适合下载。 |
| `vercel/ai` | **仓库约 393 MB**，不适合下载。 |
| `Untrivial-ai/agent-orchestrator` | **仓库约 288 MB**，不适合下载。 |
| `anthropics/claude-cookbooks` | **仓库约 217 MB**，不适合下载。 |
| `github/awesome-copilot` | 约 113 MB，偏大且以清单为主。 |
| `bmad-code-org/BMAD-METHOD` | 约 52 MB，且不建议小白从它入手。 |
| `huangruiteng/loopx` | 约 86 MB。 |
| `open-gsd/gsd-core` | 约 70 MB。 |
| `bytedance/deer-flow` | 约 67 MB。 |
| `Q00/ouroboros` | 约 54 MB。 |
| `The-Pocket/PocketFlow` | 约 52 MB；且最后推送为 2026-07-26，比同类旧。 |
| 其余技能合集清单类 | 内容主要是外链索引，下载到本地意义不大，在线看即可。 |

### 8.3 环境限制说明

- **`github.com` 直连不可用**：`git clone https://github.com/...` 会失败（`Failed to connect to github.com:443`）。因此**没有提供 commit hash 级的版本锁定**——tarball 端点按分支名下载，拿到的是下载当时的快照。如果你需要精确复现，请以各仓库 GitHub 页面上显示的提交为准。
- **GitHub API 未认证限流**：`api.github.com` 未登录时限流为 **60 次/小时**（本次调研中途实测降到过 `remaining: 8`）。搜索端点另有 **10 次/分钟** 的限流，我在调研中**确实遇到过 `API rate limit exceeded`**，等待窗口重置后重试成功。这解释了为什么本报告的验证是分批完成的。
- **`raw.githubusercontent.com`** 在本次调研中**未被使用**（任务提示它不稳定），所有文件内容均通过 `api.github.com` 或本地解包后的文件读取。

---

## 9. 附：本文所有数据的采集方式（可复现）

```powershell
# 1) 单仓库验证（主表中每个仓库都跑过）
curl.exe -sS --max-time 45 -H "Accept: application/vnd.github+json" `
  "https://api.github.com/repos/<owner>/<repo>"

# 2) 发现候选（搜索端点，10 次/分钟限流）
#    q 例：topic:agent-skills / topic:claude-skills / topic:loop-engineering /
#          superpowers in:name / org:anthropics / user:mattpocock
curl.exe -sS --max-time 60 -H "Accept: application/vnd.github+json" `
  "https://api.github.com/search/repositories?q=<query>&sort=stars&order=desc&per_page=20"

# 3) 下载（-L 跟随 302 到 codeload）
curl.exe -sSL --max-time 600 -o out.tar.gz `
  "https://api.github.com/repos/<owner>/<repo>/tarball/<branch>"
tar.exe -xzf out.tar.gz -C <目标目录> --strip-components=1
```

**所有星数、推送时间、许可证、归档状态：查询于 2026-09-19。星数会随时间变化，请以你查看时为准。**

原始验证数据留档在：`D:\桌面\deepseek\study\_archives\verified-repos.tsv`（28 个仓库的制表符分隔原始结果）。
