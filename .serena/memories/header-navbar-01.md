Live header: RSC `Navbar` → `getSession()` → `ShopNavbar` (`components/navbar/ShopNavbar.tsx`).

## Layout
`sticky top-0 z-50` in document flow. Do **not** wrap `<header>` in a short parent (kills sticky).

Home spacer (`/`): transparent `h-14 lg:h-16` sibling (not sticky); header `-mt-14 lg:-mt-16` shares the slot. No navy paint on the spacer — `#hero` pulls up with the same negative margin so **one** `hero-photo` sits under the glass and in the hero.

Inner pages (no `.full-bleed` / `.page-content`): `main > .page-container` gets `padding-top: clamp(2.5rem, 5vw, 3.5rem)`.

`body` must not use `overflow-x-clip`.

## Surfaces
Dark (`#hero`, `#partners`, footer — flush under bar counts): `bg-black/25 backdrop-blur-xl` + `border-white/10`. Light: `bg-white/80 backdrop-blur-xl` + `border-border/50`.

Initial surface on `/` is dark.

## Nav
`siteNav` in `utils/links.ts` starts with Home (`/`, key `home`) — desktop `ShopNavbar` and mobile sheet `UserAccountSheet` (also footer). Active for `/` is exact match only.
`text-foreground`. Hover `hover:bg-foreground/10 hover:text-foreground`. Active `bg-foreground/10`.
