import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Fetch images directly for this listing
    const images = await prisma.sellListingImage.findMany({
      where: { sellListingId: id },
      orderBy: { createdAt: "asc" },
    })

    console.log(`Found ${images.length} images for listing #${id}`)

    return NextResponse.json({
      success: true,
      imageCount: images.length,
      images,
    })
  } catch (error) {
    console.error("Error fetching listing images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
