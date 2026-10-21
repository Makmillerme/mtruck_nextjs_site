# Card preview editor UX (2026-10-21)

## Done

- **Auto-load folder:** `/admin/ui` without `?node=` → `resolveDefaultCardPreviewNodeId` (first node with `CardPreviewLayout`, else first root) → `redirect` to `?tab=cardPreview&node=`.
- **Dual preview:** Grid + List shown together (sticky right column); exclusive Сітка|Список toggle removed.
- **Settings:** sticky left column, sticky full-width Save; empty-gate only if taxonomy tree empty (`noFolderEmptyTree`).

## Files

- `lib/admin/card-preview-editor-data.ts` — `resolveDefaultCardPreviewNodeId`
- `app/[locale]/admin/ui/page.tsx` — redirect
- `components/admin/ui-editor/card-preview-editor.tsx` — dual preview UX
- i18n: `UiEditor.noFolderEmptyTree` (uk/en/de)

## Verified

Browser: `/admin/ui` → `…&node=39e2e75a-…`, folder «Техніка / Вантажні авто», toggles + slots + both previews with specs.
