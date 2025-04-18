import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServicesList } from "@/components/services-list"

export default async function ServicesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[0.85rem]  font-bold">Services Management</h1>
        <Link href="/service/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </Link>
      </div>
      <ServicesList />
    </div>
  )
}
