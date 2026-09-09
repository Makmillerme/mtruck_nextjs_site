import VehicleCard, { productToVehicle } from "@/components/vehicles/vehicle-card";
import type { ProductListItem } from "@/utils/product-list";

async function ProductsGrid({
  products,
  favoriteByProductId,
  isAuthenticated,
  priorityCount = 0,
}: {
  products: ProductListItem[];
  favoriteByProductId?: Map<string, string>;
  isAuthenticated?: boolean;
  priorityCount?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[900px]:grid-cols-3 md:gap-5">
      {products.map((product, index) => (
        <VehicleCard
          key={product.id}
          vehicle={productToVehicle(product)}
          priority={index < priorityCount}
          favoriteId={favoriteByProductId?.get(product.id) ?? null}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}
export default ProductsGrid;
