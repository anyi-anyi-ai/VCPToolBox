#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

usage() {
  cat <<'EOF'
用法:
  scripts/e2e_smoke.sh [--gateway right|openai|custom] [--base-url URL] [--model MODEL]
                      [--mode lite|standard|deep] [--topic TOPIC] [--keywords CSV]
                      [--out-dir DIR]

环境变量:
  COSEARCH_API_KEY      通用 API Key（优先）
  OPENAI_API_KEY        OpenAI Key（openai 网关默认读取）
  RIGHT_CODES_API_KEY   right.codes Key（right 网关默认读取）
  COSEARCH_BASE_URL     custom 网关默认读取（或命令行 --base-url）
  COSEARCH_MODEL        模型名（命令行未指定时读取）
EOF
}

GATEWAY="${GATEWAY:-right}"
BASE_URL="${COSEARCH_BASE_URL:-}"
MODE="${MODE:-lite}"
MODEL="${COSEARCH_MODEL:-gpt-5.2}"
TOPIC="${TOPIC:-CoSearch E2E 冒烟}"
KEYWORDS="${KEYWORDS:-OpenAI Responses API}"
OUT_DIR="${OUT_DIR:-${REPO_ROOT}/workspace/e2e-smoke}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gateway)
      GATEWAY="$2"
      shift 2
      ;;
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --model)
      MODEL="$2"
      shift 2
      ;;
    --mode)
      MODE="$2"
      shift 2
      ;;
    --topic)
      TOPIC="$2"
      shift 2
      ;;
    --keywords)
      KEYWORDS="$2"
      shift 2
      ;;
    --out-dir)
      OUT_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "未知参数: $1" >&2
      usage >&2
      exit 64
      ;;
  esac
done

case "${OUT_DIR}" in
  /*) ;;
  *) OUT_DIR="${REPO_ROOT}/${OUT_DIR}" ;;
esac

pick_key() {
  local env_name=""
  for env_name in "$@"; do
    if [[ -n "${!env_name:-}" ]]; then
      printf '%s' "${!env_name}"
      return 0
    fi
  done
  return 1
}

API_KEY=""
case "${GATEWAY}" in
  right)
    BASE_URL="${BASE_URL:-https://REDACTED_HOST/codex/v1/responses}"
    API_KEY="$(pick_key COSEARCH_API_KEY RIGHT_CODES_API_KEY OPENAI_API_KEY || true)"
    ;;
  openai)
    BASE_URL="${BASE_URL:-https://api.openai.com/v1/responses}"
    API_KEY="$(pick_key COSEARCH_API_KEY OPENAI_API_KEY RIGHT_CODES_API_KEY || true)"
    ;;
  custom)
    if [[ -z "${BASE_URL}" ]]; then
      echo "gateway=custom 时必须通过 --base-url 或 COSEARCH_BASE_URL 提供网关地址。" >&2
      exit 64
    fi
    API_KEY="$(pick_key COSEARCH_API_KEY OPENAI_API_KEY RIGHT_CODES_API_KEY || true)"
    ;;
  *)
    echo "不支持的 gateway: ${GATEWAY}（允许: right/openai/custom）" >&2
    exit 64
    ;;
esac

if [[ -z "${API_KEY}" ]]; then
  echo "未检测到 API Key。请至少设置 COSEARCH_API_KEY / OPENAI_API_KEY / RIGHT_CODES_API_KEY 之一。" >&2
  exit 65
fi

mkdir -p "${OUT_DIR}"
RUN_ID="e2e-smoke-$(date +%Y%m%d-%H%M%S)"
PAYLOAD_PATH="${OUT_DIR}/${RUN_ID}.request.json"
RESULT_PATH="${OUT_DIR}/${RUN_ID}.response.json"
STDERR_PATH="${OUT_DIR}/${RUN_ID}.stderr.log"
GOCACHE_DIR="${GOCACHE:-${OUT_DIR}/.gocache}"
case "${GOCACHE_DIR}" in
  /*) ;;
  *) GOCACHE_DIR="${REPO_ROOT}/${GOCACHE_DIR}" ;;
esac
mkdir -p "${GOCACHE_DIR}"

cat > "${PAYLOAD_PATH}" <<EOF
{
  "SearchTopic": "${TOPIC}",
  "Keywords": "${KEYWORDS}",
  "ShowURL": true,
  "Mode": "${MODE}",
  "RequestID": "${RUN_ID}"
}
EOF

echo "[e2e_smoke] gateway=${GATEWAY}"
echo "[e2e_smoke] base_url=${BASE_URL}"
echo "[e2e_smoke] model=${MODEL}"
echo "[e2e_smoke] mode=${MODE}"
echo "[e2e_smoke] payload=${PAYLOAD_PATH}"
echo "[e2e_smoke] response=${RESULT_PATH}"
echo "[e2e_smoke] stderr=${STDERR_PATH}"
echo "[e2e_smoke] gocache=${GOCACHE_DIR}"

set +e
COSEARCH_BASE_URL="${BASE_URL}" \
COSEARCH_API_KEY="${API_KEY}" \
COSEARCH_MODEL="${MODEL}" \
COSEARCH_API_FORMAT="${COSEARCH_API_FORMAT:-responses}" \
GOCACHE="${GOCACHE_DIR}" \
go run ./cmd/cosearch < "${PAYLOAD_PATH}" > "${RESULT_PATH}" 2> "${STDERR_PATH}"
RUN_EXIT_CODE=$?
set -e

if [[ ${RUN_EXIT_CODE} -ne 0 ]]; then
  echo "[e2e_smoke] go run 执行失败，exit=${RUN_EXIT_CODE}" >&2
  exit "${RUN_EXIT_CODE}"
fi

set +e
python3 - "${RESULT_PATH}" <<'PY'
import json
import os
import sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

status = data.get("status", "")
error = data.get("error", "")
error_code = data.get("error_code", "")
meta = data.get("meta") or {}
report = data.get("report") or {}
artifact_dir = meta.get("artifact_dir", "")
report_md = report.get("report_md_file", "")
report_json = report.get("report_json_file", "")

artifact_ok = bool(artifact_dir) and os.path.isdir(artifact_dir)
report_md_ok = bool(report_md) and os.path.isfile(report_md)
report_json_ok = bool(report_json) and os.path.isfile(report_json)

print(f"STATUS={status}")
print(f"ERROR_CODE={error_code}")
print(f"ERROR={error}")
print(f"ARTIFACT_DIR={artifact_dir}")
print(f"ARTIFACT_DIR_CHECK={'ok' if artifact_ok else 'missing'}")
print(f"REPORT_MD={report_md}")
print(f"REPORT_MD_CHECK={'ok' if report_md_ok else 'missing'}")
print(f"REPORT_JSON={report_json}")
print(f"REPORT_JSON_CHECK={'ok' if report_json_ok else 'missing'}")

if status != "success":
    sys.exit(2)
if not (artifact_ok and report_md_ok and report_json_ok):
    sys.exit(3)
PY
CHECK_EXIT_CODE=$?
set -e

if [[ ${CHECK_EXIT_CODE} -eq 0 ]]; then
  echo "[e2e_smoke] 冒烟通过：报告路径检查通过。"
  exit 0
fi

if [[ ${CHECK_EXIT_CODE} -eq 2 ]]; then
  echo "[e2e_smoke] 冒烟执行完成但业务失败（status != success）。请查看 response/stderr 详情。" >&2
  exit 2
fi

echo "[e2e_smoke] 冒烟执行完成，但报告路径检查失败。" >&2
exit 3
