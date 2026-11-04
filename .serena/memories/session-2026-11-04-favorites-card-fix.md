# Favorites cabinet cards fix (2026-11-04)

## Problems
- Favorites mapped `productWithSpecsToVehicle` without card-preview layouts → empty/wrong specs vs catalog
- VehicleCard `sizes` used `max-width: 899px` for 50vw; grid is 2-col until `xl` (1280) → undersized next/image

## Fix
- `account/page.tsx`: `fetchCardPreviewLayoutsByNodeIds` + map favorites to `{ id, productId, vehicle }` server-side with locale
- `AccountFavoriteRow` = ready `VehicleCardModel` (no client remapping)
- `VehicleCard` sizes: `(max-width: 640px) 100vw, (max-width: 1279px) 50vw, 33vw`
- Restored missing `"use client"` on `AccountCabinetView`
- Favorites grid fade-in matches `ProductsGrid`
