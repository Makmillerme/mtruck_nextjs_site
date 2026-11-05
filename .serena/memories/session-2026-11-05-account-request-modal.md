# Account vehicle request → Dialog CTA (2026-11-05)

## UX
- «Запит на автівку» opens **Dialog** (`sm:max-w-md`), not Sheet — CTA-style like site inquiry modal.
- Fields: required note (text). Phone input **only if** profile has no phone.
- On submit without phone: validate + save phone on User, then create REQUEST order.
- Soft success (`ok: true`) — no `redirectLocalized`; close dialog + `router.refresh()`.

## Wiring
- `account/page.tsx` loads `userPhone` on orders tab.
- `AccountCabinetView` → `AccountOrdersView` prop `userPhone`.
- i18n: `requestPhonePlaceholder`, `requestPhoneHint` (uk/en/de).

## Files
- `components/account/account-orders-view.tsx`
- `components/account/AccountCabinetView.tsx`
- `app/[locale]/account/page.tsx`
- `utils/actions.ts` (`createUserRequestOrderAction`)
- `messages/{uk,en,de}.json`
