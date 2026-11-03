# UI Editor tab rename — 2026-10-30

## Labels (uk)
- `tabCardPreview`: Картка товару (was Превʼю картки) — catalog card layout editor
- `tabProductCard`: Сторінка товару (was Картка товару) — PDP stub / future spec sections

en/de aligned. Related stubs/toasts updated.

## Load quirk
`UiEditorTabs.openTab` used to drop `?node=` → cardPreview redirect loop felt like dumb reload. Now preserves search params via `useSearchParams`.
