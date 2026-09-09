## VehicleCard (premium redesign 2026-09-08)

Component: `components/vehicles/vehicle-card.tsx`
- Anatomy: 4/3 image; overlay flex: shadcn `Badge` status (no truncate) + glass favorite; `whitespace-nowrap`
- Subtitle: year • categoryLabel (company until taxonomy)
- Specs 2x2: mileage / transmission / euro / feature (i18n fallbacks while Product is furniture)
- Footer: price + priceHint + compact Details CTA with ChevronRight
- Tokens: border/background/primary (not raw slate/blue from Gemini TZ)

Grid: `ProductsGrid` → `1 / sm:2 / min-[900px]:3`, gap `gap-4 md:gap-5` (3-up earlier for tablet landscape)
Card denser mid-width: `p-4`, title `text-lg`→`lg:text-xl`, price `text-xl`→`lg:text-2xl`, compact specs/CTA
Homepage inventory: inside `CatalogBlock` via `CatalogFeaturedGrid` (no titles above grid); shared `bg-secondary`
Favorite: opaque `bg-white` circle `size-9 p-0`, icon `size-4` centered (same as header avatar). No glass/`bg-white/50` — hearts must not blend into photos. Idle muted, hover `text-primary`, active emerald glow.

i18n VehicleCard: categoryFallback, mileageFallback, transmissionFallback, featureFallback, priceHint; UK status PUBLISHED = «В наявності»
