## Orders: bigger square photo on phone (2026-11-04)

User: shrink meta column, widen photo; on small screens square is OK.

### Canon
- Phone/sm: `aspect-square` w-36/40, compact meta (p-2, tighter type, action labels `max-sm:sr-only`)
- md+: `aspect-[4/3]` w-44 → xl:w-60 landscape

### File
components/account/account-order-line.tsx
