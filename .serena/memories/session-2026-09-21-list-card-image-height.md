# List card photos height-0 fix (2026-09-21)

## Симптом
List `VehicleCard`: сірий блок з badge/стрілками, фото «не видно». URL вантажились (`complete`, naturalWidth OK), але `clientHeight === 0`.

## Причина
`frame="fill"` + Embla: `CarouselContent` обгортає слайди в `div.overflow-hidden` **без висоти**. Absolute/h-full діти не розтягували viewport → Image `fill` мав parentH=0.

## Фікс
`components/ui/carousel.tsx` — viewport і flex-ряд: `h-full`. Слайди fill: `absolute inset-0` для Image.
