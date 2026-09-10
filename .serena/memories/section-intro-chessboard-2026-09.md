# Section intro chessboard (2026-09-10)

Shared `components/section-intro.tsx`: 12-col header, `align=start|end`, `tone=light|dark`.

**Desktop (lg+) rhythm — not random text-align:**
- Hero: left on photo (unchanged)
- Catalog `#catalog`: `start` (title left, no lede)
- Services `#services`: `end` (lede left, title right)
- CustomOrder `#custom-order`: `start` + `tone=dark` (navy chapter reset)
- SalesCases `#sales-cases`: `end`
- Contact `#contact`: title left + form right — do **not** flip (functional)

Mobile: title then lede (DOM order). Flip is CSS grid `col-start` / `row-start-1`, not `dir=rtl`.

Do not chessboard filter plates or the contact form.

**Titles (lg 5-col, 2.75rem):** max **2 lines**. No `text-balance` on SectionIntro h2 (it was splitting into 3 equal shorts). Keep titles short enough for the 5-col box; do not shrink type to cheat wrap.

**Ledes:** one factual line. No disclaimers, no table-of-contents of the cards below.
UK examples: services «Імпорт, продаж з майданчика і підготовка на власному СТО.»; sales «З Європи — уже в парках по Україні.» (not «покупців не називаємо»).
