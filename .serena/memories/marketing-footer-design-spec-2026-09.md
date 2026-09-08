# Footer (2026-09-08)

- Component: `components/layout/footer.tsx` (RSC)
- Mounted in `app/[locale]/layout.tsx` after `</main>` (full-bleed dark, outside page-container wrapper)
- Shell: `<footer className="bg-foreground text-background">` → `<section aria-label className="page-container section-spacing">`
- Grid: 1 → md:2 → lg:4 (`gap-8` / `lg:gap-12`)
- Brand: text logo `M-` (background) + `TRUCK` (primary), no gap, `text-2xl font-black tracking-tight`
- Contacts: lucide Phone/Mail/MapPin/Clock size-4 primary; phone/email links; address/hours muted
- Nav: Catalog + Company columns; Telegram CTA → `https://t.me/mtruck_sales` (Button asChild + FaTelegram)
- Bottom: Separator `my-12 bg-background/10`, © + legal (`/privacy`, `/terms`)
- i18n: `Footer` in uk/en/de; placeholder `Pages.terms` + `app/[locale]/terms/page.tsx`
- Catalog subtype links currently all → `/products` (no vehicle taxonomy yet)
