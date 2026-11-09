# Admin archive mobile cards + sidebar grid (2026-11-09)

## Sidebar (whole admin)
- SoftNavProvider moved **outside** the admin grid so aside + SoftNavPending are real grid tracks.
- `content-start` mobile / `lg:content-stretch lg:items-start` desktop.
- Sticky only from `lg` on Sidebar Card.

## Archive phone
- Below `md`: `ArchiveMobileCard` stack (title, subtitle, meta, actions top-right).
- From `md`: previous Table inside Card.
- File: `components/admin/archive/admin-archive-view.tsx`.