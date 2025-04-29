import { ServiceForm } from "@/components/seviceForm"
import { getServiceById } from "@/lib/service-actions"
import { notFound } from "next/navigation"

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const serviceId = Number.parseInt(params.id)

  if (isNaN(serviceId)) {
    notFound()
  }

  const service = await getServiceById(serviceId)

  if (!service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Edit Service</h1>
      <ServiceForm service={service} />
    </div>
  )
}
