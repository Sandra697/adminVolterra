import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    // Validate input
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Find token in database
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    })

    // Check if token exists and is valid
    if (!verificationToken) {
      logger.auth("Email verification failed: Invalid token", { details: { token } })
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      logger.auth("Email verification failed: Token expired", {
        details: { token, expires: verificationToken.expires },
      })

      // Delete expired token
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      })

      return NextResponse.json({ error: "Verification link has expired. Please register again." }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    // Check if user exists
    if (!user) {
      logger.auth("Email verification failed: User not found", {
        details: { email: verificationToken.identifier },
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user status to ACTIVE and set emailVerified
    await db.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    })

    // Delete used token
    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    logger.auth("Email verification successful", { details: { userId: user.id } })

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    })
  } catch (error) {
    logger.error(`Email verification error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
