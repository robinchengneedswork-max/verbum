# Verbum

A Bible verse memorization game with a "piano keyboard" input mechanic. Players learn verses through progressive difficulty modes (reading, fill-in-the-blank, first-letter hints, full recall), earn XP and coins, purchase verse packs from a gacha shop, and use spaced repetition for long-term retention.

**Source**: `verbum_v092_2.html` (~302 KB monolith, the largest file in the collection)

---

## Quick Start

1. Open `index.html` in any browser (works on desktop and mobile)
2. Pick a verse from the **Learn** tab
3. Play through the lesson modes
4. Earn coins and XP!

### How It Plays

Verbum teaches Bible verse memorization through 4 progressive modes:

1. **Read**: See the full verse, tap words in the correct order on the "piano" strip
2. **Fill**: Some words are blanked out, pick the right word from a bank
3. **First Letter**: Only first letters shown, type the full word
4. **Recall**: No hints at all, type from memory

Get consecutive answers right to build a **combo multiplier** that earns bonus coins. Use coins in the **Shop** to buy verse packs (gacha-style card opening). The **Review** tab uses **spaced repetition** to schedule verse reviews at optimal intervals for long-term retention.

### Tabs

| Tab | What It Does |
|-----|-------------|
| **Learn** | Browse and play verse lessons |
| **Review** | Spaced repetition flashcard reviews |
| **Flow** | Rhythm-game mode (Guitar Hero-style falling tiles) |
| **Shop** | Buy verse packs with coins, open packs |
| **Profile** | Stats, inventory, equipped skins, settings |

Progress saves automatically to your browser's local storage.

---

## Architecture Overview

### Core Game Loop

1. **Select a verse** from your collection
2. **Play through modes** of increasing difficulty:
   - **Read**: See the full verse, tap words in order
   - **Fill**: Some words missing, fill from a word bank
   - **First Letter**: Only first letters shown, type the word
   - **Recall**: No hints, type from memory
3. **Earn XP and coins** based on accuracy and combo streaks
4. **Level up** to unlock higher-tier verse packs
5. **Spaced repetition** schedules review of mastered verses

### Input Mechanic: The Piano

The signature UI element. Words are arranged as "keys" on a piano-like strip at the bottom. In tap mode, you press keys in order. In type mode, a text input appears. The piano tiles show upcoming words, completed words fade, and a combo multiplier builds for consecutive correct answers.

### Progression Systems

- **XP + Levels**: Earned per verse completion. Level gates access to verse packs.
- **Coins**: Earned per correct word. Spent in the shop.
- **Combo multiplier**: Consecutive correct answers multiply coin earnings.
- **Spaced repetition**: Each verse tracks ease factor, interval, and next review date. Four review ratings (again, hard, good, easy) adjust the interval using an SM-2 variant algorithm.

### Shop / Gacha

Verse packs are purchased with coins. Opening a pack reveals new verses with a Hearthstone-style card flip animation. Duplicate verses convert to "dust" for crafting. Inventory system with equipped/unequipped items (cosmetic themes, fonts).

### Rendering

Pure DOM. No Canvas. Heavy use of CSS animations (card flips, word arcs, combo punches, XP bar fills, level-up slams). The piano keyboard is flexbox. The gacha reveal uses CSS 3D transforms.

### What's Working Well

1. **Polish**: The UI is the most polished in the collection. Gold/parchment theme, smooth animations, responsive layout, desktop + mobile support.
2. **Piano input**: Original mechanic that makes verse memorization feel like a rhythm game. The combo system adds genuine engagement.
3. **Gacha reveal**: The pack-opening animation (shake, flash, flip) creates anticipation. Smart design for engagement.
4. **Spaced repetition**: Proper SR algorithm with ease factors and adaptive intervals. This is the core pedagogical mechanic and it's correctly implemented.
5. **Progressive modes**: The read -> fill -> first-letter -> recall progression scaffolds memorization naturally.

### Critical Issues

1. **302 KB monolith**: The largest file by far. Approximately 40% is verse data, 30% is CSS, 30% is logic.
2. **Verse data inlined**: Hundreds of verses with full text, references, and metadata are embedded in the JS. This should be a separate JSON file.
3. **State persistence**: Uses localStorage for progress, coins, inventory, SR schedules. No export/import, no backup strategy, no migration path if the schema changes.
4. **No tests on SR algorithm**: The spaced repetition algorithm is the most important piece of logic and has zero test coverage. Edge cases in interval calculation could silently break the learning experience.
5. **CSS is ~100 KB**: Extensive styling for every UI state, animation, and responsive breakpoint. Much of it could be consolidated with utility patterns.

---

## Recommended Module Breakdown

```
verbum/
  src/
    data/
      verses.json       -- all verse content (ref, text, book, chapter, verse)
      packs.json        -- shop pack definitions (verses included, price, rarity)
      themes.json       -- cosmetic theme definitions
    state.js            -- game state (coins, XP, level, inventory, verse progress)
    persistence.js      -- localStorage read/write, schema migration, export/import
    sr-engine.js        -- spaced repetition algorithm (pure functions, testable)
    verse-game.js       -- game mode logic (read, fill, first-letter, recall)
    combo.js            -- combo tracking, multiplier calculation, streak logic
    piano.js            -- piano keyboard UI component (tile layout, input handling)
    shop.js             -- pack purchase, gacha reveal logic, dust conversion
    inventory.js        -- item management, equip/unequip, duplicate detection
    xp.js               -- XP calculation, level thresholds, level-up rewards
    render/
      piano-render.js   -- piano tile DOM creation and animation
      gacha-render.js   -- pack opening animation sequence
      verse-render.js   -- verse display modes (fill blanks, first letters, etc.)
      hud-render.js     -- header stats, XP bar, coin display
      screens.js        -- tab switching, screen transitions
    audio.js            -- (if any sound effects exist)
    main.js             -- init, tab routing, event wiring
  index.html
  style.css
  archive/
    verbum_v092_2.html
```

### Key refactoring decisions

- **Verse data extraction is the single biggest win**: Moving verse content to `verses.json` cuts the file by ~40% and makes adding new content trivial (no code changes needed).
- **SR engine must be pure and testable**: `sr-engine.js` should export pure functions: `calculateNextReview(currentEase, interval, rating) -> {newEase, newInterval, nextDate}`. Write unit tests for this first.
- **Persistence layer**: Wrap localStorage access in a module with versioned schema and migration support. Add JSON export/import so users don't lose progress.
- **Piano as a component**: The piano keyboard is used across multiple game modes. Extract as a self-contained component that takes a word list and emits events (correct, incorrect, complete).
