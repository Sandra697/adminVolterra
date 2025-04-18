import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const brandId = searchParams.get("brandId") ? Number.parseInt(searchParams.get("brandId")!, 10) : undefined
    const status = searchParams.get("status") as "NEW" | "USED" | undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    if (brandId) {
      where.brandId = brandId
    }

    if (status) {
      where.status = status
    }

    // Get cars with pagination
    const [cars, totalCount] = await Promise.all([
      prisma.car.findMany({
        where,
        include: {
          Brand: true,
          CarImage: true,
          Feature: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ])

    return NextResponse.json({
      cars,
      meta: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Extract features and images from the request
    const { features, images, ...carData } = body

    // Create the car with a transaction to handle related records
    const car = await prisma.$transaction(async (tx) => {
      // Create the car
      const newCar = await tx.car.create({
        data: {
          ...carData,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      // Create images if provided
      if (images && images.length > 0) {
        await tx.carImage.createMany({
          data: images.map((image: { url: string }) => ({
            url: image.url,
            carId: newCar.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        })
      }

      // Connect features if provided
      if (features && features.length > 0) {
        await tx.car.update({
          where: { id: newCar.id },
          data: {
            Feature: {
              connect: features.map((featureId: number) => ({ id: featureId })),
            },
          },
        })
      }

      // Return the car with related records
      return tx.car.findUnique({
        where: { id: newCar.id },
        include: {
          Brand: true,
          CarImage: true,
          Feature: true,
        },
      })
    })

    return NextResponse.json(car, { status: 201 })
  } catch (error) {
    console.error("Error creating car:", error)
    return NextResponse.json({ error: "Failed to create car" }, { status: 500 })
  }
}
