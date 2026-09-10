# Known issues

## Radix overlay layout shift (2026-09-07)
Opening DropdownMenu / Select / Sheet used to shift the page left. Fix: `html body[data-scroll-locked] { margin-right: 0 }` + DropdownMenu `modal={false}`.

## False hydration mismatch: `data-cursor-ref` (2026-09-08)
Cursor IDE browser injects `data-cursor-ref`. Ignore when that is the only diff. Verify in a normal Chrome/Edge window.

## Reload flicker / scroll restore (fixed 2026-09-09)
Causes were: `scroll-behavior: smooth` + browser `scrollRestoration` (page animated from top to last Y); header `data-surface` only after `useEffect` (white glass on dark); catalog Suspense skeleton→cards; finder brand chips opacity 0→1; partnership header sitting on white body.

Fixes: `history.scrollRestoration="manual"` (beforeInteractive); CSS-first header (`:has(#hero|#partners)` + `data-surface`); `useLayoutEffect`; no homepage catalog skeleton; no finder intro fade; partnership overlaps navy like hero.
