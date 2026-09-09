# Audit follow-up 2026-09-09

Verified plan execution; fixed residual bugs:

- `getUserRole` from DB for navbar/`getAdminUser` (session additionalFields not trusted alone).
- Removed remaining `useSession` from AddToCart + SubmitReview; product page passes auth/author props.
- CatalogSearch: controlled input with render-time URL sync (no remount-on-key).
- ShareButton: resolve origin on open to avoid hydration mismatch.
- updateProductImageAction: any ADMIN (not ownership-only).
- fetchFavoriteId: null-safe via getSession (no guest redirect).
- FavoriteToggleForm pathname via `@/i18n/navigation`.
- Updated `auth-better-auth.mdc`.

next-devtools: dev server was down on :3000 during audit — static + tsc/lint used instead.
