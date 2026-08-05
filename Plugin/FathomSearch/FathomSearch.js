#!/usr/bin/env node
"use strict";

const http = require("http");
const https = require("https");

const DEFAULT_BASE_URL = "https://fathomsearch.xyz";
const TIMEOUT_DEFAULT_MS = 30000;
const TIMEOUT_MIN_MS = 1000;
const TIMEOUT_MAX_MS = 40000;
const EXTRACT_MAX_CHARS = 50000;

process.stdin.setEncoding("utf8");
if (process.stdout.setDefaultEncoding) process.stdout.setDefaultEncoding("utf8");

function emit(payload) {
  process.stdout.write(JSON.stringify(payload));
}

function fail(message) {
  emit({
    status: "error",
    error: `FathomSearch Error: ${message}`
  });
  process.exit(0);
}

function readStdin() {
  return new Promise((resolve) => {
    let input = "";
    process.stdin.on("data", (chunk) => { input += chunk; });
    process.stdin.on("end", () => resolve(input.replace(/^\uFEFF/, "")));
  });
}

function parsePayload(raw) {
  if (!raw || !raw.trim()) fail("stdin 未收到输入。");
  try {
    const payload = JSON.parse(raw);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      fail("输入必须是 JSON 对象。");
    }
    return payload;
  } catch (_) {
    fail("stdin 不是合法的 JSON。");
  }
}

function firstString(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeCommand(payload) {
  const raw = firstString(payload, ["command", "action", "mode"]);
  if (!raw) {
    return firstString(payload, ["url", "URL", "link"]) ? "extract" : "search";
  }

  const command = raw.toLowerCase().replace(/-/g, "_");
  const aliases = {
    image: "image_search",
    engine: "engine_search",
    google_search: "engine_search",
    bing_search: "engine_search",
    usage: "get_usage",
    check_quota: "get_usage",
    me: "get_usage"
  };

  const normalized = aliases[command] || command;
  const allowed = new Set([
    "search",
    "image_search",
    "engine_search",
    "mega_search",
    "extract",
    "get_usage"
  ]);

  if (!allowed.has(normalized)) {
    fail("无效 command。可用值：search、image_search、engine_search、mega_search、extract、get_usage。");
  }
  return normalized;
}

function getTimeoutMs() {
  const value = Number.parseInt(process.env.FATHOM_TIMEOUT_MS || "", 10);
  if (Number.isNaN(value)) return TIMEOUT_DEFAULT_MS;
  return Math.max(TIMEOUT_MIN_MS, Math.min(TIMEOUT_MAX_MS, value));
}

function getBaseUrl() {
  const base = (process.env.FATHOM_SEARCH_ENDPOINT || DEFAULT_BASE_URL).trim();
  return (base || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

function getApiKey() {
  return (process.env.FATHOM_API_KEY || "").trim();
}

function resolveTransport(url) {
  if (url.protocol === "https:") return https;
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  if (url.protocol === "http:" && local) return http;
  fail("FATHOM_SEARCH_ENDPOINT 必须使用 https://（本地 localhost 除外）。");
}

function parseInteger(payload, keys, label) {
  const raw = firstString(payload, keys);
  if (!raw) return undefined;
  const value = Number.parseInt(raw, 10);
  if (Number.isNaN(value) || value < 0) fail(`${label} 必须是非负整数。`);
  return value;
}

function addIfPresent(params, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    params.set(key, String(value).trim());
  }
}

function buildSearchParams(payload, requireText) {
  const text = firstString(payload, ["text", "query", "q"]);
  const site = firstString(payload, ["site"]);
  const file = firstString(payload, ["file"]);

  if (requireText && !text && !site && !file) {
    fail("搜索请求至少需要 text、site 或 file 之一。");
  }

  const params = new URLSearchParams();
  addIfPresent(params, "text", text);
  addIfPresent(params, "site", site);
  addIfPresent(params, "file", file);
  addIfPresent(params, "lang", firstString(payload, ["lang", "language"]));
  addIfPresent(params, "region", firstString(payload, ["region"]));
  addIfPresent(params, "engines", firstString(payload, ["engines"]));
  addIfPresent(params, "format", firstString(payload, ["format"]));
  addIfPresent(params, "limit", parseInteger(payload, ["limit", "max_results", "maxResults"], "limit"));
  addIfPresent(params, "start", parseInteger(payload, ["start"], "start"));
  return params;
}

function normalizeEngine(payload) {
  let engine = firstString(payload, ["engine"]);

  // 兼容 command: google_search / bing_search。
  const rawCommand = firstString(payload, ["command"]).toLowerCase();
  const match = rawCommand.match(/^([a-z0-9_-]+)_search$/);
  if (!engine && match && !["image", "mega"].includes(match[1])) {
    engine = match[1];
  }

  if (!engine || !/^[a-zA-Z0-9_-]+$/.test(engine)) {
    fail("engine_search 需要安全的 engine 名称，例如 google、bing、brave、pubmed。");
  }
  return engine.toLowerCase();
}

function buildRequest(payload, command) {
  let path = "";
  let params = new URLSearchParams();

  if (command === "search") {
    path = "/search";
    params = buildSearchParams(payload, true);
  } else if (command === "image_search") {
    path = "/image";
    params = buildSearchParams(payload, true);
  } else if (command === "engine_search") {
    path = `/${normalizeEngine(payload)}/search`;
    params = buildSearchParams(payload, true);
    params.delete("engines");
  } else if (command === "mega_search") {
    path = "/mega/search";
    params = buildSearchParams(payload, true);
  } else if (command === "extract") {
    const url = firstString(payload, ["url", "URL", "link"]);
    if (!/^https?:\/\//i.test(url)) fail("extract 的 url 必须以 http:// 或 https:// 开头。");

    const cache = firstString(payload, ["cache"]) || "use";
    if (!["use", "bypass", "refresh"].includes(cache)) {
      fail("extract 的 cache 只能是 use、bypass 或 refresh。");
    }

    path = "/extract";
    params.set("url", url);
    params.set("cache", cache);
    addIfPresent(params, "format", firstString(payload, ["format"]));
  } else {
    path = "/me";
  }

  return { path, params };
}

function getRequest(path, params) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return Promise.resolve({
      ok: false,
      error: "未配置 FATHOM_API_KEY。请填写插件目录内 config.env 后重启 VCPToolBox。",
      statusCode: 0
    });
  }

  let url;
  try {
    url = new URL(`${getBaseUrl()}${path}`);
    for (const [key, value] of params.entries()) url.searchParams.set(key, value);
  } catch (_) {
    return Promise.resolve({ ok: false, error: "Fathom endpoint 配置无效。", statusCode: 0 });
  }

  const transport = resolveTransport(url);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "http:" ? 80 : 443),
    path: `${url.pathname}${url.search}`,
    method: "GET",
    headers: {
      "X-API-KEY": apiKey,
      "Accept": "application/json, text/plain, text/markdown;q=0.9, */*;q=0.8",
      "X-Fathom-Client": "vcp-fathomsearch/1.0.0"
    }
  };

  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const req = transport.request(options, (res) => {
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        const statusCode = res.statusCode || 0;
        const requestId = res.headers["x-request-id"] || "";

        if (statusCode >= 400) {
          let message = `HTTP ${statusCode}`;
          try {
            const body = JSON.parse(raw);
            message = body.message || body.error || message;
          } catch (_) {
            message = raw.slice(0, 300).replace(/[A-Za-z0-9_-]{20,}/g, "[redacted]") || message;
          }
          finish({ ok: false, error: `HTTP ${statusCode}: ${message}`, statusCode, requestId });
          return;
        }

        finish({ ok: true, data: raw, statusCode, requestId });
      });
    });

    const timer = setTimeout(() => {
      req.destroy();
      finish({ ok: false, error: "Fathom API 请求超时。", statusCode: 0 });
    }, getTimeoutMs());

    req.on("error", (error) => {
      finish({ ok: false, error: error.message || String(error), statusCode: 0 });
    });

    req.end();
  });
}

function formatResult(raw, command) {
  let text = typeof raw === "string" ? raw.trim() : "";

  // 若服务返回 JSON，格式化以便 VChat 易读；Markdown/text/ndjson 则原样返回。
  try {
    const json = JSON.parse(text);
    text = JSON.stringify(json, null, 2);
  } catch (_) {
    // 保留 Fathom 的 Markdown / text / ndjson 原始输出。
  }

  if (command === "extract" && text.length > EXTRACT_MAX_CHARS) {
    const suffix = "\n\n...(正文已截断，达到 50,000 字符上限)...";
    text = text.slice(0, EXTRACT_MAX_CHARS - suffix.length) + suffix;
  }

  return text || "Fathom Search 未返回可读内容。";
}

async function main() {
  try {
    const payload = parsePayload(await readStdin());
    const command = normalizeCommand(payload);
    const { path, params } = buildRequest(payload, command);
    const response = await getRequest(path, params);

    if (!response.ok) fail(response.error);

    emit({
      status: "success",
      result: {
        content: [{
          type: "text",
          text: formatResult(response.data, command)
        }]
      }
    });
  } catch (error) {
    fail(error.message || String(error));
  }
}

main();