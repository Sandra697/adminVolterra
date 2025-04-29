"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createService, updateService } from "@/lib/service-actions"
import { toast } from "@/hooks/use-toast"

interface Service {
  id: number
  name: string
  description: string
  logoUrl: string
  price?: number | null
  duration?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

interface ServiceFormProps {
  service?: Service
}

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(service?.logoUrl || null)
  const [isUploading, setIsUploading] = useState(false)

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setIsUploading(false)
  }

  const removeLogo = () => {
    setLogoFile(null)
    if (logoPreview && !service?.logoUrl) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // If we have a new logo file, add it to the form data
      if (logoFile) {
        formData.set("logo", logoFile)
      } else if (!logoPreview && service?.logoUrl) {
        // If logo was removed and we're editing, set a flag to remove it
        formData.set("removeLogo", "true")
      }

      if (service) {
        await updateService(service.id, formData)
        toast({
          title: "Service updated",
          description: "The service has been successfully updated",
        })
      } else {
        await createService(formData)
        toast({
          title: "Service created",
          description: "The new service has been successfully created",
        })
      }

      router.push("/service")
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was a problem saving the service",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter service name"
                  defaultValue={service?.name || ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter service description"
                  className="min-h-[150px]"
                  defaultValue={service?.description || ""}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Optional)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    defaultValue={service?.price?.toString() || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Optional)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    placeholder="e.g., 2 hours, 3 days"
                    defaultValue={service?.duration || ""}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Service Logo</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    id="logo"
                    name="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={isUploading || isSubmitting}
                  />
                  {!logoPreview ? (
                    <label htmlFor="logo" className="flex flex-col items-center justify-center cursor-pointer h-40">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-10 w-10 text-gray-400 mb-2 animate-spin" />
                          <span className="text-sm font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <span className="text-sm font-medium">Click to upload logo</span>
                          <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                        </>
                      )}
                    </label>
                  ) : (
                    <div className="relative">
                      <div className="relative h-40 w-full rounded-md overflow-hidden">
                        <Image
                          src={logoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        disabled={isUploading || isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a logo image for this service. This will be displayed on the service listing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href="/service">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : service ? "Update Service" : "Create Service"}
        </Button>
      </div>
    </form>
  )
}
