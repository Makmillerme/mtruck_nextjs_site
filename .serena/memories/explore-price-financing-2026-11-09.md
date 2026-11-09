# Product price & financing (explored 2026-11-09)

## Prisma
- `Product.price` Int; `Product.currency` ProductCurrency enum USD|EUR|UAH (default USD)
- No financing/lease/VAT fields on Product
- `Order.orderTotal` / tax / shipping Int — not product financing
- Category layouts: `ProductPageLayout` (keyFactsMax, keyFactSlots, tabs TEXT|TABLE|LIST, legacy slots) — no price/finance slots

## PDP computation (`app/[locale]/products/[id]/page.tsx`)
- `priceLabel = formatProductPrice(price, locale)` — **currency arg omitted → always USD**
- `leasingEstimate = Math.round(price/51)`; `leasingAmountLabel = formatProductPrice(...)`
- Passes `financingLabel`/`financingAmount` i18n strings into `ProductBuyBox`
- Formatter: `lib/catalog/product-page.ts` → `formatProductPrice(amount, locale, currency?)`
- Admin/table helper: `utils/format.ts` → `formatCurrency` (does pass currency)

## Admin
- Sheet: `components/form/PriceInput.tsx` — fields `price` + `currency` ($/€/₴)
- Used in `admin-products-view.tsx` ProductForm basics tab
- Zod: `utils/schemas.ts` productSchema price+currency; actions create/update persist currency

## Layout hooks for financial block
- Buy-box already hosts static financing UI (`product-buy-box.tsx`)
- `ProductPageLayout` / UI Editor only configure key facts + detail tabs — **no finance hook yet**
- Card preview has showPrice visibility, not financing

## Backlog (`docs/backlog/ideas.md`)
- «PDP універсальний ціновий / фінансовий блок» (2026-11-03, Відкладено)
- Related: «Сторінка оформлення замовлення (рахунок / кредит-лізинг)» (2026-11-04)
