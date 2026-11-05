# Session 2026-11-04 — PDP gallery responsive height

## Bug
After flex-1/h-full match to buybox, main stage collapsed to 0 height on mobile (single column, no definite parent height). Only thumbs remained.

## Fix
- Stage/Carousel page: `aspect-[4/3]` below `lg`; `lg:aspect-auto lg:flex-1` fills buybox column.
- Wrappers: `lg:h-full` / `lg:flex-1` only from lg up.
- Hero grid: `lg:items-stretch` so gallery column shares buybox height.
- Single-photo page: same aspect → lg fill pattern.

## Verified
- Mobile 390: stage ~350×263 (ratio 1.33), thumbs below.
- Desktop 1280: 2-col, stage ~576×504 inside 601px row matching buybox.
