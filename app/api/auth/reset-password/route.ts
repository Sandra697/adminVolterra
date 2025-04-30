import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    // Validate input
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Find token in database
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    })

    // Check if token exists and is valid
    if (!verificationToken) {
      logger.auth("Password reset failed: Invalid token", { details: { token } })
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      logger.auth("Password reset failed: Token expired", {
        details: { token, expires: verificationToken.expires },
      })

      // Delete expired token
      await db.verificationToken.delete({
        where: { id: verificationToken.id },
      })

      return NextResponse.json({ error: "Token has expired. Please request a new password reset." }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    // Check if user exists
    if (!user) {
      logger.auth("Password reset failed: User not found", {
        details: { email: verificationToken.identifier },
      })
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        // If user was pending, activate their account
        status: user.status === "PENDING" ? "ACTIVE" : user.status,
      },
    })

    // Delete used token
    await db.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    logger.auth("Password reset successful", { details: { userId: user.id } })

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully.",
    })
  } catch (error) {
    logger.error(`Reset password error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
