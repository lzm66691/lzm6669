# Issue tracker: Local Markdown

本仓库的 issue 与规格以 markdown 文件形式存放在 `.scratch/`。

## 约定

- 一个 feature 一个目录：`.scratch/<feature-slug>/`
- 规格是 `.scratch/<feature-slug>/spec.md`
- 实现票据一票一文件：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，从 `01` 编号，**绝不**合并成单个票据文件
- triage 状态记在票据文件靠顶部的 `Status:` 行（角色串见 `triage-labels.md`）
- 评论与对话历史追加到文件底部的 `## Comments` 标题下

## 当技能说「发布到 issue tracker」

在 `.scratch/<feature-slug>/` 下新建文件（必要时创建目录）。

## 当技能说「取出相关票据」

读取指定路径的文件。用户通常会直接给出路径或票据编号。

## Wayfinding operations

供 `/wayfinder` 使用。**地图**是一个文件，每张票据一个**子**文件。

- **地图**：`.scratch/<effort>/map.md`（承载 Notes / Decisions-so-far / Fog 正文）。
- **子票据**：`.scratch/<effort>/issues/NN-<slug>.md`，从 `01` 编号，正文写问题。`Type:` 行记录票据类型（`research`/`prototype`/`grilling`/`task`）；`Status:` 行记录 `claimed`/`resolved`。
- **阻塞**：靠顶部的 `Blocked by: NN, NN` 行。当它列出的每个文件都是 `resolved` 时，该票解除阻塞。
- **前沿（frontier）**：扫描 `.scratch/<effort>/issues/`，找未关闭、未阻塞、未被认领的文件；编号最小者优先。
- **认领**：动工前先设 `Status: claimed` 并保存。
- **解决**：在 `## Answer` 标题下追加答案，设 `Status: resolved`，然后把一条上下文指针（要点 + 链接）追加到 `map.md` 的 Decisions-so-far。

### 按名字称呼（Local Markdown 落地）

`wayfinder` 要求：在人读的一切输出里（叙述、地图的 Decisions-so-far）**用地图与票据的标题称呼它们**，不要只给裸编号或 slug。本地 markdown 没有原生标签，因此：

- 地图 = `.scratch/<effort>/map.md`；涉及多张地图时在 Notes 里声明标题，或在地图正文首行写 `Label: wayfinder:map`。
- 票据 = 其文件名去掉编号与扩展名后的标题；引用时写 `标题（NN-slug）`，编号只作为括号内的补充，不单独出现。

> **本地补充（N-10）：** 上述标签与「按名字称呼」约定来自 `wayfinder` 技能本体，**种子模板 `issue-tracker-local.md` 未含**；此处为本地落地补齐，属对上游模板的补充而非偏离。
