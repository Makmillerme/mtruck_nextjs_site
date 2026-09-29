# Soft-nav pending fade (2026-09-29)

Shared pending UI for soft URL transitions (no skeleton, no swipe).

## Primitive
- `components/soft-nav/soft-nav.tsx`
  - `SoftNavProvider` / `useSoftNav` / `useSoftNavOptional`
  - `SoftNavPending` — `opacity-60` + `pointer-events-none` + `aria-busy`; accepts `isPending` prop or context; `motion-reduce:transition-none`
- Catalog aliases: `components/products/catalog-soft-nav.tsx` re-exports as `CatalogSoftNav*`

## Wired
- Account cabinet: `AccountCabinetView` — local `useTransition` + SoftNavPending around tab panels
- Admin archive: controlled `tab` prop + `router.replace(?tab=)` + SoftNavPending
- Admin CMS: `cms-tabs.tsx` same pattern for folders/fields

## Out of scope
- Sidebar hops between /admin/products|sales|users
- Swipe / View Transitions / Framer