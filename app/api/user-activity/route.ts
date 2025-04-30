import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get user activities with user information
    const userActivities = await prisma.userActivity.findMany({
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500000000, // Limit to most recent 50 activities
    })

    // Get sell listings with their status
    const sellListings = await prisma.sellListingOriginal.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        carName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 500000000,
    })

    // Get service bookings with their status
    const serviceBookings = await prisma.serviceBooking.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        carDetails: true,
        preferredDate: true,
        status: true,
        createdAt: true,
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50000000,
    })

    return NextResponse.json({
      userActivities,
      sellListings,
      serviceBookings,
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
