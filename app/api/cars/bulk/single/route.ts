// app/api/cars/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma  from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const carData = await request.json()

    // Validate required fields
    const requiredFields = [
      'name', 'price', 'description', 'shortDescription', 
      'brandId', 'model', 'mileage', 'status', 'seats', 
      'color', 'yearOfManufacture', 'currentLocation', 
      'drive', 'engineSize', 'enginePower', 'fuelType', 
      'horsePower', 'transmission'
    ]

    for (const field of requiredFields) {
      if (carData[field] === undefined || carData[field] === null) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: carData.brandId }
    })

    if (!brand) {
      return NextResponse.json(
        { message: `Brand with ID ${carData.brandId} does not exist` },
        { status: 400 }
      )
    }

    // Create new car
    const car = await prisma.car.create({
      data: {
        name: carData.name,
        price: carData.price,
        description: carData.description,
        shortDescription: carData.shortDescription,
        brandId: carData.brandId,
        model: carData.model,
        mileage: carData.mileage,
        status: carData.status,
        seats: carData.seats,
        color: carData.color,
        yearOfManufacture: carData.yearOfManufacture,
        currentLocation: carData.currentLocation,
        drive: carData.drive,
        engineSize: carData.engineSize,
        enginePower: carData.enginePower,
        fuelType: carData.fuelType,
        horsePower: carData.horsePower,
        transmission: carData.transmission,
        torque: carData.torque,
        aspiration: carData.aspiration,
        acceleration: carData.acceleration,
        // Default fields
        isFavorite: false,
        availability: true,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(car, { status: 201 })
  } catch (error) {
    console.error("Error creating car:", error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    )
  }
}