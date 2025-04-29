"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { updateTicketStatus, addTicketResponse } from "@/lib/ticket-actions"
import { toast } from "@/hooks/use-toast"

interface TicketResponse {
  id: number
  message: string
  createdAt: string | Date
}

interface Ticket {
  id: number
  ticketNumber: string
  name: string
  email: string
  phoneNumber: string
  message: string
  status: string
  createdAt: string | Date
  updatedAt: string | Date
  responses: TicketResponse[]
}

interface TicketDetailProps {
  ticket: Ticket
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState("")

  const formattedCreatedAt =
    ticket.createdAt instanceof Date
      ? ticket.createdAt.toLocaleDateString()
      : typeof ticket.createdAt === "string"
        ? ticket.createdAt.includes("T")
          ? new Date(ticket.createdAt).toLocaleDateString()
          : ticket.createdAt
        : ""

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "destructive"
      case "IN_PROGRESS":
        return "default"
      case "RESOLVED":
        return "success"
      case "CLOSED":
        return "outline"
      default:
        return "default"
    }
  }

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")
  }

  const formatDate = (date: string | Date) => {
    if (date instanceof Date) {
      return date.toLocaleString()
    }
    if (typeof date === "string") {
      return date.includes("T") ? new Date(date).toLocaleString() : date
    }
    return ""
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true)

    try {
      // Update ticket status with response if provided
      await updateTicketStatus(ticket.id, newStatus, response)

      toast({
        title: "Status updated",
        description: `Ticket status changed to ${formatStatus(newStatus)}`,
      })

      router.push("/dashboard/tickets")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddResponse = async () => {
    if (!response.trim()) {
      toast({
        title: "Error",
        description: "Response cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addTicketResponse(ticket.id, response)

      toast({
        title: "Response added",
        description: "Your response has been added to the ticket",
      })

      setResponse("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ticket #{ticket.ticketNumber}</CardTitle>
              <CardDescription>Created on {formattedCreatedAt}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(ticket.status)}>{formatStatus(ticket.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-gray-700 font-medium text-xs">
          <div>
            <h3 className="text-sm text-red-700  font-medium">Customer Information</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Name</dt>
                <dd>{ticket.name}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Email</dt>
                <dd>{ticket.email}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Phone</dt>
                <dd>{ticket.phoneNumber}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-sm text-red-700  font-medium">Message</h3>
            <Separator className="my-2" />
            <p className="text-[0.75rem] whitespace-pre-line">{ticket.message}</p>
          </div>

          {ticket.responses && ticket.responses.length > 0 && (
            <div>
              <h3 className="text-sm text-red-700  font-medium">Previous Responses</h3>
              <Separator className="my-2" />
              <div className="space-y-4">
                {ticket.responses.map((response) => (
                  <div key={response.id} className="rounded-md border p-4">
                    <div className="mb-2 text-sm text-muted-foreground">{formatDate(response.createdAt)}</div>
                    <p className="whitespace-pre-line">{response.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ticket.status !== "CLOSED" && (
            <div>
              <h3 className="text-sm text-red-700  font-medium">Add Response</h3>
              <Separator className="my-2" />
              <Textarea
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[120px]"
              />
              {ticket.status !== "RESOLVED" && (
                <Button onClick={handleAddResponse} className="mt-4" disabled={isSubmitting || !response.trim()}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Response
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/tickets")}>
            Back to Tickets
          </Button>

          {ticket.status === "OPEN" && (
            <Button onClick={() => handleStatusChange("IN_PROGRESS")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as In Progress
            </Button>
          )}

          {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
            <Button onClick={() => handleStatusChange("RESOLVED")} disabled={isSubmitting || !response.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resolve Ticket
            </Button>
          )}

          {ticket.status === "RESOLVED" && (
            <Button onClick={() => handleStatusChange("CLOSED")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close Ticket
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
