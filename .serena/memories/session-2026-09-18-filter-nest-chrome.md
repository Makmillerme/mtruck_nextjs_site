# Filter nest collapse + chrome cleanup (2026-09-18)

- Nested folder bug: collapsing parent bumps `childEpoch` and remounts children closed; while parent closed, nested `initialOpenSlug` is null so re-open does not flash prior child open state.
- Products page: white again (removed `bg-secondary`).
- Filter chrome: text-sm / h-10, softer borders, no footer rule, card `shadow-none` + light border.
