# Header / ShopNavbar

- Glass is NOT on `<header>`. Empty `.site-header-glass` (portaled to `document.body`) holds blur + tint; `.site-header` is transparent chrome. `backdrop-blur-2xl`, dark fill `rgb(6 16 32 / 0.34)`.
- Header is `fixed`. Spacer `h-14 lg:h-16` always. Hero/partnership `-mt-14`.
- Chameleon: CSS `html:has(#hero|#partners)` for first paint. JS `data-surface` must not stay stale across client navigations — `[data-surface=light|dark]` beats `:has()`. `useHeaderSurface` resets surface to `null` when `pathname` changes (before paint), then `useLayoutEffect` remeasures. Also rAF + short MutationObserver on `main` for streamed hero.
- Do not put `overflow-x: clip` on `html`/`body`/`main` (kills glass).
- Session server-only in navbar.
