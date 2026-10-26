# Carousel swipe fix (2026-10-23)

Проблема: на великій PDP-каруселі не працював свайп.

## Фікс PhotoCarousel
- `draggable={false}` + `pointer-events-none select-none` на Image (native image-drag ламав Embla)
- `touch-pan-y` на Embla viewport (`carousel.tsx`)
- `watchDrag: true`
- click vs drag: lightbox `onImageClick` не відкривається після свайпу (threshold 8px)

## Lightbox
- горизонтальний свайп між фото при `zoom <= 1` (pointer events)
- pinch лишається на touch 2-finger
