# Sales cases (2026-09-10)

Homepage after CustomOrder: `components/sales-cases-section.tsx`, `#sales-cases`, `bg-background`.

**Layout (lookbook, not diagonal):** `SectionIntro` `align=end` (title right on lg) + Separator, then a **triptych + shipment ledger**. Three tall photo frames as one film strip (`lg:grid-cols-[1.05fr_1.3fr_1.05fr]`, `gap-px` hairlines). **Keep unequal widths** — center `1.3fr` vs sides `1.05fr` is the lookbook, not a bug. Equal columns would read as a catalog grid. Captions under each cell: `01 · NL → UA` / model `font-black` / buyer muted. Mobile stacks as chapters (`gap-12`). No rotation, no offset, no cards, no icon circles.

Photos: `/images/hero.webp` with `object-[32%]` / `[58%]` / `[78%]` until real case shots exist.
i18n `SalesCases`: title «Останні відвантаження» (not «Кому вже відвантажили» — too colloquial). Lede «З Європи — уже в парках по Україні.» Captions already carry type + city. Do not wire `trust-strip`.
