## Account orders — vehicle request CTA (2026-11-04)

### Product decision
- Client cabinet must NOT feel like “create order for a specific catalog truck”.
- Catalog trucks are ordered from the product page CTA.
- Account toolbar CTA is a **custom vehicle request** (`Order.kind = REQUEST`): category folder + description.

### Copy (AccountCabinet i18n uk/en/de)
- `createOrder` → «Запит на автівку» / Request a vehicle / Fahrzeug anfragen
- Sheet title/lede explain missing catalog vehicle
- `orderNote` = “Що шукаєте” + `orderNotePlaceholder`
- `submitCreateOrder` → «Надіслати запит»
- `requestPricePending` for REQUEST with total ≤ 0
- Empty state: catalog + secondary `emptyRequestAction` opens create sheet

### Schema
- `userRequestOrderSchema.note` required min 10 / max 2000 (create + edit REQUEST)

### UI
- `AccountOrderLine`: stack photo on mobile (`flex-col` → `sm:flex-row`), fixed width photo from sm, note snippet for REQUEST
- List grid: summary `order-1` on mobile, sticky right from lg; narrower summary column
- `AdminListToolbar` create button has `aria-label`
- UI Lab account-orders hint updated

### Files
- `components/account/account-orders-view.tsx`
- `components/account/account-order-line.tsx`
- `components/account/AccountEmptyState.tsx`
- `utils/schemas.ts`
- `messages/{uk,en,de}.json` (AccountCabinet only; Admin create-order unchanged)
