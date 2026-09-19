#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
论文阅读台 —— 本地网页

零第三方依赖：只用 Python 标准库 + 已经装好的 PyMuPDF / pypdf。
视觉解读直接调智谱 OpenAI 兼容接口，密钥从 ~/.modlens/config.json 复用。

用法:
    python server.py                        默认读 D:\\桌面\\新建文件夹
    set READER_DIR=别的目录 & python server.py
    set READER_PORT=9000 & python server.py
"""
import base64
import json
import os
import sys
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

try:
    import pymupdf
except ImportError:
    print("缺少 PyMuPDF，请先运行:  python -m pip install pymupdf")
    sys.exit(1)

try:
    import pypdf
except ImportError:
    pypdf = None

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DIR = r"D:\桌面\新建文件夹"
ROOT = os.environ.get("READER_DIR") or DEFAULT_DIR
PORT = int(os.environ.get("READER_PORT") or 8899)
MODLENS_CFG = os.path.join(os.path.expanduser("~"), ".modlens", "config.json")

MODELS = [
    {"id": "glm-4.1v-thinking-flash", "label": "glm-4.1v-thinking-flash（免费 / 快 / 粗）"},
    {"id": "glm-5.3-flash",           "label": "glm-5.3-flash（付费 ≈1.6分/张 / 慢 / 准）"},
    {"id": "glm-4.6v-flashx",         "label": "glm-4.6v-flashx（很便宜 0.15/1.5）"},
    {"id": "glm-4.6v-flash",          "label": "glm-4.6v-flash（免费 / 4.6代）"},
]
DEFAULT_MODEL = "glm-4.1v-thinking-flash"

_docs = {}


# ---------------------------------------------------------------- 基础工具

def get_doc(path):
    if path not in _docs:
        _docs[path] = pymupdf.open(path)
    return _docs[path]


def safe_path(raw):
    """只允许访问 ROOT 目录内的 .pdf，防目录穿越"""
    if not raw:
        return None
    p = os.path.abspath(raw)
    root = os.path.abspath(ROOT)
    try:
        if os.path.commonpath([p, root]) != root:
            return None
    except ValueError:
        return None
    if not p.lower().endswith(".pdf") or not os.path.isfile(p):
        return None
    return p


def list_papers():
    if not os.path.isdir(ROOT):
        return []
    out = []
    for n in sorted(os.listdir(ROOT)):
        if n.lower().endswith(".pdf"):
            p = os.path.join(ROOT, n)
            try:
                out.append({"name": n, "path": p, "sizeKB": round(os.path.getsize(p) / 1024)})
            except OSError:
                pass
    return out


def render_png(path, page, dpi=110, clip=None):
    doc = get_doc(path)
    if page < 0 or page >= len(doc):
        raise ValueError("页号越界: %d（共 %d 页）" % (page, len(doc)))
    kw = {"dpi": dpi}
    if clip:
        kw["clip"] = pymupdf.Rect(clip)
    return doc[page].get_pixmap(**kw).tobytes("png")


def figure_list(path, page):
    doc = get_doc(path)
    if page < 0 or page >= len(doc):
        return []
    out = []
    for i, inf in enumerate(doc[page].get_image_info()):
        b = inf["bbox"]
        out.append({"idx": i, "bbox": [round(float(v), 1) for v in b],
                    "area": round((b[2] - b[0]) * (b[3] - b[1]))})
    out.sort(key=lambda d: -d["area"])
    return out


def page_text(path, page):
    if pypdf is None:
        return "(未安装 pypdf，无法提取文字)"
    try:
        r = pypdf.PdfReader(path)
        if page >= len(r.pages):
            return ""
        return r.pages[page].extract_text() or ""
    except Exception as e:
        return "(提取失败: %r)" % (e,)


# ---------------------------------------------------------------- 视觉解读

ROLE = ("你是一位非常耐心的论文讲解员。读者是中文母语的研究生新手，"
        "英文吃力、专业术语不熟、公式图表看不懂。"
        "请一律用【中文】、用【平实的话】讲，不要照抄英文原文。")

PAGE_PROMPT = ROLE + """

这是论文的第 {page} 页（共 {total} 页）。请按下面五节输出：

## 1. 这一页在讲什么
三句话以内，说清它在整篇论文里起什么作用。

## 2. 关键内容
按小节/图表逐个讲：它在说什么、为什么重要。不要逐句翻译，要讲**意思**。

## 3. 术语表
列出这页出现的专业术语，每条一行：`英文术语 —— 中文解释（必要时打比方）`

## 4. 公式与图表
逐个说明。图表要读出坐标轴标签、刻度范围、图例含义。

## 5. 我不确定的地方
明确列出你也没有把握的部分。**不许编。**

不要输出 JSON，就用中文分节写。"""

FIGURE_PROMPT = ROLE + """

这是论文里的一张图（第 {page} 页）。请说明：

## 1. 它画的是什么
## 2. 有哪些子图（a/b/c…），各画什么
## 3. 坐标轴标签与刻度范围
## 4. 能读出的数值、图例、标注
## 5. 作者想用它证明什么
## 6. 我不确定的地方

用中文。不许编。"""


def call_model(messages, model, max_tokens=4096, timeout=600):
    cfg = json.load(open(MODLENS_CFG, encoding="utf-8"))
    oa = cfg["providers"]["openai"]
    url = oa["baseUrl"].rstrip("/") + "/chat/completions"
    body = {"model": model, "messages": messages,
            "max_tokens": max_tokens, "temperature": 0.3}
    req = urllib.request.Request(
        url,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": "Bearer " + oa["apiKey"],
                 "Content-Type": "application/json"},
        method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        j = json.loads(r.read().decode("utf-8"))
    msg = (j.get("choices") or [{}])[0].get("message") or {}
    text = (msg.get("content") or "").strip()
    if not text:
        raise RuntimeError("模型返回空内容（可能是思考 token 吃光了额度，"
                           "或该模型不支持图片）")
    return text, j.get("usage") or {}


# ---------------------------------------------------------------- HTTP 服务

class Handler(BaseHTTPRequestHandler):
    server_version = "PaperReader/0.1"

    def log_message(self, fmt, *args):
        pass

    # ---- 输出helpers
    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        if isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, obj, code=200):
        self._send(code, json.dumps(obj, ensure_ascii=False))

    def _q(self, q, k, default=""):
        v = q.get(k)
        return v[0] if v else default

    # ---- GET
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        try:
            if u.path in ("/", "/index.html"):
                with open(os.path.join(HERE, "index.html"), "rb") as f:
                    return self._send(200, f.read(), "text/html; charset=utf-8")

            if u.path == "/api/config":
                return self._json({"root": ROOT, "models": MODELS,
                                   "defaultModel": DEFAULT_MODEL,
                                   "hasPypdf": pypdf is not None})

            if u.path == "/api/papers":
                return self._json({"papers": list_papers()})

            p = safe_path(self._q(q, "path"))
            if p is None:
                return self._json({"error": "路径不合法或不在论文目录内"}, 400)

            if u.path == "/api/meta":
                doc = get_doc(p)
                return self._json({"name": os.path.basename(p), "pages": len(doc)})

            if u.path == "/api/page.png":
                page = int(self._q(q, "page", "0"))
                dpi = int(self._q(q, "dpi", "110"))
                return self._send(200, render_png(p, page, dpi), "image/png")

            if u.path == "/api/text":
                page = int(self._q(q, "page", "0"))
                return self._json({"text": page_text(p, page)})

            if u.path == "/api/figures":
                page = int(self._q(q, "page", "0"))
                return self._json({"figures": figure_list(p, page)})

            if u.path == "/api/fig.png":
                page = int(self._q(q, "page", "0"))
                idx = int(self._q(q, "idx", "0"))
                figs = figure_list(p, page)
                hit = [f for f in figs if f["idx"] == idx]
                if not hit:
                    return self._json({"error": "找不到该图"}, 404)
                dpi = int(self._q(q, "dpi", "200"))
                return self._send(200, render_png(p, page, dpi, clip=hit[0]["bbox"]),
                                  "image/png")

            return self._json({"error": "未知接口: " + u.path}, 404)
        except Exception as e:
            return self._json({"error": repr(e)}, 500)

    # ---- POST /api/ai
    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        if u.path != "/api/ai":
            return self._json({"error": "未知接口"}, 404)
        try:
            n = int(self.headers.get("Content-Length") or 0)
            req = json.loads(self.rfile.read(n).decode("utf-8") or "{}")
            p = safe_path(req.get("path"))
            if p is None:
                return self._json({"error": "路径不合法"}, 400)
            page = int(req.get("page") or 0)
            mode = req.get("mode") or "page"
            model = req.get("model") or DEFAULT_MODEL
            doc = get_doc(p)
            total = len(doc)

            if mode == "figure":
                idx = int(req.get("idx") or 0)
                figs = figure_list(p, page)
                hit = [f for f in figs if f["idx"] == idx]
                if not hit:
                    return self._json({"error": "找不到该图"}, 404)
                png = render_png(p, page, 200, clip=hit[0]["bbox"])
                prompt = FIGURE_PROMPT.format(page=page + 1)
            else:
                png = render_png(p, page, 140)
                prompt = PAGE_PROMPT.format(page=page + 1, total=total)

            b64 = base64.b64encode(png).decode("ascii")
            messages = [{"role": "user", "content": [
                {"type": "image_url",
                 "image_url": {"url": "data:image/png;base64," + b64}},
                {"type": "text", "text": prompt},
            ]}]
            import time
            t0 = time.time()
            text, usage = call_model(messages, model)
            return self._json({"text": text, "usage": usage, "model": model,
                               "seconds": round(time.time() - t0, 1),
                               "imageKB": round(len(png) / 1024)})
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:400]
            return self._json({"error": "接口 %s: %s" % (e.code, detail)}, 502)
        except Exception as e:
            return self._json({"error": repr(e)}, 500)


def main():
    if not os.path.isdir(ROOT):
        print("论文目录不存在: %s" % ROOT)
        print("用环境变量指定:  set READER_DIR=你的目录")
        sys.exit(1)
    srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = "http://127.0.0.1:%d/" % PORT
    print("=" * 56)
    print("  论文阅读台已启动")
    print("  地址      : %s" % url)
    print("  论文目录  : %s" % ROOT)
    print("  已找到    : %d 个 PDF" % len(list_papers()))
    print("  pypdf     : %s" % ("已装" if pypdf else "未装（右侧不显示文字）"))
    print("  Ctrl+C 停止")
    print("=" * 56)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")


if __name__ == "__main__":
    main()
