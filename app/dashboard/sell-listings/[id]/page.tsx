import { SellListingDetail } from "@/components/sell-listings/sell-listing-detail"
import { getSellListing } from "@/lib/data"

export default async function SellListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const listing = await getSellListing(params.id)

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Listing Details</h1>
      <SellListingDetail listing={listing || undefined} />
    </div>
  )
}