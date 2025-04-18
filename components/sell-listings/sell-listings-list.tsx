"use client"

import { useState, useEffect } from "react"
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
import { Loader2, MoreHorizontal, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Define types based on our Prisma schema
type ListingStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD"

interface SellListing {
  id: number
  name: string
  email: string
  carName: string
  sellingPrice: number
  status: ListingStatus
  createdAt: string
}

export function SellListingsList() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [listings, setListings] = useState<SellListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch listings when search or filter changes
  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (statusFilter !== "all") {
          queryParams.set("status", statusFilter)
        }
        if (searchTerm) {
          queryParams.set("search", searchTerm)
        }

        const response = await fetch(`/api/sell-listings?${queryParams.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch listings")
        }

        const data = await response.json()
        setListings(data)
      } catch (error) {
        console.error("Error fetching listings:", error)
        toast({
          title: "Error",
          description: "Failed to load listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Use timeout to debounce search input
    const timeoutId = setTimeout(() => {
      fetchListings()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const handleStatusChange = async (listingId: number, newStatus: ListingStatus) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sell-listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update listing status")
      }

      // Update the listing in the local state
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === listingId ? { ...listing, status: newStatus } : listing
        )
      )

      toast({
        title: "Success",
        description: `Listing status updated to ${newStatus.toLowerCase()}`,
      })
    } catch (error) {
      console.error("Error updating listing:", error)
      toast({
        title: "Error",
        description: "Failed to update listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteListing = async (listingId: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/sell-listings/${listingId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete listing")
      }

      // Remove the listing from the local state
      setListings((prevListings) => prevListings.filter((listing) => listing.id !== listingId))

      toast({
        title: "Success",
        description: "Listing deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting listing:", error)
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "success"
      case "REJECTED":
        return "destructive"
      case "SOLD":
        return "outline"
      default:
        return "default"
    }
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
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
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead>Seller</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow >
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No listings found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{listing.name}</div>
                        <div className="text-[0.75rem] text-muted-foreground">{listing.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{listing.carName}</TableCell>
                    <TableCell>${listing.sellingPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(listing.status)}>
                        {listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(listing.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isSubmitting}>
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/sell-listings/${listing.id}`)}>
                            View Details
                          </DropdownMenuItem>
                          {listing.status === "PENDING" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(listing.id, "APPROVED")}
                                disabled={isSubmitting}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/sell-listings/${listing.id}?action=reject`)}
                                disabled={isSubmitting}
                              >
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(listing.id, "SOLD")}
                              disabled={isSubmitting}
                            >
                              Mark as Sold
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteListing(listing.id)}
                            disabled={isSubmitting}
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
        )}
      </div>
    </div>
  )
}