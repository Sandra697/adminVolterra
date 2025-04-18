import { BrandForm } from "@/components/brands/brand-form"
import { getBrand } from "@/lib/data"

export default async function EditBrandPage({
  params,
}: {
  params: { id: string }
}) {
  const brand = await getBrand(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem]  font-bold tracking-tight">Edit Brand</h1>
      <BrandForm brand={brand} />
    </div>
  )
}
