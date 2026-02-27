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
- `yarn macos`
  - Alias run command for macOS (also no packager, port `8087`).
- `yarn lint`
  - Runs ESLint.
- `yarn test`
  - Runs Jest.

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
