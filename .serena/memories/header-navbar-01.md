# Header / ShopNavbar

- Glass is NOT on `<header>`. Empty `.site-header-glass` (portaled to `document.body`) holds blur + tint; `.site-header` is transparent chrome. Dark fill `rgb(6 16 32 / 0.34)`.
- Header is `fixed`. Spacer `h-14 lg:h-16` always. Hero/partnership `-mt-14`.
- Chameleon: CSS `html:has(#hero|#partners)` for first paint. JS `data-surface` must not stay stale across client navigations — `[data-surface=light|dark]` beats `:has()`. `useHeaderSurface` resets surface to `null` when `pathname` changes, then remeasures.
- **Smooth flip (2026-09-10):** `@property --header-ink / --header-glass / --header-cap` interpolate; `.site-header { color: var(--header-ink); transition: color 0.5s }` and glass `background-color`/`box-shadow` 0.5s. Nav/icons inherit ink — do not set `text-foreground` on the bar (that snaps). Do not put `overflow-x: clip` on `html`/`body`/`main`.
- Session server-only in navbar.
