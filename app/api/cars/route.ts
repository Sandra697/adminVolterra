import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      include: {
        Brand: true,
        CarImage: {
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(cars)
  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 })
  }
}
