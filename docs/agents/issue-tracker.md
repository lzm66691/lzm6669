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
