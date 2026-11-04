# Account orders cart-like UI (2026-11-03)

Comfy-inspired cart in MTruck brand (navy, Manrope, rounded-sm). Iteration after first pass looked too admin/sparse.

## Layout
- Title «Замовлення N позицій» + search/create toolbar
- Left: separate OrderLine cards — click card to toggle select (no checkbox); selected = border-primary + shadow-md + ring. Links/actions ignored. Thumb · status · title · article · text actions · price
- Right sticky Summary: subtotal row + grand total + CTA
- Default select all open (NEW/IN_PROGRESS) via useState init from `items`
- CTA → CtaInquiry with joined selected names

## Files
- `account-order-line.tsx`, `account-orders-summary.tsx`, `account-orders-view.tsx`
- `ConfirmDeleteCallbackIcon` optional `label` for text action
- UI Lab `account-orders`
- i18n: ordersSelectedSubtotal, ordersGrandTotal, ordersCountShort, toFavorites, inFavorites, removeOrder, editOrderShort
