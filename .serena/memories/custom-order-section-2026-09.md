# CustomOrderSection (2026-09-09, new)

`components/custom-order-section.tsx`. Homepage-only, between `ServicesSection` and `SalesCasesSection`. Theme: «Техніка під замовлення» (custom sourcing for equipment not in the catalog).

## Design
- `id="custom-order"`, `aria-labelledby="custom-order-heading"`, `data-header-surface="dark"` (so sticky header goes translucent-dark over this band, matching Hero/Footer)
- `bg-foreground text-background` (navy) — 4th band in the homepage color rhythm, bookending with Hero/Footer
- Editorial 12-col header (same as Services/Sales). 4-step roadmap: `<ol>` divide-y / `lg:flex-row lg:divide-x`; mono `01`–`04` + `Lu*` icons (no numbered circles). `lg:first:pl-0 lg:last:pr-0`.
- Icons: `LuClipboardList`, `LuSearch`, `LuShieldCheck`, `LuTruck`
- CTA: shadcn `Button variant="ghost" size="lg"` (white text, not a fat fill) → `#contact`. The real close is the compact callback form.

## i18n
Namespace `CustomOrderSection` in uk/en/de: `eyebrow`, `title`, `subtitle`, `steps.{request|sourcing|deal|delivery}.{title,description}`, `cta`.

## Wiring
`app/[locale]/page.tsx`: `Hero → CatalogBlock → ServicesSection → CustomOrderSection → SalesCasesSection → CallbackCtaSection`.
