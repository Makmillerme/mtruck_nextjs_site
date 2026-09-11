# Account cabinet (2026-09)

## Layout
- Routes: `/account` redirects to `/account/orders`. Tabs: `/account/orders`, `/account/favorites`, `/account/settings`. No Overview.
- Shell: `AccountShell` — framed `Tabs` on top at every breakpoint, then breadcrumbs + page. No sidebar / `AccountNavCard`.
- Nav: `AccountMobileTabs` + `accountCabinetNav` in `utils/links.ts`. Pathname → active tab; Link + `router.push`.
- Breadcrumbs: Home → Мій кабінет (`/account/orders`) → current tab.
- Navbar «Мій кабінет» still points at `/account` (redirects to orders).

## Tabs primitive
- `TabsList`: navy `border-2 border-primary` frame. Triggers have no own border; idle transparent, hover/active primary fill.
- Same look in UI Lab, CMS catalog tabs, and cabinet.

## Logout
- Only at end of Settings (`AccountSettingsForms`)
- Style: outline — red border + red text, no fill
