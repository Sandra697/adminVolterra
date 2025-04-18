"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

type TicketDetailProps = {
  ticket: any
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState("")

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

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true)

    try {
      // Here you would make an API call to update the ticket status
      console.log(`Updating ticket ${ticket.id} status to ${newStatus}`)
      if (response) {
        console.log(`Response: ${response}`)
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      router.push("/dashboard/tickets")
      router.refresh()
    } catch (error) {
      console.error("Error updating ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mock data for the example
  const mockTicket = {
    id: "1",
    ticketNumber: "TKT-1001",
    name: "John Smith",
    email: "john@example.com",
    phoneNumber: "+1 (555) 123-4567",
    message:
      "I'm having trouble with my payment for the BMW X5 I was interested in. I tried to make a deposit but the transaction failed multiple times. Can someone from the finance department contact me? I'm still very interested in the vehicle.",
    status: "OPEN",
    createdAt: "2023-05-15",
  }

  // Use mock data if no ticket is provided
  const displayTicket = ticket || mockTicket

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ticket #{displayTicket.ticketNumber}</CardTitle>
              <CardDescription>Created on {displayTicket.createdAt}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(displayTicket.status)}>{formatStatus(displayTicket.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Customer Information</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem]  font-medium text-muted-foreground">Name</dt>
                <dd>{displayTicket.name}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem]  font-medium text-muted-foreground">Email</dt>
                <dd>{displayTicket.email}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem]  font-medium text-muted-foreground">Phone</dt>
                <dd>{displayTicket.phoneNumber}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium">Message</h3>
            <Separator className="my-2" />
            <p className="text-[0.75rem]  whitespace-pre-line">{displayTicket.message}</p>
          </div>

          {(displayTicket.status === "OPEN" || displayTicket.status === "IN_PROGRESS") && (
            <div>
              <h3 className="text-lg font-medium">Response</h3>
              <Separator className="my-2" />
              <Textarea
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/tickets")}>
            Back to Tickets
          </Button>

          {displayTicket.status === "OPEN" && (
            <Button onClick={() => handleStatusChange("IN_PROGRESS")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as In Progress
            </Button>
          )}

          {(displayTicket.status === "OPEN" || displayTicket.status === "IN_PROGRESS") && (
            <Button onClick={() => handleStatusChange("RESOLVED")} disabled={isSubmitting || !response.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resolve Ticket
            </Button>
          )}

          {displayTicket.status === "RESOLVED" && (
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
