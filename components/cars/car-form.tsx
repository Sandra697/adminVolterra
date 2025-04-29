"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createCar, updateCar } from "@/lib/action"

// Option 1: If you want to keep using the existing form components but without React Hook Form:
// Create simplified versions that don't depend on form context
const SimpleFormItem = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`space-y-2 ${className || ""}`} {...props}>
    {children}
  </div>
)

const SimpleFormLabel = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={`text-[0.75rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ""}`}
    {...props}
  />
)

const SimpleFormControl = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={className} {...props}>
    {children}
  </div>
)

interface CarFormProps {
  car?: any
  brands: any[]
  features: any[]
}

export function CarForm({ car, brands, features }: CarFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState(car?.CarImage || [])
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>(car?.Feature?.map((f: { id: any }) => f.id) || [])

  console.log("Brands data:", brands)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedImages((prev) => [...prev, ...files])

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  const removeSelectedImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index])
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (id: number) => {
    setExistingImages((prev: any[]) => prev.filter((img) => img.id !== id))
    setDeletedImageIds((prev) => [...prev, id])
  }

  const toggleFeature = (id: number) => {
    setSelectedFeatures((prev) => (prev.includes(id) ? prev.filter((featureId) => featureId !== id) : [...prev, id]))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Add selected features
      formData.delete("features") // Remove any existing values
      selectedFeatures.forEach((id) => {
        formData.append("features", id.toString())
      })

      // Add deleted image IDs
      deletedImageIds.forEach((id) => {
        formData.append("deletedImages", id.toString())
      })

      // Add selected images
      formData.delete("images") // Remove any existing values
      selectedImages.forEach((file) => {
        formData.append("images", file)
      })

      if (car) {
        await updateCar(car.id, formData)
      } else {
        await createCar(formData)
      }

      router.push("/dashboard/cars")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SimpleFormItem>
            <SimpleFormLabel>Name</SimpleFormLabel>
            <SimpleFormControl>
              <Input name="name" placeholder="Enter car name" defaultValue={car?.name || ""} required />
            </SimpleFormControl>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Brand</SimpleFormLabel>
            <Select name="brandId" defaultValue={car?.brandId?.toString() || ""} required>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {brands && brands.length > 0 ? (
                  brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    No brands available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Model</SimpleFormLabel>
            <SimpleFormControl>
              <Input name="model" placeholder="Enter model" defaultValue={car?.model || ""} required />
            </SimpleFormControl>
          </SimpleFormItem>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Price</SimpleFormLabel>
              <SimpleFormControl>
                <Input name="price" type="number" placeholder="Enter price" defaultValue={car?.price || ""} required />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Year of Manufacture</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="yearOfManufacture"
                  type="number"
                  placeholder="Enter year"
                  defaultValue={car?.yearOfManufacture || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>

          <SimpleFormItem>
            <SimpleFormLabel>Short Description</SimpleFormLabel>
            <SimpleFormControl>
              <Textarea
                name="shortDescription"
                placeholder="Enter short description"
                defaultValue={car?.shortDescription || ""}
                required
              />
            </SimpleFormControl>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Full Description</SimpleFormLabel>
            <SimpleFormControl>
              <Textarea
                name="description"
                placeholder="Enter full description"
                className="min-h-[150px]"
                defaultValue={car?.description || ""}
                required
              />
            </SimpleFormControl>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Status</SimpleFormLabel>
            <Select name="status" defaultValue={car?.status || "NEW"} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="USED">Used</SelectItem>
              </SelectContent>
            </Select>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Availability</SimpleFormLabel>
            <Select
              name="availability"
              defaultValue={car?.availability === undefined ? "true" : car.availability ? "true" : "false"}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Not Available</SelectItem>
              </SelectContent>
            </Select>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Current Location</SimpleFormLabel>
            <SimpleFormControl>
              <Input
                name="currentLocation"
                placeholder="Enter current location"
                defaultValue={car?.currentLocation || ""}
                required
              />
            </SimpleFormControl>
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Badge (Optional)</SimpleFormLabel>
            <SimpleFormControl>
              <Input
                name="badge"
                placeholder="Enter badge (e.g., 'New Arrival', 'Hot Deal')"
                defaultValue={car?.badge || ""}
              />
            </SimpleFormControl>
          </SimpleFormItem>
        </div>

        <div className="space-y-6">
          <SimpleFormItem>
            <SimpleFormLabel>Images</SimpleFormLabel>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Input
                id="images"
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="images" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-[0.75rem]  font-medium">Click to upload images</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
              </label>
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[0.75rem]  font-medium mb-2">Current Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingImages.map((image: { id: string | number; url: string }) => (
                    <div key={image.id} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image src={image.url || "/placeholder.svg"} alt="Car image" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(Number(image.id))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image previews */}
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[0.75rem]  font-medium mb-2">New Images</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image src={url || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SimpleFormItem>

          <SimpleFormItem>
            <SimpleFormLabel>Features</SimpleFormLabel>
            <div className="border rounded-md p-4">
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature.id}`}
                      checked={selectedFeatures.includes(feature.id)}
                      onCheckedChange={() => toggleFeature(feature.id)}
                    />
                    <label
                      htmlFor={`feature-${feature.id}`}
                      className="text-[0.75rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </SimpleFormItem>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Color</SimpleFormLabel>
              <SimpleFormControl>
                <Input name="color" placeholder="Enter color" defaultValue={car?.color || ""} required />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Seats</SimpleFormLabel>
              <SimpleFormControl>
                <Input name="seats" type="number" placeholder="Enter seats" defaultValue={car?.seats || ""} required />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Mileage (km)</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="mileage"
                  type="number"
                  placeholder="Enter mileage"
                  defaultValue={car?.mileage || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Engine Power (cc)</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="enginePower"
                  type="number"
                  placeholder="Enter engine power"
                  defaultValue={car?.enginePower || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Engine Size (L)</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="engineSize"
                  type="number"
                  step="0.1"
                  placeholder="Enter engine size"
                  defaultValue={car?.engineSize || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Horse Power</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="horsePower"
                  type="number"
                  placeholder="Enter horse power"
                  defaultValue={car?.horsePower || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Fuel Type</SimpleFormLabel>
              <SimpleFormControl>
                <Input name="fuelType" placeholder="Enter fuel type" defaultValue={car?.fuelType || ""} required />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Transmission</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="transmission"
                  placeholder="Enter transmission"
                  defaultValue={car?.transmission || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Drive</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="drive"
                  placeholder="Enter drive (e.g., FWD, RWD, AWD)"
                  defaultValue={car?.drive || ""}
                  required
                />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Torque (Optional)</SimpleFormLabel>
              <SimpleFormControl>
                <Input name="torque" placeholder="Enter torque" defaultValue={car?.torque || ""} />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SimpleFormItem>
              <SimpleFormLabel>Aspiration (Optional)</SimpleFormLabel>
              <SimpleFormControl>
                <Input name="aspiration" placeholder="Enter aspiration" defaultValue={car?.aspiration || ""} />
              </SimpleFormControl>
            </SimpleFormItem>

            <SimpleFormItem>
              <SimpleFormLabel>Acceleration 0-100 (Optional)</SimpleFormLabel>
              <SimpleFormControl>
                <Input
                  name="acceleration"
                  type="number"
                  step="0.1"
                  placeholder="Enter acceleration"
                  defaultValue={car?.acceleration || ""}
                />
              </SimpleFormControl>
            </SimpleFormItem>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/cars">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : car ? "Update Car" : "Add Car"}
        </Button>
      </div>
    </form>
  )
}
