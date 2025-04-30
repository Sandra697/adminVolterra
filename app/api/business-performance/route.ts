// app/api/business-performance/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch sell listings with their status
    const sellListings = await prisma.sellListingOriginal.findMany({
      select: {
        id: true,
        name: true,
        carName: true,
        status: true,
        sellingPrice: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Get service bookings with their status and service names
    const serviceBookings = await prisma.serviceBooking.findMany({
      select: {
        id: true,
        status: true,
        createdAt: true,
        service: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get all services for reference
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    // Calculate some stats
    const totalSold = sellListings.filter(item => item.status === 'SOLD').length;
    const pendingApproval = sellListings.filter(item => item.status === 'PENDING').length;
    
    const bookingsByStatus = {
      PENDING: serviceBookings.filter(b => b.status === 'PENDING').length,
      CONFIRMED: serviceBookings.filter(b => b.status === 'CONFIRMED').length,
      COMPLETED: serviceBookings.filter(b => b.status === 'COMPLETED').length,
      CANCELLED: serviceBookings.filter(b => b.status === 'CANCELLED').length,
      RESCHEDULED: serviceBookings.filter(b => b.status === 'RESCHEDULED').length,
    };

    return NextResponse.json({
      sellListings,
      serviceBookings,
      services,
      stats: {
        totalListings: sellListings.length,
        totalSold,
        pendingApproval,
        bookingsByStatus,
      }
    });
  } catch (error) {
    console.error("Error fetching business performance data:", error);
    return NextResponse.json({ error: "Failed to fetch business data" }, { status: 500 });
  }
}