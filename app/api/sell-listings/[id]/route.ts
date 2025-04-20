import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // First, let's check if there are any images for this listing directly
    const imageCount = await prisma.sellListingImage.count({
      where: { sellListingId: id },
    })

    console.log(`Database check: Found ${imageCount} images for listing #${id}`)

    // If there are images, let's fetch them directly
    const images =
      imageCount > 0
        ? await prisma.sellListingImage.findMany({
            where: { sellListingId: id },
            orderBy: { createdAt: "asc" },
          })
        : []

    // Now fetch the listing with the standard include
    const listing = await prisma.sellListing.findUnique({
      where: { id },
      include: {
        SellListingImages: true,
        Car: true,
        Member: true,
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // If the SellListingImages array is empty but we found images directly,
    // let's manually add them to the response
    if ((!listing.SellListingImages || listing.SellListingImages.length === 0) && images.length > 0) {
      console.log(`Manually adding ${images.length} images to the response`)
      listing.SellListingImages = images
    }

    // Log the response for debugging
    console.log(`Returning listing #${id} with ${listing.SellListingImages?.length || 0} additional images`)

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Error fetching sell listing:", error)
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const body = await request.json()
    const { status, rejectionReason } = body

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SOLD"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // If rejecting, require a reason
    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    const updatedListing = await prisma.sellListing.update({
      where: { id },
      data: {
        status,
        ...(status === "REJECTED" && { rejectionReason }),
      },
    })

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Error updating sell listing:", error)
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    await prisma.sellListing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sell listing:", error)
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}
