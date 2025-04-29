"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { updateBookingStatus, addBookingResponse } from "@/lib/service-actions"
import { toast } from "@/hooks/use-toast"

interface ServiceBookingResponse {
  id: number
  message: string
  createdAt: string | Date
}

interface ServiceBooking {
  id: number
  name: string
  email: string
  phoneNumber: string
  serviceId: number
  service: {
    id: number
    name: string
    description: string
    price?: number | null
    duration?: string | null
  }
  carDetails: string
  preferredDate: string | Date
  alternateDate?: string | Date | null
  message?: string | null
  status: string
  responses: ServiceBookingResponse[]
  createdAt: string | Date
  updatedAt: string | Date
}

interface BookingDetailProps {
  booking: ServiceBooking
}

export function BookingDetail({ booking }: BookingDetailProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState("")

  const formattedPreferredDate =
    booking.preferredDate instanceof Date
      ? booking.preferredDate.toLocaleDateString()
      : typeof booking.preferredDate === "string"
        ? booking.preferredDate.includes("T")
          ? new Date(booking.preferredDate).toLocaleDateString()
          : booking.preferredDate
        : ""

  const formattedAlternateDate =
    booking.alternateDate instanceof Date
      ? booking.alternateDate.toLocaleDateString()
      : typeof booking.alternateDate === "string"
        ? booking.alternateDate.includes("T")
          ? new Date(booking.alternateDate).toLocaleDateString()
          : booking.alternateDate
        : ""

  const formattedCreatedAt =
    booking.createdAt instanceof Date
      ? booking.createdAt.toLocaleDateString()
      : typeof booking.createdAt === "string"
        ? booking.createdAt.includes("T")
          ? new Date(booking.createdAt).toLocaleDateString()
          : booking.createdAt
        : ""

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "CONFIRMED":
        return "default"
      case "COMPLETED":
        return "success"
      case "CANCELLED":
        return "destructive"
      case "RESCHEDULED":
        return "secondary"
      default:
        return "outline"
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
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
      // Update booking status with response if provided
      await updateBookingStatus(booking.id, newStatus, response)

      toast({
        title: "Status updated",
        description: `Booking status changed to ${formatStatus(newStatus)}`,
      })

      router.push("/service/bookings")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
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
      await addBookingResponse(booking.id, response)

      toast({
        title: "Response added",
        description: "Your response has been added to the booking",
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
              <CardTitle>Service Booking #{booking.id}</CardTitle>
              <CardDescription>Created on {formattedCreatedAt}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(booking.status)}>{formatStatus(booking.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Customer Information</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Name</dt>
                <dd>{booking.name}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Email</dt>
                <dd>{booking.email}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Phone</dt>
                <dd>{booking.phoneNumber}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium">Service Details</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Service</dt>
                <dd>{booking.service.name}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Price</dt>
                <dd>{booking.service.price ? `$${booking.service.price.toFixed(2)}` : "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Duration</dt>
                <dd>{booking.service.duration || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Description</dt>
                <dd className="truncate">{booking.service.description}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium">Booking Details</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Car Details</dt>
                <dd>{booking.carDetails}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Preferred Date</dt>
                <dd>{formattedPreferredDate}</dd>
              </div>
              {formattedAlternateDate && (
                <div>
                  <dt className="text-[0.75rem] font-medium text-muted-foreground">Alternate Date</dt>
                  <dd>{formattedAlternateDate}</dd>
                </div>
              )}
              {booking.message && (
                <div className="col-span-2">
                  <dt className="text-[0.75rem] font-medium text-muted-foreground">Customer Message</dt>
                  <dd className="whitespace-pre-line">{booking.message}</dd>
                </div>
              )}
            </dl>
          </div>

          {booking.responses && booking.responses.length > 0 && (
            <div>
              <h3 className="text-lg font-medium">Previous Responses</h3>
              <Separator className="my-2" />
              <div className="space-y-4">
                {booking.responses.map((response) => (
                  <div key={response.id} className="rounded-md border p-4">
                    <div className="mb-2 text-sm text-muted-foreground">{formatDate(response.createdAt)}</div>
                    <p className="whitespace-pre-line">{response.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
            <div>
              <h3 className="text-lg font-medium">Add Response</h3>
              <Separator className="my-2" />
              <Textarea
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[120px]"
              />
              <Button onClick={handleAddResponse} className="mt-4" disabled={isSubmitting || !response.trim()}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Response
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/service/bookings")}>
            Back to Bookings
          </Button>

          {booking.status === "PENDING" && (
            <Button onClick={() => handleStatusChange("CONFIRMED")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Booking
            </Button>
          )}

          {booking.status === "CONFIRMED" && (
            <Button onClick={() => handleStatusChange("COMPLETED")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Completed
            </Button>
          )}

          {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
            <Button variant="destructive" onClick={() => handleStatusChange("CANCELLED")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Booking
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
