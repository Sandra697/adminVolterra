import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { parseIntParam } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseIntParam(params.id)

    if (id === undefined) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        SellListing: true,
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseIntParam(params.id)

    if (id === undefined) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const body = await request.json()

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Update the member
    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : existingMember.isActive,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseIntParam(params.id)

    if (id === undefined) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            SellListing: true,
          },
        },
      },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if member has listings
    if (existingMember._count.SellListing > 0) {
      return NextResponse.json(
        { error: "Cannot delete member with associated listings. Remove the listings first." },
        { status: 400 },
      )
    }

    // Delete the member
    await prisma.member.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
