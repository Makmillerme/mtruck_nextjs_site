# PDP specs ≠ DisplayGroup — 2026-10-30

## Canon
- Specs table on product page = adaptive 2-col UI template over catalog fields.
- Default order = attribute `sortOrder` (model). Not DisplayGroup sections.
- Odd count: empty pad only at bottom of **right** column (`ceil(n/2)` left).
- Name template (`writesProductName`) stays separate system config.
- Future: UI Editor «Сторінка товару» = reorder + show/hide (non-system).

## Code
- `buildProductSpecGroups` ignores content DisplayGroups → always one flat group.
- `SpecRows` column-major + right pad when odd.
