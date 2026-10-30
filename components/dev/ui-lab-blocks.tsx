import ProductImageGalleryField from "@/components/admin/products/product-image-gallery-field";
import PhotoCarousel from "@/components/media/photo-carousel";
import ProductGallery from "@/components/single-product/product-gallery";
import VehicleCard from "@/components/vehicles/vehicle-card";

/** Distinct enough for Embla motion; real PDP uses product uploads. */
const DEMO_IMAGES = [
  { src: "/images/hero.webp", alt: "Slide A — webp" },
  { src: "/images/hero.png", alt: "Slide B — png" },
  { src: "/images/hero.webp", alt: "Slide C — webp again" },
  { src: "/images/hero.png", alt: "Slide D — png again" },
];

const DEMO_VEHICLE = {
  id: "ui-lab",
  name: "MAN TGX 18.440",
  price: 38500,
  image: "/images/hero.webp",
  images: ["/images/hero.webp", "/images/hero.png", "/images/hero.webp"],
  href: "/products",
  status: "PUBLISHED" as const,
  year: 2018,
  categoryLabel: "Сідельні тягачі",
  specItems: [
    { key: "mileage", label: "Пробіг", value: "540 000 км" },
    { key: "transmission", label: "КПП", value: "Автомат" },
    { key: "euro", label: "Euro", value: "Euro 6" },
    { key: "feature", label: "Особливість", value: "Перевірено" },
  ],
};

export default async function UiLabBlocks() {
  return (
    <section className="full-bleed bg-secondary">
      <div className="page-container space-y-10 py-16 md:py-24">
        <header className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Картка техніки
          </h2>
          <p className="text-sm text-muted-foreground">
            Живий `VehicleCard`: PhotoCarousel на превʼю, ціна зверху, «Детальніше»
            на всю ширину знизу. Тінь + zoom на hover.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-5">
          <VehicleCard vehicle={DEMO_VEHICLE} isAuthenticated={false} />
          <VehicleCard
            vehicle={{ ...DEMO_VEHICLE, id: "ui-lab-2", name: "Scania R450" }}
            isAuthenticated={false}
          />
          <VehicleCard
            vehicle={{
              ...DEMO_VEHICLE,
              id: "ui-lab-3",
              name: "Volvo FH16 750",
            }}
            isAuthenticated={false}
          />
        </div>

        <div className="grid max-w-4xl gap-3">
          <h3 className="text-sm font-semibold tracking-tight">List</h3>
          <p className="text-sm text-muted-foreground">
            Фото зліва на всю висоту рядка (md+), без білої смуги під превʼю.
            Той самий chrome, що в сітці.
          </p>
          <VehicleCard
            layout="list"
            vehicle={{
              ...DEMO_VEHICLE,
              id: "ui-lab-list",
              name: "Mercedes-Benz Actros 1845",
              categoryLabel: "Контейнеровози",
            }}
            isAuthenticated={false}
          />
        </div>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold tracking-tight">
            PhotoCarousel (page)
          </h3>
          <p className="text-sm text-muted-foreground">
            Embla stage + thumbs. Без lightbox — лише гортання.
          </p>
          <div className="max-w-xl overflow-hidden rounded-sm border border-border bg-background">
            <PhotoCarousel
              variant="page"
              images={DEMO_IMAGES}
              sizes="(max-width: 768px) 100vw, 36rem"
            />
          </div>
        </div>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold tracking-tight">
            PDP gallery + lightbox (канон)
          </h3>
          <p className="text-sm text-muted-foreground">
            Живий `ProductGallery`: Embla свайп на page → tap відкриває lightbox →
            L-thumbs на md+ → zoom +/− / колесо миші → свайп слайдів лише при
            zoom=1 (той самий Embla).
          </p>
          <div className="max-w-xl overflow-hidden rounded-sm border border-border bg-background p-3">
            <ProductGallery
              images={DEMO_IMAGES}
              sizes="(max-width: 768px) 100vw, 36rem"
            />
          </div>
        </div>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold tracking-tight">
            Admin gallery (DnD)
          </h3>
          <p className="text-sm text-muted-foreground">
            `ProductImageGalleryField`: PhotoCarousel + перетягування thumbs +
            кнопка додати в кінці. Без видимого file input.
          </p>
          <div className="w-full max-w-xl rounded-sm border border-border bg-background p-4">
            <ProductImageGalleryField
              existing={DEMO_IMAGES.map((image, index) => ({
                id: `lab-${index}`,
                url: image.src,
              }))}
              resetKey="ui-lab"
              alt="UI Lab"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
