import { ServiceForm } from "@/components/seviceForm"

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Add New Service</h1>
      <ServiceForm />
    </div>
  )
}
