# Which tools need a touch or phone layout

Checked 2026-11-08 against desktop v0.25.1, with the mobile touch basics (`src/touch.ts`, `src/mobile.css`) on.

**How:** every tool in a project with all 54 tools turned on, opened in Chromium with touch emulation at three sizes:
iPad portrait (820×1180), iPad landscape (1180×820) and a phone (390×844). For each one I measured controls that end
up off screen, controls smaller than 32 px, and areas that need sideways scrolling. On top of that, a code scan of
every tool for right-click menus, double-clicks, mouse wheel zoom, HTML drag and drop, keyboard handling and canvases.
Canvas tools were measured on their "new document" screen, so their editors are judged from the code, not measured.
Nothing was tried on a real device yet.

## Short answer

- **Tablet landscape:** every tool opens and fits. Nothing is off screen. What's missing there is touch behaviour on
  canvases, not layout.
- **Tablet portrait:** almost everything fits. Economy Simulator, Combat Simulator, Scope Planner, Task Board and
  Pacing Graph push a few controls off the right edge.
- **Phone:** nothing tool-specific can be judged until the app shell changes. The sidebar takes more than half the
  screen width, so every tool gets about 160 px. That is **one shell fix** (sidebar as a slide-in drawer, one panel at
  a time), not 54 tool fixes.
- Most tools are built from a handful of shared parts (list + detail, calculators, the board canvas, the graph
  editor, the drawing code). Fixing those shared parts covers most tools at once.

## 1. App-wide (fixes every tool)

| # | What | Why | Size *(guess)* |
|---|---|---|---|
| S1 | Sidebar becomes a slide-in drawer on phones and portrait tablets | On a phone it takes 55% of the width | Medium |
| S2 | Phones: one panel at a time, with the split view and panel rearranging turned off | Side-by-side panels are unusable at 390 px | Medium |
| S3 | Hide keyboard-only hints on touch: the "Esc rearranges and closes tools" reminder (stays up forever without a keyboard), Hotkey hint mode | They point to keys that aren't there | Small |
| S4 | Drag and drop that uses the browser's HTML dragging: sidebar order, folders, dragging tools into panels | iPad does not start HTML drags from a finger reliably *(guess, must test)*; add "Move up/down" and "Open beside" to the long-press menus | Small–medium |
| S5 | Tooltips (`title`) never show on touch | About 600 buttons explain themselves only on hover; icon-only buttons need a label or a long-press hint | Medium |
| S6 | On-screen keyboard covering the field you type in | Keep the focused field above the keyboard | Small |

Already done in the mobile app: long-press = right-click menu, double-tap = double-click, no page zoom or bounce,
40 px touch targets, hover-only buttons always visible.

## 2. Tool by tool

Legend: ✅ fine on tablets as it is · 🟡 small adjustments · 🔴 real touch work. "Phone" is after S1 + S2.

### Lists and databases (shared list + detail layout)
Fix the shared list/detail once: on phones show the list, then the detail full screen with a Back button.

| Tool | Tablet | Phone | Notes |
|---|---|---|---|
| Item List | ✅ | 🟡 | 5 keyboard handlers (shortcuts need menu entries) |
| Character List, Town List, Enemy List | ✅ | 🟡 | |
| Wiki | ✅ | 🟡 | Connection map: mouse-wheel zoom → pinch |
| Asset Pool | ✅ | 🟡 | |
| Abilities & Spells, Achievements, Factions, History, Playtests, Reviews, Localization, Balance Dashboard | ✅ | 🟡 | Tables scroll sideways on phones |
| Family Tree | ✅ | 🟡 | Double-click actions (now double-tap) |
| Names & Languages | ✅ | 🔴 | 65 controls off screen on a phone: generator settings in one wide row |

### Calculators and simulators (shared calculator layout)
Fix the shared calculator form: inputs stack in one column below about 600 px, wide result tables scroll inside their box.

| Tool | Tablet | Phone | Notes |
|---|---|---|---|
| Damage Calculator | ✅ | 🔴 | 35 controls off screen on a phone |
| Level Calculator, Resource Calculator, Wave Planner | ✅ | 🟡 | 7–13 off screen on a phone |
| Gacha & Loot Simulator | ✅ | 🔴 | 22 off screen on a phone |
| Economy Simulator | 🟡 | 🔴 | 10 off screen even on a portrait tablet |
| Combat Simulator | 🟡 | 🔴 | 8 off screen on a portrait tablet |
| Calendar & Eras | ✅ | 🔴 | 27 off screen on a phone |
| Pacing Graph | 🟡 | 🔴 | Graph is wider than a portrait tablet |

### Writing
Text editing works with the on-screen keyboard. The formatting toolbars wrap.

| Tool | Tablet | Phone | Notes |
|---|---|---|---|
| Writer | ✅ | 🟡 | Hotwheel needs a touch button (opens by key or pen button today) |
| Story Branch Writer | 🟡 | 🔴 | Built on the board canvas: pinch zoom, 13 small canvas buttons |
| Writing Principles | ✅ | 🔴 | 448 controls off screen on a phone: one very wide row of cards/buttons |
| Vision & Pillars | ✅ | 🟡 | |
| Pitch Deck | 🟡 | 🟡 | Slide order uses HTML drag and drop: add move buttons |

### Boards (shared board canvas)
One shared canvas covers all of these. Fix it once: pinch zoom and two-finger pan (reuse Draw's gesture code),
double-tap on the canvas to edit text, bigger resize/rotate handles, palm rejection when a pen is used.

| Tool | Tablet | Phone | Notes |
|---|---|---|---|
| Brainstorm Board | 🔴 | 🔴 | 24 small toolbar buttons |
| Moodboard, Design Language | 🔴 | 🔴 | 23 small toolbar buttons |
| Map Creator | 🔴 | 🔴 | Own pointer code (6 handlers) besides the shared canvas |
| Timeline | 🔴 | 🔴 | 16 small buttons |
| UI Flow | 🔴 | 🔴 | 16 small buttons |
| Story Branch Writer | 🔴 | 🔴 | (see Writing) |

### Node graphs (shared graph editor)
Quest Designer, Dialogue Editor, Skill Tree, Crafting & Recipes, Gameplay Loop: 🟡 on tablets, 🔴 on phones.
Pan and zoom need pinch (Gameplay Loop uses the mouse wheel), and the connection dots are too small to hit with a
finger. Cosmos Creator: 🟡/🔴, uses HTML drag and drop and three double-click actions.

### Drawing and canvas tools
Pen pressure and tilt already work (Apple Pencil, S Pen). Draw has full touch gestures already.

| Tool | Tablet | Phone | Notes |
|---|---|---|---|
| Draw | ✅ | 🔴 | Has pinch zoom, two-finger undo, "finger draws" on/off. Needs palm rejection. Phones: panels need to become sheets |
| Pixel Art | 🔴 | 🔴 | Right-click menus, mouse-wheel zoom, keyboard tools: needs Draw's gestures and a touch toolbar |
| Level Layout | 🔴 | 🔴 | 11 canvas uses, keyboard shortcuts (R = Scatter), Shift/Alt modifiers: touch toolbar |
| Texture Paint (3D) | 🔴 | 🔴 | Two-finger orbit and pinch zoom for the 3D view; memory limits on iPads |
| Card Designer | 🔴 | 🔴 | Biggest tool (4,600 lines): right-click menus, Alt-click through layers, keyboard shortcuts, a wide export window. Tablet landscape first; phones view-only at first |

### Planning
| Tool | Tablet | Phone | Notes |
|---|---|---|---|
| Task Board, Scope Planner | 🟡 | 🔴 | Kanban columns go off screen on a portrait tablet; cards move by HTML drag: add a "Move to…" menu |
| Storyboard | ✅ | 🟡 | |

### Spreadsheet
🔴 on both. Selecting cells by dragging, 4 right-click menus, 6 double-click actions, keyboard navigation and formulas.
It needs its own touch mode: tap selects, double-tap edits, drag handles to extend a selection, and a formula bar
that stays above the on-screen keyboard.

## 3. Suggested order

1. **S1–S3** (shell): makes phones usable at all and fixes the never-ending hint. About 1–2 work threads.
2. **Shared list/detail and calculator layouts:** about 25 tools work on phones afterwards. About 1 thread.
3. **Shared board canvas and graph editor gestures:** 13 tools. About 1–2 threads.
4. **Drawing tools:** Pixel Art, Level Layout, Texture Paint, plus the touch toolbar (modifiers, Hotwheel button). About 2 threads.
5. **Spreadsheet and Card Designer:** their own touch work. About 1–2 threads each.
6. **S4–S6** along the way, then a test round on a real iPad and Android device.

All of this is shared code, so it belongs in the **desktop repo** (behind touch checks like `@media (pointer: coarse)`),
not here. The mobile app then gets it with the next desktop version, and touch-screen laptops get it too.

## Desktop v0.27.0 (submodule moved 2026-11-09)

New since v0.25.1, all come along with the submodule. Not tried on a tablet or phone yet.

| Tool / feature | Notes |
|---|---|
| Arrange button + finger drag of tools out of the sidebar (0.25.2) | The desktop's own touch answer to Esc layout mode. A sideways drag moves more than 10 px, so `src/touch.ts` cancels its long-press: the two should not fight. Check on a tablet. |
| Draw light preview (0.26.0) | three.js view in a floating panel; pinch/drag already built in. Heavy on phones *(guess)*. |
| Vector (experimental, 0.27.0) | Same canvas as the Card Designer, so the same touch notes apply. |
| Material Lab engine (0.26.0) | No screen yet, nothing to check. |

Coming with the desktop "integration" work (not released yet, `patches/integration/` in the project files):
`meta.palette` (project palette), Asset Pool files in `assets/files/` (P2P and server accept them), and plugin API
additions (`SendMenu`, `sendImageTo`, `addImageTarget`, `useIntentHandler`, `useAssetUrl`). `src/compat.test.ts` already
checks that a project with these keeps them through the mobile app. Bump the submodule again once that release is out.
