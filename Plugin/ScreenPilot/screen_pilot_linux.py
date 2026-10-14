# -*- coding: utf-8 -*-
"""
screen_pilot_linux.py - ScreenPilot Linux Worker

与 Windows 版 screen_pilot.py 共享 JSONL 协议：
  输入: {"id": "...", "request": {...}, "context": {...}}
  输出: {"id": "...", "status": "success", "result": ...}
        {"id": "...", "status": "error", "error": {"code","message","retryable","details"}}

Linux 能力边界：
  - QueryWindows : 调 WindowSensor/sensor.sh
  - ScreenCapture: 全屏走 grim/mss；按窗口截图按合成器分派
                   Hyprland 走 grim -T（跨工作区）
                   Niri 走 niri msg action screenshot-window
                   Sway/wlroots 走 wlr-shot 或 grim 区域裁剪
                   GNOME/KDE Wayland 明确报错
  - ClickAt      : X11 走 xdotool；Wayland 走 ydotool
  - TypeText     : X11 走 xdotool；Wayland 走 ydotool
  - ScrollAt     : X11 走 xdotool；Wayland 明确不支持
  - ClickText    : 截图 + RapidOCR + 点击
  - ClickVisual  : 截图 + 图生图 API + 点击
  - InspectUI    : AT-SPI over D-Bus，Wayland 下通过合成器 IPC 换算坐标
  - UIAction / WaitForElement / Interact : 暂未实现，返回结构化错误

OCR 引擎：RapidOCR（ONNX Runtime），自带内存管理。
"""

import sys
import os
import io
import json
import time
import re
import gc
import base64
import shutil
import tempfile
import threading
import subprocess
import traceback
from datetime import datetime

# ---------- 全局注入 PSC-SDK 寻址 ----------
_candidate_psc_dirs = [
    os.environ.get("PSC_SDK_PATH"),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "PSC-SDK")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "PSC-SDK")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "PSC-SDK")),
    "/home/lucifer/project/vcpsystem/VCPChat/VCPFile/PSC-SDK",
]
for _d in _candidate_psc_dirs:
    if _d and os.path.exists(_d) and _d not in sys.path:
        sys.path.insert(0, _d)

# ---------- 可选依赖（延迟导入） ----------

def _import_pil():
    from PIL import Image
    return Image


def _import_numpy():
    import numpy as np
    return np


# ---------- 平台能力探测 ----------

class Capabilities:
    def __init__(self):
        self.is_wayland = bool(os.environ.get("WAYLAND_DISPLAY")) or \
                          os.environ.get("XDG_SESSION_TYPE") == "wayland"
        self.is_x11 = not self.is_wayland

        self.hyprland = bool(os.environ.get("HYPRLAND_INSTANCE_SIGNATURE"))
        self.niri = bool(os.environ.get("NIRI_SOCKET"))
        self.sway = bool(os.environ.get("SWAYSOCK"))
        self.gnome = os.environ.get("XDG_CURRENT_DESKTOP") == "GNOME"
        self.kde = os.environ.get("XDG_CURRENT_DESKTOP") == "KDE"

        self.has_wmctrl = shutil.which("wmctrl") is not None
        self.has_xprop = shutil.which("xprop") is not None
        self.has_xdotool = shutil.which("xdotool") is not None
        self.has_grim = shutil.which("grim") is not None
        self.has_wlr_shot = shutil.which("wlr-shot") is not None
        self.has_ydotool = shutil.which("ydotool") is not None
        self.has_hyprctl = shutil.which("hyprctl") is not None
        self.has_niri = shutil.which("niri") is not None
        self.has_swaymsg = shutil.which("swaymsg") is not None
        self.has_busctl = shutil.which("busctl") is not None

        try:
            import mss  # noqa
            self.has_mss = True
        except Exception:
            self.has_mss = False

        try:
            import dbus  # noqa
            self.has_dbus = True
        except Exception:
            self.has_dbus = False

    def compositor_name(self):
        if self.hyprland: return "hyprland"
        if self.niri: return "niri"
        if self.sway: return "sway"
        if self.gnome: return "gnome"
        if self.kde: return "kde"
        return "unknown"

    def has_compositor_ipc(self):
        return (
            (self.hyprland and self.has_hyprctl) or
            (self.niri and self.has_niri) or
            (self.sway and self.has_swaymsg)
        )

    def to_dict(self):
        return {k: v for k, v in self.__dict__.items() if not k.startswith("_")}


CAPS = Capabilities()


# ---------- 日志与输出 ----------

def debug_log(msg):
    sys.stderr.write(f"[ScreenPilot-Linux DEBUG] {msg}\n")
    sys.stderr.flush()


def _write_worker_message(payload):
    data = (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")
    sys.stdout.buffer.write(data)
    sys.stdout.buffer.flush()


def _err(code, message, retryable=False, details=None):
    return {
        "status": "error",
        "error": message,
        "errorDetails": {
            "code": code,
            "message": message,
            "retryable": retryable,
            "details": details or {},
        },
    }


def _run(cmd, timeout=5):
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=False,
            timeout=timeout,
        )
        return proc.returncode, proc.stdout, proc.stderr
    except subprocess.TimeoutExpired:
        return -1, b"", f"命令超时: {' '.join(cmd)}".encode("utf-8")
    except FileNotFoundError:
        return -2, b"", f"命令不存在: {cmd[0]}".encode("utf-8")
    except Exception as e:
        return -3, b"", str(e).encode("utf-8")


# ---------- 参数规范化 ----------

def normalize_args(args):
    return {k.lower(): v for k, v in args.items()}


def _bool_arg(value, default=False):
    if value is None or value == "":
        return default
    return str(value).strip().lower() in ("true", "1", "yes", "on")


# ============================================================
# 内存管理
# ============================================================

_OCR_CALL_COUNT = 0
_OCR_RESTART_THRESHOLD = int(os.environ.get("SCREENPILOT_OCR_RESTART_THRESHOLD", "200"))
_OCR_MEM_LIMIT_MB = int(os.environ.get("SCREENPILOT_OCR_MEM_LIMIT_MB", "2048"))
_OCR_LOCK = threading.Lock()
_OCR_ENGINE = None


def _get_rss_mb():
    try:
        with open("/proc/self/status") as f:
            for line in f:
                if line.startswith("VmRSS:"):
                    return int(line.split()[1]) / 1024
    except Exception:
        pass
    try:
        import resource
        return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024
    except Exception:
        return 0.0


def _force_gc():
    for _ in range(3):
        gc.collect()


def _maybe_release_ocr_engine():
    global _OCR_ENGINE, _OCR_CALL_COUNT

    with _OCR_LOCK:
        _OCR_CALL_COUNT += 1
        rss = _get_rss_mb()

        need_release = False
        reason = ""

        if _OCR_CALL_COUNT >= _OCR_RESTART_THRESHOLD:
            need_release = True
            reason = f"调用次数达阈值 {_OCR_RESTART_THRESHOLD}"
        elif _OCR_MEM_LIMIT_MB > 0 and rss >= _OCR_MEM_LIMIT_MB:
            need_release = True
            reason = f"RSS {rss:.0f}MB 超过阈值 {_OCR_MEM_LIMIT_MB}MB"

        if need_release and _OCR_ENGINE is not None:
            debug_log(f"释放 OCR 引擎（{reason}），RSS={rss:.0f}MB")
            try:
                del _OCR_ENGINE
            except Exception:
                pass
            _OCR_ENGINE = None
            _OCR_CALL_COUNT = 0
            _force_gc()
            debug_log(f"释放后 RSS={_get_rss_mb():.0f}MB")
            return True

    return False


def get_memory_status():
    return {
        "rss_mb": round(_get_rss_mb(), 1),
        "ocr_call_count": _OCR_CALL_COUNT,
        "ocr_restart_threshold": _OCR_RESTART_THRESHOLD,
        "ocr_mem_limit_mb": _OCR_MEM_LIMIT_MB,
        "ocr_engine_loaded": _OCR_ENGINE is not None,
    }


# ============================================================
# QueryWindows
# ============================================================

def cmd_query_windows(args):
    try:
        import sys
        candidate_dirs = [
            os.environ.get("PSC_SDK_PATH"),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "PSC-SDK")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "PSC-SDK")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "PSC-SDK"))
        ]
        sdk_path = next((d for d in candidate_dirs if d and os.path.exists(d)), None)
        if sdk_path and sdk_path not in sys.path:
            sys.path.insert(0, sdk_path)
        from core import psc
        from abstraction.window import IWindowManager
        win_mgr = psc.resolve(IWindowManager)
        windows = win_mgr.list_windows(visible_only=True)
        formatted_list = []
        for w in windows:
            formatted_list.append({
                "hwnd": str(w.get("hwnd", "")),
                "title": str(w.get("title", "")),
                "processName": str(w.get("app_id", "")),
                "pid": int(w.get("pid") or 0),
                "bounds": w.get("bounds")
            })
        lines_out = ["【实时窗口状态查询】"]
        for w in formatted_list:
            lines_out.append(f"[{w['pid']}] {w['processName']} : {w['title']} (ID: {w['hwnd']})")
        return {
            "status": "success",
            "result": {
                "content": [{"type": "text", "text": chr(10).join(lines_out)}],
                "windows": formatted_list,
                "count": len(formatted_list)
            }
        }
    except Exception as e:
        return _err("QUERY_WINDOWS_FAILED", f"PSC 查询窗口失败: {e}")

# ============================================================
# 截图（由 PSC 底座统一承载，多合成器与 X11 退化交由方案层与补偿层）
# ============================================================

def _capture_screen_via_psc():
    Image = _import_pil()
    try:
        from core import psc
        from abstraction.capture import ICapture
        cap = psc.resolve(ICapture)
        img_bytes, rect, backend = cap.capture_screen()
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        return img, rect, f"psc-{backend}"
    except Exception as e:
        debug_log(f"PSC 抓屏失败，执行本地兜底: {e}")
        if CAPS.is_wayland and CAPS.has_grim:
            rc, out, err = _run(["grim", "-t", "png", "-"], timeout=10)
            if rc == 0 and out:
                img = Image.open(io.BytesIO(out)).convert("RGB")
                return img, {"x": 0, "y": 0, "width": img.width, "height": img.height}, "grim-fallback"
        raise RuntimeError(f"抓屏失败: {e}")

def _capture_window_via_psc(hwnd, window_title, process_name):
    Image = _import_pil()
    from core import psc
    from abstraction.window import IWindowManager
    from abstraction.capture import ICapture
    
    target_hwnd = hwnd
    target_win = None
    if not target_hwnd:
        win_mgr = psc.resolve(IWindowManager)
        target_win = win_mgr.find_window(app_id=process_name or window_title)
        if target_win:
            target_hwnd = target_win.get("hwnd")

    if not target_hwnd:
        raise RuntimeError(f"未找到目标窗口: hwnd={hwnd} title={window_title} process={process_name}")

    cap = psc.resolve(ICapture)
    img_bytes, rect, backend = cap.capture_window(str(target_hwnd))
    
    if img_bytes and len(img_bytes) > 0 and backend == "native":
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        r = target_win.get("rect") if target_win else {"x": 0, "y": 0, "width": img.width, "height": img.height}
        return img, r, f"psc-{backend}"
        
    # 触发代偿层：全屏截取 + 物理矩形裁切 (Compensation Layer)
    try:
        from compensation.capture_fallback import CaptureFallbackCompensator
        full_img, full_rect, _ = _capture_screen_via_psc()
        buf = io.BytesIO()
        full_img.save(buf, format="PNG")
        
        target_rect = target_win.get("rect") if target_win else {"x": 0, "y": 0, "width": full_img.width, "height": full_img.height}
        cropped_bytes, cropped_rect, comp_mode = CaptureFallbackCompensator.crop_region(buf.getvalue(), target_rect)
        img = Image.open(io.BytesIO(cropped_bytes)).convert("RGB")
        return img, cropped_rect, f"psc-{comp_mode}"
    except Exception as e:
        debug_log(f"代偿抓帧失败: {e}")
        return _capture_screen_via_psc()

def cmd_screen_capture(args):
    a = normalize_args(args)
    hwnd = a.get("hwnd")
    window_title = a.get("windowtitle") or a.get("window_title") or a.get("title")
    process_name = a.get("processname") or a.get("process_name") or a.get("process")
    save = _bool_arg(a.get("save"), False)
    do_ocr = _bool_arg(a.get("ocr"), False)
    filename = a.get("filename")

    captured_title = "全屏截图"
    capture_rect = None
    backend = None

    try:
        if hwnd or window_title or process_name:
            img, capture_rect, backend = _capture_window_via_psc(hwnd, window_title, process_name)
            captured_title = f"窗口截图 ({window_title or process_name or hwnd})"
        else:
            img, capture_rect, backend = _capture_screen_via_psc()
    except Exception as e:
        return _err("CAPTURE_FAILED", str(e))
    width, height = img.size

    output_format = str(a.get("format") or "jpeg").lower()
    quality = int(a.get("quality") or 85)
    if output_format in ("jpg", "jpeg"):
        if img.mode != "RGB":
            img = img.convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=max(1, min(100, quality)))
        mime = "image/jpeg"
        encoded_format = "JPEG"
    else:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        mime = "image/png"
        encoded_format = "PNG"

    data_uri = f"data:{mime};base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
    del buf

    text_parts = [
        f"截图成功: {captured_title}",
        f"分辨率: {width} × {height} 像素",
        f"传输格式: {encoded_format}" + (f"（质量 {quality}）" if encoded_format == "JPEG" else ""),
        f"截图后端: {backend}",
    ]

    saved_path = None
    if save:
        screenshot_dir = os.environ.get("SCREENSHOT_DIR") or \
            os.path.join(os.path.dirname(os.path.abspath(__file__)), "screenshots")
        os.makedirs(screenshot_dir, exist_ok=True)
        if not filename:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_title = re.sub(r'[<>:"/\\|?*]', '_', (captured_title or "screenshot")[:30])
            filename = f"{safe_title}_{ts}.png"
        save_path = os.path.join(screenshot_dir, filename)
        img.save(save_path, "PNG")
        saved_path = save_path
        text_parts.append(f"已保存到: {save_path}")

    ocr_blocks = None
    if do_ocr:
        try:
            min_conf = float(a.get("minconfidence") or a.get("min_confidence") or 0.0)
        except (TypeError, ValueError):
            min_conf = 0.0
        try:
            ocr_blocks = run_ocr(img, capture_rect, min_confidence=min_conf)
            _force_gc()
            text_parts.append(f"\nOCR 检测到 {len(ocr_blocks)} 个文本区域:")
            for i, blk in enumerate(ocr_blocks, 1):
                cp = blk["clickablePoint"]
                text_parts.append(
                    f'  [{i}] "{blk["text"]}" → 点击({cp["x"]},{cp["y"]}) 置信度:{blk["confidence"]}'
                )
        except Exception as e:
            debug_log(f"OCR 失败: {e}")
            text_parts.append(f"\nOCR 检测失败: {e}")

    result = {
        "content": [
            {"type": "text", "text": "\n".join(text_parts)},
            {"type": "image_url", "image_url": {"url": data_uri}},
        ],
        "resolution": {"width": width, "height": height},
        "captureRect": capture_rect,
        "captureBackend": backend,
        "captureMethod": "fullscreen" if "全屏" in captured_title else "window",
    }
    if saved_path:
        result["savedPath"] = saved_path
    if ocr_blocks is not None:
        result["ocrResults"] = ocr_blocks

    return {"status": "success", "result": result}


# ============================================================
# 点击 / 输入 / 滚动
# ============================================================

def _simulate_click(x, y, button="left", clicks=1):
    if CAPS.is_x11:
        if not CAPS.has_xdotool:
            raise RuntimeError("X11 下需要 xdotool（pacman -S xdotool）")
        btn_map = {"left": "1", "middle": "2", "right": "3"}
        btn = btn_map.get(button, "1")
        _run(["xdotool", "mousemove", str(x), str(y)], timeout=3)
        for _ in range(clicks):
            _run(["xdotool", "click", btn], timeout=3)
        return

    if not CAPS.has_ydotool:
        raise RuntimeError("Wayland 下需要 ydotool + uinput 权限")
    btn_map = {"left": "0x40", "middle": "0x42", "right": "0x41"}
    btn = btn_map.get(button, "0x40")
    _run(["ydotool", "mousemove", "--absolute", "-x", str(x), "-y", str(y)], timeout=3)
    for _ in range(clicks):
        _run(["ydotool", "click", btn], timeout=3)


def _simulate_text(text):
    if CAPS.is_x11:
        if not CAPS.has_xdotool:
            raise RuntimeError("X11 下需要 xdotool")
        _run(["xdotool", "type", "--clearmodifiers", "--", text], timeout=10)
        return
    if not CAPS.has_ydotool:
        raise RuntimeError("Wayland 下需要 ydotool")
    _run(["ydotool", "type", "--", text], timeout=10)


def _simulate_key(keyname):
    if CAPS.is_x11:
        if not CAPS.has_xdotool:
            raise RuntimeError("X11 下需要 xdotool")
        _run(["xdotool", "key", keyname], timeout=3)
        return
    if not CAPS.has_ydotool:
        raise RuntimeError("Wayland 下需要 ydotool")
    keycode_map = {"Return": "28", "Enter": "28"}
    code = keycode_map.get(keyname)
    if code:
        _run(["ydotool", "key", code], timeout=3)


def cmd_click_at(args):
    a = normalize_args(args)
    x = a.get("x")
    y = a.get("y")
    if x is None or y is None:
        return _err("INVALID_ARGS", "必须提供 x 和 y 坐标参数。")
    x, y = int(x), int(y)
    button = str(a.get("button", "left")).lower()
    clicks = int(a.get("clicks", 1))
    if button not in ("left", "right", "middle"):
        return _err("INVALID_ARGS", f"无效的 button: {button}")

    if _bool_arg(a.get("background")):
        return _err("UNSUPPORTED", "Linux 下不支持后台点击（无 PostMessage 等价机制）。")

    try:
        _simulate_click(x, y, button, clicks)
    except Exception as e:
        return _err("CLICK_FAILED", str(e))

    return {
        "status": "success",
        "result": f"已在屏幕坐标 ({x}, {y}) 执行 {button} 键点击 {clicks} 次。",
    }


def cmd_type_text(args):
    a = normalize_args(args)
    text = a.get("text") or a.get("content") or a.get("value")
    if not text:
        return _err("INVALID_ARGS", "必须提供 text 参数。")
    text = str(text)
    press_enter = _bool_arg(a.get("enter") or a.get("pressenter"), False)

    try:
        _simulate_text(text)
        if press_enter:
            _simulate_key("Return")
    except Exception as e:
        return _err("TYPE_FAILED", str(e))

    return {
        "status": "success",
        "result": f"已输入文本（{len(text)} 字符）" + ("，并按下回车" if press_enter else ""),
    }


def cmd_scroll_at(args):
    a = normalize_args(args)
    direction = str(a.get("direction") or a.get("dir") or "").lower()
    if direction not in ("up", "down"):
        return _err("INVALID_ARGS", "必须提供 direction: up / down。")
    amount = int(a.get("amount") or a.get("clicks") or 3)
    x = a.get("x")
    y = a.get("y")

    # 优先使用 PSC 核心补天代偿器: uinput 裸写 REL_WHEEL
    try:
        from core import psc
        wheel = psc.compensate_wheel()
        if wheel:
            if x is not None and y is not None:
                _simulate_click(int(x), int(y), "left", 0)
            if wheel.scroll(amount, direction):
                return {"status": "success", "result": f"已通过 PSC 内核代偿器滚动 {direction} {amount} 个刻度。"}
    except Exception as e:
        debug_log(f"PSC 滚轮代偿尝试异常: {e}")

    if CAPS.is_x11 and CAPS.has_xdotool:
        if x is not None and y is not None:
            _run(["xdotool", "mousemove", str(int(x)), str(int(y))], timeout=3)
        btn = "4" if direction == "up" else "5"
        for _ in range(amount):
            _run(["xdotool", "click", btn], timeout=3)
        return {"status": "success", "result": f"已滚动 {direction} {amount} 个刻度 (X11)。"}

    return _err("UNSUPPORTED", "当前会话无 uinput 写入权限且非标准 X11，滚轮代偿不可达。")

# ============================================================
# OCR（RapidOCR）
# ============================================================

def get_ocr_engine():
    global _OCR_ENGINE
    if _OCR_ENGINE is not None:
        return _OCR_ENGINE

    try:
        from rapidocr import RapidOCR
    except ImportError as e:
        raise RuntimeError(
            f"RapidOCR 未安装：{e}。请执行 pacman -S python-onnxruntime-cpu 后 "
            f"yay -S python-rapidocr 或 pip install --user rapidocr"
        )

    try:
        _OCR_ENGINE = RapidOCR()
        debug_log(f"RapidOCR 引擎已加载，RSS={_get_rss_mb():.0f}MB")
    except Exception as e:
        raise RuntimeError(f"RapidOCR 初始化失败: {e}")

    return _OCR_ENGINE


def run_ocr(img, capture_rect=None, min_confidence=0.0, **options):
    _maybe_release_ocr_engine()

    engine = get_ocr_engine()
    np = _import_numpy()

    arr_rgb = np.array(img.convert("RGB"))
    arr_bgr = arr_rgb[:, :, ::-1].copy()
    del arr_rgb

    try:
        result = engine(arr_bgr)
    finally:
        del arr_bgr

    blocks = []

    boxes = getattr(result, "boxes", None)
    txts = getattr(result, "txts", None)
    scores = getattr(result, "scores", None)

    if boxes is None and isinstance(result, (tuple, list)) and len(result) >= 1:
        payload = result[0] if len(result) == 1 else result
        if isinstance(payload, (tuple, list)) and len(payload) == 3:
            boxes, txts, scores = payload
        elif payload is None:
            boxes, txts, scores = None, None, None

    if boxes is not None and txts is not None and scores is not None:
        for box, text, conf in zip(boxes, txts, scores):
            conf = float(conf)
            if conf < min_confidence:
                continue
            xs = [int(p[0]) for p in box]
            ys = [int(p[1]) for p in box]
            x, y = min(xs), min(ys)
            w, h = max(xs) - min(xs), max(ys) - min(ys)
            if w <= 0 or h <= 0:
                continue
            blocks.append({
                "text": str(text),
                "confidence": round(conf, 4),
                "boundingRect": {"x": x, "y": y, "width": w, "height": h},
                "clickablePoint": {"x": x + w // 2, "y": y + h // 2},
            })

    del result

    if capture_rect:
        ox = capture_rect.get("x", 0)
        oy = capture_rect.get("y", 0)
        for b in blocks:
            b["clickablePoint"]["x"] += ox
            b["clickablePoint"]["y"] += oy
            b["boundingRect"]["x"] += ox
            b["boundingRect"]["y"] += oy

    return blocks


# ============================================================
# ClickText
# ============================================================

def cmd_click_text(args):
    a = normalize_args(args)
    target_text = a.get("text") or a.get("target") or a.get("label")
    if not target_text:
        return _err("INVALID_ARGS", "必须提供 text 参数。")
    button = str(a.get("button", "left")).lower()
    clicks = int(a.get("clicks", 1))
    match_mode = str(a.get("matchmode") or a.get("match_mode") or "fuzzy").lower()
    index = int(a.get("index") or a.get("nth") or 1)

    try:
        img, capture_rect, _ = _capture_screen()
    except Exception as e:
        return _err("CAPTURE_FAILED", str(e))

    try:
        blocks = run_ocr(img, capture_rect)
        _force_gc()
    except Exception as e:
        return _err("OCR_FAILED", f"OCR 失败: {e}")

    if not blocks:
        return _err("OCR_EMPTY", "截图中未检测到任何文本。")

    def strip_noise(s):
        return re.sub(
            r'[\s\u3000!-/:-@\[-`{-~\u2000-\u206f\u3000-\u303f'
            r'\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]',
            '', s
        )

    target_lower = target_text.lower()
    target_stripped = strip_noise(target_lower)
    matches = []
    for blk in blocks:
        blk_lower = blk["text"].lower()
        blk_stripped = strip_noise(blk_lower)
        if match_mode == "exact" and blk_lower == target_lower:
            matches.append(blk)
        elif match_mode == "startswith" and blk_lower.startswith(target_lower):
            matches.append(blk)
        elif match_mode == "contains" and target_lower in blk_lower:
            matches.append(blk)
        elif match_mode == "fuzzy" and target_stripped and target_stripped in blk_stripped:
            matches.append(blk)

    if not matches:
        all_texts = [f'"{b["text"]}"' for b in blocks[:20]]
        return _err("TEXT_NOT_FOUND",
                    f"未找到包含 '{target_text}' 的文本。检测到: {', '.join(all_texts)}")
    if index > len(matches):
        return _err("INDEX_OUT_OF_RANGE",
                    f"找到 {len(matches)} 个匹配，但请求第 {index} 个。")

    selected = matches[index - 1]
    cx = selected["clickablePoint"]["x"]
    cy = selected["clickablePoint"]["y"]

    try:
        _simulate_click(cx, cy, button, clicks)
    except Exception as e:
        return _err("CLICK_FAILED", str(e))

    return {
        "status": "success",
        "result": {
            "content": [{"type": "text", "text": f'已点击文本 "{selected["text"]}" @ ({cx},{cy})'}],
            "clickedText": selected["text"],
            "clickedPoint": {"x": cx, "y": cy},
            "totalMatches": len(matches),
            "allOcrTexts": [b["text"] for b in blocks],
        },
    }


# ============================================================
# ClickVisual
# ============================================================

def _call_vision_edit_api(image_data_uri, prompt):
    import urllib.request
    import urllib.error

    api_base = os.environ.get("VISION_API_BASE_URL", "").strip()
    model = os.environ.get("VISION_EDIT_MODEL", "").strip()
    api_key = os.environ.get("VISION_API_KEY", "").strip()
    fmt = os.environ.get("VISION_API_FORMAT", "chat").strip().lower()

    if not api_base or not model or not api_key:
        raise RuntimeError(
            "缺少 VISION_API_BASE_URL / VISION_EDIT_MODEL / VISION_API_KEY 环境变量"
        )

    if fmt == "images":
        url = f"{api_base.rstrip('/')}/images/generations"
        payload = json.dumps({"model": model, "prompt": prompt, "image": image_data_uri})
    else:
        url = api_base.rstrip("/")
        if url.endswith("/v1"):
            url += "/chat/completions"
        else:
            url += "/v1/chat/completions"
        payload = json.dumps({
            "model": model,
            "stream": False,
            "messages": [{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_data_uri}},
                ],
            }],
        })

    req = urllib.request.Request(
        url,
        data=payload.encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        resp_data = json.loads(resp.read().decode("utf-8"))

    if fmt == "images":
        images = resp_data.get("images") or resp_data.get("data")
        if not images:
            raise RuntimeError(f"API 未返回图片: {json.dumps(resp_data)[:200]}")
        img_url = images[0].get("url") or images[0].get("b64_json")
        return _decode_image_payload(img_url)

    message = resp_data.get("choices", [{}])[0].get("message", {})
    content = message.get("content", "")
    m = re.search(r'!\[.*?\]\((data:image/\w+;base64,[\s\S]*?)\)', content)
    if m:
        _, b64 = m.group(1).split(",", 1)
        return base64.b64decode(b64.replace("\n", "").replace(" ", ""))
    if message.get("images"):
        return _decode_image_payload(message["images"][0].get("image_url", {}).get("url", ""))
    raise RuntimeError(f"API 未返回图片: {content[:200]}")


def _decode_image_payload(img_url):
    import urllib.request
    if not img_url:
        raise RuntimeError("图片 URL 为空")
    if img_url.startswith("http"):
        with urllib.request.urlopen(img_url, timeout=60) as r:
            return r.read()
    if img_url.startswith("data:"):
        _, b64 = img_url.split(",", 1)
        return base64.b64decode(b64.replace("\n", "").replace(" ", ""))
    return base64.b64decode(img_url)


def find_white_marker(img_original, img_edited):
    np = _import_numpy()
    if img_edited.size != img_original.size:
        img_edited = img_edited.resize(img_original.size, resample=3)

    arr_orig = np.array(img_original.convert("RGB"), dtype=np.uint8)
    arr_edit = np.array(img_edited.convert("RGB"), dtype=np.uint8)

    edit_white = (arr_edit[:, :, 0] > 240) & (arr_edit[:, :, 1] > 240) & (arr_edit[:, :, 2] > 240)
    orig_white = (arr_orig[:, :, 0] > 240) & (arr_orig[:, :, 1] > 240) & (arr_orig[:, :, 2] > 240)
    painted = edit_white & ~orig_white

    count = int(np.sum(painted))
    if count == 0:
        return None

    h, w = painted.shape
    total = h * w
    pct = round(count / total * 100, 2)

    block = 30
    bh, bw = h // block, w // block
    if bh == 0 or bw == 0:
        ys, xs = np.where(painted)
        cx, cy = int(np.mean(xs)), int(np.mean(ys))
    else:
        trimmed = painted[:bh * block, :bw * block]
        density = trimmed.reshape(bh, block, bw, block).sum(axis=(1, 3))
        peak_by, peak_bx = np.unravel_index(np.argmax(density), density.shape)
        margin = 5
        y0 = max(0, (peak_by - margin) * block)
        y1 = min(h, (peak_by + margin + 1) * block)
        x0 = max(0, (peak_bx - margin) * block)
        x1 = min(w, (peak_bx + margin + 1) * block)
        local = painted[y0:y1, x0:x1]
        lys, lxs = np.where(local)
        if len(lxs) == 0:
            ys, xs = np.where(painted)
            cx, cy = int(np.mean(xs)), int(np.mean(ys))
        else:
            cx = int(np.mean(lxs)) + x0
            cy = int(np.mean(lys)) + y0

    ys_all, xs_all = np.where(painted)
    bbox = {
        "x": int(np.min(xs_all)), "y": int(np.min(ys_all)),
        "width": int(np.max(xs_all) - np.min(xs_all)),
        "height": int(np.max(ys_all) - np.min(ys_all)),
    }
    return cx, cy, bbox, pct


def cmd_click_visual(args):
    a = normalize_args(args)
    description = a.get("description") or a.get("target") or a.get("desc") or a.get("text")
    if not description:
        return _err("INVALID_ARGS", "必须提供 description 参数。")
    button = str(a.get("button", "left")).lower()
    clicks = int(a.get("clicks", 1))

    try:
        img, capture_rect, _ = _capture_screen()
    except Exception as e:
        return _err("CAPTURE_FAILED", str(e))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    original_data_uri = f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"
    del buf

    prompt = (
        f"请在图中找到「{description}」的精确位置，"
        f"然后在它的正中心画一个纯白色(#FFFFFF)实心圆，"
        f"圆的大小刚好能完全覆盖住或者标记目标正中心即可，不要画太大。"
        f"圆心必须对准目标的中心。其他区域保持不变。"
    )

    try:
        edited_bytes = _call_vision_edit_api(original_data_uri, prompt)
    except Exception as e:
        return _err("VISION_API_FAILED", f"图像编辑 API 调用失败: {e}")

    try:
        Image = _import_pil()
        edited_img = Image.open(io.BytesIO(edited_bytes)).convert("RGB")
    except Exception as e:
        return _err("IMAGE_DECODE_FAILED", f"无法解析 API 返回图片: {e}")
    finally:
        del edited_bytes

    marker = find_white_marker(img, edited_img)
    if marker is None:
        return _err("MARKER_NOT_FOUND", "未检测到白色圆球，模型可能没正确标记。")

    img_cx, img_cy, bbox, pct = marker
    if pct > 30:
        return _err("MARKER_TOO_LARGE", f"白色区域占比 {pct}% 过大，模型可能画错了。")

    screen_x = img_cx + capture_rect.get("x", 0)
    screen_y = img_cy + capture_rect.get("y", 0)

    try:
        _simulate_click(screen_x, screen_y, button, clicks)
    except Exception as e:
        return _err("CLICK_FAILED", str(e))

    return {
        "status": "success",
        "result": {
            "content": [{"type": "text",
                         "text": f'已通过视觉定位点击 "{description}" @ ({screen_x},{screen_y})'}],
            "clickedPoint": {"x": screen_x, "y": screen_y},
            "paintedRegion": bbox,
            "paintedPercentage": pct,
        },
    }


# ============================================================
# AT-SPI InspectUI（含 Wayland 坐标换算）
# ============================================================

_ATSPI_ACCESSIBLE_IFACE = 'org.a11y.atspi.Accessible'
_ATSPI_COMPONENT_IFACE = 'org.a11y.atspi.Component'
_ATSPI_APPLICATION_IFACE = 'org.a11y.atspi.Application'
_ATSPI_REGISTRY_BUS = 'org.a11y.atspi.Registry'
_ATSPI_ROOT_PATH = '/org/a11y/atspi/accessible/root'

_ROLE_MAP = {
    0: 'invalid', 1: 'accelerator label', 2: 'alert', 3: 'animation',
    4: 'arrow', 5: 'calendar', 6: 'canvas', 7: 'check box',
    8: 'check menu item', 9: 'color chooser', 10: 'column header',
    11: 'combo box', 12: 'date editor', 13: 'desktop icon',
    14: 'desktop frame', 15: 'dial', 16: 'dialog', 17: 'directory pane',
    18: 'drawing area', 19: 'file chooser', 20: 'filler',
    21: 'font chooser', 22: 'frame', 23: 'glass pane',
    24: 'html container', 25: 'icon', 26: 'image', 27: 'internal frame',
    28: 'label', 29: 'layered pane', 30: 'list', 31: 'list item',
    32: 'menu', 33: 'menu bar', 34: 'menu item', 35: 'option pane',
    36: 'page tab', 37: 'page tab list', 38: 'panel', 39: 'password text',
    40: 'popup menu', 41: 'progress bar', 42: 'push button',
    43: 'radio button', 44: 'radio menu item', 45: 'root pane',
    46: 'row header', 47: 'scroll bar', 48: 'scroll pane',
    49: 'separator', 50: 'slider', 51: 'spin button', 52: 'statusbar',
    53: 'table', 54: 'table cell', 55: 'tearoff menu item',
    56: 'terminal', 57: 'text', 58: 'toggle button', 59: 'tool bar',
    60: 'tool tip', 61: 'tree', 62: 'tree table', 63: 'unknown',
    64: 'viewport', 65: 'window', 66: 'extended', 67: 'header',
    68: 'footer', 69: 'paragraph', 70: 'ruler', 71: 'application',
    72: 'autocomplete', 73: 'editbar', 74: 'embedded',
    75: 'entry', 76: 'chart', 77: 'caption', 78: 'document frame',
    79: 'heading', 80: 'page', 81: 'section', 82: 'redundant object',
    83: 'form', 84: 'link', 85: 'input method window',
    86: 'table row', 87: 'tree item', 88: 'document spreadsheet',
    89: 'document presentation', 90: 'document text',
    91: 'document web', 92: 'document email', 93: 'comment',
    94: 'list box', 95: 'grouping', 96: 'image map',
    97: 'notification', 98: 'info bar', 99: 'level bar',
    100: 'title bar', 101: 'block quote', 102: 'audio',
    103: 'video', 104: 'definition', 105: 'article',
    106: 'landmark', 107: 'log', 108: 'marquee',
    109: 'math', 110: 'rating', 111: 'timer',
    112: 'description list', 113: 'description term',
    114: 'description value',
}


def _get_a11y_bus():
    if not CAPS.has_dbus:
        return None
    import dbus
    try:
        session_bus = dbus.SessionBus()
        bus_launcher = session_bus.get_object('org.a11y.Bus', '/org/a11y/bus')
        a11y_address = str(bus_launcher.GetAddress(dbus_interface='org.a11y.Bus'))
        if not a11y_address:
            return None
        return dbus.bus.BusConnection(a11y_address)
    except Exception as e:
        debug_log(f"无法获取 AT-SPI 总线: {e}")
        return None


def _enable_accessibility():
    if not CAPS.has_dbus:
        return False
    import dbus
    try:
        bus = dbus.SessionBus()
        a11y_bus = bus.get_object('org.a11y.Bus', '/org/a11y/bus')
        props = dbus.Interface(a11y_bus, 'org.freedesktop.DBus.Properties')

        try:
            current = props.Get('org.a11y.Status', 'IsEnabled')
            if bool(current):
                debug_log("无障碍已启用，跳过激活")
                return True
        except Exception:
            pass

        props.Set('org.a11y.Status', 'IsEnabled', dbus.Boolean(True))
        try:
            props.Set('org.a11y.Status', 'ScreenReaderEnabled', dbus.Boolean(True))
        except Exception:
            pass

        debug_log("无障碍状态已激活")
        return True
    except Exception as e:
        debug_log(f"激活无障碍失败: {e}")
        return False


def _setup_xwayland_at_spi():
    if not (os.environ.get('DISPLAY') and os.environ.get('WAYLAND_DISPLAY')):
        return
    if not CAPS.has_xprop or not CAPS.has_busctl:
        return

    try:
        rc, out, _ = _run([
            'busctl', 'call', '--user',
            'org.a11y.Bus', '/org/a11y/bus',
            'org.a11y.Bus', 'GetAddress'
        ], timeout=3)
        if rc != 0:
            return

        text = out.decode('utf-8', 'replace').strip()
        m = re.search(r's\s+"(.+)"', text)
        if not m:
            return
        a11y_addr = m.group(1)

        _run([
            'xprop', '-root',
            '-format', 'AT_SPI_BUS', '8s',
            '-set', 'AT_SPI_BUS', a11y_addr
        ], timeout=3)
        debug_log(f"XWayland AT_SPI_BUS 已设置: {a11y_addr}")
    except Exception as e:
        debug_log(f"设置 XWayland AT_SPI_BUS 失败: {e}")


# ---------- 合成器窗口几何查询 ----------

def _get_window_geometry_from_compositor(window_title=None, process_name=None, hwnd=None):
    if CAPS.hyprland and CAPS.has_hyprctl:
        client = _hyprland_find_client(hwnd, window_title, process_name)
        if client:
            at = client.get("at", [0, 0])
            size = client.get("size", [0, 0])
            return {
                "x": int(at[0]), "y": int(at[1]),
                "width": int(size[0]), "height": int(size[1]),
            }
        return None

    if CAPS.niri and CAPS.has_niri:
        target = _niri_find_window(window_title, process_name)
        if target:
            layout = target.get("layout", {}) or {}
            pos = layout.get("tile_pos_in_workspace_view") or \
                  layout.get("pos_in_scrolling_layout")
            size = layout.get("tile_size")
            if pos and size:
                return {
                    "x": int(pos[0]), "y": int(pos[1]),
                    "width": int(size[0]), "height": int(size[1]),
                }
        return None

    if CAPS.sway and CAPS.has_swaymsg:
        target = _sway_find_window(window_title, process_name)
        if target:
            rect = target.get("rect", {})
            return {
                "x": int(rect.get("x", 0)), "y": int(rect.get("y", 0)),
                "width": int(rect.get("width", 0)),
                "height": int(rect.get("height", 0)),
            }
        return None

    if CAPS.is_x11 and CAPS.has_wmctrl:
        target = _resolve_x11_window(hwnd, window_title, process_name)
        if target:
            return target[2]

    return None


# ---------- AT-SPI 基础读取 ----------

def _atspi_get_property(bus, bus_name, path, iface, prop_name):
    import dbus
    try:
        obj = bus.get_object(bus_name, path)
        props = dbus.Interface(obj, 'org.freedesktop.DBus.Properties')
        return props.Get(iface, prop_name)
    except Exception:
        return None


def _atspi_get_role_name(bus, bus_name, path):
    role = _atspi_get_property(bus, bus_name, path, _ATSPI_ACCESSIBLE_IFACE, 'Role')
    if role is None:
        return 'unknown'
    try:
        return _ROLE_MAP.get(int(role), f'role_{role}')
    except Exception:
        return f'role_{role}'


def _atspi_get_name(bus, bus_name, path):
    name = _atspi_get_property(bus, bus_name, path, _ATSPI_ACCESSIBLE_IFACE, 'Name')
    return str(name) if name else ''


def _atspi_get_child_count(bus, bus_name, path):
    count = _atspi_get_property(bus, bus_name, path, _ATSPI_ACCESSIBLE_IFACE, 'ChildCount')
    try:
        return int(count) if count is not None else 0
    except Exception:
        return 0


def _atspi_get_child_at_index(bus, bus_name, path, index):
    import dbus
    try:
        obj = bus.get_object(bus_name, path)
        acc = dbus.Interface(obj, _ATSPI_ACCESSIBLE_IFACE)
        child_ref = acc.GetChildAtIndex(index)
        if child_ref and len(child_ref) >= 2:
            return (str(child_ref[0]), str(child_ref[1]))
    except Exception:
        pass
    return None


def _atspi_get_screen_bbox(bus, bus_name, path):
    import dbus
    try:
        obj = bus.get_object(bus_name, path)
        comp = dbus.Interface(obj, _ATSPI_COMPONENT_IFACE)
        extents = comp.GetExtents(0)
        if extents and len(extents) >= 4:
            x, y, w, h = [int(v) for v in extents[:4]]
            if w > 0 and h > 0:
                return {"x": x, "y": y, "width": w, "height": h}
    except Exception:
        pass
    return None


def _atspi_get_window_relative_bbox(bus, bus_name, path):
    import dbus
    try:
        obj = bus.get_object(bus_name, path)
        comp = dbus.Interface(obj, _ATSPI_COMPONENT_IFACE)
        extents = comp.GetExtents(1)
        if extents and len(extents) >= 4:
            x, y, w, h = [int(v) for v in extents[:4]]
            if w > 0 and h > 0:
                return {"x": x, "y": y, "width": w, "height": h}
    except Exception:
        pass
    return None


def _atspi_get_bounding_box_wayland(bus, bus_name, path, window_rect):
    if window_rect is None:
        return _atspi_get_screen_bbox(bus, bus_name, path)

    rel = _atspi_get_window_relative_bbox(bus, bus_name, path)
    if rel:
        return {
            "x": window_rect["x"] + rel["x"],
            "y": window_rect["y"] + rel["y"],
            "width": rel["width"],
            "height": rel["height"],
        }

    screen_bbox = _atspi_get_screen_bbox(bus, bus_name, path)
    if screen_bbox:
        wr = window_rect
        if (wr["x"] <= screen_bbox["x"] <= wr["x"] + wr["width"] and
                wr["y"] <= screen_bbox["y"] <= wr["y"] + wr["height"]):
            return screen_bbox
    return None


def _atspi_traverse(bus, bus_name, path, max_depth, max_items,
                    include_noninteractive, items, window_rect, depth=0):
    if depth > max_depth or len(items) >= max_items:
        return

    role_name = _atspi_get_role_name(bus, bus_name, path)
    name = _atspi_get_name(bus, bus_name, path)
    child_count = _atspi_get_child_count(bus, bus_name, path)

    bbox = _atspi_get_bounding_box_wayland(bus, bus_name, path, window_rect)

    is_interactive = bool(name) or (bbox is not None)
    if include_noninteractive or is_interactive:
        entry = {
            'controlType': role_name,
            'name': name,
            'elementId': f"{bus_name}:{path}",
            'boundingRect': bbox,
        }
        if bbox:
            entry['clickablePoint'] = {
                'x': bbox['x'] + bbox['width'] // 2,
                'y': bbox['y'] + bbox['height'] // 2,
            }
        items.append(entry)

    for i in range(child_count):
        if len(items) >= max_items:
            break
        child = _atspi_get_child_at_index(bus, bus_name, path, i)
        if child:
            _atspi_traverse(bus, child[0], child[1], max_depth, max_items,
                            include_noninteractive, items, window_rect, depth + 1)


def cmd_inspect_ui(args):
    a = normalize_args(args)

    if not CAPS.has_dbus:
        return _err("ATSPI_UNAVAILABLE",
                    "缺少 dbus-python。请安装 python3-dbus 后重试。")

    _enable_accessibility()
    _setup_xwayland_at_spi()

    hwnd = a.get('hwnd')
    window_title = a.get('windowtitle') or a.get('window_title') or a.get('title')
    process_name = a.get('processname') or a.get('process_name') or a.get('process')

    if not (hwnd or window_title or process_name):
        return _err('INVALID_ARGS', 'InspectUI 需要 hwnd、windowTitle 或 processName 之一。')

    a11y_bus = _get_a11y_bus()
    if a11y_bus is None:
        return _err('ATSPI_UNAVAILABLE',
                    '无法连接到 AT-SPI 无障碍总线。请确认 at-spi2-core 已安装。')

    window_rect = _get_window_geometry_from_compositor(
        window_title=window_title,
        process_name=process_name,
        hwnd=hwnd,
    )
    coord_source = "compositor" if window_rect else "atspi-screen-unreliable"
    if window_rect:
        debug_log(f"窗口几何（合成器）: {window_rect}")
    else:
        debug_log("无法从合成器获取窗口几何，AT-SPI 坐标可能不可靠")

    import dbus
    try:
        desktop_obj = a11y_bus.get_object(_ATSPI_REGISTRY_BUS, _ATSPI_ROOT_PATH)
        desktop_iface = dbus.Interface(desktop_obj, _ATSPI_ACCESSIBLE_IFACE)
        desktop_props = dbus.Interface(desktop_obj, 'org.freedesktop.DBus.Properties')
        app_count = int(desktop_props.Get(_ATSPI_ACCESSIBLE_IFACE, 'ChildCount'))
    except Exception as e:
        return _err('ATSPI_REGISTRY_FAILED', f'无法访问 AT-SPI 注册表: {e}')

    target_app_bus = None
    target_app_path = None
    target_app_name = None

    for i in range(app_count):
        try:
            child_ref = desktop_iface.GetChildAtIndex(i)
            if not child_ref or len(child_ref) < 2:
                continue
            child_bus = str(child_ref[0])
            child_path = str(child_ref[1])

            app_name = _atspi_get_name(a11y_bus, child_bus, child_path)

            app_pid = None
            try:
                app_obj = a11y_bus.get_object(child_bus, child_path)
                props = dbus.Interface(app_obj, 'org.freedesktop.DBus.Properties')
                pid_variant = props.Get(_ATSPI_APPLICATION_IFACE, 'Id')
                app_pid = int(pid_variant)
            except Exception:
                pass

            matched = False
            if window_title and window_title.lower() in (app_name or '').lower():
                matched = True
            if process_name:
                if app_pid:
                    try:
                        with open(f'/proc/{app_pid}/comm') as f:
                            proc_comm = f.read().strip()
                        if process_name.lower() in proc_comm.lower():
                            matched = True
                    except Exception:
                        pass
                if process_name.lower() in (app_name or '').lower():
                    matched = True

            if matched:
                target_app_bus = child_bus
                target_app_path = child_path
                target_app_name = app_name
                break
        except Exception:
            continue

    if target_app_bus is None:
        return _err(
            'WINDOW_NOT_FOUND',
            f'AT-SPI 中未找到匹配的应用: title={window_title} process={process_name}。'
            f'当前注册的应用数: {app_count}。'
            f'提示：Chromium 151+ / Electron 需以 --force-renderer-accessibility 启动。'
        )

    max_depth = int(a.get('maxdepth') or a.get('max_depth') or 5)
    max_items = int(a.get('maxitems') or a.get('max_items') or 50)
    include_noninteractive = _bool_arg(
        a.get('includenoninteractive') or a.get('include_noninteractive'), False
    )

    items = []
    t0 = time.time()
    _atspi_traverse(a11y_bus, target_app_bus, target_app_path,
                    max_depth, max_items, include_noninteractive,
                    items, window_rect)
    elapsed_ms = int((time.time() - t0) * 1000)

    text_lines = [
        f'AT-SPI 检查结果: {target_app_name}',
        f'找到 {len(items)} 个元素（坐标来源: {coord_source}）',
        '',
    ]
    for i, elem in enumerate(items, 1):
        br = elem.get('boundingRect')
        br_text = f'区域({br["x"]},{br["y"]} {br["width"]}×{br["height"]})' if br else '无坐标'
        text_lines.append(
            f'  [{i}] {elem["controlType"]}: "{elem["name"]}" {br_text}'
        )

    return {
        'status': 'success',
        'result': {
            'content': [{'type': 'text', 'text': '\n'.join(text_lines)}],
            'windowTitle': target_app_name,
            'windowRect': window_rect,
            'elementCount': len(items),
            'elements': items,
            'visitedNodes': len(items),
            'elapsedMs': elapsed_ms,
            'truncated': len(items) >= max_items,
            'truncatedReason': 'max_items' if len(items) >= max_items else None,
            'coordinateSource': coord_source,
        },
    }



# ============================================================
# PSC / UIA 对齐实现 (UIAction, WaitForElement, WaitForText, Interact)
# ============================================================

def _get_psc_ui():
    import sys
    candidate_dirs = [
        os.environ.get("PSC_SDK_PATH"),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "PSC-SDK")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "PSC-SDK")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "PSC-SDK"))
    ]
    sdk_path = next((d for d in candidate_dirs if d and os.path.exists(d)), None)
    if sdk_path and sdk_path not in sys.path:
        sys.path.insert(0, sdk_path)
    from core import psc
    from abstraction.ui import IUIAutomation
    return psc.resolve(IUIAutomation)

def cmd_ui_action(args):
    a = normalize_args(args)
    element_id = a.get("elementid") or a.get("element_id")
    name = a.get("name") or a.get("target") or a.get("label")
    control_type = a.get("controltype") or a.get("control_type")
    action = str(a.get("action") or a.get("uiaction") or a.get("operation") or "invoke").lower()
    value = a.get("value") if a.get("value") is not None else a.get("text")

    try:
        ui = _get_psc_ui()
    except Exception as e:
        return _err("UIA_INIT_FAILED", f"PSC IUIAutomation 调度失败: {e}")

    target_id = element_id
    target_elem = None
    if not target_id:
        # 通过 name 或 control_type 检索
        elems = ui.find_all("", {"name": name, "controlType": control_type}, max_depth=5)
        if not elems:
            return _err("ELEMENT_NOT_FOUND", f"未找到匹配的 UI 元素: name={name}, controlType={control_type}")
        target_elem = elems[0]
        target_id = target_elem["id"]

    success = False
    if action in ("invoke", "click"):
        success = ui.invoke(target_id)
    elif action in ("set", "setvalue", "type"):
        success = ui.set_value(target_id, str(value or ""))
    elif action == "toggle":
        success = ui.toggle(target_id)
    elif action == "select":
        success = ui.select(target_id)
    elif action == "expand":
        success = ui.expand(target_id)
    elif action == "collapse":
        success = ui.collapse(target_id)
    elif action == "scroll":
        success = ui.scroll_into_view(target_id)
    else:
        success = ui.invoke(target_id)

    if not success:
        return _err("UIA_ACTION_FAILED", f"执行 UI 动作 {action} 失败 (element: {target_id})")

    return {
        "status": "success",
        "result": {
            "content": [{"type": "text", "text": f"已通过 UI Automation 执行 {action} 成功。" + chr(10) + f"目标元素: {target_id}"}],
            "elementId": target_id,
            "action": action,
            "element": target_elem
        }
    }

def _probe_ocr_text_linux(a, target_text):
    try:
        img, capture_rect, _ = _capture_screen()
        blocks = run_ocr(img, capture_rect)
        _force_gc()
    except Exception:
        return None
    if not blocks:
        return None
    target = str(target_text).lower()
    match_mode = str(a.get("matchmode") or a.get("match_mode") or "fuzzy").lower()
    for block in blocks:
        actual = str(block.get("text") or "").lower()
        matched = actual == target if match_mode == "exact" else target in actual
        if matched:
            return block
    return None

def cmd_wait_for(args):
    a = normalize_args(args)
    timeout_ms = int(a.get("timeoutms") or a.get("timeout_ms") or 10000)
    poll_ms = int(a.get("pollintervalms") or a.get("poll_interval_ms") or 200)
    condition = str(a.get("condition") or a.get("waitfor") or "appear").lower()
    command_hint = str(a.get("_wait_command") or "")
    target_text = a.get("text") or a.get("target")

    has_identity = bool(a.get("elementid") or a.get("element_id") or a.get("controltype") or a.get("control_type"))
    use_ocr = command_hint == "text" or (target_text and not has_identity)

    disappear = condition in ("disappear", "hidden", "absent")
    t0 = time.time()
    attempts = 0
    val = None

    while True:
        attempts += 1
        elapsed = (time.time() - t0) * 1000
        if use_ocr:
            found = _probe_ocr_text_linux(a, target_text)
            ok = (found is None) if disappear else (found is not None)
            if ok:
                val = found
                break
        else:
            try:
                ui = _get_psc_ui()
                eid = a.get("elementid") or a.get("element_id")
                if eid:
                    elems = ui.find_all(eid, {}, max_depth=1)
                else:
                    elems = ui.find_all("", {"name": target_text or a.get("name"), "controlType": a.get("controltype")}, max_depth=3)
                ok = (len(elems) == 0) if disappear else (len(elems) > 0)
                if ok:
                    val = elems[0] if elems else True
                    break
            except Exception:
                pass

        if elapsed >= timeout_ms:
            desc = f"文本 '{target_text}'" if use_ocr else "UI 元素"
            return _err("WAIT_TIMEOUT", f"等待超时 ({timeout_ms}ms)：{desc} 未能完成 {condition}。尝试次数: {attempts}")
        time.sleep(poll_ms / 1000.0)

    elapsed_ms = int((time.time() - t0) * 1000)
    return {
        "status": "success",
        "result": {
            "content": [{"type": "text", "text": f"等待成功: 目标已{'消失' if disappear else '出现'}。耗时: {elapsed_ms}ms"}],
            "condition": condition,
            "matched": None if disappear else val,
            "attempts": attempts,
            "elapsedMs": elapsed_ms
        }
    }

def _verify_after_action(a):
    verify_text = (
        a.get("verifytext") or a.get("verify_text")
        or a.get("textappears") or a.get("text_appears")
    )
    disappear_text = a.get("textdisappears") or a.get("text_disappears")
    if not verify_text and not disappear_text:
        return None
    verify_args = dict(a)
    verify_args["text"] = verify_text or disappear_text
    verify_args["condition"] = "appear" if verify_text else "disappear"
    verify_args["_wait_command"] = "text"
    verify_args["timeoutms"] = a.get("verifytimeoutms") or a.get("verify_timeout_ms") or 8000
    return cmd_wait_for(verify_args)

def cmd_interact(args):
    a = normalize_args(args)
    action = str(a.get("action") or a.get("operation") or "click").lower()
    raw_channels = a.get("channels") or a.get("channelorder") or "uia,ocr,image_edit"
    channels = [c.strip().lower() for c in raw_channels.split(",") if c.strip()]

    target_text = a.get("text") or a.get("name") or a.get("label")
    description = a.get("description") or a.get("desc")
    last_err = None

    for ch in channels:
        if ch == "uia":
            has_id = bool(a.get("elementid") or a.get("element_id") or a.get("controltype") or target_text)
            if has_id and action in ("click", "invoke", "set", "setvalue", "type", "toggle"):
                res = cmd_ui_action(a)
                if res.get("status") == "success":
                    verification = _verify_after_action(a)
                    if verification and verification.get("status") != "success":
                        return _err("ACTION_NOT_VERIFIED", f"动作已执行但验证失败: {verification.get('error')}")
                    res["channelUsed"] = "uia"
                    return res
                last_err = res.get("error")
        elif ch == "ocr":
            if target_text and action in ("click", "invoke"):
                ocr_args = dict(a)
                ocr_args["text"] = target_text
                res = cmd_click_text(ocr_args)
                if res.get("status") == "success":
                    verification = _verify_after_action(a)
                    if verification and verification.get("status") != "success":
                        return _err("ACTION_NOT_VERIFIED", f"动作已执行但验证失败: {verification.get('error')}")
                    res["channelUsed"] = "ocr"
                    return res
                last_err = res.get("error")
        elif ch in ("image_edit", "visual"):
            if (description or target_text) and action in ("click", "invoke"):
                vis_args = dict(a)
                vis_args["description"] = description or target_text
                res = cmd_click_visual(vis_args)
                if res.get("status") == "success":
                    verification = _verify_after_action(a)
                    if verification and verification.get("status") != "success":
                        return _err("ACTION_NOT_VERIFIED", f"动作已执行但验证失败: {verification.get('error')}")
                    res["channelUsed"] = "image_edit"
                    return res
                last_err = res.get("error")

    return _err("INTERACT_FAILED", f"所有降级通道均未成功执行: {last_err or '未匹配到任何有效执行器'}")

# ============================================================
# 明确不支持的命令
# ============================================================

def _unsupported(name, reason):
    def handler(args):
        return _err("UNSUPPORTED", f"{name} 在 Linux 下不支持：{reason}")
    return handler


# ============================================================
# 命令分发
# ============================================================

COMMAND_MAP = {
    "querywindows": cmd_query_windows,
    "query": cmd_query_windows,
    "getwindows": cmd_query_windows,

    "screencapture": cmd_screen_capture,
    "capture": cmd_screen_capture,
    "screenshot": cmd_screen_capture,

    "clickat": cmd_click_at,
    "click": cmd_click_at,

    "typetext": cmd_type_text,
    "type": cmd_type_text,
    "inputtext": cmd_type_text,

    "scrollat": cmd_scroll_at,
    "scroll": cmd_scroll_at,

    "clicktext": cmd_click_text,
    "textclick": cmd_click_text,

    "clickvisual": cmd_click_visual,
    "visualclick": cmd_click_visual,

    "inspectui": cmd_inspect_ui,
    "inspect": cmd_inspect_ui,
    "uiinspect": cmd_inspect_ui,

    "uiaction": cmd_ui_action,
    "invokeui": cmd_ui_action,
    "waitforelement": cmd_wait_for,
    "waitforui": cmd_wait_for,
    "waitfortext": cmd_wait_for,
    "waitfordisappear": cmd_wait_for,
    "interact": cmd_interact,
    "smartinteract": cmd_interact,
}


def dispatch_command(command, params):
    cmd_key = command.lower().replace("_", "").replace("-", "")
    handler = COMMAND_MAP.get(cmd_key)
    if handler is None:
        return _err("UNKNOWN_COMMAND",
                    f"未知指令: '{command}'。"
                    f"可用指令: ScreenCapture, ClickAt, ClickText, ClickVisual, "
                    f"InspectUI, ScrollAt, TypeText, QueryWindows")
    return handler(params)


def process_request(request):
    serial_keys = sorted(
        [k for k in request.keys() if re.match(r'^command\d+$', k)],
        key=lambda k: int(re.search(r'\d+', k).group()),
    )
    if serial_keys:
        results = []
        for i, cmd_key in enumerate(serial_keys):
            if i > 0:
                time.sleep(1)
            idx = re.search(r'\d+', cmd_key).group()
            command = request[cmd_key]
            params = {}
            for k, v in request.items():
                if k == cmd_key:
                    continue
                if k.endswith(idx) and k != cmd_key:
                    params[k[:-len(idx)]] = v
            result = dispatch_command(command, params)
            results.append({"commandIndex": int(idx),
                            "command": command, "result": result})

        success_count = sum(1 for r in results
                            if r["result"].get("status") == "success")
        summary_parts = []
        for r in results:
            s = r["result"].get("status", "unknown")
            icon = "✅" if s == "success" else "❌"
            summary_parts.append(f"  {icon} 指令{r['commandIndex']}({r['command']}): {s}")

        header = f"串行执行完成: {success_count}/{len(results)} 成功"
        return {
            "status": "success",
            "result": {
                "content": [{"type": "text",
                             "text": header + "\n" + "\n".join(summary_parts)}],
                "serialResults": results,
                "totalCommands": len(results),
                "successCount": success_count,
            },
        }

    command = request.get("command")
    if not command:
        return _err("MISSING_COMMAND", "缺少 command 参数。")
    params = {k: v for k, v in request.items() if k != "command"}
    return dispatch_command(command, params)


# ============================================================
# Worker 入口
# ============================================================

def run_worker():
    _write_worker_message({
        "event": "ready",
        "protocolVersion": 1,
        "pid": os.getpid(),
        "platform": "linux",
        "sessionType": "wayland" if CAPS.is_wayland else "x11",
        "compositor": CAPS.compositor_name(),
        "capabilities": CAPS.to_dict(),
        "memory": get_memory_status(),
    })

    for raw_line in sys.stdin:
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        request_id = None
        try:
            envelope = json.loads(raw_line)
            request_id = envelope.get("id")
            request = envelope.get("request")
            if not request_id or not isinstance(request, dict):
                raise ValueError("请求缺少 id 或 request")

            debug_log(f"收到请求 id={request_id}: "
                      f"{json.dumps(request, ensure_ascii=False)[:200]}")
            response = process_request(request)

            if response.get("status") == "error":
                details = response.get("errorDetails") or {}
                _write_worker_message({
                    "id": request_id,
                    "status": "error",
                    "error": {
                        "code": details.get("code") or "COMMAND_FAILED",
                        "message": str(response.get("error") or "指令执行失败。"),
                        "retryable": bool(details.get("retryable", False)),
                        "details": details.get("details") or details,
                    },
                })
            else:
                _write_worker_message({
                    "id": request_id,
                    "status": "success",
                    "result": response.get("result"),
                })
        except json.JSONDecodeError as e:
            _write_worker_message({
                "id": request_id,
                "status": "error",
                "error": {"code": "INVALID_JSON", "message": f"JSON 解析失败: {e}"},
            })
        except Exception as e:
            debug_log(f"Worker 未捕获异常: {traceback.format_exc()}")
            _write_worker_message({
                "id": request_id,
                "status": "error",
                "error": {"code": "WORKER_EXCEPTION", "message": f"插件执行异常: {e}"},
            })


def main():
    try:
        raw = sys.stdin.readline().strip()
        if not raw:
            sys.stderr.write("没有收到任何输入。\n")
            sys.exit(1)
        request = json.loads(raw)
        result = process_request(request)
        payload = {"status": result.get("status", "success")}
        if result.get("result") is not None:
            payload["result"] = result["result"]
        if result.get("error") is not None:
            payload["error"] = result["error"]
        sys.stdout.buffer.write(
            (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")
        )
        sys.stdout.buffer.flush()
    except json.JSONDecodeError as e:
        sys.stdout.buffer.write(
            (json.dumps({"status": "error", "error": f"JSON 解析失败: {e}"},
                        ensure_ascii=False) + "\n").encode("utf-8")
        )
        sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"异常: {traceback.format_exc()}\n")
        sys.exit(1)


if __name__ == "__main__":
    if "--worker" in sys.argv:
        run_worker()
    else:
        main()