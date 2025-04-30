import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandsList } from "@/components/brands/brands-list"
import Layout from "@/components/Layout"

export default async function BrandsPage() {
  return (
    <Layout>
          <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[0.85rem]  font-bold">Brands Management</h1>
        <Link href="/dashboard/brands/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Brand
          </Button>
        </Link>
      </div>
      <BrandsList />
    </div>
    </Layout>

  )
}
