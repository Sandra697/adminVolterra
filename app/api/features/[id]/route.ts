
// app/api/features/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"

// GET single feature
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    const feature = await prisma.feature.findUnique({
      where: { id },
      include: {
        Car: {
          select: {
            id: true,
          },
        },
      },
    });
    
    if (!feature) {
      return NextResponse.json(
        { error: "Feature not found" },
        { status: 404 }
      );
    }
    
    // Transform to include cars count
    const featureWithCount = {
      id: feature.id,
      name: feature.name,
      carsCount: feature.Car.length,
      createdAt: feature.createdAt.toISOString().split('T')[0],
      updatedAt: feature.updatedAt
    };
    
    return NextResponse.json(featureWithCount);
  } catch (error) {
    console.error("Error fetching feature:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature" },
      { status: 500 }
    );
  }
}

// PUT (update) feature
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validate input
    if (!data.name || typeof data.name !== "string") {
      return NextResponse.json(
        { error: "Feature name is required" },
        { status: 400 }
      );
    }
    
    // Check feature exists
    const existingFeature = await prisma.feature.findUnique({
      where: { id }
    });
    
    if (!existingFeature) {
      return NextResponse.json(
        { error: "Feature not found" },
        { status: 404 }
      );
    }
    
    // Check for duplicate name
    const duplicateName = await prisma.feature.findFirst({
      where: {
        name: data.name,
        id: { not: id }
      }
    });
    
    if (duplicateName) {
      return NextResponse.json(
        { error: "Feature with this name already exists" },
        { status: 409 }
      );
    }
    
    const updatedFeature = await prisma.feature.update({
      where: { id },
      data: {
        name: data.name,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(updatedFeature);
  } catch (error) {
    console.error("Error updating feature:", error);
    return NextResponse.json(
      { error: "Failed to update feature" },
      { status: 500 }
    );
  }
}

// DELETE feature
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Check feature exists
    const existingFeature = await prisma.feature.findUnique({
      where: { id }
    });
    
    if (!existingFeature) {
      return NextResponse.json(
        { error: "Feature not found" },
        { status: 404 }
      );
    }
    
    await prisma.feature.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error("Error deleting feature:", error);
    return NextResponse.json(
      { error: "Failed to delete feature" },
      { status: 500 }
    );
  }
}