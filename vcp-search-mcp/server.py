#!/usr/bin/env python3
"""vcp-search-mcp —— 把 VCPToolBox 的搜索插件封装成标准 MCP 服务器。

一次启动即暴露 7 个搜索工具，DeepSeek Web Coding(DS) 等任意标准 MCP 客户端可直接加载。

设计要点：
- 只依赖 Python 标准库（urllib）+ `mcp` 包，无其他第三方网络依赖。
- 密钥一律在调用时从环境变量读取，绝不硬编码；支持逗号分隔多 key 随机轮询。
- 对齐 VCP 插件的端点/鉴权/调用规范（见 README 的环境变量映射表）。
- 传输层由 MCP_TRANSPORT 环境变量控制：stdio（默认）/ sse / streamable-http。

运行：
    pip install "mcp>=1.2.0"
    python server.py                 # stdio
    MCP_TRANSPORT=sse python server.py
    MCP_TRANSPORT=streamable-http python server.py
"""
from __future__ import annotations

import asyncio
import json
import os
import random
import time
from urllib import error as urlerr
from urllib import request
from urllib.parse import urlencode

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("vcp-search-mcp")

DEFAULT_TIMEOUT = 30.0


# --------------------------------------------------------------------------
# 基础 HTTP 助手
# --------------------------------------------------------------------------
def _pick_key(env_name: str) -> str:
    """逗号分隔多 key 随机取一个（对齐 VCP 多 key 轮询）。"""
    keys = [k.strip() for k in (os.getenv(env_name, "") or "").split(",") if k.strip()]
    return random.choice(keys) if keys else ""


def _require_key(env_name: str) -> str:
    key = _pick_key(env_name)
    if not key:
        raise RuntimeError(f"缺少环境变量 {env_name}。请先在环境里设置对应密钥后重试。")
    return key


def _http_json(method, url, *, headers=None, body=None, timeout=DEFAULT_TIMEOUT):
    """返回 (status, json_obj_or_None, raw_text)。HTTP 4xx/5xx 不抛异常，交给调用方处理。"""
    headers = dict(headers or {})
    data = None
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        headers.setdefault("Content-Type", "application/json")
    req = request.Request(url, data=data, method=method, headers=headers)
    try:
        with request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            status = resp.status
    except urlerr.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        status = e.code
    except urlerr.URLError as e:
        raise RuntimeError(f"网络请求失败：{e.reason}") from e
    except TimeoutError:
        raise RuntimeError(f"请求超时（>{timeout}s）。") from None
    try:
        return status, json.loads(raw), raw
    except json.JSONDecodeError:
        return status, None, raw


def _http_stream(method, url, *, headers=None, body=None, timeout=120.0):
    """流式读取，逐行返回（用于 SSE）。"""
    headers = dict(headers or {})
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    headers.setdefault("Content-Type", "application/json")
    req = request.Request(url, data=data, method=method, headers=headers)
    lines = []
    with request.urlopen(req, timeout=timeout) as resp:
        for raw_line in resp:
            try:
                lines.append(raw_line.decode("utf-8", errors="replace").rstrip("\r\n"))
            except Exception:
                continue
    return lines


async def _http_json_async(method, url, **kw):
    return await asyncio.to_thread(_http_json, method, url, **kw)


async def _http_stream_async(method, url, **kw):
    return await asyncio.to_thread(_http_stream, method, url, **kw)


def _extract_results(obj):
    """从各种搜索 API 返回结构里尽力抽出 results 列表。"""
    if not isinstance(obj, dict):
        return []
    for key in ("results", "items"):
        if isinstance(obj.get(key), list):
            return obj[key]
    data = obj.get("data") or obj.get("Data") or {}
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("results", "items", "Results", "Items"):
            if isinstance(data.get(key), list):
                return data[key]
    return []


def _format_items(items, heading, query):
    lines = [f"## {heading}：{query}", ""]
    if not items:
        lines.append("无结果。")
        return "\n".join(lines)
    for i, it in enumerate(items, 1):
        if isinstance(it, str):
            lines.append(f"{i}. {it}")
            continue
        if not isinstance(it, dict):
            continue
        title = (it.get("title") or it.get("Title") or it.get("name")
                 or it.get("Name") or "无标题")
        url = (it.get("url") or it.get("Url") or it.get("link") or it.get("Link")
               or it.get("href") or "")
        snippet = (it.get("content") or it.get("Content") or it.get("snippet")
                   or it.get("Snippet") or it.get("summary") or it.get("Summary")
                   or it.get("description") or it.get("Description")
                   or it.get("abstract") or "")
        lines.append(f"{i}. **{title}**")
        if url:
            lines.append(f"   - URL: {url}")
        if snippet:
            lines.append(f"   - {str(snippet)[:300]}")
        lines.append("")
    return "\n".join(lines).strip()


# --------------------------------------------------------------------------
# 工具 1：Tavily —— AI 原生事实搜索
# --------------------------------------------------------------------------
@mcp.tool()
async def tavily_search(
    query: str,
    search_depth: str = "advanced",
    topic: str = "general",
    max_results: int = 10,
    include_raw_content: bool = False,
    include_images: bool = False,
    time_range: str = "",
    country: str = "",
    start_date: str = "",
    end_date: str = "",
) -> str:
    """AI 原生事实搜索（Tavily）。返回标题/URL/摘要的 Markdown。

    Args:
        query: 检索词。用 | 分隔可一次并发跑多条查询，结果合并返回。
        search_depth: basic（更快）或 advanced（更深，默认）。
        topic: general / news / finance 等。
        max_results: 5-20，默认 10。
        include_raw_content: 是否附带正文原文。
        include_images: 是否附带图片结果。
        time_range: day / week / month / year，留空关闭。
        country: 国家码（如 us / cn），留空不限。
        start_date: 起始日期 YYYY-MM-DD（与 time_range 二选一）。
        end_date: 结束日期 YYYY-MM-DD。
    """
    key = _require_key("TAVILY_API_KEY")
    endpoint = (os.getenv("TAVILY_ENDPOINT", "") or "https://api.tavily.com/search").strip()

    async def one(q: str) -> str:
        body = {
            "api_key": key,
            "query": q,
            "search_depth": search_depth,
            "topic": topic,
            "max_results": max(5, min(20, max_results)),
            "include_answer": False,
            "include_images": include_images,
            "include_image_descriptions": False,
            "include_raw_content": include_raw_content,
        }
        if time_range:
            body["time_range"] = time_range
        if country:
            body["country"] = country
        if start_date:
            body["start_date"] = start_date
        if end_date:
            body["end_date"] = end_date
        status, obj, raw = await _http_json_async(
            "POST", endpoint,
            headers={"Authorization": f"Bearer {key}"},
            body=body,
        )
        if status >= 400 or obj is None:
            return f"[query={q}] 失败：HTTP {status}：{raw[:400]}"
        results = obj.get("results") or []
        return _format_items(results, "Tavily 结果", q)

    queries = [q.strip() for q in query.split("|") if q.strip()]
    parts = await asyncio.gather(*(one(q) for q in queries))
    return "\n\n".join(parts)


# --------------------------------------------------------------------------
# 工具 2：SerpApi —— Google 原生抓取
# --------------------------------------------------------------------------
@mcp.tool()
async def serpapi_search(
    query: str,
    engine: str = "google",
    num: int = 10,
    gl: str = "",
    hl: str = "",
    location: str = "",
    device: str = "desktop",
) -> str:
    """Google 原生抓取搜索（SerpApi）。返回有机结果 Markdown。

    Args:
        query: 检索词。
        engine: google / bing / baidu / youtube 等。
        num: 返回条数，默认 10。
        gl: 国家码（us / cn ...），留空自动。
        hl: 界面语言。
        location: 位置（如 "Austin, TX"）。
        device: desktop / mobile / tablet。
    """
    key = _require_key("SERP_API_KEY")
    endpoint = (os.getenv("SERP_ENDPOINT", "") or "https://serpapi.com/search").strip()
    params = {
        "engine": engine,
        "q": query,
        "api_key": key,
        "num": str(max(1, min(100, num))),
        "device": device,
    }
    if gl:
        params["gl"] = gl
    if hl:
        params["hl"] = hl
    if location:
        params["location"] = location
    url = f"{endpoint}?{urlencode(params)}"
    status, obj, raw = await _http_json_async("GET", url)
    if status >= 400 or obj is None:
        raise RuntimeError(f"SerpApi 失败：HTTP {status}：{raw[:400]}")
    if isinstance(obj, dict) and obj.get("error"):
        raise RuntimeError(f"SerpApi 错误：{obj['error']}")
    organic = obj.get("organic_results") or [] if isinstance(obj, dict) else []
    return _format_items(organic, f"SerpApi `{engine}` 结果", query)


# --------------------------------------------------------------------------
# 工具 3：Fathom —— 长文/学术搜索与正文抽取
# --------------------------------------------------------------------------
@mcp.tool()
async def fathom_search(
    query: str = "",
    command: str = "search",
    engine: str = "",
    url: str = "",
    limit: int = 5,
    engines: str = "",
    lang: str = "",
    region: str = "",
) -> str:
    """Fathom 长文/学术搜索与正文抽取。返回 Markdown（无法归一化时兜底返回原文 JSON）。

    Args:
        query: 检索词（search / image_search / engine_search / mega_search 必填）。
        command: search / image_search / engine_search / mega_search / extract / get_usage。
        engine: engine_search 时指定引擎（google / bing / brave / pubmed ...）。
        url: extract 时指定要抽取正文的网址。
        limit: 返回条数。
        engines: mega_search 的逗号分隔引擎列表。
        lang: 语言。
        region: 区域。
    """
    key = _require_key("FATHOM_API_KEY")
    base = (os.getenv("FATHOM_SEARCH_ENDPOINT", "") or "https://fathomsearch.xyz").strip().rstrip("/")
    timeout = float(os.getenv("FATHOM_TIMEOUT_MS", "30000")) / 1000.0

    if command == "engine_search":
        if not engine:
            raise RuntimeError("engine_search 需要 engine 参数。")
        path = f"/{engine}/search"
    else:
        path_map = {
            "search": "/search",
            "image_search": "/image",
            "mega_search": "/mega/search",
            "extract": "/extract",
            "get_usage": "/me",
        }
        path = path_map.get(command)
        if not path:
            raise RuntimeError(f"无效 command：{command}。可用：search/image_search/engine_search/mega_search/extract/get_usage。")

    params = {}
    if command in ("search", "image_search", "mega_search", "engine_search"):
        if not query:
            raise RuntimeError(f"{command} 需要 query 参数。")
        params["text"] = query
    if command == "extract":
        if not url:
            raise RuntimeError("extract 需要 url 参数。")
        params["url"] = url
    if limit:
        params["limit"] = str(limit)
    if engines:
        params["engines"] = engines
    if lang:
        params["lang"] = lang
    if region:
        params["region"] = region

    full_url = f"{base}{path}"
    if params:
        full_url += "?" + urlencode(params)
    headers = {"X-API-KEY": key, "X-Fathom-Client": "vcp-fathomsearch/1.0.0"}
    status, obj, raw = await _http_json_async("GET", full_url, headers=headers, timeout=timeout)
    if status >= 400 or obj is None:
        raise RuntimeError(f"Fathom 失败：HTTP {status}：{raw[:400]}")
    if isinstance(obj, dict) and obj.get("error"):
        raise RuntimeError(f"Fathom 错误：{obj['error']}")
    if isinstance(obj, dict):
        for f in ("answer", "text", "content", "message"):
            if obj.get(f):
                return str(obj[f])
    return json.dumps(obj, ensure_ascii=False, indent=2)


# --------------------------------------------------------------------------
# 工具 4：AnySearch —— 搜索 / 子域名发现 / 正文抽取
# --------------------------------------------------------------------------
def _anysearch_client() -> str:
    return "vcp-anysearch/3.0.1"


@mcp.tool()
async def anysearch_search(
    query: str = "",
    command: str = "search",
    sub_domain: str = "",
    zone: str = "",
    params: str = "",
    max_results: int = 10,
    domain: str = "",
    url: str = "",
) -> str:
    """AnySearch 搜索 / 子域名发现 / 正文抽取。返回 Markdown。

    Args:
        query: 检索词（search 必填；extract 时可传网址兜底）。
        command: search / get_sub_domains / extract。
        sub_domain: 垂直子域名（search 时映射为 tag）。
        zone: 区域/分区。
        params: 额外参数 JSON 字符串（search 透传）。
        max_results: 返回条数。
        domain: get_sub_domains 时的域名。
        url: extract 时的目标网址（优先于 query）。
    """
    key = _require_key("ANYSEARCH_API_KEY")
    timeout = float(os.getenv("ANYSEARCH_TIMEOUT_MS", "30000")) / 1000.0
    client = _anysearch_client()

    if command == "search":
        if not query:
            raise RuntimeError("search 需要 query 参数。")
        endpoint = (os.getenv("ANYSEARCH_SEARCH_ENDPOINT", "")
                    or "https://api.anysearch.com/v1/search").strip()
        body = {"query": query}
        if sub_domain:
            body["tag"] = sub_domain
        if zone:
            body["zone"] = zone
        if params:
            try:
                body["params"] = json.loads(params)
            except json.JSONDecodeError:
                raise RuntimeError("params 需为合法 JSON 字符串。") from None
        body["max_results"] = max(1, min(50, max_results))
        status, obj, raw = await _http_json_async(
            "POST", endpoint,
            headers={"Authorization": f"Bearer {key}", "X-Anysearch-Client": client},
            body=body, timeout=timeout,
        )
        if status >= 400 or obj is None:
            raise RuntimeError(f"AnySearch 失败：HTTP {status}：{raw[:400]}")
        if isinstance(obj, dict) and isinstance(obj.get("code"), int) and obj["code"] != 0:
            msg = obj.get("message") or f"code={obj['code']}"
            raise RuntimeError(f"AnySearch 错误：{msg}")
        items = _extract_results(obj)
        if items:
            return _format_items(items, "AnySearch 结果", query)
        return json.dumps(obj, ensure_ascii=False, indent=2)

    # get_sub_domains / extract 走 AnySearch 官方 MCP JSON-RPC
    mcp_endpoint = (os.getenv("ANYSEARCH_MCP_ENDPOINT", "")
                    or "https://api.anysearch.com/mcp").strip()
    if command == "get_sub_domains":
        if not domain:
            raise RuntimeError("get_sub_domains 需要 domain 参数。")
        args = {"domain": domain}
    elif command == "extract":
        target = url or query
        if not target:
            raise RuntimeError("extract 需要 url 参数（或 query 传网址）。")
        args = {"url": target}
    else:
        raise RuntimeError(f"无效 command：{command}。可用：search/get_sub_domains/extract。")

    body = {"jsonrpc": "2.0", "id": 1, "method": "tools/call",
            "params": {"name": command, "arguments": args}}
    status, obj, raw = await _http_json_async(
        "POST", mcp_endpoint,
        headers={"Authorization": f"Bearer {key}", "X-Anysearch-Client": client},
        body=body, timeout=timeout,
    )
    if status >= 400 or obj is None:
        raise RuntimeError(f"AnySearch MCP 失败：HTTP {status}：{raw[:400]}")
    if isinstance(obj, dict) and obj.get("error"):
        msg = obj["error"].get("message", "") if isinstance(obj["error"], dict) else str(obj["error"])
        raise RuntimeError(f"AnySearch MCP 错误：{msg}")
    result = (obj or {}).get("result") or {}
    content = result.get("content") or []
    text = "\n\n".join(i.get("text", "") for i in content if i.get("type") == "text")
    return text or json.dumps(result, ensure_ascii=False, indent=2)


# --------------------------------------------------------------------------
# 工具 5：知乎 —— 站内 / 全局搜索
# --------------------------------------------------------------------------
@mcp.tool()
async def zhihu_search(
    query: str,
    search_type: str = "zhihu_search",
    count: int = 10,
) -> str:
    """知乎站内 / 全局搜索（OpenAPI）。返回标题/链接/作者/摘要 Markdown。

    Args:
        query: 检索词。
        search_type: zhihu_search（站内）或 global_search（全局）。
        count: 返回条数（站内 1-10，全局 1-20）。
    """
    secret = os.getenv("ZHIHU_ACCESS_SECRET", "").strip()
    if not secret:
        raise RuntimeError("缺少环境变量 ZHIHU_ACCESS_SECRET。")
    st = search_type.strip().lower().replace("-", "_")
    alias = {
        "zhihu": "zhihu_search", "site": "zhihu_search", "content": "zhihu_search",
        "zhihu_search": "zhihu_search",
        "global": "global_search", "all": "global_search", "global_search": "global_search",
    }
    st = alias.get(st)
    if not st:
        raise RuntimeError("search_type 只能是 zhihu_search 或 global_search。")

    base = (os.getenv("ZHIHU_OPENAPI_BASE_URL", "") or "https://developer.zhihu.com").strip().rstrip("/")
    env_name = "ZHIHU_GLOBAL_SEARCH_URL" if st == "global_search" else "ZHIHU_ZHIHU_SEARCH_URL"
    explicit = os.getenv(env_name, "").strip()
    path = "/api/v1/content/global_search" if st == "global_search" else "/api/v1/content/zhihu_search"
    url = explicit or f"{base}{path}"

    max_count = 20 if st == "global_search" else 10
    count = max(1, min(max_count, count))
    timeout = float(os.getenv("ZHIHU_SEARCH_TIMEOUT_SECONDS", "5"))
    full_url = f"{url}?{urlencode({'Query': query, 'Count': str(count)})}"
    headers = {"Authorization": f"Bearer {secret}", "X-Request-Timestamp": str(int(time.time()))}
    status, obj, raw = await _http_json_async("GET", full_url, headers=headers, timeout=timeout)
    if status >= 400 or obj is None:
        raise RuntimeError(f"知乎搜索失败：HTTP {status}：{raw[:400]}")

    data = obj.get("Data") if isinstance(obj.get("Data"), dict) else {}
    items = data.get("Items") if isinstance(data.get("Items"), list) else []
    heading = "知乎搜索结果" if st == "zhihu_search" else "知乎全局搜索结果"
    lines = [f"## {heading}：{query}", "",
             f"**状态**: {obj.get('Message', '')}", f"**结果数**: {len(items)}", ""]
    for i, it in enumerate(items, 1):
        if not isinstance(it, dict):
            continue
        lines.append(f"### {i}. {it.get('Title') or '无标题'}")
        if it.get("Url"):
            lines.append(f"- 链接: {it.get('Url')}")
        if it.get("AuthorName"):
            lines.append(f"- 作者: {it.get('AuthorName')}")
        if "VoteUpCount" in it:
            lines.append(f"- 点赞/评论: {it.get('VoteUpCount', 0)} / {it.get('CommentCount', 0)}")
        if it.get("ContentText"):
            lines.append(f"- 摘要: {it.get('ContentText')}")
        lines.append("")
    if not items:
        lines.append("未找到相关结果。")
    return "\n".join(lines)


# --------------------------------------------------------------------------
# 工具 6：Kimi 编码搜索
# --------------------------------------------------------------------------
@mcp.tool()
async def kimi_search(
    query: str,
    limit: int = 5,
    include_content: bool = False,
) -> str:
    """Kimi 编码搜索（api.kimi.com coding search）。返回 Markdown。

    Args:
        query: 检索词。
        limit: 1-20，默认 5。
        include_content: 是否抓取并附带页面正文。
    """
    key = os.getenv("KIMI_SEARCH_KEY", "").strip()
    if not key:
        raise RuntimeError("缺少环境变量 KIMI_SEARCH_KEY。")
    base = (os.getenv("KIMI_SEARCH_URL", "") or "https://api.kimi.com/coding/v1/search").strip()
    url = base if base.endswith("/search") else f"{base.rstrip('/')}/search"
    body = {
        "text_query": query,
        "limit": max(1, min(20, limit)),
        "enable_page_crawling": include_content,
        "timeout_seconds": 30,
    }
    headers = {
        "Authorization": f"Bearer {key}",
        "X-Msh-Tool-Call-Id": f"vcp-search-mcp-{int(time.time() * 1000)}",
    }
    status, obj, raw = await _http_json_async("POST", url, headers=headers, body=body, timeout=60)
    if status >= 400 or obj is None:
        raise RuntimeError(f"Kimi 搜索失败：HTTP {status}：{raw[:400]}")
    if isinstance(obj, dict) and obj.get("error"):
        raise RuntimeError(f"Kimi 搜索错误：{obj['error']}")
    items = _extract_results(obj)
    if items:
        return _format_items(items, "Kimi 搜索", query)
    return json.dumps(obj, ensure_ascii=False, indent=2)


# --------------------------------------------------------------------------
# 工具 7：VSearch 统一语义搜索（grounding / grok 后端）
# --------------------------------------------------------------------------
@mcp.tool()
async def vsearch(
    query: str,
    search_mode: str = "tavily",
    keywords: str = "",
) -> str:
    """VSearch 统一语义搜索：四后端之一（grounding / grok / tavily / kimisearch）。

    Args:
        query: 检索主题（必需）。
        search_mode: grounding / grok / tavily / kimisearch，默认 tavily。
        keywords: 附加关键词，逗号或换行分隔。
    """
    q = query
    if keywords:
        extra = " ".join(k.strip() for k in keywords.replace("\n", ",").split(",") if k.strip())
        if extra:
            q = f"{q} {extra}"
    mode = search_mode.strip().lower()
    if mode == "tavily":
        return await tavily_search(q)
    if mode == "kimisearch":
        return await kimi_search(q)
    if mode == "grounding":
        return await _grounding_search(q)
    if mode == "grok":
        return await _grok_search(q)
    raise RuntimeError(f"无效 search_mode：{search_mode}。可用：grounding/grok/tavily/kimisearch。")


async def _grounding_search(query: str) -> str:
    key = os.getenv("VSEARCH_KEY", "").strip()
    url = os.getenv("VSEARCH_URL", "").strip()
    model = os.getenv("VSEARCH_MODEL", "").strip()
    if not (key and url and model):
        raise RuntimeError("grounding 模式需要 VSEARCH_URL + VSEARCH_KEY + VSEARCH_MODEL。")
    body = {
        "model": model,
        "messages": [{"role": "user", "content": query}],
        "tools": [{
            "type": "function",
            "function": {
                "name": "googleSearch",
                "description": "Search the web with Google grounding.",
                "parameters": {
                    "type": "object",
                    "properties": {"query": {"type": "string"}},
                    "required": ["query"],
                },
            },
        }],
        "tool_config": {"function_calling_config": {"mode": "NONE"}},
    }
    status, obj, raw = await _http_json_async(
        "POST", url, headers={"Authorization": f"Bearer {key}"}, body=body, timeout=60,
    )
    if status >= 400 or obj is None:
        raise RuntimeError(f"grounding 失败：HTTP {status}：{raw[:400]}")
    choices = obj.get("choices") or []
    text = ""
    if choices:
        msg = choices[0].get("message") or {}
        content = msg.get("content") or ""
        if isinstance(content, str):
            text = content
        elif isinstance(content, list):
            text = "".join(p.get("text", "") for p in content if isinstance(p, dict))
    return text or json.dumps(obj, ensure_ascii=False, indent=2)


async def _grok_search(query: str) -> str:
    key = os.getenv("VSEARCH_KEY", "").strip()
    url = os.getenv("VSEARCH_URL", "").strip()
    model = os.getenv("GROK_MODEL", "").strip()
    if not (key and url and model):
        raise RuntimeError("grok 模式需要 VSEARCH_URL + VSEARCH_KEY + GROK_MODEL。")
    body = {"model": model, "messages": [{"role": "user", "content": query}], "stream": True}
    headers = {"Authorization": f"Bearer {key}"}
    lines = await _http_stream_async("POST", url, headers=headers, body=body, timeout=120)
    out = []
    for line in lines:
        if not line.startswith("data:"):
            continue
        data = line[5:].strip()
        if data == "[DONE]":
            break
        try:
            piece = json.loads(data)
        except json.JSONDecodeError:
            continue
        delta = (piece.get("choices") or [{}])[0].get("delta") or {}
        c = delta.get("content")
        if isinstance(c, str):
            out.append(c)
    return "".join(out)


# --------------------------------------------------------------------------
# 启动
# --------------------------------------------------------------------------
if __name__ == "__main__":
    transport = os.getenv("MCP_TRANSPORT", "stdio").strip().lower()
    mcp.run(transport=transport)
