import VehicleCard from "@/components/vehicles/vehicle-card";

export default async function UiLabBlocks() {
  return (
    <section className="full-bleed bg-secondary">
      <div className="page-container space-y-6 py-16 md:py-24">
        <header className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Картка техніки
          </h2>
          <p className="text-sm text-muted-foreground">
            Живий `VehicleCard` на пастелі. Тінь + zoom фото на hover.
            Кнопки без drop-shadow — картки з тінню.
          </p>
        </header>
        <div className="max-w-sm">
          <VehicleCard
            vehicle={{
              id: "ui-lab",
              name: "MAN TGX 18.440",
              price: 38500,
              image: "/images/hero.webp",
              href: "/products",
              status: "PUBLISHED",
              year: 2018,
              mileage: 540000,
              euro: "Euro 6",
              categoryLabel: "Сідельні тягачі",
              transmission: "Автомат",
              feature: "Перевірено",
            }}
            isAuthenticated={false}
          />
        </div>
      </div>
    </section>
  );
}
