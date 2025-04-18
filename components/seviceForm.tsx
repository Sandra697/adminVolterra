"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormControl, FormItem, FormLabel } from "@/components/ui/form"
import { createService, updateService } from "@/lib/serviceAction"

interface ServiceFormProps {
  service?: any
}

export function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(service?.logoUrl || null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogoPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      if (service) {
        await updateService(service.id, formData)
      } else {
        await createService(formData)
      }

      router.push("/service")
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      <FormItem>
        <FormLabel>Service Name</FormLabel>
        <FormControl>
          <Input name="name" placeholder="Enter service name" defaultValue={service?.name || ""} required />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            name="description"
            placeholder="Enter service description"
            className="min-h-[150px]"
            defaultValue={service?.description || ""}
            required
          />
        </FormControl>
      </FormItem>

      <FormItem>
        <FormLabel>Service Logo</FormLabel>
        <div className="flex items-start gap-6">
          <div className="border-2 border-dashed rounded-lg p-4 text-center flex-1">
            <Input id="logo" name="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <label htmlFor="logo" className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-[0.75rem]  font-medium">Click to upload logo</span>
              <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
            </label>
          </div>

          {logoPreview && (
            <div className="w-32 h-32 relative border rounded-md overflow-hidden">
              <Image src={logoPreview || "/placeholder.svg"} alt="Logo preview" fill className="object-contain" />
            </div>
          )}
        </div>
      </FormItem>

      <div className="flex justify-end gap-4">
        <Link href="/service">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : service ? "Update Service" : "Add Service"}
        </Button>
      </div>
    </form>
  )
}
