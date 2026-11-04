# Site-wide CTA inquiry modal (2026-11-03)

## Canon
- `CtaInquiryProvider` in `app/providers.tsx` — one Dialog for the whole site
- `CtaInquiryTrigger` opens Dialog with `ContactForm` (phone callback)
- Optional `context: { productName, productCode }` shown as a chip above the form
- After successful submit (`ok: true` from `submitCallbackInquiryAction`) dialog closes + toast
- `/contact` page kept for direct/SEO; inquiry CTAs no longer navigate there

## Wired
- PDP secondary «Залишити заявку» (`app/[locale]/products/[id]/page.tsx`)
- Hero secondary (`components/home/Hero.tsx`)
- Custom order CTA (`components/custom-order-section.tsx`)
- Services contact CTA (`components/services-page.tsx`)
- UI Lab Overlays → Dialog footer section sample

## Files
- `components/cta/cta-inquiry.tsx`
- `components/contact-form.tsx` — `inputId`, `onSuccess`
- `utils/actions.ts` — callback returns `ok`

## Related fix (same session)
`ProductEquipmentList`: responsive column chunk via `useSyncExternalStore` matchMedia so 2-col view balances (was always chunked into 3).
