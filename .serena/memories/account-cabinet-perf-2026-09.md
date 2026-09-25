# Account cabinet perf (2026-09-25)

## Nav
- Heart `FavoritesButton` → `/account?tab=favorites` (no `/account/favorites` hop)
- Legacy `/favorites` and `/account/favorites` still redirect to `?tab=favorites`
- Breadcrumbs read `searchParams.tab` → shows Обране immediately

## Favorites UI
- Grid of `VehicleCard` (client) via `productWithSpecsToVehicle`
- Full `productListSelect` fields mapped in `account/page.tsx`
- Remove: `ConfirmDeleteCallbackIcon` + `useOptimisticListRemove` + `toggleFavoriteAction` (`ok` flag)
- `showFavorite={false}` on cards (custom remove control)
- Deleted unused `RemoveFavoriteButton.tsx`

## Lazy / cache-first
- `account/page.tsx` fetches **only active tab** (favorites | orders+tree | settings)
- Tab change: `startTransition` + `router.replace(/account?tab=)` (no opacity dim; no `loading.tsx`)
- Settings: full-width `lg:grid-cols-2` cards (profile | form) + full-width sign-out row (no `max-w-2xl`)
- Orders row delete: same optimistic hook
- `VehicleCard` converted to client (`useTranslations` / `FavoriteToggleForm`)

## Actions
- `toggleFavoriteAction` / `deleteUserOrderAction` return `{ message, ok }`