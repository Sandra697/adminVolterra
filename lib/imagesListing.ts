"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function createSellListing(formData: FormData) {
  try {
    // Extract basic listing information
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const carName = formData.get("carName") as string
    const description = formData.get("description") as string
    const color = formData.get("color") as string
    const location = formData.get("location") as string
    const mileage = Number.parseInt(formData.get("mileage") as string)
    const brandName = formData.get("brandName") as string
    const carType = formData.get("carType") as string
    const enginePower = Number.parseInt(formData.get("enginePower") as string)
    const engineType = formData.get("engineType") as string
    const condition = formData.get("condition") as "GOOD" | "AVERAGE" | "POOR" | "BAD"
    const sellingPrice = Number.parseFloat(formData.get("sellingPrice") as string)

    // Get the main image URL
    const imageUrl = formData.get("imageUrl") as string

    // Get JSON string containing additional image URLs
    const additionalImagesJson = formData.get("additionalImages") as string
    const additionalImages = additionalImagesJson ? JSON.parse(additionalImagesJson) : []

    console.log("Creating sell listing with main image:", imageUrl)
    console.log("Additional images:", additionalImages)

    // Create the sell listing with the main image
    const sellListing = await prisma.sellListing.create({
      data: {
        name,
        email,
        phoneNumber,
        carName,
        description,
        color,
        location,
        mileage,
        brandName,
        carType,
        enginePower,
        engineType,
        condition,
        sellingPrice,
        imageUrl, // Main image URL
        status: "PENDING",
        updatedAt: new Date(),
      },
    })

    // Create records for additional images
    if (additionalImages.length > 0) {
      console.log(`Creating ${additionalImages.length} additional image records`)

      const imageRecords = await prisma.sellListingImage.createMany({
        data: additionalImages.map((url: string) => ({
          url,
          sellListingId: sellListing.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      })

      console.log(`Created ${imageRecords.count} image records`)
    }

    revalidatePath("/sell-your-car")
    return { success: true, data: sellListing }
  } catch (error) {
    console.error("Error creating sell listing:", error)
    return { success: false, error: "Failed to create sell listing" }
  }
}
