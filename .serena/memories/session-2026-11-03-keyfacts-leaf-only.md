## Key facts = leaf UI Editor only (2026-11-03)

User rejected ancestor inheritance — product-page UI is leaf folders only.

### Fixes
1. `fetchProductPageLayoutsByNodeIds` — exact `taxonomyNodeId` only (no ancestor walk).
2. `loadLayoutRowForNode` — own layout only.
3. `ProductPageLayoutResolved.hasLayout` + `keyFactsConfigured`.
4. `buildProductKeyFacts` — if leaf has layout, use only visible keyFactSlots; **no sortOrder invent**.
5. PDP resolves layout against `fetchAttributesForNode` (folder attrs), not only product specs.

### Data note
Контейнеровози has 6 keyFactSlots → works. Тягачі/Фургони have layout + empty keyFactSlots → after fix show empty until picks saved in UI Editor (previously fake make/model/year).
