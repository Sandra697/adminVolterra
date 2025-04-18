// app/api/features/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"

// GET all features
export async function GET(request: NextRequest) {
  try {
    const features = await prisma.feature.findMany({
      include: {
        Car: {
          select: {
            id: true,
          },
        },
      },
    });

    // Transform data to include cars count
    const featuresWithCount = features.map(feature => ({
      id: feature.id,
      name: feature.name,
      carsCount: feature.Car.length,
      createdAt: feature.createdAt.toISOString().split('T')[0],
      updatedAt: feature.updatedAt
    }));

    return NextResponse.json(featuresWithCount);
  } catch (error) {
    console.error("Error fetching features:", error);
    return NextResponse.json(
      { error: "Failed to fetch features" },
      { status: 500 }
    );
  }
}

// POST new feature
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json(
        { error: "Feature name is required" },
        { status: 400 }
      );
    }
    
    // Check for duplicate
    const existingFeature = await prisma.feature.findUnique({
      where: { name: data.name }
    });
    
    if (existingFeature) {
      return NextResponse.json(
        { error: "Feature with this name already exists" },
        { status: 409 }
      );
    }
    
    const feature = await prisma.feature.create({
      data: {
        name: data.name,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error("Error creating feature:", error);
    return NextResponse.json(
      { error: "Failed to create feature" },
      { status: 500 }
    );
  }
}
