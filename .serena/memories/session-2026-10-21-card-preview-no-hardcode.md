# Card preview: removed hardcoded slot keys (2026-10-21)

## Removed
- `DEFAULT_CARD_PREVIEW_KEYS` (`mileage`, `transmission`, `euro`, `feature`)
- `DEFAULT_CARD_PREVIEW_SUBTITLE_KEYS` (`year`)

## Behavior now
- `FALLBACK_CARD_PREVIEW_LAYOUT.slotKeys/subtitleKeys` = `[]`
- `resolveCardPreviewLayout`: empty slots stay empty (no key fallback)
- Editor load without layout: empty pickers
- `seedDefaultCardPreviewLayouts`: creates empty layouts (GRID/count only), no auto-picked attributes

Fields for card preview are chosen only in `/admin/ui` Card preview editor.
