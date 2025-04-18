// app/api/cars/bulk/route.ts
import { NextRequest, NextResponse } from "next/server"
import  prisma  from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { cars } = await request.json()
    
    if (!Array.isArray(cars) || cars.length === 0) {
      return NextResponse.json(
        { message: "No cars provided or invalid format" },
        { status: 400 }
      )
    }

    // Validate all cars
    const validationErrors = []
    const requiredFields = [
      'name', 'price', 'description', 'shortDescription', 
      'brandId', 'model', 'status', 'seats', 'color', 
      'yearOfManufacture', 'currentLocation', 'drive', 
      'engineSize', 'enginePower', 'fuelType', 'horsePower', 'transmission'
    ]

    for (let i = 0; i < cars.length; i++) {
      const car = cars[i]
      const missingFields = requiredFields.filter(field => 
        car[field] === undefined || car[field] === null
      )
      
      if (missingFields.length > 0) {
        validationErrors.push(`Car at index ${i}: Missing required fields: ${missingFields.join(', ')}`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { message: "Validation errors", errors: validationErrors },
        { status: 400 }
      )
    }

    // Check if all brands exist
    const brandIds = [...new Set(cars.map(car => car.brandId))]
    const existingBrands = await prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true }
    })
    
    const existingBrandIds = existingBrands.map(brand => brand.id)
    const missingBrandIds = brandIds.filter(id => !existingBrandIds.includes(id))
    
    if (missingBrandIds.length > 0) {
      return NextResponse.json(
        { message: `Some brands do not exist: ${missingBrandIds.join(', ')}` },
        { status: 400 }
      )
    }

    // Create cars in transaction
    const results = await prisma.$transaction(
      cars.map(car => 
        prisma.car.create({
          data: {
            name: car.name,
            price: car.price,
            description: car.description,
            shortDescription: car.shortDescription,
            brandId: car.brandId,
            model: car.model,
            mileage: car.mileage || 0,
            status: car.status,
            seats: car.seats,
            color: car.color,
            yearOfManufacture: car.yearOfManufacture,
            currentLocation: car.currentLocation,
            drive: car.drive,
            engineSize: car.engineSize,
            enginePower: car.enginePower,
            fuelType: car.fuelType,
            horsePower: car.horsePower,
            transmission: car.transmission,
            torque: car.torque,
            aspiration: car.aspiration,
            acceleration: car.acceleration,
            // Default fields
            isFavorite: false,
            availability: true,
            updatedAt: new Date(),
          }
        })
      )
    )

    return NextResponse.json({ 
      message: `Successfully created ${results.length} cars`,
      count: results.length 
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating cars in bulk:", error)
    
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