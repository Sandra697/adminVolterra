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

// Mock data - would be replaced with actual API call
const tickets = [
  {
    id: "1",
    ticketNumber: "TKT-1001",
    name: "John Smith",
    email: "john@example.com",
    message: "I'm having trouble with my payment",
    status: "OPEN",
    createdAt: "2023-05-15",
  },
  {
    id: "2",
    ticketNumber: "TKT-1002",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    message: "How do I update my listing?",
    status: "IN_PROGRESS",
    createdAt: "2023-05-10",
  },
  {
    id: "3",
    ticketNumber: "TKT-1003",
    name: "Michael Brown",
    email: "michael@example.com",
    message: "I need to cancel my account",
    status: "RESOLVED",
    createdAt: "2023-05-05",
  },
  {
    id: "4",
    ticketNumber: "TKT-1004",
    name: "Emily Davis",
    email: "emily@example.com",
    message: "The car I purchased has an issue",
    status: "CLOSED",
    createdAt: "2023-05-01",
  },
  {
    id: "5",
    ticketNumber: "TKT-1005",
    name: "David Wilson",
    email: "david@example.com",
    message: "I can't access my account",
    status: "OPEN",
    createdAt: "2023-05-20",
  },
]

export function TicketsList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTickets = tickets.filter((ticket) => {
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
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow className="bg-slate-100">
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                      <div className="text-[0.75rem]  text-muted-foreground">{ticket.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{ticket.message}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(ticket.status)}>{formatStatus(ticket.status)}</Badge>
                  </TableCell>
                  <TableCell>{ticket.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
                        {ticket.status === "OPEN" && (
                          <DropdownMenuItem
                            onClick={() => {
                              // Mark as in progress
                              console.log(`Mark ticket ${ticket.id} as in progress`)
                            }}
                          >
                            Mark as In Progress
                          </DropdownMenuItem>
                        )}
                        {(ticket.status === "OPEN" || ticket.status === "IN_PROGRESS") && (
                          <DropdownMenuItem
                            onClick={() => {
                              // Mark as resolved
                              console.log(`Mark ticket ${ticket.id} as resolved`)
                            }}
                          >
                            Mark as Resolved
                          </DropdownMenuItem>
                        )}
                        {ticket.status === "RESOLVED" && (
                          <DropdownMenuItem
                            onClick={() => {
                              // Close ticket
                              console.log(`Close ticket ${ticket.id}`)
                            }}
                          >
                            Close Ticket
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            // Delete ticket
                            console.log(`Delete ticket ${ticket.id}`)
                          }}
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
