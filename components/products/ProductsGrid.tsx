import VehicleCard from "@/components/vehicles/vehicle-card";
import type { CardPreviewLayoutResolved } from "@/lib/catalog/card-preview";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";
import type { ProductListItem } from "@/utils/product-list";

function ProductsGrid({
  products,
  layouts,
  favoriteByProductId,
  isAuthenticated,
  priorityCount = 0,
}: {
  products: ProductListItem[];
  layouts?: Map<string, CardPreviewLayoutResolved>;
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
            vehicle={productWithSpecsToVehicle(
              product,
              product.taxonomyNodeId
                ? layouts?.get(product.taxonomyNodeId)
                : undefined
            )}
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
