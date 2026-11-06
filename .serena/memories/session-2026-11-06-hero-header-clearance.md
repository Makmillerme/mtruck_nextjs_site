# Hero header clearance (mobile)

**Date:** 2026-11-06

- Bug: `items-center` + `-mt-14` without top padding → eyebrow clipped under fixed header on phone.
- Fix in `components/home/Hero.tsx`: keep `-mt-14 lg:-mt-16`, add `pt-16 lg:pt-20`.
- Crop unchanged (80%/80%/79%/78%).