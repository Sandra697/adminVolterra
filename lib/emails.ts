"use server"

import nodemailer from "nodemailer"
import type SMTPTransport from "nodemailer/lib/smtp-transport"
import { TicketStatusTemplate } from "@/emails/TicketStatusTemplate"
import { TicketReplyTemplate } from "@/emails/TicketReplyTemplate"
import { ServiceBookingTemplate } from "@/emails/ServiceBookingTemplate"
import { ServiceResponseTemplate } from "@/emails/ServiceResponseTemplate"
import { render } from "@react-email/render"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
} as SMTPTransport.Options)

interface TicketNotificationProps {
  to: string
  ticketId: string
  title: string
  status: string
  department: string
}

interface TicketReplyProps {
  to: string
  ticketId: string
  title: string
  replierName: string
  message: string
  department: string
}

interface ServiceBookingProps {
  to: string
  bookingId: string
  customerName: string
  serviceName: string
  preferredDate: string
  status: string
}

interface ServiceResponseProps {
  to: string
  bookingId: string
  customerName: string
  serviceName: string
  message: string
  preferredDate: string
}

export async function sendTicketStatusEmail({ to, ticketId, title, status, department }: TicketNotificationProps) {
  // Format status for display
  const formattedStatus = status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ")

  // Extract customer name from email
  const customerName = to.split("@")[0]

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: title,
    html: await render(
      TicketStatusTemplate({
        customerName: customerName,
        ticketId: ticketId,
        status: formattedStatus,
        message: getTicketStatusMessage(status),
        supportLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/support/tickets/${ticketId}`,
        department: department,
      }),
    ),
  }

  try {
    console.log("Sending ticket status email for:", ticketId)
    await transporter.sendMail(mailOptions)
    console.log("Ticket status email sent successfully to", to)
    return true
  } catch (error) {
    console.error("Error sending ticket status email:", error)
    throw error
  }
}

export async function sendTicketReplyEmail({
  to,
  ticketId,
  title,
  replierName,
  message,
  department,
}: TicketReplyProps) {
  // Extract customer name from email
  const customerName = to.split("@")[0]

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: title,
    html: await render(
      TicketReplyTemplate({
        customerName: customerName,
        ticketId: ticketId,
        replierName: replierName,
        message: message,
        supportLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/support/tickets/${ticketId}`,
        department: department,
      }),
    ),
  }

  try {
    console.log("Sending ticket reply email for:", ticketId)
    await transporter.sendMail(mailOptions)
    console.log("Ticket reply email sent successfully to", to)
    return true
  } catch (error) {
    console.error("Error sending ticket reply email:", error)
    throw error
  }
}

export async function sendServiceBookingEmail({
  to,
  bookingId,
  customerName,
  serviceName,
  preferredDate,
  status,
}: ServiceBookingProps) {
  // Format status for display
  const formattedStatus = status.charAt(0) + status.slice(1).toLowerCase()

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Service Booking #${bookingId} - ${formattedStatus}`,
    html: await render(
      ServiceBookingTemplate({
        customerName: customerName,
        bookingId: bookingId,
        serviceName: serviceName,
        preferredDate: preferredDate,
        status: formattedStatus,
        message: getServiceStatusMessage(status, serviceName, preferredDate),
        bookingLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/services/bookings/${bookingId}`,
      }),
    ),
  }

  try {
    console.log("Sending service booking email for:", bookingId)
    await transporter.sendMail(mailOptions)
    console.log("Service booking email sent successfully to", to)
    return true
  } catch (error) {
    console.error("Error sending service booking email:", error)
    throw error
  }
}

export async function sendServiceResponseEmail({
  to,
  bookingId,
  customerName,
  serviceName,
  message,
  preferredDate,
}: ServiceResponseProps) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `New Response to Your Service Booking #${bookingId}`,
    html: await render(
      ServiceResponseTemplate({
        customerName: customerName,
        bookingId: bookingId,
        serviceName: serviceName,
        message: message,
        preferredDate: preferredDate,
        bookingLink: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/services/bookings/${bookingId}`,
      }),
    ),
  }

  try {
    console.log("Sending service response email for:", bookingId)
    await transporter.sendMail(mailOptions)
    console.log("Service response email sent successfully to", to)
    return true
  } catch (error) {
    console.error("Error sending service response email:", error)
    throw error
  }
}

// Helper function to get appropriate message based on ticket status
function getTicketStatusMessage(status: string): string {
  switch (status) {
    case "OPEN":
      return "Your ticket has been received and is now open. Our support team will review it shortly."
    case "IN_PROGRESS":
      return "Our support team is currently working on your ticket. We'll update you as soon as we have more information."
    case "RESOLVED":
      return "We've resolved your ticket. If you're satisfied with the resolution, no further action is needed. If you still have questions, please let us know."
    case "CLOSED":
      return "Your ticket has been closed. If you need further assistance, please open a new support ticket."
    default:
      return "Your ticket status has been updated. Please check your account for more details."
  }
}

// Helper function to get appropriate message based on service booking status
function getServiceStatusMessage(status: string, serviceName: string, preferredDate: string): string {
  switch (status) {
    case "PENDING":
      return `Thank you for booking our ${serviceName} service for ${preferredDate}. Your booking is currently pending confirmation. We'll review your request and get back to you shortly.`
    case "CONFIRMED":
      return `Great news! Your booking for ${serviceName} on ${preferredDate} has been confirmed. We look forward to serving you.`
    case "COMPLETED":
      return `Your ${serviceName} service booked for ${preferredDate} has been completed. Thank you for choosing our services. We hope you were satisfied with our work.`
    case "CANCELLED":
      return `Your booking for ${serviceName} on ${preferredDate} has been cancelled. If you have any questions or would like to reschedule, please contact us.`
    case "RESCHEDULED":
      return `Your booking for ${serviceName} has been rescheduled. Please check the new date and time details. If you have any questions, please contact us.`
    default:
      return `Your booking status for ${serviceName} has been updated. Please check your account for more details.`
  }
}
