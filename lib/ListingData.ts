import prisma from "@/lib/prisma"

export async function getSellListing(id: string) {
  try {
    const numericId = Number.parseInt(id)

    if (isNaN(numericId)) {
      return null
    }

    const listing = await prisma.sellListing.findUnique({
      where: {
        id: numericId,
      },
      include: {
        Car: true,
        Member: true,
        SellListingImages: true, // Include the images relation
      },
    })

    if (!listing) {
      return null
    }

    // Ensure the date fields are properly formatted as strings
    return {
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      updatedAt: listing.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error("Error fetching sell listing:", error)
    throw new Error("Failed to fetch listing")
  }
}
