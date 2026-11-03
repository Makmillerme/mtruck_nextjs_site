# Fixes 2026-10-30 — year / name template / UI Editor

## YEAR → 2019 not 2 019
`formatSpecDisplay` used Intl grouping for all numbers. Now YEAR (type or key year) formats as plain `String(round)`.

## Name template settings
Nested `CatalogForm` inside product `FormContainer` broke save. Dialog now calls `saveProductNameTemplateAction` via FormData + button (no nested form). MemberOrderPicker remove uses stopPropagation; orphan ids still listed.

## Name field chips
`MAN · TGX` = live values from specs (make/model). Not deletable in the name row — change members in settings gear dialog.

## UI Editor hang feel
Default node resolve no longer scans all layouts (extra DB). Soft-fail productPageLayout queries if client stale.
Still need `npx prisma generate` after stopping `next` (EPERM).
