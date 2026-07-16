# Cards Tab Upgrade — Implementation Spec

Goal: flesh out the Cards (spaced-repetition) tab for quick bite-sized reviews —
multiple recall modes, a cram/browse mode that covers the whole deck, and new-card
gating so the 171-verse "The Essentials" collection is usable. Also fixes two bugs
found during research (persistence, boss label) and consolidates duplicated SM-2 math.

Read `CLAUDE.md` first. Hard constraints that apply to everything below: no
frameworks, no npm, no build step; plain `<script>` tags in `index.html` in dependency
order; state lives in `G` (src/state.js), render code reads state and writes DOM;
pure logic goes in `src/sr-engine.js`; match the existing dense code style of
`src/render/screens.js`; kebab-case files/CSS classes, camelCase functions,
UPPER_SNAKE constants. Don't touch `archive/`.

Current relevant code:
- `src/render/screens.js:153-195` — the whole Cards tab logic today (`renderSR`,
  `loadSR`, `flipCard`, `rateCard`, module-level `srQ`/`srIdx`/`srFlipped`).
- `src/sr-engine.js` — `srInt`, `getSRQ`, mastery helpers, boss-group helpers,
  `applyFlowSRRating` (Flow game also rates cards — leave that path's behavior alone).
- `index.html` — `#sr-screen` markup (stats pills, `#fc` flip card, rate buttons,
  `#sr-done` empty state).
- `src/state.js` — `G`, `setActiveCollection` / `snapshotCollectionProgress`
  (per-collection fields must round-trip through both), `CFG` + `normalizeConfig`.
- `src/persistence.js` — `save()`/`load()`, key `verbum_save_v7`.
- `src/settings.js` — settings panel, for the one new setting.

All changes are additive to the save shape — keep `verbum_save_v7`, no migration
needed; missing fields must default sanely on load (follow existing `||` patterns).

---

## Workstream 1 — Recall modes

Three modes for how a card is presented. The SR scheduling/rating flow is identical
in all modes; only the front/back content changes.

1. **`ref2text`** (current behavior, default): front = reference, back = verse text.
2. **`text2ref`**: front = verse text, back = reference (show the text small under
   the reference on the back so the flip doesn't feel empty).
3. **`firstletter`**: front = reference + first-letter rendering of the verse
   (e.g. "For God so loved the world," → `F G s l t w,`), back = full text.

Details:
- Persist the chosen mode as `CFG.srMode` (string, default `'ref2text'`; validate in
  `normalizeConfig`). CFG is already saved/loaded wholesale, so persistence is free.
- Mode picker UI: a small 3-segment control on the Cards tab above the card
  (labels: `REF → TEXT`, `TEXT → REF`, `FIRST LETTERS`). Switching mode reloads the
  current card presentation (`loadSR()`); it must not consume/rate the card.
- `firstLetters(text)` is a **pure function in `src/sr-engine.js`**. Per
  whitespace-separated word: keep leading quote characters, the first letter, and any
  trailing punctuation (`.,;:!?"'`). Example: `"Behold, the Lamb!"` →
  `"B, t L!"`. Keep it simple and deterministic — this is a testable pure helper.
- The front card label (`.fc-label`) should reflect the mode (REFERENCE / VERSE TEXT /
  FIRST LETTERS) so the player knows what they're being asked to recall.
- Cram mode (workstream 2) uses the same `CFG.srMode`.

## Workstream 2 — Cram & Browse

Add a 3-way sub-view switcher at the top of the Cards tab: **Review | Cram | Browse**.
Review is the existing SR flow, untouched apart from workstreams 1/3. Put the new
rendering code in a new file `src/render/cram.js`, loaded in `index.html` right after
`src/render/sr-render.js`. Sub-view choice is session-only UI state (module-level
variable, not persisted, defaults to Review).

**Cram** — practice the whole deck (or a slice) without touching the SR schedule:
- Scope picker shown before the session starts:
  - **All verses** in the active collection,
  - **a section** — one entry per boss group from the collection's `bossGroups`
    (label them like the boss system does: "Miniboss 1 — John 1:14 → John 3:16-17";
    for collections without `bossGroups`, like 2cor4, just omit the section rows),
  - **by mastery** — Learning / Practicing / Mastered (via `verseMastery`).
- Deck building is a pure function in `src/sr-engine.js`:
  `buildCramDeck(col, scope)` → array of refs, shuffled, boss verses excluded
  (same exclusion `getSRQ` does).
- Session: same flip-card presentation as Review (respects `CFG.srMode`), but only
  **two buttons: "Missed" / "Got it"**. **No writes to `G.srCards`, no XP, no coins**
  — this is deliberate: cramming before a quiz must not reset SR intervals, and a
  reward-free mode can't be farmed for gacha currency. Show a small "practice only —
  doesn't affect schedule" hint.
- End screen: score (`14/21`), list of missed refs, buttons **"Redo missed"**
  (new deck = just the missed refs) and **"Back"**.

**Browse** — the "see all my cards" view:
- Scrollable list of the active collection's verses in collection order (boss verses
  excluded), each row: reference, mastery badge (learning/practicing/mastered —
  reuse the mastery color scheme from `sr-render.js`: `#A8E063` / `#FFD700` /
  `#56CCF2`), and a due label ("due now" / "due in 3d" / "new").
- Tapping a row expands/collapses the full verse text inline. Read-only; no rating.

## Workstream 3 — Essentials onboarding + fixes

**3a. New-card daily gating.** Today every card in a fresh collection is created
`due: Date.now()`, so activating The Essentials floods the queue with 171 cards.
- New setting `CFG.srNewPerDay`, default **6**, integer 0–50 where **0 = no limit**
  (validate in `normalizeConfig`). Expose it in the settings panel near the other
  gameplay settings with label like "New cards/day (Cards tab) — 0 = no limit".
- Track introductions per collection: `srNewIntro: { day: 'YYYY-MM-DD', count: n }`
  in each `collectionProgress` entry. Wire it through `blankCollectionProgress`,
  `setActiveCollection`, and `snapshotCollectionProgress` like the other
  per-collection fields (working copy on `G`). Reset `count` when `day` ≠ today.
- `getSRQ(false)` (the due queue): review cards (`reps > 0 && due <= now`) keep
  current ordering; **new cards (`reps === 0`) are appended in collection/verse order
  (not shuffled), capped at today's remaining allowance**. `getSRQ(true)`
  ("Study Anyway") stays uncapped.
- Increment the counter when a new card receives its **first rating in the Cards tab**
  (`rateCard` where the card had `reps === 0` and the rating isn't Again).
  Flow-game ratings (`applyFlowSRRating`) are **not** gated and do **not** increment
  the counter — playing Flow may introduce as many verses as the player wants.
- Surface it: when new cards were capped, show a small line under the stats pills
  like "New today: 2/6 — more tomorrow (or use Cram)". Keep the existing pills.

**3b. Persistence bug fix.** `save()` in `src/persistence.js` omits
`G.verseCompletions` and `G.bossGroupsBeaten` even though `load()` reads both — boss
progress and word-truncation progress are lost on every reload. Add both to the
saved object.

**3c. Final-boss label fix.** In `getCollectionBossGroups`
(`src/sr-engine.js:92-110`), the final group's label is
`'Final Boss — All ' + refs.length + ' Verses'`, but for The Essentials the final
group is indices 160–170 (11 verses), producing "Final Boss — All 11 Verses". Use the
"All N Verses" wording **only when the group covers every verse in the collection**;
otherwise label it like minibosses but keep the Final Boss prefix, e.g.
"Final Boss — 1 John 1:9 → Revelation 3:20".

**3d. SM-2 consolidation.** `rateCard` in `src/render/screens.js:182-195` duplicates
the EF-update/scheduling math that also lives in `applyFlowSRRating`. Extract a pure
function in `src/sr-engine.js`, e.g. `applySRRating(card, rating, now)` that mutates
the card's `ef/reps/interval/due` (rating 0 = Again resets reps/interval, due +60s,
matching current `rateCard` semantics exactly). `rateCard` calls it and keeps only
DOM/reward concerns; `applyFlowSRRating`'s non-fumble branch calls the same function.
**Behavior must not change** — this is a refactor to make the engine testable.

---

## Verification

No test infra exists. At minimum:
- `node --check` every touched JS file.
- Write a small throwaway Node script that stubs the globals the pure functions need
  and asserts: `firstLetters` examples above; `buildCramDeck` scope filtering + boss
  exclusion; `applySRRating` matches the old `rateCard` math for ratings 0–3 on a
  fresh card and a mature card; new-card capping in `getSRQ(false)` (0 = unlimited,
  day rollover resets). Delete or keep under `tests/` — either is fine.
- Manually sanity-check `index.html` script order after adding `cram.js`.

Acceptance checklist:
- [ ] Mode picker switches all three modes; rating still schedules correctly.
- [ ] Cram over "Miniboss 2" of John shows only those 5 verses; Missed/Got it never
      changes `srCards`; end screen + Redo missed work.
- [ ] Browse lists all non-boss verses with correct badges/due labels.
- [ ] Fresh Essentials activation shows ≤6 new cards in the due queue; counter
      resets next day; setting 0 removes the cap.
- [ ] Reload preserves `bossGroupsBeaten`/`verseCompletions`.
- [ ] Essentials final boss label no longer says "All 11 Verses".
- [ ] Old saves (v7 without new fields) load without errors.
