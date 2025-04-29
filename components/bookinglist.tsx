"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search } from "lucide-react"
import { updateBookingStatus, deleteBooking } from "@/lib/service-actions"
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

interface BookingsListProps {
  bookings: ServiceBooking[]
}

export function BookingsList({ bookings }: BookingsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceIdFilter = searchParams.get("serviceId")

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const formattedBookings = bookings.map((booking) => ({
    ...booking,
    preferredDate:
      booking.preferredDate instanceof Date
        ? booking.preferredDate.toLocaleDateString()
        : typeof booking.preferredDate === "string"
          ? booking.preferredDate.includes("T")
            ? new Date(booking.preferredDate).toLocaleDateString()
            : booking.preferredDate
          : "",
    alternateDate:
      booking.alternateDate instanceof Date
        ? booking.alternateDate.toLocaleDateString()
        : typeof booking.alternateDate === "string"
          ? booking.alternateDate.includes("T")
            ? new Date(booking.alternateDate).toLocaleDateString()
            : booking.alternateDate
          : "",
    createdAt:
      booking.createdAt instanceof Date
        ? booking.createdAt.toLocaleDateString()
        : typeof booking.createdAt === "string"
          ? booking.createdAt.includes("T")
            ? new Date(booking.createdAt).toLocaleDateString()
            : booking.createdAt
          : "",
    responseCount: booking.responses?.length || 0,
  }))

  const filteredBookings = formattedBookings.filter((booking) => {
    const matchesSearch =
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.carDetails.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    const matchesService = !serviceIdFilter || booking.serviceId.toString() === serviceIdFilter

    return matchesSearch && matchesStatus && matchesService
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING":
        return "destructive"
      case "CONFIRMED":
        return "default"
      case "COMPLETED":
        return "outline"
      case "CANCELLED":
        return "destructive"
      case "RESCHEDULED":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setIsUpdating(bookingId)
    try {
      await updateBookingStatus(bookingId, newStatus)
      toast({
        title: "Status updated",
        description: `Booking status changed to ${formatStatus(newStatus)}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      setIsUpdating(bookingId)
      try {
        await deleteBooking(bookingId)
        toast({
          title: "Booking deleted",
          description: "The booking has been permanently deleted",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete booking",
          variant: "destructive",
        })
      } finally {
        setIsUpdating(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookings</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {serviceIdFilter && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md">
          <p className="text-sm">
            Showing bookings for service: <strong>{filteredBookings[0]?.service.name || "Unknown Service"}</strong>
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/service/bookings")}>
            Clear Filter
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Car Details</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow className="bg-slate-100">
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No bookings found. Try adjusting your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div>{booking.name}</div>
                      <div className="text-[0.75rem] text-muted-foreground">{booking.email}</div>
                      <div className="text-[0.75rem] text-muted-foreground">{booking.phoneNumber}</div>
                    </div>
                  </TableCell>
                  <TableCell>{booking.service.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{booking.carDetails}</TableCell>
                  <TableCell>{booking.preferredDate}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(booking.status)}>{formatStatus(booking.status)}</Badge>
                  </TableCell>
                  <TableCell>{booking.responseCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating === booking.id}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/service/bookings/${booking.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        {booking.status === "PENDING" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "CONFIRMED")}>
                            Confirm Booking
                          </DropdownMenuItem>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "COMPLETED")}>
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "CANCELLED")}>
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "RESCHEDULED")}>
                            Mark as Rescheduled
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteBooking(booking.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
