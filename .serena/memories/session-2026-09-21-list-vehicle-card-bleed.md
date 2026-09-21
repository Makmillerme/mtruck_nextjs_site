# List VehicleCard full-bleed photo (2026-09-21)

## Проблема
У `layout="list"` під фото була біла смуга: `PhotoCarousel` з `aspect-[4/3]` нижчий за колонку контенту.

## Рішення
- `PhotoCarousel`: проп `frame="ratio" | "fill"` (default ratio). Fill = `h-full` замість aspect на stage/slides.
- `VehicleCard` list: обгортка `aspect-[4/3] md:aspect-auto md:w-[min(52%,28rem)] md:self-stretch` + carousel `absolute inset-0` + `frame="fill"` (ширше за початкові 42%/22rem — менше «квадрат»).
- UI Lab «Картка техніки»: секція List з `layout="list"`.
- Embla viewport: `h-full` у `CarouselContent` (інакше Image fill → height 0).

Grid без змін (ratio 4/3).
