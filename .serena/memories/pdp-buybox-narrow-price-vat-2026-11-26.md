PDP buy-box price card (updated 2026-11-27 tablet fix).

Price|VAT: always `grid-cols-2` + `divide-x`, cells centered (`justify-center` / `justify-items-center`) with `pr-3 sm:pr-5` / `pl-3 sm:pl-5`.

Financing split: always `grid-cols-2` (not `1fr_auto` below sm). Both outer spans `justify-center` with matching horizontal padding so the financing cluster and «Розрахувати» sit in the middle of their halves — including tablet widths under 640px where `sm:` never fired and left content hugged the edge in a wide `1fr` cell. Body cluster `w-fit`; label/amount/extra `whitespace-nowrap` to avoid wrap when halves are ~140–260px.

Verified: 768px and 600px equal columns, content centered (pad asymmetry only), button height ~73px without wrap.

File: `components/single-product/product-buy-box.tsx`.
