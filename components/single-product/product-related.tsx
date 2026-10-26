import ProductRelatedCarousel from "@/components/single-product/product-related-carousel";
import VehicleCard, {
  type VehicleCardModel,
} from "@/components/vehicles/vehicle-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const RELATED_GRID_MAX = 4;

export default function ProductRelated({
  title,
  vehicles,
  catalogHref = "/products",
  catalogLabel,
  catalogHint,
  carouselPrevLabel,
  carouselNextLabel,
  isAuthenticated = false,
}: {
  title: string;
  vehicles: VehicleCardModel[];
  catalogHref?: string;
  catalogLabel: string;
  catalogHint?: string;
  carouselPrevLabel: string;
  carouselNextLabel: string;
  isAuthenticated?: boolean;
}) {
  if (vehicles.length === 0) return null;

  const gridVehicles = vehicles.slice(0, RELATED_GRID_MAX);

  return (
    <section className="grid min-w-0 scroll-mt-24 gap-4">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>

      {/* &lt;lg: grid up to 4 + catalog button below */}
      <div className="grid gap-4 lg:hidden">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
          {gridVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={{ ...vehicle, showStatus: false }}
              isAuthenticated={isAuthenticated}
              showFavorite={false}
            />
          ))}
        </div>
        <div className="flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href={catalogHref}>{catalogLabel}</Link>
          </Button>
        </div>
      </div>

      {/* ≥lg: Embla carousel + teaser slide */}
      <div className="hidden min-w-0 lg:block">
        <ProductRelatedCarousel
          vehicles={vehicles}
          catalogHref={catalogHref}
          catalogLabel={catalogLabel}
          catalogHint={catalogHint}
          isAuthenticated={isAuthenticated}
          prevLabel={carouselPrevLabel}
          nextLabel={carouselNextLabel}
        />
      </div>
    </section>
  );
}
