## Orders unified full-width cards (2026-11-04)

### Root causes of user complaints
1. Photo not filling height — dual layouts + fixed aspect box / contain left void under photo when content taller
2. Other screens looked different — `lg:hidden` stack vs `hidden lg:flex` desktop
3. Huge gap to summary — list had `max-w-xl` so cards were short while sidebar stuck to grid end

### Fix
- Single horizontal layout all breakpoints: photo | meta+price+actions (text-end)
- Photo: `self-stretch` + responsive width (w-28→xl:w-60) + `Image fill object-cover` (gapUnder ~2px)
- List: `w-full` no max-w → cards fill 1fr; gapToSummary ≈ grid gap (~24px)
- Sidebar widths unchanged md 18 / lg 20 / xl 22rem

### Verified
- 1280: cardW≈825, photo 240×190, gapToSummary 24
- 768: same row layout, photo fills height
- 390: same row, summary below list

### Files
- components/account/account-order-line.tsx
- components/account/account-orders-view.tsx
- components/dev/ui-lab-account-orders.tsx
