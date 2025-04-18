import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get counts from database
    const [carsCount, brandsCount, membersCount, pendingListingsCount] = await Promise.all([
      prisma.car.count(),
      prisma.brand.count(),
      prisma.member.count(),
      prisma.sellListing.count({
        where: {
          status: "PENDING",
        },
      }),
    ])

    // Get recent activity
    const recentActivity = await getRecentActivity()

    return NextResponse.json({
      stats: {
        carsCount,
        brandsCount,
        membersCount,
        pendingListingsCount,
      },
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}

async function getRecentActivity() {
  // Get recent cars
  const recentCars = await prisma.car.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
    },
  })

  // Get recent listings
  const recentListings = await prisma.sellListing.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      carName: true,
      status: true,
      createdAt: true,
    },
  })

  // Get recent tickets
  const recentTickets = await prisma.ticket.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      createdAt: true,
    },
  })

  // Get recent members
  const recentMembers = await prisma.member.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  })

  // Combine and sort by date
  const allActivity = [
    ...recentCars.map((car: { id: any; name: any; status: any; createdAt: any }) => ({
      id: car.id,
      type: "Car Added",
      name: car.name,
      status: car.status,
      date: car.createdAt,
    })),
    ...recentListings.map((listing: { id: any; carName: any; status: any; createdAt: any }) => ({
      id: listing.id,
      type: "Listing",
      name: listing.carName,
      status: listing.status,
      date: listing.createdAt,
    })),
    ...recentTickets.map((ticket: { id: any; ticketNumber: any; status: any; createdAt: any }) => ({
      id: ticket.id,
      type: "Ticket",
      name: ticket.ticketNumber,
      status: ticket.status,
      date: ticket.createdAt,
    })),
    ...recentMembers.map((member: { id: any; name: any; createdAt: any }) => ({
      id: member.id,
      type: "Member Joined",
      name: member.name,
      status: "NEW",
      date: member.createdAt,
    })),
  ]

  // Sort by date (newest first) and take top 5
  return allActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
}
