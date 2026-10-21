# Session 2026-10-08 — UI Lab Snake (Joyco)

## What
Added Joyco `snake-game` as a fun break in UI Lab under new nav category **Міні гра**.

## Install
- CLI `npx shadcn add https://registry.joyco.studio/r/snake-game.json` prompted to overwrite `lib/utils.ts` / `button.tsx` — declined.
- Manually wrote files from registry JSON into `components/games/snake-game/`.
- Added `@joyco/kbd` → `components/ui/kbd.tsx` (utils overwrite skipped).
- Also wrote `hooks/use-local-storage.ts` from registry (not required by Snake UI).

## Lab wiring
- Category `games` / label `Міні гра` in `components/dev/ui-lab-catalog.ts`
- Section `snake`
- Demo wrapper `components/dev/ui-lab-snake.tsx`
- Gate in `components/dev/ui-lab.tsx`

## Tweaks
- Fixed corrupted mobile arrow glyphs (encoding).
- Softened game-over copy from `F*ck!` → `Game over!` for Lab.
- Highscores key: `mtruck-ui-lab-snake-highscores`

## Play
`/ui-lab` → chip **Міні гра** (or search `snake`).
