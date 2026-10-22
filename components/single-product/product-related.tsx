import VehicleCard, {
  type VehicleCardModel,
} from "@/components/vehicles/vehicle-card";

export default function ProductRelated({
  title,
  vehicles,
  isAuthenticated = false,
}: {
  title: string;
  vehicles: VehicleCardModel[];
  isAuthenticated?: boolean;
}) {
  if (vehicles.length === 0) return null;

  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[900px]:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            isAuthenticated={isAuthenticated}
            showFavorite={false}
          />
        ))}
      </div>
    </section>
  );
}
