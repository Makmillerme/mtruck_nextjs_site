import PhotoCarousel from "@/components/media/photo-carousel";
import VehicleCard from "@/components/vehicles/vehicle-card";

const DEMO_IMAGES = [
  { src: "/images/hero.webp", alt: "MAN TGX 1" },
  { src: "/images/hero.webp", alt: "MAN TGX 2" },
  { src: "/images/hero.webp", alt: "MAN TGX 3" },
];

const DEMO_VEHICLE = {
  id: "ui-lab",
  name: "MAN TGX 18.440",
  price: 38500,
  image: "/images/hero.webp",
  images: ["/images/hero.webp", "/images/hero.webp", "/images/hero.webp"],
  href: "/products",
  status: "PUBLISHED" as const,
  year: 2018,
  mileage: 540000,
  euro: "Euro 6",
  categoryLabel: "Сідельні тягачі",
  transmission: "Автомат",
  feature: "Перевірено",
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[900px]:grid-cols-3 md:gap-5">
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
            Той самий компонент, що на PDP: стрілки всередині + thumbs.
          </p>
          <div className="max-w-xl overflow-hidden rounded-sm border border-border bg-background">
            <PhotoCarousel
              variant="page"
              images={DEMO_IMAGES}
              sizes="(max-width: 768px) 100vw, 36rem"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
