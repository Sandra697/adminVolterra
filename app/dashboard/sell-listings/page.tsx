import { SellListingsList } from "@/components/sell-listings/sell-listings-list"

export default function SellListingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem]  font-bold tracking-tight">Sell Listings</h1>
      <SellListingsList />
    </div>
  )
}
