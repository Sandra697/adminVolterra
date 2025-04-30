import { ServiceForm } from "@/components/seviceForm"
import Layout from "@/components/Layout"

export default function NewServicePage() {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-[0.85rem]  font-bold mb-6">Add New Service</h1>
        <ServiceForm />
      </div>
    </Layout>
  )
}
