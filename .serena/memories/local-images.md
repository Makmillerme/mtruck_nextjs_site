# Local product images (2026-08-20)

Replaced Vercel Blob (`utils/supabase.ts` + `@vercel/blob`) with filesystem uploads.
- Helper: `utils/images.ts`
- Files: `public/uploads/products/` (gitignored except `.gitkeep`)
- Public URL stored in Product.image: `/uploads/products/<timestamp>-<name>`
- `deleteImage` only removes local `/uploads/products/` files; Pexels seed URLs are left alone
- Removed `BLOB_READ_WRITE_TOKEN` from env files
