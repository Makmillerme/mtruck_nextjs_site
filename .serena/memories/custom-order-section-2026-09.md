# CustomOrderSection (2026-09-09, new)

`components/custom-order-section.tsx`. Homepage-only, between `ServicesSection` and `ContactSection`. Theme: «Техніка під замовлення» (custom sourcing for equipment not in the catalog).

## Design
- `id="custom-order"`, `aria-labelledby="custom-order-heading"`, `data-header-surface="dark"` (so sticky header goes translucent-dark over this band, matching Hero/Footer)
- `bg-foreground text-background` (navy) — 4th band in the homepage color rhythm, bookending with Hero/Footer
- Centered header (eyebrow/title/subtitle), then a 4-step «roadmap»: `<ol>` flex-col+divide-y on mobile → `lg:flex-row lg:divide-x lg:divide-y-0`, each `<li className="flex flex-1 ...">` for equal-width columns; numbered circles (`01`–`04`, computed via `String(index+1).padStart(2,"0")`) + small Lucide icon; `lg:first:pl-0 lg:last:pr-0` for edge padding (no JS branching, same trick as ServicesSection groups)
- Icons: ClipboardList (request), Search (sourcing), ShieldCheck (deal), Truck (delivery)
- CTA: shadcn `Button` (default/primary, `size="lg"`) → `#contact` anchor, no new page needed

## i18n
Namespace `CustomOrderSection` in uk/en/de: `eyebrow`, `title`, `subtitle`, `steps.{request|sourcing|deal|delivery}.{title,description}`, `cta`.

## Wiring
`app/[locale]/page.tsx`: `Hero → CatalogBlock → ServicesSection → CustomOrderSection → ContactSection`.
