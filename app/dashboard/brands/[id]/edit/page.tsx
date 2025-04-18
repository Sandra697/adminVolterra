import { notFound } from "next/navigation"
import { BrandForm } from "@/components/brands/brand-form"
import { getBrandById } from "@/lib/brandActions"

export default async function EditBrandPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const brand = await getBrandById(id)

  if (!brand) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-[0.85rem]  font-bold mb-6">Edit Brand: {brand.name}</h1>
      <BrandForm brand={brand} />
    </div>
  )
}
