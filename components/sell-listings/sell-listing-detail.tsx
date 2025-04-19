"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

// Define types based on our Prisma schema
type ListingStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD"
type Condition = "GOOD" | "AVERAGE" | "POOR" | "BAD"

// Add interface for image data if you have a separate table
interface SellListingImage {
  id: number
  url: string
  sellListingId: number
  updatedAt: string;
}

interface Car {
  id: number
  // Include other Car model properties as needed
}

interface Member {
  id: number
  // Include other Member model properties as needed
}

interface SellListing {
  id: number
  name: string
  email: string
  phoneNumber: string
  carName: string
  description: string
  color: string
  location: string
  mileage: number
  brandName: string
  carType: string
  enginePower: number
  engineType: string
  condition: Condition
  sellingPrice: number
  status: ListingStatus
  createdAt: string
  imageUrl?: string | null // Single image URL
  rejectionReason?: string
  carId?: number | null
  memberId?: number | null
  Car?: Car | null
  Member?: Member | null
  SellListingImages?: SellListingImage[] // For multiple images
  updatedAt?: string;
}

type SellListingDetailProps = {
  listing?: SellListing // Make it optional if fetching in component
  listingId?: string // Make it optional if passing listing directly
}

export function SellListingDetail({ listing: initialListing, listingId }: SellListingDetailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listing, setListing] = useState<SellListing | null>(initialListing || null)
  const [isLoading, setIsLoading] = useState(!initialListing && !!listingId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false)

  // Check if we should open rejection dialog on mount
  useEffect(() => {
    if (searchParams?.get("action") === "reject") {
      setIsRejectionDialogOpen(true)
    }
  }, [searchParams])

  // Fetch listing data if not provided directly
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/sell-listings/${listingId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch listing")
        }

        const data = await response.json()
        setListing(data)
      } catch (error) {
        console.error("Error fetching listing:", error)
        toast({
          title: "Error",
          description: "Failed to load listing details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (listingId && !initialListing) {
      fetchListing()
    }
  }, [listingId, initialListing])

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

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (newStatus === "REJECTED" && !rejectionReason) {
      setIsRejectionDialogOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/sell-listings/${listing?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          ...(newStatus === "REJECTED" && { rejectionReason }),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update listing status")
      }

      toast({
        title: "Success",
        description: `Listing status updated to ${newStatus.toLowerCase()}`,
      })

      router.push("/dashboard/sell-listings")
      router.refresh()
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

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">Listing Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested listing could not be found.</p>
        <Button onClick={() => router.push("/dashboard/sell-listings")}>
          Back to Listings
        </Button>
      </div>
    )
  }

  // Gather all images - single imageUrl and multiple SellListingImages if available
  const images: string[] = []
  if (listing.imageUrl) {
    images.push(listing.imageUrl)
  }
  if (listing.SellListingImages && listing.SellListingImages.length > 0) {
    images.push(...listing.SellListingImages.map(img => img.url))
  }

  return (
    <div className="space-y-6 font-medium text-[0.75rem] text-gray-700">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{listing.carName}</CardTitle>
              <CardDescription>
                Listing #{listing.id} • Created on {formatDate(listing.createdAt)}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(listing.status)}>
              {listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Car Images Section */}
          {images.length > 0 && (
            <div>
              <h3 className="text-[0.8rem] font-medium mb-3">Images</h3>
              {images.length === 1 ? (
                <div className="relative h-64 w-full rounded-md overflow-hidden">
                  <Image 
                    src={images[0]} 
                    alt={`${listing.carName}`} 
                    fill 
                    style={{ objectFit: "contain" }}
                    className="rounded-md"
                  />
                </div>
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((image, index) => (
                      <CarouselItem key={index} className="basis-full sm:basis-2/3 md:basis-1/2">
                        <div className="p-1">
                          <div className="relative h-64 w-full rounded-md overflow-hidden">
                            <Image 
                              src={image} 
                              alt={`${listing.carName} - Image ${index + 1}`} 
                              fill 
                              style={{ objectFit: "cover" }}
                              className="rounded-md"
                            />
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              )}
            </div>
          )}

          <div>
            <h3 className="text-[0.8rem] font-medium">Seller Information</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Name</dt>
                <dd>{listing.name}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Email</dt>
                <dd>{listing.email}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Phone</dt>
                <dd>{listing.phoneNumber}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Location</dt>
                <dd>{listing.location}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-[0.8rem] font-medium">Car Details</h3>
            <Separator className="my-2" />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Brand</dt>
                <dd>{listing.brandName}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Type</dt>
                <dd>{listing.carType}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Color</dt>
                <dd>{listing.color}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Mileage</dt>
                <dd>{listing.mileage.toLocaleString()} miles</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Engine</dt>
                <dd>{listing.engineType}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Engine Power</dt>
                <dd>{listing.enginePower} HP</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Condition</dt>
                <dd>{listing.condition.charAt(0) + listing.condition.slice(1).toLowerCase()}</dd>
              </div>
              <div>
                <dt className="text-[0.75rem] font-medium text-muted-foreground">Asking Price</dt>
                <dd className="font-semibold">${listing.sellingPrice.toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-[0.8rem] font-medium">Owner Note:</h3>
            <Separator className="my-2" />
            <p className="text-[0.75rem] text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>

          {listing.status === "REJECTED" && listing.rejectionReason && (
            <div>
              <h3 className="text-[0.8rem] font-medium text-destructive">Rejection Reason</h3>
              <Separator className="my-2" />
              <p className="text-[0.75rem] text-gray-700 whitespace-pre-wrap">{listing.rejectionReason}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/sell-listings")}>
            Back to Listings
          </Button>

          {listing.status === "PENDING" && (
            <>
              <Button variant="destructive" onClick={() => setIsRejectionDialogOpen(true)} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
              </Button>
              <Button onClick={() => handleStatusChange("APPROVED")} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
              </Button>
            </>
          )}

          {listing.status === "APPROVED" && (
            <Button onClick={() => handleStatusChange("SOLD")} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Sold
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Listing</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this listing. This will be sent to the seller.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsRejectionDialogOpen(false)
                handleStatusChange("REJECTED")
              }}
              disabled={!rejectionReason.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}