# Lightbox pan/wheel/stripe (2026-10-26)

1. Pan clamp: `clampPan` — offset обмежений `(stage*(zoom-1))/2`, фото не їде в кут.
2. Wheel zoom: знову звичайне колесо (без Ctrl) — `preventDefault` + bumpZoom.
3. Біла смуга: батьківська колонка stage+toolbar `bg-muted` суцільно (gap більше не світить `bg-background`).

Файл: `components/single-product/product-lightbox.tsx`.