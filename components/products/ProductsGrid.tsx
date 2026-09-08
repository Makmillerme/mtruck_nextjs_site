import { Product } from "@prisma/client";
import VehicleCard, { productToVehicle } from "@/components/vehicles/vehicle-card";

async function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <VehicleCard key={product.id} vehicle={productToVehicle(product)} />
      ))}
    </div>
  );
}
export default ProductsGrid;
