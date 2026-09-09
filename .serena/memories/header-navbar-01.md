Live header: RSC `Navbar` → `getSession()` → `ShopNavbar` (`components/navbar/ShopNavbar.tsx`).

## Layout
`sticky top-0 z-50` in document flow. Do **not** wrap `<header>` in a short parent (kills sticky).

Home navy slot: sibling `h-14 lg:h-16 bg-[#061020]` with `data-header-surface="dark"`; header `-mt-14 lg:-mt-16`. Slot is not sticky.

Inner pages (no `.full-bleed` / `.page-content`): `main > .page-container` gets `padding-top: clamp(2.5rem, 5vw, 3.5rem)` so catalog/about/account do not stick to the bar. Services keep `.page-content`. Partnership/FAQ/contacts keep section spacing.

`body` must not use `overflow-x-clip`.

## Surfaces
Dark (home slot, `#hero`, `#partners`, footer — including a dark block flush below the bar): `bg-black/25 backdrop-blur-xl` + `border-white/10`. Light: `bg-white/80 backdrop-blur-xl` + `border-border/50`. Navy slot behind keeps `#061020` so dark glass stays navy-tinted, not dirty gray from white glass.

Initial surface on `/` is dark to avoid a white flash.

## Nav
`text-foreground`. Hover `hover:bg-foreground/10 hover:text-foreground`. Active `bg-foreground/10`.
