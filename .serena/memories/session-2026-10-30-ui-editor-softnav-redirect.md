# UI Editor SoftNav flash (2026-10-30)

## Cause
Sidebar SoftNav `push(/admin/ui)` + server `redirect(?node=…)` = second navigation while SoftNavPending dims admin content («preloader»).

## Fix
- `app/[locale]/admin/ui/page.tsx`: resolve default node in-memory, no `redirect`.
- `UiEditorUrlSync`: `history.replaceState` to add `?node=` without RSC round-trip.
- Sidebar: re-click UI editor keeps current `tab`/`node` (no bare `/admin/ui` remount).
