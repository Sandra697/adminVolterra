"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { sendServiceBookingEmail, sendServiceResponseEmail } from "@/lib/emails"
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/service-image"

// Service CRUD operations
export async function getAllServices() {
  try {
    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    throw new Error("Failed to fetch services")
  }
}

export async function getServiceById(id: number) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    })
    return service
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error)
    throw new Error("Failed to fetch service")
  }
}

// Update the createService function to use Cloudinary
export async function createService(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
    const duration = (formData.get("duration") as string) || null

    // Upload logo to Cloudinary if provided
    const logoFile = formData.get("logo") as File
    let logoUrl = "/placeholder.svg?height=200&width=200"

    if (logoFile && logoFile.size > 0) {
      // Upload to Cloudinary
      logoUrl = await uploadToCloudinary(logoFile)
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        logoUrl,
        price,
        duration,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/service")
    return service
  } catch (error) {
    console.error("Error creating service:", error)
    throw new Error("Failed to create service")
  }
}

// Update the updateService function to use Cloudinary
export async function updateService(id: number, formData: FormData) {
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
    const duration = (formData.get("duration") as string) || null

    // Get the current service to check if we need to update the logo
    const currentService = await prisma.service.findUnique({
      where: { id },
      select: { logoUrl: true },
    })

    let logoUrl = currentService?.logoUrl || "/placeholder.svg?height=200&width=200"
    const isCloudinaryUrl = logoUrl.includes("cloudinary.com")

    // Check if a new logo was uploaded
    const logoFile = formData.get("logo") as File
    if (logoFile && logoFile.size > 0) {
      // If there's an existing Cloudinary image, delete it
      if (isCloudinaryUrl) {
        await deleteFromCloudinary(logoUrl)
      }
      
      // Upload new image to Cloudinary
      logoUrl = await uploadToCloudinary(logoFile)
    } else if (formData.get("removeLogo") === "true") {
      // If the logo was removed and it's a Cloudinary URL, delete it
      if (isCloudinaryUrl) {
        await deleteFromCloudinary(logoUrl)
      }
      // Use a placeholder
      logoUrl = "/placeholder.svg?height=200&width=200"
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        logoUrl,
        price,
        duration,
        updatedAt: new Date(),
      },
    })

    revalidatePath("/service")
    return service
  } catch (error) {
    console.error(`Error updating service ${id}:`, error)
    throw new Error("Failed to update service")
  }
}

// Update the deleteService function to also delete the image from Cloudinary
export async function deleteService(id: number) {
  try {
    // Get the service to access its logo URL
    const service = await prisma.service.findUnique({
      where: { id },
      select: { logoUrl: true },
    })

    // Delete the service from the database
    await prisma.service.delete({
      where: { id },
    })

    // If the service has a Cloudinary logo, delete it
    if (service?.logoUrl && service.logoUrl.includes("cloudinary.com")) {
      await deleteFromCloudinary(service.logoUrl)
    }

    revalidatePath("/service")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error)
    throw new Error("Failed to delete service")
  }
}

// Service Booking operations
export async function getAllServiceBookings() {
  try {
    const bookings = await prisma.serviceBooking.findMany({
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return bookings
  } catch (error) {
    console.error("Error fetching service bookings:", error)
    throw new Error("Failed to fetch service bookings")
  }
}

export async function getServiceBookingById(id: number) {
  try {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        service: true,
        responses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    return booking
  } catch (error) {
    console.error(`Error fetching service booking ${id}:`, error)
    throw new Error("Failed to fetch service booking")
  }
}

export async function createServiceBooking(data: {
  name: string
  email: string
  phoneNumber: string
  serviceId: number
  carDetails: string
  preferredDate: Date
  alternateDate?: Date
  message?: string
}) {
  try {
    // Get the service to include in the email
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    })

    if (!service) {
      throw new Error("Service not found")
    }

    const booking = await prisma.serviceBooking.create({
      data: {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        serviceId: data.serviceId,
        carDetails: data.carDetails,
        preferredDate: data.preferredDate,
        alternateDate: data.alternateDate,
        message: data.message,
        status: "PENDING",
        updatedAt: new Date(),
      },
    })

    // Send confirmation email to customer
    await sendServiceBookingEmail({
      to: data.email,
      bookingId: booking.id.toString(),
      customerName: data.name,
      serviceName: service.name,
      preferredDate: data.preferredDate.toLocaleDateString(),
      status: "PENDING",
    })

    revalidatePath("/service/bookings")
    return booking
  } catch (error) {
    console.error("Error creating service booking:", error)
    throw new Error("Failed to create service booking")
  }
}

export async function updateBookingStatus(id: number, status: string, response?: string) {
  try {
    // First, get the booking to access its email and service
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        service: true,
      },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Update the booking status
    const updatedBooking = await prisma.serviceBooking.update({
      where: { id },
      data: {
        status: status as any, // Cast to the enum type
        updatedAt: new Date(),
      },
    })

    // If a response was provided, create a response record
    if (response && response.trim()) {
      await prisma.serviceBookingResponse.create({
        data: {
          bookingId: id,
          message: response,
          updatedAt: new Date(),
        },
      })

      // Send email notification about the response
      await sendServiceResponseEmail({
        to: booking.email,
        bookingId: booking.id.toString(),
        customerName: booking.name,
        serviceName: booking.service.name,
        message: response,
        preferredDate:
          booking.preferredDate instanceof Date
            ? booking.preferredDate.toLocaleDateString()
            : new Date(booking.preferredDate).toLocaleDateString(),
      })
    }

    // Send email notification about the status change
    await sendServiceBookingEmail({
      to: booking.email,
      bookingId: booking.id.toString(),
      customerName: booking.name,
      serviceName: booking.service.name,
      preferredDate:
        booking.preferredDate instanceof Date
          ? booking.preferredDate.toLocaleDateString()
          : new Date(booking.preferredDate).toLocaleDateString(),
      status: status,
    })

    revalidatePath("/service/bookings")
    return updatedBooking
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error)
    throw new Error("Failed to update booking")
  }
}

export async function addBookingResponse(id: number, message: string) {
  try {
    // First, get the booking to access its email and service
    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        service: true,
      },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Create a response record
    const response = await prisma.serviceBookingResponse.create({
      data: {
        bookingId: id,
        message,
        updatedAt: new Date(),
      },
    })

    // Update the booking's updatedAt timestamp
    await prisma.serviceBooking.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    })

    // Send email notification about the response
    await sendServiceResponseEmail({
      to: booking.email,
      bookingId: booking.id.toString(),
      customerName: booking.name,
      serviceName: booking.service.name,
      message,
      preferredDate:
        booking.preferredDate instanceof Date
          ? booking.preferredDate.toLocaleDateString()
          : new Date(booking.preferredDate).toLocaleDateString(),
    })

    revalidatePath("/service/bookings")
    return response
  } catch (error) {
    console.error(`Error adding response to booking ${id}:`, error)
    throw new Error("Failed to add response")
  }
}

export async function deleteBooking(id: number) {
  try {
    // This will cascade delete all responses due to the relation setup
    await prisma.serviceBooking.delete({
      where: { id },
    })
    revalidatePath("/service/bookings")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting booking ${id}:`, error)
    throw new Error("Failed to delete booking")
  }
}
