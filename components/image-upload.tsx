"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, X } from "lucide-react"

interface ImageUploadProps {
  onUpload: (url: string) => void
  onRemove: (index: number) => void
  images: string[]
}

export function ImageUpload({ onUpload, onRemove, images }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      // Here you would upload to Cloudinary
      // For now, we'll simulate the upload
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate a response with a URL
      const mockUrl = `/placeholder.svg?height=400&width=600&text=${file.name}`

      clearInterval(interval)
      setUploadProgress(100)

      // Call the onUpload callback with the URL
      onUpload(mockUrl)

      // Reset the input
      e.target.value = ""
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
            <Image src={image || "/placeholder.svg"} alt={`Car image ${index + 1}`} fill className="object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="border border-dashed rounded-md flex flex-col items-center justify-center p-4 aspect-square">
          <div className="text-center space-y-2">
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[0.75rem]  text-muted-foreground">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-1">
                  <Label
                    htmlFor="image-upload"
                    className="text-[0.75rem]  font-medium cursor-pointer text-primary hover:underline"
                  >
                    Upload Image
                  </Label>
                  <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (max. 5MB)</p>
                </div>
                <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
