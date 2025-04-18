import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CarsList } from "@/components/cars/cars-list"
import { BulkCarUpload } from "@/components/cars/bulkUpload"


export default async function CarsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[0.85rem]  font-bold">Cars Management</h1>
        <div className="flex flex-col sm:flex-row gap-2">
        <BulkCarUpload />
        
      
        <Link href="/dashboard/cars/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Car
          </Button>
        </Link>
        
      </div>
      </div>
      <CarsList />
    </div>
  )
}
