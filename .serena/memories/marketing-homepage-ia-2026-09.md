# Homepage IA (2026-09-10)

1. Hero (navy) — CTA «Замовити техніку» → `#custom-order`, secondary «Зв'язатися з нами» → `#contact`.
2. CatalogBlock `#catalog` / `#inventory` — `bg-secondary` pastel
3. ServicesSection `#services` — white editorial
4. CustomOrderSection `#custom-order` — navy roadmap; CTA is **ghost/text** to `#contact` (close lives on the form, not a fat button)
5. SalesCasesSection `#sales-cases` — white editorial, 3 anonymized deliveries (see `mem:sales-cases-section-2026-09`)
6. CallbackCtaSection `#contact` — compact pastel form (`components/callback-cta-section.tsx` + `contact-form.tsx`)
7. Footer — navy `bg-foreground` (see `mem:marketing-footer-design-spec-2026-09`)

Color rhythm: navy → pastel → white → navy → white → pastel → navy.

`/contact` is a separate page: same form + text facts, no fake map (`components/contact-section.tsx`).

`main` has **no** `pb-16` — that used to leave a white strip under the pastel CTA before the navy footer.

## Product principle
Homepage sections stay short/teaser. Full detail on dedicated pages.
