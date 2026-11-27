## PDP trust / contact / deal sections (2026-11-27)

After expert audit plan:

### Buy-box
- `ProductBuyBoxContact` under CTAs: phone + Telegram + hours (Footer i18n + `SITE_TELEGRAM_URL`)
- Trust chips link to `#product-terms`

### After details tabs (before financing)
1. `ProductTermsSection` — delivery / service / prep / documents bodies
2. `ProductHowtoSection` — 4 steps how to buy
3. `ProductDealerCard` — address/hours/phone/Telegram + inquiry CTA

### Shared
- `lib/site-contact.ts` → `SITE_TELEGRAM_URL` (footer + PDP)

### JSON-LD
- Vehicle + Offer on PDP page body

### Content checklist (ops, not code)
- Key facts should include year when present in specs
- Fill equipment MULTI_SELECT; description ≥3 paragraphs; ≥8–12 photos
- Prefer leaf ProductPageLayout key-fact slots: year, mileage, power, euro, transmission, axle, location