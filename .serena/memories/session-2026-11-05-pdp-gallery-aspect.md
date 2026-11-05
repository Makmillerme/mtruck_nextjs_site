# PDP gallery lg aspect fix (2026-11-05)

## Bug
On large screens stage was `lg:aspect-auto lg:flex-1` to match buybox height. Thumbs ate vertical space → stage ~102px shorter than 4:3 (e.g. 703×425 vs ideal 527). `object-cover` cropped photos harder.

## Fix
- Stage always `aspect-[4/3]` (multi + single page).
- Drop gallery `lg:h-full` / `lg:flex-1` stretch.
- Hero grid `lg:items-start` (not stretch).
- UI Lab PDP wrapper aligned.

Verified Actros PDP @1536px: stage 703×527, aspect 1.333, deltaVs4x3 0.
