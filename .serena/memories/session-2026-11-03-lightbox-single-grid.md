## Fix 2026-11-03 — lightbox single-photo layout

Bug: `ProductLightbox` always used `md:grid md:grid-cols-[7.5rem_minmax(0,1fr)]`, but thumbs render only when `slides.length > 1`. With one photo the sole child sat in the 7.5rem column → tiny «thumb» image + empty white 1fr.

Fix in `components/single-product/product-lightbox.tsx`: apply 2-col grid only when `slides.length > 1`.

Verified MAN TGX lightbox: flex layout, img ~1128×490, full stage.
