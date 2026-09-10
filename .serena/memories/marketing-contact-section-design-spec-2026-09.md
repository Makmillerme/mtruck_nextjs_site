# Contact / callback (2026-09-10)

Two surfaces, one form (`components/contact-form.tsx`, Zod `callbackInquirySchema`, `submitCallbackInquiryAction`).

- Homepage: `CallbackCtaSection` `#contact`, `bg-secondary`, compact: mono eyebrow + `font-black` title + Input h-11 row + Button default (navy on pastel). Tight privacy `text-xs`. No icon Cards, no map.
- `/contact`: `ContactSection` — same form + phone/email/address/hours as **text** (mono labels), two columns. No Lucide circles, no map placeholder.
- Spinner: `LuLoader` (react-icons), not Lucide `Loader2`.
- Copy: `ContactSection` uk/en/de.
