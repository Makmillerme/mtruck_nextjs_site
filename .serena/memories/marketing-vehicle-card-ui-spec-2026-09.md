## VehicleCard (catalog) — implemented 2026-09-07

Component: `components/vehicles/vehicle-card.tsx`
Mapper: `productToVehicle(product)` — href `/products/${id}` (live route; `/catalog/[slug]` does not exist yet).
Grid: `components/products/ProductsGrid.tsx` — `sm:grid-cols-2 xl:grid-cols-3 gap-6`.
`ProductCard` is a thin wrapper over VehicleCard.

Defaults while Product is still furniture:
- status `PUBLISHED` → badge «Наявне»
- euro fallback «Euro 5» (Fuel always rendered)
- year / mileage / location omitted until Prisma fields exist
- favorite heart stays top-left; status pill top-right

i18n: `messages/{uk,en,de}.json` → `VehicleCard`.
Mileage helper: `formatMileage` in `utils/format.ts`.

Count difference homepage vs catalog is data, not a grid bug:
- preview `fetchFeaturedProducts()` → `featured: true` (3 seed items)
- `/products` `fetchAllProducts()` → all 4 seed items (sofa is featured:false)
