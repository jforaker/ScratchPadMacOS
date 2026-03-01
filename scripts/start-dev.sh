#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v osascript >/dev/null 2>&1; then
  echo "osascript not found. Run these manually in two terminals:"
  echo "  npm run start:metro"
  echo "  npm run start:macos"
  exit 1
fi

osascript - "$ROOT_DIR" <<'APPLESCRIPT'
on run argv
  set rootDir to item 1 of argv
  set metroCmd to "cd " & quoted form of rootDir & " && npm run start:metro"
  set macosCmd to "cd " & quoted form of rootDir & " && npm run start:macos"

  tell application "Terminal"
    activate

    if not (exists window 1) then
      do script ""
      delay 0.2
    end if

    set tabCount to number of tabs of window 1
    repeat while tabCount < 2
      do script "" in window 1
      delay 0.15
      set tabCount to number of tabs of window 1
    end repeat

    do script metroCmd in tab 1 of window 1
    do script macosCmd in tab 2 of window 1
  end tell
end run
APPLESCRIPT

echo "Started dev flow in Terminal:"
echo "  Tab 1: npm run start:metro"
echo "  Tab 2: npm run start:macos"
