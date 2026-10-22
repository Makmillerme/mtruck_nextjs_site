# Card preview editor — visibility + CascadeSelect (2026-10-22)

## Changes

File: `components/admin/ui-editor/card-preview-editor.tsx`

1. **showSpecs → Visibility card**
   - Toggle «Характеристики» (`showSpecs`) moved next to name/price/status/subtitle switches.
   - Specs settings card (style GRID/TAGS, grid count, MemberOrderPicker slots) renders **only when `showSpecs`**.
   - Subtitle settings already gated by `showSubtitle` — same pattern.
   - Save button sits below visibility (+ optional specs card), not inside Specs.

2. **CascadeSelect folder picker → canon**
   - `variant="tree"` (same as `product-folder-picker.tsx` / `template-folder-picker`).
   - Preview button `h-11` to align with field trigger height.

## UX rule

Visibility switch off → related settings hidden (not disabled-in-place).
