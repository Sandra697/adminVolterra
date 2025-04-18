"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function createService(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const logoFile = formData.get("logo") as File

    let logoUrl = ""

    if (logoFile && logoFile.size > 0) {
      const result = await uploadToCloudinary(logoFile)
      if (result) {
        logoUrl = result.secure_url
      }
    }

    await prisma.service.create({
      data: {
        name,
        description,
        logoUrl,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/service")
    redirect("/service")
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }
}

export async function updateService(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const logoFile = formData.get("logo") as File

    const updateData: any = {
      name,
      description,
      updatedAt: new Date(),
    }

    if (logoFile && logoFile.size > 0) {
      const result = await uploadToCloudinary(logoFile)
      if (result) {
        updateData.logoUrl = result.secure_url
      }
    }

    await prisma.service.update({
      where: { id },
      data: updateData,
    })

    revalidatePath("/service")
    redirect("/service")
  } catch (error) {
    console.error("Error updating service:", error)
    throw new Error("Failed to update service")
  }
}

export async function deleteService(id: number) {
  try {
    await prisma.service.delete({
      where: { id },
    })

    revalidatePath("/service")
  } catch (error) {
    console.error("Error deleting service:", error)
    throw new Error("Failed to delete service")
  }
}

export async function getServiceById(id: number) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    })

    return service
  } catch (error) {
    console.error("Error fetching service:", error)
    throw new Error("Failed to fetch service")
  }
}
