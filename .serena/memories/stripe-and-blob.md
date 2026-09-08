# Images (updated 2026-08-20)

Local `public/uploads/products/` (`mem:local-images`). Vercel Blob removed.

# Payments

**No Stripe.** User decision: cars are not sold via web checkout. Packages and routes removed: `stripe`, `@stripe/*`, `axios` (was only for `/api/payment`), `app/checkout`, `app/api/payment`, `app/api/confirm`, `createOrderAction`.

Cart totals still show a summary plus a note to contact a manager. Orders/admin sales pages remain empty leftovers until the vehicle-domain rewrite.
