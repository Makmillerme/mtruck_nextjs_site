## Specs layout + name template clear (2026-09-22)

### Specs look broken
Root cause: `col-span-2/3/6` lived only in `lib/catalog/sheet-layout.ts`, but `tailwind.config.ts` content did not include `./lib/**` — JIT never emitted utilities, so every field spanned 1/6 and packed into a cramped row.

Fix: add `./lib/**` + safelist; also map widths with literal class strings inside `product-spec-fields.tsx`.

### Clear all name template fields
`saveProductNameTemplateSchema` allows empty members. Empty save deletes the `product_name` writer group → manual name input. `MemberOrderPicker` `allowEmpty` for product dialog.

### Name input
One shell: tags + single free text (no «Текст перед/після»). Template active only when `members.length > 0`.
