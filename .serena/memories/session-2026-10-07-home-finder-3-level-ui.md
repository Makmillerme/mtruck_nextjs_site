# Homepage finder: 3-level folder UI (2026-10-07)

## Decision
Public finder caps at **3 levels**: catalog → type → subtype (`HOME_FILTER_MAX_DEPTH = 3` in `lib/home/home-finder-shared.ts`). Deeper CMS folders are omitted from homepage payload mapping (`mapFolderNode(node, depth)`). CMS tree itself is still unlimited.

## Visual canon (`CategoryFinderPanel`)
- L1 roots: chips (`chipClass` / `chipRowClass`) with `catalogLabel` (same language as brand chips).
- L2 types: hero cards, flex-wrap, **fixed width** (`w-[9.5rem]` / `sm:w-[10.5rem]`) — no `md:grid-cols-5` + `md:min-w-0` (that stretched a lone card).
- L3 subtypes: smaller cards (`size="sm"`) nested under the selected type with `border-l-2` indent.
- Switching type hides/shows L3 of that type only.

## Lab
`components/dev/ui-lab.tsx` finder mock: root «Комерційна техніка», types тягачі/напівпричепи, grandchildren 4x2 / 6x2 with facets.

## i18n
`CategoryFinder.catalogLabel`: uk Каталог / en Catalog / de Katalog.

## Not done
Hard cap of 3 in CMS folder create UI. Facets `isFacet` like catalog. One-word admin button i18n.
