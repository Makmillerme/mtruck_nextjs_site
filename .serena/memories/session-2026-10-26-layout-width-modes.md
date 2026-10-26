# Layout width modes — discussion 2026-10-26

User asks whether different page widths/gutters are OK (home reading width, catalog/admin full-ish, PDP like home).

## Current canon
`.page-container`: gutters only, **no** max-width 80rem. Homepage uses `full-bleed` + inner `page-container`. Catalog/admin need width for filter/tables.

## Recommendation (agreed direction, not yet implemented)
Yes — industry standard. Prefer **2–3 named shells**, not per-page invent:
1. `shell-marketing` / reading: max-w (~72–80rem) + gutters — home, about, PDP content column
2. `shell-app` / fluid: gutters only, no max-w — catalog, admin
3. Optional full-bleed bands inside marketing shell

Keep same gutter token; vary max-width. Navbar/footer align to active shell or stay one rail.

PDP still feels “raw” (incomplete content/IA), separate from shell choice.