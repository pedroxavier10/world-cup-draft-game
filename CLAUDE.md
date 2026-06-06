# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

All code, UI text, labels, and comments must be in English. The developer communicates in Portuguese but all code output — variable names, strings, labels, comments, metadata — must be English.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm run lint      # Run ESLint
```

There is no test suite.

## Architecture

A fully client-side Next.js 14 (App Router) browser game — no backend, no database, no API calls.

**3-screen wizard flow:** Setup → Draft → Result

### Data flow

```
lib/data.ts  →  lib/game.ts  →  lib/store.ts  →  components/*.tsx
 (dataset)     (engine)       (Zustand state)    (React UI)
```

### Key modules

**`lib/data.ts`** — Static dataset: `WORLD_CUP_DB[year][team]` returns an array of `[name, position, rating]` tuples. Covers 5 World Cup editions (2010–2026), ~13 countries each.

**`lib/game.ts`** — All game logic lives here:
- `FORMATIONS` — 5 tactical formations mapping to position slot arrays
- `computeRoll(config, pos, picked)` — random team+year selector for the draft
- `teamStrength(picked)` — weighted average of player ratings
- `simulate()` — core engine: runs 8 matches (3 group + 5 knockout), uses Poisson distribution for goal generation, includes penalty shootout logic for knockout draws. Returns `SimResult`.

**`lib/store.ts`** — Single Zustand store (`useGame`). State transitions: `setConfig` → `start` (loads slots) → repeated `commitRoll`/`pick` → `result` populated → `reset`. The `screen` field (`setup | draft | result`) drives the conditional render in `app/page.tsx`.

**`lib/types.ts`** — Shared types: `Pos`, `Config`, `SimResult`, `Player`, `Slot`.

**`components/`** — One component per screen (`Setup`, `Draft`, `Result`) plus `Pitch` (tactical field view) and `Toast` (CustomEvent-based notifications).

### Styling

Single `app/globals.css` file with CSS custom properties at `:root`. Key theme tokens: `--bg`, `--green`, `--gold`. No CSS modules, no Tailwind.

### Game balance

To adjust difficulty/simulation behaviour, edit `simulate()` in `lib/game.ts`. To add players/editions, extend `WORLD_CUP_DB` in `lib/data.ts`. To change colors, edit the `:root` block in `globals.css`.
