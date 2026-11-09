# Admin mobile sidebar abyss (2026-11-09)

Symptom: large empty gap under admin nav card on phone; shrinks when accordion expands.

Cause: admin layout `section` is `flex-1` grid with default `align-content: stretch` — free height inflated the aside row below the Card.

Fix (`app/[locale]/admin/layout.tsx`):
- `content-start` below lg
- `lg:content-stretch` so desktop aside column stays tall for sticky

Sidebar (`Sidebar.tsx`): sticky/max-h only from `lg` (`lg:sticky`); mobile is static content-sized card.