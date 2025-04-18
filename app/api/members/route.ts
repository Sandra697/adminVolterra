import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (isActive === "true") {
      where.isActive = true
    } else if (isActive === "false") {
      where.isActive = false
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
      ]
    }

    // Get members with pagination
    const [members, totalCount] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.member.count({ where }),
    ])

    return NextResponse.json({
      members,
      meta: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.id) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 })
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id: body.id },
    })

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Update the member
    const updatedMember = await prisma.member.update({
      where: { id: body.id },
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
