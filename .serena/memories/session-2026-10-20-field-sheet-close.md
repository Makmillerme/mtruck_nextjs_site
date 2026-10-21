# Field sheet close on save — 2026-10-20

## Bug
Admin catalog **edit field** sheet stayed open after «Зберегти поле». Folders closed correctly.

## Cause
In `components/admin/catalog/fields-panel.tsx`, create mode had `onSuccess={() => setSheet(null)}` on `CatalogForm`, but **edit** mode only had `onPendingChange` — no close callback.

## Fix
Added `onSuccess={() => setSheet(null)}` to the edit `CatalogForm` (same as folders / create field).
