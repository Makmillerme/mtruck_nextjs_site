import { Product } from "@prisma/client";
import VehicleCard, { productToVehicle } from "@/components/vehicles/vehicle-card";

export default async function ProductCard({ product }: { product: Product }) {
  return <VehicleCard vehicle={productToVehicle(product)} />;
}
