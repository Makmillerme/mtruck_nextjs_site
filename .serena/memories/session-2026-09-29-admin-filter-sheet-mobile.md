# Admin filter sheet = catalog mobile (2026-09-29)

`AdminFilterSheet` now mirrors `CatalogFilterSheet`:
- controlled `open` / `onOpenChange`
- SheetContent `flex flex-col gap-0 overflow-hidden p-0`
- header row: title + LuTrash2 clear (disabled when count=0)
- scrollable body + full-width Apply that closes sheet

Callers (products + sales) pass `applyLabel={t("filterApply")}`.
Admin i18n: `filterApply` uk/en/de.

Filters still apply live on checkbox; Apply = close confirmation UX.
