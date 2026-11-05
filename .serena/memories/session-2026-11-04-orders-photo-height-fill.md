## Orders photo height-fill + equal width (2026-11-04)

### Problem
Desktop cards had white void under photo: fixed-width `aspect-[4/3]` + `items-start` while meta/actions column was taller. Cards also had uneven `w-fit` lengths.

### Canon
- Image format: **4:3** source preferred
- Mobile/tablet: `aspect-[4/3]` box + `object-cover`
- Desktop: `fit="heightFill"` — photo `h-full w-auto object-contain` in `self-stretch` column (fills card height, no horizontal crop, no void under)
- Equal card width: list `max-w-xl xl:max-w-2xl`, cards `w-full`

### Note
Flex `aspect-ratio` + stretch without fixed width collapsed to width:0 in Chromium — do not rely on that for height→width transfer.

### Verified 1280
All cards 672px wide; photo ~240×188; gapUnder ~2px; ratio ~1.28 (source).
