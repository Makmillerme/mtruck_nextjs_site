## Domain canon: Product, not Vehicle

- **Product** = general commerce entity (Prisma `Product`, PDP, orders, favorites, catalog cards).
- Auto/truck = specialization via taxonomy/attributes/folders — not a separate UI ontology.
- Catalog grid/list card: **`ProductCard`** (`components/products/product-card.tsx`), model `ProductCardModel`, prop `product`.
- Mapper: `lib/catalog/product-to-card.ts` → `productWithSpecsToCardModel` / `productToCardModel`.
- i18n namespace: `ProductCard` (uk/en/de).
- UI Lab: section id `product-card` («Картка товару»).
- Order Sheet uses **AccountOrderLine** (product line), not catalog card.
- Do **not** invent `Vehicle*` UI components for new surfaces. Marketing/seed may still say «авто» — separate from code identifiers.