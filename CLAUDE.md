# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## What This Is

**Verbum** — a Bible verse memorization game for the browser. Players learn verses
through a falling-tile "piano" rhythm mechanic, review them with spaced repetition,
earn XP and coins, and spend coins in a gacha shop for cosmetic packs. Pure DOM, no
Canvas. No frameworks, no build step, no dependencies.

This started life as a single ~302 KB "vibe-coded" HTML file and has been extracted
into modular `src/` files. It was previously one of several games in a shared
collection; it is now its own independent project. See `README.md` for the player-facing
overview and design notes.

## Running It

No build, no server, no install. Open `index.html` in any modern browser (desktop or
mobile). The `file://` protocol is fine. Edit a file in `src/`, refresh the page.

Progress saves to the browser's `localStorage`. There's an in-app export/import
(Settings → Save Data) for backups.

## Project Layout

```
index.html            — markup + script load order (no build tools, plain <script> tags)
README.md             — player-facing overview + design notes
src/
  style.css           — all styling (gold/parchment theme, animations, responsive)
  data/
    verses.js         — verse content (reference, text, book/chapter/verse)
    packs.js          — shop pack definitions (contents, price, rarity)
    levels.js         — XP thresholds / level definitions
    themes.js         — cosmetic theme + skin definitions
  audio.js            — Web Audio procedural sound (lazy AudioContext)
  state.js            — game state object + mutators (no DOM)
  persistence.js      — localStorage read/write, export/import
  sr-engine.js        — spaced repetition algorithm (SM-2 variant, pure functions)
  combo.js            — combo tracking + multiplier logic
  xp.js               — XP calculation, level thresholds, level-up rewards
  shop.js             — pack purchase, gacha reveal, dust/shard crafting
  piano.js            — falling-tile piano input + Flow game loop
  settings.js         — settings panel, dev tools
  render/
    screens.js        — tab switching, screen transitions, list rendering
    sr-render.js      — spaced-repetition flashcard rendering
  main.js             — init, tab routing, event wiring
archive/
  verbum_v092_2.html  — frozen original monolith (reference only, don't edit)
```

## Architecture: Hard Constraints

- **Single-file deployable is the north star.** The game must be able to ship as one
  HTML file you can double-click — no server, no install. Any build step must be
  optional and produce a single inlined file; dev still works via plain `<script>` tags.
- **No frameworks, no npm, no bundler in the dev loop.** Modules share global scope and
  load via `<script src>` tags in `index.html`.
- **Script load order = dependency order.** `index.html` defines the sequence: data
  files → audio → state → persistence → sr-engine → combo → xp → shop → render → piano →
  settings → main. Adding a module means inserting it at the right point in that chain.

## Module Pattern

State is separate from rendering; rendering is separate from input; logic is separate
from presentation. Concretely:

- **`state.js`** holds the game state object and pure mutators — no DOM access.
- **`render/`** reads state and writes DOM — never the source of truth for state.
- **`sr-engine.js`** is pure and testable: functions like
  `calculateNextReview(ease, interval, rating) -> {newEase, newInterval, nextDate}`
  with no side effects. This is the core pedagogical mechanic — treat it carefully and
  prefer adding tests here first.
- **Data** (`src/data/`) is separate from logic. Adding verses or packs should not
  require touching game code.

## Key Conventions

**Naming**: `kebab-case.js` files, `UPPER_SNAKE` constants, `camelCase` functions,
`PascalCase` classes, `kebab-case` CSS classes, `--kebab-case` CSS variables,
`kebab-case.json` for any future data files.

**Screens & tabs**: The `.screen` / `.screen.active` pattern controls top-level views.
`switchTab(id)` / show-screen logic removes `active` from all screens and adds it to the
target. The live tabs are **Flow**, **Cards** (spaced repetition), **Shop**, and
**Collect**. (The README's tab list is slightly older than the current UI — trust
`index.html`.)

**Audio**: Lazy `AudioContext` — created on first use, not on load, because browsers
block autoplay before a user gesture. Sound effects are built on a few oscillator/noise
helpers.

**State shape**: Prefer an array of objects (`items[i] = { ... }`) over parallel arrays
(`prices[i]`, `owned[i]`). Adding a field shouldn't mean updating five arrays.

**Input**: Use `e.code` (physical key position), not `e.key` (layout-dependent). Call
`preventDefault()` for keys with browser defaults (space, arrows).

## Anti-Patterns to Avoid

- **Inline data in logic** — verse/pack/theme definitions belong in `src/data/`, not
  buried in functions.
- **DOM as state store** — don't `querySelector` to find out what the game state is.
  State lives in `state.js`; the DOM is rendered from it.
- **God files** — if a file grows past ~500 lines or takes on 5+ responsibilities, split
  it. (The original monolith is the cautionary tale, frozen in `archive/`.)
- **Cryptic abbreviations for long-lived state** — spell it out; rename on sight.

## Known Issues / Roadmap

Carried over from the extraction notes, roughly in priority order:

1. **Verse data should become JSON.** Verse content in `src/data/verses.js` is the
   biggest chunk of the project; moving it to a plain `.json` file makes adding content a
   data-only change.
2. **Persistence hardening.** `localStorage` is the only store. Export/import exists, but
   there's no schema versioning or migration path — risky if the save shape changes.
3. **No tests on the SR engine.** The spaced-repetition interval math is the most
   important logic and has zero coverage. Best first target for tests (it's pure).
4. **CSS consolidation.** `style.css` is large; much of it could collapse into utility
   patterns.

## Distribution Build (optional)

When shipping as a single file, concatenate `src/*.js` in the `index.html` load order and
inline `style.css` into one HTML file. There is no build script committed yet; the dev
workflow is just editing `src/` and refreshing. If you add a build, keep the single-file
output as the deployable artifact and the `src/` files as what you edit.
