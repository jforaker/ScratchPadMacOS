# ScratchPadMacOS

React Native + react-native-macos scratch pad app with:
- Multiple notes (persisted individually)
- Per-note sidebar color tags
- Light/dark theme toggle

## Quick Start

This project is configured to use a dedicated Metro port (`8087`) to avoid collisions with other React Native projects.

Run in two terminals from project root:

Terminal A:
```bash
yarn start:metro
```

Terminal B:
```bash
yarn start:macos
```

## Scripts

- `yarn start:metro`
  - Starts Metro on `8087` with `--reset-cache`.
- `yarn start:macos`
  - Builds/runs macOS app, connects to Metro on `8087`, no internal packager.
- `npm run start:dev`
  - Opens/uses Terminal.app, ensures 2 tabs, and runs Metro + macOS app (one command kickoff).
- `yarn macos`
  - Alias run command for macOS (also no packager, port `8087`).
- `yarn lint`
  - Runs ESLint.
- `yarn test`
  - Runs Jest.
- `yarn mega:clean`
  - Nuclear reset: kills project RN/Metro processes, clears caches/build artifacts, reinstalls JS deps with Yarn (with timeout), and reinstalls iOS + macOS pods (fast pod mode by default).

## Process Reset (When Things Get Weird)

Kill app + Metro processes:
```bash
pkill -f "ScratchPadMacOS" || true
pkill -f "run-macos" || true
pkill -f "react-native start" || true
pkill -f "metro" || true
pkill -f "node .*cli.js start" || true
```

Clear watch/cache:
```bash
watchman watch-del-all || true
rm -rf $TMPDIR/metro-*
```

Then restart with the two-terminal flow above.

## Full Clean Rebuild (macOS)

Use this after native code changes or persistent startup issues:
```bash
rm -rf macos/build
cd macos && pod install --repo-update && cd ..
yarn start:metro
# in second terminal:
yarn start:macos
```

Deeper reset for pod issues:
```bash
cd macos
pod deintegrate
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

## When Things Go Awry (Mega Clean)

Run this one-shot reset script:

```bash
yarn mega:clean
```

It does all of this:
- Stops common Metro / React Native / app processes
- Clears watchman + Metro + haste temp caches
- Clears local native build folders
- Removes and reinstalls JS dependencies with Yarn (`yarn install --frozen-lockfile --non-interactive --check-files`)
- Deintegrates and reinstalls CocoaPods in both `ios/` and `macos/` (without repo refresh)

Useful env vars:
```bash
# Default: 900 seconds
MEGA_CLEAN_YARN_TIMEOUT_SEC=1200 yarn mega:clean

# Optional: use a different port pattern for process cleanup
MEGA_CLEAN_PORT=8087 yarn mega:clean
```

Need a full CocoaPods specs refresh?
```bash
MEGA_CLEAN_REPO_UPDATE=1 yarn mega:clean
```

After it finishes:
```bash
yarn start:metro
yarn start:macos
```

## Common Errors

### `No script URL provided`
Usually means Metro is not running on the expected port.

Fix:
1. Start Metro with `yarn start:metro` (port `8087`).
2. Run app with `yarn start:macos`.
3. If still broken, run the reset steps above and rebuild.

### Fast Refresh not updating
- Ensure Metro and app are started with the two-terminal flow.
- Confirm app connects to the same port (`8087`).
- Native file changes (`.m/.mm/.h`) require rebuild, not just hot reload.

### Multiple RN projects conflict
This repo is pinned to `8087` specifically to avoid that. Always run scripts from this repo root.

## Development Notes

- Theme bootstrap is in `src/unistyles.ts`.
- Runtime theme preference sync is handled in `src/screens/ScratchPad.tsx`.
- Note persistence and preferences are in `src/services/storage.ts`.
