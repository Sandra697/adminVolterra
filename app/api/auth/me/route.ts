import { NextResponse } from "next/server"
import { getCurrentUser, authResponse } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return authResponse.unauthorized("Not authenticated")
    }

    // Return only the necessary user information
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
    })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return authResponse.internalError("Failed to fetch user data")
  }
}
