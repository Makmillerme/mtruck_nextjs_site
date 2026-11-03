## Fix 2026-11-03 — buy-box price block to top

User: on large screens price/finance was pinned to gallery bottom (`lg:mt-auto`), leaving a large gap under key facts. Want attached to top.

Changes:
- `product-buy-box.tsx`: remove `lg:mt-auto` and `lg:h-full`
- PDP + ui-lab hero: `lg:items-start` instead of `lg:items-stretch`
- ui-lab copy updated
