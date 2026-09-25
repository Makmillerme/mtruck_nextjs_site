# Auth pages layout canon (2026-09-25)

Sign-in / sign-up aligned to site layout + account Card pattern.

## Pages
- `app/[locale]/sign-in/page.tsx`, `sign-up/page.tsx`
- Wrapper: `.page-content` (opts out of `main > .page-container` fallback padding-top; layout `page-container` becomes `contents`)
- Removed: `min-h-[60vh] flex items-center justify-center`

## Forms
- `components/auth/SignInForm.tsx`, `SignUpForm.tsx`
- `max-w-md` + `Card className="rounded-sm shadow-sm"` (same as account settings)
- Header: `h1` + `CardDescription`; body `CardContent space-y-4`
- OR divider mask: `bg-card` (not `bg-muted`)
- Dropped template `bg-muted p-8 rounded-lg` plate

## Verify
- Gutter ~28–30px; vertical pad from `.page-content` clamp
- Card top-left under content, not vertically centered in 60vh