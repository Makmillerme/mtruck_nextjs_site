## VehicleCard → ProductCard rename (2026-11-05)

Mechanical domain rename; behavior unchanged.

### Moved
- `components/vehicles/vehicle-card.tsx` → `components/products/product-card.tsx` (folder `vehicles/` removed)
- `lib/catalog/product-to-vehicle.ts` → `lib/catalog/product-to-card.ts`

### Symbols
- `VehicleCard` → `ProductCard`
- `VehicleCardModel` → `ProductCardModel`
- `VehicleCardSpecItem` → `ProductCardSpecItem`
- `VehicleStatus` → `ProductCardStatus`
- prop `vehicle` → `product`; related `vehicles` → `products`
- `AccountFavoriteRow.vehicle` → `.product`
- `productWithSpecsToVehicle` → `productWithSpecsToCardModel`
- `productToVehicle` → `productToCardModel`
- i18n `VehicleCard` → `ProductCard`
- Lab id `vehicle` → `product-card`

### Out of scope
seed-demo-vehicles, marketing copy, AccountOrderLine, Prisma.

### Verify
tsc --noEmit OK; next-devtools get_errors clean.