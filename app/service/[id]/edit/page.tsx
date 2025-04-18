import { notFound } from "next/navigation"
import { ServiceForm } from "@/components/seviceForm"
import { getServiceById } from "@/lib/serviceAction"

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const service = await getServiceById(id)

  if (!service) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-[0.85rem]  font-bold mb-6">Edit Service: {service.name}</h1>
      <ServiceForm service={service} />
    </div>
  )
}
