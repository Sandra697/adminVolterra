"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary"

export async function createCar(formData: FormData) {
  try {
    // Extract basic car data
    const name = formData.get("name") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const description = formData.get("description") as string
    const shortDescription = formData.get("shortDescription") as string
    const brandId = Number.parseInt(formData.get("brandId") as string)
    const model = formData.get("model") as string
    const mileage = Number.parseInt(formData.get("mileage") as string)
    const status = formData.get("status") as string
    const enginePower = Number.parseInt(formData.get("enginePower") as string)
    const seats = Number.parseInt(formData.get("seats") as string)
    const color = formData.get("color") as string
    const yearOfManufacture = Number.parseInt(formData.get("yearOfManufacture") as string)
    const currentLocation = formData.get("currentLocation") as string
    const availability = formData.get("availability") === "true"
    const drive = formData.get("drive") as string
    const engineSize = Number.parseFloat(formData.get("engineSize") as string)
    const fuelType = formData.get("fuelType") as string
    const horsePower = Number.parseInt(formData.get("horsePower") as string)
    const transmission = formData.get("transmission") as string
    const torque = (formData.get("torque") as string) || null
    const aspiration = (formData.get("aspiration") as string) || null
    const acceleration = formData.get("acceleration") ? Number.parseFloat(formData.get("acceleration") as string) : null
    const badge = (formData.get("badge") as string) || null

    // Extract feature IDs
    const featureIds = formData.getAll("features").map((id) => Number.parseInt(id as string))

    // Create car in database
    const car = await prisma.car.create({
      data: {
        name,
        price,
        description,
        shortDescription,
        brandId,
        model,
        mileage,
        status: status as any,
        enginePower,
        seats,
        color,
        yearOfManufacture,
        currentLocation,
        availability,
        drive,
        engineSize,
        fuelType,
        horsePower,
        transmission,
        torque,
        aspiration,
        acceleration,
        badge,
        Feature: {
          connect: featureIds.map((id) => ({ id })),
        },
        updatedAt: new Date(),
      },
    })

    // Handle image uploads
    const images = formData.getAll("images") as File[]
    const imageUrls = []

    for (const image of images) {
      if (image.size > 0) {
        const result = await uploadToCloudinary(image)
        if (result) {
          imageUrls.push(result.secure_url)
        }
      }
    }

    // Create car images
    if (imageUrls.length > 0) {
      await prisma.carImage.createMany({
        data: imageUrls.map((url) => ({
          url,
          carId: car.id,
          updatedAt: new Date(),
        })),
      })
    }

    revalidatePath("/dashboard/cars")
    redirect("/dashboard/cars")
  } catch (error) {
    console.error("Error creating car:", error)
    throw new Error("Failed to create car")
  }
}

export async function updateCar(id: number, formData: FormData) {
  try {
    // Extract basic car data
    const name = formData.get("name") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const description = formData.get("description") as string
    const shortDescription = formData.get("shortDescription") as string
    const brandId = Number.parseInt(formData.get("brandId") as string)
    const model = formData.get("model") as string
    const mileage = Number.parseInt(formData.get("mileage") as string)
    const status = formData.get("status") as string
    const enginePower = Number.parseInt(formData.get("enginePower") as string)
    const seats = Number.parseInt(formData.get("seats") as string)
    const color = formData.get("color") as string
    const yearOfManufacture = Number.parseInt(formData.get("yearOfManufacture") as string)
    const currentLocation = formData.get("currentLocation") as string
    const availability = formData.get("availability") === "true"
    const drive = formData.get("drive") as string
    const engineSize = Number.parseFloat(formData.get("engineSize") as string)
    const fuelType = formData.get("fuelType") as string
    const horsePower = Number.parseInt(formData.get("horsePower") as string)
    const transmission = formData.get("transmission") as string
    const torque = (formData.get("torque") as string) || null
    const aspiration = (formData.get("aspiration") as string) || null
    const acceleration = formData.get("acceleration") ? Number.parseFloat(formData.get("acceleration") as string) : null
    const badge = (formData.get("badge") as string) || null

    // Extract feature IDs
    const featureIds = formData.getAll("features").map((id) => Number.parseInt(id as string))

    // Update car in database
    await prisma.car.update({
      where: { id },
      data: {
        name,
        price,
        description,
        shortDescription,
        brandId,
        model,
        mileage,
        status: status as any,
        enginePower,
        seats,
        color,
        yearOfManufacture,
        currentLocation,
        availability,
        drive,
        engineSize,
        fuelType,
        horsePower,
        transmission,
        torque,
        aspiration,
        acceleration,
        badge,
        Feature: {
          set: featureIds.map((id) => ({ id })),
        },
        updatedAt: new Date(),
      },
    })

    // Handle image uploads
    const images = formData.getAll("images") as File[]
    const imageUrls = []

    for (const image of images) {
      if (image.size > 0) {
        const result = await uploadToCloudinary(image)
        if (result) {
          imageUrls.push(result.secure_url)
        }
      }
    }

    // Create car images
    if (imageUrls.length > 0) {
      await prisma.carImage.createMany({
        data: imageUrls.map((url) => ({
          url,
          carId: id,
          updatedAt: new Date(),
        })),
      })
    }

    // Handle deleted images
    const deletedImageIds = formData.getAll("deletedImages").map((id) => Number.parseInt(id as string))
    if (deletedImageIds.length > 0) {
      // Get the image URLs before deleting them
      const imagesToDelete = await prisma.carImage.findMany({
        where: {
          id: {
            in: deletedImageIds,
          },
        },
      })

      // Delete from Cloudinary
      for (const image of imagesToDelete) {
        if (image.url) {
          const publicId = image.url.split("/").pop()?.split(".")[0]
          if (publicId) {
            await deleteFromCloudinary(publicId)
          }
        }
      }

      // Delete from database
      await prisma.carImage.deleteMany({
        where: {
          id: {
            in: deletedImageIds,
          },
        },
      })
    }

    revalidatePath("/dashboard/cars")
    redirect("/dashboard/cars")
  } catch (error) {
    console.error("Error updating car:", error)
    throw new Error("Failed to update car")
  }
}

export async function deleteCar(id: number) {
  try {
    // Get car images before deleting
    const carImages = await prisma.carImage.findMany({
      where: { carId: id },
    })

    // Delete images from Cloudinary
    for (const image of carImages) {
      if (image.url) {
        const publicId = image.url.split("/").pop()?.split(".")[0]
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }
      }
    }

    // Delete car images first (cascade delete should handle this, but being explicit)
    await prisma.carImage.deleteMany({
      where: { carId: id },
    })

    // Delete car
    await prisma.car.delete({
      where: { id },
    })

    revalidatePath("/dashboard/cars")
  } catch (error) {
    console.error("Error deleting car:", error)
    throw new Error("Failed to delete car")
  }
}

export async function getCarById(id: number) {
  try {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        Brand: true,
        CarImage: true,
        Feature: true,
      },
    })

    return car
  } catch (error) {
    console.error("Error fetching car:", error)
    throw new Error("Failed to fetch car")
  }
}

export async function getAllFeatures() {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { name: "asc" },
    })

    return features
  } catch (error) {
    console.error("Error fetching features:", error)
    throw new Error("Failed to fetch features")
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
