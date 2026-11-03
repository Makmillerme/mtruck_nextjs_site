# Audit: GET /api/currency 404 (2026-11-03)

## Verdict
Not a bug in `mtruck_nextjs_site`. This app has **no** FX route and never did.

## Real source
Sibling project **`D:\Project\mtruck\komerciya_mtruck_next`**:
- Route: `app/api/currency/route.ts` — scrapes Minfin Lutsk (`minfin.com.ua/ua/currency/lutsk/`), returns `{ usd: {buy,sell}, eur: {buy,sell}, updatedAt }` with `s-maxage=1800`.
- Callers: `components/AppHeader.tsx`, `components/ProposalForm.tsx`, `components/kmp/KMPCalculator.tsx`, `lib/currency-api.ts` — all `fetch("/api/currency")`.

## Why 404 in mtruck_nextjs_site logs
When **this** Next app owns `:3000`, those relative fetches (from an open komerciya tab, or after port switch) hit mtruck → **404**. When **komerciya** owns `:3000` (confirmed PID running `komerciya_mtruck_next\...\start-server.js`), same path returns **200** with rates.

`Product.currency` in mtruck = price label USD/EUR/UAH only — unrelated.

## Actions taken
- Temporary diag `app/api/currency/route.ts` in mtruck was added then **deleted** (do not keep).
- No FX API added to mtruck.

## Ops tip
Do not run both apps on the same port; close stale localhost:3000 tabs from the other project.
