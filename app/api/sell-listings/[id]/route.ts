import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// GET function to fetch a sell listing by ID
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
      // Ensure the property exists before assigning
      if (!listing.SellListingImages) {
        listing.SellListingImages = []
      }
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

// PATCH function to update a sell listing
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const body = await request.json()
    console.log("Received request body:", JSON.stringify(body, null, 2))

    const { status, rejectionReason } = body
    // Use the editedListing from the body, or if not present, use the body itself as the listing data
    const editedListing = body.editedListing || body

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SOLD"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // If rejecting, require a reason
    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // If approving with edited data, save to both tables
    if (status === "APPROVED") {
      console.log("Approving with edited data:", JSON.stringify(editedListing, null, 2))

      // First, fetch the original listing with all images
      const originalListing = await prisma.sellListing.findUnique({
        where: { id },
        include: {
          SellListingImages: true,
        },
      })

      if (!originalListing) {
        return NextResponse.json({ error: "Original listing not found" }, { status: 404 })
      }

      // Try to find the brand by name if brandId is not provided
      let brandId = editedListing.brandId

      if (!brandId) {
        if (!editedListing.brandName) {
          return NextResponse.json(
            {
              error: "Brand name is required for approval",
            },
            { status: 400 },
          )
        }

        const brand = await prisma.brand.findFirst({
          where: {
            name: {
              equals: editedListing.brandName,
              mode: "insensitive",
            },
          },
        })

        if (!brand) {
          // Try to create the brand if it doesn't exist
          try {
            const newBrand = await prisma.brand.create({
              data: {
                name: editedListing.brandName,
                logoUrl: "/placeholder.svg?height=100&width=100", // Add default logo URL
                // Ensure updatedAt is set if not handled by @updatedAt
                // updatedAt: new Date(), // Only if schema doesn't auto-update
              },
            })
            brandId = newBrand.id
            console.log(`Created new brand with ID: ${brandId}`)
          } catch (error) {
            console.error("Error creating brand:", error)
            return NextResponse.json(
              {
                error: `Brand "${editedListing.brandName}" not found and could not be created. Please select a valid brand.`,
              },
              { status: 400 },
            )
          }
        } else {
          brandId = brand.id
        }
      }

      console.log(`Using brand ID: ${brandId} for car creation`)

      // Create a new car entry with the edited data
      try {
        const newCar = await prisma.car.create({
          data: {
            name: editedListing.carName,
            price: editedListing.sellingPrice,
            description: editedListing.description,
            shortDescription: editedListing.description.substring(0, 150),
            brandId: brandId, // Brand is associated here
            model: editedListing.carType,
            mileage: editedListing.mileage,
            status: "USED", // Assuming all approved listings are used cars
            enginePower: editedListing.enginePower,
            seats: editedListing.seatingCapacity || 5,
            color: editedListing.color,
            yearOfManufacture: editedListing.yearOfManufacture,
            currentLocation: editedListing.location,
            drive: editedListing.driveType || "FWD",
            engineSize: editedListing.engineSize || 0,
            fuelType: editedListing.fuelType || "Petrol",
            horsePower: editedListing.horsePower || editedListing.enginePower,
            transmission: editedListing.transmission || "Manual",
            torque: editedListing.torque || "",
            updatedAt: new Date(), // Explicitly set updatedAt
          },
        })

        console.log(`Created new car with ID: ${newCar.id}`)

        // ENHANCED IMAGE HANDLING: First check for images directly in the database
        const sellListingImages = await prisma.sellListingImage.findMany({
          where: { sellListingId: id },
          orderBy: { createdAt: "asc" },
        })

        // Save images for the new car with enhanced handling
        if (sellListingImages && sellListingImages.length > 0) {
          console.log(`Found ${sellListingImages.length} images directly in database for listing #${id}`)

          // Create CarImage records for each SellListingImage
          for (const image of sellListingImages) {
            await prisma.carImage.create({
              data: {
                url: image.url,
                carId: newCar.id,
                updatedAt: new Date(),
              },
            })
          }
        } else if (originalListing.SellListingImages && originalListing.SellListingImages.length > 0) {
          console.log(`Using ${originalListing.SellListingImages.length} images from relation`)

          // Use images from the relation if direct query found none
          for (const image of originalListing.SellListingImages) {
            await prisma.carImage.create({
              data: {
                url: image.url,
                carId: newCar.id,
                updatedAt: new Date(),
              },
            })
          }
        } else if (originalListing.imageUrl) {
          console.log(`Using single imageUrl as fallback`)

          // Fallback to the single imageUrl if no images found in either place
          await prisma.carImage.create({
            data: {
              url: originalListing.imageUrl,
              carId: newCar.id,
              updatedAt: new Date(),
            },
          })
        } else {
          console.log(`No images found for listing #${id}`)
        }

        // Save the original listing to SellListingOriginal
        const originalData = {
          name: originalListing.name,
          email: originalListing.email,
          phoneNumber: originalListing.phoneNumber,
          carName: originalListing.carName,
          description: originalListing.description,
          color: originalListing.color,
          location: originalListing.location,
          mileage: originalListing.mileage,
          brandName: editedListing.brandName, // Use potentially edited brand name
          carType: originalListing.carType,
          yearOfManufacture: originalListing.yearOfManufacture,
          enginePower: originalListing.enginePower,
          engineType: originalListing.engineType,
          engineSize: originalListing.engineSize,
          fuelType: originalListing.fuelType,
          transmission: originalListing.transmission,
          driveType: originalListing.driveType,
          horsePower: originalListing.horsePower,
          torque: originalListing.torque,
          acceleration: originalListing.acceleration,
          topSpeed: originalListing.topSpeed,
          vinNumber: originalListing.vinNumber,
          registrationNumber: originalListing.registrationNumber,
          lastServiceDate: originalListing.lastServiceDate,
          numberOfOwners: originalListing.numberOfOwners,
          seatingCapacity: originalListing.seatingCapacity,
          doors: originalListing.doors,
          weight: originalListing.weight,
          fuelTankCapacity: originalListing.fuelTankCapacity,
          hasAC: originalListing.hasAC,
          hasPowerSteering: originalListing.hasPowerSteering,
          hasNavigation: originalListing.hasNavigation,
          hasSunroof: originalListing.hasSunroof,
          hasLeatherSeats: originalListing.hasLeatherSeats,
          hasBackupCamera: originalListing.hasBackupCamera,
          hasParkingSensors: originalListing.hasParkingSensors,
          hasBluetoothAudio: originalListing.hasBluetoothAudio,
          hasCruiseControl: originalListing.hasCruiseControl,
          hasKeylessEntry: originalListing.hasKeylessEntry,
          hasABS: originalListing.hasABS,
          hasAirbags: originalListing.hasAirbags,
          hasESP: originalListing.hasESP,
          hasTractionControl: originalListing.hasTractionControl,
          condition: originalListing.condition,
          sellingPrice: originalListing.sellingPrice,
          marketValue: originalListing.marketValue,
          isNegotiable: originalListing.isNegotiable,
          reasonForSelling: originalListing.reasonForSelling,
          imageUrl: originalListing.imageUrl,
          documentUrls: originalListing.documentUrls || [],
          carId: newCar.id, // Link original to the new car
          memberId: originalListing.memberId,
          status: "APPROVED", // Mark original as approved too
          availableForViewing: originalListing.availableForViewing,
          bestTimeToContact: originalListing.bestTimeToContact,
          additionalInfo: originalListing.additionalInfo,
          // Ensure all fields required by SellListingOriginal are included
        }

        // Removed redundant prepareCreateData function - use spread directly
        await prisma.sellListingOriginal.create({
          data: {
            // Map only the fields that exist in SellListingOriginal schema
            name: originalData.name,
            email: originalData.email,
            phoneNumber: originalData.phoneNumber,
            carName: originalData.carName,
            description: originalData.description,
            color: originalData.color,
            location: originalData.location,
            mileage: originalData.mileage,
            brandName: originalData.brandName,
            carType: originalData.carType,
            yearOfManufacture: originalData.yearOfManufacture,
            enginePower: originalData.enginePower,
            engineType: originalData.engineType,
            engineSize: originalData.engineSize,
            fuelType: originalData.fuelType,
            transmission: originalData.transmission,
            driveType: originalData.driveType,
            horsePower: originalData.horsePower,
            torque: originalData.torque,
            acceleration: originalData.acceleration,
            topSpeed: originalData.topSpeed,
            vinNumber: originalData.vinNumber,
            registrationNumber: originalData.registrationNumber,
            lastServiceDate: originalData.lastServiceDate,
            numberOfOwners: originalData.numberOfOwners,
            seatingCapacity: originalData.seatingCapacity,
            doors: originalData.doors,
            weight: originalData.weight,
            fuelTankCapacity: originalData.fuelTankCapacity,
            hasAC: originalData.hasAC,
            hasPowerSteering: originalData.hasPowerSteering,
            hasNavigation: originalData.hasNavigation,
            hasSunroof: originalData.hasSunroof,
            hasLeatherSeats: originalData.hasLeatherSeats,
            hasBackupCamera: originalData.hasBackupCamera,
            hasParkingSensors: originalData.hasParkingSensors,
            hasBluetoothAudio: originalData.hasBluetoothAudio,
            hasCruiseControl: originalData.hasCruiseControl,
            hasKeylessEntry: originalData.hasKeylessEntry,
            hasABS: originalData.hasABS,
            hasAirbags: originalData.hasAirbags,
            hasESP: originalData.hasESP,
            hasTractionControl: originalData.hasTractionControl,
            condition: originalData.condition,
            sellingPrice: originalData.sellingPrice,
            marketValue: originalData.marketValue,
            isNegotiable: originalData.isNegotiable,
            reasonForSelling: originalData.reasonForSelling,
            imageUrl: originalData.imageUrl,
            documentUrls: originalData.documentUrls,

            availableForViewing: originalData.availableForViewing,
            bestTimeToContact: originalData.bestTimeToContact,

            // Related tables - use connect syntax for foreign keys
            carId: newCar.id, // Direct assignment for foreign key
            // Only include memberId if it exists
            ...(originalData.memberId ? { memberId: originalData.memberId } : {}),

            // Explicitly set timestamps
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        })

        // COMPLETE REWRITE: Only include fields we know are valid for the update
        // Instead of spreading the entire editedListing object, we'll explicitly list the fields
        const updatedListing = await prisma.sellListing.update({
          where: { id },
          data: {
            // Basic information
            name: editedListing.name,
            email: editedListing.email,
            phoneNumber: editedListing.phoneNumber,
            carName: editedListing.carName,
            description: editedListing.description,
            color: editedListing.color,
            location: editedListing.location,
            mileage: editedListing.mileage,
            brandName: editedListing.brandName, // Update brand name if edited
            carType: editedListing.carType,
            yearOfManufacture: editedListing.yearOfManufacture,

            // Engine & Performance
            enginePower: editedListing.enginePower,
            engineType: editedListing.engineType,
            engineSize: editedListing.engineSize,
            fuelType: editedListing.fuelType,
            transmission: editedListing.transmission,
            driveType: editedListing.driveType,
            horsePower: editedListing.horsePower,
            torque: editedListing.torque,
            acceleration: editedListing.acceleration,
            topSpeed: editedListing.topSpeed,

            // Additional Specifications
            vinNumber: editedListing.vinNumber,
            registrationNumber: editedListing.registrationNumber,
            lastServiceDate: editedListing.lastServiceDate ? new Date(editedListing.lastServiceDate) : null,
            numberOfOwners: editedListing.numberOfOwners,
            seatingCapacity: editedListing.seatingCapacity,
            doors: editedListing.doors,
            weight: editedListing.weight,
            fuelTankCapacity: editedListing.fuelTankCapacity,

            // Features & Equipment
            hasAC: editedListing.hasAC,
            hasPowerSteering: editedListing.hasPowerSteering,
            hasNavigation: editedListing.hasNavigation,
            hasSunroof: editedListing.hasSunroof,
            hasLeatherSeats: editedListing.hasLeatherSeats,
            hasBackupCamera: editedListing.hasBackupCamera,
            hasParkingSensors: editedListing.hasParkingSensors,
            hasBluetoothAudio: editedListing.hasBluetoothAudio,
            hasCruiseControl: editedListing.hasCruiseControl,
            hasKeylessEntry: editedListing.hasKeylessEntry,

            // Safety Features
            hasABS: editedListing.hasABS,
            hasAirbags: editedListing.hasAirbags,
            hasESP: editedListing.hasESP,
            hasTractionControl: editedListing.hasTractionControl,

            // Condition and Pricing
            condition: editedListing.condition,
            sellingPrice: editedListing.sellingPrice,
            marketValue: editedListing.marketValue,
            isNegotiable: editedListing.isNegotiable,
            reasonForSelling: editedListing.reasonForSelling,

            // Images and Documentation
            imageUrl: editedListing.imageUrl,
            documentUrls: editedListing.documentUrls,

            // Listing Status
            status: "APPROVED",
            rejectionReason: null,

            // Availability
            availableForViewing: editedListing.availableForViewing,
            bestTimeToContact: editedListing.bestTimeToContact,

            // Additional Info
            additionalInfo: editedListing.additionalInfo,

            updatedAt: new Date(), // Ensure updatedAt is updated

            // Relations - use proper Prisma syntax
            Car: {
              connect: { id: newCar.id },
            },
            // Only include Member relation if memberId exists
            ...(originalListing.memberId
              ? {
                  Member: {
                    connect: { id: originalListing.memberId },
                  },
                }
              : {}),
          },
        })

        return NextResponse.json(updatedListing)
      } catch (error: any) {
        // Add type annotation for error
        console.error("Error creating car or updating listing:", error)
        // Check for Prisma validation errors specifically
        if (error.code === "P2025" || error instanceof Prisma.PrismaClientValidationError) {
          console.error("Prisma Validation Error:", error.message)
          return NextResponse.json(
            {
              error: `Failed to update listing due to validation error: ${error.message}`,
            },
            { status: 400 }, // Bad Request for validation errors
          )
        }
        return NextResponse.json(
          {
            error: `Failed to create car or update listing: ${error.message}`,
          },
          { status: 500 },
        )
      }
    } else {
      // Regular status update without editing
      const updatedListing = await prisma.sellListing.update({
        where: { id },
        data: {
          status,
          ...(status === "REJECTED" && { rejectionReason }),
          updatedAt: new Date(), // Ensure updatedAt is updated
        },
      })

      return NextResponse.json(updatedListing)
    }
  } catch (error: any) {
    // Add type annotation for error
    console.error("Error updating sell listing:", error)
    return NextResponse.json({ error: `Failed to update listing: ${error.message}` }, { status: 500 })
  }
}

// DELETE function to remove a sell listing
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Enhanced: First delete all associated images to avoid orphaned records
    // This is only needed if cascading delete is not set up in the schema
    try {
      const imageCount = await prisma.sellListingImage.count({
        where: { sellListingId: id },
      })

      if (imageCount > 0) {
        console.log(`Deleting ${imageCount} images associated with listing #${id}`)
        await prisma.sellListingImage.deleteMany({
          where: { sellListingId: id },
        })
      }
    } catch (imageError) {
      console.error("Error deleting associated images:", imageError)
      // Continue with deletion even if image deletion fails
    }

    // Now delete the listing itself
    await prisma.sellListing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Add type annotation for error
    console.error("Error deleting sell listing:", error)
    // Handle potential errors like record not found (P2025)
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 })
  }
}
