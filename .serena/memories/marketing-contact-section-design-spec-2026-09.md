# Contact section (2026-09-08)

`components/contact-section.tsx` + `components/contact-form.tsx`.

- Homepage: after FAQ, before Partnership (`full-bleed`, `id="contact"`, `border-t border-border`, `section-spacing`).
- Also used on `/contact` and `/contacts`.
- Left: callback form (Zod `callbackInquirySchema`, `submitCallbackInquiryAction`, toast `Actions.callbackSubmitted`). Inline tel + CTA. Privacy link → `/privacy` (placeholder page).
- Right: 4 info cards (`bg-secondary/30`, icon 40px rounded-lg) + 16:9 map placeholder.
- Copy: `ContactSection` in uk/en/de. Icons: lucide (same as Partnership TZ).
