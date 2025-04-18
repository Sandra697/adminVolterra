"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { createBrand, updateBrand } from "@/lib/brandActions"

interface BrandFormProps {
  brand?: {
    id: number
    name: string
    logoUrl: string | null
    vehicleImageUrl: string | null
  }
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [vehicleImageFile, setVehicleImageFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(brand?.logoUrl || null)
  const [vehicleImagePreview, setVehicleImagePreview] = useState<string | null>(brand?.vehicleImageUrl || null)
  const [name, setName] = useState(brand?.name || "")

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  const handleVehicleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVehicleImageFile(file)
      const url = URL.createObjectURL(file)
      setVehicleImagePreview(url)
    }
  }

  const clearLogoPreview = () => {
    if (logoPreview && !brand?.logoUrl) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(null)
    setLogoFile(null)
  }

  const clearVehicleImagePreview = () => {
    if (vehicleImagePreview && !brand?.vehicleImageUrl) {
      URL.revokeObjectURL(vehicleImagePreview)
    }
    setVehicleImagePreview(null)
    setVehicleImageFile(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Brand name is required",
        variant: "destructive",
      })
      return
    }

    if (!brand && !logoFile) {
      toast({
        title: "Error",
        description: "Logo is required for new brands",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)

      if (logoFile) {
        formData.append("logo", logoFile)
      }

      if (vehicleImageFile) {
        formData.append("vehicleImage", vehicleImageFile)
      }

      if (brand) {
        await updateBrand(brand.id, formData)
        toast({
          title: "Success",
          description: "Brand updated successfully",
        })
      } else {
        await createBrand(formData)
        toast({
          title: "Success",
          description: "Brand created successfully",
        })
      }

      router.push("/dashboard/brands")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save brand",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <FormItem>
        <FormLabel>Brand Name</FormLabel>
        <FormControl>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter brand name" required />
        </FormControl>
        <FormMessage />
      </FormItem>

      <FormItem>
        <FormLabel>Brand Logo {!brand && <span className="text-red-500">*</span>}</FormLabel>
        <div className="flex items-start gap-6">
          <div className="border-2 border-dashed rounded-lg p-4 text-center flex-1">
            <Input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <label htmlFor="logo" className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-[0.75rem]  font-medium">Click to upload logo</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
            </label>
          </div>

          {logoPreview && (
            <div className="w-32 h-32 relative border rounded-md overflow-hidden">
              <Image src={logoPreview || "/placeholder.svg"} alt="Logo preview" fill className="object-contain" />
              <button
                type="button"
                onClick={clearLogoPreview}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </FormItem>

      <FormItem>
        <FormLabel>Vehicle Image (Optional)</FormLabel>
        <div className="flex items-start gap-6">
          <div className="border-2 border-dashed rounded-lg p-4 text-center flex-1">
            <Input
              id="vehicleImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleVehicleImageChange}
            />
            <label htmlFor="vehicleImage" className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-[0.75rem]  font-medium">Click to upload vehicle image</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB</span>
            </label>
          </div>

          {vehicleImagePreview && (
            <div className="w-48 h-32 relative border rounded-md overflow-hidden">
              <Image
                src={vehicleImagePreview || "/placeholder.svg"}
                alt="Vehicle image preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={clearVehicleImagePreview}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </FormItem>

      <div className="flex justify-end gap-4">
        <Link href="/dashboard/brands">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : brand ? "Update Brand" : "Add Brand"}
        </Button>
      </div>
    </form>
  )
}
