import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File | Buffer) {
  try {
    let buffer: Buffer

    // Convert File to Buffer if needed
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      buffer = file
    }

    // Use the Cloudinary SDK to upload
    return new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "car-dealership",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      // Convert buffer to stream and pipe to uploadStream
      const { Readable } = require("stream")
      const readableStream = new Readable()
      readableStream.push(buffer)
      readableStream.push(null)
      readableStream.pipe(uploadStream)
    })
  } catch (error) {
    console.error("Error in uploadToCloudinary:", error)
    throw error
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    return await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Error in deleteFromCloudinary:", error)
    throw error
  }
}
