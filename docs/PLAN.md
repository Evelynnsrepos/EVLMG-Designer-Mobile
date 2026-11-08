# Mobile app plan

Started 2026-11-08 against desktop **v0.25.1**. Points marked *(guess)* are from platform knowledge, not tested on a device.

## 1. The choice: Tauri 2 native app, sharing the desktop's code

Goal from Evelynn: a full-featured iOS and Android app, as its own project, fully compatible with the desktop
(projects open both ways), with peer-to-peer collaboration and the server link working.

| Option | All tools | Peer to peer | Server link | Cost | Verdict |
|---|---|---|---|---|---|
| Web app / PWA | yes | **no**: P2P (iroh) is Rust and can't run in a browser | only with a real certificate on the server | 0 | Can't meet the P2P goal |
| Rewrite (React Native, Flutter) | must be rebuilt | rebuild | rebuild | huge | Two apps to keep in step forever |
| **Tauri 2 mobile** | **same code** | **same Rust code** | **same Rust code** | 0 for Android, 99/year for iPhone/iPad installs | **Chosen** |

How the code is shared, with no copying:
- `desktop/` is a git submodule of the desktop repo, pinned to a release tag.
- The front end is the desktop's `src/` (Vite alias `@` → `desktop/src`). `src/main.ts` adds `touch.ts` and `mobile.css`.
- The Rust side (`src-tauri/src/lib.rs`) compiles the desktop's own `collab.rs`, `collab_commands.rs`,
  `server_link.rs` and `spell.rs` (`#[path]` modules). Same command names, so the UI works unchanged.
- Project files go through the desktop's own `core/project` code and the Tauri file system, so the format can't
  drift. `src/compat.test.ts` checks that a project saved by desktop 0.25.1 (`fixtures/`) still opens byte for
  byte after every submodule bump, that desktop → mobile → desktop keeps everything, and that both apps use the
  same dependency versions.
- The desktop repo's `AGENTS.md` asks every agent to check changes to the file format, P2P, server API and plugin
  API against this repo.

How projects move between devices:
1. **Zip file:** desktop start screen → project menu → "Export as zip…", then "Import zip" on the tablet (and back).
2. **Live:** "Join project" with a connect code (peer to peer), or the EVLMG Server. Same as between two computers.

## 2. Done in this first step

- App shell: Tauri 2 mobile config (`io.github.evelynnsrepos.evlmg.mobile`), capabilities, iOS permission texts
  (local network for P2P and the home server, photos, camera).
- The whole desktop UI runs (checked in an iPad emulator in Chromium: start screen, tour, no errors).
- Touch basics (touch plan T1 + T2): long-press = right-click menu, double-tap = double-click, no page zoom or
  bounce, no text selection outside text fields, 40px touch targets, hover-only buttons always visible, safe areas.
- Desktop-only commands (Git, AI helper, plugin download, Linux graphics mode) answer "not available in the mobile
  app" instead of failing.
- CI: tests on every push; Android debug APK and iOS simulator build on demand.

**Builds (2026-11-08):** the Android APK and the iOS simulator app build in GitHub Actions.

**Server:** the app's Rust server link connects to the real EVLMG Server (self-signed mode: pins the certificate,
refuses a wrong one), and the desktop's real-server tests (upload, join later, view-only, bad key) pass with the code
this app ships; CI runs them against the server repo's latest code (`src/server.test.ts`). Android needs its system
certificate check set up for servers with a real certificate and for peer-to-peer relays: `android_tls()` in
`src-tauri/src/lib.rs` plus `scripts/android-setup.sh`.

**Not tested yet:** anything on a real phone, and P2P on a phone.

Which tools need touch or phone layout work: [MOBILE-TOOLS.md](MOBILE-TOOLS.md).

## 3. Next steps (each about one work thread *(guess)*)

| # | Step | Why |
|---|---|---|
| M1 | First real builds: run the workflow, fix what breaks, install the APK on an Android device | Proves the shell |
| M2 | P2P and server on the phone: join a desktop project live, both ways. iOS stops networking in the background *(guess)*: reconnect when the app comes back | Her must-have |
| M3 | Files on phones: "Open existing folder" → Files app / document picker; exports and print through the share sheet (`<a download>` and `window.print()` do nothing in an iOS app *(guess)*); "Import zip" from Files | Projects in and out |
| M4 | Canvases: Sketch's pinch/pan/two-finger undo for all canvases, palm rejection (touch plan T3) | Drawing tools |
| M5 | Keyboard replacement: touch toolbar (undo/redo, Shift/Alt toggles), Hotwheel button (T5) | No keyboard on tablets |
| M6 | Drag and drop check on real devices, fix where broken (T4) | Sidebar, Kanban, layers |
| M7 | Small screens: sidebar drawer, panels as sheets, phone layout (T6) | Phones and portrait tablets |
| M8 | Hide what can't work (Git sync, AI helper tool, plugin store) instead of showing a message; mobile guide page | Clean app |
| M9 | Release: own signing key for Android (APK on GitHub Releases, free); Apple account if she wants iPhone/iPad installs | Getting it to people |

Some of M3–M8 are better done in the desktop repo (shared touch code helps the desktop's touch screens too).

## 4. Questions for Evelynn

1. Which devices can you test on (Android phone/tablet, iPad + Pencil, iPhone)?
2. iPhone/iPad needs an Apple Developer account (99 a year) to install anything beyond a 7-day test from a Mac.
   OK now, later, or Android first?
3. Android: APK from GitHub Releases (free), or also Google Play (25 USD once, 12 testers for 14 days first)?
4. Phones: full editing, or tablets first with phones "best on a tablet" until M7?
5. Should the touch improvements (M4–M7) go into the desktop repo, so touch-screen laptops get them too?
6. App Store and GPL: as the only author you can add an "App Store exception" to the license. Want that before an iOS release?
