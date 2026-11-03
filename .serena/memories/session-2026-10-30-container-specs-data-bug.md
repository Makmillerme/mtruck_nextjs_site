# Container trucks PDP specs — data bug — 2026-10-30

## Symptom
Only `Контейнеровози` PDP specs looked broken: orphan top row «Назва / Марка», then messy second grid.

## Root cause (not CSS cell count)
1. Mistaken **content** DisplayGroup on folder: `key=nazva` name="Назва" `writesProductName=false` with sole member Марка → tiny first section.
2. Remaining specs fell into untitled `rest` via `buildProductSpecGroups`.
3. Local attrs Тип контейнера / Твістлоки had `sortOrder` 0/1 colliding with inherited Марка/Модель → interleaved order.

Writers `product_name` on Вантажні авто / Контейнеровози were fine (filtered from PDP).

## Fix applied (DB)
- Deleted DisplayGroup `nazva` content group
- Bumped container-local attr sortOrder to 10, 11
- Code: `flatSpecRows` stable sort by sortOrder then name (`c7ffb10`)

## Audit extras on same PDP
- Hydration issue badge (`button.tsx`) — separate
- Two «Схожі товари» in a11y tree = intentional mobile (`lg:hidden`) + desktop related layouts in `product-related.tsx`
