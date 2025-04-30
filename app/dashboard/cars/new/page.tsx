import { CarForm } from "@/components/cars/car-form"
import { getAllBrands, getAllFeatures } from "@/lib/action"
import Layout from "@/components/Layout"

export default async function NewCarPage() {
  const [brands, features] = await Promise.all([getAllBrands(), getAllFeatures()])

  return (
    <Layout>
      <div className="sm:container sm:mx-auto px-2 py-10">
      <h1 className="text-[0.85rem]  font-bold mb-6">Add New Car</h1>
      <CarForm brands={brands} features={features} />
    </div>
    </Layout>
  )
}
