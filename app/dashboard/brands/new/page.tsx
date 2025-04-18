import { BrandForm } from "@/components/brands/brand-form"

export default function NewBrandPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-[0.85rem]  font-bold mb-6">Add New Brand</h1>
      <BrandForm />
    </div>
  )
}
