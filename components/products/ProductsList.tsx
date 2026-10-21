import VehicleCard from "@/components/vehicles/vehicle-card";
import type { CardPreviewLayoutResolved } from "@/lib/catalog/card-preview";
import { productWithSpecsToVehicle } from "@/lib/catalog/product-to-vehicle";
import type { ProductListItem } from "@/utils/product-list";

function ProductsList({
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
    <div className="grid gap-4 md:gap-5">
      {products.map((product, index) => (
        <VehicleCard
          key={product.id}
          layout="list"
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
      ))}
    </div>
  );
}
export default ProductsList;
