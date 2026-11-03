# Комплектація MULTI_SELECT for вантажні авто (2026-11-02)

## What
- Attribute `key: equipment`, `name: Комплектація`, `type: MULTI_SELECT`, `isFacet: false`, `sortOrder: 10` on folder **Вантажні авто** (`vantazhni-avto`).
- Inherited by leaf children: Контейнеровози, Тягачі, Фургони (same pattern as make/model).
- **25** flat options (AutoRIA-style): ABS, ASR/ESP, кондиціонер, клімат, автономний обігрівач, тахограф, круїз, склопідйомники, ЦЗ, підігрів дзеркал/сидінь, пневмопідвіска, ретардер, дифблок, гідроборт, доп. бак, спальник, GPS, камера, парктронік, мультимедіа, LED, холодильник, AdBlue, DPF.

## Code
- [`lib/catalog/ensure-truck-fields.ts`](lib/catalog/ensure-truck-fields.ts) — `ensureAttribute` accepts MULTI_SELECT; options via `ensureSelectOptions`.
- One-shot runner: `npx tsx --env-file=.env scripts/ensure-equipment-only.ts` (also part of `db:seed` via ensureTruckCatalogFields).

## PDP
Field appears in product sheet checkboxes. Public LIST tab still needs UI Editor slot on each leaf layout — not auto-wired.
