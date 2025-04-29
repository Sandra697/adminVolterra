"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { updateTicketStatus, deleteTicket } from "@/lib/ticket-actions"
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

interface TicketsListProps {
  tickets: Ticket[]
}

export function TicketsList({ tickets }: TicketsListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isUpdating, setIsUpdating] = useState<number | null>(null)

  const formattedTickets = tickets.map((ticket) => ({
    ...ticket,
    createdAt:
      ticket.createdAt instanceof Date
        ? ticket.createdAt.toISOString().split("T")[0]
        : typeof ticket.createdAt === "string"
          ? ticket.createdAt.includes("T")
            ? ticket.createdAt.split("T")[0]
            : ticket.createdAt
          : "",
    responseCount: ticket.responses?.length || 0,
  }))

  const filteredTickets = formattedTickets.filter((ticket) => {
    const matchesSearch =
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    setIsUpdating(ticketId)
    try {
      await updateTicketStatus(ticketId, newStatus)
      toast({
        title: "Status updated",
        description: `Ticket status changed to ${formatStatus(newStatus)}`,
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteTicket = async (ticketId: number) => {
    if (confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      setIsUpdating(ticketId)
      try {
        await deleteTicket(ticketId)
        toast({
          title: "Ticket deleted",
          description: "The ticket has been permanently deleted",
        })
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete ticket",
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
            placeholder="Search tickets..."
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
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead>Ticket #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow className="bg-slate-100">
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No tickets found. Try adjusting your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div>{ticket.name}</div>
                      <div className="text-[0.75rem] text-muted-foreground">{ticket.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{ticket.message}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>{formatStatus(ticket.status)}</Badge>
                  </TableCell>
                  <TableCell>{ticket.responseCount}</TableCell>
                  <TableCell>{ticket.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating === ticket.id}>
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}>
                          View Details
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
