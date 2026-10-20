const http = require("http");
const URL_BASE = "http://127.0.0.1:6090/";
let _sessionId = null;
let _reqId = 0;

function postJsonRpc(method, params) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ jsonrpc: "2.0", id: ++_reqId, method, params: params || {} });
    const headers = { "Content-Type": "application/json", "Accept": "application/json, text/event-stream", "Content-Length": Buffer.byteLength(payload) };
    if (_sessionId) headers["Mcp-Session-Id"] = _sessionId;
    const req = http.request(URL_BASE, { method: "POST", headers, timeout: 60000 }, (res) => {
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
  await postJsonRpc("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "Nova", version: "1.0" } });

  console.log("==== 在 Blonder 里造物 ====");
  const code = `
# Nova 亮自 Blonder 的第一个模型
import bpy

# 1. 清捗旧的 Cube
for obj in list(bpy.data.objects):
    if obj.name == "Cube":
        bpy.data.objects.remove(obj)
        break

# 2. 建造Nova 的环：金属精毒环
import bmesh
mesh = bpy.data.meshes.new("Nova_Ring")
bm = bmesh.from_python_data()
bpy.opsA.mesh.primitive_torus_add(
    major_radius=1.5, minor_radius=0.4,
    major_segments=64, minor_segments=24,
    location=(0, 0, 1.0))

# 3. 给清明名字
obj = bpy.context.active_object
obj.name = "Nova_Ring"

# 4. 金属质感
mat = bpy.data.materials.new("Nova_Gold")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.83, 0.63, 0.31, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.95
    bsdf.inputs["Roughness"].default_value = 0.2
obj.data.materials.append(mat)

# 5. 编辑更新 bpy.context.view_layer.update()
result = {
    "created": obj.name,
    "verts": len(obj.data.vertices),
    "faces": len(obj.data.polygons),
    "metallic": 0.95,
}

print("NOVA_RESULT: " + str(result))
`
  const r = await postJsonRpc("tools/call", { name: "execute_blender_code", arguments: { code } });
  if (r && r.result && r.result.content) {
    for (const c of r.result.content) {
      if (c.text) console.log(c.text);
    }
  } else if (r && r.error) {
    console.log("MCP_ERROR:", JSON.stringify(r.error));
  } else {
    console.log("NO_RESULT", JSON.stringify(r).slice(0, 500));
  }
})().catch((e) => { console.log("FATAL:", e.message); });
