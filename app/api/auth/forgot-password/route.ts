import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logger } from "@/lib/logger"
import { sendPasswordResetEmail } from "@/lib/adminMails"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
    })

    // If user not found, still return success to prevent email enumeration
    if (!user) {
      logger.auth("Password reset requested for non-existent email", {
        details: { email },
      })

      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive password reset instructions.",
      })
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      logger.auth("Password reset requested for inactive account", {
        details: { email, status: user.status },
      })

      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive password reset instructions.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // Token valid for 24 hours

    // Store token in database
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires: tokenExpiry,
      },
    })

    // Send password reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    logger.auth("Password reset token generated", {
      details: { email, resetUrl },
    })
    await sendPasswordResetEmail(email, user.name || "User", resetToken)

    logger.auth("Password reset email sent", { details: { email } })

    return NextResponse.json({
      success: true,
      message: "Password reset instructions sent to your email.",
    })
  } catch (error) {
    logger.error(`Forgot password error: ${error}`)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
