# Admin mobile cards Columns + sheet overlay flicker (2026-11-09)

## Columns → cards
`admin-products-view.tsx` mobile `AdminListMobileCard` meta now renders the same `visibleSystemKeys` + `visibleAttributes` as the desktop table (label | value rows). Name stays title; productCode subtitle. Empty selection → no meta.

i18n `columnsSheetLede` (uk/en/de): table **and** cards.

## Sheet overlay blink
Cause: programmatic open from card click — same pointer event can dismiss freshly mounted Radix overlay.
Fixes:
1. `AdminListMobileCard` defers `onActivateAction` via `setTimeout(0)`
2. `SheetContent` ignores outside/interact/focus-outside for 400ms after mount
3. `SoftNavPending` only applies `transition-opacity` while pending (no fade-out flash under overlays)
