"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

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
  SellListingImages?: SellListingImage[]

  // Extra information field for any additional details
  additionalInfo?: any

  // Brand ID for database relations
  brandId?: number | null
}

interface EditListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  listing: SellListing | null
  onConfirm: (editedListing: SellListing) => Promise<void>
  isSubmitting: boolean
  brands: { id: number; name: string }[]
}

export function EditListingDialog({
  open,
  onOpenChange,
  listing,
  onConfirm,
  isSubmitting,
  brands = [],
}: EditListingDialogProps) {
  const [editedListing, setEditedListing] = useState<SellListing | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Reset edited listing when the original listing changes
  useEffect(() => {
    if (listing) {
      setEditedListing({ ...listing })
      setValidationErrors({})

      // Find brand ID if available
      if (brands.length > 0) {
        // Try exact match first
        let matchingBrand = brands.find((brand) => brand.name.toLowerCase() === listing.brandName.toLowerCase())

        // If no exact match, try partial match
        if (!matchingBrand) {
          matchingBrand = brands.find(
            (brand) =>
              listing.brandName.toLowerCase().includes(brand.name.toLowerCase()) ||
              brand.name.toLowerCase().includes(listing.brandName.toLowerCase()),
          )
        }

        if (matchingBrand) {
          console.log(`Found matching brand: ${matchingBrand.name} (ID: ${matchingBrand.id})`)
          setSelectedBrandId(matchingBrand.id)
          // Update the editedListing with the brandId
          setEditedListing((prev) =>
            prev ? { ...prev, brandId: matchingBrand!.id, brandName: matchingBrand!.name } : null,
          )
        } else {
          console.log(`No matching brand found for: ${listing.brandName}`)
        }
      }
    }
  }, [listing, brands])

  if (!editedListing) return null

  const handleChange = (field: string, value: any) => {
    setEditedListing((prev) => {
      if (!prev) return null
      return { ...prev, [field]: value }
    })

    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleBrandChange = (brandId: string) => {
    const id = Number.parseInt(brandId)
    setSelectedBrandId(id)

    // Find the brand name
    const brand = brands.find((b) => b.id === id)
    if (brand) {
      handleChange("brandName", brand.name)
      handleChange("brandId", id) // Add this line to set the brandId
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Required fields
    if (!editedListing.carName) errors.carName = "Car name is required"
    if (!editedListing.brandName) errors.brandName = "Brand is required"
    if (!editedListing.sellingPrice) errors.sellingPrice = "Selling price is required"
    if (!editedListing.yearOfManufacture) errors.yearOfManufacture = "Year is required"
    if (!editedListing.mileage && editedListing.mileage !== 0) errors.mileage = "Mileage is required"

    // Numeric validations
    if (editedListing.yearOfManufacture > new Date().getFullYear()) {
      errors.yearOfManufacture = "Year cannot be in the future"
    }

    if (editedListing.sellingPrice <= 0) {
      errors.sellingPrice = "Price must be greater than 0"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    if (!editedListing) return

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting",
        variant: "destructive",
      })
      return
    }

    try {
      // Ensure brandId is set if a brand was selected
      if (selectedBrandId && !editedListing.brandId) {
        editedListing.brandId = selectedBrandId
      }

      console.log("Submitting edited listing:", editedListing)
      await onConfirm(editedListing)
    } catch (error) {
      console.error("Error saving edited listing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split("T")[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Car Listing Before Approval</DialogTitle>
          <DialogDescription>
            Review and edit the car details before approving. The original data will be preserved.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="engine">Engine & Performance</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="seller">Seller Info</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="carName">Car Name</Label>
                <Input
                  id="carName"
                  value={editedListing.carName}
                  onChange={(e) => handleChange("carName", e.target.value)}
                  className={validationErrors.carName ? "border-red-500" : ""}
                />
                {validationErrors.carName && <p className="text-xs text-red-500">{validationErrors.carName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand</Label>
                {brands.length > 0 ? (
                  <>
                    <Select value={selectedBrandId?.toString() || ""} onValueChange={handleBrandChange}>
                      <SelectTrigger id="brandName" className={validationErrors.brandName ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.brandName && <p className="text-xs text-red-500">{validationErrors.brandName}</p>}
                  </>
                ) : (
                  <Input
                    id="brandName"
                    value={editedListing.brandName}
                    onChange={(e) => handleChange("brandName", e.target.value)}
                    className={validationErrors.brandName ? "border-red-500" : ""}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="carType">Model</Label>
                <Input
                  id="carType"
                  value={editedListing.carType}
                  onChange={(e) => handleChange("carType", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={editedListing.color} onChange={(e) => handleChange("color", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearOfManufacture">Year of Manufacture</Label>
                <Input
                  id="yearOfManufacture"
                  type="number"
                  value={editedListing.yearOfManufacture}
                  onChange={(e) => handleChange("yearOfManufacture", Number.parseInt(e.target.value) || 0)}
                  className={validationErrors.yearOfManufacture ? "border-red-500" : ""}
                />
                {validationErrors.yearOfManufacture && (
                  <p className="text-xs text-red-500">{validationErrors.yearOfManufacture}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={editedListing.mileage}
                  onChange={(e) => handleChange("mileage", Number.parseInt(e.target.value) || 0)}
                  className={validationErrors.mileage ? "border-red-500" : ""}
                />
                {validationErrors.mileage && <p className="text-xs text-red-500">{validationErrors.mileage}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={editedListing.condition} onValueChange={(value) => handleChange("condition", value)}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="AVERAGE">Average</SelectItem>
                    <SelectItem value="POOR">Poor</SelectItem>
                    <SelectItem value="BAD">Bad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editedListing.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doors">Doors</Label>
                <Input
                  id="doors"
                  type="number"
                  value={editedListing.doors || ""}
                  onChange={(e) => handleChange("doors", e.target.value ? Number.parseInt(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                <Input
                  id="seatingCapacity"
                  type="number"
                  value={editedListing.seatingCapacity || ""}
                  onChange={(e) =>
                    handleChange("seatingCapacity", e.target.value ? Number.parseInt(e.target.value) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numberOfOwners">Previous Owners</Label>
                <Input
                  id="numberOfOwners"
                  type="number"
                  value={editedListing.numberOfOwners || ""}
                  onChange={(e) =>
                    handleChange("numberOfOwners", e.target.value ? Number.parseInt(e.target.value) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={editedListing.sellingPrice}
                  onChange={(e) => handleChange("sellingPrice", Number.parseFloat(e.target.value) || 0)}
                  className={validationErrors.sellingPrice ? "border-red-500" : ""}
                />
                {validationErrors.sellingPrice && (
                  <p className="text-xs text-red-500">{validationErrors.sellingPrice}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketValue">Market Value</Label>
                <Input
                  id="marketValue"
                  type="number"
                  value={editedListing.marketValue || ""}
                  onChange={(e) =>
                    handleChange("marketValue", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedListing.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          {/* Engine & Performance Tab */}
          <TabsContent value="engine" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="engineType">Engine Type</Label>
                <Input
                  id="engineType"
                  value={editedListing.engineType || ""}
                  onChange={(e) => handleChange("engineType", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="engineSize">Engine Size (L)</Label>
                <Input
                  id="engineSize"
                  type="number"
                  step="0.1"
                  value={editedListing.engineSize || ""}
                  onChange={(e) =>
                    handleChange("engineSize", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enginePower">Engine Power (HP)</Label>
                <Input
                  id="enginePower"
                  type="number"
                  value={editedListing.enginePower}
                  onChange={(e) => handleChange("enginePower", Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horsePower">Horsepower</Label>
                <Input
                  id="horsePower"
                  type="number"
                  value={editedListing.horsePower || ""}
                  onChange={(e) => handleChange("horsePower", e.target.value ? Number.parseInt(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={editedListing.fuelType || ""}
                  onValueChange={(value) => handleChange("fuelType", value || null)}
                >
                  <SelectTrigger id="fuelType">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                    <SelectItem value="LPG">LPG</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Transmission</Label>
                <Select
                  value={editedListing.transmission || ""}
                  onValueChange={(value) => handleChange("transmission", value || null)}
                >
                  <SelectTrigger id="transmission">
                    <SelectValue placeholder="Select transmission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Semi-Automatic">Semi-Automatic</SelectItem>
                    <SelectItem value="CVT">CVT</SelectItem>
                    <SelectItem value="DCT">DCT (Dual Clutch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driveType">Drive Type</Label>
                <Select
                  value={editedListing.driveType || ""}
                  onValueChange={(value) => handleChange("driveType", value || null)}
                >
                  <SelectTrigger id="driveType">
                    <SelectValue placeholder="Select drive type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FWD">FWD (Front Wheel Drive)</SelectItem>
                    <SelectItem value="RWD">RWD (Rear Wheel Drive)</SelectItem>
                    <SelectItem value="AWD">AWD (All Wheel Drive)</SelectItem>
                    <SelectItem value="4WD">4WD (Four Wheel Drive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelTankCapacity">Fuel Tank Capacity (L)</Label>
                <Input
                  id="fuelTankCapacity"
                  type="number"
                  step="0.1"
                  value={editedListing.fuelTankCapacity || ""}
                  onChange={(e) =>
                    handleChange("fuelTankCapacity", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acceleration">0-100 km/h (seconds)</Label>
                <Input
                  id="acceleration"
                  type="number"
                  step="0.1"
                  value={editedListing.acceleration || ""}
                  onChange={(e) =>
                    handleChange("acceleration", e.target.value ? Number.parseFloat(e.target.value) : null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topSpeed">Top Speed (km/h)</Label>
                <Input
                  id="topSpeed"
                  type="number"
                  value={editedListing.topSpeed || ""}
                  onChange={(e) => handleChange("topSpeed", e.target.value ? Number.parseInt(e.target.value) : null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="torque">Torque</Label>
                <Input
                  id="torque"
                  value={editedListing.torque || ""}
                  onChange={(e) => handleChange("torque", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={editedListing.weight || ""}
                  onChange={(e) => handleChange("weight", e.target.value ? Number.parseFloat(e.target.value) : null)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vinNumber">VIN Number</Label>
                <Input
                  id="vinNumber"
                  value={editedListing.vinNumber || ""}
                  onChange={(e) => handleChange("vinNumber", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={editedListing.registrationNumber || ""}
                  onChange={(e) => handleChange("registrationNumber", e.target.value || null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastServiceDate">Last Service Date</Label>
                <Input
                  id="lastServiceDate"
                  type="date"
                  value={formatDate(editedListing.lastServiceDate)}
                  onChange={(e) => handleChange("lastServiceDate", e.target.value || null)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Comfort & Convenience</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAC"
                    checked={!!editedListing.hasAC}
                    onCheckedChange={(checked) => handleChange("hasAC", checked)}
                  />
                  <Label htmlFor="hasAC">Air Conditioning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPowerSteering"
                    checked={!!editedListing.hasPowerSteering}
                    onCheckedChange={(checked) => handleChange("hasPowerSteering", checked)}
                  />
                  <Label htmlFor="hasPowerSteering">Power Steering</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNavigation"
                    checked={!!editedListing.hasNavigation}
                    onCheckedChange={(checked) => handleChange("hasNavigation", checked)}
                  />
                  <Label htmlFor="hasNavigation">Navigation System</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSunroof"
                    checked={!!editedListing.hasSunroof}
                    onCheckedChange={(checked) => handleChange("hasSunroof", checked)}
                  />
                  <Label htmlFor="hasSunroof">Sunroof/Moonroof</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasLeatherSeats"
                    checked={!!editedListing.hasLeatherSeats}
                    onCheckedChange={(checked) => handleChange("hasLeatherSeats", checked)}
                  />
                  <Label htmlFor="hasLeatherSeats">Leather Seats</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBackupCamera"
                    checked={!!editedListing.hasBackupCamera}
                    onCheckedChange={(checked) => handleChange("hasBackupCamera", checked)}
                  />
                  <Label htmlFor="hasBackupCamera">Backup Camera</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasParkingSensors"
                    checked={!!editedListing.hasParkingSensors}
                    onCheckedChange={(checked) => handleChange("hasParkingSensors", checked)}
                  />
                  <Label htmlFor="hasParkingSensors">Parking Sensors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBluetoothAudio"
                    checked={!!editedListing.hasBluetoothAudio}
                    onCheckedChange={(checked) => handleChange("hasBluetoothAudio", checked)}
                  />
                  <Label htmlFor="hasBluetoothAudio">Bluetooth Audio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasCruiseControl"
                    checked={!!editedListing.hasCruiseControl}
                    onCheckedChange={(checked) => handleChange("hasCruiseControl", checked)}
                  />
                  <Label htmlFor="hasCruiseControl">Cruise Control</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasKeylessEntry"
                    checked={!!editedListing.hasKeylessEntry}
                    onCheckedChange={(checked) => handleChange("hasKeylessEntry", checked)}
                  />
                  <Label htmlFor="hasKeylessEntry">Keyless Entry</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Safety Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasABS"
                    checked={!!editedListing.hasABS}
                    onCheckedChange={(checked) => handleChange("hasABS", checked)}
                  />
                  <Label htmlFor="hasABS">Anti-lock Braking System (ABS)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAirbags"
                    checked={!!editedListing.hasAirbags}
                    onCheckedChange={(checked) => handleChange("hasAirbags", checked)}
                  />
                  <Label htmlFor="hasAirbags">Airbags</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasESP"
                    checked={!!editedListing.hasESP}
                    onCheckedChange={(checked) => handleChange("hasESP", checked)}
                  />
                  <Label htmlFor="hasESP">Electronic Stability Program (ESP)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTractionControl"
                    checked={!!editedListing.hasTractionControl}
                    onCheckedChange={(checked) => handleChange("hasTractionControl", checked)}
                  />
                  <Label htmlFor="hasTractionControl">Traction Control</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonForSelling">Reason for Selling</Label>
              <Textarea
                id="reasonForSelling"
                value={editedListing.reasonForSelling || ""}
                onChange={(e) => handleChange("reasonForSelling", e.target.value || null)}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNegotiable"
                checked={!!editedListing.isNegotiable}
                onCheckedChange={(checked) => handleChange("isNegotiable", checked)}
              />
              <Label htmlFor="isNegotiable">Price is Negotiable</Label>
            </div>
          </TabsContent>

          {/* Seller Info Tab */}
          <TabsContent value="seller" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Seller Name</Label>
                <Input id="name" value={editedListing.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedListing.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editedListing.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bestTimeToContact">Best Time to Contact</Label>
                <Input
                  id="bestTimeToContact"
                  value={editedListing.bestTimeToContact || ""}
                  onChange={(e) => handleChange("bestTimeToContact", e.target.value || null)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="availableForViewing"
                checked={!!editedListing.availableForViewing}
                onCheckedChange={(checked) => handleChange("availableForViewing", checked)}
              />
              <Label htmlFor="availableForViewing">Available for Viewing</Label>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save and Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
