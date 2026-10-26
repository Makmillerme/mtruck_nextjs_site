# Related carousel teaser clipped on the right — 2026-10-26

## Cause
CatalogTeaserCard (last Embla slide) looked cut off: shadcn `-ml-4`/`pl-4` gap trick + `basis-1/3` made `containScroll: trimSnaps` stop ~50–110px short of the true end. Embla `overflow-hidden` clipped the teaser; next arrow sat on the card.

## Fix (`product-related-carousel.tsx`)
- Drop `-ml`/`pl` overrides; use Embla canon: `CarouselContent` `ml-0 gap-5`, items `pl-0 basis-full lg:basis-1/3 xl:basis-1/4`
- Keep `containScroll: "trimSnaps"`, `px-11` arrow gutters, `min-w-0 max-w-full`
- PDP i18n: `relatedCarouselPrev` / `relatedCarouselNext` (was wrongly `galleryPrev`/`galleryNext`)

## Verify
At end settle: teaserClip ≈ 0 at 1024 and 1200; page scrollDelta 0. Mid-animation measures can falsely show clip — wait for settle.

## Note
Peek of next slide at start (basis-1/3 + gap) is expected; not the same as end teaser clip.