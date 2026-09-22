# Audit loading / render (2026-09-22)

## UX rule
Skeleton **only** for cold waits on DB-backed content — **never** on static chrome (nav, toolbars, tabs). Soft-nav: keep prior UI + light opacity, no grey flash.

## Catalog
- No `products/loading.tsx` (flashed on searchParams).
- Nested Suspense + `CatalogSoftNavProvider` (`catalog-soft-nav.tsx`).

## Admin (refined same day)
- **Removed** all `admin/*/loading.tsx` (`LoadingAdminTable` was faking toolbar + table and replaced real `AdminListToolbar` / CMS tabs / archive chrome).
- Layout: `Suspense` fallback = real `<Sidebar productRoots={[]} />` — static CMS/Продажі/Товари/… always visible; roots stream when taxonomy resolves. **No** `SidebarFallback` skeletons.
- `LoadingAdminTable` remains in Lab/shared for optional future data-only stubs; not wired to admin routes.
- Cache-first / optimistic admin writes: backlog (see `mem:admin-perf-2026-09`); session already React.cache’d.

## PDP / home
- PDP `loading.tsx` still for hard product nav; home `CatalogBlock` Suspense for featured DB grid.
