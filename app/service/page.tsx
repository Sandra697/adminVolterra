import { ServicesList } from "@/components/services-list"
import { getAllServices } from "@/lib/service-actions"
import Layout from "@/components/Layout"

export default async function ServicesPage() {
  const services = await getAllServices()

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-[0.85rem]  font-bold mb-6">Services Management</h1>
        <ServicesList services={services} />
      </div>
    </Layout>
  )
}
