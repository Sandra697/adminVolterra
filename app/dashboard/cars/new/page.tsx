import { CarForm } from "@/components/cars/car-form"
import { getAllBrands, getAllFeatures } from "@/lib/action"

export default async function NewCarPage() {
  const [brands, features] = await Promise.all([getAllBrands(), getAllFeatures()])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-[0.85rem]  font-bold mb-6">Add New Car</h1>
      <CarForm brands={brands} features={features} />
    </div>
  )
}
