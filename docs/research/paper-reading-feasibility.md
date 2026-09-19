# 论文阅读辅助 · 可行性调查结论（阶段 1）

| 项 | 值 |
| --- | --- |
| 日期 | 2026-09-19 |
| 状态 | 调查完成，等用户选定默认模型后进入阶段 2 |
| 适用范围 | **本机**（Windows），跨工作区可用 |

---

## 一句话结论

本机已具备「**读 PDF 文字 + 裁剪单张图 + 视觉读图**」的完整能力，视觉引擎走**智谱 OpenAI 兼容接口**。

**免费模型可用，但只能干粗活；付费 `glm-5.3-flash` 读一张图约 1.6 分钱。**

---

## 一、已装好的工具链（全部实测通过）

| 组件 | 版本 | 用途 | 安装方式 |
| --- | --- | --- | --- |
| Python | **3.14.4** | 底座 | 已有 `D:\python\python.exe` |
| **pypdf** | 6.19.0 | PDF 文字提取 | `pip`，PyPI 可达 |
| **fontTools** | 4.65.0 | 消掉 pypdf 的字体警告 | `pip` |
| **PyMuPDF** | 1.28.2 | 整页渲染 / **裁单张图** / 抽内嵌图片 | `pip`，19.8 MB |

`pip` 与 PyPI 在本机**稳定可达**（即使 `github.com` 不通）。

---

## 二、视觉引擎：modlens + 智谱

**modlens 3.26.2** 本身不产生视觉能力，只是外挂引擎的桥。六个可选引擎里，本机**只有国内两家可达**：

| 引擎 | 端点 | 实测 |
| --- | --- | --- |
| Antigravity CLI | antigravity.google | ❌ 超时 |
| Gemini API | generativelanguage.googleapis.com | ❌ 超时 |
| Google AI Studio | aistudio.google.com | ❌ 超时 |
| OpenAI | api.openai.com | ❌ 超时 |
| Anthropic | api.anthropic.com | ⚠️ 可达（403）但需付费 key |
| **智谱 GLM** | open.bigmodel.cn | ✅ **200 / 0.70s** |
| Kimi / Moonshot | api.moonshot.cn | ✅ 200 / 1.09s |

**选定智谱。** 端点验证方式：不带 key 请求返回 **401 而非 404** = 路径真实存在。

### 配置文件 `~/.modlens/config.json`

```json
{
  "provider": "openai",
  "cooldown": "on",
  "providers": {
    "openai": {
      "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
      "apiKey": "<你的智谱 key>",
      "model": "glm-4.1v-thinking-flash",
      "extraBody": { "max_tokens": 8192 }
    }
  }
}
```

原配置备份在 `~/.modlens/config.json.bak`。

**⚠️ 坑：key 必须放在 `providers.openai.apiKey`**，不能放 `gemini-api`。放错槽位时 `provider: gemini-api` 会把请求发去 Google（本机不通），且报错完全指不到根因。

### 一行命令切换模型

```bash
# modlens 不在 PATH 上，用绝对路径调
node "%APPDATA%\dsh-desktop\harness\profiles\web\node_modules\@liustack\modlens\dist\main.js" config set openai.model <模型名>
node "...\dist\main.js" doctor        # 体检
```

---

## 三、实测数据

### 文字提取（pypdf，11 页论文）

- 51,847 字符 / **0.94 秒**
- 缺陷密度约 **6 处/千字符**：连字 `ﬁ` 103 次、标点前多空格 65 次、词被拆开 60 次、下标压平 11 次
- ✅ 希腊字母 `α β θ`、数学弧号 `⌢` **正常保留**
- **结论：够用**，缺陷是噪音级别，不影响理解

### 视觉读图（同一张裁出的图，671×787）

| | 付费 `glm-5.3-flash` | **免费 `glm-4.1v-thinking-flash`** |
| --- | --- | --- |
| 耗时 | **99.3 秒** | **11.3 秒（快 9 倍）** |
| tokens | 6640（其中思考 3304） | 2070 |
| 成本 | ≈0.0165 元 | **0 元** |
| 输出结构 | 完整 schema | 完整 schema |
| **语义解读** | ✅ 准确具体：「机器人触觉传感/压入实验…Depth=2mm/33A 印记最明显」 | ⚠️ 笼统：「Scientific experimental setup」 |
| 实体识别 | 协作机械臂 / 触觉传感器 / **Mold 模具** | 泛化（robotic arm / force sensor） |
| relations | ✅ 有 | ❌ 无 |
| 不确定项 | 5 条 | 1 条 |
| 语言 | 中文 | 英文 |

**可选项清单（智谱定价表实测）**

| 模型 | 输入/输出单价（元/百万） | 输出上限 | 状态 |
| --- | --- | --- | --- |
| `glm-5.3-flash` | 0.8 / 2.8 | 高 | ✅ 质量最好，慢 |
| `glm-4.1v-thinking-flash` | **免费 / 免费** | ≥8192 | ✅ **跑通，快 9 倍，粗活** |
| `glm-4.6v-flash` | **免费 / 免费** | 待测 | ⚠️ **429 限流**，待重试 |
| `glm-4.6v-flashx` | 0.15 / 1.5 | ≥8192 | 未测 |
| `glm-4v-flash` | 免费 | **≤1024** | ❌ **不可用**（见下） |
| `glm-ocr` | 0.2 / 0.2 | — | ❌ 400（非 chat 接口） |

---

## 四、成本（付费模型）

单价：输入 **0.8 元/百万**，输出 **2.8 元/百万**

```
输入  1063 ÷ 100万 × 0.8 = 0.00085 元
输出  5577 ÷ 100万 × 2.8 = 0.01562 元
                   合计 ≈ 0.0165 元/张
```

- **1 元 ≈ 读 60 张图**
- 一篇论文全部图表读一遍 ≈ **几毛钱**
- ⚠️ **思考 token 占输出的 59%**（3304/5577），即六成的钱花在"想"上，而 `glm-5.3-flash` 的思考模式**只能开不能关**

---

## 五、踩过的坑（下次别再踩）

1. **PowerShell 5.1 读无 BOM 的 UTF-8 脚本会把中文当 ANSI 解码** → 路径字面量失效，脚本静默秒退。`.ps1` **必须存 UTF-8 with BOM**
2. **`modlens_read_image` 按「图片 + 提问」缓存结果**。换模型后拿同一张图重新提问，会原样返回上次的答案，**看似有效其实无效**。要对照就换图片或换提问，或用 CLI 直调
3. **`glm-4v-flash` 的 `max_tokens` 硬上限是 1024**（服务端拒绝：`限制数值范围[1,1024]`）。modlens 的完整证据 JSON 远超此值 → **必然输出半截 → 必然失败**。这是模型限制，改配置绕不过
4. **给"思考型"模型设 `max_tokens` 会饿死正文**：思考 token 也算进额度，额度太小 → 正文为空 → `returned no message content`
5. **`extraBody` 不要经 PowerShell 传参**：引号会被吃掉（`is not valid JSON`）。**直接用 Python 改 `config.json`** 最可靠
6. **PDF 切词问题与 fontTools 无关**：装上 fontTools 后提取结果**一个字符都没变**（6132 → 6132），它只是消掉了警告
7. **整页读很慢**（>180 秒会超时）。**正确用法：先裁出单张图，再读那一张**

---

## 六、未决与待办

1. **默认模型选谁**——免费（快、0 成本、粗）还是付费（慢、1.6 分、准）？
2. **`glm-4.6v-flash` 待重试**——它是免费的 4.6 代，可能比 4.1v 强
3. **中文 PDF 未验证**——本机只有英文论文样例，CJK 抽取与中文论文的视觉读取都**没有实测依据**
4. **"读懂套路"本身还没设计**——本文件只解决"能不能读"，没解决"怎么读才有效"

---

## 七、复现命令

```bash
# 抽出某页的图，裁最大的一张（PyMuPDF）
python -c "import pymupdf,glob,os; d=glob.glob(r'<目录>\*.pdf')[0]; doc=pymupdf.open(d); pg=doc[6]; info=pg.get_image_info(); b=max(info,key=lambda x:(x['bbox'][2]-x['bbox'][0])*(x['bbox'][3]-x['bbox'][1])); pg.get_pixmap(clip=pymupdf.Rect(b['bbox']),dpi=200).save('fig.png')"

# 视觉读图（绕过 DSH 工具缓存）
node "<...>\@liustack\modlens\dist\main.js" analyze -i fig.png -m <模型> -p openai --timeout 600000 -o out.json

# 体检
node "<...>\dist\main.js" doctor
```
