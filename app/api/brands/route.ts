import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: {
            Car: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(brands)
  } catch (error) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}
