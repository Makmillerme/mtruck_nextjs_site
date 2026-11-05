# Perf Phase 5 — chrome / PDP / account / client weight (2026-11-05)

Plan mode switch rejected by user; executed in Agent with sequential-thinking + Serena. next-devtools: no running `npm run dev` (static audit only).

## Done

### Featured cache
- `fetchFeaturedProducts` → `unstable_cache` (`featured-products`, tags root+products).

### Account caps
- `fetchUserFavorites` / `fetchUserOrders`: `take: 100` (+ favorites `orderBy: createdAt desc`).

### Favorite ids scoped
- `fetchUserFavoriteIds(productIds?)` — optional `productId in`.
- Catalog + featured: fetch products first, then favorites for visible ids only.

### Navbar staff chrome
- `loadNavbarStaffNotifications` (`React.cache`): one staff gate + count; skip recent `findMany` when count=0.
- `Navbar` uses it instead of parallel count+recent.

### PDP
- `generateMetadata` via cached `fetchProductMetadata` (products tag).
- Related `limit: 4` (matches UI).

### ProductCard weight
- `components/media/photo-static.tsx` — no Embla.
- Card: ≤1 image → `PhotoStatic`; multi → `dynamic(() => photo-carousel)`.

## Verify
- `tsc --noEmit` clean.

## Left / later (out of phase 5 slice)
- PDP `cookies()` still forces dynamic for order-added banner.
- Full ProductCard → RSC split.
- Account pagination UI beyond take=100.
- Staff inquiries still hit storefront layout when staff browses public pages (by design for badge).
