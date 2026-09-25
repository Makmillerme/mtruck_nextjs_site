# Auth pages layout canon (2026-09-25)

Sign-in / sign-up aligned to site layout + account Card pattern.

## Pages
- `app/[locale]/sign-in/page.tsx`, `sign-up/page.tsx`
- Wrapper: `.page-content flex flex-1 flex-col items-center justify-center`
  - keeps layout gutters; fills `main` under sticky header; centers card
- `SiteChrome`: hide footer on `/sign-in` and `/sign-up` (like admin) so main ≈ remaining viewport — true optical center, no tall footer scroll

## Forms
- `w-full max-w-md` + `Card rounded-sm border-0 bg-muted shadow-none` (muted plate like pre-refactor auth)
- Header: `h1` + `CardDescription`; `CardContent space-y-4`
- OR divider mask: `bg-card`

## Soft nav / no full reload
- Navbar uses next-intl `Link` → App Router client navigation (no document reload)
- First visit in `next dev` may compile the route once (feels like a jump) — production/warm is instant
- Avoid `loading.tsx` skeleton on auth (static form; no DB wait)
- After login: `router.push` + `router.refresh()` revalidates session chrome (navbar) — intentional, not a hard reload