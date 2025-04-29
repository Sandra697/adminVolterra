"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { sendTicketStatusEmail, sendTicketReplyEmail } from "@/lib/emails"

// Get all tickets
export async function getAllTickets() {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        responses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    return tickets
  } catch (error) {
    console.error("Error fetching tickets:", error)
    throw new Error("Failed to fetch tickets")
  }
}

// Get ticket by ID
export async function getTicketById(id: number) {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })
    return ticket
  } catch (error) {
    console.error(`Error fetching ticket ${id}:`, error)
    throw new Error("Failed to fetch ticket")
  }
}

// Update ticket status
export async function updateTicketStatus(id: number, status: string, response?: string) {
  try {
    // First, get the ticket to access its email
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      throw new Error("Ticket not found")
    }

    // Update the ticket status
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: status as any, // Cast to the enum type
        updatedAt: new Date(),
      },
    })

    // If a response was provided, create a response record
    if (response && response.trim()) {
      await prisma.ticketResponse.create({
        data: {
          ticketId: id,
          message: response,
          updatedAt: new Date(),
        },
      })

      // Send email notification about the response
      await sendTicketReplyEmail({
        to: ticket.email,
        ticketId: ticket.ticketNumber,
        title: `Response to your ticket #${ticket.ticketNumber}`,
        replierName: "Support Team",
        message: response,
        department: "Customer Support",
      })
    }

    // Send email notification about the status change
    await sendTicketStatusEmail({
      to: ticket.email,
      ticketId: ticket.ticketNumber,
      title: `Ticket #${ticket.ticketNumber} Status Update`,
      status: status,
      department: "Customer Support",
    })

    revalidatePath("/dashboard/tickets")
    return updatedTicket
  } catch (error) {
    console.error(`Error updating ticket ${id}:`, error)
    throw new Error("Failed to update ticket")
  }
}

// Add a response to a ticket without changing status
export async function addTicketResponse(id: number, message: string) {
  try {
    // First, get the ticket to access its email
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      throw new Error("Ticket not found")
    }

    // Create a response record
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: id,
        message,
        updatedAt: new Date(),
      },
    })

    // Update the ticket's updatedAt timestamp
    await prisma.ticket.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    })

    // Send email notification about the response
    await sendTicketReplyEmail({
      to: ticket.email,
      ticketId: ticket.ticketNumber,
      title: `Response to your ticket #${ticket.ticketNumber}`,
      replierName: "Support Team",
      message,
      department: "Customer Support",
    })

    revalidatePath("/dashboard/tickets")
    return response
  } catch (error) {
    console.error(`Error adding response to ticket ${id}:`, error)
    throw new Error("Failed to add response")
  }
}

// Delete ticket
export async function deleteTicket(id: number) {
  try {
    // This will cascade delete all responses due to the relation setup
    await prisma.ticket.delete({
      where: { id },
    })
    revalidatePath("/dashboard/tickets")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting ticket ${id}:`, error)
    throw new Error("Failed to delete ticket")
  }
}

// Create a new ticket (for completeness)
export async function createTicket(data: {
  name: string
  email: string
  phoneNumber: string
  message: string
}) {
  try {
    // Generate a unique ticket number
    const ticketCount = await prisma.ticket.count()
    const ticketNumber = `TKT-${(ticketCount + 1001).toString().padStart(4, "0")}`

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        message: data.message,
        status: "OPEN",
        updatedAt: new Date(),
      },
    })

    // Send confirmation email to customer
    await sendTicketStatusEmail({
      to: data.email,
      ticketId: ticketNumber,
      title: `Your Support Ticket #${ticketNumber} Has Been Created`,
      status: "OPEN",
      department: "Customer Support",
    })

    revalidatePath("/dashboard/tickets")
    return ticket
  } catch (error) {
    console.error("Error creating ticket:", error)
    throw new Error("Failed to create ticket")
  }
}
