"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function createBrand(formData: FormData) {
  try {
    const name = formData.get("name") as string

    if (!name) {
      throw new Error("Brand name is required")
    }

    const logoFile = formData.get("logo") as File
    const vehicleImageFile = formData.get("vehicleImage") as File

    let logoUrl = null
    let vehicleImageUrl = null

    // Upload logo if provided
    if (logoFile && logoFile.size > 0) {
      try {
        const logoResult = await uploadToCloudinary(logoFile)
        if (logoResult && logoResult.secure_url) {
          logoUrl = logoResult.secure_url
        } else {
          throw new Error("Logo upload failed")
        }
      } catch (error) {
        console.error("Logo upload error:", error)
        throw new Error("Failed to upload logo")
      }
    }

    // Upload vehicle image if provided
    if (vehicleImageFile && vehicleImageFile.size > 0) {
      try {
        const vehicleResult = await uploadToCloudinary(vehicleImageFile)
        if (vehicleResult && vehicleResult.secure_url) {
          vehicleImageUrl = vehicleResult.secure_url
        }
      } catch (error) {
        console.error("Vehicle image upload error:", error)
        // Continue even if vehicle image upload fails
      }
    }

    // Create brand in database
    await prisma.brand.create({
      data: {
        name,
        logoUrl,
        vehicleImageUrl,
      },
    })

    revalidatePath("/dashboard/brands")
    return { success: true }
  } catch (error) {
    console.error("Error creating brand:", error)
    throw error
  }
}

export async function updateBrand(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string

    if (!name) {
      throw new Error("Brand name is required")
    }

    // Get current brand data
    const currentBrand = await prisma.brand.findUnique({
      where: { id },
    })

    if (!currentBrand) {
      throw new Error("Brand not found")
    }

    const logoFile = formData.get("logo") as File
    const vehicleImageFile = formData.get("vehicleImage") as File

    let logoUrl = currentBrand.logoUrl
    let vehicleImageUrl = currentBrand.vehicleImageUrl

    // Update logo if provided
    if (logoFile && logoFile.size > 0) {
      try {
        // Delete old logo if exists
        if (currentBrand.logoUrl) {
          const publicId = extractPublicId(currentBrand.logoUrl)
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }
        }

        // Upload new logo
        const logoResult = await uploadToCloudinary(logoFile)
        if (logoResult && logoResult.secure_url) {
          logoUrl = logoResult.secure_url
        }
      } catch (error) {
        console.error("Logo update error:", error)
        // Continue with existing logo if update fails
      }
    }

    // Update vehicle image if provided
    if (vehicleImageFile && vehicleImageFile.size > 0) {
      try {
        // Delete old vehicle image if exists
        if (currentBrand.vehicleImageUrl) {
          const publicId = extractPublicId(currentBrand.vehicleImageUrl)
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }
        }

        // Upload new vehicle image
        const vehicleResult = await uploadToCloudinary(vehicleImageFile)
        if (vehicleResult && vehicleResult.secure_url) {
          vehicleImageUrl = vehicleResult.secure_url
        }
      } catch (error) {
        console.error("Vehicle image update error:", error)
        // Continue with existing vehicle image if update fails
      }
    }

    // Update brand in database
    await prisma.brand.update({
      where: { id },
      data: {
        name,
        logoUrl,
        vehicleImageUrl,
      },
    })

    revalidatePath("/dashboard/brands")
    return { success: true }
  } catch (error) {
    console.error("Error updating brand:", error)
    throw error
  }
}

export async function deleteBrand(id: number) {
  try {
    // Check if brand has associated cars
    const carsCount = await prisma.car.count({
      where: { brandId: id },
    })

    if (carsCount > 0) {
      throw new Error("Cannot delete brand with associated cars")
    }

    // Get brand data
    const brand = await prisma.brand.findUnique({
      where: { id },
    })

    if (!brand) {
      throw new Error("Brand not found")
    }

    // Delete logo from Cloudinary if it exists
    if (brand.logoUrl) {
      try {
        const publicId = extractPublicId(brand.logoUrl)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }
      } catch (error) {
        console.error("Error deleting logo from Cloudinary:", error)
        // Continue with brand deletion even if image deletion fails
      }
    }

    // Delete vehicle image from Cloudinary if it exists
    if (brand.vehicleImageUrl) {
      try {
        const publicId = extractPublicId(brand.vehicleImageUrl)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }
      } catch (error) {
        console.error("Error deleting vehicle image from Cloudinary:", error)
        // Continue with brand deletion even if image deletion fails
      }
    }

    // Delete brand from database
    await prisma.brand.delete({
      where: { id },
    })

    revalidatePath("/dashboard/brands")
    return { success: true }
  } catch (error) {
    console.error("Error deleting brand:", error)
    throw error
  }
}

// Helper function to extract public ID from Cloudinary URL
function extractPublicId(url: string): string | null {
  try {
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image_id.jpg
    const urlParts = url.split("/")
    const filename = urlParts[urlParts.length - 1]
    const folderPath = urlParts[urlParts.length - 2]

    // Remove file extension
    const publicIdWithoutExt = filename.split(".")[0]

    // Return folder/filename format
    return `${folderPath}/${publicIdWithoutExt}`
  } catch (error) {
    console.error("Error extracting public ID:", error)
    return null
  }
}

export async function getBrandById(id: number) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id },
    })

    return brand
  } catch (error) {
    console.error("Error fetching brand:", error)
    throw new Error("Failed to fetch brand")
  }
}

export async function getAllBrands() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    })

    return brands
  } catch (error) {
    console.error("Error fetching brands:", error)
    throw new Error("Failed to fetch brands")
  }
}
