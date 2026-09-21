# Adaptive facet index (2026-09-18)

## Що зроблено

Живе звуження опцій фільтра каталогу по наявності товарів + вже обраних полів у draft (без URL на кожен клік). Apply лишається єдиним `router.replace`.

### Індекс
- `lib/catalog/filter-availability.ts` — `fetchFilterAvailabilityIndex()` (`unstable_cache` 60s): опубліковані товари → `{ pathSlugs, specs }` лише для `isFacet` полів.
- Реекспорт з `lib/catalog/public-filter.ts`.
- `ProductsContainer`: `Promise.all([fetchPublicFilterSchema, fetchFilterAvailabilityIndex])`; **прибрано** `enrichFilterSchemaForQuery` з hot path.
- Серверний prune запиту: `narrowDraftAgainstIndex` перед `fetchAllProducts`, щоб старі URL з неможливими комбінаціями не давали порожній каталог.

### Клієнтське звуження
- `lib/catalog/narrow-facets.ts` — `narrowFacetsForFolder`, `groupIndependentOptions`, `narrowDraftAgainstIndex` (лише leaf-папки).
- Класичний faceted: для кожного ключа pool = товари в папці, що проходять **інші** умови (omit self-key).
- Неможливі значення знімаються з draft одразу.
- `CatalogFilterProvider` приймає `availability`; `displayTree` з override опцій; prune draft при зміні narrowedKey.

### UI групи
- Залежні (`dependsOnKey`): як раніше `groupOptions` + `parentSlug`.
- Незалежні: якщо 2+ значення anchor SELECT (марка) і набори опцій різняться — підписи марок через `groupIndependentOptions`.

### Chrome
- Картка фільтра / mobile sheet: **білі** (pastel `bg-secondary` відхилено).
- Відступи дерева: sibling `gap-3`; між батьківською папкою і дітьми/полями — `pt-3` у expand-обгортці; поля `mt-3 pt-3 border-t` + `gap-3`.

### Lab
- `ui-lab-catalog-filter.tsx`: демо-індекс MAN/Mercedes + containerType/gearbox; те саме звуження; картка біла.
