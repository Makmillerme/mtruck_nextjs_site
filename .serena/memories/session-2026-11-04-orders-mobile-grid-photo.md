## Mobile order photo fill (2026-11-04)

### Why smartphones failed
Flex row + `self-stretch` + Next `Image fill` (absolute children): on mobile the photo column often did not get the content-row height → white void under photo.

### Fix
CSS `grid` with columns `[7rem|9rem|11rem|13rem|15rem]_minmax(0,1fr)`; photo cell `relative h-full` + `Image fill object-cover`.

### Verified 390
cardTop=photoTop, cardBottom=photoBottom=imgBottom; gapUnder≈2; object-fit cover.
