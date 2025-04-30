import { notFound } from "next/navigation"
import { CarForm } from "@/components/cars/car-form"
import { getCarById, getAllBrands, getAllFeatures } from "@/lib/action"
import Layout from "@/components/Layout"

export default async function EditCarPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)

  const [car, brands, features] = await Promise.all([getCarById(id), getAllBrands(), getAllFeatures()])

  if (!car) {
    notFound()
  }

  return (
    <Layout>
          <div className="sm:container sm:mx-auto px-2 py-10">
      <h1 className="text-[0.85rem]  font-bold mb-6">Edit Car: {car.name}</h1>
      <CarForm car={car} brands={brands} features={features} />
    </div>
    </Layout>

  )
}
