# Layout gutters — page-container (2026-09)

## Contract

`.page-container` and `.page-content` in `app/globals.css`:
- **No** `max-width: 80rem`
- Mobile (`< 40rem` / sm): `padding-inline: 1rem` (~16px)
- Tablet+desktop (`min-width: 40rem`): `clamp(1.75rem, 1.5rem + 0.45vw, 1.875rem)` → ~28–30px, cap `1.875rem` (~30px). No `px` literals.

Navbar/Footer use the same token.

## Nesting

`app/[locale]/layout.tsx` wraps main in `page-container` with `has-[.full-bleed]:contents` / `has-[.page-content]:contents`.
