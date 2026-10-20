const http = require("http");
const URL_BASE = "http://127.0.0.1:6090/";
let _sessionId = null;
let _reqId = 0;

function postJsonRpc(method, params) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ jsonrpc: "2.0", id: ++_reqId, method, params: params || {} });
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Content-Length": Buffer.byteLength(payload),
    };
    if (_sessionId) headers["Mcp-Session-Id"] = _sessionId;
    const req = http.request(URL_BASE, { method: "POST", headers, timeout: 30000 }, (res) => {
      const sid = res.headers["mcp-session-id"];
      if (sid) _sessionId = sid;
      let raw = "";
      res.setEncoding("utf8");
      res.on("data", (c) => { raw += c; });
      res.on("end", () => {
        let jsonStr = null;
        for (const line of raw.trim().split("\n")) {
          if (line.startsWith("data: ")) {
            const c = line.slice(6).trim();
            if (c.startsWith("{")) jsonStr = c;
          }
        }
        if (!jsonStr && raw.trim().startsWith("{")) jsonStr = raw.trim();
        if (!jsonStr) return resolve(null);
        try { resolve(JSON.parse(jsonStr)); } catch (e) { resolve(null); }
      });
    });
    req.on("error", (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log("==== INIT ====");
  const init = await postJsonRpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "Nova", version: "1.0" } });
  if (init && init.result) console.log("SERVER:", init.result.serverInfo.name, init.result.serverInfo.version);

  console.log("\n===== GET_SCENE_STATE =====");
  const scene = await postJsonRpc("tools/call", { name: "get_scene_state", arguments: {} });
  if (scene && scene.result && scene.result.content) {
    for (const c of scene.result.content) {
      if (c.text) {
        console.log("=== SCENE ===");
        console.log(c.text.slice(0, 2500));
      }
    }
  } else if (scene && scene.error) {
    console.log("MCP_ERROR:", JSON.stringify(scene.error));
  } else {
    console.log("NO_RESULT", JSON.stringify(scene).slice(0, 500));
  }
})().catch((e) => { console.log("FATAL:", e.message); });
