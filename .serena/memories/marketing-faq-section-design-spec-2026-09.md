## FaqSection (2026-09-07)

Component: `components/faq-section.tsx`
id=#faq, aria-labelledby=faq-heading
full-bleed + section-spacing + bg-secondary (#E2E8F0)

Header: centered max-w-2xl, mb-12/lg:mb-16 — eyebrow FAQ primary uppercase, H2 font-black, muted sub.
Accordion: max-w-3xl, type=single collapsible, space-y-4.
Item: white rounded-lg border-border px-6; open border-primary #0047AB.
Trigger: py-5 font-semibold hover:text-primary hover:no-underline; Lucide ChevronDown 16px muted rotate-180.
Content: muted pb-5 leading-relaxed text-sm.
Items: customs, vat, delivery, inspection. i18n `FaqSection` in uk/en/de.
Used on homepage (after Services, before Partners) and `/faq`.
