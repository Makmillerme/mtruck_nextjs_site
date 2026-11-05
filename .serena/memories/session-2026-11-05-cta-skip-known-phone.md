# CTA skips phone when profile has one

**Date:** 2026-11-05

- `fetchSessionPrimaryPhone()` in `lib/user-phone.ts`
- Locale layout → `Providers userPhone` → `CtaInquiryProvider` → `ContactForm knownPhone`
- Contact / callback sections pass `knownPhone` too
- If known: hidden `phone` input, no tel field
- If logged in without phone: field still shown
- `submitCallbackInquiryAction` falls back to profile phone when form phone empty