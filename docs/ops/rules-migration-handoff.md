# 守则迁移交接（Matt Pocock 规则）

**日期**：2026-09-19 ｜ **状态**：已完成，已推送

## 一句话

全局工程守则已从「五阶段工作流 + 三部门（研究部/工程部/质检部）+ 秘书 + `gate.yaml` 门禁」迁移为 **Matt Pocock engineering skills** 体系；`deepseek` 仓已补齐该体系依赖的 repo 级配置。

## 从哪开始

| 想做什么 | 读哪份 |
| --- | --- |
| 看**详细执行记录**（含逐任务步骤与自校验断言） | `docs/superpowers/plans/2026-09-21-matt-rules-migration.md` |
| 看**迁移前的旧守则原文**（回滚用） | 同上，文末「附录」（两份逐字留档 + SHA256） |
| 看**任务后端约定** | `docs/agents/issue-tracker.md` |
| 看**领域文档规则** | `docs/agents/domain.md` |
| 看**triage 标签词表** | `docs/agents/triage-labels.md` |
| 看**推送重试与编码坑** | `docs/ops/push-retry.md` |

## 改了什么

**全局层（`$DSH_HOME`，arg 不在 git 里）**

- `AGENTS.md` 重写：73 行 → 34 行。旧体系的五阶段表、三部门表、技能路由表全部移除；只留 **5 条红线** + 「怎么干活」（指向 `ask-matt`）+ 任务后端（按仓配置，区分「目标是仓 / 目标不是仓」）+ 成本台账。
- **删除** `docs/staged-workflow.md`（161 行）与 `docs/departments.md`（110 行）—— 内容已被 Matt 主流程与相位边界树吸收，原文逐字留在计划附录。
- `docs/project-ledger.md` 重写：去掉「阶段」时间轴与「部门返工率」节，保留项目进度与花费。

**仓层（`D:\桌面\deepseek`）**

- 新建 `AGENTS.md`，含 `## Agent skills` 三子块（Issue tracker / Triage labels / Domain docs），供 `to-tickets`、`triage`、`to-spec` 等技能定位配置。
- `docs/agents/issue-tracker.md` 按种子模板重写：`<feature-slug>` 目录约定、`Status:`/`Type:`/`## Comments`、**Wayfinding operations**（`wayfinder` 依赖）、「按名字称呼」。
- 新建 `docs/agents/domain.md`、`docs/agents/triage-labels.md`。
- 新建 `docs/ops/push-retry.md`（原 `STATE.md` 里仍有效的运维信息迁移至此）。
- **删除** `docs/workflow/gate.yaml` 与 `docs/workflow/STATE.md`（旧控制面的活文件）。
- 新建本文件。

## 必须知道的一条限制

Matt 技能按**仓根**读 `AGENTS.md`。当前默认工作区 `D:\桌面\1` 是空目录、**非 git 仓**，所以：

> **`deepseek\AGENTS.md` 的配置要等下次在 `D:\桌面\deepseek` 下开会话才会加载；在 `D:\桌面\1` 里不生效。**

全局 `AGENTS.md` 已就此给出指引：目标是仓时按仓配置，非 git 目录改用会话内约定（票据即对话中确认的任务清单）。

## 已知残留（有意保留）

1. `.scratch` 空目录 —— 保留为约定锚点（下次建 `<feature-slug>/` 要用）。
2. 历史 spec `docs/superpowers/specs/2026-09-19-departments-design.md` 含废弃概念 —— 历史文档，记录当时真实决策，不属失效引用。
3. 计划文件名日期 `2026-09-21` 与实际（2026-09-19）不符 —— 文首有日期勘误行，不改名以避免多一次提交与两个历史名字。
4. `tools/reader/index.html` 有与本迁移无关的未提交改动。

## 回滚方式

`$DSH_HOME` 无版本控制，**唯一回滚来源是计划附录**：把附录 A / B 的代码块内容写回原路径即可；两个 SHA256 可校验写回结果是否等于删除前的字节。

## 迁移经过（4 次提交 + 4 轮独立评审）

| 提交 | 内容 |
| --- | --- |
| `2b16fb1` | 首次迁移 |
| `acee025` | 修第一轮评审 11 条发现 |
| `0e62ad4` | 修第二轮评审 10 条发现 |
| `4e5b610` | 修第四轮终审 5 条发现 |

四轮评审合计抓出 26 条问题，**其中 3 条 high**（旧控制面活文件仍在、两条 always-on 规则被静默删除、N-10 改动未同步进计划）。多次问题是「计划自称的执行记录与交付物不一致」—— 教训：**改交付物必须同时改计划里对应的内容块，否则计划的「替换为以下内容」不再可复现。**
