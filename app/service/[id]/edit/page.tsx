import { ServiceForm } from "@/components/seviceForm"
import { getServiceById } from "@/lib/service-actions"
import { notFound } from "next/navigation"
import Layout from "@/components/Layout"

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
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-[0.85rem]  font-bold mb-6">Edit Service: {service.name}</h1>
        <ServiceForm service={service} />
      </div>
    </Layout>
  )
}
