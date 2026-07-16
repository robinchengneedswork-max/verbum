# Economy, Cosmetics & Audio Upgrade — Implementation Spec

Three workstreams: (A) rebalance the coin/XP economy — currency arrives far too fast,
especially by spamming flashcards; (B) deepen the cosmetic item bank; (C) make the
instrument sounds closer to real instruments and the melody "scales" musically correct.

Read `CLAUDE.md` first. Hard constraints: no frameworks, no npm, no build step; plain
`<script>` tags in dependency order; data in `src/data/`, logic out of data; match the
existing dense code style; kebab-case CSS, camelCase functions, UPPER_SNAKE constants.
Don't touch `archive/`. All save-shape changes must be additive (keep `verbum_save_v7`,
default missing fields on load). A test harness exists at `tests/cards-upgrade.test.js`
(Node `vm` sandbox stubbing globals) — follow that pattern for new tests.

Current economy map (verified against code — cite these when changing them):
- `src/piano.js:268` and `:290` — Flow pays `1 + sfxKeyShift` coins **per correct tap**.
  Key shift rises every 7-streak, so a perfect 40-word verse pays ~140 coins in taps.
- `src/piano.js:315-318` — verse-complete tables: XP `[[8,5,2],[11,7,3],[14,9,4],[20,13,5]]`,
  coins `[[8,5,2],[11,7,3],[15,9,4],[22,13,5]]`, × mastery mult (learning 2.0, mastered 1.2).
- `src/render/screens.js:251` — Cards tab `rateCard` pays +3 coins and 15/10/5 XP per
  rating. `srRestart()` ("Study Anyway", `screens.js:165` area) rebuilds the full queue
  ignoring due dates, so this is **infinitely farmable** — the exploit the user hit.
- `src/xp.js:29-36` and `:150-165` — every 100 XP = level-up = +50 coins (flat forever),
  +1 shard every 5 levels. Rating ~7 flashcards Easy = a level = 50 more coins.
- One-time: mastery rewards (`src/data/levels.js:14`), boss unlocks, lesson +5
  (`screens.js:79`). These are fine — leave them.
- Sinks: packs 240/520/950 coins (`src/data/packs.js:103`), dust crafting, lumen packs.

---

## Workstream A — Economy rebalance

Goal: cut steady-state coin income roughly 4× so a pack is a session-scale goal, not a
per-verse drop. Do **not** change pack prices, mastery one-time rewards, or lumen rates.

**A1. Flow tap coins — flatten and cap.**
- Tap coins become a flat **1** (drop the `+ sfxKeyShift` bonus — key shift stays as an
  audio/visual reward only). Both call sites: `colTap` (piano.js:290) and
  `tileBulletTap` (piano.js:268).
- Cap tap coins at **15 per verse**: a module-level counter reset in `loadVerse()` (and
  on retry); once 15 tap-coins have been paid, further correct taps pay 0 (combo badge
  may still show the combo, just not a coin amount). Keep the +1-per-tap juice early in
  the verse; the cap quietly stops the long-verse fire hose.

**A2. Cards tab — rewards only for scheduled reviews.**
- Track whether the current Review queue came from `getSRQ(false)` (due cards) or
  `getSRQ(true)` ("Study Anyway"): a module flag set in `renderSR`/`loadSR` vs
  `srRestart`.
- In `rateCard`, pay coins/XP (and increment `G.srSessionCount`) **only when the queue
  is the due queue**. Study Anyway still applies real SR scheduling (unchanged — that's
  its point) but pays nothing; show a small "practice — no rewards" hint in the queue
  label area when in Study Anyway mode, consistent with Cram's "practice only" hint.
- The Again-requeue path (`r===0`) already pays nothing — keep that.
- Net effect: Cards income is bounded by the scheduler (due reviews + ≤6 new/day),
  which structurally kills the spam loop. Keep the per-review amounts (3 coins,
  15/10/5 XP) as-is.

**A3. Level-up bonus — halve and centralize.**
- `+50` coins per level is hardcoded in two places (`xp.js` `onLevelUp` and
  `showFlowLevelUp`). Add `const LEVEL_UP_COINS = 25;` to `src/data/levels.js` and use
  it in both. Shard-every-5-levels unchanged.

**A4. Tests.** New `tests/economy.test.js` (vm-sandbox pattern): tap-coin cap math
(15 max per verse, resets on new verse), due-vs-study-anyway reward gating in
`rateCard` (stub DOM getters as the existing test does), `LEVEL_UP_COINS` used by
`onLevelUp`. Assert cram still writes nothing (regression guard).

## Workstream B — Deeper cosmetic bank (~30 new items)

All additions are data-first: `ITEMS` in `src/data/packs.js`, skins also need a
`SKIN_VARS` entry in `src/data/themes.js` (10 CSS custom properties — follow existing
entries; only add a `SKIN_CLASS_MAP` class if a skin truly needs bespoke CSS, prefer
not). Instruments/scales need audio.js entries (see Workstream C for the melody
format). Keep rarity spread sane: mostly uncommon/rare, a few legendaries.

**B1. Essentials collection unlocks — the big gap.** The `the100` collection (17 boss
groups) currently has **zero** unlock-gated items. Add **9 items** gated on it, spread
across the grind: `unlock:{collectionId:'the100',tier:'miniboss2'}`, miniboss4, 6, 8,
10, 12, 14, 16, and `tier:'boss'`. (The `itemUnlocked` boss-group path in
`sr-engine.js` already supports `minibossN`/`boss` for bossGroups collections — verify
against `getCollectionBossGroups` numbering, minibosses are 1-indexed and the final
group is the boss.) Make these the most desirable new items — e.g. the new legendary
skins/instrument below — so the 171-verse grind has visible trophies. Give them
scripture-flavored identity, not generic names.

**B2. New skins (8-10).** Scripture/atmosphere themes that fit the gold/parchment app,
e.g.: Stained Glass, Olive Grove, Mount Sinai (storm grey + lightning gold), Jordan
River, Lily of the Valley, Alabaster, Morning Star, Cedar of Lebanon, Pomegranate,
The Deep. Pick ~9; 3-4 of them are Essentials unlocks (B1), the rest go in the shop
pool at uncommon/rare/legendary.

**B3. New instruments (3).** New patch functions in `src/audio.js` following the
`patchX(f,d,v,dl)` + `safePatch` + `INST` pattern, plus `ITEMS` entries:
- **Harp** (`i_harp`, rare) — soft pluck, warm lowpass, long ringing release, gentle pan.
- **Music Box** (`i_musicbox`, rare) — bright sine partials (1×, 4×, ~5.4× inharmonic),
  very fast attack, tinkly decay, high bandpass.
- **Choir** (`i_choir`, legendary, Essentials boss unlock) — layered detuned
  triangles/sines through two formant bandpass filters (~700Hz and ~1200Hz sweeping),
  slow attack, vibrato LFO — an "aah" vowel pad.

**B4. New melody scales (6 hymns)** — these double as Workstream C content; all public
domain: Amazing Grace, Ode to Joy, Doxology (Old 100th), Holy Holy Holy (Nicaea),
Be Thou My Vision (Slane), Come Thou Fount (Nettleton). `ITEMS` entries (mix of shop
rare + 2-3 Essentials unlocks). Melodies defined via the `mel()` format in C1.

**B5. New commentary (~12).** Substantive 1-3 sentence entries in the style of the
existing John commentary (Greek/Hebrew notes, historical context — not platitudes) for
famous Essentials verses: Prov 3:5-6, Jer 29:11-13, Rom 8:28, Phil 4:6-7, Eph 2:8-10,
Isa 40:28-31, Ps 46:10, Mic 6:8, Heb 11:1, Gal 2:20, 2 Tim 3:16-17, 1 Pet 5:6-7.
Common/uncommon/rare spread.

## Workstream C — Audio: closer sounds, correct songs

**C1. Note-name melody infrastructure.** Raw frequency arrays make transcription
errors invisible. Add to `src/audio.js`:
- `noteToFreq(name)` — `'C4'`→261.63, `'F#4'`/`'Gb4'`→369.99, etc. (A4=440,
  12-TET: `440 * 2^((midi-69)/12)`).
- `mel(str)` — parses `'E4 E4 F4 G4:2 G4 F4 E4 D4 C4:0.5 ...'` (note optionally
  `:beats`, default 1) and returns a scale-compatible function `(i) => freq` with
  attached metadata: `.isMelody = true`, `.len`, `.beats(i)`. Precompute arrays at
  parse time; no per-call parsing.
- Rewrite ALL existing melodic `SCALES` entries (`gospel`, `katamariroll`,
  `giantsteps`, `nyancat`, `superbowl`, `halftime`, `hedwigs`, `hogwarts`, `shire`,
  `rivendell`, `mordor`) as `mel(...)` strings with **corrected, longer transcriptions**
  (24-32 notes where the source tune supports it — long enough that the loop reads as
  the actual song, prioritize a note-accurate opening phrase). Transcribe carefully
  from the real tunes; note names make every pitch reviewable. Mode/interval scales
  (major, pentatonic, blues, etc.) stay as-is.
- Add the 6 hymn melodies from B4. Two anchors, verified — use them verbatim:
  - Ode to Joy (C): `E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2`
  - Amazing Grace (C, 3/4): `G3 C4:2 E4:0.5 C4:0.5 E4:2 D4 C4:2 A3 G3:2 G3 C4:2 E4:0.5 C4:0.5 E4:2 D4 G4:3 E4 G4:1.5 E4:0.5 G4 E4 C4:2 G3 A3 C4:1.5 C4:0.5 A3 G3:2 G3 C4:2 E4:0.5 C4:0.5 E4:2 D4 C4:3`
- **Fix the Heartbeat bug**: item `s_heartbeat` (packs.js:80) has `val:'heartbeat'`
  but `SCALES` has no `heartbeat` key, so it silently plays Major (and
  `normalizeConfig` resets it). Add a real `heartbeat` melody — a dotted
  lub-dub pattern, e.g. alternating low-high pairs with `:0.5`/`:1.5` beats.

**C2. Melody playback fixes** (`src/audio.js` `sfxCorrect` + `src/piano.js`):
- **Don't reset the melody on errors.** `piano.js:253` and `:296` currently zero
  `sfxNoteIdx` on every wrong tap, so learners never hear past bar one. Errors should
  reset streak/combo/key-shift as now, but leave `sfxNoteIdx` alone. Reset melody
  position only at verse load / retry / complete (already done there).
- **Key changes only at the loop boundary for melodies.** Mid-phrase semitone jumps
  mangle tunes. In `sfxCorrect`: when the active scale `.isMelody`, compute the target
  shift as now but only *apply* it when `sfxNoteIdx % len === 0` (hold it pending
  otherwise). Non-melody scales keep current behavior.
- **Note duration from beats.** When `.isMelody`, call the instrument with
  `d = 0.18 * beats(i)` (instead of fixed 0.16) so held notes ring — patches already
  scale hold/release from `d`.
- `sfxComplete` currently plays scale steps `[0,2,4,7]`, which is gibberish against a
  melody mid-loop. Change it: for melodies play a fixed tonic cadence arpeggio
  (C4 E4 G4 C5 transposed by the current key shift); for interval scales keep as-is.

**C3. Closer instrument sounds.** Targeted upgrades to existing patches in
`src/audio.js` — stay procedural (no samples; single-file constraint), keep function
signatures, keep every change inside the patch bodies:
- **patchPiano** (the flagship): replace the current 2-osc triangle stack with a
  struck-string model — partials 1×..5× (choose triangle for 1× and sines above) with
  steep amplitude rolloff (~1/n^1.7), two slightly detuned "strings" (±2-3 cents) on
  the fundamental, brief hammer noise (already there — keep), an attack-bright lowpass
  sweep that settles quickly, and a longer natural decay (release ~1.1-1.4× `d`, so
  chords overlap like a real sustain pedal-less piano). Slight velocity feel: scale
  brightness (filter peak) with `v`.
- **patchBell / patchCelesta**: nudge inharmonic partial gains so the fundamental
  clearly dominates (current bells read as clangy); lengthen celesta shimmer decay.
- **patchViolin / patchFlute**: soften the attack noise, add a subtle crescendo
  (peak slightly after onset) so sustained melody notes bloom instead of honk.
- Do NOT touch the master bus/compressor/reverb chain or `safePatch` fallbacks.
- Keep each patch's overall loudness within ±15% of before (they're mixed against the
  same `CFG.vol`); the compressor hides small drift.

**C4. Tests.** `tests/audio-melody.test.js`: `noteToFreq` spot checks (C4, A4, F#4,
Gb4≡F#4, C5=2×C4), `mel()` parsing (beats default 1, `:2` parsing, `.len`, index
wraps), key-shift-defers-until-wrap logic if it's factored into a testable helper
(factor it so it is), and an assertion that every `type:'scale'` item's `val` exists
in `SCALES` (catches the Heartbeat class of bug permanently — run over the real
packs.js + audio.js sources).

---

## Verification

- `node --check` every touched file; run the full `tests/` directory (existing
  `cards-upgrade.test.js` must still pass — Workstream A touches `rateCard`).
- Re-read the diff of `rateCard` and the two piano tap sites to confirm reward logic
  matches A1/A2 exactly and nothing else changed.
- Confirm every new `ITEMS` entry has a unique `id`, a valid `type`, `dustVal`
  consistent with its rarity (5/8-10/12-15/40 for common/uncommon/rare/legendary), and
  every skin `val` has a `SKIN_VARS` entry, every instrument `val` an `INST` entry,
  every scale `val` a `SCALES` entry.
- Acceptance checklist:
  - [ ] Perfect long verse in Flow pays ≤ 15 tap coins + table coins.
  - [ ] Study Anyway ratings change scheduling but award 0 coins / 0 XP, with a hint.
  - [ ] Due-queue ratings still pay 3 coins + XP; new-card daily gating unaffected.
  - [ ] Level-up pays 25 coins in both the overlay and Flow paths.
  - [ ] Equipping Heartbeat plays its own pattern, not Major.
  - [ ] Melodies survive a wrong tap without restarting; key change lands only at loop
        start; held notes audibly longer (`:2` beats → longer `d`).
  - [ ] Every the100 tier from miniboss2 through boss has at least one unlock item and
        `itemUnlockHint` renders a sensible hint for it.
  - [ ] Old saves load; no new fields required to exist.
