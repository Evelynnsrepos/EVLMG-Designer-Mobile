# EVLMG Designer Mobile

Eve.Lopment Games Designer for **iPad, iPhone and Android**: the free, all-in-one game design tool by
Evelopment Games, on your tablet and phone.

> Early work in progress. Not released yet.

## What it is

The same app as the desktop version, with all its tools, built for touch screens:

- **Your projects open both ways.** Export a project as a zip on the computer, open it on the tablet, change it,
  and open it back on the computer. Nothing gets lost, even things one side can't show yet.
- **Work together live** with the desktop app: join a project with a connect code (peer to peer) or through your
  own EVLMG Server.
- **Touch first:** hold a finger still for the right-click menu, double-tap to rename or open, bigger buttons.
  Apple Pencil and Android styluses draw with pressure and tilt.

Not in the mobile app: Git sync, the optional local AI helper and downloading plugins (phones can't run those
programs). Use the desktop app for them.

## How it is built

This repo does not copy the desktop code. It has the [desktop repo](https://github.com/Evelynnsrepos/EVLMG-Designer)
as a git submodule in `desktop/` and builds its code into a native app with Tauri 2:

| Part | Where |
|---|---|
| The whole user interface and the project file code | `desktop/src` (imported as `@/…`) |
| Peer-to-peer collaboration, server link, spell check | `desktop/src-tauri/src/*.rs`, built by `src-tauri/src/lib.rs` |
| Touch helpers and touch CSS | `src/touch.ts`, `src/mobile.css` |
| Desktop features that can't run on a phone | `src-tauri/src/not_on_mobile.rs` |
| Compatibility tests | `src/compat.test.ts`, `fixtures/` |

Why and what comes next: [docs/PLAN.md](docs/PLAN.md).

## Building

```bash
git clone --recurse-submodules https://github.com/Evelynnsrepos/EVLMG-Designer-Mobile
npm install
npm test               # compatibility and touch tests
npm run dev            # the app in a browser, try it with your browser's touch emulation
npm run tauri dev      # the mobile build in a window on your computer (needs Rust, like the desktop app)
npm run android        # on an Android phone or emulator (needs Android Studio + NDK, after `npx tauri android init && scripts/android-setup.sh`)
npm run ios            # on an iPhone/iPad simulator (needs a Mac with Xcode, after `npx tauri ios init`)
```

GitHub Actions builds an Android APK and an iOS simulator app when started by hand (Actions tab, "Mobile builds",
"Run workflow").

**After a desktop release:** move the submodule to the new tag, copy its dependency versions, and test:

```bash
git -C desktop fetch --tags && git -C desktop checkout vX.Y.Z
node scripts/sync-deps.mjs && npm install && npm test
```

## Community

[Discord](https://discord.gg/AGfaBwNKfN) · [YouTube @EvelopmentGames](https://www.youtube.com/@EvelopmentGames) ·
[Instagram evelopmentgames](https://www.instagram.com/evelopmentgames)

## License

GPL-3.0 ([LICENSE](LICENSE)) with an attribution term ([ADDITIONAL-TERMS.md](ADDITIONAL-TERMS.md)):

> Based on Eve.Lopment Games Designer by Evelopment Games: https://github.com/Evelynnsrepos/EVLMG-Designer
