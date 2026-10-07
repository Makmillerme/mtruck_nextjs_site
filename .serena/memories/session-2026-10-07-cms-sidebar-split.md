# CMS sidebar split phase 0 (2026-10-07)

## Done
- `Sidebar.tsx`: CMS accordion (ADMIN only, same pattern as Products). Open when pathname is `/admin/catalog*` OR `/admin/ui*`.
  - Child **Модель даних** → `/admin/catalog` (active via `isCmsDataModel`)
  - Child **UI редактор** → `/admin/ui` (active via `isCmsUiEditor`)
- Soft-nav on child links; parent is toggle only (not a Link).
- `app/[locale]/admin/ui/page.tsx`: `getAdminUser()` + Card stub with i18n title/lede.
- i18n Admin: `cmsDataModel`, `cmsUiEditor`, `cmsUiEditorStub` (uk/en/de).
- MANAGER: still filters out `/admin/catalog` from adminLinks → no CMS accordion, no `/admin/ui` entry.
- Backlog ideas.md updated: phase 0 partial.

## URL decision
`/admin/ui` (peer department), not `/admin/catalog/ui`.

## Next (not done)
Filter config, card preview/detail, visual layout editor — separate plan.
