import VehicleCard from "@/components/vehicles/vehicle-card";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-in fade-in duration-300 fill-mode-both"
          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
          <VehicleCard
            vehicle={productWithSpecsToVehicle(product)}
            priority={index < priorityCount}
            favoriteId={favoriteByProductId?.get(product.id) ?? null}
            isAuthenticated={isAuthenticated}
          />
        </div>
      ))}
    </div>
  );
}
export default ProductsGrid;
