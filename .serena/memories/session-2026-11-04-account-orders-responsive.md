## Account orders responsive (UI Lab → prod) 2026-11-04

### Canon
- DOM order: list → summary (no CSS `order-*`).
- `<lg`: summary full width **below** cards.
- `lg+`: `lg:grid-cols-[minmax(0,1fr)_18rem] xl:…_20rem`, summary `lg:sticky lg:top-24`.
- Cards always `flex-row`; photo fixed width `w-[5.75rem] sm:w-28 md:w-32 lg:w-36` + self-stretch; price top-right from xs; action labels `hidden sm:inline`.
- Summary: `p-4 sm:p-5`, total `text-lg sm:text-xl`.

### Files
- `components/dev/ui-lab-account-orders.tsx` — full / max-w-3xl / max-w-[24rem] demos + REQUEST lines
- `components/account/account-order-line.tsx`
- `components/account/account-orders-summary.tsx`
- `components/account/account-orders-view.tsx`
- `ConfirmDeleteCallbackIcon` + `labelClassName` for xs hide text

### Verified
- 390: list before summary, row card, photo ~92px
- 768: stacked, photo ~128px
- 1280: same row, summary right, photo 144px
