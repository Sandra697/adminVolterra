import { SellListingDetail } from "@/components/sell-listings/sell-listing-detail"
import { getSellListing } from "@/lib/ListingData"

export default async function SellListingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const rawListing = await getSellListing(params.id)
  
  // Convert Date objects to strings if listing exists
  const listing = rawListing ? {
    ...rawListing,
    // Convert SellListingImages dates if they exist
    SellListingImages: rawListing.SellListingImages?.map(img => ({
      ...img,
      createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
      updatedAt: img.updatedAt instanceof Date ? img.updatedAt.toISOString() : img.updatedAt
    }))
  } : null;

  return (
    <div className="space-y-6">
      <h1 className="text-[0.85rem] font-bold tracking-tight">Listing Details</h1>
      {listing ? (
        <SellListingDetail listing={listing} />
      ) : (
        <p className="text-muted-foreground">Listing not found</p>
      )}
    </div>
  )
}