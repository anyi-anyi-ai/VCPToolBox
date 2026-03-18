import os
import sys
import json
import tempfile
import subprocess
import re
from typing import Any, Dict, List, Tuple, Optional
from urllib.parse import urlparse, unquote

# Load env from config.env as a fallback (Plugin.js should set env vars, but we add robustness)
def load_env_from_config():
    config_path = os.path.join(os.path.dirname(__file__), "config.env")
    if not os.path.exists(config_path):
        return
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip()
                os.environ.setdefault(k, v)
    except Exception:
        pass


class AsepriteRunner:
    def __init__(self):
        default = "Aseprite.exe" if os.name == "nt" else "aseprite"
        self.aseprite_path = os.environ.get("ASEPRITE_PATH", default)

    def run(self, args: List[str]) -> Tuple[bool, str, str]:
        cmd = [self.aseprite_path] + args
        try:
            res = subprocess.run(cmd, capture_output=True, text=True)
            ok = res.returncode == 0
            return ok, res.stdout, res.stderr
        except FileNotFoundError:
            return False, "", f"Aseprite executable not found: {self.aseprite_path}"
        except Exception as e:
            return False, "", f"Unexpected error executing Aseprite: {str(e)}"

    def execute_lua(self, script_content: str, filename: Optional[str] = None) -> Tuple[bool, str, str]:
        tmp = None
        try:
            fd, tmp = tempfile.mkstemp(suffix=".lua", text=True)
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(script_content)
            args: List[str] = ["--batch"]
            if filename and os.path.exists(filename):
                args.append(filename)
            args.extend(["--script", tmp])
            return self.run(args)
        finally:
            if tmp and os.path.exists(tmp):
                try:
                    os.remove(tmp)
                except Exception:
                    pass


def escape_lua_string(s: str) -> str:
    # Normalize backslashes and escape quotes for Lua string literal
    return s.replace("\\", "/").replace('"', '\\"')


def parse_bool(v: Any, default: bool = False) -> bool:
    if isinstance(v, bool):
        return v
    if v is None:
        return default
    if isinstance(v, (int, float)):
        return v != 0
    if isinstance(v, str):
        vs = v.strip().lower()
        if vs in ("true", "1", "yes", "y", "on"):
            return True
        if vs in ("false", "0", "no", "n", "off"):
            return False
    return default


def parse_int(v: Any, default: int = 0) -> int:
    try:
        if isinstance(v, int):
            return int(v)
        if isinstance(v, float):
            return int(v)
        if isinstance(v, str):
            return int(float(v.strip()))
        return default
    except Exception:
        return default


def parse_color_hex(hex_str: str) -> Tuple[int, int, int]:
    if not isinstance(hex_str, str):
        raise ValueError("color must be hex string like #RRGGBB")
    s = hex_str.strip()
    if s.startswith("#"):
        s = s[1:]
    if len(s) == 3:
        s = "".join([c * 2 for c in s])
    if len(s) != 6:
        raise ValueError("color must be 6-digit hex like #AABBCC")
    r = int(s[0:2], 16)
    g = int(s[2:4], 16)
    b = int(s[4:6], 16)
    return r, g, b


def get_first(args: Dict[str, Any], names: List[str], default: Any = None):
    for n in names:
        if n in args:
            return args[n]
    return default


def normalize_keys(d: Dict[str, Any]) -> Dict[str, Any]:
    # Keep original values but lower-case keys; digits preserved
    return {(k.lower() if isinstance(k, str) else k): v for k, v in d.items()}


def build_sub_args(req: Dict[str, Any], suffix: str) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for k, v in req.items():
        if not isinstance(k, str):
            continue
        if k.endswith(suffix):
            base = k[:-len(suffix)]
            out[base.lower()] = v
    return out


def _convert_file_url_to_local_path(file_url: str) -> str:
    # Convert file:// URL to OS path; handles Windows drive letters
    p = urlparse(file_url)
    if p.scheme != "file":
        return file_url
    path = unquote(p.path or "")
    if os.name == "nt":
        # On Windows, urlparse yields like /C:/path...
        if len(path) >= 3 and path[0] == "/" and path[2] == ":":
            path = path[1:]
    return path


def resolve_input_path(filename: Optional[str]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Returns (ok, resolved_path, error_message)
    - For file:// URL: convert to local path; if not exists, return structured error string containing code.
    - For normal path: return as-is if exists; otherwise error.
    """
    if not filename:
        return False, None, "filename is required"

    if isinstance(filename, str) and filename.startswith("file://"):
        local_path = _convert_file_url_to_local_path(filename)
        if os.path.exists(local_path):
            return True, local_path, None
        # Structured error hint for VCP Hyper-Stack-Trace; main will wrap in status=error
        err_obj = {
            "status": "error",
            "code": "FILE_NOT_FOUND_LOCALLY",
            "error": "本地文件未找到，需要遠程获取。",
            "fileUrl": filename,
        }
        return False, None, json.dumps(err_obj, ensure_ascii=False)

    if os.path.exists(filename):
        return True, filename, None

    return False, None, f"File {filename} not found"


def requires_file_exists(filename: Optional[str]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    Wrapper to ensure file exists (supports file://). See resolve_input_path.
    """
    return resolve_input_path(filename)


def _try_json_loads(s: str):
    try:
        return json.loads(s)
    except Exception:
        return None


def coerce_pixels(value: Any) -> Tuple[bool, Optional[List[Dict[str, Any]]], Optional[str]]:
    """
    Accept list[dict], dict, or JSON-string representing either.
    Returns (ok, pixels_list, error_message)
    """
    v = value
    if isinstance(v, str):
        parsed = _try_json_loads(v)
        if parsed is not None:
            v = parsed
        else:
            return False, None, "pixels must be a non-empty JSON array (string provided is not valid JSON)"

    if isinstance(v, dict):
        v = [v]

    if not isinstance(v, list) or len(v) == 0:
        return False, None, "pixels must be a non-empty list of {x,y,color}"

    # Optional: validate elements are dicts
    for i, item in enumerate(v):
        if not isinstance(item, dict):
            return False, None, f"pixels[{i}] must be an object with x,y,color"

    return True, v, None


def _build_save_as_line(args: Dict[str, Any]) -> str:
    """
    Returns the Lua save line:
      - If user provided a save_as-like parameter, returns: spr:saveAs("...normalized...")
      - Otherwise returns: spr:saveAs(spr.filename)
    """
    save_as = get_first(args, ["save_as", "saveas", "output", "out", "dest", "destination"])
    if save_as:
        s = escape_lua_string(str(save_as))
        return f'spr:saveAs("{s}")'
    return "spr:saveAs(spr.filename)"


# Command handlers

def handle_create_canvas(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    width = parse_int(get_first(args, ["width", "w"]))
    height = parse_int(get_first(args, ["height", "h"]))
    filename = get_first(args, ["filename", "file", "filepath", "path"], "canvas.aseprite")
    if width <= 0 or height <= 0:
        return False, "width and height must be positive integers"
    fn = escape_lua_string(str(filename))
    script = f'''
local spr = Sprite({width}, {height})
spr:saveAs("{fn}")
return "Canvas created successfully: {fn}"
'''
    ok, out, err = runner.execute_lua(script)
    if ok:
        return True, f"Canvas created successfully: {filename}"
    return False, f"Failed to create canvas: {err.strip() or out.strip()}"


def handle_add_layer(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    layer_name = get_first(args, ["layer_name", "layer", "layername", "name"])
    if not layer_name:
        return False, "layer_name is required"
    ln = escape_lua_string(str(layer_name))
    save_line = _build_save_as_line(args)
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  spr:newLayer()
  app.activeLayer.name = "{ln}"
end)
{save_line}
return "Layer added successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Layer '{layer_name}' added successfully to {filename_in}"
    return False, f"Failed to add layer: {err.strip() or out.strip()}"


def handle_add_frame(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    save_line = _build_save_as_line(args)
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  spr:newFrame()
end)
{save_line}
return "Frame added successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"New frame added successfully to {filename_in}"
    return False, f"Failed to add frame: {err.strip() or out.strip()}"


def handle_draw_pixels(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    raw_pixels = get_first(args, ["pixels", "points", "dots"], [])
    okc, pixels, perr = coerce_pixels(raw_pixels)
    if not okc:
        return False, perr
    save_line = _build_save_as_line(args)
    script = '''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  local cel = app.activeCel
  if not cel then
    app.activeLayer = spr.layers[1]
    app.activeFrame = spr.frames[1]
    cel = app.activeCel
    if not cel then
      return "No active cel and couldn't create one"
    end
  end
  local img = cel.image
'''
    for p in pixels:
        try:
            x = parse_int(p.get("x", 0))
            y = parse_int(p.get("y", 0))
            r, g, b = parse_color_hex(p.get("color", "#000000"))
            script += f'''
  img:putPixel({x}, {y}, Color({r}, {g}, {b}, 255))
'''
        except Exception as e:
            return False, f"Invalid pixel entry: {e}"
    script += f'''
end)
{save_line}
return "Pixels drawn successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Pixels drawn successfully in {filename_in}"
    return False, f"Failed to draw pixels: {err.strip() or out.strip()}"


def handle_draw_line(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    # Support x1,y1,x2,y2 or x_start,y_start,x_end,y_end
    x1 = get_first(args, ["x1", "x_start"])
    y1 = get_first(args, ["y1", "y_start"])
    x2 = get_first(args, ["x2", "x_end"])
    y2 = get_first(args, ["y2", "y_end"])
    x1 = parse_int(x1)
    y1 = parse_int(y1)
    x2 = parse_int(x2)
    y2 = parse_int(y2)
    color = get_first(args, ["color", "colour", "hex"], "#000000")
    thickness = parse_int(get_first(args, ["thickness", "size", "width_px", "line_width"], 1), 1)
    try:
        r, g, b = parse_color_hex(color)
    except Exception as e:
        return False, str(e)
    save_line = _build_save_as_line(args)
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  local cel = app.activeCel
  if not cel then
    app.activeLayer = spr.layers[1]
    app.activeFrame = spr.frames[1]
    cel = app.activeCel
    if not cel then
      return "No active cel and couldn't create one"
    end
  end
  local color = Color({r}, {g}, {b}, 255)
  local _fallback = false
  local ok = pcall(function()
    local brush = Brush{{ size = {thickness} }}
    app.useTool({{
      tool="line",
      color=color,
      brush=brush,
      points={{Point({x1}, {y1}), Point({x2}, {y2})}}
    }})
  end)
  if not ok then
    _fallback = true
    app.useTool({{
      tool="line",
      color=color,
      points={{Point({x1}, {y1}), Point({x2}, {y2})}}
    }})
  end
end)
{save_line}
return "Line drawn successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Line drawn successfully in {filename_in}"
    return False, f"Failed to draw line: {err.strip() or out.strip()}"


def handle_draw_rectangle(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    x = parse_int(get_first(args, ["x"]))
    y = parse_int(get_first(args, ["y"]))
    width = parse_int(get_first(args, ["width", "w"]))
    height = parse_int(get_first(args, ["height", "h"]))
    color = get_first(args, ["color", "colour", "hex"], "#000000")
    fill = parse_bool(get_first(args, ["fill", "filled", "solid"], False), False)
    try:
        r, g, b = parse_color_hex(color)
    except Exception as e:
        return False, str(e)
    tool_name = "filled_rectangle" if fill else "rectangle"
    save_line = _build_save_as_line(args)
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  local cel = app.activeCel
  if not cel then
    app.activeLayer = spr.layers[1]
    app.activeFrame = spr.frames[1]
    cel = app.activeCel
    if not cel then
      return "No active cel and couldn't create one"
    end
  end
  local color = Color({r}, {g}, {b}, 255)
  local tool = "{tool_name}"
  app.useTool({{
    tool=tool,
    color=color,
    points={{Point({x}, {y}), Point({x + width}, {y + height})}}
  }})
end)
{save_line}
return "Rectangle drawn successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Rectangle drawn successfully in {filename_in}"
    return False, f"Failed to draw rectangle: {err.strip() or out.strip()}"


def handle_fill_area(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    x = parse_int(get_first(args, ["x"]))
    y = parse_int(get_first(args, ["y"]))
    color = get_first(args, ["color", "colour", "hex"], "#000000")
    try:
        r, g, b = parse_color_hex(color)
    except Exception as e:
        return False, str(e)
    save_line = _build_save_as_line(args)
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  local cel = app.activeCel
  if not cel then
    app.activeLayer = spr.layers[1]
    app.activeFrame = spr.frames[1]
    cel = app.activeCel
    if not cel then
      return "No active cel and couldn't create one"
    end
  end
  local color = Color({r}, {g}, {b}, 255)
  app.useTool({{
    tool="paint_bucket",
    color=color,
    points={{Point({x}, {y})}}
  }})
end)
{save_line}
return "Area filled successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Area filled successfully in {filename_in}"
    return False, f"Failed to fill area: {err.strip() or out.strip()}"


def handle_draw_circle(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    cx = parse_int(get_first(args, ["center_x", "cx", "x_center"]))
    cy = parse_int(get_first(args, ["center_y", "cy", "y_center"]))
    radius = parse_int(get_first(args, ["radius", "r"]))
    color = get_first(args, ["color", "colour", "hex"], "#000000")
    fill = parse_bool(get_first(args, ["fill", "filled", "solid"], False), False)
    try:
        r, g, b = parse_color_hex(color)
    except Exception as e:
        return False, str(e)
    tool_name = "filled_ellipse" if fill else "ellipse"
    x1 = cx - radius
    y1 = cy - radius
    x2 = cx + radius
    y2 = cy + radius
    save_line = _build_save_as_line(args)
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
app.transaction(function()
  local cel = app.activeCel
  if not cel then
    app.activeLayer = spr.layers[1]
    app.activeFrame = spr.frames[1]
    cel = app.activeCel
    if not cel then
      return "No active cel and couldn't create one"
    end
  end
  local color = Color({r}, {g}, {b}, 255)
  local tool = "{tool_name}"
  app.useTool({{
    tool=tool,
    color=color,
    points={{Point({x1}, {y1}), Point({x2}, {y2})}}
  }})
end)
{save_line}
return "Circle drawn successfully"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Circle drawn successfully in {filename_in}"
    return False, f"Failed to draw circle: {err.strip() or out.strip()}"


def handle_save_as(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    """
    Save the given Aseprite file to a new path (another filename).
    Args: filename (src), save_as (dest)
    """
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    dest = get_first(args, ["save_as", "saveas", "output", "out", "dest", "destination"])
    if not dest:
        return False, "save_as is required"
    dest_lua = escape_lua_string(str(dest))
    script = f'''
local spr = app.activeSprite
if not spr then return "No active sprite" end
spr:saveAs("{dest_lua}")
return "Saved as: {dest_lua}"
'''
    ok, out, err = runner.execute_lua(script, filename)
    if ok:
        return True, f"Saved as: {dest}"
    return False, f"Failed to save as: {err.strip() or out.strip()}"


def handle_export_sprite(runner: AsepriteRunner, args: Dict[str, Any]) -> Tuple[bool, Any]:
    """
    Export sprite to a still/animated format using Aseprite CLI (non-Lua).
    Args: filename, output_filename, format (optional; inferred from output if present)
    """
    args = normalize_keys(args)
    filename_in = get_first(args, ["filename", "file", "filepath", "path"])
    okf, filename, msg = requires_file_exists(filename_in)
    if not okf:
        return False, msg
    output = get_first(args, ["output_filename", "output", "out", "save_as", "saveas", "dest", "destination"])
    if not output:
        return False, "output_filename is required"
    fmt = get_first(args, ["format", "fmt", "type"])
    # Normalize extension
    if fmt:
        fmt = str(fmt).lower().lstrip(".")
        if not str(output).lower().endswith(f".{fmt}"):
            output = f"{output}.{fmt}"
    else:
        # Infer from output
        if "." in str(output):
            fmt = str(output).split(".")[-1].lower()
        else:
            fmt = "png"
            output = f"{output}.png"

    args_cli = ["--batch", filename, "--save-as", str(output)]
    ok, out, err = runner.run(args_cli)
    if ok:
        return True, f"Sprite exported successfully to {output}"
    return False, f"Failed to export sprite: {err.strip() or out.strip()}"


COMMAND_MAP = {
    "createcanvas": handle_create_canvas,
    "addlayer": handle_add_layer,
    "addframe": handle_add_frame,
    "drawpixels": handle_draw_pixels,
    "drawline": handle_draw_line,
    "drawrectangle": handle_draw_rectangle,
    "fillarea": handle_fill_area,
    "drawcircle": handle_draw_circle,
    "saveas": handle_save_as,
    "exportsprite": handle_export_sprite,
}


def dispatch_single(runner: AsepriteRunner, req: Dict[str, Any]) -> Tuple[bool, Any]:
    # Accept 'command' key case-insensitive and synonyms
    # Build lowercased keys map
    lc = {(k.lower() if isinstance(k, str) else k): v for k, v in req.items()}
    cmd = lc.get("command") or lc.get("action") or lc.get("cmd")
    if not cmd or not isinstance(cmd, str):
        return False, "Missing 'command' field"
    handler = COMMAND_MAP.get(cmd.replace("_", "").replace("-", "").lower())
    if not handler:
        return False, f"Unknown command: {cmd}"
    try:
        ok, res = handler(runner, req)
        return ok, res
    except Exception as e:
        return False, f"Exception during '{cmd}': {str(e)}"


def find_batch_suffixes(req: Dict[str, Any]) -> List[str]:
    suffixes = []
    for k in req.keys():
        if not isinstance(k, str):
            continue
        m = re.match(r"^command(\d+)$", k)
        if m:
            suffixes.append(m.group(1))
    suffixes = sorted(suffixes, key=lambda s: int(s))
    return suffixes


def _collect_pixels_meta(sub: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    for key in ("pixels", "points", "dots"):
        if key in sub:
            v = sub[key]
            kind = type(v).__name__
            length = None
            if isinstance(v, list):
                length = len(v)
            return {"key": key, "type": kind, "length": length}
    return None


def dispatch_batch(runner: AsepriteRunner, req: Dict[str, Any]) -> Tuple[bool, Any]:
    suffixes = find_batch_suffixes(req)
    if not suffixes:
        return False, "No batch commands found (expected command1, command2, ...)"
    steps = []
    for s in suffixes:
        sub = build_sub_args(req, s)
        cmd = sub.get("command")
        # Batch debug (stderr only)
        try:
            dbg = {
                "index": int(s),
                "command": cmd,
                "keys": sorted([k for k in sub.keys()]),
                "pixels_meta": _collect_pixels_meta(sub),
            }
            print(f"[AsepriteOperator][batch] {json.dumps(dbg, ensure_ascii=False)}", file=sys.stderr)
        except Exception:
            # Never let debug crash the tool
            pass

        if not cmd:
            steps.append({"index": int(s), "status": "error", "error": f"Missing command{s}"})
            continue
        handler = COMMAND_MAP.get(cmd.replace("_", "").replace("-", "").lower())
        if not handler:
            steps.append({"index": int(s), "command": cmd, "status": "error", "error": f"Unknown command: {cmd}"})
            continue
        try:
            ok, res = handler(runner, sub)
            if ok:
                steps.append({"index": int(s), "command": cmd, "status": "success", "result": res})
            else:
                # If handler returns a JSON-string structured error (e.g., FILE_NOT_FOUND_LOCALLY), pass it through
                err_payload: Any = res
                try:
                    if isinstance(res, str) and res.startswith("{"):
                        err_payload = json.loads(res)
                except Exception:
                    err_payload = res
                if isinstance(err_payload, dict):
                    steps.append({"index": int(s), "command": cmd, "status": "error", **err_payload})
                else:
                    steps.append({"index": int(s), "command": cmd, "status": "error", "error": res})
        except Exception as e:
            steps.append({"index": int(s), "command": cmd, "status": "error", "error": f"Exception: {str(e)}"})
    return True, {"steps": steps}


def main():
    load_env_from_config()
    runner = AsepriteRunner()
    # Read all from stdin to support pretty-printed JSON
    data = sys.stdin.read()
    if not data:
        print(json.dumps({"status": "error", "error": "No input received"}))
        return
    try:
        req = json.loads(data)
    except json.JSONDecodeError as e:
        print(json.dumps({"status": "error", "error": f"Invalid JSON: {str(e)}"}))
        return
    # Determine single or batch
    req_lc = {(k.lower() if isinstance(k, str) else k): v for k, v in req.items()}
    is_batch = bool(find_batch_suffixes(req)) or (isinstance(req_lc.get("command"), str) and req_lc.get("command").lower() == "batch")
    if is_batch:
        ok, res = dispatch_batch(runner, req)
    else:
        ok, res = dispatch_single(runner, req)
    if ok:
        print(json.dumps({"status": "success", "result": res}, ensure_ascii=False))
    else:
        # Allow handlers to pass through structured JSON errors (string form)
        payload: Any = res
        try:
            if isinstance(res, str) and res.startswith("{"):
                payload = json.loads(res)
        except Exception:
            payload = res
        if isinstance(payload, dict) and payload.get("status") == "error":
            print(json.dumps(payload, ensure_ascii=False))
        else:
            print(json.dumps({"status": "error", "error": res}, ensure_ascii=False))


if __name__ == "__main__":
    main()