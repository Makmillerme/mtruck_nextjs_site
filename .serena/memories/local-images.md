# Local product images (2026-08-20, optimize 2026-09-22)

Replaced Vercel Blob with filesystem uploads.
- Helper: `utils/images.ts` — **sharp** WebP optimize on write (≤1 MB target, max edge 2400).
- Files: `public/uploads/products/` (gitignored except `.gitkeep`); avatars under `public/uploads/avatars/`.
- Public URL: `/uploads/products/<timestamp>-<name>.webp`
- Limits: `lib/catalog/product-image-limits.ts` (10 MB raw upload, 15 gallery max).
- `deleteImage` only removes local `/uploads/...` files; Pexels seed URLs left alone.
