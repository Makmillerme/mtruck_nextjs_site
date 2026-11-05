## Orders photo landscape 4:3 (2026-11-04)

User: photo must be album/landscape, not vertical or square.

### Cause
Height-stretch (`h-full` / grid fill) made portrait slots when content column taller than width.

### Canon
- `aspect-[4/3]` width-driven: w-32 → sm:w-36 → md:w-40 → lg:w-48 → xl:w-56
- `object-cover object-center`
- Row: `flex items-start` (photo does not stretch)

### Verified
- ~500px: 128×96 (1.33)
- 1280: 224×168 (1.33)
