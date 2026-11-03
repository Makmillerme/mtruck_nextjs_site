# Key facts vs UI Editor audit (2026-11-03)

## Symptom
PDP hero key facts shows make/model/year/mileage/power/euro — looks like default, not UI Editor picker.

## Root cause
`buildProductKeyFacts` uses `layout.keyFactSlots` only when there are **visible** slots. Else falls back to attribute `sortOrder` top-N (`keyFactsMax`).

DB:
- **Фургони** (`furhony`), **Тягачі** (`tiahachi`): `ProductPageLayout` exists, tabs saved, but **`keyFactSlots` count = 0** → resolve seeds all eligible with `visible:false` → zero visible → **sortOrder fallback**.
- **Контейнеровози**: 6 visible slots (mileage, power_hp, euro, transmission, axle, location) — editor config IS applied.

## Why empty slots
UI Editor save writes only `keyFactIds` (visible picks). Saving tabs/layout without picking key facts persists **0** `ProductPageKeyFactSlot` rows. Leaf layout still “wins” inheritance over parent (parent has no layout).

## Fix options (not done)
1. Inherit keyFactSlots from nearest ancestor when leaf slots empty.
2. On save with empty keyFactIds, keep previous slots or refuse empty if tabs-only update.
3. Editor UX: warn «ключові параметри не обрані — на PDP буде auto top-N».
