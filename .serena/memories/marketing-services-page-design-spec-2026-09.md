## Services page (/services) — implemented 2026-09-08

- Path in this repo: `app/[locale]/services/page.tsx` (not `app/(marketing)/…`); Header/Footer via locale layout
- Content: `components/services-page.tsx`
- Shell: `.page-content` in `app/globals.css` (max 1280px, clamp X/Y); layout unwraps via `has-[.page-content]:contents`
- No eyebrow; H1 «Наші послуги» + muted sub; grid 1→md:2 service cards (rounded-lg 48px icons, feature dots)
- Inset advantages `bg-secondary rounded-2xl`; CTA buttons → `/products` + `/contact` (catalog = products route)
- i18n: `ServicesPage` uk/en/de; metadata `metaTitle`
