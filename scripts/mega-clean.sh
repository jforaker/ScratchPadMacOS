#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${MEGA_CLEAN_PORT:-8087}"
YARN_TIMEOUT_SEC="${MEGA_CLEAN_YARN_TIMEOUT_SEC:-900}"
YARN_FLAGS=(install --frozen-lockfile --non-interactive --check-files --network-timeout 600000)

log() {
  printf '[mega-clean] %s\n' "$*"
}

run_with_timeout() {
  local timeout_sec="$1"
  shift

  "$@" &
  local cmd_pid=$!
  local start_ts
  local now_ts
  local elapsed
  start_ts="$(date +%s)"

  while kill -0 "$cmd_pid" 2>/dev/null; do
    sleep 2
    now_ts="$(date +%s)"
    elapsed="$((now_ts - start_ts))"
    if (( elapsed > timeout_sec )); then
      log "Command timed out after ${timeout_sec}s: $*"
      kill -TERM "$cmd_pid" 2>/dev/null || true
      sleep 2
      kill -KILL "$cmd_pid" 2>/dev/null || true
      wait "$cmd_pid" 2>/dev/null || true
      return 124
    fi
  done

  wait "$cmd_pid"
}

pod_install_dir() {
  local dir="$1"
  (
    cd "$dir"
    pod deintegrate || true
    rm -rf Pods Podfile.lock

    if [[ "${MEGA_CLEAN_REPO_UPDATE:-0}" == "1" ]]; then
      log "pod install --repo-update in $dir"
      pod install --repo-update
    else
      log "pod install in $dir (fast mode)"
      pod install
    fi
  )
}

cd "$ROOT_DIR"
log "Starting in $ROOT_DIR"

if ! command -v yarn >/dev/null 2>&1; then
  log "yarn not found on PATH."
  exit 1
fi

log "Stopping project React Native/Metro processes"
pkill -f "$ROOT_DIR/.*react-native start --port ${PORT}" || true
pkill -f "$ROOT_DIR/.*react-native run-macos.*--port ${PORT}" || true
pkill -f "$ROOT_DIR/.*cli.js start --port ${PORT}" || true
pkill -f "$ROOT_DIR/.*cli.js run-macos.*--port ${PORT}" || true

log "Clearing watchman + Metro temp caches"
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del "$ROOT_DIR" >/dev/null 2>&1 || true
fi
rm -rf "${TMPDIR:-/tmp}"/metro-* "${TMPDIR:-/tmp}"/haste-map-* "${TMPDIR:-/tmp}"/react-native-packager-cache-*

log "Clearing local build artifacts"
rm -rf "$ROOT_DIR/ios/build" "$ROOT_DIR/macos/build" "$ROOT_DIR/android/app/build"

log "Removing node_modules"
rm -rf "$ROOT_DIR/node_modules"

log "Reinstalling JS dependencies using yarn"
log "Running: yarn ${YARN_FLAGS[*]}"
if ! run_with_timeout "$YARN_TIMEOUT_SEC" env YARN_ENABLE_PROGRESS_BARS=0 yarn "${YARN_FLAGS[@]}"; then
  log "Yarn install failed or timed out."
  log "Try manual debug:"
  log "  yarn install --verbose --network-timeout 600000"
  log "  yarn cache clean"
  exit 1
fi

if [[ -d "$ROOT_DIR/ios" ]]; then
  log "Resetting iOS pods"
  pod_install_dir "$ROOT_DIR/ios"
fi

if [[ -d "$ROOT_DIR/macos" ]]; then
  log "Resetting macOS pods"
  pod_install_dir "$ROOT_DIR/macos"
fi

log "Complete."
log "Next:"
log "  1) yarn start:metro"
log "  2) yarn start:macos"
