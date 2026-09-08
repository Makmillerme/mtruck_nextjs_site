# Footer (2026-09-08, compact redesign)

- Component: `components/layout/footer.tsx` (RSC)
- Mounted in `app/[locale]/layout.tsx` after `</main>`
- Compact dark bar: `py-8 md:py-10` (no `section-spacing`)
- Brand: SVG `/logo_mtruck.svg?v=flatsteel7` + short tagline
- Nav: same `siteNav` as header (`Navbar` i18n keys) — real routes, no fake catalog subtypes
- Contacts: phone / email / address / hours in one compact row (react-icons `Lu*`)
- Telegram: outline chip link → `https://t.me/mtruck_sales`
- Bottom: thin border, © + legal (`/privacy`, `/terms`)
- Icons: react-icons only (no Lucide)
- i18n `Footer` simplified in uk/en/de (`navAria` added; catalog/company columns removed)
