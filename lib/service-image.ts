"use server"

import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File): Promise<string> {
  try {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Data = buffer.toString("base64")
    const dataURI = `data:${file.type};base64,${base64Data}`

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: "car-services",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
    })

    return result.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

export async function deleteFromCloudinary(url: string): Promise<boolean> {
  try {
    // Extract public_id from the URL
    // Cloudinary URLs typically look like: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.jpg
    const urlParts = url.split("/")
    const filenameWithExtension = urlParts[urlParts.length - 1]
    const publicId = `car-services/${filenameWithExtension.split(".")[0]}`

    // Delete from Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      })
    })

    return result.result === "ok"
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    // Don't throw here, just return false as we don't want to break the flow if deletion fails
    return false
  }
}
