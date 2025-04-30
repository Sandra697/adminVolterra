import { SellListingDetail } from "@/components/sell-listings/sell-listing-detail"
import { getSellListing } from "@/lib/ListingData"
import Layout from "@/components/Layout"

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
    })),
    lastServiceDate: rawListing.lastServiceDate instanceof Date ? rawListing.lastServiceDate.toISOString() : rawListing.lastServiceDate
  } : null;

  return (
    <Layout>
      <div className="px-2 sm:container sm:mx-auto  py-10">
        <h1 className="text-[0.85rem]  font-bold mb-6">Sell Listing Details</h1>
        {listing && <SellListingDetail listing={listing} />}
      </div>
    </Layout>
  )
}