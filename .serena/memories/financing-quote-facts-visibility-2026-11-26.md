Quote facts under the monthly figure (dl in #financing) can be hidden, and money rows show extra currencies beside the main amount.

Admin: /admin/finance?tab=financing, section «Параметри розрахунку». Four checkboxes (Checkbox, not a new primitive): Аванс, Викуп, Разом за термін, Ставка. Default checked (shown). Autosave via saveRootFinancingAction. Buyout stays lease-only even when its box is on. If every row is off, the dl is not rendered.

Schema on RootPricing (pushed): financingShowDown, financingShowResidual, financingShowTotal, financingShowRate, Boolean @default(true). Mapped as RootPricingDto.financingFacts and FinancingOffer.facts (FinancingFactVisibility in lib/finance/financing-quote.ts). Missing column (stale Prisma client) is treated as shown (`!== false`).

Extras: offer.lines.slice(1), same conversion as the monthly stack (only when display mode is STACKED). Each extra currency sits on its own line under the main amount, right-aligned, muted (grid gap-0.5). The row uses items-start so the label lines up with the main amount. The rate row is a percent and has no extra currencies. Do not put the currencies on one line or join them with a slash.

Verified on Actros credit: Аванс 13 968 $ + 642 528 ₴, Разом 82 728 $ + 3 805 488 ₴, Ставка 14% річних. Lease also shows Викуп with the extra currency.

prisma generate hit EPERM (dev server locks query_engine DLL). A fresh process can read/write the columns. The running `npm run dev` client does not: unchecking a box returns HTTP 200 but the column stays true, and a DB false still renders the row. PRISMA_CLIENT_GEN bumped to 7 in utils/db.ts. User must restart `npm run dev` once before hide toggles persist. Do not kill the server.

UI Lab DEMO_FINANCING_OFFER includes facts all true.