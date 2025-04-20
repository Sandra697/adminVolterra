import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// This is a debug endpoint to directly check for images in the database
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Get the listing
    const listing = await prisma.sellListing.findUnique({
      where: { id },
      select: {
        id: true,
        carName: true,
        imageUrl: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Get images directly
    const images = await prisma.sellListingImage.findMany({
      where: { sellListingId: id },
    })

    // Return detailed debug information
    return NextResponse.json({
      listing,
      imageCount: images.length,
      images,
      debug: {
        prismaQuery: `prisma.sellListingImage.findMany({ where: { sellListingId: ${id} } })`,
        databaseInfo: "Check if the sellListingId in the SellListingImage table matches the listing ID",
      },
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({ error: "Debug endpoint error", details: error }, { status: 500 })
  }
}
