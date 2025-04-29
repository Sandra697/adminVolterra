"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Loader2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Car,
  Gauge,
  Settings,
  DollarSign,
  Check,
  X,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type React from "react"
import { EditListingDialog } from "@/components/editing-listing"

// Define types based on our Prisma schema
type ListingStatus = "PENDING" | "APPROVED" | "REJECTED" | "SOLD"
type Condition = "GOOD" | "AVERAGE" | "POOR" | "BAD"

interface SellListingImage {
  id: number
  url: string
  sellListingId: number
  createdAt: string
  updatedAt: string
}

interface CarType {
  id: number
  // Include other Car model properties as needed
}

interface Member {
  id: number
  // Include other Member model properties as needed
}

interface Brand {
  id: number
  name: string
}

interface SellListing {
  id: number
  // Owner/Seller Information
  name: string
  email: string
  phoneNumber: string

  // Basic Car Information
  carName: string
  description: string
  color: string
  location: string
  mileage: number
  brandName: string
  carType: string
  yearOfManufacture: number

  // Engine & Performance Details
  enginePower: number
  engineType?: string | null
  engineSize?: number | null
  fuelType?: string | null
  transmission?: string | null
  driveType?: string | null
  horsePower?: number | null
  torque?: string | null
  acceleration?: number | null
  topSpeed?: number | null

  // Additional Specifications
  vinNumber?: string | null
  registrationNumber?: string | null
  lastServiceDate?: string | null
  numberOfOwners?: number | null
  seatingCapacity?: number | null
  doors?: number | null
  weight?: number | null
  fuelTankCapacity?: number | null

  // Features & Equipment
  hasAC?: boolean | null
  hasPowerSteering?: boolean | null
  hasNavigation?: boolean | null
  hasSunroof?: boolean | null
  hasLeatherSeats?: boolean | null
  hasBackupCamera?: boolean | null
  hasParkingSensors?: boolean | null
  hasBluetoothAudio?: boolean | null
  hasCruiseControl?: boolean | null
  hasKeylessEntry?: boolean | null

  // Safety Features
  hasABS?: boolean | null
  hasAirbags?: boolean | null
  hasESP?: boolean | null
  hasTractionControl?: boolean | null

  // Condition and Pricing
  condition: Condition
  sellingPrice: number
  marketValue?: number | null
  isNegotiable?: boolean | null
  reasonForSelling?: string | null

  // Images and Documentation
  imageUrl?: string | null
  documentUrls?: string[]

  // Listing Status and Relations
  carId?: number | null
  memberId?: number | null
  status: ListingStatus
  rejectionReason?: string | null

  // Availability for viewing
  availableForViewing?: boolean | null
  bestTimeToContact?: string | null

  // Timestamps
  createdAt: string
  updatedAt: string

  // Relations
  Car?: CarType | null
  Member?: Member | null
  SellListingImages?: SellListingImage[]

  // Extra information field for any additional details
  additionalInfo?: any
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [allImages, setAllImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"details" | "features" | "seller">("details")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])

  // Fetch brands for the dropdown
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands")
        if (response.ok) {
          const data = await response.json()
          setBrands(data)
        }
      } catch (error) {
        console.error("Error fetching brands:", error)
      }
    }

    fetchBrands()
  }, [])

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
        console.log("Fetched listing data:", data)
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

  // Automatically fetch additional images when component mounts
  useEffect(() => {
    if (listing && (!listing.SellListingImages || listing.SellListingImages.length === 0)) {
      fetchAdditionalImages()
    }
  }, [listing])

  // Process images whenever listing changes
  useEffect(() => {
    if (!listing) return

    const images: string[] = []

    // Add the main image if it exists
    if (listing.imageUrl) {
      images.push(listing.imageUrl)
    }

    // Add additional images if they exist
    if (listing.SellListingImages && listing.SellListingImages.length > 0) {
      listing.SellListingImages.forEach((img) => {
        // Avoid duplicates (in case the main image is also in SellListingImages)
        if (img.url !== listing.imageUrl) {
          images.push(img.url)
        }
      })
    }

    setAllImages(images)
    console.log("Processed images:", images)
  }, [listing])

  const fetchAdditionalImages = async () => {
    if (!listing) return

    try {
      const response = await fetch(`/api/sell-listings/${listing.id}/images`)
      if (!response.ok) {
        throw new Error("Failed to fetch additional images")
      }
      const data = await response.json()

      if (data.images && data.images.length > 0) {
        const updatedListing = { ...listing, SellListingImages: data.images }
        setListing(updatedListing)
        console.log("Automatically loaded additional images:", data.images)
      }
    } catch (error) {
      console.error("Error fetching additional images:", error)
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

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (newStatus === "REJECTED" && !rejectionReason) {
      setIsRejectionDialogOpen(true)
      return
    }

    if (newStatus === "APPROVED") {
      setIsEditDialogOpen(true)
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

  const handleApproveWithEdits = async (editedListing: SellListing) => {
    setIsSubmitting(true)

    try {
      console.log("Sending edited listing for approval:", editedListing)

      const response = await fetch(`/api/sell-listings/${listing?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "APPROVED",
          editedListing: editedListing, // Make sure this is properly structured
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update listing status")
      }

      toast({
        title: "Success",
        description: "Listing approved and saved to inventory",
      })

      setIsEditDialogOpen(false)
      router.push("/dashboard/sell-listings")
      router.refresh()
    } catch (error) {
      console.error("Error updating listing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date to be more readable
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "/placeholder.svg?height=400&width=600" // Fallback image
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
        <Button onClick={() => router.push("/dashboard/sell-listings")}>Back to Listings</Button>
      </div>
    )
  }

  // Check if features exist
  const hasFeatures =
    listing.hasAC ||
    listing.hasPowerSteering ||
    listing.hasNavigation ||
    listing.hasSunroof ||
    listing.hasLeatherSeats ||
    listing.hasBackupCamera ||
    listing.hasParkingSensors ||
    listing.hasBluetoothAudio ||
    listing.hasCruiseControl ||
    listing.hasKeylessEntry ||
    listing.hasABS ||
    listing.hasAirbags ||
    listing.hasESP ||
    listing.hasTractionControl

  return (
    <div className="space-y-6 font-medium text-[0.75rem] text-gray-700">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{listing.carName}</CardTitle>
              <CardDescription>
                Listing #{listing.id} • Created on {formatDate(listing.createdAt)}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(listing.status)} className="text-[0.7rem] px-3 py-1">
              {listing.status.charAt(0) + listing.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        </CardHeader>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Car Images Section - Left Column */}
          <div className="space-y-4">
            {allImages.length > 0 ? (
              <div className="space-y-4">
                <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-1 rounded-lg shadow-sm">
                  <Image
                    src={allImages[selectedImageIndex] || "/placeholder.svg"}
                    alt={`${listing.carName}`}
                    width={600}
                    height={400}
                    className="rounded-md object-contain w-full h-[300px]"
                    onError={handleImageError}
                  />

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Image counter */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {selectedImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Image thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <div
                        key={index}
                        className={`relative h-16 w-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                          selectedImageIndex === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-md"
                          onError={handleImageError}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-md p-8 text-center h-[300px] flex flex-col items-center justify-center">
                <ImageOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No images available for this listing</p>
              </div>
            )}

            {/* Price and key details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">KES {listing.sellingPrice.toLocaleString()}</h3>
                {listing.isNegotiable && (
                  <Badge variant="outline" className="text-[0.65rem]">
                    Negotiable
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[0.75rem]">
                    {listing.brandName} {listing.carType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[0.75rem]">{listing.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[0.75rem]">{listing.yearOfManufacture}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[0.75rem]">{listing.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section - Right Column */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-6">
                <button
                  className={`pb-2 text-[0.8rem] font-medium ${
                    activeTab === "details"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  Car Details
                </button>
                {hasFeatures && (
                  <button
                    className={`pb-2 text-[0.8rem] font-medium ${
                      activeTab === "features"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("features")}
                  >
                    Features
                  </button>
                )}
                <button
                  className={`pb-2 text-[0.8rem] font-medium ${
                    activeTab === "seller"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("seller")}
                >
                  Seller Info
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Car Details Tab */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Basic Car Details */}
                  <div>
                    <h3 className="text-[0.8rem] font-medium mb-3 flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Brand</dt>
                        <dd>{listing.brandName}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Model</dt>
                        <dd>{listing.carType}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Color</dt>
                        <dd>{listing.color}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Year</dt>
                        <dd>{listing.yearOfManufacture}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Condition</dt>
                        <dd>{listing.condition.charAt(0) + listing.condition.slice(1).toLowerCase()}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Doors</dt>
                        <dd>{listing.doors || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Seating</dt>
                        <dd>{listing.seatingCapacity || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Previous Owners</dt>
                        <dd>{listing.numberOfOwners || "N/A"}</dd>
                      </div>
                    </div>
                  </div>

                  {/* Engine & Performance */}
                  <div>
                    <h3 className="text-[0.8rem] font-medium mb-3 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Engine & Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Engine Type</dt>
                        <dd>{listing.engineType || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Engine Size</dt>
                        <dd>{listing.engineSize ? `${listing.engineSize}L` : "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Engine Power</dt>
                        <dd>{listing.enginePower} HP</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Horsepower</dt>
                        <dd>{listing.horsePower || "N/A"} HP</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Fuel Type</dt>
                        <dd>{listing.fuelType || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Transmission</dt>
                        <dd>{listing.transmission || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Drive Type</dt>
                        <dd>{listing.driveType || "N/A"}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Fuel Capacity</dt>
                        <dd>{listing.fuelTankCapacity ? `${listing.fuelTankCapacity}L` : "N/A"}</dd>
                      </div>
                      {listing.acceleration && (
                        <div>
                          <dt className="text-[0.7rem] font-medium text-muted-foreground">0-100 km/h</dt>
                          <dd>{listing.acceleration}s</dd>
                        </div>
                      )}
                      {listing.topSpeed && (
                        <div>
                          <dt className="text-[0.7rem] font-medium text-muted-foreground">Top Speed</dt>
                          <dd>{listing.topSpeed} km/h</dd>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registration & Documentation */}
                  {(listing.vinNumber || listing.registrationNumber || listing.lastServiceDate) && (
                    <div>
                      <h3 className="text-[0.8rem] font-medium mb-3">Registration & Documentation</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {listing.vinNumber && (
                          <div>
                            <dt className="text-[0.7rem] font-medium text-muted-foreground">VIN Number</dt>
                            <dd>{listing.vinNumber}</dd>
                          </div>
                        )}
                        {listing.registrationNumber && (
                          <div>
                            <dt className="text-[0.7rem] font-medium text-muted-foreground">Registration</dt>
                            <dd>{listing.registrationNumber}</dd>
                          </div>
                        )}
                        {listing.lastServiceDate && (
                          <div>
                            <dt className="text-[0.7rem] font-medium text-muted-foreground">Last Service</dt>
                            <dd>{formatDate(listing.lastServiceDate)}</dd>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <h3 className="text-[0.8rem] font-medium mb-2">Description</h3>
                    <p className="text-[0.75rem] text-gray-700 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                      {listing.description}
                    </p>
                  </div>

                  {/* Reason for Selling */}
                  {listing.reasonForSelling && (
                    <div>
                      <h3 className="text-[0.8rem] font-medium mb-2">Reason for Selling</h3>
                      <p className="text-[0.75rem] text-gray-700 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                        {listing.reasonForSelling}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Features Tab */}
              {activeTab === "features" && hasFeatures && (
                <div className="space-y-6">
                  {/* Comfort Features */}
                  <div>
                    <h3 className="text-[0.8rem] font-medium mb-3">Comfort & Convenience</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <FeatureItem feature="Air Conditioning" available={listing.hasAC ?? undefined} />
                      <FeatureItem feature="Power Steering" available={listing.hasPowerSteering ?? undefined} />
                      <FeatureItem feature="Navigation System" available={listing.hasNavigation ?? undefined} />
                      <FeatureItem feature="Sunroof/Moonroof" available={listing.hasSunroof ?? undefined} />
                      <FeatureItem feature="Leather Seats" available={listing.hasLeatherSeats ?? undefined} />
                      <FeatureItem feature="Backup Camera" available={listing.hasBackupCamera ?? undefined} />
                      <FeatureItem feature="Parking Sensors" available={listing.hasParkingSensors ?? undefined} />
                      <FeatureItem feature="Bluetooth Audio" available={listing.hasBluetoothAudio ?? undefined} />
                      <FeatureItem feature="Cruise Control" available={listing.hasCruiseControl ?? undefined} />
                      <FeatureItem feature="Keyless Entry" available={listing.hasKeylessEntry ?? undefined} />
                    </div>
                  </div>

                  {/* Safety Features */}
                  {(listing.hasABS || listing.hasAirbags || listing.hasESP || listing.hasTractionControl) && (
                    <div>
                      <h3 className="text-[0.8rem] font-medium mb-3">Safety Features</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <FeatureItem feature="Anti-lock Braking System (ABS)" available={listing.hasABS ?? undefined} />
                        <FeatureItem feature="Airbags" available={listing.hasAirbags ?? undefined} />
                        <FeatureItem
                          feature="Electronic Stability Program (ESP)"
                          available={listing.hasESP ?? undefined}
                        />
                        <FeatureItem feature="Traction Control" available={listing.hasTractionControl ?? undefined} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Info Tab */}
              {activeTab === "seller" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[0.8rem] font-medium mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Seller Information
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Name</dt>
                        <dd className="flex items-center">
                          <User className="h-3 w-3 mr-1 text-muted-foreground" />
                          {listing.name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Email</dt>
                        <dd className="flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          {listing.email}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Phone</dt>
                        <dd className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {listing.phoneNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Location</dt>
                        <dd className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {listing.location}
                        </dd>
                      </div>
                      {listing.bestTimeToContact && (
                        <div className="col-span-2">
                          <dt className="text-[0.7rem] font-medium text-muted-foreground">Best Time to Contact</dt>
                          <dd>{listing.bestTimeToContact}</dd>
                        </div>
                      )}
                      {listing.availableForViewing !== undefined && (
                        <div className="col-span-2">
                          <dt className="text-[0.7rem] font-medium text-muted-foreground">Available for Viewing</dt>
                          <dd>{listing.availableForViewing ? "Yes" : "No"}</dd>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Information */}
                  <div>
                    <h3 className="text-[0.8rem] font-medium mb-3 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pricing Information
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Asking Price</dt>
                        <dd className="font-semibold">KES {listing.sellingPrice.toLocaleString()}</dd>
                      </div>
                      {listing.marketValue && (
                        <div>
                          <dt className="text-[0.7rem] font-medium text-muted-foreground">Market Value</dt>
                          <dd>KES {listing.marketValue.toLocaleString()}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-[0.7rem] font-medium text-muted-foreground">Negotiable</dt>
                        <dd>{listing.isNegotiable ? "Yes" : "No"}</dd>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Reason (if applicable) */}
            {listing.status === "REJECTED" && listing.rejectionReason && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-md p-4">
                <h3 className="text-[0.8rem] font-medium text-red-800 dark:text-red-400 mb-2">Rejection Reason</h3>
                <p className="text-[0.75rem] text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {listing.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        <CardFooter className="flex justify-end gap-4 bg-gray-50 dark:bg-gray-800 border-t">
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

      {/* Rejection Dialog */}
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

      {/* Edit Listing Dialog */}
      <EditListingDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        listing={listing}
        onConfirm={handleApproveWithEdits}
        isSubmitting={isSubmitting}
        brands={brands}
      />
    </div>
  )
}

// Helper component for features
function FeatureItem({ feature, available }: { feature: string; available?: boolean }) {
  if (available === undefined) return null

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
      {available ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
      <span className="text-[0.75rem]">{feature}</span>
    </div>
  )
}
