import { SellListingsList } from "@/components/sell-listings/sell-listings-list"
import Layout from "@/components/Layout"

export default function SellListingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[0.85rem]  font-bold tracking-tight">Sell Listings</h1>
        </div>
        <SellListingsList />
      </div>
    </Layout>
  )
}
