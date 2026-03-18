#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

emit_error_json() {
  local msg="$1"
  printf '{"status":"error","error":"%s","error_code":"plugin_boot_error","mode":"standard"}\n' "${msg//\"/\\\"}"
}

BIN="$SCRIPT_DIR/cosearch"
if [ -x "$BIN" ]; then
  exec "$BIN"
fi

if command -v go >/dev/null 2>&1; then
  mkdir -p "$SCRIPT_DIR/.bin"
  mkdir -p "$SCRIPT_DIR/.gocache"
  BUILD_BIN="$SCRIPT_DIR/.bin/cosearch"
  if [ ! -x "$BUILD_BIN" ]; then
    if ! GOCACHE="$SCRIPT_DIR/.gocache" go build -o "$BUILD_BIN" ./cmd/cosearch >/dev/null 2>&1; then
      emit_error_json "CoSearch 构建失败，请检查 Go 环境或源码完整性"
      exit 0
    fi
  fi
  exec "$BUILD_BIN"
fi

emit_error_json "未检测到可执行文件 cosearch，且系统未安装 Go"
exit 0
