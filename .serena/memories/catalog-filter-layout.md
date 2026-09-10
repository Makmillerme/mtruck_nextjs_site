# Catalog finder (homepage + UI Lab)

Date: 2026-09-10

## Layout
- Category tiles sit **on pastel**, white `bg-background`, `rounded-sm`, `shadow-sm`. Not inside the filter plate.
- Brand + availability + summary + CTA sit on a **white plate** (`rounded-sm border bg-background p-5 md:p-8 shadow-sm`) so the filter pops off pastel. Do not flatten this back to a hairline `border-t`.

## Filter value
- Plate heading: `filterEyebrow` + `filterLead`.
- Brands: pills. Active = navy fill (`bg-primary text-primary-foreground`). Idle = `bg-secondary` (must contrast on the white plate).
- Availability: three **choice rows** with title + `statusHint` (yard / inspect / transit timeline). Selected = navy fill.
- Footer: selection `summary` (`{category} · {brand} · {status}`) + `Button size=lg` CTA with mock count.

## i18n
`CategoryFinder` in uk/en/de: `filterEyebrow`, `filterLead`, `statusHint.*`, `summary`.

## UI Lab
Section `finder` (brand) mounts live `CategoryFinderPanel` on pastel. Same component as the homepage.
