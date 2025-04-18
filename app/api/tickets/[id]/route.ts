import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { parseIntParam } from "@/lib/api"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseIntParam(params.id)

    if (id === undefined) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseIntParam(params.id)

    if (id === undefined) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    const body = await request.json()

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Update the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: body.status,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error("Error updating ticket:", error)
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseIntParam(params.id)

    if (id === undefined) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 })
    }

    // Check if ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!existingTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    // Delete the ticket
    await prisma.ticket.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting ticket:", error)
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 })
  }
}
