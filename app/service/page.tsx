import { ServicesList } from "@/components/services-list"
import { getAllServices } from "@/lib/service-actions"

export default async function ServicesPage() {
  const services = await getAllServices()

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Services Management</h1>
      <ServicesList services={services} />
    </div>
  )
}
