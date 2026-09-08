# Account cabinet (2026-09)

## Layout (catalog-style)
- Routes: `/account`, `/account/orders`, `/account/favorites`, `/account/settings`
- Shell: `AccountShell` — catalog grid (no SidebarProvider)
- Desktop (lg+): sticky `AccountNavCard` — no logout in nav
- Mobile (<lg): `AccountMobileTabs` — 4 square Link tabs
- Breadcrumbs: inside right content column (above page children)
- Page section H1 + hint blocks removed from overview/orders/favorites/settings (nav + breadcrumbs are enough)
- Removed: `AccountSidebar.tsx`

## Logout
- Only at end of Settings (`AccountSettingsForms`)
- Style: outline — red border + red text, no fill
